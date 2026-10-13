// Referencias a los elementos de la página.

export const $ = (id) => document.getElementById(id);
export const logEl = $('log');
export const objEl = $('objetivo');
export const progEl = $('progreso');
export const clienteEl = $('cliente');
export const especEl = $('especificaciones');
export const botonesModo = document.querySelectorAll('[data-modo]');
export const contenedor = $('escena');
export const bandeja = $('bandeja');
export const fantasma = $('fantasma');
export const teclado = $('teclado');
export const contenedorHuecos = $('huecos');
