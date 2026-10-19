/* Missão 0 · «O palco do Nico e da Gabi» — programar sem micro:bit, só no ecrã (tipo Scratch).
 *
 * Para quem nunca programou: os atores (Nico e Gabi) falam, andam, mudam de cara e de cenário. Os blocos têm o
 * aspecto do MakeCode Arcade (js/blocos-palco.js), para a passagem para o micro:bit ser natural.
 * Abre numa página própria (palco.html): palco no lugar do micro:bit, sem «Enviar» nem Bluetooth.
 *
 * Nível 1 · Pôr os atores a mexer (sequência) — 6 desafios curtos + 5 projetos de 15–20 min + o projeto livre
 * (gerado pela plataforma). Níveis 2 (repetir e reagir) e 3 (decidir) em preparação.
 *
 * Validação por comportamento: o desafio fica feito quando, depois de ▶ Começar, os atores FAZEM o que se pede
 * (registo do palco: diz:, pos:, ir:, imagem:, cenario:, hora:) — não pela presença dos blocos.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const V = () => F.verifPalco;                       // só existe na página do palco (é lá que os testes correm)
  const S = r => V().saidas(r);

  // ------------------------------------------------------------ leitura do programa (para as pistas)
  const ev = a => a.evento('comecar');
  const blocos = (a, tipo, ator) => (ev(a) ? ev(a).plano : []).filter(p => p.tipo === tipo && (!ator || p.ator === ator));
  const solto = (a, tipo) => a.soltosPlano().some(p => p.tipo === tipo);
  const passosPara = (a, ator, dir) => blocos(a, 'pk_andar', ator).filter(p => p.campos.DIR === dir).reduce((t, p) => t + (Number(p.n) || 0), 0);
  const ir = (a, ator, sitio) => blocos(a, 'pk_ir', ator).some(p => p.campos.SITIO === sitio);
  const imagem = (a, ator, traje) => blocos(a, 'pk_imagem', ator).some(p => !traje || p.campos.TRAJE === traje);
  const cenario = (a, c) => blocos(a, 'pk_cenario').some(p => !c || p.campos.CEN === c);

  // ------------------------------------------------------------ regras que se repetem
  const semComecar = pergunta => ({
    id: 'sem_comecar',
    ativa: a => !ev(a),
    pistas: [
      ['curiosa', pergunta || 'Como é que o palco sabe quando a cena começa? Há um bloco que fica à espera do ▶…'],
      ['dica', 'Procura na coluna branca o bloco verde que diz «ao começar».'],
      ['dica', 'Arrasta «ao começar» para a área cinzenta e encaixa os outros blocos lá dentro.'],
    ],
    corrigido: 'Boa! Agora a cena já sabe quando começar.',
  });
  const fora = (tipo, nome) => ({
    id: 'fora_' + tipo,
    ativa: a => !!ev(a) && blocos(a, tipo).length === 0 && solto(a, tipo),
    pistas: [
      ['a_pensar', `O bloco «${nome}» está sozinho… quando é que ele vai correr?`],
      ['dica', 'Os blocos só correm se estiverem encaixados dentro do «ao começar», como peças de puzzle.'],
      ['dica', `Arrasta «${nome}» para dentro da boca do bloco verde «ao começar».`],
    ],
    corrigido: 'Encaixou! Já fazem parte da cena.',
  });
  const falta = (id, ativa, nome, cor, pergunta, gesto, corrigido) => ({
    id, ativa,
    pistas: [['curiosa', pergunta], ['dica', `Procura o bloco ${cor} «${nome}».`], ['dica', gesto]],
    corrigido: corrigido || 'Isso mesmo!',
  });
  const TESTAR = 'Parece-me bem! Mas só acredito vendo: carrega em ▶ Começar.';

  // ------------------------------------------------------------ XML (gambiarras e testes)
  const t = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const nxt = n => n ? `<next>${n}</next>` : '';
  const X = F.palcoXml = {
    comecar: (corpo = '', x = 40, y = 40) => `<block type="pk_comecar" x="${x}" y="${y}">${corpo ? `<statement name="DO">${corpo}</statement>` : ''}</block>`,
    dizer: (ator, txt, s = 1) => n => `<block type="pk_dizer"><field name="ATOR">${ator}</field><value name="T"><shadow type="mk_texto"><field name="TXT">${t(txt)}</field></shadow></value><value name="S"><shadow type="pk_segundos"><field name="V">${s}</field></shadow></value>${nxt(n)}</block>`,
    andar: (ator, passos, dir = 'direita') => n => `<block type="pk_andar"><field name="ATOR">${ator}</field><field name="DIR">${dir}</field><value name="N"><shadow type="mk_num"><field name="NUM">${passos}</field></shadow></value>${nxt(n)}</block>`,
    ir: (ator, sitio) => n => `<block type="pk_ir"><field name="ATOR">${ator}</field><field name="SITIO">${sitio}</field>${nxt(n)}</block>`,
    imagem: (ator, traje) => n => `<block type="pk_imagem"><field name="ATOR">${ator}</field><field name="TRAJE">${traje}</field>${nxt(n)}</block>`,
    cenario: c => n => `<block type="pk_cenario"><field name="CEN">${c}</field>${nxt(n)}</block>`,
    hora: h => n => `<block type="pk_hora"><field name="HORA">${h}</field>${nxt(n)}</block>`,
    pausa: (ms = 1000) => n => `<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">${ms}</field></shadow></value>${nxt(n)}</block>`,
    // seq(a, b, c) encadeia os blocos: a → b → c
    seq: (...bs) => bs.reduceRight((n, b) => b(n), ''),
    // programa completo: <xml> + «ao começar» com a sequência + blocos soltos (opcional)
    prog: (bs, soltos = '') => `<xml>${X.comecar(X.seq(...bs))}${soltos}</xml>`,
  };
  const soltoEm = (xmlBloco, x = 320, y = 200) => xmlBloco.replace(/^<block /, `<block x="${x}" y="${y}" `);

  // ------------------------------------------------------------ cenas iniciais de cada desafio
  const RUA = { cenario: 'rua', atores: { nico: { x: 110 }, gabi: { x: 210 } } };

  // ------------------------------------------------------------ nível 1 · desafios curtos
  const OLA = {
    titulo: 'Olá, palco!',
    missao: 'Põe o Nico a dizer «Olá!» quando carregas em ▶ Começar.',
    passos: ['Arrasta o bloco verde «ao começar».', 'Encaixa lá dentro «Nico dizer Olá!».', 'Carrega em ▶ Começar.'],
    material: 'só o computador',
    novos: ['pk_comecar', 'pk_dizer'],
    palco: RUA,
    ok: r => V().falas(S(r), 'nico').length > 0,
    tutor: {
      boasVindas: ['boas_vindas', { nico: '{ola} Hoje não há micro:bit: o palco é nosso! Põe-me a dizer olá.', _: '{ola} Hoje não há micro:bit: o palco é nosso! Põe o Nico a dizer olá.' }],
      parecePronto: a => blocos(a, 'pk_dizer', 'nico').length > 0,
      testar: TESTAR,
      regras: [
        semComecar(),
        fora('pk_dizer', 'dizer'),
        falta('sem_dizer', a => blocos(a, 'pk_dizer').length === 0, 'Nico dizer', 'azul', 'A cena já começa… mas ninguém fala! Que bloco põe um ator a falar?', 'Encaixa «Nico dizer Olá!» dentro de «ao começar».'),
        falta('ator_errado', a => blocos(a, 'pk_dizer', 'nico').length === 0, 'Nico dizer', 'azul', 'Quem está a falar? A missão pede o Nico.', 'Carrega na setinha ao lado do nome e escolhe «Nico».', 'Agora é o Nico que fala!'),
      ],
      sucesso: { nico: 'Olá, olá! Primeira fala no palco!', _: 'O Nico falou! Primeira fala no palco.' },
      extensao: 'Muda o texto: o que é que o Nico diria a quem chega ao Buinho?',
      gambiarra: {
        xml: `<xml>${X.comecar()}${soltoEm(X.dizer('nico', 'Olá!')(''))}</xml>`,
        pedido: 'Fiz uma gambiarra… carrego no ▶ e ninguém fala! Consegues descobrir o que me esqueci?',
      },
    },
  };

  const RUA_GABI = { cenario: 'rua', atores: { gabi: { x: 60 }, nico: { x: 430, esquerda: true } } };
  const ATRAVESSA = {
    titulo: 'A Gabi atravessa a rua',
    missao: 'O Nico está do outro lado da rua. Faz a Gabi atravessar até ele.',
    passos: ['Encaixa «Gabi andar 10 passos para a direita».', 'Muda o número de passos.', 'Carrega em ▶ e vê até onde ela chega.'],
    material: 'só o computador',
    novos: ['pk_andar'],
    palco: RUA_GABI,
    ok: r => (V().ultimaPos(S(r), 'gabi') || 0) >= 330,
    tutor: {
      boasVindas: ['boas_vindas', { gabi: 'Estou deste lado da rua e o Nico está do outro. Ajudas-me a atravessar?', _: 'A Gabi quer vir ter comigo, ao outro lado da rua. Ajudas-a a atravessar?' }],
      parecePronto: a => passosPara(a, 'gabi', 'direita') >= 270,
      testar: TESTAR,
      regras: [
        semComecar(),
        fora('pk_andar', 'andar'),
        falta('sem_andar', a => blocos(a, 'pk_andar').length === 0, 'andar … passos', 'azul', 'A Gabi está parada. Que bloco faz um ator andar?', 'Encaixa «Gabi andar 10 passos para a direita» dentro de «ao começar».'),
        falta('anda_outro', a => blocos(a, 'pk_andar', 'gabi').length === 0, 'Gabi andar', 'azul', 'Quem está a andar? Quem precisa de atravessar é a Gabi.', 'No bloco «andar», escolhe «Gabi» na setinha.', 'Isso, agora é a Gabi que anda!'),
        falta('para_esquerda', a => passosPara(a, 'gabi', 'direita') === 0 && passosPara(a, 'gabi', 'esquerda') > 0, 'andar … para a direita', 'azul', 'Para que lado fica o Nico? E para que lado está a Gabi a andar?', 'No fim do bloco «andar», escolhe «direita».', 'Agora vai para o lado certo!'),
        {
          id: 'poucos_passos',
          ativa: a => passosPara(a, 'gabi', 'direita') < 270,
          pistas: [
            ['a_pensar', 'A Gabi mexeu-se… mas só um bocadinho! O palco tem 480 passos de largura. Quantos faltam?'],
            ['dica', 'Muda o número no bloco «andar»: 10 passos é muito pouco para atravessar a rua.'],
            ['dica', 'Escreve 300 no lugar do 10 e experimenta.'],
          ],
          corrigido: 'Agora sim, isso já dá para atravessar!',
        },
      ],
      sucesso: { gabi: 'Atravessei! Olá, Nico!', _: 'A Gabi atravessou a rua! Os números mudam o que o bloco faz.' },
      extensao: 'Faz a Gabi atravessar e depois voltar para trás (para a esquerda).',
      gambiarra: {
        xml: X.prog([X.andar('gabi', 10)]),
        pedido: 'Fiz uma gambiarra… a Gabi dá um passinho e fica no meio da rua! O que é que está mal?',
      },
    },
  };

  const PORTA = {
    titulo: 'Até à porta do FabLab',
    missao: 'O Nico vai ao FabLab do Buinho. Leva-o até à porta laranja, sem contares passos.',
    passos: ['Usa o bloco «Nico ir até a porta».', 'Encaixa-o dentro de «ao começar».', 'Carrega em ▶ Começar.'],
    material: 'só o computador',
    novos: ['pk_ir'],
    palco: { cenario: 'rua', atores: { nico: { x: 60 }, gabi: { x: 160 } } },
    ok: r => S(r).includes('ir:nico:porta') || ((V().ultimaPos(S(r), 'nico') || 0) >= 362 && (V().ultimaPos(S(r), 'nico') || 0) <= 422),
    tutor: {
      boasVindas: ['boas_vindas', { nico: 'Quero ir ao FabLab! Há um bloco que me leva direitinho à porta, sem contar passos.', _: 'O Nico quer ir ao FabLab. Há um bloco que o leva direitinho à porta, sem contar passos.' }],
      parecePronto: a => ir(a, 'nico', 'porta'),
      testar: TESTAR,
      regras: [
        semComecar(),
        fora('pk_ir', 'ir até'),
        falta('sem_ir', a => blocos(a, 'pk_ir').length === 0 && passosPara(a, 'nico', 'direita') < 290, 'ir até', 'azul', 'Contar passos dá trabalho… Há um bloco que leva o ator a um sítio do cenário. Qual será?', 'Encaixa «Nico ir até a porta» dentro de «ao começar».'),
        falta('ir_outro', a => blocos(a, 'pk_ir').length > 0 && blocos(a, 'pk_ir', 'nico').length === 0, 'Nico ir até', 'azul', 'Quem está a ir? Quem vai ao FabLab é o Nico.', 'No bloco «ir até», escolhe «Nico» na primeira setinha.', 'Isso!'),
        falta('sitio_errado', a => blocos(a, 'pk_ir', 'nico').length > 0 && !ir(a, 'nico', 'porta'), 'ir até a porta', 'azul', 'Para onde está o Nico a ir? A porta laranja é a do FabLab.', 'Na segunda setinha do bloco «ir até», escolhe «a porta».', 'Agora vai à porta certa!'),
      ],
      sucesso: { nico: 'Cheguei à porta do FabLab! Toc, toc!', _: 'O Nico chegou à porta do FabLab!' },
      extensao: 'Leva também a Gabi até à porta, a seguir ao Nico.',
      gambiarra: {
        xml: X.prog([X.ir('nico', 'meio')]),
        pedido: 'Fiz uma gambiarra… fiquei a meio da rua, longe da porta! Consegues ver o que escolhi mal?',
      },
    },
  };

  const CONVERSA = {
    titulo: 'Conversa a dois',
    missao: 'O Nico pergunta «Vamos ao FabLab?». A Gabi pensa um bocadinho e só depois responde «Bora!».',
    passos: ['Primeiro a fala do Nico.', 'Depois uma «pausa (ms)».', 'No fim a fala da Gabi. Carrega em ▶.'],
    material: 'só o computador',
    novos: ['pk_dizer_gabi', 'mk_pausa'],
    palco: RUA,
    ok: r => V().ordem(S(r), ['diz:nico:', 'pausa', 'diz:gabi:']),
    tutor: {
      boasVindas: ['boas_vindas', 'Agora uma conversa! Numa conversa, a ordem conta: primeiro um fala, depois o outro.'],
      parecePronto: a => { const p = ev(a) ? ev(a).plano.map(x => x.tipo === 'pk_dizer' ? 'd:' + x.ator : x.tipo) : []; const i = p.indexOf('d:nico'), j = p.indexOf('mk_pausa', i), k = p.indexOf('d:gabi', j); return i >= 0 && j > i && k > j; },
      testar: TESTAR,
      regras: [
        semComecar(),
        fora('pk_dizer', 'dizer'),
        falta('falta_nico', a => blocos(a, 'pk_dizer', 'nico').length === 0, 'Nico dizer', 'azul', 'Quem começa a conversa? Falta alguém a perguntar…', 'Encaixa «Nico dizer» e escreve «Vamos ao FabLab?».'),
        falta('falta_gabi', a => blocos(a, 'pk_dizer', 'gabi').length === 0, 'Gabi dizer', 'azul', 'O Nico pergunta… e quem responde?', 'Encaixa «Gabi dizer» por baixo e escreve «Bora!».'),
        {
          id: 'ordem_trocada',
          ativa: a => { const p = ev(a).plano.filter(x => x.tipo === 'pk_dizer'); return p.length > 0 && p[0].ator === 'gabi'; },
          pistas: [
            ['surpreendida', 'A Gabi responde antes de o Nico perguntar? Os blocos correm de cima para baixo.'],
            ['dica', 'O bloco que fica mais acima é o primeiro a acontecer.'],
            ['dica', 'Arrasta a fala do Nico para cima da fala da Gabi.'],
          ],
          corrigido: 'Agora a conversa está pela ordem certa!',
        },
        falta('sem_pausa', a => blocos(a, 'mk_pausa').length === 0, 'pausa (ms)', 'azul-claro', 'A Gabi responde logo… Como é que a pomos a pensar um bocadinho antes?', 'Põe uma «pausa (ms)» entre a fala do Nico e a fala da Gabi.', 'Com a pausa, até parece que ela está a pensar!'),
      ],
      sucesso: 'Uma conversa a sério: pergunta, pausa, resposta!',
      extensao: 'Acrescenta uma terceira fala: o que diz o Nico depois do «Bora!»?',
      gambiarra: {
        xml: X.prog([X.dizer('gabi', 'Bora!'), X.pausa(1000), X.dizer('nico', 'Vamos ao FabLab?')]),
        pedido: 'Fiz uma gambiarra… a conversa ficou toda trocada! Consegues pô-la por ordem?',
      },
    },
  };

  const FESTA = {
    titulo: 'Cara de festa',
    missao: 'O Nico diz «Consegui!» e muda a imagem para «festa».',
    passos: ['Uma fala do Nico.', 'Depois «Nico mudar imagem para festa».', 'Carrega em ▶ Começar.'],
    material: 'só o computador',
    novos: ['pk_imagem'],
    palco: RUA,
    ok: r => V().ordem(S(r), ['diz:nico:', 'imagem:nico:festa']) || V().ordem(S(r), ['imagem:nico:festa', 'diz:nico:']),
    tutor: {
      boasVindas: ['boas_vindas', { nico: 'Sabias que posso mudar de cara? Tenho oito! Hoje quero a cara de festa.', _: 'Sabias que o Nico pode mudar de cara? Tem oito! Hoje queremos a cara de festa.' }],
      parecePronto: a => imagem(a, 'nico', 'festa') && blocos(a, 'pk_dizer', 'nico').length > 0,
      testar: TESTAR,
      regras: [
        semComecar(),
        fora('pk_imagem', 'mudar imagem'),
        falta('sem_imagem', a => blocos(a, 'pk_imagem').length === 0, 'mudar imagem para', 'azul', 'O Nico fala, mas a cara não muda. Que bloco troca a imagem de um ator?', 'Encaixa «Nico mudar imagem para festa».'),
        falta('imagem_outro', a => blocos(a, 'pk_imagem', 'nico').length === 0, 'Nico mudar imagem', 'azul', 'De quem é a cara que está a mudar?', 'Na primeira setinha do bloco, escolhe «Nico».', 'Isso!'),
        falta('traje_errado', a => !imagem(a, 'nico', 'festa'), 'mudar imagem para festa', 'azul', 'Essa cara é de festa? Experimenta as outras opções da setinha.', 'Na setinha do fim do bloco, escolhe «festa».', 'Agora sim, cara de festa!'),
        falta('sem_fala', a => blocos(a, 'pk_dizer', 'nico').length === 0, 'Nico dizer', 'azul', 'A cara já muda. E o que é que o Nico diz?', 'Encaixa «Nico dizer» e escreve «Consegui!».'),
      ],
      sucesso: { nico: 'Consegui! Esta é a minha cara de festa.', _: 'Cara de festa! Agora o Nico mostra o que sente.' },
      extensao: 'Muda a cara do Nico duas vezes: primeiro «a pensar», depois «ideia».',
      gambiarra: {
        xml: X.prog([X.dizer('nico', 'Consegui!'), X.imagem('gabi', 'festa')]),
        pedido: 'Fiz uma gambiarra… eu disse «Consegui!» mas quem ficou em festa foi outra pessoa! O que se passou?',
      },
    },
  };

  const ENTRAR = {
    titulo: 'Para dentro do FabLab',
    missao: 'O Nico vai até à porta e entra: o cenário muda para o FabLab do Buinho.',
    passos: ['«Nico ir até a porta».', 'Depois «mudar cenário para FabLab do Buinho».', 'Carrega em ▶ Começar.'],
    material: 'só o computador',
    novos: ['pk_cenario'],
    palco: { cenario: 'rua', atores: { nico: { x: 60 }, gabi: { x: 160 } } },
    ok: r => V().ordem(S(r), ['ir:nico:porta', 'cenario:fablab']),
    tutor: {
      boasVindas: ['boas_vindas', 'O cenário também se programa! Quando o Nico chega à porta, mudamos para dentro do FabLab.'],
      parecePronto: a => ir(a, 'nico', 'porta') && cenario(a, 'fablab'),
      testar: TESTAR,
      regras: [
        semComecar(),
        fora('pk_cenario', 'mudar cenário'),
        falta('sem_ir', a => !ir(a, 'nico', 'porta'), 'Nico ir até a porta', 'azul', 'Antes de entrar no FabLab, onde é que o Nico tem de ir?', 'Encaixa «Nico ir até a porta» dentro de «ao começar».'),
        falta('sem_cenario', a => blocos(a, 'pk_cenario').length === 0, 'mudar cenário para', 'cinzento-azulado', 'O Nico chegou à porta… e agora, como é que entramos? Que bloco troca o fundo?', 'Encaixa «mudar cenário para» por baixo do «ir até».'),
        falta('cenario_errado', a => !cenario(a, 'fablab'), 'mudar cenário para FabLab do Buinho', 'cinzento-azulado', 'Esse cenário é o FabLab? Vê as opções da setinha.', 'Escolhe «FabLab do Buinho» na setinha do bloco.', 'Isso, é este o FabLab!'),
        {
          id: 'entra_antes',
          ativa: a => { const p = ev(a).plano.map(x => x.tipo); return p.indexOf('pk_cenario') >= 0 && p.indexOf('pk_cenario') < p.indexOf('pk_ir'); },
          pistas: [
            ['surpreendida', 'O cenário muda antes de o Nico chegar à porta. Ele atravessou a parede?'],
            ['dica', 'Os blocos correm de cima para baixo: o que está em cima acontece primeiro.'],
            ['dica', 'Põe o «mudar cenário» por baixo do «Nico ir até a porta».'],
          ],
          corrigido: 'Agora entra pela porta, como deve ser!',
        },
      ],
      sucesso: 'Bem-vindo ao FabLab do Buinho! O cenário também é programa.',
      extensao: 'Já lá dentro, o Nico diz o que vê no FabLab.',
      gambiarra: {
        xml: X.prog([X.cenario('fablab'), X.ir('nico', 'porta')]),
        pedido: 'Fiz uma gambiarra… entrei no FabLab antes de chegar à porta! Consegues pôr isto direito?',
      },
    },
  };

  // ------------------------------------------------------------ nível 1 · projetos (15–20 min)
  const APRESENTACAO = {
    titulo: 'Apresentação',
    missao: 'No palco, cada um apresenta-se: diz o nome e muda de cara.',
    passos: ['O Nico diz quem é e muda de imagem.', 'A Gabi faz o mesmo.', 'Escolhe as caras que combinam com o que dizem.'],
    material: 'só o computador',
    novos: [],
    palco: { cenario: 'palco', atores: { nico: { x: 150 }, gabi: { x: 330, esquerda: true } } },
    ok: r => { const s = S(r); return V().falas(s, 'nico').length > 0 && V().falas(s, 'gabi').length > 0 && s.some(v => v.startsWith('imagem:nico:')) && s.some(v => v.startsWith('imagem:gabi:')); },
    tutor: {
      boasVindas: ['boas_vindas', 'Luzes, palco! Cada um apresenta-se ao público: diz o nome e mostra uma cara.'],
      parecePronto: a => blocos(a, 'pk_dizer', 'nico').length && blocos(a, 'pk_dizer', 'gabi').length && imagem(a, 'nico') && imagem(a, 'gabi'),
      testar: TESTAR,
      regras: [
        semComecar(),
        falta('falta_fala_nico', a => blocos(a, 'pk_dizer', 'nico').length === 0, 'Nico dizer', 'azul', 'O público quer saber quem é o primeiro ator. Quem se apresenta?', 'Encaixa «Nico dizer» com o nome dele.'),
        falta('falta_fala_gabi', a => blocos(a, 'pk_dizer', 'gabi').length === 0, 'Gabi dizer', 'azul', 'E a Gabi? Ela também quer apresentar-se!', 'Encaixa «Gabi dizer» com o nome dela.'),
        falta('falta_imagem_nico', a => !imagem(a, 'nico'), 'Nico mudar imagem', 'azul', 'O Nico já falou. Que cara faz ele quando se apresenta?', 'Encaixa «Nico mudar imagem para» e escolhe uma cara.'),
        falta('falta_imagem_gabi', a => !imagem(a, 'gabi'), 'Gabi mudar imagem', 'azul', 'E a cara da Gabi, muda quando ela se apresenta?', 'Encaixa «mudar imagem para» e escolhe «Gabi» na primeira setinha.'),
      ],
      sucesso: 'Que apresentação! Os dois atores já se conhecem.',
      extensao: 'Faz um dos atores andar até ao meio do palco antes de se apresentar.',
      gambiarra: {
        xml: X.prog([X.dizer('nico', 'Sou o Nico!'), X.imagem('nico', 'festa'), X.dizer('nico', 'Sou a Gabi!')]),
        pedido: 'Fiz uma gambiarra… a Gabi não disse nada e eu disse o nome dela! Ajudas-me a arranjar isto?',
      },
    },
  };

  const PASSEIO = {
    titulo: 'Passeio por Messejana',
    missao: 'Um passeio em duas partes: anda pela rua, muda para o montado e anda outra vez. No fim, alguém diz o que vê.',
    passos: ['Na rua: um ator anda.', 'Muda o cenário para o Montado.', 'Anda outra vez e diz o que vê.'],
    material: 'só o computador',
    novos: [],
    palco: { cenario: 'rua', atores: { nico: { x: 60 }, gabi: { x: 140 } } },
    ok: r => { const s = S(r); return V().ordem(s, ['pos:', 'cenario:montado', 'pos:']) && V().falas(s).length > 0; },
    tutor: {
      boasVindas: ['boas_vindas', 'Vamos passear! Da rua de Messejana até ao montado, onde estão os sobreiros.'],
      parecePronto: a => { const p = ev(a) ? ev(a).plano.map(x => x.tipo) : []; const c = p.findIndex((x, i) => x === 'pk_cenario' && ev(a).plano[i].campos.CEN === 'montado'); const anda = x => x === 'pk_andar' || x === 'pk_ir'; return c > 0 && p.slice(0, c).some(anda) && p.slice(c).some(anda) && p.includes('pk_dizer'); },
      testar: TESTAR,
      regras: [
        semComecar(),
        falta('sem_montado', a => !cenario(a, 'montado'), 'mudar cenário para Montado', 'cinzento-azulado', 'O passeio vai da rua até ao montado. Como é que mudamos de sítio?', 'Encaixa «mudar cenário para» e escolhe «Montado».'),
        {
          id: 'anda_antes',
          ativa: a => { const p = ev(a).plano; const c = p.findIndex(x => x.tipo === 'pk_cenario'); return !p.slice(0, c).some(x => x.tipo === 'pk_andar' || x.tipo === 'pk_ir'); },
          pistas: [
            ['curiosa', 'Ainda na rua, alguém já devia ir a andar. O que acontece antes de mudar o cenário?'],
            ['dica', 'Põe um bloco «andar» (ou «ir até») por cima do «mudar cenário».'],
            ['dica', 'Encaixa «Nico andar 200 passos para a direita» antes do «mudar cenário para Montado».'],
          ],
          corrigido: 'Isso, primeiro passeia-se pela rua!',
        },
        {
          id: 'anda_depois',
          ativa: a => { const p = ev(a).plano; const c = p.findIndex(x => x.tipo === 'pk_cenario'); return !p.slice(c + 1).some(x => x.tipo === 'pk_andar' || x.tipo === 'pk_ir'); },
          pistas: [
            ['curiosa', 'Já estamos no montado… e ninguém se mexe? O passeio continua!'],
            ['dica', 'Depois do «mudar cenário», põe outra vez um bloco para andar.'],
            ['dica', 'Encaixa um «andar» ou «ir até» por baixo do «mudar cenário para Montado».'],
          ],
          corrigido: 'Agora o passeio continua no montado!',
        },
        falta('sem_fala', a => blocos(a, 'pk_dizer').length === 0, 'dizer', 'azul', 'O que é que se vê no montado? Alguém podia dizer…', 'Encaixa um «dizer» no fim, por exemplo «Olha os sobreiros!».'),
      ],
      sucesso: 'Que passeio! Rua, montado e uma fala no fim.',
      extensao: 'Acaba o passeio na Horta, com a Gabi a dizer o que lá está a crescer.',
      gambiarra: {
        xml: X.prog([X.andar('nico', 200), X.cenario('montado'), X.dizer('nico', 'Olha os sobreiros!')]),
        pedido: 'Fiz uma gambiarra… cheguei ao montado e fiquei parado como um sobreiro! O que falta?',
      },
    },
  };

  const BOLA = {
    titulo: 'Onde está a bola?',
    missao: 'A bola fugiu para a horta! O Nico vai até à bola e diz «Encontrei!».',
    passos: ['«Nico ir até a bola».', 'Depois uma fala do Nico.', 'Carrega em ▶ Começar.'],
    material: 'só o computador',
    novos: [],
    palco: { cenario: 'horta', atores: { nico: { x: 60 }, gabi: { x: 150 } }, objetos: { bola: { x: 420 } } },
    ok: r => V().ordem(S(r), ['ir:nico:bola', 'diz:nico:']),
    tutor: {
      boasVindas: ['boas_vindas', { nico: 'A minha bola fugiu para a horta! Sabes onde está? Leva-me até lá.', _: 'A bola do Nico fugiu para a horta! Leva-o até lá.' }],
      parecePronto: a => ir(a, 'nico', 'bola') && blocos(a, 'pk_dizer', 'nico').length > 0,
      testar: TESTAR,
      regras: [
        semComecar(),
        falta('sem_ir_bola', a => !ir(a, 'nico', 'bola'), 'Nico ir até a bola', 'azul', 'Onde está a bola? Há um bloco que leva o ator até um objeto…', 'No bloco «ir até», escolhe «Nico» e «a bola».'),
        falta('sem_fala', a => blocos(a, 'pk_dizer', 'nico').length === 0, 'Nico dizer', 'azul', 'O Nico chegou à bola. Como é que ele avisa?', 'Encaixa «Nico dizer Encontrei!» por baixo do «ir até».'),
        {
          id: 'fala_antes',
          ativa: a => { const p = ev(a).plano; const i = p.findIndex(x => x.tipo === 'pk_ir' && x.campos.SITIO === 'bola'); return !p.slice(i + 1).some(x => x.tipo === 'pk_dizer' && x.ator === 'nico'); },
          pistas: [
            ['surpreendida', 'O Nico diz «Encontrei!» antes de chegar à bola? Que adivinho!'],
            ['dica', 'O que está em cima acontece primeiro.'],
            ['dica', 'Põe a fala do Nico por baixo do «Nico ir até a bola».'],
          ],
          corrigido: 'Agora só diz depois de encontrar!',
        },
      ],
      sucesso: { nico: 'Encontrei! Obrigado, detetive!', _: 'Encontrada! O Nico já tem a bola.' },
      extensao: 'Depois de o Nico encontrar a bola, a Gabi vai também até lá e diz «Boa!».',
      gambiarra: {
        xml: X.prog([X.dizer('nico', 'Encontrei!'), X.ir('nico', 'bola')]),
        pedido: 'Fiz uma gambiarra… gritei «Encontrei!» e só depois fui procurar! Consegues arrumar isto?',
      },
    },
  };

  const TEATRO = {
    titulo: 'Teatro de três falas',
    missao: 'Inventa um pequeno teatro: pelo menos três falas, em que o Nico e a Gabi falam à vez.',
    passos: ['Escolhe o cenário (pode ser o Palco).', 'Três falas ou mais, à vez.', 'Usa pausas e caras para dar vida à cena.'],
    material: 'só o computador',
    novos: [],
    palco: { cenario: 'palco', atores: { nico: { x: 150 }, gabi: { x: 330, esquerda: true } } },
    ok: r => { const f = V().falas(S(r)); let trocas = 0; for (let i = 1; i < f.length; i++) if (f[i].ator !== f[i - 1].ator) trocas++; return f.length >= 3 && trocas >= 2; },
    tutor: {
      boasVindas: ['boas_vindas', 'Agora és tu que escreves o teatro! Três falas, pelo menos, e os dois atores falam à vez.'],
      parecePronto: a => { const f = blocos(a, 'pk_dizer'); let trocas = 0; for (let i = 1; i < f.length; i++) if (f[i].ator !== f[i - 1].ator) trocas++; return f.length >= 3 && trocas >= 2; },
      testar: TESTAR,
      regras: [
        semComecar(),
        {
          id: 'poucas_falas',
          ativa: a => blocos(a, 'pk_dizer').length < 3,
          pistas: [
            ['curiosa', 'Quantas falas tem a tua peça? Para ser teatro precisa de pelo menos três.'],
            ['dica', 'Junta mais blocos «dizer», uns por baixo dos outros.'],
            ['dica', 'Põe três «dizer»: Nico, depois Gabi, depois Nico outra vez.'],
          ],
          corrigido: 'Já há falas para uma peça!',
        },
        {
          id: 'sem_vez',
          ativa: a => { const f = blocos(a, 'pk_dizer'); let trocas = 0; for (let i = 1; i < f.length; i++) if (f[i].ator !== f[i - 1].ator) trocas++; return trocas < 2; },
          pistas: [
            ['a_pensar', 'Numa conversa fala-se à vez. Quem fala a seguir a quem, na tua peça?'],
            ['dica', 'Muda o nome nalgumas falas para que o Nico e a Gabi alternem.'],
            ['dica', 'Arruma assim: Nico, Gabi, Nico (ou Gabi, Nico, Gabi).'],
          ],
          corrigido: 'Agora falam à vez, como num teatro!',
        },
      ],
      sucesso: 'Bravo! Uma peça inteira escrita por ti. 👏',
      extensao: 'Acrescenta uma mudança de cenário a meio da peça (segundo ato!).',
      gambiarra: {
        xml: X.prog([X.dizer('nico', 'Olá, Gabi!'), X.dizer('nico', 'Estás boa?'), X.dizer('nico', 'Adeus!')]),
        pedido: 'Fiz uma gambiarra… escrevi uma peça em que só eu é que falo! Ajudas-me a pôr a Gabi a conversar?',
      },
    },
  };

  const NOITE = {
    titulo: 'Boa noite, Messejana',
    missao: 'Ao fim do dia, alguém diz que está a escurecer, fica de noite e a Gabi diz «Boa noite!».',
    passos: ['Uma fala sobre o fim do dia.', '«mudar para a noite».', 'A Gabi diz «Boa noite!» (e muda para a cara calma).'],
    material: 'só o computador',
    novos: ['pk_hora'],
    palco: { cenario: 'rua', atores: { nico: { x: 120 }, gabi: { x: 250 } } },
    ok: r => V().ordem(S(r), ['diz:', 'hora:noite', 'diz:gabi:']),
    tutor: {
      boasVindas: ['boas_vindas', 'O dia em Messejana está a acabar. Vamos fazer anoitecer no palco?'],
      parecePronto: a => { const p = ev(a) ? ev(a).plano : []; const h = p.findIndex(x => x.tipo === 'pk_hora' && x.campos.HORA === 'noite'); return h > 0 && p.slice(0, h).some(x => x.tipo === 'pk_dizer') && p.slice(h).some(x => x.tipo === 'pk_dizer' && x.ator === 'gabi'); },
      testar: TESTAR,
      regras: [
        semComecar(),
        falta('sem_noite', a => !blocos(a, 'pk_hora').some(p => p.campos.HORA === 'noite'), 'mudar para a noite', 'cinzento-azulado', 'Como é que fazemos o céu escurecer? Procura um bloco da cor do cenário…', 'Encaixa «mudar para a noite».'),
        {
          id: 'sem_fala_antes',
          ativa: a => { const p = ev(a).plano; const h = p.findIndex(x => x.tipo === 'pk_hora'); return !p.slice(0, h).some(x => x.tipo === 'pk_dizer'); },
          pistas: [
            ['curiosa', 'Antes de escurecer, alguém repara que o dia está a acabar. Quem diz?'],
            ['dica', 'Põe uma fala por cima do «mudar para a noite».'],
            ['dica', 'Encaixa «Nico dizer Está a escurecer…» antes do «mudar para a noite».'],
          ],
          corrigido: 'Isso, primeiro alguém repara!',
        },
        {
          id: 'sem_boa_noite',
          ativa: a => { const p = ev(a).plano; const h = p.findIndex(x => x.tipo === 'pk_hora'); return !p.slice(h + 1).some(x => x.tipo === 'pk_dizer' && x.ator === 'gabi'); },
          pistas: [
            ['curiosa', 'Já é de noite… e a Gabi? O que é que ela diz?'],
            ['dica', 'Depois do «mudar para a noite», põe uma fala da Gabi.'],
            ['dica', 'Encaixa «Gabi dizer Boa noite!» por baixo do «mudar para a noite».'],
          ],
          corrigido: 'Boa noite para ti também!',
        },
      ],
      sucesso: 'Boa noite, Messejana! Fizeste o dia acabar.',
      extensao: 'Depois da noite, faz amanhecer outra vez («mudar para o dia») e o Nico diz «Bom dia!».',
      gambiarra: {
        xml: X.prog([X.dizer('nico', 'Está a escurecer…'), X.dizer('gabi', 'Boa noite!'), X.hora('noite')]),
        pedido: 'Fiz uma gambiarra… disse «Boa noite!» ainda de dia! Consegues trocar isto?',
      },
    },
  };

  // ------------------------------------------------------------ a missão
  F.registarMissao({
    id: 'palco',
    pagina: 'palco.html',              // abre no palco (sem micro:bit)
    titulo: 'O palco do Nico e da Gabi',
    tema: 'Missão 0 · sem micro:bit',
    descricao: 'Para começar do zero: pôr os atores a falar, andar, mudar de cara e de cenário — só no ecrã, como no Scratch.',
    cor: '#4b7bec',
    emPreparacao: 'níveis 2 e 3 em preparação',
    xml: F.XML_PALCO || {},            // blocos do palco (js/blocos-palco.js; só carregado em palco.html)
    comunsProprios: true,
    comuns: [
      {
        id: 'blocos_soltos',
        ativa: a => a.soltos.length > 0,
        pistas: [
          ['a_pensar', 'Tens blocos soltos na área cinzenta. Como é que eles sabem quando começar?'],
          ['dica', 'Os blocos só correm dentro do bloco verde «ao começar».'],
          ['dica', 'Arrasta os blocos soltos para dentro do «ao começar».'],
        ],
        corrigido: 'Isso! Agora já sabem quando começar.',
      },
    ],
    gerais: {
      testeFalhou: ['a_pensar', 'Hmm… ainda não é bem isso. Olha para o palco: o que é que os atores fizeram?'],
      fimMissao: ['celebrar', 'Nível cumprido! Já sabes pôr uma cena a andar. Quando quiseres, passamos para o micro:bit.'],
    },
    todosBlocos: F.TODOS_PALCO || [],
    livrePassos: ['Escolhe um cenário e os atores.', 'Põe-nos a falar, andar e mudar de cara.', 'Carrega em ▶ e mostra a tua cena à turma.'],
    niveis: [
      { nome: 'Nível 1 · Pôr os atores a mexer', desafios: [OLA, ATRAVESSA, PORTA, CONVERSA, FESTA, ENTRAR, APRESENTACAO, PASSEIO, BOLA, TEATRO, NOITE] },
    ],
    livres: [
      { titulo: 'A minha primeira cena', missao: 'Agora é contigo: inventa uma cena tua, com os blocos do nível 1.', boasVindas: 'Projeto livre! Escolhe o cenário, os atores e a história. Eu fico na plateia.' },
    ],
  });
})();
