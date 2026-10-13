import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PIEZAS, CABLES, PEDIDOS } from './catalogo.js';

const $ = (id) => document.getElementById(id);
const logEl = $('log');
const objEl = $('objetivo');
const progEl = $('progreso');
const clienteEl = $('cliente');
const selectPedido = $('pedido');
const especEl = $('especificaciones');
const botonesModo = document.querySelectorAll('[data-modo]');
const contenedor = $('escena');
const bandeja = $('bandeja');
const fantasma = $('fantasma');

const TDP_GPU = PIEZAS.find((p) => p.kind === 'gpu').tdp;

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
const potenciaNecesaria = () => Math.ceil((cpuActual().tdp + TDP_GPU + 100) * 1.3);

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
camera.position.set(6, 6, 84);
camera.lookAt(0, -3, 0);

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

const matMetal = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: 0.75, roughness: 0.3, ...extra });
const matPlastico = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: 0.05, roughness: 0.65, ...extra });
const matOro = new THREE.MeshStandardMaterial({ color: '#D9B25F', metalness: 1, roughness: 0.3 });
const matNegro = matPlastico('#15181E');
const matCable = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0 });

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
// Chasis según la caja elegida: lateral de cristal o metálico, y tiras RGB si la caja las tiene.
function construirCaso(modelo) {
  grupoCaso.clear();
  const carcasa = new THREE.MeshPhysicalMaterial({ color: modelo.color, roughness: 0.45, metalness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const interior = matPlastico('#262B35');
  grupoCaso.add(en(caja(34, 34, 0.5, interior), 0, -2, -0.9));
  grupoCaso.add(en(caja(34, 0.6, 9, carcasa), 0, 15.3, 3.55));
  grupoCaso.add(en(caja(34, 0.6, 9, carcasa), 0, -19.3, 3.55));
  grupoCaso.add(en(caja(0.6, 34.6, 9, carcasa), -17.3, -2, 3.55));
  // Lateral derecho: cristal o panel metálico.
  if (modelo.cristal) {
    const cristal = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 34, 9),
      new THREE.MeshPhysicalMaterial({ color: '#9FB3CC', transparent: true, opacity: 0.14, roughness: 0.05, clearcoat: 1 })
    );
    cristal.position.set(17.3, -2, 3.55);
    grupoCaso.add(cristal);
  } else {
    grupoCaso.add(en(caja(0.6, 34.6, 9, carcasa), 17.3, -2, 3.55));
  }
  // Tiras de luz RGB en el marco superior y en el interior del lateral.
  if (modelo.rgb) {
    const luzTira = matPlastico('#88C0D0', { emissive: '#88C0D0', emissiveIntensity: 1.2 });
    ledMats.push(luzTira);
    grupoCaso.add(en(caja(30, 0.25, 0.25, luzTira), 0, 14.8, -0.2));
    grupoCaso.add(en(caja(0.25, 30, 0.25, luzTira), 16.9, -2, -0.2));
  }
  chasisId = modelo.id;
}

// La placa se reconstruye cuando cambia el modelo (color, zócalo y memoria).
function construirTablero(placa) {
  grupoTablero.clear();
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
  log('bad', esFacil() ? msg : (corto ?? 'No encaja con el pedido.'));
}
function ok(msg) { log('ok', msg); }

