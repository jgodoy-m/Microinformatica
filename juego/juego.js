// Reglas de partida: colocar, conectar, pasos, encender, pedidos y panel.
import { CABLES, PEDIDOS, PEDIDOS_FIJOS, DIAGNOSTICOS } from './catalogo.js';
import { comprobarColocacion, puntuacionDiagnostico } from './reglas.js';
import { SLOTS, PORTS, EXPLICA, SALIDA_CABLE } from './geometria.js';
import { hooks, TDP_GPU, cable, cpuActual, enPedido, esFacil, estado, occupied, pedido, pieza, piezaPlacada, placed, plugged, pluggedPort, potenciaNecesaria, tabla } from './estado.js';
import { $, bandeja, clienteEl, especEl, logEl, objEl, progEl } from './dom.js';
import { caja, en, huecoEn, longitudCable, puertoEn, puertoRect } from './escena.js';

// ---------- Reglas del montaje ----------
export function log(tipo, msg) {
  estado.entradas.unshift({ tipo, msg });
  estado.entradas = estado.entradas.slice(0, 40);
  logEl.innerHTML = estado.entradas.map((e) => `<li class="${e.tipo}">${e.msg}</li>`).join('');
}
export function fallo(msg, corto) {
  estado.S.errores++;
  log('bad', esFacil() ? msg : (corto ?? 'No encaja con el pedido.'));
}
export function ok(msg) { log('ok', msg); }

export function intentarColocar(p, x, y) {
  const sid = huecoEn(x, y, p);
  if (!sid) return log('info', `${p.comercial ?? p.nombre} no encaja aquí: busca el hueco que le corresponde en el chasis.`);
  const cpu = cpuActual();
  const resultado = comprobarColocacion({
    pieza: p,
    placa: tabla(),
    cajaPuesta: piezaPlacada('caja'),
    ocupado: occupied(sid),
    nombreHueco: SLOTS[sid].nombre,
    cpuTdp: cpu.tdp,
    tdpGpu: TDP_GPU,
    enPedido: enPedido(p.id)
  });
  if (!resultado.ok) return fallo(resultado.motivo, resultado.corto);
  estado.S.placed[p.id] = sid;
  const mensajes = {
    caja: `${p.nombre} colocada: ${p.rgb ? 'tiene iluminación RGB' : 'no lleva iluminación RGB'}.`,
    board: esFacil() ? `${p.nombre} fijada en el chasis: los separadores evitan que toque la caja (apuntes S08).` : `${p.nombre} fijada en el chasis.`,
    cpu: `Procesador asentado en el socket ${p.socket}.`,
    ram: `${p.nombre} instalado en la ranura.`,
    gpu: 'Tarjeta gráfica en la ranura PCIe x16.',
    nvme: 'SSD NVMe en la ranura M.2.',
    psu: `Fuente de ${p.watts} W: suficiente para los ${potenciaNecesaria()} W que necesita el equipo.`
  };
  ok(esFacil() ? mensajes[p.kind] : 'Pieza colocada.');
}

export function intentarConectar(c, x, y, ruta) {
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
  estado.S.plugged[c.id] = { port: pid, ruta };
  ok(esFacil() ? `${c.nombre} conectado (${Math.round(largo)} cm de ${c.longitudMax} cm).` : 'Cable conectado.');
}

// Pasos del pedido en curso (el texto depende de las piezas que pide el cliente).
export function pasos() {
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
    { txt: 'Pulsa «Encender el equipo» para comprobar el montaje.', hecho: () => estado.S.final }
  ];
}

export function encender() {
  if (estado.S.final) return;
  const pendientes = pasos().slice(0, -1).filter((p) => !p.hecho());
  if (pendientes.length) {
    estado.S.errores++;
    if (esFacil()) {
      log('bad', `El equipo no arranca. Falta: ${pendientes[0].txt}`);
      CABLES.filter((c) => !plugged(c.id)).forEach((c) => log('info', EXPLICA[c.id]));
      estado.destelloHasta = performance.now() + 4000;
    } else {
      log('bad', 'El equipo no arranca. Revisa el pedido y las conexiones.');
    }
    hooks.pintarEscena();
    return;
  }
  estado.S.final = true;
  log('ok', `El equipo arranca y la BIOS muestra la pantalla POST. Errores durante el montaje: ${estado.S.errores}.`);
  if (estado.S.diag) {
    const segundos = (performance.now() - estado.S.inicio) / 1000;
    const puntos = puntuacionDiagnostico(estado.S.errores, estado.S.pruebas, segundos);
    log('ok', `Avería resuelta en ${Math.round(segundos)} s con ${estado.S.pruebas} pruebas. Puntuación: ${puntos} / 100.`);
  }
  pintarPanel();
  hooks.pintarEscena();
}

