/* Nico · Palco (Missão 0) — testes automáticos (Chromium sem janela).
 *
 *   node testes/palco.js            com as duas mascotes
 *   node testes/palco.js nico       só com o Nico
 *
 * Para cada desafio: a solução certa passa; as erradas não passam e a mascote reconhece a dificuldade certa;
 * a gambiarra da mascote não passa; a ajuda tem 3 níveis. Mais: a página abre sem erros, o ecrã inicial mostra a
 * Missão 0 e index.html?m=palco reencaminha para palco.html. Precisa do playwright-core (NODE_PATH) e do Chromium.
 * Os programas escrevem-se com F.palcoXml (missoes/palco.js): X.prog([X.dizer('nico', 'Olá!'), …]).
 */
'use strict';
const path = require('path');
const { chromium } = require('playwright-core');
const RAIZ = path.resolve(__dirname, '..');
const pagina = (f, q) => 'file://' + path.join(RAIZ, f) + q;

// [solução certa, [[programa errado, regra que a mascote deve reconhecer]…]]
const CASOS = [
  ["X.prog([X.dizer('nico','Olá!',0.5)])",
    [["X.prog([X.dizer('gabi','Olá!',0.5)])", 'ator_errado'], ["'<xml>'+X.comecar()+'</xml>'", 'sem_dizer'], ["'<xml></xml>'", 'sem_comecar']]],
  ["X.prog([X.andar('gabi',300)])",
    [["X.prog([X.andar('gabi',10)])", 'poucos_passos'], ["X.prog([X.andar('nico',300)])", 'anda_outro'], ["X.prog([X.andar('gabi',300,'esquerda')])", 'para_esquerda']]],
  ["X.prog([X.ir('nico','porta')])",
    [["X.prog([X.ir('nico','meio')])", 'sitio_errado'], ["X.prog([X.ir('gabi','porta')])", 'ir_outro']]],
  ["X.prog([X.dizer('nico','Vamos ao FabLab?',0.5), X.pausa(500), X.dizer('gabi','Bora!',0.5)])",
    [["X.prog([X.dizer('nico','Vamos ao FabLab?',0.5), X.dizer('gabi','Bora!',0.5)])", 'sem_pausa'],
     ["X.prog([X.dizer('gabi','Bora!',0.5), X.pausa(500), X.dizer('nico','Vamos?',0.5)])", 'ordem_trocada']]],
  ["X.prog([X.dizer('nico','Consegui!',0.5), X.imagem('nico','festa')])",
    [["X.prog([X.dizer('nico','Consegui!',0.5), X.imagem('nico','calma')])", 'traje_errado'], ["X.prog([X.dizer('nico','Consegui!',0.5), X.imagem('gabi','festa')])", 'imagem_outro']]],
  ["X.prog([X.ir('nico','porta'), X.cenario('fablab')])",
    [["X.prog([X.cenario('fablab'), X.ir('nico','porta')])", 'entra_antes'], ["X.prog([X.ir('nico','porta'), X.cenario('montado')])", 'cenario_errado']]],
  ["X.prog([X.dizer('nico','Sou o Nico!',0.5), X.imagem('nico','festa'), X.dizer('gabi','Sou a Gabi!',0.5), X.imagem('gabi','ola')])",
    [["X.prog([X.dizer('nico','Sou o Nico!',0.5), X.imagem('nico','festa')])", 'falta_fala_gabi'],
     ["X.prog([X.dizer('nico','Sou o Nico!',0.5), X.dizer('gabi','Sou a Gabi!',0.5), X.imagem('gabi','ola')])", 'falta_imagem_nico']]],
  ["X.prog([X.andar('nico',200), X.cenario('montado'), X.andar('nico',150), X.dizer('nico','Olha os sobreiros!',0.5)])",
    [["X.prog([X.andar('nico',200), X.cenario('montado'), X.dizer('nico','Olha!',0.5)])", 'anda_depois'],
     ["X.prog([X.andar('nico',200), X.cenario('horta'), X.andar('nico',100), X.dizer('nico','Olha!',0.5)])", 'sem_montado']]],
  ["X.prog([X.ir('nico','bola'), X.dizer('nico','Encontrei!',0.5)])",
    [["X.prog([X.dizer('nico','Encontrei!',0.5), X.ir('nico','bola')])", 'fala_antes'], ["X.prog([X.ir('nico','direita'), X.dizer('nico','Encontrei!',0.5)])", 'sem_ir_bola']]],
  ["X.prog([X.dizer('nico','Olá!',0.5), X.dizer('gabi','Olá, Nico!',0.5), X.dizer('nico','Vamos brincar?',0.5)])",
    [["X.prog([X.dizer('nico','a',0.5), X.dizer('nico','b',0.5), X.dizer('nico','c',0.5)])", 'sem_vez'], ["X.prog([X.dizer('nico','a',0.5), X.dizer('gabi','b',0.5)])", 'poucas_falas']]],
  ["X.prog([X.dizer('nico','Está a escurecer…',0.5), X.hora('noite'), X.dizer('gabi','Boa noite!',0.5)])",
    [["X.prog([X.dizer('nico','Está a escurecer…',0.5), X.dizer('gabi','Boa noite!',0.5), X.hora('noite')])", 'sem_boa_noite'],
     ["X.prog([X.hora('noite'), X.dizer('gabi','Boa noite!',0.5)])", 'sem_fala_antes']]],
];

