/* Faísca Desafios — testes automáticos (Chromium sem janela).
 *
 *   node testes/testar.js                       todas as missões com todas as mascotes
 *   node testes/testar.js reparar               só uma missão (com todas as mascotes)
 *   node testes/testar.js reparar nico          uma missão, uma mascote
 *   RAPIDO=1 node testes/testar.js …            só o Nico
 *
 * Os casos de cada missão estão em testes/casos/<missão>.js (um caso por desafio com validação):
 *   { ok: xml, errado: xml | [xml…], fazer: [entrada…], espera: ms, regras: [[xml, 'id_da_regra'|null]…] }
 *   entradas: 'botao:A', 'pino:P1', 'agitar', 'gesto:left', 'somalto', 'logo',
 *             { luz: 10 } / { som: 200 } / { temperatura: 30 } / { 'analogico:P1': 800 } / { 'digital:P0': 1 }  (muda o sensor e avisa),
 *             { esperar: 500 }
 * Para cada desafio: a solução certa passa; as erradas não; as regras reconhecem a dificuldade certa;
 * o .py gerado da solução é Python válido. Por mascote: ajuda em 3 níveis, gambiarras, .hex, voz.
 * Precisa do playwright-core (NODE_PATH) e do Chromium (CHROMIUM).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require('playwright-core');

const RAIZ = path.resolve(__dirname, '..');
const url = (m, a) => 'file://' + path.join(RAIZ, 'index.html') + '?todos&m=' + m + '&a=' + a;
const CASOS = {};
for (const f of fs.readdirSync(path.join(__dirname, 'casos')).filter(f => f.endsWith('.js'))) {
  const c = require(path.join(__dirname, 'casos', f));
  CASOS[c.missao] = c.casos;
}
const SENSORES_BASE = { luz: 150, som: 20, temperatura: 21, 'analogico:P0': 0, 'analogico:P1': 0, 'analogico:P2': 0, 'digital:P0': 0, 'digital:P1': 0, 'digital:P2': 0 };

function pythonValido(codigo) {
  const r = spawnSync('python3', ['-c', 'import ast,sys; ast.parse(sys.stdin.read())'], { input: codigo, encoding: 'utf-8' });
  return r.status === 0 ? null : (r.stderr || '').trim().split('\n').slice(-2).join(' ');
}

async function carregarPrograma(page, i, x) {
  await page.evaluate(([i, x]) => {
    const A = Faisca.app;
    if (A.estado.atual !== i) A.mudarDesafio(i);
    A.ws.clear();
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), A.ws);
  }, [i, x]);
}

async function testarMissao(browser, p, a, comPython) {
  const page = await browser.newPage();
  const erros = [];
  // erros de OUTRAS missões (ficheiros a meio de serem escritos) não contam para esta
  page.on('pageerror', e => { const st = String(e.stack || e); if (/\/missoes\//.test(st) && !st.includes('/missoes/' + p + '.js')) return; if (e.name === 'SyntaxError' && !st.includes('/missoes/' + p + '.js') && process.env.PARALELO) return; erros.push(String(e)); });
  await page.goto(url(p, a));
  await page.waitForFunction(() => window.Faisca && window.Faisca.app);
  const falhas = [];
  const info = await page.evaluate(() => ({ id: Faisca.MISSAO.id, mid: Faisca.MASCOTE.id, n: Faisca.DESAFIOS.length,
    livres: Faisca.DESAFIOS.filter(d => d.livre).length, mascote: Faisca.MASCOTE.nome, titulo: document.title,
    niveis: Faisca.MISSAO.niveis.map(n => n.desafios.length) }));
  if (info.id !== p || info.mid !== a) falhas.push(`carregou ${info.id}/${info.mid}, esperava ${p}/${a}`);
  const casos = CASOS[p] || [];
  if (casos.length !== info.n - info.livres) falhas.push(`há ${info.n - info.livres} desafios com validação e ${casos.length} casos de teste`);

  const correr = async (i, x, fazer, espera = 1200) => {
    await page.evaluate(s => { for (const [k, v] of Object.entries(s)) Faisca.app.sim.definirSensor(k, v); }, SENSORES_BASE);
    await carregarPrograma(page, i, x);
    await page.waitForTimeout(550);            // 250 ms de espera do editor + arranque
    for (const k of fazer || []) {
      if (typeof k === 'string') await page.evaluate(k => Faisca.app.entrada(k, 'ecra'), k);
      else if (k.esperar) await page.waitForTimeout(k.esperar);
      else await page.evaluate(o => { for (const [s, v] of Object.entries(o)) { Faisca.app.sim.definirSensor(s, v); Faisca.app.entrada(s + ':' + v, 'ecra'); } }, k);
      await page.waitForTimeout(180);
    }
    await page.waitForTimeout(espera);
    return page.evaluate(i => !!Faisca.DESAFIOS[i].ok(Faisca.app.registo()), i);
  };

  let desafio = 0;
  for (const [i, d] of (await page.evaluate(() => Faisca.DESAFIOS.map(d => ({ livre: !!d.livre, titulo: d.titulo })))).entries()) {
    if (d.livre) continue;
    const c = casos[desafio++];
    if (!c) break;
    const nomeD = `desafio ${i + 1} «${d.titulo}»`;
    if (!(await correr(i, c.ok, c.fazer, c.espera))) falhas.push(`${nomeD}: a solução certa não passou`);
    for (const e of [].concat(c.errado || [])) if (await correr(i, e, c.fazer, c.espera)) falhas.push(`${nomeD}: um programa errado passou`);
    if (comPython) {
      await carregarPrograma(page, i, c.ok);
      const codigo = await page.evaluate(() => Faisca.paraPython(Faisca.app.ws));
      const erro = pythonValido(codigo);
      if (erro) falhas.push(`${nomeD}: Python inválido — ${erro}`);
    }
    if (c.regras) {
      const ids = await page.evaluate(([i, casos]) => casos.map(([x]) => {
        const A = Faisca.app; if (A.estado.atual !== i) A.mudarDesafio(i); A.ws.clear();
        Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), A.ws);
        A.tutor.programaMudou(Faisca.analisar(A.ws));
        return A.tutor.regraAtiva ? A.tutor.regraAtiva.id : null;
      }), [i, c.regras]);
      c.regras.forEach(([, id], k) => { if (ids[k] !== id) falhas.push(`${nomeD}: regra caso ${k} deu «${ids[k]}», esperava «${id}»`); });
    }
    // a solução certa deve «parecer pronta» (para a mascote dizer «agora experimenta»)
    const pronto = await page.evaluate(([i, x]) => {
      const A = Faisca.app; A.ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), A.ws);
      try { return !!Faisca.TUTOR.DESAFIOS[i].parecePronto(Faisca.analisar(A.ws)); } catch (e) { return 'erro: ' + e.message; }
    }, [i, c.ok]);
    if (pronto !== true) falhas.push(`${nomeD}: a solução certa não «parece pronta» (${pronto})`);
  }

  // mascote: área vazia → ajuda; depois 3 níveis numa regra (desafio 1)
  const m = await page.evaluate(() => {
    const A = Faisca.app; const out = [];
    A.mudarDesafio(0); A.ws.clear();
    A.tutor.programaMudou(Faisca.analisar(A.ws));
    A.tutor.pedirAjuda(); out.push(document.getElementById('tutorTexto').textContent);
    // um bloco solto ativa sempre uma regra (blocos soltos, ou a primeira do desafio)
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom('<xml><block type="mk_icone" x="300" y="40"><field name="I">Happy</field></block></xml>'), A.ws);
    A.tutor.programaMudou(Faisca.analisar(A.ws));
    for (let k = 0; k < 3; k++) { A.tutor.pedirAjuda(); out.push(document.getElementById('tutorTexto').textContent + ' |' + (document.getElementById('tutorNivel').getAttribute('aria-label') || '')); }
    return { out, nome: document.querySelector('.tutor-nome').textContent, img: document.getElementById('tutorImg').getAttribute('src') };
  });
  if (m.nome !== info.mascote) falhas.push(`balão mostra «${m.nome}»`);
  if (!m.img.startsWith('img/' + a + '/')) falhas.push(`sprite fora da pasta da mascote: ${m.img}`);
  if (new Set(m.out).size !== 4) falhas.push('a ajuda repetiu a mesma pista: ' + JSON.stringify(m.out));
  if (!/pista 3 de 3/.test(m.out[3])) falhas.push('não chegou ao nível 3 de pista');

  // gambiarra de cada desafio: carrega um programa e volta ao da criança
  const g = await page.evaluate(() => {
    const A = Faisca.app; const r = [];
    A.estado.feitos = Faisca.DESAFIOS.length;
    Faisca.DESAFIOS.forEach((d, i) => {
      const gb = Faisca.TUTOR.DESAFIOS[i] && Faisca.TUTOR.DESAFIOS[i].gambiarra;
      if (!gb) { r.push(d.livre ? 'livre' : 'sem gambiarra'); return; }
      A.mudarDesafio(i); A.entrarGambiarra(); const n = A.ws.getAllBlocks(false).length; A.sairGambiarra(true);
      r.push(n ? 'ok' : 'vazia');
    });
    return { r, texto: document.getElementById('tutorTexto').textContent };
  });
  g.r.forEach((x, i) => { if (x !== 'ok' && x !== 'livre') falhas.push(`desafio ${i + 1}: gambiarra ${x}`); });

  // .hex (da última solução)
  if (casos.length) await carregarPrograma(page, info.n - info.livres - 1, casos[casos.length - 1].ok);
  const hex = await page.evaluate(async () => { try { const h = await Faisca.gerarHex(Faisca.app.ws); return h.slice(0, 1) + ':' + h.length; } catch (e) { return 'ERRO ' + e.message; } });
  if (!hex.startsWith('::')) falhas.push('.hex: ' + hex);

  if (erros.length) falhas.push('erros na página: ' + [...new Set(erros)].join(' / '));
  await page.close();
  const obrigado = a === 'gabi' ? /Obrigada/ : /Obrigado/;
  if (!obrigado.test(g.texto) && /Obrigad/.test(g.texto)) falhas.push('género errado na voz: ' + g.texto);
  return { info, falhas, mensagens: m.out, hex };
}

(async () => {
  const missoes = process.argv[2] ? [process.argv[2]] : Object.keys(CASOS);
  const mascotes = process.argv[3] ? [process.argv[3]] : process.env.RAPIDO ? ['nico'] : ['gabi', 'nico'];
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--allow-file-access-from-files'] });
  let mal = 0;
  for (const p of missoes) for (const [k, a] of mascotes.entries()) {
    const r = await testarMissao(browser, p, a, k === 0);
    console.log(`\n== ${p} com ${r.info.mascote} — níveis ${JSON.stringify(r.info.niveis)} — ${r.info.titulo}`);
    if (r.falhas.length) { mal++; r.falhas.forEach(f => console.log('   FALHA:', f)); } else console.log('   OK');
  }
  if (!process.argv[2]) {
    const pg = await browser.newPage();
    await pg.goto('file://' + path.join(RAIZ, 'index.html'));
    const ini = await pg.evaluate(() => ({ m: document.querySelectorAll('.cartao-mascote').length, x: document.querySelectorAll('.cartao-missao:not(.em-preparacao)').length, visivel: !document.getElementById('inicio').hidden }));
    console.log('\n== ecrã inicial:', JSON.stringify(ini));
    if (!ini.visivel || ini.m < 2 || ini.x < Object.keys(CASOS).length) { mal++; console.log('   FALHA: ecrã inicial incompleto'); }
  }
  await browser.close();
  process.exit(mal ? 1 : 0);
})();
