// Catálogo del montaje: piezas, cajas, cables, plataformas y pedidos del cliente.
//
// Para añadir una pieza: copia una línea de PIEZAS, cambia el id y los datos,
// y guarda su foto recortada (fondo transparente) como fotos/<id>.png.
// Si todavía no hay foto, pon sinFoto: true y la ficha de la bandeja se verá con el color de la pieza.
//
// Para añadir un pedido fijo: copia un bloque de PEDIDOS_FIJOS.
// Los pedidos aleatorios se generan a partir de PLATAFORMAS, PSUS, GPUS y CAJAS.
//
// Reglas que aplica el juego (valores de los apuntes):
//   - Un procesador solo encaja en una placa con el mismo socket.
//   - Un módulo de RAM solo encaja si la placa tiene la misma generación (DDR4 / DDR5).
//   - La fuente debe dar al menos (TDP CPU + TDP GPU + 100 W) × 1,3.

export const PIEZAS = [
  // Cajas: definen el aspecto del chasis y si lleva iluminación RGB.
  { id: 'caja-cristal-rgb', kind: 'caja', nombre: 'Torre de cristal con RGB', corto: 'Caja cristal RGB', cristal: true, rgb: true, color: '#2E3440', sinFoto: true },
  { id: 'caja-cristal', kind: 'caja', nombre: 'Torre de cristal sin RGB', corto: 'Caja cristal', cristal: true, rgb: false, color: '#3B4252', sinFoto: true },
  { id: 'caja-metal', kind: 'caja', nombre: 'Torre metálica sin RGB', corto: 'Caja metal', cristal: false, rgb: false, color: '#4C566A', sinFoto: true },
  { id: 'caja-metal-rgb', kind: 'caja', nombre: 'Torre metálica con RGB', corto: 'Caja metal RGB', cristal: false, rgb: true, color: '#4C566A', sinFoto: true },

  // Placas base: definen socket y tipo de memoria.
  { id: 'board-am4', kind: 'board', nombre: 'Placa base AM4 (DDR4)', corto: 'Placa AM4', socket: 'AM4', gen: 'DDR4', color: '#2F4F41', pcb: '#1C3228' },
  { id: 'board-am4-b', kind: 'board', nombre: 'Placa base AM4 B550 (DDR4)', corto: 'Placa B550', socket: 'AM4', gen: 'DDR4', color: '#4C566A', pcb: '#2A2F38', sinFoto: true },
  { id: 'board-am5', kind: 'board', nombre: 'Placa base AM5 (DDR5)', corto: 'Placa AM5', socket: 'AM5', gen: 'DDR5', color: '#23262D', pcb: '#262A33' },
  { id: 'board-am5-b', kind: 'board', nombre: 'Placa base AM5 B650 (DDR5)', corto: 'Placa B650', socket: 'AM5', gen: 'DDR5', color: '#3B4252', pcb: '#2E3440', sinFoto: true },
  { id: 'board-intel', kind: 'board', nombre: 'Placa base Intel LGA1700 (DDR5)', corto: 'Placa Intel', socket: 'LGA1700', gen: 'DDR5', color: '#D8DEE9', pcb: '#2B3140' },
  { id: 'board-intel-b', kind: 'board', nombre: 'Placa base Intel LGA1700 B760 (DDR5)', corto: 'Placa B760', socket: 'LGA1700', gen: 'DDR5', color: '#8FBCBB', pcb: '#2B3F3F', sinFoto: true },

  // Procesadores: el socket debe coincidir con el de la placa.
  { id: 'cpu-am4', kind: 'cpu', nombre: 'Procesador AM4 (105 W)', corto: 'CPU AM4', socket: 'AM4', tdp: 105, color: '#C9D1DC' },
  { id: 'cpu-am4-b', kind: 'cpu', nombre: 'Procesador AM4 de 6 núcleos (65 W)', corto: 'CPU AM4 6n', socket: 'AM4', tdp: 65, color: '#C9D1DC', sinFoto: true },
  { id: 'cpu-am5', kind: 'cpu', nombre: 'Procesador AM5 (105 W)', corto: 'CPU AM5', socket: 'AM5', tdp: 105, color: '#C9D1DC', sinFoto: true },
  { id: 'cpu-am5-b', kind: 'cpu', nombre: 'Procesador AM5 de alto rendimiento (120 W)', corto: 'CPU AM5 HP', socket: 'AM5', tdp: 120, color: '#C9D1DC', sinFoto: true },
  { id: 'cpu-intel', kind: 'cpu', nombre: 'Procesador Intel Core i7 LGA1700 (125 W)', corto: 'CPU Intel i7', socket: 'LGA1700', tdp: 125, color: '#C9D1DC' },
  { id: 'cpu-intel-b', kind: 'cpu', nombre: 'Procesador Intel Core i5 LGA1700 (65 W)', corto: 'CPU Intel i5', socket: 'LGA1700', tdp: 65, color: '#C9D1DC', sinFoto: true },

  // Memoria: la generación debe coincidir con la de la placa.
  { id: 'ram-a', kind: 'ram', nombre: 'Módulo RAM DDR4', corto: 'RAM DDR4', gen: 'DDR4', color: '#1E222A' },
  { id: 'ram-b', kind: 'ram', nombre: 'Módulo RAM DDR4', corto: 'RAM DDR4', gen: 'DDR4', color: '#1E222A' },
  { id: 'ram-x', kind: 'ram', nombre: 'Módulo RAM DDR5', corto: 'RAM DDR5', gen: 'DDR5', color: '#1E222A' },
  { id: 'ram-x2', kind: 'ram', nombre: 'Módulo RAM DDR5', corto: 'RAM DDR5', gen: 'DDR5', color: '#1E222A' },

  // Tarjetas gráficas.
  { id: 'gpu', kind: 'gpu', nombre: 'Tarjeta gráfica (150 W)', corto: 'GPU', tdp: 150, color: '#1C2029' },
  { id: 'gpu-blanca', kind: 'gpu', nombre: 'Tarjeta gráfica blanca (200 W)', corto: 'GPU blanca', tdp: 200, color: '#E5E9F0' },
  { id: 'gpu-negra', kind: 'gpu', nombre: 'Tarjeta gráfica negra con LED (170 W)', corto: 'GPU negra', tdp: 170, color: '#1C2029' },

  { id: 'nvme', kind: 'nvme', nombre: 'SSD NVMe M.2', corto: 'SSD NVMe', color: '#2C4B3E' },

  // Fuentes: la potencia debe cubrir lo que necesita el equipo.
  { id: 'psu', kind: 'psu', nombre: 'Fuente de 650 W', corto: 'Fuente 650 W', watts: 650, color: '#1E222A' },
  { id: 'psu-750', kind: 'psu', nombre: 'Fuente de 750 W', corto: 'Fuente 750 W', watts: 750, color: '#1E222A' },
  { id: 'psu-x', kind: 'psu', nombre: 'Fuente de 450 W', corto: 'Fuente 450 W', watts: 450, color: '#1E222A', sinFoto: true }
];

