import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';

const $ = (id) => document.getElementById(id);
const logEl = $('log');
const objEl = $('objetivo');
const progEl = $('progreso');
const contenedor = $('escena');
const bandeja = $('bandeja');
const fantasma = $('fantasma');

// ---------- Reglas (valores de los apuntes) ----------
const BOARD = { socket: 'AM4', gen: 'DDR4' };
const TDP_CPU = 105;
const TDP_GPU = 150;
const NECESARIO = Math.ceil((TDP_CPU + TDP_GPU + 100) * 1.3);

// Coordenadas en unidades 3D. Centro de la placa = (0, 0). La placa mide 30 x 24.
const SLOTS = {
  board: { x: 0, y: 0, w: 30, h: 24, accepts: ['board'], nombre: 'anclaje de la placa base' },
  cpu:   { x: -2.0, y: 3.0, w: 4.0, h: 4.0, accepts: ['cpu'], nombre: 'socket del procesador' },
  ram1:  { x: 5.2, y: 4.3, w: 0.7, h: 13, accepts: ['ram'], nombre: 'ranura de memoria' },
  ram2:  { x: 6.1, y: 4.3, w: 0.7, h: 13, accepts: ['ram'], nombre: 'ranura de memoria' },
  pcie:  { x: 0.5, y: -8.6, w: 11, h: 0.9, accepts: ['gpu'], nombre: 'ranura PCIe x16' },
  m2:    { x: -9.0, y: -1.6, w: 8, h: 2.2, accepts: ['nvme'], nombre: 'ranura M.2' },
  psu:   { x: 0, y: -15.5, w: 16, h: 6.5, accepts: ['psu'], nombre: 'hueco de la fuente' }
};

const NECESITA = { atx24: 'board', eps8: 'board', pcie8: 'gpu' };
const PORTS = {
  atx24: { x: 12.5, y: 2.5, w: 1.8, h: 5, z: 0.5, etiqueta: 'ATX 24' },
  eps8:  { x: -12.5, y: 10, w: 2.5, h: 2, z: 0.5, etiqueta: 'EPS 8' },
  // El conector PCIe está en la esquina superior derecha de la gráfica, que se monta sobre su ranura.
  pcie8: { relativo: true, dx: 4.6, dy: 1.6, w: 1.2, h: 1.4, etiqueta: 'PCIe 6+2' }
};

const PIEZAS = [
  { id: 'board', kind: 'board', nombre: 'Placa base ATX (AM4, DDR4)', corto: 'Placa AM4', color: '#2F4F41' },
  { id: 'cpu', kind: 'cpu', nombre: 'Procesador AM4 (105 W)', corto: 'CPU AM4', socket: 'AM4', color: '#C9D1DC' },
  { id: 'cpu-x', kind: 'cpu', nombre: 'Procesador AM5 (105 W)', corto: 'CPU AM5', socket: 'AM5', color: '#C9D1DC', distractor: true },
  { id: 'ram-a', kind: 'ram', nombre: 'Módulo RAM DDR4', corto: 'RAM DDR4', gen: 'DDR4', color: '#1E222A' },
  { id: 'ram-b', kind: 'ram', nombre: 'Módulo RAM DDR4', corto: 'RAM DDR4', gen: 'DDR4', color: '#1E222A' },
  { id: 'ram-x', kind: 'ram', nombre: 'Módulo RAM DDR5', corto: 'RAM DDR5', gen: 'DDR5', color: '#1E222A', distractor: true },
  { id: 'gpu', kind: 'gpu', nombre: 'Tarjeta gráfica (150 W)', corto: 'GPU', color: '#1C2029' },
  { id: 'nvme', kind: 'nvme', nombre: 'SSD NVMe M.2', corto: 'SSD NVMe', color: '#2C4B3E' },
  { id: 'psu', kind: 'psu', nombre: 'Fuente de 650 W', corto: 'Fuente 650 W', watts: 650, color: '#1E222A' },
  { id: 'psu-x', kind: 'psu', nombre: 'Fuente de 450 W', corto: 'Fuente 450 W', watts: 450, color: '#1E222A', distractor: true }
];

