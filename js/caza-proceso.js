/* Minijuego «Caza al proceso sospechoso» (UF0864), sobre el motor de js/terminal.js.
   El alumno se sienta ante un Windows con problemas: revisa procesos, conexiones y todo lo que arranca solo,
   decide qué es una amenaza y responde sin romper nada legítimo. El equipo tiene un estado interno: un
   ransomware sigue cifrando mientras se investiga, un spyware sigue enviando datos si la red está conectada,
   y lo que no se quita del inicio vuelve al reiniciar. Nada se ejecuta de verdad.
   Los escenarios llevan su sesión y se abren el día de su clase; con ?profe se ven todos. */
(() => {
  "use strict";

  const app = document.getElementById("caza");
  if (!app || !window.Terminal) return;
  const { esc, dir, archivo } = Terminal;

  const PARAMS = new URLSearchParams(location.search);
  const PREVIA = PARAMS.has("profe");
  /* Dentro del escape room (escape-uf0864.html) el reto llega por ?escape=<id> y la nota vuelve a la sala. */
  const ESCAPE = PARAMS.get("escape");
  const avisarSala = (datos) => { if (window.parent !== window) window.parent.postMessage(Object.assign({ tipo: "escape-reto", juego: "caza" }, datos), location.origin); };
  /* Casos del examen: el escape room los descifra con la clave del día y los deja en la ventana de la sala. */
  const EXTRA = (() => { try { return ESCAPE && window.parent !== window && window.parent.ESCAPE_EXTRA || null; } catch (e) { return null; } })();
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

  /* Modo difícil: sin pistas, sin objetivos y sin consejos. Los errores dicen qué ha fallado, nunca qué escribir. */
  const CLAVE_MODO = "caza-modo";
  let DIFICIL = false;
  try { DIFICIL = localStorage.getItem(CLAVE_MODO) === "dificil"; } catch (e) { /* sin almacenamiento */ }
  const guardarModo = () => { try { localStorage.setItem(CLAVE_MODO, DIFICIL ? "dificil" : "normal"); } catch (e) { /* sin almacenamiento */ } };

  /* ---------- Procesos de Windows que hay en todos los equipos ----------
     critico: cerrarlo tumba Windows (CRITICAL_PROCESS_DIED). protegido: Windows no deja cerrarlo. */
  const MS = "Microsoft Windows";
  const SYS32 = "C:\\Windows\\System32\\";
  const proc = (pid, nombre, usuario, cpu, mem, ruta, extra) => Object.assign({ pid, nombre, usuario, cpu, mem, ruta, editor: MS, firmado: true, base: true, inicio: "08:57" }, extra);
  const base = (u) => [
    proc(4, "System", "SYSTEM", 0.4, 0.1, "C:\\Windows\\System32\\ntoskrnl.exe", { critico: true, padre: 0, cmd: "(núcleo de Windows)" }),
    proc(128, "Registry", "SYSTEM", 0, 62, "(registro de Windows)", { critico: true, padre: 4, cmd: "" }),
    proc(392, "smss.exe", "SYSTEM", 0, 1.1, SYS32 + "smss.exe", { critico: true, padre: 4 }),
    proc(616, "csrss.exe", "SYSTEM", 0.1, 5.4, SYS32 + "csrss.exe", { critico: true, padre: 392 }),
    proc(704, "wininit.exe", "SYSTEM", 0, 6.8, SYS32 + "wininit.exe", { critico: true, padre: 392 }),
    proc(792, "services.exe", "SYSTEM", 0.1, 9.2, SYS32 + "services.exe", { critico: true, padre: 704 }),
    proc(812, "lsass.exe", "SYSTEM", 0.1, 18, SYS32 + "lsass.exe", { critico: true, padre: 704 }),
    proc(1024, "svchost.exe", "SYSTEM", 0.2, 28, SYS32 + "svchost.exe", { critico: true, padre: 792, cmd: SYS32 + "svchost.exe -k DcomLaunch -p" }),
    proc(1156, "svchost.exe", "SERVICIO DE RED", 0.1, 14, SYS32 + "svchost.exe", { padre: 792, cmd: SYS32 + "svchost.exe -k RPCSS -p", critico: true }),
    proc(1340, "svchost.exe", "SYSTEM", 0.3, 46, SYS32 + "svchost.exe", { padre: 792, cmd: SYS32 + "svchost.exe -k netsvcs -p" }),
    proc(1488, "svchost.exe", "SERVICIO LOCAL", 0.1, 22, SYS32 + "svchost.exe", { padre: 792, cmd: SYS32 + "svchost.exe -k LocalServiceNetworkRestricted -p" }),
    proc(1720, "svchost.exe", "SERVICIO DE RED", 0.1, 18, SYS32 + "svchost.exe", { padre: 792, cmd: SYS32 + "svchost.exe -k NetworkService -p", red: [["20.190.159.68:443", "ESTABLISHED"]] }),
    proc(2088, "dwm.exe", "DWM-1", 1.2, 92, SYS32 + "dwm.exe", { padre: 704 }),
    proc(3604, "MsMpEng.exe", "SYSTEM", 0.8, 210, "C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\4.18.25090.3-0\\MsMpEng.exe", { padre: 792, protegido: true }),
    proc(4420, "explorer.exe", u, 0.6, 148, "C:\\Windows\\explorer.exe", { padre: 4396, inicio: "08:58" }),
    proc(5012, "SearchIndexer.exe", "SYSTEM", 0.1, 38, SYS32 + "SearchIndexer.exe", { padre: 792, cmd: SYS32 + "SearchIndexer.exe /Embedding" }),
    proc(5260, "RuntimeBroker.exe", u, 0, 24, SYS32 + "RuntimeBroker.exe", { padre: 1024, cmd: SYS32 + "RuntimeBroker.exe -Embedding", inicio: "08:58" })
  ];
  /* Un programa normal del cliente: legítimo, firmado y fuera de System32. */
  const app_ = (pid, nombre, u, cpu, mem, ruta, editor, extra) => Object.assign({ pid, nombre, usuario: u, cpu, mem, ruta, editor, firmado: true, padre: 4420, inicio: "08:59" }, extra);

  /* ---------- Escenarios ----------
     procesos: amenaza = tipo (minero, pup, spyware, ransomware…); "opcional" = no cuenta ni a favor ni en contra.
     detecta: qué análisis lo encuentran (rapido, completo, offline, kvrt). firmasNuevas: solo con firmas al día.
     inicio: todo lo que arranca solo. lanza = PID que arranca; mala = amenaza; roto = apunta a algo que ya no existe;
     descarga = vuelve a bajar su archivo si hay Internet; reinstala = reinstala un programa si hay Internet.
     programas: pup = no deseado; procesos/inicio = lo que se lleva al desinstalarlo. */
  const ESCENARIOS = [
    {
      id: "booster", sesion: "S17", desde: "2026-10-20", equipo: "PC-031", usuario: "marcos", tipo: "pup",
      titulo: "El acelerador de juegos",
      resumen: "Pantallazos azules desde que instaló un «optimizador» gratis.",
      orden: [
        "ORDEN DE TRABAJO 2026-1031 · Equipo PC-031",
        "Cliente: Marcos (autoriza la revisión de su equipo).",
        "Avería: desde el sábado le salen pantallazos azules mientras juega, cuatro o cinco al día.",
        "Cuenta que el viernes instaló «Game Booster Pro» de una web de descargas para que los juegos fueran más rápidos.",
        "Encargo: encontrar qué provoca los pantallazos y dejar el equipo estable sin perder sus juegos."
      ],
      sistema: { cpu: { 2088: 3.1 } },
      procesos: [
        app_(6010, "steam.exe", "marcos", 1.4, 210, "C:\\Program Files (x86)\\Steam\\steam.exe", "Valve Corp.", { red: [["162.254.196.67:27017", "ESTABLISHED"]] }),
        app_(6290, "Discord.exe", "marcos", 0.9, 180, "C:\\Users\\marcos\\AppData\\Local\\Discord\\app-1.0.9180\\Discord.exe", "Discord Inc.", { red: [["162.159.135.234:443", "ESTABLISHED"]] }),
        app_(6488, "GBoostPro.exe", "SYSTEM", 6.2, 96, "C:\\Program Files\\Velox Apps\\Game Booster Pro\\GBoostPro.exe", "Velox Apps SL",
          { amenaza: "pup", padre: 792, inicio: "08:57", cmd: "\"C:\\Program Files\\Velox Apps\\Game Booster Pro\\GBoostPro.exe\" /service /boost=auto", vt: "7/72 · PUP.Optional.GameBoost", red: [["104.21.33.80:443", "ESTABLISHED"]], detecta: { kvrt: true },
            nota: ["Carga el controlador gboost.sys para «liberar memoria» mientras se juega."] })
      ],
      inicio: [
        { n: 1, lugar: "Run (HKLM)", nombre: "GameBoosterPro", ruta: "C:\\Program Files\\Velox Apps\\Game Booster Pro\\GBoostPro.exe /tray", editor: "Velox Apps SL", lanza: 6488, mala: true, impacto: "Medio", programa: 1 },
        { n: 2, lugar: "Controlador", nombre: "gboost", ruta: "C:\\Windows\\System32\\drivers\\gboost.sys", editor: "Velox Apps SL", mala: true, programa: 1, impacto: "—" },
        { n: 3, lugar: "Run (HKCU)", nombre: "Steam", ruta: "\"C:\\Program Files (x86)\\Steam\\steam.exe\" -silent", editor: "Valve Corp.", lanza: 6010, impacto: "Alto" },
        { n: 4, lugar: "Run (HKCU)", nombre: "Discord", ruta: "C:\\Users\\marcos\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe", editor: "Discord Inc.", lanza: 6290, impacto: "Medio" },
        { n: 5, lugar: "Servicio", nombre: "NVDisplay.ContainerLocalSystem", ruta: "C:\\Windows\\System32\\DriverStore\\FileRepository\\nv_dispi.inf_amd64\\Display.NvContainer\\NVDisplay.Container.exe", editor: "NVIDIA Corporation", impacto: "—" }
      ],
      programas: [
        { n: 1, nombre: "Game Booster Pro 4.2", editor: "Velox Apps SL", fecha: "16/10/2026", pup: true, procesos: [6488], inicio: [1, 2] },
        { n: 2, nombre: "Steam", editor: "Valve Corp.", fecha: "03/02/2025" },
        { n: 3, nombre: "Discord", editor: "Discord Inc.", fecha: "03/02/2025" },
        { n: 4, nombre: "NVIDIA Graphics Driver 581.42", editor: "NVIDIA Corporation", fecha: "29/09/2026" }
      ],
      eventos: [
        ["20/10/2026 21:14", 1001, "BugCheck", "El equipo se reinició tras una comprobación de errores: DRIVER_IRQL_NOT_LESS_OR_EQUAL (0x000000d1). Qué ha fallado: gboost.sys. Volcado: C:\\Windows\\Minidump\\102026-01.dmp"],
        ["20/10/2026 21:13", 41, "Kernel-Power", "El sistema se reinició sin apagarse correctamente antes."],
        ["19/10/2026 18:40", 1001, "BugCheck", "DRIVER_IRQL_NOT_LESS_OR_EQUAL (0x000000d1). Qué ha fallado: gboost.sys."],
        ["18/10/2026 22:02", 1001, "BugCheck", "DRIVER_IRQL_NOT_LESS_OR_EQUAL (0x000000d1). Qué ha fallado: gboost.sys."],
        ["16/10/2026 19:31", 7045, "Service Control Manager", "Se instaló un servicio en el sistema: gboost (controlador de modo kernel)."],
        ["16/10/2026 19:31", 11707, "MsiInstaller", "Producto: Game Booster Pro 4.2. La instalación se completó correctamente."]
      ],
      archivos: [["C:\\Users\\marcos\\Downloads\\GameBoosterPro_Setup_gratis.exe", "(ejecutable)"], ["C:\\Windows\\Minidump\\102026-01.dmp", "(volcado de memoria: se lee con BlueScreenView o con eventos 1001)"]],
      objetivosOrden: ["eventos", "investigar", "persistencia", "neutralizar", "comprobar", "informe"],
      objetivos: { eventos: "Leer qué dicen los pantallazos", investigar: "Revisar el proceso sospechoso", persistencia: "Quitar el programa y su controlador", neutralizar: "Que no quede nada en marcha", comprobar: "Reiniciar y comprobar", informe: "Entregar el informe" },
      pistas: {
        eventos: "Los pantallazos quedan en el Visor de eventos: escribe eventos (o eventos 1001).",
        investigar: "Lista los procesos con tasklist /v y mira el sospechoso con proceso <PID>.",
        persistencia: "Un programa que instala un controlador no se arregla cerrando el proceso: escribe programas y desinstala Game Booster Pro.",
        neutralizar: "Comprueba con tasklist que ya no queda GBoostPro.exe.",
        comprobar: "Reinicia (reiniciar) y mira con tasklist y autoruns que no ha vuelto.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      metodo: ["eventos", "investigar", "desinstalar", "comprobar"],
      preguntas: [
        ["¿Qué tipo de amenaza era Game Booster Pro?", ["Un programa no deseado (PUP) con un controlador defectuoso", "Un virus que se pega a los juegos", "Un ransomware"]],
        ["¿Por qué no bastaba con cerrar GBoostPro.exe?", ["Su controlador se carga con Windows y el programa vuelve a arrancar", "Porque cerrarlo da un pantallazo", "Porque es un proceso crítico de Windows"]]
      ],
      solucion: "Los cinco pantallazos daban el mismo código y el mismo driver, gboost.sys, que llegó con un «optimizador» de una web de descargas. Mismo código y mismo driver: es ese driver. Se desinstala el programa (se lleva el controlador y su entrada de inicio) y se reinicia para comprobar."
    },
    {
      id: "arranque", sesion: "S18", desde: "2026-10-21", equipo: "PC-032", usuario: "elena", tipo: "pup",
      titulo: "Diez minutos para arrancar",
      resumen: "La clienta jura que tiene un virus: el equipo tarda una eternidad y da un error al entrar.",
      orden: [
        "ORDEN DE TRABAJO 2026-1032 · Equipo PC-032",
        "Clienta: Elena (autoriza la revisión de su equipo).",
        "Avería: tarda casi diez minutos en dejar usar el escritorio y al entrar sale «No se encuentra hpassist.exe».",
        "Cree que tiene un virus. Hace un mes cambió la impresora HP por una Epson y hace dos semanas instaló un «actualizador de drivers».",
        "Encargo: que arranque rápido sin quitarle lo que usa (Spotify, el audio y OneDrive)."
      ],
      sistema: { cpu: { 3604: 14.5, 5012: 6.2 } },
      procesos: [
        app_(5530, "OneDrive.exe", "elena", 0.4, 64, "C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe", "Microsoft Corporation", { cmd: "\"C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe\" /background", red: [["13.107.42.12:443", "ESTABLISHED"]] }),
        app_(5644, "RtkAudUService64.exe", "SYSTEM", 0.1, 8, "C:\\Windows\\System32\\DriverStore\\FileRepository\\realtekservice.inf_amd64\\RtkAudUService64.exe", "Realtek Semiconductor Corp.", { padre: 792 }),
        app_(5790, "Spotify.exe", "elena", 1.1, 160, "C:\\Users\\elena\\AppData\\Roaming\\Spotify\\Spotify.exe", "Spotify AB", { cmd: "\"C:\\Users\\elena\\AppData\\Roaming\\Spotify\\Spotify.exe\" --autostart --minimized", red: [["35.186.224.25:443", "ESTABLISHED"]] }),
        app_(5880, "DriverUpdaterPro.exe", "elena", 31.4, 240, "C:\\Program Files (x86)\\DUP Software\\Driver Updater Pro\\DriverUpdaterPro.exe", "DUP Software Ltd",
          { amenaza: "pup", cmd: "\"C:\\Program Files (x86)\\DUP Software\\Driver Updater Pro\\DriverUpdaterPro.exe\" /startup /scan", vt: "9/72 · PUP.Optional.DriverUpdater", red: [["172.67.150.12:443", "ESTABLISHED"]], detecta: { kvrt: true },
            nota: ["Al arrancar analiza el equipo entero y muestra «1.312 drivers obsoletos. Actívame por 29,95 €»."] })
      ],
      inicio: [
        { n: 1, lugar: "Run (HKCU)", nombre: "DriverUpdaterPro", ruta: "\"C:\\Program Files (x86)\\DUP Software\\Driver Updater Pro\\DriverUpdaterPro.exe\" /startup /scan", editor: "DUP Software Ltd", lanza: 5880, mala: true, impacto: "Alto", programa: 1 },
        { n: 2, lugar: "Tarea programada", nombre: "DUP_DailyScan", ruta: "\"C:\\Program Files (x86)\\DUP Software\\Driver Updater Pro\\DriverUpdaterPro.exe\" /scan /nag", editor: "DUP Software Ltd", lanza: 5880, mala: true, impacto: "—", programa: 1 },
        { n: 3, lugar: "Run (HKLM)", nombre: "HPPrintAssist", ruta: "C:\\Program Files\\HP\\PrintAssist\\hpassist.exe /tray", editor: "", roto: true, mala: true, impacto: "Alto" },
        { n: 4, lugar: "Servicio", nombre: "HPPrintAssistSvc", ruta: "C:\\Program Files\\HP\\PrintAssist\\hpassistsvc.exe", editor: "", roto: true, mala: true, impacto: "—" },
        { n: 5, lugar: "Run (HKCU)", nombre: "Spotify", ruta: "\"C:\\Users\\elena\\AppData\\Roaming\\Spotify\\Spotify.exe\" --autostart --minimized", editor: "Spotify AB", lanza: 5790, impacto: "Medio", cliente: true },
        { n: 6, lugar: "Run (HKLM)", nombre: "RtkAudUService", ruta: "C:\\Windows\\System32\\DriverStore\\FileRepository\\realtekservice.inf_amd64\\RtkAudUService64.exe -background", editor: "Realtek Semiconductor Corp.", lanza: 5644, impacto: "Bajo" },
        { n: 7, lugar: "Run (HKCU)", nombre: "OneDrive", ruta: "\"C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe\" /background", editor: "Microsoft Corporation", lanza: 5530, impacto: "Alto", microsoft: true },
        { n: 8, lugar: "Servicio", nombre: "Spooler", ruta: "C:\\Windows\\System32\\spoolsv.exe", editor: "Microsoft Windows", microsoft: true, impacto: "—" },
        { n: 9, lugar: "Servicio", nombre: "WSearch", ruta: "C:\\Windows\\System32\\SearchIndexer.exe /Embedding", editor: "Microsoft Windows", microsoft: true, lanza: 5012, impacto: "—" }
      ],
      programas: [
        { n: 1, nombre: "Driver Updater Pro 7", editor: "DUP Software Ltd", fecha: "07/10/2026", pup: true, procesos: [5880], inicio: [1, 2] },
        { n: 2, nombre: "Spotify", editor: "Spotify AB", fecha: "11/01/2026", cliente: true },
        { n: 3, nombre: "Epson ET-2850 Series Printer Driver", editor: "Seiko Epson Corporation", fecha: "18/09/2026" },
        { n: 4, nombre: "Realtek Audio Driver", editor: "Realtek Semiconductor Corp.", fecha: "11/01/2026" },
        { n: 5, nombre: "Microsoft OneDrive", editor: "Microsoft Corporation", fecha: "11/01/2026" }
      ],
      eventos: [
        ["21/10/2026 08:58", 7000, "Service Control Manager", "El servicio HP Print Assist Service no pudo iniciarse: el sistema no encuentra el archivo especificado."],
        ["21/10/2026 08:57", 7009, "Service Control Manager", "Se agotó el tiempo de espera (30000 ms) para la conexión con el servicio HPPrintAssistSvc."],
        ["20/10/2026 09:03", 7000, "Service Control Manager", "El servicio HP Print Assist Service no pudo iniciarse: el sistema no encuentra el archivo especificado."],
        ["18/09/2026 17:22", 11724, "MsiInstaller", "Producto: HP Smart Printing. La desinstalación se completó correctamente."],
        ["07/10/2026 12:40", 11707, "MsiInstaller", "Producto: Driver Updater Pro 7. La instalación se completó correctamente."],
        ["14/10/2026 11:15", 1000, "Application Error", "Aplicación con errores: DriverUpdaterPro.exe. Módulo con errores: dupscan.dll."]
      ],
      archivos: [["C:\\Users\\elena\\Downloads\\driver-updater-pro-gratis.exe", "(ejecutable)"]],
      objetivosOrden: ["eventos", "investigar", "persistencia", "neutralizar", "comprobar", "informe"],
      objetivos: { eventos: "Buscar en el Visor de eventos qué falla al arrancar", investigar: "Revisar el proceso que más gasta", persistencia: "Limpiar el inicio sin tocar lo legítimo", neutralizar: "Que no quede nada no deseado en marcha", comprobar: "Reiniciar y comprobar", informe: "Entregar el informe" },
      pistas: {
        eventos: "Escribe eventos: busca un 7000 o un 7009 de un servicio que no arranca.",
        investigar: "Ordena los procesos por CPU con tasklist /cpu y revisa el primero que no sea de Windows con proceso <PID>.",
        persistencia: "En autoruns, las filas en amarillo apuntan a archivos que ya no existen: desactívalas con desactivar <nº>. El actualizador de drivers se desinstala (programas, desinstalar). Spotify, Realtek y OneDrive se quedan.",
        neutralizar: "Comprueba con tasklist que ya no está DriverUpdaterPro.exe.",
        comprobar: "Reinicia con reiniciar y mira que no vuelve nada.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      metodo: ["eventos", "persistencia", "investigar", "comprobar"],
      preguntas: [
        ["¿Tenía un virus el equipo?", ["No: un programa no deseado y restos de la impresora vieja", "Sí: un troyano escondido en el servicio de impresión", "Sí: un criptominero en Spotify"]],
        ["¿Qué hace un inicio limpio con msconfig?", ["Arranca solo con los servicios de Microsoft y sin programas de inicio, con todos los drivers", "Arranca en modo seguro, sin drivers de terceros", "Reinstala Windows sin borrar los documentos"]]
      ],
      solucion: "No había virus. El arranque esperaba 30 segundos por un servicio de la impresora HP que ya no existe (eventos 7000 y 7009) y un «actualizador de drivers» de una web de descargas analizaba el equipo al entrar. Se desactivan las entradas rotas, se desinstala el PUP y se deja lo que la clienta usa."
    },
    {
      id: "minero", sesion: "S19", desde: "2026-10-22", equipo: "PC-033", usuario: "ana", tipo: "minero",
      titulo: "El ventilador que no para",
      resumen: "CPU al 95 % sin nada abierto y un svchost.exe que no está donde debería.",
      orden: [
        "ORDEN DE TRABAJO 2026-1033 · Equipo PC-033",
        "Clienta: Ana (autoriza la revisión de su equipo y el acceso a sus datos).",
        "Avería: con el equipo en reposo el ventilador va a tope y todo va lento. La factura de la luz ha subido.",
        "Hace diez días se bajó un «mod» para un juego desde un enlace de Discord.",
        "Encargo: encontrar qué gasta la CPU, eliminarlo y que no vuelva."
      ],
      sistema: { cpu: { 3604: 0.4 } },
      defender: { firmasDias: 41 },
      procesos: [
        app_(6010, "steam.exe", "ana", 0.8, 190, "C:\\Program Files (x86)\\Steam\\steam.exe", "Valve Corp.", { red: [["162.254.196.67:27017", "ESTABLISHED"]] }),
        app_(6290, "Discord.exe", "ana", 0.6, 170, "C:\\Users\\ana\\AppData\\Local\\Discord\\app-1.0.9180\\Discord.exe", "Discord Inc.", { red: [["162.159.135.234:443", "ESTABLISHED"]] }),
        app_(6120, "svchost.exe", "ana", 92.6, 2310, "C:\\Users\\ana\\AppData\\Roaming\\Microsoft\\Windows\\svchost.exe", null,
          { firmado: false, amenaza: "minero", padre: 6098, inicio: "09:01", cmd: "svchost.exe -o pool.minexmr-gate.net:3333 -u 48xTqd…9pQe --cpu-max-threads-hint=95 --donate-level=0", vt: "51/72 · Trojan:Win64/CoinMiner", red: [["51.89.204.17:3333", "ESTABLISHED"]],
            detecta: { rapido: true, completo: true, offline: true, kvrt: true }, firmasNuevas: true, padreNombre: "powershell.exe (ya terminado)" })
      ],
      inicio: [
        { n: 1, lugar: "Tarea programada", nombre: "MicrosoftEdgeUpdateTaskMachineCore2", ruta: "powershell.exe -w hidden -nop -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoA…", editor: "Microsoft Windows", archivo: "C:\\Users\\ana\\AppData\\Roaming\\Microsoft\\Windows\\svchost.exe", lanza: 6120, mala: true, impacto: "—", nota: "Se lanza al iniciar sesión y cada hora. El programa (powershell) es de Microsoft; lo que ejecuta, no." },
        { n: 2, lugar: "Tarea programada", nombre: "MicrosoftEdgeUpdateTaskMachineCore", ruta: "\"C:\\Program Files (x86)\\Microsoft\\EdgeUpdate\\MicrosoftEdgeUpdate.exe\" /c", editor: "Microsoft Corporation", impacto: "—" },
        { n: 3, lugar: "Run (HKCU)", nombre: "Steam", ruta: "\"C:\\Program Files (x86)\\Steam\\steam.exe\" -silent", editor: "Valve Corp.", lanza: 6010, impacto: "Alto", cliente: true },
        { n: 4, lugar: "Run (HKCU)", nombre: "Discord", ruta: "C:\\Users\\ana\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe", editor: "Discord Inc.", lanza: 6290, impacto: "Medio", cliente: true }
      ],
      programas: [
        { n: 1, nombre: "Steam", editor: "Valve Corp.", fecha: "02/03/2025", cliente: true },
        { n: 2, nombre: "Discord", editor: "Discord Inc.", fecha: "02/03/2025", cliente: true },
        { n: 3, nombre: "Microsoft Edge", editor: "Microsoft Corporation", fecha: "15/10/2026" }
      ],
      eventos: [
        ["11/10/2026 22:47", 4698, "Microsoft-Windows-Security-Auditing", "Se creó una tarea programada: \\MicrosoftEdgeUpdateTaskMachineCore2 (usuario ana)."],
        ["11/10/2026 22:46", 4104, "PowerShell", "Ejecución de un bloque de script codificado (-enc) desde C:\\Users\\ana\\Downloads\\mod_skins_v3\\instalar.bat."],
        ["09/09/2026 10:00", 2001, "Windows Defender", "No se pudieron actualizar las definiciones de seguridad: la actualización automática está desactivada."]
      ],
      archivos: [["C:\\Users\\ana\\Downloads\\mod_skins_v3\\instalar.bat", ["@echo off", "powershell -w hidden -nop -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoA…", "echo Mod instalado. ¡Disfruta!"]]],
      objetivosOrden: ["aislar", "investigar", "neutralizar", "persistencia", "analizar", "comprobar", "informe"],
      objetivos: { aislar: "Aislar el equipo de la red", investigar: "Identificar el proceso sospechoso", neutralizar: "Detener el proceso malicioso", persistencia: "Quitar lo que lo vuelve a arrancar", analizar: "Analizar con firmas al día", comprobar: "Reiniciar y comprobar que no vuelve", informe: "Entregar el informe" },
      pistas: {
        aislar: "Lo primero ante una posible infección es desconectar el equipo: red off.",
        investigar: "Hay varios svchost.exe. Mira la ruta de cada uno con tasklist /v o proceso <PID>: el de verdad solo vive en C:\\Windows\\System32.",
        neutralizar: "Cierra el falso svchost.exe por su PID: taskkill /pid <PID> /f. Por nombre cerrarías también los de Windows.",
        persistencia: "Algo lo arrancó: mira las tareas programadas con schtasks o autoruns y desactiva la que lanza powershell oculto.",
        analizar: "Las firmas tienen 41 días: defender actualizar y después defender rapido (o defender offline).",
        comprobar: "Reinicia con reiniciar y mira con tasklist /cpu que no ha vuelto.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      metodo: ["aislar", "investigar", "firmas", "comprobar"],
      preguntas: [
        ["¿Qué tipo de malware era?", ["Un criptominero", "Un ransomware", "Un adware"]],
        ["¿Qué delataba al falso svchost.exe?", ["Estaba en AppData, sin firma y conectado a un pool de minería", "Que había varios svchost.exe a la vez", "Que lo ejecutaba el usuario SYSTEM"]]
      ],
      solucion: "Un criptominero disfrazado de svchost.exe en AppData, sin firma y conectado a un pool por el puerto 3333. Lo arrancaba una tarea con nombre de Microsoft que lanzaba PowerShell oculto. Se aísla, se cierra por PID, se desactiva la tarea, se actualizan las firmas, se analiza y se reinicia para comprobar."
    },
    {
      id: "buscador", sesion: "S19", desde: "2026-10-22", equipo: "PC-034", usuario: "lucia", tipo: "adware",
      titulo: "El buscador que vuelve",
      resumen: "Dos antivirus dicen que está limpio, pero el buscador raro vuelve cada mañana.",
      orden: [
        "ORDEN DE TRABAJO 2026-1034 · Equipo PC-034",
        "Clienta: Lucía (autoriza la revisión de su equipo).",
        "Avería: Chrome abre un buscador «SafeFinder» lleno de anuncios. Lo cambia en la configuración y al día siguiente ha vuelto.",
        "Ya ha pasado Defender y otro antivirus: los dos dicen que no hay nada. Chrome pone «Administrado por tu organización» y es su portátil de casa.",
        "Hace tres semanas instaló un «PDF Converter Free» para un trámite.",
        "Encargo: dejar el navegador como estaba y que no vuelva."
      ],
      procesos: [
        app_(6010, "chrome.exe", "lucia", 2.1, 420, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "Google LLC", { red: [["142.250.184.4:443", "ESTABLISHED"], ["54.38.112.9:443", "ESTABLISHED"]] }),
        app_(6644, "SafeFinderSvc.exe", "SYSTEM", 0.6, 34, "C:\\Program Files (x86)\\SafeFinder\\SafeFinderSvc.exe", "Brightwave Media Ltd",
          { amenaza: "adware", padre: 792, inicio: "08:57", cmd: "\"C:\\Program Files (x86)\\SafeFinder\\SafeFinderSvc.exe\" -service -enforce", vt: "6/72 · Adware.SafeFinder", red: [["54.38.112.9:443", "ESTABLISHED"]], detecta: { kvrt: true },
            nota: ["Cada vez que arranca vuelve a escribir las directivas de Chrome."] })
      ],
      inicio: [
        { n: 1, lugar: "Servicio", nombre: "SafeFinderService", ruta: "\"C:\\Program Files (x86)\\SafeFinder\\SafeFinderSvc.exe\" -service -enforce", editor: "Brightwave Media Ltd", lanza: 6644, mala: true, programa: 1, impacto: "—" },
        { n: 2, lugar: "Tarea programada", nombre: "SFUpdateTask", ruta: "C:\\Users\\lucia\\AppData\\Local\\SFUpdate\\sfupd.exe /silent /repair", editor: "", archivo: "C:\\Users\\lucia\\AppData\\Local\\SFUpdate\\sfupd.exe", firmado: false, mala: true, reinstala: 1, impacto: "—", detecta: { kvrt: true },
          nota: "Se lanza al iniciar sesión. Si SafeFinder no está instalado, lo vuelve a descargar e instalar." },
        { n: 3, lugar: "Run (HKCU)", nombre: "GoogleChromeAutoLaunch", ruta: "\"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\" --no-startup-window", editor: "Google LLC", lanza: 6010, impacto: "Bajo" },
        { n: 4, lugar: "Tarea programada", nombre: "GoogleUpdateTaskMachineCore", ruta: "\"C:\\Program Files (x86)\\Google\\Update\\GoogleUpdate.exe\" /c", editor: "Google LLC", impacto: "—" }
      ],
      programas: [
        { n: 1, nombre: "SafeFinder", editor: "Brightwave Media Ltd", fecha: "30/09/2026", pup: true, procesos: [6644], inicio: [1], directivas: true, detectaKvrt: true },
        { n: 2, nombre: "PDF Converter Free 3.1", editor: "Brightwave Media Ltd", fecha: "30/09/2026", pup: true, detectaKvrt: true },
        { n: 3, nombre: "Google Chrome", editor: "Google LLC", fecha: "12/04/2025", cliente: true },
        { n: 4, nombre: "LibreOffice 25.8", editor: "The Document Foundation", fecha: "12/04/2025", cliente: true }
      ],
      navegador: {
        buscadorMalo: "search.safefinder-hub.com",
        extensiones: [
          { id: "e1", nombre: "Safe Search Plus 2.4", detalle: "Lee y cambia todos tus datos en los sitios web · Instalada por una directiva", mala: true, forzada: true },
          { id: "e2", nombre: "Google Docs sin conexión 1.94", detalle: "Google", mala: false },
          { id: "e3", nombre: "uBlock Origin Lite 2026.9", detalle: "La instaló la clienta", mala: false }
        ],
        directivas: [
          "DefaultSearchProviderEnabled = true",
          "DefaultSearchProviderSearchURL = https://search.safefinder-hub.com/?q={searchTerms}",
          "HomepageLocation = https://search.safefinder-hub.com",
          "ExtensionInstallForcelist = kbfnbcaeplbcioakkpcpgfkobkghlhen (Safe Search Plus)"
        ]
      },
      eventos: [
        ["30/09/2026 18:12", 11707, "MsiInstaller", "Producto: PDF Converter Free 3.1. La instalación se completó correctamente."],
        ["30/09/2026 18:13", 11707, "MsiInstaller", "Producto: SafeFinder. La instalación se completó correctamente."],
        ["30/09/2026 18:13", 7045, "Service Control Manager", "Se instaló un servicio en el sistema: SafeFinderService."],
        ["21/10/2026 08:58", 1116, "Windows Defender", "(Ninguna amenaza detectada en el último examen rápido.)"]
      ],
      archivos: [["C:\\Users\\lucia\\Downloads\\PDFConverterFree_setup.exe", "(ejecutable)"]],
      objetivosOrden: ["aislar", "investigar", "analizar", "persistencia", "neutralizar", "comprobar", "informe"],
      objetivos: { aislar: "Aislar el equipo de la red", investigar: "Identificar el proceso sospechoso", analizar: "Pasar una segunda opinión", persistencia: "Quitar el programa, su tarea y la extensión", neutralizar: "Dejar el navegador como estaba", comprobar: "Reiniciar y comprobar que no vuelve", informe: "Entregar el informe" },
      pistas: {
        aislar: "Aunque parezca solo publicidad, se sigue el protocolo: red off.",
        investigar: "Mira los procesos que no son de Windows con tasklist /v y revisa el sospechoso con proceso <PID>. Mira también navegador directivas.",
        analizar: "Defender no ve los PUP de este tipo. Pasa una segunda opinión a demanda: kvrt.",
        persistencia: "Desinstala SafeFinder y PDF Converter (programas, desinstalar <nº>). La tarea SFUpdateTask no se va con ellos: desactivar <nº>.",
        neutralizar: "Sin directivas, ya se puede: navegador quitar <nº> para la extensión y navegador restablecer para el buscador.",
        comprobar: "Reinicia con reiniciar y comprueba navegador directivas y autoruns.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      metodo: ["investigar", "offline", "persistencia", "comprobar"],
      preguntas: [
        ["¿Qué tipo de amenaza era SafeFinder?", ["Un adware o secuestrador del navegador (PUP)", "Un ransomware", "Un gusano de red"]],
        ["¿Por qué el buscador volvía aunque Lucía lo cambiara?", ["Un programa había creado directivas que lo imponían", "Porque Chrome estaba desactualizado", "Porque Defender lo restauraba"]]
      ],
      solucion: "Un secuestrador del navegador que llegó con «PDF Converter Free». Defender no lo ve porque es un PUP; la segunda opinión sí. Imponía el buscador con directivas (chrome://policy) y una tarea lo reinstalaba cada mañana. Se desinstalan los dos programas, se desactiva la tarea, se quita la extensión, se restablece Chrome y se reinicia para comprobar."
    },
    {
      id: "espia", sesion: "S19", desde: "2026-10-22", equipo: "PC-035", usuario: "javi", tipo: "spyware",
      titulo: "La cuenta que entra sola",
      resumen: "Alguien entra en su correo desde otro país y el antivirus se ha apagado solo.",
      orden: [
        "ORDEN DE TRABAJO 2026-1035 · Equipo PC-035",
        "Cliente: Javi (autoriza la revisión de su equipo y el acceso a sus datos).",
        "Avería: Google le avisa de inicios de sesión en su correo desde Rumanía. Seguridad de Windows sale desactivada y no se deja activar.",
        "La semana pasada se bajó un «Photoshop 2026 crack» de un foro.",
        "Quiere cambiar ya mismo sus contraseñas desde este portátil.",
        "Encargo: limpiar el equipo y proteger sus cuentas. Tiene el TFG en Documentos y no tiene copia."
      ],
      sistema: { sin: [3604] },
      defender: { activo: false, bloqueado: "Una directiva de grupo desactiva Microsoft Defender Antivirus (DisableAntiSpyware = 1)." },
      procesos: [
        app_(5870, "chrome.exe", "javi", 1.8, 380, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "Google LLC", { red: [["142.250.184.4:443", "ESTABLISHED"]] }),
        app_(3320, "audiodg.exe", "SERVICIO LOCAL", 0.3, 12, SYS32 + "audiodg.exe", MS, { padre: 1488, base: true }),
        app_(5644, "RtkAudUService64.exe", "SYSTEM", 0.1, 8, "C:\\Windows\\System32\\DriverStore\\FileRepository\\realtekservice.inf_amd64\\RtkAudUService64.exe", "Realtek Semiconductor Corp.", { padre: 792 }),
        app_(7012, "WinAudioSvc.exe", "javi", 0.4, 22, "C:\\Users\\javi\\AppData\\Local\\Temp\\WinAudio\\WinAudioSvc.exe", null,
          { firmado: false, amenaza: "spyware", cmd: "\"C:\\Users\\javi\\AppData\\Local\\Temp\\WinAudio\\WinAudioSvc.exe\" -k -c -s 300", vt: "58/72 · Spy:Win32/Keylog.KX", red: [["91.215.85.17:443", "ESTABLISHED"]],
            detecta: { offline: true, kvrt: true, rapido: true, completo: true },
            nota: ["Tiene un gancho de teclado activo y cada 5 minutos sube un archivo cifrado.", "Al arrancar escribió la directiva que desactiva Defender."] })
      ],
      inicio: [
        { n: 1, lugar: "Run (HKCU)", nombre: "Windows Audio Service", ruta: "\"C:\\Users\\javi\\AppData\\Local\\Temp\\WinAudio\\WinAudioSvc.exe\" -k -c -s 300", editor: "", firmado: false, lanza: 7012, mala: true, impacto: "Bajo" },
        { n: 2, lugar: "Run (HKLM)", nombre: "RtkAudUService", ruta: "C:\\Windows\\System32\\DriverStore\\FileRepository\\realtekservice.inf_amd64\\RtkAudUService64.exe -background", editor: "Realtek Semiconductor Corp.", lanza: 5644, impacto: "Bajo" },
        { n: 3, lugar: "Servicio", nombre: "Audiosrv", ruta: "C:\\Windows\\System32\\svchost.exe -k LocalServiceNetworkRestricted -p", editor: "Microsoft Windows", microsoft: true, impacto: "—" },
        { n: 4, lugar: "Run (HKCU)", nombre: "GoogleChromeAutoLaunch", ruta: "\"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\" --no-startup-window", editor: "Google LLC", lanza: 5870, impacto: "Bajo" }
      ],
      programas: [
        { n: 1, nombre: "Google Chrome", editor: "Google LLC", fecha: "05/09/2025", cliente: true },
        { n: 2, nombre: "Realtek Audio Driver", editor: "Realtek Semiconductor Corp.", fecha: "05/09/2025" },
        { n: 3, nombre: "Microsoft Office Hogar y Estudiantes 2024", editor: "Microsoft Corporation", fecha: "05/09/2025", cliente: true }
      ],
      eventos: [
        ["14/10/2026 23:05", 5001, "Windows Defender", "La protección en tiempo real está deshabilitada."],
        ["14/10/2026 23:05", 5007, "Windows Defender", "Se modificó la configuración: DisableAntiSpyware = 1 (directiva)."],
        ["14/10/2026 23:04", 4688, "Microsoft-Windows-Security-Auditing", "Nuevo proceso: C:\\Users\\javi\\Downloads\\Photoshop_2026_Crack.exe"]
      ],
      archivos: [["C:\\Users\\javi\\Downloads\\Photoshop_2026_Crack.exe", "(ejecutable)"]],
      datos: ["Documentos/TFG_Javier_v12.docx", "Documentos/TFG_bibliografia.xlsx", "Imágenes/Erasmus_2025/"],
      objetivosOrden: ["aislar", "investigar", "copiar", "analizar", "persistencia", "contrasenas", "informe"],
      objetivos: { aislar: "Aislar el equipo de la red", investigar: "Identificar el proceso espía", copiar: "Copiar los datos del cliente", analizar: "Analizar sin conexión", persistencia: "Quitar lo que lo vuelve a arrancar", contrasenas: "Cambiar las contraseñas de forma segura", informe: "Entregar el informe" },
      pistas: {
        aislar: "Si hay un espía enviando datos, cada minuto cuenta: red off antes que nada.",
        investigar: "Hay dos procesos «de audio». Compara rutas y firmas: tasklist /v y proceso <PID>. Mira también netstat.",
        copiar: "Antes de limpiar, salva el TFG: copiar datos (solo datos, nada de ejecutables).",
        analizar: "Defender está desactivado por el malware y no se deja activar desde Windows. El examen sin conexión no depende de él: defender offline.",
        persistencia: "Algo lo vuelve a arrancar en cada inicio de sesión: autoruns y desactivar <nº>.",
        contrasenas: "Con el espía, las contraseñas ya no son secretas. Escribe contrasenas y elige hacerlo desde otro equipo limpio.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      metodo: ["aislar", "copiar", "offline", "contrasenas"],
      preguntas: [
        ["¿Qué tipo de malware era WinAudioSvc.exe?", ["Un spyware (registrador de teclas)", "Un criptominero", "Un adware"]],
        ["¿Por qué no se cambian las contraseñas desde este portátil?", ["Si queda un espía registrando el teclado, el atacante recibe también las nuevas", "Porque el portátil está aislado y no tiene Internet", "Porque Windows no deja cambiar contraseñas en modo seguro"]]
      ],
      solucion: "Un spyware que llegó con un crack: un falso servicio de audio en Temp, sin firma, con gancho de teclado y una conexión permanente a un servidor. Además había apagado Defender con una directiva. Se aísla, se copian los datos, se analiza sin conexión, se quita su entrada Run y las contraseñas se cambian desde otro equipo limpio, con verificación en dos pasos."
    },
    {
      id: "rootkit", sesion: "S19", desde: "2026-10-22", equipo: "PC-036", usuario: "pilar", tipo: "rootkit",
      titulo: "El antivirus que se apaga solo",
      resumen: "Lo han limpiado dos veces y vuelve. El proceso System habla con Internet.",
      orden: [
        "ORDEN DE TRABAJO 2026-1036 · Equipo PC-036",
        "Clienta: Pilar (autoriza la revisión de su equipo y el acceso a sus datos).",
        "Avería: Defender se desactiva solo. Otro técnico lo limpió hace dos semanas con dos antivirus y a los tres días volvió todo.",
        "Usa el equipo para la contabilidad de su tienda y el banco. Instaló un programa de edición pirata en septiembre.",
        "Encargo: que el equipo vuelva a ser de fiar. Hay que salvar la carpeta Contabilidad."
      ],
      sistema: { sin: [3604], red: { 4: [["45.137.21.9:8443", "ESTABLISHED"]] } },
      defender: { activo: false, bloqueado: "La protección en tiempo real está desactivada y la configuración se revierte sola al activarla." },
      rootkit: { entrada: 3, nombre: "Rootkit:Win64/Ndisrd.A" },
      procesos: [
        app_(5870, "msedge.exe", "pilar", 1.2, 310, "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "Microsoft Corporation", { red: [["13.107.21.200:443", "ESTABLISHED"]] }),
        app_(6020, "ContaPlus.exe", "pilar", 0.4, 120, "C:\\Program Files (x86)\\ContaPlus 2026\\ContaPlus.exe", "Sage Spain SL", {})
      ],
      inicio: [
        { n: 1, lugar: "Run (HKCU)", nombre: "MicrosoftEdgeAutoLaunch", ruta: "\"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\" --no-startup-window", editor: "Microsoft Corporation", lanza: 5870, impacto: "Bajo" },
        { n: 2, lugar: "Servicio", nombre: "ContaPlusDB", ruta: "\"C:\\Program Files (x86)\\ContaPlus 2026\\cpdbsvc.exe\"", editor: "Sage Spain SL", impacto: "—" },
        { n: 3, lugar: "Controlador", nombre: "ndisrd", ruta: "C:\\Windows\\System32\\drivers\\ndisrd.sys", editor: "", firmado: false, mala: true, impacto: "—", nota: "Controlador de arranque (Boot). No aparece en el Administrador de dispositivos." }
      ],
      programas: [
        { n: 1, nombre: "ContaPlus 2026", editor: "Sage Spain SL", fecha: "10/01/2026", cliente: true },
        { n: 2, nombre: "VideoPro Studio 2026 (Portable)", editor: "", fecha: "22/09/2026", neutro: true },
        { n: 3, nombre: "Microsoft Edge", editor: "Microsoft Corporation", fecha: "15/10/2026" }
      ],
      eventos: [
        ["21/10/2026 09:00", 5001, "Windows Defender", "La protección en tiempo real está deshabilitada."],
        ["07/10/2026 12:31", 1117, "Windows Defender", "Se ha eliminado una amenaza: Trojan:Win32/Dropper.NR (C:\\ProgramData\\svc32\\upd.exe)."],
        ["10/10/2026 08:59", 1116, "Windows Defender", "Se detectó de nuevo: Trojan:Win32/Dropper.NR (C:\\ProgramData\\svc32\\upd.exe)."],
        ["22/09/2026 21:40", 7045, "Service Control Manager", "Se instaló un servicio en el sistema: ndisrd (controlador de arranque)."]
      ],
      datos: ["Contabilidad/2026/", "Contabilidad/facturas_tienda.xlsx", "Documentos/banco_extractos/"],
      reinstalar: true,
      objetivosOrden: ["aislar", "investigar", "copiar", "analizar", "reinstalar", "contrasenas", "informe"],
      objetivos: { aislar: "Aislar el equipo de la red", investigar: "Buscar lo que se esconde", copiar: "Copiar los datos de la clienta", analizar: "Analizar sin conexión", reinstalar: "Decidir: limpiar o reinstalar", contrasenas: "Cambiar las contraseñas de forma segura", informe: "Entregar el informe" },
      pistas: {
        aislar: "System hablando con Internet no es normal: red off antes de seguir.",
        investigar: "En tasklist no se ve nada raro. Mira netstat -ano (¿qué PID tiene la conexión rara?) y autoruns: busca un controlador sin firma.",
        copiar: "Antes de decidir nada, salva la contabilidad: copiar datos (solo datos).",
        analizar: "Un rootkit engaña al antivirus que corre dentro de Windows: defender offline.",
        reinstalar: "Si el sistema ya no puede vigilarse a sí mismo y la amenaza vuelve tras limpiar, no se sigue limpiando: reinstalar.",
        contrasenas: "Con un control remoto no se sabe qué se llevó: contrasenas, desde otro equipo limpio. El banco también.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      metodo: ["aislar", "copiar", "offline", "contrasenas"],
      preguntas: [
        ["¿Qué tipo de amenaza era?", ["Un rootkit (controlador de arranque oculto)", "Un adware del navegador", "Un criptominero"]],
        ["¿Por qué se reinstala en vez de limpiar otra vez?", ["El sistema ya no puede vigilarse a sí mismo y la amenaza vuelve tras limpiar", "Porque reinstalar es más rápido que analizar", "Porque Defender no es compatible con ContaPlus"]]
      ],
      solucion: "Un rootkit cargado como controlador de arranque sin firma: escondía sus procesos, apagaba Defender y reinstalaba el troyano cada vez que lo limpiaban. Su única huella era la conexión del proceso System. Se aísla, se copian solo los datos, el análisis sin conexión lo confirma y se reinstala desde un medio limpio. Las contraseñas (y el banco) se cambian desde otro equipo."
    },
    {
      id: "ransom", sesion: "S20", desde: "2026-10-23", equipo: "PC-037", usuario: "rosa", tipo: "ransomware",
      titulo: "Los archivos .lockbit",
      resumen: "Los documentos de la gestoría empiezan a cambiar de nombre. Está pasando ahora mismo.",
      orden: [
        "ORDEN DE TRABAJO 2026-1037 · Equipo PC-037 · URGENTE",
        "Clienta: Rosa, gestoría (autoriza la revisión y el acceso a los datos).",
        "Avería: hace diez minutos los documentos empezaron a acabar en .lockbit y hay un README.txt en cada carpeta.",
        "El equipo tiene la carpeta compartida del NAS de la oficina como unidad Z:. El jefe quiere pagar «para acabar antes».",
        "Hay una copia de seguridad del viernes en un disco USB, desconectado y guardado en un cajón.",
        "Encargo: parar el daño, recuperar los datos y dejar el equipo de fiar."
      ],
      sistema: { cpu: { 3604: 4.1 }, red: { 4: [["192.168.1.20:445", "ESTABLISHED"]] } },
      reinstalar: true,
      ransom: { local: 4200, nas: 12800, ritmoLocal: 0.045, ritmoNas: 0.035 },
      procesos: [
        app_(5530, "OUTLOOK.EXE", "rosa", 0.6, 260, "C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE", "Microsoft Corporation", { red: [["52.97.146.162:443", "ESTABLISHED"]] }),
        app_(6900, "winupd.exe", "rosa", 38.2, 88, "C:\\ProgramData\\winupd\\winupd.exe", null,
          { firmado: false, amenaza: "ransomware", inicio: "10:41", padre: 5530, padreNombre: "OUTLOOK.EXE (5530)", cmd: "\"C:\\ProgramData\\winupd\\winupd.exe\" -path C:\\Users -path Z:\\ -silent", vt: "62/72 · Ransom:Win32/LockBit", red: [["185.220.101.34:443", "SYN_SENT"]],
            detecta: { offline: true, kvrt: true },
            nota: ["Abre los archivos de Documentos y de Z:\\ uno tras otro y los reescribe con la extensión .lockbit.", "Lo lanzó Outlook: un adjunto «Factura_octubre.pdf.exe»."] }),
        proc(7344, "vssadmin.exe", "rosa", 0.4, 6, SYS32 + "vssadmin.exe", { base: false, amenaza: "opcional", padre: 6900, inicio: "10:41", cmd: "vssadmin.exe delete shadows /all /quiet", transitorio: 4, padreNombre: "winupd.exe (6900)" })
      ],
      inicio: [
        { n: 1, lugar: "Run (HKCU)", nombre: "WindowsUpdater", ruta: "\"C:\\ProgramData\\winupd\\winupd.exe\" -path C:\\Users -path Z:\\ -silent", editor: "", firmado: false, lanza: 6900, mala: true, impacto: "Alto" },
        { n: 2, lugar: "Run (HKCU)", nombre: "OneDrive", ruta: "\"C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe\" /background", editor: "Microsoft Corporation", microsoft: true, impacto: "Alto" },
        { n: 3, lugar: "Servicio", nombre: "A3ERPsvc", ruta: "\"C:\\Program Files\\Wolters Kluwer\\a3ERP\\a3svc.exe\"", editor: "Wolters Kluwer España SA", impacto: "—" }
      ],
      programas: [
        { n: 1, nombre: "Microsoft 365 Empresa", editor: "Microsoft Corporation", fecha: "10/01/2026", cliente: true },
        { n: 2, nombre: "a3ERP", editor: "Wolters Kluwer España SA", fecha: "10/01/2026", cliente: true }
      ],
      eventos: [
        ["23/10/2026 10:41", 8224, "VSS", "El servicio de instantáneas de volumen se detuvo: se eliminaron todas las instantáneas (vssadmin delete shadows)."],
        ["23/10/2026 10:41", 4688, "Microsoft-Windows-Security-Auditing", "Nuevo proceso: C:\\Users\\rosa\\AppData\\Local\\Temp\\Factura_octubre.pdf.exe (proceso padre: OUTLOOK.EXE)."]
      ],
      objetivosOrden: ["aislar", "neutralizar", "investigar", "identificar", "reinstalar", "restaurar", "informe"],
      objetivos: { aislar: "Aislar el equipo YA", neutralizar: "Detener el cifrado", investigar: "Identificar el proceso", identificar: "Identificar la variante", reinstalar: "Reinstalar desde un medio limpio", restaurar: "Restaurar la copia desconectada", informe: "Entregar el informe" },
      pistas: {
        aislar: "Cada comando que escribes, el cifrado avanza, también en el NAS. Primero: red off.",
        neutralizar: "Ordena por CPU (tasklist /cpu): el que no tiene firma y escribe sin parar. taskkill /pid <PID> /f.",
        investigar: "Mira de dónde salió con proceso <PID>.",
        identificar: "No se paga ni se borran los archivos cifrados. Identifica la variante con la nota: nomoreransom README.txt.",
        reinstalar: "Con un ransomware no se sabe qué más dejó el atacante. Copia lo que quede (copiar datos) y reinstala: reinstalar.",
        restaurar: "Con el equipo ya reinstalado y aislado, conecta la copia del viernes: restaurar.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      metodo: ["aislar", "identificar", "reinstalar", "noPagar"],
      preguntas: [
        ["¿Qué tipo de malware era winupd.exe?", ["Un ransomware", "Un criptominero", "Un adware"]],
        ["¿Por qué no se conecta la copia del viernes al equipo infectado «para ver si está bien»?", ["Porque el ransomware la cifraría también", "Porque el disco USB es demasiado lento", "Porque Windows no reconoce discos con copias"]]
      ],
      solucion: "Un ransomware lanzado desde un adjunto de Outlook: cifraba Documentos y la unidad Z: del NAS, y borró las instantáneas con vssadmin (un programa de Microsoft usado para el ataque). Se aísla al momento, se detiene el proceso, se identifica la variante en No More Ransom, no se paga, se reinstala desde un medio limpio y se restaura la copia desconectada del viernes."
    },
    {
      id: "dosav", sesion: "S18", desde: "2026-10-21", equipo: "PC-038", usuario: "tomas", tipo: "ninguno",
      titulo: "Dos antivirus a la vez",
      resumen: "Va a paso de tortuga desde que «se protegió mejor». No hay ningún virus.",
      orden: [
        "ORDEN DE TRABAJO 2026-1038 · Equipo PC-038",
        "Cliente: Tomás (autoriza la revisión de su equipo).",
        "Avería: desde la semana pasada tarda casi cuatro minutos en arrancar y al abrir cualquier carpeta se queda pensando.",
        "Cuenta que, para estar «más protegido», instaló ShieldMax Free y, como seguía lento, también SecureZone Total.",
        "Encargo: que vaya rápido sin dejarlo desprotegido. No quiere perder la licencia de SecureZone, que la pagó."
      ],
      sistema: { sin: [3604], cpu: { 5012: 3.2 } },
      defender: { activo: false, bloqueado: "Hay otro antivirus registrado en Seguridad de Windows: Microsoft Defender Antivirus se ha desactivado solo." },
      procesos: [
        app_(5210, "ShieldMaxSvc.exe", "SYSTEM", 34.8, 410, "C:\\Program Files\\ShieldMax\\ShieldMaxSvc.exe", "ShieldMax Security s.r.o.", { padre: 792, inicio: "08:57", protegido: true, vt: "0/72", cmd: "\"C:\\Program Files\\ShieldMax\\ShieldMaxSvc.exe\" /realtime",
          nota: ["Protección en tiempo real activa: analiza cada archivo que se abre."] }),
        app_(5388, "SZEngine.exe", "SYSTEM", 29.1, 520, "C:\\Program Files\\SecureZone\\Total\\SZEngine.exe", "SecureZone Ltd", { padre: 792, inicio: "08:57", protegido: true, vt: "0/72", cmd: "\"C:\\Program Files\\SecureZone\\Total\\SZEngine.exe\" -rtp -heuristic=high",
          nota: ["Protección en tiempo real activa: analiza cada archivo que se abre… y también los que abre el otro antivirus."] }),
        app_(5530, "OneDrive.exe", "tomas", 0.4, 60, "C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe", "Microsoft Corporation", { red: [["13.107.42.12:443", "ESTABLISHED"]] }),
        app_(5870, "firefox.exe", "tomas", 1.3, 350, "C:\\Program Files\\Mozilla Firefox\\firefox.exe", "Mozilla Corporation", { red: [["34.107.243.93:443", "ESTABLISHED"]] })
      ],
      inicio: [
        { n: 1, lugar: "Servicio", nombre: "ShieldMaxService", ruta: "\"C:\\Program Files\\ShieldMax\\ShieldMaxSvc.exe\" /realtime", editor: "ShieldMax Security s.r.o.", lanza: 5210, impacto: "—", programa: 1 },
        { n: 2, lugar: "Servicio", nombre: "SecureZoneEngine", ruta: "\"C:\\Program Files\\SecureZone\\Total\\SZEngine.exe\" -rtp", editor: "SecureZone Ltd", lanza: 5388, impacto: "—", programa: 2 },
        { n: 3, lugar: "Run (HKLM)", nombre: "ShieldMaxTray", ruta: "\"C:\\Program Files\\ShieldMax\\smtray.exe\"", editor: "ShieldMax Security s.r.o.", impacto: "Alto", programa: 1 },
        { n: 4, lugar: "Run (HKLM)", nombre: "SecureZoneUI", ruta: "\"C:\\Program Files\\SecureZone\\Total\\szui.exe\" /minimized", editor: "SecureZone Ltd", impacto: "Alto", programa: 2 },
        { n: 5, lugar: "Run (HKCU)", nombre: "OneDrive", ruta: "\"C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe\" /background", editor: "Microsoft Corporation", lanza: 5530, microsoft: true, impacto: "Alto" }
      ],
      programas: [
        { n: 1, nombre: "ShieldMax Free Antivirus 9", editor: "ShieldMax Security s.r.o.", fecha: "12/10/2026", av: true, procesos: [5210], inicio: [1, 3] },
        { n: 2, nombre: "SecureZone Total Security 2026", editor: "SecureZone Ltd", fecha: "15/10/2026", av: true, cliente: true, procesos: [5388], inicio: [2, 4] },
        { n: 3, nombre: "Mozilla Firefox", editor: "Mozilla Corporation", fecha: "04/03/2025", cliente: true },
        { n: 4, nombre: "LibreOffice 25.8", editor: "The Document Foundation", fecha: "04/03/2025", cliente: true }
      ],
      eventos: [
        ["21/10/2026 09:02", 100, "Diagnostics-Performance", "Windows se ha iniciado: el arranque ha tardado 214.380 ms (antes de la semana pasada: 38.900 ms)."],
        ["21/10/2026 09:02", 103, "Diagnostics-Performance", "Este servicio ha retrasado el arranque: ShieldMaxService. Y también: SecureZoneEngine."],
        ["20/10/2026 18:11", 1002, "Application Hang", "El programa explorer.exe dejó de responder (mientras SZEngine.exe analizaba la carpeta)."],
        ["15/10/2026 20:30", 15, "SecurityCenter", "Se registró SecureZone Total Security. Estado: activado. Ya había otro antivirus activo: ShieldMax Free."],
        ["12/10/2026 19:05", 15, "SecurityCenter", "Se registró ShieldMax Free Antivirus. Microsoft Defender Antivirus se desactiva."]
      ],
      extra: [["Un solo antivirus en tiempo real", () => E.programas.filter((g) => g.av && g.instalado).length <= 1],
        ["Sigue habiendo un antivirus en tiempo real", () => E.programas.some((g) => g.av && g.instalado) || E.defender.activo]],
      objetivosOrden: ["eventos", "investigar", "extra", "comprobar", "informe"],
      objetivos: { eventos: "Ver qué retrasa el arranque", investigar: "Revisar procesos e inicio", extra: "Dejar un solo antivirus en tiempo real", comprobar: "Reiniciar y comprobar", informe: "Entregar el informe" },
      pistas: {
        eventos: "El Visor de eventos guarda cuánto tarda el arranque y quién lo retrasa: eventos (mira el 100 y el 103).",
        investigar: "Mira qué gasta CPU (tasklist /cpu) y qué arranca solo (autoruns). Revisa los procesos con proceso <PID>.",
        extra: "Dos antivirus en tiempo real se bloquean entre sí. No se cierran: se desinstala uno (programas, desinstalar <nº>). Tomás quiere quedarse SecureZone, que lo pagó.",
        comprobar: "Reinicia (reiniciar) y mira con tasklist /cpu que va bien.",
        informe: "Cuando lo tengas todo, escribe informe. Aquí no había ningún proceso malicioso."
      },
      metodo: ["eventos", "persistencia", "investigar", "comprobar"],
      preguntas: [
        ["¿Qué le pasaba al equipo?", ["Dos antivirus en tiempo real que se bloqueaban entre sí", "Un criptominero escondido en el antivirus", "Un disco duro que empezaba a fallar"]],
        ["Si un cliente quiere una «segunda opinión», ¿qué le recomiendas?", ["Un antimalware a demanda, que no se queda vigilando", "Un segundo antivirus en tiempo real", "Desactivar Defender y usar solo el gratuito"]]
      ],
      solucion: "No había virus: dos antivirus en tiempo real analizaban cada archivo que abría el otro, y Defender se había apartado solo. Se desinstala uno (el que no pagó), se deja el otro y se comprueba el arranque. La segunda opinión se usa a demanda, nunca como segundo antivirus residente."
    },
    {
      id: "susto", sesion: "S19", desde: "2026-10-22", equipo: "PC-039", usuario: "carmen", tipo: "pup",
      titulo: "1.847 problemas graves",
      resumen: "Un «limpiador» asusta con errores y pide 39 € para arreglarlos.",
      orden: [
        "ORDEN DE TRABAJO 2026-1039 · Equipo PC-039",
        "Clienta: Carmen (autoriza la revisión de su equipo).",
        "Avería: cada vez que enciende sale «¡PELIGRO! 1.847 problemas graves. Repárelos ahora por 39,95 €».",
        "Lo instaló desde un anuncio que decía que su equipo estaba infectado. Ella no ha pagado.",
        "Encargo: quitar el programa y lo que haya traído con él."
      ],
      procesos: [
        app_(5870, "msedge.exe", "carmen", 1.1, 290, "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "Microsoft Corporation", { red: [["13.107.21.200:443", "ESTABLISHED"]] }),
        app_(6230, "PCFixUltimate.exe", "carmen", 4.6, 140, "C:\\Program Files (x86)\\PCFix Ultimate\\PCFixUltimate.exe", "Optimal Soft Group LLC",
          { amenaza: "pup", cmd: "\"C:\\Program Files (x86)\\PCFix Ultimate\\PCFixUltimate.exe\" /autoscan /alert", vt: "11/72 · PUP.Optional.PCFixUltimate", red: [["185.199.110.153:443", "ESTABLISHED"]], detecta: { kvrt: true },
            nota: ["Muestra una alerta a pantalla completa con «1.847 problemas» que en realidad son archivos temporales y cookies."] }),
        app_(6402, "PCFixNotifier.exe", "carmen", 0.8, 32, "C:\\Users\\carmen\\AppData\\Local\\PCFix\\PCFixNotifier.exe", null,
          { firmado: false, amenaza: "pup", inicio: "09:00", cmd: "\"C:\\Users\\carmen\\AppData\\Local\\PCFix\\PCFixNotifier.exe\" --nag 30", vt: "9/72 · PUP.Optional.PCFixUltimate", detecta: { kvrt: true },
            nota: ["Cada 30 minutos abre otra vez la alerta. No se va al desinstalar el programa."] })
      ],
      inicio: [
        { n: 1, lugar: "Run (HKCU)", nombre: "PCFixUltimate", ruta: "\"C:\\Program Files (x86)\\PCFix Ultimate\\PCFixUltimate.exe\" /autoscan /alert", editor: "Optimal Soft Group LLC", lanza: 6230, mala: true, impacto: "Alto", programa: 1 },
        { n: 2, lugar: "Tarea programada", nombre: "PCFixNotifier_Logon", ruta: "\"C:\\Users\\carmen\\AppData\\Local\\PCFix\\PCFixNotifier.exe\" --nag 30", editor: "", firmado: false, lanza: 6402, mala: true, impacto: "—", detecta: { kvrt: true } },
        { n: 3, lugar: "Run (HKCU)", nombre: "MicrosoftEdgeAutoLaunch", ruta: "\"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe\" --no-startup-window", editor: "Microsoft Corporation", lanza: 5870, impacto: "Bajo" }
      ],
      programas: [
        { n: 1, nombre: "PCFix Ultimate 2026", editor: "Optimal Soft Group LLC", fecha: "19/10/2026", pup: true, detectaKvrt: true, procesos: [6230], inicio: [1] },
        { n: 2, nombre: "Microsoft 365", editor: "Microsoft Corporation", fecha: "02/02/2026", cliente: true },
        { n: 3, nombre: "Zoom Workplace", editor: "Zoom Communications, Inc.", fecha: "02/02/2026", cliente: true }
      ],
      eventos: [
        ["19/10/2026 17:44", 11707, "MsiInstaller", "Producto: PCFix Ultimate 2026. La instalación se completó correctamente."],
        ["19/10/2026 17:44", 4698, "Microsoft-Windows-Security-Auditing", "Se creó una tarea programada: \\PCFixNotifier_Logon (usuario carmen)."]
      ],
      archivos: [["C:\\Users\\carmen\\Downloads\\PCFixUltimate_Setup.exe", "(ejecutable)"]],
      objetivosOrden: ["aislar", "investigar", "analizar", "persistencia", "neutralizar", "comprobar", "informe"],
      objetivos: { aislar: "Aislar el equipo de la red", investigar: "Revisar los procesos sospechosos", analizar: "Pasar una segunda opinión", persistencia: "Quitar el programa y lo que deja", neutralizar: "Que no quede nada en marcha", comprobar: "Reiniciar y comprobar", informe: "Entregar el informe" },
      pistas: {
        aislar: "Se sigue el protocolo aunque parezca solo un programa pesado: red off.",
        investigar: "Hay dos procesos de PCFix. Míralos con tasklist /v y proceso <PID>: uno no está en Archivos de programa.",
        analizar: "Defender no suele marcar estos «limpiadores». Pasa una segunda opinión: kvrt.",
        persistencia: "Desinstala PCFix (programas, desinstalar <nº>) y desactiva la tarea que deja detrás (autoruns, desactivar <nº>).",
        neutralizar: "Si el avisador sigue en marcha, ciérralo por PID: taskkill /pid <PID> /f.",
        comprobar: "Reinicia (reiniciar) y mira tasklist y autoruns.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      metodo: ["aislar", "investigar", "offline", "comprobar"],
      preguntas: [
        ["¿Qué era PCFix Ultimate?", ["Un programa no deseado (PUP) que asusta para cobrar", "Un ransomware", "Un antivirus legítimo con una licencia caducada"]],
        ["¿Por qué volvía la alerta aunque se desinstalara el programa?", ["Una tarea programada lanzaba un avisador que no se iba con el desinstalador", "Porque Windows guarda una copia en la Papelera", "Porque Edge lo reinstala solo"]]
      ],
      solucion: "Un «limpiador» que asusta (scareware, un PUP): los 1.847 problemas eran temporales y cookies. Se desinstala, se quita su avisador, que dejaba una tarea programada aparte, y se comprueba con una segunda opinión y un reinicio. A la clienta se le explica que ninguna web sabe si su equipo está infectado."
    },
    {
      id: "rat", sesion: "S19", desde: "2026-10-22", equipo: "PC-040", usuario: "jorge", tipo: "rat",
      titulo: "El ratón que se mueve solo",
      resumen: "Por la noche el puntero se mueve y se abren ventanas. Hay un servicio sin descripción.",
      orden: [
        "ORDEN DE TRABAJO 2026-1040 · Equipo PC-040",
        "Cliente: Jorge, autónomo (autoriza la revisión de su equipo y el acceso a sus datos).",
        "Avería: anoche vio cómo el puntero se movía solo y se abría el banco en el navegador. Desenchufó el equipo.",
        "Su gestor se conecta a veces con AnyDesk para revisarle las facturas; eso es normal y Jorge lo autoriza.",
        "Hace dos semanas abrió un adjunto «Notificación_DGT.zip».",
        "Encargo: que el equipo vuelva a ser de fiar y salvar la carpeta Facturas."
      ],
      reinstalar: true,
      procesos: [
        app_(5530, "AnyDesk.exe", "SYSTEM", 0.3, 28, "C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe", "philandro Software GmbH", { padre: 792, inicio: "08:57", cmd: "\"C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe\" --service", red: [["195.181.170.8:443", "ESTABLISHED"]],
          nota: ["Servicio de escritorio remoto. Sesiones de hoy: ninguna. Última: 14/10 (gestoría García)."] }),
        app_(5870, "chrome.exe", "jorge", 1.6, 330, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "Google LLC", { red: [["142.250.184.4:443", "ESTABLISHED"]] }),
        app_(6612, "wdhelper.exe", "SYSTEM", 0.7, 18, "C:\\ProgramData\\Microsoft\\Crypto\\wdhelper.exe", null,
          { firmado: false, amenaza: "rat", padre: 792, inicio: "08:57", cmd: "\"C:\\ProgramData\\Microsoft\\Crypto\\wdhelper.exe\" -svc -h 193.42.33.17 -p 4444", vt: "47/72 · Backdoor:Win32/Remcos", red: [["193.42.33.17:4444", "ESTABLISHED"]],
            detecta: { offline: true, kvrt: true, rapido: true, completo: true }, firmasNuevas: true,
            nota: ["Captura la pantalla, mueve el ratón y registra el teclado a petición del servidor."] })
      ],
      inicio: [
        { n: 1, lugar: "Servicio", nombre: "WinDefendHelper", ruta: "\"C:\\ProgramData\\Microsoft\\Crypto\\wdhelper.exe\" -svc", editor: "", firmado: false, lanza: 6612, mala: true, impacto: "—", nota: "Servicio sin descripción. Se hace llamar «Windows Defender Helper», pero Defender no tiene ningún servicio así." },
        { n: 2, lugar: "Servicio", nombre: "AnyDesk", ruta: "\"C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe\" --service", editor: "philandro Software GmbH", lanza: 5530, impacto: "—", cliente: true },
        { n: 3, lugar: "Run (HKCU)", nombre: "GoogleChromeAutoLaunch", ruta: "\"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\" --no-startup-window", editor: "Google LLC", lanza: 5870, impacto: "Bajo" }
      ],
      programas: [
        { n: 1, nombre: "AnyDesk", editor: "philandro Software GmbH", fecha: "10/01/2026", cliente: true },
        { n: 2, nombre: "Google Chrome", editor: "Google LLC", fecha: "10/01/2026", cliente: true },
        { n: 3, nombre: "FacturaDirecta Escritorio", editor: "FacturaDirecta SL", fecha: "10/01/2026", cliente: true }
      ],
      defender: { firmasDias: 9 },
      eventos: [
        ["07/10/2026 11:20", 7045, "Service Control Manager", "Se instaló un servicio en el sistema: WinDefendHelper (C:\\ProgramData\\Microsoft\\Crypto\\wdhelper.exe), inicio automático."],
        ["07/10/2026 11:19", 4688, "Microsoft-Windows-Security-Auditing", "Nuevo proceso: C:\\Users\\jorge\\AppData\\Local\\Temp\\Notificacion_DGT\\Notificacion_DGT.pdf.js (wscript.exe)."],
        ["14/10/2026 10:02", 4624, "Microsoft-Windows-Security-Auditing", "Inicio de sesión remoto (AnyDesk) desde la gestoría García."]
      ],
      datos: ["Documents/Facturas/", "Documents/Facturas/2026_T3.xlsx", "Documents/Contratos/"],
      extra: [["Equipo reinstalado desde un medio limpio", () => E.reinstalado]],
      objetivosOrden: ["aislar", "investigar", "copiar", "analizar", "reinstalar", "contrasenas", "informe"],
      objetivos: { aislar: "Aislar el equipo de la red", investigar: "Encontrar al intruso", copiar: "Copiar los datos del cliente", analizar: "Analizar con firmas al día o sin conexión", reinstalar: "Decidir: limpiar o reinstalar", contrasenas: "Cambiar las contraseñas de forma segura", informe: "Entregar el informe" },
      pistas: {
        aislar: "Alguien controla el equipo desde fuera: red off antes que nada.",
        investigar: "Hay dos programas de control remoto. Uno es el del gestor. Compara rutas, firmas y conexiones: tasklist /v, netstat -ano, proceso <PID>, sc query.",
        copiar: "Antes de decidir, salva las facturas: copiar datos (solo datos).",
        analizar: "Las firmas tienen 9 días: defender actualizar y defender offline (o kvrt).",
        reinstalar: "Con un control remoto no se sabe qué más dejó el atacante: se reinstala desde un medio limpio. reinstalar.",
        contrasenas: "Si veía la pantalla y el teclado, el banco y el correo ya no son secretos: contrasenas, desde otro equipo.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      metodo: ["aislar", "copiar", "offline", "contrasenas"],
      preguntas: [
        ["¿Qué era wdhelper.exe?", ["Un troyano de control remoto (puerta trasera)", "El servicio de AnyDesk que usa el gestor", "Un componente de Windows Defender"]],
        ["¿Por qué se reinstala en vez de quitar solo el servicio?", ["Con un control remoto no se sabe qué más dejó el atacante", "Porque los servicios no se pueden desactivar", "Porque AnyDesk no funciona tras limpiar"]]
      ],
      solucion: "Un troyano de control remoto que llegó en un adjunto falso de la DGT y se instaló como servicio con nombre de Defender, en ProgramData, sin firma y conectado al puerto 4444. AnyDesk era legítimo (lo usa el gestor). Se aísla, se copian solo los datos, se analiza con firmas al día, se reinstala porque un control remoto deja la duda de qué más hizo, y las contraseñas se cambian desde otro equipo."
    },
    {
      id: "limpiador", sesion: "S20", desde: "2026-10-23", equipo: "PC-041", usuario: "irene", tipo: "pup",
      titulo: "Los puntos de restauración que desaparecen",
      resumen: "Quiso volver a un punto de restauración y no queda ninguno. Cada noche se borran.",
      orden: [
        "ORDEN DE TRABAJO 2026-1041 · Equipo PC-041",
        "Clienta: Irene (autoriza la revisión de su equipo).",
        "Avería: tras una actualización de la impresora quiso volver a un punto de restauración y no hay ninguno. La Protección del sistema está activada.",
        "Hace un mes instaló «CleanBoost Pro» para «liberar espacio». Dice que le ahorra 20 GB cada noche.",
        "Encargo: averiguar qué borra los puntos de restauración y que no vuelva a pasar."
      ],
      procesos: [
        app_(5530, "OneDrive.exe", "irene", 0.3, 58, "C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe", "Microsoft Corporation", { red: [["13.107.42.12:443", "ESTABLISHED"]] }),
        app_(6080, "CleanBoost.exe", "irene", 2.4, 120, "C:\\Program Files\\CleanBoost Pro\\CleanBoost.exe", "Brightstar Utilities Ltd",
          { amenaza: "pup", cmd: "\"C:\\Program Files\\CleanBoost Pro\\CleanBoost.exe\" /tray /deepclean=nightly", vt: "8/72 · PUP.Optional.CleanBoost", red: [["104.18.6.112:443", "ESTABLISHED"]], detecta: { kvrt: true },
            nota: ["Su «limpieza profunda» incluye «Eliminar copias de seguridad del sistema innecesarias»."] })
      ],
      inicio: [
        { n: 1, lugar: "Run (HKCU)", nombre: "CleanBoostTray", ruta: "\"C:\\Program Files\\CleanBoost Pro\\CleanBoost.exe\" /tray", editor: "Brightstar Utilities Ltd", lanza: 6080, mala: true, impacto: "Medio", programa: 1 },
        { n: 2, lugar: "Tarea programada", nombre: "CleanBoost_DeepClean_Nightly", ruta: "C:\\Windows\\System32\\vssadmin.exe delete shadows /for=C: /all /quiet", editor: "Microsoft Windows", mala: true, impacto: "—", nota: "Todas las noches a las 03:00. El programa (vssadmin) es de Windows; lo que hace con él, no: borra todas las instantáneas." },
        { n: 3, lugar: "Tarea programada", nombre: "HP Printer Firmware Update", ruta: "\"C:\\Program Files\\HP\\HP Smart\\hpfwupd.exe\" /check", editor: "HP Inc.", impacto: "—", cliente: true },
        { n: 4, lugar: "Run (HKCU)", nombre: "OneDrive", ruta: "\"C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe\" /background", editor: "Microsoft Corporation", lanza: 5530, microsoft: true, impacto: "Alto" }
      ],
      programas: [
        { n: 1, nombre: "CleanBoost Pro 5", editor: "Brightstar Utilities Ltd", fecha: "22/09/2026", pup: true, detectaKvrt: true, procesos: [6080], inicio: [1] },
        { n: 2, nombre: "HP Smart", editor: "HP Inc.", fecha: "18/10/2026", cliente: true },
        { n: 3, nombre: "Microsoft 365", editor: "Microsoft Corporation", fecha: "05/05/2025", cliente: true }
      ],
      eventos: [
        ["21/10/2026 03:00", 8224, "VSS", "Se eliminaron 3 instantáneas del volumen C: (vssadmin delete shadows, tarea CleanBoost_DeepClean_Nightly)."],
        ["20/10/2026 03:00", 8224, "VSS", "Se eliminaron 2 instantáneas del volumen C: (vssadmin delete shadows, tarea CleanBoost_DeepClean_Nightly)."],
        ["18/10/2026 16:20", 8194, "System Restore", "Se creó el punto de restauración «Instalado HP Smart»."],
        ["22/09/2026 18:02", 11707, "MsiInstaller", "Producto: CleanBoost Pro 5. La instalación se completó correctamente."]
      ],
      objetivosOrden: ["eventos", "investigar", "persistencia", "neutralizar", "comprobar", "informe"],
      objetivos: { eventos: "Averiguar quién borra los puntos", investigar: "Revisar el proceso sospechoso", persistencia: "Quitar el programa y su tarea nocturna", neutralizar: "Que no quede nada en marcha", comprobar: "Reiniciar y comprobar", informe: "Entregar el informe" },
      pistas: {
        eventos: "Los puntos de restauración son instantáneas (VSS). Busca en eventos el 8224: dice cuándo se borraron y quién.",
        investigar: "Mira el proceso del «limpiador» con tasklist /v y proceso <PID>.",
        persistencia: "Desinstala CleanBoost (programas, desinstalar <nº>). La tarea nocturna no es suya para el desinstalador: desactívala en autoruns (desactivar <nº>). La de HP es de la impresora y se queda.",
        neutralizar: "Comprueba con tasklist que CleanBoost.exe ya no está.",
        comprobar: "Reinicia (reiniciar) y revisa schtasks.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      metodo: ["eventos", "persistencia", "investigar", "desinstalar"],
      preguntas: [
        ["¿Qué borraba los puntos de restauración?", ["Una tarea del «limpiador» que lanzaba vssadmin delete shadows cada noche", "Windows Update al instalar el driver de la impresora", "Un ransomware"]],
        ["¿Qué le recomiendas a Irene, además de quitar el limpiador?", ["Un punto de restauración no es una copia: una copia de sus datos en un disco externo", "Ampliar el espacio de Protección del sistema al 50 %", "Instalar otro limpiador más fiable"]]
      ],
      solucion: "Un «optimizador» (PUP) que, para presumir de espacio liberado, borraba cada noche todas las instantáneas con vssadmin, un programa legítimo de Windows. El desinstalador no se llevaba la tarea. Se desinstala, se desactiva la tarea, se crea un punto nuevo y se le recuerda que un punto de restauración no sustituye a una copia de sus datos."
    },
    {
      id: "pendrive", sesion: "S21", desde: "2026-10-26", equipo: "PC-042", usuario: "sergio", tipo: "gusano",
      titulo: "El pendrive de los accesos directos",
      resumen: "Las carpetas del pendrive se han convertido en accesos directos y el TFG ha desaparecido.",
      orden: [
        "ORDEN DE TRABAJO 2026-1042 · Equipo PC-042",
        "Cliente: Sergio, estudiante (autoriza la revisión de su equipo y de su pendrive).",
        "Avería: al conectar su pendrive (E:) en el ordenador de la biblioteca y luego en casa, sus carpetas han pasado a ser accesos directos de 1 KB.",
        "Hizo doble clic en uno y no se abrió nada. El TFG solo lo tiene ahí. El pendrive está conectado a este equipo.",
        "Encargo: limpiar el equipo y recuperar lo que hay en el pendrive sin perderlo."
      ],
      usb: { carpetas: ["TFG_Sergio", "Apuntes_3º", "Fotos_viaje"], lnk: ["TFG_Sergio.lnk", "Apuntes_3º.lnk", "Fotos_viaje.lnk"] },
      procesos: [
        app_(5870, "chrome.exe", "sergio", 1.4, 300, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "Google LLC", { red: [["142.250.184.4:443", "ESTABLISHED"]] }),
        proc(6344, "wscript.exe", "sergio", 3.8, 14, SYS32 + "wscript.exe", { base: false, amenaza: "gusano", padre: 4420, inicio: "09:00", cmd: "\"C:\\Windows\\System32\\wscript.exe\" //B \"C:\\Users\\sergio\\AppData\\Roaming\\WindowsServices\\helper.vbs\"",
          payload: "C:\\Users\\sergio\\AppData\\Roaming\\WindowsServices\\helper.vbs", vt: "39/72 · Worm:VBS/Jenxcus", red: [["91.92.240.12:8080", "ESTABLISHED"]], detecta: { rapido: true, completo: true, offline: true, kvrt: true },
          nota: ["Cada pocos segundos busca unidades USB, oculta las carpetas, crea accesos directos con su nombre y se copia dentro."] })
      ],
      inicio: [
        { n: 1, lugar: "Run (HKCU)", nombre: "helper", ruta: "wscript.exe //B \"C:\\Users\\sergio\\AppData\\Roaming\\WindowsServices\\helper.vbs\"", editor: "Microsoft Windows", archivo: "C:\\Users\\sergio\\AppData\\Roaming\\WindowsServices\\helper.vbs", lanza: 6344, mala: true, impacto: "Bajo", nota: "wscript.exe es de Windows; el script que ejecuta, en AppData, no." },
        { n: 2, lugar: "Carpeta Inicio", nombre: "helper.lnk", ruta: "C:\\Users\\sergio\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\helper.lnk → helper.vbs", editor: "", firmado: false, archivo: "C:\\Users\\sergio\\AppData\\Roaming\\WindowsServices\\helper.vbs", lanza: 6344, mala: true, impacto: "Bajo" },
        { n: 3, lugar: "Run (HKCU)", nombre: "GoogleChromeAutoLaunch", ruta: "\"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\" --no-startup-window", editor: "Google LLC", lanza: 5870, impacto: "Bajo" }
      ],
      programas: [
        { n: 1, nombre: "Google Chrome", editor: "Google LLC", fecha: "01/09/2025", cliente: true },
        { n: 2, nombre: "Microsoft 365 Educación", editor: "Microsoft Corporation", fecha: "01/09/2025", cliente: true }
      ],
      eventos: [
        ["20/10/2026 18:42", 4688, "Microsoft-Windows-Security-Auditing", "Nuevo proceso: wscript.exe //B E:\\TFG_Sergio.lnk → E:\\WindowsServices\\helper.vbs (doble clic en el pendrive)."],
        ["20/10/2026 18:42", 4657, "Microsoft-Windows-Security-Auditing", "Se modificó el registro: HKCU\\...\\CurrentVersion\\Run\\helper."]
      ],
      extra: [["Carpetas del pendrive visibles otra vez", () => !E.usbOculto && !E.usbPerdido], ["Accesos directos y copia del gusano borrados del pendrive", () => !E.usbLnk && !E.usbScript && !E.usbPerdido]],
      objetivosOrden: ["aislar", "investigar", "neutralizar", "persistencia", "analizar", "extra", "informe"],
      objetivos: { aislar: "Aislar el equipo de la red", investigar: "Encontrar qué toca el pendrive", neutralizar: "Detener el proceso", persistencia: "Quitar lo que lo vuelve a arrancar", analizar: "Analizar el equipo", extra: "Recuperar las carpetas del pendrive", informe: "Entregar el informe" },
      pistas: {
        aislar: "Un gusano también se propaga por la red: red off.",
        investigar: "Mira dir E: (y dir E: /a para lo oculto). Luego busca en tasklist /v quién ejecuta scripts y míralo con proceso <PID>.",
        neutralizar: "Cierra el wscript.exe del script por su PID: taskkill /pid <PID> /f.",
        persistencia: "Arranca por dos sitios: autoruns, y desactivar <nº> en los dos.",
        analizar: "Pasa un análisis: defender rapido (o kvrt). Pondrá el script en cuarentena.",
        extra: "Con el equipo limpio: attrib -h -s -r /s /d E:\\*.* para mostrar las carpetas, y del E:\\*.lnk para borrar los accesos directos falsos. Nunca formatees el pendrive.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      metodo: ["aislar", "investigar", "persistencia", "comprobar"],
      preguntas: [
        ["¿Qué era helper.vbs?", ["Un gusano que se propaga por USB", "Un ransomware que cifró el TFG", "Un archivo de Windows dañado"]],
        ["¿Por qué no se formatea el pendrive para quitar el virus?", ["Porque las carpetas solo estaban ocultas: se recuperan con attrib", "Porque los pendrives no se pueden formatear", "Porque formatear contagia al equipo"]]
      ],
      solucion: "Un gusano en VBScript: ocultaba las carpetas del pendrive y ponía accesos directos con su nombre que lo ejecutaban. Corría con wscript.exe (legítimo) desde AppData y arrancaba por la clave Run y la carpeta Inicio. Se aísla, se cierra por PID, se desactivan las dos entradas, el antivirus pone el script en cuarentena, y con el equipo limpio se muestran las carpetas con attrib y se borran los .lnk. Los datos nunca se perdieron."

    }
  ];

  /* ---------- Estado de la partida ---------- */
  let M = null, E = null, t = null;

  const nuevoEstado = (m) => {
    const sist = m.sistema || {};
    const procesos = base(m.usuario).filter((p) => !(sist.sin || []).includes(p.pid)).map((p) => {
      const q = Object.assign({}, p);
      if (sist.cpu && sist.cpu[p.pid] !== undefined) q.cpu = sist.cpu[p.pid];
      if (sist.red && sist.red[p.pid]) q.red = sist.red[p.pid];
      return q;
    }).concat(m.procesos.map((p) => Object.assign({}, p)));
    const dfn = Object.assign({ activo: true, bloqueado: "", firmasDias: 0 }, m.defender);
    return {
      procesos,
      inicio: m.inicio.map((e) => Object.assign({ activo: true, eliminado: false }, e)),
      programas: (m.programas || []).map((p) => Object.assign({ instalado: true }, p)),
      nav: m.navegador ? {
        buscador: m.navegador.buscadorMalo,
        extensiones: m.navegador.extensiones.map((x) => Object.assign({ quitada: false, desactivada: false }, x)),
        directivas: true
      } : null,
      defender: dfn,
      red: true,
      muertos: new Set(),
      quitados: new Set(),
      vistos: new Set(),
      hechos: new Set(),
      riesgos: [],
      historialDef: [],
      matadosSinVer: 0,
      antes: null,
      firmasAntes: null,
      comandos: 0,
      copiado: false,
      reinstalado: false,
      restaurado: false,
      copiaPerdida: false,
      pagado: false,
      enviado: 0,
      /* El cifrado empezó antes de que llegara el técnico. */
      cifLocal: m.ransom ? Math.round(m.ransom.local * 0.1) : 0,
      cifNas: m.ransom ? Math.round(m.ransom.nas * 0.04) : 0,
      cifTrasAviso: false,
      usbOculto: !!m.usb,
      usbLnk: !!m.usb,
      usbScript: !!m.usb,
      usbPerdido: false,
      pistas: 0,
      respuestas: [],
      pids: null,
      terminado: false
    };
  };

  const riesgo = (clave, puntos, texto) => {
    if (E.riesgos.some((r) => r.clave === clave)) return;
    E.riesgos.push({ clave, puntos, texto });
  };
  const hecho = (k) => E.hechos.add(k);
  const consejo = (texto, clase) => { if (!DIFICIL) t.escribir(texto, clase || "t-suave"); };
  const fallo = (texto, ayuda, clase) => t.escribir(texto + (ayuda && !DIFICIL ? " " + ayuda : ""), clase || "t-error");

  /* Antes de la primera acción de limpieza se apunta cómo estaba el equipo. */
  const accion = () => {
    if (!E.antes) E.antes = { aislado: !E.red, copiado: E.copiado };
  };

  const ruta = (r) => String(r || "").toLowerCase();
  const procPid = (pid) => E.procesos.find((p) => p.pid === pid);
  const programaDe = (p) => E.programas.find((g) => (g.procesos || []).includes(p.pid));
  const vivo = (p) => {
    if (E.muertos.has(p.pid)) return false;
    if (E.reinstalado && !p.base) return false;
    const g = programaDe(p);
    if (g && !g.instalado) return false;
    return true;
  };
  const amenazas = () => E.procesos.filter((p) => p.amenaza && p.amenaza !== "opcional");
  const vivos = () => E.procesos.filter(vivo);
  const archivoDe = (e) => e.archivo || (e.lanza && procPid(e.lanza) ? procPid(e.lanza).ruta : null);
  const entradaViva = (e) => e.activo && !e.eliminado && !(E.reinstalado && (e.mala || !e.microsoft));
  /* ¿Puede esa entrada volver a arrancar su programa? Con descarga, lo baja otra vez si hay Internet. */
  const archivoDisponible = (e, red) => {
    if (e.roto) return false;
    const a = archivoDe(e);
    return !a || !E.quitados.has(ruta(a)) || (e.descarga && red);
  };
  const reinstalaria = (g, red) => red && E.inicio.some((e) => e.reinstala === g.n && entradaViva(e) && archivoDisponible(e, red));
  const volveria = (p, red) => {
    if (E.reinstalado && !p.base) return false;
    const g = programaDe(p);
    if (g && !g.instalado) return reinstalaria(g, red);
    return E.inicio.some((e) => e.lanza === p.pid && entradaViva(e) && archivoDisponible(e, red));
  };
  const directivasActivas = () => !!(E.nav && E.nav.directivas);
  const programaPup = (g) => g.pup;

  /* Lo que hay que neutralizar en este escenario, con cómo se comprueba (suponiendo que el cliente vuelve a conectarlo a Internet). */
  const objetivosLimpiar = () => {
    const l = [];
    amenazas().forEach((p) => l.push([p.nombre + " (PID " + p.pid + ")", () => !vivo(p) && !volveria(p, true)]));
    E.inicio.filter((e) => e.mala && !(M.rootkit && M.rootkit.entrada === e.n)).forEach((e) => l.push(["Entrada de inicio «" + e.nombre + "»", () => !entradaViva(e)]));
    E.programas.filter(programaPup).forEach((g) => l.push(["Programa «" + g.nombre + "»", () => !g.instalado && !reinstalaria(g, true) || E.reinstalado]));
    if (E.nav) {
      E.nav.extensiones.filter((x) => x.mala).forEach((x) => l.push(["Extensión «" + x.nombre + "»", () => E.reinstalado || x.quitada && !(x.forzada && directivasActivas())]));
      l.push(["Buscador de Chrome", () => E.reinstalado || !E.nav.buscador && !directivasActivas()]);
    }
    if (M.rootkit) l.push(["Rootkit en el arranque", () => E.reinstalado]);
    if (M.ransom) l.push(["Datos restaurados desde la copia", () => E.restaurado && !E.copiaPerdida]);
    (M.extra || []).forEach((x) => l.push(x));
    return l;
  };
  const limpio = () => objetivosLimpiar().every(([, ok]) => ok());

  /* ---------- Rutas de Windows sobre el sistema de archivos del motor ---------- */
  const aRuta = (s) => String(s).replace(/\\/g, "/").replace(/^[cC]:/, "") || "/";
  const aWin = (r) => "C:" + (r === "/" ? "\\" : r.replace(/\//g, "\\"));

  const construir = () => {
    const raiz = {};
    const poner = (rutaWin, nodo) => {
      const partes = aRuta(rutaWin).split("/").filter(Boolean);
      let d = raiz;
      partes.forEach((p, i) => {
        if (i === partes.length - 1) { if (nodo) d[p] = d[p] && d[p].tipo === "dir" ? d[p] : nodo; else d[p] = d[p] || dir({}); }
        else { if (!d[p] || d[p].tipo !== "dir") d[p] = dir({}); d = d[p].hijos; }
      });
    };
    const casa = "C:\\Users\\" + M.usuario;
    ["C:\\Windows\\System32\\drivers", "C:\\Program Files", "C:\\Program Files (x86)", "C:\\ProgramData", casa + "\\Documents", casa + "\\Downloads", casa + "\\Desktop", casa + "\\AppData\\Local\\Temp", casa + "\\AppData\\Roaming"].forEach((d) => poner(d, null));
    poner(casa + "\\orden_trabajo.txt", archivo(() => M.orden));
    poner("C:\\Windows\\System32\\drivers\\etc\\hosts", archivo(["# Copyright (c) 1993-2009 Microsoft Corp.", "#", "# Archivo HOSTS usado por Windows. Cada línea: dirección IP y nombre.", "#", "# 127.0.0.1       localhost", "# ::1             localhost"]));
    const exe = archivo(["(ejecutable: no se puede mostrar como texto)"]);
    if (!E.reinstalado) {
      E.procesos.forEach((p) => { if (/^[A-Z]:\\/.test(p.ruta) && !E.quitados.has(ruta(p.ruta))) poner(p.ruta, exe); });
      E.inicio.forEach((e) => { const a = archivoDe(e); if (a && !e.roto && !e.eliminado && !E.quitados.has(ruta(a))) poner(a, exe); });
      (M.archivos || []).forEach(([r, c]) => poner(r, archivo(c)));
    } else {
      E.procesos.filter((p) => p.base && /^[A-Z]:\\/.test(p.ruta)).forEach((p) => poner(p.ruta, exe));
    }
    if (M.datos) M.datos.forEach((d) => { const r = casa + "\\" + d.replace(/\//g, "\\").replace(/\\$/, ""); if (d.endsWith("/")) poner(r, null); else poner(r, archivo(() => ["(archivo personal del cliente)"], { clase: "t-cliente" })); });
    if (M.ransom) {
      const docs = ["Clientes_2026.xlsx", "Modelo303_T3.pdf", "Nominas_septiembre.pdf", "Contratos_alquiler.docx", "Escrituras_Garcia.pdf", "Renta_2025_clientes.xlsx", "Facturas_emitidas.xlsx", "Plantilla_presupuesto.docx"];
      const frac = E.restaurado ? 0 : E.cifLocal / M.ransom.local;
      docs.forEach((nombre, i) => {
        const cifrado = frac > i / docs.length;
        poner(casa + "\\Documents\\" + nombre + (cifrado ? ".lockbit" : ""), archivo(() => [cifrado ? "(contenido cifrado: ilegible)" : "(documento de la gestoría)"], { clase: cifrado ? "t-error" : "t-cliente" }));
      });
      if (E.cifLocal > 0 && !E.restaurado) {
        const nota = archivo(["~~~ LockBit 3.0 ~~~", "Tus archivos han sido cifrados y copiados.", "Para recuperarlos, paga 0,05 BTC en 72 horas a la dirección bc1q…7x4.", "Si contactas con la policía o restauras copias, publicaremos tus datos.", "Tu ID de descifrado: 7F2A-91C4-E0B3"], { clase: "t-error" });
        poner(casa + "\\Documents\\README.txt", nota);
        poner(casa + "\\Desktop\\README.txt", nota);
      }
    }
    return raiz;
  };

  /* ---------- Paso del tiempo: lo que pasa mientras el alumno escribe ---------- */
  const tic = () => {
    E.comandos++;
    E.procesos.filter((p) => p.transitorio && vivo(p)).forEach((p) => { p.transitorio--; if (p.transitorio <= 0) E.muertos.add(p.pid); });
    if (M.ransom && !E.reinstalado) {
      const r = vivos().find((p) => p.amenaza === "ransomware");
      if (r) {
        const antes = E.cifLocal;
        E.cifLocal = Math.min(M.ransom.local, E.cifLocal + Math.round(M.ransom.local * M.ransom.ritmoLocal));
        if (E.red) E.cifNas = Math.min(M.ransom.nas, E.cifNas + Math.round(M.ransom.nas * M.ransom.ritmoNas));
        if (E.cifLocal > antes && !E.cifTrasAviso) {
          E.cifTrasAviso = true;
          consejo("Mientras investigas, el cifrado sigue avanzando" + (E.red ? ", también en la unidad Z: del NAS." : "."), "t-aviso");
        }
      }
    }
    if (M.usb && !E.usbPerdido && vivos().some((p) => p.amenaza === "gusano")) { E.usbOculto = true; E.usbLnk = true; E.usbScript = true; }
    const espia = vivos().find((p) => p.amenaza === "spyware");
    if (espia && E.red && !E.reinstalado) E.enviado += 3;
  };

  /* ---------- Reinicio: vuelve lo legítimo y lo que tenga quien lo arranque ---------- */
  const reiniciar = async (texto) => {
    await t.progreso(texto || "Reiniciando Windows", 1500);
    E.procesos.forEach((p) => {
      if (p.transitorio !== undefined) { E.muertos.add(p.pid); return; }
      if (!p.amenaza || p.amenaza === "opcional") { E.muertos.delete(p.pid); return; }
      if (volveria(p, E.red)) {
        E.muertos.delete(p.pid);
        const g = programaDe(p);
        if (g && !g.instalado) reinstalarPrograma(g);
        E.inicio.filter((e) => e.lanza === p.pid && e.descarga).forEach((e) => E.quitados.delete(ruta(archivoDe(e))));
      } else E.muertos.add(p.pid);
    });
    /* Un programa no deseado que se ha ido puede volver por su tarea de reparación. */
    E.programas.filter((g) => !g.instalado && reinstalaria(g, E.red)).forEach(reinstalarPrograma);
    t.escribir("Windows se ha reiniciado.", "t-ok");
    if (limpio()) hecho("comprobar");
  };

  const reinstalarPrograma = (g) => {
    if (g.instalado) return;
    g.instalado = true;
    (g.procesos || []).forEach((pid) => E.muertos.delete(pid));
    (g.inicio || []).forEach((n) => { const e = E.inicio.find((x) => x.n === n); e.eliminado = false; e.activo = true; });
    if (g.directivas && E.nav) {
      E.nav.directivas = true;
      E.nav.buscador = M.navegador.buscadorMalo;
      E.nav.extensiones.filter((x) => x.forzada).forEach((x) => { x.quitada = false; x.desactivada = false; });
    }
    t.escribir("Al iniciar sesión, la tarea " + (E.inicio.find((e) => e.reinstala === g.n) || {}).nombre + " ha descargado e instalado otra vez «" + g.nombre + "».", "t-error");
  };

  /* Un proceso crítico cerrado tumba Windows. */
  const pantallazo = async (p) => {
    t.escribir("");
    t.escribir(":(  Tu dispositivo ha tenido un problema y debe reiniciarse.", "t-error");
    t.escribir("Código de detención: CRITICAL_PROCESS_DIED (0x000000EF)", "t-error");
    t.escribir("Qué ha fallado: " + p.nombre, "t-error");
    riesgo("bsod", 8, "Cerraste " + p.nombre + " (PID " + p.pid + "), un proceso crítico de Windows: pantallazo azul y reinicio.");
    await reiniciar("Recopilando información del error y reiniciando");
    consejo("Los procesos del sistema (csrss, wininit, services, lsass, smss y los svchost de System32) no se cierran nunca.", "t-aviso");
  };

  /* ---------- Comandos ---------- */
  const firmaTexto = (x) => (x.firmado === false || !x.editor ? "(sin firma)" : x.editor + " (firma verificada)");
  const carpetaSospechosa = (r) => /\\appdata\\|\\temp\\|\\programdata\\(?!microsoft)/i.test(r || "");
  const lugarDe = (e) => e.lugar;

  const registrarComandos = () => {
    Terminal.basicos(t, {
      grupos: [
        ["Investigar", ["tasklist", "proceso", "netstat", "autoruns", "schtasks", "reg", "sc", "eventos", "programas", "virustotal", "navegador", "dir", "type"]],
        ["Responder", ["red", "taskkill", "desactivar", "activar", "desinstalar", "defender", "kvrt", "copiar", "contrasenas", "reiniciar", "reinstalar", "restaurar", "nomoreransom", "attrib", "del"]],
        ["Terminar", ["pista", "informe"]],
        ["Terminal", ["help", "clear", "history", "cd", "pwd"]]
      ]
    });
    /* dir, type y cd con rutas de Windows (C:\Users\…). */
    const ls = t.comandos.ls, cat = t.comandos.cat, cd = t.comandos.cd;
    delete t.comandos.ls; delete t.comandos.cat;
    const conRutas = (f) => (args, l) => f(args.map((a) => (/^[a-z]:|\\/i.test(a) ? aRuta(a) : a)), l);
    const dirNormal = conRutas((a, l) => {
      if (/^[d-z]:/i.test(a[0] || "")) return t.escribir("dir: la unidad " + a[0].slice(0, 2).toUpperCase() + " no está disponible en este equipo.", "t-error");
      return ls.ejecutar(a.filter((x) => !/^\/[a-z]$/i.test(x)), l);
    });
    const dirUsb = (todo) => {
      const u = M.usb;
      t.escribir("Directorio de E:\\ (pendrive de " + M.usuario + ")", "t-titulo");
      if (E.usbPerdido) return t.escribir("(vacío: unidad formateada)", "t-error");
      const l = [];
      u.carpetas.forEach((c) => { if (!E.usbOculto) l.push([c + "\\", "t-dir"]); else if (todo) l.push([c + "\\  <oculta, sistema>", "t-suave"]); });
      if (E.usbLnk) u.lnk.forEach((c) => l.push([c + "  (acceso directo, 1 KB)", "t-aviso"]));
      if (E.usbScript && (todo || !E.usbOculto)) l.push(["WindowsServices\\" + (E.usbOculto ? "  <oculta, sistema>" : ""), "t-error"]);
      l.forEach(([txt, c]) => t.escribir(txt, c));
      if (!todo && E.usbOculto) consejo("dir /a muestra también lo oculto.");
      hecho("verUsb");
    };
    t.registrar("dir", Object.assign({}, ls, { resumen: "Lista los archivos y carpetas (dir /a muestra también lo oculto).", uso: "dir [/a] [carpeta]", ejemplos: ["dir", "dir Downloads", "dir C:\\ProgramData"].concat(M.usb ? ["dir E: /a"] : []), alias: ["ls"], ejecutar: (args, l) => {
      const destino = args.find((x) => !/^\/[a-z]+$/i.test(x)) || "";
      if (M.usb && /^e:/i.test(destino)) return dirUsb(args.some((x) => /^\/a/i.test(x)));
      return dirNormal(args, l);
    } }));
    t.registrar("type", Object.assign({}, cat, { resumen: "Muestra el contenido de un archivo de texto.", uso: "type <archivo>", ejemplos: ["type orden_trabajo.txt", "type C:\\Windows\\System32\\drivers\\etc\\hosts"], alias: ["cat"], ejecutar: conRutas(cat.ejecutar) }));
    cd.ejecutar = conRutas(cd.ejecutar);
    cd.ejemplos = ["cd Downloads", "cd ..", "cd C:\\ProgramData"];
    t.comandos.pwd.ejecutar = () => t.escribir(aWin(t.cwd));

    t.registrar("tasklist", {
      resumen: "Lista los procesos en marcha (como el Administrador de tareas).",
      uso: "tasklist [/v] [/cpu]",
      detalle: ["/v añade la ruta del ejecutable y el editor (quién lo firma).", "/cpu ordena de más a menos uso de CPU."],
      ejemplos: ["tasklist", "tasklist /v", "tasklist /cpu"],
      alias: ["procesos", "ps", "get-process"],
      ejecutar(args) {
        const a = args.map((x) => x.toLowerCase());
        const v = a.includes("/v") || a.includes("-v");
        const porCpu = a.includes("/cpu") || a.includes("-cpu");
        const lista = vivos().slice().sort((x, y) => (porCpu ? y.cpu - x.cpu : x.pid - y.pid));
        const filas = [["Nombre", "PID", "Usuario", "CPU", "Memoria"].concat(v ? ["Editor", "Ruta"] : [])];
        lista.forEach((p) => filas.push([p.nombre, p.pid, p.usuario, p.cpu.toFixed(1).replace(".", ",") + " %", fmt(Math.round(p.mem)) + " MB"].concat(v ? [p.firmado === false || !p.editor ? "(sin firma)" : p.editor, p.ruta] : [])));
        t.tabla(filas);
        const total = Math.min(100, lista.reduce((s, p) => s + p.cpu, 0));
        t.escribir(lista.length + " procesos · CPU total " + Math.round(total) + " %", "t-suave");
        hecho("verProcesos");
        if (!v) consejo("Con tasklist /v ves la ruta y quién firma cada uno. Para uno concreto: proceso <PID>.");
      }
    });

    t.registrar("proceso", {
      resumen: "Muestra todo sobre un proceso: ruta, firma, padre, línea de comandos y conexiones.",
      uso: "proceso <PID>",
      ejemplos: ["proceso 1340"],
      alias: ["info", "process"],
      ejecutar(args) {
        const pid = Number(args[0]);
        if (!args[0]) return t.usoIncorrecto("proceso", "Falta el PID del proceso.");
        const p = procPid(pid);
        if (!p || !vivo(p)) return fallo("proceso: no hay ningún proceso con PID " + args[0] + ".", "Mira los PID con tasklist.");
        E.vistos.add(pid);
        const padre = p.padreNombre || (procPid(p.padre) ? procPid(p.padre).nombre + " (" + p.padre + ")" : p.padre === 4396 ? "userinit.exe (ya terminado)" : p.padre ? "(ya terminado)" : "—");
        t.escribir(p.nombre + " · PID " + p.pid, "t-titulo");
        t.lineas([
          "Ruta:             " + p.ruta,
          "Línea de órdenes: " + (p.cmd !== undefined ? p.cmd || "—" : p.ruta),
          "Proceso padre:    " + padre,
          "Usuario:          " + p.usuario,
          "Iniciado:         hoy a las " + p.inicio,
          "CPU / memoria:    " + p.cpu.toFixed(1).replace(".", ",") + " % · " + fmt(Math.round(p.mem)) + " MB"
        ]);
        t.escribir([["Firma:            ", ""], [firmaTexto(p), p.firmado === false || !p.editor ? "t-error" : "t-ok"]]);
        const con = (p.red || []);
        t.escribir("Conexiones:       " + (con.length ? con.map((c) => c[0] + (E.red ? " (" + c[1] + ")" : " (SYN_SENT: sin red)")).join(", ") : "ninguna"));
        (p.nota || []).forEach((n) => t.escribir(n, "t-aviso"));
        if (p.critico) consejo("Es un proceso crítico de Windows: cerrarlo provoca un pantallazo azul.", "t-suave");
        else if (carpetaSospechosa(p.ruta) && (p.firmado === false || !p.editor)) consejo("Un ejecutable sin firma en AppData, Temp o ProgramData merece atención: no siempre es malware, pero es el primer sitio donde mirar.", "t-aviso");
        else if (p.nombre === "svchost.exe" && !/system32/i.test(p.ruta)) consejo("El svchost.exe de verdad solo vive en C:\\Windows\\System32.", "t-aviso");
      }
    });

    t.registrar("netstat", {
      resumen: "Muestra las conexiones de red abiertas y el PID que las usa.",
      uso: "netstat [-ano]",
      ejemplos: ["netstat -ano"],
      ejecutar() {
        const filas = [["Proto", "Dirección local", "Dirección remota", "Estado", "PID"]];
        let puerto = 52100;
        vivos().forEach((p) => (p.red || []).forEach(([remota, estado]) => {
          filas.push(["TCP", "192.168.1.34:" + (puerto += 7), remota, E.red ? estado : "SYN_SENT", p.pid]);
        }));
        if (filas.length === 1) t.escribir("No hay conexiones abiertas.", "t-suave"); else t.tabla(filas);
        if (!E.red) t.escribir("El equipo está aislado: las conexiones se quedan en SYN_SENT (lo intentan, pero no salen).", "t-suave");
        hecho("verRed");
        consejo("Cruza el PID con tasklist o con proceso <PID>. Un proceso de sistema que habla con una IP de fuera merece atención.");
      }
    });

    /* Autoruns y sus vistas parciales: tareas, Run y servicios. */
    const filaInicio = (e) => {
      const falta = e.roto || !archivoDisponible(e, false);
      const sinFirma = e.firmado === false || !e.editor;
      const clase = falta ? "t-aviso" : sinFirma ? "t-rosa" : "";
      t.escribir([[("#" + e.n).padEnd(4) + (e.activo ? "[x] " : "[ ] "), "t-suave"], [e.lugar.padEnd(18), "t-suave"], [e.nombre + "  ", clase || "t-cmd"], [sinFirma ? "(sin editor)" : e.editor, sinFirma ? "t-rosa" : "t-suave"]]);
      t.escribir([["        " + e.ruta + (falta ? "  ← archivo no encontrado" : ""), clase || "t-suave"]]);
    };
    const listarInicio = (filtro, titulo, todo) => {
      const lista = E.inicio.filter((e) => !e.eliminado && !(E.reinstalado && !e.microsoft) && filtro(e) && (todo || !e.microsoft));
      t.escribir(titulo, "t-titulo");
      if (!lista.length) return t.escribir("(nada)", "t-suave");
      lista.forEach(filaInicio);
      lista.filter((e) => e.nota && !DIFICIL).forEach((e) => t.escribir("#" + e.n + ": " + e.nota, "t-suave"));
      hecho("verInicio");
    };
    t.registrar("autoruns", {
      resumen: "Muestra todo lo que arranca solo: Run, tareas, servicios y controladores.",
      uso: "autoruns [--todo]",
      detalle: ["Oculta lo firmado por Microsoft, salvo con --todo. [x] = activo.", "Rosa: sin editor o sin firma. Amarillo: apunta a un archivo que ya no existe.", "Se desactiva con desactivar <nº> (se puede deshacer con activar <nº>)."],
      ejemplos: ["autoruns", "autoruns --todo"],
      ejecutar(args) {
        const todo = args.some((a) => /todo|all|-a/i.test(a));
        listarInicio(() => true, "Autoruns · " + (todo ? "todas las entradas" : "sin las entradas de Microsoft"), todo);
        if (!DIFICIL) t.escribir([["Leyenda: ", "t-suave"], ["rosa", "t-rosa"], [" = sin firma o sin editor · ", "t-suave"], ["amarillo", "t-aviso"], [" = el archivo no existe", "t-suave"]]);
      }
    });
    t.registrar("schtasks", {
      resumen: "Lista las tareas programadas que no son de Windows.",
      uso: "schtasks [/query]",
      ejemplos: ["schtasks /query"],
      ejecutar() { listarInicio((e) => e.lugar === "Tarea programada", "Programador de tareas", true); }
    });
    t.registrar("reg", {
      resumen: "Consulta las claves Run del registro (lo que se abre al iniciar sesión).",
      uso: "reg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      ejemplos: ["reg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", "reg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"],
      ejecutar(args) {
        if ((args[0] || "").toLowerCase() !== "query" || !args[1]) return t.usoIncorrecto("reg", "Este simulador solo deja consultar (query) una clave Run.");
        const k = args[1].toUpperCase();
        const hive = k.startsWith("HKCU") ? "HKCU" : k.startsWith("HKLM") ? "HKLM" : null;
        if (!hive || !/\\RUN$/.test(k)) return fallo("reg: solo se pueden consultar las claves Run.", "Mira help reg.");
        listarInicio((e) => e.lugar === "Run (" + hive + ")", hive + "\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", true);
      }
    });
    t.registrar("sc", {
      resumen: "Lista los servicios y controladores que no son de Windows.",
      uso: "sc query",
      ejemplos: ["sc query"],
      alias: ["services"],
      ejecutar() { listarInicio((e) => e.lugar === "Servicio" || e.lugar === "Controlador", "Servicios y controladores", false); }
    });

    const entrada = (txt) => E.inicio.find((e) => String(e.n) === String(txt).replace(/^#/, "") && !e.eliminado && !(E.reinstalado && !e.microsoft));
    t.registrar("desactivar", {
      resumen: "Desactiva una entrada de inicio (quita la casilla en Autoruns).",
      uso: "desactivar <nº de autoruns>",
      detalle: "Se puede deshacer con activar <nº>. Primero se desactiva; borrar no hace falta.",
      ejemplos: ["desactivar 3"],
      ejecutar(args) {
        if (!args[0]) return t.usoIncorrecto("desactivar", "Falta el número de la entrada (columna # de autoruns).");
        const e = entrada(args[0]);
        if (!e) return fallo("desactivar: no hay ninguna entrada #" + args[0].replace(/^#/, "") + ".", "Mira los números con autoruns.");
        if (!e.activo) return t.escribir("La entrada #" + e.n + " ya está desactivada.", "t-suave");
        accion();
        if (M.rootkit && M.rootkit.entrada === e.n) {
          t.escribir("Acceso denegado. Al refrescar, la entrada #" + e.n + " vuelve a estar activa.", "t-error");
          consejo("Algo protege esa entrada desde dentro del sistema: cuando Windows ya no puede vigilarse a sí mismo, no se sigue limpiando.", "t-aviso");
          return;
        }
        e.activo = false;
        t.escribir("Entrada #" + e.n + " «" + e.nombre + "» desactivada. Se aplica en el próximo inicio.", "t-ok");
        if (e.microsoft) riesgo("microsoft" + e.n, 8, "Desactivaste «" + e.nombre + "», una entrada de Microsoft que Windows necesita.");
        else if (!e.mala) riesgo("legit" + e.n, 5, "Desactivaste «" + e.nombre + "», que era legítimo" + (e.cliente ? " y el cliente usa." : "."));
        if (e.mala && e.lanza && procPid(e.lanza) && vivo(procPid(e.lanza))) consejo("El proceso sigue en marcha: desactivar evita que vuelva, pero no lo cierra.");
      }
    });
    t.registrar("activar", {
      resumen: "Vuelve a activar una entrada de inicio desactivada.",
      uso: "activar <nº de autoruns>",
      ejemplos: ["activar 3"],
      ejecutar(args) {
        const e = args[0] && entrada(args[0]);
        if (!e) return t.usoIncorrecto("activar", "Falta un número de entrada válido.");
        if (e.activo) return t.escribir("La entrada #" + e.n + " ya está activa.", "t-suave");
        e.activo = true;
        E.riesgos = E.riesgos.filter((r) => r.clave !== "microsoft" + e.n && r.clave !== "legit" + e.n);
        t.escribir("Entrada #" + e.n + " «" + e.nombre + "» activada otra vez.", "t-ok");
      }
    });

    t.registrar("taskkill", {
      resumen: "Cierra procesos por PID o por nombre.",
      uso: "taskkill /pid <PID> [/pid <PID>…] [/f] [/t] | taskkill /im <nombre> [/f]",
      detalle: ["/f fuerza el cierre. /t cierra también los procesos hijos.", "Por nombre (/im) se cierran todos los que se llamen igual."],
      ejemplos: ["taskkill /pid 4321 /f", "taskkill /im notepad.exe /f"],
      alias: ["kill", "stop-process"],
      async ejecutar(args) {
        const objetivos = [];
        let arbol = false;
        for (let i = 0; i < args.length; i++) {
          const a = args[i].toLowerCase();
          if ((a === "/pid" || a === "-pid" || a === "-id") && args[i + 1]) { const p = procPid(Number(args[++i])); if (p && vivo(p)) objetivos.push(p); else t.escribir("ERROR: no se encontró el proceso con PID " + args[i] + ".", "t-error"); }
          else if ((a === "/im" || a === "-name") && args[i + 1]) {
            const n = args[++i].toLowerCase();
            const l = vivos().filter((p) => p.nombre.toLowerCase() === n);
            if (!l.length) t.escribir("ERROR: no se encontró el proceso «" + args[i] + "».", "t-error");
            objetivos.push(...l);
          } else if (a === "/t") arbol = true;
        }
        if (!objetivos.length) return args.length ? undefined : t.usoIncorrecto("taskkill", "Falta qué proceso cerrar.");
        if (arbol) objetivos.slice().forEach((p) => vivos().filter((h) => h.padre === p.pid && !objetivos.includes(h)).forEach((h) => objetivos.push(h)));
        accion();
        for (const p of objetivos) {
          if (p.protegido) { t.escribir("ERROR: no se pudo terminar el proceso «" + p.nombre + "» (PID " + p.pid + "). Acceso denegado.", "t-error"); continue; }
          if (p.critico) { await pantallazo(p); return; }
          if (!E.vistos.has(p.pid)) E.matadosSinVer++;
          E.muertos.add(p.pid);
          t.escribir("CORRECTO: se terminó el proceso «" + p.nombre + "» con PID " + p.pid + ".", "t-ok");
          if (!p.amenaza) {
            if (p.nombre === "explorer.exe") { t.escribir("El escritorio y la barra de tareas desaparecen y Windows vuelve a abrir explorer.exe.", "t-suave"); E.muertos.delete(p.pid); }
            else riesgo("cerrar" + p.pid, 4, "Cerraste " + p.nombre + " (PID " + p.pid + "), un proceso legítimo.");
          } else if (p.amenaza !== "opcional" && volveria(p, true)) consejo("Cerrado, pero si algo lo arranca solo volverá en el próximo inicio. Revisa autoruns.", "t-aviso");
        }
      }
    });

    t.registrar("red", {
      resumen: "Desconecta (off) o vuelve a conectar (on) el cable y el Wi-Fi.",
      uso: "red off | red on | red estado",
      ejemplos: ["red off", "red estado"],
      alias: ["aislar"],
      ejecutar(args, linea) {
        const sub = (args[0] || (/^aislar/i.test(linea) ? "off" : "estado")).toLowerCase();
        if (sub === "estado") return t.escribir(E.red ? "Conectado: Ethernet y Wi-Fi activos." : "Aislado: cable quitado y Wi-Fi desactivado.", E.red ? "t-aviso" : "t-ok");
        if (sub === "off") {
          if (!E.red) return t.escribir("El equipo ya está aislado.", "t-suave");
          E.red = false;
          hecho("aislar");
          t.escribir("Cable de red quitado y Wi-Fi desactivado. El equipo está aislado.", "t-ok");
          if (M.ransom) consejo("La unidad Z: del NAS ya no está accesible desde este equipo.");
          return;
        }
        if (sub === "on") {
          if (E.red) return t.escribir("El equipo ya está conectado.", "t-suave");
          E.red = true;
          t.escribir("Equipo conectado otra vez a la red.", "t-aviso");
          if (vivos().some((p) => p.amenaza && p.amenaza !== "opcional" && p.amenaza !== "pup")) consejo("Con una amenaza aún activa, conectar la red es arriesgado.", "t-aviso");
          return;
        }
        t.usoIncorrecto("red", "No conozco la opción «" + args[0] + "».");
      }
    });

    t.registrar("eventos", {
      resumen: "Muestra los eventos importantes del Visor de eventos.",
      uso: "eventos [Id]",
      ejemplos: ["eventos", "eventos 7000"],
      alias: ["eventvwr", "get-winevent", "wevtutil"],
      ejecutar(args) {
        const id = Number((args.find((a) => /^\d+$/.test(a))) || 0);
        const lista = (M.eventos || []).filter((e) => !id || e[0] === id || e[1] === id).sort((a, b) => b[0].localeCompare(a[0]));
        hecho("verEventos");
        if (!lista.length) return t.escribir(id ? "No hay eventos con Id. " + id + "." : "No hay eventos relevantes.", "t-suave");
        t.escribir("Visor de eventos · " + (id ? "Id. " + id : "eventos importantes"), "t-titulo");
        lista.forEach(([f, n, o, txt]) => t.escribir([[f + "  ", "t-suave"], [String(n).padEnd(6), "t-cmd"], [o + ": ", "t-suave"], [txt, ""]]));
      }
    });

    t.registrar("programas", {
      resumen: "Lista los programas instalados con su fecha (Aplicaciones instaladas).",
      uso: "programas",
      alias: ["appwiz", "appwiz.cpl"],
      ejecutar() {
        const l = E.programas.filter((g) => g.instalado && !E.reinstalado);
        if (!l.length) return t.escribir(E.reinstalado ? "Windows recién instalado: aún no hay programas del cliente." : "(ninguno)", "t-suave");
        t.tabla([["Nº", "Programa", "Editor", "Instalado"]].concat(l.map((g) => ["#" + g.n, g.nombre, g.editor || "(desconocido)", g.fecha])));
        consejo("Fíjate en lo que se instaló justo cuando empezó el problema. Se desinstala con desinstalar <nº>.");
      }
    });
    t.registrar("desinstalar", {
      resumen: "Desinstala un programa (con sus procesos y su inicio).",
      uso: "desinstalar <nº de programas>",
      ejemplos: ["desinstalar 2"],
      alias: ["uninstall"],
      async ejecutar(args) {
        if (!args[0]) return t.usoIncorrecto("desinstalar", "Falta el número del programa (mira programas).");
        const g = E.programas.find((x) => String(x.n) === args[0].replace(/^#/, "") && x.instalado && !E.reinstalado);
        if (!g) return fallo("desinstalar: no hay ningún programa #" + args[0] + ".", "Mira los números con programas.");
        accion();
        await t.progreso("Desinstalando " + g.nombre, 1000);
        g.instalado = false;
        (g.procesos || []).forEach((pid) => E.muertos.add(pid));
        (g.inicio || []).forEach((n) => { const e = E.inicio.find((x) => x.n === n); if (e) e.eliminado = true; });
        if (g.directivas && E.nav) { E.nav.directivas = false; t.escribir("Se han eliminado las directivas de Chrome que había creado.", "t-ok"); }
        t.escribir("«" + g.nombre + "» desinstalado.", "t-ok");
        if (g.av && !E.programas.some((x) => x.av && x.instalado)) { E.defender.activo = true; E.defender.bloqueado = ""; t.escribir("Ya no queda ningún antivirus de terceros: Microsoft Defender vuelve a activarse solo.", "t-ok"); }
        if (g.av && E.programas.some((x) => x.av && x.instalado)) consejo("Queda un solo antivirus en tiempo real.");
        if (g.av && g.cliente) riesgo("prog" + g.n, 4, "Desinstalaste «" + g.nombre + "», el antivirus que el cliente había pagado y quería conservar.");
        if (!g.pup && !g.neutro && !g.av) riesgo("prog" + g.n, g.cliente ? 6 : 4, "Desinstalaste «" + g.nombre + "», que era legítimo" + (g.cliente ? " y el cliente usa." : "."));
        const resto = E.inicio.find((e) => e.reinstala === g.n && entradaViva(e));
        if (resto) consejo("Ojo: la desinstalación no siempre lo quita todo. Revisa autoruns.", "t-aviso");
      }
    });

    t.registrar("virustotal", {
      resumen: "Consulta el hash de un ejecutable en VirusTotal (desde el equipo del taller).",
      uso: "virustotal <PID> | virustotal #<nº de autoruns>",
      ejemplos: ["virustotal 1340", "virustotal #2"],
      alias: ["vt"],
      ejecutar(args) {
        if (!args[0]) return t.usoIncorrecto("virustotal", "Falta el PID o el número de autoruns.");
        let cosa, vt;
        if (args[0].startsWith("#")) {
          const e = entrada(args[0]);
          if (!e) return fallo("virustotal: no hay ninguna entrada " + args[0] + ".", "Mira los números con autoruns.");
          if (e.roto) return t.escribir("virustotal: el archivo de la entrada #" + e.n + " no existe: no hay nada que consultar.", "t-aviso");
          const p = e.lanza && procPid(e.lanza);
          cosa = archivoDe(e) || e.ruta;
          vt = (p && p.vt) || (e.mala ? (M.rootkit && M.rootkit.entrada === e.n ? "44/72 · Rootkit.Agent" : "12/72 · PUP.Optional") : "0/72");
        } else {
          const p = procPid(Number(args[0]));
          if (!p || !vivo(p)) return fallo("virustotal: no hay ningún proceso con PID " + args[0] + ".", "Mira los PID con tasklist.");
          E.vistos.add(p.pid);
          cosa = p.ruta;
          vt = p.vt || "0/72";
        }
        t.escribir((E.red ? "" : "(Este equipo está aislado: el hash SHA-256 se consulta desde el portátil del taller.) ") + cosa, "t-suave");
        const malos = Number(vt.split("/")[0]);
        t.escribir("VirusTotal: " + vt + (malos ? " detecciones" : " · ningún antivirus lo detecta"), malos > 20 ? "t-error" : malos ? "t-aviso" : "t-ok");
        if (malos && malos < 15) consejo("Pocas detecciones y nombres tipo PUP o Adware: programa no deseado, no un virus clásico.");
      }
    });

    /* ---------- Antivirus ---------- */
    const firmasOk = () => E.defender.firmasDias <= 1;
    const examen = async (tipo) => {
      const nombres = { rapido: "Examen rápido de Microsoft Defender", completo: "Examen completo de Microsoft Defender", offline: "Examen de Microsoft Defender sin conexión", kvrt: "Kaspersky Virus Removal Tool (a demanda)" };
      if ((tipo === "rapido" || tipo === "completo") && !E.defender.activo && !E.reinstalado) {
        return fallo("Defender: no se puede iniciar el examen. " + (E.defender.bloqueado || "La protección está desactivada."), "El examen sin conexión no depende de Windows.");
      }
      accion();
      if (E.firmasAntes === null && tipo !== "kvrt") E.firmasAntes = firmasOk();
      if (tipo === "offline") t.escribir("Se reinicia el equipo en el entorno de Microsoft Defender sin conexión (fuera de Windows)…", "t-suave");
      if (tipo === "kvrt") t.escribir("KVRT descargado hoy en el equipo del taller y copiado por USB: firmas del día, no se instala.", "t-suave");
      await t.progreso(nombres[tipo], tipo === "completo" ? 2600 : tipo === "offline" ? 2200 : 1600);
      const firmas = tipo === "kvrt" || firmasOk();
      const hallados = [];
      E.procesos.filter((p) => p.amenaza && p.amenaza !== "opcional" && !E.quitados.has(ruta(p.payload || p.ruta)) && !E.reinstalado).forEach((p) => {
        const d = p.detecta || {};
        const ve = tipo === "completo" ? (d.completo || d.rapido) : d[tipo];
        if (!ve || (p.firmasNuevas && !firmas)) return;
        if (programaDe(p) && !programaDe(p).instalado) return;
        hallados.push(p.vt ? p.vt.split("· ")[1] : p.nombre);
        E.quitados.add(ruta(p.payload || p.ruta));
        E.muertos.add(p.pid);
        t.escribir("Amenaza: " + (p.vt ? p.vt.split("· ")[1] : "Malware") + " · " + (p.payload || p.ruta) + " → en cuarentena", "t-error");
        if (M.usb && E.usbScript && !E.usbPerdido) { E.usbScript = false; t.escribir("Amenaza: " + (p.vt ? p.vt.split("· ")[1] : "Malware") + " · E:\\WindowsServices\\helper.vbs → en cuarentena", "t-error"); }
      });
      E.inicio.filter((e) => e.mala && e.detecta && entradaViva(e) && !e.roto && !E.quitados.has(ruta(archivoDe(e)))).forEach((e) => {
        if (!e.detecta[tipo]) return;
        hallados.push(e.nombre);
        E.quitados.add(ruta(archivoDe(e)));
        t.escribir("Amenaza: PUP " + e.nombre + " · " + archivoDe(e) + " → en cuarentena", "t-error");
      });
      if (M.rootkit && !E.reinstalado && (tipo === "offline" || tipo === "kvrt")) {
        hallados.push(M.rootkit.nombre);
        t.escribir("Amenaza: " + M.rootkit.nombre + " · C:\\Windows\\System32\\drivers\\ndisrd.sys", "t-error");
        t.escribir("No se ha podido eliminar por completo: la amenaza está en el arranque. Se recomienda reinstalar el sistema desde un medio limpio.", "t-error");
      }
      if (tipo === "kvrt" && !E.reinstalado) E.programas.filter((g) => g.instalado && g.detectaKvrt).forEach((g) => {
        hallados.push(g.nombre);
        t.escribir("not-a-virus:AdWare · programa instalado «" + g.nombre + "»: desinstálalo desde Programas.", "t-aviso");
      });
      if (!hallados.length) t.escribir("No se han encontrado amenazas.", "t-ok");
      E.historialDef.push([nombres[tipo], hallados.length ? hallados.join(", ") : "ninguna"]);
      if (tipo === "offline" || tipo === "kvrt") hecho("analizar");
      if (tipo !== "kvrt" && !firmas && E.procesos.some((p) => p.firmasNuevas && p.amenaza && !E.quitados.has(ruta(p.payload || p.ruta)))) consejo("Las firmas de Defender tienen " + E.defender.firmasDias + " días: un antivirus con firmas viejas no ve las amenazas nuevas.", "t-aviso");
      if (tipo === "rapido" && !hallados.length && E.programas.some((g) => g.detectaKvrt && g.instalado)) consejo("Defender no lo detecta todo: los PUP se le escapan a menudo. Una segunda opinión a demanda ayuda.");
      if (tipo === "offline") await reiniciar("Volviendo a Windows");
    };
    t.registrar("defender", {
      resumen: "Microsoft Defender: estado, actualizar, rapido, completo, offline, historial y activar.",
      uso: "defender estado | actualizar | rapido | completo | offline | historial | activar",
      detalle: ["offline = examen sin conexión: reinicia y analiza el disco fuera de Windows (unos 15 minutos).", "En PowerShell: Get-MpComputerStatus, Update-MpSignature, Start-MpScan, Start-MpWDOScan, Get-MpThreatDetection."],
      ejemplos: ["defender estado", "defender actualizar", "defender offline"],
      async ejecutar(args) {
        const sub = (args[0] || "estado").toLowerCase().replace("rápido", "rapido");
        const d = E.defender;
        if (sub === "estado") {
          t.lineas([
            "Protección en tiempo real: " + (d.activo || E.reinstalado ? "activada" : "DESACTIVADA"),
            "Versión de las firmas:    1.441." + (2310 - d.firmasDias * 3) + ".0 (" + (d.firmasDias <= 1 ? "de hoy" : "hace " + d.firmasDias + " días") + ")",
            "Protección contra alteraciones: " + (d.activo || E.reinstalado ? "activada" : "desactivada")
          ]);
          if (!d.activo && !E.reinstalado && d.bloqueado) t.escribir(d.bloqueado, "t-aviso");
          return;
        }
        if (sub === "actualizar") {
          if (d.firmasDias <= 1) return t.escribir("Las firmas ya están al día.", "t-suave");
          await t.progreso("Actualizando firmas", 1000);
          d.firmasDias = 0;
          t.escribir(E.red ? "Firmas actualizadas desde Windows Update." : "Sin red: se ha instalado el paquete de firmas descargado en el equipo del taller (USB). Firmas al día.", "t-ok");
          return;
        }
        if (sub === "rapido" || sub === "completo" || sub === "offline") return examen(sub);
        if (sub === "historial") {
          if (!E.historialDef.length) return t.escribir("Historial de protección vacío en esta sesión.", "t-suave");
          E.historialDef.forEach(([n, r]) => t.escribir(n + ": " + r));
          return;
        }
        if (sub === "activar") {
          if (d.activo || E.reinstalado) return t.escribir("La protección en tiempo real ya está activada.", "t-suave");
          if (M.rootkit) return t.escribir("Se activa… y a los pocos segundos vuelve a desactivarse sola.", "t-error");
          if (E.programas.some((g) => g.av && g.instalado)) return t.escribir("No se puede: hay otro antivirus en tiempo real registrado. Defender solo se activa cuando no queda ninguno.", "t-aviso");
          if (vivos().some((p) => p.amenaza === "spyware") || E.inicio.some((e) => e.mala && entradaViva(e) && archivoDisponible(e, true))) return t.escribir("Se activa… y al momento la directiva la vuelve a desactivar. Algo sigue en marcha.", "t-error");
          d.activo = true; d.bloqueado = "";
          t.escribir("Directiva eliminada. Protección en tiempo real y protección contra alteraciones activadas.", "t-ok");
          return;
        }
        t.usoIncorrecto("defender", "No conozco la opción «" + args[0] + "».");
      }
    });
    /* Los mismos comandos con su nombre de PowerShell. */
    t.registrar("get-mpcomputerstatus", { resumen: "Estado de Defender (PowerShell).", oculto: true, ejecutar: () => t.comandos.defender.ejecutar(["estado"]) });
    t.registrar("update-mpsignature", { resumen: "Actualiza las firmas (PowerShell).", oculto: true, ejecutar: () => t.comandos.defender.ejecutar(["actualizar"]) });
    t.registrar("start-mpwdoscan", { resumen: "Examen sin conexión (PowerShell).", oculto: true, ejecutar: () => t.comandos.defender.ejecutar(["offline"]) });
    t.registrar("get-mpthreatdetection", { resumen: "Amenazas detectadas (PowerShell).", oculto: true, ejecutar: () => t.comandos.defender.ejecutar(["historial"]) });
    t.registrar("start-mpscan", { resumen: "Examen rápido o completo (PowerShell).", oculto: true, ejecutar: (a) => t.comandos.defender.ejecutar([a.join(" ").toLowerCase().includes("full") ? "completo" : "rapido"]) });
    t.registrar("kvrt", {
      resumen: "Segunda opinión: antimalware portátil a demanda (no se instala).",
      uso: "kvrt",
      detalle: "Analiza cuando se le pide y no se queda vigilando, así no choca con Defender.",
      alias: ["malwarebytes", "segunda"],
      ejecutar() { return examen("kvrt"); }
    });

    t.registrar("navegador", {
      resumen: "Revisa Chrome: extensiones, directivas, quitar <nº> y restablecer.",
      uso: "navegador extensiones | directivas | quitar <nº> | restablecer",
      detalle: ["directivas = chrome://policy. «Administrado por tu organización» en un equipo de casa: algo ha creado directivas.", "restablecer = chrome://settings/reset: vuelve el buscador y la página de inicio y desactiva las extensiones."],
      ejemplos: ["navegador directivas", "navegador quitar 1"],
      alias: ["chrome"],
      ejecutar(args) {
        const sub = (args[0] || "").toLowerCase();
        if (!E.nav) return t.escribir("En este equipo el navegador está bien: buscador de Google, sin directivas y sin extensiones raras.", "t-suave");
        if (E.reinstalado) return t.escribir("Chrome recién instalado: sin extensiones ni directivas.", "t-suave");
        const nav = E.nav;
        if (sub === "extensiones" || sub === "") {
          t.escribir("chrome://extensions · Buscador: " + (nav.buscador ? nav.buscador : "Google") + (directivasActivas() ? " · «Administrado por tu organización»" : ""), "t-titulo");
          nav.extensiones.filter((x) => !x.quitada).forEach((x, i) => t.escribir([[("#" + (nav.extensiones.indexOf(x) + 1)).padEnd(4), "t-suave"], [x.nombre.padEnd(34), x.desactivada ? "t-suave" : "t-cmd"], [x.detalle + (x.desactivada ? " (desactivada)" : ""), "t-suave"]]));
          return;
        }
        if (sub === "directivas") {
          hecho("verDirectivas");
          if (!directivasActivas()) return t.escribir("chrome://policy: no hay directivas.", "t-ok");
          t.escribir("chrome://policy · Origen: Plataforma (máquina)", "t-titulo");
          M.navegador.directivas.forEach((d) => t.escribir("  " + d, "t-aviso"));
          consejo("En un equipo de casa nadie debería imponer directivas: las ha creado un programa. Se quita ese programa.");
          return;
        }
        if (sub === "quitar") {
          const x = nav.extensiones[Number(args[1]) - 1];
          if (!x || x.quitada) return t.usoIncorrecto("navegador", "Falta un número de extensión válido (mira navegador extensiones).");
          accion();
          if (x.forzada && directivasActivas()) return t.escribir("Chrome: «" + x.nombre + "» la instala una directiva (ExtensionInstallForcelist): no se puede quitar. Vuelve en cuanto la borras.", "t-error");
          x.quitada = true;
          t.escribir("Extensión «" + x.nombre + "» quitada.", "t-ok");
          if (!x.mala) riesgo("ext" + x.id, 3, "Quitaste la extensión «" + x.nombre + "», que era legítima.");
          return;
        }
        if (sub === "restablecer") {
          accion();
          nav.extensiones.forEach((x) => { if (!x.forzada || !directivasActivas()) x.desactivada = true; });
          if (directivasActivas()) return t.escribir("Chrome restablecido… pero las directivas vuelven a imponer el buscador " + nav.buscador + ".", "t-error");
          nav.buscador = null;
          t.escribir("Chrome restablecido: buscador de Google y página de inicio por defecto. Las extensiones quedan desactivadas (la clienta puede volver a activar las suyas).", "t-ok");
          return;
        }
        t.usoIncorrecto("navegador", "No conozco la opción «" + args[0] + "».");
      }
    });

    t.registrar("copiar", {
      resumen: "Copia los datos del cliente al disco del taller (solo datos).",
      uso: "copiar datos [--todo]",
      detalle: ["Copia Documentos, Imágenes, Escritorio y correo. Nada de .exe ni instaladores.", "--todo copia también ejecutables (no se hace)."],
      ejemplos: ["copiar datos"],
      async ejecutar(args) {
        if ((args[0] || "").toLowerCase() !== "datos") return t.usoIncorrecto("copiar", "Escribe copiar datos.");
        if (E.reinstalado && !E.copiado) return t.escribir("Ya no queda nada que copiar: el disco se formateó al reinstalar.", "t-error");
        const todo = args.some((a) => /todo/i.test(a));
        await t.progreso("Copiando al disco del taller (E:)", 1300);
        E.copiado = true;
        hecho("copiar");
        t.escribir("Datos copiados en E:\\" + M.equipo + "\\ (" + (M.datos ? M.datos.map((d) => d.split("/").pop() || d).join(", ") : "Documentos, Imágenes, Escritorio") + ").", "t-ok");
        if (todo) riesgo("copiaExe", 6, "Copiaste también ejecutables: el malware puede viajar en la copia.");
        if (M.ransom && vivos().some((p) => p.amenaza === "ransomware")) {
          riesgo("copiaCifrada", 12, "Conectaste un disco al equipo con el ransomware en marcha: también lo ha cifrado.");
          t.escribir("El ransomware ha empezado a cifrar también el disco del taller.", "t-error");
        }
        if (M.ransom && !vivos().some((p) => p.amenaza === "ransomware")) consejo("Bien: los archivos cifrados también se guardan. Si algún día sale un descifrador, harán falta.");
      }
    });

    t.registrar("contrasenas", {
      resumen: "Cambia las contraseñas del cliente (correo, banco, redes).",
      uso: "contrasenas",
      alias: ["contraseñas", "passwords"],
      async ejecutar() {
        const i = await t.elegir("¿Desde dónde se cambian?", ["Desde este equipo, ahora mismo", "Desde otro equipo limpio o el móvil del cliente, con verificación en dos pasos"]);
        if (i === -1) return t.escribir("No se ha cambiado nada.", "t-suave");
        if (i === 0) {
          const espia = M.tipo === "spyware" || M.tipo === "rootkit" || M.tipo === "rat";
          if (espia && !E.reinstalado && (vivos().some((p) => p.amenaza === "spyware" || p.amenaza === "rat") || M.rootkit || !limpio())) {
            riesgo("passInfectado", 10, "Cambiaste las contraseñas desde el equipo infectado: el atacante recibe también las nuevas.");
            t.escribir("Contraseñas cambiadas… y registradas por el espía.", "t-error");
          } else t.escribir("Contraseñas cambiadas desde este equipo.", "t-aviso");
          return;
        }
        hecho("contrasenas");
        t.escribir("El cliente cambia sus contraseñas desde su móvil y activa la verificación en dos pasos.", "t-ok");
      }
    });

    t.registrar("reiniciar", {
      resumen: "Reinicia Windows (para comprobar que lo quitado no vuelve).",
      uso: "reiniciar",
      alias: ["shutdown", "restart"],
      async ejecutar() { await reiniciar(); consejo("Mira con tasklist y autoruns que no ha vuelto nada."); }
    });

    t.registrar("reinstalar", {
      resumen: "Formatea y reinstala Windows desde un USB oficial (medio limpio).",
      uso: "reinstalar",
      detalle: "Se pierde todo lo que hay en C:. Los datos se copian antes.",
      async ejecutar() {
        if (E.reinstalado) return t.escribir("Windows ya está recién instalado.", "t-suave");
        const s = (await t.preguntar("Se formatea C: y se instala Windows desde el USB oficial. Escribe REINSTALAR para continuar:")).trim();
        if (s.toUpperCase() !== "REINSTALAR") return t.escribir("No se ha hecho nada.", "t-suave");
        accion();
        await t.progreso("Instalando Windows 11", 2400);
        if (!E.copiado) riesgo("sinCopia", 15, "Reinstalaste sin copiar los datos: el cliente pierde sus documentos.");
        if (!M.reinstalar) riesgo("reinstalarSin", 8, "Reinstalaste un equipo que se podía limpiar: horas de trabajo y programas del cliente perdidos.");
        E.reinstalado = true;
        E.defender.activo = true; E.defender.firmasDias = 0; E.defender.bloqueado = "";
        E.procesos.forEach((p) => { if (p.base && p.transitorio === undefined) E.muertos.delete(p.pid); });
        if (M.ransom) E.cifLocal = M.ransom.local;
        hecho("reinstalar");
        t.cwd = "/Users/" + M.usuario;
        t.escribir("Windows 11 instalado desde cero. Defender activo y al día.", "t-ok");
        if (M.ransom) consejo("Ahora sí: con el equipo limpio y aislado se puede conectar la copia desconectada (restaurar).");
      }
    });

    t.registrar("restaurar", {
      resumen: "Conecta la copia de seguridad desconectada y la restaura.",
      uso: "restaurar",
      async ejecutar() {
        if (!M.ransom) return t.escribir("En este caso no hay ninguna copia que restaurar: los datos están bien.", "t-suave");
        if (E.restaurado) return t.escribir("La copia ya está restaurada.", "t-suave");
        if (E.copiaPerdida) return t.escribir("La copia del viernes está cifrada: ya no sirve.", "t-error");
        accion();
        const activo = vivos().some((p) => p.amenaza === "ransomware") || amenazas().some((p) => volveria(p, true) && !E.reinstalado);
        await t.progreso("Conectando el disco USB de la copia del viernes", 1200);
        if (activo) {
          E.copiaPerdida = true;
          riesgo("copiaPerdida", 15, "Conectaste la copia de seguridad a un equipo con el ransomware activo (o que volvería al reiniciar): la copia se ha cifrado.");
          return t.escribir("El ransomware ha cifrado también la copia de seguridad.", "t-error");
        }
        await t.progreso("Restaurando Documentos y la carpeta del NAS", 1600);
        E.restaurado = true;
        E.cifLocal = 0;
        hecho("restaurar");
        if (!E.reinstalado) riesgo("restSucio", 6, "Restauraste sin reinstalar: con un ransomware no se sabe qué más dejó el atacante.");
        t.escribir("Copia del viernes restaurada. Se pierde solo lo hecho entre el viernes y hoy.", "t-ok");
        consejo("Al terminar, el disco de la copia se vuelve a desconectar.");
      }
    });

    t.registrar("nomoreransom", {
      resumen: "Identifica la variante de un ransomware (ID Ransomware / No More Ransom).",
      uso: "nomoreransom <nota o archivo cifrado>",
      ejemplos: ["nomoreransom README.txt"],
      alias: ["idransomware", "cryptosheriff"],
      ejecutar(args) {
        if (!M.ransom) return t.escribir("No hay ningún archivo cifrado ni nota de rescate en este equipo.", "t-suave");
        if (!args[0]) return t.usoIncorrecto("nomoreransom", "Falta la nota de rescate o un archivo cifrado.");
        if (!E.cifLocal && !E.restaurado) return t.escribir("Todavía no hay nada cifrado que subir.", "t-suave");
        hecho("identificar");
        t.escribir("(Se sube desde el portátil del taller.) ID Ransomware: LockBit 3.0 (Black).", "t-titulo");
        t.escribir("No More Ransom: no hay descifrador gratuito para esta variante. Conserva los archivos cifrados por si sale.", "t-aviso");
        consejo("Se denuncia (Policía o Guardia Civil) y se puede pedir ayuda al INCIBE en el 017.");
      }
    });
    t.registrar("pagar", {
      resumen: "Paga el rescate.", oculto: true,
      async ejecutar() {
        const s = (await t.preguntar("¿Seguro que quieres pagar 0,05 BTC a los atacantes? (s/n)")).trim().toLowerCase();
        if (s !== "s" && s !== "si" && s !== "sí") return t.escribir("No se ha pagado nada.", "t-suave");
        E.pagado = true;
        riesgo("pagar", 15, "Pagaste el rescate: no garantiza nada y financia el siguiente ataque.");
        t.escribir("Pago enviado. Los atacantes no responden.", "t-error");
      }
    });

    if (M.usb) {
      const gusanoActivo = () => amenazas().some((p) => p.amenaza === "gusano" && (vivo(p) || volveria(p, true)));
      t.registrar("attrib", {
        resumen: "Cambia los atributos de archivos y carpetas (oculto, sistema, solo lectura).",
        usaH: true,
        uso: "attrib -h -s -r /s /d E:\\*.*",
        detalle: ["-h quita «oculto», -s quita «sistema», -r quita «solo lectura».", "/s y /d lo aplican a todas las subcarpetas y a las carpetas."],
        ejemplos: ["attrib -h -s -r /s /d E:\\*.*"],
        ejecutar(args) {
          const a = args.map((x) => x.toLowerCase());
          if (!a.some((x) => /^e:/.test(x))) return t.usoIncorrecto("attrib", "En este caso se trabaja sobre el pendrive (E:).");
          if (!a.includes("-h") || !a.includes("-s")) return fallo("attrib: las carpetas siguen ocultas.", "Hay que quitar a la vez los atributos oculto (-h) y sistema (-s).");
          if (E.usbPerdido) return t.escribir("attrib: la unidad está vacía.", "t-error");
          accion();
          if (gusanoActivo()) { E.usbOculto = true; return t.escribir("Las carpetas aparecen… y a los pocos segundos el gusano las vuelve a ocultar. Primero hay que limpiar el equipo.", "t-error"); }
          E.usbOculto = false;
          t.escribir("Atributos quitados: " + M.usb.carpetas.join(", ") + " vuelven a verse en E:\\.", "t-ok");
        }
      });
      t.registrar("del", {
        resumen: "Borra archivos (en este caso, los accesos directos falsos del pendrive).",
        uso: "del E:\\*.lnk",
        ejemplos: ["del E:\\*.lnk"],
        alias: ["erase", "rm"],
        ejecutar(args) {
          const x = (args.find((y) => !y.startsWith("/")) || "").toLowerCase();
          if (!/^e:\\?(\*|[^\\]+)\.lnk$/.test(x)) return fallo("del: en este simulador solo se borran los accesos directos del pendrive.", "Solo se pueden borrar los accesos directos (.lnk) del pendrive E:.");
          accion();
          if (gusanoActivo()) { E.usbLnk = true; return t.escribir("Borrados… y el gusano los vuelve a crear al momento. Primero hay que limpiar el equipo.", "t-error"); }
          E.usbLnk = false;
          t.escribir("Accesos directos falsos borrados de E:\\.", "t-ok");
          if (E.usbScript) consejo("En E:\\WindowsServices sigue la copia del gusano: un análisis del antivirus la pone en cuarentena.", "t-aviso");
        }
      });
      t.registrar("format", {
        resumen: "Formatea una unidad.", oculto: true,
        async ejecutar(args) {
          if (!/^e:/i.test(args[0] || "")) return t.escribir("format: en este caso solo hay el pendrive (E:).", "t-aviso");
          const s = (await t.preguntar("Se borrará todo lo que hay en E:. ¿Continuar? (s/n)")).trim().toLowerCase();
          if (s !== "s" && s !== "si" && s !== "sí") return t.escribir("No se ha formateado.", "t-suave");
          E.usbPerdido = true; E.usbOculto = false; E.usbLnk = false; E.usbScript = false;
          riesgo("format", 15, "Formateaste el pendrive: el TFG solo estaba oculto y se ha perdido.");
          t.escribir("E: formateada. El TFG de Sergio se ha perdido.", "t-error");
        }
      });
    }

    t.registrar("pista", {
      resumen: "Da una pista sobre el siguiente paso (resta " + COSTE_PISTA + " puntos).",
      uso: "pista",
      alias: ["hint"],
      oculto: DIFICIL,
      ejecutar() {
        if (DIFICIL) return t.escribir(EXTRA ? "En el examen no hay pistas." : "Modo difícil: no hay pistas.", "t-aviso");
        const siguiente = M.objetivosOrden.find((k) => !objetivoHecho(k));
        if (!siguiente) return t.escribir("No te hace falta: ya está todo. Escribe informe.", "t-suave");
        E.pistas++;
        t.escribir("Pista (−" + COSTE_PISTA + "): " + M.pistas[siguiente], "t-pista");
      }
    });

    t.registrar("informe", {
      resumen: "Entrega el informe y termina el caso.",
      uso: "informe",
      alias: ["report"],
      async ejecutar() {
        if (!limpio()) {
          const s = (await t.preguntar("El equipo aún no está limpio del todo. ¿Entregar igualmente? (s/n)")).trim().toLowerCase();
          if (s !== "s" && s !== "si" && s !== "sí") return t.escribir("Sigue con el caso.", "t-suave");
        }
        t.escribir("INFORME DE LA INTERVENCIÓN", "t-titulo");
        const r = (await t.preguntar("Escribe los PID de los procesos maliciosos o no deseados que encontraste, separados por espacios (o «ninguno»):")).trim();
        E.pids = (r.match(/\d+/g) || []).map(Number);
        for (const [q, ops] of M.preguntas) {
          const orden = ops.map((o, i) => ({ o, ok: i === 0 })).sort(() => Math.random() - 0.5);
          let i = -1;
          while (i === -1) {
            i = await t.elegir(q, orden.map((x) => x.o));
            if (i === -1) t.escribir("Para entregar el informe hay que responder.", "t-aviso");
          }
          E.respuestas.push(orden[i].ok);
          if (DIFICIL) t.escribir("Respuesta anotada.", "t-suave");
          else t.escribir(orden[i].ok ? "Correcto." : "No es eso.", orden[i].ok ? "t-ok" : "t-error");
        }
        hecho("informe");
        E.terminado = true;
        terminar();
      }
    });
  };

  /* ---------- Objetivos, panel y puntuación ---------- */
  const objetivoHecho = (k) => {
    if (k === "investigar") {
      const req = amenazas();
      return req.length ? req.every((p) => E.vistos.has(p.pid)) : (E.hechos.has("verRed") || E.hechos.has("verProcesos")) && E.hechos.has("verInicio");
    }
    if (k === "eventos") return E.hechos.has("verEventos");
    if (k === "extra") return (M.extra || []).every(([, ok]) => ok());
    if (k === "neutralizar") {
      if (E.nav) return E.reinstalado || !E.nav.buscador && E.nav.extensiones.every((x) => !x.mala || x.quitada) && !directivasActivas();
      return !amenazas().some(vivo);
    }
    if (k === "persistencia") {
      const ok = E.inicio.filter((e) => e.mala && !(M.rootkit && M.rootkit.entrada === e.n)).every((e) => !entradaViva(e));
      return ok && E.programas.filter(programaPup).every((g) => !g.instalado);
    }
    return E.hechos.has(k);
  };

  const METODO = {
    aislar: ["Aislaste el equipo antes de actuar", () => !!E.antes && E.antes.aislado],
    investigar: ["Revisaste los procesos antes de cerrarlos", () => E.matadosSinVer === 0 && amenazas().every((p) => E.vistos.has(p.pid))],
    copiar: ["Copiaste los datos antes de limpiar", () => !!E.antes && E.antes.copiado],
    persistencia: ["Revisaste lo que arranca solo (Autoruns, tareas, servicios)", () => E.hechos.has("verInicio")],
    eventos: ["Consultaste el Visor de eventos", () => E.hechos.has("verEventos")],
    firmas: ["Actualizaste las firmas antes de analizar", () => E.firmasAntes === true],
    offline: ["Analizaste sin conexión o con una segunda opinión", () => E.hechos.has("analizar")],
    comprobar: ["Reiniciaste y comprobaste que no vuelve", () => E.hechos.has("comprobar")],
    contrasenas: ["Cambiaste las contraseñas desde otro equipo", () => E.hechos.has("contrasenas")],
    reinstalar: ["Reinstalaste antes de restaurar la copia", () => E.reinstalado && E.restaurado],
    identificar: ["Identificaste la variante en No More Ransom", () => E.hechos.has("identificar")],
    noPagar: ["No pagaste el rescate", () => !E.pagado],
    desinstalar: ["Desinstalaste el programa, no solo cerraste el proceso", () => E.programas.filter(programaPup).every((g) => !g.instalado)]
  };

  /* Riesgos que dependen de cuánto tardó el alumno. */
  const riesgosFinales = () => {
    const l = E.riesgos.slice();
    if (E.enviado) l.push({ puntos: Math.min(10, Math.ceil(E.enviado / 6)), texto: "El espía siguió enviando datos mientras la red estaba conectada (" + E.enviado + " MB)." });
    const nasTuyos = M.ransom ? E.cifNas - Math.round(M.ransom.nas * 0.04) : 0;
    if (nasTuyos > 0) l.push({ puntos: Math.min(10, Math.ceil(nasTuyos / 1000)), texto: "Con la red conectada se cifraron " + fmt(nasTuyos) + " archivos más del NAS de la oficina." });
    if (M.ransom && E.cifLocal && !E.reinstalado && !E.restaurado) l.push({ puntos: 4, texto: "Quedaron " + fmt(E.cifLocal) + " archivos cifrados sin recuperar." });
    return l;
  };

  const evaluar = () => {
    const req = amenazas().map((p) => p.pid);
    const opcionales = E.procesos.filter((p) => p.amenaza === "opcional").map((p) => p.pid);
    const dichos = E.pids || [];
    const aciertos = req.filter((pid) => dichos.includes(pid));
    const falsos = dichos.filter((pid) => !req.includes(pid) && !opcionales.includes(pid) && procPid(pid));
    const ptsPids = Math.max(0, Math.min(10, Math.round((req.length ? 10 * aciertos.length / req.length : 10) - 3 * falsos.length)));
    const ptsPreg = E.respuestas.filter(Boolean).length * 5;
    const deteccion = ptsPids + ptsPreg;
    const items = objetivosLimpiar().map(([txt, ok]) => [txt, ok()]);
    const neutral = Math.round(30 * items.filter((i) => i[1]).length / items.length);
    const metodo = M.metodo.map((k) => [METODO[k][0], METODO[k][1]()]);
    const ptsMetodo = Math.round(metodo.filter((m) => m[1]).length * 7.5);
    const riesgos = riesgosFinales();
    const ptsRiesgo = Math.max(0, 20 - riesgos.reduce((s, r) => s + r.puntos, 0));
    const descuento = E.pistas * COSTE_PISTA;
    const total = Math.max(0, Math.min(100, deteccion + neutral + ptsMetodo + ptsRiesgo - descuento));
    return { req, aciertos, falsos, deteccion, items, neutral, metodo, ptsMetodo, riesgos, ptsRiesgo, descuento, total };
  };

  const pintarPanel = () => {
    if (!app.querySelector("[data-estado]")) return;
    const ul = app.querySelector("[data-objetivos]");
    if (ul) ul.innerHTML = M.objetivosOrden.map((k) => '<li class="' + (objetivoHecho(k) ? "hecho" : "") + '"><span aria-hidden="true">' + (objetivoHecho(k) ? "✓" : "") + "</span>" + esc(M.objetivos[k]) + (objetivoHecho(k) ? '<span class="rt-oculto"> (hecho)</span>' : "") + "</li>").join("");
    const d = E.defender;
    const filas = [
      ["Red", E.red ? ["Conectada", "mal"] : ["Aislada", "bien"]],
      ["Defender", d.activo || E.reinstalado ? (d.firmasDias > 1 ? ["Firmas de hace " + d.firmasDias + " días", "mal"] : ["Activo", "bien"]) : ["Desactivado", "mal"]],
      ["Procesos revisados", [String(E.vistos.size), ""]]
    ];
    if (M.ransom && !DIFICIL) {
      filas.push(["Archivos cifrados", [E.restaurado ? "0 (restaurados)" : fmt(E.cifLocal) + " / " + fmt(M.ransom.local), E.cifLocal && !E.restaurado ? "mal" : "bien"]]);
      filas.push(["Cifrados en el NAS", [fmt(E.cifNas), E.cifNas ? "mal" : ""]]);
    }
    if (M.tipo === "spyware" && !DIFICIL) filas.push(["Datos enviados", [E.enviado + " MB", E.enviado ? "mal" : ""]]);
    app.querySelector("[data-estado]").innerHTML = filas.map(([k, [v, c]]) => "<div><span>" + esc(k) + '</span><b class="' + c + '">' + esc(v) + "</b></div>").join("");
    const items = objetivosLimpiar();
    const pct = Math.round(items.filter(([, ok]) => ok()).length / items.length * 100);
    app.querySelector("[data-barra]").style.width = pct + "%";
    app.querySelector("[data-barra]").parentElement.setAttribute("aria-valuenow", pct);
    const r = app.querySelector("[data-riesgo]");
    if (DIFICIL) { r.textContent = EXTRA ? "Examen" : "Modo difícil"; r.className = "rt-riesgo alto"; return; }
    const activa = amenazas().some(vivo) || (M.rootkit && !E.reinstalado);
    r.textContent = activa ? "Amenaza activa" : pct === 100 ? "Equipo limpio" : "Quedan restos";
    r.className = "rt-riesgo " + (activa ? "alto" : pct === 100 ? "ok" : "activo");
  };

  /* ---------- Pantallas ---------- */
  const ICONO_LUPA = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.9-4.9M8 10.5h5M10.5 8v5"/></svg>';
  const ICONO_CERRAR = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const ICONO_BICHO = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="7" width="8" height="12" rx="4"/><path d="M9.5 7a2.5 2.5 0 0 1 5 0M4 11h4M16 11h4M4 17l4-1.5M20 17l-4-1.5M5 5l3 3M19 5l-3 3M12 11v8"/></svg>';

  const portada = () => {
    document.title = "Caza al proceso sospechoso · UF0864 | Microinformática";
    app.innerHTML =
      '<section class="rt-panel rt-portada">' +
      '<a class="rt-cerrar" href="software.html" aria-label="Salir del juego">' + ICONO_CERRAR + "</a>" +
      '<p class="rt-antetitulo"><b>UF0864</b> · Minijuego 3/4</p>' +
      "<h1>" + ICONO_LUPA + "<span>Caza al proceso<br>sospechoso</span></h1>" +
      '<p class="rt-lema">Revisa los procesos. <span>Detecta la amenaza. Responde sin romper nada.</span></p>' +
      "<p>Te sientas ante un Windows que se porta raro. Tienes que averiguar qué proceso es el culpable, de dónde sale y qué lo vuelve a arrancar, y neutralizarlo sin tocar lo que es legítimo. Ojo: no todo lo raro es malware, y cerrar un proceso de Windows por error tumba el equipo.</p>" +
      '<div class="rt-terminal-demo" aria-hidden="true"><span>PS C:\\Users\\ana&gt;</span> tasklist /cpu<br><em>svchost.exe   6120   ana   92,6 %   2.310 MB</em><br><span>PS C:\\Users\\ana&gt;</span> proceso 6120<br><em>Ruta: C:\\Users\\ana\\AppData\\Roaming\\Microsoft\\Windows\\svchost.exe · (sin firma)</em></div>' +
      '<p class="rt-aviso-sim">Es una terminal simulada: no ejecuta nada en tu ordenador ni puede ver tus procesos ni tus archivos.</p>' +
      '<div class="rt-modo" role="radiogroup" aria-label="Modo de juego">' +
      '<button type="button" role="radio" data-modo="normal" aria-checked="' + !DIFICIL + '"><b>Normal</b><span>Con objetivos, consejos y pistas</span></button>' +
      '<button type="button" role="radio" data-modo="dificil" aria-checked="' + DIFICIL + '"><b>Difícil</b><span>Sin pistas: si te equivocas, no te dice qué escribir</span></button>' +
      "</div>" +
      '<h2 class="rt-h2">Elige un equipo</h2>' +
      '<div class="rt-misiones">' + ESCENARIOS.map((m, i) => [m, i]).sort((a, b) => a[0].desde.localeCompare(b[0].desde) || a[1] - b[1]).map(([m, i]) => {
        const ok = abierta(m);
        return '<button type="button" class="rt-mision" data-escenario="' + i + '"' + (ok ? "" : " disabled") + ">" +
          ICONO_BICHO + "<span><small>" + esc(m.sesion) + " · Equipo " + esc(m.equipo) + "</small><b>" + esc(m.titulo) + "</b><em>" + esc(m.resumen) + "</em>" +
          (ok ? "" : '<i class="rt-candado">Se abre el ' + fecha(m) + "</i>") + "</span></button>";
      }).join("") + "</div>" +
      (PREVIA ? '<p class="rt-nota">Vista del profesor: todos los equipos están abiertos.</p>' : "") +
      '<p class="rt-nota">Puntuación sobre 100: detección (20), amenaza neutralizada (30), método (30) y riesgos evitados (20). Cada pista resta ' + COSTE_PISTA + ". En modo difícil no hay pistas ni objetivos, y el informe no te dice si aciertas hasta el final.</p>" +
      "</section>";
    app.querySelectorAll("[data-modo]").forEach((b) => b.addEventListener("click", () => {
      DIFICIL = b.dataset.modo === "dificil";
      guardarModo();
      app.querySelectorAll("[data-modo]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    }));
    app.querySelectorAll("[data-escenario]").forEach((b) => b.addEventListener("click", () => empezar(ESCENARIOS[Number(b.dataset.escenario)])));
    const primero = app.querySelector("[data-escenario]:not([disabled])");
    (primero || app.querySelector(".rt-cerrar")).focus({ preventScroll: true });
  };

  const empezar = (m) => {
    M = m;
    E = nuevoEstado(m);
    app.innerHTML =
      '<section class="rt-panel rt-juego">' +
      '<header class="rt-barra">' +
      '<div class="rt-titulo">' + ICONO_LUPA + "<div><h1>Caza al proceso sospechoso</h1><p>Equipo " + esc(m.equipo) + " · " + esc(m.titulo) + (DIFICIL ? (EXTRA ? " · Examen" : " · Modo difícil") : "") + "</p></div></div>" +
      '<span class="rt-riesgo alto" data-riesgo role="status">Amenaza activa</span>' +
      (ESCAPE ? "" : '<a class="rt-cerrar rt-cerrar-barra" href="caza.html' + (PREVIA ? "?profe" : "") + '" aria-label="Salir del caso">' + ICONO_CERRAR + "</a>") +
      "</header>" +
      '<div class="rt-cuerpo">' +
      '<div class="rt-ventana">' +
      '<div class="rt-ventana-barra"><i></i><i></i><i></i><span>Administrador: Windows PowerShell — ' + esc(m.equipo) + "</span></div>" +
      '<div class="rt-salida" data-salida role="log" aria-live="polite" aria-label="Salida de la terminal"></div>' +
      '<form class="rt-entrada" data-formulario autocomplete="off"><label class="t-prompt" for="cz-comando"></label>' +
      '<input id="cz-comando" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send" aria-label="Escribe un comando"></form>' +
      '<div class="rt-teclas"><button type="button" data-tecla="tab">Tab</button><button type="button" data-tecla="arriba" aria-label="Comando anterior">↑</button><button type="button" data-tecla="help">help</button><button type="button" data-tecla="tasklist /v">tasklist</button>' + (DIFICIL ? "" : '<button type="button" data-tecla="pista">pista</button>') + "</div>" +
      "</div>" +
      '<aside class="rt-lateral">' +
      '<section class="rt-caja"><h2>Orden de trabajo</h2><p>' + m.orden.slice(2, 5).map(esc).join("<br>") + '</p><p class="rt-nota">Léela entera con <code>type orden_trabajo.txt</code>.</p></section>' +
      (DIFICIL ? '<section class="rt-caja"><h2>' + (EXTRA ? "Examen" : "Modo difícil") + '</h2><p class="rt-nota">Sin objetivos ni pistas. Investiga y decide tú: los errores dicen qué ha fallado, pero no qué tienes que escribir.</p></section>'
        : '<section class="rt-caja"><h2>Objetivos</h2><ul class="rt-objetivos" data-objetivos></ul></section>') +
      '<section class="rt-caja"><h2>Estado del equipo</h2><div class="rt-estado" data-estado></div><div class="rt-progreso" role="progressbar" aria-label="Amenaza neutralizada" aria-valuemin="0" aria-valuemax="100"><span data-barra></span></div></section>' +
      "</aside></div></section>";

    t = Terminal.crear({
      salida: app.querySelector("[data-salida]"),
      entrada: app.querySelector("#cz-comando"),
      formulario: app.querySelector("[data-formulario]"),
      prompt: (cwd) => "PS " + aWin(cwd) + ">",
      sinAyudas: DIFICIL && !EXTRA, /* en el examen, los errores de uso siguen explicando el comando */
      completarExtra: (cmd) => {
        const c = cmd.toLowerCase();
        if (c === "proceso" || c === "virustotal") return vivos().map((p) => String(p.pid));
        if (c === "desactivar" || c === "activar") return E.inicio.filter((e) => !e.eliminado).map((e) => String(e.n));
        if (c === "defender") return ["estado", "actualizar", "rapido", "completo", "offline", "historial", "activar"];
        if (c === "navegador") return ["extensiones", "directivas", "quitar", "restablecer"];
        if (c === "red") return ["off", "on", "estado"];
        if (c === "copiar") return ["datos"];
        return [];
      },
      despues: (clave) => {
        if (E.terminado) return;
        if (!["help", "clear", "history", "pista", "pwd"].includes(clave)) tic();
        pintarPanel();
      }
    });
    t.raiz = dir(() => construir());
    t.casa = "/Users/" + m.usuario;
    registrarComandos();
    t.cwd = "/Users/" + m.usuario;
    t.escribir("Windows PowerShell (simulado) · sesión de administrador del técnico", "t-titulo");
    t.escribir("Nada de lo que escribas se ejecuta en tu ordenador.", "t-suave");
    if (DIFICIL) t.escribir((EXTRA ? "Examen" : "Modo difícil") + ": sin pistas ni objetivos. Si te equivocas, no te dirá qué tienes que escribir.", "t-aviso");
    t.escribir([["Escribe ", ""], ["help", "t-cmd"], [" para ver los comandos, o ", ""], ["type orden_trabajo.txt", "t-cmd"], [" para leer el encargo.", ""]]);
    if (m.ransom) t.escribir("El cifrado está ocurriendo ahora: cada comando que escribes cuenta.", "t-error");
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
    if (ESCAPE) avisarSala({ id: M.id, total: ev.total, maximo: 100 });
    else if (window.UF0864) window.UF0864.practicaHecha("caza-proceso", Math.round(ev.total / 10), 10);
    const nombre = window.UF0864 && window.UF0864.nombre();
    const nombrePid = (pid) => { const p = procPid(pid); return p ? p.nombre + " (" + pid + ")" : String(pid); };
    const escapados = ev.req.filter((pid) => !ev.aciertos.includes(pid));
    const capa = document.createElement("div");
    capa.className = "rt-capa";
    capa.innerHTML =
      '<section class="rt-panel rt-final" role="dialog" aria-modal="true" aria-labelledby="cz-final-titulo">' +
      '<p class="rt-antetitulo"><b>Caso</b> · ' + esc(M.titulo) + (DIFICIL ? (EXTRA ? " · Examen" : " · Modo difícil") : "") + "</p>" +
      '<h2 id="cz-final-titulo">' + (ev.total >= 70 ? "¡Amenaza cazada" + (nombre ? ", " + esc(nombre) : "") + "!" : (ev.total >= 40 ? "Caza a medias" : "Se te escapó la amenaza") + (nombre ? ", " + esc(nombre) : "")) + "</h2>" +
      '<p class="rt-total"><b>' + ev.total + "</b>/100</p>" +
      '<ul class="rt-desglose">' +
      "<li><span>Detección</span><b>" + ev.deteccion + "/20</b></li>" +
      "<li><span>Amenaza neutralizada</span><b>" + ev.neutral + "/30</b></li>" +
      "<li><span>Método</span><b>" + ev.ptsMetodo + "/30</b></li>" +
      "<li><span>Riesgos evitados</span><b>" + ev.ptsRiesgo + "/20</b></li>" +
      (ev.descuento ? "<li><span>Pistas</span><b>−" + ev.descuento + "</b></li>" : "") +
      "</ul>" +
      "<h3>Detección</h3><ul class=\"rt-lista\">" +
      (ev.req.length ? '<li class="' + (escapados.length ? "mal" : "ok") + '">' + (escapados.length ? "✗ " : "✓ ") + "Procesos maliciosos: " + esc(ev.req.map(nombrePid).join(", ")) + (escapados.length ? ". Se te escaparon: " + esc(escapados.map(nombrePid).join(", ")) : "") + "</li>"
        : '<li class="' + (ev.falsos.length ? "mal" : "ok") + '">' + (ev.falsos.length ? "✗ " : "✓ ") + "No había ningún proceso malicioso visible.</li>") +
      (ev.falsos.length ? '<li class="mal">✗ Señalaste procesos legítimos: ' + esc(ev.falsos.map(nombrePid).join(", ")) + "</li>" : "") +
      M.preguntas.map(([q, ops], i) => '<li class="' + (E.respuestas[i] ? "ok" : "mal") + '">' + (E.respuestas[i] ? "✓ " : "✗ ") + esc(q) + (E.respuestas[i] ? "" : " Era: " + esc(ops[0]) + ".") + "</li>").join("") +
      "</ul>" +
      '<h3>Amenaza neutralizada</h3><ul class="rt-lista">' + ev.items.map(([txt, ok]) => '<li class="' + (ok ? "ok" : "mal") + '">' + (ok ? "✓ " : "✗ ") + esc(txt) + "</li>").join("") + "</ul>" +
      '<h3>Método</h3><ul class="rt-lista">' + ev.metodo.map(([txt, ok]) => '<li class="' + (ok ? "ok" : "mal") + '">' + (ok ? "✓ " : "✗ ") + esc(txt) + "</li>").join("") + "</ul>" +
      (ev.riesgos.length ? '<h3>Riesgos asumidos</h3><ul class="rt-lista">' + ev.riesgos.map((r) => '<li class="mal">−' + r.puntos + " · " + esc(r.texto) + "</li>").join("") + "</ul>" : '<p class="rt-bien">No asumiste ningún riesgo innecesario.</p>') +
      (EXTRA ? "" : '<h3>Así se resolvía</h3><p>' + esc(M.solucion) + "</p>") +
      (ESCAPE ? '<p class="rt-bien">Reto terminado. Sigue en la sala: el candado ya está a la vista.</p>'
        : '<div class="rt-acciones"><a class="rt-boton" href="software.html">Volver al mapa</a><button type="button" class="rt-boton rt-secundario" data-otra>Otro equipo</button></div>') +
      "</section>";
    document.body.appendChild(capa);
    if (ESCAPE) return;
    capa.querySelector("[data-otra]").addEventListener("click", () => { capa.remove(); portada(); });
    capa.querySelector("a.rt-boton").focus();
  };

  const reto = ESCAPE && ESCENARIOS.concat(EXTRA && EXTRA.caza ? EXTRA.caza({ proc, app_, MS, SYS32 }) : []).find((m) => m.id === ESCAPE);
  /* En el examen (casos que llegan de la página del examen) no hay pistas, objetivos ni consejos. */
  if (reto) { DIFICIL = !!EXTRA; empezar(reto); } else portada();
})();
