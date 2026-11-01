/* Nico · Percurso 4.º ano — conteúdo (piloto na EB de Messejana, 2026/27).
 *
 * Objetivo: preparar as crianças do 4.º ano para as provas digitais de monitorização (ModA: Português e Matemática),
 * ao mesmo tempo que aprendem pensamento computacional e ganham à-vontade com o rato e o teclado.
 * O Estudo do Meio entra como CONTEXTO (temas dos textos, dos problemas e dos mapas), porque deixou de ter prova própria.
 *
 * 6 sessões (cerca de 60 min cada) × 4 estações: rato e teclado · programar · Matemática · Português.
 * No fim, uma prova-ensaio com navegação entre questões, «marcar para rever», tempo e entrega.
 *
 * Tipos de atividade: ver js/percurso/rato-teclado.js (alvos, separar, duplo, rolar, teclado), js/percurso/caminho.js
 * (caminho) e js/percurso/itens.js (escolha, varias, vf, ordenar, arrastar, curta, extensa, palavras).
 * Cada atividade tem um id estável (o progresso guarda-se por id — não mudar ids de atividades já usadas).
 * Programas abreviados dos caminhos (solucao/inicial): [['E', 2], ['ap'], ['rep', 3, [...]], ['se', 'm3', [...]]].
 */
