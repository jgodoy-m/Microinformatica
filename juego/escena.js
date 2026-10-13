// Escena 3D: chasis, placa, piezas, cables, guías y bucle de dibujo.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { longitudPuntos } from './reglas.js';
import { SLOTS, NECESITA, PORTS, SALIDA_CABLE, ALTURA_CABLE, RADIO_CABLE } from './geometria.js';
import { cable, esFacil, estado, occupied, pieza, piezaPlacada, pluggedPort, tabla } from './estado.js';
import { contenedor } from './dom.js';

// ---------- Escena 3D ----------
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
contenedor.appendChild(renderer.domElement);

export const scene = new THREE.Scene();
scene.background = new THREE.Color('#2E3440');
export const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

export const camera = new THREE.PerspectiveCamera(32, 1.6, 0.1, 300);
camera.position.set(6, 6, 84);
camera.lookAt(0, -3, 0);

export const luzPrincipal = new THREE.DirectionalLight('#ffffff', 1.3);
luzPrincipal.position.set(12, 22, 40);
luzPrincipal.castShadow = true;
luzPrincipal.shadow.mapSize.set(2048, 2048);
Object.assign(luzPrincipal.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
luzPrincipal.shadow.camera.updateProjectionMatrix();
scene.add(luzPrincipal);
scene.add(new THREE.AmbientLight('#9FB3CC', 0.25));
export const luzRim = new THREE.PointLight('#88C0D0', 40, 90);
luzRim.position.set(-22, 10, 26);
scene.add(luzRim);

export const sueloSombra = new THREE.Mesh(new THREE.PlaneGeometry(90, 60), new THREE.ShadowMaterial({ opacity: 0.35 }));
sueloSombra.rotation.x = -Math.PI / 2;
sueloSombra.position.y = -20;
sueloSombra.receiveShadow = true;
scene.add(sueloSombra);

export const grupoCaso = new THREE.Group();
export const grupoTablero = new THREE.Group();
export const grupoPiezas = new THREE.Group();
export const grupoCables = new THREE.Group();
export const grupoGuias = new THREE.Group();
scene.add(grupoCaso, grupoTablero, grupoPiezas, grupoCables, grupoGuias);

export const fans = [];
export const ledMats = [];

export const matMetal = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: 0.75, roughness: 0.3, ...extra });
export const matPlastico = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: 0.05, roughness: 0.65, ...extra });
export const matOro = new THREE.MeshStandardMaterial({ color: '#D9B25F', metalness: 1, roughness: 0.3 });
export const matNegro = matPlastico('#15181E');
export const matCable = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0 });

export function caja(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function en(obj, x, y, z) {
  obj.position.set(x, y, z);
  return obj;
}

export function ventilador(r, colorAro) {
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
    new THREE.MeshStandardMaterial({ color: estado.rgbActivo ? colorAro : '#4C566A', emissive: estado.rgbActivo ? colorAro : '#000000', emissiveIntensity: 0.9, roughness: 0.4 })
  );
  aro.position.z = 0.1;
  if (estado.rgbActivo) ledMats.push(aro.material);
  g.add(aro);
  fans.push(rotor);
  return g;
}

// Las etiquetas se crean una vez y se reutilizan (antes se creaba una textura nueva en cada acción).
export const cacheTexturas = new Map();
export function texturaTexto(texto, ancho, alto, fondo = '#20252E', color = '#ECEFF4') {
  const clave = [texto, ancho, alto, fondo, color].join('|');
  if (!cacheTexturas.has(clave)) cacheTexturas.set(clave, crearTexturaTexto(texto, ancho, alto, fondo, color));
  return cacheTexturas.get(clave);
}

