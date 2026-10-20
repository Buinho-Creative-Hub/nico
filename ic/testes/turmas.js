/* Teste ponta a ponta das turmas no IC Sensing Lab: API PHP local (a do Nico) + plataforma servida localmente.
 *   LINGUA=en|sr|es|pt (por omissão en). API_PHP=<caminho do index.php da API> (por omissão ../servidor/api/index.php, como no repo nico).
 *   NODE_PATH=<playwright-core> CHROMIUM=<chromium> node testes/turmas.js
 * Precisa de php (CLI). Cria uma base de dados temporária.
 */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os');
const { spawn } = require('child_process');
const { chromium } = require('playwright-core');
const RAIZ = path.join(__dirname, '..');
const PW = 8766, PA = 8791, WEB = `http://localhost:${PW}/`, API = `http://localhost:${PA}/`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nico-api-'));
const L = process.env.LINGUA || 'en';
const PHP = process.env.API_PHP || [path.join(RAIZ, '..', 'servidor/api/index.php'), '/home/claude/nico/servidor/api/index.php'].find(f => fs.existsSync(f));
fs.copyFileSync(PHP, path.join(tmp, 'index.php'));
fs.writeFileSync(path.join(tmp, 'config_local.php'), `<?php return ['admin_password'=>'inicial123','admin_nome'=>'Carlos','db_path'=>'${tmp}/nico.sqlite','origens'=>['${WEB.slice(0, -1)}']];`);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function api(rota, corpo, token) {
  const r = await fetch(API + '?r=' + rota, { method: corpo ? 'POST' : 'GET', headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}), body: corpo ? JSON.stringify(corpo) : undefined });
  return r.json();
}
(async () => {
  const web = spawn('python3', ['-m', 'http.server', String(PW)], { cwd: RAIZ, stdio: 'ignore' });
  const php = spawn('php', ['-S', 'localhost:' + PA], { cwd: tmp, stdio: 'ignore' });
  await sleep(1000);
  let mal = 0; const ok = (c, t) => { console.log((c ? 'OK   ' : 'FALHA') + ' ' + t); if (!c) mal++; };
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const novo = async () => { const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 } }); await ctx.addInitScript(([a, l]) => { try { localStorage.setItem('nico.api', a); localStorage.setItem('iclab.lang', l); } catch (e) {} }, [API, L]); const p = await ctx.newPage(); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) console.log('consola:', m.text()); }); p.on('pageerror', e => { console.log('erro na página:', String(e)); mal++; }); return [ctx, p]; };

  // ---- professor (área do professor, no browser)
  const [cP, pP] = await novo();
  await pP.goto(WEB + 'professor.html');
  await pP.fill('input[type=email]', 'info@buinho.pt'); await pP.fill('input[type=password]', 'inicial123'); await pP.click('button[type=submit]');
  await pP.waitForSelector('input[autocomplete=new-password]');
  ok(true, 'professor: 1.º login obriga a mudar a password');
  const pws = await pP.$$('input[type=password]'); await pws[0].fill('novaPass123'); await pws[1].fill('novaPass123'); await pP.click('button[type=submit]');
  await pP.waitForSelector('.prof-linha');
  ok(await pP.evaluate(() => document.querySelector('h1').textContent === Faisca.s('p_minhas')), 'professor: ecrã das turmas na língua ' + L);
  await pP.fill('.prof-linha input', '5/2 – Beograd'); await pP.click('.prof-linha button[type=submit]');
  await pP.waitForSelector('.prof-codigo.grande');
  const codigo = (await pP.textContent('.prof-codigo.grande')).trim();
  ok(/^[A-Z0-9]{4}$/.test(codigo), 'professor: turma criada com o código ' + codigo);
  await pP.fill('.prof-juntar textarea', 'Maria\nLuka\nAna'); await pP.click('.prof-juntar button[type=submit]');
  await pP.waitForSelector('.prof-tabela td.prof-aluno');
  ok((await pP.$$('.prof-tabela tbody tr')).length === 3, 'professor: 3 alunos juntados (com senha de imagens)');
  await pP.screenshot({ path: path.join(os.tmpdir(), 'ic-prof-' + L + '.png') });
  const tok = JSON.parse(await pP.evaluate(() => localStorage.getItem('iclab.prof.sessao'))).token;
  const turmas = await api('prof/turmas', null, tok);
  const turma = await api('prof/turma&id=' + turmas.turmas[0].id, null, tok);
  const maria = turma.alunos.find(a => a.nome === 'Maria');

  // ---- aluno no computador 1
  const [c1, p1] = await novo();
  await p1.goto(WEB + 'index.html');
  await p1.click('.turma-entrar');
  await p1.fill('.turma-codigo', codigo.toLowerCase()); await p1.click('.turma-form button');
  await p1.click('.turma-nome:has-text("Maria")');
  // senha errada primeiro
  const errada = maria.senha.map(i => (i + 1) % 9);
  for (const i of errada) await p1.click(`.turma-imagem >> nth=${i}`);
  await p1.waitForFunction(() => document.querySelector('.turma-msg').textContent === Faisca.erroTurma('Essa não é a tua senha. Tenta outra vez!'));
  ok(true, 'aluno: senha errada é recusada');
  await sleep(500);
  for (const i of maria.senha) await p1.click(`.turma-imagem >> nth=${i}`);
  await p1.waitForSelector('.turma-chip', { timeout: 8000 });
  ok((await p1.textContent('.turma-chip')).includes('Maria'), 'aluno: entra na turma e aparece «Maria» no topo');
  await p1.screenshot({ path: path.join(os.tmpdir(), 'ic-aluno-' + L + '.png') });
  // progresso numa missão (como se tivesse feito 4 desafios) e programa no modo livre
  await p1.goto(WEB + 'index.html?m=ouvir&a=lio');
  await p1.waitForFunction(() => window.Faisca && Faisca.app);
  await p1.evaluate(() => { const k = Faisca.chaveMissao(Faisca.MISSAO); const e = JSON.parse(localStorage.getItem(k) || '{}'); e.feitos = 4; e.atual = 4; localStorage.setItem(k, JSON.stringify(e)); Faisca.Turma.mudou(k); });
  ok(await p1.evaluate(() => Faisca.chaveMissao(Faisca.MISSAO).startsWith('iclab.aluno.')), 'aluno: o progresso fica numa chave própria do aluno');
  await sleep(2500);
  if (process.env.DEPURAR) { const s = JSON.parse(await p1.evaluate(() => localStorage.getItem('iclab.turma.sessao'))); console.log(JSON.stringify(await api('aluno/progresso', null, s.token)).slice(0, 300)); console.log(await p1.evaluate(() => Object.keys(localStorage).join(' , '))); }
  let t2 = await api('prof/turma&id=' + turma.turma.id, null, tok);
  const r = Object.values(t2.alunos.find(a => a.nome === 'Maria').progresso).find(x => x.missao === 'ouvir');
  ok(r && r.feitos === 4 && r.total >= 7 && r.plataforma === 'ic', 'servidor: progresso da Maria chegou (' + (r ? r.feitos + '/' + r.total : 'nada') + ')');
  // sem internet: fica pendente e segue quando a rede volta
  await c1.setOffline(true);
  await p1.evaluate(() => { const k = Faisca.chaveMissao(Faisca.MISSAO); const e = JSON.parse(localStorage.getItem(k)); e.feitos = 6; localStorage.setItem(k, JSON.stringify(e)); Faisca.Turma.mudou(k); });
  await sleep(2500);
  ok(await p1.evaluate(() => JSON.parse(localStorage.getItem('iclab.turma.pendente')).length === 1), 'sem rede: a alteração fica pendente');
  await c1.setOffline(false);
  await p1.evaluate(() => window.dispatchEvent(new Event('online')));
  await sleep(2000);
  t2 = await api('prof/turma&id=' + turma.turma.id, null, tok);
  ok(Object.values(t2.alunos.find(a => a.nome === 'Maria').progresso).find(x => x.missao === 'ouvir').feitos === 6, 'rede de volta: o pendente chegou ao servidor (6)');
  // sair: o computador fica limpo para o próximo aluno
  await p1.click('.topo .turma-sair');
  await p1.waitForSelector('.turma-entrar');
  const restos = await p1.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('iclab.aluno.') || k.startsWith('iclab.turma.')).length);
  ok(restos === 0, 'sair: não fica nada do aluno no computador');
  const semTurma = await p1.evaluate(() => Faisca.progressoMissao(Faisca.MISSOES['ouvir']));
  ok(semTurma === 0, 'sair: o próximo aluno começa do zero (progresso 0)');

  // ---- a Maria noutro computador: o progresso vem do servidor
  const [c2, p2] = await novo();
  await p2.goto(WEB + 'index.html');
  await p2.click('.turma-entrar'); await p2.fill('.turma-codigo', codigo); await p2.click('.turma-form button');
  await p2.click('.turma-nome:has-text("Maria")');
  for (const i of maria.senha) await p2.click(`.turma-imagem >> nth=${i}`);
  await p2.waitForSelector('.turma-chip', { timeout: 8000 });
  await sleep(800);
  const noOutro = await p2.evaluate(() => Faisca.progressoMissao(Faisca.MISSOES['ouvir']));
  ok(noOutro === 6, 'outro computador: a Maria continua onde ia (' + noOutro + ' desafios)');

  // ---- o que a Maria fizer no Nico (mesma conta) não entra no IC, e vê-se como coluna à parte no professor
  { const s = JSON.parse(await p2.evaluate(() => localStorage.getItem('iclab.turma.sessao')));
    await api('aluno/progresso', { itens: [{ chave: 'faisca.missao.primeiros-passos.v1', dados: { feitos: 3 }, resumo: { feitos: 3, missao: 'primeiros-passos', total: 40 } }] }, s.token);
    await p2.evaluate(() => { sessionStorage.removeItem('iclab.turma.puxado'); return Faisca.Turma.puxar(); });
    ok(await p2.evaluate(() => !Object.keys(localStorage).some(k => k.includes('faisca.missao'))), 'Nico e IC separados: o progresso do Nico não vem para o IC'); }

  // ---- painel do professor mostra o progresso
  await pP.reload(); await pP.waitForSelector('.prof-turma'); await pP.click('.prof-turma'); await pP.waitForSelector('.prof-tabela');
  ok((await pP.textContent('.prof-tabela')).includes('6/'), 'professor: vê 6/… da Maria na missão 1');
  ok(await pP.evaluate(() => [...document.querySelectorAll('.prof-tabela th')].some(th => th.textContent === Faisca.s('p_nico'))), 'professor: o Nico aparece numa coluna à parte');
  await pP.screenshot({ path: path.join(os.tmpdir(), 'ic-prof-prog-' + L + '.png'), fullPage: true });

  await browser.close(); web.kill(); php.kill();
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
