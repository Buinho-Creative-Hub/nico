/* Missão 6 · O meu mapa de conforto (My comfort map) — limites pessoais, sinais sem ecrã e o percurso do mapa.
 *
 * Usa a extensão «Conforto» (js/conforto.js). Liga às Atividades 2–4 do guia (medir, comparar, percurso do Field
 * Protocol) e à ideia central do projeto: os números não decidem o que é «demais» — as pessoas é que decidem.
 * Perspetivas: Ana (limite próprio), Nina (a mesma sala com os limites de outra pessoa), Mira (sinais para os ouvidos),
 * Teo (o que custa é o súbito), Luka (um percurso com paragens). Validação pelo registo.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const P = F.pistas;
  const { T, V, X } = F.IC;
  const { blocos } = F.ajudasTutor;
  const { I, seq, xml, E, ruido, luzKit, cmp, N, val, xVar } = X;
  const evs = P.evs;
  const usa = (p, tipo) => (p.usa || []).some(u => u.tipo === tipo);
  const plano = l => (l || []).flatMap(x => [x, ...plano(x.corpo), ...plano(x.sim), ...plano(x.nao)]);
  const todos = (a, chave) => evs(a, chave).flatMap(e => plano(e.seq));

  // ------------------------------------------------------------ blocos da extensão, para as gambiarras
  const C = {
    limite: (s, x) => `<block type="cf_limite_definir"><field name="S">${s}</field>${val('V', x)}`,
    perfil: p => `<block type="cf_perfil"><field name="P">${p}</field>`,
    sinal: k => `<block type="cf_sinal"><field name="X">${k}</field>`,
    sonificar: (x, mn, mx) => `<block type="cf_sonificar">${val('V', x)}${N('MIN', mn)}${N('MAX', mx)}`,
    seguinte: () => '<block type="cf_paragem_seguinte">',
    ponto: (p, r, l, s) => `<block type="cf_registar_ponto">${val('P', p)}${val('R', r)}${val('L', l)}${val('S', s)}`,
    demais: (x, s) => `<block type="cf_demais">${val('V', x)}<field name="S">${s}</field></block>`,
    zona: (x, s) => `<block type="cf_zona">${val('V', x)}<field name="S">${s}</field></block>`,
    subito: (x, d) => `<block type="cf_subito">${val('V', x)}${N('D', d)}</block>`,
    paragem: () => '<block type="cf_paragem"></block>',
  };

  // ------------------------------------------------------------ verificações (pelo comportamento)
  const limiteDe = (reg, s) => { const e = [...reg].reverse().find(x => x.dir === 'out' && x.v.startsWith('limite:' + s + ':')); return e ? F.verif.valorDe(e.v) : null; };
  // o mesmo ruído, dois perfis, duas zonas diferentes no ecrã
  function doisPerfis(reg) {
    let perfil = null, ruidoAtual = null;
    const vistos = {};   // ruído → { perfil → número }
    for (const e of reg) {
      if (e.dir === 'in' && e.v.startsWith('kit_ruido:')) ruidoAtual = F.verif.valorDe(e.v);
      if (e.dir === 'out' && e.v.startsWith('perfil:')) perfil = e.v.slice(7);
      if (e.dir === 'out' && e.v.startsWith('numero:') && perfil && ruidoAtual !== null) ((vistos[ruidoAtual] = vistos[ruidoAtual] || {})[perfil] = e.v);
    }
    return Object.values(vistos).some(m => Object.keys(m).length >= 2 && new Set(Object.values(m)).size >= 2);
  }
  // o medidor de som: mais ruído, nota mais aguda (pelo menos 2 valores)
  function notaSobe(reg) {
    const pares = [];
    reg.forEach((e, i) => {
      if (e.dir !== 'in' || !e.v.startsWith('kit_ruido:')) return;
      const t = V.saidasApos(reg, i).filter(x => x.startsWith('sonificar:'));
      if (t.length) pares.push([F.verif.valorDe(e.v), F.verif.valorDe(t[t.length - 1])]);
    });
    const vs = [...new Map(pares).entries()].sort((a, b) => a[0] - b[0]);
    if (vs.length < 2) return false;
    for (let k = 1; k < vs.length; k++) if (!(vs[k][1] > vs[k - 1][1])) return false;
    return true;
  }
  // o súbito: nenhum sinal com um ruído estável (mesmo acima de 40), e um sinal logo a seguir a um salto grande
  function subito(reg) {
    let calmoOk = false, saltoOk = false, anterior = null;
    reg.forEach((e, i) => {
      if (e.dir !== 'in' || !e.v.startsWith('kit_ruido:')) return;
      const x = F.verif.valorDe(e.v), s = V.saidasApos(reg, i);
      const sinal = s.some(y => y.startsWith('sinal:') || y.startsWith('icone:'));
      if (anterior !== null && x - anterior >= 25) saltoOk = saltoOk || sinal;
      else if (x >= 45 && x <= 55) calmoOk = !sinal;
      anterior = x;
    });
    return calmoOk && saltoOk;
  }
  // o percurso: pelo menos duas linhas de registo em paragens diferentes, com o ruído e a luz que havia nesse momento
  function percurso(reg) {
    let r = null, l = null; const paragens = new Set();
    for (const e of reg) {
      if (e.dir === 'in' && e.v.startsWith('kit_ruido:')) r = F.verif.valorDe(e.v);
      if (e.dir === 'in' && e.v.startsWith('kit_luz:')) l = F.verif.valorDe(e.v);
      if (e.dir === 'out' && e.v.startsWith('ponto:')) {
        const [p, rr, ll] = e.v.slice(6).split(':').map(Number);
        if (rr === Math.round(r) && ll === Math.round(l)) paragens.add(p);
      }
    }
    return paragens.size >= 2;
  }

  const XML = {
    ic_lim60: `<block type="cf_limite_definir"><field name="S">ruido</field>${N('V', 60)}</block>`,
    ic_se_demais: `<block type="mk_se"><value name="C">${C.demais(ruido(), 'ruido')}</value></block>`,
    ic_seentao_demais: `<block type="mk_se_entao"><value name="C">${C.demais(ruido(), 'ruido')}</value></block>`,
    ic_seentao_subito: `<block type="mk_se_entao"><value name="C">${C.subito(ruido(), 15)}</value></block>`,
    ic_perfil_ana: '<block type="cf_perfil"><field name="P">ana</field></block>',
    ic_perfil_eu: '<block type="cf_perfil"><field name="P">eu</field></block>',
    ic_zona_ruido: C.zona(ruido(), 'ruido'),
    ic_sinal_demais: '<block type="cf_sinal"><field name="X">demais</field></block>',
    ic_sinal_atencao: '<block type="cf_sinal"><field name="X">atencao</field></block>',
    ic_sonificar: `<block type="cf_sonificar"><value name="V"><shadow type="mk_num"><field name="NUM">60</field></shadow>${ruido()}</value>${N('MIN', 40)}${N('MAX', 90)}</block>`,
    ic_pausa500: '<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">500</field></shadow></value></block>',
    ic_pausa2000: '<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">2000</field></shadow></value></block>',
    ic_numero_paragem: `<block type="mk_mostrar_numero"><value name="N"><shadow type="mk_num"><field name="NUM">1</field></shadow>${C.paragem()}</value></block>`,
  };
  const MAT = T('micro:bit V2 + IoT:bit + noise sensor (P1)', 'micro:bit V2 + IoT:bit + сензор буке (P1)', 'micro:bit V2 + IoT:bit + sensor de ruido (P1)', 'micro:bit V2 + IoT:bit + sensor de ruído (P1)');
  const MAT2 = T('micro:bit V2 + IoT:bit + noise (P1) and light (P2) sensors + a printed route map', 'micro:bit V2 + IoT:bit + сензори буке (P1) и светла (P2) + одштампана мапа руте', 'micro:bit V2 + IoT:bit + sensores de ruido (P1) y luz (P2) + un mapa del recorrido impreso', 'micro:bit V2 + IoT:bit + sensores de ruído (P1) e luz (P2) + um mapa do percurso impresso');

  const D = [
    // ------------------------------------------------------------ 1 · O meu limite
    {
      titulo: T('My own limit', 'Моја граница', 'Mi propio límite', 'O meu limite'),
      missao: T('Choose YOUR noise limit (not a rule from a book): above it, a “too much” face; below it, a calm face.', 'Изабери СВОЈУ границу буке (не правило из књиге): изнад ње лице „превише“; испод ње мирно лице.', 'Elige TU límite de ruido (no una regla de un libro): por encima, una cara de «demasiado»; por debajo, una cara tranquila.', 'Escolhe o TEU limite de ruído (não uma regra de um livro): acima dele, uma cara de «demais»; abaixo, uma cara calma.'),
      passos: [
        T('“on start”: set my noise limit to 60 (or the number that is right for you).', '„при покретању“: постави моју границу буке на 60 (или број који одговара теби).', '«al iniciar»: fijar mi límite de ruido en 60 (o el número que te vaya bien).', '«no arranque»: definir o meu limite de ruído para 60 (ou o número certo para ti).'),
        T('“forever”: if “noise is too much for my noise limit” then a sad face, else a happy face.', '„заувек“: ако „бука је превише за моју границу буке“ онда тужно лице, иначе срећно лице.', '«para siempre»: si «ruido es demasiado para mi límite de ruido» entonces cara triste, si no cara feliz.', '«para sempre»: se «ruído é demais para o meu limite de ruído» então cara triste, senão cara alegre.'),
        T('Test it: noise above and below your limit.', 'Испробај: бука изнад и испод твоје границе.', 'Pruébalo: ruido por encima y por debajo de tu límite.', 'Experimenta: ruído acima e abaixo do teu limite.'),
      ],
      material: MAT,
      novos: ['mk_iniciar', 'ic_lim60', 'mk_sempre', 'ic_se_demais', 'mk_icone'],
      caixa: ['mk_iniciar', 'mk_sempre', 'ic_lim60', 'ic_se_demais', 'mk_icone', 'mk_kit_ruido', 'cf_demais'],
      teste: 'kit_ruido',
      ok: r => { const L = limiteDe(r, 'ruido'); return L !== null && V.doisLados(r, 'kit_ruido', L, x => x.startsWith('icone:')); },
      perspetiva: 'ana',
      perspetivaPergunta: T('Ana hears everything at the same volume. Would her limit be higher or lower than yours? How could you find out without guessing?', 'Ана чује све истом јачином. Да ли би њена граница била виша или нижа од твоје? Како да сазнаш без погађања?', 'Ana oye todo al mismo volumen. ¿Su límite sería más alto o más bajo que el tuyo? ¿Cómo lo sabrías sin adivinar?', 'A Ana ouve tudo ao mesmo volume. O limite dela seria mais alto ou mais baixo do que o teu? Como é que sabias sem adivinhar?'),
      pensar: T('There is no “right” limit for everyone. Ask three people in your group for their noise limit. Are they the same?',
        'Не постоји „права“ граница за све. Питај троје из групе за њихову границу буке. Да ли су исте?',
        'No hay un límite «correcto» para todos. Pregunta a tres personas de tu grupo su límite de ruido. ¿Son iguales?',
        'Não há um limite «certo» para toda a gente. Pergunta a três pessoas do teu grupo o limite de ruído delas. São iguais?'),
      tutor: {
        boasVindas: ['boas_vindas', T('{ola} New drawer: Comfort, in the green of the map. It knows that limits are personal.', '{ola} Нова фиока: Удобност, у зеленој боји мапе. Зна да су границе личне.', '{ola} Cajón nuevo: Confort, en el verde del mapa. Sabe que los límites son personales.', '{ola} Gaveta nova: Conforto, no verde do mapa. Sabe que os limites são pessoais.')],
        parecePronto: a => todos(a, 'inicio').some(x => x.tipo === 'cf_limite_definir') && evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se' && usa(x, 'cf_demais') && plano(x.sim).some(y => y.tipo === 'mk_icone') && plano(x.nao).some(y => y.tipo === 'mk_icone'))),
        testar: T('Move the noise above your limit, then below. Do the faces change?', 'Помери буку изнад своје границе, па испод. Да ли се лица мењају?', 'Mueve el ruido por encima de tu límite y luego por debajo. ¿Cambian las caras?', 'Põe o ruído acima do teu limite e depois abaixo. As caras mudam?'),
        regras: [
          P.evento('inicio', T('Where do you tell the micro:bit your limit, once, at the beginning?', 'Где микробиту кажеш своју границу, једном, на почетку?', '¿Dónde le dices al micro:bit tu límite, una vez, al principio?', 'Onde é que dizes ao micro:bit o teu limite, uma vez, no início?')),
          P.bloco('inicio', 'cf_limite_definir', T('The micro:bit does not know your limit yet. Which green block tells it?', 'Микробит још не зна твоју границу. Који зелени блок му то каже?', 'El micro:bit aún no sabe tu límite. ¿Qué bloque verde se lo dice?', 'O micro:bit ainda não sabe o teu limite. Que bloco verde lho diz?')),
          P.evento('sempre', T('The faces must react all the time. Which block?', 'Лица морају стално да реагују. Који блок?', 'Las caras tienen que reaccionar siempre. ¿Qué bloque?', 'As caras têm de reagir sempre. Que bloco?')),
          P.bloco('sempre', 'mk_se', T('Too much or OK: which block chooses?', 'Превише или у реду: који блок бира?', 'Demasiado o bien: ¿qué bloque elige?', 'Demais ou está bem: que bloco escolhe?')),
          P.regra('sentido_errado', a => evs(a, 'sempre').some(e => plano(e.seq).some(x => (x.usa || []).some(u => u.tipo === 'cf_demais' && u.sentido && u.sentido !== 'ruido'))), [
            ['surpreendida', T('Hmm… it reacts to the lamps, not to the noise! Look at the little menu inside the green block.', 'Хм… реагује на лампе, а не на буку! Погледај мали мени у зеленом блоку.', 'Mmm… ¡reacciona a las lámparas, no al ruido! Mira el menú pequeño dentro del bloque verde.', 'Hum… reage às lâmpadas, não ao barulho! Olha para o menu pequenino dentro do bloco verde.')],
            T('“too much for my … limit” has a menu: noise, light or movement.', '„превише за моју границу …“ има мени: бука, светло или покрет.', '«demasiado para mi límite de …» tiene un menú: ruido, luz o movimiento.', '«demais para o meu limite de …» tem um menu: ruído, luz ou movimento.'),
            T('Choose “noise” in that menu.', 'Изабери „буке“ у том менију.', 'Elige «ruido» en ese menú.', 'Escolhe «ruído» nesse menu.'),
          ], T('Now it listens to the right sense.', 'Сад слуша право чуло.', 'Ahora escucha el sentido correcto.', 'Agora ouve o sentido certo.')),
        ],
        sucesso: T('Your limit, your rule. The same micro:bit can carry a different limit for each person.', 'Твоја граница, твоје правило. Исти микробит може да носи различиту границу за сваку особу.', 'Tu límite, tu regla. El mismo micro:bit puede llevar un límite distinto para cada persona.', 'O teu limite, a tua regra. O mesmo micro:bit pode levar um limite diferente para cada pessoa.'),
        extensao: T('Add a light limit too, and a second face for “too bright”.', 'Додај и границу светла и друго лице за „превише светло“.', 'Añade también un límite de luz y otra cara para «demasiada luz».', 'Junta também um limite de luz e outra cara para «luz a mais».'),
        gambiarra: {
          xml: xml(E.inicio(seq(C.limite('ruido', 60))), E.sempre(seq(I.se(C.demais(ruido(), 'luz'), [I.icone('Sad')], [I.icone('Happy')])))),
          pedido: T('My micro:bit says “too much” when the lights are on, but not when it is loud! I set the noise limit…', 'Мој микробит каже „превише“ кад су светла упаљена, а не кад је бучно! Поставио сам границу буке…', '¡Mi micro:bit dice «demasiado» cuando hay luz, no cuando hay ruido! Y puse el límite de ruido…', 'O meu micro:bit diz «demais» quando as luzes estão acesas, mas não quando há barulho! Eu defini o limite de ruído…'),
        },
      },
    },

    // ------------------------------------------------------------ 2 · A mesma sala, outros limites
    {
      titulo: T('Same room, other limits', 'Иста соба, друге границе', 'La misma sala, otros límites', 'A mesma sala, outros limites'),
      missao: T('A uses Ana’s sensory profile, B uses yours. The screen shows the comfort zone of the noise: 1 calm, 2 close, 3 too much (green, yellow, red). Measure the same room with both.', 'A користи Анин сензорни профил, B твој. Екран показује зону удобности буке: 1 мирно, 2 близу, 3 превише (зелено, жуто, црвено). Измери исту собу са оба.', 'A usa el perfil sensorial de Ana, B el tuyo. La pantalla muestra la zona de confort del ruido: 1 calma, 2 cerca, 3 demasiado (verde, amarillo, rojo). Mide la misma sala con los dos.', 'O A usa o perfil sensorial da Ana, o B o teu. O ecrã mostra a zona de conforto do ruído: 1 calmo, 2 quase, 3 demais (verde, amarelo, vermelho). Mede a mesma sala com os dois.'),
      passos: [
        T('A: use the sensory profile of Ana. B: use the sensory profile of me.', 'A: користи сензорни профил: Ана. B: користи сензорни профил: мене.', 'A: usar el perfil sensorial de Ana. B: usar el perfil sensorial de mí.', 'A: usar o perfil sensorial da Ana. B: usar o perfil sensorial de mim.'),
        T('“forever”: show number “comfort zone of noise for my noise limit”.', '„заувек“: прикажи број „зона удобности за буку и моју границу буке“.', '«para siempre»: mostrar número «zona de confort de ruido para mi límite de ruido».', '«para sempre»: mostrar número «zona de conforto de ruído para o meu limite de ruído».'),
        T('Test it: noise at 60, press A, then B.', 'Испробај: бука на 60, притисни A, па B.', 'Pruébalo: ruido a 60, pulsa A y luego B.', 'Experimenta: ruído a 60, carrega no A e depois no B.'),
      ],
      material: MAT,
      novos: ['ic_perfil_ana', 'ic_perfil_eu', 'ic_zona_ruido'],
      caixa: ['mk_botao', 'mk_sempre', 'ic_perfil_ana', 'ic_perfil_eu', 'mk_mostrar_numero', 'ic_zona_ruido', 'mk_kit_ruido'],
      teste: 'botao:A',
      espera: 2500,
      ok: doisPerfis,
      perspetiva: 'nina',
      perspetivaTexto: T('When we measured our school, the library was quiet on the sensor but loud for Mira, because of the echo. Same number, different person, different answer.', 'Кад смо мерили школу, библиотека је на сензору била тиха, а за Миру гласна, због одјека. Исти број, друга особа, други одговор.', 'Cuando medimos el colegio, la biblioteca era silenciosa en el sensor pero ruidosa para Mira, por el eco. El mismo número, otra persona, otra respuesta.', 'Quando medimos a escola, a biblioteca era sossegada no sensor mas barulhenta para a Mira, por causa do eco. O mesmo número, outra pessoa, outra resposta.'),
      pensar: T('The profiles of the characters are examples. A real profile is made WITH the person. Who in your school would you ask first?',
        'Профили ликова су примери. Прави профил се прави СА особом. Кога у школи би прво питао?',
        'Los perfiles de los personajes son ejemplos. Un perfil real se hace CON la persona. ¿A quién de tu colegio preguntarías primero?',
        'Os perfis das personagens são exemplos. Um perfil a sério faz-se COM a pessoa. A quem da tua escola perguntavas primeiro?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Same room, same sensor… two different answers. Let’s see why.', 'Иста соба, исти сензор… два различита одговора. Да видимо зашто.', 'La misma sala, el mismo sensor… dos respuestas distintas. Veamos por qué.', 'A mesma sala, o mesmo sensor… duas respostas diferentes. Vamos ver porquê.')],
        parecePronto: a => todos(a, 'botao:A').some(x => x.tipo === 'cf_perfil') && todos(a, 'botao:B').some(x => x.tipo === 'cf_perfil') && evs(a, 'sempre').some(e => blocos(e, 'mk_mostrar_numero').some(p => usa(p, 'cf_zona'))),
        testar: T('Noise at 60. Press A and read the number. Press B. Did it change?', 'Бука на 60. Притисни A и прочитај број. Притисни B. Да ли се променио?', 'Ruido a 60. Pulsa A y lee el número. Pulsa B. ¿Ha cambiado?', 'Ruído a 60. Carrega no A e lê o número. Carrega no B. Mudou?'),
        regras: [
          P.evento('botao:A', T('Which button puts on Ana’s profile?', 'Које дугме ставља Анин профил?', '¿Qué botón pone el perfil de Ana?', 'Que botão põe o perfil da Ana?')),
          P.bloco('botao:A', 'cf_perfil', T('Button A needs to change the limits. Which green block changes all of them at once?', 'Дугме A треба да промени границе. Који зелени блок их мења све одједном?', 'El botón A tiene que cambiar los límites. ¿Qué bloque verde los cambia todos a la vez?', 'O botão A tem de mudar os limites. Que bloco verde os muda todos de uma vez?')),
          P.evento('botao:B', T('And how do you go back to your own profile?', 'А како да се вратиш на свој профил?', '¿Y cómo vuelves a tu propio perfil?', 'E como voltas ao teu próprio perfil?')),
          P.bloco('botao:B', 'cf_perfil', T('Button B also needs a profile block — yours.', 'И дугмету B треба блок профила — твој.', 'El botón B también necesita un bloque de perfil: el tuyo.', 'O botão B também precisa de um bloco de perfil — o teu.')),
          P.regra('mesmo_perfil', a => {
            const pa = todos(a, 'botao:A').filter(x => x.tipo === 'cf_perfil').map(x => x.perfil), pb = todos(a, 'botao:B').filter(x => x.tipo === 'cf_perfil').map(x => x.perfil);
            return pa.length && pb.length && pa.every(x => pb.includes(x));
          }, [
            ['surpreendida', T('Whoever presses, it is always the same person! Look at the two menus.', 'Ко год да притисне, увек је иста особа! Погледај два менија.', '¡Pulse quien pulse, siempre es la misma persona! Mira los dos menús.', 'Carregue quem carregar, é sempre a mesma pessoa! Olha para os dois menus.')],
            T('A and B need different people in the profile menu.', 'A и B требају различите особе у менију профила.', 'A y B necesitan personas distintas en el menú del perfil.', 'O A e o B precisam de pessoas diferentes no menu do perfil.'),
            T('Choose “Ana” in A and “me” in B.', 'Изабери „Ана“ у A и „мене“ у B.', 'Elige «Ana» en A y «mí» en B.', 'Escolhe «Ana» no A e «mim» no B.'),
          ], T('Two people, two profiles.', 'Две особе, два профила.', 'Dos personas, dos perfiles.', 'Duas pessoas, dois perfis.')),
          P.evento('sempre', T('The zone must be on the screen all the time. Which block?', 'Зона мора стално да буде на екрану. Који блок?', 'La zona tiene que estar siempre en la pantalla. ¿Qué bloque?', 'A zona tem de estar sempre no ecrã. Que bloco?')),
          P.bloco('sempre', 'mk_mostrar_numero', T('How do you show a number?', 'Како да прикажеш број?', '¿Cómo muestras un número?', 'Como é que mostras um número?')),
          P.valorEm('sempre', 'mk_mostrar_numero', 'cf_zona', T('Which number? The one that says how comfortable it is.', 'Који број? Онај који каже колико је удобно.', '¿Qué número? El que dice lo cómodo que es.', 'Que número? O que diz quão confortável está.')),
        ],
        sucesso: T('Same 60 dB: “close” for you, “too much” with Ana’s profile. The map needs both answers.', 'Истих 60 dB: „близу“ за тебе, „превише“ са Аниним профилом. Мапи требају оба одговора.', 'Los mismos 60 dB: «cerca» para ti, «demasiado» con el perfil de Ana. El mapa necesita las dos respuestas.', 'Os mesmos 60 dB: «quase» para ti, «demais» com o perfil da Ana. O mapa precisa das duas respostas.'),
        extensao: T('Use the logo for a third profile: Luka’s. Which of the three is most bothered by light?', 'Употреби лого за трећи профил: Лукин. Кога од троје највише смета светло?', 'Usa el logo para un tercer perfil: el de Luka. ¿A cuál de los tres le molesta más la luz?', 'Usa o logótipo para um terceiro perfil: o do Luka. Qual dos três se incomoda mais com a luz?'),
        gambiarra: {
          xml: xml(E.botao('A', seq(C.perfil('ana'))), E.botao('B', seq(C.perfil('ana'))), E.sempre(seq(I.numero(C.zona(ruido(), 'ruido'))))),
          pedido: T('I wanted A for Ana and B for me… but the number never changes. Is my micro:bit always Ana?', 'Хтео сам A за Ану и B за мене… али број се никад не мења. Да ли је мој микробит увек Ана?', 'Quería A para Ana y B para mí… pero el número nunca cambia. ¿Mi micro:bit es siempre Ana?', 'Eu queria o A para a Ana e o B para mim… mas o número nunca muda. O meu micro:bit é sempre a Ana?'),
        },
      },
    },

    // ------------------------------------------------------------ 3 · Um sinal para os ouvidos
    {
      titulo: T('A signal for the ears', 'Сигнал за уши', 'Una señal para los oídos', 'Um sinal para os ouvidos'),
      missao: T('Mira cannot see a screen. When the noise goes over the limit, play the gentle “too much” signal, then wait 2 seconds.', 'Мира не може да види екран. Кад бука пређе границу, пусти благи сигнал „превише“, па сачекај 2 секунде.', 'Mira no puede ver una pantalla. Cuando el ruido pase el límite, toca la señal suave «demasiado» y espera 2 segundos.', 'A Mira não vê um ecrã. Quando o ruído passar o limite, toca o sinal suave «demais» e espera 2 segundos.'),
      passos: [
        T('“forever”: if “noise is too much for my noise limit” then…', '„заувек“: ако „бука је превише за моју границу буке“ онда…', '«para siempre»: si «ruido es demasiado para mi límite de ruido» entonces…', '«para sempre»: se «ruído é demais para o meu limite de ruído» então…'),
        T('…gentle signal “too much”, pause 2000.', '…благ сигнал „превише“, пауза 2000.', '…señal suave «demasiado», pausa 2000.', '…sinal suave «demais», pausa 2000.'),
        T('Test it with your eyes closed: noise at 80, then 50.', 'Испробај затворених очију: бука на 80, па 50.', 'Pruébalo con los ojos cerrados: ruido a 80 y luego 50.', 'Experimenta de olhos fechados: ruído a 80 e depois 50.'),
      ],
      material: MAT,
      novos: ['ic_seentao_demais', 'ic_sinal_demais', 'ic_pausa2000'],
      caixa: ['mk_sempre', 'ic_seentao_demais', 'ic_sinal_demais', 'cf_sinal', 'ic_pausa2000', 'mk_kit_ruido'],
      teste: 'kit_ruido',
      espera: 1500,
      ok: r => V.respostas(r, 'kit_ruido', v => v > 70, x => x === 'sinal:demais').length > 0 && !V.respostas(r, 'kit_ruido', v => v < 60, x => x.startsWith('sinal:')).length,
      perspetiva: 'mira',
      perspetivaPergunta: T('A beep can help Mira — or scare her if it is loud and sudden. How should a good signal sound?', 'Писак може да помогне Мири — или да је уплаши ако је гласан и изненадан. Како треба да звучи добар сигнал?', 'Un pitido puede ayudar a Mira, o asustarla si es fuerte y repentino. ¿Cómo debería sonar una buena señal?', 'Um apito pode ajudar a Mira — ou assustá-la, se for alto e de repente. Como devia soar um bom sinal?'),
      pensar: T('The three signals are short, soft and different in shape: down for calm, two equal for attention, three steps down for too much. Could you invent a fourth?',
        'Три сигнала су кратка, мека и различитог облика: наниже за мирно, два иста за пажњу, три корака наниже за превише. Можеш ли да смислиш четврти?',
        'Las tres señales son cortas, suaves y de forma distinta: bajan para calma, dos iguales para atención, tres pasos abajo para demasiado. ¿Inventas una cuarta?',
        'Os três sinais são curtos, suaves e com formas diferentes: a descer para calma, dois iguais para atenção, três degraus a descer para demais. Inventas um quarto?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Close your eyes for a moment. What would tell you the room is too loud?', 'Затвори очи на тренутак. Шта би ти рекло да је соба прегласна?', 'Cierra los ojos un momento. ¿Qué te diría que la sala está demasiado ruidosa?', 'Fecha os olhos um momento. O que é que te dizia que a sala está barulhenta demais?')],
        parecePronto: a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se_entao' && usa(x, 'cf_demais') && plano(x.sim).some(y => y.tipo === 'cf_sinal' && y.sinal === 'demais'))),
        testar: T('Noise at 80: do you hear three soft notes? Noise at 50: silence?', 'Бука на 80: да ли чујеш три меке ноте? Бука на 50: тишина?', 'Ruido a 80: ¿oyes tres notas suaves? Ruido a 50: ¿silencio?', 'Ruído a 80: ouves três notas suaves? Ruído a 50: silêncio?'),
        regras: [
          P.evento('sempre', T('The signal must be ready all the time. Which block?', 'Сигнал мора стално да буде спреман. Који блок?', 'La señal tiene que estar lista siempre. ¿Qué bloque?', 'O sinal tem de estar sempre pronto. Que bloco?')),
          P.bloco('sempre', 'mk_se_entao', T('Only when it is too much. Which block asks a question?', 'Само кад је превише. Који блок поставља питање?', 'Solo cuando es demasiado. ¿Qué bloque hace una pregunta?', 'Só quando é demais. Que bloco faz uma pergunta?')),
          P.bloco('sempre', 'cf_sinal', T('What can Mira hear when it is too much?', 'Шта Мира може да чује кад је превише?', '¿Qué puede oír Mira cuando es demasiado?', 'O que é que a Mira pode ouvir quando é demais?')),
          P.regra('sinal_trocado', a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se_entao' && plano(x.sim).some(y => y.tipo === 'cf_sinal' && y.sinal !== 'demais'))), [
            ['surpreendida', T('It is loud… and it plays the CALM signal? That would confuse Mira.', 'Бучно је… а свира МИРАН сигнал? То би збунило Миру.', 'Hay ruido… ¿y toca la señal de CALMA? Eso confundiría a Mira.', 'Há barulho… e toca o sinal de CALMA? Isso confundia a Mira.')],
            T('The signal block has a menu: calm, attention, too much.', 'Блок сигнала има мени: мирно, пажња, превише.', 'El bloque de señal tiene un menú: calma, atención, demasiado.', 'O bloco do sinal tem um menu: calma, atenção, demais.'),
            T('Choose “too much”.', 'Изабери „превише“.', 'Elige «demasiado».', 'Escolhe «demais».'),
          ], T('Now the sound says what the room is like.', 'Сад звук каже каква је соба.', 'Ahora el sonido dice cómo está la sala.', 'Agora o som diz como está a sala.')),
        ],
        sucesso: T('A signal you can hear with your eyes closed. Designing for Mira helps anyone who is not looking at the screen.', 'Сигнал који чујеш затворених очију. Дизајн за Миру помаже свакоме ко не гледа у екран.', 'Una señal que se oye con los ojos cerrados. Diseñar para Mira ayuda a cualquiera que no mire la pantalla.', 'Um sinal que se ouve de olhos fechados. Desenhar para a Mira ajuda quem não está a olhar para o ecrã.'),
        extensao: T('Add the “calm” signal when the noise goes back below the limit — only once, not all the time.', 'Додај сигнал „мирно“ кад бука падне испод границе — само једном, не стално.', 'Añade la señal «calma» cuando el ruido baje del límite, solo una vez, no todo el rato.', 'Junta o sinal «calma» quando o ruído voltar a baixo do limite — só uma vez, não sempre.'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.seEntao(C.demais(ruido(), 'ruido'), C.sinal('calma'), I.pausa(2000))))),
          pedido: T('My helper plays a lovely calm sound… exactly when it is too loud. Mira says it is lying to her!', 'Мој помоћник свира леп миран звук… тачно кад је прегласно. Мира каже да је лаже!', 'Mi ayudante toca un sonido tranquilo precioso… justo cuando hay demasiado ruido. ¡Mira dice que le miente!', 'O meu ajudante toca um som calmo lindo… exatamente quando há barulho a mais. A Mira diz que ele lhe está a mentir!'),
        },
      },
    },

    // ------------------------------------------------------------ 4 · Medir com os ouvidos
    {
      titulo: T('Measure with your ears', 'Мери ушима', 'Mide con los oídos', 'Medir com os ouvidos'),
      missao: T('A sound gauge: every half second, play the noise as a note from 40 to 90. Louder room, higher note.', 'Звучни мерач: сваких пола секунде свирај буку као ноту од 40 до 90. Гласнија соба, виши тон.', 'Un medidor sonoro: cada medio segundo, toca el ruido como una nota de 40 a 90. Sala más ruidosa, nota más aguda.', 'Um medidor de som: a cada meio segundo, toca o ruído como uma nota de 40 a 90. Sala mais barulhenta, nota mais aguda.'),
      passos: [
        T('“forever”: play noise as sound from 40 to 90.', '„заувек“: свирај буку као звук од 40 до 90.', '«para siempre»: tocar ruido como sonido de 40 a 90.', '«para sempre»: tocar ruído como som de 40 até 90.'),
        T('Then pause 500, so the notes are calm.', 'Па пауза 500, да ноте буду мирне.', 'Luego pausa 500, para que las notas sean tranquilas.', 'Depois pausa 500, para as notas serem calmas.'),
        T('Test it: move the noise slider and listen.', 'Испробај: помери клизач буке и слушај.', 'Pruébalo: mueve el control del ruido y escucha.', 'Experimenta: mexe no controlo do ruído e ouve.'),
      ],
      material: MAT,
      novos: ['ic_sonificar', 'ic_pausa500'],
      caixa: ['mk_sempre', 'ic_sonificar', 'ic_pausa500', 'mk_kit_ruido'],
      teste: 'kit_ruido',
      espera: 1200,
      ok: notaSobe,
      perspetiva: 'mira',
      perspetivaTexto: T('I don’t see rooms — I hear them. If the micro:bit sings the noise to me, I can walk through the museum and find the quiet room by myself.', 'Ја не видим собе — ја их чујем. Ако ми микробит отпева буку, могу сама да прођем кроз музеј и нађем тиху собу.', 'Yo no veo las salas: las oigo. Si el micro:bit me canta el ruido, puedo recorrer el museo y encontrar la sala tranquila yo sola.', 'Eu não vejo as salas — oiço-as. Se o micro:bit me cantar o ruído, consigo andar pelo museu e encontrar sozinha a sala calma.'),
      pensar: T('Turning data into sound is called sonification. Try the whole route with the screen covered. What did you notice that you missed before?',
        'Претварање података у звук зове се сонификација. Прођи целу руту са покривеним екраном. Шта си приметио што раније ниси?',
        'Convertir datos en sonido se llama sonificación. Haz todo el recorrido con la pantalla tapada. ¿Qué notaste que antes se te escapaba?',
        'Transformar dados em som chama-se sonificação. Faz o percurso todo com o ecrã tapado. O que reparaste que antes te escapava?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Can a number sing? Let’s give the noise a voice.', 'Може ли број да пева? Хајде да буци дамо глас.', '¿Puede cantar un número? Demos voz al ruido.', 'Um número pode cantar? Vamos dar voz ao ruído.')],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'cf_sonificar').some(p => usa(p, 'mk_kit_ruido'))),
        testar: T('Noise at 40, then 90. Does the note go up?', 'Бука на 40, па 90. Да ли тон расте?', 'Ruido a 40 y luego 90. ¿Sube la nota?', 'Ruído a 40 e depois 90. A nota sobe?'),
        regras: [
          P.evento('sempre', T('The gauge must sing all the time. Which block?', 'Мерач мора стално да пева. Који блок?', 'El medidor tiene que cantar siempre. ¿Qué bloque?', 'O medidor tem de cantar sempre. Que bloco?')),
          P.bloco('sempre', 'cf_sonificar', T('Which green block turns a value into a note?', 'Који зелени блок претвара вредност у ноту?', '¿Qué bloque verde convierte un valor en una nota?', 'Que bloco verde transforma um valor numa nota?')),
          P.valorEm('sempre', 'cf_sonificar', 'mk_kit_ruido', T('The note never changes. What should it listen to?', 'Нота се никад не мења. Шта треба да слуша?', 'La nota nunca cambia. ¿Qué debería escuchar?', 'A nota nunca muda. O que é que devia ouvir?')),
          P.regra('ao_contrario', a => evs(a, 'sempre').some(e => blocos(e, 'cf_sonificar').some(p => typeof p.min === 'number' && typeof p.max === 'number' && p.min > p.max)), [
            ['surpreendida', T('Louder room… lower note? That is upside down!', 'Гласнија соба… нижи тон? То је наопако!', '¿Sala más ruidosa… nota más grave? ¡Eso está al revés!', 'Sala mais barulhenta… nota mais grave? Isso está ao contrário!')],
            T('Look at the two numbers “from … to …”. Which is the quiet end?', 'Погледај два броја „од … до …“. Који је тихи крај?', 'Mira los dos números «de … a …». ¿Cuál es el extremo silencioso?', 'Olha para os dois números «de … até …». Qual é a ponta calma?'),
            T('Swap them: from 40 to 90.', 'Замени их: од 40 до 90.', 'Cámbialos: de 40 a 90.', 'Troca-os: de 40 até 90.'),
          ], T('Now it goes up with the noise.', 'Сад расте са буком.', 'Ahora sube con el ruido.', 'Agora sobe com o ruído.')),
        ],
        sucesso: T('The noise sings! Low and calm in a quiet room, high in a busy one — no screen needed.', 'Бука пева! Дубоко и мирно у тихој соби, високо у бучној — без екрана.', '¡El ruido canta! Grave y tranquilo en una sala silenciosa, agudo en una ruidosa, sin pantalla.', 'O ruído canta! Grave e calmo numa sala sossegada, agudo numa cheia — sem ecrã.'),
        extensao: T('Make the light sing too, on button A, so you can compare both with your ears.', 'Нека и светло пева, на дугме A, да поредиш обоје ушима.', 'Haz que la luz también cante, con el botón A, para comparar los dos con los oídos.', 'Põe também a luz a cantar, no botão A, para comparares os dois com os ouvidos.'),
        gambiarra: {
          xml: xml(E.sempre(seq(C.sonificar(ruido(), 90, 40), I.pausa(500)))),
          pedido: T('My gauge sings LOW when the classroom gets loud. Did I build an upside-down ear?', 'Мој мерач пева ДУБОКО кад учионица постане бучна. Да ли сам направио обрнуто уво?', 'Mi medidor canta GRAVE cuando el aula se vuelve ruidosa. ¿He construido un oído al revés?', 'O meu medidor canta GRAVE quando a sala fica barulhenta. Fiz uma orelha ao contrário?'),
        },
      },
    },

    // ------------------------------------------------------------ 5 · O que custa é o súbito
    {
      titulo: T('The sudden part', 'Оно нагло', 'Lo repentino', 'O que custa é o súbito'),
      missao: T('Teo likes loud music he chooses, but not sudden sounds. Give a gentle “attention” signal only when the noise JUMPS — not when it is just loud.', 'Тео воли гласну музику коју бира, али не нагле звукове. Дај благ сигнал „пажња“ само кад бука СКОЧИ — не кад је само гласно.', 'A Teo le gusta la música alta que elige, pero no los sonidos repentinos. Da una señal suave de «atención» solo cuando el ruido SALTA, no cuando solo es fuerte.', 'O Teo gosta de música alta que escolhe, mas não de sons de repente. Dá um sinal suave de «atenção» só quando o ruído SALTA — não quando está só alto.'),
      passos: [
        T('“forever”: if “sudden jump in noise of more than 15” then…', '„заувек“: ако „нагли скок буке већи од 15“ онда…', '«para siempre»: si «salto repentino de ruido de más de 15» entonces…', '«para sempre»: se «salto súbito de ruído maior do que 15» então…'),
        T('…gentle signal “attention”.', '…благ сигнал „пажња“.', '…señal suave «atención».', '…sinal suave «atenção».'),
        T('Test it: noise steady at 50 for a few seconds, then suddenly 80.', 'Испробај: бука мирно на 50 неколико секунди, па одједном 80.', 'Pruébalo: ruido estable a 50 unos segundos y de repente 80.', 'Experimenta: ruído parado nos 50 uns segundos, e de repente 80.'),
      ],
      material: MAT,
      novos: ['ic_seentao_subito', 'ic_sinal_atencao'],
      caixa: ['mk_sempre', 'ic_seentao_subito', 'ic_sinal_atencao', 'cf_sinal', 'mk_kit_ruido', 'mk_se_entao', 'mk_comparar'],
      teste: 'kit_ruido',
      espera: 1200,
      ok: subito,
      perspetiva: 'teo',
      pensar: T('A level tells you HOW MUCH. A jump tells you WHEN. Which places in your school have sudden sounds: bells, hand dryers, doors?',
        'Ниво ти каже КОЛИКО. Скок ти каже КАДА. Која места у твојој школи имају нагле звукове: звона, сушаче за руке, врата?',
        'Un nivel te dice CUÁNTO. Un salto te dice CUÁNDO. ¿Qué sitios de tu colegio tienen sonidos repentinos: timbres, secadores de manos, puertas?',
        'Um nível diz-te QUANTO. Um salto diz-te QUANDO. Que sítios da tua escola têm sons de repente: campainhas, secadores de mãos, portas?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Loud is not always the problem. Sometimes it is the surprise.', 'Гласно није увек проблем. Понекад је то изненађење.', 'Lo fuerte no siempre es el problema. A veces es la sorpresa.', 'O alto nem sempre é o problema. Às vezes é a surpresa.')],
        parecePronto: a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se_entao' && usa(x, 'cf_subito') && plano(x.sim).some(y => y.tipo === 'cf_sinal' || y.tipo === 'mk_icone'))),
        testar: T('Noise at 50 for 4 seconds: silence? Then 80: a signal?', 'Бука на 50 четири секунде: тишина? Па 80: сигнал?', 'Ruido a 50 durante 4 segundos: ¿silencio? Luego 80: ¿una señal?', 'Ruído a 50 durante 4 segundos: silêncio? Depois 80: um sinal?'),
        regras: [
          P.evento('sempre', T('Jumps can happen any time. Which block keeps watching?', 'Скокови могу да се десе у било ком тренутку. Који блок стално пази?', 'Los saltos pueden pasar en cualquier momento. ¿Qué bloque vigila siempre?', 'Os saltos podem acontecer a qualquer momento. Que bloco está sempre a vigiar?')),
          P.bloco('sempre', 'mk_se_entao', T('Only when it jumps. Which block asks?', 'Само кад скочи. Који блок пита?', 'Solo cuando salta. ¿Qué bloque pregunta?', 'Só quando salta. Que bloco pergunta?')),
          P.regra('nivel_nao_salto', a => evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_se_entao' && usa(x, 'mk_comparar') && !usa(x, 'cf_subito'))), [
            ['surpreendida', T('It beeps in a normal busy classroom! Teo would hear it all day. Is that a jump, or just a level?', 'Пишти у нормалној бучној учионици! Тео би то слушао цео дан. Да ли је то скок или само ниво?', '¡Pita en un aula normal con gente! Teo lo oiría todo el día. ¿Es un salto o solo un nivel?', 'Apita numa sala de aula normal! O Teo ouvia isso o dia todo. Isso é um salto, ou só um nível?')],
            T('“noise > …” checks a level. There is a green block that checks a JUMP.', '„бука > …“ проверава ниво. Постоји зелени блок који проверава СКОК.', '«ruido > …» mira un nivel. Hay un bloque verde que mira un SALTO.', '«ruído > …» vê um nível. Há um bloco verde que vê um SALTO.'),
            T('Put “sudden jump in noise of more than 15” in the “if”.', 'Стави „нагли скок буке већи од 15“ у „ако“.', 'Pon «salto repentino de ruido de más de 15» en el «si».', 'Põe «salto súbito de ruído maior do que 15» no «se».'),
          ], T('Now it only speaks when something changes suddenly.', 'Сад говори само кад се нешто нагло промени.', 'Ahora solo habla cuando algo cambia de repente.', 'Agora só fala quando alguma coisa muda de repente.')),
          P.bloco('sempre', 'cf_sinal', T('A jump happened. How does Teo find out — gently?', 'Десио се скок. Како Тео сазна — нежно?', 'Ha habido un salto. ¿Cómo se entera Teo, con suavidad?', 'Houve um salto. Como é que o Teo fica a saber — com suavidade?')),
        ],
        sucesso: T('It ignores steady noise and notices surprises. That is exactly what a hand dryer or a bell is like for Teo.', 'Не обраћа пажњу на сталну буку, а примећује изненађења. Управо такав је сушач за руке или звоно за Теа.', 'Ignora el ruido constante y nota las sorpresas. Así son para Teo un secador de manos o un timbre.', 'Ignora o ruído constante e repara nas surpresas. É mesmo assim que um secador de mãos ou uma campainha são para o Teo.'),
        extensao: T('Count the jumps in a variable and show how many happened in your lesson.', 'Броји скокове у променљивој и покажи колико их је било на часу.', 'Cuenta los saltos en una variable y muestra cuántos hubo en tu clase.', 'Conta os saltos numa variável e mostra quantos houve na tua aula.'),
        gambiarra: {
          xml: xml(E.sempre(seq(I.seEntao(cmp(ruido(), '>', 40), C.sinal('atencao'))))),
          pedido: T('My “surprise detector” beeps all the time in class, even when nothing happens! Teo turned it off after a minute.', 'Мој „детектор изненађења“ стално пишти на часу, чак и кад се ништа не дешава! Тео га је угасио после минут.', '¡Mi «detector de sorpresas» pita todo el rato en clase, aunque no pase nada! Teo lo apagó al minuto.', 'O meu «detetor de surpresas» apita o tempo todo na aula, mesmo quando não acontece nada! O Teo desligou-o ao fim de um minuto.'),
        },
      },
    },

    // ------------------------------------------------------------ 6 · Projeto: o percurso com paragens
    {
      titulo: T('Project · A route with stops', 'Пројекат · Рута са стајалиштима', 'Proyecto · Un recorrido con paradas', 'Projeto · Um percurso com paragens'),
      missao: T('Walk the route of the Field Protocol. A: next stop (and show its number). B: log one row — stop, noise, light and how you feel (1 good, 2 in between, 3 too much — as in mission 3).', 'Прођи руту теренског протокола. A: следеће стајалиште (и покажи његов број). B: забележи један ред — стајалиште, бука, светло и како се осећаш (1 пријатно, 2 између, 3 превише — као у мисији 3).', 'Recorre la ruta del Protocolo de campo. A: siguiente parada (y muestra su número). B: registra una fila: parada, ruido, luz y cómo te sientes (1 bien, 2 entre medias, 3 demasiado, como en la misión 3).', 'Percorre o caminho do Protocolo de campo. A: paragem seguinte (e mostra o número). B: regista uma linha — paragem, ruído, luz e como te sentes (1 bem, 2 assim-assim, 3 demais — como na missão 3).'),
      passos: [
        T('A: next stop on the route, then show number “stop number”.', 'A: следеће стајалиште на рути, па прикажи број „број стајалишта“.', 'A: siguiente parada del recorrido y mostrar número «número de parada».', 'A: paragem seguinte do percurso e mostrar número «número da paragem».'),
        T('B: log stop “stop number”, noise, light, feeling.', 'B: забележи стајалиште „број стајалишта“, буку, светло, осећај.', 'B: registrar parada «número de parada», ruido, luz, sentir.', 'B: registar paragem «número da paragem», ruído, luz, sentir.'),
        T('Test it: A, B, change the noise, A, B. Then open MY_DATA.HTM on the micro:bit.', 'Испробај: A, B, промени буку, A, B. Па отвори MY_DATA.HTM на микробиту.', 'Pruébalo: A, B, cambia el ruido, A, B. Luego abre MY_DATA.HTM en el micro:bit.', 'Experimenta: A, B, muda o ruído, A, B. Depois abre o MY_DATA.HTM no micro:bit.'),
      ],
      material: MAT2,
      novos: ['cf_paragem_seguinte', 'ic_numero_paragem', 'cf_registar_ponto', 'cf_paragem'],
      caixa: ['mk_botao', 'cf_paragem_seguinte', 'ic_numero_paragem', 'cf_registar_ponto', 'cf_paragem', 'mk_kit_ruido', 'mk_kit_luz'],
      teste: 'botao:B',
      espera: 1500,
      ok: percurso,
      perspetiva: 'luka',
      perspetivaPergunta: T('Luka can’t follow a guide in a busy room. If the map showed which stops are calm, how could it help him plan the visit?', 'Лука не може да прати водича у препуној соби. Ако би мапа показала која стајалишта су мирна, како би му помогла да испланира посету?', 'Luka no puede seguir a un guía en una sala llena. Si el mapa mostrara qué paradas son tranquilas, ¿cómo le ayudaría a planear la visita?', 'O Luka não consegue seguir um guia numa sala cheia. Se o mapa mostrasse que paragens são calmas, como é que o ajudava a planear a visita?'),
      pensar: T('Your rows are the same as the paper record sheet. Put them on the route map with colours: this is your invisible cartography. What would you change at the stop with the most “3”s?',
        'Твоји редови су исти као папирни образац. Стави их на мапу руте бојама: то је твоја невидљива картографија. Шта би променио на стајалишту са највише „3“?',
        'Tus filas son iguales que la hoja de registro en papel. Ponlas en el mapa con colores: esta es tu cartografía invisible. ¿Qué cambiarías en la parada con más «3»?',
        'As tuas linhas são iguais à folha de registo em papel. Põe-nas no mapa do percurso com cores: é a tua cartografia invisível. O que mudavas na paragem com mais «3»?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Last project: a real route. Each stop becomes a row, each row a dot on the map.', 'Последњи пројекат: права рута. Свако стајалиште постаје ред, сваки ред тачка на мапи.', 'Último proyecto: un recorrido de verdad. Cada parada es una fila; cada fila, un punto en el mapa.', 'Último projeto: um percurso a sério. Cada paragem vira uma linha, cada linha um ponto no mapa.')],
        parecePronto: a => todos(a, 'botao:A').some(x => x.tipo === 'cf_paragem_seguinte') && evs(a, 'botao:B').some(e => blocos(e, 'cf_registar_ponto').some(p => usa(p, 'cf_paragem'))),
        testar: T('Press A, then B. Change the noise. A, then B again. Look at the logged data.', 'Притисни A, па B. Промени буку. Опет A, па B. Погледај забележене податке.', 'Pulsa A y luego B. Cambia el ruido. Otra vez A y B. Mira los datos registrados.', 'Carrega no A e depois no B. Muda o ruído. Outra vez A e B. Olha para os dados registados.'),
        regras: [
          P.evento('botao:A', T('How do you tell the micro:bit you walked to the next stop?', 'Како да кажеш микробиту да си стигао до следећег стајалишта?', '¿Cómo le dices al micro:bit que has llegado a la siguiente parada?', 'Como é que dizes ao micro:bit que chegaste à paragem seguinte?')),
          P.bloco('botao:A', 'cf_paragem_seguinte', T('Which green block moves to the next stop?', 'Који зелени блок прелази на следеће стајалиште?', '¿Qué bloque verde pasa a la siguiente parada?', 'Que bloco verde passa à paragem seguinte?')),
          P.evento('botao:B', T('Which button writes down what you measured?', 'Које дугме записује шта си измерио?', '¿Qué botón apunta lo que has medido?', 'Que botão aponta o que mediste?')),
          P.bloco('botao:B', 'cf_registar_ponto', T('One row per stop. Which green block writes a whole row?', 'Један ред по стајалишту. Који зелени блок записује цео ред?', 'Una fila por parada. ¿Qué bloque verde escribe una fila entera?', 'Uma linha por paragem. Que bloco verde escreve uma linha inteira?')),
          P.valorEm('botao:B', 'cf_registar_ponto', 'cf_paragem', T('All your rows are on the same stop! What should go in the first hole?', 'Сви твоји редови су на истом стајалишту! Шта треба у прву рупу?', '¡Todas tus filas están en la misma parada! ¿Qué va en el primer hueco?', 'As tuas linhas estão todas na mesma paragem! O que é que vai no primeiro buraco?')),
        ],
        sucesso: T('A data walk! Your rows have the same columns as the record sheet, so paper and micro:bit can go on the same map.', 'Шетња са подацима! Твоји редови имају исте колоне као образац, па папир и микробит иду на исту мапу.', '¡Un paseo de datos! Tus filas tienen las mismas columnas que la hoja de registro, así que papel y micro:bit van al mismo mapa.', 'Um passeio de dados! As tuas linhas têm as mesmas colunas da folha de registo, por isso papel e micro:bit vão para o mesmo mapa.'),
        extensao: T('Use the feeling buttons from mission 3 to fill the “feeling” column, instead of a fixed number.', 'Употреби дугмад осећања из мисије 3 да попуниш колону „осећај“, уместо сталног броја.', 'Usa los botones del sentir de la misión 3 para rellenar la columna «sentir», en vez de un número fijo.', 'Usa os botões do sentir da missão 3 para preencher a coluna «sentir», em vez de um número fixo.'),
        gambiarra: {
          xml: xml(E.botao('A', seq(C.seguinte(), I.numero(C.paragem()))), E.botao('B', seq(C.ponto(1, ruido(), luzKit(), 1)))),
          pedido: T('I walked through six rooms, but on my map all the dots are on top of each other at stop 1!', 'Прошао сам кроз шест соба, али на мојој мапи су све тачке једна на другој на стајалишту 1!', '¡He recorrido seis salas, pero en mi mapa todos los puntos están amontonados en la parada 1!', 'Passei por seis salas, mas no meu mapa os pontos estão todos uns em cima dos outros na paragem 1!'),
        },
      },
    },
  ];

  F.registarMissao({
    id: 'mapa',
    titulo: T('My comfort map', 'Моја мапа удобности', 'Mi mapa de confort', 'O meu mapa de conforto'),
    tema: T('Personal limits', 'Личне границе', 'Límites personales', 'Limites pessoais'),
    descricao: T('Your limit is not everyone’s limit. Measure with other people’s profiles, signal without a screen, catch sudden sounds and walk a route that becomes a map.', 'Твоја граница није свачија граница. Мери профилима других, дај сигнал без екрана, ухвати нагле звукове и прођи руту која постаје мапа.', 'Tu límite no es el de todos. Mide con los perfiles de otras personas, avisa sin pantalla, detecta sonidos repentinos y recorre una ruta que se convierte en mapa.', 'O teu limite não é o de toda a gente. Mede com os perfis de outras pessoas, avisa sem ecrã, apanha sons de repente e faz um percurso que vira mapa.'),
    cor: '#0F7C8C',
    perspetiva: 'nina',
    xml: XML,
    livres: [{
      titulo: T('Free project · Map your school with two profiles', 'Слободни пројекат · Мапирај школу са два профила', 'Proyecto libre · Mapea tu colegio con dos perfiles', 'Projeto livre · Mapeia a escola com dois perfis'),
      missao: T('Walk the same route twice: once with your profile and once with a classmate’s (made together, not guessed). Where do the two maps differ?', 'Прођи исту руту два пута: једном са својим профилом и једном са профилом друга (направљеним заједно, не погађањем). Где се две мапе разликују?', 'Recorre la misma ruta dos veces: una con tu perfil y otra con el de un compañero (hecho juntos, no adivinado). ¿Dónde se diferencian los dos mapas?', 'Faz o mesmo percurso duas vezes: uma com o teu perfil e outra com o de um colega (feito em conjunto, não adivinhado). Onde é que os dois mapas são diferentes?'),
      perspetiva: 'nina',
    }],
    niveis: [{ nome: T('Level 1 · Comfort', 'Ниво 1 · Удобност', 'Nivel 1 · Confort', 'Nível 1 · Conforto'), desafios: D }],
  });
})();
