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
  function simulador(tema, raiz) {
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
      S = { i: 0, costo: 0, used: new Set(), medido: false, pts: [], desglose: [], luz: {}, volt: null, varHist: [], repAceptada: null };
      reiniciarCaso();
    }

    /* Estado que pertenece solo al caso actual. */
    function reiniciarCaso() {
      S.costo = 0; S.used = new Set(); S.medido = false; S.luz = {}; S.volt = null;
      S.pistas = 0; S.dxFallos = 0; S.camPrematura = false;
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
      var requeridas = c.discrima ? c.discrima.ids : [];
      var extras = usadas.filter(function (id) { return esUtil(id, c) && requeridas.indexOf(id) < 0; }).length;
      var partes = [];
      partes.push({ n: 'Diagnóstico correcto', pts: 30 });
      partes.push({ n: 'Pruebas útiles (' + utiles + ' de ' + usadas.length + ')', pts: usadas.length ? Math.round(20 * utiles / usadas.length) : 0 });
      partes.push({ n: 'Sin sustituciones prematuras', pts: S.camPrematura ? 0 : 10 });
      partes.push({ n: 'Tiempo (pruebas útiles extra: ' + extras + ')', pts: Math.max(0, 10 - Math.floor(5 * extras / 10)) });
      var coste = [3, 3, 4];
      var sinPistas = 10 - coste.slice(0, S.pistas).reduce(function (a, b) { return a + b; }, 0);
      partes.push({ n: 'Pistas usadas (' + S.pistas + ' de 3)', pts: sinPistas });
      partes.push({ n: 'Diagnósticos sin errores (' + S.dxFallos + ' erróneos)', pts: Math.max(0, 15 - 5 * S.dxFallos) });
      var repPts = S.dxFallos ? 0 : 5;
      partes.push({ n: 'Reparación y verificación' + (S.dxFallos ? ' (sin puntos: hubo un diagnóstico erróneo)' : ''), pts: repPts });
      var total = Math.max(0, partes.reduce(function (a, p) { return a + p.pts; }, 0));
      return { total: total, partes: partes };
    }

    function log(h) {
      var p = document.createElement('p');
      p.innerHTML = h;
      q('.log').appendChild(p);
    }

    function pintarRack() {
      qa('.lamp').forEach(function (l) {
        var st = S.luz[l.dataset.c];
        l.classList.remove('ok', 'bad');
        if (st) l.classList.add(st);
      });
      var vs = S.volt;
      qa('.vb').forEach(function (row, i) {
        var b = row.querySelector('b'), val = row.querySelector('.val');
        if (!vs) { b.style.width = '0'; val.textContent = '—'; row.classList.remove('bad'); return; }
        var v = vs.v[i];
        b.style.width = Math.min(100, Math.max(0, (v / NOMINALES[i]) * 100)) + '%';
        val.textContent = v.toFixed(2).replace('.', ',') + ' V';
        row.classList.toggle('bad', !vs.ok);
      });
      var railes = ['+12 V', '+5 V', '+3,3 V'];
      q('.vnote').textContent = !vs ? 'Mide la fuente para ver los valores.'
        : vs.ok ? 'Los tres raíles están dentro de la tolerancia ATX (±5 %). Lecturas simuladas.'
        : vs.v.every(function (x) { return x <= 0; }) ? 'Sin tensión en ningún raíl: hay que separar la fuente de un posible corto en la placa.'
        : 'Fuera de tolerancia: ' + railes.filter(function (r, i) { return vs.fuera[i] || vs.v[i] <= 0; }).join(', ') + '. La fuente es sospechosa: hay que separarla de la placa.';
    }

    /* Actualiza botones deshabilitados, tiempo y lámparas sin reconstruir la lista. */
    function actualizarEstado() {
      var botones = qa('.acts button');
      /* Guardamos el botón con foco antes de deshabilitarlo: al deshabilitarse, el navegador le quita el foco. */
      var conFoco = document.activeElement;
      botones.forEach(function (b, i) { b.disabled = S.used.has(C.acciones[i][0]); });
      if (conFoco && conFoco.disabled) {
        var siguiente = Array.prototype.find.call(botones, function (b) { return !b.disabled; });
        if (siguiente) siguiente.focus();
        else { q('.log').tabIndex = -1; q('.log').focus(); }
      }
      q('.coste').textContent = 'Tiempo gastado: ' + S.costo + ' min';
      var bp = q('.pista');
      bp.disabled = S.diagOK || S.pistas >= 3;
      bp.textContent = S.pistas >= 3 ? 'Sin más pistas' : 'Pista (' + (S.pistas + 1) + ' de 3 · −' + [3, 3, 4][S.pistas] + ' pts)';
      pintarRack();
    }

    /* Pista progresiva: tres niveles, cada uno con su coste en puntos (ver puntuarCaso). */
    function pista() {
      var c = caso();
      if (S.diagOK || S.pistas >= 3) return;
      S.pistas++;
      log('<span class="aviso">Pista ' + S.pistas + ' de 3</span> ' + c.pistas[S.pistas - 1]);
      actualizarEstado();
    }

    function render() {
      var c = caso();
      q('.caso-n').textContent = 'Caso ' + (S.i + 1) + ' de ' + C.casos.length;
      q('.caso-t').textContent = c.t;
      q('.caso-s').textContent = c.s;
      q('.coste').textContent = 'Tiempo gastado: ' + S.costo + ' min';
      q('.rep').hidden = true;
      q('.verif-box').hidden = true;
      q('.explicacion').hidden = true;
      q('.next').hidden = true;
      var acts = q('.acts');
      acts.innerHTML = '';
      C.acciones.forEach(function (a) {
        var b = el('button', { class: 'act', type: 'button' }, acts);
        b.textContent = a[1];
        b.disabled = S.used.has(a[0]);
        b.onclick = function () { actuar(a[0]); };
      });
      var dx = q('.dx');
      dx.innerHTML = '';
      Object.keys(C.causas).forEach(function (k) {
        var b = el('button', { class: 'act', type: 'button' }, dx);
        b.textContent = C.causas[k];
        b.onclick = function () { diag(k); };
      });
      /* Recalcula pistas y pruebas deshabilitadas del caso nuevo (si no, la pista del caso anterior quedaría bloqueada). */
      actualizarEstado();
    }

    function actuar(id) {
      var c = caso();
      S.used.add(id);
      S.costo += 5;
      if (id === 'fue') {
        var v = c.volt || [0, 0, 0];
        var fuera = fueraDeTolerancia(v);
        S.medido = true;
        S.volt = { v: v, fuera: fuera, ok: !fuera.some(Boolean) && v.every(function (x) { return x > 0; }) };
      }
      if (c.luz[id]) S.luz[c.luz[id][0]] = c.luz[id][1];
      /* Resultado de la prueba: 'fallo' si el caso la marca como fallida; 'sin_fallo' en otro caso. */
      S.hallazgo[id] = c.fallos && c.fallos[id] ? 'fallo' : 'sin_fallo';
      var t = c.res[id] || 'No aporta nada nuevo en este caso.';
      /* La inspección visual no confirma conexiones ni temperaturas: si no enciende ninguna lámpara, se marca como inconcluyente. */
      if (!esUtil(id, c)) t = (id === 'vis' ? '<span class="aviso">Inconcluyente:</span> ' : '<span class="aviso">Prueba poco útil aquí:</span> ') + t;
      /* Un fallo de prueba: el resultado es negativo y se muestra en rojo. Cuesta lo mismo que una prueba normal. */
      if (c.fallos && c.fallos[id]) t = '<span class="bad">Prueba fallida.</span> ' + c.fallos[id];
      if (id === 'cam' && !S.medido) { S.camPrematura = true; t += ' <span class="bad">Sustitución prematura: mide la fuente antes de cambiarla (sin puntos en este criterio).</span>'; }
      log(t);
      actualizarEstado();
    }

    function mostrarExplicacion(c) {
      var box = q('.explicacion');
      box.innerHTML = '<h3 class="label">Por qué ocurre</h3><dl>' + c.explicacion.map(function (p) {
        return '<dt>' + p[0] + '</dt><dd>' + p[1] + '</dd>';
      }).join('') + '</dl>';
      box.hidden = false;
    }

    /* Informe de intervención: lo que se confirmó, con qué pruebas, qué se reparó y cómo se verificó. */
    function mostrarInforme(c, v) {
      var pruebas = Array.from(S.used).map(function (id) {
        var a = C.acciones.filter(function (x) { return x[0] === id; })[0];
        return a ? a[1] : id;
      });
      var box = q('.explicacion');
      box.insertAdjacentHTML('beforeend',
        '<h3 class="label">Informe de intervención</h3><dl>' +
          '<dt>Causa confirmada</dt><dd>' + escapar(C.causas[c.causa]) + '</dd>' +
          '<dt>Pruebas realizadas</dt><dd>' + (pruebas.length ? escapar(pruebas.join('; ')) : 'Ninguna') + '</dd>' +
          '<dt>Reparación</dt><dd>' + escapar(S.repAceptada.t) + '</dd>' +
          '<dt>Verificación</dt><dd>' + escapar(v.t) + '</dd>' +
        '</dl>');
    }

    /* Enfoca el siguiente botón habilitado de un grupo, o el registro si no queda ninguno. */
    function enfocarSiguiente(botones) {
      var siguiente = Array.prototype.find.call(botones, function (b) { return !b.disabled; });
      if (siguiente) siguiente.focus(); else { q('.log').tabIndex = -1; q('.log').focus(); }
    }

    function diag(k) {
      var c = caso();
      if (S.diagOK) return;
      if (k !== c.causa) {
        S.dxFallos++;
        /* Cada causa descartada se penaliza una sola vez: su botón se deshabilita. */
        qa('.dx button')[Object.keys(C.causas).indexOf(k)].disabled = true;
        log('<span class="bad">No es esta causa.</span> Revisa lo que llevas medido. (−5 puntos en este caso)');
        actualizarEstado();
        enfocarSiguiente(qa('.dx button'));
        return;
      }
      if (!discrimaHecha(c)) {
        /* No es un error: la causa encaja, pero hay otra compatible con el mismo síntoma que hay que descartar primero. */
        log('<span class="aviso">Todavía no lo confirmo.</span> ' + c.discrima.texto);
        return;
      }
      S.diagOK = true;
      S.luz[C.causaLampara[k]] = 'bad';
      qa('.dx button').forEach(function (b) { b.disabled = true; });
      log('<span class="ok">Diagnóstico confirmado.</span> ' + c.explica + ' Ahora elige cómo lo reparas.');
      mostrarExplicacion(c);
      var reps = q('.reps');
      reps.innerHTML = '';
      c.reparaciones.forEach(function (r, i) {
        var b = el('button', { class: 'act', type: 'button' }, reps);
        b.textContent = r.t;
        b.onclick = function () { reparar(i); };
      });
      q('.rep').hidden = false;
      actualizarEstado();
      q('.rep .act').focus();
    }

    function reparar(i) {
      var c = caso();
      var r = c.reparaciones[i];
      var botones = q('.reps').querySelectorAll('button');
      /* «requiere»: la reparación solo se acepta si el resultado de las pruebas la justifica. */
      var justificada = !r.requiere || Object.keys(r.requiere).every(function (id) { return S.hallazgo[id] === r.requiere[id]; });
      if (!r.ok || !justificada) {
        S.repErr++;
        botones[i].disabled = true;
        var motivo = !r.ok ? 'Esta reparación no corrige la causa.' : 'Esta reparación no está justificada por lo que has medido.';
        log('<span class="bad">' + motivo + '</span> ' + (r.ok ? r.noJustificada : r.res));
        enfocarSiguiente(botones);
        return;
      }
      S.reparada = true;
      S.repAceptada = r;
      botones.forEach(function (b) { b.disabled = true; });
      log('<span class="ok">Reparación correcta.</span> ' + r.res + ' Ahora verifícala.');
      var verifs = q('.verifs');
      verifs.innerHTML = '';
      c.verificaciones.forEach(function (v, j) {
        var b = el('button', { class: 'act', type: 'button' }, verifs);
        b.textContent = v.t;
        b.onclick = function () { verificar(j); };
      });
      q('.verif-box').hidden = false;
      q('.verifs button').focus();
    }

    function verificar(j) {
      var c = caso();
      var v = c.verificaciones[j];
      var botones = q('.verifs').querySelectorAll('button');
      if (!v.ok) {
        botones[j].disabled = true;
        log('<span class="bad">Sin verificación.</span> ' + v.res);
        enfocarSiguiente(botones);
        return;
      }
      S.verificada = true;
      S.varHist[S.i] = S.variante;
      botones.forEach(function (b) { b.disabled = true; });
      var res = puntuarCaso(c);
      S.pts.push(res.total);
      S.desglose.push(res.partes);
      log('<span class="ok">Verificado.</span> ' + v.res + ' <b>Puntuación del caso: ' + res.total + '/100</b>');
      mostrarInforme(c, v);
      var n = q('.next');
      n.hidden = false;
      n.textContent = S.i + 1 < C.casos.length ? 'Siguiente caso →' : 'Ver resultado';
      n.focus();
      q('.coste').textContent = 'Tiempo gastado: ' + S.costo + ' min';
    }

    function fin() {
      var media = Math.round(S.pts.reduce(function (a, b) { return a + b; }, 0) / S.pts.length);
      var msg = media >= 80 ? 'Muy buen diagnóstico: piensas por orden y mides antes de cambiar.'
        : media >= 50 ? 'Bien, pero en algún caso has cambiado piezas de más.'
        : 'Repasa el orden de las pruebas de la S12 y vuelve a intentarlo.';
      q('.sim-stage').hidden = true;
      var f = q('.fin');
      f.hidden = false;
      var repaso = C.casos.map(function (base, i) {
        var c = casoEn(i, S.varHist[i] || 'defectuoso');
        var leccion = c.explicacion[c.explicacion.length - 1][1];
        var desglose = (S.desglose[i] || []).map(function (p) {
          return '<li>' + escapar(p.n) + ': <span class="val">' + (p.pts >= 0 ? '+' : '') + p.pts + '</span></li>';
        }).join('');
        return '<li><span class="repaso-t">' + c.t + '</span> <span class="val">' + S.pts[i] + '/100</span>' +
          '<ul class="desglose">' + desglose + '</ul><p>' + leccion + '</p></li>';
      }).join('');
      f.innerHTML = '<h2>Media: ' + media + '/100</h2><p>' + msg + '</p>' +
        '<h3 class="label">Repaso de las averías</h3><ol class="repaso">' + repaso + '</ol>' +
        '<button class="next repetir" type="button">Repetir</button>';
      f.querySelector('.repetir').onclick = function () {
        ronda++;
        nuevo();
        q('.log').innerHTML = '';
        q('.sim-stage').hidden = false;
        f.hidden = true;
        render();
      };
    }

    raiz.innerHTML =
      '<div class="sim-stage">' +
        '<div class="sim-izq">' +
          '<div class="rack">' +
            '<p class="rack-titulo">Estado del equipo</p>' +
            '<div class="lamps">' + C.lamparas.map(function (l) {
              return '<div class="lamp" data-c="' + l[0] + '"><i></i>' + l[1] + '</div>';
            }).join('') + '</div>' +
            '<div class="volts">' + ['+12 V', '+5 V', '+3,3 V'].map(function (t) {
              return '<div class="vb"><span>' + t + '</span><span class="bar"><b></b></span><span class="val">—</span></div>';
            }).join('') + '<p class="vnote"></p></div>' +
          '</div>' +
          '<p class="foot">Cada lámpara se enciende cuando una prueba confirma su estado. Verde: correcto. Rojo: fallo.</p>' +
        '</div>' +
        '<div class="sim-der">' +
          '<div class="card">' +
            '<div class="hd"><span class="caso-n"></span><span class="coste"></span></div>' +
            '<h2 class="caso-t"></h2>' +
            '<p class="caso-s"></p>' +
            '<h3 class="label">Pruebas · cada una cuesta 5 min</h3>' +
            '<div class="btns acts"></div>' +
            '<div class="log" aria-live="polite"></div>' +
            '<div class="rep" hidden>' +
              '<h3 class="label">Reparación · elige una</h3>' +
              '<div class="btns reps"></div>' +
              '<div class="verif-box" hidden>' +
                '<h3 class="label">Verificación · comprueba que el equipo funciona</h3>' +
                '<div class="btns verifs"></div>' +
              '</div>' +
            '</div>' +
            '<button class="next" type="button" hidden>Siguiente caso →</button>' +
            '<div class="explicacion" hidden></div>' +
            '<button class="pista act" type="button">Pista</button>' +
          '</div>' +
          '<div class="card">' +
            '<h3 class="label">¿Cuál es la causa?</h3>' +
            '<div class="btns dx"></div>' +
          '</div>' +
          '<p class="foot">Cambia una sola cosa cada vez. Cambiar una pieza sin medir antes resta puntos de evidencia.</p>' +
        '</div>' +
      '</div>' +
      '<div class="card fin" hidden></div>';

    q('.pista').onclick = pista;

    q('.next').onclick = function () {
      /* Solo se avanza con el caso verificado: el botón puede dispararse por código aunque esté oculto. */
      if (!S.verificada) return;
      if (S.i + 1 < C.casos.length) {
        S.i++; reiniciarCaso();
        q('.log').innerHTML = '';
        render();
      } else {
        fin();
      }
    };

    nuevo();
    render();
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
  function iniciar(root, temas) {
    var tabs = [['sim', 'Simulador de averías', 'simulador'], ['mapa', 'Mapa de conectores', 'mapa']];

    function mostrar(indice) {
      var tema = temas[indice];
      var nav = temas.length > 1
        ? '<nav class="temas" aria-label="Temas del temario">' + temas.map(function (t, i) {
            return '<button type="button" class="tema" data-i="' + i + '" aria-current="' + (i === indice) + '">' + escapar(t.titulo) + '</button>';
          }).join('') + '</nav>'
        : '';

      root.innerHTML =
        '<div class="barra"><a class="inicio-link" href="index.html">← Inicio</a><button type="button" class="tema-btn"></button></div>' +
        '<header class="cabecera">' +
          '<h1>' + escapar(tema.titulo) + '</h1>' +
          '<p class="intro">' + escapar(tema.resumen) + '</p>' +
        '</header>' + nav +
        '<div class="tabs" role="tablist">' + tabs.map(function (t, i) {
          return '<button type="button" role="tab" id="t-' + t[0] + '" aria-selected="' + (i === 0) + '" aria-controls="p-' + t[0] + '">' + t[1] + '</button>';
        }).join('') + '</div>' +
        tabs.map(function (t, i) {
          return '<section id="p-' + t[0] + '" class="panel' + (i === 0 ? ' on' : '') + '" role="tabpanel" aria-labelledby="t-' + t[0] + '"></section>';
        }).join('');

      root.querySelectorAll('[role=tab]').forEach(function (b) {
        b.onclick = function () {
          root.querySelectorAll('[role=tab]').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
          root.querySelectorAll('.panel').forEach(function (p) { p.classList.toggle('on', p.id === 'p-' + b.id.slice(2)); });
        };
      });
      root.querySelectorAll('.tema').forEach(function (b) {
        b.onclick = function () { mostrar(+b.dataset.i); };
      });

      var btnTema = root.querySelector('.tema-btn');
      btnTema.onclick = function () {
        var nuevo = temaActual() === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nuevo);
        try { localStorage.setItem('temario-tema', nuevo); } catch (e) { /* almacenamiento bloqueado: el tema dura solo esta visita */ }
        pintarBotonTema();
      };
      pintarBotonTema();

      simulador(tema, root.querySelector('#p-sim'));
      mapa(tema, root.querySelector('#p-mapa'));
    }

    /* Tema: si el usuario eligió uno antes, se aplica; si no, manda el sistema (sin atributo). */
    function temaActual() {
      var t = document.documentElement.getAttribute('data-theme');
      if (t) return t;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function pintarBotonTema() {
      var btn = document.querySelector('.tema-btn');
      if (!btn) return;
      var oscuro = temaActual() === 'dark';
      /* En modo oscuro se muestra el sol (pasar a claro); en modo claro, la luna (pasar a oscuro). */
      btn.innerHTML = oscuro ? ICONO_SOL : ICONO_LUNA;
      var texto = oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
      btn.setAttribute('aria-label', texto);
      btn.setAttribute('title', texto);
    }

    try {
      var guardado = localStorage.getItem('temario-tema');
      if (guardado === 'light' || guardado === 'dark') document.documentElement.setAttribute('data-theme', guardado);
    } catch (e) { /* sin almacenamiento: se usa el tema del sistema */ }

    if (!temas || !temas.length) { root.textContent = 'No hay temas registrados.'; return; }
    mostrar(0);
  }

  window.Temario = { iniciar: iniciar };
})();