const CABLES = [
  { id: 'c-atx', nombre: 'Cable ATX 24 pines', corto: 'ATX 24', port: 'atx24', color: '#D08770' },
  { id: 'c-eps', nombre: 'Cable EPS 8 pines', corto: 'EPS 8', port: 'eps8', color: '#E5E9F0' },
  { id: 'c-pcie', nombre: 'Cable PCIe 6+2 pines', corto: 'PCIe 6+2', port: 'pcie8', color: '#B48EAD' }
];

// Recorridos de cada cable desde la fuente hasta su conector, por encima de la placa.
const RUTAS = {
  'c-atx': [[6.5, -12.2, 0.4], [13.6, -12.2, 0.8], [14.6, -8, 0.9], [14.6, -1, 0.9], [13.8, 2.5, 0.7]],
  'c-eps': [[-6.5, -12.2, 0.4], [-14.6, -12.2, 0.9], [-14.6, 6, 0.9], [-13.6, 9.6, 0.8]],
  'c-pcie': [[2.5, -12.2, 0.4], [4, -10.2, 0.8], [8.5, -10.2, 1.2], [8.5, -5.4, 2.4]]
};

const EXPLICA = {
  'c-atx': 'Sin ATX 24 pines la placa no recibe alimentación y no arranca (apuntes S07).',
  'c-eps': 'Sin EPS 8 pines el procesador no recibe alimentación (apuntes S07).',
  'c-pcie': 'Sin PCIe 6+2 pines la tarjeta gráfica no tiene la alimentación adicional que necesita (apuntes S07).'
};

const PASOS = [
  { txt: 'Fija la placa base en el chasis.', hecho: () => placed('board') },
  { txt: 'Coloca el procesador en el socket.', hecho: () => placed('cpu') },
  { txt: 'Instala los dos módulos de RAM DDR4.', hecho: () => placed('ram-a') && placed('ram-b') },
  { txt: 'Coloca la tarjeta gráfica en la ranura PCIe x16.', hecho: () => placed('gpu') },
  { txt: 'Instala el SSD NVMe en la ranura M.2.', hecho: () => placed('nvme') },
  { txt: 'Coloca la fuente de alimentación en su hueco.', hecho: () => placed('psu') },
  { txt: 'Conecta los tres cables de alimentación a sus conectores.', hecho: () => plugged('c-atx') && plugged('c-eps') && plugged('c-pcie') },
  { txt: 'Pulsa «Encender el equipo» para comprobar el montaje.', hecho: () => S.final }
];

// ---------- Estado ----------
let S;
let entradas = [];
let arrastre = null;

const placed = (id) => id in S.placed;
const plugged = (id) => id in S.plugged;
const occupied = (sid) => Object.values(S.placed).includes(sid);
const pieza = (id) => PIEZAS.find((p) => p.id === id);
const cable = (id) => CABLES.find((c) => c.id === id);

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
camera.position.set(6, 6, 70);
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

const matMetal = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: 0.75, roughness: 0.3, ...extra });
const matPlastico = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: 0.05, roughness: 0.65, ...extra });
const matOro = new THREE.MeshStandardMaterial({ color: '#D9B25F', metalness: 1, roughness: 0.3 });
const matNegro = matPlastico('#15181E');

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
    new THREE.MeshStandardMaterial({ color: colorAro, emissive: colorAro, emissiveIntensity: 0.9, roughness: 0.4 })
  );
  aro.position.z = 0.1;
  ledMats.push(aro.material);
  g.add(aro);
  fans.push(rotor);
  return g;
}

