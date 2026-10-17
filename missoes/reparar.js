/* Missão «Reparar» — reparação e sustentabilidade.
 *
 * Perceber um circuito para o arranjar, em vez de deitar fora. Liga ao trabalho do Buinho em
 * repairability (Repair Café, Rural Eco-Clubs, «Repairability as a social inclusion tool»).
 *   Nível 1 · Diagnosticar      — detetive, bip contínuo, condutividade, condutor/isolante, pilha, fio a fio, ficha
 *   Nível 2 · Substituir a peça — lanterna, campainha, luz de escada, candeeiro automático, servo, alarme, peluche
 *   Nível 3 · Melhorar e cuidar — contador do Repair Café, poupar energia, sobreaquecimento, registo, brinquedo, livre
 * Material real: micro:bit V2, crocodilos, LEDs, suporte de pilhas, alumínio, água/sal, servo SG90, objetos avariados.
 * Textos para qualquer mascote: {ola}, [o|a], ou { nico: '…', gabi: '…', _: '…' }.
 * As gambiarras (programas com um erro) são geradas em testes/casos/reparar.js (G) — mudar lá e copiar para aqui.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const { icones, tem, soltoCom } = F.ajudasTutor;
  const { causou } = F.verif;

  const temSinalSom = ev => tem(ev, 'mk_tom') || tem(ev, 'mk_som');
  const pinos = a => a.eventosDe('pino:');
  const digitais = ev => ev ? ev.plano.filter(p => p.tipo === 'mk_digital') : [];

  const DETETIVE =
// ---------------------------------------------------------- 1 · Detetive dos circuitos
    {
      titulo: 'Detetive dos circuitos',
      missao: 'Transforma o micro:bit num detetive: quando a eletricidade dá a volta toda, ele mostra ✔ e apita.',
      passos: [
        'Crocodilos no pin 1 e no GND: são as duas pontas do detetive.',
        'Dentro de «no pin P1 premido»: «mostrar ícone» ✔ e «tocar tom».',
        'Experimenta: toca no pin 1. Depois, envia para o micro:bit e vai à caça!',
      ],
      material: 'micro:bit, 2 crocodilos, coisas para testar',
      novos: ['mk_pino_tocado', 'mk_icone_sim', 'mk_tom'],
      teste: 'pino:P1',
      // comportamento: depois de o circuito fechar (pino), aparece o ✔ e ouve-se o sinal
      // («causou»: o sinal tem de vir do pino, não de outra entrada logo a seguir, como agitar)
      ok: r => causou(r, s => s.includes('icone:Yes') && s.some(x => x.startsWith('tom:') || x.startsWith('som:')), v => v.startsWith('pino:')),
      tutor: {
        boasVindas: ['boas_vindas', '{ola} Caso novo! Há brinquedos que não funcionam e ninguém sabe porquê. Vamos fazer um detetive de circuitos para descobrir onde a eletricidade se perde?'],
        parecePronto: a => pinos(a).some(e => icones(e, 'Yes').length > 0 && temSinalSom(e)),
        testar: 'Tens uma ideia? Vamos testar! Toca no pin 1, como se fechasses o circuito.',
        regras: [
          {
            id: 'sem_pino',
            ativa: a => pinos(a).length === 0,
            pistas: [
              ['curiosa', 'Olha lá… será que a eletricidade consegue dar a volta toda? Como é que o micro:bit vai dar por isso?'],
              ['dica', 'Quando o circuito fecha, é como se carregasses num pino. Procura o bloco cor-de-rosa que fala em pin.'],
              ['dica', 'Arrasta «no pin P1 premido» para a área cinzenta.'],
            ],
            corrigido: 'Boa! O detetive já está de orelhas no ar.',
          },
          {
            id: 'sinal_fora',
            ativa: a => pinos(a).length > 0 && !pinos(a).some(e => icones(e).length || temSinalSom(e)) &&
              (soltoCom(a, 'mk_icone') || soltoCom(a, 'mk_tom')),
            pistas: [
              ['a_pensar', 'O sinal está cá fora, sozinho. Quando é que ele vai acontecer?'],
              ['dica', 'Tudo o que fica fora do bloco cor-de-rosa nunca corre.'],
              ['dica', 'Encaixa o ícone e o tom dentro de «no pin P1 premido».'],
            ],
            corrigido: 'Agora estão no sítio certo!',
          },
          {
            id: 'sem_sinal',
            ativa: a => pinos(a).length > 0 && !pinos(a).some(e => icones(e).length || temSinalSom(e)),
            pistas: [
              ['curiosa', 'O circuito fechou… e como é que o detetive nos avisa?'],
              ['dica', 'Um detetive pode mostrar um desenho nas luzes e fazer um som.'],
              ['dica', 'Põe «mostrar ícone» com o ✔ e «tocar tom» dentro de «no pin P1 premido».'],
            ],
            corrigido: 'Isso, agora o detetive já dá sinal!',
          },
          {
            id: 'sem_icone',
            ativa: a => pinos(a).some(temSinalSom) && !pinos(a).some(e => icones(e).length > 0),
            pistas: [
              ['curiosa', 'Já se ouve o apito! Mas com o barulho da sala… e se ele também mostrasse um sinal nas luzes?'],
              ['dica', 'Há um bloco azul que desenha nas luzes. Escolhe o desenho que quer dizer «sim».'],
              ['dica', 'Põe «mostrar ícone» com o ✔ dentro de «no pin P1 premido».'],
            ],
            corrigido: 'Agora vê-se e ouve-se!',
          },
          {
            id: 'sem_visto',
            ativa: a => pinos(a).some(e => icones(e).length > 0) && !pinos(a).some(e => icones(e, 'Yes').length > 0),
            pistas: [
              ['surpreendida', 'Ui! Esse desenho quer dizer que o circuito está fechado?'],
              ['dica', 'Há um desenho que é mesmo um «sim»: um visto.'],
              ['dica', 'Na lista do ícone, escolhe o visto ✔.'],
            ],
            corrigido: 'Isso, um visto! Toda a gente percebe.',
          },
          {
            id: 'sem_som',
            ativa: a => pinos(a).some(e => icones(e, 'Yes').length > 0) && !pinos(a).some(temSinalSom),
            pistas: [
              ['a_pensar', 'Quando estás a olhar para os fios e não para o micro:bit, como sabes que o circuito fechou?'],
              ['dica', 'Um detetive que apita avisa mesmo de olhos ocupados. Procura um bloco laranja de música.'],
              ['dica', 'Põe «tocar tom» por baixo do ✔, dentro de «no pin P1 premido».'],
            ],
            corrigido: 'Agora ouve-se! Já podes olhar para os fios.',
          },
        ],
        sucesso: 'Temos detetive! Quando a eletricidade dá a volta toda, o circuito fecha e o micro:bit avisa. Agora o caso a sério: um brinquedo ou uma lanterna que não acende. Testa fio a fio: onde é que o circuito está aberto?',
        extensao: 'Testa coisas da sala e faz dois montes na mesa: as que deixam a eletricidade passar e as que não deixam. Surpresa: tu também conduzes!',
        gambiarra: {
          xml: '<xml><block type="mk_agitar" x="40" y="40"><statement name="DO"><block type="mk_icone"><field name="I">Yes</field><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">523</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">1</field></shadow></value></block></next></block></statement></block></xml>',
          pedido: 'Fiz o meu detetive… mas ele só apita quando abano a mesa! Fecho o circuito e nada. Encontras a minha gambiarra?',
        },
      },
    };

  const LANTERNA =
{
      titulo: 'Lanterna remendada',
      missao: 'O interruptor da lanterna partiu-se. Faz um novo com o micro:bit: A acende, B apaga.',
      passos: [
        'LED com crocodilos: perna comprida no pin 2, perna curta no GND.',
        'No botão A: «gravação digital pin P2 para 1». No botão B: «para 0».',
        'Experimenta: carrega em A e depois em B.',
      ],
      material: 'micro:bit, um LED (ou a lâmpada da lanterna), 2 crocodilos',
      novos: ['mk_botao', 'mk_botao_B', 'mk_digital_1', 'mk_digital_0'],
      caixa: ['mk_pino_tocado', 'mk_icone_sim', 'mk_tom'],   // a mesma caixa de antes (só o detetive antes dela)
      teste: 'botao:A',
      // comportamento: o A deixa a luz ACESA (último valor 1) e o B deixa-a APAGADA (último valor 0), no mesmo pino
      ok: r => {
        const fica = v => s => { const d = s.filter(x => x.startsWith('digital:')); return d.length > 0 && d[d.length - 1].endsWith(':' + v); };
        const pinoDe = (ent, v) => {
          let p = null;
          causou(r, s => { const d = s.filter(x => x.startsWith('digital:')); if (d.length && d[d.length - 1].endsWith(':' + v)) { p = d[d.length - 1].split(':')[1]; return true; } return false; }, x => x === ent);
          return p;
        };
        return causou(r, fica(1), v => v === 'botao:A') && causou(r, fica(0), v => v === 'botao:B') &&
          pinoDe('botao:A', 1) === pinoDe('botao:B', 0);
      },
      tutor: {
        boasVindas: ['boas_vindas', 'Esta lanterna não acende: o interruptor partiu-se. Deitar fora? Nada disso! Vamos fazer-lhe um interruptor novo.'],
        parecePronto: a => digitais(a.evento('botao:A')).some(p => p.v === 1) && digitais(a.evento('botao:B')).some(p => p.v === 0),
        testar: 'Tens uma ideia? Vamos testar! Carrega em A e depois em B.',
        regras: [
          {
            id: 'sem_botoes',
            ativa: a => !a.evento('botao:A') && !a.evento('botao:B'),
            pistas: [
              ['curiosa', 'Um interruptor tem duas posições: ligado e desligado. O que é que no micro:bit pode fazer de interruptor?'],
              ['dica', 'Os botões A e B! Procura o bloco cor-de-rosa «no botão premido».'],
              ['dica', 'Arrasta dois «no botão premido»: um com A e outro com B.'],
            ],
            corrigido: 'Boa, já tens botões à escuta!',
          },
          {
            id: 'trocados',
            ativa: a => digitais(a.evento('botao:A')).some(p => p.v === 0) && digitais(a.evento('botao:B')).some(p => p.v === 1) &&
              !digitais(a.evento('botao:A')).some(p => p.v === 1),
            pistas: [
              ['surpreendida', 'Ui! Então o A apaga e o B acende? A missão pede ao contrário.'],
              ['dica', '«para 1» quer dizer ligado; «para 0» quer dizer desligado.'],
              ['dica', 'Põe o «para 1» no botão A e o «para 0» no botão B.'],
            ],
            corrigido: 'Agora sim, A acende e B apaga!',
          },
          {
            id: 'so_um_botao',
            ativa: a => !a.evento('botao:A') || !a.evento('botao:B'),
            pistas: [
              ['a_pensar', 'Um botão para acender… e para apagar, como fazes?'],
              ['dica', 'Precisas de dois blocos «no botão premido». No segundo, muda a letra.'],
              ['dica', 'Junta outro «no botão premido» e escolhe a letra que falta (A ou B).'],
            ],
            corrigido: 'Dois botões, um interruptor completo!',
          },
          {
            id: 'sinal_fora',
            ativa: a => !digitais(a.evento('botao:A')).length && !digitais(a.evento('botao:B')).length && soltoCom(a, 'mk_digital'),
            pistas: [
              ['a_pensar', 'Os blocos da luz estão cá fora. Quando é que eles vão correr?'],
              ['dica', 'Tudo o que fica fora de um bloco cor-de-rosa nunca corre.'],
              ['dica', 'Encaixa «para 1» dentro do botão A e «para 0» dentro do botão B.'],
            ],
            corrigido: 'Agora estão no sítio certo!',
          },
          {
            id: 'sem_acender',
            ativa: a => !digitais(a.evento('botao:A')).some(p => p.v === 1),
            pistas: [
              ['curiosa', 'Carregas no A… e a luz? Quem é que lhe manda acender?'],
              ['dica', 'Há um bloco vermelho-escuro que liga ou desliga um pino: «gravação digital».'],
              ['dica', 'Põe «gravação digital pin P2 para 1» dentro do botão A.'],
            ],
            corrigido: 'Luz! O A já acende.',
          },
          {
            id: 'a_pisca',
            ativa: a => { const d = digitais(a.evento('botao:A')); return d.length > 0 && d[d.length - 1].v === 0; },
            pistas: [
              ['a_pensar', 'O A acende… e logo a seguir apaga. Lê os blocos do A de cima para baixo.'],
              ['dica', 'No botão A, o último bloco de luz tem de deixar a luz ligada.'],
              ['dica', 'Tira o «para 0» do botão A: esse fica para o B.'],
            ],
            corrigido: 'Agora a luz fica acesa!',
          },
          {
            id: 'sem_apagar',
            ativa: a => !digitais(a.evento('botao:B')).some(p => p.v === 0),
            pistas: [
              ['curiosa', 'A luz acende. E agora, como é que se poupa a pilha?'],
              ['dica', 'O botão B também precisa de um «gravação digital», mas com outro número.'],
              ['dica', 'Põe «gravação digital pin P2 para 0» dentro do botão B.'],
            ],
            corrigido: 'Isso, o B já apaga!',
          },
          {
            id: 'pinos_diferentes',
            ativa: a => {
              const pa = digitais(a.evento('botao:A')).filter(p => p.v === 1).map(p => p.pino);
              const pb = digitais(a.evento('botao:B')).filter(p => p.v === 0).map(p => p.pino);
              return pa.length && pb.length && !pa.some(p => pb.includes(p));
            },
            pistas: [
              ['surpreendida', 'Acendes num pino e apagas noutro? A luz está ligada a qual?'],
              ['dica', 'O LED está no pin 2: os dois botões têm de mexer no mesmo pino.'],
              ['dica', 'Escolhe P2 nos dois blocos «gravação digital».'],
            ],
            corrigido: 'Mesmo pino, interruptor a sério!',
          },
        ],
        sucesso: 'Lanterna remendada! Em vez de deitar fora, percebeste o circuito e arranjaste outra maneira de o ligar. Isto é reparar.',
        extensao: 'E se a lanterna fizesse SOS quando carregas em A+B? Três piscas curtos, três longos, três curtos.',
        gambiarra: {
          xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement></block><block type="mk_botao" x="40" y="200"><field name="B">B</field><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement></block></xml>',
          pedido: 'Remendei a minha lanterna… mas agora ela nunca apaga! Carrego no B e nada. Onde está a gambiarra?',
        },
      },
    };


  // ============================================================ ajudas desta missão
  const { blocos, dentro } = F.ajudasTutor;
  const { aposSensor, houve, numeros } = F.verif;
  const P = F.pistas;
  const ev1 = (a, chave) => a.evento(chave);
  const ses = ev => ev ? ev.plano.filter(p => p.tipo === 'mk_se' || p.tipo === 'mk_se_entao') : [];
  const usa = (p, tipo) => (p.usa || []).some(u => u.tipo === tipo);
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
  // por cada vez que a entrada aconteceu: o estado do sensor nesse momento e as saídas até à entrada seguinte
  function porEstado(reg, sensor, entradaOk) {
    const out = [];
    let estado;
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
  const temTom = s => s.some(x => x.startsWith('tom:') || x.startsWith('som:'));
  const temIcone = s => s.some(x => x.startsWith('icone:'));
  // depois da entrada: liga (…:1) e só desliga (…:0) passado pelo menos minMs
  function acendeEApaga(reg, entrada, minMs) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== entrada) continue;
      let t1 = null;
      for (let j = i + 1; j < reg.length && reg[j].dir === 'out'; j++) {
        const v = reg[j].v;
        if (/^digital:P\d:1$/.test(v) && t1 === null) t1 = reg[j].t;
        else if (/^digital:P\d:0$/.test(v) && t1 !== null) return reg[j].t - t1 >= minMs;
      }
    }
    return false;
  }
  const regraSempre = pergunta => P.evento('sempre', pergunta, 'Boa, agora repete sem parar!');
  const regraSemSe = (chave, pergunta) => P.regra('sem_se', a => !!ev1(a, chave) && ses(ev1(a, chave)).length === 0, [
    pergunta, 'Há um bloco verde-azulado que só faz uma coisa quando é verdade: «se … então».', 'Põe um «se … então» dentro de «' + P.nomeEvento(chave) + '».'], 'Isso! Agora o micro:bit decide.');

  // ============================================================ Nível 1 · Diagnosticar
  const BIP = {
    titulo: 'Bip contínuo',
    missao: 'Um testador que apita sem parar enquanto o circuito está fechado.',
    passos: ['Crocodilo no pin 0 e outro no 3V: são as pontas do testador.', '«para sempre»: se a leitura digital do pin 0 = 1, toca um tom.', 'Experimenta: no ecrã, fecha e abre o pin 0.'],
    material: 'micro:bit, 2 crocodilos, fios e peças para testar',
    novos: ['mk_sempre', 'mk_se_entao', 'mk_comparar', 'mk_ler_digital', 'mk_tom'],
    caixa: [],
    teste: 'digital:P0',
    // fechado (1) → apita; aberto (0) → silêncio
    ok: r => aposSensor(r, 'digital:P0', v => v === 1, temTom) && aposSensor(r, 'digital:P0', v => v === 0, s => !temTom(s)),
    tutor: {
      boasVindas: ['boas_vindas', 'O detetive só apita uma vez. Para seguir um fio comprido dava jeito um testador que apita enquanto o circuito estiver fechado!'],
      parecePronto: a => ses(ev1(a, 'sempre')).some(p => verdade(p, 'mk_ler_digital', 1) === true && verdade(p, 'mk_ler_digital', 0) === false) && tem(ev1(a, 'sempre'), 'mk_tom'),
      testar: 'Tens uma ideia? Vamos testar! Fecha o pin 0 no ecrã e depois abre-o.',
      regras: [
        regraSempre('O testador tem de estar sempre a vigiar o circuito. Que bloco repete sem parar?'),
        regraSemSe('sempre', 'Apitar sempre não serve para nada… como é que o micro:bit escolhe quando apitar?'),
        P.regra('sem_leitura', a => ses(ev1(a, 'sempre')).length > 0 && !ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_ler_digital')), [
          'Como é que o micro:bit sabe se o circuito está fechado?',
          'Há um bloco vermelho-escuro que lê um pino: dá 1 se está fechado e 0 se está aberto.',
          'Põe «leitura digital pin P0 = 1» no buraco do «se».'], 'Agora ele lê o circuito!'),
        P.bloco('sempre', 'mk_tom', 'O micro:bit já sabe quando o circuito fecha. E como é que te avisa?'),
        P.regra('invertido', a => ses(ev1(a, 'sempre')).some(p => verdade(p, 'mk_ler_digital', 0) === true && verdade(p, 'mk_ler_digital', 1) === false), [
          ['surpreendida', 'Ui! Apita quando o circuito está aberto?'],
          '1 quer dizer fechado, 0 quer dizer aberto.',
          'Muda o número da comparação para 1.'], 'Agora apita no sítio certo!'),
      ],
      sucesso: 'Bip contínuo! Agora podes passar as pontas ao longo de um fio e ouvir onde a eletricidade deixa de passar.',
      extensao: 'E se, quando o circuito está aberto, aparecesse um ✗ no ecrã?',
      gambiarra: { xml: "<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_ler_digital\"><field name=\"P\">P0</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">523</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></statement></block></statement></block></xml>", pedido: 'O meu testador apita quando o fio está partido e cala-se quando está bom! Ajudas-me a descobrir porquê?' },
    },
  };

  const CONDUTIVIDADE = {
    titulo: 'Medidor de condutividade',
    missao: 'Mede quanta eletricidade passa e mostra-o num gráfico de barras.',
    passos: ['Crocodilo no pin 1 e outro no 3V; mete as pontas na água, depois em água com sal.', '«para sempre»: desenhar gráfico de barras da leitura analógica do pin 1 até 1023.', 'Experimenta: mexe no pin 1 (analógico) no ecrã.'],
    material: 'micro:bit, 2 crocodilos, 2 copos de água, sal, um lápis afiado nas duas pontas',
    novos: ['mk_ler_analogico', 'mk_grafico'],
    caixa: ['mk_sempre', 'mk_mostrar_numero'],
    teste: 'analogico:P1',
    ok: r => aposSensor(r, 'analogico:P1', v => v >= 900, s => s.some(x => /^grafico:(2[0-5])$/.test(x))) &&
      aposSensor(r, 'analogico:P1', v => v <= 400, s => s.some(x => /^grafico:([0-9]|1[0-2])$/.test(x))),
    tutor: {
      boasVindas: ['boas_vindas', 'Nem tudo deixa passar a eletricidade da mesma maneira. Água, água com sal, um lápis… Vamos medir quanto passa!'],
      parecePronto: a => blocos(ev1(a, 'sempre'), 'mk_grafico').some(p => p.max === 1023) && dentro(ev1(a, 'sempre'), 'mk_grafico', 'mk_ler_analogico'),
      testar: 'Tens uma ideia? Vamos testar! Sobe e desce o pin 1 (analógico) no ecrã.',
      regras: [
        regraSempre('A medida muda a toda a hora. Como é que o gráfico se mantém atualizado?'),
        P.bloco('sempre', 'mk_grafico', 'Um número sozinho é difícil de comparar. Que tal desenhar barras?'),
        P.valorEm('sempre', 'mk_grafico', 'mk_ler_analogico', 'O gráfico desenha o quê? Quem é que mede a eletricidade que passa?'),
        P.regra('maximo_errado', a => blocos(ev1(a, 'sempre'), 'mk_grafico').some(p => p.max !== 1023) && dentro(ev1(a, 'sempre'), 'mk_grafico', 'mk_ler_analogico'), [
          'O gráfico fica sempre cheio… até onde vai a leitura analógica?',
          'A leitura analógica vai de 0 a 1023.',
          'No gráfico, muda o «até» para 1023.'], 'Agora as barras sobem e descem!'),
      ],
      sucesso: 'Com sal passa muito mais eletricidade! Os metais e a água salgada são bons condutores; o plástico quase não deixa passar nada.',
      extensao: 'Experimenta com sumo de limão, com terra molhada e com terra seca. Qual conduz melhor?',
      gambiarra: { xml: "<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_grafico\"><value name=\"V\"><block type=\"mk_ler_analogico\"><field name=\"P\">P1</field></block></value><value name=\"MAX\"><shadow type=\"mk_num\"><field name=\"NUM\">255</field></shadow></value></block></statement></block></xml>", pedido: 'O meu medidor está sempre no máximo, com água ou sem água! Que gambiarra fiz?' },
    },
  };

  const CONDUTOR = {
    titulo: 'Condutor ou isolante?',
    missao: 'Carrega no A para testar um objeto: ✔ se a eletricidade passa, ✗ se não passa.',
    passos: ['Pontas no pin 0 e no 3V; encosta-as a um objeto.', 'No botão A: se a leitura digital do pin 0 = 1, mostra ✔, senão mostra ✗.', 'Experimenta: fecha o pin 0 e carrega em A; abre-o e carrega outra vez.'],
    material: 'micro:bit, 2 crocodilos, colher, borracha, papel de alumínio, lápis, moeda',
    novos: ['mk_se_senao', 'mk_icone_nao'],
    caixa: ['mk_botao', 'mk_comparar', 'mk_ler_digital', 'mk_icone_sim'],
    teste: 'botao:A',
    ok: r => {
      const t = porEstado(r, 'digital:P0', v => v === 'botao:A');
      return t.some(e => e.estado === 1 && e.saidas.includes('icone:Yes')) && t.some(e => e.estado === 0 && e.saidas.includes('icone:No')) &&
        !t.some(e => (e.estado === 1 && e.saidas.includes('icone:No')) || (e.estado === 0 && e.saidas.includes('icone:Yes')));
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Vamos separar as coisas em dois montes: as que deixam passar a eletricidade e as que não deixam.'],
      parecePronto: a => ses(ev1(a, 'botao:A')).some(p => p.tipo === 'mk_se' && usa(p, 'mk_ler_digital')) && blocos(ev1(a, 'botao:A'), 'mk_icone').some(p => p.icone === 'No') && blocos(ev1(a, 'botao:A'), 'mk_icone').some(p => p.icone === 'Yes'),
      testar: 'Tens uma ideia? Vamos testar! Fecha o pin 0, carrega em A; abre, carrega outra vez.',
      regras: [
        P.evento('botao:A', 'Quando é que o micro:bit faz o teste?'),
        regraSemSe('botao:A', 'O resultado depende do objeto… como é que o micro:bit escolhe entre ✔ e ✗?'),
        P.regra('sem_leitura', a => ses(ev1(a, 'botao:A')).length > 0 && !ses(ev1(a, 'botao:A')).some(p => usa(p, 'mk_ler_digital')), [
          'O «se» pergunta o quê? Quem é que sabe se a eletricidade passa?',
          'A «leitura digital pin P0» dá 1 quando passa e 0 quando não passa.',
          'Põe «leitura digital pin P0 = 1» no buraco do «se».'], 'Agora pergunta ao circuito!'),
        P.regra('trocados', a => ses(ev1(a, 'botao:A')).some(p => {
          if (p.tipo !== 'mk_se') return false;
          const v1 = verdade(p, 'mk_ler_digital', 1);
          if (v1 === null) return false;
          const ramo = v1 ? p.sim : p.nao;
          return (ramo || []).some(x => x.icone === 'No');
        }), [['surpreendida', 'Ui! Passa eletricidade e aparece ✗?'], 'Lê o «se» em voz alta: «se passa… então…».', 'Troca os desenhos: ✔ em cima, ✗ em baixo.'], 'Agora sim!'),
        P.regra('falta_nao', a => !!ev1(a, 'botao:A') && !blocos(ev1(a, 'botao:A'), 'mk_icone').some(p => p.icone === 'No'), [
          'E quando a eletricidade não passa, o que aparece?',
          'O «senão» é para quando a resposta é não.',
          'Põe «mostrar ícone» ✗ dentro do «senão».'], 'Agora há resposta para os dois casos!'),
      ],
      sucesso: 'Já sabes separar condutores de isolantes! Os fios têm metal por dentro (condutor) e plástico por fora (isolante) — por isso não apanhas choque.',
      extensao: 'Faz uma tabela com 10 objetos da sala. Há algum que te tenha surpreendido?',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_ler_digital\"><field name=\"P\">P0</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_icone\"><field name=\"I\">No</field></block></statement><statement name=\"NAO\"><block type=\"mk_icone\"><field name=\"I\">Yes</field></block></statement></block></statement></block></xml>", pedido: 'O meu testador diz que a colher não deixa passar eletricidade e que a borracha deixa! Encontras a gambiarra?' },
    },
  };

  const PILHA = {
    titulo: 'Pilha cansada',
    missao: 'Mede uma pilha e mostra o número: uma pilha boa dá mais, uma cansada dá menos.',
    passos: ['Só pilhas pequenas (até 2 de 1,5 V)! O + no pin 1, o − no GND.', 'No botão A: mostrar número da leitura analógica do pin 1.', 'Experimenta: muda o pin 1 (analógico) no ecrã e carrega em A.'],
    material: 'micro:bit, 2 crocodilos, suporte com 1 ou 2 pilhas AA (novas e gastas)',
    novos: ['mk_mostrar_numero'],
    caixa: ['mk_botao', 'mk_ler_analogico', 'mk_icone_triste', 'mk_icone'],
    teste: 'botao:A',
    ok: r => {
      const t = porEstado(r, 'analogico:P1', v => v === 'botao:A').filter(e => e.estado !== undefined && e.saidas.includes('numero:' + e.estado));
      return new Set(t.map(e => e.estado)).size >= 2;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Muitas vezes o brinquedo não está avariado: é só a pilha que está cansada. Vamos fazer um medidor de pilhas!'],
      parecePronto: a => dentro(ev1(a, 'botao:A'), 'mk_mostrar_numero', 'mk_ler_analogico') && blocos(ev1(a, 'botao:A'), 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_ler_analogico' && u.pino === 'P1')),
      testar: 'Tens uma ideia? Vamos testar! Muda o pin 1 e carrega em A.',
      regras: [
        P.evento('botao:A', 'Quando é que o micro:bit mede a pilha?'),
        P.bloco('botao:A', 'mk_mostrar_numero', 'Queremos ver quanto vale a pilha. Como é que o micro:bit mostra um número?'),
        P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_ler_analogico', 'O número tem de vir da pilha. Quem é que mede quanta eletricidade chega ao pino?'),
        P.regra('pino_errado', a => blocos(ev1(a, 'botao:A'), 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_ler_analogico' && u.pino !== 'P1')), [
          'A pilha está ligada a que pino?', 'O + da pilha está no pin 1.', 'Na leitura analógica, escolhe P1.'], 'Pino certo!'),
      ],
      sucesso: 'Medidor feito! Uma pilha nova dá perto de 900; se der menos de 600 já está cansada. Recarregável ou pilhão, nunca no lixo!',
      extensao: 'Junta um «se»: se o número for menor que 600, mostra a cara triste.',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_ler_analogico\"><field name=\"P\">P0</field></block></value></block></statement></block></xml>", pedido: 'O meu medidor diz sempre 0, mesmo com pilhas novas! O que é que eu liguei mal no programa?' },
    },
  };

  const FIOS = {
    titulo: 'Fio a fio',
    missao: 'Conta os troços de fio que já testaste: cada toque no pin 1 soma um.',
    passos: ['Divide o fio avariado em troços e testa um de cada vez.', 'No pin 1: muda contador em 1 e mostra o número do contador.', 'Experimenta: toca 3 vezes no pin 1.'],
    material: 'micro:bit, crocodilos, um cabo ou fio com uma parte partida',
    novos: ['mk_var_mudar', 'mk_var'],
    caixa: ['mk_pino_tocado', 'mk_mostrar_numero', 'mk_iniciar', 'mk_var_definir'],
    teste: 'pino:P1',
    ok: r => { const n = numeros(r).join(','); return /(^|,)1,2,3(,|$)/.test(n); },
    tutor: {
      boasVindas: ['boas_vindas', 'Um bom detetive não se perde: conta os troços que já testou. Vamos usar uma variável para contar!'],
      parecePronto: a => P.evs(a, 'pino:').some(e => {
        const i = e.plano.findIndex(p => p.tipo === 'mk_var_mudar'), j = e.plano.findIndex(p => p.tipo === 'mk_mostrar_numero' && (p.usa || []).some(u => u.tipo === 'mk_var'));
        return i >= 0 && j > i;
      }),
      testar: 'Tens uma ideia? Vamos testar! Toca no pin 1 três vezes.',
      regras: [
        P.evento('pino:', 'Cada teste é um toque nas pontas. Que bloco fica à escuta desse toque?'),
        P.bloco('pino:', 'mk_var_mudar', 'Para contar, o número tem de crescer a cada toque. Como é que se soma 1?'),
        P.bloco('pino:', 'mk_mostrar_numero', 'O micro:bit já conta… mas como é que tu vês a conta?'),
        P.valorEm('pino:', 'mk_mostrar_numero', 'mk_var', 'O número que aparece é sempre o mesmo? Onde é que está guardada a conta?'),
        P.regra('ordem', a => P.evs(a, 'pino:').some(e => {
          const i = e.plano.findIndex(p => p.tipo === 'mk_var_mudar'), j = e.plano.findIndex(p => p.tipo === 'mk_mostrar_numero');
          return i >= 0 && j >= 0 && j < i;
        }), ['O número aparece sempre atrasado… o que acontece primeiro?', 'Os blocos correm de cima para baixo.', 'Põe o «mudar contador» por cima do «mostrar número».'], 'Agora a conta está em dia!'),
      ],
      sucesso: 'Conta certa! Testar troço a troço e tomar nota é o método dos reparadores: nunca testas o mesmo duas vezes.',
      extensao: 'E se o botão B pusesse o contador outra vez a 0, para começar outro fio?',
      gambiarra: { xml: "<xml><block type=\"mk_pino_tocado\" x=\"40\" y=\"160\"><field name=\"P\">P1</field><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value><next><block type=\"mk_var_mudar\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></next></block></statement></block></xml>", pedido: 'O meu contador anda sempre um atrás! Toquei 3 vezes e diz 2. Que gambiarra é esta?' },
    },
  };

  const FICHA = {
    titulo: 'Ficha de diagnóstico',
    missao: 'Guarda o resultado de cada teste numa tabela: 1 se passa, 0 se não passa.',
    passos: ['Pontas no pin 0 e no 3V.', 'No botão A: registar dados «fio» = leitura digital do pin 0.', 'Experimenta: fecha o pin 0 e carrega em A, abre e carrega outra vez.'],
    material: 'micro:bit V2, 2 crocodilos, peças para testar',
    novos: ['mk_registar'],
    caixa: ['mk_botao', 'mk_ler_digital', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => {
      const t = porEstado(r, 'digital:P0', v => v === 'botao:A');
      const certo = e => e.saidas.some(x => /^registo:[^:]*:/.test(x) && x.endsWith(':' + e.estado));
      return t.some(e => e.estado === 1 && certo(e)) && t.some(e => e.estado === 0 && certo(e));
    },
    tutor: {
      boasVindas: ['boas_vindas', 'No Repair Café cada objeto tem uma ficha. O micro:bit V2 pode guardar uma tabela com os teus testes!'],
      parecePronto: a => dentro(ev1(a, 'botao:A'), 'mk_registar', 'mk_ler_digital'),
      testar: 'Tens uma ideia? Vamos testar! Fecha o pin 0, carrega em A; abre, carrega outra vez.',
      regras: [
        P.evento('botao:A', 'Quando é que o micro:bit guarda um resultado?'),
        P.bloco('botao:A', 'mk_registar', 'Mostrar o número é bom, mas desaparece. Como é que o micro:bit guarda para mais tarde?'),
        P.valorEm('botao:A', 'mk_registar', 'mk_ler_digital', 'O que fica na tabela tem de vir do teste. Quem é que sabe se passa ou não passa?'),
      ],
      sucesso: 'Ficha guardada! Liga o micro:bit ao computador e abre o ficheiro MY_DATA na pasta MICROBIT: lá está a tua tabela.',
      extensao: 'Regista também o número do troço (com a variável contador) para saberes onde está o fio partido.',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_registar\"><value name=\"NOME\"><shadow type=\"mk_texto\"><field name=\"TXT\">fio</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block></xml>", pedido: 'A minha ficha diz sempre 1, mesmo quando o fio está partido! Ajudas-me?' },
    },
  };

  // ============================================================ Nível 2 · Substituir a peça
  const CAMPAINHA = {
    titulo: 'Campainha nova',
    missao: 'O botão da campainha partiu-se: faz um novo com papel de alumínio que toca e mostra um sinal.',
    passos: ['Dois quadrados de alumínio: um no pin 1, outro no GND. Carregar = juntar os dois.', 'No pin 1: tocar som e mostrar um ícone (para quem não ouve bem).', 'Experimenta: toca no pin 1.'],
    material: 'micro:bit, 2 crocodilos, papel de alumínio, cartão, esponja',
    novos: ['mk_som'],
    caixa: ['mk_pino_tocado', 'mk_icone', 'mk_tom'],
    teste: 'pino:P1',
    ok: r => F.verif.causou(r, s => temTom(s) && temIcone(s), v => v.startsWith('pino:')),
    tutor: {
      boasVindas: ['boas_vindas', 'Esta campainha tinha o botão partido. Em vez de comprar outra, vamos fazer um botão novo com alumínio!'],
      parecePronto: a => P.evs(a, 'pino:').some(e => (tem(e, 'mk_som') || tem(e, 'mk_tom')) && tem(e, 'mk_icone')),
      testar: 'Tens uma ideia? Vamos testar! Toca no pin 1.',
      regras: [
        P.evento('pino:', 'O botão novo é feito de alumínio ligado ao pin 1. Que bloco fica à escuta desse pino?'),
        P.regra('sem_som', a => P.evs(a, 'pino:').length > 0 && !P.evs(a, 'pino:').some(e => tem(e, 'mk_som') || tem(e, 'mk_tom')), [
          'Uma campainha que não toca… o que lhe falta?', 'Há blocos laranja de música.', 'Põe «tocar som» dentro de «no pin P1 premido».'], 'Ding-dong!'),
        P.bloco('pino:', 'mk_icone', 'E quem não ouve bem? Como é que também vê que alguém tocou?'),
      ],
      sucesso: 'Campainha reparada — e ainda ficou melhor: agora também avisa com luzes! Reparar também é melhorar.',
      extensao: 'E se a campainha tocasse um som diferente quando o botão é carregado duas vezes seguidas?',
      gambiarra: { xml: "<xml><block type=\"mk_logo\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_som\"><value name=\"S\"><shadow type=\"mk_som_menu\"><field name=\"V\">hello</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">Surprised</field></block></next></block></statement></block></xml>", pedido: 'Montei a minha campainha… mas ela só toca quando mexo no logotipo! Que gambiarra é esta?' },
    },
  };

  const ESCADA = {
    titulo: 'Luz de escada',
    missao: 'Como a luz da escada de um prédio: carregas no A, acende e apaga sozinha passados 2 segundos.',
    passos: ['LED: perna comprida no pin 2, perna curta no GND.', 'No botão A: pin P2 para 1, pausa 2000, pin P2 para 0.', 'Experimenta: carrega em A e espera.'],
    material: 'micro:bit, LED, 2 crocodilos',
    novos: ['mk_pausa'],
    caixa: ['mk_botao', 'mk_digital_1', 'mk_digital_0'],
    teste: 'botao:A',
    ok: r => acendeEApaga(r, 'botao:A', 1500),
    tutor: {
      boasVindas: ['boas_vindas', 'A luz da escada estava sempre acesa e gastava muita energia. Vamos fazer um interruptor com temporizador!'],
      parecePronto: a => {
        const p = (ev1(a, 'botao:A') || { plano: [] }).plano;
        const i1 = p.findIndex(x => x.tipo === 'mk_digital' && x.v === 1), i0 = p.findIndex((x, k) => k > i1 && x.tipo === 'mk_digital' && x.v === 0);
        return i1 >= 0 && i0 > i1 && p.some((x, k) => k > i1 && k < i0 && x.tipo === 'mk_pausa' && x.ms >= 1000);
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega em A e conta até 2.',
      regras: [
        P.evento('botao:A', 'Quem carrega no interruptor? Que bloco fica à escuta?'),
        P.regra('sem_acender', a => !blocos(ev1(a, 'botao:A'), 'mk_digital').some(p => p.v === 1), [
          'Carregas no A… e quem manda a luz acender?', 'O bloco vermelho-escuro «gravação digital» liga um pino.', 'Põe «gravação digital pin P2 para 1» no botão A.'], 'Luz!'),
        P.regra('sem_apagar', a => { const p = blocos(ev1(a, 'botao:A'), 'mk_digital'); const i = p.findIndex(x => x.v === 1); return !p.some((x, k) => k > i && x.v === 0); }, [
          'A luz acende… e fica acesa para sempre. O que falta no fim?', 'Depois de acender, é preciso desligar o pino.', 'Põe «gravação digital pin P2 para 0» no fim.'], 'Agora apaga!'),
        P.regra('sem_pausa', a => { const p = (ev1(a, 'botao:A') || { plano: [] }).plano; const i1 = p.findIndex(x => x.tipo === 'mk_digital' && x.v === 1); const i0 = p.findIndex((x, k) => k > i1 && x.tipo === 'mk_digital' && x.v === 0); return i1 >= 0 && i0 > i1 && !p.some((x, k) => k > i1 && k < i0 && x.tipo === 'mk_pausa'); }, [
          'Acende e apaga tão depressa que nem se vê! O que falta entre os dois?', 'Há um bloco azul para esperar.', 'Põe «pausa (ms)» entre o acender e o apagar.'], 'Agora dá tempo de subir a escada!'),
        P.regra('pausa_curta', a => { const p = (ev1(a, 'botao:A') || { plano: [] }).plano; return p.some(x => x.tipo === 'mk_pausa' && x.ms < 1000); }, [
          'Dá tempo de subir a escada?', '1000 ms são 1 segundo.', 'Escolhe 2000 na pausa.'], 'Tempo certo!'),
      ],
      sucesso: 'Luz de escada a funcionar! Assim a luz nunca fica esquecida acesa: poupa energia e pilhas.',
      extensao: 'E se o LED piscasse no último meio segundo, para avisar que vai apagar?',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></next></block></statement></block></xml>", pedido: 'A minha luz de escada nem chega a acender… ou acende e apaga num piscar de olhos? Ajudas-me?' },
    },
  };

  const CANDEEIRO = {
    titulo: 'Candeeiro automático',
    missao: 'O interruptor do candeeiro avariou: agora é a luz da sala que manda — escuro acende, claro apaga.',
    passos: ['LED: perna comprida no pin 2, perna curta no GND.', '«para sempre»: se está escuro, pin P2 para 1; senão, pin P2 para 0.', 'Experimenta: baixa e sobe a luz no ecrã.'],
    material: 'micro:bit, LED, 2 crocodilos (o ecrã do micro:bit mede a luz)',
    novos: ['mk_se'],
    caixa: ['mk_sempre', 'mk_digital_1', 'mk_digital_0'],
    teste: 'luz',
    ok: r => aposSensor(r, 'luz', v => v < 40, s => s.some(x => /^digital:P\d:1$/.test(x))) && aposSensor(r, 'luz', v => v >= 40, s => s.some(x => /^digital:P\d:0$/.test(x))) &&
      !aposSensor(r, 'luz', v => v < 40, s => s.some(x => /^digital:P\d:0$/.test(x))),
    tutor: {
      boasVindas: ['boas_vindas', 'Este candeeiro tinha o interruptor partido. E se ele acendesse sozinho quando fica escuro?'],
      parecePronto: a => ses(ev1(a, 'sempre')).some(p => p.tipo === 'mk_se' && usa(p, 'mk_escuro') && (p.sim || []).some(x => x.v === 1) && (p.nao || []).some(x => x.v === 0)),
      testar: 'Tens uma ideia? Vamos testar! Baixa a luz no ecrã até ao fim e depois sobe-a.',
      regras: [
        regraSempre('A luz da sala muda devagarinho. Como é que o candeeiro está sempre a vigiar?'),
        regraSemSe('sempre', 'O candeeiro tem de decidir: acender ou apagar? Que bloco decide?'),
        P.regra('trocados', a => ses(ev1(a, 'sempre')).some(p => p.tipo === 'mk_se' && (p.sim || []).some(x => x.v === 0) && (p.nao || []).some(x => x.v === 1)), [
          ['surpreendida', 'Ui! Acende de dia e apaga de noite?'], 'Lê em voz alta: «se está escuro, então…».', 'Troca: «para 1» em cima, «para 0» no «senão».'], 'Agora está certo!'),
        P.regra('sem_acender', a => ses(ev1(a, 'sempre')).some(p => p.tipo === 'mk_se') && !ses(ev1(a, 'sempre')).some(p => (p.sim || []).some(x => x.tipo === 'mk_digital' && x.v === 1)), [
          'Quando está escuro, o que deve acontecer à luz?', 'A parte de cima do «se» é para quando está escuro.', 'Põe «gravação digital pin P2 para 1» na parte de cima.'], 'Acende no escuro!'),
        P.regra('sem_apagar', a => ses(ev1(a, 'sempre')).some(p => p.tipo === 'mk_se') && !ses(ev1(a, 'sempre')).some(p => (p.nao || []).some(x => x.tipo === 'mk_digital' && x.v === 0)), [
          'E quando volta a ficar claro? A luz fica acesa a gastar?', 'O «senão» é para quando não está escuro.', 'Põe «gravação digital pin P2 para 0» no «senão».'], 'Agora poupa energia!'),
      ],
      sucesso: 'Candeeiro automático! Trocaste um interruptor partido por um sensor. As luzes das ruas funcionam assim.',
      extensao: 'Em vez de «está escuro», usa «nível de luz < 80» e descobre qual é o melhor número para a tua sala.',
      gambiarra: { xml: "<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_escuro\"></block></value><statement name=\"SIM\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></statement><statement name=\"NAO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block></statement></block></xml>", pedido: 'O meu candeeiro acende de dia e apaga de noite! Que gambiarra fiz?' },
    },
  };

  const SERVO = {
    titulo: 'Motor novo',
    missao: 'O motor da cancela do brinquedo avariou: põe um servo — A abre (180°), B fecha (0°).',
    passos: ['Servo: fio castanho no GND, vermelho no 3V, laranja no pin 0.', 'No A: escrever servo pin P0 para 180. No B: para 0.', 'Experimenta: A e depois B.'],
    material: 'micro:bit, servo SG90, 3 crocodilos, cartão e palitos para a cancela',
    novos: ['mk_servo'],
    caixa: ['mk_botao', 'mk_botao_B'],
    teste: 'botao:A',
    ok: r => {
      let pa = null, pb = null;
      F.verif.causou(r, s => s.some(x => { const m = x.match(/^servo:(P\d):(\d+)$/); if (m && Number(m[2]) >= 150) { pa = m[1]; return true; } return false; }), v => v === 'botao:A');
      F.verif.causou(r, s => s.some(x => { const m = x.match(/^servo:(P\d):(\d+)$/); if (m && Number(m[2]) <= 30) { pb = m[1]; return true; } return false; }), v => v === 'botao:B');
      return pa !== null && pa === pb;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'A cancela deste brinquedo já não levanta: o motor queimou. Vamos dar-lhe um servo, um motor que sabe para onde rodar!'],
      parecePronto: a => blocos(ev1(a, 'botao:A'), 'mk_servo').some(p => p.angulo >= 150) && blocos(ev1(a, 'botao:B'), 'mk_servo').some(p => p.angulo <= 30),
      testar: 'Tens uma ideia? Vamos testar! Carrega em A e depois em B.',
      regras: [
        P.regra('sem_botoes', a => !ev1(a, 'botao:A') && !ev1(a, 'botao:B'), [
          'Abrir e fechar são duas ordens. O que é que no micro:bit pode dar duas ordens?', 'Os botões A e B!', 'Arrasta «no botão A premido» e «no botão B premido».'], 'Botões prontos!'),
        P.regra('so_um_botao', a => !ev1(a, 'botao:A') || !ev1(a, 'botao:B'), [
          'Abre… e para fechar?', 'Precisas dos dois botões.', 'Junta o «no botão premido» que falta (A ou B).'], 'Dois botões!'),
        P.bloco('botao:A', 'mk_servo', 'Carregas no A… quem é que roda a cancela?'),
        P.bloco('botao:B', 'mk_servo', 'E no B? A cancela também tem de voltar.'),
        P.regra('angulos_iguais', a => { const x = blocos(ev1(a, 'botao:A'), 'mk_servo')[0], y = blocos(ev1(a, 'botao:B'), 'mk_servo')[0]; return !!x && !!y && x.angulo === y.angulo; }, [
          ['surpreendida', 'A e B mandam o servo para o mesmo sítio?'], 'O ângulo diz para onde roda: 0 é um lado, 180 é o outro.', 'Põe 180 no A e 0 no B.'], 'Abre e fecha!'),
      ],
      sucesso: 'Cancela a funcionar! Um servo é um motor com «memória»: roda até ao ângulo que lhe pedes e fica lá.',
      extensao: 'E se a cancela abrisse devagar, de 30 em 30 graus, com pausas?',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">180</field></shadow></value></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">180</field></shadow></value></block></statement></block></xml>", pedido: 'A minha cancela abre… mas nunca mais fecha! Carrego no B e nada. Encontras a gambiarra?' },
    },
  };

  const PORTA = {
    titulo: 'Alarme da porta',
    missao: 'Dois bocados de alumínio fecham o circuito quando a porta está fechada; se a porta abrir, o alarme toca.',
    passos: ['Alumínio na porta (pin 0) e no aro (3V): porta fechada = circuito fechado.', '«para sempre»: se a leitura digital do pin 0 = 0, toca um tom.', 'Experimenta: fecha o pin 0 (porta fechada) e depois abre-o.'],
    material: 'micro:bit, 2 crocodilos, papel de alumínio, fita-cola, uma caixa com tampa',
    novos: [],
    caixa: ['mk_sempre', 'mk_se_entao', 'mk_comparar', 'mk_ler_digital', 'mk_tom'],
    teste: 'digital:P0',
    // fechada (1) → silêncio; aberta (0) → alarme
    ok: r => aposSensor(r, 'digital:P0', v => v === 0, temTom) && aposSensor(r, 'digital:P0', v => v === 1, s => !temTom(s)),
    tutor: {
      boasVindas: ['boas_vindas', 'Agora ao contrário: o circuito fechado quer dizer que está tudo bem. Quando abre, há alarme!'],
      parecePronto: a => ses(ev1(a, 'sempre')).some(p => verdade(p, 'mk_ler_digital', 0) === true && verdade(p, 'mk_ler_digital', 1) === false) && tem(ev1(a, 'sempre'), 'mk_tom'),
      testar: 'Tens uma ideia? Vamos testar! Fecha o pin 0 e depois abre-o.',
      regras: [
        regraSempre('Um alarme nunca dorme. Que bloco vigia sem parar?'),
        regraSemSe('sempre', 'O alarme só pode tocar às vezes. Como é que o micro:bit decide?'),
        P.regra('sem_leitura', a => ses(ev1(a, 'sempre')).length > 0 && !ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_ler_digital')), [
          'Como é que o micro:bit sabe se a porta está aberta?', 'A leitura digital do pin 0 diz 1 (fechado) ou 0 (aberto).', 'Põe «leitura digital pin P0 = 0» no buraco do «se».'], 'Agora vigia a porta!'),
        P.bloco('sempre', 'mk_tom', 'O micro:bit já sabe quando a porta abre. E como é que dá o alarme?'),
        P.regra('invertido', a => ses(ev1(a, 'sempre')).some(p => verdade(p, 'mk_ler_digital', 1) === true && verdade(p, 'mk_ler_digital', 0) === false), [
          ['surpreendida', 'Ui! O alarme toca com a porta fechada?'], 'Porta aberta = circuito aberto = 0.', 'Muda o número da comparação para 0.'], 'Alarme no sítio certo!'),
      ],
      sucesso: 'Alarme pronto! É o mesmo circuito do bip, mas ao contrário: aqui o perigo é o circuito abrir.',
      extensao: 'E se, em vez de um tom, tocasse três tons diferentes, como uma sirene?',
      gambiarra: { xml: "<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_ler_digital\"><field name=\"P\">P0</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">880</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></statement></block></statement></block></xml>", pedido: 'O meu alarme toca quando a porta está fechada e cala-se quando abro! Ajudas-me?' },
    },
  };

  const PELUCHE = {
    titulo: 'Peluche com voz nova',
    missao: 'A caixa de voz do peluche avariou: mete lá o micro:bit — festa no logotipo, ele ri-se e sorri.',
    passos: ['O micro:bit vai dentro do peluche; o logotipo fica junto à barriga.', '«ao logotipo pressionado»: tocar som e mostrar um ícone.', 'Experimenta: toca no logotipo.'],
    material: 'micro:bit V2 com pilhas, um peluche com a voz avariada',
    novos: [],
    caixa: ['mk_logo', 'mk_som', 'mk_icone', 'mk_agitar'],
    teste: 'logo',
    ok: r => F.verif.causou(r, s => temTom(s) && temIcone(s), v => v === 'logo'),
    tutor: {
      boasVindas: ['boas_vindas', 'Este peluche era mudo desde que a caixa de voz avariou. Vamos dar-lhe uma voz nova!'],
      parecePronto: a => (tem(ev1(a, 'logo'), 'mk_som') || tem(ev1(a, 'logo'), 'mk_tom')) && tem(ev1(a, 'logo'), 'mk_icone'),
      testar: 'Tens uma ideia? Vamos testar! Faz festa no logotipo.',
      regras: [
        P.evento('logo', 'A festa na barriga é um toque no logotipo dourado. Que bloco fica à escuta?'),
        P.regra('sem_som', a => !!ev1(a, 'logo') && !(tem(ev1(a, 'logo'), 'mk_som') || tem(ev1(a, 'logo'), 'mk_tom')), [
          'Uma voz nova… que não se ouve?', 'Os blocos laranja de música fazem sons.', 'Põe «tocar som» dentro de «ao logotipo pressionado».'], 'Já tem voz!'),
        P.bloco('logo', 'mk_icone', 'E a cara do peluche? Como é que ele mostra que gostou?'),
      ],
      sucesso: 'O peluche voltou a falar! Muitos brinquedos vão para o lixo só por uma peça avariada.',
      extensao: 'E se ficasse tonto quando o abanas (em agitar), com outro som?',
      gambiarra: { xml: "<xml><block type=\"mk_agitar\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_som\"><value name=\"S\"><shadow type=\"mk_som_menu\"><field name=\"V\">giggle</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">Happy</field></block></next></block></statement></block></xml>", pedido: 'O meu peluche só se ri quando o abano com força, nunca com festinhas! Que gambiarra é esta?' },
    },
  };

  // ============================================================ Nível 3 · Melhorar e cuidar
  const CONTADOR = {
    titulo: 'Contador do Repair Café',
    missao: 'No Repair Café: cada objeto reparado é um toque no A; o B mostra quantos já se salvaram do lixo.',
    passos: ['No botão A: mudar contador em 1.', 'No botão B: mostrar número do contador.', 'Experimenta: A e B; depois A, A e B outra vez.'],
    material: 'micro:bit',
    novos: ['mk_iniciar', 'mk_var_definir'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_mudar', 'mk_var', 'mk_mostrar_numero'],
    teste: 'botao:A',
    // a conta tem de crescer: depois de 1 objeto mostra 1, depois de 3 mostra 3
    ok: r => F.verif.causou(r, s => s.includes('numero:1'), v => v === 'botao:B') && F.verif.causou(r, s => s.includes('numero:3'), v => v === 'botao:B'),
    tutor: {
      boasVindas: ['boas_vindas', 'No Repair Café arranjam-se torradeiras, candeeiros, brinquedos… Vamos contar quantos objetos se salvam do lixo!'],
      parecePronto: a => tem(ev1(a, 'botao:A'), 'mk_var_mudar') && dentro(ev1(a, 'botao:B'), 'mk_mostrar_numero', 'mk_var'),
      testar: 'Tens uma ideia? Vamos testar! A, A, A… e depois B.',
      regras: [
        P.evento('botao:A', 'Quando um objeto fica reparado, o que é que carregas?'),
        P.regra('usa_definir', a => tem(ev1(a, 'botao:A'), 'mk_var_definir') && !tem(ev1(a, 'botao:A'), 'mk_var_mudar'), [
          'Carregas três vezes e o contador fica sempre igual… porquê?', '«definir» guarda sempre o mesmo número; «mudar» soma.', 'No botão A, troca o «definir» por «mudar contador em 1».'], 'Agora soma!'),
        P.bloco('botao:A', 'mk_var_mudar', 'Para contar, o número tem de crescer. Como é que se soma 1?'),
        P.evento('botao:B', 'E para ver o total, que botão usas?'),
        P.bloco('botao:B', 'mk_mostrar_numero', 'O total está guardado. Como é que o micro:bit o mostra?'),
        P.valorEm('botao:B', 'mk_mostrar_numero', 'mk_var', 'Aparece sempre o mesmo número? Onde está guardada a conta?'),
      ],
      sucesso: 'Contador a funcionar! Cada objeto reparado é lixo a menos e dinheiro poupado.',
      extensao: 'Usa «no arranque» para pôr o contador a 0, e o logotipo para mostrar um coração por cada 10 objetos.',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_definir\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value></block></statement></block></xml>", pedido: 'Reparámos três objetos mas o meu contador diz 1! Que gambiarra fiz?' },
    },
  };

  const POUPAR = {
    titulo: 'Poupar energia',
    missao: 'A luz acende no A e apaga sozinha passados 3 segundos — o micro:bit vai vendo o relógio.',
    passos: ['No A: P2 para 1 e definir medida para tempo de execução.', '«para sempre»: se tempo de execução − medida > 3000, P2 para 0.', 'Experimenta: carrega em A e espera.'],
    material: 'micro:bit, LED, 2 crocodilos',
    novos: ['mk_tempo', 'mk_conta', 'mk_comparar', 'mk_se_entao'],
    caixa: ['mk_botao', 'mk_digital_1', 'mk_digital_0', 'mk_sempre', 'mk_var_definir', 'mk_var'],
    teste: 'botao:A',
    ok: r => acendeEApaga(r, 'botao:A', 2000),
    tutor: {
      boasVindas: ['boas_vindas', 'A luz de escada usava uma pausa e o micro:bit ficava parado. Agora vamos fazer melhor: ele vai olhando para o relógio!'],
      parecePronto: a => tem(ev1(a, 'botao:A'), 'mk_digital') && dentro(ev1(a, 'botao:A'), 'mk_var_definir', 'mk_tempo') &&
        ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_conta') && usa(p, 'mk_tempo') && (p.usa || []).some(u => u.op === '>' || u.op === '>=')) && blocos(ev1(a, 'sempre'), 'mk_digital').some(p => p.v === 0),
      testar: 'Tens uma ideia? Vamos testar! Carrega em A e conta até 3.',
      regras: [
        P.evento('botao:A', 'Quem acende a luz?'),
        P.regra('a_sem_acender', a => !blocos(ev1(a, 'botao:A'), 'mk_digital').some(p => p.v === 1), [
          'Carregas no A e a luz… nada?', 'O bloco vermelho-escuro «gravação digital» liga o pino.', 'Põe «gravação digital pin P2 para 1» no botão A.'], 'Luz!'),
        P.regra('sem_guardar_tempo', a => !dentro(ev1(a, 'botao:A'), 'mk_var_definir', 'mk_tempo'), [
          'Para saber quando passaram 3 segundos, de quando é que tens de te lembrar?', 'Guarda a hora em que acendeu: «definir medida para tempo de execução».', 'No A, junta «definir medida para» com «tempo de execução» lá dentro.'], 'Hora guardada!'),
        P.evento('sempre', 'Quem vai olhando para o relógio enquanto a luz está acesa?'),
        regraSemSe('sempre', 'A luz só pode apagar quando já passou o tempo. Que bloco decide?'),
        P.regra('sem_conta', a => ses(ev1(a, 'sempre')).length > 0 && !ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_conta')), [
          'Quanto tempo passou desde que acendeu? Como se calcula?', 'Tempo de agora − tempo guardado = tempo que passou.', 'No «se», compara «tempo de execução − medida» com 3000.'], 'Boa conta!'),
        P.regra('sinal_trocado', a => ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_conta') && (p.usa || []).some(u => u.op === '<' || u.op === '<=')), [
          ['surpreendida', 'Ui! Apaga logo, sem esperar?'], 'Queremos apagar quando o tempo que passou é MAIOR do que 3000.', 'Muda o «<» para «>».'], 'Agora espera!'),
        P.regra('sem_apagar', a => ses(ev1(a, 'sempre')).length > 0 && !blocos(ev1(a, 'sempre'), 'mk_digital').some(p => p.v === 0), [
          'O tempo passa… e quem apaga a luz?', 'Dentro do «se» é que se apaga.', 'Põe «gravação digital pin P2 para 0» dentro do «se».'], 'Apaga sozinha!'),
      ],
      sucesso: 'Poupança automática! Enquanto espera, o micro:bit está livre para fazer outras coisas — é assim que funcionam os temporizadores a sério.',
      extensao: 'E se o botão B desse mais 3 segundos de luz sem apagar?',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_var_definir\"><field name=\"VAR\">medida</field><value name=\"V\"><block type=\"mk_tempo\"></block></value></block></next></block></statement></block><block type=\"mk_sempre\" x=\"40\" y=\"320\"><statement name=\"DO\"><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&lt;</field><value name=\"A\"><block type=\"mk_conta\"><field name=\"OP\">-</field><value name=\"A\"><block type=\"mk_tempo\"></block></value><value name=\"B\"><block type=\"mk_var\"><field name=\"VAR\">medida</field></block></value></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">3000</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></statement></block></statement></block></xml>", pedido: 'A minha luz apaga logo, nem dá para ver! Onde está a gambiarra?' },
    },
  };

  const CALOR = {
    titulo: 'Alarme de sobreaquecimento',
    missao: 'Carregadores e ferros de soldar aquecem: se a temperatura passar de 40 °C, o micro:bit dá o alarme.',
    passos: ['«para sempre»: se temperatura > 40, então tocar tom e mostrar ✗.', 'O sensor de temperatura está dentro do micro:bit.', 'Experimenta: sobe a temperatura no ecrã.'],
    material: 'micro:bit (e, para testar a sério, a tua mão a aquecê-lo)',
    novos: ['mk_temperatura'],
    caixa: ['mk_sempre', 'mk_se_entao', 'mk_comparar', 'mk_tom', 'mk_icone_nao'],
    teste: 'temperatura',
    ok: r => aposSensor(r, 'temperatura', v => v > 40, s => temTom(s) && temIcone(s)) && aposSensor(r, 'temperatura', v => v <= 40, s => !temTom(s)),
    tutor: {
      boasVindas: ['boas_vindas', 'Um aparelho que aquece demais pode estragar-se… ou ser perigoso. Vamos fazer um vigilante do calor!'],
      parecePronto: a => ses(ev1(a, 'sempre')).some(p => verdade(p, 'mk_temperatura', 45) === true && verdade(p, 'mk_temperatura', 25) === false) && tem(ev1(a, 'sempre'), 'mk_tom'),
      testar: 'Tens uma ideia? Vamos testar! Sobe a temperatura acima de 40.',
      regras: [
        regraSempre('O vigilante tem de estar sempre atento. Que bloco repete sem parar?'),
        regraSemSe('sempre', 'O alarme só pode tocar quando está quente. Como é que o micro:bit decide?'),
        P.regra('sem_temperatura', a => ses(ev1(a, 'sempre')).length > 0 && !ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_temperatura')), [
          'O «se» está a perguntar o quê? Quem mede o calor?', 'Há um bloco cor-de-rosa «temperatura (°C)».', 'Põe «temperatura (°C) > 40» no buraco do «se».'], 'Agora mede o calor!'),
        P.bloco('sempre', 'mk_tom', 'Um alarme silencioso não serve. Como é que avisa toda a gente?'),
        P.regra('sinal_trocado', a => ses(ev1(a, 'sempre')).some(p => verdade(p, 'mk_temperatura', 25) === true && verdade(p, 'mk_temperatura', 45) === false), [
          ['surpreendida', 'Ui! O alarme toca quando está fresco?'], '«>» quer dizer maior do que.', 'Usa «temperatura > 40».'], 'Alarme no sítio certo!'),
      ],
      sucesso: 'Vigilante do calor pronto! Muitas avarias começam com aquecimento: perceber isso cedo salva o aparelho.',
      extensao: 'Experimenta 28 °C e aquece o micro:bit com as mãos. Quanto tempo demora?',
      gambiarra: { xml: "<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&lt;</field><value name=\"A\"><block type=\"mk_temperatura\"></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">40</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">880</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">No</field></block></next></block></statement></block></statement></block></xml>", pedido: 'O meu alarme toca no frio e cala-se quando aquece! Ajudas-me?' },
    },
  };

  const REGISTO = {
    titulo: 'Registo de reparações',
    missao: 'A guarda «reparado» e B guarda «reciclado», cada um com a sua conta, numa tabela.',
    passos: ['No A: mudar contador em 1 e registar dados «reparado» = contador.', 'No B: mudar pontos em 1 e registar dados «reciclado» = pontos.', 'Experimenta: A, A, B.'],
    material: 'micro:bit V2',
    novos: [],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_mudar', 'mk_var', 'mk_registar', 'mk_iniciar', 'mk_var_definir', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => houve(r, /^registo:[^:]*repar[^:]*:2$/i) && houve(r, /^registo:[^:]*recicl[^:]*:1$/i),
    tutor: {
      boasVindas: ['boas_vindas', 'O que não tem arranjo vai para a reciclagem. Vamos guardar as duas contas numa tabela, para saber como correu o dia!'],
      parecePronto: a => tem(ev1(a, 'botao:A'), 'mk_var_mudar') && dentro(ev1(a, 'botao:A'), 'mk_registar', 'mk_var') && tem(ev1(a, 'botao:B'), 'mk_var_mudar') && dentro(ev1(a, 'botao:B'), 'mk_registar', 'mk_var'),
      testar: 'Tens uma ideia? Vamos testar! Carrega em A, A, B.',
      regras: [
        P.evento('botao:A', 'Um objeto foi reparado! Que botão carregas?'),
        P.bloco('botao:A', 'mk_registar', 'Queremos que fique escrito numa tabela. Que bloco guarda dados?'),
        P.bloco('botao:A', 'mk_var_mudar', 'A tabela tem de mostrar a conta a crescer. Quem soma 1?'),
        P.valorEm('botao:A', 'mk_registar', 'mk_var', 'Na tabela aparece sempre 1? Onde está a conta?'),
        P.evento('botao:B', 'E o que vai para a reciclagem? Que botão usas?'),
        P.bloco('botao:B', 'mk_registar', 'O B também tem de escrever na tabela.'),
      ],
      sucesso: 'Tabela do dia feita! Com estes números o Repair Café sabe quanto lixo evitou.',
      extensao: 'No logotipo, mostra a percentagem de objetos reparados (reparados × 100 ÷ total).',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_registar\"><value name=\"NOME\"><shadow type=\"mk_texto\"><field name=\"TXT\">reparado</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">pontos</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_registar\"><value name=\"NOME\"><shadow type=\"mk_texto\"><field name=\"TXT\">reciclado</field></shadow></value><value name=\"V\"><block type=\"mk_var\"><field name=\"VAR\">pontos</field></block></value></block></next></block></statement></block></xml>", pedido: 'Na minha tabela os reparados ficam sempre a 1! Que gambiarra é esta?' },
    },
  };

  const BRINQUEDO = {
    titulo: 'Brinquedo melhorado',
    missao: 'Repara e melhora um brinquedo: festa no logotipo e ele acende uma luz, faz um som e mexe o braço (servo).',
    passos: ['LED no pin 2, servo no pin 0.', '«ao logotipo pressionado»: P2 para 1, tocar som, servo P0 para 180.', 'Experimenta: toca no logotipo.'],
    material: 'micro:bit V2, LED, servo SG90, crocodilos, um brinquedo velho',
    novos: [],
    caixa: ['mk_logo', 'mk_digital_1', 'mk_som', 'mk_servo', 'mk_pausa', 'mk_icone', 'mk_agitar'],
    teste: 'logo',
    ok: r => F.verif.causou(r, s => s.some(x => /^digital:P\d:1$/.test(x)) && temTom(s) && s.some(x => x.startsWith('servo:')), v => v === 'logo'),
    tutor: {
      boasVindas: ['boas_vindas', 'Reparar não é só pôr a funcionar — também pode ser melhorar!'],
      parecePronto: a => blocos(ev1(a, 'logo'), 'mk_digital').some(p => p.v === 1) && (tem(ev1(a, 'logo'), 'mk_som') || tem(ev1(a, 'logo'), 'mk_tom')) && tem(ev1(a, 'logo'), 'mk_servo'),
      testar: 'Tens uma ideia? Vamos testar! Toca no logotipo.',
      regras: [
        P.evento('logo', 'O brinquedo reage a festas. Que bloco fica à escuta do logotipo?'),
        P.regra('sem_luz', a => !!ev1(a, 'logo') && !blocos(ev1(a, 'logo'), 'mk_digital').some(p => p.v === 1), [
          'E a luz? O LED está no pin 2…', 'O bloco «gravação digital» liga o pino.', 'Põe «gravação digital pin P2 para 1» no logotipo.'], 'Luz acesa!'),
        P.regra('sem_som', a => !!ev1(a, 'logo') && !(tem(ev1(a, 'logo'), 'mk_som') || tem(ev1(a, 'logo'), 'mk_tom')), [
          'Já tem luz. E voz?', 'Os blocos laranja fazem sons.', 'Põe «tocar som» no logotipo.'], 'Já fala!'),
        P.bloco('logo', 'mk_servo', 'Luz e som… e o braço que mexe?'),
      ],
      sucesso: 'Brinquedo reparado e melhorado! Diagnosticar, substituir, melhorar: é assim no Repair Café.',
      extensao: 'E se o braço voltasse a baixar depois de uma pausa, como quem diz adeus?',
      gambiarra: { xml: "<xml><block type=\"mk_logo\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_som\"><value name=\"S\"><shadow type=\"mk_som_menu\"><field name=\"V\">happy</field></shadow></value></block></next></block></statement></block><block type=\"mk_agitar\" x=\"40\" y=\"320\"><statement name=\"DO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">180</field></shadow></value></block></statement></block></xml>", pedido: 'O meu brinquedo acende e fala, mas o braço só mexe quando o abano! Encontras a gambiarra?' },
    },
  };

  // ============================================================ projetos complexos (7.º–11.º de cada nível, 15–20 min)
  // gambiarras geradas com testes/lib.js (ver testes/casos/reparar.js, G2) e copiadas para aqui
  const GAMB = {"semaforo":"<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&gt;</field><value name=\"A\"><block type=\"mk_ler_analogico\"><field name=\"P\">P1</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">500</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_icone\"><field name=\"I\">Happy</field></block></statement><statement name=\"NAO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&gt;</field><value name=\"A\"><block type=\"mk_ler_analogico\"><field name=\"P\">P1</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">800</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_icone\"><field name=\"I\">Asleep</field></block></statement><statement name=\"NAO\"><block type=\"mk_icone\"><field name=\"I\">Sad</field></block></statement></block></statement></block></statement></block></xml>","banco":"<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">pontos</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_ler_digital\"><field name=\"P\">P0</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_icone\"><field name=\"I\">Yes</field></block></statement><statement name=\"NAO\"><block type=\"mk_icone\"><field name=\"I\">No</field></block></statement></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_var\"><field name=\"VAR\">pontos</field></block></value></block></statement></block></xml>","diagnostico":"<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&gt;</field><value name=\"A\"><block type=\"mk_ler_analogico\"><field name=\"P\">P1</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">500</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_mostrar_texto\"><value name=\"T\"><shadow type=\"mk_texto\"><field name=\"TXT\">PILHA OK</field></shadow></value></block></statement><statement name=\"NAO\"><block type=\"mk_mostrar_texto\"><value name=\"T\"><shadow type=\"mk_texto\"><field name=\"TXT\">TROCA A PILHA</field></shadow></value></block></statement></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_ler_digital\"><field name=\"P\">P0</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_mostrar_texto\"><value name=\"T\"><shadow type=\"mk_texto\"><field name=\"TXT\">LAMPADA OK</field></shadow></value></block></statement><statement name=\"NAO\"><block type=\"mk_mostrar_texto\"><value name=\"T\"><shadow type=\"mk_texto\"><field name=\"TXT\">TROCA A LAMPADA</field></shadow></value></block></statement></block></statement></block></xml>","canta":"<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_grafico\"><value name=\"V\"><block type=\"mk_ler_analogico\"><field name=\"P\">P1</field></block></value><value name=\"MAX\"><shadow type=\"mk_num\"><field name=\"NUM\">1023</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_num\"><field name=\"NUM\">440</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">0.25</field></shadow></value></block></next></block></statement></block></xml>","inventario":"<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_ler_analogico\"><field name=\"P\">P1</field></block></value><next><block type=\"mk_registar\"><value name=\"NOME\"><shadow type=\"mk_texto\"><field name=\"TXT\">pilha</field></shadow></value><value name=\"V\"><block type=\"mk_ler_analogico\"><field name=\"P\">P1</field></block></value></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value></block></statement></block></xml>","candeeiroT":"<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">Happy</field><next><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_pausa\"><value name=\"MS\"><shadow type=\"mk_pausa_menu\"><field name=\"V\">3000</field></shadow></value><next><block type=\"mk_limpar\"></block></next></block></next></block></next></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_limpar\"></block></next></block></statement></block></xml>","surdos":"<xml><block type=\"mk_pino_tocado\" x=\"40\" y=\"160\"><field name=\"P\">P1</field><statement name=\"DO\"><block type=\"mk_repetir\"><value name=\"N\"><shadow type=\"mk_num\"><field name=\"NUM\">3</field></shadow></value><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">523</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_pausa\"><value name=\"MS\"><shadow type=\"mk_pausa_menu\"><field name=\"V\">200</field></shadow></value></block></next></block></next></block></statement><next><block type=\"mk_icone\"><field name=\"I\">Surprised</field></block></next></block></statement></block></xml>","codigo":"<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">3</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">90</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">Yes</field></block></next></block></statement><statement name=\"NAO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">No</field></block></next></block></statement></block></statement></block></xml>","ventoinha":"<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&gt;</field><value name=\"A\"><block type=\"mk_temperatura\"></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">28</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">180</field></shadow></value><next><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></next></block></statement><statement name=\"NAO\"></statement></block></statement></block></xml>","musical":"<xml><block type=\"mk_logo\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_repetir\"><value name=\"N\"><shadow type=\"mk_num\"><field name=\"NUM\">2</field></shadow></value><statement name=\"DO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">262</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">262</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">180</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">262</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">262</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block></statement></block></xml>","balcao":"<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">pontos</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"480\"><field name=\"B\">AB</field><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value><next><block type=\"mk_registar\"><value name=\"NOME\"><shadow type=\"mk_texto\"><field name=\"TXT\">total</field></shadow></value><value name=\"V\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value></block></next></block></statement></block></xml>","taxa":"<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">pontos</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block><block type=\"mk_logo\" x=\"40\" y=\"480\"><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_conta\"><field name=\"OP\">/</field><value name=\"A\"><block type=\"mk_conta\"><field name=\"OP\">*</field><value name=\"A\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">100</field></shadow></value></block></value><value name=\"B\"><block type=\"mk_var\"><field name=\"VAR\">pontos</field></block></value></block></value></block></statement></block></xml>","presenca":"<xml><block type=\"mk_som_alto\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block><block type=\"mk_sempre\" x=\"40\" y=\"320\"><statement name=\"DO\"><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&gt;</field><value name=\"A\"><block type=\"mk_conta\"><field name=\"OP\">-</field><value name=\"A\"><block type=\"mk_tempo\"></block></value><value name=\"B\"><block type=\"mk_var\"><field name=\"VAR\">medida</field></block></value></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">3000</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></statement></block></statement></block></xml>","seguro":"<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&gt;</field><value name=\"A\"><block type=\"mk_temperatura\"></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">40</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value><next><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">880</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_registar\"><value name=\"NOME\"><shadow type=\"mk_texto\"><field name=\"TXT\">quente</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">40</field></shadow></value></block></next></block></next></block></statement><statement name=\"NAO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block></statement></block></xml>"};
  const tx = s => s.filter(x => x.startsWith('texto:')).map(x => x.slice(6).toUpperCase());
  const textoBom = s => tx(s).some(t => /OK|BOA|BEM/.test(t));
  const textoMau = s => tx(s).some(t => !/OK|BOA|BEM/.test(t));
  const umSe = (ev, leitor) => ses(ev).find(p => p.tipo === 'mk_se' && (!leitor || usa(p, leitor)));
  const ramoTem = (ramo, tipo, f) => (ramo || []).some(x => x.tipo === tipo && (!f || f(x)));
  const ops = ev => ev ? ev.plano.flatMap(p => (p.usa || []).filter(u => u.op).map(u => u.op)) : [];
  const varsMudadas = ev => blocos(ev, 'mk_var_mudar').map(p => p.var);
  const servoAng = s => s.filter(x => x.startsWith('servo:')).map(x => Number(x.split(':').pop()));
  const dig = (s, v) => s.some(x => new RegExp('^digital:P\\d:' + v + '$').test(x));

  // ---------------------------------------------------------------- Nível 1
  const SEMAFORO = {
    titulo: 'Semáforo das pilhas',
    missao: 'Testa pilhas com um semáforo de caras: nova, a meio ou gasta — cada uma com a sua resposta.',
    passos: [
      'Pilha com o + no pin 1 e o − no GND (só pilhas até 3 V!).',
      'No A: se leitura analógica P1 > 800 → cara contente; senão, outro «se»: > 500 → cara a dormir; senão → cara triste.',
      'Testa com uma pilha nova, uma a meio e uma gasta.',
      'No ecrã: pin 1 alto, a meio e baixo, e carrega em A de cada vez.',
    ],
    material: 'micro:bit, 2 crocodilos, suporte de pilhas, pilhas AA novas, usadas e gastas',
    novos: ['mk_icone_dormir'],
    caixa: ['mk_botao', 'mk_se_senao', 'mk_comparar', 'mk_ler_analogico', 'mk_icone', 'mk_icone_triste'],
    teste: 'botao:A',
    ok: r => {
      const quer = e => e.estado > 800 ? 'icone:Happy' : e.estado > 500 ? 'icone:Asleep' : 'icone:Sad';
      const t = porEstado(r, 'analogico:P1', v => v === 'botao:A').filter(e => e.estado !== undefined && temIcone(e.saidas));
      const certo = e => e.saidas.includes(quer(e)) && !e.saidas.some(x => x.startsWith('icone:') && x !== quer(e));
      return t.length > 0 && t.every(certo) && t.some(e => e.estado > 800) && t.some(e => e.estado > 500 && e.estado <= 800) && t.some(e => e.estado <= 500);
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto a sério: um semáforo das pilhas! Nova, a meio ou gasta — três respostas. Vai dar luta… mas tu consegues.'],
      parecePronto: a => {
        const ev = ev1(a, 'botao:A');
        const ic = blocos(ev, 'mk_icone').map(p => p.icone);
        const s = ses(ev).filter(p => p.tipo === 'mk_se');
        return s.length >= 2 && s.every(p => usa(p, 'mk_ler_analogico')) && ['Happy', 'Asleep', 'Sad'].every(x => ic.includes(x));
      },
      testar: 'Tens uma ideia? Vamos testar! Pin 1 alto, A; a meio, A; baixo, A.',
      regras: [
        P.evento('botao:A', 'Quando é que o testador mede a pilha?'),
        P.regra('sem_se', a => !!ev1(a, 'botao:A') && ses(ev1(a, 'botao:A')).length === 0, [
          'Há três respostas possíveis… como é que o micro:bit escolhe?',
          'O bloco «se … então … senão» escolhe entre dois caminhos.',
          'Põe um «se … então … senão» dentro do botão A.'], 'Já decide!'),
        P.regra('sem_leitura', a => ses(ev1(a, 'botao:A')).length > 0 && !ses(ev1(a, 'botao:A')).some(p => usa(p, 'mk_ler_analogico')), [
          'O «se» pergunta o quê? Quem mede a força da pilha?',
          'A «leitura analógica pin P1» dá um número de 0 a 1023.',
          'Põe «leitura analógica pin P1 > 800» no buraco do «se».'], 'Agora mede a pilha!'),
        P.regra('so_dois', a => ses(ev1(a, 'botao:A')).filter(p => p.tipo === 'mk_se').length < 2, [
          'Nova, a meio ou gasta: são três casos. Um «se» só escolhe entre dois… como fazes o terceiro?',
          'Podes pôr outro «se … senão» dentro do «senão» do primeiro.',
          'Arrasta um segundo «se … então … senão» para dentro do «senão» e compara com 500.'], 'Três caminhos!'),
        P.regra('limiares', a => {
          const fora = ses(ev1(a, 'botao:A')).find(p => p.tipo === 'mk_se' && p.prof === 0);
          return !!fora && verdade(fora, 'mk_ler_analogico', 650) === true && ramoTem(fora.sim, 'mk_icone', x => x.icone === 'Happy');
        }, [
          ['surpreendida', 'Ui! Uma pilha a meio aparece como nova? Que número pergunta o primeiro «se»?'],
          'Pergunta primeiro pelo número maior: só as pilhas acima de 800 são novas.',
          'No primeiro «se» usa 800; no segundo, 500.'], 'Ordem certa!'),
        P.regra('falta_cara', a => {
          const ic = blocos(ev1(a, 'botao:A'), 'mk_icone').map(p => p.icone);
          return ses(ev1(a, 'botao:A')).filter(p => p.tipo === 'mk_se').length >= 2 && !['Happy', 'Asleep', 'Sad'].every(x => ic.includes(x));
        }, [
          'Cada caso tem a sua cara. Falta alguma?',
          'Contente para a nova, a dormir para a meio, triste para a gasta.',
          'Põe a cara que falta no ramo vazio.'], 'Semáforo completo!'),
      ],
      sucesso: 'Semáforo das pilhas pronto! Com três respostas em vez de duas, sabes logo se a pilha ainda serve para um comando ou se vai para o pilhão.',
      extensao: 'Junta um som diferente a cada cara do semáforo.',
      gambiarra: { xml: GAMB.semaforo, pedido: 'O meu semáforo diz que todas as pilhas estão novas, até as que estão a meio! Que gambiarra fiz?' },
    },
  };

  const BANCO = {
    titulo: 'Banco de ensaios',
    missao: 'Testa uma caixa de peças, uma a uma: o A testa e mostra ✔ ou ✗, o B diz quantas passaram.',
    passos: [
      'Pontas no pin 0 e no 3V; encosta cada peça às pontas.',
      'No A: se leitura digital P0 = 1 → mudar pontos em 1 e mostrar ✔; senão → mostrar ✗.',
      'No B: mostrar número de pontos.',
      'Experimenta: 3 peças (fechado, aberto, fechado) e depois B — tem de dar 2.',
    ],
    material: 'micro:bit, 2 crocodilos, uma caixa com 5 peças (fusíveis, fios, lâmpadas, interruptores)',
    novos: ['rp_mudar_pontos', 'rp_var_pontos'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_se_senao', 'mk_comparar', 'mk_ler_digital', 'mk_icone_sim', 'mk_icone_nao', 'mk_mostrar_numero', 'mk_iniciar', 'mk_var_definir'],
    teste: 'botao:A',
    ok: r => {
      let est = 0, passaram = 0, a1 = 0, a0 = 0, bOk = false, mal = false;
      for (let i = 0; i < r.length; i++) {
        const e = r[i];
        if (e.dir !== 'in') continue;
        if (e.v.startsWith('digital:P0:')) est = Number(e.v.split(':').pop());
        const s = [];
        for (let j = i + 1; j < r.length && r[j].dir === 'out'; j++) s.push(r[j].v);
        if (e.v === 'botao:A') {
          if (est === 1) { if (s.includes('icone:Yes') && !s.includes('icone:No')) { passaram++; a1++; } else mal = true; }
          else if (s.includes('icone:No') && !s.includes('icone:Yes')) a0++; else mal = true;
        }
        if (e.v === 'botao:B' && passaram >= 2 && s.includes('numero:' + passaram)) bOk = true;
      }
      return !mal && a1 >= 2 && a0 >= 1 && bOk;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Chegou uma caixa cheia de peças: quais prestam? Vamos montar um banco de ensaios que testa e conta!'],
      parecePronto: a => {
        const s = umSe(ev1(a, 'botao:A'), 'mk_ler_digital');
        const vb = blocos(ev1(a, 'botao:B'), 'mk_mostrar_numero').flatMap(p => (p.usa || []).filter(u => u.tipo === 'mk_var').map(u => u.var));
        return !!s && ramoTem(s.sim, 'mk_var_mudar', x => vb.includes(x.var)) && ramoTem(s.sim, 'mk_icone', x => x.icone === 'Yes') && ramoTem(s.nao, 'mk_icone', x => x.icone === 'No');
      },
      testar: 'Tens uma ideia? Vamos testar! Fecha o pin 0 e A; abre e A; fecha e A; depois B.',
      regras: [
        P.evento('botao:A', 'Cada peça é um teste. Que botão faz o teste?'),
        P.regra('sem_se', a => !!ev1(a, 'botao:A') && !umSe(ev1(a, 'botao:A')), [
          'A peça pode passar ou não passar. Como é que o micro:bit escolhe o que mostrar?',
          'O «se … então … senão» tem um caminho para o sim e outro para o não.',
          'Põe um «se … então … senão» dentro do botão A.'], 'Já decide!'),
        P.regra('sem_leitura', a => !!umSe(ev1(a, 'botao:A')) && !umSe(ev1(a, 'botao:A'), 'mk_ler_digital'), [
          'O «se» pergunta o quê? Quem sabe se a eletricidade passa pela peça?',
          'A «leitura digital pin P0» dá 1 quando passa.',
          'Põe «leitura digital pin P0 = 1» no buraco do «se».'], 'Agora testa a peça!'),
        P.regra('sem_contar', a => !!ev1(a, 'botao:A') && !tem(ev1(a, 'botao:A'), 'mk_var_mudar'), [
          'O B tem de saber quantas passaram. Quem vai contando?',
          'Uma variável guarda a conta: «mudar pontos em 1».',
          'Põe «mudar pontos em 1» dentro do «então».'], 'Já conta!'),
        P.regra('conta_tudo', a => blocos(ev1(a, 'botao:A'), 'mk_var_mudar').some(p => p.prof === 0), [
          'O B diz que passaram todas, até as avariadas… quando é que se deve somar?',
          'Só se soma quando a peça passa no teste.',
          'Mete o «mudar pontos em 1» dentro do «então» do «se».'], 'Agora só conta as boas!'),
        P.evento('botao:B', 'E para ver quantas passaram, que botão usas?'),
        P.bloco('botao:B', 'mk_mostrar_numero', 'A conta está guardada. Como é que o micro:bit a mostra?'),
        P.valorEm('botao:B', 'mk_mostrar_numero', 'mk_var', 'Aparece sempre o mesmo número? Onde está guardada a conta?'),
        P.regra('vars_diferentes', a => {
          const vb = blocos(ev1(a, 'botao:B'), 'mk_mostrar_numero').flatMap(p => (p.usa || []).filter(u => u.tipo === 'mk_var').map(u => u.var));
          const va = varsMudadas(ev1(a, 'botao:A'));
          return vb.length > 0 && va.length > 0 && !va.some(x => vb.includes(x));
        }, [
          ['surpreendida', 'Ui! Contas numa variável e mostras outra?'],
          'A conta e o número mostrado têm de ser a mesma variável.',
          'Escolhe «pontos» nos dois blocos.'], 'Mesma variável!'),
      ],
      sucesso: 'Banco de ensaios a funcionar! Testar todas as peças antes de montar poupa horas de trabalho — e não se deita fora o que ainda presta.',
      extensao: 'Junta o «contador» para contar todas as peças testadas e mostra-o no A+B.',
      gambiarra: { xml: GAMB.banco, pedido: 'O meu banco de ensaios diz que passaram 3 peças, mas uma estava avariada! Onde está a gambiarra?' },
    },
  };

  const DIAGNOSTICO = {
    titulo: 'Diagnóstico da lanterna',
    missao: 'Uma lanterna não acende: é a pilha ou a lâmpada? Dois testes, quatro respostas escritas no ecrã.',
    passos: [
      'Pilha no pin 1 (+) e no GND (−); a lâmpada (ou um LED) entre o pin 0 e o 3V.',
      'No A (pilha): se leitura analógica P1 > 500 → mostrar texto «PILHA OK»; senão «TROCA A PILHA».',
      'No B (lâmpada): se leitura digital P0 = 1 → «LAMPADA OK»; senão «TROCA A LAMPADA».',
      'Experimenta os quatro casos no ecrã: pin 1 alto e baixo; pin 0 fechado e aberto.',
    ],
    material: 'micro:bit, 4 crocodilos, uma lanterna velha (pilhas e lâmpada)',
    novos: ['mk_mostrar_texto'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_se_senao', 'mk_comparar', 'mk_ler_analogico', 'mk_ler_digital', 'mk_icone_sim', 'mk_icone_nao'],
    teste: 'botao:A',
    ok: r => {
      const verifica = (sensor, botao, bom) => {
        const t = porEstado(r, sensor, v => v === botao).filter(e => e.estado !== undefined && tx(e.saidas).length);
        const certo = e => bom(e.estado) ? textoBom(e.saidas) && !textoMau(e.saidas) : textoMau(e.saidas) && !textoBom(e.saidas);
        return t.length > 0 && t.every(certo) && t.some(e => bom(e.estado)) && t.some(e => !bom(e.estado));
      };
      return verifica('analogico:P1', 'botao:A', x => x > 500) && verifica('digital:P0', 'botao:B', x => x === 1);
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Um reparador não troca peças ao calhas: primeiro descobre qual é a avariada. Vamos fazer o diagnóstico da lanterna!'],
      parecePronto: a => {
        const sa = umSe(ev1(a, 'botao:A'), 'mk_ler_analogico'), sb = umSe(ev1(a, 'botao:B'), 'mk_ler_digital');
        const ambos = p => !!p && ramoTem(p.sim, 'mk_mostrar_texto') && ramoTem(p.nao, 'mk_mostrar_texto');
        return ambos(sa) && ambos(sb);
      },
      testar: 'Tens uma ideia? Vamos testar! Pin 1 alto e A, baixo e A; pin 0 fechado e B, aberto e B.',
      regras: [
        P.evento('botao:A', 'Primeiro teste: a pilha. Que botão o faz?'),
        P.regra('a_sem_se', a => !!ev1(a, 'botao:A') && !umSe(ev1(a, 'botao:A')), [
          'A pilha pode estar boa ou gasta… como é que o micro:bit escolhe a frase?',
          'O «se … então … senão» escolhe entre duas frases.',
          'Põe um «se … então … senão» no botão A.'], 'O A já decide!'),
        P.regra('a_sem_leitura', a => !!umSe(ev1(a, 'botao:A')) && !umSe(ev1(a, 'botao:A'), 'mk_ler_analogico'), [
          'Como se mede a força da pilha?',
          'A «leitura analógica pin P1» dá mais com uma pilha boa.',
          'No «se» do A usa «leitura analógica pin P1 > 500».'], 'Pilha medida!'),
        P.regra('a_sem_texto', a => { const p = umSe(ev1(a, 'botao:A'), 'mk_ler_analogico'); return !!p && !(ramoTem(p.sim, 'mk_mostrar_texto') && ramoTem(p.nao, 'mk_mostrar_texto')); }, [
          'Um ícone diz pouco. E se o micro:bit escrevesse o diagnóstico?',
          'O bloco azul «mostrar texto» faz passar uma frase.',
          'Põe um «mostrar texto» no «então» e outro no «senão» do A.'], 'Diagnóstico escrito!'),
        P.evento('botao:B', 'Segundo teste: a lâmpada. Que botão o faz?'),
        P.regra('b_sem_se', a => !!ev1(a, 'botao:B') && !umSe(ev1(a, 'botao:B')), [
          'A lâmpada pode estar boa ou fundida… como é que o B escolhe?',
          'Outra vez «se … então … senão».',
          'Põe um «se … então … senão» no botão B.'], 'O B já decide!'),
        P.regra('b_sem_leitura', a => !!umSe(ev1(a, 'botao:B')) && !umSe(ev1(a, 'botao:B'), 'mk_ler_digital'), [
          'Como sabes se a eletricidade passa pela lâmpada?',
          'A «leitura digital pin P0» dá 1 quando o circuito fecha.',
          'No «se» do B usa «leitura digital pin P0 = 1».'], 'Lâmpada testada!'),
        P.regra('b_invertido', a => { const p = umSe(ev1(a, 'botao:B'), 'mk_ler_digital'); return !!p && verdade(p, 'mk_ler_digital', 0) === true && verdade(p, 'mk_ler_digital', 1) === false; }, [
          ['surpreendida', 'Ui! A lâmpada fundida aparece como boa?'],
          '1 quer dizer que passa (lâmpada boa), 0 que não passa.',
          'No «se» do B compara com 1.'], 'Agora diz a verdade!'),
        P.regra('b_sem_texto', a => { const p = umSe(ev1(a, 'botao:B'), 'mk_ler_digital'); return !!p && !(ramoTem(p.sim, 'mk_mostrar_texto') && ramoTem(p.nao, 'mk_mostrar_texto')); }, [
          'O B também tem de escrever o resultado.',
          'Um «mostrar texto» em cada caminho do «se».',
          'Põe «LAMPADA OK» no «então» e «TROCA A LAMPADA» no «senão».'], 'Quatro respostas!'),
      ],
      sucesso: 'Diagnóstico completo! Com dois testes descobres qual é a peça avariada e só trocas essa — o resto da lanterna continua a servir.',
      extensao: 'Junta o logotipo: se as duas peças estiverem boas, escreve «LIGA O INTERRUPTOR».',
      gambiarra: { xml: GAMB.diagnostico, pedido: 'O meu diagnóstico diz que a lâmpada está boa quando está fundida! Ajudas-me?' },
    },
  };

  const CANTA = {
    titulo: 'Medidor que canta',
    missao: 'O medidor de condutividade agora também canta: quanto mais eletricidade passa, mais aguda é a nota — e as barras sobem.',
    passos: [
      'Pontas no pin 1 e no 3V, dentro de um copo com água.',
      '«para sempre»: desenhar gráfico de barras da leitura analógica P1 até 1023.',
      'Depois: tocar tom de (leitura analógica P1 + 200) por 1/4 de batida.',
      'Experimenta: água e depois água com sal (no ecrã: pin 1 baixo e alto).',
    ],
    material: 'micro:bit V2, 2 crocodilos, 2 copos com água, sal, colher',
    novos: ['mk_tom_livre', 'mk_conta'],
    caixa: ['mk_sempre', 'mk_ler_analogico', 'mk_grafico', 'mk_pausa'],
    teste: 'analogico:P1',
    ok: r => {
      const tons = s => s.filter(x => x.startsWith('tom:')).map(x => Number(x.slice(4)));
      return aposSensor(r, 'analogico:P1', v => v >= 900, s => s.some(x => /^grafico:(2[0-5])$/.test(x)) && tons(s).some(f => f >= 900)) &&
        aposSensor(r, 'analogico:P1', v => v <= 200, s => s.some(x => /^grafico:[0-6]$/.test(x)) && tons(s).length > 0 && tons(s).every(f => f < 600));
    },
    tutor: {
      boasVindas: ['boas_vindas', 'E se o medidor cantasse? Assim podes olhar para os copos e ouvir quanta eletricidade passa!'],
      parecePronto: a => dentro(ev1(a, 'sempre'), 'mk_grafico', 'mk_ler_analogico') && blocos(ev1(a, 'sempre'), 'mk_grafico').some(p => p.max === 1023) && dentro(ev1(a, 'sempre'), 'mk_tom', 'mk_ler_analogico'),
      testar: 'Tens uma ideia? Vamos testar! Pin 1 baixo… e depois bem alto.',
      regras: [
        regraSempre('O medidor tem de medir e cantar sem parar. Que bloco repete?'),
        P.bloco('sempre', 'mk_grafico', 'Primeiro as barras: que bloco desenha um gráfico?'),
        P.valorEm('sempre', 'mk_grafico', 'mk_ler_analogico', 'O gráfico desenha o quê? Quem mede a eletricidade que passa?'),
        P.regra('maximo_errado', a => blocos(ev1(a, 'sempre'), 'mk_grafico').some(p => p.max !== 1023) && dentro(ev1(a, 'sempre'), 'mk_grafico', 'mk_ler_analogico'), [
          'As barras estão sempre cheias… até onde vai a leitura analógica?',
          'A leitura analógica vai de 0 a 1023.',
          'No gráfico, muda o «até» para 1023.'], 'Barras certas!'),
        P.bloco('sempre', 'mk_tom', 'As barras já sobem e descem. E se também se ouvisse?'),
        P.valorEm('sempre', 'mk_tom', 'mk_ler_analogico', 'A nota é sempre a mesma… e se fosse a eletricidade a escolher a nota?'),
      ],
      sucesso: 'Medidor cantor pronto! Notas agudas = muita eletricidade a passar. Os reparadores usam testadores com som para não tirarem os olhos do circuito.',
      extensao: 'Experimenta multiplicar a leitura por 2 em vez de somar 200. O que muda na música?',
      gambiarra: { xml: GAMB.canta, pedido: 'O meu medidor canta sempre a mesma nota, com sal ou sem sal! Que gambiarra é esta?' },
    },
  };

  const INVENTARIO = {
    titulo: 'Inventário de pilhas',
    missao: 'Mede uma caixa de pilhas: cada medição aparece no ecrã e fica na tabela, e o micro:bit conta quantas já mediste.',
    passos: [
      'Pilha no pin 1 (+) e no GND (−).',
      'No A: mostrar número da leitura analógica P1 e registar dados «pilha» = leitura analógica P1.',
      'Ainda no A: mudar contador em 1. No B: mostrar número do contador.',
      'Mede 3 pilhas (no ecrã: muda o pin 1 antes de cada A) e carrega em B.',
    ],
    material: 'micro:bit V2, 2 crocodilos, uma caixa de pilhas usadas',
    novos: [],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_ler_analogico', 'mk_mostrar_numero', 'mk_registar', 'mk_var_mudar', 'mk_var', 'mk_iniciar', 'mk_var_definir'],
    teste: 'botao:A',
    ok: r => {
      let est, n = 0, okA = 0, bOk = false;
      for (let i = 0; i < r.length; i++) {
        const e = r[i];
        if (e.dir !== 'in') continue;
        if (e.v.startsWith('analogico:P1:')) est = Number(e.v.split(':').pop());
        const s = [];
        for (let j = i + 1; j < r.length && r[j].dir === 'out'; j++) s.push(r[j].v);
        if (e.v === 'botao:A') {
          n++;
          if (est !== undefined && s.includes('numero:' + est) && s.some(x => /^registo:[^:]*:/.test(x) && x.endsWith(':' + est))) okA++;
        }
        if (e.v === 'botao:B' && n >= 3 && s.includes('numero:' + n)) bOk = true;
      }
      return okA >= 3 && bOk;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'No Repair Café juntam-se pilhas de todo o lado. Vamos medir uma caixa inteira e guardar tudo numa tabela!'],
      parecePronto: a => dentro(ev1(a, 'botao:A'), 'mk_mostrar_numero', 'mk_ler_analogico') && dentro(ev1(a, 'botao:A'), 'mk_registar', 'mk_ler_analogico') &&
        tem(ev1(a, 'botao:A'), 'mk_var_mudar') && dentro(ev1(a, 'botao:B'), 'mk_mostrar_numero', 'mk_var'),
      testar: 'Tens uma ideia? Vamos testar! Muda o pin 1 e A, três vezes; depois B.',
      regras: [
        P.evento('botao:A', 'Cada pilha é uma medição. Que botão a faz?'),
        P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_ler_analogico', 'O número tem de vir da pilha. Quem mede a eletricidade que chega ao pino?'),
        P.bloco('botao:A', 'mk_mostrar_numero', 'Queres ver a medida logo. Como é que o micro:bit mostra um número?'),
        P.bloco('botao:A', 'mk_registar', 'O número desaparece do ecrã. Como fica guardado para depois?'),
        P.valorEm('botao:A', 'mk_registar', 'mk_ler_analogico', 'Na tabela tem de ficar a medida de cada pilha. O que pões no registo?'),
        P.bloco('botao:A', 'mk_var_mudar', 'E quantas já mediste? Quem vai contando?'),
        P.evento('botao:B', 'E para ver quantas pilhas já mediste, que botão usas?'),
        P.bloco('botao:B', 'mk_mostrar_numero', 'A conta está guardada. Como a mostras?'),
        P.valorEm('botao:B', 'mk_mostrar_numero', 'mk_var', 'Aparece sempre o mesmo número? Onde está a conta?'),
      ],
      sucesso: 'Inventário feito! Abre o MY_DATA na pasta MICROBIT: tens a medida de cada pilha. As fracas vão para o pilhão, as boas voltam a trabalhar.',
      extensao: 'Conta à parte as pilhas fracas (abaixo de 600) com a variável «pontos».',
      gambiarra: { xml: GAMB.inventario, pedido: 'Já medi três pilhas e o B diz 0! O que é que me esqueci?' },
    },
  };

  // ---------------------------------------------------------------- Nível 2
  const CANDEEIRO_T = {
    titulo: 'Candeeiro de mesa restaurado',
    missao: 'Restaura um candeeiro velho: o A acende e apaga sozinho passados 3 segundos; o B apaga logo.',
    passos: [
      'Faz o candeeiro com cartão e um LED: perna comprida no pin 2, curta no GND.',
      'No A: P2 para 1, mostrar um ícone, pausa 3000, P2 para 0, limpar ecrã.',
      'No B: P2 para 0 e limpar ecrã.',
      'Experimenta: A e espera; depois A e logo B.',
    ],
    material: 'micro:bit, LED, 2 crocodilos, cartão, fita-cola',
    novos: ['mk_limpar'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_digital_1', 'mk_digital_0', 'mk_pausa', 'mk_icone'],
    teste: 'botao:A',
    // o B tem de apagar logo (até 0,4 s), não é o A a apagar sozinho mais tarde
    ok: r => acendeEApaga(r, 'botao:A', 2500) && causou(r, s => temIcone(s), v => v === 'botao:A') && causou(r, s => dig(s, 0), v => v === 'botao:B', 400),
    tutor: {
      boasVindas: ['boas_vindas', 'Este candeeiro estava no lixo. Vamos dar-lhe um interruptor novo, com temporizador e botão de desligar!'],
      parecePronto: a => {
        const pa = ev1(a, 'botao:A') ? ev1(a, 'botao:A').plano : [];
        const i1 = pa.findIndex(p => p.tipo === 'mk_digital' && p.v === 1), i0 = pa.findIndex((p, k) => k > i1 && p.tipo === 'mk_digital' && p.v === 0);
        const ip = pa.findIndex((p, k) => k > i1 && k < i0 && p.tipo === 'mk_pausa' && p.ms >= 2500);
        return i1 >= 0 && i0 > i1 && ip > i1 && tem(ev1(a, 'botao:A'), 'mk_icone') && digitais(ev1(a, 'botao:B')).some(p => p.v === 0);
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega em A e conta até 3; depois A e logo B.',
      regras: [
        P.evento('botao:A', 'Quem acende o candeeiro?'),
        P.regra('a_sem_acender', a => !!ev1(a, 'botao:A') && !digitais(ev1(a, 'botao:A')).some(p => p.v === 1), [
          'Carregas no A e a luz… nada?', 'O bloco «gravação digital» liga o pino.', 'Põe «gravação digital pin P2 para 1» no A.'], 'Luz!'),
        P.regra('a_sem_apagar', a => digitais(ev1(a, 'botao:A')).some(p => p.v === 1) && !digitais(ev1(a, 'botao:A')).some(p => p.v === 0), [
          'A luz fica acesa para sempre… quem a apaga?', 'No fim do A a luz tem de voltar a 0.', 'Põe «gravação digital pin P2 para 0» no fim do A.'], 'Já apaga!'),
        P.regra('ordem_pausa', a => {
          const pa = ev1(a, 'botao:A').plano;
          const i1 = pa.findIndex(p => p.tipo === 'mk_digital' && p.v === 1), i0 = pa.findIndex((p, k) => k > i1 && p.tipo === 'mk_digital' && p.v === 0);
          const ip = pa.findIndex(p => p.tipo === 'mk_pausa');
          return i1 >= 0 && i0 > i1 && ip >= 0 && !(ip > i1 && ip < i0);
        }, [
          ['surpreendida', 'Ui! A luz pisca e apaga logo. A pausa está no sítio certo?'],
          'Os blocos correm de cima para baixo: acende, espera, apaga.',
          'Põe a pausa entre o «para 1» e o «para 0».'], 'Agora espera acesa!'),
        P.regra('sem_pausa', a => { const d = digitais(ev1(a, 'botao:A')); return d.some(p => p.v === 1) && d.some(p => p.v === 0) && !tem(ev1(a, 'botao:A'), 'mk_pausa'); }, [
          'Acende e apaga tão depressa que nem se vê… o que falta entre os dois?', 'Há um bloco azul que espera.', 'Põe «pausa (ms) 3000» entre o «para 1» e o «para 0».'], 'Já espera!'),
        P.regra('pausa_curta', a => blocos(ev1(a, 'botao:A'), 'mk_pausa').length > 0 && !blocos(ev1(a, 'botao:A'), 'mk_pausa').some(p => p.ms >= 2500), [
          'Dá para ler um livro com a luz tão pouco tempo acesa?', '1000 ms é 1 segundo.', 'Escolhe 3000 na pausa.'], 'Três segundos!'),
        P.bloco('botao:A', 'mk_icone', 'Às vezes a luz está fraca… e se o ecrã também mostrasse que está ligado?'),
        P.evento('botao:B', 'E se quiseres apagar já, sem esperar? Que botão usas?'),
        P.regra('b_sem_apagar', a => !!ev1(a, 'botao:B') && !digitais(ev1(a, 'botao:B')).some(p => p.v === 0), [
          'O B tem de desligar a luz.', '0 quer dizer desligado.', 'Põe «gravação digital pin P2 para 0» no B.'], 'B desliga!'),
      ],
      sucesso: 'Candeeiro restaurado, com temporizador e botão de desligar! Uma peça nova feita por ti e o candeeiro saiu do lixo.',
      extensao: 'Faz o logotipo dar mais luz: P2 para 1 durante 10 segundos.',
      gambiarra: { xml: GAMB.candeeiroT, pedido: 'O meu candeeiro pisca e apaga logo! Pus a pausa… mas onde?' },
    },
  };

  const SURDOS = {
    titulo: 'Campainha para quem não ouve',
    missao: 'Melhora a campainha: quando alguém toca, a luz pisca 3 vezes, ouve-se o toque e o ecrã avisa.',
    passos: [
      'Botão de alumínio no pin 1 e no GND; LED no pin 2.',
      'No pin 1: repetir 3 vezes: P2 para 1, tocar tom, P2 para 0, pausa.',
      'No fim, mostra um ícone a dizer «alguém está à porta».',
      'Experimenta: toca no pin 1 e conta os piscas.',
    ],
    material: 'micro:bit, LED, 4 crocodilos, papel de alumínio, cartão, esponja',
    novos: ['mk_repetir'],
    caixa: ['mk_pino_tocado', 'mk_digital_1', 'mk_digital_0', 'mk_tom', 'mk_pausa', 'mk_icone'],
    teste: 'pino:P1',
    ok: r => causou(r, s => s.filter(x => /^digital:P\d:1$/.test(x)).length >= 3 && s.filter(x => /^digital:P\d:0$/.test(x)).length >= 3 &&
      s.filter(x => x.startsWith('tom:')).length >= 3 && temIcone(s), v => v.startsWith('pino:')),
    tutor: {
      boasVindas: ['boas_vindas', 'Há quem não ouça a campainha. Vamos repará-la e melhorá-la: luz que pisca, som e aviso no ecrã!'],
      parecePronto: a => P.evs(a, 'pino:').some(e => {
        const dentroR = t => e.plano.some(p => p.dentroDe === 'mk_repetir' && t(p));
        return blocos(e, 'mk_repetir').some(p => p.n >= 3) && dentroR(p => p.tipo === 'mk_digital' && p.v === 1) && dentroR(p => p.tipo === 'mk_digital' && p.v === 0) &&
          dentroR(p => p.tipo === 'mk_tom') && tem(e, 'mk_icone');
      }),
      testar: 'Tens uma ideia? Vamos testar! Toca no pin 1 e conta os piscas.',
      regras: [
        P.evento('pino:', 'Quem fica à escuta do botão da campainha?'),
        P.regra('sem_repetir', a => P.evs(a, 'pino:').length > 0 && !P.evs(a, 'pino:').some(e => tem(e, 'mk_repetir')), [
          'Piscar 3 vezes é fazer a mesma coisa 3 vezes… há um bloco para isso?',
          'O bloco verde «repetir … vezes» faz o que está dentro várias vezes.',
          'Põe um «repetir 3 vezes» dentro de «no pin P1 premido».'], 'Já repete!'),
        P.regra('poucas_vezes', a => P.evs(a, 'pino:').some(e => blocos(e, 'mk_repetir').length > 0 && !blocos(e, 'mk_repetir').some(p => p.n >= 3)), [
          'Quantas vezes pisca? A missão pede 3.', 'O número do «repetir» diz quantas vezes.', 'Muda o «repetir» para 3.'], 'Três piscas!'),
        P.regra('sem_luz', a => P.evs(a, 'pino:').some(e => tem(e, 'mk_repetir')) && !P.evs(a, 'pino:').some(e => e.plano.some(p => p.dentroDe === 'mk_repetir' && p.tipo === 'mk_digital' && p.v === 1)), [
          'O repetir está lá… mas onde está a luz?', 'Dentro do repetir: liga o LED.', 'Põe «gravação digital pin P2 para 1» dentro do repetir.'], 'Luz!'),
        P.regra('nao_pisca', a => P.evs(a, 'pino:').some(e => e.plano.some(p => p.dentroDe === 'mk_repetir' && p.tipo === 'mk_digital' && p.v === 1)) &&
          !P.evs(a, 'pino:').some(e => e.plano.some(p => p.dentroDe === 'mk_repetir' && p.tipo === 'mk_digital' && p.v === 0)), [
          'A luz acende e fica acesa… isso é piscar?', 'Piscar é acender E apagar, cada vez.', 'Dentro do repetir, junta «P2 para 0» e uma pausa depois do tom.'], 'Já pisca!'),
        P.regra('sem_som', a => P.evs(a, 'pino:').some(e => tem(e, 'mk_repetir')) && !P.evs(a, 'pino:').some(e => e.plano.some(p => p.dentroDe === 'mk_repetir' && p.tipo === 'mk_tom')), [
          'Uma campainha muda ajuda quem não ouve… e quem não está a ver?', 'Um tom dentro do repetir toca a cada pisca.', 'Põe «tocar tom» dentro do repetir.'], 'Toca e pisca!'),
        P.bloco('pino:', 'mk_icone', 'Quando a campainha pára, como é que o ecrã avisa que está alguém à porta?'),
      ],
      sucesso: 'Campainha melhorada! Luz, som e ecrã: assim toda a gente sabe que alguém está à porta. Reparar também é pensar em quem usa.',
      extensao: 'Faz o B tocar outra melodia: assim sabes se é a porta da frente ou a das traseiras.',
      gambiarra: { xml: GAMB.surdos, pedido: 'A minha campainha acende a luz mas não pisca — fica sempre acesa! Que gambiarra fiz?' },
    },
  };

  const CODIGO = {
    titulo: 'Fechadura com código',
    missao: 'A fechadura da caixa avariou: faz uma nova com código — 3 toques no A e depois B abre; código errado, não abre.',
    passos: [
      'Servo no pin 0 a fazer de trinco (um palito colado ao braço).',
      'No A: mudar contador em 1.',
      'No B: se contador = 3 → servo P0 para 90 e ✔; senão → servo para 0 e ✗.',
      'No fim do B: definir contador para 0 (o código recomeça).',
      'Experimenta: A, A, A, B; depois A, B.',
    ],
    material: 'micro:bit, servo SG90, 3 crocodilos, uma caixa de cartão com tampa, palito',
    novos: [],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_mudar', 'mk_var_definir', 'mk_var', 'mk_se_senao', 'mk_comparar', 'mk_servo', 'mk_icone_sim', 'mk_icone_nao', 'mk_iniciar'],
    teste: 'botao:B',
    ok: r => {
      let n = 0, abriu = false, recusou = false, mal = false;
      for (let i = 0; i < r.length; i++) {
        const e = r[i];
        if (e.dir === 'out' && /^var:[^:]+:/.test(e.v)) { n = Number(e.v.split(':').pop()); continue; }
        if (e.dir !== 'in' || e.v !== 'botao:B') continue;
        const s = [];
        for (let j = i + 1; j < r.length && r[j].dir === 'out'; j++) s.push(r[j].v);
        const abre = servoAng(s).some(x => x >= 60);
        if (n === 3) { if (abre && s.includes('icone:Yes')) abriu = true; else mal = true; }
        else if (!abre && s.includes('icone:No')) recusou = true; else mal = true;
        if (!s.some(x => /^var:[^:]+:0$/.test(x))) mal = true;
      }
      return abriu && recusou && !mal;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'A caixa dos tesouros perdeu a fechadura. Vamos fazer uma nova — com código secreto!'],
      parecePronto: a => {
        const p = umSe(ev1(a, 'botao:B'), 'mk_var');
        return tem(ev1(a, 'botao:A'), 'mk_var_mudar') && !!p && (p.usa || []).some(u => u.tipo === 'mk_num' && u.n === 3) &&
          ramoTem(p.sim, 'mk_servo') && tem(ev1(a, 'botao:B'), 'mk_var_definir');
      },
      testar: 'Tens uma ideia? Vamos testar! A, A, A, B… depois A, B.',
      regras: [
        P.evento('botao:A', 'O código são toques no A. Quem fica à escuta?'),
        P.bloco('botao:A', 'mk_var_mudar', 'Como é que o micro:bit conta os toques do código?'),
        P.evento('botao:B', 'Depois do código, que botão tenta abrir?'),
        P.regra('b_sem_se', a => !!ev1(a, 'botao:B') && !umSe(ev1(a, 'botao:B')), [
          'A fechadura só abre com o código certo. Como é que o micro:bit decide?',
          'O «se … então … senão» separa o código certo do errado.',
          'Põe um «se … então … senão» no B.'], 'Já decide!'),
        P.regra('b_sem_var', a => !!umSe(ev1(a, 'botao:B')) && !umSe(ev1(a, 'botao:B'), 'mk_var'), [
          'O «se» pergunta o quê? Onde está guardado o número de toques?',
          'A variável contador guarda os toques.',
          'No «se», compara «contador = 3».'], 'Agora lê o código!'),
        P.regra('numero_codigo', a => { const p = umSe(ev1(a, 'botao:B'), 'mk_var'); return !!p && !(p.usa || []).some(u => u.tipo === 'mk_num' && u.n === 3); }, [
          'O código são 3 toques. Que número está no «se»?', 'Compara com 3.', 'Muda o número da comparação para 3.'], 'Código certo!'),
        P.regra('sem_servo', a => !!umSe(ev1(a, 'botao:B')) && !ramoTem(umSe(ev1(a, 'botao:B')).sim, 'mk_servo'), [
          'Código certo… e o trinco não se mexe?', 'O servo é o trinco: 90 abre.', 'Põe «escrever servo pin P0 para 90» no «então».'], 'Abre!'),
        P.regra('sem_reset', a => !!umSe(ev1(a, 'botao:B')) && !tem(ev1(a, 'botao:B'), 'mk_var_definir'), [
          'Depois de tentar uma vez, a conta fica a crescer para sempre… como volta ao início?',
          'Depois de verificar, o contador tem de voltar a 0.',
          'Põe «definir contador para 0» no fim do B.'], 'O código recomeça!'),
      ],
      sucesso: 'Fechadura com código feita! Foi trocada uma peça partida por uma inteligente — e sem código errado ninguém abre a caixa.',
      extensao: 'Muda o código para «2 toques no A e 1 no logotipo» com duas variáveis.',
      gambiarra: { xml: GAMB.codigo, pedido: 'A minha fechadura abriu uma vez e nunca mais! Já carreguei 3 vezes no A e nada. O que me esqueci?' },
    },
  };

  const VENTOINHA = {
    titulo: 'Ventoinha reparada',
    missao: 'A ventoinha avariou: com um servo e o termómetro do micro:bit, liga sozinha quando está calor e acende uma luz.',
    passos: [
      'Hélice de cartão no servo (pin 0); LED no pin 2.',
      '«para sempre»: se temperatura > 28 → servo P0 para 180 e P2 para 1.',
      'Senão → servo para 0 e P2 para 0.',
      'Experimenta: sobe e desce a temperatura no ecrã (ou aquece o micro:bit com as mãos).',
    ],
    material: 'micro:bit, servo SG90, LED, 5 crocodilos, cartão para a hélice',
    novos: ['mk_temperatura'],
    caixa: ['mk_sempre', 'mk_se_senao', 'mk_comparar', 'mk_servo', 'mk_digital_1', 'mk_digital_0', 'mk_pausa'],
    teste: 'temperatura',
    ok: r => aposSensor(r, 'temperatura', v => v > 28, s => servoAng(s).some(x => x >= 150) && dig(s, 1)) &&
      aposSensor(r, 'temperatura', v => v <= 28, s => servoAng(s).some(x => x <= 30) && dig(s, 0)),
    tutor: {
      boasVindas: ['boas_vindas', 'O motor desta ventoinha queimou-se. Vamos pôr-lhe um servo e um cérebro: ela própria decide quando está calor!'],
      parecePronto: a => {
        const p = umSe(ev1(a, 'sempre'), 'mk_temperatura');
        return !!p && verdade(p, 'mk_temperatura', 35) === true && verdade(p, 'mk_temperatura', 20) === false &&
          ramoTem(p.sim, 'mk_servo') && ramoTem(p.sim, 'mk_digital', x => x.v === 1) && ramoTem(p.nao, 'mk_servo') && ramoTem(p.nao, 'mk_digital', x => x.v === 0);
      },
      testar: 'Tens uma ideia? Vamos testar! Sobe a temperatura acima de 28 e depois desce.',
      regras: [
        regraSempre('A ventoinha tem de estar sempre a sentir a temperatura. Que bloco repete?'),
        P.regra('t_sem_se', a => !!ev1(a, 'sempre') && !umSe(ev1(a, 'sempre')), [
          'Ligar ou desligar depende do calor. Como é que o micro:bit escolhe?', 'O «se … então … senão» tem um caminho para o calor e outro para o fresco.', 'Põe um «se … então … senão» no «para sempre».'], 'Já decide!'),
        P.regra('sem_temperatura', a => !!umSe(ev1(a, 'sempre')) && !umSe(ev1(a, 'sempre'), 'mk_temperatura'), [
          'O «se» pergunta o quê? Quem sente o calor?', 'O bloco cor-de-rosa «temperatura (°C)».', 'Põe «temperatura (°C) > 28» no «se».'], 'Sente o calor!'),
        P.regra('sinal_trocado', a => { const p = umSe(ev1(a, 'sempre'), 'mk_temperatura'); return !!p && verdade(p, 'mk_temperatura', 20) === true && verdade(p, 'mk_temperatura', 35) === false; }, [
          ['surpreendida', 'Ui! A ventoinha liga no frio?'], '«>» quer dizer maior do que.', 'Usa «temperatura > 28».'], 'Agora sim!'),
        P.regra('sem_servo', a => !!umSe(ev1(a, 'sempre')) && !ramoTem(umSe(ev1(a, 'sempre')).sim, 'mk_servo'), [
          'Está calor… e a hélice não roda?', 'O servo é o motor novo.', 'Põe «escrever servo pin P0 para 180» no «então».'], 'Roda!'),
        P.regra('sem_luz', a => !!umSe(ev1(a, 'sempre')) && !ramoTem(umSe(ev1(a, 'sempre')).sim, 'mk_digital', x => x.v === 1), [
          'Como sabes, de longe, que a ventoinha está ligada?', 'O LED no pin 2 pode ser a luz de «ligada».', 'Põe «gravação digital pin P2 para 1» no «então».'], 'Luz de ligada!'),
        P.regra('senao_vazio', a => { const p = umSe(ev1(a, 'sempre')); return !!p && !(ramoTem(p.nao, 'mk_servo') && ramoTem(p.nao, 'mk_digital', x => x.v === 0)); }, [
          'Quando arrefece, a ventoinha continua ligada… quem a desliga?', 'O «senão» é para quando não está calor.', 'No «senão»: servo para 0 e P2 para 0.'], 'Desliga sozinha!'),
      ],
      sucesso: 'Ventoinha reparada e mais esperta do que a original! Liga só quando é preciso: poupa energia e barulho.',
      extensao: 'Mostra a temperatura no ecrã quando carregas em A.',
      gambiarra: { xml: GAMB.ventoinha, pedido: 'A minha ventoinha liga com o calor, mas nunca mais desliga! Que gambiarra fiz?' },
    },
  };

  const MUSICAL = {
    titulo: 'Caixinha de música reparada',
    missao: 'A caixinha de música estava muda e a bailarina parada: festa no logotipo e ela toca uma melodia, a bailarina dança e a luz pisca.',
    passos: [
      'Bailarina de cartão no servo (pin 0); LED no pin 2.',
      '«ao logotipo pressionado»: repetir 2 vezes: servo 0, dois tons, P2 para 1, servo 180, dois tons, P2 para 0.',
      'Usa pelo menos 3 notas diferentes: é uma melodia, não um apito!',
      'Experimenta: toca no logotipo.',
    ],
    material: 'micro:bit V2, servo SG90, LED, 5 crocodilos, uma caixinha velha, cartão',
    novos: [],
    caixa: ['mk_logo', 'mk_repetir', 'mk_tom', 'mk_servo', 'mk_digital_1', 'mk_digital_0', 'mk_pausa', 'mk_som'],
    teste: 'logo',
    ok: r => causou(r, s => {
      const toms = s.filter(x => x.startsWith('tom:'));
      return toms.length >= 4 && new Set(toms).size >= 3 && new Set(servoAng(s)).size >= 2 && dig(s, 1) && dig(s, 0);
    }, v => v === 'logo'),
    tutor: {
      boasVindas: ['boas_vindas', 'Esta caixinha de música era da avó e estava muda. Vamos devolver-lhe a música, a dança e ainda uma luz!'],
      parecePronto: a => {
        const e = ev1(a, 'logo');
        return !!e && new Set(blocos(e, 'mk_tom').map(p => p.freq)).size >= 3 && new Set(blocos(e, 'mk_servo').map(p => p.angulo)).size >= 2 &&
          digitais(e).some(p => p.v === 1) && digitais(e).some(p => p.v === 0);
      },
      testar: 'Tens uma ideia? Vamos testar! Toca no logotipo.',
      regras: [
        P.evento('logo', 'A caixinha acorda com uma festa. Que bloco fica à escuta do logotipo?'),
        P.regra('sem_melodia', a => !!ev1(a, 'logo') && new Set(blocos(ev1(a, 'logo'), 'mk_tom').map(p => p.freq)).size < 3, [
          'Uma melodia com uma ou duas notas é um apito… quantas notas tem uma música?',
          'Usa vários «tocar tom» com notas diferentes.',
          'Junta tons até teres pelo menos 3 notas diferentes.'], 'Já é melodia!'),
        P.bloco('logo', 'mk_servo', 'A música já toca. E a bailarina?'),
        P.regra('servo_parado', a => blocos(ev1(a, 'logo'), 'mk_servo').length > 0 && new Set(blocos(ev1(a, 'logo'), 'mk_servo').map(p => p.angulo)).size < 2, [
          'A bailarina vai para um sítio e fica lá… como é que dança?', 'Dançar é ir e voltar: dois ângulos diferentes.', 'Põe um servo a 0 e outro a 180.'], 'Dança!'),
        P.regra('sem_luz', a => !!ev1(a, 'logo') && !digitais(ev1(a, 'logo')).some(p => p.v === 1), [
          'E a luzinha da caixinha?', 'O LED está no pin 2.', 'Põe «gravação digital pin P2 para 1» na dança.'], 'Luz!'),
        P.regra('sem_apagar', a => digitais(ev1(a, 'logo')).some(p => p.v === 1) && !digitais(ev1(a, 'logo')).some(p => p.v === 0), [
          'A luz acende e fica acesa… e se piscasse com a música?', 'Piscar é acender e apagar.', 'Junta «P2 para 0» depois dos tons.'], 'Pisca a dançar!'),
      ],
      sucesso: 'Caixinha de música reparada! Melodia, dança e luz — a avó vai gostar. Às vezes reparar é dar vida nova com peças diferentes.',
      extensao: 'Faz o agitar tocar outra música, mais rápida.',
      gambiarra: { xml: GAMB.musical, pedido: 'A minha caixinha de música só sabe uma nota! A bailarina dança, mas a música é um apito. Ajudas-me?' },
    },
  };

  // ---------------------------------------------------------------- Nível 3
  const regrasDuasContas = () => [
    P.evento('botao:A', 'Um objeto reparado! Que botão carregas?'),
    P.bloco('botao:A', 'mk_var_mudar', 'Quem soma 1 aos reparados?'),
    P.evento('botao:B', 'E o que não teve arranjo? Que botão usas?'),
    P.bloco('botao:B', 'mk_var_mudar', 'O B também tem de ir contando.'),
    P.regra('mesma_var', a => {
      const va = varsMudadas(ev1(a, 'botao:A')), vb = varsMudadas(ev1(a, 'botao:B'));
      return va.length > 0 && vb.length > 0 && va.some(x => vb.includes(x));
    }, [['surpreendida', 'Ui! As duas contas estão a ir para a mesma variável?'], 'Cada conta precisa da sua variável.', 'No B, escolhe a variável «pontos».'], 'Duas contas!'),
  ];

  const BALCAO = {
    titulo: 'Balcão do Repair Café',
    missao: 'O balcão do Repair Café: A conta os reparados, B os que vão para a reciclagem e A+B mostra e regista o total do dia.',
    passos: [
      'No A: mudar contador em 1. No B: mudar pontos em 1.',
      'No A+B: mostrar número de contador + pontos.',
      'Ainda no A+B: registar dados «total» = contador + pontos.',
      'Experimenta: A, A, B e depois A+B (tem de dar 3).',
    ],
    material: 'micro:bit V2 (e uma mesa de Repair Café!)',
    novos: ['mk_botao_AB'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_mudar', 'rp_mudar_pontos', 'mk_var', 'rp_var_pontos', 'mk_conta', 'mk_mostrar_numero', 'mk_registar', 'mk_iniciar', 'mk_var_definir'],
    teste: 'botao:AB',
    // total certo no A+B, e o A e o B a contar em variáveis diferentes
    ok: r => {
      const nomes = botao => new Set(r.flatMap((e, i) => {
        if (e.dir !== 'in' || e.v !== botao) return [];
        const s = []; for (let j = i + 1; j < r.length && r[j].dir === 'out'; j++) s.push(r[j].v);
        return s.filter(x => x.startsWith('var:')).map(x => x.split(':')[1]);
      }));
      const va = nomes('botao:A'), vb = nomes('botao:B');
      return causou(r, s => s.includes('numero:3') && s.some(x => /^registo:[^:]*:3$/.test(x)), v => v === 'botao:AB') &&
        causou(r, s => s.includes('numero:5') && s.some(x => /^registo:[^:]*:5$/.test(x)), v => v === 'botao:AB') &&
        va.size > 0 && vb.size > 0 && ![...va].some(x => vb.has(x));
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Fim do dia no Repair Café! Quantos objetos passaram pelo balcão? Vamos contar e registar o total.'],
      parecePronto: a => dentro(ev1(a, 'botao:AB'), 'mk_mostrar_numero', 'mk_conta') && dentro(ev1(a, 'botao:AB'), 'mk_registar', 'mk_conta') &&
        tem(ev1(a, 'botao:A'), 'mk_var_mudar') && tem(ev1(a, 'botao:B'), 'mk_var_mudar'),
      testar: 'Tens uma ideia? Vamos testar! A, A, B e depois A+B.',
      regras: [
        ...regrasDuasContas(),
        P.evento('botao:AB', 'E o total do dia? Que botão usas para o pedir?'),
        P.bloco('botao:AB', 'mk_mostrar_numero', 'O total tem de aparecer no ecrã.'),
        P.valorEm('botao:AB', 'mk_mostrar_numero', 'mk_conta', 'O total é a soma das duas contas. Que bloco faz contas?'),
        P.bloco('botao:AB', 'mk_registar', 'O total do dia tem de ficar escrito na tabela.'),
        P.valorEm('botao:AB', 'mk_registar', 'mk_conta', 'Na tabela fica o quê? O total é a soma das duas contas.'),
      ],
      sucesso: 'Balcão a funcionar! No fim do dia sabes quantos objetos passaram pelo Repair Café — e a tabela guarda a história.',
      extensao: 'Regista também as duas contas separadas, para veres a evolução ao longo do dia.',
      gambiarra: { xml: GAMB.balcao, pedido: 'O meu balcão diz que o total do dia é 2, mas foram 3 objetos! Onde está a gambiarra?' },
    },
  };

  const TAXA = {
    titulo: 'Taxa de reparação',
    missao: 'Em cada 100 objetos, quantos se salvam? A conta os reparados, B os que não tiveram arranjo e o logotipo mostra a percentagem.',
    passos: [
      'No A: mudar contador em 1. No B: mudar pontos em 1.',
      'No logotipo: mostrar número de (contador × 100) ÷ (contador + pontos).',
      'Constrói a conta por partes: uma conta dentro de outra.',
      'Experimenta: A, A, A, B e logotipo — tem de dar 75.',
    ],
    material: 'micro:bit',
    novos: ['mk_logo'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_mudar', 'rp_mudar_pontos', 'mk_var', 'rp_var_pontos', 'mk_conta', 'rp_conta_vezes', 'rp_conta_dividir', 'mk_mostrar_numero', 'mk_iniciar', 'mk_var_definir'],
    teste: 'logo',
    ok: r => causou(r, s => s.includes('numero:75'), v => v === 'logo') && causou(r, s => s.includes('numero:80'), v => v === 'logo'),
    tutor: {
      boasVindas: ['boas_vindas', 'Desafio de contas a sério: qual é a percentagem de objetos que o Repair Café salva do lixo?'],
      parecePronto: a => {
        const o = ops(ev1(a, 'logo'));
        return tem(ev1(a, 'logo'), 'mk_mostrar_numero') && o.includes('*') && o.includes('/') && o.includes('+') && tem(ev1(a, 'botao:A'), 'mk_var_mudar') && tem(ev1(a, 'botao:B'), 'mk_var_mudar');
      },
      testar: 'Tens uma ideia? Vamos testar! A, A, A, B e logotipo.',
      regras: [
        ...regrasDuasContas(),
        P.evento('logo', 'Quem mostra a percentagem? Usa o logotipo.'),
        P.bloco('logo', 'mk_mostrar_numero', 'A percentagem tem de aparecer no ecrã.'),
        P.regra('sem_dividir', a => tem(ev1(a, 'logo'), 'mk_mostrar_numero') && !ops(ev1(a, 'logo')).includes('/'), [
          'Percentagem quer dizer «em cada 100». Reparados × 100… e depois?',
          'Divide pelo total de objetos (reparados + não reparados).',
          'Usa uma conta «÷» com «contador + pontos» do lado direito.'], 'Já divide!'),
        P.regra('divide_mal', a => ops(ev1(a, 'logo')).includes('/') && !ops(ev1(a, 'logo')).includes('+'), [
          ['surpreendida', 'Ui! Dá mais de 100%? Estás a dividir por quê?'],
          'O total é reparados + não reparados.',
          'Divide por «contador + pontos».'], 'Total certo!'),
        P.regra('sem_vezes100', a => ops(ev1(a, 'logo')).includes('/') && !ops(ev1(a, 'logo')).includes('*'), [
          'Dá um número pequenino, como 0,75… o que falta para ser percentagem?',
          'Percentagem: multiplica por 100.',
          'Faz «contador × 100» antes de dividir.'], 'Percentagem!'),
      ],
      sucesso: 'Taxa de reparação calculada! Nos Repair Cafés a sério, mais de metade dos objetos volta para casa a funcionar.',
      extensao: 'Faz o micro:bit mostrar uma cara contente quando a taxa passa de 50.',
      gambiarra: { xml: GAMB.taxa, pedido: 'A minha taxa diz 300%! Isso não pode ser… Encontras a gambiarra?' },
    },
  };

  const PRESENCA = {
    titulo: 'Luz que ouve',
    missao: 'Poupa energia no corredor: um barulho (bater palmas) acende a luz e ela apaga sozinha 3 segundos depois.',
    passos: [
      'LED no pin 2 (perna comprida) e GND.',
      '«em som alto»: P2 para 1 e definir medida para tempo de execução.',
      '«para sempre»: se tempo de execução − medida > 3000 → P2 para 0.',
      'Experimenta: bate palmas no ecrã e espera.',
    ],
    material: 'micro:bit V2 (tem microfone), LED, 2 crocodilos',
    novos: ['mk_som_alto'],
    caixa: ['mk_digital_1', 'mk_digital_0', 'mk_sempre', 'mk_se_entao', 'mk_comparar', 'mk_conta', 'mk_tempo', 'rp_definir_medida', 'rp_var_medida', 'mk_iniciar'],
    teste: 'somalto',
    ok: r => acendeEApaga(r, 'somalto', 2000),
    tutor: {
      boasVindas: ['boas_vindas', 'Luzes acesas sem ninguém é energia deitada fora. Vamos fazer uma luz de corredor que acende com palmas!'],
      parecePronto: a => digitais(ev1(a, 'somalto')).some(p => p.v === 1) && dentro(ev1(a, 'somalto'), 'mk_var_definir', 'mk_tempo') &&
        ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_conta') && usa(p, 'mk_tempo') && (p.usa || []).some(u => u.op === '>' || u.op === '>=')) &&
        digitais(ev1(a, 'sempre')).some(p => p.v === 0),
      testar: 'Tens uma ideia? Vamos testar! Bate palmas no ecrã e conta até 3.',
      regras: [
        P.evento('somalto', 'Quem é que ouve as palmas?'),
        P.regra('a_sem_acender', a => !!ev1(a, 'somalto') && !digitais(ev1(a, 'somalto')).some(p => p.v === 1), [
          'Bates palmas e a luz… nada?', 'O bloco «gravação digital» liga o pino.', 'Põe «gravação digital pin P2 para 1» no «em som alto».'], 'Luz!'),
        P.regra('sem_guardar_tempo', a => !!ev1(a, 'somalto') && !dentro(ev1(a, 'somalto'), 'mk_var_definir', 'mk_tempo'), [
          'Para apagar 3 segundos depois, de quando é que tens de te lembrar?', 'Guarda a hora das palmas: «definir medida para tempo de execução».', 'No «em som alto», junta «definir medida para» com «tempo de execução».'], 'Hora guardada!'),
        P.evento('sempre', 'Quem vai olhando para o relógio?'),
        P.regra('sem_se', a => !!ev1(a, 'sempre') && ses(ev1(a, 'sempre')).length === 0, [
          'A luz só apaga quando passou o tempo. Quem decide?', 'O «se … então» só faz quando é verdade.', 'Põe um «se … então» no «para sempre».'], 'Já decide!'),
        P.regra('sem_conta', a => ses(ev1(a, 'sempre')).length > 0 && !ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_conta')), [
          'Quanto tempo passou desde as palmas? Como se calcula?', 'Tempo de agora − tempo guardado.', 'No «se», compara «tempo de execução − medida» com 3000.'], 'Boa conta!'),
        P.regra('sinal_trocado', a => ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_conta') && (p.usa || []).some(u => u.op === '<' || u.op === '<=')), [
          ['surpreendida', 'Ui! Apaga logo, sem esperar?'], 'Queremos apagar quando o tempo que passou é MAIOR do que 3000.', 'Muda o «<» para «>».'], 'Agora espera!'),
        P.regra('sem_apagar', a => ses(ev1(a, 'sempre')).length > 0 && !digitais(ev1(a, 'sempre')).some(p => p.v === 0), [
          'O tempo passa… e quem apaga a luz?', 'Dentro do «se» é que se apaga.', 'Põe «gravação digital pin P2 para 0» dentro do «se».'], 'Apaga sozinha!'),
      ],
      sucesso: 'Luz que ouve! Só gasta energia quando há alguém. Cada palma dá mais 3 segundos de luz.',
      extensao: 'Mostra no ecrã quantas vezes a luz acendeu hoje (com o contador).',
      gambiarra: { xml: GAMB.presenca, pedido: 'Bato palmas e a luz pisca e apaga logo! O que me esqueci?' },
    },
  };

  const SEGURO = {
    titulo: 'Carregador seguro',
    missao: 'Um carregador que aquece demais desliga-se sozinho: o micro:bit corta a energia, toca o alarme e regista a temperatura.',
    passos: [
      'O LED no pin 2 faz de «energia ligada».',
      '«para sempre»: se temperatura > 40 → P2 para 0, tocar tom e registar dados «quente» = temperatura.',
      'Senão → P2 para 1.',
      'Experimenta: sobe a temperatura acima de 40 e depois desce.',
    ],
    material: 'micro:bit V2, LED, 2 crocodilos',
    novos: [],
    caixa: ['mk_sempre', 'mk_se_senao', 'mk_comparar', 'mk_temperatura', 'mk_digital_1', 'mk_digital_0', 'mk_tom', 'mk_registar', 'mk_pausa', 'mk_icone_nao'],
    teste: 'temperatura',
    ok: r => aposSensor(r, 'temperatura', v => v > 40, s => dig(s, 0) && temTom(s) && s.some(x => /^registo:[^:]*:-?[\d.]+$/.test(x) && Number(x.split(':').pop()) > 40)) &&
      aposSensor(r, 'temperatura', v => v <= 40, s => dig(s, 1) && !temTom(s)),
    tutor: {
      boasVindas: ['boas_vindas', 'Último projeto do nível: um carregador seguro, que se protege a si próprio. Cuidar dos aparelhos também é reparar!'],
      parecePronto: a => {
        const p = umSe(ev1(a, 'sempre'), 'mk_temperatura');
        return !!p && verdade(p, 'mk_temperatura', 45) === true && verdade(p, 'mk_temperatura', 25) === false &&
          ramoTem(p.sim, 'mk_digital', x => x.v === 0) && ramoTem(p.sim, 'mk_tom') && ramoTem(p.sim, 'mk_registar', x => usa(x, 'mk_temperatura')) && ramoTem(p.nao, 'mk_digital', x => x.v === 1);
      },
      testar: 'Tens uma ideia? Vamos testar! Sobe a temperatura acima de 40 e depois desce.',
      regras: [
        regraSempre('O carregador tem de estar sempre vigiado. Que bloco repete?'),
        P.regra('s_sem_se', a => !!ev1(a, 'sempre') && !umSe(ev1(a, 'sempre')), [
          'Ligado ou cortado depende do calor. Como decide?', 'O «se … então … senão» tem um caminho para cada caso.', 'Põe um «se … então … senão» no «para sempre».'], 'Já decide!'),
        P.regra('sem_temperatura', a => !!umSe(ev1(a, 'sempre')) && !umSe(ev1(a, 'sempre'), 'mk_temperatura'), [
          'O «se» pergunta o quê? Quem mede o calor?', 'O bloco cor-de-rosa «temperatura (°C)».', 'Põe «temperatura (°C) > 40» no «se».'], 'Mede o calor!'),
        P.regra('sinal_trocado', a => { const p = umSe(ev1(a, 'sempre'), 'mk_temperatura'); return !!p && verdade(p, 'mk_temperatura', 25) === true && verdade(p, 'mk_temperatura', 45) === false; }, [
          ['surpreendida', 'Ui! Corta a energia no fresco?'], '«>» quer dizer maior do que.', 'Usa «temperatura > 40».'], 'Agora sim!'),
        P.regra('sem_cortar', a => !!umSe(ev1(a, 'sempre')) && !ramoTem(umSe(ev1(a, 'sempre')).sim, 'mk_digital', x => x.v === 0), [
          'Está a ferver… e a energia continua ligada?', 'Cortar a energia é pôr o pino a 0.', 'Põe «gravação digital pin P2 para 0» no «então».'], 'Corta!'),
        P.regra('sem_alarme', a => !!umSe(ev1(a, 'sempre')) && !ramoTem(umSe(ev1(a, 'sempre')).sim, 'mk_tom'), [
          'Cortou… mas como é que alguém dá por isso?', 'Um tom avisa toda a gente.', 'Põe «tocar tom» no «então».'], 'Alarme!'),
        P.regra('registo_fixo', a => { const p = umSe(ev1(a, 'sempre')); return !!p && !ramoTem(p.sim, 'mk_registar', x => usa(x, 'mk_temperatura')); }, [
          'Para perceber a avaria mais tarde, o que convém ficar escrito?', 'Regista a temperatura a sério, não um número fixo.', 'Põe «registar dados quente = temperatura (°C)» no «então».'], 'Fica registado!'),
        P.regra('sem_religar', a => !!umSe(ev1(a, 'sempre')) && !ramoTem(umSe(ev1(a, 'sempre')).nao, 'mk_digital', x => x.v === 1), [
          'Quando arrefece, a energia volta?', 'O «senão» é para quando está tudo bem.', 'Põe «gravação digital pin P2 para 1» no «senão».'], 'Volta a ligar!'),
      ],
      sucesso: 'Carregador seguro! Corta, avisa e guarda a temperatura: assim percebes a avaria antes de estragar o aparelho.',
      extensao: 'Conta quantas vezes o carregador aqueceu demais e mostra no botão A.',
      gambiarra: { xml: GAMB.seguro, pedido: 'O meu carregador corta e apita, mas na tabela fica sempre 40, nunca a temperatura a sério! Que gambiarra fiz?' },
    },
  };

  F.registarMissao({
    id: 'reparar',
    titulo: 'Reparar',
    tema: 'Reparação e sustentabilidade',
    descricao: 'Diagnostica circuitos avariados, substitui as peças que falham e melhora e cuida dos objetos em vez de os deitar fora.',
    cor: '#fa6415',
    // blocos já preparados para a caixa (variáveis e contas com o valor certo)
    xml: {
      rp_mudar_pontos: '<block type="mk_var_mudar"><field name="VAR">pontos</field><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block>',
      rp_var_pontos: '<block type="mk_var"><field name="VAR">pontos</field></block>',
      rp_var_medida: '<block type="mk_var"><field name="VAR">medida</field></block>',
      rp_definir_medida: '<block type="mk_var_definir"><field name="VAR">medida</field><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
      rp_conta_vezes: '<block type="mk_conta"><field name="OP">*</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="mk_num"><field name="NUM">100</field></shadow></value></block>',
      rp_conta_dividir: '<block type="mk_conta"><field name="OP">/</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block>',
    },
    // 1–6: desafios curtos · 7–11: projetos de 15–20 minutos · 12.º: projeto livre (gerado pelo motor)
    niveis: [
      { nome: 'Nível 1 · Diagnosticar', desafios: [DETETIVE, BIP, CONDUTIVIDADE, CONDUTOR, PILHA, FIOS, SEMAFORO, BANCO, DIAGNOSTICO, CANTA, INVENTARIO] },
      { nome: 'Nível 2 · Substituir a peça', desafios: [LANTERNA, CAMPAINHA, PELUCHE, ESCADA, CANDEEIRO, SERVO, CANDEEIRO_T, SURDOS, CODIGO, VENTOINHA, MUSICAL] },
      { nome: 'Nível 3 · Melhorar e cuidar', desafios: [CONTADOR, FICHA, PORTA, CALOR, REGISTO, BRINQUEDO, POUPAR, BALCAO, TAXA, PRESENCA, SEGURO] },
    ],
    livres: [
      { titulo: 'Projeto livre: o meu testador', missao: 'Inventa um testador ou um detetive de avarias com os blocos deste nível.', passos: ['Escolhe um objeto avariado lá de casa.', 'Inventa um teste que descubra o que falha.', 'Experimenta no ecrã e depois no micro:bit.'] },
      { titulo: 'Projeto livre: a peça nova', missao: 'Escolhe um objeto com uma peça avariada e inventa-lhe uma peça nova com o micro:bit.', passos: ['Que peça falhou? Um botão, uma luz, um motor?', 'Substitui-a com os blocos dos níveis 1 e 2.', 'Experimenta e mostra à turma.'] },
      { titulo: 'Inventa uma melhoria', missao: 'Escolhe um objeto da tua casa que podia ser melhor e inventa-lhe uma melhoria com o micro:bit.', passos: ['Desenha primeiro a ideia em papel.', 'Tens todos os blocos: sensores, luzes, sons, servo, contas e registos.', 'Experimenta no ecrã e depois no micro:bit.'] },
    ],
  });
})();
