/* Missão 2 · Detetives de salas (Room detectives) — luz e som juntos.
 *
 * Liga à Atividade 2 do guia (Room detectives) e à A7 (Two buttons, two senses).
 * Perspetiva: Luka (PHDA — a atenção salta para tudo o que pisca e mexe) e a luz que também cansa.
 * Ideia que fica: uma leitura só engana (média de 5 s); a luz e o som contam histórias diferentes da mesma sala.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const P = F.pistas;
  const { T, V, X } = F.IC;
  const { blocos, dentro, soltoCom, tem } = F.ajudasTutor;
  const { I, seq, xml, E, B, ruido, luzKit, cmp, xVar, N, S, media } = X;
  const evs = P.evs;
  const usa = (p, tipo) => (p.usa || []).some(u => u.tipo === tipo);
  const plano = l => (l || []).flatMap(x => [x, ...plano(x.corpo), ...plano(x.sim), ...plano(x.nao)]);
  const fora = (chave, tipos) => P.regra('fora_' + chave.replace(/[^a-z0-9]/gi, '_'),
    a => evs(a, chave).length > 0 && !evs(a, chave).some(e => tipos.some(t => tem(e, t))) && tipos.some(t => soltoCom(a, t)), [
      ['a_pensar', T('Some blocks are outside, on their own. When will they run?', 'Неки блокови су напољу, сами. Када ће се покренути?', 'Hay bloques fuera, solos. ¿Cuándo se van a ejecutar?', 'Há blocos cá fora, sozinhos. Quando é que vão correr?')],
      T('Anything outside a pink block (or «forever») never runs.', 'Ништа што је ван розе блока (или «заувек») се никад не покреће.', 'Lo que queda fuera de un bloque rosa (o «para siempre») nunca se ejecuta.', 'Tudo o que fica fora de um bloco cor-de-rosa (ou do «para sempre») nunca corre.'),
      T(`Snap the loose blocks inside ${P.aspas(P.nomeEvento(chave))}.`, `Убаци слободне блокове унутар ${P.aspas(P.nomeEvento(chave))}.`, `Encaja los bloques sueltos dentro de ${P.aspas(P.nomeEvento(chave))}.`, `Encaixa os blocos soltos dentro de ${P.aspas(P.nomeEvento(chave))}.`),
    ], T('Now they are in the right place!', 'Сад су на правом месту!', '¡Ahora están en su sitio!', 'Agora estão no sítio certo!'));

  // o número grande muda devagar: depois de um salto do ruído, aparecem pelo menos 2 valores pelo meio
  function devagar(reg) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || !reg[i].v.startsWith('kit_ruido:')) continue;
      const novo = F.verif.valorDe(reg[i].v), antes = V.ultimoSensor(reg, i, 'kit_ruido');
      if (antes === null || Math.abs(novo - antes) < 15) continue;
      const lo = Math.min(antes, novo), hi = Math.max(antes, novo);
      const meio = new Set(V.saidasApos(reg, i).map(V.grande).filter(x => x !== null && x > lo && x < hi));
      if (meio.size >= 2) return true;
    }
    return false;
  }
  // com o modo m (variável «modo»), a barra segue o sensor s
  function barraSegue(reg, sensor, m) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || !reg[i].v.startsWith(sensor + ':')) continue;
      const u = V.ultimaVar(reg, i, 'modo');
      if (!u || u.v !== m) continue;
      const v = F.verif.valorDe(reg[i].v);
      if (V.saidasApos(reg, i).some(x => { const b = V.barra(x); return b && b[0] === v; })) return true;
    }
    return false;
  }
  // A+B regista o ruído e a luz (em colunas diferentes)
  function relatorio(reg) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== 'botao:AB') continue;
      const r = V.ultimoSensor(reg, i, 'kit_ruido'), l = V.ultimoSensor(reg, i, 'kit_luz');
      if (r === null || l === null) continue;
      const g = V.registosApos(reg, i);
      const a = g.find(x => x.v === r), b = g.find(x => x.v === l && x !== a);
      if (a && b && a.nome !== b.nome) return true;
    }
    return false;
  }

  const XML = {
    ic_grande_ruido: `<block type="so_grande"><value name="V"><block type="mk_kit_ruido"><field name="P">P1</field></block></value>${S('ROT', F.s('oled_ruido'))}${S('UN', 'dB')}</block>`,
    ic_grande_luz: `<block type="so_grande"><value name="V"><block type="mk_kit_luz"><field name="P">P2</field></block></value>${S('ROT', F.s('oled_luz'))}${S('UN', '%')}</block>`,
    ic_media: `<block type="so_media">${N('V', 50)}${N('S', 5)}${N('C', 1)}</block>`,
    ic_se_luz: `<block type="mk_se"><value name="C"><block type="mk_comparar"><field name="OP">&gt;</field><value name="A"><block type="mk_kit_luz"><field name="P">P2</field></block></value>${N('B', 70)}</block></value></block>`,
    ic_so_texto: `<block type="so_texto">${S('T', F.s('palavra_brilho'))}${N('L', 3)}</block>`,
    ic_def_modo1: `<block type="mk_var_definir"><field name="VAR">modo</field>${N('V', 1)}</block>`,
    ic_var_modo: xVar('modo'),
    ic_cmp_igual: `<block type="mk_comparar"><field name="OP">==</field>${N('A', 0)}${N('B', 1)}</block>`,
    ic_barra_ruido: F.XML_SENSORY.so_barra,
    ic_barra_luz: F.XML_SENSORY.so_barra_luz,
    ic_registar_ruido: `<block type="mk_registar">${S('NOME', F.s('col_ruido'))}<value name="V"><block type="mk_kit_ruido"><field name="P">P1</field></block></value></block>`,
    ic_registar_luz: `<block type="mk_registar">${S('NOME', F.s('col_luz'))}<value name="V"><block type="mk_kit_luz"><field name="P">P2</field></block></value></block>`,
    ic_icone_sim: '<block type="mk_icone"><field name="I">Yes</field></block>',
  };
  const MAT_MB = T('micro:bit', 'micro:bit', 'micro:bit', 'micro:bit');
  const MAT_KIT = T('micro:bit V2 + IoT:bit + noise (P1) + light (P2) + OLED', 'micro:bit V2 + IoT:bit + бука (P1) + светлост (P2) + OLED', 'micro:bit V2 + IoT:bit + ruido (P1) + luz (P2) + OLED', 'micro:bit V2 + IoT:bit + ruído (P1) + luz (P2) + OLED');

  const D = [
    // ------------------------------------------------------------ 1 · Quanta luz?
    {
      titulo: T('How bright is it?', 'Колико је светло?', '¿Cuánta luz hay?', 'Quanta luz há?'),
      missao: T('Press A and the micro:bit shows the light level, from 0 to 255.', 'Притисни A и micro:bit покаже ниво светлости, од 0 до 255.', 'Pulsa A y el micro:bit muestra el nivel de luz, de 0 a 255.', 'Carrega no A e o micro:bit mostra o nível de luz, de 0 a 255.'),
      passos: [
        T('“on button A pressed” + “show number”.', '„при притиску на дугме A“ + „прикажи број“.', '«al presionar el botón A» + «mostrar número».', '«no botão A premido» + «mostrar número».'),
        T('Snap “light level” into the number.', 'Убаци „ниво светлости“ у број.', 'Encaja «nivel de luz» en el número.', 'Encaixa «nível de luz» no número.'),
        T('Test it: move the light slider, press A.', 'Испробај: помери клизач светлости, притисни A.', 'Pruébalo: mueve el control de la luz y pulsa A.', 'Experimenta: mexe no controlo da luz e carrega no A.'),
      ],
      material: MAT_MB,
      novos: ['mk_botao', 'mk_mostrar_numero', 'mk_luz'],
      teste: 'botao:A',
      ok: r => V.mostrou(r, 'botao:A', 'luz', (x, v) => x === 'numero:' + v),
      pensar: T('Museums keep some rooms dark on purpose: light can damage paintings and paper. Who else might prefer a darker room?',
        'Музеји неке собе намерно држе мрачним: светлост може да оштети слике и папир. Ко још може да воли мрачнију собу?',
        'Los museos mantienen algunas salas oscuras a propósito: la luz puede dañar cuadros y papel. ¿Quién más podría preferir una sala más oscura?',
        'Os museus deixam algumas salas escuras de propósito: a luz estraga pinturas e papel. Quem mais pode preferir uma sala mais escura?'),
      tutor: {
        boasVindas: ['boas_vindas', T('{ola} Detectives, first clue: how much light is there?', '{ola} Детективи, први траг: колико има светлости?', '{ola} Detectives, primera pista: ¿cuánta luz hay?', '{ola} Detetives, primeira pista: quanta luz há?')],
        parecePronto: a => evs(a, 'botao:A').some(e => dentro(e, 'mk_mostrar_numero', 'mk_luz')),
        testar: T('Move the light slider and press A.', 'Помери клизач светлости и притисни A.', 'Mueve el control de la luz y pulsa A.', 'Mexe no controlo da luz e carrega no A.'),
        regras: [
          P.evento('botao:A', T('How does the micro:bit know when to measure?', 'Како micro:bit зна кад да мери?', '¿Cómo sabe el micro:bit cuándo medir?', 'Como é que o micro:bit sabe quando medir?')),
          fora('botao:A', ['mk_mostrar_numero', 'mk_luz']),
          P.bloco('botao:A', 'mk_mostrar_numero', T('How will it tell you what it measured?', 'Како ће ти рећи шта је измерио?', '¿Cómo te dirá lo que ha medido?', 'Como é que te conta o que mediu?')),
          P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_luz', T('That number never changes. Who measures the light?', 'Тај број се никад не мења. Ко мери светлост?', 'Ese número nunca cambia. ¿Quién mide la luz?', 'Esse número nunca muda. Quem é que mede a luz?')),
        ],
        sucesso: T('Clue found! The micro:bit measures light with its own LED screen.', 'Траг пронађен! micro:bit мери светлост сопственим екраном од лампица.', '¡Pista encontrada! El micro:bit mide la luz con su propia pantalla de luces.', 'Pista encontrada! O micro:bit mede a luz com o próprio ecrã de luzes.'),
        extensao: T('Measure under a table, near the window and next to a screen.', 'Измери испод стола, поред прозора и поред екрана.', 'Mide debajo de una mesa, junto a la ventana y al lado de una pantalla.', 'Mede debaixo de uma mesa, junto à janela e ao lado de um ecrã.'),
        gambiarra: {
          xml: xml(E.botao('A', seq(I.numero(B('mk_som_nivel'))))),
          pedido: T('I cover my light meter with my hand and the number doesn’t go down… but when I talk, it goes up!', 'Покријем мерач светлости руком и број не пада… али кад причам, расте!', 'Tapo mi medidor de luz con la mano y el número no baja… ¡pero cuando hablo, sube!', 'Tapo o meu medidor de luz com a mão e o número não desce… mas quando falo, sobe!'),
        },
      },
    },

    // ------------------------------------------------------------ 2 · Dois botões, dois sentidos
    {
      titulo: T('Two buttons, two senses', 'Два дугмета, два чула', 'Dos botones, dos sentidos', 'Dois botões, dois sentidos'),
      missao: T('A shows the noise, B shows the light — big, on the OLED, so a group can walk and write.', 'A показује буку, B светлост — крупно, на OLED-у, да група може да хода и пише.', 'A muestra el ruido, B la luz, en grande en la OLED, para que el grupo camine y anote.', 'O A mostra o ruído, o B a luz — em grande no OLED, para o grupo andar e escrever.'),
      passos: [
        T('A: “big number” with the noise (P1).', 'A: „велики број“ са буком (P1).', 'A: «número grande» con el ruido (P1).', 'A: «número grande» com o ruído (P1).'),
        T('B: “big number” with the light intensity (P2).', 'B: „велики број“ са јачином светлости (P2).', 'B: «número grande» con la intensidad de luz (P2).', 'B: «número grande» com a intensidade da luz (P2).'),
        T('Test it: move both kit sliders and press A, then B.', 'Испробај: помери оба клизача и притисни A, па B.', 'Pruébalo: mueve los dos controles del kit y pulsa A y luego B.', 'Experimenta: mexe nos dois controlos do kit e carrega no A e depois no B.'),
      ],
      material: MAT_KIT,
      novos: ['mk_botao_B', 'ic_grande_ruido', 'ic_grande_luz'],
      caixa: ['mk_botao', 'mk_botao_B', 'ic_grande_ruido', 'ic_grande_luz', 'mk_kit_ruido', 'mk_kit_luz'],
      teste: 'botao:A',
      ok: r => V.mostrou(r, 'botao:A', 'kit_ruido', (x, v) => V.grande(x) === v) && V.mostrou(r, 'botao:B', 'kit_luz', (x, v) => V.grande(x) === v),
      pensar: T('Luka’s eyes jump to anything bright or blinking. Which room in your school would be easiest for Luka? Use both numbers.',
        'Лукине очи скачу на све што је светло или трепће. Која соба у твојој школи би била најлакша за Луку? Користи оба броја.',
        'Los ojos de Luka saltan a todo lo brillante o que parpadea. ¿Qué sala de tu colegio sería la más fácil para Luka? Usa los dos números.',
        'Os olhos do Luka saltam para tudo o que brilha ou pisca. Que sala da tua escola seria a mais fácil para o Luka? Usa os dois números.'),
      tutor: {
        boasVindas: ['boas_vindas', T('In the museum, groups walk around and write down values. One button for each sense makes it easy.', 'У музеју групе шетају и записују вредности. Једно дугме за свако чуло то олакшава.', 'En el museo, los grupos caminan y anotan valores. Un botón para cada sentido lo hace fácil.', 'No museu, os grupos andam e apontam valores. Um botão para cada sentido facilita.')],
        parecePronto: a => evs(a, 'botao:A').some(e => dentro(e, 'so_grande', 'mk_kit_ruido')) && evs(a, 'botao:B').some(e => dentro(e, 'so_grande', 'mk_kit_luz')),
        testar: T('Set the kit noise and the kit light, then press A and B.', 'Подеси буку и светлост из комплета, па притисни A и B.', 'Ajusta el ruido y la luz del kit y pulsa A y B.', 'Acerta o ruído e a luz do kit e carrega no A e no B.'),
        regras: [
          P.evento('botao:A', T('Which button shows the noise?', 'Које дугме показује буку?', '¿Qué botón muestra el ruido?', 'Que botão mostra o ruído?')),
          P.evento('botao:B', T('And the light? It needs its own button.', 'А светлост? Треба јој своје дугме.', '¿Y la luz? Necesita su propio botón.', 'E a luz? Precisa do seu próprio botão.')),
          P.valorEm('botao:A', 'so_grande', 'mk_kit_ruido', T('Button A should show the noise. Which sensor goes inside?', 'Дугме A треба да покаже буку. Који сензор иде унутра?', 'El botón A debe mostrar el ruido. ¿Qué sensor va dentro?', 'O botão A deve mostrar o ruído. Que sensor vai lá dentro?')),
          P.valorEm('botao:B', 'so_grande', 'mk_kit_luz', T('Button B should show the light. Which sensor goes inside?', 'Дугме B треба да покаже светлост. Који сензор иде унутра?', 'El botón B debe mostrar la luz. ¿Qué sensor va dentro?', 'O botão B deve mostrar a luz. Que sensor vai lá dentro?')),
        ],
        sucesso: T('A for sound, B for light. A single press is fine for light, which changes slowly. And for sound?', 'A за звук, B за светлост. Један притисак је довољан за светлост, која се споро мења. А за звук?', 'A para el sonido, B para la luz. Una pulsación basta para la luz, que cambia despacio. ¿Y para el sonido?', 'A para o som, B para a luz. Um toque chega para a luz, que muda devagar. E para o som?'),
        extensao: T('Press A three times in a row in the same place. Do you always get the same noise number?', 'Притисни A три пута заредом на истом месту. Да ли увек добијеш исти број буке?', 'Pulsa A tres veces seguidas en el mismo sitio. ¿Sale siempre el mismo número de ruido?', 'Carrega no A três vezes seguidas no mesmo sítio. Dá sempre o mesmo número de ruído?'),
        gambiarra: {
          xml: xml(E.botao('A', seq(I.grande(luzKit(), F.s('oled_luz'), '%'))), E.botao('B', seq(I.grande(ruido())))),
          pedido: T('My labels say NOISE on A… but the numbers look like light! I think I swapped something.', 'Моје дугме A пише БУКА… али бројеви личе на светлост! Мислим да сам нешто заменио.', 'Mi botón A dice RUIDO… ¡pero los números parecen de luz! Creo que he cambiado algo.', 'O meu botão A diz RUÍDO… mas os números parecem de luz! Acho que troquei alguma coisa.'),
        },
      },
    },

    // ------------------------------------------------------------ 3 · Média de 5 segundos
    {
      titulo: T('The five-second average', 'Просек од пет секунди', 'La media de cinco segundos', 'A média de cinco segundos'),
      missao: T('One press catches one instant: a cough, a step. Show the average noise of the last 5 seconds instead.', 'Један притисак ухвати један тренутак: кашаљ, корак. Уместо тога прикажи просечну буку последњих 5 секунди.', 'Una pulsación capta un instante: una tos, un paso. Muestra en su lugar el ruido medio de los últimos 5 segundos.', 'Um toque apanha um instante: uma tosse, um passo. Mostra antes o ruído médio dos últimos 5 segundos.'),
      passos: [
        T('“forever” + “big number”.', '„заувек“ + „велики број“.', '«para siempre» + «número grande».', '«para sempre» + «número grande».'),
        T('Inside it: “average of … over 5 s”, with the noise inside the average.', 'Унутра: „просек од … за 5 s“, са буком унутар просека.', 'Dentro: «promedio de … en 5 s», con el ruido dentro del promedio.', 'Lá dentro: «média de … em 5 s», com o ruído dentro da média.'),
        T('Test it: jump the noise from 40 to 80 and watch the number climb slowly.', 'Испробај: скочи буком са 40 на 80 и гледај како број полако расте.', 'Pruébalo: sube el ruido de 40 a 80 y mira cómo el número sube despacio.', 'Experimenta: salta o ruído de 40 para 80 e vê o número a subir devagar.'),
      ],
      material: MAT_KIT,
      novos: ['mk_sempre', 'ic_media'],
      caixa: ['mk_sempre', 'ic_grande_ruido', 'ic_media', 'mk_kit_ruido', 'mk_pausa'],
      teste: 'kit_ruido',
      espera: 2600,
      ok: devagar,
      pensar: T('An average is calmer than one moment. Is an average fair to someone like Ana, who feels the sudden loud moments most?',
        'Просек је мирнији од једног тренутка. Да ли је просек фер према некоме као што је Ана, ко најјаче осећа изненадне гласне тренутке?',
        'Una media es más tranquila que un momento. ¿Es justa la media para alguien como Ana, que siente más los momentos fuertes repentinos?',
        'Uma média é mais calma do que um instante. É justa para alguém como a Ana, que sente mais os momentos de barulho repentino?'),
      tutor: {
        boasVindas: ['boas_vindas', T('In Belgrade, single readings jumped around. Scientists use averages. Let’s try!', 'У Београду су појединачна мерења скакала. Научници користе просеке. Хајде да пробамо!', 'En Belgrado, las lecturas sueltas saltaban mucho. Los científicos usan medias. ¡Probemos!', 'Em Belgrado, as leituras soltas saltavam muito. Os cientistas usam médias. Vamos experimentar!')],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'so_grande').some(p => usa(p, 'so_media') && usa(p, 'mk_kit_ruido'))),
        testar: T('Set noise to 40, wait, then jump to 80. Does the big number walk up step by step?', 'Постави буку на 40, сачекај, па скочи на 80. Да ли велики број расте корак по корак?', 'Pon el ruido a 40, espera y salta a 80. ¿Sube el número grande paso a paso?', 'Põe o ruído a 40, espera e salta para 80. O número grande sobe passo a passo?'),
        regras: [
          P.evento('sempre', T('An average needs many readings. Which block keeps measuring?', 'Просеку треба много мерења. Који блок стално мери?', 'Una media necesita muchas lecturas. ¿Qué bloque sigue midiendo?', 'Uma média precisa de muitas leituras. Que bloco está sempre a medir?')),
          P.bloco('sempre', 'so_grande', T('How will you show the result, big and readable?', 'Како ћеш приказати резултат, крупно и читљиво?', '¿Cómo mostrarás el resultado, grande y legible?', 'Como é que mostras o resultado, grande e legível?')),
          P.regra('sem_media', a => evs(a, 'sempre').some(e => blocos(e, 'so_grande').length) && !evs(a, 'sempre').some(e => tem(e, 'so_media')), [
            ['a_pensar', T('Your number jumps with every cough. What would make it calmer?', 'Твој број скаче на сваки кашаљ. Шта би га смирило?', 'Tu número salta con cada tos. ¿Qué lo haría más tranquilo?', 'O teu número salta a cada tosse. O que é que o acalmava?')],
            T('Look in the purple drawer for “average of … over … s”.', 'Потражи у љубичастој фиоци „просек од … за … s“.', 'Busca en el cajón morado «promedio de … en … s».', 'Procura na gaveta roxa «média de … em … s».'),
            T('Put the average inside “big number”, and the noise inside the average.', 'Стави просек у „велики број“, а буку у просек.', 'Pon el promedio dentro de «número grande» y el ruido dentro del promedio.', 'Põe a média dentro do «número grande» e o ruído dentro da média.'),
          ], T('Now it shows the average!', 'Сад показује просек!', '¡Ahora muestra la media!', 'Agora mostra a média!')),
          P.regra('media_sem_ruido', a => evs(a, 'sempre').some(e => tem(e, 'so_media')) && !evs(a, 'sempre').some(e => tem(e, 'mk_kit_ruido')), [
            ['a_pensar', T('An average of what? Right now it averages a fixed number.', 'Просек чега? Сад рачуна просек сталног броја.', '¿Media de qué? Ahora mismo hace la media de un número fijo.', 'Média de quê? Agora está a fazer a média de um número fixo.')],
            T('The first hole of the average needs the noise sensor.', 'Прва рупа просека треба сензор буке.', 'El primer hueco del promedio necesita el sensor de ruido.', 'O primeiro buraco da média precisa do sensor de ruído.'),
            T('Snap “value of noise(dB)” into the average.', 'Убаци „вредност буке (dB)“ у просек.', 'Encaja «valor del ruido(dB)» en el promedio.', 'Encaixa «valor do ruído (dB)» na média.'),
          ], T('Now it averages the real noise.', 'Сад рачуна просек праве буке.', 'Ahora promedia el ruido real.', 'Agora faz a média do ruído verdadeiro.')),
        ],
        sucesso: T('The number climbs slowly: one cough no longer changes the story. That is how we measure a room.', 'Број полако расте: један кашаљ више не мења причу. Тако меримо собу.', 'El número sube despacio: una tos ya no cambia la historia. Así medimos una sala.', 'O número sobe devagar: uma tosse já não muda a história. É assim que se mede uma sala.'),
        extensao: T('Try 2 seconds and 10 seconds. Which one would you use in a museum?', 'Пробај 2 секунде и 10 секунди. Шта би користио у музеју?', 'Prueba 2 segundos y 10 segundos. ¿Cuál usarías en un museo?', 'Experimenta 2 e 10 segundos. Qual usarias num museu?'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.grande(ruido()), I.pausa(100)))),
          pedido: T('My number jumps with every little noise. I wanted a calm number for the record sheet…', 'Мој број скаче на сваки мали звук. Хтео сам миран број за лист…', 'Mi número salta con cada ruidito. Quería un número tranquilo para la ficha…', 'O meu número salta a cada barulhinho. Queria um número calmo para a ficha…'),
        },
      },
    },

    // ------------------------------------------------------------ 4 · Luz forte à frente
    {
      titulo: T('Bright light ahead', 'Јако светло испред', 'Luz fuerte más adelante', 'Luz forte à frente'),
      missao: T('A sign for visitors: one message when the light is strong (above 70), another when it is gentle.', 'Знак за посетиоце: једна порука кад је светлост јака (изнад 70), друга кад је блага.', 'Un cartel para visitantes: un mensaje cuando la luz es fuerte (más de 70), otro cuando es suave.', 'Um sinal para visitantes: uma mensagem quando a luz é forte (acima de 70), outra quando é suave.'),
      passos: [
        T('“forever” + “if light intensity > 70 then … else …”.', '„заувек“ + „ако јачина светлости > 70 онда … иначе …“.', '«para siempre» + «si intensidad de luz > 70 entonces … si no …».', '«para sempre» + «se intensidade da luz > 70 então … senão …».'),
        T('In each path, “show text … on line 3” with a different message.', 'На сваком путу „прикажи текст … у реду 3“ са другом поруком.', 'En cada camino, «mostrar texto … en la línea 3» con un mensaje distinto.', 'Em cada caminho, «mostrar texto … na linha 3» com uma mensagem diferente.'),
        T('Test 90 and 30 on the kit light.', 'Испробај 90 и 30 на светлости из комплета.', 'Prueba 90 y 30 en la luz del kit.', 'Testa 90 e 30 na luz do kit.'),
      ],
      material: MAT_KIT,
      novos: ['ic_se_luz', 'ic_so_texto'],
      caixa: ['mk_sempre', 'ic_se_luz', 'ic_so_texto', 'mk_kit_luz', 'mk_comparar'],
      teste: 'kit_luz',
      ok: r => V.doisLados(r, 'kit_luz', 70, V.textoOled),
      perspetiva: 'dani',
      pensar: T('A short warning before a bright room helps people prepare. What other surprises in a museum could have a warning sign?',
        'Кратко упозорење пре светле собе помаже људима да се припреме. Која још изненађења у музеју могу имати знак упозорења?',
        'Un aviso corto antes de una sala muy iluminada ayuda a prepararse. ¿Qué otras sorpresas de un museo podrían tener un cartel de aviso?',
        'Um aviso curto antes de uma sala muito iluminada ajuda a preparar. Que outras surpresas de um museu podiam ter um sinal de aviso?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Some visitors like to know what is coming. Let’s make a sign that warns about strong light.', 'Неки посетиоци воле да знају шта следи. Хајде да направимо знак који упозорава на јако светло.', 'A algunos visitantes les gusta saber qué viene. Hagamos un cartel que avise de la luz fuerte.', 'Alguns visitantes gostam de saber o que aí vem. Vamos fazer um sinal que avisa da luz forte.')],
        parecePronto: a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && usa(x, 'mk_kit_luz') && plano(x.sim).some(y => y.tipo === 'so_texto') && plano(x.nao).some(y => y.tipo === 'so_texto'))),
        testar: T('Kit light at 90, then 30. Does the message change?', 'Светлост на 90, па 30. Да ли се порука мења?', 'Luz del kit a 90 y luego a 30. ¿Cambia el mensaje?', 'Luz do kit a 90 e depois a 30. A mensagem muda?'),
        regras: [
          P.evento('sempre', T('The sign must keep checking the light. Which block repeats?', 'Знак мора стално да проверава светлост. Који блок понавља?', 'El cartel tiene que comprobar la luz siempre. ¿Qué bloque repite?', 'O sinal tem de estar sempre a ver a luz. Que bloco repete?')),
          P.bloco('sempre', 'mk_se', T('Two messages, two paths. Which block chooses?', 'Две поруке, два пута. Који блок бира?', 'Dos mensajes, dos caminos. ¿Qué bloque elige?', 'Duas mensagens, dois caminhos. Que bloco escolhe?')),
          P.regra('mensagem_igual', a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && !(plano(x.sim).some(y => y.tipo === 'so_texto') && plano(x.nao).some(y => y.tipo === 'so_texto')))), [
            ['a_pensar', T('One path has no message. What should visitors read there?', 'Један пут нема поруку. Шта посетиоци ту треба да прочитају?', 'Un camino no tiene mensaje. ¿Qué deberían leer allí los visitantes?', 'Um caminho não tem mensagem. O que é que os visitantes deviam ler aí?')],
            T('Each path needs “show text … on line …”.', 'Сваки пут треба „прикажи текст … у реду …“.', 'Cada camino necesita «mostrar texto … en la línea …».', 'Cada caminho precisa de «mostrar texto … na linha …».'),
            T('Put a “show text” with a different message in “then” and in “else”.', 'Стави „прикажи текст“ са различитом поруком у „онда“ и у „иначе“.', 'Pon un «mostrar texto» con un mensaje distinto en «entonces» y en «si no».', 'Põe um «mostrar texto» com uma mensagem diferente no «então» e no «senão».'),
          ], T('Both messages are there!', 'Обе поруке су ту!', '¡Están los dos mensajes!', 'Estão lá as duas mensagens!')),
        ],
        sucesso: T('A sign that warns before the surprise. Short words and symbols help everyone — like Dani says.', 'Знак који упозорава пре изненађења. Кратке речи и симболи помажу свима — као што Дани каже.', 'Un cartel que avisa antes de la sorpresa. Las palabras cortas y los símbolos ayudan a todos, como dice Dani.', 'Um sinal que avisa antes da surpresa. Palavras curtas e símbolos ajudam toda a gente — como diz o Dani.'),
        extensao: T('Add a third message for very dark rooms (below 10).', 'Додај трећу поруку за веома мрачне собе (испод 10).', 'Añade un tercer mensaje para salas muy oscuras (menos de 10).', 'Junta uma terceira mensagem para salas muito escuras (abaixo de 10).'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.se(cmp(luzKit(), '>', 70), [I.soTexto(F.s('palavra_brilho'), 3)], [I.soTexto(F.s('palavra_brilho'), 3)])))),
          pedido: T('My sign says the same thing in every room! Visitors are confused.', 'Мој знак у свакој соби каже исто! Посетиоци су збуњени.', '¡Mi cartel dice lo mismo en todas las salas! Los visitantes están confundidos.', 'O meu sinal diz o mesmo em todas as salas! Os visitantes estão baralhados.'),
        },
      },
    },

    // ------------------------------------------------------------ 5 · Trocar de sentido (variável modo)
    {
      titulo: T('Switch the sense', 'Промени чуло', 'Cambia de sentido', 'Trocar de sentido'),
      missao: T('A live bar that shows the noise after A and the light after B.', 'Жива трака која показује буку после A и светлост после B.', 'Una barra viva que muestra el ruido después de A y la luz después de B.', 'Uma barra viva que mostra o ruído depois do A e a luz depois do B.'),
      passos: [
        T('A: set mode to 1. B: set mode to 2.', 'A: постави режим на 1. B: постави режим на 2.', 'A: fijar modo a 1. B: fijar modo a 2.', 'A: definir modo para 1. B: definir modo para 2.'),
        T('“forever”: if mode = 1 then the noise bar, else the light bar.', '„заувек“: ако режим = 1 онда трака буке, иначе трака светлости.', '«para siempre»: si modo = 1 entonces la barra del ruido, si no la de la luz.', '«para sempre»: se modo = 1 então a barra do ruído, senão a da luz.'),
        T('Test it: A, move noise; B, move light.', 'Испробај: A, помери буку; B, помери светлост.', 'Pruébalo: A, mueve el ruido; B, mueve la luz.', 'Experimenta: A, mexe no ruído; B, mexe na luz.'),
      ],
      material: MAT_KIT,
      novos: ['ic_def_modo1', 'ic_var_modo', 'ic_cmp_igual', 'mk_se_senao', 'ic_barra_ruido', 'ic_barra_luz'],
      caixa: ['mk_botao', 'mk_botao_B', 'mk_sempre', 'ic_def_modo1', 'ic_var_modo', 'ic_cmp_igual', 'mk_se_senao', 'ic_barra_ruido', 'ic_barra_luz'],
      teste: 'botao:A',
      ok: r => barraSegue(r, 'kit_ruido', 1) && barraSegue(r, 'kit_luz', 2),
      pensar: T('One screen, two senses. When you design for a visitor like Luka, why might one clear thing on a screen be better than many?',
        'Један екран, два чула. Кад дизајнираш за посетиоца као што је Лука, зашто је једна јасна ствар на екрану боља од много њих?',
        'Una pantalla, dos sentidos. Al diseñar para un visitante como Luka, ¿por qué puede ser mejor una sola cosa clara en la pantalla que muchas?',
        'Um ecrã, dois sentidos. Quando desenhas para um visitante como o Luka, porque é que uma coisa clara no ecrã pode ser melhor do que muitas?'),
      tutor: {
        boasVindas: ['boas_vindas', T('The variable “mode” remembers which sense you chose. The “forever” reads it again and again.', 'Променљива „режим“ памти које чуло си изабрао. „Заувек“ је чита изнова и изнова.', 'La variable «modo» recuerda qué sentido elegiste. El «para siempre» la lee una y otra vez.', 'A variável «modo» lembra o sentido que escolheste. O «para sempre» lê-a vezes sem conta.')],
        parecePronto: a => evs(a, 'botao:A').some(e => blocos(e, 'mk_var_definir').some(p => p.var === 'modo')) && evs(a, 'botao:B').some(e => blocos(e, 'mk_var_definir').some(p => p.var === 'modo')) &&
          evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && (x.usa || []).some(u => u.tipo === 'mk_var' && u.var === 'modo'))),
        testar: T('Press A and move the noise; press B and move the light.', 'Притисни A и помери буку; притисни B и помери светлост.', 'Pulsa A y mueve el ruido; pulsa B y mueve la luz.', 'Carrega no A e mexe no ruído; carrega no B e mexe na luz.'),
        regras: [
          P.evento('botao:A', T('Which button chooses the noise?', 'Које дугме бира буку?', '¿Qué botón elige el ruido?', 'Que botão escolhe o ruído?')),
          P.bloco('botao:A', 'mk_var_definir', T('Button A should remember “noise”. Which block stores a number in “mode”?', 'Дугме A треба да запамти „бука“. Који блок чува број у „режим“?', 'El botón A debe recordar «ruido». ¿Qué bloque guarda un número en «modo»?', 'O botão A deve lembrar «ruído». Que bloco guarda um número em «modo»?')),
          P.evento('botao:B', T('And which button chooses the light?', 'А које дугме бира светлост?', '¿Y qué botón elige la luz?', 'E que botão escolhe a luz?')),
          P.bloco('botao:B', 'mk_var_definir', T('Button B should remember “light” (mode 2).', 'Дугме B треба да запамти „светлост“ (режим 2).', 'El botón B debe recordar «luz» (modo 2).', 'O botão B deve lembrar «luz» (modo 2).')),
          P.evento('sempre', T('Who draws the bar all the time?', 'Ко стално црта траку?', '¿Quién dibuja la barra todo el tiempo?', 'Quem é que desenha a barra o tempo todo?')),
          P.bloco('sempre', 'mk_se', T('The bar depends on the mode. Which block chooses?', 'Трака зависи од режима. Који блок бира?', 'La barra depende del modo. ¿Qué bloque elige?', 'A barra depende do modo. Que bloco escolhe?')),
        ],
        sucesso: T('Two senses on one screen, chosen with a button. Variables remember choices.', 'Два чула на једном екрану, бирана дугметом. Променљиве памте изборе.', 'Dos sentidos en una pantalla, elegidos con un botón. Las variables recuerdan elecciones.', 'Dois sentidos num ecrã, escolhidos com um botão. As variáveis lembram escolhas.'),
        extensao: T('Add mode 3 with A+B: a scrolling graph of the noise.', 'Додај режим 3 са A+B: покретни графикон буке.', 'Añade el modo 3 con A+B: un gráfico desplazable del ruido.', 'Junta o modo 3 com A+B: um gráfico a passar do ruído.'),
        gambiarra: {
          xml: xml(E.botao('A', seq(I.definir('modo', 1))), E.botao('B', seq(I.definir('modo', 1))),
            E.sempre(seq(I.se(cmp(xVar('modo'), '=', 1), [I.barra(ruido(), 40, 85)], [I.barra(luzKit(), 0, 100, F.s('oled_luz'), '%')])))),
          pedido: T('Button B never shows the light! The bar always stays on noise.', 'Дугме B никад не покаже светлост! Трака увек остаје на буци.', '¡El botón B nunca muestra la luz! La barra siempre se queda en el ruido.', 'O botão B nunca mostra a luz! A barra fica sempre no ruído.'),
        },
      },
    },

    // ------------------------------------------------------------ 6 · Projeto: relatório da sala
    {
      titulo: T('Project · Room report', 'Пројекат · Извештај о соби', 'Proyecto · Informe de la sala', 'Projeto · Relatório da sala'),
      missao: T('With A+B, the micro:bit writes down the noise and the light of the room in its data table.', 'Са A+B micro:bit записује буку и светлост собе у своју табелу података.', 'Con A+B, el micro:bit anota el ruido y la luz de la sala en su tabla de datos.', 'Com A+B, o micro:bit aponta o ruído e a luz da sala na tabela de dados.'),
      passos: [
        T('“on button A+B pressed”: “log data” for the noise and another for the light.', '„при притиску на дугме A+B“: „забележи податке“ за буку и још један за светлост.', '«al presionar el botón A+B»: «registrar datos» para el ruido y otro para la luz.', '«no botão A+B premido»: «registar dados» do ruído e outro da luz.'),
        T('Use two different column names, then show an icon to say “saved”.', 'Користи два различита назива колона, па прикажи иконицу „сачувано“.', 'Usa dos nombres de columna distintos y muestra un ícono de «guardado».', 'Usa dois nomes de coluna diferentes e mostra um ícone de «guardado».'),
        T('Test it: set noise and light, press A+B. The table appears under the micro:bit.', 'Испробај: подеси буку и светлост, притисни A+B. Табела се појави испод micro:bit-а.', 'Pruébalo: ajusta ruido y luz y pulsa A+B. La tabla aparece debajo del micro:bit.', 'Experimenta: acerta ruído e luz e carrega em A+B. A tabela aparece por baixo do micro:bit.'),
      ],
      material: MAT_KIT,
      novos: ['mk_botao_AB', 'ic_registar_ruido', 'ic_registar_luz', 'ic_icone_sim'],
      caixa: ['mk_botao_AB', 'ic_registar_ruido', 'ic_registar_luz', 'mk_kit_ruido', 'mk_kit_luz', 'ic_icone_sim', 'ic_media'],
      teste: 'botao:AB',
      ok: relatorio,
      perspetiva: 'nina',
      pensar: T('Your table has numbers. Record sheet B also has guesses and surprises. Which part would you show the museum staff first?',
        'Твоја табела има бројеве. Лист B има и претпоставке и изненађења. Шта би прво показао особљу музеја?',
        'Tu tabla tiene números. La ficha B también tiene suposiciones y sorpresas. ¿Qué enseñarías primero al personal del museo?',
        'A tua tabela tem números. A ficha B também tem palpites e surpresas. O que é que mostravas primeiro à equipa do museu?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Detectives keep records. Let’s make the micro:bit write the evidence for us.', 'Детективи воде белешке. Хајде да micro:bit запише доказе за нас.', 'Los detectives toman notas. Hagamos que el micro:bit apunte las pruebas por nosotros.', 'Os detetives tomam notas. Vamos pôr o micro:bit a apontar as provas por nós.')],
        parecePronto: a => evs(a, 'botao:AB').some(e => blocos(e, 'mk_registar').filter(p => usa(p, 'mk_kit_ruido') || usa(p, 'mk_kit_luz')).length >= 2),
        testar: T('Set the kit sliders and press A+B. Look at the table.', 'Подеси клизаче и притисни A+B. Погледај табелу.', 'Ajusta los controles del kit y pulsa A+B. Mira la tabla.', 'Acerta os controlos do kit e carrega em A+B. Olha para a tabela.'),
        regras: [
          P.evento('botao:AB', T('The report is saved with both buttons together. Which pink block is that?', 'Извештај се чува са оба дугмета заједно. Који је то розе блок?', 'El informe se guarda con los dos botones a la vez. ¿Qué bloque rosa es?', 'O relatório guarda-se com os dois botões juntos. Que bloco cor-de-rosa é esse?')),
          P.bloco('botao:AB', 'mk_registar', T('How does the micro:bit write something down?', 'Како micro:bit нешто записује?', '¿Cómo apunta algo el micro:bit?', 'Como é que o micro:bit aponta alguma coisa?')),
          P.regra('uma_coluna', a => evs(a, 'botao:AB').some(e => blocos(e, 'mk_registar').length === 1), [
            ['a_pensar', T('Your report has one column. What is missing: noise or light?', 'Твој извештај има једну колону. Шта недостаје: бука или светлост?', 'Tu informe tiene una columna. ¿Qué falta: el ruido o la luz?', 'O teu relatório tem uma coluna. O que falta: o ruído ou a luz?')],
            T('Each sense needs its own “log data” block.', 'Свако чуло треба свој блок „забележи податке“.', 'Cada sentido necesita su propio bloque «registrar datos».', 'Cada sentido precisa do seu bloco «registar dados».'),
            T('Add a second “log data” with a different column name.', 'Додај други „забележи податке“ са другим називом колоне.', 'Añade un segundo «registrar datos» con otro nombre de columna.', 'Junta um segundo «registar dados» com outro nome de coluna.'),
          ], T('Two columns: noise and light!', 'Две колоне: бука и светлост!', '¡Dos columnas: ruido y luz!', 'Duas colunas: ruído e luz!')),
        ],
        sucesso: T('Evidence saved! On a real micro:bit, open MY_DATA.HTM on the MICROBIT drive to see the table.', 'Докази сачувани! На правом micro:bit-у отвори MY_DATA.HTM на диску MICROBIT да видиш табелу.', '¡Pruebas guardadas! En un micro:bit de verdad, abre MY_DATA.HTM en la unidad MICROBIT para ver la tabla.', 'Provas guardadas! Num micro:bit verdadeiro, abre o MY_DATA.HTM na pasta MICROBIT para veres a tabela.'),
        extensao: T('Save the 5-second average of the noise instead of a single reading.', 'Сачувај просек буке од 5 секунди уместо једног мерења.', 'Guarda la media de 5 segundos del ruido en lugar de una sola lectura.', 'Guarda a média de 5 segundos do ruído em vez de uma leitura só.'),
        gambiarra: {
          xml: xml(ev2()),
          pedido: T('My report has two columns… but both have the same number. Something is measuring twice!', 'Мој извештај има две колоне… али обе имају исти број. Нешто мери два пута!', 'Mi informe tiene dos columnas… pero las dos tienen el mismo número. ¡Algo mide dos veces!', 'O meu relatório tem duas colunas… mas as duas têm o mesmo número. Há qualquer coisa a medir duas vezes!'),
        },
      },
    },
  ];
  function ev2() { return X.E.botao('AB', seq(I.registar(F.s('col_ruido'), ruido()), I.registar(F.s('col_luz'), ruido()), I.icone('Yes'))); }

  F.registarMissao({
    id: 'detetives',
    titulo: T('Room detectives', 'Детективи соба', 'Detectives de salas', 'Detetives de salas'),
    tema: T('Light and sound', 'Светлост и звук', 'Luz y sonido', 'Luz e som'),
    descricao: T('Predict which room is loudest and brightest, then test it. One reading can lie — averages tell more.', 'Предвиди која соба је најгласнија и најсветлија, па провери. Једно мерење може да превари — просеци говоре више.', 'Adivina qué sala es la más ruidosa y luminosa, y compruébalo. Una lectura puede engañar; las medias dicen más.', 'Adivinha que sala é a mais barulhenta e a mais clara, e confirma. Uma leitura pode enganar — as médias dizem mais.'),
    cor: '#E8624A',
    perspetiva: 'luka',
    xml: XML,
    livres: [{
      titulo: T('Free project · My detective tool', 'Слободни пројекат · Мој детективски алат', 'Proyecto libre · Mi herramienta de detective', 'Projeto livre · A minha ferramenta de detetive'),
      missao: T('Invent a tool to compare two rooms: light, sound, averages, a report…', 'Измисли алат за поређење две собе: светлост, звук, просеци, извештај…', 'Inventa una herramienta para comparar dos salas: luz, sonido, medias, un informe…', 'Inventa uma ferramenta para comparar duas salas: luz, som, médias, um relatório…'),
    }],
    niveis: [{ nome: T('Level 1 · Investigate', 'Ниво 1 · Истражи', 'Nivel 1 · Investigar', 'Nível 1 · Investigar'), desafios: D }],
  });
})();