(function () {
  'use strict';
  const F = window.Faisca;

  // ------------------------------------------------------------ pistas que se repetem
  const PC_SEQ = ['Conta as casas entre o Nico e a bandeira. Quantas são, e para que lado?',
    'Norte é para cima, sul para baixo, este para a direita e oeste para a esquerda — como na rosa dos ventos.',
    'Arrasta um bloco «andar» para dentro do «ao começar» e muda o número de casas.'];
  const PC_REP = ['Há alguma parte do caminho que se repete sempre igual?',
    'Encontra o bocadinho que se repete e conta quantas vezes aparece.',
    'Põe esse bocadinho dentro de um «repetir» e escreve no número quantas vezes se repete.'];
  const PC_SE = ['O Nico tem de apanhar só alguns números. Como é que ele pode decidir em cada casa?',
    'O bloco «se … então» só faz o que está lá dentro quando a condição é verdadeira.',
    'Dentro do «repetir»: andar 1 casa, depois «se o número aqui é …» então «apanhar».'];
  const LEITURA = ['Volta ao texto da esquerda: em que parágrafo se fala disto?',
    'Procura no texto as palavras da pergunta. A resposta está perto delas.'];

  // ------------------------------------------------------------ figuras
  const BARRA_8 = (() => {
    let g = '';
    for (let i = 0; i < 8; i++) g += `<rect x="${10 + i * 60}" y="10" width="60" height="70" fill="${i < 3 ? '#7b2fd1' : '#fff'}" stroke="#111" stroke-width="2"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 90" width="500">${g}</svg>`;
  })();
  const RETANGULO = (() => {
    let g = '';
    for (let c = 0; c <= 10; c++) g += `<line x1="${10 + c * 30}" x2="${10 + c * 30}" y1="10" y2="220" stroke="#cfcfcf"/>`;
    for (let r = 0; r <= 7; r++) g += `<line y1="${10 + r * 30}" y2="${10 + r * 30}" x1="10" x2="310" stroke="#cfcfcf"/>`;
    g += '<rect x="70" y="70" width="180" height="120" fill="#e9dcfb" stroke="#7b2fd1" stroke-width="4"/>';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 230" width="320">${g}</svg>`;
  })();
  const ANGULOS = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 190" width="600" font-family="Asap, sans-serif" font-weight="700" font-size="22">' +
    '<g stroke="#111" stroke-width="4" stroke-linecap="round" fill="none">' +
    '<path d="M40 150H170M40 150V30"/><path d="M40 130h20v20" stroke-width="2"/>' +
    '<path d="M240 150H380M240 150L340 50"/><path d="M275 150A35 35 0 0 0 265 125" stroke-width="2"/>' +
    '<path d="M470 150H590M470 150L400 60"/><path d="M505 150A35 35 0 0 0 449 123" stroke-width="2"/></g>' +
    '<text x="95" y="182">A</text><text x="300" y="182">B</text><text x="510" y="182">C</text></svg>';
  const AGUA = { tipo: 'barras', titulo: 'Água gasta por uma família num dia (litros)', dados: [['Duche', 60], ['Cozinha', 25], ['Rega', 40], ['Sanita', 35], ['Roupa', 20]], max: 70, passo: 10, cor: '#1e90ff', eixo: 'litros' };
  const LINCES = { tipo: 'barras', titulo: 'Linces libertados por ano (dados inventados para treino)', dados: [['2020', 8], ['2021', 12], ['2022', 10], ['2023', 14]], max: 16, passo: 2, cor: '#c88a3d', eixo: 'linces' };

  // ================================================================================================= SESSÕES
  const sessoes = [
    // -------------------------------------------------------------------------------------------- Missão-piloto (revisão do Ambrósio)
    // A Mostra de Invenções: a ribeira levou a ponte do caminho para a horta. Construir, investigar, escrever e programar
    // são momentos da mesma missão; a ponte construída fica no mapa.
    {
      id: 'm1', rotulo: 'Missão 1', insignia: 'Construtor de pontes', titulo: 'A ponte da ribeira',
      resumo: 'A ribeira levou a ponte: constrói-a com frações, descobre porque a rega falhou, escreve à Dona Aurora e programa a rega.',
      estacoes: [
        { area: 'maos', titulo: 'Aquecer as mãos', atividades: [
          { id: 'm1-r1', tipo: 'alvos', titulo: 'Recolher a cortiça', pergunta: 'A cortiça para a ponte está a boiar na ribeira. Recolhe os 8 pedaços (clica em cada um).', n: 8, tamanho: [110, 70], objeto: { varios: 'Pedaços de cortiça', um: 'Pedaço de cortiça', estilo: 'cortica' }, cena: 'ribeira',
            boasVindas: 'Aquecimento rápido: precisamos de cortiça para a ponte! Clica com calma, não há pressa.',
            pistas: ['Leva a setinha até ao pedaço de cortiça.', 'Um clique com o botão da esquerda.', 'Não há tempo-limite: devagar também conta.'] },
        ] },
        { area: 'prog', titulo: 'Programar', atividades: [
          { id: 'm1-p1', tipo: 'caminho', prever: true, titulo: 'Onde vai parar?', missao: 'O Nico tem de levar a cortiça até à ribeira. Primeiro prevê onde o programa o deixa; depois corrige-o.',
            cols: 6, rows: 4, inicio: [0, 3], meta: [5, 0], nomeMeta: 'Ribeira', obst: [[2, 2, 'arvore'], [4, 2, 'arvore'], [5, 2, 'pedra']],
            inicial: [['N', 2], ['E', 3]], blocos: ['andarN', 'andarS', 'andarE', 'andarO'], maxBlocos: 2, solucao: [['N', 3], ['E', 5]],
            pistas: ['Segue o programa com o dedo: 2 casas para norte, depois 3 para este. Onde fica?', 'A ribeira está na fila de cima, na última coluna.', 'Muda os números: norte 3 e este 5.'] },
          { id: 'm1-p2', tipo: 'caminho', titulo: 'A rega dos canteiros', missao: 'O programa rega todos os canteiros, mas só os de número par estão secos. Usa 👣 Um passo para ver o que acontece e corrige-o.',
            porque: 'Só os canteiros com número par estão secos.',
            cols: 7, rows: 2, inicio: [0, 0], meta: null, fundo: '#d9c49a',
            itens: [[1, 0, '6'], [2, 0, '9', false], [3, 0, '4'], [4, 0, '7', false], [5, 0, '10'], [6, 0, '3', false]],
            acao: 'regar', inicial: [['rep', 6, [['E', 1], ['ap']]]], blocos: ['andarE', 'apanhar', 'repetir', 'se', 'aqui'], maxBlocos: 5,
            solucao: [['rep', 6, [['E', 1], ['se', 'par', [['ap']]]]]],
            boasVindas: 'Carrega em 👣 Um passo várias vezes: vês o bloco que está a correr a acender e quais canteiros eu rego.',
            pistas: ['Vai passo a passo: em que canteiro é que eu rego sem dever?', 'Antes de regar, o Nico tem de perguntar se o número é par.', 'Dentro do repetir: andar 1 → se «o número aqui é par» então «regar».'] },
        ] },
        { area: 'mat', titulo: 'Construir a ponte', atividades: [
          { id: 'm1-pt1', tipo: 'ponte', transforma: 'ponte', titulo: 'Pontes de cortiça · 1', pergunta: 'A ponte tem de medir 1 inteiro. Junta peças de cortiça até tapar o vão.',
            alvo: '1', pecas: ['1/2', '1/4', '1/3', '1/4', '1/8'],
            pistas: ['Começa pela peça maior. Quanto falta depois?', 'Meio mais um quarto ainda não chega: falta outro quarto.', '1/2 + 1/4 + 1/4 = 1.'] },
          { id: 'm1-pt2', tipo: 'ponte', titulo: 'Pontes de cortiça · 2', pergunta: 'Outra ponte de 1 inteiro, mas agora com exatamente 3 peças.', alvo: '1', restricao: { pecas: 3 },
            pecas: ['1/2', '1/3', '3/4', '1/6', '1/4', '1/4'],
            pistas: ['Há mais do que uma maneira de fazer 1 com 3 peças.', 'Um terço e um sexto juntos fazem metade.', '1/2 + 1/3 + 1/6 = 1, ou 1/2 + 1/4 + 1/4 = 1.'] },
          { id: 'm1-pt3', tipo: 'ponte', titulo: 'Pontes de cortiça · 3', pergunta: 'A ponte grande mede 1,5 m. Constrói-a com 3 peças.', alvo: '1,5', unidade: 'm', restricao: { pecas: 3 },
            pecas: ['1', '0,75', '0,5', '0,25', '0,2'],
            pistas: ['1,5 m é um metro e meio.', 'Experimenta com 0,75: quanto falta para 1,5?', '0,75 + 0,5 + 0,25 = 1,5.'] },
          { id: 'm1-tr1', tipo: 'escolha', titulo: 'E sem a ponte?', pergunta: 'A primeira ponte tinha 1/2 + 1/4 + 1/4. Que parte da ponte fazem as duas peças de 1/4 juntas?',
            opcoes: ['1/4', '2/4, ou seja, metade', '1/8', '2/8'], certa: 1, explica: '1/4 + 1/4 = 2/4, que é o mesmo que 1/2: metade da ponte.',
            pistas: ['Junta os dois quartos: quantos quartos são?', 'Dois quartos de uma coisa são metade dela.'] },
        ] },
        { area: 'port', titulo: 'Investigar e escrever', atividades: [
          { id: 'm1-d1', tipo: 'detetive', titulo: 'Detetive da oficina', pedido: 'A Dona Aurora diz que a água da rega deixou de chegar ao canteiro 3 da horta da escola. Os outros canteiros estão bem regados. Porquê?',
            manual: { titulo: 'Manual da rega da horta', seccoes: [
              { titulo: 'Como funciona', frases: ['A água sai do depósito e passa pela mangueira principal.', 'Da mangueira principal saem tubos finos, um para cada canteiro.', 'Cada canteiro tem a sua torneira pequena.'] },
              { titulo: 'Avarias frequentes', frases: ['Se nenhum canteiro recebe água, o depósito pode estar vazio.', 'Quando um tubo está esmagado ou dobrado, a água deixa de passar para a frente.', 'Uma torneira fechada também impede a rega, mas só desse canteiro.'] },
              { titulo: 'Registo da semana', frases: ['Segunda-feira: depósito cheio e torneiras abertas.', 'Terça-feira: o trator da junta passou por cima do tubo do canteiro 3.', 'Quarta-feira: as couves do canteiro 1 cresceram muito.'] },
            ] },
            pistas: ['2.2', '3.2'], ajudas: ['O problema é só no canteiro 3. Procura frases que falem só de um canteiro.', 'Há uma frase sobre tubos esmagados nas avarias frequentes.', 'E no registo da semana, o que aconteceu na terça-feira?'], porquePistas: { '2.2': 'Isso! Um tubo esmagado não deixa a água passar.', '3.2': 'Boa! O trator esmagou o tubo do canteiro 3.' },
            dicaPista: 'Essa frase é verdade, mas explica porque é que SÓ o canteiro 3 ficou sem água?',
            passos: ['Fechar a torneira do depósito.', 'Encontrar o tubo esmagado do canteiro 3.', 'Cortar o bocado estragado e pôr uma peça nova.', 'Abrir a torneira e ver se a água chega ao canteiro 3.'],
            explicar: 'Escreve no relatório o que estava avariado e como o descobriste.',
            boasVindas: 'Temos um caso! Lê o manual à esquerda — rola até ao fim — e encontra as duas frases que explicam a avaria.' },
          { id: 'm1-c1', tipo: 'correio', titulo: 'Correio do Nico', para: 'Dona Aurora, da horta', respostaDe: 'da Dona Aurora',
            copia: 'A rega do canteiro 3 já está reparada.',
            rascunho: 'amanha vamos a horta ver as couves', certo: ['Amanhã vamos à horta ver as couves.', 'Amanhã vamos à horta ver as couves!'],
            dicaEdicao: 'Falta: maiúscula no início, o til de «amanhã», o acento de «à» e um ponto final.',
            propria: { pergunta: 'Agora escreve tu à Dona Aurora: convida-a para a Mostra de Invenções do Nico. Diz o dia e o que vai haver.', min: 15, palavrasChave: ['Mostra'] },
            resposta: 'Que boa notícia, Nico! As couves agradecem. Lá estarei na Mostra, com um cesto de laranjas para todos. — Aurora',
            pistas: ['Lê cada mensagem antes de escrever.', 'Os acentos escrevem-se antes da letra: ~ e depois a dá «ã».', 'Uma mensagem começa com maiúscula e acaba com ponto final.'] },
          { id: 'm1-q1', tipo: 'curta', titulo: 'Momento-prova', pergunta: 'Na frase «O trator passou por cima do tubo», qual é a forma verbal?', aceitar: ['passou'], largura: '200px',
            explica: '«Passou» é a forma verbal (do verbo passar, no pretérito perfeito).', pistas: ['A forma verbal diz o que aconteceu.', 'O que fez o trator?'] },
        ] },
      ],
    },
    // -------------------------------------------------------------------------------------------- 1
    {
      id: 's1', insignia: 'Orientador de Messejana', titulo: 'Norte, sul, este e oeste', resumo: 'Orientar-se pelo Sol e pela rosa dos ventos · números grandes · nomes próprios.',
      estacoes: [
        { area: 'maos', titulo: 'Rato e teclado', atividades: [
          { id: 's1-r1', tipo: 'alvos', titulo: 'Apanha as bolotas', n: 12, tamanho: [100, 60],
            pistas: ['Olha primeiro para a bolota, depois leva a setinha até ela.', 'Mexe o rato devagar: a setinha anda tanto como a tua mão.', 'Quando a setinha estiver em cima da bolota, carrega uma vez no botão da esquerda.'] },
          { id: 's1-r2', tipo: 'teclado', titulo: 'As teclas de casa', linhas: ['asdf jklç', 'fdsa çlkj', 'sala', 'fala', 'sala da fada', 'a fada fala'],
            boasVindas: 'Põe os dedos nas «teclas de casa»: A S D F com a mão esquerda, J K L Ç com a direita. Os indicadores sentem um risquinho no F e no J.',
            pistas: ['Os teus dedos estão nas teclas de casa?', 'Cada dedo tem as suas teclas — vê as cores por baixo das teclas no ecrã.', 'A tecla amarela no teclado do ecrã é a próxima. Procura-a no teu teclado.'] },
          { id: 's1-j3', tipo: 'rebentar', titulo: 'Rebenta os balões', pergunta: 'Escreve a palavra de um balão para o rebentar. Só com as teclas de casa!',
            palavras: ['sala', 'fada', 'asas', 'falas', 'salada', 'sal'], pistas: ['Os dedos nas teclas de casa: A S D F e J K L Ç.', 'Escreve a palavra inteira, sem espaços.', 'Se te enganares, apaga com ⌫.'] },
        ] },
        { area: 'prog', titulo: 'Programar', atividades: [
          { id: 's1-p1', tipo: 'caminho', titulo: 'A caminho da escola', missao: 'Leva o Nico até à escola. A escola fica 3 casas para este.',
            cols: 6, rows: 4, inicio: [1, 2], meta: [4, 2], nomeMeta: 'Escola', obst: [[0, 0, 'arvore'], [5, 3, 'arvore'], [2, 0, 'casa']],
            blocos: ['andarE', 'andarN', 'andarS', 'andarO'], maxBlocos: 1, solucao: [['E', 3]], pistas: PC_SEQ,
            boasVindas: 'Para onde fica o este? Olha para a rosa dos ventos ao lado do mapa.' },
          { id: 's1-p2', tipo: 'caminho', titulo: 'Primeiro norte, depois este', missao: 'Os sobreiros tapam o caminho a direito. Vai primeiro para norte e depois para este até à escola.',
            cols: 5, rows: 4, inicio: [0, 3], meta: [3, 0], nomeMeta: 'Escola', obst: [[1, 3, 'arvore'], [2, 3, 'arvore'], [3, 3, 'pedra'], [1, 2, 'arvore'], [2, 1, 'pedra']],
            blocos: ['andarN', 'andarS', 'andarE', 'andarO'], maxBlocos: 2, solucao: [['N', 3], ['E', 3]], pistas: PC_SEQ },
          { id: 's1-p3', tipo: 'caminho', titulo: 'Pelo meio do montado', missao: 'Atravessa o montado até ao FabLab sem bater em nenhum sobreiro.',
            cols: 7, rows: 5, inicio: [0, 0], meta: [6, 4], nomeMeta: 'FabLab',
            obst: [[1, 1, 'arvore'], [1, 2, 'arvore'], [1, 3, 'arvore'], [3, 0, 'arvore'], [3, 1, 'arvore'], [3, 3, 'arvore'], [3, 4, 'arvore'], [5, 1, 'arvore'], [5, 2, 'arvore'], [5, 3, 'arvore'], [5, 4, 'arvore']],
            blocos: ['andarN', 'andarS', 'andarE', 'andarO'], maxBlocos: 7, solucao: [['S', 4], ['E', 2], ['N', 2], ['E', 2], ['N', 2], ['E', 2], ['S', 4]],
            pistas: ['Faz o caminho com o dedo no ecrã antes de programar.', 'Divide o caminho em pedaços: cada pedaço a direito é um bloco «andar».', 'Começa: andar 4 casas para sul. E depois?'] },
        ] },
        { area: 'mat', titulo: 'Matemática', atividades: [
          { id: 's1-m1', tipo: 'escolha', pergunta: 'A biblioteca da escola tem 23 405 livros. Como se lê este número?',
            opcoes: ['Vinte e três mil quatrocentos e cinco', 'Vinte e três mil quatrocentos e cinquenta', 'Dois mil trezentos e quarenta e cinco', 'Vinte e três mil e quarenta e cinco'], certa: 0,
            pistas: ['Separa o número em dois: 23 | 405.', 'Primeiro lê-se o 23 e diz-se «mil»; depois lê-se o 405.', '405 lê-se «quatrocentos e cinco».'] },
          { id: 's1-m2', tipo: 'curta', pergunta: 'Escreve com algarismos: cento e quatro mil e sessenta.', numero: 104060, largura: '220px',
            explica: 'Cento e quatro mil = 104 000; mais sessenta = 104 060.',
            pistas: ['Quantos milhares? «Cento e quatro mil».', 'Escreve 104 e depois três algarismos para o resto.', 'Sessenta nas três últimas casas fica 060.'] },
          { id: 's1-j1', tipo: 'ligar', modo: 'sequencia', figura: 'casa', titulo: 'Liga os pontos', pergunta: 'Liga os números do menor para o maior e descobre o desenho.',
            valores: ['9 870', '10 078', '10 780', '17 008', '38 507', '70 108'], dicaErro: 'Compara os números: quantos algarismos têm? Qual é o menor que ainda não ligaste?',
            pistas: ['Começa no ponto amarelo: é o número mais pequeno.', 'Com o mesmo número de algarismos, compara da esquerda para a direita.', 'O número com 4 algarismos é o primeiro; o 70 108 é o último.'] },
          { id: 's1-j2', tipo: 'plataforma', tema: 'messejana', titulo: 'Corrida dos números grandes', pergunta: 'Apanha só os números maiores do que 50 000!',
            fichas: [['52 300', true], ['49 999', false], ['50 001', true], ['5 000', false], ['105 000', true], ['45 500', false]], porque: 'Compara com 50 000: tem de ser maior.',
            pistas: ['Antes de saltar, lê o número da bolota.', '50 000 são cinquenta mil. 49 999 é um bocadinho menos!', '5 000 são só cinco mil.'] },
          { id: 's1-m4', tipo: 'escolha', pergunta: 'No número 456 302, qual é o valor do algarismo 6?', opcoes: ['6', '600', '6 000', '60 000'], certa: 2,
            explica: 'O 6 está na casa das unidades de milhar: vale 6 000.',
            pistas: ['Em que casa está o 6? Conta a partir da direita: unidades, dezenas, centenas…', 'Depois das centenas vêm as unidades de milhar.', 'O 6 está nas unidades de milhar.'] },
          { id: 's1-m5', tipo: 'arrastar', pergunta: 'Completa a decomposição do número.', frase: '38 507 = {0} + {1} + {2} + 7',
            certas: ['30 000', '8 000', '500'], extra: ['3 000', '800', '50'],
            pistas: ['O 3 está em que casa? E o 8?', 'O 3 vale 30 000 e o 8 vale 8 000.', 'Falta o 5: está nas centenas.'] },
          { id: 's1-m6', tipo: 'curta', pergunta: 'Arredonda 4 768 às centenas.', numero: 4800,
            explica: '4 768 está entre 4 700 e 4 800; como o algarismo das dezenas é 6 (5 ou mais), arredonda-se para 4 800.',
            pistas: ['Entre que centenas está 4 768?', 'Está entre 4 700 e 4 800. Olha para o algarismo das dezenas.', 'Se as dezenas forem 5 ou mais, arredonda-se para cima.'] },
        ] },
        { area: 'port', titulo: 'Português', texto: {
          titulo: 'Como encontrar o norte', fonte: 'Texto escrito para o Nico (Buinho Educativo).',
          paragrafos: [
            'Imagina que estás no meio do montado, perto de Messejana, e não sabes para que lado fica a aldeia. Como podes orientar-te sem telemóvel?',
            'O Sol é uma grande ajuda. De manhã, nasce do lado do nascente, que é o este. Ao fim do dia, põe-se do lado do poente, que é o oeste. Em Portugal, a meio do dia, o Sol está do lado sul.',
            'Se apontares o braço direito para o lado onde o Sol nasce, ficas virado para norte. Atrás de ti fica o sul e, à tua esquerda, o oeste.',
            'Outra ajuda é a bússola. A sua agulha é um pequeno íman que aponta sempre para norte. Os mapas também têm uma rosa dos ventos, que mostra onde ficam os quatro pontos cardeais: norte, sul, este e oeste.',
            'Os pastores e os agricultores do Alentejo aprenderam a orientar-se pelo Sol e pelas estrelas muito antes de existirem bússolas ou GPS.',
          ] },
          atividades: [
            { id: 's1-l1', tipo: 'escolha', pergunta: 'Segundo o texto, de que lado nasce o Sol?', opcoes: ['Do lado norte.', 'Do lado sul.', 'Do lado do nascente, o este.', 'Do lado do poente.'], certa: 2, pistas: LEITURA },
            { id: 's1-l2', tipo: 'vf', pergunta: 'Indica se cada afirmação é verdadeira ou falsa, de acordo com o texto.',
              afirmacoes: [['A meio do dia, em Portugal, o Sol está do lado sul.', true], ['A agulha da bússola aponta sempre para oeste.', false], ['A rosa dos ventos mostra os pontos cardeais.', true], ['Os pastores só se orientavam com o GPS.', false]], pistas: LEITURA },
            { id: 's1-l3', tipo: 'palavras', pergunta: 'Clica nos dois nomes próprios da frase.', texto: 'O Rui e a avó caminharam pelo montado até Messejana.', certas: ['Rui', 'Messejana'],
              explica: 'Os nomes próprios dão nome a uma pessoa ou lugar concretos e escrevem-se com maiúscula.',
              pistas: ['Os nomes próprios dão nome a uma pessoa ou a um lugar.', 'Os nomes próprios começam por letra maiúscula (mesmo no meio da frase).', 'Há uma pessoa e uma aldeia nesta frase.'] },
            { id: 's1-l4', tipo: 'arrastar', pergunta: 'Completa as frases com palavras do texto.', frase: 'O Sol põe-se a {0}. A bússola tem uma {1} que aponta para {2}.',
              certas: ['oeste', 'agulha', 'norte'], extra: ['este', 'sul', 'roda'], pistas: ['Lê o 2.º e o 4.º parágrafos.', 'O poente é o…', 'A bússola tem uma agulha que é um pequeno íman.'] },
            { id: 's1-l5', tipo: 'extensa', pergunta: 'Explica a um amigo como pode encontrar o norte usando o Sol.', instr: 'Escreve pelo menos duas frases.', min: 15, palavrasChave: ['norte'],
              pistas: ['Lê outra vez o 3.º parágrafo.', 'Começa por dizer para onde se aponta o braço direito.', 'Não te esqueças: maiúscula no início e ponto final no fim.'] },
          ] },
      ],
    },
    // -------------------------------------------------------------------------------------------- 2
    {
      id: 's2', insignia: 'Guardião do montado', titulo: 'O montado e a cortiça', resumo: 'Seres vivos do montado · multiplicação e tabuadas · adjetivos e sinónimos.',
      estacoes: [
        { area: 'maos', titulo: 'Rato e teclado', atividades: [
          { id: 's2-r1', tipo: 'separar', titulo: 'Animal ou planta?', pergunta: 'Arrasta cada ser vivo do montado para o cesto certo.',
            cestos: [{ id: 'animal', nome: 'Animais', cor: '#c4553a' }, { id: 'planta', nome: 'Plantas', cor: '#3f7d3a' }],
            objetos: [['sobreiro', 'planta'], ['azinheira', 'planta'], ['porco preto', 'animal'], ['cegonha', 'animal'], ['esteva', 'planta'], ['javali', 'animal'], ['rosmaninho', 'planta'], ['abelha', 'animal']],
            pistas: ['Carrega na palavra e não largues o botão.', 'Com o botão carregado, leva a palavra até ao cesto.', 'Em cima do cesto, larga o botão.'] },
          { id: 's2-r2', tipo: 'teclado', titulo: 'A fila de cima', linhas: ['ruas', 'trigo', 'sobreiro', 'pato', 'o pato tira a palha'],
            boasVindas: 'Hoje usamos também a fila de cima. Depois de cada tecla, o dedo volta para casa.',
            pistas: ['Os dedos voltam sempre às teclas de casa.', 'Para o R e o T usa o indicador esquerdo; para o U e o I, o indicador e o médio direitos.', 'O espaço é com o polegar.'] },
        ] },
        { area: 'prog', titulo: 'Programar', atividades: [
          { id: 's2-p1', tipo: 'caminho', titulo: 'De 5 em 5', missao: 'Conta de 5 em 5: apanha o 5, o 10 e o 15 e chega à bandeira.',
            cols: 6, rows: 3, inicio: [0, 1], meta: [5, 1], itens: [[1, 1, '5'], [3, 1, '10'], [4, 1, '15']], obst: [[2, 0, 'arvore'], [4, 2, 'arvore']],
            blocos: ['andarE', 'apanhar', 'andarN', 'andarS'], maxBlocos: 7, solucao: [['E', 1], ['ap'], ['E', 2], ['ap'], ['E', 1], ['ap'], ['E', 1]],
            boasVindas: 'Bloco novo: «apanhar». O Nico só apanha o que está na casa onde ele está.',
            pistas: ['Onde está o 5? Quantas casas até lá?', 'Primeiro anda até ao número, depois «apanhar».', 'andar 1 → apanhar → andar 2 → apanhar…'] },
          { id: 's2-p2', tipo: 'caminho', titulo: 'Só a tabuada do 4', missao: 'Apanha só os números da tabuada do 4 e chega ao fim do caminho.', porque: 'Na tabuada do 4 estão 4, 8, 12, 16…',
            cols: 7, rows: 3, inicio: [0, 1], meta: [6, 1], itens: [[1, 1, '4'], [2, 1, '6', false], [3, 1, '8'], [4, 1, '10', false], [5, 1, '12']],
            blocos: ['andarE', 'apanhar'], maxBlocos: 7, solucao: [['E', 1], ['ap'], ['E', 2], ['ap'], ['E', 2], ['ap'], ['E', 1]],
            pistas: ['Quais destes números estão na tabuada do 4?', '4, 8 e 12 estão. 6 e 10 não.', 'Passa por cima do 6 e do 10 sem os apanhar.'] },
          { id: 's2-p3', tipo: 'caminho', titulo: 'Os resultados certos', missao: 'Apanha os resultados de 6 × 3, 4 × 5 e 7 × 2. Os outros números não! Depois vai até à bandeira.',
            porque: '6 × 3 = 18, 4 × 5 = 20 e 7 × 2 = 14.',
            cols: 5, rows: 5, inicio: [0, 0], meta: [0, 4], itens: [[2, 0, '18'], [4, 2, '20'], [2, 4, '14'], [0, 2, '21', false], [4, 4, '24', false]],
            obst: [[1, 1, 'arvore'], [3, 1, 'arvore'], [1, 3, 'arvore'], [3, 3, 'arvore']],
            blocos: ['andarN', 'andarS', 'andarE', 'andarO', 'apanhar'], maxBlocos: 9,
            solucao: [['E', 2], ['ap'], ['E', 2], ['S', 2], ['ap'], ['S', 2], ['O', 2], ['ap'], ['O', 2]],
            pistas: ['Faz primeiro as contas: 6 × 3, 4 × 5 e 7 × 2.', 'Os resultados são 18, 20 e 14. Planeia um caminho que passe pelos três.', 'Dá a volta por fora dos sobreiros: este, sul, oeste.'] },
        ] },
        { area: 'mat', titulo: 'Matemática', atividades: [
          { id: 's2-m1', tipo: 'curta', pergunta: 'Calcula: 7 × 8', antes: '7 × 8 =', numero: 56, largura: '120px',
            pistas: ['Sabes 7 × 4? Depois é o dobro.', '7 × 4 = 28.', 'O dobro de 28 é…'] },
          { id: 's2-m2', tipo: 'escolha', pergunta: 'Imagina que cada sobreiro dá 45 kg de cortiça. Quantos quilos dão 6 sobreiros?', opcoes: ['51 kg', '240 kg', '270 kg', '300 kg'], certa: 2,
            explica: '6 × 45 = 6 × 40 + 6 × 5 = 240 + 30 = 270 kg.',
            pistas: ['É uma multiplicação: 6 vezes 45.', 'Decompõe: 6 × 40 e 6 × 5.', '240 + 30 = ?'] },
          { id: 's2-m3', tipo: 'curta', pergunta: 'Calcula: 23 × 100', antes: '23 × 100 =', numero: 2300, largura: '140px',
            pistas: ['Multiplicar por 100 faz o número crescer duas casas.', 'Cada algarismo passa duas casas para a esquerda.', 'Acrescentam-se dois zeros.'] },
          { id: 's2-j1', tipo: 'memoria', titulo: 'Memória das tabuadas', pergunta: 'Encontra os pares: cada multiplicação com o seu resultado.',
            pares: [['4 × 25', '100'], ['12 × 5', '60'], ['9 × 9', '81'], ['15 × 3', '45'], ['7 × 6', '42'], ['8 × 8', '64']],
            pistas: ['Vira uma multiplicação e faz a conta de cabeça.', 'Depois procura a carta com o resultado.', 'Lembra-te de onde viste cada número!'] },
          { id: 's2-j2', tipo: 'plataforma', tema: 'montado', titulo: 'Bolotas da tabuada do 7', pergunta: 'Apanha as bolotas da tabuada do 7 e salta por cima das outras!',
            fichas: [['14', true], ['21', true], ['24', false], ['35', true], ['40', false], ['49', true], ['54', false], ['63', true]], porque: 'Tabuada do 7: 7, 14, 21, 28, 35, 42, 49, 56, 63.',
            pistas: ['Diz a tabuada do 7 em voz alta antes de começar.', '7, 14, 21, 28, 35, 42, 49, 56, 63, 70.', '24, 40 e 54 não estão na tabuada do 7: salta por cima!'] },
          { id: 's2-m5', tipo: 'escolha', pergunta: 'Na feira de Castro Verde, um queijo custa 7 €. A Ana comprou 4 queijos e pagou com uma nota de 50 €. Quanto recebeu de troco?',
            opcoes: ['22 €', '28 €', '43 €', '32 €'], certa: 0, explica: '4 × 7 = 28 €; 50 − 28 = 22 €.',
            pistas: ['São duas contas: quanto custaram os queijos, e depois o troco.', 'Os 4 queijos custaram 4 × 7 = 28 €.', 'O troco é 50 − 28.'] },
          { id: 's2-m6', tipo: 'varias', pergunta: 'Escolhe todos os números que são múltiplos de 6.', instr: 'Pode haver mais do que uma resposta certa.', opcoes: ['18', '26', '36', '40', '54'], certas: [0, 2, 4],
            pistas: ['Um múltiplo de 6 está na tabuada do 6.', '6, 12, 18, 24, 30, 36, 42, 48, 54…', 'São três.'] },
        ] },
        { area: 'port', titulo: 'Português', texto: {
          titulo: 'A árvore da cortiça', fonte: 'Texto escrito para o Nico (Buinho Educativo).',
          paragrafos: [
            'O sobreiro é uma árvore que cresce muito devagar e pode viver mais de 150 anos. É a árvore nacional de Portugal.',
            'A sua casca grossa e leve chama-se cortiça. De nove em nove anos, homens e mulheres com muita experiência tiram a cortiça com um machado, sem ferir a árvore. Depois, a casca volta a crescer.',
            'A primeira cortiça só se tira quando o sobreiro tem cerca de 25 anos. Para ninguém se enganar, pinta-se no tronco o último algarismo do ano em que a cortiça foi tirada.',
            'Com a cortiça fazem-se rolhas, sapatos, painéis e até peças para foguetões! No montado vivem também animais como o porco preto, que engorda a comer as bolotas caídas no chão.',
            'Portugal é o país que produz mais cortiça no mundo, e grande parte vem dos montados do Alentejo.',
          ] },
          atividades: [
            { id: 's2-l1', tipo: 'escolha', pergunta: 'De quanto em quanto tempo se pode tirar a cortiça?', opcoes: ['Todos os anos.', 'De nove em nove anos.', 'De vinte e cinco em vinte e cinco anos.', 'Só uma vez na vida da árvore.'], certa: 1, pistas: LEITURA },
            { id: 's2-l2', tipo: 'escolha', pergunta: 'Porque se pinta um algarismo no tronco do sobreiro?', opcoes: ['Para enfeitar o montado.', 'Para saber o ano em que a cortiça foi tirada.', 'Para contar as bolotas.', 'Para mostrar a idade da árvore.'], certa: 1, pistas: LEITURA },
            { id: 's2-j3', tipo: 'apanhar', titulo: 'Apanha os adjetivos', pergunta: 'Apanha só os adjetivos — as palavras que dizem como é alguma coisa!',
              certos: ['grossa', 'leve', 'antigo', 'verde', 'alto', 'rugoso'], errados: ['sobreiro', 'cortiça', 'tirar', 'porco', 'crescer', 'bolota'], porque: 'Os adjetivos dizem como é: grossa, leve, verde… «sobreiro» e «bolota» são nomes, «tirar» e «crescer» são verbos.',
              pistas: ['Pergunta: «como é?» Se a palavra responde, é um adjetivo.', 'Um sobreiro antigo, uma casca grossa…', 'Nomes (coisas) e verbos (ações) não se apanham.'] },
            { id: 's2-l4', tipo: 'arrastar', pergunta: 'Liga cada palavra do texto ao seu sinónimo.', linhas: [['devagar', 'lentamente'], ['ferir', 'magoar'], ['grossa', 'espessa'], ['experiência', 'prática']], extra: ['depressa', 'fina'],
              pistas: ['Um sinónimo quer dizer o mesmo.', 'Experimenta trocar a palavra na frase do texto: continua a fazer sentido?', '«Depressa» e «fina» querem dizer o contrário — são antónimos.'] },
            { id: 's2-l5', tipo: 'vf', pergunta: 'Verdadeiro ou falso, de acordo com o texto?',
              afirmacoes: [['O sobreiro é a árvore nacional de Portugal.', true], ['A cortiça é a raiz do sobreiro.', false], ['O porco preto come bolotas.', true], ['Tirar a cortiça mata a árvore.', false]], pistas: LEITURA },
            { id: 's2-l6', tipo: 'extensa', pergunta: 'Descreve um sobreiro em duas ou três frases. Usa pelo menos dois adjetivos.', min: 15, palavrasChave: ['sobreiro'],
              pistas: ['Como é o tronco? E as folhas? E a casca?', 'Podes usar: alto, velho, rugoso, verde, grosso, enorme…', 'Maiúscula no início e ponto final no fim de cada frase.'] },
          ] },
      ],
    },
    // -------------------------------------------------------------------------------------------- 3
    {
      id: 's3', insignia: 'Amigo da água', titulo: 'A água: do Alqueva à torneira', resumo: 'O ciclo da água · divisão e gráficos de barras · tempos verbais.',
      estacoes: [
        { area: 'maos', titulo: 'Rato e teclado', atividades: [
          { id: 's3-r1', tipo: 'duplo', titulo: 'Duplo clique', palavra: 'ALQUEVA',
            pistas: ['Um clique só faz a caixa abanar.', 'São dois cliques seguidos, bem rápidos.', 'Não mexas o rato entre os dois cliques.'] },
          { id: 's3-r2', tipo: 'teclado', titulo: 'Maiúsculas', linhas: ['Ana', 'Rui', 'Beja', 'Messejana', 'O rio Guadiana', 'A barragem do Alqueva'],
            boasVindas: 'Nomes de pessoas e de terras começam com maiúscula. Segura no Shift ⇧ com o mindinho da outra mão.',
            pistas: ['A maiúscula faz-se com o Shift ⇧.', 'Segura o Shift, carrega na letra, e larga os dois.', 'Usa o Shift do lado contrário ao da letra.'] },
          { id: 's3-j1', tipo: 'rebentar', titulo: 'Balões com maiúscula', pergunta: 'Rebenta os balões! São nomes próprios: começam com maiúscula.',
            palavras: ['Beja', 'Mértola', 'Alqueva', 'Guadiana', 'Messejana', 'Portugal'], pistas: ['Segura no Shift ⇧ para a primeira letra.', 'Mértola leva acento agudo no «é»: primeiro ´, depois e.', 'Escreve a palavra inteira e ela rebenta sozinha.'] },
        ] },
        { area: 'prog', titulo: 'Programar', atividades: [
          { id: 's3-p1', tipo: 'caminho', titulo: 'A subir a encosta', missao: 'Sobe a encosta em escada: norte, este, norte, este… até à bandeira. Consegues com 3 blocos?',
            cols: 6, rows: 6, inicio: [0, 5], meta: [5, 0], fundo: '#e3d3a8',
            obst: [[0, 3, 'pedra'], [1, 2, 'pedra'], [2, 1, 'pedra'], [3, 0, 'pedra'], [1, 5, 'pedra'], [2, 4, 'pedra'], [3, 3, 'pedra'], [4, 2, 'pedra'], [5, 1, 'pedra']],
            blocos: ['andarN', 'andarE', 'andarS', 'andarO', 'repetir'], maxBlocos: 3, solucao: [['rep', 5, [['N', 1], ['E', 1]]]],
            boasVindas: 'Bloco novo: «repetir». Faz várias vezes o que estiver lá dentro.', pistas: PC_REP },
          { id: 's3-p2', tipo: 'caminho', titulo: 'De 2 em 2', missao: 'Conta de 2 em 2: apanha o 2, o 4, o 6 e o 8. Consegues com 3 blocos?',
            cols: 9, rows: 3, inicio: [0, 1], meta: null, itens: [[2, 1, '2'], [4, 1, '4'], [6, 1, '6'], [8, 1, '8']], obst: [[3, 0, 'arvore'], [6, 2, 'arvore']],
            blocos: ['andarE', 'apanhar', 'repetir'], maxBlocos: 3, solucao: [['rep', 4, [['E', 2], ['ap']]]], pistas: PC_REP },
          { id: 's3-p3', tipo: 'caminho', titulo: 'A levada de rega', missao: 'Segue a levada de rega até à horta. O caminho repete-se: consegues com 5 blocos?',
            cols: 9, rows: 3, inicio: [0, 0], meta: [8, 0], nomeMeta: 'Horta',
            obst: [[3, 0, 'agua'], [7, 0, 'agua'], [1, 1, 'agua'], [3, 1, 'agua'], [5, 1, 'agua'], [7, 1, 'agua'], [0, 2, 'agua'], [1, 2, 'agua'], [5, 2, 'agua']],
            blocos: ['andarN', 'andarS', 'andarE', 'andarO', 'repetir'], maxBlocos: 5, solucao: [['rep', 2, [['E', 2], ['S', 2], ['E', 2], ['N', 2]]]],
            pistas: ['Faz a primeira parte do caminho até voltares à fila de cima.', 'A primeira parte é: este 2, sul 2, este 2, norte 2.', 'Põe essa parte dentro de um «repetir 2 vezes».'] },
        ] },
        { area: 'mat', titulo: 'Matemática', atividades: [
          { id: 's3-m1', tipo: 'curta', pergunta: 'Calcula: 72 : 8', antes: '72 : 8 =', numero: 9, largura: '110px',
            pistas: ['Que número vezes 8 dá 72?', 'Pensa na tabuada do 8.', '8 × 9 = 72.'] },
          { id: 's3-m2', tipo: 'escolha', pergunta: 'Há 96 garrafas de água para distribuir igualmente por 4 mesas. Quantas garrafas ficam em cada mesa?', opcoes: ['22', '24', '26', '92'], certa: 1,
            explica: '96 : 4 = 24, porque 4 × 24 = 96.', pistas: ['Distribuir igualmente é dividir.', '96 : 4. Podes dividir por 2 e outra vez por 2.', '96 : 2 = 48 e 48 : 2 = 24.'] },
          { id: 's3-m3', tipo: 'escolha', pergunta: 'O Nico tem 50 bolachas e quer pô-las em pacotes de 6. Quantos pacotes completos consegue fazer, e quantas bolachas sobram?',
            opcoes: ['8 pacotes e sobram 2 bolachas.', '9 pacotes e sobram 4 bolachas.', '8 pacotes e sobram 6 bolachas.', '7 pacotes e sobram 8 bolachas.'], certa: 0,
            explica: '6 × 8 = 48 e 50 − 48 = 2. O resto (2) tem de ser menor do que 6.',
            pistas: ['Quantas vezes cabe o 6 no 50?', '6 × 8 = 48 e 6 × 9 = 54 (passa de 50).', 'Sobra 50 − 48.'] },
          { id: 's3-j2', tipo: 'plataforma', tema: 'alqueva', titulo: 'As gotas do 8', pergunta: 'Apanha as divisões cujo resultado é 8!',
            fichas: [['64 : 8', true], ['48 : 8', false], ['56 : 7', true], ['40 : 4', false], ['72 : 9', true], ['32 : 4', true], ['45 : 5', false]], porque: 'Faz a conta: o resultado tem de ser 8.',
            pistas: ['Antes de apanhar, faz a divisão de cabeça.', 'Pensa ao contrário: 8 × 8 = 64, 7 × 8 = 56…', '48 : 8 = 6, 40 : 4 = 10 e 45 : 5 = 9 — esses não!'] },
          { id: 's3-m4', tipo: 'curta', pergunta: 'Observa o gráfico. Quantos litros se gastaram ao todo no duche e na rega?', figura: AGUA, numero: 100, depois: 'litros', largura: '120px',
            pistas: ['Lê o valor de cada barra no eixo da esquerda.', 'Duche: 60 litros. Rega: 40 litros.', '60 + 40 = ?'] },
          { id: 's3-m5', tipo: 'escolha', pergunta: 'Em que atividade se gastou menos água?', figura: AGUA, opcoes: ['Duche', 'Cozinha', 'Sanita', 'Roupa'], certa: 3,
            pistas: ['Procura a barra mais baixa.', 'Compara a Cozinha e a Roupa.'] },
          { id: 's3-m6', tipo: 'escolha', pergunta: 'Quantos litros se gastaram a mais no duche do que na sanita?', figura: AGUA, opcoes: ['15 litros', '25 litros', '35 litros', '95 litros'], certa: 1,
            explica: '60 − 35 = 25 litros.', pistas: ['«A mais» pede uma subtração.', 'Duche 60, sanita 35.', '60 − 35 = ?'] },
        ] },
        { area: 'port', titulo: 'Português', texto: {
          titulo: 'A viagem de uma gota', fonte: 'Texto escrito para o Nico (Buinho Educativo).',
          paragrafos: [
            'Olá! Sou a Gota e já dei muitas voltas ao mundo. Hoje estou no lago do Alqueva, um dos maiores lagos artificiais da Europa Ocidental, formado pela barragem no rio Guadiana.',
            'Quando o Sol aquece a água, eu fico tão leve que subo pelo ar como vapor. A isto chama-se evaporação.',
            'Lá em cima, o ar é mais frio. Junto-me a outras gotinhas e formamos uma nuvem: é a condensação.',
            'Quando a nuvem fica pesada, caímos em chuva, granizo ou neve. É a precipitação. Algumas de nós correm para os rios, outras infiltram-se na terra e enchem os poços.',
            'Depois, a água é tratada e chega às torneiras de casa. Por isso, fecha a torneira enquanto lavas os dentes: cada gota conta!',
          ] },
          atividades: [
            { id: 's3-l1', tipo: 'ordenar', pergunta: 'Põe as etapas da viagem da Gota pela ordem do texto.', instr: 'Arrasta as frases para cima ou para baixo.',
              itens: ['A Gota está no lago do Alqueva.', 'O Sol aquece a água e a Gota evapora-se.', 'As gotinhas juntam-se e formam uma nuvem.', 'A nuvem fica pesada e cai a chuva.', 'A água é tratada e chega às torneiras.'], pistas: LEITURA },
            { id: 's3-l2', tipo: 'arrastar', pergunta: 'Completa com as palavras do texto.',
              frase: 'A passagem da água a vapor chama-se {0}. A formação das nuvens chama-se {1}. A chuva, o granizo e a neve são formas de {2}.',
              certas: ['evaporação', 'condensação', 'precipitação'], extra: ['infiltração'], pistas: ['Cada etapa tem o seu nome no fim do parágrafo.', 'Lê os parágrafos 2, 3 e 4.'] },
            { id: 's3-l3', tipo: 'escolha', pergunta: 'Quem está a contar esta história?', opcoes: ['O Sol.', 'Uma gota de água.', 'O rio Guadiana.', 'Uma nuvem.'], certa: 1,
              pistas: ['Quem diz «Olá! Sou…»?', 'O narrador fala de si próprio: «eu fico tão leve».'] },
            { id: 's3-j3', tipo: 'ligar', modo: 'pares', titulo: 'Liga os tempos verbais', pergunta: 'Liga cada forma verbal ao seu tempo.', comTexto: false,
              pares: [['eu subo', 'presente'], ['eu dei', 'pretérito perfeito'], ['eu cairei', 'futuro'], ['nós formámos', 'pretérito perfeito'], ['tu evaporas', 'presente']],
              pistas: ['Presente: agora. Pretérito: já aconteceu. Futuro: vai acontecer.', 'Experimenta pôr «ontem», «hoje» ou «amanhã» antes.', '«Amanhã eu cairei» — futuro.'] },
            { id: 's3-l5', tipo: 'extensa', pergunta: 'Escreve duas coisas que podes fazer em casa para poupar água.', min: 12, palavrasChave: ['água'],
              pistas: ['O texto dá uma ideia no último parágrafo.', 'Pensa no banho, na loiça, na rega…', 'Começa: «Para poupar água, eu posso…»'] },
          ] },
      ],
    },
    // -------------------------------------------------------------------------------------------- 4
    {
      id: 's4', insignia: 'Mestre da reparação', titulo: 'Reciclar e reparar no FabLab', resumo: 'Resíduos e ecopontos · frações, decimais e dinheiro · textos de instruções.',
      estacoes: [
        { area: 'maos', titulo: 'Rato e teclado', atividades: [
          { id: 's4-r1', tipo: 'separar', titulo: 'Para que ecoponto?', pergunta: 'Arrasta cada resíduo para o ecoponto certo.',
            cestos: [{ id: 'amarelo', nome: 'Amarelo: plástico e metal', cor: '#c99700' }, { id: 'azul', nome: 'Azul: papel e cartão', cor: '#1e6fd9' }, { id: 'verde', nome: 'Verde: vidro', cor: '#2f9e44' }],
            objetos: [['garrafa de plástico', 'amarelo'], ['lata de sumo', 'amarelo'], ['jornal', 'azul'], ['caixa de cereais', 'azul'], ['frasco de compota', 'verde'],
              ['garrafa de vidro', 'verde'], ['pacote de leite', 'amarelo', 'Os pacotes de leite e de sumo vão para o amarelo, com as embalagens!'], ['revista', 'azul']],
            pistas: ['De que material é feito?', 'Plástico e metal: amarelo. Papel e cartão: azul. Vidro: verde.', 'Os pacotes de leite vão para o amarelo.'] },
          { id: 's4-r2', tipo: 'teclado', titulo: 'Acentos e cedilha', linhas: ['á é ó', 'ã õ ç', 'mãe pão', 'reparação', 'Está tudo à mão!'],
            boasVindas: 'No teclado português, os acentos escrevem-se ANTES da letra: primeiro o acento, larga, depois a letra.',
            pistas: ['O acento agudo ´ está duas teclas à direita do P, depois do +.', 'O til ~ está à direita do º (a seguir ao Ç e ao º).', 'Para o «à» segura o Shift ⇧ e carrega na tecla do acento.'] },
          { id: 's4-j1', tipo: 'rebentar', titulo: 'Balões com acentos', pergunta: 'Rebenta os balões! Atenção aos acentos e ao til.',
            palavras: ['mão', 'pão', 'avó', 'café', 'lâmpada', 'reparação'], pistas: ['Primeiro o acento, larga, depois a letra.', 'O ^ é Shift + a tecla do ~.', 'Reparação: ç e ã!'] },
        ] },
        { area: 'prog', titulo: 'Programar', atividades: [
          { id: 's4-p1', tipo: 'caminho', titulo: 'A gambiarra do Nico', missao: 'O Nico fez uma gambiarra: o programa devia apanhar as 3 tampinhas, mas bate numa pedra. Repara o programa!',
            cols: 7, rows: 3, inicio: [0, 1], meta: null, itens: [[2, 1, '1'], [4, 1, '2'], [6, 1, '3']], obst: [[3, 1, 'pedra'], [5, 1, 'pedra']],
            inicial: [['E', 2], ['ap'], ['E', 2], ['ap'], ['E', 2], ['ap']],
            blocos: ['andarN', 'andarS', 'andarE', 'andarO', 'apanhar', 'repetir'], maxBlocos: 7,
            solucao: [['E', 2], ['ap'], ['rep', 2, [['N', 1], ['E', 2], ['S', 1], ['ap']]]],
            boasVindas: { nico: 'Ups… fiz uma gambiarra. Carrega em ▶ e vê onde é que eu bato.', _: 'O Nico fez uma gambiarra. Carrega em ▶ e vê onde é que ele bate.' },
            pistas: ['Carrega em ▶ e vê onde o Nico bate.', 'Para passar uma pedra, sobe 1 casa, anda 2 e desce 1.', 'Depois da 1.ª tampinha, o desvio repete-se 2 vezes: norte 1, este 2, sul 1, apanhar.'] },
          { id: 's4-p2', tipo: 'caminho', titulo: 'Escada até ao FabLab', missao: 'Apanha o 3, o 6 e o 9 e chega ao FabLab. O caminho repete-se: consegues com 4 blocos?',
            cols: 7, rows: 4, inicio: [0, 3], meta: [6, 0], nomeMeta: 'FabLab', itens: [[2, 3, '3'], [4, 2, '6'], [6, 1, '9']], obst: [[1, 1, 'arvore'], [5, 3, 'arvore']],
            blocos: ['andarN', 'andarS', 'andarE', 'andarO', 'apanhar', 'repetir'], maxBlocos: 4, solucao: [['rep', 3, [['E', 2], ['ap'], ['N', 1]]]], pistas: PC_REP },
          { id: 's4-p3', tipo: 'caminho', titulo: 'Recolher as tampinhas', missao: 'Recolhe as 9 tampinhas das duas filas. Consegues com 8 blocos ou menos?',
            cols: 5, rows: 2, inicio: [0, 0], meta: null,
            itens: [[1, 0, '1'], [2, 0, '2'], [3, 0, '3'], [4, 0, '4'], [4, 1, '5'], [3, 1, '6'], [2, 1, '7'], [1, 1, '8'], [0, 1, '9']],
            blocos: ['andarS', 'andarE', 'andarO', 'apanhar', 'repetir'], maxBlocos: 8,
            solucao: [['rep', 4, [['E', 1], ['ap']]], ['S', 1], ['ap'], ['rep', 4, [['O', 1], ['ap']]]],
            pistas: ['Na fila de cima, o Nico faz sempre o mesmo: andar 1 e apanhar.', 'Depois desce e apanha. Na fila de baixo volta para oeste.', 'repetir 4 (este 1, apanhar) · sul 1 · apanhar · repetir 4 (oeste 1, apanhar).'] },
        ] },
        { area: 'mat', titulo: 'Matemática', atividades: [
          { id: 's4-m1', tipo: 'escolha', pergunta: 'Que fração da barra está pintada?', figura: { tipo: 'svg', svg: BARRA_8 }, opcoes: ['3/5', '3/8', '5/8', '8/3'], certa: 1,
            explica: 'A barra está dividida em 8 partes iguais e há 3 pintadas: 3/8.',
            pistas: ['Em quantas partes iguais está dividida a barra?', 'O número de baixo (denominador) é o total de partes.', 'O número de cima (numerador) é o das partes pintadas.'] },
          { id: 's4-m2', tipo: 'curta', pergunta: 'Quanto é 1/4 (um quarto) de 20 tampinhas?', numero: 5, depois: 'tampinhas', largura: '110px',
            pistas: ['Um quarto é dividir em 4 partes iguais.', '20 : 4 = ?'] },
          { id: 's4-m3', tipo: 'escolha', pergunta: 'Qual destas frações é a maior?', opcoes: ['1/2', '1/3', '1/4', '1/8'], certa: 0,
            explica: 'Com o mesmo numerador, quanto menos partes, maiores são: metade é maior do que um terço, um quarto ou um oitavo.',
            pistas: ['Imagina uma piza dividida em 2, 3, 4 ou 8 fatias iguais.', 'Quanto mais fatias, mais pequena é cada uma.'] },
          { id: 's4-j2', tipo: 'ligar', modo: 'sequencia', figura: 'peixe', titulo: 'Liga os preços', pergunta: 'Liga os preços do mais barato para o mais caro.',
            valores: ['0,95 €', '1,09 €', '1,50 €', '2,05 €', '5,90 €', '10,05 €'], dicaErro: 'Compara primeiro os euros e depois os cêntimos.',
            pistas: ['O ponto amarelo é o mais barato.', '1,09 € é menos do que 1,50 €: 9 cêntimos é menos do que 50.', 'O mais caro tem 10 euros.'] },
          { id: 's4-j3', tipo: 'plataforma', tema: 'fablab', titulo: 'Metades no FabLab', pergunta: 'Apanha as frações que valem metade!',
            fichas: [['1/2', true], ['1/3', false], ['2/4', true], ['3/4', false], ['3/6', true], ['2/5', false], ['4/8', true]], porque: 'Vale metade quando o número de cima é metade do de baixo: 2/4, 3/6, 4/8.',
            pistas: ['Metade = o de cima é metade do de baixo.', '2 é metade de 4; 3 é metade de 6.', '1/3, 3/4 e 2/5 não são metade: salta!'] },
          { id: 's4-m5', tipo: 'curta', pergunta: 'No repair café, uma câmara de ar custa 3,75 € e um pneu custa 8,50 €. Quanto custam os dois juntos?', numero: 12.25, depois: '€', largura: '140px',
            explica: '3,75 + 8,50 = 12,25 €.', pistas: ['É uma adição.', 'Soma os euros (3 + 8) e os cêntimos (75 + 50).', '75 + 50 = 125 cêntimos = 1 euro e 25 cêntimos.'] },
          { id: 's4-m6', tipo: 'escolha', pergunta: 'A Rita pagou 6,40 € com uma nota de 10 €. Quanto recebeu de troco?', opcoes: ['3,60 €', '4,60 €', '3,40 €', '16,40 €'], certa: 0,
            explica: '10,00 − 6,40 = 3,60 €.', pistas: ['O troco é uma subtração: 10 − 6,40.', 'De 6,40 até 7 faltam 60 cêntimos; de 7 até 10 faltam 3 euros.'] },
        ] },
        { area: 'port', titulo: 'Português', texto: {
          titulo: 'Como reparar um furo na bicicleta', fonte: 'Texto escrito para o Nico (Buinho Educativo).',
          paragrafos: [
            'No repair café do Buinho ninguém deita fora uma bicicleta só porque tem um furo. Segue estes passos e repara-a tu também, com a ajuda de um adulto.',
            'Material: desmontadores de pneus, bomba de ar, lixa, remendos com cola e uma bacia com água.',
            '1. Tira a roda da bicicleta e esvazia bem a câmara de ar.',
            '2. Com os desmontadores, tira o pneu e retira a câmara de ar.',
            '3. Enche um pouco a câmara de ar e mergulha-a na água. Onde aparecerem bolhas, está o furo!',
            '4. Seca a câmara de ar, lixa à volta do furo, põe a cola e espera um pouco antes de colar o remendo.',
            '5. Volta a montar tudo e enche o pneu. Pronto: a bicicleta está como nova e não foi parar ao lixo.',
          ] },
          atividades: [
            { id: 's4-l1', tipo: 'escolha', pergunta: 'Para que serve este texto?', opcoes: ['Para contar uma aventura.', 'Para ensinar a fazer uma reparação.', 'Para descrever um animal.', 'Para convidar para uma festa.'], certa: 1,
              pistas: ['Olha para a forma do texto: tem material e passos numerados.', 'É um texto de instruções.'] },
            { id: 's4-l2', tipo: 'ordenar', pergunta: 'Ordena os passos da reparação.', instr: 'Arrasta as frases para cima ou para baixo.',
              itens: ['Tirar a roda e esvaziar a câmara de ar.', 'Tirar o pneu com os desmontadores.', 'Mergulhar a câmara de ar na água para encontrar o furo.', 'Lixar, pôr cola e colar o remendo.', 'Montar tudo e encher o pneu.'], pistas: LEITURA },
            { id: 's4-l3', tipo: 'escolha', pergunta: 'Como se descobre onde está o furo?', opcoes: ['Ouvindo o barulho do ar.', 'Procurando as bolhas na água.', 'Olhando para o pneu com uma lupa.', 'Pondo cola em toda a câmara de ar.'], certa: 1, pistas: LEITURA },
            { id: 's4-l4', tipo: 'palavras', pergunta: 'Clica nas três formas verbais que dão uma ordem ou conselho (imperativo).', texto: 'Seca a câmara de ar, lixa à volta do furo e espera um pouco.', certas: ['Seca', 'lixa', 'espera'],
              explica: 'Nos textos de instruções usa-se muito o imperativo: seca, lixa, espera.',
              pistas: ['Procura as palavras que dizem o que fazer.', 'São verbos: ações.', 'Há uma no início da frase.'] },
            { id: 's4-l5', tipo: 'curta', pergunta: 'Escreve o plural de «pneu».', aceitar: ['pneus'], largura: '200px', pistas: ['Um pneu, dois…', 'Nas palavras acabadas em vogal, acrescenta-se um «s».'] },
            { id: 's4-l6', tipo: 'extensa', pergunta: 'Pensa num objeto de casa que se estragou. Escreve três frases a explicar como o poderias reparar ou dar-lhe outra vida.', min: 18,
              pistas: ['Escolhe o objeto: uma cadeira, um brinquedo, uma camisola…', 'Escreve como um texto de instruções: primeiro, depois, no fim.', 'Usa o imperativo: cola, cose, aperta…'] },
          ] },
      ],
    },
    // -------------------------------------------------------------------------------------------- 5
    {
      id: 's5', insignia: 'Chef saudável', titulo: 'O corpo e a alimentação', resumo: 'A Roda dos Alimentos · horas, medidas, perímetro e área · tipos de frase.',
      estacoes: [
        { area: 'maos', titulo: 'Rato e teclado', atividades: [
          { id: 's5-r1', tipo: 'rolar', titulo: 'Rolar o texto', pergunta: 'O que comeu o Nico ao jantar? Desce no texto e clica no nome desse legume.', alvo: 'brócolos',
            paragrafos: [
              'O Nico acordou cedo, espreguiçou-se e foi logo à cozinha. Ao pequeno-almoço bebeu um copo de leite e comeu pão com queijo.',
              'Depois foi a correr para a escola. No caminho cumprimentou a senhora Aurora, que estava a regar as flores à porta de casa.',
              'A meio da manhã, no intervalo, comeu uma maçã e jogou à bola com a Gabi no recreio. Ganharam por três a dois!',
              'Ao almoço, na cantina, havia sopa de legumes, arroz de peixe e salada. De sobremesa, uma laranja.',
              'À tarde, foram ao FabLab do Buinho reparar uma bicicleta. Encontraram o furo dentro de uma bacia com água.',
              'Ao lanche, o Nico comeu iogurte natural com fruta e bebeu um copo de água bem fresca.',
              'Antes do jantar, fizeram os trabalhos de casa e ainda deram um passeio pelo montado, até ao ribeiro.',
              'Ao jantar, o Nico comeu peixe grelhado com batata cozida e brócolos. Estava tudo delicioso!',
              'Depois lavou os dentes, leu um livro de aventuras e adormeceu a sonhar com o dia seguinte.',
            ],
            pistas: ['O jantar é a última refeição do dia: está quase no fim do texto.', 'Rola a roda do rato para baixo.', 'Procura no parágrafo que começa com «Ao jantar».'] },
          { id: 's5-r2', tipo: 'teclado', titulo: 'Pontuação', linhas: ['Olá, Nico!', 'Tens fome?', 'Sim, quero sopa.', 'Come fruta: é saudável!'],
            boasVindas: 'Hoje: vírgula, ponto, ponto de interrogação e de exclamação. Alguns precisam do Shift ⇧.',
            pistas: ['A vírgula e o ponto estão na fila de baixo, à direita.', 'O ponto de interrogação ? é Shift + a tecla ao lado do 0.', 'O ponto de exclamação ! é Shift + 1. Os dois pontos : são Shift + ponto.'] },
          { id: 's5-j1', tipo: 'rebentar', titulo: 'Balões da cantina', pergunta: 'Rebenta os balões escrevendo as palavras.',
            palavras: ['sopa', 'fruta', 'água', 'legumes', 'saudável', 'pão'], pistas: ['Água e saudável levam acento agudo.', 'Pão leva til no «ã».', 'Escreve a palavra toda.'] },
        ] },
        { area: 'prog', titulo: 'Programar', atividades: [
          { id: 's5-p1', tipo: 'caminho', titulo: 'Só os pares', missao: 'Anda até ao fim da fila e apanha só os números pares. Usa o «se».', porque: 'Os números pares acabam em 0, 2, 4, 6 ou 8.',
            cols: 7, rows: 2, inicio: [0, 0], meta: null,
            itens: [[1, 0, '3', false], [2, 0, '8'], [3, 0, '12'], [4, 0, '7', false], [5, 0, '10'], [6, 0, '15', false]],
            blocos: ['andarE', 'apanhar', 'repetir', 'se', 'aqui'], maxBlocos: 5, solucao: [['rep', 6, [['E', 1], ['se', 'par', [['ap']]]]]],
            boasVindas: 'Blocos novos: «se … então» e «o número aqui é…». Assim o Nico decide sozinho.', pistas: PC_SE },
          { id: 's5-p2', tipo: 'caminho', titulo: 'Para a cantina', missao: 'Sobe até à cantina e apanha os múltiplos de 3 que encontrares.', porque: 'Múltiplos de 3: 3, 6, 9, 12… 21, 24, 27, 30.',
            cols: 3, rows: 7, inicio: [1, 6], meta: [1, 0], nomeMeta: 'Cantina',
            itens: [[1, 5, '9'], [1, 4, '14', false], [1, 3, '21'], [1, 2, '25', false], [1, 1, '30']], obst: [[0, 3, 'arvore'], [2, 5, 'arvore'], [2, 1, 'casa']],
            blocos: ['andarN', 'andarS', 'apanhar', 'repetir', 'se', 'aqui'], maxBlocos: 5, solucao: [['rep', 6, [['N', 1], ['se', 'm3', [['ap']]]]]], pistas: PC_SE },
          { id: 's5-p3', tipo: 'caminho', titulo: 'Duas filas, múltiplos de 4', missao: 'Percorre as duas filas e apanha só os múltiplos de 4.', porque: 'Múltiplos de 4: 16, 20, 24, 28, 32… Os outros não.',
            cols: 5, rows: 2, inicio: [0, 0], meta: null,
            itens: [[1, 0, '16'], [2, 0, '18', false], [3, 0, '20'], [4, 0, '22', false], [4, 1, '24'], [3, 1, '26', false], [2, 1, '28'], [1, 1, '30', false], [0, 1, '32']],
            blocos: ['andarS', 'andarE', 'andarO', 'apanhar', 'repetir', 'se', 'aqui'], maxBlocos: 14,
            solucao: [['rep', 4, [['E', 1], ['se', 'm4', [['ap']]]]], ['S', 1], ['se', 'm4', [['ap']]], ['rep', 4, [['O', 1], ['se', 'm4', [['ap']]]]]],
            pistas: ['Junta o que aprendeste: repetir, se, e mudar de fila.', 'Fila de cima para este; desce; fila de baixo para oeste.', 'Em cada casa: «se o número aqui é múltiplo de 4» então «apanhar».'] },
        ] },
        { area: 'mat', titulo: 'Matemática', atividades: [
          { id: 's5-m1', tipo: 'escolha', pergunta: 'É de manhã. Que horas marca o relógio?', figura: { tipo: 'relogio', h: 10, m: 20 }, opcoes: ['10h20', '4h50', '10h04', '2h50'], certa: 0,
            pistas: ['O ponteiro pequeno mostra as horas; o grande, os minutos.', 'O ponteiro pequeno passou o 10.', 'O ponteiro grande está no 4: 4 × 5 = 20 minutos.'] },
          { id: 's5-m2', tipo: 'curta', pergunta: 'O almoço na cantina começa às 12h30 e dura 45 minutos. A que horas acaba?', aceitar: ['13h15', '13:15', '13h15m', '13 h 15', '13h 15', '13 horas e 15 minutos', '1h15'], largura: '160px', instr: 'Escreve assim: 00h00',
            explica: '12h30 + 30 min = 13h00; + 15 min = 13h15.', pistas: ['Junta primeiro 30 minutos: chegas à hora certa.', '12h30 + 30 min = 13h00.', 'Ainda faltam 15 minutos.'] },
          { id: 's5-j2', tipo: 'memoria', titulo: 'Memória das horas', pergunta: 'Encontra os pares: cada hora com a forma como se diz.',
            pares: [['10h20', 'dez e vinte'], ['13h15', 'uma e um quarto'], ['9h30', 'nove e meia'], ['18h45', 'um quarto para as sete'], ['7h05', 'sete e cinco'], ['12h00', 'meio-dia']],
            pistas: ['15 minutos é um quarto de hora; 30 minutos é meia hora.', '18h45 é um quarto para as 19h, ou seja, para as sete da tarde.', '13h15 é uma da tarde e um quarto.'] },
          { id: 's5-m3', tipo: 'escolha', pergunta: 'Quantos centímetros tem um metro e meio?', opcoes: ['15 cm', '105 cm', '150 cm', '1 500 cm'], certa: 2,
            pistas: ['1 metro tem 100 centímetros.', 'Meio metro é metade de 100 cm.', '100 + 50 = ?'] },
          { id: 's5-m4', tipo: 'curta', pergunta: 'Cada quadradinho tem 1 cm de lado. Qual é o perímetro do retângulo pintado?', figura: { tipo: 'svg', svg: RETANGULO }, numero: 20, depois: 'cm', largura: '110px',
            explica: '6 + 4 + 6 + 4 = 20 cm.', pistas: ['O perímetro é a medida da volta toda (a linha de fora).', 'Conta os lados: o comprido tem 6 cm e o curto 4 cm.', '6 + 4 + 6 + 4 = ?'] },
          { id: 's5-m5', tipo: 'curta', pergunta: 'E qual é a área do mesmo retângulo?', figura: { tipo: 'svg', svg: RETANGULO }, numero: 24, depois: 'cm²', largura: '110px',
            explica: 'São 4 filas de 6 quadradinhos: 4 × 6 = 24 cm².', pistas: ['A área é quantos quadradinhos cabem lá dentro.', 'Há 4 filas de 6 quadradinhos.', '4 × 6 = ?'] },
          { id: 's5-m6', tipo: 'escolha', pergunta: 'Uma garrafa tem 1,5 litros de sumo natural. Quantos copos de 0,25 litros se conseguem encher?', opcoes: ['4', '5', '6', '15'], certa: 2,
            explica: '0,25 l é um quarto de litro: 1 litro enche 4 copos e meio litro enche 2. 4 + 2 = 6.', pistas: ['0,25 litros é um quarto de litro.', 'Quantos copos enche 1 litro? E meio litro?', '4 + 2 = ?'] },
        ] },
        { area: 'port', titulo: 'Português', texto: {
          titulo: 'A Roda dos Alimentos', fonte: 'Texto escrito para o Nico (Buinho Educativo).',
          paragrafos: [
            'Para crescermos com saúde, precisamos de comer bem. A Roda dos Alimentos portuguesa ajuda-nos a escolher: tem sete grupos de alimentos e a água no centro.',
            'O maior grupo é o dos cereais e derivados e tubérculos, como o pão, o arroz e a batata. Seguem-se os hortícolas e a fruta. O grupo mais pequeno é o das gorduras e óleos, que devemos comer em pouca quantidade.',
            'Uma alimentação saudável é completa, equilibrada e variada: comemos alimentos de todos os grupos, nas quantidades certas, e mudamos de alimentos ao longo da semana.',
            'A água é a bebida mais importante. Os refrigerantes têm muito açúcar e devem ser uma exceção, não um hábito.',
            'E não te esqueças: comer devagar, mastigar bem e mexer o corpo todos os dias também fazem parte de uma vida saudável.',
          ] },
          atividades: [
            { id: 's5-l1', tipo: 'escolha', pergunta: 'O que está no centro da Roda dos Alimentos?', opcoes: ['A fruta.', 'O pão.', 'A água.', 'O leite.'], certa: 2, pistas: LEITURA },
            { id: 's5-l2', tipo: 'vf', pergunta: 'Verdadeiro ou falso, de acordo com o texto?',
              afirmacoes: [['A Roda dos Alimentos tem sete grupos.', true], ['Devemos comer gorduras e óleos em grande quantidade.', false], ['Variar os alimentos ao longo da semana faz parte de uma alimentação saudável.', true], ['Os refrigerantes devem ser bebidos todos os dias.', false]], pistas: LEITURA },
            { id: 's5-l3', tipo: 'varias', pergunta: 'Escolhe as três palavras que o texto usa para dizer como é uma alimentação saudável.', instr: 'Há três respostas certas.',
              opcoes: ['completa', 'rápida', 'equilibrada', 'doce', 'variada'], certas: [0, 2, 4], pistas: ['Está no 3.º parágrafo.', 'Procura a frase «Uma alimentação saudável é…».'] },
            { id: 's5-l4', tipo: 'curta', pergunta: 'Escreve o antónimo de «devagar».', aceitar: ['depressa', 'rapidamente', 'rápido', 'à pressa'], largura: '220px',
              pistas: ['Um antónimo quer dizer o contrário.', 'O contrário de lento é…'] },
            { id: 's5-l5', tipo: 'escolha', pergunta: 'Que tipo de frase é «Já comeste a fruta?»?', opcoes: ['Declarativa', 'Interrogativa', 'Exclamativa', 'Imperativa'], certa: 1,
              pistas: ['Olha para o sinal no fim da frase.', 'Quem diz esta frase está a fazer uma pergunta.'] },
            { id: 's5-j3', tipo: 'apanhar', titulo: 'Apanha os hortícolas', pergunta: 'Apanha só os hortícolas (legumes e verduras) da Roda dos Alimentos!',
              certos: ['cenoura', 'alface', 'brócolos', 'couve', 'tomate', 'abóbora'], errados: ['maçã', 'pão', 'queijo', 'arroz', 'banana', 'ovo'], porque: 'Os hortícolas são legumes e verduras. A maçã e a banana são fruta; o pão e o arroz são cereais.',
              pistas: ['Hortícolas crescem na horta: legumes e verduras.', 'A fruta tem um grupo só seu.', 'O pão, o arroz, o queijo e o ovo são de outros grupos.'] },
            { id: 's5-l6', tipo: 'extensa', pergunta: 'Escreve o menu de um almoço saudável e explica porque é saudável.', instr: 'Pelo menos duas frases.', min: 18,
              pistas: ['Escolhe sopa, prato e sobremesa.', 'Usa alimentos de vários grupos da Roda.', 'Explica com «porque…».'] },
          ] },
      ],
    },
    // -------------------------------------------------------------------------------------------- 6
    {
      id: 's6', insignia: 'Cronista do reino', titulo: 'Portugal no mapa e na história', resumo: 'Rios, serras e o primeiro rei · ângulos, simetria e dados · cronologia.',
      estacoes: [
        { area: 'maos', titulo: 'Rato e teclado', atividades: [
          { id: 's6-r1', tipo: 'separar', titulo: 'Rio ou serra?', pergunta: 'Arrasta cada nome para o sítio certo: é um rio ou uma serra de Portugal?',
            cestos: [{ id: 'rio', nome: 'Rios', cor: '#1e6fd9' }, { id: 'serra', nome: 'Serras', cor: '#8a5a1f' }],
            objetos: [['Tejo', 'rio'], ['Douro', 'rio'], ['Guadiana', 'rio'], ['Mondego', 'rio'], ['Estrela', 'serra'], ['Gerês', 'serra'], ['Monchique', 'serra'], ['Caldeirão', 'serra']],
            pistas: ['Pensa num mapa de Portugal: os rios são linhas azuis.', 'A Serra da Estrela é a mais alta do continente.', 'O Guadiana passa perto de Mértola e do Alqueva.'] },
          { id: 's6-r2', tipo: 'teclado', titulo: 'Frases completas', linhas: ['D. Afonso Henriques foi o primeiro rei de Portugal.', 'Portugal tornou-se independente no século XII.'],
            boasVindas: 'Hoje escreves frases inteiras, com maiúsculas, hífen e ponto final. Sem pressa: primeiro certo, depois rápido.',
            pistas: ['O hífen - está na fila de baixo, à direita.', 'XII são três maiúsculas: segura o Shift.', 'Não te esqueças do ponto final.'] },
        ] },
        { area: 'prog', titulo: 'Programar', atividades: [
          { id: 's6-p1', tipo: 'caminho', titulo: 'Até ao castelo', missao: 'Apanha os números ímpares pelo caminho e chega ao castelo.', porque: 'Os ímpares acabam em 1, 3, 5, 7 ou 9.',
            cols: 6, rows: 4, inicio: [0, 3], meta: [5, 0], nomeMeta: 'Castelo',
            itens: [[1, 3, '7'], [2, 3, '12', false], [3, 3, '15'], [4, 3, '20', false], [5, 3, '21'], [5, 2, '33'], [5, 1, '40', false]],
            obst: [[1, 1, 'pedra'], [2, 1, 'pedra'], [3, 1, 'pedra'], [0, 0, 'arvore']],
            blocos: ['andarN', 'andarS', 'andarE', 'andarO', 'apanhar', 'repetir', 'se', 'aqui'], maxBlocos: 10,
            solucao: [['rep', 5, [['E', 1], ['se', 'impar', [['ap']]]]], ['rep', 3, [['N', 1], ['se', 'impar', [['ap']]]]]],
            pistas: ['O caminho tem duas partes: para este e depois para norte.', 'Cada parte é um «repetir» com um «se» lá dentro.', 'repetir 5 (este 1, se ímpar apanhar) · repetir 3 (norte 1, se ímpar apanhar).'] },
          { id: 's6-p2', tipo: 'caminho', titulo: 'Outra gambiarra', missao: 'Este programa devia apanhar só os múltiplos de 10, mas apanha tudo. Repara-o!', porque: 'Os múltiplos de 10 acabam em 0.',
            cols: 5, rows: 2, inicio: [0, 0], meta: null, itens: [[1, 0, '10'], [2, 0, '15', false], [3, 0, '20'], [4, 0, '25', false]],
            inicial: [['rep', 4, [['E', 1], ['ap']]]],
            blocos: ['andarE', 'apanhar', 'repetir', 'se', 'aqui'], maxBlocos: 5, solucao: [['rep', 4, [['E', 1], ['se', 'm10', [['ap']]]]]],
            boasVindas: { nico: 'Fiz outra gambiarra… apanho números a mais! Ajudas-me?', _: 'O Nico fez outra gambiarra: apanha números a mais. Ajudas?' },
            pistas: ['Carrega em ▶: que número apanha o Nico que não devia?', 'O «apanhar» precisa de uma condição antes.', 'Põe o «apanhar» dentro de «se o número aqui é múltiplo de 10».'] },
          { id: 's6-p3', tipo: 'caminho', titulo: 'À volta das muralhas', missao: 'Dá a volta ao castelo: apanha as 3 bandeiras dos cantos e volta ao início.',
            cols: 5, rows: 5, inicio: [0, 0], meta: [0, 0], nomeMeta: 'Início', itens: [[4, 0, '1'], [4, 4, '2'], [0, 4, '3']],
            obst: [[1, 1, 'casa'], [2, 1, 'casa'], [3, 1, 'casa'], [1, 2, 'casa'], [2, 2, 'casa'], [3, 2, 'casa'], [1, 3, 'casa'], [2, 3, 'casa'], [3, 3, 'casa']],
            blocos: ['andarN', 'andarS', 'andarE', 'andarO', 'apanhar'], maxBlocos: 7, solucao: [['E', 4], ['ap'], ['S', 4], ['ap'], ['O', 4], ['ap'], ['N', 4]],
            pistas: ['Os quatro lados das muralhas têm o mesmo tamanho.', 'Este, sul, oeste e norte — 4 casas cada.', 'Em cada canto com bandeira: «apanhar».'] },
        ] },
        { area: 'mat', titulo: 'Matemática', atividades: [
          { id: 's6-m1', tipo: 'escolha', pergunta: 'Qual destes ângulos é obtuso?', figura: { tipo: 'svg', svg: ANGULOS }, opcoes: ['O ângulo A', 'O ângulo B', 'O ângulo C'], certa: 2,
            explica: 'A é reto (90°), B é agudo (menor do que um reto) e C é obtuso (maior do que um reto).',
            pistas: ['Um ângulo reto é como o canto de uma folha.', 'O obtuso é mais aberto do que o reto.', 'Qual é o mais aberto dos três?'] },
          { id: 's6-j1', tipo: 'plataforma', tema: 'castelo', titulo: 'Letras ao espelho', pergunta: 'Apanha as letras com eixo de simetria vertical!',
            fichas: [['A', true], ['F', false], ['H', true], ['M', true], ['R', false], ['T', true], ['J', false], ['U', true]], porque: 'Imagina um espelho a meio da letra, de cima para baixo: os dois lados ficam iguais?',
            pistas: ['Imagina a letra dobrada ao meio, de cima para baixo.', 'A, H, M, T e U ficam iguais dos dois lados.', 'F, R e J não: salta por cima.'] },
          { id: 's6-m2', tipo: 'varias', pergunta: 'Quais destas letras têm um eixo de simetria vertical?', instr: 'Imagina um espelho a meio da letra, de cima para baixo.', opcoes: ['A', 'F', 'M', 'R', 'T'], certas: [0, 2, 4],
            pistas: ['Dobra a letra ao meio (de cima para baixo): os dois lados ficam iguais?', 'O F e o R não ficam iguais.', 'São três.'] },
          { id: 's6-m3', tipo: 'escolha', pergunta: 'Quantas faces tem um cubo?', opcoes: ['4', '6', '8', '12'], certa: 1,
            pistas: ['Pensa num dado.', 'Um dado tem os números de 1 a 6 — um em cada face.'] },
          { id: 's6-m4', tipo: 'escolha', pergunta: 'A tabela mostra a fruta preferida dos alunos do 4.º ano. Qual é a moda?',
            tabela: { cab: ['Fruta', 'Maçã', 'Laranja', 'Banana', 'Uvas'], linhas: [['N.º de alunos', '6', '4', '7', '3']] }, opcoes: ['Maçã', 'Laranja', 'Banana', 'Uvas'], certa: 2,
            explica: 'A moda é o valor que aparece mais vezes: a banana, escolhida por 7 alunos.', pistas: ['A moda é a resposta mais escolhida.', 'Procura o número maior na tabela.'] },
          { id: 's6-m5', tipo: 'curta', pergunta: 'Na mesma tabela, quantos alunos responderam ao todo?',
            tabela: { cab: ['Fruta', 'Maçã', 'Laranja', 'Banana', 'Uvas'], linhas: [['N.º de alunos', '6', '4', '7', '3']] }, numero: 20, depois: 'alunos', largura: '110px',
            pistas: ['Soma todos os alunos.', '6 + 4 = 10 e 7 + 3 = 10.'] },
          { id: 's6-m6', tipo: 'escolha', pergunta: 'Num saco há 3 berlindes azuis e 1 vermelho. Tira-se um sem ver. O que é mais provável?', opcoes: ['Sair um berlinde azul.', 'Sair um berlinde vermelho.', 'É impossível sair vermelho.', 'É certo sair azul.'], certa: 0,
            pistas: ['Há mais berlindes de que cor?', 'Sair vermelho é possível (há um), mas menos provável.'] },
        ] },
        { area: 'port', titulo: 'Português', texto: {
          titulo: 'O primeiro rei de Portugal', fonte: 'Texto escrito para o Nico (Buinho Educativo).',
          paragrafos: [
            'Há quase novecentos anos, Portugal ainda não era um reino. Era o Condado Portucalense, governado por D. Teresa, mãe de D. Afonso Henriques.',
            'Em 1128, D. Afonso Henriques venceu a Batalha de São Mamede, perto de Guimarães, e passou a governar o condado.',
            'Anos mais tarde, começou a chamar-se rei. Em 1143, o seu primo, o rei de Leão, reconheceu-o como rei no Tratado de Zamora.',
            'D. Afonso Henriques passou grande parte da vida a conquistar terras para sul. Lisboa foi conquistada em 1147, com a ajuda de cruzados que iam a caminho da Terra Santa.',
            'Em 1179, o Papa reconheceu Portugal como reino independente. Por isso, D. Afonso Henriques é lembrado como o primeiro rei de Portugal.',
          ] },
          atividades: [
            { id: 's6-l1', tipo: 'ordenar', pergunta: 'Ordena os acontecimentos do mais antigo para o mais recente.', instr: 'Arrasta para cima ou para baixo.',
              itens: ['Batalha de São Mamede', 'Tratado de Zamora', 'Conquista de Lisboa', 'O Papa reconhece Portugal como reino'], pistas: ['Procura o ano de cada acontecimento no texto.', '1128, 1143, 1147 e 1179.'] },
            { id: 's6-j2', tipo: 'ligar', modo: 'pares', titulo: 'Liga os anos', pergunta: 'Liga cada acontecimento ao seu ano.',
              pares: [['Batalha de São Mamede', '1128'], ['Tratado de Zamora', '1143'], ['Conquista de Lisboa', '1147'], ['O Papa reconhece o reino', '1179']], pistas: LEITURA },
            { id: 's6-l2', tipo: 'escolha', pergunta: 'Quem governava o Condado Portucalense antes de D. Afonso Henriques?', opcoes: ['D. Teresa, a sua mãe.', 'O rei de Leão.', 'O Papa.', 'Os cruzados.'], certa: 0, pistas: LEITURA },
            { id: 's6-l3', tipo: 'curta', pergunta: 'Em que ano foi conquistada Lisboa?', numero: 1147, largura: '140px', pistas: LEITURA },
            { id: 's6-l4', tipo: 'escolha', pergunta: 'Em que século foi conquistada Lisboa?', opcoes: ['Século XI', 'Século XII', 'Século XIII', 'Século XIV'], certa: 1,
              explica: 'Os anos de 1101 a 1200 são o século XII.', pistas: ['O século XII vai de 1101 a 1200.', '1147 está entre 1101 e 1200.'] },
            { id: 's6-l5', tipo: 'palavras', pergunta: 'Clica no pronome pessoal da frase.', texto: 'Ele conquistou Lisboa com a ajuda dos cruzados.', certas: ['Ele'],
              pistas: ['O pronome pessoal está no lugar de um nome.', 'Quem conquistou Lisboa? D. Afonso Henriques — que palavra o substitui?'] },
            { id: 's6-l6', tipo: 'extensa', pergunta: 'Imagina que és cronista do rei. Escreve três frases a contar a conquista de Lisboa.', min: 20, palavrasChave: ['Lisboa'],
              pistas: ['Quando foi? Quem ajudou?', 'Podes começar: «No ano de 1147…».', 'Usa o pretérito perfeito: conquistou, chegaram, lutaram…'] },
          ] },
      ],
    },
  ];

  // ================================================================================================= PROVA-ENSAIO
  const prova = {
    titulo: 'Prova-ensaio do Nico', minutos: 40,
    resumo: '16 questões de Português e Matemática, como numa prova no computador: navegar, marcar para rever, arrastar, escrever e entregar.',
    aviso: 'Esta prova-ensaio imita o tipo de tarefas das provas no computador: navegar entre questões, marcar para rever, arrastar, escrever e entregar. Não conta para nota e não é a plataforma oficial. Tens 40 minutos (o relógio só avisa, não fecha a prova).',
    textos: {
      lince: { titulo: 'O lince-ibérico', fonte: 'Texto escrito para o Nico (Buinho Educativo).', paragrafos: [
        'O lince-ibérico é um felino que só existe na Península Ibérica. Tem o pelo cor de areia com manchas escuras, a cauda curta e uns tufos de pelo preto nas pontas das orelhas, que parecem pincéis.',
        'Alimenta-se sobretudo de coelho-bravo. Por isso, quando os coelhos começaram a desaparecer por causa de doenças, o lince também ficou em perigo.',
        'Há poucos anos, era um dos felinos mais ameaçados do mundo. Para o salvar, criaram-se centros de reprodução, como o de Silves, no Algarve, e protegeram-se os sítios onde vive.',
        'Desde o final de 2014, vários linces foram libertados no Vale do Guadiana, perto de Mértola. Hoje já nascem crias em liberdade no Alentejo, e cada nascimento é uma boa notícia!',
      ] },
    },
    itens: [
      { id: 'pv1', area: 'port', leitura: 'lince', tipo: 'escolha', pergunta: 'Onde vive o lince-ibérico?', opcoes: ['Em toda a Europa.', 'Só na Península Ibérica.', 'Em África.', 'Na América.'], certa: 1 },
      { id: 'pv2', area: 'port', leitura: 'lince', tipo: 'vf', pergunta: 'Indica se cada afirmação é verdadeira ou falsa.',
        afirmacoes: [['O lince alimenta-se sobretudo de coelho-bravo.', true], ['O lince tem a cauda muito comprida.', false], ['Em Silves há um centro de reprodução de linces.', true]] },
      { id: 'pv3', area: 'port', leitura: 'lince', tipo: 'arrastar', pergunta: 'Completa as frases de acordo com o texto.',
        frase: 'O lince ficou em perigo porque os {0} começaram a desaparecer. Para o salvar, foram {1} linces no Vale do Guadiana.', certas: ['coelhos', 'libertados'], extra: ['peixes', 'caçados'] },
      { id: 'pv4', area: 'port', tipo: 'palavras', pergunta: 'Clica nos dois adjetivos da frase.', texto: 'O lince tem o pelo macio e a cauda curta.', certas: ['macio', 'curta'] },
      { id: 'pv5', area: 'port', tipo: 'escolha', pergunta: 'Na frase «Os tufos parecem pincéis», a palavra «parecem» é…', opcoes: ['um nome.', 'um adjetivo.', 'um verbo.', 'um determinante.'], certa: 2 },
      { id: 'pv6', area: 'port', tipo: 'curta', pergunta: 'Escreve o feminino de «leão».', aceitar: ['leoa'], largura: '200px' },
      { id: 'pv7', area: 'port', leitura: 'lince', tipo: 'extensa', pergunta: 'Porque é importante proteger o lince-ibérico? Responde em duas ou três frases.', min: 15 },
      { id: 'pv8', area: 'mat', tipo: 'curta', pergunta: 'Calcula: 345 + 1 278', antes: '345 + 1 278 =', numero: 1623, largura: '150px' },
      { id: 'pv9', area: 'mat', tipo: 'escolha', pergunta: 'Quanto é 1 000 − 456?', opcoes: ['544', '654', '556', '644'], certa: 0 },
      { id: 'pv10', area: 'mat', tipo: 'curta', pergunta: 'Calcula: 36 × 4', antes: '36 × 4 =', numero: 144, largura: '130px' },
      { id: 'pv11', area: 'mat', tipo: 'escolha', pergunta: 'Observa o gráfico. Em que ano foram libertados mais linces?', figura: LINCES, opcoes: ['2020', '2021', '2022', '2023'], certa: 3 },
      { id: 'pv12', area: 'mat', tipo: 'curta', pergunta: 'Quantos linces foram libertados ao todo nos quatro anos?', figura: LINCES, numero: 44, depois: 'linces', largura: '110px' },
      { id: 'pv13', area: 'mat', tipo: 'ordenar', pergunta: 'Ordena os números do menor para o maior.', itens: ['0,5', '0,75', '1', '1,25'] },
      { id: 'pv14', area: 'mat', tipo: 'escolha', pergunta: 'O Nico tem 3 caixas com 24 parafusos cada uma. Usou 50 parafusos. Quantos sobram?', opcoes: ['22', '28', '26', '74'], certa: 0 },
      { id: 'pv15', area: 'mat', tipo: 'arrastar', pergunta: 'Liga cada fração ao número decimal igual.', linhas: [['1/2', '0,5'], ['1/4', '0,25'], ['3/4', '0,75']], extra: ['0,3'] },
      { id: 'pv16', area: 'mat', tipo: 'curta', pergunta: 'Uma viagem de Messejana a Lisboa começa às 9h40 e demora 2 horas e 30 minutos. A que horas acaba?', instr: 'Escreve assim: 00h00',
        aceitar: ['12h10', '12:10', '12h10m', '12 h 10', '12h 10', '12 horas e 10 minutos'], largura: '160px' },
    ],
  };
  // ================================================================================================= MISSÃO
  const X = {
    id: 'percurso-4', chave: 'nico.percurso4.v1', pagina: 'percurso.html',
    titulo: 'Percurso 4.º ano', tema: 'A Mostra de Invenções do Nico', cor: '#0e9f6e',
    descricao: 'Construir pontes, investigar avarias, escrever cartas e programar — e chegar à prova no computador a dominar o rato e o teclado.',
    boasVindas: { nico: 'Olá! Este é o nosso percurso do 4.º ano. Em cada sessão treinamos as mãos, programamos e resolvemos desafios de Matemática e Português. Escolhe uma sessão!',
      _: 'Olá! Este é o percurso do 4.º ano. Em cada sessão treinamos as mãos, programamos e resolvemos desafios de Matemática e Português. Escolhe uma sessão!' },
    sessoes, prova,
  };
  // compatível com o resto do Nico (ecrã inicial, turmas, professor): cada sessão é um «nível» e cada atividade um «desafio»
  X.niveis = sessoes.map(s => ({ nome: s.titulo, desafios: s.estacoes.flatMap(e => e.atividades) }));
  const totalAtividades = X.niveis.reduce((t, n) => t + n.desafios.length, 0);
  X.textoNiveis = `${sessoes.length} sessões · ${totalAtividades} atividades · prova-ensaio`;
  // resumo para a área do professor: certas por área e a última prova-ensaio
  const AREA_DE = {};
  sessoes.forEach(s => s.estacoes.forEach(e => e.atividades.forEach(a => { AREA_DE[a.id] = e.area; })));
  const NOMES = { maos: 'Rato/teclado', prog: 'Programar', mat: 'Matemática', port: 'Português' };
  X.resumoExtra = d => {
    const por = {};
    Object.entries((d && d.at) || {}).forEach(([id, r]) => { const a = AREA_DE[id]; if (!a) return; por[a] = por[a] || [0, 0]; por[a][1]++; if (r.ok) por[a][0]++; });
    const p = d && d.provas && d.provas[d.provas.length - 1];
    const det = Object.keys(NOMES).filter(a => por[a]).map(a => `${NOMES[a]} ${por[a][0]}/${por[a][1]} certas`);
    if (p) det.push(`Prova-ensaio ${p.certas}/${p.total} (${p.quando.slice(0, 10)})`);
    return { detalhe: det.join(' · '), prova: p ? `${p.certas}/${p.total}` : null };
  };
  F.MISSOES[X.id] = X;
  F.ORDEM_MISSOES.push(X.id);
})();
