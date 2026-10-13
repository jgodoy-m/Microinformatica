/* Tema: averías en la placa base.
   Todo el contenido de este tema vive aquí. El motor (js/motor.js) no sabe nada de placas.
   Coordenadas de zonas: en píxeles de la imagen (ancho × alto de foto), formato [x, y, ancho, alto]. */
window.TEMAS = window.TEMAS || [];
window.TEMAS.push({
  id: 'placa-base',
  titulo: 'Averías en la placa base',
  resumen: 'Diagnostica cinco averías siguiendo el orden de la S12 y localiza cada conector en una placa real.',

  mapa: {
    foto: {
      src: 'motherboard.jpg',
      ancho: 1800,
      alto: 1497,
      alt: 'Foto frontal de una placa base ATX con sus conectores, zócalo, ranuras y disipadores',
      credito: {
        autor: 'PantheraLeo1359531',
        autorUrl: 'https://commons.wikimedia.org/wiki/File:Asus-ROG-Strix-Z390-F-Gaming-Motherboard_20201120_DSC6025.jpg',
        licencia: 'CC BY 4.0',
        licenciaUrl: 'https://creativecommons.org/licenses/by/4.0/',
        nota: 'Imagen reducida a 1800 px; sin otros cambios.'
      }
    },
    zonas: {
      vrm: {
        n: 'VRM (etapas de alimentación de la CPU)',
        d: 'Convierte +12 V en la tensión que necesita la CPU. Sus disipadores se calientan: un VRM sin refrigeración limita la CPU.',
        rects: [[200, 505, 160, 450], [140, 915, 850, 430], [400, 780, 170, 110]]
      },
      atx: {
        n: 'ATX 24 pines',
        d: 'Alimenta la placa desde la fuente. Tiene clip: no se fuerza.',
        rects: [[598, 128, 248, 62]]
      },
      eps: {
        n: 'EPS 4+4 pines',
        d: 'Alimenta la CPU con +12 V. Sin él, la placa no pasa el POST.',
        rects: [[226, 992, 50, 92]]
      },
      cpu: {
        n: 'Zócalo de CPU (LGA1151)',
        d: 'Socket del procesador. Comprueba socket y BIOS antes de cambiar la CPU.',
        rects: [[462, 505, 356, 282]]
      },
      ram: {
        n: 'Slots de RAM (DIMM)',
        d: 'Módulos DIMM. Dual channel con los slots que indique el manual.',
        rects: [[262, 222, 718, 200]]
      },
      pcie: {
        n: 'PCIe x16 y x1',
        d: 'Ranuras de la gráfica y de periféricos. La x16 puede tener menos carriles eléctricos.',
        rects: [[1066, 650, 546, 440]]
      },
      m21: {
        n: 'M.2_1 (SOCKET 3)',
        d: 'Para SSD NVMe o SATA según la clave del módulo y lo que admita la placa.',
        rects: [[1040, 650, 22, 290]]
      },
      m22: {
        n: 'M.2_2 bajo el disipador',
        d: 'Ranura M.2 cubierta por el disipador: hay que quitarlo para cambiar el SSD.',
        rects: [[1385, 330, 34, 240]]
      },
      m23: {
        n: 'M.2 junto a la CPU',
        d: 'Ranura M.2 horizontal al lado del zócalo. Sus tornillos fijan el módulo.',
        rects: [[905, 538, 112, 40]]
      },
      sata: {
        n: 'Puertos SATA 6 Gb/s',
        d: 'Datos para discos y unidades. Necesitan también alimentación SATA.',
        rects: [[1074, 110, 244, 92]]
      },
      usb3: {
        n: 'USB 3.2 frontal (Tipo-C)',
        d: 'Cabecera interna USB 3.2 para el frontal de la caja. Tiene muesca: no se fuerza.',
        rects: [[878, 138, 90, 40]]
      },
      usb2: {
        n: 'USB 2.0 interno',
        d: 'Cabeceras de 9 pines para los puertos USB de la caja. No confundir con la de 19 pines.',
        rects: [[1618, 352, 56, 300]]
      },
      fpanel: {
        n: 'F_PANEL (panel frontal)',
        d: 'Pulsador de encendido, reset y LED. Solo los LED tienen polaridad.',
        rects: [[1618, 128, 52, 135]]
      },
      chafan: {
        n: 'Ventiladores de caja (CHA_FAN)',
        d: 'Cabeceras de 4 pines para los ventiladores de la caja. Controlan la temperatura de todo el equipo.',
        rects: [[1372, 126, 170, 68]]
      },
      cpufan: {
        n: 'CPU_FAN',
        d: 'Ventilador de CPU, 4 pines (PWM). No lo conectes en un header de caja sin mirar.',
        rects: [[893, 1000, 60, 44]]
      },
      chipset: {
        n: 'Chipset',
        d: 'Controla SATA, USB y PCIe. Bajo su disipador: no se desmonta sin necesidad.',
        rects: [[1050, 205, 380, 380]]
      },
      bateria: {
        n: 'Batería CR2032',
        d: 'Mantiene la hora y la configuración de la BIOS. Si falla, la hora se pierde al apagar.',
        rects: [[1160, 800, 116, 130]]
      },
      superio: {
        n: 'Super I/O (controladora de E/S)',
        d: 'Gestiona puertos serie, ventiladores y sondas de temperatura de la placa.',
        rects: [[1195, 1120, 80, 110]]
      },
      audio: {
        n: 'Códec de audio',
        d: 'Convierte el audio digital en señal analógica para los jacks traseros y frontales.',
        rects: [[1395, 1162, 95, 100]]
      }
    }
  },

  simulador: {
    lamparas: [['fuente', 'FUENTE'], ['cpu', 'CPU'], ['ram', 'RAM'], ['disco', 'DISCO'], ['temp', 'TEMP.']],
    causaLampara: { fuente: 'fuente', ram: 'ram', eps: 'cpu', temp: 'temp', sata: 'disco' },
    causas: {
      fuente: 'Fuente de alimentación',
      ram: 'Módulo de RAM defectuoso',
      eps: 'Conector EPS de la CPU sin conectar',
      temp: 'Sobrecalentamiento (refrigeración)',
      sata: 'Cable de datos SATA suelto'
    },
    acciones: [
      ['ent', 'Preguntar al cliente'],
      ['vis', 'Inspección visual'],
      ['fue', 'Medir +12 V, +5 V y +3,3 V'],
      ['min', 'Mínima configuración (placa, CPU, 1 RAM)'],
      ['ram', 'Probar la RAM en otro slot'],
      ['eps', 'Revisar el conector EPS'],
      ['sata', 'Revisar el cable SATA'],
      ['tmp', 'Ver temperaturas'],
      ['cam', 'Cambiar la fuente por una de prueba']
    ],
    casos: [
      { t: 'No da señales de vida', s: 'Pulsas el botón y no pasa nada. No hay ventiladores ni LED.', causa: 'fuente',
        explica: 'Sin +5 VSB de espera la fuente no responde. Con una fuente de prueba la placa arranca.',
        explicacion: [
          ['Qué pasa', 'El equipo no responde: ni ventiladores ni LED. Pulsar el botón no sirve de nada si la fuente no está lista.'],
          ['Por qué', 'La fuente siempre entrega +5 VSB de espera, aunque el equipo esté apagado. Al pulsar el botón, la placa baja la señal PS_ON# y la fuente conecta los raíles principales. Sin +5 VSB no hay nadie que escuche el botón.'],
          ['Cómo se resuelve', 'Con el equipo enchufado y el interruptor de la fuente encendido, mide +5 VSB en el conector ATX (cable morado). Si no hay tensión, la fuente está averiada: cámbiala antes que la placa o la CPU.'],
          ['Lección', 'Sin tensión de espera no hay arranque. Mide la fuente antes de tocar la placa.']
        ],
        res: { ent: 'Hubo una tormenta anoche y el equipo se apagó de golpe.', vis: 'Nada quemado a simple vista. El cable está bien enchufado.', fue: 'Sin +5 VSB: la fuente no responde. Es la pista principal.', min: 'Sin tensión no se puede probar la configuración mínima.', ram: 'Sin tensión no hay nada que probar en la RAM.', eps: 'Sin tensión, el conector EPS no es el problema.', sata: 'Sin tensión, el disco no es el problema.', tmp: 'No se puede medir: el equipo no arranca.', cam: 'Con una fuente de prueba la placa arranca. La original estaba averiada.' },
        luz: { fue: ['fuente', 'bad'], cam: ['fuente', 'ok'] }, volt: [0, 0, 0] },
      { t: 'Pitidos y pantalla negra', s: 'Al arrancar suenan pitidos seguidos y la pantalla queda en negro.', causa: 'ram',
        explica: 'Con ese módulo no arranca en ningún slot. El otro módulo arranca en los dos.',
        explicacion: [
          ['Qué pasa', 'Pitidos seguidos y pantalla negra: el arranque se detiene en el POST por un fallo de memoria.'],
          ['Por qué', 'Con un módulo defectuoso, la BIOS no puede inicializar la memoria y emite un código de pitidos. El significado exacto depende del fabricante de la BIOS, así que consulta el manual de la placa.'],
          ['Cómo se resuelve', 'Prueba un módulo cada vez en los slots que indique el manual (en dual channel, normalmente A2 y B2). Si el fallo sigue con un módulo en cualquier slot, ese módulo es el culpable.'],
          ['Lección', 'Aísla un componente cada vez. Cambiar de slot separa el fallo del slot del fallo del módulo.']
        ],
        fallos: { ram: 'Con el módulo en otro slot, la placa también pita. El fallo viaja con el módulo, no con el slot.' },
        res: { ent: 'El cliente añadió memoria la semana pasada.', vis: 'Un módulo queda ligeramente levantado del slot.', fue: 'Los valores de la fuente son correctos.', min: 'Con una sola RAM el patrón de pitidos cambia según el módulo que pongas.', ram: 'Con ese módulo no arranca en ningún slot. El otro arranca en ambos.', eps: 'El EPS está bien conectado y la CPU tiene tensión.', tmp: 'Las temperaturas están en rango: no es el calor.', cam: 'Cambiar la fuente no altera los pitidos.' },
        luz: { fue: ['fuente', 'ok'], ram: ['ram', 'bad'], min: ['cpu', 'ok'], tmp: ['temp', 'ok'], vis: ['ram', 'bad'] } },
      { t: 'Se apaga a los 10 minutos de jugar', s: 'Arranca bien. Tras un rato de juego, el equipo se apaga de golpe.', causa: 'temp',
        explica: 'La CPU llega a 98 °C y la protección térmica corta. El disipador tiene polvo y el ventilador frena.',
        explicacion: [
          ['Qué pasa', 'El equipo arranca bien y, tras un rato de carga, se apaga de golpe sin aviso.'],
          ['Por qué', 'La CPU alcanza su temperatura máxima (Tjmax, cerca de 100 °C en muchos modelos) y la protección térmica corta la alimentación. El polvo en el disipador, un ventilador lento o una pasta de contacto seca reducen la disipación.'],
          ['Cómo se resuelve', 'Mide la temperatura bajo carga y las RPM del ventilador de CPU. Limpia el disipador, revisa el ventilador y, si la pasta está seca, reaplícala.'],
          ['Lección', 'Un apagado que se repite bajo carga apunta a la refrigeración. Mide antes de cambiar piezas.']
        ],
        fallos: { tmp: 'No hay lectura: el sensor de la CPU no responde en la BIOS. No conoces la temperatura real y hay que medirla bajo carga con otra herramienta.' },
        res: { ent: 'Pasa siempre en verano y con la caja cerrada.', vis: 'El disipador tiene polvo y el ventilador de CPU frena al tocarlo.', fue: 'La fuente está bien medida. No es ella.', min: 'Sin juego el fallo no aparece: la mínima configuración no lo reproduce.', ram: 'La RAM supera el test: no es la causa.', tmp: 'CPU a 98 °C antes de apagarse. La protección corta el equipo.', cam: 'Cambiar la fuente no cambia nada: sigue apagándose igual.' },
        luz: { fue: ['fuente', 'ok'], vis: ['temp', 'bad'], tmp: ['temp', 'bad'], ram: ['ram', 'ok'], cam: ['fuente', 'ok'] } },
      { t: 'Pantalla negra con ventiladores', s: 'Enciende, los ventiladores giran, pero no sale imagen y la placa no pasa el POST.', causa: 'eps',
        explica: 'El conector EPS de 8 pines está flojo. La CPU no recibe +12 V aunque la placa tenga tensión.',
        explicacion: [
          ['Qué pasa', 'Enciende, los ventiladores giran, pero no sale imagen y la placa no completa el POST.'],
          ['Por qué', 'El conector EPS de 8 pines alimenta la CPU directamente. La ATX de 24 pines alimenta la placa, pero sin EPS la CPU no recibe la tensión que necesita y el arranque no avanza.'],
          ['Cómo se resuelve', 'Desconecta el EPS, comprueba que no tiene pines doblados y vuelve a encajarlo hasta oír el clic. Después prueba de nuevo.'],
          ['Lección', 'ATX y EPS son conectores distintos. Que los ventiladores giren no demuestra que la CPU tenga alimentación.']
        ],
        fallos: { eps: 'El conector parece encajado, pero al presionarlo no hace clic. No está asentado y la CPU sigue sin alimentación.' },
        res: { ent: 'El equipo se movió al limpiarlo hace unos días.', vis: 'El cable EPS está algo suelto en la placa.', fue: 'Los valores de la fuente son correctos.', min: 'Con la configuración mínima sigue sin arrancar. Revisa la alimentación de la CPU.', eps: 'El conector EPS está flojo. Al encajarlo del todo, el equipo arranca.', ram: 'Probar la RAM no cambia el resultado: sigue en negro.', tmp: 'No se puede medir sin POST.', cam: 'Cambiar la fuente no soluciona la pantalla negra.' },
        luz: { fue: ['fuente', 'ok'], vis: ['cpu', 'bad'], min: ['cpu', 'bad'], eps: ['cpu', 'bad'], ram: ['ram', 'ok'] } },
      { t: 'El disco no aparece', s: 'En la BIOS no aparece el disco SATA. El resto del equipo funciona.', causa: 'sata',
        explica: 'El cable de datos está suelto. El disco tiene alimentación pero no datos.',
        explicacion: [
          ['Qué pasa', 'En la BIOS no aparece el disco SATA, pero el resto del equipo funciona con normalidad.'],
          ['Por qué', 'Un disco SATA necesita dos cables independientes: alimentación desde la fuente (conector SATA de 15 pines) y datos desde la placa (cable de 7 pines). El disco puede girar y no tener datos si el cable de datos está suelto.'],
          ['Cómo se resuelve', 'Revisa los dos cables por separado. Recoloca el de datos, prueba otro puerto SATA y, si hace falta, otro cable. Comprueba en la BIOS si el disco aparece.'],
          ['Lección', 'Revisa la alimentación y los datos por separado: un cable de datos suelto no se nota a simple vista.']
        ],
        res: { ent: 'El disco se cayó al mover la caja hace unos días.', vis: 'El cable de alimentación del disco está bien. El de datos parece suelto.', fue: 'Los valores de la fuente son correctos.', sata: 'El cable de datos está suelto. Al encajarlo, el disco aparece.', min: 'La mínima configuración arranca. El fallo está en el disco.', ram: 'La RAM no tiene nada que ver con un disco que no aparece.', cam: 'Cambiar la fuente no tiene sentido: el resto del equipo funciona.' },
        luz: { fue: ['fuente', 'ok'], vis: ['disco', 'bad'], sata: ['disco', 'bad'], min: ['cpu', 'ok'], ram: ['ram', 'ok'] } }
    ]
  }
});
