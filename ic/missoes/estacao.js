/* Missão 4 · Estação de medição (Sensing station) — o protocolo de campo.
 *
 * Liga ao Field Protocol (estações fixas: ruído, luz, movimento com PIR, registo a intervalos).
 * Perspetiva: Mira (cega — ouve as salas: o eco diz o tamanho) e Nina (a sala pode ser calma para o sensor e difícil
 * para uma pessoa). Ideia que fica: uma estação mede sem cansar, mas só as pessoas explicam o que os números querem dizer.
 * Kit: PIR no P13, ruído no P1, luz no P2, OLED (Sensory OLED). Validação pelo registo.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const P = F.pistas;
  const { T, V, X } = F.IC;
  const { blocos, dentro, tem } = F.ajudasTutor;
  const { I, seq, xml, E, B, ruido, luzKit, pir, soPir, cmp, N, S } = X;
  const evs = P.evs;
  const usa = (p, tipo) => (p.usa || []).some(u => u.tipo === tipo);
  const plano = l => (l || []).flatMap(x => [x, ...plano(x.corpo), ...plano(x.sim), ...plano(x.nao)]);

  // o medidor de atividade enche depois de o PIR ver movimento
  function enche(reg) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== 'kit_pir:1') continue;
      for (let j = i + 1; j < reg.length && reg[j].t - reg[i].t < 4000; j++) {
        const m = /^soled:atividade:(\d+)$/.exec(reg[j].v);
        if (reg[j].dir === 'out' && m && Number(m[1]) > 0) return true;
      }
    }
    return false;
  }
  // A mostra (número grande) quantos movimentos começaram (≥ 2)
  function movimentos(reg) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== 'botao:A') continue;
      const n = reg.slice(0, i).filter(e => e.dir === 'in' && e.v === 'kit_pir:1').length;
      if (n >= 2 && V.saidasApos(reg, i).some(x => V.grande(x) === n)) return true;
    }
    return false;
  }
  // regista a intervalos de cerca de 1 s (≥ 3 registos do mesmo nome) e os valores seguem o ruído
  function cadaSegundo(reg) {
    const g = V.registos(reg);
    const nomes = [...new Set(g.map(x => x.nome))];
    for (const n of nomes) {
      const ts = g.filter(x => x.nome === n);
      if (ts.length < 3) continue;
      let bons = 0;
      for (let k = 1; k < ts.length; k++) { const d = ts[k].t - ts[k - 1].t; if (d >= 700 && d <= 1600) bons++; }
      const valores = reg.filter(e => e.dir === 'in' && e.v.startsWith('kit_ruido:')).map(e => F.verif.valorDe(e.v));
      if (bons >= 2 && ts.some(x => valores.includes(x.v))) return true;
    }
    return false;
  }
  // numa volta, três colunas: o ruído e a luz (pelo valor), mais uma terceira
  function tresSentidos(reg) {
    const g = V.registos(reg);
    const r = reg.filter(e => e.dir === 'in' && e.v.startsWith('kit_ruido:')).map(e => F.verif.valorDe(e.v));
    const l = reg.filter(e => e.dir === 'in' && e.v.startsWith('kit_luz:')).map(e => F.verif.valorDe(e.v));
    const nomes = [...new Set(g.map(x => x.nome))];
    if (nomes.length < 3) return false;
    const nR = nomes.find(n => g.some(x => x.nome === n && r.includes(x.v)));
    const nL = nomes.find(n => n !== nR && g.some(x => x.nome === n && l.includes(x.v)));
    return !!nR && !!nL;
  }
  // «agora há muita gente?»: o texto muda depois de ≥ 4 movimentos e fica assim mesmo com o PIR parado
  function cheio(reg) {
    const textos = reg.filter(e => e.dir === 'out' && V.textoOled(e.v));
    if (!textos.length) return false;
    const t0 = textos[0].v;
    const ins = reg.filter(e => e.dir === 'in' && e.v.startsWith('kit_pir:'));
    if (reg.filter(e => e.dir === 'in' && e.v === 'kit_pir:1').length < 4) return false;
    const ultimoZero = ins.filter(e => e.v === 'kit_pir:0').pop();
    if (!ultimoZero) return false;
    // o último texto mostrado depois de o PIR parar
    const depois = textos.filter(e => e.t >= ultimoZero.t);
    const fim = depois.length ? depois[depois.length - 1].v : textos.filter(e => e.t < ultimoZero.t).pop().v;
    return fim !== t0;
  }

  const XML = {
    ic_se_pir: `<block type="mk_se"><value name="C"><block type="mk_kit_pir"><field name="P">P13</field></block></value></block>`,
    ic_icone_sim: '<block type="mk_icone"><field name="I">Yes</field></block>',
    ic_atividade: `<block type="so_atividade"><value name="MOV"><shadow type="so_pir"><field name="P">P13</field></shadow></value>${N('S', 10)}${S('ROT', F.s('oled_atividade'))}</block>`,
    ic_grande_mov: `<block type="so_grande"><value name="V"><block type="so_movimentos"></block></value>${S('ROT', F.s('oled_movimentos'))}${S('UN', '/min')}</block>`,
    ic_registar_ruido: `<block type="mk_registar">${S('NOME', F.s('col_ruido'))}<value name="V"><block type="mk_kit_ruido"><field name="P">P1</field></block></value></block>`,
    ic_registar_luz: `<block type="mk_registar">${S('NOME', F.s('col_luz'))}<value name="V"><block type="mk_kit_luz"><field name="P">P2</field></block></value></block>`,
    ic_registar_mov: `<block type="mk_registar">${S('NOME', F.s('col_movimento'))}<value name="V"><block type="so_movimentos"></block></value></block>`,
    ic_pausa1000: '<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">1000</field></shadow></value></block>',
    ic_se_mov: `<block type="mk_se"><value name="C"><block type="mk_comparar"><field name="OP">&gt;</field><value name="A"><block type="so_movimentos"></block></value>${N('B', 3)}</block></value></block>`,
    ic_so_texto: `<block type="so_texto">${S('T', F.s('palavra_cheio'))}${N('L', 3)}</block>`,
  };
  const MAT_PIR = T('micro:bit V2 + IoT:bit + PIR sensor (P13) + OLED', 'micro:bit V2 + IoT:bit + PIR сензор (P13) + OLED', 'micro:bit V2 + IoT:bit + sensor PIR (P13) + OLED', 'micro:bit V2 + IoT:bit + sensor PIR (P13) + OLED');
  const MAT_EST = T('micro:bit V2 + IoT:bit + noise (P1), light (P2), PIR (P13)', 'micro:bit V2 + IoT:bit + бука (P1), светлост (P2), PIR (P13)', 'micro:bit V2 + IoT:bit + ruido (P1), luz (P2), PIR (P13)', 'micro:bit V2 + IoT:bit + ruído (P1), luz (P2), PIR (P13)');

  const D = [
    // ------------------------------------------------------------ 1 · Passou alguém
    {
      titulo: T('Someone passed by', 'Неко је прошао', 'Alguien ha pasado', 'Passou alguém'),
      missao: T('The PIR sensor sees movement. Show an icon while someone moves, and clear the screen when nobody does.', 'PIR сензор види покрет. Прикажи иконицу док се неко креће, а обриши екран кад се нико не креће.', 'El sensor PIR ve el movimiento. Muestra un ícono mientras alguien se mueve y borra la pantalla cuando nadie lo hace.', 'O sensor PIR vê movimento. Mostra um ícone enquanto alguém se mexe e limpa o ecrã quando ninguém se mexe.'),
      passos: [
        T('“forever” + “if PIR sensor P13 detects motion then … else …”.', '„заувек“ + „ако PIR сензор P13 открива покрет онда … иначе …“.', '«para siempre» + «si sensor PIR P13 detecta movimiento entonces … si no …».', '«para sempre» + «se sensor PIR P13 deteta movimento então … senão …».'),
        T('“then”: show icon. “else”: clear screen.', '„онда“: прикажи иконицу. „иначе“: обриши екран.', '«entonces»: mostrar ícono. «si no»: borrar la pantalla.', '«então»: mostrar ícone. «senão»: limpar ecrã.'),
        T('Test it: “Walk past the PIR”.', 'Испробај: „Прођи поред PIR-а“.', 'Pruébalo: «Pasar delante del PIR».', 'Experimenta: «Passar à frente do PIR».'),
      ],
      material: MAT_PIR,
      novos: ['mk_sempre', 'ic_se_pir', 'mk_kit_pir', 'ic_icone_sim', 'mk_limpar'],
      teste: 'kit_pir',
      ok: r => V.doisLados(r, 'kit_pir', 0.5, x => x.startsWith('icone:') || x === 'limpar'),
      pensar: T('The PIR counts bodies moving, not people’s comfort. Mira says that when everyone talks at once she “loses her map”. Does the PIR see that?',
        'PIR броји тела у покрету, не удобност људи. Мира каже да кад сви причају одједном „изгуби своју мапу“. Да ли PIR то види?',
        'El PIR cuenta cuerpos en movimiento, no el bienestar de las personas. Mira dice que cuando todos hablan a la vez «pierde su mapa». ¿Lo ve el PIR?',
        'O PIR conta corpos a mexer, não o conforto das pessoas. A Mira diz que quando todos falam ao mesmo tempo «perde o mapa». O PIR vê isso?'),
      tutor: {
        boasVindas: ['boas_vindas', T('{ola} A sensing station stays in one place and watches. First sense: movement.', '{ola} Мерна станица стоји на једном месту и посматра. Прво чуло: покрет.', '{ola} Una estación de medición se queda en un sitio y observa. Primer sentido: el movimiento.', '{ola} Uma estação de medição fica num sítio e observa. Primeiro sentido: o movimento.')],
        parecePronto: a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && usa(x, 'mk_kit_pir') && plano(x.sim).some(y => y.tipo === 'mk_icone') && plano(x.nao).some(y => y.tipo === 'mk_limpar'))),
        testar: T('Press “Walk past the PIR” and wait 3 seconds. Icon on, then off?', 'Притисни „Прођи поред PIR-а“ и сачекај 3 секунде. Иконица се упали, па угаси?', 'Pulsa «Pasar delante del PIR» y espera 3 segundos. ¿Aparece el ícono y luego se va?', 'Carrega em «Passar à frente do PIR» e espera 3 segundos. O ícone aparece e depois apaga?'),
        regras: [
          P.evento('sempre', T('The station watches all the time. Which block?', 'Станица стално посматра. Који блок?', 'La estación observa todo el tiempo. ¿Qué bloque?', 'A estação observa o tempo todo. Que bloco?')),
          P.bloco('sempre', 'mk_se', T('Two situations: someone moves, nobody moves. Which block chooses?', 'Две ситуације: неко се креће, нико се не креће. Који блок бира?', 'Dos situaciones: alguien se mueve, nadie se mueve. ¿Qué bloque elige?', 'Duas situações: alguém mexe, ninguém mexe. Que bloco escolhe?')),
          P.regra('sem_pir', a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && !usa(x, 'mk_kit_pir') && !usa(x, 'so_pir'))), [
            ['a_pensar', T('Your “if” asks a question… but not to the PIR.', 'Твоје „ако“ поставља питање… али не PIR-у.', 'Tu «si» hace una pregunta… pero no al PIR.', 'O teu «se» faz uma pergunta… mas não ao PIR.')],
            T('In the orange Octopus drawer: “PIR sensor P13 detects motion”.', 'У наранџастој фиоци Octopus: „PIR сензор P13 открива покрет“.', 'En el cajón naranja Octopus: «sensor PIR P13 detecta movimiento».', 'Na gaveta laranja Octopus: «sensor PIR P13 deteta movimento».'),
            T('Put it in the hole of the “if”.', 'Стави га у рупу од „ако“.', 'Ponlo en el hueco del «si».', 'Põe-no no buraco do «se».'),
          ], T('Now the station asks the PIR!', 'Сад станица пита PIR!', '¡Ahora la estación pregunta al PIR!', 'Agora a estação pergunta ao PIR!')),
          P.regra('nao_limpa', a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && !plano(x.nao).some(y => y.tipo === 'mk_limpar' || y.tipo === 'mk_icone'))), [
            ['a_pensar', T('Once the icon appears, it never goes away. What should happen when nobody is there?', 'Кад се иконица појави, никад не нестане. Шта треба да се деси кад нико није ту?', 'Cuando aparece el ícono, ya no se va. ¿Qué debe pasar cuando no hay nadie?', 'Depois de o ícone aparecer, nunca mais sai. O que deve acontecer quando não está ninguém?')],
            T('The “else” path is for “nobody moving”.', 'Пут „иначе“ је за „нико се не креће“.', 'El camino «si no» es para «nadie se mueve».', 'O caminho «senão» é para «ninguém mexe».'),
            T('Put “clear screen” in the “else”.', 'Стави „обриши екран“ у „иначе“.', 'Pon «borrar la pantalla» en el «si no».', 'Põe «limpar ecrã» no «senão».'),
          ], T('Now the screen clears itself.', 'Сад се екран сам брише.', 'Ahora la pantalla se borra sola.', 'Agora o ecrã limpa-se sozinho.')),
        ],
        sucesso: T('Your station sees movement. The PIR holds its signal for a few seconds — that is normal.', 'Твоја станица види покрет. PIR држи сигнал неколико секунди — то је нормално.', 'Tu estación ve el movimiento. El PIR mantiene la señal unos segundos: es normal.', 'A tua estação vê movimento. O PIR segura o sinal uns segundos — é normal.'),
        extensao: T('Tell museum staff where the station will be. Sensors never touch artworks.', 'Реци особљу музеја где ће бити станица. Сензори никад не додирују уметничка дела.', 'Dile al personal del museo dónde estará la estación. Los sensores nunca tocan las obras.', 'Diz à equipa do museu onde fica a estação. Os sensores nunca tocam nas obras.'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.se(B('mk_escuro'), [I.icone('Yes')], [I.limpar()])))),
          pedido: T('My station only reacts when I turn off the lights. It isn’t watching people at all!', 'Моја станица реагује само кад угасим светла. Уопште не посматра људе!', 'Mi estación solo reacciona cuando apago la luz. ¡No está mirando a la gente!', 'A minha estação só reage quando apago a luz. Não está a ver as pessoas!'),
        },
      },
    },

    // ------------------------------------------------------------ 2 · Medidor de atividade
    {
      titulo: T('Activity meter', 'Мерач активности', 'Medidor de actividad', 'Medidor de atividade'),
      missao: T('Each movement fills the meter on the OLED; when nobody moves, it empties in 10 seconds.', 'Сваки покрет пуни мерач на OLED-у; кад се нико не креће, празни се за 10 секунди.', 'Cada movimiento llena el medidor en la OLED; si nadie se mueve, se vacía en 10 segundos.', 'Cada movimento enche o medidor no OLED; quando ninguém mexe, esvazia em 10 segundos.'),
      passos: [
        T('“forever” + “activity meter” (purple drawer).', '„заувек“ + „мерач активности“ (љубичаста фиока).', '«para siempre» + «medidor de actividad» (cajón morado).', '«para sempre» + «medidor de atividade» (gaveta roxa).'),
        T('The PIR goes in its first hole; empty in 10 s.', 'PIR иде у прву рупу; празни се за 10 s.', 'El PIR va en su primer hueco; se vacía en 10 s.', 'O PIR vai no primeiro buraco; esvazia em 10 s.'),
        T('Test it: walk past the PIR two or three times.', 'Испробај: прођи поред PIR-а два-три пута.', 'Pruébalo: pasa delante del PIR dos o tres veces.', 'Experimenta: passa à frente do PIR duas ou três vezes.'),
      ],
      material: MAT_PIR,
      novos: ['ic_atividade'],
      teste: 'kit_pir',
      ok: enche,
      pensar: T('A full meter means a busy room. Busy can be fun for some people and exhausting for others. When would you visit with Ana?',
        'Пун мерач значи пуну собу. Гужва некоме може бити забавна, а другима исцрпљујућа. Када би посетио музеј са Аном?',
        'Un medidor lleno significa una sala concurrida. Para algunos es divertido y para otros agotador. ¿Cuándo irías de visita con Ana?',
        'Um medidor cheio quer dizer uma sala cheia. Para uns é divertido, para outros cansativo. Quando é que visitavas com a Ana?'),
      tutor: {
        boasVindas: ['boas_vindas', T('A single icon says yes or no. A meter shows “how much” over time.', 'Једна иконица каже да или не. Мерач показује „колико“ током времена.', 'Un ícono dice sí o no. Un medidor muestra «cuánto» a lo largo del tiempo.', 'Um ícone diz sim ou não. Um medidor mostra «quanto», ao longo do tempo.')],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'so_atividade').some(p => usa(p, 'so_pir') || usa(p, 'mk_kit_pir'))),
        testar: T('Walk past the PIR a few times and watch the bars fill.', 'Прођи поред PIR-а неколико пута и гледај како се траке пуне.', 'Pasa delante del PIR unas cuantas veces y mira cómo se llenan las barras.', 'Passa à frente do PIR algumas vezes e vê as barras a encher.'),
        regras: [
          P.evento('sempre', T('The meter needs to update all the time. Which block?', 'Мерач треба стално да се освежава. Који блок?', 'El medidor necesita actualizarse siempre. ¿Qué bloque?', 'O medidor tem de se atualizar sempre. Que bloco?')),
          P.bloco('sempre', 'so_atividade', T('Which purple block fills up with movement?', 'Који љубичасти блок се пуни покретом?', '¿Qué bloque morado se llena con el movimiento?', 'Que bloco roxo enche com o movimento?')),
          P.regra('sem_pir', a => evs(a, 'sempre').some(e => blocos(e, 'so_atividade').some(p => !usa(p, 'so_pir') && !usa(p, 'mk_kit_pir'))), [
            ['a_pensar', T('The meter is there, but who tells it about the movement?', 'Мерач је ту, али ко му јавља о покрету?', 'El medidor está, pero ¿quién le cuenta el movimiento?', 'O medidor está lá, mas quem é que lhe fala do movimento?')],
            T('Its first hole needs a PIR block.', 'Његова прва рупа треба PIR блок.', 'Su primer hueco necesita un bloque PIR.', 'O primeiro buraco precisa de um bloco PIR.'),
            T('Drag “PIR at P13 detects motion” into the meter.', 'Превуци „PIR на P13 открива покрет“ у мерач.', 'Arrastra «PIR en P13 detecta movimiento» al medidor.', 'Arrasta «PIR no P13 deteta movimento» para o medidor.'),
          ], T('Now it feels the movement!', 'Сад осећа покрет!', '¡Ahora siente el movimiento!', 'Agora sente o movimento!')),
        ],
        sucesso: T('The meter fills and empties: a picture of how busy the room is right now.', 'Мерач се пуни и празни: слика тога колико је соба сада пуна.', 'El medidor se llena y se vacía: una imagen de lo concurrida que está la sala ahora.', 'O medidor enche e esvazia: uma imagem de quanta gente há na sala agora.'),
        extensao: T('Change 10 s to 30 s. How does the meter behave in a slow museum?', 'Промени 10 s на 30 s. Како се мерач понаша у мирном музеју?', 'Cambia 10 s por 30 s. ¿Cómo se comporta el medidor en un museo tranquilo?', 'Muda 10 s para 30 s. Como se porta o medidor num museu sossegado?'),
        gambiarra: {
          xml: xml(E.botao('A', seq(I.atividade(soPir())))),
          pedido: T('My meter only moves when I press A… but the station has nobody to press buttons!', 'Мој мерач се помера само кад притиснем A… али на станици нема никог да притиска дугмад!', 'Mi medidor solo se mueve cuando pulso A… ¡pero en la estación nadie pulsa botones!', 'O meu medidor só mexe quando carrego no A… mas na estação não há ninguém para carregar em botões!'),
        },
      },
    },

    // ------------------------------------------------------------ 3 · Movimentos por minuto
    {
      titulo: T('Movements per minute', 'Покрети у минути', 'Movimientos por minuto', 'Movimentos por minuto'),
      missao: T('Button A shows, in big numbers, how many movements started in the last minute.', 'Дугме A великим бројевима показује колико покрета је почело у последњем минуту.', 'El botón A muestra, en números grandes, cuántos movimientos empezaron en el último minuto.', 'O botão A mostra, em números grandes, quantos movimentos começaram no último minuto.'),
      passos: [
        T('A: “big number” with “movements per minute”.', 'A: „велики број“ са „покрета у минути“.', 'A: «número grande» con «movimientos por minuto».', 'A: «número grande» com «movimentos por minuto».'),
        T('Label: MOVES, unit /min (letters without accents).', 'Ознака: MOVES, јединица /min (латиница без квачица).', 'Etiqueta: MOVES, unidad /min (sin tildes).', 'Rótulo: MOVES, unidade /min (sem acentos).'),
        T('Test it: walk past the PIR twice, then press A.', 'Испробај: прођи поред PIR-а два пута, па притисни A.', 'Pruébalo: pasa delante del PIR dos veces y pulsa A.', 'Experimenta: passa à frente do PIR duas vezes e carrega no A.'),
      ],
      material: MAT_PIR,
      novos: ['mk_botao', 'ic_grande_mov'],
      teste: 'botao:A',
      espera: 1200,
      ok: movimentos,
      pensar: T('Ten movements per minute: is that busy? It depends on the room and on the person. Who should decide the “busy” number?',
        'Десет покрета у минути: да ли је то гужва? Зависи од собе и од особе. Ко треба да одлучи који број значи „гужва“?',
        'Diez movimientos por minuto: ¿es mucho? Depende de la sala y de la persona. ¿Quién debería decidir qué número es «mucha gente»?',
        'Dez movimentos por minuto: é muito? Depende da sala e da pessoa. Quem deve decidir o número do «cheio»?'),
      tutor: {
        boasVindas: ['boas_vindas', T('A meter is a picture; a number is something you can write on the record sheet.', 'Мерач је слика; број је нешто што можеш да упишеш у лист.', 'Un medidor es una imagen; un número es algo que puedes escribir en la ficha.', 'Um medidor é uma imagem; um número é uma coisa que podes escrever na ficha.')],
        parecePronto: a => evs(a, 'botao:A').some(e => dentro(e, 'so_grande', 'so_movimentos')),
        testar: T('Walk past the PIR twice (wait for it to stop each time), then press A.', 'Прођи поред PIR-а два пута (сачекај да стане сваки пут), па притисни A.', 'Pasa delante del PIR dos veces (espera a que pare cada vez) y pulsa A.', 'Passa à frente do PIR duas vezes (espera que pare de cada vez) e carrega no A.'),
        regras: [
          P.evento('botao:A', T('Which button shows the number?', 'Које дугме показује број?', '¿Qué botón muestra el número?', 'Que botão mostra o número?')),
          P.bloco('botao:A', 'so_grande', T('How do we show a number big on the OLED?', 'Како приказујемо број крупно на OLED-у?', '¿Cómo mostramos un número grande en la OLED?', 'Como é que mostramos um número grande no OLED?')),
          P.valorEm('botao:A', 'so_grande', 'so_movimentos', T('The big number doesn’t count anything. Which block counts movements?', 'Велики број ништа не броји. Који блок броји покрете?', 'El número grande no cuenta nada. ¿Qué bloque cuenta los movimientos?', 'O número grande não conta nada. Que bloco conta os movimentos?')),
        ],
        sucesso: T('Now the station counts. Write the number on the record sheet with the time.', 'Сад станица броји. Упиши број у лист са временом.', 'Ahora la estación cuenta. Escribe el número en la ficha con la hora.', 'Agora a estação conta. Escreve o número na ficha com a hora.'),
        extensao: T('Press A at three different times of the day. When is the room calmest?', 'Притисни A у три различита доба дана. Када је соба најмирнија?', 'Pulsa A en tres momentos del día. ¿Cuándo está más tranquila la sala?', 'Carrega no A em três alturas do dia. Quando é que a sala está mais calma?'),
        gambiarra: {
          xml: xml(E.botao('A', seq(I.grande(B('so_nivel'), F.s('oled_movimentos'), '/min')))),
          pedido: T('My counter shows strange numbers: 25, 50, 80… nobody moves that much! What am I showing?', 'Мој бројач показује чудне бројеве: 25, 50, 80… нико се толико не креће! Шта приказујем?', 'Mi contador muestra números raros: 25, 50, 80… ¡nadie se mueve tanto! ¿Qué estoy mostrando?', 'O meu contador mostra números estranhos: 25, 50, 80… ninguém se mexe tanto! O que é que estou a mostrar?'),
        },
      },
    },

    // ------------------------------------------------------------ 4 · Registar de segundo a segundo
    {
      titulo: T('Record every second', 'Бележи сваке секунде', 'Registra cada segundo', 'Registar de segundo a segundo'),
      missao: T('The station writes the noise in the data table every second, on its own.', 'Станица сама уписује буку у табелу сваке секунде.', 'La estación anota el ruido en la tabla cada segundo, sola.', 'A estação escreve o ruído na tabela de dados a cada segundo, sozinha.'),
      passos: [
        T('“forever”: “log data” with the noise.', '„заувек“: „забележи податке“ са буком.', '«para siempre»: «registrar datos» con el ruido.', '«para sempre»: «registar dados» com o ruído.'),
        T('Then “pause (ms) 1000”.', 'Па „пауза (ms) 1000“.', 'Luego «pausa (ms) 1000».', 'Depois «pausa (ms) 1000».'),
        T('Test it: move the noise and watch the table grow.', 'Испробај: помери буку и гледај како табела расте.', 'Pruébalo: mueve el ruido y mira cómo crece la tabla.', 'Experimenta: mexe no ruído e vê a tabela a crescer.'),
      ],
      material: T('micro:bit V2 + IoT:bit + noise sensor (P1)', 'micro:bit V2 + IoT:bit + сензор буке (P1)', 'micro:bit V2 + IoT:bit + sensor de ruido (P1)', 'micro:bit V2 + IoT:bit + sensor de ruído (P1)'),
      novos: ['ic_registar_ruido', 'ic_pausa1000'],
      caixa: ['mk_sempre', 'ic_registar_ruido', 'ic_pausa1000', 'mk_kit_ruido'],
      teste: 'kit_ruido',
      espera: 3600,
      ok: cadaSegundo,
      perspetiva: 'nina',
      pensar: T('In a real museum we record every 5 seconds for hours. Why might the station see things that a 10-minute visit misses?',
        'У правом музеју бележимо сваких 5 секунди сатима. Зашто станица може да види оно што посета од 10 минута пропусти?',
        'En un museo real registramos cada 5 segundos durante horas. ¿Por qué la estación puede ver cosas que una visita de 10 minutos no ve?',
        'Num museu a sério registamos a cada 5 segundos durante horas. Porque é que a estação pode ver coisas que uma visita de 10 minutos não vê?'),
      tutor: {
        boasVindas: ['boas_vindas', T('A station is patient: it measures the same thing again and again, at the same rhythm.', 'Станица је стрпљива: мери исто изнова и изнова, у истом ритму.', 'Una estación es paciente: mide lo mismo una y otra vez, al mismo ritmo.', 'Uma estação é paciente: mede a mesma coisa vezes sem conta, ao mesmo ritmo.')],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'mk_registar').some(p => usa(p, 'mk_kit_ruido')) && blocos(e, 'mk_pausa').some(p => p.ms >= 700)),
        testar: T('Wait a few seconds and move the noise. Does a new row appear every second?', 'Сачекај неколико секунди и помери буку. Да ли се нови ред појављује сваке секунде?', 'Espera unos segundos y mueve el ruido. ¿Aparece una fila nueva cada segundo?', 'Espera uns segundos e mexe no ruído. Aparece uma linha nova a cada segundo?'),
        regras: [
          P.evento('sempre', T('The station records by itself. Which block keeps going?', 'Станица бележи сама. Који блок стално ради?', 'La estación registra sola. ¿Qué bloque sigue y sigue?', 'A estação regista sozinha. Que bloco nunca pára?')),
          P.bloco('sempre', 'mk_registar', T('How does the station write down a value?', 'Како станица записује вредност?', '¿Cómo apunta la estación un valor?', 'Como é que a estação aponta um valor?')),
          P.regra('sem_pausa', a => evs(a, 'sempre').some(e => blocos(e, 'mk_registar').length && !blocos(e, 'mk_pausa').some(p => p.ms >= 700)), [
            ['surpreendida', T('Whoa, the table is filling super fast! How often do you want to record?', 'Опа, табела се пуни супер брзо! Колико често желиш да бележиш?', '¡Uy, la tabla se llena rapidísimo! ¿Cada cuánto quieres registrar?', 'Uau, a tabela está a encher depressíssimo! De quanto em quanto tempo queres registar?')],
            T('Add a wait after recording: 1000 ms = 1 second.', 'Додај чекање после бележења: 1000 ms = 1 секунда.', 'Añade una espera después de registrar: 1000 ms = 1 segundo.', 'Junta uma espera depois de registar: 1000 ms = 1 segundo.'),
            T('Put “pause (ms) 1000” under “log data”.', 'Стави „пауза (ms) 1000“ испод „забележи податке“.', 'Pon «pausa (ms) 1000» debajo de «registrar datos».', 'Põe «pausa (ms) 1000» por baixo do «registar dados».'),
          ], T('One row per second. Steady rhythm!', 'Један ред у секунди. Миран ритам!', 'Una fila por segundo. ¡Ritmo constante!', 'Uma linha por segundo. Ritmo certinho!')),
        ],
        sucesso: T('A real data logger! In the museum, change 1000 to 5000 and let it run.', 'Прави записивач података! У музеју промени 1000 у 5000 и пусти да ради.', '¡Un registrador de datos de verdad! En el museo, cambia 1000 por 5000 y déjalo funcionar.', 'Um registador de dados a sério! No museu, muda 1000 para 5000 e deixa-o a trabalhar.'),
        extensao: T('Use the 5-second average instead of a single reading.', 'Користи просек од 5 секунди уместо једног мерења.', 'Usa la media de 5 segundos en lugar de una lectura.', 'Usa a média de 5 segundos em vez de uma leitura só.'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.registar(F.s('col_ruido'), ruido())))),
          pedido: T('After one minute my micro:bit memory was full! Thousands of rows… what did I forget?', 'После минут меморија мог micro:bit-а је била пуна! Хиљаде редова… шта сам заборавио?', '¡Al minuto la memoria de mi micro:bit estaba llena! Miles de filas… ¿qué olvidé?', 'Ao fim de um minuto a memória do meu micro:bit estava cheia! Milhares de linhas… do que é que me esqueci?'),
        },
      },
    },

    // ------------------------------------------------------------ 5 · Estação de três sentidos
    {
      titulo: T('Three-sense station', 'Станица са три чула', 'Estación de tres sentidos', 'Estação de três sentidos'),
      missao: T('Every second, record noise, light and movements per minute, in three columns.', 'Сваке секунде бележи буку, светлост и покрете у минути, у три колоне.', 'Cada segundo, registra ruido, luz y movimientos por minuto, en tres columnas.', 'A cada segundo, regista ruído, luz e movimentos por minuto, em três colunas.'),
      passos: [
        T('“forever”: three “log data” blocks with different column names.', '„заувек“: три блока „забележи податке“ са различитим називима колона.', '«para siempre»: tres bloques «registrar datos» con nombres de columna distintos.', '«para sempre»: três blocos «registar dados» com nomes de coluna diferentes.'),
        T('Noise (P1), light (P2) and movements per minute.', 'Бука (P1), светлост (P2) и покрети у минути.', 'Ruido (P1), luz (P2) y movimientos por minuto.', 'Ruído (P1), luz (P2) e movimentos por minuto.'),
        T('Then “pause (ms) 1000”.', 'Па „пауза (ms) 1000“.', 'Luego «pausa (ms) 1000».', 'Depois «pausa (ms) 1000».'),
      ],
      material: MAT_EST,
      novos: ['ic_registar_luz', 'ic_registar_mov'],
      caixa: ['mk_sempre', 'ic_registar_ruido', 'ic_registar_luz', 'ic_registar_mov', 'ic_pausa1000', 'mk_kit_ruido', 'mk_kit_luz'],
      teste: 'kit_luz',
      espera: 2400,
      ok: tresSentidos,
      perspetiva: 'mira',
      pensar: T('Your station measures three things. Mira would add a fourth: the echo. Which feelings or senses are still missing from your table?',
        'Твоја станица мери три ствари. Мира би додала четврту: одјек. Која осећања или чула још недостају у твојој табели?',
        'Tu estación mide tres cosas. Mira añadiría una cuarta: el eco. ¿Qué sentimientos o sentidos faltan todavía en tu tabla?',
        'A tua estação mede três coisas. A Mira juntava uma quarta: o eco. Que sentimentos ou sentidos ainda faltam na tua tabela?'),
      tutor: {
        boasVindas: ['boas_vindas', T('This is the fixed station of the field protocol: three senses, one rhythm.', 'Ово је фиксна станица из протокола: три чула, један ритам.', 'Esta es la estación fija del protocolo de campo: tres sentidos, un ritmo.', 'Esta é a estação fixa do protocolo de campo: três sentidos, um ritmo.')],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'mk_registar').length >= 3 && blocos(e, 'mk_registar').some(p => usa(p, 'mk_kit_ruido')) && blocos(e, 'mk_registar').some(p => usa(p, 'mk_kit_luz'))),
        testar: T('Set noise and light, wait two seconds and look at the three columns.', 'Подеси буку и светлост, сачекај две секунде и погледај три колоне.', 'Ajusta ruido y luz, espera dos segundos y mira las tres columnas.', 'Acerta ruído e luz, espera dois segundos e olha para as três colunas.'),
        regras: [
          P.evento('sempre', T('Which block keeps the station going?', 'Који блок одржава станицу у раду?', '¿Qué bloque mantiene la estación funcionando?', 'Que bloco mantém a estação a funcionar?')),
          P.bloco('sempre', 'mk_registar', T('How does the station write things down?', 'Како станица записује ствари?', '¿Cómo apunta cosas la estación?', 'Como é que a estação aponta as coisas?')),
          P.regra('poucas_colunas', a => evs(a, 'sempre').some(e => blocos(e, 'mk_registar').length > 0 && blocos(e, 'mk_registar').length < 3), [
            ['a_pensar', T('How many senses does your station record? Count the “log data” blocks.', 'Колико чула твоја станица бележи? Преброј блокове „забележи податке“.', '¿Cuántos sentidos registra tu estación? Cuenta los bloques «registrar datos».', 'Quantos sentidos regista a tua estação? Conta os blocos «registar dados».')],
            T('One “log data” per sense: noise, light, movement.', 'Један „забележи податке“ по чулу: бука, светлост, покрет.', 'Un «registrar datos» por sentido: ruido, luz, movimiento.', 'Um «registar dados» por sentido: ruído, luz, movimento.'),
            T('Add the missing “log data” blocks, each with its own column name.', 'Додај блокове „забележи податке“ који недостају, сваки са својим називом колоне.', 'Añade los «registrar datos» que faltan, cada uno con su nombre de columna.', 'Junta os «registar dados» que faltam, cada um com o seu nome de coluna.'),
          ], T('Three senses on record!', 'Три чула забележена!', '¡Tres sentidos registrados!', 'Três sentidos registados!')),
        ],
        sucesso: T('A complete station. Combine it with the “feeling buttons” in the same room on the same day.', 'Потпуна станица. Комбинуј је са „дугмадима осећања“ у истој соби истог дана.', 'Una estación completa. Combínala con los «botones del sentir» en la misma sala el mismo día.', 'Uma estação completa. Junta-a aos «botões do sentir» na mesma sala, no mesmo dia.'),
        extensao: T('Add temperature from the BME280 as a fourth column.', 'Додај температуру са BME280 као четврту колону.', 'Añade la temperatura del BME280 como cuarta columna.', 'Junta a temperatura do BME280 como quarta coluna.'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.registar(F.s('col_ruido'), ruido()), I.registar(F.s('col_luz'), ruido()), I.registar(F.s('col_movimento'), B('so_movimentos')), I.pausa(1000)))),
          pedido: T('My “light” column copies the noise column exactly! Did the light sensor break?', 'Моја колона „светлост“ тачно копира колону буке! Да ли се сензор светлости покварио?', '¡Mi columna «luz» copia exactamente la del ruido! ¿Se ha roto el sensor de luz?', 'A minha coluna «luz» copia a coluna do ruído! O sensor de luz avariou?'),
        },
      },
    },

    // ------------------------------------------------------------ 6 · Projeto: agora está cheio?
    {
      titulo: T('Project · Busy right now?', 'Пројекат · Да ли је сада гужва?', 'Proyecto · ¿Hay mucha gente ahora?', 'Projeto · Agora está cheio?'),
      missao: T('A sign at the door: if more than 3 movements per minute, show one word; otherwise, another.', 'Знак на вратима: ако има више од 3 покрета у минути, прикажи једну реч; иначе другу.', 'Un cartel en la puerta: si hay más de 3 movimientos por minuto, muestra una palabra; si no, otra.', 'Um sinal à porta: se houver mais de 3 movimentos por minuto, mostra uma palavra; senão, outra.'),
      passos: [
        T('“forever” + “if movements per minute > 3 then … else …”.', '„заувек“ + „ако покрета у минути > 3 онда … иначе …“.', '«para siempre» + «si movimientos por minuto > 3 entonces … si no …».', '«para sempre» + «se movimentos por minuto > 3 então … senão …».'),
        T('“show text … on line 3” in both paths, with different words.', '„прикажи текст … у реду 3“ на оба пута, са различитим речима.', '«mostrar texto … en la línea 3» en los dos caminos, con palabras distintas.', '«mostrar texto … na linha 3» nos dois caminhos, com palavras diferentes.'),
        T('Test it: walk past the PIR four times.', 'Испробај: прођи поред PIR-а четири пута.', 'Pruébalo: pasa delante del PIR cuatro veces.', 'Experimenta: passa à frente do PIR quatro vezes.'),
      ],
      material: MAT_PIR,
      novos: ['ic_se_mov', 'ic_so_texto', 'so_movimentos'],
      caixa: ['mk_sempre', 'ic_se_mov', 'ic_so_texto', 'so_movimentos', 'mk_comparar'],
      teste: 'kit_pir',
      espera: 1200,
      ok: cheio,
      perspetiva: 'luka',
      pensar: T('A “busy now” sign at the door helps people choose when to come in. Who else, besides Luka, would use it?',
        'Знак „сада је гужва“ на вратима помаже људима да изаберу када ће ући. Ко би га још, осим Луке, користио?',
        'Un cartel de «ahora hay mucha gente» en la puerta ayuda a elegir cuándo entrar. ¿Quién más, aparte de Luka, lo usaría?',
        'Um sinal «agora está cheio» à porta ajuda as pessoas a escolher quando entrar. Quem mais, além do Luka, o usaria?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Project! Turn your station into a sign that helps visitors choose a calmer moment.', 'Пројекат! Претвори своју станицу у знак који посетиоцима помаже да изаберу мирнији тренутак.', '¡Proyecto! Convierte tu estación en un cartel que ayude a elegir un momento más tranquilo.', 'Projeto! Transforma a estação num sinal que ajuda os visitantes a escolher um momento mais calmo.')],
        parecePronto: a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && usa(x, 'so_movimentos') && plano(x.sim).some(y => y.tipo === 'so_texto') && plano(x.nao).some(y => y.tipo === 'so_texto'))),
        testar: T('Walk past the PIR four times (wait for it to stop each time). Does the word change and stay?', 'Прођи поред PIR-а четири пута (сачекај да стане сваки пут). Да ли се реч мења и остаје?', 'Pasa delante del PIR cuatro veces (espera a que pare cada vez). ¿Cambia la palabra y se queda?', 'Passa à frente do PIR quatro vezes (espera que pare de cada vez). A palavra muda e fica?'),
        regras: [
          P.evento('sempre', T('The sign must always be up to date. Which block?', 'Знак мора увек бити ажуран. Који блок?', 'El cartel tiene que estar siempre al día. ¿Qué bloque?', 'O sinal tem de estar sempre atualizado. Que bloco?')),
          P.bloco('sempre', 'mk_se', T('Busy or calm: which block chooses?', 'Гужва или мир: који блок бира?', 'Mucha gente o tranquilo: ¿qué bloque elige?', 'Cheio ou calmo: que bloco escolhe?')),
          P.regra('pergunta_pir', a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && !usa(x, 'so_movimentos'))), [
            ['a_pensar', T('Your sign asks “is someone moving now?”. But busy means many movements in a minute.', 'Твој знак пита „да ли се неко сада креће?“. Али гужва значи много покрета у минути.', 'Tu cartel pregunta «¿alguien se mueve ahora?». Pero mucha gente significa muchos movimientos en un minuto.', 'O teu sinal pergunta «alguém se mexe agora?». Mas cheio quer dizer muitos movimentos num minuto.')],
            T('Compare “movements per minute” with 3.', 'Упореди „покрета у минути“ са 3.', 'Compara «movimientos por minuto» con 3.', 'Compara «movimentos por minuto» com 3.'),
            T('Put “movements per minute > 3” in the hole of the “if”.', 'Стави „покрета у минути > 3“ у рупу од „ако“.', 'Pon «movimientos por minuto > 3» en el hueco del «si».', 'Põe «movimentos por minuto > 3» no buraco do «se».'),
          ], T('Now it counts the whole minute!', 'Сад броји цео минут!', '¡Ahora cuenta el minuto entero!', 'Agora conta o minuto inteiro!')),
        ],
        sucesso: T('A sign that remembers the last minute, not just this second. Visitors can choose a calmer moment.', 'Знак који памти последњи минут, не само ову секунду. Посетиоци могу да изаберу мирнији тренутак.', 'Un cartel que recuerda el último minuto, no solo este segundo. Los visitantes pueden elegir un momento más tranquilo.', 'Um sinal que lembra o último minuto, não só este segundo. Os visitantes podem escolher um momento mais calmo.'),
        extensao: T('Add the 5-second noise average: busy OR loud shows the warning.', 'Додај просек буке од 5 секунди: гужва ИЛИ бука приказује упозорење.', 'Añade la media de ruido de 5 segundos: mucha gente O ruido muestra el aviso.', 'Junta a média de ruído de 5 segundos: cheio OU barulhento mostra o aviso.'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.se(pir(), [I.soTexto(F.s('palavra_cheio'), 3)], [I.soTexto(F.s('palavra_calmo'), 3)])))),
          pedido: T('My sign says “busy” only while someone walks in front of it. Then it says calm again, even with lots of people!', 'Мој знак каже „гужва“ само док неко пролази испред њега. Онда опет каже мирно, чак и кад има много људи!', 'Mi cartel dice «mucha gente» solo mientras alguien pasa delante. ¡Luego vuelve a decir tranquilo, aunque haya mucha gente!', 'O meu sinal só diz «cheio» enquanto alguém passa à frente. Depois volta a dizer calmo, mesmo com muita gente!'),
        },
      },
    },
  ];

  F.registarMissao({
    id: 'estacao',
    titulo: T('Sensing station', 'Мерна станица', 'Estación de medición', 'Estação de medição'),
    tema: T('Field protocol', 'Протокол на терену', 'Protocolo de campo', 'Protocolo de campo'),
    descricao: T('Build a fixed station that measures noise, light and movement for a long time — like the open sensory map.', 'Направи фиксну станицу која дуго мери буку, светлост и покрет — као отворена сензорна мапа.', 'Construye una estación fija que mida ruido, luz y movimiento durante mucho tiempo, como el mapa sensorial abierto.', 'Constrói uma estação fixa que mede ruído, luz e movimento durante muito tempo — como o mapa sensorial aberto.'),
    cor: '#4E6A8F',
    perspetiva: 'mira',
    xml: XML,
    livres: [{
      titulo: T('Free project · My station', 'Слободни пројекат · Моја станица', 'Proyecto libre · Mi estación', 'Projeto livre · A minha estação'),
      missao: T('Design a station for a place you know: what does it measure, how often, and who reads it?', 'Осмисли станицу за место које знаш: шта мери, колико често и ко је чита?', 'Diseña una estación para un lugar que conozcas: ¿qué mide, cada cuánto y quién la lee?', 'Desenha uma estação para um sítio que conheças: o que mede, de quanto em quanto tempo e quem a lê?'),
    }],
    niveis: [{ nome: T('Level 1 · Station', 'Ниво 1 · Станица', 'Nivel 1 · Estación', 'Nível 1 · Estação'), desafios: D }],
  });
})();
