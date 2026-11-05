/* Nico · Percurso 4.º ano — jogos de Português (capítulos do concelho de Aljustrel, Nov 2026).
 *
 *   ditado     o Nico dita frases em voz alta (voz pt-PT do computador) e a criança escreve; no fim (ou a cada frase,
 *              à escolha) as diferenças ficam assinaladas por tipo: acento, maiúscula, pontuação, palavra trocada,
 *              palavra em falta ou a mais. Depois pode corrigir uma vez.
 *              { frases: [...], modo: 'fim' | 'cada' }
 *   radio      compreensão do oral (como a parte com auscultadores da prova de Português): ouvir um texto que não
 *              aparece no ecrã e responder. { programa, texto: [parágrafos], ouvirMax: 2, perguntas: [{ p, opcoes, certa }] }
 *   sublinhar  ler um texto e clicar na frase que prova a resposta. { texto: { titulo, paragrafos }, perguntas: [{ p, certa: '2.1' }] }
 *   frases     a fábrica de frases em blocos (cores por classe de palavra, como as gavetas do MakeCode):
 *              modo 'classes' (dizer a classe de cada palavra) · 'sujeito' (separar sujeito e predicado) ·
 *              'construir' (encaixar palavras num molde de classes)
 *   jornal     escrita com plano → texto → revisão por lista → publicação no Jornal de Messejana.
 *
 *   Registados em F.PC.oficina (montar(el, at, api) → { fechar, resolver }). Funções puras em F.PC.lingua.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const h = (...a) => F.PC.itens.h(...a);
  const som = n => { if (F.Som) F.Som.tocar(n); };
  const seg = t0 => Math.round((performance.now() - t0) / 100) / 10;
  const reg = (n, fn) => F.PC.oficina.registar(n, fn);

  // ------------------------------------------------------------ voz
  const temVoz = () => 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  function falar(partes, ritmo, fim) {
    if (!temVoz()) { if (fim) fim(); return false; }
    speechSynthesis.cancel();
    const lista = [].concat(partes).filter(Boolean);
    const vozes = speechSynthesis.getVoices();
    const v = vozes.find(x => /pt-PT/i.test(x.lang)) || vozes.find(x => /^pt/i.test(x.lang));
    lista.forEach((t, i) => {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = 'pt-PT'; u.rate = ritmo || 0.9; if (v) u.voice = v;
      if (i === lista.length - 1 && fim) u.onend = fim;
      speechSynthesis.speak(u);
    });
    return true;
  }
  const calar = () => { if (temVoz()) speechSynthesis.cancel(); };

  // ------------------------------------------------------------ comparar um ditado (alinhamento palavra a palavra)
  const semAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const semPont = s => s.replace(/[.,;:!?«»"'()…—–-]/g, '');
  const chave = s => semAcento(semPont(s)).toLowerCase();
  function tipoDif(a, b) {
    if (a === b) return 'ok';
    if (semPont(a) === semPont(b)) return 'pontuacao';
    if (a.toLowerCase() === b.toLowerCase()) return 'maiuscula';
    if (semPont(a).toLowerCase() === semPont(b).toLowerCase()) return semPont(a) === semPont(b) ? 'pontuacao' : 'maiuscula';
    if (chave(a) === chave(b)) return 'acento';
    return 'letra';
  }
  function comparar(certo, escrito) {
    const A = String(certo).normalize('NFC').trim().split(/\s+/).filter(Boolean);
    const B = String(escrito || '').normalize('NFC').trim().split(/\s+/).filter(Boolean);
    const n = A.length, m = B.length, D = [];
    const custo = (a, b) => a === b ? 0 : chave(a) === chave(b) ? 0.4 : 1;
    for (let i = 0; i <= n; i++) { D[i] = []; for (let j = 0; j <= m; j++) D[i][j] = i === 0 ? j : j === 0 ? i : 0; }
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j - 1] + custo(A[i - 1], B[j - 1]), D[i - 1][j] + 1, D[i][j - 1] + 1);
    const out = []; let i = n, j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + custo(A[i - 1], B[j - 1])) { out.unshift({ certo: A[i - 1], escrito: B[j - 1], tipo: tipoDif(A[i - 1], B[j - 1]) }); i--; j--; }
      else if (i > 0 && D[i][j] === D[i - 1][j] + 1) { out.unshift({ certo: A[i - 1], escrito: '', tipo: 'falta' }); i--; }
      else { out.unshift({ certo: '', escrito: B[j - 1], tipo: 'extra' }); j--; }
    }
    return { palavras: out, erros: out.filter(p => p.tipo !== 'ok').length, total: n };
  }
  const NOME_ERRO = { acento: 'acento', maiuscula: 'maiúscula', pontuacao: 'pontuação', letra: 'palavra mal escrita', falta: 'palavra em falta', extra: 'palavra a mais' };
  function pintarComparacao(c) {
    return h('p', { class: 'li-dif' }, c.palavras.map(p => p.tipo === 'ok' ? h('span', { class: 'ok' }, p.certo + ' ')
      : h('span', { class: 'mal ' + p.tipo, title: NOME_ERRO[p.tipo] },
        p.tipo === 'falta' ? h('ins', null, p.certo) : p.tipo === 'extra' ? h('del', null, p.escrito) : [h('del', null, p.escrito), h('ins', null, p.certo)],
        h('sup', null, NOME_ERRO[p.tipo]), ' ')));
  }
  function resumoErros(lista) {
    const c = {}; lista.forEach(x => x.palavras.forEach(p => { if (p.tipo !== 'ok') c[p.tipo] = (c[p.tipo] || 0) + 1; }));
    const t = Object.entries(c).map(([k, v]) => `${v} de ${NOME_ERRO[k]}`);
    return t.length ? 'Erros: ' + t.join(' · ') + '.' : 'Sem erros! ✓';
  }

  // ------------------------------------------------------------ ditado
  reg('ditado', (el, at, api) => {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    let modo = at.modo || 'fim', k = 0, ouvidas = 0, fase = 'escrever';
    const escritos = at.frases.map(() => ''), primeiras = [];
    const corpo = h('div', { class: 'li-ditado' });
    const escolhaModo = h('div', { class: 'li-modo', role: 'radiogroup', 'aria-label': 'Quando corrigir' },
      ['fim', 'cada'].map(m => h('label', null, h('input', { type: 'radio', name: 'modo-' + at.id, value: m, checked: m === modo ? true : null,
        onchange: () => { modo = m; } }), m === 'fim' ? ' Corrigir no fim' : ' Corrigir a cada frase')));
    el.append(h('div', { class: 'pc-enunciado of' }, h('p', { class: 'pe-pergunta' }, at.pergunta || 'Ditado do Nico: ouve cada frase e escreve-a.'),
      h('p', { class: 'pe-instr' }, 'Carrega em 🔊 para ouvir. Podes ouvir as vezes que precisares. Escreve com maiúsculas, acentos e pontuação.'), escolhaModo, corpo));
    const semVoz = !temVoz();
    function ditar(lento) {
      ouvidas++;
      const f = at.frases[k];
      if (!falar(f, lento ? 0.62 : 0.85)) api.dizer('a_pensar', 'Este computador não tem voz. Pede ao professor para ditar a frase ' + (k + 1) + '.');
    }
    function escrever() {
      fase = 'escrever'; corpo.innerHTML = ''; escolhaModo.hidden = k > 0;
      const inp = h('input', { class: 'tc-entrada li-entrada', type: 'text', autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off', 'aria-label': `Frase ${k + 1} do ditado` });
      inp.value = escritos[k];
      const b1 = h('button', { type: 'button', class: 'btn btn-azul' }, '🔊 Ouvir a frase');
      const b2 = h('button', { type: 'button', class: 'btn btn-texto' }, '🐢 Mais devagar');
      const seg = h('button', { type: 'button', class: 'btn btn-escuro' }, k + 1 < at.frases.length ? 'Frase seguinte →' : (modo === 'fim' ? 'Acabei: ver a correção' : 'Ver a correção'));
      b1.onclick = () => { ditar(false); inp.focus(); };
      b2.onclick = () => { ditar(true); inp.focus(); };
      const avancar = () => {
        if (!inp.value.trim()) { api.dizer('curiosa', 'Ainda não escreveste nada. Ouve a frase e escreve-a.'); return; }
        escritos[k] = inp.value; calar();
        if (modo === 'cada') return corrigirUma();
        if (k + 1 < at.frases.length) { k++; escrever(); R.depois(() => ditar(false), 300); } else corrigirTodas();
      };
      seg.onclick = avancar;
      inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); avancar(); } });
      corpo.append(h('div', { class: 'li-frase-num' }, `Frase ${k + 1} de ${at.frases.length}`), h('div', { class: 'li-botoes' }, b1, b2), inp, h('div', { class: 'li-botoes' }, seg));
      if (semVoz) corpo.append(h('p', { class: 'of-estado' }, 'Este computador não tem voz: o professor dita a frase em voz alta.'));
      R.depois(() => inp.focus(), 50);
    }
    // corrigir a cada frase: assinala, deixa emendar uma vez e segue
    function corrigirUma() {
      const c = comparar(at.frases[k], escritos[k]); primeiras[k] = c;
      corpo.innerHTML = '';
      if (!c.erros) { som('encaixe'); corpo.append(h('div', { class: 'li-frase-num' }, `Frase ${k + 1}: sem erros ✓`), pintarComparacao(c)); api.dizer('celebrar', 'Sem erros nenhuns!'); R.depois(proxima, 900); return; }
      const inp = h('input', { class: 'tc-entrada li-entrada', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Corrige a frase' }); inp.value = escritos[k];
      const b = h('button', { type: 'button', class: 'btn btn-azul' }, 'Corrigido → seguinte');
      b.onclick = () => { escritos[k] = inp.value; proxima(); };
      inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); b.click(); } });
      corpo.append(h('div', { class: 'li-frase-num' }, `Frase ${k + 1}: ${c.erros} ${c.erros === 1 ? 'erro' : 'erros'} — vê onde e corrige`), pintarComparacao(c), inp, h('div', { class: 'li-botoes' }, b));
      api.dizer('a_pensar', resumoErros([c]) + ' Corrige na caixa e segue.');
      R.depois(() => inp.focus(), 50);
    }
    function proxima() { if (k + 1 < at.frases.length) { k++; escrever(); R.depois(() => ditar(false), 300); } else fim(); }
    function corrigirTodas() {
      fase = 'corrigir'; corpo.innerHTML = '';
      const cs = at.frases.map((f, i) => comparar(f, escritos[i])); cs.forEach((c, i) => { primeiras[i] = c; });
      const erros = cs.reduce((t, c) => t + c.erros, 0);
      corpo.append(h('div', { class: 'li-frase-num' }, erros ? `O teu ditado tem ${erros} ${erros === 1 ? 'erro' : 'erros'}` : 'Ditado sem erros! ✓'), h('p', { class: 'pe-instr' }, resumoErros(cs)));
      const caixas = [];
      cs.forEach((c, i) => {
        corpo.append(h('div', { class: 'li-num' }, String(i + 1)), pintarComparacao(c));
        if (c.erros) { const inp = h('input', { class: 'tc-entrada li-entrada', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': `Corrige a frase ${i + 1}` }); inp.value = escritos[i]; caixas[i] = inp; corpo.append(inp); }
      });
      const b = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, erros ? 'Já corrigi' : 'Terminar');
      b.onclick = () => { caixas.forEach((c, i) => { if (c) escritos[i] = c.value; }); fim(); };
      corpo.append(h('div', { class: 'li-botoes' }, b));
      api.dizer(erros ? 'a_pensar' : 'celebrar', erros ? 'As palavras com erro estão assinaladas: o que escreveste está riscado e o certo por cima. Corrige nas caixas.' : 'Perfeito! Nem um erro.');
    }
    function fim() {
      calar();
      const finais = at.frases.map((f, i) => comparar(f, escritos[i]));
      const erros1 = primeiras.reduce((t, c) => t + (c ? c.erros : 0), 0), total = finais.reduce((t, c) => t + c.total, 0);
      const erros2 = finais.reduce((t, c) => t + c.erros, 0);
      corpo.innerHTML = '';
      corpo.append(h('div', { class: 'li-frase-num' }, `Ditado terminado: ${erros1} ${erros1 === 1 ? 'erro' : 'erros'} na primeira escrita` + (erros1 ? `, ${erros2} depois de corrigir.` : '.')),
        h('ol', { class: 'li-final' }, at.frases.map(f => h('li', null, f))));
      api.concluir({ ok: true, tempo: seg(t0), falhas: erros1, precisao: total ? Math.round(100 * (total - erros1) / total) : 100, tentativas: erros1 ? 2 : 1,
        valor: JSON.stringify({ escritos, ouvidas, modo }), ouvidas }, erros1 ? 'Os erros ajudam-nos a saber o que treinar. Bom trabalho!' : 'Ditado perfeito! 🐾');
    }
    escrever();
    R.depois(() => api.dizer('boas_vindas', 'Escolhe quando queres corrigir e carrega em 🔊 para ouvires a primeira frase.'), 30);
    return { fechar: () => { R.limpar(); calar(); }, resolver: () => { at.frases.forEach((f, i) => { escritos[i] = f; primeiras[i] = comparar(f, f); }); fim(); } };
  });

  // ------------------------------------------------------------ rádio (compreensão do oral)
  reg('radio', (el, at, api) => {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    const max = at.ouvirMax || 2; let ouvidas = 0, tent = 0;
    const resp = at.perguntas.map(() => null);
    const estado = h('span', { class: 'li-ouvidas' });
    const bOuvir = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, '▶ Ouvir o programa');
    const onda = h('div', { class: 'li-onda', 'aria-hidden': 'true' }, [1, 2, 3, 4, 5, 6, 7].map(() => h('i')));
    const perg = h('ol', { class: 'li-perguntas' });
    const bVer = h('button', { type: 'button', class: 'btn btn-escuro btn-grande' }, 'Verificar as respostas');
    const pintarEstado = () => { estado.textContent = `Ouviste ${ouvidas} de ${max} vezes`; bOuvir.disabled = ouvidas >= max; };
    bOuvir.onclick = () => {
      if (ouvidas >= max) return; ouvidas++; pintarEstado(); onda.classList.add('a-tocar');
      if (!falar([at.programa ? 'Rádio de ' + at.programa + '.' : '', ...at.texto], 0.88, () => onda.classList.remove('a-tocar'))) {
        onda.classList.remove('a-tocar');
        api.dizer('a_pensar', 'Este computador não tem voz. Pede ao professor para ler o texto do rádio em voz alta (está no guia).');
      }
    };
    at.perguntas.forEach((q, i) => {
      const li = h('li', null, h('p', { class: 'pe-pergunta' }, q.p), h('div', { class: 'li-opcoes', role: 'radiogroup' }, q.opcoes.map((o, j) =>
        h('label', null, h('input', { type: 'radio', name: `r-${at.id}-${i}`, value: j, onchange: () => { resp[i] = j; li.classList.remove('certo', 'errado'); } }), ' ', o))));
      perg.append(li);
    });
    bVer.onclick = () => {
      if (resp.some(r => r === null)) { api.dizer('curiosa', 'Ainda há perguntas sem resposta.'); return; }
      tent++;
      const certas = resp.map((r, i) => r === at.perguntas[i].certa);
      [...perg.children].forEach((li, i) => { li.classList.toggle('certo', certas[i]); li.classList.toggle('errado', !certas[i]); });
      if (certas.every(Boolean)) return acabar(true);
      if (tent < 2) {
        if (ouvidas >= max) { ouvidas = max - 1; pintarEstado(); }
        api.dizer('a_pensar', `${certas.filter(c => !c).length} ${certas.filter(c => !c).length === 1 ? 'resposta está' : 'respostas estão'} errada${certas.filter(c => !c).length === 1 ? '' : 's'} (a vermelho). Podes ouvir mais uma vez e corrigir.`);
        return;
      }
      [...perg.children].forEach((li, i) => { if (!certas[i]) li.append(h('div', { class: 'pe-instr' }, 'Resposta certa: ' + at.perguntas[i].opcoes[at.perguntas[i].certa])); });
      acabar(false);
    };
    function acabar(ok) {
      calar(); bVer.disabled = true; bOuvir.disabled = true;
      perg.querySelectorAll('input').forEach(i => { i.disabled = true; });
      el.querySelector('.li-radio').append(h('details', { class: 'li-transcricao' }, h('summary', null, 'Ler o texto que ouviste'), at.texto.map(p => h('p', null, p))));
      api.concluir({ ok, tempo: seg(t0), tentativas: tent, ouvidas }, ok ? 'Bons ouvidos! Percebeste tudo.' : 'Ouvir com atenção treina-se. Lê o texto que ouviste.');
    }
    el.append(h('div', { class: 'pc-enunciado of li-radio' }, h('p', { class: 'pe-pergunta' }, at.pergunta || 'Ouve o programa de rádio e responde às perguntas.'),
      h('p', { class: 'pe-instr' }, `O texto não aparece no ecrã: tens de o ouvir (usa os auscultadores, como na prova). Podes ouvir ${max} vezes. Podes ler as perguntas antes de ouvir.`),
      h('div', { class: 'li-aparelho' }, h('strong', null, '📻 Rádio ' + (at.programa || 'do Nico')), onda, bOuvir, estado), perg, h('div', { class: 'li-botoes' }, bVer)));
    pintarEstado();
    R.depois(() => api.dizer('boas_vindas', 'Primeiro lê as perguntas. Depois carrega em ▶ e ouve com atenção.'), 30);
    return { fechar: () => { R.limpar(); calar(); }, resolver: () => { at.perguntas.forEach((q, i) => { resp[i] = q.certa; }); tent = 0; bVer.onclick(); } };
  });

  // ------------------------------------------------------------ sublinhar a prova no texto
  const frasesDe = p => p.match(/[^.!?]+[.!?»]+["»]?|[^.!?]+$/g).map(s => s.trim()).filter(Boolean);
  reg('sublinhar', (el, at, api) => {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    let q = 0, tent = 0, erros = 0, escolhida = null; const mostradas = [];
    const txt = h('div', { class: 'pd-texto li-sub' }, h('h2', null, at.texto.titulo));
    const spans = {};
    at.texto.paragrafos.forEach((p, i) => {
      const par = h('p', null, h('span', { class: 'pt-linha' }, String(i + 1)));
      frasesDe(p).forEach((f, j) => {
        const id = `${i + 1}.${j + 1}`;
        const s = h('span', { class: 'li-fr', tabindex: '0', role: 'button', 'aria-pressed': 'false' }, f);
        const esc = () => { if (s.classList.contains('fixa')) return; Object.values(spans).forEach(x => { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); }); s.classList.add('sel'); s.setAttribute('aria-pressed', 'true'); escolhida = id; };
        s.addEventListener('click', esc); s.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); esc(); } });
        spans[id] = s; par.append(s, ' ');
      });
      txt.append(par);
    });
    const pq = h('p', { class: 'pe-pergunta' });
    const conta = h('div', { class: 'li-frase-num' });
    const b = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, 'É esta frase');
    const pintar = () => { conta.textContent = `Pergunta ${q + 1} de ${at.perguntas.length}`; pq.textContent = at.perguntas[q].p; escolhida = null; Object.values(spans).forEach(x => x.classList.remove('sel')); tent = 0; };
    b.onclick = () => {
      const P = at.perguntas[q];
      if (!escolhida) { api.dizer('curiosa', 'Clica primeiro numa frase do texto.'); return; }
      tent++;
      if (escolhida === P.certa) { som('encaixe'); spans[escolhida].classList.add('fixa', 'certa'); api.dizer('celebrar', P.porque || 'Isso! É essa a frase que prova.'); return proxima(); }
      erros++;
      if (tent < 2) { api.dizer('a_pensar', P.dica || 'Essa frase fala do assunto, mas prova mesmo a resposta? Procura outra.'); spans[escolhida].classList.add('tentada'); return; }
      mostradas.push(q); spans[P.certa].classList.add('fixa', 'mostrada'); api.dizer('calma', 'A frase certa ficou marcada a verde-claro. Lê-a.'); proxima();
    };
    function proxima() {
      if (q + 1 < at.perguntas.length) { R.depois(() => { q++; pintar(); }, 900); return; }
      b.disabled = true;
      R.depois(() => api.concluir({ ok: mostradas.length === 0, tempo: seg(t0), falhas: erros, tentativas: erros ? 2 : 1 }, mostradas.length ? null : 'Grande leitor! Encontraste todas as provas no texto.'), 700);
    }
    el.append(h('div', { class: 'pc-duplo' }, txt, h('div', { class: 'pd-perg' }, conta, pq, h('p', { class: 'pe-instr' }, 'Clica na frase do texto que prova a resposta (ou usa Tab e Enter).'), b)));
    pintar();
    return { fechar: () => R.limpar(), resolver: () => { at.perguntas.forEach(P => spans[P.certa].classList.add('fixa', 'certa')); q = at.perguntas.length - 1; tent = 0; escolhida = at.perguntas[q].certa; b.onclick(); } };
  });

  // ------------------------------------------------------------ fábrica de frases
  const CLASSES = { nome: 'nome', verbo: 'verbo', adjetivo: 'adjetivo', determinante: 'determinante', pronome: 'pronome', adverbio: 'advérbio', preposicao: 'preposição', quantificador: 'quantificador numeral' };
  reg('frases', (el, at, api) => {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    let tent = 0, erros = 0;
    const caixa = h('div', { class: 'li-fab' });
    const bVer = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, 'Verificar');
    el.append(h('div', { class: 'pc-enunciado of' }, h('p', { class: 'pe-pergunta' }, at.pergunta), caixa, h('div', { class: 'li-botoes' }, bVer)));
    let verificar, resolver;
    if (at.modo === 'classes') {
      // cada palavra marcada tem um seletor de classe; a cor do bloco muda com a classe
      const sel = [];
      at.frases.forEach((fr, fi) => {
        const linha = h('div', { class: 'li-linha' });
        fr.forEach(([w, cls], wi) => {
          if (!cls) { linha.append(h('span', { class: 'li-palavra fixa' }, w)); return; }
          const s = h('select', { 'aria-label': `Classe de «${w}»` }, h('option', { value: '' }, '?'), (at.opcoes || Object.keys(CLASSES)).map(c => h('option', { value: c }, CLASSES[c])));
          const bloco = h('span', { class: 'li-bloco' }, h('b', null, w), s);
          s.addEventListener('change', () => { bloco.dataset.cls = s.value; bloco.classList.remove('certo', 'errado'); });
          sel.push({ s, bloco, cls }); linha.append(bloco);
        });
        caixa.append(linha);
      });
      verificar = () => {
        if (sel.some(x => !x.s.value)) return api.dizer('curiosa', 'Ainda há palavras sem classe (com «?»).');
        tent++; const mal = sel.filter(x => x.s.value !== x.cls);
        sel.forEach(x => { x.bloco.classList.toggle('certo', x.s.value === x.cls); x.bloco.classList.toggle('errado', x.s.value !== x.cls); });
        if (!mal.length) return acabar(true);
        erros += mal.length;
        if (tent < 2) return api.dizer('a_pensar', `${mal.length} ${mal.length === 1 ? 'palavra está' : 'palavras estão'} na classe errada (a vermelho). Um nome diz o que é, um verbo o que se faz, um adjetivo como é.`);
        mal.forEach(x => { x.s.value = x.cls; x.bloco.dataset.cls = x.cls; x.bloco.classList.add('mostrada'); }); acabar(false);
      };
      resolver = () => { sel.forEach(x => { x.s.value = x.cls; x.bloco.dataset.cls = x.cls; }); tent = 0; verificar(); };
    } else if (at.modo === 'sujeito') {
      // clicar no espaço entre palavras onde acaba o sujeito
      const cortes = at.frases.map(() => null), linhas = [];
      at.frases.forEach(([frase, corte], fi) => {
        const pal = frase.split(' '), linha = h('div', { class: 'li-linha li-suj' });
        pal.forEach((w, wi) => {
          linha.append(h('span', { class: 'li-palavra' }, w));
          if (wi < pal.length - 1) {
            const b = h('button', { type: 'button', class: 'li-corte', 'aria-label': `Cortar depois de «${w}»`, title: 'O sujeito acaba aqui' }, '|');
            b.onclick = () => { cortes[fi] = wi + 1; linha.querySelectorAll('.li-corte').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); linha.classList.remove('certo', 'errado'); pintarLinha(fi); };
            linha.append(b);
          }
        });
        linhas.push(linha); caixa.append(linha);
      });
      function pintarLinha(fi) { const ps = linhas[fi].querySelectorAll('.li-palavra'); ps.forEach((p, i) => { p.classList.toggle('suj', cortes[fi] != null && i < cortes[fi]); p.classList.toggle('pred', cortes[fi] != null && i >= cortes[fi]); }); }
      caixa.append(h('p', { class: 'li-legenda' }, h('span', { class: 'li-palavra suj' }, 'sujeito'), ' ', h('span', { class: 'li-palavra pred' }, 'predicado')));
      verificar = () => {
        if (cortes.some(c => c == null)) return api.dizer('curiosa', 'Em cada frase, clica no «|» onde acaba o sujeito.');
        tent++; const mal = at.frases.map(([, c], i) => cortes[i] !== c);
        linhas.forEach((l, i) => { l.classList.toggle('certo', !mal[i]); l.classList.toggle('errado', mal[i]); });
        if (!mal.some(Boolean)) return acabar(true);
        erros += mal.filter(Boolean).length;
        if (tent < 2) return api.dizer('a_pensar', 'Pergunta ao verbo: «quem é que …?». A resposta é o sujeito.');
        at.frases.forEach(([, c], i) => { cortes[i] = c; pintarLinha(i); }); acabar(false);
      };
      resolver = () => { at.frases.forEach(([, c], i) => { cortes[i] = c; pintarLinha(i); }); tent = 0; verificar(); };
    } else {
      // construir: encaixar palavras (blocos de cores por classe) num molde de classes
      const molde = at.molde, cheio = molde.map(() => null);
      const slots = h('div', { class: 'li-linha li-molde' }), banco = h('div', { class: 'li-linha li-banco' });
      const pintar = () => {
        slots.innerHTML = '';
        molde.forEach((cls, i) => {
          const p = cheio[i];
          const b = h('button', { type: 'button', class: 'li-slot' + (p ? ' cheio' : ''), 'data-cls': p ? p[1] : cls, 'aria-label': p ? `${p[0]} (tirar)` : `Encaixe para ${CLASSES[cls]}` },
            p ? p[0] : h('small', null, CLASSES[cls]));
          b.onclick = () => { if (cheio[i]) { cheio[i] = null; pintar(); } };
          slots.append(b);
        });
        slots.append(h('span', { class: 'li-ponto' }, at.pontuacao || '.'));
        banco.innerHTML = '';
        at.pecas.forEach((p, j) => {
          const usada = cheio.includes(p);
          banco.append(h('button', { type: 'button', class: 'li-bloco peca', 'data-cls': p[1], disabled: usada ? true : null, onclick: () => { const i = cheio.indexOf(null); if (i < 0) return; cheio[i] = p; pintar(); } }, h('b', null, p[0]), h('small', null, CLASSES[p[1]])));
        });
      };
      caixa.append(h('p', { class: 'pe-instr' }, 'Clica numa palavra para a encaixar no primeiro lugar vazio. Clica num encaixe cheio para tirar a palavra. Cada encaixe pede uma classe.'), slots, banco);
      pintar();
      verificar = () => {
        if (cheio.includes(null)) return api.dizer('curiosa', 'Ainda há encaixes vazios.');
        tent++;
        const mal = cheio.map((p, i) => p[1] !== molde[i]);
        if (!mal.some(Boolean)) {
          const frase = cheio.map(p => p[0]).join(' '); const f2 = frase[0].toUpperCase() + frase.slice(1) + (at.pontuacao || '.');
          return acabar(true, f2);
        }
        erros++;
        if (tent < 2) return api.dizer('a_pensar', `${mal.filter(Boolean).length} ${mal.filter(Boolean).length === 1 ? 'palavra não encaixa' : 'palavras não encaixam'} na classe pedida. Vê o nome escrito em cada encaixe.`);
        molde.forEach((cls, i) => { cheio[i] = at.pecas.find(p => p[1] === cls && !cheio.slice(0, i).includes(p)); }); pintar(); acabar(false);
      };
      resolver = () => { molde.forEach((cls, i) => { cheio[i] = at.pecas.find(p => p[1] === cls && !cheio.slice(0, i).includes(p)); }); tent = 0; verificar(); };
    }
    function acabar(ok, frase) {
      bVer.disabled = true; caixa.querySelectorAll('select,button').forEach(x => { x.disabled = true; });
      if (frase) caixa.append(h('p', { class: 'li-feita' }, '«' + frase + '»'));
      api.concluir({ ok, tempo: seg(t0), falhas: erros, tentativas: tent, valor: frase || undefined }, ok ? (frase ? 'Que frase! Está bem construída.' : 'Os blocos estão todos no sítio certo!') : null);
    }
    bVer.onclick = () => verificar();
    return { fechar: () => R.limpar(), resolver: () => resolver() };
  });

  // ------------------------------------------------------------ jornal (escrita com plano e revisão)
  reg('jornal', (el, at, api) => {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    let fase = 0; const plano = {}; let titulo = '', texto = '';
    const fases = ['Planear', 'Escrever', 'Rever', 'Publicar'];
    const faseEl = h('div', { class: 'of-fases' }), corpo = h('div');
    el.append(h('div', { class: 'pc-enunciado of' }, h('p', { class: 'pe-pergunta' }, at.pergunta), faseEl, corpo));
    const pal = t => (t.trim().match(/[\p{L}\d]+/gu) || []).length;
    const pintarFases = () => { faseEl.innerHTML = ''; fases.forEach((f, k) => faseEl.append(h('span', { class: k < fase ? 'feita' : k === fase ? 'atual' : '' }, `${k + 1}. ${f}`))); };
    const crit = () => [
      ['Tem título', () => titulo.trim().length >= 3],
      [`Tem pelo menos ${at.min || 40} palavras`, () => pal(texto) >= (at.min || 40)],
      ['Cada frase começa com maiúscula', () => { const fr = texto.trim().split(/(?<=[.!?])\s+/).filter(Boolean); return fr.length > 0 && fr.every(f => /^[«"]?\p{Lu}/u.test(f)); }],
      ['O texto acaba com pontuação', () => /[.!?»]$/.test(texto.trim())],
      ['Usa o que planeaste', () => Object.values(plano).every(v => { const w = (v.match(/[\p{L}\d]{4,}/gu) || [v.trim()])[0]; return !w || texto.toLowerCase().includes(w.toLowerCase()); })],
    ];
    function mostrar() {
      pintarFases(); corpo.innerHTML = '';
      if (fase === 0) {
        corpo.append(h('p', { class: 'pe-instr' }, 'Antes de escrever, planeia. Responde a cada pergunta com poucas palavras.'));
        const ins = at.plano.map(([q, dica]) => { const i = h('input', { class: 'tc-entrada', type: 'text', placeholder: dica || '', 'aria-label': q }); i.value = plano[q] || ''; corpo.append(h('label', { class: 'li-plano' }, h('b', null, q), i)); return [q, i]; });
        corpo.append(h('div', { class: 'li-botoes' }, h('button', { type: 'button', class: 'btn btn-azul', onclick: () => {
          if (ins.some(([, i]) => !i.value.trim())) return api.dizer('curiosa', 'Responde a todas as perguntas do plano.');
          ins.forEach(([q, i]) => { plano[q] = i.value.trim(); }); fase = 1; mostrar();
        } }, 'Plano feito → escrever')));
        R.depois(() => ins[0][1].focus(), 50);
        api.dizer('boas_vindas', 'Os jornalistas fazem sempre um plano: quem, o quê, onde, quando.');
      } else if (fase === 1 || fase === 2) {
        const ti = h('input', { class: 'tc-entrada li-titulo', type: 'text', placeholder: 'Título da notícia', 'aria-label': 'Título' }); ti.value = titulo;
        const ta = h('textarea', { class: 'of-explica li-texto', 'aria-label': 'O teu texto', placeholder: 'Escreve aqui o texto…' }); ta.value = texto;
        const lista = h('ul', { class: 'it-lista' }), conta = h('small', { class: 'li-conta' });
        const pintar = () => { titulo = ti.value; texto = ta.value; conta.textContent = pal(texto) + ' palavras'; if (fase === 2) { lista.innerHTML = ''; crit().forEach(([n, f]) => lista.append(h('li', { class: f() ? 'ok' : '' }, n))); } };
        ti.addEventListener('input', pintar); ta.addEventListener('input', pintar);
        corpo.append(h('div', { class: 'li-plano-mini' }, Object.entries(plano).map(([q, v]) => h('span', null, h('b', null, q), ' ', v))), ti, ta, conta);
        if (fase === 1) {
          corpo.append(h('div', { class: 'li-botoes' }, h('button', { type: 'button', class: 'btn btn-azul', onclick: () => { pintar(); if (pal(texto) < 10) return api.dizer('curiosa', 'Escreve um pouco mais antes de rever.'); fase = 2; mostrar(); } }, 'Escrevi → rever')));
          api.dizer('curiosa', 'Usa o teu plano. Uma ideia em cada frase.');
        } else {
          corpo.append(h('p', { class: 'pe-instr' }, 'Revê com a lista: o que ainda não tem ✓? Podes corrigir o texto aqui mesmo.'), lista,
            h('label', { class: 'of-ajuda' }, h('input', { type: 'checkbox', id: 'li-reli' }), ' Li o texto do princípio ao fim'),
            h('div', { class: 'li-botoes' }, h('button', { type: 'button', class: 'btn btn-azul btn-grande', onclick: () => {
              pintar();
              if (!crit().every(([, f]) => f())) return api.dizer('dica', 'Ainda falta alguma coisa da lista. Vê o que não tem ✓.');
              if (!corpo.querySelector('#li-reli').checked) return api.dizer('dica', 'Um bom jornalista relê sempre antes de publicar.');
              fase = 3; mostrar();
            } }, 'Publicar no jornal')));
          api.dizer('a_pensar', 'Agora és o revisor do jornal. Lê com olhos de detetive!');
        }
        pintar(); R.depois(() => (fase === 1 ? ta : ta).focus(), 50);
      } else {
        corpo.append(h('article', { class: 'li-jornal' }, h('header', null, h('strong', null, at.jornal || 'Jornal de Messejana'), h('small', null, at.data || 'Edição da Mostra de Invenções')),
          h('h2', null, titulo), texto.split(/\n+/).map(p => h('p', null, p))));
        som('sucesso');
        api.concluir({ ok: true, aberta: true, tempo: seg(t0), valor: JSON.stringify({ titulo, texto, plano }) }, 'Publicado! Já está no jornal. 📰');
      }
    }
    mostrar();
    return { fechar: () => R.limpar(), resolver: () => { at.plano.forEach(([q]) => { plano[q] = 'Nico'; }); titulo = 'A Mostra do Nico'; texto = 'O Nico fez uma Mostra em Messejana. '.repeat(10).trim(); fase = 3; mostrar(); } };
  });

  F.PC.lingua = { comparar, frasesDe, falar, temVoz };
})();
