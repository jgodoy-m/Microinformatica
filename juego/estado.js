// Estado compartido del montaje. Los módulos leen y escriben estado.* (no hay variables sueltas).
import { PIEZAS, CABLES, PEDIDOS } from './catalogo.js';
import { potenciaNecesaria as potencia } from './reglas.js';

export const estado = {
  S: null,
  entradas: [],
  arrastre: null,
  destelloHasta: 0,
  modo: 'facil',
  seleccion: null,
  rgbActivo: false,
  tableroId: null,
  chasisId: null,
  vistaPrevia: null
};
// Funciones de la escena que los módulos de reglas necesitan (las rellena montaje.js al arrancar).
export const hooks = { pintarEscena: () => {} };

export const TDP_GPU = PIEZAS.find((p) => p.kind === 'gpu').tdp;
export const esFacil = () => estado.modo === 'facil';
export const placed = (id) => id in estado.S.placed;
export const plugged = (id) => id in estado.S.plugged;
export const pluggedPort = (pid) => Object.values(estado.S.plugged).some((v) => v.port === pid);
export const occupied = (sid) => Object.values(estado.S.placed).includes(sid);
export const pieza = (id) => PIEZAS.find((p) => p.id === id);
export const cable = (id) => CABLES.find((c) => c.id === id);
export const pedido = () => PEDIDOS.find((p) => p.id === estado.S.pedido);
export const enPedido = (id) => Object.values(pedido().piezas).flat().includes(id);
export const piezaPlacada = (kind) => Object.keys(estado.S.placed).map(pieza).find((p) => p.kind === kind);
export const tabla = () => piezaPlacada('board');
export const cpuActual = () => piezaPlacada('cpu') ?? pieza(pedido().piezas.cpu);
export const potenciaNecesaria = () => potencia(cpuActual().tdp, TDP_GPU);
