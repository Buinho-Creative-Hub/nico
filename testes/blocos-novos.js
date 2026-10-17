/* Teste dos blocos novos: corre programas no micro:bit do ecrã, vê o registo e valida o Python gerado.
 *   node testes/blocos-novos.js
 */
'use strict';
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require('playwright-core');
const L = require('./lib');
const { xml, E, seq, b, v, conta, cmp, aleatorio, resto, lerD, lerA, icone, numero, texto, acender, grafico, definir, mudar, servo, registar, se, seEntao, tom, pausa } = L;

const PROGRAMAS = [
  ['contador com A e mostrar número', xml(E.inicio(seq(definir('contador', 0))), E.botao('A', seq(mudar('contador', 1), numero(v('contador'))))),
    ['botao:A', 'botao:A', 'botao:A'], r => r.includes('out numero:3') && r.includes('out var:contador:3')],
  ['luz no gráfico (para sempre)', xml(E.sempre(seq(grafico(b('mk_luz'), 255)))), [{ luz: 255 }, { esperar: 300 }, { luz: 0 }], r => r.includes('out grafico:25') && r.includes('out grafico:0')],
  ['se luz < 40 então ícone', xml(E.sempre(seq(se(cmp(b('mk_luz'), '<', 40), [icone('Asleep')], [icone('Happy')])))), [{ luz: 10 }, { esperar: 200 }, { luz: 200 }], r => r.includes('out icone:Asleep') && r.includes('out icone:Happy')],
  ['temperatura em número', xml(E.botao('A', seq(numero(b('mk_temperatura'))))), [{ temperatura: 33 }, 'botao:A'], r => r.includes('out numero:33')],
  ['texto', xml(E.botao('B', seq(texto('Oi')))), ['botao:B'], r => r.includes('out texto:Oi')],
  ['acender x y', xml(E.botao('A', seq(acender(1, 3)))), ['botao:A'], r => r.includes('out acender:1,3')],
  ['dado (aleatório 1–6)', xml(E.agitar(seq(numero(aleatorio(1, 6))))), ['agitar'], r => /out numero:[1-6]\b/.test(r)],
  ['conta e resto', xml(E.botao('A', seq(numero(conta(7, '*', 6)), numero(resto(7, 2))))), ['botao:A', { esperar: 1200 }], r => r.includes('out numero:42') && r.includes('out numero:1')],
  ['gesto inclinar', xml(E.gesto('left', seq(icone('No'))), E.gesto('right', seq(icone('Yes')))), ['gesto:left', 'gesto:right'], r => r.includes('out icone:No') && r.includes('out icone:Yes')],
  ['som alto', xml(E.somalto(seq(icone('Surprised')))), ['somalto'], r => r.includes('out icone:Surprised')],
  ['nível de som no gráfico', xml(E.sempre(seq(grafico(b('mk_som_nivel'), 255)))), [{ som: 255 }], r => r.includes('out grafico:25')],
  ['leitura digital (interruptor do brinquedo)', xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '=', 1), icone('Heart'))))), [{ 'digital:P0': 1 }], r => r.includes('out icone:Heart')],
  ['leitura analógica (humidade)', xml(E.sempre(seq(grafico(lerA('P1'), 1023)))), [{ 'analogico:P1': 1023 }], r => r.includes('out grafico:25')],
  ['servo', xml(E.botao('A', seq(servo('P0', 180))), E.botao('B', seq(servo('P0', 0)))), ['botao:A', 'botao:B'], r => r.includes('out servo:P0:180') && r.includes('out servo:P0:0')],
  ['registar dados', xml(E.botao('A', seq(registar('luz', b('mk_luz'))))), [{ luz: 77 }, 'botao:A'], r => r.includes('out registo:luz:77')],
  ['tom com sensor', xml(E.botao('A', seq(tom(conta(b('mk_luz'), '+', 200))))), [{ luz: 100 }, 'botao:A'], r => r.includes('out tom:300')],
  ['tempo de execução', xml(E.botao('A', seq(definir('medida', b('mk_tempo')))), E.botao('B', seq(numero(v('medida'))))), [{ esperar: 300 }, 'botao:A', 'botao:B'], r => /out numero:\d{3,}/.test(r)],
  ['no arranque antes do para sempre', xml(E.inicio(seq(definir('pontos', 5))), E.sempre(seq(numero(v('pontos')), pausa(100)))), [{ esperar: 900 }], r => r.includes('out numero:5')],
];

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage();
  const erros = []; page.on('pageerror', e => erros.push(String(e)));
  await page.goto('file://' + path.join(__dirname, '..', 'index.html') + '?todos&m=primeiros-passos&a=nico');
  await page.waitForFunction(() => window.Faisca && Faisca.app);
  let mal = 0;
  for (const [nome, x, fazer, teste] of PROGRAMAS) {
    await page.evaluate(x => { const A = Faisca.app; A.mudarDesafio(6); A.ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), A.ws); }, x);
    await page.waitForTimeout(500);
    for (const k of fazer) {
      if (typeof k === 'string') await page.evaluate(k => Faisca.app.entrada(k, 'ecra'), k);
      else if (k.esperar) await page.waitForTimeout(k.esperar);
      else await page.evaluate(o => { for (const [s, v] of Object.entries(o)) { Faisca.app.sim.definirSensor(s, v); Faisca.app.entrada(s + ':' + v, 'ecra'); } }, k);
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => Faisca.app.registo().map(e => e.dir + ' ' + e.v).join('\n'));
    const py = await page.evaluate(() => Faisca.paraPython(Faisca.app.ws));
    const c = spawnSync('python3', ['-c', 'import ast,sys; ast.parse(sys.stdin.read())'], { input: py, encoding: 'utf-8' });
    const ok = teste(r), pyOk = c.status === 0;
    if (!ok || !pyOk) mal++;
    console.log((ok && pyOk ? 'OK   ' : 'FALHA') + ' ' + nome + (ok ? '' : '\n      registo: ' + r.split('\n').slice(-8).join(' | ')) + (pyOk ? '' : '\n      python: ' + c.stderr.trim().split('\n').pop()));
  }
  if (erros.length) { mal++; console.log('erros na página:', erros); }
  // um exemplo de Python gerado, para ver
  console.log('\n--- exemplo de main.py (contador) ---');
  await page.evaluate(x => { const A = Faisca.app; A.ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), A.ws); }, PROGRAMAS[0][1]);
  console.log(await page.evaluate(() => Faisca.paraPython(Faisca.app.ws)));
  await browser.close();
  process.exit(mal ? 1 : 0);
})();
