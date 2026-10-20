/* Missão 1 · Ouvir o lugar (Listen to the place) — o som.
 *
 * Liga à Atividade 1 do guia «Sensory Mapping in Museums» (Listen to the museum) e à Parte A (A5–A6).
 * Perspetiva: Ana (autista, ouve tudo mais alto, faz masking na escola). A ideia que fica: o número do sensor
 * é o mesmo para todos, mas o limite do «demasiado» é de cada pessoa.
 *   1–4 só com o micro:bit V2 (microfone) · 5–7 com o sensor de ruído do Smart Science IoT Kit e o ecrã OLED
 *   (extensão Sensory OLED). Validação sempre pelo comportamento (registo).
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const P = F.pistas;
  const { T, V, X } = F.IC;
  const { blocos, dentro, soltoCom } = F.ajudasTutor;
  const { I, seq, xml, E, B, ruido, cmp, xVar, N, S } = X;
  const evs = P.evs;
  const usa = (p, tipo) => (p.usa || []).some(u => u.tipo === tipo);
  const plano = l => (l || []).flatMap(x => [x, ...plano(x.corpo), ...plano(x.sim), ...plano(x.nao)]);

  // blocos soltos fora do evento
  const fora = (chave, tipos) => P.regra('fora_' + chave.replace(/[^a-z0-9]/gi, '_'),
    a => evs(a, chave).length > 0 && !evs(a, chave).some(e => tipos.some(t => F.ajudasTutor.tem(e, t))) && tipos.some(t => soltoCom(a, t)), [
      ['a_pensar', T('Some blocks are outside, on their own. When will they run?', 'Неки блокови су напољу, сами. Када ће се покренути?', 'Hay bloques fuera, solos. ¿Cuándo se van a ejecutar?', 'Há blocos cá fora, sozinhos. Quando é que vão correr?')],
      T('Anything outside a pink block (or «forever») never runs.', 'Ништа што је ван розе блока (или «заувек») се никад не покреће.', 'Lo que queda fuera de un bloque rosa (o «para siempre») nunca se ejecuta.', 'Tudo o que fica fora de um bloco cor-de-rosa (ou do «para sempre») nunca corre.'),
      T(`Snap the loose blocks inside ${P.aspas(P.nomeEvento(chave))}.`, `Убаци слободне блокове унутар ${P.aspas(P.nomeEvento(chave))}.`, `Encaja los bloques sueltos dentro de ${P.aspas(P.nomeEvento(chave))}.`, `Encaixa os blocos soltos dentro de ${P.aspas(P.nomeEvento(chave))}.`),
    ], T('Now they are in the right place!', 'Сад су на правом месту!', '¡Ahora están en su sitio!', 'Agora estão no sítio certo!'));

  const grafIgual = max => (x, v) => x === 'grafico:' + Math.max(0, Math.min(25, Math.round(25 * v / max)));
  // a cara segue o limite guardado (variável «limite»): acima → uma cara, abaixo → outra, sem falhas
  function vigiaLimite(reg) {
    const cima = new Set(), baixo = new Set();
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || !reg[i].v.startsWith('som:')) continue;
      const u = V.ultimaVar(reg, i, 'limite');
      if (!u) continue;
      const s = V.saidasApos(reg, i).filter(x => x.startsWith('icone:'));
      if (!s.length) continue;
      const som = F.verif.valorDe(reg[i].v);
      if (som > u.v) cima.add(s[s.length - 1]); else if (som < u.v) baixo.add(s[s.length - 1]);
    }
    if (!(cima.size === 1 && baixo.size === 1 && [...cima][0] !== [...baixo][0])) return false;
    // e reage ao limite novo: um som que era calmo com o primeiro limite passa a «demais» depois de o baixar
    const prim = reg.find(e => e.dir === 'out' && e.v.startsWith('var:limite:'));
    if (!prim) return false;
    const L0 = F.verif.valorDe(prim.v);
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || !reg[i].v.startsWith('som:')) continue;
      const u = V.ultimaVar(reg, i, 'limite'), som = F.verif.valorDe(reg[i].v);
      if (!u || !(u.v < L0 && som > u.v && som <= L0)) continue;
      const s = V.saidasApos(reg, i).filter(x => x.startsWith('icone:'));
      if (s.length && cima.has(s[s.length - 1])) return true;
    }
    return false;
  }
  // o A baixa o limite e mostra o valor novo
  function baixaLimite(reg) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== 'botao:A') continue;
      const u = V.ultimaVar(reg, i, 'limite');
      if (!u) continue;
      const s = V.saidasApos(reg, i);
      const novo = s.find(x => x.startsWith('var:limite:'));
      if (novo && F.verif.valorDe(novo) < u.v && s.includes('numero:' + F.verif.valorDe(novo))) return true;
    }
    return false;
  }

  const XML = {
    ic_icone_surpreso: '<block type="mk_icone"><field name="I">Surprised</field></block>',
    ic_se_som: `<block type="mk_se"><value name="C"><block type="mk_comparar"><field name="OP">&gt;</field><value name="A"><block type="mk_som_nivel"></block></value>${N('B', 100)}</block></value></block>`,
    ic_def_limite: `<block type="mk_var_definir"><field name="VAR">limite</field>${N('V', 150)}</block>`,
    ic_mudar_limite: `<block type="mk_var_mudar"><field name="VAR">limite</field>${N('V', -30)}</block>`,
    ic_var_limite: xVar('limite'),
    ic_grande_ruido: `<block type="so_grande"><value name="V"><block type="mk_kit_ruido"><field name="P">P1</field></block></value>${S('ROT', F.s('oled_ruido'))}${S('UN', 'dB')}</block>`,
    ic_barra_larga: `<block type="so_barra"><value name="V"><block type="mk_kit_ruido"><field name="P">P1</field></block></value>${N('MIN', 0)}${N('MAX', 100)}${S('ROT', F.s('oled_ruido'))}${S('UN', 'dB')}</block>`,
    ic_so_texto: `<block type="so_texto">${S('T', F.s('palavra_calmo'))}${N('L', 3)}</block>`,
    ic_se_ruido: `<block type="mk_se"><value name="C"><block type="mk_comparar"><field name="OP">&lt;</field><value name="A"><block type="mk_kit_ruido"><field name="P">P1</field></block></value>${N('B', 50)}</block></value></block>`,
  };

  const MAT_MB = T('micro:bit V2 (it has a microphone)', 'micro:bit V2 (има микрофон)', 'micro:bit V2 (tiene micrófono)', 'micro:bit V2 (tem microfone)');
  const MAT_KIT = T('micro:bit V2 + IoT:bit + noise sensor (P1) + OLED', 'micro:bit V2 + IoT:bit + сензор буке (P1) + OLED', 'micro:bit V2 + IoT:bit + sensor de ruido (P1) + OLED', 'micro:bit V2 + IoT:bit + sensor de ruído (P1) + OLED');

  const D = [
    // ------------------------------------------------------------ 1 · Quanto barulho há aqui?
    {
      titulo: T('How loud is it here?', 'Колико је овде бучно?', '¿Cuánto ruido hay aquí?', 'Quanto barulho há aqui?'),
      missao: T('Press A and the micro:bit tells you how loud it is, from 0 to 255.', 'Притисни A и micro:bit ти каже колико је бучно, од 0 до 255.', 'Pulsa A y el micro:bit te dice cuánto ruido hay, de 0 a 255.', 'Carrega no A e o micro:bit diz quanto barulho há, de 0 a 255.'),
      passos: [
        T('Use “on button A pressed” with “show number”.', 'Користи „при притиску на дугме A“ са „прикажи број“.', 'Usa «al presionar el botón A» con «mostrar número».', 'Usa «no botão A premido» com «mostrar número».'),
        T('Snap “sound level” into the number.', 'Убаци „ниво звука“ у број.', 'Encaja «nivel de sonido» en el número.', 'Encaixa «nível de som» no número.'),
        T('Test it: move the sound slider and press A.', 'Испробај: помери клизач звука и притисни A.', 'Pruébalo: mueve el control del sonido y pulsa A.', 'Experimenta: mexe no controlo do som e carrega em A.'),
      ],
      material: MAT_MB,
      novos: ['mk_botao', 'mk_mostrar_numero', 'mk_som_nivel'],
      teste: 'botao:A',
      ok: r => V.mostrou(r, 'botao:A', 'som', (x, v) => x === 'numero:' + v),
      pensar: T('The micro:bit gives the same number to everyone. Ana hears the same room much louder. Is the number the whole story?',
        'micro:bit свима даје исти број. Ана исту собу чује много гласније. Да ли број говори све?',
        'El micro:bit da el mismo número a todos. Ana oye la misma sala mucho más fuerte. ¿El número lo dice todo?',
        'O micro:bit dá o mesmo número a toda a gente. A Ana ouve a mesma sala muito mais alto. O número conta a história toda?'),
      tutor: {
        boasVindas: ['boas_vindas', T('{ola} Today we are sound explorers. First question: how loud is it here?', '{ola} Данас истражујемо звук. Прво питање: колико је овде бучно?', '{ola} Hoy exploramos el sonido. Primera pregunta: ¿cuánto ruido hay aquí?', '{ola} Hoje somos exploradores do som. Primeira pergunta: quanto barulho há aqui?')],
        parecePronto: a => evs(a, 'botao:A').some(e => dentro(e, 'mk_mostrar_numero', 'mk_som_nivel')),
        testar: T('Let’s test it! Move the sound slider under the micro:bit and press A.', 'Хајде да испробамо! Помери клизач звука испод micro:bit-а и притисни A.', '¡Vamos a probar! Mueve el control del sonido debajo del micro:bit y pulsa A.', 'Vamos testar! Mexe no controlo do som por baixo do micro:bit e carrega em A.'),
        regras: [
          P.evento('botao:A', T('How does the micro:bit know when you want to measure?', 'Како micro:bit зна кад желиш да мериш?', '¿Cómo sabe el micro:bit cuándo quieres medir?', 'Como é que o micro:bit sabe quando queres medir?')),
          fora('botao:A', ['mk_mostrar_numero', 'mk_som_nivel']),
          P.bloco('botao:A', 'mk_mostrar_numero', T('The button is listening. How will the micro:bit tell you what it measured?', 'Дугме слуша. Како ће ти micro:bit рећи шта је измерио?', 'El botón ya escucha. ¿Cómo te dirá el micro:bit lo que ha medido?', 'O botão já está à escuta. Como é que o micro:bit te conta o que mediu?')),
          P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_som_nivel', T('That number never changes… but sound does! Who is listening?', 'Тај број се никад не мења… али звук се мења! Ко слуша?', 'Ese número nunca cambia… ¡pero el sonido sí! ¿Quién escucha?', 'Esse número nunca muda… mas o som muda! Quem é que ouve?')),
        ],
        sucesso: T('You measured sound! The micro:bit V2 has a tiny microphone next to the logo.', 'Измерио си звук! micro:bit V2 има мали микрофон поред логоа.', '¡Has medido el sonido! El micro:bit V2 tiene un micrófono pequeñito junto al logo.', 'Mediste o som! O micro:bit V2 tem um microfone pequenino ao lado do logotipo.'),
        extensao: T('Measure near the door, by the window and in the quietest corner. Where is it loudest?', 'Измери поред врата, поред прозора и у најтишем углу. Где је најгласније?', 'Mide junto a la puerta, junto a la ventana y en el rincón más tranquilo. ¿Dónde hay más ruido?', 'Mede junto à porta, à janela e no canto mais sossegado. Onde há mais barulho?'),
        gambiarra: {
          xml: xml(E.botao('A', seq(I.numero(120)))),
          pedido: T('I made a sound meter… but it always says 120! I clapped and nothing changed. Can you find out why?', 'Направио сам мерач звука… али увек показује 120! Пљескао сам и ништа се није променило. Можеш ли да откријеш зашто?', 'Hice un medidor de sonido… ¡pero siempre dice 120! Aplaudí y no cambió nada. ¿Descubres por qué?', 'Fiz um medidor de som… mas diz sempre 120! Bati palmas e nada mudou. Descobres porquê?'),
        },
      },
    },

    // ------------------------------------------------------------ 2 · Barra viva do som
    {
      titulo: T('A live sound bar', 'Жива трака звука', 'Una barra de sonido viva', 'Uma barra de som viva'),
      missao: T('The micro:bit draws the sound non-stop: more noise, more lights.', 'micro:bit без престанка црта звук: више буке, више лампица.', 'El micro:bit dibuja el sonido sin parar: más ruido, más luces.', 'O micro:bit desenha o som sem parar: mais barulho, mais luzes.'),
      passos: [
        T('Use “forever” with “plot bar graph”.', 'Користи „заувек“ са „нацртај тракасти графикон“.', 'Usa «para siempre» con «graficar barras».', 'Usa «para sempre» com «desenhar gráfico de barras».'),
        T('Snap “sound level” into the first hole; the maximum is 255.', 'Убаци „ниво звука“ у прву рупу; највише је 255.', 'Encaja «nivel de sonido» en el primer hueco; el máximo es 255.', 'Encaixa «nível de som» no primeiro buraco; o máximo é 255.'),
        T('Test it: move the sound slider or press “Clap”.', 'Испробај: помери клизач звука или притисни „Пљесни“.', 'Pruébalo: mueve el control del sonido o pulsa «Aplaudir».', 'Experimenta: mexe no controlo do som ou carrega em «Bater palmas».'),
      ],
      material: MAT_MB,
      novos: ['mk_sempre', 'mk_grafico'],
      teste: 'som',
      ok: r => V.acompanha(r, 'som', grafIgual(255)),
      pensar: T('Ana says sounds arrive “all at the same volume, all at once”. Could a bar show that? What would you need to add?',
        'Ана каже да звуци стижу „сви једнако гласни, сви одједном“. Може ли трака то да покаже? Шта би требало додати?',
        'Ana dice que los sonidos llegan «todos igual de fuertes y a la vez». ¿Podría una barra mostrarlo? ¿Qué habría que añadir?',
        'A Ana diz que os sons chegam «todos ao mesmo volume, ao mesmo tempo». Uma barra consegue mostrar isso? O que faltaria?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Numbers go by fast. What if sound were a drawing that goes up and down?', 'Бројеви брзо пролазе. Шта ако би звук био цртеж који иде горе-доле?', 'Los números pasan rápido. ¿Y si el sonido fuera un dibujo que sube y baja?', 'Os números passam depressa. E se o som fosse um desenho que sobe e desce?')],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'mk_grafico').some(p => usa(p, 'mk_som_nivel') && Number(p.max) === 255)),
        testar: T('Let’s test it! Move the sound slider and watch the lights.', 'Хајде да испробамо! Помери клизач звука и гледај лампице.', '¡A probar! Mueve el control del sonido y mira las luces.', 'Vamos testar! Mexe no controlo do som e olha para as luzes.'),
        regras: [
          P.evento('sempre', T('Until now you measured once per button press. Which block measures non-stop?', 'До сада си мерио једном по притиску. Који блок мери без престанка?', 'Hasta ahora medías una vez por botón. ¿Qué bloque mide sin parar?', 'Até agora medias uma vez por botão. Que bloco mede sem parar?')),
          fora('sempre', ['mk_grafico', 'mk_som_nivel']),
          P.bloco('sempre', 'mk_grafico', T('It’s measuring non-stop. What if, instead of numbers, it drew bars?', 'Мери без престанка. Шта ако би уместо бројева цртао траке?', 'Ya mide sin parar. ¿Y si, en lugar de números, dibujara barras?', 'Já mede sem parar. E se, em vez de números, desenhasse barras?')),
          P.valorEm('sempre', 'mk_grafico', 'mk_som_nivel', T('The graph is stuck on a fixed value. What should it draw?', 'Графикон стоји на сталној вредности. Шта би требало да црта?', 'El gráfico está fijo en un valor. ¿Qué debería dibujar?', 'O gráfico está parado num valor fixo. O que é que devia desenhar?')),
          P.regra('max_errado', a => evs(a, 'sempre').some(e => blocos(e, 'mk_grafico').some(p => Number(p.max) !== 255)), [
            ['a_pensar', T('The graph fills up too early (or never fills). How high does sound level go?', 'Графикон се пуни прерано (или никад). Докле иде ниво звука?', 'El gráfico se llena demasiado pronto (o nunca). ¿Hasta dónde llega el nivel de sonido?', 'O gráfico enche cedo demais (ou nunca enche). Até quanto vai o nível de som?')],
            T('Sound level goes from 0 to 255. The second number is the maximum.', 'Ниво звука иде од 0 до 255. Други број је максимум.', 'El nivel de sonido va de 0 a 255. El segundo número es el máximo.', 'O nível de som vai de 0 a 255. O segundo número é o máximo.'),
            T('Type 255 in the second hole of the graph block.', 'Упиши 255 у другу рупу блока графикона.', 'Escribe 255 en el segundo hueco del bloque del gráfico.', 'Escreve 255 no segundo buraco do bloco do gráfico.'),
          ], T('Now the scale is right!', 'Сад је размера тачна!', '¡Ahora la escala es correcta!', 'Agora a escala está certa!')),
        ],
        sucesso: T('A live sound bar! You can see the sound without reading numbers.', 'Жива трака звука! Звук видиш без читања бројева.', '¡Una barra de sonido viva! Ves el sonido sin leer números.', 'Uma barra de som viva! Vês o som sem leres números.'),
        extensao: T('Whisper, then talk, then clap. How many lights does each one switch on?', 'Шапни, па причај, па пљесни. Колико лампица свако упали?', 'Susurra, luego habla, luego aplaude. ¿Cuántas luces enciende cada uno?', 'Sussurra, depois fala, depois bate palmas. Quantas luzes acende cada um?'),
        gambiarra: {
          xml: xml(E.botao('A', seq(I.grafico(B('mk_som_nivel'), 255)))),
          pedido: T('My sound bar only moves when I press A! I wanted it to move by itself.', 'Моја трака звука се помера само кад притиснем A! Хтео сам да се помера сама.', '¡Mi barra solo se mueve cuando pulso A! Quería que se moviera sola.', 'A minha barra de som só mexe quando carrego no A! Eu queria que andasse sozinha.'),
        },
      },
    },

    // ------------------------------------------------------------ 3 · Calmo ou demais?
    {
      titulo: T('Calm or too much?', 'Мирно или превише?', '¿Tranquilo o demasiado?', 'Calmo ou demais?'),
      missao: T('Show one face when it is calm and another when it is too loud (above 100).', 'Прикажи једно лице кад је мирно, а друго кад је прегласно (изнад 100).', 'Muestra una cara cuando está tranquilo y otra cuando hay demasiado ruido (más de 100).', 'Mostra uma cara quando está calmo e outra quando há barulho a mais (acima de 100).'),
      passos: [
        T('Inside “forever”, use “if … then … else”.', 'Унутар „заувек“ користи „ако … онда … иначе“.', 'Dentro de «para siempre», usa «si … entonces … si no».', 'Dentro do «para sempre», usa «se … então … senão».'),
        T('The question: “sound level > 100”.', 'Питање: „ниво звука > 100“.', 'La pregunta: «nivel de sonido > 100».', 'A pergunta: «nível de som > 100».'),
        T('One icon for “too loud”, a different one for “calm”.', 'Једна иконица за „прегласно“, друга за „мирно“.', 'Un ícono para «demasiado», otro distinto para «tranquilo».', 'Um ícone para «demais», outro diferente para «calmo».'),
      ],
      material: MAT_MB,
      novos: ['ic_se_som', 'ic_icone_surpreso', 'mk_icone'],
      teste: 'som',
      ok: r => V.doisLados(r, 'som', 100, x => x.startsWith('icone:')),
      pensar: T('You chose 100 as the limit. Would Ana choose the same number? Who should decide the limit of a classroom?',
        'Изабрао си 100 као границу. Да ли би Ана изабрала исти број? Ко треба да одлучи о граници у учионици?',
        'Elegiste 100 como límite. ¿Elegiría Ana el mismo número? ¿Quién debería decidir el límite de un aula?',
        'Escolheste 100 como limite. A Ana escolheria o mesmo número? Quem deve decidir o limite de uma sala de aula?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Let’s teach the micro:bit to decide: is this calm, or too much?', 'Хајде да научимо micro:bit да одлучи: да ли је ово мирно или превише?', 'Enseñemos al micro:bit a decidir: ¿esto es tranquilo o demasiado?', 'Vamos ensinar o micro:bit a decidir: isto está calmo ou é demais?')],
        parecePronto: a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && usa(x, 'mk_som_nivel') && plano(x.sim).some(y => y.tipo === 'mk_icone') && plano(x.nao).some(y => y.tipo === 'mk_icone'))),
        testar: T('Test both sides: make it loud (above 100), then quiet.', 'Испробај обе стране: појачај (изнад 100), па утишај.', 'Prueba los dos lados: haz ruido (más de 100) y luego silencio.', 'Testa os dois lados: faz barulho (acima de 100) e depois silêncio.'),
        regras: [
          P.evento('sempre', T('The micro:bit has to keep asking about the sound. Which block repeats non-stop?', 'micro:bit мора стално да пита за звук. Који блок понавља без престанка?', 'El micro:bit tiene que preguntar sin parar por el sonido. ¿Qué bloque repite siempre?', 'O micro:bit tem de estar sempre a perguntar pelo som. Que bloco repete sem parar?')),
          P.bloco('sempre', 'mk_se', T('There are two possible answers: calm or too much. Which block chooses between two paths?', 'Постоје два одговора: мирно или превише. Који блок бира између два пута?', 'Hay dos respuestas posibles: tranquilo o demasiado. ¿Qué bloque elige entre dos caminos?', 'Há duas respostas possíveis: calmo ou demais. Que bloco escolhe entre dois caminhos?')),
          P.regra('sem_pergunta', a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && !usa(x, 'mk_som_nivel'))), [
            ['a_pensar', T('Your “if” is asking a question… but is it a question about sound?', 'Твоје „ако“ поставља питање… али да ли је то питање о звуку?', 'Tu «si» hace una pregunta… pero ¿es una pregunta sobre el sonido?', 'O teu «se» faz uma pergunta… mas é uma pergunta sobre o som?')],
            T('The question goes in the hole of the “if”: compare “sound level” with 100.', 'Питање иде у рупу од „ако“: упореди „ниво звука“ са 100.', 'La pregunta va en el hueco del «si»: compara «nivel de sonido» con 100.', 'A pergunta vai no buraco do «se»: compara «nível de som» com 100.'),
            T('Put “sound level > 100” in the hole of the “if”.', 'Стави „ниво звука > 100“ у рупу од „ако“.', 'Pon «nivel de sonido > 100» en el hueco del «si».', 'Põe «nível de som > 100» no buraco do «se».'),
          ], T('Now it asks about the sound!', 'Сад пита за звук!', '¡Ahora pregunta por el sonido!', 'Agora pergunta pelo som!')),
          P.regra('um_lado', a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && (!plano(x.sim).some(y => y.tipo === 'mk_icone') || !plano(x.nao).some(y => y.tipo === 'mk_icone')))), [
            ['a_pensar', T('One of the two paths is empty. What should the micro:bit show there?', 'Један од два пута је празан. Шта би micro:bit ту требало да покаже?', 'Uno de los dos caminos está vacío. ¿Qué debería mostrar ahí el micro:bit?', 'Um dos dois caminhos está vazio. O que é que o micro:bit devia mostrar aí?')],
            T('“then” is for too loud, “else” is for calm. Each one needs an icon.', '„онда“ је за прегласно, „иначе“ за мирно. Свако треба иконицу.', '«entonces» es para demasiado, «si no» para tranquilo. Cada uno necesita un ícono.', 'O «então» é para demais, o «senão» para calmo. Cada um precisa de um ícone.'),
            T('Put a different “show icon” in each path.', 'Стави различиту „прикажи иконицу“ на сваки пут.', 'Pon un «mostrar ícono» distinto en cada camino.', 'Põe um «mostrar ícone» diferente em cada caminho.'),
          ], T('Both paths have their face now!', 'Оба пута сад имају своје лице!', '¡Ya tienen su cara los dos caminos!', 'Os dois caminhos já têm a sua cara!')),
        ],
        sucesso: T('Your micro:bit decides! The “if” asks the question; the answer chooses the path.', 'Твој micro:bit одлучује! „Ако“ поставља питање; одговор бира пут.', '¡Tu micro:bit decide! El «si» hace la pregunta; la respuesta elige el camino.', 'O teu micro:bit decide! O «se» faz a pergunta; a resposta escolhe o caminho.'),
        extensao: T('Try 80, then 150. Which limit feels right for your classroom? Vote with your group.', 'Пробај 80, па 150. Која граница одговара твојој учионици? Гласајте у групи.', 'Prueba 80 y luego 150. ¿Qué límite va bien para tu aula? Votad en grupo.', 'Experimenta 80 e depois 150. Que limite faz sentido na tua sala? Votem em grupo.'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.se(cmp(B('mk_som_nivel'), '>', 100), [I.icone('Surprised')], [I.icone('Surprised')])))),
          pedido: T('My sign always shows the same face, even in silence! What did I do?', 'Мој знак увек показује исто лице, чак и у тишини! Шта сам урадио?', '¡Mi cartel siempre muestra la misma cara, incluso en silencio! ¿Qué he hecho?', 'O meu sinal mostra sempre a mesma cara, mesmo em silêncio! O que é que eu fiz?'),
        },
      },
    },

    // ------------------------------------------------------------ 4 · O teu limite, o limite da Ana
    {
      titulo: T('Your limit, Ana’s limit', 'Твоја граница, Анина граница', 'Tu límite, el límite de Ana', 'O teu limite, o limite da Ana'),
      missao: T('Keep the limit in a variable. Button A lowers it — for someone who hears more.', 'Чувај границу у променљивој. Дугме A је смањује — за некога ко чује више.', 'Guarda el límite en una variable. El botón A lo baja, para alguien que oye más.', 'Guarda o limite numa variável. O botão A baixa-o — para quem ouve mais.'),
      passos: [
        T('“on start”: set limit to 150. In “forever”: compare sound level with the variable limit.', '„при покретању“: постави границу на 150. У „заувек“: упореди ниво звука са променљивом граница.', '«al iniciar»: fijar límite a 150. En «para siempre»: compara el nivel de sonido con la variable límite.', '«no arranque»: definir limite para 150. No «para sempre»: compara o nível de som com a variável limite.'),
        T('Button A: change limit by -30, then show number limit.', 'Дугме A: промени границу за -30, па прикажи број граница.', 'Botón A: cambiar límite por -30 y mostrar número límite.', 'Botão A: mudar limite em -30 e mostrar número limite.'),
        T('Test it: a sound of 130 is calm… until you press A.', 'Испробај: звук од 130 је миран… док не притиснеш A.', 'Pruébalo: un sonido de 130 es tranquilo… hasta que pulsas A.', 'Experimenta: um som de 130 é calmo… até carregares no A.'),
      ],
      material: MAT_MB,
      novos: ['mk_iniciar', 'ic_def_limite', 'ic_var_limite', 'ic_mudar_limite'],
      teste: 'botao:A',
      ok: r => vigiaLimite(r) && baixaLimite(r),
      pensar: T('Same room, same sound — but for Ana it is already “too much”. What else, besides the sound, could make a place hard to be in?',
        'Иста соба, исти звук — али Ани је то већ „превише“. Шта још, осим звука, може да отежа боравак негде?',
        'Misma sala, mismo sonido, pero para Ana ya es «demasiado». ¿Qué más, aparte del sonido, puede hacer difícil estar en un lugar?',
        'A mesma sala, o mesmo som — mas para a Ana já é «demais». O que mais, além do som, pode tornar um sítio difícil?'),
      perspetivaPergunta: T('Ana’s limit is lower than most people’s. Is that a problem with Ana, or with the room?', 'Анина граница је нижа него код већине људи. Да ли је то проблем са Аном или са собом?', 'El límite de Ana es más bajo que el de la mayoría. ¿Es un problema de Ana o de la sala?', 'O limite da Ana é mais baixo do que o da maioria. É um problema da Ana ou da sala?'),
      tutor: {
        boasVindas: ['boas_vindas', T('A number written inside the “if” is the same for everybody. A variable can change — like people.', 'Број уписан у „ако“ је исти за све. Променљива може да се мења — као људи.', 'Un número escrito dentro del «si» es igual para todos. Una variable puede cambiar, como las personas.', 'Um número escrito dentro do «se» é igual para toda a gente. Uma variável pode mudar — como as pessoas.')],
        parecePronto: a => evs(a, 'inicio').some(e => blocos(e, 'mk_var_definir').some(p => p.var === 'limite')) &&
          evs(a, 'botao:A').some(e => blocos(e, 'mk_var_mudar').some(p => p.var === 'limite')) &&
          evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && (x.usa || []).some(u => u.tipo === 'mk_var' && u.var === 'limite'))),
        testar: T('Test it: sound at 130 (calm), press A, then sound at 130 again. Did the face change?', 'Испробај: звук на 130 (мирно), притисни A, па опет звук на 130. Да ли се лице променило?', 'Pruébalo: sonido a 130 (tranquilo), pulsa A y otra vez sonido a 130. ¿Cambió la cara?', 'Experimenta: som a 130 (calmo), carrega no A e outra vez som a 130. A cara mudou?'),
        regras: [
          P.evento('inicio', T('Where does the limit start? Something has to happen once, when the micro:bit switches on.', 'Где граница почиње? Нешто мора да се деси једном, кад се micro:bit укључи.', '¿Dónde empieza el límite? Algo tiene que pasar una vez, al encender el micro:bit.', 'Onde é que o limite começa? Há uma coisa que acontece uma vez, quando o micro:bit liga.')),
          P.bloco('inicio', 'mk_var_definir', T('“on start” is empty. How does the micro:bit learn the first limit?', '„при покретању“ је празно. Како micro:bit сазнаје прву границу?', '«al iniciar» está vacío. ¿Cómo aprende el micro:bit el primer límite?', 'O «no arranque» está vazio. Como é que o micro:bit fica a saber o primeiro limite?')),
          P.evento('botao:A', T('Who lowers the limit? Choose a button for it.', 'Ко смањује границу? Изабери дугме за то.', '¿Quién baja el límite? Elige un botón para eso.', 'Quem é que baixa o limite? Escolhe um botão para isso.')),
          P.bloco('botao:A', 'mk_var_mudar', T('Button A is ready. Which block changes a variable a little?', 'Дугме A је спремно. Који блок мало мења променљиву?', 'El botón A está listo. ¿Qué bloque cambia un poco una variable?', 'O botão A está pronto. Que bloco muda um bocadinho uma variável?')),
          P.regra('limite_fixo', a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && usa(x, 'mk_som_nivel') && !(x.usa || []).some(u => u.tipo === 'mk_var'))), [
            ['a_pensar', T('Your “if” still compares with a fixed number. Will pressing A change anything?', 'Твоје „ако“ и даље пореди са сталним бројем. Да ли ће притисак на A нешто променити?', 'Tu «si» sigue comparando con un número fijo. ¿Cambiará algo al pulsar A?', 'O teu «se» ainda compara com um número fixo. Carregar no A vai mudar alguma coisa?')],
            T('Swap the 100 for the red variable block “limit”.', 'Замени 100 црвеним блоком променљиве „граница“.', 'Cambia el 100 por el bloque rojo de la variable «límite».', 'Troca o 100 pelo bloco vermelho da variável «limite».'),
            T('Drag “limit” into the second hole of the comparison.', 'Превуци „граница“ у другу рупу поређења.', 'Arrastra «límite» al segundo hueco de la comparación.', 'Arrasta «limite» para o segundo buraco da comparação.'),
          ], T('Now the limit can move!', 'Сад граница може да се помера!', '¡Ahora el límite se puede mover!', 'Agora o limite pode mexer-se!')),
          P.regra('nao_mostra', a => evs(a, 'botao:A').some(e => blocos(e, 'mk_var_mudar').length) && !evs(a, 'botao:A').some(e => blocos(e, 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_var'))), [
            ['curiosa', T('The limit changes… but nobody can see it. How would Ana know the new limit?', 'Граница се мења… али нико то не види. Како би Ана знала нову границу?', 'El límite cambia… pero nadie lo ve. ¿Cómo sabría Ana el nuevo límite?', 'O limite muda… mas ninguém vê. Como é que a Ana saberia o limite novo?')],
            T('After changing it, show it: “show number” with the variable inside.', 'После промене, прикажи је: „прикажи број“ са променљивом унутра.', 'Después de cambiarlo, muéstralo: «mostrar número» con la variable dentro.', 'Depois de mudar, mostra: «mostrar número» com a variável lá dentro.'),
            T('Under “change limit”, add “show number” with “limit”.', 'Испод „промени границу“ додај „прикажи број“ са „граница“.', 'Debajo de «cambiar límite», añade «mostrar número» con «límite».', 'Por baixo do «mudar limite», junta «mostrar número» com «limite».'),
          ], T('Now everyone can see the limit.', 'Сад сви виде границу.', 'Ahora todos ven el límite.', 'Agora toda a gente vê o limite.')),
        ],
        sucesso: T('Now the limit belongs to a person, not to the program. That is what a variable is for.', 'Сад граница припада особи, не програму. За то служи променљива.', 'Ahora el límite es de una persona, no del programa. Para eso sirve una variable.', 'Agora o limite é de uma pessoa, não do programa. É para isso que serve uma variável.'),
        extensao: T('Add button B to raise the limit again (+30).', 'Додај дугме B да поново подигнеш границу (+30).', 'Añade el botón B para volver a subir el límite (+30).', 'Junta o botão B para voltar a subir o limite (+30).'),
        gambiarra: {
          xml: xml(E.inicio(seq(I.definir('limite', 150))), E.botao('A', seq(I.mudar('limite', -30), I.numero(xVar('limite')))), E.sempre(seq(I.se(cmp(B('mk_som_nivel'), '>', 150), [I.icone('Surprised')], [I.icone('Happy')])))),
          pedido: T('I lower the limit with A and see the new number… but the face reacts just like before! Why?', 'Смањујем границу са A и видим нови број… али лице реагује исто као пре! Зашто?', 'Bajo el límite con A y veo el número nuevo… ¡pero la cara reacciona igual que antes! ¿Por qué?', 'Baixo o limite com o A e vejo o número novo… mas a cara reage igual a antes! Porquê?'),
        },
      },
    },

    // ------------------------------------------------------------ 5 · Decibéis no ecrã (kit)
    {
      titulo: T('Decibels on the big screen', 'Децибели на великом екрану', 'Decibelios en la pantalla grande', 'Decibéis no ecrã grande'),
      missao: T('With the kit’s noise sensor, show the noise in dB with big numbers on the OLED.', 'Сензором буке из комплета прикажи буку у dB великим бројевима на OLED-у.', 'Con el sensor de ruido del kit, muestra el ruido en dB con números grandes en la OLED.', 'Com o sensor de ruído do kit, mostra o ruído em dB com números grandes no OLED.'),
      passos: [
        T('“forever” with “big number” (purple Sensory OLED drawer).', '„заувек“ са „велики број“ (љубичаста фиока Sensory OLED).', '«para siempre» con «número grande» (cajón morado Sensory OLED).', '«para sempre» com «número grande» (gaveta roxa Sensory OLED).'),
        T('Inside: “value of noise(dB) at pin P1” (orange Octopus drawer).', 'Унутра: „вредност буке (dB) на пину P1“ (наранџаста фиока Octopus).', 'Dentro: «valor del ruido(dB) en el pin P1» (cajón naranja Octopus).', 'Lá dentro: «valor do ruído (dB) no pin P1» (gaveta laranja Octopus).'),
        T('Test it: move the “Kit noise” slider.', 'Испробај: помери клизач „Бука из комплета“.', 'Pruébalo: mueve el control «Ruido del kit».', 'Experimenta: mexe no controlo «Ruído do kit».'),
      ],
      material: MAT_KIT,
      novos: ['ic_grande_ruido', 'mk_kit_ruido'],
      teste: 'kit_ruido',
      ok: r => V.acompanha(r, 'kit_ruido', (x, v) => V.grande(x) === v),
      pensar: T('A quiet museum is about 40 dB; people talking, 60–70 dB. Where in your school would you expect the highest number?',
        'Тих музеј има око 40 dB; разговор 60–70 dB. Где у твојој школи очекујеш највећи број?',
        'Un museo tranquilo tiene unos 40 dB; gente hablando, 60–70 dB. ¿Dónde esperas el número más alto en tu colegio?',
        'Um museu calmo anda pelos 40 dB; pessoas a conversar, 60–70 dB. Onde é que esperas o número mais alto na tua escola?'),
      tutor: {
        boasVindas: ['boas_vindas', T('New sense! The kit’s noise sensor measures in decibels (dB), like the meters scientists use.', 'Ново чуло! Сензор буке мери у децибелима (dB), као мерачи научника.', '¡Nuevo sentido! El sensor de ruido del kit mide en decibelios (dB), como los medidores de los científicos.', 'Sentido novo! O sensor de ruído do kit mede em decibéis (dB), como os medidores dos cientistas.')],
        parecePronto: a => evs(a, 'sempre').some(e => dentro(e, 'so_grande', 'mk_kit_ruido')),
        testar: T('Move the “Kit noise” slider and watch the OLED under the micro:bit.', 'Помери клизач „Бука из комплета“ и гледај OLED испод micro:bit-а.', 'Mueve el control «Ruido del kit» y mira la OLED debajo del micro:bit.', 'Mexe no controlo «Ruído do kit» e olha para o OLED por baixo do micro:bit.'),
        regras: [
          P.evento('sempre', T('The big screen should follow the noise all the time. Which block repeats non-stop?', 'Велики екран треба стално да прати буку. Који блок понавља без престанка?', 'La pantalla grande tiene que seguir el ruido todo el tiempo. ¿Qué bloque repite sin parar?', 'O ecrã grande tem de seguir o ruído o tempo todo. Que bloco repete sem parar?')),
          fora('sempre', ['so_grande', 'mk_kit_ruido']),
          P.bloco('sempre', 'so_grande', T('Which block writes a big number on the OLED?', 'Који блок пише велики број на OLED-у?', '¿Qué bloque escribe un número grande en la OLED?', 'Que bloco escreve um número grande no OLED?')),
          P.valorEm('sempre', 'so_grande', 'mk_kit_ruido', T('The big number doesn’t change. Who measures the noise in dB?', 'Велики број се не мења. Ко мери буку у dB?', 'El número grande no cambia. ¿Quién mide el ruido en dB?', 'O número grande não muda. Quem é que mede o ruído em dB?')),
        ],
        sucesso: T('Decibels on the big screen — readable from far away, like in the museum test in Belgrade.', 'Децибели на великом екрану — читљиви из даљине, као на тесту у музеју у Београду.', 'Decibelios en la pantalla grande, legibles de lejos, como en la prueba del museo en Belgrado.', 'Decibéis no ecrã grande — lê-se ao longe, como no teste do museu em Belgrado.'),
        extensao: T('Change the label to the name of the room (letters without accents).', 'Промени ознаку у назив собе (латиничка слова без квачица).', 'Cambia la etiqueta por el nombre de la sala (letras sin tildes).', 'Muda o rótulo para o nome da sala (letras sem acentos).'),
        gambiarra: {
          xml: xml(E.botao('A', seq(I.grande(ruido())))),
          pedido: T('My big number only updates when I press A… and I want it to follow the noise by itself!', 'Мој велики број се освежава само кад притиснем A… а хоћу да сам прати буку!', 'Mi número grande solo cambia cuando pulso A… ¡y quiero que siga el ruido solo!', 'O meu número grande só muda quando carrego no A… e eu quero que siga o ruído sozinho!'),
        },
      },
    },

    // ------------------------------------------------------------ 6 · A barra do passeio de escuta
    {
      titulo: T('The listening-walk bar', 'Трака за шетњу ослушкивања', 'La barra del paseo de escucha', 'A barra do passeio de escuta'),
      missao: T('An intensity bar from 40 to 85 dB: the scale where small differences in a museum become visible.', 'Трака јачине од 40 до 85 dB: размера на којој мале разлике у музеју постају видљиве.', 'Una barra de intensidad de 40 a 85 dB: la escala en la que las pequeñas diferencias de un museo se ven.', 'Uma barra de intensidade de 40 a 85 dB: a escala em que as pequenas diferenças de um museu se veem.'),
      passos: [
        T('“forever” with “intensity bar” and the noise inside.', '„заувек“ са „трака јачине“ и буком унутра.', '«para siempre» con «barra de intensidad» y el ruido dentro.', '«para sempre» com «barra de intensidade» e o ruído lá dentro.'),
        T('Narrow the scale: from 40 to 85.', 'Сузи размеру: од 40 до 85.', 'Estrecha la escala: de 40 a 85.', 'Aperta a escala: de 40 a 85.'),
        T('Test it: move “Kit noise” between 40 and 70.', 'Испробај: помери „Бука из комплета“ између 40 и 70.', 'Pruébalo: mueve «Ruido del kit» entre 40 y 70.', 'Experimenta: mexe no «Ruído do kit» entre 40 e 70.'),
      ],
      material: MAT_KIT,
      novos: ['ic_barra_larga'],
      teste: 'kit_ruido',
      ok: r => V.acompanha(r, 'kit_ruido', (x, v) => { const b = V.barra(x); return !!b && b[0] === v && b[1] === 40 && b[2] === 85; }),
      pensar: T('On a scale from 0 to 100 the bar barely moved. Which differences do we miss when we look at the world with the “wrong scale”?',
        'На размери од 0 до 100 трака се једва померала. Које разлике пропуштамо кад свет гледамо „погрешном размером“?',
        'En una escala de 0 a 100 la barra casi no se movía. ¿Qué diferencias perdemos cuando miramos el mundo con la «escala equivocada»?',
        'Numa escala de 0 a 100 a barra quase não mexia. Que diferenças perdemos quando olhamos o mundo com a «escala errada»?'),
      tutor: {
        boasVindas: ['boas_vindas', T('In Belgrade we learned: in a quiet museum, a bar from 0 to 100 hardly moves. Let’s fix the scale.', 'У Београду смо научили: у тихом музеју трака од 0 до 100 се једва помера. Хајде да поправимо размеру.', 'En Belgrado aprendimos: en un museo tranquilo, una barra de 0 a 100 casi no se mueve. Arreglemos la escala.', 'Em Belgrado aprendemos: num museu calmo, uma barra de 0 a 100 quase não mexe. Vamos acertar a escala.')],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'so_barra').some(p => usa(p, 'mk_kit_ruido') && Number(p.min) === 40 && Number(p.max) === 85)),
        testar: T('Move “Kit noise” slowly between 40 and 70. Does the bar react to small changes?', 'Полако помери „Бука из комплета“ између 40 и 70. Да ли трака реагује на мале промене?', 'Mueve despacio «Ruido del kit» entre 40 y 70. ¿Reacciona la barra a los cambios pequeños?', 'Mexe devagar no «Ruído do kit» entre 40 e 70. A barra reage às pequenas mudanças?'),
        regras: [
          P.evento('sempre', T('The bar has to follow the sound all the time. Where does it go?', 'Трака мора стално да прати звук. Где иде?', 'La barra tiene que seguir el sonido todo el tiempo. ¿Dónde va?', 'A barra tem de seguir o som o tempo todo. Onde é que vai?')),
          fora('sempre', ['so_barra']),
          P.bloco('sempre', 'so_barra', T('Which purple block draws a bar that rises and falls?', 'Који љубичасти блок црта траку која расте и пада?', '¿Qué bloque morado dibuja una barra que sube y baja?', 'Que bloco roxo desenha uma barra que sobe e desce?')),
          P.valorEm('sempre', 'so_barra', 'mk_kit_ruido', T('The bar needs a value that changes. Who measures the noise?', 'Трака треба вредност која се мења. Ко мери буку?', 'La barra necesita un valor que cambie. ¿Quién mide el ruido?', 'A barra precisa de um valor que mude. Quem é que mede o ruído?')),
          P.regra('escala', a => evs(a, 'sempre').some(e => blocos(e, 'so_barra').some(p => !(Number(p.min) === 40 && Number(p.max) === 85))), [
            ['a_pensar', T('Look at the two numbers after the value. Which values mean “empty bar” and “full bar”?', 'Погледај два броја после вредности. Које вредности значе „празна трака“ и „пуна трака“?', 'Mira los dos números después del valor. ¿Qué valores significan «barra vacía» y «barra llena»?', 'Olha para os dois números depois do valor. Que valores querem dizer «barra vazia» e «barra cheia»?')],
            T('A quiet museum is about 40 dB; loud is about 85 dB.', 'Тих музеј је око 40 dB; гласно је око 85 dB.', 'Un museo tranquilo está en unos 40 dB; fuerte, en unos 85 dB.', 'Um museu calmo anda pelos 40 dB; alto anda pelos 85 dB.'),
            T('Write 40 in “from” and 85 in “to”.', 'Упиши 40 у „од“ и 85 у „до“.', 'Escribe 40 en «de» y 85 en «a».', 'Escreve 40 no «de» e 85 no «até».'),
          ], T('Now the scale shows small differences!', 'Сад размера показује мале разлике!', '¡Ahora la escala muestra diferencias pequeñas!', 'Agora a escala mostra as pequenas diferenças!')),
        ],
        sucesso: T('This is the program of the listening walk (Activity 1). The peak mark remembers the loudest moment.', 'Ово је програм шетње ослушкивања (Активност 1). Ознака врха памти најгласнији тренутак.', 'Este es el programa del paseo de escucha (Actividad 1). La marca del pico recuerda el momento más fuerte.', 'Este é o programa do passeio de escuta (Atividade 1). A marca do pico lembra o momento mais alto.'),
        extensao: T('Walk the route: stop one minute in each place and write calm, moderate or intense on Record sheet A.', 'Прошетај путањом: застани минут на сваком месту и запиши мирно, умерено или интензивно на листу A.', 'Haz el recorrido: para un minuto en cada sitio y anota tranquilo, moderado o intenso en la ficha A.', 'Faz o percurso: pára um minuto em cada sítio e escreve calmo, moderado ou intenso na ficha A.'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.barra(ruido(), 0, 100), I.pausa(100)))),
          pedido: T('My bar is almost always empty in the museum, even when people talk. What is wrong with it?', 'Моја трака је у музеју скоро увек празна, чак и кад људи причају. Шта не ваља?', 'Mi barra está casi siempre vacía en el museo, aunque la gente hable. ¿Qué le pasa?', 'A minha barra está quase sempre vazia no museu, mesmo com pessoas a falar. O que é que se passa?'),
        },
      },
    },

    // ------------------------------------------------------------ 7 · Projeto: calmo, moderado ou intenso
    {
      titulo: T('Project · Calm, moderate or intense', 'Пројекат · Мирно, умерено или интензивно', 'Proyecto · Tranquilo, moderado o intenso', 'Projeto · Calmo, moderado ou intenso'),
      missao: T('Press A and the OLED shows a word: calm below 50 dB, moderate below 70, intense above.', 'Притисни A и OLED покаже реч: мирно испод 50 dB, умерено испод 70, интензивно изнад.', 'Pulsa A y la OLED muestra una palabra: tranquilo por debajo de 50 dB, moderado por debajo de 70, intenso por encima.', 'Carrega no A e o OLED mostra uma palavra: calmo abaixo de 50 dB, moderado abaixo de 70, intenso acima.'),
      passos: [
        T('Button A: “if noise < 50 then … else …”, and a second “if noise < 70” inside the “else”.', 'Дугме A: „ако бука < 50 онда … иначе …“, и друго „ако бука < 70“ унутар „иначе“.', 'Botón A: «si ruido < 50 entonces … si no …», y un segundo «si ruido < 70» dentro del «si no».', 'Botão A: «se ruído < 50 então … senão …», e um segundo «se ruído < 70» dentro do «senão».'),
        T('In each path, “show text … on line 3” with a different word (letters without accents).', 'На сваком путу „прикажи текст … у реду 3“ са другом речју (латиница без квачица).', 'En cada camino, «mostrar texto … en la línea 3» con una palabra distinta (sin tildes).', 'Em cada caminho, «mostrar texto … na linha 3» com uma palavra diferente (sem acentos).'),
        T('Test 40, 60 and 80 dB, pressing A each time.', 'Испробај 40, 60 и 80 dB, сваки пут притисни A.', 'Prueba 40, 60 y 80 dB, pulsando A cada vez.', 'Testa 40, 60 e 80 dB, carregando no A de cada vez.'),
      ],
      material: MAT_KIT,
      novos: ['ic_se_ruido', 'ic_so_texto'],
      teste: 'botao:A',
      ok: r => { const m = V.porFaixa(r, 'botao:A', 'kit_ruido', [50, 70], V.textoOled); return [0, 1, 2].every(k => m[k] && m[k].size === 1) && new Set([0, 1, 2].map(k => [...m[k]][0])).size === 3; },
      pensar: T('The word is the micro:bit’s opinion, based on a number. Ask someone in your group: does their feeling agree with the word?',
        'Реч је мишљење micro:bit-а, засновано на броју. Питај некога из групе: да ли се његов осећај слаже са речју?',
        'La palabra es la opinión del micro:bit, basada en un número. Pregunta a alguien del grupo: ¿su sensación coincide con la palabra?',
        'A palavra é a opinião do micro:bit, baseada num número. Pergunta a alguém do grupo: o que sente concorda com a palavra?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Project time! The record sheet asks for calm, moderate or intense. Let’s make the micro:bit suggest the word.', 'Време за пројекат! Лист тражи мирно, умерено или интензивно. Хајде да micro:bit предложи реч.', '¡Hora del proyecto! La ficha pide tranquilo, moderado o intenso. Hagamos que el micro:bit sugiera la palabra.', 'Hora do projeto! A ficha pede calmo, moderado ou intenso. Vamos pôr o micro:bit a sugerir a palavra.')],
        parecePronto: a => evs(a, 'botao:A').some(e => plano(e.seq).filter(x => x.tipo === 'mk_se' || x.tipo === 'mk_se_entao').length >= 2 && plano(e.seq).filter(x => x.tipo === 'so_texto' || x.tipo === 'so_escrever' || x.tipo === 'mk_mostrar_texto').length >= 3),
        testar: T('Test three places: Kit noise at 40, 60 and 80, pressing A each time.', 'Испробај три места: бука на 40, 60 и 80, сваки пут притисни A.', 'Prueba tres sitios: ruido a 40, 60 y 80, pulsando A cada vez.', 'Testa três sítios: ruído a 40, 60 e 80, carregando no A de cada vez.'),
        regras: [
          P.evento('botao:A', T('The word appears when you press a button. Which one?', 'Реч се појављује кад притиснеш дугме. Које?', 'La palabra aparece al pulsar un botón. ¿Cuál?', 'A palavra aparece quando carregas num botão. Qual?')),
          P.bloco('botao:A', 'mk_se', T('There are three answers. Which block chooses between paths?', 'Постоје три одговора. Који блок бира између путева?', 'Hay tres respuestas. ¿Qué bloque elige entre caminos?', 'Há três respostas. Que bloco escolhe entre caminhos?')),
          P.regra('so_dois', a => evs(a, 'botao:A').some(e => plano(e.seq).filter(x => x.tipo === 'mk_se' || x.tipo === 'mk_se_entao').length === 1), [
            ['a_pensar', T('One “if” gives two paths. How many words do you need?', 'Једно „ако“ даје два пута. Колико речи ти треба?', 'Un «si» da dos caminos. ¿Cuántas palabras necesitas?', 'Um «se» dá dois caminhos. De quantas palavras precisas?')],
            T('Put a second “if … else” inside the “else” of the first one.', 'Стави друго „ако … иначе“ унутар „иначе“ првог.', 'Pon un segundo «si … si no» dentro del «si no» del primero.', 'Põe um segundo «se … senão» dentro do «senão» do primeiro.'),
            T('First “if noise < 50”; in its “else”, “if noise < 70”.', 'Прво „ако бука < 50“; у његовом „иначе“, „ако бука < 70“.', 'Primero «si ruido < 50»; en su «si no», «si ruido < 70».', 'Primeiro «se ruído < 50»; no «senão» dele, «se ruído < 70».'),
          ], T('Three paths, three words!', 'Три пута, три речи!', '¡Tres caminos, tres palabras!', 'Três caminhos, três palavras!')),
        ],
        sucesso: T('Your micro:bit sorts places into three groups — like the dots on the shared map.', 'Твој micro:bit сврстава места у три групе — као тачке на заједничкој мапи.', 'Tu micro:bit clasifica los lugares en tres grupos, como los puntos del mapa compartido.', 'O teu micro:bit arruma os sítios em três grupos — como as bolinhas do mapa partilhado.'),
        extensao: T('Add the colour of the dot to each word: green, yellow, red.', 'Додај свакој речи боју тачке: зелена, жута, црвена.', 'Añade a cada palabra el color del punto: verde, amarillo, rojo.', 'Junta a cada palavra a cor da bolinha: verde, amarelo, vermelho.'),
        gambiarra: {
          xml: xml(E.botao('A', seq(I.se(cmp(ruido(), '<', 70), [I.soTexto(F.s('palavra_calmo'), 3)], [I.se(cmp(ruido(), '<', 50), [I.soTexto(F.s('palavra_moderado'), 3)], [I.soTexto(F.s('palavra_intenso'), 3)])])))),
          pedido: T('My sorter never says “moderate”! At 60 dB it says calm. I think I mixed up the order…', 'Мој разврставач никад не каже „умерено“! На 60 dB каже мирно. Мислим да сам побркао редослед…', '¡Mi clasificador nunca dice «moderado»! A 60 dB dice tranquilo. Creo que mezclé el orden…', 'O meu classificador nunca diz «moderado»! A 60 dB diz calmo. Acho que troquei a ordem…'),
        },
      },
    },
  ];

  F.registarMissao({
    id: 'ouvir',
    titulo: T('Listen to the place', 'Ослушни место', 'Escucha el lugar', 'Ouvir o lugar'),
    tema: T('Sound', 'Звук', 'Sonido', 'Som'),
    descricao: T('Measure sound, decide what is “too much” — and discover that the limit is different for each person.', 'Мери звук, одлучи шта је „превише“ — и откриј да је граница различита за сваку особу.', 'Mide el sonido, decide qué es «demasiado» y descubre que el límite es distinto para cada persona.', 'Mede o som, decide o que é «demais» — e descobre que o limite é diferente para cada pessoa.'),
    cor: '#3BA6DC',
    perspetiva: 'ana',
    xml: XML,
    livres: [{
      titulo: T('Free project · My sound map', 'Слободни пројекат · Моја мапа звука', 'Proyecto libre · Mi mapa de sonido', 'Projeto livre · O meu mapa de som'),
      missao: T('Invent a sound tool for a place you know: a quiet-room sign, a warning, a game…', 'Измисли звучни алат за место које знаш: знак тихе собе, упозорење, игру…', 'Inventa una herramienta de sonido para un lugar que conozcas: un cartel de sala tranquila, un aviso, un juego…', 'Inventa uma ferramenta de som para um sítio que conheças: um sinal de sala calma, um aviso, um jogo…'),
      perspetiva: 'nina',
    }],
    niveis: [{ nome: T('Level 1 · Listen', 'Ниво 1 · Слушај', 'Nivel 1 · Escuchar', 'Nível 1 · Ouvir'), desafios: D }],
  });
})();
