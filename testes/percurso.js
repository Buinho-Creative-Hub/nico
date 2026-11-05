/* Nico · Percurso 4.º ano — testes automáticos (Chromium sem janela).
 *
 *   node testes/percurso.js [pasta-para-capturas]
 *
 * 1. Conteúdo: cada caminho resolve-se com a solução (3 estrelas) e não com o programa inicial; cada item aceita a
 *    resposta certa e recusa uma errada; ids únicos; palavras/etiquetas existem.
 * 2. Ecrã: mapa, sessão 1 de ponta a ponta (bolotas, teclado, programar, perguntas com arrastar e ordenar),
 *    prova-ensaio (navegar, marcar, entregar), e o cartão no ecrã inicial do Nico.
 */
'use strict';
const path = require('path');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('playwright-core'); }
const RAIZ = path.resolve(__dirname, '..');
const url = (f, q = '') => 'file://' + path.join(RAIZ, f) + q;
const CAP = process.argv[2];
let falhas = 0;
const ok = (c, msg) => { if (c) console.log('  ✓ ' + msg); else { falhas++; console.log('  ✗ ' + msg); } };

(async () => {
  const br = await pw.chromium.launch();
  const pg = await br.newPage({ viewport: { width: 1366, height: 768 } });
  const erros = [];
  pg.on('pageerror', e => erros.push(e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_FILE|nico-api/.test(m.text())) erros.push(m.text()); });
  const foto = async nome => { if (CAP) await pg.screenshot({ path: path.join(CAP, nome + '.png') }); };

  // ------------------------------------------------------------ 1. conteúdo
  console.log('Conteúdo');
  await pg.goto(url('percurso.html'));
  await pg.waitForSelector('.pc-sessao');
  const r = await pg.evaluate(() => {
    const F = window.Faisca, X = F.MISSOES['percurso-4'], out = [];
    const ids = new Set(), dup = [];
    const todos = [...X.sessoes.flatMap(s => s.estacoes.flatMap(e => e.atividades.map(a => [a, e]))), ...X.prova.itens.map(a => [a, null])];
    const certo = it => ({
      escolha: () => it.certa, varias: () => it.certas, vf: () => it.afirmacoes.map(a => a[1]), ordenar: () => it.itens.map((_, i) => i),
      arrastar: () => it.linhas ? it.linhas.map(l => l[1]) : it.certas, curta: () => it.numero != null ? String(it.numero).replace('.', ',') : it.aceitar[0],
      palavras: () => it.certas, extensa: () => 'O Nico gosta muito de ler textos sobre o montado e sobre Lisboa no norte, a água, o sobreiro e a cortiça do Alentejo.',
    })[it.tipo]();
    const errado = it => ({
      escolha: () => (it.certa + 1) % it.opcoes.length, varias: () => [it.certas[0]], vf: () => it.afirmacoes.map(a => !a[1]),
      ordenar: () => it.itens.map((_, i) => i).reverse(), arrastar: () => (it.linhas ? it.linhas.map(l => l[1]) : it.certas).slice().reverse(),
      curta: () => '999999', palavras: () => [], extensa: () => 'curto',
    })[it.tipo]();
    for (const [a, e] of todos) {
      if (ids.has(a.id)) dup.push(a.id); ids.add(a.id);
      if (a.tipo === 'caminho') {
        const s = F.PC.caminho.correr(a, F.PC.caminho.xml(a.solucao));
        const i = F.PC.caminho.correr(a, F.PC.caminho.xml(a.inicial || []));
        out.push([a.id, s.ok && s.estrelas === 3 && !i.ok, `solução ${s.ok ? 'ok' : JSON.stringify(s.erro) + ' faltam ' + s.faltam + ' meta ' + s.naMeta} · ${s.blocos} blocos (máx ${a.maxBlocos}) · inicial falha: ${!i.ok}`]);
      } else if (F.PC.rt.tipos.includes(a.tipo)) {
        out.push([a.id, true, a.tipo]);
      } else if (F.PC.oficina.tipos.includes(a.tipo)) {
        const O = F.PC.oficina; let bom = true, m = a.tipo;
        if (a.tipo === 'ponte') {
          const p = a.pecas.map(O.fr), alvo = O.fr(a.alvo), n = p.length, sol = [];
          for (let k = 1; k < (1 << n); k++) { const e = p.filter((_, i) => k & (1 << i)); if (a.restricao && a.restricao.pecas && e.length !== a.restricao.pecas) continue; if (O.cmp(e.reduce(O.soma, [0, 1]), alvo) === 0) sol.push(a.pecas.filter((_, i) => k & (1 << i)).join('+')); }
          bom = sol.length > 0; m += ' soluções: ' + [...new Set(sol)].join(' | ');
        }
        if (a.tipo === 'detetive') { bom = a.pistas.every(id => { const [i, j] = id.split('.').map(Number); return a.manual.seccoes[i - 1] && a.manual.seccoes[i - 1].frases[j - 1]; }) && a.ajudas && a.ajudas.length === 3; m += ' pistas ok: ' + bom; }
        if (a.tipo === 'correio') bom = !a.rascunho || (a.certo && a.certo.length > 0 && !a.certo.includes(a.rascunho));
        if (a.tipo === 'horta') { const H = F.PC.horta, sol = H.avaliar(a, a.solucao), ini = a.inicial && a.inicial.length ? H.avaliar(a, a.inicial) : null; bom = sol.ok && (!ini || !ini.ok) && a.ajudas.length === 3; m += ` solução: ${sol.msg} · inicial: ${ini ? ini.tipo : '—'}`; }
        if (a.tipo === 'mosaico') {
          const G = F.PC.mosaico.geo, mapa = new Map([...(a.fixos || []), ...a.solucao].map(([r, c, x]) => [G.K(r, c), x])), cel = new Set(mapa.keys()), M = a.metas;
          bom = (M.area == null || G.area(cel) === M.area) && (M.perimetro == null || G.perimetro(cel) === M.perimetro) && (!M.continua || G.continua(cel)) && (!M.simetria || !G.semPar(mapa, M.simetria.padrao).length)
            && (!a.cobrir || a.cobrir.every(([r, c]) => cel.has(G.K(r, c)))) && (!a.inventario || Object.entries(a.inventario).every(([k, n]) => a.solucao.filter(x => x[2] === k).length === n));
          m += ` solução: área ${G.area(cel)}, perímetro ${G.perimetro(cel)}`;
        }
        out.push([a.id, bom, m]);
      } else if (F.PC.jogos.tipos.includes(a.tipo)) {
        const n = t => Number(String(t).replace(/[\s€]/g, '').replace(',', '.'));
        let bom = true, m = a.tipo;
        if (a.tipo === 'plataforma') { bom = a.fichas.some(f => f[1]) && a.fichas.some(f => !f[1]); m += ` ${a.fichas.filter(f => f[1]).length} certas / ${a.fichas.length}`; }
        if (a.tipo === 'ligar' && a.modo === 'sequencia') { const v = a.valores.map(n); bom = v.every((x, i) => !i || x > v[i - 1]); m += ' por ordem crescente: ' + bom; }
        if (a.tipo === 'ligar' && a.modo === 'pares') bom = new Set(a.pares.map(p => p[0])).size === a.pares.length;
        if (a.tipo === 'memoria') bom = new Set(a.pares.flat()).size === a.pares.length * 2;
        if (a.tipo === 'apanhar') bom = a.certos.length > 0 && a.errados.every(e => !a.certos.includes(e));
        if (a.tipo === 'rebentar') bom = new Set(a.palavras).size === a.palavras.length;
        out.push([a.id, bom, m]);
      } else {
        const c = F.PC.itens.corrigir(a, certo(a)), w = F.PC.itens.corrigir(a, errado(a));
        let extra = '';
        if (a.tipo === 'palavras') { const t = a.texto.match(/[\wÀ-ÿ'’-]+/g); extra = a.certas.every(x => t.includes(x)) ? '' : ' PALAVRA EM FALTA'; }
        if (a.tipo === 'arrastar') { const c2 = a.linhas ? a.linhas.map(l => l[1]) : a.certas; extra = new Set(c2).size === c2.length ? '' : ' ETIQUETAS REPETIDAS'; }
        if (a.tipo === 'escolha' && !(a.certa >= 0 && a.certa < a.opcoes.length)) extra = ' CERTA FORA';
        out.push([a.id, c && !w && !extra, `${a.tipo} certo:${c} errado-recusado:${!w}${extra}`]);
      }
    }
    return { out, dup, n: todos.length };
  });
  r.out.forEach(([id, b, m]) => ok(b, `${id} — ${m}`));
  ok(r.dup.length === 0, `ids únicos (${r.n} atividades)` + (r.dup.length ? ': ' + r.dup.join(',') : ''));

  // ------------------------------------------------------------ 1b. aceitação das fichas M4/M5 (funções puras)
  console.log('Aceitação M4 (Horta) e M5 (Mosaicos)');
  const ac = await pg.evaluate(() => {
    const H = window.Faisca.PC.horta, G = window.Faisca.PC.mosaico.geo, out = [];
    const P = (op, corpo, n) => Object.assign({ op }, corpo ? { corpo } : {}, n ? { n } : {});
    const base = { alvo: { min: 3, max: 4 } };
    const a2 = Object.assign({}, base, { canteiros: [2, 3, 2, 4], deposito: 2, maxDoses: 2 });
    const a3 = Object.assign({}, base, { canteiros: [1, 4, 2, 3], deposito: 3, maxDoses: 3 });
    const sol2 = [P('para_cada', [P('se_seco', [P('regar')])])];
    let r = H.avaliar(a2, sol2); out.push([r.ok && r.final.join() === '3,3,3,4' && r.usadas === 2, 'H4-02A: para cada { se seco { regar } } → [3,3,3,4] com 2 doses']);
    r = H.avaliar(a2, [P('para_cada', [P('regar')])]); out.push([!r.ok && r.tipo === 'deposito' && r.final.join() === '3,4,2,4', 'H4-02A: regar todos → falta água no 3.º canteiro e o 2.º recebeu a mais (' + r.final + ')']);
    r = H.avaliar(a3, sol2); out.push([!r.ok && r.tipo === 'seco' && r.final.join() === '2,4,3,3', 'H4-03B: programa inicial deixa [2,4,3,3] e não chega']);
    r = H.avaliar(a3, [P('para_cada', [P('repetir', [P('se_seco', [P('regar')])], 2)])]); out.push([r.ok && r.final.join() === '3,4,3,3' && r.usadas === 3, 'H4-03B: repetir 2 { se seco { regar } } reavalia o sensor → [3,4,3,3]']);
    r = H.avaliar(a3, [P('para_cada', [P('se_seco', [P('repetir', [P('regar')], 2)])])]); out.push([!r.ok && r.tipo === 'deposito', 'H4-03B: se seco { repetir 2 { regar } } gasta uma dose a mais (' + r.tipo + ')']);
    const ev = H.passos(a2, sol2), falso = ev.find(e => e.t === 'teste' && !e.v);
    out.push([falso && falso.usadas === ev[ev.indexOf(falso) - 1].usadas && falso.valor === 3, 'condição falsa não gasta água (3 < 3? não)']);
    const um = Object.assign({}, base, { canteiros: [2], deposito: 2, maxDoses: 2 });
    out.push([H.avaliar(um, [P('regar')]).ok && H.avaliar(um, [P('regar'), P('regar')]).ok && !H.avaliar(um, [P('regar'), P('regar'), P('regar')]).ok, 'limites 3 e 4 aceites; 5 é excesso (e o depósito 2 pára a 3.ª dose)']);
    const zero = Object.assign({}, base, { canteiros: [2], deposito: 0, maxDoses: 0 });
    out.push([H.avaliar(zero, [P('regar')]).tipo === 'deposito', 'depósito zero: a rega não acontece']);
    out.push([JSON.stringify(H.passos(a3, sol2)) === JSON.stringify(H.passos(a3, sol2)), 'recomeço idêntico: cada execução parte do mesmo estado']);
    out.push([H.avaliar(a2, [P('para_cada', [])]).tipo === 'vazio' && H.avaliar(a2, [P('repetir', [P('regar')], 9)]).tipo === 'vazio', 'integridade: bloco vazio e repetir fora de 1–8 são o primeiro problema']);
    out.push([H.avaliar(a2, [P('repetir', [P('repetir', [P('repetir', [P('repetir', [P('se_seco', [P('regar')])], 8)], 8)], 8)], 8)]).tipo === 'limite', 'limite de 100 operações']);
    const S = l => new Set(l.map(([r, c]) => G.K(r, c)));
    const t = (cel, a, p) => G.area(S(cel)) === a && G.perimetro(S(cel)) === p;
    out.push([t([[1, 1]], 1, 4), '1 célula: área 1, perímetro 4']);
    out.push([t([[1, 1], [1, 2]], 2, 6), 'duas adjacentes: 2/6']);
    out.push([t([[1, 1], [2, 2]], 2, 8) && !G.continua(S([[1, 1], [2, 2]])), 'duas na diagonal: 2/8 e desligadas']);
    out.push([t([[2, 2], [2, 3], [2, 4], [3, 2], [3, 3], [3, 4]], 6, 10), 'retângulo 2×3: 6/10']);
    out.push([t([[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6]], 6, 14), 'fila 1×6: 6/14']);
    out.push([t([[1, 1], [1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2], [3, 3]], 8, 16), 'anel 3×3 sem centro: 8/16 (conta o contorno de dentro)']);
    let inv = true; for (let r = 1; r <= 6; r++) for (let c = 1; c <= 6; c++) { const [a, b] = G.refletir(G.refletir([r, c])); if (a !== r || b !== c) inv = false; }
    out.push([inv, 'refletir duas vezes devolve a célula']);
    const m3 = new Map([['2,2', 'azul'], ['2,3', 'terracota'], ['3,2', 'verde'], ['4,3', 'azul'], ['2,5', 'azul'], ['2,4', 'terracota'], ['3,5', 'verde'], ['4,4', 'azul']]);
    out.push([!G.semPar(m3, true).length, 'M5-03B: solução de referência é simétrica (posição e padrão)']);
    m3.delete('4,4'); m3.set('4,5', 'azul');
    out.push([G.semPar(m3, true).map(x => x.join(',')).join(' ') === '4,3 4,5', 'M5-03B: azul em (4,5) deixa só (4,3) e (4,5) sem par']);
    m3.set('2,5', 'verde'); out.push([G.semPar(m3, true).some(x => x.join() === '2,5'), 'simetria de padrão: cor trocada não tem par']);
    return out;
  });
  ac.forEach(([b, m]) => ok(b, m));

  // ------------------------------------------------------------ 2. ecrã: mapa (1366×768)
  console.log('Mapa (1366×768)');
  const fecharJanela = async () => { if (await pg.locator('#janela:not([hidden])').count()) await pg.click('#janelaBotoes .btn:last-child'); };
  const seguinte = async () => { await pg.click('#btnSeguinte'); await pg.waitForTimeout(80); await fecharJanela(); };
  const P = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.Faisca.PC.app.progresso())));
  ok(await pg.locator('.pc-sessao').count() === 14 && await pg.locator('.pc-cap').count() === 4 && await pg.locator('.pc-mapa-arte .ma-no').count() === 12, '4 capítulos · 11 missões + 2 provas-ensaio + loja na lista; 12 destinos no mapa do concelho');
  const caixaMapa = await pg.locator('.pc-mapa-arte').boundingBox();
  const nos = await pg.$$eval('.pc-mapa-arte .ma-no', l => l.map(b => { const r = b.getBoundingClientRect(); return [b.getAttribute('aria-label'), r.left, r.right, r.top, r.bottom]; }));
  const cortados = nos.filter(([, l, r, t, b]) => l < caixaMapa.x || r > caixaMapa.x + caixaMapa.width || t < caixaMapa.y);
  ok(!cortados.length, 'nenhum botão do mapa sai da imagem' + (cortados.length ? ': ' + cortados.map(x => x[0]).join(', ') : ''));
  const agua = nos.find(n => /A água da horta/.test(n[0])), pat = nos.find(n => /O painel do castelo/.test(n[0]));
  ok(agua && Math.abs((agua[1] + 25 - caixaMapa.x) / caixaMapa.width - 1390 / 1536) < 0.02 && pat && Math.abs((pat[1] + 25 - caixaMapa.x) / caixaMapa.width - 905 / 1536) < 0.02,
    'Barragem do Roxo em x=1390 e castelo de Aljustrel em x=905 (pontos do manifesto do Ambrósio)');
  ok((await pg.getAttribute('.pc-mapa-arte > img.ma-fundo', 'src')).includes('mapa-concelho') && await pg.locator('.pc-mapa-arte .ma-nico[src*="bicicleta"]').count() === 1, 'fundo: mapa do concelho; o Nico de bicicleta-oficina no destino atual');
  await foto('01-mapa');

  // ------------------------------------------------------------ 3. Missão 2 (sessão 1) de ponta a ponta pela interface
  console.log('Missão 2 · As placas da Mostra (sessão 1)');
  await pg.locator('.pc-sessao').nth(0).click();
  await pg.waitForSelector('#janela:not([hidden])');
  ok((await pg.textContent('#janelaTitulo')).includes('Montes Velhos'), 'a primeira vez, o capítulo abre com a história: ' + (await pg.textContent('#janelaTitulo')));
  await pg.click('#janelaBotoes .btn');
  await pg.waitForSelector('#janela:not([hidden])');
  ok((await pg.textContent('#janelaTexto')).includes('perdem-se'), 'a missão abre com o problema: ' + (await pg.textContent('#janelaTitulo')));
  await pg.click('#janelaBotoes .btn');
  await pg.waitForSelector('.rt-alvo');
  for (let i = 0; i < 12; i++) await pg.locator('.rt-alvo').click();
  await pg.waitForSelector('#btnSeguinte:not([hidden])'); await seguinte();
  await pg.waitForSelector('.tc-entrada');
  const linhas = await pg.evaluate(() => window.Faisca.MISSOES['percurso-4'].sessoes[1].estacoes[0].atividades[1].linhas);
  await pg.click('.tc-entrada');
  for (const l of linhas) { await pg.keyboard.type(l, { delay: 5 }); await pg.waitForTimeout(30); }
  await pg.waitForSelector('#btnSeguinte:not([hidden])');
  ok(true, 'aquecer: bolotas com o rato e teclas de casa');
  await seguinte();
  // programar: o 1.º caminho montado com o rato — arrastar o bloco da paleta, mudar a direção e o número
  await pg.waitForSelector('.cm-grelha svg'); await pg.waitForTimeout(400);
  {
    const fly = pg.locator('.blocklyFlyout .blocklyDraggable').first(); const fb = await fly.boundingBox();
    const tb = await pg.evaluate(() => { const b = window.Faisca.PC.app.atual().ws.getTopBlocks()[0], r = b.getSvgRoot().getBoundingClientRect(); return { x: r.x, y: r.y, h: r.height }; });
    await pg.mouse.move(fb.x + 10, fb.y + 10); await pg.mouse.down();
    await pg.mouse.move(tb.x + 30, tb.y + 44, { steps: 14 }); await pg.mouse.up();
    await pg.waitForTimeout(250);
    const ligados = await pg.evaluate(() => window.Faisca.PC.app.atual().ws.getTopBlocks()[0].getDescendants().length);
    ok(ligados >= 2, 'caminho: bloco arrastado da paleta encaixa no «ao começar» (' + ligados + ' blocos ligados)');
    // mudar a direção (menu) e o número (campo) com cliques reais
    const caixaCampo = nome => pg.evaluate(n => { const a = window.Faisca.PC.app.atual(); const b = a.ws.getAllBlocks(false).find(x => x.getField(n)); const r = b.getField(n).getSvgRoot().getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, nome);
    let c = await caixaCampo('DIR'); await pg.mouse.click(c.x, c.y);
    await pg.waitForSelector('.blocklyDropDownDiv [role="option"], .blocklyDropDownDiv .blocklyMenuItem');
    await pg.locator('.blocklyDropDownDiv .blocklyMenuItem', { hasText: 'este' }).first().click();
    c = await caixaCampo('NUM'); await pg.mouse.click(c.x, c.y);
    await pg.waitForSelector('.blocklyHtmlInput');
    await pg.keyboard.press('Control+A'); await pg.keyboard.type('3'); await pg.keyboard.press('Enter');
    await pg.waitForTimeout(150);
    await pg.click('.cm-comandos .btn-azul');
    await pg.waitForSelector('#btnSeguinte:not([hidden])', { timeout: 15000 });
    ok(true, 'caminho 1: arrastar + escolher «este» + escrever 3 → o Nico chega à escola');
    await foto('04-caminho-arrastado');
    await seguinte();
  }
  for (let k = 1; k < 3; k++) {
    await pg.waitForSelector('.cm-grelha svg');
    await pg.evaluate(() => {
      const F = window.Faisca, a = F.PC.app.atual(), X = F.MISSOES['percurso-4'];
      const at = X.sessoes[1].estacoes[1].atividades.find(x => x.titulo === document.querySelector('#atTitulo').textContent);
      a.ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(F.PC.caminho.xml(at.solucao)), a.ws);
    });
    await pg.waitForTimeout(100); await pg.click('.cm-comandos .btn-azul');
    await pg.waitForSelector('#btnSeguinte:not([hidden])', { timeout: 15000 });
    ok(true, 'caminho ' + (k + 1) + ' (programa da solução carregado nos blocos) corre no ecrã');
    await seguinte();
  }
  // números grandes
  await pg.waitForSelector('.it-opcao');
  await pg.locator('.it-opcao').nth(1).click(); await pg.click('#btnVerificar');
  ok((await pg.textContent('#atMsg')).includes('mais uma tentativa'), 'escolha: 1.ª tentativa errada dá segunda oportunidade');
  await pg.locator('.it-opcao').nth(0).click(); await pg.click('#btnVerificar');
  await pg.waitForSelector('#btnSeguinte:not([hidden])'); await seguinte();
  await pg.fill('.it-curta input', '104 060'); await pg.click('#btnVerificar');
  ok((await pg.textContent('#atMsg')).includes('Certo'), 'curta: aceita «104 060»'); await seguinte();
  await pg.waitForSelector('.jg-ligar');
  const nPontos = await pg.locator('.jg-ponto').count();
  for (let k = 1; k < nPontos; k++) {
    const a = await pg.locator('.jg-ponto').nth(k - 1).locator('circle').boundingBox(), b = await pg.locator('.jg-ponto').nth(k).locator('circle').boundingBox();
    await pg.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await pg.mouse.down();
    await pg.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); await pg.mouse.up();
  }
  await pg.waitForSelector('#btnSeguinte:not([hidden])'); ok(true, 'ligar pontos com o rato'); await seguinte();
  await pg.locator('.it-opcao').nth(2).click(); await pg.click('#btnVerificar'); await seguinte();
  const certas = ['30 000', '8 000', '500'];
  for (let k = 0; k < 3; k++) {
    const e = pg.locator('.it-banco .it-etiq', { hasText: new RegExp('^' + certas[k] + '$') });
    const a = await e.boundingBox(), b = await pg.locator('.it-buraco').nth(k).boundingBox();
    await pg.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await pg.mouse.down();
    await pg.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 }); await pg.mouse.up();
  }
  await pg.click('#btnVerificar'); ok((await pg.textContent('#atMsg')).includes('Certo'), 'arrastar etiquetas'); await seguinte();
  await pg.fill('.it-curta input', '4700'); await pg.click('#btnVerificar');
  await pg.fill('.it-curta input', '5000'); await pg.click('#btnVerificar');
  ok(await pg.locator('.it-explica:not([hidden])').count() === 1, 'curta: à 2.ª errada mostra a resposta certa'); await seguinte();
  // ler, investigar e escrever
  await pg.waitForSelector('.pd-texto');
  await pg.locator('.it-opcao').nth(2).click(); await pg.click('#btnVerificar'); await seguinte();
  for (const [k, v] of [[0, 'V'], [1, 'F'], [2, 'V'], [3, 'F']]) await pg.locator('.it-vf tbody tr').nth(k).locator('button', { hasText: v }).click();
  await pg.click('#btnVerificar'); await seguinte();
  await pg.locator('.it-palavra', { hasText: /^Rui$/ }).click(); await pg.locator('.it-palavra', { hasText: /^Messejana$/ }).click();
  await pg.click('#btnVerificar'); await seguinte();
  for (const [k, t] of [[0, 'oeste'], [1, 'agulha'], [2, 'norte']]) { await pg.locator('.it-banco .it-etiq', { hasText: new RegExp('^' + t + '$') }).click(); await pg.locator('.it-buraco').nth(k).click(); }
  await pg.click('#btnVerificar'); ok((await pg.textContent('#atMsg')).includes('Certo'), 'arrastar com cliques'); await seguinte();
  await pg.fill('.it-extensa textarea', 'Aponta o braço direito para onde o Sol nasce. Assim ficas virado para norte e já sabes o caminho.');
  await pg.click('#btnVerificar'); ok((await pg.textContent('#atMsg')).includes('guardado'), 'texto escrito guardado'); await seguinte();
  // detetive da placa
  await pg.waitForSelector('.of-manual');
  await pg.locator('.of-frase[data-id="1.1"]').click();
  ok((await pg.textContent('#balao')).includes('ao contrário'), 'detetive: pista errada explica porquê');
  for (const id of ['1.2', '2.2', '3.2']) { await pg.locator(`.of-frase[data-id="${id}"]`).focus(); await pg.keyboard.press('Enter'); }
  await pg.keyboard.press('Enter');   // o botão «Já tenho as pistas» recebe o foco
  await pg.waitForSelector('.it-ordem');
  for (let volta = 0; volta < 20; volta++) {
    const ordem = await pg.$$eval('.it-ordem li', l => l.map(x => Number(x.dataset.i)));
    const e = ordem.findIndex((x, k) => x !== k); if (e < 0) break;
    await pg.locator(`.it-ordem li[data-i="${e}"]`).focus(); await pg.keyboard.press('ArrowUp');
  }
  await pg.click('text=Confirmar a ordem');
  await pg.waitForSelector('.of-reparacao.fase-1');
  ok(true, 'detetive: a reparação começa no estado avariado (fase 1)');
  await pg.waitForSelector('.of-reparacao.fase-3', { timeout: 4000 });
  ok(/aponta para norte/.test(await pg.textContent('.of-reparacao figcaption')), 'detetive: transformação visível avaria → reparado → a funcionar, com legenda');
  await foto('s1-detetive-reparado');
  await pg.fill('.of-explica', 'O N da placa estava virado para o Sol do meio-dia, que está a sul.');
  await pg.click('text=Entregar o relatório');
  await pg.waitForSelector('#btnSeguinte:not([hidden])'); await seguinte();
  // correio para a Junta
  await pg.waitForSelector('.of-carta-caixa');
  await pg.click('.tc-entrada'); await pg.keyboard.type('As placas da Mostra já apontam para norte.', { delay: 5 });
  await pg.waitForSelector('textarea.of-explica');
  await pg.fill('textarea.of-explica', 'A Mostra é em messejana, ao pé da escola.'); await pg.click('text=Verificar a correção');
  ok(/Ainda há 1 palavra/.test(await pg.textContent('.of-estado')), 'correio: diz quantas palavras faltam corrigir');
  await pg.fill('textarea.of-explica', 'A Mostra é em Messejana, ao pé da escola.'); await pg.click('text=Verificar a correção');
  await pg.waitForSelector('button:has-text("Enviar")');
  await pg.fill('textarea.of-explica', 'Ao meio-dia o Sol está a sul. Quem ficar de costas para o Sol olha para norte e encontra a escola.');
  await pg.click('button:has-text("Enviar")');
  await pg.waitForSelector('.of-resposta', { timeout: 5000 });
  // estação nova de Estudo do Meio (5 Nov): sombra ao meio-dia (escolha) e Portugal (verdadeiro/falso), pela interface
  await seguinte();
  await pg.waitForSelector('.it-opcao');
  await pg.locator('.it-opcao').nth(0).click(); await pg.click('#btnVerificar');
  await pg.waitForSelector('#btnSeguinte:not([hidden])'); await seguinte();
  await pg.waitForSelector('.it-vf');
  for (const [i, v] of [[0, 0], [1, 0], [2, 1]]) await pg.locator('.it-vf tbody tr').nth(i).locator('.vf-c button').nth(v).click();
  await pg.click('#btnVerificar');
  await pg.waitForSelector('#btnSeguinte:not([hidden])');
  ok(await pg.locator('.pr-msg.certo').count() === 1, 'Estudo do Meio na missão das placas: respondido pela interface');
  await pg.click('#btnSeguinte');
  await pg.waitForSelector('#janela:not([hidden])');
  const fim = await pg.textContent('#janelaTexto');
  ok((await pg.textContent('#janelaTitulo')).includes('Missão cumprida') && fim.includes('Placas da Mostra') && await pg.locator('#janelaBotoes button', { hasText: 'Treino extra' }).count() === 1,
    'missão 2 cumprida sem fazer o treino extra; o mundo muda: «Placas da Mostra ✓»');
  await foto('s1-fim');
  const p1 = await P();
  const s1 = await pg.evaluate(() => { const s = window.Faisca.MISSOES['percurso-4'].sessoes[1]; return s.estacoes.filter(e => !e.extra).flatMap(e => e.atividades).map(a => [a.id, a.tipo]); });
  const esperadas = s1.reduce((t, [, tp]) => t + (['caminho', 'ponte', 'detetive', 'correio', 'horta', 'mosaico', 'ditado', 'radio', 'feira', 'saco', 'inquerito', 'planificacao', 'tartaruga', 'triagem', 'circuito', 'arqueologia', 'jornal', 'sublinhar', 'frases'].includes(tp) ? 5 : 3), 0);
  ok(s1.every(([id]) => p1.at[id]) && p1.bolotas === esperadas && p1.mundo.placas, `progresso: ${s1.length} atividades, ${p1.bolotas} moedas (esperadas ${esperadas}), mundo.placas`);
  await pg.click('#janelaBotoes .btn');
  await pg.waitForSelector('.pc-mapa-arte .ma-marca');
  ok((await pg.textContent('.pc-mapa-arte')).includes('Placas da Mostra'), 'a marca «Placas da Mostra ✓» aparece no mapa');

  // ------------------------------------------------------------ 4. Missão 1: previsão só com teclado, ponte, detetive, correio
  console.log('Missão 1 · A ponte da ribeira');
  // a ponte está agora no capítulo de Ervidel: abre-se com o bilhete (e a história já vista)
  await pg.evaluate(() => { const P = window.Faisca.PC.app.progresso(); P.bilhetes = ['c2']; P.historias = ['c1', 'c2']; window.Faisca.PC.app.mapa(); });
  await pg.locator('.pc-sessao', { hasText: 'A ponte da ribeira' }).click(); await pg.waitForSelector('#janela:not([hidden])'); await pg.click('#janelaBotoes .btn');
  await pg.waitForSelector('.rt-alvo');
  for (let i = 0; i < 8; i++) await pg.locator('.rt-alvo').click();
  await pg.waitForSelector('#btnSeguinte:not([hidden])'); await seguinte();
  await pg.waitForSelector('.cm-grelha svg');
  await pg.locator('.cm-comandos .btn-azul').focus(); await pg.keyboard.press('Enter');
  ok((await pg.textContent('#balao')).includes('onde achas'), 'previsão: sem prever não corre');
  await pg.locator('.cm-grelha').focus();
  for (const k of ['ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowUp', 'ArrowUp']) await pg.keyboard.press(k);
  await pg.keyboard.press('Enter');
  ok((await pg.textContent('.cm-prev')).includes('coluna 4, linha 2'), 'previsão só com teclado: setas no mapa + Enter (' + await pg.textContent('.cm-prev') + ')');
  await pg.locator('.cm-comandos .btn-azul').focus(); await pg.keyboard.press('Enter');
  await pg.waitForFunction(() => /previste bem/i.test(document.querySelector('#balao').textContent), null, { timeout: 15000 });
  ok(true, 'a previsão feita com o teclado é comparada com o resultado');
  await foto('m1-prever-teclado');
  await pg.evaluate(() => { const F = window.Faisca, a = F.PC.app.atual(); a.ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(F.PC.caminho.xml([['N', 3], ['E', 5]])), a.ws); });
  await pg.waitForTimeout(100); await pg.click('.cm-comandos .btn-azul');
  await pg.waitForSelector('#btnSeguinte:not([hidden])', { timeout: 15000 }); await seguinte();
  await pg.waitForSelector('.cm-grelha svg');
  await pg.evaluate(() => { const F = window.Faisca, a = F.PC.app.atual(); a.ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(F.PC.caminho.xml([['rep', 6, [['E', 1], ['se', 'par', [['ap']]]]]])), a.ws); });
  await pg.waitForTimeout(150);
  let viuSe = false;
  for (let k = 0; k < 60 && !(await pg.locator('#btnSeguinte:not([hidden])').count()); k++) {
    await pg.click('button:has-text("Um passo")');
    if (/se o número aqui é/.test(await pg.textContent('.cm-estado'))) viuSe = true;
  }
  ok(viuSe, 'passo a passo mostra o «se» a decidir'); await seguinte();
  await pg.waitForSelector('.of-ponte');
  await pg.locator('.of-peca', { hasText: /^1\/2$/ }).click();
  await pg.click('text=O Nico experimenta a ponte');
  await pg.waitForFunction(() => /ainda falta/i.test(document.querySelector('#balao').textContent), null, { timeout: 8000 });
  ok(true, 'ponte: erro diz quanto falta');
  await pg.waitForFunction(() => !document.querySelector('.of .btn-grande').disabled, null, { timeout: 5000 });
  await pg.locator('.of-tabuleiro').focus();
  for (let k = 0; k < 6; k++) { const s = await pg.textContent('.of-peca.sel'); if (s === '1/4') break; await pg.keyboard.press('ArrowRight'); }
  await pg.keyboard.press('Enter');
  for (let k = 0; k < 6; k++) { const s = await pg.textContent('.of-peca.sel'); if (s === '1/4') break; await pg.keyboard.press('ArrowRight'); }
  await pg.keyboard.press('Enter');
  ok((await pg.textContent('.of-estado')).includes('tem a medida do vão'), 'ponte: peças escolhidas só com o teclado (setas + Enter)');
  await pg.locator('.of .btn-grande').focus(); await pg.keyboard.press('Enter');
  await pg.waitForSelector('#btnSeguinte:not([hidden])', { timeout: 10000 }); await seguinte();
  for (let k = 0; k < 2; k++) { await pg.waitForSelector('.of-ponte'); await pg.evaluate(() => window.Faisca.PC.app.atual().resolver()); await pg.waitForSelector('#btnSeguinte:not([hidden])', { timeout: 10000 }); await seguinte(); }
  await pg.locator('.it-opcao').nth(1).click(); await pg.click('#btnVerificar'); await seguinte();
  await pg.waitForSelector('.of-manual');
  for (const id of ['2.2', '3.2']) await pg.locator(`.of-frase[data-id="${id}"]`).click();
  await pg.click('text=Já tenho as pistas');
  await pg.waitForSelector('.it-ordem');
  for (let volta = 0; volta < 20; volta++) { const o = await pg.$$eval('.it-ordem li', l => l.map(x => Number(x.dataset.i))); const e = o.findIndex((x, k) => x !== k); if (e < 0) break; await pg.locator(`.it-ordem li[data-i="${e}"]`).focus(); await pg.keyboard.press('ArrowUp'); }
  await pg.click('text=Confirmar a ordem');
  await pg.waitForSelector('.of-reparacao.fase-3', { timeout: 4000 });
  ok(/chega ao canteiro 3/.test(await pg.textContent('.of-reparacao figcaption')), 'detetive da rega: tubo esmagado → reparado → a água chega ao canteiro 3');
  await foto('m1-detetive-reparado');
  await pg.fill('.of-explica', 'O trator esmagou o tubo do canteiro 3 e a água não passava.');
  await pg.click('text=Entregar o relatório'); await pg.waitForSelector('#btnSeguinte:not([hidden])'); await seguinte();
  await pg.waitForSelector('.of-carta-caixa');
  await pg.click('.tc-entrada'); await pg.keyboard.type('A rega do canteiro 3 já está reparada.', { delay: 5 });
  await pg.waitForSelector('textarea.of-explica');
  await pg.fill('textarea.of-explica', 'Amanhã vamos à horta ver as couves.'); await pg.click('text=Verificar a correção');
  await pg.waitForSelector('button:has-text("Enviar")');
  await pg.fill('textarea.of-explica', 'Olá, Dona Aurora! No dia 20 de maio há a Mostra de Invenções do Nico na escola, com pontes e robôs. Venha!');
  await pg.click('button:has-text("Enviar")'); await pg.waitForSelector('.of-resposta', { timeout: 5000 }); await pg.click('#btnSeguinte');
  await pg.fill('.it-curta input', 'passou'); await pg.click('#btnVerificar'); await seguinte();
  // Estudo do Meio (seres vivos da ribeira), pela interface
  await pg.waitForSelector('.it-vf');
  for (const [i, v] of [[0, 0], [1, 0], [2, 1]]) await pg.locator('.it-vf tbody tr').nth(i).locator('.vf-c button').nth(v).click();
  await pg.click('#btnVerificar'); await pg.waitForSelector('#btnSeguinte:not([hidden])'); await pg.click('#btnSeguinte');
  await pg.waitForSelector('#janela:not([hidden])');
  ok((await pg.textContent('#janelaTexto')).includes('Construtor de pontes'), 'missão 1 completa: insígnia');
  await pg.click('#janelaBotoes .btn');
  await pg.waitForSelector('.pc-mapa-arte');
  ok(await pg.locator('.pc-mapa-arte .ma-marca', { hasText: 'Ponte' }).count() === 1 && await pg.locator('.pc-mapa-arte .ma-ins').count() === 1,
    'mapa: a marca «Ponte ✓» e a insígnia aparecem na ribeira');
  await foto('m1-mapa-com-ponte');

  // ------------------------------------------------------------ 5. Horta programável (M4) só com teclado
  // abrir uma missão pelo índice (ordem antiga das missões); os capítulos ficam todos abertos e com a história já vista
  const abrirK = k => pg.evaluate(k => { const P = window.Faisca.PC.app.progresso(); P.bilhetes = ['c2', 'c3', 'c4']; P.historias = ['c1', 'c2', 'c3', 'c4']; window.Faisca.PC.app.entrar(k); }, k);
  console.log('Missão 4 · Horta programável (só teclado)');
  const tecla = async (sel, k = 'Enter') => { await pg.locator(sel).first().focus(); await pg.keyboard.press(k); };
  await abrirK(3); await pg.waitForSelector('#janela:not([hidden])'); await pg.click('#janelaBotoes .btn');
  await pg.locator('.pc-est', { hasText: 'Horta programável' }).click();
  await pg.waitForSelector('.hp-canteiro');
  // h1: uma dose de cada vez (prever 1 dose no canteiro 1)
  await tecla('.at-rodape .btn-azul');
  await pg.waitForSelector('.hp-prever:not([hidden])');
  await tecla('.hp-prever .hp-op >> text="1"'); await tecla('.hp-prever .hp-op >> text="Canteiro 1"', ' '); await tecla('.hp-prever .btn-azul');
  await tecla('.hp-pal >> text=regar');
  await tecla('.at-rodape .btn-azul');
  await pg.waitForSelector('.hp-resultado.certo', { timeout: 8000 });
  ok((await pg.textContent('.hp-resultado')).includes('Usaste 1 dose') && (await pg.textContent('.hp-resultado')).includes('✓ · canteiros regados ✓'), 'H1: previsão certa (1 dose, canteiro 1) e canteiro entre 3 e 4');
  await pg.keyboard.type('Uma dose chega porque de 2 gotas passa para 3.');
  await tecla('.at-explica .btn-azul');
  await pg.waitForSelector('#btnSeguinte:not([hidden])');
  ok((await pg.textContent('#atMsg')).includes('Texto guardado'), 'H1: explicação guardada para o professor');
  await seguinte();
  // h2: regar sem desperdiçar — o programa inicial falha (depósito), corrigir só com teclado
  await pg.waitForSelector('.hp-canteiro');
  await tecla('.hp-canteiro >> nth=0'); await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('Enter');
  ok((await pg.textContent('.at-vivo')).includes('Sensor do canteiro 2: 3 gotas — adequado'), 'ler o sensor com setas + Enter: ' + await pg.textContent('.at-vivo'));
  await tecla('.at-rodape .btn-azul');
  await tecla('.hp-prever .hp-op >> text="vai faltar água"'); await tecla('.hp-prever .btn-azul');
  await tecla('.at-rodape .btn-azul');
  await pg.waitForSelector('.hp-resultado.errado', { timeout: 10000 });
  const rErro = await pg.textContent('.hp-resultado');
  ok(rErro.includes('O depósito ficou vazio antes desta rega') && rErro.includes('faltar água ✓'), 'H2: «rega todos» → falta água; previsão «vai faltar água» certa');
  await foto('m4-erro-deposito');
  await tecla('button:has-text("Voltar à edição")');
  await tecla('.hp-bloco.op-regar .hp-mini[aria-label^="Tirar"]');
  await tecla('.hp-lista.dentro > .hp-ranhura');
  await tecla('.hp-pal.op-se_seco'); await tecla('.hp-pal.op-regar');
  const progH = await pg.evaluate(() => JSON.stringify(window.Faisca.PC.app.atual().estado().prog));
  ok(progH === JSON.stringify([{ op: 'para_cada', corpo: [{ op: 'se_seco', corpo: [{ op: 'regar' }] }] }]), 'programa editado só com teclado: para cada { se seco { regar } }');
  // um passo: a condição falsa tem passo próprio
  let viuFalso = false;
  await tecla('button:has-text("Um passo")');
  if (await pg.locator('.hp-prever:not([hidden])').count()) { await tecla('.hp-prever .hp-op >> text="2"'); await tecla('.hp-prever .btn-azul'); await tecla('button:has-text("Um passo")'); }
  for (let k = 0; k < 30 && !(await pg.locator('.hp-resultado.certo').count()); k++) {
    if (/3 é menor do que 3\? Não\. Este bloco de rega não vai correr/.test(await pg.textContent('.at-vivo'))) { viuFalso = true; await foto('m4-sensor-falso'); }
    await pg.keyboard.press('Enter');
  }
  ok(viuFalso, 'Um passo: «3 é menor do que 3? Não. Este bloco de rega não vai correr.»');
  ok((await pg.textContent('.hp-resultado')).includes('Todos os canteiros ficaram entre 3 e 4 gotas. Usaste 2 doses.'), 'H2 resolvida passo a passo: [3,3,3,4] com 2 doses');
  const b0 = (await P()).bolotas;
  await pg.keyboard.type('O sensor só deixa regar os canteiros com menos de 3 gotas.');
  await tecla('.at-explica .btn-azul'); await pg.waitForSelector('#btnSeguinte:not([hidden])');
  const ph = await P();
  ok(ph.bolotas === b0 + 5 && ph.at['s3-h2'].estado === 'autonomo' && ph.at['s3-h2'].v.includes('sensor') && ph.at['s3-h2'].previsoes >= 1, `H2: 5 bolotas, estado ${ph.at['s3-h2'].estado}, explicação e previsões registadas`);
  // recarregar e repetir: a recompensa não volta a ser paga
  await pg.reload(); await pg.waitForSelector('.pc-mapa-arte');
  await abrirK(3); await fecharJanela();
  await pg.locator('.pc-est', { hasText: 'Horta programável' }).click(); await pg.waitForSelector('.hp-canteiro');
  await pg.evaluate(() => window.Faisca.PC.app.seguinte());
  await pg.waitForSelector('.hp-canteiro');
  await pg.evaluate(() => window.Faisca.PC.app.atual().resolver());
  await pg.waitForSelector('.at-explica textarea'); await pg.fill('.at-explica textarea', 'Repeti a rega para treinar outra vez.'); await pg.click('.at-explica .btn-azul');
  await pg.waitForSelector('#btnSeguinte:not([hidden])');
  ok((await P()).bolotas === ph.bolotas, `depois de recarregar e repetir, as bolotas não aumentam (${ph.bolotas})`);

  // ------------------------------------------------------------ 6. Ateliê de mosaicos (M5) só com teclado
  console.log('Missão 6 · Ateliê de mosaicos (só teclado)');
  const cel = (r, c) => `.mo-celulas > button:nth-child(${(r - 1) * 6 + c})`;
  await pg.locator('#btnMissoes').click(); await pg.waitForSelector('.pc-mapa-arte');
  await abrirK(5); await fecharJanela();
  await pg.locator('.pc-est', { hasText: 'Ateliê de mosaicos' }).click();
  await pg.waitForSelector('.mo-celulas');
  ok(await pg.locator('.mo-cel.cobrir').count() === 6, 'A1: retângulo 2×3 marcado para cobrir');
  await pg.locator(cel(3, 2)).focus();
  for (const k of ['Enter', 'ArrowRight', 'Enter', 'ArrowRight', 'Enter', 'ArrowDown', 'Enter', 'ArrowLeft', 'Enter']) await pg.keyboard.press(k);
  await tecla('.at-rodape .btn-azul');
  ok((await pg.textContent('.hp-resultado')).includes('Ainda há 1 célula do retângulo por cobrir'), 'A1: verificar a meio diz o que falta');
  await pg.locator(cel(4, 2)).focus(); await pg.keyboard.press('Enter');
  await tecla('.at-rodape .btn-azul');
  await pg.waitForSelector('.hp-resultado.certo');
  await pg.keyboard.type('Contei os azulejos: 3 em cada fila, 2 filas, 6 quadrados.');
  await tecla('.at-explica .btn-azul'); await pg.waitForSelector('#btnSeguinte:not([hidden])'); await seguinte();
  // A2: seis azulejos, dez lados
  await pg.waitForSelector('.mo-celulas');
  await pg.locator(cel(2, 1)).focus();
  for (let k = 0; k < 6; k++) { await pg.keyboard.press('Enter'); await pg.keyboard.press('ArrowRight'); }
  await tecla('.at-rodape .btn-azul');
  await pg.waitForSelector('.hp-prever:not([hidden])');
  await pg.keyboard.type('6'); await pg.keyboard.press('Tab'); await pg.keyboard.type('14'); await pg.keyboard.press('Enter');
  await pg.waitForSelector('.hp-resultado.errado');
  const rf = await pg.textContent('.hp-resultado'), lis = await pg.$$eval('.mo-criterios li', l => l.map(x => x.className));
  ok(rf.includes('o contorno tem 14 lados') && rf.includes('área 6 ✓') && rf.includes('perímetro 14 ✓') && lis.join() === 'ok,ok,nao', 'A2: fila 1×6 → área ✓, contínua ✓, perímetro 14 ✗ (previsão 6/14 certa)');
  await tecla('button:has-text("Mostrar o contorno")');
  ok(await pg.locator('.mo-contorno line').count() === 14, 'mostrar o contorno: 14 lados desenhados');
  await foto('m5-fila-contorno');
  // desfazer repõe; Delete tira; Enter põe
  await pg.locator(cel(5, 5)).focus(); await pg.keyboard.press('Enter');
  ok(await pg.locator('.mo-cel.cheia').count() === 7, 'Enter põe um azulejo');
  await tecla('button:has-text("Desfazer")');
  ok(await pg.locator('.mo-cel.cheia').count() === 6, 'Desfazer repõe o estado anterior');
  await pg.locator(cel(2, 6)).focus();
  for (const k of ['Delete', 'ArrowLeft', 'Backspace', 'ArrowLeft', 'Delete']) await pg.keyboard.press(k);
  await pg.locator(cel(3, 1)).focus();
  for (const k of ['Enter', 'ArrowRight', 'Enter', 'ArrowRight', 'Enter']) await pg.keyboard.press(k);
  await tecla('.at-rodape .btn-azul');
  await pg.keyboard.type('6'); await pg.keyboard.press('Tab'); await pg.keyboard.type('10'); await pg.keyboard.press('Enter');
  await pg.waitForSelector('.hp-resultado.certo');
  ok((await pg.textContent('.hp-resultado')).includes('Perímetro 10 ✓'), 'A2: duas filas de três → área 6, perímetro 10, contínua');
  await foto('m5-certo');
  await pg.keyboard.type('Juntei os azulejos em duas filas e os lados de dentro deixaram de contar.');
  await tecla('.at-explica .btn-azul'); await pg.waitForSelector('#btnSeguinte:not([hidden])');
  ok((await P()).at['s5-a2'].perimetro === 10, 'A2 registada com área e perímetro');
  // rascunho: a Horta 3 (s5-h1) guarda o programa ao sair e ao recarregar
  await pg.locator('.pc-est', { hasText: 'Horta programável' }).click(); await pg.waitForSelector('.hp-canteiro');
  await tecla('.hp-lista.dentro .hp-lista.dentro > .hp-ranhura'); await tecla('.hp-pal.op-repetir');
  const antesR = await pg.evaluate(() => JSON.stringify(window.Faisca.PC.app.atual().estado().prog));
  await pg.reload(); await pg.waitForSelector('.pc-mapa-arte');
  await abrirK(5); await fecharJanela();
  await pg.locator('.pc-est', { hasText: 'Horta programável' }).click(); await pg.waitForSelector('.hp-canteiro');
  ok(await pg.evaluate(() => JSON.stringify(window.Faisca.PC.app.atual().estado().prog)) === antesR && (await pg.textContent('.at-vivo')).includes('Recuperei'), 'rascunho da Horta retomado depois de recarregar');

  // M5-03B: painel em espelho com erro deliberado
  console.log('Missão 7 · painel em espelho');
  await pg.locator('#btnMissoes').click(); await abrirK(6); await fecharJanela();
  await pg.locator('.pc-est', { hasText: 'Ateliê' }).click();
  await pg.waitForSelector('.mo-celulas');
  const n0 = await pg.locator('.mo-cel.cheia').count();
  await pg.locator(cel(2, 2)).focus(); await pg.keyboard.press('Delete');
  ok(await pg.locator('.mo-cel.cheia').count() === n0 && (await pg.textContent('.at-vivo')).includes('fixo'), 'azulejo fixo 🔒 não sai');
  const porCor = async (cor, r, c) => { await tecla(`.mo-cor:has-text("${cor}")`); await pg.locator(cel(r, c)).focus(); await pg.keyboard.press('Enter'); };
  await porCor('azul', 2, 5); await porCor('azul', 4, 5); await porCor('terracota', 2, 4); await porCor('verde', 3, 5);
  await porCor('verde', 5, 5);
  ok((await pg.textContent('.at-vivo')).includes('Já não tens azulejos verde'), 'inventário: só há as peças necessárias');
  await tecla('.at-rodape .btn-azul');
  await pg.waitForSelector('.hp-resultado.errado');
  ok((await pg.textContent('.hp-resultado')).includes('linha 4, coluna 3 está a uma casa do eixo') && await pg.locator('.mo-cel.sem-par').count() === 2, 'erro deliberado azul em (4,5): destaca só as células sem par e pede a distância ao eixo');
  await foto('m5-espelho-erro');
  await pg.locator(cel(4, 5)).focus(); await pg.keyboard.press('Delete');
  await porCor('azul', 4, 4);
  await tecla('.at-rodape .btn-azul');
  await pg.waitForSelector('.hp-resultado.certo');
  await pg.keyboard.type('Contei a distância de cada azulejo ao eixo e pus o par à mesma distância.');
  await tecla('.at-explica .btn-azul'); await pg.waitForSelector('#btnSeguinte:not([hidden])');
  ok(true, 'M5-03B resolvida só com teclado');

  // ------------------------------------------------------------ 7. sair a meio cancela os temporizadores
  console.log('Sair a meio (temporizadores)');
  {
    const ctx2 = await br.newContext({ viewport: { width: 1366, height: 768 } }), p2 = await ctx2.newPage();
    const e2 = []; p2.on('pageerror', e => e2.push(e.message));
    await p2.goto(url('percurso.html', '?s=1')); await p2.waitForSelector('.pc-est');
    const sair = async (onde) => {
      const ant = await p2.evaluate(() => { window.__r = window.Faisca.PC.relogioAtual(); return window.__r.pendentes(); });
      await p2.locator('.pc-est', { hasText: onde }).click();
      await p2.waitForTimeout(2500);
      return [ant, await p2.evaluate(() => [window.__r.morto, window.__r.pendentes()])];
    };
    await p2.locator('.pc-est', { hasText: 'Construir a ponte' }).click(); await p2.waitForSelector('.of-ponte');
    for (const t of ['1/2', '1/4', '1/4']) await p2.locator('.of-peca', { hasText: new RegExp('^' + t.replace('/', '\\/') + '$') }).first().click();
    await p2.click('text=O Nico experimenta a ponte'); await p2.waitForTimeout(200);
    let [ant, [morto, pend]] = await sair('Programar');
    let pp = await p2.evaluate(() => window.Faisca.PC.app.progresso());
    ok(ant > 0 && morto && pend === 0 && !pp.at['m1-pt1'] && !(pp.bolotas > 0), `ponte: ${ant} temporizadores ativos ao sair → 0; sem conclusão nem bolotas`);
    // correio: enviar e sair antes da resposta
    await p2.locator('.pc-est', { hasText: 'Investigar' }).click(); await p2.waitForSelector('.of-manual');
    await p2.evaluate(() => window.Faisca.PC.app.seguinte()); await p2.waitForSelector('.of-carta-caixa');
    await p2.click('.tc-entrada'); await p2.keyboard.type('A rega do canteiro 3 já está reparada.', { delay: 2 });
    await p2.waitForSelector('textarea.of-explica'); await p2.fill('textarea.of-explica', 'Amanhã vamos à horta ver as couves.'); await p2.click('text=Verificar a correção');
    await p2.waitForSelector('button:has-text("Enviar")'); await p2.fill('textarea.of-explica', 'Dona Aurora, venha à Mostra de Invenções no dia 20 de maio, às dez horas, na escola!');
    await p2.click('button:has-text("Enviar")');
    [ant, [morto, pend]] = await sair('Aquecer');
    pp = await p2.evaluate(() => window.Faisca.PC.app.progresso());
    ok(ant > 0 && morto && pend === 0 && !pp.at['m1-c1'], `correio: a espera de 900 ms é cancelada ao sair (${ant} → 0) e não conclui`);
    // horta a correr
    await p2.goto(url('percurso.html', '?s=4')); await p2.waitForSelector('.pc-est');
    await p2.locator('.pc-est', { hasText: 'Horta programável' }).click(); await p2.waitForSelector('.hp-canteiro');
    await p2.evaluate(() => window.Faisca.PC.app.seguinte()); await p2.waitForSelector('.hp-canteiro');
    await p2.click('.at-rodape .btn-azul'); await p2.click('.hp-prever .hp-op >> text="1"'); await p2.click('.hp-prever .btn-azul');
    await p2.click('.at-rodape .btn-azul'); await p2.waitForTimeout(150);
    [ant, [morto, pend]] = await sair('Aquecer');
    ok(ant > 0 && morto && pend === 0, `horta: a animação pára ao sair (${ant} → 0)`);
    ok(e2.length === 0, 'sem erros ao sair a meio' + (e2.length ? ': ' + e2.join(' | ') : ''));
    await ctx2.close();
  }

  // ------------------------------------------------------------ 8. alunos diferentes no mesmo computador
  console.log('Alunos diferentes');
  {
    const ctx3 = await br.newContext({ viewport: { width: 1366, height: 768 } }), p3 = await ctx3.newPage();
    const entrar = id => p3.evaluate(i => localStorage.setItem('nico.turma.sessao', JSON.stringify({ token: 't', desde: Date.now(), turma: { codigo: 'TESTE' }, aluno: { id: i, nome: i } })), id);
    await p3.goto(url('percurso.html')); await entrar('ana'); await p3.goto(url('percurso.html', '?s=2'));
    await p3.waitForSelector('.rt-alvo'); for (let i = 0; i < 12; i++) await p3.locator('.rt-alvo').click();
    await p3.waitForSelector('#btnSeguinte:not([hidden])');
    await entrar('rui'); await p3.goto(url('percurso.html'));
    const rui = await p3.evaluate(() => window.Faisca.PC.app.progresso());
    await entrar('ana'); await p3.goto(url('percurso.html'));
    const ana = await p3.evaluate(() => window.Faisca.PC.app.progresso());
    ok(!rui.at['s1-r1'] && !rui.bolotas && ana.at['s1-r1'] && ana.bolotas === 3, `progresso por aluno: Ana tem s1-r1 (${ana.bolotas} bolotas), Rui começa do zero`);
    await ctx3.close();
  }

  // ------------------------------------------------------------ 9. todas as atividades de todas as missões abrem (inclui o treino extra)
  console.log('Todas as atividades abrem e concluem');
  const nMissoes = await pg.evaluate(() => window.Faisca.MISSOES['percurso-4'].sessoes.length);
  for (let s = 2; s <= nMissoes; s++) {
    await pg.goto(url('percurso.html', '?s=' + s));
    await pg.waitForSelector('#vSessao:not([hidden])');
    const ests = await pg.evaluate(k => window.Faisca.MISSOES['percurso-4'].sessoes[k].estacoes.map(e => e.atividades.length), s - 1);
    let n = 0;
    for (let e = 0; e < ests.length; e++) {
      await pg.locator('.pc-est').nth(e).click();
      for (let k = 0; k < ests[e]; k++) {
        n++;
        const jogo = await pg.evaluate(() => { const a = window.Faisca.PC.app.atual(); return !!(a && a.resolver); });
        if (jogo) {
          await pg.waitForTimeout(500);
          if (k === 0) await foto(`s${s}-e${e}`);
          await pg.evaluate(() => window.Faisca.PC.app.atual().resolver());
          await pg.waitForSelector('.at-explica textarea, #btnSeguinte:not([hidden])', { timeout: 15000 }).catch(() => {});
          if (await pg.locator('.at-explica textarea').count()) { await pg.fill('.at-explica textarea', 'Explicação de teste com algumas palavras.'); await pg.click('.at-explica .btn-azul'); }
          await pg.waitForSelector('#btnSeguinte:not([hidden])', { timeout: 10000 }).catch(() => {});
          ok(await pg.locator('#btnSeguinte:not([hidden])').count() === 1, `missão ${s}: «${await pg.textContent('#atTitulo')}» conclui`);
        }
        if (k + 1 < ests[e]) { await pg.evaluate(() => window.Faisca.PC.app.seguinte()); await fecharJanela(); }
      }
    }
    ok(true, `missão ${s}: ${n} atividades abertas`);
  }

  // ------------------------------------------------------------ 10. «O Nico e o Mapa de Cobre»: capítulos, moedas e jogos novos (5 Nov 2026)
  console.log('Capítulos do concelho, moedas e jogos novos');
  await pg.goto(url('percurso.html'));
  await pg.waitForSelector('.pc-cap');
  const pur = await pg.evaluate(() => {
    const F = window.Faisca, T = F.PC.terr, L = F.PC.lingua, X = F.MISSOES['percurso-4'], out = [];
    const todas = X.sessoes.flatMap(s => s.estacoes.flatMap(e => e.atividades));
    out.push(['cruz é planificação do cubo', T.redeCubo([[1, 1], [0, 2], [1, 2], [2, 2], [3, 2], [1, 3]])]);
    out.push(['6 em fila não é planificação', !T.redeCubo([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]])]);
    out.push(['quadrado 2×3 não é planificação', !T.redeCubo([[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]])]);
    todas.filter(a => a.tipo === 'tartaruga').forEach(a => {
      out.push([`${a.id}: a solução cumpre (${T.contarBlocos(a.solucao)} blocos)`, T.verificarTartaruga(a, a.solucao).ok]);
      out.push([`${a.id}: o programa vazio não cumpre`, !T.verificarTartaruga(a, a.inicial || []).ok]);
    });
    todas.filter(a => a.tipo === 'triagem').forEach(a => {
      const ds = T.correrTriagem(a.solucao, a.itens), di = T.correrTriagem(a.inicial, a.itens);
      out.push([`${a.id}: a solução põe tudo no sítio`, a.itens.every(([t], i) => ds[i] === a.certo[t]) && a.solucao.regras.length <= a.maxRegras]);
      out.push([`${a.id}: o programa inicial falha`, a.itens.some(([t], i) => di[i] !== a.certo[t])]);
    });
    todas.filter(a => a.tipo === 'feira').forEach(a => a.rondas.filter(r => r.tipo === 'orcamento').forEach(r => {
      const tot = r.solucao.reduce((t, i) => t + T.cent(r.produtos[i][1]), 0);
      out.push([`${a.id}: o orçamento tem solução (${T.euros(tot)} ≤ ${T.euros(T.cent(r.tem))})`, r.solucao.length === r.n && tot <= T.cent(r.tem)]);
    }));
    todas.filter(a => a.tipo === 'inquerito').forEach(a => out.push([`${a.id}: uma só moda (${T.moda(a.respostas)})`, T.moda(a.respostas).length === 1 && a.ditos.length === a.respostas.length]));
    todas.filter(a => a.tipo === 'sublinhar').forEach(a => out.push([`${a.id}: as frases certas existem no texto`, a.perguntas.every(q => { const [p, f] = q.certa.split('.').map(Number); return L.frasesDe(a.texto.paragrafos[p - 1])[f - 1]; })]));
    todas.filter(a => a.tipo === 'frases' && a.modo === 'sujeito').forEach(a => out.push([`${a.id}: cortes dentro das frases`, a.frases.every(([f, c]) => c > 0 && c < f.split(' ').length)]));
    todas.filter(a => a.tipo === 'frases' && a.modo === 'construir').forEach(a => out.push([`${a.id}: há peças para cada encaixe`, a.molde.every(c => a.pecas.filter(p => p[1] === c).length >= a.molde.filter(x => x === c).length)]));
    const c = (a, b) => L.comparar(a, b).palavras.filter(p => p.tipo !== 'ok').map(p => p.tipo).join();
    out.push(['ditado: acento', c('O Nico está aqui.', 'O Nico esta aqui.') === 'acento']);
    out.push(['ditado: maiúscula', c('Vive em Messejana.', 'Vive em messejana.') === 'maiuscula']);
    out.push(['ditado: pontuação', c('Vive em Messejana.', 'Vive em Messejana') === 'pontuacao']);
    out.push(['ditado: palavra em falta', c('O Nico foi à praça.', 'O Nico à praça.') === 'falta']);
    out.push(['ditado: palavra mal escrita', c('O Nico foi à praça.', 'O Nico fói à prasa.') === 'acento,letra']);
    out.push(['ditado: sem erros', c('Quem ganhou?', 'Quem ganhou?') === '']);
    out.push(['4 capítulos pela ordem da história', X.capitulos.map(k => k.nome).join() === 'Montes Velhos,Ervidel,Aljustrel,Messejana']);
    out.push(['cada missão está num capítulo', X.sessoes.every(s => X.capitulos.some(k => k.sessoes.includes(s.id)))]);
    out.push(['todas as missões antigas têm Estudo do Meio', X.sessoes.every(s => s.estacoes.some(e => e.area === 'meio'))]);
    out.push(['2 provas-ensaio (fevereiro e Desafios do Castelo)', X.provas.length === 2 && X.provas[1] === X.prova]);
    // cada bilhete custa menos do que as moedas do capítulo anterior
    const moedas = k => k.sessoes.reduce((t, id) => t + X.sessoes.find(s => s.id === id).estacoes.filter(e => !e.extra).flatMap(e => e.atividades).length * 3, 0);
    X.capitulos.slice(1).forEach((k, i) => out.push([`bilhete de ${k.nome} (${k.bilhete}) < moedas mínimas de ${X.capitulos[i].nome} (${moedas(X.capitulos[i])})`, k.bilhete < moedas(X.capitulos[i])]));
    const ids = X.sessoes.flatMap(s => s.estacoes.flatMap(e => e.atividades.map(a => a.id))).concat(X.provas.flatMap(p => p.itens.map(i => i.id)));
    out.push(['ids únicos (com as missões novas e a prova de fevereiro)', new Set(ids).size === ids.length]);
    return out;
  });
  pur.forEach(([m, c]) => ok(c, m));
  // arte do pacote «Mapa de Cobre» (PR #79): todas as imagens referidas existem e carregam
  const arte = await pg.evaluate(async () => {
    const F = window.Faisca, X = F.MISSOES['percurso-4'], nomes = new Set(['moeda-cobre', 'estacao-meio', 'bilhete', 'mapa-concelho', 'nico-bicicleta-oficina', 'mapa-cobre-completo', 'estacao-arcada']);
    X.capitulos.forEach(c => nomes.add('cenario-' + c.cenario));
    X.sessoes.forEach(s => s.estacoes.forEach(e => e.atividades.forEach(a => {
      if (a.personagem) nomes.add(a.personagem);
      if (a.tipo === 'triagem') a.itens.forEach(i => i[2] && nomes.add(i[2]));
      (a.materiais || []).forEach(m => m[2] && nomes.add(m[2]));
      (a.camadas || []).forEach(c => c.img && nomes.add(c.img));
      Object.values(a.destinosImg || {}).forEach(n => nomes.add(n));
      if (a.tipo === 'feira') a.rondas.forEach(r => r.img && nomes.add(r.img));
    })));
    ['n', 'e', 's', 'o'].forEach(d => nomes.add('nico-tartaruga-' + d));
    for (let i = 1; i <= 8; i++) nomes.add('entrevistado-0' + i);
    const falham = [];
    await Promise.all([...nomes].map(n => new Promise(r => { const i = new Image(); i.onload = () => r(); i.onerror = () => { falham.push(n); r(); }; i.src = `img/percurso/${n}.webp`; })));
    return { n: nomes.size, falham };
  });
  ok(!arte.falham.length, `arte do Ambrósio: ${arte.n} imagens referidas carregam` + (arte.falham.length ? ' — faltam: ' + arte.falham.join(', ') : ''));

  // capítulos fechados e bilhetes (progresso novo)
  const ctx4 = await br.newContext({ viewport: { width: 1366, height: 768 } }); const p4 = await ctx4.newPage();
  p4.on('pageerror', e => erros.push(e.message));
  await p4.goto(url('percurso.html')); await p4.waitForSelector('.pc-cap');
  ok(await p4.locator('#cap-c2.fechado').count() === 1 && await p4.locator('#cap-c1.fechado').count() === 0, 'progresso novo: Montes Velhos aberto, Ervidel fechado');
  await p4.locator('#cap-c2 ~ .pc-sessao').first().click();
  await p4.waitForSelector('#janela:not([hidden])');
  ok((await p4.textContent('#janelaTitulo')).includes('fechado'), 'missão de um capítulo fechado mostra o aviso: ' + await p4.textContent('#janelaTitulo'));
  await p4.click('#janelaBotoes .btn-texto');
  await p4.evaluate(() => { const P = window.Faisca.PC.app.progresso(); P.bolotas = 31; window.Faisca.PC.app.mapa(); });
  await p4.click('#cap-c2 .pcap-bilhete .btn-azul');
  await p4.waitForSelector('#janela:not([hidden])');
  await p4.click('#janelaBotoes .btn-azul');
  const pb = await p4.evaluate(() => { const P = window.Faisca.PC.app.progresso(); return { m: P.bolotas, b: P.bilhetes }; });
  ok(pb.m === 1 && pb.b.includes('c2') && await p4.locator('#cap-c2.fechado').count() === 0, `bilhete comprado: Ervidel aberto, sobra ${pb.m} moeda`);
  // cumprir as missões de um capítulo abre o seguinte de graça
  await p4.evaluate(() => { const F = window.Faisca, X = F.MISSOES['percurso-4'], P = F.PC.app.progresso();
    X.capitulos[1].sessoes.forEach(id => X.sessoes.find(s => s.id === id).estacoes.filter(e => !e.extra).forEach(e => e.atividades.forEach(a => { P.at[a.id] = { ok: true }; })));
    F.PC.app.mapa(); });
  ok(await p4.locator('#cap-c3.fechado').count() === 0 && await p4.locator('#cap-c4.fechado').count() === 1, 'Ervidel cumprido: Aljustrel abre de graça, Messejana continua fechado');
  // a história do capítulo aparece ao entrar a primeira vez
  await p4.locator('#cap-c3 ~ .pc-sessao').first().click();
  await p4.waitForSelector('#janela:not([hidden])');
  ok((await p4.textContent('#janelaTitulo')).includes('Aljustrel'), 'ao entrar em Aljustrel aparece a história do capítulo: ' + await p4.textContent('#janelaTitulo'));
  if (CAP) await p4.screenshot({ path: path.join(CAP, '15-capitulo.png') });
  await p4.click('#janelaBotoes .btn-azul');
  await p4.waitForSelector('#vSessao:not([hidden])');
  await p4.waitForSelector('#janela:not([hidden])');
  ok((await p4.textContent('#janelaTitulo')).includes('painel do castelo'), 'e depois abre a missão com o problema');
  await p4.click('#janelaBotoes .btn');

  // ditado jogado pelo teclado, com um erro e a correção
  const kv1 = await p4.evaluate(() => window.Faisca.MISSOES['percurso-4'].sessoes.findIndex(s => s.id === 'v1'));
  await p4.evaluate(k => window.Faisca.PC.app.abrirSessao(k, 0, 0), kv1);
  await p4.waitForSelector('.li-entrada');
  const frs = await p4.evaluate(() => window.Faisca.MISSOES['percurso-4'].sessoes.find(s => s.id === 'v1').estacoes[0].atividades[0].frases);
  for (let i = 0; i < frs.length; i++) {
    await p4.waitForSelector('.li-entrada:not([disabled])');
    await p4.locator('.li-entrada').click();
    await p4.keyboard.type(i === 1 ? frs[i].replace('à', 'a') : frs[i]);
    await p4.keyboard.press('Enter');
  }
  await p4.waitForSelector('.li-dif .mal.acento');
  ok(await p4.locator('.li-dif .mal').count() === 1, 'ditado: o erro de acento fica assinalado (1 erro)');
  if (CAP) await p4.screenshot({ path: path.join(CAP, '16-ditado.png') });
  await p4.locator('input.li-entrada').first().fill(frs[1]);
  await p4.click('.li-ditado .btn-azul');
  await p4.waitForSelector('#btnSeguinte:not([hidden])');
  const rd = await p4.evaluate(() => window.Faisca.PC.app.progresso().at['v1-dit']);
  ok(rd && rd.falhas === 1 && rd.estado === 'apoio', `ditado guardado: ${rd && rd.falhas} erro na 1.ª escrita, estado ${rd && rd.estado}`);

  // feira: pagar com as moedas (rato)
  const kv2 = await p4.evaluate(() => window.Faisca.MISSOES['percurso-4'].sessoes.findIndex(s => s.id === 'v2'));
  await p4.evaluate(k => window.Faisca.PC.app.abrirSessao(k, 1, 0), kv2);
  await p4.waitForSelector('.te-bolsa');
  for (const m of ['2 €', '20 c', '10 c', '5 c']) await p4.locator('.te-bolsa .te-moeda', { hasText: new RegExp('^' + m + '$') }).click();
  await p4.click('.te-feira ~ .li-botoes .btn-azul');
  await p4.waitForFunction(() => /Cliente 2/.test(document.querySelector('.li-frase-num').textContent), null, { timeout: 5000 }).catch(() => {});
  ok(/Cliente 2/.test(await p4.textContent('.li-frase-num')), 'feira: 2,35 € pagos com 2 € + 20 c + 10 c + 5 c → cliente seguinte');
  if (CAP) await p4.screenshot({ path: path.join(CAP, '17-feira.png') });

  // tartaruga: montar o quadrado com os botões (sem arrastar)
  const kv3 = await p4.evaluate(() => window.Faisca.MISSOES['percurso-4'].sessoes.findIndex(s => s.id === 'v3'));
  await p4.evaluate(k => window.Faisca.PC.app.abrirSessao(k, 1, 0), kv3);
  await p4.waitForSelector('.te-paleta');
  await p4.click('.te-paleta .te-op-repete');
  await p4.click('.te-ranhura >> nth=0');
  await p4.click('.te-paleta .te-op-avanca');
  await p4.click('.te-paleta .te-op-dir');
  await p4.locator('.te-prog .te-op-avanca select').selectOption('3');
  await p4.click('text=▶ Experimentar');
  await p4.waitForSelector('#btnSeguinte:not([hidden])', { timeout: 15000 });
  ok(true, 'tartaruga: repete 4 [avança 3, roda à direita] desenha o quadrado e conclui');
  if (CAP) await p4.screenshot({ path: path.join(CAP, '18-tartaruga.png') });

  // loja: comprar e jogar um jogo extra
  await p4.evaluate(() => { window.Faisca.PC.app.progresso().bolotas = 20; window.Faisca.PC.app.oficina(); });
  await p4.locator('.pc-arcada button', { hasText: 'Corrida nas ruas de Messejana' }).click();
  await p4.waitForSelector('.pc-arcada-palco canvas, .pc-arcada-palco .jg-plataforma, .pc-arcada-palco *', { timeout: 5000 });
  const arc = await p4.evaluate(() => { const P = window.Faisca.PC.app.progresso(); return { m: P.bolotas, a: P.arcada }; });
  ok(arc.m === 5 && arc.a.includes('arc-messejana'), `jogo extra comprado (sobram ${arc.m} moedas) e a jogar`);
  if (CAP) await p4.screenshot({ path: path.join(CAP, '19-arcada.png') });
  await p4.click('text=← Voltar à loja');
  await p4.locator('.pc-arcada button', { hasText: 'Corrida nas ruas de Messejana' }).click();
  const arc2 = await p4.evaluate(() => window.Faisca.PC.app.progresso().bolotas);
  ok(arc2 === 5, 'jogar outra vez não volta a cobrar');
  await ctx4.close();

  // prova-ensaio de fevereiro
  await pg.goto(url('percurso.html', '?prova=fev'));
  await pg.waitForSelector('.pv-nav button');
  ok(await pg.locator('.pv-nav button').count() === 12, 'prova de fevereiro: 12 questões');
  await pg.click('text=Entregar a prova'); await pg.waitForSelector('#janela:not([hidden])'); await pg.click('#janelaBotoes .btn-azul'); await pg.waitForSelector('.pv-res');
  const pf = await pg.evaluate(() => window.Faisca.PC.app.progresso().provas.slice(-1)[0]);
  ok(pf.id === 'fev', 'o resultado fica guardado com o id da prova (fev)');

  // ------------------------------------------------------------ prova-ensaio
  console.log('Prova-ensaio');
  await pg.goto(url('percurso.html', '?prova=1'));
  await pg.waitForSelector('.pv-nav button');
  ok(await pg.locator('.pv-nav button').count() === 16, '16 questões na navegação');
  await pg.locator('.it-opcao').nth(1).click();
  await foto('11-prova');
  await pg.click('.pv-marcar');
  await pg.locator('.pv-nav button').nth(7).click();
  await pg.fill('.it-curta input', '1623');
  await pg.locator('.pv-nav button').nth(0).click();
  ok(await pg.locator('.it-opcao[aria-checked="true"]').count() === 1, 'a resposta fica guardada ao navegar');
  ok(await pg.locator('.pv-nav button.marcada').count() === 1 && await pg.locator('.pv-nav button.resp').count() === 2, 'marcada para rever + respondidas na navegação');
  await pg.click('text=Entregar a prova');
  await pg.waitForSelector('#janela:not([hidden])');
  ok((await pg.textContent('#janelaTexto')).includes('14 questões'), 'aviso de questões por responder');
  await pg.click('#janelaBotoes .btn-azul');
  await pg.waitForSelector('.pv-res');
  ok((await pg.textContent('.pv-res h1')).startsWith('2 de 15'), 'resultado: ' + await pg.textContent('.pv-res h1'));
  await foto('12-prova-resultado');

  // ------------------------------------------------------------ ecrã inicial do Nico
  console.log('Ecrã inicial');
  await pg.goto(url('index.html'));
  await pg.waitForSelector('.cartao-missao');
  const card = pg.locator('.cartao-missao', { hasText: 'Percurso 4.º ano' });
  ok(await card.count() === 1, 'cartão «Percurso 4.º ano» no ecrã inicial: ' + (await card.textContent()).replace(/\s+/g, ' ').slice(0, 120));
  await foto('13-inicio');
  await card.click();
  await pg.waitForURL(/percurso\.html/);
  ok(true, 'o cartão abre percurso.html');
  await pg.goto(url('index.html', '?m=percurso-4'));
  await pg.waitForURL(/percurso\.html/);
  ok(true, 'index.html?m=percurso-4 reencaminha');

  // ecrã estreito (tablet)
  await pg.setViewportSize({ width: 820, height: 1100 });
  await pg.goto(url('percurso.html', '?s=2'));
  await pg.waitForSelector('#vSessao:not([hidden])');
  await foto('14-tablet');

  ok(erros.length === 0, 'sem erros na consola' + (erros.length ? ': ' + [...new Set(erros)].slice(0, 5).join(' | ') : ''));
  await br.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTudo certo.');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
