// Reglas del montaje. Funciones puras: sin three.js ni DOM, para poder probarlas en tests.html.
// Valores de los apuntes: potencia = (TDP CPU + TDP GPU + 100 W) × 1,3.

export const CONSTANTE_BASE_W = 100;
export const FACTOR_SEGURIDAD = 1.3;

export function potenciaNecesaria(tdpCpu, tdpGpu) {
  return Math.ceil((tdpCpu + tdpGpu + CONSTANTE_BASE_W) * FACTOR_SEGURIDAD);
}

// Largo de un recorrido de puntos [x, y, z] en cm (1 unidad de escena ≈ 1 cm).
export function longitudPuntos(puntos) {
  let total = 0;
  for (let i = 1; i < puntos.length; i++) {
    total += Math.hypot(puntos[i][0] - puntos[i - 1][0], puntos[i][1] - puntos[i - 1][1], puntos[i][2] - puntos[i - 1][2]);
  }
  return total;
}

// Comprueba si una pieza puede colocarse en su hueco.
// Devuelve { ok: true } o { ok: false, motivo, corto }: "motivo" es la explicación completa
// y "corto" la versión del modo difícil (sin datos técnicos).
// ctx: { pieza, placa, cajaPuesta, ocupado, nombreHueco, cpuTdp, tdpGpu, enPedido }
export function comprobarColocacion(ctx) {
  const { pieza: p, placa, cajaPuesta, ocupado, nombreHueco, cpuTdp, tdpGpu, enPedido } = ctx;
  if (p.kind !== 'caja' && !cajaPuesta) {
    return { ok: false, motivo: 'Primero elige la caja: sin chasis no hay dónde montar el equipo.', corto: 'Primero la caja.' };
  }
  if (p.kind !== 'caja' && p.kind !== 'board' && !placa) {
    return { ok: false, motivo: 'Primero fija la placa base en el chasis: sin ella no hay dónde montar el resto.', corto: 'Primero la placa base.' };
  }
  if (ocupado) {
    return { ok: false, motivo: `El ${nombreHueco} ya está ocupado.`, corto: 'Ese hueco ya está ocupado.' };
  }
  if (p.kind === 'cpu' && p.socket !== placa.socket) {
    return { ok: false, motivo: `${p.nombre} no encaja: es para socket ${p.socket} y la placa tiene ${placa.socket}. Cada socket admite solo sus familias de procesador (apuntes S11).`, corto: 'Ese procesador no encaja en esta placa.' };
  }
  if (p.kind === 'ram' && p.gen !== placa.gen) {
    return { ok: false, motivo: `${p.nombre} no entra en una placa ${placa.gen}: las ranuras son distintas según la generación (apuntes S11).`, corto: 'Esa memoria no encaja en esta placa.' };
  }
  const necesaria = potenciaNecesaria(cpuTdp, tdpGpu);
  if (p.kind === 'psu' && p.watts < necesaria) {
    return { ok: false, motivo: `La fuente de ${p.watts} W se queda corta: el equipo necesita al menos ${necesaria} W, según (TDP CPU + TDP GPU + 100 W) × 1,3 (apuntes S11).`, corto: 'Esa fuente no basta para este equipo.' };
  }
  if (!enPedido) {
    return { ok: false, motivo: `${p.nombre} no es el componente que pide el cliente en este pedido. Mira el pedido y elige otra pieza.`, corto: 'Esa pieza no es la que pide el cliente.' };
  }
  return { ok: true };
}

// Puntuación de un diagnóstico resuelto: 100 puntos, menos 10 por error, 5 por cada prueba
// (comprobar o retirar) y 2 por cada 10 s pasados de los 2 minutos.
export function puntuacionDiagnostico(errores, pruebas, segundos) {
  const tiempo = Math.floor(Math.max(0, segundos - 120) / 10) * 2;
  return Math.max(0, 100 - 10 * errores - 5 * pruebas - tiempo);
}