function intentarColocar(p, x, y) {
  const sid = huecoEn(x, y, p);
  if (!sid) return;
  const placa = tabla();
  if (p.kind !== 'caja' && !piezaPlacada('caja')) {
    return fallo('Primero elige la caja: sin chasis no hay dónde montar el equipo.', 'Primero la caja.');
  }
  if (p.kind !== 'caja' && p.kind !== 'board' && !placa) {
    return fallo('Primero fija la placa base en el chasis: sin ella no hay dónde montar el resto.', 'Primero la placa base.');
  }
  if (occupied(sid)) return fallo(`El ${SLOTS[sid].nombre} ya está ocupado.`, 'Ese hueco ya está ocupado.');
  if (p.kind === 'cpu' && p.socket !== placa.socket) {
    return fallo(`${p.nombre} no encaja: es para socket ${p.socket} y la placa tiene ${placa.socket}. Cada socket admite solo sus familias de procesador (apuntes S11).`, 'Ese procesador no encaja en esta placa.');
  }
  if (p.kind === 'ram' && p.gen !== placa.gen) {
    return fallo(`${p.nombre} no entra en una placa ${placa.gen}: las ranuras son distintas según la generación (apuntes S11).`, 'Esa memoria no encaja en esta placa.');
  }
  if (p.kind === 'psu' && p.watts < potenciaNecesaria()) {
    return fallo(`La fuente de ${p.watts} W se queda corta: el equipo necesita al menos ${potenciaNecesaria()} W, según (TDP CPU + TDP GPU + 100 W) × 1,3 (apuntes S11).`, 'Esa fuente no basta para este equipo.');
  }
  if (!enPedido(p.id)) {
    return fallo(`${p.nombre} no es el componente que pide el cliente en este pedido. Mira el pedido y elige otra pieza.`, 'Esa pieza no es la que pide el cliente.');
  }
  S.placed[p.id] = sid;
  const mensajes = {
    caja: `${p.nombre} colocada: ${p.rgb ? 'tiene iluminación RGB' : 'no lleva iluminación RGB'}.`,
    board: esFacil() ? `${p.nombre} fijada en el chasis: los separadores evitan que toque la caja (apuntes S08).` : `${p.nombre} fijada en el chasis.`,
    cpu: `Procesador asentado en el socket ${p.socket}.`,
    ram: `${p.nombre} instalado en la ranura.`,
    gpu: 'Tarjeta gráfica en la ranura PCIe x16.',
    nvme: 'SSD NVMe en la ranura M.2.',
    psu: `Fuente de ${p.watts} W: suficiente para los ${potenciaNecesaria()} W que necesita el equipo.`
  };
  ok(mensajes[p.kind]);
}

function intentarConectar(c, x, y, ruta) {
  const pid = puertoEn(x, y);
  if (!pid) return log('info', `${c.nombre} vuelve a la bandeja: suéltalo sobre su conector.`);
  if (c.port !== pid) {
    return fallo(`${c.nombre} no encaja en el conector ${PORTS[pid].etiqueta}: el número de pines y la forma son distintos (apuntes S07).`, 'Ese cable no encaja en ese conector.');
  }
  if (!piezaPlacada('psu')) return fallo('Antes de conectar los cables, instala la fuente: de ella salen.', 'Primero la fuente.');
  if (pluggedPort(pid)) return fallo(`El conector ${PORTS[pid].etiqueta} ya tiene un cable.`, 'Ese conector ya tiene cable.');
  const largo = longitudCable(ruta, puertoRect(pid));
  if (largo > c.longitudMax) {
    return fallo(`${c.nombre} mide ${Math.round(largo)} cm de recorrido y el máximo es ${c.longitudMax} cm. Trázalo más directo entre la fuente y el conector.`, 'Ese cable no llega al conector.');
  }
  S.plugged[c.id] = { port: pid, ruta };
  ok(`${c.nombre} conectado (${Math.round(largo)} cm de ${c.longitudMax} cm).`);
}

// Pasos del pedido en curso (el texto depende de las piezas que pide el cliente).
function pasos() {
  const p = pedido().piezas;
  return [
    { txt: `Coloca la caja: ${pieza(p.caja).nombre}.`, hecho: () => placed(p.caja) },
    { txt: `Fija la ${pieza(p.board).nombre} en el chasis.`, hecho: () => placed(p.board) },
    { txt: `Coloca el procesador ${pieza(p.cpu).socket} en su socket.`, hecho: () => placed(p.cpu) },
    { txt: `Instala los dos módulos de RAM ${pieza(p.ram[0]).gen}.`, hecho: () => p.ram.every(placed) },
    { txt: 'Coloca la tarjeta gráfica en la ranura PCIe x16.', hecho: () => placed(p.gpu) },
    { txt: 'Instala el SSD NVMe en la ranura M.2.', hecho: () => placed(p.nvme) },
    { txt: 'Coloca la fuente de alimentación en su hueco.', hecho: () => placed(p.psu) },
    { txt: 'Conecta los tres cables de alimentación a sus conectores.', hecho: () => CABLES.every((c) => plugged(c.id)) },
    { txt: 'Pulsa «Encender el equipo» para comprobar el montaje.', hecho: () => S.final }
  ];
}

