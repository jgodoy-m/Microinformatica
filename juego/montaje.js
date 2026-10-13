(() => {
  'use strict';

  const svg = document.getElementById('escena');
  const logEl = document.getElementById('log');
  const objEl = document.getElementById('objetivo');
  const progEl = document.getElementById('progreso');
  const $ = (id) => document.getElementById(id);

  // Valores de los apuntes: socket y memoria de la placa, y la fórmula de potencia de S11.
  const BOARD = { socket: 'AM4', gen: 'DDR4' };
  const TDP_CPU = 105;
  const TDP_GPU = 150;
  const NECESARIO = Math.ceil((TDP_CPU + TDP_GPU + 100) * 1.3);

  // Huecos del chasis en coordenadas del mundo (viewBox 1000 x 620).
  const SLOTS = {
    board: { x: 400, y: 90, w: 380, h: 300, accepts: ['board'], nombre: 'anclaje de la placa base' },
    cpu:   { x: 520, y: 150, w: 110, h: 110, accepts: ['cpu'], nombre: 'socket del procesador' },
    ram1:  { x: 650, y: 120, w: 14, h: 120, accepts: ['ram'], nombre: 'ranura de memoria' },
    ram2:  { x: 672, y: 120, w: 14, h: 120, accepts: ['ram'], nombre: 'ranura de memoria' },
    pcie:  { x: 470, y: 360, w: 250, h: 18, accepts: ['gpu'], nombre: 'ranura PCIe x16' },
    m2:    { x: 420, y: 250, w: 100, h: 14, accepts: ['nvme'], nombre: 'ranura M.2' },
    psu:   { x: 270, y: 440, w: 200, h: 130, accepts: ['psu'], nombre: 'hueco de la fuente' }
  };

  // Conectores de la placa y de la GPU. Cada uno necesita que su pieza esté montada.
  const NECESITA = { atx24: 'board', eps8: 'board', pcie8: 'gpu' };
  const PORTS = {
    atx24: { x: 742, y: 120, w: 28, h: 70, etiqueta: 'ATX 24' },
    eps8:  { x: 420, y: 100, w: 40, h: 24, etiqueta: 'EPS 8' },
    pcie8: { x: 690, y: 284, w: 18, h: 22, etiqueta: 'PCIe 6+2' }
  };

  // escala: tamaño en la bandeja. Las piezas con distractor son incorrectas a propósito.
  const PIEZAS = [
    { id: 'board', kind: 'board', nombre: 'Placa base ATX (AM4, DDR4)', corto: 'Placa AM4', w: 380, h: 300, escala: 0.25 },
    { id: 'cpu', kind: 'cpu', nombre: 'Procesador AM4 (105 W)', corto: 'CPU AM4', socket: 'AM4', w: 110, h: 110, escala: 0.5 },
    { id: 'cpu-x', kind: 'cpu', nombre: 'Procesador AM5 (105 W)', corto: 'CPU AM5', socket: 'AM5', w: 110, h: 110, escala: 0.5 },
    { id: 'ram-a', kind: 'ram', nombre: 'Módulo RAM DDR4', corto: 'RAM DDR4', gen: 'DDR4', w: 14, h: 120, escala: 0.6 },
    { id: 'ram-b', kind: 'ram', nombre: 'Módulo RAM DDR4', corto: 'RAM DDR4', gen: 'DDR4', w: 14, h: 120, escala: 0.6 },
    { id: 'ram-x', kind: 'ram', nombre: 'Módulo RAM DDR5', corto: 'RAM DDR5', gen: 'DDR5', w: 14, h: 120, escala: 0.6 },
    { id: 'gpu', kind: 'gpu', nombre: 'Tarjeta gráfica (150 W)', corto: 'GPU', w: 250, h: 80, escala: 0.4 },
    { id: 'nvme', kind: 'nvme', nombre: 'SSD NVMe M.2', corto: 'SSD NVMe', w: 100, h: 14, escala: 1 },
    { id: 'psu', kind: 'psu', nombre: 'Fuente de 650 W', corto: 'Fuente 650 W', watts: 650, w: 200, h: 130, escala: 0.4 },
    { id: 'psu-x', kind: 'psu', nombre: 'Fuente de 450 W', corto: 'Fuente 450 W', watts: 450, w: 200, h: 130, escala: 0.4 }
  ];

  const CABLES = [
    { id: 'c-atx', nombre: 'Cable ATX 24 pines', corto: 'ATX 24', port: 'atx24', color: '#D08770' },
    { id: 'c-eps', nombre: 'Cable EPS 8 pines', corto: 'EPS 8', port: 'eps8', color: '#EBCB8B' },
    { id: 'c-pcie', nombre: 'Cable PCIe 6+2 pines', corto: 'PCIe 6+2', port: 'pcie8', color: '#B48EAD' }
  ];

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

  const CASO = `
    <rect x="250" y="30" width="700" height="560" rx="16" fill="#242933" stroke="#596579" stroke-width="2"/>
    <rect x="268" y="48" width="664" height="524" rx="10" fill="#2E3440"/>
    <text x="600" y="72" text-anchor="middle" font-size="12" fill="#D8DEE9">Chasis ATX · vista interior</text>`;

  // ---------- Estado ----------
  let S;
  let entradas = [];
  let arrastre = null;

  const placed = (id) => id in S.placed;
  const plugged = (id) => id in S.plugged;
  const occupied = (slotId) => Object.values(S.placed).includes(slotId);
  const pieza = (id) => PIEZAS.find((p) => p.id === id);
  const cable = (id) => CABLES.find((c) => c.id === id);

  function reiniciar() {
    S = { placed: {}, plugged: {}, errores: 0, final: false };
    entradas = [];
    render();
    log('info', 'Montaje nuevo. Empieza arrastrando la placa base al chasis.');
  }

  // ---------- Registro y mensajes ----------
  function log(tipo, msg) {
    entradas.unshift({ tipo, msg });
    entradas = entradas.slice(0, 40);
    logEl.innerHTML = entradas.map((e) => `<li class="${e.tipo}">${e.msg}</li>`).join('');
  }
  function fallo(msg) { S.errores++; log('bad', msg); }
  function ok(msg) { log('ok', msg); }

  function pintarPanel() {
    const i = PASOS.findIndex((p) => !p.hecho());
    objEl.textContent = i < 0 ? 'Equipo montado' : PASOS[i].txt;
    const paso = i < 0 ? PASOS.length : i + 1;
    progEl.textContent = `Paso ${paso} de ${PASOS.length} · Errores: ${S.errores}`;
  }

  // ---------- Geometría ----------
  function slotAt(x, y, it) {
    let libre = null, distLibre = Infinity;
    let ocupado = null, distOcupado = Infinity;
    for (const [id, s] of Object.entries(SLOTS)) {
      if (!s.accepts.includes(it.kind)) continue;
      if (x < s.x - 24 || x > s.x + s.w + 24 || y < s.y - 24 || y > s.y + s.h + 24) continue;
      const d = Math.hypot(x - (s.x + s.w / 2), y - (s.y + s.h / 2));
      if (occupied(id)) {
        if (d < distOcupado) { distOcupado = d; ocupado = id; }
      } else if (d < distLibre) {
        distLibre = d; libre = id;
      }
    }
    return libre ?? ocupado;
  }

  function portVisible(id) { return placed(NECESITA[id]); }

  function portAt(x, y) {
    for (const [id, p] of Object.entries(PORTS)) {
      if (!portVisible(id)) continue;
      if (x >= p.x - 12 && x <= p.x + p.w + 12 && y >= p.y - 12 && y <= p.y + p.h + 12) return id;
    }
    return null;
  }

  function ancla(id) {
    const s = SLOTS[S.placed[id]];
    if (id === 'gpu') return { x: s.x, y: s.y - 80 };
    return { x: s.x, y: s.y };
  }

  // ---------- Reglas del montaje ----------
  function intentarColocar(part, x, y) {
    const sid = slotAt(x, y, part);
    if (!sid) return;
    if (part.kind !== 'board' && !placed('board')) {
      return fallo('Primero fija la placa base en el chasis: sin ella no hay dónde montar el resto.');
    }
    if (occupied(sid)) return fallo(`El ${SLOTS[sid].nombre} ya está ocupado.`);

    if (part.kind === 'cpu' && part.socket !== BOARD.socket) {
      return fallo(`${part.nombre} no encaja: es para socket ${part.socket} y la placa tiene ${BOARD.socket}. Cada socket admite solo sus familias de procesador (apuntes S11).`);
    }
    if (part.kind === 'ram' && part.gen !== BOARD.gen) {
      return fallo(`${part.nombre} no entra en una placa ${BOARD.gen}: las ranuras son distintas según la generación (apuntes S11).`);
    }
    if (part.kind === 'psu' && part.watts < NECESARIO) {
      return fallo(`La fuente de ${part.watts} W se queda corta: el equipo necesita al menos ${NECESARIO} W, según (TDP CPU + TDP GPU + 100 W) × 1,3 (apuntes S11).`);
    }

    S.placed[part.id] = sid;
    const mensajes = {
      board: 'Placa fijada en el chasis: los separadores evitan que toque la caja (apuntes S08).',
      cpu: 'Procesador asentado en el socket AM4.',
      ram: `${part.nombre} instalado en la ranura.`,
      gpu: 'Tarjeta gráfica en la ranura PCIe x16.',
      nvme: 'SSD NVMe en la ranura M.2.',
      psu: `Fuente de ${part.watts} W: suficiente para los ${NECESARIO} W que necesita el equipo.`
    };
    ok(mensajes[part.kind]);
  }

  function intentarConectar(cab, x, y) {
    const pid = portAt(x, y);
    if (!pid) return;
    if (cab.port !== pid) {
      return fallo(`${cab.nombre} no encaja en el conector ${PORTS[pid].etiqueta}: el número de pines y la forma son distintos (apuntes S07).`);
    }
    if (!placed('psu')) return fallo('Antes de conectar los cables, instala la fuente: de ella salen.');
    if (Object.values(S.plugged).includes(pid)) return fallo(`El conector ${PORTS[pid].etiqueta} ya tiene un cable.`);
    S.plugged[cab.id] = pid;
    ok(`${cab.nombre} conectado.`);
  }

  function encender() {
    if (S.final) return;
    const pendientes = PASOS.slice(0, -1).filter((p) => !p.hecho());
    if (pendientes.length) {
      S.errores++;
      log('bad', `El equipo no arranca. Falta: ${pendientes[0].txt}`);
      CABLES.filter((c) => !S.plugged[c.id]).forEach((c) => log('info', EXPLICA[c.id]));
      pintarPanel();
      return;
    }
    S.final = true;
    log('ok', `El equipo arranca y la BIOS muestra la pantalla POST. Errores durante el montaje: ${S.errores}.`);
    pintarPanel();
    render();
  }

  // ---------- Dibujo ----------
  const pines = (x0, y0, nx, ny, paso, r, color) => {
    let s = '';
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        s += `<circle cx="${x0 + i * paso}" cy="${y0 + j * paso}" r="${r}" fill="${color}"/>`;
      }
    }
    return s;
  };

  const ARTE = {
    board: () => `
      <rect width="380" height="300" rx="8" fill="#4C6A8C" stroke="#2E3440" stroke-width="2"/>
      <path d="M24 288H356M30 22H250M300 262V180M150 40V150" stroke="#5E81AC" stroke-width="2" fill="none" opacity=".7"/>
      <rect x="116" y="56" width="118" height="118" rx="4" fill="#242933"/>
      <rect x="120" y="60" width="110" height="110" rx="3" fill="#434C5E"/>
      <text x="175" y="48" text-anchor="middle" font-size="10" fill="#ECEFF4">AM4</text>
      <rect x="20" y="40" width="60" height="80" rx="4" fill="#596579"/>
      <path d="M24 50H76M24 62H76M24 74H76M24 86H76M24 98H76M24 110H76" stroke="#434C5E" stroke-width="2"/>
      <rect x="250" y="30" width="14" height="120" rx="2" fill="#2E3440"/>
      <rect x="272" y="30" width="14" height="120" rx="2" fill="#2E3440"/>
      <text x="264" y="22" text-anchor="middle" font-size="10" fill="#ECEFF4">DDR4</text>
      <rect x="170" y="190" width="70" height="60" rx="4" fill="#596579"/>
      <rect x="70" y="270" width="250" height="18" rx="2" fill="#2E3440"/>
      <rect x="20" y="160" width="100" height="14" rx="2" fill="#2E3440"/>
      <text x="70" y="152" text-anchor="middle" font-size="9" fill="#ECEFF4">M.2</text>
      <rect x="20" y="10" width="40" height="24" rx="2" fill="#242933"/>
      <text x="40" y="26" text-anchor="middle" font-size="8" fill="#ECEFF4">EPS</text>
      <rect x="342" y="30" width="28" height="70" rx="2" fill="#242933"/>
      <text x="356" y="112" text-anchor="middle" font-size="8" fill="#ECEFF4">ATX</text>`,
    cpu: () => `
      <rect width="110" height="110" rx="6" fill="#D8DEE9" stroke="#4C566A" stroke-width="2"/>
      ${pines(9, 9, 10, 10, 10, 1.6, '#4C566A')}
      <rect x="34" y="34" width="42" height="42" rx="3" fill="#434C5E"/>
      <text x="55" y="60" text-anchor="middle" font-size="10" fill="#ECEFF4">CPU</text>`,
    ram: () => `
      <rect width="14" height="120" rx="1.5" fill="#5E81AC" stroke="#2E3440"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="3" y="${6 + i * 13}" width="8" height="7" rx="1" fill="#2E3440"/>`).join('')}
      <rect x="0" y="112" width="14" height="8" fill="#EBCB8B"/>`,
    gpu: () => `
      <rect width="250" height="80" rx="8" fill="#434C5E" stroke="#2E3440" stroke-width="2"/>
      <text x="125" y="16" text-anchor="middle" font-size="11" fill="#ECEFF4">GPU · 150 W</text>
      <circle cx="70" cy="46" r="26" fill="#3B4252" stroke="#88C0D0" stroke-width="2"/>
      <circle cx="70" cy="46" r="5" fill="#88C0D0"/>
      <circle cx="180" cy="46" r="26" fill="#3B4252" stroke="#88C0D0" stroke-width="2"/>
      <circle cx="180" cy="46" r="5" fill="#88C0D0"/>
      <rect x="220" y="4" width="18" height="22" rx="2" fill="#242933"/>
      <rect x="20" y="74" width="210" height="6" fill="#EBCB8B"/>`,
    nvme: () => `
      <rect width="100" height="14" rx="2" fill="#A3BE8C" stroke="#2E3440"/>
      <rect x="10" y="3" width="22" height="8" rx="1" fill="#2E3440"/>
      <rect x="70" y="3" width="20" height="8" rx="1" fill="#2E3440"/>`,
    psu: (watts) => `
      <rect width="200" height="130" rx="8" fill="#4C566A" stroke="#2E3440" stroke-width="2"/>
      <text x="100" y="26" text-anchor="middle" font-size="16" font-weight="700" fill="#ECEFF4">${watts} W</text>
      <circle cx="100" cy="78" r="42" fill="#3B4252" stroke="#88C0D0" stroke-width="2"/>
      <circle cx="100" cy="78" r="8" fill="#88C0D0"/>`,
    cable: (color) => `
      <rect width="40" height="22" rx="3" fill="${color}" stroke="#2E3440" stroke-width="1.5"/>
      <rect x="8" y="6" width="24" height="10" rx="1" fill="#2E3440"/>`
  };

  function arte(it) {
    if (it.tipo === 'cable') return ARTE.cable(it.color);
    if (it.kind === 'psu') return ARTE.psu(it.watts);
    return ARTE[it.kind]();
  }

  function itemDe(id, tipo) {
    if (tipo === 'cable') {
      const c = cable(id);
      return { ...c, tipo, kind: 'cable', w: 40, h: 22, escala: 1 };
    }
    return { ...pieza(id), tipo: 'parte' };
  }

  function tableroHTML() {
    return placed('board') ? `<g transform="translate(400,90)">${ARTE.board()}</g>` : '';
  }

  function piezasHTML() {
    return Object.keys(S.placed)
      .filter((id) => id !== 'board')
      .map((id) => {
        const a = ancla(id);
        return `<g transform="translate(${a.x},${a.y})">${arte(itemDe(id, 'parte'))}</g>`;
      })
      .join('');
  }

  // Recorridos de cada cable desde la fuente hasta su conector, por el espacio libre del chasis.
  const RUTAS = {
    'c-eps': 'M300 436 V112 H418',
    'c-atx': 'M460 436 H905 V155 H770',
    'c-pcie': 'M430 436 V415 H860 V295 H708'
  };

  function cablesHTML() {
    let out = '';
    for (const c of CABLES) {
      const pid = S.plugged[c.id];
      if (!pid) continue;
      const p = PORTS[pid];
      out += `<path d="${RUTAS[c.id]}" fill="none" stroke="${c.color}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`;
      out += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="3" fill="${c.color}" stroke="#2E3440" stroke-width="2"/>`;
    }
    return out;
  }

  function huecosHTML(hover) {
    let out = '';
    for (const [id, s] of Object.entries(SLOTS)) {
      if (occupied(id)) continue;
      if (id !== 'board' && id !== 'psu' && !placed('board')) continue;
      const hl = hover === id;
      out += `<rect x="${s.x - 3}" y="${s.y - 3}" width="${s.w + 6}" height="${s.h + 6}" rx="4" fill="${hl ? 'rgba(235,203,139,.25)' : 'none'}" stroke="${hl ? '#EBCB8B' : '#88C0D0'}" stroke-width="${hl ? 3 : 2}" stroke-dasharray="${hl ? '0' : '6 5'}"/>`;
    }
    for (const [id, p] of Object.entries(PORTS)) {
      if (!portVisible(id)) continue;
      if (Object.values(S.plugged).includes(id)) continue;
      const hl = hover === id;
      out += `<rect x="${p.x - 3}" y="${p.y - 3}" width="${p.w + 6}" height="${p.h + 6}" rx="4" fill="${hl ? 'rgba(235,203,139,.25)' : 'none'}" stroke="#EBCB8B" stroke-width="${hl ? 3 : 2}" stroke-dasharray="4 3"/>`;
    }
    return out;
  }

  function bandejaHTML() {
    const items = [
      ...PIEZAS.filter((p) => !placed(p.id)).map((p) => ({ ...p, tipo: 'parte' })),
      ...CABLES.filter((c) => !plugged(c.id)).map((c) => ({ ...c, tipo: 'cable', kind: 'cable', w: 40, h: 22, escala: 1 }))
    ];
    const cols = [20, 122];
    const cur = [44, 44];
    const colW = 92;
    let out = `<rect x="10" y="16" width="226" height="590" rx="12" style="fill:var(--surface);stroke:var(--border)"/>`;
    out += `<text x="24" y="36" font-size="12" font-weight="700" style="fill:var(--muted)">Piezas y cables</text>`;
    for (const it of items) {
      const c = cur[0] <= cur[1] ? 0 : 1;
      const s = Math.min(it.escala, colW / it.w);
      const iw = it.w * s;
      const ih = it.h * s;
      const x = cols[c] + (colW - iw) / 2;
      const y = cur[c];
      out += `<g data-drag="${it.id}" data-tipo="${it.tipo}" class="pieza" transform="translate(${x},${y}) scale(${s})">${arte(it)}</g>`;
      out += `<text x="${cols[c] + colW / 2}" y="${y + ih + 14}" text-anchor="middle" font-size="10" style="fill:var(--text)">${it.corto}</text>`;
      cur[c] += ih + 32;
    }
    return out;
  }

  function pintarEscena() {
    $('g-caso').innerHTML = CASO;
    $('g-tablero').innerHTML = tableroHTML();
    $('g-piezas').innerHTML = piezasHTML();
    $('g-cables').innerHTML = cablesHTML();
    $('g-huecos').innerHTML = huecosHTML(null);
    $('g-bandeja').innerHTML = bandejaHTML();
    $('g-arrastre').innerHTML = '';
    pintarPanel();
  }

  function render() { pintarEscena(); }

  // ---------- Arrastre ----------
  function mundo(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function mover(e) {
    const p = mundo(e);
    const it = itemDe(arrastre.id, arrastre.tipo);
    $('g-arrastre').innerHTML = `<g transform="translate(${p.x - it.w / 2},${p.y - it.h / 2})" style="pointer-events:none;opacity:.92">${arte(it)}</g>`;
    const hover = arrastre.tipo === 'cable' ? portAt(p.x, p.y) : slotAt(p.x, p.y, it);
    $('g-huecos').innerHTML = huecosHTML(hover);
  }

  function soltar(a, p) {
    if (a.tipo === 'cable') intentarConectar(cable(a.id), p.x, p.y);
    else intentarColocar(pieza(a.id), p.x, p.y);
  }

  svg.addEventListener('pointerdown', (e) => {
    if (S.final) return;
    const el = e.target.closest('[data-drag]');
    if (!el) return;
    e.preventDefault();
    svg.setPointerCapture(e.pointerId);
    arrastre = { id: el.dataset.drag, tipo: el.dataset.tipo };
    el.style.opacity = '0.35';
    mover(e);
  });

  svg.addEventListener('pointermove', (e) => {
    if (arrastre) mover(e);
  });

  function terminar(e, cancelar) {
    if (!arrastre) return;
    const a = arrastre;
    arrastre = null;
    if (!cancelar) soltar(a, mundo(e));
    render();
  }

  svg.addEventListener('pointerup', (e) => terminar(e, false));
  svg.addEventListener('pointercancel', (e) => terminar(e, true));

  // ---------- Controles ----------
  $('encender').addEventListener('click', encender);
  $('reiniciar').addEventListener('click', reiniciar);

  $('tema').addEventListener('click', () => {
    const root = document.documentElement;
    const nuevo = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = nuevo;
    try { localStorage.setItem('temario-tema', nuevo); } catch (_) {}
  });

  reiniciar();
})();
