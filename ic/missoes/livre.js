/* IC Sensing Lab — Modo livre: sem desafios nem validação. Os blocos da plataforma por categorias, como no MakeCode,
 * mais as gavetas do kit (Octopus: ruído, luz, PIR, BME280) e a extensão Sensory OLED do projeto.
 * A gaveta OLED da ELECFREAKS fica de fora de propósito: no IC usa-se só a Sensory OLED (as duas desenham no mesmo ecrã).
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const { T } = F.IC;
  F.CATEGORIAS_LIVRE = F.CATEGORIAS_LIVRE.filter(([nome]) => nome !== 'OLED');
  F.registarMissao({
    id: 'livre',
    modoLivre: true,
    titulo: T('Free mode', 'Слободни режим', 'Modo libre', 'Modo livre'),
    tema: T('Invent without rules', 'Измишљај без правила', 'Inventar sin reglas', 'Inventar sem regras'),
    descricao: T('All the blocks, in drawers like MakeCode — including the kit sensors and the Sensory OLED screen.', 'Сви блокови, у фиокама као у MakeCode-у — укључујући сензоре из комплета и Sensory OLED екран.', 'Todos los bloques, en cajones como en MakeCode, incluidos los sensores del kit y la pantalla Sensory OLED.', 'Todos os blocos, em gavetas como no MakeCode — incluindo os sensores do kit e o ecrã Sensory OLED.'),
    cor: '#13233A',
    niveis: [{
      nome: T('Free mode', 'Слободни режим', 'Modo libre', 'Modo livre'),
      desafios: [{
        titulo: T('Free mode', 'Слободни режим', 'Modo libre', 'Modo livre'),
        missao: T('Invent whatever you like: choose a drawer on the left and drag the blocks.', 'Измисли шта год желиш: изабери фиоку лево и превуци блокове.', 'Inventa lo que quieras: elige un cajón a la izquierda y arrastra los bloques.', 'Inventa o que quiseres: escolhe uma gaveta à esquerda e arrasta os blocos.'),
        passos: [
          T('Open the drawers (Basic, Input, Music…) and drag blocks.', 'Отвори фиоке (Основно, Улаз, Музика…) и превуци блокове.', 'Abre los cajones (Básico, Entrada, Música…) y arrastra bloques.', 'Abre as gavetas (Básico, Entrada, Música…) e arrasta os blocos.'),
          T('Have the kit? Use the Octopus and Sensory OLED drawers.', 'Имаш комплет? Користи фиоке Octopus и Sensory OLED.', '¿Tienes el kit? Usa los cajones Octopus y Sensory OLED.', 'Tens o kit? Usa as gavetas Octopus e Sensory OLED.'),
          T('Test on screen, then send it to the micro:bit.', 'Испробај на екрану, па пошаљи на micro:bit.', 'Prueba en pantalla y envíalo al micro:bit.', 'Experimenta no ecrã e envia para o micro:bit.'),
          T('Started before? Press “Open project” and choose your .hex file.', 'Почео си раније? Притисни „Отвори пројекат“ и изабери свој .hex фајл.', '¿Empezaste antes? Pulsa «Abrir proyecto» y elige tu archivo .hex.', 'Já tinhas começado? Carrega em «Abrir projeto» e escolhe o teu ficheiro .hex.'),
        ],
        material: T('micro:bit V2 (and the Smart Science IoT Kit, if you have it)', 'micro:bit V2 (и Smart Science IoT Kit, ако га имаш)', 'micro:bit V2 (y el Smart Science IoT Kit, si lo tienes)', 'micro:bit V2 (e o Smart Science IoT Kit, se o tiveres)'),
        novos: [], livre: true, ok: () => false,
        tutor: {
          boasVindas: ['boas_vindas', T('Free mode! All the blocks are here, in drawers like MakeCode. Invent away — I’m here if you need me.', 'Слободни режим! Сви блокови су ту, у фиокама као у MakeCode-у. Измишљај — ту сам ако ти затребам.', '¡Modo libre! Todos los bloques están aquí, en cajones como en MakeCode. Inventa: estoy aquí si me necesitas.', 'Modo livre! Estão cá todos os blocos, em gavetas como no MakeCode. Inventa à vontade — estou aqui se precisares.')],
          parecePronto: () => false, testar: '', regras: [], sucesso: '', extensao: '',
        },
      }],
    }],
  });
})();
