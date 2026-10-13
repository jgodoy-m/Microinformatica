/* Motor del temario: simulador de averías, mapa de zonas sobre una foto y quiz.
   No contiene contenido. Cada tema se registra en window.TEMAS (carpeta temas/).
   Ver README.md para añadir un tema nuevo. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var NOMINALES = [12, 5, 3.3];
  /* Tolerancia ATX ±5 % por raíl (apuntes S12). Cada tensión se compara con su propio nominal. */
  var TOLERANCIA = 0.05;
  function fueraDeTolerancia(v) {
    return NOMINALES.map(function (n, i) { return Math.abs(v[i] - n) > n * TOLERANCIA; });
  }
  var ICONO_SOL = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var ICONO_LUNA = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function el(tag, attrs, parent) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function escapar(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- SIMULADOR ---------- */
  /* Iconos de línea para las pruebas (trazos de Feather/Lucide, dibujados a mano con las mismas formas). */
  var ICONO_PRUEBA = {
    ent: 'M4 5h16v11H8l-4 4z',
    vis: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z M12 9.5a2.5 2.5 0 1 0 .01 0',
    fue: 'M13 2 4 14h7l-1 8 9-12h-7z',
    min: 'M9 4v2 M15 4v2 M9 18v2 M15 18v2 M4 9h2 M4 15h2 M18 9h2 M18 15h2 M7 7h10v10H7z',
    ram: 'M3 8h18v9H3z M7 17v3 M11 17v3 M15 17v3 M6 8V5 M18 8V5',
    reenc: 'M4 9h13l-3-3 M20 15H7l3 3',
    eps: 'M9 3v5 M15 3v5 M7 8h10v4a5 5 0 0 1-10 0z M12 17v4',
    sata: 'M4 6h16v12H4z M8 10h8 M8 14h8',
    tmp: 'M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z',
    cam: 'M4 12a8 8 0 0 1 14-5 M20 12a8 8 0 0 1-14 5 M18 3v4h-4 M6 21v-4h4'
  };
  function icono(id) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + (ICONO_PRUEBA[id] || 'M5 12h14') + '"/></svg>';
  }

  function simulador(tema, raiz, pagina) {
    var C = tema.simulador;
    var q = function (s) { return raiz.querySelector(s); };
    var qa = function (s) { return raiz.querySelectorAll(s); };
    var S;
    /* Ronda: número de veces que se pulsa «Repetir». Alterna la variante de los casos que tienen escenarios (sin aleatoriedad). */
    var ronda = 0;

    /* Caso i con la variante v aplicada. Las variantes solo sustituyen res, fallos, luz, explicación, reparaciones, verificaciones y «exige». */
    function casoEn(i, v) {
      var base = C.casos[i];
      var over = base.variantes && base.variantes[v];
      if (!over) return base;
      var c = Object.assign({}, base, over);
      ['res', 'fallos', 'luz'].forEach(function (k) { c[k] = Object.assign({}, base[k] || {}, over[k] || {}); });
      if (over.discrima) c.discrima = Object.assign({}, base.discrima, over.discrima);
      return c;
    }
    function caso() { return casoEn(S.i, S.variante); }

    function nuevo() {
      S = { i: 0, pts: [], desglose: [], varHist: [], repAceptada: null };
      reiniciarCaso();
    }

    /* Estado que pertenece solo al caso actual. */
    function reiniciarCaso() {
      S.used = new Set(); S.medido = false; S.luz = {}; S.volt = null;
      S.pistas = 0; S.pistaTxt = ''; S.dxFallos = 0; S.camPrematura = false;
      S.diagOK = false; S.reparada = false; S.repErr = 0; S.verificada = false; S.hallazgo = {}; S.repAceptada = null;
      S.variante = ronda % 2 ? 'mal' : 'defectuoso';
    }

    /* Un diagnóstico correcto solo se confirma si las pruebas discriminantes del caso están hechas. */
    function discrimaHecha(c) {
      if (!c.discrima) return true;
      var usadas = c.discrima.ids.every(function (id) { return S.used.has(id); });
      /* «exige» fija el resultado que debe dar cada prueba: la conclusión depende de lo que muestra la prueba, no solo de haberla hecho. */
      var exige = c.discrima.exige || {};
      return usadas && Object.keys(exige).every(function (id) { return S.hallazgo[id] === exige[id]; });
    }

    /* Criterio de utilidad: una prueba cuenta si cambia una lámpara o es medición básica (fuente o mínima configuración).
       Cambiar la fuente es una sustitución, no una prueba: nunca cuenta como útil. */
    function esUtil(id, c) {
      if (id === 'cam') return false;
      return !!c.luz[id] || id === 'fue' || id === 'min';
    }

    /* Puntuación de un caso (100 puntos), calculada al verificar la reparación.
       Diagnóstico 30 · pruebas útiles 20 · sin sustituciones prematuras 10 · tiempo 10 · pistas 10 ·
       diagnósticos sin errores 15 (−5 por cada error) · reparación y verificación 5.
       La reparación no suma si hubo un diagnóstico erróneo antes: una reparación acertada tras un diagnóstico fallido no se premia. */
    /* Reglas de la fórmula (cada acción puntúa en un único criterio):
       · Pruebas útiles (20): proporción de pruebas útiles sobre el total realizado, sin contar «cam».
       · Sin sustituciones prematuras (10): «cam» antes de medir la fuente resta todo este criterio.
       · Tiempo (10): cada 10 min de pruebas útiles NO requeridas por el caso resta 1 punto.
         Las pruebas discriminantes del caso son obligatorias y no restan tiempo.
       · Las pruebas no útiles solo restan en «Pruebas útiles»; así ninguna acción se penaliza dos veces. */
    function puntuarCaso(c) {
      /* 'cam' se evalúa solo en «Sin sustituciones prematuras»: fuera del denominador de pruebas útiles, para no penalizarla dos veces. */
      var usadas = Array.from(S.used).filter(function (id) { return id !== 'cam'; });
      var utiles = usadas.filter(function (id) { return esUtil(id, c); }).length;
      var extras = tiempoExtra(c);
      var partes = [];
      partes.push({ n: 'Diagnóstico correcto', pts: 30 });
      partes.push({ n: 'Pruebas útiles (' + utiles + ' de ' + usadas.length + ')', pts: usadas.length ? Math.round(20 * utiles / usadas.length) : 0 });
      partes.push({ n: 'Sin sustituciones prematuras', pts: S.camPrematura ? 0 : 10 });
      partes.push({ n: 'Tiempo (pruebas útiles extra: ' + extras / 5 + ')', pts: Math.max(0, 10 - Math.floor(extras / 10)) });
      var coste = [3, 3, 4];
      var sinPistas = 10 - coste.slice(0, S.pistas).reduce(function (a, b) { return a + b; }, 0);
      partes.push({ n: 'Pistas usadas (' + S.pistas + ' de 3)', pts: sinPistas });
      partes.push({ n: 'Diagnósticos sin errores (' + S.dxFallos + ' erróneos)', pts: Math.max(0, 15 - 5 * S.dxFallos) });
      var repPts = S.dxFallos ? 0 : 5;
      partes.push({ n: 'Reparación y verificación' + (S.dxFallos ? ' (sin puntos: hubo un diagnóstico erróneo)' : ''), pts: repPts });
      var total = Math.max(0, partes.reduce(function (a, p) { return a + p.pts; }, 0));
      return { total: total, partes: partes };
    }

    /* Minutos de pruebas útiles que no exige el caso (5 min cada una). Es el «tiempo extra» que se muestra y se puntúa. */
    function tiempoExtra(c) {
      var requeridas = c.discrima ? c.discrima.ids : [];
      return 5 * Array.from(S.used).filter(function (id) { return esUtil(id, c) && requeridas.indexOf(id) < 0; }).length;
    }

    function log(h) {
      var p = document.createElement('p');
      p.innerHTML = h;
      q('.log').appendChild(p);
    }

    /* Estado del equipo: lámparas, lecturas, pistas y cifras de la cabecera. Se recalcula con cada acción. */
    function pintarEstado() {
      var c = caso();
      qa('.lamp').forEach(function (l) {
        var id = l.dataset.c;
        var st = id === 'placa' ? (S.verificada ? 'ok' : undefined) : S.luz[id];
        l.classList.remove('ok', 'bad');
        if (st) l.classList.add(st);
        var txt = st === 'ok' ? 'correcto' : st === 'bad' ? 'fallo' : 'sin comprobar';
        l.querySelector('.lamp-s').textContent = st === 'ok' ? '✓' : st === 'bad' ? '✕' : '–';
        l.setAttribute('aria-label', l.dataset.nombre + ': ' + txt);
      });
      var vs = S.volt;
      qa('.vb').forEach(function (row, i) {
        var val = row.querySelector('.val'), b = row.querySelector('b'), st = row.querySelector('.vb-st');
        var x = !vs ? null : i === 0 ? vs.sen.ps : i === 1 ? vs.sen.sb : vs.v[i - 2];
        if (x === null) { val.textContent = '—'; if (b) b.style.width = '0'; row.classList.remove('bad'); st.textContent = ''; return; }
        val.textContent = x.toFixed(1).replace('.', ',') + ' V';
        if (b) b.style.width = Math.min(100, Math.max(0, (x / NOMINALES[i - 2]) * 100)) + '%';
        /* PS_ON# es una señal de control: se muestra su valor pero no se juzga con tolerancia. */
        var malo = i === 0 ? false : i === 1 ? !(x > 0) : (vs.fuera[i - 2] || !(x > 0));
        row.classList.toggle('bad', malo);
        st.textContent = i === 0 ? '' : malo ? '✕' : '✓';
      });
      var railes = ['+12 V', '+5 V', '+3,3 V'];
      q('.vnote').textContent = !vs ? 'Mide la fuente para ver los valores.'
        : vs.ok ? 'Los tres raíles están dentro de la tolerancia ATX (±5 %). Lecturas simuladas.'
        : vs.v.every(function (x) { return x <= 0; }) ? 'Sin tensión en ningún raíl: hay que separar la fuente de un posible corto en la placa.'
        : 'Fuera de tolerancia: ' + railes.filter(function (r, i) { return vs.fuera[i] || vs.v[i] <= 0; }).join(', ') + '. La fuente es sospechosa: hay que separarla de la placa.';
      pagina.querySelector('.tiempo-extra').textContent = tiempoExtra(c) + ' min';
      pagina.querySelector('.pistas-n').textContent = String(S.pistas);
      q('.pistas-q').textContent = 'Quedan ' + (3 - S.pistas) + ' de 3 pistas';
      q('.pista-txt').textContent = S.pistaTxt || 'Pide una pista si no sabes por dónde seguir. Cada pista resta puntos.';
    }

    /* Actualiza las pruebas usadas, el botón de pista y el estado del equipo sin reconstruir la lista. */
    function actualizarEstado() {
      var botones = qa('.acts button');
      /* Guardamos el botón con foco antes de deshabilitarlo: al deshabilitarse, el navegador le quita el foco. */
      var conFoco = document.activeElement;
      botones.forEach(function (b, i) {
        var usada = S.used.has(C.acciones[i][0]);
        b.disabled = usada;
        b.querySelector('.ui-usar').textContent = usada ? 'Usada' : 'Usar';
      });
      if (conFoco && conFoco.disabled) {
        var siguiente = Array.prototype.find.call(botones, function (b) { return !b.disabled; });
        if (siguiente) siguiente.focus(); else q('.caso-t').focus();
      }
      var bp = q('.pista');
      bp.disabled = S.diagOK || S.pistas >= 3;
      bp.textContent = S.pistas >= 3 ? 'Sin más pistas' : 'Pedir pista (−' + [3, 3, 4][S.pistas] + ' pts)';
      pintarEstado();
    }

    /* Pista progresiva: tres niveles, cada uno con su coste en puntos (ver puntuarCaso). */
    function pista() {
      var c = caso();
      if (S.diagOK || S.pistas >= 3) return;
      S.pistas++;
      S.pistaTxt = 'Pista ' + S.pistas + ' de 3: ' + c.pistas[S.pistas - 1];
      log('<span class="aviso">Pista ' + S.pistas + ' de 3</span> ' + c.pistas[S.pistas - 1]);
      actualizarEstado();
    }

    /* Pasos del temario: el caso actual y los ya resueltos. */
    function pintarPasos() {
      qa('.paso').forEach(function (p, i) {
        p.classList.toggle('hecho', i < S.i);
        p.classList.toggle('actual', i === S.i);
        if (i === S.i) p.setAttribute('aria-current', 'step'); else p.removeAttribute('aria-current');
      });
    }

    /* Última prueba realizada en este caso. */
    function pintarUltima(datos) {
      var cuerpo = q('.ultima-cuerpo');
      if (!datos) { cuerpo.innerHTML = '<p class="ultima-vacia">Aún no has hecho ninguna prueba en este caso.</p>'; return; }
      cuerpo.innerHTML = '<div class="ultima-fila"><span class="ui-ico">' + icono(datos.id) + '</span>' +
        '<div class="ultima-txt"><b>' + escapar(datos.titulo) + '</b><p>' + datos.texto + '</p></div>' +
        '<span class="pill' + (datos.fallida ? ' pill-bad' : '') + '">' + (datos.fallida ? 'Fallida' : 'Realizada') + '</span></div>';
    }

    function render() {
      var c = caso();
      q('.caso-n').textContent = 'Caso ' + (S.i + 1) + ' de ' + C.casos.length;
      q('.caso-t').textContent = 'Caso ' + (S.i + 1) + ': ' + c.t;
      q('.caso-s').textContent = c.s;
      pintarPasos();
      q('.next').hidden = true;
      q('.porque').hidden = true;
      q('.explicacion').innerHTML = '';
      q('.log').innerHTML = '';
      q('.verif-box').hidden = true;
      pintarUltima(null);
      var acts = q('.acts');
      acts.innerHTML = '';
      C.acciones.forEach(function (a) {
        var b = el('button', { class: 'prueba', type: 'button' }, acts);
        b.innerHTML = '<span class="ui-ico">' + icono(a[0]) + '</span>' +
          '<span class="ui-txt"><b>' + escapar(a[1]) + '</b><small>' + escapar(a[2] || '') + '</small></span>' +
          '<span class="ui-usar">Usar</span><span class="ui-chev" aria-hidden="true">›</span>';
        b.onclick = function () { actuar(a[0]); };
      });
      var dx = q('.dx-sel');
      dx.innerHTML = '';
      el('option', { value: '' }, dx).textContent = '(Ninguna)';
      Object.keys(C.causas).forEach(function (k) { el('option', { value: k }, dx).textContent = C.causas[k]; });
      dx.disabled = false; dx.value = '';
      q('.dx-btn').disabled = true;
      var rs = q('.reps-sel');
      rs.innerHTML = '';
      el('option', { value: '' }, rs).textContent = '(Ninguna)';
      rs.disabled = true; rs.value = '';
      q('.rep-btn').disabled = true;
      /* Recalcula pistas y pruebas deshabilitadas del caso nuevo (si no, la pista del caso anterior quedaría bloqueada). */
      actualizarEstado();
    }

    function actuar(id) {
      var c = caso();
      S.used.add(id);
      if (id === 'fue') {
        var v = c.volt || [0, 0, 0];
        var fuera = fueraDeTolerancia(v);
        S.medido = true;
        S.volt = { v: v, fuera: fuera, ok: !fuera.some(Boolean) && v.every(function (x) { return x > 0; }), sen: c.senales || { ps: 5, sb: 5 } };
      }
      if (c.luz[id]) S.luz[c.luz[id][0]] = c.luz[id][1];
      /* Resultado de la prueba: 'fallo' si el caso la marca como fallida; 'sin_fallo' en otro caso. */
      S.hallazgo[id] = c.fallos && c.fallos[id] ? 'fallo' : 'sin_fallo';
      var t = c.res[id] || 'No aporta nada nuevo en este caso.';
      /* La inspección visual no confirma conexiones ni temperaturas: si no enciende ninguna lámpara, se marca como inconcluyente. */
      if (!esUtil(id, c)) t = (id === 'vis' ? '<span class="aviso">Inconcluyente:</span> ' : '<span class="aviso">Prueba poco útil aquí:</span> ') + t;
      /* Un fallo de prueba: el resultado es negativo y se muestra en rojo. Cuesta lo mismo que una prueba normal. */
      var fallida = !!(c.fallos && c.fallos[id]);
      if (fallida) t = '<span class="bad">Prueba fallida.</span> ' + c.fallos[id];
      if (id === 'cam' && !S.medido) { S.camPrematura = true; t += ' <span class="bad">Sustitución prematura: mide la fuente antes de cambiarla (sin puntos en este criterio).</span>'; }
      var titulo = C.acciones.filter(function (x) { return x[0] === id; })[0][1];
      pintarUltima({ id: id, titulo: titulo, texto: t, fallida: fallida });
      log(t);
      actualizarEstado();
    }

    function mostrarExplicacion(c) {
      q('.explicacion').innerHTML = '<dl>' + c.explicacion.map(function (p) {
        return '<dt>' + p[0] + '</dt><dd>' + p[1] + '</dd>';
      }).join('') + '</dl>';
      q('.porque').hidden = false;
    }

    /* Informe de intervención: lo que se confirmó, con qué pruebas, qué se reparó y cómo se verificó. */
    function mostrarInforme(c, v) {
      var pruebas = Array.from(S.used).map(function (id) {
        var a = C.acciones.filter(function (x) { return x[0] === id; })[0];
        return a ? a[1] : id;
      });
      q('.explicacion').insertAdjacentHTML('beforeend',
        '<h3 class="label">Informe de intervención</h3><dl>' +
          '<dt>Causa confirmada</dt><dd>' + escapar(C.causas[c.causa]) + '</dd>' +
          '<dt>Pruebas realizadas</dt><dd>' + (pruebas.length ? escapar(pruebas.join('; ')) : 'Ninguna') + '</dd>' +
          '<dt>Reparación</dt><dd>' + escapar(S.repAceptada.t) + '</dd>' +
          '<dt>Verificación</dt><dd>' + escapar(v.t) + '</dd>' +
        '</dl>');
    }

    function diag(k) {
      var c = caso();
      if (S.diagOK) return;
      var dx = q('.dx-sel');
      if (k !== c.causa) {
        S.dxFallos++;
        /* Cada causa descartada se penaliza una sola vez: su opción se deshabilita. */
        dx.querySelector('option[value="' + k + '"]').disabled = true;
        dx.value = '';
        q('.dx-btn').disabled = true;
        log('<span class="bad">No es esta causa.</span> Revisa lo que llevas medido. (−5 puntos en este caso)');
        actualizarEstado();
        dx.focus();
        return;
      }
      if (!discrimaHecha(c)) {
        /* No es un error: la causa encaja, pero hay otra compatible con el mismo síntoma que hay que descartar primero. */
        log('<span class="aviso">Todavía no lo confirmo.</span> ' + c.discrima.texto);
        return;
      }
      S.diagOK = true;
      S.luz[C.causaLampara[k]] = 'bad';
      dx.disabled = true;
      q('.dx-btn').disabled = true;
      log('<span class="ok">Diagnóstico confirmado.</span> ' + c.explica + ' Ahora elige cómo lo reparas.');
      mostrarExplicacion(c);
      var rs = q('.reps-sel');
      rs.innerHTML = '';
      el('option', { value: '' }, rs).textContent = '(Ninguna)';
      c.reparaciones.forEach(function (r, i) { el('option', { value: String(i) }, rs).textContent = r.t; });
      rs.disabled = false; rs.value = '';
      q('.verif-box').hidden = true;
      actualizarEstado();
      rs.focus();
    }

    function reparar(i) {
      var c = caso();
      var r = c.reparaciones[i];
      var rs = q('.reps-sel');
      /* «requiere»: la reparación solo se acepta si el resultado de las pruebas la justifica. */
      var justificada = !r.requiere || Object.keys(r.requiere).every(function (id) { return S.hallazgo[id] === r.requiere[id]; });
      if (!r.ok || !justificada) {
        S.repErr++;
        rs.querySelector('option[value="' + i + '"]').disabled = true;
        rs.value = '';
        q('.rep-btn').disabled = true;
        var motivo = !r.ok ? 'Esta reparación no corrige la causa.' : 'Esta reparación no está justificada por lo que has medido.';
        log('<span class="bad">' + motivo + '</span> ' + (r.ok ? r.noJustificada : r.res));
        rs.focus();
        return;
      }
      S.reparada = true;
      S.repAceptada = r;
      rs.disabled = true;
      q('.rep-btn').disabled = true;
      log('<span class="ok">Reparación correcta.</span> ' + r.res + ' Ahora verifícala.');
      var vs = q('.verifs-sel');
      vs.innerHTML = '';
      el('option', { value: '' }, vs).textContent = '(Ninguna)';
      c.verificaciones.forEach(function (v, j) { el('option', { value: String(j) }, vs).textContent = v.t; });
      vs.disabled = false; vs.value = '';
      q('.verif-btn').disabled = true;
      q('.verif-box').hidden = false;
      vs.focus();
    }

    function verificar(j) {
      var c = caso();
      var v = c.verificaciones[j];
      var vs = q('.verifs-sel');
      if (!v.ok) {
        vs.querySelector('option[value="' + j + '"]').disabled = true;
        vs.value = '';
        q('.verif-btn').disabled = true;
        log('<span class="bad">Sin verificación.</span> ' + v.res);
        vs.focus();
        return;
      }
      S.verificada = true;
      S.varHist[S.i] = S.variante;
      vs.disabled = true;
      q('.verif-btn').disabled = true;
      var res = puntuarCaso(c);
      S.pts.push(res.total);
      S.desglose.push(res.partes);
      log('<span class="ok">Verificado.</span> ' + v.res + ' <b>Puntuación del caso: ' + res.total + '/100</b>');
      mostrarInforme(c, v);
      actualizarEstado();
      var n = q('.next');
      n.hidden = false;
      n.textContent = S.i + 1 < C.casos.length ? 'Siguiente caso →' : 'Ver resultado';
      n.focus();
    }

    function fin() {
      var media = Math.round(S.pts.reduce(function (a, b) { return a + b; }, 0) / S.pts.length);
      var msg = media >= 80 ? 'Muy buen diagnóstico: piensas por orden y mides antes de cambiar.'
        : media >= 50 ? 'Bien, pero en algún caso has cambiado piezas de más.'
        : 'Repasa el orden de las pruebas de la S12 y vuelve a intentarlo.';
      q('.caso-wrap').hidden = true;
      var f = q('.fin');
      f.hidden = false;
      var repaso = C.casos.map(function (base, i) {
        var c = casoEn(i, S.varHist[i] || 'defectuoso');
        var leccion = c.explicacion[c.explicacion.length - 1][1];
        var desglose = (S.desglose[i] || []).map(function (p) {
          return '<li>' + escapar(p.n) + ': <span class="val">' + (p.pts >= 0 ? '+' : '') + p.pts + '</span></li>';
        }).join('');
        return '<li><span class="repaso-t">' + escapar(c.t) + '</span> <span class="val">' + S.pts[i] + '/100</span>' +
          '<ul class="desglose">' + desglose + '</ul><p>' + leccion + '</p></li>';
      }).join('');
      f.innerHTML = '<h2>Media: ' + media + '/100</h2><p>' + msg + '</p>' +
        '<h3 class="label">Repaso de las averías</h3><ol class="repaso">' + repaso + '</ol>' +
        '<button class="btn-prim repetir" type="button">Repetir</button>';
      f.querySelector('.repetir').onclick = function () {
        ronda++;
        nuevo();
        q('.caso-wrap').hidden = false;
        f.hidden = true;
        render();
      };
    }

    raiz.innerHTML =
      '<ol class="pasos" aria-label="Progreso de los casos">' + C.casos.map(function (c, i) {
        return '<li class="paso" data-i="' + i + '"><span class="paso-n">' + (i + 1) + '</span><span class="paso-t">' + (i === 0 ? 'Caso actual' : 'Caso ' + (i + 1)) + '</span></li>';
      }).join('') + '</ol>' +
      '<div class="caso-wrap">' +
        '<div class="caso-col">' +
          '<section class="card cabecera">' +
            '<div class="cab-top"><h2 class="caso-t"></h2><span class="caso-n badge"></span></div>' +
            '<p class="caso-s"></p>' +
          '</section>' +
          '<div class="tabs-u" role="tablist" aria-label="Vista del caso">' +
            '<button type="button" role="tab" id="tab-pruebas" class="tab-u" aria-selected="true" aria-controls="pan-pruebas">Pruebas disponibles</button>' +
            '<button type="button" role="tab" id="tab-registro" class="tab-u" aria-selected="false" aria-controls="pan-registro">Registro del caso</button>' +
          '</div>' +
          '<section class="card" id="pan-pruebas" role="tabpanel" aria-labelledby="tab-pruebas">' +
            '<div class="acts" role="group" aria-label="Pruebas disponibles"></div>' +
          '</section>' +
          '<section class="card" id="pan-registro" role="tabpanel" aria-labelledby="tab-registro" hidden>' +
            '<div class="log" aria-live="polite"></div>' +
          '</section>' +
          '<section class="card ultima" aria-live="polite">' +
            '<h3 class="label">Última prueba realizada</h3>' +
            '<div class="ultima-cuerpo"></div>' +
            '<div class="acciones-caso">' +
              '<button type="button" class="btn-sec" disabled title="No se puede volver a un caso ya resuelto">← Anterior</button>' +
              '<button type="button" class="next btn-prim" hidden>Siguiente caso →</button>' +
            '</div>' +
          '</section>' +
          '<details class="porque" hidden><summary>Por qué ocurre</summary><div class="explicacion"></div></details>' +
        '</div>' +
        '<aside class="caso-der">' +
          '<section class="card">' +
            '<figure class="foto-placa"><img src="motherboard.jpg" alt="Placa base ATX" width="1800" height="1497"></figure>' +
            '<h3 class="label">Estado del equipo</h3>' +
            '<ul class="lamps">' + C.lamparas.map(function (l) {
              return '<li class="lamp" data-c="' + l[0] + '" data-nombre="' + escapar(l[1]) + '"><span class="lamp-n">' + escapar(l[1]) + '</span><span class="lamp-s" aria-hidden="true"></span></li>';
            }).join('') + '</ul>' +
          '</section>' +
          '<section class="card">' +
            '<h3 class="label">Indicadores y lecturas</h3>' +
            '<ul class="volts">' + ['PS_ON#', '5VSB (en apagado)', '+12 V', '+5 V', '+3,3 V'].map(function (t, i) {
              return '<li class="vb' + (i < 2 ? ' sin-barra' : '') + '"><span class="vb-n">' + t + '</span><span class="bar"><b></b></span><span class="val">—</span><span class="vb-st" aria-hidden="true"></span></li>';
            }).join('') + '</ul>' +
            '<p class="vnote"></p>' +
          '</section>' +
          '<section class="card">' +
            '<div class="cab-pistas"><h3 class="label">Pistas</h3><span class="pistas-q"></span></div>' +
            '<p class="pista-txt"></p>' +
            '<button type="button" class="pista btn-sec">Pedir pista</button>' +
          '</section>' +
          '<section class="card">' +
            '<h3 class="label">¿Cuál es la causa?</h3>' +
            '<div class="fila"><select class="dx-sel" aria-label="Causa de la avería"></select>' +
            '<button type="button" class="dx-btn btn-prim" disabled>Confirmar causa</button></div>' +
          '</section>' +
          '<section class="card">' +
            '<h3 class="label">Reparación y verificación</h3>' +
            '<div class="fila"><select class="reps-sel" aria-label="Reparación seleccionada" disabled></select>' +
            '<button type="button" class="rep-btn btn-prim" disabled>Verificar reparación</button></div>' +
            '<div class="verif-box" hidden>' +
              '<h4 class="label">Verificación</h4>' +
              '<div class="fila"><select class="verifs-sel" aria-label="Verificación"></select>' +
              '<button type="button" class="verif-btn btn-prim" disabled>Confirmar verificación</button></div>' +
            '</div>' +
          '</section>' +
          '<p class="foot">Cambia una sola cosa cada vez. Cambiar una pieza sin medir antes resta puntos de evidencia.</p>' +
        '</aside>' +
      '</div>' +
      '<div class="card fin" hidden></div>';

    q('.pista').onclick = pista;
    q('.dx-sel').onchange = function () { q('.dx-btn').disabled = !this.value; };
    q('.dx-btn').onclick = function () { var v = q('.dx-sel').value; if (v) diag(v); };
    q('.reps-sel').onchange = function () { q('.rep-btn').disabled = !this.value; };
    q('.rep-btn').onclick = function () { var v = q('.reps-sel').value; if (v !== '') reparar(Number(v)); };
    q('.verifs-sel').onchange = function () { q('.verif-btn').disabled = !this.value; };
    q('.verif-btn').onclick = function () { var v = q('.verifs-sel').value; if (v !== '') verificar(Number(v)); };
    [['tab-pruebas', 'pan-pruebas'], ['tab-registro', 'pan-registro']].forEach(function (par) {
      q('#' + par[0]).onclick = function () {
        qa('.tab-u').forEach(function (t) { t.setAttribute('aria-selected', t.id === par[0]); });
        qa('[role=tabpanel]').forEach(function (p) { p.hidden = p.id !== par[1]; });
      };
    });

    q('.next').onclick = function () {
      /* Solo se avanza con el caso verificado: el botón puede dispararse por código aunque esté oculto. */
      if (!S.verificada) return;
      if (S.i + 1 < C.casos.length) {
        S.i++; reiniciarCaso();
        render();
      } else {
        fin();
      }
    };

    nuevo();
    render();
    /* Reinicio desde Ajustes: vuelve al primer caso sin cambiar la alternancia de escenarios. */
    return {
      reiniciar: function () {
        nuevo();
        q('.caso-wrap').hidden = false;
        q('.fin').hidden = true;
        render();
      }
    };
  }

  /* ---------- MAPA ---------- */
  function mapa(tema, raiz) {
    var F = tema.mapa.foto, Z = tema.mapa.zonas;
    var ids = Object.keys(Z);
    var q = function (s) { return raiz.querySelector(s); };
    var modo = 'explorar', Q = null, bloqueado = false, timer = null;

    var cr = F.credito;
    var credito = cr ? '<p class="credit">Foto: <a href="' + cr.autorUrl + '">' + escapar(cr.autor) + '</a>, Wikimedia Commons, licencia <a href="' + cr.licenciaUrl + '">' + escapar(cr.licencia) + '</a>. ' + escapar(cr.nota) + '</p>' : '';

    raiz.innerHTML =
      '<div class="card">' +
        '<div class="modes">' +
          '<button type="button" class="mE" aria-pressed="true">Explorar</button>' +
          '<button type="button" class="mQ" aria-pressed="false">Quiz</button>' +
          '<span class="qScore val"></span>' +
        '</div>' +
        '<figure class="map"><svg class="mapa" viewBox="0 0 ' + F.ancho + ' ' + F.alto + '" role="group" aria-label="' + escapar(F.alt) + '">' +
          '<image href="' + F.src + '" x="0" y="0" width="' + F.ancho + '" height="' + F.alto + '" preserveAspectRatio="xMidYMid meet"/>' +
          '<g class="zonas"></g>' +
        '</svg></figure>' +
        '<div class="legend">' +
          '<span><i class="sw sw-hover"></i>Cursor o foco</span>' +
          '<span><i class="sw sw-hit"></i>Acierto</span>' +
          '<span><i class="sw sw-miss"></i>Fallo</span>' +
        '</div>' +
        '<div class="log info" aria-live="polite"></div>' +
      '</div>' + credito;

    var zonasG = q('.zonas');

    ids.forEach(function (id) {
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'z');
      g.setAttribute('data-id', id);
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', Z[id].n);
      Z[id].rects.forEach(function (r) {
        var rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('x', r[0]); rect.setAttribute('y', r[1]);
        rect.setAttribute('width', r[2]); rect.setAttribute('height', r[3]);
        g.appendChild(rect);
      });
      g.addEventListener('click', function () { zona(id); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zona(id); }
      });
      zonasG.appendChild(g);
    });

    function zonaEl(id) { return zonasG.querySelector('[data-id="' + id + '"]'); }
    function limpiar() { zonasG.querySelectorAll('.z').forEach(function (g) { g.classList.remove('hit', 'miss', 'pulse'); }); }
    function mezclar(a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    }

    function setModo(m) {
      modo = m; limpiar(); bloqueado = false; clearTimeout(timer);
      q('.mE').setAttribute('aria-pressed', m === 'explorar');
      q('.mQ').setAttribute('aria-pressed', m === 'quiz');
      if (m === 'quiz') {
        Q = { list: mezclar(ids).slice(0, Math.min(10, ids.length)), i: 0, ok: 0 };
        preguntar();
      } else {
        Q = null;
        q('.qScore').textContent = '';
        q('.info').innerHTML = 'Pincha una zona de la placa para ver qué es y para qué sirve.';
      }
    }

    function preguntar() {
      limpiar(); bloqueado = false;
      if (Q.i >= Q.list.length) {
        q('.info').innerHTML = '<b>Fin del quiz:</b> ' + Q.ok + ' de ' + Q.list.length + ' aciertos.';
        q('.qScore').textContent = '';
        var rep = document.createElement('button');
        rep.type = 'button';
        rep.className = 'mQ repetir';
        rep.textContent = 'Repetir quiz';
        rep.onclick = function () { setModo('quiz'); };
        q('.info').appendChild(rep);
        rep.focus();
        return;
      }
      var target = Q.list[Q.i];
      zonaEl(target).classList.add('pulse');
      q('.info').innerHTML = 'Pincha: <b>' + escapar(Z[target].n) + '</b>';
      q('.qScore').textContent = 'Aciertos: ' + Q.ok + '/' + Q.i;
    }

    function zona(id) {
      if (modo === 'explorar') {
        q('.info').innerHTML = '<b>' + escapar(Z[id].n) + '</b><p class="info-d">' + escapar(Z[id].d) + '</p>';
        return;
      }
      if (!Q || bloqueado || Q.i >= Q.list.length) return;
      bloqueado = true;
      var target = Q.list[Q.i];
      var g = zonaEl(id), gt = zonaEl(target);
      gt.classList.remove('pulse');
      if (id === target) {
        g.classList.add('hit'); Q.ok++;
        q('.info').innerHTML = '<span class="ok">Correcto.</span> ' + escapar(Z[target].d);
      } else {
        g.classList.add('miss'); gt.classList.add('hit');
        q('.info').innerHTML = '<span class="bad">No era esa.</span> Era <b>' + escapar(Z[target].n) + '</b>: ' + escapar(Z[target].d);
      }
      Q.i++;
      /* El marcador se actualiza al responder; el alumno avanza cuando quiere, sin temporizador. */
      q('.qScore').textContent = 'Aciertos: ' + Q.ok + '/' + Q.i;
      var sig = document.createElement('button');
      sig.type = 'button';
      sig.className = 'mQ siguiente';
      sig.textContent = Q.i < Q.list.length ? 'Siguiente pregunta →' : 'Ver resultado';
      sig.onclick = function () { preguntar(); };
      q('.info').appendChild(sig);
      sig.focus();
    }

    q('.mE').onclick = function () { setModo('explorar'); };
    q('.mQ').onclick = function () { setModo('quiz'); };
    setModo('explorar');
  }

  /* ---------- SHELL DEL TEMARIO ---------- */
  var ICONO_CHIP = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>';

  function iniciar(root, temas) {
    if (!temas || !temas.length) { root.textContent = 'No hay temas registrados.'; return; }
    /* Vista a la que lleva cada elemento de navegación. «caso» muestra la vista de inicio y se desplaza al caso. */
    var DESTINO = { inicio: 'inicio', caso: 'inicio', mapa: 'mapa', recursos: 'recursos', ayuda: 'ayuda', ajustes: 'ajustes' };
    var sim = null;

    /* Tema: si el usuario eligió uno antes, se aplica; si no, el predeterminado es el oscuro (ver :root en averias.html). */
    function temaActual() {
      return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }

    function mostrar(indice) {
      var tema = temas[indice];
      var navTemas = temas.length > 1
        ? '<div class="temas" role="group" aria-label="Temas del temario">' + temas.map(function (t, i) {
            return '<button type="button" class="tema" data-i="' + i + '" aria-current="' + (i === indice) + '">' + escapar(t.titulo) + '</button>';
          }).join('') + '</div>'
        : '';
      root.innerHTML =
        '<div class="app">' +
          '<aside class="side">' +
            '<div class="marca">' + ICONO_CHIP + '<div><b>Microinformática</b><small>Simulador de averías</small></div></div>' +
            '<nav class="nav" aria-label="Secciones">' +
              '<button type="button" class="nav-item" data-v="inicio">Inicio</button>' +
              '<button type="button" class="nav-item" data-v="caso">Caso actual</button>' +
              '<button type="button" class="nav-item" data-v="mapa">Mapa del quiz</button>' +
              '<button type="button" class="nav-item" data-v="recursos">Recursos</button>' +
              '<button type="button" class="nav-item" data-v="ayuda">Ayuda</button>' +
            '</nav>' +
            '<div class="side-pie">' +
              '<div class="fila-switch"><span id="lbl-tema">Tema claro</span>' +
              '<button type="button" class="switch" role="switch" aria-labelledby="lbl-tema" aria-checked="false"></button></div>' +
              '<button type="button" class="nav-item" data-v="ajustes">Ajustes</button>' +
            '</div>' +
          '</aside>' +
          '<div class="principal">' +
            '<header class="topbar">' +
              '<a class="volver" href="index.html">← Volver al temario</a>' +
              '<div class="stats"><span>Tiempo extra: <b class="tiempo-extra">0 min</b></span><span>Pistas: <b class="pistas-n">0</b></span></div>' +
            '</header>' +
            navTemas +
            '<section class="vista" data-v="inicio">' +
              '<header class="cabecera-pag"><h1>' + escapar(tema.titulo) + '</h1><p class="intro">' + escapar(tema.resumen) + '</p></header>' +
              '<div class="sim-raiz"></div>' +
            '</section>' +
            '<section class="vista" data-v="mapa" hidden><div class="mapa-raiz"></div></section>' +
            '<section class="vista" data-v="recursos" hidden>' +
              '<h1>Recursos</h1>' +
              '<ul class="enlaces">' +
                '<li><a href="apuntes/ver-s12.html">Apuntes S12: diagnóstico guiado</a></li>' +
                '<li><a href="apuntes/ver-s07.html">Apuntes S07: fuente de alimentación</a></li>' +
                '<li><a href="examen.html">Examen de práctica</a></li>' +
                '<li><a href="index.html">Inicio del temario</a></li>' +
              '</ul>' +
            '</section>' +
            '<section class="vista" data-v="ayuda" hidden>' +
              '<h1>Ayuda</h1>' +
              '<ol class="pasos-ayuda">' +
                '<li>Elige una prueba con «Usar». Cada una cuesta 5 minutos.</li>' +
                '<li>Confirma la causa cuando las pruebas la justifiquen. Si una causa encaja con el síntoma pero hay otra compatible, la prueba discriminante es la que decide.</li>' +
                '<li>Elige la reparación y verifícala. Solo se avanza con una verificación válida.</li>' +
                '<li>Las pistas son tres y restan puntos.</li>' +
              '</ol>' +
            '</section>' +
            '<section class="vista" data-v="ajustes" hidden>' +
              '<h1>Ajustes</h1>' +
              '<div class="card"><p>Reinicia el simulador para empezar otra vez desde el caso 1. El progreso no se guarda en este navegador.</p>' +
              '<button type="button" class="btn-sec" id="reiniciar-sim">Reiniciar simulación</button></div>' +
            '</section>' +
          '</div>' +
        '</div>';

      /* Navegación entre secciones. «Caso actual» lleva a la vista de inicio y se desplaza al caso. */
      function ir(destino) {
        var vista = DESTINO[destino] || 'inicio';
        root.querySelectorAll('.vista').forEach(function (s) { s.hidden = s.dataset.v !== vista; });
        root.querySelectorAll('.nav-item').forEach(function (b) {
          if (b.dataset.v === destino) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
        });
      }
      root.querySelectorAll('.nav-item').forEach(function (b) {
        b.onclick = function () {
          ir(b.dataset.v);
          if (b.dataset.v === 'caso') { var c = root.querySelector('.caso-wrap'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        };
      });
      root.querySelectorAll('.tema').forEach(function (b) {
        b.onclick = function () { mostrar(+b.dataset.i); };
      });

      var sw = root.querySelector('.switch');
      function pintarSwitch() { sw.setAttribute('aria-checked', String(temaActual() === 'light')); }
      sw.onclick = function () {
        var nuevoTema = temaActual() === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nuevoTema);
        try { localStorage.setItem('temario-tema', nuevoTema); } catch (e) { /* almacenamiento bloqueado: el tema dura solo esta visita */ }
        pintarSwitch();
      };
      pintarSwitch();

      sim = simulador(tema, root.querySelector('.sim-raiz'), root);
      mapa(tema, root.querySelector('.mapa-raiz'));
      root.querySelector('#reiniciar-sim').onclick = function () { sim.reiniciar(); ir('inicio'); };
      ir('inicio');
    }

    try {
      var guardado = localStorage.getItem('temario-tema');
      if (guardado === 'light' || guardado === 'dark') document.documentElement.setAttribute('data-theme', guardado);
    } catch (e) { /* sin almacenamiento: se usa el tema oscuro predeterminado */ }

    mostrar(0);
  }

  window.Temario = { iniciar: iniciar };
})();
