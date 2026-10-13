// Punto de entrada del montaje: une los módulos, arrastre con ratón e inicio.
import * as THREE from 'three';
import { CABLES } from './catalogo.js';
import { SLOTS, SALIDA_CABLE, ALTURA_CABLE } from './geometria.js';
import { hooks, esFacil, cable, estado, pieza, piezaPlacada, tabla } from './estado.js';
import { $, bandeja, botonesModo, fantasma } from './dom.js';
import { actualizarGuias, ajustarTamano, caja, camera, conectorCable, construirCaso, construirGuias, construirPieza, construirTablero, dibujarPrevia, fans, grupoCables, grupoCaso, grupoPiezas, grupoTablero, huecoEn, ledMats, modelosListos, posicionDe, puertoEn, puertoRect, puntosCable, renderer, tuboCable, vaciar, claveTablero } from './escena.js';
import { encender, intentarColocar, intentarConectar, log, pintarPanel, reiniciar, comprobarConexiones, comprobarFuente } from './juego.js';
import { pintarBandeja } from './bandeja.js';

// ---------- Dibujo de piezas montadas ----------
function pintarEscena() {
  ledMats.length = 0;
  fans.length = 0;
  const cajaPuesta = piezaPlacada('caja');
  estado.rgbActivo = !!cajaPuesta?.rgb;
  vaciar(grupoCaso);
  grupoCaso.visible = !!cajaPuesta;
  if (cajaPuesta) construirCaso(cajaPuesta);

  const placa = tabla();
  if (placa && estado.tableroId !== claveTablero(placa, esFacil())) construirTablero(placa, esFacil());
  grupoTablero.visible = !!placa;

  vaciar(grupoPiezas);
  for (const id of Object.keys(estado.S.placed)) {
    if (pieza(id).kind === 'board' || pieza(id).kind === 'caja') continue;
    grupoPiezas.add(construirPieza(pieza(id), posicionDe(id)));
  }
  ledMats.forEach((mat, n) => { mat.userData.desfase = (n * 0.17) % 1; });
  for (const mat of ledMats) mat.emissiveIntensity = estado.S.final ? 2.2 : 0.9;

  vaciar(grupoCables);
  estado.vistaPrevia = null;
  for (const c of CABLES) {
    const conexion = estado.S.plugged[c.id];
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
  estado.arrastre = { id: el.dataset.id, tipo: el.dataset.tipo, el, ruta: null };
  if (estado.arrastre.tipo === 'cable') estado.arrastre.ruta = [SALIDA_CABLE[estado.arrastre.id]];
  el.style.opacity = '0.4';
  fantasma.textContent = el.textContent;
  fantasma.style.display = 'block';
  moverFantasma(e.clientX, e.clientY);
});

window.addEventListener('pointermove', (e) => {
  if (!estado.arrastre) return;
  moverFantasma(e.clientX, e.clientY);
  const p = puntoEnPlaca(e.clientX, e.clientY);
  let hover = null;
  if (p) {
    if (estado.arrastre.tipo === 'cable') {
      hover = puertoEn(p.x, p.y);
      // El cable se mantiene dentro de la placa: los puntos fuera se llevan al borde.
      const q = { x: Math.min(14.5, Math.max(-14.5, p.x)), y: Math.min(11.5, Math.max(-11.5, p.y)) };
      const ultimo = estado.arrastre.ruta[estado.arrastre.ruta.length - 1];
      if (Math.hypot(q.x - ultimo[0], q.y - ultimo[1]) > 0.5) estado.arrastre.ruta.push([q.x, q.y, ALTURA_CABLE]);
      dibujarPrevia(estado.arrastre, q);
    } else {
      hover = huecoEn(p.x, p.y, pieza(estado.arrastre.id));
    }
  }
  actualizarGuias(hover);
});

function terminarArrastre(e, cancelado) {
  if (!estado.arrastre) return;
  const a = estado.arrastre;
  estado.arrastre = null;
  fantasma.style.display = 'none';
  if (!cancelado) {
    const p = puntoEnPlaca(e.clientX, e.clientY);
    if (a.tipo === 'cable' && !p) log('info', `${cable(a.id).nombre} vuelve a la bandeja: suéltalo sobre su conector.`);
    if (p) {
      if (a.tipo === 'cable') intentarConectar(cable(a.id), p.x, p.y, a.ruta);
      else intentarColocar(pieza(a.id), p.x, p.y);
    } else if (a.tipo !== 'cable') {
      log('info', 'Suelta la pieza sobre el chasis para colocarla.');
    }
  }
  pintarEscena();
}

window.addEventListener('pointerup', (e) => terminarArrastre(e, false));
window.addEventListener('pointercancel', (e) => terminarArrastre(e, true));

// ---------- Inicio ----------
construirGuias();
ajustarTamano();
hooks.pintarEscena = pintarEscena;
reiniciar();
modelosListos.then(() => pintarEscena());

$('encender').addEventListener('click', encender);
$('comprobarConexiones').addEventListener('click', comprobarConexiones);
$('comprobarFuente').addEventListener('click', comprobarFuente);
for (const b of botonesModo) {
  b.addEventListener('click', () => {
    estado.modo = b.dataset.modo;
    for (const o of botonesModo) o.setAttribute('aria-pressed', String(o === b));
    reiniciar();
  });
}
botonesModo.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === estado.modo)));
$('reiniciar').addEventListener('click', reiniciar);
$('tema').addEventListener('click', () => {
  const root = document.documentElement;
  const nuevo = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nuevo;
  try { localStorage.setItem('temario-tema', nuevo); } catch (_) {}
});

// Ayudas para pruebas automáticas: coordenadas de pantalla de huecos y puertos.
window.montaje = {
  estado: () => JSON.parse(JSON.stringify(estado.S)),
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
