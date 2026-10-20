/* Missão 3 · Botões do sentir (Feeling buttons) — a camada humana do mapa.
 *
 * Liga à Atividade 3 do guia (Feeling buttons): durante a visita, cada pessoa regista quando um sítio lhe sabe bem
 * ou é demais. Perspetiva: Teo (autista, procura sensações fortes mas não as que não escolhe; comunica com tablet e
 * cartões). Ideia que fica: o que as pessoas sentem também são dados; comunicar sem palavras é comunicar.
 * Só com o micro:bit (registo de dados V2). Validação pelo registo.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const P = F.pistas;
  const { T, V, X } = F.IC;
  const { blocos, tem } = F.ajudasTutor;
  const { I, seq, xml, E, B, N, S } = X;
  const evs = P.evs;
  const usa = (p, tipo) => (p.usa || []).some(u => u.tipo === tipo);

  const iconeApos = (reg, entrada) => {
    let r = null;
    reg.forEach((e, i) => { if (e.dir === 'in' && e.v === entrada) { const s = V.saidasApos(reg, i).filter(x => x.startsWith('icone:')); if (s.length) r = s[s.length - 1]; } });
    return r;
  };
  const registoApos = (reg, entrada) => {
    let r = null;
    reg.forEach((e, i) => { if (e.dir === 'in' && e.v === entrada) { const g = V.registosApos(reg, i); if (g.length) r = g; } });
    return r;
  };
  // A e B: cada um mostra o seu ícone (diferentes)
  function duasCaras(reg) { const a = iconeApos(reg, 'botao:A'), b = iconeApos(reg, 'botao:B'); return !!a && !!b && a !== b; }
  // A e B registam na mesma coluna valores diferentes
  function mesmaColuna(reg) {
    const a = registoApos(reg, 'botao:A'), b = registoApos(reg, 'botao:B');
    if (!a || !b) return false;
    return a.some(x => b.some(y => x.nome === y.nome && x.v !== y.v));
  }
  // depois de A+B, o ecrã mostra o valor da variável que o B foi aumentando (≥ 2)
  function contaB(reg) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== 'botao:AB') continue;
      const nb = reg.slice(0, i).filter(e => e.dir === 'in' && e.v === 'botao:B').length;
      const u = V.ultimaVar(reg, i);
      if (nb >= 2 && u && u.v === nb && V.saidasApos(reg, i).includes('numero:' + nb)) return true;
    }
    return false;
  }
  // o B regista o sentimento E o som desse momento (duas colunas)
  function sentimentoEMedida(reg) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== 'botao:B') continue;
      const som = V.ultimoSensor(reg, i, 'som');
      const g = V.registosApos(reg, i);
      if (som === null || g.length < 2) continue;
      const m = g.find(x => x.v === som);
      if (m && g.some(x => x !== m && x.nome !== m.nome)) return true;
    }
    return false;
  }
  // tocar no logotipo: aparece um símbolo e acende-se um sinal num pino (para o adulto ver)
  function pausa(reg) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== 'logo') continue;
      const s = V.saidasApos(reg, i);
      if (s.some(x => x.startsWith('icone:')) && s.some(x => /^digital:P\d+:1$/.test(x))) return true;
    }
    return false;
  }
  // três sentimentos: A, logotipo e B registam três valores diferentes na mesma coluna, com três ícones diferentes
  function tres(reg) {
    const ents = ['botao:A', 'logo', 'botao:B'];
    const ics = ents.map(e => iconeApos(reg, e)), regs = ents.map(e => registoApos(reg, e));
    if (ics.some(x => !x) || regs.some(x => !x) || new Set(ics).size !== 3) return false;
    for (const a of regs[0]) for (const b of regs[1]) for (const c of regs[2]) {
      if (a.nome === b.nome && b.nome === c.nome && new Set([a.v, b.v, c.v]).size === 3) return true;
    }
    return false;
  }

  const XML = {
    ic_icone_feliz: '<block type="mk_icone"><field name="I">Happy</field></block>',
    ic_icone_triste: '<block type="mk_icone"><field name="I">Sad</field></block>',
    ic_registar_sentir: `<block type="mk_registar">${S('NOME', F.s('col_sentir'))}${N('V', 1)}</block>`,
    ic_mudar_contador: `<block type="mk_var_mudar"><field name="VAR">contador</field>${N('V', 1)}</block>`,
    ic_var_contador: '<block type="mk_var"><field name="VAR">contador</field></block>',
    ic_registar_som: `<block type="mk_registar">${S('NOME', F.s('col_som'))}<value name="V"><block type="mk_som_nivel"></block></value></block>`,
    ic_icone_pausa: '<block type="mk_icone"><field name="I">Asleep</field></block>',
    ic_digital_p2: '<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block>',
    ic_icone_meio: '<block type="mk_icone"><field name="I">Surprised</field></block>',
  };
  const MAT = T('micro:bit V2', 'micro:bit V2', 'micro:bit V2', 'micro:bit V2');

  const D = [
    // ------------------------------------------------------------ 1 · Sabe bem / é demais
    {
      titulo: T('Feels good / too much', 'Пријатно / превише', 'Me siento bien / demasiado', 'Sabe bem / é demais'),
      missao: T('Button A means “I feel good here”, button B means “this is too much”. Each shows its own face.', 'Дугме A значи „овде ми је пријатно“, дугме B „ово је превише“. Свако показује своје лице.', 'El botón A significa «aquí me siento bien», el B «esto es demasiado». Cada uno muestra su cara.', 'O botão A quer dizer «aqui sinto-me bem», o B «isto é demais». Cada um mostra a sua cara.'),
      passos: [
        T('A: “show icon” with a calm face.', 'A: „прикажи иконицу“ са мирним лицем.', 'A: «mostrar ícono» con una cara tranquila.', 'A: «mostrar ícone» com uma cara calma.'),
        T('B: “show icon” with a different face.', 'B: „прикажи иконицу“ са другим лицем.', 'B: «mostrar ícono» con una cara distinta.', 'B: «mostrar ícone» com uma cara diferente.'),
        T('Find A (left) and B (right) by touch, with your eyes closed.', 'Пронађи A (лево) и B (десно) додиром, затворених очију.', 'Encuentra A (izquierda) y B (derecha) con el tacto, con los ojos cerrados.', 'Encontra o A (esquerda) e o B (direita) pelo tato, de olhos fechados.'),
      ],
      material: MAT,
      novos: ['mk_botao', 'mk_botao_B', 'ic_icone_feliz', 'ic_icone_triste'],
      teste: 'botao:A',
      ok: duasCaras,
      pensar: T('Sensors measure sound and light. Only people can say how a place feels. Why is that also data?',
        'Сензори мере звук и светлост. Само људи могу да кажу какав је осећај неког места. Зашто је и то податак?',
        'Los sensores miden sonido y luz. Solo las personas pueden decir cómo se siente un lugar. ¿Por qué eso también es un dato?',
        'Os sensores medem som e luz. Só as pessoas sabem dizer como se sente um sítio. Porque é que isso também são dados?'),
      tutor: {
        boasVindas: ['boas_vindas', T('{ola} Today we map what sensors cannot measure: feelings.', '{ola} Данас мапирамо оно што сензори не могу да измере: осећања.', '{ola} Hoy mapeamos lo que los sensores no pueden medir: los sentimientos.', '{ola} Hoje vamos mapear o que os sensores não medem: o que sentimos.')],
        parecePronto: a => evs(a, 'botao:A').some(e => blocos(e, 'mk_icone').length) && evs(a, 'botao:B').some(e => blocos(e, 'mk_icone').length),
        testar: T('Press A, then B. Two different faces?', 'Притисни A, па B. Два различита лица?', 'Pulsa A y luego B. ¿Dos caras distintas?', 'Carrega no A e depois no B. Duas caras diferentes?'),
        regras: [
          P.evento('botao:A', T('Which button means “I feel good here”?', 'Које дугме значи „овде ми је пријатно“?', '¿Qué botón significa «aquí me siento bien»?', 'Que botão quer dizer «aqui sinto-me bem»?')),
          P.bloco('botao:A', 'mk_icone', T('A is listening. What does it show?', 'A слуша. Шта показује?', 'A ya escucha. ¿Qué muestra?', 'O A já está à escuta. O que é que mostra?')),
          P.evento('botao:B', T('And “this is too much”? Use the other button.', 'А „ово је превише“? Користи друго дугме.', '¿Y «esto es demasiado»? Usa el otro botón.', 'E «isto é demais»? Usa o outro botão.')),
          P.bloco('botao:B', 'mk_icone', T('B is listening. Which face says “too much”?', 'B слуша. Које лице каже „превише“?', 'B ya escucha. ¿Qué cara dice «demasiado»?', 'O B já está à escuta. Que cara diz «demais»?')),
          P.regra('mesma_cara', a => { const ia = evs(a, 'botao:A').flatMap(e => blocos(e, 'mk_icone').map(p => p.icone)), ib = evs(a, 'botao:B').flatMap(e => blocos(e, 'mk_icone').map(p => p.icone)); return ia.length && ib.length && ia.every(x => ib.includes(x)); }, [
            ['surpreendida', T('A and B show the same face. How would we tell them apart?', 'A и B показују исто лице. Како ћемо их разликовати?', 'A y B muestran la misma cara. ¿Cómo las distinguimos?', 'O A e o B mostram a mesma cara. Como é que as distinguimos?')],
            T('Open the icon menu and choose a different one for B.', 'Отвори мени иконица и изабери другу за B.', 'Abre el menú de íconos y elige otro para B.', 'Abre o menu dos ícones e escolhe outro para o B.'),
            T('Click the small arrow in B’s “show icon”.', 'Кликни на малу стрелицу у B-овом „прикажи иконицу“.', 'Haz clic en la flechita del «mostrar ícono» de B.', 'Clica na setinha do «mostrar ícone» do B.'),
          ], T('Now each feeling has its face.', 'Сад свако осећање има своје лице.', 'Ahora cada sentimiento tiene su cara.', 'Agora cada sentimento tem a sua cara.')),
        ],
        sucesso: T('Two buttons, two feelings. Simple and easy to find by touch.', 'Два дугмета, два осећања. Једноставно и лако се налази додиром.', 'Dos botones, dos sentimientos. Sencillo y fácil de encontrar al tacto.', 'Dois botões, dois sentimentos. Simples e fácil de encontrar pelo tato.'),
        extensao: T('Ask your partner: which face would they choose for “too much”? Is it the same as yours?', 'Питај партнера: које лице би изабрао за „превише“? Да ли је исто као твоје?', 'Pregunta a tu compañero: ¿qué cara elegiría para «demasiado»? ¿Es la misma que la tuya?', 'Pergunta ao teu par: que cara escolhia para «demais»? É a mesma que a tua?'),
        gambiarra: {
          xml: xml(E.botao('A', seq(I.icone('Happy'))), E.botao('B', seq(I.icone('Happy')))),
          pedido: T('In my museum, people always look happy on the map… even when they pressed “too much”!', 'У мом музеју људи на мапи увек изгледају срећно… чак и кад притисну „превише“!', 'En mi museo, la gente siempre parece feliz en el mapa… ¡incluso cuando pulsa «demasiado»!', 'No meu museu as pessoas aparecem sempre contentes no mapa… mesmo quando carregam em «demais»!'),
        },
      },
    },

    // ------------------------------------------------------------ 2 · Escrever no diário de dados
    {
      titulo: T('Write it down', 'Запиши то', 'Anótalo', 'Apontar'),
      missao: T('Each press is saved in the data table: 1 = feels good, 2 = too much, in the same column.', 'Сваки притисак се чува у табели: 1 = пријатно, 2 = превише, у истој колони.', 'Cada pulsación se guarda en la tabla: 1 = me siento bien, 2 = demasiado, en la misma columna.', 'Cada toque fica guardado na tabela: 1 = sabe bem, 2 = demais, na mesma coluna.'),
      passos: [
        T('A: “log data” with value 1 (keep the face).', 'A: „забележи податке“ са вредношћу 1 (задржи лице).', 'A: «registrar datos» con valor 1 (deja la cara).', 'A: «registar dados» com o valor 1 (mantém a cara).'),
        T('B: “log data” in the same column, value 2.', 'B: „забележи податке“ у истој колони, вредност 2.', 'B: «registrar datos» en la misma columna, valor 2.', 'B: «registar dados» na mesma coluna, valor 2.'),
        T('Test it: press A and B and look at the table.', 'Испробај: притисни A и B и погледај табелу.', 'Pruébalo: pulsa A y B y mira la tabla.', 'Experimenta: carrega no A e no B e olha para a tabela.'),
      ],
      material: MAT,
      novos: ['ic_registar_sentir'],
      teste: 'botao:B',
      ok: mesmaColuna,
      pensar: T('Turning a feeling into a number (1 or 2) is called coding the data. What do we lose when a feeling becomes a number?',
        'Претварање осећања у број (1 или 2) зове се кодирање података. Шта губимо кад осећање постане број?',
        'Convertir un sentimiento en un número (1 o 2) se llama codificar los datos. ¿Qué perdemos cuando un sentimiento se vuelve número?',
        'Transformar um sentimento num número (1 ou 2) chama-se codificar os dados. O que é que perdemos quando um sentimento vira número?'),
      tutor: {
        boasVindas: ['boas_vindas', T('A face disappears. A table remembers. The micro:bit V2 can keep a diary of your visit.', 'Лице нестане. Табела памти. micro:bit V2 може да води дневник твоје посете.', 'Una cara desaparece. Una tabla recuerda. El micro:bit V2 puede llevar un diario de tu visita.', 'Uma cara desaparece. Uma tabela lembra. O micro:bit V2 pode fazer um diário da tua visita.')],
        parecePronto: a => evs(a, 'botao:A').some(e => blocos(e, 'mk_registar').length) && evs(a, 'botao:B').some(e => blocos(e, 'mk_registar').length),
        testar: T('Press A, then B, and look at the table under the micro:bit.', 'Притисни A, па B, и погледај табелу испод micro:bit-а.', 'Pulsa A y luego B, y mira la tabla debajo del micro:bit.', 'Carrega no A, depois no B, e olha para a tabela por baixo do micro:bit.'),
        regras: [
          P.evento('botao:A', T('Where is the “feels good” button?', 'Где је дугме „пријатно“?', '¿Dónde está el botón «me siento bien»?', 'Onde está o botão «sabe bem»?')),
          P.bloco('botao:A', 'mk_registar', T('A shows a face. How can it also write it down?', 'A показује лице. Како може и да га запише?', 'A muestra una cara. ¿Cómo puede también apuntarlo?', 'O A mostra uma cara. Como é que também aponta?')),
          P.evento('botao:B', T('And the “too much” button?', 'А дугме „превише“?', '¿Y el botón «demasiado»?', 'E o botão «demais»?')),
          P.bloco('botao:B', 'mk_registar', T('B shows a face. Does it write anything down?', 'B показује лице. Да ли нешто записује?', 'B muestra una cara. ¿Apunta algo?', 'O B mostra uma cara. Aponta alguma coisa?')),
          P.regra('colunas_diferentes', a => {
            const na = evs(a, 'botao:A').flatMap(e => blocos(e, 'mk_registar').map(p => p.nome)), nb = evs(a, 'botao:B').flatMap(e => blocos(e, 'mk_registar').map(p => p.nome));
            return na.length && nb.length && !na.some(x => nb.includes(x));
          }, [
            ['a_pensar', T('A and B write in different columns. Will the table be easy to read?', 'A и B пишу у различите колоне. Да ли ће табела бити лака за читање?', 'A y B escriben en columnas distintas. ¿Será fácil leer la tabla?', 'O A e o B escrevem em colunas diferentes. A tabela vai ser fácil de ler?')],
            T('One question, one column: write the same column name in both.', 'Једно питање, једна колона: упиши исти назив колоне у оба.', 'Una pregunta, una columna: escribe el mismo nombre en los dos.', 'Uma pergunta, uma coluna: escreve o mesmo nome de coluna nos dois.'),
            T('Copy the column name from A to B. Only the value changes: 1 or 2.', 'Копирај назив колоне из A у B. Мења се само вредност: 1 или 2.', 'Copia el nombre de la columna de A en B. Solo cambia el valor: 1 o 2.', 'Copia o nome da coluna do A para o B. Só muda o valor: 1 ou 2.'),
          ], T('One column, two values. Clean data!', 'Једна колона, две вредности. Уредни подаци!', 'Una columna, dos valores. ¡Datos limpios!', 'Uma coluna, dois valores. Dados arrumados!')),
        ],
        sucesso: T('Every press is saved with the time. Later, the group can compare it with the route.', 'Сваки притисак се чува са временом. Касније група може да га упореди са путањом.', 'Cada pulsación se guarda con la hora. Luego el grupo puede compararla con el recorrido.', 'Cada toque fica guardado com a hora. Depois o grupo pode comparar com o percurso.'),
        extensao: T('Switch on all boards at the same time and write down the clock time (Record sheet C).', 'Укључите све плочице у исто време и запишите време (лист C).', 'Encended todas las placas a la vez y anotad la hora (ficha C).', 'Liguem todas as placas ao mesmo tempo e apontem a hora (ficha C).'),
        gambiarra: {
          xml: xml(E.botao('A', seq(I.icone('Happy'), I.registar(F.s('col_sentir'), 1))), E.botao('B', seq(I.icone('Sad'), I.registar(F.s('col_sentir'), 1)))),
          pedido: T('In my table, every row says 1. Even the “too much” moments! What happened?', 'У мојој табели сваки ред каже 1. Чак и тренуци „превише“! Шта се десило?', 'En mi tabla, todas las filas dicen 1. ¡Incluso los momentos de «demasiado»! ¿Qué ha pasado?', 'Na minha tabela todas as linhas dizem 1. Até os momentos «demais»! O que aconteceu?'),
        },
      },
    },

    // ------------------------------------------------------------ 3 · Quantas vezes foi demais?
    {
      titulo: T('How many times was it too much?', 'Колико пута је било превише?', '¿Cuántas veces fue demasiado?', 'Quantas vezes foi demais?'),
      missao: T('Count the “too much” presses. A+B shows the total.', 'Преброј притиске „превише“. A+B показује укупно.', 'Cuenta las pulsaciones de «demasiado». A+B muestra el total.', 'Conta os toques de «demais». O A+B mostra o total.'),
      passos: [
        T('B: “change counter by 1” (keep the face and the log).', 'B: „промени бројач за 1“ (задржи лице и бележење).', 'B: «cambiar contador por 1» (deja la cara y el registro).', 'B: «mudar contador em 1» (mantém a cara e o registo).'),
        T('A+B: “show number” with the variable counter.', 'A+B: „прикажи број“ са променљивом бројач.', 'A+B: «mostrar número» con la variable contador.', 'A+B: «mostrar número» com a variável contador.'),
        T('Test it: press B three times, then A+B.', 'Испробај: притисни B три пута, па A+B.', 'Pruébalo: pulsa B tres veces y luego A+B.', 'Experimenta: carrega no B três vezes e depois em A+B.'),
      ],
      material: MAT,
      novos: ['mk_botao_AB', 'ic_mudar_contador', 'ic_var_contador'],
      teste: 'botao:AB',
      ok: contaB,
      pensar: T('Teo might press “too much” many times in a noisy room. What could the adult with him do when the number grows?',
        'Тео може много пута да притисне „превише“ у бучној соби. Шта би одрасла особа са њим могла да уради кад број расте?',
        'Teo podría pulsar «demasiado» muchas veces en una sala ruidosa. ¿Qué podría hacer el adulto que va con él cuando el número crece?',
        'O Teo pode carregar em «demais» muitas vezes numa sala barulhenta. O que é que o adulto com ele podia fazer quando o número cresce?'),
      perspetiva: 'teo',
      tutor: {
        boasVindas: ['boas_vindas', T('A counter is a variable that only goes up. Each “too much” adds one.', 'Бројач је променљива која само расте. Свако „превише“ додаје један.', 'Un contador es una variable que solo sube. Cada «demasiado» suma uno.', 'Um contador é uma variável que só sobe. Cada «demais» soma um.')],
        parecePronto: a => evs(a, 'botao:B').some(e => blocos(e, 'mk_var_mudar').length) && evs(a, 'botao:AB').some(e => blocos(e, 'mk_mostrar_numero').some(p => usa(p, 'mk_var'))),
        testar: T('Press B three times, then A+B. Does it say 3?', 'Притисни B три пута, па A+B. Да ли пише 3?', 'Pulsa B tres veces y luego A+B. ¿Dice 3?', 'Carrega no B três vezes e depois em A+B. Diz 3?'),
        regras: [
          P.evento('botao:B', T('Which button is “too much”?', 'Које дугме је „превише“?', '¿Qué botón es «demasiado»?', 'Qual é o botão do «demais»?')),
          P.bloco('botao:B', 'mk_var_mudar', T('Each press should add one. Which red block changes a variable?', 'Сваки притисак треба да дода један. Који црвени блок мења променљиву?', 'Cada pulsación debe sumar uno. ¿Qué bloque rojo cambia una variable?', 'Cada toque deve somar um. Que bloco vermelho muda uma variável?')),
          P.evento('botao:AB', T('Who shows the total? Both buttons together.', 'Ко показује укупно? Оба дугмета заједно.', '¿Quién muestra el total? Los dos botones juntos.', 'Quem mostra o total? Os dois botões juntos.')),
          P.valorEm('botao:AB', 'mk_mostrar_numero', 'mk_var', T('A+B shows a number that never grows. Where is the count kept?', 'A+B показује број који никад не расте. Где се чува број?', 'A+B muestra un número que nunca crece. ¿Dónde se guarda la cuenta?', 'O A+B mostra um número que nunca cresce. Onde é que a conta está guardada?')),
        ],
        sucesso: T('Counting! A number like this can tell a teacher when it is time for a break.', 'Бројиш! Овакав број може да каже наставнику када је време за паузу.', '¡Contando! Un número así puede decirle al profesor cuándo toca un descanso.', 'A contar! Um número destes pode dizer ao professor quando é hora de uma pausa.'),
        extensao: T('Also count the “feels good” presses with another variable.', 'Преброј и притиске „пријатно“ другом променљивом.', 'Cuenta también las pulsaciones de «me siento bien» con otra variable.', 'Conta também os toques de «sabe bem» com outra variável.'),
        gambiarra: {
          xml: xml(E.botao('B', seq(I.icone('Sad'), I.definir('contador', 1))), E.botao('AB', seq(I.numero(X.xVar('contador'))))),
          pedido: T('I pressed “too much” five times… and it says 1! My counter can’t count.', 'Притиснуо сам „превише“ пет пута… а пише 1! Мој бројач не уме да броји.', 'He pulsado «demasiado» cinco veces… ¡y dice 1! Mi contador no sabe contar.', 'Carreguei em «demais» cinco vezes… e diz 1! O meu contador não sabe contar.'),
        },
      },
    },

    // ------------------------------------------------------------ 4 · Sentir + medir
    {
      titulo: T('Feeling + measurement', 'Осећај + мерење', 'Sentir + medir', 'Sentir + medir'),
      missao: T('When you press B, save the feeling AND the sound level of that moment.', 'Кад притиснеш B, сачувај осећај И ниво звука у том тренутку.', 'Cuando pulses B, guarda el sentimiento Y el nivel de sonido de ese momento.', 'Quando carregas no B, guarda o sentimento E o nível de som desse momento.'),
      passos: [
        T('B: keep “log data” for the feeling (value 2).', 'B: задржи „забележи податке“ за осећај (вредност 2).', 'B: deja «registrar datos» del sentimiento (valor 2).', 'B: mantém o «registar dados» do sentimento (valor 2).'),
        T('Add a second “log data” in another column with “sound level”.', 'Додај други „забележи податке“ у другој колони са „ниво звука“.', 'Añade un segundo «registrar datos» en otra columna con «nivel de sonido».', 'Junta um segundo «registar dados» noutra coluna com «nível de som».'),
        T('Test it: sound at 180, press B, look at the table.', 'Испробај: звук на 180, притисни B, погледај табелу.', 'Pruébalo: sonido a 180, pulsa B, mira la tabla.', 'Experimenta: som a 180, carrega no B, olha para a tabela.'),
      ],
      material: MAT,
      novos: ['mk_som_nivel', 'ic_registar_som'],
      teste: 'botao:B',
      ok: sentimentoEMedida,
      perspetiva: 'nina',
      pensar: T('Now the map has two layers: what the sensor heard and what a person felt. Where might they disagree — and who is right?',
        'Сад мапа има два слоја: шта је сензор чуо и шта је особа осетила. Где се могу не слагати — и ко је у праву?',
        'Ahora el mapa tiene dos capas: lo que oyó el sensor y lo que sintió una persona. ¿Dónde pueden no coincidir, y quién tiene razón?',
        'Agora o mapa tem duas camadas: o que o sensor ouviu e o que uma pessoa sentiu. Onde é que podem discordar — e quem tem razão?'),
      tutor: {
        boasVindas: ['boas_vindas', T('This is the heart of the project: putting feelings next to measurements.', 'Ово је срце пројекта: стављамо осећања поред мерења.', 'Este es el corazón del proyecto: poner los sentimientos al lado de las mediciones.', 'Este é o coração do projeto: pôr o que se sente ao lado do que se mede.')],
        parecePronto: a => evs(a, 'botao:B').some(e => blocos(e, 'mk_registar').length >= 2 && blocos(e, 'mk_registar').some(p => usa(p, 'mk_som_nivel'))),
        testar: T('Put the sound at 180 and press B. Two columns in the table?', 'Постави звук на 180 и притисни B. Две колоне у табели?', 'Pon el sonido a 180 y pulsa B. ¿Dos columnas en la tabla?', 'Põe o som a 180 e carrega no B. Duas colunas na tabela?'),
        regras: [
          P.evento('botao:B', T('Which button is “too much”?', 'Које дугме је „превише“?', '¿Qué botón es «demasiado»?', 'Qual é o botão do «demais»?')),
          P.bloco('botao:B', 'mk_registar', T('B should write in the table. Which block?', 'B треба да пише у табелу. Који блок?', 'B debe escribir en la tabla. ¿Qué bloque?', 'O B deve escrever na tabela. Que bloco?')),
          P.regra('sem_som', a => evs(a, 'botao:B').some(e => blocos(e, 'mk_registar').length) && !evs(a, 'botao:B').some(e => blocos(e, 'mk_registar').some(p => usa(p, 'mk_som_nivel'))), [
            ['curiosa', T('The feeling is saved. And the sound at that moment?', 'Осећај је сачуван. А звук у том тренутку?', 'El sentimiento está guardado. ¿Y el sonido de ese momento?', 'O sentimento está guardado. E o som desse momento?')],
            T('Add a second “log data” and put “sound level” in its value.', 'Додај други „забележи податке“ и стави „ниво звука“ у вредност.', 'Añade un segundo «registrar datos» y pon «nivel de sonido» en su valor.', 'Junta um segundo «registar dados» e põe «nível de som» no valor.'),
            T('Under the first “log data”, add another one with a new column name and “sound level”.', 'Испод првог „забележи податке“ додај још један са новим називом колоне и „ниво звука“.', 'Debajo del primer «registrar datos», añade otro con otra columna y «nivel de sonido».', 'Por baixo do primeiro «registar dados», junta outro com outra coluna e «nível de som».'),
          ], T('Feeling and sound, side by side!', 'Осећај и звук, један поред другог!', '¡Sentimiento y sonido, lado a lado!', 'Sentimento e som, lado a lado!')),
        ],
        sucesso: T('Two layers in one row. Back in the workshop room you can look for patterns.', 'Два слоја у једном реду. У радионици можете тражити обрасце.', 'Dos capas en una fila. En el aula del taller podéis buscar patrones.', 'Duas camadas numa linha. Na sala da oficina podem procurar padrões.'),
        extensao: T('Also save the light level. Does “too much” happen more in bright rooms?', 'Сачувај и ниво светлости. Да ли се „превише“ чешће дешава у светлим собама?', 'Guarda también el nivel de luz. ¿Pasa más «demasiado» en salas brillantes?', 'Guarda também o nível de luz. O «demais» acontece mais em salas claras?'),
        gambiarra: {
          xml: xml(E.botao('B', seq(I.icone('Sad'), I.registar(F.s('col_sentir'), 2), I.registar(F.s('col_som'), 2)))),
          pedido: T('My “sound” column always says 2, even in a loud room. Something is wrong…', 'Моја колона „звук“ увек каже 2, чак и у бучној соби. Нешто не ваља…', 'Mi columna «sonido» siempre dice 2, incluso en una sala ruidosa. Algo va mal…', 'A minha coluna «som» diz sempre 2, mesmo numa sala barulhenta. Há qualquer coisa errada…'),
        },
      },
    },

    // ------------------------------------------------------------ 5 · Preciso de uma pausa
    {
      titulo: T('I need a break', 'Треба ми пауза', 'Necesito un descanso', 'Preciso de uma pausa'),
      missao: T('Touching the logo says “I need a break” without words: a symbol on the screen and a light for the adult.', 'Додир логоа каже „треба ми пауза“ без речи: симбол на екрану и светло за одраслу особу.', 'Tocar el logo dice «necesito un descanso» sin palabras: un símbolo en la pantalla y una luz para el adulto.', 'Tocar no logotipo diz «preciso de uma pausa» sem palavras: um símbolo no ecrã e uma luz para o adulto.'),
      passos: [
        T('“on logo pressed”: “show icon” with a calm symbol.', '„при притиску на лого“: „прикажи иконицу“ са мирним симболом.', '«al presionar el logo»: «mostrar ícono» con un símbolo tranquilo.', '«ao logotipo pressionado»: «mostrar ícone» com um símbolo calmo.'),
        T('Then “digital write pin P2 to 1”: an LED switches on.', 'Па „дигитални упис пин P2 на 1“: LED се пали.', 'Luego «escritura digital pin P2 a 1»: se enciende un LED.', 'Depois «gravação digital pin P2 para 1»: acende-se um LED.'),
        T('Test it: touch the golden logo.', 'Испробај: додирни златни лого.', 'Pruébalo: toca el logo dorado.', 'Experimenta: toca no logotipo dourado.'),
      ],
      material: T('micro:bit V2 (+ an LED on P2, optional)', 'micro:bit V2 (+ LED на P2, по жељи)', 'micro:bit V2 (+ un LED en P2, opcional)', 'micro:bit V2 (+ um LED no P2, opcional)'),
      novos: ['mk_logo', 'ic_icone_pausa', 'ic_digital_p2'],
      teste: 'logo',
      ok: pausa,
      perspetiva: 'teo',
      pensar: T('Teo uses picture cards and a tablet to communicate. Is pressing a button “talking”? What other ways of saying “stop” do you know?',
        'Тео користи сличице и таблет за комуникацију. Да ли је притисак на дугме „причање“? Које још начине да кажеш „стани“ знаш?',
        'Teo usa tarjetas con dibujos y una tableta para comunicarse. ¿Pulsar un botón es «hablar»? ¿Qué otras formas de decir «para» conoces?',
        'O Teo usa cartões com imagens e um tablet para comunicar. Carregar num botão é «falar»? Que outras maneiras de dizer «pára» conheces?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Not everyone uses spoken words. A signal can be just as clear — and quieter.', 'Не користе сви изговорене речи. Сигнал може бити једнако јасан — и тиши.', 'No todo el mundo usa palabras habladas. Una señal puede ser igual de clara, y más silenciosa.', 'Nem toda a gente usa palavras faladas. Um sinal pode ser igualmente claro — e mais silencioso.')],
        parecePronto: a => evs(a, 'logo').some(e => blocos(e, 'mk_icone').length && blocos(e, 'mk_digital').some(p => p.v === 1)),
        testar: T('Touch the golden logo. A symbol and a red light?', 'Додирни златни лого. Симбол и црвено светло?', 'Toca el logo dorado. ¿Un símbolo y una luz roja?', 'Toca no logotipo dourado. Um símbolo e uma luz vermelha?'),
        regras: [
          P.evento('logo', T('The signal starts with a touch on the logo. Which pink block is that?', 'Сигнал почиње додиром логоа. Који је то розе блок?', 'La señal empieza al tocar el logo. ¿Qué bloque rosa es?', 'O sinal começa com um toque no logotipo. Que bloco cor-de-rosa é esse?')),
          P.bloco('logo', 'mk_icone', T('What symbol means “break” for you?', 'Који симбол за тебе значи „пауза“?', '¿Qué símbolo significa «descanso» para ti?', 'Que símbolo quer dizer «pausa» para ti?')),
          P.bloco('logo', 'mk_digital', T('The adult might not be looking at the screen. How could a light help?', 'Одрасла особа можда не гледа у екран. Како би светло помогло?', 'Puede que el adulto no esté mirando la pantalla. ¿Cómo ayudaría una luz?', 'O adulto pode não estar a olhar para o ecrã. Como é que uma luz ajudava?')),
          P.regra('led_apagado', a => evs(a, 'logo').some(e => blocos(e, 'mk_digital').length && !blocos(e, 'mk_digital').some(p => p.v === 1)), [
            ['a_pensar', T('The LED block is there… but is it switching the light on or off?', 'Блок за LED је ту… али да ли пали или гаси светло?', 'El bloque del LED está… pero ¿enciende o apaga la luz?', 'O bloco do LED está lá… mas acende ou apaga a luz?')],
            T('1 switches on, 0 switches off.', '1 пали, 0 гаси.', '1 enciende, 0 apaga.', '1 acende, 0 apaga.'),
            T('Write 1 in the value of “digital write”.', 'Упиши 1 у вредност „дигитални упис“.', 'Escribe 1 en el valor de «escritura digital».', 'Escreve 1 no valor da «gravação digital».'),
          ], T('The light switches on!', 'Светло се пали!', '¡La luz se enciende!', 'A luz acende!')),
        ],
        sucesso: T('A silent, clear message. In a museum, a calm signal like this can be easier than finding words.', 'Тиха, јасна порука. У музеју је овакав миран сигнал понекад лакши од тражења речи.', 'Un mensaje silencioso y claro. En un museo, una señal tranquila así puede ser más fácil que buscar palabras.', 'Uma mensagem silenciosa e clara. Num museu, um sinal calmo destes pode ser mais fácil do que encontrar palavras.'),
        extensao: T('Make button A+B switch the LED off again: “break is over”.', 'Нека дугме A+B поново угаси LED: „пауза је готова“.', 'Haz que A+B vuelva a apagar el LED: «se acabó el descanso».', 'Faz o A+B apagar outra vez o LED: «acabou a pausa».'),
        gambiarra: {
          xml: xml(E.logo(seq(I.icone('Asleep'), I.digital('P2', 0)))),
          pedido: T('My break signal shows the symbol, but the light for the adult never switches on!', 'Мој сигнал за паузу показује симбол, али светло за одраслу особу се никад не упали!', 'Mi señal de descanso muestra el símbolo, ¡pero la luz para el adulto nunca se enciende!', 'O meu sinal de pausa mostra o símbolo, mas a luz para o adulto nunca acende!'),
        },
      },
    },

    // ------------------------------------------------------------ 6 · Projeto: três sentimentos
    {
      titulo: T('Project · Three feelings', 'Пројекат · Три осећања', 'Proyecto · Tres sentimientos', 'Projeto · Três sentimentos'),
      missao: T('A = feels good, logo = in between, B = too much. Each one has its face and its value (1, 2, 3) in the same column.', 'A = пријатно, лого = између, B = превише. Свако има своје лице и вредност (1, 2, 3) у истој колони.', 'A = bien, logo = entre medias, B = demasiado. Cada uno tiene su cara y su valor (1, 2, 3) en la misma columna.', 'A = sabe bem, logotipo = mais ou menos, B = demais. Cada um tem a sua cara e o seu valor (1, 2, 3) na mesma coluna.'),
      passos: [
        T('Three events: A, logo, B. Each one: “show icon” + “log data”.', 'Три догађаја: A, лого, B. Сваки: „прикажи иконицу“ + „забележи податке“.', 'Tres eventos: A, logo, B. Cada uno: «mostrar ícono» + «registrar datos».', 'Três eventos: A, logotipo, B. Cada um: «mostrar ícone» + «registar dados».'),
        T('Same column name; values 1, 2 and 3.', 'Исти назив колоне; вредности 1, 2 и 3.', 'Mismo nombre de columna; valores 1, 2 y 3.', 'O mesmo nome de coluna; valores 1, 2 e 3.'),
        T('Three different faces, so you can tell them apart.', 'Три различита лица, да их разликујеш.', 'Tres caras distintas, para distinguirlas.', 'Três caras diferentes, para as distinguires.'),
      ],
      material: MAT,
      novos: ['ic_icone_meio'],
      caixa: ['mk_botao', 'mk_botao_B', 'mk_logo', 'mk_icone', 'ic_registar_sentir'],
      teste: 'logo',
      ok: tres,
      perspetiva: 'ana',
      pensar: T('Two choices (good / too much) or three (with “in between”)? Ana says she often feels “in between” but shows “fine”. Which version tells more of the truth?',
        'Два избора (пријатно / превише) или три (са „између“)? Ана каже да се често осећа „између“, али показује „добро“. Која верзија говори више истине?',
        '¿Dos opciones (bien / demasiado) o tres (con «entre medias»)? Ana dice que a menudo se siente «entre medias» pero aparenta «bien». ¿Qué versión dice más la verdad?',
        'Duas escolhas (sabe bem / demais) ou três (com «mais ou menos»)? A Ana diz que muitas vezes se sente «mais ou menos» mas mostra «está tudo bem». Que versão diz mais a verdade?'),
      tutor: {
        boasVindas: ['boas_vindas', T('Feelings are not just on or off. Let’s give the map a middle option.', 'Осећања нису само укључено или искључено. Хајде да мапи дамо средњу опцију.', 'Los sentimientos no son solo sí o no. Démosle al mapa una opción intermedia.', 'O que sentimos não é só ligado ou desligado. Vamos dar ao mapa uma opção do meio.')],
        parecePronto: a => ['botao:A', 'logo', 'botao:B'].every(k => evs(a, k).some(e => blocos(e, 'mk_icone').length && blocos(e, 'mk_registar').length)),
        testar: T('Press A, touch the logo, press B. Three faces and three values?', 'Притисни A, додирни лого, притисни B. Три лица и три вредности?', 'Pulsa A, toca el logo, pulsa B. ¿Tres caras y tres valores?', 'Carrega no A, toca no logotipo, carrega no B. Três caras e três valores?'),
        regras: [
          P.evento('botao:A', T('Start with “feels good”. Which button?', 'Почни са „пријатно“. Које дугме?', 'Empieza por «me siento bien». ¿Qué botón?', 'Começa pelo «sabe bem». Que botão?')),
          P.evento('logo', T('“In between” needs its own place. What else can you touch on the micro:bit?', '„Између“ треба своје место. Шта још можеш да додирнеш на micro:bit-у?', '«Entre medias» necesita su sitio. ¿Qué más puedes tocar en el micro:bit?', 'O «mais ou menos» precisa do seu sítio. Que mais podes tocar no micro:bit?')),
          P.evento('botao:B', T('And “too much”?', 'А „превише“?', '¿Y «demasiado»?', 'E o «demais»?')),
          P.regra('falta_registo', a => ['botao:A', 'logo', 'botao:B'].some(k => evs(a, k).length && !evs(a, k).some(e => blocos(e, 'mk_registar').length)), [
            ['a_pensar', T('One of your feelings shows a face but is not written down. Which one?', 'Једно од твојих осећања показује лице али није записано. Које?', 'Uno de tus sentimientos muestra una cara pero no se apunta. ¿Cuál?', 'Um dos teus sentimentos mostra uma cara mas não fica apontado. Qual?')],
            T('Each of the three needs a “log data”.', 'Свако од три треба „забележи податке“.', 'Cada uno de los tres necesita un «registrar datos».', 'Cada um dos três precisa de um «registar dados».'),
            T('Add “log data” where it is missing: same column, its own value.', 'Додај „забележи податке“ где недостаје: иста колона, своја вредност.', 'Añade «registrar datos» donde falte: misma columna, su propio valor.', 'Junta «registar dados» onde falta: a mesma coluna, o seu valor.'),
          ], T('All three are saved.', 'Сва три су сачувана.', 'Los tres se guardan.', 'Os três ficam guardados.')),
        ],
        sucesso: T('A three-level feeling scale! Your data now has more shades — like people do.', 'Скала осећања у три нивоа! Твоји подаци сад имају више нијанси — као људи.', '¡Una escala de tres niveles! Tus datos ahora tienen más matices, como las personas.', 'Uma escala de três níveis! Os teus dados têm agora mais tons — como as pessoas.'),
        extensao: T('Add the sound level to each row, like in “Feeling + measurement”.', 'Додај ниво звука у сваки ред, као у „Осећај + мерење“.', 'Añade el nivel de sonido en cada fila, como en «Sentir + medir».', 'Junta o nível de som a cada linha, como em «Sentir + medir».'),
        gambiarra: {
          xml: xml(E.botao('A', seq(I.icone('Happy'), I.registar(F.s('col_sentir'), 1))), E.logo(seq(I.icone('Surprised'), I.registar(F.s('col_sentir'), 3))), E.botao('B', seq(I.icone('Sad'), I.registar(F.s('col_sentir'), 3)))),
          pedido: T('In my table, “in between” and “too much” look the same. I can’t tell them apart!', 'У мојој табели „између“ и „превише“ изгледају исто. Не могу да их разликујем!', 'En mi tabla, «entre medias» y «demasiado» parecen iguales. ¡No los distingo!', 'Na minha tabela, o «mais ou menos» e o «demais» parecem iguais. Não os consigo distinguir!'),
        },
      },
    },
  ];

  F.registarMissao({
    id: 'sentir',
    titulo: T('Feeling buttons', 'Дугмад осећања', 'Botones del sentir', 'Botões do sentir'),
    tema: T('People', 'Људи', 'Personas', 'Pessoas'),
    descricao: T('Record how a place feels: the human layer of the map, the part that sensors cannot measure.', 'Забележи какав је осећај неког места: људски слој мапе, део који сензори не могу да измере.', 'Registra cómo se siente un lugar: la capa humana del mapa, lo que los sensores no pueden medir.', 'Regista como se sente um sítio: a camada humana do mapa, a parte que os sensores não medem.'),
    cor: '#1B6E63',
    perspetiva: 'teo',
    xml: XML,
    livres: [{
      titulo: T('Free project · A signal without words', 'Слободни пројекат · Сигнал без речи', 'Proyecto libre · Una señal sin palabras', 'Projeto livre · Um sinal sem palavras'),
      missao: T('Invent a way to say something important without words: a symbol, a light, a vibration…', 'Измисли начин да кажеш нешто важно без речи: симбол, светло, вибрацију…', 'Inventa una forma de decir algo importante sin palabras: un símbolo, una luz, una vibración…', 'Inventa uma maneira de dizer uma coisa importante sem palavras: um símbolo, uma luz, uma vibração…'),
    }],
    niveis: [{ nome: T('Level 1 · Feel', 'Ниво 1 · Осети', 'Nivel 1 · Sentir', 'Nível 1 · Sentir'), desafios: D }],
  });
})();