(async () => {
  const mascotes = process.argv[2] ? [process.argv[2]] : ['nico', 'gabi'];
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'] });
  let falhas = 0;
  const falhou = m => { falhas++; console.log('  ✗ ' + m); };

  // ecrã inicial e reencaminhamento
  {
    const page = await browser.newPage();
    const erros = []; page.on('pageerror', e => erros.push(String(e)));
    await page.goto(pagina('index.html', ''));
    await page.waitForSelector('.cartao-missao');
    const cartoes = await page.$$eval('.cartao-missao:not(.cartao-livre) strong', l => l.map(x => x.textContent));
    if (cartoes[0] !== 'O palco do Nico e da Gabi') falhou('o primeiro cartão de missão devia ser a Missão 0: ' + cartoes.join(' | '));
    await page.goto(pagina('index.html', '?m=palco&a=gabi'));
    await page.waitForFunction(() => window.Faisca && window.Faisca.app && window.Faisca.app.palco, null, { timeout: 8000 }).catch(() => falhou('index.html?m=palco não abriu o palco'));
    if (!page.url().includes('palco.html')) falhou('não reencaminhou para palco.html: ' + page.url());
    if (erros.length) falhou('erros na página: ' + erros.join(' / '));
    console.log('ecrã inicial e reencaminhamento: ok');
    await page.close();
  }

  for (const a of mascotes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const erros = []; page.on('pageerror', e => erros.push(String(e)));
    await page.goto(pagina('palco.html', '?todos&m=palco&a=' + a));
    await page.waitForFunction(() => window.Faisca && window.Faisca.app);
    const info = await page.evaluate(() => ({ n: Faisca.DESAFIOS.length, livres: Faisca.DESAFIOS.filter(d => d.livre).length, titulos: Faisca.DESAFIOS.map(d => d.titulo) }));
    console.log(`\n${a}: ${info.n} desafios (${info.livres} livre) — ${info.titulos.join(' · ')}`);
    if (info.n - info.livres !== CASOS.length) falhou(`${info.n - info.livres} desafios e ${CASOS.length} casos`);

    const correr = async (i, expr) => {
      await page.evaluate(([i, expr]) => {
        const A = Faisca.app;
        if (A.estado.atual !== i) A.mudarDesafio(i);
        A.ws.clear();
        const xml = new Function('X', 'return ' + expr)(Faisca.palcoXml);
        Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), A.ws);
      }, [i, expr]);
      await page.waitForTimeout(450);                         // espera do editor (250 ms) + análise
      const regra = await page.evaluate(() => Faisca.app.tutor.regraAtiva && Faisca.app.tutor.regraAtiva.id);
      await page.evaluate(() => Faisca.app.comecar());
      await page.waitForFunction(() => !Faisca.app.motor.aCorrer, null, { timeout: 20000 });
      await page.waitForTimeout(150);
      const ok = await page.evaluate(i => !!Faisca.DESAFIOS[i].ok(Faisca.app.registo()), i);
      return { ok, regra };
    };

    for (const [k, [certo, errados]] of CASOS.entries()) {
      const i = k;   // nível 1: os desafios guiados vêm primeiro
      const titulo = info.titulos[i];
      const r = await correr(i, certo);
      if (!r.ok) falhou(`«${titulo}»: a solução certa não passou (${JSON.stringify(await page.evaluate(() => Faisca.app.registo().map(e => e.dir + ' ' + e.v)))})`);
      if (r.regra) falhou(`«${titulo}»: com a solução certa a mascote ainda vê a dificuldade «${r.regra}»`);
      for (const [errado, regra] of errados) {
        const e = await correr(i, errado);
        if (e.ok) falhou(`«${titulo}»: um programa errado passou (${errado})`);
        if (e.regra !== regra) falhou(`«${titulo}»: esperava a dificuldade «${regra}», a mascote viu «${e.regra}» (${errado})`);
      }
      // gambiarra da mascote: não pode passar
      const g = await page.evaluate(i => Faisca.TUTOR.DESAFIOS[i].gambiarra.xml, i);
      const rg = await correr(i, JSON.stringify(g));
      if (rg.ok) falhou(`«${titulo}»: a gambiarra passa sem ser reparada`);
      if (!rg.regra) falhou(`«${titulo}»: a mascote não reconhece nenhuma dificuldade na sua gambiarra`);
      // ajuda em 3 níveis sobre a gambiarra
      const msgs = await page.evaluate(() => { const out = []; const T = Faisca.app.tutor; const d = T.dizer; T.dizer = m => out.push(m); T.pedirAjuda(); T.pedirAjuda(); T.pedirAjuda(); T.dizer = d; return out.map(m => [m.nivel, m.texto]); });
      if (msgs.length !== 3 || msgs[2][0] !== 3 || msgs.some(m => !m[1] || /undefined|\{|\[o\|/.test(m[1]))) falhou(`«${titulo}»: ajuda em 3 níveis falhou ${JSON.stringify(msgs)}`);
      console.log(`  ✓ ${i + 1} ${titulo}`);
    }
    // voz: boas-vindas e sucessos sem marcas por resolver
    const vozes = await page.evaluate(() => Faisca.TUTOR.DESAFIOS.flatMap(t => [t.boasVindas[1], t.sucesso, t.extensao]).map(t => Faisca.voz(t)));
    if (vozes.some(v => v && /\{|\[o\|/.test(v))) falhou('há textos com marcas por resolver');
    if (erros.length) falhou('erros na página: ' + erros.join(' / '));
    if (process.env.FOTOS) {
      await page.evaluate(() => Faisca.app.mudarDesafio(8));
      await correr(8, "X.prog([X.ir('nico','bola'), X.dizer('nico','Encontrei a bola!',3)])").catch(() => {});
      await page.screenshot({ path: path.join(process.env.FOTOS, 'palco-' + a + '.png') });
    }
    await page.close();
  }
  await browser.close();
  console.log(falhas ? `\n${falhas} falha(s)` : '\nTudo certo.');
  process.exit(falhas ? 1 : 0);
})();