export function crearTexturaTexto(texto, ancho, alto, fondo, color) {
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
export function texturaPlaca(placa) {
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

export function disipador(w, h, d, vertical) {
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
export const MODELOS = {
  // Modelos geométricos por tipo (generar_modelos.py). GPU y CPU se dibujan en código.
  'ram-ddr4': 'modelos/ram-ddr4.glb',
  'ram-ddr5': 'modelos/ram-ddr5.glb',
  nvme: 'modelos/nvme.glb',
  psu: 'modelos/psu.glb'
};
export const plantillas = {};
// Clave del modelo de una pieza, o null si no tiene modelo 3D.
export const claveModelo = (p) => {
  if (MODELOS[p.id]) return p.id;
  if (p.kind === 'ram') return p.gen === 'DDR5' ? 'ram-ddr5' : 'ram-ddr4';
  return MODELOS[p.kind] ? p.kind : null;
};
export const cargadorGlb = new GLTFLoader();
export const modelosListos = Promise.all(Object.entries(MODELOS).map(([clave, url]) => new Promise((resolver) => {
  cargadorGlb.load(url, (gltf) => {
    plantillas[clave] = gltf.scene;
    resolver();
  }, undefined, () => resolver());
}))).then(() => {});

// ---------- Construcción de la escena fija ----------
// Chasis según la caja elegida: lateral de cristal o metálico, y tiras RGB si la caja las tiene.
export function construirCaso(modelo) {
  vaciar(grupoCaso);
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
  estado.chasisId = modelo.id;
}

// La placa se reconstruye cuando cambia el modelo (color, zócalo y memoria).
export function construirTablero(placa) {
  vaciar(grupoTablero);
  estado.tableroId = placa.id;
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
export function construirPieza(p, pos) {
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
    if (ddr5 && estado.rgbActivo) {
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

// Vacía un grupo liberando las geometrías propias (las de los modelos glTF se comparten con la plantilla).
export function vaciar(grupo) {
  grupo.traverse((o) => {
    if (o.isMesh && !o.userData.compartida) o.geometry.dispose();
  });
  grupo.clear();
}

// Pieza con su modelo 3D. Los ventiladores (nodo 'Fan') giran; el aro y la tira RGB dependen de la caja.
export function construirPiezaGlb(p, g, clave) {
  const modelo = plantillas[clave].clone(true);
  modelo.traverse((o) => {
    if (!o.isMesh) return;
    o.userData.compartida = true;
    o.castShadow = true;
    o.receiveShadow = true;
    o.material = o.material.clone();
    if (o.material.name === 'Aro') {
      o.material.color.set(estado.rgbActivo ? '#88C0D0' : '#4C566A');
      o.material.emissive.set(estado.rgbActivo ? '#88C0D0' : '#000000');
      if (estado.rgbActivo) ledMats.push(o.material);
    }
    if (o.material.name === 'LED') {
      o.visible = estado.rgbActivo;
      if (estado.rgbActivo) ledMats.push(o.material);
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

export function posicionDe(id) {
  const p = pieza(id);
  if (p.kind === 'cpu') return { x: SLOTS[estado.S.placed[id]].x, y: SLOTS[estado.S.placed[id]].y, z: 0 };
  if (p.kind === 'ram') return { x: SLOTS[estado.S.placed[id]].x, y: SLOTS[estado.S.placed[id]].y, z: 0.5 };
  if (p.kind === 'gpu') return { x: SLOTS.pcie.x, y: SLOTS.pcie.y + 2.3, z: 1.6 };
  if (p.kind === 'nvme') return { x: SLOTS.m2.x, y: SLOTS.m2.y, z: 0.125 };
  if (p.kind === 'psu') return { x: SLOTS.psu.x, y: SLOTS.psu.y, z: 3.5 };
  return { x: 0, y: 0, z: 0 };
}

export function puertoRect(pid) {
  const p = PORTS[pid];
  if (!p.relativo) return { x: p.x, y: p.y, w: p.w, h: p.h, z: p.z };
  const gpu = posicionDe(piezaPlacada('gpu').id);
  return { x: gpu.x + p.dx, y: gpu.y + p.dy, w: p.w, h: p.h, z: 2.7 };
}

export function puertoVisible(pid) {
  const necesita = NECESITA[pid];
  return necesita === 'board' ? !!tabla() : !!piezaPlacada(necesita);
}

export function puertoEn(x, y) {
  for (const pid of Object.keys(PORTS)) {
    if (!puertoVisible(pid)) continue;
    const r = puertoRect(pid);
    if (Math.abs(x - r.x) <= r.w / 2 + 0.6 && Math.abs(y - r.y) <= r.h / 2 + 0.6) return pid;
  }
  return null;
}

export function huecoEn(x, y, pieza_) {
  let libre = null;
  let distLibre = Infinity;
  let ocupado = null;
  let distOcupado = Infinity;
  for (const [id, s] of Object.entries(SLOTS)) {
    if (!s.accepts.includes(pieza_.kind)) continue;
    if (Math.abs(x - s.x) > s.w / 2 + 1.2 || Math.abs(y - s.y) > s.h / 2 + 1.2) continue;
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

// ---------- Guías de hueco y puerto ----------
export const guiaSlot = {};
export const guiaPort = {};
export const materialGuia = () => new THREE.MeshBasicMaterial({ color: '#EBCB8B', transparent: true, opacity: 0, depthWrite: false });

export function construirGuias() {
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

export function actualizarGuias(hover) {
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
export function puntosCable(ruta, r) {
  const altura = Math.max(ALTURA_CABLE, r.z + 1.6);
  return [...ruta, [r.x, r.y, altura], [r.x, r.y, r.z + 1.2]];
}

// Largo del recorrido en cm (1 unidad de escena ≈ 1 cm).
export function longitudCable(ruta, r) {
  return longitudPuntos(puntosCable(ruta, r));
}

export function tuboCable(puntos, color) {
  const vectores = puntos.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const curva = new THREE.CatmullRomCurve3(vectores, false, 'centripetal');
  const tubo = new THREE.Mesh(new THREE.TubeGeometry(curva, Math.max(24, puntos.length * 10), RADIO_CABLE, 12, false), matCable(color));
  tubo.castShadow = true;
  return tubo;
}

// Conector: carcasa del color del cable, con contactos dorados en la cara superior.
export function conectorCable(color, r) {
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

export function dibujarPrevia(a, p) {
  if (estado.vistaPrevia) {
    grupoCables.remove(estado.vistaPrevia);
    estado.vistaPrevia.geometry.dispose();
  }
  const trazado = [...a.ruta, [p.x, p.y, ALTURA_CABLE]];
  let largo = 0;
  for (let i = 1; i < trazado.length; i++) largo += Math.hypot(trazado[i][0] - trazado[i - 1][0], trazado[i][1] - trazado[i - 1][1], trazado[i][2] - trazado[i - 1][2]);
  const excede = largo > cable(a.id).longitudMax;
  estado.vistaPrevia = tuboCable(trazado, excede ? '#E0868E' : cable(a.id).color);
  grupoCables.add(estado.vistaPrevia);
}

// ---------- Tamaño y bucle ----------
export function ajustarTamano() {
  const ancho = contenedor.clientWidth;
  const alto = contenedor.clientHeight;
  renderer.setSize(ancho, alto, false);
  camera.aspect = ancho / alto;
  camera.updateProjectionMatrix();
}
new ResizeObserver(ajustarTamano).observe(contenedor);

renderer.setAnimationLoop(() => {
  const velocidad = estado.S?.final ? 0.22 : 0.02;
  for (const rotor of fans) rotor.rotation.z -= velocidad;
  const ahora = performance.now();
  // Luces RGB: cada tira y cada aro cambia de color en un ciclo, con desfase propio.
  if (estado.rgbActivo) {
    for (const m of ledMats) {
      const tono = (ahora / 9000 + (m.userData.desfase ?? 0)) % 1;
      m.color.setHSL(tono, 1, 0.55);
      m.emissive.setHSL(tono, 1, 0.55);
    }
  }
  if (ahora < estado.destelloHasta) {
    const pulso = 0.5 + 0.4 * Math.sin(ahora / 120);
    for (const m of Object.values(guiaPort)) if (m.visible) m.material.opacity = pulso;
  }
  renderer.render(scene, camera);
});
