// Bandeja de piezas (agrupada) y colocación con teclado.
import { SLOTS, PORTS, SALIDA_CABLE } from './geometria.js';
import { hooks, TDP_GPU, cable, esFacil, estado, pieza, placed, plugged } from './estado.js';
import { PIEZAS, CABLES } from './catalogo.js';
import { bandeja, contenedorHuecos, teclado } from './dom.js';
import { caja, en, puertoRect, puertoVisible } from './escena.js';
import { intentarColocar, intentarConectar } from './juego.js';

// Dato técnico de cada pieza, solo en estado.modo fácil.
export function specDe(p) {
  if (p.kind === 'caja') return p.rgb ? 'Con RGB' : 'Sin RGB';
  if (p.kind === 'board') return `${p.socket} · ${p.gen}`;
  if (p.kind === 'cpu') return `${p.socket} · ${p.tdp} W`;
  if (p.kind === 'ram') return p.gen;
  if (p.kind === 'gpu') return `${TDP_GPU} W`;
  if (p.kind === 'nvme') return 'M.2';
  if (p.kind === 'psu') return `${p.watts} W`;
  return '';
}

// ---------- Teclado ----------
// Tab hasta una pieza, Intro para elegirla y después el hueco. Esc cancela.


export function objetivosDe(item) {
  if (item.tipo === 'cable') {
    return Object.keys(PORTS).filter(puertoVisible).map((pid) => {
      const r = puertoRect(pid);
      return { etiqueta: PORTS[pid].etiqueta, x: r.x, y: r.y };
    });
  }
  const p = pieza(item.id);
  return Object.entries(SLOTS)
    .filter(([, s]) => s.accepts.includes(p.kind))
    .map(([, s]) => ({ etiqueta: s.nombre, x: s.x, y: s.y }));
}

export function marcarSeleccion() {
  bandeja.querySelectorAll('.ficha').forEach((el) => {
    el.setAttribute('aria-pressed', String(!!estado.seleccion && el.dataset.id === estado.seleccion.id));
  });
}

export function pintarHuecos() {
  teclado.hidden = !estado.seleccion;
  contenedorHuecos.innerHTML = '';
  if (!estado.seleccion) return;
  for (const o of objetivosDe(estado.seleccion)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'boton';
    b.textContent = o.etiqueta;
    b.addEventListener('click', () => colocarConTeclado(o));
    contenedorHuecos.appendChild(b);
  }
}

export function colocarConTeclado(o) {
  const item = estado.seleccion;
  estado.seleccion = null;
  if (item.tipo === 'cable') intentarConectar(cable(item.id), o.x, o.y, [SALIDA_CABLE[item.id]]);
  else intentarColocar(pieza(item.id), o.x, o.y);
  hooks.pintarEscena();
}

bandeja.addEventListener('click', (e) => {
  if (e.detail !== 0) return; // solo teclado: los clics de ratón se gestionan con el estado.arrastre
  const el = e.target.closest('.ficha');
  if (!el) return;
  estado.seleccion = estado.seleccion?.id === el.dataset.id ? null : { id: el.dataset.id, tipo: el.dataset.tipo };
  pintarHuecos();
  marcarSeleccion();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && estado.seleccion) {
    estado.seleccion = null;
    pintarHuecos();
    marcarSeleccion();
  }
});

// ---------- Bandeja ----------
// Desplegables de la bandeja: uno por tipo de componente.
export const GRUPOS = {
  caja: 'Caja',
  board: 'Placa base',
  cpu: 'Procesador',
  ram: 'Memoria RAM',
  gpu: 'Tarjeta gráfica',
  nvme: 'Almacenamiento',
  psu: 'Fuente de alimentación',
  cable: 'Cables de alimentación'
};
export const abiertos = {};
// Nombres sin datos técnicos, para el estado.modo difícil.
export const NOMBRE_GENERICO = { caja: 'Caja', board: 'Placa base', cpu: 'Procesador', ram: 'Memoria RAM', gpu: 'Tarjeta gráfica', nvme: 'SSD', psu: 'Fuente de alimentación', cable: 'Cable de alimentación' };

// Modo difícil: nombre comercial si lo tiene; si no, el tipo y una letra para distinguirlas.
function nombreDificil(p) {
  if (p.comercial) return p.comercial;
  const hermanas = PIEZAS.filter((q) => q.kind === p.kind);
  const letra = String.fromCharCode(65 + hermanas.findIndex((q) => q.id === p.id));
  return `${NOMBRE_GENERICO[p.kind]} ${letra}`;
}

export function pintarBandeja() {
  bandeja.querySelectorAll('.grupo').forEach((el) => el.remove());
  const items = [
    ...PIEZAS.filter((p) => !placed(p.id)).map((p) => ({ id: p.id, kind: p.kind, tipo: 'parte', corto: p.corto, nombreDificil: nombreDificil(p), spec: specDe(p), color: p.color, foto: !p.sinFoto })),
    ...CABLES.filter((c) => !plugged(c.id)).map((c) => ({ id: c.id, kind: 'cable', tipo: 'cable', corto: c.corto, nombreDificil: c.nombre, spec: `Conector ${PORTS[c.port].etiqueta}`, color: c.color, foto: !c.sinFoto }))
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

export function pintarFicha(it, contenedorFichas) {
  {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'ficha';
    el.dataset.id = it.id;
    el.dataset.tipo = it.tipo;
    el.setAttribute('aria-pressed', String(!!estado.seleccion && estado.seleccion.id === it.id));
    const foto = it.foto ? `<img src="fotos/${it.id}.png" alt="" loading="lazy">` : '';
    const dato = esFacil() && it.spec ? `<small>${it.spec}</small>` : '';
    const nombre = esFacil() ? it.corto : it.nombreDificil;
    el.innerHTML = `<span class="miniatura">${foto}</span><span class="texto">${nombre}${dato}</span>`;
    // Sin foto (o si falla la carga): la pieza se ve con su color.
    const miniatura = el.querySelector('.miniatura');
    if (!it.foto) miniatura.style.background = it.color;
    else el.querySelector('img').addEventListener('error', () => {
      miniatura.style.background = it.color;
      miniatura.querySelector('img').remove();
    }, { once: true });
    if (esFacil() && it.tipo === 'cable' && performance.now() < estado.destelloHasta) el.classList.add('destacar');
    contenedorFichas.appendChild(el);
  }
}
