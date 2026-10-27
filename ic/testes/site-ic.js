/* Ensaio da produção: o IC Sensing Lab DENTRO do site do Invisible Cartographies (Flask + lab.py), com a API das turmas.
 *   SITE_APP=<pasta app/ do site do IC> API_PHP=<servidor/api/index.php> ZIP=<ic-lab-*.zip> \
 *   NODE_PATH=<playwright-core> CHROMIUM=<chromium> node testes/site-ic.js
 * Precisa de python3 + Flask e de php (CLI). Copia o site para uma pasta temporária, extrai o zip lá dentro (lab/),
 * arranca o site (passenger_wsgi.application) e a API, e verifica rotas, plataforma, offline e área do professor.
 */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os');
const { spawn, execSync } = require('child_process');
const { chromium } = require('playwright-core');
const SITE = process.env.SITE_APP, PHP = process.env.API_PHP, ZIP = process.env.ZIP;
if (!SITE || !PHP || !ZIP) { console.error('faltam SITE_APP, API_PHP ou ZIP'); process.exit(2); }
const PS = 8871, PA = 8872, WEB = `http://localhost:${PS}`, API = `http://localhost:${PA}/`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'site-ic-'));
const site = path.join(tmp, 'site'), api = path.join(tmp, 'api');
execSync(`cp -a "${SITE}" "${site}" && rm -rf "${site}/instance" && mkdir -p "${api}"`);
execSync(`cd "${site}" && unzip -q "${ZIP}"`);
fs.copyFileSync(PHP, path.join(api, 'index.php'));
fs.writeFileSync(path.join(api, 'config_local.php'), `<?php return ['admin_password'=>'inicial123','admin_nome'=>'Carlos','db_path'=>'${api}/t.sqlite','origens'=>['${WEB}']];`);
const mail = path.join(tmp, 'mail.txt');
const correio = path.join(tmp, 'correio.sh');
fs.writeFileSync(correio, `#!/bin/sh\ncat >> "${mail}"\necho "-----" >> "${mail}"\n`); fs.chmodSync(correio, 0o755);
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const flask = spawn('python3', ['-c', `import sys; sys.path.insert(0, '${site}'); import os; os.chdir('${site}'); from passenger_wsgi import application as a; a.run(port=${PS})`], { stdio: 'ignore' });
  const php = spawn('php', ['-d', `sendmail_path=${correio}`, '-S', 'localhost:' + PA], { cwd: api, stdio: 'ignore' });
  await sleep(2500);
  let mal = 0; const ok = (c, t) => { console.log((c ? 'OK   ' : 'FALHA') + ' ' + t); if (!c) mal++; };
  const get = async (u, o) => fetch(WEB + u, Object.assign({ redirect: 'manual' }, o));

  // rotas
  let r = await get('/lab'); ok(r.status === 301 && r.headers.get('location').endsWith('/lab/'), '/lab → /lab/');
  r = await get('/sr/lab'); ok(r.status === 302 && r.headers.get('location').endsWith('/lab/?l=sr'), '/sr/lab → /lab/?l=sr');
  r = await get('/lab/'); ok(r.status === 200 && (await r.text()).includes('id="listaMissoes"'), '/lab/ serve a plataforma');
  r = await get('/lab/VERSAO.txt'); ok(r.status === 200 && /IC Sensing Lab/.test(await r.text()), '/lab/VERSAO.txt');
  r = await get('/lab/manifest.webmanifest'); ok(/manifest\+json/.test(r.headers.get('content-type')), 'manifest com o tipo certo');
  r = await get('/lab/sw.js'); ok(/javascript/.test(r.headers.get('content-type')) && r.headers.get('cache-control') === 'no-cache', 'sw.js sem cache');
  r = await get('/lab/../app.py'); ok(r.status === 404, 'não sai da pasta lab/');
  r = await get('/lab/testes/testar.js'); ok(r.status === 404, 'testes não vão para a produção');
  r = await get('/'); ok(r.status === 200, 'o site continua a responder (/)');
  r = await get('/pt/resources'); ok(r.status === 200, 'o site continua a responder (/pt/resources)');

  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const novo = async () => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(a => { try { localStorage.setItem('nico.api', a); } catch (e) {} }, API);
    const p = await ctx.newPage(); p.on('pageerror', e => { console.log('erro na página:', String(e)); mal++; });
    return [ctx, p];
  };
  // plataforma: início em sérvio, missão, offline
  const [c1, p1] = await novo();
  await p1.goto(WEB + '/sr/lab'); await p1.waitForSelector('.cartao-missao, .missao, #listaMissoes button', { timeout: 10000 });
  ok(await p1.evaluate(() => Faisca.LANG === 'sr' && document.querySelectorAll('#listaMissoes > *').length >= 7), 'início em sérvio com as 7 missões');
  ok(await p1.evaluate(() => document.getElementById('linkSiteIC').href === 'https://invisiblecartographies.eu/sr/'), 'logótipo leva ao site (sr)');
  await p1.goto(WEB + '/lab/?m=mapa&a=mo'); await p1.waitForFunction(() => window.Faisca && Faisca.app, null, { timeout: 10000 });
  ok(true, 'missão 6 abre');
  await p1.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 }).catch(() => {});
  await p1.reload(); await sleep(800);
  const sw = await p1.evaluate(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller));
  ok(sw, 'service worker ativo em /lab/');
  if (sw) { await c1.setOffline(true); await p1.goto(WEB + '/lab/?m=ouvir&a=lio'); await p1.waitForFunction(() => window.Faisca && Faisca.app, null, { timeout: 10000 }); ok(true, 'sem rede: missão 1 abre'); await c1.setOffline(false); }

  // área do professor: conta nova criada pelo admin → email do IC na língua; cartão com o endereço do site
  const [c2, p2] = await novo();
  await p2.goto(WEB + '/lab/professor.html?l=es');
  await p2.fill('input[type=email]', 'info@buinho.pt'); await p2.fill('input[type=password]', 'inicial123'); await p2.click('button[type=submit]');
  await p2.waitForSelector('input[autocomplete=new-password]');
  const pws = await p2.$$('input[type=password]'); await pws[0].fill('novaPass123'); await pws[1].fill('novaPass123'); await p2.click('button[type=submit]');
  await p2.waitForSelector('.prof-linha');
  await p2.evaluate(() => [...document.querySelectorAll('.prof-quem button')][0].click());
  await p2.waitForSelector('.prof-linha input[type=email]');
  const ins = await p2.$$('.prof-linha input'); await ins[0].fill('Jelena'); await ins[1].fill('jelena@skola.rs'); await p2.click('.prof-linha button[type=submit]');
  await p2.waitForSelector('.prof-aviso.ok');
  await sleep(500);
  const m = fs.existsSync(mail) ? fs.readFileSync(mail, 'utf8') : '';
  ok(/Laboratorio sensorial/.test(m) && m.includes('https://invisiblecartographies.eu/lab/professor.html') && !/Nico/.test(m), 'email da conta nova: IC, em espanhol, com o endereço do site');
  // turma + aluno + cartões
  await p2.evaluate(() => [...document.querySelectorAll('.btn-texto')].find(b => b.textContent.includes('←')).click());
  await p2.waitForSelector('.prof-linha input');
  await p2.fill('.prof-linha input', '5/2 – Beograd'); await p2.click('.prof-linha button[type=submit]');
  await p2.waitForSelector('.prof-codigo.grande');
  await p2.fill('.prof-juntar textarea', 'Ana\nLuka'); await p2.click('.prof-juntar button[type=submit]');
  await p2.waitForSelector('.prof-tabela td.prof-aluno');
  await p2.evaluate(() => { window.print = () => {}; });
  await p2.click('.prof-acoes .btn-escuro'); await sleep(400);
  const pe = await p2.evaluate(() => document.querySelector('.ca-pe').textContent);
  ok(pe.includes('localhost:' + 8871 + '/lab'), 'cartão do aluno com o endereço onde a plataforma está («' + pe.trim() + '»)');

  // aluno entra na turma a partir do site
  const codigo = (await p2.textContent('.prof-codigo.grande')).trim();
  const [c3, p3] = await novo();
  await p3.goto(WEB + '/lab/?l=en'); await p3.waitForSelector('.turma-entrar', { timeout: 8000 });
  ok(true, 'botão «Join my class» aparece (CORS com a API)');
  await p3.click('.turma-entrar'); await p3.fill('.turma-codigo', codigo); await p3.click('.turma-form button');
  await p3.waitForSelector('.turma-nome'); ok((await p3.$$('.turma-nome')).length === 2, 'aluno vê os nomes da turma');

  await browser.close(); flask.kill(); php.kill();
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