// Cables de alimentación. El conector sale de la fuente y el alumno traza su recorrido.
export const CABLES = [
  { id: 'c-atx', nombre: 'Cable ATX 24 pines', corto: 'ATX 24', port: 'atx24', color: '#D08770', sinFoto: true },
  { id: 'c-eps', nombre: 'Cable EPS 8 pines', corto: 'EPS 8', port: 'eps8', color: '#E5E9F0', sinFoto: true },
  { id: 'c-pcie', nombre: 'Cable PCIe 6+2 pines', corto: 'PCIe 6+2', port: 'pcie8', color: '#B48EAD', sinFoto: true }
];

// Plataformas compatibles: cada una agrupa placas, procesadores y memoria que encajan entre sí.
export const PLATAFORMAS = [
  { nombre: 'AM4', gen: 'DDR4', placas: ['board-am4', 'board-am4-b'], cpus: ['cpu-am4', 'cpu-am4-b'], ram: ['ram-a', 'ram-b'] },
  { nombre: 'AM5', gen: 'DDR5', placas: ['board-am5', 'board-am5-b'], cpus: ['cpu-am5', 'cpu-am5-b'], ram: ['ram-x', 'ram-x2'] },
  { nombre: 'Intel LGA1700', gen: 'DDR5', placas: ['board-intel', 'board-intel-b'], cpus: ['cpu-intel', 'cpu-intel-b'], ram: ['ram-x', 'ram-x2'] }
];

