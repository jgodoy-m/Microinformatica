/* Escape room de la UF0864 (escape-uf0864.html). El alumno recorre las salas en orden: en cada una juega
   un reto con uno de los minijuegos (dentro de un iframe, que devuelve su nota con postMessage) y abre
   un candado de preguntas tipo test. Nadie se queda atascado: si falla el candado dos veces, la
   puerta se abre igual y esos puntos se pierden.
   Nota sobre 10, toda automática: test 5 (solo el primer intento) y retos 5. Sin respuesta corta: los
   modos pueden traer «corta» en su contenido, pero no se pregunta. El intento se guarda en este navegador: si se recarga la página,
   sigue donde estaba con el reloj corriendo. Al entregar se descarga la hoja de examen, con un código
   que permite al profesor ver si se ha editado. Con ?profe todo está abierto y se pueden corregir hojas. */
(() => {
  "use strict";

  const app = document.getElementById("escape");
  const CFG = window.ESCAPE_UF0864;
  /* Banco del modo en curso: el del simulacro en el ensayo, el descifrado en el examen. */
  let BANCO = window.BANCO_UF0864 || [];
  if (!app || !CFG) return;

  const PROFE = new URLSearchParams(location.search).has("profe");
  const UF = window.UF0864;
  const PUNTOS_CORTA = 0.4;
  const SAL = "uf0864·taller-cerrado";
  const JUEGOS = {
    diagnostico: { nombre: "Diagnóstico contrarreloj", url: (c) => "juego-diagnostico.html?escape=" + c.join(",") },
    caza: { nombre: "Caza al proceso sospechoso", url: (c) => "caza.html?escape=" + encodeURIComponent(c) },
    rescate: { nombre: "Operación: rescatar los archivos", url: (c) => "rescate.html?escape=" + encodeURIComponent(c) }
  };

  /* ---------- Utilidades ---------- */
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const mezclar = (lista) => {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];
  /* Fechas «2026-10-28» o con hora, «2026-10-28T09:45», siempre en hora local. */
  const fechaDe = (iso) => { const [y, m, d, h, mi] = iso.split(/[-T:]/).map(Number); return new Date(y, m - 1, d, h || 0, mi || 0); };
  const abierto = (modo) => PROFE || (!modo.cerrado && (!modo.desde || new Date() >= fechaDe(modo.desde)) && (!modo.hasta || new Date() <= fechaDe(modo.hasta)));
  const fechaLegible = (iso) => fechaDe(iso).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }) + (iso.includes("T") ? " a las " + iso.slice(11, 16) : "");
  const mmss = (s) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ":" + String(m).padStart(2, "0") : String(m).padStart(2, "0")) + ":" + String(x).padStart(2, "0"); };
  const coma = (n) => (Math.round(n * 100) / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const leer = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const guardar = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
  /* FNV-1a de 32 bits, dos pasadas: basta para notar si alguien ha tocado la hoja a mano. */
  const huella = (texto) => {
    const fnv = (t, h) => { for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; };
    const a = fnv(SAL + texto, 2166136261), b = fnv(texto + SAL, a);
    return (a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0")).toUpperCase().match(/.{4}/g).join("-");
  };
  const ICONO = {
    candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    abierto: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
    reloj: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6M12 2v3"/>',
    puerta: '<path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17M3 21h18M15 12h.01"/>',
    llave: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l2 2"/>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="m7.5 12.5 3 3 6-6.5"/>',
    descarga: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>'
  };
  const svg = (k) => '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + ICONO[k] + "</svg>";

  /* ---------- Estado del intento ---------- */
  const clave = (id) => "escape-uf0864-" + id;
  let S = null; /* intento en curso */
  let M = null; /* configuración del modo */
  let reloj = null;
  const salvar = () => { if (S) guardar(clave(S.modo), S); };

  /* Las preguntas del modo (M.test) repartidas entre las sesiones de la sala, sin repetir en todo el intento. */
  const nTest = () => M.test || 5;
  const abrirCon = () => M.abrir || 3;
  const ptsTest = () => 5 / (M.salas.length * nTest());
  const ptsReto = () => 5 / M.salas.length;
  const elegirTest = (sesiones, usadas) => {
    const grupos = sesiones.map((s) => mezclar(BANCO.map((p, i) => i).filter((i) => BANCO[i].fuente === s && !usadas.has(i))));
    const elegidas = [];
    for (let r = 0; elegidas.length < nTest() && grupos.some((g) => g.length); r++) {
      const g = grupos[r % grupos.length];
      if (g.length) elegidas.push(g.shift());
    }
    elegidas.forEach((i) => usadas.add(i));
    return elegidas.map((i) => ({ i, orden: mezclar(BANCO[i].opciones.map((_, k) => k)), r1: null, r2: null }));
  };

  const nuevoIntento = (id, nombre, modo) => {
    const usadas = new Set();
    return {
      modo: id, nombre, inicio: Date.now(), sala: 0, fase: "intro", salidas: 0, reinicios: 0, entregado: null,
      salas: modo.salas.map((s) => ({
        reto: { juego: s.reto.juego, caso: s.reto.juego === "diagnostico" ? s.reto.casos.map((g) => (Array.isArray(g) ? azar(g) : g)) : azar(s.reto.casos), total: null, maximo: null, titulo: "" },
        test: elegirTest(s.sesiones, usadas),
        digito: Math.floor(Math.random() * 10),
        forzado: false
      })),
      final: { codigo: false }
    };
  };

  const restante = () => M.minutos * 60 - (Date.now() - S.inicio) / 1000;

  /* ---------- Puntuación ---------- */
  const puntosReto = (s) => (s.reto.total == null ? 0 : s.reto.total / s.reto.maximo * ptsReto());
  const aciertosTest = (s) => s.test.filter((q) => q.r1 === BANCO[q.i].correcta).length;
  const notaAuto = () => S.salas.reduce((n, s) => n + puntosReto(s) + aciertosTest(s) * ptsTest(), 0);
  const maxAuto = () => S.salas.length * (ptsReto() + nTest() * ptsTest());

  /* ---------- Pantalla de inicio ---------- */
  const inicio = (aviso) => {
    pararReloj();
    S = null; M = null;
    document.title = "Escape room · UF0864 | Microinformática";
    const nombre = (UF && UF.nombre()) || "";
    const tarjetas = Object.entries(CFG.modos).map(([id, m]) => {
      const curso = leer(clave(id));
      const ok = abierto(m);
      const enCurso = curso && !curso.entregado;
      return '<label class="er-modo' + (ok ? "" : " cerrado") + '">' +
        '<input type="radio" name="modo" value="' + id + '"' + (ok ? "" : " disabled") + ">" +
        "<span><b>" + esc(m.nombre) + "</b>" +
        "<small>" + (m.fecha ? esc(m.fecha) + " · " : "") + (m.nSalas || m.salas.length) + " salas" + (m.final ? " y la puerta final" : "") + " · " + (m.minutos >= 120 ? m.minutos / 60 + " horas" : m.minutos + " minutos") + "</small>" +
        (ok ? (enCurso ? '<em class="er-encurso">Tienes uno empezado: el reloj sigue corriendo</em>' : curso && curso.entregado ? "<em>Ya lo entregaste. " + (m.cifrado && !m.claveLibre && !PROFE ? "Entra con la clave para volver a descargar tu hoja." : "Puedes repetirlo.") + "</em>" : "")
          : '<em class="er-candado">' + svg("candado") + (m.cerrado || !m.desde ? "Cerrado hasta nuevo aviso" : m.hasta && new Date() > fechaDe(m.hasta) ? "Cerrado" : "Se abre el " + esc(fechaLegible(m.desde))) + "</em>") +
        "</span></label>";
    });
    app.innerHTML =
      '<section class="rt-panel er-portada">' +
      '<a class="rt-cerrar" href="software.html" aria-label="Volver a la UF0864"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></a>' +
      '<p class="rt-antetitulo"><b>UF0864</b> · Escape room</p>' +
      "<h1>" + svg("puerta") + "<span>El taller cerrado</span></h1>" +
      '<p class="rt-lema">Cuatro equipos averiados. <span>Una puerta con candado.</span></p>' +
      "<p>Eres el técnico de guardia y te has quedado encerrado en el taller. Cada equipo que repares te da un dígito del código de la puerta. En cada sala juegas un reto y después abres su candado con preguntas de la sesión.</p>" +
      '<ul class="er-reglas">' +
      "<li>" + svg("llave") + "<span><b>Candado</b>Preguntas tipo test. " + Object.values(CFG.modos).map((m) => "En el " + m.corto + ", " + (m.test || 5) + " preguntas y se abre con " + (m.abrir || 3) + " aciertos.").join(" ") + " Si no, tienes un segundo intento con las falladas, y si vuelves a fallar la puerta se abre igual: nadie se queda atascado.</span></li>" +
      "<li>" + svg("check") + "<span><b>Nota sobre 10</b>Test 5 puntos (solo cuenta el primer intento) y retos 5 puntos. La nota sale sola al terminar.</span></li>" +
      "<li>" + svg("reloj") + "<span><b>Tiempo</b>El reloj no se para. Si recargas la página sigues donde estabas, pero el reto que estuvieras jugando vuelve a empezar. Al acabar el tiempo se entrega solo.</span></li>" +
      "</ul>" +
      '<form class="er-form" data-form>' +
      '<fieldset class="er-modos"><legend>Elige</legend>' + tarjetas.join("") + "</fieldset>" +
      '<label class="er-campo"><span>Tu nombre y apellidos</span><input name="nombre" type="text" maxlength="60" autocomplete="name" required value="' + esc(nombre) + '"></label>' +
      '<label class="er-campo" data-campo-clave hidden><span>Clave que dice el profesor</span><input name="clave" type="text" autocomplete="off" autocapitalize="characters"></label>' +
      (aviso ? '<p class="er-aviso" role="alert">' + esc(aviso) + "</p>" : "") +
      '<div class="rt-acciones"><button type="submit" class="rt-boton">Entrar en el taller ' + svg("flecha") + "</button></div>" +
      "</form>" +
      (PROFE ? '<div class="er-profe"><p class="rt-nota">Vista del profesor: todos los modos están abiertos.</p><div class="rt-acciones"><button type="button" class="rt-boton rt-secundario" data-corregir>Corregir hojas de examen</button>' +
        Object.keys(CFG.modos).map((id) => '<button type="button" class="rt-boton rt-secundario" data-borrar="' + id + '">Borrar el intento de «' + esc(CFG.modos[id].nombre) + "» en este navegador</button>").join("") + "</div></div>" : "") +
      "</section>";

    const form = app.querySelector("[data-form]");
    const radios = form.querySelectorAll("input[name=modo]:not([disabled])");
    if (radios[0]) radios[0].checked = true;
    const campoClave = app.querySelector("[data-campo-clave]");
    const verClave = () => {
      const r = form.querySelector("input[name=modo]:checked");
      campoClave.hidden = !(r && CFG.modos[r.value].cifrado && !CFG.modos[r.value].claveLibre);
    };
    radios.forEach((r) => r.addEventListener("change", verClave));
    verClave();
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const r = form.querySelector("input[name=modo]:checked");
      if (!r) return;
      const id = r.value;
      let modo = CFG.modos[id];
      const nom = form.nombre.value.trim();
      let curso = leer(clave(id));
      // El examen se hace una sola vez: si ya está entregado, se vuelve a la hoja en vez de empezar otro.
      const enCurso = curso && (!curso.entregado || (modo.cifrado && !modo.claveLibre && !PROFE));
      BANCO = window.BANCO_UF0864 || [];
      window.ESCAPE_EXTRA = null;
      if (modo.cifrado) {
        const boton = form.querySelector("button[type=submit]");
        boton.disabled = true;
        const palabra = modo.claveLibre || form.clave.value.trim().toUpperCase() || (enCurso && curso.clave) || "";
        const contenido = palabra && await descifrar(modo.cifrado, palabra);
        if (!contenido) return inicio("La clave no es correcta. Pídesela al profesor.");
        modo = Object.assign({}, modo, contenido.modo, modo.ajustes);
        BANCO = contenido.banco;
        window.ESCAPE_EXTRA = contenido.extra;
        M = modo;
        if (enCurso) curso.clave = palabra;
        else { curso = nuevoIntento(id, nom, modo); curso.clave = palabra; }
      } else if (!enCurso) { M = modo; curso = nuevoIntento(id, nom, modo); }
      if (enCurso) curso.reinicios += curso.fase === "reto" && curso.salas[curso.sala] && curso.salas[curso.sala].reto.total == null ? 1 : 0;
      S = curso; M = modo;
      salvar();
      if (modo.foto) foto(modo.foto, jugar);
      else jugar();
    });
    const corr = app.querySelector("[data-corregir]");
    if (corr) corr.addEventListener("click", corregir);
    app.querySelectorAll("[data-borrar]").forEach((b) => b.addEventListener("click", () => {
      if (!confirm("¿Borrar el intento guardado en este navegador?")) return;
      guardar(clave(b.dataset.borrar), null);
      inicio();
    }));
  };

  /* ---------- Foto al entrar ----------
     Un modo puede llevar una foto que sale a pantalla completa al abrirlo; se cierra con un clic o una tecla. */
  const foto = (src, despues) => {
    const capa = document.createElement("div");
    capa.className = "er-foto";
    capa.setAttribute("role", "dialog");
    capa.setAttribute("aria-label", "Foto de bienvenida. Pulsa para continuar");
    capa.innerHTML = '<img src="' + esc(src) + '" alt=""><span>Pulsa para entrar</span>';
    document.body.appendChild(capa);
    const cerrar = () => { capa.remove(); document.removeEventListener("keydown", cerrar); despues(); };
    capa.addEventListener("click", cerrar);
    document.addEventListener("keydown", cerrar);
  };

  /* ---------- Contenido cifrado ----------
     El examen se publica cifrado (AES-GCM con una clave derivada por PBKDF2 de la palabra que dice el
     profesor), así que nadie puede leer las preguntas ni los casos antes de la hora. Al descifrarlo sale
     el código de un objeto: { modo, banco, extra }. */
  const b64 = (t) => Uint8Array.from(atob(t), (c) => c.charCodeAt(0));
  const descifrar = async (ruta, palabra) => {
    try {
      const sobre = await (await fetch(ruta, { cache: "no-store" })).json();
      const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(palabra), "PBKDF2", false, ["deriveKey"]);
      const llave = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(sobre.salt), iterations: sobre.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      const claro = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(sobre.iv) }, llave, b64(sobre.datos));
      return new Function("return (" + new TextDecoder().decode(claro) + ");")();
    } catch (e) {
      return null;
    }
  };

  /* ---------- Reloj ---------- */
  const pararReloj = () => { clearInterval(reloj); reloj = null; };
  const arrancarReloj = () => {
    pararReloj();
    const tic = () => {
      const r = restante();
      const el = app.querySelector("[data-reloj]");
      if (el) { el.textContent = mmss(r); el.closest(".er-reloj").classList.toggle("urgente", r <= 300); }
      if (r <= 0) { pararReloj(); entregar(true); }
    };
    tic();
    reloj = setInterval(tic, 1000);
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && S && !S.entregado) { S.salidas++; salvar(); }
  });

  /* ---------- Juego ---------- */
  const barra = () => {
    const llavero = S.salas.map((s, i) => {
      const hecho = i < S.sala || (i === S.sala && S.fase === "abierta");
      return '<span class="er-digito' + (hecho ? " ok" : "") + '" title="Sala ' + (i + 1) + '">' + (hecho ? s.digito : "·") + "</span>";
    }).join("");
    const enFinal = S.sala >= S.salas.length;
    return '<header class="rt-barra er-barra">' +
      '<div class="rt-titulo">' + svg("puerta") + "<div><h1>El taller cerrado</h1><p>" + esc(M.nombre) + " · " + esc(S.nombre) + "</p></div></div>" +
      '<span class="er-sala">' + (enFinal ? "Puerta final" : "Sala " + (S.sala + 1) + " de " + S.salas.length) + "</span>" +
      '<span class="er-llavero" aria-label="Código de la puerta">' + svg("llave") + llavero + "</span>" +
      '<span class="er-reloj">' + svg("reloj") + '<b data-reloj role="timer" aria-label="Tiempo restante">' + mmss(restante()) + "</b></span>" +
      "</header>";
  };

  const pintar = (cuerpo, foco) => {
    app.innerHTML = '<section class="rt-panel er-juego">' + barra() + '<div class="er-cuerpo">' + cuerpo + "</div></section>";
    const f = foco && app.querySelector(foco);
    if (f) f.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  };

  const jugar = () => {
    if (S.entregado) return resultado();
    if (restante() <= 0) return entregar(true);
    arrancarReloj();
    if (S.sala >= S.salas.length) return puertaFinal();
    ({ intro: introSala, reto: retoSala, candado: candado, candado2: candado, abierta: salaAbierta })[S.fase]();
  };

  const cabeceraSala = (cfg) =>
    '<p class="er-etiqueta">Sala ' + (S.sala + 1) + " · " + cfg.sesiones.join(", ") + "</p><h2>" + esc(cfg.titulo) + "</h2>";

  const introSala = () => {
    const cfg = M.salas[S.sala], s = S.salas[S.sala];
    pintar(
      '<div class="er-caja er-intro">' + cabeceraSala(cfg) +
      '<p class="er-historia">' + esc(cfg.historia) + "</p>" +
      '<p class="rt-nota">Reto: <b>' + esc(JUEGOS[s.reto.juego].nombre) + "</b>" + (s.reto.juego === "diagnostico" ? " (" + s.reto.caso.length + " casos)" : "") + ". Cuando lo termines aparecerá el candado de la sala.</p>" +
      '<div class="rt-acciones"><button type="button" class="rt-boton" data-ir>Empezar el reto ' + svg("flecha") + "</button></div></div>", "[data-ir]");
    app.querySelector("[data-ir]").addEventListener("click", () => { S.fase = "reto"; salvar(); retoSala(); });
  };

  const retoSala = () => {
    const cfg = M.salas[S.sala], s = S.salas[S.sala];
    const hecho = s.reto.total != null;
    pintar(
      '<div class="er-reto-cabecera">' + cabeceraSala(cfg) +
      (hecho ? '<p class="er-ok">' + svg("check") + "Reto terminado: " + s.reto.total + " de " + s.reto.maximo + ' puntos.</p><button type="button" class="rt-boton" data-candado>Ir al candado ' + svg("candado") + "</button>"
        : '<p class="rt-nota">Juega el reto aquí debajo. Cuando lo termines, se abrirá el candado.</p>') +
      "</div>" +
      '<iframe class="er-iframe" title="Reto de la sala ' + (S.sala + 1) + '" src="' + esc(JUEGOS[s.reto.juego].url(s.reto.caso)) + '"></iframe>', hecho ? "[data-candado]" : null);
    const b = app.querySelector("[data-candado]");
    if (b) b.addEventListener("click", () => { S.fase = "candado"; salvar(); candado(); });
  };

  window.addEventListener("message", (e) => {
    if (e.origin !== location.origin || !e.data || e.data.tipo !== "escape-reto" || !S || S.entregado || S.fase !== "reto") return;
    const marco = app.querySelector(".er-iframe");
    if (!marco || e.source !== marco.contentWindow) return;
    const s = S.salas[S.sala];
    if (s.reto.total != null) return;
    s.reto.total = Math.max(0, Math.min(Number(e.data.maximo) || 100, Number(e.data.total) || 0));
    s.reto.maximo = Number(e.data.maximo) || 100;
    s.reto.titulo = String(e.data.id || "");
    salvar();
    const cab = app.querySelector(".er-reto-cabecera");
    const cfg = M.salas[S.sala];
    cab.innerHTML = cabeceraSala(cfg) + '<p class="er-ok">' + svg("check") + "Reto terminado: " + s.reto.total + " de " + s.reto.maximo + ' puntos.</p><button type="button" class="rt-boton" data-candado>Ir al candado ' + svg("candado") + "</button>";
    cab.querySelector("[data-candado]").addEventListener("click", () => { S.fase = "candado"; salvar(); candado(); });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const preguntaHTML = (q, n, campo, bloqueada) => {
    const p = BANCO[q.i];
    const marcada = q[campo];
    return '<fieldset class="er-pregunta' + (bloqueada ? " hecha" : "") + '"><legend><span class="er-fuente">' + esc(p.fuente) + "</span>" + n + ". " + esc(p.pregunta) + "</legend>" +
      q.orden.map((k, j) => '<label class="er-opcion"><input type="radio" name="q' + n + '" value="' + k + '"' + (marcada === k ? " checked" : "") + (bloqueada ? " disabled" : "") + '><span class="er-letra">' + "abcd"[j] + "</span><span>" + esc(p.opciones[k]) + "</span></label>").join("") +
      "</fieldset>";
  };

  const candado = () => {
    const cfg = M.salas[S.sala], s = S.salas[S.sala];
    const segundo = S.fase === "candado2";
    const pendientes = segundo ? s.test.filter((q) => q.r1 !== BANCO[q.i].correcta) : s.test;
    pintar(
      '<form class="er-caja er-candado" data-candado-form>' + cabeceraSala(cfg) +
      '<p class="er-candado-titulo">' + svg("candado") + (segundo
        ? "Segundo intento: el candado no se abrió. Vuelve a responder las " + pendientes.length + " preguntas falladas. Este intento no suma puntos, pero la puerta se abrirá en cualquier caso."
        : "Candado de la sala: responde las " + s.test.length + " preguntas. Se abre con " + abrirCon() + " aciertos.") + "</p>" +
      pendientes.map((q) => preguntaHTML(q, s.test.indexOf(q) + 1, segundo ? "r2" : "r1", false)).join("") +
      '<p class="er-aviso" data-aviso role="alert" hidden></p>' +
      '<div class="rt-acciones"><button type="submit" class="rt-boton">' + (segundo ? "Probar otra vez" : "Probar el candado") + " " + svg("llave") + "</button></div></form>", "input[type=radio]");
    const form = app.querySelector("[data-candado-form]");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const campo = segundo ? "r2" : "r1";
      const faltan = pendientes.filter((q) => !form.querySelector('input[name="q' + (s.test.indexOf(q) + 1) + '"]:checked'));
      const aviso = form.querySelector("[data-aviso]");
      if (faltan.length) { aviso.hidden = false; aviso.textContent = "Te falta responder " + (faltan.length === 1 ? "1 pregunta" : faltan.length + " preguntas") + "."; return; }
      pendientes.forEach((q) => { q[campo] = Number(form.querySelector('input[name="q' + (s.test.indexOf(q) + 1) + '"]:checked').value); });
      if (segundo) {
        s.forzado = pendientes.filter((q) => q.r2 === BANCO[q.i].correcta).length + aciertosTest(s) < abrirCon();
        S.fase = "abierta";
      } else S.fase = aciertosTest(s) >= abrirCon() ? "abierta" : "candado2";
      salvar();
      jugar();
    });
  };

  const salaAbierta = () => {
    const s = S.salas[S.sala];
    const ultima = S.sala + 1 >= S.salas.length;
    pintar(
      '<div class="er-caja er-abierta">' + svg("abierto") +
      "<h2>" + (s.forzado ? "La puerta se abre" : "¡Candado abierto!") + "</h2>" +
      "<p>" + (s.forzado ? "No has llegado a " + abrirCon() + " aciertos, pero nadie se queda encerrado. " : "Has acertado " + aciertosTest(s) + " de " + s.test.length + " a la primera. ") + "Dígito de la sala " + (S.sala + 1) + ":</p>" +
      '<p class="er-digito-grande">' + s.digito + "</p>" +
      '<p class="rt-nota">Apúntalo: lo necesitarás en la puerta final. También lo tienes arriba, en el llavero.</p>' +
      '<div class="rt-acciones"><button type="button" class="rt-boton" data-siguiente>' + (ultima ? "Ir a la puerta final" : "Siguiente sala") + " " + svg("flecha") + "</button></div></div>", "[data-siguiente]");
    app.querySelector("[data-siguiente]").addEventListener("click", () => { S.sala++; S.fase = "intro"; salvar(); jugar(); });
  };

  const puertaFinal = () => {
    const f = M.final;
    const codigo = S.salas.map((s) => s.digito).join("");
    pintar(
      '<form class="er-caja er-candado" data-final>' +
      '<p class="er-etiqueta">Puerta final</p><h2>' + esc(f.titulo) + "</h2>" +
      '<p class="er-historia">' + esc(f.historia) + "</p>" +
      '<label class="er-campo er-codigo"><span>Código de la puerta (' + codigo.length + ' dígitos)</span><input name="codigo" inputmode="numeric" autocomplete="off" maxlength="' + codigo.length + '" pattern="[0-9]*"></label>' +
      '<p class="er-aviso" data-aviso role="alert" hidden></p>' +
      '<div class="rt-acciones"><button type="submit" class="rt-boton">Abrir la puerta y entregar ' + svg("puerta") + "</button></div></form>", "input[name=codigo]");
    const form = app.querySelector("[data-final]");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const aviso = form.querySelector("[data-aviso]");
      if (form.codigo.value.trim() !== codigo) { aviso.hidden = false; aviso.textContent = "Ese código no abre la puerta. Mira los dígitos del llavero, en orden de sala."; return; }
      if (!confirm("Al abrir la puerta entregas el " + (M.soluciones ? "ensayo" : "examen") + " y ya no podrás cambiar nada. ¿Entregar?")) return;
      S.final.codigo = true;
      entregar(false);
    });
  };

  /* ---------- Entrega y hoja de examen ---------- */
  const hoja = () => {
    const h = {
      app: "escape-uf0864", modo: S.modo, nombre: S.nombre,
      inicio: new Date(S.inicio).toISOString(), entrega: new Date(S.entregado).toISOString(),
      minutos: Math.round((S.entregado - S.inicio) / 600) / 100, porTiempo: !!S.porTiempo,
      salidas: S.salidas, reinicios: S.reinicios,
      notaAuto: Math.round(notaAuto() * 100) / 100, maxAuto: maxAuto(),
      salas: S.salas.map((s, i) => ({
        sala: M.salas[i].titulo, reto: { juego: s.reto.juego, caso: s.reto.titulo || String(s.reto.caso), total: s.reto.total, maximo: s.reto.maximo, puntos: Math.round(puntosReto(s) * 100) / 100 },
        test: s.test.map((q) => { const p = BANCO[q.i]; return { fuente: p.fuente, pregunta: p.pregunta, respuesta: q.r1 == null ? null : p.opciones[q.r1], correcta: p.opciones[p.correcta], ok: q.r1 === p.correcta }; }),
        puntosTest: Math.round(aciertosTest(s) * ptsTest() * 100) / 100, puertaForzada: s.forzado
      })),
      cortas: []
    };
    h.codigo = huella(JSON.stringify(h));
    return h;
  };

  const entregar = (porTiempo) => {
    if (!S || S.entregado) return;
    pararReloj();
    S.entregado = porTiempo ? S.inicio + M.minutos * 60000 : Date.now();
    S.porTiempo = porTiempo;
    S.hoja = hoja();
    salvar();
    if (UF && !M.soluciones) UF.examenHecho(Math.round(notaAuto() * 10), Math.round(maxAuto() * 10));
    resultado();
  };

  const descargar = () => {
    const texto = JSON.stringify(S.hoja, null, 2);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([texto], { type: "application/json" }));
    a.download = "escape-uf0864-" + S.modo + "-" + S.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };

  const resultado = () => {
    pararReloj();
    const h = S.hoja;
    const nota = h.notaAuto;
    const revision = M.soluciones ?
      '<h3>Corrección del test</h3><ol class="er-revision">' + S.salas.flatMap((s) => s.test).map((q) => {
        const p = BANCO[q.i], ok = q.r1 === p.correcta;
        return '<li class="' + (ok ? "ok" : "mal") + '"><b>' + esc(p.pregunta) + "</b><span>" + (ok ? "✓ " : "✗ Respondiste: " + esc(q.r1 == null ? "nada" : p.opciones[q.r1]) + ". ") + "Correcta: " + esc(p.opciones[p.correcta]) + "</span><small>" + esc(p.explica) + "</small></li>";
      }).join("") + "</ol>"
      : "";
    app.innerHTML =
      '<section class="rt-panel er-resultado">' +
      '<p class="rt-antetitulo"><b>' + esc(M.nombre) + "</b> · " + esc(S.nombre) + "</p>" +
      "<h2>" + (h.porTiempo ? "Se acabó el tiempo" : "¡Has salido del taller!") + "</h2>" +
      '<p class="er-nota"><b>' + coma(nota) + "</b> / " + coma(h.maxAuto) + "<small>nota sobre 10</small></p>" +
      '<table class="er-tabla"><thead><tr><th>Sala</th><th>Reto</th><th>Test</th></tr></thead><tbody>' +
      h.salas.map((s, i) => "<tr><td>" + (i + 1) + ". " + esc(s.sala) + (s.puertaForzada ? " <small>(puerta forzada)</small>" : "") + "</td><td>" + coma(s.reto.puntos) + "</td><td>" + coma(s.puntosTest) + "</td></tr>").join("") +
      "</tbody></table>" +
      '<p class="rt-nota">Tiempo: ' + mmss(h.minutos * 60) + " · Salidas de la página: " + h.salidas + (h.reinicios ? " · Retos reiniciados al recargar: " + h.reinicios : "") + "</p>" +
      '<div class="er-entrega"><p>' + (M.soluciones ? "Esto es un ensayo: no cuenta para nota. Descarga la hoja para practicar la entrega del día del examen." : "<b>Descarga tu hoja de examen y entrégasela al profesor.</b> Sin la hoja no hay nota.") + "</p>" +
      '<p class="er-codigo-ver">Código de verificación: <code>' + esc(h.codigo) + "</code></p>" +
      '<div class="rt-acciones"><button type="button" class="rt-boton" data-descargar>' + svg("descarga") + "Descargar hoja de examen</button>" +
      (M.soluciones ? '<button type="button" class="rt-boton rt-secundario" data-repetir>Repetir el ensayo</button>' : "") +
      '<a class="rt-boton rt-secundario" href="software.html">Volver a la UF0864</a></div></div>' +
      revision +
      "</section>";
    app.querySelector("[data-descargar]").addEventListener("click", descargar);
    const rep = app.querySelector("[data-repetir]");
    if (rep) rep.addEventListener("click", () => { guardar(clave(S.modo), null); inicio(); });
    window.scrollTo(0, 0);
  };

  /* ---------- Corrección (profesor) ---------- */
  const CLAVE_NOTAS = "escape-uf0864-correccion";
  const corregir = () => {
    let hojas = [];
    let notas = leer(CLAVE_NOTAS) || {};
    const verificada = (h) => { const c = Object.assign({}, h); delete c.codigo; return huella(JSON.stringify(c)) === h.codigo; };
    const nCortas = (h) => h.cortas.length;
    const notaCortas = (h) => (notas[h.codigo] || []).reduce((a, b) => a + (Number(b) || 0), 0);
    const notaFinal = (h) => h.notaAuto + notaCortas(h);
    const pintarTabla = () => {
      const t = app.querySelector("[data-tabla]");
      t.innerHTML = hojas.length ? '<table class="er-tabla"><thead><tr><th>Alumno</th><th>Modo</th><th>Auto /' + coma(hojas[0].maxAuto) + "</th><th>Cortas</th><th>Nota</th><th>Tiempo</th><th>Salidas</th><th>Hoja</th></tr></thead><tbody>" +
        hojas.map((h, i) => '<tr><td><button type="button" class="er-enlace" data-ver="' + i + '">' + esc(h.nombre) + "</button></td><td>" + esc(h.modo) + "</td><td>" + coma(h.notaAuto) + "</td><td>" + (nCortas(h) ? coma(notaCortas(h)) + " / " + coma(nCortas(h) * PUNTOS_CORTA) : "—") + "</td><td><b>" + coma(notaFinal(h)) + "</b></td><td>" + Math.round(h.minutos) + " min" + (h.porTiempo ? " (tiempo)" : "") + "</td><td>" + h.salidas + (h.reinicios ? " · " + h.reinicios + " reinicios" : "") + "</td><td>" + (verificada(h) ? '<span class="er-bien">Correcta</span>' : '<span class="er-mal">Modificada</span>') + "</td></tr>").join("") + "</tbody></table>"
        : '<p class="rt-nota">Carga las hojas (.json) que te han entregado los alumnos. Puedes elegir varias a la vez.</p>';
      t.querySelectorAll("[data-ver]").forEach((b) => b.addEventListener("click", () => ver(Number(b.dataset.ver))));
    };
    const ver = (i) => {
      const h = hojas[i];
      const d = app.querySelector("[data-detalle]");
      const modelos = h.cortas;
      const n = notas[h.codigo] || [];
      d.innerHTML = "<h3>" + esc(h.nombre) + "</h3>" +
        h.cortas.map((c, k) => '<div class="er-caja er-corregir"><b>' + (k + 1) + ". " + esc(c.pregunta) + '</b><p class="er-tuya">' + (esc(c.respuesta) || "<i>Sin responder</i>") + "</p>" +
          (modelos[k] && modelos[k].modelo ? "<small><b>Modelo:</b> " + esc(modelos[k].modelo) + "</small><small><b>Se valora:</b> " + modelos[k].criterios.map(esc).join(" · ") + "</small>" : "") +
          '<div class="er-puntos" role="radiogroup" aria-label="Puntos">' + [0, PUNTOS_CORTA / 2, PUNTOS_CORTA].map((p) => '<label><input type="radio" name="c' + k + '" value="' + p + '"' + (Number(n[k]) === p && n[k] != null ? " checked" : "") + "><span>" + coma(p) + "</span></label>").join("") + "</div></div>").join("") +
        "<h3>Test</h3><ul class=\"er-revision\">" + h.salas.flatMap((s) => s.test).map((q) => '<li class="' + (q.ok ? "ok" : "mal") + '"><b>' + esc(q.pregunta) + "</b><span>" + (q.ok ? "✓ " : "✗ " + esc(q.respuesta || "sin responder") + " · ") + "Correcta: " + esc(q.correcta) + "</span></li>").join("") + "</ul>";
      d.querySelectorAll("input[type=radio]").forEach((r) => r.addEventListener("change", () => {
        const arr = (notas[h.codigo] || []).slice();
        arr[Number(r.name.slice(1))] = Number(r.value);
        notas[h.codigo] = arr;
        guardar(CLAVE_NOTAS, notas);
        pintarTabla();
      }));
      d.scrollIntoView({ behavior: "smooth" });
    };
    const csv = () => {
      const f = (v) => '"' + String(v).replace(/"/g, '""') + '"';
      const filas = [["Alumno", "Modo", "Nota automática", "Respuesta corta", "Nota final", "Minutos", "Salidas", "Reinicios", "Hoja"]].concat(
        hojas.map((h) => [h.nombre, h.modo, coma(h.notaAuto), coma(notaCortas(h)), coma(notaFinal(h)), Math.round(h.minutos), h.salidas, h.reinicios, verificada(h) ? "correcta" : "modificada"]));
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob(["﻿" + filas.map((r) => r.map(f).join(";")).join("\r\n")], { type: "text/csv" }));
      a.download = "notas-escape-uf0864.csv";
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };
    app.innerHTML =
      '<section class="rt-panel er-portada er-profe-panel">' +
      '<p class="rt-antetitulo"><b>UF0864</b> · Escape room · Profesor</p><h1>' + svg("check") + "<span>Corregir hojas</span></h1>" +
      '<div class="rt-acciones"><label class="rt-boton">Cargar hojas<input type="file" accept=".json,application/json" multiple data-archivos hidden></label>' +
      '<button type="button" class="rt-boton rt-secundario" data-csv>Exportar notas (CSV)</button><button type="button" class="rt-boton rt-secundario" data-volver>Volver</button></div>' +
      '<p class="rt-nota">La nota es automática. Si cargas una hoja antigua con respuesta corta, lo que puntúes se guarda en este navegador. «Modificada» quiere decir que alguien ha editado la hoja después de descargarla.</p>' +
      '<div data-tabla></div><div data-detalle></div></section>';
    app.querySelector("[data-archivos]").addEventListener("change", async (e) => {
      for (const file of e.target.files) {
        try {
          const h = JSON.parse(await file.text());
          if (h.app === "escape-uf0864" && !hojas.some((x) => x.codigo === h.codigo)) hojas.push(h);
        } catch (err) { /* archivo que no es una hoja */ }
      }
      hojas.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      pintarTabla();
    });
    app.querySelector("[data-csv]").addEventListener("click", csv);
    app.querySelector("[data-volver]").addEventListener("click", () => inicio());
    pintarTabla();
  };

  inicio();
})();
