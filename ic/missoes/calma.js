/* Missão 5 · Desenhar a calma (Designing calm) — ferramentas para os outros.
 *
 * Liga à Atividade 5 do guia (Design a calm route and a quiet space) e às recomendações dos participantes.
 * Perspetivas: Dani (saber o plano), Teo (avisos antes do barulho), Ana (respirar), Mira (sinais que se tocam e se
 * ouvem). Ideia que fica: a tecnologia serve para tornar os lugares mais fáceis para toda a gente — desenha-se COM as
 * pessoas, não PARA elas. Validação pelo registo.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const P = F.pistas;
  const { T, V, X } = F.IC;
  const { blocos, tem } = F.ajudasTutor;
  const { I, seq, xml, E, B, ruido, cmp, conta, xVar, N, S } = X;
  const evs = P.evs;
  const usa = (p, tipo) => (p.usa || []).some(u => u.tipo === tipo);
  const plano = l => (l || []).flatMap(x => [x, ...plano(x.corpo), ...plano(x.sim), ...plano(x.nao)]);

  // contagem decrescente depois do A: 3, 2, 1 por esta ordem, com ≥ 0,7 s entre cada, e depois um ícone
  function contagem(reg) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== 'botao:A') continue;
      const s = V.saidasT(reg, i, 12000);
      const k3 = s.findIndex(e => e.v === 'numero:3'), k2 = s.findIndex((e, k) => k > k3 && e.v === 'numero:2'), k1 = s.findIndex((e, k) => k > k2 && e.v === 'numero:1');
      if (k3 < 0 || k2 < 0 || k1 < 0) continue;
      if (s[k2].t - s[k3].t < 700 || s[k1].t - s[k2].t < 700) continue;
      if (s.some((e, k) => k > k1 && e.v.startsWith('icone:'))) return true;
    }
    return false;
  }
  // respirar: dois ícones diferentes alternam devagar (cada um visível ≥ 1,5 s), pelo menos 3 trocas
  function respirar(reg) {
    const ics = reg.filter(e => e.dir === 'out' && e.v.startsWith('icone:'));
    let trocas = 0;
    for (let k = 1; k < ics.length; k++) {
      if (ics[k].v === ics[k - 1].v) continue;
      if (ics[k].t - ics[k - 1].t < 1500) return false;
      trocas++;
    }
    return trocas >= 2 && new Set(ics.map(e => e.v)).size === 2;
  }
  // ouvir a luz: o tom acompanha a luz — mais luz, nota mais aguda (pelo menos 2 valores)
  function ouvirLuz(reg) {
    const pares = [];
    reg.forEach((e, i) => {
      if (e.dir !== 'in' || !e.v.startsWith('luz:')) return;
      const t = V.saidasApos(reg, i).filter(x => x.startsWith('tom:'));
      if (t.length) pares.push([F.verif.valorDe(e.v), F.verif.valorDe(t[t.length - 1])]);
    });
    const vs = [...new Map(pares).entries()].sort((a, b) => a[0] - b[0]);
    if (vs.length < 2) return false;
    for (let k = 1; k < vs.length; k++) if (!(vs[k][1] > vs[k - 1][1])) return false;
    return true;
  }
  // o A faz a variável subir 1 e mostra o valor novo — pelo menos duas vezes seguidas (passo a passo)
  function sobe(reg) {
    let n = 0;
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== 'botao:A') continue;
      const u = V.ultimaVar(reg, i);
      if (!u) continue;
      const s = V.saidasApos(reg, i);
      if (s.includes('var:' + u.nome + ':' + (u.v + 1)) && s.includes('numero:' + (u.v + 1))) n++;
    }
    return n >= 2;
  }

  const XML = {
    ic_def_passos: `<block type="mk_var_definir"><field name="VAR">passos</field>${N('V', 1)}</block>`,
    ic_mudar_passos: `<block type="mk_var_mudar"><field name="VAR">passos</field>${N('V', 1)}</block>`,
    ic_var_passos: xVar('passos'),
    ic_icone_coracao: '<block type="mk_icone"><field name="I">Heart</field></block>',
    ic_icone_pequeno: '<block type="mk_icone"><field name="I">SmallHeart</field></block>',
    ic_pausa2000: '<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">2000</field></shadow></value></block>',
    ic_pausa1000: '<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">1000</field></shadow></value></block>',
    ic_servo: `<block type="mk_servo"><field name="P">P8</field>${N('A', 180)}</block>`,
    ic_se_ruido: `<block type="mk_se"><value name="C"><block type="mk_comparar"><field name="OP">&gt;</field><value name="A"><block type="mk_kit_ruido"><field name="P">P1</field></block></value>${N('B', 60)}</block></value></block>`,
    ic_tom_livre: '<block type="mk_tom"><value name="F"><shadow type="mk_num"><field name="NUM">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.25</field></shadow></value></block>',
    ic_conta_vezes: `<block type="mk_conta"><field name="OP">*</field>${N('A', 0)}${N('B', 4)}</block>`,
    ic_conta_mais: `<block type="mk_conta"><field name="OP">+</field>${N('A', 0)}${N('B', 200)}</block>`,
  };
  const MAT = T('micro:bit V2', 'micro:bit V2', 'micro:bit V2', 'micro:bit V2');
  const MAT_SERVO = T('micro:bit V2 + IoT:bit + noise sensor (P1) + servo (P8) + a paper flag', 'micro:bit V2 + IoT:bit + сензор буке (P1) + серво (P8) + папирна заставица', 'micro:bit V2 + IoT:bit + sensor de ruido (P1) + servo (P8) + una banderita de papel', 'micro:bit V2 + IoT:bit + sensor de ruído (P1) + servo (P8) + uma bandeirinha de papel');

  const D = [
    // ------------------------------------------------------------ 1 · O que vem a seguir
    {
      titulo: T('What comes next', 'Шта следи', 'Qué viene después', 'O que vem a seguir'),
      missao: T('A visit planner: each press of A moves to the next step of the route and shows its number.', 'Планер посете: сваки притисак на A прелази на следећи корак путање и показује његов број.', 'Un planificador de visita: cada pulsación de A pasa al siguiente paso del recorrido y muestra su número.', 'Um planeador da visita: cada toque no A passa ao passo seguinte do percurso e mostra o número.'),
      passos: [
        T('“on start”: set steps to 1, then show number steps.', '„при покретању“: постави кораке на 1, па прикажи број кораци.', '«al iniciar»: fijar pasos a 1 y mostrar número pasos.', '«no arranque»: definir passos para 1 e mostrar número passos.'),
        T('A: change steps by 1, then show number steps.', 'A: промени кораке за 1, па прикажи број кораци.', 'A: cambiar pasos por 1 y mostrar número pasos.', 'A: mudar passos em 1 e mostrar número passos.'),
        T('Test it: press A a few times.', 'Испробај: притисни A неколико пута.', 'Pruébalo: pulsa A varias veces.', 'Experimenta: carrega no A algumas vezes.'),
      ],
      material: MAT,
      novos: ['mk_iniciar', 'mk_botao', 'ic_def_passos', 'ic_mudar_passos', 'ic_var_passos', 'mk_mostrar_numero'],
      teste: 'botao:A',
      ok: sobe,
      perspetiva: 'dani',
      pensar: T('Knowing “step 3 of 5” makes a visit predictable. What else would you put on a visit plan for Dani: times, exits, quiet rooms?',
        'Кад знаш „корак 3 од 5“, посета је предвидљива. Шта би још ставио на план посете за Данија: времена, излазе, тихе собе?',
        'Saber «paso 3 de 5» hace la visita predecible. ¿Qué más pondrías en un plan de visita para Dani: horas, salidas, salas tranquilas?',
        'Saber «passo 3 de 5» torna a visita previsível. O que mais punhas num plano de visita para o Dani: horas, saídas, salas calmas?'),
      tutor: {
        boasVindas: ['boas_vindas', T('{ola} In this mission we design tools that make places easier. First: knowing what comes next.', '{ola} У овој мисији дизајнирамо алате који олакшавају места. Прво: знати шта следи.', '{ola} En esta misión diseñamos herramientas que hacen los lugares más fáciles. Primero: saber qué viene después.', '{ola} Nesta missão desenhamos ferramentas que tornam os sítios mais fáceis. Primeiro: saber o que vem a seguir.')],
        parecePronto: a => evs(a, 'botao:A').some(e => blocos(e, 'mk_var_mudar').length && blocos(e, 'mk_mostrar_numero').some(p => usa(p, 'mk_var'))),
        testar: T('Press A three times. Does the number go 2, 3, 4?', 'Притисни A три пута. Да ли број иде 2, 3, 4?', 'Pulsa A tres veces. ¿Va el número 2, 3, 4?', 'Carrega no A três vezes. O número vai 2, 3, 4?'),
        regras: [
          P.evento('botao:A', T('Which button moves to the next step?', 'Које дугме прелази на следећи корак?', '¿Qué botón pasa al siguiente paso?', 'Que botão passa ao passo seguinte?')),
          P.bloco('botao:A', 'mk_var_mudar', T('The step number has to grow. Which red block adds to a variable?', 'Број корака мора да расте. Који црвени блок додаје променљивој?', 'El número de paso tiene que crecer. ¿Qué bloque rojo suma a una variable?', 'O número do passo tem de crescer. Que bloco vermelho soma a uma variável?')),
          P.bloco('botao:A', 'mk_mostrar_numero', T('The step changes, but nobody can see it. How do you show it?', 'Корак се мења, али нико то не види. Како да га прикажеш?', 'El paso cambia, pero nadie lo ve. ¿Cómo lo muestras?', 'O passo muda, mas ninguém vê. Como é que o mostras?')),
          P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_var', T('The number on the screen never changes. What should it show?', 'Број на екрану се никад не мења. Шта треба да покаже?', 'El número de la pantalla nunca cambia. ¿Qué debería mostrar?', 'O número no ecrã nunca muda. O que é que devia mostrar?')),
        ],
        sucesso: T('A visit with steps you can count. Predictable is calmer.', 'Посета са корацима које можеш да бројиш. Предвидљиво је мирније.', 'Una visita con pasos que puedes contar. Lo predecible es más tranquilo.', 'Uma visita com passos que se contam. O que é previsível é mais calmo.'),
        extensao: T('Make B go back one step.', 'Нека B врати један корак уназад.', 'Haz que B vuelva un paso atrás.', 'Faz o B voltar um passo atrás.'),
        gambiarra: {
          xml: xml(E.inicio(seq(I.definir('passos', 1), I.numero(xVar('passos')))), E.botao('A', seq(I.definir('passos', 2), I.numero(xVar('passos'))))),
          pedido: T('My planner gets stuck on step 2! I press A again and again… still 2.', 'Мој планер заглави на кораку 2! Притискам A изнова… и даље 2.', '¡Mi planificador se queda en el paso 2! Pulso A una y otra vez… sigue en 2.', 'O meu planeador fica preso no passo 2! Carrego no A vezes sem conta… continua 2.'),
        },
      },
    },

    // ------------------------------------------------------------ 2 · Aviso antes do barulho
    {
      titulo: T('Warning before the loud part', 'Упозорење пре гласног дела', 'Aviso antes del ruido', 'Aviso antes do barulho'),
      missao: T('Before a loud moment (a video, a bell), press A: the micro:bit counts down 3, 2, 1, then shows a symbol.', 'Пре гласног тренутка (видео, звоно) притисни A: micro:bit одбројава 3, 2, 1, па покаже симбол.', 'Antes de un momento ruidoso (un vídeo, un timbre), pulsa A: el micro:bit cuenta 3, 2, 1 y muestra un símbolo.', 'Antes de um momento barulhento (um vídeo, uma campainha), carrega no A: o micro:bit conta 3, 2, 1 e mostra um símbolo.'),
      passos: [
        T('A: show number 3, pause 1000, show number 2, pause 1000, show number 1, pause 1000.', 'A: прикажи број 3, пауза 1000, прикажи број 2, пауза 1000, прикажи број 1, пауза 1000.', 'A: mostrar número 3, pausa 1000, mostrar número 2, pausa 1000, mostrar número 1, pausa 1000.', 'A: mostrar número 3, pausa 1000, mostrar número 2, pausa 1000, mostrar número 1, pausa 1000.'),
        T('At the end, “show icon”.', 'На крају, „прикажи иконицу“.', 'Al final, «mostrar ícono».', 'No fim, «mostrar ícone».'),
        T('Bonus: do it with “repeat” and a variable.', 'Бонус: уради то са „понови“ и променљивом.', 'Extra: hazlo con «repetir» y una variable.', 'Extra: faz com «repetir» e uma variável.'),
      ],
      material: MAT,
      novos: ['ic_pausa1000', 'mk_icone', 'mk_repetir'],
      teste: 'botao:A',
      espera: 4200,
      ok: contagem,
      perspetiva: 'teo',
      perspetivaPergunta: T('Teo likes loud music he chooses, but not sudden alarms. How does a countdown turn a surprise into a choice?', 'Тео воли гласну музику коју сам бира, али не изненадне аларме. Како одбројавање претвара изненађење у избор?', 'A Teo le gusta la música alta que él elige, pero no las alarmas repentinas. ¿Cómo convierte una cuenta atrás una sorpresa en una elección?', 'O Teo gosta de música alta que ele escolhe, mas não de alarmes de repente. Como é que uma contagem transforma uma surpresa numa escolha?'),
      pensar: T('With a warning, people can cover their ears, step out or get ready. Where in your school would a countdown help?',
        'Уз упозорење људи могу да покрију уши, изађу или се припреме. Где би у твојој школи одбројавање помогло?',
        'Con un aviso, la gente puede taparse los oídos, salir o prepararse. ¿Dónde ayudaría una cuenta atrás en tu colegio?',
        'Com um aviso, as pessoas podem tapar os ouvidos, sair ou preparar-se. Onde é que uma contagem ajudava na tua escola?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Surprises can be hard. A countdown gives everyone time to get ready.', 'Изненађења могу бити тешка. Одбројавање свима даје време да се припреме.', 'Las sorpresas pueden ser difíciles. Una cuenta atrás da tiempo a todos para prepararse.', 'As surpresas podem custar. Uma contagem dá tempo a todos para se prepararem.')],
        parecePronto: a => evs(a, 'botao:A').some(e => blocos(e, 'mk_pausa').length && blocos(e, 'mk_icone').length && (blocos(e, 'mk_mostrar_numero').length >= 3 || blocos(e, 'mk_repetir').length)),
        testar: T('Press A and count with it: 3, 2, 1…', 'Притисни A и броји са њим: 3, 2, 1…', 'Pulsa A y cuenta con él: 3, 2, 1…', 'Carrega no A e conta com ele: 3, 2, 1…'),
        regras: [
          P.evento('botao:A', T('Who starts the countdown?', 'Ко покреће одбројавање?', '¿Quién empieza la cuenta atrás?', 'Quem começa a contagem?')),
          P.bloco('botao:A', 'mk_mostrar_numero', T('What does the screen show first?', 'Шта екран прво показује?', '¿Qué muestra primero la pantalla?', 'O que é que o ecrã mostra primeiro?')),
          P.regra('sem_pausa', a => evs(a, 'botao:A').some(e => blocos(e, 'mk_mostrar_numero').length >= 2 && !blocos(e, 'mk_pausa').length), [
            ['surpreendida', T('That countdown was too fast to read! What gives each number time?', 'То одбројавање је било пребрзо за читање! Шта сваком броју даје време?', '¡Esa cuenta atrás fue demasiado rápida para leerla! ¿Qué da tiempo a cada número?', 'Essa contagem foi rápida demais para se ler! O que é que dá tempo a cada número?')],
            T('Put a “pause (ms) 1000” after each number.', 'Стави „пауза (ms) 1000“ после сваког броја.', 'Pon una «pausa (ms) 1000» después de cada número.', 'Põe uma «pausa (ms) 1000» depois de cada número.'),
            T('Number, pause, number, pause, number, pause, icon.', 'Број, пауза, број, пауза, број, пауза, иконица.', 'Número, pausa, número, pausa, número, pausa, ícono.', 'Número, pausa, número, pausa, número, pausa, ícone.'),
          ], T('Now it is a calm countdown.', 'Сад је то мирно одбројавање.', 'Ahora es una cuenta atrás tranquila.', 'Agora é uma contagem calma.')),
          P.bloco('botao:A', 'mk_icone', T('After 1, what tells people “now”?', 'После 1, шта људима каже „сада“?', 'Después del 1, ¿qué le dice a la gente «ahora»?', 'Depois do 1, o que é que diz às pessoas «agora»?')),
        ],
        sucesso: T('A countdown turns a surprise into something you can prepare for.', 'Одбројавање претвара изненађење у нешто за шта се можеш припремити.', 'Una cuenta atrás convierte una sorpresa en algo para lo que te puedes preparar.', 'Uma contagem transforma uma surpresa numa coisa para a qual te podes preparar.'),
        extensao: T('Make it with “repeat 3 times” and a variable that goes down by 1.', 'Направи то са „понови 3 пута“ и променљивом која опада за 1.', 'Hazlo con «repetir 3 veces» y una variable que baje de 1 en 1.', 'Faz com «repetir 3 vezes» e uma variável que desce de 1 em 1.'),
        gambiarra: {
          xml: xml(E.botao('A', seq(I.numero(3), I.numero(2), I.numero(1), I.icone('Yes')))),
          pedido: T('My countdown is so fast it looks like the numbers are fighting! Can you slow it down?', 'Моје одбројавање је толико брзо да изгледа као да се бројеви свађају! Можеш ли да га успориш?', '¡Mi cuenta atrás es tan rápida que parece que los números se pelean! ¿Puedes hacerla más lenta?', 'A minha contagem é tão rápida que parece que os números estão a lutar! Consegues abrandá-la?'),
        },
      },
    },

    // ------------------------------------------------------------ 3 · Respira comigo
    {
      titulo: T('Breathe with me', 'Дишемо заједно', 'Respira conmigo', 'Respira comigo'),
      missao: T('A slow breathing guide: a big heart for 2 seconds (breathe in), a small heart for 2 seconds (breathe out), forever.', 'Водич за споро дисање: велико срце 2 секунде (удах), мало срце 2 секунде (издах), заувек.', 'Una guía de respiración lenta: corazón grande 2 segundos (inspira), corazón pequeño 2 segundos (espira), para siempre.', 'Um guia de respiração lenta: coração grande 2 segundos (inspira), coração pequeno 2 segundos (expira), para sempre.'),
      passos: [
        T('“forever”: show icon big heart, pause 2000.', '„заувек“: прикажи иконицу велико срце, пауза 2000.', '«para siempre»: mostrar ícono corazón grande, pausa 2000.', '«para sempre»: mostrar ícone coração grande, pausa 2000.'),
        T('Then show icon small heart, pause 2000.', 'Па прикажи иконицу мало срце, пауза 2000.', 'Luego mostrar ícono corazón pequeño, pausa 2000.', 'Depois mostrar ícone coração pequeno, pausa 2000.'),
        T('Test it: breathe along with it.', 'Испробај: дишите заједно са њим.', 'Pruébalo: respira a su ritmo.', 'Experimenta: respira ao mesmo ritmo.'),
      ],
      material: MAT,
      novos: ['mk_sempre', 'ic_icone_coracao', 'ic_icone_pequeno', 'ic_pausa2000'],
      teste: 'agitar',
      espera: 7000,
      ok: respirar,
      perspetiva: 'ana',
      perspetivaPergunta: T('After a busy day Ana needs to calm down before she can talk. Could a quiet light that breathes help? Where would you put it?', 'После напорног дана Ани треба мир пре него што може да прича. Да ли би помогло тихо светло које „дише“? Где би га ставио?', 'Después de un día intenso, Ana necesita calmarse antes de poder hablar. ¿Ayudaría una luz tranquila que «respira»? ¿Dónde la pondrías?', 'Depois de um dia cheio, a Ana precisa de se acalmar antes de conseguir falar. Uma luz calma que «respira» ajudava? Onde a punhas?'),
      pensar: T('Different people calm down in different ways: breathing, moving, pressing, being alone. Ask your group what works for them.',
        'Различити људи се смирују на различите начине: дисањем, кретањем, притиском, осамом. Питај групу шта њима помаже.',
        'Cada persona se calma de una forma: respirando, moviéndose, apretando, estando a solas. Pregunta a tu grupo qué les funciona.',
        'Cada pessoa acalma-se à sua maneira: a respirar, a mexer-se, a apertar, a estar sozinha. Pergunta ao teu grupo o que resulta com eles.'),
      tutor: {
        boasVindas: ['boas_vindas', T('Let’s build something gentle. Slow light, slow breathing.', 'Хајде да направимо нешто нежно. Споро светло, споро дисање.', 'Vamos a construir algo suave. Luz lenta, respiración lenta.', 'Vamos fazer uma coisa suave. Luz lenta, respiração lenta.')],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'mk_icone').length >= 2 && blocos(e, 'mk_pausa').filter(p => p.ms >= 1500).length >= 2),
        testar: T('Watch it for a few seconds and breathe with it.', 'Гледај неколико секунди и дишите заједно.', 'Míralo unos segundos y respira con él.', 'Olha uns segundos e respira com ele.'),
        regras: [
          P.evento('sempre', T('Breathing never stops. Which block repeats?', 'Дисање никад не престаје. Који блок понавља?', 'La respiración nunca se detiene. ¿Qué bloque repite?', 'A respiração nunca pára. Que bloco repete?')),
          P.bloco('sempre', 'mk_icone', T('What does breathing in look like? And breathing out?', 'Како изгледа удах? А издах?', '¿Cómo se ve inspirar? ¿Y espirar?', 'Como é que fica o inspirar? E o expirar?')),
          P.regra('rapido', a => evs(a, 'sempre').some(e => blocos(e, 'mk_icone').length >= 2 && blocos(e, 'mk_pausa').filter(p => p.ms >= 1500).length < 2), [
            ['surpreendida', T('That heart is beating like after a race! Is that calm?', 'То срце куца као после трке! Да ли је то мирно?', '¡Ese corazón late como después de una carrera! ¿Eso es tranquilo?', 'Esse coração bate como depois de uma corrida! Isso é calmo?')],
            T('Each heart needs a long pause after it: 2000 ms.', 'Сваком срцу треба дуга пауза после њега: 2000 ms.', 'Cada corazón necesita una pausa larga después: 2000 ms.', 'Cada coração precisa de uma pausa comprida a seguir: 2000 ms.'),
            T('Put “pause (ms) 2000” after each “show icon”.', 'Стави „пауза (ms) 2000“ после сваког „прикажи иконицу“.', 'Pon «pausa (ms) 2000» después de cada «mostrar ícono».', 'Põe «pausa (ms) 2000» depois de cada «mostrar ícone».'),
          ], T('Slow and calm. Breathe…', 'Споро и мирно. Удахни…', 'Lento y tranquilo. Respira…', 'Lento e calmo. Respira…')),
        ],
        sucesso: T('A breathing light. Four seconds per breath is a calm rhythm for many people.', 'Светло које дише. Четири секунде по удаху је миран ритам за многе људе.', 'Una luz que respira. Cuatro segundos por respiración es un ritmo tranquilo para mucha gente.', 'Uma luz que respira. Quatro segundos por respiração é um ritmo calmo para muita gente.'),
        extensao: T('Make the breath slower: 3 seconds in, 4 seconds out.', 'Успори дах: 3 секунде удах, 4 секунде издах.', 'Haz la respiración más lenta: 3 segundos inspira, 4 espira.', 'Torna a respiração mais lenta: 3 segundos a inspirar, 4 a expirar.'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.icone('Heart'), I.pausa(200), I.icone('SmallHeart'), I.pausa(200)))),
          pedido: T('My breathing guide makes me nervous instead of calm! What did I do?', 'Мој водич за дисање ме чини нервозним уместо мирним! Шта сам урадио?', '¡Mi guía de respiración me pone nervioso en vez de tranquilo! ¿Qué he hecho?', 'O meu guia de respiração deixa-me nervoso em vez de calmo! O que é que eu fiz?'),
        },
      },
    },

    // ------------------------------------------------------------ 4 · Bandeira que se toca
    {
      titulo: T('A flag you can touch', 'Заставица коју можеш да додирнеш', 'Una bandera que se puede tocar', 'Uma bandeira que se toca'),
      missao: T('At the door of the quiet room: a servo raises a flag when it is loud inside (above 60 dB), and lowers it when it is quiet.', 'На вратима тихе собе: серво подиже заставицу кад је унутра бучно (изнад 60 dB), а спушта кад је тихо.', 'En la puerta de la sala tranquila: un servo levanta una bandera cuando hay ruido dentro (más de 60 dB) y la baja cuando hay silencio.', 'À porta da sala calma: um servo levanta uma bandeira quando há barulho lá dentro (acima de 60 dB) e baixa-a quando está sossegado.'),
      passos: [
        T('“forever” + “if noise > 60 then … else …”.', '„заувек“ + „ако бука > 60 онда … иначе …“.', '«para siempre» + «si ruido > 60 entonces … si no …».', '«para sempre» + «se ruído > 60 então … senão …».'),
        T('“then”: servo write pin P8 to 180 (flag up). “else”: to 0 (flag down).', '„онда“: серво упис пин P8 на 180 (заставица горе). „иначе“: на 0 (доле).', '«entonces»: escribir servo pin P8 a 180 (bandera arriba). «si no»: a 0 (abajo).', '«então»: escrever servo pin P8 para 180 (bandeira em cima). «senão»: para 0 (em baixo).'),
        T('Test it: noise at 80, then at 40.', 'Испробај: бука на 80, па на 40.', 'Pruébalo: ruido a 80 y luego a 40.', 'Experimenta: ruído a 80 e depois a 40.'),
      ],
      material: MAT_SERVO,
      novos: ['ic_se_ruido', 'ic_servo'],
      caixa: ['mk_sempre', 'ic_se_ruido', 'ic_servo', 'mk_kit_ruido', 'mk_comparar'],
      teste: 'kit_ruido',
      ok: r => V.doisLados(r, 'kit_ruido', 60, x => x.startsWith('servo:')),
      perspetiva: 'mira',
      perspetivaPergunta: T('Mira can’t see a screen, but she can touch a flag. What other signals could work for someone who can’t see — or can’t hear?', 'Мира не може да види екран, али може да додирне заставицу. Који још сигнали могу да раде за некога ко не види — или не чује?', 'Mira no puede ver una pantalla, pero sí tocar una bandera. ¿Qué otras señales servirían a alguien que no ve, o que no oye?', 'A Mira não vê um ecrã, mas pode tocar numa bandeira. Que outros sinais podiam servir a quem não vê — ou não ouve?'),
      pensar: T('A screen speaks to the eyes. A flag speaks to the hands and the eyes. Designing for Mira made the sign better for everyone. Why?',
        'Екран говори очима. Заставица говори рукама и очима. Дизајн за Миру учинио је знак бољим за све. Зашто?',
        'Una pantalla habla a los ojos. Una bandera habla a las manos y a los ojos. Diseñar para Mira hizo el cartel mejor para todos. ¿Por qué?',
        'Um ecrã fala para os olhos. Uma bandeira fala para as mãos e para os olhos. Desenhar para a Mira tornou o sinal melhor para todos. Porquê?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Not all signals are for the eyes. Let’s make one you can feel with your hand.', 'Нису сви сигнали за очи. Хајде да направимо један који можеш да осетиш руком.', 'No todas las señales son para los ojos. Hagamos una que se pueda sentir con la mano.', 'Nem todos os sinais são para os olhos. Vamos fazer um que se sente com a mão.')],
        parecePronto: a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && usa(x, 'mk_kit_ruido') && plano(x.sim).some(y => y.tipo === 'mk_servo') && plano(x.nao).some(y => y.tipo === 'mk_servo'))),
        testar: T('Noise at 80: flag up? Noise at 40: flag down?', 'Бука на 80: заставица горе? Бука на 40: доле?', 'Ruido a 80: ¿bandera arriba? Ruido a 40: ¿abajo?', 'Ruído a 80: bandeira em cima? Ruído a 40: em baixo?'),
        regras: [
          P.evento('sempre', T('The flag must react all the time. Which block?', 'Заставица мора стално да реагује. Који блок?', 'La bandera tiene que reaccionar siempre. ¿Qué bloque?', 'A bandeira tem de reagir sempre. Que bloco?')),
          P.bloco('sempre', 'mk_se', T('Flag up or flag down: which block chooses?', 'Заставица горе или доле: који блок бира?', 'Bandera arriba o abajo: ¿qué bloque elige?', 'Bandeira em cima ou em baixo: que bloco escolhe?')),
          P.regra('um_servo', a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && !(plano(x.sim).some(y => y.tipo === 'mk_servo') && plano(x.nao).some(y => y.tipo === 'mk_servo')))), [
            ['a_pensar', T('The flag goes up… and then? It needs to come down when it is quiet.', 'Заставица иде горе… а онда? Мора да се спусти кад је тихо.', 'La bandera sube… ¿y luego? Tiene que bajar cuando hay silencio.', 'A bandeira sobe… e depois? Tem de descer quando está sossegado.')],
            T('Each path needs a “servo write”: 180 up, 0 down.', 'Сваки пут треба „серво упис“: 180 горе, 0 доле.', 'Cada camino necesita un «escribir servo»: 180 arriba, 0 abajo.', 'Cada caminho precisa de um «escrever servo»: 180 em cima, 0 em baixo.'),
            T('Put a servo block with 0 in the “else”.', 'Стави серво блок са 0 у „иначе“.', 'Pon un bloque servo con 0 en el «si no».', 'Põe um bloco do servo com 0 no «senão».'),
          ], T('Up and down, like a real signal.', 'Горе и доле, као прави сигнал.', 'Arriba y abajo, como una señal de verdad.', 'Em cima e em baixo, como um sinal a sério.')),
        ],
        sucesso: T('A tactile sign! Fix the flag on the door at hand height and test it with a blindfolded partner.', 'Тактилни знак! Причврсти заставицу на врата у висини руке и испробај са партнером повезаних очију.', '¡Un cartel táctil! Pon la bandera en la puerta a la altura de la mano y pruébala con un compañero con los ojos tapados.', 'Um sinal tátil! Prende a bandeira na porta à altura da mão e testa com um colega de olhos vendados.'),
        extensao: T('Use the 5-second average, so one cough doesn’t raise the flag.', 'Користи просек од 5 секунди, да један кашаљ не подигне заставицу.', 'Usa la media de 5 segundos, para que una tos no levante la bandera.', 'Usa a média de 5 segundos, para uma tosse não levantar a bandeira.'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.se(cmp(ruido(), '>', 60), [I.servo('P8', 180)], [I.servo('P8', 180)])))),
          pedido: T('My flag is always up, even when the room is silent. Visitors never go in!', 'Моја заставица је увек горе, чак и кад је соба тиха. Посетиоци никад не улазе!', '¡Mi bandera está siempre arriba, aunque la sala esté en silencio! Los visitantes nunca entran.', 'A minha bandeira está sempre em cima, mesmo com a sala em silêncio. Os visitantes nunca entram!'),
        },
      },
    },

    // ------------------------------------------------------------ 5 · Ouvir a luz
    {
      titulo: T('Hear the light', 'Чуј светлост', 'Oír la luz', 'Ouvir a luz'),
      missao: T('Turn light into sound: more light, higher note. A blind visitor can “hear” where the bright windows are.', 'Претвори светлост у звук: више светла, виши тон. Слепи посетилац може да „чује“ где су светли прозори.', 'Convierte la luz en sonido: más luz, nota más aguda. Un visitante ciego puede «oír» dónde están las ventanas luminosas.', 'Transforma a luz em som: mais luz, nota mais aguda. Um visitante cego pode «ouvir» onde estão as janelas com luz.'),
      passos: [
        T('“forever”: play tone … for 1/4 beat.', '„заувек“: свирај тон … у трајању 1/4 такта.', '«para siempre»: reproducir tono … durante 1/4 de pulso.', '«para sempre»: tocar tom … por 1/4 de batida.'),
        T('The tone = light level × 4 + 200 (use two math blocks).', 'Тон = ниво светлости × 4 + 200 (користи два блока за рачун).', 'El tono = nivel de luz × 4 + 200 (usa dos bloques de matemáticas).', 'O tom = nível de luz × 4 + 200 (usa dois blocos de matemática).'),
        T('Test it: move the light slider and listen.', 'Испробај: помери клизач светлости и слушај.', 'Pruébalo: mueve el control de la luz y escucha.', 'Experimenta: mexe no controlo da luz e ouve.'),
      ],
      material: MAT,
      novos: ['mk_luz', 'ic_tom_livre', 'ic_conta_vezes', 'ic_conta_mais'],
      caixa: ['mk_sempre', 'mk_luz', 'ic_tom_livre', 'ic_conta_vezes', 'ic_conta_mais'],
      teste: 'luz',
      espera: 900,
      ok: ouvirLuz,
      perspetiva: 'mira',
      perspetivaTexto: T('When I walk into a room I listen for the windows: the street noise comes through them. A beep that changes with the light would tell me even more.', 'Кад уђем у собу, ослушкујем прозоре: кроз њих долази бука са улице. Писак који се мења са светлошћу рекао би ми још више.', 'Cuando entro en una sala, escucho dónde están las ventanas: por ellas entra el ruido de la calle. Un pitido que cambie con la luz me diría aún más.', 'Quando entro numa sala, oiço onde estão as janelas: o barulho da rua entra por elas. Um apito que mudasse com a luz dizia-me ainda mais.'),
      pensar: T('You turned one sense into another. This is called sonification. What else could become sound: crowds, temperature, the way out?',
        'Претворио си једно чуло у друго. То се зове сонификација. Шта би још могло да постане звук: гужва, температура, излаз?',
        'Has convertido un sentido en otro. Se llama sonificación. ¿Qué más podría convertirse en sonido: la gente, la temperatura, la salida?',
        'Transformaste um sentido noutro. Chama-se sonificação. Que mais podia virar som: as pessoas, a temperatura, a saída?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Can we hear light? With a little math, yes!', 'Можемо ли да чујемо светлост? Уз мало математике, да!', '¿Se puede oír la luz? ¡Con un poco de matemáticas, sí!', 'Dá para ouvir a luz? Com um bocadinho de matemática, dá!')],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'mk_tom').some(p => usa(p, 'mk_luz'))),
        testar: T('Move the light slider from dark to bright. Does the note go up?', 'Помери клизач светлости од мрака до светла. Да ли тон расте?', 'Mueve el control de la luz de oscuro a claro. ¿Sube la nota?', 'Mexe no controlo da luz do escuro para o claro. A nota sobe?'),
        regras: [
          P.evento('sempre', T('The sound should follow the light all the time. Which block?', 'Звук треба стално да прати светлост. Који блок?', 'El sonido debe seguir la luz siempre. ¿Qué bloque?', 'O som deve seguir a luz o tempo todo. Que bloco?')),
          P.bloco('sempre', 'mk_tom', T('Which block plays a note?', 'Који блок свира ноту?', '¿Qué bloque reproduce una nota?', 'Que bloco toca uma nota?')),
          P.regra('sem_luz', a => evs(a, 'sempre').some(e => blocos(e, 'mk_tom').length && !blocos(e, 'mk_tom').some(p => usa(p, 'mk_luz'))), [
            ['a_pensar', T('The note is always the same. Where should the light come in?', 'Нота је увек иста. Где треба да уђе светлост?', 'La nota siempre es la misma. ¿Dónde debería entrar la luz?', 'A nota é sempre a mesma. Onde é que a luz devia entrar?')],
            T('The note is a number. Build it from the light: light × 4 + 200.', 'Нота је број. Направи га од светлости: светлост × 4 + 200.', 'La nota es un número. Constrúyelo con la luz: luz × 4 + 200.', 'A nota é um número. Constrói-a com a luz: luz × 4 + 200.'),
            T('Put “+” in the tone; inside its first hole, “×” with “light level” and 4; then 200.', 'Стави „+“ у тон; у његову прву рупу „×“ са „ниво светлости“ и 4; па 200.', 'Pon «+» en el tono; en su primer hueco, «×» con «nivel de luz» y 4; luego 200.', 'Põe «+» no tom; no primeiro buraco, «×» com «nível de luz» e 4; depois 200.'),
          ], T('Now you can hear the light!', 'Сад можеш да чујеш светлост!', '¡Ahora puedes oír la luz!', 'Agora consegues ouvir a luz!')),
        ],
        sucesso: T('Light became sound! Dark is low (200 Hz); bright is high (up to 1220 Hz).', 'Светлост је постала звук! Мрак је дубоко (200 Hz); светло је високо (до 1220 Hz).', '¡La luz se convirtió en sonido! Oscuro es grave (200 Hz); claro es agudo (hasta 1220 Hz).', 'A luz virou som! O escuro é grave (200 Hz); o claro é agudo (até 1220 Hz).'),
        extensao: T('Add a pause so the beeps become slower and calmer.', 'Додај паузу да писци буду спорији и мирнији.', 'Añade una pausa para que los pitidos sean más lentos y tranquilos.', 'Junta uma pausa para os apitos ficarem mais lentos e calmos.'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.tom(conta(conta(B('mk_som_nivel'), '*', 4), '+', 200))))),
          pedido: T('My light-to-sound tool reacts when I talk, not when I cover it! What is it listening to?', 'Мој алат светлост-у-звук реагује кад причам, а не кад га покријем! Шта он слуша?', '¡Mi herramienta de luz a sonido reacciona cuando hablo, no cuando la tapo! ¿Qué está escuchando?', 'A minha ferramenta luz-som reage quando falo, não quando a tapo! O que é que ela está a ouvir?'),
        },
      },
    },

    // ------------------------------------------------------------ 6 · Projeto: o canto calmo
    {
      titulo: T('Project · The calm corner', 'Пројекат · Мирни кутак', 'Proyecto · El rincón tranquilo', 'Projeto · O canto calmo'),
      missao: T('One device, two signals: when it is loud, flag up AND a warning icon; when it is quiet, flag down AND a calm icon.', 'Један уређај, два сигнала: кад је бучно, заставица горе И иконица упозорења; кад је тихо, заставица доле И мирна иконица.', 'Un aparato, dos señales: con ruido, bandera arriba Y un ícono de aviso; en silencio, bandera abajo Y un ícono tranquilo.', 'Um aparelho, dois sinais: com barulho, bandeira em cima E um ícone de aviso; em sossego, bandeira em baixo E um ícone calmo.'),
      passos: [
        T('“forever” + “if noise > 60 then … else …”.', '„заувек“ + „ако бука > 60 онда … иначе …“.', '«para siempre» + «si ruido > 60 entonces … si no …».', '«para sempre» + «se ruído > 60 então … senão …».'),
        T('Each path: a servo position AND an icon.', 'Сваки пут: положај серва И иконица.', 'Cada camino: una posición del servo Y un ícono.', 'Cada caminho: uma posição do servo E um ícone.'),
        T('Test 80 and 40. Then design the corner itself on paper.', 'Испробај 80 и 40. Па нацртај сам кутак на папиру.', 'Prueba 80 y 40. Luego diseña el rincón en papel.', 'Testa 80 e 40. Depois desenha o canto em papel.'),
      ],
      material: MAT_SERVO,
      novos: [],
      caixa: ['mk_sempre', 'ic_se_ruido', 'ic_servo', 'mk_icone', 'ic_icone_coracao', 'mk_kit_ruido', 'mk_comparar'],
      teste: 'kit_ruido',
      ok: r => V.doisLados(r, 'kit_ruido', 60, x => x.startsWith('servo:')) && V.doisLados(r, 'kit_ruido', 60, x => x.startsWith('icone:')),
      perspetiva: 'nina',
      pensar: T('Present your calm corner to museum staff: what can change now, later, or not at all? Who else should you ask before building it?',
        'Представи свој мирни кутак особљу музеја: шта може да се промени сада, касније или никако? Кога још треба да питаш пре него што га направиш?',
        'Presenta tu rincón tranquilo al personal del museo: ¿qué puede cambiar ahora, más tarde o nunca? ¿A quién más deberías preguntar antes de construirlo?',
        'Apresenta o teu canto calmo à equipa do museu: o que pode mudar já, mais tarde ou nunca? A quem mais devias perguntar antes de o construir?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Last project: a calm corner that speaks to the eyes and the hands at the same time.', 'Последњи пројекат: мирни кутак који говори очима и рукама у исто време.', 'Último proyecto: un rincón tranquilo que habla a los ojos y a las manos a la vez.', 'Último projeto: um canto calmo que fala para os olhos e para as mãos ao mesmo tempo.')],
        parecePronto: a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && usa(x, 'mk_kit_ruido') && ['sim', 'nao'].every(k => plano(x[k]).some(y => y.tipo === 'mk_servo') && plano(x[k]).some(y => y.tipo === 'mk_icone')))),
        testar: T('Noise at 80, then 40. Do the flag and the icon both change?', 'Бука на 80, па 40. Да ли се мењају и заставица и иконица?', 'Ruido a 80 y luego 40. ¿Cambian la bandera y el ícono?', 'Ruído a 80 e depois 40. Mudam a bandeira e o ícone?'),
        regras: [
          P.evento('sempre', T('Which block keeps the corner watching?', 'Који блок држи кутак на опрезу?', '¿Qué bloque mantiene el rincón atento?', 'Que bloco mantém o canto atento?')),
          P.bloco('sempre', 'mk_se', T('Loud or quiet: which block chooses?', 'Бучно или тихо: који блок бира?', 'Ruido o silencio: ¿qué bloque elige?', 'Barulho ou sossego: que bloco escolhe?')),
          P.regra('falta_sinal', a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && !['sim', 'nao'].every(k => plano(x[k]).some(y => y.tipo === 'mk_servo') && plano(x[k]).some(y => y.tipo === 'mk_icone')))), [
            ['a_pensar', T('One of the paths is missing a signal. Is it the flag or the icon?', 'Једном путу недостаје сигнал. Заставица или иконица?', 'A uno de los caminos le falta una señal. ¿La bandera o el ícono?', 'Falta um sinal a um dos caminhos. É a bandeira ou o ícone?')],
            T('Both paths need two blocks: a servo and an icon.', 'Оба пута требају два блока: серво и иконицу.', 'Los dos caminos necesitan dos bloques: un servo y un ícono.', 'Os dois caminhos precisam de dois blocos: um servo e um ícone.'),
            T('Check “then” and “else”: servo + icon in each.', 'Провери „онда“ и „иначе“: серво + иконица у сваком.', 'Revisa «entonces» y «si no»: servo + ícono en cada uno.', 'Vê o «então» e o «senão»: servo + ícone em cada um.'),
          ], T('Two signals in each path!', 'Два сигнала на сваком путу!', '¡Dos señales en cada camino!', 'Dois sinais em cada caminho!')),
        ],
        sucesso: T('A calm-corner signal for eyes and hands. Now design the corner itself: soft light, a seat, sound-absorbing materials.', 'Сигнал мирног кутка за очи и руке. Сад осмисли сам кутак: меко светло, седиште, материјали који упијају звук.', 'Una señal de rincón tranquilo para ojos y manos. Ahora diseña el rincón: luz suave, un asiento, materiales que absorban el sonido.', 'Um sinal de canto calmo para olhos e mãos. Agora desenha o canto: luz suave, um assento, materiais que absorvem o som.'),
        extensao: T('Build a prototype of the corner in the FabLab: felt, cork, cardboard.', 'Направи прототип кутка у FabLab-у: филц, плута, картон.', 'Construye un prototipo del rincón en el FabLab: fieltro, corcho, cartón.', 'Constrói um protótipo do canto no FabLab: feltro, cortiça, cartão.'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.se(cmp(ruido(), '>', 60), [I.servo('P8', 180), I.icone('No')], [I.icone('Heart')])))),
          pedido: T('When the room gets quiet, my icon changes… but the flag stays up! Blind visitors think it is still loud.', 'Кад соба утихне, иконица се мења… али заставица остаје горе! Слепи посетиоци мисле да је и даље бучно.', 'Cuando la sala se calma, el ícono cambia… ¡pero la bandera sigue arriba! Los visitantes ciegos creen que aún hay ruido.', 'Quando a sala sossega, o ícone muda… mas a bandeira fica em cima! Os visitantes cegos pensam que ainda há barulho.'),
        },
      },
    },
  ];

  F.registarMissao({
    id: 'calma',
    titulo: T('Designing calm', 'Дизајн мира', 'Diseñar la calma', 'Desenhar a calma'),
    tema: T('Design for others', 'Дизајн за друге', 'Diseño para los demás', 'Desenhar para os outros'),
    descricao: T('Build tools that make places easier: plans, warnings, breathing lights, signals you can touch or hear.', 'Направи алате који олакшавају места: планове, упозорења, светла за дисање, сигнале које можеш да додирнеш или чујеш.', 'Construye herramientas que hacen los lugares más fáciles: planes, avisos, luces para respirar, señales que se tocan o se oyen.', 'Constrói ferramentas que tornam os sítios mais fáceis: planos, avisos, luzes para respirar, sinais que se tocam ou se ouvem.'),
    cor: '#7A5AA6',
    perspetiva: 'dani',
    xml: XML,
    livres: [{
      titulo: T('Free project · Designed with someone', 'Слободни пројекат · Осмишљено са неким', 'Proyecto libre · Diseñado con alguien', 'Projeto livre · Desenhado com alguém'),
      missao: T('Ask a classmate what makes a place hard for them. Build a tool together — and test it with them.', 'Питај друга из одељења шта му отежава неко место. Направите алат заједно — и испробајте га са њим.', 'Pregunta a un compañero qué le hace difícil un lugar. Construid juntos una herramienta y probadla con él.', 'Pergunta a um colega o que lhe torna um sítio difícil. Construam juntos uma ferramenta — e testem-na com ele.'),
      perspetiva: 'nina',
    }],
    niveis: [{ nome: T('Level 1 · Design', 'Ниво 1 · Дизајн', 'Nivel 1 · Diseño', 'Nível 1 · Desenhar'), desafios: D }],
  });
})();
