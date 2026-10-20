/* Exporta em PNG os blocos da solução de cada desafio (a partir de testes/casos), em cada língua — para os
 * materiais didáticos (manual, fichas), com o aspeto real da plataforma.
 *   NODE_PATH=<playwright-core> CHROMIUM=<chromium> node ferramentas/exportar-blocos.js <pasta-de-saída> [en,sr,es,pt]
 * Saída: <pasta>/<língua>/<missão>-<n>.png  (n = número do desafio na missão) + indice.json
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const RAIZ = path.resolve(__dirname, '..');
const SAIDA = path.resolve(process.argv[2] || 'blocos-exportados');
const LINGUAS = (process.argv[3] || 'en,sr,es,pt').split(',');

const CASOS = {};
for (const f of fs.readdirSync(path.join(RAIZ, 'testes/casos')).filter(f => f.endsWith('.js'))) {
  const c = require(path.join(RAIZ, 'testes/casos', f));
  CASOS[c.missao] = c.casos;
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const indice = {};
  for (const L of LINGUAS) {
    fs.mkdirSync(path.join(SAIDA, L), { recursive: true });
    for (const [m, casos] of Object.entries(CASOS)) {
      const page = await browser.newPage({ viewport: { width: 1800, height: 1300 }, deviceScaleFactor: 2 });
      await page.goto('file://' + path.join(RAIZ, 'index.html') + `?todos&l=${L}&m=${m}&a=lio`);
      await page.waitForFunction(() => window.Faisca && Faisca.app);
      const desafios = await page.evaluate(() => Faisca.DESAFIOS.map((d, i) => ({ i, livre: !!d.livre, titulo: d.titulo })));
      const comVal = desafios.filter(d => !d.livre);
      await page.evaluate(() => {
        const d = document.createElement('div');
        d.id = 'exportar';
        d.style.cssText = 'position:fixed;left:0;top:0;width:1800px;height:1300px;background:#fff;z-index:99999';
        document.body.appendChild(d);
        window._wsx = Blockly.inject(d, { renderer: 'makecode', theme: 'makecode', media: 'vendor/media/', readOnly: true, scrollbars: false, zoom: { startScale: 1 }, sounds: false });
      });
      for (const [k, c] of casos.entries()) {
        const d = comVal[k]; if (!d) break;
        const caixa = await page.evaluate(x => {
          const w = window._wsx; w.clear();
          Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), w);
          // arrumar em coluna, com espaço, e encostar ao canto
          let y = 20;
          for (const b of w.getTopBlocks(true)) { const p = b.getRelativeToSurfaceXY(); b.moveBy(20 - p.x, y - p.y); y += b.getHeightWidth().height + 24; }
          w.scroll(0, 0);
          const r = w.getCanvas().getBoundingClientRect();
          return { x: r.left, y: r.top, width: r.width, height: r.height };
        }, c.ok);
        await page.waitForTimeout(120);
        const nome = `${m}-${d.i + 1}.png`;
        await page.screenshot({ path: path.join(SAIDA, L, nome), clip: { x: Math.max(0, caixa.x - 12), y: Math.max(0, caixa.y - 12), width: caixa.width + 24, height: caixa.height + 24 } });
        (indice[L] = indice[L] || []).push({ ficheiro: `${L}/${nome}`, missao: m, desafio: d.i + 1, titulo: d.titulo });
      }
      await page.close();
    }
    console.log(L, (indice[L] || []).length, 'imagens');
  }
  fs.writeFileSync(path.join(SAIDA, 'indice.json'), JSON.stringify(indice, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
