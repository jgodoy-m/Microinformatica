/* Simulacro de examen de la UF0864 (examen-uf0864.html).
   Las preguntas están en examen/banco-uf0864.js. Cada sesión entra en el sorteo el día de su clase
   (fecha «desde» del temario en js/uf0864.js); con ?profe se ven todas. */
(() => {
  "use strict";

  const PREVIA = new URLSearchParams(location.search).has("profe");
  /* Porcentaje mínimo para aprobar (el mismo que en el simulacro de hardware). */
  const APROBADO = 50;
  const LETRAS = ["A", "B", "C", "D"];
  const BANCO = window.BANCO_UF0864 || [];
  const UF = window.UF0864;
  const $ = (id) => document.getElementById(id);
  const CANDADO = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

  /* Sesiones del temario que tienen preguntas en el banco. */
  const SESIONES = UF.sesiones().filter((s) => BANCO.some((q) => q.fuente === s.codigo));
  const abierta = (s) => PREVIA || UF.disponible(s);
  const porCodigo = Object.fromEntries(SESIONES.map((s) => [s.codigo, s]));
  const cuantas = (codigo) => BANCO.filter((q) => q.fuente === codigo).length;

  const barajar = (lista) => {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let items = [], i = 0, aciertos = 0, elegida = null, comprobada = false;

  /* ---------- Inicio ---------- */
  const pintarSesiones = () => {
    const cont = $("sesiones");
    cont.innerHTML = "";
    SESIONES.forEach((s) => {
      const libre = abierta(s);
      const label = document.createElement("label");
      label.className = "sesion-examen" + (libre ? "" : " bloqueada");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = s.codigo;
      input.checked = libre;
      input.disabled = !libre;
      input.addEventListener("change", pintarTotal);
      const texto = document.createElement("span");
      texto.innerHTML = "<b></b><span></span><small></small>";
      texto.querySelector("b").textContent = s.codigo;
      texto.querySelector("span").textContent = s.titulo;
      texto.querySelector("small").innerHTML = libre
        ? cuantas(s.codigo) + " preguntas"
        : CANDADO + "Disponible el " + UF.fechaLegible(s);
      label.append(input, texto);
      cont.appendChild(label);
    });
  };

  const elegidas = () => [...document.querySelectorAll("#sesiones input:checked")].map((c) => c.value);
  const bancoElegido = () => { const e = elegidas(); return BANCO.filter((q) => e.includes(q.fuente)); };

  function pintarTotal() {
    const n = bancoElegido().length;
    $("total").textContent = n
      ? n + " preguntas en el banco para las sesiones marcadas."
      : "Marca al menos una sesión.";
    $("empezar").disabled = n === 0;
  }

  /* ---------- Preguntas ---------- */
  const preparar = (q) => {
    const orden = barajar([0, 1, 2, 3]);
    return { q, opciones: orden.map((k) => q.opciones[k]), correcta: orden.indexOf(q.correcta), elegida: null };
  };

  const nombreSesion = (codigo) => codigo + " · " + porCodigo[codigo].titulo;
  const enlaceApuntes = (codigo, texto) => {
    const a = document.createElement("a");
    a.href = porCodigo[codigo].url;
    a.textContent = texto;
    return a;
  };

  function empezar() {
    const banco = bancoElegido();
    if (!banco.length) return;
    const valor = document.querySelector('input[name="n"]:checked').value;
    const n = valor === "todas" ? banco.length : Math.min(parseInt(valor, 10), banco.length);
    items = barajar(banco).slice(0, n).map(preparar);
    i = 0; aciertos = 0;
    $("inicio").hidden = true;
    $("resultado").hidden = true;
    $("prueba").hidden = false;
    mostrar();
    window.scrollTo(0, 0);
  }

  function mostrar() {
    const it = items[i];
    comprobada = false;
    elegida = null;
    $("contador").textContent = "Pregunta " + (i + 1) + " de " + items.length;
    $("aciertos").textContent = "Aciertos: " + aciertos;
    $("barra").style.width = (i / items.length * 100) + "%";
    $("fuente").textContent = nombreSesion(it.q.fuente);
    $("pregunta").textContent = it.q.pregunta;
    const cont = $("opciones");
    cont.innerHTML = "";
    it.opciones.forEach((texto, k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "examen-opcion";
      b.setAttribute("aria-pressed", "false");
      b.innerHTML = '<span class="letra">' + LETRAS[k] + "</span><span></span>";
      b.lastChild.textContent = texto;
      b.addEventListener("click", () => elegir(k));
      cont.appendChild(b);
    });
    $("feedback").hidden = true;
    $("comprobar").hidden = false;
    $("comprobar").disabled = true;
    $("siguiente").hidden = true;
    $("siguiente").textContent = i + 1 < items.length ? "Siguiente" : "Ver resultado";
  }

  function elegir(k) {
    if (comprobada) return;
    elegida = k;
    items[i].elegida = k;
    document.querySelectorAll(".examen-opcion").forEach((b, n) => b.setAttribute("aria-pressed", String(n === k)));
    $("comprobar").disabled = false;
  }

  function comprobar() {
    const it = items[i];
    comprobada = true;
    const acierto = elegida === it.correcta;
    if (acierto) aciertos++;
    document.querySelectorAll(".examen-opcion").forEach((b, n) => {
      b.disabled = true;
      if (n === it.correcta) b.classList.add("correcta");
      if (n === elegida && !acierto) b.classList.add("fallo");
    });
    const f = $("feedback");
    f.className = "examen-feedback " + (acierto ? "ok" : "mal");
    f.innerHTML = "";
    const titulo = document.createElement("strong");
    titulo.textContent = acierto ? "Correcto" : "No es esta. La correcta es: " + LETRAS[it.correcta] + ") " + it.opciones[it.correcta];
    const texto = document.createElement("p");
    texto.textContent = it.q.explica;
    f.append(titulo, texto, enlaceApuntes(it.q.fuente, "Ver en los apuntes de " + it.q.fuente));
    f.hidden = false;
    $("aciertos").textContent = "Aciertos: " + aciertos;
    $("comprobar").hidden = true;
    $("siguiente").hidden = false;
    $("siguiente").focus();
  }

  function siguiente() {
    if (i + 1 < items.length) { i++; mostrar(); window.scrollTo(0, 0); }
    else terminar();
  }

  /* ---------- Resultado ---------- */
  function terminar() {
    const total = items.length;
    const hechas = items.filter((x) => x.elegida !== null).length;
    const porcentaje = total ? Math.round(aciertos / total * 100) : 0;
    const aprobado = porcentaje >= APROBADO;
    $("prueba").hidden = true;
    $("resultado").hidden = false;
    $("nota").textContent = aciertos + " / " + total;
    $("porcentaje").textContent = porcentaje + " %";
    $("veredicto").className = "examen-veredicto " + (aprobado ? "ok" : "mal");
    $("veredicto").textContent = (aprobado ? "Aprobado" : "Suspenso") + " · se aprueba con un " + APROBADO + " % de aciertos";
    $("mensaje").textContent = (porcentaje >= 80
      ? "Muy buen resultado. Revisa los fallos: son los que más te van a costar en el examen."
      : aprobado
        ? "Vas bien, pero repasa los apuntes de las preguntas que fallaste."
        : "Repasa los apuntes antes de otro simulacro. Usa los enlaces de cada pregunta.")
      + (hechas < total ? " Has terminado antes de responder todas." : "");
    if (hechas) UF.examenHecho(aciertos, total);

    const lista = $("revision");
    lista.innerHTML = "";
    items.forEach((it, n) => {
      const sinResponder = it.elegida === null;
      const acierto = it.elegida === it.correcta;
      const li = document.createElement("li");
      li.className = sinResponder ? "" : (acierto ? "ok" : "mal");
      const fuente = document.createElement("span");
      fuente.className = "examen-fuente";
      fuente.textContent = (n + 1) + ". " + nombreSesion(it.q.fuente);
      const p = document.createElement("p");
      p.className = "p";
      p.textContent = it.q.pregunta;
      const r = document.createElement("p");
      r.className = "r";
      if (sinResponder) r.textContent = "Sin responder. Correcta: " + it.opciones[it.correcta];
      else if (acierto) r.textContent = "Respuesta correcta: " + it.opciones[it.correcta];
      else {
        r.textContent = "Tu respuesta: " + it.opciones[it.elegida] + ". ";
        const b = document.createElement("b");
        b.textContent = "Correcta: " + it.opciones[it.correcta] + ".";
        r.appendChild(b);
      }
      li.append(fuente, p, r, enlaceApuntes(it.q.fuente, "Repasar los apuntes de " + it.q.fuente));
      lista.appendChild(li);
    });
    window.scrollTo(0, 0);
  }

  function volverAlInicio() {
    $("resultado").hidden = true;
    $("prueba").hidden = true;
    $("inicio").hidden = false;
    pintarTotal();
  }

  $("empezar").addEventListener("click", empezar);
  $("comprobar").addEventListener("click", comprobar);
  $("siguiente").addEventListener("click", siguiente);
  $("salir").addEventListener("click", terminar);
  $("repetir").addEventListener("click", volverAlInicio);
  pintarSesiones();
  volverAlInicio();
})();
