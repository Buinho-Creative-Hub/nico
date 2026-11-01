/* Nico · Percurso 4.º ano — testes automáticos (Chromium sem janela).
 *
 *   node testes/percurso.js [pasta-para-capturas]
 *
 * 1. Conteúdo: cada caminho resolve-se com a solução (3 estrelas) e não com o programa inicial; cada item aceita a
 *    resposta certa e recusa uma errada; ids únicos; palavras/etiquetas existem.
 * 2. Ecrã: mapa, sessão 1 de ponta a ponta (bolotas, teclado, programar, perguntas com arrastar e ordenar),
 *    prova-ensaio (navegar, marcar, entregar), e o cartão no ecrã inicial do Nico.
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
  const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const erros = [];
  pg.on('pageerror', e => erros.push(e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_FILE|nico-api/.test(m.text())) erros.push(m.text()); });
  const foto = async nome => { if (CAP) await pg.screenshot({ path: path.join(CAP, nome + '.png') }); };

  // ------------------------------------------------------------ 1. conteúdo
  console.log('Conteúdo');
  await pg.goto(url('percurso.html'));
  await pg.waitForSelector('.pc-sessao');
  const r = await pg.evaluate(() => {
    const F = window.Faisca, X = F.MISSOES['percurso-4'], out = [];
    const ids = new Set(), dup = [];
    const todos = [...X.sessoes.flatMap(s => s.estacoes.flatMap(e => e.atividades.map(a => [a, e]))), ...X.prova.itens.map(a => [a, null])];
    const certo = it => ({
      escolha: () => it.certa, varias: () => it.certas, vf: () => it.afirmacoes.map(a => a[1]), ordenar: () => it.itens.map((_, i) => i),
      arrastar: () => it.linhas ? it.linhas.map(l => l[1]) : it.certas, curta: () => it.numero != null ? String(it.numero).replace('.', ',') : it.aceitar[0],
      palavras: () => it.certas, extensa: () => 'O Nico gosta muito de ler textos sobre o montado e sobre Lisboa no norte, a água, o sobreiro e a cortiça do Alentejo.',
    })[it.tipo]();
    const errado = it => ({
      escolha: () => (it.certa + 1) % it.opcoes.length, varias: () => [it.certas[0]], vf: () => it.afirmacoes.map(a => !a[1]),
      ordenar: () => it.itens.map((_, i) => i).reverse(), arrastar: () => (it.linhas ? it.linhas.map(l => l[1]) : it.certas).slice().reverse(),
      curta: () => '999999', palavras: () => [], extensa: () => 'curto',
    })[it.tipo]();
    for (const [a, e] of todos) {
      if (ids.has(a.id)) dup.push(a.id); ids.add(a.id);
      if (a.tipo === 'caminho') {
        const s = F.PC.caminho.correr(a, F.PC.caminho.xml(a.solucao));
        const i = F.PC.caminho.correr(a, F.PC.caminho.xml(a.inicial || []));
        out.push([a.id, s.ok && s.estrelas === 3 && !i.ok, `solução ${s.ok ? 'ok' : JSON.stringify(s.erro) + ' faltam ' + s.faltam + ' meta ' + s.naMeta} · ${s.blocos} blocos (máx ${a.maxBlocos}) · inicial falha: ${!i.ok}`]);
      } else if (F.PC.rt.tipos.includes(a.tipo)) {
        out.push([a.id, true, a.tipo]);
      } else if (F.PC.jogos.tipos.includes(a.tipo)) {
        const n = t => Number(String(t).replace(/[\s€]/g, '').replace(',', '.'));
        let bom = true, m = a.tipo;
        if (a.tipo === 'plataforma') { bom = a.fichas.some(f => f[1]) && a.fichas.some(f => !f[1]); m += ` ${a.fichas.filter(f => f[1]).length} certas / ${a.fichas.length}`; }
        if (a.tipo === 'ligar' && a.modo === 'sequencia') { const v = a.valores.map(n); bom = v.every((x, i) => !i || x > v[i - 1]); m += ' por ordem crescente: ' + bom; }
        if (a.tipo === 'ligar' && a.modo === 'pares') bom = new Set(a.pares.map(p => p[0])).size === a.pares.length;
        if (a.tipo === 'memoria') bom = new Set(a.pares.flat()).size === a.pares.length * 2;
        if (a.tipo === 'apanhar') bom = a.certos.length > 0 && a.errados.every(e => !a.certos.includes(e));
        if (a.tipo === 'rebentar') bom = new Set(a.palavras).size === a.palavras.length;
        out.push([a.id, bom, m]);
      } else {
        const c = F.PC.itens.corrigir(a, certo(a)), w = F.PC.itens.corrigir(a, errado(a));
        let extra = '';
        if (a.tipo === 'palavras') { const t = a.texto.match(/[\wÀ-ÿ'’-]+/g); extra = a.certas.every(x => t.includes(x)) ? '' : ' PALAVRA EM FALTA'; }
        if (a.tipo === 'arrastar') { const c2 = a.linhas ? a.linhas.map(l => l[1]) : a.certas; extra = new Set(c2).size === c2.length ? '' : ' ETIQUETAS REPETIDAS'; }
        if (a.tipo === 'escolha' && !(a.certa >= 0 && a.certa < a.opcoes.length)) extra = ' CERTA FORA';
        out.push([a.id, c && !w && !extra, `${a.tipo} certo:${c} errado-recusado:${!w}${extra}`]);
      }
    }
    return { out, dup, n: todos.length };
  });
  r.out.forEach(([id, b, m]) => ok(b, `${id} — ${m}`));
  ok(r.dup.length === 0, `ids únicos (${r.n} atividades)` + (r.dup.length ? ': ' + r.dup.join(',') : ''));

  // ------------------------------------------------------------ 2. ecrã: mapa
  console.log('Mapa');
  ok(await pg.locator('.pc-sessao').count() === 7 && await pg.locator('.pc-trilho .tr-no').count() === 7, '6 sessões + prova-ensaio no mapa e no trilho');
  await foto('01-mapa');

  // ------------------------------------------------------------ sessão 1
  console.log('Sessão 1');
  await pg.locator('.pc-sessao').first().click();
  await pg.waitForSelector('.rt-alvo');
  await foto('02-alvos');
  for (let i = 0; i < 12; i++) { await pg.locator('.rt-alvo').click(); }
  await pg.waitForSelector('#btnSeguinte:not([hidden])');
  ok(true, 'bolotas: 12 cliques concluem a atividade');
  await pg.click('#btnSeguinte');
  await pg.waitForSelector('.tc-entrada');
  await foto('03-teclado');
  const linhas = await pg.evaluate(() => window.Faisca.MISSOES['percurso-4'].sessoes[0].estacoes[0].atividades[1].linhas);
  await pg.click('.tc-entrada');
  for (const l of linhas) { await pg.keyboard.type(l, { delay: 5 }); await pg.waitForTimeout(30); }
  await pg.waitForSelector('#btnSeguinte:not([hidden])');
  ok(true, 'teclado: escrever as linhas conclui a atividade');
  await pg.click('#btnSeguinte');
  // rebentar balões: escrever a palavra de cada balão que aparece
  await pg.waitForSelector('.jg-baloes');
  for (let k = 0; k < 40 && !(await pg.locator('#btnSeguinte:not([hidden])').count()); k++) {
    const b = await pg.$$eval('.jg-balao:not(.pum)', l => l.map(x => x.textContent));
    if (b.length) { await pg.click('.tc-entrada'); await pg.keyboard.type(b[0], { delay: 10 }); if (k === 1) await foto('03b-baloes'); }
    else await pg.waitForTimeout(500);
  }
  ok(await pg.locator('#btnSeguinte:not([hidden])').count() === 1, 'balões: escrever as palavras rebenta-os todos');
  await pg.click('#btnSeguinte');            // janela: fim da estação
  await pg.waitForSelector('#janela:not([hidden])');
  await pg.click('#janelaBotoes .btn');
  await pg.waitForSelector('.cm-grelha svg');
  await pg.waitForTimeout(300);
  await foto('04-caminho');
  // caminho: carregar a solução no espaço de blocos e correr
  for (let k = 0; k < 3; k++) {
    await pg.evaluate(() => {
      const F = window.Faisca, a = F.PC.app.atual(), X = F.MISSOES['percurso-4'];
      const at = document.title && X.sessoes[0].estacoes[1].atividades.find(x => x.titulo === document.querySelector('#atTitulo').textContent);
      a.ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(F.PC.caminho.xml(at.solucao)), a.ws);
    });
    await pg.waitForTimeout(100);
    await pg.click('.cm-comandos .btn-azul');
    await pg.waitForSelector('#btnSeguinte:not([hidden])', { timeout: 15000 });
    if (k === 2) await foto('05-caminho-feito');
    ok(true, 'caminho ' + (k + 1) + ' resolvido no ecrã');
    await pg.click('#btnSeguinte');
  }
  await pg.waitForSelector('#janela:not([hidden])'); await pg.click('#janelaBotoes .btn');
  // Matemática: m1 escolha (errar uma vez, depois acertar)
  await pg.waitForSelector('.it-opcao');
  await pg.locator('.it-opcao').nth(1).click(); await pg.click('#btnVerificar');
  ok((await pg.textContent('#atMsg')).includes('mais uma tentativa'), 'escolha: 1.ª tentativa errada dá segunda oportunidade');
  await pg.locator('.it-opcao').nth(0).click(); await pg.click('#btnVerificar');
  await pg.waitForSelector('#btnSeguinte:not([hidden])');
  ok((await pg.textContent('#atMsg')).includes('Certo'), 'escolha: certa à 2.ª');
  await pg.click('#btnSeguinte');
  // m2 curta
  await pg.fill('.it-curta input', '104 060'); await pg.click('#btnVerificar');
  ok((await pg.textContent('#atMsg')).includes('Certo'), 'curta: aceita «104 060»');
  await pg.click('#btnSeguinte');
  // ligar pontos: arrastar do ponto atual até ao seguinte
  await pg.waitForSelector('.jg-ligar');
  const nPontos = await pg.locator('.jg-ponto').count();
  for (let k = 1; k < nPontos; k++) {
    const a = await pg.locator('.jg-ponto').nth(k - 1).locator('circle').boundingBox(), b = await pg.locator('.jg-ponto').nth(k).locator('circle').boundingBox();
    await pg.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await pg.mouse.down();
    await pg.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); await pg.mouse.up();
  }
  await pg.waitForSelector('#btnSeguinte:not([hidden])');
  await foto('06-ligar');
  ok(true, 'ligar pontos: arrastar linhas pela ordem revela o desenho');
  await pg.click('#btnSeguinte');
  // plataforma: o Nico anda com as setas e salta com o espaço
  await pg.waitForSelector('.jg canvas');
  const x0 = await pg.evaluate(() => window.Faisca.PC.app.atual().estado().x);
  await pg.keyboard.down('ArrowRight'); await pg.waitForTimeout(500); await pg.keyboard.press(' '); await pg.waitForTimeout(400); await pg.keyboard.up('ArrowRight');
  const e1 = await pg.evaluate(() => window.Faisca.PC.app.atual().estado());
  await foto('06b-plataforma');
  ok(e1.x > x0 + 60, `plataforma: as setas mexem o Nico (${Math.round(x0)} → ${Math.round(e1.x)})`);
  await pg.evaluate(() => window.Faisca.PC.app.atual().resolver());
  await pg.waitForSelector('#btnSeguinte:not([hidden])');
  ok(true, 'plataforma: apanhar as certas e chegar à bandeira conclui');
  await pg.click('#btnSeguinte');
  // m4 escolha
  await pg.locator('.it-opcao').nth(2).click(); await pg.click('#btnVerificar'); await pg.click('#btnSeguinte');
  // m5 arrastar etiquetas para os espaços
  const certas = ['30 000', '8 000', '500'];
  for (let k = 0; k < 3; k++) {
    const e = pg.locator('.it-banco .it-etiq', { hasText: new RegExp('^' + certas[k] + '$') });
    const a = await e.boundingBox(), b = await pg.locator('.it-buraco').nth(k).boundingBox();
    await pg.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await pg.mouse.down();
    await pg.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 }); await pg.mouse.up();
  }
  await foto('07-arrastar');
  await pg.click('#btnVerificar');
  ok((await pg.textContent('#atMsg')).includes('Certo'), 'arrastar: etiquetas arrastadas para os espaços');
  await pg.click('#btnSeguinte');
  // m6 curta errada duas vezes → mostra a resposta certa
  await pg.fill('.it-curta input', '4700'); await pg.click('#btnVerificar');
  await pg.fill('.it-curta input', '5000'); await pg.click('#btnVerificar');
  ok(await pg.locator('.it-explica:not([hidden])').count() === 1, 'curta: à 2.ª errada mostra a resposta certa');
  await pg.click('#btnSeguinte');
  await pg.waitForSelector('#janela:not([hidden])'); await pg.click('#janelaBotoes .btn');
  // Português: texto ao lado + vf + palavras + extensa
  await pg.waitForSelector('.pd-texto');
  await pg.locator('.it-opcao').nth(2).click(); await foto('08-portugues'); await pg.click('#btnVerificar'); await pg.click('#btnSeguinte');
  for (const [k, v] of [[0, 'V'], [1, 'F'], [2, 'V'], [3, 'F']]) await pg.locator('.it-vf tbody tr').nth(k).locator('button', { hasText: v }).click();
  await pg.click('#btnVerificar'); ok((await pg.textContent('#atMsg')).includes('Certo'), 'verdadeiro/falso'); await pg.click('#btnSeguinte');
  await pg.locator('.it-palavra', { hasText: /^Rui$/ }).click(); await pg.locator('.it-palavra', { hasText: /^Messejana$/ }).click();
  await pg.click('#btnVerificar'); ok((await pg.textContent('#atMsg')).includes('Certo'), 'clicar nas palavras'); await pg.click('#btnSeguinte');
  // arrastar com cliques (alternativa ao arrastar)
  for (const [k, t] of [[0, 'oeste'], [1, 'agulha'], [2, 'norte']]) { await pg.locator('.it-banco .it-etiq', { hasText: new RegExp('^' + t + '$') }).click(); await pg.locator('.it-buraco').nth(k).click(); }
  const nosBuracos = await pg.$$eval('.it-buraco', b => b.map(x => x.textContent).join('|'));
  await pg.click('#btnVerificar'); ok((await pg.textContent('#atMsg')).includes('Certo'), 'arrastar com cliques (escolher etiqueta + espaço): ' + nosBuracos); await pg.click('#btnSeguinte');
  await pg.fill('.it-extensa textarea', 'Aponta o braço direito para onde o Sol nasce. Assim ficas virado para norte e já sabes o caminho.');
  await foto('09-extensa');
  await pg.click('#btnVerificar'); ok((await pg.textContent('#atMsg')).includes('guardado'), 'texto escrito guardado');
  await pg.click('#btnSeguinte');
  await pg.waitForSelector('#janela:not([hidden])');
  ok((await pg.textContent('#janelaTitulo')).includes('Sessão terminada'), 'fim da sessão');
  await foto('10-fim-sessao');
  const prog = await pg.evaluate(() => window.Faisca.PC.app.progresso());
  ok(prog.feitos === 18 && prog.bolotas > 30, `progresso guardado: ${prog.feitos} atividades feitas na sessão 1 · ${prog.bolotas} bolotas · insígnias ${JSON.stringify(prog.insignias)}`);
  await pg.click('#janelaBotoes .btn');   // voltar ao percurso

  // ------------------------------------------------------------ outras sessões abrem sem erros (cada atividade)
  console.log('Sessões 2–6 (abrir cada atividade)');
  for (let s = 2; s <= 6; s++) {
    await pg.goto(url('percurso.html', '?s=' + s));
    await pg.waitForSelector('#vSessao:not([hidden])');
    const n = await pg.evaluate(k => window.Faisca.MISSOES['percurso-4'].sessoes[k].estacoes.flatMap(e => e.atividades).length, s - 1);
    for (let k = 0; k < n; k++) {
      if (k === 2 || k === 9) await foto(`s${s}-${k}`);
      const jogo = await pg.evaluate(() => { const a = window.Faisca.PC.app.atual(); return !!(a && a.resolver); });
      if (jogo) {
        await pg.waitForTimeout(700);
        await foto(`s${s}-${k}-jogo`);
        await pg.evaluate(() => window.Faisca.PC.app.atual().resolver());
        await pg.waitForTimeout(300);
        ok(await pg.locator('#btnSeguinte:not([hidden])').count() === 1, `sessão ${s}: jogo «${await pg.textContent('#atTitulo')}» conclui`);
      }
      await pg.evaluate(() => window.Faisca.PC.app.seguinte());
      if (await pg.locator('#janela:not([hidden])').count()) await pg.click('#janelaBotoes .btn:last-child');
    }
    ok(true, `sessão ${s}: ${n} atividades abertas`);
  }

  // ------------------------------------------------------------ prova-ensaio
  console.log('Prova-ensaio');
  await pg.goto(url('percurso.html', '?prova=1'));
  await pg.waitForSelector('.pv-nav button');
  ok(await pg.locator('.pv-nav button').count() === 16, '16 questões na navegação');
  await pg.locator('.it-opcao').nth(1).click();
  await foto('11-prova');
  await pg.click('.pv-marcar');
  await pg.locator('.pv-nav button').nth(7).click();
  await pg.fill('.it-curta input', '1623');
  await pg.locator('.pv-nav button').nth(0).click();
  ok(await pg.locator('.it-opcao[aria-checked="true"]').count() === 1, 'a resposta fica guardada ao navegar');
  ok(await pg.locator('.pv-nav button.marcada').count() === 1 && await pg.locator('.pv-nav button.resp').count() === 2, 'marcada para rever + respondidas na navegação');
  await pg.click('text=Entregar a prova');
  await pg.waitForSelector('#janela:not([hidden])');
  ok((await pg.textContent('#janelaTexto')).includes('14 questões'), 'aviso de questões por responder');
  await pg.click('#janelaBotoes .btn-azul');
  await pg.waitForSelector('.pv-res');
  ok((await pg.textContent('.pv-res h1')).startsWith('2 de 15'), 'resultado: ' + await pg.textContent('.pv-res h1'));
  await foto('12-prova-resultado');

  // ------------------------------------------------------------ ecrã inicial do Nico
  console.log('Ecrã inicial');
  await pg.goto(url('index.html'));
  await pg.waitForSelector('.cartao-missao');
  const card = pg.locator('.cartao-missao', { hasText: 'Percurso 4.º ano' });
  ok(await card.count() === 1, 'cartão «Percurso 4.º ano» no ecrã inicial: ' + (await card.textContent()).replace(/\s+/g, ' ').slice(0, 120));
  await foto('13-inicio');
  await card.click();
  await pg.waitForURL(/percurso\.html/);
  ok(true, 'o cartão abre percurso.html');
  await pg.goto(url('index.html', '?m=percurso-4'));
  await pg.waitForURL(/percurso\.html/);
  ok(true, 'index.html?m=percurso-4 reencaminha');

  // ecrã estreito (tablet)
  await pg.setViewportSize({ width: 820, height: 1100 });
  await pg.goto(url('percurso.html', '?s=2'));
  await pg.waitForSelector('#vSessao:not([hidden])');
  await foto('14-tablet');

  ok(erros.length === 0, 'sem erros na consola' + (erros.length ? ': ' + [...new Set(erros)].slice(0, 5).join(' | ') : ''));
  await br.close();
  console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTudo certo.');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
