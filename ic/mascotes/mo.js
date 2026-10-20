/* Mascote Mo — a toupeira que mapeia pelo tato (PROVISÓRIA: desenho SVG do Pacheco; identidade final pelo Ambrósio).
 * Quase não vê: conhece os túneis pelas mãos, pelo cheiro e pelas vibrações do chão. Curiosa, direta, gosta de saber
 * o que vem a seguir.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  F.registarMascote({
    id: 'mo',
    nome: 'Mo',
    artigo: 'a',
    descricao: { en: 'Mo, the mole who maps by touch', sr: 'Мо, кртица која мапира додиром', es: 'Mo, el topo que mapea con el tacto', pt: 'Mo, a toupeira que mapeia pelo tato' },
    ola: { en: 'Hi! I’m Mo. I know places by touch and by the shake of the ground.', sr: 'Здраво! Ја сам Мо. Места препознајем додиром и подрхтавањем тла.', es: '¡Hola! Soy Mo. Conozco los lugares por el tacto y las vibraciones del suelo.', pt: 'Olá! Sou a Mo. Conheço os sítios pelo tato e pelas vibrações do chão.' },
    perfil: { en: 'Barely sees, but feels every texture and vibration. Likes to know what comes next — surprises are hard work.',
      sr: 'Скоро да не види, али осећа сваку текстуру и вибрацију. Воли да зна шта следи — изненађења су напорна.',
      es: 'Casi no ve, pero siente cada textura y vibración. Le gusta saber qué viene después: las sorpresas le cuestan.',
      pt: 'Quase não vê, mas sente cada textura e vibração. Gosta de saber o que vem a seguir — as surpresas cansam.' },
    pasta: 'img/mo/', ext: '.svg',
    sprites: {
      boas_vindas: '01_boas_vindas', curiosa: '02_curiosa', a_pensar: '03_a_pensar', surpreendida: '04_surpreendida',
      dica: '05_a_dar_uma_dica', celebrar: '06_a_celebrar', incentivar: '07_a_incentivar', calma: '08_calma',
      testar: '02_curiosa', inventar: '07_a_incentivar',
    },
    marca: { nome: 'Sensing Lab', sub: 'Invisible Cartographies', icone: '' },
    som: { voz: 392, musica: 'gabi' },
    comuns: [
      {
        id: 'blocos_soltos',
        ativa: a => a.soltos.length > 0,
        pistas: [
          ['a_pensar', { en: 'I can feel blocks lying loose in the grey area. When will they run?', sr: 'Осећам блокове који леже слободно у сивој површини. Када ће се покренути?', es: 'Noto bloques sueltos en el área gris. ¿Cuándo se van a ejecutar?', pt: 'Sinto blocos soltos na área cinzenta. Quando é que vão correr?' }],
          ['dica', { en: 'Blocks only run inside a pink block (or «forever»).', sr: 'Блокови раде само унутар розе блока (или «заувек»).', es: 'Los bloques solo funcionan dentro de un bloque rosa (o «para siempre»).', pt: 'Os blocos só correm dentro de um bloco cor-de-rosa (ou do «para sempre»).' }],
          ['dica', { en: 'Drag the loose blocks into the mouth of a pink block.', sr: 'Превуци слободне блокове у отвор розе блока.', es: 'Arrastra los bloques sueltos dentro de un bloque rosa.', pt: 'Arrasta os blocos soltos para dentro da boca de um bloco cor-de-rosa.' }],
        ],
        corrigido: { en: 'Got it! Everything is in its place.', sr: 'Тако! Све је на свом месту.', es: '¡Listo! Todo está en su sitio.', pt: 'Pronto! Está tudo no sítio.' },
      },
    ],
    gerais: {
      convite: ['curiosa', { en: 'Stuck? Press «Help» and I’ll dig up a clue.', sr: 'Заглавио си се? Притисни «Помоћ» и ископаћу траг.', es: '¿Atascado? Pulsa «Ayuda» y desenterraré una pista.', pt: 'Encravaste? Carrega em «Ajuda» e eu escavo uma pista.' }],
      calma: ['calma', { en: 'Let’s slow down. One block at a time — that’s how I dig too. Want a clue?', sr: 'Хајде полако. Блок по блок — тако и ја копам. Хоћеш траг?', es: 'Vamos más despacio. Un bloque cada vez: así cavo yo también. ¿Quieres una pista?', pt: 'Vamos com calma. Um bloco de cada vez — também é assim que eu escavo. Queres uma pista?' }],
      semPistas: ['incentivar', { en: 'You’re on the right track. Try it out!', sr: 'На добром си путу. Испробај!', es: 'Vas por buen camino. ¡Pruébalo!', pt: 'Estás no bom caminho. Experimenta!' }],
      vazio: ['curiosa', { en: 'The grey area is empty. Start with the first block from the white column.', sr: 'Сива површина је празна. Почни првим блоком из беле колоне.', es: 'El área gris está vacía. Empieza con el primer bloque de la columna blanca.', pt: 'A área cinzenta está vazia. Começa pelo primeiro bloco da coluna branca.' }],
      testeFalhou: ['a_pensar', { en: 'Not yet. What did the micro:bit do? Let’s check step by step.', sr: 'Још не. Шта је micro:bit урадио? Хајде да проверимо корак по корак.', es: 'Todavía no. ¿Qué ha hecho el micro:bit? Revisemos paso a paso.', pt: 'Ainda não. O que é que o micro:bit fez? Vamos ver passo a passo.' }],
      gambiarraObrigada: ['celebrar', { en: 'Thank you! My tunnel was blocked and you cleared it.', sr: 'Хвала! Мој тунел је био затрпан, а ти си га раскрчио.', es: '¡Gracias! Mi túnel estaba tapado y lo has despejado.', pt: 'Obrigada! O meu túnel estava tapado e tu desimpediste-o.' }],
      voltarPrograma: ['incentivar', { en: 'Back to your program. Thanks!', sr: 'Назад на твој програм. Хвала!', es: 'De vuelta a tu programa. ¡Gracias!', pt: 'De volta ao teu programa. Obrigada!' }],
      fimMissao: ['celebrar', { en: 'Mission complete! What shall we explore next?', sr: 'Мисија завршена! Шта ћемо следеће да истражимо?', es: '¡Misión cumplida! ¿Qué exploramos ahora?', pt: 'Missão cumprida! O que exploramos a seguir?' }],
    },
  });
})();
