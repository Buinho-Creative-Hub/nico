/* Mascote Nico — o Podengo do Buinho Educativo (Messejana, Alentejo).
 * Homenagem a um pequeno podengo que vivia na rua do Buinho, em Messejana.
 * Perfil: pequeno inventor alentejano — curioso, brincalhão, um bocadinho trapalhão, persistente.
 * Sprites PROVISÓRIOS, recortados da prancha aprovada do estilo 4 (img/nico/_referencia-prancha-estilo4.png):
 * substituir pelos 8 PNG finais em alta resolução, com os mesmos nomes.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  F.registarMascote({
    id: 'nico',
    nome: 'Nico',
    artigo: 'o',
    descricao: 'Nico, o podengo do Buinho Educativo',
    ola: 'Olá! Sou o Nico, o podengo do Buinho.',
    perfil: 'Pequeno inventor de Messejana, de orelhas sempre no ar. Fareja pistas, mete-se em trapalhadas e aprende com elas.',
    pasta: 'img/nico/',
    sprites: {
      boas_vindas: '01_boas_vindas', curiosa: '02_curioso', a_pensar: '03_a_pensar', surpreendida: '04_surpreendido',
      dica: '05_a_dar_uma_dica', celebrar: '06_a_celebrar', incentivar: '06_a_celebrar',
      testar: '07_a_inventar', inventar: '07_a_inventar', calma: '08_trapalhao_calmo',
    },
    marca: {
      nome: 'Nico',
      sub: 'desafios micro:bit',
      icone: '<img src="img/nico/01_boas_vindas.png" alt="" aria-hidden="true">',
    },
    som: { voz: 523, musica: 'nico' },
    comuns: [
      {
        id: 'blocos_soltos',
        ativa: a => a.soltos.length > 0,
        pistas: [
          ['a_pensar', 'Tens blocos soltos na área cinzenta. Como é que eles sabem quando começar?'],
          ['dica', 'Os blocos que fazem coisas só correm dentro de um bloco cor-de-rosa.'],
          ['dica', 'Arrasta os blocos soltos para dentro da boca de um bloco cor-de-rosa.'],
        ],
        corrigido: 'Isso! Agora já sabem quando começar.',
      },
    ],
    gerais: {
      convite: ['curiosa', 'Precisas de uma ajudinha? Carrega em «Ajuda» e eu vou farejar uma pista.'],
      calma: ['calma', 'Sem pressa… A mim também me sai tudo trocado à primeira. Aprender também é isto. Queres uma pista?'],
      semPistas: ['incentivar', 'Estás no bom caminho. Experimenta e vê o que acontece!'],
      vazio: ['curiosa', 'A área cinzenta está vazia. Que tal arrastar o primeiro bloco da coluna branca?'],
      testeFalhou: ['a_pensar', 'Hmm… ainda não é bem isso. Olha para o micro:bit: o que é que ele fez?'],
      gambiarraObrigada: ['celebrar', 'Boa! Afinal faltava só pôr o bloco no sítio certo. Já podemos inventar outra coisa!'],
      voltarPrograma: ['incentivar', 'De volta ao teu programa. Obrigado pela ajuda!'],
      fimMissao: ['celebrar', 'Missão cumprida! Bora farejar outra?'],
    },
  });
})();
