/* Missão «Natureza» — biodiversidade em Messejana.
 *
 * O micro:bit vai lá para fora: horta, oliveiras, ninhos de cegonha e de andorinha, abelhas,
 * corujas, o calor do verão e a geada do inverno. Nível 1: observar (ler os sensores);
 * nível 2: cuidar (decidir com «se», atuar com LED e servo); nível 3: investigar (guardar dados,
 * contar, comparar e automatizar). Em cada nível: 1–6 curtos, 7–11 projetos de 15–20 min, 12 projeto livre (gerado).
 * Material: micro:bit V2, crocodilos, 2 pregos (humidade da terra: um no pin 1, outro no 3V),
 * LED, servomotor SG90.
 * Textos para qualquer mascote: {ola}, [o|a], ou { nico: '…', gabi: '…', _: '…' }.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const P = F.pistas;
  const { icones, tem, blocos, dentro, soltoCom } = F.ajudasTutor;
  const { causou, numeros, valorDe, aposSensor, houve } = F.verif;

  // ------------------------------------------------------------ ajudas de leitura do programa
  // lista plana de tudo o que está num evento, incluindo dentro de «repetir» e dos dois ramos do «se»
  const plano = seq => (seq || []).flatMap(d => [d, ...plano(d.corpo), ...plano(d.sim), ...plano(d.nao)]);
  const ses = e => e ? plano(e.seq).filter(d => d.tipo === 'mk_se' || d.tipo === 'mk_se_entao') : [];
  const usa = (d, tipo) => (d.usa || []).some(u => u.tipo === tipo);
  const opDe = d => ((d.usa || []).find(u => u.tipo === 'mk_comparar') || {}).op;
  const ramo = (d, k) => plano(d[k]);
  const temIcone = (lista, nome) => lista.some(p => p.tipo === 'mk_icone' && p.icone === nome);
  const servos = lista => lista.filter(p => p.tipo === 'mk_servo').map(p => Number(p.angulo));
  const com = (id, regra) => Object.assign(regra, { id });   // dar um nome curto às regras das receitas

  // ------------------------------------------------------------ ajudas de verificação (registo)
  // valor do sensor antes da posição i do registo (o último que a criança escolheu)
  function sensorEm(reg, i, k, def) {
    for (let j = i - 1; j >= 0; j--) if (reg[j].dir === 'in' && reg[j].v.startsWith(k + ':')) return valorDe(reg[j].v);
    return def;
  }
  // para cada vez que aconteceu a entrada, as saídas até à entrada seguinte
  function vezes(reg, entrada) {
    const out = [];
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== entrada) continue;
      const s = [];
      for (let j = i + 1; j < reg.length && reg[j].dir === 'out' && reg[j].t - reg[i].t <= 8000; j++) s.push(reg[j].v);
      out.push({ i, s });
    }
    return out;
  }
  const angulos = s => s.filter(x => x.startsWith('servo:')).map(x => Number(x.split(':')[2]));

  // ------------------------------------------------------------ XML (gambiarras e caixa)
  const N = (n, v) => `<value name="${n}"><shadow type="mk_num"><field name="NUM">${v}</field></shadow></value>`;
  const TX = (n, t) => `<value name="${n}"><shadow type="mk_texto"><field name="TXT">${t}</field></shadow></value>`;
  const V = (n, bloco) => `<value name="${n}">${bloco}</value>`;
  const NOTA = (f, bat = 1) => `<value name="F"><shadow type="mk_nota_menu"><field name="V">${f}</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">${bat}</field></shadow></value>`;
  const ANALOG = '<block type="mk_ler_analogico"><field name="P">P1</field></block>';

  const XML = {
    mk_var_mudar_pontos: '<block type="mk_var_mudar"><field name="VAR">pontos</field>' + N('V', 1) + '</block>',
    mk_var_pontos: '<block type="mk_var"><field name="VAR">pontos</field></block>',
    mk_var_definir_medida: '<block type="mk_var_definir"><field name="VAR">medida</field>' + N('V', 0) + '</block>',
    mk_var_medida: '<block type="mk_var"><field name="VAR">medida</field></block>',
    mk_var_definir_recorde: '<block type="mk_var_definir"><field name="VAR">recorde</field>' + N('V', 0) + '</block>',
    mk_var_recorde: '<block type="mk_var"><field name="VAR">recorde</field></block>',
    mk_conta_menos: '<block type="mk_conta"><field name="OP">-</field>' + N('A', 0) + N('B', 0) + '</block>',
    mk_registar_temp: '<block type="mk_registar">' + TX('NOME', 'temperatura') + N('V', 0) + '</block>',
    mk_registar_humidade: '<block type="mk_registar">' + TX('NOME', 'humidade') + N('V', 0) + '</block>',
    mk_registar_rega: '<block type="mk_registar">' + TX('NOME', 'rega') + N('V', 0) + '</block>',
    mk_ler_analogico_p0: '<block type="mk_ler_analogico"><field name="P">P0</field></block>',
  };

  // ============================================================ NÍVEL 1 · OBSERVAR
  const SOL_SOMBRA = {
    titulo: 'Sol ou sombra',
    missao: 'Quando carregas no A, o micro:bit mostra quanta luz há aí.',
    passos: ['Usa «no botão A premido» com «mostrar número».', 'Encaixa «nível de luz» no buraco do número.', 'Experimenta ao sol e à sombra: mexe na luz e carrega em A outra vez.'],
    material: 'micro:bit',
    novos: ['mk_botao', 'mk_mostrar_numero', 'mk_luz'],
    caixa: ['mk_botao', 'mk_mostrar_numero', 'mk_luz'],
    teste: 'botao:A',
    // duas medições com luz diferente, e cada uma mostra a luz daquele momento
    ok: r => {
      const certas = vezes(r, 'botao:A').filter(({ i, s }) => s.includes('numero:' + sensorEm(r, i, 'luz', 150)));
      return new Set(certas.map(({ i }) => sensorEm(r, i, 'luz', 150))).size >= 2;
    },
    tutor: {
      boasVindas: ['boas_vindas', '{ola} Hoje somos cientistas da horta. As plantas gostam de sol ou de sombra? Vamos medir a luz!'],
      parecePronto: a => dentro(a.evento('botao:A'), 'mk_mostrar_numero', 'mk_luz'),
      testar: 'Tens uma ideia? Vamos testar! Carrega em A, depois muda a luz e carrega outra vez.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Queres medir só quando decides tu. O que é que no micro:bit pode dizer «agora!»?')),
        com('sem_numero', P.bloco('botao:A', 'mk_mostrar_numero', 'Já sabe quando medir. E como é que te mostra quanta luz há?')),
        com('sem_luz', P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_luz', 'O número que aparece é sempre o mesmo… mas a luz do sol muda! Quem é que mede a luz?')),
      ],
      sucesso: 'Medição feita! Ao sol o número é grande, à sombra é pequeno. Já és cientista da horta.',
      extensao: 'Mede ao pé de três plantas diferentes. Qual delas apanha mais sol?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_mostrar_numero">' + N('N', 0) + '</block></statement></block></xml>',
        pedido: 'Fui medir a luz ao sol e à sombra… e deu sempre 0! Estou a fazer alguma coisa mal?',
      },
    },
  };

  const BICHO_CONTADOR = {
    titulo: 'Bicho-contador',
    missao: 'Cada vez que vês um bicho, carregas no A e o micro:bit conta mais um.',
    passos: ['Dentro de «no botão A premido»: «mudar contador em 1».', 'Depois mostra o número do contador.', 'Experimenta: carrega em A três vezes.'],
    material: 'micro:bit, olhos atentos',
    novos: ['mk_var_mudar', 'mk_var'],
    caixa: ['mk_botao', 'mk_var_mudar', 'mk_var', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => { const n = numeros(r); return n.includes(1) && n.includes(2) && n.includes(3); },
    tutor: {
      boasVindas: ['boas_vindas', 'Quantos bichos há na horta? Formigas, joaninhas, borboletas… Vamos fazer um contador de bichos.'],
      parecePronto: a => tem(a.evento('botao:A'), 'mk_var_mudar') && dentro(a.evento('botao:A'), 'mk_mostrar_numero', 'mk_var'),
      testar: 'Tens uma ideia? Vamos testar! Carrega em A três vezes: deve dar 1, 2, 3.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Quando vês um bicho, como é que avisas o micro:bit?')),
        com('sem_mudar', P.bloco('botao:A', 'mk_var_mudar', 'Para contar, o micro:bit tem de se lembrar de quantos já viu. Onde é que ele guarda essa conta?')),
        com('sem_numero', P.bloco('botao:A', 'mk_mostrar_numero', 'O micro:bit já conta às escondidas. Como é que nos mostra a conta?')),
        com('sem_var', P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_var', 'Aparece sempre o mesmo número. Qual é o número que está a crescer?')),
      ],
      sucesso: 'Um, dois, três bichos! Contar é a primeira coisa que os cientistas fazem no campo.',
      extensao: 'E se o B tirasse um, para quando contas o mesmo bicho duas vezes?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_mostrar_numero">' + V('N', '<block type="mk_var"><field name="VAR">contador</field></block>') + '</block></statement></block></xml>',
        pedido: 'Já vi cinco joaninhas e o meu contador diz sempre 0! O que é que me esqueci?',
      },
    },
  };

  const DIA_NOITE = {
    titulo: 'Dia e noite',
    missao: 'O micro:bit dorme quando fica escuro e acorda quando há luz.',
    passos: ['Dentro de «para sempre»: «se está escuro então … senão …».', 'Em cima, o ícone a dormir. Em baixo, o contente.', 'Experimenta: mexe na luz para pouco e para muito.'],
    material: 'micro:bit',
    novos: ['mk_sempre', 'mk_se', 'mk_icone_dormir'],
    caixa: ['mk_sempre', 'mk_se', 'mk_icone_dormir', 'mk_icone'],
    teste: 'luz',
    ok: r => aposSensor(r, 'luz', v => v < 40, s => s.includes('icone:Asleep')) && aposSensor(r, 'luz', v => v >= 40, s => s.includes('icone:Happy')),
    tutor: {
      boasVindas: ['boas_vindas', 'As galinhas deitam-se quando o sol se põe. O micro:bit também pode! Vamos fazê-lo dormir de noite.'],
      parecePronto: a => ses(a.evento('sempre')).some(d => usa(d, 'mk_escuro') && temIcone(ramo(d, 'sim'), 'Asleep') && temIcone(ramo(d, 'nao'), 'Happy')),
      testar: 'Tens uma ideia? Vamos testar! Baixa a luz até ao fim, depois volta a subir.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A noite pode chegar a qualquer momento. Quem é que fica sempre de vigia?')),
        com('sem_se', P.bloco('sempre', 'mk_se', 'Há duas hipóteses: está escuro ou não está. Que bloco escolhe entre duas coisas?')),
        com('trocados', P.regra('trocados', a => ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'nao'), 'Asleep') && temIcone(ramo(d, 'sim'), 'Happy')), [
          ['surpreendida', 'Ui! Então dorme de dia e acorda de noite? Parece uma coruja!'],
          'Lê o «se» em voz alta: «se está escuro então…». O que deve fazer quando está escuro?',
          'Troca: o ícone a dormir vai para cima, o contente para baixo (no «senão»).',
        ], 'Agora sim, dorme de noite!')),
        com('sem_dormir', P.regra('sem_dormir', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'sim'), 'Asleep')), [
          'Quando está escuro, o que é que o micro:bit faz?',
          'Há um ícone com os olhos fechados.',
          'Põe «mostrar ícone» a dormir logo a seguir ao «se está escuro então».',
        ], 'Boa noite, micro:bit!')),
        com('sem_acordado', P.regra('sem_acordado', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'nao'), 'Happy')), [
          'E quando volta a luz? Fica a dormir para sempre?',
          'O «senão» é o que acontece quando não está escuro.',
          'Põe o ícone contente no «senão».',
        ], 'Bom dia!')),
      ],
      sucesso: 'Dorme de noite e acorda de manhã, como os pardais. O sensor de luz é o relógio da natureza.',
      extensao: 'E se ao acordar tocasse um som, como um galo?',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se">' + V('C', '<block type="mk_escuro"></block>') +
          '<statement name="SIM"><block type="mk_icone"><field name="I">Happy</field></block></statement><statement name="NAO"><block type="mk_icone"><field name="I">Asleep</field></block></statement></block></statement></block></xml>',
        pedido: 'O meu micro:bit está todo trocado: dorme ao meio-dia e fica acordado à noite! Ajudas-me?',
      },
    },
  };

  const CANTO_PASSARO = {
    titulo: 'Canto do pássaro',
    missao: 'Quando carregas no A, o micro:bit canta como um pássaro: pelo menos três notas diferentes.',
    passos: ['Usa «no botão A premido».', 'Põe lá dentro três «tocar tom», um a seguir ao outro.', 'Escolhe notas diferentes e experimenta.'],
    material: 'micro:bit V2 (altifalante)',
    novos: ['mk_tom'],
    caixa: ['mk_botao', 'mk_tom', 'mk_pausa', 'mk_repetir'],
    teste: 'botao:A',
    ok: r => vezes(r, 'botao:A').some(({ s }) => new Set(s.filter(x => x.startsWith('tom:'))).size >= 3),
    tutor: {
      boasVindas: ['boas_vindas', 'Na primavera as andorinhas chegam a cantar. Vamos inventar um canto de pássaro?'],
      parecePronto: a => new Set(blocos(a.evento('botao:A'), 'mk_tom').map(p => p.freq)).size >= 3,
      testar: 'Tens uma ideia? Vamos testar! Carrega em A e ouve o teu pássaro.',
      regras: [
        com('sem_a', P.evento('botao:A', 'O pássaro canta quando tu quiseres. Como é que lhe dizes «canta!»?')),
        com('sem_tom', P.bloco('botao:A', 'mk_tom', 'Um pássaro sem voz… Que bloco faz o micro:bit tocar uma nota?')),
        com('poucas', P.regra('poucas_notas', a => { const t = blocos(a.evento('botao:A'), 'mk_tom'); return t.length > 0 && t.length < 3; }, [
          'Um canto com uma nota só parece um apito. Quantas notas tem o canto de um pássaro?',
          'Junta mais «tocar tom» por baixo, até teres pelo menos três.',
          'Arrasta mais dois «tocar tom» para dentro do botão A.',
        ], 'Agora já é uma melodia!')),
        com('iguais', P.regra('notas_iguais', a => { const t = blocos(a.evento('botao:A'), 'mk_tom'); return t.length >= 3 && new Set(t.map(p => p.freq)).size < 3; }, [
          ['a_pensar', 'Três notas iguais… pi, pi, pi. Os pássaros sobem e descem!'],
          'Carrega na setinha de cada nota e escolhe outra.',
          'Escolhe três notas diferentes, por exemplo Sol, Mi e Dó alto.',
        ], 'Que canto bonito!')),
      ],
      sucesso: 'Piu-piu! Inventaste um canto. Cada pássaro tem o seu: é assim que se reconhecem uns aos outros.',
      extensao: 'Grava o canto de um pássaro de verdade com o telemóvel e tenta imitá-lo com as notas.',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_tom">' + NOTA(262) + '<next><block type="mk_tom">' + NOTA(262) + '<next><block type="mk_tom">' + NOTA(262) + '</block></next></block></next></block></statement></block></xml>',
        pedido: 'O meu pássaro só sabe uma nota: dó, dó, dó! Parece um despertador. Ajudas-me a pô-lo a cantar?',
      },
    },
  };

  const NINHO = {
    titulo: 'Temperatura do ninho',
    missao: 'Quando carregas no B, o micro:bit mostra a temperatura em graus.',
    passos: ['Usa «no botão B premido» com «mostrar número».', 'Encaixa «temperatura (°C)» no número.', 'Experimenta: muda a temperatura e carrega em B.'],
    material: 'micro:bit',
    novos: ['mk_botao_B', 'mk_temperatura'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_mostrar_numero', 'mk_temperatura', 'mk_luz'],
    teste: 'botao:B',
    ok: r => vezes(r, 'botao:B').some(({ i, s }) => s.includes('numero:' + sensorEm(r, i, 'temperatura', 21))),
    tutor: {
      boasVindas: ['boas_vindas', 'As cegonhas fazem ninho lá no alto. Estará quente ou frio lá em cima? Vamos fazer um termómetro.'],
      parecePronto: a => dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_temperatura'),
      testar: 'Tens uma ideia? Vamos testar! Muda a temperatura e carrega em B.',
      regras: [
        com('sem_b', P.evento('botao:B', 'Desta vez é o outro botão que manda medir. Qual é?')),
        com('sem_numero', P.bloco('botao:B', 'mk_mostrar_numero', 'A temperatura é um número. Como é que o micro:bit mostra números?')),
        com('luz_em_vez', P.regra('luz_em_vez', a => dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_luz'), [
          ['surpreendida', 'Hmm, isso mede o calor ou a luz? Ao sol há luz e calor, mas não são a mesma coisa!'],
          'Procura um bloco cor-de-rosa que fala em graus.',
          'Troca «nível de luz» por «temperatura (°C)».',
        ], 'Agora é mesmo um termómetro!')),
        com('sem_temp', P.valorEm('botao:B', 'mk_mostrar_numero', 'mk_temperatura', 'Aparece sempre o mesmo número, faça calor ou frio. Quem mede o calor?')),
      ],
      sucesso: 'Termómetro pronto! O micro:bit mede a temperatura lá dentro dele: ao sol aquece mais do que o ar.',
      extensao: 'Mede à sombra de uma oliveira e ao sol. Quantos graus de diferença?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><field name="B">B</field><statement name="DO"><block type="mk_mostrar_numero">' + V('N', '<block type="mk_luz"></block>') + '</block></statement></block></xml>',
        pedido: 'O meu termómetro diz 150 graus! Até as cegonhas fugiam. Acho que fiz uma gambiarra…',
      },
    },
  };

  const GUARDIA_HORTA = {
    titulo: 'Guardiã da horta',
    missao: 'Dois pregos na terra e o micro:bit mostra num gráfico se a terra está seca ou molhada.',
    passos: ['Pregos na terra: crocodilo de um ao pin 1, do outro ao 3V.', 'Dentro de «para sempre»: gráfico de barras da «leitura analógica pin P1» até 1023.', 'Experimenta: mexe no pin 1 (terra seca ↔ molhada).'],
    material: 'micro:bit, 2 crocodilos, 2 pregos, um vaso com terra',
    novos: ['mk_grafico', 'mk_ler_analogico'],
    caixa: ['mk_sempre', 'mk_grafico', 'mk_ler_analogico', 'mk_luz', 'mk_pausa'],
    sim: ['analogico:P1'],
    teste: 'analogico:P1',
    ok: r => aposSensor(r, 'analogico:P1', v => v >= 900, s => s.some(x => /^grafico:(2[2-5])$/.test(x))) &&
      aposSensor(r, 'analogico:P1', v => v >= 400 && v <= 620, s => s.some(x => /^grafico:(1[0-5])$/.test(x))) &&
      aposSensor(r, 'analogico:P1', v => v <= 50, s => s.some(x => /^grafico:[0-2]$/.test(x))),
    tutor: {
      boasVindas: ['boas_vindas', 'As alfaces têm sede no verão alentejano! Vamos pôr o micro:bit a vigiar a terra da horta.'],
      parecePronto: a => dentro(a.evento('sempre'), 'mk_grafico', 'mk_ler_analogico') && blocos(a.evento('sempre'), 'mk_grafico').some(p => Number(p.max) === 1023),
      testar: 'Tens uma ideia? Vamos testar! Mexe no pin 1: terra seca, meio, molhada.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A terra seca devagarinho, ao longo do dia. Quem é que fica a vigiar sem parar?')),
        com('sem_grafico', P.bloco('sempre', 'mk_grafico', 'Como é que o micro:bit mostra «muito» ou «pouco» com as luzes?')),
        com('luz_em_vez', P.regra('luz_em_vez', a => dentro(a.evento('sempre'), 'mk_grafico', 'mk_luz') && !dentro(a.evento('sempre'), 'mk_grafico', 'mk_ler_analogico'), [
          ['a_pensar', 'A luz diz-nos se há sol… e a água na terra, quem nos diz?'],
          'Os pregos estão ligados ao pin 1. Procura o bloco que lê um pin.',
          'Troca «nível de luz» por «leitura analógica pin P1».',
        ], 'Agora sim, mede a terra!')),
        com('sem_pino', P.valorEm('sempre', 'mk_grafico', 'mk_ler_analogico', 'Com água, a eletricidade passa melhor de um prego para o outro. Como é que o micro:bit lê o pin 1?')),
        com('maximo', P.regra('maximo', a => blocos(a.evento('sempre'), 'mk_grafico').some(p => p.max != null && Number(p.max) !== 1023), [
          'O gráfico enche-se cedo demais. Até quanto vai a leitura de um pin?',
          'A leitura analógica vai de 0 a 1023.',
          'No «até» do gráfico escreve 1023.',
        ], 'Agora o gráfico está certinho!')),
      ],
      sucesso: 'A guardiã está de vigia! Terra molhada, muitas luzes; terra seca, poucas. A água conduz a eletricidade.',
      extensao: 'Mede um vaso regado e outro seco. Rega um pouco e vê o gráfico subir.',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_grafico">' + V('V', '<block type="mk_luz"></block>') + N('MAX', 1023) + '</block></statement></block></xml>',
        pedido: 'Reguei as alfaces e o meu gráfico não mexeu nada! Só muda quando passa uma nuvem… O que é que fiz?',
      },
    },
  };

  // ============================================================ NÍVEL 2 · CUIDAR
  const HORA_REGAR = {
    titulo: 'Hora de regar',
    missao: 'Se a terra está seca, cara triste e uma luz acesa; se está molhada, cara contente e luz apagada.',
    passos: ['Dentro de «para sempre»: «se … então … senão» com «leitura analógica pin P1 < 300».', 'Seca: cara triste e P2 para 1. Molhada: cara contente e P2 para 0.', 'Experimenta: terra seca e terra molhada.'],
    material: 'micro:bit, 2 pregos, LED, 4 crocodilos',
    novos: ['mk_se_senao', 'mk_comparar', 'mk_icone_triste', 'mk_digital_1', 'mk_digital_0'],
    caixa: ['mk_sempre', 'mk_se_senao', 'mk_comparar', 'mk_ler_analogico', 'mk_icone', 'mk_icone_triste', 'mk_digital_1', 'mk_digital_0'],
    sim: ['analogico:P1'],
    teste: 'analogico:P1',
    ok: r => aposSensor(r, 'analogico:P1', v => v < 250, s => s.includes('icone:Sad') && s.includes('digital:P2:1')) &&
      aposSensor(r, 'analogico:P1', v => v > 350, s => s.includes('icone:Happy') && s.includes('digital:P2:0')),
    tutor: {
      boasVindas: ['boas_vindas', 'A horta não fala… mas o micro:bit pode avisar quando as plantas têm sede!'],
      parecePronto: a => ses(a.evento('sempre')).some(d => usa(d, 'mk_comparar') && usa(d, 'mk_ler_analogico') &&
        temIcone(ramo(d, 'sim'), 'Sad') && ramo(d, 'sim').some(p => p.tipo === 'mk_digital' && p.v === 1)),
      testar: 'Tens uma ideia? Vamos testar! Põe a terra seca, depois molhada.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A terra pode secar a qualquer hora. Quem vigia sem parar?')),
        com('sem_se', P.bloco('sempre', 'mk_se', 'Há duas situações: seca ou molhada. Que bloco escolhe entre duas coisas?')),
        com('sem_comparar', P.regra('sem_comparar', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => usa(d, 'mk_comparar')), [
          'Como é que o micro:bit sabe o que é «seco»? Tem de comparar com um número.',
          'Há um bloco verde-azulado que compara dois números: «<».',
          'Encaixa o comparar no «se» e põe «leitura analógica pin P1 < 300».',
        ], 'Já sabe o que é seco!')),
        com('sem_humidade', P.regra('sem_humidade', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_comparar')) && !ses(a.evento('sempre')).some(d => usa(d, 'mk_ler_analogico')), [
          'Está a comparar… mas a comparar o quê? Onde está a humidade da terra?',
          'Os pregos estão no pin 1: precisas da leitura analógica.',
          'Encaixa «leitura analógica pin P1» do lado esquerdo do «<».',
        ], 'Agora compara a terra!')),
        com('ao_contrario', P.regra('ao_contrario', a => ses(a.evento('sempre')).some(d => ['>', '>='].includes(opDe(d)) && temIcone(ramo(d, 'sim'), 'Sad')), [
          ['surpreendida', 'Ui! Fica triste com a terra encharcada? Os patos é que gostavam!'],
          'Leitura pequena quer dizer terra seca. O sinal está virado para que lado?',
          'Troca o «>» por «<».',
        ], 'Agora pede água quando tem sede!')),
        com('sem_triste', P.regra('sem_triste', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_comparar')) && !ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'sim'), 'Sad')), [
          'Quando a terra está seca, que cara faz a planta?',
          'Procura o ícone triste.',
          'Põe a cara triste logo dentro do «então».',
        ], 'Coitadinha, tem sede!')),
        com('sem_led', P.regra('sem_led', a => ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'sim'), 'Sad')) && !ses(a.evento('sempre')).some(d => ramo(d, 'sim').some(p => p.tipo === 'mk_digital' && p.v === 1)), [
          'Quem está longe não vê a carinha. Como é que avisas de longe?',
          'Uma luz de fora no pin 2: «gravação digital pin P2 para 1».',
          'Põe «P2 para 1» no «então» e «P2 para 0» no «senão».',
        ], 'Agora vê-se de longe!')),
      ],
      sucesso: 'Rega à vista! Comparar um número com um limite é o que muitas máquinas fazem: termóstatos, regas, alarmes.',
      extensao: 'O 300 é o melhor limite? Experimenta na terra de verdade e escolhe o teu número.',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se">' +
          V('C', '<block type="mk_comparar"><field name="OP">&gt;</field>' + V('A', ANALOG) + N('B', 300) + '</block>') +
          '<statement name="SIM"><block type="mk_icone"><field name="I">Sad</field><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value>' + N('V', 1) + '</block></next></block></statement>' +
          '<statement name="NAO"><block type="mk_icone"><field name="I">Happy</field><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value>' + N('V', 0) + '</block></next></block></statement></block></statement></block></xml>',
        pedido: 'O meu alarme pede água quando a terra já está um charco! Encontras a gambiarra?',
      },
    },
  };

  const ESPANTALHO = {
    titulo: 'Espantalho',
    missao: 'Quando há um barulho forte, o braço do espantalho abana: o servo vai a 180 e volta a 0.',
    passos: ['Usa «em som alto».', 'Lá dentro: servo a 180, uma pausa, servo a 0.', 'Experimenta: carrega em BATER PALMAS.'],
    material: 'micro:bit V2, servomotor, 3 crocodilos, um braço de cartão',
    novos: ['mk_som_alto', 'mk_servo'],
    caixa: ['mk_som_alto', 'mk_servo', 'mk_pausa', 'mk_repetir', 'mk_icone'],
    teste: 'somalto',
    ok: r => vezes(r, 'somalto').some(({ s }) => { const a = angulos(s); return new Set(a).size >= 2 && Math.max(...a) - Math.min(...a) >= 60; }),
    tutor: {
      boasVindas: ['boas_vindas', 'Os pardais andam a comer as sementes! Vamos fazer um espantalho que mexe o braço quando ouve barulho.'],
      parecePronto: a => new Set(servos(plano((a.evento('somalto') || {}).seq))).size >= 2,
      testar: 'Tens uma ideia? Vamos testar! Carrega em BATER PALMAS.',
      regras: [
        com('sem_som', P.evento('somalto', 'O espantalho acorda com barulho. Que bloco cor-de-rosa ouve?')),
        com('sem_servo', P.bloco('somalto', 'mk_servo', 'Ouviu! E agora, o que é que mexe o braço?')),
        com('uma_posicao', P.regra('uma_posicao', a => { const s = servos(plano((a.evento('somalto') || {}).seq)); return s.length > 0 && new Set(s).size < 2; }, [
          'O braço vai para um sítio e fica lá parado. Isso é abanar?',
          'Para abanar, o braço tem de ir para um lado e depois para o outro.',
          'Junta outro «escrever servo» com outro ângulo: 180 e depois 0.',
        ], 'Agora abana!')),
        com('sem_pausa', P.regra('sem_pausa', a => { const e = a.evento('somalto'); return !!e && new Set(servos(plano(e.seq))).size >= 2 && !tem(e, 'mk_pausa'); }, [
          ['a_pensar', 'No ecrã parece que mexe… mas um servo de verdade precisa de tempo para chegar lá!'],
          'Entre os dois movimentos, espera um bocadinho.',
          'Põe uma «pausa» entre os dois «escrever servo».',
        ], 'Assim o motor tem tempo de chegar!')),
      ],
      sucesso: 'Xô, pardais! O espantalho ouve e mexe-se. Os motores dão braços às nossas invenções.',
      extensao: 'E se abanasse três vezes? Usa «repetir».',
      gambiarra: {
        xml: '<xml><block type="mk_som_alto" x="40" y="40"><statement name="DO"><block type="mk_servo"><field name="P">P0</field>' + N('A', 90) + '</block></statement></block></xml>',
        pedido: 'Bato palmas e o meu espantalho fica com o braço esticado, sem abanar. Os pardais estão a rir-se de mim!',
      },
    },
  };

  const COMEDOURO = {
    titulo: 'Comedouro',
    missao: 'O botão A abre a porta do comedouro dos pássaros e o B fecha-a.',
    passos: ['No botão A: «escrever servo pin P0 para» um ângulo grande (aberto).', 'No botão B: o servo volta a 0 (fechado).', 'Experimenta: A e depois B.'],
    material: 'micro:bit, servomotor, 3 crocodilos, caixa de cartão, sementes',
    novos: ['mk_botao_B'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_servo', 'mk_icone'],
    teste: 'botao:A',
    ok: r => vezes(r, 'botao:A').some(({ s }) => { const a = angulos(s); return a.length && a[a.length - 1] >= 60; }) &&
      vezes(r, 'botao:B').some(({ s }) => { const a = angulos(s); return a.length && a[a.length - 1] <= 20; }),
    tutor: {
      boasVindas: ['boas_vindas', 'No inverno há poucas sementes para os passarinhos. Vamos construir um comedouro com porta!'],
      parecePronto: a => { const sa = servos(plano((a.evento('botao:A') || {}).seq)), sb = servos(plano((a.evento('botao:B') || {}).seq)); return sa.some(x => x >= 60) && sb.some(x => x <= 20); },
      testar: 'Tens uma ideia? Vamos testar! Carrega em A para abrir e em B para fechar.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Quem abre a porta do comedouro? Escolhe um botão.')),
        com('sem_b', P.evento('botao:B', 'A porta abre… e para fechar? Precisas de outro botão.')),
        com('sem_servo_a', P.bloco('botao:A', 'mk_servo', 'O botão A já está à escuta. O que é que roda a porta?')),
        com('sem_servo_b', P.bloco('botao:B', 'mk_servo', 'O botão B também tem de mexer no motor. Com que bloco?')),
        com('igual', P.regra('igual', a => { const sa = servos(plano((a.evento('botao:A') || {}).seq)), sb = servos(plano((a.evento('botao:B') || {}).seq)); return sa.length && sb.length && sa[sa.length - 1] === sb[sb.length - 1]; }, [
          'A e B põem a porta no mesmo sítio. Então como é que fecha?',
          'Fechado é 0 graus. Aberto é um número grande, como 90 ou 180.',
          'Muda o ângulo do B para 0.',
        ], 'Abre e fecha!')),
        com('trocados', P.regra('trocados', a => { const sa = servos(plano((a.evento('botao:A') || {}).seq)), sb = servos(plano((a.evento('botao:B') || {}).seq)); return sa.length && sb.length && sa[sa.length - 1] < sb[sb.length - 1]; }, [
          ['surpreendida', 'Ui! O A fecha e o B abre? A missão pede ao contrário.'],
          '0 graus é fechado, 180 é aberto.',
          'Troca os números: o maior no A, o 0 no B.',
        ], 'Agora sim!')),
      ],
      sucesso: 'Comedouro aberto! Os pássaros agradecem. Abre de manhã e fecha à noite, para os ratos não comerem tudo.',
      extensao: 'E se a porta abrisse sozinha quando há luz (de manhã) e fechasse quando fica escuro?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_servo"><field name="P">P0</field>' + N('A', 180) + '</block></statement></block>' +
          '<block type="mk_botao" x="40" y="200"><field name="B">B</field><statement name="DO"><block type="mk_servo"><field name="P">P0</field>' + N('A', 180) + '</block></statement></block></xml>',
        pedido: 'O meu comedouro nunca fecha e os ratos já descobriram as sementes! Ajudas-me?',
      },
    },
  };

  const ABELHAS = {
    titulo: 'Contador de abelhas',
    missao: 'Uma flor de papel de alumínio no pin 1: cada visita conta mais uma, com um zumbido.',
    passos: ['Crocodilo do pin 1 à flor; segura no GND (és a abelha!).', 'Em «no pin P1 premido»: mudar contador, tocar tom e mostrar o contador.', 'Experimenta: toca no pin 1 três vezes.'],
    material: 'micro:bit, 2 crocodilos, papel de alumínio, cartolina',
    novos: ['mk_pino_tocado', 'mk_tom_livre'],
    caixa: ['mk_pino_tocado', 'mk_var_mudar', 'mk_var', 'mk_mostrar_numero', 'mk_tom_livre', 'mk_icone'],
    teste: 'pino:P1',
    ok: r => { const n = numeros(r); return n.includes(1) && n.includes(2) && n.includes(3) && vezes(r, 'pino:P1').some(({ s }) => s.some(x => x.startsWith('tom:'))); },
    tutor: {
      boasVindas: ['boas_vindas', 'As abelhas visitam as flores do rosmaninho. Quantas visitas recebe uma flor? Vamos contar!'],
      parecePronto: a => { const e = a.eventosDe('pino:')[0]; return !!e && tem(e, 'mk_var_mudar') && tem(e, 'mk_tom') && dentro(e, 'mk_mostrar_numero', 'mk_var'); },
      testar: 'Tens uma ideia? Vamos testar! Toca no pin 1, uma, duas, três vezes.',
      regras: [
        com('sem_pino', P.evento('pino:', 'Quando a abelha pousa, fecha um circuito. Que bloco sente o pin a ser tocado?')),
        com('sem_mudar', P.bloco('pino:', 'mk_var_mudar', 'Cada visita tem de ficar guardada. Onde guarda o micro:bit a conta?')),
        com('sem_numero', P.bloco('pino:', 'mk_mostrar_numero', 'Já conta! E como é que vês quantas visitas já houve?')),
        com('sem_var', P.valorEm('pino:', 'mk_mostrar_numero', 'mk_var', 'Aparece sempre o mesmo número. Qual é o que vai crescendo?')),
        com('sem_zumbido', P.bloco('pino:', 'mk_tom', 'Uma abelha silenciosa? Que bloco faz bzzz?')),
      ],
      sucesso: 'Bzzz, três visitas! As abelhas levam o pólen de flor em flor: sem elas não havia fruta.',
      extensao: 'Faz duas flores (pin 0 e pin 1) e conta as visitas de cada uma. Qual é a preferida?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_var_mudar"><field name="VAR">contador</field>' + N('V', 1) + '</block></statement></block>' +
          '<block type="mk_pino_tocado" x="40" y="200"><field name="P">P1</field><statement name="DO"><block type="mk_tom"><value name="F"><shadow type="mk_num"><field name="NUM">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.25</field></shadow></value>' +
          '<next><block type="mk_mostrar_numero">' + V('N', '<block type="mk_var"><field name="VAR">contador</field></block>') + '</block></next></block></statement></block></xml>',
        pedido: 'A abelha pousa, zumbe… e o meu contador fica sempre no 0! Só conta quando eu carrego no A. Onde está a gambiarra?',
      },
    },
  };

  const GEADA = {
    titulo: 'Alarme de geada',
    missao: 'Se a temperatura descer abaixo de 3 °C, o micro:bit toca um alarme para tapar as plantas.',
    passos: ['Dentro de «para sempre»: «se … então» com «temperatura (°C) < 3».', 'Lá dentro: tocar tom (o alarme).', 'Experimenta: muda a temperatura para 0 e depois para 20.'],
    material: 'micro:bit V2',
    novos: ['mk_se_entao', 'mk_temperatura'],
    caixa: ['mk_sempre', 'mk_se_entao', 'mk_comparar', 'mk_temperatura', 'mk_luz', 'mk_tom', 'mk_icone'],
    teste: 'temperatura',
    ok: r => aposSensor(r, 'temperatura', v => v < 3, s => s.some(x => x.startsWith('tom:'))) &&
      aposSensor(r, 'temperatura', v => v >= 10, s => !s.some(x => x.startsWith('tom:'))),
    tutor: {
      boasVindas: ['boas_vindas', 'Em janeiro, de manhã, a horta às vezes fica branca de geada. Brrr! Vamos fazer um alarme.'],
      parecePronto: a => ses(a.evento('sempre')).some(d => usa(d, 'mk_temperatura') && ['<', '<='].includes(opDe(d)) && ramo(d, 'sim').some(p => p.tipo === 'mk_tom' || p.tipo === 'mk_som')),
      testar: 'Tens uma ideia? Vamos testar! Põe 0 graus, depois 20.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A geada chega de madrugada, quando estamos a dormir. Quem fica de vigia?')),
        com('sem_se', P.regra('sem_se', a => !!a.evento('sempre') && ses(a.evento('sempre')).length === 0, [
          'O alarme só deve tocar quando está muito frio. Que bloco decide «só se…»?',
          'Procura o bloco verde-azulado «se … então».',
          'Põe «se … então» dentro do «para sempre».',
        ], 'Já decide!')),
        com('sem_temp', P.regra('sem_temperatura', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => usa(d, 'mk_temperatura')), [
          'O frio mede-se com quê? Com a luz não é…',
          'Precisas de comparar a «temperatura (°C)» com um número.',
          'No «se», põe «temperatura (°C) < 3».',
        ], 'Agora sente o frio!')),
        com('ao_contrario', P.regra('ao_contrario', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_temperatura') && ['>', '>='].includes(opDe(d))), [
          ['surpreendida', 'Ui! Assim o alarme toca quando está calor!'],
          'Geada é frio: temperatura MENOR do que 3.',
          'Troca o «>» por «<».',
        ], 'Agora é alarme de frio!')),
        com('sem_alarme', P.regra('sem_alarme', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_temperatura')) && !ses(a.evento('sempre')).some(d => ramo(d, 'sim').some(p => p.tipo === 'mk_tom' || p.tipo === 'mk_som')), [
          'Está frio… e ninguém acorda. O que é que faz barulho?',
          'Um bloco laranja de música.',
          'Põe «tocar tom» dentro do «então».',
        ], 'Piiii! Toda a gente acorda!')),
      ],
      sucesso: 'Alarme de geada pronto! Os agricultores tapam as plantas com plástico ou palha quando o frio aperta.',
      extensao: 'E quando está muito calor (mais de 35 °C)? Faz outro aviso diferente.',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se_entao">' +
          V('C', '<block type="mk_comparar"><field name="OP">&lt;</field>' + V('A', '<block type="mk_luz"></block>') + N('B', 3) + '</block>') +
          '<statement name="SIM"><block type="mk_tom">' + NOTA(523) + '</block></statement></block></statement></block></xml>',
        pedido: 'Esta noite geou e o meu alarme nem piou! Mas tocou quando apaguei a luz… Que gambiarra fiz?',
      },
    },
  };

  const CORUJAS = {
    titulo: 'Silêncio, corujas!',
    missao: 'Se houver barulho, a coruja acorda assustada; se estiver calmo, dorme.',
    passos: ['Dentro de «para sempre»: «se … senão» com «nível de som > 100».', 'Barulho: ícone surpreendido. Calma: ícone a dormir.', 'Experimenta: som alto e som baixo.'],
    material: 'micro:bit V2 (microfone)',
    novos: ['mk_som_nivel', 'mk_icone_surpreendido'],
    caixa: ['mk_sempre', 'mk_se_senao', 'mk_comparar', 'mk_som_nivel', 'mk_luz', 'mk_icone_surpreendido', 'mk_icone_dormir'],
    teste: 'som',
    ok: r => aposSensor(r, 'som', v => v > 150, s => s.includes('icone:Surprised')) && aposSensor(r, 'som', v => v < 50, s => s.includes('icone:Asleep')),
    tutor: {
      boasVindas: ['boas_vindas', 'No celeiro velho mora uma coruja-das-torres. De dia ela dorme… se não fizermos barulho!'],
      parecePronto: a => ses(a.evento('sempre')).some(d => usa(d, 'mk_som_nivel') && usa(d, 'mk_comparar') &&
        (temIcone(ramo(d, 'sim'), 'Surprised') || temIcone(ramo(d, 'nao'), 'Surprised')) && (temIcone(ramo(d, 'sim'), 'Asleep') || temIcone(ramo(d, 'nao'), 'Asleep'))),
      testar: 'Tens uma ideia? Vamos testar! Sobe o som, depois baixa.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'O barulho pode aparecer a qualquer momento. Quem fica a escutar?')),
        com('sem_se', P.bloco('sempre', 'mk_se', 'Há duas hipóteses: barulho ou silêncio. Que bloco escolhe entre as duas?')),
        com('sem_som', P.regra('sem_som', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => usa(d, 'mk_som_nivel')), [
          'A coruja acorda com quê? Com luz ou com barulho?',
          'Procura o bloco cor-de-rosa que mede o som.',
          'No «se», compara: «nível de som > 100».',
        ], 'Agora escuta!')),
        com('sem_susto', P.regra('sem_susto', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_som_nivel')) && !ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'sim'), 'Surprised') || temIcone(ramo(d, 'nao'), 'Surprised')), [
          'Quando há barulho, que cara faz a coruja?',
          'Há um ícone com a boca aberta de espanto.',
          'Põe o ícone surpreendido no ramo do barulho.',
        ], 'Que susto!')),
        com('sem_dormir', P.regra('sem_dormir', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_som_nivel')) && !ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'sim'), 'Asleep') || temIcone(ramo(d, 'nao'), 'Asleep')), [
          'E quando volta o silêncio? A coruja fica acordada para sempre?',
          'Há um ícone com os olhos fechados.',
          'Põe o ícone a dormir no outro ramo.',
        ], 'Zzz… de volta ao sono.')),
      ],
      sucesso: 'Shhh! As corujas caçam ratos de noite e dormem de dia. Com menos barulho, há mais bichos à nossa volta.',
      extensao: 'Mede o barulho no recreio e na biblioteca. Onde é que a coruja dormia melhor?',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se">' +
          V('C', '<block type="mk_comparar"><field name="OP">&gt;</field>' + V('A', '<block type="mk_luz"></block>') + N('B', 100) + '</block>') +
          '<statement name="SIM"><block type="mk_icone"><field name="I">Surprised</field></block></statement><statement name="NAO"><block type="mk_icone"><field name="I">Asleep</field></block></statement></block></statement></block></xml>',
        pedido: 'A minha coruja acorda quando acendem a luz, mas dorme no meio da gritaria! Ajudas-me?',
      },
    },
  };

  // ============================================================ NÍVEL 3 · INVESTIGAR
  const DIARIO = {
    titulo: 'Diário da horta',
    missao: 'Cada vez que carregas no A, o micro:bit escreve no diário a humidade da terra.',
    passos: ['No botão A: «registar dados humidade = leitura analógica pin P1».', 'Escreve «humidade» no nome da coluna. Mostra um visto para saberes que gravou.', 'Experimenta: muda a humidade e carrega em A.'],
    material: 'micro:bit V2, 2 pregos, 2 crocodilos',
    novos: ['mk_registar', 'mk_icone_sim'],
    caixa: ['mk_botao', 'mk_registar', 'mk_ler_analogico', 'mk_luz', 'mk_icone_sim', 'mk_mostrar_numero'],
    sim: ['analogico:P1'],
    teste: 'botao:A',
    ok: r => vezes(r, 'botao:A').some(({ i, s }) => s.some(x => { const m = x.match(/^registo:([^:]*):(-?[\d.]+)$/); return m && /humid/i.test(m[1]) && Number(m[2]) === sensorEm(r, i, 'analogico:P1', 0); })),
    tutor: {
      boasVindas: ['boas_vindas', 'Os cientistas escrevem tudo num diário. O micro:bit tem um diário dentro dele: vamos usá-lo!'],
      parecePronto: a => blocos(a.evento('botao:A'), 'mk_registar').some(p => /humid/i.test(String(p.nome))) && dentro(a.evento('botao:A'), 'mk_registar', 'mk_ler_analogico'),
      testar: 'Tens uma ideia? Vamos testar! Muda a humidade e carrega em A.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Queres escrever no diário só quando decides. Quem dá a ordem?')),
        com('sem_registar', P.bloco('botao:A', 'mk_registar', 'Mostrar no ecrã não fica guardado. Que bloco escreve no diário do micro:bit?')),
        com('luz_em_vez', P.regra('luz_em_vez', a => dentro(a.evento('botao:A'), 'mk_registar', 'mk_luz') && !dentro(a.evento('botao:A'), 'mk_registar', 'mk_ler_analogico'), [
          ['a_pensar', 'O diário é da terra… mas estás a guardar a luz!'],
          'A humidade vem dos pregos, no pin 1.',
          'Troca «nível de luz» por «leitura analógica pin P1».',
        ], 'Agora guarda a humidade!')),
        com('sem_humidade', P.valorEm('botao:A', 'mk_registar', 'mk_ler_analogico', 'Estás a guardar sempre 0. Onde está a medida da terra?')),
        com('nome', P.regra('nome', a => blocos(a.evento('botao:A'), 'mk_registar').length > 0 && !blocos(a.evento('botao:A'), 'mk_registar').some(p => /humid/i.test(String(p.nome))), [
          'No diário, a coluna chama-se como? Daqui a uma semana vais saber o que era este número?',
          'O nome da coluna é o texto branco do bloco.',
          'Escreve «humidade» no texto do «registar dados».',
        ], 'Bom nome!')),
      ],
      sucesso: 'Diário escrito! No micro:bit verdadeiro, abre o ficheiro MY_DATA.HTM: tens uma tabela com as tuas medições.',
      extensao: 'Mede todos os dias à mesma hora durante uma semana. A terra seca mais depressa ao sol ou à sombra?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_registar">' + TX('NOME', 'humidade') + V('V', '<block type="mk_luz"></block>') + '</block></statement></block></xml>',
        pedido: 'O meu diário diz que a terra tem sempre 150 de humidade… mesmo depois de chover! O que é que guardei mal?',
      },
    },
  };

  const ESPECIES = {
    titulo: 'Cegonhas e andorinhas',
    missao: 'A conta cegonhas (contador), B conta andorinhas (pontos), A+B mostra as duas contas.',
    passos: ['No A: mudar contador em 1. No B: mudar pontos em 1.', 'No A+B: mostrar o contador, uma pausa, e mostrar os pontos.', 'Experimenta: 3 cegonhas, 2 andorinhas, e A+B.'],
    material: 'micro:bit, binóculos (ou um tubo de cartão)',
    novos: ['mk_botao_AB', 'mk_var_mudar_pontos', 'mk_var_pontos'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_botao_AB', 'mk_var_mudar', 'mk_var', 'mk_var_mudar_pontos', 'mk_var_pontos', 'mk_mostrar_numero', 'mk_pausa'],
    teste: 'botao:AB',
    ok: r => vezes(r, 'botao:AB').some(({ s }) => s.includes('numero:3') && s.includes('numero:2')),
    tutor: {
      boasVindas: ['boas_vindas', 'Em Messejana há ninhos de cegonha nas torres e andorinhas debaixo dos beirais. Quantas de cada?'],
      parecePronto: a => {
        const va = blocos(a.evento('botao:A'), 'mk_var_mudar').map(p => p.var), vb = blocos(a.evento('botao:B'), 'mk_var_mudar').map(p => p.var);
        const mostrados = new Set(plano((a.evento('botao:AB') || {}).seq).filter(p => p.tipo === 'mk_mostrar_numero').flatMap(p => p.usa.filter(u => u.tipo === 'mk_var').map(u => u.var)));
        return va.length && vb.length && va[0] !== vb[0] && mostrados.has(va[0]) && mostrados.has(vb[0]);
      },
      testar: 'Tens uma ideia? Vamos testar! A três vezes, B duas vezes, e depois A+B.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Viste uma cegonha! Como é que avisas o micro:bit?')),
        com('sem_b', P.evento('botao:B', 'E as andorinhas? Precisam de outro botão.')),
        com('sem_ab', P.evento('botao:AB', 'Já contas as duas. E para ver os resultados, que botão sobra?')),
        com('sem_mudar', P.regra('sem_mudar', a => !tem(a.evento('botao:A'), 'mk_var_mudar') || !tem(a.evento('botao:B'), 'mk_var_mudar'), [
          'Cada botão tem de guardar a sua conta. Onde se guarda?',
          'Usa «mudar … em 1» em cada botão.',
          'Põe «mudar contador em 1» no A e «mudar pontos em 1» no B.',
        ], 'Já contam os dois!')),
        com('mesma_var', P.regra('mesma_var', a => { const va = blocos(a.evento('botao:A'), 'mk_var_mudar').map(p => p.var), vb = blocos(a.evento('botao:B'), 'mk_var_mudar').map(p => p.var); return va.some(v => vb.includes(v)); }, [
          ['surpreendida', 'Ui! Cegonhas e andorinhas estão a ir para a mesma conta. Assim misturam-se!'],
          'Cada espécie precisa da sua variável.',
          'No B, escolhe «pontos» na setinha da variável.',
        ], 'Contas separadas!')),
        com('mostra_um', P.regra('mostra_um', a => { const e = a.evento('botao:AB'); if (!e) return false; const v = new Set(plano(e.seq).filter(p => p.tipo === 'mk_mostrar_numero').flatMap(p => p.usa.filter(u => u.tipo === 'mk_var').map(u => u.var))); return v.size < 2; }, [
          'O A+B mostra só uma das contas. E a outra espécie?',
          'Precisas de dois «mostrar número», um para cada variável.',
          'Mostra o contador, uma pausa, e depois os pontos.',
        ], 'Os dois resultados!')),
      ],
      sucesso: '3 cegonhas e 2 andorinhas! Contar várias espécies é o que fazem os cientistas nos censos de aves.',
      extensao: 'Faz o censo do recreio durante 10 minutos. Qual é a ave mais comum?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_var_mudar"><field name="VAR">contador</field>' + N('V', 1) + '</block></statement></block>' +
          '<block type="mk_botao" x="40" y="180"><field name="B">B</field><statement name="DO"><block type="mk_var_mudar"><field name="VAR">contador</field>' + N('V', 1) + '</block></statement></block>' +
          '<block type="mk_botao" x="40" y="320"><field name="B">AB</field><statement name="DO"><block type="mk_mostrar_numero">' + V('N', '<block type="mk_var"><field name="VAR">contador</field></block>') +
          '<next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">500</field></shadow></value><next><block type="mk_mostrar_numero">' + V('N', '<block type="mk_var"><field name="VAR">pontos</field></block>') +
          '</block></next></block></next></block></statement></block></xml>',
        pedido: 'Contei 3 cegonhas e 2 andorinhas… e o meu micro:bit diz 5 cegonhas e 0 andorinhas! Que trapalhada!',
      },
    },
  };

  const ESTACAO = {
    titulo: 'Estação do recreio',
    missao: 'Para sempre: o micro:bit regista a luz e a temperatura no diário, com uma pausa entre medições.',
    passos: ['Dentro de «para sempre»: dois «registar dados», um «luz» e outro «temperatura».', 'Encaixa o sensor certo em cada um e junta uma pausa.', 'Experimenta: muda a luz e a temperatura e vê a tabela.'],
    material: 'micro:bit V2, pilhas, um sítio à sombra no recreio',
    novos: ['mk_registar_temp'],
    caixa: ['mk_sempre', 'mk_registar', 'mk_registar_temp', 'mk_luz', 'mk_temperatura', 'mk_pausa'],
    teste: 'luz',
    ok: r => aposSensor(r, 'luz', v => v === 40, s => s.some(x => /^registo:[^:]*luz[^:]*:40$/i.test(x))) &&
      aposSensor(r, 'temperatura', v => v === 30, s => s.some(x => /^registo:[^:]*temp[^:]*:30$/i.test(x))),
    tutor: {
      boasVindas: ['boas_vindas', 'Uma estação meteorológica mede o tempo sozinha, o dia todo. Vamos pôr uma no recreio!'],
      parecePronto: a => { const e = a.evento('sempre'); const r = blocos(e, 'mk_registar'); return r.some(p => (p.usa || []).some(u => u.tipo === 'mk_luz')) && r.some(p => (p.usa || []).some(u => u.tipo === 'mk_temperatura')) && tem(e, 'mk_pausa'); },
      testar: 'Tens uma ideia? Vamos testar! Muda a luz e a temperatura e espreita a tabela.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A estação mede sozinha, sem ninguém carregar em botões. Que bloco faz isso?')),
        com('sem_registar', P.bloco('sempre', 'mk_registar', 'O que é que guarda as medidas no diário?')),
        com('so_um', P.regra('so_um', a => blocos(a.evento('sempre'), 'mk_registar').length === 1, [
          'Estás a guardar uma coisa. A missão pede duas: quais?',
          'Junta outro «registar dados» por baixo.',
          'Um para a luz, outro para a temperatura.',
        ], 'Duas colunas no diário!')),
        com('temp_errada', P.regra('temp_errada', a => blocos(a.evento('sempre'), 'mk_registar').some(p => /temp/i.test(String(p.nome)) && !(p.usa || []).some(u => u.tipo === 'mk_temperatura')), [
          ['a_pensar', 'A coluna diz «temperatura»… mas o que estás a medir lá dentro?'],
          'Cada coluna precisa do seu sensor.',
          'Encaixa «temperatura (°C)» no registar da temperatura.',
        ], 'Cada coisa no seu sítio!')),
        com('luz_errada', P.regra('luz_errada', a => blocos(a.evento('sempre'), 'mk_registar').some(p => /luz/i.test(String(p.nome)) && !(p.usa || []).some(u => u.tipo === 'mk_luz')), [
          'A coluna da luz está a guardar o quê?',
          'Procura o bloco cor-de-rosa «nível de luz».',
          'Encaixa «nível de luz» no registar da luz.',
        ], 'Agora sim!')),
        com('sem_pausa', P.regra('sem_pausa', a => blocos(a.evento('sempre'), 'mk_registar').length >= 2 && !tem(a.evento('sempre'), 'mk_pausa'), [
          'Sem pausa, o micro:bit mede 50 vezes por segundo. O diário enche num instante! De quanto em quanto tempo queres medir?',
          'Junta uma pausa no fim do «para sempre».',
          'Põe «pausa (ms)» depois dos dois registar.',
        ], 'Assim o diário dura o dia todo!')),
      ],
      sucesso: 'Estação a funcionar! Com os dados, podes fazer um gráfico do dia: quando aquece mais, quando há mais luz.',
      extensao: 'Muda a pausa para 60000 (um minuto) e deixa a estação ligada durante o recreio todo.',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_registar">' + TX('NOME', 'luz') + V('V', '<block type="mk_luz"></block>') +
          '<next><block type="mk_registar">' + TX('NOME', 'temperatura') + V('V', '<block type="mk_luz"></block>') +
          '<next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">1000</field></shadow></value></block></next></block></next></block></statement></block></xml>',
        pedido: 'A minha estação diz que a temperatura é 150 graus! Acho que meti o sensor errado em algum lado…',
      },
    },
  };

  const SOMBRA_OLIVEIRAS = {
    titulo: 'Sombra das oliveiras',
    missao: 'A guarda a luz ao sol; B mostra a diferença entre a luz de agora e a guardada.',
    passos: ['No A: «definir medida para nível de luz».', 'No B: mostrar número de (nível de luz − medida).', 'Experimenta: luz alta, A; luz baixa, B.'],
    material: 'micro:bit',
    novos: ['mk_var_definir_medida', 'mk_var_medida', 'mk_conta_menos'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_definir_medida', 'mk_var_medida', 'mk_luz', 'mk_conta_menos', 'mk_mostrar_numero'],
    teste: 'botao:B',
    ok: r => vezes(r, 'botao:B').some(({ i, s }) => {
      let guardada = null;
      for (const a of vezes(r, 'botao:A')) if (a.i < i) guardada = sensorEm(r, a.i, 'luz', 150);
      const agora = sensorEm(r, i, 'luz', 150);
      return guardada !== null && guardada !== agora && s.some(x => x.startsWith('numero:') && Math.abs(Number(x.slice(7))) === Math.abs(agora - guardada));
    }),
    tutor: {
      boasVindas: ['boas_vindas', 'Debaixo de uma oliveira está mais fresco. Mas quanta luz é que a árvore tapa? Vamos descobrir!'],
      parecePronto: a => blocos(a.evento('botao:A'), 'mk_var_definir').some(p => (p.usa || []).some(u => u.tipo === 'mk_luz')) &&
        dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_conta') && dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_var'),
      testar: 'Tens uma ideia? Vamos testar! Luz alta e A; depois luz baixa e B.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Primeiro, ao sol, guardas a luz. Que botão dá a ordem?')),
        com('sem_b', P.evento('botao:B', 'Depois, à sombra, queres ver a diferença. Com que botão?')),
        com('nao_guarda', P.regra('nao_guarda', a => !blocos(a.evento('botao:A'), 'mk_var_definir').some(p => (p.usa || []).some(u => u.tipo === 'mk_luz')), [
          'Ao sol, o micro:bit tem de se lembrar de quanta luz havia. Como se guarda um número?',
          'Usa «definir medida para» e encaixa «nível de luz».',
          'No A: «definir medida para nível de luz».',
        ], 'Luz do sol guardada!')),
        com('sem_conta', P.regra('sem_conta', a => !!a.evento('botao:B') && !dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_conta'), [
          'Para saber quanta luz a árvore tapa, temos de fazer uma conta. Qual?',
          'Diferença é uma conta de menos: a de agora menos a guardada.',
          'No B: mostrar número com «nível de luz − medida».',
        ], 'Conta montada!')),
        com('conta_sem_medida', P.regra('conta_sem_medida', a => dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_conta') && !dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_var'), [
          'A conta precisa da luz que guardaste. Onde está ela?',
          'Procura o bloco vermelho «medida».',
          'Encaixa «medida» do lado direito do «−».',
        ], 'Agora compara com o sol!')),
      ],
      sucesso: 'Descobriste quanta luz a oliveira tapa! Um número negativo quer dizer «menos luz do que ao sol».',
      extensao: 'Compara uma oliveira, uma figueira e um toldo. Qual dá a sombra mais escura?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_var_definir"><field name="VAR">medida</field>' + V('V', '<block type="mk_luz"></block>') + '</block></statement></block>' +
          '<block type="mk_botao" x="40" y="200"><field name="B">B</field><statement name="DO"><block type="mk_mostrar_numero">' + V('N', '<block type="mk_var"><field name="VAR">medida</field></block>') + '</block></statement></block></xml>',
        pedido: 'Fui para debaixo da oliveira, carreguei no B… e mostra a luz do sol outra vez! Onde está a diferença?',
      },
    },
  };

  const RECORDE = {
    titulo: 'Recorde de calor',
    missao: 'O micro:bit guarda a temperatura mais alta do dia; o A mostra o recorde.',
    passos: ['Para sempre: se temperatura > recorde então definir recorde para temperatura.', 'No botão A: mostrar o recorde.', 'Experimenta: 30 graus, depois 25, e carrega em A.'],
    material: 'micro:bit',
    novos: ['mk_var_definir_recorde', 'mk_var_recorde'],
    caixa: ['mk_sempre', 'mk_se_entao', 'mk_comparar', 'mk_temperatura', 'mk_var_definir_recorde', 'mk_var_recorde', 'mk_botao', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => vezes(r, 'botao:A').some(({ i, s }) => {
      let max = -Infinity;
      for (let j = 0; j < i; j++) if (r[j].dir === 'in' && r[j].v.startsWith('temperatura:')) max = Math.max(max, valorDe(r[j].v));
      return max > sensorEm(r, i, 'temperatura', 21) && s.includes('numero:' + max);
    }),
    tutor: {
      boasVindas: ['boas_vindas', 'No verão, em Messejana, chega aos 40 graus! Qual foi a hora mais quente? Vamos guardar o recorde.'],
      parecePronto: a => ses(a.evento('sempre')).some(d => usa(d, 'mk_temperatura') && usa(d, 'mk_var') && ramo(d, 'sim').some(p => p.tipo === 'mk_var_definir' && p.var === 'recorde')) &&
        dentro(a.evento('botao:A'), 'mk_mostrar_numero', 'mk_var'),
      testar: 'Tens uma ideia? Vamos testar! Põe 30 graus, depois 25, e carrega em A.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'O recorde pode acontecer a qualquer hora. Quem está sempre a medir?')),
        com('sem_a', P.evento('botao:A', 'No fim do dia queres ver o recorde. Como é que pedes?')),
        com('sem_guardar', P.regra('sem_guardar', a => !blocos(a.evento('sempre'), 'mk_var_definir').some(p => p.var === 'recorde' && (p.usa || []).some(u => u.tipo === 'mk_temperatura')), [
          'Para haver recorde, o micro:bit tem de guardar uma temperatura. Com que bloco?',
          'Usa «definir recorde para» com a «temperatura (°C)».',
          'Põe «definir recorde para temperatura (°C)» dentro do «para sempre».',
        ], 'Já guarda!')),
        com('sem_se', P.regra('sem_se', a => blocos(a.evento('sempre'), 'mk_var_definir').some(p => p.var === 'recorde') && !ses(a.evento('sempre')).some(d => ramo(d, 'sim').some(p => p.tipo === 'mk_var_definir' && p.var === 'recorde')), [
          ['a_pensar', 'Assim o recorde é sempre a temperatura de agora… mesmo quando arrefece! Quando é que há um recorde novo?'],
          'Só se guarda quando a temperatura é MAIOR do que o recorde.',
          'Põe o «definir recorde» dentro de «se temperatura > recorde então».',
        ], 'Isso é que é um recorde!')),
        com('mostra_errado', P.regra('mostra_errado', a => !!a.evento('botao:A') && !dentro(a.evento('botao:A'), 'mk_mostrar_numero', 'mk_var'), [
          'O A mostra o quê? A temperatura de agora ou a mais alta?',
          'O recorde está guardado na variável «recorde».',
          'No A: mostrar número «recorde».',
        ], 'Recorde à vista!')),
      ],
      sucesso: 'Recorde guardado! Os meteorologistas registam a máxima de cada dia. Comparar recordes de anos diferentes mostra se o clima está a mudar.',
      extensao: 'E a temperatura mínima da noite? Usa outra variável para guardar o mais baixo.',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_var_definir"><field name="VAR">recorde</field>' + V('V', '<block type="mk_temperatura"></block>') + '</block></statement></block>' +
          '<block type="mk_botao" x="40" y="200"><statement name="DO"><block type="mk_mostrar_numero">' + V('N', '<block type="mk_var"><field name="VAR">recorde</field></block>') + '</block></statement></block></xml>',
        pedido: 'Hoje chegou aos 30 graus, mas o meu recorde diz 25! Esqueceu-se do calor da tarde. Que gambiarra fiz?',
      },
    },
  };

  const REGA_AUTOMATICA = {
    titulo: 'Rega automática',
    missao: 'Se a terra está seca, o servo abre a torneira (180); se está molhada, fecha (0).',
    passos: ['Para sempre: «se leitura analógica pin P1 < 300 então … senão …».', 'Seca: servo a 180. Molhada: servo a 0.', 'Experimenta: terra seca e depois molhada.'],
    material: 'micro:bit, 2 pregos, servomotor, garrafa com tubo (ou uma torneira de cartão)',
    novos: ['mk_servo'],
    caixa: ['mk_sempre', 'mk_se_senao', 'mk_comparar', 'mk_ler_analogico', 'mk_servo', 'mk_pausa'],
    sim: ['analogico:P1'],
    teste: 'analogico:P1',
    ok: r => aposSensor(r, 'analogico:P1', v => v < 250, s => angulos(s).some(x => x >= 90)) &&
      aposSensor(r, 'analogico:P1', v => v > 350, s => angulos(s).some(x => x <= 30)),
    tutor: {
      boasVindas: ['boas_vindas', 'E se a horta se regasse sozinha nas férias? Vamos juntar o sensor da terra a um motor!'],
      parecePronto: a => ses(a.evento('sempre')).some(d => usa(d, 'mk_ler_analogico') && ['<', '<='].includes(opDe(d)) && servos(ramo(d, 'sim')).some(x => x >= 90) && servos(ramo(d, 'nao')).some(x => x <= 30)),
      testar: 'Tens uma ideia? Vamos testar! Terra seca, depois molhada.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A rega automática trabalha sozinha. Quem é que vigia sem parar?')),
        com('sem_se', P.bloco('sempre', 'mk_se', 'Abrir ou fechar a torneira depende da terra. Que bloco escolhe entre duas coisas?')),
        com('sem_humidade', P.regra('sem_humidade', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => usa(d, 'mk_ler_analogico')), [
          'A torneira abre quando a terra está… como é que o micro:bit sabe?',
          'Compara a leitura do pin 1 com um número.',
          'No «se»: «leitura analógica pin P1 < 300».',
        ], 'Já sente a terra!')),
        com('ao_contrario', P.regra('ao_contrario', a => ses(a.evento('sempre')).some(d => ['>', '>='].includes(opDe(d)) && servos(ramo(d, 'sim')).some(x => x >= 90)), [
          ['surpreendida', 'Ui! Assim rega quando a terra já está encharcada. Vai ser um lago!'],
          'Leitura pequena quer dizer terra seca.',
          'Troca o «>» por «<».',
        ], 'Agora rega quando tem sede!')),
        com('sem_abrir', P.regra('sem_abrir', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_ler_analogico')) && !ses(a.evento('sempre')).some(d => servos(ramo(d, 'sim')).length), [
          'A terra está seca… e a torneira? Quem a abre?',
          'Um «escrever servo» no «então».',
          'Põe «escrever servo pin P0 para 180» no «então».',
        ], 'Água a correr!')),
        com('sem_fechar', P.regra('sem_fechar', a => ses(a.evento('sempre')).some(d => servos(ramo(d, 'sim')).length) && !ses(a.evento('sempre')).some(d => servos(ramo(d, 'nao')).length), [
          'A torneira abre… e depois fica aberta para sempre? Que desperdício de água!',
          'O «senão» é quando a terra já está molhada.',
          'Põe «escrever servo pin P0 para 0» no «senão».',
        ], 'Água poupada!')),
      ],
      sucesso: 'Rega automática pronta! Sensor + decisão + motor: é assim que funcionam muitas máquinas da agricultura.',
      extensao: 'No Alentejo a água é preciosa. E se só regasse à noite, quando está escuro, para a água não evaporar?',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se">' +
          V('C', '<block type="mk_comparar"><field name="OP">&lt;</field>' + V('A', ANALOG) + N('B', 300) + '</block>') +
          '<statement name="SIM"><block type="mk_servo"><field name="P">P0</field>' + N('A', 180) + '</block></statement><statement name="NAO"></statement></block></statement></block></xml>',
        pedido: 'A minha rega abriu e nunca mais fechou! A horta está um charco. O que é que me esqueci?',
      },
    },
  };

  // ============================================================ PROJETOS (7–11 de cada nível): 15–20 minutos
  // ------------------------------------------------------------ ajudas para os projetos
  const SENS_BASE = { luz: 150, temperatura: 21, som: 20, 'analogico:P0': 0, 'analogico:P1': 0 };
  // estado de todos os sensores numa posição do registo (o último valor que a criança escolheu)
  const estadoEm = (reg, i) => Object.fromEntries(Object.entries(SENS_BASE).map(([k, d]) => [k, sensorEm(reg, i, k, d)]));
  // para cada entrada em que o estado dos sensores cumpre cond: as saídas (com tempo) até à entrada seguinte
  function janelas(reg, cond) {
    const out = [];
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in') continue;
      const st = estadoEm(reg, i + 1);
      if (!cond(st, reg[i].v)) continue;
      const s = [];
      for (let j = i + 1; j < reg.length && reg[j].dir === 'out'; j++) s.push(reg[j]);
      out.push({ i, st, s, v: s.map(e => e.v) });
    }
    return out;
  }
  const algumaJanela = (reg, cond, teste) => janelas(reg, cond).some(j => teste(j.v, j));
  // como «vezes», mas com o tempo de cada saída
  function vezesT(reg, entrada) {
    const out = [];
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== entrada) continue;
      const s = [];
      for (let j = i + 1; j < reg.length && reg[j].dir === 'out' && reg[j].t - reg[i].t <= 8000; j++) s.push(reg[j]);
      out.push({ i, s });
    }
    return out;
  }
  // saídas a seguir à entrada i (até à entrada seguinte)
  const saidasDe = (reg, i) => { const s = []; for (let j = i + 1; j < reg.length && reg[j].dir === 'out'; j++) s.push(reg[j].v); return s; };
  // valor de uma variável antes da posição i
  function varEm(reg, i, nome) {
    for (let j = i - 1; j >= 0; j--) if (reg[j].dir === 'out' && reg[j].v.startsWith('var:' + nome + ':')) return Number(reg[j].v.split(':')[2]);
    return 0;
  }
  // ícones que ficaram à vista pelo menos ms
  function iconesVisiveis(ents, ms = 120) {
    const ecra = ents.filter(e => /^(icone:|limpar|numero:|texto:|grafico:|acender:|apagar:)/.test(e.v));
    const vis = new Set();
    ecra.forEach((e, k) => { const fim = k + 1 < ecra.length ? ecra[k + 1].t : performance.now(); if (e.v.startsWith('icone:') && fim - e.t >= ms) vis.add(e.v.slice(6)); });
    return vis;
  }
  const temSom = lista => lista.some(p => p.tipo === 'mk_som' || p.tipo === 'mk_tom');
  const freqs = lista => lista.filter(p => p.tipo === 'mk_tom').map(p => p.freq);
  const iconesDe = lista => lista.filter(p => p.tipo === 'mk_icone').map(p => p.icone);
  const evPlano = e => e ? e.plano : [];
  const numeroCom = (e, tipo) => !!e && e.plano.some(p => p.tipo === 'mk_mostrar_numero' && usa(p, tipo));
  const toms = v => v.filter(x => x.startsWith('tom:')).map(x => x.slice(4));
  const angs = v => v.filter(x => x.startsWith('servo:')).map(x => Number(x.split(':')[2]));
  // o «se» que compara este sensor (e, opcionalmente, com estes sinais)
  const seDe = (e, tipo, ops) => ses(e).find(d => usa(d, tipo) && (!ops || ops.includes(opDe(d))));

  // mini-construtor de XML para as gambiarras
  const B_ = (t, inner = '') => `<block type="${t}">${inner}</block>`;
  const FD = (n, v) => `<field name="${n}">${v}</field>`;
  const ST = (n, inner) => `<statement name="${n}">${inner}</statement>`;
  const nxt = (...bs) => bs.reduceRight((acc, b) => acc ? b.replace(/<\/block>$/, `<next>${acc}</next></block>`) : b, '');
  const TOPO = (t, campos, corpo, y = 40) => `<block type="${t}" x="40" y="${y}">${campos}${ST('DO', corpo)}</block>`;
  const G = (...tops) => '<xml>' + tops.join('') + '</xml>';
  const ic = n => B_('mk_icone', FD('I', n));
  const tomX = f => B_('mk_tom', NOTA(f));
  const somX = s => B_('mk_som', `<value name="S"><shadow type="mk_som_menu"><field name="V">${s}</field></shadow></value>`);
  const pausaX = ms => B_('mk_pausa', `<value name="MS"><shadow type="mk_pausa_menu"><field name="V">${ms}</field></shadow></value>`);
  const servoX = a => B_('mk_servo', FD('P', 'P0') + N('A', a));
  const numX = x => B_('mk_mostrar_numero', V('N', x));
  const varX = n => B_('mk_var', FD('VAR', n));
  const mudarX = (n, v = 1) => B_('mk_var_mudar', FD('VAR', n) + N('V', v));
  const definirX = (n, x) => B_('mk_var_definir', FD('VAR', n) + (typeof x === 'number' ? N('V', x) : V('V', x)));
  const cmpX = (a, op, b) => B_('mk_comparar', FD('OP', op) + (typeof a === 'number' ? N('A', a) : V('A', a)) + (typeof b === 'number' ? N('B', b) : V('B', b)));
  const seX = (c, sim, nao) => B_('mk_se', V('C', c) + ST('SIM', sim) + ST('NAO', nao || ''));
  const seEntaoX = (c, sim) => B_('mk_se_entao', V('C', c) + ST('SIM', sim));
  const repetirX = (n, corpo) => B_('mk_repetir', N('N', n) + ST('DO', corpo));
  const digX = v => B_('mk_digital', `<value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value>` + N('V', v));
  const regX = (nome, x) => B_('mk_registar', TX('NOME', nome) + V('V', x));
  const LUZ = B_('mk_luz'), TEMP = B_('mk_temperatura'), ESCURO = B_('mk_escuro');
  const AN = p => B_('mk_ler_analogico', FD('P', p));

  // ------------------------------------------------------------ N1 · 7 · Caderno de campo
  const CADERNO = {
    titulo: 'Caderno de campo',
    missao: 'Três botões, três medições: o A mede a luz, o B a temperatura e o logotipo a humidade da terra.',
    passos: [
      'Prepara o vaso: um prego no pin 1, outro no 3V, os dois espetados na terra.',
      'No botão A: «mostrar número» com «nível de luz».',
      'No botão B: «mostrar número» com «temperatura (°C)».',
      'No logotipo: «mostrar número» com «leitura analógica pin P1».',
      'Leva-o à horta: mede ao sol, à sombra e no vaso, e aponta tudo numa folha.',
    ],
    material: 'micro:bit, 2 pregos, 2 crocodilos, um vaso com terra, papel e lápis',
    novos: ['mk_logo'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_logo', 'mk_mostrar_numero', 'mk_luz', 'mk_temperatura', 'mk_ler_analogico'],
    sim: ['luz', 'temperatura', 'analogico:P1'],
    teste: 'logo',
    ok: r => {
      const certo = (ent, k) => vezes(r, ent).some(({ i, s }) => s.includes('numero:' + sensorEm(r, i, k, SENS_BASE[k])));
      return certo('botao:A', 'luz') && certo('botao:B', 'temperatura') && certo('logo', 'analogico:P1');
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Os cientistas de campo levam um caderno para todo o lado. Vamos fazer um caderno de campo eletrónico com três medições!'],
      parecePronto: a => numeroCom(a.evento('botao:A'), 'mk_luz') && numeroCom(a.evento('botao:B'), 'mk_temperatura') && numeroCom(a.evento('logo'), 'mk_ler_analogico'),
      testar: 'Tens uma ideia? Vamos testar! Muda a luz, a temperatura e a humidade e carrega em A, B e no logotipo.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Um caderno de campo tem várias páginas. Qual é o botão da primeira medição, a da luz?')),
        com('sem_b', P.evento('botao:B', 'A luz já tem botão. E o calor, mede-se com qual?')),
        com('sem_logo', P.evento('logo', 'Faltam os pregos da terra! Que parte do micro:bit ainda não tem trabalho?')),
        com('sem_numero', P.regra('sem_numero', a => ['botao:A', 'botao:B', 'logo'].some(k => a.evento(k) && !tem(a.evento(k), 'mk_mostrar_numero')), [
          'Há um botão que mede às escondidas. Como é que o caderno te mostra o valor?',
          'Cada um dos três precisa de um «mostrar número».',
          'Põe «mostrar número» dentro do botão (ou do logotipo) que ainda não o tem.',
        ], 'Já mostra!')),
        com('trocados', P.regra('trocados', a => numeroCom(a.evento('botao:A'), 'mk_temperatura') || numeroCom(a.evento('botao:B'), 'mk_luz') || numeroCom(a.evento('logo'), 'mk_luz'), [
          ['surpreendida', 'Ui! Há uma medição no botão errado. O que é que cada botão devia medir?'],
          'A → luz · B → temperatura · logotipo → humidade (os pregos no pin 1).',
          'Troca os blocos cor-de-rosa e vermelho-escuro para ficarem no sítio certo.',
        ], 'Cada coisa no seu botão!')),
        com('sem_luz', P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_luz', 'O A mostra sempre o mesmo número, ao sol e à sombra. Quem mede a luz?')),
        com('sem_temp', P.valorEm('botao:B', 'mk_mostrar_numero', 'mk_temperatura', 'O B não muda, faça frio ou calor. Quem mede os graus?')),
        com('sem_humidade', P.valorEm('logo', 'mk_mostrar_numero', 'mk_ler_analogico', 'Os pregos estão na terra… mas quem lê o que eles sentem?')),
      ],
      sucesso: 'Caderno de campo pronto! Três medições num só aparelho: é assim que se começa um estudo a sério.',
      extensao: 'Faz uma tabela na folha: hora, luz, temperatura, humidade. Repete de manhã e à tarde. O que muda mais?',
      gambiarra: {
        xml: G(TOPO('mk_botao', '', numX(LUZ)), TOPO('mk_botao', FD('B', 'B'), numX(TEMP), 180), TOPO('mk_logo', '', numX(LUZ), 320)),
        pedido: 'O meu caderno diz que a terra do vaso está tão húmida como o sol está forte… Acho que troquei alguma coisa!',
      },
    },
  };

  // ------------------------------------------------------------ N1 · 8 · Guia sonoro dos bichos
  const assinatura = e => e ? [...iconesDe(e.plano), ...e.plano.filter(p => p.tipo === 'mk_som').map(p => 's' + p.som), ...freqs(e.plano).map(f => 't' + f)].join('|') : '';
  const QUATRO = ['botao:A', 'botao:B', 'logo', 'agitar'];
  const GUIA_BICHOS = {
    titulo: 'Guia sonoro dos bichos',
    missao: 'Quatro gestos, quatro bichos da horta: cada um com o seu desenho e o seu som, sem dois iguais.',
    passos: [
      'Escolhe 4 bichos da horta: abelha, cegonha, coruja, grilo…',
      'Usa os quatro gestos: botão A, botão B, logotipo e agitar.',
      'Em cada um: um ícone e um som («tocar som» ou «tocar tom»).',
      'Não pode haver dois bichos iguais: muda o desenho ou o som.',
      'Desenha o guia numa folha (que gesto chama que bicho) e desafia um colega a adivinhar.',
    ],
    material: 'micro:bit V2 (altifalante), papel e lápis de cor',
    novos: ['mk_agitar', 'mk_som'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_logo', 'mk_agitar', 'mk_icone', 'mk_icone_dormir', 'mk_icone_surpreendido', 'mk_som', 'mk_tom', 'mk_pausa'],
    teste: 'agitar',
    ok: r => {
      const assin = [];
      for (const e of QUATRO) {
        const v = vezes(r, e).find(({ s }) => s.some(x => x.startsWith('icone:')) && s.some(x => x.startsWith('som:') || x.startsWith('tom:')));
        if (!v) return false;
        assin.push(v.s.filter(x => /^(icone|som|tom):/.test(x)).join('|'));
      }
      return new Set(assin).size === 4;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Na horta há zumbidos, piares e cantos de grilo. Vamos fazer um guia que imita quatro bichos?'],
      parecePronto: a => QUATRO.every(k => a.evento(k) && iconesDe(a.evento(k).plano).length && temSom(a.evento(k).plano)) &&
        new Set(QUATRO.map(k => assinatura(a.evento(k)))).size === 4,
      testar: 'Tens uma ideia? Vamos testar! Carrega em A, em B, no logotipo e agita — devagar, para ouvires cada bicho.',
      regras: [
        com('nenhum', P.evento('*', 'Um guia de bichos começa com um bicho. Que gesto o vai chamar?')),
        com('poucos', P.regra('poucos_bichos', a => a.eventos.length > 0 && QUATRO.some(k => !a.evento(k)), [
          'O guia ainda não tem os quatro bichos. Quantos gestos diferentes sabe o micro:bit sentir?',
          'Usa os quatro: botão A, botão B, logotipo e agitar.',
          'Arrasta os blocos cor-de-rosa que faltam: «no botão B premido», «ao logotipo pressionado» ou «em agitar».',
        ], 'Quatro bichos no guia!')),
        com('sem_icone', P.regra('sem_icone', a => QUATRO.some(k => a.evento(k) && !iconesDe(a.evento(k).plano).length), [
          'Há um bicho invisível! Como é que se vê qual é?',
          'Cada gesto precisa de um «mostrar ícone».',
          'Põe um «mostrar ícone» no gesto que ainda não tem desenho.',
        ], 'Já se vêem todos!')),
        com('sem_som', P.regra('sem_som', a => QUATRO.some(k => a.evento(k) && !temSom(a.evento(k).plano)), [
          'Há um bicho mudo. Que bicho da horta não faz barulho nenhum?',
          'Cada gesto precisa de um bloco laranja de música.',
          'Junta «tocar som» ou «tocar tom» ao gesto que está calado.',
        ], 'Agora todos fazem barulho!')),
        com('repetidos', P.regra('repetidos', a => { const s = QUATRO.filter(k => a.evento(k)).map(k => assinatura(a.evento(k))); return s.length >= 2 && new Set(s).size < s.length; }, [
          ['surpreendida', 'Dois bichos iguaizinhos! Como é que um colega os vai distinguir?'],
          'Cada bicho tem de ter um desenho ou um som diferente dos outros.',
          'Muda o ícone ou o som de um dos bichos repetidos.',
        ], 'Cada bicho é único!')),
      ],
      sucesso: 'Guia sonoro pronto! Os biólogos também reconhecem os animais pelo som, sem os ver.',
      extensao: 'Grava os sons verdadeiros na horta com o telemóvel e afina os teus para ficarem mais parecidos.',
      gambiarra: {
        xml: G(TOPO('mk_botao', '', nxt(ic('Happy'), somX('giggle'))), TOPO('mk_botao', FD('B', 'B'), nxt(ic('Asleep'), somX('mysterious')), 180),
          TOPO('mk_logo', '', nxt(ic('Asleep'), somX('mysterious')), 320), TOPO('mk_agitar', '', nxt(ic('Surprised'), somX('spring')), 460)),
        pedido: 'No meu guia, a cegonha e a coruja têm a mesma cara e o mesmo som! Assim ninguém as distingue. Ajudas-me?',
      },
    },
  };

  // ------------------------------------------------------------ N1 · 9 · Dois pássaros, dois cantos
  const asasRapidas = e => { const p = evPlano(e); return p.some((x, k) => k > 0 && x.tipo === 'mk_icone' && p[k - 1].tipo === 'mk_icone' && x.icone !== p[k - 1].icone); };
  const DOIS_PASSAROS = {
    titulo: 'Dois pássaros, dois cantos',
    missao: 'O A é a andorinha: bate as asas e canta. O B é o mocho, com um canto diferente.',
    passos: [
      'No A: as asas a bater — dois ícones diferentes, com uma pausa depois de cada um.',
      'Usa «repetir» para as asas baterem várias vezes.',
      'Ainda no A: o canto da andorinha, com 3 notas ou mais.',
      'No B: o canto do mocho, com notas que a andorinha não usa.',
      'Toca para a turma de olhos fechados: adivinham qual é a ave?',
    ],
    material: 'micro:bit V2 (altifalante)',
    novos: ['mk_limpar'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_repetir', 'mk_icone', 'mk_icone_surpreendido', 'mk_icone_dormir', 'mk_limpar', 'mk_pausa', 'mk_tom'],
    teste: 'botao:A',
    ok: r => {
      const notas = v => new Set(toms(v));
      const a = vezesT(r, 'botao:A').find(({ s }) => notas(s.map(e => e.v)).size >= 3 && iconesVisiveis(s).size >= 2);
      if (!a) return false;
      const na = notas(a.s.map(e => e.v));
      return vezes(r, 'botao:B').some(({ s }) => { const nb = notas(s); return nb.size >= 2 && [...nb].some(x => !na.has(x)); });
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Ao fim da tarde, as andorinhas voam a piar e o mocho começa a cantar. Vamos pôr os dois no micro:bit!'],
      parecePronto: a => {
        const A = a.evento('botao:A'), B = a.evento('botao:B');
        if (!A || !B) return false;
        const fa = new Set(freqs(A.plano)), fb = new Set(freqs(B.plano));
        return fa.size >= 3 && new Set(iconesDe(A.plano)).size >= 2 && tem(A, 'mk_pausa') && fb.size >= 2 && [...fb].some(f => !fa.has(f));
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega em A, espera que acabe, e depois em B.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Primeiro a andorinha. Que botão a vai chamar?')),
        com('sem_asas', P.regra('sem_asas', a => !!a.evento('botao:A') && new Set(iconesDe(a.evento('botao:A').plano)).size < 2, [
          'Uma andorinha a voar abre e fecha as asas. Quantos desenhos precisas para isso?',
          'Usa dois «mostrar ícone» diferentes, um a seguir ao outro.',
          'Põe dois ícones diferentes no botão A, de preferência dentro de um «repetir».',
        ], 'Já tem asas!')),
        com('asas_rapidas', P.regra('asas_rapidas', a => asasRapidas(a.evento('botao:A')), [
          ['a_pensar', 'As asas mudam tão depressa que só se vê o último desenho. O que falta entre um e outro?'],
          'Depois de cada ícone, o micro:bit tem de esperar um bocadinho.',
          'Põe uma «pausa» de 200 ms a seguir a cada ícone das asas.',
        ], 'Agora vê-se a bater!')),
        com('canto_curto', P.regra('canto_curto', a => !!a.evento('botao:A') && new Set(freqs(a.evento('botao:A').plano)).size < 3, [
          'A andorinha voa, mas canta pouco. Quantas notas tem um canto de pássaro?',
          'Precisas de pelo menos três notas diferentes no A.',
          'Junta «tocar tom» ao A até teres três notas diferentes.',
        ], 'Que canto bonito!')),
        com('sem_b', P.evento('botao:B', 'E o mocho? Que botão ainda está livre?')),
        com('mesmo_canto', P.regra('mesmo_canto', a => {
          const A = a.evento('botao:A'), B = a.evento('botao:B');
          if (!A || !B) return false;
          const fa = new Set(freqs(A.plano)), fb = new Set(freqs(B.plano));
          return fb.size < 2 || ![...fb].some(f => !fa.has(f));
        }, [
          ['surpreendida', 'O mocho canta igualzinho à andorinha? Assim ninguém sabe quem está a cantar!'],
          'O mocho precisa de pelo menos duas notas, e alguma que a andorinha não usa.',
          'No B, escolhe notas mais graves (Dó, Ré) que não estejam no A.',
        ], 'Dois cantos diferentes!')),
      ],
      sucesso: 'Duas aves, dois cantos! Os ornitólogos reconhecem as aves pelo canto, mesmo quando não as vêem.',
      extensao: 'E se o logotipo fosse uma cegonha a bater o bico (tac-tac-tac), com notas muito curtas?',
      gambiarra: {
        xml: G(TOPO('mk_botao', '', nxt(repetirX(3, nxt(ic('Happy'), ic('Surprised'))), tomX(392), tomX(440), tomX(523))),
          TOPO('mk_botao', FD('B', 'B'), nxt(tomX(262), tomX(294)), 260)),
        pedido: 'A minha andorinha canta, mas as asas não se mexem… só vejo o último desenho! Ajudas-me?',
      },
    },
  };

  // ------------------------------------------------------------ N1 · 10 · Termómetro do dia
  const graficos = e => evPlano(e).filter(p => p.tipo === 'mk_grafico');
  const TERMOMETRO_DIA = {
    titulo: 'Termómetro do dia',
    missao: 'De dia, o micro:bit mostra o calor num gráfico de barras; de noite, dorme.',
    passos: [
      'Dentro de «para sempre»: «se está escuro então … senão …».',
      'De noite (então): o ícone a dormir.',
      'De dia (senão): «desenhar gráfico de barras» com «temperatura (°C)» até 40.',
      'Experimenta: 40 °C enche o ecrã, 8 °C acende só uma fila; apaga a luz e ele dorme.',
      'Pendura-o à sombra de uma oliveira e vai lá espreitar de hora a hora.',
    ],
    material: 'micro:bit, fio para o pendurar',
    novos: [],
    caixa: ['mk_sempre', 'mk_se', 'mk_icone', 'mk_icone_dormir', 'mk_grafico', 'mk_temperatura', 'mk_luz', 'mk_ler_analogico'],
    sim: ['luz', 'temperatura'],
    teste: 'temperatura',
    ok: r => algumaJanela(r, st => st.luz >= 40 && st.temperatura >= 40, v => v.includes('grafico:25')) &&
      algumaJanela(r, st => st.luz >= 40 && st.temperatura === 8, v => v.includes('grafico:5')) &&
      algumaJanela(r, st => st.luz < 40, v => v.includes('icone:Asleep') && !v.some(x => x.startsWith('grafico:'))),
    tutor: {
      boasVindas: ['boas_vindas', 'As oliveiras aguentam muito calor. Quanto calor faz à sombra delas ao longo do dia? Vamos fazer um termómetro de barras!'],
      parecePronto: a => ses(a.evento('sempre')).some(d => usa(d, 'mk_escuro') && temIcone(ramo(d, 'sim'), 'Asleep') &&
        ramo(d, 'nao').some(p => p.tipo === 'mk_grafico' && usa(p, 'mk_temperatura') && Number(p.max) === 40)),
      testar: 'Tens uma ideia? Vamos testar! Põe 40 °C, depois 8 °C, depois apaga a luz.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'O calor muda ao longo do dia. Quem fica sempre a medir?')),
        com('sem_se', P.regra('sem_se', a => !!a.evento('sempre') && !ses(a.evento('sempre')).length, [
          'De dia uma coisa, de noite outra. Que bloco escolhe entre duas?',
          'O «se está escuro então … senão …».',
          'Põe o «se … senão» (com «está escuro») dentro do «para sempre».',
        ], 'Já distingue o dia da noite!')),
        com('sem_grafico', P.regra('sem_grafico', a => ses(a.evento('sempre')).length > 0 && !graficos(a.evento('sempre')).length, [
          'Como é que se vê o calor de longe, sem ler números?',
          'Um bloco roxo desenha barras: quanto mais calor, mais luzes.',
          'Põe «desenhar gráfico de barras» no «senão».',
        ], 'Barras à vista!')),
        com('grafico_luz', P.regra('grafico_luz', a => graficos(a.evento('sempre')).some(p => usa(p, 'mk_luz')), [
          ['surpreendida', 'Esse gráfico mostra o sol ou o calor? Não são a mesma coisa!'],
          'Procura o bloco cor-de-rosa que fala em graus.',
          'Troca «nível de luz» por «temperatura (°C)» no gráfico.',
        ], 'Agora mede o calor!')),
        com('sem_temp', P.regra('sem_temp', a => graficos(a.evento('sempre')).length > 0 && !graficos(a.evento('sempre')).some(p => usa(p, 'mk_temperatura')), [
          'O gráfico está sempre igual. O que é que devia fazê-lo crescer?',
          'Encaixa um sensor no primeiro buraco do gráfico.',
          'Encaixa «temperatura (°C)» no gráfico.',
        ], 'Já cresce com o calor!')),
        com('max_errado', P.regra('max_errado', a => graficos(a.evento('sempre')).some(p => usa(p, 'mk_temperatura') && Number(p.max) !== 40), [
          'Com «até 255», 40 graus quase não acende nada. Até quantos graus chega um dia de verão no Alentejo?',
          'O segundo número do gráfico é o máximo: o valor que enche o ecrã.',
          'Muda o «até» do gráfico para 40.',
        ], 'Afinado para o Alentejo!')),
        com('grafico_de_noite', P.regra('grafico_de_noite', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_escuro') && ramo(d, 'sim').some(p => p.tipo === 'mk_grafico')), [
          ['surpreendida', 'Mede o calor de noite e dorme de dia? Parece um morcego!'],
          'O «então» é quando está escuro.',
          'Troca: o ícone a dormir no «então», o gráfico no «senão».',
        ], 'Agora dorme de noite!')),
        com('sem_dormir', P.regra('sem_dormir', a => graficos(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'sim'), 'Asleep')), [
          'E de noite, o que é que o termómetro faz?',
          'Há um ícone de olhos fechados.',
          'Põe o ícone a dormir no «então».',
        ], 'Boa noite, termómetro!')),
      ],
      sucesso: 'Termómetro de barras pronto! Escolher bem o máximo do gráfico é afinar um instrumento, como fazem os cientistas.',
      extensao: 'Mede ao sol e à sombra da oliveira à mesma hora. Quantas filas de diferença?',
      gambiarra: {
        xml: G(TOPO('mk_sempre', '', seX(ESCURO, ic('Asleep'), B_('mk_grafico', V('V', TEMP) + N('MAX', 255))))),
        pedido: 'O meu termómetro está sempre quase apagado, mesmo ao sol do meio-dia! Será que o gráfico está bem afinado?',
      },
    },
  };

  // ------------------------------------------------------------ N1 · 11 · Contador de rajadas
  const RAJADAS = {
    titulo: 'Contador de rajadas',
    missao: 'Pendura o micro:bit num ramo: cada rajada de vento que o abana conta uma. O A mostra o total, o B recomeça.',
    passos: [
      'Em agitar: «mudar contador em 1» e um ícone de vento (o de espanto, por exemplo).',
      'No botão A: «mostrar número» com o contador.',
      'No botão B: «definir contador para 0» e um sinal de que recomeçou.',
      'Experimenta: agita 3 vezes, carrega no A, depois no B e no A outra vez.',
      'Pendura-o com um fio num ramo de oliveira e conta as rajadas de um intervalo.',
    ],
    material: 'micro:bit com pilhas, fio de lã, um ramo de árvore',
    novos: ['mk_var_definir'],
    caixa: ['mk_agitar', 'mk_botao', 'mk_botao_B', 'mk_var_mudar', 'mk_var_definir', 'mk_var', 'mk_mostrar_numero', 'mk_icone', 'mk_icone_surpreendido', 'mk_icone_sim'],
    teste: 'agitar',
    // conta por conta própria (as rajadas que o programa ouviu, menos os recomeços) e confere cada A
    ok: r => {
      let c = 0, alto = false, aposB = false, houveB = false;
      for (let i = 0; i < r.length; i++) {
        const e = r[i];
        if (e.dir !== 'in') continue;
        const s = saidasDe(r, i);
        if (e.v === 'agitar' && s.length) c++;
        else if (e.v === 'botao:B') { c = 0; houveB = true; }
        else if (e.v === 'botao:A') {
          if (!s.includes('numero:' + c)) return false;
          if (c >= 3) alto = true;
          if (houveB) aposB = true;
        }
      }
      return alto && aposB;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'No Alentejo, o vento suão sopra quente e forte. Quantas rajadas abanam um ramo de oliveira? Vamos contar!'],
      parecePronto: a => tem(a.evento('agitar'), 'mk_var_mudar') && numeroCom(a.evento('botao:A'), 'mk_var') &&
        blocos(a.evento('botao:B'), 'mk_var_definir').some(p => Number(p.n) === 0),
      testar: 'Tens uma ideia? Vamos testar! Agita 3 vezes, carrega em A, depois em B e outra vez em A.',
      regras: [
        com('sem_agitar', P.evento('agitar', 'O vento abana o ramo… que gesto do micro:bit sente isso?')),
        com('definir_no_agitar', P.regra('definir_no_agitar', a => tem(a.evento('agitar'), 'mk_var_definir'), [
          ['a_pensar', 'Se cada rajada «define» o contador, ele fica sempre no mesmo número. O que é contar?'],
          'Contar é juntar mais um ao que já lá estava.',
          'No agitar, troca «definir contador para» por «mudar contador em 1».',
        ], 'Agora conta mesmo!')),
        com('sem_mudar', P.bloco('agitar', 'mk_var_mudar', 'O micro:bit sente o vento, mas não se lembra de quantas rajadas já houve. Onde guarda a conta?')),
        com('sem_a', P.evento('botao:A', 'A conta está guardada. Como é que pedes ao micro:bit para ta mostrar?')),
        com('sem_mostrar', P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_var', 'O A mostra sempre o mesmo número, com vento ou sem ele. Que número devia mostrar?')),
        com('sem_b', P.evento('botao:B', 'Para contar outro intervalo, tens de recomeçar. Que botão ainda está livre?')),
        com('sem_zerar', P.regra('sem_zerar', a => !!a.evento('botao:B') && !blocos(a.evento('botao:B'), 'mk_var_definir').some(p => Number(p.n) === 0), [
          'Recomeçar é voltar a que número?',
          'Há um bloco vermelho que põe a variável num número à tua escolha.',
          'Põe «definir contador para 0» no botão B.',
        ], 'Contador a zeros!')),
      ],
      sucesso: 'Contador de rajadas pronto! Contar, mostrar e recomeçar: é assim que funcionam os contadores de muitos aparelhos.',
      extensao: 'Conta as rajadas de 5 minutos de manhã e de tarde. Quando há mais vento?',
      gambiarra: {
        xml: G(TOPO('mk_agitar', '', nxt(definirX('contador', 1), ic('Surprised'))), TOPO('mk_botao', '', numX(varX('contador')), 180),
          TOPO('mk_botao', FD('B', 'B'), nxt(definirX('contador', 0), ic('Yes')), 300)),
        pedido: 'Abanei o ramo umas dez vezes e o meu contador diz sempre 1! Que vento é este?',
      },
    },
  };

  // ------------------------------------------------------------ N2 · 7 · Horta inteligente
  const HORTA_INTELIGENTE = {
    titulo: 'Horta inteligente',
    missao: 'A horta fala: terra seca pede água (cara triste e luz acesa); de noite descansa; de dia, com água, está contente.',
    passos: [
      'Para sempre: se «leitura analógica pin P1 < 300» então cara triste e P2 para 1.',
      'Senão: P2 para 0 e, lá dentro, outro «se … senão».',
      'Esse segundo «se»: está escuro? Ícone a dormir. Senão: cara contente.',
      'Experimenta os três casos: seca; molhada de noite; molhada de dia.',
      'Monta no vaso: pregos na terra, LED bem à vista, e mostra à turma.',
    ],
    material: 'micro:bit, 2 pregos, LED, 4 crocodilos, um vaso com terra',
    novos: [],
    caixa: ['mk_sempre', 'mk_se_senao', 'mk_se', 'mk_comparar', 'mk_ler_analogico', 'mk_icone', 'mk_icone_triste', 'mk_icone_dormir', 'mk_digital_1', 'mk_digital_0'],
    sim: ['analogico:P1', 'luz'],
    teste: 'analogico:P1',
    ok: r => algumaJanela(r, st => st['analogico:P1'] < 300, v => v.includes('icone:Sad') && v.includes('digital:P2:1')) &&
      algumaJanela(r, st => st['analogico:P1'] >= 300 && st.luz < 40, v => v.includes('icone:Asleep') && v.includes('digital:P2:0') && !v.includes('digital:P2:1')) &&
      algumaJanela(r, st => st['analogico:P1'] >= 300 && st.luz >= 40, v => v.includes('icone:Happy') && !v.includes('digital:P2:1')),
    tutor: {
      boasVindas: ['boas_vindas', 'Uma horta inteligente sabe três coisas: se tem sede, se é de noite e se está tudo bem. Vamos ensiná-la?'],
      parecePronto: a => {
        const d = seDe(a.evento('sempre'), 'mk_ler_analogico', ['<', '<=']);
        return !!d && temIcone(ramo(d, 'sim'), 'Sad') && ramo(d, 'sim').some(p => p.tipo === 'mk_digital' && p.v === 1) &&
          ramo(d, 'nao').some(p => p.tipo === 'mk_digital' && p.v === 0) && temIcone(ramo(d, 'nao'), 'Asleep') && temIcone(ramo(d, 'nao'), 'Happy');
      },
      testar: 'Tens uma ideia? Vamos testar! Terra seca; depois molhada com a luz apagada; depois molhada com luz.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A horta precisa de alguém que a vigie dia e noite. Quem?')),
        com('sem_se', P.regra('sem_se', a => !!a.evento('sempre') && !ses(a.evento('sempre')).length, [
          'Há várias situações na horta. Que bloco escolhe o que fazer em cada uma?',
          'Começa por um «se … então … senão».',
          'Põe um «se … senão» dentro do «para sempre».',
        ], 'Já decide!')),
        com('sem_humidade', P.regra('sem_humidade', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => usa(d, 'mk_ler_analogico')), [
          'A primeira pergunta é: a terra tem água? Quem sabe isso?',
          'Os pregos estão no pin 1: compara a leitura analógica com um número.',
          'No primeiro «se», põe «leitura analógica pin P1 < 300».',
        ], 'Já sente a terra!')),
        com('ao_contrario', P.regra('ao_contrario', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_ler_analogico') && ['>', '>='].includes(opDe(d))), [
          ['surpreendida', 'Ui! Assim pede água quando a terra está encharcada!'],
          'Leitura pequena = terra seca.',
          'Troca o «>» por «<» no «se» da humidade.',
        ], 'Agora pede água com sede!')),
        com('sem_led', P.regra('sem_led', a => { const d = seDe(a.evento('sempre'), 'mk_ler_analogico'); return !!d && !ramo(d, 'sim').some(p => p.tipo === 'mk_digital' && p.v === 1); }, [
          'Quem está do outro lado da horta não vê a cara. Como avisas de longe?',
          'Com o LED do pin 2.',
          'Põe «gravação digital pin P2 para 1» no «então» da humidade.',
        ], 'Vê-se de longe!')),
        com('led_fica', P.regra('led_fica_aceso', a => { const d = seDe(a.evento('sempre'), 'mk_ler_analogico'); return !!d && ramo(d, 'sim').some(p => p.tipo === 'mk_digital' && p.v === 1) && !ramo(d, 'nao').some(p => p.tipo === 'mk_digital' && p.v === 0); }, [
          ['a_pensar', 'Já reguei… e a luz de «tenho sede» continua acesa. Quem a apaga?'],
          'No «senão» (terra molhada), o LED tem de desligar.',
          'Põe «gravação digital pin P2 para 0» no «senão» da humidade.',
        ], 'Luz apagada, planta feliz!')),
        com('sem_noite', P.regra('sem_noite', a => { const d = seDe(a.evento('sempre'), 'mk_ler_analogico'); return !!d && !ramo(d, 'nao').some(p => (p.tipo === 'mk_se' || p.tipo === 'mk_se_entao') && (usa(p, 'mk_escuro') || usa(p, 'mk_luz'))); }, [
          'Com a terra molhada há mais uma pergunta: é de dia ou de noite?',
          'Dentro do «senão» precisas de outro «se», com «está escuro».',
          'Põe um «se está escuro então … senão …» dentro do «senão» da humidade.',
        ], 'Já sabe que horas são!')),
        com('sem_dormir', P.regra('sem_dormir', a => !!seDe(a.evento('sempre'), 'mk_ler_analogico') && !ses(a.evento('sempre')).some(d => usa(d, 'mk_escuro') && temIcone(ramo(d, 'sim'), 'Asleep')), [
          'De noite a horta descansa. Que cara faz?',
          'O ícone de olhos fechados, no «então» do «está escuro».',
          'Põe o ícone a dormir no «então» e a cara contente no «senão» do segundo «se».',
        ], 'Boa noite, horta!')),
      ],
      sucesso: 'Horta inteligente! Um «se» dentro de outro «se» deixa a máquina pensar em três casos — é assim que se programam regas a sério.',
      extensao: 'E se de noite, com a terra seca, o LED piscasse em vez de ficar aceso, para poupar pilha?',
      gambiarra: {
        xml: G(TOPO('mk_sempre', '', seX(cmpX(AN('P1'), '&lt;', 300), nxt(ic('Sad'), digX(1)), seX(ESCURO, ic('Asleep'), ic('Happy'))))),
        pedido: 'Reguei a horta e a luz de «tenho sede» continua acesa a noite toda! Onde está a minha gambiarra?',
      },
    },
  };

  // ------------------------------------------------------------ N2 · 8 · Espantalho a sério
  const servosRep = e => evPlano(e).filter(p => p.tipo === 'mk_servo' && p.dentroDe === 'mk_repetir');
  const ESPANTALHO_SERIO = {
    titulo: 'Espantalho a sério',
    missao: 'Com um barulho forte, o espantalho faz cara de espanto, solta um grito e abana o braço três vezes.',
    passos: [
      'Em «som alto»: o ícone de espanto e um grito («tocar som»).',
      'Depois, «repetir 3 vezes»: servo a 0, pausa, servo a 180, pausa.',
      'No fim, a cara volta a dormir.',
      'Monta: braço de cartão no servo, servo no espantalho, crocodilos ao P0, 3V e GND.',
      'Testa com palmas e afina as pausas para o braço ter tempo de chegar ao fim.',
    ],
    material: 'micro:bit V2, servo SG90, 3 crocodilos, cartão, um espantalho (paus e roupa velha)',
    novos: [],
    caixa: ['mk_som_alto', 'mk_servo', 'mk_pausa', 'mk_repetir', 'mk_icone', 'mk_icone_surpreendido', 'mk_icone_dormir', 'mk_som', 'mk_tom'],
    sim: ['palmas'],
    teste: 'somalto',
    ok: r => vezesT(r, 'somalto').some(({ s }) => {
      const v = s.map(e => e.v);
      const serv = s.filter(e => e.v.startsWith('servo:'));
      const a = serv.map(e => Number(e.v.split(':')[2]));
      let trans = 0;
      for (let k = 1; k < a.length; k++) if ((a[k] >= 150 && a[k - 1] <= 30) || (a[k] <= 30 && a[k - 1] >= 150)) trans++;
      const lento = serv.every((e, k) => k === 0 || e.t - serv[k - 1].t >= 150);
      return v.includes('icone:Surprised') && v.some(x => x.startsWith('som:') || x.startsWith('tom:')) && trans >= 4 && lento;
    }),
    tutor: {
      boasVindas: ['boas_vindas', 'Os pardais andam a comer as sementes! Um espantalho que só abana uma vez já não os assusta. Vamos fazer um a sério.'],
      parecePronto: a => {
        const e = a.evento('somalto');
        const sv = servosRep(e).map(p => Number(p.angulo));
        return !!e && temIcone(e.plano, 'Surprised') && temSom(e.plano) && sv.some(x => x <= 30) && sv.some(x => x >= 150) &&
          e.plano.some(p => p.tipo === 'mk_pausa' && p.dentroDe === 'mk_repetir');
      },
      testar: 'Tens uma ideia? Vamos testar! Bate palmas e vê o braço a abanar.',
      regras: [
        com('sem_som_alto', P.evento('somalto', 'O espantalho acorda com barulho. Que bloco cor-de-rosa ouve um barulho forte?')),
        com('sem_espanto', P.regra('sem_espanto', a => !!a.evento('somalto') && !temIcone(a.evento('somalto').plano, 'Surprised'), [
          'Quando ouve o barulho, que cara faz o espantalho?',
          'Há um ícone de olhos muito abertos.',
          'Põe «mostrar ícone» de espanto no início do «som alto».',
        ], 'Que susto!')),
        com('sem_grito', P.regra('sem_grito', a => !!a.evento('somalto') && !temSom(a.evento('somalto').plano), [
          'Um espantalho mudo assusta menos. Como é que grita?',
          'Um bloco laranja de música.',
          'Junta «tocar som» (ou «tocar tom») ao «som alto».',
        ], 'Aaaah!')),
        com('sem_servo', P.regra('sem_servo', a => !!a.evento('somalto') && !blocos(a.evento('somalto'), 'mk_servo').length, [
          'E o braço? Quem o mexe?',
          'O servo, no pin 0.',
          'Põe «escrever servo pin P0 para 180» no «som alto».',
        ], 'O braço mexe-se!')),
        com('sem_repetir', P.regra('sem_repetir', a => blocos(a.evento('somalto'), 'mk_servo').length > 0 && !servosRep(a.evento('somalto')).length, [
          'O braço abana uma vez e pára. Os pardais nem reparam! Como fazes isto várias vezes sem copiar blocos?',
          'Há um bloco verde que repete.',
          'Põe os servos dentro de «repetir 3 vezes».',
        ], 'Agora abana a sério!')),
        com('um_lado', P.regra('um_lado', a => { const sv = servosRep(a.evento('somalto')).map(p => Number(p.angulo)); return sv.length > 0 && !(sv.some(x => x <= 30) && sv.some(x => x >= 150)); }, [
          'O braço vai sempre para o mesmo sítio… isso é abanar?',
          'Abanar é ir de um lado ao outro: 0 e 180.',
          'Dentro do «repetir»: servo a 0 e servo a 180.',
        ], 'Para cá e para lá!')),
        com('sem_pausas', P.regra('sem_pausas', a => servosRep(a.evento('somalto')).length > 0 && !a.evento('somalto').plano.some(p => p.tipo === 'mk_pausa' && p.dentroDe === 'mk_repetir'), [
          ['a_pensar', 'O braço só treme! O motor precisa de tempo para chegar ao fim. O que lhe falta?'],
          'Depois de cada servo, espera um bocadinho.',
          'Põe uma «pausa» de 300 ms depois de cada servo, dentro do «repetir».',
        ], 'Agora o braço chega lá!')),
      ],
      sucesso: 'Espantalho a sério! Sensor, repetição e motor com o tempo certo: é uma pequena máquina completa.',
      extensao: 'E se ele contasse quantas vezes assustou os pássaros? Usa o contador e mostra-o no A.',
      gambiarra: {
        xml: G(TOPO('mk_som_alto', '', nxt(ic('Surprised'), somX('slide'), repetirX(3, nxt(servoX(0), servoX(180))), ic('Asleep')))),
        pedido: 'O braço do meu espantalho só treme! Os pardais nem dão por ele. O que lhe falta?',
      },
    },
  };

  // ------------------------------------------------------------ N2 · 9 · Comedouro do amanhecer
  const servosEv = e => evPlano(e).filter(p => p.tipo === 'mk_servo').map(p => Number(p.angulo));
  const ultimoAng = v => { const a = angs(v); return a.length ? a[a.length - 1] : null; };
  const COMEDOURO_AMANHECER = {
    titulo: 'Comedouro do amanhecer',
    missao: 'O comedouro acorda com o sol: de noite fechado, ao amanhecer meio aberto, de dia aberto de par em par.',
    passos: [
      'Para sempre: se «nível de luz < 40» então servo a 0 e ícone a dormir.',
      'Senão: outro «se»: «nível de luz < 150» então servo a 90 (amanhecer).',
      'Senão (muita luz): servo a 180 e cara contente.',
      'Experimenta as três luzes: 10, 100 e 220.',
      'Monta a porta de cartão no servo e vira o comedouro para nascente.',
    ],
    material: 'micro:bit, servo SG90, 3 crocodilos, caixa de cartão, sementes',
    novos: ['mk_luz'],
    caixa: ['mk_sempre', 'mk_se_senao', 'mk_comparar', 'mk_luz', 'mk_servo', 'mk_icone', 'mk_icone_dormir', 'mk_icone_surpreendido'],
    sim: ['luz'],
    teste: 'luz',
    ok: r => algumaJanela(r, st => st.luz < 40, v => ultimoAng(v) !== null && ultimoAng(v) <= 20 && v.includes('icone:Asleep')) &&
      algumaJanela(r, st => st.luz >= 40 && st.luz < 150, v => ultimoAng(v) !== null && ultimoAng(v) >= 60 && ultimoAng(v) <= 120) &&
      algumaJanela(r, st => st.luz >= 150, v => ultimoAng(v) !== null && ultimoAng(v) >= 160 && v.includes('icone:Happy')),
    tutor: {
      boasVindas: ['boas_vindas', 'Os pardais acordam com o sol. Um comedouro que abre de repente assusta-os; vamos fazer um que abre devagarinho, como o amanhecer.'],
      parecePronto: a => {
        const e = a.evento('sempre'); const sv = servosEv(e);
        return ses(e).filter(d => usa(d, 'mk_luz')).length >= 2 && sv.some(x => x <= 20) && sv.some(x => x >= 60 && x <= 120) && sv.some(x => x >= 160) &&
          temIcone(evPlano(e), 'Asleep') && temIcone(evPlano(e), 'Happy');
      },
      testar: 'Tens uma ideia? Vamos testar! Luz a 10, depois 100, depois 220.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'O sol nasce devagar. Quem fica sempre a olhar para o céu?')),
        com('sem_se', P.regra('sem_se', a => !!a.evento('sempre') && !ses(a.evento('sempre')).length, [
          'Noite, amanhecer e dia: o comedouro faz coisas diferentes. Que bloco escolhe?',
          'Um «se … senão» (e depois outro dentro dele).',
          'Põe um «se … senão» dentro do «para sempre».',
        ], 'Já decide!')),
        com('sem_luz', P.regra('sem_luz', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => usa(d, 'mk_luz')), [
          'Como é que o comedouro sabe que o sol nasceu?',
          'Compara o «nível de luz» com um número.',
          'No «se», põe «nível de luz < 40».',
        ], 'Já vê o sol!')),
        com('noite_aberto', P.regra('noite_aberto', a => { const d = seDe(a.evento('sempre'), 'mk_luz', ['<', '<=']); return !!d && servos(ramo(d, 'sim').slice(0, 2)).some(x => x >= 150); }, [
          ['surpreendida', 'Aberto de noite? As raposas agradecem o jantar!'],
          'Luz pequena = noite: a porta fecha.',
          'No primeiro «então», o servo vai a 0.',
        ], 'Fechado de noite!')),
        com('um_so', P.regra('so_dois_estados', a => ses(a.evento('sempre')).filter(d => usa(d, 'mk_luz')).length === 1, [
          'Só há noite e dia? E o amanhecer, quando a luz ainda é pouca?',
          'Dentro do «senão» precisas de outro «se», com outro limite de luz.',
          'Põe «se nível de luz < 150 então servo a 90 senão servo a 180» dentro do primeiro «senão».',
        ], 'Agora amanhece devagar!')),
        com('sem_meio', P.regra('sem_meio', a => ses(a.evento('sempre')).filter(d => usa(d, 'mk_luz')).length >= 2 && !servosEv(a.evento('sempre')).some(x => x >= 60 && x <= 120), [
          'Ao amanhecer, a porta fica toda aberta ou só um bocadinho?',
          'Meio aberto é mais ou menos 90 graus.',
          'No «então» do segundo «se», servo a 90.',
        ], 'Meio aberto!')),
        com('sem_dormir', P.regra('sem_dormir', a => servosEv(a.evento('sempre')).length > 0 && !temIcone(evPlano(a.evento('sempre')), 'Asleep'), [
          'De noite, que cara faz o comedouro?',
          'O ícone de olhos fechados.',
          'Junta o ícone a dormir ao servo a 0.',
        ], 'Boa noite, pardais!')),
      ],
      sucesso: 'Comedouro do amanhecer! Dois limites de luz fazem três estados: é assim que se pensa uma máquina com calma.',
      extensao: 'Abre ao amanhecer a 45° e depois a 90° e a 180°: inventa quatro estados.',
      gambiarra: {
        xml: G(TOPO('mk_sempre', '', seX(cmpX(LUZ, '&lt;', 40), nxt(servoX(0), ic('Asleep')), nxt(servoX(180), ic('Happy'))))),
        pedido: 'O meu comedouro abre de repente às seis da manhã e assusta os pardais! Quero que abra devagarinho, ao amanhecer.',
      },
    },
  };

  // ------------------------------------------------------------ N2 · 10 · Ninho vigiado
  const NINHO_VIGIADO = {
    titulo: 'Ninho vigiado',
    missao: 'O ninho da cegonha quer 15 a 30 °C: abaixo toca um alarme de frio, acima um alarme de calor, diferente do outro.',
    passos: [
      'Para sempre: se «temperatura (°C) < 15» então ícone ✗ e um tom grave.',
      'Senão: outro «se»: «temperatura > 30» então ícone de espanto e um tom agudo.',
      'Senão (entre 15 e 30): cara contente e sem barulho.',
      'Experimenta: 10 °C, 35 °C e 22 °C.',
      'Explica à turma porque é que os dois alarmes têm de soar diferentes.',
    ],
    material: 'micro:bit V2',
    novos: ['mk_icone_nao'],
    caixa: ['mk_sempre', 'mk_se_senao', 'mk_comparar', 'mk_temperatura', 'mk_tom', 'mk_icone', 'mk_icone_nao', 'mk_icone_surpreendido'],
    sim: ['temperatura'],
    teste: 'temperatura',
    ok: r => {
      const fr = janelas(r, st => st.temperatura < 15), ca = janelas(r, st => st.temperatura > 30), meio = janelas(r, st => st.temperatura >= 15 && st.temperatura <= 30);
      const fF = new Set(fr.flatMap(j => toms(j.v))), cF = new Set(ca.flatMap(j => toms(j.v)));
      return fr.some(j => j.v.includes('icone:No')) && ca.some(j => j.v.includes('icone:Surprised')) && fF.size > 0 && cF.size > 0 &&
        ![...fF].some(f => cF.has(f)) && meio.some(j => j.v.includes('icone:Happy') && !toms(j.v).length);
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Os ovos da cegonha não gostam de frio nem de calor a mais. Vamos fazer um vigilante de ninho com dois alarmes!'],
      parecePronto: a => {
        const e = a.evento('sempre');
        const fr = seDe(e, 'mk_temperatura', ['<', '<=']), ca = seDe(e, 'mk_temperatura', ['>', '>=']);
        if (!fr || !ca) return false;
        const fF = freqs(ramo(fr, 'sim').slice(0, 3)), cF = freqs(ramo(ca, 'sim'));
        return temIcone(ramo(fr, 'sim'), 'No') && temIcone(ramo(ca, 'sim'), 'Surprised') && fF.length && cF.length && !fF.some(f => cF.includes(f)) && temIcone(evPlano(e), 'Happy');
      },
      testar: 'Tens uma ideia? Vamos testar! 10 °C, depois 35 °C, depois 22 °C.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'O tempo muda de hora a hora. Quem vigia o ninho sem parar?')),
        com('sem_se', P.regra('sem_se', a => !!a.evento('sempre') && !ses(a.evento('sempre')).length, [
          'Frio, calor ou bom tempo: três casos. Que bloco escolhe?',
          'Um «se … senão», e outro dentro dele.',
          'Põe um «se … senão» dentro do «para sempre».',
        ], 'Já decide!')),
        com('sem_frio', P.regra('sem_frio', a => ses(a.evento('sempre')).length > 0 && !seDe(a.evento('sempre'), 'mk_temperatura', ['<', '<=']), [
          'Quando é que os ovos têm frio? Como é que o micro:bit sabe?',
          'Compara a «temperatura (°C)» com 15: menor quer dizer frio.',
          'No primeiro «se», põe «temperatura (°C) < 15».',
        ], 'Já sente o frio!')),
        com('sem_calor', P.regra('sem_calor', a => !!seDe(a.evento('sempre'), 'mk_temperatura', ['<', '<=']) && !seDe(a.evento('sempre'), 'mk_temperatura', ['>', '>=']), [
          'E quando o sol de julho aquece demais o ninho?',
          'Precisas de outro «se», dentro do «senão», com «temperatura > 30».',
          'Põe «se temperatura (°C) > 30 então … senão …» dentro do primeiro «senão».',
        ], 'Já sente o calor!')),
        com('sem_alarmes', P.regra('sem_alarmes', a => { const e = a.evento('sempre'); const fr = seDe(e, 'mk_temperatura', ['<', '<=']), ca = seDe(e, 'mk_temperatura', ['>', '>=']); return !!fr && !!ca && (!freqs(ramo(fr, 'sim').slice(0, 3)).length || !freqs(ramo(ca, 'sim')).length); }, [
          'Há um alarme mudo. Como é que a cegonha (e tu) dão por ele?',
          'Cada «então» precisa de um «tocar tom».',
          'Junta «tocar tom» ao «então» do frio e ao «então» do calor.',
        ], 'Os dois apitam!')),
        com('iguais', P.regra('alarmes_iguais', a => { const e = a.evento('sempre'); const fr = seDe(e, 'mk_temperatura', ['<', '<=']), ca = seDe(e, 'mk_temperatura', ['>', '>=']); if (!fr || !ca) return false; const fF = freqs(ramo(fr, 'sim').slice(0, 3)), cF = freqs(ramo(ca, 'sim')); return fF.length && cF.length && fF.some(f => cF.includes(f)); }, [
          ['surpreendida', 'O alarme de frio e o de calor soam igual! A cegonha tapa os ovos ou abre as asas?'],
          'Frio com um som grave, calor com um som agudo.',
          'No frio escolhe Dó (grave); no calor escolhe Dó alto.',
        ], 'Dois alarmes diferentes!')),
        com('sem_contente', P.regra('sem_contente', a => !!seDe(a.evento('sempre'), 'mk_temperatura', ['>', '>=']) && !temIcone(evPlano(a.evento('sempre')), 'Happy'), [
          'E quando está tudo bem, entre 15 e 30 graus?',
          'O último «senão» é o bom tempo.',
          'Põe a cara contente no último «senão».',
        ], 'Ninho feliz!')),
      ],
      sucesso: 'Ninho vigiado! Dois limites, três casos e alarmes diferentes: os vigilantes de verdade funcionam assim.',
      extensao: 'Conta quantas vezes tocou o alarme de calor numa tarde de verão (usa o contador e mostra-o no A).',
      gambiarra: {
        xml: G(TOPO('mk_sempre', '', seX(cmpX(TEMP, '&lt;', 15), nxt(ic('No'), tomX(262)), seX(cmpX(TEMP, '&gt;', 30), nxt(ic('Surprised'), tomX(262)), ic('Happy'))))),
        pedido: 'O meu ninho apita igual quando está frio e quando está calor! A cegonha fica baralhada: tapa os ovos ou abre as asas?',
      },
    },
  };

  // ------------------------------------------------------------ N2 · 11 · Hotel de insetos
  const HOTEL_INSETOS = {
    titulo: 'Hotel de insetos',
    missao: 'A porta de alumínio conta cada visita com um zumbido; à 5.ª visita o hotel está cheio e faz festa.',
    passos: [
      'Faz a porta: dois bocados de alumínio, um no pin 1 e outro no GND, que se tocam quando alguém entra.',
      'No pin 1: «mudar contador em 1», um tom curto e «mostrar número» do contador.',
      'Depois, ainda no pin 1: «se contador = 5 então» coração e um som de festa.',
      'Experimenta: toca 5 vezes no pin 1 (a festa só pode aparecer na 5.ª).',
      'Constrói o hotel com canas, pinhas e palha e põe-no num canto calmo da horta.',
    ],
    material: 'micro:bit, 2 crocodilos, papel de alumínio, canas, pinhas, palha, uma caixa',
    novos: ['mk_icone_coracao'],
    caixa: ['mk_pino_tocado', 'mk_var_mudar', 'mk_var', 'mk_mostrar_numero', 'mk_tom_livre', 'mk_se_entao', 'mk_comparar', 'mk_icone_coracao', 'mk_som'],
    teste: 'pino:P1',
    ok: r => {
      let c = 0, chegou = false;
      for (let i = 0; i < r.length; i++) {
        if (r[i].dir !== 'in' || r[i].v !== 'pino:P1') continue;
        const s = saidasDe(r, i);
        if (!s.length) continue;           // a porta estava ocupada: não contou
        c++;
        if (c > 5) break;
        if (!s.includes('numero:' + c)) return false;
        if (c < 5 && s.includes('icone:Heart')) return false;
        if (c === 5) chegou = s.includes('icone:Heart');
      }
      return chegou;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'As abelhas solitárias e as joaninhas precisam de casa. Vamos fazer um hotel de insetos que conta os hóspedes!'],
      parecePronto: a => {
        const e = a.evento('pino:P1');
        return tem(e, 'mk_var_mudar') && numeroCom(e, 'mk_var') && ses(e).some(d => usa(d, 'mk_var') && usa(d, 'mk_comparar') && temIcone(ramo(d, 'sim'), 'Heart'));
      },
      testar: 'Tens uma ideia? Vamos testar! Toca 5 vezes no pin 1, devagar.',
      regras: [
        com('sem_pino', P.evento('pino:P1', 'Quando um inseto passa a porta de alumínio, fecha um circuito. Que bloco sente isso?')),
        com('sem_contar', P.bloco('pino:P1', 'mk_var_mudar', 'O hotel vê o hóspede entrar, mas esquece-se logo. Onde guarda a conta?')),
        com('sem_numero', P.regra('sem_numero', a => !!a.evento('pino:P1') && tem(a.evento('pino:P1'), 'mk_var_mudar') && !numeroCom(a.evento('pino:P1'), 'mk_var'), [
          'O hotel conta às escondidas. Como é que mostra quantos hóspedes já entraram?',
          'Um «mostrar número» com a variável lá dentro.',
          'Põe «mostrar número» com «contador» depois do «mudar contador».',
        ], 'Já mostra os hóspedes!')),
        com('festa_fora', P.regra('festa_fora', a => { const e = a.evento('pino:P1'); return !!e && e.plano.some(p => p.tipo === 'mk_icone' && p.icone === 'Heart' && !p.dentroDe); }, [
          ['surpreendida', 'Festa a cada mosquito que entra? O hotel só está cheio quando chegar aos 5!'],
          'A festa tem de estar dentro de um «se».',
          'Mete o coração e o som de festa dentro de «se contador = 5 então».',
        ], 'Só festeja quando está cheio!')),
        com('sem_se', P.regra('sem_se', a => !!a.evento('pino:P1') && numeroCom(a.evento('pino:P1'), 'mk_var') && !ses(a.evento('pino:P1')).length, [
          'Como é que o hotel sabe que já está cheio?',
          'Tem de comparar o contador com 5.',
          'Põe «se contador = 5 então» no fim do pin 1.',
        ], 'Já sabe quando está cheio!')),
        com('sem_cinco', P.regra('sem_cinco', a => ses(a.evento('pino:P1')).length > 0 && !ses(a.evento('pino:P1')).some(d => usa(d, 'mk_var') && (d.usa || []).some(u => u.tipo === 'mk_num' && u.n === 5)), [
          'O «se» está lá… mas compara o quê com quê?',
          'O contador, com o número 5.',
          'No «se», põe «contador = 5».',
        ], 'Cinco hóspedes!')),
        com('sem_festa', P.regra('sem_festa', a => ses(a.evento('pino:P1')).some(d => usa(d, 'mk_var')) && !ses(a.evento('pino:P1')).some(d => temIcone(ramo(d, 'sim'), 'Heart')), [
          'O hotel encheu! E agora, como festeja?',
          'Um coração e um som de festa.',
          'Põe o ícone do coração (e um som) dentro do «então».',
        ], 'Hotel cheio, festa!')),
      ],
      sucesso: 'Hotel de insetos aberto! Contar e comparar com um limite é o que fazem os contadores de lugares de um parque.',
      extensao: 'E se ao 10.º hóspede o hotel tocasse uma melodia ainda maior?',
      gambiarra: {
        xml: G(TOPO('mk_pino_tocado', FD('P', 'P1'), nxt(mudarX('contador'), B_('mk_tom', N('F', 880) + `<value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.25</field></shadow></value>`), numX(varX('contador')), ic('Heart'), somX('happy')))),
        pedido: 'O meu hotel faz festa a cada mosquito que entra! Só devia festejar quando estiver cheio.',
      },
    },
  };

  // ------------------------------------------------------------ N3 · 7 · Diário automático
  const regs = e => evPlano(e).filter(p => p.tipo === 'mk_registar');
  const SENSOR_DE = { humidade: 'mk_ler_analogico', luz: 'mk_luz', temperatura: 'mk_temperatura' };
  const nomeReg = p => String(p.nome || '').trim().toLowerCase();
  const DIARIO_AUTO = {
    titulo: 'Diário automático',
    missao: 'O diário escreve-se sozinho: humidade, luz e temperatura de segundo a segundo; o A diz quantas linhas já tem.',
    passos: [
      'No arranque: «definir contador para 0».',
      'Para sempre: registar «humidade» (P1), «luz» e «temperatura».',
      'Ainda no «para sempre»: «mudar contador em 1» e uma pausa de 1 segundo.',
      'No A: mostrar o contador (o número de linhas do diário).',
      'Deixa-o meia hora na horta e abre o MY_DATA no computador para ver o gráfico.',
    ],
    material: 'micro:bit V2 com pilhas, 2 pregos, 2 crocodilos, um vaso ou canteiro, computador',
    novos: ['mk_iniciar', 'mk_registar_humidade'],
    caixa: ['mk_iniciar', 'mk_sempre', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_registar', 'mk_registar_temp', 'mk_registar_humidade', 'mk_ler_analogico', 'mk_luz', 'mk_temperatura', 'mk_pausa', 'mk_botao', 'mk_mostrar_numero'],
    sim: ['analogico:P1', 'luz', 'temperatura'],
    teste: 'analogico:P1',
    ok: r => {
      const lista = nome => r.map((e, i) => ({ e, i })).filter(({ e }) => e.dir === 'out' && e.v.startsWith('registo:' + nome + ':'));
      const certo = (nome, k) => lista(nome).some(({ e, i }) => { const st = estadoEm(r, i); return Number(e.v.split(':')[2]) === st[k] && st[k] !== SENS_BASE[k]; });
      const h = lista('humidade');
      const espacado = h.length >= 2 && h.every(({ e }, k) => k === 0 || e.t - h[k - 1].e.t >= 500);
      const conta = vezes(r, 'botao:A').some(({ i, s }) => { const c = varEm(r, i, 'contador'); return c >= 2 && s.includes('numero:' + c); });
      return certo('humidade', 'analogico:P1') && certo('luz', 'luz') && certo('temperatura', 'temperatura') && espacado && conta;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Os cientistas não ficam na horta o dia todo: deixam um aparelho a escrever por eles. Vamos fazer um diário automático!'],
      parecePronto: a => {
        const e = a.evento('sempre'); const rs = regs(e);
        return Object.entries(SENSOR_DE).every(([n, t]) => rs.some(p => nomeReg(p) === n && usa(p, t))) && tem(e, 'mk_pausa') && tem(e, 'mk_var_mudar') && numeroCom(a.evento('botao:A'), 'mk_var');
      },
      testar: 'Tens uma ideia? Vamos testar! Muda a humidade, a luz e a temperatura, espera uns segundos e carrega em A.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'O diário escreve-se sozinho, a toda a hora. Quem trabalha sem parar?')),
        com('sem_registar', P.bloco('sempre', 'mk_registar', 'Medir não chega: é preciso escrever no diário. Que bloco escreve dados?')),
        com('faltam', P.regra('faltam_dados', a => regs(a.evento('sempre')).length > 0 && Object.keys(SENSOR_DE).some(n => !regs(a.evento('sempre')).some(p => nomeReg(p) === n)), [
          'O diário ainda não tem as três colunas. Quais são?',
          'Humidade, luz e temperatura: um «registar dados» para cada uma, com esse nome.',
          'Junta os «registar dados» que faltam, com o nome certo em cada um.',
        ], 'Três colunas no diário!')),
        com('trocados', P.regra('dados_trocados', a => regs(a.evento('sempre')).some(p => SENSOR_DE[nomeReg(p)] && !usa(p, SENSOR_DE[nomeReg(p)])), [
          ['surpreendida', 'Há uma coluna com o nome de uma coisa e o valor de outra! Assim o gráfico vai mentir.'],
          'humidade ← leitura analógica P1 · luz ← nível de luz · temperatura ← temperatura (°C).',
          'Encaixa em cada «registar dados» o sensor que corresponde ao nome.',
        ], 'Cada dado no seu sítio!')),
        com('sem_pausa', P.regra('sem_pausa', a => regs(a.evento('sempre')).length > 0 && !tem(a.evento('sempre'), 'mk_pausa'), [
          ['a_pensar', 'O diário escreve milhares de linhas por minuto e enche a memória num instante! O que falta?'],
          'Entre medições, o micro:bit tem de esperar.',
          'Põe uma «pausa» de 1000 ms no fim do «para sempre».',
        ], 'Agora escreve com calma!')),
        com('sem_contar', P.regra('sem_contar', a => regs(a.evento('sempre')).length > 0 && !tem(a.evento('sempre'), 'mk_var_mudar'), [
          'Quantas linhas já tem o diário? Quem conta?',
          'A cada volta do «para sempre», soma 1 ao contador.',
          'Põe «mudar contador em 1» dentro do «para sempre».',
        ], 'Já conta as linhas!')),
        com('sem_a', P.evento('botao:A', 'Como é que perguntas ao diário quantas linhas já escreveu?')),
        com('sem_mostrar', P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_var', 'O A mostra sempre o mesmo número. Que número devia ser?')),
      ],
      sucesso: 'Diário automático! Agora tens dados a sério: abre o MY_DATA.HTM e vê três gráficos a crescer.',
      extensao: 'Muda a pausa para 60000 (um minuto) e deixa-o um dia inteiro. A que horas a terra seca mais?',
      gambiarra: {
        xml: G(TOPO('mk_iniciar', '', definirX('contador', 0)),
          TOPO('mk_sempre', '', nxt(regX('humidade', AN('P1')), regX('luz', LUZ), regX('temperatura', TEMP), mudarX('contador')), 160),
          TOPO('mk_botao', '', numX(varX('contador')), 360)),
        pedido: 'O meu diário encheu a memória do micro:bit em dois minutos: milhares de linhas! Acho que escreve depressa demais…',
      },
    },
  };

  // ------------------------------------------------------------ N3 · 8 · Censo das aves
  const textos = v => v.filter(x => x.startsWith('texto:')).map(x => x.slice(6).trim().toUpperCase());
  const CENSO_AVES = {
    titulo: 'Censo das aves',
    missao: 'O A conta cegonhas, o B conta andorinhas; o A+B mostra o total e diz quem ganhou: «C» ou «A».',
    passos: [
      'No A: «mudar contador em 1» (cegonhas). No B: «mudar pontos em 1» (andorinhas).',
      'No A+B: «mostrar número» com «contador + pontos» (o total de aves).',
      'Ainda no A+B: «se contador > pontos então mostrar texto C senão mostrar texto A».',
      'Experimenta: 3 cegonhas e 1 andorinha; depois mais 3 andorinhas.',
      'Vai ao recreio 10 minutos com binóculos e faz o censo a sério com um colega.',
    ],
    material: 'micro:bit, binóculos (ou um tubo de cartão), uma folha para o censo',
    novos: ['mk_conta', 'mk_mostrar_texto'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_botao_AB', 'mk_var_mudar', 'mk_var_mudar_pontos', 'mk_var', 'mk_var_pontos', 'mk_conta', 'mk_mostrar_numero', 'mk_se_senao', 'mk_comparar', 'mk_mostrar_texto', 'mk_pausa'],
    teste: 'botao:AB',
    ok: r => {
      let c = 0, p = 0, ganhaC = false, ganhaA = false;
      for (let i = 0; i < r.length; i++) {
        const e = r[i];
        if (e.dir !== 'in') continue;
        const s = saidasDe(r, i);
        if (e.v === 'botao:A' && s.length) c++;
        else if (e.v === 'botao:B' && s.length) p++;
        else if (e.v === 'botao:AB') {
          if (!s.includes('numero:' + (c + p))) return false;
          const t = textos(s);
          if (c > p) { if (!t.some(x => x.startsWith('C'))) return false; ganhaC = true; }
          if (p > c) { if (!t.some(x => x.startsWith('A'))) return false; ganhaA = true; }
        }
      }
      return ganhaC && ganhaA;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Em Messejana há cegonhas nas torres e andorinhas nos beirais. Quais são mais? Vamos fazer um censo!'],
      parecePronto: a => {
        const AB = a.evento('botao:AB');
        const d = ses(AB).find(x => usa(x, 'mk_comparar') && (x.usa || []).filter(u => u.tipo === 'mk_var').length >= 2);
        return blocos(a.evento('botao:A'), 'mk_var_mudar').some(p => p.var === 'contador') && blocos(a.evento('botao:B'), 'mk_var_mudar').some(p => p.var === 'pontos') &&
          !!AB && AB.plano.some(p => p.tipo === 'mk_mostrar_numero' && (p.usa || []).some(u => u.tipo === 'mk_conta' && u.op === '+')) &&
          !!d && ramo(d, 'sim').some(p => p.tipo === 'mk_mostrar_texto') && ramo(d, 'nao').some(p => p.tipo === 'mk_mostrar_texto');
      },
      testar: 'Tens uma ideia? Vamos testar! A, A, A, B e depois A+B. A seguir B, B, B e A+B.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Uma cegonha a voar! Qual é o botão das cegonhas?')),
        com('sem_b', P.evento('botao:B', 'E as andorinhas? Que botão as conta?')),
        com('sem_contar', P.regra('sem_contar', a => ['botao:A', 'botao:B'].some(k => a.evento(k) && !tem(a.evento(k), 'mk_var_mudar')), [
          'Há um botão que vê as aves mas não as conta. Onde se guarda a conta?',
          'Cada botão soma 1 à sua variável.',
          'Põe «mudar … em 1» no botão que ainda não conta.',
        ], 'Já conta!')),
        com('mesma_var', P.regra('mesma_var', a => { const va = blocos(a.evento('botao:A'), 'mk_var_mudar').map(p => p.var), vb = blocos(a.evento('botao:B'), 'mk_var_mudar').map(p => p.var); return va.length && vb.length && va.some(x => vb.includes(x)); }, [
          ['surpreendida', 'As cegonhas e as andorinhas vão para a mesma conta! Como sabes depois quantas são de cada?'],
          'Cada espécie precisa da sua variável.',
          'No A usa «contador»; no B, carrega na setinha e escolhe «pontos».',
        ], 'Cada ave na sua conta!')),
        com('sem_ab', P.evento('botao:AB', 'Para saber o resultado, carregas nos dois botões ao mesmo tempo. Que bloco ouve isso?')),
        com('sem_total', P.regra('sem_total', a => !!a.evento('botao:AB') && !a.evento('botao:AB').plano.some(p => p.tipo === 'mk_mostrar_numero' && (p.usa || []).some(u => u.tipo === 'mk_conta')), [
          'Quantas aves viste ao todo? Como se junta duas contas?',
          'Há um bloco violeta que faz contas: «+».',
          'No A+B: «mostrar número» com «contador + pontos».',
        ], 'Total à vista!')),
        com('soma_errada', P.regra('soma_errada', a => !!a.evento('botao:AB') && a.evento('botao:AB').plano.some(p => p.tipo === 'mk_mostrar_numero' && (p.usa || []).some(u => u.tipo === 'mk_conta' && u.op !== '+')), [
          'O total de aves é uma soma ou outra conta?',
          'Juntar é somar.',
          'Escolhe «+» na conta do total.',
        ], 'Soma certa!')),
        com('sem_vencedor', P.regra('sem_vencedor', a => !!a.evento('botao:AB') && !ses(a.evento('botao:AB')).length, [
          'Quem ganhou o censo? Como é que o micro:bit compara as duas contas?',
          'Um «se contador > pontos então … senão …».',
          'Põe o «se … senão» no A+B, com um «mostrar texto» em cada lado.',
        ], 'Já sabe quem ganhou!')),
        com('vencedor_trocado', P.regra('vencedor_trocado', a => ses(a.evento('botao:AB')).some(d => ['>', '>='].includes(opDe(d)) && ramo(d, 'sim').some(p => p.tipo === 'mk_mostrar_texto' && String(p.texto || '').trim().toUpperCase().startsWith('A'))), [
          ['surpreendida', 'Mais cegonhas e ganha a andorinha? Há letras trocadas!'],
          '«contador > pontos» quer dizer: mais cegonhas.',
          'No «então» escreve C; no «senão» escreve A.',
        ], 'Vencedor certo!')),
      ],
      sucesso: 'Censo feito! Contar, somar e comparar: é exatamente o que fazem os biólogos que contam aves todos os anos.',
      extensao: 'E se houvesse um empate? Junta outro «se» para mostrar «=» quando as contas são iguais.',
      gambiarra: {
        xml: G(TOPO('mk_botao', '', mudarX('contador')), TOPO('mk_botao', FD('B', 'B'), mudarX('pontos'), 140),
          TOPO('mk_botao', FD('B', 'AB'), nxt(numX(B_('mk_conta', FD('OP', '+') + V('A', varX('contador')) + V('B', varX('pontos')))),
            seX(cmpX(varX('contador'), '&gt;', varX('pontos')), B_('mk_mostrar_texto', TX('T', 'A')), B_('mk_mostrar_texto', TX('T', 'C')))), 260)),
        pedido: 'Contei 3 cegonhas e 1 andorinha e o meu censo diz que ganharam as andorinhas! Troquei alguma coisa?',
      },
    },
  };

  // ------------------------------------------------------------ N3 · 9 · Recordes do ano
  const RECORDES = {
    titulo: 'Recordes de geada e calor',
    missao: 'O micro:bit guarda a temperatura mais alta e a mais baixa; o A mostra o máximo, o B o mínimo.',
    passos: [
      'No arranque: «definir recorde para» a temperatura e «definir medida para» a temperatura.',
      'Para sempre: se «temperatura > recorde» então definir recorde para a temperatura.',
      'E também: se «temperatura < medida» então definir medida para a temperatura.',
      'No A: mostrar o recorde (máximo). No B: mostrar a medida (mínimo).',
      'Deixa-o uma noite lá fora, protegido da chuva, e lê os recordes de manhã.',
    ],
    material: 'micro:bit com pilhas, um frasco para o proteger da chuva',
    novos: ['mk_var_definir_medida', 'mk_var_medida'],
    caixa: ['mk_iniciar', 'mk_sempre', 'mk_se_entao', 'mk_comparar', 'mk_temperatura', 'mk_var_definir_recorde', 'mk_var_recorde', 'mk_var_definir_medida', 'mk_var_medida', 'mk_botao', 'mk_botao_B', 'mk_mostrar_numero'],
    sim: ['temperatura'],
    teste: 'temperatura',
    ok: r => {
      let max = -Infinity, min = Infinity, a = false, b = false;
      for (let i = 0; i < r.length; i++) {
        const e = r[i];
        if (e.dir !== 'in') continue;
        if (e.v.startsWith('temperatura:')) { const t = valorDe(e.v); max = Math.max(max, t); min = Math.min(min, t); continue; }
        const s = saidasDe(r, i);
        if (e.v === 'botao:A' && Number.isFinite(max) && s.includes('numero:' + max)) a = true;
        if (e.v === 'botao:B' && Number.isFinite(min) && s.includes('numero:' + min)) b = true;
      }
      return a && b;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'No Alentejo pode haver geada em janeiro e 45 graus em agosto! Vamos fazer uma estação que guarda os recordes.'],
      parecePronto: a => {
        const I = a.evento('inicio'), S = a.evento('sempre');
        const def = (e, v) => blocos(e, 'mk_var_definir').some(p => p.var === v && usa(p, 'mk_temperatura'));
        return def(I, 'recorde') && def(I, 'medida') && ses(S).some(d => ['>', '>='].includes(opDe(d)) && ramo(d, 'sim').some(p => p.tipo === 'mk_var_definir' && p.var === 'recorde')) &&
          ses(S).some(d => ['<', '<='].includes(opDe(d)) && ramo(d, 'sim').some(p => p.tipo === 'mk_var_definir' && p.var === 'medida')) &&
          numeroCom(a.evento('botao:A'), 'mk_var') && numeroCom(a.evento('botao:B'), 'mk_var');
      },
      testar: 'Tens uma ideia? Vamos testar! Põe 30 °C, depois 5 °C, depois 20 °C; carrega em A e em B.',
      regras: [
        com('sem_inicio', P.evento('inicio', 'Antes de começar a vigiar, os recordes têm de partir de algum lado. Que bloco corre uma vez, ao ligar?')),
        com('sem_sempre', P.evento('sempre', 'O calor e o frio podem bater recordes a qualquer hora. Quem vigia sem parar?')),
        com('min_zero', P.regra('minimo_a_zero', a => !!a.evento('inicio') && !blocos(a.evento('inicio'), 'mk_var_definir').some(p => p.var === 'medida' && usa(p, 'mk_temperatura')), [
          ['a_pensar', 'Se o mínimo começa em 0, nunca há temperatura mais baixa do que isso no verão! De onde deve partir?'],
          'No arranque, o mínimo começa na temperatura desse momento.',
          'No arranque: «definir medida para temperatura (°C)».',
        ], 'O mínimo já parte do sítio certo!')),
        com('max_zero', P.regra('maximo_a_zero', a => !!a.evento('inicio') && !blocos(a.evento('inicio'), 'mk_var_definir').some(p => p.var === 'recorde' && usa(p, 'mk_temperatura')), [
          'O máximo também tem de partir da temperatura de agora. Onde?',
          'No arranque, o recorde começa na temperatura desse momento.',
          'No arranque: «definir recorde para temperatura (°C)».',
        ], 'O máximo já parte do sítio certo!')),
        com('sem_max', P.regra('sem_maximo', a => !!a.evento('sempre') && !ses(a.evento('sempre')).some(d => ['>', '>='].includes(opDe(d)) && ramo(d, 'sim').some(p => p.tipo === 'mk_var_definir' && p.var === 'recorde')), [
          'Quando é que há um novo recorde de calor?',
          'Quando a temperatura é MAIOR do que o recorde guardado.',
          'Para sempre: «se temperatura > recorde então definir recorde para temperatura».',
        ], 'Recorde de calor a funcionar!')),
        com('sem_min', P.regra('sem_minimo', a => !!a.evento('sempre') && !ses(a.evento('sempre')).some(d => ['<', '<='].includes(opDe(d)) && ramo(d, 'sim').some(p => p.tipo === 'mk_var_definir' && p.var === 'medida')), [
          'E a geada? Quando é que há um novo recorde de frio?',
          'Quando a temperatura é MENOR do que a medida guardada.',
          'Para sempre: «se temperatura < medida então definir medida para temperatura».',
        ], 'Recorde de frio a funcionar!')),
        com('sem_a', P.evento('botao:A', 'Como é que perguntas qual foi o máximo?')),
        com('sem_b', P.evento('botao:B', 'E o mínimo? Que botão o mostra?')),
      ],
      sucesso: 'Estação de recordes pronta! Máximo e mínimo são os dois números que os meteorologistas anotam todos os dias.',
      extensao: 'E se o A+B mostrasse a amplitude térmica: máximo menos mínimo?',
      gambiarra: {
        xml: G(TOPO('mk_iniciar', '', definirX('recorde', TEMP)),
          TOPO('mk_sempre', '', nxt(seEntaoX(cmpX(TEMP, '&gt;', varX('recorde')), definirX('recorde', TEMP)), seEntaoX(cmpX(TEMP, '&lt;', varX('medida')), definirX('medida', TEMP))), 140),
          TOPO('mk_botao', '', numX(varX('recorde')), 360), TOPO('mk_botao', FD('B', 'B'), numX(varX('medida')), 460)),
        pedido: 'O meu mínimo diz sempre 0 °C, mesmo em pleno agosto no Alentejo! Que gambiarra foi esta?',
      },
    },
  };

  // ------------------------------------------------------------ N3 · 10 · Rega com temporizador
  const REGA_TEMPO = {
    titulo: 'Rega com temporizador',
    missao: 'Com a terra seca, a torneira abre 2 segundos, fecha, e o diário regista que regou.',
    passos: [
      'Para sempre: se «leitura analógica pin P1 < 300» então…',
      '… servo a 180, pausa de 2000 ms, servo a 0;',
      '… e «registar dados rega =» leitura analógica P1.',
      'Senão: servo a 0 (torneira fechada).',
      'Monta a garrafa com o tubo na «torneira» do servo e testa com terra seca e molhada.',
    ],
    material: 'micro:bit V2, 2 pregos, servo SG90, 5 crocodilos, garrafa com tubo, vaso com terra',
    novos: ['mk_registar_rega'],
    caixa: ['mk_sempre', 'mk_se_senao', 'mk_comparar', 'mk_ler_analogico', 'mk_servo', 'mk_pausa', 'mk_registar_rega'],
    sim: ['analogico:P1'],
    teste: 'analogico:P1',
    ok: r => algumaJanela(r, st => st['analogico:P1'] < 300, (v, j) => {
      const serv = j.s.filter(e => e.v.startsWith('servo:'));
      const abre = serv.findIndex(e => Number(e.v.split(':')[2]) >= 160);
      if (abre < 0) return false;
      const fecha = serv.slice(abre + 1).find(e => Number(e.v.split(':')[2]) <= 20);
      return !!fecha && fecha.t - serv[abre].t >= 1500 && v.some(x => x.startsWith('registo:rega:'));
    }) && algumaJanela(r, st => st['analogico:P1'] >= 300, v => angs(v).length > 0 && !angs(v).some(a => a >= 160) && ultimoAng(v) <= 20),
    tutor: {
      boasVindas: ['boas_vindas', 'No verão alentejano, cada gota conta. Uma rega boa abre pouco tempo e anota quando regou. Vamos fazê-la!'],
      parecePronto: a => {
        const d = seDe(a.evento('sempre'), 'mk_ler_analogico', ['<', '<=']);
        if (!d) return false;
        const sim = ramo(d, 'sim'); const k = sim.findIndex(p => p.tipo === 'mk_servo' && Number(p.angulo) >= 160);
        return k >= 0 && sim.slice(k + 1).some(p => p.tipo === 'mk_pausa') && sim.slice(k + 1).some(p => p.tipo === 'mk_servo' && Number(p.angulo) <= 20) &&
          sim.some(p => p.tipo === 'mk_registar') && servos(ramo(d, 'nao')).some(x => x <= 20);
      },
      testar: 'Tens uma ideia? Vamos testar! Terra seca (100) e espera 3 segundos; depois terra molhada (800).',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A terra seca a qualquer hora. Quem vigia sem parar?')),
        com('sem_se', P.regra('sem_se', a => !!a.evento('sempre') && !ses(a.evento('sempre')).length, [
          'Só se rega quando é preciso. Que bloco decide?',
          'Um «se … então … senão».',
          'Põe um «se … senão» dentro do «para sempre».',
        ], 'Já decide!')),
        com('sem_humidade', P.regra('sem_humidade', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => usa(d, 'mk_ler_analogico')), [
          'Como sabe o micro:bit que a terra tem sede?',
          'Os pregos no pin 1: a leitura analógica.',
          'No «se», põe «leitura analógica pin P1 < 300».',
        ], 'Já sente a terra!')),
        com('ao_contrario', P.regra('ao_contrario', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_ler_analogico') && ['>', '>='].includes(opDe(d))), [
          ['surpreendida', 'Assim rega a terra que já está encharcada!'],
          'Leitura pequena = terra seca.',
          'Troca o «>» por «<».',
        ], 'Rega quando tem sede!')),
        com('sem_abrir', P.regra('sem_abrir', a => { const d = seDe(a.evento('sempre'), 'mk_ler_analogico'); return !!d && !servos(ramo(d, 'sim')).some(x => x >= 160); }, [
          'A terra tem sede… quem abre a torneira?',
          'O servo, a 180.',
          'No «então», põe «escrever servo pin P0 para 180».',
        ], 'Água a correr!')),
        com('sem_tempo', P.regra('sem_tempo', a => { const d = seDe(a.evento('sempre'), 'mk_ler_analogico'); if (!d) return false; const s = ramo(d, 'sim'); const k = s.findIndex(p => p.tipo === 'mk_servo' && Number(p.angulo) >= 160); return k >= 0 && !s.slice(k + 1).some(p => p.tipo === 'mk_pausa'); }, [
          ['a_pensar', 'A torneira abre e fecha tão depressa que não cai uma gota! Quanto tempo devia ficar aberta?'],
          'Entre abrir e fechar, o micro:bit tem de esperar.',
          'Depois do servo a 180: «pausa 2000», e só depois servo a 0.',
        ], 'Dois segundos de água!')),
        com('sem_fechar', P.regra('sem_fechar', a => { const d = seDe(a.evento('sempre'), 'mk_ler_analogico'); if (!d) return false; const s = ramo(d, 'sim'); const k = s.findIndex(p => p.tipo === 'mk_servo' && Number(p.angulo) >= 160); return k >= 0 && !s.slice(k + 1).some(p => p.tipo === 'mk_servo' && Number(p.angulo) <= 20); }, [
          'A torneira abre… e fecha quando?',
          'Depois da pausa, a torneira volta a 0.',
          'No «então», depois da pausa, põe servo a 0.',
        ], 'Torneira fechada!')),
        com('sem_registo', P.regra('sem_registo', a => { const d = seDe(a.evento('sempre'), 'mk_ler_analogico'); return !!d && servos(ramo(d, 'sim')).length > 0 && !ramo(d, 'sim').some(p => p.tipo === 'mk_registar'); }, [
          'Regou… mas ninguém fica a saber quando. Onde se anota?',
          'No diário de dados.',
          'No «então», põe «registar dados rega =» com a leitura analógica P1.',
        ], 'Rega anotada!')),
        com('molhada_aberta', P.regra('molhada_aberta', a => { const d = seDe(a.evento('sempre'), 'mk_ler_analogico'); return !!d && servos(ramo(d, 'sim')).length > 0 && !servos(ramo(d, 'nao')).some(x => x <= 20); }, [
          'E quando a terra está molhada, a torneira fica como?',
          'O «senão» é a terra molhada.',
          'No «senão», põe servo a 0.',
        ], 'Água poupada!')),
      ],
      sucesso: 'Rega com temporizador! Abrir pouco tempo e anotar cada rega é o que fazem os sistemas de rega gota-a-gota.',
      extensao: 'Conta as regas de um dia (mudar contador em 1 no «então») e mostra-as no A.',
      gambiarra: {
        xml: G(TOPO('mk_sempre', '', seX(cmpX(AN('P1'), '&lt;', 300), nxt(servoX(180), servoX(0), regX('rega', AN('P1'))), servoX(0)))),
        pedido: 'A minha rega abre e fecha tão depressa que não cai nem uma gota! O registo diz que regou… mas a terra continua seca.',
      },
    },
  };

  // ------------------------------------------------------------ N3 · 11 · Duas plantas
  const pinosComparados = d => new Set((d.usa || []).filter(u => u.tipo === 'mk_ler_analogico').map(u => u.pino));
  const DUAS_PLANTAS = {
    titulo: 'Duas plantas, quem tem sede?',
    missao: 'Dois vasos, dois pares de pregos: o A diz qual tem mais sede (0 ou 1) e o B mostra a diferença de humidade.',
    passos: [
      'Liga o primeiro vaso ao pin 0 e o segundo ao pin 1 (o outro prego de cada vaso vai ao 3V).',
      'No A: «se leitura analógica P0 < leitura analógica P1 então mostrar número 0 senão mostrar número 1».',
      'No B: «mostrar número» com «leitura P1 − leitura P0».',
      'Experimenta: rega só um vaso e vê se o micro:bit acerta.',
      'Põe um vaso ao sol e outro à sombra e mede durante uma semana: qual seca mais depressa?',
    ],
    material: 'micro:bit, 4 pregos, 4 crocodilos, 2 vasos com terra',
    novos: ['mk_ler_analogico_p0'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_se_senao', 'mk_comparar', 'mk_ler_analogico', 'mk_ler_analogico_p0', 'mk_mostrar_numero', 'mk_conta_menos'],
    sim: ['analogico:P0', 'analogico:P1'],
    teste: 'botao:A',
    ok: r => {
      let zero = false, um = false, dif = false;
      for (let i = 0; i < r.length; i++) {
        const e = r[i];
        if (e.dir !== 'in') continue;
        const st = estadoEm(r, i), p0 = st['analogico:P0'], p1 = st['analogico:P1'], s = saidasDe(r, i);
        if (e.v === 'botao:A' && p0 !== p1) {
          const esperado = p0 < p1 ? 0 : 1;
          if (!s.includes('numero:' + esperado)) return false;
          if (esperado === 0) zero = true; else um = true;
        }
        if (e.v === 'botao:B' && p0 !== p1 && s.includes('numero:' + (p1 - p0))) dif = true;
      }
      return zero && um && dif;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Duas plantas iguais, uma ao sol e outra à sombra. Qual tem mais sede? Vamos pôr o micro:bit a comparar!'],
      parecePronto: a => {
        const d = ses(a.evento('botao:A')).find(x => pinosComparados(x).size >= 2);
        return !!d && ramo(d, 'sim').some(p => p.tipo === 'mk_mostrar_numero') && ramo(d, 'nao').some(p => p.tipo === 'mk_mostrar_numero') &&
          !!a.evento('botao:B') && a.evento('botao:B').plano.some(p => p.tipo === 'mk_mostrar_numero' && (p.usa || []).some(u => u.tipo === 'mk_conta' && u.op === '-') &&
            new Set((p.usa || []).filter(u => u.tipo === 'mk_ler_analogico').map(u => u.pino)).size >= 2);
      },
      testar: 'Tens uma ideia? Vamos testar! Põe P0 a 100 e P1 a 700, carrega em A e em B; depois troca os valores.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Quem responde à pergunta «qual tem mais sede?»? Que botão?')),
        com('sem_se', P.regra('sem_se', a => !!a.evento('botao:A') && !ses(a.evento('botao:A')).length, [
          'Para escolher entre duas plantas, o micro:bit tem de comparar. Que bloco escolhe?',
          'Um «se … então … senão» com um «<».',
          'No A, põe «se … então … senão».',
        ], 'Já compara!')),
        com('um_pino', P.regra('um_pino_so', a => ses(a.evento('botao:A')).length > 0 && !ses(a.evento('botao:A')).some(d => pinosComparados(d).size >= 2), [
          ['surpreendida', 'Estás a comparar uma planta com ela própria! Assim dá sempre a mesma resposta.'],
          'Um lado do «<» é o vaso do pin 0, o outro é o vaso do pin 1.',
          'No «se», põe «leitura analógica pin P0 < leitura analógica pin P1» (muda a setinha de um deles).',
        ], 'Agora compara as duas!')),
        com('sem_respostas', P.regra('sem_respostas', a => ses(a.evento('botao:A')).some(d => pinosComparados(d).size >= 2) && !ses(a.evento('botao:A')).some(d => ramo(d, 'sim').some(p => p.tipo === 'mk_mostrar_numero') && ramo(d, 'nao').some(p => p.tipo === 'mk_mostrar_numero')), [
          'Já compara… mas não diz a resposta. Como é que o micro:bit te diz o número do vaso?',
          'Um «mostrar número» em cada lado do «se».',
          'No «então» mostra 0, no «senão» mostra 1.',
        ], 'Já responde!')),
        com('trocado', P.regra('resposta_trocada', a => ses(a.evento('botao:A')).some(d => pinosComparados(d).size >= 2 && ['<', '<='].includes(opDe(d)) && ramo(d, 'sim').some(p => p.tipo === 'mk_mostrar_numero' && Number(p.n) === 1)), [
          ['a_pensar', 'Se o vaso 0 tem a leitura mais pequena, qual é o que tem mais sede?'],
          'Leitura pequena = terra mais seca.',
          'No «então» (P0 menor) mostra 0; no «senão» mostra 1.',
        ], 'Resposta certa!')),
        com('sem_b', P.evento('botao:B', 'E quanto mais sede tem uma do que a outra? Que botão mostra a diferença?')),
        com('sem_diferenca', P.regra('sem_diferenca', a => !!a.evento('botao:B') && !a.evento('botao:B').plano.some(p => p.tipo === 'mk_mostrar_numero' && (p.usa || []).some(u => u.tipo === 'mk_conta')), [
          'A diferença entre dois números é que conta?',
          'Uma conta de menos: leitura P1 − leitura P0.',
          'No B: «mostrar número» com «leitura analógica P1 − leitura analógica P0».',
        ], 'Diferença à vista!')),
      ],
      sucesso: 'Comparador de plantas! Comparar duas medições ao mesmo tempo é a base de qualquer experiência científica.',
      extensao: 'Regista as duas leituras de hora a hora (registar dados p0 e p1) e faz um gráfico das duas plantas.',
      gambiarra: {
        xml: G(TOPO('mk_botao', '', seX(cmpX(AN('P1'), '&lt;', AN('P1')), numX(B_('mk_num', FD('NUM', 0))), numX(B_('mk_num', FD('NUM', 1))))),
          TOPO('mk_botao', FD('B', 'B'), numX(B_('mk_conta', FD('OP', '-') + V('A', AN('P1')) + V('B', AN('P0')))), 200)),
        pedido: 'O meu medidor diz sempre que a planta 1 tem mais sede, mesmo quando a reguei agora mesmo! Acho que copiei mal um bloco.',
      },
    },
  };

  F.registarMissao({
    id: 'natureza',
    titulo: 'Natureza',
    tema: 'Biodiversidade em Messejana',
    descricao: 'Guarda da horta, ninhos e bichos: observar, cuidar e investigar à volta da escola.',
    cor: '#2e8b57',
    xml: XML,
    niveis: [
      { nome: 'Nível 1 · Observar', desafios: [SOL_SOMBRA, BICHO_CONTADOR, DIA_NOITE, CANTO_PASSARO, NINHO, GUARDIA_HORTA,
        CADERNO, GUIA_BICHOS, DOIS_PASSAROS, TERMOMETRO_DIA, RAJADAS] },
      { nome: 'Nível 2 · Cuidar', desafios: [HORA_REGAR, ESPANTALHO, COMEDOURO, ABELHAS, GEADA, CORUJAS,
        HORTA_INTELIGENTE, ESPANTALHO_SERIO, COMEDOURO_AMANHECER, NINHO_VIGIADO, HOTEL_INSETOS] },
      { nome: 'Nível 3 · Investigar', desafios: [DIARIO, ESPECIES, ESTACAO, SOMBRA_OLIVEIRAS, RECORDE, REGA_AUTOMATICA,
        DIARIO_AUTO, CENSO_AVES, RECORDES, REGA_TEMPO, DUAS_PLANTAS] },
    ],
    // textos do projeto livre (12.º desafio de cada nível, gerado pelo motor)
    livres: [
      { titulo: 'Projeto livre: guia da horta', missao: 'Inventa um aparelho para observar a natureza da tua escola, com os blocos do nível 1.',
        passos: ['Escolhe o que queres observar: luz, calor, humidade, bichos…', 'Experimenta no micro:bit do ecrã.', 'Leva-o lá fora e mostra à turma o que descobriste.'] },
      { titulo: 'Projeto livre: guardião da horta', missao: 'Inventa um guardião que cuida de plantas ou bichos, com os blocos dos níveis 1 e 2.',
        passos: ['Ideias: abrigo que fecha à noite, alarme de calor para as galinhas, rega de vasos.', 'Experimenta no micro:bit do ecrã.', 'Monta-o com cartão e mostra à turma.'] },
      { titulo: 'Projeto livre: investigação', missao: 'Inventa uma investigação sobre a natureza da escola, com todos os blocos.',
        passos: ['Faz uma pergunta: onde há mais vida? Qual canteiro seca primeiro?', 'Junta sensores, decisões e o diário de dados.', 'Mostra os resultados à turma num cartaz.'] },
    ],
  });
})();