function encender() {
  if (S.final) return;
  const pendientes = pasos().slice(0, -1).filter((p) => !p.hecho());
  if (pendientes.length) {
    S.errores++;
    if (esFacil()) {
      log('bad', `El equipo no arranca. Falta: ${pendientes[0].txt}`);
      CABLES.filter((c) => !plugged(c.id)).forEach((c) => log('info', EXPLICA[c.id]));
      destelloHasta = performance.now() + 4000;
    } else {
      log('bad', 'El equipo no arranca. Revisa el pedido y las conexiones.');
    }
    pintarEscena();
    return;
  }
  S.final = true;
  log('ok', `El equipo arranca y la BIOS muestra la pantalla POST. Errores durante el montaje: ${S.errores}.`);
  pintarPanel();
  pintarEscena();
}

function cargarPedido(id) {
  S = { pedido: id, placed: {}, plugged: {}, errores: 0, final: false };
  entradas = [];
  clienteEl.textContent = pedido().cliente;
  especEl.innerHTML = especificaciones().map((t) => `<li>${t}</li>`).join('');
  pintarEscena();
  log('info', `Montaje nuevo: ${pedido().titulo}. Empieza eligiendo la caja y arrastrándola al chasis.`);
}

function reiniciar() {
  cargarPedido(selectPedido.value);
}

function pintarPanel() {
  const lista = pasos();
  const i = lista.findIndex((p) => !p.hecho());
  if (!esFacil()) {
    objEl.textContent = S.final ? 'Equipo montado' : 'Monta el equipo del pedido.';
    progEl.textContent = `Errores: ${S.errores}`;
    return;
  }
  objEl.textContent = i < 0 ? 'Equipo montado' : lista[i].txt;
  const paso = i < 0 ? lista.length : i + 1;
  progEl.textContent = `Paso ${paso} de ${lista.length} · Errores: ${S.errores}`;
}

// Especificaciones que pide el cliente (lo único que se ve en modo difícil).
function especificaciones() {
  const pz = pedido().piezas;
  const placa = pieza(pz.board);
  const cpu = pieza(pz.cpu);
  const rams = pz.ram.map(pieza);
  return [
    `Caja: ${pieza(pz.caja).nombre}`,
    `Placa base ${placa.socket} con memoria ${placa.gen}`,
    `Procesador ${cpu.socket} de ${cpu.tdp} W`,
    `${rams.length} módulos de RAM ${rams[0].gen}`,
    `Tarjeta gráfica de ${TDP_GPU} W`,
    'SSD NVMe M.2',
    `Fuente de al menos ${Math.ceil((cpu.tdp + TDP_GPU + 100) * 1.3)} W`
  ];
}

// Dato técnico de cada pieza, solo en modo fácil.
function specDe(p) {
  if (p.kind === 'caja') return p.rgb ? 'Con RGB' : 'Sin RGB';
  if (p.kind === 'board') return `${p.socket} · ${p.gen}`;
  if (p.kind === 'cpu') return `${p.socket} · ${p.tdp} W`;
  if (p.kind === 'ram') return p.gen;
  if (p.kind === 'gpu') return `${TDP_GPU} W`;
  if (p.kind === 'nvme') return 'M.2';
  if (p.kind === 'psu') return `${p.watts} W`;
  return '';
}

// ---------- Bandeja ----------
// Desplegables de la bandeja: uno por tipo de componente.
const GRUPOS = {
  caja: 'Caja',
  board: 'Placa base',
  cpu: 'Procesador',
  ram: 'Memoria RAM',
  gpu: 'Tarjeta gráfica',
  nvme: 'Almacenamiento',
  psu: 'Fuente de alimentación',
  cable: 'Cables de alimentación'
};
const abiertos = {};

function pintarBandeja() {
  bandeja.querySelectorAll('.grupo').forEach((el) => el.remove());
  const items = [
    ...PIEZAS.filter((p) => !placed(p.id)).map((p) => ({ id: p.id, kind: p.kind, tipo: 'parte', corto: p.corto, spec: specDe(p), color: p.color, foto: !p.sinFoto })),
    ...CABLES.filter((c) => !plugged(c.id)).map((c) => ({ id: c.id, kind: 'cable', tipo: 'cable', corto: c.corto, spec: `Conector ${PORTS[c.port].etiqueta}`, color: c.color, foto: !c.sinFoto }))
  ];
  const porGrupo = {};
  for (const it of items) (porGrupo[it.kind] ??= []).push(it);
  for (const [kind, lista] of Object.entries(porGrupo)) {
    const grupo = document.createElement('details');
    grupo.className = 'grupo';
    grupo.open = abiertos[kind] ?? true;
    grupo.addEventListener('toggle', () => { abiertos[kind] = grupo.open; });
    grupo.innerHTML = `<summary>${GRUPOS[kind]} <span class="cuenta">${lista.length}</span></summary><div class="grupo-fichas"></div>`;
    bandeja.appendChild(grupo);
    for (const it of lista) pintarFicha(it, grupo.querySelector('.grupo-fichas'));
  }
}

