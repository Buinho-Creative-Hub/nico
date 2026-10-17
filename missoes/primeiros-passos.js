/* Missão «Primeiros passos» — programação e robótica com o micro:bit.
 *
 * 3 níveis × 11 desafios guiados (+ o projeto livre que o motor junta no fim de cada nível).
 * Os 6 primeiros (16–17 Out 2026, testados com micro:bit V2) abrem os níveis 1 e 2, sem mudanças.
 * Em cada nível: desafios 1–6 curtos; 7–11 projetos de 15–20 minutos.
 * Conteúdo da primeira versão com a Gabi, agora escrito para qualquer mascote ({ola}, [o|a]).
 *
 * Cada regra pedagógica descreve uma dificuldade que se reconhece no programa:
 *   id         nome curto
 *   ativa(a)   true quando a dificuldade está presente (a = análise do programa)
 *   pistas     três níveis: [estado do sprite, texto]
 *                1 pista conceptual · 2 pista orientadora · 3 ajuda concreta
 *   corrigido  o que a mascote diz quando a criança resolve sozinha
 * As regras são lidas pela ordem: a primeira activa é a que conta.
 * O sucesso NÃO é decidido nas regras: é o comportamento do programa (ok).
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const { icones, tem, soltoCom } = F.ajudasTutor;
  const { depois, visiveis, algumPino } = F.verif;

  // ------------------------------------------------------------ pistas (pela ordem dos desafios)
  const TUTOR = [
    // ---------------------------------------------------------- 1 · Acorda-o
    {
      boasVindas: ['boas_vindas', '{ola} Vamos acordar este micro:bit? Quero vê-lo sorrir quando o agitas.'],
      parecePronto: a => icones(a.evento('agitar'), 'Happy').length > 0,
      testar: 'Parece-me bem! Mas só acredito vendo: carrega em AGITAR.',
      regras: [
        {
          id: 'sem_agitar',
          ativa: a => !a.evento('agitar'),
          pistas: [
            ['curiosa', 'Como é que o micro:bit vai saber que o agitaste? Há um bloco que fica à escuta…'],
            ['dica', 'Procura na coluna branca um bloco cor-de-rosa que fale em agitar.'],
            ['dica', 'Arrasta «em agitar» para a área cinzenta.'],
          ],
          corrigido: 'Boa! Agora o micro:bit já está à escuta.',
        },
        {
          id: 'icone_fora',
          ativa: a => !!a.evento('agitar') && icones(a.evento('agitar')).length === 0 && soltoCom(a, 'mk_icone'),
          pistas: [
            ['a_pensar', 'O ícone está sozinho… quando é que ele vai aparecer?'],
            ['dica', 'O «mostrar ícone» tem de ficar dentro do «em agitar», como uma peça de puzzle.'],
            ['dica', 'Encaixa «mostrar ícone» na boca do bloco «em agitar».'],
          ],
          corrigido: 'Encaixou! Já fazem equipa.',
        },
        {
          id: 'sem_icone',
          ativa: a => !!a.evento('agitar') && icones(a.evento('agitar')).length === 0,
          pistas: [
            ['curiosa', 'O micro:bit já sente que o agitas. E depois, o que é que ele faz?'],
            ['dica', 'Há um bloco azul que desenha nas luzes do micro:bit.'],
            ['dica', 'Põe «mostrar ícone» dentro de «em agitar».'],
          ],
          corrigido: 'Isso, agora ele já tem alguma coisa para fazer!',
        },
        {
          id: 'icone_errado',
          ativa: a => icones(a.evento('agitar')).length > 0 && icones(a.evento('agitar'), 'Happy').length === 0,
          pistas: [
            ['surpreendida', 'Que cara é essa? A missão pede um sorriso.'],
            ['dica', 'Carrega na setinha ao lado do desenho para escolher outro.'],
            ['dica', 'Escolhe a cara contente na lista do ícone.'],
          ],
          corrigido: 'Agora sim, um sorriso!',
        },
      ],
      sucesso: 'Acordou! Fizeste o micro:bit sorrir.',
      extensao: 'E se ele fizesse uma cara diferente quando o agitas outra vez?',
      gambiarra: {
        xml: '<xml><block type="mk_agitar" x="40" y="40"></block><block type="mk_icone" x="320" y="70"><field name="I">Happy</field></block></xml>',
        pedido: 'Acho que fiz uma gambiarra… agito e não acontece nada! Consegues descobrir o que me esqueci?',
      },
    },

    // ---------------------------------------------------------- 2 · Coração a bater
    {
      boasVindas: ['boas_vindas', 'Agora quero um coração a bater! Quando tocares no logotipo, ele bate 4 vezes.'],
      parecePronto: a => {
        const ev = a.evento('logo');
        return icones(ev, 'Heart').length > 0 && icones(ev, 'SmallHeart').length > 0 && ev.plano.filter(p => p.tipo === 'mk_pausa').length >= 2;
      },
      testar: 'Parece-me bem! Mas só acredito vendo: toca no logotipo dourado.',
      regras: [
        {
          id: 'sem_logo',
          ativa: a => !a.evento('logo'),
          pistas: [
            ['curiosa', 'O coração deve bater quando tocas no logotipo. Quem é que fica à escuta do logotipo?'],
            ['dica', 'Procura o bloco cor-de-rosa que fala no logotipo.'],
            ['dica', 'Arrasta «ao logotipo pressionado» para a área cinzenta.'],
          ],
          corrigido: 'Boa, o logotipo já está à escuta!',
        },
        {
          id: 'fora_do_logo',
          ativa: a => !!a.evento('logo') && !tem(a.evento('logo'), 'mk_icone') && (soltoCom(a, 'mk_repetir') || soltoCom(a, 'mk_icone')),
          pistas: [
            ['a_pensar', 'Os corações estão fora do logotipo. Quando é que vão bater?'],
            ['dica', 'Tudo o que fica fora de um bloco cor-de-rosa nunca corre.'],
            ['dica', 'Arrasta o «repetir» (com os corações) para dentro de «ao logotipo pressionado».'],
          ],
          corrigido: 'Agora estão no sítio certo!',
        },
        {
          id: 'sem_coracoes',
          ativa: a => !!a.evento('logo') && (icones(a.evento('logo'), 'Heart').length === 0 || icones(a.evento('logo'), 'SmallHeart').length === 0),
          pistas: [
            ['curiosa', 'Para bater, o coração tem de mudar: grande… pequeno… grande…'],
            ['dica', 'Precisas de dois «mostrar ícone»: um com o coração e outro com o coração pequeno.'],
            ['dica', 'Põe o coração grande e depois o coração pequeno, um a seguir ao outro.'],
          ],
          corrigido: 'Já tens os dois corações!',
        },
        {
          id: 'sem_pausa',
          ativa: a => !!a.evento('logo') && a.evento('logo').plano.filter(p => p.tipo === 'mk_pausa').length === 0,
          pistas: [
            ['curiosa', 'Hmm… o coração está a mudar tão depressa! Será que conseguimos controlar o tempo?'],
            ['dica', 'Procura um bloco azul que nos deixe esperar um bocadinho entre os desenhos.'],
            ['dica', 'Experimenta colocar uma pausa de 200 ms depois de cada coração.'],
          ],
          corrigido: 'Isso! Com a pausa já se vê o coração.',
        },
        {
          id: 'uma_pausa',
          ativa: a => !!a.evento('logo') && a.evento('logo').plano.filter(p => p.tipo === 'mk_pausa').length === 1,
          pistas: [
            ['a_pensar', 'Já está quase a bater! Mas um dos corações aparece e desaparece num instante…'],
            ['dica', 'Cada desenho precisa do seu tempo de espera.'],
            ['dica', 'Põe outra pausa a seguir ao coração que não tem nenhuma.'],
          ],
          corrigido: 'Agora os dois corações têm tempo para aparecer.',
        },
        {
          id: 'sem_repetir',
          ativa: a => {
            const ev = a.evento('logo');
            return !!ev && !tem(ev, 'mk_repetir') && icones(ev, 'Heart').length < 4;
          },
          pistas: [
            ['curiosa', 'O coração bate uma vez… e depois? Quantas vezes queres que ele bata?'],
            ['dica', 'Há um bloco verde que repete coisas sem teres de as copiar.'],
            ['dica', 'Põe «repetir 4 vezes» dentro do logotipo e os corações e as pausas dentro do «repetir».'],
          ],
          corrigido: 'Isso, o verde faz o trabalho repetido por ti!',
        },
        {
          id: 'coracoes_fora_do_repetir',
          ativa: a => {
            const ev = a.evento('logo');
            return !!ev && tem(ev, 'mk_repetir') && icones(ev).some(p => p.dentroDe !== 'mk_repetir') && icones(ev).filter(p => p.dentroDe === 'mk_repetir').length < 2;
          },
          pistas: [
            ['a_pensar', 'O «repetir» está lá, mas o que é que ele está a repetir?'],
            ['dica', 'O «repetir» só repete o que está dentro da boca dele.'],
            ['dica', 'Mete os corações e as pausas dentro do «repetir».'],
          ],
          corrigido: 'Agora o «repetir» tem o que repetir!',
        },
        {
          id: 'poucas_vezes',
          ativa: a => {
            const r = (a.evento('logo') || { plano: [] }).plano.find(p => p.tipo === 'mk_repetir');
            return !!r && r.n < 4;
          },
          pistas: [
            ['a_pensar', 'Conta as batidas… quantas são?'],
            ['dica', 'O número no bloco verde diz quantas vezes ele repete.'],
            ['dica', 'Muda o número do «repetir» para 4.'],
          ],
          corrigido: 'Quatro batidas, certinho!',
        },
      ],
      sucesso: 'Boa! Agora já consigo ver o coração a bater. Descobriste como controlar o tempo!',
      extensao: 'E se fizéssemos o coração bater cada vez mais depressa?',
      gambiarra: {
        xml: '<xml><block type="mk_logo" x="40" y="40"><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">4</field></shadow></value><statement name="DO"><block type="mk_icone"><field name="I">Heart</field><next><block type="mk_icone"><field name="I">SmallHeart</field></block></next></block></statement></block></statement></block></xml>',
        pedido: 'Acho que fiz uma gambiarra… mas não está a funcionar! O coração não bate. Consegues descobrir o que me esqueci de fazer?',
      },
    },

    // ---------------------------------------------------------- 3 · Sim ou não?
    {
      boasVindas: ['boas_vindas', 'Vamos dar respostas ao micro:bit: botão A diz que sim, botão B diz que não.'],
      parecePronto: a => icones(a.evento('botao:A'), 'Happy').length > 0 && icones(a.evento('botao:B'), 'Sad').length > 0,
      testar: 'Parece-me bem! Experimenta carregar no A e depois no B.',
      regras: [
        {
          id: 'botoes_repetidos',
          ativa: a => a.eventosDe('botao:A').length > 1 && !a.evento('botao:B'),
          pistas: [
            ['surpreendida', 'Tens dois botões A! E o B, fica sem nada?'],
            ['dica', 'Cada bloco de botão tem uma letra que se pode mudar.'],
            ['dica', 'Carrega na setinha do segundo botão e escolhe B.'],
          ],
          corrigido: 'Agora cada botão tem a sua letra.',
        },
        {
          id: 'sem_botao_A',
          ativa: a => !a.evento('botao:A'),
          pistas: [
            ['curiosa', 'Quem é que fica à escuta do botão A?'],
            ['dica', 'Procura o bloco cor-de-rosa «no botão A premido».'],
            ['dica', 'Arrasta «no botão A premido» e põe lá dentro a cara contente.'],
          ],
          corrigido: 'O botão A já está à escuta!',
        },
        {
          id: 'sem_botao_B',
          ativa: a => !a.evento('botao:B'),
          pistas: [
            ['curiosa', 'O A já responde. E quando carregas no B?'],
            ['dica', 'Usa outro bloco de botão e muda a letra.'],
            ['dica', 'Arrasta mais um «no botão premido», escolhe B e põe lá a cara triste.'],
          ],
          corrigido: 'Agora os dois botões respondem!',
        },
        {
          id: 'caras_trocadas',
          ativa: a => icones(a.evento('botao:A'), 'Happy').length === 0 || icones(a.evento('botao:B'), 'Sad').length === 0,
          pistas: [
            ['a_pensar', 'Olha bem para as caras: o A diz que sim e o B diz que não?'],
            ['dica', 'Muda o desenho com a setinha do «mostrar ícone».'],
            ['dica', 'No A põe a cara contente, no B a cara triste.'],
          ],
          corrigido: 'Caras certas nos botões certos!',
        },
      ],
      sucesso: 'Sim e não! O micro:bit já responde às tuas perguntas.',
      extensao: 'Consegues fazer uma pergunta a um colega e o micro:bit responde?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_icone"><field name="I">Happy</field></block></statement></block><block type="mk_botao" x="40" y="180"><statement name="DO"><block type="mk_icone"><field name="I">Sad</field></block></statement></block></xml>',
        pedido: 'Fiz uma gambiarra: carrego no B e não acontece nada! Consegues descobrir porquê?',
      },
    },

    // ---------------------------------------------------------- 4 · Faz barulho
    {
      boasVindas: ['boas_vindas', 'Hora do barulho! Carrega nos dois botões ao mesmo tempo e o micro:bit ri-se.'],
      parecePronto: a => tem(a.evento('botao:AB'), 'mk_som'),
      testar: 'Parece-me bem! Carrega em A+B para ouvir.',
      regras: [
        {
          id: 'sem_AB',
          ativa: a => !a.evento('botao:AB'),
          pistas: [
            ['curiosa', 'Os dois botões juntos… há um bloco que fica à escuta disso?'],
            ['dica', 'É o bloco do botão com a letra «A+B».'],
            ['dica', 'Arrasta «no botão A+B premido» para a área cinzenta.'],
          ],
          corrigido: 'O A+B já está à escuta!',
        },
        {
          id: 'som_noutro_sitio',
          ativa: a => !tem(a.evento('botao:AB'), 'mk_som') && a.existe('mk_som'),
          pistas: [
            ['a_pensar', 'O som está noutro sítio… quando é que ele vai tocar?'],
            ['dica', 'O som tem de ficar dentro do bloco A+B.'],
            ['dica', 'Arrasta «tocar som» para dentro de «no botão A+B premido».'],
          ],
          corrigido: 'Agora o som está no sítio certo!',
        },
        {
          id: 'sem_som',
          ativa: a => !tem(a.evento('botao:AB'), 'mk_som'),
          pistas: [
            ['curiosa', 'O A+B já está à escuta. E o que é que se ouve?'],
            ['dica', 'Procura um bloco vermelho de música.'],
            ['dica', 'Põe «tocar som» dentro do A+B.'],
          ],
          corrigido: 'Já tem som!',
        },
      ],
      sucesso: 'Ahahah! O micro:bit riu-se. Fizeste barulho!',
      extensao: 'Experimenta outro som. Qual é o mais engraçado?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><field name="B">AB</field></block><block type="mk_som" x="340" y="90"><value name="S"><shadow type="mk_som_menu"><field name="V">giggle</field></shadow></value></block></xml>',
        pedido: 'A minha gambiarra está muda! Carrego em A+B e nada. Ajudas-me?',
      },
    },

    // ---------------------------------------------------------- 5 · Piano de fruta
    {
      boasVindas: ['boas_vindas', 'Gambiarra a sério: vamos fazer uma banana tocar música!'],
      parecePronto: a => a.eventosDe('pino:').some(e => tem(e, 'mk_tom')),
      testar: 'Parece-me bem! Toca no pin 1 (ou na banana, segurando o GND).',
      regras: [
        {
          id: 'sem_pino',
          ativa: a => a.eventosDe('pino:').length === 0,
          pistas: [
            ['curiosa', 'Como é que o micro:bit sabe que tocaste na banana?'],
            ['dica', 'Há um bloco cor-de-rosa que fica à escuta de um pin.'],
            ['dica', 'Arrasta «no pin P1 premido» para a área cinzenta.'],
          ],
          corrigido: 'O pin já está à escuta!',
        },
        {
          id: 'sem_tom',
          ativa: a => !a.eventosDe('pino:').some(e => tem(e, 'mk_tom')),
          pistas: [
            ['curiosa', 'Já sente o toque. E que nota é que toca?'],
            ['dica', 'Usa o bloco vermelho que toca uma nota.'],
            ['dica', 'Põe «tocar tom» dentro de «no pin P1 premido».'],
          ],
          corrigido: 'Já toca!',
        },
      ],
      sucesso: 'Uma banana musical! Isto é que é gambiarra.',
      extensao: 'Liga outra fruta ao pin 0 e faz um piano de duas notas!',
      gambiarra: {
        xml: '<xml><block type="mk_pino_tocado" x="40" y="40"></block><block type="mk_tom" x="340" y="90"><value name="F"><shadow type="mk_nota_menu"><field name="V">262</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">1</field></shadow></value></block></xml>',
        pedido: 'A minha banana está calada! Fiz alguma gambiarra mal feita?',
      },
    },

    // ---------------------------------------------------------- 6 · Luz de fora
    {
      boasVindas: ['boas_vindas', 'Último desafio: uma luz de verdade, fora do micro:bit, que acende com a música.'],
      parecePronto: a => a.eventosDe('pino:').some(e => e.plano.some(p => p.tipo === 'mk_digital' && p.v === 1) && e.plano.some(p => p.tipo === 'mk_digital' && p.v === 0) && tem(e, 'mk_tom')),
      testar: 'Parece-me bem! Toca no pin 1 e olha para o LED.',
      regras: [
        {
          id: 'sem_digital',
          ativa: a => !a.eventosDe('pino:').some(e => tem(e, 'mk_digital')),
          pistas: [
            ['curiosa', 'Como é que o micro:bit manda energia para o LED?'],
            ['dica', 'Há um bloco vermelho-escuro dos pinos que liga e desliga.'],
            ['dica', 'Põe «gravação digital pin P2 para 1» antes da nota.'],
          ],
          corrigido: 'Já mandas energia para o LED!',
        },
        {
          id: 'nunca_apaga',
          ativa: a => a.eventosDe('pino:').some(e => e.plano.some(p => p.tipo === 'mk_digital' && p.v === 1)) && !a.eventosDe('pino:').some(e => e.plano.some(p => p.tipo === 'mk_digital' && p.v === 0)),
          pistas: [
            ['surpreendida', 'O LED acende… e fica aceso para sempre!'],
            ['dica', 'Para desligar, o mesmo bloco usa outro número.'],
            ['dica', 'Põe «gravação digital pin P2 para 0» depois da nota.'],
          ],
          corrigido: 'Agora acende e apaga!',
        },
        {
          id: 'ordem_trocada',
          ativa: a => a.eventosDe('pino:').some(e => {
            const i1 = e.plano.findIndex(p => p.tipo === 'mk_digital' && p.v === 1);
            const i0 = e.plano.findIndex(p => p.tipo === 'mk_digital' && p.v === 0);
            return i1 >= 0 && i0 >= 0 && i0 < i1;
          }),
          pistas: [
            ['a_pensar', 'Primeiro apagas e só depois acendes? Lê os blocos de cima para baixo.'],
            ['dica', 'A ordem conta: acender, tocar, apagar.'],
            ['dica', 'Troca: o «para 1» em cima da nota e o «para 0» por baixo.'],
          ],
          corrigido: 'Ordem certinha!',
        },
      ],
      sucesso: 'Luz e música! Fizeste o teu primeiro circuito com o micro:bit.',
      extensao: 'E se a luz piscasse três vezes enquanto toca?',
      gambiarra: {
        xml: '<xml><block type="mk_pino_tocado" x="40" y="40"><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">262</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">1</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></next></block></next></block></statement></block></xml>',
        pedido: 'O meu LED nunca se apaga! Acho que fiz uma gambiarra… Encontras o erro?',
      },
    },
  ];

  // ------------------------------------------------------------ desafios (o que se pede e como se valida)
  const DESAFIOS = [
    {
      titulo: 'Acorda-o',
      missao: 'Faz o micro:bit sorrir quando o agitas.',
      passos: ['Arrasta o bloco «em agitar».', 'Põe lá dentro «mostrar ícone» com a cara contente.', 'Experimenta: carrega em AGITAR.'],
      material: 'micro:bit',
      novos: ['mk_agitar', 'mk_icone'],
      teste: 'agitar',
      ok: r => depois(r, 'agitar', s => s.includes('icone:Happy')),
    },
    {
      titulo: 'Coração a bater',
      missao: 'Quando tocas no logótipo, o coração bate 4 vezes.',
      passos: ['O logotipo é o desenho dourado lá em cima.', 'Dentro de «repetir 4 vezes»: coração, pausa, coração pequeno, pausa.', 'Experimenta: toca no logótipo.'],
      material: 'micro:bit V2',
      novos: ['mk_logo', 'mk_repetir', 'mk_icone_coracao', 'mk_icone_pequeno', 'mk_pausa'],
      teste: 'logo',
      ok: r => visiveis(r, 'logo', 'Heart') >= 4 && visiveis(r, 'logo', 'SmallHeart') >= 4,
    },
    {
      titulo: 'Sim ou não?',
      missao: 'Botão A: cara contente. Botão B: cara triste.',
      passos: ['Usa dois blocos «no botão premido».', 'No segundo, muda a letra para B.', 'Experimenta os dois botões.'],
      material: 'micro:bit',
      novos: ['mk_botao', 'mk_botao_B', 'mk_icone_triste'],
      teste: 'botao:A',
      ok: r => depois(r, 'botao:A', s => s.includes('icone:Happy')) && depois(r, 'botao:B', s => s.includes('icone:Sad')),
    },
    {
      titulo: 'Faz barulho',
      missao: 'Carrega no A e no B ao mesmo tempo e o micro:bit ri-se.',
      passos: ['Usa «no botão A+B premido».', 'Põe lá dentro «tocar som».', 'Escolhe o som que quiseres.'],
      material: 'micro:bit V2 (altifalante)',
      novos: ['mk_botao_AB', 'mk_som'],
      caixa: ['mk_agitar', 'mk_icone', 'mk_logo', 'mk_repetir', 'mk_icone_coracao', 'mk_icone_pequeno', 'mk_pausa', 'mk_botao', 'mk_botao_B', 'mk_icone_triste'],   // a caixa que tinha antes de haver mais desafios no nível 1
      teste: 'botao:AB',
      ok: r => depois(r, 'botao:AB', s => s.some(x => x.startsWith('som:'))),
    },
    {
      titulo: 'Piano de fruta',
      missao: 'Toca numa banana e o micro:bit toca uma nota.',
      passos: ['Crocodilo do pin 1 à banana (ou a papel de alumínio).', 'Outro crocodilo no GND, seguro na mão.', 'Usa «no pin P1 premido» com «tocar tom».'],
      material: '2 crocodilos + uma fruta',
      novos: ['mk_pino_tocado', 'mk_tom'],
      caixa: ['mk_agitar', 'mk_icone', 'mk_logo', 'mk_repetir', 'mk_icone_coracao', 'mk_icone_pequeno', 'mk_pausa', 'mk_botao', 'mk_botao_B', 'mk_icone_triste', 'mk_botao_AB', 'mk_som'],
      teste: 'pino:P1',
      ok: r => algumPino(r, s => s.some(x => x.startsWith('tom:'))),
    },
    {
      titulo: 'Luz de fora',
      missao: 'Quando a banana toca, acende-se uma luz de fora.',
      passos: ['LED com crocodilos: perna comprida no pin 2, perna curta no GND.', '«gravação digital pin P2 para 1» antes da nota, «para 0» depois.', 'Experimenta: toca no pin 1.'],
      material: 'LED + 2 crocodilos',
      novos: ['mk_digital_1', 'mk_digital_0'],
      caixa: ['mk_agitar', 'mk_icone', 'mk_logo', 'mk_repetir', 'mk_icone_coracao', 'mk_icone_pequeno', 'mk_pausa', 'mk_botao', 'mk_botao_B', 'mk_icone_triste', 'mk_botao_AB', 'mk_som', 'mk_pino_tocado', 'mk_tom'],
      teste: 'pino:P1',
      // aceita qualquer pino de saída: o que conta é acender, tocar e apagar
      ok: r => algumPino(r, s => {
        const a = s.findIndex(x => /^digital:P\d:1$/.test(x));
        if (a < 0) return false;
        const pino = s[a].split(':')[1];
        const n = s.findIndex((x, i) => i > a && x.startsWith('tom:'));
        return n > a && s.indexOf('digital:' + pino + ':0', n) > n;
      }),
    },
  ];

  const D = DESAFIOS.map((d, i) => Object.assign(d, { tutor: TUTOR[i] }));

  // ============================================================ ajudas para os desafios novos
  const P = F.pistas;
  const { blocos, dentro } = F.ajudasTutor;
  const { causou, aposSensor, numeros } = F.verif;
  const com = (id, r) => Object.assign(r, { id });                 // dá um nome curto a uma receita de pista
  const ev = (a, k) => a.evento(k);
  const plano = e => e ? e.plano : [];
  const usa = (p, t) => (p.usa || []).some(u => u.tipo === t);
  const ses = e => plano(e).filter(p => p.tipo === 'mk_se' || p.tipo === 'mk_se_entao');
  const achatarRamo = (lista, acc = []) => { for (const d of lista || []) { acc.push(d); achatarRamo(d.corpo, acc); achatarRamo(d.sim, acc); achatarRamo(d.nao, acc); } return acc; };
  const ramo = (p, qual) => achatarRamo(p && p[qual]);
  const temR = (lista, tipo) => lista.some(d => d.tipo === tipo || (d.usa || []).some(u => u.tipo === tipo));
  const icoR = (lista, nome) => lista.some(d => d.tipo === 'mk_icone' && d.icone === nome);
  const freqs = e => blocos(e, 'mk_tom').map(p => p.freq);
  const distintos = l => new Set(l).size;
  const indice = (e, f) => plano(e).findIndex(f);
  // quantas notas tocam (um «tocar tom» dentro de «repetir 3» conta 3)
  function nToms(e) {
    const p = plano(e); let n = 0;
    for (let i = 0; i < p.length; i++) {
      if (p[i].tipo !== 'mk_tom') continue;
      let mult = 1, prof = p[i].prof;
      for (let j = i - 1; j >= 0 && prof > 0; j--) if (p[j].prof === prof - 1) { if (p[j].tipo === 'mk_repetir') mult *= Math.max(0, p[j].n || 0); prof--; }
      n += mult;
    }
    return n;
  }
  // valor de verdade de «leitor ⋄ número» quando o leitor vale x (null se não der para saber)
  function verdade(p, leitor, x) {
    const u = p.usa || [];
    const c = u.find(e => e.tipo === 'mk_comparar');
    const iL = u.findIndex(e => e.tipo === leitor), iN = u.findIndex(e => e.tipo === 'mk_num');
    if (!c || iL < 0 || iN < 0) return null;
    const n = u[iN].n, [A, B] = iL < iN ? [x, n] : [n, x];
    switch (c.op) { case '<': return A < B; case '>': return A > B; case '==': return A === B; case '<=': return A <= B; case '>=': return A >= B; case '!=': return A !== B; }
    return null;
  }
  // por cada vez que a entrada aconteceu: o instante e as saídas (com o instante) até à entrada seguinte
  function apos(reg, ok) {
    const r = [];
    for (let i = 0; i < reg.length; i++) {
      const e = reg[i];
      if (e.dir !== 'in' || !ok(e.v)) continue;
      const outs = [];
      for (let j = i + 1; j < reg.length && reg[j].dir === 'out'; j++) outs.push(reg[j]);
      r.push({ t: e.t, v: e.v, outs });
    }
    return r;
  }
  const outsDe = (reg, ent) => apos(reg, v => v === ent);
  const tonsDe = outs => outs.filter(o => o.v.startsWith('tom:')).map(o => Number(o.v.slice(4)));
  const angulo = v => Number(String(v).split(':')[2]);
  const servos = outs => outs.filter(o => o.v.startsWith('servo:')).map(o => angulo(o.v));
  // estado de um sensor no momento de cada entrada
  function porEstado(reg, sensor, entradaOk) {
    const out = []; let estado;
    for (let i = 0; i < reg.length; i++) {
      const e = reg[i];
      if (e.dir !== 'in') continue;
      if (e.v.startsWith(sensor + ':')) estado = Number(e.v.split(':').pop());
      if (!entradaOk(e.v)) continue;
      const s = [];
      for (let j = i + 1; j < reg.length && reg[j].dir === 'out'; j++) s.push(reg[j].v);
      out.push({ estado, saidas: s });
    }
    return out;
  }
  const temSom = s => s.some(x => x.startsWith('tom:') || x.startsWith('som:'));

  // programas «gambiarra» — gerados em testes/casos/primeiros-passos.js (node testes/casos/primeiros-passos.js --sincronizar)
  const G = /*G*/{
    "nome": "<xml><block type=\"mk_agitar\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_mostrar_texto\"><value name=\"T\"><shadow type=\"mk_texto\"><field name=\"TXT\">Maria</field></shadow></value></block></statement></block></xml>",
    "cantos": "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_acender\"><value name=\"X\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_acender\"><value name=\"X\"><shadow type=\"mk_num\"><field name=\"NUM\">4</field></shadow></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_acender\"><value name=\"X\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">4</field></shadow></value><next><block type=\"mk_acender\"><value name=\"X\"><shadow type=\"mk_num\"><field name=\"NUM\">3</field></shadow></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">4</field></shadow></value></block></next></block></next></block></next></block></statement></block></xml>",
    "pisca": "<xml><block type=\"mk_agitar\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_repetir\"><value name=\"N\"><shadow type=\"mk_num\"><field name=\"NUM\">3</field></shadow></value><statement name=\"DO\"><block type=\"mk_icone\"><field name=\"I\">Heart</field><next><block type=\"mk_limpar\"></block></next></block></statement></block></statement></block></xml>",
    "cartao": "<xml><block type=\"mk_logo\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_repetir\"><value name=\"N\"><shadow type=\"mk_num\"><field name=\"NUM\">2</field></shadow></value><statement name=\"DO\"><block type=\"mk_icone\"><field name=\"I\">Heart</field><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">262</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">SmallHeart</field><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">262</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></next></block></next></block></next></block></statement></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><statement name=\"DO\"><block type=\"mk_mostrar_texto\"><value name=\"T\"><shadow type=\"mk_texto\"><field name=\"TXT\">Parabéns</field></shadow></value></block></statement></block></xml>",
    "semaforo": "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_icone\"><field name=\"I\">No</field><next><block type=\"mk_icone\"><field name=\"I\">Yes</field><next><block type=\"mk_repetir\"><value name=\"N\"><shadow type=\"mk_num\"><field name=\"NUM\">3</field></shadow></value><statement name=\"DO\"><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">523</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_pausa\"><value name=\"MS\"><shadow type=\"mk_pausa_menu\"><field name=\"V\">200</field></shadow></value></block></next></block></statement><next><block type=\"mk_icone\"><field name=\"I\">No</field></block></next></block></next></block></next></block></statement></block></xml>",
    "emocoes": "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_icone\"><field name=\"I\">Happy</field><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">523</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_icone\"><field name=\"I\">Sad</field><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">523</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></next></block></statement></block><block type=\"mk_logo\" x=\"40\" y=\"480\"><statement name=\"DO\"><block type=\"mk_icone\"><field name=\"I\">Surprised</field><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">392</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></next></block></statement></block><block type=\"mk_agitar\" x=\"40\" y=\"640\"><statement name=\"DO\"><block type=\"mk_repetir\"><value name=\"N\"><shadow type=\"mk_num\"><field name=\"NUM\">3</field></shadow></value><statement name=\"DO\"><block type=\"mk_icone\"><field name=\"I\">Silly</field><next><block type=\"mk_pausa\"><value name=\"MS\"><shadow type=\"mk_pausa_menu\"><field name=\"V\">200</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">Asleep</field><next><block type=\"mk_pausa\"><value name=\"MS\"><shadow type=\"mk_pausa_menu\"><field name=\"V\">200</field></shadow></value></block></next></block></next></block></next></block></statement></block></statement></block></xml>",
    "caixa": "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_icone\"><field name=\"I\">Heart</field><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">262</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">330</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">392</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">440</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">523</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">392</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">262</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">330</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">392</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">440</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">523</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">392</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>",
    "cobra": "<xml><block type=\"mk_logo\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_repetir\"><value name=\"N\"><shadow type=\"mk_num\"><field name=\"NUM\">2</field></shadow></value><statement name=\"DO\"><block type=\"mk_acender\"><value name=\"X\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">2</field></shadow></value><next><block type=\"mk_acender\"><value name=\"X\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">2</field></shadow></value><next><block type=\"mk_acender\"><value name=\"X\"><shadow type=\"mk_num\"><field name=\"NUM\">2</field></shadow></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">2</field></shadow></value><next><block type=\"mk_acender\"><value name=\"X\"><shadow type=\"mk_num\"><field name=\"NUM\">3</field></shadow></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">2</field></shadow></value><next><block type=\"mk_acender\"><value name=\"X\"><shadow type=\"mk_num\"><field name=\"NUM\">4</field></shadow></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">2</field></shadow></value><next><block type=\"mk_limpar\"></block></next></block></next></block></next></block></next></block></next></block></statement></block></statement></block></xml>",
    "agudo": "<xml><block type=\"mk_gesto\" x=\"40\" y=\"160\"><field name=\"G\">left</field><statement name=\"DO\"><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">262</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></statement></block><block type=\"mk_gesto\" x=\"40\" y=\"320\"><field name=\"G\">right</field><statement name=\"DO\"><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">262</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></statement></block></xml>",
    "galo": "<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_escuro\"></block></value><statement name=\"SIM\"><block type=\"mk_icone\"><field name=\"I\">Happy</field></block></statement><statement name=\"NAO\"><block type=\"mk_icone\"><field name=\"I\">Asleep</field></block></statement></block></statement></block></xml>",
    "bandeira": "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">180</field></shadow></value><next><block type=\"mk_som\"><value name=\"S\"><shadow type=\"mk_som_menu\"><field name=\"V\">happy</field></shadow></value></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">180</field></shadow></value></block></statement></block></xml>",
    "orquestra": "<xml><block type=\"mk_pino_tocado\" x=\"40\" y=\"160\"><field name=\"P\">P0</field><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">262</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></next></block></next></block></statement></block><block type=\"mk_pino_tocado\" x=\"40\" y=\"320\"><field name=\"P\">P1</field><statement name=\"DO\"><block type=\"mk_icone\"><field name=\"I\">Happy</field><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">523</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"480\"><field name=\"B\">AB</field><statement name=\"DO\"><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">262</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">294</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">330</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">330</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">392</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></next></block></next></block></next></block></next></block></statement></block></xml>",
    "carro": "<xml><block type=\"mk_gesto\" x=\"40\" y=\"160\"><field name=\"G\">left</field><statement name=\"DO\"><block type=\"mk_repetir\"><value name=\"N\"><shadow type=\"mk_num\"><field name=\"NUM\">3</field></shadow></value><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_pausa\"><value name=\"MS\"><shadow type=\"mk_pausa_menu\"><field name=\"V\">200</field></shadow></value><next><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_pausa\"><value name=\"MS\"><shadow type=\"mk_pausa_menu\"><field name=\"V\">200</field></shadow></value></block></next></block></next></block></next></block></statement></block></statement></block><block type=\"mk_gesto\" x=\"40\" y=\"320\"><field name=\"G\">right</field><statement name=\"DO\"><block type=\"mk_repetir\"><value name=\"N\"><shadow type=\"mk_num\"><field name=\"NUM\">3</field></shadow></value><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_pausa\"><value name=\"MS\"><shadow type=\"mk_pausa_menu\"><field name=\"V\">200</field></shadow></value><next><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_pausa\"><value name=\"MS\"><shadow type=\"mk_pausa_menu\"><field name=\"V\">200</field></shadow></value></block></next></block></next></block></next></block></statement></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"480\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P1</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></next></block></statement></block></xml>",
    "girassol": "<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&lt;</field><value name=\"A\"><block type=\"mk_luz\"></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">150</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">180</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">Happy</field></block></next></block></statement><statement name=\"NAO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">Asleep</field></block></next></block></statement></block></statement></block></xml>",
    "guarda": "<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_escuro\"></block></value><statement name=\"SIM\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement><statement name=\"NAO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></statement></block></statement></block><block type=\"mk_som_alto\" x=\"40\" y=\"320\"><statement name=\"DO\"><block type=\"mk_repetir\"><value name=\"N\"><shadow type=\"mk_num\"><field name=\"NUM\">3</field></shadow></value><statement name=\"DO\"><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">523</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_pausa\"><value name=\"MS\"><shadow type=\"mk_pausa_menu\"><field name=\"V\">100</field></shadow></value></block></next></block></statement><next><block type=\"mk_icone\"><field name=\"I\">Surprised</field></block></next></block></statement></block></xml>",
    "passagem": "<xml><block type=\"mk_pino_tocado\" x=\"40\" y=\"160\"><field name=\"P\">P1</field><statement name=\"DO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_repetir\"><value name=\"N\"><shadow type=\"mk_num\"><field name=\"NUM\">3</field></shadow></value><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">440</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_pausa\"><value name=\"MS\"><shadow type=\"mk_pausa_menu\"><field name=\"V\">200</field></shadow></value></block></next></block></next></block></next></block></statement></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><statement name=\"DO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">90</field></shadow></value></block></statement></block></xml>",
    "saltos": "<xml><block type=\"mk_agitar\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value><next><block type=\"mk_var_mudar\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></next></block></statement></block></xml>",
    "dado": "<xml><block type=\"mk_agitar\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><shadow type=\"mk_num\"><field name=\"NUM\">6</field></shadow></value></block></statement></block></xml>",
    "pontos": "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">pontos</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">pontos</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"480\"><field name=\"B\">AB</field><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_var\"><field name=\"VAR\">pontos</field></block></value></block></statement></block></xml>",
    "temporizador": "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_definir\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">5</field></shadow></value><next><block type=\"mk_repetir\"><value name=\"N\"><shadow type=\"mk_num\"><field name=\"NUM\">5</field></shadow></value><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value><next><block type=\"mk_pausa\"><value name=\"MS\"><shadow type=\"mk_pausa_menu\"><field name=\"V\">500</field></shadow></value><next><block type=\"mk_var_mudar\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></next></block></next></block></statement><next><block type=\"mk_som\"><value name=\"S\"><shadow type=\"mk_som_menu\"><field name=\"V\">twinkle</field></shadow></value></block></next></block></next></block></statement></block></xml>",
    "quente": "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&lt;</field><value name=\"A\"><block type=\"mk_temperatura\"></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">25</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_icone\"><field name=\"I\">Surprised</field></block></statement><statement name=\"NAO\"><block type=\"mk_icone\"><field name=\"I\">Happy</field></block></statement></block></statement></block></xml>",
    "diario": "<xml><block type=\"mk_agitar\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><statement name=\"DO\"><block type=\"mk_var_definir\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_registar\"><value name=\"NOME\"><shadow type=\"mk_texto\"><field name=\"TXT\">saltos</field></shadow></value><value name=\"V\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value></block></next></block></statement></block></xml>",
    "reflexos": "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_pausa\"><value name=\"MS\"><block type=\"mk_aleatorio\"><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">1000</field></shadow></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">2000</field></shadow></value></block></value><next><block type=\"mk_icone\"><field name=\"I\">Heart</field><next><block type=\"mk_var_definir\"><field name=\"VAR\">medida</field><value name=\"V\"><block type=\"mk_tempo\"></block></value></block></next></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_tempo\"></block></value><next><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&lt;</field><value name=\"A\"><block type=\"mk_tempo\"></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">1500</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_var_mudar\"><field name=\"VAR\">pontos</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">Happy</field></block></next></block></statement></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"480\"><field name=\"B\">AB</field><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_var\"><field name=\"VAR\">pontos</field></block></value></block></statement></block></xml>",
    "voltas": "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_definir\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_var_definir\"><field name=\"VAR\">medida</field><value name=\"V\"><block type=\"mk_tempo\"></block></value></block></next></block></statement></block><block type=\"mk_pino_tocado\" x=\"40\" y=\"320\"><field name=\"P\">P1</field><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">4</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_mostrar_texto\"><value name=\"T\"><shadow type=\"mk_texto\"><field name=\"TXT\">FIM</field></shadow></value><next><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_conta\"><field name=\"OP\">/</field><value name=\"A\"><block type=\"mk_conta\"><field name=\"OP\">-</field><value name=\"A\"><block type=\"mk_tempo\"></block></value><value name=\"B\"><block type=\"mk_var\"><field name=\"VAR\">medida</field></block></value></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">1000</field></shadow></value></block></value></block></next></block></statement><statement name=\"NAO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value></block></statement></block></next></block></statement></block></xml>",
    "estrela": "<xml><block type=\"mk_iniciar\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_definir\"><field name=\"VAR\">passos</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_acender\"><value name=\"X\"><block type=\"mk_var\"><field name=\"VAR\">passos</field></block></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">4</field></shadow></value></block></next></block></statement></block><block type=\"mk_agitar\" x=\"40\" y=\"320\"><statement name=\"DO\"><block type=\"mk_var_definir\"><field name=\"VAR\">medida</field><value name=\"V\"><block type=\"mk_aleatorio\"><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">4</field></shadow></value></block></value><next><block type=\"mk_limpar\"><next><block type=\"mk_acender\"><value name=\"X\"><block type=\"mk_var\"><field name=\"VAR\">medida</field></block></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_acender\"><value name=\"X\"><block type=\"mk_var\"><field name=\"VAR\">passos</field></block></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">4</field></shadow></value></block></next></block></next></block></next></block></statement></block><block type=\"mk_gesto\" x=\"40\" y=\"480\"><field name=\"G\">right</field><statement name=\"DO\"><block type=\"mk_apagar_led\"><value name=\"X\"><block type=\"mk_var\"><field name=\"VAR\">passos</field></block></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">4</field></shadow></value><next><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&gt;</field><value name=\"A\"><block type=\"mk_var\"><field name=\"VAR\">passos</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_var_mudar\"><field name=\"VAR\">passos</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">-1</field></shadow></value></block></statement><next><block type=\"mk_acender\"><value name=\"X\"><block type=\"mk_var\"><field name=\"VAR\">passos</field></block></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">4</field></shadow></value></block></next></block></next></block></statement></block><block type=\"mk_gesto\" x=\"40\" y=\"640\"><field name=\"G\">left</field><statement name=\"DO\"><block type=\"mk_apagar_led\"><value name=\"X\"><block type=\"mk_var\"><field name=\"VAR\">passos</field></block></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">4</field></shadow></value><next><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&gt;</field><value name=\"A\"><block type=\"mk_var\"><field name=\"VAR\">passos</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_var_mudar\"><field name=\"VAR\">passos</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">-1</field></shadow></value></block></statement><next><block type=\"mk_acender\"><value name=\"X\"><block type=\"mk_var\"><field name=\"VAR\">passos</field></block></value><value name=\"Y\"><shadow type=\"mk_num\"><field name=\"NUM\">4</field></shadow></value></block></next></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"800\"><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_var\"><field name=\"VAR\">passos</field></block></value><value name=\"B\"><block type=\"mk_var\"><field name=\"VAR\">medida</field></block></value></block></value><statement name=\"SIM\"><block type=\"mk_icone\"><field name=\"I\">Happy</field></block></statement><statement name=\"NAO\"><block type=\"mk_icone\"><field name=\"I\">Sad</field></block></statement></block></statement></block></xml>",
    "modos": "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block><block type=\"mk_sempre\" x=\"40\" y=\"320\"><statement name=\"DO\"><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_icone\"><field name=\"I\">Asleep</field></block></statement><next><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_icone\"><field name=\"I\">Happy</field><next><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">180</field></shadow></value></block></next></block></statement><next><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">2</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_temperatura\"></block></value></block></statement></block></next></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"480\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_registar\"><value name=\"NOME\"><shadow type=\"mk_texto\"><field name=\"TXT\">modo</field></shadow></value><value name=\"V\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value></block></statement></block></xml>",
    "cofre": "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">3</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">90</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">Happy</field><next><block type=\"mk_som\"><value name=\"S\"><shadow type=\"mk_som_menu\"><field name=\"V\">happy</field></shadow></value></block></next></block></next></block></statement><statement name=\"NAO\"><block type=\"mk_icone\"><field name=\"I\">Sad</field><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">523</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></next></block></statement><next><block type=\"mk_var_definir\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"480\"><field name=\"B\">AB</field><statement name=\"DO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></statement></block></xml>"
  }/*/G*/;

  // ============================================================ Nível 1 · Primeiros sinais (4–11)
  const temNome = p => p.tipo === 'mk_mostrar_texto' && typeof p.texto === 'string' && p.texto !== 'Olá!' && p.texto.trim().length >= 2;
  const NOME = {
    titulo: 'O meu nome',
    missao: 'Quando carregas no A, o teu nome passa no ecrã.',
    passos: ['Arrasta «no botão A premido».', 'Põe lá dentro «mostrar texto».', 'Escreve o teu nome na pastilha branca e experimenta.'],
    material: 'micro:bit',
    novos: ['mk_mostrar_texto'],
    caixa: ['mk_botao', 'mk_icone', 'mk_agitar'],
    teste: 'botao:A',
    ok: r => causou(r, s => s.some(x => x.startsWith('texto:') && x !== 'texto:Olá!' && x.slice(6).trim().length >= 2), v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', 'Agora o micro:bit vai aprender a escrever! Que tal pô-lo a dizer o teu nome?'],
      parecePronto: a => plano(ev(a, 'botao:A')).some(temNome),
      testar: 'Parece-me bem! Carrega no A e lê o ecrã.',
      regras: [
        P.evento('botao:A', 'Quando é que o nome deve aparecer? Quem fica à escuta do botão?'),
        com('sem_mostrar_texto', P.bloco('botao:A', 'mk_mostrar_texto', 'O micro:bit já sente o botão. Como é que ele escreve palavras?')),
        P.regra('texto_igual', a => blocos(ev(a, 'botao:A'), 'mk_mostrar_texto').length > 0 && !plano(ev(a, 'botao:A')).some(temNome), [
          'O micro:bit diz «Olá!»… mas onde está o teu nome?', 'Na pastilha branca do bloco podes escrever o que quiseres.', 'Clica em «Olá!» e escreve o teu nome.'], 'Que nome bonito!'),
      ],
      sucesso: 'O micro:bit já sabe o teu nome! As letras passam uma coluna de luzes de cada vez.',
      extensao: 'E se o B mostrasse o nome de um amigo?',
      gambiarra: { xml: G.nome, pedido: 'Escrevi um nome… mas carrego no A e nada! Onde é que eu pus o bloco?' },
    },
  };

  const CANTOS4 = ['0,0', '4,0', '0,4', '4,4'];
  const acendeA = a => blocos(ev(a, 'botao:A'), 'mk_acender');
  const CANTOS = {
    titulo: 'Os quatro cantos',
    missao: 'Quando carregas no A, acendem-se as quatro luzes dos cantos.',
    passos: ['Cada luz tem um endereço: x é a coluna e y é a linha, de 0 a 4.', 'Usa quatro «acender x y» dentro de «no botão A premido».', 'Experimenta: carrega no A.'],
    material: 'micro:bit',
    novos: ['mk_acender'],
    caixa: ['mk_botao', 'mk_limpar', 'mk_pausa'],
    teste: 'botao:A',
    ok: r => causou(r, s => CANTOS4.every(c => s.includes('acender:' + c)), v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', 'O ecrã do micro:bit tem 25 luzes. Hoje acendemos só as que queremos, uma a uma!'],
      parecePronto: a => CANTOS4.every(c => acendeA(a).some(p => p.x + ',' + p.y === c)),
      testar: 'Tens uma ideia? Vamos testar! Carrega no A e olha para os cantos.',
      regras: [
        P.evento('botao:A', 'Quando é que os cantos se acendem? Quem fica à escuta?'),
        com('sem_acender', P.bloco('botao:A', 'mk_acender', 'Como é que se acende só uma luz de cada vez?')),
        P.regra('canto_errado', a => acendeA(a).some(p => !CANTOS4.includes(p.x + ',' + p.y)), [
          ['surpreendida', 'Ui! Essa luz está no meio do ecrã, não num canto!'], 'Os cantos estão nas colunas 0 e 4 e nas linhas 0 e 4.', 'Em cada «acender», usa só os números 0 e 4.'], 'Canto certinho!'),
        P.regra('poucos_cantos', a => acendeA(a).length > 0 && !CANTOS4.every(c => acendeA(a).some(p => p.x + ',' + p.y === c)), [
          'Quantos cantos tem um quadrado?', 'Precisas de um «acender» para cada canto.', 'Usa quatro «acender»: (0,0), (4,0), (0,4) e (4,4).'], 'Quatro cantos acesos!'),
      ],
      sucesso: 'Quatro cantos! Agora já sabes dar endereços às luzes: coluna e linha.',
      extensao: 'E se o B acendesse só a luz do meio, (2,2)?',
      gambiarra: { xml: G.cantos, pedido: 'Acendi os cantos… mas há um que ficou torto! Descobres qual?' },
    },
  };

  const PISCA = {
    titulo: 'Pisca-pisca',
    missao: 'Quando agitas, o coração pisca 3 vezes: acende, apaga, acende…',
    passos: ['Dentro de «em agitar» põe «repetir 3 vezes».', 'Lá dentro: coração, pausa, limpar ecrã, pausa.', 'Experimenta: agita.'],
    material: 'micro:bit',
    novos: ['mk_limpar'],
    caixa: ['mk_agitar', 'mk_repetir', 'mk_icone_coracao', 'mk_pausa', 'mk_icone'],
    teste: 'agitar',
    ok: r => visiveis(r, 'agitar', 'Heart', 120) >= 3,
    tutor: {
      boasVindas: ['boas_vindas', 'Um coração que pisca é como um farol pequenino. Vamos fazê-lo piscar?'],
      parecePronto: a => { const e = ev(a, 'agitar'); return tem(e, 'mk_repetir') && tem(e, 'mk_limpar') && blocos(e, 'mk_pausa').length >= 2 && icones(e, 'Heart').length > 0; },
      testar: 'Parece-me bem! Agita e conta as piscadelas.',
      regras: [
        P.evento('agitar', 'O coração pisca quando agitas. Quem fica à escuta?'),
        com('sem_repetir', P.bloco('agitar', 'mk_repetir', 'Piscar é fazer a mesma coisa várias vezes. Há um bloco que repete…')),
        com('sem_limpar', P.bloco('agitar', 'mk_limpar', 'Para piscar, o coração tem de desaparecer. Quem apaga o ecrã?')),
        P.regra('sem_pausas', a => { const e = ev(a, 'agitar'); return tem(e, 'mk_repetir') && tem(e, 'mk_limpar') && blocos(e, 'mk_pausa').length < 2; }, [
          'O coração pisca tão depressa que nem se vê! Será que precisa de tempo?', 'Depois de acender e depois de apagar, espera um bocadinho.', 'Põe uma «pausa» a seguir ao coração e outra a seguir ao limpar.'], 'Agora vê-se a piscar!'),
      ],
      sucesso: 'Pisca-pisca! Acender, esperar, apagar, esperar — é assim que piscam todas as luzes.',
      extensao: 'E se piscasse mais depressa com pausas de 100?',
      gambiarra: { xml: G.pisca, pedido: 'O meu coração devia piscar, mas parece que nem acende! Encontras a gambiarra?' },
    },
  };

  // ---- 7 · Cartão de aniversário (projeto)
  const CARTAO = {
    titulo: 'Cartão de aniversário',
    missao: 'Um cartão que canta e dança quando lhe tocas, e mostra «Parabéns» no botão A.',
    passos: [
      'Constrói o cartão: dobra uma cartolina e prende o micro:bit por dentro, com o logotipo à vista.',
      'No logotipo: uma melodia com pelo menos 4 notas (3 diferentes).',
      'Entre as notas, o coração e o coração pequeno a trocar: é a dança.',
      'No botão A: «mostrar texto» com «Parabéns».',
      'Experimenta: toca no logotipo, espera pela música e depois carrega no A.',
    ],
    material: 'micro:bit V2, cartolina, canetas, fita-cola',
    novos: ['mk_tom'],
    caixa: ['mk_logo', 'mk_botao', 'mk_repetir', 'mk_icone_coracao', 'mk_icone_pequeno', 'mk_pausa', 'mk_mostrar_texto', 'mk_icone'],
    teste: 'logo',
    ok: r => {
      const canta = outsDe(r, 'logo').some(x => { const t = tonsDe(x.outs); return t.length >= 4 && distintos(t) >= 3; });
      const danca = visiveis(r, 'logo', 'Heart') >= 2 && visiveis(r, 'logo', 'SmallHeart') >= 2;
      return canta && danca && causou(r, s => s.some(x => /^texto:.*parab/i.test(x)), v => v === 'botao:A');
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto a sério: um cartão de aniversário que canta, dança e dá os parabéns. Vamos construí-lo por partes!'],
      parecePronto: a => { const e = ev(a, 'logo'); return nToms(e) >= 4 && distintos(freqs(e)) >= 3 && icones(e, 'Heart').length > 0 && icones(e, 'SmallHeart').length > 0 && plano(ev(a, 'botao:A')).some(p => p.tipo === 'mk_mostrar_texto' && /parab/i.test(String(p.texto || ''))); },
      testar: 'Parece pronto! Toca no logotipo, ouve a música toda e depois carrega no A.',
      regras: [
        P.evento('logo', 'O cartão abre-se e… quem dá pelo toque no logotipo?'),
        com('sem_tom', P.bloco('logo', 'mk_tom', 'Um cartão que canta! Qual é o bloco que toca notas?')),
        P.regra('poucas_notas', a => nToms(ev(a, 'logo')) < 4, [
          'Uma melodia com uma ou duas notas é só um «pi»! Quantas notas tem uma melodia curtinha?', 'Precisas de pelo menos 4 notas «tocar tom».', 'Junta mais «tocar tom» no logotipo até teres 4 ou mais.'], 'Já é uma melodia!'),
        P.regra('notas_iguais', a => distintos(freqs(ev(a, 'logo'))) < 3, [
          'A melodia está sempre na mesma nota… soa a festa?', 'Carrega no menu da nota e escolhe outras.', 'Usa pelo menos 3 notas diferentes, por exemplo Dó, Mi e Sol.'], 'Que melodia alegre!'),
        P.regra('sem_animacao', a => icones(ev(a, 'logo'), 'Heart').length === 0 || icones(ev(a, 'logo'), 'SmallHeart').length === 0, [
          'O cartão já canta. E se o coração também dançasse?', 'A dança é o coração e o coração pequeno a trocar.', 'Põe «mostrar ícone» coração e coração pequeno entre as notas.'], 'Agora mexe-se!'),
        P.evento('botao:A', 'E a mensagem de parabéns? Quem fica à escuta do A?'),
        P.regra('sem_parabens', a => !plano(ev(a, 'botao:A')).some(p => p.tipo === 'mk_mostrar_texto' && /parab/i.test(String(p.texto || ''))), [
          'Carregas no A e… a mensagem?', 'O bloco azul «mostrar texto» escreve palavras.', 'Põe «mostrar texto» no A e escreve «Parabéns».'], 'Parabéns a ti!'),
      ],
      sucesso: 'Que cartão! Música, dança e mensagem: um presente feito por ti.',
      extensao: 'E se, ao agitar o cartão, ele mostrasse a idade de quem faz anos?',
      gambiarra: { xml: G.cartao, pedido: 'O meu cartão canta… mas sempre a mesma nota! Ajudas-me a pô-lo mais alegre?' },
    },
  };

  // ---- 8 · Semáforo de peões (projeto)
  const iNo = e => indice(e, p => p.tipo === 'mk_icone' && p.icone === 'No');
  const iYes = e => indice(e, p => p.tipo === 'mk_icone' && p.icone === 'Yes');
  const esperaEntre = e => { const a = iNo(e), b = iYes(e); return a >= 0 && b > a && plano(e).slice(a, b).some(p => p.tipo === 'mk_pausa' && p.ms >= 1500); };
  const bipsDepois = e => { const b = iYes(e); if (b < 0) return false; const resto_ = plano(e).slice(b + 1); return resto_.some(p => p.tipo === 'mk_repetir' && p.n >= 3) && resto_.some(p => p.tipo === 'mk_tom') || resto_.filter(p => p.tipo === 'mk_tom').length >= 3; };
  const voltaVermelho = e => { const b = iYes(e); return b >= 0 && plano(e).slice(b + 1).some(p => p.tipo === 'mk_icone' && p.icone === 'No'); };
  const SEMAFORO = {
    titulo: 'Semáforo de peões',
    missao: 'Carregas no A: o semáforo fica vermelho, espera, passa a verde com bips e volta ao vermelho.',
    passos: [
      'Faz o semáforo em cartão; o botão A é o botão do peão.',
      'No A: ✗ (vermelho) e uma pausa de pelo menos 2 segundos.',
      'Depois ✔ (verde) e 3 bips: repetir 3 vezes «tocar tom» e «pausa».',
      'No fim, outra vez ✗.',
      'Experimenta: carrega no A e conta o tempo.',
    ],
    material: 'micro:bit V2, cartão, canetas',
    novos: ['mk_icone_nao', 'mk_icone_sim'],
    caixa: ['mk_botao', 'mk_pausa', 'mk_repetir', 'mk_tom'],
    teste: 'botao:A',
    ok: r => outsDe(r, 'botao:A').some(x => {
      const o = x.outs;
      const i1 = o.findIndex(e => e.v === 'icone:No'); if (i1 < 0) return false;
      const i2 = o.findIndex((e, k) => k > i1 && e.v === 'icone:Yes'); if (i2 < 0 || o[i2].t - o[i1].t < 1500) return false;
      const i3 = o.findIndex((e, k) => k > i2 && e.v === 'icone:No'); if (i3 < 0) return false;
      return o.slice(i2, i3).filter(e => e.v.startsWith('tom:')).length >= 3;
    }),
    tutor: {
      boasVindas: ['boas_vindas', 'Vamos fazer um semáforo para os peões da escola! Primeiro espera-se no vermelho, depois atravessa-se no verde.'],
      parecePronto: a => { const e = ev(a, 'botao:A'); return esperaEntre(e) && bipsDepois(e) && voltaVermelho(e); },
      testar: 'Parece pronto! Carrega no A e acompanha as cores.',
      regras: [
        P.evento('botao:A', 'O peão carrega no botão… quem dá por isso?'),
        P.regra('sem_vermelho', a => icones(ev(a, 'botao:A'), 'No').length === 0, [
          'Antes de atravessar, o que é que o semáforo mostra aos peões?', 'Primeiro vem o vermelho: o ✗.', 'Começa o botão A com «mostrar ícone» ✗.'], 'Vermelho primeiro, muito bem!'),
        P.regra('sem_verde', a => icones(ev(a, 'botao:A'), 'Yes').length === 0, [
          'E quando é que os peões podem passar?', 'O verde é o ✔.', 'Depois do vermelho e da espera, mostra o ✔.'], 'Já há verde!'),
        P.regra('sem_espera', a => !esperaEntre(ev(a, 'botao:A')), [
          'O vermelho dura tão pouco que ninguém o vê! Quanto tempo devia durar?', 'Entre o ✗ e o ✔ precisas de uma pausa grande.', 'Põe uma pausa de 2000 (2 segundos) logo a seguir ao ✗.'], 'Agora espera-se a sério.'),
        P.regra('sem_bips', a => !bipsDepois(ev(a, 'botao:A')), [
          'Como é que uma pessoa que não vê sabe que já pode passar?', 'Os semáforos fazem «bip, bip, bip» enquanto está verde.', 'Depois do ✔ põe «repetir 3 vezes» com «tocar tom» e «pausa».'], 'Bip, bip, bip!'),
        P.regra('sem_voltar', a => !voltaVermelho(ev(a, 'botao:A')), [
          'E depois de os peões passarem? O semáforo fica verde para sempre?', 'No fim, o semáforo volta ao vermelho.', 'Põe outro ✗ no fim do botão A.'], 'Semáforo completo!'),
      ],
      sucesso: 'Semáforo pronto! Vermelho, espera, verde com bips para quem não vê, e vermelho outra vez — tal e qual os da rua.',
      extensao: 'E se os bips ficassem mais rápidos no fim do verde, para avisar que vai mudar?',
      gambiarra: { xml: G.semaforo, pedido: 'O meu semáforo passa logo a verde, ninguém tem tempo de parar! Onde está a gambiarra?' },
    },
  };

  // ---- 9 · Robô das emoções (projeto)
  const REACOES = [['botao:A', 'Happy'], ['botao:B', 'Sad'], ['logo', 'Surprised']];
  const primeiraNota = e => freqs(e)[0];
  const EMOCOES = {
    titulo: 'Robô das emoções',
    missao: 'Um robô com quatro emoções: A, B, logotipo e agitar dão caras e sons diferentes.',
    passos: [
      'Faz a cabeça do robô numa caixa e põe o micro:bit como cara.',
      'A: cara contente e uma nota. B: cara triste e outra nota.',
      'Logotipo: cara surpreendida e uma terceira nota.',
      'Agitar: o robô fica tonto — repetir 3 vezes a cara pateta, pausa, a cara a dormir, pausa.',
      'Experimenta as quatro emoções.',
    ],
    material: 'micro:bit V2, uma caixa de cartão, canetas',
    novos: ['mk_icone_surpreendido', 'mk_icone_dormir'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_logo', 'mk_agitar', 'mk_icone', 'mk_icone_triste', 'mk_tom', 'mk_repetir', 'mk_pausa'],
    teste: 'botao:A',
    ok: r => {
      const notas = REACOES.map(([ent, ico]) => {
        const x = outsDe(r, ent).find(x => x.outs.some(o => o.v === 'icone:' + ico) && tonsDe(x.outs).length);
        return x ? tonsDe(x.outs)[0] : null;
      });
      return notas.every(n => n !== null) && distintos(notas) === 3 && visiveis(r, 'agitar', 'Silly') >= 2;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Os robôs também têm sentimentos (pelo menos os nossos)! Vamos dar-lhe quatro emoções.'],
      parecePronto: a => REACOES.every(([k, ico]) => icones(ev(a, k), ico).length && tem(ev(a, k), 'mk_tom')) && distintos(REACOES.map(([k]) => primeiraNota(ev(a, k)))) === 3 && tem(ev(a, 'agitar'), 'mk_repetir') && tem(ev(a, 'agitar'), 'mk_pausa'),
      testar: 'Parece pronto! Experimenta A, B, o logotipo e agitar.',
      regras: [
        P.evento('botao:A', 'O robô tem quatro emoções. A primeira está no botão A: quem fica à escuta?'),
        P.evento('botao:B', 'E a segunda emoção? Falta um botão…'),
        P.evento('logo', 'A terceira emoção é quando lhe tocas no logotipo. Quem dá por isso?'),
        P.evento('agitar', 'E quando abanas o robô? Ele devia ficar tonto!'),
        P.regra('sem_cara', a => REACOES.some(([k]) => icones(ev(a, k)).length === 0), [
          'Há uma emoção sem cara. Como é que o robô mostra o que sente?', 'Cada emoção precisa de um «mostrar ícone».', 'Põe uma cara em A, em B e no logotipo.'], 'Já tem caras!'),
        P.regra('cara_errada', a => REACOES.some(([k, ico]) => icones(ev(a, k)).length > 0 && icones(ev(a, k), ico).length === 0), [
          ['surpreendida', 'Ui! O robô está triste quando devia estar contente?'], 'A: contente. B: triste. Logotipo: surpreendido.', 'Escolhe no menu de cada ícone a cara certa.'], 'Emoções certas!'),
        P.regra('sem_som', a => REACOES.some(([k]) => !tem(ev(a, k), 'mk_tom')), [
          'Um robô que só faz caras é muito calado. E se cada emoção tivesse uma voz?', 'Cada emoção precisa de um «tocar tom».', 'Põe «tocar tom» em A, em B e no logotipo.'], 'Já fala!'),
        P.regra('notas_iguais', a => distintos(REACOES.map(([k]) => primeiraNota(ev(a, k)))) < 3, [
          'Duas emoções com a mesma voz… dá para distinguir?', 'Cada emoção deve ter a sua nota.', 'Muda as notas para ficarem três diferentes.'], 'Três vozes diferentes!'),
        P.regra('tonto_rapido', a => !tem(ev(a, 'agitar'), 'mk_repetir') || !tem(ev(a, 'agitar'), 'mk_pausa'), [
          'Ficar tonto é andar à roda várias vezes… como se repete?', 'Usa «repetir» com duas caras e pausas entre elas.', 'Em agitar: repetir 3 vezes — pateta, pausa, a dormir, pausa.'], 'Que tonto!'),
      ],
      sucesso: 'Robô com sentimentos! Quatro entradas, quatro reações: é assim que se programa uma personagem.',
      extensao: 'E se o A+B o pusesse a dormir com um bocejo?',
      gambiarra: { xml: G.emocoes, pedido: 'O meu robô está contente e triste com a mesma voz! Ajudas-me a dar-lhe outra nota?' },
    },
  };

  // ---- 10 · Caixa de música ao contrário (projeto)
  const CAIXA = {
    titulo: 'Caixa de música ao contrário',
    missao: 'O A toca a tua melodia; o B toca a mesma melodia de trás para a frente!',
    passos: [
      'Faz a caixa de música numa caixa de cartão: o micro:bit é a tampa.',
      'No A: o coração e uma melodia tua com 6 notas (pelo menos 4 diferentes).',
      'No B: as mesmas notas, pela ordem contrária (a última primeiro).',
      'Experimenta o A, depois o B, e ouve se é mesmo ao contrário.',
    ],
    material: 'micro:bit V2, uma caixa pequena de cartão',
    novos: [],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_tom', 'mk_icone_coracao', 'mk_limpar', 'mk_pausa'],
    teste: 'botao:A',
    ok: r => {
      const A = outsDe(r, 'botao:A').map(x => ({ t: tonsDe(x.outs), c: x.outs.some(o => o.v === 'icone:Heart') })).filter(x => x.t.length >= 6 && x.c).pop();
      const B = outsDe(r, 'botao:B').map(x => tonsDe(x.outs)).filter(t => t.length).pop();
      return !!A && !!B && distintos(A.t) >= 4 && B.length === A.t.length && B.every((f, i) => f === A.t[A.t.length - 1 - i]);
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Sabias que uma melodia tocada ao contrário parece outra música? Vamos fazer uma caixa de música com truque!'],
      parecePronto: a => { const fa = freqs(ev(a, 'botao:A')), fb = freqs(ev(a, 'botao:B')); return icones(ev(a, 'botao:A'), 'Heart').length > 0 && fa.length >= 6 && distintos(fa) >= 4 && fb.length === fa.length && fb.every((f, i) => f === fa[fa.length - 1 - i]); },
      testar: 'Parece pronto! Carrega no A, ouve até ao fim, e depois no B.',
      regras: [
        P.evento('botao:A', 'A caixa abre quando carregas no A. Quem fica à escuta?'),
        P.regra('sem_coracao', a => icones(ev(a, 'botao:A'), 'Heart').length === 0, [
          'Uma caixa de música tem sempre uma bailarina… ou um coração! O que aparece no ecrã?', 'Começa o A com um ícone.', 'Põe «mostrar ícone» coração no início do A.'], 'Que caixa bonita!'),
        P.regra('curta', a => nToms(ev(a, 'botao:A')) < 6, [
          'A tua melodia é curtinha. Quantas notas pede a missão?', 'Precisas de 6 notas «tocar tom».', 'Junta notas no A até teres 6.'], 'Melodia completa!'),
        P.regra('repetitiva', a => distintos(freqs(ev(a, 'botao:A'))) < 4, [
          'Com tão poucas notas diferentes, ao contrário vai soar igual! Como a tornas mais variada?', 'Usa pelo menos 4 notas diferentes.', 'Muda as notas no menu de cada «tocar tom».'], 'Agora tem cor!'),
        P.evento('botao:B', 'E o truque? Quem toca ao contrário?'),
        P.regra('b_vazio', a => !tem(ev(a, 'botao:B'), 'mk_tom'), [
          'O B ainda está calado. O que tem de tocar?', 'As mesmas notas do A, noutra ordem.', 'Põe 6 «tocar tom» no B.'], 'O B já toca!'),
        P.regra('b_nao_inverso', a => { const fa = freqs(ev(a, 'botao:A')), fb = freqs(ev(a, 'botao:B')); return !(fb.length === fa.length && fb.every((f, i) => f === fa[fa.length - 1 - i])); }, [
          'Lê a melodia do A de baixo para cima. É isso que o B toca?', 'A primeira nota do B é a última do A; a segunda do B é a penúltima do A…', 'Copia as notas do A para o B, começando pela de baixo.'], 'Ao contrário, certinho!'),
      ],
      sucesso: 'Ao contrário soa a outra música, não soa? Inverter uma sequência é um truque que os programadores usam muito.',
      extensao: 'E se o A+B tocasse a melodia com notas mais curtas, a 1/2 batida?',
      gambiarra: { xml: G.caixa, pedido: 'O meu B devia tocar a melodia ao contrário… mas toca igual! Ajudas-me?' },
    },
  };

  // ---- 11 · Cobra luminosa (projeto)
  function cobraOk(outs) {
    let runs = 0, k = 0, y = null, tPrev = 0;
    for (const e of outs) {
      if (e.v === 'limpar') { if (k === 5) runs++; k = 0; y = null; continue; }
      const m = /^acender:(\d+),(\d+)$/.exec(e.v); if (!m) continue;
      const xx = +m[1], yy = +m[2];
      if (k > 0 && k < 5 && xx === k && yy === y && e.t - tPrev >= 80) { k++; tPrev = e.t; }
      else if (xx === 0) { k = 1; y = yy; tPrev = e.t; } else k = 0;
    }
    return runs >= 2;
  }
  const acendeLogo = a => blocos(ev(a, 'logo'), 'mk_acender');
  const filaDireita = a => { const l = acendeLogo(a); return l.length >= 5 && l.slice(0, 5).every((p, i) => p.x === i && p.y === l[0].y); };
  const COBRA = {
    titulo: 'Cobra luminosa',
    missao: 'Uma cobra de luz atravessa o ecrã, luz a luz, duas vezes, quando tocas no logotipo.',
    passos: [
      'Escolhe uma linha (y) e acende as 5 luzes dessa linha, da esquerda para a direita (x de 0 a 4).',
      'Entre cada luz, uma pausa pequena: assim vê-se a cobra a andar.',
      'No fim, limpa o ecrã.',
      'Põe tudo dentro de «repetir 2 vezes». Experimenta: toca no logotipo.',
    ],
    material: 'micro:bit (e uma cobra desenhada em papel à volta do ecrã)',
    novos: [],
    caixa: ['mk_logo', 'mk_acender', 'mk_pausa', 'mk_limpar', 'mk_repetir', 'mk_botao'],
    teste: 'logo',
    ok: r => outsDe(r, 'logo').some(x => cobraOk(x.outs)),
    tutor: {
      boasVindas: ['boas_vindas', 'Uma cobra feita de luz vai rastejar pelo ecrã! Desta vez és tu que desenhas a animação, luz a luz.'],
      parecePronto: a => filaDireita(a) && blocos(ev(a, 'logo'), 'mk_pausa').length >= 4 && tem(ev(a, 'logo'), 'mk_limpar') && tem(ev(a, 'logo'), 'mk_repetir'),
      testar: 'Parece pronto! Toca no logotipo e segue a cobra com o dedo.',
      regras: [
        P.evento('logo', 'A cobra acorda quando lhe tocas no logotipo. Quem fica à escuta?'),
        com('sem_acender', P.bloco('logo', 'mk_acender', 'A cobra é feita de luzes acesas uma a uma. Que bloco acende uma luz?')),
        P.regra('poucas_luzes', a => acendeLogo(a).length < 5, [
          'A tua cobra é curtinha! Quantas luzes tem uma linha do ecrã?', 'Precisas de 5 «acender», um por coluna.', 'Junta «acender» até teres 5 na mesma linha.'], 'Que cobra comprida!'),
        P.regra('fila_torta', a => !filaDireita(a), [
          'A cobra anda aos saltos! Por onde é que ela devia passar?', 'Na mesma linha (y igual), com x a crescer: 0, 1, 2, 3, 4.', 'Põe os «acender» por ordem: x = 0, 1, 2, 3, 4, todos com o mesmo y.'], 'Agora anda a direito!'),
        P.regra('sem_pausa', a => blocos(ev(a, 'logo'), 'mk_pausa').length < 4, [
          'A cobra aparece toda de uma vez! O que falta para se ver a andar?', 'Entre cada luz, o micro:bit tem de esperar um bocadinho.', 'Põe uma «pausa» de 100 a seguir a cada «acender».'], 'Já rasteja!'),
        com('sem_limpar', P.bloco('logo', 'mk_limpar', 'No fim da linha, a cobra sai do ecrã. Como é que se apaga tudo?')),
        com('sem_repetir', P.bloco('logo', 'mk_repetir', 'A cobra tem de passar duas vezes. Há um bloco que repete…')),
      ],
      sucesso: 'Uma cobra a rastejar! Animar é mostrar desenhos diferentes com tempo entre eles.',
      extensao: 'E se a cobra voltasse para trás, da direita para a esquerda, noutra linha?',
      gambiarra: { xml: G.cobra, pedido: 'A minha cobra aparece toda de uma vez, não anda! O que é que lhe falta?' },
    },
  };

  // ============================================================ Nível 2 · Som e circuitos (4–11)
  const AGUDO = {
    titulo: 'Agudo ou grave?',
    missao: 'Inclina o micro:bit para a esquerda e ouves uma nota grave; para a direita, uma aguda.',
    passos: ['Usa «em inclinado para a esquerda» e «em inclinado para a direita».', 'Em cada um, «tocar tom»: à esquerda uma nota baixa (Dó), à direita uma alta (Dó alto).', 'Experimenta com os botões de inclinar no ecrã.'],
    material: 'micro:bit V2',
    novos: ['mk_gesto', 'mk_gesto_direita'],
    caixa: ['mk_tom', 'mk_icone'],
    teste: 'gesto:left',
    ok: r => {
      const n = ent => { const t = outsDe(r, ent).map(x => tonsDe(x.outs)).find(t => t.length); return t ? t[0] : null; };
      const e = n('gesto:left'), d = n('gesto:right');
      return e !== null && d !== null && e < d;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'O micro:bit sente para onde o inclinas! Vamos transformá-lo num instrumento que se toca a abanar.'],
      parecePronto: a => primeiraNota(ev(a, 'gesto:left')) < primeiraNota(ev(a, 'gesto:right')),
      testar: 'Parece pronto! Inclina para a esquerda e depois para a direita.',
      regras: [
        P.evento('gesto:left', 'Como é que o micro:bit sabe que o inclinaste para a esquerda?'),
        P.evento('gesto:right', 'E para a direita? Falta o outro lado!'),
        com('sem_tom_esq', P.bloco('gesto:left', 'mk_tom', 'O micro:bit já sente a esquerda. E o que é que toca?')),
        com('sem_tom_dir', P.bloco('gesto:right', 'mk_tom', 'E do lado direito, que nota se ouve?')),
        P.regra('notas_trocadas', a => !(primeiraNota(ev(a, 'gesto:left')) < primeiraNota(ev(a, 'gesto:right'))), [
          'Fecha os olhos e ouve: a esquerda soa mais grossa ou mais fina do que a direita?', 'Grave é uma nota baixa (Dó); agudo é uma nota alta (Dó alto).', 'Põe Dó à esquerda e Dó alto à direita.'], 'Grave e agudo!'),
      ],
      sucesso: 'Grave à esquerda, agudo à direita — como num piano!',
      extensao: 'E se o ecrã mostrasse uma cara diferente para cada lado?',
      gambiarra: { xml: G.agudo, pedido: 'Inclino para um lado e para o outro e ouço sempre a mesma nota! Descobres porquê?' },
    },
  };

  const seEscuro = e => ses(e).find(p => usa(p, 'mk_escuro'));
  const GALO = {
    titulo: 'Galo dorminhoco',
    missao: 'Quando fica escuro, o galo dorme; quando há luz, acorda contente.',
    passos: ['Dentro de «para sempre» põe «se está escuro então … senão …».', 'No «então»: a cara a dormir. No «senão»: a cara contente.', 'Experimenta: mexe na luz no ecrã.'],
    material: 'micro:bit',
    novos: ['mk_sempre', 'mk_se', 'mk_icone_dormir'],
    caixa: ['mk_icone', 'mk_escuro'],
    teste: 'luz',
    ok: r => aposSensor(r, 'luz', v => v < 40, s => s.includes('icone:Asleep')) && aposSensor(r, 'luz', v => v >= 40, s => s.includes('icone:Happy')),
    tutor: {
      boasVindas: ['boas_vindas', 'O ecrã do micro:bit também sente a luz! Vamos fazer um galo que sabe quando é de dia.'],
      parecePronto: a => { const p = seEscuro(ev(a, 'sempre')); return !!p && icoR(ramo(p, 'sim'), 'Asleep') && icoR(ramo(p, 'nao'), 'Happy'); },
      testar: 'Parece pronto! Puxa a luz para baixo e depois para cima.',
      regras: [
        P.evento('sempre', 'O galo tem de estar sempre a olhar para o céu. Que bloco repete sem parar?'),
        com('sem_se', P.bloco('sempre', 'mk_se', 'Como é que o micro:bit escolhe entre dormir e acordar?')),
        com('sem_escuro', P.valorEm('sempre', 'mk_se', 'mk_escuro', 'O «se» precisa de uma pergunta. Que pergunta sobre a luz faz o galo?')),
        P.regra('trocado', a => { const p = seEscuro(ev(a, 'sempre')); return !!p && icoR(ramo(p, 'sim'), 'Happy') && icoR(ramo(p, 'nao'), 'Asleep'); }, [
          ['surpreendida', 'Ui! O galo dorme de dia e acorda à noite?'], 'O «então» corre quando está escuro.', 'Troca as caras: a dormir no «então», contente no «senão».'], 'Agora sim, bom dia!'),
        P.regra('sem_dormir', a => { const p = seEscuro(ev(a, 'sempre')); return !!p && !icoR(ramo(p, 'sim'), 'Asleep'); }, [
          'Quando está escuro, o que faz o galo?', 'No «então» põe a cara a dormir.', 'Arrasta «mostrar ícone» a dormir para o «então».'], 'Já dorme!'),
        P.regra('sem_acordar', a => { const p = seEscuro(ev(a, 'sempre')); return !!p && !icoR(ramo(p, 'nao'), 'Happy'); }, [
          'E quando há luz? O galo acorda bem-disposto?', 'No «senão» põe a cara contente.', 'Arrasta «mostrar ícone» contente para o «senão».'], 'Bom dia, galo!'),
      ],
      sucesso: 'Bom dia, galo! O micro:bit usou o ecrã como sensor de luz para decidir.',
      extensao: 'E se, quando acorda, o galo mostrasse o coração?',
      gambiarra: { xml: G.galo, pedido: 'O meu galo dorme de dia e fica acordado à noite! Consegues pô-lo no horário certo?' },
    },
  };

  const servoDe = (e) => blocos(e, 'mk_servo').map(p => p.angulo);
  const BANDEIRA = {
    titulo: 'Bandeira de chegada',
    missao: 'Uma bandeira num servo: o A levanta-a com uma festa, o B baixa-a.',
    passos: ['Cola uma bandeira de papel no braço do servo (fio laranja no pin 0).', 'No A: «escrever servo pin P0 para 180» e «tocar som».', 'No B: o servo para 0. Experimenta os dois.'],
    material: 'micro:bit V2, servo SG90, 3 crocodilos, papel e um palito',
    novos: ['mk_servo'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_som', 'mk_icone'],
    teste: 'botao:A',
    ok: r => outsDe(r, 'botao:A').some(x => servos(x.outs).some(g => g >= 150) && x.outs.some(o => o.v.startsWith('som:'))) &&
      outsDe(r, 'botao:B').some(x => servos(x.outs).some(g => g <= 30)),
    tutor: {
      boasVindas: ['boas_vindas', 'Conheces o servomotor? É um motor que roda para o ângulo que lhe dizes. Vamos pôr-lhe uma bandeira!'],
      parecePronto: a => servoDe(ev(a, 'botao:A')).some(g => g >= 150) && tem(ev(a, 'botao:A'), 'mk_som') && servoDe(ev(a, 'botao:B')).some(g => g <= 30),
      testar: 'Parece pronto! Carrega no A e depois no B.',
      regras: [
        P.evento('botao:A', 'Quem dá a ordem para levantar a bandeira?'),
        com('sem_servo_A', P.bloco('botao:A', 'mk_servo', 'O botão A já está à escuta. Quem mexe no braço da bandeira?')),
        P.regra('a_baixo', a => servoDe(ev(a, 'botao:A')).length > 0 && !servoDe(ev(a, 'botao:A')).some(g => g >= 150), [
          'A bandeira sobe só um bocadinho. Até onde é que o servo pode rodar?', 'O servo vai de 0 a 180 graus.', 'No A, põe o servo para 180.'], 'Bandeira lá em cima!'),
        P.regra('sem_festa', a => !tem(ev(a, 'botao:A'), 'mk_som') && !tem(ev(a, 'botao:A'), 'mk_tom'), [
          'Quando alguém chega à meta, há festa! Como é que o micro:bit festeja?', 'Usa um bloco laranja de som.', 'Junta «tocar som» ao A.'], 'Que festa!'),
        P.evento('botao:B', 'E depois da corrida? Quem baixa a bandeira?'),
        com('sem_servo_B', P.bloco('botao:B', 'mk_servo', 'O B já está à escuta. E o braço do servo?')),
        P.regra('b_alto', a => servoDe(ev(a, 'botao:B')).length > 0 && !servoDe(ev(a, 'botao:B')).some(g => g <= 30), [
          'A bandeira não desce! Para que ângulo tem de ir?', 'Em baixo é perto de 0 graus.', 'No B, põe o servo para 0.'], 'Bandeira em baixo!'),
      ],
      sucesso: 'Bandeira no ar! O servo roda para o ângulo que lhe dizes, de 0 a 180 graus.',
      extensao: 'E se o A+B pusesse a bandeira a meio (90)?',
      gambiarra: { xml: G.bandeira, pedido: 'A minha bandeira sobe e nunca mais desce! Encontras o erro?' },
    },
  };

  // ---- 7 · Orquestra de fruta (projeto)
  const pinosUsados = a => new Set(a.eventosDe('pino:').map(e => e.chave)).size;
  const digi = (e, v) => blocos(e, 'mk_digital').some(p => p.v === v);
  const escalaSobe = e => { const f = freqs(e); return f.length >= 5 && f.every((x, i) => i === 0 || x > f[i - 1]); };
  const ORQUESTRA = {
    titulo: 'Orquestra de fruta',
    missao: 'Duas frutas tocam notas diferentes — uma acende uma luz, a outra faz uma cara — e o A+B toca uma escala a subir.',
    passos: [
      'Uma fruta no pin 0, outra no pin 1, e um crocodilo no GND seguro na mão.',
      'Pin 0: acende o LED do pin 2, toca uma nota grave e apaga o LED.',
      'Pin 1: mostra uma cara e toca uma nota mais aguda.',
      'A+B: uma escala de 5 notas sempre a subir (Dó, Ré, Mi, Fá, Sol).',
      'Experimenta: toca na fruta 0, na fruta 1 e depois carrega em A+B.',
    ],
    material: 'micro:bit V2, 2 frutas, 1 LED, 4 crocodilos',
    novos: [],
    caixa: ['mk_pino_tocado', 'mk_tom', 'mk_digital_1', 'mk_digital_0', 'mk_icone', 'mk_botao_AB'],
    teste: 'pino:P0',
    ok: r => {
      const p0 = outsDe(r, 'pino:P0').find(x => { const o = x.outs.map(e => e.v); const a = o.indexOf('digital:P2:1'); const t = o.findIndex((v, i) => i > a && v.startsWith('tom:')); return a >= 0 && t > a && o.indexOf('digital:P2:0', t) > t; });
      const p1 = outsDe(r, 'pino:P1').find(x => x.outs.some(o => o.v.startsWith('icone:')) && tonsDe(x.outs).length);
      const escala = outsDe(r, 'botao:AB').some(x => { const t = tonsDe(x.outs); return t.length >= 5 && t.every((f, i) => i === 0 || f > t[i - 1]); });
      return !!p0 && !!p1 && tonsDe(p1.outs)[0] > tonsDe(p0.outs)[0] && escala;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto de orquestra! Duas frutas, uma luz e uma escala: vais precisar de juntar tudo o que já sabes.'],
      parecePronto: a => digi(ev(a, 'pino:P0'), 1) && digi(ev(a, 'pino:P0'), 0) && icones(ev(a, 'pino:P1')).length > 0 && primeiraNota(ev(a, 'pino:P1')) > primeiraNota(ev(a, 'pino:P0')) && escalaSobe(ev(a, 'botao:AB')),
      testar: 'Parece pronto! Toca na fruta do pin 0, depois na do pin 1, e no fim A+B.',
      regras: [
        P.regra('faltam_frutas', a => pinosUsados(a) < 2, [
          'Uma orquestra com uma fruta só? Quantas frutas pede o projeto?', 'Precisas de dois «no pin premido»: um para o P0 e outro para o P1.', 'Junta outro «no pin premido» e escolhe o pin que falta.'], 'Duas frutas na orquestra!'),
        P.regra('p0_sem_luz', a => !(digi(ev(a, 'pino:P0'), 1) && digi(ev(a, 'pino:P0'), 0)), [
          'A fruta do pin 0 devia acender uma luz enquanto toca. Como se liga e desliga o LED?', 'Usa «gravação digital pin P2» com 1 antes da nota e 0 depois.', 'No pin 0: P2 para 1, tocar tom, P2 para 0.'], 'Luz e som!'),
        P.regra('p1_sem_cara', a => icones(ev(a, 'pino:P1')).length === 0, [
          'E a fruta do pin 1? O que aparece no ecrã?', 'Põe uma cara com «mostrar ícone».', 'No pin 1, junta «mostrar ícone» antes da nota.'], 'Que cara!'),
        P.regra('notas_frutas', a => !(primeiraNota(ev(a, 'pino:P1')) > primeiraNota(ev(a, 'pino:P0'))), [
          'Qual das frutas tem a voz mais grossa?', 'A fruta do pin 0 é a grave; a do pin 1 é a aguda.', 'Põe uma nota mais baixa no P0 do que no P1.'], 'Grave e agudo!'),
        P.evento('botao:AB', 'E a escala final? Quem fica à escuta do A+B?'),
        P.regra('escala_curta', a => freqs(ev(a, 'botao:AB')).length < 5, [
          'Uma escala é uma escada de notas. Quantos degraus pede o projeto?', 'Precisas de 5 «tocar tom».', 'Junta notas no A+B até teres 5.'], 'Escada completa!'),
        P.regra('escala_desce', a => !escalaSobe(ev(a, 'botao:AB')), [
          'Ouve a escala: sobe sempre ou tropeça num degrau?', 'Cada nota tem de ser mais aguda do que a anterior.', 'Põe as notas por ordem: Dó, Ré, Mi, Fá, Sol.'], 'Sempre a subir!'),
      ],
      sucesso: 'Uma orquestra de fruta! A eletricidade passa pela fruta e pelo teu corpo até ao GND.',
      extensao: 'E se a escala descesse no fim, como uma escada para cima e para baixo?',
      gambiarra: { xml: G.orquestra, pedido: 'A minha escala tropeça num degrau… ouves onde? Ajudas-me a arranjá-la?' },
    },
  };

  // ---- 8 · Carro com piscas e travão (projeto)
  const digitaisEm = (e, pino) => blocos(e, 'mk_digital').filter(p => p.pino === pino);
  function pisca(r, ent, pino, outro) {
    return outsDe(r, ent).some(x => {
      const o = x.outs;
      if (o.filter(e => e.v === `digital:${pino}:1`).length < 3 || o.filter(e => e.v === `digital:${pino}:0`).length < 3) return false;
      if (o.some(e => e.v === `digital:${outro}:1`)) return false;
      const i1 = o.findIndex(e => e.v === `digital:${pino}:1`), i0 = o.findIndex((e, k) => k > i1 && e.v === `digital:${pino}:0`);
      return i0 > i1 && o[i0].t - o[i1].t >= 100;
    });
  }
  const CARRO = {
    titulo: 'Carro com piscas',
    missao: 'Um carrinho com dois piscas: inclina para a esquerda e pisca a luz da esquerda, para a direita a da direita; o B é o travão e acende as duas.',
    passos: [
      'Prende dois LEDs ao carrinho: o da esquerda no pin 1, o da direita no pin 2 (as pernas curtas no GND).',
      'Inclinado para a esquerda: repetir 3 vezes — P1 para 1, pausa, P1 para 0, pausa.',
      'Inclinado para a direita: o mesmo, com o P2.',
      'Botão B (travão): P1 e P2 para 1.',
      'Experimenta: inclina para um lado, para o outro, e trava.',
    ],
    material: 'micro:bit, carrinho de brinquedo, 2 LEDs, 4 crocodilos',
    novos: [],
    caixa: ['mk_gesto', 'mk_gesto_direita', 'mk_digital_1', 'mk_digital_0', 'mk_repetir', 'mk_pausa', 'mk_botao_B'],
    teste: 'gesto:left',
    ok: r => pisca(r, 'gesto:left', 'P1', 'P2') && pisca(r, 'gesto:right', 'P2', 'P1') &&
      causou(r, s => s.includes('digital:P1:1') && s.includes('digital:P2:1'), v => v === 'botao:B'),
    tutor: {
      boasVindas: ['boas_vindas', 'Os carros avisam para onde vão virar com os piscas. Vamos pôr piscas e travão num carrinho!'],
      parecePronto: a => digitaisEm(ev(a, 'gesto:left'), 'P1').length >= 2 && digitaisEm(ev(a, 'gesto:right'), 'P2').length >= 2 && tem(ev(a, 'gesto:left'), 'mk_repetir') && tem(ev(a, 'gesto:right'), 'mk_repetir') && digitaisEm(ev(a, 'botao:B'), 'P1').some(p => p.v === 1) && digitaisEm(ev(a, 'botao:B'), 'P2').some(p => p.v === 1),
      testar: 'Parece pronto! Inclina para a esquerda, depois para a direita, e trava com o B.',
      regras: [
        P.evento('gesto:left', 'O carrinho vai virar à esquerda. Como é que o micro:bit dá por isso?'),
        P.evento('gesto:right', 'E para a direita? Falta o outro pisca.'),
        P.regra('lado_trocado', a => digitaisEm(ev(a, 'gesto:left'), 'P2').length > 0 || digitaisEm(ev(a, 'gesto:right'), 'P1').length > 0, [
          ['surpreendida', 'Ui! Viras à esquerda e pisca a luz da direita?'], 'A luz da esquerda está no pin 1; a da direita no pin 2.', 'À esquerda usa P1; à direita usa P2.'], 'Cada pisca no seu lado!'),
        P.regra('sem_repetir', a => !tem(ev(a, 'gesto:left'), 'mk_repetir') || !tem(ev(a, 'gesto:right'), 'mk_repetir'), [
          'Um pisca liga e desliga várias vezes. Que bloco faz isso?', 'Usa «repetir 3 vezes» em cada lado.', 'Põe o liga-pausa-desliga-pausa dentro de «repetir 3 vezes».'], 'Pisca, pisca, pisca!'),
        P.regra('pisca_sem_pausa', a => ['gesto:left', 'gesto:right'].some(k => blocos(ev(a, k), 'mk_pausa').length < 2), [
          'O pisca liga e desliga tão depressa que nem se vê! Será que falta tempo?', 'Depois de ligar e depois de desligar, espera.', 'Põe uma «pausa» depois de cada «gravação digital».'], 'Agora vê-se!'),
        P.evento('botao:B', 'E o travão? Quem fica à escuta do B?'),
        P.regra('travao_incompleto', a => !(digitaisEm(ev(a, 'botao:B'), 'P1').some(p => p.v === 1) && digitaisEm(ev(a, 'botao:B'), 'P2').some(p => p.v === 1)), [
          'Quando um carro trava, quantas luzes de trás se acendem?', 'As duas: o P1 e o P2.', 'No B, põe P1 para 1 e P2 para 1.'], 'Travão a funcionar!'),
      ],
      sucesso: 'Piscas e travão a funcionar! Os carros a sério também ligam e desligam luzes com um programa.',
      extensao: 'E se o travão também tocasse um som e o A apagasse as duas luzes?',
      gambiarra: { xml: G.carro, pedido: 'Viro à esquerda e pisca a luz da direita! Assim o carrinho engana toda a gente. Ajudas-me?' },
    },
  };

  // ---- 9 · Girassol (projeto)
  const seLuz = e => ses(e).find(p => usa(p, 'mk_comparar') && usa(p, 'mk_luz'));
  const ramoClaro = p => verdade(p, 'mk_luz', 220) === false ? 'nao' : 'sim';     // o ramo que corre com muita luz
  const ramoEscuro = p => ramoClaro(p) === 'sim' ? 'nao' : 'sim';
  const servoRamo = (p, q) => ramo(p, q).filter(d => d.tipo === 'mk_servo').map(d => d.angulo);
  const GIRASSOL = {
    titulo: 'Girassol',
    missao: 'Um girassol de cartão que abre as pétalas (servo) e sorri com luz forte, e fecha e dorme quando a luz é fraca.',
    passos: [
      'Faz o girassol: as pétalas presas ao braço do servo (pin 0).',
      '«para sempre»: se o nível de luz > 150 então servo para 180 e cara contente.',
      'Senão: servo para 0 e cara a dormir.',
      'Experimenta: mexe na luz no ecrã, de muita para pouca.',
    ],
    material: 'micro:bit V2, servo SG90, 3 crocodilos, cartão amarelo',
    novos: ['mk_luz', 'mk_comparar', 'mk_se_senao'],
    caixa: ['mk_sempre', 'mk_servo', 'mk_icone', 'mk_icone_dormir', 'mk_escuro'],
    teste: 'luz',
    ok: r => aposSensor(r, 'luz', v => v > 180, s => s.some(x => x.startsWith('servo:') && angulo(x) >= 150) && s.includes('icone:Happy')) &&
      aposSensor(r, 'luz', v => v < 100, s => s.some(x => x.startsWith('servo:') && angulo(x) <= 30) && s.includes('icone:Asleep')),
    tutor: {
      boasVindas: ['boas_vindas', 'Os girassóis viram-se para o sol. O nosso vai abrir as pétalas quando houver muita luz!'],
      parecePronto: a => { const p = seLuz(ev(a, 'sempre')); return !!p && servoRamo(p, ramoClaro(p)).some(g => g >= 150) && servoRamo(p, ramoEscuro(p)).some(g => g <= 30) && icoR(ramo(p, ramoClaro(p)), 'Happy') && icoR(ramo(p, ramoEscuro(p)), 'Asleep'); },
      testar: 'Parece pronto! Puxa a luz para cima e depois para baixo.',
      regras: [
        P.evento('sempre', 'O girassol tem de estar sempre a olhar para o sol. Que bloco repete sem parar?'),
        com('sem_se', P.bloco('sempre', 'mk_se', 'O girassol tem de decidir: abrir ou fechar. Que bloco decide?')),
        com('sem_comparar', P.valorEm('sempre', 'mk_se', 'mk_comparar', 'Ele só abre com MUITA luz. Como é que se compara a luz com um número?')),
        com('sem_luz', P.valorEm('sempre', 'mk_se', 'mk_luz', 'Estás a comparar… mas a comparar o quê? Como é que o girassol sabe quanta luz há?')),
        P.regra('sem_servo', a => { const p = seLuz(ev(a, 'sempre')); return !!p && (servoRamo(p, 'sim').length === 0 || servoRamo(p, 'nao').length === 0); }, [
          'As pétalas não mexem! Quem as abre e fecha?', 'Em cada ramo do «se» precisas de um «escrever servo».', 'Servo para 180 num ramo e para 0 no outro.'], 'As pétalas já mexem!'),
        P.regra('trocado', a => { const p = seLuz(ev(a, 'sempre')); return !!p && servoRamo(p, ramoClaro(p)).some(g => g < 90); }, [
          ['surpreendida', 'Ui! O girassol fecha quando há sol?'], 'Com muita luz, as pétalas abrem: servo para 180.', 'Troca os ângulos dos dois ramos (ou vira o «>»).'], 'Abre ao sol!'),
        P.regra('sem_caras', a => { const p = seLuz(ev(a, 'sempre')); return !!p && !(icoR(ramo(p, ramoClaro(p)), 'Happy') && icoR(ramo(p, ramoEscuro(p)), 'Asleep')); }, [
          'O girassol mexe… mas que cara faz?', 'Contente com sol, a dormir sem sol.', 'Junta a cara contente ao ramo do sol e a cara a dormir ao outro.'], 'Que flor simpática!'),
      ],
      sucesso: 'Girassol vivo! Os sensores deixam as máquinas reagir ao mundo, como as plantas.',
      extensao: 'E se, com luz média, as pétalas ficassem a meio (90)?',
      gambiarra: { xml: G.girassol, pedido: 'O meu girassol abre à noite e fecha ao sol! Que gambiarra é esta?' },
    },
  };

  // ---- 10 · Guarda-noite (projeto)
  const GUARDA = {
    titulo: 'Guarda-noite da quinta',
    missao: 'Um guarda para a quinta: de noite acende uma luz e, se houver barulho de noite, dá o alarme; de dia o barulho é normal.',
    passos: [
      '«para sempre»: se está escuro, LED do pin 2 para 1; senão, para 0.',
      '«em som alto»: se está escuro, repetir 3 vezes um tom agudo, e depois a cara surpreendida.',
      'Senão (é de dia): só a cara contente.',
      'Experimenta: apaga a luz e bate palmas; depois acende a luz e bate palmas outra vez.',
    ],
    material: 'micro:bit V2, 1 LED, 2 crocodilos, uma quinta de brinquedo (opcional)',
    novos: ['mk_som_alto', 'mk_se_senao', 'mk_escuro'],
    caixa: ['mk_sempre', 'mk_digital_1', 'mk_digital_0', 'mk_repetir', 'mk_tom', 'mk_pausa', 'mk_icone', 'mk_icone_surpreendido'],
    teste: 'somalto',
    ok: r => {
      const luz = aposSensor(r, 'luz', v => v < 40, s => s.includes('digital:P2:1')) && aposSensor(r, 'luz', v => v >= 40, s => s.includes('digital:P2:0'));
      const st = porEstado(r, 'luz', v => v === 'somalto');
      const noite = st.some(x => x.estado < 40 && x.saidas.filter(v => v.startsWith('tom:')).length >= 3 && x.saidas.includes('icone:Surprised'));
      const dia = st.some(x => x.estado >= 40 && !x.saidas.some(v => v.startsWith('tom:')) && x.saidas.includes('icone:Happy'));
      return luz && noite && dia;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Há uma raposa a rondar a quinta! Vamos construir um guarda que vigia a luz e o barulho ao mesmo tempo.'],
      parecePronto: a => {
        const p = seEscuro(ev(a, 'sempre')), q = seEscuro(ev(a, 'somalto'));
        return !!p && ramo(p, 'sim').some(d => d.tipo === 'mk_digital' && d.v === 1) && ramo(p, 'nao').some(d => d.tipo === 'mk_digital' && d.v === 0) &&
          !!q && temR(ramo(q, 'sim'), 'mk_repetir') && temR(ramo(q, 'sim'), 'mk_tom') && icoR(ramo(q, 'sim'), 'Surprised') && icoR(ramo(q, 'nao'), 'Happy');
      },
      testar: 'Parece pronto! Puxa a luz para baixo e bate palmas; depois volta a pôr luz e bate palmas outra vez.',
      regras: [
        P.evento('sempre', 'O guarda tem de vigiar a noite inteira. Que bloco repete sem parar?'),
        P.regra('luz_sem_se', a => !seEscuro(ev(a, 'sempre')), [
          'A luz da quinta só deve acender à noite. Como é que o micro:bit decide?', 'Usa «se está escuro então … senão …» dentro do «para sempre».', 'Põe o «se» com «está escuro» no «para sempre».'], 'Já vigia a noite!'),
        P.regra('luz_trocada', a => { const p = seEscuro(ev(a, 'sempre')); return !!p && ramo(p, 'sim').some(d => d.tipo === 'mk_digital' && d.v === 0); }, [
          ['surpreendida', 'Ui! A luz acende de dia e apaga à noite?'], 'O «então» corre quando está escuro: aí a luz liga (1).', 'Põe P2 para 1 no «então» e P2 para 0 no «senão».'], 'Luz no sítio certo!'),
        P.regra('luz_incompleta', a => { const p = seEscuro(ev(a, 'sempre')); return !!p && !(ramo(p, 'sim').some(d => d.tipo === 'mk_digital' && d.v === 1) && ramo(p, 'nao').some(d => d.tipo === 'mk_digital' && d.v === 0)); }, [
          'A luz acende… e quando volta o dia, quem a apaga?', 'Precisas de ligar num ramo e desligar no outro.', 'P2 para 1 no «então», P2 para 0 no «senão».'], 'Acende e apaga!'),
        P.evento('somalto', 'E o barulho da raposa? Quem fica à escuta do som?'),
        P.regra('alarme_sem_se', a => !seEscuro(ev(a, 'somalto')), [
          'De dia as galinhas cacarejam e não é perigo. Como é que o guarda sabe se é de noite?', 'Dentro de «em som alto» também precisas de «se está escuro».', 'Põe «se está escuro então … senão …» dentro de «em som alto».'], 'Guarda esperto!'),
        P.regra('alarme_fraco', a => { const q = seEscuro(ev(a, 'somalto')); return !!q && !(temR(ramo(q, 'sim'), 'mk_repetir') && temR(ramo(q, 'sim'), 'mk_tom') && icoR(ramo(q, 'sim'), 'Surprised')); }, [
          'Um alarme tem de assustar! Um só «pi» chega?', 'Usa «repetir 3 vezes» com um tom agudo, e mostra a cara surpreendida.', 'No «então» do som alto: repetir 3 (tom + pausa) e depois «mostrar ícone» surpreendido.'], 'Que alarme!'),
        P.regra('dia_sem_cara', a => { const q = seEscuro(ev(a, 'somalto')); return !!q && !icoR(ramo(q, 'nao'), 'Happy'); }, [
          'E de dia, quando há barulho, o que faz o guarda?', 'De dia está tudo bem: cara contente.', 'Põe a cara contente no «senão» do som alto.'], 'Tudo calmo de dia!'),
      ],
      sucesso: 'A quinta está protegida! O micro:bit junta duas informações — escuro e barulho — para decidir.',
      extensao: 'E se o alarme também mexesse um servo para assustar a raposa?',
      gambiarra: { xml: G.guarda, pedido: 'O meu guarda dá o alarme até de dia, quando as galinhas cacarejam! Ajudas-me a pô-lo só à noite?' },
    },
  };

  // ---- 11 · Passagem de nível (projeto)
  const repetirAviso = e => plano(e).find(p => p.tipo === 'mk_repetir' && plano(e).some(q => q.tipo === 'mk_tom' && q.dentroDe === 'mk_repetir') && plano(e).some(q => q.tipo === 'mk_digital' && q.dentroDe === 'mk_repetir'));
  const PASSAGEM = {
    titulo: 'Passagem de nível',
    missao: 'Quando o comboio toca no sensor, a cancela desce, a luz pisca com bips e depois a cancela sobe.',
    passos: [
      'Faz a cancela com o servo (pin 0) e um sensor de alumínio na linha do comboio (pin 1 + GND).',
      'Pin 1: servo para 0 (cancela em baixo).',
      'Depois, repetir 3 vezes: LED do pin 2 para 1, tom, LED para 0, pausa.',
      'No fim, servo para 180 (cancela em cima).',
      'O botão A põe a cancela a meio (90), para a manutenção. Experimenta tudo.',
    ],
    material: 'micro:bit V2, servo SG90, 1 LED, alumínio, crocodilos, um comboio de brinquedo',
    novos: [],
    caixa: ['mk_pino_tocado', 'mk_servo', 'mk_repetir', 'mk_digital_1', 'mk_digital_0', 'mk_tom', 'mk_pausa', 'mk_botao'],
    teste: 'pino:P1',
    ok: r => outsDe(r, 'pino:P1').some(x => {
      const o = x.outs.map(e => e.v);
      const sv = o.map((v, i) => [v, i]).filter(([v]) => v.startsWith('servo:'));
      if (sv.length < 2 || angulo(sv[0][0]) > 30 || angulo(sv[sv.length - 1][0]) < 150) return false;
      const meio = o.slice(sv[0][1], sv[sv.length - 1][1]);
      return meio.filter(v => v === 'digital:P2:1').length >= 3 && meio.filter(v => v.startsWith('tom:')).length >= 3;
    }) && outsDe(r, 'botao:A').some(x => servos(x.outs).some(g => g >= 60 && g <= 120)),
    tutor: {
      boasVindas: ['boas_vindas', 'Piiii! Vem aí o comboio! Vamos construir uma passagem de nível que protege os carros, passo a passo.'],
      parecePronto: a => { const e = ev(a, 'pino:P1'), g = servoDe(e); return g.length >= 2 && g[0] <= 30 && g[g.length - 1] >= 150 && !!repetirAviso(e) && repetirAviso(e).n >= 3 && servoDe(ev(a, 'botao:A')).some(x => x >= 60 && x <= 120); },
      testar: 'Parece pronto! Toca no pin 1 (o comboio) e depois carrega no A.',
      regras: [
        P.evento('pino:P1', 'Como é que a passagem de nível sabe que vem aí o comboio?'),
        P.regra('sem_descer', a => { const g = servoDe(ev(a, 'pino:P1')); return !g.length || g[0] > 30; }, [
          'O comboio vem aí! Qual é a primeira coisa que a cancela faz?', 'Desce: o servo vai para perto de 0.', 'Começa o pin 1 com «escrever servo pin P0 para 0».'], 'Cancela em baixo!'),
        P.regra('sem_aviso', a => !repetirAviso(ev(a, 'pino:P1')), [
          'Com a cancela em baixo, como avisas quem vem a pé?', 'Luz a piscar e bips, várias vezes: «repetir» com o LED e um tom.', 'Põe «repetir 3 vezes» com P2 para 1, tom, P2 para 0 e pausa.'], 'Aviso a funcionar!'),
        P.regra('aviso_curto', a => { const p = repetirAviso(ev(a, 'pino:P1')); return !!p && p.n < 3; }, [
          'Um piscar só passa despercebido. Quantas vezes pede o projeto?', 'O repetir tem de ser 3 ou mais.', 'Muda o número do repetir para 3.'], 'Bem visível!'),
        P.regra('sem_subir', a => { const g = servoDe(ev(a, 'pino:P1')); return g.length < 2 || g[g.length - 1] < 150; }, [
          'O comboio já passou… e os carros ficam à espera para sempre?', 'No fim, a cancela sobe: servo para 180.', 'Põe «escrever servo pin P0 para 180» no fim do pin 1.'], 'Os carros já passam!'),
        P.evento('botao:A', 'E a manutenção? Quem fica à escuta do A?'),
        P.regra('a_angulo', a => !servoDe(ev(a, 'botao:A')).some(g => g >= 60 && g <= 120), [
          'Na manutenção, a cancela fica a meio. Que ângulo é «a meio» entre 0 e 180?', 'A meio é 90 graus.', 'No A, põe o servo para 90.'], 'Modo manutenção!'),
      ],
      sucesso: 'Passagem de nível segura! Uma sequência bem ordenada: descer, avisar, subir.',
      extensao: 'E se a cancela descesse devagar, de 180 até 0, aos bocadinhos?',
      gambiarra: { xml: G.passagem, pedido: 'O comboio já passou e a minha cancela ficou em baixo! Os carros estão todos à espera. Encontras a gambiarra?' },
    },
  };

  // ============================================================ Nível 3 · Robótica e lógica (1–11)
  const iTipo = (e, t) => indice(e, p => p.tipo === t);
  const SALTOS = {
    titulo: 'Contador de saltos',
    missao: 'Cada vez que agitas o micro:bit, conta mais um salto e mostra quantos já vão.',
    passos: ['Dentro de «em agitar»: «mudar contador em 1».', 'Depois, «mostrar número» com a variável contador lá dentro.', 'Experimenta: agita várias vezes.'],
    material: 'micro:bit (segura-o na mão enquanto saltas)',
    novos: ['mk_var_mudar', 'mk_var', 'mk_mostrar_numero'],
    caixa: ['mk_agitar', 'mk_iniciar', 'mk_var_definir'],
    teste: 'agitar',
    ok: r => { const n = numeros(r); for (let i = 0; i + 2 < n.length; i++) if (n[i] === 1 && n[i + 1] === 2 && n[i + 2] === 3) return true; return false; },
    tutor: {
      boasVindas: ['boas_vindas', 'Nível novo: o micro:bit vai aprender a lembrar-se de números! Começamos por contar saltos.'],
      parecePronto: a => { const e = ev(a, 'agitar'); return tem(e, 'mk_var_mudar') && dentro(e, 'mk_mostrar_numero', 'mk_var') && iTipo(e, 'mk_var_mudar') < iTipo(e, 'mk_mostrar_numero'); },
      testar: 'Parece pronto! Agita três vezes e vê se conta 1, 2, 3.',
      regras: [
        P.evento('agitar', 'Os saltos sentem-se a abanar. Quem fica à escuta?'),
        com('sem_mudar', P.bloco('agitar', 'mk_var_mudar', 'Para contar, o micro:bit tem de se lembrar de quantos já foram. Onde é que ele guarda números?')),
        com('sem_mostrar', P.bloco('agitar', 'mk_mostrar_numero', 'O micro:bit já conta às escondidas. Como é que te mostra o número?')),
        com('sem_var', P.valorEm('agitar', 'mk_mostrar_numero', 'mk_var', 'Mostra sempre o mesmo número! Qual é o número que queres ver?')),
        P.regra('ordem', a => { const e = ev(a, 'agitar'); return iTipo(e, 'mk_mostrar_numero') >= 0 && iTipo(e, 'mk_var_mudar') > iTipo(e, 'mk_mostrar_numero'); }, [
          'Mostras o número antes de contar o salto… vai sempre um atrasado?', 'Primeiro soma, depois mostra.', 'Põe o «mudar contador» em cima do «mostrar número».'], 'Contagem em dia!'),
      ],
      sucesso: 'Contador a funcionar! A variável é uma caixinha onde o micro:bit guarda um número.',
      extensao: 'E se o botão A pusesse o contador outra vez a zero?',
      gambiarra: { xml: G.saltos, pedido: 'O meu contador anda sempre um salto atrasado! Ajudas-me a pô-lo certo?' },
    },
  };

  const operandos = (e, tipo) => { for (const p of plano(e)) { const u = p.usa || []; const i = u.findIndex(x => x.tipo === tipo); if (i >= 0) return [u[i + 1], u[i + 2]].map(x => x && x.tipo === 'mk_num' ? x.n : null); } return null; };
  const DADO = {
    titulo: 'Dado eletrónico',
    missao: 'Agita o micro:bit e ele mostra um número ao acaso de 1 a 6, como um dado.',
    passos: ['Dentro de «em agitar», põe «mostrar número».', 'No buraco do número, encaixa «escolher ao acaso de 1 até 6».', 'Experimenta: agita várias vezes.'],
    material: 'micro:bit (e um dado a sério, para comparar)',
    novos: ['mk_aleatorio'],
    caixa: ['mk_agitar', 'mk_mostrar_numero', 'mk_botao'],
    teste: 'agitar',
    ok: r => { const n = []; outsDe(r, 'agitar').forEach(x => x.outs.forEach(o => { if (o.v.startsWith('numero:')) n.push(Number(o.v.slice(7))); })); return n.length >= 4 && n.every(x => Number.isInteger(x) && x >= 1 && x <= 6) && distintos(n) >= 2; },
    tutor: {
      boasVindas: ['boas_vindas', 'Esqueceste-te do dado para o jogo de tabuleiro? Não faz mal: o micro:bit pode ser o dado!'],
      parecePronto: a => { const o = operandos(ev(a, 'agitar'), 'mk_aleatorio'); return dentro(ev(a, 'agitar'), 'mk_mostrar_numero', 'mk_aleatorio') && !!o && Math.min(...o) === 1 && Math.max(...o) === 6; },
      testar: 'Parece pronto! Agita várias vezes: sai sempre o mesmo?',
      regras: [
        P.evento('agitar', 'Um dado lança-se a abanar. Quem fica à escuta?'),
        com('sem_mostrar', P.bloco('agitar', 'mk_mostrar_numero', 'O micro:bit sente que o agitas. Como é que te mostra o número que saiu?')),
        com('sem_acaso', P.valorEm('agitar', 'mk_mostrar_numero', 'mk_aleatorio', 'O dado mostra sempre o mesmo número… como é que se escolhe ao acaso?')),
        P.regra('limites', a => { const o = operandos(ev(a, 'agitar'), 'mk_aleatorio'); return !!o && o.every(x => x !== null) && !(Math.min(...o) === 1 && Math.max(...o) === 6); }, [
          'Um dado tem que números?', 'Do 1 ao 6: nem 0, nem 7.', 'Escreve 1 e 6 nos buracos do «escolher ao acaso».'], 'Dado certinho!'),
      ],
      sucesso: 'Dado pronto! Ao acaso quer dizer que nem o micro:bit sabe o que vai sair.',
      extensao: 'E se, quando sai 6, aparecesse a cara contente depois do número?',
      gambiarra: { xml: G.dado, pedido: 'O meu dado tem batota: sai sempre 6! Consegues pô-lo justo?' },
    },
  };

  const mudarEm = e => blocos(e, 'mk_var_mudar');
  const PONTOS = {
    titulo: 'Pontos do jogo',
    missao: 'Num jogo, o A dá 1 ponto e o B dá 2 pontos; o A+B mostra quantos pontos tens.',
    passos: ['No A: «mudar pontos em 1». No B: «mudar pontos em 2».', 'No A+B: «mostrar número» com a variável pontos.', 'Experimenta: A, B, A e depois A+B — deve dar 4.'],
    material: 'micro:bit',
    novos: ['pp_mudar_pontos', 'pp_var_pontos'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_botao_AB', 'mk_mostrar_numero'],
    teste: 'botao:AB',
    ok: r => causou(r, s => s.includes('numero:4'), v => v === 'botao:AB'),
    tutor: {
      boasVindas: ['boas_vindas', 'Vamos fazer o placar de um jogo: há jogadas que valem 1 ponto e jogadas que valem 2!'],
      parecePronto: a => mudarEm(ev(a, 'botao:A')).some(p => p.n === 1) && mudarEm(ev(a, 'botao:B')).some(p => p.n === 2) && dentro(ev(a, 'botao:AB'), 'mk_mostrar_numero', 'mk_var'),
      testar: 'Parece pronto! A, B, A e depois A+B: dá 4?',
      regras: [
        P.evento('botao:A', 'Quem dá o ponto de 1?'),
        com('sem_mudar_A', P.bloco('botao:A', 'mk_var_mudar', 'O A já está à escuta. Como é que se soma um ponto?')),
        P.evento('botao:B', 'E a jogada de 2 pontos? Falta um botão.'),
        P.regra('b_vale_dois', a => !mudarEm(ev(a, 'botao:B')).some(p => p.n === 2), [
          'No B, quantos pontos vale a jogada?', 'O B soma 2, não 1.', 'Põe «mudar pontos em 2» no B.'], 'Dois pontos!'),
        P.evento('botao:AB', 'E no fim, como vês o placar?'),
        com('sem_mostrar_AB', P.bloco('botao:AB', 'mk_mostrar_numero', 'O A+B já está à escuta. O que é que ele mostra?')),
        com('sem_var', P.valorEm('botao:AB', 'mk_mostrar_numero', 'mk_var', 'Mostras um número fixo… mas os pontos estão guardados onde?')),
        P.regra('vars_diferentes', a => { const vs = [...mudarEm(ev(a, 'botao:A')), ...mudarEm(ev(a, 'botao:B'))].map(p => p.var); const ab = (blocos(ev(a, 'botao:AB'), 'mk_mostrar_numero')[0] || {}).n; return new Set(vs).size > 1 || (vs.length && ab && ab !== 'var:' + vs[0]); }, [
          'Estás a guardar pontos em caixas diferentes! Onde é que eles se juntam?', 'Usa sempre a mesma variável: pontos.', 'Escolhe «pontos» no menu de todos os blocos de variável.'], 'Tudo na mesma caixa!'),
      ],
      sucesso: 'Placar certo! 1 + 2 + 1 = 4. A variável vai somando tudo.',
      extensao: 'E se o logotipo tirasse 1 ponto (castigo)?',
      gambiarra: { xml: G.pontos, pedido: 'No meu jogo, o B vale tanto como o A! Assim não tem graça. Ajudas-me?' },
    },
  };

  const TEMPORIZADOR = {
    titulo: 'Temporizador',
    missao: 'O A começa uma contagem decrescente de 5 até 1 e, no fim, toca um som.',
    passos: ['No A: «definir contador para 5».', '«repetir 5 vezes»: mostrar o contador, pausa, mudar contador em -1.', 'Depois do repetir: «tocar som». Experimenta!'],
    material: 'micro:bit V2',
    novos: ['mk_var_definir', 'mk_repetir', 'mk_som'],
    caixa: ['mk_botao', 'pp_mudar_menos', 'mk_var', 'mk_mostrar_numero', 'mk_pausa'],
    teste: 'botao:A',
    ok: r => outsDe(r, 'botao:A').some(x => {
      const n = x.outs.filter(o => o.v.startsWith('numero:')).map(o => Number(o.v.slice(7)));
      const i1 = x.outs.findIndex(o => o.v === 'numero:1');
      return [5, 4, 3, 2, 1].every((v, i) => n[i] === v) && x.outs.some((o, k) => k > i1 && (o.v.startsWith('som:') || o.v.startsWith('tom:')));
    }),
    tutor: {
      boasVindas: ['boas_vindas', 'Cinco, quatro, três… Vamos fazer um temporizador para os jogos (ou para os ovos cozidos)!'],
      parecePronto: a => { const e = ev(a, 'botao:A'); return blocos(e, 'mk_var_definir').some(p => p.n === 5) && tem(e, 'mk_repetir') && mudarEm(e).some(p => p.n < 0) && (tem(e, 'mk_som') || tem(e, 'mk_tom')); },
      testar: 'Parece pronto! Carrega no A e conta com o micro:bit.',
      regras: [
        P.evento('botao:A', 'Quem dá a partida ao temporizador?'),
        com('sem_definir', P.bloco('botao:A', 'mk_var_definir', 'Uma contagem começa num número. Onde é que o micro:bit guarda o 5?')),
        com('sem_repetir', P.bloco('botao:A', 'mk_repetir', 'Mostrar, esperar, descer… cinco vezes. Há um bloco que repete?')),
        P.regra('sem_descer', a => !mudarEm(ev(a, 'botao:A')).some(p => p.n < 0), [
          'A contagem sobe em vez de descer! Como se tira 1?', 'Somar −1 é o mesmo que tirar 1.', 'Usa «mudar contador em -1».'], 'A descer!'),
        P.regra('sem_alarme', a => !tem(ev(a, 'botao:A'), 'mk_som') && !tem(ev(a, 'botao:A'), 'mk_tom'), [
          'O tempo acabou… e como é que sabes, se não estás a olhar?', 'No fim, um som avisa.', 'Põe «tocar som» depois do repetir (cá fora!).'], 'Trrrim!'),
      ],
      sucesso: 'Tempo! Contar para trás é somar −1 de cada vez.',
      extensao: 'E se a contagem começasse no 9?',
      gambiarra: { xml: G.temporizador, pedido: 'O meu temporizador conta 5, 6, 7… nunca mais acaba! Onde está a gambiarra?' },
    },
  };

  const seTemp = e => ses(e).find(p => usa(p, 'mk_temperatura'));
  const ramoQuente = p => verdade(p, 'mk_temperatura', 30) === false ? 'nao' : 'sim';
  const QUENTE = {
    titulo: 'Quente ou frio?',
    missao: 'Carrega no B: se estiverem mais de 25 °C, o micro:bit fica surpreendido (calor!); senão, fica contente.',
    passos: ['No B: «se … então … senão».', 'Na condição: temperatura > 25.', 'Então: surpreendido. Senão: contente. Experimenta com a temperatura no ecrã.'],
    material: 'micro:bit',
    novos: ['mk_temperatura', 'mk_comparar', 'mk_se_senao'],
    caixa: ['mk_botao_B', 'mk_icone', 'mk_icone_surpreendido', 'mk_escuro'],
    teste: 'botao:B',
    ok: r => { const st = porEstado(r, 'temperatura', v => v === 'botao:B'); return st.some(x => x.estado > 25 && x.saidas.includes('icone:Surprised')) && st.some(x => x.estado <= 25 && x.saidas.includes('icone:Happy')); },
    tutor: {
      boasVindas: ['boas_vindas', 'O micro:bit tem um termómetro escondido lá dentro! Vamos ensiná-lo a avisar quando está calor.'],
      parecePronto: a => { const p = seTemp(ev(a, 'botao:B')); return !!p && usa(p, 'mk_comparar') && icoR(ramo(p, ramoQuente(p)), 'Surprised') && icoR(ramo(p, ramoQuente(p) === 'sim' ? 'nao' : 'sim'), 'Happy'); },
      testar: 'Parece pronto! Põe a temperatura alta e carrega no B; depois baixa-a e carrega outra vez.',
      regras: [
        P.evento('botao:B', 'Quando é que o micro:bit mede? Quem fica à escuta do B?'),
        com('sem_se', P.bloco('botao:B', 'mk_se', 'O micro:bit tem de escolher entre duas caras. Que bloco escolhe?')),
        com('sem_temperatura', P.valorEm('botao:B', 'mk_se', 'mk_temperatura', 'O «se» está a perguntar outra coisa… como é que se pergunta pela temperatura?')),
        P.regra('trocado', a => { const p = seTemp(ev(a, 'botao:B')); return !!p && icoR(ramo(p, ramoQuente(p)), 'Happy'); }, [
          ['surpreendida', 'Ui! Diz que está fresquinho quando está calor?'], '«>» quer dizer «maior do que»: 30 > 25 é verdade.', 'Com «temperatura > 25», o surpreendido vai no «então».'], 'Termómetro certo!'),
        P.regra('sem_caras', a => { const p = seTemp(ev(a, 'botao:B')); return !!p && !(icoR(ramo(p, 'sim'), 'Surprised') || icoR(ramo(p, 'nao'), 'Surprised')) || (!!p && !(icoR(ramo(p, 'sim'), 'Happy') || icoR(ramo(p, 'nao'), 'Happy'))); }, [
          'Falta uma cara. Que cara faz com calor, e que cara faz com fresco?', 'Calor: surpreendido. Fresco: contente.', 'Põe uma cara no «então» e outra no «senão».'], 'Duas caras, duas respostas!'),
      ],
      sucesso: 'Bom termómetro! O «>» quer dizer «maior do que».',
      extensao: 'E se, abaixo de 10 °C, mostrasse a cara triste?',
      gambiarra: { xml: G.quente, pedido: 'O meu termómetro diz «calor!» quando está frio! Ajudas-me a virar a comparação?' },
    },
  };

  const DIARIO = {
    titulo: 'Diário de saltos',
    missao: 'Conta os saltos ao agitar; o A guarda o número de saltos na tabela de dados e recomeça do zero.',
    passos: ['Em agitar: «mudar contador em 1».', 'No A: «registar dados saltos = contador» e depois «definir contador para 0».', 'Experimenta: agita 3 vezes e carrega no A; agita 1 vez e carrega no A.'],
    material: 'micro:bit V2 (os dados ficam no ficheiro MY_DATA.HTM)',
    novos: ['pp_registar_saltos'],
    caixa: ['mk_agitar', 'mk_botao', 'mk_var_mudar', 'mk_var_definir', 'mk_var'],
    teste: 'botao:A',
    ok: r => { const v = r.filter(e => e.dir === 'out' && e.v.startsWith('registo:')).map(e => Number(e.v.split(':').pop())); const i = v.indexOf(3); return i >= 0 && v.indexOf(1, i + 1) > i; },
    tutor: {
      boasVindas: ['boas_vindas', 'Os cientistas escrevem tudo num diário. O nosso micro:bit também vai ter uma tabela de dados!'],
      parecePronto: a => { const e = ev(a, 'botao:A'); return tem(ev(a, 'agitar'), 'mk_var_mudar') && dentro(e, 'mk_registar', 'mk_var') && iTipo(e, 'mk_var_definir') > iTipo(e, 'mk_registar'); },
      testar: 'Parece pronto! Agita 3 vezes, A, agita 1 vez, A — e vê a tabela.',
      regras: [
        P.evento('agitar', 'Os saltos contam-se a abanar. Quem fica à escuta?'),
        com('sem_mudar', P.bloco('agitar', 'mk_var_mudar', 'Onde é que o micro:bit vai somando os saltos?')),
        P.evento('botao:A', 'E quem escreve no diário?'),
        com('sem_registar', P.bloco('botao:A', 'mk_registar', 'Há um bloco verde-escuro que escreve uma linha na tabela de dados. Qual é?')),
        com('sem_var', P.valorEm('botao:A', 'mk_registar', 'mk_var', 'Escreves sempre o mesmo número! Onde estão guardados os saltos?')),
        P.regra('sem_reset', a => !tem(ev(a, 'botao:A'), 'mk_var_definir'), [
          'Depois de escrever, a contagem continua a somar a anterior… é isso que queres?', 'Depois de registar, põe o contador a zero.', 'No A, por baixo do «registar», junta «definir contador para 0».'], 'Recomeça do zero!'),
        P.regra('reset_antes', a => { const e = ev(a, 'botao:A'); return iTipo(e, 'mk_var_definir') >= 0 && iTipo(e, 'mk_var_definir') < iTipo(e, 'mk_registar'); }, [
          'A tabela só tem zeros! Lê o A de cima para baixo: o que acontece primeiro?', 'Primeiro escreve-se, depois apaga-se.', 'Põe o «definir contador para 0» por baixo do «registar».'], 'Ordem certa!'),
      ],
      sucesso: 'Diário de saltos! Registar dados é guardar medições para as estudar depois.',
      extensao: 'E se o B registasse também o tempo de execução?',
      gambiarra: { xml: G.diario, pedido: 'A minha tabela só tem zeros! Acho que apago os saltos antes de os escrever…' },
    },
  };

  // ---- 7 · Jogo de reflexos (projeto)
  const REFLEXOS = {
    titulo: 'Jogo de reflexos',
    missao: 'O A espera um tempo ao acaso e mostra um coração; carrega no B o mais depressa possível — o micro:bit mostra o teu tempo e dá-te um ponto se fores rápido.',
    passos: [
      'A: pausa com «escolher ao acaso de 1000 até 2000» lá dentro, mostrar coração, «definir medida para tempo de execução».',
      'B: se «tempo de execução − medida» < 1500, então «mudar pontos em 1» e cara contente.',
      'Ainda no B, depois do «se»: «mostrar número» com «tempo de execução − medida» (são milissegundos!).',
      'A+B: mostrar os pontos.',
      'Experimenta: A, espera pelo coração, B o mais rápido que conseguires… e no fim A+B.',
    ],
    material: 'micro:bit (joga com um amigo: quem faz mais pontos?)',
    novos: ['mk_tempo', 'pp_tempo_menos_medida'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_botao_AB', 'mk_pausa', 'mk_aleatorio', 'mk_icone_coracao', 'pp_definir_medida', 'pp_mudar_pontos', 'pp_var_pontos', 'mk_mostrar_numero', 'mk_se_entao', 'mk_comparar', 'mk_icone'],
    teste: 'botao:A',
    ok: r => {
      const A = outsDe(r, 'botao:A').find(x => x.outs.some(o => o.v === 'icone:Heart')); if (!A) return false;
      const h = A.outs.find(o => o.v === 'icone:Heart'); if (h.t - A.t < 900) return false;
      const B = outsDe(r, 'botao:B').find(x => x.t > h.t && x.outs.some(o => o.v.startsWith('numero:'))); if (!B) return false;
      const reac = Number(B.outs.find(o => o.v.startsWith('numero:')).v.slice(7));
      if (Math.abs(reac - (B.t - h.t)) > 250) return false;
      return outsDe(r, 'botao:AB').some(x => x.t > B.t && x.outs.some(o => o.v === 'numero:1'));
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto de reflexos: quem é mais rápido, tu ou o teu amigo? O micro:bit vai medir em milissegundos!'],
      parecePronto: a => {
        const e = ev(a, 'botao:A'), f = ev(a, 'botao:B');
        return dentro(e, 'mk_pausa', 'mk_aleatorio') && icones(e, 'Heart').length > 0 && dentro(e, 'mk_var_definir', 'mk_tempo') && iTipo(e, 'mk_var_definir') > indice(e, p => p.tipo === 'mk_icone') &&
          dentro(f, 'mk_mostrar_numero', 'mk_conta') && ses(f).some(p => usa(p, 'mk_comparar')) && tem(f, 'mk_var_mudar') && dentro(ev(a, 'botao:AB'), 'mk_mostrar_numero', 'mk_var');
      },
      testar: 'Parece pronto! Carrega no A, espera pelo coração e carrega no B o mais depressa que puderes. No fim, A+B.',
      regras: [
        P.evento('botao:A', 'O jogo começa quando? Quem fica à escuta?'),
        P.regra('sem_espera_acaso', a => !dentro(ev(a, 'botao:A'), 'mk_pausa', 'mk_aleatorio'), [
          'Se o coração aparecer sempre ao mesmo tempo, dá para fazer batota! Como o tornas imprevisível?', 'A pausa pode ter um número ao acaso lá dentro.', 'Encaixa «escolher ao acaso de 1000 até 2000» no buraco da pausa.'], 'Agora ninguém adivinha!'),
        P.regra('sem_sinal', a => icones(ev(a, 'botao:A'), 'Heart').length === 0, [
          'Como é que o jogador sabe que é a hora de carregar?', 'Depois da pausa aparece um sinal: o coração.', 'Põe «mostrar ícone» coração a seguir à pausa.'], 'Sinal à vista!'),
        P.regra('sem_relogio', a => !dentro(ev(a, 'botao:A'), 'mk_var_definir', 'mk_tempo'), [
          'Para medir o teu tempo, o micro:bit tem de se lembrar de quando o coração apareceu…', 'O «tempo de execução» é um relógio que nunca para. Guarda-o numa variável.', 'Depois do coração: «definir medida para tempo de execução».'], 'Relógio guardado!'),
        P.regra('relogio_antes', a => { const e = ev(a, 'botao:A'); return iTipo(e, 'mk_var_definir') >= 0 && iTipo(e, 'mk_var_definir') < indice(e, p => p.tipo === 'mk_icone'); }, [
          ['surpreendida', 'Ui! Começas a contar antes de o coração aparecer?'], 'O relógio guarda-se depois do sinal.', 'Põe o «definir medida» a seguir ao coração.'], 'Agora é justo!'),
        P.evento('botao:B', 'Agora a corrida: quem para o cronómetro?'),
        P.regra('sem_conta', a => !dentro(ev(a, 'botao:B'), 'mk_mostrar_numero', 'mk_conta'), [
          'O tempo de execução é enorme: conta desde que o micro:bit ligou! Como sabes só o teu tempo?', 'O teu tempo é: tempo de agora − tempo guardado.', 'No B: «mostrar número» com «tempo de execução − medida».'], 'Esse é o teu tempo!'),
        P.regra('sem_pontos', a => !(ses(ev(a, 'botao:B')).some(p => usa(p, 'mk_comparar')) && tem(ev(a, 'botao:B'), 'mk_var_mudar')), [
          'Foste rápido! E o prémio?', 'Se o tempo for menor que 1500, ganha-se um ponto: «se … então» com uma comparação.', 'No início do B (antes do número, que demora a passar): se «tempo de execução − medida» < 1500, então «mudar pontos em 1» e cara contente.'], 'Ponto ganho!'),
        P.evento('botao:AB', 'E no fim, como vês quantos pontos fizeste?'),
        com('sem_ver_pontos', P.valorEm('botao:AB', 'mk_mostrar_numero', 'mk_var', 'O A+B mostra um número fixo… onde estão guardados os pontos?')),
      ],
      sucesso: 'Reflexos de ninja! Medir é guardar o tempo de início e subtraí-lo ao tempo de fim.',
      extensao: 'E se, com mais de 3 pontos, aparecesse o texto «CAMPEÃO»?',
      gambiarra: { xml: G.reflexos, pedido: 'O meu jogo diz que demorei milhares de milissegundos! Acho que me esqueci de fazer uma conta…' },
    },
  };

  // ---- 8 · Contador de voltas (projeto)
  const seMeta = e => ses(e).find(p => usa(p, 'mk_comparar') && usa(p, 'mk_var'));
  const VOLTAS = {
    titulo: 'Contador de voltas',
    missao: 'Uma pista para carrinhos: o A dá a partida; cada volta toca no sensor (pin 1) e conta; à 3.ª volta o micro:bit escreve FIM e mostra o tempo total em segundos.',
    passos: [
      'Faz a pista e um sensor de alumínio na meta (pin 1 + GND): o carrinho fecha o circuito ao passar.',
      'A: «definir contador para 0» e «definir medida para tempo de execução».',
      'Pin 1: «mudar contador em 1»; se contador = 3, então mostrar texto «FIM» e mostrar (tempo de execução − medida) ÷ 1000.',
      'Senão: mostrar o contador.',
      'Experimenta: A, e depois três toques no pin 1.',
    ],
    material: 'micro:bit, carrinho, cartão, alumínio, 2 crocodilos',
    novos: ['pp_div_1000'],
    caixa: ['mk_botao', 'mk_pino_tocado', 'mk_var_definir', 'pp_definir_medida', 'mk_var_mudar', 'mk_var', 'mk_se_senao', 'pp_comparar_igual', 'mk_mostrar_numero', 'mk_mostrar_texto', 'pp_tempo_menos_medida'],
    teste: 'pino:P1',
    ok: r => {
      const as = outsDe(r, 'botao:A'); if (!as.length) return false;
      const tA = as[as.length - 1].t;
      const ps = outsDe(r, 'pino:P1').filter(x => x.t > tA); if (ps.length < 3) return false;
      const ns = ps.map(x => (x.outs.find(o => o.v.startsWith('numero:')) || {}).v);
      if (ns[0] !== 'numero:1' || ns[1] !== 'numero:2') return false;
      const o3 = ps[2].outs, fim = o3.findIndex(o => /^texto:.*fim/i.test(o.v)), num = o3.findIndex((o, k) => k > fim && o.v.startsWith('numero:'));
      if (fim < 0 || num < 0) return false;
      return Math.abs(Number(o3[num].v.slice(7)) * 1000 - (o3[num].t - tA)) < 400;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Corrida de carrinhos! O micro:bit vai ser o juiz: conta as voltas e cronometra a corrida.'],
      parecePronto: a => {
        const e = ev(a, 'botao:A'), f = ev(a, 'pino:P1'), p = seMeta(f);
        return dentro(e, 'mk_var_definir', 'mk_tempo') && tem(f, 'mk_var_mudar') && !!p && temR(ramo(p, 'sim'), 'mk_mostrar_texto') && ramo(p, 'sim').some(d => d.tipo === 'mk_mostrar_numero' && (d.usa || []).some(u => u.tipo === 'mk_tempo') && (d.usa || []).some(u => u.op === '/'));
      },
      testar: 'Parece pronto! Carrega no A e depois toca três vezes no pin 1.',
      regras: [
        P.evento('botao:A', 'Quem dá a partida da corrida?'),
        P.regra('a_sem_relogio', a => !dentro(ev(a, 'botao:A'), 'mk_var_definir', 'mk_tempo'), [
          'Para saber quanto tempo demorou a corrida, de que momento te tens de lembrar?', 'Na partida, guarda o relógio: «definir medida para tempo de execução».', 'No A, junta «definir medida para tempo de execução».'], 'Partida cronometrada!'),
        P.regra('a_sem_zero', a => !blocos(ev(a, 'botao:A'), 'mk_var_definir').some(p => p.n === 0), [
          'Se fizeres outra corrida, as voltas da anterior ainda contam?', 'Na partida, as voltas voltam a zero.', 'No A, junta «definir contador para 0».'], 'Voltas a zero!'),
        P.evento('pino:P1', 'Como é que o micro:bit sabe que o carrinho passou na meta?'),
        com('sem_mudar', P.bloco('pino:P1', 'mk_var_mudar', 'O carrinho passou! Onde é que se soma uma volta?')),
        P.regra('sem_meta', a => !seMeta(ev(a, 'pino:P1')), [
          'Como é que o micro:bit sabe que a corrida acabou?', 'Pergunta-lhe se as voltas já chegaram a 3: «se contador = 3».', 'No pin 1: «se contador = 3 então … senão …».'], 'Já há meta!'),
        P.regra('meta_errada', a => { const p = seMeta(ev(a, 'pino:P1')); return !!p && verdade(p, 'mk_var', 3) === false; }, [
          'A corrida devia acabar à 3.ª volta. O teu «se» pergunta por quantas?', 'O número da comparação é o número de voltas.', 'Muda o número do «se» para 3.'], 'Três voltas, certo!'),
        P.regra('sem_fim', a => { const p = seMeta(ev(a, 'pino:P1')); return !!p && !temR(ramo(p, 'sim'), 'mk_mostrar_texto'); }, [
          'Acabou a corrida! Como é que o micro:bit avisa toda a gente?', 'Escreve «FIM» com «mostrar texto».', 'No «então», põe «mostrar texto» com «FIM».'], 'FIM!'),
        P.regra('sem_tempo', a => { const p = seMeta(ev(a, 'pino:P1')); return !!p && !ramo(p, 'sim').some(d => d.tipo === 'mk_mostrar_numero' && (d.usa || []).some(u => u.tipo === 'mk_tempo')); }, [
          'E quanto tempo demorou a corrida?', 'Tempo de agora − tempo da partida.', 'No «então», depois do FIM: «mostrar número» com «tempo de execução − medida».'], 'Corrida cronometrada!'),
        P.regra('sem_segundos', a => { const p = seMeta(ev(a, 'pino:P1')); return !!p && !ramo(p, 'sim').some(d => d.tipo === 'mk_mostrar_numero' && (d.usa || []).some(u => u.op === '/')); }, [
          'O tempo vem em milissegundos: 3000 é quanto em segundos?', '1 segundo são 1000 milissegundos: divide por 1000.', 'Mete o «tempo de execução − medida» dentro de uma conta «÷ 1000».'], 'Em segundos!'),
      ],
      sucesso: 'Corrida cronometrada! Contar voltas, comparar com 3 e medir o tempo — um programa a sério.',
      extensao: 'E se guardasses a melhor corrida na variável «recorde»?',
      gambiarra: { xml: G.voltas, pedido: 'O meu carrinho já deu 3 voltas e a corrida nunca acaba! Será que me enganei na meta?' },
    },
  };

  // ---- 9 · Apanha a estrela (projeto)
  function estrelaOk(reg) {
    let alvo = null, pos = 0, rondas = 0, mov = 0;
    for (let i = 0; i < reg.length; i++) {
      const e = reg[i];
      if (e.dir === 'out') { const m = /^acender:(\d+),4$/.exec(e.v); if (m) pos = +m[1]; continue; }
      const outs = [];
      for (let j = i + 1; j < reg.length && reg[j].dir === 'out'; j++) outs.push(reg[j].v);
      const ult = re => { const l = outs.map(v => re.exec(v)).filter(Boolean); return l.length ? +l[l.length - 1][1] : null; };
      if (e.v === 'agitar') { const a = ult(/^acender:(\d+),0$/); if (a === null) return false; alvo = a; }
      else if (e.v === 'gesto:right' || e.v === 'gesto:left') {
        const p = ult(/^acender:(\d+),4$/); if (p === null) return false;
        if (p !== (e.v === 'gesto:right' ? Math.min(pos + 1, 4) : Math.max(pos - 1, 0))) return false;
        mov++;
      } else if (e.v === 'botao:A') {
        if (alvo === null) return false;
        const ic = outs.find(v => v.startsWith('icone:'));
        if (ic !== (pos === alvo ? 'icone:Happy' : 'icone:Sad')) return false;
        rondas++;
      }
    }
    return rondas >= 3 && mov >= 3;
  }
  const mudancas = (a, k) => mudarEm(ev(a, k)).map(p => p.n);
  const ESTRELA = {
    titulo: 'Apanha a estrela',
    missao: 'Agita e aparece uma estrela ao acaso na linha de cima; inclina para mover o teu ponto na linha de baixo; no A, se estiveres por baixo da estrela, ganhas!',
    passos: [
      'No arranque: «definir passos para 0» e acender (passos, 4).',
      'Agitar: «definir medida para escolher ao acaso de 0 até 4», limpar ecrã, acender (medida, 0) e acender (passos, 4).',
      'Inclinado para a direita: apagar (passos, 4); se passos < 4, mudar passos em 1; acender (passos, 4).',
      'Inclinado para a esquerda: o contrário (se passos > 0, mudar passos em -1).',
      'A: se passos = medida, então cara contente, senão cara triste. Experimenta!',
    ],
    material: 'micro:bit (faz uma moldura de cartão com o céu e o chão)',
    novos: ['mk_apagar_led'],
    caixa: ['mk_iniciar', 'mk_agitar', 'mk_gesto', 'mk_gesto_direita', 'mk_botao', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_aleatorio', 'mk_acender', 'mk_limpar', 'mk_se_entao', 'mk_se_senao', 'mk_comparar', 'mk_icone'],
    teste: 'agitar',
    ok: estrelaOk,
    tutor: {
      boasVindas: ['boas_vindas', 'Agora vais inventar um jogo a sério! Uma estrela, um ponto que anda e uma regra para ganhar.'],
      parecePronto: a => dentro(ev(a, 'agitar'), 'mk_var_definir', 'mk_aleatorio') && tem(ev(a, 'agitar'), 'mk_acender') &&
        mudancas(a, 'gesto:right').some(n => n > 0) && mudancas(a, 'gesto:left').some(n => n < 0) && tem(ev(a, 'gesto:right'), 'mk_apagar_led') && tem(ev(a, 'gesto:left'), 'mk_apagar_led') &&
        ses(ev(a, 'botao:A')).some(p => usa(p, 'mk_comparar')),
      testar: 'Parece pronto! Agita, inclina até ficares por baixo da estrela e carrega no A.',
      regras: [
        P.evento('agitar', 'Quem faz aparecer a estrela?'),
        P.regra('alvo_sem_acaso', a => !dentro(ev(a, 'agitar'), 'mk_var_definir', 'mk_aleatorio'), [
          'Se a estrela aparecer sempre no mesmo sítio, o jogo fica fácil demais! Como a pões num sítio ao acaso?', 'Guarda um número ao acaso numa variável: «definir medida para escolher ao acaso de 0 até 4».', 'Em agitar: «definir medida para» com «escolher ao acaso de 0 até 4».'], 'Estrela imprevisível!'),
        P.regra('alvo_sem_luz', a => !tem(ev(a, 'agitar'), 'mk_acender'), [
          'A estrela escolheu o sítio… mas ninguém a vê!', 'Acende a luz (medida, 0): coluna medida, linha de cima.', 'Junta «acender x (medida) y 0» em agitar.'], 'Brilha!'),
        P.evento('gesto:right', 'Como é que o teu ponto anda para a direita?'),
        P.evento('gesto:left', 'E para a esquerda?'),
        P.regra('anda_sem_mudar', a => !tem(ev(a, 'gesto:right'), 'mk_var_mudar') || !tem(ev(a, 'gesto:left'), 'mk_var_mudar'), [
          'Inclinas e o ponto não sai do sítio. Onde está guardada a posição dele?', 'A posição é a variável passos: muda-a ao inclinar.', 'Direita: «mudar passos em 1». Esquerda: «mudar passos em -1».'], 'Já anda!'),
        P.regra('anda_sem_apagar', a => !tem(ev(a, 'gesto:right'), 'mk_apagar_led') || !tem(ev(a, 'gesto:left'), 'mk_apagar_led'), [
          'O ponto deixa um rasto de luzes acesas! O que falta fazer antes de andar?', 'Antes de mudar a posição, apaga a luz onde o ponto estava.', 'No início de cada inclinação: «apagar x (passos) y 4».'], 'Sem rasto!'),
        P.regra('sentido_trocado', a => mudancas(a, 'gesto:right').some(n => n < 0) || mudancas(a, 'gesto:left').some(n => n > 0), [
          ['surpreendida', 'Ui! Inclinas para a direita e o ponto foge para a esquerda?'], 'Para a direita o x aumenta (+1); para a esquerda diminui (−1).', 'Direita: mudar passos em 1. Esquerda: mudar passos em -1.'], 'Para o lado certo!'),
        P.evento('botao:A', 'E como se sabe se ganhaste? Quem fica à escuta do A?'),
        P.regra('a_sem_comparar', a => !ses(ev(a, 'botao:A')).some(p => usa(p, 'mk_comparar')), [
          'Ganhas quando estás por baixo da estrela. Como se compara a tua posição com a dela?', 'Usa «se passos = medida então … senão …».', 'No A: se passos = medida, cara contente; senão, cara triste.'], 'Que jogo!'),
      ],
      sucesso: 'Jogo inventado por ti! Variáveis para a posição, números ao acaso e comparações: os ingredientes de quase todos os jogos.',
      extensao: 'E se a cada vitória ganhasses um ponto e o logotipo mostrasse os pontos?',
      gambiarra: { xml: G.estrela, pedido: 'Inclino para a direita e o meu ponto foge para a esquerda! Que gambiarra fiz eu?' },
    },
  };

  // ---- 10 · Robô com três modos (projeto)
  const MODOS = {
    titulo: 'Robô com três modos',
    missao: 'Um robô com três modos: o A muda de modo (dormir → passear → medir → dormir…) e o B regista o modo na tabela de dados.',
    passos: [
      'A: «mudar contador em 1» e depois «definir contador para resto de contador ÷ 3» (assim volta a 0 depois do 2).',
      '«para sempre»: se contador = 0, cara a dormir.',
      'Se contador = 1: cara contente e servo para 180 (passear).',
      'Se contador = 2: mostrar número com a temperatura (medir).',
      'B: «registar dados modo = contador». Experimenta: A, A, A e B.',
    ],
    material: 'micro:bit V2, servo SG90, 3 crocodilos, um robô de cartão',
    novos: ['mk_resto'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_sempre', 'mk_se_entao', 'pp_comparar_igual', 'mk_var_mudar', 'mk_var_definir', 'mk_var', 'mk_icone', 'mk_icone_dormir', 'mk_servo', 'mk_mostrar_numero', 'mk_temperatura', 'pp_registar_modo'],
    teste: 'botao:A',
    ok: r => {
      const as = outsDe(r, 'botao:A'); if (as.length < 3) return false;
      const temp = (() => { let t = null; for (const e of r) if (e.dir === 'in' && e.v.startsWith('temperatura:')) t = Number(e.v.split(':').pop()); return t; })();
      const [m1, m2, m3] = as.slice(-3).map(x => x.outs.map(o => o.v));
      const ok1 = m1.includes('icone:Happy') && m1.some(v => v.startsWith('servo:') && angulo(v) >= 150);
      const ok2 = temp !== null && m2.includes('numero:' + temp);
      const ok3 = m3.includes('icone:Asleep');
      return ok1 && ok2 && ok3 && causou(r, s => s.some(v => /^registo:.*:0$/.test(v)), v => v === 'botao:B');
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Os robôs a sério têm modos: dormir, trabalhar, medir… O teu vai mudar de modo com um botão!'],
      parecePronto: a => { const e = ev(a, 'sempre'); return tem(ev(a, 'botao:A'), 'mk_var_mudar') && (tem(ev(a, 'botao:A'), 'mk_resto') || ses(ev(a, 'botao:A')).length > 0) && ses(e).length >= 3 && tem(e, 'mk_servo') && dentro(e, 'mk_mostrar_numero', 'mk_temperatura') && dentro(ev(a, 'botao:B'), 'mk_registar', 'mk_var'); },
      testar: 'Parece pronto! Põe uma temperatura, carrega no A três vezes (devagar) e depois no B.',
      regras: [
        P.evento('botao:A', 'Quem muda o modo do robô?'),
        com('sem_mudar', P.bloco('botao:A', 'mk_var_mudar', 'O modo é um número guardado. Como é que o A passa ao modo seguinte?')),
        P.regra('sem_volta', a => !tem(ev(a, 'botao:A'), 'mk_resto') && ses(ev(a, 'botao:A')).length === 0, [
          'Depois do modo 2 vem o 3, o 4, o 5… mas o robô só tem 3 modos! Como voltas ao 0?', 'O resto da divisão por 3 dá sempre 0, 1 ou 2.', 'Depois do mudar: «definir contador para resto de contador ÷ 3».'], 'Anda em roda!'),
        P.evento('sempre', 'O robô tem de estar sempre a ver em que modo está. Que bloco repete sem parar?'),
        P.regra('poucos_modos', a => ses(ev(a, 'sempre')).length < 3, [
          'Quantos modos tem o robô? E quantas perguntas estás a fazer?', 'Um «se contador = …» para cada modo: 0, 1 e 2.', 'Põe três «se … então» no para sempre, um por modo.'], 'Três modos!'),
        P.regra('modo_passear', a => !tem(ev(a, 'sempre'), 'mk_servo'), [
          'No modo passear o robô mexe-se. Quem mexe?', 'O servo roda para 180 no modo 1.', 'No «se contador = 1», junta «escrever servo pin P0 para 180».'], 'A passear!'),
        P.regra('modo_medir', a => !dentro(ev(a, 'sempre'), 'mk_mostrar_numero', 'mk_temperatura'), [
          'No modo medir, o que é que o robô mede?', 'Mostra a temperatura com «mostrar número».', 'No «se contador = 2»: «mostrar número» com «temperatura (°C)».'], 'A medir!'),
        P.evento('botao:B', 'E quem escreve o modo na tabela?'),
        com('sem_registar', P.valorEm('botao:B', 'mk_registar', 'mk_var', 'O que vai para a tabela tem de ser o modo. Onde está guardado?')),
      ],
      sucesso: 'Robô com estados! O resto da divisão por 3 faz o contador andar em roda: 0, 1, 2, 0, 1, 2…',
      extensao: 'E se o logotipo mostrasse o número do modo em que o robô está?',
      gambiarra: { xml: G.modos, pedido: 'O meu robô, depois do modo medir, fica parado e não volta a dormir! Que gambiarra é esta?' },
    },
  };

  // ---- 11 · Cofre com código (projeto)
  const seCodigo = e => ses(e).find(p => usa(p, 'mk_comparar') && usa(p, 'mk_var'));
  const COFRE = {
    titulo: 'Cofre com código',
    missao: 'Um cofre com código secreto: A duas vezes e depois B abre; código errado dá alarme; A+B fecha o cofre.',
    passos: [
      'Faz o cofre numa caixa com a fechadura presa ao servo (pin 0).',
      'A: «mudar contador em 1».',
      'B: se contador = 2, então servo para 90, cara contente e um som; senão, cara triste e um tom de alarme.',
      'Ainda no B, no fim: «definir contador para 0» (o código recomeça).',
      'A+B: servo para 0 (fecha). Experimenta: A, A, B; depois A, B; depois A+B.',
    ],
    material: 'micro:bit V2, servo SG90, 3 crocodilos, uma caixa de cartão',
    novos: [],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_botao_AB', 'mk_var_mudar', 'mk_var_definir', 'mk_var', 'mk_se_senao', 'pp_comparar_igual', 'mk_servo', 'mk_icone', 'mk_icone_triste', 'mk_som', 'mk_tom'],
    teste: 'botao:B',
    ok: r => {
      const bs = outsDe(r, 'botao:B'); if (bs.length < 2) return false;
      const [b1, b2] = bs.map(x => x.outs.map(o => o.v));
      const abre = b1.includes('icone:Happy') && b1.some(v => v.startsWith('servo:') && angulo(v) >= 60 && angulo(v) <= 120);
      const alarme = b2.includes('icone:Sad') && temSom(b2) && !b2.some(v => v.startsWith('servo:') && angulo(v) >= 60);
      return abre && alarme && outsDe(r, 'botao:AB').some(x => servos(x.outs).some(g => g <= 10));
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Último projeto do nível: um cofre com código secreto! Só quem souber o código o consegue abrir.'],
      parecePronto: a => { const p = seCodigo(ev(a, 'botao:B')), e = ev(a, 'botao:B'); return tem(ev(a, 'botao:A'), 'mk_var_mudar') && !!p && verdade(p, 'mk_var', 2) === true && servoRamo(p, 'sim').some(g => g >= 60 && g <= 120) && (temR(ramo(p, 'nao'), 'mk_tom') || temR(ramo(p, 'nao'), 'mk_som')) && iTipo(e, 'mk_var_definir') > indice(e, q => q === p) && servoDe(ev(a, 'botao:AB')).some(g => g <= 10); },
      testar: 'Parece pronto! A, A, B (abre?); depois A, B (alarme?); depois A+B (fecha?).',
      regras: [
        P.evento('botao:A', 'O código faz-se com toques no A. Quem fica à escuta?'),
        com('sem_mudar', P.bloco('botao:A', 'mk_var_mudar', 'Como é que o cofre se lembra de quantas vezes carregaste no A?')),
        P.evento('botao:B', 'E quem verifica o código?'),
        P.regra('b_sem_se', a => ses(ev(a, 'botao:B')).length === 0, [
          'O cofre tem de decidir: abre ou dá alarme. Que bloco decide?', 'Usa «se … então … senão».', 'No B: «se … então … senão».'], 'Já decide!'),
        P.regra('b_sem_codigo', a => ses(ev(a, 'botao:B')).length > 0 && !seCodigo(ev(a, 'botao:B')), [
          'O código é «duas vezes A». Como se pergunta isso ao micro:bit?', 'Compara a variável com 2: «contador = 2».', 'Na condição do «se», põe «contador = 2».'], 'Código verificado!'),
        P.regra('abre_sem_servo', a => { const p = seCodigo(ev(a, 'botao:B')); return !!p && !servoRamo(p, 'sim').some(g => g >= 60 && g <= 120); }, [
          'O código está certo… e a fechadura?', 'Quem abre a fechadura é o servo: 90 graus.', 'No «então»: «escrever servo pin P0 para 90».'], 'Abre-te, sésamo!'),
        P.regra('sem_alarme', a => { const p = seCodigo(ev(a, 'botao:B')); return !!p && !(temR(ramo(p, 'nao'), 'mk_tom') || temR(ramo(p, 'nao'), 'mk_som')); }, [
          'Alguém tentou um código errado e o cofre ficou calado?', 'No «senão», faz barulho: um tom de alarme.', 'No «senão», junta «tocar tom» à cara triste.'], 'Alarme a tocar!'),
        P.regra('sem_recomecar', a => !tem(ev(a, 'botao:B'), 'mk_var_definir'), [
          'Depois de tentar, os toques antigos ainda contam? O código recomeça?', 'Depois de verificar, o contador volta a zero.', 'No fim do B (fora do «se»), «definir contador para 0».'], 'Código novo!'),
        P.regra('recomeca_cedo', a => { const e = ev(a, 'botao:B'), p = seCodigo(e); return !!p && iTipo(e, 'mk_var_definir') >= 0 && iTipo(e, 'mk_var_definir') < indice(e, q => q === p); }, [
          ['surpreendida', 'Ui! Apagas o código antes de o verificar?'], 'Primeiro verifica-se, depois recomeça-se.', 'Põe o «definir contador para 0» por baixo do «se».'], 'Ordem certa!'),
        P.evento('botao:AB', 'E quem fecha o cofre?'),
        P.regra('ab_sem_fechar', a => !servoDe(ev(a, 'botao:AB')).some(g => g <= 10), [
          'O cofre ficou aberto! Para que ângulo volta a fechadura?', 'Fechado é 0 graus.', 'No A+B, põe o servo para 0.'], 'Cofre fechado!'),
      ],
      sucesso: 'Cofre seguro! A variável conta os toques e a comparação verifica o código.',
      extensao: 'E se, ao fim de 3 códigos errados, o cofre bloqueasse?',
      gambiarra: { xml: G.cofre, pedido: 'Carrego A, A, B e o meu cofre não abre! Será que me enganei no código?' },
    },
  };

  // ------------------------------------------------------------ blocos prontos desta missão (para a caixa)
  const N = (nome, v) => `<value name="${nome}"><shadow type="mk_num"><field name="NUM">${v}</field></shadow></value>`;
  const XML = {
    pp_mudar_pontos: '<block type="mk_var_mudar"><field name="VAR">pontos</field>' + N('V', 1) + '</block>',
    pp_var_pontos: '<block type="mk_var"><field name="VAR">pontos</field></block>',
    pp_mudar_menos: '<block type="mk_var_mudar"><field name="VAR">contador</field>' + N('V', -1) + '</block>',
    pp_registar_saltos: '<block type="mk_registar"><value name="NOME"><shadow type="mk_texto"><field name="TXT">saltos</field></shadow></value>' + N('V', 0) + '</block>',
    pp_registar_modo: '<block type="mk_registar"><value name="NOME"><shadow type="mk_texto"><field name="TXT">modo</field></shadow></value>' + N('V', 0) + '</block>',
    pp_definir_medida: '<block type="mk_var_definir"><field name="VAR">medida</field>' + N('V', 0) + '</block>',
    pp_tempo_menos_medida: '<block type="mk_conta"><field name="OP">-</field><value name="A"><block type="mk_tempo"></block></value><value name="B"><block type="mk_var"><field name="VAR">medida</field></block></value></block>',
    pp_div_1000: '<block type="mk_conta"><field name="OP">/</field>' + N('A', 0) + N('B', 1000) + '</block>',
    pp_comparar_igual: '<block type="mk_comparar"><field name="OP">==</field>' + N('A', 0) + N('B', 0) + '</block>',
  };

  F.registarMissao({
    id: 'primeiros-passos',
    titulo: 'Primeiros passos',
    tema: 'Programação e robótica',
    descricao: 'Do primeiro sorriso do micro:bit até jogos e robôs com variáveis: eventos, sons, sensores, servo e lógica.',
    cor: '#2364ff',
    chave: 'faisca.desafios.v1',     // o progresso que já estava guardado continua a valer
    xml: XML,
    niveis: [
      { nome: 'Nível 1 · Primeiros sinais', desafios: [...D.slice(0, 3), NOME, CANTOS, PISCA, CARTAO, SEMAFORO, EMOCOES, CAIXA, COBRA] },
      { nome: 'Nível 2 · Som e circuitos', desafios: [...D.slice(3, 6), AGUDO, GALO, BANDEIRA, ORQUESTRA, CARRO, GIRASSOL, GUARDA, PASSAGEM] },
      { nome: 'Nível 3 · Robótica e lógica', desafios: [SALTOS, DADO, PONTOS, TEMPORIZADOR, QUENTE, DIARIO, REFLEXOS, VOLTAS, ESTRELA, MODOS, COFRE] },
    ],
    livres: [
      { titulo: 'Projeto livre', missao: 'Agora é contigo: inventa um brinquedo com os blocos do nível 1 — caras, sons, luzes e texto.' },
      { titulo: 'Projeto livre', missao: 'Inventa uma máquina que reage ao mundo: gestos, luz, barulho, frutas e servo.' },
      { titulo: 'Projeto livre', missao: 'Sem limites: tens todos os blocos. Inventa um jogo, um robô ou um aparelho para a tua escola.' },
    ],
  });
})();
