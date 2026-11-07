/* Nico · Capítulo especial — O Ginásio dos Números (revisões de Matemática do 3.º ano).
 *
 * Três maneiras de treinar, sempre com exercícios novos (gerados em missoes/revisoes-3ano.js):
 *   · Teste de revisão — 22 questões de todos os temas, sem correção até entregar; no fim o resultado com a menção
 *     (Insuficiente · Suficiente · Bom · Muito Bom), as pedras do manual, o resultado por tema e a correção.
 *   · Treino por temas — 8 exercícios; 2 tentativas, pistas do Nico, explicação.
 *   · Jogos — tabuada-relâmpago, ábaco, cartões binários, reta numérica, coordenadas, mensagem secreta, enigma, planificações.
 * Nas contas a criança faz o cálculo no caderno e escreve só o resultado.
 * Progresso por aluno (F.chaveMissao) e moedas de cobre na mesma carteira do Percurso 4.º ano (máx. 30 por dia aqui).
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const R = F.REV, U = R.util;
  const $ = id => document.getElementById(id);
  const h = F.PC.itens.h;
  const masc = F.PC.masc;
  const NB = ' ';

  // ------------------------------------------------------------ progresso e moedas
  const CHAVE = F.chaveMissao({ chave: 'nico.revisoes3.v1' });
  const CHAVE_PC = F.chaveMissao({ chave: 'nico.percurso4.v1' });   // carteira de moedas do Percurso
  const lerJ = (k, d) => { try { return Object.assign(d, JSON.parse(localStorage.getItem(k)) || {}); } catch (e) { return d; } };
  let P = lerJ(CHAVE, { testes: [], treinos: {}, jogos: {}, moedasDia: {}, comp: {} });

  // ------------------------------------------------------------ competências: onde falha e o que reforçar
  // Cada resposta (do teste e da 1.ª tentativa no treino) fica registada na competência do exercício. As últimas
  // 12 respostas de cada competência pesam mais (o que já foi treinado e melhorou deixa de aparecer como fraco).
  function registar(it, ok) {
    const nome = R.competencia(it.k), c = P.comp[nome] = P.comp[nome] || { c: 0, n: 0, ult: [], tema: it.tema };
    c.n++; if (ok) c.c++; c.ult.push(ok ? 1 : 0); if (c.ult.length > 12) c.ult.shift();
  }
  const taxa = c => c.ult.reduce((a, b) => a + b, 0) / c.ult.length;
  function reforcar(max) {   // competências mais fracas (pelo menos 2 respostas e menos de 70% de certas nas recentes)
    return Object.entries(P.comp).filter(([, c]) => c.ult.length >= 2 && taxa(c) < 0.7)
      .sort((a, b) => taxa(a[1]) - taxa(b[1]) || b[1].ult.length - a[1].ult.length).slice(0, max || 5).map(([nome, c]) => ({ nome, c, p: Math.round(100 * taxa(c)) }));
  }
  function seguras() { return Object.entries(P.comp).filter(([, c]) => c.ult.length >= 3 && taxa(c) >= 0.85).map(([n]) => n); }
  function gravar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(P)); } catch (e) { /* sem armazenamento */ }
    if (F.Turma) F.Turma.mudou(CHAVE);
  }
  const hoje = () => new Date().toISOString().slice(0, 10);
  const LIMITE_DIA = 30;
  function moedas(n) {   // devolve as moedas mesmo ganhas (com o limite diário deste capítulo)
    if (P.moedasDia.dia !== hoje()) P.moedasDia = { dia: hoje(), n: 0 };
    const dar = Math.max(0, Math.min(n, LIMITE_DIA - P.moedasDia.n));
    if (!dar) return 0;
    P.moedasDia.n += dar;
    const W = lerJ(CHAVE_PC, { feitos: 0, at: {}, provas: [], bolotas: 0 });
    W.bolotas = (W.bolotas || 0) + dar;
    try { localStorage.setItem(CHAVE_PC, JSON.stringify(W)); } catch (e) { /* */ }
    if (F.Turma) F.Turma.mudou(CHAVE_PC);
    gravar(); pintarMoedas(true);
    return dar;
  }
  const carteira = () => lerJ(CHAVE_PC, { bolotas: 0 }).bolotas || 0;
  function pintarMoedas(salto) {
    let b = $('bolotas');
    if (!b) { b = h('span', { class: 'pc-bolotas', id: 'bolotas', title: 'Moedas de cobre (as mesmas do Percurso 4.º ano)' }); document.querySelector('.ligacao').prepend(b); }
    b.innerHTML = '<img class="pc-moeda" src="img/percurso/moeda-cobre.webp" alt=""><span>' + carteira() + '</span>';
    if (salto) { b.classList.remove('salto'); void b.offsetWidth; b.classList.add('salto'); }
  }
  const txtMoedas = n => n ? ` Ganhaste ${n} ${n === 1 ? 'moeda' : 'moedas'} de cobre!` : (P.moedasDia.n >= LIMITE_DIA ? ' (Hoje já ganhaste as moedas todas deste capítulo — amanhã há mais.)' : '');

  // ------------------------------------------------------------ vistas e janela
  let atual = null;   // { relogio, fechar }
  function sair() { if (atual) { if (atual.relogio) atual.relogio.limpar(); if (atual.fechar) atual.fechar(); atual = null; } if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  function vista(id) {
    sair();
    ['vMenu', 'vSessao', 'vProva'].forEach(v => { $(v).hidden = v !== id; });
    $('rodape').hidden = false;
    ['btnSaltar', 'btnVerificar'].forEach(b => { $(b).hidden = false; });
    $('btnSeguinte').hidden = true; $('atMsg').textContent = ''; $('atPontos').innerHTML = ''; $('atConta').textContent = '';
    window.scrollTo(0, 0);
  }
  function janela(estado, titulo, texto, botoes) {
    $('janelaImg').src = masc.img(estado); $('janelaImg').className = '';
    $('janelaTitulo').textContent = titulo; $('janelaTexto').textContent = texto;
    const bx = $('janelaBotoes'); bx.innerHTML = '';
    botoes.forEach(([t, cls, f]) => { const b = h('button', { type: 'button', class: 'btn btn-grande ' + cls }, t); b.onclick = () => { $('janela').hidden = true; f(); }; bx.append(b); });
    $('janela').hidden = false;
    if (estado === 'celebrar' && F.Som) F.Som.tocar('nivel');
    setTimeout(() => bx.lastChild && bx.lastChild.focus(), 30);
  }
  const som = n => { if (F.Som) F.Som.tocar(n); };

  // ------------------------------------------------------------ menu
  const JOGOS = {};
  function menu() {
    vista('vMenu');
    document.title = 'Nico · Capítulo especial · Revisões de Matemática';
    $('menuMasc').src = masc.img('boas_vindas');
    pintarMoedas();
    // o teste
    const ult = P.testes[P.testes.length - 1], melhor = P.testes.reduce((m, t) => Math.max(m, t.pct), -1);
    const T = $('menuTeste'); T.innerHTML = '';
    const bT = h('button', { type: 'button', class: 'pc-sessao prova rv-teste' },
      h('span', { class: 'ps-num' }, '🎯 Teste de revisão · como o teste da escola'),
      h('strong', null, 'Fazer um teste novo'),
      h('span', { class: 'ps-tema' }, `${Object.values(R.PLANO).reduce((a, b) => a + b, 0)} questões de todos os temas, diferentes de cada vez. Só vês a correção no fim — depois o Nico dá-te a classificação e diz-te o que treinar.`),
      h('span', { class: 'ps-estado' }, ult ? `Último: ${ult.pct}% · ${ult.mencao}` + (P.testes.length > 1 ? ` · melhor: ${melhor}%` : '') + ' · fazer outro' : 'Começar o teste'));
    bT.onclick = abrirTeste;
    T.append(bT);
    // temas
    const L = $('menuTemas'); L.innerHTML = '';
    const fracos = temasFracos();
    Object.entries(R.TEMAS).forEach(([id, t]) => {
      const tr = P.treinos[id];
      const b = h('button', { type: 'button', class: 'pc-sessao rv-tema' + (fracos.includes(id) ? ' fraco' : '') , style: `--cor:${t.cor}` },
        h('span', { class: 'ps-num' }, fracos.includes(id) ? '⚠ Treinar: correu menos bem no último teste' : 'Treino'),
        h('strong', null, t.emoji + ' ' + t.nome),
        h('span', { class: 'ps-estado' }, tr ? `${tr.rondas} ${tr.rondas === 1 ? 'treino feito' : 'treinos feitos'} · ${Math.round(100 * tr.certas / Math.max(1, tr.total))}% certas` : 'Começar'));
      b.onclick = () => treino(id);
      L.append(b);
    });
    const bMix = h('button', { type: 'button', class: 'pc-sessao rv-tema treino' }, h('span', { class: 'ps-num' }, 'Treino'), h('strong', null, '🎲 Mistura de tudo'),
      h('span', { class: 'ps-estado' }, 'Um pouco de cada tema'));
    bMix.onclick = () => treino('mix');
    L.append(bMix);
    const fr = reforcar(4);
    if (fr.length) {
      const bR = h('button', { type: 'button', class: 'pc-sessao rv-tema fraco rv-reforco-cartao' }, h('span', { class: 'ps-num' }, 'Treino personalizado'), h('strong', null, '💪 Reforço dos pontos fracos'),
        h('span', { class: 'ps-tema' }, fr.map(f => f.nome).join(' · ')), h('span', { class: 'ps-estado' }, 'Treinar o que está a falhar'));
      bR.onclick = () => treino('reforco');
      L.prepend(bR);
    }
    // jogos
    const J = $('menuJogos'); J.innerHTML = '';
    Object.entries(JOGOS).forEach(([id, j]) => {
      const rec = P.jogos[id];
      const b = h('button', { type: 'button', class: 'pc-sessao rv-jogo' }, h('span', { class: 'ps-num' }, j.tema),
        h('strong', null, j.emoji + ' ' + j.nome), h('span', { class: 'ps-tema' }, j.desc),
        h('span', { class: 'ps-estado' }, rec ? `Recorde: ${rec.melhor}${j.unidade ? ' ' + j.unidade : ''}` : 'Jogar'));
      b.onclick = () => jogar(id);
      J.append(b);
    });
    historico();
    masc.dizer('boas_vindas', reforcar(1).length ? `Olá! O que precisa de mais treino: ${reforcar(3).map(f => f.nome.toLowerCase()).join(', ')}. Experimenta o «Reforço dos pontos fracos»!` : fracos.length ? `Olá! No último teste, ${fracos.map(t => R.TEMAS[t].nome.toLowerCase()).join(' e ')} ${fracos.length === 1 ? 'correu' : 'correram'} menos bem. Que tal treinar isso e depois fazer outro teste?`
      : 'Olá! Bem-vindo ao meu ginásio dos números. Tens o caderno e o lápis à mão? Escolhe um treino, um jogo ou faz já um teste!');
  }
  function temasFracos() {
    const t = P.testes[P.testes.length - 1]; if (!t) return [];
    return Object.entries(t.porTema).filter(([, [c, n]]) => c / n < 0.6).map(([k]) => k);
  }
  function historico() {
    const H = $('menuHist'); H.innerHTML = '';
    const fr = reforcar(6);
    if (fr.length) H.append(h('div', { class: 'rv-analise rv-an-menu' }, h('h3', null, '💪 O que tens de reforçar (somando todos os testes e treinos)'), listaReforco(fr)));
    if (!P.testes.length) { H.append(h('p', { class: 'rv-vazio' }, 'Ainda não fizeste nenhum teste. Quando fizeres, aparecem aqui os resultados para veres como vais melhorando.')); return; }
    const ult = P.testes.slice(-12), W = 640, Hh = 190, m = 34, passo = ult.length > 1 ? (W - 2 * m) / (ult.length - 1) : 0;
    const y = p => Hh - 26 - (p / 100) * (Hh - 50);
    let g = '';
    [50, 70, 90].forEach(v => { g += `<line x1="${m}" x2="${W - 10}" y1="${y(v)}" y2="${y(v)}" stroke="#ddd" stroke-dasharray="4 4"/><text x="${m - 6}" y="${y(v) + 4}" font-size="12" text-anchor="end" fill="#666">${v}%</text>`; });
    g += `<polyline fill="none" stroke="#2b3a8f" stroke-width="3" points="${ult.map((t, i) => `${m + i * passo},${y(t.pct)}`).join(' ')}"/>`;
    ult.forEach((t, i) => { g += `<circle cx="${m + i * passo}" cy="${y(t.pct)}" r="6" fill="${t.pct >= 70 ? '#2fa36b' : t.pct >= 50 ? '#f2b632' : '#e05a47'}"/><text x="${m + i * passo}" y="${y(t.pct) - 11}" text-anchor="middle" font-size="13" font-weight="700">${t.pct}</text>`; });
    H.append(h('figure', { class: 'rv-grafico', html: `<svg viewBox="0 0 ${W} ${Hh}" width="100%" font-family="Asap, sans-serif" role="img" aria-label="Percentagem de certas nos últimos testes">${g}</svg>` }));
    H.append(h('table', { class: 'it-tabela rv-hist' }, h('thead', null, h('tr', null, ['Dia', 'Certas', '%', 'Classificação', 'Tempo'].map(c => h('th', null, c)))),
      h('tbody', null, P.testes.slice().reverse().slice(0, 10).map(t => h('tr', null, h('td', null, t.quando.replace('T', ' ')), h('td', null, `${t.certas} / ${t.total}`), h('td', null, t.pct + '%'), h('td', null, h('b', null, t.mencao)), h('td', null, t.minutos + ' min'))))));
  }

  // ------------------------------------------------------------ treino (8 exercícios, corrige logo)
  function itensTreino(tema) {
    const out = [], usados = new Set();
    if (tema === 'reforco') {   // treino dirigido: exercícios das competências mais fracas
      const tipos = reforcar(4).flatMap(f => R.tiposDe(f.nome));
      if (!tipos.length) return itensTreino('mix');
      for (let i = 0; i < 8; i++) { const it = R.gerarTipo(tipos[i % tipos.length]); if (it) out.push(it); }
      return U.misturar(Math.random, out);
    }
    const temas = Object.keys(R.TEMAS);
    for (let i = 0; i < 8; i++) {
      const t = tema === 'mix' ? temas[i] : tema;
      const it = R.gerar(t, Math.random, usados.size < R.G[t].length ? usados : null);
      usados.add(it.k); out.push(it);
    }
    return tema === 'mix' ? U.misturar(Math.random, out) : out;
  }
  const NOME_TREINO = { mix: ['🎲', 'Mistura de tudo', '#444'], reforco: ['💪', 'Reforço dos pontos fracos', '#c2410c'] };
  function treino(tema) {
    vista('vSessao');
    const itens = itensTreino(tema);
    const [emo, nome, cor] = NOME_TREINO[tema] || [R.TEMAS[tema].emoji, R.TEMAS[tema].nome, R.TEMAS[tema].cor];
    $('atArea').textContent = emo + ' ' + nome; $('atArea').style.background = cor;
    document.title = 'Nico · Treino · ' + nome;
    let i = 0, tent = 0, certas = 0, ctrl = null, feito = false;
    const res = itens.map(() => null);
    function pontos() { $('atPontos').innerHTML = ''; res.forEach((r, k) => $('atPontos').append(h('i', { class: (r === true ? 'ok' : r === false ? 'mal' : '') + (k === i ? ' atual' : '') }))); }
    function mostrar() {
      const it = itens[i]; tent = 0; feito = false;
      $('atTitulo').textContent = `Exercício ${i + 1} de ${itens.length}`;
      $('atConta').textContent = `${certas} certas`;
      $('atMsg').textContent = ''; $('btnSeguinte').hidden = true; $('btnVerificar').hidden = false; $('btnSaltar').hidden = false;
      const palco = $('atPalco'); palco.innerHTML = '';
      const caixa = h('div', { class: 'rv-item' + (it.caderno ? ' caderno' : '') }); palco.append(caixa);
      ctrl = F.PC.itens.montar(caixa, it, { modo: 'sessao', aoEnter: verificar });
      masc.pistas(it.pistas);
      masc.dizer(it.caderno ? 'a_pensar' : 'curiosa', it.caderno ? 'Esta é para fazer no caderno! Escreve a conta, resolve com calma e depois escreve aqui o resultado.' : U.pick(Math.random, ['Vamos a isto!', 'Lê com atenção.', 'Tu consegues!', 'Pensa com calma.']));
      pontos();
    }
    function verificar() {
      if (feito) return seguinte();
      if (!ctrl.respondido()) { $('atMsg').textContent = 'Responde primeiro 🙂'; return; }
      const { certo } = ctrl.verificar(); tent++;
      if (tent === 1) registar(itens[i], certo);
      if (certo) {
        if (tent === 1) certas++;
        res[i] = tent === 1; feito = true; ctrl.bloquear(); ctrl.explicar();
        $('atMsg').textContent = tent === 1 ? '✓ Certo!' : '✓ Certo à segunda!';
        masc.dizer('celebrar', U.pick(Math.random, ['Boa! Farejei logo que estava certo.', 'Isso mesmo!', 'Excelente!', 'Muito bem!']));
        som('sucesso'); fim();
      } else if (tent === 1) {
        $('atMsg').textContent = '✗ Ainda não. Tenta outra vez.';
        masc.dizer('dica', (itens[i].caderno ? 'Confirma a conta no caderno, passo a passo. ' : '') + itens[i].pistas[0], { dica: true });
        som('apagar');
      } else {
        res[i] = false; feito = true; ctrl.bloquear(); ctrl.mostrarCerto();
        $('atMsg').textContent = 'Vê a resposta certa e a explicação.';
        masc.dizer('calma', 'Não faz mal — errar faz parte de aprender. Lê a explicação e para a próxima já sabes!');
        fim();
      }
      pontos();
    }
    function fim() { $('btnVerificar').hidden = true; $('btnSaltar').hidden = true; $('btnSeguinte').hidden = false; $('btnSeguinte').focus(); }
    function seguinte() {
      if (i < itens.length - 1) { i++; mostrar(); return; }
      const tr = P.treinos[tema] = P.treinos[tema] || { rondas: 0, certas: 0, total: 0 };
      tr.rondas++; tr.certas += certas; tr.total += itens.length; gravar();
      const ganhas = moedas(certas >= 6 ? 3 : certas >= 4 ? 1 : 0);
      janela(certas >= 6 ? 'celebrar' : 'incentivar', `${certas} de ${itens.length} certas à primeira!`,
        (certas >= 7 ? 'Estás em grande forma neste tema!' : certas >= 5 ? 'Muito bem. Mais um treino e fica seguro!' : 'Este tema precisa de mais treino — e os exercícios mudam sempre.') + txtMoedas(ganhas),
        [['Voltar ao ginásio', 'btn-texto', menu], ['Outro treino', 'btn-azul', () => treino(tema)]]);
    }
    $('btnVerificar').onclick = verificar;
    $('btnSeguinte').onclick = seguinte;
    $('btnSaltar').onclick = () => { if (!tent) registar(itens[i], false); res[i] = false; feito = true; ctrl.bloquear(); ctrl.mostrarCerto(); pontos(); fim(); };
    $('btnOuvir').onclick = () => masc.ouvir(ctrl && ctrl.textoParaOuvir());
    atual = { fechar: () => { $('btnVerificar').onclick = null; } };
    mostrar();
  }

  // ------------------------------------------------------------ teste de revisão
  const MINUTOS = 45;
  function abrirTeste() {
    janela('dica', 'Teste de revisão', `São ${Object.values(R.PLANO).reduce((a, b) => a + b, 0)} questões de todos os temas do 3.º ano. Prepara o caderno e o lápis: nas contas, resolve no caderno e escreve aqui só o resultado. Podes andar para a frente e para trás e marcar questões para rever. Tens cerca de ${MINUTOS} minutos (o relógio só avisa). A correção e a classificação aparecem quando entregares.`,
      [['Ainda não', 'btn-texto', () => {}], ['Começar o teste', 'btn-escuro', correrTeste]]);
  }
  function correrTeste() {
    vista('vProva');
    const itens = R.teste();
    const caixa = $('prova'); caixa.innerHTML = '';
    const resp = itens.map(() => undefined), marcadas = new Set();
    let i = 0, ctrl = null;
    const t0 = Date.now();
    const relogio = h('span', { class: 'pv-tempo', 'aria-live': 'off' });
    const nav = h('div', { class: 'pv-nav', role: 'navigation', 'aria-label': 'Questões' });
    const corpo = h('div', { class: 'pv-corpo' });
    const bAnt = h('button', { type: 'button', class: 'btn btn-texto' }, '← Anterior');
    const bMarcar = h('button', { type: 'button', class: 'btn btn-texto pv-marcar', 'aria-pressed': 'false' }, '⚑ Marcar para rever');
    const bSeg = h('button', { type: 'button', class: 'btn btn-escuro' }, 'Seguinte →');
    const bEntregar = h('button', { type: 'button', class: 'btn btn-azul' }, 'Entregar o teste');
    const bSair = h('button', { type: 'button', class: 'btn btn-texto' }, 'Sair');
    caixa.append(h('div', { class: 'pv-topo' }, h('strong', null, '🎯 Teste de revisão'), nav, relogio), corpo,
      h('div', { class: 'pv-pe' }, bSair, bAnt, bMarcar, h('span', { class: 'pv-esp' }), bSeg, bEntregar));
    const tick = () => {
      const s = Math.floor((Date.now() - t0) / 1000), rest = MINUTOS * 60 - s;
      relogio.textContent = rest >= 0 ? `Faltam ${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}` : `Tempo esgotado (+${Math.floor(-rest / 60)} min)`;
      relogio.style.background = rest < 300 ? '#fff1c2' : '#fff';
    };
    const rel = F.PC.relogio(); tick(); rel.cada(tick, 500);
    atual = { relogio: rel };
    function guardar() { if (ctrl) resp[i] = ctrl.respondido() ? ctrl.valor() : undefined; }
    function ir(k) {
      guardar(); i = k;
      const it = itens[i];
      corpo.innerHTML = '';
      const alvo = h('div', { class: 'rv-item' + (it.caderno ? ' caderno' : '') }); corpo.append(alvo);
      ctrl = F.PC.itens.montar(alvo, Object.assign({}, it, { pergunta: `${i + 1}. ${it.pergunta}` }), { modo: 'prova', aoMudar: () => { guardar(); pintarNav(); } });
      if (resp[i] !== undefined) ctrl.repor(resp[i]);
      bAnt.disabled = i === 0; bSeg.disabled = i === itens.length - 1;
      bMarcar.setAttribute('aria-pressed', String(marcadas.has(i)));
      pintarNav();
    }
    function pintarNav() {
      nav.innerHTML = '';
      itens.forEach((_, k) => {
        const b = h('button', { type: 'button', class: (resp[k] !== undefined ? 'resp' : '') + (k === i ? ' atual' : '') + (marcadas.has(k) ? ' marcada' : ''),
          'aria-label': `Questão ${k + 1}` + (resp[k] !== undefined ? ', respondida' : '') + (marcadas.has(k) ? ', marcada' : '') }, String(k + 1));
        b.addEventListener('click', () => ir(k));
        nav.append(b);
      });
    }
    bAnt.onclick = () => ir(i - 1);
    bSeg.onclick = () => ir(i + 1);
    bMarcar.onclick = () => { marcadas.has(i) ? marcadas.delete(i) : marcadas.add(i); bMarcar.setAttribute('aria-pressed', String(marcadas.has(i))); pintarNav(); };
    bSair.onclick = () => janela('a_pensar', 'Sair do teste?', 'Se saíres agora, este teste não fica guardado. Da próxima vez as perguntas serão outras.', [['Continuar o teste', 'btn-escuro', () => {}], ['Sair', 'btn-texto', menu]]);
    bEntregar.onclick = () => {
      guardar();
      const vazias = resp.filter(v => v === undefined).length;
      const avisos = [vazias ? `${vazias} ${vazias === 1 ? 'questão está' : 'questões estão'} por responder.` : 'Respondeste a todas.',
        marcadas.size ? `${marcadas.size} ${marcadas.size === 1 ? 'está marcada' : 'estão marcadas'} para rever.` : ''].filter(Boolean).join(' ');
      janela('a_pensar', 'Entregar o teste?', avisos + ' Depois de entregar já não podes mudar as respostas.',
        [['Voltar ao teste', 'btn-texto', () => {}], ['Entregar', 'btn-azul', resultado]]);
    };
    function resultado() {
      rel.limpar();
      const porTema = {}; let certas = 0;
      const lista = itens.map((it, k) => {
        const ok = resp[k] !== undefined && F.PC.itens.corrigir(it, resp[k]);
        porTema[it.tema] = porTema[it.tema] || [0, 0]; porTema[it.tema][1]++; if (ok) { porTema[it.tema][0]++; certas++; }
        registar(it, ok);
        return { it, ok, v: resp[k] };
      });
      const total = itens.length, pct = Math.round(100 * certas / total), M = R.mencao(pct);
      const min = Math.max(1, Math.round((Date.now() - t0) / 60000));
      P.testes.push({ quando: new Date().toISOString().slice(0, 16), certas, total, pct, mencao: M.nome, porTema, minutos: min, erros: lista.filter(x => !x.ok).map(x => x.it.k) });
      gravar();
      const ganhas = moedas([0, 2, 5, 8][M.gemas]);
      corpo.innerHTML = '';
      caixa.querySelector('.pv-pe').hidden = true; nav.innerHTML = ''; relogio.textContent = `${min} min`; relogio.style.background = '#fff';
      const gemas = h('div', { class: 'rv-gemas', 'aria-label': `${M.gemas} de 3 pedras` }, [0, 1, 2].map(g => h('span', { class: g < M.gemas ? 'on' : '' }, '◆')));
      const anterior = P.testes.length > 1 ? P.testes[P.testes.length - 2].pct : null;
      const fracos = Object.entries(porTema).filter(([, [c, n]]) => c / n < 0.6).map(([t]) => t);
      const res = h('div', { class: 'pv-res rv-res' },
        h('div', { class: 'rv-res-topo' },
          h('img', { src: masc.img(M.estado), alt: '' }),
          h('div', null,
            h('p', { class: 'rv-res-n' }, `${certas} de ${total} certas · ${pct}%`),
            h('h1', { class: 'rv-mencao m' + M.gemas }, M.nome), gemas,
            h('p', null, M.frase + (anterior != null ? (pct > anterior ? ` Subiste ${pct - anterior} pontos desde o teste anterior! 🚀` : pct === anterior ? ' Igual ao teste anterior.' : '') : '') + txtMoedas(ganhas)))),
        h('h2', null, 'Por tema'),
        h('div', { class: 'rv-temas-res' }, Object.entries(porTema).map(([t, [c, n]]) => {
          const p = c / n, b = h('div', { class: 'rv-tr ' + (p >= 0.75 ? 'bom' : p >= 0.5 ? 'medio' : 'fraco') },
            h('span', null, R.TEMAS[t].emoji + ' ' + R.TEMAS[t].nome), h('i', null, h('b', { style: `width:${100 * p}%` })), h('strong', null, `${c} / ${n}`));
          if (p < 1) b.append(h('button', { type: 'button', class: 'btn btn-texto', onclick: () => treino(t) }, 'Treinar'));
          return b;
        })),
        analise(lista),
        h('h2', null, 'Correção'),
        h('ol', { class: 'rv-correcao' }, lista.map(({ it, ok, v }) => h('li', { class: ok ? 'certo' : 'errado' },
          h('b', null, ok ? '✓ ' : '✗ '), it.pergunta,
          ok ? null : h('div', { class: 'pe-instr' }, (v === undefined ? 'Sem resposta. ' : (it.tipo === 'curta' ? `Respondeste: ${v}. ` : '')) + 'Resposta certa: ' + F.PC.itens.respostaCerta(it)),
          ok || !it.explica ? null : h('div', { class: 'rv-explica' }, it.explica)))),
        h('p', { class: 'rv-res-botoes' },
          h('button', { type: 'button', class: 'btn btn-texto btn-grande', onclick: menu }, 'Voltar ao ginásio'),
          reforcar(1).length ? h('button', { type: 'button', class: 'btn btn-azul btn-grande', onclick: () => treino('reforco') }, '💪 Treino de reforço') : fracos.length ? h('button', { type: 'button', class: 'btn btn-azul btn-grande', onclick: () => treino(fracos[0]) }, `Treinar ${R.TEMAS[fracos[0]].nome.toLowerCase()}`) : null,
          h('button', { type: 'button', class: 'btn btn-escuro btn-grande', onclick: abrirTeste }, 'Fazer outro teste')));
      corpo.append(res);
      corpo.scrollTop = 0;
      som('nivel');
    }
    ir(0);
  }

  // análise final: onde falhou neste teste, o que tem de reforçar (somando tudo o que já fez) e o que já está seguro
  const listaReforco = fr => h('ul', { class: 'rv-reforco' }, fr.map(f => h('li', null, h('span', null, f.nome), h('i', null, h('b', { style: `width:${f.p}%` })), h('small', null, `${f.p}% certas nas últimas ${f.c.ult.length}`))));
  function analise(lista) {
    const erros = {};
    lista.filter(x => !x.ok).forEach(({ it }) => { const n = R.competencia(it.k); erros[n] = (erros[n] || 0) + 1; });
    const ordem = Object.entries(erros).sort((a, b) => b[1] - a[1]);
    const fr = reforcar(5), seg = seguras();
    return h('div', { class: 'rv-analise' },
      h('h2', null, '🔍 Análise: onde estás a falhar e o que reforçar'),
      h('div', { class: 'rv-an-col' },
        h('div', null, h('h3', null, 'Neste teste falhaste em'),
          ordem.length ? h('ul', null, ordem.map(([n, k]) => h('li', null, n, k > 1 ? h('b', null, ` × ${k}`) : null))) : h('p', null, 'Nada! Acertaste em tudo. 🏆')),
        h('div', null, h('h3', null, 'O que tens de reforçar'),
          fr.length ? listaReforco(fr) : h('p', null, 'Ainda não há pontos fracos repetidos. Continua a fazer testes para o Nico perceber melhor!'),
          fr.length ? h('button', { type: 'button', class: 'btn btn-azul', onclick: () => treino('reforco') }, '💪 Treino de reforço com estes temas') : null),
        h('div', null, h('h3', null, 'Já está seguro'),
          seg.length ? h('p', { class: 'rv-seguro' }, seg.slice(0, 10).join(' · ')) : h('p', null, 'Aparece aqui o que acertares sempre (pelo menos 3 vezes).'))));
  }

  // ------------------------------------------------------------ jogos
  function jogar(id) {
    vista('vSessao');
    const j = JOGOS[id];
    $('rodape').hidden = true;
    $('atArea').textContent = '🎮 ' + j.tema; $('atArea').style.background = '#2b3a8f';
    $('atTitulo').textContent = j.emoji + ' ' + j.nome;
    document.title = 'Nico · ' + j.nome;
    masc.pistas(j.pistas || []);
    const rel = F.PC.relogio();
    atual = { relogio: rel };
    const palco = $('atPalco'); palco.innerHTML = '';
    const area = h('div', { class: 'rv-jogo-palco' }); palco.append(area);
    $('btnOuvir').onclick = () => masc.ouvir(area.innerText);
    const api = {
      rel, area, conta: t => { $('atConta').textContent = t; },
      dizer: (e, t) => masc.dizer(e, t),
      fim(pontos, objetivo, texto) {
        const rec = P.jogos[id] = P.jogos[id] || { melhor: 0, vezes: 0 };
        rec.vezes++; const novo = pontos > rec.melhor; if (novo) rec.melhor = pontos; gravar();
        const ganhas = moedas(pontos >= objetivo ? 3 : 0);
        janela(pontos >= objetivo ? 'celebrar' : 'incentivar', `${pontos}${j.unidade ? ' ' + j.unidade : ' pontos'}` + (novo ? ' · novo recorde!' : ''),
          (texto || (pontos >= objetivo ? 'Fantástico!' : `Para ganhar moedas precisas de ${objetivo}. Tenta outra vez!`)) + txtMoedas(ganhas),
          [['Voltar ao ginásio', 'btn-texto', menu], ['Jogar outra vez', 'btn-azul', () => jogar(id)]]);
      },
    };
    masc.dizer('curiosa', j.intro);
    j.iniciar(api);
  }
  const ri = (a, b) => U.ri(Math.random, a, b);
  const pickR = l => U.pick(Math.random, l);
  const entrada = (larg, aoEnter) => { const inp = h('input', { type: 'text', inputmode: 'numeric', autocomplete: 'off', class: 'rv-inp', style: larg ? 'width:' + larg : null }); inp.addEventListener('keydown', e => { if (e.key === 'Enter') aoEnter(); }); return inp; };
  const num = t => { const n = Number(String(t).replace(/[\s  ]/g, '').replace(',', '.')); return String(t).trim() === '' ? NaN : n; };

  // 1. Tabuada-relâmpago
  JOGOS.tabuada = { nome: 'Tabuada-relâmpago', emoji: '⚡', tema: 'Cálculo mental', unidade: 'certas', desc: '60 segundos: quantas multiplicações e divisões consegues acertar?',
    intro: 'Tens 60 segundos! Escreve o resultado e carrega em Enter. Objetivo: 15 certas.',
    iniciar(api) {
      let certas = 0, erradas = 0, a, b, div, fim = Date.now() + 60000;
      const q = h('div', { class: 'rv-tab-q' }), inp = entrada('160px', ver), barra = h('div', { class: 'rv-barra' }, h('b')), fb = h('p', { class: 'rv-fb', 'aria-live': 'polite' });
      api.area.append(barra, q, inp, fb);
      function nova() { a = ri(2, 10); b = ri(2, 10); div = Math.random() < 0.3; q.textContent = div ? `${a * b} : ${a} =` : `${a} × ${b} =`; inp.value = ''; inp.focus(); }
      function ver() {
        const v = num(inp.value); if (isNaN(v)) return;
        const c = div ? b : a * b;
        if (v === c) { certas++; fb.textContent = '✓'; fb.className = 'rv-fb ok'; som('apanhar'); } else { erradas++; fb.textContent = `✗ ${q.textContent} ${c}`; fb.className = 'rv-fb mal'; }
        api.conta(`${certas} certas`); nova();
      }
      api.rel.cada(() => {
        const r = Math.max(0, fim - Date.now()); barra.firstChild.style.width = (r / 600) + '%';
        if (r <= 0) { api.rel.limpar(); inp.disabled = true; api.fim(certas, 15, `Acertaste ${certas} e erraste ${erradas}.`); }
      }, 100);
      api.conta('0 certas'); nova();
    } };

  // 2. Ábaco mágico
  JOGOS.abaco = { nome: 'Ábaco mágico', emoji: '🧮', tema: 'Números até 999 999', unidade: 'em 6', desc: 'Lê o número e representa-o no ábaco, conta a conta.',
    intro: 'Clica em + e − para pôr as contas em cada vareta. Cada vareta leva até 9 contas.', pistas: ['Começa pelas centenas de milhar (CM), à esquerda.', 'Uma ordem que não aparece no número fica com a vareta vazia.', 'Escreve o número no caderno numa tabela CM DM UM C D U.'],
    iniciar(api) {
      let ronda = 0, pontos = 0, alvo, dig;
      const enun = h('p', { class: 'rv-enun' }), fig = h('div', { class: 'rv-abaco' }), botoes = h('div', { class: 'rv-abaco-bt' }), ok = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, 'Verificar'), fb = h('p', { class: 'rv-fb' });
      api.area.append(enun, fig, botoes, ok, fb);
      function desenhar() { fig.innerHTML = U.svgAbaco(Number(dig.join(''))); }
      function nova() {
        ronda++; alvo = ri(1, 9) * 100000 + ri(0, 99999); if (Math.random() < 0.5) { const s = String(alvo).split(''); s[ri(1, 5)] = '0'; alvo = Number(s.join('')); }
        dig = [0, 0, 0, 0, 0, 0];
        enun.innerHTML = ''; enun.append(`Ronda ${ronda} de 6 — representa: `, h('b', null, Math.random() < 0.5 ? U.fmt(alvo) : '«' + U.extenso(alvo) + '»'));
        botoes.innerHTML = '';
        ['CM', 'DM', 'UM', 'C', 'D', 'U'].forEach((o, k) => botoes.append(h('div', null,
          h('button', { type: 'button', class: 'btn btn-texto', 'aria-label': 'Mais uma conta em ' + o, onclick: () => { if (dig[k] < 9) { dig[k]++; desenhar(); som('clique'); } } }, '+'),
          h('button', { type: 'button', class: 'btn btn-texto', 'aria-label': 'Menos uma conta em ' + o, onclick: () => { if (dig[k] > 0) { dig[k]--; desenhar(); } } }, '−'))));
        fb.textContent = ''; ok.disabled = false; desenhar();
      }
      ok.onclick = () => {
        const v = Number(dig.join('')); ok.disabled = true;
        if (v === alvo) { pontos++; fb.textContent = '✓ Certinho!'; fb.className = 'rv-fb ok'; som('sucesso'); }
        else { fb.textContent = `✗ Ficou ${U.fmt(v)}. O certo era ${U.fmt(alvo)} → ${String(alvo).padStart(6, '0').split('').join(' ')}`; fb.className = 'rv-fb mal'; }
        api.conta(`${pontos} certas`);
        api.rel.depois(() => ronda < 6 ? nova() : api.fim(pontos, 5), v === alvo ? 1000 : 2600);
      };
      api.conta('0 certas'); nova();
    } };

  // 3. Cartões binários
  JOGOS.binario = { nome: 'Cartões binários', emoji: '💡', tema: 'Pensamento computacional', unidade: 'em 8', desc: 'Vira os cartões 16 · 8 · 4 · 2 · 1 para mostrar o número — como num computador.',
    intro: 'Clica nos cartões para os virar. Cartão com pintas = 1, cartão escuro = 0. Quantas pintas fazem o número?', pistas: ['Começa pelo maior cartão que cabe no número.', 'Vê quanto falta e continua com os mais pequenos.', 'Cada cartão só se usa uma vez.'],
    iniciar(api) {
      let ronda = 0, pontos = 0, alvo, bits;
      const enun = h('p', { class: 'rv-enun' }), cartas = h('div', { class: 'rv-cartas' }), soma = h('p', { class: 'rv-soma' }), ok = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, 'Verificar'), fb = h('p', { class: 'rv-fb' });
      api.area.append(enun, cartas, soma, ok, fb);
      const V = [16, 8, 4, 2, 1];
      function desenhar() {
        cartas.innerHTML = '';
        V.forEach((v, k) => { const b = h('button', { type: 'button', class: 'rv-carta', 'aria-pressed': String(bits[k] === '1'), 'aria-label': 'Cartão ' + v, html: U.svgCartoes(bits[k]).replace(/width="\d+"/, 'width="96"') }); b.onclick = () => { bits[k] = bits[k] === '1' ? '0' : '1'; desenhar(); som('clique'); }; cartas.append(b); });
        const s = V.reduce((t, v, k) => t + (bits[k] === '1' ? v : 0), 0);
        soma.textContent = `Pintas à vista: ${s}  ·  em binário: ${bits.join('')}`;
      }
      function nova() { ronda++; alvo = ri(3, 31); bits = ['0', '0', '0', '0', '0']; enun.innerHTML = ''; enun.append(`Ronda ${ronda} de 8 — mostra o número `, h('b', null, String(alvo))); fb.textContent = ''; ok.disabled = false; desenhar(); }
      ok.onclick = () => {
        const s = V.reduce((t, v, k) => t + (bits[k] === '1' ? v : 0), 0); ok.disabled = true;
        if (s === alvo) { pontos++; fb.textContent = `✓ ${alvo} em binário é ${bits.join('')}!`; fb.className = 'rv-fb ok'; som('sucesso'); }
        else { fb.textContent = `✗ Mostraste ${s}. ${alvo} = ${alvo.toString(2).padStart(5, '0')}`; fb.className = 'rv-fb mal'; }
        api.conta(`${pontos} certas`);
        api.rel.depois(() => ronda < 8 ? nova() : api.fim(pontos, 7), s === alvo ? 1200 : 2600);
      };
      api.conta('0 certas'); nova();
    } };

  // 4. Reta numérica
  JOGOS.reta = { nome: 'Pontaria na reta', emoji: '🎯', tema: 'Números até 999 999', unidade: 'pontos', desc: 'Clica no sítio certo da reta numérica. Quanto mais perto, mais pontos!',
    intro: 'Onde fica o número na reta? Clica no sítio. Até 3 pontos por ronda — objetivo: 12 pontos em 6 rondas.', pistas: ['Olha para o meio da reta: que número fica lá?', 'Divide a reta em partes iguais com os olhos.', 'Compara com os números marcados.'],
    iniciar(api) {
      let ronda = 0, pontos = 0, max, alvo, bloq = false;
      const enun = h('p', { class: 'rv-enun' }), cx = h('div', { class: 'rv-reta' }), fb = h('p', { class: 'rv-fb' });
      api.area.append(enun, cx, fb);
      const W = 640, x0 = 30, x1 = 610, X = v => x0 + (v / max) * (x1 - x0);
      function desenhar(marca, certo) {
        let g = `<line x1="${x0}" y1="60" x2="${x1}" y2="60" stroke="#222" stroke-width="4"/>`;
        for (let k = 0; k <= 10; k++) { const v = max * k / 10; g += `<line x1="${X(v)}" y1="${k % 5 ? 52 : 44}" x2="${X(v)}" y2="${k % 5 ? 68 : 76}" stroke="#222" stroke-width="2"/>`; if (k % 5 === 0) g += `<text x="${X(v)}" y="98" text-anchor="middle" font-size="16" font-weight="700">${U.fmt(v)}</text>`; }
        if (marca != null) g += `<circle cx="${X(marca)}" cy="60" r="9" fill="#e05a47"/>`;
        if (certo != null) g += `<path d="M${X(certo)},20 l-9,-14 h18 z" fill="#2fa36b"/><text x="${X(certo)}" y="14" text-anchor="middle" font-size="13" fill="#2fa36b" font-weight="700">${U.fmt(certo)}</text>`;
        cx.innerHTML = `<svg viewBox="0 0 ${W} 110" width="100%" font-family="Asap, sans-serif" style="cursor:crosshair">${g}</svg>`;
      }
      cx.addEventListener('click', ev => {
        if (bloq) return;
        const s = cx.querySelector('svg').getBoundingClientRect(), x = (ev.clientX - s.left) * W / s.width;
        const v = Math.max(0, Math.min(max, (x - x0) / (x1 - x0) * max)), err = Math.abs(v - alvo) / max;
        const p = err <= 0.02 ? 3 : err <= 0.05 ? 2 : err <= 0.1 ? 1 : 0; pontos += p; bloq = true;
        desenhar(v, alvo);
        fb.textContent = ['✗ Longe… vê onde fica (seta verde).', '◎ Perto! +1', '◎ Muito perto! +2', '🎯 Em cheio! +3'][p]; fb.className = 'rv-fb ' + (p ? 'ok' : 'mal');
        if (p === 3) som('sucesso');
        api.conta(`${pontos} pontos`);
        api.rel.depois(() => ronda < 6 ? nova() : api.fim(pontos, 12), 1800);
      });
      function nova() {
        ronda++; bloq = false; max = pickR([1000, 10000, 100000, 1000000]); alvo = Math.round(ri(5, 95) * max / 100 / (max / 1000)) * (max / 1000);
        if (max === 1000000) { max = 1000000; }
        enun.innerHTML = ''; enun.append(`Ronda ${ronda} de 6 — onde fica o `, h('b', null, U.fmt(alvo)), '?'); fb.textContent = ''; desenhar();
      }
      api.conta('0 pontos'); nova();
    } };

  // 5. Caça ao tesouro nas coordenadas
  JOGOS.coordenadas = { nome: 'Caça ao tesouro', emoji: '🗺️', tema: 'Geometria', unidade: 'em 10', desc: 'Encontra as casas da grelha pelas coordenadas — primeiro a letra, depois o número.',
    intro: 'Clica na casa que te digo. Primeiro a letra (coluna), depois o número (linha).', pistas: ['A letra está em baixo: é a coluna.', 'O número está à esquerda: é a linha.', 'Desliza o dedo para cima pela coluna até chegares à linha.'],
    iniciar(api) {
      const L = 'abcdefgh'; let ronda = 0, pontos = 0, c, l, bloq = false;
      const enun = h('p', { class: 'rv-enun' }), grade = h('div', { class: 'rv-grade' }), fb = h('p', { class: 'rv-fb' });
      api.area.append(enun, grade, fb);
      for (let r = 7; r >= 0; r--) {
        grade.append(h('span', { class: 'rv-g-l' }, String(r + 1)));
        for (let k = 0; k < 8; k++) { const b = h('button', { type: 'button', class: 'rv-g-c', 'aria-label': `(${L[k]}, ${r + 1})` }); b.onclick = () => clique(k, r, b); grade.append(b); }
      }
      grade.append(h('span'), ...L.split('').map(x => h('span', { class: 'rv-g-l' }, x)));
      function clique(k, r, b) {
        if (bloq) return; bloq = true;
        const ok = k === c && r === l; if (ok) { pontos++; b.textContent = pickR(['🪙', '💎', '⭐']); b.classList.add('ok'); som('apanhar'); fb.textContent = '✓ Tesouro!'; fb.className = 'rv-fb ok'; }
        else { b.classList.add('mal'); const cert = grade.querySelector(`[aria-label="(${L[c]}, ${l + 1})"]`); cert.classList.add('ok'); cert.textContent = '🪙'; fb.textContent = `✗ Clicaste em (${L[k]}, ${r + 1}).`; fb.className = 'rv-fb mal'; }
        api.conta(`${pontos} tesouros`);
        api.rel.depois(() => { grade.querySelectorAll('.rv-g-c').forEach(x => { x.className = 'rv-g-c'; x.textContent = ''; }); ronda < 10 ? nova() : api.fim(pontos, 9); }, ok ? 700 : 1800);
      }
      function nova() { ronda++; bloq = false; c = ri(0, 7); l = ri(0, 7); enun.innerHTML = ''; enun.append(`Ronda ${ronda} de 10 — o tesouro está em `, h('b', null, `(${L[c]}, ${l + 1})`)); fb.textContent = ''; }
      api.conta('0 tesouros'); nova();
    } };

  // 6. Mensagem secreta
  const PALAVRAS = ['CASTELO', 'MONTADO', 'FABLAB', 'MINA', 'NICO', 'ERVIDEL', 'SOBREIRO', 'CORTIÇA', 'ALJUSTREL', 'GUITARRA', 'MICROBIT', 'PIRÂMIDE', 'PRISMA', 'FRAÇÃO', 'MOINHO'];
  JOGOS.secreta = { nome: 'Mensagem secreta', emoji: '🔐', tema: 'Cálculo', unidade: 'letras', desc: 'Cada letra está escondida atrás de uma conta. Resolve-as no caderno e descobre a palavra!',
    intro: 'Resolve cada conta (no caderno, se precisares) e escreve o resultado. As letras certas aparecem!', pistas: ['Começa pela conta que te parecer mais fácil.', 'Faz a conta no caderno com o algoritmo.', 'Se falhares, a conta fica vermelha: confirma no caderno.'],
    iniciar(api) {
      const palavra = pickR(PALAVRAS).split(''); let certas = 0, erros = 0;
      const sec = h('div', { class: 'rv-secreta' }), fb = h('p', { class: 'rv-fb' });
      api.area.append(h('p', { class: 'rv-enun' }, `Uma palavra com ${palavra.length} letras ligada ao mundo do Nico…`), sec, fb);
      palavra.forEach(letra => {
        const t = pickR(['+', '−', '×', ':']); let a, b, v;
        if (t === '+') { a = ri(120, 899); b = ri(50, 899); v = a + b; } else if (t === '−') { a = ri(300, 999); b = ri(50, a - 20); v = a - b; } else if (t === '×') { a = ri(12, 99); b = ri(2, 9); v = a * b; } else { b = ri(2, 9); v = ri(11, 99); a = b * v; }
        const caixa = h('div', { class: 'rv-sec-l' }), L = h('b', null, '?'), inp = entrada('92px', ver);
        caixa.append(L, h('span', null, `${a} ${t} ${b}`), inp); sec.append(caixa);
        function ver() {
          const n = num(inp.value); if (isNaN(n) || caixa.classList.contains('ok')) return;
          if (n === v) { caixa.classList.add('ok'); caixa.classList.remove('mal'); L.textContent = letra; inp.disabled = true; certas++; som('apanhar'); const prox = sec.querySelector('.rv-sec-l:not(.ok) input'); if (prox) prox.focus(); }
          else { caixa.classList.add('mal'); erros++; }
          if (certas === palavra.length) { fb.textContent = `🎉 A palavra secreta é ${palavra.join('')}!`; fb.className = 'rv-fb ok'; api.rel.depois(() => api.fim(palavra.length, erros <= 2 ? palavra.length : palavra.length + 1, `Descobriste «${palavra.join('')}» com ${erros} ${erros === 1 ? 'erro' : 'erros'}.${erros > 2 ? ' Para ganhar moedas, no máximo 2 erros.' : ''}`), 1200); }
        }
        inp.addEventListener('blur', ver);
      });
      api.conta(`${palavra.length} letras`);
      setTimeout(() => sec.querySelector('input').focus(), 50);
    } };

  // 7. Enigma dos símbolos
  JOGOS.enigma = { nome: 'Enigma dos símbolos', emoji: '🌰', tema: 'Pensamento computacional', unidade: 'em 4', desc: 'Cada símbolo vale um número. Descobre quanto vale cada um!',
    intro: 'Descobre o valor de cada símbolo, um de cada vez. Começa pela linha mais fácil!', pistas: ['Há uma linha com o mesmo símbolo repetido: começa por aí.', 'Quando souberes um símbolo, substitui-o nas outras linhas.', 'Faz as contas no caderno.'],
    iniciar(api) {
      let ronda = 0, pontos = 0;
      const corpo = h('div'); api.area.append(corpo);
      function nova() {
        ronda++; corpo.innerHTML = '';
        const s = U.misturar(Math.random, ['🌰', '🍄', '⭐', '🐌', '🍓', '🔩']), a = ri(2, 12) * 5, b = ri(2, 15), c = ri(3, 20);
        const L = [`${s[0]} + ${s[0]} + ${s[0]} = ${3 * a}`, `${s[0]} + ${s[1]} = ${a + b}`, `${s[2]} × ${s[1]} = ${b * c}`];
        const vals = [a, b, c]; let falhas = 0;
        corpo.append(h('p', { class: 'rv-enun' }, `Enigma ${ronda} de 4`), h('div', { class: 'rv-enigma' }, L.map(t => h('div', null, t))));
        const linhas = s.slice(0, 3).map((x, k) => { const inp = entrada('100px', () => ver(k)); const d = h('div', { class: 'rv-en-r' }, h('span', null, `${x} =`), inp); corpo.append(d); return { inp, d }; });
        const fb = h('p', { class: 'rv-fb' }); corpo.append(fb);
        function ver(k) {
          const n = num(linhas[k].inp.value); if (isNaN(n)) return;
          if (n === vals[k]) { linhas[k].d.classList.add('ok'); linhas[k].inp.disabled = true; som('apanhar'); if (linhas[k + 1]) linhas[k + 1].inp.focus(); }
          else { falhas++; linhas[k].d.classList.add('mal'); setTimeout(() => linhas[k].d.classList.remove('mal'), 600); }
          if (linhas.every(l => l.inp.disabled)) {
            if (falhas <= 1) pontos++;
            fb.textContent = falhas <= 1 ? '✓ Enigma resolvido!' : '✓ Resolvido, mas com várias tentativas.'; fb.className = 'rv-fb ok';
            api.conta(`${pontos} enigmas`); api.rel.depois(() => ronda < 4 ? nova() : api.fim(pontos, 3, 'Conta como resolvido o enigma feito com no máximo 1 erro.'), 1300);
          }
        }
        setTimeout(() => linhas[0].inp.focus(), 50);
      }
      api.conta('0 enigmas'); nova();
    } };

  // 8. Caça às planificações
  JOGOS.planificacoes = { nome: 'Caça às planificações', emoji: '📦', tema: 'Geometria', unidade: 'em 4', desc: 'Quais destas figuras dobram e fecham um cubo? Escolhe todas as certas.',
    intro: 'Marca TODAS as figuras que são planificações do cubo e carrega em Verificar.', pistas: ['Escolhe um quadrado para ser o fundo do cubo.', 'Dobra os outros para cima na tua cabeça: cada um tem de ir para uma parede diferente.', 'Se dois quadrados forem parar ao mesmo sítio, não fecha.'],
    iniciar(api) {
      let ronda = 0, pontos = 0;
      const corpo = h('div'); api.area.append(corpo);
      function nova() {
        ronda++; corpo.innerHTML = '';
        const vistas = new Set(), boas = [], mas = [];
        for (let t = 0; t < 5000 && (boas.length < 2 || mas.length < 4); t++) { const x = U.hexomino(Math.random), f = x.map(c => c.join(',')).sort().join(';'); if (vistas.has(f)) continue; vistas.add(f); (U.eCubo(x) ? boas : mas).push(x); }
        const nb = ri(1, 3), figs = U.misturar(Math.random, [...boas.slice(0, nb), ...mas.slice(0, 6 - nb)]);
        const sel = new Set();
        const grelha = h('div', { class: 'rv-planif' });
        figs.forEach((f, k) => { const b = h('button', { type: 'button', class: 'rv-pl', 'aria-pressed': 'false', html: `<svg viewBox="0 0 10 10" width="0"></svg>` }); b.innerHTML = `<b>${'ABCDEF'[k]}</b>` + svgPl(f); b.onclick = () => { sel.has(k) ? sel.delete(k) : sel.add(k); b.setAttribute('aria-pressed', String(sel.has(k))); }; grelha.append(b); });
        const ok = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, 'Verificar'), fb = h('p', { class: 'rv-fb' });
        corpo.append(h('p', { class: 'rv-enun' }, `Ronda ${ronda} de 4 — quais são planificações do cubo?`), grelha, ok, fb);
        ok.onclick = () => {
          ok.disabled = true;
          const certas = figs.map((f, k) => U.eCubo(f) ? k : -1).filter(k => k >= 0), bem = certas.length === sel.size && certas.every(k => sel.has(k));
          grelha.querySelectorAll('.rv-pl').forEach((b, k) => b.classList.add(U.eCubo(figs[k]) ? 'ok' : sel.has(k) ? 'mal' : 'nao'));
          if (bem) { pontos++; som('sucesso'); }
          fb.textContent = bem ? '✓ Todas certas!' : `As planificações do cubo eram: ${certas.map(k => 'ABCDEF'[k]).join(', ')} (a verde).`; fb.className = 'rv-fb ' + (bem ? 'ok' : 'mal');
          api.conta(`${pontos} rondas certas`);
          api.rel.depois(() => ronda < 4 ? nova() : api.fim(pontos, 3), bem ? 1300 : 3200);
        };
      }
      api.conta('0 rondas certas'); nova();
    } };
  function svgPl(cels) {
    const s = 22, mr = Math.max(...cels.map(c => c[0])), mc = Math.max(...cels.map(c => c[1]));
    return `<svg viewBox="0 0 ${(mc + 1) * s + 8} ${(mr + 1) * s + 8}" width="${(mc + 1) * s + 8}">${cels.map(([r, c]) => `<rect x="${4 + c * s}" y="${4 + r * s}" width="${s}" height="${s}" fill="#f6c25b" stroke="#7a4a00" stroke-width="2"/>`).join('')}</svg>`;
  }

  // ------------------------------------------------------------ arranque
  document.addEventListener('DOMContentLoaded', () => {
    $('marcaIcone').innerHTML = `<img src="${masc.img('boas_vindas')}" alt="" aria-hidden="true">`;
    pintarMoedas();
    $('btnMenu').onclick = () => {
      if (!$('vSessao').hidden) janela('a_pensar', 'Voltar ao ginásio?', 'O que estás a fazer agora não fica guardado.', [['Continuar', 'btn-escuro', () => {}], ['Voltar', 'btn-texto', menu]]);
    };
    const q = new URLSearchParams(location.search);
    if (q.get('teste')) correrTeste();
    else if (q.get('treino') && (R.TEMAS[q.get('treino')] || NOME_TREINO[q.get('treino')])) treino(q.get('treino'));
    else if (q.get('jogo') && JOGOS[q.get('jogo')]) jogar(q.get('jogo'));
    else menu();
  });
  F.REV.ui = { menu, treino, correrTeste, jogar, JOGOS };
})();
