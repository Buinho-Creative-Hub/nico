/* Nico · Percurso 4.º ano — mãos no rato e no teclado (motricidade fina para a prova no computador).
 *
 * Tipos (acabam sozinhos quando a criança termina — não há botão «Verificar»):
 *   alvos     clicar em bolotas que aparecem (cada vez mais pequenas)            { n, tamanho: [inicial, final] }
 *   separar   arrastar palavras para os cestos certos                             { cestos: [{ id, nome, cor }], objetos: [[texto, cesto, porque?]] }
 *   duplo     abrir caixas com duplo clique (descobre-se uma palavra)             { palavra }
 *   rolar     descer num texto comprido com a roda do rato e clicar numa palavra  { paragrafos: [...], alvo }
 *   teclado   copiar linhas no teclado (teclado português no ecrã, com acentos)   { linhas: [...] }
 *
 *   F.PC.rt.montar(el, atividade, api)   api = { concluir(resultado), dizer(estado, texto), msg(texto, tipo) }
 */
(function () {
  'use strict';
  const F = window.Faisca;
  F.PC = F.PC || {};
  const h = (...a) => F.PC.itens.h(...a);
  const som = n => { if (F.Som) F.Som.tocar(n); };
  const seg = t0 => Math.round((performance.now() - t0) / 100) / 10;

  const T = {};

  // ------------------------------------------------------------ clicar em alvos
  T.alvos = (el, at, api) => {
    const n = at.n || 10, [t1, t2] = at.tamanho || [90, 46];
    let feitos = 0, falhas = 0, t0 = null, fim = false;
    const info = h('p', { class: 'rt-info' }, 'Bolotas: ', h('b', null, '0'), ' de ' + n, '  ·  Falhaste: ', h('b', null, '0'));
    const zona = h('div', { class: 'rt-zona', 'aria-label': 'Zona de jogo' });
    el.append(h('div', { class: 'pc-enunciado' }, h('p', { class: 'pe-pergunta' }, at.pergunta || `Clica em cada bolota que aparecer. São ${n}.`), info, zona));
    zona.addEventListener('pointerdown', ev => { if (ev.target === zona && t0 && !fim) { falhas++; info.querySelectorAll('b')[1].textContent = falhas; } });
    function nova() {
      const w = zona.clientWidth || 900, hh = zona.clientHeight || 480;
      const tam = Math.round(t1 + (t2 - t1) * (feitos / Math.max(1, n - 1)));
      const b = h('button', { type: 'button', class: 'rt-alvo', 'aria-label': 'Bolota' });
      b.style.width = b.style.height = tam + 'px';
      b.style.left = Math.round(10 + Math.random() * (w - tam - 20)) + 'px';
      b.style.top = Math.round(10 + Math.random() * (hh - tam - 20)) + 'px';
      b.addEventListener('click', () => {
        if (!t0) t0 = performance.now();
        feitos++; som('apanhar');
        const pum = h('span', { class: 'rt-pum' }, '+1'); pum.style.left = b.style.left; pum.style.top = b.style.top;
        zona.append(pum); setTimeout(() => pum.remove(), 650);
        b.remove();
        info.querySelectorAll('b')[0].textContent = feitos;
        if (feitos >= n) { fim = true; api.concluir({ ok: true, tempo: seg(t0), falhas }); }
        else nova();
      });
      zona.append(b);
    }
    nova();
    api.dizer('boas_vindas', at.boasVindas || 'Pega no rato com a mão toda, sem apertar. Leva a setinha até à bolota e carrega uma vez no botão da esquerda.');
  };

  // ------------------------------------------------------------ arrastar para cestos
  T.separar = (el, at, api) => {
    let certos = 0, erros = 0; const t0 = performance.now();
    const monte = h('div', { class: 'rt-monte it-banco' });
    const cestos = at.cestos.map(c => {
      const d = h('div', { class: 'rt-cesto', 'data-id': c.id }, h('strong', null, c.nome), h('div', { class: 'rt-dentro' }));
      d.querySelector('strong').style.background = c.cor || '#444';
      return d;
    });
    F.PC.itens.baralhar(at.objetos, at.id || 'separar').forEach(([txt, alvoId, porque]) => {
      const e = h('span', { class: 'it-etiq' }, txt);
      F.PC.arrastavel(e, {
        alvos: '.rt-cesto',
        soltar: cesto => {
          if (!cesto) return;
          if (cesto.dataset.id === alvoId) {
            certos++; som('encaixe'); e.remove();
            cesto.querySelector('.rt-dentro').append(h('span', null, txt));
            api.msg(`${txt} ✓`, 'certo');
            if (certos === at.objetos.length) api.concluir({ ok: true, tempo: seg(t0), falhas: erros });
          } else {
            erros++; som('apagar');
            api.dizer('a_pensar', porque || `Hmm… «${txt}» não vai para aí. Pensa outra vez: para onde vai?`);
          }
        },
      });
      monte.append(e);
    });
    el.append(h('div', { class: 'pc-enunciado' },
      h('p', { class: 'pe-pergunta' }, at.pergunta),
      h('p', { class: 'pe-instr' }, 'Carrega no botão do rato em cima da palavra, não largues, leva-a até ao cesto e larga.'),
      monte, h('div', { class: 'rt-cestos' }, cestos)));
    api.dizer('boas_vindas', at.boasVindas || 'Arrastar é: carregar, segurar, mexer e largar. Experimenta com calma!');
  };

  // ------------------------------------------------------------ duplo clique
  T.duplo = (el, at, api) => {
    const letras = [...at.palavra];
    let abertas = 0, cliquesSimples = 0; const t0 = performance.now();
    const grelha = h('div', { class: 'rt-caixas' });
    grelha.style.gridTemplateColumns = `repeat(${Math.min(letras.length, 5)}, 120px)`;
    letras.forEach(l => {
      const c = h('div', { class: 'rt-caixa', role: 'button', tabindex: '0', 'aria-label': 'Caixa fechada' }, '?');
      let timer = null;
      c.addEventListener('click', () => {
        if (c.classList.contains('aberta')) return;
        clearTimeout(timer);
        timer = setTimeout(() => {           // um clique só: a caixa abana e a mascote lembra o duplo clique
          cliquesSimples++;
          c.classList.remove('abanar'); void c.offsetWidth; c.classList.add('abanar');
          if (cliquesSimples === 2 || cliquesSimples % 5 === 0) api.dizer('dica', 'Quase! São dois cliques seguidos, bem rápidos, sem mexer o rato: clic-clic!');
        }, 320);
      });
      c.addEventListener('dblclick', () => {
        clearTimeout(timer);
        if (c.classList.contains('aberta')) return;
        c.classList.add('aberta'); c.textContent = l; c.setAttribute('aria-label', 'Letra ' + l);
        abertas++; som('apanhar');
        if (abertas === letras.length) {
          api.dizer('celebrar', `Descobriste a palavra: ${at.palavra}!`);
          api.concluir({ ok: true, tempo: seg(t0), falhas: cliquesSimples });
        }
      });
      grelha.append(c);
    });
    el.append(h('div', { class: 'pc-enunciado' }, h('p', { class: 'pe-pergunta' }, at.pergunta || 'Abre todas as caixas com duplo clique. Que palavra se esconde?'), grelha));
    api.dizer('boas_vindas', at.boasVindas || 'Para abrir uma caixa carrega duas vezes seguidas, bem depressa, no botão da esquerda.');
  };

  // ------------------------------------------------------------ deslocar (roda do rato / barra de deslocamento)
  T.rolar = (el, at, api) => {
    const t0 = performance.now(); let erros = 0;
    const caixa = h('div', { class: 'rt-rolar', tabindex: '0', 'aria-label': 'Texto comprido' });
    at.paragrafos.forEach(par => {
      const p = h('p');
      par.split(/(\s+)/).forEach(t => {
        if (!t.trim()) { p.append(t); return; }
        const limpo = t.replace(/[.,;:!?«»()]/g, '');
        const s = h('span', { class: 'rt-p' }, t);
        s.addEventListener('click', () => {
          if (limpo.toLowerCase() === at.alvo.toLowerCase()) {
            s.classList.add('certo'); som('sucesso');
            api.concluir({ ok: true, tempo: seg(t0), falhas: erros });
          } else { erros++; api.dizer('a_pensar', `«${limpo}» não é a palavra que procuramos. Continua a descer com a roda do rato.`); }
        });
        p.append(s);
      });
      caixa.append(p);
    });
    el.append(h('div', { class: 'pc-enunciado' }, h('p', { class: 'pe-pergunta' }, at.pergunta), h('p', { class: 'pe-instr' }, 'Usa a roda do rato (ou a barra cinzenta à direita) para descer no texto.'), caixa));
    api.dizer('boas_vindas', at.boasVindas || 'Nas provas os textos são compridos. Põe a setinha em cima do texto e rola a roda do rato com o dedo.');
  };

  // ------------------------------------------------------------ teclado português
  // [tecla, com Shift] por fila; ´ e ~ são teclas mortas (acento primeiro, letra depois)
  const FILAS = [
    [['\\', '|'], ['1', '!'], ['2', '"'], ['3', '#'], ['4', '$'], ['5', '%'], ['6', '&'], ['7', '/'], ['8', '('], ['9', ')'], ['0', '='], ["'", '?'], ['«', '»']],
    [['q'], ['w'], ['e'], ['r'], ['t'], ['y'], ['u'], ['i'], ['o'], ['p'], ['+', '*'], ['´', '`']],
    [['a'], ['s'], ['d'], ['f'], ['g'], ['h'], ['j'], ['k'], ['l'], ['ç'], ['º', 'ª'], ['~', '^']],
    [['<', '>'], ['z'], ['x'], ['c'], ['v'], ['b'], ['n'], ['m'], [',', ';'], ['.', ':'], ['-', '_']],
  ];
  // dedo de cada tecla (1 mindinho, 2 anelar, 3 médio, 4 indicador) — cores na parte de baixo da tecla
  const DEDOS = [
    [1, 1, 2, 3, 4, 4, 4, 4, 3, 2, 1, 1, 1],
    [1, 2, 3, 4, 4, 4, 4, 3, 2, 1, 1, 1],
    [1, 2, 3, 4, 4, 4, 4, 3, 2, 1, 1, 1],
    [1, 1, 2, 3, 4, 4, 4, 4, 3, 2, 1],
  ];
  const CASA = ['f', 'j'];
  const ACENTOS = { 'á': ['´', 'a'], 'é': ['´', 'e'], 'í': ['´', 'i'], 'ó': ['´', 'o'], 'ú': ['´', 'u'], 'à': ['`', 'a'],
    'ã': ['~', 'a'], 'õ': ['~', 'o'], 'â': ['^', 'a'], 'ê': ['^', 'e'], 'ô': ['^', 'o'] };
  function teclaDe(ch) {
    for (const f of FILAS) for (const k of f) { if (k[0] === ch) return { tecla: k[0], shift: false }; if (k[1] === ch) return { tecla: k[0], shift: true }; }
    const lo = ch.toLowerCase();
    if (lo !== ch) { const t = teclaDe(lo); if (t) return { tecla: t.tecla, shift: true }; }
    if (ch === ' ') return { tecla: ' ', shift: false };
    return null;
  }
  // como se escreve um carácter: lista de passos { tecla, shift } + uma frase para a criança
  function comoEscrever(ch) {
    const lo = ch.toLowerCase(), mai = lo !== ch;
    if (ACENTOS[lo]) {
      const [ac, letra] = ACENTOS[lo], a = teclaDe(ac);
      const nomeAc = { '´': 'acento agudo ´', '`': 'acento grave `', '~': 'til ~', '^': 'acento circunflexo ^' }[ac];
      return { passos: [a, { tecla: letra, shift: mai }], frase: `«${ch}»: primeiro a tecla do ${nomeAc}${a.shift ? ' (com Shift ⇧)' : ''}, larga, e depois ${mai ? 'Shift ⇧ + ' : ''}${letra}.` };
    }
    const t = teclaDe(ch);
    if (!t) return { passos: [], frase: '' };
    if (ch === ' ') return { passos: [t], frase: 'Espaço: a barra comprida, com o polegar.' };
    if (t.shift) return { passos: [t], frase: /[A-ZÇ]/.test(ch) ? `Maiúscula: segura no Shift ⇧ com o mindinho da outra mão e carrega em ${lo}.` : `«${ch}»: segura no Shift ⇧ e carrega na tecla ${t.tecla}.` };
    return { passos: [t], frase: '' };
  }
  F.PC.comoEscrever = comoEscrever;

  T.teclado = (el, at, api) => {
    const linhas = at.linhas;
    let k = 0, erros = 0, total = 0, anterior = '', t0 = null;
    const alvo = h('div', { class: 'tc-linha', 'aria-live': 'polite' });
    const inp = h('input', { class: 'tc-entrada', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Escreve aqui' });
    const dica = h('div', { class: 'tc-dica' });
    const conta = h('p', { class: 'rt-info' });
    const teclado = h('div', { class: 'tc-teclado', 'aria-hidden': 'true' });
    const teclas = {};
    FILAS.forEach((f, i) => {
      const fila = h('div', { class: 'tc-fila' });
      if (i === 1) fila.append(h('span', { class: 'tc-tecla larga' }, 'Tab ↹'));
      if (i === 2) fila.append(h('span', { class: 'tc-tecla larga' }, 'Caps'));
      if (i === 3) { const s = h('span', { class: 'tc-tecla larga', 'data-shift': '1' }, 'Shift ⇧'); fila.append(s); teclas['⇧e'] = s; }
      f.forEach((t, j) => {
        const b = h('span', { class: 'tc-tecla' + (CASA.includes(t[0]) ? ' casa' : ''), 'data-dedo': DEDOS[i][j] }, t[1] && !/[a-zç]/.test(t[0]) ? h('small', null, t[1]) : null, t[0].toUpperCase() === t[0] ? t[0] : t[0].toUpperCase());
        teclas[t[0]] = b; fila.append(b);
      });
      if (i === 0) fila.append(h('span', { class: 'tc-tecla larga' }, '⌫ Apagar'));
      if (i === 2) fila.append(h('span', { class: 'tc-tecla larga' }, 'Enter ↵'));
      if (i === 3) { const s = h('span', { class: 'tc-tecla larga', 'data-shift': '1' }, 'Shift ⇧'); fila.append(s); teclas['⇧d'] = s; }
      teclado.append(fila);
    });
    const esp = h('span', { class: 'tc-tecla espaco', 'data-dedo': '5' }, ''); teclas[' '] = esp;
    teclado.append(h('div', { class: 'tc-fila', style: 'justify-content:center' }, esp));

    function desenhar() {
      const L = linhas[k], v = inp.value;
      alvo.innerHTML = '';
      [...L].forEach((ch, i) => {
        const cls = i < v.length ? (v[i] === ch ? 'ok' : 'mal') : i === v.length ? 'cursor' : '';
        alvo.append(h('span', { class: cls }, ch === ' ' && cls === 'mal' ? '·' : ch));
      });
      Object.values(teclas).forEach(t => t.classList.remove('proxima'));
      // a próxima tecla: se houver erro, primeiro apagar
      const errado = [...v].findIndex((c, i) => c !== L[i]);
      if (errado >= 0) { dica.textContent = 'Há uma letra trocada (a vermelho). Carrega em ⌫ Apagar e escreve outra vez.'; }
      else if (v.length < L.length) {
        const c = comoEscrever(L[v.length]);
        dica.textContent = c.frase;
        if (c.passos[0]) {
          const p = c.passos[0];
          if (teclas[p.tecla]) teclas[p.tecla].classList.add('proxima');
          if (p.shift) { (['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b', '\\', '1', '2', '3', '4', '5', '<'].includes(p.tecla) ? teclas['⇧d'] : teclas['⇧e']).classList.add('proxima'); }
        }
      } else dica.textContent = '';
      conta.innerHTML = '';
      conta.append('Linha ', h('b', null, String(k + 1)), ' de ' + linhas.length, '  ·  Enganos: ', h('b', null, String(erros)));
    }
    inp.addEventListener('paste', ev => ev.preventDefault());
    inp.addEventListener('input', () => {
      const v = inp.value, L = linhas[k];
      if (!t0 && v) t0 = performance.now();
      if (v.length > anterior.length) {          // escreveu (não apagou): conta enganos
        for (let i = anterior.length; i < v.length; i++) { total++; if (v[i] !== L[i]) { erros++; som('apagar'); } }
      }
      anterior = v;
      if (v === L) {
        som('encaixe');
        k++; inp.value = ''; anterior = '';
        if (k >= linhas.length) {
          const s = seg(t0 || performance.now());
          const caract = linhas.join(' ').length, ppm = s ? Math.round((caract / 5) / (s / 60)) : 0;
          const prec = total ? Math.round(100 * (total - erros) / total) : 100;
          inp.disabled = true; alvo.textContent = 'Feito! 🎉'; dica.textContent = `${ppm} palavras por minuto · ${prec}% de teclas certas à primeira.`;
          Object.values(teclas).forEach(t => t.classList.remove('proxima'));
          api.concluir({ ok: true, tempo: s, falhas: erros, ppm, precisao: prec });
          return;
        }
      }
      desenhar();
    });
    el.append(h('div', { class: 'pc-enunciado' }, h('p', { class: 'pe-pergunta' }, at.pergunta || 'Copia cada linha. Quando acertares, aparece a seguinte.'), conta, alvo, inp, dica, teclado));
    desenhar();
    setTimeout(() => inp.focus(), 60);
    el.addEventListener('pointerdown', ev => { if (ev.target !== inp) setTimeout(() => inp.focus(), 0); });
    api.dizer('boas_vindas', at.boasVindas || 'Os indicadores ficam nas teclas F e J — têm um risquinho para os encontrares sem olhar.');
  };

  F.PC.rt = { montar: (el, at, api) => { el.innerHTML = ''; T[at.tipo](el, at, api); }, tipos: Object.keys(T), comoEscrever };
})();
