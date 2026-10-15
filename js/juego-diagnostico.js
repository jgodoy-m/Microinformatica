/* Minijuego «Diagnóstico contrarreloj» (UF0864).
   Cada caso tiene un síntoma, pistas que se consiguen investigando (cada una cuesta tiempo)
   y cuatro causas posibles. Los casos llevan la sesión de la que salen y una fecha de apertura,
   para que el juego crezca a medida que se da el temario. */
(() => {
  "use strict";

  const SEGUNDOS_CASO = 60;
  const COSTE_PISTA = 5;
  const CASOS_POR_PARTIDA = 6;

  const ACCIONES = [
    { id: "pantalla", nombre: "Mirar la pantalla", icono: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/>' },
    { id: "cliente", nombre: "Preguntar al cliente", icono: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>' },
    { id: "firmware", nombre: "Entrar en el firmware", icono: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>' },
    { id: "herramientas", nombre: "Usar las herramientas", icono: '<path d="m4 17 6-6-6-6M12 19h8"/>' },
    { id: "hardware", nombre: "Revisar el hardware", icono: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.4-.6-.6-2.4z"/>' }
  ];

  /* La primera opción de cada caso es la correcta; se barajan al mostrarlas. */
  const CASOS = [
    {
      sesion: "S15", titulo: "El disco nuevo",
      sintoma: "El equipo enciende, sale el logotipo del fabricante y se queda en «Reboot and select proper boot device».",
      pistas: {
        pantalla: "El mensaje sale justo después del logotipo, sin llegar al de Windows.",
        cliente: "«Ayer me instalaron un segundo disco duro para guardar fotos.»",
        firmware: "Se ven dos discos: el HDD nuevo está el primero del orden de arranque y el SSD con Windows, el segundo.",
        herramientas: "Desde el USB, diskpart muestra que el HDD nuevo no tiene partición EFI y el SSD sí.",
        hardware: "Los dos discos están bien conectados y el S.M.A.R.T. del SSD es correcto."
      },
      opciones: ["El orden de arranque pone primero el disco de datos, que no tiene sistema", "El SSD con Windows se ha averiado", "El BCD está dañado", "Un virus ha borrado Windows"],
      solucion: "Poner el SSD (Windows Boot Manager) el primero en el orden de arranque."
    },
    {
      sesion: "S15", titulo: "Después de actualizar la BIOS",
      sintoma: "Sale el logotipo de Windows, gira el círculo y aparece un pantallazo azul INACCESSIBLE_BOOT_DEVICE.",
      pistas: {
        pantalla: "El pantallazo sale siempre en el mismo punto, mientras carga Windows.",
        cliente: "«Ayer actualicé la BIOS de la placa siguiendo un vídeo.»",
        firmware: "Modo SATA: AHCI. En una etiqueta del técnico anterior pone «Intel RST (RAID)».",
        herramientas: "Desde el USB, el disco y la partición de Windows se ven completos.",
        hardware: "El disco responde y el S.M.A.R.T. no da avisos."
      },
      opciones: ["La actualización devolvió el modo SATA a AHCI y Windows estaba instalado en RAID", "El driver de la tarjeta gráfica está dañado", "El disco tiene sectores dañados", "Se ha borrado la partición EFI"],
      solucion: "Volver a poner el modo SATA en RAID (Intel RST) en el firmware."
    },
    {
      sesion: "S15", titulo: "El SSD clonado",
      sintoma: "Tras cambiar el disco duro por un SSD clonado, el equipo dice «No bootable device».",
      pistas: {
        pantalla: "El mensaje aparece antes de ver el logotipo de Windows.",
        cliente: "«Lo clonó mi sobrino con un programa gratuito. Solo copió la unidad C:, que es donde está todo.»",
        firmware: "El firmware ve el SSD, en modo UEFI y el primero del orden.",
        herramientas: "diskpart: el SSD solo tiene una partición NTFS con Windows. No hay partición EFI ni de recuperación.",
        hardware: "El SSD está bien conectado y su S.M.A.R.T. es perfecto."
      },
      opciones: ["Al clonar solo C: faltan las particiones de arranque", "El SSD es defectuoso", "El modo SATA está mal configurado", "Secure Boot bloquea el SSD"],
      solucion: "Crear la partición EFI y rehacer el arranque con bcdboot, o volver a clonar el disco completo."
    },
    {
      sesion: "S15", titulo: "La clave de 48 dígitos",
      sintoma: "Al arrancar, Windows pide la clave de recuperación de BitLocker.",
      pistas: {
        pantalla: "Pantalla azul de BitLocker pidiendo una clave de 48 dígitos.",
        cliente: "«Ayer desactivé Secure Boot para arrancar un USB de rescate.»",
        firmware: "Secure Boot: Disabled. El TPM (fTPM) está activo.",
        herramientas: "El disco está cifrado con BitLocker y sus particiones están completas.",
        hardware: "No se ha cambiado ninguna pieza."
      },
      opciones: ["Al cambiar Secure Boot, el TPM no entrega la clave de BitLocker", "Un ransomware ha cifrado el disco", "El disco se está estropeando", "El usuario ha olvidado su contraseña de Windows"],
      solucion: "Volver a activar Secure Boot; si aun así la pide, introducir la clave de la cuenta Microsoft del cliente."
    },
    {
      sesion: "S15", titulo: "¿Dónde está Linux?",
      sintoma: "Un equipo con Windows y Ubuntu, tras una actualización de Windows, arranca directo en Windows sin mostrar el menú.",
      pistas: {
        pantalla: "No aparece el menú GRUB: entra directamente en Windows.",
        cliente: "«Antes me salía un menú para elegir. Desde la actualización de anoche, ya no.»",
        firmware: "Orden de arranque UEFI: «Windows Boot Manager» primero y «ubuntu» segundo.",
        herramientas: "Administración de discos: las particiones de Linux siguen en su sitio.",
        hardware: "Todo correcto."
      },
      opciones: ["La actualización puso Windows Boot Manager el primero en el orden de arranque", "La actualización ha borrado Linux", "El disco está dañado", "Se ha activado el CSM"],
      solucion: "Poner «ubuntu» (GRUB) el primero en el orden de arranque del firmware."
    },
    {
      sesion: "S15", titulo: "El pendrive olvidado",
      sintoma: "El equipo dice «BOOTMGR is missing» al encenderlo.",
      pistas: {
        pantalla: "El mensaje sale antes del logotipo de Windows.",
        cliente: "«Ayer pasé unas fotos con un pendrive y creo que sigue puesto.»",
        firmware: "Orden de arranque: USB primero, después el disco.",
        herramientas: "El pendrive solo tiene fotos, sin ningún sistema.",
        hardware: "Disco y pendrive funcionan bien."
      },
      opciones: ["Intenta arrancar desde el pendrive, que no tiene sistema", "El gestor de arranque del disco se ha borrado", "La RAM está fallando", "El disco no tiene sistema de archivos"],
      solucion: "Quitar el pendrive y poner el disco el primero en el orden de arranque."
    },
    {
      sesion: "S15", titulo: "El optimizador milagroso",
      sintoma: "Windows llega al inicio de sesión, pero tras escribir la contraseña queda una pantalla negra con el cursor.",
      pistas: {
        pantalla: "Ctrl + Alt + Supr funciona y el Administrador de tareas se abre.",
        cliente: "«Ayer instalé un programa gratuito para que el ordenador fuera más rápido.»",
        firmware: "Todo normal: UEFI, Secure Boot activo, el disco el primero.",
        herramientas: "En el Administrador de tareas no aparece explorer.exe; sí un programa de inicio nuevo.",
        hardware: "La gráfica da imagen y el monitor funciona."
      },
      opciones: ["Un programa de inicio impide que arranque el Explorador (fase de sesión)", "El driver de la gráfica está dañado", "El monitor está mal configurado", "El BCD apunta a otra partición"],
      solucion: "Lanzar explorer.exe desde el Administrador de tareas y quitar el programa de inicio en modo seguro."
    },
    {
      sesion: "S15", titulo: "Tres pitidos",
      sintoma: "Al encender suenan tres pitidos y no hay imagen.",
      pistas: {
        pantalla: "El monitor se queda en negro: no llega ni el logotipo.",
        cliente: "«Lo limpié por dentro el fin de semana.»",
        firmware: "No se puede entrar: no hay imagen.",
        herramientas: "No hay ninguna: el equipo no pasa del POST.",
        hardware: "Según el manual de la placa, tres pitidos son un error de memoria. Un módulo está medio fuera."
      },
      opciones: ["La RAM está mal insertada: es una avería física del POST", "El gestor de arranque está dañado", "Windows no encuentra su disco", "El perfil del usuario está dañado"],
      solucion: "Volver a insertar bien la RAM. Es una avería física (UF0863), no lógica."
    },
    {
      sesion: "S16", desde: "2026-10-16", titulo: "El disco invisible",
      sintoma: "El cliente ha montado un disco nuevo y no aparece en el Explorador.",
      pistas: {
        pantalla: "En «Este equipo» solo aparece C:.",
        cliente: "«Lo saqué de la caja y lo conecté. No he hecho nada más.»",
        firmware: "El firmware detecta el disco nuevo.",
        herramientas: "Administración de discos: el disco aparece como «No inicializado» y todo su espacio sin asignar.",
        hardware: "Cables de datos y alimentación bien conectados."
      },
      opciones: ["El disco está sin inicializar y sin volumen", "El disco viene averiado de fábrica", "Le falta la letra de unidad", "Está protegido contra escritura"],
      solucion: "Inicializarlo en GPT, crear un volumen y formatearlo."
    },
    {
      sesion: "S16", desde: "2026-10-16", titulo: "«Debe formatear el disco»",
      sintoma: "Al conectar un disco externo, Windows dice «Debe formatear el disco antes de usarlo».",
      pistas: {
        pantalla: "Administración de discos muestra el volumen como RAW.",
        cliente: "«Lo desenchufé de golpe mientras copiaba. Tiene todas las fotos de la familia.»",
        firmware: "No aplica: el disco se conecta por USB.",
        herramientas: "El S.M.A.R.T. del disco es correcto, sin sectores reasignados.",
        hardware: "El disco gira sin ruidos raros."
      },
      opciones: ["El sistema de archivos está dañado por la desconexión: no se formatea", "El disco está vacío", "El disco está protegido contra escritura", "El disco está en FAT32"],
      solucion: "No formatear. Con el disco sano, recuperar la estructura con TestDisk o copiar los datos antes."
    },
    {
      sesion: "S16", desde: "2026-10-16", titulo: "Los 2 TB que faltan",
      sintoma: "El cliente ha comprado un disco de 4 TB y Windows solo le deja usar 2 TB.",
      pistas: {
        pantalla: "Administración de discos: una partición de 2 TB y otros 1,6 TB «No asignado» que no se pueden usar.",
        cliente: "«Lo inicialicé con la opción que salía por defecto en un programa antiguo.»",
        firmware: "El equipo arranca en UEFI.",
        herramientas: "Propiedades del disco → Volúmenes: estilo de partición MBR.",
        hardware: "El disco funciona bien."
      },
      opciones: ["Está inicializado en MBR, que no pasa de 2 TB", "El disco es falso y tiene menos capacidad", "El volumen está en FAT32", "Falta asignarle una letra"],
      solucion: "Copiar los datos fuera y pasar el disco a GPT."
    },
    {
      sesion: "S16", desde: "2026-10-16", titulo: "La película que no cabe",
      sintoma: "Un pendrive de 64 GB vacío no deja copiar un archivo de 6 GB: dice que es demasiado grande.",
      pistas: {
        pantalla: "Mensaje: «El archivo es demasiado grande para el sistema de archivos de destino».",
        cliente: "«El pendrive está vacío, no lo entiendo.»",
        firmware: "No aplica.",
        herramientas: "Propiedades del pendrive: sistema de archivos FAT32.",
        hardware: "El pendrive funciona bien con archivos pequeños."
      },
      opciones: ["El pendrive está en FAT32, que no admite archivos de más de 4 GB", "El pendrive está lleno de archivos ocultos", "El pendrive está protegido contra escritura", "El pendrive está inicializado en MBR"],
      solucion: "Convertirlo a NTFS con convert, o copiar los datos fuera y formatearlo en exFAT."
    }
  ];

  const abierto = (c) => {
    if (!c.desde) return true;
    const [y, m, d] = c.desde.split("-").map(Number);
    return new Date() >= new Date(y, m - 1, d);
  };

  const $ = (s) => document.querySelector(s);
  const zona = $("#juego");
  if (!zona) return;

  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const mezclar = (lista) => {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let partida = [], indice = 0, puntos = 0, aciertos = 0, resultados = [];
  let restante = 0, reloj = null, vistas = [];

  const pararReloj = () => { clearInterval(reloj); reloj = null; };

  const pintarMarcador = () => {
    $("#juego-paso").textContent = Math.min(indice + 1, partida.length) + " de " + partida.length;
    $("#juego-puntos").textContent = puntos;
    $("#juego-barra").style.width = (indice / partida.length * 100) + "%";
  };

  const pintarReloj = () => {
    const r = zona.querySelector(".reloj");
    if (!r) return;
    r.querySelector("strong").textContent = restante + " s";
    r.classList.toggle("urgente", restante <= 10);
    r.querySelector(".reloj-barra span").style.width = (restante / SEGUNDOS_CASO * 100) + "%";
  };

  const portada = () => {
    pararReloj();
    const disponibles = CASOS.filter(abierto);
    const sesiones = [...new Set(disponibles.map((c) => c.sesion))].join(" y ");
    $("#juego-paso").textContent = "–";
    $("#juego-puntos").textContent = "0";
    $("#juego-barra").style.width = "0";
    zona.innerHTML =
      '<div class="juego-portada">' +
      "<p>Te llegan equipos averiados. En cada uno tienes <strong>" + SEGUNDOS_CASO + " segundos</strong> para dar con la causa.</p>" +
      "<ul>" +
      "<li>Investiga para conseguir pistas: cada una te cuesta " + COSTE_PISTA + " segundos.</li>" +
      "<li>Cuando lo tengas claro, elige la causa. Solo hay una oportunidad.</li>" +
      "<li>Cada acierto da 50 puntos más un punto por cada segundo que te sobre.</li>" +
      "</ul>" +
      '<p class="juego-nota">' + disponibles.length + " casos disponibles de " + (sesiones.includes(" y ") ? "las " : "la ") + esc(sesiones) + ". Se añaden casos nuevos a medida que avanza el temario.</p>" +
      '<button type="button" class="boton lleno" id="juego-empezar">Empezar</button>' +
      "</div>";
    $("#juego-empezar").addEventListener("click", empezar);
  };

  const empezar = () => {
    partida = mezclar(CASOS.filter(abierto)).slice(0, CASOS_POR_PARTIDA);
    indice = 0; puntos = 0; aciertos = 0; resultados = [];
    caso();
  };

  const caso = () => {
    const c = partida[indice];
    restante = SEGUNDOS_CASO;
    vistas = [];
    pintarMarcador();
    const opciones = mezclar(c.opciones.map((t, i) => ({ t, ok: i === 0 })));
    zona.innerHTML =
      '<div class="caso-cabecera">' +
      '<div><span class="sintoma-etiqueta">Caso ' + (indice + 1) + " · " + esc(c.sesion) + "</span><h2>" + esc(c.titulo) + "</h2></div>" +
      '<div class="reloj" role="timer" aria-label="Tiempo restante"><strong>' + restante + ' s</strong><div class="reloj-barra"><span></span></div></div>' +
      "</div>" +
      '<div class="sintoma"><p>' + esc(c.sintoma) + "</p></div>" +
      '<h3 class="juego-subtitulo">Investiga <small>(−' + COSTE_PISTA + " s cada pista)</small></h3>" +
      '<div class="acciones-juego">' + ACCIONES.map((a) =>
        '<button type="button" class="accion" data-accion="' + a.id + '"><svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + a.icono + "</svg>" + a.nombre + "</button>").join("") +
      "</div>" +
      '<ul class="pistas" aria-live="polite"></ul>' +
      '<h3 class="juego-subtitulo" id="causa-titulo">¿Cuál es la causa?</h3>' +
      '<div class="opciones" role="group" aria-labelledby="causa-titulo">' + opciones.map((o) =>
        '<button type="button" class="opcion" data-ok="' + (o.ok ? "1" : "0") + '">' + esc(o.t) + "</button>").join("") +
      "</div>" +
      '<div class="respuesta" role="status" aria-live="polite"></div>';

    zona.querySelectorAll(".accion").forEach((b) => b.addEventListener("click", () => investigar(b)));
    zona.querySelectorAll(".opcion").forEach((b) => b.addEventListener("click", () => resolver(b)));
    pintarReloj();
    pararReloj();
    reloj = setInterval(() => {
      restante = Math.max(0, restante - 1);
      pintarReloj();
      if (restante === 0) resolver(null);
    }, 1000);
    zona.querySelector(".accion").focus({ preventScroll: true });
    zona.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const investigar = (b) => {
    const c = partida[indice];
    const a = ACCIONES.find((x) => x.id === b.dataset.accion);
    b.disabled = true;
    vistas.push(a.id);
    const li = document.createElement("li");
    li.innerHTML = "<strong>" + esc(a.nombre) + ":</strong> " + esc(c.pistas[a.id]);
    zona.querySelector(".pistas").appendChild(li);
    restante = Math.max(0, restante - COSTE_PISTA);
    pintarReloj();
    if (restante === 0) resolver(null);
  };

  const resolver = (b) => {
    if (!reloj) return;
    pararReloj();
    const c = partida[indice];
    const bien = !!b && b.dataset.ok === "1";
    const ganados = bien ? 50 + restante : 0;
    if (bien) aciertos++;
    puntos += ganados;
    resultados.push({ c, bien, ganados, tiempo: !b });

    zona.querySelectorAll(".accion, .opcion").forEach((x) => { x.disabled = true; });
    zona.querySelectorAll(".opcion").forEach((x) => {
      if (x.dataset.ok === "1") x.classList.add("correcta");
      else if (x === b) x.classList.add("fallo");
    });

    const r = zona.querySelector(".respuesta");
    r.className = "respuesta " + (bien ? "bien" : "mal");
    r.innerHTML =
      '<p class="respuesta-titulo">' + (bien ? "¡Diagnóstico correcto! +" + ganados + " puntos" : !b ? "Se acabó el tiempo." : "Diagnóstico equivocado.") + "</p>" +
      "<p><strong>Causa:</strong> " + esc(c.opciones[0]) + ".</p>" +
      "<p><strong>Solución:</strong> " + esc(c.solucion) + "</p>" +
      '<button type="button" class="boton lleno" id="juego-siguiente">' + (indice + 1 < partida.length ? "Siguiente caso" : "Ver resultado") + "</button>";
    $("#juego-puntos").textContent = puntos;
    const sig = $("#juego-siguiente");
    sig.addEventListener("click", () => {
      indice++;
      if (indice < partida.length) caso(); else terminar();
    });
    sig.focus({ preventScroll: true });
    r.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const terminar = () => {
    indice = partida.length;
    pintarMarcador();
    $("#juego-paso").textContent = partida.length + " de " + partida.length;
    const total = partida.length;
    if (window.UF0864) window.UF0864.practicaHecha("diagnostico-contrarreloj", aciertos, total);
    const nombre = window.UF0864 && window.UF0864.nombre();
    zona.innerHTML =
      '<div class="resultado">' +
      '<p class="resultado-nota">' + puntos + " puntos</p>" +
      '<p class="resultado-texto">' + (nombre ? esc(nombre) + ": " : "") + aciertos + " de " + total + " diagnósticos correctos. " +
      (aciertos === total ? "¡Técnico de primera!" : aciertos >= total * 0.7 ? "Buen trabajo, repasa los que fallaste." : "Repasa los apuntes y vuelve a intentarlo.") + "</p>" +
      (nombre ? "" : '<p class="resultado-aviso">Escribe tu nombre en el perfil (arriba a la derecha) para guardar tu progreso con tu nombre.</p>') +
      '<ol class="repaso">' + resultados.map((r) =>
        '<li class="' + (r.bien ? "bien" : "mal") + '"><span class="marca" aria-hidden="true">' + (r.bien ? "✓" : "✗") + "</span><span>" +
        "<strong>" + esc(r.c.titulo) + "</strong> · " + esc(r.c.opciones[0]) +
        "<small>" + (r.bien ? "+" + r.ganados + " puntos" : r.tiempo ? "Sin tiempo" : "Fallado") + "</small></span></li>").join("") +
      "</ol>" +
      '<div class="resultado-acciones"><button type="button" class="boton lleno" id="juego-repetir">Jugar otra vez</button>' +
      '<a class="boton" href="temario-uf0864.html">Repasar el temario</a></div>' +
      "</div>";
    $("#juego-repetir").addEventListener("click", empezar);
  };

  portada();
})();
