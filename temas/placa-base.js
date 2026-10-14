/* Tema: averías en la placa base.
   Todo el contenido de este tema vive aquí. El motor (js/motor.js) no sabe nada de placas.
   Coordenadas de zonas: en píxeles de la imagen (ancho × alto de foto), formato [x, y, ancho, alto].
   Cada caso sigue el orden: pruebas → diagnóstico (confirmado solo tras las pruebas discriminantes) → reparación → verificación. */
window.TEMAS = window.TEMAS || [];
window.TEMAS.push({
  id: 'placa-base',
  titulo: 'Averías en la placa base',
  resumen: 'Diagnostica, localiza y repara averías en la placa base siguiendo el orden de la S12 y demuestra tu habilidad como técnico.',

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
      condens: 'placa', sata: 'disco', disco: 'disco', pcie: 'grafica', fpanel: 'caja', corto: 'caja',
      interruptor: 'fuente', xmp: 'ram', arranque: 'placa', carriles: 'disco', gpuranura: 'grafica', gpucalor: 'grafica',
      video: 'grafica', atx: 'caja'
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
      corto: 'Cortocircuito entre la placa y la caja',
      interruptor: 'Fuente apagada desde su interruptor trasero',
      xmp: 'Memoria forzada con un perfil XMP inestable',
      arranque: 'Orden de arranque incorrecto en la BIOS',
      carriles: 'Puerto SATA desactivado por la ranura M.2',
      gpuranura: 'Gráfica mal asentada en su ranura',
      gpucalor: 'Gráfica sobrecalentada (ventiladores o pasta)',
      video: 'Monitor conectado a la salida de vídeo de la placa',
      atx: 'Conector ATX de 24 pines mal encajado'
    },
    acciones: [
      ['ent', 'Preguntar al cliente', 'Qué pasó antes del fallo y qué se ha tocado.'],
      ['vis', 'Inspección visual', 'Cables, conectores y componentes a simple vista.'],
      ['fue', 'Medir +12 V, +5 V y +3,3 V', 'Lee los raíles y las tensiones de espera.'],
      ['carga', 'Medir +12 V con el equipo en carga', 'Lectura del raíl de 12 V mientras se fuerza la CPU y la gráfica.'],
      ['min', 'Mínima configuración, o fuente sola sin placa', 'Quita lo accesorio y prueba solo lo imprescindible.'],
      ['banco', 'Probar la placa fuera de la caja', 'Placa sobre una superficie aislante, con lo mínimo para arrancar.'],
      ['atx', 'Revisar el conector ATX de 24 pines', 'Comprueba que el conector grande de la placa esté enganchado y sin pines quemados.'],
      ['panel', 'Revisar el panel frontal (F_PANEL)', 'Cables del botón, reset y LED; puenteo de los pines de encendido.'],
      ['tmp', 'Ver temperaturas', 'Temperatura de la CPU bajo carga.'],
      ['fan', 'Revisar las cabeceras de ventiladores', 'Dónde está conectado cada ventilador y si gira.'],
      ['ram', 'Probar la RAM en otro slot', 'Desconecta la RAM y colócala en otro slot de la placa base.'],
      ['reenc', 'Reencajar módulo y repetir prueba', 'Equipo apagado y desenchufado. Vuelve a colocar el módulo y repite el arranque.'],
      ['eps', 'Revisar el conector EPS', 'Comprueba que el conector de 8 pines de la CPU esté bien encajado.'],
      ['defecto', 'Cargar los valores por defecto de la BIOS', 'Deshace perfiles de memoria y overclocks, y repite la prueba.'],
      ['bios', 'Comprobar la versión de BIOS', 'Versión instalada y lista de CPU compatibles del fabricante.'],
      ['boot', 'Revisar el orden de arranque', 'Qué unidad intenta arrancar primero la BIOS.'],
      ['pila', 'Medir la pila de la BIOS', 'Tensión de la pila de botón CR2032.'],
      ['gpu', 'Revisar la tarjeta gráfica', 'Asentamiento, alimentación PCIe, ventiladores y temperatura.'],
      ['video', 'Revisar la salida de vídeo', 'A qué conector va el monitor y en qué estado está el cable.'],
      ['sata', 'Revisar el cable SATA', 'Cable de datos y cable de alimentación del disco.'],
      ['smart', 'Leer el SMART del disco', 'Contadores de salud del disco: sectores reasignados y pendientes.'],
      ['manual', 'Consultar el manual de la placa', 'Puertos y ranuras que comparten recursos, y limitaciones de la placa.'],
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
      /* 16 · interruptor */
      { t: 'La biblioteca municipal', s: 'La biblioteca ha cambiado los muebles de la sala de ordenadores durante el puente. El martes, uno de los cuatro equipos de consulta no da ninguna señal de vida: ni luces, ni ventiladores, ni ruido. La bibliotecaria ya ha probado otro enchufe de la pared y sigue igual.', causa: 'interruptor', senales: { ps: 5.0, sb: 0.0 },
        pistas: ['Nada responde y no hay tensión de espera: antes de pensar en averías, piensa en todo lo que tiene que pasar para que la fuente reciba corriente.', 'Entre la pared y la fuente hay más de un punto donde la corriente se puede cortar.', 'Mira la parte trasera de la fuente con el equipo girado: no todo lo que corta la corriente está dentro de la caja.'],
        discrima: { ids: ['fue', 'vis'], texto: 'Sin +5 VSB la fuente puede estar averiada o simplemente no recibir corriente. Mide y mira la parte trasera del equipo antes de confirmarlo.' },
        explica: 'El interruptor trasero de la fuente está en «O»: al mover el mueble, alguien lo pulsó sin darse cuenta.',
        reparaciones: [
          { t: 'Poner el interruptor trasero de la fuente en «I» y arrancar', ok: true, res: 'Con el interruptor en «I» aparece +5 VSB y el equipo enciende al pulsar el botón.' },
          { t: 'Sustituir la fuente', ok: false, res: 'La fuente no está averiada: solo estaba apagada desde su propio interruptor.' },
          { t: 'Cambiar el cable de alimentación', ok: false, res: 'El cable funciona: con el interruptor en «O» ningún cable haría arrancar el equipo.' }
        ],
        verificaciones: [
          { t: 'Encender, comprobar el arranque y medir +5 VSB', ok: true, res: 'Hay +5 VSB y el equipo arranca con normalidad.' },
          { t: 'Ver que el interruptor está en «I» y darlo por bueno', ok: false, res: 'Falta comprobar que el equipo arranca de verdad.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo no da ninguna señal de vida, ni siquiera tensión de espera.'],
          ['Por qué', 'Casi todas las fuentes ATX llevan un interruptor de red en la parte trasera. En «O» la fuente queda desconectada de la red: no hay +5 VSB y el botón de la caja no puede hacer nada.'],
          ['Qué no puede concluir la medición', '0 V en todo, incluido +5 VSB, encaja tanto con una fuente averiada como con una fuente que no recibe corriente.'],
          ['Cómo se resuelve', 'Antes de desmontar nada, comprueba toda la cadena: enchufe, regleta, cable e interruptor trasero de la fuente.'],
          ['Lección', 'Empieza siempre por lo más simple. Un interruptor apagado no se mide: se mira.']
        ],
        fallos: { vis: 'El interruptor trasero de la fuente está en «O». El mueble nuevo queda justo a la altura de la fuente.' },
        res: { ent: 'Los de la mudanza movieron todas las torres para pasar cables nuevos. Los otros tres equipos funcionan con el mismo tipo de enchufe.', vis: 'El interruptor trasero de la fuente está en «O». El mueble nuevo queda justo a la altura de la fuente.', fue: 'Sin tensión en ningún raíl ni en +5 VSB. Eso no distingue una fuente averiada de una que no recibe corriente.', min: 'La fuente sola tampoco da tensión. Antes de darla por muerta, comprueba que le llega la red.', panel: 'Puentear los pines de encendido no sirve: no hay tensión de espera.', ram: 'Sin tensión no hay nada que probar.', tmp: 'No se puede medir: el equipo no arranca.', cam: 'Con una fuente de prueba arranca, pero la original, con su interruptor en «I», también arranca: no estaba averiada.' },
        luz: { fue: ['fuente', 'bad'], vis: ['fuente', 'bad'] }, volt: [0, 0, 0] },

      /* 17 · fuente */
      { t: 'La peña ciclista El Pedal', s: 'En el local de la peña ciclista hay un ordenador viejo para las inscripciones de las carreras. Ayer, mientras imprimían los dorsales, se oyó un chasquido seco que venía de debajo de la mesa y olió a quemado unos segundos. Desde entonces el ordenador no hace absolutamente nada.', causa: 'fuente', senales: { ps: 5.0, sb: 0.0 },
        pistas: ['Un chasquido y olor a quemado indican que un componente ha fallado de golpe. ¿Cuál es el que más energía maneja?', 'Mide la fuente, incluida la tensión de espera. Si no hay nada, falta saber si la culpa es suya o de algo conectado a ella.', 'Prueba la fuente sola, sin la placa: si tampoco da tensión, no hace falta buscar más.'],
        discrima: { ids: ['fue', 'min'], texto: 'Sin tensión en ningún raíl, la fuente puede estar averiada o protegerse de un corto en la placa. Prueba la fuente sola antes de confirmarlo.' },
        explica: 'La fuente se ha averiado: un condensador de su interior reventó. Sin +5 VSB el equipo no puede arrancar.',
        reparaciones: [
          { t: 'Sustituir la fuente por otra de calidad y potencia adecuadas', ok: true, res: 'Con la fuente nueva el equipo arranca y los raíles están en tolerancia.' },
          { t: 'Abrir la fuente y cambiar el condensador', ok: false, res: 'Una fuente guarda tensiones peligrosas incluso desenchufada. En el aula no se abren: se sustituyen.' },
          { t: 'Cambiar la placa base', ok: false, res: 'La fuente sola no da tensión: la placa no es la causa.' }
        ],
        verificaciones: [
          { t: 'Encender y medir los tres raíles con el equipo en carga', ok: true, res: 'Los raíles se mantienen en tolerancia y el equipo arranca.' },
          { t: 'Comprobar que el ventilador de la fuente gira y darlo por bueno', ok: false, res: 'Que gire el ventilador no demuestra que los raíles estén bien.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras un chasquido y olor a quemado, el equipo no da señales de vida.'],
          ['Por qué', 'Los condensadores de entrada de una fuente se degradan con el calor y el polvo. Cuando uno revienta, la fuente deja de funcionar, a menudo con un chasquido y olor característico.'],
          ['Qué no puede concluir la medición', '0 V en los raíles no dice si la fuente está muerta o protegiéndose de un corto. Solo la prueba de la fuente sola lo separa.'],
          ['Cómo se resuelve', 'Mide, prueba la fuente sola y, si no da tensión, sustitúyela. Nunca abras una fuente: sus condensadores pueden mantener carga peligrosa.'],
          ['Lección', 'Olor a quemado no basta para culpar a una pieza: confírmalo midiendo y aislando.']
        ],
        res: { ent: 'El ordenador tiene más de diez años y está en el suelo, junto a la puerta del almacén. Nunca se ha limpiado.', vis: 'Huele a quemado cerca de la fuente y la rejilla de su ventilador está llena de pelusa. Es un indicio, no una prueba.', fue: 'Sin tensión en ningún raíl ni en +5 VSB. Hay que separar la fuente de un posible corto en la placa.', min: 'Fuente sola, sin placa y con PS_ON# puenteado a masa: no da tensión. La fuente está averiada.', panel: 'Puentear los pines de encendido no sirve: no hay tensión de espera.', banco: 'Fuera de la caja la placa tampoco da señales: sin fuente funcional no se puede probar.', ram: 'Sin tensión no hay nada que probar.', tmp: 'No se puede medir: el equipo no arranca.', cam: 'Con una fuente de prueba la placa arranca. La original estaba averiada.' },
        luz: { fue: ['fuente', 'bad'], min: ['fuente', 'bad'], cam: ['fuente', 'ok'] }, volt: [0, 0, 0] },

      /* 18 · ram (mal asentada) */
      { t: 'La autoescuela Vía Libre', s: 'La autoescuela se ha trasladado a un local más grande y los ordenadores viajaron en una furgoneta. El de la sala de teórica, donde los alumnos hacen los test, no arranca: la pantalla se queda en negro y la placa emite una serie de pitidos que se repite una y otra vez.', causa: 'ram', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['La placa pita, así que recibe alimentación y ejecuta el POST. Busca qué comprueba la placa en sus primeros segundos.', 'Prueba la memoria en otro slot y reencájala con el equipo apagado.', 'El resultado del reencaje decide si hay que comprar algo o no.'],
        discrima: { ids: ['ram', 'reenc'], exige: { ram: 'fallo', reenc: 'sin_fallo' }, texto: 'Un módulo defectuoso y uno mal asentado dan el mismo síntoma. Pruébalo en otro slot y reencájalo antes de confirmarlo.' },
        explica: 'El módulo se movió con las vibraciones del viaje y no hacía buen contacto. Al reencajarlo, la placa arranca.',
        reparaciones: [
          { t: 'Reencajar el módulo hasta el fondo y verificar', ok: true, requiere: { reenc: 'sin_fallo' }, res: 'Con el módulo bien asentado, la placa arranca sin pitidos.', noJustificada: 'El reencaje no ha resuelto el fallo: el módulo está defectuoso.' },
          { t: 'Sustituir el módulo por otro compatible', ok: true, requiere: { reenc: 'fallo' }, res: 'Con el módulo nuevo la placa arranca.', noJustificada: 'El reencaje ya resolvió el fallo: comprar otro módulo no está justificado.' },
          { t: 'Cambiar la placa base', ok: false, res: 'El fallo se resolvió en el módulo: la placa no tiene la culpa.' }
        ],
        verificaciones: [
          { t: 'Arrancar y comprobar en la BIOS que se detecta toda la memoria', ok: true, res: 'Sin pitidos y con toda la memoria detectada.' },
          { t: 'Dar la reparación por buena sin arrancar', ok: false, res: 'Sin arrancar no hay verificación.' }
        ],
        explicacion: [
          ['Qué pasa', 'Pitidos repetidos y pantalla negra: la placa no consigue inicializar la memoria.'],
          ['Por qué', 'Los contactos del módulo deben apoyar en todos los pines del slot. Las vibraciones de un transporte pueden levantar el módulo una fracción de milímetro, suficiente para que falle.'],
          ['Qué no puede concluir la prueba en otro slot', 'Que falle en cualquier slot no demuestra que el módulo esté roto: un encaje defectuoso falla igual. El reencaje lo separa.'],
          ['Cómo se resuelve', 'Equipo apagado y desenchufado: saca el módulo, revisa los contactos, vuelve a colocarlo hasta que cierren los dos clips y arranca.'],
          ['Lección', 'Después de un transporte, reencaja antes de sustituir. Muchas averías son solo contactos.']
        ],
        fallos: { ram: 'Con el módulo en otro slot, la placa sigue pitando.' },
        res: { ent: 'La furgoneta era de un amigo y las torres iban de pie, sin sujetar. Antes del traslado funcionaba bien.', vis: 'A simple vista el módulo parece en su sitio. Una inspección no confirma el encaje.', fue: 'Los valores de la fuente son correctos.', min: 'Con lo mínimo sigue pitando: el fallo está en la memoria.', ram: 'Con el módulo en otro slot, la placa sigue pitando.', reenc: 'Con el equipo apagado reencajas el módulo hasta oír los dos clips. Al arrancar, la placa ya no pita.', eps: 'El EPS está bien conectado.', gpu: 'La gráfica está bien asentada.', tmp: 'No se puede medir sin POST.', cam: 'Cambiar la fuente no altera los pitidos.' },
        luz: { fue: ['fuente', 'ok'], min: ['ram', 'bad'], ram: ['ram', 'bad'], reenc: ['ram', 'ok'], eps: ['cpu', 'ok'], gpu: ['grafica', 'ok'] }, volt: [12.03, 5.01, 3.30] },

      /* 19 · temp */
      { t: 'El restaurante La Brasa', s: 'En la cocina del restaurante hay un ordenador que recibe las comandas de los camareros. Por la mañana va perfecto, pero en plena hora de comidas, con todos los fogones encendidos, se apaga sin avisar y el jefe de cocina tiene que gritar los platos a la antigua.', causa: 'temp', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Funciona por la mañana y falla a la hora de más trabajo y más calor. Piensa en qué cambia a esa hora.', 'Dos causas encajan con un apagado en los momentos de más esfuerzo: el calor y la potencia. Mide las dos.', 'Una cocina deja en el aire grasa y vapor. Mira cómo está el disipador.'],
        discrima: { ids: ['tmp', 'carga'], texto: 'Un apagado en los momentos de más trabajo puede ser calor o potencia. Mide la temperatura y el raíl de 12 V en carga antes de confirmarlo.' },
        explica: 'El disipador está cubierto de grasa y polvo, y la cocina está muy caliente: la CPU llega a su límite térmico y la protección apaga el equipo.',
        reparaciones: [
          { t: 'Limpiar disipador y ventiladores, cambiar la pasta y alejar el equipo de los fogones', ok: true, res: 'Limpio y lejos del calor, el equipo aguanta todo el servicio.' },
          { t: 'Cambiar la fuente', ok: false, res: 'El raíl de 12 V aguanta la carga: la fuente no es la causa.' },
          { t: 'Programar el equipo para que se reinicie solo', ok: false, res: 'Reiniciar no enfría la CPU: seguirá apagándose.' }
        ],
        verificaciones: [
          { t: 'Medir la temperatura de la CPU durante un servicio completo', ok: true, res: 'La CPU no pasa de 75 °C en todo el servicio.' },
          { t: 'Probarlo por la mañana y darlo por bueno', ok: false, res: 'Por la mañana nunca fallaba: hay que probar en las condiciones del fallo.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo se apaga cuando el ambiente está más caliente y el equipo más ocupado.'],
          ['Por qué', 'Un disipador cubierto de grasa no evacua el calor, y con aire caliente a su alrededor todavía menos. La CPU llega a su temperatura máxima y la protección corta.'],
          ['Qué no puede concluir la inspección', 'La grasa es un indicio. Solo la temperatura medida y un raíl de 12 V estable en carga confirman que es calor y no potencia.'],
          ['Cómo se resuelve', 'Limpia el disipador y los ventiladores, cambia la pasta térmica y busca una ubicación con aire más fresco o una caja con filtros.'],
          ['Lección', 'El entorno también cuenta: un equipo en una cocina, un taller o un almacén necesita más mantenimiento.']
        ],
        res: { ent: 'El ordenador está en una balda encima de la campana extractora. Nunca se ha abierto.', vis: 'El disipador tiene una capa pegajosa de grasa y polvo. Es un indicio: falta medir la temperatura.', fue: 'Los raíles están en tolerancia en reposo.', carga: '+12 V se mantiene en 11,9 V en carga: la fuente aguanta.', min: 'Sin carga ni calor el fallo no aparece.', tmp: 'En plena hora de comidas la CPU llega a 100 °C, su límite térmico (lectura simulada).', fan: 'El ventilador del disipador está en CPU_FAN y gira, aunque frenado por la grasa.', ram: 'La RAM supera el test.', gpu: 'El equipo usa los gráficos integrados del procesador.', cam: 'Con otra fuente sigue apagándose igual.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], tmp: ['cpu', 'bad'], ram: ['ram', 'ok'], cam: ['fuente', 'ok'] }, volt: [12.05, 5.01, 3.30] },

      /* 20 · disco */
      { t: 'El estudio de arquitectura Lienzo', s: 'En un estudio de arquitectura pequeño, el ordenador de la delineante tarda cada vez más en guardar los planos. Esta semana un archivo de un proyecto importante se abrió con partes en blanco y Windows ha mostrado un aviso sobre «un problema con el disco». El equipo tiene un SSD de hace seis años.', causa: 'disco', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Los archivos dañados y la lentitud al guardar apuntan a donde se guardan los datos, no a la CPU ni a la memoria.', 'Antes de cambiar nada, piensa en cómo proteger los planos del proyecto.', 'Los SSD también llevan SMART: indica su desgaste y los bloques que ya no puede usar.'],
        discrima: { ids: ['sata', 'smart'], texto: 'Errores al guardar también los provoca un cable SATA defectuoso. Revisa el cable y lee el SMART antes de confirmarlo.' },
        explica: 'El SSD ha agotado su vida útil: el SMART marca el desgaste al máximo y bloques defectuosos.',
        reparaciones: [
          { t: 'Copiar los planos ya y sustituir el SSD por uno nuevo', ok: true, res: 'Con el SSD nuevo el equipo guarda al instante y los archivos se abren completos.' },
          { t: 'Formatear el SSD y reinstalar', ok: false, res: 'Formatear no recupera un SSD gastado y borra los planos.' },
          { t: 'Ampliar la memoria RAM', ok: false, res: 'La RAM no tiene nada que ver con un disco que falla al escribir.' }
        ],
        verificaciones: [
          { t: 'Leer el SMART del SSD nuevo y abrir los planos copiados', ok: true, res: 'El SSD nuevo está sano y los planos se abren completos.' },
          { t: 'Guardar un archivo pequeño y darlo por bueno', ok: false, res: 'Un archivo pequeño no demuestra nada sobre el disco ni sobre los datos copiados.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo tarda en guardar y algunos archivos aparecen dañados.'],
          ['Por qué', 'Cada celda de un SSD admite un número limitado de escrituras. Cuando el desgaste llega al límite, el SSD retira bloques defectuosos y escribe cada vez peor, hasta que puede quedar solo en lectura.'],
          ['Qué no puede concluir la observación', 'Lentitud y archivos dañados también encajan con un cable SATA defectuoso. El SMART es lo que demuestra el desgaste.'],
          ['Cómo se resuelve', 'Revisa el cable, lee el SMART y, si el desgaste está al límite, copia los datos lo primero y sustituye el SSD.'],
          ['Lección', 'Un SSD no hace ruido al fallar: el SMART es la única forma de verlo venir.']
        ],
        fallos: { smart: 'SMART del SSD: vida restante 0 % y 214 bloques defectuosos retirados.' },
        res: { ent: 'El equipo trabaja con archivos de planos enormes que se guardan cada pocos minutos, todos los días desde hace seis años.', vis: 'Nada raro a simple vista.', fue: 'Los raíles están en tolerancia.', carga: '+12 V estable en carga.', min: 'En mínima configuración el disco sigue igual de lento al guardar.', sata: 'Los dos cables del SSD están bien. Con otro cable de datos, sigue igual.', smart: 'SMART del SSD: vida restante 0 % y 214 bloques defectuosos retirados.', ram: 'La RAM supera el test.', tmp: 'Temperaturas normales.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], sata: ['disco', 'ok'], smart: ['disco', 'bad'], ram: ['ram', 'ok'], tmp: ['cpu', 'ok'] }, volt: [12.02, 5.02, 3.31] },

      /* 21 · eps */
      { t: 'El centro juvenil La Nave', s: 'El monitor del centro juvenil ha montado con los chavales un ordenador nuevo para la sala de juegos, aprovechando unas piezas donadas. Lo encienden todos juntos para celebrarlo: los ventiladores giran, las luces de colores se encienden… y el monitor se queda en negro. Los chavales están decepcionados.', causa: 'eps', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Las luces y los ventiladores demuestran que llega corriente a la placa, no que llegue a todo lo que la necesita.', 'Repasa los conectores de alimentación uno a uno: no todos van al mismo sitio.', 'Hay un conector de 8 pines que alimenta solo al procesador, en una esquina de la placa.'],
        discrima: { ids: ['eps'], texto: 'Pantalla negra con ventiladores también encaja con una BIOS sin soporte, una gráfica sin alimentación o una RAM que no arranca. Revisa el EPS antes de confirmarlo.' },
        explica: 'El conector EPS de 8 pines quedó sin conectar: la CPU no recibe +12 V.',
        reparaciones: [
          { t: 'Conectar el cable EPS de 8 pines de la fuente en la placa', ok: true, res: 'Con el EPS conectado, la CPU recibe +12 V y el equipo da imagen.' },
          { t: 'Cambiar el procesador donado', ok: false, res: 'El procesador no se ha probado con alimentación: cambiarlo no está justificado.' },
          { t: 'Usar el cable PCIe de 8 pines en el hueco del EPS', ok: false, res: 'PCIe y EPS no son intercambiables: tienen el cableado distinto y se puede dañar el equipo.' }
        ],
        verificaciones: [
          { t: 'Arrancar y comprobar que la BIOS muestra la CPU y completa el POST', ok: true, res: 'El POST se completa y sale imagen.' },
          { t: 'Ver que el cable está puesto y darlo por bueno', ok: false, res: 'Falta comprobar que el equipo arranca.' }
        ],
        explicacion: [
          ['Qué pasa', 'Un equipo recién montado enciende pero no da imagen ni completa el POST.'],
          ['Por qué', 'La CPU se alimenta por el conector EPS (4+4 pines), separado del ATX de 24 pines. En un montaje es fácil olvidarlo porque está en la esquina superior y queda tapado por el disipador.'],
          ['Qué no puede concluir la observación', 'Luces y ventiladores solo demuestran que la placa recibe tensión por el ATX.'],
          ['Cómo se resuelve', 'Conecta el cable EPS de la fuente (marcado «CPU»), no el PCIe aunque tenga 8 pines, y arranca de nuevo.'],
          ['Lección', 'En un montaje, repasa los conectores con una lista: ATX, EPS, PCIe, SATA y panel frontal.']
        ],
        fallos: { eps: 'No hay ningún cable en el EPS: el cable «CPU» de la fuente está recogido detrás de la bandeja.' },
        res: { ent: 'Lo montaron entre todos siguiendo un vídeo. La fuente es modular y «sobraron» algunos cables.', vis: 'La esquina superior de la placa queda tapada por el disipador. No se ve bien si hay algo conectado.', fue: 'Los valores de la fuente son correctos.', min: 'Con lo mínimo sigue sin imagen: revisa la alimentación de la CPU.', eps: 'No hay ningún cable en el EPS: el cable «CPU» de la fuente está recogido detrás de la bandeja.', bios: 'La CPU figura en la lista de compatibles de la BIOS instalada.', gpu: 'La gráfica está bien asentada y alimentada.', ram: 'Probar la RAM no cambia nada.', video: 'El monitor está en la salida de la gráfica.', tmp: 'No se puede medir sin POST.', cam: 'Cambiar la fuente no soluciona la pantalla negra.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'bad'], eps: ['cpu', 'bad'], bios: ['placa', 'ok'], gpu: ['grafica', 'ok'], ram: ['ram', 'ok'] }, volt: [12.01, 5.02, 3.30] },

      /* 22 · potencia */
      { t: 'La tienda de fotografía de Andrés', s: 'Andrés revela fotos digitales para bodas y comuniones. Su ordenador tiene siete años y siempre ha ido bien, pero últimamente, al exportar cientos de fotos a la vez, se apaga en seco. Si exporta de diez en diez no le pasa. Ya ha limpiado el polvo él mismo y sigue igual.', causa: 'potencia', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Falla solo en los momentos de máximo trabajo. Hay dos sospechosos que crecen con la carga.', 'El polvo ya está limpio. Mide la temperatura y el raíl de 12 V bajo carga.', 'Las fuentes también envejecen: sus condensadores pierden capacidad y dejan de aguantar los picos.'],
        discrima: { ids: ['tmp', 'carga'], texto: 'Un apagado en carga puede ser calor o potencia. Mide la temperatura y el raíl de 12 V en carga antes de confirmarlo.' },
        explica: 'La fuente, con siete años, ya no aguanta los picos de consumo: el raíl de 12 V se hunde y la protección corta.',
        reparaciones: [
          { t: 'Sustituir la fuente por una nueva con margen de potencia', ok: true, res: 'Con la fuente nueva el raíl de 12 V se mantiene y el equipo exporta sin apagarse.' },
          { t: 'Cambiar la pasta térmica de la CPU', ok: false, res: 'Las temperaturas son normales: no es un problema de calor.' },
          { t: 'Exportar siempre de diez en diez', ok: false, res: 'Eso esquiva el síntoma pero la fuente seguirá degradándose.' }
        ],
        verificaciones: [
          { t: 'Exportar 500 fotos midiendo +12 V', ok: true, res: '+12 V no baja de 11,8 V y la exportación termina.' },
          { t: 'Exportar diez fotos y darlo por bueno', ok: false, res: 'Con diez fotos nunca fallaba.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo se apaga solo en los momentos de máximo consumo.'],
          ['Por qué', 'Con los años los condensadores de la fuente pierden capacidad. En reposo la fuente da tensiones correctas, pero en un pico de consumo el raíl de 12 V cae fuera de tolerancia y la protección corta.'],
          ['Qué no puede concluir la medición en reposo', 'Una fuente vieja puede medir perfecta en reposo. La prueba que decide se hace en carga.'],
          ['Cómo se resuelve', 'Mide +12 V en carga y las temperaturas. Si la tensión se hunde y las temperaturas son normales, sustituye la fuente.'],
          ['Lección', 'Una fuente que funcionó años no es eterna: mide en carga, no solo en reposo.']
        ],
        fallos: { carga: '+12 V cae a 11,2 V al exportar muchas fotos, fuera de tolerancia, justo antes de apagarse.' },
        res: { ent: 'Nunca ha cambiado ninguna pieza. Hace poco empezó a hacer exportaciones mucho más grandes por las bodas de verano.', vis: 'El equipo está limpio. La etiqueta de la fuente es de una marca genérica.', fue: 'Los raíles están en tolerancia en reposo. Eso no dice nada en carga.', carga: '+12 V cae a 11,2 V al exportar muchas fotos, fuera de tolerancia, justo antes de apagarse.', min: 'Sin carga el fallo no aparece.', tmp: 'La CPU llega a 68 °C exportando: temperatura normal.', fan: 'Todos los ventiladores están bien conectados y giran.', ram: 'La RAM supera el test.', cam: 'Con una fuente de prueba exporta 500 fotos sin apagarse.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'bad'], tmp: ['cpu', 'ok'], ram: ['ram', 'ok'], cam: ['fuente', 'ok'] }, volt: [12.04, 5.02, 3.30] },

      /* 23 · ventcpu */
      { t: 'El ordenador de la abuela Pilar', s: 'Pilar tiene 78 años y hace videollamadas con sus nietos todos los domingos. Su nieto mayor le limpió el ordenador por dentro con un aspirador. Desde entonces, al encender aparece un mensaje en inglés que ella no entiende y tiene que llamar a su nieto para que pulse «una tecla». Además, el ordenador se apaga a mitad de las videollamadas.', causa: 'ventcpu', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Todo empezó justo después de la limpieza. Piensa en qué se puede soltar al meter un aspirador en la caja.', 'Mira las temperaturas y comprueba qué ventiladores giran y dónde están conectados.', 'El mensaje del arranque lo da la placa cuando no detecta giro en una cabecera concreta.'],
        discrima: { ids: ['tmp', 'fan'], texto: 'Un apagado por calor también lo provoca un disipador sucio. Mira las temperaturas y las cabeceras de ventiladores antes de confirmarlo.' },
        explica: 'Al limpiar, el cable del ventilador del disipador se soltó de CPU_FAN: el ventilador no gira, la placa avisa y la CPU se calienta.',
        reparaciones: [
          { t: 'Conectar el ventilador del disipador en CPU_FAN y sujetar el cable', ok: true, res: 'El ventilador gira, desaparece el aviso y la CPU se mantiene fresca.' },
          { t: 'Desactivar el aviso en la BIOS para que Pilar no tenga que pulsar nada', ok: false, res: 'Sin ventilador la CPU seguiría calentándose: ocultar el aviso es peligroso.' },
          { t: 'Cambiar el disipador', ok: false, res: 'El disipador está bien: solo hay que conectar su ventilador.' }
        ],
        verificaciones: [
          { t: 'Arrancar sin aviso y hacer una videollamada de media hora midiendo la temperatura', ok: true, res: 'No hay aviso y la CPU no pasa de 60 °C.' },
          { t: 'Ver que el ventilador gira y darlo por bueno', ok: false, res: 'Falta comprobar el aviso y la temperatura en uso.' }
        ],
        explicacion: [
          ['Qué pasa', 'La placa avisa al arrancar (CPU Fan Error) y el equipo se apaga por temperatura.'],
          ['Por qué', 'Si CPU_FAN no detecta giro, la placa avisa en el POST. Sin ventilador, el disipador no evacua el calor y la CPU llega a su límite y se apaga.'],
          ['Qué no puede concluir la observación', 'El aviso no dice si el ventilador está suelto, roto o en otra cabecera: hay que mirarlo.'],
          ['Cómo se resuelve', 'Conecta el ventilador a CPU_FAN y recoge el cable para que no toque las aspas. Limpia con aire, no con aspirador: la electricidad estática y la succión pueden dañar o soltar piezas.'],
          ['Lección', 'Después de cualquier intervención, comprueba que todo queda conectado. Una limpieza también es una intervención.']
        ],
        fallos: { fan: 'El cable del ventilador del disipador cuelga suelto: no está conectado a ninguna cabecera.' },
        res: { ent: 'El nieto usó el aspirador de casa «con cuidado». Pilar dice que el ordenador ahora «hace menos ruido que antes».', vis: 'El equipo está limpio. El ventilador del disipador no se mueve con el equipo encendido.', fue: 'Los raíles están en tolerancia.', carga: '+12 V estable en carga.', min: 'En mínima configuración el aviso sigue apareciendo.', tmp: 'La CPU pasa de 45 °C a 95 °C en pocos minutos de videollamada (lectura simulada).', fan: 'El cable del ventilador del disipador cuelga suelto: no está conectado a ninguna cabecera.', bios: 'En el monitor de hardware, CPU_FAN marca 0 RPM.', ram: 'La RAM supera el test.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], tmp: ['cpu', 'bad'], fan: ['cpu', 'bad'], ram: ['ram', 'ok'] }, volt: [12.02, 5.01, 3.30] },

      /* 24 · bios */
      { t: 'El taller de costura de Amparo', s: 'Amparo usa el ordenador del taller para diseñar patrones. Su hijo encontró en una web de segunda mano un procesador «mucho mejor» a buen precio y se lo instaló el fin de semana. El lunes, el ordenador enciende, los ventiladores giran y se ilumina un pilotito rojo en la placa, pero la pantalla no muestra nada.', causa: 'bios', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El cambio fue el procesador. Pero que un procesador encaje no lo hace compatible.', 'Busca la lista de procesadores compatibles de la placa y la versión de BIOS que exige cada uno.', 'El piloto rojo de la placa indica en qué etapa del arranque se detiene.'],
        discrima: { ids: ['eps', 'bios'], texto: 'Tras manipular la CPU también se puede soltar el EPS. Revisa el EPS y la versión de BIOS antes de confirmarlo.' },
        explica: 'La BIOS de la placa es anterior al procesador nuevo y no sabe inicializarlo.',
        reparaciones: [
          { t: 'Montar la CPU antigua, actualizar la BIOS y volver a montar la nueva', ok: true, res: 'Con la BIOS al día, la placa reconoce el procesador nuevo.' },
          { t: 'Reclamar al vendedor de segunda mano por procesador roto', ok: false, res: 'El procesador no se ha probado con una BIOS que lo soporte.' },
          { t: 'Cambiar la memoria RAM', ok: false, res: 'El piloto indica la CPU, no la memoria.' }
        ],
        verificaciones: [
          { t: 'Arrancar, ver el procesador nuevo en la BIOS y hacer una prueba de carga', ok: true, res: 'La BIOS muestra el procesador y el equipo es estable.' },
          { t: 'Ver que la actualización terminó y darlo por bueno', ok: false, res: 'Falta arrancar con el procesador nuevo.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras cambiar el procesador, la placa no completa el POST y enciende su LED de CPU.'],
          ['Por qué', 'Cada BIOS incluye el soporte de los procesadores que existían cuando se publicó. Un modelo posterior necesita una versión más nueva, aunque use el mismo zócalo.'],
          ['Qué no puede concluir la observación', 'El LED de CPU no distingue una CPU averiada de una CPU sin soporte, ni de una CPU sin EPS.'],
          ['Cómo se resuelve', 'Comprueba el EPS y la lista de compatibles. Actualiza la BIOS con la CPU antigua montada (o con BIOS Flashback) y luego monta la nueva.'],
          ['Lección', 'Antes de comprar una CPU para una placa existente, mira la lista de compatibles y la versión de BIOS.']
        ],
        fallos: { bios: 'La BIOS instalada es de hace cuatro años. El procesador nuevo necesita una versión de hace dos.' },
        res: { ent: 'El hijo guardó el procesador antiguo en su caja. Dice que la web aseguraba que «es el mismo socket».', vis: 'El disipador está bien colocado. Junto a la palabra «CPU» de la placa hay un LED rojo encendido.', fue: 'Los valores de la fuente son correctos.', min: 'Con lo mínimo sigue sin imagen y con el LED de CPU encendido.', eps: 'El EPS está bien encajado: la CPU recibe +12 V.', bios: 'La BIOS instalada es de hace cuatro años. El procesador nuevo necesita una versión de hace dos.', gpu: 'El equipo usa los gráficos integrados del procesador.', video: 'El monitor está en la salida de vídeo de la placa, la correcta en este equipo.', ram: 'Probar la RAM en otro slot no cambia nada.', tmp: 'No se puede medir sin POST.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'bad'], eps: ['cpu', 'ok'], bios: ['placa', 'bad'], ram: ['ram', 'ok'] }, volt: [12.01, 5.03, 3.31] },

      /* 25 · pila */
      { t: 'La escuela de música Allegro', s: 'En la escuela de música hay un ordenador para grabar a los alumnos. Cada vez que vuelven de vacaciones, el equipo arranca pidiendo pulsar F1, la fecha aparece como si fuera de hace años y el programa de grabación no deja entrar porque «la licencia ha caducado». Tras ajustarlo a mano, todo va bien… hasta las siguientes vacaciones.', causa: 'pila', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El fallo aparece después de muchos días sin corriente. ¿Qué guarda la placa mientras está desenchufada?', 'La fecha y la configuración de la BIOS se pierden cuando se queda sin energía de reserva.', 'Mide la pila de botón con el equipo desenchufado.'],
        discrima: { ids: ['pila'], texto: 'La configuración también se pierde si el jumper de borrado de la BIOS está mal puesto. Mide la pila antes de confirmarlo.' },
        explica: 'La pila de la BIOS está agotada: durante las vacaciones, con el equipo desenchufado, se pierden la fecha y los ajustes.',
        reparaciones: [
          { t: 'Cambiar la pila CR2032 y ajustar fecha, hora y BIOS', ok: true, res: 'Con la pila nueva la placa conserva la fecha sin corriente.' },
          { t: 'Reinstalar el programa de grabación', ok: false, res: 'El programa protesta porque la fecha está mal: reinstalarlo no cambia la fecha.' },
          { t: 'Dejar el equipo siempre enchufado', ok: false, res: 'Esquiva el síntoma, pero un corte de luz volverá a borrar la configuración.' }
        ],
        verificaciones: [
          { t: 'Desenchufar el equipo una noche y comprobar la fecha al arrancar', ok: true, res: 'Arranca sin aviso y con la fecha correcta.' },
          { t: 'Reiniciar enchufado y darlo por bueno', ok: false, res: 'Enchufado, la fuente mantiene la configuración: así no se prueba la pila.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras muchos días sin corriente, la BIOS arranca con la configuración por defecto y la fecha mal.'],
          ['Por qué', 'Sin +5 VSB, solo la pila CR2032 mantiene el reloj y la configuración. Una pila gastada no llega a cubrir días sin corriente. Muchos programas con licencia comprueban la fecha y fallan si es incorrecta.'],
          ['Qué no puede concluir la observación', 'La fecha mal no demuestra que sea la pila: un jumper CLR_CMOS mal colocado da el mismo síntoma.'],
          ['Cómo se resuelve', 'Mide la pila desenchufada y, si está por debajo de unos 2,5 V, cámbiala. Después configura fecha, hora y orden de arranque.'],
          ['Lección', 'Un fallo que aparece tras días desenchufado apunta a la pila.']
        ],
        fallos: { pila: 'La pila marca 1,9 V con el equipo desenchufado: está agotada.' },
        res: { ent: 'En vacaciones, el conserje desconecta todos los enchufes de la escuela por seguridad. El equipo tiene nueve años.', vis: 'La placa está limpia. La pila está en su sitio y el jumper de borrado está en la posición normal.', fue: 'Los raíles están en tolerancia y hay +5 VSB.', min: 'En mínima configuración arranca con el mismo aviso.', pila: 'La pila marca 1,9 V con el equipo desenchufado: está agotada.', bios: 'Todos los ajustes de la BIOS están en sus valores de fábrica.', boot: 'El orden de arranque ha vuelto a los valores de fábrica, pero el disco arranca.', ram: 'La RAM supera el test.', sata: 'El disco se detecta bien.', tmp: 'Temperaturas normales.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], pila: ['placa', 'bad'], ram: ['ram', 'ok'], sata: ['disco', 'ok'], tmp: ['cpu', 'ok'] }, volt: [12.00, 5.02, 3.30] },

      /* 26 · condens */
      { t: 'La granja de los Ferrer', s: 'Los Ferrer llevan las cuentas de su granja de cabras con un ordenador que tienen en la oficina del establo. Últimamente cuesta encenderlo: a veces arranca a la primera, a veces a la tercera, y alguna vez se reinicia mientras rellenan las fichas de los animales. En la oficina hay mucha humedad en invierno.', causa: 'condens', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Los fallos no dependen de la carga y empeoran con el tiempo. Piensa en componentes que envejecen.', 'Mide la fuente y después mira la placa con buena luz, sobre todo alrededor del procesador.', 'La parte superior de los condensadores electrolíticos debe ser plana. Si está abombada, han perdido capacidad.'],
        discrima: { ids: ['fue', 'vis'], texto: 'Arranques irregulares y reinicios también los provoca una fuente inestable. Mide la fuente e inspecciona la placa antes de confirmarlo.' },
        explica: 'Varios condensadores de la placa junto al VRM están hinchados: la alimentación de la CPU es inestable.',
        reparaciones: [
          { t: 'Sustituir la placa base (o repararla en un servicio de electrónica)', ok: true, res: 'Con la placa nueva el equipo arranca siempre a la primera.' },
          { t: 'Cambiar la fuente', ok: false, res: 'La fuente da tensiones estables: el fallo está en la placa.' },
          { t: 'Secar el equipo con un secador de pelo', ok: false, res: 'Un condensador hinchado no se recupera, y el calor del secador puede dañar más cosas.' }
        ],
        verificaciones: [
          { t: 'Encender y apagar el equipo diez veces y dejarlo un día funcionando', ok: true, res: 'Arranca las diez veces a la primera y no se reinicia en todo el día.' },
          { t: 'Encenderlo una vez y darlo por bueno', ok: false, res: 'El fallo era intermitente: una vez no demuestra nada.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo arranca a veces sí y a veces no, y se reinicia sin motivo.'],
          ['Por qué', 'Los condensadores electrolíticos estabilizan la tensión que el VRM entrega a la CPU. La humedad, el calor y los años degradan su electrolito; se hinchan, pierden capacidad y la tensión deja de ser estable.'],
          ['Qué no puede concluir la medición', 'Una fuente correcta no garantiza que la tensión llegue estable a la CPU, porque el VRM de la placa está en medio.'],
          ['Cómo se resuelve', 'Busca condensadores abombados o con restos de electrolito. Si los hay, sustituye la placa o repárala en un servicio con soldadura especializado.'],
          ['Lección', 'Los fallos intermitentes que empeoran con el tiempo apuntan a componentes que envejecen: condensadores, pilas, ventiladores.']
        ],
        fallos: { vis: 'Tres condensadores junto al zócalo de la CPU tienen la parte superior abombada y hay óxido en los tornillos de la placa.' },
        res: { ent: 'El ordenador tiene doce años. En invierno las paredes de la oficina «sudan».', vis: 'Tres condensadores junto al zócalo de la CPU tienen la parte superior abombada y hay óxido en los tornillos de la placa.', fue: 'Los raíles están en tolerancia y estables durante varios minutos.', carga: '+12 V estable en carga.', min: 'En mínima configuración sigue arrancando unas veces sí y otras no.', ram: 'La RAM supera el test cuando el equipo llega a arrancar.', tmp: 'Temperaturas normales.', pila: 'La pila marca 3,0 V: está bien.', cam: 'Con otra fuente pasa lo mismo.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], vis: ['placa', 'bad'], ram: ['ram', 'ok'], tmp: ['cpu', 'ok'], pila: ['placa', 'ok'], cam: ['fuente', 'ok'] }, volt: [12.03, 5.01, 3.30] },

      /* 27 · sata */
      { t: 'La agencia de viajes Brújula', s: 'La agencia ha pedido a un técnico que añada un segundo disco para guardar las facturas antiguas. El técnico se fue contento: el disco nuevo aparecía. A la mañana siguiente, el equipo dice «No bootable device» y no arranca Windows. La agencia abre en media hora.', causa: 'sata', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El equipo pasa el POST y el disco nuevo aparece. Lo que falta es la unidad desde la que arranca Windows.', 'Al trabajar dentro de una caja es fácil mover lo que ya estaba montado.', 'Revisa los dos cables del disco antiguo, por separado.'],
        discrima: { ids: ['sata'], texto: 'Un disco que desaparece puede estar averiado, desactivado o mal conectado. Revisa sus cables antes de confirmarlo.' },
        explica: 'Al montar el disco nuevo, el técnico desplazó el cable de datos del disco antiguo, que quedó medio fuera.',
        reparaciones: [
          { t: 'Encajar el cable de datos del disco antiguo y comprobar los dos discos', ok: true, res: 'Con el cable encajado aparecen los dos discos y arranca Windows.' },
          { t: 'Reinstalar Windows en el disco nuevo', ok: false, res: 'El disco antiguo y sus datos siguen ahí: solo hay que conectarlo bien.' },
          { t: 'Desmontar el disco nuevo', ok: false, res: 'El disco nuevo no es el problema: el cable del antiguo está suelto.' }
        ],
        verificaciones: [
          { t: 'Entrar en la BIOS, ver los dos discos y arrancar Windows', ok: true, res: 'Aparecen los dos discos y Windows arranca.' },
          { t: 'Ver que el cable está puesto y darlo por bueno', ok: false, res: 'Falta comprobar la detección y el arranque.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras añadir un disco, el disco de sistema desaparece y el equipo no arranca.'],
          ['Por qué', 'Los cables SATA de datos encajan por presión y algunos no llevan pestaña de seguridad. Al manipular cables cercanos es fácil desplazarlos.'],
          ['Qué no puede concluir la observación', 'Que el disco nuevo aparezca no demuestra que el antiguo siga bien conectado.'],
          ['Cómo se resuelve', 'Revisa los dos cables del disco que falta, recoloca el de datos y comprueba en la BIOS que se detectan los dos discos.'],
          ['Lección', 'Cuando termines una intervención, comprueba también lo que ya funcionaba antes.']
        ],
        fallos: { sata: 'El cable de datos del disco antiguo está medio fuera del puerto de la placa.' },
        res: { ent: 'El técnico estuvo una hora y probó solo que el disco nuevo aparecía. No arrancó Windows antes de irse.', vis: 'Los cables parecen en su sitio a simple vista.', fue: 'Los raíles están en tolerancia.', min: 'Pasa el POST: la placa, la CPU y la RAM funcionan.', sata: 'El cable de datos del disco antiguo está medio fuera del puerto de la placa.', manual: 'Esta placa no comparte sus puertos SATA con la ranura M.2: no hay ningún puerto desactivado.', smart: 'No se puede leer el SMART del disco antiguo: la BIOS no lo ve.', boot: 'En el orden de arranque solo aparece el disco nuevo, que no tiene sistema.', ram: 'La RAM no tiene nada que ver.', cam: 'Cambiar la fuente no tiene sentido.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'ok'], sata: ['disco', 'bad'], manual: ['placa', 'ok'], ram: ['ram', 'ok'] }, volt: [12.02, 5.01, 3.30] },

      /* 28 · carriles */
      { t: 'El canal de recetas de Marta', s: 'Marta graba vídeos de cocina y los edita en casa. Para que el ordenador vaya más rápido, compró un SSD M.2 y lo instaló ella misma siguiendo un tutorial. El SSD funciona de maravilla, pero el disco duro grande, donde guarda todos sus vídeos antiguos, ha desaparecido de Windows y de la BIOS.', causa: 'carriles', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El disco desapareció justo al instalar el SSD, y el SSD funciona. ¿Qué relación puede haber entre los dos?', 'Revisa los cables del disco y después busca en el manual qué pasa al usar la ranura M.2.', 'Algunas placas comparten las líneas de una ranura M.2 con ciertos puertos SATA: si usas una, el otro se desactiva.'],
        discrima: { ids: ['sata', 'manual'], texto: 'Un disco que desaparece también puede tener el cable suelto. Revisa sus cables y consulta el manual antes de confirmarlo.' },
        explica: 'La ranura M.2 que ha usado comparte líneas con el puerto SATA del disco: al ocuparla, ese puerto se desactiva.',
        reparaciones: [
          { t: 'Mover el disco a un puerto SATA que no comparta líneas con la M.2', ok: true, res: 'En otro puerto SATA el disco vuelve a aparecer junto al SSD.' },
          { t: 'Sustituir el disco duro', ok: false, res: 'El disco no está averiado: su puerto está desactivado.' },
          { t: 'Quitar el SSD M.2', ok: false, res: 'Así vuelve el disco, pero Marta pierde el SSD. Hay otra solución sin renunciar a nada.' }
        ],
        verificaciones: [
          { t: 'Entrar en la BIOS y comprobar que aparecen el SSD y el disco', ok: true, res: 'Aparecen los dos y Windows muestra los vídeos antiguos.' },
          { t: 'Ver que el disco gira y darlo por bueno', ok: false, res: 'Ya giraba antes: falta comprobar que se detecta.' }
        ],
        explicacion: [
          ['Qué pasa', 'Al instalar un SSD M.2, un disco SATA deja de aparecer.'],
          ['Por qué', 'El chipset tiene un número limitado de líneas. Muchas placas comparten las de una ranura M.2 con uno o dos puertos SATA: si la M.2 está ocupada (sobre todo con un SSD SATA), esos puertos se desactivan. El manual lo indica en una tabla.'],
          ['Qué no puede concluir la observación', 'Que el disco gire demuestra que tiene alimentación, no que su puerto esté activo.'],
          ['Cómo se resuelve', 'Consulta el manual, identifica qué puertos SATA se desactivan con esa ranura M.2 y conecta el disco en otro puerto.'],
          ['Lección', 'Antes de ampliar, lee el manual de la placa: ranuras y puertos pueden compartir recursos.']
        ],
        fallos: { manual: 'Según el manual, al ocupar la ranura M2_2 se desactivan los puertos SATA5 y SATA6. El disco está en SATA5.' },
        res: { ent: 'Puso el SSD en la segunda ranura M.2 porque la primera estaba tapada por la gráfica. El disco duro gira, se le oye.', vis: 'El SSD está bien atornillado. El disco tiene sus dos cables conectados.', fue: 'Los raíles están en tolerancia.', min: 'Pasa el POST sin problemas.', sata: 'Los dos cables del disco están bien encajados. Con otro cable de datos, tampoco aparece.', manual: 'Según el manual, al ocupar la ranura M2_2 se desactivan los puertos SATA5 y SATA6. El disco está en SATA5.', smart: 'No se puede leer el SMART del disco: la BIOS no lo ve. El del SSD está perfecto.', boot: 'El sistema arranca desde el SSD sin problemas.', ram: 'La RAM no tiene nada que ver.', cam: 'Cambiar la fuente no tiene sentido.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'ok'], sata: ['disco', 'ok'], manual: ['disco', 'bad'], ram: ['ram', 'ok'] }, volt: [12.03, 5.02, 3.31] },

      /* 29 · pcie */
      { t: 'El estudio de grabación de Leo', s: 'Leo produce música electrónica y ha cambiado su gráfica vieja por una mucho más grande para hacer también vídeos. La instaló con prisas antes de un concierto. Al encender, los ventiladores de la caja giran, en la gráfica se enciende un pequeño LED rojo y el monitor no muestra nada.', causa: 'pcie', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El LED rojo está en la propia gráfica, no en la placa. ¿Qué intenta decir la tarjeta?', 'Las gráficas grandes tienen más de un conector de alimentación propio.', 'Cuenta los conectores de alimentación de la gráfica y los cables que llegan a ellos.'],
        discrima: { ids: ['gpu'], texto: 'Pantalla negra con ventiladores también encaja con un EPS suelto o un fallo de memoria. Revisa la gráfica antes de confirmarlo.' },
        explica: 'La gráfica tiene dos conectores PCIe de 8 pines y solo uno está conectado: el LED rojo avisa de alimentación insuficiente.',
        reparaciones: [
          { t: 'Conectar los dos cables PCIe de 8 pines, cada uno desde su propia salida de la fuente', ok: true, res: 'Con los dos conectores alimentados, el LED se apaga y la gráfica da imagen.' },
          { t: 'Devolver la gráfica', ok: false, res: 'No se ha probado con toda su alimentación conectada.' },
          { t: 'Volver a poner la gráfica antigua', ok: false, res: 'Así se esquiva el problema, pero la gráfica nueva sigue sin funcionar.' }
        ],
        verificaciones: [
          { t: 'Arrancar y hacer una prueba de vídeo exigente', ok: true, res: 'Hay imagen y la gráfica rinde sin apagarse.' },
          { t: 'Ver que el LED de la gráfica se apaga y darlo por bueno', ok: false, res: 'Falta comprobar la imagen y el funcionamiento en carga.' }
        ],
        explicacion: [
          ['Qué pasa', 'Una gráfica nueva no da imagen y muestra un LED rojo en su conector de alimentación.'],
          ['Por qué', 'Las gráficas de alto consumo llevan dos o tres conectores PCIe. Si falta alguno, la tarjeta no arranca y avisa con un LED. Lo correcto es usar un cable independiente de la fuente para cada conector.'],
          ['Qué no puede concluir la observación', 'Que un conector esté puesto no significa que la gráfica tenga toda la alimentación que necesita.'],
          ['Cómo se resuelve', 'Conecta todos los conectores de la gráfica, cada uno con su cable, y comprueba que la fuente tiene potencia suficiente para ella.'],
          ['Lección', 'Lee los conectores que pide una pieza nueva y comprueba que la fuente los tiene todos.']
        ],
        fallos: { gpu: 'La gráfica tiene dos conectores de 8 pines: uno conectado y el otro vacío, con su LED rojo encendido.' },
        res: { ent: 'Leo dice que conectó «el cable de la gráfica», el mismo que usaba la antigua.', vis: 'La gráfica es enorme y tapa parte de la placa. Junto a sus conectores hay un LED rojo encendido.', fue: 'Los valores de la fuente son correctos.', min: 'Sin la gráfica, la placa pasa el POST y da imagen por la salida integrada.', eps: 'El EPS está bien conectado.', gpu: 'La gráfica tiene dos conectores de 8 pines: uno conectado y el otro vacío, con su LED rojo encendido.', video: 'El monitor está conectado a la gráfica, que es lo correcto.', ram: 'La RAM está bien.', bios: 'La BIOS está al día.', tmp: 'No se puede medir sin imagen.', cam: 'Con otra fuente pasa lo mismo si el segundo conector sigue vacío.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'ok'], eps: ['cpu', 'ok'], gpu: ['grafica', 'bad'], ram: ['ram', 'ok'], bios: ['placa', 'ok'] }, volt: [12.04, 5.02, 3.31] },

      /* 30 · gpuranura */
      { t: 'El envío de Tomás', s: 'Tomás se ha comprado su primer ordenador montado en una tienda online. La caja llegó con un golpe en una esquina, pero por fuera la torre parecía intacta. Lo conecta ilusionado: los ventiladores giran, las luces se encienden y la placa pita varias veces, pero la pantalla se queda negra.', causa: 'gpuranura', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Un golpe de transporte puede mover las piezas más pesadas y voluminosas de la caja.', 'Los pitidos de la placa indican un fallo concreto: busca su significado y revisa la pieza señalada.', 'Mira cómo está sujeta la gráfica: la pestaña de la ranura y el tornillo del soporte.'],
        discrima: { ids: ['gpu'], texto: 'Pitidos y pantalla negra también los dan una memoria mal asentada o una CPU sin EPS. Revisa la gráfica antes de confirmarlo.' },
        explica: 'Con el golpe, la gráfica se salió parcialmente de su ranura: la placa no la detecta y pita.',
        reparaciones: [
          { t: 'Reencajar la gráfica hasta que cierre la pestaña y atornillarla al chasis', ok: true, res: 'Con la gráfica bien asentada y sujeta, el equipo da imagen.' },
          { t: 'Devolver el ordenador completo', ok: false, res: 'Posible, pero la avería se resuelve en dos minutos sin cambiar nada.' },
          { t: 'Conectar el monitor a la placa', ok: false, res: 'Este procesador no tiene gráficos integrados: no habría imagen.' }
        ],
        verificaciones: [
          { t: 'Arrancar, comprobar la imagen y que el sistema detecta la gráfica', ok: true, res: 'Hay imagen y el sistema reconoce la gráfica.' },
          { t: 'Ver que la pestaña está cerrada y darlo por bueno', ok: false, res: 'Falta arrancar y comprobarlo.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras un golpe en el transporte, la placa pita y no hay imagen.'],
          ['Por qué', 'La gráfica es pesada y sobresale mucho de la ranura. Si no está atornillada al chasis, un golpe puede inclinarla y separar sus contactos de la ranura PCIe. La placa no encuentra la gráfica y emite su código de pitidos.'],
          ['Qué no puede concluir la observación', 'Que la torre parezca intacta por fuera no dice nada de cómo están las piezas por dentro.'],
          ['Cómo se resuelve', 'Equipo apagado: abre la pestaña de la ranura, saca la gráfica, vuelve a insertarla hasta el fondo y atorníllala al chasis.'],
          ['Lección', 'Tras un transporte, revisa primero lo pesado: gráfica, disipador y discos.']
        ],
        fallos: { gpu: 'La gráfica está inclinada: su extremo se ha salido de la ranura y el tornillo del soporte no está puesto.' },
        res: { ent: 'La caja llegó con una esquina hundida. La tienda dice que lo envió todo probado.', vis: 'La gráfica parece algo torcida respecto a las demás ranuras. Es un indicio: hay que comprobarlo.', fue: 'Los valores de la fuente son correctos.', min: 'Sin la gráfica la placa pita igual: sin gráficos integrados no hay salida de vídeo.', eps: 'El EPS está bien conectado.', gpu: 'La gráfica está inclinada: su extremo se ha salido de la ranura y el tornillo del soporte no está puesto.', ram: 'Los módulos de RAM están bien encajados y no cambian los pitidos.', reenc: 'Reencajar la RAM no cambia los pitidos.', video: 'El monitor está conectado a la gráfica.', tmp: 'No se puede medir sin imagen.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], eps: ['cpu', 'ok'], gpu: ['grafica', 'bad'], ram: ['ram', 'ok'], reenc: ['ram', 'ok'] }, volt: [12.02, 5.01, 3.30] },

      /* 31 · gpucalor */
      { t: 'El club de rol de Daniel', s: 'Daniel organiza partidas de rol en línea con su grupo los sábados por la noche. Desde hace unas semanas, tras una hora de partida, aparecen cuadros de colores en la pantalla, el juego se congela y al final se cierra. El ordenador no se apaga: solo se cierra el juego.', causa: 'gpucalor', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Los cuadros de colores en pantalla son un fallo de la imagen, no del procesador.', 'El fallo aparece con el tiempo de juego: mide temperaturas, pero no solo las de la CPU.', 'Mira los ventiladores de la gráfica mientras trabaja.'],
        discrima: { ids: ['tmp', 'gpu'], texto: 'Cuelgues en juego también los provoca una CPU caliente. Mira la temperatura de la CPU y revisa la gráfica antes de confirmarlo.' },
        explica: 'Uno de los ventiladores de la gráfica está parado: la gráfica pasa de 95 °C y empieza a corromper la imagen.',
        reparaciones: [
          { t: 'Limpiar la gráfica y sustituir el ventilador parado', ok: true, res: 'Con sus ventiladores girando, la gráfica se queda por debajo de 80 °C.' },
          { t: 'Cambiar la pasta térmica de la CPU', ok: false, res: 'La CPU está fresca: el calor está en la gráfica.' },
          { t: 'Bajar la calidad gráfica del juego', ok: false, res: 'Reduce el calor algo, pero el ventilador sigue parado.' }
        ],
        verificaciones: [
          { t: 'Jugar dos horas midiendo la temperatura de la gráfica', ok: true, res: 'La gráfica no pasa de 78 °C y no aparecen artefactos.' },
          { t: 'Arrancar el juego cinco minutos y darlo por bueno', ok: false, res: 'El fallo aparecía tras una hora: cinco minutos no demuestran nada.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras un rato de juego aparecen artefactos en pantalla y el juego se cuelga.'],
          ['Por qué', 'La GPU y su memoria también tienen límites de temperatura. Con un ventilador parado, el calor se acumula y la memoria de vídeo empieza a dar errores: se ven cuadros de colores y el controlador se reinicia o el juego se cierra.'],
          ['Qué no puede concluir la medición de la CPU', 'Una CPU fresca no dice nada de la gráfica, que tiene su propia refrigeración.'],
          ['Cómo se resuelve', 'Mide la temperatura de la gráfica en carga y mira sus ventiladores. Limpia y sustituye el ventilador parado; si la pasta está seca, cámbiala.'],
          ['Lección', 'Artefactos en pantalla apuntan a la gráfica. Mide la temperatura de cada componente por separado.']
        ],
        fallos: { gpu: 'Uno de los dos ventiladores de la gráfica está parado y la gráfica llega a 96 °C en una hora de juego.' },
        res: { ent: 'El ordenador vive en un rincón al lado del gato, que duerme encima de la torre. Hace tiempo que hace un ruido como de roce.', vis: 'Hay pelo de gato en las rejillas y en los ventiladores de la gráfica. Es un indicio.', fue: 'Los raíles están en tolerancia.', carga: '+12 V estable en carga.', min: 'Sin juego no aparece el fallo.', tmp: 'La CPU no pasa de 65 °C jugando: está bien.', fan: 'Los ventiladores de la caja y del disipador funcionan.', gpu: 'Uno de los dos ventiladores de la gráfica está parado y la gráfica llega a 96 °C en una hora de juego.', video: 'El cable de vídeo está bien y conectado a la gráfica.', ram: 'La RAM supera el test.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], tmp: ['cpu', 'ok'], gpu: ['grafica', 'bad'], ram: ['ram', 'ok'] }, volt: [12.03, 5.01, 3.30] },

      /* 32 · video */
      { t: 'Ingeniería Soler', s: 'En Ingeniería Soler han comprado un ordenador potente para la sala de reuniones. El técnico de la tienda lo dejó montado y probado. Esta mañana, el becario lo ha conectado al proyector nuevo y no hay forma: el equipo arranca, se oye un pitido corto, el teclado se ilumina… y el proyector dice «Sin señal».', causa: 'video', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Un pitido corto suele indicar que el POST ha ido bien. La imagen se está generando en algún sitio.', 'Un equipo con gráfica dedicada tiene salidas de vídeo en dos alturas distintas de la parte trasera.', 'Mira a qué conector va el cable del proyector.'],
        discrima: { ids: ['gpu', 'video'], texto: 'Sin imagen también puede ser una gráfica sin alimentación o mal asentada. Revisa la gráfica y la salida de vídeo antes de confirmarlo.' },
        explica: 'El proyector está conectado al HDMI de la placa base, pero la imagen sale por la gráfica dedicada.',
        reparaciones: [
          { t: 'Conectar el proyector a una salida de la tarjeta gráfica', ok: true, res: 'Conectado a la gráfica, el proyector muestra la imagen.' },
          { t: 'Cambiar la gráfica', ok: false, res: 'La gráfica funciona: simplemente no se estaba usando.' },
          { t: 'Cambiar el proyector', ok: false, res: 'El proyector recibe bien la señal de la gráfica.' }
        ],
        verificaciones: [
          { t: 'Arrancar y comprobar la imagen en el proyector desde la BIOS hasta Windows', ok: true, res: 'Hay imagen desde el primer logotipo hasta el escritorio.' },
          { t: 'Cambiar el cable y darlo por bueno sin encender', ok: false, res: 'Falta comprobar que hay imagen.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo arranca bien pero el monitor o proyector no recibe señal.'],
          ['Por qué', 'Con una gráfica dedicada instalada, muchas placas desactivan la salida de vídeo integrada, o el procesador ni siquiera tiene gráficos integrados. La imagen sale solo por los conectores de la gráfica, en la parte baja de la trasera.'],
          ['Qué no puede concluir la observación', 'Que haya un HDMI en la placa no significa que esté activo.'],
          ['Cómo se resuelve', 'Conecta el monitor a una salida de la gráfica (los conectores horizontales en las ranuras de expansión), no a los del panel de E/S de la placa.'],
          ['Lección', 'Con gráfica dedicada, el monitor va a la gráfica. Es el error más común tras mover un equipo.']
        ],
        fallos: { video: 'El cable HDMI está en el panel de E/S de la placa base. La gráfica tiene tres salidas libres más abajo.' },
        res: { ent: 'El técnico lo probó con un monitor. El becario desconectó todo para llevarlo a la sala y lo volvió a conectar.', vis: 'En la trasera hay salidas de vídeo arriba (placa) y abajo (gráfica). El cable está en una de arriba. Es un indicio: hay que comprobarlo.', fue: 'Los valores de la fuente son correctos.', min: 'Pasa el POST con un pitido corto.', gpu: 'La gráfica está bien asentada y con su alimentación conectada.', video: 'El cable HDMI está en el panel de E/S de la placa base. La gráfica tiene tres salidas libres más abajo.', eps: 'El EPS está bien conectado.', ram: 'La RAM está bien.', bios: 'La BIOS está al día.', tmp: 'No se puede ver sin imagen.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'ok'], gpu: ['grafica', 'ok'], video: ['grafica', 'bad'], eps: ['cpu', 'ok'], ram: ['ram', 'ok'] }, volt: [12.02, 5.02, 3.31] },

      /* 33 · atx */
      { t: 'El bufete de la plaza', s: 'En un bufete de abogados, el ordenador de la secretaria a veces no enciende a la primera. Otras veces arranca, pero si alguien golpea la mesa al sentarse, se apaga de golpe. Esta semana se ha perdido un escrito a medio redactar dos veces y el abogado está de muy mal humor.', causa: 'atx', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Un fallo que aparece al golpear la mesa es mecánico: algo hace mal contacto.', 'La fuente mide bien en reposo. Revisa las conexiones de alimentación más grandes.', 'El conector de 24 pines lleva un clip: si no está enganchado, puede moverse.'],
        discrima: { ids: ['fue', 'atx'], texto: 'Apagados repentinos también los provoca una fuente defectuosa. Mide la fuente y revisa el conector ATX antes de confirmarlo.' },
        explica: 'El conector ATX de 24 pines está medio fuera, con el clip sin enganchar: con un golpe pierde contacto.',
        reparaciones: [
          { t: 'Encajar el ATX de 24 pines hasta que enganche el clip y revisar sus pines', ok: true, res: 'Con el conector enganchado, el equipo no se apaga aunque se golpee la mesa.' },
          { t: 'Cambiar la fuente', ok: false, res: 'La fuente mide bien: el fallo es el contacto del conector.' },
          { t: 'Cambiar la placa base', ok: false, res: 'La placa funciona cuando le llega la tensión.' }
        ],
        verificaciones: [
          { t: 'Arrancar diez veces y golpear suavemente la mesa con el equipo encendido', ok: true, res: 'Arranca siempre y no se apaga con los golpes.' },
          { t: 'Encenderlo una vez y darlo por bueno', ok: false, res: 'El fallo era intermitente.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo a veces no enciende y se apaga con vibraciones.'],
          ['Por qué', 'El conector ATX de 24 pines lleva casi toda la corriente de la placa. Si no está enganchado con su clip, se separa un poco: unas veces hace contacto y otras no, y con una vibración se corta la alimentación.'],
          ['Qué no puede concluir la medición', 'Medir la fuente en un momento en que hace contacto da valores correctos. El fallo es intermitente.'],
          ['Cómo se resuelve', 'Desconecta el conector, revisa que ningún pin esté ennegrecido y vuelve a encajarlo hasta oír el clip.'],
          ['Lección', 'Un fallo que cambia con golpes o vibraciones es un mal contacto: revisa conectores antes de cambiar piezas.']
        ],
        fallos: { atx: 'El conector de 24 pines está medio fuera: el clip no ha enganchado y se mueve al tocarlo.' },
        res: { ent: 'Hace un mes un informático cambió el disco por un SSD. Desde entonces pasa lo de los apagados.', vis: 'El mazo de cables de la fuente está muy tirante hacia el conector grande de la placa. Es un indicio.', fue: 'Los raíles están en tolerancia en este momento. El fallo es intermitente.', carga: '+12 V estable en carga mientras no se toca nada.', min: 'En mínima configuración pasa lo mismo al golpear la mesa.', atx: 'El conector de 24 pines está medio fuera: el clip no ha enganchado y se mueve al tocarlo.', eps: 'El EPS está bien enganchado.', panel: 'El cableado del panel frontal es correcto.', ram: 'La RAM está bien encajada.', sata: 'El SSD está bien conectado.', tmp: 'Temperaturas normales.', cam: 'Con otra fuente funciona… hasta que el conector vuelve a moverse.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], atx: ['caja', 'bad'], eps: ['cpu', 'ok'], panel: ['caja', 'ok'], ram: ['ram', 'ok'], sata: ['disco', 'ok'] }, volt: [12.01, 5.02, 3.30] },

      /* 34 · arranque */
      { t: 'La residencia de estudiantes', s: 'En la sala común de una residencia de estudiantes hay un ordenador para imprimir trabajos. Hoy, al encenderlo, en vez de Windows aparece una pantalla negra con letras blancas que dice «Reboot and select proper boot device». El conserje jura que ayer funcionaba y que nadie lo ha abierto.', causa: 'arranque', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El equipo pasa el POST: el fallo está en el momento de elegir desde dónde arrancar.', 'Comprueba que la BIOS ve el disco y desde qué unidad intenta arrancar primero.', 'Mira los puertos USB: alguien pudo dejarse algo conectado.'],
        discrima: { ids: ['sata', 'boot'], texto: 'Un mensaje de dispositivo de arranque también aparece con un disco desconectado. Revisa el disco y el orden de arranque antes de confirmarlo.' },
        explica: 'Un estudiante dejó un pendrive conectado y la BIOS intenta arrancar desde él antes que desde el disco.',
        reparaciones: [
          { t: 'Quitar el pendrive y poner el disco primero en el orden de arranque', ok: true, res: 'Sin el pendrive y con el disco primero, Windows arranca.' },
          { t: 'Reinstalar Windows', ok: false, res: 'Windows está intacto en el disco: solo hay que arrancar desde él.' },
          { t: 'Cambiar el disco', ok: false, res: 'El disco se detecta perfectamente.' }
        ],
        verificaciones: [
          { t: 'Reiniciar dos veces, con y sin un pendrive conectado, y comprobar que arranca Windows', ok: true, res: 'Arranca Windows en los dos casos.' },
          { t: 'Quitar el pendrive y no comprobar nada más', ok: false, res: 'Falta arrancar y comprobar el orden de arranque.' }
        ],
        explicacion: [
          ['Qué pasa', 'El equipo pasa el POST pero no arranca el sistema operativo.'],
          ['Por qué', 'La BIOS prueba las unidades en el orden configurado. Si un USB va antes que el disco y no tiene un sistema arrancable, el arranque se detiene con ese mensaje.'],
          ['Qué no puede concluir la observación', 'El mensaje no distingue un disco desconectado de un orden de arranque incorrecto.'],
          ['Cómo se resuelve', 'Comprueba que la BIOS ve el disco y pon el disco de sistema el primero en el orden de arranque. Retira las unidades USB que no deban estar.'],
          ['Lección', 'Antes de pensar en averías, comprueba lo que el usuario ha podido cambiar o dejar conectado.']
        ],
        fallos: { boot: 'El primer dispositivo de arranque es un pendrive conectado en un puerto trasero.' },
        res: { ent: 'Ayer hubo entrega de trabajos y mucha gente imprimió desde sus pendrives.', vis: 'Hay un pendrive pequeño conectado en un puerto USB trasero. Es un indicio.', fue: 'Los raíles están en tolerancia.', min: 'Pasa el POST: la placa, la CPU y la RAM funcionan.', sata: 'Los cables del disco están bien y la BIOS lo detecta.', smart: 'El disco está sano.', boot: 'El primer dispositivo de arranque es un pendrive conectado en un puerto trasero.', bios: 'La BIOS está al día.', ram: 'La RAM no tiene nada que ver.', cam: 'Cambiar la fuente no tiene sentido.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'ok'], sata: ['disco', 'ok'], smart: ['disco', 'ok'], boot: ['placa', 'bad'], ram: ['ram', 'ok'] }, volt: [12.02, 5.01, 3.30] },

      /* 35 · fpanel */
      { t: 'El aula taller 1.4', s: 'En el aula taller, un grupo de alumnos ha terminado de montar su primer equipo desde cero. El profesor les deja encenderlo: pulsan el botón y no pasa nada. Lo intentan otra vez, nada. Una alumna se fija en que, dentro de la caja, hay un LED verde encendido en la placa.', causa: 'fpanel', senales: { ps: 5.0, sb: 5.0 },
        pistas: ['El LED de la placa demuestra que la fuente le da tensión de espera. Falta la orden de encender.', 'Entre el botón y la placa solo hay un par de cables finos.', 'Puentear los dos pines PWR_SW del F_PANEL prueba si la placa arranca sin el botón.'],
        discrima: { ids: ['fue', 'panel'], texto: 'Un equipo que no responde también puede tener la fuente muerta. Comprueba +5 VSB y revisa el panel frontal antes de confirmarlo.' },
        explica: 'El cable del botón de encendido está conectado en los pines del LED de encendido: el botón no llega a la placa.',
        reparaciones: [
          { t: 'Colocar cada cable del panel frontal en su sitio según el manual', ok: true, res: 'Con el botón en PWR_SW, el equipo arranca al pulsarlo.' },
          { t: 'Cambiar la fuente', ok: false, res: 'La fuente está en espera y arranca al puentear: no es la causa.' },
          { t: 'Cambiar la placa base', ok: false, res: 'La placa arranca al puentear los pines.' }
        ],
        verificaciones: [
          { t: 'Probar el botón, el reset y los LED de la caja', ok: true, res: 'El botón enciende, el reset reinicia y los LED funcionan.' },
          { t: 'Dejar el equipo arrancado con el puente', ok: false, res: 'El botón de la caja sigue sin funcionar.' }
        ],
        explicacion: [
          ['Qué pasa', 'Un equipo recién montado no responde al botón, aunque la placa tiene energía.'],
          ['Por qué', 'Los cables del panel frontal son casi iguales y van a una fila de pines pequeños. Si el del botón está en otros pines, el contacto nunca llega a la placa.'],
          ['Qué no puede concluir la observación', 'Que no haga nada no significa que la fuente esté averiada: el LED de la placa y +5 VSB demuestran que está en espera.'],
          ['Cómo se resuelve', 'Puentea PWR_SW para confirmar y coloca los cables siguiendo el esquema del manual. Solo los LED tienen polaridad.'],
          ['Lección', 'El F_PANEL es el último paso del montaje y el más fácil de equivocar: sigue el manual pin a pin.']
        ],
        fallos: { panel: 'El cable «POWER SW» está en los pines de «PLED». Al puentear PWR_SW con un destornillador, el equipo arranca.' },
        res: { ent: 'Los alumnos conectaron el panel frontal al final, ya con prisa porque sonaba el timbre.', vis: 'Hay cinco cables pequeños en la fila de pines inferior. No se puede saber a simple vista si están bien.', fue: 'Con el equipo apagado: +5 VSB presente y PS_ON# en alto. La fuente espera la orden de arrancar.', min: 'En mínima configuración tampoco responde al botón.', banco: 'Fuera de la caja, puenteando los pines de encendido, la placa arranca.', panel: 'El cable «POWER SW» está en los pines de «PLED». Al puentear PWR_SW con un destornillador, el equipo arranca.', atx: 'El conector de 24 pines está bien enganchado.', ram: 'No se puede probar la RAM: el equipo no arranca.', tmp: 'No se puede medir: el equipo no arranca.', cam: 'Con otra fuente pasa exactamente lo mismo.' },
        luz: { fue: ['fuente', 'ok'], banco: ['placa', 'ok'], panel: ['caja', 'bad'], atx: ['caja', 'ok'], cam: ['fuente', 'ok'] }, volt: [0, 0, 0] },

      /* 36 · corto */
      { t: 'El ordenador de Bea', s: 'Bea ha instalado ella misma una tarjeta wifi en su ordenador porque el cable de red no llegaba a su nuevo cuarto. Al terminar, cerró la caja, la puso de pie y la encendió: los ventiladores dieron medio giro y todo se apagó. Lo ha intentado varias veces con el mismo resultado.', causa: 'corto', senales: { ps: 5.0, sb: 5.0 },
        pistas: ['La fuente arranca y se corta al instante: parece una protección actuando.', 'Prueba la fuente sola. Si funciona, el problema está en lo que tiene conectado.', 'Piensa en todo lo que pudo moverse o caerse dentro de la caja al ponerla de pie.'],
        discrima: { ids: ['min', 'banco'], texto: 'Un arranque que se corta puede ser la fuente o un corto. Prueba la fuente sola y la placa fuera de la caja antes de confirmarlo.' },
        explica: 'Un tornillo se cayó al instalar la tarjeta y quedó atrapado entre la placa y la chapa: provoca un cortocircuito.',
        reparaciones: [
          { t: 'Sacar la placa, retirar el tornillo suelto y volver a montarla', ok: true, res: 'Sin el tornillo, el equipo arranca dentro de la caja.' },
          { t: 'Quitar la tarjeta wifi', ok: false, res: 'La tarjeta no es la causa: el corto lo provoca el tornillo.' },
          { t: 'Cambiar la fuente', ok: false, res: 'La fuente sola funciona: se está protegiendo de un corto.' }
        ],
        verificaciones: [
          { t: 'Arrancar con la placa en la caja y probar la tarjeta wifi', ok: true, res: 'Arranca de forma estable y la tarjeta se conecta a la red.' },
          { t: 'Dejarlo funcionando fuera de la caja', ok: false, res: 'Falta comprobar que dentro de la caja ya no hay corto.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras manipular el interior, el equipo arranca un instante y se apaga.'],
          ['Por qué', 'Un tornillo suelto puede hacer contacto entre pistas del dorso de la placa y la chapa. La fuente detecta el exceso de corriente y se protege cortando (SCP).'],
          ['Qué no puede concluir la medición', '0 V tras el intento no distingue una fuente averiada de una fuente en protección.'],
          ['Cómo se resuelve', 'Prueba la fuente sola y la placa fuera de la caja. Si fuera arranca, busca objetos metálicos sueltos y separadores mal colocados.'],
          ['Lección', 'Cuenta los tornillos que sacas y los que vuelves a poner. Uno que falta puede estar donde no debe.']
        ],
        fallos: { banco: 'Fuera de la caja la placa arranca sin problemas. Al sacarla, cae un tornillo pequeño de detrás de la placa.' },
        res: { ent: 'Bea dice que «se le cayó un tornillito» al poner la tarjeta, pero no lo encontró y pensó que se habría ido al suelo.', vis: 'Al inclinar la torre se oye algo metálico, pero no se ve nada desde arriba.', fue: 'Tras el intento, los raíles están a 0 V y +5 VSB está presente. Hay que separar la fuente de la placa.', min: 'Fuente sola, sin placa y con PS_ON# puenteado: da las tres tensiones en tolerancia. La fuente funciona.', banco: 'Fuera de la caja la placa arranca sin problemas. Al sacarla, cae un tornillo pequeño de detrás de la placa.', panel: 'El panel frontal está bien conectado.', gpu: 'La tarjeta wifi está bien asentada en su ranura.', ram: 'No se puede probar: el equipo no se mantiene encendido.', tmp: 'No se puede medir.', cam: 'Con otra fuente pasa lo mismo.' },
        luz: { fue: ['fuente', 'bad'], min: ['fuente', 'ok'], banco: ['caja', 'bad'], panel: ['caja', 'ok'], cam: ['fuente', 'ok'] }, volt: [0, 0, 0] },

      /* 37 · ram (defectuosa) */
      { t: 'La familia Navarro', s: 'En casa de los Navarro, el ordenador familiar sirve para todo: los deberes, la declaración de la renta y las películas. Desde hace un mes, cada pocos días se queda la pantalla azul con un mensaje distinto, y la última vez se corrompió un trabajo de clase de la hija pequeña. El padre ya ha reinstalado Windows y sigue pasando.', causa: 'ram', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Si reinstalar Windows no lo arregla, piensa en hardware.', 'Errores distintos y datos que se estropean: comprueba dónde se guardan los datos mientras el equipo trabaja.', 'Un test de memoria, módulo a módulo y después reencajando, señala al culpable.'],
        discrima: { ids: ['ram', 'reenc'], exige: { ram: 'fallo', reenc: 'fallo' }, texto: 'Los errores de memoria también los provoca un módulo mal asentado. Prueba en otro slot y reencaja antes de confirmarlo.' },
        explica: 'Uno de los módulos de RAM tiene celdas defectuosas y corrompe datos al azar.',
        reparaciones: [
          { t: 'Sustituir el módulo defectuoso', ok: true, requiere: { reenc: 'fallo' }, res: 'Con el módulo nuevo el test pasa sin errores y no hay más pantallazos.', noJustificada: 'El reencaje ya resolvió el fallo.' },
          { t: 'Reinstalar Windows otra vez', ok: false, res: 'Ya se hizo y no sirvió: el fallo es físico.' },
          { t: 'Cambiar el disco', ok: false, res: 'El disco está sano: los datos se corrompen en la memoria.' }
        ],
        verificaciones: [
          { t: 'Pasar un test de memoria completo sin errores', ok: true, res: 'Varias pasadas sin un solo error.' },
          { t: 'Usar el equipo una hora y darlo por bueno', ok: false, res: 'El fallo aparecía cada pocos días.' }
        ],
        explicacion: [
          ['Qué pasa', 'Pantallazos azules aleatorios y archivos dañados, incluso tras reinstalar el sistema.'],
          ['Por qué', 'Todo lo que se guarda pasa antes por la RAM. Si un módulo tiene celdas que fallan, los datos que pasan por ellas se alteran: unas veces se cuelga el sistema y otras se guarda un archivo dañado.'],
          ['Qué no puede concluir la prueba en otro slot', 'Que el fallo siga al módulo no demuestra que esté roto: un mal encaje también falla. El reencaje lo separa.'],
          ['Cómo se resuelve', 'Prueba los módulos de uno en uno con un test de memoria, reencaja el que falle y, si sigue dando errores, sustitúyelo.'],
          ['Lección', 'Si reinstalar no arregla un fallo, no lo repitas: busca en el hardware.']
        ],
        fallos: { ram: 'Con el módulo 2 solo, el test da errores en cualquier slot. Con el módulo 1 solo, ninguno.', reenc: 'Reencajado hasta el fondo, el módulo 2 sigue dando errores.' },
        res: { ent: 'El ordenador tiene cinco años y nunca se ha abierto. El padre reinstaló Windows hace dos semanas.', vis: 'Los módulos parecen bien encajados.', fue: 'Los raíles están en tolerancia.', carga: '+12 V estable en carga.', min: 'Con los dos módulos el test de memoria da errores. Hay que probarlos por separado.', ram: 'Con el módulo 2 solo, el test da errores en cualquier slot. Con el módulo 1 solo, ninguno.', reenc: 'Reencajado hasta el fondo, el módulo 2 sigue dando errores.', smart: 'El disco está sano.', tmp: 'Temperaturas normales.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], min: ['ram', 'bad'], ram: ['ram', 'bad'], reenc: ['ram', 'bad'], smart: ['disco', 'ok'], tmp: ['cpu', 'ok'] }, volt: [12.02, 5.01, 3.30] },

      /* 38 · xmp */
      { t: 'El equipo nuevo de Raúl', s: 'Raúl se ha montado un ordenador nuevo con piezas de gama alta. Al principio iba bien, pero tras ver un vídeo de «trucos para ganar rendimiento» cambió algunas cosas en la BIOS. Ahora los juegos se cierran sin aviso, a veces aparece una pantalla azul y una vez el equipo tardó un minuto en arrancar.', causa: 'xmp', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Todo empezó al cambiar ajustes en la BIOS, no al tocar ninguna pieza.', 'Los fallos aleatorios suelen ser memoria. Pero que fallen todos los módulos a la vez sería mucha casualidad.', 'Vuelve a los valores de fábrica de la BIOS y repite el test.'],
        discrima: { ids: ['ram', 'defecto'], texto: 'Errores de memoria también los dan módulos defectuosos. Prueba los módulos y carga los valores por defecto de la BIOS antes de confirmarlo.' },
        explica: 'Raúl activó un perfil de memoria (XMP) con una velocidad que su combinación de placa y módulos no aguanta de forma estable.',
        reparaciones: [
          { t: 'Cargar los valores por defecto de la BIOS o elegir un perfil de memoria más conservador', ok: true, res: 'Con la memoria a una velocidad estable, el test pasa y los juegos no se cierran.' },
          { t: 'Sustituir los dos módulos de RAM', ok: false, res: 'Los módulos funcionan bien a su velocidad estándar.' },
          { t: 'Reinstalar Windows', ok: false, res: 'El fallo está en la configuración de la memoria, no en el sistema.' }
        ],
        verificaciones: [
          { t: 'Pasar un test de memoria largo y jugar una hora', ok: true, res: 'El test pasa sin errores y el juego no se cierra.' },
          { t: 'Arrancar Windows y darlo por bueno', ok: false, res: 'Los fallos eran aleatorios: arrancar no demuestra nada.' }
        ],
        explicacion: [
          ['Qué pasa', 'Tras cambiar ajustes de la BIOS, el equipo se vuelve inestable: cierres, pantallazos y arranques lentos.'],
          ['Por qué', 'Un perfil XMP (o EXPO) sube la velocidad de la memoria por encima del estándar. No todas las combinaciones de placa, CPU y módulos lo aguantan: con un perfil demasiado agresivo, la memoria comete errores.'],
          ['Qué no puede concluir el test de memoria', 'Que los dos módulos den errores con el perfil activo no demuestra que estén rotos: hay que repetir el test con los valores de fábrica.'],
          ['Cómo se resuelve', 'Carga los valores por defecto de la BIOS y repite el test. Si pasa, prueba un perfil más suave o deja la memoria a su velocidad estándar.'],
          ['Lección', 'Si un equipo falla después de tocar la BIOS, deshaz los cambios antes de cambiar piezas.']
        ],
        fallos: { ram: 'Con el perfil activo, cada módulo por separado también da errores en el test, en cualquier slot.' },
        res: { ent: 'En la BIOS activó «el perfil XMP más alto» y subió algo más la velocidad de la memoria «porque el vídeo decía que se podía».', vis: 'Todo está bien montado y limpio.', fue: 'Los raíles están en tolerancia.', carga: '+12 V estable en carga.', min: 'Con lo mínimo sigue habiendo errores de memoria.', ram: 'Con el perfil activo, cada módulo por separado también da errores en el test, en cualquier slot.', reenc: 'Reencajar los módulos no cambia nada: siguen los errores.', defecto: 'Con los valores por defecto de la BIOS, la memoria trabaja a su velocidad estándar y el test pasa ocho pasadas sin errores.', bios: 'La BIOS está al día. Hay ajustes de memoria cambiados a mano.', tmp: 'Temperaturas normales.', gpu: 'La gráfica funciona bien.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], ram: ['ram', 'bad'], defecto: ['ram', 'ok'], tmp: ['cpu', 'ok'], gpu: ['grafica', 'ok'] }, volt: [12.03, 5.02, 3.31] },

      /* 39 · gpucalor */
      { t: 'La oficina técnica de Inés', s: 'Inés diseña piezas de maquinaria en 3D en una oficina técnica. Cuando hace girar los modelos más pesados, al cabo de un rato la imagen empieza a parpadear, aparecen líneas raras y el programa avisa de que «el controlador de pantalla ha dejado de responder». Con los modelos pequeños no pasa nunca.', causa: 'gpucalor', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['Líneas raras y un controlador de pantalla que se reinicia apuntan a la gráfica.', 'El fallo aparece tras un rato de trabajo intenso: mide temperaturas, de todos los componentes.', 'Una gráfica con años de uso puede tener su pasta térmica seca aunque los ventiladores giren.'],
        discrima: { ids: ['tmp', 'gpu'], texto: 'Un fallo bajo carga también lo provoca una CPU que se calienta. Mide la temperatura de la CPU y revisa la gráfica antes de confirmarlo.' },
        explica: 'La pasta térmica de la gráfica está seca: aunque los ventiladores giran, la GPU pasa de 95 °C y el controlador se reinicia.',
        reparaciones: [
          { t: 'Limpiar la gráfica y cambiar su pasta térmica (o enviarla al servicio técnico)', ok: true, res: 'Con pasta nueva la GPU se queda en 76 °C y no hay más fallos.' },
          { t: 'Reinstalar el controlador de la gráfica', ok: false, res: 'El controlador se reinicia por la temperatura: reinstalarlo no la baja.' },
          { t: 'Cambiar la fuente', ok: false, res: 'El raíl de 12 V aguanta bien en carga.' }
        ],
        verificaciones: [
          { t: 'Girar el modelo más pesado durante una hora midiendo la GPU', ok: true, res: 'La GPU no pasa de 76 °C y no hay parpadeos.' },
          { t: 'Abrir un modelo pequeño y darlo por bueno', ok: false, res: 'Con los modelos pequeños nunca fallaba.' }
        ],
        explicacion: [
          ['Qué pasa', 'Con mucha carga gráfica aparecen parpadeos y el controlador de pantalla se reinicia.'],
          ['Por qué', 'La pasta térmica une la GPU con su disipador. Con los años se seca y transmite peor el calor: los ventiladores giran, pero el calor no llega al disipador y la GPU se recalienta.'],
          ['Qué no puede concluir la observación', 'Ventiladores girando no garantizan una buena refrigeración: hay que medir.'],
          ['Cómo se resuelve', 'Mide la temperatura de la GPU en carga. Si es alta con los ventiladores bien, limpia la gráfica y cambia su pasta térmica, o envíala a un servicio técnico.'],
          ['Lección', 'Que un ventilador gire no significa que refrigere bien. La temperatura es la que manda.']
        ],
        fallos: { gpu: 'Los ventiladores de la gráfica giran a tope, pero la GPU llega a 97 °C en veinte minutos. La gráfica tiene seis años.' },
        res: { ent: 'La gráfica es la original del equipo, de hace seis años. Nunca se ha desmontado.', vis: 'El equipo está razonablemente limpio. Los ventiladores de la gráfica giran.', fue: 'Los raíles están en tolerancia.', carga: '+12 V estable en carga: la fuente aguanta.', min: 'Sin carga gráfica el fallo no aparece.', tmp: 'La CPU no pasa de 70 °C: está bien.', fan: 'Todos los ventiladores funcionan.', gpu: 'Los ventiladores de la gráfica giran a tope, pero la GPU llega a 97 °C en veinte minutos. La gráfica tiene seis años.', video: 'El cable de vídeo está bien y conectado a la gráfica.', ram: 'La RAM supera el test.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], carga: ['fuente', 'ok'], tmp: ['cpu', 'ok'], gpu: ['grafica', 'bad'], ram: ['ram', 'ok'] }, volt: [12.02, 5.01, 3.30] },

      /* 40 · video */
      { t: 'El colegio mayor San Juan', s: 'Lucas se ha traído su ordenador de casa al colegio mayor para estudiar. En casa tenía un monitor con un cable HDMI; aquí le han prestado uno antiguo con un cable azul de los de antes. Lo conecta en el único sitio donde encaja, enciende y el monitor dice «No signal», aunque el ordenador suena normal.', causa: 'video', senales: { ps: 0.2, sb: 5.0 },
        pistas: ['El ordenador arranca como siempre: lo único que ha cambiado es el monitor y el cable.', 'Que un cable encaje en un conector no significa que ese conector esté dando imagen.', 'Mira dónde está el conector azul en la trasera: ¿en la placa o en la gráfica?'],
        discrima: { ids: ['gpu', 'video'], texto: 'Sin imagen también puede ser una gráfica dañada en el transporte. Revisa la gráfica y la salida de vídeo antes de confirmarlo.' },
        explica: 'El monitor está conectado al VGA de la placa, que no da imagen porque hay una gráfica dedicada instalada.',
        reparaciones: [
          { t: 'Conectar el monitor a la gráfica con un adaptador o un cable adecuado', ok: true, res: 'Conectado a la gráfica, el monitor muestra la imagen.' },
          { t: 'Cambiar el monitor antiguo', ok: false, res: 'El monitor funciona: solo recibe señal de la salida equivocada.' },
          { t: 'Quitar la gráfica para usar el VGA de la placa', ok: false, res: 'Este procesador no tiene gráficos integrados: sin gráfica no habría imagen.' }
        ],
        verificaciones: [
          { t: 'Arrancar y ver la imagen desde la BIOS hasta el escritorio', ok: true, res: 'Hay imagen en todo el arranque.' },
          { t: 'Comprar el adaptador y darlo por bueno sin probar', ok: false, res: 'Falta conectar y comprobar.' }
        ],
        explicacion: [
          ['Qué pasa', 'Al cambiar de monitor y de cable, el equipo deja de dar imagen.'],
          ['Por qué', 'La salida VGA de la placa depende de los gráficos integrados del procesador. Si el procesador no los tiene, o la placa los desactiva al detectar una gráfica, esa salida no da imagen.'],
          ['Qué no puede concluir la observación', 'Que el cable encaje no demuestra que esa salida esté activa.'],
          ['Cómo se resuelve', 'Conecta el monitor a una salida de la gráfica. Si el monitor solo tiene VGA, usa un adaptador activo (por ejemplo, de HDMI o DisplayPort a VGA).'],
          ['Lección', 'Con gráfica dedicada, el monitor va a la gráfica, aunque haya que usar un adaptador.']
        ],
        fallos: { video: 'El cable VGA está en el conector azul del panel de E/S de la placa. La gráfica solo tiene salidas HDMI y DisplayPort.' },
        res: { ent: 'En casa usaba la salida HDMI «de abajo». Aquí el cable azul solo entraba en un conector «de arriba».', vis: 'El cable azul está en la parte superior de la trasera, en el panel de la placa. Es un indicio.', fue: 'Los valores de la fuente son correctos.', min: 'Pasa el POST con un pitido corto.', gpu: 'La gráfica está bien asentada y alimentada. No se ha movido con el viaje.', video: 'El cable VGA está en el conector azul del panel de E/S de la placa. La gráfica solo tiene salidas HDMI y DisplayPort.', eps: 'El EPS está bien conectado.', ram: 'La RAM está bien.', tmp: 'No se puede ver sin imagen.', cam: 'Cambiar la fuente no cambia nada.' },
        luz: { fue: ['fuente', 'ok'], min: ['cpu', 'ok'], gpu: ['grafica', 'ok'], video: ['grafica', 'bad'], eps: ['cpu', 'ok'], ram: ['ram', 'ok'] }, volt: [12.01, 5.02, 3.31] }
    ]
  }
});
