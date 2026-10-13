// Reglas del montaje sin DOM ni Three.js: así se pueden probar en juego/tests.html.
// Los textos de error son los que muestra el juego; «corto» es la versión del modo difícil.

// Potencia mínima de la fuente para una CPU y una GPU concretas: (TDP CPU + TDP GPU + 100 W) × 1,3.
export function potenciaNecesaria(tdpCpu, tdpGpu) {
  return Math.ceil((tdpCpu + tdpGpu + 100) * 1.3);
}

// ¿Puede colocarse la pieza p en su hueco? Devuelve null si sí; si no, { msg, corto }.
// ctx: { placa (pieza de placa base o null), cajaPuesta (bool), ocupado (bool), nombreHueco,
//        potencia (W necesarios), enPedido (bool), orientacion (texto opcional para el modo difícil) }
export function motivoColocar(p, ctx) {
  const { placa, cajaPuesta, ocupado, nombreHueco, potencia, enPedido, orientacion } = ctx;
  if (p.kind !== 'caja' && !cajaPuesta) {
    return { msg: 'Primero elige la caja: sin chasis no hay dónde montar el equipo.', corto: 'Primero la caja.' };
  }
  if (p.kind !== 'caja' && p.kind !== 'board' && !placa) {
    return { msg: 'Primero fija la placa base en el chasis: sin ella no hay dónde montar el resto.', corto: 'Primero la placa base.' };
  }
  if (ocupado) return { msg: `El ${nombreHueco} ya está ocupado.`, corto: 'Ese hueco ya está ocupado.' };
  if (p.kind === 'cpu' && p.socket !== placa.socket) {
    return { msg: `${p.nombre} no encaja: es para socket ${p.socket} y la placa tiene ${placa.socket}. Cada socket admite solo sus familias de procesador (apuntes S11).`, corto: 'El procesador no es compatible con el socket de la placa base.' };
  }
  if (p.kind === 'ram' && p.gen !== placa.gen) {
    return { msg: `${p.nombre} no entra en una placa ${placa.gen}: las ranuras son distintas según la generación (apuntes S11).`, corto: 'La memoria no es del tipo que admite esta placa base.' };
  }
  if (p.kind === 'psu' && p.watts < potencia) {
    return { msg: `La fuente de ${p.watts} W se queda corta: el equipo necesita al menos ${potencia} W, según (TDP CPU + TDP GPU + 100 W) × 1,3 (apuntes S11).`, corto: 'La potencia de la fuente no basta para la CPU y la gráfica de este pedido.' };
  }
  if (!enPedido) {
    // En difícil, solo una orientación verificable (dada por el juego con el texto del cliente); si no hay, el mensaje genérico.
    return { msg: `${p.nombre} no es el componente que pide el cliente en este pedido. Mira el pedido y elige otra pieza.`, corto: ctx.orientacion ?? 'Esa pieza no corresponde a este pedido.' };
  }
  return null;
}

// ¿Puede conectarse el cable c al conector pid? Devuelve null si sí; si no, { msg, corto }.
// ctx: { etiqueta (del conector), visible (el conector ya está disponible), psuPuesta, ocupado }
export function motivoConectar(c, pid, ctx) {
  const { etiqueta, visible, psuPuesta, ocupado } = ctx;
  if (c.port !== pid) {
    return { msg: `${c.nombre} no encaja en el conector ${etiqueta}: el número de pines y la forma son distintos (apuntes S07).`, corto: 'Ese cable no corresponde a ese conector.' };
  }
  if (!visible) {
    return { msg: `El conector ${etiqueta} aún no está disponible: monta antes la pieza a la que va unido.`, corto: 'Falta la pieza a la que va unido ese conector.' };
  }
  if (!psuPuesta) return { msg: 'Antes de conectar los cables, instala la fuente: de ella salen.', corto: 'Falta la fuente de alimentación.' };
  if (ocupado) return { msg: `El conector ${etiqueta} ya tiene un cable.`, corto: 'Ese conector ya tiene cable.' };
  return null;
}

// Distancia de un punto 3D a un segmento.
function distanciaASegmento(p, a, b) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const cuadrado = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
  let t = 0;
  if (cuadrado > 0) {
    t = ((p[0] - a[0]) * d[0] + (p[1] - a[1]) * d[1] + (p[2] - a[2]) * d[2]) / cuadrado;
    t = Math.max(0, Math.min(1, t));
  }
  return Math.hypot(p[0] - (a[0] + t * d[0]), p[1] - (a[1] + t * d[1]), p[2] - (a[2] + t * d[2]));
}

// Simplifica un trazado (Ramer–Douglas–Peucker) para que el largo no dependa de cuántos puntos
// capturó el puntero: el temblor del ratón deja de alargar el cable.
export function simplificarTrazado(puntos, tolerancia = 0.6) {
  if (puntos.length < 3) return puntos;
  let distMax = 0;
  let indice = 0;
  for (let i = 1; i < puntos.length - 1; i++) {
    const d = distanciaASegmento(puntos[i], puntos[0], puntos[puntos.length - 1]);
    if (d > distMax) { distMax = d; indice = i; }
  }
  if (distMax <= tolerancia) return [puntos[0], puntos[puntos.length - 1]];
  const izquierda = simplificarTrazado(puntos.slice(0, indice + 1), tolerancia);
  const derecha = simplificarTrazado(puntos.slice(indice), tolerancia);
  return [...izquierda.slice(0, -1), ...derecha];
}

export function longitudTrazado(puntos) {
  let total = 0;
  for (let i = 1; i < puntos.length; i++) {
    total += Math.hypot(puntos[i][0] - puntos[i - 1][0], puntos[i][1] - puntos[i - 1][1], puntos[i][2] - puntos[i - 1][2]);
  }
  return total;
}

// Largo en cm de un cable: recorrido trazado por el alumno, subida a la altura del cable y bajada al conector.
// r = { x, y, z } del conector. (1 unidad de escena ≈ 1 cm.)
export function longitudCable(ruta, r, altura) {
  const altoConector = Math.max(altura, r.z + 1.6);
  const trazado = [...ruta, [r.x, r.y, altoConector], [r.x, r.y, r.z + 1.2]];
  return longitudTrazado(simplificarTrazado(trazado));
}

// Longitud máxima de un cable: mismo texto corto para el modo difícil.
export function motivoLongitud(c, largo) {
  if (largo <= c.longitudMax) return null;
  return {
    msg: `${c.nombre} mide ${Math.round(largo)} cm de recorrido y el máximo es ${c.longitudMax} cm. Trázalo más directo entre la fuente y el conector.`,
    corto: 'El recorrido del cable es demasiado largo para ese conector.'
  };
}

// Qué piezas o cables deben retirarse junto con `id` para que la partida siga siendo válida.
// requisitos(x) devuelve los ids de los que depende x; presentes son los ids colocados.
export function cascadaRetirada(id, requisitos, presentes) {
  const quitar = new Set([id]);
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (const x of presentes) {
      if (quitar.has(x)) continue;
      if (requisitos(x).some((r) => quitar.has(r))) {
        quitar.add(x);
        cambio = true;
      }
    }
  }
  return [...quitar];
}
