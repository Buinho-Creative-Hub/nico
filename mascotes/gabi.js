/* Mascote Gabi — a capivara da gambiarra.
 * Nasceu para a atividade com a UFV (Viçosa, Brasil), Out 2026. Ilustrações aprovadas pelo Carlos (não redesenhar).
 * Perfil: calma, divertida, faz gambiarras e pede ajuda para as reparar.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  F.registarMascote({
    id: 'gabi',
    nome: 'Gabi',
    artigo: 'a',
    descricao: 'Gabi, a capivara da gambiarra',
    ola: 'Olá! Sou a Gabi, a capivara da gambiarra.',
    perfil: 'Capivara tranquila e muito desenrascada. Adora gambiarras — e às vezes faz uma mal feita de propósito para tu reparares.',
    pasta: 'img/gabi/',
    sprites: {
      boas_vindas: '01_boas_vindas', curiosa: '02_curiosa', a_pensar: '03_a_pensar', surpreendida: '04_surpreendida',
      dica: '05_a_dar_uma_dica', celebrar: '06_a_celebrar', incentivar: '07_a_incentivar', calma: '08_calma',
      testar: '02_curiosa', inventar: '07_a_incentivar',
    },
    // a plataforma chama-se Nico (homenagem ao podengo da rua do Buinho); a marca é a mesma com qualquer mascote
    marca: {
      nome: 'Nico',
      sub: 'desafios micro:bit',
      icone: '<img src="img/nico/01_boas_vindas.png" alt="" aria-hidden="true">',
    },
    // som: a voz é um «blip» curto quando fala; a música é um ritmo calmo e balançado
    som: { voz: 330, musica: 'gabi' },
    comuns: [
      {
        id: 'blocos_soltos',
        ativa: a => a.soltos.length > 0,
        pistas: [
          ['a_pensar', 'Tens blocos soltos na área cinzenta. Será que eles sabem quando começar?'],
          ['dica', 'Os blocos que fazem coisas só correm se estiverem dentro de um bloco cor-de-rosa.'],
          ['dica', 'Arrasta os blocos soltos para dentro da boca de um bloco cor-de-rosa.'],
        ],
        corrigido: 'Isso! Agora esses blocos já sabem quando começar.',
      },
    ],
    gerais: {
      convite: ['curiosa', 'Precisas de uma ajudinha? Carrega em «Ajuda».'],
      calma: ['calma', 'Respira fundo… Não funcionou à primeira? A mim também não. Queres uma pista?'],
      semPistas: ['incentivar', 'Estás no bom caminho. Experimenta e vê o que acontece!'],
      vazio: ['curiosa', 'A área cinzenta está vazia. Que tal arrastar o primeiro bloco da coluna branca?'],
      testeFalhou: ['a_pensar', 'Hmm… ainda não é bem isso. Olha para o micro:bit: o que é que ele fez?'],
      gambiarraObrigada: ['celebrar', 'Obrigada! Reparaste a minha gambiarra. És mesmo maker!'],
      voltarPrograma: ['incentivar', 'De volta ao teu programa. Obrigada pela ajuda!'],
      fimMissao: ['celebrar', 'Missão cumprida! Escolhe outra missão — eu vou contigo.'],
    },
  });
})();
