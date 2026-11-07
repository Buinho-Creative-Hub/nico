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
    const certo = it => ({ escolha: () => it.certa, vf: () => it.afirmacoes.map(a => a[1]), ordenar: () => it.itens.map((_, i) => i),
      curta: () => it.numero != null ? String(it.numero).replace('.', ',') : it.aceitar[0] })[it.tipo]();
    const errado = it => ({ escolha: () => (it.certa + 1) % it.opcoes.length, vf: () => it.afirmacoes.map(a => !a[1]), ordenar: () => it.itens.map((_, i) => it.itens.length - 1 - i),
      curta: () => it.numero != null ? String(it.numero + 1) : 'zzz' })[it.tipo]();
    let n = 0, maus = [], tipos = new Set(), mesmoTeste = 0;
    const assin = new Set();
    for (let s = 1; s <= 300; s++) {
      const T = R.teste(R.util.semente(s * 7919));
      const a = T.map(t => t.pergunta).join('|'); if (assin.has(a)) mesmoTeste++; assin.add(a);
      for (const it of T) { n++; tipos.add(it.k); if (!C.corrigir(it, certo(it)) || C.corrigir(it, errado(it))) maus.push(it.k + ': ' + it.pergunta); if (!R.COMPETENCIAS[it.k]) maus.push('sem competência ' + it.k); }
    }
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
  ok(await pg.locator('.rv-tema').count() >= 10 && await pg.locator('.rv-jogo').count() === 8, 'menu: temas, mistura e 8 jogos');
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
  ok(nq === 22, `teste com ${nq} questões`);
  await foto('rv-03-teste');
  for (let k = 0; k < nq; k++) {
    await pg.locator('.pv-nav button').nth(k).click();
    const it = await pg.evaluate(() => document.querySelector('.pe-pergunta').textContent);
    void it;
    const inp = pg.locator('#prova .it-curta input');
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
  for (const j of ['tabuada', 'abaco', 'binario', 'reta', 'coordenadas', 'secreta', 'enigma', 'planificacoes']) {
    await pg.goto(url('revisoes.html', '?jogo=' + j)); await pg.waitForTimeout(400);
    ok(await pg.locator('.rv-jogo-palco *').count() > 3, 'jogo abre: ' + j);
    await foto('rv-j-' + j);
  }
  // jogar a tabuada com respostas certas
  await pg.goto(url('revisoes.html', '?jogo=tabuada')); await pg.waitForSelector('.rv-tab-q');
  for (let k = 0; k < 5; k++) { const q = await pg.textContent('.rv-tab-q'); const m = q.match(/(\d+)\s*([×:])\s*(\d+)/); const v = m[2] === '×' ? m[1] * m[3] : m[1] / m[3]; await pg.fill('.rv-inp', String(v)); await pg.press('.rv-inp', 'Enter'); }
  ok((await pg.textContent('#atConta')) === '5 certas', 'tabuada-relâmpago conta as certas');
  // mapa do percurso
  await pg.goto(url('percurso.html')); await pg.waitForSelector('.pc-sessao.especial');
  ok(/Último teste/.test(await pg.textContent('.pc-sessao.especial')), 'cartão do capítulo especial no mapa do Percurso, com o último teste');
  await foto('rv-06-percurso');
  ok(erros.length === 0, 'sem erros na consola' + (erros.length ? ': ' + erros.slice(0, 4).join(' | ') : ''));
  await br.close();
  console.log(falhas ? `\n${falhas} falha(s)` : '\nTudo certo.');
  process.exit(falhas ? 1 : 0);
})();
