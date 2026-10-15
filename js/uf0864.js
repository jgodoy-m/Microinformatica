/* Lógica común de las páginas de la UF0864: tema claro/oscuro, botón del modo Halloween,
   perfil con nombre y progreso de cada alumno (guardado en este navegador) y temario.
   Se carga al final del <body>. */
(() => {
  "use strict";

  const root = document.documentElement;

  const leer = (clave, defecto) => {
    try { const v = localStorage.getItem(clave); return v === null ? defecto : v; } catch (_) { return defecto; }
  };
  const guardar = (clave, valor) => {
    try {
      if (valor === null) localStorage.removeItem(clave); else localStorage.setItem(clave, valor);
    } catch (_) { /* almacenamiento bloqueado: dura solo esta visita */ }
  };

  /* ---------- Temario ---------- */
  const TEMAS = [
    {
      titulo: "Diagnóstico de averías lógicas",
      descripcion: "Cómo arranca un equipo, en qué fase se para y qué distingue una avería lógica de una física.",
      sesiones: [
        { id: "s15", codigo: "S15", titulo: "El arranque del equipo", resumen: "Del botón al escritorio, BIOS, UEFI y Secure Boot, particiones y gestor de arranque, y averías de arranque.", url: "apuntes/ver-s15.html", pdf: "apuntes/s15-arranque.pdf" }
      ]
    },
    {
      titulo: "Recuperación de datos",
      descripcion: "Discos, particiones y sistemas de archivos: lo que hay que entender antes de recuperar nada.",
      sesiones: [
        { id: "s16", codigo: "S16", titulo: "Discos, particiones y sistemas de archivos", resumen: "Particiones y volúmenes, sistemas de archivos, administración de discos y diskpart, y averías lógicas del disco.", url: "apuntes/ver-s16.html", pdf: "apuntes/s16-discos.pdf", desde: "2026-10-16" }
      ]
    },
    { titulo: "Reparación del sistema operativo", descripcion: "Herramientas de reparación, restauración y reinstalación del sistema.", sesiones: [] },
    { titulo: "Antivirus y malware", descripcion: "Detección, eliminación y prevención de software malicioso.", sesiones: [] },
    { titulo: "Casos prácticos", descripcion: "Situaciones reales de averías lógicas resueltas paso a paso.", sesiones: [] },
    { titulo: "Examen final", descripcion: "Repaso y examen de la unidad.", sesiones: [] }
  ];
  const TOTAL_TEORIA = 6;

  const disponible = (s) => {
    if (!s.desde) return true;
    const [y, m, d] = s.desde.split("-").map(Number);
    return new Date() >= new Date(y, m - 1, d);
  };
  const fechaLegible = (s) => {
    const [y, m, d] = s.desde.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  };

  /* ---------- Perfiles y progreso ---------- */
  const CLAVE_PERFILES = "uf0864-perfiles";
  const vacio = () => ({ teoria: [], practicas: [], examen: [] });

  let datos;
  try { datos = JSON.parse(leer(CLAVE_PERFILES, "null")); } catch (_) { datos = null; }
  if (!datos || typeof datos !== "object" || !datos.perfiles) datos = { actual: "", perfiles: {} };
  /* Progreso guardado antes de que existieran los perfiles: pasa al perfil sin nombre. */
  try {
    const viejo = JSON.parse(leer("uf0864-progreso", "null"));
    if (viejo && !datos.perfiles[""]) datos.perfiles[""] = Object.assign(vacio(), viejo);
    guardar("uf0864-progreso", null);
  } catch (_) {}

  const progreso = () => {
    if (!datos.perfiles[datos.actual]) datos.perfiles[datos.actual] = vacio();
    return Object.assign(vacio(), datos.perfiles[datos.actual]);
  };
  const guardarDatos = () => guardar(CLAVE_PERFILES, JSON.stringify(datos));

  const marcarVisto = (id) => {
    const p = progreso();
    if (!p.teoria.includes(id)) p.teoria.push(id);
    datos.perfiles[datos.actual] = p;
    guardarDatos();
  };

  const iniciales = (nombre) => nombre.trim().split(/\s+/).slice(0, 2).map((t) => t[0]).join("").toUpperCase();

  const pintarPerfil = () => {
    const nombre = datos.actual;
    document.querySelectorAll(".perfil-boton").forEach((b) => {
      b.querySelector(".avatar").innerHTML = nombre
        ? iniciales(nombre)
        : '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="4"/><path d="M4.5 20.5c1.5-4 4.3-5.5 7.5-5.5s6 1.5 7.5 5.5"/></svg>';
      b.querySelector(".perfil-nombre").textContent = nombre || "Tu nombre";
      b.setAttribute("aria-label", nombre ? "Perfil de " + nombre + ". Cambiar" : "Escribir tu nombre");
    });
    document.querySelectorAll("[data-nombre-perfil]").forEach((el) => {
      el.textContent = nombre ? nombre : "";
      el.hidden = !nombre;
    });
  };

  const pintarProgreso = () => {
    const p = progreso();
    const cuentas = { teoria: [p.teoria.length, TOTAL_TEORIA], practicas: [p.practicas.length, 4], examen: [p.examen.length, 1] };
    let hechos = 0, total = 0;
    Object.entries(cuentas).forEach(([k, [n, t]]) => {
      n = Math.min(n, t);
      hechos += n; total += t;
      document.querySelectorAll('[data-cuenta="' + k + '"]').forEach((el) => { el.textContent = n + " / " + t; });
    });
    const pct = Math.round(hechos / total * 100);
    document.querySelectorAll(".barra").forEach((b) => {
      b.setAttribute("aria-valuenow", pct);
      b.querySelector("span").style.width = pct + "%";
    });
    document.querySelectorAll(".porcentaje").forEach((el) => { el.textContent = pct + "%"; });
    document.querySelectorAll("[data-visto]").forEach((el) => { el.hidden = !p.teoria.includes(el.dataset.visto); });
  };

  /* ---------- Diálogo del perfil ---------- */
  const dialogo = document.getElementById("dialogo-perfil");
  if (dialogo) {
    const form = dialogo.querySelector("form");
    const input = dialogo.querySelector("input");
    const lista = dialogo.querySelector(".perfiles-guardados");

    const pintarLista = () => {
      const nombres = Object.keys(datos.perfiles).filter((n) => n);
      lista.hidden = nombres.length === 0;
      lista.querySelector("ul").innerHTML = "";
      nombres.forEach((n) => {
        const li = document.createElement("li");
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = n;
        if (n === datos.actual) b.setAttribute("aria-current", "true");
        b.addEventListener("click", () => { datos.actual = n; guardarDatos(); actualizar(); dialogo.close(); });
        li.appendChild(b);
        lista.querySelector("ul").appendChild(li);
      });
    };

    document.querySelectorAll(".perfil-boton").forEach((b) => b.addEventListener("click", () => {
      input.value = datos.actual;
      pintarLista();
      dialogo.showModal();
      input.focus();
    }));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = input.value.trim().replace(/\s+/g, " ").slice(0, 40);
      if (!nombre) { input.focus(); return; }
      /* El primer nombre que se escribe se queda con el progreso hecho sin nombre. */
      if (!datos.perfiles[nombre]) {
        const anonimo = datos.perfiles[""];
        datos.perfiles[nombre] = datos.actual === "" && anonimo ? anonimo : vacio();
        if (datos.actual === "") delete datos.perfiles[""];
      }
      datos.actual = nombre;
      guardarDatos();
      actualizar();
      dialogo.close();
    });

    dialogo.querySelector("[data-cerrar]").addEventListener("click", () => dialogo.close());
    dialogo.addEventListener("click", (e) => { if (e.target === dialogo) dialogo.close(); });
  }

  /* ---------- Enlaces a apuntes ---------- */
  const prepararEnlaces = () => {
    document.querySelectorAll("a[data-sesion]").forEach((a) => {
      if (a.dataset.listo) return;
      a.dataset.listo = "1";
      a.addEventListener("click", (e) => {
        if (a.getAttribute("aria-disabled") === "true") { e.preventDefault(); return; }
        marcarVisto(a.dataset.sesion);
      });
    });
  };

  /* ---------- Página del temario ---------- */
  const temasLista = document.querySelector(".temas-lista");
  const detalle = document.querySelector(".tema-detalle");
  const CANDADO = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  const FLECHA = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const pintarDetalle = (i) => {
    const t = TEMAS[i];
    detalle.setAttribute("aria-labelledby", "tab-tema-" + (i + 1));
    detalle.innerHTML =
      '<p class="tema-num">Tema ' + (i + 1) + "</p>" +
      "<h2>" + esc(t.titulo) + "</h2>" +
      "<p>" + esc(t.descripcion) + "</p>" +
      (t.sesiones.length
        ? '<ul class="sesiones">' + t.sesiones.map((s) => {
            const abierta = disponible(s);
            return '<li class="sesion' + (abierta ? "" : " bloqueada") + '">' +
              '<span class="codigo">' + s.codigo + "</span>" +
              '<span class="sesion-texto"><strong>' + esc(s.titulo) + "</strong><span>" + esc(s.resumen) + "</span></span>" +
              (abierta
                ? '<span class="visto" data-visto="' + s.id + '" hidden>✓ Visto</span>' +
                  '<a class="boton" href="' + s.url + '" data-sesion="' + s.id + '">Abrir apuntes ' + FLECHA + "</a>"
                : '<span class="candado-texto">' + CANDADO + "Disponible el " + fechaLegible(s) + "</span>") +
              "</li>";
          }).join("") + "</ul>"
        : '<p class="sin-sesiones">Los apuntes de este tema llegarán en las próximas sesiones.</p>');
    prepararEnlaces();
    pintarProgreso();
  };

  const seleccionarTema = (i, foco) => {
    temasLista.querySelectorAll("button").forEach((b, j) => {
      b.setAttribute("aria-selected", String(i === j));
      b.tabIndex = i === j ? 0 : -1;
    });
    if (foco) temasLista.querySelectorAll("button")[i].focus();
    pintarDetalle(i);
  };

  if (temasLista && detalle) {
    temasLista.innerHTML = TEMAS.map((t, i) => {
      const n = t.sesiones.filter(disponible).length;
      const estado = t.sesiones.length ? (n ? n + (n === 1 ? " sesión" : " sesiones") : "Pronto") : "Pronto";
      return '<li role="presentation"><button type="button" role="tab" id="tab-tema-' + (i + 1) + '" aria-controls="detalle-tema">' +
        '<span class="num">' + (i + 1) + "</span><span>" + esc(t.titulo) + '</span><span class="estado">' + estado + "</span></button></li>";
    }).join("");
    const botones = [...temasLista.querySelectorAll("button")];
    botones.forEach((b, i) => {
      b.addEventListener("click", () => {
        history.replaceState(null, "", "#tema-" + (i + 1));
        seleccionarTema(i);
        /* En móvil el detalle queda debajo de la lista. */
        if (matchMedia("(max-width: 980px)").matches) detalle.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      b.addEventListener("keydown", (e) => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        const j = (i + d + botones.length) % botones.length;
        history.replaceState(null, "", "#tema-" + (j + 1));
        seleccionarTema(j, true);
      });
    });
    const desdeHash = () => {
      const m = /^#tema-(\d)$/.exec(location.hash);
      const i = m ? Math.min(Math.max(Number(m[1]) - 1, 0), TEMAS.length - 1) : 0;
      seleccionarTema(i);
    };
    window.addEventListener("hashchange", desdeHash);
    desdeHash();
  }

  /* Apuntes con fecha de apertura en la portada de la UF. */
  document.querySelectorAll("a[data-desde]").forEach((a) => {
    if (disponible({ desde: a.dataset.desde })) {
      a.removeAttribute("aria-disabled");
      a.removeAttribute("title");
      a.querySelector(".candado")?.remove();
    }
  });

  /* Bloques que aún no tienen contenido. */
  document.querySelectorAll("[data-pronto]").forEach((b) => b.addEventListener("click", () => {
    const aviso = b.parentElement.querySelector(".pronto");
    aviso.textContent = "Disponible en las próximas sesiones.";
    aviso.classList.add("visible");
  }));

  /* ---------- Tema claro / oscuro ---------- */
  const botonesTema = document.querySelectorAll(".selector-tema button");
  const pintarTema = () => botonesTema.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tema === root.dataset.theme)));
  botonesTema.forEach((b) => b.addEventListener("click", () => {
    root.dataset.theme = b.dataset.tema;
    guardar("temario-tema", b.dataset.tema);
    pintarTema();
  }));

  /* ---------- Modo Halloween (misma preferencia que el resto del sitio) ---------- */
  const CALABAZA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6c0-2 1-3 2.5-3.5" fill="none" stroke="#4E8A2E" stroke-width="2" stroke-linecap="round"/><ellipse cx="7.5" cy="14" rx="5" ry="7" fill="#E8650F"/><ellipse cx="16.5" cy="14" rx="5" ry="7" fill="#E8650F"/><ellipse cx="12" cy="14" rx="5.2" ry="7.6" fill="#FF8A1F"/><path d="M7.5 11.5l2 2h-3zM16.5 11.5l-2 2h3zM7 16.5q5 3.5 10 0l-1.6.4-.9 1-1-1h-3l-1 1-.9-1z" fill="#2A1200"/></svg>';
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "boton-halloween";
  boton.innerHTML = CALABAZA + "<span>Halloween</span>";
  document.body.appendChild(boton);

  const aplicarHalloween = () => {
    const on = leer("temario-halloween", "") === "on";
    if (on) root.setAttribute("data-halloween", "on"); else root.removeAttribute("data-halloween");
    boton.setAttribute("aria-pressed", String(on));
    boton.setAttribute("aria-label", on ? "Quitar el modo Halloween" : "Activar el modo Halloween");
  };
  boton.addEventListener("click", () => {
    guardar("temario-halloween", root.getAttribute("data-halloween") === "on" ? null : "on");
    aplicarHalloween();
  });
  window.addEventListener("storage", (e) => {
    if (e.key === "temario-halloween") aplicarHalloween();
    if (e.key === CLAVE_PERFILES) {
      try { datos = JSON.parse(e.newValue) || datos; } catch (_) {}
      actualizar();
    }
  });

  const actualizar = () => { pintarPerfil(); pintarProgreso(); };

  /* Al volver con el botón Atrás desde unos apuntes, la página puede salir de la caché. */
  window.addEventListener("pageshow", () => {
    try { datos = JSON.parse(leer(CLAVE_PERFILES, "null")) || datos; } catch (_) {}
    actualizar();
  });

  aplicarHalloween();
  pintarTema();
  prepararEnlaces();
  actualizar();
})();
