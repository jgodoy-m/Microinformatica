/* Tema: averías en la placa base.
   Todo el contenido de este tema vive aquí. El motor (js/motor.js) no sabe nada de placas.
   Coordenadas de zonas: en píxeles de la imagen (ancho × alto de foto), formato [x, y, ancho, alto].
   Cada caso sigue el orden: pruebas → diagnóstico (confirmado solo tras las pruebas discriminantes) → reparación → verificación. */
window.TEMAS = window.TEMAS || [];
window.TEMAS.push({
  id: 'placa-base',
  titulo: 'Averías en la placa base',
  resumen: 'Diagnostica cinco averías siguiendo el orden de la S12 y localiza cada conector en una placa real.',

  /* Zonas sobre placa-quiz.jpg: motherboard.jpg recortada (100, 70, 1720, 1390) y girada 90° a la derecha,
     para ver la placa en su posición habitual (panel de E/S arriba a la izquierda).
     n: nombre. d: qué es y qué hay que saber. f: para qué sirve sin decir su nombre (preguntas «Por su función»). */
  mapa: {
    foto: {
      src: 'placa-quiz.jpg',
      ancho: 1320,
      alto: 1620,
      alt: 'Foto de una placa base ATX en vertical, con el panel de E/S arriba a la izquierda',
      credito: {
        autor: 'PantheraLeo1359531',
        autorUrl: 'https://commons.wikimedia.org/wiki/File:Asus-ROG-Strix-Z390-F-Gaming-Motherboard_20201120_DSC6025.jpg',
        licencia: 'CC BY 4.0',
        licenciaUrl: 'https://creativecommons.org/licenses/by/4.0/',
        nota: 'Imagen recortada y girada 90°.'
      }
    },
    zonas: {
      cpu: {
        n: 'Zócalo de CPU (LGA1151)',
        d: 'Socket del procesador. Comprueba socket y BIOS antes de cambiar la CPU.',
        f: 'Aquí se instala el procesador. Tiene una palanca de retención y cientos de contactos.',
        rects: [[590, 360, 280, 360]]
      },
      vrm: {
        n: 'VRM (etapas de alimentación de la CPU)',
        d: 'Convierte +12 V en la tensión que necesita la CPU. Sus disipadores se calientan: un VRM sin refrigeración limita la CPU.',
        f: 'Convierte los 12 V de la fuente en la tensión baja y estable del procesador. Va bajo disipadores alrededor del zócalo.',
        rects: [[440, 95, 430, 175], [275, 165, 195, 570]]
      },
      eps: {
        n: 'EPS 4+4 pines',
        d: 'Alimenta la CPU con +12 V. Sin él, la placa no pasa el POST.',
        f: 'Conector de alimentación de 12 V dedicado solo al procesador. Sin él, la placa no pasa el POST.',
        rects: [[305, 125, 72, 55]]
      },
      ram: {
        n: 'Slots de RAM (DIMM)',
        d: 'Cuatro ranuras DIMM. Para dual channel, usa los slots que indique el manual (normalmente A2 y B2).',
        f: 'Ranuras largas con pestañas en los extremos donde se instalan los módulos de memoria.',
        rects: [[975, 160, 190, 710]]
      },
      atx: {
        n: 'ATX 24 pines',
        d: 'Alimenta la placa desde la fuente. Tiene clip: no se fuerza.',
        f: 'El conector de alimentación más grande: lleva la energía de la fuente a toda la placa.',
        rects: [[1205, 492, 58, 256]]
      },
      cpufan: {
        n: 'CPU_FAN y CPU_OPT',
        d: 'Cabeceras de 4 pines (PWM) para el ventilador del disipador de la CPU. Sin giro en CPU_FAN, la placa avisa al arrancar.',
        f: 'Cabeceras de 4 pines reservadas al ventilador del disipador del procesador.',
        rects: [[870, 180, 90, 70]]
      },
      chafan: {
        n: 'Ventiladores de caja (CHA_FAN)',
        d: 'Cabeceras de 4 pines para los ventiladores de la caja. No sustituyen al CPU_FAN.',
        f: 'Cabeceras de 4 pines para los ventiladores que mueven el aire dentro de la caja.',
        rects: [[388, 798, 50, 32], [1228, 1275, 34, 158]]
      },
      qled: {
        n: 'LED de diagnóstico (Q-LED)',
        d: 'Cuatro LED: BOOT, VGA, DRAM y CPU. El que queda encendido indica dónde se detiene el POST.',
        f: 'Cuatro luces que se quedan encendidas en la fase del arranque que ha fallado.',
        rects: [[1215, 425, 42, 60]]
      },
      usb3c: {
        n: 'USB 3.2 frontal (Tipo-C)',
        d: 'Cabecera interna para el puerto USB-C del frontal de la caja. Es pequeña y frágil: no se fuerza.',
        f: 'Conector interno para el puerto frontal reversible de la caja, el más rápido.',
        rects: [[1206, 786, 40, 66]]
      },
      m21: {
        n: 'M.2_1 (SOCKET 3)',
        d: 'Para SSD NVMe o SATA según la clave del módulo. Admite 2242, 2260 y 2280: el tornillo va en el agujero de su longitud.',
        f: 'Ranura para un SSD en formato tarjeta, con tres agujeros para fijar módulos de distinta longitud.',
        rects: [[440, 812, 425, 100]]
      },
      m22: {
        n: 'M.2_2 bajo el disipador',
        d: 'Ranura M.2 cubierta por un disipador: hay que quitarlo para cambiar el SSD.',
        f: 'Ranura para un SSD que queda oculta bajo una chapa metálica: hay que retirarla para cambiar la unidad.',
        rects: [[518, 1332, 664, 114]]
      },
      pciex16: {
        n: 'Ranuras PCIe x16',
        d: 'Para la tarjeta gráfica. La primera, la más cercana a la CPU, es la de 16 carriles reales; las otras pueden tener menos.',
        f: 'Ranuras largas de expansión donde se instala la tarjeta gráfica.',
        rects: [[298, 958, 455, 66], [298, 1250, 455, 64], [298, 1455, 455, 55]]
      },
      pciex1: {
        n: 'Ranuras PCIe x1',
        d: 'Ranuras cortas para tarjetas de red, sonido o capturadoras. Una tarjeta x1 también entra en una ranura x16.',
        f: 'Ranuras cortas de expansión para tarjetas pequeñas, como una de red o de sonido.',
        rects: [[298, 878, 128, 48], [298, 1165, 128, 50], [298, 1360, 128, 48]]
      },
      chipset: {
        n: 'Chipset (bajo el disipador)',
        d: 'Controla SATA, USB y parte de las líneas PCIe. Bajo su disipador: no se desmonta sin necesidad.',
        f: 'Chip bajo un disipador que gestiona los puertos SATA, los USB y parte de las ranuras de expansión.',
        rects: [[815, 990, 370, 310]]
      },
      sata: {
        n: 'Puertos SATA 6 Gb/s',
        d: 'Datos para discos y unidades ópticas. El disco necesita además su cable de alimentación SATA.',
        f: 'Puertos de datos de 7 pines para discos duros, SSD de 2,5" y unidades ópticas.',
        rects: [[1190, 972, 86, 240]]
      },
      bateria: {
        n: 'Batería CR2032',
        d: 'Mantiene la hora y la configuración de la BIOS. Si falla, la hora se pierde al apagar.',
        f: 'Pila de botón que conserva la hora y la configuración de la BIOS con el equipo desenchufado.',
        rects: [[460, 1062, 84, 106]]
      },
      clrtc: {
        n: 'Puente CLRTC (borrar CMOS)',
        d: 'Dos pines que, puenteados con el equipo desenchufado, devuelven la BIOS a sus valores de fábrica.',
        f: 'Dos pines que, puenteados con el equipo desenchufado, borran la configuración de la BIOS.',
        rects: [[1092, 1536, 28, 30]]
      },
      superio: {
        n: 'Super I/O (controladora de E/S)',
        d: 'Gestiona puertos heredados, ventiladores y sondas de temperatura de la placa.',
        f: 'Chip que gestiona puertos heredados, la velocidad de los ventiladores y las sondas de temperatura.',
        rects: [[162, 1108, 98, 98]]
      },
      audio: {
        n: 'Códec de audio',
        d: 'Convierte el audio digital en señal analógica para los jacks traseros y frontales. Va bajo una tapa metálica.',
        f: 'Chip bajo una tapa metálica que convierte el sonido digital en señal analógica para los jacks.',
        rects: [[124, 1290, 100, 104]]
      },
      usb2: {
        n: 'USB 2.0 interno',
        d: 'Cabeceras de 9 pines para los puertos USB de la caja. No confundir con la de 19 pines.',
        f: 'Cabeceras de 9 pines para los puertos frontales más lentos de la caja.',
        rects: [[745, 1528, 78, 48], [948, 1528, 76, 48]]
      },
      usb3: {
        n: 'USB 3.2 frontal (19 pines)',
        d: 'Cabecera ancha de 19 pines para los USB-A azules del frontal. Tiene muesca: no se fuerza.',
        f: 'Cabecera ancha de 19 pines para los puertos frontales rápidos de tipo A.',
        rects: [[832, 1528, 112, 48]]
      },
      fpanel: {
        n: 'F_PANEL (panel frontal)',
        d: 'Pulsador de encendido, reset y LED. Solo los LED tienen polaridad.',
        f: 'Aquí se conectan el botón de encendido, el reset y los LED de la caja.',
        rects: [[1120, 1524, 124, 50]]
      }
    }
  },

  simulador: {
    lamparas: [['placa', 'Placa base'], ['cpu', 'CPU'], ['fuente', 'Fuente'], ['ram', 'RAM'], ['disco', 'Disco']],
    causaLampara: { fuente: 'fuente', ram: 'ram', eps: 'cpu', temp: 'cpu', sata: 'disco' },
    causas: {
      fuente: 'Fuente de alimentación',
      ram: 'Módulo de RAM (defectuoso o mal asentado)',
      eps: 'Conector EPS de la CPU sin conectar',
      temp: 'Sobrecalentamiento (refrigeración)',
      sata: 'Cable de datos SATA suelto'
    },
    acciones: [
      ['ent', 'Preguntar al cliente', 'Qué pasó antes del fallo y qué se ha tocado.'],
      ['vis', 'Inspección visual', 'Cables, conectores y componentes a simple vista.'],
      ['fue', 'Medir +12 V, +5 V y +3,3 V', 'Lee los raíles y las tensiones de espera.'],
      ['min', 'Mínima configuración, o fuente sola sin placa', 'Quita lo accesorio y prueba solo lo imprescindible.'],
      ['ram', 'Probar la RAM en otro slot', 'Desconecta la RAM y colócala en otro slot de la placa base.'],
      ['reenc', 'Reencajar módulo y repetir prueba', 'Equipo apagado y desenchufado. Vuelve a colocar el módulo y repite el arranque.'],
      ['eps', 'Revisar el conector EPS', 'Comprueba que el conector de 8 pines de la CPU esté bien encajado.'],
      ['sata', 'Revisar el cable SATA', 'Cable de datos y cable de alimentación del disco.'],
      ['tmp', 'Ver temperaturas', 'Temperatura de la CPU bajo carga.'],
      ['cam', 'Cambiar la fuente por una de prueba', 'Sustitución: sin medir antes cuenta como prematura.']
    ],
    casos: [
      { t: 'Sin señales de vida', s: 'Pulsas el botón y no pasa nada. No hay ventiladores ni LED.', causa: 'fuente', senales: { ps: 5.0, sb: 0.0 },
        pistas: ['Nada responde: piensa en lo primero que la fuente necesita para arrancar, antes que en la placa o la CPU.', 'Mide las tensiones de la fuente. Si no hay ninguna en los tres raíles, hay que separar la fuente de un posible corto en la placa.', 'Sin +5 VSB de espera la fuente no escucha el botón. Un 0 V en todo no basta: prueba la fuente sola, sin placa, antes de confirmarla.'],
        discrima: { ids: ['fue', 'min'], texto: 'Un 0 V en los raíles no distingue una fuente muerta de un cortocircuito en la placa. Mide y prueba la fuente sola, sin placa, antes de confirmarla.' },
        explica: 'Sin +5 VSB de espera la fuente no responde. Con una fuente de prueba la placa arranca.',
        reparaciones: [
          { t: 'Sustituir la fuente por una de prueba o de garantía', ok: true, res: 'Con la fuente nueva el equipo enciende y los tres raíles quedan dentro de tolerancia.' },
          { t: 'Cambiar la placa base', ok: false, res: 'Sin fuente funcional, una placa nueva tampoco enciende. Cambiarla sin medir antes no tiene justificación.' },
          { t: 'Cambiar la CPU y la RAM', ok: false, res: 'Sin tensión de alimentación, ni la CPU ni la RAM llegan a trabajar. Ese cambio no corrige la causa.' }
        ],
        verificaciones: [
          { t: 'Encender y medir de nuevo los tres raíles con el equipo en carga', ok: true, res: 'Los raíles se mantienen en tolerancia y el equipo arranca.' },
          { t: 'Dar el caso por cerrado sin encender', ok: false, res: 'Sin arrancar el equipo no hay verificación: podría seguir sin funcionar.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo no responde: ni ventiladores ni LED. Pulsar el botón no sirve de nada si la fuente no está lista.'],
          ['Por qué', 'La fuente siempre entrega +5 VSB de espera, aunque el equipo esté apagado. Al pulsar el botón, la placa baja la señal PS_ON# y la fuente conecta los raíles principales. Sin +5 VSB no hay nadie que escuche el botón.'],
          ['Qué no puede concluir la medición', '0 V en los tres raíles no distingue una fuente muerta de un cortocircuito en la placa: un corto puede mantener la fuente en protección. Por eso se prueba la fuente sola, sin placa.'],
          ['Cómo se resuelve', 'Con el equipo enchufado y el interruptor de la fuente encendido, mide +5 VSB en el conector ATX (cable morado). Si no hay tensión, prueba la fuente sola (sin placa): si tampoco da tensión, la fuente está averiada y se sustituye, no la placa ni la CPU.'],
          ['Lección', 'Sin tensión de espera no hay arranque. Mide la fuente antes de tocar la placa.']
        ],
        res: { ent: 'Hubo una tormenta anoche y el equipo se apagó de golpe.', vis: 'Nada quemado a simple vista. El cable está bien enchufado.', fue: 'Los tres raíles principales están a 0 V. Eso no distingue una fuente averiada de un corto en la placa: hay que probar la fuente sola.', min: 'Fuente sola, sin placa y con PS_ON# puenteado a masa: sin tensión en los raíles. La fuente es la causa. Si arrancara, el corto estaría en la placa.', ram: 'Sin tensión no hay nada que probar en la RAM.', eps: 'Sin tensión, el conector EPS no es el problema.', sata: 'Sin tensión, el disco no es el problema.', tmp: 'No se puede medir: el equipo no arranca.', cam: 'Con una fuente de prueba la placa arranca. La original estaba averiada.' },
        luz: { fue: ['fuente', 'bad'], cam: ['fuente', 'ok'] }, volt: [0, 0, 0] },
      { t: 'Fallo de memoria RAM', s: 'El equipo no inicia y la placa base emite pitidos constantes. La fuente y la CPU son correctas según comprobaciones previas. El problema podría estar en la RAM.', causa: 'ram', senales: { ps: 5.0, sb: 5.1 },
        pistas: ['Los pitidos apuntan al arranque de la memoria (POST), no a la alimentación: los valores de la fuente son correctos.', 'Prueba el módulo en otro slot y reencájalo con el equipo apagado. El resultado de cada prueba decide qué hacer.', 'Si el otro módulo arranca en ambos slots y este falla en todos, reencájalo del todo y repite la prueba antes de darlo por malo.'],
        discrima: { ids: ['ram', 'reenc'], exige: { ram: 'fallo', reenc: 'fallo' }, texto: 'Un módulo mal asentado y uno defectuoso dan el mismo síntoma. Prueba el módulo en otro slot y reencájalo con el equipo apagado: el resultado del reencaje separa los dos casos.' },
        explica: 'El módulo de RAM falla y el arranque se detiene en el POST.',
        reparaciones: [
          { t: 'Sustituir el módulo por otro compatible y probado', ok: true, requiere: { reenc: 'fallo' }, res: 'Con el módulo nuevo la placa completa el POST y no pita.', noJustificada: 'El reencaje ya resolvió el fallo: sustituir el módulo no está justificado.' },
          { t: 'Reencajar el módulo hasta el fondo y verificar', ok: true, requiere: { reenc: 'sin_fallo' }, res: 'Con el encaje corregido, la placa arranca sin pitidos.', noJustificada: 'El reencaje no ha resuelto el fallo: el módulo está defectuoso y hay que sustituirlo.' },
          { t: 'Cambiar la placa base', ok: false, res: 'Si el fallo acompaña al módulo, la placa no es la causa. Cambiarla no corrige nada.' },
          { t: 'Actualizar la BIOS sin cambiar ningún módulo', ok: false, res: 'No hay indicio de fallo de BIOS: el fallo sigue al módulo en cualquier slot.' }
        ],
        verificaciones: [
          { t: 'Arrancar y comprobar que no pita y que la BIOS detecta la memoria completa', ok: true, res: 'Sin pitidos y con la memoria completa en la BIOS.' },
          { t: 'Dar la reparación por buena sin arrancar', ok: false, res: 'Sin arrancar no hay verificación: el fallo podría volver.' }
        ],
        explicacion: [
          ['Qué pasa', 'Pitidos seguidos y pantalla negra: el arranque se detiene en el POST por un fallo de memoria.'],
          ['Por qué', 'La BIOS no puede inicializar la memoria y emite un código de pitidos. El significado exacto depende del fabricante de la BIOS, así que consulta el manual de la placa.'],
          ['Qué no puede concluir la prueba en otro slot', 'Que el fallo siga al módulo no demuestra que esté defectuoso: un módulo mal asentado también falla en cualquier slot. Solo el reencaje separa las dos causas.'],
          ['Cómo se resuelve', 'Con el equipo apagado y desenchufado, reencaja el módulo hasta el fondo y repite el arranque. Si el fallo persiste, el módulo está defectuoso y se sustituye.'],
          ['Lección', 'Aísla un componente cada vez. Un fallo que sigue al módulo puede ser un módulo malo o un encaje malo: el reencaje lo distingue.']
        ],
        fallos: { ram: 'Con el módulo en otro slot, la placa también pita. El fallo viaja con el módulo, no con el slot.' },
        res: { ent: 'El cliente añadió memoria la semana pasada.', vis: 'Los módulos parecen bien encajados a simple vista. Una inspección no confirma el encaje.', fue: 'Los valores de la fuente son correctos.', min: 'Con una sola RAM el patrón de pitidos cambia según el módulo que pongas.', ram: 'Con ese módulo no arranca en ningún slot. El otro arranca en ambos.', eps: 'El EPS está bien conectado y la CPU tiene tensión.', tmp: 'Las temperaturas están en rango: no es el calor.', cam: 'Cambiar la fuente no altera los pitidos.' },
        luz: { fue: ['fuente', 'ok'], ram: ['ram', 'bad'], min: ['cpu', 'ok'], tmp: ['cpu', 'ok'] }, volt: [12.04, 5.02, 3.31],
        variantes: {
          defectuoso: {
            explica: 'Con ese módulo no arranca en ningún slot. El otro módulo arranca en los dos.',
            explicacion: [
              ['Qué pasa', 'Pitidos seguidos y pantalla negra: el arranque se detiene en el POST por un fallo de memoria.'],
              ['Por qué', 'Con un módulo defectuoso, la BIOS no puede inicializar la memoria y emite un código de pitidos. El significado exacto depende del fabricante de la BIOS, así que consulta el manual de la placa.'],
              ['Qué no puede concluir la prueba en otro slot', 'Que el fallo siga al módulo no demuestra que esté defectuoso: un módulo mal asentado también falla en cualquier slot. Solo el reencaje separa las dos causas.'],
              ['Cómo se resuelve', 'Con el equipo apagado, reencaja el módulo y repite el arranque. Como sigue pitando, el módulo está defectuoso: sustitúyelo.'],
              ['Lección', 'Aísla un componente cada vez. Un reencaje que no cambia nada descarta el encaje y deja al módulo como culpable.']
            ],
            res: { ram: 'Con ese módulo no arranca en ningún slot. El otro arranca en ambos.', reenc: 'Con el equipo apagado y desenchufado, reencajas el módulo hasta el fondo y cierran los clips. Al arrancar, la placa sigue pitando.' },
            fallos: { reenc: 'Con el módulo bien asentado, la placa sigue pitando: el fallo persiste.' },
            luz: { reenc: ['ram', 'bad'] }
          },
          mal: {
            explica: 'El módulo no estaba bien asentado: al reencajarlo, la placa arranca sin pitidos.',
            explicacion: [
              ['Qué pasa', 'Pitidos seguidos y pantalla negra: el arranque se detiene en el POST por un fallo de memoria.'],
              ['Por qué', 'Un módulo mal asentado no hace buen contacto con los pines del slot. La BIOS no puede inicializar la memoria y emite pitidos igual que con un módulo defectuoso.'],
              ['Qué no puede concluir la prueba en otro slot', 'Que pite en otro slot no demuestra que el módulo esté defectuoso: un módulo mal asentado también falla en todos. Solo el reencaje separa las dos causas.'],
              ['Cómo se resuelve', 'Con el equipo apagado y desenchufado, reencaja el módulo hasta el fondo, comprueba que los clips cierran y repite el arranque. No hace falta cambiar piezas.'],
              ['Lección', 'Un síntoma que se repite en todos los slots no siempre es un módulo malo: reencájalo antes de sustituirlo.']
            ],
            res: { ram: 'Con el módulo en otro slot, la placa sigue pitando. Eso no separa un módulo malo de uno mal asentado.', reenc: 'Con el equipo apagado y desenchufado, reencajas el módulo hasta el fondo y cierran los clips. Al arrancar, la placa arranca sin pitidos.' },
            fallos: {},
            luz: { reenc: ['ram', 'ok'] },
            discrima: { exige: { ram: 'fallo', reenc: 'sin_fallo' } }
          }
        }
      },
      { t: 'Se apaga al jugar', s: 'Arranca bien. Tras un rato de juego, el equipo se apaga de golpe.', causa: 'temp', senales: { ps: 5.0, sb: 5.0 },
        pistas: ['El equipo arranca bien y se apaga solo al cargar: piensa en lo que aumenta con la carga.', 'Mira la temperatura de la CPU bajo carga y el estado del disipador y de su ventilador.', 'Si la CPU llega a su límite térmico y el calor sigue subiendo, la protección corta la alimentación sin aviso. Limpiar y revisar la refrigeración es el paso siguiente.'],
        discrima: { ids: ['tmp'], texto: 'Un apagado bajo carga puede venir de la temperatura o de la fuente. La fuente está medida en reposo; falta la temperatura real de la CPU bajo carga.' },
        explica: 'La CPU llega a su límite térmico y la protección corta. El disipador tiene polvo y el ventilador frena.',
        reparaciones: [
          { t: 'Limpiar el disipador, revisar el ventilador y reaplicar pasta térmica', ok: true, res: 'Tras la limpieza la CPU baja de temperatura bajo carga y el equipo aguanta el juego.' },
          { t: 'Cambiar la fuente', ok: false, res: 'La fuente está bien medida. Cambiarla no baja la temperatura de la CPU.' },
          { t: 'Subir la velocidad del ventilador de caja sin limpiar', ok: false, res: 'Puede ayudar algo, pero no quita el polvo del disipador. Sin limpieza, el problema vuelve.' }
        ],
        verificaciones: [
          { t: 'Medir la temperatura de la CPU bajo carga durante 20 minutos', ok: true, res: 'La temperatura se mantiene por debajo del límite y el equipo no se apaga.' },
          { t: 'Dar la reparación por buena sin medir', ok: false, res: 'Limpiar no demuestra nada: falta medir la temperatura bajo carga.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo arranca bien y, tras un rato de carga, se apaga de golpe sin aviso.'],
          ['Por qué', 'Al llegar a su temperatura máxima (Tjunction; 100 °C en el i7-9700K), la CPU reduce su velocidad (throttling). Si el calor sigue subiendo, la protección térmica corta la alimentación. El polvo en el disipador, un ventilador lento o una pasta de contacto seca reducen la disipación.'],
          ['Qué no puede concluir la inspección', 'El polvo y un ventilador que frena son indicios, no una medida: sin temperatura no se sabe si la refrigeración basta.'],
          ['Cómo se resuelve', 'Mide la temperatura bajo carga y las RPM del ventilador de CPU. Limpia el disipador, revisa el ventilador y, si la pasta está seca, reaplícala.'],
          ['Lección', 'Un apagado que se repite bajo carga apunta a la refrigeración. Mide antes de cambiar piezas.']
        ],
        res: { ent: 'Pasa siempre en verano y con la caja cerrada.', vis: 'Hay polvo en el disipador y el ventilador de CPU frena al tocarlo. Es un indicio: falta la temperatura.', fue: 'Los raíles están en tolerancia con el equipo en reposo. Eso no prueba la fuente bajo carga: la temperatura de la CPU es lo que separa las dos hipótesis.', min: 'Sin juego el fallo no aparece: la mínima configuración no lo reproduce.', ram: 'La RAM supera el test: no es la causa.', tmp: 'CPU a 100 °C bajo carga, en su límite térmico (lectura simulada). Si el calor sigue subiendo, la protección corta el equipo.', cam: 'Cambiar la fuente no cambia nada: sigue apagándose igual.' },
        luz: { fue: ['fuente', 'ok'], tmp: ['cpu', 'bad'], ram: ['ram', 'ok'], cam: ['fuente', 'ok'] }, volt: [12.10, 5.00, 3.30] },
      { t: 'Pantalla negra con ventiladores', s: 'Enciende, los ventiladores giran, pero no sale imagen y la placa no pasa el POST.', causa: 'eps', senales: { ps: 5.0, sb: 5.0 },
        pistas: ['Los ventiladores giran: eso demuestra que hay alimentación, pero no que la CPU la reciba.', 'Revisa por separado los conectores que alimentan la placa y los que alimentan la CPU.', 'El conector de 8 pines alimenta la CPU directamente. Si no está asentado del todo, la CPU no recibe +12 V aunque la placa arranque.'],
        discrima: { ids: ['eps'], texto: 'Pantalla negra con ventiladores también encaja con una CPU mal asentada o con una RAM que no arranca. Revisa el conector EPS antes de confirmarlo.' },
        explica: 'El conector EPS de 8 pines está flojo. La CPU no recibe +12 V aunque la placa tenga tensión.',
        reparaciones: [
          { t: 'Desconectar el EPS, revisar los pines y encajarlo hasta oír el clic', ok: true, res: 'Con el EPS encajado del todo, la CPU recibe +12 V y el equipo completa el POST.' },
          { t: 'Cambiar la CPU', ok: false, res: 'Sin comprobar antes el conector de alimentación, cambiar la CPU es una sustitución sin evidencia.' },
          { t: 'Cambiar la placa base', ok: false, res: 'La ATX de 24 pines entrega tensión a la placa y el fallo está en el EPS. Cambiar la placa no lo corrige.' }
        ],
        verificaciones: [
          { t: 'Arrancar y comprobar que la BIOS muestra la CPU y completa el POST', ok: true, res: 'El POST se completa y la BIOS muestra la CPU.' },
          { t: 'Dar la reparación por buena sin arrancar', ok: false, res: 'Encajar el conector no demuestra nada: falta comprobar el arranque.' }
        ],
        explicacion: [
          ['Qué pasa', 'Enciende, los ventiladores giran, pero no sale imagen y la placa no completa el POST.'],
          ['Por qué', 'El conector EPS de 8 pines alimenta la CPU directamente. La ATX de 24 pines alimenta la placa, pero sin EPS la CPU no recibe la tensión que necesita y el arranque no avanza.'],
          ['Qué no puede concluir la observación', 'Que los ventiladores giren demuestra que hay alimentación en la placa, no que la CPU la reciba.'],
          ['Cómo se resuelve', 'Desconecta el EPS, comprueba que no tiene pines doblados y vuelve a encajarlo hasta oír el clic. Después prueba de nuevo.'],
          ['Lección', 'ATX y EPS son conectores distintos. Que los ventiladores giren no demuestra que la CPU tenga alimentación.']
        ],
        fallos: { eps: 'Al presionarlo no hace clic: el conector no está asentado y la CPU no recibe +12 V.' },
        res: { ent: 'El equipo se movió al limpiarlo hace unos días.', vis: 'El cable EPS parece algo suelto. Es un indicio: hay que comprobarlo encajándolo.', fue: 'Los valores de la fuente son correctos.', min: 'Con la configuración mínima sigue sin arrancar. Revisa la alimentación de la CPU.', eps: 'El conector EPS está flojo. Al encajarlo del todo, el equipo arranca.', ram: 'Probar la RAM no cambia el resultado: sigue en negro.', tmp: 'No se puede medir sin POST.', cam: 'Cambiar la fuente no soluciona la pantalla negra.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'bad'], eps: ['cpu', 'bad'], ram: ['ram', 'ok'] }, volt: [11.98, 5.04, 3.32] },
      { t: 'El disco no aparece', s: 'En la BIOS no aparece el disco SATA. El resto del equipo funciona.', causa: 'sata', senales: { ps: 5.0, sb: 5.0 },
        pistas: ['El disco tiene alimentación pero no aparece en la BIOS. ¿Qué más necesita un disco para ser detectado?', 'Revisa por separado el cable de datos y el de alimentación del disco.', 'Los datos van a la placa y la alimentación a la fuente. Si el cable de datos está suelto, el disco puede girar sin ser visible.'],
        discrima: { ids: ['sata'], texto: 'Un cable de datos suelto y un disco averiado dan el mismo síntoma. Revisa el cable de datos antes de confirmarlo.' },
        explica: 'El cable de datos está suelto. El disco tiene alimentación pero no datos.',
        reparaciones: [
          { t: 'Recolocar el cable de datos en el disco y en la placa, y probar otro puerto', ok: true, res: 'Con el cable de datos bien asentado, el disco aparece en la BIOS.' },
          { t: 'Sustituir el disco', ok: false, res: 'Un disco nuevo con el mismo cable tampoco aparecería. Hay que comprobar el cable antes de cambiar el disco.' },
          { t: 'Cambiar el cable de alimentación desde la fuente', ok: false, res: 'La alimentación ya es correcta: la medición da +12 V. Ese cambio no corrige un problema de datos.' }
        ],
        verificaciones: [
          { t: 'Reiniciar, entrar en la BIOS y comprobar que el disco aparece', ok: true, res: 'El disco aparece en la BIOS y en el sistema.' },
          { t: 'Dar la reparación por buena sin mirar la BIOS', ok: false, res: 'Si no se comprueba la detección, no hay verificación.' }
        ],
        explicacion: [
          ['Qué pasa', 'En la BIOS no aparece el disco SATA, pero el resto del equipo funciona con normalidad.'],
          ['Por qué', 'Un disco SATA necesita dos cables independientes: alimentación desde la fuente (conector SATA de 15 pines) y datos desde la placa (cable de 7 pines). El disco puede girar y no tener datos si el cable de datos está suelto.'],
          ['Qué no puede concluir la inspección', 'El cable de datos parece asentado a simple vista, pero una inspección no confirma una conexión: hay que recolocarlo y probarlo.'],
          ['Cómo se resuelve', 'Revisa los dos cables por separado. Recoloca el de datos, prueba otro puerto SATA y, si hace falta, otro cable. Comprueba en la BIOS si el disco aparece.'],
          ['Lección', 'Revisa la alimentación y los datos por separado: un cable de datos suelto no se nota a simple vista.']
        ],
        res: { ent: 'El disco se cayó al mover la caja hace unos días.', vis: 'El cable de alimentación del disco parece bien conectado, y el de datos también. Una inspección no confirma ninguno de los dos.', fue: 'Los raíles están en tolerancia. Eso no prueba que el conector SATA de alimentación esté asentado.', sata: 'El cable de datos está suelto. Al encajarlo, el disco aparece.', min: 'La mínima configuración arranca: el resto del equipo no es el problema.', ram: 'La RAM no tiene nada que ver con un disco que no aparece.', cam: 'Cambiar la fuente no tiene sentido: el resto del equipo funciona.' },
        luz: { fue: ['fuente', 'ok'], sata: ['disco', 'bad'], min: ['cpu', 'ok'], ram: ['ram', 'ok'] }, volt: [12.02, 4.99, 3.29] }
    ]
  }
});