function pintarFicha(it, contenedorFichas) {
  {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'ficha';
    el.dataset.id = it.id;
    el.dataset.tipo = it.tipo;
    const foto = it.foto ? `<img src="fotos/${it.id}.png" alt="" loading="lazy">` : '';
    const dato = esFacil() && it.spec ? `<small>${it.spec}</small>` : '';
    el.innerHTML = `<span class="miniatura">${foto}</span><span class="texto">${it.corto}${dato}</span>`;
    // Sin foto (o si falla la carga): la pieza se ve con su color.
    const miniatura = el.querySelector('.miniatura');
    if (!it.foto) miniatura.style.background = it.color;
    else el.querySelector('img').addEventListener('error', () => {
      miniatura.style.background = it.color;
      miniatura.querySelector('img').remove();
    }, { once: true });
    if (esFacil() && it.tipo === 'cable' && performance.now() < destelloHasta) el.classList.add('destacar');
    contenedorFichas.appendChild(el);
  }
}

// ---------- Guías de hueco y puerto ----------
const guiaSlot = {};
const guiaPort = {};
const materialGuia = () => new THREE.MeshBasicMaterial({ color: '#EBCB8B', transparent: true, opacity: 0, depthWrite: false });

function construirGuias() {
  for (const [id, s] of Object.entries(SLOTS)) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s.w + 0.6, s.h + 0.6), materialGuia());
    m.position.set(s.x, s.y, 0.06);
    grupoGuias.add(m);
    guiaSlot[id] = m;
  }
  for (const pid of Object.keys(PORTS)) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materialGuia());
    grupoGuias.add(m);
    guiaPort[pid] = m;
  }
}

function actualizarGuias(hover) {
  if (!esFacil()) {
    for (const m of [...Object.values(guiaSlot), ...Object.values(guiaPort)]) m.visible = false;
    return;
  }
  const hayPlaca = !!tabla();
  for (const [id, m] of Object.entries(guiaSlot)) {
    const s = SLOTS[id];
    const relevante = id === 'board' ? !hayPlaca : (hayPlaca || id === 'psu') && !occupied(id);
    m.visible = relevante;
    // La placa ocupa casi todo el chasis: su guía solo se marca de forma sutil.
    const base = id === 'board' ? 0.1 : 0.4;
    m.material.opacity = hover === id ? (id === 'board' ? 0.25 : 0.8) : base;
    m.position.set(s.x, s.y, 0.06);
  }
  for (const [pid, m] of Object.entries(guiaPort)) {
    const visible = puertoVisible(pid) && !pluggedPort(pid);
    m.visible = visible;
    if (visible) {
      const r = puertoRect(pid);
      m.position.set(r.x, r.y, r.z + 0.06);
      m.scale.set(r.w + 0.8, r.h + 0.8, 1);
      m.material.opacity = hover === pid ? 0.9 : 0.55;
    }
  }
}

// ---------- Cables ----------
// Recorrido completo: salida de la fuente, puntos que traza el alumno, y bajada vertical al conector.
function puntosCable(ruta, r) {
  const altura = Math.max(ALTURA_CABLE, r.z + 1.6);
  return [...ruta, [r.x, r.y, altura], [r.x, r.y, r.z + 1.2]];
}

// Largo del recorrido en cm (1 unidad de escena ≈ 1 cm).
function longitudCable(ruta, r) {
  const puntos = puntosCable(ruta, r);
  let total = 0;
  for (let i = 1; i < puntos.length; i++) total += Math.hypot(puntos[i][0] - puntos[i - 1][0], puntos[i][1] - puntos[i - 1][1], puntos[i][2] - puntos[i - 1][2]);
  return total;
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
  if (vistaPrevia) grupoCables.remove(vistaPrevia);
  const trazado = [...a.ruta, [p.x, p.y, ALTURA_CABLE]];
  let largo = 0;
  for (let i = 1; i < trazado.length; i++) largo += Math.hypot(trazado[i][0] - trazado[i - 1][0], trazado[i][1] - trazado[i - 1][1], trazado[i][2] - trazado[i - 1][2]);
  const excede = largo > cable(a.id).longitudMax;
  vistaPrevia = tuboCable(trazado, excede ? '#E0868E' : cable(a.id).color);
  grupoCables.add(vistaPrevia);
}

