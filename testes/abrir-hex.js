/* Teste do «Abrir projeto» do modo livre: o .hex do Nico leva os blocos e volta a abrir-se igual.
 *   NODE_PATH=<playwright-core> CHROMIUM=<chromium> node testes/abrir-hex.js [captura.png]
 */
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright-core');
const L = require('./lib');
const { xml, E, seq, icone, texto, numero, definir, se, cmp, v, b } = L;

const PROGRAMA = xml(
  E.inicio(seq(definir('pontos', 0), texto('Olá Messejana'))),
  E.botao('A', seq(definir('pontos', 7), numero(v('pontos')))),
  E.sempre(seq(se(cmp(b('mk_luz'), '<', 40), [icone('Heart')], [icone('Asleep')]))),
);

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const erros = []; page.on('pageerror', e => erros.push(String(e)));
  let mal = 0;
  const ok = (c, txt) => { console.log((c ? 'OK   ' : 'FALHA') + ' ' + txt); if (!c) mal++; };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nico-hex-'));

  await page.goto('file://' + path.join(__dirname, '..', 'index.html') + '?m=livre&a=nico');
  await page.waitForFunction(() => window.Faisca && Faisca.app);
  ok(await page.isVisible('#btnAbrirHex'), 'botão «Abrir projeto» visível no modo livre');

  // 1. gerar o .hex de um programa
  await page.evaluate(x => { const A = Faisca.app; A.ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), A.ws); }, PROGRAMA);
  const antes = await page.evaluate(() => { const ws = Faisca.app.ws; return { n: ws.getAllBlocks(false).length, py: Faisca.paraPython(ws) }; });
  const hex = await page.evaluate(() => Faisca.gerarHex(Faisca.app.ws));
  const ficheiro = path.join(tmp, 'o meu projeto.hex');
  fs.writeFileSync(ficheiro, hex);
  ok(hex.length > 100000, '.hex gerado (' + hex.length + ' caracteres)');

  // 2. começar de novo com outro programa e abrir o .hex pelo botão
  await page.evaluate(x => { const A = Faisca.app; A.ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), A.ws); }, xml(E.botao('B', seq(icone('Sad')))));
  await page.waitForTimeout(400);
  await page.setInputFiles('#ficheiroHex', ficheiro);
  await page.waitForFunction(() => /Abri o projeto|não|Não/.test(document.getElementById('abrirTexto').textContent));
  const depois = await page.evaluate(() => { const ws = Faisca.app.ws; return { n: ws.getAllBlocks(false).length, py: Faisca.paraPython(ws), aviso: document.getElementById('abrirTexto').textContent }; });
  ok(depois.n === antes.n && depois.py === antes.py, `blocos recuperados iguais (${depois.n}/${antes.n} blocos, Python igual) — «${depois.aviso}»`);
  if (process.argv[2]) await page.screenshot({ path: process.argv[2] });

  // 3. o programa aberto corre no micro:bit do ecrã
  await page.waitForTimeout(800);
  await page.evaluate(() => Faisca.app.entrada('botao:A', 'ecra'));
  await page.waitForTimeout(1500);
  const reg = await page.evaluate(() => Faisca.app.registo().map(e => e.dir + ' ' + e.v).join('\n'));
  ok(reg.includes('out numero:7'), 'programa aberto corre (botão A → 7)');

  // 4. guarda-se (localStorage) e o nome do ficheiro passa a ser o nome do próximo .hex
  const guardado = await page.evaluate(() => new Promise(r => setTimeout(() => r(Faisca.app.estado.xml.includes('Olá Messejana')), 400)));
  ok(guardado, 'projeto aberto fica guardado no browser');

  // 5. Desfazer volta ao programa anterior
  await page.click('#btnDesfazerAbrir');
  await page.waitForTimeout(300);
  const desfeito = await page.evaluate(() => Faisca.paraPython(Faisca.app.ws).includes('Image.SAD'));
  ok(desfeito, '«Desfazer» volta ao programa que lá estava');

  // 6. .hex sem blocos (MicroPython só com main.py, como os do Nico antigo) → mensagem clara
  const semBlocos = await page.evaluate(async () => {
    const f = new MicrobitFs.MicropythonFsHex(FAISCA_MICROPYTHON); f.write('main.py', 'from microbit import *\ndisplay.show(Image.HEART)\n');
    try { await Faisca.lerHex(f.getIntelHex()); return 'abriu?!'; } catch (e) { return e.message; }
  });
  ok(/versão antiga/.test(semBlocos), '.hex sem blocos → «' + semBlocos + '»');

  // 7. ficheiro que não é .hex / .hex sem MicroPython (ex.: MakeCode)
  const lixo = await page.evaluate(async () => { try { await Faisca.lerHex('olá'); return 'abriu?!'; } catch (e) { return e.message; } });
  ok(/não é um programa/.test(lixo), 'texto qualquer → «' + lixo + '»');
  const outro = await page.evaluate(async () => { try { await Faisca.lerHex(':020000040000FA\n:10000000000000000000000000000000000000F0\n:00000001FF\n'); return 'abriu?!'; } catch (e) { return e.message; } });
  ok(/não foi feito no Nico/.test(outro), '.hex de outro editor → «' + outro + '»');

  // 8. botão escondido fora do modo livre
  await page.goto('file://' + path.join(__dirname, '..', 'index.html') + '?m=primeiros-passos&a=nico');
  await page.waitForFunction(() => window.Faisca && Faisca.app);
  ok(!(await page.isVisible('#btnAbrirHex')), 'botão escondido nas missões com desafios');

  if (erros.length) { mal++; console.log('erros na página:', erros); }
  await browser.close();
  process.exit(mal ? 1 : 0);
})();
