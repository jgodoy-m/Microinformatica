/* Minijuego «Diagnóstico contrarreloj» (UF0864).
   Cada caso es un equipo averiado: el alumno elige qué revisar, cada prueba útil desbloquea una
   pista, y solo cuando ha hecho las pruebas pertinentes (todas las que dan pista) puede dar su diagnóstico. Puntuación sobre 100 por caso:
   −5 por prueba innecesaria, −10 por la pista opcional y −20 por diagnóstico equivocado.
   Los casos llevan su sesión y fecha de apertura: el juego crece a medida que se da el temario. */
(() => {
  "use strict";

  const SEGUNDOS_CASO = 8 * 60;
  const CASOS_POR_PARTIDA = 3;
  const COSTE = { innecesaria: 5, opcional: 10, fallo: 20 };

  const ICONO = {
    escudo: '<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>',
    lupa: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h1.5l1-2 1.5 4 1-2H13"/>',
    reloj: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6M12 2v3"/>',
    diana: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    pausa: '<circle cx="12" cy="12" r="10"/><path d="M10 8v8M14 8v8"/>',
    play: '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="m7.5 12.5 3 3 6-6.5"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7.5v.5"/>',
    candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    bombilla: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    estrella: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    analisis: '<circle cx="9" cy="8" r="3"/><circle cx="16" cy="15" r="3"/><circle cx="7" cy="17" r="2"/><path d="m11 10 3 3M9 15l5-.5"/>',
    casa: '<path d="M3 11 12 3l9 8M5 10v10h5v-6h4v6h5V10"/>',
    estado: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 14l3-4 3 3 4-5"/>',
    registros: '<path d="M6 2h9l4 4v16H6zM15 2v4h4M9 11h7M9 15h7M9 19h4"/>',
    almacenamiento: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    controladores: '<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="M12 7v5M9.5 9.5 12 12l2.5-2.5M9 16h6"/>',
    programas: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M7 12h4M7 15h7"/>',
    red: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z"/>',
    firmware: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4M10 10h4v4h-4z"/>'
  };
  const svg = (k, cls) => '<svg class="' + (cls || "ic") + '" viewBox="0 0 24 24" aria-hidden="true">' + ICONO[k] + "</svg>";

  const ZONAS = [
    { id: "estado", nombre: "Estado del sistema", detalle: "Procesos, rendimiento y servicios", windows: true },
    { id: "registros", nombre: "Registros del sistema", detalle: "Visor de eventos y errores", windows: true },
    { id: "almacenamiento", nombre: "Almacenamiento", detalle: "Particiones, espacio y S.M.A.R.T." },
    { id: "controladores", nombre: "Controladores", detalle: "Drivers y dispositivos", windows: true },
    { id: "programas", nombre: "Programas instalados", detalle: "Software y actualizaciones recientes", windows: true },
    { id: "red", nombre: "Red y conexiones", detalle: "Conectividad y tráfico", windows: true },
    { id: "firmware", nombre: "Firmware (BIOS/UEFI)", detalle: "Orden de arranque, modo y seguridad" }
  ];

  /* Resultado de una prueba que no aporta nada al caso. */
  const sinWindows = {
    titulo: "No se puede comprobar",
    lineas: [["--:--:--", "Sistema", "Aviso", "Windows no llega a arrancar: esta herramienta no está disponible."]],
    analisis: "Con el equipo sin arrancar no se puede abrir esta herramienta de Windows. Busca pistas en el firmware o arrancando desde el USB de instalación.",
    pasos: ["Revisar el firmware (BIOS/UEFI)", "Arrancar desde el USB de instalación para ver los discos"]
  };
  const sinAnomalias = {
    titulo: "Sin anomalías",
    lineas: [["--:--:--", "Comprobación", "Info", "Todo dentro de lo normal."]],
    analisis: "Esta prueba no muestra nada fuera de lo normal. El problema no parece estar aquí.",
    pasos: ["Probar en otra zona del equipo"]
  };

  /* La primera opción es la correcta; se barajan al mostrarlas. Las pruebas con «pista» son las útiles. */
  const CASOS = [
    {
      sesion: "S15", titulo: "El disco nuevo", arranca: false,
      pantalla: { tipo: "texto", texto: "Reboot and select proper boot device\nor Insert Boot Media in selected Boot device and press a key_" },
      sintoma: "El equipo enciende, sale el logotipo y se queda en «Reboot and select proper boot device».",
      pruebas: {
        firmware: {
          titulo: "Orden de arranque revisado",
          lineas: [["Arranque", "Orden 1º", "Aviso", "SATA1: HDD 2 TB (instalado ayer)"], ["Arranque", "Orden 2º", "Info", "NVMe: Windows Boot Manager"], ["Arranque", "Modo", "Info", "UEFI · Secure Boot activado"]],
          analisis: "El firmware intenta arrancar primero desde el disco duro nuevo y no encuentra sistema en él.",
          pasos: ["Comprobar qué hay en cada disco", "Poner Windows Boot Manager el primero"],
          pista: "El disco nuevo está el primero del orden de arranque."
        },
        almacenamiento: {
          titulo: "Discos revisados desde el USB",
          lineas: [["diskpart", "Disco 0", "Info", "SSD 500 GB · GPT · EFI, MSR, Windows y recuperación"], ["diskpart", "Disco 1", "Aviso", "HDD 2 TB · una partición de datos, sin EFI"]],
          analisis: "El SSD tiene todas las particiones de arranque. El disco nuevo solo guarda datos.",
          pasos: ["Revisar el orden de arranque en el firmware"],
          pista: "El disco nuevo no tiene partición de arranque."
        }
      },
      opcional: "El cliente dice: «Ayer me instalaron un segundo disco duro para guardar fotos.»",
      opciones: ["El orden de arranque pone primero el disco de datos, que no tiene sistema", "El SSD con Windows se ha averiado", "El BCD está dañado", "Un virus ha borrado Windows"],
      causa: "El problema era el orden de arranque: el firmware intentaba arrancar desde el disco nuevo, que solo tiene datos.",
      solucion: "Se ha puesto Windows Boot Manager el primero en el orden de arranque y el equipo arranca con normalidad."
    },
    {
      sesion: "S15", titulo: "Después de actualizar la BIOS", arranca: false,
      pantalla: { tipo: "azul", texto: "Tu dispositivo se ha encontrado con un problema y debe reiniciarse.", codigo: "INACCESSIBLE_BOOT_DEVICE" },
      sintoma: "Sale el logotipo de Windows, gira el círculo y aparece un pantallazo azul INACCESSIBLE_BOOT_DEVICE.",
      pruebas: {
        firmware: {
          titulo: "Configuración del firmware",
          lineas: [["Firmware", "Versión", "Info", "F12 · actualizada ayer a las 18:42"], ["Almacenamiento", "Modo SATA", "Aviso", "AHCI (valor de fábrica)"], ["Etiqueta", "Técnico anterior", "Info", "«Modo Intel RST (RAID). No tocar»"]],
          analisis: "La actualización cargó los valores de fábrica: el modo SATA pasó de RAID a AHCI y Windows no encuentra su disco.",
          pasos: ["Volver a poner el modo SATA en RAID", "Guardar y reiniciar"],
          pista: "El modo SATA ha cambiado de RAID a AHCI."
        },
        almacenamiento: {
          titulo: "Disco revisado desde el USB",
          lineas: [["diskpart", "Disco 0", "Info", "NVMe 1 TB · GPT · particiones completas"], ["S.M.A.R.T.", "Estado", "Info", "Correcto · 0 sectores reasignados"]],
          analisis: "El disco y sus particiones están bien: no es una avería del disco.",
          pasos: ["Revisar qué ha cambiado en el firmware"],
          pista: "El disco está sano y completo."
        }
      },
      opcional: "El cliente dice: «Ayer actualicé la BIOS de la placa siguiendo un vídeo.»",
      opciones: ["Al actualizar el firmware, el modo SATA volvió a AHCI y Windows estaba instalado en RAID", "El driver de la tarjeta gráfica está dañado", "El disco tiene sectores dañados", "Se ha borrado la partición EFI"],
      causa: "El problema era el modo SATA: la actualización del firmware lo devolvió a AHCI y Windows estaba instalado en RAID.",
      solucion: "Se ha vuelto a poner el modo SATA en Intel RST (RAID) y Windows arranca sin pantallazo."
    },
    {
      sesion: "S15", titulo: "El SSD clonado", arranca: false,
      pantalla: { tipo: "texto", texto: "No bootable device -- insert boot disk and press any key_" },
      sintoma: "Tras cambiar el disco por un SSD clonado, el equipo dice «No bootable device».",
      pruebas: {
        almacenamiento: {
          titulo: "Particiones del SSD",
          lineas: [["diskpart", "Disco 0", "Aviso", "SSD 1 TB · GPT · una sola partición NTFS (C:)"], ["diskpart", "Particiones", "Error", "No hay partición EFI ni de recuperación"], ["S.M.A.R.T.", "Estado", "Info", "Correcto"]],
          analisis: "C: está completa, pero faltan las particiones que guardan el gestor de arranque.",
          pasos: ["Crear la partición EFI", "Rehacer el arranque con bcdboot"],
          pista: "El SSD solo tiene la partición C:, sin EFI."
        },
        firmware: {
          titulo: "Arranque en el firmware",
          lineas: [["Arranque", "Orden 1º", "Info", "NVMe: SSD 1 TB"], ["Arranque", "Modo", "Info", "UEFI"]],
          analisis: "El firmware ve el SSD y lo tiene el primero, pero no encuentra ningún cargador de arranque en él.",
          pasos: ["Revisar las particiones del SSD"],
          pista: "El firmware ve el SSD pero no encuentra arranque."
        }
      },
      opcional: "El cliente dice: «Lo clonó mi sobrino con un programa gratis. Solo copió la unidad C:.»",
      opciones: ["Al clonar solo C: faltan las particiones de arranque", "El SSD es defectuoso", "El modo SATA está mal configurado", "Secure Boot bloquea el SSD"],
      causa: "El problema era el clonado: al copiar solo C:, el SSD se quedó sin partición EFI ni gestor de arranque.",
      solucion: "Se ha creado la partición EFI y se ha rehecho el arranque con bcdboot C:\\Windows."
    },
    {
      sesion: "S15", titulo: "La clave de 48 dígitos", arranca: false,
      pantalla: { tipo: "dialogo", titulo: "Recuperación de BitLocker", texto: "Escribe la clave de recuperación para esta unidad.", codigo: "Id. de clave: 5E1A-7C2D" },
      sintoma: "Al arrancar, Windows pide la clave de recuperación de BitLocker.",
      pruebas: {
        firmware: {
          titulo: "Seguridad del firmware",
          lineas: [["Seguridad", "Secure Boot", "Aviso", "Disabled (cambiado ayer)"], ["Seguridad", "TPM 2.0 (fTPM)", "Info", "Activo"]],
          analisis: "El TPM comprueba la configuración de arranque. Al ver Secure Boot cambiado, no entrega la clave de BitLocker.",
          pasos: ["Volver a activar Secure Boot", "Si aun así la pide, usar la clave de la cuenta Microsoft"],
          pista: "Secure Boot se desactivó ayer."
        },
        almacenamiento: {
          titulo: "Estado del cifrado",
          lineas: [["manage-bde", "C:", "Info", "Cifrado con BitLocker · protector TPM"], ["S.M.A.R.T.", "Estado", "Info", "Correcto"]],
          analisis: "El disco está sano y cifrado con BitLocker; su clave la guarda el TPM.",
          pasos: ["Revisar qué ha cambiado en la seguridad del firmware"],
          pista: "El disco está cifrado con BitLocker y protegido por el TPM."
        }
      },
      opcional: "El cliente dice: «Ayer desactivé Secure Boot para arrancar un USB de rescate.»",
      opciones: ["Al cambiar Secure Boot, el TPM no entrega la clave de BitLocker", "Un ransomware ha cifrado el disco", "El disco se está estropeando", "El usuario ha olvidado su contraseña de Windows"],
      causa: "El problema era Secure Boot: al desactivarlo, el TPM dejó de entregar la clave de BitLocker.",
      solucion: "Se ha vuelto a activar Secure Boot y Windows arranca sin pedir la clave."
    },
    {
      sesion: "S15", titulo: "¿Dónde está Linux?", arranca: true,
      pantalla: { tipo: "dialogo", titulo: "Inicio directo en Windows", texto: "Ya no aparece el menú para elegir entre Windows y Ubuntu.", codigo: "" },
      sintoma: "Un equipo con Windows y Ubuntu arranca directo en Windows sin mostrar el menú.",
      pruebas: {
        firmware: {
          titulo: "Orden de arranque UEFI",
          lineas: [["Arranque", "Orden 1º", "Aviso", "Windows Boot Manager"], ["Arranque", "Orden 2º", "Info", "ubuntu (GRUB)"]],
          analisis: "GRUB sigue registrado, pero Windows Boot Manager se ha puesto delante y arranca Windows sin menú.",
          pasos: ["Poner «ubuntu» el primero en el orden de arranque"],
          pista: "Windows Boot Manager se ha puesto el primero."
        },
        almacenamiento: {
          titulo: "Particiones del disco",
          lineas: [["Administración de discos", "Disco 0", "Info", "EFI · MSR · Windows (C:) · ext4 · swap"]],
          analisis: "Las particiones de Linux siguen en su sitio: no se ha borrado nada.",
          pasos: ["Revisar el orden de arranque"],
          pista: "Las particiones de Linux siguen ahí."
        },
        programas: {
          titulo: "Actualizaciones recientes",
          lineas: [["Windows Update", "Anoche 23:10", "Info", "Actualización acumulativa instalada"], ["Windows Update", "Anoche 23:14", "Info", "Reinicio para completar la instalación"]],
          analisis: "El problema empezó justo después de esta actualización de Windows.",
          pasos: ["Revisar qué ha cambiado en el arranque tras la actualización"],
          pista: "Anoche se instaló una actualización de Windows."
        }
      },
      opcional: "El cliente dice: «Antes me salía un menú para elegir. Desde anoche, ya no.»",
      opciones: ["La actualización puso Windows Boot Manager el primero en el orden de arranque", "La actualización ha borrado Linux", "El disco está dañado", "Se ha activado el CSM"],
      causa: "El problema era el orden de arranque: la actualización puso Windows Boot Manager por delante de GRUB.",
      solucion: "Se ha puesto «ubuntu» el primero en el orden de arranque y vuelve a salir el menú."
    },
    {
      sesion: "S15", titulo: "El pendrive olvidado", arranca: false,
      pantalla: { tipo: "texto", texto: "BOOTMGR is missing\nPress Ctrl+Alt+Del to restart_" },
      sintoma: "El equipo dice «BOOTMGR is missing» al encenderlo.",
      pruebas: {
        firmware: {
          titulo: "Orden de arranque",
          lineas: [["Arranque", "Orden 1º", "Aviso", "USB: Kingston DataTraveler 32 GB"], ["Arranque", "Orden 2º", "Info", "SSD: Windows Boot Manager"]],
          analisis: "El firmware intenta arrancar primero desde el pendrive, que está conectado.",
          pasos: ["Quitar el pendrive", "Poner el disco el primero"],
          pista: "Hay un USB el primero en el orden de arranque."
        },
        almacenamiento: {
          titulo: "Contenido de los discos",
          lineas: [["Otro equipo", "Pendrive", "Info", "Solo contiene la carpeta «Fotos verano»"], ["diskpart", "SSD", "Info", "Particiones de arranque completas"]],
          analisis: "El pendrive no tiene ningún sistema y el disco del equipo está completo.",
          pasos: ["Revisar el orden de arranque"],
          pista: "El pendrive no tiene sistema y el disco está completo."
        }
      },
      opcional: "El cliente dice: «Ayer pasé unas fotos con un pendrive y creo que sigue puesto.»",
      opciones: ["Intenta arrancar desde el pendrive, que no tiene sistema", "El gestor de arranque del disco se ha borrado", "La RAM está fallando", "El disco no tiene sistema de archivos"],
      causa: "El problema era el pendrive: el firmware intentaba arrancar desde él y no tiene sistema.",
      solucion: "Se ha quitado el pendrive y se ha puesto el disco el primero en el orden de arranque."
    },
    {
      sesion: "S15", titulo: "El optimizador milagroso", arranca: true,
      pantalla: { tipo: "negra" },
      sintoma: "Tras escribir la contraseña, Windows se queda en una pantalla negra con el cursor.",
      pruebas: {
        estado: {
          titulo: "Procesos en ejecución",
          lineas: [["Administrador de tareas", "Procesos", "Aviso", "explorer.exe no se está ejecutando"], ["Administrador de tareas", "Procesos", "Info", "SpeedBoostPro.exe · 32 % de CPU"]],
          analisis: "Sin explorer.exe no hay escritorio ni barra de tareas: por eso la pantalla queda negra.",
          pasos: ["Lanzar explorer.exe desde el Administrador de tareas", "Ver qué programa se ha instalado"],
          pista: "El Explorador (explorer.exe) no se está ejecutando."
        },
        programas: {
          titulo: "Software reciente",
          lineas: [["Programas", "Ayer 19:05", "Aviso", "SpeedBoost Pro 3.2 (optimizador gratuito)"], ["Inicio", "SpeedBoostPro", "Aviso", "Se ejecuta al iniciar sesión"]],
          analisis: "El optimizador se instaló ayer y se ejecuta al iniciar sesión, justo cuando falla.",
          pasos: ["Desinstalarlo desde el modo seguro"],
          pista: "Ayer se instaló un optimizador que arranca al iniciar sesión."
        },
        registros: {
          titulo: "Se han encontrado errores",
          lineas: [["11:02:14", "Winlogon", "Error", "No se pudo iniciar el shell del usuario."], ["11:02:13", "Application Error", "Error", "SpeedBoostPro.exe ha modificado la clave Shell."]],
          analisis: "Winlogon no puede iniciar el Explorador porque un programa ha cambiado su configuración.",
          pasos: ["Revisar los programas de inicio"],
          pista: "Winlogon no pudo iniciar el shell del usuario."
        }
      },
      opcional: "El cliente dice: «Ayer instalé un programa gratis para que el ordenador fuera más rápido.»",
      opciones: ["Un programa de inicio impide que arranque el Explorador (fase de sesión)", "El driver de la gráfica está dañado", "El monitor está mal configurado", "El BCD apunta a otra partición"],
      causa: "El problema era el optimizador: al iniciar sesión impedía que arrancara el Explorador.",
      solucion: "Se ha lanzado explorer.exe desde el Administrador de tareas y se ha desinstalado el optimizador en modo seguro."
    },
    {
      sesion: "S16", desde: "2026-10-19", titulo: "El disco invisible", arranca: true,
      pantalla: { tipo: "dialogo", titulo: "Este equipo", texto: "Solo aparece la unidad C:. El disco nuevo no se ve.", codigo: "" },
      sintoma: "El cliente ha montado un disco nuevo y no aparece en el Explorador.",
      pruebas: {
        almacenamiento: {
          titulo: "Administración de discos",
          lineas: [["Administración de discos", "Disco 1", "Aviso", "No inicializado · 1,82 TB sin asignar"]],
          analisis: "Windows ve el disco, pero no tiene tabla de particiones ni volumen: por eso no sale en el Explorador.",
          pasos: ["Inicializarlo en GPT", "Crear un volumen y formatearlo"],
          pista: "El disco nuevo está sin inicializar."
        },
        controladores: {
          titulo: "Administrador de dispositivos",
          lineas: [["Unidades de disco", "WDC WD20EZBX", "Info", "Este dispositivo funciona correctamente."]],
          analisis: "Windows detecta el disco y su driver funciona: no es un problema de hardware ni de driver.",
          pasos: ["Revisar el disco en Administración de discos"],
          pista: "Windows detecta el disco y su driver funciona."
        }
      },
      opcional: "El cliente dice: «Lo saqué de la caja y lo conecté. No he hecho nada más.»",
      opciones: ["El disco está sin inicializar y sin volumen", "El disco viene averiado de fábrica", "Le falta la letra de unidad", "Está protegido contra escritura"],
      causa: "El problema era que el disco estaba sin inicializar: no tenía tabla de particiones ni volumen.",
      solucion: "Se ha inicializado en GPT, se ha creado un volumen NTFS y ya aparece en el Explorador."
    },
    {
      sesion: "S16", desde: "2026-10-19", titulo: "«Debe formatear el disco»", arranca: true,
      pantalla: { tipo: "dialogo", titulo: "Microsoft Windows", texto: "Debe formatear el disco de la unidad E: antes de usarlo.", codigo: "¿Desea formatearlo?" },
      sintoma: "Al conectar un disco externo, Windows pide formatearlo.",
      pruebas: {
        almacenamiento: {
          titulo: "Estado del disco externo",
          lineas: [["Administración de discos", "E:", "Aviso", "Sistema de archivos RAW"], ["S.M.A.R.T.", "Disco externo", "Info", "Correcto · 0 sectores reasignados"]],
          analisis: "Windows no entiende el sistema de archivos, pero el disco está sano: los datos siguen ahí.",
          pasos: ["No formatear", "Recuperar la estructura con TestDisk"],
          pista: "El volumen sale como RAW, pero el disco está sano."
        },
        registros: {
          titulo: "Se han encontrado errores",
          lineas: [["Ayer 21:47", "Ntfs", "Error", "La estructura del sistema de archivos del volumen E: está dañada."], ["Ayer 21:47", "Kernel-PnP", "Aviso", "El dispositivo USB se quitó sin expulsarlo."]],
          analisis: "El disco se desconectó mientras escribía y el sistema de archivos quedó a medias.",
          pasos: ["Comprobar la salud del disco antes de tocar nada"],
          pista: "Ayer el disco se desconectó sin expulsarlo."
        }
      },
      opcional: "El cliente dice: «Lo desenchufé de golpe mientras copiaba. Tiene las fotos de la familia.»",
      opciones: ["El sistema de archivos está dañado por la desconexión: no se formatea", "El disco está vacío", "El disco está protegido contra escritura", "El disco está en FAT32"],
      causa: "El problema era el sistema de archivos, dañado al desconectar el disco en plena copia. Los datos seguían ahí.",
      solucion: "No se ha formateado: con el disco sano, se ha recuperado la estructura con TestDisk y las fotos vuelven a verse."
    },
    {
      sesion: "S16", desde: "2026-10-19", titulo: "Los 2 TB que faltan", arranca: true,
      pantalla: { tipo: "dialogo", titulo: "Administración de discos", texto: "Disco 1: 2048 GB en uso · 1678 GB No asignado", codigo: "" },
      sintoma: "Un disco de 4 TB solo deja usar 2 TB.",
      pruebas: {
        almacenamiento: {
          titulo: "Estilo de partición",
          lineas: [["Administración de discos", "Disco 1", "Aviso", "3,63 TB · estilo de partición MBR"], ["Administración de discos", "Disco 1", "Info", "2 TB en uso · 1,63 TB no asignado"]],
          analisis: "MBR no puede manejar más de 2 TB: el resto del disco queda inservible.",
          pasos: ["Copiar los datos fuera", "Pasar el disco a GPT"],
          pista: "El disco está inicializado en MBR."
        },
        programas: {
          titulo: "Software reciente",
          lineas: [["Programas", "Hace 2 días", "Info", "Partition Wizard 2012 (versión antigua)"]],
          analisis: "El disco se inicializó con un programa antiguo que usa MBR por defecto.",
          pasos: ["Revisar el estilo de partición del disco"],
          pista: "Se inicializó con un programa antiguo."
        }
      },
      opcional: "El cliente dice: «Lo inicialicé con la opción que salía por defecto.»",
      opciones: ["Está inicializado en MBR, que no pasa de 2 TB", "El disco es falso y tiene menos capacidad", "El volumen está en FAT32", "Falta asignarle una letra"],
      causa: "El problema era el estilo de partición: en MBR no se pueden usar más de 2 TB.",
      solucion: "Se han copiado los datos fuera, se ha pasado el disco a GPT y ya se pueden usar los 4 TB."
    },
    {
      sesion: "S16", desde: "2026-10-19", titulo: "La película que no cabe", arranca: true,
      pantalla: { tipo: "dialogo", titulo: "Copiar archivo", texto: "El archivo es demasiado grande para el sistema de archivos de destino.", codigo: "pelicula.mkv · 6,2 GB" },
      sintoma: "Un pendrive de 64 GB vacío no deja copiar un archivo de 6 GB.",
      pruebas: {
        almacenamiento: {
          titulo: "Propiedades del pendrive",
          lineas: [["Propiedades", "Pendrive (F:)", "Aviso", "Sistema de archivos: FAT32"], ["Propiedades", "Pendrive (F:)", "Info", "58,1 GB libres de 58,2 GB"]],
          analisis: "FAT32 no admite archivos de más de 4 GB, aunque haya espacio de sobra.",
          pasos: ["Convertirlo a NTFS con convert", "O copiar los datos fuera y formatearlo en exFAT"],
          pista: "El pendrive está en FAT32 y casi vacío."
        }
      },
      opcional: "El cliente dice: «El pendrive está vacío, no lo entiendo.»",
      opciones: ["El pendrive está en FAT32, que no admite archivos de más de 4 GB", "El pendrive está lleno de archivos ocultos", "El pendrive está protegido contra escritura", "El pendrive está inicializado en MBR"],
      causa: "El problema era el sistema de archivos: FAT32 no admite archivos de más de 4 GB.",
      solucion: "Se ha convertido el pendrive a NTFS con convert y el archivo se copia sin problemas."
    }
  ];

  const abierto = (c) => {
    if (!c.desde) return true;
    const [y, m, d] = c.desde.split("-").map(Number);
    return new Date() >= new Date(y, m - 1, d);
  };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const mezclar = (lista) => {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const mmss = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

  const app = document.getElementById("dc");
  if (!app) return;

  /* Dentro del escape room (escape-uf0864.html) llega ?escape=S15,S16: un caso de cada sesión, y la nota vuelve a la sala. */
  const ESCAPE = (new URLSearchParams(location.search).get("escape") || "").split(",").filter(Boolean);
  const avisarSala = (datos) => { if (window.parent !== window) window.parent.postMessage(Object.assign({ tipo: "escape-reto", juego: "diagnostico" }, datos), location.origin); };
  /* Casos del examen: el escape room los descifra con la clave del día y los deja en la ventana de la sala.
     Cada entrada de ?escape= es el id de un caso o una sesión (entonces sale un caso al azar de esa sesión). */
  const EXTRA = (() => { try { return ESCAPE.length && window.parent !== window && window.parent.ESCAPE_EXTRA || null; } catch (e) { return null; } })();

  /* ---------- Estado de la partida ---------- */
  let partida = [], indice = 0, total = 0, aciertos = 0, resumen = [];
  let caso = null, restante = 0, reloj = null, pausado = false;
  let hechas = [], innecesarias = 0, usoOpcional = false, fallos = 0, opciones = [];

  const puntosCaso = () => Math.max(10, 100 - innecesarias * COSTE.innecesaria - (usoOpcional ? COSTE.opcional : 0) - fallos * COSTE.fallo);
  const prueba = (zona) => caso.pruebas[zona.id] || (zona.windows && !caso.arranca ? sinWindows : sinAnomalias);
  const utiles = () => Object.keys(caso.pruebas);

  const pararReloj = () => { clearInterval(reloj); reloj = null; };
  const arrancarReloj = () => {
    pararReloj();
    reloj = setInterval(() => {
      if (pausado) return;
      restante = Math.max(0, restante - 1);
      const r = app.querySelector("[data-reloj]");
      if (r) {
        r.textContent = mmss(restante);
        r.parentElement.classList.toggle("urgente", restante <= 60);
      }
      if (restante === 0) sinTiempo();
    }, 1000);
  };

  const barra = () =>
    '<header class="dc-barra">' +
    '<span class="dc-marca">' + svg("escudo") + "<b>UF0864</b><span>·</span>Diagnóstico contrarreloj</span>" +
    '<span class="dc-caso">Caso ' + (indice + 1) + " de " + partida.length + "</span>" +
    '<span class="dc-reloj' + (restante <= 60 ? " urgente" : "") + '">' + svg("reloj") + '<b data-reloj role="timer" aria-label="Tiempo restante">' + mmss(restante) + "</b></span>" +
    '<span class="dc-puntos">Puntuación: <b>' + total + "</b></span>" +
    '<button type="button" class="dc-redondo" data-pausa aria-label="Pausar">' + svg("pausa") + "</button>" +
    "</header>";

  const pintar = (html, foco) => {
    app.innerHTML = html;
    const p = app.querySelector("[data-pausa]");
    if (p) p.addEventListener("click", pausar);
    const f = foco && app.querySelector(foco);
    if (f) f.focus({ preventScroll: true });
    app.scrollIntoView({ block: "start" });
  };

  /* ---------- Pantalla del monitor ---------- */
  const monitor = () => {
    const p = caso.pantalla;
    let dentro = "";
    if (p.tipo === "texto") dentro = '<pre class="dc-texto">' + esc(p.texto) + "</pre>";
    else if (p.tipo === "azul") dentro = '<div class="dc-azul"><span>:(</span><p>' + esc(p.texto) + "</p><small>Código de detención: " + esc(p.codigo) + "</small></div>";
    else if (p.tipo === "negra") dentro = '<div class="dc-negra"><span class="dc-cursor"></span></div>';
    else dentro = '<div class="dc-escritorio"><div class="dc-dialogo"><b>' + esc(p.titulo) + "</b><p>" + esc(p.texto) + "</p>" +
      (p.codigo ? "<small>" + esc(p.codigo) + "</small>" : "") + "<span>Aceptar</span></div></div>";
    return '<div class="dc-monitor" role="img" aria-label="Pantalla del equipo: ' + esc(caso.sintoma) + '"><div class="dc-pantalla">' + dentro + "</div></div>";
  };

  /* ---------- Portada ---------- */
  const portada = () => {
    pararReloj();
    const n = CASOS.filter(abierto).length;
    pintar(
      '<section class="dc-panel dc-portada">' +
      '<a class="dc-cerrar" href="software.html" aria-label="Salir del juego">' + svg("cerrar") + "</a>" +
      '<div class="dc-portada-texto">' +
      '<p class="dc-antetitulo"><b>UF0864</b> · Minijuego 1/4</p>' +
      '<h1>' + svg("lupa", "ic dc-icono-titulo") + "<span>Diagnóstico<br>contrarreloj</span></h1>" +
      '<p class="dc-lema">Encuentra la causa. <span>Antes de que sea tarde.</span></p>' +
      "<p>Un cliente trae un equipo que no funciona correctamente. Tienes un tiempo limitado para analizar el problema, revisar las pistas y encontrar la causa exacta.</p>" +
      '<div class="dc-datos">' +
      '<div>' + svg("diana") + "<span>Objetivo<b>Diagnosticar el fallo</b></span></div>" +
      '<div>' + svg("reloj") + "<span>Tiempo<b>" + mmss(SEGUNDOS_CASO) + " por caso</b></span></div>" +
      '<div>' + svg("escudo") + "<span>Puntuación<b>100 puntos por caso</b></span></div>" +
      "</div>" +
      '<p class="dc-nota">' + CASOS_POR_PARTIDA + " casos por partida, elegidos entre " + n + " disponibles. Cada prueba innecesaria resta " + COSTE.innecesaria + " puntos.</p>" +
      '<button type="button" class="dc-boton dc-grande" data-empezar>Comenzar ' + svg("flecha") + "</button>" +
      "</div>" +
      '<div class="dc-portada-arte" aria-hidden="true"></div>' +
      "</section>", "[data-empezar]");
    app.querySelector("[data-empezar]").addEventListener("click", empezar);
  };

  const empezar = () => {
    partida = mezclar(CASOS.filter(abierto)).slice(0, CASOS_POR_PARTIDA);
    indice = 0; total = 0; aciertos = 0; resumen = [];
    nuevoCaso();
  };

  const nuevoCaso = () => {
    caso = partida[indice];
    restante = SEGUNDOS_CASO;
    hechas = []; innecesarias = 0; usoOpcional = false; fallos = 0;
    opciones = mezclar(caso.opciones.map((t, i) => ({ t, ok: i === 0 })));
    pausado = false;
    arrancarReloj();
    investigar();
  };

  /* ---------- Investigación ---------- */
  const investigar = (aviso) => {
    const lista = utiles();
    const encontradas = lista.filter((id) => hechas.includes(id));
    const totalPistas = lista.length + 1;
    const faltan = lista.length - encontradas.length;
    const huecos = lista.map((id, i) => {
      if (hechas.includes(id)) return '<li class="dc-pista ok">' + svg("check") + "<span>" + esc(caso.pruebas[id].pista) + "<small>Pista " + (encontradas.indexOf(id) + 2) + "/" + totalPistas + "</small></span></li>";
      return '<li class="dc-pista bloqueada">' + svg("candado") + "<span>" + (i === 0 && !encontradas.length ? "Aún no hay más pistas…" : "Bloqueado") + "<small>Realiza más pruebas</small></span></li>";
    });
    /* Las pistas encontradas primero. */
    huecos.sort((a, b) => (b.includes(" ok") ? 1 : 0) - (a.includes(" ok") ? 1 : 0));

    pintar(
      '<section class="dc-panel dc-juego">' + barra() +
      '<div class="dc-investigar">' +
      '<nav class="dc-zonas" aria-labelledby="dc-zonas-titulo">' +
      '<h2 id="dc-zonas-titulo">¿Por dónde quieres empezar?</h2>' +
      ZONAS.map((z) =>
        '<button type="button" class="dc-zona' + (hechas.includes(z.id) ? " hecha" : "") + '" data-zona="' + z.id + '">' +
        svg(z.id) + "<span><b>" + z.nombre + "</b><small>" + z.detalle + "</small></span>" +
        (!hechas.includes(z.id) ? '<i aria-hidden="true">›</i>' : caso.pruebas[z.id] ? '<em>Pista</em>' : '<em class="nada">Sin pistas</em>') + "</button>").join("") +
      /* No se da un diagnóstico hasta haber hecho las pruebas pertinentes (las que dan pista). */
      '<button type="button" class="dc-boton dc-diagnosticar" data-diagnosticar' + (faltan ? " disabled" : "") + ">" + svg("diana") + "Dar diagnóstico</button>" +
      (faltan ? '<p class="dc-nota-diagnostico">Antes de diagnosticar, haz las pruebas pertinentes: ' + (faltan === 1 ? "falta 1 pista." : "faltan " + faltan + " pistas.") + "</p>" : "") +
      "</nav>" +
      '<div class="dc-centro">' + monitor() +
      '<div class="dc-informe"><span class="dc-etiqueta">Caso ' + (indice + 1) + " · " + esc(caso.sesion) + "</span><h3>" + esc(caso.titulo) + "</h3>" +
      (aviso ? '<p class="dc-aviso" role="status">' + esc(aviso) + "</p>" : "") +
      "</div></div>" +
      '<aside class="dc-pistas" aria-labelledby="dc-pistas-titulo">' +
      '<h2 id="dc-pistas-titulo">Pistas encontradas</h2>' +
      '<ul><li class="dc-pista ok">' + svg("check") + "<span>" + esc(caso.sintoma) + "<small>Pista 1/" + totalPistas + "</small></span></li>" + huecos.join("") + "</ul>" +
      '<div class="dc-opcional">' + svg("bombilla") + "<span><b>Pista opcional</b>" +
      (usoOpcional ? "<small>" + esc(caso.opcional) + "</small>" : "<small>Resta puntos, pero puede ayudarte.</small></span>" +
        '<button type="button" class="dc-boton dc-pequeno" data-opcional>Usar (−' + COSTE.opcional + ")</button>") +
      (usoOpcional ? "</span>" : "") + "</div>" +
      "</aside>" +
      "</div></section>", aviso ? "[data-diagnosticar]" : ".dc-zona:not(.hecha)");

    app.querySelectorAll("[data-zona]").forEach((b) => b.addEventListener("click", () => hacerPrueba(b.dataset.zona)));
    app.querySelector("[data-diagnosticar]").addEventListener("click", diagnosticar);
    const op = app.querySelector("[data-opcional]");
    if (op) op.addEventListener("click", () => { usoOpcional = true; investigar(); });
  };

  /* ---------- Resultado de una prueba ---------- */
  const hacerPrueba = (id) => {
    const zona = ZONAS.find((z) => z.id === id);
    const r = prueba(zona);
    const util = !!caso.pruebas[id];
    const nueva = !hechas.includes(id);
    if (nueva) {
      hechas.push(id);
      if (!util) innecesarias++;
    }
    pintar(
      '<section class="dc-panel dc-juego">' + barra() +
      '<div class="dc-resultado">' +
      '<div class="dc-caja">' +
      "<h2>Resultados de la prueba</h2>" +
      '<div class="dc-resultado-cabecera ' + (util ? "ok" : "neutro") + '">' + svg(util ? "check" : "info") +
      "<span><b>" + esc(zona.nombre) + "</b><small>" + esc(r.titulo) + "</small></span></div>" +
      '<ul class="dc-registro">' + r.lineas.map((l) =>
        '<li><span class="dc-hora">' + esc(l[0]) + '</span><span><b>' + esc(l[1]) + '</b> <em class="nivel-' + esc(l[2]).toLowerCase() + '">' + esc(l[2]) + "</em><small>" + esc(l[3]) + "</small></span></li>").join("") +
      "</ul>" +
      (nueva && !util ? '<p class="dc-coste">Prueba innecesaria: −' + COSTE.innecesaria + " puntos</p>" : "") +
      "</div>" +
      '<div class="dc-caja">' +
      '<h2 class="dc-h-pequeno">Análisis de la información</h2>' +
      '<div class="dc-analisis">' + svg("analisis") + "<p>" + esc(r.analisis) + "</p></div>" +
      '<h3>Próximos pasos recomendados:</h3>' +
      '<ol class="dc-pasos">' + r.pasos.map((p) => "<li>" + esc(p) + "</li>").join("") + "</ol>" +
      '<div class="dc-acciones"><button type="button" class="dc-boton" data-continuar>Continuar ' + svg("flecha") + "</button></div>" +
      "</div>" +
      "</div></section>", "[data-continuar]");
    app.querySelector("[data-continuar]").addEventListener("click", () => investigar());
  };

  /* ---------- Diagnóstico ---------- */
  const diagnosticar = () => {
    if (utiles().some((id) => !hechas.includes(id))) return investigar();
    pintar(
      '<section class="dc-panel dc-juego">' + barra() +
      '<div class="dc-diagnostico">' +
      '<h2 id="dc-causa-titulo">¿Cuál es la causa del fallo?</h2>' +
      '<p>Elige con cuidado: cada diagnóstico equivocado resta ' + COSTE.fallo + " puntos.</p>" +
      '<div class="dc-opciones" role="group" aria-labelledby="dc-causa-titulo">' +
      opciones.map((o, i) => '<button type="button" class="dc-opcion" data-op="' + i + '">' + esc(o.t) + "</button>").join("") +
      "</div>" +
      '<button type="button" class="dc-boton dc-secundario" data-volver>Seguir investigando</button>' +
      "</div></section>", ".dc-opcion");
    app.querySelectorAll("[data-op]").forEach((b) => b.addEventListener("click", () => {
      const o = opciones[Number(b.dataset.op)];
      if (o.ok) return resuelto(true);
      fallos++;
      opciones = opciones.filter((x) => x !== o);
      investigar("«" + o.t + "» no es la causa (−" + COSTE.fallo + "). Sigue investigando.");
    }));
    app.querySelector("[data-volver]").addEventListener("click", () => investigar());
  };

  const sinTiempo = () => resuelto(false);

  /* ---------- Causa encontrada / tiempo agotado ---------- */
  const resuelto = (bien) => {
    pararReloj();
    const empleado = SEGUNDOS_CASO - restante;
    const puntos = bien ? puntosCaso() : 0;
    total += puntos;
    if (bien) aciertos++;
    const metodo = !bien ? "Sin resolver" : innecesarias === 0 && fallos === 0 ? "Eficiente" : innecesarias <= 2 && fallos === 0 ? "Metódico" : "Mejorable";
    const plural = (n, uno, varios) => n + " " + (n === 1 ? uno : varios);
    const fallosTexto = fallos ? plural(fallos, "diagnóstico fallido", "diagnósticos fallidos") : "";
    const detalleMetodo = !bien ? "Se acabó el tiempo"
      : innecesarias === 0 && !fallos ? "Sin acciones innecesarias"
      : [innecesarias ? plural(innecesarias, "prueba innecesaria", "pruebas innecesarias") : "", fallosTexto].filter(Boolean).join(", ");
    resumen.push({ caso, bien, puntos, metodo });
    const ultimo = indice + 1 >= partida.length;
    pintar(
      '<section class="dc-panel dc-juego">' + barra() +
      '<div class="dc-encontrada ' + (bien ? "ok" : "mal") + '">' +
      '<div class="dc-encontrada-texto">' +
      '<h2>' + svg(bien ? "check" : "reloj", "ic dc-icono-grande") + (bien ? "¡Causa encontrada!" : "¡Se acabó el tiempo!") + "</h2>" +
      "<p>" + esc(caso.causa) + "</p><p>" + esc(caso.solucion) + "</p>" +
      '<div class="dc-metricas">' +
      "<div>" + svg("reloj") + "<span>Tiempo empleado<b>" + mmss(empleado) + "</b><small>(Objetivo: &lt; " + mmss(SEGUNDOS_CASO) + ")</small></span></div>" +
      "<div>" + svg("estrella") + "<span>Puntuación<b>" + puntos + "/100</b><small>+" + puntos + " puntos</small></span></div>" +
      "<div>" + svg("escudo") + "<span>Método<b>" + metodo + "</b><small>(" + detalleMetodo + ")</small></span></div>" +
      "</div>" +
      '<div class="dc-mision"><h3>Resumen de la misión</h3><p>' + esc(caso.causa) + " " + esc(caso.solucion) + "</p>" +
      '<button type="button" class="dc-boton" data-siguiente>' + (ultimo ? "Terminar" : "Siguiente caso") + " " + svg("flecha") + "</button></div>" +
      "</div>" +
      '<div class="dc-encontrada-arte" aria-hidden="true"></div>' +
      "</div></section>", "[data-siguiente]");
    app.querySelector("[data-siguiente]").addEventListener("click", () => {
      indice++;
      if (indice < partida.length) nuevoCaso(); else final();
    });
  };

  /* ---------- Final ---------- */
  const final = () => {
    pararReloj();
    if (ESCAPE.length) return finalEscape();
    if (window.UF0864) window.UF0864.practicaHecha("diagnostico-contrarreloj", aciertos, partida.length);
    const nombre = window.UF0864 && window.UF0864.nombre();
    const maximo = partida.length * 100;
    pintar(
      '<section class="dc-panel dc-final">' +
      '<img class="dc-emblema" src="img/uf0864/juego/emblema.webp" alt="">' +
      '<p class="dc-final-marca">MICROINFORMÁTICA<small>APRENDE · PRACTICA · SUPERA</small></p>' +
      "<h2>" + (aciertos === partida.length ? "¡Buen trabajo" : "¡Partida terminada") + (nombre ? ", " + esc(nombre) : "") + "!</h2>" +
      "<p>Has completado el Diagnóstico contrarreloj con <b>" + total + " de " + maximo + " puntos</b> y " + aciertos + " de " + partida.length + " causas encontradas.</p>" +
      "<p>En este juego has aprendido a analizar el problema, seguir un método y tomar decisiones acertadas.</p>" +
      '<ul class="dc-repaso">' + resumen.map((r) =>
        '<li class="' + (r.bien ? "ok" : "mal") + '">' + svg(r.bien ? "check" : "reloj") + "<span><b>" + esc(r.caso.titulo) + "</b><small>" + r.puntos + "/100 · " + r.metodo + "</small></span></li>").join("") +
      "</ul>" +
      (nombre ? "" : '<p class="dc-nota">Escribe tu nombre en el perfil de la página de la UF0864 para guardar tu progreso con tu nombre.</p>') +
      '<div class="dc-final-acciones">' +
      '<a class="dc-boton" href="software.html">' + svg("casa") + "Volver al mapa</a>" +
      '<button type="button" class="dc-boton dc-secundario" data-otra>Jugar otra vez</button>' +
      "</div>" +
      '<p class="dc-cita">Un buen técnico no solo repara equipos, también resuelve problemas.</p>' +
      "</section>", "a.dc-boton");
    app.querySelector("[data-otra]").addEventListener("click", empezar);
  };

  const finalEscape = () => {
    const maximo = partida.length * 100;
    avisarSala({ id: partida.map((c) => c.titulo).join(" + "), total, maximo });
    pintar(
      '<section class="dc-panel dc-final">' +
      "<h2>Reto terminado</h2>" +
      "<p>Has conseguido <b>" + total + " de " + maximo + " puntos</b> y " + aciertos + " de " + partida.length + " causas encontradas.</p>" +
      '<ul class="dc-repaso">' + resumen.map((r) =>
        '<li class="' + (r.bien ? "ok" : "mal") + '">' + svg(r.bien ? "check" : "reloj") + "<span><b>" + esc(r.caso.titulo) + "</b><small>" + r.puntos + "/100 · " + r.metodo + "</small></span></li>").join("") +
      "</ul>" +
      "<p>Sigue en la sala: el candado ya está a la vista.</p>" +
      "</section>");
  };

  /* ---------- Pausa ---------- */
  const capaPausa = document.createElement("div");
  capaPausa.className = "dc-capa";
  capaPausa.hidden = true;
  capaPausa.innerHTML =
    '<div class="dc-panel dc-pausa" role="dialog" aria-modal="true" aria-labelledby="dc-pausa-titulo">' +
    '<h2 id="dc-pausa-titulo">Juego en pausa</h2><p>El reloj está parado.</p>' +
    '<div class="dc-final-acciones"><button type="button" class="dc-boton" data-reanudar>' + svg("play") + "Reanudar</button>" +
    (ESCAPE.length ? "" : '<a class="dc-boton dc-secundario" href="software.html">Salir del juego</a>') + "</div></div>";
  document.body.appendChild(capaPausa);

  const pausar = () => {
    pausado = true;
    capaPausa.hidden = false;
    capaPausa.querySelector("[data-reanudar]").focus();
  };
  const reanudar = () => {
    pausado = false;
    capaPausa.hidden = true;
    const p = app.querySelector("[data-pausa]");
    if (p) p.focus();
  };
  capaPausa.querySelector("[data-reanudar]").addEventListener("click", reanudar);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !capaPausa.hidden) reanudar(); });
  /* Si se cambia de pestaña, el reloj se para solo. */
  document.addEventListener("visibilitychange", () => { if (document.hidden && reloj && !pausado) pausar(); });

  if (ESCAPE.length) {
    const todos = CASOS.concat((EXTRA && EXTRA.diagnostico) || []);
    partida = ESCAPE.map((e) => todos.find((c) => c.id === e) || mezclar(CASOS.filter((c) => c.sesion === e))[0]).filter(Boolean);
    indice = 0; total = 0; aciertos = 0; resumen = [];
    if (partida.length) nuevoCaso(); else portada();
  } else portada();
})();
