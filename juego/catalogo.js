// Catálogo del montaje: piezas, cables y pedidos del cliente.
//
// Para añadir una pieza: copia una línea de PIEZAS, cambia el id y los datos,
// y guarda su foto recortada (fondo transparente) como fotos/<id>.png.
// Si no hay foto, marca sinFoto: true y la ficha de la bandeja se ve con el color de la pieza.
//
// Para añadir un pedido: copia un bloque de PEDIDOS y elige las piezas del cliente.
// Las piezas que no estén en el pedido se pueden montar, pero el equipo no es el que pidió.
//
// Reglas que aplica el juego (valores de los apuntes):
//   - Un procesador solo encaja en una placa con el mismo socket.
//   - Un módulo de RAM solo encaja si la placa tiene la misma generación (DDR4 / DDR5).
//   - La fuente debe dar al menos (TDP CPU + TDP GPU + 100 W) × 1,3.

export const PIEZAS = [
  // Placas base: definen socket y tipo de memoria.
  { id: 'board-am4', kind: 'board', nombre: 'Placa base AM4 (DDR4)', corto: 'Placa AM4', socket: 'AM4', gen: 'DDR4', color: '#2F4F41', pcb: '#1C3228' },
  { id: 'board-am5', kind: 'board', nombre: 'Placa base AM5 (DDR5)', corto: 'Placa AM5', socket: 'AM5', gen: 'DDR5', color: '#23262D', pcb: '#262A33' },
  { id: 'board-intel', kind: 'board', nombre: 'Placa base Intel LGA1700 (DDR5)', corto: 'Placa Intel', socket: 'LGA1700', gen: 'DDR5', color: '#D8DEE9', pcb: '#2B3140' },

  // Procesadores: el socket debe coincidir con el de la placa.
  { id: 'cpu-am4', kind: 'cpu', nombre: 'Procesador AM4 (105 W)', corto: 'CPU AM4', socket: 'AM4', tdp: 105, color: '#C9D1DC' },
  { id: 'cpu-am5', kind: 'cpu', nombre: 'Procesador AM5 (105 W)', corto: 'CPU AM5', socket: 'AM5', tdp: 105, color: '#C9D1DC', sinFoto: true },
  { id: 'cpu-intel', kind: 'cpu', nombre: 'Procesador Intel Core i7 LGA1700 (125 W)', corto: 'CPU Intel i7', socket: 'LGA1700', tdp: 125, color: '#C9D1DC' },

  // Memoria: la generación debe coincidir con la de la placa.
  { id: 'ram-a', kind: 'ram', nombre: 'Módulo RAM DDR4', corto: 'RAM DDR4', gen: 'DDR4', color: '#1E222A' },
  { id: 'ram-b', kind: 'ram', nombre: 'Módulo RAM DDR4', corto: 'RAM DDR4', gen: 'DDR4', color: '#1E222A' },
  { id: 'ram-x', kind: 'ram', nombre: 'Módulo RAM DDR5', corto: 'RAM DDR5', gen: 'DDR5', color: '#1E222A' },
  { id: 'ram-x2', kind: 'ram', nombre: 'Módulo RAM DDR5', corto: 'RAM DDR5', gen: 'DDR5', color: '#1E222A' },

  { id: 'gpu', kind: 'gpu', nombre: 'Tarjeta gráfica (150 W)', corto: 'GPU', tdp: 150, color: '#1C2029' },
  { id: 'nvme', kind: 'nvme', nombre: 'SSD NVMe M.2', corto: 'SSD NVMe', color: '#2C4B3E' },

  // Fuentes: la potencia debe cubrir lo que necesita el equipo.
  { id: 'psu', kind: 'psu', nombre: 'Fuente de 650 W', corto: 'Fuente 650 W', watts: 650, color: '#1E222A' },
  { id: 'psu-x', kind: 'psu', nombre: 'Fuente de 450 W', corto: 'Fuente 450 W', watts: 450, color: '#1E222A', sinFoto: true }
];

// Cables de alimentación. El conector sale de la fuente y el alumno traza su recorrido.
export const CABLES = [
  { id: 'c-atx', nombre: 'Cable ATX 24 pines', corto: 'ATX 24', port: 'atx24', color: '#D08770', sinFoto: true },
  { id: 'c-eps', nombre: 'Cable EPS 8 pines', corto: 'EPS 8', port: 'eps8', color: '#E5E9F0', sinFoto: true },
  { id: 'c-pcie', nombre: 'Cable PCIe 6+2 pines', corto: 'PCIe 6+2', port: 'pcie8', color: '#B48EAD', sinFoto: true }
];

// Pedidos del cliente. Cada uno indica qué piezas hay que montar.
export const PEDIDOS = [
  {
    id: 'am4',
    titulo: 'Pedido 1 · AM4 con DDR4',
    cliente: '«Quiero un equipo para ofimática y juegos ligeros, con la memoria DDR4 que ya tengo.»',
    piezas: { board: 'board-am4', cpu: 'cpu-am4', ram: ['ram-a', 'ram-b'], gpu: 'gpu', nvme: 'nvme', psu: 'psu' }
  },
  {
    id: 'intel',
    titulo: 'Pedido 2 · Intel LGA1700 con DDR5',
    cliente: '«Quiero un equipo Intel con memoria DDR5 para edición de vídeo.»',
    piezas: { board: 'board-intel', cpu: 'cpu-intel', ram: ['ram-x', 'ram-x2'], gpu: 'gpu', nvme: 'nvme', psu: 'psu' }
  },
  {
    id: 'am5',
    titulo: 'Pedido 3 · AM5 con DDR5',
    cliente: '«Quiero un equipo AM5 con DDR5 y una fuente que aguante una gráfica potente.»',
    piezas: { board: 'board-am5', cpu: 'cpu-am5', ram: ['ram-x', 'ram-x2'], gpu: 'gpu', nvme: 'nvme', psu: 'psu' }
  }
];
