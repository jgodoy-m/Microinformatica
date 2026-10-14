/* Modo Halloween para todas las páginas del temario.
   Se carga en <head>, después del script que fija el tema claro/oscuro, para aplicar el modo antes de pintar.
   Guarda en este navegador:
   - temario-halloween = "on": el diseño de Halloween está activo.
   - temario-sin-sustos = "on": sin screamers ni sonido, para quien prefiera no llevarse sustos.
   Todo el arte es SVG dibujado aquí y el sonido se sintetiza con Web Audio: no se descarga nada. */
(function () {
  'use strict';

  var CLAVE = 'temario-halloween';
  var CLAVE_SIN_SUSTOS = 'temario-sin-sustos';
  var root = document.documentElement;

  function leer(clave) {
    try { return localStorage.getItem(clave) === 'on'; } catch (e) { return false; }
  }
  function guardar(clave, valor) {
    try {
      if (valor) localStorage.setItem(clave, 'on'); else localStorage.removeItem(clave);
    } catch (e) { /* almacenamiento bloqueado: la elección dura solo esta visita */ }
  }

  var activo = leer(CLAVE);
  var sinSustos = leer(CLAVE_SIN_SUSTOS);

  /* El diseño de Halloween parte del tema oscuro. Mientras está activo se fuerza data-theme="dark"
     y se ocultan los botones de claro/oscuro; al quitarlo vuelve el tema elegido antes. */
  var temaInicial = root.getAttribute('data-theme');
  var forzando = false;

  function temaElegido() {
    try {
      var t = localStorage.getItem('temario-tema');
      if (t === 'light' || t === 'dark') return t;
    } catch (e) { /* sin almacenamiento */ }
    return temaInicial;
  }

  function aplicarTema() {
    forzando = true;
    if (activo) {
      root.setAttribute('data-halloween', 'on');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-halloween');
      var t = temaElegido();
      if (t) root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
    }
    forzando = false;
  }

  /* Algunas páginas vuelven a fijar el tema al iniciar (p. ej. el simulador de averías). */
  new MutationObserver(function () {
    if (!forzando && activo && root.getAttribute('data-theme') !== 'dark') aplicarTema();
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- Estilos ---------- */
  var CSS = [
    /* Paleta: negro violáceo de fondo, morado en superficies y naranja calabaza para acentos.
       Cubre los nombres de variable de todas las páginas (temario, simulacro, averías, montaje y apuntes). */
    ':root[data-halloween="on"]{color-scheme:dark;',
    '--bg:#130A1B;--fondo:#130A1B;--surface:#22112E;--surface-hover:#301a42;--card:#22112E;--card-2:#301a42;',
    '--panel:#22112E;--panel-2:#301a42;--panel-3:#301a42;--rack:#0B0510;--rack-fg:#F7EEE3;--rack-muted:#D9C6E8;',
    '--btn:#301a42;--bar:#3A2150;--photo-bg:#0B0510;--off:#4A2E5E;',
    '--text:#F7EEE3;--fg:#F7EEE3;--muted:#D9C6E8;--border:#6B4489;--line:#5A3A75;',
    '--accent:#FF8A1F;--accent-2:#B57BE8;--accent-text:#1A0A00;--accent-ink:#1A0A00;--on-accent:#1A0A00;',
    '--focus:#FFB15C;--link:#FFA04D;--acento-texto:#FFA04D;',
    '--success:#A6E36B;--ok:#A6E36B;--ok-texto:#A6E36B;--lamp-ok:#7FD13B;',
    '--warning:#FFCB4D;--warn:#FFCB4D;--aviso-texto:#FFCB4D;',
    '--danger:#FF7A7A;--bad:#FF6B6B;--error-texto:#FF9A9A;--lamp-bad:#E03B3B;',
    '--alt:#B57BE8;--pista:#D7A8FF;--pill-ok:rgba(166,227,107,.16);--pill-acento:rgba(255,138,31,.16);',
    '--zone-hover:rgba(255,138,31,.32);--zone-hit:rgba(166,227,107,.40);--zone-miss:rgba(224,59,59,.50);--zone-pulse:rgba(181,123,232,.30);',
    /* Portada (index.html): usa variables Nord propias y un hero azul con colores fijos. */
    '--nord7:#B57BE8;--nord8:#FF8A1F;--nord9:#B57BE8;--nord10:#E06A00;--nord14:#A6E36B;--nord15:#B57BE8;--nord1:#22112E;--nord2:#301a42;--nord3:#5A3A75;--nord0-txt:#1A0A00;}',
    ':root[data-halloween="on"] .hero{background:linear-gradient(180deg,#0B0510 0%,#1A0B26 62%,#22102F 84%,var(--bg) 100%)}',
    ':root[data-halloween="on"] .hero-image{filter:hue-rotate(185deg) saturate(1.15)}',
    ':root[data-halloween="on"] body{background:radial-gradient(1100px 520px at 50% 115%,rgba(255,110,20,.16),transparent 70%),radial-gradient(900px 500px at 50% -10%,rgba(123,63,176,.22),transparent 70%),var(--bg) fixed;}',
    ':root[data-halloween="on"] ::selection{background:#FF8A1F;color:#1A0A00}',
    /* Los botones de claro/oscuro no se usan mientras dura Halloween. */
    ':root[data-halloween="on"] #theme-toggle,:root[data-halloween="on"] .tema-btn,:root[data-halloween="on"] button#tema,:root[data-halloween="on"] .fila-switch{display:none!important}',

    /* Telarañas en las esquinas superiores y una araña colgando. No capturan clics. */
    '.hw-telas{display:none}',
    ':root[data-halloween="on"] .hw-telas{display:block}',
    '.hw-tela{position:fixed;top:0;width:clamp(90px,15vw,180px);height:auto;pointer-events:none;z-index:2147483000;opacity:.6}',
    '.hw-tela svg,.hw-arana svg{display:block;width:100%;height:auto}',
    '.hw-tela.izq{left:0}',
    '.hw-tela.der{right:0;transform:scaleX(-1)}',
    '.hw-arana{position:fixed;top:0;left:clamp(44px,10vw,92px);width:28px;pointer-events:none;z-index:2147483000;transform-origin:50% 0;animation:hw-colgar 4.5s ease-in-out infinite}',
    '@keyframes hw-colgar{0%,100%{transform:translateY(-6px) rotate(-3deg)}50%{transform:translateY(10px) rotate(3deg)}}',

    /* Controles flotantes: modo Halloween y «Sin sustos». */
    '.hw-controles{position:fixed;right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));z-index:2147483001;display:flex;gap:8px;align-items:center;font:600 14px/1.2 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}',
    '.hw-boton{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 14px 0 10px;border-radius:999px;border:1px solid #5A3A75;background:#1C0E27;color:#F7EEE3;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.35);font:inherit}',
    '.hw-boton:hover{border-color:#FF8A1F}',
    '.hw-boton:focus-visible{outline:3px solid #FFB15C;outline-offset:2px}',
    '.hw-boton svg{width:24px;height:24px;flex:none}',
    '.hw-boton[aria-pressed="true"]{background:#FF8A1F;border-color:#FF8A1F;color:#1A0A00}',
    '.hw-sustos{display:none;padding:0 14px}',
    ':root[data-halloween="on"] .hw-sustos{display:inline-flex}',
    '.hw-interruptor{position:relative;width:34px;height:20px;border-radius:999px;background:#4A2E5E;flex:none;transition:background .15s}',
    '.hw-interruptor::after{content:"";position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#F7EEE3;transition:transform .15s}',
    '.hw-sustos[aria-checked="true"] .hw-interruptor{background:#A6E36B}',
    '.hw-sustos[aria-checked="true"] .hw-interruptor::after{transform:translateX(14px);background:#1A0A00}',
    '@media (max-width:480px){.hw-boton .hw-texto-largo{display:none}}',

    /* Screamer del simulacro. */
    '.hw-susto{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;background:radial-gradient(circle at 50% 45%,#3a0000 0%,#000 70%);cursor:pointer;animation:hw-destello 1s steps(1,end) forwards}',
    '.hw-susto svg{width:min(92vw,92vh);height:auto;animation:hw-golpe 1s cubic-bezier(.2,1.6,.4,1) forwards}',
    '@keyframes hw-golpe{0%{transform:scale(.35)}12%{transform:scale(1.18)}18%{transform:scale(1.05) translate(-2%,1%)}24%{transform:scale(1.12) translate(2%,-1%)}30%{transform:scale(1.06) translate(-1%,-2%)}36%{transform:scale(1.14) translate(1%,2%)}100%{transform:scale(1.22)}}',
    '@keyframes hw-destello{0%{background-color:#fff}6%{background-color:transparent}}',
    '@media (prefers-reduced-motion:reduce){.hw-arana{animation:none}.hw-susto svg{animation:none}}'
  ].join('');

  var estilo = document.createElement('style');
  estilo.id = 'hw-estilos';
  estilo.textContent = CSS;
  (document.head || root).appendChild(estilo);

  aplicarTema();

  /* ---------- Dibujos SVG ---------- */
  var NS = 'http://www.w3.org/2000/svg';

  /* Telaraña con radios desde la esquina y anillos que se comban hacia el centro. */
  function telarana() {
    var angulos = [0, 13, 27, 41, 55, 69, 82, 90];
    var radios = [28, 58, 92, 130, 172];
    var d = '';
    angulos.forEach(function (a) {
      var r = a * Math.PI / 180;
      d += 'M0 0L' + (220 * Math.cos(r)).toFixed(1) + ' ' + (220 * Math.sin(r)).toFixed(1);
    });
    radios.forEach(function (R) {
      var p = angulos.map(function (a) {
        var r = a * Math.PI / 180;
        return [R * Math.cos(r), R * Math.sin(r)];
      });
      d += 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
      for (var k = 1; k < p.length; k++) {
        var cx = (p[k - 1][0] + p[k][0]) / 2 * 0.86;
        var cy = (p[k - 1][1] + p[k][1]) / 2 * 0.86;
        d += 'Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + p[k][0].toFixed(1) + ' ' + p[k][1].toFixed(1);
      }
    });
    return '<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false"><path d="' + d +
      '" fill="none" stroke="#EDE3F5" stroke-width="1.3" stroke-linecap="round" opacity=".75"/></svg>';
  }

  var ARANA = '<svg viewBox="0 0 28 90" aria-hidden="true" focusable="false">' +
    '<line x1="14" y1="0" x2="14" y2="64" stroke="#EDE3F5" stroke-width="1" opacity=".7"/>' +
    '<g stroke="#120814" stroke-width="1.6" fill="none" stroke-linecap="round">' +
    '<path d="M11 72q-6-6-10-4M11 75q-7-2-10 2M11 78q-6 2-8 8M12 80q-3 4-4 9"/>' +
    '<path d="M17 72q6-6 10-4M17 75q7-2 10 2M17 78q6 2 8 8M16 80q3 4 4 9"/></g>' +
    '<ellipse cx="14" cy="78" rx="6" ry="7.5" fill="#120814"/><circle cx="14" cy="68" r="4" fill="#120814"/>' +
    '<circle cx="12.4" cy="67.5" r="1" fill="#FF8A1F"/><circle cx="15.6" cy="67.5" r="1" fill="#FF8A1F"/></svg>';

  var CALABAZA = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M12 6c0-2 1-3 2.5-3.5" fill="none" stroke="#4E8A2E" stroke-width="2" stroke-linecap="round"/>' +
    '<ellipse cx="7.5" cy="14" rx="5" ry="7" fill="#E8650F"/><ellipse cx="16.5" cy="14" rx="5" ry="7" fill="#E8650F"/>' +
    '<ellipse cx="12" cy="14" rx="5.2" ry="7.6" fill="#FF8A1F"/>' +
    '<path d="M7.5 11.5l2 2h-3zM16.5 11.5l-2 2h3zM7 16.5q5 3.5 10 0l-1.6.4-.9 1-1-1h-3l-1 1-.9-1z" fill="#2A1200"/></svg>';

  /* Cara del screamer: rostro pálido, cuencas negras con pupilas rojas y boca abierta con dientes. */
  var CARA = '<svg viewBox="0 0 400 440" aria-hidden="true" focusable="false">' +
    '<defs><radialGradient id="hw-piel" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#E9F0D8"/><stop offset=".6" stop-color="#A9B89A"/><stop offset="1" stop-color="#3D4A36"/></radialGradient>' +
    '<radialGradient id="hw-ojo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FF2A1A"/><stop offset=".35" stop-color="#8A0000"/><stop offset="1" stop-color="#000"/></radialGradient></defs>' +
    '<path d="M200 18C96 18 52 110 58 210c6 96 54 170 92 196 30 20 70 20 100 0 38-26 86-100 92-196 6-100-38-192-142-192z" fill="url(#hw-piel)"/>' +
    '<path d="M40 120c30-70 90-108 160-108s130 38 160 108c-34-40-60-30-90-60-24 24-50 0-70 30-20-30-46-6-70-30-30 30-56 20-90 60z" fill="#0A0A0A"/>' +
    '<path d="M86 196c10-40 64-52 92-20 10 30-6 66-46 66-36 0-52-20-46-46zM314 196c-10-40-64-52-92-20-10 30 6 66 46 66 36 0 52-20 46-46z" fill="#050505"/>' +
    '<circle cx="134" cy="206" r="15" fill="url(#hw-ojo)"/><circle cx="266" cy="206" r="15" fill="url(#hw-ojo)"/>' +
    '<circle cx="134" cy="206" r="4" fill="#FFE9A8"/><circle cx="266" cy="206" r="4" fill="#FFE9A8"/>' +
    '<path d="M186 250l14-26 14 26-14 10z" fill="#2B2F24"/>' +
    '<path d="M120 300c20-14 140-14 160 0 6 50-30 104-80 104s-86-54-80-104z" fill="#120000"/>' +
    '<path d="M124 302l14 26 12-24 14 30 12-30 12 32 12-32 12 32 12-30 14 28 12-26 14 24 8-28c-40-12-120-12-160-2z" fill="#F1EAD0"/>' +
    '<path d="M140 378l12-20 12 18 12-22 12 22 12-22 12 22 12-22 12 18 12-20c-10 14-34 22-60 22s-50-8-60-22z" fill="#E4DCBE"/>' +
    '<path d="M150 262c-10 12-30 20-50 14M250 262c10 12 30 20 50 14M196 70l-10 50 18 20-8 40M300 120l-22 30 6 26" fill="none" stroke="#2B2F24" stroke-width="3" stroke-linecap="round" opacity=".7"/>' +
    '<path d="M134 240v40M268 240c2 20-2 44-6 60" stroke="#7A0000" stroke-width="5" stroke-linecap="round" opacity=".85"/></svg>';

  /* ---------- Sonido: chillido corto sintetizado ---------- */
  function chillido() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    var ctx;
    try { ctx = new AC(); } catch (e) { return; }
    var t = ctx.currentTime;
    var dur = 0.9;
    var salida = ctx.createGain();
    salida.gain.setValueAtTime(0.0001, t);
    salida.gain.exponentialRampToValueAtTime(0.45, t + 0.03);
    salida.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    salida.connect(ctx.destination);

    /* Ruido filtrado que sube de tono. */
    var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    var datos = buf.getChannelData(0);
    for (var i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
    var ruido = ctx.createBufferSource();
    ruido.buffer = buf;
    var filtro = ctx.createBiquadFilter();
    filtro.type = 'bandpass';
    filtro.Q.value = 3;
    filtro.frequency.setValueAtTime(900, t);
    filtro.frequency.exponentialRampToValueAtTime(3200, t + 0.25);
    filtro.frequency.exponentialRampToValueAtTime(1400, t + dur);
    ruido.connect(filtro).connect(salida);

    /* Grito: diente de sierra con vibrato. */
    var osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(1150, t + 0.18);
    osc.frequency.exponentialRampToValueAtTime(700, t + dur);
    var vib = ctx.createOscillator();
    vib.frequency.value = 28;
    var vibG = ctx.createGain();
    vibG.gain.value = 60;
    vib.connect(vibG).connect(osc.frequency);
    var oscG = ctx.createGain();
    oscG.gain.value = 0.35;
    osc.connect(oscG).connect(salida);

    ruido.start(t); osc.start(t); vib.start(t);
    ruido.stop(t + dur); osc.stop(t + dur); vib.stop(t + dur);
    setTimeout(function () { try { ctx.close(); } catch (e) { /* ya cerrado */ } }, (dur + 0.3) * 1000);
  }

  /* ---------- Screamer ---------- */
  var sustoAbierto = null;

  function cerrarSusto() {
    if (!sustoAbierto) return;
    var s = sustoAbierto;
    sustoAbierto = null;
    clearTimeout(s.temporizador);
    document.removeEventListener('keydown', s.tecla, true);
    if (s.el.parentNode) s.el.parentNode.removeChild(s.el);
  }

  /* Muestra el susto un segundo. Solo con el modo Halloween activo y sin «Sin sustos». */
  function susto() {
    if (!activo || sinSustos || sustoAbierto || !document.body) return false;
    var el = document.createElement('div');
    el.className = 'hw-susto';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = CARA;
    var s = { el: el };
    s.tecla = function (e) { e.preventDefault(); cerrarSusto(); };
    el.addEventListener('click', cerrarSusto);
    document.addEventListener('keydown', s.tecla, true);
    s.temporizador = setTimeout(cerrarSusto, 1000);
    sustoAbierto = s;
    document.body.appendChild(el);
    chillido();
    return true;
  }

  /* ---------- Controles ---------- */
  var botonModo, botonSustos;

  function pintarControles() {
    if (!botonModo) return;
    botonModo.setAttribute('aria-pressed', String(activo));
    var texto = activo ? 'Quitar modo Halloween' : 'Activar modo Halloween';
    botonModo.title = texto;
    botonModo.setAttribute('aria-label', texto);
    botonSustos.setAttribute('aria-checked', String(sinSustos));
  }

  function montar() {
    if (document.querySelector('.hw-controles')) return;
    /* Los estilos pasan al final de <head> para que vayan después de los de la página. */
    if (document.head) document.head.appendChild(estilo);
    var telas = document.createElement('div');
    telas.className = 'hw-telas';
    telas.setAttribute('aria-hidden', 'true');
    var tela = telarana();
    telas.innerHTML = '<div class="hw-tela izq">' + tela + '</div><div class="hw-tela der">' + tela + '</div><div class="hw-arana">' + ARANA + '</div>';
    document.body.appendChild(telas);

    var controles = document.createElement('div');
    controles.className = 'hw-controles';
    controles.innerHTML =
      '<button type="button" class="hw-boton hw-sustos" role="switch" aria-checked="false" title="Desactiva los sustos y el sonido">' +
        '<span class="hw-interruptor" aria-hidden="true"></span><span>Sin sustos</span></button>' +
      '<button type="button" class="hw-boton hw-modo" aria-pressed="false">' + CALABAZA +
        '<span class="hw-texto-largo">Halloween</span></button>';
    document.body.appendChild(controles);
    botonModo = controles.querySelector('.hw-modo');
    botonSustos = controles.querySelector('.hw-sustos');

    botonModo.addEventListener('click', function () {
      activo = !activo;
      guardar(CLAVE, activo);
      aplicarTema();
      pintarControles();
    });
    botonSustos.addEventListener('click', function () {
      sinSustos = !sinSustos;
      guardar(CLAVE_SIN_SUSTOS, sinSustos);
      pintarControles();
    });
    pintarControles();
  }

  /* Otra pestaña cambió el modo: se aplica aquí también. */
  window.addEventListener('storage', function (e) {
    if (e.key === CLAVE) { activo = leer(CLAVE); aplicarTema(); pintarControles(); }
    if (e.key === CLAVE_SIN_SUSTOS) { sinSustos = leer(CLAVE_SIN_SUSTOS); pintarControles(); }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();

  window.Halloween = {
    activo: function () { return activo; },
    sinSustos: function () { return sinSustos; },
    susto: susto
  };
})();
