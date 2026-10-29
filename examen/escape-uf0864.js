/* Contenido del escape room de la UF0864 (escape-uf0864.html, motor en js/escape-uf0864.js).
   Cada modo tiene su fecha de apertura, su duración y sus salas. Cada sala lleva:
   - reto: el minijuego que se juega dentro de la sala y los casos entre los que se sortea
     (diagnostico: un caso de cada sesión de la lista; rescate y caza: un id de la lista).
   - sesiones: de dónde salen las preguntas tipo test (examen/banco-uf0864.js, campo fuente).
   - corta: una pregunta de respuesta corta con su modelo. Ya no se pregunta (el motor la ignora):
     se deja por si se quiere recuperar. */
window.ESCAPE_UF0864 = {
  modos: {
    ensayo: {
      nombre: "Ensayo del escape room",
      corto: "ensayo",
      desde: "2026-10-26",
      minutos: 90,
      clave: "",
      soluciones: true,
      salas: [
        {
          titulo: "El equipo que no arranca",
          sesiones: ["S15", "S16"],
          historia: "Encima de la mesa hay dos equipos con una nota del jefe de taller: «Uno no arranca y al otro le pasa algo con el disco. Averigua la causa de cada uno antes de tocar nada».",
          reto: { juego: "diagnostico", casos: ["S15", "S16"] },
          corta: {
            pregunta: "Un cliente conecta su disco externo y Windows dice «Debe formatear el disco de la unidad E: antes de usarlo». Explica qué le pasa al disco y qué harías antes de tocar nada.",
            modelo: "El volumen se ve como RAW: Windows no reconoce el sistema de archivos, pero los datos casi siempre siguen ahí. No se formatea. Primero se mira el estado del disco (S.M.A.R.T.) y se comprueba con chkdsk E: sin parámetros, que solo lee. Si los datos importan, se recuperan o se hace una imagen (TestDisk o PhotoRec) antes de intentar reparar.",
            criterios: ["Dice que no se formatea porque los datos siguen ahí", "Nombra RAW o sistema de archivos dañado", "Comprueba antes de reparar (S.M.A.R.T., chkdsk sin /f) o recupera primero"]
          }
        },
        {
          titulo: "El Windows que va a trompicones",
          sesiones: ["S17", "S18"],
          historia: "El segundo puesto del taller tiene un Windows que arranca, pero mal. El cliente jura que no ha instalado nada raro. Revisa lo que arranca con el sistema y responde sin romper nada legítimo.",
          reto: { juego: "caza", casos: ["booster", "arranque", "dosav"] },
          corta: {
            pregunta: "Después de instalar un driver nuevo de la tarjeta gráfica, el equipo da un pantallazo azul VIDEO_TDR_FAILURE al iniciar sesión. Describe los pasos para repararlo.",
            modelo: "Se entra en modo seguro (desde WinRE: Solucionar problemas, Configuración de inicio), donde Windows carga los drivers mínimos. En el Administrador de dispositivos se revierte el controlador o se desinstala; si quedan restos, se limpia con DDU en modo seguro. Se instala el driver estable del fabricante y se comprueba en el minidump (BlueScreenView) o en el Visor de eventos que el error ha desaparecido.",
            criterios: ["Entra en modo seguro o en WinRE", "Revierte o desinstala el driver (o DDU)", "Instala un driver estable y comprueba (minidump, eventos)"]
          }
        },
        {
          titulo: "El proceso que no debería estar",
          sesiones: ["S19"],
          historia: "En el tercer puesto hay un portátil precintado con una etiqueta: «Posible infección. No conectar a la red del taller». Encuentra la amenaza, de dónde sale y qué la vuelve a arrancar.",
          reto: { juego: "caza", casos: ["minero", "buscador", "espia", "rootkit", "susto", "rat"] },
          corta: {
            pregunta: "¿Por qué se desconecta de la red un equipo infectado antes de empezar a limpiarlo? Da dos motivos.",
            modelo: "Para que no se propague a otros equipos de la red y para cortar la comunicación con el atacante: que deje de enviar datos robados, de recibir órdenes o de descargar más malware. Un ransomware, además, podría seguir cifrando las unidades de red.",
            criterios: ["Evitar la propagación a otros equipos", "Cortar el envío de datos o el control remoto del atacante"]
          }
        },
        {
          titulo: "Los archivos del cliente",
          sesiones: ["S20", "S21"],
          historia: "Último puesto: una clienta llorando por sus archivos. Rescátalos sin empeorar nada.",
          reto: { juego: "rescate", casos: ["mir", "contrasena", "borrado", "tarjeta", "clean"] },
          corta: {
            pregunta: "Explica la regla 3-2-1 de las copias de seguridad y por qué una copia en un disco externo siempre conectado no protege del ransomware.",
            modelo: "3 copias de los datos (el original y dos copias), en 2 soportes distintos, y 1 fuera del lugar (otro edificio o la nube). Un disco que está siempre conectado se ve como una unidad más: el ransomware lo cifra junto con el original, así que la copia se pierde a la vez.",
            criterios: ["3 copias, 2 soportes, 1 fuera", "El ransomware cifra también lo que está conectado"]
          }
        }
      ],
      final: {
        titulo: "La puerta del taller",
        historia: "Con los cuatro equipos reparados, la puerta pide el código: un dígito por sala, en orden. Ábrela y sal del taller.",
        corta: {
          pregunta: "Redacta la hoja de incidencia del equipo de la sala 4: síntoma que trajo la clienta, diagnóstico, acciones realizadas (en orden) y estado en que se entrega.",
          modelo: "Síntoma tal como lo cuenta la clienta. Diagnóstico: qué le pasaba al disco o a la copia y cómo se comprobó. Acciones en orden: qué se protegió primero (imagen, no escribir en el disco), con qué herramienta se recuperó, adónde se copió y cómo se verificó. Estado de entrega: qué se ha recuperado y qué no, y la recomendación (copias 3-2-1).",
          criterios: ["Síntoma y diagnóstico", "Acciones en orden, con herramientas", "Estado de entrega y recomendación"]
        }
      }
    },
    /* El examen del 28 de octubre, convertido en examen de repaso: abierto, sin pedir clave (la página la
       usa sola para descifrar examen/escape-examen.json) y con soluciones al final. Al entrar sale la foto. */
    repaso: {
      nombre: "Examen de repaso",
      corto: "repaso",
      desde: "2026-10-28",
      minutos: 180,
      nSalas: 4,
      final: true,
      test: 8,
      abrir: 5,
      soluciones: true,
      cifrado: "examen/escape-examen.json",
      claveLibre: "DISCO-7340-NORTE",
      ajustes: { soluciones: true },
      foto: "img/escape/repaso.png"
    },
    /* El examen nuevo: salas, casos y preguntas cifrados en examen/escape-examen2.json. Está cerrado hasta
       que lo abra el profesor (quitar «cerrado» y poner la fecha en «desde» y «hasta»). */
    examen: {
      nombre: "Examen de la UF0864",
      corto: "examen",
      minutos: 180,
      nSalas: 4,
      final: true,
      test: 8,
      abrir: 5,
      soluciones: false,
      cifrado: "examen/escape-examen2.json"
    }
  }
};
