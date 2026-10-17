/* Teste do modo livre: caixa com categorias, blocos do Smart Science IoT Kit (Octopus + OLED) no ecrã e em Python.
 *   NODE_PATH=<playwright-core> CHROMIUM=<chromium> node testes/modo-livre.js [captura.png]
 */
'use strict';
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require('playwright-core');
const L = require('./lib');
const { xml, E, seq, b, v, cmp, numero, texto, definir, se, seEntao, icone, grafico, pausa } = L;
const blk = (t, i = '') => `<block type="${t}">${i}</block>`;
const campo = (n, x) => `<field name="${n}">${x}</field>`;
const I = (t, i = '') => [`<block type="${t}">${i}`, '</block>'];
const val = (n, x) => typeof x === 'number' ? `<value name="${n}"><shadow type="mk_num"><field name="NUM">${x}</field></shadow></value>`
  : (x.startsWith('<') ? `<value name="${n}">${x}</value>` : `<value name="${n}"><shadow type="mk_texto"><field name="TXT">${x}</field></shadow></value>`);
const ruido = (p = 'P1') => blk('mk_kit_ruido', campo('P', p));
const luzKit = (p = 'P2') => blk('mk_kit_luz', campo('P', p));
const pir = (p = 'P13') => blk('mk_kit_pir', campo('P', p));
const bme = q => blk('mk_kit_bme', campo('Q', q));
const oIni = () => I('mk_oled_iniciar', val('L', 128) + val('A', 64));
const oTxt = t => I('mk_oled_texto', val('T', t));
const oNum = x => I('mk_oled_numero', val('N', x));
const oLimpar = () => I('mk_oled_limpar');
const oBarra = x => I('mk_oled_barra', val('V', x));
// Sensory OLED (extensão do Buinho)
const soBarra = (x, mn = 40, mx = 85) => I('so_barra', val('V', x) + val('MIN', mn) + val('MAX', mx) + val('ROT', 'RUÍDO') + val('UN', 'dB'));
const soGrande = x => I('so_grande', val('V', x) + val('ROT', 'TEMP') + val('UN', 'C'));
const soGrafico = x => I('so_grafico', val('V', x) + val('MIN', 30) + val('MAX', 90) + val('LO', 45) + val('HI', 65) + val('ROT', 'RUIDO'));
const soAtiv = () => I('so_atividade', `<value name="MOV"><shadow type="so_pir"><field name="P">P13</field></shadow></value>` + val('S', 10) + val('ROT', 'ATIVIDADE'));
const soTexto = (t, l) => I('so_texto', val('T', t) + val('L', l));
const soMedia = x => blk('so_media', val('V', x) + val('S', 5) + val('C', 1));

