/* Tema: averías en la placa base.
   Todo el contenido de este tema vive aquí. El motor (js/motor.js) no sabe nada de placas.
   Coordenadas de zonas: en píxeles de la imagen (ancho × alto de foto), formato [x, y, ancho, alto].
   Cada caso sigue el orden: pruebas → diagnóstico (confirmado solo tras las pruebas discriminantes) → reparación → verificación. */
window.TEMAS = window.TEMAS || [];
window.TEMAS.push({
  id: 'placa-base',
  titulo: 'Averías en la placa base',
  resumen: 'Cada partida te asigna cinco avisos al azar entre quince clientes distintos. Diagnostícalos siguiendo el orden de la S12 y localiza cada conector en una placa real.',

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

  /* Simulador. Hay 15 casos; cada partida saca «porRonda» al azar y en orden aleatorio (ver motor.js).
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
      { t: 'El regalo de Hugo', s: 'A Hugo le han regalado por su cumpleaños una pieza nueva para el ordenador y su tío se la montó el domingo. Desde entonces, al encender, la torre se ilumina y los ventiladores giran, pero el monitor se queda en «Sin señal». Hugo jura que no ha tocado nada más.', causa: 'pcie', senales: { ps: 0.2, sb: 5.0 },
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
        res: { ent: 'El regalo es una tarjeta gráfica bastante potente. El tío de Hugo dice que «encajó a la primera» y que le sobró un cable.', vis: 'Hay un cable de la fuente sin conectar junto a la gráfica. Es un indicio: hay que comprobar a dónde va.', fue: 'Los valores de la fuente son correctos.', carga: 'No se puede cargar el equipo: no hay imagen.', min: 'Sin la gráfica no hay salida de vídeo: esta CPU no tiene gráficos integrados. La placa sí pasa el POST sin ella.', eps: 'El EPS está bien conectado y la CPU tiene tensión.', ram: 'La RAM está bien asentada y no cambia el resultado.', gpu: 'La gráfica está bien encajada, pero su conector de 8 pines está vacío. El cable PCIe de la fuente cuelga suelto.', bios: 'La CPU figura en la lista de compatibles de la BIOS instalada.', tmp: 'No se puede medir sin imagen.', cam: 'Con otra fuente sigue igual: el problema no es la fuente.' },
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
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], min: ['ram', 'bad'], ram: ['ram', 'bad'], reenc: ['ram', 'bad'], tmp: ['cpu', 'ok'], smart: ['disco', 'ok'], sata: ['disco', 'ok'] }, volt: [12.01, 5.00, 3.30] }
    ]
  }
});
