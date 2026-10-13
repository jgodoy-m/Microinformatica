import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PIEZAS, CABLES, PEDIDOS } from './catalogo.js';
import { potenciaNecesaria, motivoColocar, motivoConectar, longitudCable, longitudTrazado, simplificarTrazado, motivoLongitud, cascadaRetirada } from './reglas.js';

const $ = (id) => document.getElementById(id);
const logEl = $('log');
const progEl = $('progreso');
const mensajeEl = $('mensaje');
const pasosEl = $('pasos');
const etapasEl = $('etapas');
const nivelEl = $('nivel');
const pistaContadorEl = $('pista-contador');
const clienteEl = $('cliente');
const especEl = $('especificaciones');
const botonesModo = document.querySelectorAll('[data-modo]');
const botonesFiltro = document.querySelectorAll('[data-filtro]');
let filtro = 'todos';
let ultimoAviso = '';   // último error de colocación o conexión, mientras no haya otra acción correcta
const contenedor = $('escena');
const bandeja = $('bandeja');
const fantasma = $('fantasma');

// Coordenadas en unidades 3D. Centro de la placa = (0, 0). La placa mide 30 x 24.
const SLOTS = {
  caja:  { x: 0, y: 0, w: 34, h: 34, accepts: ['caja'], nombre: 'chasis' },
  board: { x: 0, y: 0, w: 30, h: 24, accepts: ['board'], nombre: 'anclaje de la placa base' },
  cpu:   { x: -2.0, y: 3.0, w: 4.0, h: 4.0, accepts: ['cpu'], nombre: 'socket del procesador' },
  ram1:  { x: 5.2, y: 4.3, w: 0.7, h: 13, accepts: ['ram'], nombre: 'ranura de memoria' },
  ram2:  { x: 6.1, y: 4.3, w: 0.7, h: 13, accepts: ['ram'], nombre: 'ranura de memoria' },
  pcie:  { x: 0.5, y: -8.6, w: 11, h: 0.9, accepts: ['gpu'], nombre: 'ranura PCIe x16' },
  m2:    { x: -9.0, y: -1.6, w: 8, h: 2.2, accepts: ['nvme'], nombre: 'ranura M.2' },
  psu:   { x: 0, y: -15.5, w: 16, h: 6.5, accepts: ['psu'], nombre: 'hueco de la fuente' }
};

// Tipo de pieza que debe estar montada para que el conector esté disponible.
const NECESITA = { atx24: 'board', eps8: 'board', pcie8: 'gpu' };
const PORTS = {
  atx24: { x: 12.5, y: 2.5, w: 1.8, h: 5, z: 0.5, etiqueta: 'ATX 24' },
  eps8:  { x: -12.5, y: 10, w: 2.5, h: 2, z: 0.5, etiqueta: 'EPS 8' },
  // El conector PCIe está en la esquina superior derecha de la gráfica, que se monta sobre su ranura.
  pcie8: { relativo: true, dx: 4.6, dy: 1.6, w: 2.0, h: 2.2, etiqueta: 'PCIe 6+2' }
};

// Salida de cada cable: frente del conector modular de la fuente.
const SALIDA_CABLE = {
  'c-atx': [7.0, -11.45, 3.5],
  'c-eps': [-6.5, -11.45, 3.5],
  'c-pcie': [2.5, -11.45, 3.5]
};
const ALTURA_CABLE = 2.9;
const RADIO_CABLE = 0.2;

const EXPLICA = {
  'c-atx': 'Sin ATX 24 pines la placa no recibe alimentación y no arranca (apuntes S07).',
  'c-eps': 'Sin EPS 8 pines el procesador no recibe alimentación (apuntes S07).',
  'c-pcie': 'Sin PCIe 6+2 pines la tarjeta gráfica no tiene la alimentación adicional que necesita (apuntes S07).'
};

// ---------- Estado ----------
let S;
let entradas = [];
let arrastre = null;
let movido = false;        // el puntero se ha desplazado (no es un toque)
let inicioPuntero = null;
let seleccion = null;      // pieza o cable elegido con toque o teclado
let destino = null;        // hueco o conector elegido para esa pieza
let modoPendiente = null;  // dificultad elegida, pendiente de confirmar
let retiradaPendiente = null; // id de la pieza cuya retirada espera confirmación (la lista se recalcula al confirmar)
let focoAntes = null;      // elemento que tenía el foco al abrir un diálogo: se le devuelve al cerrarlo
let destelloHasta = 0;
let modo = 'facil';
const esFacil = () => modo === 'facil';
let vistaPrevia = null;
let tableroId = null;
let rgbActivo = false;
let chasisId = null;

const placed = (id) => id in S.placed;
const plugged = (id) => id in S.plugged;
const pluggedPort = (pid) => Object.values(S.plugged).some((v) => v.port === pid);
const occupied = (sid) => Object.values(S.placed).includes(sid);
const pieza = (id) => PIEZAS.find((p) => p.id === id);
const cable = (id) => CABLES.find((c) => c.id === id);
const pedido = () => PEDIDOS.find((p) => p.id === S.pedido);
const enPedido = (id) => Object.values(pedido().piezas).flat().includes(id);
const piezaPlacada = (kind) => Object.keys(S.placed).map(pieza).find((p) => p.kind === kind);
const tabla = () => piezaPlacada('board');
const cpuActual = () => piezaPlacada('cpu') ?? pieza(pedido().piezas.cpu);
// La GPU que cuenta es la del pedido, no la primera del catálogo.
const gpuActual = () => pieza(pedido().piezas.gpu);
const potencia = () => potenciaNecesaria(cpuActual().tdp, gpuActual().tdp);

// ---------- Escena 3D ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
contenedor.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#2E3440');
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(32, 1.6, 0.1, 300);
camera.position.set(44, 28, 74);
camera.lookAt(0, -2, 0);

const luzPrincipal = new THREE.DirectionalLight('#ffffff', 1.3);
luzPrincipal.position.set(12, 22, 40);
luzPrincipal.castShadow = true;
luzPrincipal.shadow.mapSize.set(2048, 2048);
Object.assign(luzPrincipal.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
luzPrincipal.shadow.camera.updateProjectionMatrix();
scene.add(luzPrincipal);
scene.add(new THREE.AmbientLight('#9FB3CC', 0.25));
const luzRim = new THREE.PointLight('#88C0D0', 40, 90);
luzRim.position.set(-22, 10, 26);
scene.add(luzRim);

const sueloSombra = new THREE.Mesh(new THREE.PlaneGeometry(90, 60), new THREE.ShadowMaterial({ opacity: 0.35 }));
sueloSombra.rotation.x = -Math.PI / 2;
sueloSombra.position.y = -20;
sueloSombra.receiveShadow = true;
scene.add(sueloSombra);

const grupoCaso = new THREE.Group();
const grupoTablero = new THREE.Group();
const grupoPiezas = new THREE.Group();
const grupoCables = new THREE.Group();
const grupoGuias = new THREE.Group();
scene.add(grupoCaso, grupoTablero, grupoPiezas, grupoCables, grupoGuias);

const fans = [];
const ledMats = [];
const ledCaso = [];   // tiras RGB del chasis: se vuelven a registrar en cada redibujado

const matMetal = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: 0.75, roughness: 0.3, ...extra });
const matPlastico = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: 0.05, roughness: 0.65, ...extra });
const matOro = new THREE.MeshStandardMaterial({ color: '#D9B25F', metalness: 1, roughness: 0.3 });
const matNegro = matPlastico('#15181E');
const matCable = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0 });

// Libera la GPU de un objeto y sus hijos. Las geometrías de los modelos GLB se comparten entre piezas: no se liberan.
function liberar(obj, geoCompartida = false) {
  if (obj.geometry && !geoCompartida) obj.geometry.dispose();
  if (obj.material) [].concat(obj.material).forEach((m) => { m.map?.dispose(); m.dispose(); });
  for (const hijo of obj.children) liberar(hijo, geoCompartida || hijo.userData.compartido === true);
}

function vaciar(grupo) {
  for (const hijo of [...grupo.children]) liberar(hijo, hijo.userData.compartido === true);
  grupo.clear();
}

function caja(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function en(obj, x, y, z) {
  obj.position.set(x, y, z);
  return obj;
}

function ventilador(r, colorAro) {
  const g = new THREE.Group();
  const disco = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.18, 48), matPlastico('#0E1014'));
  disco.rotation.x = Math.PI / 2;
  g.add(disco);
  const rotor = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const pivote = new THREE.Group();
    pivote.rotation.z = (i * Math.PI * 2) / 7;
    const pala = caja(0.36 * r, 0.72 * r, 0.05, matPlastico('#2B3038'));
    pala.position.set(0, 0.46 * r, 0.1);
    pala.rotation.x = -0.25;
    pivote.add(pala);
    rotor.add(pivote);
  }
  const cubo = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.3, r * 0.3, 0.2, 24), matMetal('#3B4252'));
  cubo.rotation.x = Math.PI / 2;
  cubo.position.z = 0.1;
  rotor.add(cubo);
  rotor.position.z = 0.1;
  g.add(rotor);
  const aro = new THREE.Mesh(
    new THREE.TorusGeometry(r * 0.94, r * 0.06, 10, 48),
    new THREE.MeshStandardMaterial({ color: rgbActivo ? colorAro : '#4C566A', emissive: rgbActivo ? colorAro : '#000000', emissiveIntensity: 0.9, roughness: 0.4 })
  );
  aro.position.z = 0.1;
  if (rgbActivo) ledMats.push(aro.material);
  g.add(aro);
  fans.push(rotor);
  return g;
}

