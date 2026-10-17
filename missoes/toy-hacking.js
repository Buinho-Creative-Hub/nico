/* Missão «Toy hacking» — gambiarra e brinquedos.
 *
 * Abrir um brinquedo, perceber como funciona e reinventá-lo com o micro:bit: peluche com o micro:bit
 * lá dentro, abraço = interruptor de alumínio e esponja, festa no nariz = logotipo, a ambulância que
 * o micro:bit «ouve», tapete de pressão em vez de interruptor. Motores a sério precisam de relé ou
 * transístor: aqui usa-se o servomotor (SG90) e LEDs.
 *   Nível 1 · Abrir e perceber — eventos, sons, luzes, gestos.
 *   Nível 2 · Reinventar — servo, som alto, luz, «para sempre» + «se», piscas com pausas.
 *   Nível 3 · Inventar — variáveis, leitura de pinos, acaso, tempo.
 * Em cada nível: 11 desafios guiados (1–6 curtos; 7–11 projetos de 15–20 minutos) + o projeto livre
 * (12.º, gerado pelo motor). As gambiarras são escritas com testes/lib.js em testes/casos/toy-hacking.js
 * e copiadas para aqui — se mudares uma, muda-a lá e volta a copiar.
 * Textos para qualquer mascote: {ola}, [o|a], ou { nico: '…', gabi: '…', _: '…' }.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const P = F.pistas;
  const { icones, tem, blocos, dentro, soltoCom } = F.ajudasTutor;
  const { causou, visiveis, numeros, aposSensor, valorDe } = F.verif;

  // ------------------------------------------------------------ ajudas
  const pinos = a => a.eventosDe('pino:');
  const digitais = ev => blocos(ev, 'mk_digital');
  const servos = ev => blocos(ev, 'mk_servo');
  const algum = (lista, f) => lista.some(f);
  // saídas (com tempo) depois de cada entrada que cumpre ok, até à entrada seguinte
  function saidasApos(reg, ok) {
    const res = [];
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || !ok(reg[i].v)) continue;
      const o = [];
      for (let j = i + 1; j < reg.length && reg[j].dir === 'out'; j++) o.push(reg[j]);
      res.push(o);
    }
    return res;
  }
  // as saídas «prefixo» mudam com tempo suficiente entre elas (para se verem/mexerem a sério)
  const comPausas = (lista, minMs) => lista.every((e, k) => k === 0 || e.t - lista[k - 1].t >= minMs);
  const angulo = v => Number(String(v).split(':').pop());
  // um «se» (com ou sem senão) dentro do evento
  const ses = ev => ev ? ev.plano.filter(p => p.tipo === 'mk_se' || p.tipo === 'mk_se_entao') : [];
  const ramo = (s, k) => s[k] || [];

  // ------------------------------------------------------------ blocos extra da caixa
  const N = (nome, v) => `<value name="${nome}"><shadow type="mk_num"><field name="NUM">${v}</field></shadow></value>`;
  const XML = {
    th_gesto_cima: '<block type="mk_gesto"><field name="G">face up</field></block>',
    th_pino_p0: '<block type="mk_pino_tocado"><field name="P">P0</field></block>',
    th_tom_meia: '<block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value></block>',
    th_pausa_500: '<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">500</field></shadow></value></block>',
    th_servo_0: '<block type="mk_servo"><field name="P">P0</field>' + N('A', 0) + '</block>',
    th_servo_180: '<block type="mk_servo"><field name="P">P0</field>' + N('A', 180) + '</block>',
    th_comparar_maior: '<block type="mk_comparar"><field name="OP">&gt;</field>' + N('A', 0) + N('B', 128) + '</block>',
    th_comparar_igual: '<block type="mk_comparar"><field name="OP">==</field>' + N('A', 0) + N('B', 1) + '</block>',
    th_aleatorio_servo: '<block type="mk_aleatorio">' + N('A', 0) + N('B', 10) + '</block>',
    th_definir_vidas: '<block type="mk_var_definir"><field name="VAR">vidas</field>' + N('V', 3) + '</block>',
    th_mudar_vidas: '<block type="mk_var_mudar"><field name="VAR">vidas</field>' + N('V', -1) + '</block>',
    th_var_vidas: '<block type="mk_var"><field name="VAR">vidas</field></block>',
    th_comparar_vidas: '<block type="mk_comparar"><field name="OP">==</field>' + N('A', 0) + N('B', 0) + '</block>',
    th_definir_medida: '<block type="mk_var_definir"><field name="VAR">medida</field>' + N('V', 0) + '</block>',
    th_var_medida: '<block type="mk_var"><field name="VAR">medida</field></block>',
    th_conta_menos: '<block type="mk_conta"><field name="OP">-</field>' + N('A', 0) + N('B', 0) + '</block>',
    th_icone_pateta: '<block type="mk_icone"><field name="I">Silly</field></block>',
    th_comparar_luz: '<block type="mk_comparar"><field name="OP">&gt;</field>' + N('A', 0) + N('B', 100) + '</block>',
    th_digital_p1_1: '<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P1</field></shadow></value>' + N('V', 1) + '</block>',
    th_digital_p1_0: '<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P1</field></shadow></value>' + N('V', 0) + '</block>',
    th_definir_pontos0: '<block type="mk_var_definir"><field name="VAR">pontos</field>' + N('V', 0) + '</block>',
    th_definir_pontos5: '<block type="mk_var_definir"><field name="VAR">pontos</field>' + N('V', 5) + '</block>',
    th_mudar_pontos: '<block type="mk_var_mudar"><field name="VAR">pontos</field>' + N('V', 1) + '</block>',
    th_var_pontos: '<block type="mk_var"><field name="VAR">pontos</field></block>',
    th_comparar_pontos3: '<block type="mk_comparar"><field name="OP">&gt;=</field>' + N('A', 0) + N('B', 3) + '</block>',
    th_comparar_pontos5: '<block type="mk_comparar"><field name="OP">&gt;</field>' + N('A', 0) + N('B', 5) + '</block>',
    th_comparar_igual3: '<block type="mk_comparar"><field name="OP">==</field>' + N('A', 0) + N('B', 3) + '</block>',
    th_aleatorio_1_3: '<block type="mk_aleatorio">' + N('A', 1) + N('B', 3) + '</block>',
    th_aleatorio_pausa: '<block type="mk_aleatorio">' + N('A', 1000) + N('B', 3000) + '</block>',
    th_conta_div: '<block type="mk_conta"><field name="OP">/</field>' + N('A', 0) + N('B', 1000) + '</block>',
  };

  // ------------------------------------------------------------ mais ajudas (projetos grandes)
  const tons = o => o.filter(e => e.v.startsWith('tom:')).map(e => Number(e.v.slice(4)));
  const alterna = l => l.every((x, k) => k === 0 || x !== l[k - 1]);
  const temSom = o => o.some(e => e.v.startsWith('som:') || e.v.startsWith('tom:'));
  // pisca: quantas vezes um pino (ou qualquer um) passa a 1 e a 0
  function piscas(o, pino) {
    const d = o.filter(e => e.v.startsWith('digital:' + (pino ? pino + ':' : '')));
    const on = d.filter(e => e.v.endsWith(':1')).length;
    return { on, off: d.length - on, d };
  }
  // último valor digital escrito: [pino, valor]
  const ultimoDig = o => { const d = o.filter(e => e.v.startsWith('digital:')); return d.length ? d[d.length - 1].v.split(':').slice(1) : null; };
  const servoA = (o, f) => o.some(e => e.v.startsWith('servo:') && f(angulo(e.v)));
  const numDe = o => { const n = o.find(e => e.v.startsWith('numero:')); return n ? Number(n.v.slice(7)) : null; };
  const temIcone = (o, n) => o.some(e => e.v === 'icone:' + n);
  // ramos de um «se» (os blocos lá dentro)
  const ramoTem = (lista, f) => (lista || []).some(f);
  const seNo = ev => ses(ev)[0] || null;
  const comparacoes = (ev, ops) => ses(ev).some(s => (s.usa || []).some(u => u.tipo === 'mk_comparar' && ops.includes(u.op)));
  const temTom = ev => tem(ev, 'mk_tom') || tem(ev, 'mk_som');

  // ============================================================ NÍVEL 1 · Abrir e perceber
  const BOTAO_SECRETO = {
    titulo: 'Botão secreto',
    missao: 'Esconde um botão secreto no brinquedo: quando o circuito fecha, o brinquedo fala.',
    passos: ['Crocodilo no pin 1 e outro no GND: duas tiras de alumínio escondidas.', 'Dentro de «no pin P1 premido» põe «tocar som».', 'Experimenta: toca no pin 1.'],
    material: 'micro:bit, 2 crocodilos, papel de alumínio, um brinquedo velho',
    novos: ['mk_pino_tocado', 'mk_som'],
    teste: 'pino:P1',
    ok: r => causou(r, s => s.some(x => x.startsWith('som:')), v => v.startsWith('pino:')),
    tutor: {
      boasVindas: ['boas_vindas', '{ola} Hoje vamos abrir brinquedos e dar-lhes truques novos. Primeiro truque: um botão secreto que faz o brinquedo falar!'],
      parecePronto: a => pinos(a).some(e => tem(e, 'mk_som')),
      testar: 'Tens uma ideia? Vamos testar! Toca no pin 1, como quem carrega no botão secreto.',
      regras: [
        P.regra('som_fora', a => pinos(a).length > 0 && !pinos(a).some(e => tem(e, 'mk_som')) && soltoCom(a, 'mk_som'), [
          ['a_pensar', 'O som está ali sozinho, cá fora. Quando é que ele vai tocar?'],
          'Tudo o que fica fora de um bloco cor-de-rosa nunca corre.',
          'Encaixa «tocar som» dentro de «no pin P1 premido».',
        ], 'Encaixou! Já fazem equipa.'),
        P.evento('pino:', 'Um botão secreto é um circuito que se fecha quando lhe tocas. Como é que o micro:bit dá por isso?'),
        P.bloco('pino:', 'mk_som', 'O micro:bit já sente o botão secreto. E o brinquedo, como é que fala?'),
      ],
      sucesso: 'Botão secreto a funcionar! Ninguém vai perceber de onde vem a voz do brinquedo.',
      extensao: 'Esconde o alumínio debaixo de um tapete ou dentro de um livro. Quem descobre o botão?',
      gambiarra: {
        xml: '<xml><block type="mk_agitar" x="40" y="40"><statement name="DO"><block type="mk_som"><value name="S"><shadow type="mk_som_menu"><field name="V">hello</field></shadow></value></block></statement></block></xml>',
        pedido: 'Escondi o meu botão secreto… mas o brinquedo só fala quando o abano! Encontras a gambiarra?',
      },
    },
  };

  const PELUCHE_RI = {
    titulo: 'Peluche que ri',
    missao: 'Faz uma festa no nariz do peluche e ele ri-se e sorri.',
    passos: ['O micro:bit vai dentro do peluche, com o logotipo no nariz.', 'Em «ao logotipo pressionado»: o som «riso» e a cara contente.', 'Experimenta: toca no logotipo dourado.'],
    material: 'micro:bit V2, um peluche',
    novos: ['mk_logo', 'mk_icone'],
    caixa: ['mk_som', 'mk_pino_tocado'],
    teste: 'logo',
    ok: r => causou(r, s => s.includes('som:giggle') && s.includes('icone:Happy'), v => v === 'logo'),
    tutor: {
      boasVindas: ['boas_vindas', 'Este peluche tem cócegas no nariz! Vamos pô-lo a rir quando lhe fazes uma festa?'],
      parecePronto: a => !!a.evento('logo') && blocos(a.evento('logo'), 'mk_som').some(p => p.som === 'giggle') && icones(a.evento('logo'), 'Happy').length > 0,
      testar: 'Tens uma ideia? Vamos testar! Toca no logotipo, como uma festa no nariz.',
      regras: [
        P.evento('logo', 'O nariz do peluche é o logotipo dourado. Quem fica à escuta do logotipo?'),
        P.bloco('logo', 'mk_som', 'O peluche já sente a festa. E como é que ele se ri?'),
        P.regra('som_errado', a => blocos(a.evento('logo'), 'mk_som').length > 0 && !blocos(a.evento('logo'), 'mk_som').some(p => p.som === 'giggle'), [
          ['surpreendida', 'Esse som é de quem tem cócegas?'],
          'Carrega na setinha do som e procura um que se pareça com uma gargalhada.',
          'Escolhe o som «riso».',
        ], 'Ahahah! Agora sim.'),
        P.bloco('logo', 'mk_icone', 'Ouve-se o riso… e a cara do peluche, muda?'),
        P.regra('cara_errada', a => icones(a.evento('logo')).length > 0 && icones(a.evento('logo'), 'Happy').length === 0, [
          ['surpreendida', 'Que cara é essa para quem se está a rir?'],
          'Carrega na setinha do desenho para escolher outro.',
          'Escolhe a cara contente.',
        ], 'Agora sim, um sorriso!'),
      ],
      sucesso: 'O peluche ri-se! Transformaste um brinquedo parado num brinquedo com cócegas.',
      extensao: 'E se ele ficasse com cara de sono quando o deitas? Experimenta outro bloco cor-de-rosa.',
      gambiarra: {
        xml: '<xml><block type="mk_logo" x="40" y="40"><statement name="DO"><block type="mk_som"><value name="S"><shadow type="mk_som_menu"><field name="V">sad</field></shadow></value><next><block type="mk_icone"><field name="I">Happy</field></block></next></block></statement></block></xml>',
        pedido: 'Fiz cócegas ao meu peluche e ele… ficou triste! Acho que me enganei em alguma coisa. Ajudas-me?',
      },
    },
  };

  const DORME = {
    titulo: 'Brinquedo que dorme',
    missao: 'Quando deitas o brinquedo de barriga para baixo, ele dorme; quando o viras, acorda.',
    passos: ['Usa «em ecrã para baixo» com a cara a dormir.', 'Usa outro com «ecrã para cima» e a cara contente.', 'Experimenta com os botões por baixo do micro:bit.'],
    material: 'micro:bit, um brinquedo ou peluche',
    novos: ['mk_gesto_baixo', 'mk_icone_dormir', 'th_gesto_cima'],
    caixa: ['mk_icone'],
    teste: 'gesto:face down',
    sim: ['gesto:face down', 'gesto:face up'],
    ok: r => causou(r, s => s.includes('icone:Asleep'), v => v === 'gesto:face down') && causou(r, s => s.includes('icone:Happy'), v => v === 'gesto:face up'),
    tutor: {
      boasVindas: ['boas_vindas', 'Até os brinquedos precisam de dormir! Vamos ensinar este a deitar-se e a acordar?'],
      parecePronto: a => icones(a.evento('gesto:face down'), 'Asleep').length > 0 && icones(a.evento('gesto:face up'), 'Happy').length > 0,
      testar: 'Tens uma ideia? Vamos testar! Carrega em «Virar ao contrário» e depois em «Ecrã para cima».',
      regras: [
        P.evento('gesto:face down', 'Como é que o micro:bit sabe que o deitaste de barriga para baixo? Ele tem um sensor que sente para onde está virado…'),
        P.bloco('gesto:face down', 'mk_icone', 'O brinquedo já sente que está deitado. E a cara dele, muda?'),
        P.regra('nao_dorme', a => icones(a.evento('gesto:face down')).length > 0 && icones(a.evento('gesto:face down'), 'Asleep').length === 0, [
          ['surpreendida', 'Deitado e com essa cara? Assim ninguém dorme!'],
          'Há um desenho de olhos fechados na lista do ícone.',
          'No «ecrã para baixo», escolhe a cara a dormir.',
        ], 'Zzz… agora dorme.'),
        P.evento('gesto:face up', 'E para acordar? Que movimento faz o brinquedo quando o levantas?', 'Já sabe quando acorda!'),
        P.regra('nao_acorda', a => icones(a.evento('gesto:face up'), 'Happy').length === 0, [
          'Acordou… e está com que cara?',
          'Põe um «mostrar ícone» no «ecrã para cima».',
          'No «ecrã para cima», escolhe a cara contente.',
        ], 'Bom dia, brinquedo!'),
      ],
      sucesso: 'Dorme e acorda! O sensor de movimento (acelerómetro) sabe para onde o micro:bit está virado.',
      extensao: 'E se ele ressonasse um bocadinho quando adormece? Junta um som.',
      gambiarra: {
        xml: '<xml><block type="mk_gesto" x="40" y="40"><field name="G">face down</field><statement name="DO"><block type="mk_icone"><field name="I">Happy</field></block></statement></block><block type="mk_gesto" x="40" y="200"><field name="G">face up</field><statement name="DO"><block type="mk_icone"><field name="I">Asleep</field></block></statement></block></xml>',
        pedido: 'O meu brinquedo está trocado: deito-o e fica acordado, levanto-o e adormece! Que gambiarra fiz eu?',
      },
    },
  };

  const FAROIS = {
    titulo: 'Faróis do carrinho',
    missao: 'Põe faróis num carrinho velho: botão A acende, botão B apaga.',
    passos: ['LED: perna comprida no pin 2, perna curta no GND (crocodilos).', 'No botão A: «gravação digital pin P2 para 1». No B: «para 0».', 'Experimenta: A e depois B.'],
    material: 'micro:bit, 1 LED, 2 crocodilos, um carrinho de brinquedo',
    novos: ['mk_botao', 'mk_botao_B', 'mk_digital_1', 'mk_digital_0'],
    caixa: ['mk_icone'],
    teste: 'botao:A',
    ok: r => {
      const ultimo = (s, v) => { const d = s.filter(x => x.startsWith('digital:')); return d.length > 0 && d[d.length - 1].endsWith(':' + v) ? d[d.length - 1].split(':')[1] : null; };
      let pA = null, pB = null;
      causou(r, s => !!(pA = ultimo(s, 1)), v => v === 'botao:A');
      causou(r, s => !!(pB = ultimo(s, 0)), v => v === 'botao:B');
      return !!pA && pA === pB;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Este carrinho anda às escuras! Vamos dar-lhe faróis que se acendem e apagam?'],
      parecePronto: a => digitais(a.evento('botao:A')).some(p => p.v === 1) && digitais(a.evento('botao:B')).some(p => p.v === 0),
      testar: 'Tens uma ideia? Vamos testar! Carrega em A e depois em B.',
      regras: [
        P.evento('botao:A', 'Os faróis acendem-se quando o condutor carrega num botão. Que botão tem o micro:bit?'),
        P.bloco('botao:A', 'mk_digital', 'Carregas no A… e quem manda a eletricidade para o LED?'),
        P.regra('a_apaga', a => digitais(a.evento('botao:A')).length > 0 && !digitais(a.evento('botao:A')).some(p => p.v === 1), [
          ['surpreendida', 'O A apaga? Mas os faróis estavam apagados!'],
          '«para 1» quer dizer ligado; «para 0» quer dizer desligado.',
          'No botão A, põe «gravação digital pin P2 para 1».',
        ], 'Faróis acesos!'),
        P.evento('botao:B', 'Acender já está. E como se poupa a bateria do carrinho?', 'Já tens o botão para apagar!'),
        P.regra('b_nao_apaga', a => !digitais(a.evento('botao:B')).some(p => p.v === 0), [
          'Carregas no B e os faróis… continuam acesos?',
          'O B precisa de um «gravação digital» com outro número.',
          'No botão B, põe «gravação digital pin P2 para 0».',
        ], 'Isso, o B apaga!'),
      ],
      sucesso: 'Carrinho com faróis! Um LED, dois crocodilos e um brinquedo velho ganhou vida nova.',
      extensao: 'E se o A+B fizesse os faróis piscar três vezes, como quem diz «olá»?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement></block><block type="mk_botao" x="40" y="200"><field name="B">B</field><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P0</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block></statement></block></xml>',
        pedido: 'Os faróis do meu carrinho acendem… mas nunca mais apagam! Carrego no B e nada. Onde está a gambiarra?',
      },
    },
  };

  const SIRENE = {
    titulo: 'Sirene da ambulância',
    missao: 'A ambulância de brinquedo perdeu a sirene: faz uma nova com duas notas a trocar.',
    passos: ['No botão A, usa «repetir 4 vezes».', 'Lá dentro: duas notas diferentes, uma a seguir à outra.', 'Experimenta: carrega no A.'],
    material: 'micro:bit V2 (altifalante), uma ambulância de brinquedo',
    novos: ['mk_repetir', 'th_tom_meia'],
    caixa: ['mk_botao'],
    teste: 'botao:A',
    ok: r => causou(r, s => {
      const t = s.filter(x => x.startsWith('tom:'));
      return t.length >= 6 && t.every((x, k) => k === 0 || x !== t[k - 1]);
    }, v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', 'Ni-nó, ni-nó! Esta ambulância está muda. Vamos fazer-lhe uma sirene nova?'],
      parecePronto: a => { const ev = a.evento('botao:A'); return !!ev && blocos(ev, 'mk_repetir').length > 0 && new Set(blocos(ev, 'mk_tom').filter(p => p.dentroDe === 'mk_repetir').map(p => p.freq)).size >= 2; },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A e ouve a sirene.',
      regras: [
        P.evento('botao:A', 'Quem liga a sirene? Precisas de um botão à escuta…'),
        P.bloco('botao:A', 'mk_repetir', 'Uma sirene repete o mesmo «ni-nó» muitas vezes. Há algum bloco que repita por nós?'),
        P.regra('notas_fora', a => blocos(a.evento('botao:A'), 'mk_repetir').length > 0 && !blocos(a.evento('botao:A'), 'mk_tom').some(p => p.dentroDe === 'mk_repetir'), [
          ['a_pensar', 'O «repetir» está vazio. O que é que ele vai repetir?'],
          'As notas têm de ficar dentro da boca do «repetir».',
          'Põe dois «tocar tom» dentro do «repetir».',
        ], 'Agora o repetir tem trabalho!'),
        P.regra('mesma_nota', a => { const f = blocos(a.evento('botao:A'), 'mk_tom').filter(p => p.dentroDe === 'mk_repetir').map(p => p.freq); return f.length > 0 && new Set(f).size < 2; }, [
          ['curiosa', 'Ni-ni-ni-ni… Uma sirene a sério faz sempre a mesma nota?'],
          'A sirene troca entre uma nota alta e uma baixa.',
          'Muda a nota do segundo «tocar tom» (por exemplo Lá e Mi).',
        ], 'Ni-nó, ni-nó! Agora sim.'),
      ],
      sucesso: 'A ambulância tem sirene! Uma sirene é só duas notas repetidas — como uma pequena música.',
      extensao: 'E se a luz de emergência (um LED no pin 2) piscasse ao mesmo tempo?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">4</field></shadow></value><statement name="DO"><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value></block></next></block></statement></block></statement></block></xml>',
        pedido: 'A minha sirene faz «ni-ni-ni-ni»… parece um mosquito! Que gambiarra é esta?',
      },
    },
  };

  const ABRACO = {
    titulo: 'Abraço-interruptor',
    missao: 'Quando abraças o peluche, o coração dele bate.',
    passos: ['Duas tiras de alumínio com esponja no meio: o abraço fecha o circuito no pin 0.', 'Em «no pin P0 premido»: coração, pausa, coração pequeno, pausa.', 'Experimenta: toca no pin 0.'],
    material: 'micro:bit, 2 crocodilos, alumínio, esponja, um peluche',
    novos: ['th_pino_p0', 'mk_icone_coracao', 'mk_icone_pequeno', 'mk_pausa'],
    caixa: ['mk_repetir'],
    teste: 'pino:P0',
    ok: r => ['pino:P0', 'pino:P1'].some(p => visiveis(r, p, 'Heart') >= 1 && visiveis(r, p, 'SmallHeart') >= 1),
    tutor: {
      boasVindas: ['boas_vindas', 'Um peluche que sente abraços? Com alumínio e uma esponja fazemos um interruptor que se fecha quando o apertas!'],
      parecePronto: a => pinos(a).some(e => icones(e, 'Heart').length > 0 && icones(e, 'SmallHeart').length > 0 && blocos(e, 'mk_pausa').length > 0),
      testar: 'Tens uma ideia? Vamos testar! Toca no pin 0, como num abraço.',
      regras: [
        P.evento('pino:', 'Quando apertas a esponja, as duas tiras de alumínio tocam-se e o circuito fecha. Que bloco dá por isso?'),
        P.regra('sem_coracoes', a => pinos(a).length > 0 && !pinos(a).some(e => icones(e, 'Heart').length > 0 && icones(e, 'SmallHeart').length > 0), [
          ['curiosa', 'Para bater, o coração tem de mudar: grande… pequeno…'],
          'Precisas de dois «mostrar ícone»: um coração e um coração pequeno.',
          'Dentro do pino, põe o coração e depois o coração pequeno.',
        ], 'Já tens os dois corações!'),
        P.regra('sem_pausa', a => pinos(a).some(e => icones(e, 'Heart').length > 0) && !pinos(a).some(e => blocos(e, 'mk_pausa').length > 0), [
          ['a_pensar', 'Abraças e… viste o coração? Foi tão depressa!'],
          'Cada desenho precisa de tempo para se ver. Há um bloco azul que espera.',
          'Põe uma «pausa» depois de cada coração.',
        ], 'Agora vê-se o coração a bater!'),
      ],
      sucesso: 'O peluche sente abraços! Fizeste um interruptor com alumínio e esponja: uma gambiarra a sério.',
      extensao: 'E se o coração batesse 3 vezes por cada abraço?',
      gambiarra: {
        xml: '<xml><block type="mk_pino_tocado" x="40" y="40"><field name="P">P0</field><statement name="DO"><block type="mk_icone"><field name="I">Heart</field><next><block type="mk_icone"><field name="I">SmallHeart</field></block></next></block></statement></block></xml>',
        pedido: 'Abraço o meu peluche e o coração… nem se vê! Acho que fiz uma gambiarra. Consegues ver o que falta?',
      },
    },
  };

  // ============================================================ NÍVEL 2 · Reinventar
  const BRACO = {
    titulo: 'Braço que acena',
    missao: 'Põe um braço de cartão no servo e faz o boneco acenar 3 vezes.',
    passos: ['Servo: fio laranja no pin 0, vermelho no 3V, castanho no GND.', 'No botão A: «repetir 3 vezes» com servo 0, pausa, servo 180, pausa.', 'Experimenta: carrega no A.'],
    material: 'micro:bit, servo SG90, 3 crocodilos, cartão, um boneco',
    novos: ['th_servo_0', 'th_servo_180', 'th_pausa_500'],
    caixa: ['mk_botao', 'mk_repetir', 'mk_servo'],
    teste: 'botao:A',
    ok: r => saidasApos(r, v => v === 'botao:A').some(o => {
      const s = o.filter(e => e.v.startsWith('servo:'));
      const a = s.map(e => angulo(e.v));
      return s.length >= 5 && Math.max(...a) - Math.min(...a) >= 90 && comPausas(s, 150);
    }),
    tutor: {
      boasVindas: ['boas_vindas', 'Um servo é um motor pequenino que vai para o ângulo que lhe dizes. Vamos pôr um boneco a dizer adeus?'],
      parecePronto: a => { const ev = a.evento('botao:A'); return !!ev && blocos(ev, 'mk_repetir').length > 0 && servos(ev).filter(p => p.dentroDe === 'mk_repetir').length >= 2 && blocos(ev, 'mk_pausa').length >= 2; },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A e vê o braço.',
      regras: [
        P.evento('botao:A', 'Quem dá a ordem para acenar? Precisas de um botão à escuta.'),
        P.bloco('botao:A', 'mk_servo', 'O braço está preso ao servo. Que bloco manda o servo rodar?'),
        P.regra('um_lado_so', a => { const s = servos(a.evento('botao:A')); return s.length > 0 && new Set(s.map(p => p.angulo)).size < 2; }, [
          ['curiosa', 'Acenar é ir para um lado… e depois?'],
          'Precisas de dois ângulos diferentes: um para cada lado.',
          'Usa um servo a 0 e outro a 180.',
        ], 'Lá vai ele, de um lado para o outro!'),
        P.regra('sem_pausa', a => servos(a.evento('botao:A')).length >= 2 && blocos(a.evento('botao:A'), 'mk_pausa').length < 2, [
          ['a_pensar', 'O braço quase não se mexe… será que o servo tem tempo de chegar?'],
          'Um motor demora a rodar. Dá-lhe tempo com um bloco azul.',
          'Põe uma «pausa» depois de cada servo.',
        ], 'Agora o braço tem tempo de chegar!'),
        P.regra('sem_repetir', a => servos(a.evento('botao:A')).length >= 2 && !blocos(a.evento('botao:A'), 'mk_repetir').length, [
          'Acenou uma vez. A missão pede três: vais copiar os blocos todos?',
          'Há um bloco verde que repete por ti.',
          'Mete os servos e as pausas dentro de «repetir 3 vezes».',
        ], 'Adeus, adeus, adeus!'),
      ],
      sucesso: 'O boneco acena! Os servos estão em robôs, portas e brinquedos — e agora num boneco teu.',
      extensao: 'E se ele acenasse devagarinho? Experimenta ângulos intermédios: 0, 45, 90, 135, 180.',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">3</field></shadow></value><statement name="DO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">180</field></shadow></value></block></next></block></statement></block></statement></block></xml>',
        pedido: 'O meu boneco devia acenar, mas só treme um bocadinho! Que gambiarra fiz?',
      },
    },
  };

  const CANCELA = {
    titulo: 'Cancela da garagem',
    missao: 'Faz uma cancela para a garagem dos carrinhos: A abre, B fecha.',
    passos: ['Cola um palito ao braço do servo (pin 0).', 'No A: servo para 90. No B: servo para 0.', 'Experimenta: A e depois B.'],
    material: 'micro:bit, servo SG90, 3 crocodilos, um palito, uma caixa de cartão',
    novos: ['mk_servo'],
    caixa: ['mk_botao', 'mk_botao_B', 'th_servo_0'],
    teste: 'botao:A',
    ok: r => {
      const fim = (o, f) => { const s = o.filter(e => e.v.startsWith('servo:')); return s.length > 0 && f(angulo(s[s.length - 1].v)); };
      return saidasApos(r, v => v === 'botao:A').some(o => fim(o, x => x >= 60)) && saidasApos(r, v => v === 'botao:B').some(o => fim(o, x => x <= 20));
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Os carrinhos estão a fazer fila! Vamos construir uma cancela que sobe e desce?'],
      parecePronto: a => servos(a.evento('botao:A')).some(p => Number(p.angulo) >= 60) && servos(a.evento('botao:B')).some(p => Number(p.angulo) <= 20),
      testar: 'Tens uma ideia? Vamos testar! A para abrir, B para fechar.',
      regras: [
        P.evento('botao:A', 'Quem manda abrir a cancela? Precisas de um botão.'),
        P.bloco('botao:A', 'mk_servo', 'O botão já está à escuta. Quem levanta o palito?'),
        P.evento('botao:B', 'Abrir já está. E para fechar, os carros esperam para sempre?', 'Já tens botão para fechar!'),
        P.bloco('botao:B', 'mk_servo', 'O B também precisa de mexer no servo.'),
        P.regra('nao_fecha', a => servos(a.evento('botao:B')).length > 0 && !servos(a.evento('botao:B')).some(p => Number(p.angulo) <= 20), [
          ['surpreendida', 'Carregas no B e a cancela… fica aberta?'],
          'Fechada é o ângulo do início: deitada.',
          'No botão B, põe o servo para 0.',
        ], 'Fechada! Ninguém passa.'),
        P.regra('nao_abre', a => !servos(a.evento('botao:A')).some(p => Number(p.angulo) >= 60), [
          'O A abre pouquinho… passa algum carro?',
          'Aberta é com o palito em pé: um ângulo maior.',
          'No botão A, põe o servo para 90.',
        ], 'Aberta! Podem passar.'),
      ],
      sucesso: 'Cancela pronta! Com um servo e um palito fizeste a mesma coisa que as cancelas dos parques.',
      extensao: 'E se a cancela fechasse sozinha passados 2 segundos?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">90</field></shadow></value></block></statement></block><block type="mk_botao" x="40" y="200"><field name="B">B</field><statement name="DO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">90</field></shadow></value></block></statement></block></xml>',
        pedido: 'A minha cancela abre bem… mas nunca fecha! Os carros entram todos sem pagar. Encontras a gambiarra?',
      },
    },
  };

  const ASSUSTADO = {
    titulo: 'Boneco assustado',
    missao: 'Quando há um barulho forte, o boneco assusta-se: faz cara de espanto e dá um salto.',
    passos: ['Usa «em som alto».', 'Lá dentro: cara surpreendida e o servo a mexer.', 'Experimenta: carrega em «Bater palmas».'],
    material: 'micro:bit V2 (microfone), servo SG90, 3 crocodilos, um boneco',
    novos: ['mk_som_alto', 'mk_icone_surpreendido'],
    caixa: ['th_servo_180', 'th_servo_0', 'th_pausa_500'],
    teste: 'somalto',
    ok: r => causou(r, s => s.includes('icone:Surprised') && s.some(x => x.startsWith('servo:')), v => v === 'somalto'),
    tutor: {
      boasVindas: ['boas_vindas', 'Este boneco é medricas: assusta-se com tudo! Vamos pô-lo a saltar quando alguém bate palmas?'],
      parecePronto: a => { const ev = a.evento('somalto'); return icones(ev, 'Surprised').length > 0 && servos(ev).length > 0; },
      testar: 'Tens uma ideia? Vamos testar! Carrega em «Bater palmas».',
      regras: [
        P.evento('somalto', 'O micro:bit V2 tem um microfone. Como é que ele dá por um barulho forte?'),
        P.bloco('somalto', 'mk_icone', 'O boneco já ouve o barulho. Que cara faz quem se assusta?'),
        P.regra('cara_errada', a => icones(a.evento('somalto')).length > 0 && !icones(a.evento('somalto'), 'Surprised').length, [
          ['surpreendida', 'Assustado… com essa cara?'],
          'Há um desenho de boca aberta, de espanto.',
          'Escolhe a cara surpreendida.',
        ], 'Que susto!'),
        P.bloco('somalto', 'mk_servo', 'Faz cara de susto… e o corpo, não salta?'),
      ],
      sucesso: 'Que susto! O microfone ouve, o servo salta: o boneco reage ao mundo.',
      extensao: 'E se ele voltasse devagar ao lugar, depois do susto, com pausas?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_icone"><field name="I">Surprised</field><next><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">180</field></shadow></value></block></next></block></statement></block></xml>',
        pedido: 'Bato palmas e o meu boneco nem se mexe! Só se assusta quando carrego no A… Que gambiarra é esta?',
      },
    },
  };

  const AMBULANCIA = {
    titulo: 'Ouvir a ambulância',
    missao: 'O micro:bit «ouve» a sirene da ambulância: com barulho, acende a luz; em silêncio, apaga.',
    passos: ['Em «para sempre», usa «se … então … senão».', 'Condição: «nível de som» > 128. Então LED para 1; senão LED para 0.', 'Experimenta: mexe no controlo do som.'],
    material: 'micro:bit V2, 1 LED, 2 crocodilos, a ambulância de brinquedo',
    novos: ['mk_sempre', 'mk_se_senao', 'th_comparar_maior', 'mk_som_nivel'],
    caixa: ['mk_digital_1', 'mk_digital_0'],
    teste: 'som:200',
    ok: r => F.verif.aposSensor(r, 'som', v => v >= 180, s => s.some(x => /^digital:P\d:1$/.test(x))) &&
      F.verif.aposSensor(r, 'som', v => v <= 40, s => s.some(x => /^digital:P\d:0$/.test(x)) && !s.some(x => /^digital:P\d:1$/.test(x))),
    tutor: {
      boasVindas: ['boas_vindas', 'Sem fios nenhuns entre os dois: o micro:bit vai ouvir a sirene da ambulância e acender uma luz!'],
      parecePronto: a => ses(a.evento('sempre')).some(s => (s.usa || []).some(u => u.tipo === 'mk_som_nivel') && ramo(s, 'sim').some(p => p.tipo === 'mk_digital' && p.v === 1)),
      testar: 'Tens uma ideia? Vamos testar! Sobe o som (sirene) e depois baixa (silêncio).',
      regras: [
        P.evento('sempre', 'O micro:bit tem de estar sempre a ouvir, não só uma vez. Que bloco repete sem parar?'),
        P.bloco('sempre', 'mk_se', 'Ele ouve sempre… mas tem de decidir: barulho ou silêncio? Que bloco decide?'),
        P.valorEm('sempre', 'mk_se', 'mk_comparar', 'Decidir o quê? O «se» precisa de uma pergunta com resposta sim ou não.'),
        P.valorEm('sempre', 'mk_se', 'mk_som_nivel', 'A pergunta é sobre o barulho. Que bloco mede o barulho?'),
        P.regra('sem_luz', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(s => ramo(s, 'sim').some(p => p.tipo === 'mk_digital' && p.v === 1)), [
          ['curiosa', 'Quando há barulho, o que é que acontece à luz?'],
          'No «então», a luz liga; no «senão», desliga.',
          'Põe «gravação digital pin P2 para 1» no «então» e «para 0» no «senão».',
        ], 'Agora a luz responde à sirene!'),
        P.regra('ao_contrario', a => ses(a.evento('sempre')).some(s => (s.usa || []).some(u => u.tipo === 'mk_comparar' && (u.op === '<' || u.op === '<='))), [
          ['surpreendida', 'Ui! Assim a luz acende no silêncio. É isso que queres?'],
          'Olha para o sinal da comparação: «maior que» ou «menor que»?',
          'Muda o sinal para «>».',
        ], 'Isso, agora acende com barulho!'),
      ],
      sucesso: 'O micro:bit ouve a ambulância! Não há fios entre os dois: a ligação é o som.',
      extensao: 'E se, em vez de acender, mostrasse no ecrã o nível de som em barras?',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se"><value name="C"><block type="mk_comparar"><field name="OP">&gt;</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow><block type="mk_som_nivel"></block></value><value name="B"><shadow type="mk_num"><field name="NUM">128</field></shadow></value></block></value><statement name="SIM"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement><statement name="NAO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement></block></statement></block></xml>',
        pedido: 'A minha luz acende com a sirene… mas nunca mais apaga, nem em silêncio! Que gambiarra fiz?',
      },
    },
  };

  const EQUILIBRIO = {
    titulo: 'Brinquedo de equilíbrio',
    missao: 'Inclina o brinquedo: o servo roda para o lado para onde ele cai.',
    passos: ['Usa «em inclinado para a esquerda» e «em inclinado para a direita».', 'Esquerda: servo para 0. Direita: servo para 180.', 'Experimenta com os botões de inclinar.'],
    material: 'micro:bit, servo SG90, 3 crocodilos, um brinquedo de equilíbrio',
    novos: ['mk_gesto', 'mk_gesto_direita'],
    caixa: ['th_servo_0', 'th_servo_180', 'mk_icone'],
    teste: 'gesto:left',
    sim: ['gesto:left', 'gesto:right'],
    ok: r => causou(r, s => s.some(x => x.startsWith('servo:') && angulo(x) <= 45), v => v === 'gesto:left') &&
      causou(r, s => s.some(x => x.startsWith('servo:') && angulo(x) >= 135), v => v === 'gesto:right'),
    tutor: {
      boasVindas: ['boas_vindas', 'Vamos fazer um brinquedo que sente para onde está a cair, como um equilibrista!'],
      parecePronto: a => servos(a.evento('gesto:left')).some(p => Number(p.angulo) <= 45) && servos(a.evento('gesto:right')).some(p => Number(p.angulo) >= 135),
      testar: 'Tens uma ideia? Vamos testar! Inclina para a esquerda e depois para a direita.',
      regras: [
        P.evento('gesto:left', 'O micro:bit sente quando o inclinas. Que bloco fica à escuta de inclinar para a esquerda?'),
        P.bloco('gesto:left', 'mk_servo', 'Já sente a inclinação. E o servo, para onde roda?'),
        P.evento('gesto:right', 'Esquerda feita. E quando cai para o outro lado?', 'Já sente os dois lados!'),
        P.bloco('gesto:right', 'mk_servo', 'Para a direita, o servo também tem de rodar.'),
        P.regra('mesmo_lado', a => { const e = servos(a.evento('gesto:left')).map(p => Number(p.angulo)), d = servos(a.evento('gesto:right')).map(p => Number(p.angulo)); return e.length && d.length && !(e.some(x => x <= 45) && d.some(x => x >= 135)); }, [
          ['surpreendida', 'Cai para a esquerda e o servo vai… para onde?'],
          'Cada lado tem o seu ângulo: um pequeno e um grande.',
          'Esquerda: servo para 0. Direita: servo para 180.',
        ], 'Equilíbrio perfeito!'),
      ],
      sucesso: 'O brinquedo sente o equilíbrio! O acelerómetro diz para onde o micro:bit está a cair.',
      extensao: 'E se, direito (ecrã para cima), o servo voltasse ao meio (90)?',
      gambiarra: {
        xml: '<xml><block type="mk_gesto" x="40" y="40"><field name="G">left</field><statement name="DO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">180</field></shadow></value></block></statement></block><block type="mk_gesto" x="40" y="200"><field name="G">right</field><statement name="DO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">180</field></shadow></value></block></statement></block></xml>',
        pedido: 'O meu equilibrista vai sempre para o mesmo lado, caia para onde cair! Ajudas-me?',
      },
    },
  };

  const PISCA = {
    titulo: 'Pisca do carrinho',
    missao: 'O carrinho vai virar: com o botão B, o pisca liga e desliga 4 vezes.',
    passos: ['No botão B: «repetir 4 vezes».', 'Lá dentro: LED para 1, pausa, LED para 0, pausa.', 'Experimenta: carrega no B.'],
    material: 'micro:bit, 1 LED cor de laranja, 2 crocodilos, um carrinho',
    novos: ['mk_botao_B'],
    caixa: ['mk_repetir', 'mk_digital_1', 'mk_digital_0', 'mk_pausa'],
    teste: 'botao:B',
    ok: r => saidasApos(r, v => v === 'botao:B').some(o => {
      const d = o.filter(e => e.v.startsWith('digital:'));
      return d.filter(e => e.v.endsWith(':1')).length >= 3 && d.filter(e => e.v.endsWith(':0')).length >= 3 && comPausas(d, 90);
    }),
    tutor: {
      boasVindas: ['boas_vindas', 'Pisca-pisca! Antes de virar, o carrinho tem de avisar. Vamos fazer-lhe um pisca?'],
      parecePronto: a => { const ev = a.evento('botao:B'); const d = digitais(ev).filter(p => p.dentroDe === 'mk_repetir'); return d.some(p => p.v === 1) && d.some(p => p.v === 0) && blocos(ev, 'mk_pausa').length >= 2; },
      testar: 'Tens uma ideia? Vamos testar! Carrega no B e olha para o LED.',
      regras: [
        P.evento('botao:B', 'O pisca liga-se com um botão. Qual é o botão desta missão?'),
        P.bloco('botao:B', 'mk_repetir', 'Pisca, pisca, pisca, pisca… vais fazer quatro vezes à mão?'),
        P.regra('nunca_apaga', a => { const d = digitais(a.evento('botao:B')); return d.length > 0 && !d.some(p => p.v === 0); }, [
          ['a_pensar', 'Um pisca que nunca se apaga é um farol!'],
          'Para piscar, a luz liga… e depois desliga.',
          'Dentro do repetir, põe também «gravação digital pin P2 para 0».',
        ], 'Agora pisca!'),
        P.regra('sem_pausas', a => digitais(a.evento('botao:B')).length >= 2 && blocos(a.evento('botao:B'), 'mk_pausa').length < 2, [
          ['curiosa', 'O LED pisca tão depressa que parece sempre aceso. Como se abranda?'],
          'Depois de ligar e depois de desligar, espera um bocadinho.',
          'Põe uma «pausa» a seguir a cada «gravação digital».',
        ], 'Pisca, pisca, agora vê-se!'),
      ],
      sucesso: 'O carrinho tem pisca! Ligar, esperar, desligar, esperar: é assim que todos os piscas funcionam.',
      extensao: 'E se o botão A fizesse o pisca do outro lado, num LED no pin 0?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><field name="B">B</field><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">4</field></shadow></value><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value></block></next></block></next></block></next></block></statement></block></statement></block></xml>',
        pedido: 'O meu pisca não pisca: fica sempre aceso! Acho que me enganei num número. Encontras?',
      },
    },
  };

  // ============================================================ NÍVEL 3 · Inventar
  const CONTA_ABRACOS = {
    titulo: 'Contador de abraços',
    missao: 'O peluche conta quantos abraços recebe e mostra o número.',
    passos: ['No arranque: definir contador para 0.', 'No pin 0 (o abraço): mudar contador em 1 e mostrar número contador.', 'Experimenta: toca no pin 0 várias vezes.'],
    material: 'micro:bit, 2 crocodilos, alumínio, esponja, um peluche',
    novos: ['mk_iniciar', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_mostrar_numero'],
    caixa: ['th_pino_p0'],
    teste: 'pino:P0',
    ok: r => causou(r, s => s.includes('numero:3'), v => v.startsWith('pino:')) && [1, 2, 3].every(n => numeros(r).includes(n)),
    tutor: {
      boasVindas: ['boas_vindas', 'Quantos abraços recebe um peluche por dia? Vamos pô-lo a contar! Para isso precisamos de uma variável: uma caixinha que guarda um número.'],
      parecePronto: a => pinos(a).some(e => blocos(e, 'mk_var_mudar').some(p => p.var === 'contador') && dentro(e, 'mk_mostrar_numero', 'mk_var')),
      testar: 'Tens uma ideia? Vamos testar! Toca no pin 0 três vezes.',
      regras: [
        P.evento('pino:', 'O abraço fecha o circuito no pin 0. Que bloco dá por isso?'),
        P.regra('poe_sempre_1', a => pinos(a).some(e => blocos(e, 'mk_var_definir').some(p => p.var === 'contador')), [
          ['surpreendida', 'Ui! Em cada abraço o contador volta ao início. Assim nunca passa de um!'],
          '«definir» põe um valor novo; «mudar» soma ao que já lá está.',
          'Usa «mudar contador em 1» dentro do pino; o «definir» vai para o «no arranque».',
        ], 'Agora conta a sério!'),
        P.bloco('pino:', 'mk_var_mudar', 'Abraçaste. Como é que a caixinha do contador fica com mais um?'),
        P.bloco('pino:', 'mk_mostrar_numero', 'O contador já conta, mas às escondidas. Como é que o vemos?'),
        P.valorEm('pino:', 'mk_mostrar_numero', 'mk_var', 'Mostra sempre o mesmo número? O que é que devia aparecer?'),
      ],
      sucesso: 'O peluche sabe contar! A variável «contador» guarda o número entre um abraço e o outro.',
      extensao: 'E se ao 10.º abraço o peluche tocasse uma música de festa?',
      gambiarra: {
        xml: '<xml><block type="mk_pino_tocado" x="40" y="40"><field name="P">P0</field><statement name="DO"><block type="mk_var_definir"><field name="VAR">contador</field><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_mostrar_numero"><value name="N"><shadow type="mk_num"><field name="NUM">0</field></shadow><block type="mk_var"><field name="VAR">contador</field></block></value></block></next></block></statement></block></xml>',
        pedido: 'O meu peluche já levou três abraços e continua a dizer «1»! Que gambiarra fiz no contador?',
      },
    },
  };

  const COFRE = {
    titulo: 'Alarme do cofre',
    missao: 'Se alguém abre a caixa dos brinquedos, toca um alarme.',
    passos: ['Na tampa, um interruptor de alumínio no pin 0: aberto = 1.', 'Em «para sempre»: se «leitura digital pin P0» = 1, então toca um tom.', 'Experimenta: carrega em «Pin 0» para abrir e fechar.'],
    material: 'micro:bit, 2 crocodilos, alumínio, uma caixa de brinquedos',
    novos: ['mk_ler_digital', 'mk_se_entao', 'th_comparar_igual'],
    caixa: ['mk_sempre', 'mk_tom', 'mk_icone_nao'],
    teste: 'digital:P0:1',
    sim: ['digital:P0'],
    ok: r => F.verif.aposSensor(r, 'digital:P0', v => v === 1, s => s.some(x => /^(tom|som):/.test(x))) &&
      F.verif.aposSensor(r, 'digital:P0', v => v === 0, s => !s.some(x => /^(tom|som):/.test(x))),
    tutor: {
      boasVindas: ['boas_vindas', 'Há um ladrão de brinquedos à solta! Vamos guardar a caixa com um alarme?'],
      parecePronto: a => ses(a.evento('sempre')).some(s => (s.usa || []).some(u => u.tipo === 'mk_ler_digital') && ramo(s, 'sim').some(p => p.tipo === 'mk_tom' || p.tipo === 'mk_som')),
      testar: 'Tens uma ideia? Vamos testar! Abre a caixa (pin 0) e depois fecha.',
      regras: [
        P.evento('sempre', 'Um alarme tem de estar sempre de guarda. Que bloco nunca para?'),
        P.regra('sem_se', a => !!a.evento('sempre') && ses(a.evento('sempre')).length === 0, [
          'Está sempre de guarda… mas só deve tocar às vezes. Que bloco decide?',
          'Há um bloco verde-azulado que só faz o que tem dentro quando a resposta é sim: «se … então».',
          'Põe «se … então» dentro de «para sempre».',
        ], 'Agora o alarme sabe decidir!'),
        P.regra('sem_leitura', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(s => (s.usa || []).some(u => u.tipo === 'mk_ler_digital')), [
          ['a_pensar', 'Decidir com base em quê? O micro:bit tem de olhar para o interruptor da tampa.'],
          'Há um bloco vermelho-escuro que lê se o circuito está aberto (1) ou fechado (0): «leitura digital pin».',
          'Faz a pergunta «leitura digital pin P0 = 1» e encaixa-a no «se».',
        ], 'Agora o alarme vigia a tampa!'),
        P.regra('sem_alarme', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(s => ramo(s, 'sim').some(p => p.tipo === 'mk_tom' || p.tipo === 'mk_som')), [
          ['curiosa', 'A tampa abriu… e o alarme, ouve-se?'],
          'Dentro do «então» põe um bloco laranja de música.',
          'Põe «tocar tom» dentro do «se … então».',
        ], 'Uiii-uiii! Alarme ligado!'),
        P.regra('sempre_a_tocar', a => (a.evento('sempre') ? a.evento('sempre').plano : []).some(p => (p.tipo === 'mk_tom' || p.tipo === 'mk_som') && p.dentroDe !== 'mk_se_entao' && p.dentroDe !== 'mk_se'), [
          ['a_pensar', 'O alarme toca mesmo com a caixa fechada? Isso acorda a casa toda!'],
          'O som só deve correr quando a condição é verdadeira.',
          'Mete o «tocar tom» dentro do «se … então».',
        ], 'Agora só toca quando abrem a caixa!'),
      ],
      sucesso: 'Cofre protegido! A leitura digital diz se o circuito está aberto (1) ou fechado (0).',
      extensao: 'E se o alarme também mostrasse uma cruz ✖ no ecrã?',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se_entao"><value name="C"><block type="mk_comparar"><field name="OP">==</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow><block type="mk_ler_digital"><field name="P">P0</field></block></value><value name="B"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></value></block><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">523</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value></block></next></block></statement></block></xml>',
        pedido: 'O meu alarme não se cala, mesmo com a caixa fechada! Os vizinhos estão a reclamar… Encontras a gambiarra?',
      },
    },
  };

  const ROLETA = {
    titulo: 'Roleta do robô',
    missao: 'Abana o robô e o braço dele aponta para um sítio ao acaso.',
    passos: ['Em «em agitar»: servo para «escolher ao acaso de 0 até 180».', 'Desenha à volta do servo os prémios (ou as tarefas!).', 'Experimenta: agita várias vezes.'],
    material: 'micro:bit, servo SG90, 3 crocodilos, cartão e canetas',
    novos: ['mk_agitar', 'th_aleatorio_servo'],
    caixa: ['mk_servo'],
    teste: 'agitar',
    ok: r => {
      const a = saidasApos(r, v => v === 'agitar').flatMap(o => o.filter(e => e.v.startsWith('servo:')).map(e => angulo(e.v)));
      return new Set(a).size >= 2 && Math.max(...a) >= 40;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Quem arruma a sala hoje? Vamos fazer uma roleta-robô que decide ao acaso!'],
      parecePronto: a => dentro(a.evento('agitar'), 'mk_servo', 'mk_aleatorio'),
      testar: 'Tens uma ideia? Vamos testar! Agita várias vezes e vê para onde aponta.',
      regras: [
        P.evento('agitar', 'A roleta gira quando abanas o robô. Que bloco sente o abanão?'),
        P.bloco('agitar', 'mk_servo', 'O robô já sente o abanão. Quem mexe o ponteiro?'),
        P.valorEm('agitar', 'mk_servo', 'mk_aleatorio', 'O ponteiro vai sempre parar no mesmo sítio. Uma roleta assim tem graça?'),
        P.regra('acaso_pequeno', a => servos(a.evento('agitar')).some(p => (p.usa || []).some(u => u.tipo === 'mk_aleatorio') && Math.max(...(p.usa || []).filter(u => u.tipo === 'mk_num').map(u => u.n), 0) < 90), [
          ['curiosa', 'O ponteiro mexe-se… mas só um bocadinho. Até onde vai a roleta?'],
          'O servo vai de 0 a 180 graus. Olha para os números do «escolher ao acaso».',
          'Muda para «escolher ao acaso de 0 até 180».',
        ], 'Agora a roleta dá a volta toda!'),
      ],
      sucesso: 'Roleta pronta! O micro:bit escolhe um número ao acaso e o servo mostra-o com o braço.',
      extensao: 'O ponteiro quase não se mexe? Confirma os números: de 0 até 180 é a volta toda do servo.',
      gambiarra: {
        xml: '<xml><block type="mk_agitar" x="40" y="40"><statement name="DO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">90</field></shadow></value></block></statement></block></xml>',
        pedido: 'A minha roleta é batoteira: aponta sempre para o mesmo sítio! Ajudas-me a torná-la justa?',
      },
    },
  };

  const TAPETE = {
    titulo: 'Tapete das vidas',
    missao: 'Um tapete de pressão no chão: cada vez que o pisas perdes uma vida; sem vidas, cara triste.',
    passos: ['No arranque: definir vidas para 3.', 'No pin 1 (o tapete): mudar vidas em -1 e mostrar número vidas.', 'Se vidas = 0, então cara triste. Experimenta: pisa 3 vezes.'],
    material: 'micro:bit, 2 crocodilos, cartão, alumínio, esponja',
    novos: ['th_definir_vidas', 'th_mudar_vidas', 'th_var_vidas', 'th_comparar_vidas'],
    caixa: ['mk_iniciar', 'mk_pino_tocado', 'mk_mostrar_numero', 'mk_se_entao', 'mk_icone_triste'],
    teste: 'pino:P1',
    ok: r => {
      const n = numeros(r);
      const i2 = n.indexOf(2), i1 = n.indexOf(1, i2 + 1), i0 = n.indexOf(0, i1 + 1);
      return i2 >= 0 && i1 > i2 && i0 > i1 && causou(r, s => s.includes('numero:0') && s.includes('icone:Sad'), v => v.startsWith('pino:'));
    },
    tutor: {
      boasVindas: ['boas_vindas', 'O chão é lava! Vamos fazer um tapete-armadilha que te tira vidas quando o pisas?'],
      parecePronto: a => !!a.evento('inicio') && blocos(a.evento('inicio'), 'mk_var_definir').some(p => p.var === 'vidas') &&
        pinos(a).some(e => blocos(e, 'mk_var_mudar').some(p => p.var === 'vidas' && Number(p.n) < 0) && dentro(e, 'mk_mostrar_numero', 'mk_var') && icones(e, 'Sad').length > 0),
      testar: 'Tens uma ideia? Vamos testar! Pisa o tapete (pin 1) três vezes.',
      regras: [
        P.evento('inicio', 'Quantas vidas tens quando o jogo começa? Onde se diz isso, logo ao ligar?'),
        P.regra('sem_vidas_inicio', a => !!a.evento('inicio') && !blocos(a.evento('inicio'), 'mk_var_definir').some(p => p.var === 'vidas'), [
          'O jogo começou… e com quantas vidas?',
          'No «no arranque», usa «definir … para» com a variável vidas.',
          'Põe «definir vidas para 3» no «no arranque».',
        ], 'Três vidas. Cuidado com a lava!'),
        P.evento('pino:', 'Pisar o tapete fecha o circuito. Que bloco dá por isso?'),
        P.regra('ganha_vidas', a => pinos(a).some(e => blocos(e, 'mk_var_mudar').some(p => p.var === 'vidas' && Number(p.n) > 0)), [
          ['surpreendida', 'Pisas a lava e ganhas vidas? Que jogo tão simpático!'],
          'Para tirar, muda-se com um número negativo.',
          'Usa «mudar vidas em -1».',
        ], 'Isso, a lava tira vidas!'),
        P.bloco('pino:', 'mk_var_mudar', 'Pisaste o tapete… e as vidas, diminuem?'),
        P.valorEm('pino:', 'mk_mostrar_numero', 'mk_var', 'Quantas vidas tens? Mostra a variável, não um número fixo.'),
        P.regra('sem_fim', a => pinos(a).length > 0 && !pinos(a).some(e => icones(e, 'Sad').length > 0), [
          ['curiosa', 'E quando as vidas chegam a zero? O jogo nem avisa?'],
          'Usa «se … então» com a pergunta «vidas = 0».',
          'Dentro do pino: se vidas = 0, então mostrar ícone triste.',
        ], 'Fim de jogo… até à próxima!'),
      ],
      sucesso: 'Tapete-armadilha pronto! Uma variável que desce, uma comparação que decide: já é um jogo a sério.',
      extensao: 'E se o botão A recomeçasse o jogo com 3 vidas?',
      gambiarra: {
        xml: '<xml><block type="mk_iniciar" x="40" y="40"><statement name="DO"><block type="mk_var_definir"><field name="VAR">vidas</field><value name="V"><shadow type="mk_num"><field name="NUM">3</field></shadow></value></block></statement></block><block type="mk_pino_tocado" x="40" y="200"><statement name="DO"><block type="mk_var_mudar"><field name="VAR">vidas</field><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_mostrar_numero"><value name="N"><shadow type="mk_num"><field name="NUM">0</field></shadow><block type="mk_var"><field name="VAR">vidas</field></block></value></block></next></block></statement></block></xml>',
        pedido: 'No meu tapete, quanto mais pisas, mais vidas tens: 4, 5, 6! Isto não é um jogo, é uma festa. Que gambiarra fiz?',
      },
    },
  };

  const CRONOMETRO = {
    titulo: 'Cronómetro da corrida',
    missao: 'Dois portões de alumínio na pista: o micro:bit mede quanto tempo o carrinho demora.',
    passos: ['Pin 0 (partida): definir medida para «tempo de execução (ms)».', 'Pin 1 (chegada): mostrar número «tempo de execução − medida».', 'Experimenta: toca no pin 0, espera, toca no pin 1.'],
    material: 'micro:bit, 4 crocodilos, alumínio, um carrinho e uma rampa',
    novos: ['mk_tempo', 'th_definir_medida', 'th_var_medida', 'th_conta_menos'],
    caixa: ['th_pino_p0', 'mk_pino_tocado', 'mk_mostrar_numero'],
    teste: 'pino:P1',
    ok: r => {
      let t0 = null;
      for (let i = 0; i < r.length; i++) {
        const e = r[i];
        if (e.dir !== 'in') continue;
        if (e.v === 'pino:P0') { t0 = e.t; continue; }
        if (e.v === 'pino:P1' && t0 !== null) {
          const gap = e.t - t0;
          for (let j = i + 1; j < r.length && r[j].dir === 'out'; j++) {
            if (r[j].v.startsWith('numero:') && Math.abs(Number(r[j].v.slice(7)) - gap) <= 120 && gap > 0) return true;
          }
        }
      }
      return false;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Qual é o carrinho mais rápido da sala? Vamos fazer um cronómetro de corrida com dois portões!'],
      parecePronto: a => !!a.evento('pino:P0') && blocos(a.evento('pino:P0'), 'mk_var_definir').some(p => p.var === 'medida' && (p.usa || []).some(u => u.tipo === 'mk_tempo')) &&
        dentro(a.evento('pino:P1'), 'mk_mostrar_numero', 'mk_conta'),
      testar: 'Tens uma ideia? Vamos testar! Partida no pin 0, chegada no pin 1.',
      regras: [
        P.evento('pino:P0', 'O carrinho passa primeiro no portão da partida. Que pino é esse?'),
        P.bloco('pino:P0', 'mk_var_definir', 'Na partida, o micro:bit tem de se lembrar da hora. Onde é que ele guarda um número?'),
        P.regra('sem_hora', a => blocos(a.evento('pino:P0'), 'mk_var_definir').length > 0 && !blocos(a.evento('pino:P0'), 'mk_var_definir').some(p => (p.usa || []).some(u => u.tipo === 'mk_tempo')), [
          'Guardas um número na partida… mas qual? Tem de ser a hora certa!',
          'Há um bloco cor-de-rosa que diz há quanto tempo o programa começou.',
          'Encaixa «tempo de execução (ms)» no «definir medida para».',
        ], 'Partida marcada!'),
        P.evento('pino:P1', 'E na chegada? O carrinho passa no outro portão.', 'Já tens a chegada!'),
        P.valorEm('pino:P1', 'mk_mostrar_numero', 'mk_conta', 'Na chegada, quanto tempo passou desde a partida? Isso é uma conta…'),
        P.regra('conta_sem_medida', a => blocos(a.evento('pino:P1'), 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_conta')) && !blocos(a.evento('pino:P1'), 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_var') && (p.usa || []).some(u => u.tipo === 'mk_tempo')), [
          ['a_pensar', 'A conta é «agora menos a partida». Tens as duas coisas na conta?'],
          'Na conta: à esquerda o tempo de agora, à direita a medida da partida.',
          'Faz «tempo de execução (ms) − medida».',
        ], 'Cronómetro certinho!'),
      ],
      sucesso: 'Cronómetro pronto! Hora da chegada menos hora da partida: é assim que os cronómetros a sério funcionam.',
      extensao: 'O número vem em milésimos de segundo. E se dividisses por 1000 para ver segundos?',
      gambiarra: {
        xml: '<xml><block type="mk_pino_tocado" x="40" y="40"><field name="P">P0</field><statement name="DO"><block type="mk_var_definir"><field name="VAR">medida</field><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow><block type="mk_tempo"></block></value></block></statement></block><block type="mk_pino_tocado" x="40" y="200"><field name="P">P1</field><statement name="DO"><block type="mk_mostrar_numero"><value name="N"><shadow type="mk_num"><field name="NUM">0</field></shadow><block type="mk_tempo"></block></value></block></statement></block></xml>',
        pedido: 'O meu cronómetro diz que o carrinho demorou séculos! Acho que me esqueci de uma conta. Encontras?',
      },
    },
  };

  // ============================================================ NÍVEL 1 · projetos maiores (7–11, 15–20 min)
  const PELUCHE_COMPLETO = {
    titulo: 'Peluche completo',
    missao: 'Um peluche com quatro truques: sente abraços, cócegas no nariz, abanões e hora de dormir.',
    passos: [
      'Abraço (alumínio e esponja no pin 0): coração, pausa, coração pequeno, pausa.',
      'Festa no nariz (logotipo): o som «riso» e a cara contente.',
      'Abanão (em agitar): fica tonto — cara pateta e um som.',
      'Barriga para baixo (ecrã para baixo): adormece.',
      'Experimenta os quatro truques, um de cada vez.',
    ],
    material: 'micro:bit V2, 2 crocodilos, alumínio, esponja, um peluche com espaço lá dentro',
    novos: ['mk_agitar', 'th_icone_pateta'],
    caixa: ['th_pino_p0', 'mk_logo', 'mk_gesto_baixo', 'mk_icone', 'mk_icone_coracao', 'mk_icone_pequeno', 'mk_icone_dormir', 'mk_pausa', 'mk_som'],
    teste: 'pino:P0',
    sim: ['gesto:face down'],
    ok: r => ['pino:P0', 'pino:P1'].some(p => visiveis(r, p, 'Heart') >= 1 && visiveis(r, p, 'SmallHeart') >= 1) &&
      causou(r, s => s.includes('som:giggle') && s.includes('icone:Happy'), v => v === 'logo') &&
      causou(r, s => s.includes('icone:Silly') && s.some(x => x.startsWith('som:') || x.startsWith('tom:')), v => v === 'agitar') &&
      causou(r, s => s.includes('icone:Asleep'), v => v === 'gesto:face down'),
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: o peluche vai ter quatro truques! Faz um de cada vez e experimenta antes de passar ao seguinte.'],
      parecePronto: a => pinos(a).some(e => icones(e, 'Heart').length && icones(e, 'SmallHeart').length && blocos(e, 'mk_pausa').length) &&
        blocos(a.evento('logo'), 'mk_som').some(p => p.som === 'giggle') && icones(a.evento('logo'), 'Happy').length > 0 &&
        icones(a.evento('agitar'), 'Silly').length > 0 && temTom(a.evento('agitar')) && icones(a.evento('gesto:face down'), 'Asleep').length > 0,
      testar: 'Tens uma ideia? Vamos testar! Experimenta os quatro: pin 0, logotipo, Agitar e Virar ao contrário.',
      regras: [
        P.evento('pino:', 'Primeiro truque: o abraço fecha um circuito de alumínio. Que bloco cor-de-rosa dá por isso?'),
        P.regra('abraco_sem_coracoes', a => pinos(a).length > 0 && !pinos(a).some(e => icones(e, 'Heart').length && icones(e, 'SmallHeart').length), [
          ['curiosa', 'O abraço já se sente. Como é que um coração mostra que está a bater?'],
          'Precisas de dois desenhos: o coração grande e o pequeno.',
          'No pin 0, põe o coração e depois o coração pequeno.',
        ], 'Já tens os dois corações!'),
        P.regra('abraco_sem_pausa', a => pinos(a).some(e => icones(e, 'Heart').length) && !pinos(a).some(e => blocos(e, 'mk_pausa').length), [
          ['a_pensar', 'Abraças e… viste o coração? Foi tão depressa!'],
          'Cada desenho precisa de tempo. Há um bloco azul que espera.',
          'Põe uma «pausa» depois de cada coração.',
        ], 'Agora vê-se a bater!'),
        P.evento('logo', 'Segundo truque: o nariz é o logotipo. Quem fica à escuta dele?'),
        P.regra('nariz_sem_riso', a => !!a.evento('logo') && !(blocos(a.evento('logo'), 'mk_som').some(p => p.som === 'giggle') && icones(a.evento('logo'), 'Happy').length), [
          ['curiosa', 'Cócegas no nariz… o que faz quem tem cócegas?'],
          'Ri-se e sorri: um som e um desenho.',
          'No logotipo: o som «riso» e a cara contente.',
        ], 'Ahahah!'),
        P.evento('agitar', 'Terceiro truque: o abanão. Que bloco sente quando abanas o micro:bit?'),
        P.regra('abanao_sem_pateta', a => !!a.evento('agitar') && icones(a.evento('agitar'), 'Silly').length === 0, [
          ['surpreendida', 'Depois de um abanão daqueles, que cara ficava a tua?'],
          'Na lista do ícone há uma cara pateta, toda baralhada.',
          'Em agitar, escolhe a cara pateta.',
        ], 'Que tontura!'),
        P.regra('abanao_sem_som', a => !!a.evento('agitar') && !temTom(a.evento('agitar')), [
          'Tonto e calado? Um peluche tonto faz algum barulho…',
          'Junta um bloco de música ao abanão.',
          'Em agitar, põe um «tocar som» (por exemplo «escorregar»).',
        ], 'Ouve-se a tontura!'),
        P.evento('gesto:face down', 'Último truque: dormir. Como sabe o micro:bit que o peluche está deitado de barriga para baixo?'),
        P.regra('nao_dorme', a => !!a.evento('gesto:face down') && icones(a.evento('gesto:face down'), 'Asleep').length === 0, [
          ['surpreendida', 'Deitado e de olhos abertos?'],
          'Há um desenho de olhos fechados.',
          'No ecrã para baixo, escolhe a cara a dormir.',
        ], 'Zzz…'),
      ],
      sucesso: 'Peluche completo! Quatro sensores diferentes num só brinquedo: circuito, toque, movimento e posição.',
      extensao: 'E se o abraço fizesse o coração bater três vezes seguidas?',
      gambiarra: {
        xml: '<xml><block type="mk_pino_tocado" x="40" y="160"><field name="P">P0</field><statement name="DO"><block type="mk_icone"><field name="I">Heart</field><next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value><next><block type="mk_icone"><field name="I">SmallHeart</field><next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value></block></next></block></next></block></next></block></statement></block><block type="mk_logo" x="40" y="480"><statement name="DO"><block type="mk_som"><value name="S"><shadow type="mk_som_menu"><field name="V">giggle</field></shadow></value><next><block type="mk_icone"><field name="I">Happy</field></block></next></block></statement></block><block type="mk_agitar" x="40" y="160"><statement name="DO"><block type="mk_icone"><field name="I">Happy</field><next><block type="mk_som"><value name="S"><shadow type="mk_som_menu"><field name="V">slide</field></shadow></value></block></next></block></statement></block><block type="mk_gesto" x="40" y="800"><field name="G">face down</field><statement name="DO"><block type="mk_icone"><field name="I">Asleep</field></block></statement></block></xml>',
        pedido: 'Abano o meu peluche e ele fica todo contente… devia ficar tonto! Encontras a gambiarra?',
      },
    },
  };

  const CARRINHO_COMPLETO = {
    titulo: 'Carrinho completo',
    missao: 'O carrinho ganha faróis, buzina e máximos que piscam.',
    passos: [
      'LED nos faróis: perna comprida no pin 2, perna curta no GND.',
      'A acende os faróis; B apaga-os.',
      'A+B é a buzina: duas notas diferentes.',
      'Logotipo: os máximos piscam 3 vezes (liga, pausa, desliga, pausa).',
      'Experimenta tudo: A, B, A+B e logotipo.',
    ],
    material: 'micro:bit V2, 1 LED, 2 crocodilos, um carrinho de brinquedo, fita-cola',
    novos: ['mk_botao_AB'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_logo', 'mk_digital_1', 'mk_digital_0', 'mk_tom', 'th_tom_meia', 'mk_repetir', 'mk_pausa'],
    teste: 'botao:A',
    ok: r => {
      const a = saidasApos(r, v => v === 'botao:A').map(ultimoDig).find(d => d && d[1] === '1');
      const b = saidasApos(r, v => v === 'botao:B').map(ultimoDig).find(d => d && d[1] === '0');
      const buzina = saidasApos(r, v => v === 'botao:AB').some(o => { const t = tons(o); return t.length >= 2 && new Set(t).size >= 2; });
      const maximos = saidasApos(r, v => v === 'logo').some(o => { const p = piscas(o); return p.on >= 3 && p.off >= 3 && comPausas(p.d, 150); });
      return !!a && !!b && a[0] === b[0] && buzina && maximos;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: um carrinho a sério tem faróis, buzina e máximos. Vamos montar tudo, peça a peça?'],
      parecePronto: a => digitais(a.evento('botao:A')).some(p => p.v === 1) && digitais(a.evento('botao:B')).some(p => p.v === 0) &&
        new Set(blocos(a.evento('botao:AB'), 'mk_tom').map(p => p.freq)).size >= 2 &&
        blocos(a.evento('logo'), 'mk_repetir').length > 0 && digitais(a.evento('logo')).length >= 2 && blocos(a.evento('logo'), 'mk_pausa').length >= 2,
      testar: 'Tens uma ideia? Vamos testar! A, B, A+B e o logotipo.',
      regras: [
        P.evento('botao:A', 'Quem acende os faróis? Precisas de um botão à escuta.'),
        P.regra('a_nao_acende', a => !digitais(a.evento('botao:A')).some(p => p.v === 1), [
          'Carregas no A… e a eletricidade vai para o LED?',
          '«gravação digital … para 1» liga o pino.',
          'No A, põe «gravação digital pin P2 para 1».',
        ], 'Faróis acesos!'),
        P.evento('botao:B', 'Acender já está. E como se apagam os faróis?'),
        P.regra('b_nao_apaga', a => !digitais(a.evento('botao:B')).some(p => p.v === 0), [
          'O B ainda não apaga nada.',
          '«para 0» desliga o pino.',
          'No B, põe «gravação digital pin P2 para 0».',
        ], 'Isso!'),
        P.evento('botao:AB', 'A buzina: o condutor carrega nos dois botões ao mesmo tempo. Que bloco ouve isso?'),
        P.regra('buzina_uma_nota', a => new Set(blocos(a.evento('botao:AB'), 'mk_tom').map(p => p.freq)).size < 2, [
          ['curiosa', 'Pó-póóó! Uma buzina faz uma nota só?'],
          'Usa dois «tocar tom», um a seguir ao outro.',
          'No A+B, põe duas notas diferentes (por exemplo Lá e Mi).',
        ], 'Pó-pó!'),
        P.evento('logo', 'Os máximos: um sinal de luz a piscar. Quem os liga? O logotipo!'),
        P.regra('maximos_sem_repetir', a => !blocos(a.evento('logo'), 'mk_repetir').length, [
          'Piscar 3 vezes… vais escrever tudo três vezes?',
          'Há um bloco verde que repete.',
          'No logotipo, usa «repetir 3 vezes».',
        ], 'Assim é mais fácil!'),
        P.regra('maximos_nao_piscam', a => { const d = digitais(a.evento('logo')); return !(d.some(p => p.v === 1) && d.some(p => p.v === 0)); }, [
          'Piscar é acender… e?',
          'Dentro do repetir: liga e depois desliga.',
          'Põe «para 1» e «para 0» dentro do «repetir».',
        ], 'Liga, desliga!'),
        P.regra('maximos_sem_pausa', a => blocos(a.evento('logo'), 'mk_pausa').length < 2, [
          ['a_pensar', 'Os máximos dão só um tremelique… viste-os piscar?'],
          'A luz precisa de tempo acesa e tempo apagada.',
          'Põe uma «pausa» depois de ligar e outra depois de desligar.',
        ], 'Agora piscam a sério!'),
      ],
      sucesso: 'Carrinho completo! Faróis, buzina e máximos: quatro botões, quatro comportamentos.',
      extensao: 'E se a buzina tocasse uma música inteira, como os carros dos gelados?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="960"><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement></block><block type="mk_botao" x="40" y="1120"><field name="B">B</field><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block></statement></block><block type="mk_botao" x="40" y="1280"><field name="B">AB</field><statement name="DO"><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">330</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value></block></next></block></statement></block><block type="mk_logo" x="40" y="160"><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">3</field></shadow></value><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block></next></block></statement></block></statement></block></xml>',
        pedido: 'Os máximos do meu carrinho não piscam, só dão um tremelique! Que gambiarra é esta?',
      },
    },
  };

  const AMBULANCIA_EMERGENCIA = {
    titulo: 'Ambulância de emergência',
    missao: 'Luz e sirene ao mesmo tempo: a ambulância de brinquedo entra em modo de emergência.',
    passos: [
      'LED da luz de emergência no pin 2 e no GND.',
      'No A: «repetir 4 vezes» com luz acesa, uma nota, luz apagada, outra nota.',
      'No B: a ambulância chega ao hospital — luz apagada e cara a dormir.',
      'Experimenta: A e, quando acabar, B.',
    ],
    material: 'micro:bit V2, 1 LED, 2 crocodilos, uma ambulância de brinquedo',
    novos: [],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_repetir', 'mk_digital_1', 'mk_digital_0', 'th_tom_meia', 'mk_tom', 'mk_icone_dormir', 'mk_pausa'],
    teste: 'botao:A',
    ok: r => {
      const emergencia = saidasApos(r, v => v === 'botao:A').some(o => {
        const t = tons(o), p = piscas(o);
        // luz e som misturados: entre duas mudanças de luz há sempre uma nota
        const idx = o.map((e, k) => e.v.startsWith('digital:') ? k : -1).filter(k => k >= 0);
        const mistura = idx.every((k, j) => j === 0 || o.slice(idx[j - 1], k).some(e => e.v.startsWith('tom:')));
        return t.length >= 4 && new Set(t).size >= 2 && p.on >= 3 && p.off >= 3 && mistura;
      });
      const chegou = saidasApos(r, v => v === 'botao:B').some(o => { const d = ultimoDig(o); return d && d[1] === '0' && temIcone(o, 'Asleep'); });
      return emergencia && chegou;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: luz e sirene ao mesmo tempo, como numa ambulância a sério. A ordem dos blocos é tudo!'],
      parecePronto: a => { const ev = a.evento('botao:A'); const d = digitais(ev); return blocos(ev, 'mk_repetir').length > 0 && d.some(p => p.v === 1) && d.some(p => p.v === 0) && new Set(blocos(ev, 'mk_tom').map(p => p.freq)).size >= 2 && icones(a.evento('botao:B'), 'Asleep').length > 0 && digitais(a.evento('botao:B')).some(p => p.v === 0); },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A, espera que acabe, e depois no B.',
      regras: [
        P.evento('botao:A', 'Quem liga o modo de emergência? Precisas de um botão.'),
        P.bloco('botao:A', 'mk_repetir', 'A sirene e a luz repetem-se muitas vezes. Que bloco repete por ti?'),
        P.regra('sem_luz', a => !digitais(a.evento('botao:A')).length, [
          'Ouve-se… e a luz de emergência?',
          'O LED liga-se com um bloco vermelho-escuro.',
          'Dentro do repetir: «para 1» e «para 0» do pin 2.',
        ], 'Luz a girar!'),
        P.regra('luz_nunca_apaga', a => { const d = digitais(a.evento('botao:A')); return d.length > 0 && !(d.some(p => p.v === 1) && d.some(p => p.v === 0)); }, [
          ['a_pensar', 'A luz fica sempre igual… assim não pisca.'],
          'Piscar é ligar e desligar.',
          'Dentro do repetir: liga, nota, desliga, nota.',
        ], 'Agora pisca!'),
        P.regra('sem_sirene', a => blocos(a.evento('botao:A'), 'mk_tom').length < 2, [
          'Uma ambulância calada? Falta a sirene!',
          'A sirene são duas notas a trocar.',
          'Põe dois «tocar tom» dentro do repetir.',
        ], 'Ni-nó!'),
        P.regra('uma_nota', a => new Set(blocos(a.evento('botao:A'), 'mk_tom').map(p => p.freq)).size < 2, [
          ['curiosa', 'Ni-ni-ni… uma sirene não muda de nota?'],
          'As duas notas têm de ser diferentes.',
          'Muda uma das notas (por exemplo Lá e Mi).',
        ], 'Ni-nó, ni-nó!'),
        P.evento('botao:B', 'E quando a ambulância chega ao hospital, quem desliga tudo?'),
        P.regra('b_nao_desliga', a => !(digitais(a.evento('botao:B')).some(p => p.v === 0) && icones(a.evento('botao:B'), 'Asleep').length), [
          'Chegou ao hospital: a luz apaga e o doente descansa.',
          'No B: desligar o pin 2 e um desenho de quem dorme.',
          'No B: «gravação digital pin P2 para 0» e a cara a dormir.',
        ], 'Chegámos!'),
      ],
      sucesso: 'Ambulância de emergência! Luz e som misturados dentro do mesmo «repetir»: é a ordem dos blocos que os junta.',
      extensao: 'E se a sirene fosse ficando mais rápida, como quando a ambulância se aproxima?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="160"><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">4</field></shadow></value><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">330</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value></block></next></block></next></block></statement></block></statement></block><block type="mk_botao" x="40" y="1760"><field name="B">B</field><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_icone"><field name="I">Asleep</field></block></next></block></statement></block></xml>',
        pedido: 'A luz da minha ambulância acende e fica acesa para sempre! Devia piscar. Ajudas-me?',
      },
    },
  };

  const CAIXA_MUSICA = {
    titulo: 'Caixa de música',
    missao: 'Uma caixa de música feita com um brinquedo velho: cada botão toca a sua melodia.',
    passos: [
      'No A: uma melodia de pelo menos 4 notas, com 3 notas diferentes.',
      'No B: outra melodia, diferente da do A.',
      'No logotipo: um coração e um som, para fechar o espetáculo.',
      'Experimenta: A, B e logotipo. Decora a caixa!',
    ],
    material: 'micro:bit V2 (altifalante), uma caixa ou brinquedo velho para decorar',
    novos: [],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_logo', 'mk_tom', 'th_tom_meia', 'mk_som', 'mk_icone_coracao', 'mk_pausa'],
    teste: 'botao:A',
    ok: r => {
      const ta = saidasApos(r, v => v === 'botao:A').map(tons).find(t => t.length >= 4 && new Set(t).size >= 3);
      const tb = saidasApos(r, v => v === 'botao:B').map(tons).find(t => t.length >= 4 && new Set(t).size >= 2);
      const fecho = causou(r, s => s.includes('icone:Heart') && s.some(x => x.startsWith('som:')), v => v === 'logo');
      return !!ta && !!tb && ta.join() !== tb.join() && fecho;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: uma caixa de música com duas melodias inventadas por ti. Primeiro trauteia, depois programa!'],
      parecePronto: a => { const fa = blocos(a.evento('botao:A'), 'mk_tom').map(p => p.freq), fb = blocos(a.evento('botao:B'), 'mk_tom').map(p => p.freq); return fa.length >= 4 && new Set(fa).size >= 3 && fb.length >= 4 && fa.join() !== fb.join() && icones(a.evento('logo'), 'Heart').length > 0 && tem(a.evento('logo'), 'mk_som'); },
      testar: 'Tens uma ideia? Vamos testar! A, depois B, depois o logotipo.',
      regras: [
        P.evento('botao:A', 'Quem toca a primeira melodia? Precisas de um botão.'),
        P.regra('a_curta', a => blocos(a.evento('botao:A'), 'mk_tom').length < 4, [
          ['curiosa', 'Uma melodia com tão poucas notas? Canta-a… acaba depressa!'],
          'Uma melodia precisa de pelo menos 4 notas.',
          'No A, põe 4 «tocar tom» seguidos.',
        ], 'Já é uma melodia!'),
        P.regra('a_repetida', a => new Set(blocos(a.evento('botao:A'), 'mk_tom').map(p => p.freq)).size < 3, [
          'Dó, dó, dó, dó… soa a despertador!',
          'Uma melodia sobe e desce: usa notas diferentes.',
          'Escolhe pelo menos 3 notas diferentes no A.',
        ], 'Isso já é música!'),
        P.evento('botao:B', 'E a segunda melodia? Outro botão!'),
        P.regra('b_curta', a => blocos(a.evento('botao:B'), 'mk_tom').length < 4, [
          'A melodia do B ainda é muito curtinha.',
          'Também precisa de 4 notas ou mais.',
          'No B, põe 4 «tocar tom».',
        ], 'Boa!'),
        P.regra('b_igual', a => blocos(a.evento('botao:B'), 'mk_tom').map(p => p.freq).join() === blocos(a.evento('botao:A'), 'mk_tom').map(p => p.freq).join(), [
          ['surpreendida', 'O A e o B tocam… a mesma coisa?'],
          'Inventa outra melodia para o B: muda a ordem ou as notas.',
          'Troca pelo menos uma nota da melodia do B.',
        ], 'Duas melodias!'),
        P.evento('logo', 'O grande final: quem o dispara? O logotipo.'),
        P.regra('final_incompleto', a => !(icones(a.evento('logo'), 'Heart').length && tem(a.evento('logo'), 'mk_som')), [
          'Um final de espetáculo tem música e…?',
          'No logotipo: um coração e um som.',
          'Põe «mostrar ícone» coração e «tocar som» no logotipo.',
        ], 'Bravo!'),
      ],
      sucesso: 'A caixa de música toca! Uma melodia é uma sequência de notas: os blocos tocam pela ordem em que os pões.',
      extensao: 'E se a melodia do A durasse mais tempo nas notas importantes? Experimenta mudar as batidas.',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="1920"><statement name="DO"><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">262</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">330</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">392</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">523</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value></block></next></block></next></block></next></block></statement></block><block type="mk_botao" x="40" y="160"><field name="B">B</field><statement name="DO"><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">262</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">330</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">392</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">523</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value></block></next></block></next></block></next></block></statement></block><block type="mk_logo" x="40" y="2240"><statement name="DO"><block type="mk_icone"><field name="I">Heart</field><next><block type="mk_som"><value name="S"><shadow type="mk_som_menu"><field name="V">twinkle</field></shadow></value></block></next></block></statement></block></xml>',
        pedido: 'A minha caixa de música tem dois botões… mas os dois tocam a mesma melodia! Encontras a gambiarra?',
      },
    },
  };

  const SEMAFORO = {
    titulo: 'Semáforo da pista',
    missao: 'Três LEDs fazem um semáforo para a pista dos carrinhos: verde, amarelo e vermelho.',
    passos: [
      'LED verde no pin 0, amarelo no pin 1, vermelho no pin 2 (as pernas curtas todas no GND).',
      'No A: acende o verde, pausa, apaga; depois o amarelo; depois o vermelho.',
      'Cada luz precisa de uma pausa para se ver.',
      'Experimenta: carrega no A e vê a sequência.',
    ],
    material: 'micro:bit, 3 LEDs (verde, amarelo, vermelho), 4 crocodilos, cartão para o semáforo',
    novos: ['mk_digital_p0_1', 'mk_digital_p0_0'],
    caixa: ['mk_botao', 'mk_digital_1', 'mk_digital_0', 'mk_pausa'],
    teste: 'botao:A',
    ok: r => saidasApos(r, v => v === 'botao:A').some(o => {
      const alvo = ['P0:1', 'P0:0', 'P1:1', 'P1:0', 'P2:1', 'P2:0'];
      const ts = [];
      for (const e of o) if (ts.length < 6 && e.v === 'digital:' + alvo[ts.length]) ts.push(e.t);
      return ts.length === 6 && ts[1] - ts[0] >= 300 && ts[3] - ts[2] >= 300 && ts[5] - ts[4] >= 300;
    }),
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: um semáforo a sério, com três luzes e três pinos. Atenção à ordem das cores!'],
      parecePronto: a => { const d = digitais(a.evento('botao:A')); const tem1 = p => d.some(x => x.pino === p && x.v === 1) && d.some(x => x.pino === p && x.v === 0); return tem1('P0') && tem1('P1') && tem1('P2') && blocos(a.evento('botao:A'), 'mk_pausa').length >= 3; },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A e vê as três luzes.',
      regras: [
        P.evento('botao:A', 'Quem põe o semáforo a trabalhar? Precisas de um botão.'),
        P.regra('sem_luzes', a => !digitais(a.evento('botao:A')).length, [
          'O semáforo tem três luzes. Que bloco manda eletricidade para um LED?',
          'É um bloco vermelho-escuro de pinos.',
          'Põe «gravação digital pin P0 para 1» no A.',
        ], 'A primeira luz!'),
        P.regra('falta_verde', a => !digitais(a.evento('botao:A')).some(p => p.pino === 'P0' && p.v === 1), [
          'Um semáforo começa pela cor que diz «podes ir». Qual é?',
          'O verde está no pin 0.',
          'Começa com «gravação digital pin P0 para 1».',
        ], 'Verde!'),
        P.regra('falta_amarelo', a => !digitais(a.evento('botao:A')).some(p => p.pino === 'P1' && p.v === 1), [
          'Depois do verde vem… a cor de «atenção»!',
          'O amarelo está no pin 1: escolhe P1 no menu do pino.',
          'Junta «gravação digital pin P1 para 1».',
        ], 'Amarelo!'),
        P.regra('falta_vermelho', a => !digitais(a.evento('botao:A')).some(p => p.pino === 'P2' && p.v === 1), [
          'E a cor de «pára»?',
          'O vermelho está no pin 2.',
          'Junta «gravação digital pin P2 para 1».',
        ], 'Vermelho!'),
        P.regra('nao_apaga', a => { const d = digitais(a.evento('botao:A')); return ['P0', 'P1', 'P2'].some(p => d.some(x => x.pino === p && x.v === 1) && !d.some(x => x.pino === p && x.v === 0)); }, [
          ['a_pensar', 'Já viste um semáforo com todas as luzes acesas ao mesmo tempo?'],
          'Antes de acender a cor seguinte, apaga a anterior.',
          'Depois de cada luz: pausa e «para 0» nesse pino.',
        ], 'Uma luz de cada vez!'),
        P.regra('sem_pausas', a => blocos(a.evento('botao:A'), 'mk_pausa').length < 3, [
          'As luzes passam tão depressa que nem se vêem!',
          'Cada cor precisa de tempo acesa.',
          'Põe uma «pausa» depois de acender cada cor.',
        ], 'Agora vê-se cada cor!'),
      ],
      sucesso: 'Semáforo a funcionar! Três pinos, três LEDs e a ordem certa: verde, amarelo, vermelho.',
      extensao: 'E se o semáforo repetisse a sequência sozinho, sem parar? Experimenta «para sempre».',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="160"><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P0</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P0</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P1</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P1</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>',
        pedido: 'O meu semáforo pisca tão depressa que os carrinhos nem sabem quando passar! Encontras a gambiarra?',
      },
    },
  };

  // ============================================================ NÍVEL 2 · projetos maiores (7–11)
  const MARIONETA = {
    titulo: 'Marioneta dançarina',
    missao: 'Um boneco de cartão no servo dança uma coreografia: vira, muda de cara e faz uma vénia com música.',
    passos: [
      'Prende o boneco ao braço do servo (pin 0).',
      'No A: pelo menos 4 posições do servo, com 3 ângulos diferentes (por exemplo 0, 90, 180, 90).',
      'Depois de cada posição, uma pausa.',
      'Muda a cara do boneco pelo menos duas vezes durante a dança.',
      'No fim, um som: é a vénia!',
    ],
    material: 'micro:bit V2, servo SG90, 3 crocodilos, cartão, palitos, cola',
    novos: [],
    caixa: ['mk_botao', 'mk_servo', 'th_servo_0', 'th_servo_180', 'th_pausa_500', 'mk_pausa', 'mk_icone', 'mk_icone_surpreendido', 'mk_som', 'mk_repetir'],
    teste: 'botao:A',
    ok: r => saidasApos(r, v => v === 'botao:A').some(o => {
      const s = o.filter(e => e.v.startsWith('servo:'));
      const caras = new Set(o.filter(e => e.v.startsWith('icone:')).map(e => e.v));
      const ultimoServo = o.lastIndexOf(s[s.length - 1]);
      const venia = o.slice(ultimoServo + 1).some(e => e.v.startsWith('som:') || e.v.startsWith('tom:'));
      return s.length >= 4 && new Set(s.map(e => angulo(e.v))).size >= 3 && comPausas(s, 300) && caras.size >= 2 && venia;
    }),
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: uma coreografia! Pensa primeiro na dança — esquerda, centro, direita… — e só depois programa.'],
      parecePronto: a => { const ev = a.evento('botao:A'); const s = servos(ev); return s.length >= 4 && new Set(s.map(p => p.angulo)).size >= 3 && blocos(ev, 'mk_pausa').length >= 3 && new Set(icones(ev).map(p => p.icone)).size >= 2 && temTom(ev); },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A e vê o boneco dançar.',
      regras: [
        P.evento('botao:A', 'Quem dá início ao espetáculo? Precisas de um botão.'),
        P.bloco('botao:A', 'mk_servo', 'O boneco está preso ao servo. Que bloco o põe a mexer?'),
        P.regra('poucos_passos', a => servos(a.evento('botao:A')).length < 4, [
          ['curiosa', 'Uma dança com tão poucos passos? Conta os teus passos de dança…'],
          'A coreografia precisa de pelo menos 4 posições.',
          'Põe 4 blocos «escrever servo», um para cada passo.',
        ], 'Já é uma dança!'),
        P.regra('poucos_angulos', a => new Set(servos(a.evento('botao:A')).map(p => p.angulo)).size < 3, [
          'O boneco vai sempre para os mesmos sítios…',
          'Usa ângulos diferentes: um lado, o meio e o outro lado.',
          'Escolhe pelo menos 3 ângulos: 0, 90 e 180.',
        ], 'Que variedade!'),
        P.regra('sem_pausas', a => blocos(a.evento('botao:A'), 'mk_pausa').length < 3, [
          ['a_pensar', 'O boneco quase não se mexe… o servo tem tempo de chegar?'],
          'Um motor demora a rodar. Dá-lhe tempo.',
          'Põe uma «pausa» depois de cada servo.',
        ], 'Agora dança a sério!'),
        P.regra('sem_caras', a => new Set(icones(a.evento('botao:A')).map(p => p.icone)).size < 2, [
          'O boneco dança sempre com a mesma cara?',
          'Um bailarino muda de expressão: alegre, surpreendido…',
          'Põe dois «mostrar ícone» diferentes no meio da dança.',
        ], 'Que expressivo!'),
        P.regra('sem_venia', a => !temTom(a.evento('botao:A')), [
          'A dança acaba… e o público não ouve nada?',
          'Uma vénia com música no fim.',
          'No fim da dança, põe um «tocar som».',
        ], 'Bravo! Bravo!'),
      ],
      sucesso: 'Marioneta dançarina! Uma coreografia é um programa: posições, tempos e expressões pela ordem certa.',
      extensao: 'E se a dança se repetisse 2 vezes, cada vez mais depressa?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="160"><statement name="DO"><block type="mk_icone"><field name="I">Happy</field><next><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">90</field></shadow></value><next><block type="mk_icone"><field name="I">Surprised</field><next><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">180</field></shadow></value><next><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">90</field></shadow></value><next><block type="mk_som"><value name="S"><shadow type="mk_som_menu"><field name="V">happy</field></shadow></value></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>',
        pedido: 'A minha marioneta devia dançar, mas só treme no sítio! Que gambiarra fiz?',
      },
    },
  };

  const CAIXA_SURPRESA = {
    titulo: 'Caixa-surpresa',
    missao: 'Quando alguém abre a tampa, entra luz: o boneco salta, faz cara de espanto e ri-se.',
    passos: [
      'O micro:bit fica dentro da caixa, com o ecrã virado para a tampa.',
      '«para sempre» + «se … então … senão» com «nível de luz > 100».',
      'Tampa aberta (muita luz): servo a 180, cara surpreendida e um som.',
      'Tampa fechada (escuro): servo a 0 e limpar ecrã.',
      'Experimenta com o controlo da luz.',
    ],
    material: 'micro:bit V2, servo SG90, 3 crocodilos, uma caixa de sapatos, um boneco de cartão',
    novos: ['mk_luz', 'th_comparar_luz', 'mk_limpar'],
    caixa: ['mk_sempre', 'mk_se_senao', 'th_servo_180', 'th_servo_0', 'mk_icone_surpreendido', 'mk_som'],
    teste: 'luz',
    sim: ['luz'],
    ok: r => aposSensor(r, 'luz', v => v > 150, s => s.some(x => x.startsWith('servo:') && angulo(x) >= 150) && s.includes('icone:Surprised') && s.some(x => x.startsWith('som:') || x.startsWith('tom:'))) &&
      aposSensor(r, 'luz', v => v < 50, s => s.some(x => x.startsWith('servo:') && angulo(x) <= 30)),
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: uma caixa-surpresa! O micro:bit tem um sensor de luz no ecrã: tampa aberta = luz, tampa fechada = escuro.'],
      parecePronto: a => { const s = seNo(a.evento('sempre')); return !!s && comparacoes(a.evento('sempre'), ['>', '>=']) && dentro(a.evento('sempre'), 'mk_se', 'mk_luz') && ramoTem(s.sim, p => p.tipo === 'mk_servo' && Number(p.angulo) >= 150) && ramoTem(s.sim, p => p.icone === 'Surprised') && ramoTem(s.sim, p => p.tipo === 'mk_som' || p.tipo === 'mk_tom') && ramoTem(s.nao, p => p.tipo === 'mk_servo' && Number(p.angulo) <= 30); },
      testar: 'Tens uma ideia? Vamos testar! Sobe a luz (tampa aberta) e depois desce-a (tampa fechada).',
      regras: [
        P.evento('sempre', 'A caixa tem de estar sempre atenta à tampa. Que bloco nunca pára?'),
        P.bloco('sempre', 'mk_se', 'Tampa aberta ou fechada: são duas situações. Que bloco escolhe entre duas coisas?'),
        P.valorEm('sempre', 'mk_se', 'mk_luz', 'Como é que o micro:bit sabe que a tampa abriu? Pensa no que entra na caixa…'),
        P.regra('ao_contrario', a => comparacoes(a.evento('sempre'), ['<', '<=']), [
          ['surpreendida', 'Assim o boneco salta quando a caixa está fechada!'],
          'Tampa aberta = MAIS luz.',
          'Usa «nível de luz > 100».',
        ], 'Agora sim!'),
        P.regra('abre_sem_salto', a => { const s = seNo(a.evento('sempre')); return !!s && !ramoTem(s.sim, p => p.tipo === 'mk_servo' && Number(p.angulo) >= 150); }, [
          'A tampa abre… e o boneco fica lá dentro?',
          'O salto é o servo a rodar para cima.',
          'No «então», põe o servo a 180.',
        ], 'Boing!'),
        P.regra('abre_sem_espanto', a => { const s = seNo(a.evento('sempre')); return !!s && !ramoTem(s.sim, p => p.icone === 'Surprised'); }, [
          'Que cara faz o boneco quando a tampa abre?',
          'Há uma cara de espanto na lista.',
          'No «então», mostra a cara surpreendida.',
        ], 'Ah!'),
        P.regra('abre_sem_som', a => { const s = seNo(a.evento('sempre')); return !!s && !ramoTem(s.sim, p => p.tipo === 'mk_som' || p.tipo === 'mk_tom'); }, [
          'Uma surpresa sem barulho não assusta ninguém!',
          'Junta um som no «então».',
          'No «então», põe «tocar som» (por exemplo «riso»).',
        ], 'Surpresa!'),
        P.regra('fecha_nao_volta', a => { const s = seNo(a.evento('sempre')); return !!s && !ramoTem(s.nao, p => p.tipo === 'mk_servo' && Number(p.angulo) <= 30); }, [
          'Fechas a tampa… e o boneco fica de pé, entalado?',
          'No «senão», o boneco volta a deitar-se.',
          'No «senão», põe o servo a 0 e limpa o ecrã.',
        ], 'Pronto para a próxima surpresa!'),
      ],
      sucesso: 'Caixa-surpresa! O sensor de luz transforma a tampa num interruptor invisível.',
      extensao: 'E se a surpresa fosse diferente de cada vez? Pensa em como escolher ao acaso…',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="160"><statement name="DO"><block type="mk_se"><value name="C"><block type="mk_comparar"><field name="OP">&lt;</field><value name="A"><block type="mk_luz"></block></value><value name="B"><shadow type="mk_num"><field name="NUM">100</field></shadow></value></block></value><statement name="SIM"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">180</field></shadow></value><next><block type="mk_icone"><field name="I">Surprised</field><next><block type="mk_som"><value name="S"><shadow type="mk_som_menu"><field name="V">giggle</field></shadow></value></block></next></block></next></block></statement><statement name="NAO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_limpar"></block></next></block></statement></block></statement></block></xml>',
        pedido: 'A minha caixa-surpresa está maluca: o boneco salta quando fecho a tampa! Que gambiarra fiz?',
      },
    },
  };

  const GUARDA = {
    titulo: 'Guarda dos brinquedos',
    missao: 'Um boneco-guarda vigia a caixa dos brinquedos: com barulho levanta o braço e liga o alarme; em silêncio, dorme.',
    passos: [
      'Servo no pin 0 (o braço do guarda) e LED no pin 2.',
      '«para sempre» + «se nível de som > limite».',
      'Com barulho: servo a 180, LED aceso e o ícone ✗.',
      'Em silêncio: servo a 0, LED apagado e a cara a dormir.',
      'Experimenta com o controlo do som.',
    ],
    material: 'micro:bit V2, servo SG90, 1 LED, 5 crocodilos, um boneco',
    novos: ['mk_icone_nao'],
    caixa: ['mk_sempre', 'mk_se_senao', 'th_comparar_maior', 'mk_som_nivel', 'th_servo_180', 'th_servo_0', 'mk_digital_1', 'mk_digital_0', 'mk_icone_dormir'],
    teste: 'som',
    sim: ['som'],
    ok: r => aposSensor(r, 'som', v => v > 200, s => s.some(x => x.startsWith('servo:') && angulo(x) >= 150) && s.some(x => /^digital:P\d:1$/.test(x)) && s.includes('icone:No')) &&
      aposSensor(r, 'som', v => v < 30, s => s.some(x => x.startsWith('servo:') && angulo(x) <= 30) && s.some(x => /^digital:P\d:0$/.test(x)) && s.includes('icone:Asleep')),
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: um guarda para os brinquedos! Três coisas a acontecer ao mesmo tempo: braço, luz e cara.'],
      parecePronto: a => { const s = seNo(a.evento('sempre')); return !!s && dentro(a.evento('sempre'), 'mk_se', 'mk_som_nivel') && comparacoes(a.evento('sempre'), ['>', '>=']) && ramoTem(s.sim, p => p.tipo === 'mk_servo' && Number(p.angulo) >= 150) && ramoTem(s.sim, p => p.tipo === 'mk_digital' && p.v === 1) && ramoTem(s.sim, p => p.icone === 'No') && ramoTem(s.nao, p => p.tipo === 'mk_servo' && Number(p.angulo) <= 30) && ramoTem(s.nao, p => p.tipo === 'mk_digital' && p.v === 0) && ramoTem(s.nao, p => p.icone === 'Asleep'); },
      testar: 'Tens uma ideia? Vamos testar! Sobe o som (barulho) e depois desce-o (silêncio).',
      regras: [
        P.evento('sempre', 'Um guarda nunca deixa de vigiar. Que bloco repete para sempre?'),
        P.bloco('sempre', 'mk_se', 'Barulho ou silêncio: duas situações, duas reações. Que bloco escolhe?'),
        P.valorEm('sempre', 'mk_se', 'mk_som_nivel', 'Como é que o guarda ouve? O micro:bit V2 tem um microfone…'),
        P.regra('ao_contrario', a => comparacoes(a.evento('sempre'), ['<', '<=']), [
          ['surpreendida', 'Assim o alarme toca quando está tudo calado!'],
          'Barulho = MAIS som.',
          'Usa «nível de som > 128».',
        ], 'Agora sim!'),
        P.regra('barulho_incompleto', a => { const s = seNo(a.evento('sempre')); return !!s && !(ramoTem(s.sim, p => p.tipo === 'mk_servo' && Number(p.angulo) >= 150) && ramoTem(s.sim, p => p.tipo === 'mk_digital' && p.v === 1) && ramoTem(s.sim, p => p.icone === 'No')); }, [
          'Quando há barulho, o guarda faz três coisas. Quais?',
          'Levanta o braço (servo), liga o alarme (LED) e mostra um ✗.',
          'No «então»: servo a 180, pin 2 para 1 e o ícone ✗.',
        ], 'Alerta!'),
        P.regra('silencio_incompleto', a => { const s = seNo(a.evento('sempre')); return !!s && !(ramoTem(s.nao, p => p.tipo === 'mk_servo' && Number(p.angulo) <= 30) && ramoTem(s.nao, p => p.tipo === 'mk_digital' && p.v === 0) && ramoTem(s.nao, p => p.icone === 'Asleep')); }, [
          'E quando tudo se acalma? O guarda fica de braço no ar e alarme ligado?',
          'No silêncio: baixa o braço, apaga o alarme, dorme.',
          'No «senão»: servo a 0, pin 2 para 0 e a cara a dormir.',
        ], 'Boa noite, guarda!'),
      ],
      sucesso: 'Guarda a postos! Um «se … senão» com três ações em cada lado: braço, luz e cara.',
      extensao: 'E se o guarda contasse quantas vezes houve barulho? (Isso é para o nível 3!)',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="160"><statement name="DO"><block type="mk_se"><value name="C"><block type="mk_comparar"><field name="OP">&gt;</field><value name="A"><block type="mk_som_nivel"></block></value><value name="B"><shadow type="mk_num"><field name="NUM">128</field></shadow></value></block></value><statement name="SIM"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">180</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_icone"><field name="I">No</field></block></next></block></next></block></statement><statement name="NAO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_icone"><field name="I">Asleep</field></block></next></block></next></block></statement></block></statement></block></xml>',
        pedido: 'O alarme do meu guarda nunca se apaga, mesmo em silêncio! Que gambiarra fiz?',
      },
    },
  };

  const PISCAS_A_SERIO = {
    titulo: 'Piscas a sério',
    missao: 'O carrinho ganha piscas: inclinas para um lado e pisca esse lado; o B liga os quatro piscas.',
    passos: [
      'LED da esquerda no pin 1, LED da direita no pin 2 (pernas curtas no GND).',
      'Inclinado para a esquerda: o pin 1 pisca 3 vezes, com pausas.',
      'Inclinado para a direita: o pin 2 pisca 3 vezes.',
      'No B: os dois piscam juntos 3 vezes (luzes de emergência).',
      'Experimenta os três.',
    ],
    material: 'micro:bit, 2 LEDs cor de laranja, 4 crocodilos, um carrinho',
    novos: ['th_digital_p1_1', 'th_digital_p1_0'],
    caixa: ['mk_gesto', 'mk_gesto_direita', 'mk_botao_B', 'mk_repetir', 'mk_digital_1', 'mk_digital_0', 'mk_pausa'],
    teste: 'gesto:left',
    sim: ['gesto:left', 'gesto:right'],
    ok: r => {
      const lado = (ent, sim, nao) => saidasApos(r, v => v === ent).some(o => { const p = piscas(o, sim); return p.on >= 3 && p.off >= 3 && comPausas(p.d, 150) && piscas(o, nao).on === 0; });
      const emergencia = saidasApos(r, v => v === 'botao:B').some(o => piscas(o, 'P1').on >= 3 && piscas(o, 'P2').on >= 3 && piscas(o, 'P1').off >= 3 && piscas(o, 'P2').off >= 3);
      return lado('gesto:left', 'P1', 'P2') && lado('gesto:right', 'P2', 'P1') && emergencia;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: piscas para virar e luzes de emergência. Atenção a qual pino é de cada lado!'],
      parecePronto: a => { const pis = (ev, p) => digitais(ev).some(x => x.pino === p && x.v === 1) && digitais(ev).some(x => x.pino === p && x.v === 0); return pis(a.evento('gesto:left'), 'P1') && !pis(a.evento('gesto:left'), 'P2') && pis(a.evento('gesto:right'), 'P2') && !pis(a.evento('gesto:right'), 'P1') && pis(a.evento('botao:B'), 'P1') && pis(a.evento('botao:B'), 'P2') && ['gesto:left', 'gesto:right', 'botao:B'].every(k => blocos(a.evento(k), 'mk_repetir').length && blocos(a.evento(k), 'mk_pausa').length >= 2); },
      testar: 'Tens uma ideia? Vamos testar! Inclinar à esquerda, à direita, e o B.',
      regras: [
        P.evento('gesto:left', 'Viras para a esquerda: o carrinho inclina-se. Que bloco sente isso?'),
        P.regra('esq_pino_errado', a => !digitais(a.evento('gesto:left')).some(p => p.pino === 'P1'), [
          'O pisca da esquerda está ligado a que pino?',
          'O LED da esquerda está no pin 1: escolhe P1 no menu.',
          'Na esquerda, usa «gravação digital pin P1».',
        ], 'Esquerda certa!'),
        P.evento('gesto:right', 'E para a direita? Outro movimento, outro bloco.'),
        P.regra('dir_pino_errado', a => !digitais(a.evento('gesto:right')).some(p => p.pino === 'P2') || digitais(a.evento('gesto:right')).some(p => p.pino === 'P1'), [
          ['surpreendida', 'Viras à direita e pisca… a esquerda?'],
          'O LED da direita está no pin 2.',
          'Na direita, usa só o pin P2.',
        ], 'Direita certa!'),
        P.evento('botao:B', 'As luzes de emergência ligam-se num botão. Qual?'),
        P.regra('emergencia_um_so', a => { const d = digitais(a.evento('botao:B')); return !(d.some(p => p.pino === 'P1' && p.v === 1) && d.some(p => p.pino === 'P2' && p.v === 1)); }, [
          'Nas luzes de emergência piscam os dois lados ao mesmo tempo.',
          'No B, liga o P1 e o P2, um a seguir ao outro.',
          'No B: P1 para 1, P2 para 1, pausa, P1 para 0, P2 para 0, pausa.',
        ], 'Pisca-pisca!'),
        P.regra('sem_repetir', a => ['gesto:left', 'gesto:right', 'botao:B'].some(k => a.evento(k) && digitais(a.evento(k)).length && !blocos(a.evento(k), 'mk_repetir').length), [
          'Um pisca pisca várias vezes. Vais copiar tudo três vezes?',
          'Há um bloco verde que repete.',
          'Põe os blocos do pisca dentro de «repetir 3 vezes».',
        ], 'Muito melhor!'),
        P.regra('sem_pausas', a => ['gesto:left', 'gesto:right', 'botao:B'].some(k => a.evento(k) && digitais(a.evento(k)).length && blocos(a.evento(k), 'mk_pausa').length < 2), [
          ['a_pensar', 'O pisca dá só um tremelique…'],
          'A luz precisa de tempo acesa e apagada.',
          'Põe uma pausa depois de ligar e outra depois de desligar.',
        ], 'Agora pisca a sério!'),
      ],
      sucesso: 'Piscas a sério! O acelerómetro sabe para que lado inclinas e cada lado tem o seu pino.',
      extensao: 'E se o carrinho apitasse quando está virado ao contrário (capotou)?',
      gambiarra: {
        xml: '<xml><block type="mk_gesto" x="40" y="2400"><field name="G">left</field><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">3</field></shadow></value><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P1</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P1</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value></block></next></block></next></block></next></block></statement></block></statement></block><block type="mk_gesto" x="40" y="160"><field name="G">right</field><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">3</field></shadow></value><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P1</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P1</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value></block></next></block></next></block></next></block></statement></block></statement></block><block type="mk_botao" x="40" y="2720"><field name="B">B</field><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">3</field></shadow></value><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P1</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P1</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value></block></next></block></next></block></next></block></next></block></next></block></statement></block></statement></block></xml>',
        pedido: 'Inclino o carrinho para a direita e pisca a esquerda! Encontras a gambiarra?',
      },
    },
  };

  const AMBULANCIA_HACKEADA = {
    titulo: 'Ambulância hackeada',
    missao: 'A ambulância liga a sirene com o A e o micro:bit ouve-a: com barulho, a luz de emergência acende sozinha.',
    passos: [
      'LED no pin 2 e no GND, micro:bit preso na ambulância.',
      'No A: a sirene, com «repetir» e duas notas a trocar.',
      '«para sempre» + «se nível de som > 128»: LED aceso; senão, apagado.',
      'Experimenta: A; depois o controlo do som, alto e baixo.',
    ],
    material: 'micro:bit V2, 1 LED, 2 crocodilos, a ambulância de brinquedo',
    novos: [],
    caixa: ['mk_botao', 'mk_repetir', 'th_tom_meia', 'mk_tom', 'mk_sempre', 'mk_se_senao', 'th_comparar_maior', 'mk_som_nivel', 'mk_digital_1', 'mk_digital_0'],
    teste: 'botao:A',
    sim: ['som'],
    ok: r => saidasApos(r, v => v === 'botao:A').some(o => { const t = tons(o); return t.length >= 6 && new Set(t).size >= 2 && alterna(t); }) &&
      aposSensor(r, 'som', v => v > 200, s => s.some(x => /^digital:P\d:1$/.test(x))) &&
      aposSensor(r, 'som', v => v < 30, s => s.some(x => /^digital:P\d:0$/.test(x))),
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: dois programas ao mesmo tempo! Um toca a sirene; o outro ouve e acende a luz.'],
      parecePronto: a => { const ev = a.evento('botao:A'); const s = seNo(a.evento('sempre')); return blocos(ev, 'mk_repetir').length > 0 && new Set(blocos(ev, 'mk_tom').map(p => p.freq)).size >= 2 && !!s && dentro(a.evento('sempre'), 'mk_se', 'mk_som_nivel') && comparacoes(a.evento('sempre'), ['>', '>=']) && ramoTem(s.sim, p => p.tipo === 'mk_digital' && p.v === 1) && ramoTem(s.nao, p => p.tipo === 'mk_digital' && p.v === 0); },
      testar: 'Tens uma ideia? Vamos testar! A para a sirene; depois mexe no controlo do som.',
      regras: [
        P.evento('botao:A', 'Quem liga a sirene? Precisas de um botão.'),
        P.regra('sirene_fraca', a => !blocos(a.evento('botao:A'), 'mk_repetir').length || new Set(blocos(a.evento('botao:A'), 'mk_tom').map(p => p.freq)).size < 2, [
          ['curiosa', 'A sirene faz «ni-nó» muitas vezes. O que precisas?'],
          'Um «repetir» com duas notas diferentes lá dentro.',
          'No A: «repetir 4 vezes» com duas notas (Lá e Mi).',
        ], 'Ni-nó, ni-nó!'),
        P.evento('sempre', 'Agora a parte que ouve: tem de estar sempre atenta. Que bloco?'),
        P.bloco('sempre', 'mk_se', 'Com barulho ou sem barulho: que bloco escolhe?'),
        P.valorEm('sempre', 'mk_se', 'mk_som_nivel', 'O micro:bit tem de OUVIR a sirene. Que sensor usa?'),
        P.regra('ao_contrario', a => comparacoes(a.evento('sempre'), ['<', '<=']), [
          ['surpreendida', 'Assim a luz acende quando está tudo calado!'],
          'Com sirene, há MAIS som.',
          'Usa «nível de som > 128».',
        ], 'Agora sim!'),
        P.regra('luz_errada', a => { const s = seNo(a.evento('sempre')); return !!s && !(ramoTem(s.sim, p => p.tipo === 'mk_digital' && p.v === 1) && ramoTem(s.nao, p => p.tipo === 'mk_digital' && p.v === 0)); }, [
          'A luz tem de acender com barulho e apagar em silêncio.',
          '«para 1» no então, «para 0» no senão.',
          'No «então»: pin 2 para 1. No «senão»: pin 2 para 0.',
        ], 'Luz automática!'),
      ],
      sucesso: 'Ambulância hackeada! O micro:bit ouve a sua própria sirene: um brinquedo que se sente a si mesmo.',
      extensao: 'E se a luz piscasse mais depressa quando o som é mais forte?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="2880"><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">4</field></shadow></value><statement name="DO"><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">330</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value></block></next></block></statement></block></statement></block><block type="mk_sempre" x="40" y="160"><statement name="DO"><block type="mk_se"><value name="C"><block type="mk_comparar"><field name="OP">&gt;</field><value name="A"><block type="mk_luz"></block></value><value name="B"><shadow type="mk_num"><field name="NUM">128</field></shadow></value></block></value><statement name="SIM"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement><statement name="NAO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block></statement></block></statement></block></xml>',
        pedido: 'A minha ambulância acende a luz quando está ao sol, não quando apita! Que gambiarra é esta?',
      },
    },
  };

  // ============================================================ NÍVEL 3 · curto (6) e projetos maiores (7–11)
  const BOLA_CRISTAL = {
    titulo: 'Bola de cristal',
    missao: 'Abana a bola de cristal e ela responde ao acaso: sim, não ou talvez.',
    passos: ['Em agitar: definir medida para «escolher ao acaso de 1 até 3».', 'Se medida = 1 → ✔; se medida = 2 → ✗; se medida = 3 → cara surpreendida.', 'Experimenta: agita várias vezes.'],
    material: 'micro:bit, um frasco ou bola de plástico',
    novos: ['th_aleatorio_1_3', 'mk_se_entao', 'th_comparar_igual'],
    caixa: ['mk_agitar', 'th_definir_medida', 'th_var_medida', 'mk_icone_sim', 'mk_icone_nao', 'mk_icone_surpreendido'],
    teste: 'agitar',
    ok: r => {
      const resp = saidasApos(r, v => v === 'agitar').map(o => o.filter(e => e.v.startsWith('icone:')).map(e => e.v.slice(6))).filter(l => l.length);
      const todas = resp.flat();
      return resp.length >= 4 && new Set(todas).size >= 2 && todas.every(x => ['Yes', 'No', 'Surprised'].includes(x));
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Uma bola de cristal que responde a tudo! O segredo é o acaso: nem o micro:bit sabe o que vai dizer.'],
      parecePronto: a => { const ev = a.evento('agitar'); return dentro(ev, 'mk_var_definir', 'mk_aleatorio') && ses(ev).length >= 3 && new Set(icones(ev).map(p => p.icone)).size >= 3; },
      testar: 'Tens uma ideia? Vamos testar! Carrega em Agitar várias vezes.',
      regras: [
        P.evento('agitar', 'Uma bola de cristal responde quando a abanas. Que bloco sente o abanão?'),
        P.bloco('agitar', 'mk_var_definir', 'A resposta tem de ficar guardada para depois a podermos ver. Onde guardas um número?'),
        P.valorEm('agitar', 'mk_var_definir', 'mk_aleatorio', 'Se a resposta for sempre a mesma, é batota! Como se escolhe um número ao acaso?'),
        P.bloco('agitar', 'mk_se', 'O número está guardado. Como decides que desenho mostrar para cada número?'),
        P.regra('poucas_respostas', a => ses(a.evento('agitar')).length < 3 || new Set(icones(a.evento('agitar')).map(p => p.icone)).size < 3, [
          'Três números possíveis… quantas respostas tem a tua bola?',
          'Precisas de um «se» para cada número: 1, 2 e 3.',
          'Faz três «se medida = …» com ✔, ✗ e a cara surpreendida.',
        ], 'Sim, não, talvez!'),
      ],
      sucesso: 'A bola de cristal responde! «Escolher ao acaso» faz o micro:bit imprevisível — como um dado.',
      extensao: 'E se ela tivesse uma quarta resposta, «pergunta outra vez»?',
      gambiarra: {
        xml: '<xml><block type="mk_agitar" x="40" y="160"><statement name="DO"><block type="mk_var_definir"><field name="VAR">medida</field><value name="V"><block type="mk_aleatorio"><value name="A"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><value name="B"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></value><next><block type="mk_se_entao"><value name="C"><block type="mk_comparar"><field name="OP">==</field><value name="A"><block type="mk_var"><field name="VAR">medida</field></block></value><value name="B"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></value><statement name="SIM"><block type="mk_icone"><field name="I">Yes</field></block></statement><next><block type="mk_se_entao"><value name="C"><block type="mk_comparar"><field name="OP">==</field><value name="A"><block type="mk_var"><field name="VAR">medida</field></block></value><value name="B"><shadow type="mk_num"><field name="NUM">2</field></shadow></value></block></value><statement name="SIM"><block type="mk_icone"><field name="I">No</field></block></statement><next><block type="mk_se_entao"><value name="C"><block type="mk_comparar"><field name="OP">==</field><value name="A"><block type="mk_var"><field name="VAR">medida</field></block></value><value name="B"><shadow type="mk_num"><field name="NUM">3</field></shadow></value></block></value><statement name="SIM"><block type="mk_icone"><field name="I">Surprised</field></block></statement></block></next></block></next></block></next></block></statement></block></xml>',
        pedido: 'A minha bola de cristal diz sempre que sim… Será batota? Encontras a gambiarra?',
      },
    },
  };

  const MONSTRO = {
    titulo: 'Monstro das bolachas',
    missao: 'Um monstro de cartão com boca de alumínio conta as bolachas que come e, à terceira, fica cheio e feliz.',
    passos: [
      'Boca de alumínio: crocodilo no pin 1 e no GND (a bolacha com alumínio fecha o circuito).',
      'No arranque: pontos a 0.',
      'No pin 1: mudar pontos em 1, um som de «nham» e mostrar os pontos.',
      'Ainda no pin 1: se pontos ≥ 3 → cara contente (está cheio!).',
      'No A+B: pontos a 0 outra vez (nova refeição).',
    ],
    material: 'micro:bit, 2 crocodilos, alumínio, uma caixa de cartão para o monstro, bolachas de cartão com alumínio',
    novos: ['th_definir_pontos0', 'th_mudar_pontos', 'th_var_pontos', 'th_comparar_pontos3'],
    caixa: ['mk_iniciar', 'mk_pino_tocado', 'mk_botao_AB', 'mk_mostrar_numero', 'mk_se_entao', 'mk_tom', 'mk_som', 'mk_icone'],
    teste: 'pino:P1',
    ok: r => {
      const refeicoes = saidasApos(r, v => v.startsWith('pino:'));
      const f1 = refeicoes.find(o => numDe(o) === 1), f2 = refeicoes.find(o => numDe(o) === 2), f3 = refeicoes.find(o => numDe(o) === 3);
      return !!f1 && !!f2 && !!f3 && !temIcone(f1, 'Happy') && !temIcone(f2, 'Happy') && temIcone(f3, 'Happy') &&
        refeicoes.every(temSom) && causou(r, s => s.includes('var:pontos:0'), v => v === 'botao:AB');
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: um monstro comilão! Ele precisa de memória (uma variável) para saber quantas bolachas já comeu.'],
      parecePronto: a => { const ev = pinos(a)[0]; return blocos(a.evento('inicio'), 'mk_var_definir').some(p => p.var === 'pontos') && !!ev && blocos(ev, 'mk_var_mudar').length > 0 && temTom(ev) && dentro(ev, 'mk_mostrar_numero', 'mk_var') && ses(ev).length > 0 && blocos(a.evento('botao:AB'), 'mk_var_definir').length > 0; },
      testar: 'Tens uma ideia? Vamos testar! Toca 3 vezes no pin 1 (devagar!) e depois A+B.',
      regras: [
        P.evento('inicio', 'Antes de comer, o monstro tem a barriga vazia. Onde se arruma isso, logo quando o micro:bit liga?'),
        P.regra('sem_zero', a => !blocos(a.evento('inicio'), 'mk_var_definir').length, [
          'A barriga começa com quantas bolachas?',
          'Há um bloco vermelho que guarda um valor numa variável.',
          'No arranque: «definir pontos para 0».',
        ], 'Barriga vazia, pronta!'),
        P.evento('pino:', 'A bolacha toca na boca de alumínio e fecha o circuito. Que bloco dá por isso?'),
        P.regra('nao_conta', a => !pinos(a).some(e => blocos(e, 'mk_var_mudar').length), [
          ['curiosa', 'Ele come… e esquece-se logo? Tem de contar!'],
          'Cada bolacha soma 1 à variável.',
          'No pin 1: «mudar pontos em 1».',
        ], 'Uma bolacha!'),
        P.regra('mudo', a => !pinos(a).some(temTom), [
          'Um monstro que come sem fazer barulho? Nham!',
          'Junta um som ou uma nota.',
          'No pin 1, põe um «tocar tom» curtinho.',
        ], 'Nham nham!'),
        P.regra('nao_mostra', a => !pinos(a).some(e => blocos(e, 'mk_mostrar_numero').length), [
          'Quantas bolachas já comeu? Ninguém sabe…',
          'Há um bloco azul que mostra números.',
          'No pin 1: «mostrar número».',
        ], 'Já se vê a conta!'),
        P.valorEm('pino:', 'mk_mostrar_numero', 'mk_var', 'O número que aparece é sempre o mesmo? Devia ser a conta das bolachas…'),
        P.regra('nunca_cheio', a => !pinos(a).some(e => ses(e).length), [
          'Quando é que o monstro fica cheio?',
          'Precisas de um «se» que compare as bolachas com 3.',
          'No pin 1: «se pontos ≥ 3 então» cara contente.',
        ], 'Cheio e feliz!'),
        P.evento('botao:AB', 'E para uma nova refeição? Um botão que esvazia a barriga.'),
        P.regra('nao_recomeca', a => !blocos(a.evento('botao:AB'), 'mk_var_definir').length, [
          'Carregas no A+B e a conta continua…',
          'Recomeçar é pôr a variável outra vez a 0.',
          'No A+B: «definir pontos para 0».',
        ], 'Nova refeição!'),
      ],
      sucesso: 'O monstro come, conta e fica cheio! Uma variável é a memória do brinquedo.',
      extensao: 'E se, depois de cheio, o monstro arrotasse e mostrasse a cara pateta?',
      gambiarra: {
        xml: '<xml><block type="mk_iniciar" x="40" y="3200"><statement name="DO"><block type="mk_var_definir"><field name="VAR">pontos</field><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block></statement></block><block type="mk_pino_tocado" x="40" y="3360"><field name="P">P1</field><statement name="DO"><block type="mk_var_mudar"><field name="VAR">pontos</field><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">262</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.25</field></shadow></value><next><block type="mk_mostrar_numero"><value name="N"><block type="mk_var"><field name="VAR">pontos</field></block></value><next><block type="mk_se_entao"><value name="C"><block type="mk_comparar"><field name="OP">&gt;=</field><value name="A"><block type="mk_var"><field name="VAR">pontos</field></block></value><value name="B"><shadow type="mk_num"><field name="NUM">3</field></shadow></value></block></value><statement name="SIM"><block type="mk_icone"><field name="I">Happy</field></block></statement></block></next></block></next></block></next></block></statement></block><block type="mk_botao" x="40" y="160"><field name="B">AB</field><statement name="DO"><block type="mk_mostrar_numero"><value name="N"><block type="mk_var"><field name="VAR">pontos</field></block></value></block></statement></block></xml>',
        pedido: 'O meu monstro nunca mais tem fome: carrego no A+B e ele continua a contar! Que gambiarra é esta?',
      },
    },
  };

  const CODIGO = {
    titulo: 'Cofre com código',
    missao: 'O cofre só abre com o código secreto: carregar 3 vezes no A e depois no B.',
    passos: [
      'Servo no pin 0: é o trinco do cofre.',
      'No arranque: contador a 0. No A: mudar contador em 1.',
      'No B: se contador = 3 → servo a 180 e ✔; senão → servo a 0 e ✗.',
      'Ainda no B, no fim: contador a 0, para a próxima tentativa.',
      'Experimenta o código certo e um código errado.',
    ],
    material: 'micro:bit, servo SG90, 3 crocodilos, uma caixa de cartão',
    novos: ['th_comparar_igual3'],
    caixa: ['mk_iniciar', 'mk_botao', 'mk_botao_B', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_se_senao', 'th_servo_180', 'th_servo_0', 'mk_icone_sim', 'mk_icone_nao'],
    teste: 'botao:B',
    ok: r => {
      const tentativas = saidasApos(r, v => v === 'botao:B').map(o => temIcone(o, 'Yes') && servoA(o, x => x >= 150) ? 'abre' : temIcone(o, 'No') ? 'fecha' : '?');
      return tentativas.join(',').includes('abre,fecha,abre');
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: um cofre com código secreto! O micro:bit tem de contar os toques e lembrar-se deles.'],
      parecePronto: a => { const b = a.evento('botao:B'); const s = seNo(b); return blocos(a.evento('botao:A'), 'mk_var_mudar').length > 0 && !!s && dentro(b, 'mk_se', 'mk_var') && ramoTem(s.sim, p => p.tipo === 'mk_servo' && Number(p.angulo) >= 150) && ramoTem(s.sim, p => p.icone === 'Yes') && ramoTem(s.nao, p => p.icone === 'No') && blocos(b, 'mk_var_definir').length > 0; },
      testar: 'Tens uma ideia? Vamos testar! A três vezes e B; depois A uma vez e B; depois outra vez A três vezes e B.',
      regras: [
        P.evento('botao:A', 'O código são toques no A. Quem fica à escuta?'),
        P.regra('a_nao_conta', a => !blocos(a.evento('botao:A'), 'mk_var_mudar').length, [
          ['curiosa', 'O cofre tem de saber quantos toques deste. Como é que ele conta?'],
          'Cada toque soma 1 a uma variável.',
          'No A: «mudar contador em 1».',
        ], 'Um, dois, três…'),
        P.evento('botao:B', 'Depois do código, carregas no B para tentar abrir. Que bloco?'),
        P.bloco('botao:B', 'mk_se', 'Código certo abre, código errado não. Que bloco decide?'),
        P.valorEm('botao:B', 'mk_se', 'mk_var', 'Para saber se o código está certo, o cofre tem de olhar para quê?'),
        P.regra('nao_abre', a => { const s = seNo(a.evento('botao:B')); return !!s && !(ramoTem(s.sim, p => p.tipo === 'mk_servo' && Number(p.angulo) >= 150) && ramoTem(s.sim, p => p.icone === 'Yes')); }, [
          'Código certo… e o trinco fica fechado?',
          'No «então», o trinco roda e aparece um ✔.',
          'No «então»: servo a 180 e o ícone ✔.',
        ], 'Abre-te, sésamo!'),
        P.regra('nao_tranca', a => { const s = seNo(a.evento('botao:B')); return !!s && !ramoTem(s.nao, p => p.icone === 'No'); }, [
          'E se alguém tentar um código errado?',
          'No «senão», o cofre recusa.',
          'No «senão»: servo a 0 e o ícone ✗.',
        ], 'Ladrões, não!'),
        P.regra('sem_recomecar', a => !blocos(a.evento('botao:B'), 'mk_var_definir').length, [
          ['a_pensar', 'Errei o código… e agora, como volto a tentar se a conta continua?'],
          'Depois de cada tentativa, a conta volta ao início.',
          'No fim do B: «definir contador para 0».',
        ], 'Pronto para outra tentativa!'),
      ],
      sucesso: 'Cofre com código! Contar, comparar e recomeçar: é assim que funcionam as fechaduras eletrónicas.',
      extensao: 'E se o código fosse A, A, B? Precisas de pensar em ordem, não só em contas…',
      gambiarra: {
        xml: '<xml><block type="mk_iniciar" x="40" y="3680"><statement name="DO"><block type="mk_var_definir"><field name="VAR">contador</field><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block></statement></block><block type="mk_botao" x="40" y="3840"><statement name="DO"><block type="mk_var_mudar"><field name="VAR">contador</field><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement></block><block type="mk_botao" x="40" y="160"><field name="B">B</field><statement name="DO"><block type="mk_se"><value name="C"><block type="mk_comparar"><field name="OP">==</field><value name="A"><block type="mk_var"><field name="VAR">contador</field></block></value><value name="B"><shadow type="mk_num"><field name="NUM">3</field></shadow></value></block></value><statement name="SIM"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">180</field></shadow></value><next><block type="mk_icone"><field name="I">Yes</field></block></next></block></statement><statement name="NAO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_icone"><field name="I">No</field></block></next></block></statement></block></statement></block></xml>',
        pedido: 'O meu cofre abriu uma vez e depois nunca mais! Acho que fiz uma gambiarra na conta. Ajudas-me?',
      },
    },
  };

  const REFLEXOS = {
    titulo: 'Jogo dos reflexos',
    missao: 'O coração aparece quando menos esperas: bate no botão de alumínio o mais depressa possível!',
    passos: [
      'Botão de alumínio: pin 1 e GND.',
      'No A: limpar, uma pausa ao acaso (escolher ao acaso de 1000 até 3000) e mostrar o coração.',
      'Logo a seguir ao coração: definir medida para o tempo de execução.',
      'No pin 1: mostrar número «tempo de execução − medida» (os teus milissegundos!).',
      'Experimenta: A, espera pelo coração, e bate no pin 1.',
    ],
    material: 'micro:bit, 2 crocodilos, papel de alumínio, cartão',
    novos: ['th_aleatorio_pausa'],
    caixa: ['mk_botao', 'mk_limpar', 'mk_pausa', 'mk_icone_coracao', 'mk_tempo', 'th_definir_medida', 'th_var_medida', 'th_conta_menos', 'mk_pino_tocado', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => {
      for (let i = 0; i < r.length; i++) {
        if (r[i].dir !== 'in' || r[i].v !== 'botao:A') continue;
        let j = i + 1; while (j < r.length && !(r[j].dir === 'out' && r[j].v === 'icone:Heart') && !(r[j].dir === 'in' && r[j].v === 'botao:A')) j++;
        if (j >= r.length || r[j].v !== 'icone:Heart' || r[j].t - r[i].t < 900) continue;
        let k = j + 1; while (k < r.length && !(r[k].dir === 'in' && r[k].v.startsWith('pino:'))) k++;
        if (k >= r.length) continue;
        let m = k + 1; while (m < r.length && r[m].dir === 'out' && !r[m].v.startsWith('numero:')) m++;
        if (m >= r.length || !r[m].v.startsWith('numero:')) continue;
        const v = Number(r[m].v.slice(7)), esperado = r[k].t - r[j].t;
        if (v > 0 && Math.abs(v - esperado) <= 400) return true;
      }
      return false;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: um jogo de reflexos! O truque é medir o tempo — o micro:bit tem um relógio por dentro.'],
      parecePronto: a => { const ev = a.evento('botao:A'); const pl = ev ? ev.plano : []; const iP = pl.findIndex(p => p.tipo === 'mk_pausa'), iD = pl.findIndex(p => p.tipo === 'mk_var_definir'); return icones(ev, 'Heart').length > 0 && dentro(ev, 'mk_pausa', 'mk_aleatorio') && dentro(ev, 'mk_var_definir', 'mk_tempo') && iD > iP && pinos(a).some(e => dentro(e, 'mk_mostrar_numero', 'mk_conta')); },
      testar: 'Tens uma ideia? Vamos testar! A, espera pelo coração… e bate no pin 1!',
      regras: [
        P.evento('botao:A', 'Quem começa o jogo? Precisas de um botão.'),
        P.regra('sem_coracao', a => !icones(a.evento('botao:A'), 'Heart').length, [
          'O jogador está à espera de um sinal. Qual?',
          'Um desenho aparece de repente no ecrã.',
          'No A, mostra o coração.',
        ], 'Lá está o sinal!'),
        P.regra('sem_suspense', a => !blocos(a.evento('botao:A'), 'mk_pausa').length, [
          ['a_pensar', 'O coração aparece logo… assim não há surpresa!'],
          'Antes do coração, espera um bocadinho.',
          'Põe uma «pausa» antes do coração.',
        ], 'Suspense…'),
        P.valorEm('botao:A', 'mk_pausa', 'mk_aleatorio', 'Se a espera for sempre igual, o jogador decora-a! Como a tornas imprevisível?'),
        P.regra('sem_partida', a => !dentro(a.evento('botao:A'), 'mk_var_definir', 'mk_tempo'), [
          'Para medir os reflexos, o micro:bit tem de saber quando o coração apareceu.',
          'Guarda a hora numa variável: há um bloco cor-de-rosa com o relógio.',
          'Depois do coração: «definir medida para tempo de execução».',
        ], 'Cronómetro a postos!'),
        P.regra('partida_cedo', a => { const pl = a.evento('botao:A').plano; const iP = pl.findIndex(p => p.tipo === 'mk_pausa'), iD = pl.findIndex(p => p.tipo === 'mk_var_definir'); return iD >= 0 && iP >= 0 && iD < iP; }, [
          ['surpreendida', 'Começas a contar antes da espera? Então a espera conta como se fosse lentidão tua!'],
          'O cronómetro começa quando o coração aparece.',
          'Põe o «definir medida» DEPOIS do coração.',
        ], 'Agora é justo!'),
        P.evento('pino:', 'Quando vês o coração, bates no alumínio. Que bloco sente isso?'),
        P.regra('sem_resultado', a => !pinos(a).some(e => blocos(e, 'mk_mostrar_numero').length), [
          'Bateste… e quanto tempo demoraste?',
          'Mostra o resultado num número.',
          'No pin 1: «mostrar número».',
        ], 'Resultado à vista!'),
        P.regra('conta_errada', a => !pinos(a).some(e => dentro(e, 'mk_mostrar_numero', 'mk_conta')), [
          'O tempo de execução é desde que o micro:bit ligou… e tu queres desde o coração.',
          'Tira ao tempo de agora o tempo guardado.',
          'Mostra «tempo de execução − medida».',
        ], 'Milissegundos certinhos!'),
      ],
      sucesso: 'Jogo dos reflexos! Mediste o tempo com duas leituras do relógio e uma subtração.',
      extensao: 'E se o jogo guardasse o recorde (o tempo mais pequeno)?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="160"><statement name="DO"><block type="mk_limpar"><next><block type="mk_var_definir"><field name="VAR">medida</field><value name="V"><block type="mk_tempo"></block></value><next><block type="mk_pausa"><value name="MS"><block type="mk_aleatorio"><value name="A"><shadow type="mk_num"><field name="NUM">1000</field></shadow></value><value name="B"><shadow type="mk_num"><field name="NUM">3000</field></shadow></value></block></value><next><block type="mk_icone"><field name="I">Heart</field></block></next></block></next></block></next></block></statement></block><block type="mk_pino_tocado" x="40" y="4320"><field name="P">P1</field><statement name="DO"><block type="mk_mostrar_numero"><value name="N"><block type="mk_conta"><field name="OP">-</field><value name="A"><block type="mk_tempo"></block></value><value name="B"><block type="mk_var"><field name="VAR">medida</field></block></value></block></value></block></statement></block></xml>',
        pedido: 'No meu jogo, toda a gente tem reflexos de tartaruga: mais de mil milissegundos! Encontras a gambiarra?',
      },
    },
  };

  const PISTA = {
    titulo: 'Pista com voltas',
    missao: 'Uma pista com um portão de alumínio na meta: conta as voltas e, à terceira, a corrida acaba.',
    passos: [
      'Portão de alumínio na meta: pin 0 e GND (o carrinho fecha o circuito ao passar).',
      'No A+B (nova corrida): contador a 0 e medida = tempo de execução.',
      'No pin 0: mudar contador em 1 e mostrar o contador; se contador = 3 → som e cara contente.',
      'No B: mostrar (tempo de execução − medida) ÷ 1000 — os segundos da corrida.',
      'Experimenta: A+B, três voltas e B.',
    ],
    material: 'micro:bit, 2 crocodilos, papel de alumínio, cartão, um carrinho e uma pista',
    novos: ['th_conta_div'],
    caixa: ['th_pino_p0', 'mk_botao_AB', 'mk_botao_B', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'th_definir_medida', 'th_var_medida', 'mk_tempo', 'th_conta_menos', 'mk_mostrar_numero', 'mk_se_entao', 'th_comparar_igual3', 'mk_som'],
    teste: 'pino:P0',
    ok: r => {
      const voltas = saidasApos(r, v => v === 'pino:P0' || v === 'pino:P1');
      const v1 = voltas.find(o => numDe(o) === 1), v3 = voltas.find(o => numDe(o) === 3);
      const recomeca = causou(r, s => s.includes('var:contador:0'), v => v === 'botao:AB');
      let segundos = false;
      for (let i = 0; i < r.length; i++) {
        if (r[i].dir !== 'in' || r[i].v !== 'botao:B') continue;
        let a = i - 1; while (a >= 0 && !(r[a].dir === 'in' && r[a].v === 'botao:AB')) a--;
        const o = []; for (let j = i + 1; j < r.length && r[j].dir === 'out'; j++) o.push(r[j]);
        const n = numDe(o);
        if (a >= 0 && n !== null && Math.abs(n - (r[i].t - r[a].t) / 1000) <= 0.6) segundos = true;
      }
      return !!v1 && voltas.some(o => numDe(o) === 2) && !!v3 && !temIcone(v1, 'Happy') && temIcone(v3, 'Happy') && temSom(v3) && recomeca && segundos;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: uma corrida a sério, com voltas e cronómetro! Precisas de duas variáveis: uma conta voltas, outra guarda a hora da partida.'],
      parecePronto: a => { const ab = a.evento('botao:AB'), p0 = a.evento('pino:P0'), b = a.evento('botao:B'); return blocos(ab, 'mk_var_definir').some(p => p.var === 'contador') && dentro(ab, 'mk_var_definir', 'mk_tempo') && blocos(p0, 'mk_var_mudar').length > 0 && dentro(p0, 'mk_mostrar_numero', 'mk_var') && ses(p0).length > 0 && blocos(b, 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_conta' && u.op === '/')); },
      testar: 'Tens uma ideia? Vamos testar! A+B, depois três voltas (pin 0) e no fim B.',
      regras: [
        P.evento('botao:AB', 'Antes de cada corrida, tudo a zeros. Que botão dá a partida?'),
        P.regra('nao_recomeca', a => !blocos(a.evento('botao:AB'), 'mk_var_definir').some(p => p.var === 'contador'), [
          'Nova corrida… e as voltas da corrida anterior ainda contam?',
          'A conta das voltas tem de voltar a 0.',
          'No A+B: «definir contador para 0».',
        ], 'Voltas a zero!'),
        P.regra('sem_partida', a => !dentro(a.evento('botao:AB'), 'mk_var_definir', 'mk_tempo'), [
          ['curiosa', 'Para saber quanto demorou a corrida, o que tens de saber da partida?'],
          'Guarda a hora da partida noutra variável.',
          'No A+B: «definir medida para tempo de execução».',
        ], 'Partida registada!'),
        P.evento('pino:P0', 'O carrinho passa no portão de alumínio da meta. Que bloco sente isso?'),
        P.regra('nao_conta', a => !blocos(a.evento('pino:P0'), 'mk_var_mudar').length, [
          'Cada passagem na meta é mais uma volta.',
          'Soma 1 à variável das voltas.',
          'No pin 0: «mudar contador em 1».',
        ], 'Mais uma volta!'),
        P.regra('nao_mostra_voltas', a => !dentro(a.evento('pino:P0'), 'mk_mostrar_numero', 'mk_var'), [
          'O piloto quer saber em que volta vai!',
          'Mostra o número das voltas.',
          'No pin 0: «mostrar número» com a variável contador.',
        ], 'Volta à vista!'),
        P.regra('sem_meta', a => !ses(a.evento('pino:P0')).length, [
          'Quando é que a corrida acaba?',
          'Compara as voltas com 3.',
          'No pin 0: «se contador = 3 então» som e cara contente.',
        ], 'Bandeira axadrezada!'),
        P.evento('botao:B', 'No fim, quanto tempo demorou? Que botão mostra o tempo?'),
        P.regra('sem_segundos', a => !blocos(a.evento('botao:B'), 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_conta')), [
          'O tempo de execução conta desde que ligaste o micro:bit. E a corrida?',
          'Tira ao tempo de agora a hora da partida.',
          'No B: mostrar «tempo de execução − medida».',
        ], 'Tempo da corrida!'),
        P.regra('em_milissegundos', a => !blocos(a.evento('botao:B'), 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_conta' && u.op === '/')), [
          ['surpreendida', 'Uau, 3500? Foram 3500 segundos?! Que corrida lenta…'],
          'O relógio do micro:bit conta milissegundos: 1000 por segundo.',
          'Divide o resultado por 1000.',
        ], 'Agora em segundos!'),
      ],
      sucesso: 'Pista com voltas e cronómetro! Duas variáveis a trabalhar juntas: uma conta, outra mede.',
      extensao: 'E se a pista guardasse o recorde da volta mais rápida?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="4480"><field name="B">AB</field><statement name="DO"><block type="mk_var_definir"><field name="VAR">contador</field><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_var_definir"><field name="VAR">medida</field><value name="V"><block type="mk_tempo"></block></value></block></next></block></statement></block><block type="mk_pino_tocado" x="40" y="4640"><field name="P">P0</field><statement name="DO"><block type="mk_var_mudar"><field name="VAR">contador</field><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_mostrar_numero"><value name="N"><block type="mk_var"><field name="VAR">contador</field></block></value><next><block type="mk_se_entao"><value name="C"><block type="mk_comparar"><field name="OP">==</field><value name="A"><block type="mk_var"><field name="VAR">contador</field></block></value><value name="B"><shadow type="mk_num"><field name="NUM">3</field></shadow></value></block></value><statement name="SIM"><block type="mk_som"><value name="S"><shadow type="mk_som_menu"><field name="V">twinkle</field></shadow></value><next><block type="mk_icone"><field name="I">Happy</field></block></next></block></statement></block></next></block></next></block></statement></block><block type="mk_botao" x="40" y="160"><field name="B">B</field><statement name="DO"><block type="mk_mostrar_numero"><value name="N"><block type="mk_conta"><field name="OP">-</field><value name="A"><block type="mk_tempo"></block></value><value name="B"><block type="mk_var"><field name="VAR">medida</field></block></value></block></value></block></statement></block></xml>',
        pedido: 'O meu cronómetro diz que a corrida durou 3000 segundos! Acho que me esqueci de alguma coisa…',
      },
    },
  };

  const HUMOR = {
    titulo: 'Robô com humor',
    missao: 'Um robô de cartão com humor: festas deixam-no feliz e de braços no ar, abanões deixam-no triste.',
    passos: [
      'Servo no pin 0 com os braços do robô.',
      'No arranque: pontos (o humor) a 5.',
      'Logotipo (festa): mudar pontos em 1. Agitar (abanão): mudar pontos em −2.',
      '«para sempre»: se pontos > 5 → cara contente e servo a 180; senão → cara triste e servo a 0.',
      'Experimenta: festa, festa, abanão…',
    ],
    material: 'micro:bit V2, servo SG90, 3 crocodilos, um robô de cartão',
    novos: ['th_definir_pontos5', 'th_comparar_pontos5'],
    caixa: ['mk_iniciar', 'mk_logo', 'mk_agitar', 'th_mudar_pontos', 'th_var_pontos', 'mk_sempre', 'mk_se_senao', 'mk_icone', 'mk_icone_triste', 'th_servo_180', 'th_servo_0'],
    teste: 'logo',
    ok: r => {
      const primeira = r.findIndex(e => e.dir === 'in');
      const antes = (primeira < 0 ? r : r.slice(0, primeira)).map(e => e.v);
      const inicioTriste = antes.includes('icone:Sad') && antes.some(x => x.startsWith('servo:') && angulo(x) <= 30);
      const festa = causou(r, s => s.includes('icone:Happy') && s.some(x => x.startsWith('servo:') && angulo(x) >= 150) && s.some(x => x.startsWith('var:pontos:')), v => v === 'logo');
      const abanao = causou(r, s => s.includes('icone:Sad') && s.some(x => x.startsWith('servo:') && angulo(x) <= 30) && s.some(x => x.startsWith('var:pontos:') && valorDe(x) <= 5), v => v === 'agitar');
      return inicioTriste && festa && abanao;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Projeto grande: um robô com sentimentos! O humor é uma variável: sobe com festas, desce com abanões.'],
      parecePronto: a => { const s = seNo(a.evento('sempre')); const mud = (k, f) => blocos(a.evento(k), 'mk_var_mudar').some(p => f(Number(p.n))); return blocos(a.evento('inicio'), 'mk_var_definir').length > 0 && mud('logo', x => x > 0) && mud('agitar', x => x < 0) && !!s && dentro(a.evento('sempre'), 'mk_se', 'mk_var') && ramoTem(s.sim, p => p.icone === 'Happy') && ramoTem(s.sim, p => p.tipo === 'mk_servo' && Number(p.angulo) >= 150) && ramoTem(s.nao, p => p.icone === 'Sad') && ramoTem(s.nao, p => p.tipo === 'mk_servo' && Number(p.angulo) <= 30); },
      testar: 'Tens uma ideia? Vamos testar! Espera um bocadinho, faz uma festa (logotipo) e depois abana (Agitar).',
      regras: [
        P.evento('inicio', 'Com que humor acorda o robô? Isso decide-se logo quando o micro:bit liga.'),
        P.regra('humor_sem_inicio', a => !blocos(a.evento('inicio'), 'mk_var_definir').length, [
          'O humor começa em quanto?',
          'Guarda um valor inicial na variável.',
          'No arranque: «definir pontos para 5».',
        ], 'Humor de partida!'),
        P.evento('logo', 'As festas fazem-se no logotipo. Quem fica à escuta?'),
        P.regra('festa_nao_muda', a => !blocos(a.evento('logo'), 'mk_var_mudar').some(p => Number(p.n) > 0), [
          'Uma festa deixa o robô mais… ?',
          'Soma ao humor.',
          'No logotipo: «mudar pontos em 1».',
        ], 'Que bom!'),
        P.evento('agitar', 'E os abanões? Que bloco os sente?'),
        P.regra('abanao_nao_muda', a => !blocos(a.evento('agitar'), 'mk_var_mudar').some(p => Number(p.n) < 0), [
          ['surpreendida', 'Um abanão deixa o robô mais feliz?!'],
          'Um abanão TIRA humor: usa um número negativo.',
          'Em agitar: «mudar pontos em -2».',
        ], 'Ai, ai!'),
        P.evento('sempre', 'A cara do robô tem de mostrar sempre o humor dele. Que bloco nunca pára?'),
        P.bloco('sempre', 'mk_se', 'Feliz ou triste: duas situações. Que bloco escolhe?'),
        P.valorEm('sempre', 'mk_se', 'mk_var', 'O robô está feliz quando o humor é alto. O «se» tem de olhar para quê?'),
        P.regra('feliz_incompleto', a => { const s = seNo(a.evento('sempre')); return !!s && !(ramoTem(s.sim, p => p.icone === 'Happy') && ramoTem(s.sim, p => p.tipo === 'mk_servo' && Number(p.angulo) >= 150)); }, [
          'Quando está feliz, o robô sorri e…?',
          'Levanta os braços: servo para cima.',
          'No «então»: cara contente e servo a 180.',
        ], 'Viva!'),
        P.regra('triste_incompleto', a => { const s = seNo(a.evento('sempre')); return !!s && !(ramoTem(s.nao, p => p.icone === 'Sad') && ramoTem(s.nao, p => p.tipo === 'mk_servo' && Number(p.angulo) <= 30)); }, [
          'E quando está em baixo?',
          'Cara triste e braços para baixo.',
          'No «senão»: cara triste e servo a 0.',
        ], 'Coitadinho…'),
      ],
      sucesso: 'Robô com humor! Uma variável que sobe e desce, e um «se» que a transforma em expressões.',
      extensao: 'E se, com humor muito baixo (menos de 2), o robô adormecesse?',
      gambiarra: {
        xml: '<xml><block type="mk_iniciar" x="40" y="4960"><statement name="DO"><block type="mk_var_definir"><field name="VAR">pontos</field><value name="V"><shadow type="mk_num"><field name="NUM">5</field></shadow></value></block></statement></block><block type="mk_logo" x="40" y="5120"><statement name="DO"><block type="mk_var_mudar"><field name="VAR">pontos</field><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement></block><block type="mk_agitar" x="40" y="160"><statement name="DO"><block type="mk_var_mudar"><field name="VAR">pontos</field><value name="V"><shadow type="mk_num"><field name="NUM">2</field></shadow></value></block></statement></block><block type="mk_sempre" x="40" y="5440"><statement name="DO"><block type="mk_se"><value name="C"><block type="mk_comparar"><field name="OP">&gt;</field><value name="A"><block type="mk_var"><field name="VAR">pontos</field></block></value><value name="B"><shadow type="mk_num"><field name="NUM">5</field></shadow></value></block></value><statement name="SIM"><block type="mk_icone"><field name="I">Happy</field><next><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">180</field></shadow></value></block></next></block></statement><statement name="NAO"><block type="mk_icone"><field name="I">Sad</field><next><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block></next></block></statement></block></statement></block></xml>',
        pedido: 'Abano o meu robô e ele fica ainda mais feliz! Acho que troquei um sinal… Ajudas-me?',
      },
    },
  };

  const INVENTA = {
    titulo: 'Inventa',
    missao: 'Agora é contigo: pega num brinquedo velho e dá-lhe um truque novo.',
    passos: ['Tens botões, pinos, gestos, som, servo, luzes e variáveis.', 'Desenha primeiro: o que sente o brinquedo? O que faz ele?'],
    material: 'um brinquedo velho e o que tiveres',
    novos: [],
    caixa: ['mk_botao', 'mk_pino_tocado', 'mk_logo', 'mk_gesto', 'mk_som_alto', 'mk_sempre', 'mk_icone', 'mk_som', 'mk_tom', 'mk_servo', 'mk_digital_1', 'mk_digital_0', 'mk_pausa', 'mk_repetir', 'mk_se_entao', 'mk_var_mudar', 'mk_mostrar_numero'],
    livre: true,
    ok: () => false,
    tutor: {
      boasVindas: ['inventar', 'Abre um brinquedo, vê o que ele tem lá dentro e inventa-lhe um truque novo. Se precisares de mim, estou aqui.'],
      parecePronto: () => false,
      testar: '',
      regras: [],
      sucesso: '',
      extensao: '',
    },
  };

  F.registarMissao({
    id: 'toy-hacking',
    titulo: 'Toy hacking',
    tema: 'Gambiarra e brinquedos',
    descricao: 'Abre um brinquedo, percebe como funciona e reinventa-o com o micro:bit.',
    cor: '#d400d4',
    xml: XML,
    niveis: [
      // 1–6 curtos; 7–11 projetos de 15–20 minutos; o 12.º (projeto livre) é gerado pelo motor
      { nome: 'Nível 1 · Abrir e perceber', desafios: [BOTAO_SECRETO, PELUCHE_RI, DORME, FAROIS, SIRENE, ABRACO,
        PELUCHE_COMPLETO, CARRINHO_COMPLETO, AMBULANCIA_EMERGENCIA, CAIXA_MUSICA, SEMAFORO] },
      { nome: 'Nível 2 · Reinventar', desafios: [BRACO, CANCELA, ASSUSTADO, AMBULANCIA, EQUILIBRIO, PISCA,
        MARIONETA, CAIXA_SURPRESA, GUARDA, PISCAS_A_SERIO, AMBULANCIA_HACKEADA] },
      { nome: 'Nível 3 · Inventar', desafios: [CONTA_ABRACOS, COFRE, ROLETA, TAPETE, CRONOMETRO, BOLA_CRISTAL,
        MONSTRO, CODIGO, REFLEXOS, PISTA, HUMOR] },
    ],
    // textos do projeto livre de cada nível (os blocos crescem: nível 1 → níveis 1 e 2 → todos)
    livres: [
      { titulo: 'Projeto livre', missao: 'Agora é contigo: pega num brinquedo velho e dá-lhe um truque novo com os blocos do nível 1.',
        passos: ['Desenha primeiro: o que sente o brinquedo? O que faz ele?', 'Experimenta no micro:bit do ecrã.', 'Monta-o no brinquedo e mostra à turma.'],
        material: 'um brinquedo velho e o que tiveres' },
      { titulo: 'Projeto livre', missao: 'Reinventa um brinquedo com servo, sensores e luzes: os blocos dos níveis 1 e 2 são teus.',
        passos: ['Escolhe o que o brinquedo vai sentir: barulho, luz, inclinação…', 'Decide o que ele faz: mexe-se, acende, toca…', 'Experimenta e monta-o a sério.'],
        material: 'um brinquedo velho, servo, LEDs e o que tiveres' },
      { titulo: INVENTA.titulo, missao: INVENTA.missao, passos: [...INVENTA.passos, 'Agora tens todos os blocos!'], material: INVENTA.material,
        boasVindas: INVENTA.tutor.boasVindas[1] },
    ],
  });
})();
