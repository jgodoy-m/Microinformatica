/* Tema: averías en la placa base.
   Todo el contenido de este tema vive aquí. El motor (js/motor.js) no sabe nada de placas.
   Coordenadas de zonas: en píxeles de la imagen (ancho × alto de foto), formato [x, y, ancho, alto].
   Cada caso sigue el orden: pruebas → diagnóstico (confirmado solo tras las pruebas discriminantes) → reparación → verificación. */
window.TEMAS = window.TEMAS || [];
window.TEMAS.push({
  id: 'placa-base',
  titulo: 'Averías en la placa base',
  resumen: 'Cada partida te asigna cinco avisos al azar entre cuarenta clientes distintos. Diagnostícalos siguiendo el orden de la S12 y localiza cada conector en una placa real.',

  /* Zonas sobre placa-quiz.webp (placa micro-ATX vista desde arriba, fondo transparente).
     n: nombre. d: qué es y qué hay que saber. f: para qué sirve sin decir su nombre (preguntas «Por su función»). */
  mapa: {
    foto: {
      src: 'placa-quiz.webp',
      ancho: 966,
      alto: 928,
      alt: 'Foto cenital de una placa base micro-ATX con el panel de E/S a la izquierda',
      credito: { texto: 'Foto de la placa aportada por el profesor.' }
    },
    zonas: {
      cpu: {
        n: 'Zócalo de CPU (LGA)',
        d: 'Socket del procesador. Comprueba socket y BIOS antes de cambiar la CPU. La tapa de plástico solo se quita al montar el procesador.',
        f: 'Aquí se instala el procesador. Tiene una palanca de retención y cientos de contactos.',
        rects: [[342, 153, 222, 295]]
      },
      vrm: {
        n: 'VRM (etapas de alimentación de la CPU)',
        d: 'Bobinas y transistores que convierten +12 V en la tensión que necesita la CPU. Se calientan: un VRM sin refrigeración limita la CPU.',
        f: 'Bloques cuadrados alrededor del zócalo que convierten los 12 V de la fuente en la tensión baja del procesador.',
        rects: [[320, 68, 160, 60], [225, 148, 80, 225]]
      },
      eps: {
        n: 'EPS 8 pines',
        d: 'Alimenta la CPU con +12 V. Sin él, la placa no pasa el POST.',
        f: 'Conector de alimentación de 12 V dedicado solo al procesador. Sin él, la placa no pasa el POST.',
        rects: [[196, 8, 82, 62]]
      },
      ram: {
        n: 'Slots de RAM (DIMM)',
        d: 'Cuatro ranuras DIMM. Para dual channel, usa las del mismo color o las que indique el manual.',
        f: 'Ranuras largas con pestañas en los extremos donde se instalan los módulos de memoria.',
        rects: [[658, 16, 160, 560]]
      },
      atx: {
        n: 'ATX 24 pines',
        d: 'Alimenta la placa desde la fuente. Tiene clip: no se fuerza.',
        f: 'El conector de alimentación más grande: lleva la energía de la fuente a toda la placa.',
        rects: [[883, 180, 60, 226]]
      },
      cpufan: {
        n: 'CPU_FAN',
        d: 'Cabecera de 4 pines (PWM) para el ventilador del disipador de la CPU. Sin giro, la placa avisa al arrancar.',
        f: 'Cabecera pequeña junto al zócalo, reservada al ventilador del disipador del procesador.',
        rects: [[546, 20, 40, 32]]
      },
      chafan: {
        n: 'Ventilador de caja (SYS_FAN)',
        d: 'Cabecera de 4 pines para un ventilador de la caja. No sustituye al CPU_FAN.',
        f: 'Cabecera de 4 pines para un ventilador que mueve el aire dentro de la caja.',
        rects: [[853, 14, 42, 32]]
      },
      io: {
        n: 'Panel de E/S trasero',
        d: 'Conectores que salen por detrás de la caja: USB, red, vídeo integrado y audio. Se montan con su embellecedor (I/O shield).',
        f: 'Fila de conectores que asoma por la parte trasera de la caja: USB, red y vídeo.',
        rects: [[12, 10, 120, 560]]
      },
      m2: {
        n: 'Ranura M.2',
        d: 'Para SSD NVMe o SATA según la clave del módulo. El tornillo va en el agujero que corresponde a su longitud (2242, 2260 o 2280).',
        f: 'Ranura para un SSD en formato tarjeta, con varios agujeros para fijar módulos de distinta longitud.',
        rects: [[280, 483, 295, 80]]
      },
      pciex16: {
        n: 'Ranuras PCIe x16',
        d: 'Para la tarjeta gráfica. La más cercana a la CPU es la de 16 carriles reales; la otra puede tener menos.',
        f: 'Ranuras largas de expansión donde se instala la tarjeta gráfica.',
        rects: [[196, 566, 392, 52], [196, 790, 375, 50]]
      },
      pciex1: {
        n: 'Ranuras PCIe x1',
        d: 'Ranuras cortas para tarjetas de red, sonido o capturadoras. Una tarjeta x1 también entra en una ranura x16.',
        f: 'Ranuras cortas de expansión para tarjetas pequeñas, como una de red o de sonido.',
        rects: [[196, 648, 85, 42], [196, 720, 108, 42]]
      },
      chipset: {
        n: 'Chipset (bajo el disipador)',
        d: 'Controla SATA, USB y parte de las líneas PCIe. Bajo su disipador: no se desmonta sin necesidad.',
        f: 'Chip bajo un disipador que gestiona los puertos SATA, los USB y parte de las ranuras de expansión.',
        rects: [[638, 646, 176, 168]]
      },
      sata: {
        n: 'Puertos SATA 6 Gb/s',
        d: 'Datos para discos y unidades ópticas. El disco necesita además su cable de alimentación SATA.',
        f: 'Puertos de datos de 7 pines para discos duros, SSD de 2,5" y unidades ópticas.',
        rects: [[903, 456, 42, 155], [882, 666, 76, 182]]
      },
      bateria: {
        n: 'Batería CR2032',
        d: 'Mantiene la hora y la configuración de la BIOS. Si falla, la hora se pierde al apagar.',
        f: 'Pila de botón que conserva la hora y la configuración de la BIOS con el equipo desenchufado.',
        rects: [[330, 633, 95, 92]]
      },
      audio: {
        n: 'Códec de audio',
        d: 'Chip y condensadores de audio: convierten el sonido digital en señal analógica para los jacks traseros y frontales.',
        f: 'Chip junto a unos condensadores dorados que convierte el sonido digital en señal analógica para los jacks.',
        rects: [[46, 648, 90, 175]]
      },
      jaud: {
        n: 'Audio frontal (JAUD)',
        d: 'Cabecera para los jacks de auriculares y micrófono del frontal de la caja. Suele estar en la esquina inferior izquierda.',
        f: 'Cabecera del borde inferior, cerca del chip de sonido, para los jacks de auriculares del frontal.',
        rects: [[94, 876, 62, 36]]
      },
      fpanel: {
        n: 'F_PANEL (panel frontal)',
        d: 'Pulsador de encendido, reset y LED. Solo los LED tienen polaridad. Suele estar en la esquina inferior derecha.',
        f: 'Aquí se conectan el botón de encendido, el reset y los LED de la caja.',
        rects: [[832, 876, 82, 36]]
      }
    }
  },

  /* Simulador. Hay 40 casos; cada partida saca «porRonda» al azar y en orden aleatorio (ver motor.js).
     Los títulos solo nombran al cliente o el lugar: nunca deben dar pistas de la avería. */
  simulador: {
    porRonda: 5,
    lamparas: [['placa', 'Placa base'], ['cpu', 'CPU'], ['fuente', 'Fuente'], ['ram', 'RAM'], ['disco', 'Disco'], ['grafica', 'Gráfica'], ['caja', 'Caja y cableado']],
    causaLampara: {
      fuente: 'fuente', potencia: 'fuente', ram: 'ram', eps: 'cpu', temp: 'cpu', ventcpu: 'cpu', bios: 'placa', pila: 'placa',
      condens: 'placa', sata: 'disco', disco: 'disco', pcie: 'grafica', fpanel: 'caja', corto: 'caja'
    },
    causas: {
      fuente: 'Fuente de alimentación averiada',
      potencia: 'Fuente sin potencia suficiente para la carga',
      ram: 'Módulo de RAM (defectuoso o mal asentado)',
      eps: 'Conector EPS de la CPU sin conectar',
      temp: 'Sobrecalentamiento por suciedad o pasta seca',
      ventcpu: 'Ventilador del disipador mal conectado (CPU_FAN)',
      bios: 'BIOS sin soporte para la CPU instalada',
      pila: 'Pila de la BIOS (CR2032) agotada',
      condens: 'Condensadores de la placa dañados',
      sata: 'Cable de datos SATA suelto',
      disco: 'Disco con sectores dañados',
      pcie: 'Gráfica sin su alimentación PCIe',
      fpanel: 'Cableado del panel frontal (F_PANEL) mal conectado',
      corto: 'Cortocircuito entre la placa y la caja'
    },
    acciones: [
      ['ent', 'Preguntar al cliente', 'Qué pasó antes del fallo y qué se ha tocado.'],
      ['vis', 'Inspección visual', 'Cables, conectores y componentes a simple vista.'],
      ['fue', 'Medir +12 V, +5 V y +3,3 V', 'Lee los raíles y las tensiones de espera.'],
      ['carga', 'Medir +12 V con el equipo en carga', 'Lectura del raíl de 12 V mientras se fuerza la CPU y la gráfica.'],
      ['min', 'Mínima configuración, o fuente sola sin placa', 'Quita lo accesorio y prueba solo lo imprescindible.'],
      ['banco', 'Probar la placa fuera de la caja', 'Placa sobre una superficie aislante, con lo mínimo para arrancar.'],
      ['panel', 'Revisar el panel frontal (F_PANEL)', 'Cables del botón, reset y LED; puenteo de los pines de encendido.'],
      ['tmp', 'Ver temperaturas', 'Temperatura de la CPU bajo carga.'],
      ['fan', 'Revisar las cabeceras de ventiladores', 'Dónde está conectado cada ventilador y si gira.'],
      ['ram', 'Probar la RAM en otro slot', 'Desconecta la RAM y colócala en otro slot de la placa base.'],
      ['reenc', 'Reencajar módulo y repetir prueba', 'Equipo apagado y desenchufado. Vuelve a colocar el módulo y repite el arranque.'],
      ['eps', 'Revisar el conector EPS', 'Comprueba que el conector de 8 pines de la CPU esté bien encajado.'],
      ['bios', 'Comprobar la versión de BIOS', 'Versión instalada y lista de CPU compatibles del fabricante.'],
      ['pila', 'Medir la pila de la BIOS', 'Tensión de la pila de botón CR2032.'],
      ['gpu', 'Revisar la tarjeta gráfica', 'Asentamiento en la ranura y cables de alimentación PCIe.'],
      ['sata', 'Revisar el cable SATA', 'Cable de datos y cable de alimentación del disco.'],
      ['smart', 'Leer el SMART del disco', 'Contadores de salud del disco: sectores reasignados y pendientes.'],
      ['cam', 'Cambiar la fuente por una de prueba', 'Sustitución: sin medir antes cuenta como prematura.']
    ],
    casos: [
      /* 1 · fuente */
      { t: 'La papelería de Rosa', s: 'Rosa usa el ordenador de la papelería como caja registradora. Esta mañana subió la persiana, pulsó el botón como cada día y no pasó nada: ni ventiladores, ni luces, ni pitidos. Tiene clientes esperando y te pide que lo mires antes de que llegue el repartidor.', causa: 'fuente', senales: { ps: 5.0, sb: 0.0 },
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
          ['Por qué', 'La fuente siempre entrega +5 VSB de espera, aunque el equipo esté apagado. Al pulsar el botón, la placa baja la señal PS_ON# y la fuente conecta los raíles principales. Sin +5 VSB no hay nadie que escuche el botón. Una sobretensión por tormenta suele dañar primero la etapa de entrada de la fuente.'],
          ['Qué no puede concluir la medición', '0 V en los tres raíles no distingue una fuente muerta de un cortocircuito en la placa: un corto puede mantener la fuente en protección. Por eso se prueba la fuente sola, sin placa.'],
          ['Cómo se resuelve', 'Mide +5 VSB en el conector ATX (cable morado). Si no hay tensión, prueba la fuente sola (sin placa): si tampoco da tensión, la fuente está averiada y se sustituye. Recomienda una regleta con protección contra sobretensiones.'],
          ['Lección', 'Sin tensión de espera no hay arranque. Mide la fuente antes de tocar la placa.']
        ],
        res: { ent: 'Anoche hubo tormenta y saltaron los plomos del local. El ordenador estaba enchufado directamente a la pared, sin regleta.', vis: 'Nada quemado a simple vista. El cable de red está bien enchufado y el interruptor trasero de la fuente está en «I».', fue: 'Los tres raíles principales están a 0 V y tampoco hay +5 VSB. Eso no distingue una fuente averiada de un corto en la placa: hay que probar la fuente sola.', min: 'Fuente sola, sin placa y con PS_ON# puenteado a masa: sin tensión en los raíles. La fuente es la causa. Si arrancara, el corto estaría en la placa.', carga: 'No se puede medir en carga: el equipo no arranca.', banco: 'Fuera de la caja la placa tampoco da señales: sin fuente funcional no se puede probar.', panel: 'Puenteas los pines de encendido con un destornillador y tampoco arranca: el botón no es el problema.', ram: 'Sin tensión no hay nada que probar en la RAM.', eps: 'Sin tensión, el conector EPS no es el problema.', sata: 'Sin tensión, el disco no es el problema.', tmp: 'No se puede medir: el equipo no arranca.', cam: 'Con una fuente de prueba la placa arranca. La original estaba averiada.' },
        luz: { fue: ['fuente', 'bad'], min: ['fuente', 'bad'], cam: ['fuente', 'ok'] }, volt: [0, 0, 0] },

      /* 2 · ram, con dos escenarios (módulo defectuoso o mal asentado) */
      { t: 'El ordenador de Íñigo', s: 'Íñigo estudia diseño y el lunes entrega un proyecto en 3D. El equipo se le quedaba corto y el fin de semana pasado le hizo un cambio él mismo siguiendo un vídeo. Desde entonces, al encenderlo la pantalla se queda en negro y la placa pita sin parar.', causa: 'ram', senales: { ps: 0.2, sb: 5.1 },
        pistas: ['Los pitidos los genera la propia placa durante el POST: la alimentación llega. ¿Qué se comprueba en los primeros segundos del arranque?', 'Prueba el módulo en otro slot y reencájalo con el equipo apagado. El resultado de cada prueba decide qué hacer.', 'Si el otro módulo arranca en ambos slots y este falla en todos, reencájalo del todo y repite la prueba antes de darlo por malo.'],
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
        res: { ent: 'Compró un segundo módulo de memoria de segunda mano por internet y lo montó junto al que ya tenía. Dice que «entró un poco duro».', vis: 'Los módulos parecen bien encajados a simple vista. Una inspección no confirma el encaje.', fue: 'Los valores de la fuente son correctos.', carga: 'No se puede cargar el equipo: no pasa del POST.', min: 'Con un solo módulo cada vez: con el antiguo arranca; con el nuevo, pita. Hay que separar si es el módulo o su encaje.', ram: 'Con ese módulo no arranca en ningún slot. El otro arranca en ambos.', eps: 'El EPS está bien conectado y la CPU tiene tensión.', gpu: 'La gráfica está bien asentada y su cable conectado. Los pitidos no cambian.', bios: 'La BIOS es reciente y admite la memoria instalada.', tmp: 'No se puede medir bajo carga: el equipo no pasa del POST.', cam: 'Cambiar la fuente no altera los pitidos.' },
        luz: { fue: ['fuente', 'ok'], ram: ['ram', 'bad'], min: ['ram', 'bad'], eps: ['cpu', 'ok'], gpu: ['grafica', 'ok'] }, volt: [12.04, 5.02, 3.31],
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

      /* 3 · temp */
      { t: 'Los directos de Álex', s: 'Álex retransmite partidas por internet tres tardes a la semana. Desde hace un mes, a la media hora de empezar el directo, el ordenador se apaga de golpe, sin pantallazo ni aviso. Al volver a encenderlo arranca con normalidad, y para navegar o ver vídeos funciona perfectamente.', causa: 'temp', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El equipo arranca bien y se apaga solo tras un rato de esfuerzo: piensa en lo que aumenta con la carga y con el tiempo.', 'Hay dos sospechosos que crecen con la carga: el calor y el consumo. Mide uno y otro bajo carga.', 'Si la CPU llega a su límite térmico y el calor sigue subiendo, la protección corta la alimentación sin aviso. Limpiar y revisar la refrigeración es el paso siguiente.'],
        discrima: { ids: ['tmp', 'carga'], texto: 'Un apagado bajo carga puede venir de la temperatura o de una fuente que no da la potencia. Mide la temperatura de la CPU y el raíl de 12 V con el equipo en carga.' },
        explica: 'La CPU llega a su límite térmico y la protección corta. El disipador tiene polvo y la pasta térmica está seca.',
        reparaciones: [
          { t: 'Limpiar el disipador, revisar el ventilador y reaplicar pasta térmica', ok: true, res: 'Tras la limpieza la CPU baja de temperatura bajo carga y el equipo aguanta el directo.' },
          { t: 'Cambiar la fuente por una de más potencia', ok: false, res: 'El raíl de 12 V aguanta bien en carga. Una fuente más grande no baja la temperatura de la CPU.' },
          { t: 'Subir la velocidad del ventilador de caja sin limpiar', ok: false, res: 'Puede ayudar algo, pero no quita el polvo del disipador ni sustituye la pasta seca. El problema vuelve.' }
        ],
        verificaciones: [
          { t: 'Medir la temperatura de la CPU bajo carga durante 30 minutos', ok: true, res: 'La temperatura se mantiene por debajo del límite y el equipo no se apaga.' },
          { t: 'Dar la reparación por buena sin medir', ok: false, res: 'Limpiar no demuestra nada: falta medir la temperatura bajo carga.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo arranca bien y, tras un rato de carga, se apaga de golpe sin aviso.'],
          ['Por qué', 'Al llegar a su temperatura máxima (Tjunction; 100 °C en muchos procesadores de sobremesa), la CPU reduce su velocidad (throttling). Si el calor sigue subiendo, la protección térmica corta la alimentación. El polvo en el disipador y una pasta térmica seca reducen la disipación.'],
          ['Qué no puede concluir la inspección', 'El polvo es un indicio, no una medida: sin temperatura no se sabe si la refrigeración basta. Y un apagado bajo carga también encaja con una fuente justa de potencia.'],
          ['Cómo se resuelve', 'Mide la temperatura bajo carga y el raíl de 12 V. Si la tensión aguanta y la CPU llega al límite, limpia el disipador, revisa el ventilador y reaplica la pasta.'],
          ['Lección', 'Un apagado que se repite bajo carga tiene dos sospechosos: calor y potencia. Mide los dos antes de cambiar piezas.']
        ],
        res: { ent: 'El ordenador tiene cuatro años y nunca se ha abierto. Está en el suelo, debajo del escritorio, junto a una alfombra.', vis: 'Hay una capa de polvo en las aletas del disipador. Es un indicio: falta la temperatura.', fue: 'Los raíles están en tolerancia con el equipo en reposo. Eso no dice nada del comportamiento bajo carga.', carga: '+12 V se mantiene en 11,9 V con la CPU y la gráfica al máximo: la fuente aguanta la carga.', min: 'Sin carga el fallo no aparece: la mínima configuración no lo reproduce.', fan: 'El ventilador del disipador está en CPU_FAN y gira, aunque se oye forzado.', ram: 'La RAM supera el test: no es la causa.', tmp: 'CPU a 100 °C a los 20 minutos de carga, en su límite térmico (lectura simulada). Si el calor sigue subiendo, la protección corta el equipo.', gpu: 'La gráfica está a 74 °C bajo carga: dentro de lo normal.', cam: 'Cambiar la fuente no cambia nada: sigue apagándose igual.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], tmp: ['cpu', 'bad'], ram: ['ram', 'ok'], gpu: ['grafica', 'ok'], cam: ['fuente', 'ok'] }, volt: [12.10, 5.00, 3.30] },

      /* 4 · eps */
      { t: 'La oficina de la calle Mayor', s: 'Una empresa de limpieza hizo el viernes una limpieza a fondo de la oficina de una inmobiliaria y movió los ordenadores para aspirar. El lunes, el equipo de recepción enciende, los ventiladores giran y se oye el disco, pero el monitor dice «Sin señal» y no aparece el logotipo de la placa.', causa: 'eps', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Los ventiladores giran: eso demuestra que hay alimentación, pero no que llegue a todos los componentes.', 'Revisa por separado los conectores que alimentan la placa y los que alimentan la CPU.', 'El conector de 8 pines alimenta la CPU directamente. Si no está asentado del todo, la CPU no recibe +12 V aunque la placa arranque.'],
        discrima: { ids: ['eps'], texto: 'Pantalla negra con ventiladores también encaja con una CPU sin soporte de BIOS, una gráfica sin alimentación o una RAM que no arranca. Revisa el conector EPS antes de confirmarlo.' },
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
          ['Por qué', 'El conector EPS de 8 pines alimenta la CPU directamente. La ATX de 24 pines alimenta la placa, pero sin EPS la CPU no recibe la tensión que necesita y el arranque no avanza. Un tirón del cable al mover la torre basta para soltarlo.'],
          ['Qué no puede concluir la observación', 'Que los ventiladores giren demuestra que hay alimentación en la placa, no que la CPU la reciba.'],
          ['Cómo se resuelve', 'Desconecta el EPS, comprueba que no tiene pines doblados y vuelve a encajarlo hasta oír el clic. Después prueba de nuevo.'],
          ['Lección', 'ATX y EPS son conectores distintos. Que los ventiladores giren no demuestra que la CPU tenga alimentación.']
        ],
        fallos: { eps: 'Al presionarlo no hace clic: el conector no está asentado y la CPU no recibe +12 V.' },
        res: { ent: 'Nadie ha abierto el ordenador. La recepcionista dice que el viernes funcionaba y que la torre estaba tumbada en el suelo cuando llegó.', vis: 'El cable EPS de la esquina superior de la placa parece algo levantado. Es un indicio: hay que comprobarlo encajándolo.', fue: 'Los valores de la fuente son correctos.', carga: 'No se puede cargar el equipo: no pasa del POST.', min: 'Con la configuración mínima sigue sin arrancar: la RAM, la gráfica y el disco no son el problema. Revisa la alimentación de la CPU.', eps: 'El conector EPS está flojo. Al encajarlo del todo, el equipo arranca.', bios: 'La CPU es la de siempre y figura en la lista de compatibles de la versión instalada.', gpu: 'La gráfica está bien asentada y su cable conectado.', ram: 'Probar la RAM no cambia el resultado: sigue en negro.', tmp: 'No se puede medir sin POST.', cam: 'Cambiar la fuente no soluciona la pantalla negra.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'bad'], eps: ['cpu', 'bad'], bios: ['placa', 'ok'], gpu: ['grafica', 'ok'], ram: ['ram', 'ok'] }, volt: [11.98, 5.04, 3.32] },

      /* 5 · sata */
      { t: 'La mudanza de Carmen', s: 'Carmen se ha mudado de piso y ha llevado la torre en el maletero del coche, envuelta en una manta. Al montarla en la casa nueva, el ordenador enciende pero se queda en una pantalla que dice «No bootable device». Tiene ahí las fotos de la familia y está muy preocupada.', causa: 'sata', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El equipo pasa el POST: la placa, la CPU y la RAM funcionan. El problema está en lo que tiene que cargar el sistema.', 'Entra en la BIOS y mira qué unidades detecta. Un disco necesita dos cables para funcionar.', 'Los datos van a la placa y la alimentación a la fuente. Si el cable de datos está suelto, el disco puede girar sin ser visible.'],
        discrima: { ids: ['sata'], texto: 'Un cable de datos suelto y un disco averiado dan el mismo síntoma. Revisa el cable de datos antes de confirmarlo.' },
        explica: 'El cable de datos está suelto. El disco tiene alimentación pero no datos.',
        reparaciones: [
          { t: 'Recolocar el cable de datos en el disco y en la placa, y probar otro puerto', ok: true, res: 'Con el cable de datos bien asentado, el disco aparece en la BIOS.' },
          { t: 'Sustituir el disco', ok: false, res: 'Un disco nuevo con el mismo cable tampoco aparecería, y Carmen perdería sus fotos. Hay que comprobar el cable antes.' },
          { t: 'Cambiar el cable de alimentación desde la fuente', ok: false, res: 'La alimentación ya es correcta: el disco gira. Ese cambio no corrige un problema de datos.' }
        ],
        verificaciones: [
          { t: 'Reiniciar, entrar en la BIOS y comprobar que el disco aparece y arranca el sistema', ok: true, res: 'El disco aparece en la BIOS y el sistema arranca con las fotos intactas.' },
          { t: 'Dar la reparación por buena sin mirar la BIOS', ok: false, res: 'Si no se comprueba la detección, no hay verificación.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo pasa el POST pero no encuentra desde dónde arrancar: la BIOS no ve el disco SATA.'],
          ['Por qué', 'Un disco SATA necesita dos cables independientes: alimentación desde la fuente (conector SATA de 15 pines) y datos desde la placa (cable de 7 pines). El disco puede girar y no tener datos si el cable de datos se ha soltado con las vibraciones.'],
          ['Qué no puede concluir la inspección', 'El cable de datos parece asentado a simple vista, pero una inspección no confirma una conexión: hay que recolocarlo y probarlo.'],
          ['Cómo se resuelve', 'Revisa los dos cables por separado. Recoloca el de datos, prueba otro puerto SATA y, si hace falta, otro cable. Comprueba en la BIOS si el disco aparece.'],
          ['Lección', 'Revisa la alimentación y los datos por separado: un cable de datos suelto no se nota a simple vista.']
        ],
        res: { ent: 'Antes de la mudanza funcionaba bien. En el coche la torre iba de lado y hubo bastantes baches.', vis: 'El cable de alimentación del disco parece bien conectado, y el de datos también. Una inspección no confirma ninguno de los dos.', fue: 'Los raíles están en tolerancia. Eso no prueba que el disco reciba datos.', sata: 'El cable de datos está medio fuera del puerto de la placa. Al encajarlo, el disco aparece.', smart: 'No se puede leer el SMART: la BIOS no ve el disco.', min: 'La mínima configuración pasa el POST: la placa, la CPU y la RAM no son el problema.', ram: 'La RAM no tiene nada que ver con un disco que no aparece.', bios: 'La BIOS está bien, pero en la lista de unidades no aparece ningún disco.', cam: 'Cambiar la fuente no tiene sentido: el resto del equipo funciona.' },
        luz: { fue: ['fuente', 'ok'], sata: ['disco', 'bad'], min: ['cpu', 'ok'], ram: ['ram', 'ok'] }, volt: [12.02, 4.99, 3.29] },

      /* 6 · pila */
      { t: 'Asesoría Pardo', s: 'En la Asesoría Pardo, cada lunes el ordenador de la jefa arranca con un mensaje en inglés en la pantalla y pide pulsar F1 para continuar. Cuando entra en Windows, la fecha está mal y algunos programas de facturación protestan por el certificado. El resto de la semana va perfecto.', causa: 'pila', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El fallo solo aparece después del fin de semana. ¿Qué pasa con el equipo entre el viernes y el lunes?', 'La placa guarda la hora y los ajustes en una memoria que necesita energía aunque el equipo esté desenchufado.', 'Si esa energía viene de una pila de botón y la pila está gastada, al quitar la corriente se pierde la configuración.'],
        discrima: { ids: ['pila'], texto: 'La hora y la configuración también se pierden si alguien ha movido el jumper de borrado de la BIOS. Mide la pila antes de confirmarlo.' },
        explica: 'La pila CR2032 está gastada. Sin corriente, la placa pierde la hora y la configuración de la BIOS.',
        reparaciones: [
          { t: 'Cambiar la pila CR2032 y volver a configurar la fecha y la BIOS', ok: true, res: 'Con la pila nueva la placa conserva la hora y los ajustes.' },
          { t: 'Actualizar la BIOS a la última versión', ok: false, res: 'Una BIOS nueva no da energía a la memoria de configuración: con la pila gastada, el lunes volverá a pasar.' },
          { t: 'Cambiar la placa base', ok: false, res: 'La placa funciona: lo que se agota es una pila de un par de euros.' }
        ],
        verificaciones: [
          { t: 'Dejar el equipo desenchufado varias horas y comprobar la hora al arrancar', ok: true, res: 'Tras horas sin corriente el equipo arranca sin aviso y con la hora correcta.' },
          { t: 'Reiniciar sin desenchufar y dar el caso por cerrado', ok: false, res: 'Con el equipo enchufado la fuente alimenta la memoria de la BIOS: así no se prueba la pila.' }
        ],
        explicacion: [
          ['Qué pasa', 'Al arrancar tras un fin de semana sin corriente, la BIOS avisa de un error de configuración (CMOS checksum error) y la hora está mal.'],
          ['Por qué', 'Con el equipo enchufado, la fuente mantiene la hora y la configuración con +5 VSB. Sin corriente, solo la pila CR2032 las conserva. Una pila nueva da unos 3 V; por debajo de unos 2,5 V deja de bastar.'],
          ['Qué no puede concluir la observación', 'Que la hora salga mal no demuestra que la pila esté gastada: un jumper de borrado (CLR_CMOS) mal puesto produce lo mismo. La medición lo confirma.'],
          ['Cómo se resuelve', 'Con el equipo desenchufado, mide la pila. Si está baja, cámbiala por otra CR2032, ajusta fecha, hora y orden de arranque en la BIOS y guarda.'],
          ['Lección', 'Un fallo que solo aparece tras días sin corriente apunta a lo que guarda datos sin corriente: la pila de la BIOS.']
        ],
        fallos: { pila: 'La pila marca 2,1 V con el equipo desenchufado: está agotada.' },
        res: { ent: 'Los viernes, al salir, apagan la regleta general de la oficina para ahorrar. Las primeras semanas no pasaba. El ordenador tiene ocho años.', vis: 'La placa está limpia y no se ve nada raro. La pila está en su sitio.', fue: 'Los raíles están en tolerancia y +5 VSB está presente.', min: 'En mínima configuración arranca igual, con el mismo aviso.', ram: 'La RAM supera el test: no es la causa.', bios: 'La BIOS es antigua pero estable. Al entrar, todos los ajustes están en sus valores de fábrica.', pila: 'La pila marca 2,1 V con el equipo desenchufado: está agotada.', sata: 'El disco se detecta bien y arranca Windows.', smart: 'El disco está sano.', tmp: 'Temperaturas normales.', cam: 'Cambiar la fuente no cambia nada: el lunes siguiente vuelve a pasar.' },
        luz: { fue: ['fuente', 'ok'], pila: ['placa', 'bad'], ram: ['ram', 'ok'], sata: ['disco', 'ok'], smart: ['disco', 'ok'], tmp: ['cpu', 'ok'] }, volt: [12.01, 5.03, 3.30] },

      /* 7 · pcie */
      { t: 'El regalo de Celia', s: 'A Celia le han regalado por su cumpleaños una pieza nueva para el ordenador y su tío se la montó el domingo. Desde entonces, al encender, la torre se ilumina y los ventiladores giran, pero el monitor se queda en «Sin señal». Celia jura que no ha tocado nada más.', causa: 'pcie', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Si lo último que cambió fue el regalo, empieza por lo que el regalo necesita para funcionar.', 'Algunas tarjetas no se conforman con la energía de la ranura: necesitan cables propios desde la fuente.', 'Mira la gráfica de cerca: sus ventiladores, sus conectores de 6 u 8 pines y la pestaña de la ranura.'],
        discrima: { ids: ['gpu'], texto: 'Pantalla negra con ventiladores también encaja con una CPU sin alimentación EPS o una RAM que no arranca. Revisa la gráfica y sus cables antes de confirmarlo.' },
        explica: 'La tarjeta gráfica nueva no tiene conectado su cable de alimentación PCIe de 8 pines.',
        reparaciones: [
          { t: 'Conectar el cable PCIe de 8 pines de la fuente a la gráfica', ok: true, res: 'Con su alimentación conectada, la gráfica inicializa y da imagen.' },
          { t: 'Devolver la gráfica por defectuosa', ok: false, res: 'La gráfica no se ha probado con su alimentación: devolverla sin eso no tiene justificación.' },
          { t: 'Conectar el monitor a la salida de vídeo de la placa', ok: false, res: 'Esa CPU no tiene gráficos integrados y, aunque los tuviera, la gráfica seguiría sin funcionar.' }
        ],
        verificaciones: [
          { t: 'Arrancar, comprobar imagen y que el sistema reconoce la gráfica', ok: true, res: 'Sale imagen y el sistema reconoce la gráfica nueva.' },
          { t: 'Ver que los ventiladores de la gráfica giran y darlo por bueno', ok: false, res: 'Que giren no demuestra que dé imagen: falta arrancar y comprobarlo.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo enciende pero no da imagen después de instalar una gráfica nueva.'],
          ['Por qué', 'La ranura PCIe x16 entrega como máximo 75 W. Las gráficas que consumen más llevan conectores de 6 u 8 pines que se alimentan directamente de la fuente. Sin ellos la tarjeta no inicializa y muchas placas encienden un LED «VGA».'],
          ['Qué no puede concluir la observación', 'Que la torre se ilumine y los ventiladores giren no dice nada de la gráfica: hay que mirar sus conectores.'],
          ['Cómo se resuelve', 'Apaga, conecta el cable PCIe de la fuente (no un adaptador improvisado) al conector de la gráfica y comprueba que la tarjeta está bien sujeta en la ranura.'],
          ['Lección', 'Después de montar una pieza, el primer sospechoso es esa pieza y todo lo que necesita: cables, ranura y alimentación.']
        ],
        fallos: { gpu: 'La gráfica está bien encajada, pero su conector de 8 pines está vacío. El cable PCIe de la fuente cuelga suelto.' },
        res: { ent: 'El regalo es una tarjeta gráfica bastante potente. El tío de Celia dice que «encajó a la primera» y que le sobró un cable.', vis: 'Hay un cable de la fuente sin conectar junto a la gráfica. Es un indicio: hay que comprobar a dónde va.', fue: 'Los valores de la fuente son correctos.', carga: 'No se puede cargar el equipo: no hay imagen.', min: 'Sin la gráfica no hay salida de vídeo: esta CPU no tiene gráficos integrados. La placa sí pasa el POST sin ella.', eps: 'El EPS está bien conectado y la CPU tiene tensión.', ram: 'La RAM está bien asentada y no cambia el resultado.', gpu: 'La gráfica está bien encajada, pero su conector de 8 pines está vacío. El cable PCIe de la fuente cuelga suelto.', bios: 'La CPU figura en la lista de compatibles de la BIOS instalada.', tmp: 'No se puede medir sin imagen.', cam: 'Con otra fuente sigue igual: el problema no es la fuente.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'ok'], eps: ['cpu', 'ok'], ram: ['ram', 'ok'], gpu: ['grafica', 'bad'], bios: ['placa', 'ok'] }, volt: [12.05, 5.01, 3.31] },

      /* 8 · fpanel */
      { t: 'El equipo de Marcos', s: 'Marcos ha pasado su ordenador a una torre más bonita, con cristal y luces. Lo ha cableado todo él y está orgulloso del resultado, pero al pulsar el botón de encendido no ocurre absolutamente nada. Curiosamente, un pequeño LED de la placa sí está encendido.', causa: 'fpanel', senales: { ps: 5.0, sb: 5.0 },
        pistas: ['Si la placa tiene un LED encendido, ya le llega energía de la fuente. ¿Le llega la orden de encender?', 'Entre el botón de la caja y la placa hay varios cables pequeños, cada uno a un par de pines concreto.', 'Puentea con cuidado los dos pines de encendido (PWR_SW) del F_PANEL. Si arranca así, el problema está en cómo llega el botón.'],
        discrima: { ids: ['fue', 'panel'], texto: 'Un equipo que no hace nada también encaja con una fuente muerta. Comprueba que la fuente da +5 VSB y revisa el panel frontal antes de confirmarlo.' },
        explica: 'El cable del botón de encendido está en los pines de reset del F_PANEL: la orden de arranque nunca llega a la placa.',
        reparaciones: [
          { t: 'Conectar cada cable del panel frontal en sus pines según el manual', ok: true, res: 'Con el botón en PWR_SW, el equipo arranca al pulsarlo.' },
          { t: 'Cambiar la fuente', ok: false, res: 'La fuente da +5 VSB y arranca al puentear los pines: no es la causa.' },
          { t: 'Volver a la caja antigua', ok: false, res: 'Así se esquiva el problema sin entenderlo: el cableado de la caja nueva sigue mal.' }
        ],
        verificaciones: [
          { t: 'Probar el botón de encendido, el de reset y los LED de la caja', ok: true, res: 'El botón enciende, el reset reinicia y los LED de encendido y disco funcionan.' },
          { t: 'Dejarlo arrancado con el puente del destornillador', ok: false, res: 'El puente solo era una prueba: el botón de la caja sigue sin funcionar.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo no responde al botón, aunque la placa tiene energía.'],
          ['Por qué', 'El botón de la caja solo cierra un contacto entre los dos pines PWR_SW del F_PANEL. La placa, alimentada por +5 VSB, detecta ese contacto y baja PS_ON# para que la fuente arranque. Si el cable está en otros pines, el contacto nunca llega.'],
          ['Qué no puede concluir la observación', 'Que no haga nada no significa que la fuente esté muerta: el LED de la placa y +5 VSB demuestran que la fuente está en espera.'],
          ['Cómo se resuelve', 'Mide +5 VSB y puentea PWR_SW: si arranca, recoloca los cables del panel frontal siguiendo el esquema del manual. Solo los LED tienen polaridad.'],
          ['Lección', 'Antes de culpar a una pieza, comprueba lo que has cambiado tú. Un botón es solo un interruptor: puentearlo lo prueba en un segundo.']
        ],
        fallos: { panel: 'El cable «POWER SW» está en los pines de RESET. Al puentear los pines PWR_SW con un destornillador, el equipo arranca.' },
        res: { ent: 'Ha cambiado de caja él mismo. En la caja antigua funcionaba. Dice que los cablecitos del frontal «eran todos iguales».', vis: 'Hay varios cables finos conectados en la esquina inferior de la placa. A simple vista no se sabe cuál va a dónde.', fue: 'Con el equipo apagado: +5 VSB presente y PS_ON# en alto. La fuente está en espera, pero nadie le da la orden de arrancar.', min: 'En mínima configuración tampoco responde al botón.', banco: 'Fuera de la caja, puenteando los pines de encendido, la placa arranca.', panel: 'El cable «POWER SW» está en los pines de RESET. Al puentear los pines PWR_SW con un destornillador, el equipo arranca.', ram: 'No se puede probar la RAM: el equipo no arranca.', eps: 'El EPS está bien conectado.', tmp: 'No se puede medir: el equipo no arranca.', cam: 'Con otra fuente pasa exactamente lo mismo.' },
        luz: { fue: ['fuente', 'ok'], banco: ['placa', 'ok'], panel: ['caja', 'bad'], cam: ['fuente', 'ok'] }, volt: [0, 0, 0] },

      /* 9 · corto */
      { t: 'El primer montaje de Sara', s: 'Sara ha montado su primer ordenador pieza a pieza con lo que ha ahorrado del verano. Al pulsar el botón, los ventiladores dan medio giro, se encienden las luces un instante y todo se apaga. Si lo vuelve a intentar, pasa lo mismo.', causa: 'corto', senales: { ps: 5.0, sb: 5.0 },
        pistas: ['La fuente arranca un instante y se corta: eso parece una protección actuando, no una fuente muerta.', 'Separa la fuente del resto: si funciona sola, el problema está en lo que tiene conectado.', 'Prueba la placa fuera de la caja. Si así arranca, algo de la caja está tocando la placa donde no debe.'],
        discrima: { ids: ['min', 'banco'], texto: 'Un arranque que se corta al instante puede ser la fuente o algo en corto. Prueba la fuente sola y luego la placa fuera de la caja antes de confirmarlo.' },
        explica: 'Un separador de más en la caja toca una pista de la placa y provoca un cortocircuito: la fuente entra en protección.',
        reparaciones: [
          { t: 'Quitar el separador sobrante y montar solo los que coinciden con los agujeros de la placa', ok: true, res: 'Sin el separador sobrante, la placa arranca dentro de la caja.' },
          { t: 'Cambiar la fuente', ok: false, res: 'La fuente sola funciona perfectamente: está protegiéndose de un corto, no averiada.' },
          { t: 'Devolver la placa base', ok: false, res: 'La placa arranca fuera de la caja: no está averiada.' }
        ],
        verificaciones: [
          { t: 'Arrancar con la placa en la caja y medir los raíles', ok: true, res: 'Arranca de forma estable y los raíles están en tolerancia.' },
          { t: 'Dejar la placa fuera de la caja funcionando', ok: false, res: 'Fuera de la caja no se ha comprobado la corrección: el montaje sigue sin terminar.' }
        ],
        explicacion: [
          ['Qué pasa', 'Al pulsar el botón todo arranca un instante y se apaga: la fuente detecta un cortocircuito y se protege.'],
          ['Por qué', 'La placa se atornilla sobre separadores metálicos (standoffs) que la mantienen a unos milímetros de la chapa. Un separador colocado donde la placa no tiene agujero toca las pistas del dorso y las pone a masa. La fuente detecta el exceso de corriente y corta (protección SCP).'],
          ['Qué no puede concluir la medición', 'Que los raíles queden a 0 V tras el intento no demuestra que la fuente esté mal: una fuente en protección también da 0 V.'],
          ['Cómo se resuelve', 'Prueba la fuente sola y la placa fuera de la caja sobre una superficie aislante (la caja de la placa). Si fuera arranca, revisa los separadores: solo debe haber uno bajo cada agujero de la placa.'],
          ['Lección', 'Una fuente que arranca y se corta suele estar protegiéndose. Busca el corto antes de cambiar la fuente.']
        ],
        fallos: { banco: 'Fuera de la caja, sobre la caja de cartón de la placa, el equipo arranca sin problemas. Dentro de la caja, no.' },
        res: { ent: 'Puso todos los separadores que venían en la bolsa de la caja «por si acaso». Le sobró un tornillo.', vis: 'Desde arriba no se ve nada raro: lo que hay debajo de la placa no se ve sin sacarla.', fue: 'Tras el intento los raíles están a 0 V. +5 VSB está presente: la fuente está en protección o averiada. Hay que separarla de la placa.', carga: 'No se puede medir en carga: el equipo no se mantiene encendido.', min: 'Fuente sola, sin placa y con PS_ON# puenteado a masa: arranca y da +12 V, +5 V y +3,3 V en tolerancia. La fuente funciona.', banco: 'Fuera de la caja, sobre la caja de cartón de la placa, el equipo arranca sin problemas. Dentro de la caja, no.', panel: 'El cableado del panel frontal es correcto: el botón llega a la placa.', ram: 'No se puede probar la RAM: el equipo no se mantiene encendido.', eps: 'El EPS está bien conectado.', tmp: 'No se puede medir: el equipo no se mantiene encendido.', cam: 'Con otra fuente pasa exactamente lo mismo: medio giro y se apaga.' },
        luz: { fue: ['fuente', 'bad'], min: ['fuente', 'ok'], banco: ['caja', 'bad'], panel: ['caja', 'ok'], cam: ['fuente', 'ok'] }, volt: [0, 0, 0] },

      /* 10 · ventcpu */
      { t: 'El estudio de Nerea', s: 'Nerea edita vídeos de bodas. Hace unos días le cambiaron el disipador de la CPU por uno más grande y silencioso. Ahora, al arrancar, la pantalla se detiene con un aviso y tiene que pulsar F1. Además, al exportar un vídeo largo, el equipo va cada vez más lento hasta que se apaga.', causa: 'ventcpu', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El aviso del arranque y el apagado al exportar empezaron a la vez, justo después de un cambio en la refrigeración.', 'Comprueba que el ventilador del disipador gira y en qué cabecera de la placa está conectado.', 'La placa vigila las RPM de la cabecera CPU_FAN. Si allí no hay nada, avisa al arrancar y no sabe regular el ventilador.'],
        discrima: { ids: ['tmp', 'fan'], texto: 'Un apagado por calor también lo produce un disipador sucio o una pasta seca. Mira las temperaturas y revisa a qué cabecera va el ventilador antes de confirmarlo.' },
        explica: 'El ventilador del disipador está conectado a una cabecera de caja (SYS_FAN) en vez de a CPU_FAN: la placa no lo regula y avisa en cada arranque.',
        reparaciones: [
          { t: 'Conectar el ventilador del disipador a CPU_FAN y revisar la curva en la BIOS', ok: true, res: 'Con el ventilador en CPU_FAN, la placa lo acelera con la temperatura y desaparece el aviso.' },
          { t: 'Desactivar el aviso de ventilador en la BIOS', ok: false, res: 'Se oculta el síntoma pero el ventilador sigue sin regularse: el equipo se seguirá calentando.' },
          { t: 'Volver a poner el disipador antiguo', ok: false, res: 'El disipador nuevo es mejor. El problema es dónde está conectado su ventilador.' }
        ],
        verificaciones: [
          { t: 'Arrancar sin aviso y exportar un vídeo largo midiendo la temperatura', ok: true, res: 'No hay aviso al arrancar y la CPU se mantiene por debajo de 80 °C durante toda la exportación.' },
          { t: 'Comprobar que el ventilador gira y darlo por bueno', ok: false, res: 'Ya giraba antes. Falta comprobar el aviso y la temperatura bajo carga.' }
        ],
        explicacion: [
          ['Qué pasa', 'La placa avisa al arrancar (CPU Fan Error) y la CPU se sobrecalienta bajo carga.'],
          ['Por qué', 'La cabecera CPU_FAN es la que la placa vigila para el procesador: lee sus RPM y ajusta su velocidad (PWM) según la temperatura de la CPU. Conectado en SYS_FAN, el ventilador gira lento a una velocidad fija y la placa cree que la CPU no tiene refrigeración.'],
          ['Qué no puede concluir la observación', 'Que el ventilador gire no demuestra que esté bien conectado: puede girar en otra cabecera sin que la placa lo controle.'],
          ['Cómo se resuelve', 'Conecta el ventilador del disipador a CPU_FAN (o CPU_OPT si hay dos), revisa en la BIOS que lee sus RPM y que la curva sube con la temperatura.'],
          ['Lección', 'Un aviso de la BIOS es información, no una molestia: antes de desactivarlo, busca por qué aparece.']
        ],
        fallos: { fan: 'El ventilador del disipador está en SYS_FAN2. CPU_FAN está vacía: la placa lee 0 RPM.' },
        res: { ent: 'El técnico que le cambió el disipador tenía prisa. El aviso apareció desde el primer día, pero Nerea pulsa F1 y sigue trabajando.', vis: 'El disipador está limpio, bien montado y su ventilador gira. Es una buena señal, pero no dice dónde está conectado.', fue: 'Los raíles están en tolerancia.', carga: '+12 V se mantiene en 11,9 V bajo carga: la fuente aguanta.', min: 'En mínima configuración el aviso sigue apareciendo al arrancar.', tmp: 'La CPU llega a 98 °C a los diez minutos de exportar y baja su frecuencia (lectura simulada).', fan: 'El ventilador del disipador está en SYS_FAN2. CPU_FAN está vacía: la placa lee 0 RPM.', ram: 'La RAM supera el test: no es la causa.', bios: 'La BIOS está actualizada. En el monitor de hardware, CPU_FAN marca 0 RPM.', gpu: 'La gráfica trabaja a temperatura normal.', cam: 'Cambiar la fuente no cambia nada: el aviso y los apagados siguen.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], tmp: ['cpu', 'bad'], fan: ['cpu', 'bad'], ram: ['ram', 'ok'], gpu: ['grafica', 'ok'], bios: ['placa', 'ok'] }, volt: [12.03, 5.02, 3.30] },

      /* 11 · disco */
      { t: 'La consulta de la doctora Vidal', s: 'La doctora Vidal tiene una consulta de fisioterapia. Desde hace dos semanas, el ordenador donde guarda las fichas de los pacientes tarda muchísimo en arrancar, se queda congelado al abrir algunos archivos y a veces se oye un «tac, tac» que antes no estaba. Hoy un documento no se ha podido abrir.', causa: 'disco', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El equipo arranca y la BIOS ve todo: el problema aparece al leer datos concretos.', 'Antes de tocar nada, piensa en lo que más importa a la doctora: las fichas de sus pacientes.', 'Los discos llevan un registro de su propia salud (SMART). Los sectores reasignados y pendientes indican una superficie dañada.'],
        discrima: { ids: ['sata', 'smart'], texto: 'Bloqueos al leer también los provoca un cable SATA en mal estado. Revisa el cable y lee el SMART antes de confirmarlo.' },
        explica: 'El disco tiene sectores dañados y cada vez más. Hay que salvar los datos antes de que falle del todo.',
        reparaciones: [
          { t: 'Copiar los datos cuanto antes y sustituir el disco por uno nuevo', ok: true, res: 'Con los datos copiados en el disco nuevo, el equipo va fluido y las fichas se abren.' },
          { t: 'Formatear el disco y reinstalar Windows', ok: false, res: 'Formatear no arregla una superficie dañada y borra las fichas de los pacientes.' },
          { t: 'Desfragmentar el disco para que vaya más rápido', ok: false, res: 'Desfragmentar obliga al disco a leer y escribir sin parar: con sectores dañados, acelera su fallo.' }
        ],
        verificaciones: [
          { t: 'Leer el SMART del disco nuevo y abrir varias fichas', ok: true, res: 'El disco nuevo no tiene sectores reasignados y todas las fichas se abren.' },
          { t: 'Ver que Windows arranca y darlo por bueno', ok: false, res: 'Que arranque no demuestra que los datos estén completos ni que el disco nuevo esté sano.' }
        ],
        explicacion: [
          ['Qué pasa', 'Lentitud, bloqueos al abrir archivos y ruidos: el disco no consigue leer algunos sectores a la primera.'],
          ['Por qué', 'Cuando un sector falla, el disco reintenta la lectura muchas veces (de ahí la lentitud) y, si lo consigue, lo reasigna a una zona de reserva. El SMART cuenta esos sectores reasignados y los pendientes. Si crecen, el disco se está degradando.'],
          ['Qué no puede concluir la observación', 'La lentitud y los bloqueos también los produce un cable SATA defectuoso o un sistema saturado. El SMART es lo que demuestra el daño físico.'],
          ['Cómo se resuelve', 'Revisa el cable, lee el SMART y, si hay sectores dañados, copia los datos lo primero, sin someter al disco a esfuerzos. Después sustituye el disco.'],
          ['Lección', 'Con un disco que falla, los datos van primero. Nada de formatear ni desfragmentar antes de tener una copia.']
        ],
        fallos: { smart: 'SMART: 412 sectores reasignados y 37 pendientes, y subiendo. La superficie del disco está dañándose.' },
        res: { ent: 'No tienen copia de seguridad. El equipo está encendido todo el día y alguna vez se le ha caído la mochila encima a la torre.', vis: 'Nada raro a simple vista. El disco es mecánico, de 3,5".', fue: 'Los raíles están en tolerancia.', carga: '+12 V se mantiene estable con carga: la fuente no es el problema.', min: 'En mínima configuración el disco sigue igual de lento al leer.', ram: 'La RAM supera el test: no es la causa.', sata: 'Los dos cables del disco están bien asentados. Con otro cable de datos, el disco sigue igual de lento.', smart: 'SMART: 412 sectores reasignados y 37 pendientes, y subiendo. La superficie del disco está dañándose.', tmp: 'Temperaturas normales.', bios: 'La BIOS detecta el disco sin problemas.', cam: 'Cambiar la fuente no cambia nada: el disco sigue igual.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], sata: ['disco', 'ok'], smart: ['disco', 'bad'], ram: ['ram', 'ok'], tmp: ['cpu', 'ok'] }, volt: [12.00, 5.01, 3.29] },

      /* 12 · bios */
      { t: 'El encargo de Javier', s: 'Javier tiene un pequeño taller de reparación de móviles y quiso dar más vida a su ordenador. Compró un procesador de la última generación que, según la tienda, «usa el mismo zócalo». Lo montó con cuidado, con pasta térmica nueva. Ahora el equipo enciende, los ventiladores giran, pero no hay imagen.', causa: 'bios', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Que el procesador encaje en el zócalo no garantiza que la placa sepa trabajar con él.', 'Busca en la web del fabricante la lista de procesadores compatibles con la placa y desde qué versión de BIOS.', 'Muchas placas tienen un LED de CPU encendido cuando no pueden inicializar el procesador. La solución pasa por el firmware.'],
        discrima: { ids: ['eps', 'bios'], texto: 'Pantalla negra tras tocar la CPU también encaja con un EPS que se ha soltado durante el montaje. Revisa el EPS y la versión de BIOS antes de confirmarlo.' },
        explica: 'La BIOS instalada es anterior al procesador nuevo: no sabe inicializarlo aunque encaje en el zócalo.',
        reparaciones: [
          { t: 'Actualizar la BIOS (con la CPU antigua o con BIOS Flashback) y volver a montar la nueva', ok: true, res: 'Con la BIOS actualizada, la placa reconoce el procesador nuevo y arranca.' },
          { t: 'Devolver el procesador por defectuoso', ok: false, res: 'El procesador no se ha probado con una BIOS que lo soporte: devolverlo no está justificado.' },
          { t: 'Cambiar la pasta térmica otra vez', ok: false, res: 'La pasta afecta a la temperatura, no a que la placa reconozca el procesador.' }
        ],
        verificaciones: [
          { t: 'Arrancar, comprobar que la BIOS muestra el nuevo procesador y hacer una prueba de carga', ok: true, res: 'La BIOS muestra el procesador nuevo y el equipo es estable en carga.' },
          { t: 'Ver que se ha actualizado la BIOS y darlo por bueno', ok: false, res: 'Actualizar no demuestra nada si no se arranca con el procesador nuevo.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras cambiar el procesador por uno más moderno, el equipo enciende pero no pasa el POST.'],
          ['Por qué', 'La BIOS contiene el microcódigo y los parámetros para inicializar cada procesador. Un modelo posterior a la BIOS instalada no está en esa lista, aunque use el mismo zócalo. Muchas placas encienden su LED de CPU en ese caso.'],
          ['Qué no puede concluir la observación', 'Que el procesador encaje en el zócalo no demuestra que sea compatible. Y que no arranque tampoco demuestra que esté averiado.'],
          ['Cómo se resuelve', 'Consulta la lista de CPU compatibles. Si hace falta una BIOS más nueva, actualízala con la CPU antigua montada o con la función BIOS Flashback desde un USB, y después monta la nueva.'],
          ['Lección', 'Mismo zócalo no significa compatible. Antes de cambiar un procesador, comprueba la lista de CPU de la placa y su versión de BIOS.']
        ],
        fallos: { bios: 'La placa tiene la BIOS de hace tres años. Según el fabricante, este procesador necesita una versión posterior.' },
        res: { ent: 'Hizo el cambio él mismo hace dos días. Con el procesador antiguo todo iba bien. Conserva el procesador antiguo en su caja.', vis: 'El disipador está bien montado y la pasta, bien aplicada. En la placa hay un LED rojo junto a la palabra «CPU».', fue: 'Los valores de la fuente son correctos.', carga: 'No se puede cargar el equipo: no pasa del POST.', min: 'Con la configuración mínima sigue sin imagen y con el LED de CPU encendido.', eps: 'El EPS está bien encajado: la CPU recibe +12 V.', bios: 'La placa tiene la BIOS de hace tres años. Según el fabricante, este procesador necesita una versión posterior.', gpu: 'La gráfica está bien asentada y su cable conectado.', ram: 'Probar la RAM en otro slot no cambia nada.', tmp: 'No se puede medir sin POST.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'bad'], eps: ['cpu', 'ok'], bios: ['placa', 'bad'], gpu: ['grafica', 'ok'], ram: ['ram', 'ok'] }, volt: [12.02, 5.03, 3.31] },

      /* 13 · condens */
      { t: 'El almacén de Recambios Ortiz', s: 'En el almacén de una tienda de recambios de coche, el ordenador que gestiona los pedidos se reinicia solo varias veces al día, sin avisar, aunque nadie lo esté usando. Al principio pasaba una vez por semana; ahora, cada pocas horas. El ordenador tiene más de diez años y vive en una nave donde en verano hace mucho calor.', causa: 'condens', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Los reinicios no dependen de la carga: ocurren incluso en reposo. Eso aleja la temperatura de la CPU y la potencia.', 'Mide la fuente y luego observa con atención la placa, sobre todo alrededor del procesador.', 'Los condensadores electrolíticos se degradan con los años y el calor: su parte superior debe ser plana, no abombada.'],
        discrima: { ids: ['fue', 'vis'], texto: 'Reinicios aleatorios también los provoca una fuente con tensiones inestables. Mide la fuente e inspecciona la placa antes de confirmarlo.' },
        explica: 'Varios condensadores junto al VRM están hinchados y han perdido capacidad: la tensión de la CPU no es estable y el equipo se reinicia.',
        reparaciones: [
          { t: 'Sustituir la placa base por una compatible (o repararla en un servicio de electrónica)', ok: true, res: 'Con la placa nueva el equipo funciona días seguidos sin reiniciarse.' },
          { t: 'Cambiar la fuente', ok: false, res: 'La fuente da tensiones estables. El fallo está en los condensadores de la placa.' },
          { t: 'Reinstalar el sistema operativo', ok: false, res: 'El sistema no tiene la culpa de un fallo eléctrico en la placa: los reinicios seguirán.' }
        ],
        verificaciones: [
          { t: 'Dejar el equipo funcionando 48 horas y revisar el registro de eventos', ok: true, res: 'No hay ningún reinicio inesperado en 48 horas.' },
          { t: 'Encenderlo cinco minutos y darlo por bueno', ok: false, res: 'Los reinicios eran cada pocas horas: cinco minutos no demuestran nada.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo se reinicia sin aviso, cada vez con más frecuencia, incluso en reposo.'],
          ['Por qué', 'Los condensadores electrolíticos filtran la tensión que el VRM entrega a la CPU. Con los años y el calor, su electrolito se seca o se expande: pierden capacidad, la tensión se vuelve inestable y la CPU se cuelga.'],
          ['Qué no puede concluir la medición', 'Unos raíles correctos en el conector de la fuente no dicen nada de la tensión que llega a la CPU después del VRM de la placa.'],
          ['Cómo se resuelve', 'Busca condensadores con la parte superior abombada o con restos marrones. Si los hay, sustituye la placa o repárala en un servicio con soldadura especializado.'],
          ['Lección', 'A veces la inspección visual sí decide: un condensador hinchado es una prueba física, no un indicio.']
        ],
        fallos: { vis: 'Junto al zócalo de la CPU hay cuatro condensadores con la parte superior abombada y uno con un resto marrón seco.' },
        res: { ent: 'El equipo nunca se ha apagado en años; solo lo reinicia el informático para actualizar. Nadie ha tocado nada.', vis: 'Junto al zócalo de la CPU hay cuatro condensadores con la parte superior abombada y uno con un resto marrón seco.', fue: 'Los raíles están en tolerancia y estables durante varios minutos de medida.', carga: '+12 V se mantiene estable en carga: la fuente no es el problema.', min: 'En mínima configuración también se reinicia, solo que tarda más.', ram: 'La RAM supera el test: no es la causa.', tmp: 'La CPU está a 55 °C en reposo: no es una temperatura de corte.', fan: 'Los ventiladores están bien conectados y giran.', smart: 'El disco está sano.', cam: 'Con otra fuente se sigue reiniciando.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], vis: ['placa', 'bad'], ram: ['ram', 'ok'], tmp: ['cpu', 'ok'], smart: ['disco', 'ok'], cam: ['fuente', 'ok'] }, volt: [12.06, 5.04, 3.32] },

      /* 14 · potencia */
      { t: 'El piso de Pablo', s: 'Pablo comparte piso con otros tres estudiantes. Se ha comprado una gráfica nueva de gama alta para su ordenador de siempre y estaba encantado, hasta que empezó a jugar: en las escenas más intensas el equipo se apaga de golpe. En el escritorio, navegando, no le pasa nunca.', causa: 'potencia', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El equipo arranca bien y se apaga solo con el esfuerzo: piensa en lo que aumenta con la carga.', 'Hay dos sospechosos que crecen con la carga: el calor y el consumo. Mide uno y otro bajo carga.', 'Compara la potencia de la fuente con lo que piden juntas la CPU y la gráfica nueva.'],
        discrima: { ids: ['tmp', 'carga'], texto: 'Un apagado bajo carga puede venir de la temperatura o de una fuente que no da la potencia. Mide la temperatura de la CPU y el raíl de 12 V con el equipo en carga.' },
        explica: 'La fuente no da la potencia que piden juntas la CPU y la gráfica nueva: en los picos de consumo, el raíl de 12 V se hunde y la fuente se protege.',
        reparaciones: [
          { t: 'Sustituir la fuente por una de potencia y conectores adecuados para la gráfica', ok: true, res: 'Con la fuente nueva, el raíl de 12 V se mantiene en carga y el equipo no se apaga.' },
          { t: 'Limpiar el disipador y cambiar la pasta térmica', ok: false, res: 'Las temperaturas son normales: limpiar no cambia el consumo.' },
          { t: 'Cambiar la placa base', ok: false, res: 'La placa no limita la potencia de la fuente. El fallo sigue en la fuente.' }
        ],
        verificaciones: [
          { t: 'Medir +12 V con el juego más exigente durante 30 minutos', ok: true, res: '+12 V se mantiene por encima de 11,8 V y el equipo no se apaga.' },
          { t: 'Arrancar en el escritorio y darlo por bueno', ok: false, res: 'En el escritorio nunca fallaba: hay que probar en carga.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo se apaga de golpe en los momentos de máximo consumo, sin calentarse.'],
          ['Por qué', 'La CPU y, sobre todo, la gráfica consumen del raíl de 12 V. Si la suma de sus picos supera lo que la fuente puede dar, la tensión cae fuera de tolerancia y la protección de la fuente (OPP/UVP) corta.'],
          ['Qué no puede concluir la medición en reposo', 'Una fuente que mide bien en reposo puede no aguantar en carga. La medida que separa potencia de temperatura se hace con el equipo al máximo.'],
          ['Cómo se resuelve', 'Mide +12 V en carga y las temperaturas. Si la tensión se hunde y las temperaturas son normales, calcula el consumo de la CPU y la gráfica y elige una fuente con margen y los conectores PCIe que pide el fabricante.'],
          ['Lección', 'Al subir de gráfica, revisa la fuente: la potencia necesaria la marca el fabricante de la gráfica, no la caja de la fuente antigua.']
        ],
        fallos: { carga: '+12 V cae a 11,1 V en los picos de la partida, fuera de tolerancia (±5 %), justo antes de apagarse.' },
        res: { ent: 'La fuente es la que venía con la caja hace cinco años. En la etiqueta pone 450 W. El fabricante de la gráfica recomienda 750 W.', vis: 'Todo está limpio y bien conectado. La gráfica usa un adaptador de dos cables a uno de 8 pines.', fue: 'Los raíles están en tolerancia con el equipo en reposo. Eso no dice nada del comportamiento bajo carga.', carga: '+12 V cae a 11,1 V en los picos de la partida, fuera de tolerancia (±5 %), justo antes de apagarse.', min: 'Sin carga el fallo no aparece: la mínima configuración no lo reproduce.', tmp: 'La CPU llega a 70 °C y la gráfica a 72 °C en carga: temperaturas normales.', fan: 'Todos los ventiladores están bien conectados y giran.', gpu: 'La gráfica está bien asentada y sus cables, conectados.', ram: 'La RAM supera el test: no es la causa.', cam: 'Con una fuente de prueba de 850 W el equipo aguanta la partida sin apagarse.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'bad'], tmp: ['cpu', 'ok'], gpu: ['grafica', 'ok'], ram: ['ram', 'ok'], cam: ['fuente', 'ok'] }, volt: [12.08, 5.02, 3.31] },

      /* 15 · ram (fallo intermitente) */
      { t: 'El aula 2.3 del instituto', s: 'En el aula 2.3 de un instituto, el ordenador del puesto 14 da pantallazos azules sin un patrón claro: a veces al abrir el navegador, a veces a mitad de un examen. Cada pantallazo muestra un mensaje distinto. Los otros 29 equipos del aula, idénticos, no fallan.', causa: 'ram', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Si 29 equipos idénticos funcionan, el software es el mismo en todos: busca lo que solo tiene este puesto.', 'Los errores distintos y sin patrón suelen venir de datos que se corrompen en algún sitio. Un test de memoria lo comprueba.', 'Prueba los módulos de uno en uno y en otro slot, y reencájalos antes de dar uno por malo.'],
        discrima: { ids: ['ram', 'reenc'], exige: { ram: 'fallo', reenc: 'fallo' }, texto: 'Los errores de memoria también los provoca un módulo mal asentado. Prueba el módulo en otro slot y reencájalo antes de confirmarlo.' },
        explica: 'Uno de los dos módulos de RAM tiene celdas defectuosas: corrompe datos al azar y el sistema se cuelga.',
        reparaciones: [
          { t: 'Sustituir el módulo defectuoso por otro igual', ok: true, requiere: { reenc: 'fallo' }, res: 'Con el módulo nuevo, el test de memoria pasa sin errores.', noJustificada: 'El reencaje ya resolvió el fallo: sustituir el módulo no está justificado.' },
          { t: 'Reinstalar Windows desde la imagen del aula', ok: false, res: 'La imagen es la misma que en los otros 29 equipos: el problema es físico.' },
          { t: 'Cambiar la placa base', ok: false, res: 'El fallo sigue al módulo en cualquier slot: la placa no es la causa.' }
        ],
        verificaciones: [
          { t: 'Pasar un test de memoria completo (varias pasadas) sin errores', ok: true, res: 'Cuatro pasadas del test sin un solo error.' },
          { t: 'Arrancar Windows y dejarlo cinco minutos', ok: false, res: 'Los fallos eran aleatorios: cinco minutos sin pantallazo no demuestran nada.' }
        ],
        explicacion: [
          ['Qué pasa', 'Pantallazos azules aleatorios con mensajes distintos: síntoma típico de memoria que corrompe datos.'],
          ['Por qué', 'Si algunas celdas de un módulo fallan, cualquier dato que pase por ellas puede cambiar. Según lo que se corrompa, falla un programa, un controlador o el propio sistema, y por eso cada error parece distinto.'],
          ['Qué no puede concluir la prueba en otro slot', 'Que el fallo siga al módulo no demuestra que esté defectuoso: un módulo mal asentado también falla. El reencaje separa las dos causas.'],
          ['Cómo se resuelve', 'Pasa un test de memoria con los módulos de uno en uno. Si un módulo da errores en cualquier slot y también después de reencajarlo, sustitúyelo.'],
          ['Lección', 'Errores aleatorios y diferentes en un equipo concreto apuntan al hardware, no al software: la memoria es la primera sospechosa.']
        ],
        fallos: { ram: 'Con el módulo B solo, el test de memoria da errores en cualquier slot. Con el módulo A solo, ninguno.', reenc: 'Reencajado hasta el fondo, el módulo B vuelve a dar errores en el test.' },
        res: { ent: 'El equipo es igual que los demás, pero hace un año se le cambió la memoria tras una avería y se usó un módulo que sobraba de otra aula.', vis: 'Los módulos parecen bien encajados a simple vista. Uno tiene una pegatina distinta.', fue: 'Los raíles están en tolerancia.', carga: '+12 V se mantiene estable en carga: la fuente no es el problema.', min: 'Con los dos módulos, el test de memoria da errores. Hay que probarlos de uno en uno.', ram: 'Con el módulo B solo, el test de memoria da errores en cualquier slot. Con el módulo A solo, ninguno.', reenc: 'Reencajado hasta el fondo, el módulo B vuelve a dar errores en el test.', tmp: 'Temperaturas normales.', smart: 'El disco está sano.', sata: 'Los cables del disco están bien.', cam: 'Cambiar la fuente no cambia nada: los pantallazos siguen.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], min: ['ram', 'bad'], ram: ['ram', 'bad'], reenc: ['ram', 'bad'], tmp: ['cpu', 'ok'], smart: ['disco', 'ok'], sata: ['disco', 'ok'] }, volt: [12.01, 5.00, 3.30] },

      /* 16 · fuente (olor a quemado) */
      { t: 'La peluquería de Lourdes', s: 'Lourdes tiene el ordenador de las citas en el mostrador de la peluquería, enchufado en la misma regleta que dos secadores y una plancha. Ayer, en plena tarde, saltó un chispazo, olió a quemado y el ordenador se apagó. Desde entonces no hace nada al pulsar el botón.', causa: 'fuente', senales: { ps: 5.0, sb: 0.0 },
        pistas: ['El olor a quemado salió de algún sitio. Piensa en qué pieza recibe primero la corriente del enchufe.', 'Mide la fuente. Si no hay ninguna tensión, todavía no sabes si la fuente está muerta o si algo de la placa la mantiene en protección.', 'Prueba la fuente sola, sin placa y con PS_ON# puenteado a masa. Si sigue sin dar tensión, la culpable es ella.'],
        discrima: { ids: ['fue', 'min'], texto: 'Un 0 V en todo no distingue una fuente muerta de un corto en la placa. Mide y prueba la fuente sola, sin placa, antes de confirmarla.' },
        explica: 'La fuente se ha quemado por una sobrecarga en la regleta: no da ni +5 VSB ni los raíles principales.',
        reparaciones: [
          { t: 'Sustituir la fuente por una nueva y enchufar el ordenador en una regleta aparte', ok: true, res: 'Con la fuente nueva, en su propia regleta, el equipo enciende y los raíles están en tolerancia.' },
          { t: 'Abrir la fuente y cambiar el fusible quemado', ok: false, res: 'Una fuente no se abre nunca: sus condensadores guardan tensiones peligrosas aunque esté desenchufada. Se sustituye entera.' },
          { t: 'Cambiar la placa base', ok: false, res: 'La fuente sola no da tensión: la placa no es la causa.' }
        ],
        verificaciones: [
          { t: 'Encender y medir los tres raíles con el equipo en carga', ok: true, res: 'Los raíles se mantienen en tolerancia y el equipo funciona con normalidad.' },
          { t: 'Comprobar que ya no huele a quemado y darlo por bueno', ok: false, res: 'Que no huela no demuestra que el equipo funcione: falta encenderlo y medir.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo no responde al botón tras un chispazo y olor a quemado: no hay ni luces ni ventiladores.'],
          ['Por qué', 'Los secadores y las planchas consumen mucha corriente. Una regleta sobrecargada puede provocar picos que dañan la etapa de entrada de la fuente. Si la fuente no da +5 VSB, la placa no puede escuchar el botón.'],
          ['Qué no puede concluir la medición', '0 V en los raíles y en +5 VSB no distinguen una fuente quemada de un cortocircuito en la placa. La prueba de la fuente sola lo decide.'],
          ['Cómo se resuelve', 'Prueba la fuente sola con PS_ON# puenteado. Si no da tensión, sustitúyela sin abrirla y separa el ordenador de los aparatos de mucho consumo.'],
          ['Lección', 'Un olor a quemado es un indicio, no un diagnóstico. Y una fuente averiada nunca se abre: se cambia.']
        ],
        res: { ent: 'La regleta es barata y está llena: dos secadores, una plancha del pelo y el ordenador. El chispazo salió de la parte de atrás de la torre.', vis: 'Huele a quemado cerca de la rejilla de la fuente. En la placa no se ve nada quemado. Es un indicio: hay que medir.', fue: 'Los tres raíles a 0 V y sin +5 VSB. Eso no separa una fuente muerta de un corto en la placa: hay que probar la fuente sola.', min: 'Fuente sola, sin placa y con PS_ON# puenteado a masa: ni un voltio. La fuente es la causa.', carga: 'No se puede medir en carga: el equipo no arranca.', banco: 'Fuera de la caja, con la misma fuente, la placa tampoco da señales: sin fuente no se puede probar.', panel: 'Puenteas los pines de encendido y no pasa nada: el botón no es el problema.', ram: 'Sin tensión no hay nada que probar en la RAM.', eps: 'Sin tensión, el EPS no es el problema.', tmp: 'No se puede medir: el equipo no arranca.', cam: 'Con una fuente de prueba la placa arranca a la primera. La original está quemada.' },
        luz: { fue: ['fuente', 'bad'], min: ['fuente', 'bad'], cam: ['fuente', 'ok'] }, volt: [0, 0, 0] },

      /* 17 · fuente (raíl de 12 V fuera de tolerancia) */
      { t: 'El gimnasio Titán', s: 'En la recepción del gimnasio Titán, el ordenador que lee los carnés de los socios se cuelga varias veces al día y a veces se reinicia al arrancar Windows. Desde hace unos días, además, se oye un zumbido agudo que sale de la parte de atrás de la torre.', causa: 'fuente', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Los cuelgues no dependen de lo que hace el ordenador. Empieza por la alimentación: es lo que más afecta a todo a la vez.', 'Mide los tres raíles con el polímetro y compáralos con la tolerancia ATX del ±5 %.', 'Si un raíl está fuera de tolerancia, prueba la fuente sola, sin placa: así sabes si el fallo es de la fuente o de lo que alimenta.'],
        discrima: { ids: ['fue', 'min'], texto: 'Un raíl bajo también puede venir de una placa que consume de más. Mide y prueba la fuente sola, sin placa, antes de confirmarla.' },
        explica: 'La fuente está envejecida: su raíl de +12 V da 10,9 V, fuera de tolerancia, y la CPU se queda sin tensión estable.',
        reparaciones: [
          { t: 'Sustituir la fuente por una nueva de calidad y potencia adecuada', ok: true, res: 'Con la fuente nueva, +12 V está en 12,05 V y el zumbido desaparece.' },
          { t: 'Reinstalar Windows', ok: false, res: 'El fallo es eléctrico: con la misma fuente, el sistema nuevo se colgará igual.' },
          { t: 'Cambiar la RAM', ok: false, res: 'La memoria recibe una tensión inestable de la fuente: cambiarla no corrige la causa.' }
        ],
        verificaciones: [
          { t: 'Medir los tres raíles en reposo y en carga y dejar el equipo un día funcionando', ok: true, res: 'Los raíles están en tolerancia y no hay ningún cuelgue en todo el día.' },
          { t: 'Arrancar Windows una vez y darlo por bueno', ok: false, res: 'Los cuelgues eran varias veces al día: un arranque no demuestra nada.' }
        ],
        explicacion: [
          ['Qué pasa', 'Cuelgues y reinicios sin patrón, con un zumbido agudo en la fuente.'],
          ['Por qué', 'Con los años, los condensadores de la fuente pierden capacidad y la regulación empeora. Si el raíl de +12 V cae por debajo de 11,40 V, el VRM no puede dar a la CPU una tensión estable y el sistema se cuelga. El zumbido suele venir de componentes de la fuente trabajando forzados.'],
          ['Qué no puede concluir la medición', 'Un raíl bajo con todo conectado no demuestra que la fuente esté mal: una placa con un consumo anormal también lo hundiría. La prueba de la fuente sola lo separa.'],
          ['Cómo se resuelve', 'Mide los raíles. Si alguno está fuera de tolerancia, prueba la fuente sola. Si sigue fuera, sustitúyela por una de calidad.'],
          ['Lección', 'Los cuelgues sin patrón no siempre son software. Mide la fuente: un raíl fuera de tolerancia lo explica todo.']
        ],
        fallos: { fue: '+12 V marca 10,9 V: fuera de la tolerancia ATX (11,40 a 12,60 V).' },
        res: { ent: 'El ordenador tiene siete años y está encendido catorce horas al día. El zumbido empezó hace una semana.', vis: 'Todo está bien conectado. El zumbido sale de la fuente. Es un indicio: hay que medir.', fue: '+12 V marca 10,9 V: fuera de la tolerancia ATX (11,40 a 12,60 V).', min: 'Fuente sola, sin placa y con PS_ON# puenteado a masa: +12 V sigue en 10,9 V. La fuente es la causa.', carga: 'En carga, +12 V baja a 10,6 V y el equipo se cuelga a los pocos minutos.', ram: 'La RAM supera el test cuando el equipo aguanta: no es la causa.', tmp: 'Temperaturas normales.', smart: 'El disco está sano.', eps: 'El EPS está bien conectado.', cam: 'Con una fuente de prueba, los raíles están en tolerancia y el equipo no se cuelga.' },
        luz: { fue: ['fuente', 'bad'], min: ['fuente', 'bad'], carga: ['fuente', 'bad'], ram: ['ram', 'ok'], tmp: ['cpu', 'ok'], smart: ['disco', 'ok'], cam: ['fuente', 'ok'] }, volt: [10.9, 4.98, 3.30] },

      /* 18 · potencia (fuente genérica) */
      { t: 'El cuarto de Diego', s: 'Diego ha ahorrado durante meses para pasar su ordenador al 3D. Compró una gráfica nueva y, para no gastar más, una fuente de 800 W muy barata en una web de ofertas. En cuanto abre un programa de modelado y lanza un render, el ordenador se apaga de golpe.', causa: 'potencia', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Se apaga justo cuando pide el máximo a la CPU y a la gráfica. Piensa en lo que sube cuando el equipo trabaja a tope.', 'Hay dos sospechosos que crecen con la carga: el calor y el consumo. Mide uno y otro durante el render.', 'Los vatios de la etiqueta no garantizan nada. Lo que importa es si +12 V aguanta en carga.'],
        discrima: { ids: ['tmp', 'carga'], texto: 'Un apagado bajo carga puede venir de la temperatura o de una fuente que no da la potencia. Mide la temperatura de la CPU y el raíl de 12 V con el equipo en carga.' },
        explica: 'La fuente genérica no da la potencia que promete su etiqueta: en el render, +12 V se hunde y la fuente corta.',
        reparaciones: [
          { t: 'Sustituir la fuente por una de marca, certificada y con la potencia que pide la gráfica', ok: true, res: 'Con la fuente nueva, +12 V aguanta durante el render y el equipo no se apaga.' },
          { t: 'Bajar la calidad del render para que consuma menos', ok: false, res: 'Así se esconde el problema: la fuente seguirá cayendo con cualquier carga fuerte.' },
          { t: 'Cambiar la pasta térmica de la CPU', ok: false, res: 'Las temperaturas son normales: la pasta no tiene nada que ver.' }
        ],
        verificaciones: [
          { t: 'Lanzar un render largo midiendo +12 V', ok: true, res: '+12 V se mantiene por encima de 11,8 V y el render termina.' },
          { t: 'Encender y abrir el programa sin renderizar', ok: false, res: 'Sin carga nunca fallaba: hay que probar con un render.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo se apaga de golpe en cuanto la CPU y la gráfica trabajan a la vez al máximo.'],
          ['Por qué', 'Muchas fuentes genéricas anuncian potencias que solo alcanzan en picos o sumando todos los raíles. En el raíl de 12 V, que es el que alimenta la CPU y la gráfica, dan mucho menos. Cuando la tensión cae, la protección de la fuente corta.'],
          ['Qué no puede concluir la etiqueta', 'Que la fuente diga 800 W no demuestra que los dé. Solo la medida de +12 V en carga lo comprueba.'],
          ['Cómo se resuelve', 'Mide las temperaturas y +12 V en carga. Si la tensión se hunde, cambia la fuente por una de marca con certificación 80 Plus y la potencia que recomienda el fabricante de la gráfica.'],
          ['Lección', 'La fuente es la última pieza en la que ahorrar. Una fuente mala no solo apaga el equipo: puede dañar el resto.']
        ],
        fallos: { carga: '+12 V cae a 11,0 V al empezar el render y el equipo se apaga a los pocos segundos.' },
        res: { ent: 'La fuente costó 25 euros, no tiene certificación 80 Plus y pesa muy poco. El fabricante de la gráfica recomienda una fuente de 700 W de calidad.', vis: 'Todo está bien conectado. La fuente no tiene ninguna etiqueta 80 Plus.', fue: 'Los raíles están en tolerancia en reposo. Eso no dice nada del comportamiento en carga.', carga: '+12 V cae a 11,0 V al empezar el render y el equipo se apaga a los pocos segundos.', min: 'Sin carga el fallo no aparece: la mínima configuración no lo reproduce.', tmp: 'La CPU llega a 72 °C y la gráfica a 70 °C antes de apagarse: temperaturas normales.', fan: 'Todos los ventiladores giran y están en su cabecera.', gpu: 'La gráfica está bien asentada y sus dos cables PCIe conectados.', ram: 'La RAM supera el test: no es la causa.', cam: 'Con una fuente de prueba de 750 W de marca, el render termina sin apagarse.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'bad'], tmp: ['cpu', 'ok'], gpu: ['grafica', 'ok'], ram: ['ram', 'ok'], cam: ['fuente', 'ok'] }, volt: [12.03, 5.01, 3.30] },

      /* 19 · potencia (dos gráficas) */
      { t: 'El laboratorio de Irene', s: 'Irene investiga en la universidad y entrena modelos de inteligencia artificial en un ordenador del grupo. Para ir más rápido le han añadido una segunda tarjeta gráfica igual que la primera. Con una sola gráfica todo iba bien; con las dos, el ordenador se apaga a los pocos segundos de empezar el entrenamiento.', causa: 'potencia', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Con una gráfica funciona y con dos se apaga en cuanto trabajan. ¿Qué se ha duplicado al añadir la segunda?', 'Hay dos sospechosos que crecen con la carga: el calor y el consumo. Mide los dos durante el entrenamiento.', 'Suma lo que consumen la CPU y las dos gráficas y compáralo con lo que da la fuente.'],
        discrima: { ids: ['tmp', 'carga'], texto: 'Un apagado bajo carga puede venir de la temperatura o de una fuente que no da la potencia. Mide la temperatura de la CPU y el raíl de 12 V con el equipo en carga.' },
        explica: 'La fuente de 650 W bastaba para una gráfica, pero no para dos: en carga, +12 V se hunde y la fuente corta.',
        reparaciones: [
          { t: 'Calcular el consumo total y sustituir la fuente por una de potencia suficiente, con conectores para las dos gráficas', ok: true, res: 'Con una fuente de 1200 W, el entrenamiento corre horas sin apagarse.' },
          { t: 'Quitar la segunda gráfica y darlo por reparado', ok: false, res: 'Así vuelve a funcionar, pero no cumple lo que pidió el grupo: la causa sigue siendo la fuente.' },
          { t: 'Cambiar la segunda gráfica por defectuosa', ok: false, res: 'Las dos gráficas funcionan solas: el problema es la potencia disponible.' }
        ],
        verificaciones: [
          { t: 'Entrenar con las dos gráficas al máximo durante una hora midiendo +12 V', ok: true, res: '+12 V se mantiene estable y el entrenamiento no se interrumpe.' },
          { t: 'Comprobar que el sistema detecta las dos gráficas', ok: false, res: 'Ya las detectaba antes: el fallo aparecía en carga.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo se apaga en cuanto las dos gráficas trabajan a la vez.'],
          ['Por qué', 'Cada gráfica puede consumir más de 300 W en carga. Con la CPU y el resto, el total supera con mucho los 650 W de la fuente. El raíl de 12 V cae y la protección por sobrecarga (OPP) corta.'],
          ['Qué no puede concluir la observación', 'Que cada gráfica funcione sola no dice nada de lo que pasa cuando consumen a la vez. La medida de +12 V en carga lo demuestra.'],
          ['Cómo se resuelve', 'Suma el consumo de la CPU y de las gráficas, añade margen y elige una fuente que lo cubra, con conectores PCIe propios para cada gráfica.'],
          ['Lección', 'Cada ampliación suma consumo. Antes de añadir una gráfica, recalcula la fuente.']
        ],
        fallos: { carga: '+12 V cae a 11,1 V al empezar el entrenamiento y el equipo se apaga.' },
        res: { ent: 'La fuente es de 650 W y venía con el equipo. Cada gráfica, según su ficha, consume hasta 320 W.', vis: 'Todo está bien conectado. La segunda gráfica comparte cable con la primera mediante un divisor.', fue: 'Los raíles están en tolerancia en reposo. Eso no dice nada del comportamiento en carga.', carga: '+12 V cae a 11,1 V al empezar el entrenamiento y el equipo se apaga.', min: 'Con una sola gráfica el entrenamiento funciona: el fallo aparece al sumar la segunda.', tmp: 'CPU a 65 °C y gráficas a 71 °C antes de apagarse: temperaturas normales.', fan: 'Todos los ventiladores giran y están en su cabecera.', gpu: 'Las dos gráficas están bien asentadas y sus conectores PCIe, encajados.', ram: 'La RAM supera el test: no es la causa.', cam: 'Con una fuente de prueba de 1200 W, el entrenamiento corre sin apagarse.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'bad'], tmp: ['cpu', 'ok'], gpu: ['grafica', 'ok'], ram: ['ram', 'ok'], cam: ['fuente', 'ok'] }, volt: [12.05, 5.02, 3.31] },

      /* 20 · ram (módulo defectuoso tras ampliar) */
      { t: 'La agencia de viajes Brisa', s: 'En la agencia de viajes Brisa ampliaron la memoria del ordenador del mostrador para que el programa de reservas fuera más rápido. Desde entonces aparecen pantallazos azules que dicen «MEMORY_MANAGEMENT» y, a veces, el ordenador se reinicia en mitad de una reserva.', causa: 'ram', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El fallo empezó con la ampliación. El propio mensaje del pantallazo te dice por dónde mirar.', 'Prueba los módulos de uno en uno con un test de memoria y en otro slot.', 'Antes de dar un módulo por malo, reencájalo con el equipo apagado y repite la prueba.'],
        discrima: { ids: ['ram', 'reenc'], exige: { ram: 'fallo', reenc: 'fallo' }, texto: 'Un módulo mal asentado da los mismos errores que uno defectuoso. Prueba el módulo en otro slot y reencájalo antes de confirmarlo.' },
        explica: 'El módulo nuevo tiene celdas defectuosas: da errores en cualquier slot, también después de reencajarlo.',
        reparaciones: [
          { t: 'Devolver el módulo nuevo por garantía y montar uno igual que funcione', ok: true, requiere: { reenc: 'fallo' }, res: 'Con el módulo de reemplazo, el test de memoria pasa sin errores.', noJustificada: 'El reencaje ya resolvió el fallo: sustituir el módulo no está justificado.' },
          { t: 'Reinstalar el programa de reservas', ok: false, res: 'El pantallazo es de gestión de memoria: el programa no es la causa.' },
          { t: 'Cambiar la placa base', ok: false, res: 'El fallo sigue al módulo en cualquier slot: la placa no es la causa.' }
        ],
        verificaciones: [
          { t: 'Pasar un test de memoria completo (varias pasadas) sin errores', ok: true, res: 'Cuatro pasadas sin un solo error.' },
          { t: 'Hacer una reserva y darlo por bueno', ok: false, res: 'Los pantallazos eran aleatorios: una reserva no demuestra nada.' }
        ],
        explicacion: [
          ['Qué pasa', 'Pantallazos azules de gestión de memoria desde que se amplió la RAM.'],
          ['Por qué', 'Si un módulo tiene celdas que no guardan bien los datos, el sistema detecta incoherencias en la memoria y se detiene con un error como MEMORY_MANAGEMENT para evitar daños mayores.'],
          ['Qué no puede concluir la prueba en otro slot', 'Que el fallo siga al módulo no demuestra que esté defectuoso: un módulo mal asentado también falla en todos los slots. El reencaje separa las dos causas.'],
          ['Cómo se resuelve', 'Prueba cada módulo por separado con un test de memoria. Si uno falla en cualquier slot y también tras reencajarlo, se sustituye (si es nuevo, por garantía).'],
          ['Lección', 'Después de una ampliación, la pieza nueva es la primera sospechosa. Pruébala sola.']
        ],
        fallos: { ram: 'Con el módulo nuevo solo, el test de memoria da errores en cualquier slot. Con el antiguo solo, ninguno.', reenc: 'Reencajado hasta el fondo, el módulo nuevo vuelve a dar errores en el test.' },
        res: { ent: 'Compraron un módulo de 8 GB de la misma marca y velocidad que el que ya tenían. Lo montó el sobrino de la dueña.', vis: 'Los dos módulos parecen bien encajados a simple vista.', fue: 'Los raíles están en tolerancia.', carga: '+12 V se mantiene estable en carga: la fuente no es el problema.', min: 'Con los dos módulos, el test de memoria da errores. Hay que probarlos de uno en uno.', ram: 'Con el módulo nuevo solo, el test de memoria da errores en cualquier slot. Con el antiguo solo, ninguno.', reenc: 'Reencajado hasta el fondo, el módulo nuevo vuelve a dar errores en el test.', tmp: 'Temperaturas normales.', smart: 'El disco está sano.', bios: 'La BIOS detecta los 16 GB y admite esa memoria.', cam: 'Cambiar la fuente no cambia nada: los pantallazos siguen.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], min: ['ram', 'bad'], ram: ['ram', 'bad'], reenc: ['ram', 'bad'], tmp: ['cpu', 'ok'], smart: ['disco', 'ok'], bios: ['placa', 'ok'] }, volt: [12.02, 5.01, 3.30] },

      /* 21 · ram (módulo mal asentado tras un golpe) */
      { t: 'El taller de bicis de Quique', s: 'Quique tiene la torre del ordenador en el suelo del taller, entre bicis. Esta mañana, al meter una bici de montaña, el manillar golpeó la torre. Ahora, al encenderla, los ventiladores giran, la pantalla se queda negra y la placa pita sin parar.', causa: 'ram', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Los pitidos los genera la placa durante el POST: la alimentación llega. ¿Qué se comprueba en los primeros segundos?', 'Un golpe lateral puede mover algo que va insertado en la placa. Prueba la memoria en otro slot.', 'Reencaja el módulo hasta el fondo con el equipo apagado y repite el arranque: el resultado decide si hace falta cambiar algo.'],
        discrima: { ids: ['ram', 'reenc'], exige: { ram: 'fallo', reenc: 'sin_fallo' }, texto: 'Un módulo mal asentado y uno defectuoso dan el mismo síntoma. Prueba el módulo en otro slot y reencájalo con el equipo apagado.' },
        explica: 'El golpe sacó a medias el módulo de su slot: al reencajarlo, la placa arranca sin pitidos.',
        reparaciones: [
          { t: 'Reencajar el módulo hasta el fondo, con los clips cerrados, y verificar', ok: true, requiere: { reenc: 'sin_fallo' }, res: 'Con el módulo bien asentado, la placa arranca sin pitidos.', noJustificada: 'El reencaje no ha resuelto el fallo: el módulo está defectuoso y hay que sustituirlo.' },
          { t: 'Sustituir el módulo por uno nuevo', ok: true, requiere: { reenc: 'fallo' }, res: 'Con el módulo nuevo la placa completa el POST.', noJustificada: 'El reencaje ya resolvió el fallo: sustituir el módulo no está justificado.' },
          { t: 'Cambiar la placa base por si se ha roto con el golpe', ok: false, res: 'La placa arranca con el módulo bien colocado: no está rota.' }
        ],
        verificaciones: [
          { t: 'Arrancar, comprobar que no pita y que la BIOS ve toda la memoria', ok: true, res: 'Sin pitidos y con toda la memoria detectada. Le recomiendas a Quique subir la torre a una mesa.' },
          { t: 'Dar el caso por cerrado sin arrancar', ok: false, res: 'Sin arrancar no hay verificación.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras un golpe, la placa pita y no da imagen: se detiene en el POST por un fallo de memoria.'],
          ['Por qué', 'Un golpe puede desplazar un módulo lo justo para que algunos contactos dejen de tocar. La BIOS no puede inicializar la memoria y emite pitidos, igual que con un módulo averiado.'],
          ['Qué no puede concluir la prueba en otro slot', 'Que pite en otro slot no demuestra que el módulo esté defectuoso: si no se encaja bien, falla en cualquiera. El reencaje lo decide.'],
          ['Cómo se resuelve', 'Con el equipo apagado y desenchufado, reencaja el módulo hasta oír los clips y repite el arranque. No hace falta cambiar ninguna pieza.'],
          ['Lección', 'Antes de comprar nada, reencaja. Muchas averías tras un golpe son solo contactos que se han movido.']
        ],
        fallos: { ram: 'Con el módulo en otro slot, la placa sigue pitando. Eso no separa un módulo malo de uno mal asentado.' },
        res: { ent: 'El golpe fue fuerte: la torre se movió un palmo. Antes funcionaba perfectamente.', vis: 'Uno de los clips del slot de memoria parece abierto. Es un indicio: hay que comprobar el encaje.', fue: 'Los valores de la fuente son correctos.', carga: 'No se puede cargar el equipo: no pasa del POST.', min: 'Con la configuración mínima sigue pitando: la memoria es la sospechosa.', ram: 'Con el módulo en otro slot, la placa sigue pitando. Eso no separa un módulo malo de uno mal asentado.', reenc: 'Con el equipo apagado y desenchufado, reencajas el módulo hasta el fondo y cierran los clips. Al arrancar, la placa arranca sin pitidos.', eps: 'El EPS está bien conectado.', gpu: 'La gráfica está bien asentada.', bios: 'La BIOS no ha cambiado: es la de siempre.', tmp: 'No se puede medir: no pasa del POST.', cam: 'Cambiar la fuente no altera los pitidos.' },
        luz: { fue: ['fuente', 'ok'], min: ['ram', 'bad'], ram: ['ram', 'bad'], reenc: ['ram', 'ok'], eps: ['cpu', 'ok'], gpu: ['grafica', 'ok'] }, volt: [12.03, 5.02, 3.31] },

      /* 22 · eps (olvidado al cambiar la fuente) */
      { t: 'La academia de Moira', s: 'En la academia de inglés de Moira, la fuente del ordenador del aula hacía mucho ruido y un técnico la cambió por una modular nueva. Al terminar, el técnico se fue con prisa. Ahora el ordenador enciende, los ventiladores giran y las luces de la caja se iluminan, pero el proyector no muestra nada.', causa: 'eps', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Lo último que se tocó fue la fuente, y una fuente tiene muchos cables. Comprueba que todos han llegado a su sitio.', 'Revisa por separado los conectores que alimentan la placa y los que alimentan la CPU.', 'En una fuente modular, cada cable se conecta también en la fuente. Busca el conector de 8 pines de la CPU.'],
        discrima: { ids: ['eps'], texto: 'Pantalla negra con ventiladores también encaja con una gráfica sin alimentación o una RAM que no arranca. Revisa el conector EPS antes de confirmarlo.' },
        explica: 'Al cambiar la fuente, el cable EPS de la CPU se quedó sin conectar: la placa tiene tensión, pero la CPU no.',
        reparaciones: [
          { t: 'Conectar el cable EPS en la fuente modular y en la placa hasta oír el clic', ok: true, res: 'Con el EPS conectado, la CPU recibe +12 V y el equipo completa el POST.' },
          { t: 'Volver a montar la fuente antigua', ok: false, res: 'La fuente nueva funciona: lo que falta es un cable. La antigua, además, hacía ruido.' },
          { t: 'Cambiar la CPU', ok: false, res: 'Sin alimentación ninguna CPU arranca: cambiarla no corrige nada.' }
        ],
        verificaciones: [
          { t: 'Arrancar y comprobar que la BIOS muestra la CPU y completa el POST', ok: true, res: 'El POST se completa y el proyector muestra la imagen.' },
          { t: 'Dar la reparación por buena sin arrancar', ok: false, res: 'Conectar el cable no demuestra nada: falta comprobar el arranque.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras cambiar la fuente, el equipo enciende pero no pasa el POST ni da imagen.'],
          ['Por qué', 'La ATX de 24 pines alimenta la placa y el EPS de 8 pines alimenta la CPU. En una fuente modular, el cable EPS se conecta también en la fuente: si falta en cualquiera de los dos extremos, la CPU no recibe +12 V.'],
          ['Qué no puede concluir la observación', 'Que los ventiladores y las luces funcionen demuestra que la placa tiene tensión, no que la CPU la reciba.'],
          ['Cómo se resuelve', 'Revisa el EPS en los dos extremos. Conéctalo en la fuente y en la placa hasta oír el clic y vuelve a probar.'],
          ['Lección', 'Después de cambiar una fuente, repasa cable a cable que todos los conectores han vuelto a su sitio.']
        ],
        fallos: { eps: 'El conector EPS de la placa está vacío. El cable de 8 pines sigue en la caja de la fuente nueva, sin estrenar.' },
        res: { ent: 'El técnico cambió la fuente ayer por la tarde. Antes funcionaba, aunque hacía mucho ruido.', vis: 'La esquina superior de la placa queda tapada por el disipador: desde arriba no se ve bien. Es un indicio: hay que comprobarlo.', fue: 'Los valores de la fuente son correctos.', carga: 'No se puede cargar el equipo: no pasa del POST.', min: 'Con la configuración mínima sigue sin arrancar: la RAM, la gráfica y el disco no son el problema. Revisa la alimentación de la CPU.', eps: 'El conector EPS de la placa está vacío. El cable de 8 pines sigue en la caja de la fuente nueva, sin estrenar.', bios: 'La BIOS y la CPU son las de siempre: son compatibles.', gpu: 'La gráfica está bien asentada y su cable conectado.', ram: 'Probar la RAM no cambia el resultado: sigue en negro.', tmp: 'No se puede medir sin POST.', cam: 'Con otra fuente pasa lo mismo si sigue faltando el cable de la CPU.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'bad'], eps: ['cpu', 'bad'], bios: ['placa', 'ok'], gpu: ['grafica', 'ok'], ram: ['ram', 'ok'] }, volt: [12.04, 5.03, 3.31] },

      /* 23 · temp (grasa en la cocina) */
      { t: 'La cocina del restaurante Arrozal', s: 'En la cocina del restaurante Arrozal hay un ordenador que recibe las comandas de las mesas. Por las mañanas va bien, pero en pleno servicio de mediodía, con todos los fogones encendidos, se apaga de golpe y los cocineros pierden los pedidos.', causa: 'temp', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Falla cuando la cocina está más caliente y el ordenador más ocupado. ¿Qué crece a la vez en ese momento?', 'Hay dos sospechosos que crecen con la carga: el calor y el consumo. Mide los dos.', 'En una cocina, el aire lleva grasa. Mira cómo está el disipador por dentro.'],
        discrima: { ids: ['tmp', 'carga'], texto: 'Un apagado bajo carga puede venir de la temperatura o de una fuente que no da la potencia. Mide la temperatura de la CPU y el raíl de 12 V con el equipo en carga.' },
        explica: 'Las aletas del disipador están tapadas por una capa de grasa y polvo: la CPU llega a su límite térmico y la protección corta.',
        reparaciones: [
          { t: 'Desmontar y limpiar el disipador, reaplicar pasta y alejar el ordenador de los fogones', ok: true, res: 'Tras la limpieza, la CPU se mantiene a 70 °C en pleno servicio.' },
          { t: 'Cambiar la fuente', ok: false, res: 'El raíl de 12 V aguanta en carga: la fuente no es la causa.' },
          { t: 'Dejar la caja abierta para que respire', ok: false, res: 'Con la caja abierta entra todavía más grasa: el disipador seguirá tapado.' }
        ],
        verificaciones: [
          { t: 'Medir la temperatura de la CPU durante un servicio completo', ok: true, res: 'La CPU no pasa de 72 °C y el equipo no se apaga en todo el servicio.' },
          { t: 'Encender por la mañana y darlo por bueno', ok: false, res: 'Por la mañana nunca fallaba: hay que medir en pleno servicio.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo se apaga en las horas de más calor y más trabajo.'],
          ['Por qué', 'El aire de una cocina lleva grasa en suspensión. Se pega a las aletas del disipador y atrapa el polvo, formando una capa que impide el paso del aire. Si además el ambiente está caliente, la CPU llega a su límite térmico y la protección corta.'],
          ['Qué no puede concluir la inspección', 'La grasa es un indicio, no una medida. Sin temperatura no se sabe si es la causa, y un apagado bajo carga también encaja con una fuente justa.'],
          ['Cómo se resuelve', 'Mide la temperatura y +12 V en carga. Si la CPU llega al límite, limpia a fondo el disipador (la grasa no sale solo con aire), reaplica pasta y aleja el equipo de los fogones.'],
          ['Lección', 'El entorno también es parte del diagnóstico: una cocina, un taller o una nave ensucian el equipo mucho más rápido.']
        ],
        fallos: { tmp: 'CPU a 100 °C a mediodía, en su límite térmico (lectura simulada). La protección corta el equipo.' },
        res: { ent: 'El ordenador está en una balda encima de la zona de freír. Nunca se ha limpiado por dentro.', vis: 'Las aletas del disipador tienen una capa pegajosa de grasa y polvo. Es un indicio: falta la temperatura.', fue: 'Los raíles están en tolerancia en reposo. Eso no dice nada del comportamiento en carga.', carga: '+12 V se mantiene en 11,9 V en pleno servicio: la fuente aguanta.', min: 'Sin carga ni calor el fallo no aparece: la mínima configuración no lo reproduce.', fan: 'El ventilador del disipador está en CPU_FAN y gira, aunque se oye forzado.', tmp: 'CPU a 100 °C a mediodía, en su límite térmico (lectura simulada). La protección corta el equipo.', ram: 'La RAM supera el test: no es la causa.', gpu: 'El equipo usa la gráfica integrada: no hay tarjeta que revisar.', cam: 'Cambiar la fuente no cambia nada: sigue apagándose a mediodía.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], tmp: ['cpu', 'bad'], fan: ['cpu', 'ok'], ram: ['ram', 'ok'], cam: ['fuente', 'ok'] }, volt: [12.06, 5.01, 3.30] },

      /* 24 · temp (pasta térmica seca) */
      { t: 'El ordenador de Amparo', s: 'Amparo tiene 74 años y usa el ordenador para hacer videollamadas con sus nietos, que viven fuera. Últimamente, a los diez minutos de llamada, la imagen se vuelve lenta, el ventilador suena muchísimo y, a veces, el ordenador se apaga. Su nieto le limpió el polvo con aire comprimido el mes pasado, pero sigue igual.', causa: 'temp', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Se vuelve lento y ruidoso antes de apagarse. ¿Qué hace un procesador para protegerse cuando se calienta?', 'Hay dos sospechosos que crecen con la carga: el calor y el consumo. Mide los dos.', 'El polvo ya se quitó. Entre el procesador y el disipador hay otra cosa que también envejece.'],
        discrima: { ids: ['tmp', 'carga'], texto: 'Un apagado bajo carga puede venir de la temperatura o de una fuente que no da la potencia. Mide la temperatura de la CPU y el raíl de 12 V con el equipo en carga.' },
        explica: 'La pasta térmica tiene diez años y está seca: el calor no pasa al disipador, aunque esté limpio, y la CPU llega a su límite.',
        reparaciones: [
          { t: 'Desmontar el disipador, limpiar la pasta vieja y aplicar pasta nueva', ok: true, res: 'Con pasta nueva, la CPU baja 30 °C en la misma videollamada.' },
          { t: 'Volver a limpiar el polvo con aire comprimido', ok: false, res: 'El disipador ya está limpio: el calor no llega a él por la pasta seca.' },
          { t: 'Cambiar el ventilador por uno más potente', ok: false, res: 'El ventilador ya gira al máximo: el problema está en el contacto entre la CPU y el disipador.' }
        ],
        verificaciones: [
          { t: 'Hacer una videollamada de media hora midiendo la temperatura', ok: true, res: 'La CPU se queda en 65 °C, el ventilador apenas se oye y la llamada va fluida.' },
          { t: 'Comprobar que el ventilador gira y darlo por bueno', ok: false, res: 'Ya giraba antes: falta medir la temperatura bajo carga.' }
        ],
        explicacion: [
          ['Qué pasa', 'Con una carga moderada, el equipo se ralentiza, el ventilador se acelera al máximo y, a veces, se apaga.'],
          ['Por qué', 'La pasta térmica rellena las microirregularidades entre la CPU y el disipador. Con los años se seca y se agrieta, y el calor deja de pasar bien. La CPU baja su velocidad para protegerse (por eso va lenta) y, si no basta, la protección térmica corta.'],
          ['Qué no puede concluir la inspección', 'Un disipador limpio no demuestra que la refrigeración funcione: el fallo puede estar en el contacto, que no se ve sin desmontar.'],
          ['Cómo se resuelve', 'Mide la temperatura en carga. Si llega al límite con el disipador limpio y el ventilador al máximo, desmonta el disipador, limpia con alcohol isopropílico y aplica pasta nueva.'],
          ['Lección', 'Quitar el polvo no es todo el mantenimiento. En un equipo con muchos años, la pasta térmica también se cambia.']
        ],
        fallos: { tmp: 'CPU a 100 °C a los diez minutos de videollamada, en su límite térmico (lectura simulada). Baja su frecuencia y, a veces, la protección corta.' },
        res: { ent: 'El ordenador tiene diez años y nunca se ha desmontado el disipador. El nieto solo sopló el polvo.', vis: 'El disipador está limpio y el ventilador gira. No se ve nada raro: la pasta queda debajo.', fue: 'Los raíles están en tolerancia en reposo.', carga: '+12 V se mantiene en 11,9 V durante la videollamada: la fuente aguanta.', min: 'Sin carga el fallo no aparece.', fan: 'El ventilador está en CPU_FAN y gira al máximo: la placa intenta enfriar todo lo que puede.', tmp: 'CPU a 100 °C a los diez minutos de videollamada, en su límite térmico (lectura simulada). Baja su frecuencia y, a veces, la protección corta.', ram: 'La RAM supera el test: no es la causa.', smart: 'El disco está sano.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], tmp: ['cpu', 'bad'], fan: ['cpu', 'ok'], ram: ['ram', 'ok'], smart: ['disco', 'ok'], cam: ['fuente', 'ok'] }, volt: [12.01, 5.00, 3.30] },

      /* 25 · ventcpu (ventilador desconectado) */
      { t: 'La tienda de fotos de Elena', s: 'Elena revela e imprime fotos en su tienda. Hace unos días abrió el ordenador para quitar el polvo con una brocha. Ahora, al arrancar, aparece un mensaje en inglés que pide pulsar F1 y, cuando imprime un lote grande, el ordenador se apaga al cabo de unos minutos.', causa: 'ventcpu', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El aviso y los apagados empezaron justo después de abrir el ordenador. ¿Qué pudo moverse al limpiar?', 'Comprueba si el ventilador del disipador gira y dónde está conectado.', 'La placa vigila las RPM de la cabecera CPU_FAN. Si allí no hay nada, avisa al arrancar.'],
        discrima: { ids: ['tmp', 'fan'], texto: 'Un apagado por calor también lo produce un disipador sucio o una pasta seca. Mira las temperaturas y revisa las cabeceras de los ventiladores antes de confirmarlo.' },
        explica: 'Al limpiar, el cable del ventilador del disipador se soltó de CPU_FAN: el ventilador no gira y la CPU se calienta.',
        reparaciones: [
          { t: 'Conectar el ventilador del disipador a CPU_FAN y sujetar el cable lejos de las aspas', ok: true, res: 'El ventilador gira, la placa lee sus RPM y el aviso desaparece.' },
          { t: 'Desactivar el aviso de ventilador en la BIOS', ok: false, res: 'El aviso desaparece, pero el ventilador sigue parado y la CPU se seguirá calentando.' },
          { t: 'Cambiar la pasta térmica', ok: false, res: 'Sin ventilador, ninguna pasta basta: el disipador no tiene aire que lo enfríe.' }
        ],
        verificaciones: [
          { t: 'Arrancar sin aviso e imprimir un lote grande midiendo la temperatura', ok: true, res: 'No hay aviso y la CPU se mantiene por debajo de 75 °C durante todo el lote.' },
          { t: 'Pulsar F1 y comprobar que entra en Windows', ok: false, res: 'Eso ya pasaba antes: falta comprobar el aviso y la temperatura.' }
        ],
        explicacion: [
          ['Qué pasa', 'La placa avisa de un fallo de ventilador al arrancar y el equipo se apaga por calor en cuanto trabaja.'],
          ['Por qué', 'La placa lee las RPM de CPU_FAN al arrancar. Si lee 0, muestra un aviso (CPU Fan Error) y espera a que el usuario pulse F1. Sin ventilador, el disipador apenas disipa y la CPU llega a su límite en pocos minutos.'],
          ['Qué no puede concluir la observación', 'Que el ordenador funcione un rato no demuestra que la refrigeración esté bien: en reposo, la CPU calienta poco.'],
          ['Cómo se resuelve', 'Revisa la cabecera CPU_FAN. Conecta el ventilador del disipador, comprueba en la BIOS que lee sus RPM y sujeta el cable para que no toque las aspas.'],
          ['Lección', 'Después de abrir un equipo, aunque sea solo para limpiar, comprueba que todo ha quedado conectado.']
        ],
        fallos: { fan: 'El cable del ventilador del disipador cuelga suelto junto a CPU_FAN. El ventilador no gira y la placa lee 0 RPM.' },
        res: { ent: 'Limpió el ordenador ella misma con una brocha de pintor. Dice que «los cablecitos estaban muy juntos».', vis: 'El ventilador del disipador está quieto con el equipo encendido. Es un indicio: hay que ver por qué.', fue: 'Los raíles están en tolerancia.', carga: '+12 V se mantiene en 11,9 V en carga: la fuente aguanta.', min: 'En mínima configuración el aviso sigue apareciendo al arrancar.', fan: 'El cable del ventilador del disipador cuelga suelto junto a CPU_FAN. El ventilador no gira y la placa lee 0 RPM.', tmp: 'La CPU llega a 99 °C a los pocos minutos de imprimir (lectura simulada).', bios: 'En el monitor de hardware de la BIOS, CPU_FAN marca 0 RPM.', ram: 'La RAM supera el test: no es la causa.', cam: 'Cambiar la fuente no cambia nada: el aviso y los apagados siguen.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], tmp: ['cpu', 'bad'], fan: ['cpu', 'bad'], bios: ['placa', 'ok'], ram: ['ram', 'ok'] }, volt: [12.02, 5.01, 3.30] },

      /* 26 · ventcpu (ventilador en el hub de la caja) */
      { t: 'El montaje de Rubén', s: 'Rubén ha estrenado una caja con luces y un pequeño concentrador para ventiladores. Ha conectado todos los ventiladores, también el del procesador, a ese concentrador para tenerlo todo ordenado. Desde entonces la placa pide pulsar F1 al arrancar y, cuando juega, el ordenador va a tirones.', causa: 'ventcpu', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El aviso y los tirones empezaron a la vez, al cambiar el cableado de los ventiladores.', 'Mira la temperatura en carga y revisa en qué cabecera de la placa está el ventilador del disipador.', 'Un concentrador de la caja no sabe la temperatura de la CPU: la placa solo regula lo que está en CPU_FAN.'],
        discrima: { ids: ['tmp', 'fan'], texto: 'Un exceso de calor también lo produce un disipador sucio o una pasta seca. Mira las temperaturas y revisa las cabeceras de los ventiladores antes de confirmarlo.' },
        explica: 'El ventilador del disipador está en el concentrador de la caja, a velocidad fija: CPU_FAN está vacía y la placa no puede acelerarlo cuando la CPU se calienta.',
        reparaciones: [
          { t: 'Conectar el ventilador del disipador directamente a CPU_FAN', ok: true, res: 'La placa lee sus RPM, lo acelera con la temperatura y el aviso desaparece.' },
          { t: 'Desactivar el aviso de ventilador en la BIOS', ok: false, res: 'El aviso desaparece, pero el ventilador sigue sin regularse: los tirones continúan.' },
          { t: 'Bajar los gráficos del juego', ok: false, res: 'Así se carga menos la CPU, pero el ventilador sigue sin control: no corrige la causa.' }
        ],
        verificaciones: [
          { t: 'Arrancar sin aviso y jugar media hora midiendo la temperatura', ok: true, res: 'No hay aviso, la CPU no pasa de 78 °C y el juego va fluido.' },
          { t: 'Ver que las luces de los ventiladores funcionan', ok: false, res: 'Las luces no dicen nada de la velocidad ni de la temperatura.' }
        ],
        explicacion: [
          ['Qué pasa', 'Aviso de ventilador al arrancar y tirones en los juegos por exceso de temperatura.'],
          ['Por qué', 'Los concentradores de las cajas alimentan los ventiladores a una velocidad fija o según su propio mando. La placa solo regula el ventilador del procesador si está en CPU_FAN, porque es la cabecera que relaciona con la temperatura de la CPU. Sin él, la CPU se calienta y baja su frecuencia (throttling): de ahí los tirones.'],
          ['Qué no puede concluir la observación', 'Que el ventilador gire y se ilumine no demuestra que esté regulado: gira, pero siempre igual de lento.'],
          ['Cómo se resuelve', 'Saca el ventilador del disipador del concentrador y conéctalo a CPU_FAN. Comprueba en la BIOS que lee sus RPM y que la curva sube con la temperatura.'],
          ['Lección', 'El ventilador del procesador va siempre a CPU_FAN. El resto puede ir donde quieras.']
        ],
        fallos: { fan: 'El ventilador del disipador está en el concentrador de la caja. CPU_FAN está vacía: la placa lee 0 RPM.' },
        res: { ent: 'El concentrador venía con la caja y se maneja con un botón. Rubén lo dejó en la velocidad más silenciosa.', vis: 'Todos los ventiladores giran y se iluminan. Es una buena señal, pero no dice dónde está conectado cada uno.', fue: 'Los raíles están en tolerancia.', carga: '+12 V se mantiene estable en carga: la fuente aguanta.', min: 'En mínima configuración el aviso sigue apareciendo al arrancar.', fan: 'El ventilador del disipador está en el concentrador de la caja. CPU_FAN está vacía: la placa lee 0 RPM.', tmp: 'La CPU llega a 97 °C a los diez minutos de juego y baja su frecuencia (lectura simulada).', bios: 'La BIOS está actualizada. En el monitor de hardware, CPU_FAN marca 0 RPM.', gpu: 'La gráfica trabaja a temperatura normal.', ram: 'La RAM supera el test: no es la causa.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], tmp: ['cpu', 'bad'], fan: ['cpu', 'bad'], bios: ['placa', 'ok'], gpu: ['grafica', 'ok'], ram: ['ram', 'ok'] }, volt: [12.04, 5.02, 3.31] },

      /* 27 · bios (placa de garantía) */
      { t: 'La gestoría de Begoña', s: 'A la gestoría de Begoña le cambiaron la placa base por garantía: la tienda le dio una del mismo modelo, nueva de almacén. Al montarla con el mismo procesador de siempre, el equipo enciende, los ventiladores giran, pero no hay imagen y en la placa se enciende un LED rojo.', causa: 'bios', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Es el mismo modelo de placa y el mismo procesador. ¿Qué puede ser distinto entre una placa usada y una nueva de almacén?', 'Mira en qué LED de diagnóstico se queda la placa y qué versión de BIOS trae.', 'Una placa que lleva años en un almacén trae la BIOS con la que salió de fábrica, que puede ser anterior a tu procesador.'],
        discrima: { ids: ['eps', 'bios'], texto: 'Pantalla negra tras montar una placa también encaja con un EPS que no se ha conectado bien. Revisa el EPS y la versión de BIOS antes de confirmarlo.' },
        explica: 'La placa de garantía trae una BIOS antigua, anterior al procesador: no sabe inicializarlo, aunque la placa antigua sí lo hacía.',
        reparaciones: [
          { t: 'Actualizar la BIOS con BIOS Flashback desde un USB, sin procesador, y volver a arrancar', ok: true, res: 'Con la BIOS actualizada, la placa reconoce el procesador y arranca.' },
          { t: 'Devolver la placa por defectuosa', ok: false, res: 'La placa no se ha probado con una BIOS que soporte el procesador: devolverla no está justificado.' },
          { t: 'Cambiar el procesador', ok: false, res: 'El procesador funcionaba en la placa antigua: no está averiado.' }
        ],
        verificaciones: [
          { t: 'Arrancar, comprobar que la BIOS muestra el procesador y hacer una prueba de carga', ok: true, res: 'La BIOS muestra el procesador y el equipo es estable en carga.' },
          { t: 'Ver que la BIOS se ha actualizado y darlo por bueno', ok: false, res: 'Actualizar no demuestra nada si no se arranca con el procesador.' }
        ],
        explicacion: [
          ['Qué pasa', 'Una placa de reemplazo, del mismo modelo, no arranca con el procesador que funcionaba en la anterior.'],
          ['Por qué', 'La placa antigua se había actualizado con los años. La de almacén trae la BIOS de fábrica, sin el microcódigo del procesador. Muchas placas encienden su LED de CPU en ese caso.'],
          ['Qué no puede concluir la observación', 'Mismo modelo de placa no significa misma BIOS. Y que no arranque no demuestra que la placa nueva esté averiada.'],
          ['Cómo se resuelve', 'Consulta la lista de CPU compatibles. Si hace falta una versión más nueva, actualízala con BIOS Flashback (si la placa lo tiene) o con un procesador antiguo compatible.'],
          ['Lección', 'Una placa de recambio puede venir con una BIOS de hace años. Compruébala antes de montar el procesador.']
        ],
        fallos: { bios: 'La placa trae la BIOS de fábrica de hace cuatro años. El procesador necesita una versión posterior.' },
        res: { ent: 'La placa antigua murió por una avería del chipset. La nueva viene precintada pero la caja está algo amarillenta.', vis: 'Todo está bien montado. En la placa hay un LED rojo junto a la palabra «CPU».', fue: 'Los valores de la fuente son correctos.', carga: 'No se puede cargar el equipo: no pasa del POST.', min: 'Con la configuración mínima sigue sin imagen y con el LED de CPU encendido.', eps: 'El EPS está bien encajado: la CPU recibe +12 V.', bios: 'La placa trae la BIOS de fábrica de hace cuatro años. El procesador necesita una versión posterior.', gpu: 'El equipo usa la gráfica integrada del procesador: no hay tarjeta que revisar.', ram: 'Probar la RAM en otro slot no cambia nada.', tmp: 'No se puede medir sin POST.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'bad'], eps: ['cpu', 'ok'], bios: ['placa', 'bad'], ram: ['ram', 'ok'] }, volt: [12.02, 5.02, 3.30] },

      /* 28 · bios (placa de segunda mano) */
      { t: 'El PC por piezas de Nacho', s: 'Nacho se está montando un ordenador por piezas para ahorrar: una placa de segunda mano de un amigo y un procesador nuevo de oferta. Las dos piezas usan el mismo zócalo, según la web de la tienda. Lo ha montado todo con cuidado, pero al encender no sale imagen.', causa: 'bios', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Que el procesador quepa en el zócalo no garantiza que la placa sepa trabajar con él.', 'Busca la lista de procesadores compatibles de esa placa y desde qué versión de BIOS.', 'Una placa de segunda mano trae la BIOS que tuviera su dueño anterior. Si es antigua, el procesador nuevo no estará en la lista.'],
        discrima: { ids: ['eps', 'bios'], texto: 'Pantalla negra en un montaje nuevo también encaja con un EPS que no se ha conectado. Revisa el EPS y la versión de BIOS antes de confirmarlo.' },
        explica: 'La placa de segunda mano tiene una BIOS anterior al procesador: no lo reconoce aunque use el mismo zócalo.',
        reparaciones: [
          { t: 'Actualizar la BIOS (con BIOS Flashback o con un procesador antiguo prestado) y volver a montar el nuevo', ok: true, res: 'Con la BIOS actualizada, la placa reconoce el procesador y arranca.' },
          { t: 'Devolver el procesador por defectuoso', ok: false, res: 'El procesador no se ha probado con una BIOS que lo soporte: devolverlo no está justificado.' },
          { t: 'Reclamarle la placa al amigo por rota', ok: false, res: 'La placa funcionaba con el procesador del amigo: le falta una actualización, no está rota.' }
        ],
        verificaciones: [
          { t: 'Arrancar, comprobar que la BIOS muestra el procesador y hacer una prueba de carga', ok: true, res: 'La BIOS muestra el procesador y el equipo es estable en carga.' },
          { t: 'Ver que la BIOS se ha actualizado y darlo por bueno', ok: false, res: 'Actualizar no demuestra nada si no se arranca con el procesador nuevo.' }
        ],
        explicacion: [
          ['Qué pasa', 'Un montaje con placa de segunda mano y procesador nuevo enciende pero no pasa el POST.'],
          ['Por qué', 'Un zócalo puede servir para varias generaciones de procesadores, pero la placa necesita una BIOS que conozca cada modelo. Si la BIOS es anterior al procesador, la placa no puede inicializarlo.'],
          ['Qué no puede concluir la observación', 'Mismo zócalo no significa compatible, y que no arranque no demuestra que el procesador o la placa estén averiados.'],
          ['Cómo se resuelve', 'Consulta la lista de CPU de la placa. Actualiza la BIOS con BIOS Flashback desde un USB o con un procesador antiguo compatible, y después monta el nuevo.'],
          ['Lección', 'Al comprar una placa usada, pregunta por la versión de BIOS antes de elegir el procesador.']
        ],
        fallos: { bios: 'La placa tiene una BIOS de hace cinco años. El procesador necesita una versión bastante posterior.' },
        res: { ent: 'El amigo usaba la placa con un procesador de hace varias generaciones y nunca actualizó la BIOS.', vis: 'El disipador está bien montado. En la placa hay un LED rojo junto a la palabra «CPU».', fue: 'Los valores de la fuente son correctos.', carga: 'No se puede cargar el equipo: no pasa del POST.', min: 'Con la configuración mínima sigue sin imagen y con el LED de CPU encendido.', eps: 'El EPS está bien encajado: la CPU recibe +12 V.', bios: 'La placa tiene una BIOS de hace cinco años. El procesador necesita una versión bastante posterior.', gpu: 'La gráfica está bien asentada y su cable conectado.', ram: 'Probar la RAM en otro slot no cambia nada.', tmp: 'No se puede medir sin POST.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'bad'], eps: ['cpu', 'ok'], bios: ['placa', 'bad'], gpu: ['grafica', 'ok'], ram: ['ram', 'ok'] }, volt: [12.03, 5.01, 3.31] },

      /* 29 · pila (casa rural) */
      { t: 'La casa rural Os Teixos', s: 'La casa rural Os Teixos cierra de enero a marzo y, al cerrar, desenchufan todo. Al volver a abrir, el ordenador de reservas arranca con la fecha de hace muchos años, las webs dicen que la conexión no es segura y el programa de reservas no deja entrar.', causa: 'pila', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El fallo aparece después de meses sin corriente. ¿Qué guarda la placa cuando está desenchufada?', 'Las webs comprueban la fecha para validar sus certificados. Si la fecha del equipo está mal, desconfían de todas.', 'La hora de la placa la mantiene una pila de botón. Mídela con el equipo desenchufado.'],
        discrima: { ids: ['pila'], texto: 'La fecha también se pierde si alguien ha movido el jumper de borrado de la BIOS. Mide la pila antes de confirmarlo.' },
        explica: 'La pila CR2032 se ha agotado durante el cierre: sin corriente, la placa pierde la fecha y las webs rechazan sus certificados.',
        reparaciones: [
          { t: 'Cambiar la pila CR2032 y ajustar fecha y hora en la BIOS', ok: true, res: 'Con la pila nueva y la fecha correcta, las webs y el programa vuelven a funcionar.' },
          { t: 'Reinstalar el navegador y el programa de reservas', ok: false, res: 'El problema es la fecha del equipo: con la pila gastada volverá a perderla.' },
          { t: 'Desactivar la comprobación de certificados del navegador', ok: false, res: 'Eso deja el equipo expuesto a webs falsas y no corrige la fecha.' }
        ],
        verificaciones: [
          { t: 'Dejar el equipo desenchufado varias horas y comprobar la fecha al arrancar', ok: true, res: 'Tras horas sin corriente, la fecha y la hora son correctas.' },
          { t: 'Poner la hora en Windows sin desenchufar y darlo por bueno', ok: false, res: 'Así no se prueba la pila: el fallo aparece al quitar la corriente.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras meses desenchufado, el equipo arranca con una fecha muy antigua y las conexiones seguras fallan.'],
          ['Por qué', 'Con el equipo enchufado, +5 VSB mantiene el reloj de la placa. Sin corriente, solo la pila CR2032 lo hace. Si se agota, el reloj vuelve a la fecha de fábrica. Los certificados de las webs tienen fecha de validez: con una fecha errónea, el navegador los da por inválidos.'],
          ['Qué no puede concluir la observación', 'Una fecha errónea no demuestra que la pila esté gastada: un jumper de borrado mal puesto produce lo mismo. La medición lo confirma.'],
          ['Cómo se resuelve', 'Mide la pila con el equipo desenchufado. Si está baja, cámbiala por otra CR2032 y ajusta fecha, hora y orden de arranque en la BIOS.'],
          ['Lección', 'Si un equipo pasa mucho tiempo desenchufado, la pila trabaja sola. Cuando falla, todo lo que depende de la fecha falla con ella.']
        ],
        fallos: { pila: 'La pila marca 1,9 V con el equipo desenchufado: está agotada.' },
        res: { ent: 'El equipo tiene nueve años. Este es el primer invierno en que, al volver, pasa esto.', vis: 'La placa está limpia. La pila está en su sitio y el jumper de borrado, en su posición normal.', fue: 'Los raíles están en tolerancia y +5 VSB está presente.', min: 'En mínima configuración arranca igual, con la misma fecha errónea.', ram: 'La RAM supera el test: no es la causa.', bios: 'Al entrar en la BIOS, la fecha es la de fábrica y todos los ajustes están por defecto.', pila: 'La pila marca 1,9 V con el equipo desenchufado: está agotada.', sata: 'El disco se detecta bien y arranca Windows.', smart: 'El disco está sano.', tmp: 'Temperaturas normales.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], pila: ['placa', 'bad'], ram: ['ram', 'ok'], sata: ['disco', 'ok'], smart: ['disco', 'ok'], tmp: ['cpu', 'ok'] }, volt: [12.00, 5.02, 3.30] },

      /* 30 · pila (se pierde el modo SATA) */
      { t: 'El taller mecánico de Fermín', s: 'En el taller de Fermín, los viernes cortan la luz general al cerrar. Algunos lunes, el ordenador del despacho muestra una pantalla azul con el mensaje «INACCESSIBLE_BOOT_DEVICE» y no entra en Windows. Fermín ha aprendido que, si toca «algo de la BIOS» que le enseñó un sobrino, vuelve a funcionar.', causa: 'pila', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Solo pasa tras cortar la luz el fin de semana, y se arregla tocando la BIOS. ¿Qué le pasa a la BIOS sin corriente?', 'Si la BIOS vuelve a sus valores de fábrica, ajustes como el modo de los discos pueden cambiar y Windows deja de encontrar el suyo.', 'Mide la pila de botón con el equipo desenchufado.'],
        discrima: { ids: ['pila'], texto: 'Que la BIOS vuelva a los valores de fábrica también lo provoca el jumper de borrado. Mide la pila antes de confirmarlo.' },
        explica: 'La pila CR2032 está agotada: sin corriente, la BIOS vuelve a sus valores de fábrica, cambia el modo de los discos y Windows no encuentra el suyo.',
        reparaciones: [
          { t: 'Cambiar la pila CR2032 y dejar configurado el modo de discos correcto en la BIOS', ok: true, res: 'Con la pila nueva, la BIOS conserva su configuración y Windows arranca.' },
          { t: 'Reinstalar Windows en el modo de fábrica de la BIOS', ok: false, res: 'Se pierden los datos y el problema vuelve: cualquier otro ajuste se seguirá perdiendo.' },
          { t: 'Cambiar el disco', ok: false, res: 'El disco está sano: lo que cambia es cómo lo presenta la BIOS.' }
        ],
        verificaciones: [
          { t: 'Desenchufar el equipo una noche y comprobar que arranca Windows', ok: true, res: 'Tras una noche sin corriente, la configuración se mantiene y Windows arranca.' },
          { t: 'Reiniciar sin desenchufar y darlo por bueno', ok: false, res: 'Con el equipo enchufado, la BIOS no depende de la pila: así no se prueba.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras un fin de semana sin luz, Windows no encuentra el disco de arranque.'],
          ['Por qué', 'La configuración de la BIOS se guarda en una memoria que, sin corriente, mantiene la pila. Si se agota, la BIOS vuelve a los valores de fábrica. Si Windows se instaló con otro modo de disco (por ejemplo, RAID en lugar de AHCI), al cambiarlo deja de encontrar su disco.'],
          ['Qué no puede concluir la observación', 'Que la BIOS se reinicie no demuestra que la pila esté gastada: el jumper de borrado hace lo mismo. Y la pantalla azul no indica un disco averiado.'],
          ['Cómo se resuelve', 'Mide la pila desenchufada. Si está baja, cámbiala y configura de nuevo la BIOS: modo de discos, orden de arranque, fecha y hora.'],
          ['Lección', 'Un fallo que aparece tras quitar la corriente y se arregla tocando la BIOS apunta a la pila.']
        ],
        fallos: { pila: 'La pila marca 2,0 V con el equipo desenchufado: está agotada.' },
        res: { ent: 'Pasa desde hace un par de meses. El sobrino le enseñó a cambiar en la BIOS una opción de los discos de «AHCI» a «RAID».', vis: 'La placa está limpia y no se ve nada raro. El jumper de borrado está en su posición normal.', fue: 'Los raíles están en tolerancia y +5 VSB está presente.', min: 'En mínima configuración sale la misma pantalla azul.', ram: 'La RAM supera el test: no es la causa.', bios: 'La BIOS tiene todos sus valores por defecto: la fecha es antigua y el modo de discos está en AHCI.', pila: 'La pila marca 2,0 V con el equipo desenchufado: está agotada.', sata: 'Los cables del disco están bien.', smart: 'El disco está sano.', tmp: 'Temperaturas normales.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], pila: ['placa', 'bad'], ram: ['ram', 'ok'], sata: ['disco', 'ok'], smart: ['disco', 'ok'], tmp: ['cpu', 'ok'] }, volt: [12.02, 5.01, 3.31] },

      /* 31 · condens (arranque en frío) */
      { t: 'La imprenta Gráficas Soto', s: 'En la imprenta Gráficas Soto, el ordenador que controla la guillotina tarda cada vez más en arrancar por las mañanas. Hay que pulsar el botón tres o cuatro veces: se enciende, se apaga, vuelve a intentarlo. Una vez arranca, funciona todo el día sin problemas. En invierno es peor.', causa: 'condens', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El fallo depende de la temperatura del ambiente, no de la carga. ¿Qué componentes cambian su comportamiento con el frío?', 'Mide la fuente y después mira con atención la placa, sobre todo alrededor del procesador.', 'Los condensadores electrolíticos gastados pierden capacidad, y en frío todavía más. Su parte superior debe ser plana.'],
        discrima: { ids: ['fue', 'vis'], texto: 'Un arranque que falla en frío también lo provoca una fuente envejecida. Mide la fuente e inspecciona la placa antes de confirmarlo.' },
        explica: 'Varios condensadores de la placa están hinchados: en frío pierden aún más capacidad y la tensión de la CPU no se estabiliza hasta que se calientan.',
        reparaciones: [
          { t: 'Sustituir la placa base por una compatible (o repararla en un servicio de electrónica)', ok: true, res: 'Con la placa nueva, el equipo arranca a la primera también en las mañanas frías.' },
          { t: 'Dejar el ordenador encendido toda la noche', ok: false, res: 'Así se evita el arranque en frío, pero los condensadores seguirán degradándose hasta fallar del todo.' },
          { t: 'Cambiar la fuente', ok: false, res: 'La fuente da tensiones correctas: el fallo está en los condensadores de la placa.' }
        ],
        verificaciones: [
          { t: 'Arrancar el equipo en frío varias mañanas seguidas', ok: true, res: 'Arranca a la primera todas las mañanas.' },
          { t: 'Arrancar a mediodía, con el taller caliente, y darlo por bueno', ok: false, res: 'A mediodía nunca fallaba: hay que probar en frío.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo necesita varios intentos para arrancar en frío; una vez caliente, funciona bien.'],
          ['Por qué', 'Los condensadores electrolíticos degradados tienen menos capacidad y más resistencia interna, y con el frío empeoran. Al arrancar, la tensión que el VRM da a la CPU oscila y la placa aborta el arranque. Al calentarse, mejoran lo justo para funcionar.'],
          ['Qué no puede concluir la medición', 'Unos raíles correctos en la fuente no dicen nada de la tensión que llega a la CPU después del VRM.'],
          ['Cómo se resuelve', 'Mide la fuente y revisa los condensadores. Si hay alguno abombado o con restos, sustituye la placa o repárala en un servicio especializado.'],
          ['Lección', 'Un fallo que depende de la temperatura ambiente apunta a componentes que envejecen, como los condensadores.']
        ],
        fallos: { vis: 'Alrededor del zócalo de la CPU hay tres condensadores con la parte superior abombada.' },
        res: { ent: 'El ordenador tiene doce años. Está en una nave sin calefacción y por la noche se apaga.', vis: 'Alrededor del zócalo de la CPU hay tres condensadores con la parte superior abombada.', fue: 'Los raíles están en tolerancia, también en el primer arranque de la mañana.', carga: '+12 V se mantiene estable en carga: la fuente no es el problema.', min: 'En mínima configuración también necesita varios intentos en frío.', ram: 'La RAM supera el test: no es la causa.', tmp: 'La CPU está a 40 °C en reposo: no hay ningún problema de temperatura.', smart: 'El disco está sano.', cam: 'Con otra fuente sigue necesitando varios intentos en frío.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], vis: ['placa', 'bad'], ram: ['ram', 'ok'], tmp: ['cpu', 'ok'], smart: ['disco', 'ok'], cam: ['fuente', 'ok'] }, volt: [12.03, 5.02, 3.30] },

      /* 32 · sata (desaparece el disco de datos) */
      { t: 'La tienda de música de Bruno', s: 'Bruno tiene una tienda de instrumentos y guarda las grabaciones de sus alumnos en el ordenador. Ayer le quitó el polvo con aire comprimido. Hoy Windows arranca con normalidad, pero la unidad D:, donde están todas las grabaciones, ha desaparecido.', causa: 'sata', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Windows arranca, así que el disco del sistema funciona. Lo que falta es el segundo disco.', 'Entra en la BIOS y mira qué unidades detecta. Un disco necesita dos cables para funcionar.', 'El chorro de aire comprimido puede mover cables. Revisa el cable de datos en los dos extremos.'],
        discrima: { ids: ['sata'], texto: 'Un cable de datos suelto y un disco averiado dan el mismo síntoma. Revisa el cable de datos antes de confirmarlo.' },
        explica: 'El aire comprimido soltó el cable de datos del segundo disco: tiene alimentación, pero la placa no lo ve.',
        reparaciones: [
          { t: 'Recolocar el cable de datos en el disco y en la placa', ok: true, res: 'Con el cable bien asentado, la unidad D: vuelve a aparecer con todas las grabaciones.' },
          { t: 'Formatear el disco desde la administración de discos', ok: false, res: 'El disco ni siquiera aparece y, si apareciera, formatearlo borraría las grabaciones.' },
          { t: 'Sustituir el disco', ok: false, res: 'Un disco nuevo tampoco aparecería con el cable suelto, y Bruno perdería las grabaciones.' }
        ],
        verificaciones: [
          { t: 'Reiniciar, comprobar que la BIOS ve el disco y abrir varias grabaciones', ok: true, res: 'La BIOS ve los dos discos y las grabaciones se abren sin problema.' },
          { t: 'Ver que Windows arranca y darlo por bueno', ok: false, res: 'Windows ya arrancaba antes: falta comprobar la unidad D:.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras una limpieza, un disco secundario desaparece mientras el sistema funciona con normalidad.'],
          ['Por qué', 'Cada disco SATA tiene su propio cable de datos de 7 pines hacia la placa. Los conectores SATA se sujetan solo por fricción o con un clip pequeño, y un chorro de aire o un roce pueden sacarlos a medias.'],
          ['Qué no puede concluir la inspección', 'A simple vista el cable parece en su sitio: medio fuera es casi igual que dentro. Hay que recolocarlo y comprobarlo.'],
          ['Cómo se resuelve', 'Mira en la BIOS qué discos aparecen. Recoloca el cable de datos en los dos extremos y, si hace falta, cambia de puerto o de cable.'],
          ['Lección', 'Si un disco desaparece justo después de abrir el equipo, revisa sus cables antes de pensar en una avería.']
        ],
        fallos: { sata: 'El cable de datos del segundo disco está medio fuera del puerto de la placa. Al encajarlo, el disco aparece.' },
        res: { ent: 'Usó un bote de aire comprimido de cerca y con fuerza. El disco D: es un disco duro de 2 TB.', vis: 'Los cables de los dos discos parecen conectados. Una inspección no confirma ninguno.', fue: 'Los raíles están en tolerancia. Eso no prueba que el disco reciba datos.', sata: 'El cable de datos del segundo disco está medio fuera del puerto de la placa. Al encajarlo, el disco aparece.', smart: 'Solo se puede leer el SMART del disco del sistema: el segundo no aparece.', min: 'La mínima configuración pasa el POST: la placa, la CPU y la RAM no son el problema.', ram: 'La RAM no tiene nada que ver con un disco que no aparece.', bios: 'La BIOS solo detecta el SSD del sistema. El disco de 2 TB no aparece en la lista.', cam: 'Cambiar la fuente no tiene sentido: el resto del equipo funciona.' },
        luz: { fue: ['fuente', 'ok'], sata: ['disco', 'bad'], min: ['cpu', 'ok'], ram: ['ram', 'ok'], bios: ['placa', 'ok'] }, volt: [12.01, 5.00, 3.30] },

      /* 33 · sata (errores CRC de un cable dañado) */
      { t: 'La biblioteca de Valdecarros', s: 'En la biblioteca municipal de Valdecarros, el ordenador del catálogo se queda congelado unos segundos varias veces al día y, de vez en cuando, Windows avisa de que hay que reparar el disco. La bibliotecaria teme que el disco esté a punto de morir, porque no tienen copia del catálogo.', causa: 'sata', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Los congelones y los avisos apuntan al disco, pero entre el disco y la placa hay otra pieza.', 'El SMART no solo cuenta sectores dañados: también cuenta los errores de transmisión por el cable.', 'Si el disco tiene la superficie sana pero hay muchos errores de transmisión, el sospechoso es el cable de datos.'],
        discrima: { ids: ['sata', 'smart'], texto: 'Congelones al leer también los provoca un disco con sectores dañados. Lee el SMART y revisa el cable antes de confirmarlo.' },
        explica: 'El cable de datos SATA está dañado y no encaja bien: los datos llegan con errores y el disco tiene que repetir las transferencias.',
        reparaciones: [
          { t: 'Sustituir el cable de datos SATA por uno nuevo con clip', ok: true, res: 'Con el cable nuevo, el contador de errores CRC deja de subir y los congelones desaparecen.' },
          { t: 'Sustituir el disco', ok: false, res: 'El disco está sano: con el mismo cable, uno nuevo tendría los mismos errores.' },
          { t: 'Formatear y reinstalar Windows', ok: false, res: 'Borraría el catálogo y no corrige el cable.' }
        ],
        verificaciones: [
          { t: 'Usar el equipo un día y comprobar que el contador CRC del SMART no sube', ok: true, res: 'El contador CRC se mantiene igual y no hay ningún congelón.' },
          { t: 'Arrancar Windows y darlo por bueno', ok: false, res: 'Los congelones eran unas pocas veces al día: un arranque no demuestra nada.' }
        ],
        explicacion: [
          ['Qué pasa', 'Congelones breves y avisos de disco, aunque la superficie del disco está sana.'],
          ['Por qué', 'Cada transferencia entre el disco y la placa lleva un código de comprobación (CRC). Si un cable dañado o mal encajado corrompe los datos, el disco detecta el error y repite la transferencia: de ahí los congelones. El SMART cuenta esos errores en UDMA_CRC_Error_Count.'],
          ['Qué no puede concluir la observación', 'Los congelones y los avisos de Windows no demuestran que el disco esté mal. El SMART separa un fallo de superficie (sectores reasignados) de uno de transmisión (errores CRC).'],
          ['Cómo se resuelve', 'Lee el SMART. Si los sectores están bien y los errores CRC suben, sustituye el cable de datos por uno con clip y comprueba que el contador deja de crecer.'],
          ['Lección', 'No todos los fallos de disco son del disco. Lee el SMART completo antes de cambiar nada.']
        ],
        fallos: { sata: 'El cable de datos no tiene clip, está doblado en ángulo y se sale con solo tocarlo.' },
        res: { ent: 'El ordenador tiene seis años. El año pasado lo abrieron para añadir una grabadora de DVD y usaron un cable que había por la biblioteca.', vis: 'Los cables del disco parecen conectados. Una inspección no confirma su estado.', fue: 'Los raíles están en tolerancia.', carga: '+12 V se mantiene estable en carga.', sata: 'El cable de datos no tiene clip, está doblado en ángulo y se sale con solo tocarlo.', smart: 'SMART: 0 sectores reasignados y 0 pendientes, pero el contador de errores CRC marca 1.284 y sigue subiendo. La superficie está sana; los errores vienen de la transmisión.', min: 'En mínima configuración los congelones siguen al leer del disco.', ram: 'La RAM supera el test: no es la causa.', tmp: 'Temperaturas normales.', bios: 'La BIOS detecta el disco sin problemas.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], smart: ['disco', 'ok'], sata: ['disco', 'bad'], ram: ['ram', 'ok'], tmp: ['cpu', 'ok'], bios: ['placa', 'ok'] }, volt: [12.00, 5.01, 3.29] },

      /* 34 · disco (archivos que se corrompen) */
      { t: 'El estudio de fotografía de Inés', s: 'Inés es fotógrafa de bodas. Desde hace unas semanas, algunas fotos de las sesiones aparecen con franjas grises o no se abren, el ordenador tarda mucho en copiar las tarjetas y el disco hace un ruido de clic que antes no hacía. Esta semana entrega tres reportajes.', causa: 'disco', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El equipo arranca y la BIOS ve todo: el problema aparece al leer y escribir datos concretos.', 'Antes de tocar nada, piensa en lo que más importa a Inés: las fotos de los clientes.', 'Los discos llevan un registro de su propia salud (SMART). Los sectores reasignados y pendientes indican una superficie dañada.'],
        discrima: { ids: ['sata', 'smart'], texto: 'Errores al leer también los provoca un cable SATA en mal estado. Revisa el cable y lee el SMART antes de confirmarlo.' },
        explica: 'El disco tiene cada vez más sectores dañados: los datos que caen en ellos se corrompen. Hay que salvar las fotos antes de que falle del todo.',
        reparaciones: [
          { t: 'Copiar las fotos cuanto antes a otro disco y sustituir el disco dañado', ok: true, res: 'Con las fotos copiadas en un disco nuevo, el equipo va fluido y las fotos nuevas se guardan bien.' },
          { t: 'Pasar un desfragmentador para que vaya más rápido', ok: false, res: 'Desfragmentar obliga al disco a leer y escribir sin parar: con sectores dañados, acelera su fallo.' },
          { t: 'Borrar las fotos dañadas y seguir usando el disco', ok: false, res: 'Los sectores dañados siguen creciendo: las siguientes sesiones también se corromperán.' }
        ],
        verificaciones: [
          { t: 'Leer el SMART del disco nuevo y abrir las fotos copiadas', ok: true, res: 'El disco nuevo está sano y las fotos copiadas se abren bien.' },
          { t: 'Ver que Windows arranca y darlo por bueno', ok: false, res: 'Que arranque no demuestra que las fotos estén a salvo ni que el disco nuevo esté sano.' }
        ],
        explicacion: [
          ['Qué pasa', 'Archivos corruptos, copias lentas y clics: el disco no consigue leer ni escribir bien algunos sectores.'],
          ['Por qué', 'Si la superficie de un disco mecánico se daña, los sectores afectados dejan de guardar bien los datos. El disco reintenta (de ahí la lentitud), reasigna los que puede y el SMART lo cuenta. Los clics suelen ser el cabezal reintentando.'],
          ['Qué no puede concluir la observación', 'Las fotos corruptas y la lentitud también pueden venir de un cable en mal estado. El SMART demuestra el daño físico.'],
          ['Cómo se resuelve', 'Revisa el cable y lee el SMART. Si hay sectores dañados, copia los datos lo primero, sin someter al disco a esfuerzos, y después sustitúyelo.'],
          ['Lección', 'Con un disco que falla, los datos van primero. Y una sola copia de algo importante no es una copia.']
        ],
        fallos: { smart: 'SMART: 856 sectores reasignados y 64 pendientes, y subiendo. La superficie del disco está dañándose.' },
        res: { ent: 'El disco es de 2015 y guarda todas las sesiones. Inés no tiene copia de seguridad «porque nunca le había fallado».', vis: 'Nada raro a simple vista. El disco es mecánico, de 3,5".', fue: 'Los raíles están en tolerancia.', carga: '+12 V se mantiene estable en carga.', min: 'En mínima configuración el disco sigue igual de lento al copiar.', ram: 'La RAM supera el test: no es la causa.', sata: 'Los dos cables del disco están bien asentados. Con otro cable de datos, el disco sigue igual.', smart: 'SMART: 856 sectores reasignados y 64 pendientes, y subiendo. La superficie del disco está dañándose.', tmp: 'Temperaturas normales.', bios: 'La BIOS detecta el disco sin problemas.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], sata: ['disco', 'ok'], smart: ['disco', 'bad'], ram: ['ram', 'ok'], tmp: ['cpu', 'ok'] }, volt: [12.02, 5.00, 3.30] },

      /* 35 · disco (aviso SMART al arrancar) */
      { t: 'El centro de mayores de San Blas', s: 'En el centro de mayores de San Blas, el ordenador de la sala de informática muestra al arrancar un mensaje en inglés que habla de «S.M.A.R.T.» y pide pulsar F1. Los voluntarios lo pulsan cada día y el equipo arranca, aunque últimamente Windows va muy lento y los cursos tardan en abrirse.', causa: 'disco', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El propio mensaje del arranque nombra un sistema de vigilancia. ¿De qué pieza es ese sistema?', 'Lee el SMART completo y revisa los cables del disco.', 'Si el disco avisa de que está fallando, lo primero es salvar lo que tiene.'],
        discrima: { ids: ['sata', 'smart'], texto: 'La lentitud también la provoca un cable SATA en mal estado. Revisa el cable y lee el SMART antes de confirmarlo.' },
        explica: 'El propio disco avisa por SMART de que está fallando: tiene sectores dañados y cada vez más.',
        reparaciones: [
          { t: 'Hacer una copia de los datos y sustituir el disco', ok: true, res: 'Con el disco nuevo no hay aviso al arrancar y el equipo va fluido.' },
          { t: 'Desactivar el aviso SMART en la BIOS', ok: false, res: 'El aviso desaparece, pero el disco sigue fallando: un día no arrancará.' },
          { t: 'Reinstalar Windows en el mismo disco', ok: false, res: 'Un sistema nuevo sobre un disco dañado se corromperá igual.' }
        ],
        verificaciones: [
          { t: 'Arrancar sin aviso y leer el SMART del disco nuevo', ok: true, res: 'No hay aviso al arrancar y el SMART del disco nuevo está limpio.' },
          { t: 'Pulsar F1 y comprobar que entra en Windows', ok: false, res: 'Eso ya pasaba antes: el aviso sigue ahí.' }
        ],
        explicacion: [
          ['Qué pasa', 'La BIOS avisa al arrancar de que el SMART del disco indica un fallo inminente y el sistema va muy lento.'],
          ['Por qué', 'El SMART compara sus contadores con unos umbrales del fabricante. Si un valor, como los sectores reasignados, supera su umbral, el disco se declara a punto de fallar y la BIOS avisa («SMART Status BAD, Backup and Replace»).'],
          ['Qué no puede concluir la observación', 'Que el equipo siga arrancando no significa que el disco esté bien: el aviso existe precisamente para avisar antes del fallo total.'],
          ['Cómo se resuelve', 'Revisa el cable, lee el SMART y, si confirma el fallo, copia los datos y sustituye el disco. Nunca se desactiva el aviso.'],
          ['Lección', 'Un aviso que se acepta cada día con F1 sigue siendo un aviso. Léelo antes de pulsar.']
        ],
        fallos: { smart: 'SMART: estado «BAD». 2.310 sectores reasignados, por encima del umbral del fabricante.' },
        res: { ent: 'El aviso sale desde hace meses. Los voluntarios pensaban que era normal.', vis: 'Nada raro a simple vista. El disco es mecánico y tiene ocho años.', fue: 'Los raíles están en tolerancia.', carga: '+12 V se mantiene estable en carga.', min: 'En mínima configuración el aviso sigue saliendo al arrancar.', ram: 'La RAM supera el test: no es la causa.', sata: 'Los dos cables del disco están bien asentados. Con otro cable, el aviso sigue.', smart: 'SMART: estado «BAD». 2.310 sectores reasignados, por encima del umbral del fabricante.', tmp: 'Temperaturas normales.', bios: 'La BIOS detecta el disco, pero muestra su estado SMART como «BAD».', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], sata: ['disco', 'ok'], smart: ['disco', 'bad'], ram: ['ram', 'ok'], tmp: ['cpu', 'ok'] }, volt: [12.01, 5.02, 3.31] },

      /* 36 · pcie (conector 6+2 a medias) */
      { t: 'El salón de Adrián', s: 'Adrián ha cambiado la gráfica de su ordenador por una más potente que compró de segunda mano. Ha seguido un tutorial, ha conectado el cable de la fuente y todo parecía en su sitio. Al encender, los ventiladores giran pero la tele, que usa como monitor, dice «Sin señal».', causa: 'pcie', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Lo último que cambió fue la gráfica. Empieza por lo que ella necesita para funcionar.', 'Las gráficas potentes llevan conectores de 6 u 8 pines desde la fuente. Míralos de cerca.', 'El conector de 8 pines de muchas fuentes viene partido en 6 + 2. Comprueba que están las dos partes.'],
        discrima: { ids: ['gpu'], texto: 'Pantalla negra con ventiladores también encaja con una CPU sin EPS o una RAM que no arranca. Revisa la gráfica y sus cables antes de confirmarlo.' },
        explica: 'La gráfica pide 8 pines y Adrián solo conectó la parte de 6 del conector 6+2: la tarjeta no recibe toda su alimentación.',
        reparaciones: [
          { t: 'Encajar también los 2 pines que faltan del conector 6+2', ok: true, res: 'Con los 8 pines conectados, la gráfica inicializa y da imagen.' },
          { t: 'Reclamar la gráfica al vendedor por defectuosa', ok: false, res: 'La gráfica no se ha probado con su alimentación completa: reclamarla no está justificado.' },
          { t: 'Cambiar el cable HDMI de la tele', ok: false, res: 'El cable no tiene nada que ver: la gráfica ni siquiera arranca.' }
        ],
        verificaciones: [
          { t: 'Arrancar, comprobar imagen y que el sistema reconoce la gráfica', ok: true, res: 'Sale imagen y el sistema reconoce la gráfica nueva.' },
          { t: 'Ver que los ventiladores de la gráfica giran y darlo por bueno', ok: false, res: 'Que giren no demuestra que dé imagen: falta arrancar y comprobarlo.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras cambiar la gráfica, el equipo enciende pero no da imagen.'],
          ['Por qué', 'Muchas fuentes llevan conectores PCIe «6+2» para servir a gráficas de 6 y de 8 pines. Si la gráfica pide 8 y solo se encajan 6, la tarjeta detecta que le falta alimentación y no inicializa. Muchas placas encienden su LED «VGA».'],
          ['Qué no puede concluir la observación', 'Que haya un cable conectado no demuestra que esté completo: los 2 pines sueltos quedan escondidos junto al conector.'],
          ['Cómo se resuelve', 'Apaga, encaja las dos piezas del conector 6+2 juntas en la gráfica y comprueba que el clip cierra.'],
          ['Lección', 'Cuenta los pines: un conector de 8 que solo tiene 6 encajados es un conector sin conectar.']
        ],
        fallos: { gpu: 'El conector de la gráfica tiene 8 pines, pero solo están encajados 6. La pieza de 2 pines cuelga suelta junto a la tarjeta.' },
        res: { ent: 'La gráfica antigua llevaba un conector de 6 pines. La nueva, según el vendedor, «funcionaba perfecta».', vis: 'Hay un cable conectado a la gráfica y un LED «VGA» encendido en la placa. Es un indicio: hay que comprobar el conector.', fue: 'Los valores de la fuente son correctos.', carga: 'No se puede cargar el equipo: no hay imagen.', min: 'La placa pasa el POST sin la gráfica, pero esta CPU no tiene gráficos integrados: no hay imagen.', eps: 'El EPS está bien conectado y la CPU tiene tensión.', ram: 'La RAM está bien asentada y no cambia el resultado.', gpu: 'El conector de la gráfica tiene 8 pines, pero solo están encajados 6. La pieza de 2 pines cuelga suelta junto a la tarjeta.', bios: 'La CPU figura en la lista de compatibles de la BIOS instalada.', tmp: 'No se puede medir sin imagen.', cam: 'Con otra fuente sigue igual si el conector se queda a medias.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'ok'], eps: ['cpu', 'ok'], ram: ['ram', 'ok'], gpu: ['grafica', 'bad'], bios: ['placa', 'ok'] }, volt: [12.04, 5.01, 3.30] },

      /* 37 · pcie (conector medio fuera, falla en carga) */
      { t: 'La productora Fotograma', s: 'En la productora Fotograma han cambiado de oficina y han llevado los ordenadores en una furgoneta. El equipo de edición arranca y funciona, pero al exportar un vídeo la pantalla se va a negro, los ventiladores de la gráfica se ponen al máximo y hay que reiniciar a mano.', causa: 'pcie', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['La pantalla se va justo cuando la gráfica trabaja más. ¿Qué necesita ella más en ese momento?', 'Un apagón de la gráfica en carga puede venir de la fuente o de su propio cable. Mide +12 V en carga y revisa la tarjeta.', 'Tras un viaje con baches, comprueba que los conectores de la gráfica están encajados hasta el clip.'],
        discrima: { ids: ['carga', 'gpu'], texto: 'Que la gráfica se caiga en carga también encaja con una fuente sin potencia. Mide +12 V en carga y revisa la gráfica antes de confirmarlo.' },
        explica: 'Con los baches, el conector PCIe de 8 pines de la gráfica se salió a medias: en carga, los pocos contactos que tocan no bastan y la tarjeta se cae.',
        reparaciones: [
          { t: 'Encajar el conector PCIe hasta el clip y revisar que no hay pines quemados', ok: true, res: 'Con el conector bien encajado, la exportación termina sin pantallazos negros.' },
          { t: 'Cambiar la fuente por una más potente', ok: false, res: 'El raíl de 12 V aguanta bien en carga: la fuente no es la causa.' },
          { t: 'Reinstalar el programa de edición', ok: false, res: 'El fallo es eléctrico: el programa no tiene la culpa.' }
        ],
        verificaciones: [
          { t: 'Exportar un vídeo largo completo', ok: true, res: 'La exportación termina y la imagen no se corta en ningún momento.' },
          { t: 'Abrir el programa de edición y darlo por bueno', ok: false, res: 'Sin exportar no se carga la gráfica: el fallo aparecía en carga.' }
        ],
        explicacion: [
          ['Qué pasa', 'La gráfica pierde la imagen en carga y sus ventiladores se aceleran al máximo.'],
          ['Por qué', 'Un conector PCIe medio fuera hace contacto solo en parte de sus pines. En reposo la tarjeta consume poco y funciona; en carga necesita mucha corriente y esos contactos no bastan. La tarjeta se protege, pierde la imagen y sus ventiladores se ponen al máximo. Un contacto malo, además, se calienta.'],
          ['Qué no puede concluir la observación', 'Que el equipo funcione en reposo no demuestra que la gráfica esté bien alimentada. Y que se caiga en carga tampoco demuestra que falte potencia en la fuente: la medida de +12 V lo separa.'],
          ['Cómo se resuelve', 'Mide +12 V en carga. Si aguanta, revisa el conector de la gráfica: encájalo hasta el clip y comprueba que los pines no están ennegrecidos.'],
          ['Lección', 'Después de un traslado, revisa los conectores grandes: los baches los aflojan aunque desde fuera no se note.']
        ],
        fallos: { gpu: 'El conector PCIe de 8 pines está medio fuera y su clip no está encajado. Al empujarlo, hace clic.' },
        res: { ent: 'La torre fue tumbada en la furgoneta, sin sujetar. Antes de la mudanza no había pasado nunca.', vis: 'La gráfica parece bien montada. Desde arriba no se ve si el conector está encajado del todo.', fue: 'Los raíles están en tolerancia en reposo.', carga: '+12 V se mantiene en 11,9 V con la CPU al máximo: la fuente aguanta.', min: 'Sin carga el fallo no aparece.', eps: 'El EPS está bien conectado.', ram: 'La RAM supera el test: no es la causa.', gpu: 'El conector PCIe de 8 pines está medio fuera y su clip no está encajado. Al empujarlo, hace clic.', tmp: 'La CPU y la gráfica están a temperaturas normales antes de que se vaya la imagen.', fan: 'Todos los ventiladores están bien conectados.', cam: 'Con otra fuente pasa lo mismo: la imagen se va al exportar.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], eps: ['cpu', 'ok'], ram: ['ram', 'ok'], gpu: ['grafica', 'bad'], tmp: ['cpu', 'ok'] }, volt: [12.03, 5.02, 3.31] },

      /* 38 · fpanel (cable del botón pellizcado) */
      { t: 'La clínica dental Sonrisas', s: 'En la clínica dental Sonrisas acaban de cambiar los muebles de recepción. Desde entonces, el ordenador de la recepción se enciende al pulsar el botón, pero se apaga solo a los cuatro segundos, siempre a los cuatro segundos, sin llegar a mostrar nada.', causa: 'fpanel', senales: { ps: 5.0, sb: 5.0 },
        pistas: ['Cuatro segundos exactos, siempre. ¿Qué pasa en cualquier ordenador si mantienes pulsado el botón de encendido?', 'Comprueba que la fuente está en espera y revisa el cableado del panel frontal.', 'Si el cable del botón está pellizcado y en corto, la placa cree que el botón sigue pulsado. Prueba a arrancar puenteando los pines con el cable desconectado.'],
        discrima: { ids: ['fue', 'panel'], texto: 'Un equipo que se apaga solo también encaja con una fuente que se protege. Comprueba la fuente y revisa el panel frontal antes de confirmarlo.' },
        explica: 'El cable del botón de encendido quedó pellizcado al mover los muebles y está en corto: la placa ve el botón pulsado todo el rato y apaga a los cuatro segundos.',
        reparaciones: [
          { t: 'Sustituir el cable del botón dañado y conectarlo a PWR_SW según el manual', ok: true, res: 'Con el cable nuevo, el equipo enciende y se mantiene encendido.' },
          { t: 'Cambiar la fuente', ok: false, res: 'La fuente funciona: el equipo arranca y se mantiene con el botón desconectado.' },
          { t: 'Desconectar el botón y encender siempre con un destornillador', ok: false, res: 'Eso no es una reparación: en una clínica nadie debería abrir el ordenador para encenderlo.' }
        ],
        verificaciones: [
          { t: 'Encender con el botón de la caja, esperar un minuto y apagar con el botón', ok: true, res: 'El equipo enciende, se mantiene encendido y se apaga al pulsar.' },
          { t: 'Comprobar que con el cable desconectado no se apaga', ok: false, res: 'Así se confirma el diagnóstico, no la reparación: el botón de la caja sigue sin probarse.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo arranca y se apaga a los cuatro segundos, siempre igual.'],
          ['Por qué', 'Si se mantiene pulsado el botón de encendido unos cuatro segundos, la placa fuerza el apagado. Un cable pellizcado puede pelarse y poner en contacto sus dos hilos: para la placa, es como si el botón no se soltara nunca.'],
          ['Qué no puede concluir la observación', 'Que el equipo se apague no demuestra que la fuente se esté protegiendo: un corto en la placa corta al instante, no a los cuatro segundos exactos.'],
          ['Cómo se resuelve', 'Desconecta el cable del botón y arranca puenteando PWR_SW un instante. Si el equipo se mantiene encendido, revisa el cable del botón y sustitúyelo.'],
          ['Lección', 'Un tiempo exacto es una pista. Cuatro segundos son el apagado forzado del botón.']
        ],
        fallos: { panel: 'El cable del botón está pelado donde lo pisó el mueble y sus dos hilos se tocan. Desconectado, y puenteando PWR_SW un instante, el equipo arranca y se mantiene encendido.' },
        res: { ent: 'Al cambiar los muebles arrastraron la torre contra la pared. Antes funcionaba perfectamente.', vis: 'Desde fuera no se ve nada. Por dentro, el mazo de cables del frontal está aplastado contra la chapa. Es un indicio: hay que probar el botón.', fue: 'Con el equipo apagado: +5 VSB presente y PS_ON# en alto. Al encender, los raíles suben bien hasta que se corta a los cuatro segundos.', min: 'En mínima configuración se apaga igual, a los cuatro segundos.', banco: 'Fuera de la caja, sin el cable del botón y puenteando PWR_SW un instante, la placa arranca y se mantiene encendida.', panel: 'El cable del botón está pelado donde lo pisó el mueble y sus dos hilos se tocan. Desconectado, y puenteando PWR_SW un instante, el equipo arranca y se mantiene encendido.', ram: 'No se puede probar la RAM: el equipo se apaga antes.', eps: 'El EPS está bien conectado.', tmp: 'No se puede medir: el equipo se apaga antes.', cam: 'Con otra fuente pasa lo mismo: a los cuatro segundos se apaga.' },
        luz: { fue: ['fuente', 'ok'], banco: ['placa', 'ok'], panel: ['caja', 'bad'], cam: ['fuente', 'ok'] }, volt: [0, 0, 0] },

      /* 39 · fpanel (botones cruzados) */
      { t: 'La autoescuela Ceda el Paso', s: 'En la autoescuela Ceda el Paso cambiaron la caja del ordenador de los test porque se le rompió el frontal. Ahora el botón grande no hace nada, pero la profesora ha descubierto que, si pulsa el botoncito pequeño de al lado, el ordenador se enciende. Y si lo pulsa con el ordenador encendido, se apaga de golpe.', causa: 'fpanel', senales: { ps: 5.0, sb: 5.0 },
        pistas: ['Los dos botones hacen algo, pero no lo que deberían. ¿Qué tienen en común dentro de la caja?', 'Cada botón del frontal llega a la placa por un cable fino a un par de pines concreto del F_PANEL.', 'Comprueba qué cable está en PWR_SW y cuál en RESET. Puede que estén cruzados.'],
        discrima: { ids: ['fue', 'panel'], texto: 'Un botón que no hace nada también encaja con una fuente muerta. Comprueba que la fuente da +5 VSB y revisa el panel frontal antes de confirmarlo.' },
        explica: 'Los cables del botón de encendido y del reset están cruzados en el F_PANEL: cada botón hace la función del otro.',
        reparaciones: [
          { t: 'Colocar cada cable del panel frontal en sus pines según el manual', ok: true, res: 'El botón grande enciende y el pequeño reinicia, como debe ser.' },
          { t: 'Poner una pegatina en el botón pequeño que diga «Encender»', ok: false, res: 'Así el reset sigue apagando el equipo de golpe: el cableado sigue mal.' },
          { t: 'Cambiar la fuente', ok: false, res: 'La fuente funciona: el equipo enciende con el otro botón.' }
        ],
        verificaciones: [
          { t: 'Probar el botón de encendido, el de reset y los LED de la caja', ok: true, res: 'El encendido enciende, el reset reinicia y los LED funcionan.' },
          { t: 'Comprobar solo que el botón grande enciende', ok: false, res: 'Falta probar el reset y los LED: el cableado del frontal tiene varios cables.' }
        ],
        explicacion: [
          ['Qué pasa', 'El botón de encendido no hace nada y el de reset enciende y apaga el equipo.'],
          ['Por qué', 'Los dos botones son interruptores iguales: solo cierran un contacto. La placa decide qué hacer según los pines donde llegue. Con los cables cruzados, el reset llega a PWR_SW (enciende y, con el equipo encendido, lo apaga) y el botón grande llega a RESET, que con el equipo apagado no hace nada.'],
          ['Qué no puede concluir la observación', 'Que el botón grande no haga nada no significa que la fuente o la placa estén mal: el equipo enciende con el otro botón.'],
          ['Cómo se resuelve', 'Consulta el esquema del F_PANEL en el manual y coloca cada cable en su par de pines. Solo los LED tienen polaridad.'],
          ['Lección', 'En un cambio de caja, los cables del frontal se conectan con el manual delante, no de memoria.']
        ],
        fallos: { panel: 'El cable «POWER SW» está en los pines de RESET y el cable «RESET SW» en los de PWR_SW.' },
        res: { ent: 'La caja la cambió el marido de la profesora. Dice que los cablecitos «eran iguales y había que ponerlos en algún sitio».', vis: 'Hay varios cables finos conectados en la esquina inferior de la placa. A simple vista no se sabe cuál va a dónde.', fue: 'Con el equipo apagado: +5 VSB presente y PS_ON# en alto. La fuente está en espera, lista para arrancar.', min: 'En mínima configuración pasa igual: el botón grande no hace nada.', banco: 'Fuera de la caja, puenteando los pines PWR_SW, la placa arranca.', panel: 'El cable «POWER SW» está en los pines de RESET y el cable «RESET SW» en los de PWR_SW.', ram: 'La RAM supera el test cuando el equipo arranca: no es la causa.', eps: 'El EPS está bien conectado.', tmp: 'Temperaturas normales cuando arranca.', cam: 'Con otra fuente pasa exactamente lo mismo.' },
        luz: { fue: ['fuente', 'ok'], banco: ['placa', 'ok'], panel: ['caja', 'bad'], cam: ['fuente', 'ok'] }, volt: [0, 0, 0] },

      /* 40 · corto (tornillo suelto bajo la placa) */
      { t: 'La floristería de Amaia', s: 'Amaia cambió hace poco el disco de su ordenador con ayuda de un vídeo. Al cerrar la caja oyó algo moverse dentro, pero el equipo funcionó. Esta mañana, al mover la torre para barrer, se apagó de golpe. Ahora, al pulsar el botón, los ventiladores dan medio giro y todo se apaga.', causa: 'corto', senales: { ps: 5.0, sb: 5.0 },
        pistas: ['La fuente arranca un instante y se corta: parece una protección actuando, no una fuente muerta.', 'Prueba la fuente sola. Si funciona, el problema está en lo que tiene conectado.', 'Algo se movía dentro de la caja. Saca la placa y pruébala fuera, sobre una superficie aislante.'],
        discrima: { ids: ['min', 'banco'], texto: 'Un arranque que se corta al instante puede ser la fuente o algo en corto. Prueba la fuente sola y luego la placa fuera de la caja antes de confirmarlo.' },
        explica: 'Un tornillo suelto del cambio de disco quedó atrapado entre la placa y la chapa: al mover la torre tocó unas pistas y provoca un cortocircuito.',
        reparaciones: [
          { t: 'Sacar la placa, retirar el tornillo suelto y volver a montarla', ok: true, res: 'Sin el tornillo, la placa arranca dentro de la caja.' },
          { t: 'Cambiar la fuente', ok: false, res: 'La fuente sola funciona perfectamente: se está protegiendo de un corto.' },
          { t: 'Cambiar el disco nuevo por el antiguo', ok: false, res: 'El disco no provoca el corto: el problema es el tornillo que quedó suelto.' }
        ],
        verificaciones: [
          { t: 'Arrancar con la placa en la caja, mover la torre y medir los raíles', ok: true, res: 'Arranca de forma estable, aguanta al mover la torre y los raíles están en tolerancia.' },
          { t: 'Dejar la placa funcionando fuera de la caja', ok: false, res: 'Fuera de la caja no se ha comprobado la corrección: el montaje sigue sin terminar.' }
        ],
        explicacion: [
          ['Qué pasa', 'Al pulsar el botón, todo arranca un instante y se apaga: la fuente detecta un cortocircuito y se protege.'],
          ['Por qué', 'Un objeto metálico suelto, como un tornillo, puede quedar entre el dorso de la placa y la chapa. Si toca dos pistas o una pista y masa, provoca un corto. La fuente detecta el exceso de corriente y corta (protección SCP). Al mover la torre, el tornillo cambió de sitio.'],
          ['Qué no puede concluir la medición', 'Que los raíles queden a 0 V tras el intento no demuestra que la fuente esté mal: una fuente en protección también da 0 V.'],
          ['Cómo se resuelve', 'Prueba la fuente sola y la placa fuera de la caja. Si fuera arranca, busca objetos sueltos bajo la placa y revisa los separadores.'],
          ['Lección', 'Si al cerrar la caja algo suena suelto, no se cierra: se busca. Un tornillo perdido acaba haciendo un corto.']
        ],
        fallos: { banco: 'Al sacar la placa cae un tornillo pequeño. Fuera de la caja, sobre una superficie aislante, la placa arranca sin problemas.' },
        res: { ent: 'Al cambiar el disco se le cayó un tornillo dentro de la caja y no lo encontró. Pensó que «ya saldría».', vis: 'Desde arriba no se ve nada raro: lo que hay debajo de la placa no se ve sin sacarla.', fue: 'Tras el intento los raíles están a 0 V. +5 VSB está presente: la fuente está en protección o averiada. Hay que separarla de la placa.', carga: 'No se puede medir en carga: el equipo no se mantiene encendido.', min: 'Fuente sola, sin placa y con PS_ON# puenteado a masa: arranca y da +12 V, +5 V y +3,3 V en tolerancia. La fuente funciona.', banco: 'Al sacar la placa cae un tornillo pequeño. Fuera de la caja, sobre una superficie aislante, la placa arranca sin problemas.', panel: 'El cableado del panel frontal es correcto: el botón llega a la placa.', sata: 'El disco nuevo está bien conectado.', ram: 'No se puede probar la RAM: el equipo no se mantiene encendido.', eps: 'El EPS está bien conectado.', tmp: 'No se puede medir: el equipo no se mantiene encendido.', cam: 'Con otra fuente pasa exactamente lo mismo: medio giro y se apaga.' },
        luz: { fue: ['fuente', 'bad'], min: ['fuente', 'ok'], banco: ['caja', 'bad'], panel: ['caja', 'ok'], cam: ['fuente', 'ok'] }, volt: [0, 0, 0] }
    ]
  }
});
