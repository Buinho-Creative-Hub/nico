/* Teste do IC Sensing Lab sem internet (service worker): abre uma vez com rede, corta a rede e confirma que tudo funciona.
 *   NODE_PATH=<playwright-core> CHROMIUM=<chromium> node testes/offline.js
 */
'use strict';
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright-core');
const PORTA = 8765, BASE = `http://localhost:${PORTA}/`;
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORTA)], { cwd: path.join(__dirname, '..'), stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const erros = []; page.on('pageerror', e => erros.push(String(e)));
  let mal = 0;
  const ok = (c, t) => { console.log((c ? 'OK   ' : 'FALHA') + ' ' + t); if (!c) mal++; };
  await page.goto(BASE + 'index.html?a=lio');
  const n = await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    for (let i = 0; i < 100; i++) {
      const ks = await caches.keys(); const c = ks.length ? await caches.open(ks[0]) : null;
      const k = c ? (await c.keys()).length : 0; if (k > 80) return k; await new Promise(r => setTimeout(r, 200));
    }
    return -1;
  });
  ok(n > 80, `ficheiros guardados no browser: ${n}`);
  await ctx.setOffline(true);
  await page.goto(BASE + 'index.html?a=lio');
  ok(await page.isVisible('.cartao-livre'), 'sem rede: ecrã inicial com as missões');
  await page.goto(BASE + 'index.html?m=livre&a=lio');
  await page.waitForFunction(() => window.Faisca && Faisca.app, null, { timeout: 15000 });
  const hex = await page.evaluate(async () => { try { return (await Faisca.gerarHex(Faisca.app.ws)).length; } catch (e) { return String(e); } });
  ok(typeof hex === 'number' && hex > 100000, 'sem rede: modo livre abre e gera o .hex (' + hex + ')');
  await page.goto(BASE + 'index.html?l=sr&m=estacao&a=mo');
  await page.waitForFunction(() => window.Faisca && Faisca.app, null, { timeout: 15000 });
  ok(true, 'sem rede: missão Estação (sérvio) com a Mo abre');
  if (erros.length) { mal++; console.log('erros:', erros); }
  await browser.close(); srv.kill();
  process.exit(mal ? 1 : 0);
})();
