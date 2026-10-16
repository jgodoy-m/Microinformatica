/* Minijuego «Operación: rescatar los archivos» (UF0864), sobre el motor de js/terminal.js.
   El alumno investiga el equipo con comandos y decide cómo salvar los datos. El disco del cliente
   tiene un estado interno: leer a lo bruto un disco que falla daña más archivos, y escribir en el
   disco equivocado sobrescribe lo que aún no se ha recuperado. Nada se ejecuta de verdad.
   Las misiones llevan su sesión y se abren el día de su clase; con ?profe se ven todas. */
(() => {
  "use strict";

  const app = document.getElementById("rescate");
  if (!app || !window.Terminal) return;
  const { esc, opciones, dir, archivo } = Terminal;

  const PREVIA = new URLSearchParams(location.search).has("profe");
  const abierta = (m) => {
    if (PREVIA || !m.desde) return true;
    const [y, mes, d] = m.desde.split("-").map(Number);
    return new Date() >= new Date(y, mes - 1, d);
  };
  const fecha = (m) => {
    const [y, mes, d] = m.desde.split("-").map(Number);
    return new Date(y, mes - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  };
  const fmt = (n) => n.toLocaleString("es-ES");

  const COSTE_PISTA = 5;
  const COSTE_PRIVACIDAD = 5;

  /* ---------- Misiones ----------
     grupos: los archivos del cliente, agrupados por carpeta. peso: lo que le importan al cliente.
     estado: visible (se ve al montar), borrado (Papelera vaciada) o perdido (partición RAW).
     danados: archivos en sectores dañados. */
  const MISIONES = [
    {
      id: "raw", sesion: "S16", desde: "2026-10-19", equipo: "PC-014",
      titulo: "El disco que pide formato",
      resumen: "Un disco externo sale como RAW y Windows pide formatearlo.",
      orden: [
        "ORDEN DE TRABAJO 2026-1014 · Equipo PC-014",
        "Cliente: Marta (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: al conectar su disco externo, Windows dice «Debe formatear el disco».",
        "El cliente cuenta: «Se fue la luz mientras copiaba las fotos del móvil».",
        "Tiene ahí todas las fotos de la familia y no hay ninguna otra copia.",
        "Encargo: recuperar los datos y dejarlos en el disco del taller (/mnt/taller)."
      ],
      disco: { modelo: "WD Elements 1TB", tam: "931,5G", tipo: "HDD", salud: "bueno", smart: [0, 0, 0], fs: "raw", etiqueta: "FOTOS", copia: "nunca" },
      grupos: [
        { id: "fotos", carpeta: "Fotos", n: 2318, peso: 4, estado: "perdido", muestras: ["2019_bautizo/", "2024_verano/", "movil_2026/"] },
        { id: "videos", carpeta: "Videos", n: 146, peso: 2, estado: "perdido", muestras: ["cumple_abuela.mp4", "boda_primos.mp4"] },
        { id: "docs", carpeta: "Documentos", n: 87, peso: 2, estado: "perdido", muestras: ["libro_familia.pdf", "seguro_hogar.pdf"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "Recuperar la partición sin formatear", recuperar: "Copiar los datos al disco del taller", verificar: "Verificar lo recuperado", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Antes de tocar nada, mira si el disco está sano: disk smart sdb.",
        proteger: "El disco está sano y la partición sale RAW: es un caso para testdisk sdb. No formatees.",
        recuperar: "Con la partición recuperada, monta en solo lectura (mount -r sdb1 /mnt/cliente) y copia con backup /mnt/cliente /mnt/taller/marta.",
        verificar: "Comprueba lo recuperado sin abrir las fotos una a una: verify /mnt/taller/marta.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      preguntas: [
        ["¿Qué le pasaba al disco?", ["El sistema de archivos se dañó con el apagón; el disco está sano", "El disco tiene sectores dañados y se está muriendo", "Un virus ha cifrado el disco"]],
        ["¿Por qué no se formatea aunque Windows lo pida?", ["Formatear crea un índice nuevo y se pierden los nombres y las carpetas", "Porque formatear tarda mucho", "Porque Windows no deja formatear discos externos"]]
      ],
      solucion: "La partición se dañó con el apagón. Con el disco sano, TestDisk la recupera; después se copian los datos a otro disco y se verifican."
    },
    {
      id: "falla", sesion: "S16", desde: "2026-10-19", equipo: "PC-016",
      titulo: "El disco que falla",
      resumen: "Errores de lectura, 147 archivos afectados y la última copia es de hace 12 días.",
      orden: [
        "ORDEN DE TRABAJO 2026-1016 · Equipo PC-016",
        "Cliente: Luis (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: el portátil va lentísimo y a veces se congela al abrir carpetas.",
        "El disco se ha sacado del portátil y está conectado a este equipo de rescate.",
        "Su última copia de seguridad es de hace 12 días. Lo más urgente: el TFG de la carpeta Documentos.",
        "Encargo: salvar todo lo posible en el disco del taller (/mnt/taller)."
      ],
      disco: { modelo: "DISK-01 Seagate 500GB", tam: "465,8G", tipo: "HDD", salud: "precaucion", smart: [212, 147, 23], fs: "ntfs", etiqueta: "DATOS", copia: "hace 12 días" },
      grupos: [
        { id: "docs", carpeta: "Documentos", n: 320, peso: 4, estado: "visible", danados: 40, muestras: ["TFG_final.docx", "facturas_2026.xlsx", "contratos/"] },
        { id: "fotos", carpeta: "Fotos", n: 1400, peso: 3, estado: "visible", danados: 95, muestras: ["2025_navidad/", "2026_viaje_lisboa/"] },
        { id: "escritorio", carpeta: "Escritorio", n: 27, peso: 2, estado: "visible", danados: 12, muestras: ["presupuesto_obra.pdf", "notas.txt"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "Clonar el disco antes de tocarlo", recuperar: "Recuperar los archivos a otro disco", verificar: "Verificar lo recuperado", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Mira el S.M.A.R.T. del disco del cliente: disk smart sdb.",
        proteger: "Con sectores pendientes, cada lectura lo empeora. Clónalo primero: ddrescue -n sdb /mnt/taller/luis.img rescate.map",
        recuperar: "Recupera desde la imagen, no desde el disco: recover /mnt/taller/luis.img --destino /mnt/taller/luis",
        verificar: "Comprueba lo recuperado: verify /mnt/taller/luis.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      preguntas: [
        ["¿Qué tipo de problema tenía el disco?", ["Sectores dañados: el disco empieza a fallar", "Un borrado lógico: los archivos estaban en la Papelera", "Un fallo físico grave: hay que llevarlo a un laboratorio"]],
        ["¿Por qué se clona antes de recuperar?", ["Porque cada lectura puede dañar más un disco que falla", "Porque así la recuperación va más rápida", "Porque CHKDSK no funciona sin una imagen"]]
      ],
      solucion: "El S.M.A.R.T. avisaba de sectores pendientes. Se clona con ddrescue sin insistir en lo dañado, se reintenta después y se recupera desde la imagen a otro disco."
    },
    {
      id: "borrado", sesion: "S21", desde: "2026-10-26", equipo: "PC-021",
      titulo: "Las fotos borradas",
      resumen: "El cliente vació la Papelera ayer. El disco funciona bien.",
      orden: [
        "ORDEN DE TRABAJO 2026-1021 · Equipo PC-021",
        "Cliente: Carmen (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: ayer vació la Papelera y borró sin querer las fotos de sus vacaciones y la declaración de la renta.",
        "Desde entonces no ha usado el ordenador. El disco duro (HDD) se ha conectado a este equipo de rescate.",
        "Encargo: recuperar lo borrado y dejarlo en el disco del taller (/mnt/taller)."
      ],
      disco: { modelo: "Toshiba DT01 1TB", tam: "931,5G", tipo: "HDD", salud: "bueno", smart: [0, 0, 0], fs: "ntfs", etiqueta: "Windows", copia: "nunca" },
      grupos: [
        { id: "vacaciones", carpeta: "Fotos/Vacaciones_2026", n: 86, peso: 4, estado: "borrado", muestras: ["IMG_2041.jpg", "IMG_2042.jpg"] },
        { id: "renta", carpeta: "Documentos/Renta", n: 3, peso: 3, estado: "borrado", muestras: ["declaracion_2025.pdf"] },
        { id: "resto", carpeta: "Documentos/Trabajo", n: 210, peso: 0, estado: "visible", muestras: ["informe_mensual.docx", "clientes.xlsx"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "No escribir en el disco del cliente", recuperar: "Recuperar lo borrado a otro disco", verificar: "Verificar lo recuperado", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Mira si el disco está sano: disk smart sdb.",
        proteger: "Lo borrado sigue ahí hasta que algo escribe encima. Si montas, hazlo en solo lectura: mount -r sdb1 /mnt/cliente.",
        recuperar: "Recupera lo borrado y guárdalo en otro disco: recover sdb1 --destino /mnt/taller/carmen",
        verificar: "Comprueba lo recuperado sin abrir las fotos una a una: verify /mnt/taller/carmen.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      preguntas: [
        ["¿Por qué no se guarda lo recuperado en el mismo disco?", ["Porque podría escribir encima de archivos borrados que aún no se han recuperado", "Porque el disco del cliente no tiene espacio", "Porque el disco del cliente es más lento"]],
        ["Para comprobar las fotos recuperadas, ¿qué haces?", ["Abro dos o tres para ver que están bien, sin repasar el álbum", "Las abro todas una a una para asegurarme", "Me guardo una copia por si el disco del taller falla"]]
      ],
      solucion: "Un borrado lógico en un disco sano: se recupera sin escribir en él (Recuva o PhotoRec) y se guarda en otro disco. Se comprueban unos pocos archivos, no todos."
    }
  ];

  const OBJETIVOS = ["identificar", "salud", "proteger", "recuperar", "verificar", "informe"];

  /* ---------- Estado de la partida ---------- */
  let M = null, E = null, t = null;

  const nuevoEstado = (m) => ({
    disco: Object.assign({ desgaste: 0, montado: null, formateado: false, tablaEscrita: false }, m.disco),
    grupos: m.grupos.map((g) => Object.assign({ danados: 0, sobrescritos: 0 }, g, { muestras: g.muestras.slice() })),
    imagen: null,
    recuperados: {},
    hechos: new Set(),
    riesgos: [],
    bien: [],
    pistas: 0,
    privacidad: 0,
    accionAntes: { identificar: null, salud: null },
    escribioCliente: false,
    lecturasOriginal: 0,
    respuestas: [],
    terminado: false
  });

  const objetivosRecuperar = () => E.grupos.filter((g) => g.peso > 0);
  const totalDanados = () => E.grupos.reduce((s, g) => s + g.danados, 0);
  const falla = () => E.disco.salud === "precaucion";

  const riesgo = (clave, puntos, texto) => {
    if (E.riesgos.some((r) => r.clave === clave)) return;
    E.riesgos.push({ clave, puntos, texto });
  };
  const hecho = (k) => E.hechos.add(k);
  /* Antes de la primera acción que toca datos, se apunta si el alumno ya había investigado. */
  const accion = () => {
    if (E.accionAntes.identificar === null) {
      E.accionAntes.identificar = E.hechos.has("identificar");
      E.accionAntes.salud = E.hechos.has("salud");
    }
  };

  /* Leer a lo bruto un disco que falla pasa factura: más sectores dañados y más archivos ilegibles. */
  const estresar = (intensidad, motivo) => {
    if (!falla()) return 0;
    E.disco.desgaste += intensidad;
    E.lecturasOriginal++;
    let nuevos = 0;
    E.grupos.forEach((g) => {
      const sanos = g.n - g.danados - g.sobrescritos;
      const k = Math.min(sanos, Math.round(g.n * 0.012 * intensidad) + intensidad);
      g.danados += k;
      nuevos += k;
    });
    E.disco.smart[1] += nuevos;
    if (motivo) t.escribir("Aviso: el disco ha dado " + fmt(nuevos) + " errores de lectura nuevos durante " + motivo + ".", "t-error");
    return nuevos;
  };

  /* Escribir en el disco del cliente puede caer encima de lo borrado o perdido. */
  const escribirEnCliente = (porcentaje, motivo) => {
    E.escribioCliente = true;
    let perdidos = 0;
    E.grupos.filter((g) => g.estado !== "visible").forEach((g) => {
      const quedan = g.n - g.danados - g.sobrescritos;
      const k = Math.min(quedan, Math.max(1, Math.round(g.n * porcentaje)));
      g.sobrescritos += k;
      perdidos += k;
    });
    if (perdidos) t.escribir("Se ha escrito en el disco del cliente (" + motivo + "): " + fmt(perdidos) + " archivos que aún no estaban recuperados se han sobrescrito.", "t-error");
    return perdidos;
  };

  /* ---------- Discos y rutas ---------- */
  const DISCOS = () => ({
    sda: { nombre: "sda", modelo: "SystemRescue USB", tam: "14,9G", tipo: "USB", rol: "Sistema en vivo (no guardes nada aquí)" },
    sdb: { nombre: "sdb", modelo: E.disco.modelo, tam: E.disco.tam, tipo: E.disco.tipo, rol: "Disco del cliente" },
    sdc: { nombre: "sdc", modelo: "Disco del taller 2TB", tam: "1,8T", tipo: "HDD", rol: "Destino de las recuperaciones" }
  });

  /* Acepta sdb, /dev/sdb, sdb1, /dev/sdb1 y el nombre del modelo. */
  const resolverDisco = (txt) => {
    if (!txt) return null;
    const s = txt.replace(/^\/dev\//, "").toLowerCase();
    const m = s.match(/^(sd[abc])(1?)$/);
    if (m) return { disco: m[1], part: m[2] === "1" };
    if (s === "disk-01" && E.disco.modelo.startsWith("DISK-01")) return { disco: "sdb", part: false };
    return null;
  };
  /* ¿En qué disco cae una ruta? */
  const discoDeRuta = (ruta) => {
    const r = t.ruta(ruta);
    if (r.startsWith("/mnt/taller")) return "sdc";
    if (r.startsWith("/mnt/cliente") || r.startsWith("/dev/sdb")) return "sdb";
    return "sda";
  };
  const esImagen = (ruta) => E.imagen && t.ruta(ruta) === E.imagen.ruta;

  /* ---------- Sistema de archivos ficticio ---------- */
  const archivoCliente = (g, nombre) => archivo(() => [], { cliente: g.id, nombreArchivo: nombre, clase: "t-cliente" });

  const carpetaCliente = () => {
    const hijos = {};
    const m = E.disco.montado;
    if (!m || E.disco.fs !== "ntfs") return {};
    E.grupos.filter((g) => g.estado === "visible").forEach((g) => {
      const partes = g.carpeta.split("/");
      let nodo = hijos;
      partes.forEach((p, i) => {
        if (!nodo[p]) nodo[p] = dir({});
        if (i === partes.length - 1) {
          g.muestras.forEach((mu) => {
            const n = mu.endsWith("/") ? dir({}) : archivoCliente(g, mu);
            if (n.tipo === "dir") { n.nota = "(fotos del cliente: no hace falta abrirlas)"; n.cliente = g.id; }
            nodo[p].hijos[mu.replace(/\/$/, "")] = n;
          });
          const resto = g.n - g.muestras.length;
          nodo[p].nota = "… y " + fmt(resto) + " archivos más" + (g.danados ? " (" + fmt(g.danados) + " ilegibles por sectores dañados)" : "") + ".";
        }
        nodo = nodo[p].hijos;
      });
    });
    hijos["$Recycle.Bin"] = dir({});
    return hijos;
  };

  const carpetaTaller = () => {
    const hijos = {};
    if (E.imagen) {
      hijos[E.imagen.ruta.split("/").pop()] = archivo(["(imagen binaria del disco del cliente: se usa como origen de recover)"], { tam: E.disco.tam, clase: "t-imagen" });
      if (E.imagen.mapa) hijos[E.imagen.mapa] = archivo(() => ["# Mapa de ddrescue: zonas copiadas (+), pendientes (*) y dañadas (-)", "Pasadas: " + E.imagen.pasadas, "Sectores sin leer: " + fmt(E.imagen.sinLeer)], { tam: "4K" });
    }
    Object.entries(E.recuperados).forEach(([ruta, lista]) => {
      if (!ruta.startsWith("/mnt/taller/")) return;
      const nombre = ruta.slice("/mnt/taller/".length).split("/")[0];
      const d = dir({});
      lista.forEach((r) => {
        const g = E.grupos.find((x) => x.id === r.grupo);
        if (r.nombres) {
          const sub = dir({});
          g.muestras.forEach((mu) => { sub.hijos[mu.replace(/\/$/, "")] = mu.endsWith("/") ? Object.assign(dir({}), { nota: "(fotos recuperadas)", cliente: g.id }) : archivoCliente(g, mu); });
          sub.nota = fmt(r.ok + r.parcial) + " archivos recuperados" + (r.parcial ? " (" + fmt(r.parcial) + " incompletos)" : "") + ".";
          d.hijos[g.carpeta.replace(/\//g, "_")] = sub;
        } else {
          const sub = dir({});
          sub.nota = "recup_dir: " + fmt(r.ok + r.parcial) + " archivos sin nombre (f0001234.jpg…), de " + g.carpeta + ".";
          d.hijos["recup_" + g.id] = sub;
        }
      });
      hijos[nombre] = d;
    });
    return hijos;
  };

  const kernLog = () => {
    const l = ["[    2.104] sd 0:0:0:0: [sda] SystemRescue arrancado desde USB", "[    3.871] sd 1:0:0:0: [sdb] " + E.disco.tam + " · " + E.disco.modelo, "[    3.902] sd 2:0:0:0: [sdc] 1,8T · Disco del taller 2TB"];
    if (falla()) {
      l.push(["[  112.330] ata2.00: failed command: READ FPDMA QUEUED", "t-error"]);
      l.push(["[  112.331] blk_update_request: I/O error, dev sdb, sector 48211904", "t-error"]);
      l.push(["[  118.902] Buffer I/O error on dev sdb1, logical block 6026488", "t-error"]);
      if (E.lecturasOriginal) l.push(["[  " + (300 + E.lecturasOriginal * 41) + ".117] blk_update_request: I/O error, dev sdb (" + fmt(E.disco.desgaste * 37) + " errores más)", "t-error"]);
    }
    if (E.disco.fs === "raw") l.push(["[    4.010] ntfs3: sdb1: el sector de arranque del volumen no es válido", "t-aviso"]);
    return l;
  };

  const montarFS = () => {
    t.raiz = dir({
      home: dir({ rescue: dir({ "orden_trabajo.txt": archivo(() => M.orden), "LEEME.txt": archivo(() => [
        "Equipo de rescate con SystemRescue (Linux en vivo). Terminal simulada: nada de esto se ejecuta en tu ordenador.",
        "Discos: lsblk o disk list. Salud: disk smart <disco>. Ayuda: help <comando>.",
        "Recuerda: lo recuperado siempre a otro disco. Si el disco falla, primero se clona."
      ]) }) }),
      var: dir({ log: dir({ "kern.log": archivo(kernLog) }) }),
      dev: dir({ sda: archivo(["(dispositivo de bloques)"]), sdb: archivo(["(dispositivo de bloques)"]), sdb1: archivo(["(dispositivo de bloques)"]), sdc: archivo(["(dispositivo de bloques)"]), sdc1: archivo(["(dispositivo de bloques)"]) }),
      mnt: dir({
        cliente: Object.assign(dir(carpetaCliente), { nota: () => (E.disco.montado ? "" : "(no hay nada montado aquí: usa mount -r sdb1 /mnt/cliente)") }),
        taller: Object.assign(dir(carpetaTaller), { nota: "" })
      })
    });
    t.casa = "/home/rescue";
    t.cwd = "/home/rescue";
  };

  /* Abrir archivos del cliente para «curiosear» resta: los datos se tocan, pero no se miran. */
  const alLeer = (ruta, n) => {
    if (!n.cliente) return true;
    E.privacidad++;
    t.escribir("(" + n.nombreArchivo + " es un archivo personal del cliente, no un texto del sistema.)", "t-aviso");
    t.escribir("Para comprobar que lo recuperado está bien no hace falta abrirlo: usa verify <carpeta>. Los datos del cliente se tocan, pero no se miran.", "t-suave");
    return false;
  };

  /* ---------- Comandos del reto ---------- */
  const registrarComandos = () => {
    Terminal.basicos(t, {
      grupos: [
        ["Investigar", ["lsblk", "disk", "ls", "cd", "cat", "scan"]],
        ["Rescatar", ["mount", "umount", "clone", "ddrescue", "recover", "backup", "testdisk"]],
        ["Reparar (¡cuidado!)", ["chkdsk", "format"]],
        ["Terminar", ["verify", "informe"]],
        ["Ayuda", ["help", "pista", "clear", "history", "pwd"]]
      ],
      alLeer
    });

    t.registrar("lsblk", {
      resumen: "Lista los discos y sus particiones.",
      uso: "lsblk",
      detalle: "Sirve para identificar cada disco por su tamaño y modelo antes de tocar nada.",
      ejecutar() {
        hecho("identificar");
        const d = DISCOS();
        t.tabla([
          ["NOMBRE", "TAMAÑO", "TIPO", "MODELO", "MONTADO EN"],
          ["sda", d.sda.tam, "disco", d.sda.modelo, ""],
          ["└─sda1", d.sda.tam, "part", "", "/ (sistema en vivo)"],
          ["sdb", d.sdb.tam, "disco", d.sdb.modelo, ""],
          ["└─sdb1", d.sdb.tam, "part", E.disco.fs === "raw" ? "(RAW)" : "NTFS " + E.disco.etiqueta, E.disco.montado ? E.disco.montado.dir + (E.disco.montado.ro ? " (solo lectura)" : "") : ""],
          ["sdc", d.sdc.tam, "disco", d.sdc.modelo, ""],
          ["└─sdc1", d.sdc.tam, "part", "ext4 TALLER", "/mnt/taller"]
        ]);
        t.escribir("sdb es el disco del cliente; sdc, el disco del taller donde se guarda lo recuperado.", "t-suave");
      }
    });

    t.registrar("disk", {
      resumen: "Consulta la información del almacenamiento.",
      uso: "disk list | disk status <disco> | disk smart <disco>",
      detalle: ["list: los discos conectados. status: el estado general. smart: los atributos S.M.A.R.T.", "Atributos clave: 05 reasignados, C5 pendientes, C6 incorregibles. Si suben, el disco está fallando."],
      ejemplos: ["disk list", "disk status sdb", "disk smart sdb"],
      ejecutar(args) {
        const sub = (args[0] || "").toLowerCase();
        if (sub === "list") return t.ejecutarInterno("lsblk");
        if (sub !== "status" && sub !== "smart") return t.usoIncorrecto("disk", sub ? "No conozco la opción «" + args[0] + "»." : "Falta qué quieres consultar.");
        const r = resolverDisco(args[1] || "sdb");
        if (!r) return t.escribir("disk: no encuentro el disco «" + args[1] + "». Mira los nombres con lsblk.", "t-error");
        if (r.disco !== "sdb") {
          const d = DISCOS()[r.disco];
          t.lineas(["Disco: " + d.modelo + " (" + d.tam + ")", "Función: " + d.rol, "Estado S.M.A.R.T.: Bueno"]);
          return;
        }
        hecho("salud");
        const s = E.disco.smart;
        const estado = falla() ? "Precaución" : "Bueno";
        if (sub === "status") {
          t.escribir("Disco: " + E.disco.modelo + " (" + E.disco.tam + ", " + E.disco.tipo + ")");
          t.escribir("Estado: " + (falla() ? "errores de lectura detectados" : "sin errores") , falla() ? "t-error" : "t-ok");
          t.escribir("Volumen sdb1: " + (E.disco.fs === "raw" ? "RAW (sistema de archivos no reconocido)" : "NTFS «" + E.disco.etiqueta + "»"), E.disco.fs === "raw" ? "t-aviso" : "");
          if (falla()) t.escribir("Archivos afectados: " + fmt(totalDanados()), "t-aviso");
          t.escribir("Última copia de seguridad: " + E.disco.copia);
          t.escribir("S.M.A.R.T.: " + estado + ". Detalles con disk smart sdb.", "t-suave");
          return;
        }
        t.tabla([
          ["ID", "ATRIBUTO", "VALOR"],
          ["05", "Sectores reasignados", fmt(s[0])],
          ["C5", "Sectores pendientes", fmt(s[1])],
          ["C6", "Sectores incorregibles", fmt(s[2])],
          ["09", "Horas encendido", falla() ? "31.904" : "6.120"]
        ]);
        t.escribir("Estado de salud: " + estado, falla() ? "t-error" : "t-ok");
        if (falla()) t.escribir("Hay sectores que no se leen. Cada lectura intensa puede empeorarlo: primero se salvan los datos (S16, S21).", "t-aviso");
        else t.escribir("El disco está sano: el problema, si lo hay, es lógico.", "t-suave");
      }
    });

    t.registrar("scan", {
      resumen: "Examina la superficie del disco leyendo todos sus sectores.",
      uso: "scan <disco>",
      detalle: "Lee el disco entero de principio a fin. En un disco sano no pasa nada; en uno que falla, lo fuerza.",
      ejemplos: ["scan sdb"],
      async ejecutar(args) {
        const r = resolverDisco(args[0]);
        if (!r) return t.usoIncorrecto("scan", args[0] ? "No encuentro el disco «" + args[0] + "»." : "Falta el disco que quieres examinar.");
        if (r.disco !== "sdb") return t.escribir("scan: " + r.disco + " no es el disco del cliente. No hace falta examinarlo.", "t-suave");
        accion();
        await t.progreso("Leyendo sectores de sdb", 1800);
        if (falla()) {
          estresar(3, "el examen de superficie");
          riesgo("scan", 6, "Examinaste la superficie de un disco con sectores pendientes: se dañaron más archivos.");
          t.escribir("Resultado: " + fmt(E.disco.smart[1]) + " sectores sin leer. No hagas más lecturas completas de este disco.", "t-error");
        } else t.escribir("Resultado: 0 sectores dañados. La superficie está bien.", "t-ok");
      }
    });

    t.registrar("mount", {
      resumen: "Monta una partición para ver sus archivos.",
      uso: "mount [-r] <partición> <carpeta>",
      detalle: ["Con -r (o --solo-lectura) se monta en solo lectura y no se escribe nada en el disco.", "Sin -r, el sistema puede escribir en el disco (registro de cambios, Papelera…)."],
      ejemplos: ["mount -r sdb1 /mnt/cliente"],
      ejecutar(args) {
        const o = opciones(args);
        const ro = o.marcas.has("r") || o.marcas.has("solo-lectura");
        const r = resolverDisco(o.pos[0]);
        if (!r || !o.pos[1]) return t.usoIncorrecto("mount", "Falta la partición o la carpeta.");
        if (r.disco !== "sdb" || !r.part) return t.escribir("mount: monta la partición del cliente, sdb1 (no el disco entero ni otro disco).", "t-error");
        if (t.ruta(o.pos[1]) !== "/mnt/cliente") return t.escribir("mount: usa la carpeta /mnt/cliente para el disco del cliente.", "t-aviso");
        if (E.disco.fs === "raw") return t.escribir("mount: sdb1: tipo de sistema de archivos desconocido (RAW). No se puede montar.", "t-error");
        if (E.disco.montado) return t.escribir("mount: sdb1 ya está montada en /mnt/cliente.", "t-aviso");
        E.disco.montado = { dir: "/mnt/cliente", ro };
        if (ro) {
          hecho("soloLectura");
          t.escribir("sdb1 montada en /mnt/cliente en solo lectura. Usa ls /mnt/cliente.", "t-ok");
        } else {
          accion();
          t.escribir("sdb1 montada en /mnt/cliente en lectura y escritura.");
          if (E.grupos.some((g) => g.estado === "borrado")) {
            escribirEnCliente(0.08, "al montar, el sistema actualizó su registro de cambios");
            riesgo("montarRW", 6, "Montaste el disco en lectura y escritura: el sistema escribió encima de archivos borrados.");
          } else if (falla()) {
            estresar(1, "el montaje");
            riesgo("montarRW", 3, "Montaste un disco que falla en lectura y escritura en vez de clonarlo.");
          }
        }
      }
    });
    t.registrar("umount", {
      resumen: "Desmonta la partición.", uso: "umount <carpeta>", ejemplos: ["umount /mnt/cliente"],
      ejecutar() {
        if (!E.disco.montado) return t.escribir("umount: no hay nada montado en /mnt/cliente.", "t-aviso");
        E.disco.montado = null;
        if (t.cwd.startsWith("/mnt/cliente")) t.cwd = "/mnt";
        t.escribir("Desmontada /mnt/cliente.");
      }
    });

    /* ddrescue: copia sector a sector sin insistir en lo dañado. clone es la versión sencilla. */
    const clonar = async (origen, destino, mapa, insistir, reintentos) => {
      const r = resolverDisco(origen);
      if (!r) return t.escribir("No encuentro el disco de origen «" + (origen || "") + "». Mira los nombres con lsblk.", "t-error");
      if (r.disco !== "sdb") return t.escribir("El origen debe ser el disco del cliente (sdb).", "t-error");
      if (!destino) return t.escribir("Falta el destino: un archivo de imagen en el disco del taller, por ejemplo /mnt/taller/cliente.img.", "t-aviso");
      const rd = resolverDisco(destino);
      if (rd) return t.escribir(rd.disco === "sdb" ? "Origen y destino son el mismo disco: eso destruiría los datos. ddrescue se niega." : "Copiar sobre el disco entero " + rd.disco + " borraría todo lo que tiene. Usa un archivo de imagen: /mnt/taller/cliente.img", "t-error");
      const dd = discoDeRuta(destino);
      if (dd === "sdb") return t.escribir("El destino está en el disco del cliente: nunca se guarda nada ahí.", "t-error");
      if (dd === "sda") return t.escribir("Ahí está el sistema en vivo (14,9 GB y en memoria): no cabe una imagen de " + E.disco.tam + ". Usa /mnt/taller.", "t-error");
      if (E.disco.fs === "raw" && !falla()) t.escribir("(Clonar un disco sano no es necesario, pero tampoco hace daño.)", "t-suave");
      accion();
      const ruta = t.ruta(destino);
      if (E.imagen && E.imagen.ruta === ruta) {
        if (!E.imagen.mapa || !mapa) t.escribir("Sin archivo de mapa, ddrescue no sabe qué copió antes y empieza de cero.", "t-aviso");
        await t.progreso("Reintentando sectores dañados (" + (reintentos || 1) + " intentos)", 1800);
        if (falla()) {
          const antes = E.imagen.sinLeer;
          E.imagen.grupos.forEach((ig) => { const k = Math.round(ig.parcial * 0.5); ig.parcial -= k; ig.ok += k; });
          E.imagen.sinLeer = E.imagen.grupos.reduce((s, g) => s + g.parcial, 0);
          E.imagen.pasadas++;
          E.disco.desgaste += 1;
          t.escribir("Recuperados " + fmt(antes - E.imagen.sinLeer) + " archivos más en la segunda pasada. Quedan " + fmt(E.imagen.sinLeer) + " sin leer.", "t-ok");
          hecho("segundaPasada");
        } else t.escribir("No había sectores pendientes: la imagen ya estaba completa.", "t-ok");
        return;
      }
      if (falla() && E.lecturasOriginal === 0) hecho("clonoAntes");
      await t.progreso("Copiando sdb → " + ruta, 2200);
      if (insistir && falla()) {
        estresar(2, "la copia (sin -n, ddrescue insiste en cada sector dañado)");
        riesgo("ddrescueSinN", 3, "Clonaste sin -n: la primera pasada insistió en los sectores dañados y forzó el disco.");
      }
      E.imagen = {
        ruta, mapa: mapa ? mapa.split("/").pop() : null, pasadas: 1,
        estado: { fs: E.disco.fs, formateado: E.disco.formateado },
        grupos: E.grupos.map((g) => ({ id: g.id, estado: g.estado, ok: g.n - g.danados - g.sobrescritos, parcial: g.danados }))
      };
      E.imagen.sinLeer = E.imagen.grupos.reduce((s, g) => s + g.parcial, 0);
      hecho("proteger_clon");
      if (falla()) {
        t.escribir("Imagen creada: " + ruta + ". Se copió todo lo legible; quedan " + fmt(E.imagen.sinLeer) + " archivos en zonas sin leer.", "t-ok");
        t.escribir(E.imagen.mapa ? "Puedes reintentar lo que falta repitiendo con -r3 y el mismo mapa." : "Sin archivo de mapa no podrás reintentar solo lo que falta.", "t-suave");
      } else t.escribir("Imagen creada: " + ruta + ". El disco no tenía errores.", "t-ok");
    };

    t.registrar("clone", {
      resumen: "Clona el disco a un archivo de imagen (como ddrescue -n).",
      uso: "clone <disco> <imagen>",
      detalle: "Copia todo lo que se lee bien sin insistir en lo dañado. Después se recupera desde la imagen, no desde el disco enfermo.",
      ejemplos: ["clone sdb /mnt/taller/cliente.img"],
      ejecutar(args) {
        const o = opciones(args);
        if (o.pos.length < 2) return t.usoIncorrecto("clone", "Faltan el disco y la imagen de destino.");
        return clonar(o.pos[0], o.pos[1], "clone.map", false, 0);
      }
    });
    t.registrar("ddrescue", {
      resumen: "Clona un disco con fallos sector a sector.",
      uso: "ddrescue [-n] [-d] [-r3] <disco> <imagen> <mapa>",
      detalle: ["1.ª pasada con -n: copia lo que se lee bien sin insistir. 2.ª pasada con -r3: reintenta 3 veces lo que falló.", "El mapa guarda lo que ya se ha copiado: así la 2.ª pasada sigue donde lo dejó la 1.ª."],
      ejemplos: ["ddrescue -n sdb /mnt/taller/cliente.img rescate.map", "ddrescue -d -r3 sdb /mnt/taller/cliente.img rescate.map"],
      ejecutar(args) {
        const o = opciones(args);
        if (o.pos.length < 2) return t.usoIncorrecto("ddrescue", "Faltan el disco de origen y la imagen de destino.");
        const segunda = E.imagen && E.imagen.ruta === t.ruta(o.pos[1]);
        return clonar(o.pos[0], o.pos[1], o.pos[2], !o.marcas.has("n") && !segunda, Number(o.valores.r || 0));
      }
    });

    /* Origen de una recuperación: la imagen, la partición o la carpeta montada. */
    const origenDe = (txt) => {
      if (!txt) return null;
      if (esImagen(txt)) return { tipo: "imagen" };
      const r = resolverDisco(txt);
      if (r && r.disco === "sdb") return { tipo: "disco" };
      if (t.ruta(txt).startsWith("/mnt/cliente")) return { tipo: "montado" };
      return null;
    };
    const destinoValido = (txt) => {
      if (!txt) { t.escribir("Falta el destino: --destino <carpeta>, en el disco del taller (/mnt/taller/...).", "t-aviso"); return null; }
      if (resolverDisco(txt)) { t.escribir("El destino es una carpeta, no un disco. Por ejemplo: --destino /mnt/taller/rescate", "t-aviso"); return null; }
      const d = discoDeRuta(txt);
      if (d === "sda") { t.escribir(t.ruta(txt) + " está en el sistema en vivo, que se borra al apagar. Guarda en /mnt/taller.", "t-error"); return null; }
      const ruta = t.ruta(txt);
      if (d === "sdc" && ruta === "/mnt/taller") { t.escribir("Usa una carpeta para este cliente dentro del disco del taller, por ejemplo /mnt/taller/rescate.", "t-aviso"); return null; }
      return { ruta, disco: d };
    };

    const guardar = (destino, grupo, ok, parcial, nombres) => {
      const lista = E.recuperados[destino] = E.recuperados[destino] || [];
      const previo = lista.find((x) => x.grupo === grupo.id);
      const nuevo = { grupo: grupo.id, ok, parcial, nombres, verificado: false };
      if (!previo) lista.push(nuevo);
      else if (ok > previo.ok || (ok === previo.ok && nombres && !previo.nombres)) Object.assign(previo, nuevo);
    };

    t.registrar("recover", {
      resumen: "Intenta recuperar archivos borrados o perdidos.",
      uso: "recover <origen> --destino <carpeta> [--firmas]",
      detalle: [
        "Origen: la partición del cliente (sdb1) o una imagen clonada. Destino: una carpeta en OTRO disco.",
        "Sin opciones trabaja como Recuva: lee el índice y conserva nombres y carpetas.",
        "Con --firmas trabaja como PhotoRec: busca archivos por su contenido aunque no quede índice, pero pierde los nombres."
      ],
      ejemplos: ["recover sdb1 --destino /mnt/taller/rescate", "recover /mnt/taller/cliente.img --destino /mnt/taller/rescate", "recover sdb1 --destino /mnt/taller/rescate --firmas"],
      async ejecutar(args) {
        const o = opciones(args, ["destino"]);
        const origen = origenDe(o.pos[0]);
        if (!origen) return t.usoIncorrecto("recover", o.pos[0] ? "«" + o.pos[0] + "» no es un origen válido: usa sdb1 o la imagen clonada." : "Falta el origen.");
        const destino = destinoValido(o.valores.destino || o.pos[1]);
        if (!destino) return;
        const firmas = o.marcas.has("firmas");
        accion();
        const fs = origen.tipo === "imagen" ? E.imagen.estado.fs : E.disco.fs;
        const formateado = origen.tipo === "imagen" ? E.imagen.estado.formateado : E.disco.formateado;
        if (fs === "raw" && !firmas) {
          await t.progreso("Leyendo el índice del volumen", 900);
          t.escribir("No hay un sistema de archivos que leer (volumen RAW): no se encuentran nombres.", "t-aviso");
          t.escribir("Opciones: recuperar la partición con testdisk, o buscar por contenido con --firmas (sin nombres).", "t-suave");
          return;
        }
        if (destino.disco === "sdb") {
          riesgo("destinoMismo", 10, "Guardaste lo recuperado en el mismo disco del cliente: se sobrescribió parte de lo que faltaba.");
        }
        if (origen.tipo !== "imagen" && falla()) {
          estresar(3, "la recuperación directa desde un disco que falla");
          riesgo("recuperarOriginal", 8, "Recuperaste directamente del disco que falla en vez de clonarlo antes.");
        }
        await t.progreso(firmas ? "Buscando archivos por su firma" : "Buscando archivos en el índice", firmas ? 2200 : 1600);
        let total = 0, totalParcial = 0;
        const lista = origen.tipo === "imagen" ? E.imagen.grupos : null;
        E.grupos.forEach((g) => {
          if (destino.disco === "sdb" && g.estado !== "visible") {
            const k = Math.round((g.n - g.danados - g.sobrescritos) * 0.4);
            g.sobrescritos += k;
          }
          let ok, parcial;
          if (lista) { const ig = lista.find((x) => x.id === g.id); ok = ig.ok; parcial = ig.parcial; }
          else { ok = g.n - g.danados - g.sobrescritos; parcial = falla() ? g.danados : 0; }
          if (formateado && !firmas) { ok = 0; parcial = 0; }
          if (formateado && firmas) { ok = Math.round(ok * 0.88); }
          if (!ok && !parcial) return;
          if (g.peso === 0 && g.estado === "visible" && !firmas) return;
          guardar(destino.ruta, g, ok, parcial, !firmas);
          total += ok; totalParcial += parcial;
        });
        if (destino.disco === "sdb") t.escribir("Cada archivo recuperado se escribió en el disco del cliente, encima de otros que aún no se habían recuperado.", "t-error");
        if (formateado && !firmas) return t.escribir("El formato creó un índice nuevo y vacío: sin --firmas no aparece nada.", "t-aviso");
        t.escribir("Recuperados " + fmt(total) + " archivos" + (totalParcial ? " y " + fmt(totalParcial) + " incompletos (estaban en sectores dañados)" : "") + " en " + destino.ruta + ".", total ? "t-ok" : "t-aviso");
        if (firmas) t.escribir("Con --firmas salen sin nombre ni carpeta (f0001234.jpg…): al cliente le costará ordenarlos.", "t-suave");
        if (destino.disco === "sdc") hecho("recuperar");
        if (M.id === "borrado" && !E.escribioCliente) hecho("proteger");
        t.escribir("Siguiente paso: comprueba lo recuperado con verify " + destino.ruta, "t-suave");
      }
    });

    t.registrar("backup", {
      resumen: "Copia los archivos que se ven en una carpeta a otro disco.",
      uso: "backup <origen> <destino>",
      detalle: "Copia archivo a archivo lo que está visible (no lo borrado). En un disco que falla lee mucho y lo fuerza: mejor clonar antes.",
      ejemplos: ["backup /mnt/cliente /mnt/taller/copia"],
      async ejecutar(args) {
        const o = opciones(args);
        if (o.pos.length < 2) return t.usoIncorrecto("backup", "Faltan el origen y el destino.");
        const origen = origenDe(o.pos[0]);
        if (!origen) return t.escribir("backup: el origen debe ser la carpeta montada /mnt/cliente.", "t-error");
        if (origen.tipo === "imagen") return t.escribir("backup copia carpetas. Para sacar archivos de una imagen usa recover.", "t-aviso");
        if (origen.tipo === "disco" || !E.disco.montado) return t.escribir("backup: monta antes la partición (mount -r sdb1 /mnt/cliente) y copia desde /mnt/cliente.", "t-aviso");
        const destino = destinoValido(o.pos[1]);
        if (!destino) return;
        if (destino.disco === "sdb") return t.escribir("backup: el destino está en el mismo disco. Una copia en el mismo disco no protege nada.", "t-error");
        accion();
        if (falla()) {
          estresar(2, "la copia archivo a archivo");
          riesgo("backupOriginal", 5, "Copiaste archivo a archivo desde el disco que falla en vez de clonarlo.");
        }
        await t.progreso("Copiando /mnt/cliente → " + destino.ruta, 1700);
        let total = 0, fallidos = 0;
        E.grupos.filter((g) => g.estado === "visible" && g.peso > 0).forEach((g) => {
          const ok = g.n - g.danados - g.sobrescritos;
          guardar(destino.ruta, g, ok, 0, true);
          total += ok; fallidos += g.danados;
        });
        t.escribir("Copiados " + fmt(total) + " archivos a " + destino.ruta + "." + (fallidos ? " " + fmt(fallidos) + " no se pudieron leer." : ""), total ? "t-ok" : "t-aviso");
        if (total) hecho("recuperar");
        t.escribir("Siguiente paso: comprueba la copia con verify " + destino.ruta, "t-suave");
      }
    });

    t.registrar("testdisk", {
      resumen: "Busca particiones perdidas y repara la tabla de particiones.",
      uso: "testdisk <disco>",
      detalle: ["Analiza el disco, busca dónde empezaban las particiones y deja ver sus archivos antes de escribir nada.", "Escribe en el disco al guardar la tabla: solo cuando estés seguro y con el disco sano."],
      ejemplos: ["testdisk sdb"],
      async ejecutar(args) {
        const r = resolverDisco(args[0]);
        if (!r) return t.usoIncorrecto("testdisk", args[0] ? "No encuentro el disco «" + args[0] + "»." : "Falta el disco.");
        if (r.disco !== "sdb") return t.escribir("testdisk: " + r.disco + " no es el disco del cliente.", "t-aviso");
        t.escribir("TestDisk 7.2 (simulado) · Disco /dev/sdb · " + E.disco.tam + " · " + E.disco.modelo, "t-titulo");
        if (falla()) {
          accion();
          estresar(2, "el análisis de TestDisk");
          riesgo("testdiskFalla", 5, "Usaste TestDisk sobre un disco que falla: primero se clona.");
          t.escribir("Errores de lectura durante el análisis. Con un disco que falla, TestDisk debe trabajar sobre una imagen.", "t-error");
          return;
        }
        let vistos = false;
        for (;;) {
          const i = await t.elegir("¿Qué quieres hacer?", ["Analizar la tabla de particiones actual", "Búsqueda rápida de particiones (Quick Search)", "Búsqueda profunda (Deeper Search)", "Salir"]);
          if (i === -1 || i === 3) { t.escribir("Saliendo de TestDisk.", "t-suave"); return; }
          if (i === 0) {
            if (E.disco.fs === "raw") t.escribir("Partición 1: NTFS · " + E.disco.tam + " · sector de arranque dañado (el sistema la ve como RAW).", "t-aviso");
            else if (E.disco.formateado) t.escribir("Partición 1: NTFS · " + E.disco.tam + " · «Nuevo vol» (vacía, recién formateada).", "t-aviso");
            else { t.escribir("Partición 1: NTFS · " + E.disco.tam + " · «" + E.disco.etiqueta + "» · correcta.", "t-ok"); t.escribir("La tabla está bien: tu problema no está en la partición.", "t-suave"); }
            continue;
          }
          await t.progreso(i === 1 ? "Buscando particiones" : "Buscando sector a sector", i === 1 ? 1200 : 2400);
          if (E.disco.formateado) {
            t.escribir("Solo aparece la partición nueva y vacía. La anterior ya no se encuentra: el formato la sustituyó.", "t-error");
            t.escribir("Queda buscar los archivos por su contenido: recover sdb1 --destino /mnt/taller/... --firmas", "t-suave");
            continue;
          }
          if (E.disco.fs !== "raw") { t.escribir("Encontrada: NTFS «" + E.disco.etiqueta + "», la misma que ya está en la tabla. No hay nada que reparar.", "t-suave"); continue; }
          t.escribir("Encontrada: P NTFS · " + E.disco.tam + " · «" + E.disco.etiqueta + "»", "t-ok");
          for (;;) {
            const j = await t.elegir("Partición encontrada. ¿Qué haces?", ["Ver sus archivos (P)", "Copiar los archivos a otro disco (C)", "Escribir la tabla y reparar el volumen (Write)", "Volver"]);
            if (j === -1 || j === 3) break;
            if (j === 0) {
              vistos = true;
              E.grupos.forEach((g) => t.escribir([["  " + g.carpeta.padEnd(12), "t-dir"], [fmt(g.n) + " archivos · " + g.muestras.join(", "), "t-suave"]]));
              t.escribir("Son las carpetas del cliente: es la partición buena.", "t-ok");
            } else if (j === 1) {
              const d = destinoValido((await t.preguntar("Carpeta de destino (en /mnt/taller):")).trim());
              if (!d) continue;
              if (d.disco === "sdb") { t.escribir("El destino está en el mismo disco: TestDisk no deja copiar ahí.", "t-error"); continue; }
              accion();
              await t.progreso("Copiando archivos", 1500);
              let total = 0;
              E.grupos.forEach((g) => { const ok = g.n - g.sobrescritos; guardar(d.ruta, g, ok, 0, true); total += ok; });
              t.escribir("Copiados " + fmt(total) + " archivos con sus nombres a " + d.ruta + ".", "t-ok");
              hecho("proteger"); hecho("recuperar");
            } else {
              const s = (await t.preguntar("Se va a escribir la tabla en /dev/sdb. ¿Confirmas? (s/n)")).trim().toLowerCase();
              if (s !== "s" && s !== "si" && s !== "sí") { t.escribir("No se ha escrito nada.", "t-suave"); continue; }
              accion();
              if (!vistos) riesgo("escribirSinVer", 4, "Escribiste la tabla con TestDisk sin comprobar antes los archivos de la partición (P).");
              await t.progreso("Escribiendo la tabla y reconstruyendo el sector de arranque", 1200);
              E.disco.fs = "ntfs";
              E.disco.tablaEscrita = true;
              E.grupos.forEach((g) => { g.estado = "visible"; });
              hecho("proteger");
              t.escribir("Tabla escrita. sdb1 vuelve a ser NTFS «" + E.disco.etiqueta + "» con todos sus archivos.", "t-ok");
              t.escribir("Ahora monta en solo lectura y copia los datos a otro disco.", "t-suave");
              return;
            }
          }
        }
      }
    });

    t.registrar("chkdsk", {
      resumen: "Comprueba y repara el sistema de archivos (Windows).",
      uso: "chkdsk <partición> [/f] [/r]",
      detalle: ["Sin opciones solo comprueba. /f corrige el sistema de archivos (escribe en el disco).", "/r además busca sectores dañados: muy lento, y fuerza un disco que se está muriendo.", "CHKDSK no es una herramienta de recuperación (S16)."],
      ejemplos: ["chkdsk sdb1", "chkdsk sdb1 /f"],
      async ejecutar(args) {
        const o = opciones(args);
        const r = resolverDisco(o.pos[0]);
        if (!r) return t.usoIncorrecto("chkdsk", "Falta la partición.");
        if (r.disco !== "sdb") return t.escribir("chkdsk: " + r.disco + " no es el disco del cliente.", "t-aviso");
        if (E.disco.fs === "raw") return t.escribir("CHKDSK no está disponible para unidades RAW.", "t-error");
        const f = o.marcas.has("/f"), rr = o.marcas.has("/r");
        accion();
        await t.progreso("Comprobando sdb1" + (rr ? " y su superficie" : ""), rr ? 2400 : 1200);
        if (rr && falla()) {
          estresar(5, "CHKDSK /r");
          riesgo("chkdskR", 12, "Ejecutaste CHKDSK /r sobre un disco que se está muriendo: horas de lecturas forzadas y más archivos perdidos.");
        } else if (falla()) {
          estresar(1, "la comprobación");
          if (f) riesgo("chkdskF", 5, "Reparaste con CHKDSK /f un disco que falla antes de salvar los datos.");
        }
        if (f || rr) {
          if (E.grupos.some((g) => g.estado === "borrado")) {
            escribirEnCliente(0.1, "CHKDSK escribió sus correcciones");
            riesgo("chkdskEscribe", 6, "CHKDSK /f escribió en el disco con archivos borrados sin recuperar.");
          }
          t.escribir("CHKDSK ha terminado. Esto repara el sistema de archivos, pero no recupera nada.", "t-suave");
        } else t.escribir(falla() ? "Se encontraron errores de lectura. No repares ahora: primero los datos." : "No se encontraron problemas en el sistema de archivos.", falla() ? "t-aviso" : "t-ok");
      }
    });

    t.registrar("format", {
      resumen: "Formatea una partición (irreversible).",
      uso: "format <partición>",
      detalle: "Crea un sistema de archivos nuevo y vacío. Los nombres y carpetas anteriores se pierden. Antes de formatear: ¿hay datos?, ¿hay copia? (S16).",
      ejemplos: ["format sdb1"],
      async ejecutar(args) {
        const r = resolverDisco(args[0]);
        if (!r) return t.usoIncorrecto("format", "Falta la partición.");
        if (r.disco === "sdc") return t.escribir("format: sdc es el disco del taller. No se formatea.", "t-error");
        if (r.disco === "sda") return t.escribir("format: sda es el sistema en vivo. No se formatea.", "t-error");
        t.escribir("ATENCIÓN: formatear sdb1 crea un índice nuevo y los archivos del cliente dejan de verse.", "t-error");
        const s = (await t.preguntar("Escribe FORMATEAR para continuar, o cualquier otra cosa para cancelar:")).trim();
        if (s !== "FORMATEAR") return t.escribir("Cancelado. No se ha tocado nada.", "t-ok");
        accion();
        await t.progreso("Formateando sdb1 (rápido)", 1000);
        if (falla()) estresar(1);
        riesgo("formatear", 15, "Formateaste el disco del cliente antes de recuperar sus datos.");
        E.disco.fs = "ntfs";
        E.disco.formateado = true;
        E.disco.etiqueta = "Nuevo vol";
        E.grupos.forEach((g) => { if (g.estado === "visible" || g.estado === "perdido") g.estado = "borrado"; g.sobrescritos += Math.round((g.n - g.danados - g.sobrescritos) * 0.05); });
        t.escribir("sdb1 formateada. Ahora parece vacía. Solo quedaría buscar por contenido (--firmas), sin nombres.", "t-aviso");
      }
    });

    t.registrar("verify", {
      resumen: "Comprueba que los archivos recuperados están íntegros.",
      uso: "verify <carpeta>",
      detalle: "Compara cabeceras y sumas de comprobación sin abrir los archivos uno a uno, como pide la protección de datos.",
      ejemplos: ["verify /mnt/taller/rescate"],
      async ejecutar(args) {
        if (!args[0]) return t.usoIncorrecto("verify", "Falta la carpeta que quieres comprobar.");
        const ruta = t.ruta(args[0]);
        const lista = E.recuperados[ruta];
        if (!lista) return t.escribir("verify: en " + ruta + " no hay nada recuperado. Mira dónde lo guardaste con ls /mnt/taller.", "t-error");
        await t.progreso("Comprobando archivos", 1200);
        let ok = 0, mal = 0;
        lista.forEach((r) => {
          r.verificado = true;
          const g = E.grupos.find((x) => x.id === r.grupo);
          t.escribir([["  " + g.carpeta.padEnd(24), "t-dir"], [fmt(r.ok) + " correctos", "t-ok"], [r.parcial ? " · " + fmt(r.parcial) + " dañados" : "", "t-error"], [r.nombres ? "" : " · sin nombres", "t-aviso"]]);
          ok += r.ok; mal += r.parcial;
        });
        t.escribir("Total: " + fmt(ok) + " archivos íntegros" + (mal ? " y " + fmt(mal) + " dañados o incompletos" : "") + ".", mal ? "t-aviso" : "t-ok");
        if (discoDeRuta(ruta) === "sdc") hecho("verificar");
      }
    });

    t.registrar("pista", {
      resumen: "Da una pista sobre el siguiente paso (resta " + COSTE_PISTA + " puntos).",
      uso: "pista",
      alias: ["hint"],
      ejecutar() {
        const siguiente = OBJETIVOS.find((k) => !objetivoHecho(k));
        if (!siguiente) return t.escribir("No te hace falta: ya está todo. Escribe informe.", "t-suave");
        E.pistas++;
        t.escribir("Pista (−" + COSTE_PISTA + "): " + M.pistas[siguiente], "t-pista");
      }
    });

    t.registrar("informe", {
      resumen: "Entrega el informe y termina la misión.",
      uso: "informe",
      alias: ["report"],
      async ejecutar() {
        if (!E.hechos.has("recuperar")) {
          const s = (await t.preguntar("Aún no has recuperado nada en el disco del taller. ¿Entregar igualmente? (s/n)")).trim().toLowerCase();
          if (s !== "s" && s !== "si" && s !== "sí") return t.escribir("Sigue con la misión.", "t-suave");
        }
        t.escribir("INFORME DE LA REPARACIÓN", "t-titulo");
        E.respuestas = [];
        for (const [q, ops] of M.preguntas) {
          const orden = ops.map((o, i) => ({ o, ok: i === 0 })).sort(() => Math.random() - 0.5);
          let i = -1;
          while (i === -1) {
            i = await t.elegir(q, orden.map((x) => x.o));
            if (i === -1) t.escribir("Para entregar el informe hay que responder.", "t-aviso");
          }
          E.respuestas.push(orden[i].ok);
          t.escribir(orden[i].ok ? "Correcto." : "No es eso.", orden[i].ok ? "t-ok" : "t-error");
        }
        hecho("informe");
        E.terminado = true;
        terminar();
      }
    });

    t.ejecutarInterno = (linea) => t.comandos[linea].ejecutar([]);
  };

  /* ---------- Objetivos, panel y puntuación ---------- */
  const objetivoHecho = (k) => {
    if (k === "proteger") {
      if (M.id === "falla") return E.hechos.has("proteger_clon");
      return E.hechos.has("proteger");
    }
    return E.hechos.has(k);
  };

  const datosRescatados = () => {
    /* Para cada grupo, lo mejor recuperado en el disco del taller. */
    let suma = 0, max = 0, verificado = true;
    objetivosRecuperar().forEach((g) => {
      max += g.peso;
      let mejor = 0;
      Object.entries(E.recuperados).forEach(([ruta, lista]) => {
        if (discoDeRuta(ruta) !== "sdc") return;
        const r = lista.find((x) => x.grupo === g.id);
        if (!r) return;
        const f = (r.ok / g.n) * (r.nombres ? 1 : 0.6) * (r.verificado ? 1 : 0.85);
        mejor = Math.max(mejor, f);
      });
      suma += g.peso * mejor;
    });
    return max ? suma / max : 0;
  };

  const archivosRescatados = () => objetivosRecuperar().reduce((s, g) => {
    let mejor = 0;
    Object.entries(E.recuperados).forEach(([ruta, lista]) => {
      if (discoDeRuta(ruta) !== "sdc") return;
      const r = lista.find((x) => x.grupo === g.id);
      if (r) mejor = Math.max(mejor, r.ok);
    });
    return s + mejor;
  }, 0);

  const evaluar = () => {
    const datos = Math.round(datosRescatados() * 40);
    const metodo = [
      ["Identificaste los discos antes de actuar", E.accionAntes.identificar !== false && E.hechos.has("identificar")],
      ["Comprobaste la salud del disco antes de actuar", E.accionAntes.salud !== false && E.hechos.has("salud")],
      [M.id === "falla" ? "Clonaste el disco antes de leerlo a fondo" : M.id === "raw" ? "Recuperaste la partición sin formatear" : "No escribiste en el disco del cliente",
        M.id === "falla" ? E.hechos.has("clonoAntes") : M.id === "raw" ? E.hechos.has("proteger") && !E.disco.formateado : !E.escribioCliente],
      ["Verificaste lo recuperado", E.hechos.has("verificar")]
    ];
    const ptsMetodo = Math.round(metodo.filter((m) => m[1]).length * 7.5);
    const ptsRiesgo = Math.max(0, 20 - E.riesgos.reduce((s, r) => s + r.puntos, 0));
    const ptsInforme = E.respuestas.filter(Boolean).length * 5;
    const descuento = E.pistas * COSTE_PISTA + Math.min(2, E.privacidad) * COSTE_PRIVACIDAD;
    const total = Math.max(0, Math.min(100, datos + ptsMetodo + ptsRiesgo + ptsInforme - descuento));
    return { datos, metodo, ptsMetodo, ptsRiesgo, ptsInforme, descuento, total };
  };

  const pintarPanel = () => {
    const ul = app.querySelector("[data-objetivos]");
    if (!ul) return;
    ul.innerHTML = OBJETIVOS.map((k) => '<li class="' + (objetivoHecho(k) ? "hecho" : "") + '"><span aria-hidden="true">' + (objetivoHecho(k) ? "✓" : "") + "</span>" + esc(M.objetivos[k]) + (objetivoHecho(k) ? '<span class="rt-oculto"> (hecho)</span>' : "") + "</li>").join("");
    const danados = totalDanados();
    const total = objetivosRecuperar().reduce((s, g) => s + g.n, 0);
    const rescatados = archivosRescatados();
    app.querySelector("[data-estado]").innerHTML =
      "<div><span>Salud</span><b class=\"" + (falla() ? "mal" : "bien") + "\">" + (falla() ? "Precaución" : "Bueno") + "</b></div>" +
      "<div><span>Volumen</span><b class=\"" + (E.disco.fs === "raw" || E.disco.formateado ? "mal" : "") + "\">" + (E.disco.fs === "raw" ? "RAW" : E.disco.formateado ? "Formateado" : "NTFS") + "</b></div>" +
      (falla() ? "<div><span>Archivos ilegibles</span><b class=\"mal\">" + fmt(danados) + "</b></div>" : "") +
      "<div><span>Rescatados</span><b>" + fmt(rescatados) + " / " + fmt(total) + "</b></div>";
    const pct = total ? Math.round(rescatados / total * 100) : 0;
    app.querySelector("[data-barra]").style.width = pct + "%";
    app.querySelector("[data-barra]").parentElement.setAttribute("aria-valuenow", pct);
    const riesgoActivo = !E.hechos.has("verificar") && (falla() ? !E.imagen : true);
    const r = app.querySelector("[data-riesgo]");
    r.textContent = E.riesgos.length ? "Riesgos asumidos: " + E.riesgos.length : riesgoActivo ? "Riesgo activo" : "Datos a salvo";
    r.className = "rt-riesgo " + (E.riesgos.length ? "alto" : riesgoActivo ? "activo" : "ok");
  };

  /* ---------- Pantallas ---------- */
  const ICONO_ESCUDO = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="M9 12h6M12 9v6"/></svg>';
  const ICONO_CERRAR = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const ICONO_DISCO = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="11" r="4"/><circle cx="12" cy="11" r="1"/><path d="M7 17h2"/></svg>';

  const portada = () => {
    document.title = "Operación: rescatar los archivos · UF0864 | Microinformática";
    app.innerHTML =
      '<section class="rt-panel rt-portada">' +
      '<a class="rt-cerrar" href="software.html" aria-label="Salir del juego">' + ICONO_CERRAR + "</a>" +
      '<p class="rt-antetitulo"><b>UF0864</b> · Minijuego 2/4</p>' +
      "<h1>" + ICONO_ESCUDO + "<span>Operación:<br>rescatar los archivos</span></h1>" +
      '<p class="rt-lema">Investiga con comandos. <span>Cada decisión cuenta.</span></p>' +
      "<p>Te sientas ante la terminal de recuperación del taller. Tienes que averiguar qué le pasa al disco del cliente y salvar sus datos sin empeorarlo. Leer a lo bruto un disco que falla, o escribir en el disco equivocado, destruye archivos para siempre.</p>" +
      '<div class="rt-terminal-demo" aria-hidden="true"><span>rescue@pc-016:~$</span> help<br><em>Comandos disponibles: lsblk, disk, scan, recover, backup…</em><br><span>rescue@pc-016:~$</span> disk status sdb<br><em>Estado: errores de lectura detectados</em></div>' +
      '<p class="rt-aviso-sim">Es una terminal simulada: no ejecuta nada en tu ordenador ni puede ver tus archivos.</p>' +
      '<h2 class="rt-h2">Elige una misión</h2>' +
      '<div class="rt-misiones">' + MISIONES.map((m, i) => {
        const ok = abierta(m);
        return '<button type="button" class="rt-mision" data-mision="' + i + '"' + (ok ? "" : " disabled") + ">" +
          ICONO_DISCO + "<span><small>" + esc(m.sesion) + " · Equipo " + esc(m.equipo) + "</small><b>" + esc(m.titulo) + "</b><em>" + esc(m.resumen) + "</em>" +
          (ok ? "" : '<i class="rt-candado">Se abre el ' + fecha(m) + "</i>") + "</span></button>";
      }).join("") + "</div>" +
      (PREVIA ? '<p class="rt-nota">Vista del profesor: todas las misiones están abiertas.</p>' : "") +
      '<p class="rt-nota">Puntuación sobre 100: datos rescatados (40), método (30), riesgos evitados (20) e informe (10). Cada pista resta ' + COSTE_PISTA + ".</p>" +
      "</section>";
    app.querySelectorAll("[data-mision]").forEach((b) => b.addEventListener("click", () => empezar(MISIONES[Number(b.dataset.mision)])));
    const primero = app.querySelector("[data-mision]:not([disabled])");
    (primero || app.querySelector(".rt-cerrar")).focus({ preventScroll: true });
  };

  const empezar = (m) => {
    M = m;
    E = nuevoEstado(m);
    app.innerHTML =
      '<section class="rt-panel rt-juego">' +
      '<header class="rt-barra">' +
      '<div class="rt-titulo">' + ICONO_ESCUDO + "<div><h1>Operación: rescatar los archivos</h1><p>Terminal de recuperación · Equipo " + esc(m.equipo) + " · " + esc(m.titulo) + "</p></div></div>" +
      '<span class="rt-riesgo activo" data-riesgo role="status">Riesgo activo</span>' +
      '<a class="rt-cerrar rt-cerrar-barra" href="rescate.html' + (PREVIA ? "?profe" : "") + '" aria-label="Salir de la misión">' + ICONO_CERRAR + "</a>" +
      "</header>" +
      '<div class="rt-cuerpo">' +
      '<div class="rt-ventana">' +
      '<div class="rt-ventana-barra"><i></i><i></i><i></i><span>rescue@' + esc(m.equipo.toLowerCase()) + " — SystemRescue</span></div>" +
      '<div class="rt-salida" data-salida role="log" aria-live="polite" aria-label="Salida de la terminal"></div>' +
      '<form class="rt-entrada" data-formulario autocomplete="off"><label class="t-prompt" for="rt-comando"></label>' +
      '<input id="rt-comando" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send" aria-label="Escribe un comando"></form>' +
      '<div class="rt-teclas"><button type="button" data-tecla="tab">Tab</button><button type="button" data-tecla="arriba" aria-label="Comando anterior">↑</button><button type="button" data-tecla="help">help</button><button type="button" data-tecla="pista">pista</button></div>' +
      "</div>" +
      '<aside class="rt-lateral">' +
      '<section class="rt-caja"><h2>Orden de trabajo</h2><p>' + m.orden.slice(2, 5).map(esc).join("<br>") + '</p><p class="rt-nota">Léela entera con <code>cat orden_trabajo.txt</code>.</p></section>' +
      '<section class="rt-caja"><h2>Objetivos</h2><ul class="rt-objetivos" data-objetivos></ul></section>' +
      '<section class="rt-caja"><h2>Estado del disco</h2><div class="rt-estado" data-estado></div><div class="rt-progreso" role="progressbar" aria-label="Archivos rescatados" aria-valuemin="0" aria-valuemax="100"><span data-barra></span></div></section>' +
      "</aside></div></section>";

    t = Terminal.crear({
      salida: app.querySelector("[data-salida]"),
      entrada: app.querySelector("#rt-comando"),
      formulario: app.querySelector("[data-formulario]"),
      prompt: (cwd) => "rescue@" + m.equipo.toLowerCase() + ":" + (cwd === "/home/rescue" ? "~" : cwd.replace(/^\/home\/rescue/, "~")) + "$",
      completarExtra: (cmd) => (["disk"].includes(cmd) ? ["list", "status", "smart", "sdb"] : ["sdb", "sdb1"]),
      despues: () => { if (!E.terminado) pintarPanel(); }
    });
    montarFS();
    registrarComandos();
    t.cwd = "/home/rescue";
    t.escribir("SystemRescue (simulado) · Terminal de recuperación del taller", "t-titulo");
    t.escribir("Nada de lo que escribas se ejecuta en tu ordenador.", "t-suave");
    t.escribir([["Escribe ", ""], ["help", "t-cmd"], [" para ver los comandos, o ", ""], ["cat orden_trabajo.txt", "t-cmd"], [" para leer el encargo.", ""]]);
    t.escribir("");

    app.querySelectorAll("[data-tecla]").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.tecla;
      if (k === "tab") t.completar();
      else if (k === "arriba") t.moverHistorial(-1);
      else if (!app.querySelector("[data-formulario]").classList.contains("ocupado")) t.ejecutar(k);
      t.enfocar();
    }));
    pintarPanel();
    t.enfocar();
  };

  const terminar = () => {
    const ev = evaluar();
    if (window.UF0864) window.UF0864.practicaHecha("rescate-archivos", Math.round(ev.total / 10), 10);
    const nombre = window.UF0864 && window.UF0864.nombre();
    const capa = document.createElement("div");
    capa.className = "rt-capa";
    capa.innerHTML =
      '<section class="rt-panel rt-final" role="dialog" aria-modal="true" aria-labelledby="rt-final-titulo">' +
      '<p class="rt-antetitulo"><b>Misión</b> · ' + esc(M.titulo) + "</p>" +
      '<h2 id="rt-final-titulo">' + (ev.total >= 70 ? "¡Datos rescatados" : ev.total >= 40 ? "Rescate a medias" : "Rescate fallido") + (nombre ? ", " + esc(nombre) : "") + "!</h2>" +
      '<p class="rt-total"><b>' + ev.total + "</b>/100</p>" +
      '<ul class="rt-desglose">' +
      "<li><span>Datos rescatados</span><b>" + ev.datos + "/40</b></li>" +
      "<li><span>Método</span><b>" + ev.ptsMetodo + "/30</b></li>" +
      "<li><span>Riesgos evitados</span><b>" + ev.ptsRiesgo + "/20</b></li>" +
      "<li><span>Informe</span><b>" + ev.ptsInforme + "/10</b></li>" +
      (ev.descuento ? "<li><span>Pistas y privacidad</span><b>−" + ev.descuento + "</b></li>" : "") +
      "</ul>" +
      '<h3>Método</h3><ul class="rt-lista">' + ev.metodo.map(([txt, ok]) => '<li class="' + (ok ? "ok" : "mal") + '">' + (ok ? "✓ " : "✗ ") + esc(txt) + "</li>").join("") + "</ul>" +
      (E.riesgos.length ? '<h3>Riesgos asumidos</h3><ul class="rt-lista">' + E.riesgos.map((r) => '<li class="mal">−' + r.puntos + " · " + esc(r.texto) + "</li>").join("") + "</ul>" : '<p class="rt-bien">No asumiste ningún riesgo innecesario.</p>') +
      (E.privacidad ? '<p class="rt-aviso">Abriste ' + E.privacidad + (E.privacidad === 1 ? " archivo personal" : " archivos personales") + " del cliente. Para comprobar una recuperación basta con verify.</p>" : "") +
      '<h3>Así se resolvía</h3><p>' + esc(M.solucion) + "</p>" +
      '<div class="rt-acciones"><a class="rt-boton" href="software.html">Volver al mapa</a><button type="button" class="rt-boton rt-secundario" data-otra>Otra misión</button></div>' +
      "</section>";
    document.body.appendChild(capa);
    capa.querySelector("[data-otra]").addEventListener("click", () => { capa.remove(); portada(); });
    capa.querySelector("a.rt-boton").focus();
  };

  portada();
})();
