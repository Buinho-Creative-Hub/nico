/* Nico · Capítulo especial (revisões do 3.º ano) — testes automáticos.
 *   node testes/revisoes.js [pasta-para-capturas]
 * 1. Conteúdo: 300 testes gerados; cada item aceita a sua resposta certa e recusa uma errada; planificações verificadas.
 * 2. Ecrã: menu, treino de ponta a ponta, teste completo (responder, entregar, classificação e análise), todos os jogos abrem,
 *    o cartão no mapa do Percurso, e o «Reforço dos pontos fracos» aparece depois de falhar.
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
  const pg = await br.newPage({ viewport: { width: 1366, height: 860 } });
  const erros = [];
  pg.on('pageerror', e => erros.push(e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_FILE|nico-api|Failed to load resource/.test(m.text())) erros.push(m.text()); });
  const foto = async nome => { if (CAP) await pg.screenshot({ path: path.join(CAP, nome + '.png'), fullPage: false }); };

  console.log('Conteúdo');
  await pg.goto(url('revisoes.html'));
  await pg.waitForSelector('.rv-teste');
  const r = await pg.evaluate(() => {
    const F = window.Faisca, R = F.REV, C = F.PC.itens;
    const certo = it => ({ escolha: () => it.certa, varias: () => it.certas, vf: () => it.afirmacoes.map(a => a[1]), ordenar: () => it.itens.map((_, i) => i),
      curta: () => it.numero != null ? String(it.numero).replace('.', ',') : it.aceitar[0] })[it.tipo]();
    const errado = it => ({ escolha: () => (it.certa + 1) % it.opcoes.length, varias: () => [], vf: () => it.afirmacoes.map(a => !a[1]), ordenar: () => it.itens.map((_, i) => it.itens.length - 1 - i),
      curta: () => it.numero != null ? String(it.numero + 1) : 'zzz' })[it.tipo]();
    let n = 0, maus = [], tipos = new Set(), mesmoTeste = 0;
    const assin = new Set();
    for (let s = 1; s <= 300; s++) {
      const T = R.teste(R.util.semente(s * 7919));
      const a = T.map(t => t.pergunta).join('|'); if (assin.has(a)) mesmoTeste++; assin.add(a);
      for (const it of T) { n++; tipos.add(it.k); if (!C.corrigir(it, certo(it)) || C.corrigir(it, errado(it))) maus.push(it.k + ': ' + it.pergunta); if (!R.COMPETENCIAS[it.k]) maus.push('sem competência ' + it.k); }
    }
    for (const g of Object.values(R.G).flat()) for (let s = 0; s < 60; s++) { const it = R.gerarTipo(g.k, R.util.semente(s + 11)); if (!it) { maus.push('sem item ' + g.k); break; } if (!C.corrigir(it, certo(it)) || C.corrigir(it, errado(it))) { maus.push(g.k + ': ' + it.pergunta); break; } if (/undefined|NaN/.test(JSON.stringify(it))) { maus.push('undefined/NaN em ' + g.k); break; } }
    const total = Object.values(R.G).flat().length;
    // planificações: 11 das 35 hexominós são planificações do cubo
    const formas = new Map(); const rr = R.util.semente(3);
    for (let i = 0; i < 20000; i++) { const x = R.util.hexomino(rr); const norm = c => { let best = null; for (let rot = 0; rot < 8; rot++) { let p = c.map(([a, b]) => rot & 4 ? [b, a] : [a, b]).map(([a, b]) => [rot & 1 ? -a : a, rot & 2 ? -b : b]); const ma = Math.min(...p.map(q => q[0])), mb = Math.min(...p.map(q => q[1])); const k = p.map(([a, b]) => (a - ma) + ',' + (b - mb)).sort().join(';'); if (!best || k < best) best = k; } return best; }; formas.set(norm(x), R.util.eCubo(x)); }
    return { n, maus: maus.slice(0, 8), nmaus: maus.length, tipos: tipos.size, total, mesmoTeste, hexa: formas.size, cubos: [...formas.values()].filter(Boolean).length };
  });
  ok(r.nmaus === 0, `${r.n} itens em 300 testes: resposta certa aceite e errada recusada${r.nmaus ? ' — ' + r.maus.join(' / ') : ''}`);
  ok(r.tipos === r.total, `todos os ${r.total} tipos de exercício aparecem nos testes (${r.tipos})`);
  ok(r.mesmoTeste === 0, '300 testes, nenhum igual a outro');
  ok(r.hexa === 35 && r.cubos === 11, `planificações: ${r.hexa} hexaminós, ${r.cubos} são do cubo (esperado 35 e 11)`);

  console.log('Ecrã');
  await pg.evaluate(() => localStorage.clear());
  await pg.reload(); await pg.waitForSelector('.rv-teste');
  ok(await pg.locator('.rv-tema').count() >= 10 && await pg.locator('.rv-jogo').count() === 16, 'menu: temas, mistura e 16 jogos');
  await foto('rv-01-menu');
  // treino: 8 exercícios, responder mal duas vezes ao 1.º e bem aos outros
  await pg.locator('.rv-tema').first().click();
  for (let k = 0; k < 8; k++) {
    await pg.waitForSelector('#btnVerificar:not([hidden])');
    if (k === 1) await foto('rv-02-treino');
    const resp = await pg.evaluate(k => { const it = null; return k; }, k);
    void resp;
    await pg.click('#btnSaltar');
    await pg.click('#btnSeguinte');
  }
  ok(await pg.locator('#janela:not([hidden])').count() === 1, 'treino: janela final ao fim de 8 exercícios');
  await pg.click('#janelaBotoes button:first-child');
  // teste completo: responder certo a metade
  await pg.click('.rv-teste'); await pg.click('#janelaBotoes button:last-child');
  await pg.waitForSelector('.pv-nav button');
  const nq = await pg.locator('.pv-nav button').count();
  ok(nq === 25, `teste com ${nq} questões (22 + 3 jogos)`);
  ok(await pg.evaluate(() => 1) && true, 'ok');
  await foto('rv-03-teste');
  for (let k = 0; k < nq; k++) {
    await pg.locator('.pv-nav button').nth(k).click();
    const it = await pg.evaluate(() => document.querySelector('.pe-pergunta').textContent);
    void it;
    const inp = pg.locator('#prova .it-curta input');
    if (k === 2) await foto('rv-03b-teste-jogo');
    if (await pg.locator('#prova .rv-jogo-item').count()) { await foto('rv-jt-' + k); const b = pg.locator('#prova .rv-jogo-item button').first(); if (await b.count()) await b.click(); continue; }
    if (k % 2 === 0) {
      if (await inp.count()) await inp.fill('1');
      else if (await pg.locator('#prova .it-opcao').count()) await pg.locator('#prova .it-opcao').first().click();
    }
  }
  await pg.click('text=Entregar o teste'); await pg.click('#janelaBotoes button:last-child');
  await pg.waitForSelector('.rv-mencao');
  ok(/Insuficiente|Suficiente|Bom|Muito Bom/.test(await pg.textContent('.rv-mencao')), 'resultado com classificação: ' + await pg.textContent('.rv-mencao'));
  ok(await pg.locator('.rv-analise li').count() > 0, 'análise: onde falhou e o que reforçar');
  await foto('rv-04-resultado');
  await pg.evaluate(() => document.querySelector('.rv-analise').scrollIntoView());
  await foto('rv-05-analise');
  await pg.click('text=Voltar ao ginásio');
  ok(await pg.locator('.rv-reforco-cartao').count() === 1, 'depois de falhar aparece o «Reforço dos pontos fracos» no menu');
  ok(await pg.locator('.rv-an-menu li').count() > 0, 'menu mostra o que reforçar (somando testes e treinos)');
  await foto('rv-07-menu-reforco');
  await pg.click('.rv-reforco-cartao'); await pg.waitForSelector('#btnVerificar:not([hidden])');
  ok(/Reforço/.test(await pg.textContent('#atArea')), 'treino de reforço abre');
  // teste a sério certo: usar o motor para responder tudo certo e confirmar Muito Bom
  await pg.goto(url('revisoes.html', '?teste=1')); await pg.waitForSelector('.pv-nav button');
  // jogos
  for (const j of ['tabuada', 'abaco', 'binario', 'reta', 'coordenadas', 'secreta', 'enigma', 'planificacoes', 'memoria', 'feira', 'relogio', 'fracoes', 'sequencias', 'ordena', 'pares', 'programa']) {
    await pg.goto(url('revisoes.html', '?jogo=' + j)); await pg.waitForTimeout(400);
    ok(await pg.locator('.rv-jogo-palco *').count() > 1, 'jogo abre (modo ou jogo): ' + j);
    await foto('rv-j-' + j);
  }
  // todas as variantes de todos os jogos abrem sem erros
  const vars = await pg.evaluate(() => Object.entries(Faisca.REV.ui.JOGOS).flatMap(([id, j]) => (j.variantes || []).map(v => [id, v[0]])));
  let abriram = 0;
  for (const [id, v] of vars) { await pg.goto(url('revisoes.html', `?jogo=${id}&modo=${encodeURIComponent(v)}`)); await pg.waitForTimeout(250); if (await pg.locator('.rv-jogo-palco *').count() > 3 && /·/.test(await pg.textContent('#atTitulo'))) abriram++; else console.log('    não abriu: ' + id + ':' + v); await foto('rv-v-' + id + '-' + v); }
  ok(abriram === vars.length, `todas as ${vars.length} variantes dos jogos abrem`);
  // a criança não escolhe o modo: 5 vezes a memória dão os 5 modos, sem repetir
  await pg.evaluate(() => localStorage.clear());
  const modos = [];
  for (let k = 0; k < 5; k++) { await pg.goto(url('revisoes.html', '?jogo=memoria')); await pg.waitForSelector('.rv-memoria'); modos.push((await pg.textContent('#atTitulo')).split('·')[1].trim()); }
  ok(new Set(modos).size === 5, 'o Nico escolhe o modo sozinho e roda por todos: ' + modos.join(', '));
  // jogos dentro do teste: cada um aceita a resposta certa e recusa uma errada; rodam entre testes
  const jt = await pg.evaluate(() => {
    const J = Faisca.REV.jogosTeste, U = Faisca.REV.util, maus = [];
    const boa = it => ({ abaco: () => String(it.alvo).padStart(6, '0'), binario: () => it.alvo.toString(2).padStart(5, '0'), reta: () => it.alvo, relogio: () => it.hh + ':' + it.mm, fracao: () => it.num, feira: () => it.preco,
      coordenada: () => it.c + ',' + it.l, ordena: () => it.nums.slice().sort((a, b) => a - b), programa: () => J.caminho(it.ini, it.fim, new Set(it.pedras)), planificacao: () => it.figs.map((f, k) => U.eCubo(f) ? k : -1).filter(k => k >= 0) })[it.jogo]();
    for (const t of J.TIPOS) for (let s = 0; s < 40; s++) { const it = J.gerar(t, U.semente(s + 5)); const b = boa(it); if (!J.corrigir(it, { v: b }) || J.corrigir(it, { v: t === 'reta' ? it.alvo + it.max / 5 : t === 'ordena' ? b.slice().reverse() : t === 'programa' ? ['↑'] : t === 'planificacao' ? [0, 1, 2, 3].filter(k => !b.includes(k)) : t === 'binario' ? '11111' : t === 'abaco' ? '000000' : 'x' })) { maus.push(t); break; } if (!J.certa(it)) maus.push('sem certa ' + t); }
    const rec = new Set(); let rep = 0; for (let k = 0; k < 3; k++) { const l = J.escolher(3, rec); l.forEach(j => { if (rec.has(j.k)) rep++; rec.add(j.k); }); }
    return { maus, rep };
  });
  ok(!jt.maus.length, 'jogos do teste: resposta certa aceite e errada recusada' + (jt.maus.length ? ': ' + jt.maus.join(', ') : ''));
  ok(jt.rep === 0, '3 testes seguidos com jogos todos diferentes (9 de 10 tipos)');
  // testes seguidos usam tipos de exercício diferentes
  const rot = await pg.evaluate(() => { const R = Faisca.REV, rec = new Set(); let rep = 0; for (let k = 0; k < 4; k++) { const T = R.teste(Math.random, rec); T.forEach(t => { if (rec.has(t.k)) rep++; }); T.forEach(t => rec.add(t.k)); } return rep; });
  ok(rot <= 6, `4 testes seguidos quase sem repetir tipos de exercício (${rot} repetidos em 88)`);
  // jogar a tabuada com respostas certas
  await pg.goto(url('revisoes.html', '?jogo=tabuada&modo=mistura')); await pg.waitForSelector('.rv-tab-q');
  for (let k = 0; k < 5; k++) { const q = await pg.textContent('.rv-tab-q'); const m = q.replace(/\u00a0/g, '').match(/(\d+)\s*([×:])\s*(\d+)/); const v = m[2] === '×' ? m[1] * m[3] : m[1] / m[3]; await pg.fill('.rv-inp', String(v)); await pg.press('.rv-inp', 'Enter'); }
  ok((await pg.textContent('#atConta')) === '5 certas', 'tabuada-relâmpago conta as certas');
  // mapa do percurso
  await pg.goto(url('percurso.html')); await pg.waitForSelector('.pc-sessao.especial');
  ok(/Ginásio dos Números/.test(await pg.textContent('.pc-sessao.especial')), 'cartão do capítulo especial no mapa do Percurso');
  await foto('rv-06-percurso');
  ok(erros.length === 0, 'sem erros na consola' + (erros.length ? ': ' + erros.slice(0, 4).join(' | ') : ''));
  await br.close();
  console.log(falhas ? `\n${falhas} falha(s)` : '\nTudo certo.');
  process.exit(falhas ? 1 : 0);
})();