function texturaTexto(texto, ancho, alto) {
  const cv = document.createElement('canvas');
  cv.width = ancho;
  cv.height = alto;
  const c = cv.getContext('2d');
  c.fillStyle = '#20252E';
  c.fillRect(0, 0, ancho, alto);
  c.fillStyle = '#ECEFF4';
  c.font = `bold ${Math.round(alto * 0.55)}px system-ui, sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(texto, ancho / 2, alto / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function texturaPlaca() {
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

  const fondo = c.createLinearGradient(0, 0, W, H);
  fondo.addColorStop(0, '#2F4F41');
  fondo.addColorStop(1, '#1C3228');
  c.fillStyle = fondo;
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

  // Zócalo AM4: marco de plástico y patillas doradas.
  rect(-2, 3, 4.4, 4.4, '#101318');
  rect(-2, 3, 3.95, 3.95, '#262B34');
  for (let i = 0; i < 30; i++) {
    for (let j = 0; j < 30; j++) {
      punto(-2 - 1.9 + i * 0.13, 3 - 1.9 + j * 0.13, 2.2, '#C9A45C');
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
  c.fillText('AM4', X(-2), Y(5.8));
  c.fillText('DDR4', X(5.65), Y(11.6));
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

// ---------- Construcción de la escena fija ----------
function construirCaso() {
  const oscuro = matPlastico('#2A303C', { roughness: 0.7 });
  const interior = matPlastico('#262B35');
  grupoCaso.add(en(caja(34, 34, 0.5, interior), 0, -2, -0.9));
  grupoCaso.add(en(caja(34, 0.6, 9, oscuro), 0, 15.3, 3.55));
  grupoCaso.add(en(caja(34, 0.6, 9, oscuro), 0, -19.3, 3.55));
  grupoCaso.add(en(caja(0.6, 34.6, 9, oscuro), -17.3, -2, 3.55));
  const cristal = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 34, 9),
    new THREE.MeshPhysicalMaterial({ color: '#9FB3CC', transparent: true, opacity: 0.12, roughness: 0.05 })
  );
  cristal.position.set(17.3, -2, 3.55);
  grupoCaso.add(cristal);
  grupoCaso.add(en(caja(0.6, 34.6, 9, oscuro), 17.3, -2, 3.55));
}

function construirTablero() {
  const tex = texturaPlaca();
  const cara = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.05 });
  const canto = matPlastico('#1B2F25');
  const placa = new THREE.Mesh(new THREE.BoxGeometry(30, 24, 0.16), [canto, canto, canto, canto, cara, canto]);
  placa.position.z = -0.08;
  placa.castShadow = true;
  placa.receiveShadow = true;
  grupoTablero.add(placa);

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

  if (p.kind === 'cpu') {
    g.add(caja(3.9, 3.9, 0.35, matMetal(p.color)));
    g.add(en(caja(2.6, 2.6, 0.04, matMetal('#8E97A8')), 0, 0, 0.19));
  }

  if (p.kind === 'ram') {
    g.add(en(caja(0.45, 13, 1.0, matNegro), 0, 0, 0));
    g.add(en(caja(0.47, 2.2, 1.02, matPlastico('#5E81AC', { emissive: '#000', roughness: 0.4 })), 0, 4.8, 0));
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
    g.add(en(caja(1.0, 1.3, 0.5, matNegro), 4.6, 1.6, 1.25));
  }

  if (p.kind === 'nvme') {
    g.add(caja(7.9, 2.2, 0.25, matPlastico(p.color)));
    g.add(en(caja(1.6, 1.2, 0.12, matNegro), -2.2, 0, 0.18));
  }

  if (p.kind === 'psu') {
    g.add(caja(16, 6.5, 7, matPlastico('#1E222A', { roughness: 0.5 })));
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

function posicionDe(id) {
  const p = pieza(id);
  if (p.kind === 'cpu') return { x: SLOTS[S.placed[id]].x, y: SLOTS[S.placed[id]].y, z: 0.175 };
  if (p.kind === 'ram') return { x: SLOTS[S.placed[id]].x, y: SLOTS[S.placed[id]].y, z: 0.5 };
  if (p.kind === 'gpu') return { x: SLOTS.pcie.x, y: SLOTS.pcie.y + 2.3, z: 1.6 };
  if (p.kind === 'nvme') return { x: SLOTS.m2.x, y: SLOTS.m2.y, z: 0.125 };
  if (p.kind === 'psu') return { x: SLOTS.psu.x, y: SLOTS.psu.y, z: 3.5 };
  return { x: 0, y: 0, z: 0 };
}

function puertoRect(pid) {
  const p = PORTS[pid];
  if (!p.relativo) return { x: p.x, y: p.y, w: p.w, h: p.h, z: p.z };
  const gpu = posicionDe('gpu');
  return { x: gpu.x + p.dx, y: gpu.y + p.dy, w: p.w, h: p.h, z: 2.7 };
}

function puertoVisible(pid) {
  return placed(NECESITA[pid]);
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
function fallo(msg) { S.errores++; log('bad', msg); }
function ok(msg) { log('ok', msg); }

function intentarColocar(p, x, y) {
  const sid = huecoEn(x, y, p);
  if (!sid) return;
  if (p.kind !== 'board' && !placed('board')) {
    return fallo('Primero fija la placa base en el chasis: sin ella no hay dónde montar el resto.');
  }
  if (occupied(sid)) return fallo(`El ${SLOTS[sid].nombre} ya está ocupado.`);
  if (p.kind === 'cpu' && p.socket !== BOARD.socket) {
    return fallo(`${p.nombre} no encaja: es para socket ${p.socket} y la placa tiene ${BOARD.socket}. Cada socket admite solo sus familias de procesador (apuntes S11).`);
  }
  if (p.kind === 'ram' && p.gen !== BOARD.gen) {
    return fallo(`${p.nombre} no entra en una placa ${BOARD.gen}: las ranuras son distintas según la generación (apuntes S11).`);
  }
  if (p.kind === 'psu' && p.watts < NECESARIO) {
    return fallo(`La fuente de ${p.watts} W se queda corta: el equipo necesita al menos ${NECESARIO} W, según (TDP CPU + TDP GPU + 100 W) × 1,3 (apuntes S11).`);
  }
  S.placed[p.id] = sid;
  const mensajes = {
    board: 'Placa fijada en el chasis: los separadores evitan que toque la caja (apuntes S08).',
    cpu: 'Procesador asentado en el socket AM4.',
    ram: `${p.nombre} instalado en la ranura.`,
    gpu: 'Tarjeta gráfica en la ranura PCIe x16.',
    nvme: 'SSD NVMe en la ranura M.2.',
    psu: `Fuente de ${p.watts} W: suficiente para los ${NECESARIO} W que necesita el equipo.`
  };
  ok(mensajes[p.kind]);
}

function intentarConectar(c, x, y) {
  const pid = puertoEn(x, y);
  if (!pid) return;
  if (c.port !== pid) {
    return fallo(`${c.nombre} no encaja en el conector ${PORTS[pid].etiqueta}: el número de pines y la forma son distintos (apuntes S07).`);
  }
  if (!placed('psu')) return fallo('Antes de conectar los cables, instala la fuente: de ella salen.');
  if (Object.values(S.plugged).includes(pid)) return fallo(`El conector ${PORTS[pid].etiqueta} ya tiene un cable.`);
  S.plugged[c.id] = pid;
  ok(`${c.nombre} conectado.`);
}

function encender() {
  if (S.final) return;
  const pendientes = PASOS.slice(0, -1).filter((p) => !p.hecho());
  if (pendientes.length) {
    S.errores++;
    log('bad', `El equipo no arranca. Falta: ${pendientes[0].txt}`);
    CABLES.filter((c) => !plugged(c.id)).forEach((c) => log('info', EXPLICA[c.id]));
    pintarPanel();
    return;
  }
  S.final = true;
  log('ok', `El equipo arranca y la BIOS muestra la pantalla POST. Errores durante el montaje: ${S.errores}.`);
  for (const ledMat of ledMats) ledMat.emissiveIntensity = 2.2;
  pintarPanel();
  pintarEscena();
}

function reiniciar() {
  S = { placed: {}, plugged: {}, errores: 0, final: false };
  entradas = [];
  for (const ledMat of ledMats) ledMat.emissiveIntensity = 0.9;
  pintarEscena();
  log('info', 'Montaje nuevo. Empieza arrastrando la placa base al chasis.');
}

function pintarPanel() {
  const i = PASOS.findIndex((p) => !p.hecho());
  objEl.textContent = i < 0 ? 'Equipo montado' : PASOS[i].txt;
  const paso = i < 0 ? PASOS.length : i + 1;
  progEl.textContent = `Paso ${paso} de ${PASOS.length} · Errores: ${S.errores}`;
}

// ---------- Bandeja ----------
function pintarBandeja() {
  bandeja.querySelectorAll('.ficha').forEach((el) => el.remove());
  const items = [
    ...PIEZAS.filter((p) => !placed(p.id)).map((p) => ({ id: p.id, tipo: 'parte', corto: p.corto, color: p.color })),
    ...CABLES.filter((c) => !plugged(c.id)).map((c) => ({ id: c.id, tipo: 'cable', corto: c.corto, color: c.color }))
  ];
  for (const it of items) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'ficha';
    el.dataset.id = it.id;
    el.dataset.tipo = it.tipo;
    el.innerHTML = `<i style="background:${it.color}"></i>${it.corto}`;
    bandeja.appendChild(el);
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
  for (const [id, m] of Object.entries(guiaSlot)) {
    const s = SLOTS[id];
    const relevante = id === 'board' ? !placed('board') : (placed('board') || id === 'psu') && !occupied(id);
    m.visible = relevante;
    m.material.opacity = hover === id ? 0.6 : 0.16;
    m.position.set(s.x, s.y, 0.06);
  }
  for (const [pid, m] of Object.entries(guiaPort)) {
    const visible = puertoVisible(pid) && !Object.values(S.plugged).includes(pid);
    m.visible = visible;
    if (visible) {
      const r = puertoRect(pid);
      m.position.set(r.x, r.y, r.z + 0.06);
      m.scale.set(r.w + 0.6, r.h + 0.6, 1);
      m.material.opacity = hover === pid ? 0.6 : 0.16;
    }
  }
}

// ---------- Dibujo de piezas montadas ----------
function pintarEscena() {
  grupoTablero.visible = placed('board');

  grupoPiezas.clear();
  fans.length = 0;
  for (const id of Object.keys(S.placed)) {
    if (id === 'board') continue;
    grupoPiezas.add(construirPieza(pieza(id), posicionDe(id)));
  }

  grupoCables.clear();
  for (const c of CABLES) {
    const pid = S.plugged[c.id];
    if (!pid) continue;
    const r = puertoRect(pid);
    const puntos = [...RUTAS[c.id], [r.x, r.y, r.z]].map((p) => new THREE.Vector3(...p));
    const curva = new THREE.CatmullRomCurve3(puntos, false, 'catmullrom', 0.3);
    const tubo = new THREE.Mesh(
      new THREE.TubeGeometry(curva, 140, 0.16, 10, false),
      new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.5 })
    );
    tubo.castShadow = true;
    grupoCables.add(tubo);
    const conector = caja(r.w, r.h, 0.4, matPlastico(c.color));
    conector.position.set(r.x, r.y, r.z + 0.2);
    grupoCables.add(conector);
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
  arrastre = { id: el.dataset.id, tipo: el.dataset.tipo, el };
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
    hover = arrastre.tipo === 'cable' ? puertoEn(p.x, p.y) : huecoEn(p.x, p.y, pieza(arrastre.id));
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
    if (p) {
      if (a.tipo === 'cable') intentarConectar(cable(a.id), p.x, p.y);
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
  renderer.render(scene, camera);
});

// ---------- Inicio ----------
construirCaso();
construirTablero();
construirGuias();
ajustarTamano();
reiniciar();

$('encender').addEventListener('click', encender);
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
