/* Missão «Matemática» — contar, medir, padrões.
 *
 * Números, operações, padrões, coordenadas, medida e acaso (1.º/2.º ciclo), com o micro:bit como
 * contador, dado, cronómetro e quadro de luzes. Três níveis:
 *   1 · Números         — mostrar, contar para cima e para baixo, acaso, dois contadores
 *   2 · Contas e padrões — tabuada, dobro, par/ímpar, coordenadas, soma, probabilidade
 *   3 · Jogos de números — fração em barra, metas, cronómetro, potências, máximo, adivinha
 * Cada nível: 11 desafios (1–6 curtos; 7–11 projetos de 15–20 minutos) + projeto livre (gerado pelo motor).
 * Textos para qualquer mascote: {ola}, [o|a], ou { nico: '…', gabi: '…', _: '…' }.
 * A validação é sempre pelo comportamento (o que aparece no ecrã depois de cada botão/gesto).
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const P = F.pistas;
  const { tem, blocos, dentro } = F.ajudasTutor;
  const { causou } = F.verif;

  // ------------------------------------------------------------ XML (caixa e gambiarras)
  const N = (nome, v) => `<value name="${nome}"><shadow type="mk_num"><field name="NUM">${v}</field></shadow></value>`;
  const V = (nome, inner) => `<value name="${nome}">${inner}</value>`;
  const vr = k => `<block type="mk_var"><field name="VAR">${k}</field></block>`;
  const conta = (a, op, b) => `<block type="mk_conta"><field name="OP">${op}</field>${a}${b}</block>`;
  const cmp = (op, a, b) => `<block type="mk_comparar"><field name="OP">${op}</field>${a}${b}</block>`;
  const acaso = (a, b) => `<block type="mk_aleatorio">${N('A', a)}${N('B', b)}</block>`;
  const I = (tipo, interior = '') => [`<block type="${tipo}">${interior}`, '</block>'];
  const seq = (...ins) => { ins = ins.filter(Boolean); if (!ins.length) return ''; const r = seq(...ins.slice(1)); return ins[0][0] + (r ? `<next>${r}</next>` : '') + ins[0][1]; };
  let yy = 0;
  const ev = (tipo, campos, corpo) => { yy += 170; return `<block type="${tipo}" x="40" y="${yy}">${campos}<statement name="DO">${corpo}</statement></block>`; };
  const prog = (...bs) => { const x = '<xml>' + bs.join('') + '</xml>'; yy = 0; return x; };
  const BA = c => ev('mk_botao', '', c), BB = c => ev('mk_botao', '<field name="B">B</field>', c);
  const BAB = c => ev('mk_botao', '<field name="B">AB</field>', c), AG = c => ev('mk_agitar', '', c), INI = c => ev('mk_iniciar', '', c);
  const numero = inner => I('mk_mostrar_numero', V('N', inner));
  const numeroN = n => I('mk_mostrar_numero', N('N', n));
  const definir = (k, inner) => I('mk_var_definir', `<field name="VAR">${k}</field>` + V('V', inner));
  const definirN = (k, n) => I('mk_var_definir', `<field name="VAR">${k}</field>` + N('V', n));
  const mudar = (k, n) => I('mk_var_mudar', `<field name="VAR">${k}</field>` + N('V', n));
  const pausa = ms => I('mk_pausa', `<value name="MS"><shadow type="mk_pausa_menu"><field name="V">${ms}</field></shadow></value>`);
  const icone = n => I('mk_icone', `<field name="I">${n}</field>`);
  const repetir = (n, ...c) => I('mk_repetir', N('N', n) + `<statement name="DO">${seq(...c)}</statement>`);
  const se = (c, sim, nao) => I('mk_se', V('C', c) + `<statement name="SIM">${seq(...sim)}</statement><statement name="NAO">${seq(...nao)}</statement>`);
  const seEntao = (c, ...corpo) => I('mk_se_entao', V('C', c) + `<statement name="SIM">${seq(...corpo)}</statement>`);

  const XML = {
    mt_mudar_menos: `<block type="mk_var_mudar"><field name="VAR">contador</field>${N('V', -1)}</block>`,
    mt_mudar_passos: `<block type="mk_var_mudar"><field name="VAR">passos</field>${N('V', 1)}</block>`,
    mt_var_passos: vr('passos'),
    mt_mudar_pontos: `<block type="mk_var_mudar"><field name="VAR">pontos</field>${N('V', 1)}</block>`,
    mt_definir_pontos: `<block type="mk_var_definir"><field name="VAR">pontos</field>${N('V', 0)}</block>`,
    mt_var_pontos: vr('pontos'),
    mt_definir_medida: `<block type="mk_var_definir"><field name="VAR">medida</field>${N('V', 0)}</block>`,
    mt_var_medida: vr('medida'),
    mt_conta_vezes: conta(N('A', 0), '*', N('B', 2)),
    mt_conta_menos: conta(N('A', 0), '-', N('B', 0)),
    mt_conta_div: conta(N('A', 0), '/', N('B', 1000)),
    mt_comparar_igual: cmp('==', N('A', 0), N('B', 0)),
    // desafios complexos
    mt_mudar_dez: `<block type="mk_var_mudar"><field name="VAR">contador</field>${N('V', 10)}</block>`,
    mt_definir_passos: `<block type="mk_var_definir"><field name="VAR">passos</field>${N('V', 0)}</block>`,
    mt_mudar_medida: `<block type="mk_var_mudar"><field name="VAR">medida</field>${N('V', 1)}</block>`,
    mt_texto_pim: `<block type="mk_mostrar_texto"><value name="T"><shadow type="mk_texto"><field name="TXT">PIM</field></shadow></value></block>`,
    mt_texto_mais: `<block type="mk_mostrar_texto"><value name="T"><shadow type="mk_texto"><field name="TXT">+</field></shadow></value></block>`,
    mt_texto_menos: `<block type="mk_mostrar_texto"><value name="T"><shadow type="mk_texto"><field name="TXT">-</field></shadow></value></block>`,
    mt_definir_recorde: `<block type="mk_var_definir"><field name="VAR">recorde</field>${N('V', 1000)}</block>`,
    mt_var_recorde: vr('recorde'),
    mt_definir_vidas: `<block type="mk_var_definir"><field name="VAR">vidas</field>${N('V', 3)}</block>`,
    mt_mudar_vidas: `<block type="mk_var_mudar"><field name="VAR">vidas</field>${N('V', -1)}</block>`,
    mt_var_vidas: vr('vidas'),
    mt_comparar_maior: cmp('&gt;', N('A', 0), N('B', 21)),
  };

  // ------------------------------------------------------------ verificação
  // Divide o registo em «segmentos»: cada entrada (botão, gesto…) com as saídas que vieram a seguir,
  // e o valor das variáveis no momento dessa entrada.
  function segs(reg) {
    const out = []; let cur = null; const vars = {};
    for (const e of reg) {
      if (e.dir === 'in') { cur = { v: e.v, t: e.t, outs: [], vars: Object.assign({}, vars) }; out.push(cur); continue; }
      if (e.v.startsWith('var:')) { const p = e.v.split(':'); vars[p[1]] = Number(p[2]); }
      if (cur) cur.outs.push(e.v);
    }
    return out;
  }
  const nums = outs => outs.filter(v => v.startsWith('numero:')).map(v => Number(v.slice(7)));
  const ultimo = l => l[l.length - 1];

  // ------------------------------------------------------------ ajudas para as regras
  const evA = a => a.evento('botao:A'), evB = a => a.evento('botao:B');
  const usa = p => p.usa || [];
  const varsDe = p => usa(p).filter(u => u.tipo === 'mk_var').map(u => u.var);
  const numsDe = p => usa(p).filter(u => u.tipo === 'mk_num').map(u => u.n);
  const temOp = (p, op) => usa(p).some(u => u.tipo === 'mk_conta' && u.op === op);
  const comAcaso = ev => blocos(ev, 'mk_var_definir').filter(p => usa(p).some(u => u.tipo === 'mk_aleatorio'));
  // limites do «escolher ao acaso» dentro de um bloco: [de, até]
  function limites(p) {
    const u = usa(p), i = u.findIndex(x => x.tipo === 'mk_aleatorio');
    if (i < 0) return null;
    const n = u.slice(i + 1).filter(x => x.tipo === 'mk_num').slice(0, 2).map(x => x.n);
    return n.length === 2 ? n : null;
  }
  const seDe = ev => blocos(ev, 'mk_se')[0] || blocos(ev, 'mk_se_entao')[0];
  const icDe = l => (l || []).filter(p => p.tipo === 'mk_icone').map(p => p.icone);
  const mostraVar = l => (l || []).filter(p => p.tipo === 'mk_mostrar_numero').flatMap(varsDe);

  // =============================================================== NÍVEL 1 · Números
  const SORTE = {
    titulo: 'O número da sorte',
    missao: 'Quando carregas no A, o micro:bit mostra o número 7.',
    passos: ['Arrasta «no botão A premido».', 'Põe lá dentro «mostrar número».', 'Escreve 7 e experimenta: carrega no A.'],
    material: 'micro:bit',
    novos: ['mk_botao', 'mk_mostrar_numero'],
    caixa: ['mk_agitar', 'mk_icone'],
    teste: 'botao:A',
    ok: r => causou(r, s => s.includes('numero:7'), v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', '{ola} Hoje os números mandam! Primeiro desafio: o micro:bit mostra o número da sorte, o 7.'],
      parecePronto: a => blocos(evA(a), 'mk_mostrar_numero').some(p => p.n === 7),
      testar: 'Tens uma ideia? Vamos testar! Carrega no A.',
      regras: [
        Object.assign(P.evento('botao:A', 'Como é que o micro:bit sabe que carregaste no botão A?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_mostrar_numero', 'O micro:bit já sente o botão. E onde é que ele mostra um número?'), { id: 'sem_mostrar' }),
        P.regra('numero_errado', a => blocos(evA(a), 'mk_mostrar_numero').length > 0 && !blocos(evA(a), 'mk_mostrar_numero').some(p => p.n === 7), [
          ['surpreendida', 'Esse número é o 7? Conta pelos dedos…'],
          'Carrega no número branco do bloco e escreve outro.',
          'Escreve 7 dentro de «mostrar número».',
        ], 'Sete! Conta certa.'),
      ],
      sucesso: 'Sete! O micro:bit já sabe mostrar números. Daqui para a frente, eles vão mexer-se.',
      extensao: 'E se o B mostrasse a tua idade?',
      gambiarra: {
        xml: prog(BA(seq(numeroN(1)))),
        pedido: 'Carrego no A e aparece o 1! Fiz uma gambiarra… Ajudas-me a encontrar o 7?',
      },
    },
  };

  const CONTADOR = {
    titulo: 'Mais um, menos um',
    missao: 'O A soma 1 ao contador, o B tira 1. E o micro:bit mostra sempre quanto vai.',
    passos: ['No A: «mudar contador em 1» e mostrar o bloco «contador».', 'No B: «mudar contador em -1» e mostrar outra vez.', 'Experimenta: A, A, B.'],
    material: 'micro:bit',
    novos: ['mk_var_mudar', 'mt_mudar_menos', 'mk_var', 'mk_botao_B'],
    caixa: ['mk_botao', 'mk_mostrar_numero'],
    teste: 'botao:A',
    // cada A mostra o anterior + 1; cada B o anterior − 1 (começa em 0)
    ok: r => {
      let ant = 0, subiu = false, desceu = false;
      for (const s of segs(r)) {
        const ns = nums(s.outs);
        if (!ns.length || (s.v !== 'botao:A' && s.v !== 'botao:B')) continue;
        const x = ultimo(ns);
        if (s.v === 'botao:A') { if (x !== ant + 1) return false; subiu = true; }
        else { if (x !== ant - 1) return false; desceu = true; }
        ant = x;
      }
      return subiu && desceu;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Vamos fazer um contador, como os das portas dos museus: entra um, soma; sai um, tira.'],
      parecePronto: a => blocos(evA(a), 'mk_var_mudar').some(p => p.n > 0) && mostraVar(evA(a)?.plano).length > 0 &&
        blocos(evB(a), 'mk_var_mudar').some(p => p.n < 0) && mostraVar(evB(a)?.plano).length > 0,
      testar: 'Tens uma ideia? Vamos testar! Carrega A, A e depois B.',
      regras: [
        Object.assign(P.evento('botao:A', 'Para contar, o que tem de acontecer de cada vez que carregas no A?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'Cada vez que carregas no A, o número cresce. Mas onde fica guardado o número?'), { id: 'a_sem_mudar' }),
        Object.assign(P.bloco('botao:A', 'mk_mostrar_numero', 'O contador já cresce, mas às escondidas. Como é que o vemos?'), { id: 'a_sem_mostrar' }),
        Object.assign(P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_var', 'O número que aparece muda? Ou é sempre o mesmo?'), { id: 'mostra_sem_var' }),
        Object.assign(P.evento('botao:B', 'E para tirar um? Que botão vai fazer o contrário?'), { id: 'sem_b' }),
        Object.assign(P.bloco('botao:B', 'mk_var_mudar', 'O B tem de tirar um ao contador. Que bloco muda o contador?'), { id: 'b_sem_mudar' }),
        P.regra('b_soma', a => blocos(evB(a), 'mk_var_mudar').length > 0 && !blocos(evB(a), 'mk_var_mudar').some(p => p.n < 0), [
          'O B também soma? Então quando é que o número desce?',
          'Para tirar, o «mudar» leva um número negativo.',
          'No B, escreve -1 no «mudar contador em».',
        ], 'Agora o B tira um!'),
        Object.assign(P.bloco('botao:B', 'mk_mostrar_numero', 'Depois de tirar, como sabes quanto ficou?'), { id: 'b_sem_mostrar' }),
      ],
      sucesso: 'Contador a funcionar! Somar 1 e tirar 1 são contas que fazes de cabeça — agora o micro:bit também.',
      extensao: 'E se o A+B pusesse o contador outra vez a 0?',
      gambiarra: {
        xml: prog(BA(seq(mudar('contador', 1), numero(vr('contador')))), BB(seq(mudar('contador', 1), numero(vr('contador'))))),
        pedido: 'O meu contador só sobe! Carrego no B e ele soma em vez de tirar. Encontras a gambiarra?',
      },
    },
  };

  const PASSOS = {
    titulo: 'Conta-passos',
    missao: 'Cada vez que agitas, conta um passo. O A mostra quantos passos já deste.',
    passos: ['«em agitar»: «mudar passos em 1».', '«no botão A premido»: mostrar o número «passos».', 'Agita 3 vezes e carrega no A.'],
    material: 'micro:bit (podes prendê-lo ao sapato)',
    novos: ['mk_agitar', 'mt_mudar_passos', 'mt_var_passos'],
    caixa: ['mk_botao', 'mk_mostrar_numero'],
    teste: 'agitar',
    ok: r => {
      let n = 0, bom = false;
      for (const s of segs(r)) {
        if (s.v === 'agitar') n++;
        else if (s.v === 'botao:A') { const ns = nums(s.outs); if (!ns.length || ultimo(ns) !== n) return false; if (n > 0) bom = true; }
      }
      return bom;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Vamos fazer um conta-passos! Cada passo abana o micro:bit. Quantos passos dás até à porta?'],
      parecePronto: a => blocos(a.evento('agitar'), 'mk_var_mudar').some(p => p.n > 0) && mostraVar(evA(a)?.plano).length > 0,
      testar: 'Tens uma ideia? Vamos testar! Agita três vezes e carrega no A.',
      regras: [
        Object.assign(P.evento('agitar', 'Como é que o micro:bit percebe que deste um passo?'), { id: 'sem_agitar' }),
        Object.assign(P.bloco('agitar', 'mk_var_mudar', 'Sentiu o passo! Mas onde fica guardada a conta dos passos?'), { id: 'agitar_sem_mudar' }),
        Object.assign(P.evento('botao:A', 'Os passos estão contados. Como é que os vês quando quiseres?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_mostrar_numero', 'O A já está à escuta. E o que faz ele com os passos?'), { id: 'a_sem_mostrar' }),
        Object.assign(P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_var', 'O número que aparece é o dos passos? Ou é sempre o mesmo?'), { id: 'mostra_sem_var' }),
        P.regra('variaveis_diferentes', a => {
          const c = blocos(a.evento('agitar'), 'mk_var_mudar').map(p => p.var), m = mostraVar(evA(a)?.plano);
          return c.length > 0 && m.length > 0 && !m.some(x => c.includes(x));
        }, [
          'Contas numa variável e mostras outra? Qual delas tem os passos?',
          'Carrega na setinha do bloco da variável para escolher outra.',
          'Mostra a mesma variável que o «mudar» faz crescer: «passos».',
        ], 'Mesma variável, conta certa!'),
      ],
      sucesso: 'Conta-passos pronto! Somar 1 de cada vez é a forma mais antiga de contar — como os riscos num pau.',
      extensao: 'Prende o micro:bit ao sapato e conta os passos da sala ao recreio. E de volta, são os mesmos?',
      gambiarra: {
        xml: prog(AG(seq(definirN('passos', 1))), BA(seq(numero(vr('passos'))))),
        pedido: 'Agito, agito, agito… e o meu conta-passos diz sempre 1! Que gambiarra fiz?',
      },
    },
  };

  const DECRESCENTE = {
    titulo: 'Contagem decrescente',
    missao: 'O foguetão conta 5, 4, 3, 2, 1… e parte!',
    passos: ['No A: «definir contador para 5».', '«repetir 5 vezes»: mostrar contador, «mudar contador em -1», pausa.', 'No fim, o ícone surpreendido: o foguetão partiu!'],
    material: 'micro:bit',
    novos: ['mk_var_definir', 'mk_repetir', 'mt_mudar_menos', 'mk_pausa', 'mk_icone_surpreendido'],
    caixa: ['mk_botao', 'mk_mostrar_numero', 'mk_var'],
    teste: 'botao:A',
    ok: r => causou(r, s => {
      const ns = nums(s).join(',');
      const i1 = s.lastIndexOf('numero:1'), is = s.lastIndexOf('icone:Surprised');
      return ns.includes('5,4,3,2,1') && i1 >= 0 && is > i1;
    }, v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', 'Atenção, base de lançamento! O foguetão conta para trás: 5, 4, 3, 2, 1… e lá vai ele.'],
      parecePronto: a => {
        const e = evA(a);
        return blocos(e, 'mk_var_definir').some(p => p.n === 5) && blocos(e, 'mk_repetir').some(p => p.n === 5) &&
          blocos(e, 'mk_var_mudar').some(p => p.n < 0) && mostraVar(e?.plano).length > 0 && tem(e, 'mk_icone');
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A e conta com o micro:bit.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão carrega na ignição do foguetão?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_definir', 'De que número começa a contagem?'), { id: 'sem_comeco' }),
        Object.assign(P.bloco('botao:A', 'mk_repetir', 'Vais escrever cinco vezes os mesmos blocos? Há uma maneira de repetir.'), { id: 'sem_repetir' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'O número fica sempre igual. O que tem de mudar de cada vez?'), { id: 'sem_descer' }),
        P.regra('conta_sobe', a => blocos(evA(a), 'mk_var_mudar').length > 0 && !blocos(evA(a), 'mk_var_mudar').some(p => p.n < 0), [
          ['surpreendida', 'Os números estão a subir! Numa contagem decrescente, o que acontece?'],
          'Para descer, o «mudar contador em» leva um número negativo.',
          'Escreve -1 no «mudar contador em».',
        ], 'Agora desce!'),
        P.regra('poucas_vezes', a => blocos(evA(a), 'mk_repetir').some(p => p.n < 5), [
          'O foguetão parou antes do 1. Quantos números há de 5 até 1?',
          'O número do «repetir» é quantas voltas dá.',
          'Escreve 5 no «repetir … vezes».',
        ], 'Cinco voltas, cinco números!'),
        Object.assign(P.bloco('botao:A', 'mk_icone', 'Contagem feita… e o foguetão? Como mostras que partiu?'), { id: 'sem_partida' }),
      ],
      sucesso: '5, 4, 3, 2, 1… descolagem! Contar para trás é tirar 1 de cada vez.',
      extensao: 'E se a contagem começasse no 9? Que números mudavas?',
      gambiarra: {
        xml: prog(BA(seq(definirN('contador', 5), repetir(5, numero(vr('contador')), mudar('contador', 1), pausa(200)), icone('Surprised')))),
        pedido: 'O meu foguetão conta 5, 6, 7, 8… e nunca mais parte! Encontras a gambiarra?',
      },
    },
  };

  const DADO = {
    titulo: 'Lança o dado',
    missao: 'Agita o micro:bit e ele mostra um número ao acaso, de 1 a 6, como um dado.',
    passos: ['«em agitar»: «mostrar número».', 'Dentro dele: «escolher ao acaso de 1 até 6».', 'Agita várias vezes: sai sempre o mesmo?'],
    material: 'micro:bit',
    novos: ['mk_aleatorio'],
    caixa: ['mk_agitar', 'mk_mostrar_numero', 'mk_botao'],
    teste: 'agitar',
    ok: r => {
      const l = segs(r).filter(s => s.v === 'agitar').map(s => ultimo(nums(s.outs))).filter(x => x !== undefined);
      return l.length >= 4 && l.every(x => Number.isInteger(x) && x >= 1 && x <= 6) && new Set(l).size >= 2;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Esqueceste-te do dado em casa? Não faz mal: o micro:bit vira dado!'],
      parecePronto: a => blocos(a.evento('agitar'), 'mk_mostrar_numero').some(p => { const l = limites(p); return l && l[0] === 1 && l[1] === 6; }),
      testar: 'Tens uma ideia? Vamos testar! Agita várias vezes.',
      regras: [
        Object.assign(P.evento('agitar', 'Com um dado a sério, o que fazes antes de o lançar?'), { id: 'sem_agitar' }),
        Object.assign(P.bloco('agitar', 'mk_mostrar_numero', 'O micro:bit já sente que o agitas. Onde é que aparece o número do dado?'), { id: 'sem_mostrar' }),
        Object.assign(P.valorEm('agitar', 'mk_mostrar_numero', 'mk_aleatorio', 'Um dado dá sempre o mesmo número? O que tem de ser diferente?'), { id: 'sem_acaso' }),
        P.regra('limites', a => blocos(a.evento('agitar'), 'mk_mostrar_numero').some(p => { const l = limites(p); return l && !(l[0] === 1 && l[1] === 6); }), [
          'Um dado tem quantas faces? E qual é o número mais pequeno?',
          'Os dois números do «escolher ao acaso» são o mais pequeno e o maior.',
          'Escreve 1 e 6 no «escolher ao acaso».',
        ], 'De 1 a 6, como um dado a sério!'),
      ],
      sucesso: 'Dado pronto! Cada número tem a mesma hipótese de sair: 1 em 6.',
      extensao: 'Agita 12 vezes e aponta os números. Saíram todos? Algum saiu mais vezes?',
      gambiarra: {
        xml: prog(AG(seq(numero(acaso(1, 60))))),
        pedido: 'O meu dado deu 37! Que dado é este? Encontras a gambiarra?',
      },
    },
  };

  const PLACAR = {
    titulo: 'Placar',
    missao: 'Jogo a dois: o A dá pontos à equipa A, o B à equipa B. O A+B mostra o resultado.',
    passos: ['A: «mudar contador em 1». B: «mudar pontos em 1».', 'A+B: mostrar contador, pausa, mostrar pontos.', 'Experimenta: A, A, B e depois A+B.'],
    material: 'micro:bit',
    novos: ['mk_botao_AB', 'mt_mudar_pontos', 'mt_var_pontos'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_mudar', 'mk_var', 'mk_mostrar_numero', 'mk_pausa'],
    teste: 'botao:AB',
    ok: r => {
      let a = 0, b = 0, bom = false;
      for (const s of segs(r)) {
        if (s.v === 'botao:A') a++;
        else if (s.v === 'botao:B') b++;
        else if (s.v === 'botao:AB') {
          const ns = nums(s.outs);
          if (ns.length < 2 || ns[0] !== a || ns[1] !== b) return false;
          if (a !== b) bom = true;
        }
      }
      return bom;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Jogo a dois! Precisamos de um placar que conte os pontos de cada equipa.'],
      parecePronto: a => {
        const ma = blocos(evA(a), 'mk_var_mudar').map(p => p.var), mb = blocos(evB(a), 'mk_var_mudar').map(p => p.var);
        const ab = mostraVar(a.evento('botao:AB')?.plano);
        return ma.length > 0 && mb.length > 0 && !ma.some(x => mb.includes(x)) && ab.includes(ma[0]) && ab.includes(mb[0]);
      },
      testar: 'Tens uma ideia? Vamos testar! A, A, B… e A+B para ver o resultado.',
      regras: [
        Object.assign(P.evento('botao:A', 'Cada equipa tem o seu botão. Onde se marca um ponto da equipa A?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'A equipa A marcou! Onde fica guardado o ponto?'), { id: 'a_sem_mudar' }),
        Object.assign(P.evento('botao:B', 'E a equipa B, carrega em quê?'), { id: 'sem_b' }),
        Object.assign(P.bloco('botao:B', 'mk_var_mudar', 'A equipa B também marca. Onde guardas os pontos dela?'), { id: 'b_sem_mudar' }),
        P.regra('mesma_conta', a => {
          const ma = blocos(evA(a), 'mk_var_mudar').map(p => p.var), mb = blocos(evB(a), 'mk_var_mudar').map(p => p.var);
          return ma.length > 0 && mb.length > 0 && ma.some(x => mb.includes(x));
        }, [
          ['surpreendida', 'As duas equipas marcam no mesmo sítio? Como sabes quem ganhou?'],
          'Cada equipa precisa da sua variável: contador para uma, pontos para a outra.',
          'No B, carrega na setinha do «mudar» e escolhe «pontos».',
        ], 'Cada equipa com os seus pontos!'),
        Object.assign(P.evento('botao:AB', 'O jogo acabou. Como é que vês o resultado das duas equipas?'), { id: 'sem_ab' }),
        Object.assign(P.bloco('botao:AB', 'mk_mostrar_numero', 'O A+B já está à escuta. O que mostra ele?'), { id: 'ab_sem_mostrar' }),
        P.regra('so_uma_equipa', a => new Set(mostraVar(a.evento('botao:AB')?.plano)).size < 2, [
          'Mostras só uma equipa? E a outra?',
          'Precisas de dois «mostrar número»: um com cada variável.',
          'No A+B: mostra contador, uma pausa, e mostra pontos.',
        ], 'Agora vê-se o resultado todo!'),
      ],
      sucesso: 'Placar pronto! Duas variáveis, duas contas ao mesmo tempo.',
      extensao: 'E se o A+B mostrasse também a diferença de pontos?',
      gambiarra: {
        xml: prog(BA(seq(mudar('contador', 1))), BB(seq(mudar('contador', 1))), BAB(seq(numero(vr('contador')), pausa(500), numero(vr('pontos'))))),
        pedido: 'No meu placar a equipa B tem sempre 0 pontos, por mais que carregue no B! Encontras a gambiarra?',
      },
    },
  };

  // =============================================================== NÍVEL 2 · Contas e padrões
  const TABUADA = {
    titulo: 'Tabuada do 3',
    missao: 'Cada vez que carregas no A, salta para o número seguinte da tabuada do 3: 3, 6, 9…',
    passos: ['No A: mudar o contador em 3.', 'Depois mostra o contador.', 'Carrega no A três vezes: 3, 6, 9?'],
    material: 'micro:bit',
    novos: ['mk_var_mudar'],
    caixa: ['mk_botao', 'mk_var', 'mk_mostrar_numero', 'mk_iniciar', 'mk_var_definir'],
    teste: 'botao:A',
    ok: r => {
      let i = 0;
      for (const s of segs(r)) {
        if (s.v !== 'botao:A') continue;
        const ns = nums(s.outs); if (!ns.length) continue;
        i++; if (ultimo(ns) !== 3 * i) return false;
      }
      return i >= 3;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'A tabuada do 3 é uma escada: cada degrau sobe 3. Vamos subi-la com o micro:bit?'],
      parecePronto: a => {
        const pl = evA(a)?.plano || [];
        const im = pl.findIndex(p => p.tipo === 'mk_var_mudar' && p.n === 3), is = pl.findIndex(p => p.tipo === 'mk_mostrar_numero' && varsDe(p).length);
        return im >= 0 && is > im;
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega três vezes no A.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão faz subir um degrau da tabuada?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'Para subir um degrau, o que acontece ao contador?'), { id: 'sem_mudar' }),
        P.regra('salto_errado', a => blocos(evA(a), 'mk_var_mudar').length > 0 && !blocos(evA(a), 'mk_var_mudar').some(p => p.n === 3), [
          'De quanto em quanto salta a tabuada do 3?',
          'O número do «mudar contador em» é o tamanho do salto.',
          'Escreve 3 no «mudar contador em».',
        ], 'Saltos de 3!'),
        Object.assign(P.bloco('botao:A', 'mk_mostrar_numero', 'O contador já salta. Como vês em que degrau estás?'), { id: 'sem_mostrar' }),
        Object.assign(P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_var', 'O número que aparece muda? Qual é a variável que salta?'), { id: 'mostra_sem_var' }),
        P.regra('mostra_antes', a => {
          const pl = evA(a)?.plano || [];
          const im = pl.findIndex(p => p.tipo === 'mk_var_mudar'), is = pl.findIndex(p => p.tipo === 'mk_mostrar_numero');
          return im >= 0 && is >= 0 && is < im;
        }, [
          'Mostras primeiro e só depois contas? Qual é o primeiro número que aparece?',
          'A ordem dos blocos conta: o micro:bit lê-os de cima para baixo.',
          'Põe o «mostrar número» por baixo do «mudar».',
        ], 'Primeiro salta, depois mostra!'),
      ],
      sucesso: '3, 6, 9! Multiplicar é somar o mesmo número várias vezes.',
      extensao: 'Muda o salto para 4. Que tabuada aparece? E até onde chegas com 5 toques?',
      gambiarra: {
        xml: prog(BA(seq(numero(vr('contador')), mudar('contador', 3)))),
        pedido: 'A minha tabuada do 3 começa no 0! Encontras a gambiarra?',
      },
    },
  };

  const DOBRO = {
    titulo: 'Dobra!',
    missao: 'Começa no 1 e cada A dobra o número: 2, 4, 8…',
    passos: ['«no arranque»: «definir contador para 1».', 'No A: «definir contador para» contador × 2.', 'Mostra o contador e carrega no A três vezes.'],
    material: 'micro:bit',
    novos: ['mk_iniciar', 'mt_conta_vezes'],
    caixa: ['mk_botao', 'mk_var_definir', 'mk_var', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => {
      let ant = 1, i = 0;
      for (const s of segs(r)) {
        if (s.v !== 'botao:A') continue;
        const ns = nums(s.outs); if (!ns.length) continue;
        const x = ultimo(ns);
        if (x !== 2 * ant || x === 0) return false;
        ant = x; i++;
      }
      return i >= 3;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Dobrar é ficar com o dobro: 1 vira 2, 2 vira 4… Até onde chega?'],
      parecePronto: a => blocos(a.evento('inicio'), 'mk_var_definir').some(p => p.n === 1) &&
        blocos(evA(a), 'mk_var_definir').some(p => temOp(p, '*') && numsDe(p).includes(2)) && mostraVar(evA(a)?.plano).length > 0,
      testar: 'Tens uma ideia? Vamos testar! Carrega três vezes no A.',
      regras: [
        Object.assign(P.evento('inicio', 'Antes de começares a dobrar, de que número parte o contador?'), { id: 'sem_inicio' }),
        P.regra('comeca_zero', a => !blocos(a.evento('inicio'), 'mk_var_definir').some(p => p.n !== 0 && p.n != null), [
          'O dobro de 0 é…? Experimenta fazer a conta.',
          'O contador tem de começar num número que não seja 0.',
          'No «no arranque», define o contador para 1.',
        ], 'Agora há o que dobrar!'),
        Object.assign(P.evento('botao:A', 'Que botão dobra o número?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_definir', 'Dobrar é dar um valor novo ao contador. Que bloco dá um valor a uma variável?'), { id: 'a_sem_definir' }),
        Object.assign(P.valorEm('botao:A', 'mk_var_definir', 'mk_conta', 'Qual é a conta para saber o dobro de um número?'), { id: 'sem_conta' }),
        P.regra('conta_errada', a => blocos(evA(a), 'mk_var_definir').some(p => usa(p).some(u => u.tipo === 'mk_conta')) &&
          !blocos(evA(a), 'mk_var_definir').some(p => temOp(p, '*') && numsDe(p).includes(2) && varsDe(p).length), [
          'O dobro é somar ou multiplicar? E por quanto? E de que número?',
          'Na conta tem de entrar o próprio contador.',
          'Faz «contador × 2» dentro do «definir contador para».',
        ], 'Conta certa: o dobro!'),
        Object.assign(P.bloco('botao:A', 'mk_mostrar_numero', 'O número já dobra, mas às escondidas. Como o vês?'), { id: 'sem_mostrar' }),
      ],
      sucesso: '2, 4, 8, 16… Dobrar faz os números crescerem depressa!',
      extensao: 'Quantos toques precisas para passar de 100? Adivinha primeiro, depois experimenta.',
      gambiarra: {
        xml: prog(BA(seq(definir('contador', conta(V('A', vr('contador')), '*', N('B', 2))), numero(vr('contador'))))),
        pedido: 'Carrego no A e dá sempre 0… Mas eu dobro! Porquê?',
      },
    },
  };

  const PAR = {
    titulo: 'Par ou ímpar?',
    missao: 'Cada A soma 1 e mostra o número. Depois: ✔ se for par, ✗ se for ímpar.',
    passos: ['No A: mudar contador em 1 e mostrar o contador.', '«se … então … senão» com «resto de contador ÷ 2 = 0».', '✔ em «então», ✗ em «senão».'],
    material: 'micro:bit',
    novos: ['mk_se_senao', 'mt_comparar_igual', 'mk_resto', 'mk_icone_sim', 'mk_icone_nao'],
    caixa: ['mk_botao', 'mk_var_mudar', 'mk_var', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => {
      let par = false, impar = false;
      for (const s of segs(r)) {
        if (s.v !== 'botao:A') continue;
        const ns = nums(s.outs), ic = s.outs.filter(v => v === 'icone:Yes' || v === 'icone:No');
        if (!ns.length || !ic.length) return false;
        const k = ultimo(ns), certo = k % 2 === 0 ? 'icone:Yes' : 'icone:No';
        if (ultimo(ic) !== certo) return false;
        if (k % 2 === 0) par = true; else impar = true;
      }
      return par && impar;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Par ou ímpar? Os pares dividem-se por 2 sem sobrar nada. O micro:bit vai descobrir sozinho.'],
      parecePronto: a => {
        const s = blocos(evA(a), 'mk_se')[0];
        return !!s && usa(s).some(u => u.tipo === 'mk_resto') && icDe(s.sim).includes('Yes') && icDe(s.nao).includes('No') &&
          blocos(evA(a), 'mk_var_mudar').length > 0 && mostraVar(evA(a)?.plano).length > 0;
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A quatro vezes.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão vai trazer o número seguinte?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'Os números têm de ir mudando: 1, 2, 3… O que faz o contador crescer?'), { id: 'sem_mudar' }),
        Object.assign(P.bloco('botao:A', 'mk_se', 'Como é que o micro:bit escolhe entre ✔ e ✗?'), { id: 'sem_se' }),
        Object.assign(P.valorEm('botao:A', 'mk_se', 'mk_resto', 'Um número é par quando o dividimos por 2 e… sobra quanto?'), { id: 'sem_resto' }),
        P.regra('divide_errado', a => blocos(evA(a), 'mk_se').some(s => {
          const u = usa(s), i = u.findIndex(x => x.tipo === 'mk_resto');
          if (i < 0) return false;
          const d = u.slice(i + 1).filter(x => x.tipo === 'mk_num' || x.tipo === 'mk_var');
          return d.length >= 2 && !(d[1].tipo === 'mk_num' && d[1].n === 2);
        }), [
          'Par quer dizer que se divide por quanto?',
          'No «resto de … ÷ …», o segundo número é o divisor.',
          'Escreve 2 depois do ÷.',
        ], 'Dividir por 2: isso mesmo!'),
        P.regra('sem_icones', a => blocos(evA(a), 'mk_se').some(s => icDe(s.sim).length === 0 && icDe(s.nao).length === 0), [
          'O micro:bit já sabe se é par. Como é que nos diz?',
          'Põe um ícone em cada braço do «se».',
          '✔ em «então» e ✗ em «senão».',
        ], 'Agora diz-nos!'),
        P.regra('icones_trocados', a => blocos(evA(a), 'mk_se').some(s => icDe(s.sim).includes('No') || icDe(s.nao).includes('Yes')), [
          ['surpreendida', 'O 2 é par. Que ícone aparece com o 2?'],
          '«então» corre quando a condição é verdadeira: sobra 0, é par.',
          'Troca: ✔ em «então», ✗ em «senão».',
        ], 'Agora sim!'),
      ],
      sucesso: 'Par, ímpar, par, ímpar… O resto da divisão por 2 diz tudo!',
      extensao: 'E se mostrasse ✔ só nos números da tabuada do 3? Que número mudavas?',
      gambiarra: {
        xml: prog(BA(seq(mudar('contador', 1), numero(vr('contador')),
          se(cmp('==', V('A', `<block type="mk_resto">${V('A', vr('contador'))}${N('B', 2)}</block>`), N('B', 0)), [icone('No')], [icone('Yes')])))),
        pedido: 'O meu micro:bit diz que o 2 é ímpar! Encontras a gambiarra?',
      },
    },
  };

  const DIAGONAL = {
    titulo: 'Diagonal de luzes',
    missao: 'Com uma só variável, acende as luzes da diagonal: (0,0), (1,1)… até (4,4).',
    passos: ['No A: «definir contador para 0» e «repetir 5 vezes».', 'Lá dentro: «acender x contador y contador» e «mudar contador em 1».', 'Experimenta: carrega no A.'],
    material: 'micro:bit',
    novos: ['mk_acender'],
    caixa: ['mk_botao', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_repetir'],
    teste: 'botao:A',
    ok: r => causou(r, s => {
      const ac = s.filter(v => v.startsWith('acender:')).map(v => v.slice(8));
      const certo = ['0,0', '1,1', '2,2', '3,3', '4,4'];
      return certo.every(c => ac.includes(c)) && ac.every(c => certo.includes(c));
    }, v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', 'O ecrã do micro:bit é uma grelha: x é a coluna, y é a linha. Vamos desenhar uma diagonal com contas!'],
      parecePronto: a => blocos(evA(a), 'mk_acender').some(p => varsDe(p).length >= 2) && tem(evA(a), 'mk_repetir') &&
        blocos(evA(a), 'mk_var_mudar').some(p => p.prof > 0),
      testar: 'Tens uma ideia? Vamos testar! Carrega no A.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão desenha a diagonal?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_repetir', 'São 5 luzes. Vais pôr 5 blocos, ou há maneira de repetir?'), { id: 'sem_repetir' }),
        Object.assign(P.bloco('botao:A', 'mk_acender', 'Que bloco acende uma luz num sítio certinho da grelha?'), { id: 'sem_acender' }),
        P.regra('acender_fixo', a => blocos(evA(a), 'mk_acender').length > 0 && !blocos(evA(a), 'mk_acender').some(p => varsDe(p).length), [
          'Se o x e o y forem sempre os mesmos números, quantas luzes acendes?',
          'Os números do «acender» podem vir de uma variável.',
          'Põe o bloco «contador» no x e no y.',
        ], 'Agora a luz anda!'),
        P.regra('so_uma_var', a => blocos(evA(a), 'mk_acender').some(p => varsDe(p).length === 1), [
          'Numa diagonal, quando o x anda um, o que acontece ao y?',
          'Na diagonal, o x e o y são sempre iguais: (1,1), (2,2)…',
          'Põe «contador» também no outro buraco do «acender».',
        ], 'Diagonal perfeita!'),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'O contador fica sempre igual. Como passa para a luz seguinte?'), { id: 'sem_mudar' }),
        P.regra('poucas_vezes', a => blocos(evA(a), 'mk_repetir').some(p => p.n < 5), [
          'Quantas luzes tem a diagonal, de um canto ao outro?',
          'O número do «repetir» é quantas luzes acendes.',
          'Escreve 5 no «repetir … vezes».',
        ], 'De canto a canto!'),
      ],
      sucesso: '(0,0), (1,1), (2,2)… Uma diagonal com uma só variável: isto são coordenadas!',
      extensao: 'E a outra diagonal, de (4,0) a (0,4)? Pista: x + y dá sempre 4.',
      gambiarra: {
        // y fixo em 0: sai uma linha em vez da diagonal
        xml: prog(BA(seq(definirN('contador', 0), repetir(5, I('mk_acender', V('X', vr('contador')) + N('Y', 0)), mudar('contador', 1))))),
        pedido: 'Queria uma diagonal e saiu-me uma linha deitada! Encontras a gambiarra?',
      },
    },
  };

  const QUIZ = {
    titulo: 'Quiz da soma',
    missao: 'O A mostra dois números ao acaso. Pensa na soma… e o B mostra se acertaste.',
    passos: ['No A: contador e pontos ao acaso de 1 até 5; mostra os dois.', 'No B: «mostrar número» com contador + pontos.', 'Joga: A, pensa, B.'],
    material: 'micro:bit',
    novos: ['mt_definir_pontos', 'mt_var_pontos', 'mk_conta'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_definir', 'mk_var', 'mk_aleatorio', 'mk_mostrar_numero', 'mk_pausa'],
    teste: 'botao:A',
    ok: r => {
      let par = null, n = 0, dif = false;
      for (const s of segs(r)) {
        const ns = nums(s.outs);
        if (s.v === 'botao:A') par = ns.length >= 2 ? ns.slice(-2) : null;
        else if (s.v === 'botao:B') {
          if (!par || !ns.length) return false;
          if (ultimo(ns) !== par[0] + par[1]) return false;
          if (par[0] !== par[1]) dif = true;     // com dois números iguais, «contador + contador» também acertava
          n++;
        }
      }
      return n >= 2 && dif;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Desafio de cálculo mental! O micro:bit mostra dois números, tu somas de cabeça, e ele confere.'],
      parecePronto: a => comAcaso(evA(a)).length >= 2 && blocos(evA(a), 'mk_mostrar_numero').length >= 2 &&
        blocos(evB(a), 'mk_mostrar_numero').some(p => temOp(p, '+') && new Set(varsDe(p)).size >= 2),
      testar: 'Tens uma ideia? Vamos testar! Carrega no A, pensa na soma, e carrega no B.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão lança a pergunta?'), { id: 'sem_a' }),
        P.regra('a_sem_acaso', a => comAcaso(evA(a)).length < 2, [
          'Para o quiz ser surpresa, de onde vêm os números?',
          'Cada variável recebe um «escolher ao acaso».',
          'Define o contador e os pontos, cada um com «escolher ao acaso de 1 até 5».',
        ], 'Números-surpresa!'),
        P.regra('a_sem_mostrar', a => blocos(evA(a), 'mk_mostrar_numero').length < 2, [
          'Como é que ficas a saber quais são os dois números?',
          'Precisas de dois «mostrar número», um para cada variável.',
          'Mostra o contador, uma pausa, e mostra os pontos.',
        ], 'Agora vês os dois!'),
        Object.assign(P.evento('botao:B', 'E a resposta, aparece quando carregas em quê?'), { id: 'sem_b' }),
        Object.assign(P.bloco('botao:B', 'mk_mostrar_numero', 'O B já está à escuta. O que mostra ele?'), { id: 'b_sem_mostrar' }),
        Object.assign(P.valorEm('botao:B', 'mk_mostrar_numero', 'mk_conta', 'O B tem de mostrar a soma. Que bloco faz contas?'), { id: 'b_sem_conta' }),
        P.regra('conta_errada', a => blocos(evB(a), 'mk_mostrar_numero').some(p => usa(p).some(u => u.tipo === 'mk_conta')) &&
          !blocos(evB(a), 'mk_mostrar_numero').some(p => temOp(p, '+') && new Set(varsDe(p)).size >= 2), [
          'Somas o contador com quem? E é mesmo uma soma?',
          'A conta tem de usar as duas variáveis e o sinal +.',
          'Faz «contador + pontos» dentro do «mostrar número».',
        ], 'Soma certa!'),
      ],
      sucesso: 'Quiz pronto! Agora o micro:bit faz as perguntas e tu és a calculadora.',
      extensao: 'E se fosse a tabuada? Troca o + por × e os números vão até 9.',
      gambiarra: {
        xml: prog(BA(seq(definir('contador', acaso(1, 5)), definir('pontos', acaso(1, 5)), numero(vr('contador')), pausa(500), numero(vr('pontos')))),
          BB(seq(numero(conta(V('A', vr('contador')), '+', V('B', vr('contador'))))))),
        pedido: 'O meu quiz dá respostas esquisitas: 2 + 4 dá 4! Encontras a gambiarra?',
      },
    },
  };

  const MOEDAS = {
    titulo: 'Cara ou coroa',
    missao: 'Lança 10 moedas de uma vez: o micro:bit conta quantas saíram cara.',
    passos: ['No A: contador a 0 e «repetir 10 vezes».', 'Lá dentro: «se escolher ao acaso de 1 até 2 = 1 então» mudar contador em 1.', 'No fim, mostra o contador. Dá sempre 5?'],
    material: 'micro:bit (e uma moeda, para comparar)',
    novos: ['mk_se_entao'],
    caixa: ['mk_botao', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_repetir', 'mk_aleatorio', 'mt_comparar_igual', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => {
      const res = [];
      for (const s of segs(r)) {
        if (s.v !== 'botao:A') continue;
        const ns = nums(s.outs), vs = s.outs.filter(v => v.startsWith('var:contador:')).map(v => Number(v.split(':')[2]));
        if (!ns.length) continue;
        const x = ultimo(ns);
        if (!vs.length || vs[0] !== 0 || ultimo(vs) !== x || x < 0 || x > 10) return false;
        res.push(x);
      }
      return res.length >= 2 && res.some(x => x < 10);
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Atiras uma moeda ao ar: cara ou coroa? E se atirares 10? Saem sempre 5 caras?'],
      parecePronto: a => {
        const s = blocos(evA(a), 'mk_se_entao')[0];
        return !!s && usa(s).some(u => u.tipo === 'mk_aleatorio') && (s.sim || []).some(p => p.tipo === 'mk_var_mudar') &&
          blocos(evA(a), 'mk_var_definir').some(p => p.n === 0 && p.prof === 0) && mostraVar(evA(a)?.plano).length > 0;
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A várias vezes e vê os resultados.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão lança as moedas?'), { id: 'sem_a' }),
        P.regra('sem_zero', a => !blocos(evA(a), 'mk_var_definir').some(p => p.n === 0), [
          'Antes de lançares as moedas outra vez, quantas caras tens?',
          'O contador tem de voltar ao início em cada lançamento.',
          'No começo do A: «definir contador para 0».',
        ], 'Começa do zero!'),
        Object.assign(P.bloco('botao:A', 'mk_repetir', 'São 10 moedas. Como lanças todas sem escrever 10 vezes?'), { id: 'sem_repetir' }),
        Object.assign(P.bloco('botao:A', 'mk_se_entao', 'Só às vezes sai cara. Como é que o micro:bit decide se conta ou não?'), { id: 'sem_se' }),
        Object.assign(P.valorEm('botao:A', 'mk_se_entao', 'mk_aleatorio', 'Uma moeda cai ao acaso. O que falta na condição?'), { id: 'sem_acaso' }),
        P.regra('conta_sempre', a => blocos(evA(a), 'mk_se_entao').length > 0 && !blocos(evA(a), 'mk_se_entao').some(s => (s.sim || []).some(p => p.tipo === 'mk_var_mudar')), [
          'Saiu cara! E onde fica contada? Saem sempre 10 caras?',
          'O «mudar contador» só deve correr quando sai cara: dentro do «se».',
          'Mete «mudar contador em 1» dentro do «se … então».',
        ], 'Só conta as caras!'),
        Object.assign(P.bloco('botao:A', 'mk_mostrar_numero', 'As moedas já foram lançadas. Quantas caras saíram?'), { id: 'sem_mostrar' }),
      ],
      sucesso: 'Às vezes 4, às vezes 6… Quase sempre perto de 5: metade das moedas. Isto é probabilidade!',
      extensao: 'E se lançasses um dado 12 vezes: quantas vezes deve sair o 6?',
      gambiarra: {
        xml: prog(BA(seq(definirN('contador', 0), repetir(10,
          seEntao(cmp('==', V('A', acaso(1, 2)), N('B', 1))), mudar('contador', 1)), numero(vr('contador'))))),
        pedido: 'Lanço 10 moedas e saem sempre 10 caras! Que sorte… ou será gambiarra?',
      },
    },
  };

  // =============================================================== NÍVEL 3 · Jogos de números
  const BARRA = {
    titulo: 'Barra de progresso',
    missao: 'Cada A enche um pouco a barra. Com 10 toques fica cheia — e com 5, a meio!',
    passos: ['No A: mudar contador em 1.', '«desenhar gráfico de barras de» contador «até» 10.', 'Carrega 5 vezes: está a meio?'],
    material: 'micro:bit',
    novos: ['mk_grafico'],
    caixa: ['mk_botao', 'mk_var_mudar', 'mk_var', 'mk_iniciar', 'mk_var_definir'],
    teste: 'botao:A',
    ok: r => {
      let k = 0;
      for (const s of segs(r)) {
        if (s.v !== 'botao:A') continue;
        k++;
        const g = s.outs.filter(v => v.startsWith('grafico:')).map(v => Number(v.slice(8)));
        if (!g.length || ultimo(g) !== Math.round(25 * k / 10)) return false;
      }
      return k >= 4;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'As barras de progresso mostram uma parte de um todo. Vamos fazer uma que se enche aos bocadinhos!'],
      parecePronto: a => blocos(evA(a), 'mk_grafico').some(p => varsDe(p).length && p.max === 10) && blocos(evA(a), 'mk_var_mudar').length > 0,
      testar: 'Tens uma ideia? Vamos testar! Carrega no A cinco vezes.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão enche um bocadinho da barra?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'Para a barra crescer, o que tem de crescer primeiro?'), { id: 'sem_mudar' }),
        Object.assign(P.bloco('botao:A', 'mk_grafico', 'Como é que se vê uma parte de um todo, sem números?'), { id: 'sem_grafico' }),
        Object.assign(P.valorEm('botao:A', 'mk_grafico', 'mk_var', 'A barra cresce? Ou é sempre igual?'), { id: 'grafico_fixo' }),
        P.regra('maximo', a => blocos(evA(a), 'mk_grafico').some(p => p.max !== 10), [
          'Quantos toques enchem a barra toda?',
          'O segundo número do gráfico é o «todo».',
          'Escreve 10 no «até» do gráfico.',
        ], 'O todo são 10!'),
      ],
      sucesso: '5 de 10 é metade! A barra mostra frações sem precisar de números.',
      extensao: 'E se o todo fosse 4? Quantos toques eram metade? E um quarto?',
      gambiarra: {
        // a barra desenha sempre o 1, em vez do contador
        xml: prog(BA(seq(mudar('contador', 1), I('mk_grafico', N('V', 1) + N('MAX', 10))))),
        pedido: 'A minha barra não enche! Carrego, carrego, e fica sempre igual. Encontras a gambiarra?',
      },
    },
  };

  const META = {
    titulo: 'Meta de passos',
    missao: 'Conta os passos ao agitar. Até 4 mostra o número; a partir de 5, festa: meta cumprida!',
    passos: ['«em agitar»: mudar passos em 1.', '«se passos ≥ 5 então» ícone contente, «senão» mostrar passos.', 'Agita 6 vezes.'],
    material: 'micro:bit',
    novos: ['mk_se_senao', 'mk_comparar'],
    caixa: ['mk_agitar', 'mt_mudar_passos', 'mt_var_passos', 'mk_mostrar_numero', 'mk_icone'],
    teste: 'agitar',
    ok: r => {
      let k = 0;
      for (const s of segs(r)) {
        if (s.v !== 'agitar') continue;
        k++;
        const festa = s.outs.includes('icone:Happy');
        if (k >= 5 && !festa) return false;
        if (k < 5 && (festa || ultimo(nums(s.outs)) !== k)) return false;
      }
      return k >= 6;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Uma meta é um número a que queres chegar. A nossa: 5 passos. O micro:bit avisa quando lá chegares!'],
      parecePronto: a => {
        const s = blocos(a.evento('agitar'), 'mk_se')[0];
        if (!s) return false;
        const c = usa(s).find(u => u.tipo === 'mk_comparar'), n = numsDe(s);
        return !!c && ((c.op === '>=' && n.includes(5)) || (c.op === '>' && n.includes(4))) && icDe(s.sim).includes('Happy') && blocos(a.evento('agitar'), 'mk_var_mudar').length > 0;
      },
      testar: 'Tens uma ideia? Vamos testar! Agita seis vezes.',
      regras: [
        Object.assign(P.evento('agitar', 'Como é que o micro:bit conta cada passo?'), { id: 'sem_agitar' }),
        Object.assign(P.bloco('agitar', 'mk_var_mudar', 'Deste um passo. Onde fica contado?'), { id: 'sem_mudar' }),
        Object.assign(P.bloco('agitar', 'mk_se', 'O micro:bit tem de decidir: já chegaste à meta ou ainda não? Que bloco decide?'), { id: 'sem_se' }),
        Object.assign(P.valorEm('agitar', 'mk_se', 'mk_comparar', 'Como é que se compara o número de passos com a meta?'), { id: 'sem_comparar' }),
        P.regra('meta_errada', a => blocos(a.evento('agitar'), 'mk_se').some(s => {
          const c = usa(s).find(u => u.tipo === 'mk_comparar'), n = numsDe(s);
          return c && !((c.op === '>=' && n.includes(5)) || (c.op === '>' && n.includes(4)));
        }), [
          'A meta é 5 passos. Ao 5.º passo já é festa?',
          'Lê a comparação em voz alta: «passos maior ou igual a 5».',
          'Escolhe ≥ e escreve 5.',
        ], 'Meta certa!'),
        P.regra('festa_trocada', a => blocos(a.evento('agitar'), 'mk_se').some(s => icDe(s.nao).includes('Happy') || (!icDe(s.sim).length && icDe(s.nao).length)), [
          ['surpreendida', 'Festa antes da meta?'],
          '«então» corre quando já chegaste à meta.',
          'Põe o ícone contente em «então» e o número em «senão».',
        ], 'Festa no sítio certo!'),
      ],
      sucesso: '1, 2, 3, 4… meta! Comparar números é saber qual é maior.',
      extensao: 'E se a meta fosse 10 e o ecrã mostrasse quantos passos faltam?',
      gambiarra: {
        xml: prog(AG(seq(mudar('passos', 1), se(cmp('>=', V('A', vr('passos')), N('B', 50)), [icone('Happy')], [numero(vr('passos'))])))),
        pedido: 'Já agitei não sei quantas vezes e a festa nunca chega! Encontras a gambiarra?',
      },
    },
  };

  const CRONOMETRO = {
    titulo: 'Cronómetro',
    missao: 'O A arranca o cronómetro, o B mostra quantos segundos passaram.',
    passos: ['No A: «definir medida para» tempo de execução.', 'No B: mostrar (tempo − medida) ÷ 1000.', 'Conta até 3 entre o A e o B.'],
    material: 'micro:bit',
    novos: ['mk_tempo', 'mt_definir_medida', 'mt_var_medida', 'mt_conta_menos', 'mt_conta_div'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => {
      let tA = null, n = 0;
      for (const s of segs(r)) {
        if (s.v === 'botao:A') tA = s.t;
        else if (s.v === 'botao:B') {
          const ns = nums(s.outs);
          if (tA === null || !ns.length) return false;
          if (Math.abs(ultimo(ns) - (s.t - tA) / 1000) > 0.5) return false;
          n++;
        }
      }
      return n >= 1;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'O micro:bit tem um relógio por dentro que conta milissegundos. Vamos fazer um cronómetro!'],
      parecePronto: a => dentro(evA(a), 'mk_var_definir', 'mk_tempo') &&
        blocos(evB(a), 'mk_mostrar_numero').some(p => temOp(p, '/') && temOp(p, '-') && usa(p).some(u => u.tipo === 'mk_tempo') && varsDe(p).length),
      testar: 'Tens uma ideia? Vamos testar! Carrega no A, conta até 3, carrega no B.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão dá a partida?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_definir', 'Para medir, o que tens de guardar quando começas?'), { id: 'a_sem_definir' }),
        Object.assign(P.valorEm('botao:A', 'mk_var_definir', 'mk_tempo', 'Guardas o quê na medida? A hora a que começaste…'), { id: 'sem_tempo_inicio' }),
        Object.assign(P.evento('botao:B', 'E para parar e ver o tempo, carregas em quê?'), { id: 'sem_b' }),
        Object.assign(P.bloco('botao:B', 'mk_mostrar_numero', 'O B já está à escuta. O que mostra ele?'), { id: 'b_sem_mostrar' }),
        P.regra('b_sem_tempo', a => blocos(evB(a), 'mk_mostrar_numero').length > 0 && !blocos(evB(a), 'mk_mostrar_numero').some(p => usa(p).some(u => u.tipo === 'mk_tempo')), [
          'Para saber quanto passou, o que tens de comparar com o início?',
          'O tempo de agora menos o tempo do início dá a duração.',
          'Mostra «tempo de execução − medida».',
        ], 'Agora comparas o agora com o início!'),
        P.regra('ordem', a => blocos(evB(a), 'mk_mostrar_numero').some(p => {
          const u = usa(p), i = u.findIndex(x => x.tipo === 'mk_conta' && x.op === '-');
          return i >= 0 && u[i + 1] && u[i + 1].tipo === 'mk_var';
        }), [
          ['surpreendida', 'Deu um número negativo? Qual é maior: o tempo agora ou o tempo do início?'],
          'Na subtração, o maior vem primeiro.',
          'Faz «tempo de execução − medida», por esta ordem.',
        ], 'Agora dá positivo!'),
        P.regra('sem_divisao', a => blocos(evB(a), 'mk_mostrar_numero').some(p => usa(p).some(u => u.tipo === 'mk_tempo')) &&
          !blocos(evB(a), 'mk_mostrar_numero').some(p => temOp(p, '/') && numsDe(p).includes(1000)), [
          'Deu 3000? O micro:bit conta em milissegundos. Quantos milissegundos tem um segundo?',
          'Para passar de milissegundos a segundos, divide-se.',
          'Põe a subtração dentro de uma conta «÷ 1000».',
        ], 'Segundos certinhos!'),
      ],
      sucesso: 'Cronómetro pronto! Duração = fim − início. E 1000 milissegundos fazem 1 segundo.',
      extensao: 'Quem consegue contar 10 segundos de olhos fechados? O cronómetro diz quem chegou mais perto.',
      gambiarra: {
        xml: prog(BA(seq(definir('medida', '<block type="mk_tempo"></block>'))),
          BB(seq(numero(conta(V('A', conta(V('A', vr('medida')), '-', V('B', '<block type="mk_tempo"></block>'))), '/', N('B', 1000)))))),
        pedido: 'O meu cronómetro diz que passaram menos 3 segundos! Encontras a gambiarra?',
      },
    },
  };

  const POTENCIAS = {
    titulo: 'Potências de 2',
    missao: 'Começa no 1 e dobra 6 vezes seguidas: 1, 2, 4, 8, 16, 32. Que depressa cresce!',
    passos: ['No A: contador a 1 e «repetir 6 vezes».', 'Lá dentro: mostrar o contador e «definir contador para» contador × 2.', 'Carrega no A e conta os saltos.'],
    material: 'micro:bit',
    novos: ['mk_repetir'],
    caixa: ['mk_botao', 'mk_var_definir', 'mk_var', 'mt_conta_vezes', 'mk_mostrar_numero', 'mk_pausa'],
    teste: 'botao:A',
    ok: r => causou(r, s => nums(s).join(',').includes('1,2,4,8,16'), v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', 'Uma lenda conta que um rei pagou com grãos de arroz: 1, depois 2, depois 4… Quanto cresce isto?'],
      parecePronto: a => {
        const pl = evA(a)?.plano || [];
        return pl.some(p => p.tipo === 'mk_var_definir' && p.prof === 0 && p.n === 1) && pl.some(p => p.tipo === 'mk_repetir') &&
          pl.some(p => p.tipo === 'mk_var_definir' && p.prof > 0 && temOp(p, '*')) && pl.some(p => p.tipo === 'mk_mostrar_numero' && p.prof > 0);
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão começa a dobrar?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_repetir', 'São 6 dobras seguidas. Como repetes sem escrever 6 vezes?'), { id: 'sem_repetir' }),
        P.regra('comeco', a => !(evA(a)?.plano || []).some(p => p.tipo === 'mk_var_definir' && p.prof === 0 && p.n === 1), [
          'Dobrar o 0 dá…? De que número começas?',
          'Antes do «repetir», o contador tem de começar em 1.',
          'Põe «definir contador para 1» por cima do «repetir».',
        ], 'Começa no 1!'),
        P.regra('sem_dobro', a => !(evA(a)?.plano || []).some(p => p.tipo === 'mk_var_definir' && p.prof > 0 && temOp(p, '*') && numsDe(p).includes(2) && varsDe(p).length), [
          'Em cada volta o número dobra. Dobrar é multiplicar por quanto?',
          'Dentro do «repetir», dá ao contador um valor novo com uma conta.',
          'Dentro do «repetir»: «definir contador para» contador × 2.',
        ], 'Dobra a cada volta!'),
        P.regra('mostra_fora', a => (evA(a)?.plano || []).some(p => p.tipo === 'mk_repetir') && !(evA(a)?.plano || []).some(p => p.tipo === 'mk_mostrar_numero' && p.prof > 0), [
          'Só vês o último número? Como vês todos os saltos?',
          'O «mostrar número» tem de estar dentro do «repetir».',
          'Mete «mostrar número» com o contador dentro do «repetir», antes da conta.',
        ], 'Agora vês cada salto!'),
      ],
      sucesso: '1, 2, 4, 8, 16, 32! São potências de 2. Ao fim de 10 dobras já passavas de 1000!',
      extensao: 'E se fosse ×3? Que números aparecem? Qual chega primeiro a 100?',
      gambiarra: {
        xml: prog(BA(seq(definirN('contador', 0), repetir(6, numero(vr('contador')), definir('contador', conta(V('A', vr('contador')), '*', N('B', 2))))))),
        pedido: 'Dobro, dobro, dobro… e dá sempre 0! Encontras a gambiarra?',
      },
    },
  };

  const MAIOR = {
    titulo: 'O maior dado',
    missao: 'Dois dados de uma vez: o micro:bit mostra os dois e depois o maior.',
    passos: ['No A: contador e pontos ao acaso de 1 a 6; mostra os dois.', '«se contador > pontos então» mostra contador, «senão» mostra pontos.', 'Carrega várias vezes e confere.'],
    material: 'micro:bit',
    novos: ['mk_comparar'],
    caixa: ['mk_botao', 'mk_var_definir', 'mt_definir_pontos', 'mk_var', 'mt_var_pontos', 'mk_aleatorio', 'mk_mostrar_numero', 'mk_pausa', 'mk_se_senao'],
    teste: 'botao:A',
    ok: r => {
      let n = 0, dif = false;
      for (const s of segs(r)) {
        if (s.v !== 'botao:A') continue;
        const ns = nums(s.outs);
        if (ns.length < 3) return false;
        const [x, y, m] = ns.slice(-3);
        if (m !== Math.max(x, y)) return false;
        if (x !== y) dif = true;
        n++;
      }
      return n >= 3 && dif;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Jogo dos dois dados: ganha o maior! O micro:bit lança, mostra e escolhe.'],
      parecePronto: a => {
        const s = blocos(evA(a), 'mk_se')[0];
        if (!s || comAcaso(evA(a)).length < 2) return false;
        const u = usa(s), i = u.findIndex(x => x.tipo === 'mk_comparar');
        if (i < 0) return false;
        const [X, Y] = u.slice(i + 1).filter(x => x.tipo === 'mk_var').map(x => x.var), op = u[i].op;
        const esperado = op === '>' || op === '>=' ? X : op === '<' || op === '<=' ? Y : null;
        return !!esperado && mostraVar(s.sim)[0] === esperado;
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A três vezes e confere.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão lança os dados?'), { id: 'sem_a' }),
        P.regra('dois_dados', a => comAcaso(evA(a)).length < 2, [
          'São dois dados. Quantos números ao acaso precisas?',
          'Cada dado é uma variável com «escolher ao acaso de 1 até 6».',
          'Define o contador e os pontos ao acaso, de 1 até 6.',
        ], 'Dois dados lançados!'),
        P.regra('mostra_dados', a => (evA(a)?.plano || []).filter(p => p.tipo === 'mk_mostrar_numero' && p.prof === 0).length < 2, [
          'Antes de dizer qual é o maior, como ficas a saber os dois?',
          'Mostra cada dado, com uma pausa entre eles.',
          'Antes do «se»: mostra o contador, pausa, mostra os pontos.',
        ], 'Agora vês os dois dados!'),
        Object.assign(P.bloco('botao:A', 'mk_se', 'Como é que o micro:bit escolhe qual dos dois mostra?'), { id: 'sem_se' }),
        Object.assign(P.valorEm('botao:A', 'mk_se', 'mk_comparar', 'Como se descobre qual de dois números é o maior?'), { id: 'sem_comparar' }),
        P.regra('trocado', a => blocos(evA(a), 'mk_se').some(s => {
          const u = usa(s), i = u.findIndex(x => x.tipo === 'mk_comparar');
          if (i < 0) return false;
          const [X, Y] = u.slice(i + 1).filter(x => x.tipo === 'mk_var').map(x => x.var), op = u[i].op;
          const esperado = op === '>' || op === '>=' ? X : op === '<' || op === '<=' ? Y : null;
          const m = mostraVar(s.sim)[0];
          return esperado && m && m !== esperado;
        }), [
          ['surpreendida', 'Saiu 5 e 2… e ganhou o 2? Lê a condição em voz alta.'],
          '«então» corre quando a condição é verdadeira: «contador > pontos» quer dizer que o contador é o maior.',
          'Em «então» mostra o contador; em «senão», os pontos.',
        ], 'Ganha mesmo o maior!'),
      ],
      sucesso: 'Comparar dois números e escolher o maior: é o que fazem os árbitros… e os computadores!',
      extensao: 'E se fossem três dados? Pista: compara primeiro dois, e o maior com o terceiro.',
      gambiarra: {
        xml: prog(BA(seq(definir('contador', acaso(1, 6)), definir('pontos', acaso(1, 6)), numero(vr('contador')), pausa(300), numero(vr('pontos')), pausa(300),
          se(cmp('&gt;', V('A', vr('contador')), V('B', vr('pontos'))), [numero(vr('pontos'))], [numero(vr('contador'))])))),
        pedido: 'No meu jogo ganha sempre o mais pequeno! Encontras a gambiarra?',
      },
    },
  };

  const ADIVINHA = {
    titulo: 'Adivinha o número',
    missao: 'Agita: o micro:bit esconde um número de 1 a 5. O A muda o teu palpite; o B diz se acertaste.',
    passos: ['«em agitar»: «definir medida para» escolher ao acaso de 1 até 5.', 'A: mudar contador em 1 e mostrar contador (o teu palpite).', 'B: «se contador = medida» ✔ «senão» ✗.'],
    material: 'micro:bit',
    novos: ['mt_definir_medida', 'mt_var_medida'],
    caixa: ['mk_agitar', 'mk_botao', 'mk_botao_B', 'mk_var_mudar', 'mk_var', 'mk_aleatorio', 'mk_mostrar_numero', 'mk_se_senao', 'mt_comparar_igual', 'mk_icone_sim', 'mk_icone_nao'],
    teste: 'botao:B',
    ok: r => {
      let n = 0, acertou = false;
      for (const s of segs(r)) {
        if (s.v !== 'botao:B') continue;
        const ic = s.outs.filter(v => v === 'icone:Yes' || v === 'icone:No');
        if (!ic.length || s.vars.medida === undefined) return false;
        const certo = (s.vars.contador ?? 0) === s.vars.medida;
        if ((ultimo(ic) === 'icone:Yes') !== certo) return false;
        if (certo) acertou = true;
        n++;
      }
      return n >= 2 && acertou;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Jogo de adivinhar! O micro:bit pensa num número e não diz. Consegues descobri-lo?'],
      parecePronto: a => {
        const s = blocos(evB(a), 'mk_se')[0];
        return comAcaso(a.evento('agitar')).length > 0 && blocos(evA(a), 'mk_var_mudar').length > 0 && !!s &&
          new Set(varsDe(s)).size >= 2 && icDe(s.sim).includes('Yes');
      },
      testar: 'Tens uma ideia? Vamos testar! Agita, depois A e B até acertares.',
      regras: [
        Object.assign(P.evento('agitar', 'Como é que começa o jogo? O micro:bit tem de pensar num número…'), { id: 'sem_agitar' }),
        P.regra('sem_segredo', a => comAcaso(a.evento('agitar')).length === 0, [
          'Onde é que o micro:bit esconde o número secreto?',
          'O segredo é uma variável que recebe um número ao acaso.',
          'Em «em agitar»: «definir medida para» escolher ao acaso de 1 até 5.',
        ], 'Segredo escondido!'),
        Object.assign(P.evento('botao:A', 'Como mudas o teu palpite?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'O teu palpite tem de mudar: 1, 2, 3… O que faz o contador crescer?'), { id: 'a_sem_mudar' }),
        Object.assign(P.evento('botao:B', 'Já tens um palpite. Como perguntas se acertaste?'), { id: 'sem_b' }),
        Object.assign(P.bloco('botao:B', 'mk_se', 'Como é que o micro:bit decide se acertaste?'), { id: 'sem_se' }),
        Object.assign(P.valorEm('botao:B', 'mk_se', 'mk_comparar', 'Acertar quer dizer que dois números são… iguais! Como se compara?'), { id: 'sem_comparar' }),
        P.regra('compara_errado', a => blocos(evB(a), 'mk_se').some(s => {
          const v = new Set(varsDe(s));
          return usa(s).some(u => u.tipo === 'mk_comparar') && !(v.has('contador') && v.has('medida'));
        }), [
          'Comparas o teu palpite com quem?',
          'Numa ponta da comparação o palpite (contador), na outra o segredo (medida).',
          'Faz «contador = medida».',
        ], 'Palpite contra segredo!'),
      ],
      sucesso: 'Acertaste! Comparar o palpite com o segredo: é assim que funcionam os jogos de adivinhar.',
      extensao: 'E se o B dissesse «maior» ou «menor»? Assim adivinhavas números de 1 a 100!',
      gambiarra: {
        xml: prog(AG(seq(definir('medida', acaso(1, 5)))), BA(seq(mudar('contador', 1), numero(vr('contador')))),
          BB(seq(se(cmp('==', V('A', vr('contador')), V('B', vr('pontos'))), [icone('Yes')], [icone('No')])))),
        pedido: 'Já tentei todos os números e nunca acerto! Encontras a gambiarra?',
      },
    },
  };

  // =============================================================== desafios complexos (7–11 de cada nível)
  // Projetos de 15–20 minutos: várias partes a juntar; só ficam feitos quando o projeto inteiro funciona.
  const tempoB = '<block type="mk_tempo"></block>';
  const mudarV = (k, inner) => I('mk_var_mudar', `<field name="VAR">${k}</field>` + V('V', inner));
  const texto = t => I('mk_mostrar_texto', `<value name="T"><shadow type="mk_texto"><field name="TXT">${t}</field></shadow></value>`);
  const acenderV = (x, y) => I('mk_acender', V('X', x) + V('Y', y));
  const grafico = (inner, max) => I('mk_grafico', V('V', inner) + N('MAX', max));
  const pausaV = inner => I('mk_pausa', V('MS', inner));
  const restoX = (a, b) => `<block type="mk_resto">${a}${b}</block>`;
  const VA = k => V('A', vr(k)), VB = k => V('B', vr(k));

  // Linha do tempo: cada entrada com as saídas que vieram a seguir; acompanha o valor das variáveis
  // (vi = à entrada, vf = no fim) e o momento em que cada variável mudou pela última vez (quando).
  function linha(reg) {
    const out = []; let cur = null; const vars = {}, quando = {};
    for (const e of reg) {
      if (e.dir === 'in') { cur = { v: e.v, t: e.t, outs: [], vi: Object.assign({}, vars), qi: Object.assign({}, quando) }; out.push(cur); continue; }
      if (e.v.startsWith('var:')) { const p = e.v.split(':'); vars[p[1]] = Number(p[2]); quando[p[1]] = e.t; }
      if (cur) { cur.outs.push({ v: e.v, t: e.t, vars: Object.assign({}, vars), quando: Object.assign({}, quando) }); }
    }
    for (const s of out) { s.vf = s.outs.length ? s.outs[s.outs.length - 1].vars : Object.assign({}, s.vi); }
    return out;
  }
  const numsO = s => s.outs.filter(o => o.v.startsWith('numero:')).map(o => Number(o.v.slice(7)));
  const ecraO = s => s.outs.filter(o => o.v.startsWith('numero:') || o.v.startsWith('texto:'))
    .map(o => o.v.startsWith('numero:') ? Number(o.v.slice(7)) : o.v.slice(6).toUpperCase());
  const varMudou = (s, k) => s.outs.some(o => o.v.startsWith('var:' + k + ':'));
  // ajudas para as regras
  const defs = (ev, k) => blocos(ev, 'mk_var_definir').filter(p => p.var === k);
  const muds = (ev, k) => blocos(ev, 'mk_var_mudar').filter(p => p.var === k);
  const mostraK = (ev, k) => blocos(ev, 'mk_mostrar_numero').some(p => varsDe(p).includes(k));
  const temAcaso = p => usa(p).some(u => u.tipo === 'mk_aleatorio');
  const evAB = a => a.evento('botao:AB'), evAg = a => a.evento('agitar'), evIni = a => a.evento('inicio');
  // os «se» do evento (também dentro de ciclos), com os ramos então (sim) e senão (nao)
  function ses(ev) {
    const r = [];
    const andar = l => (l || []).forEach(d => { if (d.tipo === 'mk_se' || d.tipo === 'mk_se_entao') r.push(d); andar(d.corpo); andar(d.sim); andar(d.nao); });
    if (ev) andar(ev.seq);
    return r;
  }
  const planoDe = l => { const acc = []; const andar = x => (x || []).forEach(d => { acc.push(d); andar(d.corpo); andar(d.sim); andar(d.nao); }); andar(l); return acc; };
  const compara = (s, op) => usa(s).some(u => u.tipo === 'mk_comparar' && (!op || u.op === op));
  // limites [de, até] de um «escolher ao acaso» dentro de qualquer bloco
  function limitesU(p) {
    const u = usa(p), i = u.findIndex(x => x.tipo === 'mk_aleatorio');
    if (i < 0) return null;
    const n = u.slice(i + 1).filter(x => x.tipo === 'mk_num').slice(0, 2).map(x => x.n);
    return n.length === 2 ? n : null;
  }

  // ---------------------------------------------------------------- Nível 1 · 7 · Duelo de dados
  const DUELO = {
    titulo: 'Duelo de dados',
    missao: 'Dois jogadores, dois dados: o A lança o teu, o B o do teu amigo, e o A+B mostra os dois para ver quem ganhou.',
    passos: [
      'No A: «definir contador para» escolher ao acaso de 1 até 6, e mostra o contador.',
      'No B: o mesmo, mas com a variável pontos.',
      'No A+B: mostra o contador, uma pausa, e depois os pontos.',
      'Joga 3 rondas com um amigo: quem tiver o número maior ganha a ronda!',
    ],
    material: 'micro:bit e um amigo',
    novos: ['mt_definir_pontos', 'mk_botao_AB'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_definir', 'mk_var', 'mt_var_pontos', 'mk_aleatorio', 'mk_mostrar_numero', 'mk_pausa'],
    teste: 'botao:A',
    // A e B mostram um dado (1–6); o A+B mostra exatamente os dois últimos, pela ordem. O acaso tem de variar.
    ok: r => {
      let ultA = null, ultB = null, rondas = 0; const vistos = new Set();
      for (const s of segs(r)) {
        if (!s.outs.length) continue;   // carregou-se enquanto o botão ainda estava ocupado: o micro:bit ignora
        const ns = nums(s.outs);
        if (s.v === 'botao:A') { if (!ns.length) return false; ultA = ultimo(ns); if (ultA < 1 || ultA > 6) return false; vistos.add(ultA); }
        else if (s.v === 'botao:B') { if (!ns.length) return false; ultB = ultimo(ns); if (ultB < 1 || ultB > 6) return false; }
        else if (s.v === 'botao:AB') { if (ultA === null || ultB === null) continue; if (ns.length < 2 || ns[0] !== ultA || ns[1] !== ultB) return false; rondas++; }
      }
      return rondas >= 2 && vistos.size >= 2;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Duelo de dados! Cada jogador tem o seu botão e o seu dado. No fim, o A+B mostra os dois para tirar teimas.'],
      parecePronto: a => defs(evA(a), 'contador').some(temAcaso) && mostraK(evA(a), 'contador') &&
        defs(evB(a), 'pontos').some(temAcaso) && mostraK(evB(a), 'pontos') && mostraK(evAB(a), 'contador') && mostraK(evAB(a), 'pontos'),
      testar: 'Tens uma ideia? Vamos testar! A, B e depois A+B — três rondas.',
      regras: [
        Object.assign(P.evento('botao:A', 'Cada jogador lança com um botão. Qual é o do primeiro jogador?'), { id: 'sem_a' }),
        P.regra('a_sem_dado', a => !!evA(a) && !defs(evA(a), 'contador').some(temAcaso), [
          'O dado tem de ser guardado para o mostrar outra vez no fim. Onde o guardas?',
          'Guarda o dado numa variável: «definir contador para» escolher ao acaso.',
          'No A: «definir contador para» escolher ao acaso de 1 até 6.',
        ], 'Dado guardado!'),
        P.regra('limites', a => [...defs(evA(a), 'contador'), ...defs(evB(a), 'pontos')].some(p => { const l = limitesU(p); return l && (l[0] !== 1 || l[1] !== 6); }), [
          'Um dado de verdade tem que números?',
          'Os dois números do «escolher ao acaso» são o mais pequeno e o maior.',
          'Escreve de 1 até 6, nos dois dados.',
        ], 'Dados honestos!'),
        P.regra('a_sem_mostrar', a => defs(evA(a), 'contador').some(temAcaso) && !mostraK(evA(a), 'contador'), [
          'Lançaste o dado… mas o jogador vê o quê?',
          'Depois de guardar, mostra a variável.',
          'No A, por baixo: «mostrar número» com o bloco «contador».',
        ], 'Já se vê o dado!'),
        Object.assign(P.evento('botao:B', 'E o segundo jogador, lança com que botão?'), { id: 'sem_b' }),
        P.regra('b_mesma_var', a => defs(evB(a), 'contador').length > 0 && !defs(evB(a), 'pontos').length, [
          ['surpreendida', 'Os dois dados guardados no mesmo sítio? Então o do primeiro jogador desaparece!'],
          'Cada dado precisa da sua variável.',
          'No B, carrega na setinha do «definir» e escolhe «pontos».',
        ], 'Cada dado no seu sítio!'),
        P.regra('b_sem_dado', a => !!evB(a) && !defs(evB(a), 'pontos').some(temAcaso), [
          'O segundo jogador também precisa de um dado. Como?',
          'Igual ao A, mas guardado na variável pontos.',
          'No B: «definir pontos para» escolher ao acaso de 1 até 6, e mostra os pontos.',
        ], 'Segundo dado pronto!'),
        Object.assign(P.evento('botao:AB', 'Para tirar teimas no fim da ronda, que botão mostra os dois dados?'), { id: 'sem_ab' }),
        P.regra('ab_dois', a => !(mostraK(evAB(a), 'contador') && mostraK(evAB(a), 'pontos')), [
          'O A+B mostra os dois dados? Quem ganhou?',
          'Precisas de dois «mostrar número»: o contador e os pontos.',
          'No A+B: mostra o contador, uma pausa, e mostra os pontos.',
        ], 'Agora vê-se quem ganhou!'),
      ],
      sucesso: 'Duelo pronto! As variáveis guardaram os dados para os mostrares outra vez no fim.',
      extensao: 'E se o A+B mostrasse também a diferença entre os dois dados? (Precisas de uma conta… no nível 2!)',
      gambiarra: {
        xml: prog(BA(seq(definir('contador', acaso(1, 6)), numero(vr('contador')))), BB(seq(definir('pontos', acaso(1, 6)), numero(vr('pontos')))),
          BAB(seq(numero(vr('contador')), pausa(500), numero(vr('contador'))))),
        pedido: 'No fim da ronda os dois dados são sempre iguais. Empate, empate, empate… Encontras a gambiarra?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 1 · 8 · Saltos na reta
  const RETA = {
    titulo: 'Saltos na reta',
    missao: 'Uma reta numérica no micro:bit: o A dá um passo de 1, o B um salto de 10, o A+B volta ao zero.',
    passos: [
      'No A: «mudar contador em 1» e mostra o contador.',
      'No B: «mudar contador em 10» e mostra o contador.',
      'No A+B: «definir contador para 0» e mostra-o.',
      'Desafio: chega ao 23 com o menor número de toques. Quantos usaste?',
    ],
    material: 'micro:bit (e uma reta numérica desenhada no chão, se quiseres saltar também)',
    novos: ['mt_mudar_dez'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_botao_AB', 'mk_var_mudar', 'mk_var_definir', 'mk_var', 'mk_mostrar_numero'],
    teste: 'botao:B',
    ok: r => {
      let x = 0, a = 0, b = 0, z = 0;
      for (const s of segs(r)) {
        if (!s.outs.length) continue;
        const ns = nums(s.outs);
        if (s.v === 'botao:A') { x += 1; if (ultimo(ns) !== x) return false; a++; }
        else if (s.v === 'botao:B') { x += 10; if (ultimo(ns) !== x) return false; b++; }
        else if (s.v === 'botao:AB') { x = 0; if (ultimo(ns) !== 0) return false; z++; }
      }
      return a >= 2 && b >= 2 && z >= 1;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Numa reta numérica podes andar de 1 em 1… ou saltar de 10 em 10! Vamos fazer uma no micro:bit.'],
      parecePronto: a => muds(evA(a), 'contador').some(p => p.n === 1) && mostraK(evA(a), 'contador') &&
        muds(evB(a), 'contador').some(p => p.n === 10) && mostraK(evB(a), 'contador') && defs(evAB(a), 'contador').some(p => p.n === 0) && mostraK(evAB(a), 'contador'),
      testar: 'Tens uma ideia? Vamos testar! A, B, B, A… e A+B para voltar ao zero.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão dá o passinho de 1?'), { id: 'sem_a' }),
        P.regra('a_passo', a => !!evA(a) && !muds(evA(a), 'contador').some(p => p.n === 1), [
          'Um passo pequenino na reta: o contador anda quanto?',
          'O «mudar contador em» faz andar o contador.',
          'No A: «mudar contador em 1».',
        ], 'Passo de 1!'),
        Object.assign(P.evento('botao:B', 'E o salto grande, de que botão é?'), { id: 'sem_b' }),
        P.regra('b_salto', a => !!evB(a) && !muds(evB(a), 'contador').some(p => p.n === 10), [
          'O salto grande tem o tamanho de quantos passinhos?',
          'O B também usa «mudar contador em», mas com um número maior.',
          'No B: «mudar contador em 10».',
        ], 'Salto de 10!'),
        Object.assign(P.evento('botao:AB', 'Como voltas ao início da reta?'), { id: 'sem_ab' }),
        P.regra('ab_zero', a => !!evAB(a) && !defs(evAB(a), 'contador').some(p => p.n === 0), [
          'Voltar ao início da reta é ir para que número?',
          '«mudar» anda um bocado; «definir» põe o contador num número certinho.',
          'No A+B: «definir contador para 0».',
        ], 'De volta ao zero!'),
        P.regra('sem_mostrar', a => [evA(a), evB(a), evAB(a)].some(e => e && !mostraK(e, 'contador')), [
          'Andaste na reta… mas onde estás agora?',
          'Cada botão tem de mostrar o contador depois de andar.',
          'Põe «mostrar número» com o bloco «contador» no fim do A, do B e do A+B.',
        ], 'Já se vê onde estás!'),
      ],
      sucesso: 'Reta numérica pronta! Um salto de 10 vale 10 passos de 1 — é por isso que escrevemos dezenas e unidades.',
      extensao: 'Inventa um botão que volta 1 para trás (agitar?). Consegues chegar ao 19 só com saltos para a frente e para trás?',
      gambiarra: {
        xml: prog(BA(seq(mudar('contador', 1), numero(vr('contador')))), BB(seq(mudar('contador', 1), numero(vr('contador')))),
          BAB(seq(definirN('contador', 0), numero(vr('contador'))))),
        pedido: 'O meu salto de 10 só anda 1! Para chegar ao 23 tenho de carregar 23 vezes… Encontras a gambiarra?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 1 · 9 · De 5 em 5
  const CINCO = {
    titulo: 'De 5 em 5',
    missao: 'Conta de 5 em 5 até 30, como quem conta mãos cheias de dedos, e diz quantos saltos deste.',
    passos: [
      'No A: «definir contador para 0» e «definir passos para 0».',
      'Depois «repetir 6 vezes»: muda o contador em 5, muda os passos em 1, mostra o contador e faz uma pausa.',
      'No fim, a cara contente.',
      'No B: mostra os passos. Antes de carregar, adivinha o número que vai aparecer!',
    ],
    material: 'micro:bit (e as mãos da turma, para contar 5 dedos de cada vez)',
    novos: ['mt_definir_passos', 'mt_mudar_passos', 'mt_var_passos'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_repetir', 'mk_mostrar_numero', 'mk_pausa', 'mk_icone'],
    teste: 'botao:A',
    // cada A conta 5, 10, …, 30 e acaba na cara contente; o B a seguir mostra 6 (os saltos dessa contagem)
    ok: r => {
      let boasA = 0, boasB = 0, ultimoA = false;
      for (const s of segs(r)) {
        if (s.v === 'botao:A') {
          const ns = nums(s.outs);
          const ok = ns.join(',') === '5,10,15,20,25,30' && s.outs.lastIndexOf('icone:Happy') > s.outs.lastIndexOf('numero:30');
          if (!ok) return false;
          boasA++; ultimoA = true;
        } else if (s.v === 'botao:B') {
          if (!ultimoA) continue;
          if (ultimo(nums(s.outs)) !== 6) return false;
          boasB++;
        }
      }
      return boasA >= 2 && boasB >= 2;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Cinco dedos numa mão, dez em duas… Vamos contar de 5 em 5, e contar também quantos saltos demos!'],
      parecePronto: a => {
        const e = evA(a);
        return defs(e, 'contador').some(p => p.n === 0) && defs(e, 'passos').some(p => p.n === 0) && blocos(e, 'mk_repetir').some(p => p.n === 6) &&
          muds(e, 'contador').some(p => p.n === 5 && p.prof > 0) && muds(e, 'passos').some(p => p.prof > 0) && tem(e, 'mk_icone') && mostraK(evB(a), 'passos');
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A, espera pela cara contente, e depois no B. Faz isto duas vezes.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão começa a contagem?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_repetir', 'São 6 saltos. Vais escrever tudo 6 vezes?'), { id: 'sem_repetir' }),
        P.regra('salto_cinco', a => blocos(evA(a), 'mk_repetir').length > 0 && !muds(evA(a), 'contador').some(p => p.n === 5), [
          'De quanto em quanto conta esta contagem?',
          'O número do «mudar contador em» é o tamanho do salto.',
          'Dentro do «repetir»: «mudar contador em 5».',
        ], 'Saltos de 5!'),
        P.regra('sem_reset', a => muds(evA(a), 'contador').length > 0 && !defs(evA(a), 'contador').some(p => p.n === 0 && p.prof === 0), [
          'Carregas outra vez no A… a contagem recomeça no 5, ou continua de onde ficou?',
          'Antes de contar, o contador tem de voltar ao início.',
          'No início do A, antes do «repetir»: «definir contador para 0».',
        ], 'Recomeça sempre do início!'),
        P.regra('sem_mostrar', a => blocos(evA(a), 'mk_repetir').length > 0 && !blocos(evA(a), 'mk_mostrar_numero').some(p => p.prof > 0 && varsDe(p).includes('contador')), [
          'A contagem acontece… às escondidas. Como a vês, salto a salto?',
          'O «mostrar número» tem de ficar dentro do «repetir», para aparecer em cada volta.',
          'Dentro do «repetir», depois do «mudar»: «mostrar número» com o «contador».',
        ], 'Já se vê cada salto!'),
        P.regra('poucas_vezes', a => blocos(evA(a), 'mk_repetir').some(p => p.n !== 6), [
          'De 5 em 5 até 30: quantos saltos são?',
          'O número do «repetir» é quantos saltos dás.',
          'Escreve 6 no «repetir … vezes».',
        ], 'Seis saltos, até ao 30!'),
        P.regra('sem_passos', a => blocos(evA(a), 'mk_repetir').length > 0 && !muds(evA(a), 'passos').some(p => p.prof > 0), [
          'Quem conta os saltos? A cada volta do «repetir», é mais um salto…',
          'Precisas de outra variável que cresce 1 em cada volta.',
          'Dentro do «repetir»: «mudar passos em 1».',
        ], 'Os saltos estão contados!'),
        P.regra('passos_sem_reset', a => muds(evA(a), 'passos').length > 0 && !defs(evA(a), 'passos').some(p => p.n === 0), [
          'Na segunda contagem, os saltos voltam a ser 6… ou ficam 12?',
          'Os passos também têm de voltar ao início no A.',
          'No início do A: «definir passos para 0».',
        ], 'Seis de cada vez!'),
        Object.assign(P.bloco('botao:A', 'mk_icone', 'Chegaste ao 30! Como festejas no fim?'), { id: 'sem_fim' }),
        Object.assign(P.evento('botao:B', 'E para saber quantos saltos deste, carregas em quê?'), { id: 'sem_b' }),
        P.regra('b_mostra', a => !!evB(a) && !mostraK(evB(a), 'passos'), [
          'O B tem de mostrar os saltos. Em que variável estão?',
          'Os saltos estão guardados nos passos.',
          'No B: «mostrar número» com o bloco «passos».',
        ], 'Seis saltos!'),
      ],
      sucesso: '5, 10, 15, 20, 25, 30 — seis saltos de 5! Contar de 5 em 5 é a tabuada do 5 a andar.',
      extensao: 'E se contasses de 5 em 5 até 50? Quantos saltos são? Adivinha antes de experimentar.',
      gambiarra: {
        xml: prog(BA(seq(definirN('passos', 0), repetir(6, mudar('contador', 5), mudar('passos', 1), numero(vr('contador')), pausa(200)), icone('Happy'))),
          BB(seq(numero(vr('passos'))))),
        pedido: 'A minha contagem de 5 em 5 só funciona à primeira! À segunda começa no 35… Encontras a gambiarra?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 1 · 10 · Sorteio da turma
  const SORTEIO = {
    titulo: 'Sorteio da turma',
    missao: 'Na turma há 25 alunos: o A sorteia um número de 1 a 25, o B repete-o para quem não viu e o A+B diz quantos sorteios já se fizeram.',
    passos: [
      'No A: «definir pontos para» escolher ao acaso de 1 até 25, «mudar passos em 1» e mostra os pontos.',
      'No B: mostra outra vez os pontos (sem sortear de novo!).',
      'No A+B: mostra os passos.',
      'Faz 4 sorteios: saiu algum número repetido?',
    ],
    material: 'micro:bit e a lista da turma com números',
    novos: ['mt_definir_pontos'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_botao_AB', 'mk_var_definir', 'mk_var_mudar', 'mt_mudar_passos', 'mk_var', 'mt_var_pontos', 'mt_var_passos', 'mk_aleatorio', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => {
      let n = 0, ult = null, boasB = 0, boasAB = 0; const vistos = new Set();
      for (const s of segs(r)) {
        if (!s.outs.length) continue;
        const ns = nums(s.outs);
        if (s.v === 'botao:A') { if (!ns.length) return false; ult = ultimo(ns); if (ult < 1 || ult > 25) return false; vistos.add(ult); n++; }
        else if (s.v === 'botao:B') { if (ult === null) continue; if (ultimo(ns) !== ult) return false; boasB++; }
        else if (s.v === 'botao:AB') { if (ultimo(ns) !== n) return false; boasAB++; }
      }
      return n >= 4 && vistos.size >= 2 && boasB >= 1 && boasAB >= 1;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Quem vai ao quadro? O micro:bit sorteia! E não se esquece do número, nem de quantos sorteios já fez.'],
      parecePronto: a => defs(evA(a), 'pontos').some(temAcaso) && muds(evA(a), 'passos').length > 0 && mostraK(evA(a), 'pontos') &&
        mostraK(evB(a), 'pontos') && !blocos(evB(a), 'mk_var_definir').length && mostraK(evAB(a), 'passos'),
      testar: 'Tens uma ideia? Vamos testar! Quatro sorteios com o A, depois o B e o A+B.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão faz o sorteio?'), { id: 'sem_a' }),
        P.regra('a_sem_sorteio', a => !!evA(a) && !defs(evA(a), 'pontos').some(temAcaso), [
          'O número sorteado tem de ficar guardado para o B o repetir. Onde?',
          'Guarda o sorteio numa variável, com «escolher ao acaso».',
          'No A: «definir pontos para» escolher ao acaso de 1 até 25.',
        ], 'Sorteio guardado!'),
        P.regra('limites', a => defs(evA(a), 'pontos').some(p => { const l = limitesU(p); return l && (l[0] !== 1 || l[1] !== 25); }), [
          'Há 25 alunos. Que números podem sair?',
          'O «escolher ao acaso» vai do mais pequeno ao maior.',
          'Escreve de 1 até 25.',
        ], 'Todos têm a mesma sorte!'),
        P.regra('a_sem_contar', a => defs(evA(a), 'pontos').some(temAcaso) && !muds(evA(a), 'passos').length, [
          'Quem conta os sorteios? Cada A é mais um…',
          'Usa outra variável que cresce 1 em cada sorteio.',
          'No A: «mudar passos em 1».',
        ], 'Sorteios contados!'),
        P.regra('a_sem_mostrar', a => defs(evA(a), 'pontos').some(temAcaso) && !mostraK(evA(a), 'pontos'), [
          'Sorteaste… e quem é que vai ao quadro?',
          'Mostra a variável onde guardaste o sorteio.',
          'No A: «mostrar número» com o bloco «pontos».',
        ], 'Já se vê quem foi!'),
        Object.assign(P.evento('botao:B', 'Alguém estava distraído! Que botão repete o número?'), { id: 'sem_b' }),
        P.regra('b_sorteia', a => blocos(evB(a), 'mk_var_definir').length > 0 || blocos(evB(a), 'mk_mostrar_numero').some(temAcaso), [
          ['surpreendida', 'O B sorteia outra vez? Então já não é o mesmo aluno!'],
          'O B só mostra o que já está guardado.',
          'No B: apenas «mostrar número» com o bloco «pontos».',
        ], 'Repete certinho!'),
        P.regra('b_mostra', a => !!evB(a) && !mostraK(evB(a), 'pontos'), [
          'O B mostra o último sorteio. Em que variável está?',
          'O sorteio ficou nos pontos.',
          'No B: «mostrar número» com o bloco «pontos».',
        ], 'Repetido!'),
        Object.assign(P.evento('botao:AB', 'E para saber quantos sorteios já fizeste?'), { id: 'sem_ab' }),
        P.regra('ab_mostra', a => !!evAB(a) && !mostraK(evAB(a), 'passos'), [
          'Onde ficou guardado o número de sorteios?',
          'Os sorteios foram contados nos passos.',
          'No A+B: «mostrar número» com o bloco «passos».',
        ], 'Contagem certa!'),
      ],
      sucesso: 'Sorteio pronto! Uma variável guarda o número, outra conta os sorteios. Repetiu-se algum? Com 25 números, acontece mais do que parece!',
      extensao: 'Faz 10 sorteios e aponta os números: quantos se repetiram?',
      gambiarra: {
        xml: prog(BA(seq(definir('pontos', acaso(1, 25)), mudar('passos', 1), numero(vr('pontos')))),
          BB(seq(definir('pontos', acaso(1, 25)), numero(vr('pontos')))), BAB(seq(numero(vr('passos'))))),
        pedido: 'Carrego no B para repetir o número… e sai outro! Que gambiarra fiz?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 1 · 11 · Mealheiro
  const MEALHEIRO = {
    titulo: 'Mealheiro',
    missao: 'Um mealheiro de moedas: o A põe 1 €, o B põe 2 €, agitar mostra quanto já tens e o A+B gasta tudo.',
    passos: [
      'No A: «mudar contador em 1». No B: «mudar contador em 2».',
      'Em «agitar»: mostra o contador (o dinheiro que tens).',
      'No A+B: «definir contador para 0» e mostra-o — gastaste tudo!',
      'Quantas moedas, no mínimo, para juntares 7 €? Experimenta e agita.',
    ],
    material: 'micro:bit (e moedas de brincar, para comparar)',
    novos: [],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_botao_AB', 'mk_agitar', 'mk_var_mudar', 'mk_var_definir', 'mk_var', 'mk_mostrar_numero', 'mk_icone'],
    teste: 'agitar',
    ok: r => {
      let x = 0, a = 0, b = 0, ag = 0, z = 0, depoisZero = false;
      for (const s of segs(r)) {
        const ns = nums(s.outs);
        if (s.v === 'botao:A') { x += 1; a++; }
        else if (s.v === 'botao:B') { x += 2; b++; }
        else if (s.v === 'botao:AB') { x = 0; if (ultimo(ns) !== 0) return false; z++; }
        else if (s.v === 'agitar') { if (ultimo(ns) !== x) return false; ag++; if (z) depoisZero = true; }
      }
      return a >= 1 && b >= 1 && ag >= 2 && z >= 1 && depoisZero;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Um mealheiro que sabe fazer contas! Moedas de 1 € e de 2 € a entrar, e um botão para gastar tudo.'],
      parecePronto: a => muds(evA(a), 'contador').some(p => p.n === 1) && muds(evB(a), 'contador').some(p => p.n === 2) &&
        mostraK(evAg(a), 'contador') && defs(evAB(a), 'contador').some(p => p.n === 0) && mostraK(evAB(a), 'contador'),
      testar: 'Tens uma ideia? Vamos testar! Põe moedas com o A e o B, agita para ver, e gasta com o A+B.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão mete a moeda de 1 €?'), { id: 'sem_a' }),
        P.regra('a_valor', a => !!evA(a) && !muds(evA(a), 'contador').some(p => p.n === 1), [
          'Uma moeda de 1 € faz o mealheiro crescer quanto?',
          'O «mudar contador em» soma ao que já lá está.',
          'No A: «mudar contador em 1».',
        ], 'Um euro lá dentro!'),
        Object.assign(P.evento('botao:B', 'E a moeda de 2 €, entra com que botão?'), { id: 'sem_b' }),
        P.regra('b_valor', a => !!evB(a) && !muds(evB(a), 'contador').some(p => p.n === 2), [
          'Uma moeda de 2 € vale quantas de 1 €?',
          'O B soma mais do que o A.',
          'No B: «mudar contador em 2».',
        ], 'Dois euros lá dentro!'),
        Object.assign(P.evento('agitar', 'Como espreitas o mealheiro? Abana-o…'), { id: 'sem_agitar' }),
        P.regra('agitar_mostra', a => !!evAg(a) && !mostraK(evAg(a), 'contador'), [
          'Abanaste o mealheiro. Quanto tens?',
          'Mostra a variável onde estão as moedas.',
          'Em «agitar»: «mostrar número» com o bloco «contador».',
        ], 'Já sabes quanto tens!'),
        Object.assign(P.evento('botao:AB', 'Fizeste compras! Que botão gasta tudo?'), { id: 'sem_ab' }),
        P.regra('ab_zero', a => !!evAB(a) && !defs(evAB(a), 'contador').some(p => p.n === 0), [
          'Gastar tudo deixa o mealheiro com quanto?',
          '«definir» põe o contador num número certinho.',
          'No A+B: «definir contador para 0» e mostra o contador.',
        ], 'Mealheiro vazio!'),
        P.regra('ab_mostra', a => defs(evAB(a), 'contador').some(p => p.n === 0) && !mostraK(evAB(a), 'contador'), [
          'Gastaste… e como confirmas que ficou vazio?',
          'Depois de pôr a 0, mostra o contador.',
          'No A+B, por baixo: «mostrar número» com o bloco «contador».',
        ], 'Zero confirmado!'),
      ],
      sucesso: 'Mealheiro pronto! Para fazer 7 €: três moedas de 2 € e uma de 1 € — quatro moedas. Descobriste outra maneira?',
      extensao: 'E se o logotipo fosse uma nota de 5 €? Quantas formas há de fazer 10 €?',
      gambiarra: {
        xml: prog(BA(seq(mudar('contador', 1))), BB(seq(mudar('contador', 2))), AG(seq(numero(vr('contador')))), BAB(seq(numero(vr('contador'))))),
        pedido: 'Gastei o dinheiro todo no A+B… e o mealheiro continua cheio! Encontras a gambiarra?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 2 · 7 · Máquina das tabuadas
  const MESA = {
    titulo: 'Máquina das tabuadas',
    missao: 'Uma máquina de tabuadas: o A escolhe a tabuada, o B avança 1 ×, 2 ×, 3 × … e mostra o resultado.',
    passos: [
      'No arranque: «definir medida para 2» (a tabuada do 2) e «definir contador para 0».',
      'No B: «mudar contador em 1» e mostra medida × contador.',
      'No A: «mudar medida em 1» (tabuada seguinte), contador outra vez a 0, e mostra a medida.',
      'Faz a tabuada do 2 até 2 × 4, depois carrega no A e faz a do 3.',
    ],
    material: 'micro:bit',
    novos: ['mt_definir_medida', 'mt_mudar_medida', 'mt_var_medida'],
    caixa: ['mk_iniciar', 'mk_botao', 'mk_botao_B', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mt_conta_vezes', 'mk_mostrar_numero'],
    teste: 'botao:B',
    // cada B mostra medida × contador; o primeiro B depois de um A mostra medida × 1; tem de usar pelo menos 2 tabuadas (≥ 2)
    ok: r => {
      let boas = 0, depoisA = false, tabuadas = new Set(), primeiro = 0;
      for (const s of linha(r)) {
        if (s.v === 'botao:A') { if (s.vf.contador !== 0) return false; depoisA = true; continue; }
        if (s.v !== 'botao:B') continue;
        const o = s.outs.filter(x => x.v.startsWith('numero:')).pop();
        if (!o) return false;
        const m = o.vars.medida, c = o.vars.contador;
        if (!(c >= 1) || Number(o.v.slice(7)) !== m * c) return false;
        if (depoisA) { if (c !== 1) return false; primeiro++; depoisA = false; }
        if (m >= 2) tabuadas.add(m);
        boas++;
      }
      return boas >= 4 && tabuadas.size >= 2 && primeiro >= 1;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Vamos construir uma máquina de tabuadas! Duas variáveis: qual é a tabuada (medida) e quantas vezes (contador).'],
      parecePronto: a => defs(evIni(a), 'medida').length > 0 && muds(evB(a), 'contador').length > 0 &&
        blocos(evB(a), 'mk_mostrar_numero').some(p => temOp(p, '*') && varsDe(p).includes('medida') && varsDe(p).includes('contador')) &&
        muds(evA(a), 'medida').length > 0 && defs(evA(a), 'contador').some(p => p.n === 0),
      testar: 'Tens uma ideia? Vamos testar! B, B, B… depois A, e mais B.',
      regras: [
        Object.assign(P.evento('inicio', 'Quando o micro:bit liga, que tabuada começa? Onde guardas isso?'), { id: 'sem_inicio' }),
        P.regra('inicio_medida', a => !!evIni(a) && !defs(evIni(a), 'medida').some(p => p.n >= 2), [
          'Com que tabuada começa a máquina?',
          'A tabuada fica guardada na variável medida.',
          'No arranque: «definir medida para 2».',
        ], 'Começa na do 2!'),
        Object.assign(P.evento('botao:B', 'Que botão avança na tabuada?'), { id: 'sem_b' }),
        P.regra('b_sem_mudar', a => !!evB(a) && !muds(evB(a), 'contador').length, [
          '1 ×, 2 ×, 3 ×… O que cresce de cada vez que carregas no B?',
          'O contador diz quantas vezes vais.',
          'No B: «mudar contador em 1».',
        ], 'Vezes a crescer!'),
        P.regra('b_conta', a => muds(evB(a), 'contador').length > 0 && !blocos(evB(a), 'mk_mostrar_numero').some(p => temOp(p, '*')), [
          'O B tem de mostrar o resultado da tabuada. Que conta é essa?',
          'Uma tabuada é uma multiplicação: tabuada × vezes.',
          'No B: «mostrar número» com a conta medida × contador.',
        ], 'Multiplicação!'),
        P.regra('conta_vars', a => blocos(evB(a), 'mk_mostrar_numero').some(p => temOp(p, '*')) &&
          !blocos(evB(a), 'mk_mostrar_numero').some(p => temOp(p, '*') && varsDe(p).includes('medida') && varsDe(p).includes('contador')), [
          'Na conta estão as duas coisas que mudam: a tabuada e as vezes?',
          'Um lado da multiplicação é a medida, o outro é o contador.',
          'Faz «medida × contador» (com os blocos das variáveis).',
        ], 'Conta certa!'),
        P.regra('mostra_antes', a => {
          const pl = evB(a)?.plano || [];
          const im = pl.findIndex(p => p.tipo === 'mk_var_mudar'), is = pl.findIndex(p => p.tipo === 'mk_mostrar_numero');
          return im >= 0 && is >= 0 && is < im;
        }, [
          'A primeira vez que carregas no B aparece 0? Mostras antes de contar?',
          'O micro:bit lê os blocos de cima para baixo.',
          'Põe o «mudar contador» antes do «mostrar número».',
        ], 'Primeiro conta, depois mostra!'),
        Object.assign(P.evento('botao:A', 'E para trocar de tabuada, que botão usas?'), { id: 'sem_a' }),
        P.regra('a_sem_tabuada', a => !!evA(a) && !muds(evA(a), 'medida').length, [
          'Tabuada seguinte: do 2 para o 3. O que muda?',
          'A tabuada está na medida.',
          'No A: «mudar medida em 1».',
        ], 'Tabuada seguinte!'),
        P.regra('a_sem_reset', a => muds(evA(a), 'medida').length > 0 && !defs(evA(a), 'contador').some(p => p.n === 0), [
          'Mudaste para a do 3… e o primeiro B dá 3 × 5? Onde começam as vezes?',
          'Ao mudar de tabuada, as vezes recomeçam.',
          'No A: «definir contador para 0».',
        ], 'Nova tabuada desde o início!'),
      ],
      sucesso: 'Máquina das tabuadas pronta! Multiplicar é juntar a mesma quantidade várias vezes — e agora escolhes qual.',
      extensao: 'Adiciona o A+B para mostrar a tabuada escolhida. E consegues que a tabuada volte ao 2 depois do 10?',
      gambiarra: {
        xml: prog(INI(seq(definirN('medida', 2), definirN('contador', 0))),
          BB(seq(mudar('contador', 1), numero(conta(VA('medida'), '+', VB('contador'))))),
          BA(seq(mudar('medida', 1), definirN('contador', 0), numero(vr('medida'))))),
        pedido: 'A minha máquina diz que 2 × 3 dá 5! Encontras a gambiarra?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 2 · 8 · Tabuleiro de xadrez
  const XADREZ = {
    titulo: 'Tabuleiro de xadrez',
    missao: 'Desenha um tabuleiro de xadrez no ecrã: acende só as casas onde x + y dá um número par.',
    passos: [
      'No A: «definir pontos para 0» (a linha, y) e «repetir 5 vezes» para as linhas.',
      'Lá dentro: «definir contador para 0» (a coluna, x) e outro «repetir 5 vezes» para as colunas.',
      'Dentro do segundo: se o resto de (contador + pontos) ÷ 2 = 0, acende x contador y pontos. Depois, «mudar contador em 1».',
      'No fim de cada linha (fora do segundo repetir): «mudar pontos em 1».',
      'Conta as luzes acesas: são 13?',
    ],
    material: 'micro:bit (e papel quadriculado para desenhar antes)',
    novos: ['mk_resto', 'mk_se_entao'],
    caixa: ['mk_botao', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mt_var_pontos', 'mk_repetir', 'mk_se_entao', 'mt_comparar_igual', 'mk_resto', 'mk_conta', 'mk_acender'],
    teste: 'botao:A',
    ok: r => causou(r, s => {
      const ac = new Set(s.filter(v => v.startsWith('acender:')).map(v => v.slice(8)));
      const certo = [];
      for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if ((x + y) % 2 === 0) certo.push(x + ',' + y);
      return ac.size === certo.length && certo.every(c => ac.has(c));
    }, v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', 'Um tabuleiro de xadrez é um padrão: casa sim, casa não. Há uma conta que o descobre — vamos pô-la a desenhar!'],
      parecePronto: a => {
        const e = evA(a);
        return blocos(e, 'mk_repetir').length >= 2 && blocos(e, 'mk_acender').some(p => varsDe(p).includes('contador') && varsDe(p).includes('pontos')) &&
          ses(e).some(s => usa(s).some(u => u.tipo === 'mk_resto')) && muds(e, 'contador').length > 0 && muds(e, 'pontos').length > 0 &&
          defs(e, 'contador').some(p => p.prof > 0);
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A e conta as casas acesas.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão desenha o tabuleiro?'), { id: 'sem_a' }),
        P.regra('sem_repetir', a => !!evA(a) && blocos(evA(a), 'mk_repetir').length < 2, [
          'O tabuleiro tem 5 linhas e cada linha tem 5 casas. Quantos «repetir» precisas?',
          'Um «repetir» para as linhas e outro, lá dentro, para as colunas.',
          'Põe um «repetir 5 vezes» dentro de outro «repetir 5 vezes».',
        ], 'Linhas e colunas!'),
        Object.assign(P.bloco('botao:A', 'mk_acender', 'Que bloco acende uma casa da grelha?'), { id: 'sem_acender' }),
        P.regra('acender_vars', a => blocos(evA(a), 'mk_acender').length > 0 && !blocos(evA(a), 'mk_acender').some(p => varsDe(p).includes('contador') && varsDe(p).includes('pontos')), [
          'A casa que acendes muda? Ou é sempre a mesma?',
          'A coluna (x) é o contador; a linha (y) são os pontos.',
          'No «acender»: x = contador, y = pontos.',
        ], 'A luz anda pela grelha!'),
        P.regra('sem_mudar_x', a => blocos(evA(a), 'mk_repetir').length >= 2 && !muds(evA(a), 'contador').some(p => p.prof >= 2), [
          'A coluna fica sempre a mesma? Como passas para a casa ao lado?',
          'Dentro do repetir das colunas, o contador cresce 1.',
          'No repetir de dentro, no fim: «mudar contador em 1».',
        ], 'Casa a casa!'),
        P.regra('reset_x', a => muds(evA(a), 'contador').some(p => p.prof >= 2) && !defs(evA(a), 'contador').some(p => p.prof === 1), [
          'Na segunda linha, a coluna começa onde? No 0 ou no 5?',
          'Cada linha nova recomeça na coluna 0.',
          'Dentro do repetir das linhas, antes do outro repetir: «definir contador para 0».',
        ], 'Cada linha começa no 0!'),
        P.regra('sem_mudar_y', a => blocos(evA(a), 'mk_repetir').length >= 2 && !muds(evA(a), 'pontos').some(p => p.prof === 1), [
          'Fica tudo na primeira linha? Como desces para a linha seguinte?',
          'No fim de cada linha, os pontos (y) crescem 1 — fora do repetir das colunas.',
          'Dentro do repetir das linhas, depois do outro repetir: «mudar pontos em 1».',
        ], 'Linha a linha!'),
        P.regra('sem_se', a => blocos(evA(a), 'mk_acender').length > 0 && !ses(evA(a)).length, [
          'Acende tudo? No xadrez é casa sim, casa não. Quem decide?',
          'Antes de acender, pergunta: esta casa é das acesas?',
          'Põe o «acender» dentro de um «se … então».',
        ], 'Agora há escolha!'),
        P.regra('sem_resto', a => ses(evA(a)).length > 0 && !ses(evA(a)).some(s => usa(s).some(u => u.tipo === 'mk_resto')), [
          'Casa sim, casa não… é como par e ímpar! Como se sabe se um número é par?',
          'Um número é par quando o resto da divisão por 2 é 0.',
          'Condição: resto de (contador + pontos) ÷ 2 = 0.',
        ], 'Par ou ímpar, decide a conta!'),
        P.regra('sem_soma', a => ses(evA(a)).some(s => usa(s).some(u => u.tipo === 'mk_resto')) &&
          !ses(evA(a)).some(s => usa(s).some(u => u.tipo === 'mk_conta' && u.op === '+') && varsDe(s).includes('contador') && varsDe(s).includes('pontos')), [
          'Se olhares só para a coluna, saem riscas! O que tens de juntar?',
          'No xadrez conta a coluna e a linha juntas: x + y.',
          'Dentro do resto: contador + pontos.',
        ], 'Xadrez perfeito!'),
      ],
      sucesso: 'Tabuleiro perfeito! Treze casas acesas: onde x + y é par. Um padrão inteiro saiu de uma conta só.',
      extensao: 'Troca o 0 por 1 na comparação: o que muda? E com «÷ 3», que padrão aparece?',
      gambiarra: {
        xml: prog(BA(seq(definirN('pontos', 0), repetir(5, definirN('contador', 0), repetir(5,
          seEntao(cmp('==', V('A', restoX(V('A', conta(VA('contador'), '+', VB('pontos'))), N('B', 2))), N('B', 0)), acenderV(vr('contador'), vr('pontos'))),
          mudar('contador', 1)))))),
        pedido: 'O meu tabuleiro só tem uma linha! As outras quatro desapareceram. Encontras a gambiarra?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 2 · 9 · O jogo do PIM
  const PIM = {
    titulo: 'O jogo do PIM',
    missao: 'O jogo do PIM: conta de 1 a 12, mas nos múltiplos de 3 diz PIM em vez do número.',
    passos: [
      'No A: «definir contador para 0» e «repetir 12 vezes».',
      'Lá dentro: «mudar contador em 1» e depois um «se … então … senão».',
      'Condição: resto de contador ÷ 3 = 0. Então: mostrar texto PIM. Senão: mostrar o contador.',
      'Joga com a turma: quem se enganar no PIM sai da roda!',
    ],
    material: 'micro:bit e a turma em roda',
    novos: ['mt_texto_pim', 'mk_resto'],
    caixa: ['mk_botao', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_repetir', 'mk_se_senao', 'mt_comparar_igual', 'mk_resto', 'mk_mostrar_numero', 'mk_pausa'],
    teste: 'botao:A',
    ok: r => causou(r, s => {
      const ec = s.filter(v => v.startsWith('numero:') || v.startsWith('texto:')).map(v => v.startsWith('numero:') ? Number(v.slice(7)) : v.slice(6).toUpperCase());
      const esp = []; for (let i = 1; i <= 12; i++) esp.push(i % 3 === 0 ? 'PIM' : i);
      return ec.length >= 9 && ec.length <= 12 && ec.every((x, i) => x === esp[i]);
    }, v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', 'Conhecem o jogo do PIM? Conta-se em roda, mas nos múltiplos de 3 diz-se PIM. O micro:bit vai ser o árbitro!'],
      parecePronto: a => {
        const e = evA(a);
        return blocos(e, 'mk_repetir').some(p => p.n >= 9) && muds(e, 'contador').some(p => p.prof > 0) &&
          ses(e).some(s => usa(s).some(u => u.tipo === 'mk_resto') && planoDe(s.sim).some(p => p.tipo === 'mk_mostrar_texto') && planoDe(s.nao).some(p => p.tipo === 'mk_mostrar_numero'));
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A e conta com o micro:bit: 1, 2, PIM…',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão começa o jogo?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_repetir', 'São 12 números. Vais escrever tudo 12 vezes?'), { id: 'sem_repetir' }),
        P.regra('sem_mudar', a => blocos(evA(a), 'mk_repetir').length > 0 && !muds(evA(a), 'contador').some(p => p.prof > 0), [
          'Em cada volta, o número tem de avançar. Quem o faz crescer?',
          'Dentro do repetir, o contador cresce 1.',
          'Dentro do «repetir»: «mudar contador em 1».',
        ], 'Números a andar!'),
        P.regra('sem_reset', a => muds(evA(a), 'contador').length > 0 && !defs(evA(a), 'contador').some(p => p.n === 0), [
          'Da segunda vez que jogas, a conta recomeça no 1?',
          'Antes de contar, o contador volta ao 0.',
          'No início do A: «definir contador para 0».',
        ], 'Recomeça do 1!'),
        P.regra('sem_se', a => muds(evA(a), 'contador').some(p => p.prof > 0) && !ses(evA(a)).length, [
          'O micro:bit diz sempre o número? Quem decide quando é PIM?',
          'Em cada número, pergunta: é múltiplo de 3?',
          'Dentro do repetir: «se … então … senão».',
        ], 'Agora há uma decisão!'),
        P.regra('sem_resto', a => ses(evA(a)).length > 0 && !ses(evA(a)).some(s => usa(s).some(u => u.tipo === 'mk_resto')), [
          'Como se sabe se um número é múltiplo de 3? Pensa na divisão…',
          'Múltiplo de 3 é o que dividido por 3 não deixa resto.',
          'Condição: resto de contador ÷ 3 = 0.',
        ], 'O resto decide!'),
        P.regra('divisor', a => ses(evA(a)).some(s => { const u = usa(s), i = u.findIndex(x => x.tipo === 'mk_resto'); if (i < 0) return false; const n = u.slice(i + 1).find(x => x.tipo === 'mk_num'); return n && n.n !== 3; }), [
          ['surpreendida', 'PIM no 2, no 4, no 6? Isso são os pares! Que tabuada é a do PIM?'],
          'O número depois do «÷» diz de que tabuada são os múltiplos.',
          'Escreve 3 no «resto de contador ÷ …».',
        ], 'PIM no 3, 6, 9, 12!'),
        P.regra('sem_pim', a => ses(evA(a)).some(s => usa(s).some(u => u.tipo === 'mk_resto')) && !ses(evA(a)).some(s => planoDe(s.sim).some(p => p.tipo === 'mk_mostrar_texto')), [
          'Quando é múltiplo de 3, o que diz o micro:bit?',
          'No «então», mostra a palavra.',
          'No «então»: mostrar texto PIM.',
        ], 'PIM!'),
        P.regra('sem_numero', a => ses(evA(a)).some(s => planoDe(s.sim).some(p => p.tipo === 'mk_mostrar_texto')) && !ses(evA(a)).some(s => planoDe(s.nao).some(p => p.tipo === 'mk_mostrar_numero')), [
          'E quando não é múltiplo de 3? Fica calado?',
          'No «senão», mostra o número.',
          'No «senão»: «mostrar número» com o contador.',
        ], 'Números e PIM!'),
        P.regra('dois_mostrar', a => ses(evA(a)).length > 0 && blocos(evA(a), 'mk_mostrar_numero').some(p => p.dentroDe === 'mk_repetir'), [
          'Aparece o número e logo a seguir PIM? Num múltiplo de 3 só se diz PIM!',
          'O «mostrar número» tem de ficar dentro do «senão», não por fora.',
          'Arrasta o «mostrar número» para o «senão».',
        ], 'Ou um, ou outro!'),
      ],
      sucesso: '1, 2, PIM, 4, 5, PIM… O resto da divisão descobre os múltiplos de 3 sem errar. Agora joga com a turma!',
      extensao: 'Versão difícil: PIM nos múltiplos de 3 e PUM nos de 5. E no 15?',
      gambiarra: {
        xml: prog(BA(seq(definirN('contador', 0), repetir(12, mudar('contador', 1),
          se(cmp('==', V('A', restoX(VA('contador'), N('B', 2))), N('B', 0)), [texto('PIM')], [numero(vr('contador'))]))))),
        pedido: 'O meu PIM sai no 2, no 4, no 6… A turma diz que estou a fazer batota! Encontras a gambiarra?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 2 · 10 · Sondagem da turma
  const SONDAGEM = {
    titulo: 'Sondagem da turma',
    missao: 'Votação na turma: o A conta um «sim», o B um «não»; o A+B mostra quantos votaram e avisa se houve empate.',
    passos: [
      'No A: «mudar contador em 1» (os «sim»). No B: «mudar pontos em 1» (os «não»).',
      'No A+B: mostra contador + pontos (o total de votos).',
      'Ainda no A+B: «se contador = pontos então» mostra a cara surpreendida — empate!',
      'Faz uma votação a sério: «Preferes figos ou laranjas?»',
    ],
    material: 'micro:bit e uma pergunta para a turma',
    novos: ['mk_conta', 'mk_icone_surpreendido'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_botao_AB', 'mk_var_mudar', 'mt_mudar_pontos', 'mk_var', 'mt_var_pontos', 'mk_se_entao', 'mt_comparar_igual', 'mk_mostrar_numero'],
    teste: 'botao:AB',
    ok: r => {
      let a = 0, b = 0, empate = 0, outro = 0;
      for (const s of segs(r)) {
        if (s.v === 'botao:A') a++;
        else if (s.v === 'botao:B') b++;
        else if (s.v === 'botao:AB') {
          const ns = nums(s.outs);
          if (ns[0] !== a + b) return false;
          const sur = s.outs.includes('icone:Surprised');
          if (sur !== (a === b)) return false;
          if (a === b) empate++; else outro++;
        }
      }
      return empate >= 1 && outro >= 1;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Hora de votar! O micro:bit conta os «sim» e os «não», diz quantos votaram e avisa se ficou empatado.'],
      parecePronto: a => muds(evA(a), 'contador').length > 0 && muds(evB(a), 'pontos').length > 0 &&
        blocos(evAB(a), 'mk_mostrar_numero').some(p => temOp(p, '+') && varsDe(p).includes('contador') && varsDe(p).includes('pontos')) &&
        ses(evAB(a)).some(s => compara(s, '==') && varsDe(s).includes('contador') && varsDe(s).includes('pontos') && planoDe(s.sim).some(p => p.tipo === 'mk_icone')),
      testar: 'Tens uma ideia? Vamos testar! A, B e A+B (empate!), depois A e A+B.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão conta um «sim»?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'Um voto «sim»! Onde fica contado?'), { id: 'a_sem_mudar' }),
        Object.assign(P.evento('botao:B', 'E os «não», com que botão?'), { id: 'sem_b' }),
        P.regra('b_mesma', a => muds(evB(a), 'contador').length > 0 && !muds(evB(a), 'pontos').length, [
          ['surpreendida', 'Os «sim» e os «não» contados juntos? Então quem ganhou?'],
          'Cada resposta precisa da sua variável.',
          'No B, carrega na setinha do «mudar» e escolhe «pontos».',
        ], 'Cada voto no seu monte!'),
        P.regra('b_sem_mudar', a => !!evB(a) && !blocos(evB(a), 'mk_var_mudar').length, [
          'Um voto «não»! Onde fica contado?',
          'Usa outra variável para os «não».',
          'No B: «mudar pontos em 1».',
        ], 'Votos «não» contados!'),
        Object.assign(P.evento('botao:AB', 'A votação acabou! Que botão mostra o resultado?'), { id: 'sem_ab' }),
        P.regra('ab_total', a => !!evAB(a) && !blocos(evAB(a), 'mk_mostrar_numero').some(p => temOp(p, '+') && varsDe(p).includes('contador') && varsDe(p).includes('pontos')), [
          'Quantas pessoas votaram ao todo? Que conta faz isso?',
          'O total é os «sim» mais os «não».',
          'No A+B: «mostrar número» com contador + pontos.',
        ], 'Total certo!'),
        P.regra('sem_se', a => blocos(evAB(a), 'mk_mostrar_numero').length > 0 && !ses(evAB(a)).length, [
          'E se houver tantos «sim» como «não»? Como avisas?',
          'Faz uma pergunta: os dois montes são iguais?',
          'No A+B: «se … então».',
        ], 'Agora há aviso!'),
        P.regra('se_compara', a => ses(evAB(a)).length > 0 && !ses(evAB(a)).some(s => compara(s, '==') && varsDe(s).includes('contador') && varsDe(s).includes('pontos')), [
          'Empate quer dizer o quê? Comparas o quê com o quê?',
          'Empate é quando os «sim» são iguais aos «não».',
          'Condição: contador = pontos.',
        ], 'Comparação certa!'),
        P.regra('sem_icone', a => ses(evAB(a)).some(s => compara(s, '==')) && !ses(evAB(a)).some(s => planoDe(s.sim).some(p => p.tipo === 'mk_icone')), [
          'Há empate… e o micro:bit não diz nada?',
          'Dentro do «então», mostra um sinal.',
          'No «então»: mostrar ícone surpreendido.',
        ], 'Empate avisado!'),
      ],
      sucesso: 'Sondagem pronta! O total é a soma dos dois montes, e o empate é quando são iguais. Já tens um instrumento de democracia!',
      extensao: 'E se o micro:bit mostrasse ✔ quando os «sim» ganham? (No nível 3 aprendes o «maior que».)',
      gambiarra: {
        xml: prog(BA(seq(mudar('contador', 1))), BB(seq(mudar('pontos', 1))),
          BAB(seq(numero(conta(VA('contador'), '+', VB('contador'))), seEntao(cmp('==', VA('contador'), VB('pontos')), icone('Surprised'))))),
        pedido: 'Votaram três pessoas e o meu micro:bit diz que foram quatro! Encontras a gambiarra?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 2 · 11 · Os coelhos de Fibonacci
  const FIBONACCI = {
    titulo: 'Os coelhos de Fibonacci',
    missao: 'Cada número é a soma dos dois anteriores: 1, 1, 2, 3, 5, 8, 13… Faz o micro:bit continuar a sequência a cada A.',
    passos: [
      'No arranque: «definir contador para 1» e «definir pontos para 1» (os dois primeiros).',
      'No A: mostra o contador. Depois «definir medida para» contador + pontos (o seguinte).',
      'A seguir: «definir contador para» pontos e «definir pontos para» medida — a fila anda um lugar.',
      'Carrega 7 vezes no A: que número vem depois do 13? Adivinha antes!',
    ],
    material: 'micro:bit (e uma pinha ou um girassol, para procurar estes números na natureza)',
    novos: ['mt_definir_medida', 'mt_var_medida', 'mt_definir_pontos'],
    caixa: ['mk_iniciar', 'mk_botao', 'mk_var_definir', 'mk_var', 'mt_var_pontos', 'mk_conta', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => {
      const seqA = segs(r).filter(s => s.v === 'botao:A').map(s => ultimo(nums(s.outs)));
      const fib = [1, 1, 2, 3, 5, 8, 13, 21];
      return seqA.length >= 6 && seqA.every((x, i) => x === fib[i]);
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Há 800 anos, Fibonacci contou coelhos e descobriu uma sequência mágica: cada número é a soma dos dois anteriores!'],
      parecePronto: a => {
        const e = evA(a);
        return defs(evIni(a), 'contador').some(p => p.n === 1) && defs(evIni(a), 'pontos').some(p => p.n === 1) && mostraK(e, 'contador') &&
          defs(e, 'medida').some(p => temOp(p, '+')) && defs(e, 'contador').some(p => p.n === 'var:pontos') && defs(e, 'pontos').some(p => p.n === 'var:medida');
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega seis vezes no A: 1, 1, 2, 3, 5, 8?',
      regras: [
        Object.assign(P.evento('inicio', 'Toda a sequência começa em dois números. Quando os guardas?'), { id: 'sem_inicio' }),
        P.regra('inicio_valores', a => !!evIni(a) && !(defs(evIni(a), 'contador').some(p => p.n === 1) && defs(evIni(a), 'pontos').some(p => p.n === 1)), [
          'A sequência de Fibonacci começa com que dois números?',
          'Começa com 1 e 1: um no contador, outro nos pontos.',
          'No arranque: «definir contador para 1» e «definir pontos para 1».',
        ], 'Primeiros coelhos!'),
        Object.assign(P.evento('botao:A', 'Que botão faz nascer o número seguinte?'), { id: 'sem_a' }),
        P.regra('sem_mostrar', a => !!evA(a) && !mostraK(evA(a), 'contador'), [
          'Qual é o número que se mostra agora?',
          'O número da vez está no contador.',
          'No A, primeiro: «mostrar número» com o contador.',
        ], 'Já se vê!'),
        P.regra('sem_soma', a => mostraK(evA(a), 'contador') && !defs(evA(a), 'medida').some(p => temOp(p, '+')), [
          'Como nasce o número seguinte? Lembra-te: soma dos dois…',
          'Guarda a soma dos dois numa terceira variável, a medida.',
          '«definir medida para» contador + pontos.',
        ], 'Soma guardada!'),
        P.regra('sem_troca', a => defs(evA(a), 'medida').some(p => temOp(p, '+')) && !defs(evA(a), 'contador').some(p => p.n === 'var:pontos'), [
          'A fila tem de andar: o segundo passa a ser o primeiro. Como?',
          'O contador recebe o valor dos pontos.',
          '«definir contador para» o bloco «pontos».',
        ], 'A fila anda!'),
        P.regra('sem_novo', a => defs(evA(a), 'contador').some(p => p.n === 'var:pontos') && !defs(evA(a), 'pontos').some(p => p.n === 'var:medida'), [
          'E o número novo que nasceu na medida, vai para onde?',
          'Os pontos recebem a soma guardada.',
          '«definir pontos para» o bloco «medida».',
        ], 'Sequência a crescer!'),
        P.regra('ordem', a => {
          const pl = evA(a)?.plano || [];
          const ic = pl.findIndex(p => p.tipo === 'mk_var_definir' && p.var === 'contador' && p.n === 'var:pontos');
          const ip = pl.findIndex(p => p.tipo === 'mk_var_definir' && p.var === 'pontos' && p.n === 'var:medida');
          return ic >= 0 && ip >= 0 && ip < ic;
        }, [
          ['surpreendida', '1, 1, 2, 4, 8? Isso é dobrar! A ordem dos blocos conta…'],
          'Se os pontos mudam primeiro, o contador já recebe o número novo.',
          'Primeiro «definir contador para pontos», depois «definir pontos para medida».',
        ], 'Fibonacci certinho!'),
      ],
      sucesso: '1, 1, 2, 3, 5, 8, 13… É a sequência de Fibonacci! Aparece nas pétalas, nas pinhas e nos girassóis.',
      extensao: 'Conta as espirais de uma pinha: dá um número de Fibonacci? E o que acontece se começares com 2 e 1?',
      gambiarra: {
        xml: prog(INI(seq(definirN('contador', 1), definirN('pontos', 1))),
          BA(seq(numero(vr('contador')), definir('medida', conta(VA('contador'), '+', VB('pontos'))), definir('pontos', vr('medida')), definir('contador', vr('pontos'))))),
        pedido: 'A minha sequência dá 1, 2, 4, 8… Os coelhos estão a dobrar em vez de somar! Encontras a gambiarra?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 3 · 7 · Reflexos de gato
  const REFLEXOS = {
    titulo: 'Reflexos de gato',
    missao: 'Teste de reflexos: o micro:bit espera um tempo ao acaso e mostra o sinal; carregas no B o mais depressa possível e ele diz os milissegundos. O A+B dá a média.',
    passos: [
      'No A: cara a dormir; pausa de um tempo ao acaso (de 1000 até 3000); mostra o coração (o sinal!) e «definir medida para tempo de execução».',
      'No B: «definir passos para» tempo − medida (a tua reação) e mostra os passos.',
      'Ainda no B: «mudar pontos em» passos (a soma) e «mudar contador em 1» (quantas tentativas).',
      'No A+B: mostra pontos ÷ contador — a tua média!',
      'Joga 3 vezes. Consegues uma média abaixo dos 400?',
    ],
    material: 'micro:bit e reflexos de gato',
    novos: ['mk_tempo', 'mt_conta_menos', 'mt_conta_div'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_botao_AB', 'mk_icone', 'mk_pausa', 'mk_aleatorio', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_tempo', 'mt_conta_menos', 'mt_conta_div', 'mk_mostrar_numero'],
    teste: 'botao:A',
    // B mostra o tempo desde o sinal (quando a medida foi guardada); o A+B mostra a média das reações mostradas
    ok: r => {
      const L = linha(r); const reacoes = [];
      let medias = 0;
      for (const s of L) {
        if (s.v === 'botao:A') {
          const ics = s.outs.filter(o => o.v.startsWith('icone:'));
          if (ics.length < 2 || ics[ics.length - 1].t - ics[0].t < 800 || !varMudou(s, 'medida')) return false;
        } else if (s.v === 'botao:B') {
          const o = s.outs.find(x => x.v.startsWith('numero:'));
          const tm = s.qi.medida;
          if (!o || tm === undefined) return false;
          if (Math.abs(Number(o.v.slice(7)) - (s.t - tm)) > 150) return false;
          reacoes.push(Number(o.v.slice(7)));
        } else if (s.v === 'botao:AB') {
          const ns = numsO(s);
          if (!reacoes.length || !ns.length) return false;
          const media = reacoes.reduce((x, y) => x + y, 0) / reacoes.length;
          if (Math.abs(ns[0] - media) > 1) return false;
          medias++;
        }
      }
      return reacoes.length >= 2 && medias >= 1;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Os gatos têm reflexos rapidíssimos. E tu? O micro:bit vai medir em milissegundos — e fazer a média, como os cientistas.'],
      parecePronto: a => {
        const e = evA(a), b = evB(a);
        return blocos(e, 'mk_pausa').some(temAcaso) && blocos(e, 'mk_icone').length >= 2 && dentro(e, 'mk_var_definir', 'mk_tempo') &&
          blocos(b, 'mk_var_definir').some(p => temOp(p, '-') && usa(p).some(u => u.tipo === 'mk_tempo')) && blocos(b, 'mk_mostrar_numero').length > 0 &&
          muds(b, 'pontos').length > 0 && muds(b, 'contador').length > 0 && blocos(evAB(a), 'mk_mostrar_numero').some(p => temOp(p, '/'));
      },
      testar: 'Tens uma ideia? Vamos testar! A, espera pelo coração, B o mais depressa possível. Duas vezes, e depois A+B.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão começa o teste?'), { id: 'sem_a' }),
        P.regra('a_espera', a => !!evA(a) && !blocos(evA(a), 'mk_pausa').some(temAcaso), [
          'Se o sinal aparecer sempre ao fim do mesmo tempo, consegues fazer batota? Como evitar?',
          'A pausa pode durar um tempo ao acaso.',
          'No A: «pausa» com escolher ao acaso de 1000 até 3000 lá dentro.',
        ], 'Ninguém adivinha o sinal!'),
        P.regra('a_sinal', a => blocos(evA(a), 'mk_pausa').some(temAcaso) && blocos(evA(a), 'mk_icone').length < 2, [
          'Como sabes que tens de carregar? Antes da pausa espera-se, depois…',
          'Uma cara antes da pausa (à espera) e outra depois (o sinal).',
          'Mostra a cara a dormir antes da pausa e o coração depois.',
        ], 'Prepara… sinal!'),
        P.regra('a_marca', a => blocos(evA(a), 'mk_icone').length >= 2 && !dentro(evA(a), 'mk_var_definir', 'mk_tempo'), [
          'Para medir a reação, tens de saber a que horas apareceu o sinal. Onde guardas isso?',
          'O relógio do micro:bit é o «tempo de execução».',
          'Depois do sinal: «definir medida para tempo de execução».',
        ], 'Hora do sinal guardada!'),
        Object.assign(P.evento('botao:B', 'Que botão carregas quando vês o sinal?'), { id: 'sem_b' }),
        P.regra('b_diferenca', a => !!evB(a) && !blocos(evB(a), 'mk_var_definir').some(p => temOp(p, '-') && usa(p).some(u => u.tipo === 'mk_tempo') && varsDe(p).includes('medida')), [
          'A tua reação é o tempo que passou entre o sinal e o B. Que conta é essa?',
          'Tempo de agora menos o tempo do sinal.',
          'No B: «definir passos para» tempo de execução − medida.',
        ], 'Reação medida!'),
        P.regra('b_mostra', a => blocos(evB(a), 'mk_var_definir').some(p => temOp(p, '-')) && !mostraK(evB(a), 'passos'), [
          'Mediste… e quanto demoraste?',
          'Mostra a variável onde guardaste a reação.',
          'No B: «mostrar número» com o bloco «passos».',
        ], 'Já sabes a tua reação!'),
        P.regra('b_soma', a => mostraK(evB(a), 'passos') && !(muds(evB(a), 'pontos').some(p => p.n === 'var:passos') && muds(evB(a), 'contador').length), [
          'Para fazer a média, de que duas coisas precisas?',
          'A soma das reações (pontos) e quantas tentativas fizeste (contador).',
          'No B: «mudar pontos em» passos e «mudar contador em 1».',
        ], 'Soma e tentativas guardadas!'),
        Object.assign(P.evento('botao:AB', 'E para ver a tua média, que botão usas?'), { id: 'sem_ab' }),
        P.regra('ab_media', a => !!evAB(a) && !blocos(evAB(a), 'mk_mostrar_numero').some(p => temOp(p, '/') && varsDe(p).includes('pontos') && varsDe(p).includes('contador')), [
          'A média é a soma dividida por… quê?',
          'Divide a soma das reações pelo número de tentativas.',
          'No A+B: «mostrar número» com pontos ÷ contador.',
        ], 'Média certinha!'),
      ],
      sucesso: 'Reflexos medidos! A média junta todas as tentativas num só número — é assim que os cientistas comparam resultados.',
      extensao: 'Testa com a mão esquerda e com a direita: qual tem melhor média? E depois de correres?',
      gambiarra: {
        xml: prog(BA(seq(icone('Asleep'), pausaV(acaso(1000, 3000)), icone('Heart'), definir('medida', tempoB))),
          BB(seq(definir('passos', tempoB), numero(vr('passos')), mudarV('pontos', vr('passos')), mudar('contador', 1))),
          BAB(seq(numero(conta(VA('pontos'), '/', VB('contador')))))),
        pedido: 'Segundo o meu micro:bit, demoro 15 000 milissegundos a reagir! Sou assim tão lento? Encontras a gambiarra?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 3 · 8 · Mais ou menos
  const MAISMENOS = {
    titulo: 'Mais ou menos',
    missao: 'Adivinha com pistas: agita para esconder um número de 1 a 10; o A muda o palpite, o B diz «+», «−» ou acertaste; o A+B mostra as tentativas.',
    passos: [
      'Em agitar: «definir medida para» ao acaso de 1 até 10 (o segredo); contador (palpite) e passos (tentativas) a 0.',
      'No A: «mudar contador em 1» e mostra o palpite.',
      'No B: «mudar passos em 1»; se contador = medida → cara contente; senão, se contador < medida → texto «+»; senão → texto «-».',
      'No A+B: mostra os passos.',
      'Joga com um amigo: quem acerta com menos tentativas?',
    ],
    material: 'micro:bit e um amigo',
    novos: ['mt_texto_mais', 'mt_texto_menos', 'mt_definir_passos'],
    caixa: ['mk_agitar', 'mk_botao', 'mk_botao_B', 'mk_botao_AB', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_aleatorio', 'mk_se_senao', 'mk_comparar', 'mk_mostrar_numero', 'mt_texto_mais', 'mt_texto_menos', 'mk_icone'],
    teste: 'agitar',
    ok: r => {
      let boas = 0, certas = 0, tent = 0, abOk = 0;
      for (const s of linha(r)) {
        if (s.v === 'agitar') { tent = 0; continue; }
        if (s.v === 'botao:B') {
          const vs = s.vf, c = vs.contador, m = vs.medida;
          if (c === undefined || m === undefined) return false;
          tent++;
          const outs = s.outs.map(o => o.v);
          const feliz = outs.includes('icone:Happy'), mais = outs.includes('texto:+'), menos = outs.includes('texto:-');
          if (c === m ? !(feliz && !mais && !menos) : c < m ? !(mais && !feliz && !menos) : !(menos && !feliz && !mais)) return false;
          if (c === m) certas++;
          boas++;
        } else if (s.v === 'botao:AB') {
          if (ultimo(numsO(s)) !== tent) return false;
          abOk++;
        }
      }
      return boas >= 4 && certas >= 1 && abOk >= 1;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Um segredo de 1 a 10 e um micro:bit que só diz «+» ou «−»… Com boas pistas, acertas em poucas tentativas!'],
      parecePronto: a => {
        const b = evB(a);
        return defs(evAg(a), 'medida').some(temAcaso) && muds(evA(a), 'contador').length > 0 && muds(b, 'passos').length > 0 &&
          ses(b).some(s => compara(s, '==')) && ses(b).some(s => compara(s, '<') || compara(s, '>')) &&
          blocos(b, 'mk_mostrar_texto').length >= 2 && blocos(b, 'mk_icone').length > 0 && mostraK(evAB(a), 'passos');
      },
      testar: 'Tens uma ideia? Vamos testar! Agita, e depois A, B, A, B… até acertares. No fim, A+B.',
      regras: [
        Object.assign(P.evento('agitar', 'Como se começa um jogo novo, com um segredo novo?'), { id: 'sem_agitar' }),
        P.regra('sem_segredo', a => !!evAg(a) && !defs(evAg(a), 'medida').some(temAcaso), [
          'O segredo tem de ser escolhido sem ninguém saber. Como?',
          'Guarda um número ao acaso na medida.',
          'Em agitar: «definir medida para» escolher ao acaso de 1 até 10.',
        ], 'Segredo escondido!'),
        P.regra('limites', a => defs(evAg(a), 'medida').some(p => { const l = limitesU(p); return l && (l[0] !== 1 || l[1] !== 10); }), [
          'De que número até que número pode ser o segredo?',
          'O «escolher ao acaso» vai do mais pequeno ao maior.',
          'Escreve de 1 até 10.',
        ], 'De 1 a 10!'),
        P.regra('sem_reset', a => defs(evAg(a), 'medida').some(temAcaso) && !(defs(evAg(a), 'contador').some(p => p.n === 0) && defs(evAg(a), 'passos').some(p => p.n === 0)), [
          'No segundo jogo, o palpite e as tentativas começam onde?',
          'Num jogo novo, palpite e tentativas voltam a 0.',
          'Em agitar: «definir contador para 0» e «definir passos para 0».',
        ], 'Jogo novo, contas novas!'),
        Object.assign(P.evento('botao:A', 'Com que botão mudas o teu palpite?'), { id: 'sem_a' }),
        P.regra('a_mudar', a => !!evA(a) && !(muds(evA(a), 'contador').length && mostraK(evA(a), 'contador')), [
          'Cada A o palpite sobe um. E como sabes em que número vais?',
          'O A muda o contador e mostra-o.',
          'No A: «mudar contador em 1» e «mostrar número» com o contador.',
        ], 'Palpite pronto!'),
        Object.assign(P.evento('botao:B', 'Já escolheste o palpite. Com que botão perguntas?'), { id: 'sem_b' }),
        P.regra('b_tentativas', a => !!evB(a) && !muds(evB(a), 'passos').length, [
          'Cada pergunta é uma tentativa. Quem as conta?',
          'As tentativas ficam nos passos.',
          'No B: «mudar passos em 1».',
        ], 'Tentativas contadas!'),
        P.regra('b_se', a => !!evB(a) && !ses(evB(a)).length, [
          'O micro:bit tem de decidir: acertaste, ou o segredo é maior, ou menor?',
          'Para decidir usa-se o «se … então … senão».',
          'No B: «se contador = medida então … senão …».',
        ], 'Agora o micro:bit decide!'),
        P.regra('b_igual', a => ses(evB(a)).length > 0 && !ses(evB(a)).some(s => compara(s, '==') && varsDe(s).includes('contador') && varsDe(s).includes('medida')), [
          'Acertar quer dizer que o palpite e o segredo são…?',
          'Compara as duas variáveis com «=».',
          'Primeira condição: contador = medida.',
        ], 'Igual = acertou!'),
        P.regra('b_pistas', a => ses(evB(a)).some(s => compara(s, '==')) && !(ses(evB(a)).length >= 2 && blocos(evB(a), 'mk_mostrar_texto').length >= 2), [
          'Se não acertaste, como sabes se tens de subir ou descer?',
          'No «senão», põe outro «se»: o palpite é menor que o segredo?',
          'Senão: se contador < medida → texto «+»; senão → texto «-».',
        ], 'Pistas certas!'),
        P.regra('trocado', a => ses(evB(a)).some(s => compara(s, '<') && varsDe(s)[0] === 'contador' && planoDe(s.sim).some(p => p.tipo === 'mk_mostrar_texto' && p.texto === '-')), [
          ['surpreendida', 'O teu palpite é pequeno e o micro:bit diz «−»? Ao contrário!'],
          'Se o palpite é menor que o segredo, tens de subir: «+».',
          'Troca: no «então» do «<» fica o «+»; no «senão», o «-».',
        ], 'Pistas no sentido certo!'),
        Object.assign(P.evento('botao:AB', 'No fim, como vês quantas tentativas fizeste?'), { id: 'sem_ab' }),
        P.regra('ab_mostra', a => !!evAB(a) && !mostraK(evAB(a), 'passos'), [
          'As tentativas estão em que variável?',
          'Foram contadas nos passos.',
          'No A+B: «mostrar número» com o bloco «passos».',
        ], 'Tentativas à vista!'),
      ],
      sucesso: 'Jogo pronto! Com «+» e «−» nunca precisas de mais de 4 tentativas se começares pelo meio. Descobres porquê?',
      extensao: 'Muda para segredos de 1 a 100 (precisas de um palpite que sobe de 10 em 10 também!). Quantas tentativas no máximo?',
      gambiarra: {
        xml: prog(AG(seq(definir('medida', acaso(1, 10)), definirN('contador', 0), definirN('passos', 0))),
          BA(seq(mudar('contador', 1), numero(vr('contador')))),
          BB(seq(mudar('passos', 1), se(cmp('==', VA('contador'), VB('medida')), [icone('Happy')],
            [se(cmp('&lt;', VA('contador'), VB('medida')), [texto('-')], [texto('+')])]))),
          BAB(seq(numero(vr('passos'))))),
        pedido: 'As minhas pistas enganam toda a gente: digo «−» quando é para subir! Encontras a gambiarra?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 3 · 9 · Estatística do dado
  const ESTATISTICA = {
    titulo: 'Estatística do dado',
    missao: 'Lança um dado 60 vezes num instante e conta quantas vezes saiu o 6. O B desenha esse número num gráfico.',
    passos: [
      'No A: «definir contador para 0».',
      '«repetir 60 vezes»: «definir medida para» ao acaso de 1 até 6; «se medida = 6 então mudar contador em 1».',
      'No fim (fora do repetir): mostra o contador. Era o que esperavas? (60 ÷ 6 = …)',
      'No B: «desenhar gráfico de barras de» contador até 20.',
      'Carrega várias vezes no A: o número muda, mas anda sempre perto de quê?',
    ],
    material: 'micro:bit (e um dado de verdade, para comparar com 12 lançamentos à mão)',
    novos: ['mk_grafico'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mt_var_medida', 'mk_repetir', 'mk_aleatorio', 'mk_se_entao', 'mt_comparar_igual', 'mk_mostrar_numero', 'mk_grafico'],
    teste: 'botao:A',
    // cada A: um número plausível (1–24) de seis em 60 lançamentos (não pode acumular); o B desenha o último até 20
    ok: r => {
      let ult = null, boasA = 0, boasB = 0;
      for (const s of segs(r)) {
        if (s.v === 'botao:A') { const ns = nums(s.outs); if (!ns.length) return false; ult = ultimo(ns); if (ult < 1 || ult > 24) return false; boasA++; }
        else if (s.v === 'botao:B') {
          if (ult === null) continue;
          const g = s.outs.filter(v => v.startsWith('grafico:')).pop();
          if (!g || Number(g.slice(8)) !== Math.max(0, Math.min(25, Math.round(25 * ult / 20)))) return false;
          boasB++;
        }
      }
      return boasA >= 3 && boasB >= 1;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Se lançares um dado 60 vezes, quantos 6 esperas? Lançar à mão demora muito… o micro:bit faz isso num instante!'],
      parecePronto: a => {
        const e = evA(a);
        return defs(e, 'contador').some(p => p.n === 0 && p.prof === 0) && blocos(e, 'mk_repetir').some(p => p.n === 60) &&
          defs(e, 'medida').some(p => temAcaso(p) && p.prof > 0) && ses(e).some(s => compara(s, '==') && planoDe(s.sim).some(p => p.tipo === 'mk_var_mudar')) &&
          blocos(e, 'mk_mostrar_numero').some(p => p.prof === 0) && blocos(evB(a), 'mk_grafico').some(p => varsDe(p).includes('contador'));
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega três vezes no A e depois no B.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão faz os 60 lançamentos?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_repetir', '60 lançamentos… vais pôr 60 blocos?'), { id: 'sem_repetir' }),
        P.regra('poucos', a => blocos(evA(a), 'mk_repetir').some(p => p.n !== 60), [
          'Quantos lançamentos faz esta experiência?',
          'O número do «repetir» é quantas vezes lanças o dado.',
          'Escreve 60 no «repetir … vezes».',
        ], 'Sessenta lançamentos!'),
        P.regra('sem_dado', a => blocos(evA(a), 'mk_repetir').length > 0 && !defs(evA(a), 'medida').some(p => temAcaso(p) && p.prof > 0), [
          'Em cada volta lanças o dado. Onde fica o que saiu?',
          'Guarda o lançamento na medida, dentro do repetir.',
          'Dentro do «repetir»: «definir medida para» escolher ao acaso de 1 até 6.',
        ], 'Dado lançado!'),
        P.regra('sem_se', a => defs(evA(a), 'medida').some(temAcaso) && !ses(evA(a)).length, [
          'Só queres contar os 6. Como é que o micro:bit escolhe quais conta?',
          'Pergunta em cada lançamento: saiu um 6?',
          'Dentro do repetir: «se medida = 6 então mudar contador em 1».',
        ], 'Só os seis contam!'),
        P.regra('se_seis', a => ses(evA(a)).some(s => compara(s, '==')) && !ses(evA(a)).some(s => numsDe(s).includes(6) && varsDe(s).includes('medida')), [
          ['surpreendida', 'Nunca sai nada? Que número estás a procurar?'],
          'A comparação é: o lançamento (medida) é igual a 6?',
          'Condição: medida = 6.',
        ], 'À procura do 6!'),
        P.regra('sem_contar', a => ses(evA(a)).some(s => compara(s, '==')) && !ses(evA(a)).some(s => planoDe(s.sim).some(p => p.tipo === 'mk_var_mudar' && p.var === 'contador')), [
          'Saiu um 6! E quem o conta?',
          'Dentro do «então», o contador cresce 1.',
          'No «então»: «mudar contador em 1».',
        ], 'Seis contados!'),
        P.regra('sem_reset', a => ses(evA(a)).length > 0 && !defs(evA(a), 'contador').some(p => p.n === 0 && p.prof === 0), [
          'Na segunda experiência, os seis voltam a ser contados do zero?',
          'Antes dos lançamentos, o contador volta a 0.',
          'No início do A, antes do repetir: «definir contador para 0».',
        ], 'Experiência nova!'),
        P.regra('mostra_dentro', a => blocos(evA(a), 'mk_mostrar_numero').length > 0 && !blocos(evA(a), 'mk_mostrar_numero').some(p => p.prof === 0), [
          'Aparecem 60 números? Só queres ver o resultado no fim…',
          'O «mostrar número» fica fora do repetir, por baixo dele.',
          'Arrasta o «mostrar número» para depois do «repetir».',
        ], 'Só o resultado!'),
        Object.assign(P.evento('botao:B', 'E para ver o resultado num gráfico?'), { id: 'sem_b' }),
        P.regra('b_grafico', a => !!evB(a) && !blocos(evB(a), 'mk_grafico').some(p => varsDe(p).includes('contador')), [
          'O gráfico mostra que número?',
          'Desenha o contador, com o máximo 20.',
          'No B: «desenhar gráfico de barras de» contador até 20.',
        ], 'Gráfico pronto!'),
      ],
      sucesso: 'À volta de 10 seis em 60 lançamentos — porque o 6 é uma de seis faces: 60 ÷ 6 = 10. Isto é probabilidade!',
      extensao: 'Conta também os 1 numa segunda variável. Saem mais 1 ou mais 6? E com 600 lançamentos?',
      gambiarra: {
        xml: prog(BA(seq(definirN('contador', 0), repetir(60, definir('medida', acaso(1, 6)), seEntao(cmp('==', VA('medida'), N('B', 7)), mudar('contador', 1))),
          numero(vr('contador')))), BB(seq(grafico(vr('contador'), 20)))),
        pedido: 'Lancei o dado 60 vezes e nunca saiu nada! Encontras a gambiarra?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 3 · 10 · Cronómetro de voltas
  const VOLTAS = {
    titulo: 'Cronómetro de voltas',
    missao: 'Corrida à volta do recreio: o A dá a partida, o B marca cada volta e mostra o tempo dela em segundos; o A+B mostra a melhor volta.',
    passos: [
      'No arranque: «definir recorde para 1000».',
      'No A: «definir medida para tempo de execução» (a partida).',
      'No B: «definir contador para» (tempo − medida) ÷ 1000; mostra o contador; e «definir medida para tempo de execução» (nova volta).',
      'Ainda no B: se contador < recorde, então «definir recorde para» contador.',
      'No A+B: mostra o recorde. Quem fez a volta mais rápida?',
    ],
    material: 'micro:bit, pilhas e uma pista no recreio',
    novos: ['mt_definir_recorde', 'mt_var_recorde', 'mk_comparar'],
    caixa: ['mk_iniciar', 'mk_botao', 'mk_botao_B', 'mk_botao_AB', 'mk_var_definir', 'mk_var', 'mt_var_medida', 'mk_tempo', 'mt_conta_menos', 'mt_conta_div', 'mk_se_entao', 'mk_mostrar_numero'],
    teste: 'botao:B',
    // cada B mostra a volta (desde a última marca na medida) e volta a marcar; o A+B mostra a menor volta mostrada
    ok: r => {
      const voltas = []; let marcas = 0, ab = 0;
      for (const s of linha(r)) {
        if (s.v === 'botao:A') { if (!varMudou(s, 'medida')) return false; }
        else if (s.v === 'botao:B') {
          const o = s.outs.find(x => x.v.startsWith('numero:'));
          const tm = s.qi.medida;
          if (!o || tm === undefined) return false;
          const x = Number(o.v.slice(7));
          if (Math.abs(x - (s.t - tm) / 1000) > 0.25) return false;
          if (!varMudou(s, 'medida')) return false;
          voltas.push(x); marcas++;
        } else if (s.v === 'botao:AB') {
          const ns = numsO(s);
          if (!voltas.length || !ns.length || Math.abs(ns[0] - Math.min(...voltas)) > 0.011) return false;
          ab++;
        }
      }
      return marcas >= 2 && ab >= 1;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Corrida de voltas! O micro:bit mede cada volta e guarda a melhor — o recorde.'],
      parecePronto: a => {
        const b = evB(a);
        return defs(evIni(a), 'recorde').length > 0 && dentro(evA(a), 'mk_var_definir', 'mk_tempo') &&
          defs(b, 'contador').some(p => temOp(p, '-') && temOp(p, '/')) && mostraK(b, 'contador') && defs(b, 'medida').some(p => usa(p).some(u => u.tipo === 'mk_tempo')) &&
          ses(b).some(s => compara(s, '<') && planoDe(s.sim).some(p => p.tipo === 'mk_var_definir' && p.var === 'recorde')) && mostraK(evAB(a), 'recorde');
      },
      testar: 'Tens uma ideia? Vamos testar! A para partir, B a cada volta (três voltas), e A+B no fim.',
      regras: [
        Object.assign(P.evento('inicio', 'O recorde tem de começar num número muito grande, para qualquer volta o bater. Quando o guardas?'), { id: 'sem_inicio' }),
        P.regra('inicio_recorde', a => !!evIni(a) && !defs(evIni(a), 'recorde').some(p => p.n >= 100), [
          'Se o recorde começar em 0, alguma volta o bate?',
          'Começa com um número enorme: assim a primeira volta é logo recorde.',
          'No arranque: «definir recorde para 1000».',
        ], 'Recorde à espera!'),
        Object.assign(P.evento('botao:A', 'Que botão dá a partida?'), { id: 'sem_a' }),
        P.regra('a_marca', a => !!evA(a) && !dentro(evA(a), 'mk_var_definir', 'mk_tempo'), [
          'Para medir a volta, o que guardas à partida?',
          'Guarda a hora da partida (o tempo de execução) na medida.',
          'No A: «definir medida para tempo de execução».',
        ], 'Partida marcada!'),
        Object.assign(P.evento('botao:B', 'Que botão marca uma volta?'), { id: 'sem_b' }),
        P.regra('b_volta', a => !!evB(a) && !defs(evB(a), 'contador').some(p => temOp(p, '-') && usa(p).some(u => u.tipo === 'mk_tempo')), [
          'Quanto durou a volta? Tempo de agora, tempo da partida…',
          'A volta é tempo − medida (em milissegundos).',
          'No B: «definir contador para» (tempo de execução − medida) ÷ 1000.',
        ], 'Volta medida!'),
        P.regra('b_segundos', a => defs(evB(a), 'contador').some(p => temOp(p, '-')) && !defs(evB(a), 'contador').some(p => temOp(p, '/') && numsDe(p).includes(1000)), [
          'Uma volta de 15 000? Em que unidade está?',
          'Para passar de milissegundos a segundos, divide por 1000.',
          'Põe a subtração dentro de «÷ 1000».',
        ], 'Segundos!'),
        P.regra('b_mostra', a => defs(evB(a), 'contador').some(p => temOp(p, '-')) && !mostraK(evB(a), 'contador'), [
          'Mediste a volta… e o corredor sabe quanto fez?',
          'Mostra a variável com a volta.',
          'No B: «mostrar número» com o contador.',
        ], 'Volta à vista!'),
        P.regra('b_nova', a => mostraK(evB(a), 'contador') && !defs(evB(a), 'medida').some(p => usa(p).some(u => u.tipo === 'mk_tempo')), [
          'A segunda volta está a contar desde a partida? Quando começa a volta nova?',
          'Depois de marcar a volta, marca a nova partida.',
          'No fim do B: «definir medida para tempo de execução».',
        ], 'Cada volta conta só a sua!'),
        P.regra('b_recorde', a => defs(evB(a), 'medida').length > 0 && !ses(evB(a)).some(s => compara(s) && planoDe(s.sim).some(p => p.tipo === 'mk_var_definir' && p.var === 'recorde')), [
          'Foi a volta mais rápida até agora? Quem guarda a melhor?',
          'Se a volta for menor que o recorde, passa a ser o recorde.',
          'No B: «se contador < recorde então definir recorde para» contador.',
        ], 'Recorde guardado!'),
        P.regra('recorde_sinal', a => ses(evB(a)).some(s => compara(s, '>') && varsDe(s)[0] === 'contador' && planoDe(s.sim).some(p => p.var === 'recorde')), [
          ['surpreendida', 'O recorde nunca muda? Uma volta melhor é mais curta ou mais comprida?'],
          'A melhor volta é a que demora menos: «<».',
          'Troca o sinal: contador < recorde.',
        ], 'Menos é melhor!'),
        Object.assign(P.evento('botao:AB', 'E no fim, como vês a melhor volta?'), { id: 'sem_ab' }),
        P.regra('ab_mostra', a => !!evAB(a) && !mostraK(evAB(a), 'recorde'), [
          'A melhor volta está guardada em que variável?',
          'Está no recorde.',
          'No A+B: «mostrar número» com o recorde.',
        ], 'Recorde à vista!'),
      ],
      sucesso: 'Cronómetro de voltas pronto! O recorde guarda o mínimo: compara cada volta e fica com a menor. Assim fazem os árbitros a sério.',
      extensao: 'Mostra também quantas voltas foram e a média das voltas (soma ÷ número de voltas).',
      gambiarra: {
        xml: prog(INI(seq(definirN('recorde', 1000))), BA(seq(definir('medida', tempoB))),
          BB(seq(definir('contador', conta(V('A', conta(V('A', tempoB), '-', VB('medida'))), '/', N('B', 1000))), numero(vr('contador')), definir('medida', tempoB),
            seEntao(cmp('&gt;', VA('contador'), VB('recorde')), definir('recorde', vr('contador'))))),
          BAB(seq(numero(vr('recorde'))))),
        pedido: 'O meu recorde fica sempre em 1000! Ninguém o bate, por mais depressa que corra. Encontras a gambiarra?',
      },
    },
  };

  // ---------------------------------------------------------------- Nível 3 · 11 · Jogo do 21
  const VINTEUM = {
    titulo: 'Jogo do 21',
    missao: 'Jogo do 21 com 3 vidas: agita para tirar uma carta (1 a 10) e somá-la; se passares do 21, perdes uma vida e recomeças do zero. O A mostra as vidas.',
    passos: [
      'No arranque: «definir vidas para 3» e «definir pontos para 0».',
      'Em agitar: «definir contador para» ao acaso de 1 até 10 (a carta) e mostra-a; «mudar pontos em» contador e mostra os pontos.',
      'Depois: «se pontos > 21 então»: cara triste, «mudar vidas em -1» e «definir pontos para 0».',
      'No A: mostra as vidas.',
      'Desafio: para no 19, 20 ou 21 — o mais perto possível sem rebentar!',
    ],
    material: 'micro:bit (e um baralho de cartas, para jogar também à moda antiga)',
    novos: ['mt_definir_vidas', 'mt_mudar_vidas', 'mt_var_vidas', 'mt_comparar_maior'],
    caixa: ['mk_iniciar', 'mk_agitar', 'mk_botao', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mt_var_pontos', 'mk_aleatorio', 'mk_mostrar_numero', 'mk_se_entao', 'mk_icone'],
    teste: 'agitar',
    // cada carta (1–10) soma aos pontos; acima de 21: triste, menos uma vida e pontos a 0; o A mostra as vidas
    ok: r => {
      let boas = 0, rebentou = 0, aOk = 0;
      for (const s of linha(r)) {
        if (!s.outs.length) continue;
        if (s.v === 'agitar') {
          const ns = numsO(s);
          const pts0 = s.vi.pontos ?? 0, vid0 = s.vi.vidas;
          if (ns.length < 2) return false;
          const c = ns[0], soma = ns[1];
          if (c < 1 || c > 10 || soma !== pts0 + c) return false;
          const triste = s.outs.some(o => o.v === 'icone:Sad');
          if (soma > 21) {
            if (!triste || s.vf.pontos !== 0 || vid0 === undefined || s.vf.vidas !== vid0 - 1) return false;
            rebentou++;
          } else if (triste || s.vf.pontos !== soma) return false;
          boas++;
        } else if (s.v === 'botao:A') {
          if (ultimo(numsO(s)) !== s.vi.vidas) return false;
          aOk++;
        }
      }
      return boas >= 6 && rebentou >= 1 && aOk >= 1;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Jogo do 21: tiras cartas e somas… mas se passares do 21, rebentas! Tens 3 vidas.'],
      parecePronto: a => {
        const g = evAg(a);
        return defs(evIni(a), 'vidas').some(p => p.n === 3) && defs(g, 'contador').some(temAcaso) && muds(g, 'pontos').some(p => p.n === 'var:contador') &&
          mostraK(g, 'pontos') && ses(g).some(s => compara(s, '>') && planoDe(s.sim).some(p => p.tipo === 'mk_var_mudar' && p.var === 'vidas') &&
          planoDe(s.sim).some(p => p.tipo === 'mk_var_definir' && p.var === 'pontos' && p.n === 0)) && mostraK(evA(a), 'vidas');
      },
      testar: 'Tens uma ideia? Vamos testar! Agita muitas vezes até rebentar, e carrega no A para ver as vidas.',
      regras: [
        Object.assign(P.evento('inicio', 'Com quantas vidas começa o jogo? Quando o guardas?'), { id: 'sem_inicio' }),
        P.regra('inicio_vidas', a => !!evIni(a) && !defs(evIni(a), 'vidas').some(p => p.n === 3), [
          'Quantas vidas tem o jogador ao começar?',
          'As vidas ficam na variável vidas.',
          'No arranque: «definir vidas para 3».',
        ], 'Três vidas!'),
        Object.assign(P.evento('agitar', 'Como se tira uma carta? Abana o baralho…'), { id: 'sem_agitar' }),
        P.regra('sem_carta', a => !!evAg(a) && !defs(evAg(a), 'contador').some(temAcaso), [
          'A carta sai ao acaso. Onde a guardas, para depois a somar?',
          'Guarda a carta no contador.',
          'Em agitar: «definir contador para» escolher ao acaso de 1 até 10.',
        ], 'Carta tirada!'),
        P.regra('limites', a => defs(evAg(a), 'contador').some(p => { const l = limitesU(p); return l && (l[0] !== 1 || l[1] !== 10); }), [
          'As cartas valem de quanto a quanto?',
          'O «escolher ao acaso» vai do mais pequeno ao maior.',
          'Escreve de 1 até 10.',
        ], 'Cartas certas!'),
        P.regra('sem_soma', a => defs(evAg(a), 'contador').some(temAcaso) && !muds(evAg(a), 'pontos').some(p => p.n === 'var:contador'), [
          'Tiraste a carta. E a tua soma?',
          'Junta a carta aos pontos.',
          'Em agitar: «mudar pontos em» contador.',
        ], 'Soma a crescer!'),
        P.regra('sem_mostrar', a => muds(evAg(a), 'pontos').length > 0 && !(mostraK(evAg(a), 'contador') && mostraK(evAg(a), 'pontos')), [
          'O jogador vê a carta e a soma?',
          'Mostra a carta (contador) e depois a soma (pontos).',
          'Em agitar: «mostrar número» com o contador e outro com os pontos.',
        ], 'Tudo à vista!'),
        P.regra('sem_se', a => muds(evAg(a), 'pontos').length > 0 && !ses(evAg(a)).length, [
          'Passaste do 21! O micro:bit deu por isso?',
          'Pergunta depois de somar: os pontos são maiores que 21?',
          'Em agitar, no fim: «se pontos > 21 então».',
        ], 'Agora vigia o 21!'),
        P.regra('se_vinte_um', a => ses(evAg(a)).length > 0 && !ses(evAg(a)).some(s => compara(s, '>') && numsDe(s).includes(21) && varsDe(s).includes('pontos')), [
          'Rebenta-se quando a soma passa de que número?',
          'A condição é: pontos > 21.',
          'Escreve pontos > 21 na comparação.',
        ], 'Vinte e um é o limite!'),
        P.regra('sem_vida', a => ses(evAg(a)).some(s => compara(s, '>')) && !ses(evAg(a)).some(s => planoDe(s.sim).some(p => p.tipo === 'mk_var_mudar' && p.var === 'vidas')), [
          'Rebentaste… e as vidas continuam iguais?',
          'Dentro do «então», tira uma vida.',
          'No «então»: «mudar vidas em -1».',
        ], 'Menos uma vida!'),
        P.regra('sem_recomeco', a => ses(evAg(a)).some(s => planoDe(s.sim).some(p => p.var === 'vidas')) && !ses(evAg(a)).some(s => planoDe(s.sim).some(p => p.tipo === 'mk_var_definir' && p.var === 'pontos' && p.n === 0)), [
          'Depois de rebentar, a soma continua lá em cima? Assim rebentas sempre!',
          'Ao rebentar, a soma volta ao zero.',
          'No «então»: «definir pontos para 0».',
        ], 'Recomeça do zero!'),
        Object.assign(P.evento('botao:A', 'Como vês quantas vidas te restam?'), { id: 'sem_a' }),
        P.regra('a_mostra', a => !!evA(a) && !mostraK(evA(a), 'vidas'), [
          'As vidas estão em que variável?',
          'Mostra a variável vidas.',
          'No A: «mostrar número» com o bloco «vidas».',
        ], 'Vidas à vista!'),
      ],
      sucesso: 'Jogo do 21 pronto! Somar, comparar com 21 e perder vidas: a lógica de um jogo de cartas a sério.',
      extensao: 'E se o A+B fosse «parar» e mostrasse uma cara contente quando ficas entre 19 e 21?',
      gambiarra: {
        xml: prog(INI(seq(definirN('vidas', 3), definirN('pontos', 0))),
          AG(seq(definir('contador', acaso(1, 10)), numero(vr('contador')), mudarV('pontos', vr('contador')), numero(vr('pontos')),
            seEntao(cmp('&gt;', VA('pontos'), N('B', 21)), icone('Sad'), mudar('vidas', -1)))),
          BA(seq(numero(vr('vidas'))))),
        pedido: 'Rebentei uma vez e agora perco uma vida a cada carta! Encontras a gambiarra?',
      },
    },
  };


  F.registarMissao({
    id: 'matematica',
    titulo: 'Matemática',
    tema: 'Contar, medir, padrões',
    descricao: 'Contadores, dados, padrões de luz e jogos de números.',
    cor: '#9400d3',
    xml: XML,
    // 11 desafios por nível (1–6 curtos, 7–11 projetos de 15–20 min); o 12.º, projeto livre, é gerado pelo motor
    niveis: [
      { nome: 'Nível 1 · Números', desafios: [SORTE, CONTADOR, PASSOS, DECRESCENTE, DADO, PLACAR, DUELO, RETA, CINCO, SORTEIO, MEALHEIRO] },
      { nome: 'Nível 2 · Contas e padrões', desafios: [TABUADA, DOBRO, PAR, DIAGONAL, QUIZ, MOEDAS, MESA, XADREZ, PIM, SONDAGEM, FIBONACCI] },
      { nome: 'Nível 3 · Jogos de números', desafios: [BARRA, META, CRONOMETRO, POTENCIAS, MAIOR, ADIVINHA, REFLEXOS, MAISMENOS, ESTATISTICA, VOLTAS, VINTEUM] },
    ],
    livres: [
      { titulo: 'Inventa um jogo de números', missao: 'Agora é contigo: inventa um jogo de números com os blocos do nível 1.',
        passos: ['Ideias: uma corrida de dados, contar de 2 em 2, um placar para o recreio…', 'Experimenta no micro:bit do ecrã.', 'Envia para o micro:bit e joga com a turma.'] },
      { titulo: 'Inventa um padrão', missao: 'Agora é contigo: inventa um padrão de luzes, uma máquina de contas ou um jogo de par ou ímpar.',
        passos: ['Tens contas, «se», resto da divisão e luzes x/y.', 'Ideias: o padrão das riscas, a tabuada-surpresa, o PUM nos múltiplos de 5…', 'Experimenta e mostra à turma.'] },
      { titulo: 'Inventa um jogo', missao: 'Agora é contigo: inventa um jogo de números para jogar com a tua turma — com todos os blocos.',
        passos: ['Tens os blocos de números, variáveis, contas, comparações… e muito mais.', 'Ideias: corrida de dados, contagem até 100, tabuada-surpresa, um jogo de memória…', 'Experimenta, envia e desafia a turma.'] },
    ],
  });
})();
