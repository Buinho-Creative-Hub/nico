/* IC Sensing Lab — Perspetivas: crianças fictícias que contam, na primeira pessoa, como sentem um lugar.
 *
 * Para quê: o Invisible Cartographies põe a experiência vivida das pessoas neurodivergentes no centro. Estas vozes
 * ajudam crianças neurotípicas e educadores (escolas, museus) a perceber que o mesmo sítio pode ser calmo para uma
 * pessoa e demasiado para outra — e que isso não é «mau comportamento».
 *
 * Como foram escritas: personagens compostas, sem diagnósticos inventados para crianças reais, a partir de relatos
 * publicados por pessoas autistas, com PHDA, dislexia e deficiência visual (sobrecarga sensorial, masking,
 * hipo/hipersensibilidade, comunicação aumentativa). Linguagem «identity-first» na voz das próprias crianças
 * («sou autista»), como preferem muitas pessoas autistas. Evitam o tom de pena e o «super-poder».
 * A REVER com pessoas com experiência vivida (escola Veljko, artistas em residência do IC, famílias) antes de
 * publicar como material final — princípio do projeto: «nada sobre nós sem nós».
 *
 * Cada perspetiva: { nome, idade, cor, retrato (SVG), texto, pergunta }. Um desafio pode trocar o texto com
 * perspetivaTexto / perspetivaPergunta; a missão escolhe uma por defeito com «perspetiva».
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const { T } = F.IC;
  // retrato abstrato: inicial num círculo com curvas de nível (não desenhamos crianças)
  const retrato = (letra, cor) => `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="${cor}"/>` +
    [0, 1, 2].map(i => `<ellipse cx="${30 - i * 2}" cy="${31 + i}" rx="${8 + i * 6}" ry="${5 + i * 4}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.6"/>`).join('') +
    `<text x="24" y="31" text-anchor="middle" font-family="Roboto Slab, serif" font-weight="700" font-size="21" fill="#fff">${letra}</text></svg>`;

  const P = {
    ana: {
      nome: T('Ana', 'Ана', 'Ana', 'Ana'), idade: 10, cor: '#3BA6DC',
      texto: T(
        'I’m autistic. At school I try hard to look fine all day, like everyone else. But I hear the lamps buzzing, chairs scraping and three conversations — all at the same volume, all at once. When I get home I’m so tired I can’t talk. In a museum, the big hall with the echo is the hardest. With my ear defenders I can stay longer.',
        'Ја сам аутистична. У школи се цео дан трудим да изгледам добро, као сви остали. Али чујем зујање светала, шкрипу столица и три разговора — све једнако гласно, све одједном. Кад стигнем кући, толико сам уморна да не могу да причам. У музеју ми је најтеже у великој сали са одјеком. Са заштитом за уши могу дуже да останем.',
        'Soy autista. En el colegio me esfuerzo todo el día por parecer que estoy bien, como los demás. Pero oigo el zumbido de las lámparas, las sillas arrastrándose y tres conversaciones, todo igual de fuerte y a la vez. Cuando llego a casa estoy tan cansada que no puedo hablar. En un museo, la sala grande con eco es lo más difícil. Con mis protectores auditivos aguanto más.',
        'Sou autista. Na escola esforço-me o dia todo para parecer que está tudo bem, como os outros. Mas ouço as lâmpadas a zumbir, as cadeiras a arrastar e três conversas — tudo ao mesmo volume, tudo ao mesmo tempo. Quando chego a casa estou tão cansada que não consigo falar. Num museu, a sala grande com eco é a mais difícil. Com os meus abafadores consigo ficar mais tempo.'),
      pergunta: T('Which sounds around you do you usually miss? What would make this room easier for Ana?',
        'Које звуке око себе обично не примећујеш? Шта би ову собу учинило лакшом за Ану?',
        '¿Qué sonidos a tu alrededor no sueles notar? ¿Qué haría esta sala más fácil para Ana?',
        'Que sons à tua volta costumas não notar? O que tornaria esta sala mais fácil para a Ana?'),
    },
    luka: {
      nome: T('Luka', 'Лука', 'Luka', 'Luka'), idade: 9, cor: '#E8624A',
      texto: T(
        'I have ADHD. My eyes jump to everything: the screens, the blinking signs, people walking past. In a busy room I can’t follow what the guide says, even when I really want to. Moving helps me think. A route I can walk, a bench to sit on and fewer things flashing at the same time help me a lot.',
        'Имам ADHD. Очи ми скачу на све: екране, трепћуће натписе, људе који пролазе. У препуној соби не могу да пратим водича, чак и кад то стварно желим. Кретање ми помаже да мислим. Пут којим могу да ходам, клупа за седење и мање ствари које трепћу у исто време много ми помажу.',
        'Tengo TDAH. Mis ojos saltan a todo: las pantallas, los carteles que parpadean, la gente que pasa. En una sala llena no puedo seguir al guía, aunque quiera de verdad. Moverme me ayuda a pensar. Un recorrido que pueda andar, un banco para sentarme y menos cosas parpadeando a la vez me ayudan mucho.',
        'Tenho PHDA. Os meus olhos saltam para tudo: os ecrãs, os letreiros a piscar, as pessoas a passar. Numa sala cheia não consigo acompanhar o guia, mesmo quando quero muito. Mexer-me ajuda-me a pensar. Um percurso que possa andar, um banco para me sentar e menos coisas a piscar ao mesmo tempo ajudam-me muito.'),
      pergunta: T('What in this room grabs your attention without you wanting it to?',
        'Шта у овој соби привлачи твоју пажњу а да ти то не желиш?',
        '¿Qué hay en esta sala que te llama la atención sin que tú quieras?',
        'O que há nesta sala que te chama a atenção sem tu quereres?'),
    },
    mira: {
      nome: T('Mira', 'Мира', 'Mira', 'Mira'), idade: 11, cor: '#1B6E63',
      texto: T(
        'I’m blind. I don’t see rooms — I hear them. A big room with stone walls sounds like a cave; a small room with a carpet sounds soft. If everyone talks at once, I lose my map. I like it when someone tells me what is in front of me, and when I’m allowed to touch it.',
        'Слепа сам. Собе не видим — ја их чујем. Велика соба са каменим зидовима звучи као пећина; мала соба са тепихом звучи меко. Ако сви причају одједном, изгубим своју мапу. Волим кад ми неко каже шта је испред мене и кад смем да то додирнем.',
        'Soy ciega. No veo las salas: las oigo. Una sala grande con paredes de piedra suena como una cueva; una pequeña con alfombra suena suave. Si todos hablan a la vez, pierdo mi mapa. Me gusta que me digan qué tengo delante y que me dejen tocarlo.',
        'Sou cega. Não vejo as salas — ouço-as. Uma sala grande com paredes de pedra soa como uma gruta; uma pequena com tapete soa macia. Se toda a gente fala ao mesmo tempo, perco o meu mapa. Gosto quando me dizem o que tenho à frente e quando posso tocar.'),
      pergunta: T('If you closed your eyes here, what would tell you where you are?',
        'Кад би овде затворио очи, шта би ти рекло где си?',
        'Si cerraras los ojos aquí, ¿qué te diría dónde estás?',
        'Se fechasses os olhos aqui, o que é que te diria onde estás?'),
    },
    teo: {
      nome: T('Teo', 'Тео', 'Teo', 'Teo'), idade: 8, cor: '#7A5AA6',
      texto: T(
        'I’m autistic too, but not like Ana. I like strong things: pressing hard, spinning, loud music that I choose. Sounds I don’t choose — a sudden alarm, a hand dryer — are too much. I don’t always use spoken words. I use my tablet and picture cards to say what I need, like “break” or “too loud”.',
        'И ја сам аутистичан, али не као Ана. Волим јаке ствари: снажан притисак, вртење, гласну музику коју сам изабрао. Звуци које не бирам — изненадни аларм, сушач за руке — су превише. Не користим увек изговорене речи. Користим таблет и сличице да кажем шта ми треба, на пример „пауза“ или „прегласно“.',
        'Yo también soy autista, pero no como Ana. Me gustan las cosas fuertes: apretar, girar, música alta que yo elijo. Los sonidos que no elijo —una alarma de repente, un secamanos— son demasiado. No siempre uso palabras habladas. Uso mi tableta y tarjetas con dibujos para decir lo que necesito, como «descanso» o «muy alto».',
        'Eu também sou autista, mas não como a Ana. Gosto de coisas fortes: apertar, rodar, música alta que eu escolho. Os sons que não escolho — um alarme de repente, um secador de mãos — são demais. Nem sempre uso palavras faladas. Uso o meu tablet e cartões com imagens para dizer o que preciso, como «pausa» ou «muito alto».'),
      pergunta: T('How could someone tell you they need a break without using words?',
        'Како би неко могао да ти каже да му треба пауза без речи?',
        '¿Cómo podría alguien decirte que necesita un descanso sin usar palabras?',
        'Como é que alguém te podia dizer que precisa de uma pausa sem usar palavras?'),
    },
    dani: {
      nome: T('Dani', 'Дани', 'Dani', 'Dani'), idade: 12, cor: '#B0802A',
      texto: T(
        'I have dyslexia. Long museum labels with tiny letters move around when I’m tired, and I give up reading. Pictures, symbols and someone reading out loud help me. And I like knowing the plan: how long, which rooms, where the exit is. Then I can enjoy it instead of worrying.',
        'Имам дислексију. Дугачки натписи у музеју са ситним словима као да се померају кад сам уморан, па одустанем од читања. Помажу ми слике, симболи и неко ко чита наглас. И волим да знам план: колико траје, које собе, где је излаз. Онда могу да уживам уместо да бринем.',
        'Tengo dislexia. Las cartelas largas de los museos con letra pequeña se mueven cuando estoy cansado y dejo de leer. Me ayudan las imágenes, los símbolos y que alguien lea en voz alta. Y me gusta saber el plan: cuánto dura, qué salas, dónde está la salida. Así lo disfruto en vez de preocuparme.',
        'Tenho dislexia. As legendas compridas dos museus, com letra pequenina, mexem-se quando estou cansado e desisto de ler. Ajudam-me imagens, símbolos e alguém a ler em voz alta. E gosto de saber o plano: quanto tempo, que salas, onde é a saída. Assim aproveito em vez de ficar preocupado.'),
      pergunta: T('What could a museum show with a symbol instead of a long text?',
        'Шта би музеј могао да покаже симболом уместо дугачким текстом?',
        '¿Qué podría mostrar un museo con un símbolo en lugar de un texto largo?',
        'O que é que um museu podia mostrar com um símbolo em vez de um texto comprido?'),
    },
    nina: {
      nome: T('Nina', 'Нина', 'Nina', 'Nina'), idade: 11, cor: '#4E6A8F',
      texto: T(
        'I’m Mira’s friend. I never noticed the hum of the fridge until Mira asked about it — now I hear it everywhere! When we measured our school, the library was quiet on the sensor but loud for Mira, because of the echo. Now we plan our routes together, and I tell her what I see.',
        'Ја сам Мирина другарица. Никад нисам примећивала зујање фрижидера док ме Мира није питала за њега — сад га чујем свуда! Кад смо мерили нашу школу, библиотека је на сензору била тиха, али за Миру гласна, због одјека. Сада заједно планирамо путеве, а ја јој кажем шта видим.',
        'Soy amiga de Mira. Nunca había notado el zumbido de la nevera hasta que Mira me preguntó, ¡ahora lo oigo en todas partes! Cuando medimos el colegio, la biblioteca era tranquila para el sensor pero ruidosa para Mira, por el eco. Ahora planeamos juntas los recorridos y yo le cuento lo que veo.',
        'Sou amiga da Mira. Nunca tinha reparado no zumbido do frigorífico até a Mira me perguntar — agora ouço-o em todo o lado! Quando medimos a escola, a biblioteca era calma para o sensor mas barulhenta para a Mira, por causa do eco. Agora planeamos os percursos juntas e eu digo-lhe o que vejo.'),
      pergunta: T('Can a place be quiet for the sensor and still be hard for a person? Why?',
        'Може ли место бити тихо за сензор, а ипак тешко за особу? Зашто?',
        '¿Puede un lugar ser tranquilo para el sensor y aun así difícil para una persona? ¿Por qué?',
        'Um sítio pode ser calmo para o sensor e mesmo assim difícil para uma pessoa? Porquê?'),
    },
  };
  for (const [id, p] of Object.entries(P)) {
    F.localizar(p);
    p.id = id;
    p.retrato = retrato(p.nome[0], p.cor);
  }
  F.PERSPETIVAS = P;
})();
