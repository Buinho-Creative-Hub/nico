/* Mascote Lio — o morcego que mapeia pelo som (PROVISÓRIA: desenho SVG do Pacheco; identidade final pelo Ambrósio,
 * handoff 2026-10-20_pacheco_ambrosio_ic-identidade-plataforma). Ouve o eco das salas; gosta de lugares calmos e
 * tem uns abafadores para quando há barulho a mais — como muitas crianças.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  F.registarMascote({
    id: 'lio',
    nome: 'Lio',
    artigo: 'o',
    descricao: { en: 'Lio, the bat who maps by sound', sr: 'Лио, слепи миш који мапира звуком', es: 'Lio, el murciélago que mapea con el sonido', pt: 'Lio, o morcego que mapeia pelo som' },
    ola: { en: 'Hi! I’m Lio. I find my way by listening.', sr: 'Здраво! Ја сам Лио. Сналазим се слушајући.', es: '¡Hola! Soy Lio. Me oriento escuchando.', pt: 'Olá! Sou o Lio. Oriento-me a ouvir.' },
    perfil: { en: 'Hears echoes that others miss. Loves quiet corners and carries ear defenders for loud days.',
      sr: 'Чује одјеке које други не примећују. Воли тихе кутке и носи заштиту за уши за бучне дане.',
      es: 'Oye ecos que otros no notan. Le encantan los rincones tranquilos y lleva protectores para los días ruidosos.',
      pt: 'Ouve ecos que os outros não notam. Adora cantos sossegados e leva abafadores para os dias barulhentos.' },
    pasta: 'img/lio/', ext: '.svg',
    sprites: {
      boas_vindas: '01_boas_vindas', curiosa: '02_curiosa', a_pensar: '03_a_pensar', surpreendida: '04_surpreendida',
      dica: '05_a_dar_uma_dica', celebrar: '06_a_celebrar', incentivar: '07_a_incentivar', calma: '08_calma',
      testar: '02_curiosa', inventar: '07_a_incentivar',
    },
    marca: { nome: 'Sensing Lab', sub: 'Invisible Cartographies', icone: '' },
    som: { voz: 660, musica: 'gabi' },
    comuns: [
      {
        id: 'blocos_soltos',
        ativa: a => a.soltos.length > 0,
        pistas: [
          ['a_pensar', { en: 'Some blocks are floating on their own in the grey area. How will they know when to start?', sr: 'Неки блокови стоје сами у сивој површини. Како ће знати када да почну?', es: 'Hay bloques sueltos en el área gris. ¿Cómo sabrán cuándo empezar?', pt: 'Há blocos soltos na área cinzenta. Como é que eles sabem quando começar?' }],
          ['dica', { en: 'Blocks that do things only run inside a pink block (or «forever»).', sr: 'Блокови који нешто раде покрећу се само унутар розе блока (или «заувек»).', es: 'Los bloques que hacen cosas solo funcionan dentro de un bloque rosa (o «para siempre»).', pt: 'Os blocos que fazem coisas só correm dentro de um bloco cor-de-rosa (ou do «para sempre»).' }],
          ['dica', { en: 'Drag the loose blocks into the mouth of a pink block.', sr: 'Превуци слободне блокове у отвор розе блока.', es: 'Arrastra los bloques sueltos dentro de un bloque rosa.', pt: 'Arrasta os blocos soltos para dentro da boca de um bloco cor-de-rosa.' }],
        ],
        corrigido: { en: 'That’s it! Now they know when to start.', sr: 'То је то! Сад знају када да почну.', es: '¡Eso es! Ahora ya saben cuándo empezar.', pt: 'Isso! Agora já sabem quando começar.' },
      },
    ],
    gerais: {
      convite: ['curiosa', { en: 'Need a hand? Press «Help» and I’ll listen for a clue.', sr: 'Треба ти помоћ? Притисни «Помоћ» и ослушнућу траг.', es: '¿Necesitas ayuda? Pulsa «Ayuda» y buscaré una pista con mis orejas.', pt: 'Precisas de uma ajudinha? Carrega em «Ajuda» e eu vou à escuta de uma pista.' }],
      calma: ['calma', { en: 'No rush… Let’s take a breath. It didn’t work the first time for me either. Want a clue?', sr: 'Без журбе… Хајде да удахнемо. Ни мени није успело из првог пута. Хоћеш траг?', es: 'Sin prisa… Respiremos. A mí tampoco me salió a la primera. ¿Quieres una pista?', pt: 'Sem pressa… Vamos respirar. A mim também não saiu à primeira. Queres uma pista?' }],
      semPistas: ['incentivar', { en: 'You’re on the right track. Try it and see what happens!', sr: 'На добром си путу. Пробај и види шта ће се десити!', es: 'Vas por buen camino. ¡Pruébalo y mira qué pasa!', pt: 'Estás no bom caminho. Experimenta e vê o que acontece!' }],
      vazio: ['curiosa', { en: 'The grey area is empty. How about dragging the first block from the white column?', sr: 'Сива површина је празна. Хоћеш да превучеш први блок из беле колоне?', es: 'El área gris está vacía. ¿Arrastramos el primer bloque de la columna blanca?', pt: 'A área cinzenta está vazia. Que tal arrastar o primeiro bloco da coluna branca?' }],
      testeFalhou: ['a_pensar', { en: 'Hmm… not quite yet. Look at the micro:bit: what did it do?', sr: 'Хм… још није то. Погледај micro:bit: шта је урадио?', es: 'Mmm… todavía no. Mira el micro:bit: ¿qué ha hecho?', pt: 'Hmm… ainda não é bem isso. Olha para o micro:bit: o que é que ele fez?' }],
      gambiarraObrigada: ['celebrar', { en: 'Thank you! You fixed my program. Now it really listens.', sr: 'Хвала ти! Поправио си мој програм. Сад стварно слуша.', es: '¡Gracias! Arreglaste mi programa. Ahora sí escucha.', pt: 'Obrigado! Arranjaste o meu programa. Agora sim, ouve.' }],
      voltarPrograma: ['incentivar', { en: 'Back to your program. Thanks for the help!', sr: 'Назад на твој програм. Хвала на помоћи!', es: 'De vuelta a tu programa. ¡Gracias por la ayuda!', pt: 'De volta ao teu programa. Obrigado pela ajuda!' }],
      fimMissao: ['celebrar', { en: 'Mission complete! Shall we map another one?', sr: 'Мисија завршена! Хоћемо да мапирамо још једну?', es: '¡Misión cumplida! ¿Mapeamos otra?', pt: 'Missão cumprida! Mapeamos outra?' }],
    },
  });
})();