export function cargarPedido(id) {
  estado.S = { pedido: id, placed: {}, plugged: {}, errores: 0, final: false };
  estado.entradas = [];
  clienteEl.textContent = pedido().cliente;
  especEl.innerHTML = especificaciones().map((t) => `<li>${t}</li>`).join('');
  especEl.hidden = !esFacil();
  hooks.pintarEscena();
  log('info', esFacil()
    ? `Montaje nuevo: ${pedido().titulo}. Empieza eligiendo la caja y arrastrándola al chasis.`
    : 'Montaje nuevo. Lee lo que pide el cliente y monta el equipo.');
}

// Pedido al azar: no se puede elegir. En modo diagnóstico, una avería al azar sobre un equipo montado.
export function reiniciar() {
  if (estado.modo === 'diagnostico') return cargarDiagnostico();
  cargarPedido(PEDIDOS[Math.floor(Math.random() * PEDIDOS.length)].id);
}

// Equipo ya montado (pedido 1) con una avería.
export function cargarDiagnostico() {
  const d = DIAGNOSTICOS[Math.floor(Math.random() * DIAGNOSTICOS.length)];
  const base = PEDIDOS_FIJOS[0].piezas;
  estado.S = { pedido: PEDIDOS_FIJOS[0].id, diag: d.id, placed: {}, plugged: {}, errores: 0, final: false, pruebas: 0, inicio: performance.now() };
  estado.entradas = [];
  estado.S.placed[base.caja] = 'caja';
  estado.S.placed[base.board] = 'board';
  estado.S.placed[base.cpu] = 'cpu';
  estado.S.placed[base.ram[0]] = 'ram1';
  estado.S.placed[base.ram[1]] = 'ram2';
  estado.S.placed[base.gpu] = 'pcie';
  estado.S.placed[base.nvme] = 'm2';
  estado.S.placed[d.falla.tipo === 'fuente-insuficiente' ? d.falla.pieza : base.psu] = 'psu';
  for (const c of CABLES) {
    if (d.falla.tipo === 'cable-sin-conectar' && c.id === d.falla.cable) continue;
    estado.S.plugged[c.id] = { port: c.port, ruta: [SALIDA_CABLE[c.id]] };
  }
  clienteEl.textContent = d.sintoma;
  especEl.hidden = true;
  hooks.pintarEscena();
  log('info', 'Diagnóstico: el equipo ya está montado. Escucha al cliente y busca la avería.');
}

// Herramientas de diagnóstico (solo en modo diagnóstico).
function contarPrueba() {
  if (estado.S.diag) estado.S.pruebas++;
}

export function comprobarConexiones() {
  contarPrueba();
  for (const c of CABLES) log('info', `${c.nombre}: ${plugged(c.id) ? 'conectado' : 'NO conectado'}.`);
}

export function comprobarFuente() {
  contarPrueba();
  const psu = piezaPlacada('psu');
  if (!psu) return log('info', 'No hay fuente instalada.');
  log('info', `La fuente da ${psu.watts} W. Este equipo necesita al menos ${potenciaNecesaria()} W.`);
}

export function retirarPieza(id) {
  contarPrueba();
  delete estado.S.placed[id];
  hooks.pintarEscena();
  log('info', `${pieza(id).nombre} retirada del equipo.`);
}

export function pintarPanel() {
  const lista = pasos();
  const i = lista.findIndex((p) => !p.hecho());
  const diag = $('diagnostico');
  diag.hidden = estado.modo !== 'diagnostico';
  if (!diag.hidden) {
    objEl.textContent = estado.S.final ? 'Equipo funcionando' : 'Encuentra la avería y repárala.';
    progEl.textContent = `Errores: ${estado.S.errores}`;
    pintarRetirar();
    return;
  }
  if (!esFacil()) {
    objEl.textContent = estado.S.final ? 'Equipo montado' : 'Monta el equipo del pedido.';
    progEl.textContent = `Errores: ${estado.S.errores}`;
    return;
  }
  objEl.textContent = i < 0 ? 'Equipo montado' : lista[i].txt;
  const paso = i < 0 ? lista.length : i + 1;
  progEl.textContent = `Paso ${paso} de ${lista.length} · Errores: ${estado.S.errores}`;
}

// Especificaciones que pide el cliente (lo único que se ve en estado.modo difícil).
export function especificaciones() {
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


// Botones «Retirar» con las piezas montadas (sin la caja ni la placa).
function pintarRetirar() {
  const cont = $('retirar');
  cont.innerHTML = '';
  for (const id of Object.keys(estado.S.placed)) {
    const p = pieza(id);
    if (p.kind === 'caja' || p.kind === 'board') continue;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'boton';
    b.textContent = `Retirar ${p.comercial ?? p.nombre}`;
    b.addEventListener('click', () => retirarPieza(id));
    cont.appendChild(b);
  }
}
