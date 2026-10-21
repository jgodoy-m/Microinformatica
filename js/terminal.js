/* Motor de terminal simulada para los minijuegos de la UF0864.
   Todo ocurre en el navegador: no ejecuta nada en el equipo del alumno ni lee sus archivos.
   Cada reto aporta sus comandos, su sistema de archivos ficticio y su estado; el motor se encarga
   de la entrada, el historial, el autocompletado, la ayuda en español y las preguntas interactivas. */
(() => {
  "use strict";

  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  /* Distancia de edición, para sugerir el comando que el alumno quería escribir. */
  const distancia = (a, b) => {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  };

  /* Separa la línea en palabras respetando las comillas. */
  const trocear = (linea) => {
    const partes = [];
    const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    let m;
    while ((m = re.exec(linea))) partes.push(m[1] ?? m[2] ?? m[3]);
    return partes;
  };

  /* Opciones al estilo Linux (-n, -r3, --destino x, --destino=x) y Windows (/f, /r). */
  const opciones = (args, conValor = []) => {
    const pos = [], marcas = new Set(), valores = {};
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a.startsWith("--")) {
        const [k, v] = a.slice(2).split("=");
        if (v !== undefined) valores[k] = v;
        else if (conValor.includes(k) && i + 1 < args.length) valores[k] = args[++i];
        else marcas.add(k);
      } else if (/^-[a-z]/i.test(a)) {
        const m = a.slice(1).match(/^([a-z])(\d+)$/i);
        if (m) valores[m[1]] = m[2]; else a.slice(1).split("").forEach((c) => marcas.add(c));
      } else if (/^\/[a-z]$/i.test(a)) marcas.add(a.toLowerCase());
      else pos.push(a);
    }
    return { pos, marcas, valores };
  };

  /* ---------- Sistema de archivos ficticio ---------- */
  const dir = (hijos) => ({ tipo: "dir", hijos: hijos || {} });
  const archivo = (contenido, extra) => Object.assign({ tipo: "archivo", contenido }, extra);

  const normalizar = (ruta, cwd) => {
    const partes = (ruta.startsWith("/") ? ruta : cwd + "/" + ruta).split("/");
    const pila = [];
    partes.forEach((p) => {
      if (!p || p === ".") return;
      if (p === "..") pila.pop(); else pila.push(p);
    });
    return "/" + pila.join("/");
  };
  const hijosDe = (nodo) => (typeof nodo.hijos === "function" ? nodo.hijos() : nodo.hijos);
  const buscar = (raiz, ruta) => {
    let nodo = raiz;
    for (const p of ruta.split("/").filter(Boolean)) {
      if (!nodo || nodo.tipo !== "dir") return null;
      nodo = hijosDe(nodo)[p];
    }
    return nodo || null;
  };

  /* ---------- Terminal ---------- */
  const crear = (cfg) => {
    const { salida, entrada, formulario } = cfg;
    const historial = [];
    let posHistorial = 0;
    let ocupado = false;
    let pregunta = null;
    let cwd = cfg.inicio || "/";
    const comandos = {};

    const t = {
      esc, opciones, dir, archivo,
      get cwd() { return cwd; },
      set cwd(v) { cwd = v; },
      raiz: cfg.raiz || dir(),
      comandos,
      /* Modo difícil: los errores no sugieren comandos ni enseñan ejemplos. */
      sinAyudas: !!cfg.sinAyudas,

      ruta: (r) => normalizar(r || ".", cwd),
      nodo: (r) => buscar(t.raiz, normalizar(r || ".", cwd)),
      hijos: hijosDe,

      /* Escribe una o varias líneas. «texto» admite segmentos [[texto, clase], ...]. */
      escribir(texto, clase) {
        const linea = document.createElement("div");
        linea.className = "t-linea" + (clase ? " " + clase : "");
        if (Array.isArray(texto)) linea.innerHTML = texto.map(([s, c]) => (c ? '<span class="' + c + '">' + esc(s) + "</span>" : esc(s))).join("");
        else linea.textContent = texto;
        salida.appendChild(linea);
        salida.scrollTop = salida.scrollHeight;
        return linea;
      },
      lineas(lista, clase) { lista.forEach((l) => t.escribir(l, clase)); },
      tabla(filas, clase) {
        const anchos = [];
        filas.forEach((f) => f.forEach((c, i) => { anchos[i] = Math.max(anchos[i] || 0, String(c).length); }));
        filas.forEach((f, n) => t.escribir(f.map((c, i) => String(c).padEnd(i < f.length - 1 ? anchos[i] + 2 : 0)).join(""), n === 0 ? "t-cabecera" : clase));
      },
      limpiar() { salida.innerHTML = ""; },

      /* Barra de progreso animada; el alumno no puede escribir mientras dura. */
      progreso(etiqueta, ms = 1400) {
        return new Promise((ok) => {
          const linea = t.escribir("");
          const pasos = 20;
          let i = 0;
          const pintar = () => {
            const n = Math.round(i / pasos * 24);
            linea.textContent = etiqueta + " [" + "#".repeat(n) + ".".repeat(24 - n) + "] " + Math.round(i / pasos * 100) + " %";
          };
          pintar();
          const id = setInterval(() => {
            i++;
            pintar();
            if (i >= pasos) { clearInterval(id); ok(); }
          }, ms / pasos);
        });
      },

      /* Pregunta en la propia terminal. Devuelve lo que escribe el alumno. */
      preguntar(texto, clase) {
        if (texto) t.escribir(texto, clase || "t-pregunta");
        return new Promise((ok) => {
          pregunta = (r) => { t.ocupar(true); ok(r); };
          t.ocupar(false);
          pintarPrompt();
        });
      },
      /* Menú numerado: devuelve el índice elegido (o -1 si cancela con 0 o vacío). */
      async elegir(texto, lista) {
        t.escribir(texto, "t-pregunta");
        lista.forEach((o, i) => t.escribir("  " + (i + 1) + ") " + o));
        for (;;) {
          const r = (await t.preguntar("Escribe el número (0 para cancelar):", "t-suave")).trim();
          if (r === "" || r === "0") return -1;
          const n = Number(r);
          if (Number.isInteger(n) && n >= 1 && n <= lista.length) return n - 1;
          t.escribir("Escribe un número del 1 al " + lista.length + ".", "t-aviso");
        }
      },

      registrar(nombre, def) { comandos[nombre] = def; },

      ayuda(nombre) {
        const c = comandos[nombre];
        if (!c) return false;
        t.escribir(nombre + " — " + c.resumen, "t-titulo");
        if (c.uso) t.escribir("Uso: " + c.uso, "t-uso");
        if (c.detalle) [].concat(c.detalle).forEach((l) => t.escribir(l));
        if (c.ejemplos && !t.sinAyudas) {
          t.escribir("Ejemplos:", "t-suave");
          c.ejemplos.forEach((e) => t.escribir("  " + e, "t-ejemplo"));
        }
        return true;
      },
      usoIncorrecto(nombre, motivo) {
        if (t.sinAyudas) return t.escribir(nombre + ": sintaxis incorrecta.", "t-aviso");
        if (motivo) t.escribir(motivo, "t-aviso");
        const c = comandos[nombre];
        if (c && c.uso) t.escribir("Uso: " + c.uso, "t-uso");
        if (c && c.ejemplos) t.escribir("Ejemplo: " + c.ejemplos[0], "t-ejemplo");
      },

      ocupar(v) { ocupado = v; formulario.classList.toggle("ocupado", v); entrada.disabled = v; if (!v) entrada.focus({ preventScroll: true }); },
      enfocar() { entrada.focus({ preventScroll: true }); },
      ejecutar: (linea) => ejecutar(linea)
    };

    const prompt = formulario.querySelector(".t-prompt");
    const pintarPrompt = () => { prompt.textContent = pregunta ? ">" : cfg.prompt(cwd); };

    const ejecutar = async (linea) => {
      if (pregunta) {
        const r = pregunta;
        pregunta = null;
        t.escribir([["> ", "t-prompt-eco"], [linea, ""]]);
        pintarPrompt();
        r(linea);
        return;
      }
      t.escribir([[cfg.prompt(cwd) + " ", "t-prompt-eco"], [linea, ""]]);
      const limpia = linea.trim();
      if (limpia) { historial.push(limpia); }
      posHistorial = historial.length;
      if (!limpia) return;
      const [nombre, ...args] = trocear(limpia);
      const clave = nombre.toLowerCase();
      const c = comandos[clave] || Object.values(comandos).find((x) => x.alias && x.alias.includes(clave));
      if (!c) {
        const cerca = Object.keys(comandos).filter((k) => !comandos[k].oculto)
          .map((k) => [k, distancia(clave, k)]).sort((a, b) => a[1] - b[1])[0];
        t.escribir("«" + nombre + "»: comando no encontrado.", "t-error");
        if (t.sinAyudas) return;
        if (cerca && cerca[1] <= 2) t.escribir("¿Querías decir «" + cerca[0] + "»? Escribe help " + cerca[0] + " para ver cómo se usa.", "t-suave");
        else t.escribir("Escribe help para ver los comandos disponibles.", "t-suave");
        return;
      }
      if (args.includes("--ayuda") || args.includes("--help") || (args.includes("-h") && !c.usaH)) { t.ayuda(Object.keys(comandos).find((k) => comandos[k] === c)); return; }
      t.ocupar(true);
      try {
        await c.ejecutar(args, limpia);
      } catch (e) {
        t.escribir("Error interno del simulador: " + e.message, "t-error");
        console.error(e);
      }
      t.ocupar(false);
      pintarPrompt();
      if (cfg.despues) cfg.despues(clave, args);
    };

    /* Autocompletado de comandos y rutas con Tab. */
    const completar = () => {
      const v = entrada.value;
      const partes = v.split(" ");
      const ultima = partes[partes.length - 1];
      let candidatos;
      if (partes.length === 1) candidatos = Object.keys(comandos).filter((k) => !comandos[k].oculto && k.startsWith(ultima.toLowerCase()));
      else {
        const corte = ultima.lastIndexOf("/");
        const base = corte >= 0 ? ultima.slice(0, corte + 1) : "";
        const pref = ultima.slice(corte + 1);
        const carpeta = buscar(t.raiz, normalizar(base || ".", cwd));
        const extra = (cfg.completarExtra ? cfg.completarExtra(partes[0]) : []).filter((x) => !base && x.startsWith(pref));
        candidatos = extra.concat(carpeta && carpeta.tipo === "dir"
          ? Object.entries(hijosDe(carpeta)).filter(([k]) => k.startsWith(pref)).map(([k, n]) => base + k + (n.tipo === "dir" ? "/" : ""))
          : []);
      }
      if (candidatos.length === 1) {
        partes[partes.length - 1] = candidatos[0] + (candidatos[0].endsWith("/") ? "" : " ");
        entrada.value = partes.join(" ");
      } else if (candidatos.length > 1) {
        t.escribir(candidatos.join("   "), "t-suave");
        let comun = candidatos[0];
        candidatos.forEach((c) => { while (!c.startsWith(comun)) comun = comun.slice(0, -1); });
        if (comun.length > ultima.length) { partes[partes.length - 1] = comun; entrada.value = partes.join(" "); }
      }
    };

    const moverHistorial = (d) => {
      if (!historial.length || pregunta) return;
      posHistorial = Math.max(0, Math.min(historial.length, posHistorial + d));
      entrada.value = historial[posHistorial] || "";
      requestAnimationFrame(() => entrada.setSelectionRange(entrada.value.length, entrada.value.length));
    };
    t.completar = completar;
    t.moverHistorial = moverHistorial;
    t.historial = historial;

    formulario.addEventListener("submit", (e) => {
      e.preventDefault();
      if (ocupado) return;
      const v = entrada.value;
      entrada.value = "";
      ejecutar(v);
    });
    entrada.addEventListener("keydown", (e) => {
      if (e.key === "Tab") { e.preventDefault(); completar(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); moverHistorial(-1); }
      else if (e.key === "ArrowDown") { e.preventDefault(); moverHistorial(1); }
      else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); t.limpiar(); }
    });
    /* Un clic en la terminal lleva el cursor a la línea de comandos (sin estorbar al seleccionar texto). */
    salida.addEventListener("click", () => { if (!String(window.getSelection())) t.enfocar(); });

    pintarPrompt();
    return t;
  };

  /* Comandos comunes a todos los retos: help, clear, history, pwd, cd, ls y cat.
     «grupos» ordena la ayuda general; «alLeer» deja al reto reaccionar cuando se abre un archivo. */
  const basicos = (t, { grupos, alLeer } = {}) => {
    t.registrar("help", {
      resumen: "Muestra la ayuda. Con un comando, explica cómo se usa.",
      uso: "help [comando]",
      ejemplos: ["help", "help ls"],
      alias: ["ayuda", "?"],
      ejecutar(args) {
        if (args[0]) {
          const n = args[0].toLowerCase();
          if (!t.ayuda(n)) t.escribir("No hay ningún comando llamado «" + args[0] + "».", "t-aviso");
          return;
        }
        const lista = grupos || [["Comandos", Object.keys(t.comandos)]];
        const ancho = Math.max(10, ...lista.flatMap(([, nombres]) => nombres.map((n) => n.length + 2)));
        lista.forEach(([titulo, nombres]) => {
          t.escribir(titulo, "t-titulo");
          nombres.filter((n) => t.comandos[n]).forEach((n) => t.escribir([["  " + n.padEnd(ancho), "t-cmd"], [t.comandos[n].resumen, ""]]));
        });
        t.escribir(t.sinAyudas ? "help <comando> muestra cómo se usa. Tab completa, ↑ y ↓ repiten comandos." : "Escribe help <comando> para ver ejemplos. Tab completa, ↑ y ↓ repiten comandos.", "t-suave");
      }
    });
    t.registrar("clear", { resumen: "Limpia la pantalla.", uso: "clear", alias: ["cls"], ejecutar() { t.limpiar(); } });
    t.registrar("history", {
      resumen: "Muestra los comandos que has escrito.", uso: "history",
      ejecutar() { t.historial.forEach((h, i) => t.escribir(String(i + 1).padStart(4) + "  " + h)); }
    });
    t.registrar("pwd", { resumen: "Muestra la carpeta en la que estás.", uso: "pwd", ejecutar() { t.escribir(t.cwd); } });
    t.registrar("cd", {
      resumen: "Cambia de carpeta.", uso: "cd <carpeta>", ejemplos: ["cd /mnt", "cd ..", "cd"],
      ejecutar(args) {
        const destino = t.ruta(args[0] || t.casa || "/");
        const n = Terminal.buscar(t.raiz, destino);
        if (!n) return t.escribir("cd: " + args[0] + ": no existe esa carpeta.", "t-error");
        if (n.tipo !== "dir") return t.escribir("cd: " + args[0] + ": no es una carpeta.", "t-error");
        if (n.bloqueado) return t.escribir("cd: " + args[0] + ": " + n.bloqueado, "t-error");
        t.cwd = destino;
      }
    });
    t.registrar("ls", {
      resumen: "Lista los archivos y carpetas.", uso: "ls [-l] [carpeta]", ejemplos: ["ls", "ls -l /mnt/taller", "ls /home/rescue"],
      detalle: "Con -l muestra también el tamaño de cada archivo.",
      ejecutar(args) {
        const o = opciones(args);
        const ruta = t.ruta(o.pos[0]);
        const n = Terminal.buscar(t.raiz, ruta);
        if (!n) return t.escribir("ls: " + (o.pos[0] || ruta) + ": no existe.", "t-error");
        if (n.bloqueado) return t.escribir("ls: " + (o.pos[0] || ruta) + ": " + n.bloqueado, "t-error");
        if (n.tipo !== "dir") return t.escribir(o.pos[0]);
        const hijos = Object.entries(hijosDe(n));
        const nota = typeof n.nota === "function" ? n.nota() : n.nota;
        if (!hijos.length) return t.escribir(nota || "(carpeta vacía)", "t-suave");
        if (o.marcas.has("l")) hijos.forEach(([k, h]) => t.escribir([[(h.tipo === "dir" ? "dir " : "    ") + String(h.tam || "-").padStart(9) + "  ", "t-suave"], [k + (h.tipo === "dir" ? "/" : ""), h.tipo === "dir" ? "t-dir" : h.clase || ""]]));
        else t.escribir(hijos.map(([k, h]) => [k + (h.tipo === "dir" ? "/" : "") + "   ", h.tipo === "dir" ? "t-dir" : h.clase || ""]));
        if (nota) t.escribir(nota, "t-suave");
      }
    });
    t.registrar("cat", {
      resumen: "Muestra el contenido de un archivo de texto.", uso: "cat <archivo>", ejemplos: ["cat orden_trabajo.txt", "cat /var/log/kern.log"],
      ejecutar(args) {
        if (!args[0]) return t.usoIncorrecto("cat", "Falta el archivo que quieres leer.");
        const ruta = t.ruta(args[0]);
        const n = Terminal.buscar(t.raiz, ruta);
        if (!n) return t.escribir("cat: " + args[0] + ": no existe.", "t-error");
        if (n.tipo === "dir") return t.escribir("cat: " + args[0] + ": es una carpeta." + (t.sinAyudas ? "" : " Usa ls para ver lo que contiene."), "t-error");
        if (alLeer && alLeer(ruta, n) === false) return;
        const c = typeof n.contenido === "function" ? n.contenido() : n.contenido;
        [].concat(c).forEach((l) => (Array.isArray(l) ? t.escribir(l[0], l[1]) : t.escribir(l)));
      }
    });
  };

  window.Terminal = { crear, basicos, esc, opciones, dir, archivo, normalizar, buscar };
})();