export const GPUS = ['gpu', 'gpu-blanca', 'gpu-negra'];
const TEXTO_GPU = {
  gpu: 'una gráfica estándar',
  'gpu-blanca': 'una gráfica blanca de alto rendimiento',
  'gpu-negra': 'una gráfica negra con LED'
};
export const PSUS = ['psu', 'psu-750', 'psu-x'];
export const CAJAS = ['caja-cristal-rgb', 'caja-cristal', 'caja-metal', 'caja-metal-rgb'];
export const USOS = ['ofimática y navegación', 'diseño gráfico', 'streaming', 'juegos en 1440p', 'edición de vídeo', 'programar y compilar'];

// Pedidos fijos (los primeros del desplegable).
export const PEDIDOS_FIJOS = [
  {
    id: 'am4',
    titulo: 'Pedido 1 · AM4 con DDR4',
    cliente: '«Quiero un equipo para ofimática y juegos ligeros, con la memoria DDR4 que ya tengo.»',
    piezas: { caja: 'caja-cristal-rgb', board: 'board-am4', cpu: 'cpu-am4', ram: ['ram-a', 'ram-b'], gpu: 'gpu', nvme: 'nvme', psu: 'psu' }
  },
  {
    id: 'intel',
    titulo: 'Pedido 2 · Intel LGA1700 con DDR5',
    cliente: '«Quiero un equipo Intel con memoria DDR5 para edición de vídeo, en caja metálica sin luces.»',
    piezas: { caja: 'caja-metal', board: 'board-intel', cpu: 'cpu-intel', ram: ['ram-x', 'ram-x2'], gpu: 'gpu', nvme: 'nvme', psu: 'psu' }
  },
  {
    id: 'am5',
    titulo: 'Pedido 3 · AM5 con DDR5',
    cliente: '«Quiero un equipo AM5 con DDR5 y una fuente que aguante una gráfica potente.»',
    piezas: { caja: 'caja-cristal', board: 'board-am5', cpu: 'cpu-am5', ram: ['ram-x', 'ram-x2'], gpu: 'gpu', nvme: 'nvme', psu: 'psu' }
  }
];

// Semilla fija: los pedidos aleatorios son siempre los mismos. Cámbiala para generar otros.
export const SEMILLA_PEDIDOS = 2026;
export const NUMERO_PEDIDOS_ALEATORIOS = 10;

// Generador determinista (congruencial lineal): misma semilla, mismos pedidos.
export function generarPedidos(n, semilla) {
  let estado = semilla;
  const aleatorio = () => {
    estado = (estado * 16807) % 2147483647;
    return estado / 2147483647;
  };
  const elegir = (lista) => lista[Math.floor(aleatorio() * lista.length)];
  const pieza = (id) => PIEZAS.find((p) => p.id === id);
  const pedidos = [];
  for (let i = 0; i < n; i++) {
    const plataforma = elegir(PLATAFORMAS);
    const board = elegir(plataforma.placas);
    const cpu = elegir(plataforma.cpus);
    const gpu = elegir(GPUS);
    const necesario = Math.ceil((pieza(cpu).tdp + pieza(gpu).tdp + 100) * 1.3);
    const fuentes = PSUS.filter((id) => pieza(id).watts >= necesario);
    const psu = elegir(fuentes);
    const caja = elegir(CAJAS);
    const uso = elegir(USOS);
    const luz = pieza(caja).rgb ? 'con iluminación RGB' : 'sin iluminación RGB';
    const numero = PEDIDOS_FIJOS.length + i + 1;
    pedidos.push({
      id: `aleatorio-${i + 1}`,
      titulo: `Pedido ${numero} · ${plataforma.nombre} con ${pieza(gpu).corto}`,
      cliente: `«Necesito un equipo para ${uso}, con ${TEXTO_GPU[gpu]} y ${pieza(caja).nombre.toLowerCase().replace('rgb', 'RGB')}, ${luz}.»`,
      piezas: { caja, board, cpu, ram: [...plataforma.ram], gpu, nvme: 'nvme', psu }
    });
  }
  return pedidos;
}

export const PEDIDOS = [...PEDIDOS_FIJOS, ...generarPedidos(NUMERO_PEDIDOS_ALEATORIOS, SEMILLA_PEDIDOS)];
