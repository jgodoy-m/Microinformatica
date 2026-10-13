// Geometría del montaje: huecos del chasis, conectores y trazado de cables (unidades de escena).
// Sin three.js ni DOM. Los valores de cables y conectores están en el centro de la placa (0, 0).

// Coordenadas en unidades 3D. Centro de la placa = (0, 0). La placa mide 30 x 24.
export const SLOTS = {
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
export const NECESITA = { atx24: 'board', eps8: 'board', pcie8: 'gpu' };
export const PORTS = {
  atx24: { x: 12.5, y: 2.5, w: 1.8, h: 5, z: 0.5, etiqueta: 'ATX 24' },
  eps8:  { x: -12.5, y: 10, w: 2.5, h: 2, z: 0.5, etiqueta: 'EPS 8' },
  // El conector PCIe está en la esquina superior derecha de la gráfica, que se monta sobre su ranura.
  pcie8: { relativo: true, dx: 4.6, dy: 1.6, w: 2.0, h: 2.2, etiqueta: 'PCIe 6+2' }
};

// Salida de cada cable: frente del conector modular de la fuente.
export const SALIDA_CABLE = {
  'c-atx': [7.0, -11.45, 3.5],
  'c-eps': [-6.5, -11.45, 3.5],
  'c-pcie': [2.5, -11.45, 3.5]
};
export const ALTURA_CABLE = 2.9;
export const RADIO_CABLE = 0.2;

export const EXPLICA = {
  'c-atx': 'Sin ATX 24 pines la placa no recibe alimentación y no arranca (apuntes S07).',
  'c-eps': 'Sin EPS 8 pines el procesador no recibe alimentación (apuntes S07).',
  'c-pcie': 'Sin PCIe 6+2 pines la tarjeta gráfica no tiene la alimentación adicional que necesita (apuntes S07).'
};

