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

  const PARAMS = new URLSearchParams(location.search);
  const PREVIA = PARAMS.has("profe");
  /* Dentro del escape room (escape-uf0864.html) el reto llega por ?escape=<id> y la nota vuelve a la sala. */
  const ESCAPE = PARAMS.get("escape");
  const avisarSala = (datos) => { if (window.parent !== window) window.parent.postMessage(Object.assign({ tipo: "escape-reto", juego: "rescate" }, datos), location.origin); };
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
  const COSTE_PRIVACIDAD = 5;

  /* Modo difícil: sin pistas, sin objetivos y sin consejos. Los errores dicen qué ha fallado, nunca qué escribir. */
  const CLAVE_MODO = "rescate-modo";
  let DIFICIL = false;
  try { DIFICIL = localStorage.getItem(CLAVE_MODO) === "dificil"; } catch (e) { /* sin almacenamiento */ }
  const guardarModo = () => { try { localStorage.setItem(CLAVE_MODO, DIFICIL ? "dificil" : "normal"); } catch (e) { /* sin almacenamiento */ } };

  /* ---------- Misiones ----------
     grupos: los archivos del cliente, agrupados por carpeta. peso: lo que le importan al cliente.
     estado: visible (se ve al montar), borrado (Papelera vaciada) o perdido (partición RAW).
     danados: archivos en sectores dañados. */
  const MISIONES = [
    {
      id: "raw", sesion: "S16", desde: "2026-10-19", equipo: "PC-014", modo: "particion",
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
      id: "falla", sesion: "S16", desde: "2026-10-19", equipo: "PC-016", modo: "clon",
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
      id: "borrado", sesion: "S21", desde: "2026-10-26", equipo: "PC-021", modo: "sinEscribir",
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
    },
    {
      id: "noarranca", sesion: "S15", desde: "2026-10-16", equipo: "PC-015", modo: "copiarAntes",
      titulo: "El portátil que no arranca",
      resumen: "Reparación automática en bucle. Hay que reinstalar Windows, pero antes, los datos.",
      orden: [
        "ORDEN DE TRABAJO 2026-1015 · Equipo PC-015",
        "Cliente: Andrés (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: el portátil muestra «Preparando reparación automática» en cada arranque y nunca llega al escritorio.",
        "Se ha intentado reparar el arranque sin éxito: se va a reinstalar Windows en el mismo disco.",
        "Antes de reinstalar hay que salvar sus documentos. No tiene ninguna copia.",
        "Encargo: copiar sus datos al disco del taller (/mnt/taller) y dejar el disco listo para reinstalar."
      ],
      disco: { modelo: "Crucial MX500 500GB", tam: "465,8G", tipo: "SSD", salud: "bueno", smart: [0, 0, 0], fs: "ntfs", etiqueta: "Windows", copia: "nunca" },
      grupos: [
        { id: "docs", carpeta: "Users/Andres/Documentos", n: 512, peso: 4, estado: "visible", muestras: ["oposiciones/", "nominas_2026.pdf", "contrato_alquiler.pdf"] },
        { id: "escritorio", carpeta: "Users/Andres/Escritorio", n: 38, peso: 2, estado: "visible", muestras: ["cv_actualizado.docx", "presupuesto_reforma.xlsx"] },
        { id: "fotos", carpeta: "Users/Andres/Imagenes", n: 960, peso: 3, estado: "visible", muestras: ["2025_boda/", "movil_2026/"] },
        { id: "sistema", carpeta: "Windows", n: 4100, peso: 0, estado: "visible", muestras: ["System32/", "explorer.exe"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "Montar el disco sin escribir en él", recuperar: "Copiar los datos al disco del taller", verificar: "Verificar la copia", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Antes de nada, mira si el disco está sano: disk smart sdb.",
        proteger: "Monta la partición en solo lectura: mount -r sdb1 /mnt/cliente.",
        recuperar: "Los archivos se ven: cópialos con backup /mnt/cliente /mnt/taller/andres.",
        verificar: "Comprueba la copia antes de reinstalar: verify /mnt/taller/andres.",
        informe: "Con la copia verificada ya se podría formatear e instalar. Escribe informe."
      },
      preguntas: [
        ["¿Por qué se copian los datos antes de reinstalar?", ["Porque reinstalar puede formatear la partición y borrar los documentos", "Porque Windows no se instala si el disco tiene archivos", "Porque así la instalación va más rápida"]],
        ["¿Por qué en este caso no hizo falta clonar el disco?", ["El S.M.A.R.T. estaba bien: el fallo era del sistema, no del disco", "Porque los SSD no se pueden clonar", "Porque clonar borra el disco de origen"]]
      ],
      solucion: "Una avería lógica de arranque con el disco sano. Se monta en solo lectura, se copian los datos a otro disco, se verifica la copia y solo entonces se reinstala."
    },
    {
      id: "bitlocker", sesion: "S15", desde: "2026-10-16", equipo: "PC-018", modo: "desbloquear",
      titulo: "El SSD cifrado",
      resumen: "La placa del portátil ha muerto y su SSD está cifrado con BitLocker.",
      orden: [
        "ORDEN DE TRABAJO 2026-1018 · Equipo PC-018",
        "Cliente: Nuria (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: la placa base del portátil no enciende. El SSD está bien y se ha conectado al equipo de rescate.",
        "El portátil traía Windows 11 con el cifrado del dispositivo (BitLocker) activado.",
        "La cliente ha impreso las claves de recuperación de su cuenta Microsoft: están en clave_recuperacion.txt.",
        "Encargo: sacar sus documentos al disco del taller (/mnt/taller) para pasarlos a su portátil nuevo."
      ],
      disco: { modelo: "Samsung PM991 512GB NVMe", tam: "476,9G", tipo: "SSD", salud: "bueno", smart: [0, 0, 0], fs: "bitlocker", etiqueta: "OS", copia: "nunca",
        claveId: "8F3A2C71", clave: "403953-118206-520751-296043-610984-037224-705342-148819",
        claves: [
          "Claves de recuperación de BitLocker · Cuenta Microsoft de la cliente (impreso por ella)",
          "",
          "Dispositivo: NURIA-PORTATIL (portátil viejo)",
          "  Id. de clave: 8F3A2C71",
          "  Clave: 403953-118206-520751-296043-610984-037224-705342-148819",
          "",
          "Dispositivo: NURIA-TABLET",
          "  Id. de clave: 2D9B6E04",
          "  Clave: 158312-660231-047795-392876-201410-583097-614185-270006",
          "",
          "Dispositivo: NURIA-PORTATIL (unidad USB «Trabajo»)",
          "  Id. de clave: 8F3A9D15",
          "  Clave: 712085-300421-659813-024497-118250-466378-090244-537711"
        ] },
      grupos: [
        { id: "docs", carpeta: "Users/Nuria/Documentos", n: 780, peso: 4, estado: "visible", muestras: ["proyecto_fin_master.docx", "facturas/", "declaracion_2025.pdf"] },
        { id: "fotos", carpeta: "Users/Nuria/Imagenes", n: 2140, peso: 3, estado: "visible", muestras: ["2026_erasmus/", "familia/"] },
        { id: "sistema", carpeta: "Windows", n: 4100, peso: 0, estado: "visible", muestras: ["System32/"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "Desbloquear el volumen con la clave de la cliente", recuperar: "Copiar los datos al disco del taller", verificar: "Verificar la copia", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Mira si el SSD está sano: disk smart sdb.",
        proteger: "Mira el identificador de la clave con bitlocker status sdb1 y busca la clave que coincide en clave_recuperacion.txt. Luego: bitlocker unlock sdb1 --clave <clave>.",
        recuperar: "Con el volumen desbloqueado, monta en solo lectura (mount -r sdb1 /mnt/cliente) y copia con backup /mnt/cliente /mnt/taller/nuria.",
        verificar: "Comprueba la copia: verify /mnt/taller/nuria.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      preguntas: [
        ["¿Por qué no se podía montar el SSD?", ["Estaba cifrado con BitLocker y hacía falta la clave de recuperación", "Tenía el sistema de archivos dañado (RAW)", "El SSD estaba averiado"]],
        ["¿De dónde sale la clave de recuperación de BitLocker?", ["De la cuenta Microsoft de la cliente o de la copia que guardó", "Del firmware del equipo de rescate", "Se puede saltar con TestDisk"]]
      ],
      solucion: "El volumen estaba cifrado con BitLocker. Con el identificador de la clave se elige la clave de recuperación correcta de la cuenta Microsoft, se desbloquea, se monta en solo lectura y se copian los datos."
    },
    {
      id: "particion", sesion: "S16", desde: "2026-10-19", equipo: "PC-017", modo: "particion",
      titulo: "La partición borrada",
      resumen: "El disco de datos sale como espacio no asignado. El S.M.A.R.T. está bien.",
      orden: [
        "ORDEN DE TRABAJO 2026-1017 · Equipo PC-017",
        "Cliente: Javier (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: su sobrino quiso hacer sitio para otro sistema con Administración de discos y eliminó un volumen.",
        "Desde entonces el disco de datos aparece como espacio no asignado, sin letra. No ha creado nada encima.",
        "Ahí están la contabilidad de su negocio y los vídeos de sus hijos. No hay copia.",
        "Encargo: recuperar los datos y dejarlos en el disco del taller (/mnt/taller)."
      ],
      disco: { modelo: "Seagate BarraCuda 2TB", tam: "1,8T", tipo: "HDD", salud: "bueno", smart: [0, 0, 0], fs: "ninguna", etiqueta: "DATOS", copia: "nunca" },
      grupos: [
        { id: "conta", carpeta: "Contabilidad", n: 1240, peso: 4, estado: "perdido", muestras: ["facturas_2026.xlsx", "modelo_303/", "clientes.accdb"] },
        { id: "videos", carpeta: "Videos", n: 310, peso: 3, estado: "perdido", muestras: ["festival_cole.mp4", "primeros_pasos.mp4"] },
        { id: "musica", carpeta: "Musica", n: 4200, peso: 1, estado: "perdido", muestras: ["discografia/"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "Recuperar la partición sin crear otra", recuperar: "Copiar los datos al disco del taller", verificar: "Verificar lo recuperado", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk. Fíjate en que sdb no tiene particiones.",
        salud: "Antes de tocar nada, mira si el disco está sano: disk smart sdb.",
        proteger: "Disco sano y partición eliminada: testdisk sdb, búsqueda rápida y comprueba los archivos con P.",
        recuperar: "Copia los archivos desde TestDisk (C), o escribe la tabla, monta en solo lectura y usa backup /mnt/cliente /mnt/taller/javier.",
        verificar: "Comprueba lo recuperado: verify /mnt/taller/javier.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      preguntas: [
        ["¿Qué le había pasado al disco?", ["Se eliminó la partición, pero los datos siguen ahí", "El disco tiene sectores dañados", "Los archivos se borraron uno a uno"]],
        ["¿Por qué se puede usar TestDisk en este disco?", ["Porque el S.M.A.R.T. está bien: el disco está sano", "Porque TestDisk repara los sectores dañados", "Porque es la forma de formatear el disco"]]
      ],
      solucion: "Eliminar un volumen solo borra su entrada de la tabla de particiones. Con el disco sano, TestDisk encuentra la partición, se comprueban sus archivos y se copian a otro disco."
    },
    {
      id: "tarjeta", sesion: "S21", desde: "2026-10-26", equipo: "PC-022", modo: "sinEscribir",
      titulo: "La tarjeta de la cámara",
      resumen: "El móvil «formateó» sin querer la tarjeta SD con las fotos de la boda.",
      orden: [
        "ORDEN DE TRABAJO 2026-1022 · Equipo PC-022",
        "Cliente: Irene, fotógrafa (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: metió la tarjeta SD de su cámara en el móvil, el móvil dijo que estaba dañada y ella pulsó «Formatear».",
        "La tarjeta funciona y ahora sale vacía. No ha hecho fotos nuevas con ella.",
        "Ahí estaban las fotos (RAW y JPG) de una boda que tiene que entregar esta semana.",
        "Encargo: recuperar las fotos y dejarlas en el disco del taller (/mnt/taller)."
      ],
      disco: { modelo: "SanDisk Extreme SD 64GB", tam: "59,5G", tipo: "SD", salud: "bueno", smart: null, fs: "exfat", etiqueta: "Untitled", copia: "nunca", formateado: true },
      grupos: [
        { id: "raw", carpeta: "DCIM/100CANON (RAW)", n: 1180, peso: 4, estado: "borrado", muestras: ["IMG_4410.CR3", "IMG_4411.CR3"] },
        { id: "jpg", carpeta: "DCIM/100CANON (JPG)", n: 1180, peso: 3, estado: "borrado", muestras: ["IMG_4410.JPG", "IMG_4411.JPG"] },
        { id: "video", carpeta: "DCIM/100CANON (vídeo)", n: 14, peso: 1, estado: "borrado", muestras: ["MVI_4502.MP4"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar que la tarjeta se lee bien", proteger: "No escribir en la tarjeta", recuperar: "Recuperar las fotos a otro disco", verificar: "Verificar lo recuperado", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Comprueba la tarjeta: disk status sdb.",
        proteger: "El formato rápido deja un índice vacío, pero las fotos siguen ahí hasta que algo escriba encima. Si montas, en solo lectura.",
        recuperar: "Sin índice, toca buscar por contenido (PhotoRec): recover sdb1 --destino /mnt/taller/irene --firmas",
        verificar: "Comprueba lo recuperado: verify /mnt/taller/irene.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      preguntas: [
        ["¿Por qué hubo que buscar las fotos por su contenido (--firmas)?", ["El formato rápido dejó un índice nuevo y vacío: ya no había nombres que leer", "Porque las tarjetas SD no tienen sistema de archivos", "Porque así se recuperan con sus nombres originales"]],
        ["Una tarjeta SD es memoria flash, como un SSD. ¿Por qué se pudo recuperar?", ["Normalmente las tarjetas SD no reciben TRIM: lo borrado sigue ahí hasta que se escribe encima", "Porque las tarjetas SD guardan una copia oculta de todo", "Porque el móvil no llegó a formatearla"]]
      ],
      solucion: "Un formato rápido es un borrado lógico. Sin escribir en la tarjeta, PhotoRec (--firmas) encuentra las fotos por su contenido y se guardan en otro disco, sin sus nombres originales."
    },
    {
      id: "clac", sesion: "S21", desde: "2026-10-26", equipo: "PC-023", modo: "derivar", fisico: true,
      titulo: "El disco que hace clac",
      resumen: "Un disco externo se cayó de la mesa encendido. Ahora hace «clac, clac».",
      orden: [
        "ORDEN DE TRABAJO 2026-1023 · Equipo PC-023",
        "Cliente: Rosa (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: su disco externo se cayó de la mesa mientras estaba encendido.",
        "Desde entonces, al conectarlo hace «clac, clac» cada pocos segundos y Windows no abre la unidad.",
        "Tiene ahí quince años de fotos de la familia y la documentación de la herencia de su padre.",
        "Encargo: salvar sus datos (destino: disco del taller, /mnt/taller)."
      ],
      disco: { modelo: "Toshiba Canvio 2TB", tam: "1,8T", tipo: "HDD", salud: "malo", smart: null, fs: "ntfs", etiqueta: "ROSA", copia: "nunca" },
      grupos: [
        { id: "fotos", carpeta: "Fotos", n: 9600, peso: 4, estado: "visible", muestras: ["2011_comunion/", "2019_navidad/"] },
        { id: "herencia", carpeta: "Herencia", n: 64, peso: 3, estado: "visible", muestras: ["escrituras.pdf", "testamento.pdf"] }
      ],
      objetivosOrden: ["identificar", "salud", "derivar", "informe"],
      objetivos: { identificar: "Identificar los discos", salud: "Diagnosticar el tipo de fallo", derivar: "Decidir qué hacer con el disco", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Mira qué dice el sistema del disco sin leerlo a fondo: disk status sdb y cat /var/log/kern.log.",
        derivar: "Clics al conectarlo = cabezales dañados. No se intenta leer: derivar sdb.",
        informe: "Escribe informe."
      },
      preguntas: [
        ["¿Por qué no se intenta recuperar en el taller?", ["Los clics son de un fallo físico: cada encendido puede rayar los platos", "Porque ddrescue no funciona con discos externos", "Porque el disco es demasiado grande"]],
        ["¿Qué le dices a la cliente?", ["Que va a un laboratorio con sala limpia y que no lo vuelva a encender", "Que lo meta en el congelador y lo pruebe otra vez", "Que lo formatee para que deje de hacer ruido"]]
      ],
      solucion: "Clics después de un golpe son un fallo físico (cabezales). El técnico no lo vuelve a encender: lo apaga, lo etiqueta y lo deriva a un laboratorio profesional."
    },
    {
      id: "restablecer", sesion: "S17", desde: "2026-10-20", equipo: "PC-024", modo: "copiarAntes",
      titulo: "Antes de restablecer",
      resumen: "La reparación automática ha fallado dos veces. Se va a restablecer el equipo con «Quitar todo».",
      orden: [
        "ORDEN DE TRABAJO 2026-1024 · Equipo PC-024",
        "Cliente: Pilar (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: tras un pantallazo azul, Windows entra siempre en «Preparando reparación automática» y dice «No se pudo reparar el equipo».",
        "El SrtTrail.txt nombra un archivo del sistema dañado. Se ha decidido Restablecer este equipo con «Quitar todo».",
        "«Quitar todo» borra sus documentos, y no tiene ninguna copia.",
        "Encargo: copiar sus datos al disco del taller (/mnt/taller) antes de restablecer."
      ],
      disco: { modelo: "Kingston NV2 1TB NVMe", tam: "931,5G", tipo: "SSD", salud: "bueno", smart: [0, 0, 0], fs: "ntfs", etiqueta: "Windows", copia: "nunca" },
      grupos: [
        { id: "docs", carpeta: "Users/Pilar/Documentos", n: 640, peso: 4, estado: "visible", muestras: ["contabilidad_tienda.xlsx", "pedidos_2026/", "contrato_local.pdf"] },
        { id: "fotos", carpeta: "Users/Pilar/Imagenes", n: 1830, peso: 3, estado: "visible", muestras: ["escaparate_navidad/", "familia_2026/"] },
        { id: "escritorio", carpeta: "Users/Pilar/Escritorio", n: 22, peso: 2, estado: "visible", muestras: ["tarifas_proveedores.pdf", "pendientes.txt"] },
        { id: "sistema", carpeta: "Windows", n: 4100, peso: 0, estado: "visible", muestras: ["System32/", "Logs/"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "Montar el disco sin escribir en él", recuperar: "Copiar los datos al disco del taller", verificar: "Verificar la copia", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Antes de nada, mira si el disco está sano: disk smart sdb.",
        proteger: "Monta la partición en solo lectura: mount -r sdb1 /mnt/cliente.",
        recuperar: "Los archivos se ven: cópialos con backup /mnt/cliente /mnt/taller/pilar.",
        verificar: "Comprueba la copia antes de restablecer: verify /mnt/taller/pilar.",
        informe: "Con la copia verificada ya se podría restablecer. Escribe informe."
      },
      preguntas: [
        ["¿Por qué se copian los datos antes de Restablecer este equipo?", ["Porque con «Quitar todo» se borran también los documentos", "Porque Restablecer no funciona si el disco tiene archivos", "Porque así Windows se reinstala más rápido"]],
        ["La reparación automática ya ha fallado dos veces. ¿Qué toca hacer?", ["No lanzarla una tercera vez: leer el SrtTrail.txt, que dice qué ha encontrado", "Repetirla hasta que funcione", "Desconectar el SSD y volver a probar"]]
      ],
      solucion: "Avería lógica de Windows con el disco sano. Antes de Restablecer con «Quitar todo», se monta en solo lectura, se copian los datos a otro disco y se verifica la copia."
    },
    {
      id: "pantallazo", sesion: "S17", desde: "2026-10-20", equipo: "PC-025", modo: "clon",
      titulo: "El pantallazo que avisaba",
      resumen: "CRITICAL_PROCESS_DIED cada día. Alguien quiere pasar CHKDSK /r, pero el disco tiene sectores pendientes.",
      orden: [
        "ORDEN DE TRABAJO 2026-1025 · Equipo PC-025",
        "Cliente: Tomás (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: pantallazo azul CRITICAL_PROCESS_DIED varias veces al día, y cada vez tarda más en arrancar.",
        "Un compañero ha dejado una nota: «Pasar chkdsk /r y sfc /scannow». El disco se ha conectado al equipo de rescate.",
        "Su última copia es de hace un mes. Lo urgente: las fotos de su estudio de fotografía.",
        "Encargo: salvar todo lo posible en el disco del taller (/mnt/taller)."
      ],
      disco: { modelo: "WD Blue 1TB", tam: "931,5G", tipo: "HDD", salud: "precaucion", smart: [96, 63, 8], fs: "ntfs", etiqueta: "Windows", copia: "hace un mes" },
      grupos: [
        { id: "estudio", carpeta: "Estudio", n: 2600, peso: 4, estado: "visible", danados: 31, muestras: ["sesion_boda_garcia/", "book_marina/", "presupuestos.xlsx"] },
        { id: "docs", carpeta: "Documentos", n: 410, peso: 3, estado: "visible", danados: 9, muestras: ["facturas_2026/", "modelo_130.pdf"] },
        { id: "escritorio", carpeta: "Escritorio", n: 35, peso: 1, estado: "visible", danados: 2, muestras: ["ideas_web.txt"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "Clonar el disco antes de tocarlo", recuperar: "Recuperar los archivos a otro disco", verificar: "Verificar lo recuperado", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Antes de reparar nada, mira el S.M.A.R.T.: disk smart sdb.",
        proteger: "Hay sectores pendientes: nada de CHKDSK /r. Clona primero: ddrescue -n sdb /mnt/taller/tomas.img rescate.map",
        recuperar: "Recupera desde la imagen: recover /mnt/taller/tomas.img --destino /mnt/taller/tomas",
        verificar: "Comprueba lo recuperado: verify /mnt/taller/tomas.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      preguntas: [
        ["CRITICAL_PROCESS_DIED: ¿por qué se mira el S.M.A.R.T. antes de pasar SFC?", ["Porque ese pantallazo también lo provoca un disco que falla, y entonces primero van los datos", "Porque SFC no funciona en discos duros", "Porque el S.M.A.R.T. repara los archivos del sistema"]],
        ["¿Qué habría pasado con el chkdsk /r de la nota?", ["Horas de lecturas forzadas sobre un disco que se muere, y más archivos perdidos", "Habría reparado los sectores y recuperado todo", "Nada: CHKDSK no lee el disco"]]
      ],
      solucion: "El pantallazo era el síntoma de un disco que falla. Se mira el S.M.A.R.T., se clona con ddrescue sin insistir en lo dañado y se recupera desde la imagen. SFC y CHKDSK, después y en otro disco."
    },
    {
      id: "eventos", sesion: "S18", desde: "2026-10-21", equipo: "PC-026", modo: "clon",
      titulo: "Lo que decía el Visor de eventos",
      resumen: "El registro Sistema está lleno de eventos 7 de «disk». El equipo se congela al guardar.",
      orden: [
        "ORDEN DE TRABAJO 2026-1026 · Equipo PC-026",
        "Cliente: Elena (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: el equipo se congela unos segundos al abrir o guardar archivos.",
        "En el Visor de eventos hay decenas de eventos 7 (origen disk): «El dispositivo tiene un bloque defectuoso».",
        "Su última copia es de hace 20 días. Lo urgente: la tesis doctoral.",
        "Encargo: salvar todo lo posible en el disco del taller (/mnt/taller)."
      ],
      disco: { modelo: "Seagate BarraCuda 2TB", tam: "1,8T", tipo: "HDD", salud: "precaucion", smart: [340, 188, 41], fs: "ntfs", etiqueta: "DATOS", copia: "hace 20 días" },
      grupos: [
        { id: "tesis", carpeta: "Tesis", n: 260, peso: 4, estado: "visible", danados: 18, muestras: ["tesis_v14.docx", "bibliografia.bib", "datos_encuestas.xlsx"] },
        { id: "articulos", carpeta: "Articulos", n: 1150, peso: 2, estado: "visible", danados: 70, muestras: ["revision_2025/", "congreso_lisboa.pdf"] },
        { id: "fotos", carpeta: "Fotos", n: 3400, peso: 2, estado: "visible", danados: 160, muestras: ["2026_erasmus/", "familia/"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "Clonar el disco antes de tocarlo", recuperar: "Recuperar los archivos a otro disco", verificar: "Verificar lo recuperado", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "El evento 7 pide mirar el S.M.A.R.T.: disk smart sdb.",
        proteger: "Con sectores pendientes, clona primero: ddrescue -n sdb /mnt/taller/elena.img rescate.map, y luego reintenta con -r3.",
        recuperar: "Recupera desde la imagen: recover /mnt/taller/elena.img --destino /mnt/taller/elena",
        verificar: "Comprueba lo recuperado: verify /mnt/taller/elena.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      preguntas: [
        ["¿Qué significa el evento 7 de origen «disk»?", ["Un bloque defectuoso en el disco: se mira el S.M.A.R.T. y se copian los datos", "Que un servicio no pudo iniciarse", "Que el equipo se apagó sin cerrar Windows"]],
        ["¿Para qué sirve el archivo de mapa de ddrescue?", ["Guarda lo ya copiado: la segunda pasada solo reintenta lo que falló", "Guarda la lista de archivos del cliente", "Repara los sectores dañados"]]
      ],
      solucion: "El Visor de eventos ya lo decía: bloques defectuosos. Se confirma con el S.M.A.R.T., se clona con ddrescue -n, se reintenta con -r3 y el mismo mapa, y se recupera desde la imagen."
    },
    {
      id: "drivers", sesion: "S18", desde: "2026-10-21", equipo: "PC-027", modo: "copiarAntes",
      titulo: "Reinstalar sin perder nada",
      resumen: "Windows está tan dañado que hay que reinstalar. Antes, sus proyectos de vídeo.",
      orden: [
        "ORDEN DE TRABAJO 2026-1027 · Equipo PC-027",
        "Cliente: Raúl, editor de vídeo (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: errores 7000 y 7034 de servicios en cada arranque y programas que se cierran. Se reinstalará Windows en el mismo disco.",
        "El equipo lleva una capturadora y una tarjeta de sonido de estudio: sus drivers ya se han exportado con dism /export-driver.",
        "Antes de reinstalar hay que salvar sus proyectos. No tiene ninguna copia.",
        "Encargo: copiar sus datos al disco del taller (/mnt/taller) y dejar el disco listo para reinstalar."
      ],
      disco: { modelo: "Samsung 870 EVO 2TB", tam: "1,8T", tipo: "SSD", salud: "bueno", smart: [0, 0, 0], fs: "ntfs", etiqueta: "Windows", copia: "nunca" },
      grupos: [
        { id: "proyectos", carpeta: "Users/Raul/Proyectos", n: 380, peso: 4, estado: "visible", muestras: ["anuncio_panaderia.prproj", "boda_laura_y_dani/", "videoclip_banda/"] },
        { id: "docs", carpeta: "Users/Raul/Documentos", n: 210, peso: 3, estado: "visible", muestras: ["facturas_2026/", "contratos_clientes/"] },
        { id: "drivers", carpeta: "Drivers_exportados", n: 46, peso: 2, estado: "visible", muestras: ["oem12.inf", "oem14.inf", "capturadora/"] },
        { id: "sistema", carpeta: "Windows", n: 4100, peso: 0, estado: "visible", muestras: ["System32/"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "Montar el disco sin escribir en él", recuperar: "Copiar los datos al disco del taller", verificar: "Verificar la copia", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Antes de nada, mira si el disco está sano: disk smart sdb.",
        proteger: "Monta la partición en solo lectura: mount -r sdb1 /mnt/cliente.",
        recuperar: "Copia los proyectos, los documentos y los drivers exportados: backup /mnt/cliente /mnt/taller/raul.",
        verificar: "Comprueba la copia antes de reinstalar: verify /mnt/taller/raul.",
        informe: "Con la copia verificada ya se podría reinstalar. Escribe informe."
      },
      preguntas: [
        ["¿Por qué se copia también la carpeta de drivers exportados?", ["Para reinstalarlos después con pnputil /add-driver sin tener que buscarlos", "Porque Windows no se instala sin ellos", "Porque los drivers son datos personales del cliente"]],
        ["Antes de reinstalar, ¿dónde se guarda la copia?", ["En otro disco: el de Windows se va a formatear", "En una partición D: del mismo disco", "En el escritorio del cliente"]]
      ],
      solucion: "Disco sano y Windows dañado. Se monta en solo lectura, se copian los proyectos, los documentos y los drivers exportados a otro disco, se verifica y entonces se reinstala."
    },
    {
      id: "infectado", sesion: "S19", desde: "2026-10-22", equipo: "PC-028", modo: "copiarAntes",
      titulo: "El equipo infectado",
      resumen: "Un troyano que vuelve tras limpiar. Se reinstala desde cero: antes, solo los datos.",
      orden: [
        "ORDEN DE TRABAJO 2026-1028 · Equipo PC-028",
        "Cliente: Sofía (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: un troyano vuelve después de limpiar con Defender sin conexión y con una segunda opinión. Se reinstalará Windows desde cero.",
        "El equipo ya está aislado de la red. Su disco está conectado al equipo de rescate.",
        "En Descargas hay instaladores y un «crack» de un programa: el sospechoso de la infección.",
        "Encargo: copiar sus datos al disco del taller (/mnt/taller) antes de reinstalar. Solo datos."
      ],
      disco: { modelo: "Crucial P3 500GB NVMe", tam: "465,8G", tipo: "SSD", salud: "bueno", smart: [0, 0, 0], fs: "ntfs", etiqueta: "Windows", copia: "nunca" },
      grupos: [
        { id: "docs", carpeta: "Users/Sofia/Documentos", n: 720, peso: 4, estado: "visible", muestras: ["oposiciones_temario/", "nominas_2026.pdf"] },
        { id: "fotos", carpeta: "Users/Sofia/Imagenes", n: 2950, peso: 3, estado: "visible", muestras: ["2026_mallorca/", "peques/"] },
        { id: "descargas", carpeta: "Users/Sofia/Descargas", n: 64, peso: 0, estado: "visible", muestras: ["PhotoEditor_Pro_crack.exe", "setup_conversor.exe"] },
        { id: "sistema", carpeta: "Windows", n: 4100, peso: 0, estado: "visible", muestras: ["System32/"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "Montar el disco sin escribir en él", recuperar: "Copiar solo los datos al disco del taller", verificar: "Verificar la copia", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Mira si el disco está sano: disk smart sdb.",
        proteger: "Monta la partición en solo lectura: mount -r sdb1 /mnt/cliente.",
        recuperar: "backup copia los documentos y las fotos, no los ejecutables: backup /mnt/cliente /mnt/taller/sofia.",
        verificar: "Comprueba la copia: verify /mnt/taller/sofia.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      preguntas: [
        ["Antes de reinstalar un equipo infectado, ¿qué se copia?", ["Solo datos: documentos, fotos y correo. Nada de .exe ni instaladores", "Todo el disco, para no dejarse nada", "Solo la carpeta Descargas, que es lo último que usó"]],
        ["¿Por qué se reinstala desde cero y no se vuelve a un punto de restauración?", ["Porque el malware puede estar también en el punto de restauración", "Porque los puntos de restauración borran los documentos", "Porque es más rápido"]]
      ],
      solucion: "La amenaza volvía tras limpiar: se reinstala desde un medio limpio. Antes se copian solo los datos (nada de ejecutables), en solo lectura y a otro disco, y se analizan en un equipo limpio antes de abrirlos."
    },
    {
      id: "ransomware", sesion: "S19", desde: "2026-10-22", equipo: "PC-029", modo: "sinEscribir",
      titulo: "Los originales del ransomware",
      resumen: "Todo terminado en .lockbit. El ransomware borró los originales después de cifrarlos.",
      orden: [
        "ORDEN DE TRABAJO 2026-1029 · Equipo PC-029",
        "Cliente: Manuel, de una gestoría (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: todos los documentos terminan en .lockbit y hay un README.txt en cada carpeta pidiendo 3.000 €.",
        "El equipo se aisló al momento y no se ha vuelto a encender. El disco duro (HDD) está en el equipo de rescate.",
        "Esta variante cifra una copia y borra el original: los originales podrían seguir en el disco como archivos borrados.",
        "Encargo: recuperar los originales al disco del taller (/mnt/taller). No hay copia de seguridad."
      ],
      disco: { modelo: "Toshiba P300 2TB", tam: "1,8T", tipo: "HDD", salud: "bueno", smart: [0, 0, 0], fs: "ntfs", etiqueta: "DATOS", copia: "nunca" },
      grupos: [
        { id: "clientes", carpeta: "Gestoria/Clientes", n: 4800, peso: 4, estado: "borrado", muestras: ["renta_2025_lopez.pdf", "nominas_octubre.xlsx"] },
        { id: "modelos", carpeta: "Gestoria/Modelos", n: 620, peso: 3, estado: "borrado", muestras: ["modelo_303_T3.pdf", "modelo_111.pdf"] },
        { id: "cifrados", carpeta: "Gestoria/Cifrados", n: 5420, peso: 0, estado: "visible", muestras: ["renta_2025_lopez.pdf.lockbit", "README.txt"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "No escribir en el disco del cliente", recuperar: "Recuperar los originales a otro disco", verificar: "Verificar lo recuperado", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Mira si el disco está sano: disk smart sdb.",
        proteger: "Los originales borrados siguen ahí hasta que algo escriba encima. Si montas, en solo lectura.",
        recuperar: "Recupera lo borrado a otro disco: recover sdb1 --destino /mnt/taller/manuel",
        verificar: "Comprueba lo recuperado: verify /mnt/taller/manuel.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      preguntas: [
        ["¿Qué se hace con los archivos .lockbit?", ["Se guardan: si algún día sale un descifrador en No More Ransom, harán falta", "Se borran para que no vuelvan a infectar", "Se pagan los 3.000 € para recuperarlos"]],
        ["Y a la gestoría, ¿qué más le dices?", ["Que puede que también se hayan robado datos: se denuncia y se pide ayuda a INCIBE (017)", "Que con recuperar los originales ya no hay nada más que hacer", "Que conecte su copia al equipo infectado para ver si está bien"]]
      ],
      solucion: "En un disco duro, los originales que borró el ransomware siguen ahí hasta que se sobrescriben. Sin escribir en él, se recuperan a otro disco. Los .lockbit se guardan por si sale un descifrador, y no se paga."
    },
    {
      id: "mir", sesion: "S20", desde: "2026-10-23", equipo: "PC-030", modo: "sinEscribir",
      titulo: "La copia que se borró sola",
      resumen: "El robocopy /MIR de cada noche borró de la copia la carpeta que el cliente borró por error.",
      orden: [
        "ORDEN DE TRABAJO 2026-1030 · Equipo PC-030",
        "Cliente: Lucía (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: el martes borró sin querer la carpeta de facturas. Su copia nocturna es robocopy D:\\Datos E:\\Copia /MIR.",
        "El jueves fue a la copia y la carpeta tampoco estaba. Desconectó el disco de copias y lo ha traído.",
        "El disco de copias está sano. Desde el martes solo se ha escrito en él la copia de cada noche.",
        "Encargo: recuperar la carpeta del disco de copias al disco del taller (/mnt/taller)."
      ],
      disco: { modelo: "WD Elements 2TB", tam: "1,8T", tipo: "HDD", salud: "bueno", smart: [0, 0, 0], fs: "ntfs", etiqueta: "COPIAS", copia: "este disco es la copia" },
      grupos: [
        { id: "facturas", carpeta: "Copia/Facturas", n: 940, peso: 4, estado: "borrado", muestras: ["factura_2026_0412.pdf", "resumen_trimestre.xlsx"] },
        { id: "presupuestos", carpeta: "Copia/Presupuestos", n: 130, peso: 2, estado: "borrado", muestras: ["reforma_cocina.pdf"] },
        { id: "resto", carpeta: "Copia/Clientes", n: 2100, peso: 0, estado: "visible", muestras: ["fichas/", "contratos/"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "No escribir en el disco de copias", recuperar: "Recuperar lo borrado a otro disco", verificar: "Verificar lo recuperado", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Mira si el disco está sano: disk smart sdb.",
        proteger: "/MIR borró la carpeta del disco de copias, pero sigue ahí como borrada. Si montas, en solo lectura.",
        recuperar: "Recupera lo borrado a otro disco: recover sdb1 --destino /mnt/taller/lucia",
        verificar: "Comprueba lo recuperado: verify /mnt/taller/lucia.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      preguntas: [
        ["¿Por qué la copia tampoco tenía la carpeta?", ["/MIR deja el destino igual que el origen: el borrado se copió a la copia", "Porque el disco de copias está averiado", "Porque robocopy no copia carpetas con muchos archivos"]],
        ["¿Qué le propones para que no vuelva a pasar?", ["Una copia con versiones, como el Historial de archivos, en un disco que se desconecta", "Seguir con /MIR, pero cada hora", "Una partición D: en el mismo disco"]]
      ],
      solucion: "robocopy /MIR es una sincronización: copió también el borrado. El disco de copias está sano y la carpeta sigue ahí como borrada: se recupera sin escribir en él y se cambia la copia por una con versiones."
    },
    {
      id: "contrasena", sesion: "S20", desde: "2026-10-23", equipo: "PC-031", modo: "desbloquear",
      titulo: "La copia con contraseña",
      resumen: "El portátil ha muerto. La copia existe, pero está cifrada y nadie recuerda la contraseña.",
      orden: [
        "ORDEN DE TRABAJO 2026-1031 · Equipo PC-031",
        "Cliente: Óscar (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: su portátil no enciende. Por suerte tenía una copia en un disco externo… cifrado con BitLocker To Go.",
        "No recuerda la contraseña: nunca había probado a restaurar. En su cuenta Microsoft hay claves de recuperación.",
        "Las ha impreso todas en clave_recuperacion.txt. Solo una abre este disco.",
        "Encargo: sacar los datos de la copia al disco del taller (/mnt/taller)."
      ],
      disco: { modelo: "Seagate Expansion 1TB", tam: "931,5G", tipo: "HDD", salud: "bueno", smart: [0, 0, 0], fs: "bitlocker", etiqueta: "COPIA", copia: "este disco es la copia",
        claveId: "4C7E19B2", clave: "250393-617298-084711-439560-702174-338591-156035-921422",
        claves: [
          "Claves de recuperación de BitLocker · Cuenta Microsoft del cliente (impreso por él)",
          "",
          "Dispositivo: OSCAR-PC (disco del sistema)",
          "  Id. de clave: 4C7E1A03",
          "  Clave: 631807-245146-509212-077968-410432-196581-722469-358304",
          "",
          "Dispositivo: OSCAR-PC (unidad extraíble «COPIA»)",
          "  Id. de clave: 4C7E19B2",
          "  Clave: 250393-617298-084711-439560-702174-338591-156035-921422",
          "",
          "Dispositivo: OSCAR-PC (unidad extraíble «FOTOS»)",
          "  Id. de clave: 9A04E3C7",
          "  Clave: 480326-095414-713559-262691-034507-581118-649770-217943"
        ] },
      grupos: [
        { id: "docs", carpeta: "Copia/Documentos", n: 860, peso: 4, estado: "visible", muestras: ["declaracion_2025.pdf", "hipoteca/", "trabajo/"] },
        { id: "fotos", carpeta: "Copia/Imagenes", n: 3900, peso: 3, estado: "visible", muestras: ["2024_nacimiento_ines/", "2026_verano/"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "Desbloquear la copia con la clave correcta", recuperar: "Copiar los datos al disco del taller", verificar: "Verificar la copia", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Mira si el disco está sano: disk smart sdb.",
        proteger: "Mira el identificador de la clave con bitlocker status sdb1 y busca el que coincide entero en clave_recuperacion.txt. Luego: bitlocker unlock sdb1 --clave <clave>.",
        recuperar: "Con el volumen desbloqueado, monta en solo lectura (mount -r sdb1 /mnt/cliente) y copia con backup /mnt/cliente /mnt/taller/oscar.",
        verificar: "Comprueba la copia: verify /mnt/taller/oscar.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      preguntas: [
        ["¿Qué le faltaba a la copia de Óscar para ser fiable?", ["Una prueba de restauración: nunca había comprobado que podía abrirla", "Estar en el mismo disco que el portátil", "Hacerse con robocopy /MIR"]],
        ["¿Cómo sabes qué clave de recuperación es la buena?", ["Por el Id. de clave que da bitlocker status: tiene que coincidir entero", "Se prueban todas hasta que una funcione", "Es siempre la primera de la lista"]]
      ],
      solucion: "La copia existía, pero nunca se había probado y nadie recordaba la contraseña. Con el Id. de clave se elige la clave de recuperación correcta, se desbloquea, se monta en solo lectura y se copian los datos."
    },
    {
      id: "clean", sesion: "S21", desde: "2026-10-26", equipo: "PC-032", modo: "particion",
      titulo: "El disco equivocado",
      resumen: "Un diskpart clean en el disco que no era. Ahora todo es espacio no asignado.",
      orden: [
        "ORDEN DE TRABAJO 2026-1032 · Equipo PC-032",
        "Cliente: Beatriz (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: quiso preparar un pendrive con diskpart, eligió el disco por el número y lanzó clean… sobre su disco de datos.",
        "Ahora el disco sale entero como espacio no asignado. No ha creado ni formateado nada encima.",
        "Ahí están las partituras y grabaciones de su escuela de música. No hay copia.",
        "Encargo: recuperar los datos y dejarlos en el disco del taller (/mnt/taller)."
      ],
      disco: { modelo: "WD Red Plus 4TB", tam: "3,6T", tipo: "HDD", salud: "bueno", smart: [0, 0, 0], fs: "ninguna", etiqueta: "MUSICA", copia: "nunca" },
      grupos: [
        { id: "partituras", carpeta: "Partituras", n: 1820, peso: 4, estado: "perdido", muestras: ["grado_elemental/", "concierto_navidad.pdf"] },
        { id: "grabaciones", carpeta: "Grabaciones", n: 640, peso: 3, estado: "perdido", muestras: ["audicion_junio_2026/", "coro_ensayo.wav"] },
        { id: "gestion", carpeta: "Gestion", n: 190, peso: 2, estado: "perdido", muestras: ["alumnos_2026.xlsx", "recibos/"] }
      ],
      objetivos: { identificar: "Identificar los discos", salud: "Comprobar la salud del disco", proteger: "Recuperar la partición sin crear otra", recuperar: "Copiar los datos al disco del taller", verificar: "Verificar lo recuperado", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk. Fíjate en que sdb no tiene particiones.",
        salud: "Antes de tocar nada, mira si el disco está sano: disk smart sdb.",
        proteger: "clean solo borra la tabla de particiones: testdisk sdb, búsqueda rápida y comprueba los archivos con P.",
        recuperar: "Copia los archivos desde TestDisk (C), o escribe la tabla, monta en solo lectura y usa backup /mnt/cliente /mnt/taller/beatriz.",
        verificar: "Comprueba lo recuperado: verify /mnt/taller/beatriz.",
        informe: "Cuando lo tengas todo, escribe informe."
      },
      preguntas: [
        ["¿Qué borra diskpart clean?", ["La tabla de particiones: los datos siguen en el disco hasta que se escriba encima", "Todos los datos, sector a sector", "Solo los archivos ocultos"]],
        ["En TestDisk, ¿por qué se pulsa P antes de Write?", ["Para ver los archivos y confirmar que es la partición buena antes de escribir", "Porque Write no funciona sin P", "Para formatear la partición encontrada"]]
      ],
      solucion: "clean solo vacía la tabla de particiones. Con el disco sano, TestDisk encuentra la partición, se comprueban sus archivos con P y se copian a otro disco (o se escribe la tabla y se copia en solo lectura)."
    },
    {
      id: "zumbido", sesion: "S21", desde: "2026-10-26", equipo: "PC-033", modo: "derivar", fisico: true,
      ruido: "bzzzz… iiiiii… (el motor intenta arrancar y no gira)", sintomaFisico: "zumbaba sin girar",
      titulo: "El disco que zumba",
      resumen: "El portátil se cayó encendido. Su disco zumba y chirría, pero no gira.",
      orden: [
        "ORDEN DE TRABAJO 2026-1033 · Equipo PC-033",
        "Cliente: Antonio (autoriza el acceso a sus datos para recuperarlos).",
        "Avería: el portátil se cayó de la mesa mientras copiaba. Desde entonces no arranca.",
        "Su disco duro, conectado al equipo de rescate, zumba y chirría unos segundos, pero no se oye girar.",
        "Tiene ahí los planos de su estudio de arquitectura y las fotos de sus hijos. No hay copia.",
        "Encargo: salvar sus datos (destino: disco del taller, /mnt/taller)."
      ],
      disco: { modelo: "HGST Travelstar 1TB", tam: "931,5G", tipo: "HDD", salud: "malo", smart: null, fs: "ntfs", etiqueta: "ANTONIO", copia: "nunca" },
      grupos: [
        { id: "planos", carpeta: "Planos", n: 2200, peso: 4, estado: "visible", muestras: ["vivienda_calle_mayor.dwg", "reforma_colegio/"] },
        { id: "fotos", carpeta: "Fotos", n: 6800, peso: 3, estado: "visible", muestras: ["2018_nacimiento_pablo/", "2026_playa/"] }
      ],
      objetivosOrden: ["identificar", "salud", "derivar", "informe"],
      objetivos: { identificar: "Identificar los discos", salud: "Diagnosticar el tipo de fallo", derivar: "Decidir qué hacer con el disco", informe: "Entregar el informe" },
      pistas: {
        identificar: "Empieza por saber qué discos hay: lsblk.",
        salud: "Mira qué dice el sistema del disco sin leerlo a fondo: disk status sdb y cat /var/log/kern.log.",
        derivar: "Zumbido sin giro tras un golpe = motor bloqueado o cabezales pegados. No se intenta leer: derivar sdb.",
        informe: "Escribe informe."
      },
      preguntas: [
        ["¿Qué indica un disco que zumba y no gira después de una caída?", ["Fallo físico: motor bloqueado o cabezales pegados a los platos", "Un sistema de archivos dañado", "Que le falta alimentación por USB"]],
        ["¿Qué le dices al cliente?", ["Que no lo vuelva a encender y que va a un laboratorio con sala limpia", "Que lo abramos en el taller para despegar los cabezales", "Que pruebe a darle un golpecito para que arranque"]]
      ],
      solucion: "Un disco que zumba sin girar tras un golpe tiene un fallo físico. Cada intento puede rayar los platos: se apaga, se etiqueta y se deriva a un laboratorio profesional."
    }
  ];

  const OBJETIVOS = ["identificar", "salud", "proteger", "recuperar", "verificar", "informe"];
  const objetivosDe = (m) => m.objetivosOrden || OBJETIVOS;

  /* ---------- Estado de la partida ---------- */
  let M = null, E = null, t = null;

  const nuevoEstado = (m) => ({
    disco: Object.assign({ desgaste: 0, montado: null, formateado: false, tablaEscrita: false }, m.disco, { smart: m.disco.smart && m.disco.smart.slice() }),
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
    formateoAlumno: false,
    formateoTrasCopia: false,
    derivado: false,
    golpes: 0,
    clavesMal: 0,
    lecturasOriginal: 0,
    respuestas: [],
    terminado: false
  });

  const objetivosRecuperar = () => E.grupos.filter((g) => g.peso > 0);
  const totalDanados = () => E.grupos.reduce((s, g) => s + g.danados, 0);
  const falla = () => E.disco.salud === "precaucion";
  const fisico = () => !!M.fisico;
  /* Cómo se nota el fallo físico: cada misión puede tener su ruido. */
  const sintomaFisico = () => M.sintomaFisico || "hacía clics";
  /* Consejo para el alumno: en modo difícil no se muestra. */
  const consejo = (texto, clase) => { if (!DIFICIL) t.escribir(texto, clase || "t-suave"); };
  /* Error con una parte que explica qué hacer: en modo difícil solo queda el error. */
  const fallo = (texto, ayuda, clase) => t.escribir(texto + (ayuda && !DIFICIL ? " " + ayuda : ""), clase || "t-error");
  const sinVolumen = (fs) => fs === "raw" || fs === "ninguna";
  const montable = (fs) => fs === "ntfs" || fs === "exfat";
  const fsNombre = (fs) => ({ ntfs: "NTFS", exfat: "exFAT", raw: "RAW", ninguna: "sin partición", bitlocker: "BitLocker" })[fs] || fs;

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
    if (!m || !montable(E.disco.fs)) return {};
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
    if (E.disco.fs === "ntfs") hijos["$Recycle.Bin"] = dir({});
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
    if (E.disco.fs === "ninguna") l.push(["[    3.960]  sdb: (la tabla de particiones no tiene ninguna entrada)", "t-aviso"]);
    if (E.disco.fs === "bitlocker") l.push(["[    4.022] sdb1: firma -FVE-FS- (volumen cifrado con BitLocker)", "t-aviso"]);
    if (fisico()) {
      l[1] = "[    3.871] sd 1:0:0:0: [sdb] " + E.disco.tam + " · " + E.disco.modelo + " (tardó 28 s en responder)";
      l.push(["[   31.402] ata2: hard resetting link", "t-error"]);
      l.push(["[   38.117] ata2.00: qc timeout (cmd 0x25)", "t-error"]);
      l.push(["[   38.118] sd 1:0:0:0: [sdb] READ CAPACITY failed", "t-error"]);
      l.push(["[   45.930] usb 2-1: USB disconnect · usb 2-1: new high-speed USB device (se reconecta)", "t-error"]);
      if (E.golpes) l.push(["[  " + (200 + E.golpes * 57) + ".004] blk_update_request: I/O error, dev sdb (" + fmt(E.golpes * 412) + " errores más)", "t-error"]);
    }
    return l;
  };

  const montarFS = () => {
    t.raiz = dir({
      home: dir({ rescue: dir({ "orden_trabajo.txt": archivo(() => M.orden), "LEEME.txt": archivo(() => [
        "Equipo de rescate con SystemRescue (Linux en vivo). Terminal simulada: nada de esto se ejecuta en tu ordenador.",
        ...(DIFICIL ? ["Ayuda: help <comando>."] : ["Discos: lsblk o disk list. Salud: disk smart <disco>. Ayuda: help <comando>.",
        "Recuerda: lo recuperado siempre a otro disco. Si el disco falla, primero se clona."])
      ]), ...(M.disco.clave ? { "clave_recuperacion.txt": archivo(() => M.disco.claves) } : {}) }) }),
      var: dir({ log: dir({ "kern.log": archivo(kernLog) }) }),
      dev: dir(() => {
        const b = () => archivo(["(dispositivo de bloques)"]);
        const h = { sda: b(), sda1: b(), sdb: b(), sdb1: b(), sdc: b(), sdc1: b() };
        if (E.disco.fs === "ninguna") delete h.sdb1;
        return h;
      }),
      mnt: dir({
        cliente: Object.assign(dir(carpetaCliente), { nota: () => (E.disco.montado ? "" : "(no hay nada montado aquí)") }),
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
    consejo("Para comprobar que lo recuperado está bien no hace falta abrirlo: usa verify <carpeta>. Los datos del cliente se tocan, pero no se miran.");
    return false;
  };

  /* ---------- Comandos del reto ---------- */
  const registrarComandos = () => {
    Terminal.basicos(t, {
      grupos: [
        ["Investigar", ["lsblk", "disk", "ls", "cd", "cat", "scan"]],
        ["Rescatar", ["mount", "umount", "clone", "ddrescue", "recover", "backup", "testdisk"]],
        ["Reparar (¡cuidado!)", ["chkdsk", "format", "bitlocker"]],
        ["Derivar", ["derivar"]],
        ["Terminar", ["verify", "informe"]],
        ["Ayuda", DIFICIL ? ["help", "clear", "history", "pwd"] : ["help", "pista", "clear", "history", "pwd"]]
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
        const fs = E.disco.fs;
        const filas = [
          ["NOMBRE", "TAMAÑO", "TIPO", "MODELO", "MONTADO EN"],
          ["sda", d.sda.tam, "disco", d.sda.modelo, ""],
          ["└─sda1", d.sda.tam, "part", "", "/ (sistema en vivo)"],
          ["sdb", d.sdb.tam, "disco", d.sdb.modelo + (E.disco.tipo === "SD" ? " (lector de tarjetas)" : ""), ""]
        ];
        if (fs !== "ninguna") filas.push(["└─sdb1", d.sdb.tam, "part", fs === "raw" ? "(RAW)" : fs === "bitlocker" ? "BitLocker (bloqueado)" : fsNombre(fs) + " " + E.disco.etiqueta, E.disco.montado ? E.disco.montado.dir + (E.disco.montado.ro ? " (solo lectura)" : "") : ""]);
        filas.push(["sdc", d.sdc.tam, "disco", d.sdc.modelo, ""], ["└─sdc1", d.sdc.tam, "part", "ext4 TALLER", "/mnt/taller"]);
        t.tabla(filas);
        if (fs === "ninguna") t.escribir("sdb no tiene particiones: todo el disco es espacio no asignado.", "t-aviso");
        if (fisico()) t.escribir("sdb ha tardado 28 segundos en aparecer.", "t-aviso");
        consejo("sdb es el disco del cliente; sdc, el disco del taller donde se guarda lo recuperado.");
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
        if (!r) return fallo("disk: no encuentro el disco «" + args[1] + "».", "Mira los nombres con lsblk.");
        if (r.disco !== "sdb") {
          const d = DISCOS()[r.disco];
          t.lineas(["Disco: " + d.modelo + " (" + d.tam + ")", "Función: " + d.rol, "Estado S.M.A.R.T.: Bueno"]);
          return;
        }
        hecho("salud");
        const s = E.disco.smart;
        const estado = falla() ? "Precaución" : "Bueno";
        const fs = E.disco.fs;
        const volumen = () => fs === "raw" ? "RAW (sistema de archivos no reconocido)" : fs === "ninguna" ? "no hay ninguna partición (espacio no asignado)" : fs === "bitlocker" ? "cifrado con BitLocker (bloqueado)" : fsNombre(fs) + " «" + E.disco.etiqueta + "»" + (E.disco.formateado ? " (vacío)" : "");
        if (fisico()) {
          t.escribir("Disco: " + E.disco.modelo + " (" + E.disco.tam + ", " + E.disco.tipo + ")");
          t.escribir("Estado: el disco tarda en responder, se desconecta y vuelve a conectarse solo.", "t-error");
          if (sub === "smart") t.escribir("No se puede leer el S.M.A.R.T.: el disco no contesta a tiempo (reinicios del enlace).", "t-error");
          t.escribir("Última copia de seguridad: " + E.disco.copia);
          return;
        }
        if (sub === "status") {
          t.escribir("Disco: " + E.disco.modelo + " (" + E.disco.tam + ", " + E.disco.tipo + ")");
          t.escribir("Estado: " + (falla() ? "errores de lectura detectados" : "sin errores") , falla() ? "t-error" : "t-ok");
          t.escribir((fs === "ninguna" ? "Particiones: " : "Volumen sdb1: ") + volumen(), sinVolumen(fs) || fs === "bitlocker" || E.disco.formateado ? "t-aviso" : "");
          if (falla()) t.escribir("Archivos afectados: " + fmt(totalDanados()), "t-aviso");
          t.escribir("Última copia de seguridad: " + E.disco.copia);
          if (s) t.escribir("S.M.A.R.T.: " + estado + "." + (DIFICIL ? "" : " Detalles con disk smart sdb."), "t-suave");
          return;
        }
        if (!s) {
          t.escribir("Este dispositivo no informa de S.M.A.R.T. (las tarjetas SD no lo tienen).", "t-aviso");
          t.escribir("Lectura de prueba de la tarjeta: sin errores.", "t-ok");
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
        if (falla()) consejo("Hay sectores que no se leen. Cada lectura intensa puede empeorarlo: primero se salvan los datos (S16, S21).", "t-aviso");
        else consejo("El disco está sano: el problema, si lo hay, es lógico.");
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
        if (r.disco !== "sdb") return t.escribir("scan: " + r.disco + " no es el disco del cliente.", "t-suave");
        accion();
        await t.progreso("Leyendo sectores de sdb", 1800);
        if (falla()) {
          estresar(3, "el examen de superficie");
          riesgo("scan", 6, "Examinaste la superficie de un disco con sectores pendientes: se dañaron más archivos.");
          fallo("Resultado: " + fmt(E.disco.smart[1]) + " sectores sin leer.", "No hagas más lecturas completas de este disco.");
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
        if (r.disco !== "sdb" || !r.part) return fallo("mount: " + o.pos[0] + ": no es una partición que se pueda montar aquí.", "Monta la partición del cliente, sdb1.");
        if (t.ruta(o.pos[1]) !== "/mnt/cliente") return fallo("mount: " + o.pos[1] + ": no es un punto de montaje disponible.", "Usa la carpeta /mnt/cliente para el disco del cliente.", "t-aviso");
        if (E.disco.fs === "raw") return t.escribir("mount: sdb1: tipo de sistema de archivos desconocido (RAW). No se puede montar.", "t-error");
        if (E.disco.fs === "bitlocker") return fallo("mount: sdb1: tipo de sistema de archivos desconocido (firma -FVE-FS-).", "Es un volumen cifrado con BitLocker: hay que desbloquearlo antes (help bitlocker).");
        if (E.disco.montado) return t.escribir("mount: sdb1 ya está montada en /mnt/cliente.", "t-aviso");
        E.disco.montado = { dir: "/mnt/cliente", ro };
        if (ro) {
          hecho("soloLectura");
          t.escribir("sdb1 montada en /mnt/cliente en solo lectura." + (DIFICIL ? "" : " Usa ls /mnt/cliente."), "t-ok");
          if (M.modo === "copiarAntes" && !E.escribioCliente) hecho("proteger");
        } else {
          accion();
          t.escribir("sdb1 montada en /mnt/cliente en lectura y escritura.");
          if (E.grupos.some((g) => g.estado === "borrado")) {
            escribirEnCliente(0.08, "al montar, el sistema actualizó su registro de cambios");
            riesgo("montarRW", 6, "Montaste el disco en lectura y escritura: el sistema escribió encima de archivos borrados.");
          } else if (falla()) {
            estresar(1, "el montaje");
            riesgo("montarRW", 3, "Montaste un disco que falla en lectura y escritura en vez de clonarlo.");
          } else if (!E.hechos.has("recuperar")) {
            E.escribioCliente = true;
            riesgo("montarRW", 2, "Montaste el disco del cliente en lectura y escritura antes de copiar sus datos: no hacía falta arriesgarse.");
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
      if (!r) return fallo("No encuentro el disco de origen «" + (origen || "") + "».", "Mira los nombres con lsblk.");
      if (r.disco !== "sdb") return fallo("Ese origen no es el disco que hay que rescatar.", "El origen debe ser el disco del cliente (sdb).");
      if (!destino) return fallo("Falta el destino.", "El destino es un archivo de imagen dentro del disco del taller (/mnt/taller).", "t-aviso");
      const rd = resolverDisco(destino);
      if (rd) return rd.disco === "sdb" ? t.escribir("Origen y destino son el mismo disco: eso destruiría los datos. ddrescue se niega.", "t-error") : fallo("Copiar sobre el disco entero " + rd.disco + " borraría todo lo que tiene.", "Usa un archivo de imagen: /mnt/taller/cliente.img");
      const dd = discoDeRuta(destino);
      if (dd === "sdb") return t.escribir("El destino está en el disco del cliente: nunca se guarda nada ahí.", "t-error");
      if (dd === "sda") return fallo("Ahí está el sistema en vivo (14,9 GB y en memoria): no cabe una imagen de " + E.disco.tam + ".", "Usa /mnt/taller.");
      if (!falla()) consejo("(Clonar un disco sano no es necesario, pero tampoco hace daño.)");
      accion();
      const ruta = t.ruta(destino);
      if (E.imagen && E.imagen.ruta === ruta) {
        if (!E.imagen.mapa || !mapa) consejo("Sin archivo de mapa, ddrescue no sabe qué copió antes y empieza de cero.", "t-aviso");
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
        consejo(E.imagen.mapa ? "Puedes reintentar lo que falta repitiendo con -r3 y el mismo mapa." : "Sin archivo de mapa no podrás reintentar solo lo que falta.");
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
      if (!txt) { fallo("Falta el destino.", "--destino <carpeta>, en el disco del taller (/mnt/taller/...).", "t-aviso"); return null; }
      if (resolverDisco(txt)) { fallo("El destino tiene que ser una carpeta, no un disco.", "Indica una carpeta dentro del disco del taller (/mnt/taller).", "t-aviso"); return null; }
      const d = discoDeRuta(txt);
      if (d === "sda") { fallo(t.ruta(txt) + " está en el sistema en vivo, que se borra al apagar.", "Guarda en /mnt/taller.", "t-error"); return null; }
      const ruta = t.ruta(txt);
      if (d === "sdc" && ruta === "/mnt/taller") { fallo("No se guarda suelto en la raíz del disco del taller.", "Usa una carpeta propia para este cliente dentro de /mnt/taller.", "t-aviso"); return null; }
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
        if (!origen) return DIFICIL && o.pos[0] ? t.escribir("recover: «" + o.pos[0] + "» no es un origen válido.", "t-error") : t.usoIncorrecto("recover", o.pos[0] ? "«" + o.pos[0] + "» no es un origen válido: usa sdb1 o la imagen clonada." : "Falta el origen.");
        const destino = destinoValido(o.valores.destino || o.pos[1]);
        if (!destino) return;
        const firmas = o.marcas.has("firmas");
        accion();
        const fs = origen.tipo === "imagen" ? E.imagen.estado.fs : E.disco.fs;
        const formateado = origen.tipo === "imagen" ? E.imagen.estado.formateado : E.disco.formateado;
        if (fs === "bitlocker") {
          await t.progreso(firmas ? "Buscando archivos por su firma" : "Leyendo el índice del volumen", 1200);
          t.escribir("Solo aparecen datos sin estructura: el volumen está cifrado. No se ha recuperado nada.", "t-aviso");
          consejo("Un volumen BitLocker hay que desbloquearlo antes con su clave de recuperación.");
          return;
        }
        if (sinVolumen(fs) && !firmas) {
          await t.progreso("Leyendo el índice del volumen", 900);
          t.escribir(fs === "raw" ? "No hay un sistema de archivos que leer (volumen RAW): no se encuentran nombres." : "No hay ninguna partición que leer: no se encuentran nombres.", "t-aviso");
          consejo("Opciones: recuperar la partición con testdisk, o buscar por contenido con --firmas (sin nombres).");
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
          if (formateado && firmas && E.formateoAlumno) { ok = Math.round(ok * 0.88); }
          if (!ok && !parcial) return;
          if (g.peso === 0 && g.estado === "visible" && !firmas) return;
          guardar(destino.ruta, g, ok, parcial, !firmas);
          total += ok; totalParcial += parcial;
        });
        if (destino.disco === "sdb") t.escribir("Cada archivo recuperado se escribió en el disco del cliente, encima de otros que aún no se habían recuperado.", "t-error");
        if (formateado && !firmas) return fallo("No aparece ningún archivo: el índice del volumen está vacío.", "El formato creó un índice nuevo: sin --firmas no aparece nada.", "t-aviso");
        t.escribir("Recuperados " + fmt(total) + " archivos" + (totalParcial ? " y " + fmt(totalParcial) + " incompletos (estaban en sectores dañados)" : "") + " en " + destino.ruta + ".", total ? "t-ok" : "t-aviso");
        if (firmas) t.escribir("Con --firmas salen sin nombre ni carpeta (f0001234.jpg…)" + (M.disco.formateado ? "." : ": al cliente le costará ordenarlos."), "t-suave");
        if (destino.disco === "sdc" && total) hecho("recuperar");
        if (M.modo === "sinEscribir" && !E.escribioCliente && total) hecho("proteger");
        consejo("Siguiente paso: comprueba lo recuperado con verify " + destino.ruta);
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
        if (!origen) return fallo("backup: " + o.pos[0] + ": no es un origen válido.", "El origen debe ser la carpeta montada /mnt/cliente.");
        if (origen.tipo === "imagen") return fallo("backup: " + o.pos[0] + " es una imagen, no una carpeta.", "Para sacar archivos de una imagen usa recover.", "t-aviso");
        if (origen.tipo === "disco" || !E.disco.montado) return fallo("backup: no hay archivos que copiar en ese origen.", "backup copia desde una carpeta montada: primero hay que montar la partición del cliente (help mount).", "t-aviso");
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
        consejo("Siguiente paso: comprueba la copia con verify " + destino.ruta);
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
          fallo("Errores de lectura durante el análisis.", "Con un disco que falla, TestDisk debe trabajar sobre una imagen.");
          return;
        }
        let vistos = false;
        for (;;) {
          const i = await t.elegir("¿Qué quieres hacer?", ["Analizar la tabla de particiones actual", "Búsqueda rápida de particiones (Quick Search)", "Búsqueda profunda (Deeper Search)", "Salir"]);
          if (i === -1 || i === 3) { t.escribir("Saliendo de TestDisk.", "t-suave"); return; }
          if (i === 0) {
            if (E.disco.fs === "raw") t.escribir("Partición 1: NTFS · " + E.disco.tam + " · sector de arranque dañado (el sistema la ve como RAW).", "t-aviso");
            else if (E.disco.fs === "ninguna") t.escribir("La tabla de particiones está vacía: no hay ninguna partición. Todo el disco es espacio no asignado.", "t-aviso");
            else if (E.disco.formateado) t.escribir("Partición 1: " + fsNombre(E.disco.fs) + " · " + E.disco.tam + " · «" + E.disco.etiqueta + "» (vacía, recién formateada).", "t-aviso");
            else { t.escribir("Partición 1: " + fsNombre(E.disco.fs) + " · " + E.disco.tam + " · «" + E.disco.etiqueta + "» · correcta.", "t-ok"); consejo("La tabla está bien: tu problema no está en la partición."); }
            continue;
          }
          await t.progreso(i === 1 ? "Buscando particiones" : "Buscando sector a sector", i === 1 ? 1200 : 2400);
          if (E.disco.formateado) {
            t.escribir("Solo aparece la partición nueva y vacía. La anterior ya no se encuentra: el formato la sustituyó.", "t-error");
            consejo("Queda buscar los archivos por su contenido: recover sdb1 --destino /mnt/taller/... --firmas");
            continue;
          }
          if (!sinVolumen(E.disco.fs)) { t.escribir("Encontrada: " + fsNombre(E.disco.fs) + " «" + E.disco.etiqueta + "», la misma que ya está en la tabla. No hay nada que reparar.", "t-suave"); continue; }
          t.escribir("Encontrada: P NTFS · " + E.disco.tam + " · «" + E.disco.etiqueta + "»", "t-ok");
          for (;;) {
            const j = await t.elegir("Partición encontrada. ¿Qué haces?", ["Ver sus archivos (P)", "Copiar los archivos a otro disco (C)", "Escribir la tabla y reparar el volumen (Write)", "Volver"]);
            if (j === -1 || j === 3) break;
            if (j === 0) {
              vistos = true;
              E.grupos.forEach((g) => t.escribir([["  " + g.carpeta.padEnd(12), "t-dir"], [fmt(g.n) + " archivos · " + g.muestras.join(", "), "t-suave"]]));
              consejo("Son las carpetas del cliente: es la partición buena.", "t-ok");
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
              consejo("Ahora monta en solo lectura y copia los datos a otro disco.");
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
        if (E.disco.fs === "bitlocker") return t.escribir("CHKDSK no puede abrir el volumen: está cifrado y bloqueado.", "t-error");
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
          if (M.modo === "copiarAntes" && !E.hechos.has("recuperar")) {
            E.escribioCliente = true;
            riesgo("chkdskAntes", 3, "Reparaste con CHKDSK el disco antes de copiar sus datos: una reparación puede mover o quitar archivos.");
          }
          t.escribir("CHKDSK ha terminado." + (DIFICIL ? "" : " Esto repara el sistema de archivos, pero no recupera nada."), "t-suave");
        } else if (falla()) fallo("Se encontraron errores de lectura.", "No repares ahora: primero los datos.", "t-aviso");
        else t.escribir("No se encontraron problemas en el sistema de archivos.", "t-ok");
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
        E.formateoTrasCopia = M.modo === "copiarAntes" && E.hechos.has("recuperar") && E.hechos.has("verificar");
        if (E.formateoTrasCopia) {
          E.disco.montado = null;
          if (t.cwd.startsWith("/mnt/cliente")) t.cwd = "/mnt";
          E.disco.fs = "ntfs"; E.disco.formateado = true; E.disco.etiqueta = "Nuevo vol";
          t.escribir("sdb1 formateada y lista para instalar Windows. Los datos del cliente ya estaban copiados y verificados.", "t-ok");
          return;
        }
        riesgo("formatear", 15, "Formateaste el disco del cliente antes de recuperar sus datos.");
        E.formateoAlumno = true;
        E.disco.montado = null;
        if (t.cwd.startsWith("/mnt/cliente")) t.cwd = "/mnt";
        E.disco.fs = E.disco.fs === "exfat" ? "exfat" : "ntfs";
        E.disco.formateado = true;
        E.disco.etiqueta = "Nuevo vol";
        E.grupos.forEach((g) => { if (g.estado === "visible" || g.estado === "perdido") g.estado = "borrado"; g.sobrescritos += Math.round((g.n - g.danados - g.sobrescritos) * 0.05); });
        t.escribir("sdb1 formateada. Ahora parece vacía.", "t-aviso");
        consejo("Solo quedaría buscar por contenido (--firmas), sin nombres.");
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
        if (!lista) return fallo("verify: en " + ruta + " no hay nada recuperado.", "Mira dónde lo guardaste con ls /mnt/taller.");
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
      oculto: DIFICIL,
      ejecutar() {
        if (DIFICIL) return t.escribir("Modo difícil: no hay pistas.", "t-aviso");
        const siguiente = objetivosDe(M).find((k) => !objetivoHecho(k));
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
        if (!E.hechos.has("recuperar") && !E.derivado) {
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
          if (DIFICIL) t.escribir("Respuesta anotada.", "t-suave");
          else t.escribir(orden[i].ok ? "Correcto." : "No es eso.", orden[i].ok ? "t-ok" : "t-error");
        }
        hecho("informe");
        E.terminado = true;
        terminar();
      }
    });

    t.registrar("bitlocker", {
      resumen: "Consulta o desbloquea un volumen cifrado con BitLocker.",
      uso: "bitlocker status <partición> | bitlocker unlock <partición> --clave <clave de recuperación>",
      detalle: ["status: dice si el volumen está cifrado y el identificador (Id.) de la clave que lo abre.", "unlock: lo desbloquea con la clave de recuperación de 48 cifras. Sin ella, los datos son ilegibles."],
      ejemplos: ["bitlocker status sdb1", "bitlocker unlock sdb1 --clave 111111-222222-333333-444444-555555-666666-777777-888888"],
      ejecutar(args) {
        const o = opciones(args, ["clave"]);
        const sub = (o.pos[0] || "").toLowerCase();
        if (sub !== "status" && sub !== "unlock") return t.usoIncorrecto("bitlocker", sub ? "No conozco la opción «" + o.pos[0] + "»." : "Falta qué quieres hacer.");
        const r = resolverDisco(o.pos[1]);
        if (!r) return t.usoIncorrecto("bitlocker", "Falta la partición.");
        if (r.disco !== "sdb" || !r.part) return t.escribir("bitlocker: " + o.pos[1] + ": no es un volumen BitLocker.", "t-error");
        const cifrado = !!M.disco.clave;
        if (sub === "status") {
          if (!cifrado) return t.escribir("sdb1: el volumen no está cifrado con BitLocker.");
          t.lineas(["Volumen: /dev/sdb1 (" + E.disco.tam + ")", "Cifrado: BitLocker, XTS-AES 128", "Estado: " + (E.disco.fs === "bitlocker" ? "bloqueado" : "desbloqueado"), "Protector de clave: contraseña numérica (clave de recuperación)", "Id. de clave: " + M.disco.claveId]);
          return;
        }
        if (!cifrado) return t.escribir("bitlocker: sdb1 no está cifrado: no hay nada que desbloquear.", "t-aviso");
        if (E.disco.fs !== "bitlocker") return t.escribir("bitlocker: sdb1 ya está desbloqueado.", "t-suave");
        const clave = (o.valores.clave || o.pos[2] || "").replace(/\s/g, "");
        if (!clave) return t.usoIncorrecto("bitlocker", "Falta la clave de recuperación.");
        if (clave !== M.disco.clave) {
          E.clavesMal++;
          return fallo("Clave incorrecta. El volumen sigue bloqueado.", E.clavesMal > 1 ? "Comprueba que la clave es la del identificador que da bitlocker status." : "");
        }
        accion();
        E.disco.fs = "ntfs";
        hecho("proteger");
        t.escribir("Volumen desbloqueado: sdb1 es NTFS «" + E.disco.etiqueta + "».", "t-ok");
        consejo("Ahora ya se puede montar en solo lectura y copiar los datos.");
      }
    });

    t.registrar("derivar", {
      resumen: "Apaga el disco y lo prepara para un laboratorio de recuperación.",
      uso: "derivar <disco>",
      detalle: ["Para un fallo físico (clics, chirridos, golpes, no gira): el técnico no lo vuelve a encender.", "El laboratorio cobra y tarda: no se manda un disco que se puede recuperar en el taller."],
      ejemplos: ["derivar sdb"],
      async ejecutar(args) {
        const r = resolverDisco(args[0]);
        if (!r) return t.usoIncorrecto("derivar", args[0] ? "No encuentro el disco «" + args[0] + "»." : "Falta el disco.");
        if (r.disco !== "sdb") return t.escribir("derivar: " + r.disco + " no es el disco del cliente.", "t-error");
        if (E.derivado) return t.escribir("El disco ya está etiquetado para el laboratorio.", "t-suave");
        const s = (await t.preguntar("El disco se apaga y no se vuelve a tocar en el taller. ¿Confirmas? (s/n)")).trim().toLowerCase();
        if (s !== "s" && s !== "si" && s !== "sí") return t.escribir("No se ha hecho nada.", "t-suave");
        accion();
        E.derivado = true;
        E.disco.montado = null;
        if (t.cwd.startsWith("/mnt/cliente")) t.cwd = "/home/rescue";
        hecho("derivar");
        t.escribir("Disco apagado, desconectado y etiquetado: «" + M.equipo + " · NO ENCENDER · laboratorio de recuperación».", "t-ok");
        if (!fisico()) riesgo("derivarSinMotivo", 10, "Mandaste al laboratorio un disco que se podía recuperar en el taller: coste y espera innecesarios para el cliente.");
        consejo("Escribe informe para terminar.");
      }
    });

    /* Comandos que leen o escriben el disco del cliente. */
    const TOCAN = ["scan", "mount", "clone", "ddrescue", "recover", "backup", "testdisk", "chkdsk", "format", "bitlocker"];
    const tocaCliente = (args) => args.some((a) => { const r = resolverDisco(a); return (r && r.disco === "sdb") || (a.startsWith("/") || a.startsWith(".")) && t.ruta(a).startsWith("/mnt/cliente"); });
    /* Un disco con fallo físico empeora con cada intento de leerlo. */
    const golpe = async () => {
      accion();
      E.golpes++;
      await t.progreso("Accediendo a sdb", 1600);
      E.grupos.forEach((g) => { g.danados += Math.round((g.n - g.danados) * 0.22); });
      t.escribir(M.ruido || "clac… clac… clac…", "t-error");
      t.escribir("sdb: error de E/S. El disco no responde, se desconecta y vuelve a conectarse.", "t-error");
      riesgo("insistir", 12, "Intentaste leer un disco que " + sintomaFisico() + ": cada intento raya más los platos.");
      if (E.golpes > 1) riesgo("insistir2", 8, "Insististe varias veces con un disco con fallo físico.");
      consejo("Un disco con un fallo físico no se lee en el taller.", "t-aviso");
    };
    TOCAN.forEach((n) => {
      const c = t.comandos[n];
      const original = c.ejecutar;
      c.ejecutar = (args, linea) => {
        const quiere = args.some((a) => /^-(h|-ayuda|-help)$/.test(a)) ? false : tocaCliente(args);
        if (quiere && E.derivado) return t.escribir("El disco ya está apagado y etiquetado para el laboratorio.", "t-aviso");
        if (quiere && fisico()) return golpe();
        if (E.disco.fs === "ninguna" && args.some((a) => /^(\/dev\/)?sdb1$/i.test(a))) return fallo(n + ": /dev/sdb1: no existe ese dispositivo.", "Mira qué hay en sdb con lsblk.");
        return original(args, linea);
      };
    });

    t.ejecutarInterno = (linea) => t.comandos[linea].ejecutar([]);
  };

  /* ---------- Objetivos, panel y puntuación ---------- */
  const objetivoHecho = (k) => {
    if (k === "proteger") {
      if (M.modo === "clon") return E.hechos.has("proteger_clon");
      return E.hechos.has("proteger");
    }
    return E.hechos.has(k);
  };

  /* Fallo físico: lo que cuenta es cuánto llega intacto al laboratorio. */
  const intactos = () => {
    let suma = 0, max = 0;
    objetivosRecuperar().forEach((g) => { max += g.peso; suma += g.peso * (g.n - g.danados) / g.n; });
    return max ? suma / max : 0;
  };

  const datosRescatados = () => {
    if (M.modo === "derivar") return E.derivado ? intactos() : 0;
    /* Para cada grupo, lo mejor recuperado en el disco del taller. */
    let suma = 0, max = 0, verificado = true;
    objetivosRecuperar().forEach((g) => {
      max += g.peso;
      let mejor = 0;
      Object.entries(E.recuperados).forEach(([ruta, lista]) => {
        if (discoDeRuta(ruta) !== "sdc") return;
        const r = lista.find((x) => x.grupo === g.id);
        if (!r) return;
        /* Sin nombres vale menos, salvo cuando ya no había nombres que salvar (tarjeta formateada). */
        const f = (r.ok / g.n) * (r.nombres || M.disco.formateado ? 1 : 0.6) * (r.verificado ? 1 : 0.85);
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

  /* El tercer punto del método depende del tipo de caso. */
  const METODO_CLAVE = {
    clon: ["Clonaste el disco antes de leerlo a fondo", () => E.hechos.has("clonoAntes")],
    particion: ["Recuperaste la partición sin formatear", () => E.hechos.has("proteger") && !E.disco.formateado],
    sinEscribir: ["No escribiste en el disco del cliente", () => !E.escribioCliente && E.hechos.has("recuperar")],
    copiarAntes: ["Copiaste y verificaste los datos antes de tocar el disco", () => E.hechos.has("recuperar") && !E.escribioCliente && (!E.disco.formateado || E.formateoTrasCopia)],
    desbloquear: ["Desbloqueaste el volumen con la clave de la cliente", () => E.hechos.has("proteger") && !E.disco.formateado]
  };

  const evaluar = () => {
    const datos = Math.round(datosRescatados() * 40);
    const antes = [
      ["Identificaste los discos antes de actuar", E.accionAntes.identificar !== false && E.hechos.has("identificar")],
      ["Comprobaste el estado del disco antes de actuar", E.accionAntes.salud !== false && E.hechos.has("salud")]
    ];
    const metodo = M.modo === "derivar" ? antes.concat([
      ["No insististe con un disco que " + sintomaFisico(), E.golpes === 0],
      ["Lo derivaste a un laboratorio", E.derivado]
    ]) : antes.concat([
      [METODO_CLAVE[M.modo][0], METODO_CLAVE[M.modo][1]()],
      ["Verificaste lo recuperado", E.hechos.has("verificar")]
    ]);
    const ptsMetodo = Math.round(metodo.filter((m) => m[1]).length * 7.5);
    const ptsRiesgo = Math.max(0, 20 - E.riesgos.reduce((s, r) => s + r.puntos, 0));
    const ptsInforme = E.respuestas.filter(Boolean).length * 5;
    const descuento = E.pistas * COSTE_PISTA + Math.min(2, E.privacidad) * COSTE_PRIVACIDAD;
    const total = Math.max(0, Math.min(100, datos + ptsMetodo + ptsRiesgo + ptsInforme - descuento));
    return { datos, metodo, ptsMetodo, ptsRiesgo, ptsInforme, descuento, total };
  };

  const pintarPanel = () => {
    if (!app.querySelector("[data-estado]")) return;
    const ul = app.querySelector("[data-objetivos]");
    if (ul) ul.innerHTML = objetivosDe(M).map((k) => '<li class="' + (objetivoHecho(k) ? "hecho" : "") + '"><span aria-hidden="true">' + (objetivoHecho(k) ? "✓" : "") + "</span>" + esc(M.objetivos[k]) + (objetivoHecho(k) ? '<span class="rt-oculto"> (hecho)</span>' : "") + "</li>").join("");
    const danados = totalDanados();
    const total = objetivosRecuperar().reduce((s, g) => s + g.n, 0);
    const derivar = M.modo === "derivar";
    const rescatados = derivar ? (E.derivado ? objetivosRecuperar().reduce((s, g) => s + g.n - g.danados, 0) : 0) : archivosRescatados();
    const fs = E.disco.fs;
    const salud = fisico() ? ["Sin respuesta", "mal"] : falla() ? ["Precaución", "mal"] : E.disco.smart ? ["Bueno", "bien"] : ["Sin S.M.A.R.T.", ""];
    app.querySelector("[data-estado]").innerHTML = (DIFICIL ? "" :
      "<div><span>Salud</span><b class=\"" + salud[1] + "\">" + salud[0] + "</b></div>" +
      "<div><span>Volumen</span><b class=\"" + (sinVolumen(fs) || fs === "bitlocker" || E.disco.formateado ? "mal" : "") + "\">" + (fisico() ? "Sin leer" : fs === "bitlocker" ? "Cifrado" : sinVolumen(fs) ? fsNombre(fs).replace(/^s/, "S") : E.disco.formateado ? "Formateado" : fsNombre(fs)) + "</b></div>") +
      (falla() && !DIFICIL ? "<div><span>Archivos ilegibles</span><b class=\"mal\">" + fmt(danados) + "</b></div>" : "") +
      "<div><span>" + (derivar ? "En el laboratorio" : "Rescatados") + "</span><b>" + fmt(rescatados) + " / " + fmt(total) + "</b></div>";
    const pct = total ? Math.round(rescatados / total * 100) : 0;
    app.querySelector("[data-barra]").style.width = pct + "%";
    app.querySelector("[data-barra]").parentElement.setAttribute("aria-valuenow", pct);
    const r = app.querySelector("[data-riesgo]");
    if (DIFICIL) { r.textContent = "Modo difícil"; r.className = "rt-riesgo alto"; return; }
    const riesgoActivo = derivar ? !E.derivado : !E.hechos.has("verificar") && (falla() ? !E.imagen : true);
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
      '<div class="rt-modo" role="radiogroup" aria-label="Modo de juego">' +
      '<button type="button" role="radio" data-modo="normal" aria-checked="' + !DIFICIL + '"><b>Normal</b><span>Con objetivos, consejos y pistas</span></button>' +
      '<button type="button" role="radio" data-modo="dificil" aria-checked="' + DIFICIL + '"><b>Difícil</b><span>Sin pistas: si te equivocas, no te dice qué escribir</span></button>' +
      "</div>" +
      '<h2 class="rt-h2">Elige una misión</h2>' +
      '<div class="rt-misiones">' + MISIONES.map((m, i) => [m, i]).sort((a, b) => a[0].desde.localeCompare(b[0].desde) || a[1] - b[1]).map(([m, i]) => {
        const ok = abierta(m);
        return '<button type="button" class="rt-mision" data-mision="' + i + '"' + (ok ? "" : " disabled") + ">" +
          ICONO_DISCO + "<span><small>" + esc(m.sesion) + " · Equipo " + esc(m.equipo) + "</small><b>" + esc(m.titulo) + "</b><em>" + esc(m.resumen) + "</em>" +
          (ok ? "" : '<i class="rt-candado">Se abre el ' + fecha(m) + "</i>") + "</span></button>";
      }).join("") + "</div>" +
      (PREVIA ? '<p class="rt-nota">Vista del profesor: todas las misiones están abiertas.</p>' : "") +
      '<p class="rt-nota">Puntuación sobre 100: datos rescatados (40), método (30), riesgos evitados (20) e informe (10). Cada pista resta ' + COSTE_PISTA + ". En modo difícil no hay pistas ni objetivos, y el informe no te dice si aciertas hasta el final.</p>" +
      "</section>";
    app.querySelectorAll("[data-modo]").forEach((b) => b.addEventListener("click", () => {
      DIFICIL = b.dataset.modo === "dificil";
      guardarModo();
      app.querySelectorAll("[data-modo]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    }));
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
      '<div class="rt-titulo">' + ICONO_ESCUDO + "<div><h1>Operación: rescatar los archivos</h1><p>Terminal de recuperación · Equipo " + esc(m.equipo) + " · " + esc(m.titulo) + (DIFICIL ? " · Modo difícil" : "") + "</p></div></div>" +
      '<span class="rt-riesgo activo" data-riesgo role="status">Riesgo activo</span>' +
      (ESCAPE ? "" : '<a class="rt-cerrar rt-cerrar-barra" href="rescate.html' + (PREVIA ? "?profe" : "") + '" aria-label="Salir de la misión">' + ICONO_CERRAR + "</a>") +
      "</header>" +
      '<div class="rt-cuerpo">' +
      '<div class="rt-ventana">' +
      '<div class="rt-ventana-barra"><i></i><i></i><i></i><span>rescue@' + esc(m.equipo.toLowerCase()) + " — SystemRescue</span></div>" +
      '<div class="rt-salida" data-salida role="log" aria-live="polite" aria-label="Salida de la terminal"></div>' +
      '<form class="rt-entrada" data-formulario autocomplete="off"><label class="t-prompt" for="rt-comando"></label>' +
      '<input id="rt-comando" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send" aria-label="Escribe un comando"></form>' +
      '<div class="rt-teclas"><button type="button" data-tecla="tab">Tab</button><button type="button" data-tecla="arriba" aria-label="Comando anterior">↑</button><button type="button" data-tecla="help">help</button>' + (DIFICIL ? "" : '<button type="button" data-tecla="pista">pista</button>') + "</div>" +
      "</div>" +
      '<aside class="rt-lateral">' +
      '<section class="rt-caja"><h2>Orden de trabajo</h2><p>' + m.orden.slice(2, 5).map(esc).join("<br>") + '</p><p class="rt-nota">Léela entera con <code>cat orden_trabajo.txt</code>.</p></section>' +
      (DIFICIL ? '<section class="rt-caja"><h2>Modo difícil</h2><p class="rt-nota">Sin objetivos ni pistas. Investiga y decide tú: los errores dicen qué ha fallado, pero no qué tienes que escribir.</p></section>'
        : '<section class="rt-caja"><h2>Objetivos</h2><ul class="rt-objetivos" data-objetivos></ul></section>') +
      '<section class="rt-caja"><h2>' + (DIFICIL ? "Progreso" : "Estado del disco") + '</h2><div class="rt-estado" data-estado></div><div class="rt-progreso" role="progressbar" aria-label="Archivos rescatados" aria-valuemin="0" aria-valuemax="100"><span data-barra></span></div></section>' +
      "</aside></div></section>";

    t = Terminal.crear({
      salida: app.querySelector("[data-salida]"),
      entrada: app.querySelector("#rt-comando"),
      formulario: app.querySelector("[data-formulario]"),
      prompt: (cwd) => "rescue@" + m.equipo.toLowerCase() + ":" + (cwd === "/home/rescue" ? "~" : cwd.replace(/^\/home\/rescue/, "~")) + "$",
      sinAyudas: DIFICIL,
      completarExtra: (cmd) => (cmd === "disk" ? ["list", "status", "smart", "sdb"] : cmd === "bitlocker" ? ["status", "unlock", "sdb1"] : ["sdb", "sdb1"]),
      despues: () => { if (!E.terminado) pintarPanel(); }
    });
    montarFS();
    registrarComandos();
    t.cwd = "/home/rescue";
    t.escribir("SystemRescue (simulado) · Terminal de recuperación del taller", "t-titulo");
    t.escribir("Nada de lo que escribas se ejecuta en tu ordenador.", "t-suave");
    if (DIFICIL) t.escribir("Modo difícil: sin pistas ni objetivos. Si te equivocas, no te dirá qué tienes que escribir.", "t-aviso");
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
    if (ESCAPE) avisarSala({ id: M.id, total: ev.total, maximo: 100 });
    else if (window.UF0864) window.UF0864.practicaHecha("rescate-archivos", Math.round(ev.total / 10), 10);
    const nombre = window.UF0864 && window.UF0864.nombre();
    const capa = document.createElement("div");
    capa.className = "rt-capa";
    capa.innerHTML =
      '<section class="rt-panel rt-final" role="dialog" aria-modal="true" aria-labelledby="rt-final-titulo">' +
      '<p class="rt-antetitulo"><b>Misión</b> · ' + esc(M.titulo) + (DIFICIL ? " · Modo difícil" : "") + "</p>" +
      '<h2 id="rt-final-titulo">' + (ev.total >= 70 ? "¡Datos rescatados" : ev.total >= 40 ? "Rescate a medias" : "Rescate fallido") + (nombre ? ", " + esc(nombre) : "") + "!</h2>" +
      '<p class="rt-total"><b>' + ev.total + "</b>/100</p>" +
      '<ul class="rt-desglose">' +
      "<li><span>Datos rescatados</span><b>" + ev.datos + "/40</b></li>" +
      "<li><span>Método</span><b>" + ev.ptsMetodo + "/30</b></li>" +
      "<li><span>Riesgos evitados</span><b>" + ev.ptsRiesgo + "/20</b></li>" +
      "<li><span>Informe</span><b>" + ev.ptsInforme + "/10</b></li>" +
      (ev.descuento ? "<li><span>" + (DIFICIL ? "Privacidad" : "Pistas y privacidad") + "</span><b>−" + ev.descuento + "</b></li>" : "") +
      "</ul>" +
      '<h3>Método</h3><ul class="rt-lista">' + ev.metodo.map(([txt, ok]) => '<li class="' + (ok ? "ok" : "mal") + '">' + (ok ? "✓ " : "✗ ") + esc(txt) + "</li>").join("") + "</ul>" +
      (E.respuestas.length ? '<h3>Informe</h3><ul class="rt-lista">' + M.preguntas.map(([q, ops], i) => '<li class="' + (E.respuestas[i] ? "ok" : "mal") + '">' + (E.respuestas[i] ? "✓ " : "✗ ") + esc(q) + (E.respuestas[i] ? "" : " Era: " + esc(ops[0]) + ".") + "</li>").join("") + "</ul>" : "") +
      (E.riesgos.length ? '<h3>Riesgos asumidos</h3><ul class="rt-lista">' + E.riesgos.map((r) => '<li class="mal">−' + r.puntos + " · " + esc(r.texto) + "</li>").join("") + "</ul>" : '<p class="rt-bien">No asumiste ningún riesgo innecesario.</p>') +
      (E.privacidad ? '<p class="rt-aviso">Abriste ' + E.privacidad + (E.privacidad === 1 ? " archivo personal" : " archivos personales") + " del cliente. Para comprobar una recuperación basta con verify.</p>" : "") +
      (EXTRA ? "" : '<h3>Así se resolvía</h3><p>' + esc(M.solucion) + "</p>") +
      (ESCAPE ? '<p class="rt-bien">Reto terminado. Sigue en la sala: el candado ya está a la vista.</p>'
        : '<div class="rt-acciones"><a class="rt-boton" href="software.html">Volver al mapa</a><button type="button" class="rt-boton rt-secundario" data-otra>Otra misión</button></div>') +
      "</section>";
    document.body.appendChild(capa);
    if (ESCAPE) return;
    capa.querySelector("[data-otra]").addEventListener("click", () => { capa.remove(); portada(); });
    capa.querySelector("a.rt-boton").focus();
  };

  const reto = ESCAPE && MISIONES.concat((EXTRA && EXTRA.rescate) || []).find((m) => m.id === ESCAPE);
  if (reto) { DIFICIL = false; empezar(reto); } else portada();
})();