function texturaTexto(texto, ancho, alto, fondo = '#20252E', color = '#ECEFF4') {
  const cv = document.createElement('canvas');
  cv.width = ancho;
  cv.height = alto;
  const c = cv.getContext('2d');
  c.fillStyle = fondo;
  c.fillRect(0, 0, ancho, alto);
  c.fillStyle = color;
  c.font = `bold ${Math.round(alto * 0.5)}px system-ui, sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(texto, ancho / 2, alto / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Placa de circuito: color según el modelo, pistas de cobre, zócalo, ranuras y serigrafía.
function texturaPlaca(placa) {
  const W = 1800;
  const H = 1440;
  const k = 60;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const c = cv.getContext('2d');
  const X = (x) => (x + 15) * k;
  const Y = (y) => (12 - y) * k;
  const rect = (x, y, w, h, color) => {
    c.fillStyle = color;
    c.fillRect(X(x - w / 2), Y(y + h / 2), w * k, h * k);
  };
  const punto = (x, y, r, color) => {
    c.fillStyle = color;
    c.beginPath();
    c.arc(X(x), Y(y), r, 0, Math.PI * 2);
    c.fill();
  };

  c.fillStyle = placa.pcb;
  c.fillRect(0, 0, W, H);

  // Pistas de cobre con trazado ortogonal fijo.
  let semilla = 7;
  const aleatorio = () => {
    semilla = (semilla * 16807) % 2147483647;
    return semilla / 2147483647;
  };
  c.strokeStyle = 'rgba(200, 150, 70, 0.3)';
  c.lineWidth = 4;
  for (let i = 0; i < 220; i++) {
    const x0 = aleatorio() * W;
    const y0 = aleatorio() * H;
    const x1 = x0 + (aleatorio() - 0.5) * 600;
    const y1 = y0 + (aleatorio() - 0.5) * 400;
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y0);
    c.lineTo(x1, y1);
    c.stroke();
  }

  // Zócalo: marco de plástico y contactos (más densos en LGA).
  rect(-2, 3, 4.4, 4.4, '#101318');
  rect(-2, 3, 3.95, 3.95, '#262B34');
  const lga = placa.socket.startsWith('LGA');
  const n = lga ? 36 : 30;
  const paso = 3.8 / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      punto(-2 - 1.9 + i * paso, 3 - 1.9 + j * paso, lga ? 1.5 : 2.2, '#C9A45C');
    }
  }

  // Ranuras DIMM con pestillos.
  for (const x of [5.2, 6.1]) {
    rect(x, 4.3, 0.5, 13, '#14171D');
    rect(x - 0.42, 10.8, 0.14, 0.9, '#D7DCE4');
    rect(x + 0.42, 10.8, 0.14, 0.9, '#D7DCE4');
    rect(x - 0.42, -2.2, 0.14, 0.9, '#D7DCE4');
    rect(x + 0.42, -2.2, 0.14, 0.9, '#D7DCE4');
  }

  // PCIe x16 y M.2.
  rect(0.5, -8.6, 11, 0.9, '#15181E');
  for (let i = 0; i < 22; i++) rect(-4.9 + i * 0.5, -8.6, 0.12, 0.7, '#2B3038');
  rect(6.2, -8.6, 0.3, 0.6, '#D7DCE4');
  rect(-9, -1.6, 8, 2.2, '#15181E');

  // Conectores de alimentación.
  rect(-12.5, 10, 2.5, 2, '#0F1115');
  for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) punto(-13.4 + i * 0.36, 9.5 + j * 0.9, 3, '#C9A45C');
  rect(12.5, 2.5, 1.8, 5, '#0F1115');
  for (let i = 0; i < 2; i++) for (let j = 0; j < 10; j++) punto(12.0 + i * 0.9, -1.9 + j * 0.85, 3, '#C9A45C');

  // Tornillos de anclaje.
  for (const [x, y] of [[-13.5, 10.5], [13.5, 10.5], [-13.5, -10.5], [13.5, -10.5]]) {
    c.strokeStyle = '#B8893F';
    c.lineWidth = 6;
    c.beginPath();
    c.arc(X(x), Y(y), 14, 0, Math.PI * 2);
    c.stroke();
  }

  // Condensadores electrolíticos.
  for (const [x, y] of [[-5.6, 11], [-4.8, 11], [-4.0, 11], [4.0, 11.2], [9.4, 10], [10.2, 10], [-7.6, 0.7], [-6.8, 0.7], [11.5, -5], [11.5, -7]]) {
    punto(x, y, 0.36 * k, '#0F1115');
    punto(x, y, 0.28 * k, '#2A2F38');
    punto(x, y, 0.08 * k, '#B8893F');
  }

  // Serigrafía.
  c.fillStyle = 'rgba(236, 239, 244, 0.7)';
  c.font = 'bold 26px system-ui, sans-serif';
  c.textAlign = 'center';
  c.fillText(placa.socket, X(-2), Y(5.8));
  c.fillText(placa.gen, X(5.65), Y(11.6));
  c.fillText('PCIE_X16', X(0.5), Y(-10.3));
  c.fillText('M.2_1', X(-9), Y(0.6));
  c.fillText('CPU_PWR', X(-12.5), Y(7.6));
  c.fillText('ATX_PWR', X(12.5), Y(-3.4));

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

function disipador(w, h, d, vertical) {
  const g = new THREE.Group();
  g.add(en(caja(w, h, 0.2, matMetal('#3B4252')), 0, 0, 0.1));
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = -0.5 + (i + 0.5) / n;
    const aleta = vertical ? caja(w, h / n * 0.5, d, matMetal('#4C566A')) : caja(w / n * 0.5, h, d, matMetal('#4C566A'));
    if (vertical) aleta.position.set(0, t * h, d / 2 + 0.1);
    else aleta.position.set(t * w, 0, d / 2 + 0.1);
    g.add(aleta);
  }
  return g;
}

// ---------- Modelos 3D de las piezas (modelos/*.glb, generados con Blender) ----------
const MODELOS = {
  // Modelos geométricos por tipo (generar_modelos.py). GPU y CPU se dibujan en código.
  'ram-ddr4': 'modelos/ram-ddr4.glb',
  'ram-ddr5': 'modelos/ram-ddr5.glb',
  nvme: 'modelos/nvme.glb',
  psu: 'modelos/psu.glb'
};
const plantillas = {};
// Clave del modelo de una pieza, o null si no tiene modelo 3D.
const claveModelo = (p) => {
  if (MODELOS[p.id]) return p.id;
  if (p.kind === 'ram') return p.gen === 'DDR5' ? 'ram-ddr5' : 'ram-ddr4';
  return MODELOS[p.kind] ? p.kind : null;
};
const cargadorGlb = new GLTFLoader();
Promise.all(Object.entries(MODELOS).map(([clave, url]) => new Promise((resolver) => {
  cargadorGlb.load(url, (gltf) => {
    plantillas[clave] = gltf.scene;
    resolver();
  }, undefined, () => resolver());
}))).then(() => pintarEscena());

// ---------- Construcción de la escena fija ----------
// Geometrías de caja: cada tamaño se crea una vez y se comparte entre las piezas del chasis.
const geometriasCaja = new Map();
function geometriaCaja(w, h, d) {
  const clave = `${w}x${h}x${d}`;
  if (!geometriasCaja.has(clave)) geometriasCaja.set(clave, new THREE.BoxGeometry(w, h, d));
  return geometriasCaja.get(clave);
}
// Añade un bloque del chasis. Su geometría es compartida: al liberar la escena no se borra.
function bloque(grupo, w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(geometriaCaja(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  m.userData.compartido = true;
  grupo.add(m);
  return m;
}

// Chasis de la caja elegida. Tres partes independientes, según los campos del catálogo:
// - estructura común (pared, bandeja, separadores, bahía de fuente, ventilador superior);
// - lateral según `cristal` (panel transparente con marco, o panel metálico opaco con rejilla);
// - frontal y luces según `rgb` (rejilla metálica con ventilador RGB frontal, o tiras interiores en cristal).
// Las coordenadas de montaje no cambian: placa en z = 0, fuente en y ≈ -15,5, caja ≈ 34 × 34 × 10.
const fansCaso = [];   // ventiladores del chasis: giran aunque la escena se redibuje

function materialesCaso(modelo) {
  return {
    metal: new THREE.MeshStandardMaterial({ color: modelo.color, roughness: 0.5, metalness: 0.6 }),
    pared: matPlastico('#1A1E26', { roughness: 0.85 }),
    bandeja: new THREE.MeshStandardMaterial({ color: '#5B6478', roughness: 0.4, metalness: 0.75 }),
    borde: new THREE.MeshStandardMaterial({ color: '#D8DEE9', roughness: 0.3, metalness: 0.8 }),
    oscuro: matPlastico('#0E1014', { roughness: 0.9 }),
    dorado: new THREE.MeshStandardMaterial({ color: '#B8893F', roughness: 0.35, metalness: 0.9 }),
    vidrio: new THREE.MeshPhysicalMaterial({ color: '#88C0D0', transparent: true, opacity: 0.2, roughness: 0.05, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, depthWrite: false, side: THREE.DoubleSide }),
    reflejo: new THREE.MeshBasicMaterial({ color: '#ECEFF4', transparent: true, opacity: 0.1, depthWrite: false })
  };
}

// Ventilador del chasis: se guarda para que siga girando cuando la escena se redibuja.
function ventiladorCaso(grupo, r, x, y, z, girarX = 0, girarY = 0) {
  const v = ventilador(r, '#88C0D0');
  v.position.set(x, y, z);
  v.rotation.set(girarX, girarY, 0);
  grupo.add(v);
  fansCaso.push(fans.pop());
}

// Estructura común: la misma en las cuatro cajas.
function estructuraComun(grupo, m) {
  // Pared trasera y bandeja de placa, más clara, que se separa del fondo.
  bloque(grupo, 34, 34, 0.4, m.pared, 0, -2, -1.5);
  bloque(grupo, 31, 25, 0.2, m.bandeja, 0, 0, -1.2);

  // Separadores con arandela en el punto de apoyo.
  const alturaSeparador = 0.94;
  for (const [x, y] of [[-13.5, 10.5], [13.5, 10.5], [-13.5, -10.5], [13.5, -10.5], [0, 10.5], [0, -10.5]]) {
    const cilindro = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, alturaSeparador, 12), m.dorado);
    cilindro.rotation.x = Math.PI / 2;
    cilindro.position.set(x, y, -1.1 + alturaSeparador / 2 - 0.02);
    cilindro.castShadow = true;
    grupo.add(cilindro);
    const arandela = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 14), m.dorado);
    arandela.rotation.x = Math.PI / 2;
    arandela.position.set(x, y, -0.2);
    grupo.add(arandela);
  }

  // Techo, base y lateral izquierdo: paneles metálicos con profundidad.
  bloque(grupo, 34, 0.6, 9.5, m.metal, 0, 15.3, 3.25);
  bloque(grupo, 34, 0.6, 9.5, m.metal, 0, -19.3, 3.25);
  bloque(grupo, 0.6, 34.6, 9.5, m.metal, -17.3, -2, 3.25);

  // Postes y travesaños del frente (el frente queda abierto para montar).
  for (const x of [-17.3, 17.3]) bloque(grupo, 0.8, 34.6, 0.8, m.borde, x, -2, 8);
  bloque(grupo, 34.6, 0.8, 0.8, m.borde, 0, 15.3, 8);
  bloque(grupo, 34.6, 0.8, 0.8, m.borde, 0, -19.3, 8);

  // Bahía de la fuente: estante, paredes laterales y rejilla de ventilación en el suelo.
  bloque(grupo, 34, 0.4, 9.5, m.metal, 0, -12.45, 3.25);
  for (const x of [-8.6, 8.6]) bloque(grupo, 0.4, 6.8, 9.5, m.metal, x, -15.9, 3.25);
  for (let i = 0; i < 6; i++) bloque(grupo, 10, 0.15, 0.35, m.oscuro, 0, -19.05, 1.2 + i * 1.2);

  // Rejilla de lamas en el techo.
  for (let i = 0; i < 6; i++) bloque(grupo, 10, 0.12, 0.35, m.oscuro, 0, 15.7, 1.2 + i * 1.2);

  // Ventilador trasero superior, junto a la pared trasera.
  ventiladorCaso(grupo, 2.4, -8, 15.9, -0.3, -Math.PI / 2);

  // Siete ranuras de expansión en la pared trasera, en la zona de la GPU.
  for (let i = 0; i < 7; i++) bloque(grupo, 1.0, 1.9, 0.2, m.oscuro, 4 + i * 1.5, -9.2, -1.28);

  // Orificios de paso de cables en el borde de la bandeja, fuera de la huella de la placa.
  for (const y of [6, 0, -6]) {
    for (const x of [-15.5, 15.5]) {
      const orificio = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 14), m.oscuro);
      orificio.rotation.x = Math.PI / 2;
      orificio.position.set(x, y, -1.08);
      grupo.add(orificio);
    }
  }
}

// Lateral derecho según `cristal`. Cristal: panel transparente amplio con marco metálico y un reflejo sutil.
// Metálica: panel opaco con una rejilla de ventilación en hueco: placa oscura y lamas que sobresalen del panel.
function panelLateral(grupo, modelo, m) {
  if (modelo.cristal) {
    bloque(grupo, 0.3, 33.4, 9.2, m.vidrio, 17.3, -2, 3.25);
    bloque(grupo, 0.06, 13, 2.2, m.reflejo, 17.5, 4, 5.5);
    bloque(grupo, 0.06, 6, 1.0, m.reflejo, 17.5, -10, 6.8);
    bloque(grupo, 0.06, 33.4, 0.2, m.borde, 17.5, -2, 8.0);
    for (const y of [15.3, -19.3]) bloque(grupo, 0.8, 0.8, 9.5, m.borde, 17.3, y, 3.25);
    bloque(grupo, 0.8, 34.6, 0.8, m.borde, 17.3, -2, -1.2);
    bloque(grupo, 0.8, 0.5, 9.5, m.borde, 17.3, 6.5, 3.25);
  } else {
    bloque(grupo, 0.6, 34.6, 9.5, m.metal, 17.3, -2, 3.25);
    // Hueco de ventilación en la mitad superior del lateral: fondo oscuro y nueve lamas.
    bloque(grupo, 0.1, 14.4, 7.6, m.oscuro, 17.66, 5.6, 3.6);
    for (let i = 0; i < 9; i++) bloque(grupo, 0.3, 0.5, 7.2, m.metal, 17.8, 11.6 - i * 1.5, 3.6);
  }
}

// Frontal: la metálica tiene bisel superior con lamas y una franja inferior que depende de `rgb`.
// Metálica sin RGB: rejilla continua en la franja inferior. Metálica con RGB: bahía con dos ventiladores frontales.
// El cristal no tiene frontal: el hueco queda abierto para montar y ver el interior.
function frontalCaso(grupo, modelo, m) {
  if (modelo.cristal) return;
  // Bisel superior: placa sólida de 2,5 de alto con lamas de ventilación integradas.
  bloque(grupo, 34.6, 2.5, 0.4, m.metal, 0, 14.05, 8.2);
  for (let i = 0; i < 5; i++) bloque(grupo, 28, 0.22, 0.2, m.oscuro, 0, 13.2 + i * 0.4, 8.5);
  // Banda inferior sobre la bahía de la fuente.
  bloque(grupo, 34.6, 0.8, 0.4, m.metal, 0, -18.9, 8.2);
  if (modelo.rgb) {
    // Bahía de ventiladores: dos placas de montaje con un ventilador de 2,5 de radio en cada una.
    for (const x of [-7.6, 7.6]) {
      bloque(grupo, 5.8, 5.8, 0.3, m.oscuro, x, -15.8, 8.0);
      ventiladorCaso(grupo, 2.5, x, -15.8, 8.5, 0, 0);
    }
  } else {
    for (let i = 0; i < 12; i++) bloque(grupo, 0.22, 0.6, 0.2, m.oscuro, -14.5 + i * 2.4, -18.9, 8.5);
  }
}

// Luces según `rgb`. Cristal: dos ventiladores interiores y tiras interiores, visibles a través del lateral transparente.
// Metálica: sus ventiladores frontales se montan en frontalCaso; aquí no hay nada más que añadir.
function lucesCaso(grupo, modelo, m) {
  if (!modelo.cristal) return;
  // Dos ventiladores interiores pegados al cristal (girados hacia el lateral) y tiras grandes en el fondo.
  ventiladorCaso(grupo, 2.2, 16.6, 5, 2.5, 0, Math.PI / 2);
  ventiladorCaso(grupo, 2.2, 16.6, -9, 2.5, 0, Math.PI / 2);
  const luz = () => matPlastico('#88C0D0', { emissive: '#88C0D0', emissiveIntensity: 2.0 });
  for (const mesh of [bloque(grupo, 30, 0.6, 0.4, luz(), 0, 14.4, -1.2), bloque(grupo, 0.4, 32, 0.4, luz(), 16.2, -2, -0.9)]) ledCaso.push(mesh.material);
}

function construirCaso(modelo) {
  fansCaso.length = 0;
  ledCaso.length = 0;
  const m = materialesCaso(modelo);
  const antes = ledMats.length;
  estructuraComun(grupoCaso, m);
  panelLateral(grupoCaso, modelo, m);
  frontalCaso(grupoCaso, modelo, m);
  // Los ventiladores con aro (superior y, si es RGB, frontal) pasan a la lista de luces del chasis.
  if (modelo.rgb) lucesCaso(grupoCaso, modelo, m);
  ledCaso.push(...ledMats.splice(antes));
  chasisId = modelo.id;
}

// La placa se reconstruye cuando cambia el modelo (color, zócalo y memoria).
function construirTablero(placa) {
  vaciar(grupoTablero);
  tableroId = placa.id;
  const cara = new THREE.MeshStandardMaterial({ map: texturaPlaca(placa), roughness: 0.5, metalness: 0.05 });
  const canto = matPlastico(placa.pcb);
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(30, 24, 0.16), [canto, canto, canto, canto, cara, canto]);
  pcb.position.z = -0.08;
  pcb.castShadow = true;
  pcb.receiveShadow = true;
  grupoTablero.add(pcb);

  const vrm = disipador(3, 6, 1.6, true);
  vrm.position.set(-7.5, 4.5, 0);
  grupoTablero.add(vrm);
  const chipset = disipador(3.6, 3.4, 1.2, false);
  chipset.position.set(1.8, -1.8, 0);
  grupoTablero.add(chipset);
}

// ---------- Piezas ----------
function construirPieza(p, pos) {
  const g = new THREE.Group();
  g.position.set(pos.x, pos.y, pos.z);
  g.userData.id = p.id;
  const clave = claveModelo(p);
  if (clave && plantillas[clave]) return construirPiezaGlb(p, g, clave);

  if (p.kind === 'cpu') {
    // Sustrato verde-negro bajo la tapa metálica con la etiqueta del modelo.
    g.add(en(caja(4.1, 4.1, 0.14, matPlastico('#1F2A24')), 0, 0, 0.07));
    const etiqueta = matMetal('#C9D1DC', { map: texturaTexto(p.socket, 256, 256, '#A9B3C2', '#2E3440'), metalness: 0.6, roughness: 0.35 });
    const tapa = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.4, 0.16), [matMetal(p.color), matMetal(p.color), matMetal(p.color), matMetal(p.color), etiqueta, matMetal(p.color)]);
    tapa.position.z = 0.22;
    tapa.castShadow = true;
    g.add(tapa);
  }

  if (p.kind === 'ram') {
    const ddr5 = p.gen === 'DDR5';
    g.add(en(caja(0.45, 13, 1.0, matNegro), 0, 0, 0));
    // Disipador: negro en DDR4 con acento; en DDR5 con franja RGB.
    const disipadorRam = matPlastico(ddr5 ? '#1B1F27' : '#1E222A', { roughness: 0.4 });
    g.add(en(caja(0.5, 10.6, 0.5, disipadorRam), 0, 1.0, 0.45));
    g.add(en(caja(0.52, 1.6, 0.52, matPlastico(ddr5 ? '#2E3440' : '#8B2E2E', { roughness: 0.4 })), 0, 4.9, 0.45));
    if (ddr5 && rgbActivo) {
      const luz = matPlastico('#88C0D0', { emissive: '#88C0D0', emissiveIntensity: 1.5 });
      ledMats.push(luz);
      g.add(en(caja(0.1, 9.8, 0.1, luz), 0.26, 1.0, 0.72));
    }
    g.add(en(caja(0.45, 0.8, 0.1, matOro), 0, -6.2, -0.5));
  }

  if (p.kind === 'gpu') {
    const shroud = matPlastico('#1C2029', { roughness: 0.5, metalness: 0.3 });
    g.add(caja(11, 4.6, 2.0, shroud));
    g.add(en(caja(11, 0.2, 2.05, matPlastico('#2B3038')), 0, 2.4, 0));
    const f1 = ventilador(1.6, '#88C0D0');
    f1.position.set(-2.6, 0, 1.0);
    const f2 = ventilador(1.6, '#88C0D0');
    f2.position.set(2.6, 0, 1.0);
    g.add(f1, f2);
    g.add(en(caja(9.5, 0.25, 0.05, matOro), 0, -2.45, -1.0));
    // Soporte metálico de la salida de vídeo y conector de alimentación PCIe.
    g.add(en(caja(0.5, 4.6, 0.3, matMetal('#A8B0BD')), -5.6, 0, -0.4));
    g.add(en(caja(1.0, 1.3, 0.5, matNegro), 4.6, 1.6, 1.25));
  }

  if (p.kind === 'nvme') {
    g.add(caja(7.9, 2.2, 0.25, matPlastico(p.color, { metalness: 0.4, roughness: 0.5 })));
    const etiqueta = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.6), new THREE.MeshStandardMaterial({ map: texturaTexto('NVMe M.2', 512, 220, '#E5E9F0', '#2E3440'), roughness: 0.6 }));
    etiqueta.position.set(1.4, 0, 0.14);
    g.add(etiqueta);
    g.add(en(caja(1.6, 1.2, 0.12, matNegro), -2.2, 0, 0.18));
  }

  if (p.kind === 'psu') {
    g.add(caja(16, 6.5, 7, matPlastico('#1E222A', { roughness: 0.5 })));
    // Conectores modulares en la cara de salida (+Y) donde se conectan los cables.
    for (const cid of Object.keys(SALIDA_CABLE)) {
      const sx = SALIDA_CABLE[cid][0];
      g.add(en(caja(1.4, 0.8, 1.2, matNegro), sx, 3.65, 0));
    }
    const etiqueta = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 1.6),
      new THREE.MeshStandardMaterial({ map: texturaTexto(`${p.watts} W`, 512, 180), roughness: 0.6 })
    );
    etiqueta.position.set(-4.2, 1.6, 3.52);
    g.add(etiqueta);
    const ventiladorPsu = ventilador(2.4, '#88C0D0');
    ventiladorPsu.position.set(3.6, -0.2, 3.52);
    g.add(ventiladorPsu);
  }

  return g;
}

// Pieza con su modelo 3D. Los ventiladores (nodo 'Fan') giran; el aro y la tira RGB dependen de la caja.
function construirPiezaGlb(p, g, clave) {
  const modelo = plantillas[clave].clone(true);
  modelo.userData.compartido = true;
  modelo.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    o.material = o.material.clone();
    if (o.material.name === 'Aro') {
      o.material.color.set(rgbActivo ? '#88C0D0' : '#4C566A');
      o.material.emissive.set(rgbActivo ? '#88C0D0' : '#000000');
      if (rgbActivo) ledMats.push(o.material);
    }
    if (o.material.name === 'LED') {
      o.visible = rgbActivo;
      if (rgbActivo) ledMats.push(o.material);
    }
  });
  modelo.traverse((o) => { if (o.name === 'Fan') fans.push(o); });
  g.add(modelo);

  // Etiquetas y conectores que dependen de la pieza concreta (texto y posiciones del juego).
  if (p.kind === 'nvme') {
    const etiqueta = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.6), new THREE.MeshStandardMaterial({ map: texturaTexto('NVMe M.2', 512, 220, '#E5E9F0', '#2E3440'), roughness: 0.6 }));
    etiqueta.position.set(1.4, 0, 0.14);
    g.add(etiqueta);
  }
  if (p.kind === 'psu') {
    for (const cid of Object.keys(SALIDA_CABLE)) {
      g.add(en(caja(1.4, 0.8, 1.2, matNegro), SALIDA_CABLE[cid][0], 3.65, 0));
    }
    const etiqueta = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.6), new THREE.MeshStandardMaterial({ map: texturaTexto(`${p.watts} W`, 512, 180), roughness: 0.6 }));
    etiqueta.position.set(-4.2, 1.6, 3.52);
    g.add(etiqueta);
  }
  return g;
}

function posicionDe(id) {
  const p = pieza(id);
  if (p.kind === 'cpu') return { x: SLOTS[S.placed[id]].x, y: SLOTS[S.placed[id]].y, z: 0 };
  if (p.kind === 'ram') return { x: SLOTS[S.placed[id]].x, y: SLOTS[S.placed[id]].y, z: 0.5 };
  if (p.kind === 'gpu') return { x: SLOTS.pcie.x, y: SLOTS.pcie.y + 2.3, z: 1.6 };
  if (p.kind === 'nvme') return { x: SLOTS.m2.x, y: SLOTS.m2.y, z: 0.125 };
  if (p.kind === 'psu') return { x: SLOTS.psu.x, y: SLOTS.psu.y, z: 3.5 };
  return { x: 0, y: 0, z: 0 };
}

function puertoRect(pid) {
  const p = PORTS[pid];
  if (!p.relativo) return { x: p.x, y: p.y, w: p.w, h: p.h, z: p.z };
  const gpu = posicionDe(piezaPlacada('gpu').id);
  return { x: gpu.x + p.dx, y: gpu.y + p.dy, w: p.w, h: p.h, z: 2.7 };
}

function puertoVisible(pid) {
  const necesita = NECESITA[pid];
  return necesita === 'board' ? !!tabla() : !!piezaPlacada(necesita);
}

function puertoEn(x, y) {
  for (const pid of Object.keys(PORTS)) {
    if (!puertoVisible(pid)) continue;
    const r = puertoRect(pid);
    if (Math.abs(x - r.x) <= r.w / 2 + 0.6 && Math.abs(y - r.y) <= r.h / 2 + 0.6) return pid;
  }
  return null;
}

function huecoEn(x, y, pieza_) {
  let libre = null;
  let distLibre = Infinity;
  let ocupado = null;
  let distOcupado = Infinity;
  for (const [id, s] of Object.entries(SLOTS)) {
    if (!s.accepts.includes(pieza_.kind)) continue;
    if (Math.abs(x - s.x) > s.w / 2 + 0.6 || Math.abs(y - s.y) > s.h / 2 + 0.6) continue;
    const d = Math.hypot(x - s.x, y - s.y);
    if (occupied(id)) {
      if (d < distOcupado) { distOcupado = d; ocupado = id; }
    } else if (d < distLibre) {
      distLibre = d;
      libre = id;
    }
  }
  return libre ?? ocupado;
}

// ---------- Reglas del montaje ----------
function log(tipo, msg) {
  entradas.unshift({ tipo, msg });
  entradas = entradas.slice(0, 40);
  logEl.innerHTML = entradas.map((e) => `<li class="${e.tipo}">${e.msg}</li>`).join('');
}
function fallo(msg, corto) {
  S.errores++;
  const texto = esFacil() ? msg : (corto ?? 'No encaja con el pedido.');
  S.fallos.push(texto);
  ultimoAviso = texto;
  log('bad', texto);
}
function ok(msg) {
  ultimoAviso = '';
  log('ok', msg);
}

// Reglas aplicadas al estado de la partida (la lógica pura está en reglas.js).
// Pista de difícil para una pieza que no pide el pedido. Solo se da cuando el texto del cliente
// enuncia la propiedad y la pieza la contradice; si no, no hay orientación verificable.
function orientacionNoPedido(p) {
  if (p.kind !== 'caja') return null;
  const requerida = pieza(pedido().piezas.caja);
  if (!/RGB|luces/i.test(pedido().cliente) || p.rgb === requerida.rgb) return null;
  return `Esta caja no es la del pedido: el cliente pide una caja ${requerida.rgb ? 'con' : 'sin'} iluminación RGB.`;
}

function motivoColocarJuego(p, sid) {
  return motivoColocar(p, {
    placa: tabla(),
    cajaPuesta: !!piezaPlacada('caja'),
    ocupado: occupied(sid),
    nombreHueco: SLOTS[sid].nombre,
    potencia: potencia(),
    enPedido: enPedido(p.id),
    orientacion: enPedido(p.id) ? undefined : orientacionNoPedido(p)
  });
}

function motivoConectarJuego(c, pid) {
  return motivoConectar(c, pid, {
    etiqueta: PORTS[pid].etiqueta,
    visible: puertoVisible(pid),
    psuPuesta: !!piezaPlacada('psu'),
    ocupado: pluggedPort(pid)
  });
}

function intentarColocar(p, x, y) {
  const sid = huecoEn(x, y, p);
  if (!sid) return;
  colocarEn(p, sid);
}

// Coloca la pieza en el hueco indicado si las reglas lo permiten. Devuelve true si la colocó.
function colocarEn(p, sid) {
  const motivo = motivoColocarJuego(p, sid);
  if (motivo) {
    fallo(motivo.msg, motivo.corto);
    return false;
  }
  S.placed[p.id] = sid;
  cerrarDialogosPendientes();
  ok(explicarColocacion(p));
  return true;
}

// Un diálogo pendiente describe el estado en el que se abrió. Si el estado cambia, se cierra y se vuelve a pedir.
function cerrarDialogosPendientes() {
  cerrarRetirada();
  cerrarCambioModo();
}

// Explicaciones de acierto: función de la pieza y requisito que se cumple. Cada tipo se explica una vez por partida.
const FUNCION_PIEZA = {
  caja: 'El chasis sostiene la placa base y el resto de componentes.',
  board: 'La placa base conecta el procesador, la memoria, la gráfica y el almacenamiento.',
  cpu: 'El procesador ejecuta las instrucciones del equipo.',
  ram: 'La memoria guarda los datos que el procesador usa en cada momento.',
  gpu: 'La tarjeta gráfica genera la imagen que se ve en la pantalla.',
  nvme: 'El SSD guarda el sistema operativo y los archivos.',
  psu: 'La fuente convierte la corriente de la red en la tensión que necesitan los componentes. Instalarla no basta: de ella salen los cables que alimentan la placa, el procesador y la gráfica.'
};
const FUNCION_CABLE = {
  'c-atx': 'Lleva la alimentación principal de la fuente a la placa base.',
  'c-eps': 'Alimenta el procesador directamente desde la fuente.',
  'c-pcie': 'Aporta la alimentación extra que necesita la tarjeta gráfica.'
};

function requisitoPieza(p) {
  switch (p.kind) {
    case 'caja': return p.rgb ? 'Tiene iluminación RGB, como pide el cliente.' : 'No lleva iluminación RGB, como pide el cliente.';
    case 'board': return `Su socket (${p.socket}) y su memoria (${p.gen}) fijan qué procesador y qué módulos admite.`;
    case 'cpu': return `Socket ${p.socket}: coincide con el de la placa base.`;
    case 'ram': return `Generación ${p.gen}: coincide con la de la placa base.`;
    case 'gpu': return `Su consumo (${p.tdp} W) cuenta para calcular la potencia de la fuente.`;
    case 'nvme': return 'La ranura M.2 acepta este formato.';
    case 'psu': return `Sus ${p.watts} W cubren los ${potencia()} W que necesita el equipo.`;
    default: return '';
  }
}

function explicarColocacion(p) {
  const titulo = esFacil() ? p.nombre : NOMBRE_GENERICO[p.kind];
  if (S.explicadas[p.kind]) return `Pieza colocada: ${titulo}.`;
  S.explicadas[p.kind] = true;
  return `Pieza colocada: ${titulo}. ${FUNCION_PIEZA[p.kind]} ${requisitoPieza(p)}`;
}

function explicarConexion(c, pid, largo) {
  const titulo = esFacil() ? c.nombre : 'Cable de alimentación';
  if (S.explicadas[c.id]) return `${titulo} conectado.`;
  S.explicadas[c.id] = true;
  const medida = esFacil() ? ` Recorrido: ${Math.round(largo)} cm de ${c.longitudMax} cm.` : '';
  return `${titulo} conectado. ${FUNCION_CABLE[c.id]} Su conector coincide con el ${PORTS[pid].etiqueta}.${medida}`;
}

function intentarConectar(c, x, y, ruta) {
  const pid = puertoEn(x, y);
  if (!pid) return log('info', `${c.nombre} vuelve a la bandeja: suéltalo sobre su conector.`);
  conectarEn(c, pid, ruta);
}

// Conecta el cable al conector indicado si las reglas y la longitud lo permiten. Devuelve true si lo conectó.
function conectarEn(c, pid, ruta) {
  const motivo = motivoConectarJuego(c, pid);
  if (motivo) {
    fallo(motivo.msg, motivo.corto);
    return false;
  }
  const largo = longitudCable(ruta, puertoRect(pid), ALTURA_CABLE);
  const fueraDeLongitud = motivoLongitud(c, largo);
  if (fueraDeLongitud) {
    fallo(fueraDeLongitud.msg, fueraDeLongitud.corto);
    return false;
  }
  S.plugged[c.id] = { port: pid, ruta };
  cerrarDialogosPendientes();
  ok(explicarConexion(c, pid, largo));
  return true;
}


// Textos que cuentan piezas: salen del número real, no de una frase fija.
const NUMEROS_TEXTO = ['cero', 'un', 'dos', 'tres', 'cuatro'];
const textoModulos = (n) => (n === 1 ? 'el módulo' : `los ${NUMEROS_TEXTO[n]} módulos`);
const textoCables = () => `los ${NUMEROS_TEXTO[CABLES.length]} cables`;

// Pasos del pedido en curso (el texto depende de las piezas que pide el cliente).
function pasos() {
  const p = pedido().piezas;
  return [
    { txt: `Coloca la caja: ${pieza(p.caja).nombre}.`, hecho: () => placed(p.caja) },
    { txt: `Fija la ${pieza(p.board).nombre} en el chasis.`, hecho: () => placed(p.board) },
    { txt: `Coloca el procesador ${pieza(p.cpu).socket} en su socket.`, hecho: () => placed(p.cpu) },
    { txt: `Instala ${textoModulos(p.ram.length)} de RAM ${pieza(p.ram[0]).gen}.`, hecho: () => p.ram.every(placed) },
    { txt: 'Coloca la tarjeta gráfica en la ranura PCIe x16.', hecho: () => placed(p.gpu) },
    { txt: 'Instala el SSD NVMe en la ranura M.2.', hecho: () => placed(p.nvme) },
    { txt: 'Coloca la fuente de alimentación en su hueco.', hecho: () => placed(p.psu) },
    { txt: `Conecta ${textoCables()} de alimentación a sus conectores.`, hecho: () => CABLES.every((c) => plugged(c.id)) },
    { txt: 'Pulsa «Encender equipo» para comprobar el montaje.', hecho: () => S.final }
  ];
}

function encender() {
  if (S.final) {
    log('info', 'El equipo ya arrancó en este pedido. Pulsa «Empezar de nuevo» para montar otro.');
    return;
  }
  const pasosPedido = pasos();
  const pendientes = pasosPedido.slice(0, -1).filter((p) => !p.hecho());
  if (pendientes.length) {
    S.errores++;
    const aviso = esFacil() ? `El equipo no arranca. Falta: ${pendientes[0].txt}` : 'El equipo no arranca: comprueba que todas las piezas del pedido y los tres cables están colocados.';
    S.fallos.push('Se intentó encender con piezas o cables pendientes');
    ultimoAviso = aviso;
    log('bad', aviso);
    if (esFacil()) {
      CABLES.filter((c) => !plugged(c.id)).forEach((c) => log('info', EXPLICA[c.id]));
      destelloHasta = performance.now() + 4000;
    }
    pintarEscena();
    return;
  }
  S.final = true;
  log('ok', 'El equipo arranca y la BIOS muestra la pantalla POST.');
  resumenFinal();
  pintarPanel();
  pintarEscena();
}

// Qué se ha comprobado y qué errores se cometieron. Sin puntuación ni persistencia.
// Resumen del POST. Todo sale del estado de la partida: nada se afirma sin comprobarlo aquí.
function resumenFinal() {
  const superadas = ETIQUETAS_PASOS.filter((_, i) => pasos()[i].hecho());
  log('info', `Comprobaciones superadas (${superadas.length} de ${ETIQUETAS_PASOS.length}): ${superadas.join(', ')}.`);

  const nombres = Object.keys(S.placed).map(nombreElemento);
  log('info', `Componentes instalados (${nombres.length}): ${nombres.join(', ')}.`);

  const conectados = CABLES.filter((c) => plugged(c.id));
  log('info', `Conexiones verificadas (${conectados.length} de ${CABLES.length}): ${conectados.map((c) => c.nombre).join(', ')}.`);

  // Compatibilidad: cada condición se vuelve a comprobar con las piezas instaladas.
  const cpu = piezaPlacada('cpu');
  const placa = tabla();
  const psu = piezaPlacada('psu');
  const memorias = Object.keys(S.placed).map(pieza).filter((p) => p.kind === 'ram');
  const condiciones = [
    ['socket del procesador y de la placa base', !!cpu && !!placa && cpu.socket === placa.socket],
    ['memoria de la misma generación que la placa', memorias.length > 0 && memorias.every((m) => m.gen === placa?.gen)],
    [`fuente de ${psu?.watts} W para los ${potencia()} W necesarios`, !!psu && psu.watts >= potencia()],
    ['tarjeta gráfica en la ranura PCIe', placed(pedido().piezas.gpu)],
    ['los tres cables en su conector', conectados.length === CABLES.length]
  ];
  const cumplidas = condiciones.filter(([, ok]) => ok).map(([texto]) => texto);
  log('info', `Compatibilidad comprobada (${cumplidas.length} de ${condiciones.length}): ${cumplidas.join('; ')}.`);
  if (cumplidas.length === condiciones.length) {
    log('info', 'Por eso puede arrancar: cada pieza del pedido está instalada, los cables llegan a sus conectores y la fuente cubre la potencia del equipo.');
  }

  if (!S.fallos.length) {
    log('info', 'No se cometieron errores durante el montaje.');
  } else {
    const cuentas = new Map();
    for (const f of S.fallos) cuentas.set(f, (cuentas.get(f) ?? 0) + 1);
    log('info', `Errores cometidos (${S.errores}):`);
    for (const [texto, veces] of cuentas) log('info', `· ${texto}${veces > 1 ? ` (${veces} veces)` : ''}`);
  }
  log('info', S.retiradas ? `Piezas o cables retirados durante el montaje: ${S.retiradas}.` : 'No se retiró ninguna pieza ni cable.');
}

// Nombres de las comprobaciones, en el mismo orden que pasos().
const ETIQUETAS_PASOS = ['caja', 'placa base', 'procesador', 'memoria', 'gráfica', 'SSD', 'fuente', 'cables de alimentación', 'encendido'];

// Pistas: ayudan a razonar qué comprobar sin decir qué pieza concreta elegir.
const PISTAS = [
  'Mira en el pedido si el cliente pide luces RGB o un lateral de cristal: eso decide la caja.',
  'La placa base define el socket del procesador y el tipo de memoria. Ambos deben encajar con el resto del pedido.',
  'Compara el socket del procesador con el de la placa base.',
  'La memoria debe ser de la misma generación que la placa (DDR4 o DDR5).',
  'La tarjeta gráfica va en la ranura PCIe x16. Fíjate en su consumo para la fuente.',
  'El SSD va en la ranura M.2 de la placa.',
  'La potencia mínima es (TDP de la CPU + TDP de la GPU + 100 W) × 1,3. La fuente del pedido debe darla.',
  'Cada cable sale de la fuente y termina en el conector que tenga su mismo número de pines.',
  'Antes de encender, revisa que cada pieza y cable del pedido esté colocado.'
];
const PISTAS_MAX_DIFICIL = 2;

function pedirPista() {
  const i = pasos().findIndex((p) => !p.hecho());
  if (!esFacil() && S.pistas >= PISTAS_MAX_DIFICIL) {
    log('info', `En modo difícil hay ${PISTAS_MAX_DIFICIL} pistas por partida y ya las has usado.`);
    return;
  }
  const texto = PISTAS[i < 0 ? PISTAS.length - 1 : i];
  // Solo las pistas de difícil cuentan para el límite. El contador es de la partida, no del modo.
  if (!esFacil()) S.pistas++;
  S.pistaPaso = i;
  $('pista-texto').textContent = `Pista: ${texto}`;
  pintarPanel();
}

// Empieza una partida con el pedido indicado. Limpia todo lo de la partida anterior.
// Semántica de los contadores (ver juego/tests.html, «Contadores»):
// - Una partida es un pedido elegido con «Reiniciar» o al empezar. Sus contadores (pistas, errores,
//   retiradas y el registro) empiezan a cero.
// - Un cambio de dificultad rehace el montaje (la confirmación lo avisa), pero sigue siendo la misma
//   partida: partidaPrevia conserva los contadores y el registro.
function cargarPedido(id, partidaPrevia = null) {
  cancelarArrastreEnCurso();
  const c = partidaPrevia ?? { pistas: 0, errores: 0, fallos: [], retiradas: 0 };
  S = { pedido: id, placed: {}, plugged: {}, pistaPaso: null, final: false, explicadas: {}, ...c, fallos: [...c.fallos] };
  if (!partidaPrevia) entradas = [];
  seleccion = null;
  destino = null;
  ultimoAviso = '';
  cerrarRetirada();
  cerrarCambioModo();
  pintarSeleccion();
  vistaPrevia = null;
  destelloHasta = 0;
  chasisId = null;
  tableroId = null;
  $('pista-texto').textContent = '';
  clienteEl.textContent = pedido().cliente;
  especEl.innerHTML = especificaciones().map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join('');
  especEl.hidden = !esFacil();
  pintarEscena();
  if (partidaPrevia) {
    log('info', `Cambio a dificultad ${esFacil() ? 'fácil' : 'difícil'}: el montaje empieza de nuevo. Se conservan las pistas, los errores y las retiradas de esta partida.`);
  } else {
    log('info', esFacil()
      ? `Montaje nuevo: ${pedido().titulo}. Empieza eligiendo la caja y arrastrándola al chasis.`
      : 'Montaje nuevo. Lee lo que pide el cliente y monta el equipo.');
  }
}

// Pedido al azar: no se puede elegir.
function reiniciar() {
  cargarPedido(PEDIDOS[Math.floor(Math.random() * PEDIDOS.length)].id);
}

// Pasos sin nombres de piezas para el modo difícil.
const pasosGenericos = () => [
  'Elige la caja del pedido.',
  'Fija la placa base en el chasis.',
  'Asienta el procesador en su socket.',
  `Instala ${textoModulos(pedido().piezas.ram.length)} de memoria.`,
  'Coloca la tarjeta gráfica en su ranura.',
  'Instala el almacenamiento M.2.',
  'Coloca la fuente de alimentación.',
  `Conecta ${textoCables()} de alimentación.`,
  'Pulsa «Encender equipo» para comprobar el montaje.'
];

const componentesListos = () => {
  const p = pedido().piezas;
  return [p.caja, p.board, p.cpu, ...p.ram, p.gpu, p.nvme, p.psu].every(placed);
};
const conexionesListas = () => CABLES.every((c) => plugged(c.id));

function pintarPanel() {
  const lista = pasos();
  const i = lista.findIndex((p) => !p.hecho());
  // Una pista se refiere al paso en el que se pidió: si ese paso ya está hecho, deja de mostrarse.
  if (S.pistaPaso !== i) $('pista-texto').textContent = '';
  nivelEl.textContent = esFacil() ? 'Nivel fácil' : 'Nivel difícil';
  nivelEl.dataset.nivel = modo;
  progEl.textContent = esFacil()
    ? (S.final ? `Equipo montado · Errores: ${S.errores}` : `Paso ${i < 0 ? lista.length : i + 1} de ${lista.length} · Errores: ${S.errores}`)
    : `Errores: ${S.errores}`;

  const genericos = pasosGenericos();
  pasosEl.innerHTML = lista.map((p, n) => {
    const estado = p.hecho() ? 'hecho' : n === i ? 'actual' : 'pendiente';
    const texto = esFacil() ? p.txt : genericos[n];
    const etiqueta = { hecho: 'Hecho', actual: 'Siguiente', pendiente: 'Pendiente' }[estado];
    const actual = estado === 'actual' ? ' aria-current="step"' : '';
    return `<li data-estado="${estado}"${actual}><span class="num">${estado === 'hecho' ? '✓' : n + 1}</span><span>${texto}</span><span class="etiqueta-paso">${etiqueta}</span></li>`;
  }).join('');
  const paso = pasosEl.querySelector('[aria-current="step"]');
  if (paso) pasosEl.scrollTop = paso.offsetTop - pasosEl.offsetTop - 8;

  const c1 = componentesListos();
  const c2 = conexionesListas();
  // Una etapa solo se completa si lo anterior también lo está (un componente retirado reabre Componentes).
  // Lo que comprueba cada etapa. Coincide con lo que hace encender(): el POST exige que no falte nada,
  // y la compatibilidad ya se comprobó al colocar cada pieza y al conectar cada cable.
  const etapas = [
    ['Componentes', c1 ? 'hecho' : 'actual', 'Las piezas del pedido están instaladas en el chasis.'],
    ['Conexiones', c1 && c2 ? 'hecho' : c1 ? 'actual' : 'pendiente', 'Los tres cables de alimentación están en sus conectores.'],
    ['Comprobación', S.final ? 'hecho' : c1 && c2 ? 'actual' : 'pendiente', 'Con todo instalado y conectado, al encender se revisa que no falte nada. La compatibilidad ya se comprobó al colocar cada pieza.'],
    ['Encendido', S.final ? 'hecho' : 'pendiente', 'Si no queda nada pendiente, el equipo arranca y la BIOS muestra la pantalla POST.']
  ];
  const textoEstado = { hecho: 'Completado', actual: 'En curso', pendiente: 'Pendiente' };
  etapasEl.innerHTML = etapas.map(([nombre, estado, explica], n) => {
    const actual = estado === 'actual' ? ' aria-current="step"' : '';
    return `<li data-estado="${estado}"${actual}><span class="circulo">${estado === 'hecho' ? '✓' : n + 1}</span><span class="etiqueta">${nombre}</span><span class="estado-etapa">${textoEstado[estado]}</span><span class="explica">${explica}</span></li>`;
  }).join('');

  let texto;
  if (S.final) texto = `<strong>Montaje completado.</strong> El equipo arranca. Errores durante el montaje: ${S.errores}.`;
  else if (seleccion) texto = '<strong>Pieza seleccionada.</strong> Elige un destino de la lista y confirma.';
  else if (c1 && c2) texto = '<strong>Todo conectado.</strong> Pulsa «Encender equipo» para comprobar el montaje.';
  else texto = `<strong>Siguiente paso.</strong> ${esFacil() ? lista[i].txt : genericos[i]}`;
  if (ultimoAviso && !S.final) texto += ` <span class="aviso">${ultimoAviso}</span>`;
  mensajeEl.innerHTML = texto;

  pistaContadorEl.textContent = esFacil() ? 'Pistas sin límite en fácil' : `Pistas usadas: ${S.pistas} de ${PISTAS_MAX_DIFICIL}`;
  const botonPista = $('pista');
  const teniaFoco = document.activeElement === botonPista;
  botonPista.disabled = !esFacil() && S.pistas >= PISTAS_MAX_DIFICIL;
  // Un botón desactivado pierde el foco: el teclado no debe quedarse sin punto de partida.
  if (teniaFoco && botonPista.disabled) mensajeEl.focus();
}

// Especificaciones exactas de las piezas del pedido (solo en modo fácil).
function especificaciones() {
  const pz = pedido().piezas;
  const rams = pz.ram.map(pieza);
  return [
    ['Caja', pieza(pz.caja).nombre],
    ['Placa base', pieza(pz.board).nombre],
    ['Procesador', pieza(pz.cpu).nombre],
    ['Memoria', `${rams.length} × ${rams[0].nombre}`],
    ['Gráfica', gpuActual().nombre],
    ['Almacenamiento', pieza(pz.nvme).nombre],
    ['Fuente', `${pieza(pz.psu).nombre} (mínimo ${potencia()} W)`]
  ];
}

// Dato técnico de cada pieza, solo en modo fácil.
function specDe(p) {
  if (p.kind === 'caja') return p.rgb ? 'Con RGB' : 'Sin RGB';
  if (p.kind === 'board') return `${p.socket} · ${p.gen}`;
  if (p.kind === 'cpu') return `${p.socket} · ${p.tdp} W`;
  if (p.kind === 'ram') return p.gen;
  if (p.kind === 'gpu') return `${p.tdp} W`;
  if (p.kind === 'nvme') return 'M.2';
  if (p.kind === 'psu') return `${p.watts} W`;
  return '';
}

// ---------- Bandeja ----------
// Desplegables de la bandeja: uno por tipo de componente.
// Nombres sin datos técnicos, para el modo difícil.
const NOMBRE_GENERICO = { caja: 'Caja', board: 'Placa base', cpu: 'Procesador', ram: 'Memoria RAM', gpu: 'Tarjeta gráfica', nvme: 'SSD', psu: 'Fuente de alimentación', cable: 'Cable de alimentación' };

const GRUPOS_BANDEJA = [
  ['caja', 'Cajas'], ['board', 'Placas base'], ['cpu', 'Procesadores'], ['ram', 'Memoria RAM'],
  ['gpu', 'Tarjetas gráficas'], ['nvme', 'SSD'], ['psu', 'Fuentes de alimentación'], ['cable', 'Cables de alimentación']
];

function pintarBandeja() {
  bandeja.innerHTML = '';
  const items = [
    ...PIEZAS.map((p) => ({ id: p.id, kind: p.kind, tipo: 'parte', nombre: p.nombre, corto: p.corto, spec: specDe(p), color: p.color, foto: !p.sinFoto, instalado: placed(p.id) })),
    ...CABLES.map((c) => ({ id: c.id, kind: 'cable', tipo: 'cable', nombre: c.nombre, corto: c.corto, spec: `Conector ${PORTS[c.port].etiqueta}`, color: c.color, foto: !c.sinFoto, instalado: plugged(c.id) }))
  ].filter((it) => filtro === 'todos' || (filtro === 'cables' ? it.tipo === 'cable' : it.tipo === 'parte'));
  // Un desplegable por tipo: se abre con un clic. Con un filtro activo se muestran abiertos.
  for (const [tipo, titulo] of GRUPOS_BANDEJA) {
    const del = items.filter((it) => it.kind === tipo);
    if (!del.length) continue;
    const montados = del.filter((it) => it.instalado).length;
    const grupo = document.createElement('details');
    grupo.className = 'grupo';
    grupo.open = filtro !== 'todos';
    grupo.innerHTML = `<summary>${titulo} <small>${montados} de ${del.length} ${del.length === 1 ? 'montado' : 'montados'}</small></summary><div class="grupo-lista"></div>`;
    bandeja.appendChild(grupo);
    for (const it of del) pintarFicha(it, grupo.querySelector('.grupo-lista'));
  }
}


// Una pieza instalada no se puede volver a coger: aparece como «Instalado» o «Conectado».
// Icono de respaldo para las piezas sin foto. Un dibujo por tipo, con el mismo encuadre que las fotos.
const ICONOS = {
  caja: '<rect x="14" y="6" width="28" height="36" rx="3"/><circle cx="28" cy="18" r="6"/><path d="M14 30h28"/>',
  board: '<rect x="8" y="6" width="40" height="36" rx="2"/><rect x="16" y="13" width="10" height="10"/><path d="M32 12h10M32 17h10M32 22h10M16 32h24M16 36h24"/>',
  cpu: '<rect x="12" y="12" width="32" height="24" rx="2"/><rect x="19" y="19" width="18" height="10"/><path d="M18 8v4M24 8v4M30 8v4M36 8v4M18 36v4M24 36v4M30 36v4M36 36v4"/>',
  ram: '<rect x="6" y="18" width="44" height="12" rx="1"/><path d="M12 18v12M18 18v12M24 18v12M30 18v12M36 18v12M42 18v12"/><path d="M10 30v4M46 30v4"/>',
  gpu: '<rect x="4" y="12" width="48" height="24" rx="3"/><circle cx="18" cy="24" r="7"/><circle cx="38" cy="24" r="7"/>',
  nvme: '<rect x="6" y="19" width="44" height="10" rx="1"/><path d="M14 19v10M22 19v10M30 19v10"/><rect x="40" y="21" width="6" height="6"/>',
  psu: '<rect x="10" y="10" width="36" height="28" rx="3"/><circle cx="28" cy="24" r="9"/><path d="M28 15v18M19 24h18"/>',
  cable: '<path d="M8 14c10 0 10 20 20 20s10-14 20-14" fill="none"/><rect x="40" y="26" width="10" height="10" rx="1"/>'
};
const ICONOS_CAJA = {
  // Cristal: panel lateral dibujado con su marco y el hueco transparente.
  cristal: '<rect x="8" y="6" width="36" height="36" rx="2"/><rect x="30" y="10" width="10" height="28" rx="1" stroke-dasharray="2 2"/>',
  // Metálica: cuerpo sólido, con rejilla frontal de lamas.
  metal: '<rect x="8" y="6" width="36" height="36" rx="2" fill="#4C566A"/><path d="M14 14h24M14 18h24M14 22h24" stroke="#D8DEE9"/>',
};
const LUZ_ICONO = '<circle cx="36" cy="38" r="2" fill="#B48EAD" stroke="none"/><circle cx="42" cy="38" r="2" fill="#B48EAD" stroke="none"/>';
const iconoPieza = (kind, id) => {
  const variante = PIEZAS.find((p) => p.id === id);
  let cuerpo = ICONOS[kind] ?? ICONOS.caja;
  if (kind === 'caja' && variante) {
    cuerpo = ICONOS_CAJA[variante.cristal ? 'cristal' : 'metal'];
    if (variante.rgb) cuerpo += LUZ_ICONO;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 48"><g fill="#2E3440" stroke="#88C0D0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${cuerpo}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

function pintarFicha(it, contenedorFichas) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'ficha';
  el.dataset.id = it.id;
  el.dataset.tipo = it.tipo;
  el.dataset.estado = it.instalado ? 'instalado' : 'pendiente';
  el.setAttribute('aria-disabled', String(it.instalado));
  const elegida = seleccion?.id === it.id;
  el.setAttribute('aria-pressed', String(elegida));
  el.classList.toggle('seleccionada', elegida);
  // Foto real si existe; si no, el icono del tipo. Nunca un recuadro vacío.
  const imagen = it.foto ? `fotos/${it.id}.png` : iconoPieza(it.kind, it.id);
  const foto = `<img src="${imagen}" alt="" loading="lazy" class="${it.foto ? 'foto' : 'icono'}">`;
  const dato = esFacil() && it.spec ? `<small>${it.spec}</small>` : '';
  // En fácil, la ficha usa el mismo nombre que las instrucciones y el pedido (así el alumno los reconoce).
  const nombre = esFacil() ? it.nombre : NOMBRE_GENERICO[it.kind];
  const marca = elegida ? '<em class="marca">Seleccionada</em>' : '';
  const estado = it.instalado ? (it.tipo === 'cable' ? 'Conectado' : 'Instalado') : 'Disponible';
  el.innerHTML = `<span class="miniatura">${foto}</span><span class="texto">${nombre}${dato}${marca}</span><span class="estado">${estado}</span>`;
  // Nombre accesible con pausas entre datos: el texto de los spans se leería pegado («RGBCon RGB»).
  const datoAccesible = esFacil() && it.spec ? it.spec : '';
  el.setAttribute('aria-label', [nombre, datoAccesible, elegida ? 'seleccionada' : '', estado].filter(Boolean).join('. '));
  // Si la foto no carga, se usa el icono del tipo.
  if (it.foto) el.querySelector('img').addEventListener('error', (e) => {
    e.target.src = iconoPieza(it.kind, it.id);
    e.target.className = 'icono';
  }, { once: true });
  if (esFacil() && it.tipo === 'cable' && performance.now() < destelloHasta) el.classList.add('destacar');
  contenedorFichas.appendChild(el);
}

// ---------- Guías de hueco y puerto ----------
const guiaSlot = {};
const guiaPort = {};
// Guía de hueco o conector: solo el contorno. Un plano relleno tapaba el chasis y se veía como un bloque.
const contornoUnitario = new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1));
const materialGuia = () => new THREE.LineBasicMaterial({ color: '#81A1C1', transparent: true, opacity: 0, depthWrite: false });

function construirGuias() {
  for (const [id, s] of Object.entries(SLOTS)) {
    const m = new THREE.LineSegments(contornoUnitario, materialGuia());
    m.scale.set(s.w + 0.6, s.h + 0.6, 1);
    m.position.set(s.x, s.y, 0.06);
    grupoGuias.add(m);
    guiaSlot[id] = m;
  }
  for (const pid of Object.keys(PORTS)) {
    const m = new THREE.LineSegments(contornoUnitario, materialGuia());
    grupoGuias.add(m);
    guiaPort[pid] = m;
  }
}

// Las guías solo aparecen cuando el alumno tiene una pieza seleccionada o arrastrada:
// muestran los huecos (o conectores) que admiten esa pieza. El destino en el que está el cursor se resalta.
function actualizarGuias(hover, valido = false) {
  const color = (id) => (hover !== id ? '#81A1C1' : valido ? '#A3BE8C' : '#BF616A');
  const objetivo = seleccion ?? arrastre;
  const item = objetivo ? (objetivo.tipo === 'cable' ? cable(objetivo.id) : pieza(objetivo.id)) : null;
  const esCable = objetivo?.tipo === 'cable';
  for (const [id, m] of Object.entries(guiaSlot)) {
    const s = SLOTS[id];
    const visible = !!item && esFacil() && !esCable && s.accepts.includes(item.kind) && !occupied(id);
    m.visible = visible;
    if (!visible) continue;
    m.material.opacity = hover === id ? 1 : 0.6;
    m.material.color.set(color(id));
    m.scale.set(s.w + 0.6, s.h + 0.6, 1);
    m.position.set(s.x, s.y, 0.06);
  }
  for (const [pid, m] of Object.entries(guiaPort)) {
    const visible = !!item && esFacil() && esCable && item.port === pid && puertoVisible(pid) && !pluggedPort(pid);
    m.visible = visible;
    if (!visible) continue;
    const r = puertoRect(pid);
    m.position.set(r.x, r.y, r.z + 0.06);
    m.scale.set(r.w + 0.8, r.h + 0.8, 1);
    m.material.opacity = hover === pid ? 1 : 0.6;
    m.material.color.set(color(pid));
  }
}

// ---------- Cables ----------
// Recorrido completo: salida de la fuente, puntos que traza el alumno, y bajada vertical al conector.
function puntosCable(ruta, r) {
  const altura = Math.max(ALTURA_CABLE, r.z + 1.6);
  return [...ruta, [r.x, r.y, altura], [r.x, r.y, r.z + 1.2]];
}

function tuboCable(puntos, color) {
  const vectores = puntos.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const curva = new THREE.CatmullRomCurve3(vectores, false, 'centripetal');
  const tubo = new THREE.Mesh(new THREE.TubeGeometry(curva, Math.max(24, puntos.length * 10), RADIO_CABLE, 12, false), matCable(color));
  tubo.castShadow = true;
  return tubo;
}

// Conector: carcasa del color del cable, con contactos dorados en la cara superior.
function conectorCable(color, r) {
  const g = new THREE.Group();
  const carcasa = new THREE.Mesh(new THREE.BoxGeometry(r.w, r.h, 1.2), matPlastico(new THREE.Color(color).multiplyScalar(0.55).getStyle(), { roughness: 0.5 }));
  carcasa.position.set(r.x, r.y, r.z + 0.6);
  carcasa.castShadow = true;
  g.add(carcasa);
  const contactos = Math.max(2, Math.round(Math.max(r.w, r.h) * 1.6));
  const largo = Math.max(r.w, r.h) * 0.7;
  const horizontal = r.w > r.h;
  for (let i = 0; i < contactos; i++) {
    const t = -largo / 2 + (i + 0.5) * (largo / contactos);
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), matOro);
    pin.position.set(horizontal ? r.x + t : r.x, horizontal ? r.y : r.y + t, r.z + 1.22);
    g.add(pin);
  }
  return g;
}

function dibujarPrevia(a, p) {
  if (vistaPrevia) {
    grupoCables.remove(vistaPrevia);
    liberar(vistaPrevia);
  }
  const trazado = [...a.ruta, [p.x, p.y, ALTURA_CABLE]];
  const largo = longitudTrazado(simplificarTrazado(trazado));
  const excede = largo > cable(a.id).longitudMax;
  vistaPrevia = tuboCable(trazado, excede ? '#E0868E' : cable(a.id).color);
  // En rojo cuando el recorrido ya supera el máximo del cable.
  grupoCables.add(vistaPrevia);
}

// ---------- Dibujo de piezas montadas ----------
function pintarEscena() {
  ledMats.length = 0;
  fans.length = 0;
  const cajaPuesta = piezaPlacada('caja');
  rgbActivo = !!cajaPuesta?.rgb;
  grupoCaso.visible = !!cajaPuesta;
  if (!cajaPuesta) {
    // Sin caja no queda chasis oculto en memoria: se libera y se reconstruirá al volver a colocarla.
    vaciar(grupoCaso);
    ledCaso.length = 0;
    fansCaso.length = 0;
    chasisId = null;
  } else if (chasisId !== cajaPuesta.id) {
    vaciar(grupoCaso);
    construirCaso(cajaPuesta);
  }
  if (cajaPuesta?.rgb) ledMats.push(...ledCaso);
  fans.push(...fansCaso);

  const placa = tabla();
  grupoTablero.visible = !!placa;
  if (!placa) {
    vaciar(grupoTablero);
    tableroId = null;
  } else if (tableroId !== placa.id) {
    construirTablero(placa);
  }

  vaciar(grupoPiezas);
  for (const id of Object.keys(S.placed)) {
    if (pieza(id).kind === 'board' || pieza(id).kind === 'caja') continue;
    grupoPiezas.add(construirPieza(pieza(id), posicionDe(id)));
  }
  ledMats.forEach((mat, n) => { mat.userData.desfase = (n * 0.17) % 1; });
  for (const mat of ledMats) mat.emissiveIntensity = S.final ? 2.2 : 0.9;

  vaciar(grupoCables);
  vistaPrevia = null;
  for (const c of CABLES) {
    const conexion = S.plugged[c.id];
    if (!conexion) continue;
    const r = puertoRect(conexion.port);
    grupoCables.add(tuboCable(puntosCable(conexion.ruta, r), c.color));
    grupoCables.add(conectorCable(c.color, r));
  }

  pintarBandeja();
  pintarMontadas();
  actualizarGuias(null);
  pintarPanel();
}

// ---------- Arrastre ----------
const raycaster = new THREE.Raycaster();
const plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const punto = new THREE.Vector3();
const ndc = new THREE.Vector2();

function puntoEnPlaca(clientX, clientY) {
  const r = renderer.domElement.getBoundingClientRect();
  if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return null;
  ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  return raycaster.ray.intersectPlane(plano, punto) ? { x: punto.x, y: punto.y } : null;
}

function moverFantasma(clientX, clientY) {
  fantasma.style.left = `${clientX}px`;
  fantasma.style.top = `${clientY}px`;
}

bandeja.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('.ficha');
  if (!el || el.getAttribute('aria-disabled') === 'true') return;
  e.preventDefault();
  arrastre = { id: el.dataset.id, tipo: el.dataset.tipo, el, ruta: null };
  movido = false;
  inicioPuntero = { x: e.clientX, y: e.clientY };
  if (arrastre.tipo === 'cable') arrastre.ruta = [SALIDA_CABLE[arrastre.id]];
  el.style.opacity = '0.4';
  fantasma.textContent = el.textContent;
  fantasma.style.display = 'block';
  moverFantasma(e.clientX, e.clientY);
});

window.addEventListener('pointermove', (e) => {
  if (!arrastre) return;
  moverFantasma(e.clientX, e.clientY);
  if (!movido && Math.hypot(e.clientX - inicioPuntero.x, e.clientY - inicioPuntero.y) > 6) movido = true;
  if (!movido) return;
  // Con el arrastre en marcha, la selección por toque deja de aplicar.
  if (seleccion) cancelarSeleccion(false);
  const p = puntoEnPlaca(e.clientX, e.clientY);
  let hover = null;
  if (p) {
    if (arrastre.tipo === 'cable') {
      hover = puertoEn(p.x, p.y);
      // El cable se mantiene dentro de la placa: los puntos fuera se llevan al borde.
      const q = { x: Math.min(14.5, Math.max(-14.5, p.x)), y: Math.min(11.5, Math.max(-11.5, p.y)) };
      const ultimo = arrastre.ruta[arrastre.ruta.length - 1];
      const distancia = Math.hypot(q.x - ultimo[0], q.y - ultimo[1]);
      // El recorrido empieza en la salida de la fuente: los puntos lejos de ella no cuentan
      // hasta que el cursor se acerca (si no, el tramo desde el borde de la escena se sumaría al cable).
      const llegaALaSalida = arrastre.ruta.length > 1 || distancia < 6;
      if (llegaALaSalida && distancia > 0.5) arrastre.ruta.push([q.x, q.y, ALTURA_CABLE]);
      dibujarPrevia(arrastre, q);
    } else {
      hover = huecoEn(p.x, p.y, pieza(arrastre.id));
    }
  }
  const valido = arrastre.tipo === 'cable'
    ? !!hover && !motivoConectarJuego(cable(arrastre.id), hover)
    : !!hover && !motivoColocarJuego(pieza(arrastre.id), hover);
  actualizarGuias(hover, valido);
});

function terminarArrastre(e, cancelado) {
  if (!arrastre) return;
  const a = arrastre;
  arrastre = null;
  fantasma.style.display = 'none';
  // Un toque sin desplazamiento selecciona la pieza para colocarla desde el panel (también sirve al tocar en pantalla táctil).
  if (!cancelado && !movido && e.type === 'pointerup') {
    pintarEscena();
    seleccionar(a.id, a.tipo);
    return;
  }
  if (!cancelado) {
    const p = puntoEnPlaca(e.clientX, e.clientY);
    if (a.tipo === 'cable' && !p) log('info', `${cable(a.id).nombre} vuelve a la bandeja: suéltalo sobre su conector.`);
    if (p) {
      if (a.tipo === 'cable') intentarConectar(cable(a.id), p.x, p.y, a.ruta);
      else intentarColocar(pieza(a.id), p.x, p.y);
    }
  }
  pintarEscena();
}

window.addEventListener('pointerup', (e) => terminarArrastre(e, false));
window.addEventListener('pointercancel', (e) => terminarArrastre(e, true));

// ---------- Colocación con teclado o toque ----------
// Pieza o cable elegido → destino (hueco o conector) → confirmar. Esc cancela en cualquier paso.
function destinosDe(item, tipo) {
  if (tipo === 'cable') {
    return Object.keys(PORTS).map((pid) => {
      const m = motivoConectarJuego(item, pid);
      return { id: pid, etiqueta: `Conector ${PORTS[pid].etiqueta}`, motivo: m };
    });
  }
  return Object.entries(SLOTS).filter(([, s]) => s.accepts.includes(item.kind)).map(([sid, s]) => {
    const m = motivoColocarJuego(item, sid);
    const etiqueta = sid === 'ram1' ? `${s.nombre} 1` : sid === 'ram2' ? `${s.nombre} 2` : s.nombre;
    return { id: sid, etiqueta, motivo: m };
  });
}

function seleccionar(id, tipo) {
  if (seleccion?.id === id) return cancelarSeleccion();
  seleccion = { id, tipo };
  destino = null;
  pintarSeleccion();
  pintarBandeja();
  actualizarGuias(null);
  $('seleccion-titulo').focus();
}

function cancelarSeleccion(enfocar = true) {
  if (!seleccion) return;
  seleccion = null;
  destino = null;
  pintarSeleccion();
  pintarBandeja();
  actualizarGuias(null);
  if (enfocar) bandeja.querySelector('.ficha:not([aria-disabled="true"])')?.focus();
}

function cancelarArrastreEnCurso() {
  if (!arrastre) return;
  arrastre = null;
  movido = false;
  fantasma.style.display = 'none';
}

function pintarSeleccion() {
  const panel = $('seleccion');
  if (!seleccion) {
    panel.hidden = true;
    $('destinos').innerHTML = '';
    $('seleccion-motivo').textContent = '';
    $('confirmar').disabled = true;
    return;
  }
  const item = seleccion.tipo === 'cable' ? cable(seleccion.id) : pieza(seleccion.id);
  const clave = seleccion.tipo === 'cable' ? 'cable' : item.kind;
  const nombre = esFacil() ? item.corto : NOMBRE_GENERICO[clave];
  const verbo = seleccion.tipo === 'cable' ? 'Conectar' : 'Colocar';
  $('seleccion-titulo').textContent = `${verbo}: ${nombre}`;
  $('confirmar').textContent = seleccion.tipo === 'cable' ? 'Confirmar conexión' : 'Confirmar colocación';
  const lista = destinosDe(item, seleccion.tipo);
  $('destinos').innerHTML = lista.map((d) => {
    const estado = d.motivo ? 'no válido' : 'válido';
    const marca = destino === d.id ? ' · elegido' : '';
    return `<li><button type="button" class="boton destino" data-dest="${d.id}" aria-pressed="${destino === d.id}">${d.etiqueta}: ${estado}${marca}</button></li>`;
  }).join('');
  const elegido = lista.find((d) => d.id === destino);
  $('seleccion-motivo').textContent = elegido?.motivo
    ? (esFacil() ? elegido.motivo.msg : elegido.motivo.corto)
    : (elegido ? 'Destino válido: confirma para colocarla.' : 'Elige un destino de la lista.');
  $('confirmar').disabled = !(elegido && !elegido.motivo);
  panel.hidden = false;
}

function elegirDestino(id) {
  destino = id;
  pintarSeleccion();
  actualizarGuias(destino, !!destinosDe(seleccion.tipo === 'cable' ? cable(seleccion.id) : pieza(seleccion.id), seleccion.tipo).find((d) => d.id === id && !d.motivo));
  document.querySelector(`[data-dest="${id}"]`)?.focus();
}

function confirmarSeleccion() {
  if (!seleccion || !destino) return;
  const { id, tipo } = seleccion;
  const hecho = tipo === 'cable' ? conectarEn(cable(id), destino, [SALIDA_CABLE[id]]) : colocarEn(pieza(id), destino);
  if (!hecho) { pintarSeleccion(); return; }
  seleccion = null;
  destino = null;
  pintarEscena();
  pintarSeleccion();
  // El inventario se reconstruye: el foco vuelve a la primera pieza disponible, o al mensaje si no queda ninguna.
  const siguiente = bandeja.querySelector('.ficha:not([aria-disabled="true"])');
  (siguiente ?? mensajeEl).focus();
}

$('destinos').addEventListener('click', (e) => {
  const b = e.target.closest('[data-dest]');
  if (b) elegirDestino(b.dataset.dest);
});
$('confirmar').addEventListener('click', confirmarSeleccion);
$('cancelar').addEventListener('click', () => cancelarSeleccion());
$('pista').addEventListener('click', pedirPista);
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (retiradaPendiente) cerrarRetiradaYEnfocar();
  else if (modoPendiente) { cerrarCambioModo(); devolverFoco(); }
  else if (seleccion) cancelarSeleccion();
});
// Teclado: Intro o Espacio sobre una ficha la selecciona (el navegador lo envía como clic sin posición).
bandeja.addEventListener('click', (e) => {
  const el = e.target.closest('.ficha');
  if (!el || e.detail !== 0 || el.getAttribute('aria-disabled') === 'true') return;
  seleccionar(el.dataset.id, el.dataset.tipo);
});

// ---------- Tamaño y bucle ----------
function ajustarTamano() {
  const ancho = contenedor.clientWidth;
  const alto = contenedor.clientHeight;
  renderer.setSize(ancho, alto, false);
  camera.aspect = ancho / alto;
  camera.updateProjectionMatrix();
}
new ResizeObserver(ajustarTamano).observe(contenedor);

renderer.setAnimationLoop(() => {
  const velocidad = S?.final ? 0.22 : 0.02;
  for (const rotor of fans) rotor.rotation.z -= velocidad;
  const ahora = performance.now();
  // Luces RGB: cada tira y cada aro cambia de color en un ciclo, con desfase propio.
  if (rgbActivo) {
    for (const m of ledMats) {
      const tono = (ahora / 9000 + (m.userData.desfase ?? 0)) % 1;
      m.color.setHSL(tono, 1, 0.55);
      m.emissive.setHSL(tono, 1, 0.55);
    }
  }
  if (ahora < destelloHasta) {
    const pulso = 0.5 + 0.4 * Math.sin(ahora / 120);
    for (const m of Object.values(guiaPort)) if (m.visible) m.material.opacity = pulso;
  }
  renderer.render(scene, camera);
});

// ---------- Cámara ----------
// Vista inicial y destino de la cámara. Los controles acercan o alejan sobre la misma línea de mira.
const VISTA = { posicion: camera.position.clone(), objetivo: new THREE.Vector3(0, -3, 0) };
const DISTANCIA_MIN = 40;
const DISTANCIA_MAX = 140;

function acercarCamara(factor) {
  const dir = camera.position.clone().sub(VISTA.objetivo);
  const distancia = Math.min(DISTANCIA_MAX, Math.max(DISTANCIA_MIN, dir.length() * factor));
  camera.position.copy(VISTA.objetivo).add(dir.normalize().multiplyScalar(distancia));
  camera.lookAt(VISTA.objetivo);
  camera.updateMatrixWorld();
}

function restablecerCamara() {
  camera.position.copy(VISTA.posicion);
  camera.lookAt(VISTA.objetivo);
  camera.updateMatrixWorld();
}

$('zoom-mas').addEventListener('click', () => acercarCamara(0.8));
$('zoom-menos').addEventListener('click', () => acercarCamara(1.25));
$('camara-reset').addEventListener('click', restablecerCamara);

// Pantalla completa solo si el navegador la permite; si no, el botón no se muestra.
const botonPantalla = $('pantalla');
if (document.fullscreenEnabled) {
  botonPantalla.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else contenedor.requestFullscreen();
  });
} else {
  botonPantalla.hidden = true;
}

// Filtros del inventario: Todos, Hardware y Cables.
for (const b of botonesFiltro) {
  b.addEventListener('click', () => {
    filtro = b.dataset.filtro;
    for (const o of botonesFiltro) o.setAttribute('aria-pressed', String(o === b));
    pintarBandeja();
  });
}

// ---------- Inicio ----------
construirGuias();
ajustarTamano();
reiniciar();

$('encender').addEventListener('click', encender);
// ---------- Cambio de dificultad: con progreso, confirmación; la dificultad activa no hace nada ----------
const hayProgreso = () => Object.keys(S.placed).length > 0 || Object.keys(S.plugged).length > 0;

function aplicarModo(nuevo) {
  modo = nuevo;
  for (const o of botonesModo) o.setAttribute('aria-pressed', String(o.dataset.modo === modo));
  // Mismo pedido y misma partida: el cambio de dificultad conserva pistas, errores, retiradas y registro.
  cargarPedido(S.pedido, { pistas: S.pistas, errores: S.errores, fallos: S.fallos, retiradas: S.retiradas });
}

function pedirCambioModo(nuevo) {
  modoPendiente = nuevo;
  const piezas = Object.keys(S.placed).length;
  const cables = Object.keys(S.plugged).length;
  const cuenta = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  $('confirmar-modo-texto').textContent = `Cambiar a dificultad ${nuevo === 'facil' ? 'fácil' : 'difícil'} empezará de nuevo el montaje de este pedido. Se perderán ${cuenta(piezas, 'pieza', 'piezas')} y ${cuenta(cables, 'cable', 'cables')} colocados. Se conservan las pistas, los errores y las retiradas de esta partida.`;
  recordarFoco();
  $('confirmar-modo').hidden = false;
  $('confirmar-modo-titulo').focus();
}

function cerrarCambioModo() {
  modoPendiente = null;
  $('confirmar-modo').hidden = true;
}

for (const b of botonesModo) {
  b.addEventListener('click', () => {
    const nuevo = b.dataset.modo;
    if (nuevo === modo) return;
    if (hayProgreso()) return pedirCambioModo(nuevo);
    aplicarModo(nuevo);
  });
}
$('modo-confirmar').addEventListener('click', () => {
  const nuevo = modoPendiente;
  cerrarCambioModo();
  if (nuevo) aplicarModo(nuevo);
  devolverFoco();
});
$('modo-cancelar').addEventListener('click', () => {
  cerrarCambioModo();
  devolverFoco();
});

// Foco de los diálogos: se guarda al abrirlos y se devuelve al cerrarlos (si ese elemento sigue en pantalla).
function recordarFoco() {
  focoAntes = document.activeElement;
}
function devolverFoco() {
  const el = focoAntes;
  focoAntes = null;
  if (el?.isConnected && el.offsetParent !== null) el.focus();
  else mensajeEl.focus();
}

// ---------- Deshacer: retirar piezas o cables colocados, con sus dependencias ----------
// Qué requiere cada pieza o cable para estar montado (según las mismas reglas de colocación y conexión).
function requisitosDe(id) {
  const caja = piezaPlacada('caja')?.id;
  const tablero = tabla()?.id;
  if (cable(id)) {
    const req = [];
    const psu = piezaPlacada('psu')?.id;
    if (psu) req.push(psu);
    const duenio = NECESITA[cable(id).port] === 'board' ? tablero : piezaPlacada(NECESITA[cable(id).port])?.id;
    if (duenio) req.push(duenio);
    return req;
  }
  const p = pieza(id);
  if (p.kind === 'caja') return [];
  if (p.kind === 'board') return [caja].filter(Boolean);
  return [caja, tablero].filter(Boolean);
}

// Nombre de una pieza o cable. Las dos memorias se distinguen por su ranura (si no, salen iguales).
function nombreElemento(id) {
  if (cable(id)) return esFacil() ? cable(id).corto : 'Cable de alimentación';
  const p = pieza(id);
  const base = esFacil() ? p.corto : NOMBRE_GENERICO[p.kind];
  const sid = S.placed[id];
  return p.kind === 'ram' && sid ? `${base}, ranura ${sid.slice(-1)}` : base;
}

// Todo lo que se retiraría con `id` según el estado actual (se recalcula al confirmar).
function idsRetirada(id) {
  return cascadaRetirada(id, requisitosDe, [...Object.keys(S.placed), ...Object.keys(S.plugged)]);
}

function pedirRetirada(id) {
  const ids = idsRetirada(id);
  if (ids.length === 1) return aplicarRetirada(ids);
  retiradaPendiente = id;
  // Punto y coma: algunos nombres ya llevan coma («RAM DDR4, ranura 1»).
  const extra = ids.slice(1).map(nombreElemento).join('; ');
  $('retirada-texto').textContent = `Retirar ${nombreElemento(id)} también retirará: ${extra}. ¿Confirmas?`;
  recordarFoco();
  $('confirmar-retirada').hidden = false;
  $('retirada-titulo').focus();
}

function cerrarRetirada() {
  retiradaPendiente = null;
  $('confirmar-retirada').hidden = true;
}

// Cierra la confirmación de retirada y devuelve el foco a quien la abrió.
function cerrarRetiradaYEnfocar() {
  cerrarRetirada();
  devolverFoco();
}

function aplicarRetirada(ids) {
  cerrarRetirada();
  // Los nombres se leen antes de borrar: la ranura de una memoria sale de S.placed.
  const nombres = ids.map(nombreElemento).join('; ');
  for (const x of ids) {
    if (cable(x)) delete S.plugged[x];
    else delete S.placed[x];
  }
  seleccion = null;
  destino = null;
  ultimoAviso = '';
  if (S.final) S.final = false;
  S.retiradas += ids.length;
  cerrarDialogosPendientes();
  log('info', `Retirado: ${nombres}.`);
  pintarEscena();
  pintarSeleccion();
}

function pintarMontadas() {
  const lista = $('lista-montadas');
  const ids = [...Object.keys(S.placed), ...Object.keys(S.plugged)];
  lista.innerHTML = ids.length
    ? ids.map((id) => `<li><button type="button" class="boton" data-retirar="${id}">Retirar ${nombreElemento(id)}</button></li>`).join('')
    : '<li class="ayuda">Todavía no hay piezas ni cables montados.</li>';
}

$('lista-montadas').addEventListener('click', (e) => {
  const b = e.target.closest('[data-retirar]');
  if (!b) return;
  pedirRetirada(b.dataset.retirar);
  // Sin dependencias se retira al momento: el botón que se pulsó ya no existe, así que el foco va al mensaje.
  if (!retiradaPendiente) mensajeEl.focus();
});
$('retirada-confirmar').addEventListener('click', () => {
  if (!retiradaPendiente) return;
  aplicarRetirada(idsRetirada(retiradaPendiente));
  devolverFoco();
});
$('retirada-cancelar').addEventListener('click', cerrarRetiradaYEnfocar);
botonesModo.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === modo)));
$('reiniciar').addEventListener('click', reiniciar);
$('tema').addEventListener('click', () => {
  const root = document.documentElement;
  const nuevo = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nuevo;
  try { localStorage.setItem('temario-tema', nuevo); } catch (_) {}
});

// Ayudas para pruebas automáticas (juego/tests.html y pruebas manuales en el navegador).
window.montaje = {
  estado: () => JSON.parse(JSON.stringify(S)),
  cargar: (id) => cargarPedido(id),
  pedidos: () => PEDIDOS.map((p) => p.id),
  modo: () => modo,
  seleccion: () => (seleccion ? { ...seleccion, destino } : null),
  renderInfo: () => ({ geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures }),
  camara: () => ({ x: camera.position.x, y: camera.position.y, z: camera.position.z }),
  lucesCaja: () => ledCaso.length,
  // Ventiladores del chasis (incluido el superior común): cuenta la estructura, con o sin RGB.
  ventiladoresCaso: () => fansCaso.length,
  // Paneles transparentes del chasis (el cristal). Una caja metálica no tiene ninguno.
  vidriosCaja: () => grupoCaso.children.filter((m) => m.material?.transparent && m.material?.opacity < 0.5).length,
  guiasVisibles: () => [...Object.entries(guiaSlot), ...Object.entries(guiaPort)].filter(([, m]) => m.visible).map(([id]) => id),
  pantallaDeHueco(id) {
    const s = SLOTS[id];
    return pantallaDe(s.x, s.y, 0);
  },
  pantallaDePuerto(pid) {
    const r = puertoRect(pid);
    return pantallaDe(r.x, r.y, r.z);
  }
};

function pantallaDe(x, y, z) {
  const v = new THREE.Vector3(x, y, z).project(camera);
  const r = renderer.domElement.getBoundingClientRect();
  return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
}