// ---------- Dibujo de piezas montadas ----------
function pintarEscena() {
  ledMats.length = 0;
  fans.length = 0;
  const cajaPuesta = piezaPlacada('caja');
  rgbActivo = !!cajaPuesta?.rgb;
  grupoCaso.clear();
  grupoCaso.visible = !!cajaPuesta;
  if (cajaPuesta) construirCaso(cajaPuesta);

  const placa = tabla();
  if (placa && tableroId !== placa.id) construirTablero(placa);
  grupoTablero.visible = !!placa;

  grupoPiezas.clear();
  for (const id of Object.keys(S.placed)) {
    if (pieza(id).kind === 'board' || pieza(id).kind === 'caja') continue;
    grupoPiezas.add(construirPieza(pieza(id), posicionDe(id)));
  }
  for (const mat of ledMats) mat.emissiveIntensity = S.final ? 2.2 : 0.9;

  grupoCables.clear();
  vistaPrevia = null;
  for (const c of CABLES) {
    const conexion = S.plugged[c.id];
    if (!conexion) continue;
    const r = puertoRect(conexion.port);
    grupoCables.add(tuboCable(puntosCable(conexion.ruta, r), c.color));
    grupoCables.add(conectorCable(c.color, r));
  }

  pintarBandeja();
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
  if (!el) return;
  e.preventDefault();
  arrastre = { id: el.dataset.id, tipo: el.dataset.tipo, el, ruta: null };
  if (arrastre.tipo === 'cable') arrastre.ruta = [SALIDA_CABLE[arrastre.id]];
  el.style.opacity = '0.4';
  fantasma.textContent = el.textContent;
  fantasma.style.display = 'block';
  moverFantasma(e.clientX, e.clientY);
});

window.addEventListener('pointermove', (e) => {
  if (!arrastre) return;
  moverFantasma(e.clientX, e.clientY);
  const p = puntoEnPlaca(e.clientX, e.clientY);
  let hover = null;
  if (p) {
    if (arrastre.tipo === 'cable') {
      hover = puertoEn(p.x, p.y);
      // El cable se mantiene dentro de la placa: los puntos fuera se llevan al borde.
      const q = { x: Math.min(14.5, Math.max(-14.5, p.x)), y: Math.min(11.5, Math.max(-11.5, p.y)) };
      const ultimo = arrastre.ruta[arrastre.ruta.length - 1];
      if (Math.hypot(q.x - ultimo[0], q.y - ultimo[1]) > 0.5) arrastre.ruta.push([q.x, q.y, ALTURA_CABLE]);
      dibujarPrevia(arrastre, q);
    } else {
      hover = huecoEn(p.x, p.y, pieza(arrastre.id));
    }
  }
  actualizarGuias(hover);
});

function terminarArrastre(e, cancelado) {
  if (!arrastre) return;
  const a = arrastre;
  arrastre = null;
  fantasma.style.display = 'none';
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
  if (ahora < destelloHasta) {
    const pulso = 0.5 + 0.4 * Math.sin(ahora / 120);
    for (const m of Object.values(guiaPort)) if (m.visible) m.material.opacity = pulso;
  }
  renderer.render(scene, camera);
});

// ---------- Inicio ----------
construirGuias();
ajustarTamano();
for (const p of PEDIDOS) {
  const opcion = document.createElement('option');
  opcion.value = p.id;
  opcion.textContent = p.titulo;
  selectPedido.appendChild(opcion);
}
selectPedido.addEventListener('change', reiniciar);
reiniciar();

$('encender').addEventListener('click', encender);
for (const b of botonesModo) {
  b.addEventListener('click', () => {
    modo = b.dataset.modo;
    for (const o of botonesModo) o.setAttribute('aria-pressed', String(o === b));
    cargarPedido(selectPedido.value);
  });
}
botonesModo.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === modo)));
$('reiniciar').addEventListener('click', reiniciar);
$('tema').addEventListener('click', () => {
  const root = document.documentElement;
  const nuevo = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nuevo;
  try { localStorage.setItem('temario-tema', nuevo); } catch (_) {}
});

// Ayudas para pruebas automáticas: coordenadas de pantalla de huecos y puertos.
window.montaje = {
  estado: () => JSON.parse(JSON.stringify(S)),
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