const PROGRAMAS = [
  ['ruído do kit no número', xml(E.botao('A', seq(numero(ruido())))), [{ kit_ruido: 72 }, 'botao:A'], r => r.includes('out numero:72')],
  ['luz do kit no gráfico', xml(E.sempre(seq(grafico(luzKit(), 100)))), [{ kit_luz: 100 }], r => r.includes('out grafico:25')],
  ['PIR acende coração', xml(E.sempre(seq(se(pir(), [icone('Heart')], [icone('Asleep')])))), [{ esperar: 200 }, { kit_pir: 1 }], r => r.includes('out icone:Heart') && r.includes('out icone:Asleep')],
  ['BME280 temperatura / humidade / pressão', xml(E.botao('A', seq(numero(bme('temp')))), E.botao('B', seq(numero(bme('hum')), numero(bme('pres'))))),
    [{ bme_temp: 31 }, { bme_hum: 64 }, 'botao:A', { esperar: 300 }, 'botao:B', { esperar: 2500 }], r => r.includes('out numero:31') && r.includes('out numero:64') && r.includes('out numero:1013')],
  ['OLED: iniciar, texto, número e barra', xml(E.inicio(seq(oIni(), oTxt('Olá Messejana'), oNum(bme('temp')))), E.botao('A', seq(oBarra(luzKit())))),
    [{ esperar: 300 }, { kit_luz: 40 }, 'botao:A'], r => r.includes('out oled:iniciar') && r.includes('out oled:texto:Olá Messejana') && /out oled:numero:\d+/.test(r) && r.includes('out oled:barra:40')],
  ['OLED: limpar', xml(E.botao('A', seq(oLimpar(), oTxt('ruido'), oNum(ruido())))), ['botao:A'], r => r.includes('out oled:limpar') && /out oled:numero:\d+/.test(r)],
  ['Sensory OLED: barra de intensidade com o ruído', xml(E.sempre(seq(soBarra(ruido()), pausa(100)))), [{ kit_ruido: 70 }, { esperar: 400 }], r => r.includes('out soled:barra:70')],
  ['Sensory OLED: número grande com média', xml(E.sempre(seq(soGrande(soMedia(bme('temp'))), pausa(100)))), [{ bme_temp: 30 }, { esperar: 600 }], r => /out soled:grande:\d+/.test(r)],
  ['Sensory OLED: gráfico a passar', xml(E.sempre(seq(soGrafico(ruido()), pausa(100)))), [{ kit_ruido: 50 }, { esperar: 400 }], r => r.includes('out soled:grafico:50')],
  ['Sensory OLED: medidor de atividade + texto', xml(E.sempre(seq(soAtiv(), pausa(100))), E.botao('A', seq(soTexto('Olá', 3)))), [{ kit_pir: 1 }, { esperar: 400 }, 'botao:A'], r => r.includes('out soled:atividade') && r.includes('out soled:texto:Olá')],
  ['mostrar texto (show string) no modo livre', xml(E.botao('B', seq(texto('Nico')))), ['botao:B'], r => r.includes('out texto:Nico')],
];

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const erros = []; page.on('pageerror', e => erros.push(String(e)));
  let mal = 0;
  // ecrã inicial: o cartão do modo livre aparece primeiro
  await page.goto('file://' + path.join(__dirname, '..', 'index.html') + '?a=nico');
  await page.waitForSelector('.cartao-livre');
  const primeiro = await page.evaluate(() => document.querySelector('#listaMissoes .cartao-missao').classList.contains('cartao-livre'));
  console.log((primeiro ? 'OK   ' : 'FALHA') + ' cartão «Modo livre» é o primeiro das missões'); if (!primeiro) mal++;
  if (process.argv[3]) await page.screenshot({ path: process.argv[3] });

  await page.goto('file://' + path.join(__dirname, '..', 'index.html') + '?m=livre&a=nico');
  await page.waitForFunction(() => window.Faisca && Faisca.app);
  const cats = await page.evaluate(() => [...document.querySelectorAll('.blocklyToolboxCategoryLabel')].map(e => e.textContent));
  const okCats = ['Básico', 'Entrada', 'Música', 'LED', 'Ciclos', 'Lógica', 'Variáveis', 'Matemática', 'Pinos', 'Registo de dados', 'Octopus', 'OLED', 'Sensory OLED'].every(c => cats.includes(c));
  console.log((okCats ? 'OK   ' : 'FALHA') + ' categorias: ' + cats.join(', ')); if (!okCats) mal++;
  // todos os blocos da caixa existem (nenhum XML partido)
  const partidos = await page.evaluate(() => Faisca.CATEGORIAS_LIVRE.flatMap(([, l]) => l).filter(k => !Faisca.XML_CAIXA[k] || !Blockly.Blocks[(Faisca.XML_CAIXA[k].match(/type="([a-z_]+)"/) || [])[1]]));
  console.log((partidos.length ? 'FALHA' : 'OK   ') + ' blocos da caixa definidos' + (partidos.length ? ': ' + partidos : '')); if (partidos.length) mal++;

  for (const [nome, x, fazer, teste] of PROGRAMAS) {
    await page.evaluate(x => { const A = Faisca.app; A.ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), A.ws); }, x);
    await page.waitForTimeout(500);
    for (const k of fazer) {
      if (typeof k === 'string') await page.evaluate(k => Faisca.app.entrada(k, 'ecra'), k);
      else if (k.esperar) await page.waitForTimeout(k.esperar);
      else await page.evaluate(o => { for (const [s, v] of Object.entries(o)) { Faisca.app.sim.definirSensor(s, v); Faisca.app.entrada(s + ':' + v, 'ecra'); } }, k);
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => Faisca.app.registo().map(e => e.dir + ' ' + e.v).join('\n'));
    const py = await page.evaluate(() => Faisca.paraPython(Faisca.app.ws));
    const c = spawnSync('python3', ['-c', 'import ast,sys; ast.parse(sys.stdin.read())'], { input: py, encoding: 'utf-8' });
    const ok = teste(r), pyOk = c.status === 0;
    if (!ok || !pyOk) mal++;
    console.log((ok && pyOk ? 'OK   ' : 'FALHA') + ' ' + nome + (ok ? '' : '\n      registo: ' + r.split('\n').slice(-10).join(' | ')) + (pyOk ? '' : '\n      python: ' + c.stderr.trim().split('\n').pop()));
  }
  // .hex com todos os blocos do kit
  await page.evaluate(x => { const A = Faisca.app; A.ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), A.ws); }, PROGRAMAS[4][1]);
  const hex = await page.evaluate(async () => { try { const h = await Faisca.gerarHex(Faisca.app.ws); return h.length; } catch (e) { return String(e); } });
  const hexOk = typeof hex === 'number' && hex > 100000;
  console.log((hexOk ? 'OK   ' : 'FALHA') + ' .hex com OLED + BME280 + luz (' + hex + ' caracteres)'); if (!hexOk) mal++;
  if (process.argv[2]) {
    await page.evaluate(x => { const A = Faisca.app; A.ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), A.ws); }, PROGRAMAS[4][1]);
    await page.waitForTimeout(600);
    await page.evaluate(() => { Faisca.app.entrada('botao:A', 'ecra'); });
    await page.click('.blocklyToolboxCategory:has-text("Octopus")');
    await page.waitForTimeout(700);
    await page.screenshot({ path: process.argv[2] });
    require('fs').writeFileSync(process.argv[2].replace(/\.png$/, '.py'), await page.evaluate(() => Faisca.paraPython(Faisca.app.ws)));
  }
  if (erros.length) { mal++; console.log('erros na página:', erros); }
  await browser.close();
  process.exit(mal ? 1 : 0);
})();
