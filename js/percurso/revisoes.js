/* Nico · Capítulo especial — O Ginásio dos Números (revisões de Matemática do 3.º ano).
 *
 * Três maneiras de treinar, sempre com exercícios novos (gerados em missoes/revisoes-3ano.js):
 *   · Teste de revisão — 22 questões de todos os temas + 3 jogos curtos (a rodar entre testes), sem correção até entregar; no fim o resultado com a menção
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
  function reforcar(max) {   // as mais fracas primeiro: menos de 70% certas nas recentes (um erro único também conta, depois das repetidas)
    return Object.entries(P.comp).filter(([, c]) => c.ult.length && taxa(c) < 0.7)
      .sort((a, b) => (a[1].ult.length > 1 ? 0 : 1) - (b[1].ult.length > 1 ? 0 : 1) || taxa(a[1]) - taxa(b[1]) || b[1].ult.length - a[1].ult.length)
      .slice(0, max || 5).map(([nome, c]) => ({ nome, c, p: Math.round(100 * taxa(c)) }));
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
  // arte do Ambrósio (PR #85, 7 Nov 2026) — img/revisoes/; o que é medida/resposta continua em SVG/HTML exato
  const ART = 'img/revisoes/';
  const icone = (nome, cls) => h('img', { src: ART + nome + '.webp', alt: '', class: cls || 'rv-ico', 'aria-hidden': 'true', loading: 'lazy' });
  const PECAS = { '🌰': ['bolota', 'bolota'], '🍄': ['cogumelo', 'cogumelo'], '⭐': ['estrela', 'estrela'], '🐌': ['caracol', 'caracol'], '🍓': ['morango', 'morango'], '🔩': ['parafuso', 'parafuso'] };
  const comPecas = t => t.replace(/🌰|🍄|⭐|🐌|🍓|🔩/gu, e => `<img class="rv-peca" src="${ART}peca-${PECAS[e][0]}.webp" alt="${PECAS[e][1]}">`);
  const GRELHA = { nico: '<img class="rv-cel-img" src="img/percurso/nico-tartaruga-n.webp" alt="Nico">', moeda: '<img class="rv-cel-img" src="img/percurso/moeda-cobre.webp" alt="moeda">', pedra: `<img class="rv-cel-img" src="${ART}peca-pedra.webp" alt="pedra">` };

  // ------------------------------------------------------------ menu
  const JOGOS = {};
  function menu() {
    vista('vMenu');
    document.title = 'Nico · Capítulo especial · Revisões de Matemática';
    if ($('menuMasc')) $('menuMasc').remove();
    pintarMoedas();
    // o teste
    const ult = P.testes[P.testes.length - 1], melhor = P.testes.reduce((m, t) => Math.max(m, t.pct), -1);
    const T = $('menuTeste'); T.innerHTML = '';
    const bT = h('button', { type: 'button', class: 'pc-sessao prova rv-teste' },
      h('span', { class: 'ps-num' }, '🎯 Teste de revisão · como o teste da escola'),
      h('strong', null, 'Fazer um teste novo'),
      h('span', { class: 'ps-tema' }, `${Object.values(R.PLANO).reduce((a, b) => a + b, 0) + 3} questões de todos os temas (3 delas são jogos), diferentes de cada vez. Só vês a correção no fim — depois o Nico dá-te a classificação e diz-te o que treinar.`),
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
        h('strong', null, icone('tema-' + id), t.nome),
        h('span', { class: 'ps-estado' }, tr ? `${tr.rondas} ${tr.rondas === 1 ? 'treino feito' : 'treinos feitos'} · ${Math.round(100 * tr.certas / Math.max(1, tr.total))}% certas` : 'Começar'));
      b.onclick = () => treino(id);
      L.append(b);
    });
    const bMix = h('button', { type: 'button', class: 'pc-sessao rv-tema treino' }, h('span', { class: 'ps-num' }, 'Treino'), h('strong', null, icone('tema-mix'), 'Mistura de tudo'),
      h('span', { class: 'ps-estado' }, 'Um pouco de cada tema'));
    bMix.onclick = () => treino('mix');
    L.append(bMix);
    const fr = reforcar(4);
    if (fr.length) {
      const bR = h('button', { type: 'button', class: 'pc-sessao rv-tema fraco rv-reforco-cartao' }, h('span', { class: 'ps-num' }, 'Treino personalizado'), h('strong', null, icone('tema-reforco'), 'Reforço dos pontos fracos'),
        h('span', { class: 'ps-tema' }, fr.map(f => f.nome).join(' · ')), h('span', { class: 'ps-estado' }, 'Treinar o que está a falhar'));
      bR.onclick = () => treino('reforco');
      L.prepend(bR);
    }
    // jogos
    const J = $('menuJogos'); J.innerHTML = '';
    Object.entries(JOGOS).forEach(([id, j]) => {
      const rec = P.jogos[id];
      const nv = j.variantes ? j.variantes.length : 0, jogados = nv ? j.variantes.filter(([v]) => P.jogos[id + ':' + v]).length : 0;
      const b = h('button', { type: 'button', class: 'pc-sessao rv-jogo com-capa' }, icone('jogo-' + id, 'rv-capa'), h('span', { class: 'ps-num' }, j.tema),
        h('strong', null, j.nome), h('span', { class: 'ps-tema' }, j.desc),
        h('span', { class: 'ps-estado' }, nv ? (jogados ? `Já jogaste ${jogados} das ${nv} versões · cada vez é diferente` : 'Jogar · cada vez é diferente') : rec ? `Recorde: ${rec.melhor}${j.unidade ? ' ' + j.unidade : ''}` : 'Jogar'));
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
  function graficoTestes(lista, W) {
    W = W || 640; const Hh = 200, m = 36, dir = 96, passo = lista.length > 1 ? (W - m - dir - 14) / (lista.length - 1) : 0;
    const y = p => Hh - 30 - (p / 100) * (Hh - 56);
    let g = '';
    [['Insuficiente', 0, 50, '#fde2df'], ['Suficiente', 50, 70, '#fff1c2'], ['Bom', 70, 90, '#e3f5ea'], ['Muito Bom', 90, 100, '#dfe8ff']].forEach(([n, a, b, c]) => {
      g += `<rect x="${m - 10}" y="${y(b)}" width="${W - m - dir + 10}" height="${y(a) - y(b)}" fill="${c}"/><text x="${W - dir + 6}" y="${(y(a) + y(b)) / 2 + 4}" font-size="12" fill="#555">${n}</text>`; });
    [50, 70, 90].forEach(v => { g += `<text x="${m - 6}" y="${y(v) + 4}" font-size="12" text-anchor="end" fill="#666">${v}%</text>`; });
    if (lista.length > 1) g += `<polyline fill="none" stroke="#2b3a8f" stroke-width="3" points="${lista.map((t, i) => `${m + i * passo},${y(t.pct)}`).join(' ')}"/>`;
    lista.forEach((t, i) => { g += `<circle cx="${m + i * passo}" cy="${y(t.pct)}" r="6" fill="${t.pct >= 70 ? '#2fa36b' : t.pct >= 50 ? '#f2b632' : '#e05a47'}"/><text x="${m + i * passo}" y="${y(t.pct) - 11}" text-anchor="middle" font-size="13" font-weight="700">${t.pct}</text><text x="${m + i * passo}" y="${Hh - 10}" text-anchor="middle" font-size="11" fill="#555">T${P.testes.indexOf(t) + 1}</text>`; });
    return h('figure', { class: 'rv-grafico', html: `<svg viewBox="0 0 ${W} ${Hh}" width="100%" font-family="Asap, sans-serif" role="img" aria-label="Percentagem de certas em cada teste">${g}</svg>` });
  }
  function historico() {
    const H = $('menuHist'); H.innerHTML = '';
    const fr = reforcar(6);
    if (fr.length) H.append(h('div', { class: 'rv-analise rv-an-menu' }, h('h3', null, '💪 O que tens de reforçar (somando todos os testes e treinos)'), listaReforco(fr)));
    if (!P.testes.length) { H.append(h('p', { class: 'rv-vazio' }, 'Ainda não fizeste nenhum teste. Quando fizeres, aparecem aqui os resultados para veres como vais melhorando.')); return; }
    H.append(graficoTestes(P.testes.slice(-12)));
    H.append(h('p', null, h('button', { type: 'button', class: 'btn btn-escuro btn-grande', onclick: percurso }, '📈 Ver a análise completa do percurso')));
  }

  // ------------------------------------------------------------ análise do percurso: comparar as avaliações entre si
  const seta = d => d == null ? '' : d > 0.05 ? ' ▲' : d < -0.05 ? ' ▼' : ' ＝';
  function evolucaoComp() {   // por competência, a partir das respostas por ordem (testes e 1.ª tentativa nos treinos)
    const melhorou = [], falha = [], segura = [];
    Object.entries(P.comp).forEach(([nome, c]) => {
      const u = c.ult; if (u.length < 2) return;
      const meio = Math.floor(u.length / 2), antes = u.slice(0, meio), depois = u.slice(meio), ta = antes.reduce((a, b) => a + b, 0) / antes.length, td = depois.reduce((a, b) => a + b, 0) / depois.length;
      if (antes.includes(0) && u.slice(-2).every(x => x)) melhorou.push({ nome, de: Math.round(100 * ta), para: Math.round(100 * td), n: u.length });
      else if (u.slice(-2).every(x => !x) || (u.length >= 3 && taxa(c) < 0.5)) falha.push({ nome, p: Math.round(100 * taxa(c)), n: u.length });
      else if (u.length >= 3 && taxa(c) >= 0.85) segura.push({ nome, n: u.length });
    });
    return { melhorou: melhorou.sort((a, b) => (b.para - b.de) - (a.para - a.de)), falha: falha.sort((a, b) => a.p - b.p), segura };
  }
  function percurso() {
    vista('vProva');
    document.title = 'Nico · O meu percurso';
    const caixa = $('prova'); caixa.innerHTML = '';
    const T = P.testes, corpo = h('div', { class: 'pv-corpo' }), R2 = h('div', { class: 'pv-res rv-res rv-percurso' });
    caixa.append(h('div', { class: 'pv-topo' }, h('strong', null, '📈 O meu percurso no Ginásio dos Números'), h('span', { class: 'pv-esp' }),
      h('button', { type: 'button', class: 'btn btn-texto', onclick: () => window.print() }, '🖨 Imprimir'), h('button', { type: 'button', class: 'btn btn-escuro', onclick: menu }, '← Ginásio')), corpo);
    corpo.append(R2);
    R2.append(h('div', { class: 'rv-cab-perc' }, h('img', { src: ART + 'cabecalho-percurso.webp', alt: '', 'aria-hidden': 'true' }), h('h1', null, 'O meu percurso'), h('p', null, 'Ginásio dos Números do Nico · revisões da Matemática do 3.º ano')));
    if (!T.length) { R2.append(h('p', { class: 'rv-vazio' }, 'Ainda não há testes. Faz o primeiro teste e volta aqui!')); return; }
    // 1. resumo
    const pcts = T.map(t => t.pct), media = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length), melhor = Math.max(...pcts);
    const ini = pcts.slice(0, Math.min(3, Math.ceil(pcts.length / 2))), fim = pcts.slice(-Math.min(3, Math.floor(pcts.length / 2)) || -1);
    const mi = ini.reduce((a, b) => a + b, 0) / ini.length, mf = fim.reduce((a, b) => a + b, 0) / fim.length, tend = T.length < 2 ? null : Math.round(mf - mi);
    const desde = P.treinoLog ? P.treinoLog.length : Object.values(P.treinos).reduce((a, t) => a + t.rondas, 0);
    const jogos = (P.jogoLog || []).length || Object.entries(P.jogos).filter(([k]) => k.includes(':') || !JOGOS[k] || !JOGOS[k].variantes).reduce((a, [, j]) => a + (j.vezes || 0), 0);
    R2.append(h('div', { class: 'rv-cartoes' },
      cartaoN('Testes feitos', T.length), cartaoN('Último', T[T.length - 1].pct + '%', T[T.length - 1].mencao), cartaoN('Melhor', melhor + '%', R.mencao(melhor).nome), cartaoN('Média', media + '%', R.mencao(media).nome),
      cartaoN('Tendência', tend == null ? '—' : (tend > 0 ? '+' : '') + tend + ' pontos', tend == null ? 'faz mais testes' : tend > 2 ? 'a melhorar ▲' : tend < -2 ? 'a descer ▼' : 'estável ＝'),
      cartaoN('Treinos e jogos', desde + ' · ' + jogos, 'treinos · jogos jogados')));
    R2.append(h('p', { class: 'rv-frase' }, fraseResumo(T, tend)));
    // 2. gráfico
    R2.append(h('h2', null, 'A nota em cada teste'), graficoTestes(T.slice(-15), 760));
    // 3. temas × testes
    const ult = T.slice(-8), temas = Object.keys(R.TEMAS);
    const cel = (t, k) => { const v = t.porTema && t.porTema[k]; return v ? v[0] / v[1] : null; };
    R2.append(h('h2', null, 'Cada tema, teste a teste'), h('p', { class: 'pe-instr' }, 'Percentagem de certas em cada tema. ▲ subiu e ▼ desceu em relação ao primeiro teste mostrado.'));
    R2.append(h('div', { class: 'rv-tab-scroll' }, h('table', { class: 'it-tabela rv-mapa-temas' },
      h('thead', null, h('tr', null, h('th', null, 'Tema'), ...ult.map(t => h('th', null, `T${T.indexOf(t) + 1}`, h('br'), h('small', null, t.quando.slice(5, 10).split('-').reverse().join('/')))), h('th', null, 'Evolução'))),
      h('tbody', null, temas.map(k => {
        const vals = ult.map(t => cel(t, k)), conh = vals.filter(v => v != null), d = conh.length > 1 ? conh[conh.length - 1] - conh[0] : null;
        return h('tr', null, h('td', null, icone('tema-' + k), R.TEMAS[k].nome),
          ...vals.map(v => h('td', { class: 'rv-cel ' + (v == null ? '' : v >= 0.75 ? 'bom' : v >= 0.5 ? 'medio' : 'fraco') }, v == null ? '—' : Math.round(100 * v) + '%')),
          h('td', { class: 'rv-evo' }, d == null ? '—' : (d > 0 ? '+' : '') + Math.round(100 * d) + seta(d)));
      })))));
    // 4. competências
    const ev = evolucaoComp();
    const lst = (l, f) => l.length ? h('ul', null, l.slice(0, 10).map(x => h('li', null, f(x)))) : h('p', { class: 'pe-instr' }, 'Ainda nada aqui.');
    R2.append(h('h2', null, 'Competências'), h('div', { class: 'rv-an-col rv-analise' },
      h('div', null, h('h3', null, '🚀 Melhorou'), h('p', { class: 'pe-instr' }, 'Falhava antes e acertou as últimas vezes.'), lst(ev.melhorou, x => [x.nome, h('small', null, ` (${x.de}% → ${x.para}%)`)])),
      h('div', null, h('h3', null, '⚠ Continua a falhar'), h('p', { class: 'pe-instr' }, 'Errou as últimas vezes ou acerta menos de metade.'), lst(ev.falha, x => [x.nome, h('small', null, ` (${x.p}% em ${x.n})`)]),
        ev.falha.length ? h('button', { type: 'button', class: 'btn btn-azul', onclick: () => treino('reforco') }, '💪 Treino de reforço') : null),
      h('div', null, h('h3', null, '✅ Seguro'), h('p', { class: 'pe-instr' }, 'Acerta quase sempre (pelo menos 3 vezes).'), lst(ev.segura, x => x.nome))));
    // 5. tabela dos testes
    R2.append(h('h2', null, 'Todos os testes'), h('div', { class: 'rv-tab-scroll' }, h('table', { class: 'it-tabela rv-hist' },
      h('thead', null, h('tr', null, ['Teste', 'Dia', 'Certas', '%', 'Classificação', 'Tempo', 'Diferença', 'Treinos antes'].map(c => h('th', null, c)))),
      h('tbody', null, T.map((t, i) => {
        const ant = T[i - 1], dif = ant ? t.pct - ant.pct : null;
        const tr = (P.treinoLog || []).filter(x => x.quando > (ant ? ant.quando : '') && x.quando <= t.quando).length;
        return h('tr', null, h('td', null, 'T' + (i + 1)), h('td', null, t.quando.replace('T', ' ')), h('td', null, `${t.certas} / ${t.total}`), h('td', null, t.pct + '%'), h('td', null, h('b', null, t.mencao)),
          h('td', null, t.minutos + ' min'), h('td', { class: dif > 0 ? 'rv-sobe' : dif < 0 ? 'rv-desce' : '' }, dif == null ? '—' : (dif > 0 ? '+' : '') + dif), h('td', null, P.treinoLog ? String(tr) : '—'));
      }).reverse()))));
    masc.dizer && masc.dizer('boas_vindas', fraseResumo(T, tend));
  }
  const cartaoN = (t, v, sub) => h('div', { class: 'rv-cartao-n' }, h('small', null, t), h('b', null, String(v)), sub ? h('span', null, sub) : null);
  function fraseResumo(T, tend) {
    const u = T[T.length - 1];
    if (T.length === 1) return `Primeiro teste: ${u.pct}% (${u.mencao}). A partir do próximo já dá para ver a evolução.`;
    const ev = evolucaoComp();
    return `${T.length} testes. O último deu ${u.pct}% (${u.mencao})` + (tend > 2 ? `, e a tendência é para subir (+${tend} pontos desde o início).` : tend < -2 ? `; a tendência está a descer (${tend} pontos) — vale a pena treinar mais antes do próximo teste.` : ', com resultados estáveis.')
      + (ev.melhorou.length ? ` Melhorou em ${ev.melhorou.length} ${ev.melhorou.length === 1 ? 'competência' : 'competências'}` + (ev.falha.length ? ` e ainda falha em ${ev.falha.length}.` : '.') : ev.falha.length ? ` Ainda falha em ${ev.falha.length} ${ev.falha.length === 1 ? 'competência' : 'competências'}.` : '');
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
      const ev = new Set([...usados, ...(P.recTreino || [])]), it = R.gerar(t, Math.random, R.G[t].some(g => !ev.has(g.k)) ? ev : usados.size < R.G[t].length ? usados : null);
      usados.add(it.k); out.push(it);
    }
    P.recTreino = [...(P.recTreino || []), ...out.map(x => x.k)].slice(-40);
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
      tr.rondas++; tr.certas += certas; tr.total += itens.length;
      (P.treinoLog = P.treinoLog || []).push({ quando: new Date().toISOString().slice(0, 16), tema, certas, total: itens.length }); if (P.treinoLog.length > 300) P.treinoLog.shift();
      gravar();
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
  // sem limite de tempo (pedido do Carlos, 8 Nov 2026): o relógio só mostra há quanto tempo começou; nunca avisa nem entrega sozinho
  function abrirTeste() {
    janela('dica', 'Teste de revisão', `São ${Object.values(R.PLANO).reduce((a, b) => a + b, 0) + 3} questões de todos os temas do 3.º ano, e 3 delas são jogos. Prepara o caderno e o lápis: nas contas, resolve no caderno e escreve aqui só o resultado. Podes andar para a frente e para trás e marcar questões para rever. Não há limite de tempo: faz com calma. A correção e a classificação aparecem quando entregares.`,
      [['Ainda não', 'btn-texto', () => {}], ['Começar o teste', 'btn-escuro', correrTeste]]);
  }
  function correrTeste() {
    vista('vProva');
    // tipos de exercício dos últimos testes: o teste novo evita-os (só os repete quando um tema já os usou todos)
    const recentes = new Set(P.testes.slice(-4).flatMap(t => t.tipos || []));
    const itens = R.teste(Math.random, recentes);
    // alguns jogos (3) no meio do teste, a rodar entre testes
    const JT = R.jogosTeste;
    JT.escolher(3, recentes).forEach((j, k) => itens.splice(Math.round((k + 1) * (itens.length + 1) / 4), 0, j));
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
    let acabou = false;
    const tick = () => {
      if (acabou) return;
      const s = Math.floor((Date.now() - t0) / 1000);
      relogio.textContent = `⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      relogio.title = 'Há quanto tempo começaste (não há limite)';
    };
    const rel = F.PC.relogio(); tick(); rel.cada(tick, 500);
    atual = { relogio: rel };
    function guardar() { if (ctrl) resp[i] = ctrl.respondido() ? ctrl.valor() : undefined; }
    function ir(k) {
      guardar(); i = k;
      const it = itens[i];
      corpo.innerHTML = '';
      const alvo = h('div', { class: 'rv-item' + (it.caderno ? ' caderno' : '') }); corpo.append(alvo);
      ctrl = it.tipo === 'jogo' ? JT.montar(alvo, Object.assign({}, it, { pergunta: `${i + 1}. ${it.pergunta}` }), () => { guardar(); pintarNav(); })
        : F.PC.itens.montar(alvo, Object.assign({}, it, { pergunta: `${i + 1}. ${it.pergunta}` }), { modo: 'prova', aoMudar: () => { guardar(); pintarNav(); } });
      if (resp[i] !== undefined) ctrl.repor(resp[i]);
      bAnt.disabled = i === 0; bSeg.disabled = i === itens.length - 1;
      bMarcar.setAttribute('aria-pressed', String(marcadas.has(i)));
      pintarNav();
    }
    function pintarNav() {
      nav.innerHTML = '';
      itens.forEach((_, k) => {
        const jogo = itens[k].tipo === 'jogo';
        const b = h('button', { type: 'button', class: (resp[k] !== undefined ? 'resp' : '') + (k === i ? ' atual' : '') + (marcadas.has(k) ? ' marcada' : '') + (jogo ? ' rv-nav-jogo' : ''), title: jogo ? 'Jogo' : null,
          'aria-label': `Questão ${k + 1}` + (jogo ? ', jogo' : '') + (resp[k] !== undefined ? ', respondida' : '') + (marcadas.has(k) ? ', marcada' : '') }, jogo ? '🎮' : String(k + 1));
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
      acabou = true; rel.limpar();
      const porTema = {}; let certas = 0;
      const lista = itens.map((it, k) => {
        const ok = resp[k] !== undefined && (it.tipo === 'jogo' ? JT.corrigir(it, resp[k]) : F.PC.itens.corrigir(it, resp[k]));
        porTema[it.tema] = porTema[it.tema] || [0, 0]; porTema[it.tema][1]++; if (ok) { porTema[it.tema][0]++; certas++; }
        registar(it, ok);
        return { it: it.tipo === 'jogo' ? Object.assign({}, it, { explica: JT.explica(it) }) : it, ok, v: resp[k] };
      });
      const total = itens.length, pct = Math.round(100 * certas / total), M = R.mencao(pct);
      const min = Math.max(1, Math.round((Date.now() - t0) / 60000));
      P.testes.push({ quando: new Date().toISOString().slice(0, 16), certas, total, pct, mencao: M.nome, porTema, minutos: min, erros: lista.filter(x => !x.ok).map(x => x.it.k), tipos: itens.map(x => x.k) });
      gravar();
      const ganhas = moedas([0, 2, 5, 8][M.gemas]);
      corpo.innerHTML = '';
      caixa.querySelector('.pv-pe').hidden = true; nav.innerHTML = ''; relogio.textContent = `${min} min`; relogio.style.background = '#fff';
      const gemas = h('div', { class: 'rv-gemas', role: 'img', 'aria-label': `${M.gemas} de 3 pedras` }, [0, 1, 2].map(g => icone(g < M.gemas ? 'pedra-on' : 'pedra-off', 'rv-pedra')));
      const FMEN = { 'Insuficiente': 'mencao-insuficiente', 'Suficiente': 'mencao-suficiente', 'Bom': 'mencao-bom', 'Muito Bom': 'mencao-muito-bom' };
      const anterior = P.testes.length > 1 ? P.testes[P.testes.length - 2].pct : null;
      const fracos = Object.entries(porTema).filter(([, [c, n]]) => c / n < 0.6).map(([t]) => t);
      const res = h('div', { class: 'pv-res rv-res' },
        h('div', { class: 'rv-res-topo' },
          h('img', { src: ART + FMEN[M.nome] + '.webp', alt: '', class: 'rv-mencao-img' }),
          h('div', null,
            h('p', { class: 'rv-res-n' }, `${certas} de ${total} certas · ${pct}%`, anterior != null && pct > anterior ? h('img', { src: ART + 'medalha-subiu.webp', alt: 'Subiste em relação ao teste anterior', class: 'rv-medalha', title: 'Subiste em relação ao teste anterior' }) : null),
            h('h1', { class: 'rv-mencao m' + M.gemas }, M.nome), gemas,
            h('p', null, M.frase + (anterior != null ? (pct > anterior ? ` Subiste ${pct - anterior} pontos desde o teste anterior! 🚀` : pct === anterior ? ' Igual ao teste anterior.' : '') : '') + txtMoedas(ganhas)))),
        h('h2', null, 'Por tema'),
        h('div', { class: 'rv-temas-res' }, Object.entries(porTema).map(([t, [c, n]]) => {
          const p = c / n, antT = P.testes.length > 1 && P.testes[P.testes.length - 2].porTema[t], d = antT ? p - antT[0] / antT[1] : null;
          const b = h('div', { class: 'rv-tr ' + (p >= 0.75 ? 'bom' : p >= 0.5 ? 'medio' : 'fraco') },
            h('span', null, icone('tema-' + t), R.TEMAS[t].nome), h('i', null, h('b', { style: `width:${100 * p}%` })), h('strong', null, `${c} / ${n}`, h('small', { class: d > 0.05 ? 'rv-sobe' : d < -0.05 ? 'rv-desce' : '', title: 'em relação ao teste anterior' }, seta(d))));
          if (p < 1) b.append(h('button', { type: 'button', class: 'btn btn-texto', onclick: () => treino(t) }, 'Treinar'));
          return b;
        })),
        analise(lista),
        h('h2', null, 'Correção'),
        h('ol', { class: 'rv-correcao' }, lista.map(({ it, ok, v }) => h('li', { class: ok ? 'certo' : 'errado' },
          h('b', null, ok ? '✓ ' : '✗ '), it.pergunta,
          ok ? null : h('div', { class: 'pe-instr' }, (v === undefined ? 'Sem resposta. ' : respondeste(it, v)) + 'Resposta certa: ' + (it.tipo === 'jogo' ? JT.certa(it) : F.PC.itens.respostaCerta(it))),
          ok || !it.explica ? null : h('div', { class: 'rv-explica' }, it.explica)))),
        h('p', { class: 'rv-res-botoes' },
          h('button', { type: 'button', class: 'btn btn-texto btn-grande', onclick: menu }, 'Voltar ao ginásio'),
          reforcar(1).length ? h('button', { type: 'button', class: 'btn btn-azul btn-grande', onclick: () => treino('reforco') }, '💪 Treino de reforço') : fracos.length ? h('button', { type: 'button', class: 'btn btn-azul btn-grande', onclick: () => treino(fracos[0]) }, `Treinar ${R.TEMAS[fracos[0]].nome.toLowerCase()}`) : null,
          P.testes.length > 1 ? h('button', { type: 'button', class: 'btn btn-texto btn-grande', onclick: percurso }, '📈 Comparar com os testes anteriores') : null,
          h('button', { type: 'button', class: 'btn btn-escuro btn-grande', onclick: abrirTeste }, 'Fazer outro teste')));
      corpo.append(res);
      corpo.scrollTop = 0;
      som('nivel');
    }
    ir(0);
  }

  // o que a criança respondeu, escrito, para a correção (para se ver o que ficou gravado)
  function respondeste(it, v) {
    const L = 'ABCDEFGH';
    if (it.tipo === 'curta') return `Respondeste: ${v}. `;
    if (it.tipo === 'ficha' && Array.isArray(v)) return `Respondeste: ${v.map(x => x.trim() || '—').join(' · ')} (${R.fichaCaixas(it, v)} de ${it.res.length} caixas certas). `;
    if (it.tipo === 'escolha' && typeof v === 'number') return `Respondeste: ${L[v]}) ${it.opcoes[v]}. `;
    if (it.tipo === 'varias' && Array.isArray(v)) return `Respondeste: ${v.map(i => L[i] + ') ' + it.opcoes[i]).join(' · ')}. `;
    if (it.tipo === 'vf' && Array.isArray(v)) return `Respondeste: ${v.map(x => x === true ? 'V' : x === false ? 'F' : '—').join(' · ')}. `;
    return '';
  }
  // análise final: onde falhou neste teste, o que tem de reforçar (somando tudo o que já fez) e o que já está seguro
  const listaReforco = fr => h('ul', { class: 'rv-reforco' }, fr.map(f => h('li', null, h('span', null, f.nome), h('i', null, h('b', { style: `width:${f.p}%` })), h('small', null, f.c.ult.length === 1 ? 'errado da única vez que saiu' : `${f.p}% certas nas últimas ${f.c.ult.length}`))));
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
  function jogar(id, v) {
    const j = JOGOS[id];
    if (j.variantes && v == null) v = proximaVariante(id);   // a criança não escolhe: o Nico vai variando o modo
    vista('vSessao');
    const chave = j.variantes ? id + ':' + v : id, nomeV = j.variantes ? (j.variantes.find(x => x[0] === v) || [])[1] : null;
    $('rodape').hidden = true;
    $('atArea').textContent = '🎮 ' + j.tema; $('atArea').style.background = '#2b3a8f';
    $('atTitulo').textContent = j.emoji + ' ' + j.nome + (nomeV ? ' · ' + nomeV : '');
    document.title = 'Nico · ' + j.nome;
    masc.pistas(j.pistas || []);
    const rel = F.PC.relogio();
    atual = { relogio: rel };
    const palco = $('atPalco'); palco.innerHTML = '';
    const area = h('div', { class: 'rv-jogo-palco' }); palco.append(area);
    $('btnOuvir').onclick = () => masc.ouvir(area.innerText);
    const api = {
      rel, area, v, conta: t => { $('atConta').textContent = t; },
      dizer: (e, t) => masc.dizer(e, t),
      fim(pontos, objetivo, texto) {
        const rec = P.jogos[chave] = P.jogos[chave] || { melhor: 0, vezes: 0 };
        rec.vezes++; const novo = pontos > rec.melhor; if (novo) rec.melhor = pontos;
        (P.jogoLog = P.jogoLog || []).push({ quando: new Date().toISOString().slice(0, 16), jogo: chave, pontos }); if (P.jogoLog.length > 300) P.jogoLog.shift();
        gravar();
        const ganhas = moedas(pontos >= objetivo ? 3 : 0);
        janela(pontos >= objetivo ? 'celebrar' : 'incentivar', `${pontos}${j.unidade ? ' ' + j.unidade : ' pontos'}` + (novo ? ' · novo recorde!' : ''),
          (texto || (pontos >= objetivo ? 'Fantástico!' : `Para ganhar moedas precisas de ${objetivo}. Tenta outra vez!`)) + txtMoedas(ganhas),
          [['Voltar ao ginásio', 'btn-texto', menu], ['Jogar outra vez', 'btn-azul', () => jogar(id)]]);
      },
    };
    masc.dizer('curiosa', j.intro);
    j.iniciar(api);
  }
  // o modo de cada jogo é escolhido pelo Nico: primeiro os que ainda não saíram, depois os menos jogados, nunca o mesmo duas vezes seguidas
  function proximaVariante(id) {
    const j = JOGOS[id], G = P.jogos[id] = P.jogos[id] || { melhor: 0, vezes: 0 }, todas = j.variantes.map(x => x[0]);
    let por = todas.filter(v => !(G.saidos || []).includes(v));   // uma volta completa por todas as versões antes de repetir
    if (!por.length) { G.saidos = []; por = todas.filter(v => v !== G.ultimo); }
    const v = pickR(por.length ? por : todas);
    G.saidos = [...(G.saidos || []), v]; G.ultimo = v; gravar();
    return v;
  }
  function escolherVariante(id) {   // (já não é usado no menu; fica para o professor, com ?jogo=<id>&modo=escolher)
    vista('vSessao');
    const j = JOGOS[id];
    $('rodape').hidden = true;
    $('atArea').textContent = '🎮 ' + j.tema; $('atArea').style.background = '#2b3a8f';
    $('atTitulo').textContent = j.emoji + ' ' + j.nome + ' · escolhe o modo';
    const palco = $('atPalco'); palco.innerHTML = '';
    const g = h('div', { class: 'pc-sessoes rv-modos' });
    j.variantes.forEach(([v, nome, desc]) => {
      const rec = P.jogos[id + ':' + v];
      const b = h('button', { type: 'button', class: 'pc-sessao rv-jogo' }, h('strong', null, nome), h('span', { class: 'ps-tema' }, desc),
        h('span', { class: 'ps-estado' }, rec ? `Recorde: ${rec.melhor}${j.unidade ? ' ' + j.unidade : ''}` : 'Jogar'));
      b.onclick = () => jogar(id, v);
      g.append(b);
    });
    palco.append(h('div', { class: 'rv-jogo-palco' }, h('p', { class: 'rv-enun' }, j.desc), g));
    masc.dizer('curiosa', 'Este jogo tem vários modos. Qual escolhes hoje?');
    $('btnOuvir').onclick = () => masc.ouvir(palco.innerText);
  }
  const ri = (a, b) => U.ri(Math.random, a, b);
  const pickR = l => U.pick(Math.random, l);
  const entrada = (larg, aoEnter) => { const inp = h('input', { type: 'text', inputmode: 'numeric', autocomplete: 'off', class: 'rv-inp', style: larg ? 'width:' + larg : null }); inp.addEventListener('keydown', e => { if (e.key === 'Enter') aoEnter(); }); return inp; };
  const num = t => { const n = Number(String(t).replace(/[\s  ]/g, '').replace(',', '.')); return String(t).trim() === '' ? NaN : n; };

  // 1. Tabuada-relâmpago
  JOGOS.tabuada = { nome: 'Tabuada-relâmpago', emoji: '⚡', tema: 'Cálculo mental', unidade: 'certas', desc: '60 segundos: quantas multiplicações e divisões consegues acertar?',
    variantes: [['mistura', 'Mistura', '× e : das tabuadas do 2 ao 10'], ['x', 'Só multiplicações', 'tabuadas do 2 ao 10'], ['div', 'Só divisões', 'a tabuada ao contrário'], ['dificeis', 'Tabuadas difíceis', 'só do 6, 7, 8 e 9'], ['dez', '× 10, 100 e 1000', 'acrescentar zeros']],
    intro: 'Tens 60 segundos! Escreve o resultado e carrega em Enter. Objetivo: 15 certas.',
    iniciar(api) {
      let certas = 0, erradas = 0, a, b, div, fim = Date.now() + 60000;
      const q = h('div', { class: 'rv-tab-q' }), inp = entrada('160px', ver), barra = h('div', { class: 'rv-barra' }, h('b')), fb = h('p', { class: 'rv-fb', 'aria-live': 'polite' });
      api.area.append(barra, q, inp, fb);
      function nova() {
        const V = api.v; a = V === 'dificeis' ? ri(6, 9) : V === 'dez' ? ri(2, 99) : ri(2, 10); b = V === 'dez' ? pickR([10, 100, 1000]) : ri(2, 10);
        div = V === 'div' ? true : V === 'mistura' ? Math.random() < 0.3 : false; q.textContent = div ? `${a * b} : ${a} =` : `${U.fmt(a)} × ${U.fmt(b)} =`; inp.value = ''; inp.focus(); }
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
    variantes: [['pôr', 'Pôr as contas', 'lês o número e pões as contas'], ['ler', 'Ler o ábaco', 'vês o ábaco e escreves o número'], ['facil', 'Até 9 999', 'números mais pequenos para aquecer']],
    intro: 'Clica em + e − para pôr as contas em cada vareta. Cada vareta leva até 9 contas.', pistas: ['Começa pelas centenas de milhar (CM), à esquerda.', 'Uma ordem que não aparece no número fica com a vareta vazia.', 'Escreve o número no caderno numa tabela CM DM UM C D U.'],
    iniciar(api) {
      let ronda = 0, pontos = 0, alvo, dig;
      const enun = h('p', { class: 'rv-enun' }), fig = h('div', { class: 'rv-abaco' }), botoes = h('div', { class: 'rv-abaco-bt' }), ok = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, 'Verificar'), fb = h('p', { class: 'rv-fb' });
      api.area.append(enun, fig, botoes, ok, fb);
      function desenhar() { fig.innerHTML = U.svgAbaco(Number(dig.join(''))); }
      const inpA = entrada('200px', () => ok.click()); inpA.hidden = true; api.area.insertBefore(inpA, ok);
      function nova() {
        ronda++; alvo = api.v === 'facil' ? ri(100, 9999) : ri(1, 9) * 100000 + ri(0, 99999); if (Math.random() < 0.5) { const s = String(alvo).split(''); s[ri(1, 5)] = '0'; alvo = Number(s.join('')); }
        dig = [0, 0, 0, 0, 0, 0];
        enun.innerHTML = ''; enun.append(`Ronda ${ronda} de 6 — representa: `, h('b', null, Math.random() < 0.5 ? U.fmt(alvo) : '«' + U.extenso(alvo) + '»'));
        if (api.v === 'ler') { dig = String(alvo).padStart(6, '0').split('').map(Number); enun.textContent = `Ronda ${ronda} de 6 — que número está no ábaco?`; inpA.hidden = false; inpA.value = ''; setTimeout(() => inpA.focus(), 30); }
        botoes.innerHTML = '';
        ['CM', 'DM', 'UM', 'C', 'D', 'U'].forEach((o, k) => botoes.append(h('div', null,
          h('button', { type: 'button', class: 'btn btn-texto', 'aria-label': 'Mais uma conta em ' + o, onclick: () => { if (dig[k] < 9) { dig[k]++; desenhar(); som('clique'); } } }, '+'),
          h('button', { type: 'button', class: 'btn btn-texto', 'aria-label': 'Menos uma conta em ' + o, onclick: () => { if (dig[k] > 0) { dig[k]--; desenhar(); } } }, '−'))));
        fb.textContent = ''; ok.disabled = false; desenhar(); botoes.hidden = api.v === 'ler';
      }
      ok.onclick = () => {
        const v = api.v === 'ler' ? num(inpA.value) : Number(dig.join('')); if (isNaN(v)) return; ok.disabled = true;
        if (v === alvo) { pontos++; fb.textContent = '✓ Certinho!'; fb.className = 'rv-fb ok'; som('sucesso'); }
        else { fb.textContent = `✗ ${api.v === 'ler' ? 'Escreveste' : 'Ficou'} ${U.fmt(v)}. O certo era ${U.fmt(alvo)} → ${String(alvo).padStart(6, '0').split('').join(' ')}`; fb.className = 'rv-fb mal'; }
        api.conta(`${pontos} certas`);
        api.rel.depois(() => ronda < 6 ? nova() : api.fim(pontos, 5), v === alvo ? 1000 : 2600);
      };
      api.conta('0 certas'); nova();
    } };

  // 3. Cartões binários
  JOGOS.binario = { nome: 'Cartões binários', emoji: '💡', tema: 'Pensamento computacional', unidade: 'em 8', desc: 'Vira os cartões 16 · 8 · 4 · 2 · 1 para mostrar o número — como num computador.',
    variantes: [['mostrar', 'Mostrar o número', '5 cartões, números até 31'], ['ler', 'Ler os cartões', 'vês os cartões e escreves o número'], ['grande', '6 cartões', 'com o cartão do 32: números até 63']],
    intro: 'Clica nos cartões para os virar. Cartão com pintas = 1, cartão escuro = 0. Quantas pintas fazem o número?', pistas: ['Começa pelo maior cartão que cabe no número.', 'Vê quanto falta e continua com os mais pequenos.', 'Cada cartão só se usa uma vez.'],
    iniciar(api) {
      let ronda = 0, pontos = 0, alvo, bits;
      const enun = h('p', { class: 'rv-enun' }), cartas = h('div', { class: 'rv-cartas' }), soma = h('p', { class: 'rv-soma' }), ok = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, 'Verificar'), fb = h('p', { class: 'rv-fb' });
      api.area.append(enun, cartas, soma, ok, fb);
      const V = api.v === 'grande' ? [32, 16, 8, 4, 2, 1] : [16, 8, 4, 2, 1];
      const inpB = entrada('120px', () => ok.click()); inpB.hidden = api.v !== 'ler'; api.area.insertBefore(inpB, ok);
      function desenhar() {
        cartas.innerHTML = '';
        V.forEach((v, k) => { const b = h('button', { type: 'button', class: 'rv-carta', 'aria-pressed': String(bits[k] === '1'), 'aria-label': 'Cartão ' + v, html: U.svgCartao(v, bits[k] === '1') }); b.onclick = () => { if (api.v === 'ler') return; bits[k] = bits[k] === '1' ? '0' : '1'; desenhar(); som('clique'); }; cartas.append(b); });
        const s = V.reduce((t, v, k) => t + (bits[k] === '1' ? v : 0), 0);
        soma.textContent = api.v === 'ler' ? `Em binário: ${bits.join('')}` : `Pintas à vista: ${s}  ·  em binário: ${bits.join('')}`;
      }
      function nova() {
        ronda++; alvo = ri(3, api.v === 'grande' ? 63 : 31); bits = V.map(() => '0'); enun.innerHTML = ''; enun.append(`Ronda ${ronda} de 8 — mostra o número `, h('b', null, String(alvo)));
        if (api.v === 'ler') { bits = alvo.toString(2).padStart(5, '0').split(''); enun.textContent = `Ronda ${ronda} de 8 — que número mostram os cartões?`; inpB.value = ''; setTimeout(() => inpB.focus(), 30); }
        fb.textContent = ''; ok.disabled = false; desenhar();
      }
      ok.onclick = () => {
        let s = V.reduce((t, v, k) => t + (bits[k] === '1' ? v : 0), 0);
        if (api.v === 'ler') { const n = num(inpB.value); if (isNaN(n)) return; s = n === alvo ? alvo : n; }
        ok.disabled = true;
        if (s === alvo) { pontos++; fb.textContent = `✓ ${alvo} em binário é ${bits.join('')}!`; fb.className = 'rv-fb ok'; som('sucesso'); }
        else { fb.textContent = `✗ ${api.v === 'ler' ? 'Escreveste' : 'Mostraste'} ${s}. ${alvo} = ${alvo.toString(2).padStart(V.length, '0')}`; fb.className = 'rv-fb mal'; }
        api.conta(`${pontos} certas`);
        api.rel.depois(() => ronda < 8 ? nova() : api.fim(pontos, 7), s === alvo ? 1200 : 2600);
      };
      api.conta('0 certas'); nova();
    } };

  // 4. Reta numérica
  JOGOS.reta = { nome: 'Pontaria na reta', emoji: '🎯', tema: 'Números até 999 999', unidade: 'pontos', desc: 'Clica no sítio certo da reta numérica. Quanto mais perto, mais pontos!',
    variantes: [['mistura', 'Mistura', 'retas de 0 a 1000 até 0 a 1 000 000'], ['facil', 'Retas pequenas', 'de 0 a 100 e de 0 a 1000'], ['dificil', 'Retas grandes', 'de 0 a 100 000 e de 0 a 1 000 000']],
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
        ronda++; bloq = false; max = pickR(api.v === 'facil' ? [100, 1000] : api.v === 'dificil' ? [100000, 1000000] : [1000, 10000, 100000, 1000000]); alvo = max <= 100 ? ri(3, 97) : Math.round(ri(5, 95) * max / 100 / (max / 1000)) * (max / 1000);
        if (max === 1000000) { max = 1000000; }
        enun.innerHTML = ''; enun.append(`Ronda ${ronda} de 6 — onde fica o `, h('b', null, U.fmt(alvo)), '?'); fb.textContent = ''; desenhar();
      }
      api.conta('0 pontos'); nova();
    } };

  // 5. Caça ao tesouro nas coordenadas
  JOGOS.coordenadas = { nome: 'Caça ao tesouro', emoji: '🗺️', tema: 'Geometria', unidade: 'em 10', desc: 'Encontra as casas da grelha pelas coordenadas — primeiro a letra, depois o número.',
    variantes: [['clicar', 'Encontrar a casa', 'digo-te a coordenada e tu clicas'], ['dizer', 'Dizer a coordenada', 'vês o tesouro e escolhes a coordenada certa']],
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
      const escolhas = h('div', { class: 'rv-ordena rv-coord-op' }); api.area.insertBefore(escolhas, fb);
      function clique(k, r, b) {
        if (bloq || api.v === 'dizer') return; bloq = true;
        const ok = k === c && r === l; if (ok) { pontos++; b.textContent = pickR(['🪙', '💎', '⭐']); b.classList.add('ok'); som('apanhar'); fb.textContent = '✓ Tesouro!'; fb.className = 'rv-fb ok'; }
        else { b.classList.add('mal'); const cert = grade.querySelector(`[aria-label="(${L[c]}, ${l + 1})"]`); cert.classList.add('ok'); cert.textContent = '🪙'; fb.textContent = `✗ Clicaste em (${L[k]}, ${r + 1}).`; fb.className = 'rv-fb mal'; }
        api.conta(`${pontos} tesouros`);
        api.rel.depois(() => { grade.querySelectorAll('.rv-g-c').forEach(x => { x.className = 'rv-g-c'; x.textContent = ''; }); ronda < 10 ? nova() : api.fim(pontos, 9); }, ok ? 700 : 1800);
      }
      function nova() {
        ronda++; bloq = false; c = ri(0, 7); l = ri(0, 7); enun.innerHTML = ''; enun.append(`Ronda ${ronda} de 10 — o tesouro está em `, h('b', null, `(${L[c]}, ${l + 1})`)); fb.textContent = ''; escolhas.innerHTML = '';
        if (api.v !== 'dizer') return;
        if (ronda === 1) api.dizer('curiosa', 'Vê onde está a moeda e escolhe a coordenada certa: primeiro a letra (coluna), depois o número (linha).');
        enun.textContent = `Ronda ${ronda} de 10 — em que casa está a moeda?`;
        const casa = grade.querySelector(`[aria-label="(${L[c]}, ${l + 1})"]`); casa.textContent = '🪙';
        const certa = `(${L[c]}, ${l + 1})`, ops = U.misturar(Math.random, [...new Set([certa, `(${L[(c + 1) % 8]}, ${l + 1})`, `(${L[c]}, ${(l + 1) % 8 + 1})`, `(${l + 1}, ${L[c]})`])]);
        ops.forEach(o => escolhas.append(h('button', { type: 'button', class: 'rv-num', onclick: ev => {
          if (bloq) return; bloq = true; const ok = o === certa;
          ev.currentTarget.classList.add(ok ? 'ok' : 'mal'); if (ok) { pontos++; som('apanhar'); fb.textContent = '✓ Isso!'; fb.className = 'rv-fb ok'; } else { fb.textContent = `✗ Era ${certa}: primeiro a letra, depois o número.`; fb.className = 'rv-fb mal'; }
          api.conta(`${pontos} tesouros`);
          api.rel.depois(() => { grade.querySelectorAll('.rv-g-c').forEach(x => { x.className = 'rv-g-c'; x.textContent = ''; }); ronda < 10 ? nova() : api.fim(pontos, 9); }, ok ? 700 : 1800);
        } }, o)));
      }
      api.conta('0 tesouros'); nova();
    } };

  // 6. Mensagem secreta
  const PALAVRAS = ['CASTELO', 'MONTADO', 'FABLAB', 'MINA', 'NICO', 'ERVIDEL', 'SOBREIRO', 'CORTIÇA', 'ALJUSTREL', 'GUITARRA', 'MICROBIT', 'PIRÂMIDE', 'PRISMA', 'FRAÇÃO', 'MOINHO'];
  JOGOS.secreta = { nome: 'Mensagem secreta', emoji: '🔐', tema: 'Cálculo', unidade: 'letras', desc: 'Cada letra está escondida atrás de uma conta. Resolve-as no caderno e descobre a palavra!',
    variantes: [['mistura', 'Contas misturadas', '+ − × : com números até mil'], ['tabuadas', 'Tabuadas', 'só × e : das tabuadas'], ['grandes', 'Contas grandes', '+ e − com milhares (caderno!)']],
    intro: 'Resolve cada conta (no caderno, se precisares) e escreve o resultado. As letras certas aparecem!', pistas: ['Começa pela conta que te parecer mais fácil.', 'Faz a conta no caderno com o algoritmo.', 'Se falhares, a conta fica vermelha: confirma no caderno.'],
    iniciar(api) {
      const palavra = pickR(PALAVRAS).split(''); let certas = 0, erros = 0;
      const sec = h('div', { class: 'rv-secreta' }), fb = h('p', { class: 'rv-fb' });
      api.area.append(h('p', { class: 'rv-enun' }, `Uma palavra com ${palavra.length} letras ligada ao mundo do Nico…`), sec, fb);
      palavra.forEach(letra => {
        const t = pickR(api.v === 'tabuadas' ? ['×', ':'] : api.v === 'grandes' ? ['+', '−'] : ['+', '−', '×', ':']); let a, b, v;
        if (api.v === 'tabuadas') { b = ri(2, 10); v = ri(2, 10); a = t === '×' ? v : b * v; if (t === '×') v = a * b; }
        else if (api.v === 'grandes') { a = ri(2000, 9999); b = ri(500, t === '+' ? 9999 : a - 100); v = t === '+' ? a + b : a - b; }
        else if (t === '+') { a = ri(120, 899); b = ri(50, 899); v = a + b; } else if (t === '−') { a = ri(300, 999); b = ri(50, a - 20); v = a - b; } else if (t === '×') { a = ri(12, 99); b = ri(2, 9); v = a * b; } else { b = ri(2, 9); v = ri(11, 99); a = b * v; }
        const caixa = h('div', { class: 'rv-sec-l' }), L = h('b', null, h('img', { src: ART + 'cadeado-fechado.webp', alt: 'letra escondida', class: 'rv-cadeado' })), inp = entrada('92px', ver);
        caixa.append(L, h('span', null, `${U.fmt(a)} ${t} ${U.fmt(b)}`), inp); sec.append(caixa);
        function ver() {
          const n = num(inp.value); if (isNaN(n) || caixa.classList.contains('ok')) return;
          if (n === v) { caixa.classList.add('ok'); caixa.classList.remove('mal'); L.innerHTML = ''; L.append(letra, h('img', { src: ART + 'cadeado-aberto.webp', alt: 'aberto', class: 'rv-cadeado mini' })); inp.disabled = true; certas++; som('apanhar'); const prox = sec.querySelector('.rv-sec-l:not(.ok) input'); if (prox) prox.focus(); }
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
    variantes: [['normal', '3 símbolos', 'para começar'], ['dificil', '4 símbolos', 'mais uma linha e uma divisão']],
    intro: 'Descobre o valor de cada símbolo, um de cada vez. Começa pela linha mais fácil!', pistas: ['Há uma linha com o mesmo símbolo repetido: começa por aí.', 'Quando souberes um símbolo, substitui-o nas outras linhas.', 'Faz as contas no caderno.'],
    iniciar(api) {
      let ronda = 0, pontos = 0;
      const corpo = h('div'); api.area.append(corpo);
      function nova() {
        ronda++; corpo.innerHTML = '';
        const s = U.misturar(Math.random, ['🌰', '🍄', '⭐', '🐌', '🍓', '🔩']), a = ri(2, 12) * 5, b = ri(2, 15), c = ri(3, 20);
        const L = [`${s[0]} + ${s[0]} + ${s[0]} = ${3 * a}`, `${s[0]} + ${s[1]} = ${a + b}`, `${s[2]} × ${s[1]} = ${b * c}`];
        const vals = [a, b, c]; let falhas = 0;
        if (api.v === 'dificil') { const k = ri(2, 6); L.push(`${s[3]} : ${s[0]} = ${k}`); vals.push(a * k); }
        corpo.append(h('p', { class: 'rv-enun' }, `Enigma ${ronda} de 4`), h('div', { class: 'rv-enigma' }, L.map(t => h('div', { html: comPecas(t) }))));
        const linhas = s.slice(0, vals.length).map((x, k) => { const inp = entrada('100px', () => ver(k)); const d = h('div', { class: 'rv-en-r' }, h('span', { html: comPecas(x) + ' =' }), inp); corpo.append(d); return { inp, d }; });
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

  // ============================================================ 2.ª fornada de jogos (7 Nov 2026)
  // 9. Memória das contas: pares conta ↔ resultado
  JOGOS.memoria = { nome: 'Memória das contas', emoji: '🃏', tema: 'Cálculo mental', unidade: 'jogadas', desc: 'Vira as cartas e junta cada conta ao seu resultado. Menos jogadas = melhor!',
    variantes: [['contas', 'Contas', '+ − × misturadas'], ['tabuadas', 'Tabuadas', 'multiplicações ↔ produtos'], ['medidas', 'Medidas', '1 kg ↔ 1000 g, 1 h ↔ 60 min…'], ['fracoes', 'Frações e decimais', '1/2 ↔ 0,5, 1/4 ↔ 25/100…'], ['romanos', 'Números romanos', 'XIV ↔ 14…']],
    intro: 'Vira duas cartas de cada vez. Se a conta e o resultado combinarem, ficam viradas!', pistas: ['Lembra-te de onde estão os resultados que já viste.', 'Faz a conta na cabeça antes de virar a segunda carta.', 'Começa pelos cantos e vai memorizando.'],
    iniciar(api) {
      const pares = []; const usados = new Set();
      const BANCO = {
        medidas: [['1 kg', '1000 g'], ['½ kg', '500 g'], ['¼ kg', '250 g'], ['1 h', '60 min'], ['½ h', '30 min'], ['1 km', '1000 m'], ['1 m', '100 cm'], ['1 cm', '10 mm'], ['1 l', '100 cl'], ['1 dia', '24 h'], ['1 semana', '7 dias'], ['1 século', '100 anos'], ['1 €', '100 cêntimos']],
        fracoes: [['1/2', '0,5'], ['1/4', '25/100'], ['3/4', '0,75'], ['1/10', '0,1'], ['2/4', '1/2'], ['5/10', '1/2'], ['3/10', '0,3'], ['1/100', '0,01'], ['2/8', '1/4'], ['10/10', '1'], ['7/10', '0,7'], ['4/8', '0,5']],
        romanos: [['IV', '4'], ['IX', '9'], ['XIV', '14'], ['XIX', '19'], ['XL', '40'], ['LX', '60'], ['XC', '90'], ['CD', '400'], ['MD', '1500'], ['XXV', '25'], ['LV', '55'], ['CC', '200']],
      };
      if (BANCO[api.v]) { const vistos = new Set(); U.misturar(Math.random, BANCO[api.v]).forEach(p => { if (pares.length < 6 && !vistos.has(p[1])) { vistos.add(p[1]); pares.push(p); } }); }
      while (pares.length < 6) { const a = ri(2, 10), b = ri(2, 10), t = api.v === 'tabuadas' ? '×' : pickR(['×', '+', '−']); const v = t === '×' ? a * b : t === '+' ? a * 10 + b : a * 10 - b; if (usados.has(v)) continue; usados.add(v); pares.push([t === '×' ? `${a} × ${b}` : t === '+' ? `${a * 10} + ${b}` : `${a * 10} − ${b}`, String(v)]); }
      const cartas = U.misturar(Math.random, pares.flatMap(([c, v], k) => [{ t: c, k }, { t: v, k }]));
      let abertas = [], jog = 0, feitos = 0, bloq = false;
      const g = h('div', { class: 'rv-memoria' }); api.area.append(g);
      cartas.forEach(c => { const b = h('button', { type: 'button', class: 'rv-mem', 'aria-label': 'Carta virada' }, '?'); c.b = b; b.onclick = () => virar(c); g.append(b); });
      function virar(c) {
        if (bloq || c.feita || abertas.includes(c)) return;
        c.b.textContent = c.t; c.b.classList.add('aberta'); abertas.push(c); som('clique');
        if (abertas.length < 2) return;
        jog++; api.conta(`${jog} jogadas`);
        const [x, y] = abertas;
        if (x.k === y.k) { x.feita = y.feita = true; x.b.classList.add('ok'); y.b.classList.add('ok'); abertas = []; feitos++; som('apanhar'); if (feitos === 6) api.rel.depois(() => api.fim(Math.max(0, 20 - jog), 6, `Fizeste-o em ${jog} jogadas (pontos = 20 − jogadas).`), 600); }
        else { bloq = true; api.rel.depois(() => { [x, y].forEach(z => { z.b.textContent = '?'; z.b.classList.remove('aberta'); }); abertas = []; bloq = false; }, 1100); }
      }
      api.conta('0 jogadas');
    } };

  // 10. A banca da feira: pagar a quantia certa com moedas e notas
  const DIN = [[2000, '20 €', 'nota'], [1000, '10 €', 'nota'], [500, '5 €', 'nota'], [200, '2 €', 'moeda'], [100, '1 €', 'moeda'], [50, '50 c', 'moeda'], [20, '20 c', 'moeda'], [10, '10 c', 'moeda'], [5, '5 c', 'moeda']];
  JOGOS.feira = { nome: 'A banca da feira', emoji: '🪙', tema: 'Dinheiro', unidade: 'em 6', desc: 'Paga exatamente o preço com notas e moedas — sem dar a mais!',
    variantes: [['pagar', 'Pagar', 'dá a quantia certa'], ['troco', 'Dar o troco', 'és tu o vendedor: dá o troco certo'], ['euros', 'Só euros', 'preços sem cêntimos, para aquecer']],
    intro: 'Clica nas notas e moedas para pagar o preço certinho. Se te enganares, clica no que puseste para o tirar.', pistas: ['Começa pela nota ou moeda maior que cabe no preço.', 'Vê quanto falta e continua.', 'Os cêntimos pagam-se com as moedas pequenas.'],
    iniciar(api) {
      const PROD = ['um frasco de mel', 'um queijo', 'um pão alentejano', 'um saco de laranjas', 'azeitonas', 'um bolo'];
      let ronda = 0, pontos = 0, preco, pago = [];
      const enun = h('p', { class: 'rv-enun' }), mesa = h('div', { class: 'rv-mesa' }), caixa = h('div', { class: 'rv-carteira' }), tot = h('p', { class: 'rv-soma' }), ok = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, 'Pagar'), fb = h('p', { class: 'rv-fb' });
      api.area.append(enun, h('p', { class: 'rv-mini' }, 'Na mesa (clica para tirar):'), mesa, tot, h('p', { class: 'rv-mini' }, 'A tua carteira:'), caixa, ok, fb);
      DIN.forEach(([v, t, tipo]) => caixa.append(h('button', { type: 'button', class: 'rv-din ' + tipo, onclick: () => { pago.push(v); desenhar(); som('clique'); } }, t)));
      const eur = c => U.euros(c / 100);
      function desenhar() { mesa.innerHTML = ''; pago.forEach((v, i) => { const d = DIN.find(x => x[0] === v); mesa.append(h('button', { type: 'button', class: 'rv-din ' + d[2], onclick: () => { pago.splice(i, 1); desenhar(); } }, d[1])); }); tot.textContent = 'Na mesa: ' + eur(pago.reduce((a, b) => a + b, 0)); }
      function nova() {
        ronda++; pago = []; enun.innerHTML = ''; fb.textContent = ''; ok.disabled = false;
        if (api.v === 'troco') { const c = ri(1, 18) * 50 + ri(0, 9) * 5, nota = c < 500 ? 500 : c < 1000 ? 1000 : 2000; preco = nota - c; enun.append(`Ronda ${ronda} de 6 — ${pickR(PROD)} custa ${eur(c)}; o cliente pagou com ${eur(nota)}. Dá o troco: `, h('b', null, '?')); ok.textContent = 'Dar o troco'; }
        else { preco = api.v === 'euros' ? ri(2, 38) * 100 : ri(1, 40) * 5 + ri(0, 1) * ri(1, 18) * 100; enun.append(`Ronda ${ronda} de 6 — ${pickR(PROD)} custa `, h('b', null, eur(preco))); }
        desenhar();
      }
      ok.onclick = () => {
        const s = pago.reduce((a, b) => a + b, 0); if (!s) return; ok.disabled = true;
        if (s === preco) { pontos++; fb.textContent = '✓ Conta certa! Obrigado!'; fb.className = 'rv-fb ok'; som('sucesso'); }
        else { fb.textContent = (s > preco ? `✗ Deste ${eur(s - preco)} a mais.` : `✗ Faltam ${eur(preco - s)}.`) + (api.v === 'troco' ? ` O troco era ${eur(preco)}.` : ''); fb.className = 'rv-fb mal'; }
        api.conta(`${pontos} certas`); api.rel.depois(() => ronda < 6 ? nova() : api.fim(pontos, 5), s === preco ? 1100 : 2400);
      };
      api.conta('0 certas'); nova();
    } };

  // 11. Acerta o relógio
  JOGOS.relogio = { nome: 'Acerta o relógio', emoji: '🕰️', tema: 'Medidas de tempo', unidade: 'em 6', desc: 'Põe os ponteiros na hora certa.',
    variantes: [['acertar', 'Acertar o relógio', 'mexe nos ponteiros'], ['ler', 'Ler as horas', 'vês o relógio e escreves a hora'], ['quartos', 'Horas, quartos e meias', 'só 00, 15, 30 e 45 minutos']],
    intro: 'Usa os botões para mexer nas horas e nos minutos até o relógio marcar a hora pedida.', pistas: ['O ponteiro grande (azul) marca os minutos; o pequeno marca as horas.', 'Cada número do relógio são 5 minutos para o ponteiro grande.', '«e um quarto» = 15 minutos; «e meia» = 30.'],
    iniciar(api) {
      let ronda = 0, pontos = 0, alvo, hh, mm;
      const enun = h('p', { class: 'rv-enun' }), fig = h('div'), bt = h('div', { class: 'rv-rel-bt' }), ok = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, 'Verificar'), fb = h('p', { class: 'rv-fb' });
      api.area.append(enun, fig, bt, ok, fb);
      const mexer = (dh, dm) => { mm += dm; if (mm >= 60) { mm -= 60; hh++; } if (mm < 0) { mm += 60; hh--; } hh = ((hh - 1 + dh + 12) % 12) + 1; desenhar(); som('clique'); };
      bt.append(h('span', null, 'Horas'), h('button', { type: 'button', class: 'btn btn-texto', onclick: () => mexer(-1, 0) }, '−'), h('button', { type: 'button', class: 'btn btn-texto', onclick: () => mexer(1, 0) }, '+'),
        h('span', null, 'Minutos'), h('button', { type: 'button', class: 'btn btn-texto', onclick: () => mexer(0, -5) }, '− 5'), h('button', { type: 'button', class: 'btn btn-texto', onclick: () => mexer(0, 5) }, '+ 5'));
      function desenhar() { fig.innerHTML = ''; fig.append(F.PC.itens.figura({ tipo: 'relogio', h: hh, m: mm })); }
      const dizerHora = (h1, m1) => m1 === 0 ? (h1 === 1 ? '1 hora' : `${h1} horas`) : m1 === 15 ? `${h1} e um quarto` : m1 === 30 ? `${h1} e meia` : m1 === 45 ? `um quarto para as ${h1 % 12 + 1}` : `${h1}h${String(m1).padStart(2, '0')}`;
      const inpR = entrada('140px', () => ok.click()); inpR.hidden = api.v !== 'ler'; inpR.setAttribute('inputmode', 'text'); inpR.placeholder = '3h45'; api.area.insertBefore(inpR, ok);
      if (api.v === 'ler') bt.hidden = true;
      function nova() { ronda++; alvo = [ri(1, 12), pickR(api.v === 'quartos' ? [0, 15, 30, 45] : [0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55])]; hh = ri(1, 12); mm = 5 * ri(0, 11); if (hh === alvo[0] && mm === alvo[1]) hh = hh % 12 + 1; enun.innerHTML = ''; enun.append(`Ronda ${ronda} de 6 — põe o relógio nas `, h('b', null, dizerHora(...alvo))); fb.textContent = ''; ok.disabled = false;
        if (api.v === 'ler') { hh = alvo[0]; mm = alvo[1]; enun.textContent = `Ronda ${ronda} de 6 — que horas marca o relógio? (escreve assim: 3h45)`; inpR.value = ''; setTimeout(() => inpR.focus(), 30); }
        desenhar(); }
      ok.onclick = () => {
        let c = hh === alvo[0] && mm === alvo[1];
        if (api.v === 'ler') { const m = String(inpR.value).trim().match(/^(\d{1,2})\s*[h:.]\s*(\d{0,2})/); if (!m) return; const H = Number(m[1]) % 12 || 12, M = Number(m[2] || 0); c = H === alvo[0] && M === alvo[1]; hh = c ? hh : H; mm = c ? mm : M; }
        ok.disabled = true;
        if (c) { pontos++; fb.textContent = '✓ Hora certa!'; fb.className = 'rv-fb ok'; som('sucesso'); } else { fb.textContent = `✗ Marcaste ${hh}h${String(mm).padStart(2, '0')}; era ${alvo[0]}h${String(alvo[1]).padStart(2, '0')}.`; fb.className = 'rv-fb mal'; }
        api.conta(`${pontos} certas`); api.rel.depois(() => ronda < 6 ? nova() : api.fim(pontos, 5), c ? 1000 : 2400);
      };
      api.conta('0 certas'); nova();
    } };

  // 12. Pinta a fração
  JOGOS.fracoes = { nome: 'Pinta a fração', emoji: '🍕', tema: 'Frações', unidade: 'em 6', desc: 'Pinta as partes certas da figura para mostrar a fração pedida.',
    variantes: [['piza', 'Piza', 'círculos divididos em partes iguais'], ['barra', 'Tablete', 'retângulos divididos em partes iguais'], ['equivalentes', 'Frações equivalentes', 'pinta 1/2 numa figura com 8 partes…']],
    intro: 'Clica nas partes para as pintar. O denominador diz em quantas partes está dividida; o numerador, quantas pintas.', pistas: ['Em baixo (denominador): o total de partes.', 'Em cima (numerador): quantas pintas.', 'Clica outra vez numa parte para a despintar.'],
    iniciar(api) {
      let ronda = 0, pontos = 0, n, d, pint;
      const enun = h('p', { class: 'rv-enun' }), fig = h('div', { class: 'rv-frac' }), ok = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, 'Verificar'), fb = h('p', { class: 'rv-fb' });
      api.area.append(enun, fig, ok, fb);
      let pede = null;
      function desenhar() {
        if (api.v === 'barra') {
          let g = ''; const w = 400 / d; for (let i = 0; i < d; i++) g += `<rect data-i="${i}" x="${10 + i * w}" y="10" width="${w}" height="110" fill="${pint.has(i) ? '#8a5a2b' : '#fff'}" stroke="#222" stroke-width="3" style="cursor:pointer"/>`;
          fig.innerHTML = `<svg viewBox="0 0 420 130" width="420">${g}</svg>`;
          fig.querySelectorAll('rect').forEach(p => p.addEventListener('click', () => { const i = +p.dataset.i; pint.has(i) ? pint.delete(i) : pint.add(i); desenhar(); som('clique'); }));
          return;
        }
        const c = 110, R = 100; let g = '';
        for (let i = 0; i < d; i++) { const a0 = (i / d) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;
          g += `<path data-i="${i}" d="M${c},${c} L${(c + R * Math.cos(a0)).toFixed(1)},${(c + R * Math.sin(a0)).toFixed(1)} A${R},${R} 0 0 1 ${(c + R * Math.cos(a1)).toFixed(1)},${(c + R * Math.sin(a1)).toFixed(1)} Z" fill="${pint.has(i) ? '#f29d32' : '#fff'}" stroke="#222" stroke-width="3" style="cursor:pointer"/>`; }
        fig.innerHTML = `<svg viewBox="0 0 220 220" width="260">${g}</svg>`;
        fig.querySelectorAll('path').forEach(p => p.addEventListener('click', () => { const i = +p.dataset.i; pint.has(i) ? pint.delete(i) : pint.add(i); desenhar(); som('clique'); }));
      }
      function nova() {
        ronda++; d = pickR([3, 4, 5, 6, 8, 10]); n = ri(1, d - 1); pint = new Set(); pede = `${n}/${d}`; fb.textContent = ''; ok.disabled = false; enun.innerHTML = '';
        if (api.v === 'equivalentes') { const [a, b] = pickR([[1, 2], [1, 4], [3, 4], [1, 3], [2, 3], [1, 5], [2, 5]]), k = pickR([2, 3]).valueOf(); d = b * (b * k > 12 ? 2 : k); n = a * d / b; pede = `${a}/${b}`; enun.append(`Ronda ${ronda} de 6 — a figura tem ${d} partes. Pinta `, h('b', null, pede), ' dela'); }
        else enun.append(`Ronda ${ronda} de 6 — pinta `, h('b', null, pede), api.v === 'barra' ? ' da tablete' : ' da piza');
        desenhar();
      }
      ok.onclick = () => {
        ok.disabled = true; const c = pint.size === n;
        if (c) { pontos++; fb.textContent = `✓ ${n}/${d}${pede !== n + '/' + d ? ' = ' + pede : ''}!`; fb.className = 'rv-fb ok'; som('sucesso'); } else { fb.textContent = `✗ Pintaste ${pint.size}/${d}; ${pede} são ${n}/${d}.`; fb.className = 'rv-fb mal'; }
        api.conta(`${pontos} certas`); api.rel.depois(() => ronda < 6 ? nova() : api.fim(pontos, 5), c ? 1000 : 2200);
      };
      api.conta('0 certas'); nova();
    } };

  // 13. Corrida das sequências (60 s)
  JOGOS.sequencias = { nome: 'Corrida das sequências', emoji: '🔁', tema: 'Sequências', unidade: 'certas', desc: '60 segundos: descobre o número seguinte de cada sequência.',
    variantes: [['mistura', 'Mistura', 'a subir, a descer e dobros'], ['faceis', 'Saltos pequenos', 'de 2 em 2 até de 10 em 10'], ['grandes', 'Números grandes', 'de 1000 em 1000, de 10 000 em 10 000…']],
    intro: 'Descobre a regra e escreve o número seguinte. Tens 60 segundos! Objetivo: 8 certas.',
    iniciar(api) {
      let certas = 0, v; const fim = Date.now() + 60000;
      const barra = h('div', { class: 'rv-barra' }, h('b')), q = h('div', { class: 'rv-seq-q' }), inp = entrada('180px', ver), fb = h('p', { class: 'rv-fb' });
      api.area.append(barra, q, inp, fb);
      function nova() {
        let t; const V = api.v;
        if (V === 'grandes') { const k = pickR([1000, 5000, 10000, 25000, 100000, -1000, -10000]), s = ri(2, 6) * 100000 + ri(0, 9) * 1000; t = [0, 1, 2, 3, 4].map(i => s + i * k); }
        else if (V === 'faceis') { const k = pickR([2, 3, 4, 5, 10, -2, -5]), s = ri(20, 80); t = [0, 1, 2, 3, 4].map(i => s + i * k); }
        else { const s = ri(1, 60), k = pickR([2, 3, 4, 5, 10, 25, 50, 100, -2, -5, -10]), m = Math.random() < 0.15; t = [0, 1, 2, 3, 4].map(i => m ? s * Math.pow(2, i) : s * 10 + i * k + 100); }
        v = t[4]; q.textContent = t.slice(0, 4).map(U.fmt).join(' · ') + ' · ?'; inp.value = ''; inp.focus();
      }
      function ver() { const n = num(inp.value); if (isNaN(n)) return; if (n === v) { certas++; fb.textContent = '✓'; fb.className = 'rv-fb ok'; som('apanhar'); } else { fb.textContent = `✗ era ${v}`; fb.className = 'rv-fb mal'; } api.conta(`${certas} certas`); nova(); }
      api.rel.cada(() => { const r = Math.max(0, fim - Date.now()); barra.firstChild.style.width = (r / 600) + '%'; if (r <= 0) { api.rel.limpar(); inp.disabled = true; api.fim(certas, 8); } }, 100);
      api.conta('0 certas'); nova();
    } };

  // 14. Ordena depressa
  JOGOS.ordena = { nome: 'Ordena depressa', emoji: '📶', tema: 'Números até 999 999', unidade: 'segundos', desc: 'Clica nos números do menor para o maior, o mais depressa que conseguires.',
    variantes: [['crescente', 'Do menor para o maior', 'números até 999 999'], ['decrescente', 'Do maior para o menor', 'ao contrário!'], ['fracoes', 'Frações', 'com o mesmo denominador e frações unitárias'], ['decimais', 'Decimais e dinheiro', '3,45 € , 3,5 € , 0,9 € …']],
    intro: 'Clica nos 6 números do MENOR para o MAIOR. São 5 rondas. Se te enganares, levas mais 3 segundos.', pistas: ['Compara primeiro quantos algarismos tem cada número.', 'Com o mesmo número de algarismos, compara da esquerda para a direita.', 'Procura sempre o mais pequeno que sobra.'],
    iniciar(api) {
      let ronda = 0, castigo = 0; const t0 = Date.now();
      const enun = h('p', { class: 'rv-enun' }), g = h('div', { class: 'rv-ordena' }), fb = h('p', { class: 'rv-fb' }); api.area.append(enun, g, fb);
      function nova() {
        ronda++; g.innerHTML = ''; fb.textContent = '';
        const V = api.v, ns = new Map();
        if (V === 'fracoes') { if (Math.random() < 0.5) { const d = ri(7, 12); while (ns.size < 6) { const n = ri(1, d - 1); ns.set(n / d, `${n}/${d}`); } } else while (ns.size < 6) { const d = ri(2, 12); ns.set(1 / d, `1/${d}`); } }
        else if (V === 'decimais') while (ns.size < 6) { const c = ri(5, 999); ns.set(c / 100, U.euros(c / 100)); }
        else { const base = pickR([1000, 10000, 100000]); while (ns.size < 6) { const n = ri(base / 10 * 9, base * 9); ns.set(n, U.fmt(n)); } }
        const ord = [...ns.keys()].sort((a, b) => V === 'decrescente' ? b - a : a - b); let prox = 0;
        enun.textContent = `Ronda ${ronda} de 5 — ${V === 'decrescente' ? 'do maior para o menor' : 'do menor para o maior'}`;
        U.misturar(Math.random, ord).forEach(n => { const b = h('button', { type: 'button', class: 'rv-num' }, ns.get(n)); b.onclick = () => {
          if (b.disabled) return;
          if (n === ord[prox]) { b.disabled = true; b.classList.add('ok'); b.textContent = (prox + 1) + '.º ' + ns.get(n); prox++; som('clique'); if (prox === 6) { som('apanhar'); api.rel.depois(() => ronda < 5 ? nova() : acabar(), 500); } }
          else { castigo += 3; b.classList.add('mal'); setTimeout(() => b.classList.remove('mal'), 400); fb.textContent = V === 'decrescente' ? '+3 s: esse não é o maior que sobra.' : '+3 s: esse não é o mais pequeno que sobra.'; fb.className = 'rv-fb mal'; }
        }; g.append(b); });
      }
      function acabar() { const s = Math.round((Date.now() - t0) / 1000) + castigo, K = 'ordena:' + api.v; P.jogos[K] = P.jogos[K] || { melhor: 999, vezes: 0 }; if (P.jogos[K].melhor === 0) P.jogos[K].melhor = 999;
        const rec = P.jogos[K]; rec.vezes++; const novo = s < rec.melhor; if (novo) rec.melhor = s; gravar();
        const ganhas = moedas(s <= 60 ? 3 : 0);
        janela(s <= 60 ? 'celebrar' : 'incentivar', `${s} segundos` + (novo ? ' · novo recorde!' : ''), (s <= 60 ? 'Rapidíssimo!' : 'Para ganhar moedas tens de fazer em 60 segundos ou menos.') + txtMoedas(ganhas),
          [['Voltar ao ginásio', 'btn-texto', menu], ['Outro modo', 'btn-texto', () => jogar('ordena')], ['Jogar outra vez', 'btn-azul', () => jogar('ordena', api.v)]]); }
      api.rel.cada(() => api.conta(`${Math.round((Date.now() - t0) / 1000) + castigo} s`), 500);
      nova();
    } };

  // 15. Pares que fazem 100 (ou 1000)
  JOGOS.pares = { nome: 'Amigos do 100', emoji: '🤝', tema: 'Cálculo mental', unidade: 'pares', desc: 'Encontra os pares de números que somados dão 100 (e depois 1000).',
    variantes: [['100', 'Amigos do 100 e do 1000', '37 + 63, 250 + 750…'], ['1000', 'Só amigos do 1000', '2 rondas com milhares'], ['um', 'Amigos do 1 (decimais)', '0,25 + 0,75, 0,4 + 0,6…'], ['euro', 'Amigos dos 10 €', '3,50 € + 6,50 €…']],
    intro: 'Clica em dois números que juntos façam o número pedido. 6 pares em cada ronda!', pistas: ['Olha primeiro para as unidades: têm de somar 10 (ou 0).', 'Depois vê as dezenas.', 'Por exemplo, 37 + 63 = 100.'],
    iniciar(api) {
      let ronda = 0, pares = 0, erros = 0;
      const enun = h('p', { class: 'rv-enun' }), g = h('div', { class: 'rv-ordena' }), fb = h('p', { class: 'rv-fb' }); api.area.append(enun, g, fb);
      function nova() {
        ronda++; g.innerHTML = ''; const V = api.v;
        const alvo = V === 'um' ? 100 : V === 'euro' ? 1000 : V === '1000' || ronda === 2 ? 1000 : 100, passo = V === 'um' ? 1 : V === 'euro' ? 10 : alvo === 100 ? 1 : 10;
        const mostra = x => V === 'um' ? (x / 100).toFixed(2).replace('.', ',').replace(/0$/, '') : V === 'euro' ? U.euros(x / 100) : U.fmt(x), mostraAlvo = V === 'um' ? '1' : V === 'euro' ? '10 €' : U.fmt(alvo);
        const ns = []; const usados = new Set(); while (ns.length < 12) { const a = ri(1, alvo / passo - 1) * passo; if (usados.has(a) || usados.has(alvo - a) || a * 2 === alvo) continue; usados.add(a); usados.add(alvo - a); ns.push(a, alvo - a); }
        enun.innerHTML = ''; enun.append(`Ronda ${ronda} de 2 — pares que somam `, h('b', null, mostraAlvo));
        let sel = null, feitos = 0;
        U.misturar(Math.random, ns).forEach(n => { const b = h('button', { type: 'button', class: 'rv-num' }, mostra(n)); b.onclick = () => {
          if (b.disabled) return;
          if (!sel) { sel = { n, b }; b.classList.add('sel'); return; }
          if (sel.b === b) { b.classList.remove('sel'); sel = null; return; }
          if (sel.n + n === alvo) { [sel.b, b].forEach(x => { x.disabled = true; x.classList.remove('sel'); x.classList.add('ok'); }); pares++; feitos++; som('apanhar'); fb.textContent = `✓ ${mostra(sel.n)} + ${mostra(n)} = ${mostraAlvo}`; fb.className = 'rv-fb ok';
            if (feitos === 6) api.rel.depois(() => ronda < 2 ? nova() : api.fim(Math.max(0, 12 - erros), 10, `12 pares com ${erros} ${erros === 1 ? 'erro' : 'erros'} (pontos = 12 − erros).`), 700); }
          else { erros++; fb.textContent = `✗ ${mostra(sel.n)} + ${mostra(n)} = ${mostra(sel.n + n)}`; fb.className = 'rv-fb mal'; sel.b.classList.remove('sel'); }
          api.conta(`${pares} pares`); sel = null;
        }; g.append(b); });
      }
      api.conta('0 pares'); nova();
    } };

  // 16. Programa o Nico (pensamento computacional)
  JOGOS.programa = { nome: 'Programa o Nico', emoji: '🐾', tema: 'Pensamento computacional', unidade: 'em 5', desc: 'Monta um programa com setas para levar o Nico até à moeda, sem bater nas pedras.',
    variantes: [['normal', 'Grelha 6 × 6', 'para começar'], ['grande', 'Grelha 8 × 8', 'mais pedras e caminhos mais longos'], ['curto', 'Programa mais curto', 'tens um número máximo de setas!']],
    intro: 'Junta setas ao programa e carrega em ▶ Correr. O Nico segue as setas pela ordem!', pistas: ['Conta quantas casas tem de andar em cada direção.', 'Contorna as pedras.', 'Usa «Apagar» para tirar a última seta.'],
    iniciar(api) {
      let ronda = 0, pontos = 0;
      const corpo = h('div'); api.area.append(corpo);
      function nova() {
        ronda++; corpo.innerHTML = '';
        const N = api.v === 'grande' ? 8 : 6; let ini, fimP, pedras;
        do { ini = [ri(0, N - 1), ri(0, N - 1)]; fimP = [ri(0, N - 1), ri(0, N - 1)]; pedras = new Set(); for (let k = 0; k < (N === 8 ? 9 : 4) + ronda; k++) pedras.add(ri(0, N - 1) + ',' + ri(0, N - 1)); pedras.delete(ini.join(',')); pedras.delete(fimP.join(',')); }
        while (Math.abs(ini[0] - fimP[0]) + Math.abs(ini[1] - fimP[1]) < 4 || !alcanca(ini, fimP, pedras, N));
        const prog = [], limite = api.v === 'curto' ? distancia(ini, fimP, pedras, N) : 16;
        const grade = h('div', { class: 'rv-prog-g', style: `grid-template-columns: repeat(${N}, 54px)` }), lista = h('div', { class: 'rv-prog-l', 'aria-live': 'polite' }), fb = h('p', { class: 'rv-fb' });
        const desenhar = (pos, rasto) => { grade.innerHTML = ''; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const k = r + ',' + c; grade.append(h('span', { class: 'rv-prog-c' + (rasto && rasto.has(k) ? ' rasto' : ''), html: pos[0] === r && pos[1] === c ? GRELHA.nico : fimP[0] === r && fimP[1] === c ? GRELHA.moeda : pedras.has(k) ? GRELHA.pedra : '' })); } };
        const pintarProg = () => { lista.textContent = (prog.length ? 'Programa: ' + prog.join(' ') : 'Programa: (vazio)') + (api.v === 'curto' ? `  ·  ${prog.length} de ${limite} setas` : ''); };
        const SET = { '↑': [-1, 0], '↓': [1, 0], '←': [0, -1], '→': [0, 1] };
        const bts = h('div', { class: 'rv-prog-bt' }, ...Object.keys(SET).map(s => h('button', { type: 'button', class: 'btn btn-texto', onclick: () => { if (prog.length < limite) { prog.push(s); pintarProg(); som('clique'); } } }, s)),
          h('button', { type: 'button', class: 'btn btn-texto', onclick: () => { prog.pop(); pintarProg(); } }, '⌫ Apagar'));
        const correr = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, '▶ Correr');
        corpo.append(h('p', { class: 'rv-enun' }, `Nível ${ronda} de 5 — leva o Nico até à moeda 🪙`), grade, lista, bts, correr, fb);
        desenhar(ini); pintarProg();
        correr.onclick = async () => {
          if (!prog.length) return; correr.disabled = true;
          let p = ini.slice(); const rasto = new Set([p.join(',')]); let bateu = false;
          for (const s of prog) { await api.rel.espera(350); const q = [p[0] + SET[s][0], p[1] + SET[s][1]]; if (q[0] < 0 || q[1] < 0 || q[0] >= N || q[1] >= N || pedras.has(q.join(','))) { bateu = true; break; } p = q; rasto.add(p.join(',')); desenhar(p, rasto); }
          const chegou = !bateu && p[0] === fimP[0] && p[1] === fimP[1];
          if (chegou) { pontos++; fb.textContent = '✓ Chegou à moeda!'; fb.className = 'rv-fb ok'; som('sucesso'); api.conta(`${pontos} níveis`); api.rel.depois(() => ronda < 5 ? nova() : api.fim(pontos, 4), 1000); }
          else { fb.textContent = bateu ? '✗ Bateu numa pedra ou na borda! Corrige o programa.' : '✗ Não chegou à moeda. Corrige o programa.'; fb.className = 'rv-fb mal'; correr.disabled = false; api.rel.depois(() => desenhar(ini), 900);
            if (!corpo.querySelector('.rv-desistir')) corpo.append(h('button', { type: 'button', class: 'btn btn-texto rv-desistir', onclick: () => ronda < 5 ? nova() : api.fim(pontos, 4) }, 'Passar este nível')); }
        };
      }
      api.conta('0 níveis'); nova();
    } };
  function distancia(a, b, pedras, N) {   // número mínimo de setas (caminho mais curto)
    const dist = new Map([[a.join(','), 0]]), fila = [a];
    while (fila.length) { const [r, c] = fila.shift(), d = dist.get(r + ',' + c); if (r === b[0] && c === b[1]) return d; for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = [r + dr, c + dc], k = q.join(','); if (q[0] >= 0 && q[1] >= 0 && q[0] < N && q[1] < N && !pedras.has(k) && !dist.has(k)) { dist.set(k, d + 1); fila.push(q); } } }
    return 16;
  }
  function alcanca(a, b, pedras, N) {
    const vis = new Set([a.join(',')]), fila = [a];
    while (fila.length) { const [r, c] = fila.shift(); if (r === b[0] && c === b[1]) return true; for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = [r + dr, c + dc], k = q.join(','); if (q[0] >= 0 && q[1] >= 0 && q[0] < N && q[1] < N && !pedras.has(k) && !vis.has(k)) { vis.add(k); fila.push(q); } } }
    return false;
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
    else if (q.get('percurso')) percurso();
    else if (q.get('treino') && (R.TEMAS[q.get('treino')] || NOME_TREINO[q.get('treino')])) treino(q.get('treino'));
    else if (q.get('jogo') && JOGOS[q.get('jogo')]) q.get('modo') === 'escolher' && JOGOS[q.get('jogo')].variantes ? escolherVariante(q.get('jogo')) : jogar(q.get('jogo'), q.get('modo') || undefined);
    else menu();
  });
  F.REV.ui = { menu, treino, correrTeste, jogar, percurso, JOGOS };
})();
