/* Nico · Percurso 4.º ano — «O Nico e o Mapa de Cobre»: os capítulos pelo concelho de Aljustrel (Nov 2026).
 *
 * Pedido do Carlos (5 Nov 2026), com as ideias do Jaime (que testou o percurso): moedas em vez de bolotas, que servem
 * para comprar jogos extra, decoração e o bilhete para o capítulo seguinte; capítulos nas terras do concelho
 * (Montes Velhos → Ervidel → Aljustrel → Messejana) com uma história; mais jogos e mais colados às Aprendizagens
 * Essenciais do 4.º ano; ditados; e o Estudo do Meio com estação própria.
 *
 * Este ficheiro é lido ANTES de missoes/percurso-4ano.js, que o junta às missões existentes:
 *   capitulos  a ordem da história; cada capítulo agrupa missões (ids) e provas-ensaio
 *   lugares    terra, rótulo e texto de missão novos das missões já existentes (os ids das atividades não mudam)
 *   meio       atividades de Estudo do Meio acrescentadas às missões existentes (estação própria)
 *   missoes    as 4 missões novas, uma por terra
 *   provaFev   a prova-ensaio de fevereiro (fim do capítulo de Ervidel, perto das provas-ensaio do IAVE)
 *
 * Factos sobre as terras verificados em fontes públicas (Nov 2026): Montes Velhos e Jungeiros na freguesia de São João
 * de Negrilhos; Ervidel e a Barragem do Roxo; a exploração mineira de Aljustrel (pirite cúprica), Vipasca (nome romano)
 * e o foral de 1252 dado por D. Afonso III; Messejana, sede de concelho até 1855, com pelourinho manuelino.
 * Pormenores das terras a confirmar com a escola e as Juntas antes de usar em mais textos.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const T = () => F.PC.terr;

  // ------------------------------------------------------------ a história
  const capitulos = [
    { id: 'c1', n: 1, nome: 'Montes Velhos', cenario: 'montado', bilhete: 0, sessoes: ['s1', 's2', 'v1'], provas: [],
      historia: 'O mapa de cobre que guia os inventores até à Mostra, no castelo de Messejana, partiu-se em quatro pedaços. O Nico parte de Montes Velhos na bicicleta-oficina. Aqui, a Junta precisa de placas, de cortiça e de um inquérito — e quem ajudar recebe o primeiro pedaço do mapa.' },
    { id: 'c2', n: 2, nome: 'Ervidel', cenario: 'agua', bilhete: 30, sessoes: ['m1', 's3', 's5', 'v2'], provas: ['fev'],
      historia: 'Em Ervidel há água: a ribeira e a Barragem do Roxo, que rega os campos. A ponte caiu, as hortas têm sede e a Feira precisa de uma banca com as contas certas. No fim, a prova-ensaio de fevereiro.' },
    { id: 'c3', n: 3, nome: 'Aljustrel', cenario: 'patrimonio', bilhete: 35, sessoes: ['s6', 'v3'], provas: [],
      historia: 'Aljustrel é terra de minas desde o tempo dos romanos, que lhe chamavam Vipasca. É daqui que vem o cobre das moedas do Nico! Há um painel no castelo para corrigir, vagonetas para organizar e um moinho para desenhar.' },
    { id: 'c4', n: 4, nome: 'Messejana', cenario: 'messejana', bilhete: 40, sessoes: ['s4', 'v4'], provas: ['final'],
      historia: 'Chegaste a Messejana com o mapa quase completo! No FabLab preparam-se as invenções, o Jornal de Messejana quer uma notícia e, no castelo, esperam-te os Desafios do Castelo.' },
  ];

  // ------------------------------------------------------------ as missões que já existiam, agora nas terras
  const lugares = {
    s1: { rotulo: 'Missão 1.1', lugar: 'Montes Velhos', missao: 'Os visitantes da Mostra vão partir de Montes Velhos e perdem-se no caminho. O Nico precisa de placas que apontem bem para norte, sul, este e oeste.' },
    s2: { rotulo: 'Missão 1.2', lugar: 'Montado' },
    m1: { rotulo: 'Missão 2.1', lugar: 'Ribeira do Roxo' },
    s3: { rotulo: 'Missão 2.2', lugar: 'Barragem do Roxo', missao: 'As hortas de Ervidel precisam de água, mas o depósito tem pouca. No Observatório da Água, junto à Barragem do Roxo, o Nico mede e programa a rega para não desperdiçar.' },
    s5: { rotulo: 'Missão 2.3', lugar: 'Hortas de Ervidel' },
    s6: { rotulo: 'Missão 3.1', lugar: 'Castelo de Aljustrel', missao: 'No castelo de Aljustrel há um painel de azulejos sobre a história de Portugal com uma legenda errada. O Nico investiga as datas e a turma completa o painel em espelho.' },
    s4: { rotulo: 'Missão 4.1', lugar: 'FabLab de Messejana', missao: 'Na Mostra vai haver um café de reparações. A turma treina no FabLab de Messejana: constrói com decimais, conserta a luz da bicicleta e escreve as instruções.' },
  };

  // ------------------------------------------------------------ Estudo do Meio nas missões que já existiam
  const meio = {
    m1: [{ id: 'm1-e1', tipo: 'vf', pergunta: 'Seres vivos da ribeira. Indica se cada afirmação é verdadeira ou falsa.',
      afirmacoes: [['Os peixes respiram dentro de água, pelas guelras.', true], ['As rãs, quando nascem, são girinos.', true], ['As plantas da margem não precisam de água.', false]] }],
    s1: [
      { id: 's1-e1', tipo: 'escolha', pergunta: 'Em Portugal, ao meio-dia, espetas um pau no chão ao Sol. Para onde aponta a sombra?', opcoes: ['Para norte.', 'Para sul.', 'Para este.', 'Para oeste.'], certa: 0,
        pistas: ['Ao meio-dia, em Portugal, o Sol está a sul.', 'A sombra fica sempre do lado contrário ao Sol.'] },
      { id: 's1-e2', tipo: 'vf', pergunta: 'Portugal. Verdadeiro ou falso?',
        afirmacoes: [['Lisboa é a capital de Portugal.', true], ['O hino nacional chama-se «A Portuguesa».', true], ['O rio Tejo nasce em Portugal.', false]] },
    ],
    s2: [{ id: 's2-e1', tipo: 'arrastar', pergunta: 'O montado. Liga cada palavra à sua explicação.',
      linhas: [['cortiça', 'casca do sobreiro'], ['bolota', 'fruto do sobreiro e da azinheira'], ['montado', 'floresta de sobreiros e azinheiras com pastagem']], extra: ['árvore que perde as folhas no outono'] }],
    s3: [{ id: 's3-e1', tipo: 'escolha', pergunta: 'Qual destas ações poupa água em casa?', opcoes: ['Tomar duche rápido em vez de banho de imersão.', 'Deixar a torneira aberta ao lavar os dentes.', 'Regar o jardim ao meio-dia, no verão.', 'Lavar a loiça com a água sempre a correr.'], certa: 0 }],
    s4: [{ id: 's4-e1', tipo: 'arrastar', pergunta: 'Para que ecoponto vai cada resíduo?',
      linhas: [['garrafa de vidro', 'vidrão (verde)'], ['caixa de cartão', 'papelão (azul)'], ['lata de refrigerante', 'embalão (amarelo)']], extra: ['pilhão (vermelho)'] }],
    s5: [{ id: 's5-e1', tipo: 'escolha', pergunta: 'Na Roda dos Alimentos, qual é o grupo que deve ocupar a maior parte do que comemos por dia?',
      opcoes: ['Cereais e derivados, tubérculos.', 'Gorduras e óleos.', 'Carne, pescado e ovos.', 'Laticínios.'], certa: 0 }],
    s6: [{ id: 's6-e1', tipo: 'ordenar', pergunta: 'Põe os acontecimentos por ordem, do mais antigo para o mais recente.',
      itens: ['1143 · Tratado de Zamora', '1147 · conquista de Lisboa', '1252 · D. Afonso III dá foral a Aljustrel', '1498 · Vasco da Gama chega à Índia'] }],
  };

  // ------------------------------------------------------------ pistas
  const P_DIT = ['Ouve a frase toda antes de começar a escrever.', 'Carrega em 🐢 para ouvires mais devagar.', 'No fim, relê: maiúsculas, acentos e pontuação.'];
  const P_RAD = ['Lê as perguntas antes de ouvir: assim sabes o que procurar.', 'Enquanto ouves, pensa nas palavras das perguntas.', 'Na segunda vez, ouve só as partes que te faltam.'];
  const P_TART = ['O Nico começa virado para cima (norte). «Roda 90°» é um quarto de volta.', 'Usa 👣 Um passo e segue o Nico com o dedo.', 'Há uma parte que se repete? Põe-na dentro de um «repete».'];
  const P_TRI = ['Lê para onde tem de ir cada coisa.', 'O «senão» apanha tudo o que não cumpre as condições de cima.', 'Junta um «senão, se…» para o terceiro destino.'];

  // ================================================================================================ capítulo 1
  const v1 = {
    id: 'v1', rotulo: 'Missão 1.3', lugar: 'Junta de Freguesia', titulo: 'O inquérito de Montes Velhos', marca: [420, 300],
    transforma: { id: 'mapa1', texto: '1.º pedaço do mapa de cobre ✓' }, cenario: 'montado',
    missao: 'A Junta de Freguesia quer pedir mais um autocarro para a escola, mas precisa de números: como vêm as crianças para a escola? O Nico faz o inquérito — e a Junta entrega-lhe o primeiro pedaço do mapa de cobre.',
    resumo: 'Inquérito, tabela de frequências, gráfico e moda · condições · rádio e ditado · a localidade, a freguesia e o concelho.',
    estacoes: [
      { area: 'port', titulo: 'Ditado', atividades: [
        { id: 'v1-dit', tipo: 'ditado', titulo: 'Ditado da Junta', modo: 'fim', pistas: P_DIT,
          frases: ['Montes Velhos fica no concelho de Aljustrel.', 'O Nico foi de bicicleta até à Junta de Freguesia.', 'Na praça, as pessoas conversam à sombra das árvores.'] },
      ] },
      { area: 'mat', titulo: 'O inquérito', atividades: [
        { id: 'v1-inq', tipo: 'inquerito', titulo: 'Como vens para a escola?', pergunta: 'O Nico perguntou a 20 crianças como vêm para a escola. Conta as respostas, faz a tabela e o gráfico, e descobre a moda.',
          tema: 'Como vens para a escola?', coluna: 'Como vem', categorias: ['a pé', 'autocarro', 'carro', 'bicicleta'],
          respostas: ['autocarro', 'a pé', 'autocarro', 'carro', 'a pé', 'autocarro', 'bicicleta', 'autocarro', 'a pé', 'carro', 'autocarro', 'a pé', 'autocarro', 'carro', 'a pé', 'bicicleta', 'autocarro', 'carro', 'a pé', 'autocarro'],
          ditos: ['Venho no autocarro da escola.', 'Moro aqui ao lado, venho a pé.', 'Apanho o autocarro em Jungeiros.', 'A minha mãe traz-me de carro.', 'Venho a pé com o meu irmão.', 'Venho de autocarro.', 'Venho de bicicleta!', 'O autocarro passa à minha porta.', 'Venho a pé com a avó.', 'O meu pai deixa-me de carro.', 'Venho de autocarro.', 'A pé, que é perto.', 'Venho no autocarro.', 'De carro, com a minha tia.', 'Venho a pé.', 'De bicicleta, pela estrada de terra.', 'Venho de autocarro.', 'Venho de carro.', 'Venho a pé.', 'Venho no autocarro.'],
          pessoas: ['Inês', 'Tomás', 'Leonor', 'Rafael', 'Beatriz', 'Duarte', 'Matilde', 'Gonçalo', 'Carolina', 'Martim', 'Alice', 'Rodrigo', 'Sofia', 'Afonso', 'Clara', 'Lourenço', 'Maria', 'Santiago', 'Margarida', 'Vicente'],
          conclusao: 'A moda é «autocarro»: a Junta já tem um bom argumento para pedir mais um autocarro!',
          pistas: ['Faz um risco de cada vez. Cinco riscos fazem um molho.', 'A frequência é o número de riscos.', 'A moda é a resposta que aparece mais vezes.'] },
        { id: 'v1-m2', tipo: 'curta', pergunta: 'No inquérito, 8 crianças vêm de autocarro. Se mais 3 crianças passarem a vir de autocarro, quantas serão?', numero: 11, depois: 'crianças', largura: '110px' },
      ] },
      { area: 'prog', titulo: 'O carteiro', atividades: [
        { id: 'v1-tri', tipo: 'triagem', titulo: 'O saco do carteiro', item: 'carta', se: 'se a morada for',
          pergunta: 'O carteiro da freguesia separa as cartas: as de Montes Velhos num saco, as de Jungeiros noutro, e as das outras terras num terceiro. Programa a triagem.',
          condicoes: ['Montes Velhos', 'Jungeiros', 'Aljustrel', 'Ervidel', 'Messejana'],
          destinos: [['mv', 'Saco de Montes Velhos'], ['ju', 'Saco de Jungeiros'], ['ou', 'Saco das outras terras']],
          itens: [['Montes Velhos', 'Carta para Montes Velhos'], ['Aljustrel', 'Carta para Aljustrel'], ['Jungeiros', 'Carta para Jungeiros'], ['Montes Velhos', 'Postal para Montes Velhos'], ['Messejana', 'Carta para Messejana'], ['Jungeiros', 'Encomenda para Jungeiros'], ['Ervidel', 'Carta para Ervidel']],
          certo: { 'Montes Velhos': 'mv', Jungeiros: 'ju', Aljustrel: 'ou', Ervidel: 'ou', Messejana: 'ou' }, maxRegras: 2,
          inicial: { regras: [{ se: 'Montes Velhos', vai: 'mv' }], senao: 'mv' },
          solucao: { regras: [{ se: 'Montes Velhos', vai: 'mv' }, { se: 'Jungeiros', vai: 'ju' }], senao: 'ou' }, pistas: P_TRI },
      ] },
      { area: 'port', titulo: 'Ouvir, ler e construir', atividades: [
        { id: 'v1-rad', tipo: 'radio', titulo: 'Rádio: a escola de antigamente', programa: 'Montes Velhos', pistas: P_RAD,
          texto: ['Bom dia! Hoje temos connosco a avó Rosa, que andou na escola há muitos anos.',
            'Avó Rosa, como ia para a escola? — Ia a pé, por um caminho de terra, com os meus irmãos. Quando chovia, chegávamos com os sapatos cheios de lama!',
            'E o que levava na mochila? — Mochila? Levava uma sacola de pano, com a lousa, o lápis e um pedaço de pão com queijo para o lanche.',
            'O que mudou mais? — Agora há autocarro e computadores na escola. Mas as crianças continuam a gostar do recreio, como nós!'],
          perguntas: [
            { p: 'Como ia a avó Rosa para a escola?', opcoes: ['De autocarro.', 'A pé.', 'De bicicleta.', 'De carro.'], certa: 1 },
            { p: 'O que acontecia quando chovia?', opcoes: ['Não havia escola.', 'Chegavam com os sapatos cheios de lama.', 'Iam de carro.', 'Ficavam em casa a ler.'], certa: 1 },
            { p: 'O que levava a avó para o lanche?', opcoes: ['Fruta.', 'Bolachas.', 'Pão com queijo.', 'Nada.'], certa: 2 },
            { p: 'Segundo a avó, o que NÃO mudou?', opcoes: ['As crianças gostam do recreio.', 'Ir a pé para a escola.', 'Escrever na lousa.', 'A sacola de pano.'], certa: 0 },
          ] },
        { id: 'v1-sub', tipo: 'sublinhar', titulo: 'Para que serve a Junta?',
          texto: { titulo: 'A Junta de Freguesia', paragrafos: [
            'Cada concelho está dividido em freguesias. Montes Velhos e Jungeiros, por exemplo, pertencem à freguesia de São João de Negrilhos, no concelho de Aljustrel.',
            'A Junta de Freguesia trata de assuntos do dia a dia da freguesia. Cuida de jardins e caminhos, ajuda as associações e passa alguns documentos às pessoas.',
            'Os membros da Junta são escolhidos pelos habitantes, nas eleições autárquicas. Assim, quem vive na freguesia ajuda a decidir quem a governa.'] },
          perguntas: [
            { p: 'Que frase diz a que freguesia pertence Montes Velhos?', certa: '1.2' },
            { p: 'Que frase dá exemplos do trabalho da Junta?', certa: '2.2' },
            { p: 'Que frase explica como se escolhem os membros da Junta?', certa: '3.1' }],
          pistas: ['Lê a pergunta e procura no texto as palavras dela.', 'A frase certa responde à pergunta sozinha.', 'Só uma frase prova mesmo a resposta.'] },
        { id: 'v1-fr', tipo: 'frases', modo: 'classes', titulo: 'Fábrica de frases: as classes', pergunta: 'Dá a classe de cada palavra destacada. O bloco muda de cor conforme a classe.',
          opcoes: ['nome', 'verbo', 'adjetivo', 'determinante'],
          frases: [[['A', 'determinante'], ['Junta', 'nome'], ['pintou', 'verbo'], ['os', 'determinante'], ['bancos', 'nome'], ['velhos', 'adjetivo'], ['.', null]],
            [['O', 'determinante'], ['autocarro', 'nome'], ['amarelo', 'adjetivo'], ['parou', 'verbo'], ['na', null], ['praça', 'nome'], ['.', null]]],
          pistas: ['O nome diz o que é: pessoa, animal, coisa, lugar.', 'O verbo diz o que se faz: pintou, parou.', 'O determinante vem antes do nome: o, a, os, as.'] },
      ] },
      { area: 'meio', titulo: 'A minha terra', atividades: [
        { id: 'v1-e1', tipo: 'ordenar', pergunta: 'Ordena do mais pequeno para o maior.', itens: ['Montes Velhos (localidade)', 'São João de Negrilhos (freguesia)', 'Aljustrel (concelho)', 'Beja (distrito)', 'Portugal (país)'] },
        { id: 'v1-e2', tipo: 'arrastar', pergunta: 'Liga cada órgão ao que faz.', linhas: [['Junta de Freguesia', 'governa a freguesia'], ['Câmara Municipal', 'governa o concelho'], ['Assembleia da República', 'aprova as leis do país']], extra: ['dirige a escola'] },
        { id: 'v1-e3', tipo: 'vf', pergunta: 'Verdadeiro ou falso?', afirmacoes: [['Uma freguesia é maior do que um concelho.', false], ['O concelho de Aljustrel fica no distrito de Beja.', true], ['Os habitantes do concelho votam para escolher quem governa a Câmara.', true]] },
      ] },
    ],
  };

  // ================================================================================================ capítulo 2
  const v2 = {
    id: 'v2', rotulo: 'Missão 2.4', lugar: 'Feira de Ervidel', titulo: 'A Feira de Ervidel', marca: [700, 380],
    transforma: { id: 'mapa2', texto: '2.º pedaço do mapa de cobre ✓' }, cenario: 'agua',
    missao: 'Na Feira de Ervidel, o Nico tem uma banca para juntar dinheiro para a Mostra. Faz as contas da banca, monta as caixas, organiza a tômbola e arruma os produtos. No fim do dia, a feira dá-lhe o segundo pedaço do mapa.',
    resumo: 'Euros e cêntimos, troco · probabilidades · planificações e sólidos · sujeito e predicado · a água e o corpo humano.',
    estacoes: [
      { area: 'port', titulo: 'Ditado', atividades: [
        { id: 'v2-dit', tipo: 'ditado', titulo: 'Ditado da feira', modo: 'cada', pistas: P_DIT,
          frases: ['A Barragem do Roxo guarda água para regar os campos.', 'Na feira, o Nico vendeu queijo, mel e azeitonas.', 'Quem é que ganhou o prémio da tômbola?'] },
      ] },
      { area: 'mat', titulo: 'A banca do Nico', atividades: [
        { id: 'v2-fei', tipo: 'feira', titulo: 'Contas certas na banca', pistas: ['1 € são 100 cêntimos.', 'Começa pelas moedas maiores e vê quanto falta.', 'Troco = o que a pessoa deu − o preço.'],
          rondas: [
            { tipo: 'pagar', quem: 'O Nico', oque: 'um frasco de mel', preco: '2,35' },
            { tipo: 'troco', quem: 'A Dona Graça', oque: 'um queijo', preco: '3,70', pago: '5' },
            { tipo: 'pagar', quem: 'O Rui', oque: 'um saco de laranjas', preco: '0,85' },
            { tipo: 'troco', quem: 'O Sr. Manuel', oque: 'azeitonas e pão', preco: '6,45', pago: '10' },
            { tipo: 'orcamento', tem: '5', n: 3, produtos: [['Pão', '1,20'], ['Queijo fresco', '2,50'], ['Azeitonas', '1,40'], ['Mel', '3,10'], ['Laranjas', '0,90']], solucao: [0, 2, 4] },
          ] },
        { id: 'v2-sac', tipo: 'saco', titulo: 'A tômbola da feira', pistas: ['Conta as bolas de cada cor.', 'Certo: acontece sempre. Impossível: nunca acontece.', 'Mais provável: há mais bolas dessa cor em comparação com as outras.'],
          rondas: [
            { tipo: 'classificar', saco: { azul: 4 }, cor: 'azul', porque: 'Todas as bolas são azuis: é certo.' },
            { tipo: 'classificar', saco: { azul: 3, amarela: 2 }, cor: 'vermelha', porque: 'Não há bolas vermelhas: é impossível.' },
            { tipo: 'classificar', saco: { azul: 3, amarela: 2 }, cor: 'amarela', porque: 'Há bolas amarelas, mas não só: é possível.' },
            { tipo: 'comparar', sacos: [{ azul: 3, vermelha: 1 }, { azul: 2, vermelha: 2 }], cor: 'azul', porque: 'No saco A, 3 das 4 bolas são azuis; no B só 2 das 4.' },
            { tipo: 'simular', saco: { azul: 6, vermelha: 2 }, n: 20, porque: 'Há muito mais bolas azuis, por isso costuma sair mais azul — mas a sorte pode variar!' },
          ] },
        { id: 'v2-pla', tipo: 'planificacao', titulo: 'As caixas da feira', pergunta: 'O Nico precisa de caixas para levar os queijos. Primeiro monta a planificação de um cubo; depois conta as faces, arestas e vértices de outros sólidos.',
          solidos: ['cubo', 'prisma3', 'piramide4'], pistas: ['Um cubo tem 6 faces quadradas.', 'Experimenta 4 quadrados em fila e 1 de cada lado.', 'Conta as arestas escondidas (tracejadas).'] },
      ] },
      { area: 'prog', titulo: 'Arrumar a banca', atividades: [
        { id: 'v2-tri', tipo: 'triagem', titulo: 'Cada produto no seu sítio', item: 'produto', se: 'se o produto for',
          pergunta: 'Fruta vai para o cesto, laticínios para a caixa fresca e o resto para a prateleira. Programa a arrumação.',
          condicoes: ['fruta', 'laticínio', 'pão', 'conserva'],
          destinos: [['cesto', 'Cesto'], ['fresco', 'Caixa fresca'], ['prat', 'Prateleira']],
          itens: [['fruta', 'Laranjas'], ['laticínio', 'Queijo'], ['pão', 'Pão'], ['fruta', 'Maçãs'], ['conserva', 'Azeitonas'], ['laticínio', 'Iogurtes'], ['conserva', 'Mel']],
          certo: { fruta: 'cesto', 'laticínio': 'fresco', 'pão': 'prat', conserva: 'prat' }, maxRegras: 2,
          inicial: { regras: [{ se: 'fruta', vai: 'cesto' }], senao: 'fresco' },
          solucao: { regras: [{ se: 'fruta', vai: 'cesto' }, { se: 'laticínio', vai: 'fresco' }], senao: 'prat' }, pistas: P_TRI },
      ] },
      { area: 'port', titulo: 'Ouvir e construir', atividades: [
        { id: 'v2-rad', tipo: 'radio', titulo: 'Rádio: o anúncio da feira', programa: 'Ervidel', pistas: P_RAD,
          texto: ['Atenção, atenção! Este fim de semana há feira em Ervidel!',
            'No sábado de manhã, há banca de produtos da terra: queijo, mel, azeite e pão. À tarde, há jogos tradicionais para os mais novos, como a corrida de sacos.',
            'No domingo, às quatro da tarde, há a tômbola. Cada rifa custa cinquenta cêntimos e o dinheiro ajuda a Mostra de Invenções do Nico.',
            'Não se esqueçam: tragam um saco de pano para as compras. Esperamos por vocês!'],
          perguntas: [
            { p: 'Quando há jogos tradicionais?', opcoes: ['Sábado de manhã.', 'Sábado à tarde.', 'Domingo de manhã.', 'Domingo à tarde.'], certa: 1 },
            { p: 'Quanto custa uma rifa?', opcoes: ['5 cêntimos.', '50 cêntimos.', '1 euro.', '5 euros.'], certa: 1 },
            { p: 'Para que serve o dinheiro da tômbola?', opcoes: ['Para a Junta.', 'Para a Mostra de Invenções.', 'Para comprar sacos.', 'Para a escola de Ervidel.'], certa: 1 },
            { p: 'O que pedem para levar?', opcoes: ['Um saco de pano.', 'Uma rifa.', 'Dinheiro trocado.', 'Um chapéu.'], certa: 0 },
          ] },
        { id: 'v2-fr', tipo: 'frases', modo: 'sujeito', titulo: 'Fábrica de frases: sujeito e predicado', pergunta: 'Em cada frase, clica no «|» onde acaba o sujeito. O sujeito diz quem faz; o predicado diz o que faz.',
          frases: [['O Nico vendeu mel na feira.', 2], ['A avó do Rui comprou laranjas.', 4], ['Os vizinhos de Ervidel visitaram a banca.', 4], ['A tômbola começou às quatro.', 2]],
          pistas: ['Pergunta ao verbo: quem é que vendeu?', 'O sujeito pode ter várias palavras: «A avó do Rui».', 'O predicado começa no verbo.'] },
      ] },
      { area: 'meio', titulo: 'A água e o corpo', atividades: [
        { id: 'v2-e1', tipo: 'arrastar', pergunta: 'Liga cada exemplo ao estado físico da água.', linhas: [['gelo', 'sólido'], ['água da barragem', 'líquido'], ['vapor que sai da panela', 'gasoso']] },
        { id: 'v2-e2', tipo: 'escolha', pergunta: 'Com o calor do Sol, a água da barragem passa a vapor. Como se chama esta mudança?', opcoes: ['Evaporação.', 'Condensação.', 'Solidificação.', 'Fusão.'], certa: 0 },
        { id: 'v2-e3', tipo: 'vf', pergunta: 'A barragem. Verdadeiro ou falso?', afirmacoes: [['Uma barragem guarda água num grande lago artificial, a albufeira.', true], ['A água da chuva ajuda a encher a barragem.', true], ['A água da barragem não serve para regar.', false]] },
        { id: 'v2-e4', tipo: 'ordenar', pergunta: 'O queijo da feira faz uma viagem dentro de nós. Ordena o caminho dos alimentos no sistema digestivo.', itens: ['boca', 'esófago', 'estômago', 'intestino delgado', 'intestino grosso'] },
      ] },
    ],
  };

  // ================================================================================================ capítulo 3
  const sol = (lista) => lista;
  const VELAS = sol([{ op: 'repete', n: 4, corpo: [{ op: 'avanca', n: 3 }, { op: 'recua', n: 3 }, { op: 'dir' }] }]);
  const v3 = {
    id: 'v3', rotulo: 'Missão 3.2', lugar: 'Minas de Aljustrel', titulo: 'A mina e o moinho', marca: [980, 640],
    transforma: { id: 'mapa3', texto: '3.º pedaço do mapa de cobre ✓' }, cenario: 'patrimonio',
    missao: 'Em Aljustrel tira-se minério da terra desde o tempo dos romanos. O Nico visita a mina: organiza as vagonetas, experimenta o cobre num circuito, escava como um arqueólogo e desenha as velas do moinho. O mineiro mais velho guarda o terceiro pedaço do mapa.',
    resumo: 'Desenhar com blocos (polígonos, perímetro, ângulos retos) · condições · condutores e isoladores · tempo histórico · construir frases.',
    estacoes: [
      { area: 'prog', titulo: 'As vagonetas da mina', atividades: [
        { id: 'v3-tri', tipo: 'triagem', titulo: 'Para onde vai cada vagoneta?', item: 'vagoneta', se: 'se a carga for',
          pergunta: 'O minério de cobre vai para a lavaria, a pedra sem minério para a escombreira e as ferramentas partidas para a oficina. Programa as agulhas dos carris.',
          condicoes: ['minério de cobre', 'pedra sem minério', 'ferramenta partida'],
          destinos: [['lav', 'Lavaria'], ['esc', 'Escombreira'], ['ofi', 'Oficina']],
          itens: [['minério de cobre', 'Vagoneta 1: minério'], ['pedra sem minério', 'Vagoneta 2: pedra'], ['minério de cobre', 'Vagoneta 3: minério'], ['ferramenta partida', 'Vagoneta 4: picareta partida'], ['pedra sem minério', 'Vagoneta 5: pedra'], ['minério de cobre', 'Vagoneta 6: minério']],
          certo: { 'minério de cobre': 'lav', 'pedra sem minério': 'esc', 'ferramenta partida': 'ofi' }, maxRegras: 2,
          inicial: { regras: [{ se: 'minério de cobre', vai: 'lav' }], senao: 'lav' },
          solucao: { regras: [{ se: 'minério de cobre', vai: 'lav' }, { se: 'ferramenta partida', vai: 'ofi' }], senao: 'esc' }, pistas: P_TRI },
      ] },
      { area: 'mat', titulo: 'Desenhar com o Nico', atividades: [
        { id: 'v3-tar1', tipo: 'tartaruga', titulo: 'O poço quadrado', pergunta: 'Desenha a boca do poço da mina: um quadrado com lados de 3 passos. Consegues com só 3 blocos?',
          inicio: [3, 7], alvo: { lados: 4, medidas: [3, 3, 3, 3], perimetro: 12 }, maxBlocos: 3, blocos: ['avanca', 'dir', 'esq', 'repete'],
          solucao: [{ op: 'repete', n: 4, corpo: [{ op: 'avanca', n: 3 }, { op: 'dir' }] }], feito: 'Um quadrado perfeito: 4 lados iguais e 4 ângulos retos. Perímetro: 12 passos.', pistas: P_TART },
        { id: 'v3-tar2', tipo: 'tartaruga', titulo: 'O retângulo da lavaria', pergunta: 'A lavaria tem a forma de um retângulo com 4 passos de comprimento e 2 de largura. Desenha-a. Qual é o perímetro?',
          inicio: [2, 6], alvo: { lados: 4, medidas: [4, 2, 4, 2], perimetro: 12 }, maxBlocos: 6, blocos: ['avanca', 'dir', 'esq', 'repete'],
          solucao: [{ op: 'repete', n: 2, corpo: [{ op: 'avanca', n: 4 }, { op: 'dir' }, { op: 'avanca', n: 2 }, { op: 'dir' }] }], feito: 'Perímetro = 4 + 2 + 4 + 2 = 12 passos.', pistas: P_TART },
        { id: 'v3-tar3', tipo: 'tartaruga', titulo: 'As velas do moinho', pergunta: 'O moinho de vento de Aljustrel está sem velas! Desenha 4 velas a sair do centro, cada uma com 3 passos (segue o modelo azul).',
          inicio: [5, 5], alvo: { segs: [[5, 2, 5, 8], [2, 5, 8, 5]] }, maxBlocos: 4, blocos: ['avanca', 'recua', 'dir', 'esq', 'repete'],
          solucao: VELAS, feito: 'O moinho já tem velas! Rodar 90° quatro vezes é dar uma volta inteira.', pistas: ['Cada vela: avança 3 e volta para trás 3.', 'Depois de cada vela, roda um quarto de volta.', 'São 4 velas iguais: repete 4 vezes.'] },
      ] },
      { area: 'meio', titulo: 'Minas, cobre e história', atividades: [
        { id: 'v3-cir', tipo: 'circuito', titulo: 'O cobre conduz?', pergunta: 'Na oficina da mina há uma pilha, fios e uma lâmpada. Experimenta cada material no espaço vazio do circuito.',
          materiais: [['fio de cobre', true], ['prego de ferro', true], ['moeda', true], ['borracha', false], ['palito de madeira', false], ['rolha de cortiça', false], ['régua de plástico', false]],
          porque: 'Os metais, como o cobre e o ferro, deixam passar a corrente elétrica: são bons condutores. A borracha, a madeira, a cortiça e o plástico não a deixam passar: são isoladores.',
          pistas: ['Clica em cada material para o pôr no circuito.', 'Repara: com quais é que a lâmpada acende?', 'Os materiais que acendem a lâmpada são condutores.'] },
        { id: 'v3-arq', tipo: 'arqueologia', titulo: 'Escavar junto à mina', pergunta: 'Uma arqueóloga escava junto à mina de Aljustrel. Ajuda-a! (Os achados são imaginados para este jogo.)',
          camadas: [
            { achado: 'Garrafa de plástico', epoca: 'dos nossos dias' },
            { achado: 'Lanterna de mineiro', epoca: 'de há cerca de cem anos (século XX)' },
            { achado: 'Moeda do rei D. Manuel I', epoca: 'de há uns quinhentos anos (século XVI)' },
            { achado: 'Candeia de barro romana', epoca: 'do tempo dos romanos, há quase dois mil anos' }],
          feito: 'Quanto mais fundo, mais antigo — e já sabes pôr a história por ordem!',
          pistas: ['Escava de cima para baixo.', 'As camadas de terra juntam-se por cima, ao longo do tempo.', 'O mais antigo está no fundo; o mais recente em cima.'] },
        { id: 'v3-e1', tipo: 'escolha', pergunta: 'No tempo dos romanos, que nome tinha Aljustrel?', opcoes: ['Vipasca.', 'Olisipo.', 'Pax Julia.', 'Ebora.'], certa: 0,
          pistas: ['Olisipo era Lisboa, Pax Julia era Beja e Ebora era Évora.'] },
        { id: 'v3-e2', tipo: 'escolha', pergunta: 'Em 1252, Aljustrel recebeu um foral (uma carta com as regras e os direitos da terra). Que rei o deu?', opcoes: ['D. Afonso Henriques.', 'D. Afonso III.', 'D. Dinis.', 'D. Manuel I.'], certa: 1 },
        { id: 'v3-e3', tipo: 'vf', pergunta: 'Rochas e minerais. Verdadeiro ou falso?', afirmacoes: [['Um minério é uma rocha de onde se pode tirar um metal.', true], ['A pirite brilha como o ouro, mas não é ouro.', true], ['O cobre é um mau condutor de eletricidade.', false]] },
      ] },
      { area: 'port', titulo: 'Ouvir, escrever e construir', atividades: [
        { id: 'v3-rad', tipo: 'radio', titulo: 'Rádio: o avô mineiro', programa: 'Aljustrel', pistas: P_RAD,
          texto: ['Hoje a nossa rádio foi conversar com o avô Joaquim, que trabalhou muitos anos na mina.',
            'Avô, como era um dia na mina? — Começava cedo. Púnhamos o capacete com a lanterna e descíamos num elevador a que chamávamos gaiola. Lá em baixo era escuro e fazia calor.',
            'E o que fazia? — Partia a rocha e enchia as vagonetas com minério. As vagonetas andavam em carris até ao poço e subiam cá para cima.',
            'Do que gostava mais? — Dos colegas. Na mina, ninguém trabalha sozinho: todos cuidam de todos.'],
          perguntas: [
            { p: 'Como desciam os mineiros?', opcoes: ['Por uma escada.', 'Num elevador chamado gaiola.', 'Numa vagoneta.', 'De corda.'], certa: 1 },
            { p: 'Como era lá em baixo?', opcoes: ['Escuro e quente.', 'Claro e frio.', 'Escuro e frio.', 'Com muito vento.'], certa: 0 },
            { p: 'Para que serviam as vagonetas?', opcoes: ['Para levar os mineiros.', 'Para levar o minério.', 'Para guardar a lanterna.', 'Para o lanche.'], certa: 1 },
            { p: 'De que gostava mais o avô Joaquim?', opcoes: ['Do calor.', 'Do capacete.', 'Dos colegas.', 'Do elevador.'], certa: 2 },
          ] },
        { id: 'v3-dit', tipo: 'ditado', titulo: 'Ditado da mina', modo: 'fim', pistas: P_DIT,
          frases: ['Os romanos tiravam minério das minas de Aljustrel.', 'O mineiro desceu à mina com o capacete e a lanterna.', 'As velas do moinho rodam com o vento.'] },
        { id: 'v3-fr', tipo: 'frases', modo: 'construir', titulo: 'Fábrica de frases: construir', pergunta: 'Constrói uma frase com o molde: determinante + nome + verbo + determinante + nome + adjetivo. Pode ser divertida!',
          molde: ['determinante', 'nome', 'verbo', 'determinante', 'nome', 'adjetivo'],
          pecas: [['o', 'determinante'], ['um', 'determinante'], ['mineiro', 'nome'], ['moinho', 'nome'], ['minério', 'nome'], ['encontrou', 'verbo'], ['viu', 'verbo'], ['brilhante', 'adjetivo'], ['antigo', 'adjetivo']],
          pistas: ['Cada encaixe diz a classe que pede.', 'Determinante antes do nome: «o», «um».', 'O adjetivo diz como é: «brilhante», «antigo».'] },
      ] },
    ],
  };

  // ================================================================================================ capítulo 4
  const v4 = {
    id: 'v4', rotulo: 'Missão 4.2', lugar: 'Messejana', titulo: 'O Jornal de Messejana', marca: [1180, 300],
    transforma: { id: 'mapa4', texto: 'Mapa de cobre completo ✓' }, cenario: 'messejana',
    missao: 'Chegaste a Messejana! Antes da Mostra, o Jornal de Messejana quer uma notícia. O Nico investiga a história da vila, olha para o céu à noite, desenha as ameias do castelo e escreve. Com o último pedaço, o mapa de cobre fica completo.',
    resumo: 'Escrita com plano e revisão · ditado · rádio · ler e provar · ameias com blocos · horas · História e Sistema Solar.',
    estacoes: [
      { area: 'port', titulo: 'Ditado', atividades: [
        { id: 'v4-dit', tipo: 'ditado', titulo: 'Ditado de Messejana', modo: 'fim', pistas: P_DIT,
          frases: ['Messejana tem um pelourinho, uma praça e casas caiadas de branco.', 'As barras das casas são pintadas de azul ou de amarelo.', 'No FabLab, o Nico e a turma prepararam as invenções.', 'Amanhã, todos vão à Mostra de Invenções!'] },
      ] },
      { area: 'port', titulo: 'Ouvir e ler', atividades: [
        { id: 'v4-rad', tipo: 'radio', titulo: 'Rádio: a história da vila', programa: 'Messejana', pistas: P_RAD,
          texto: ['Bem-vindos ao programa «A nossa terra». Hoje falamos de Messejana.',
            'Durante muitos séculos, Messejana foi sede de concelho, com a sua própria câmara. Em 1855 o concelho acabou e Messejana passou a ser uma freguesia do concelho de Aljustrel.',
            'Na vila há um pelourinho de estilo manuelino, o estilo do tempo do rei D. Manuel I. O pelourinho era o símbolo de que a terra tinha concelho.',
            'Hoje, quem passeia por Messejana vê o castelo, as igrejas e as casas brancas. E, numa das ruas, o FabLab onde o Nico prepara as invenções!'],
          perguntas: [
            { p: 'Até que ano foi Messejana sede de concelho?', opcoes: ['1755.', '1855.', '1910.', '1974.'], certa: 1 },
            { p: 'Hoje, Messejana pertence ao concelho de…', opcoes: ['Beja.', 'Ourique.', 'Aljustrel.', 'Castro Verde.'], certa: 2 },
            { p: 'O pelourinho é de estilo…', opcoes: ['manuelino.', 'romano.', 'moderno.', 'árabe.'], certa: 0 },
            { p: 'O que mostrava um pelourinho?', opcoes: ['Que a terra tinha concelho.', 'Onde ficava o castelo.', 'Que havia feira.', 'Onde morava o rei.'], certa: 0 },
          ] },
        { id: 'v4-sub', tipo: 'sublinhar', titulo: 'As casas brancas',
          texto: { titulo: 'Porque são brancas as casas do Alentejo?', paragrafos: [
            'Quem chega a Messejana repara logo nas casas brancas, com barras azuis ou amarelas à volta das portas e das janelas.',
            'A cor branca vem da cal. A cal faz-se aquecendo uma pedra chamada calcário, até ficar em pó.',
            'No verão, o Sol do Alentejo é muito forte. As paredes brancas refletem a luz do Sol e, por isso, as casas aquecem menos por dentro.',
            'Antigamente, as famílias caiavam as casas todos os anos, antes das festas. Ainda hoje há quem mantenha esta tradição.'] },
          perguntas: [
            { p: 'Que frase explica porque é que as casas brancas aquecem menos?', certa: '3.2' },
            { p: 'Que frase diz como se faz a cal?', certa: '2.2' },
            { p: 'Que frase fala de uma tradição?', certa: '4.1' }],
          pistas: ['Lê a pergunta e procura no texto as palavras dela.', 'A frase certa responde à pergunta sozinha.', 'Só uma frase prova mesmo a resposta.'] },
      ] },
      { area: 'port', titulo: 'O jornal', atividades: [
        { id: 'v4-jor', tipo: 'jornal', titulo: 'A notícia da Mostra', jornal: 'Jornal de Messejana', min: 40,
          pergunta: 'Escreve uma notícia para o Jornal de Messejana sobre a Mostra de Invenções do Nico.',
          plano: [['Quem?', 'o Nico e a turma'], ['O quê?', 'uma Mostra de Invenções'], ['Onde?', 'no castelo de Messejana'], ['Quando?', 'no fim do ano']],
          pistas: ['Uma notícia responde a: quem, o quê, onde, quando.', 'O título é curto e diz o mais importante.', 'Relê no fim: maiúsculas, acentos e pontuação.'] },
      ] },
      { area: 'prog', titulo: 'As ameias do castelo', atividades: [
        { id: 'v4-tar', tipo: 'tartaruga', titulo: 'As ameias', pergunta: 'Desenha as ameias do castelo de Messejana como no modelo azul: 3 ameias iguais. Usa um «repete».',
          inicio: [1, 6], maxBlocos: 10, blocos: ['avanca', 'dir', 'esq', 'repete'],
          solucao: [{ op: 'dir' }, { op: 'repete', n: 3, corpo: [{ op: 'esq' }, { op: 'avanca', n: 1 }, { op: 'dir' }, { op: 'avanca', n: 1 }, { op: 'dir' }, { op: 'avanca', n: 1 }, { op: 'esq' }, { op: 'avanca', n: 1 }] }],
          feito: 'As ameias estão perfeitas! Um padrão que se repete é mais fácil de programar com «repete».', pistas: P_TART },
      ] },
      { area: 'mat', titulo: 'Contas da Mostra', atividades: [
        { id: 'v4-m1', tipo: 'curta', pergunta: 'A Mostra abre às 9h45 e fecha às 17h30. Quanto tempo está aberta?', instr: 'Escreve assim: 0h00', aceitar: ['7h45', '7:45', '7h45m', '7h45min', '7 h 45', '7 horas e 45 minutos'], largura: '160px' },
        { id: 'v4-m2', tipo: 'curta', pergunta: 'Visitaram a Mostra 240 pessoas. Um quarto eram crianças. Quantas crianças visitaram a Mostra?', numero: 60, depois: 'crianças', largura: '110px' },
        { id: 'v4-m3', tipo: 'escolha', pergunta: 'O Nico quer pôr 5 invenções em cada mesa. Tem 37 invenções. Quantas mesas precisa, no mínimo, para pôr todas?', opcoes: ['7', '8', '6', '9'], certa: 1,
          pistas: ['37 : 5 = 7 e sobram 2.', 'As 2 que sobram também precisam de mesa.'] },
      ] },
      { area: 'meio', titulo: 'História e céu', atividades: [
        { id: 'v4-e1', tipo: 'ordenar', pergunta: 'Põe por ordem, do mais antigo para o mais recente.', itens: ['1147 · conquista de Lisboa', '1855 · Messejana passa para o concelho de Aljustrel', '1910 · implantação da República', '1974 · 25 de Abril'] },
        { id: 'v4-e2', tipo: 'escolha', pergunta: 'À noite, o Nico olha o céu de Messejana. Qual é o planeta mais perto do Sol?', opcoes: ['Mercúrio.', 'Vénus.', 'Terra.', 'Marte.'], certa: 0 },
        { id: 'v4-e3', tipo: 'arrastar', pergunta: 'Completa as frases.', frase: 'A Terra demora cerca de {0} a dar uma volta completa ao Sol e cerca de {1} a dar uma volta sobre si mesma.', certas: ['um ano', 'um dia'], extra: ['uma semana', 'um mês'] },
        { id: 'v4-e4', tipo: 'vf', pergunta: 'O Sistema Solar. Verdadeiro ou falso?', afirmacoes: [['O Sol é uma estrela.', true], ['A Lua é um planeta.', false], ['A Terra é o terceiro planeta a contar do Sol.', true]] },
      ] },
    ],
  };
  // o modelo das ameias é o próprio desenho da solução (geometria exata)
  Object.defineProperty(v4.estacoes[3].atividades[0], 'alvo', { enumerable: true, get() { return { segs: T().correrTartaruga(this.solucao, this.inicio).segs } } });

  // ------------------------------------------------------------ prova-ensaio de fevereiro (fim do capítulo 2)
  const FEIRA = { tipo: 'barras', titulo: 'Produtos vendidos na banca do Nico', dados: [['Queijo', 12], ['Mel', 8], ['Pão', 15], ['Azeitonas', 6]], max: 16, passo: 2, cor: '#7b2fd1', eixo: 'unidades' };
  const provaFev = {
    id: 'fev', titulo: 'Prova-ensaio de fevereiro', minutos: 35, capitulo: 'c2',
    resumo: '12 questões de Português e Matemática, a meio do ano: como numa prova no computador.',
    aviso: 'Esta prova-ensaio imita o tipo de tarefas das provas no computador. Não conta para nota e não é a plataforma oficial. Tens 35 minutos (o relógio só avisa, não fecha a prova).',
    textos: {
      feira: { titulo: 'O dia da feira', fonte: 'Texto escrito para o Nico (Buinho Educativo).', paragrafos: [
        'No sábado, a Marta acordou antes do Sol. Era dia de feira em Ervidel e ela ia ajudar o avô na banca do mel.',
        'O avô tinha colmeias perto da ribeira. Explicou-lhe que as abelhas visitam milhares de flores para fazer um só frasco de mel.',
        'À tarde, uma senhora perguntou se o mel era da terra. A Marta respondeu, orgulhosa: — É das abelhas do meu avô, de Ervidel!',
        'Quando voltaram para casa, a Marta estava cansada, mas feliz. Já sabia dar o troco sem se enganar.'] },
    },
    itens: [
      { id: 'pf1', area: 'port', leitura: 'feira', tipo: 'escolha', pergunta: 'Onde tinha o avô as colmeias?', opcoes: ['Na praça.', 'Perto da ribeira.', 'Na barragem.', 'Em casa.'], certa: 1 },
      { id: 'pf2', area: 'port', leitura: 'feira', tipo: 'vf', pergunta: 'Indica se cada afirmação é verdadeira ou falsa, de acordo com o texto.', afirmacoes: [['A feira foi num domingo.', false], ['A Marta acordou antes do Sol.', true], ['No fim do dia, a Marta estava triste.', false]] },
      { id: 'pf3', area: 'port', leitura: 'feira', tipo: 'escolha', pergunta: 'Na frase «A Marta respondeu, orgulhosa», o que quer dizer «orgulhosa»?', opcoes: ['Envergonhada.', 'Contente com o que é seu.', 'Zangada.', 'Cansada.'], certa: 1 },
      { id: 'pf4', area: 'port', tipo: 'palavras', pergunta: 'Clica no sujeito da frase (todas as palavras dele).', texto: 'O avô da Marta vendeu mel.', certas: ['O', 'avô', 'da', 'Marta'] },
      { id: 'pf5', area: 'port', tipo: 'escolha', pergunta: 'Qual é o tipo da frase «Que mel tão doce!»?', opcoes: ['Declarativa.', 'Interrogativa.', 'Exclamativa.', 'Imperativa.'], certa: 2 },
      { id: 'pf6', area: 'port', leitura: 'feira', tipo: 'extensa', pergunta: 'Porque é que a Marta voltou feliz? Responde em duas ou três frases.', min: 12 },
      { id: 'pf7', area: 'mat', tipo: 'curta', pergunta: 'Um frasco de mel custa 3,60 €. A senhora pagou com uma nota de 5 €. Quanto recebeu de troco?', depois: '€', aceitar: ['1,40', '1.40', '1,4'], largura: '120px' },
      { id: 'pf8', area: 'mat', tipo: 'escolha', pergunta: 'Observa o gráfico. Qual é a moda dos produtos vendidos?', figura: FEIRA, opcoes: ['Queijo', 'Mel', 'Pão', 'Azeitonas'], certa: 2 },
      { id: 'pf9', area: 'mat', tipo: 'curta', pergunta: 'Quantos produtos se venderam ao todo?', figura: FEIRA, numero: 41, largura: '110px' },
      { id: 'pf10', area: 'mat', tipo: 'escolha', pergunta: 'Num saco há 5 bolas azuis e nenhuma vermelha. Tirar uma bola vermelha é…', opcoes: ['certo.', 'possível.', 'impossível.', 'muito provável.'], certa: 2 },
      { id: 'pf11', area: 'mat', tipo: 'escolha', pergunta: 'Quantas arestas tem um cubo?', opcoes: ['6', '8', '12', '4'], certa: 2 },
      { id: 'pf12', area: 'mat', tipo: 'arrastar', pergunta: 'Liga cada quantia à mesma quantia escrita de outra maneira.', linhas: [['1,50 €', '150 cêntimos'], ['0,05 €', '5 cêntimos'], ['2 €', '200 cêntimos']], extra: ['15 cêntimos'] },
    ],
  };

  F.PC_CONCELHO = { capitulos, lugares, meio, missoes: [v1, v2, v3, v4], provaFev };
})();
