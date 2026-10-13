/* Motor del temario: simulador de averías, mapa de zonas sobre una foto y quiz.
   No contiene contenido. Cada tema se registra en window.TEMAS (carpeta temas/).
   Ver README.md para añadir un tema nuevo. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var NOMINALES = [12, 5, 3.3];
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

    function nuevo() {
      S = { i: 0, costo: 0, used: new Set(), medido: false, pts: [], luz: {}, volt: null };
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
      q('.vnote').textContent = !vs ? 'Mide la fuente para ver los valores.'
        : vs.ok ? 'Valores dentro de la tolerancia ATX (±5 %).'
        : 'Tensión ausente o fuera de rango: la fuente es la pista.';
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
      pintarRack();
    }

    function render() {
      var c = C.casos[S.i];
      q('.caso-n').textContent = 'Caso ' + (S.i + 1) + ' de ' + C.casos.length;
      q('.caso-t').textContent = c.t;
      q('.caso-s').textContent = c.s;
      q('.coste').textContent = 'Tiempo gastado: ' + S.costo + ' min';
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
      pintarRack();
    }

    function actuar(id) {
      var c = C.casos[S.i];
      S.used.add(id);
      S.costo += 5;
      if (id === 'fue') { S.medido = true; S.volt = { v: c.volt, ok: c.volt.every(function (x) { return x > 0; }) }; }
      if (c.luz[id]) S.luz[c.luz[id][0]] = c.luz[id][1];
      var t = c.res[id] || 'No aporta nada nuevo en este caso.';
      /* Un fallo de prueba: el resultado es negativo y se muestra en rojo. Cuesta lo mismo que una prueba normal. */
      if (c.fallos && c.fallos[id]) t = '<span class="bad">Prueba fallida.</span> ' + c.fallos[id];
      if (id === 'cam' && !S.medido) { S.costo += 15; t += ' <span class="bad">Cambiar una pieza sin medir antes: +15 min.</span>'; }
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

    function diag(k) {
      var c = C.casos[S.i];
      if (k === c.causa) {
        var pts = Math.max(0, 100 - S.costo);
        S.pts.push(pts);
        S.luz[C.causaLampara[k]] = 'bad';
        pintarRack();
        log('<span class="ok">Correcto.</span> ' + c.explica + ' <b>Puntuación del caso: ' + pts + '/100</b>');
        mostrarExplicacion(c);
        qa('.acts button, .dx button').forEach(function (b) { b.disabled = true; });
        var n = q('.next');
        n.hidden = false;
        n.textContent = S.i + 1 < C.casos.length ? 'Siguiente caso →' : 'Ver resultado';
      } else {
        S.costo += 20;
        log('<span class="bad">No es esta causa.</span> Revisa lo que llevas medido. (+20 min)');
        actualizarEstado();
      }
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
      var repaso = C.casos.map(function (c, i) {
        var leccion = c.explicacion[c.explicacion.length - 1][1];
        return '<li><span class="repaso-t">' + c.t + '</span> <span class="val">' + S.pts[i] + '/100</span><p>' + leccion + '</p></li>';
      }).join('');
      f.innerHTML = '<h2>Media: ' + media + '/100</h2><p>' + msg + '</p>' +
        '<h3 class="label">Repaso de las averías</h3><ol class="repaso">' + repaso + '</ol>' +
        '<button class="next repetir" type="button">Repetir</button>';
      f.querySelector('.repetir').onclick = function () {
        nuevo();
        q('.log').innerHTML = '';
        q('.explicacion').hidden = true;
        q('.next').hidden = true;
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
            '<div class="explicacion" hidden></div>' +
            '<button class="next" type="button" hidden>Siguiente caso →</button>' +
          '</div>' +
          '<div class="card">' +
            '<h3 class="label">¿Cuál es la causa?</h3>' +
            '<div class="btns dx"></div>' +
          '</div>' +
          '<p class="foot">Cambia una sola cosa cada vez. Cambiar una pieza sin medir antes cuesta 15 min extra.</p>' +
        '</div>' +
      '</div>' +
      '<div class="card fin" hidden></div>';

    q('.next').onclick = function () {
      if (S.i + 1 < C.casos.length) {
        S.i++; S.costo = 0; S.used = new Set(); S.medido = false; S.luz = {}; S.volt = null;
        q('.log').innerHTML = '';
        q('.explicacion').hidden = true;
        q('.next').hidden = true;
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
      timer = setTimeout(function () { if (modo === 'quiz' && Q) preguntar(); }, 1600);
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
