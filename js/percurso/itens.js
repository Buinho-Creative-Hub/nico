/* Nico · Percurso 4.º ano — itens do tipo das provas digitais.
 *
 * Tipos: escolha (uma opção) · varias (várias opções) · vf (verdadeiro/falso por linha) · ordenar (arrastar para pôr
 * por ordem) · arrastar (completar espaços ou associar, arrastando etiquetas) · curta (escrever uma palavra/número) ·
 * extensa (escrever um texto curto no teclado) · palavras (clicar em palavras de uma frase).
 * Estímulos opcionais: figura (barras, relógio, svg) e tabela.
 *
 *   const c = F.PC.itens.montar(elemento, item, { modo: 'sessao' | 'prova', aoMudar })
 *   c.respondido() · c.verificar() → { certo, aberta } (pinta certo/errado) · c.mostrarCerto() · c.valor() · c.repor(v)
 *   F.PC.itens.corrigir(item, valor) → true/false (sem ecrã; usado na prova-ensaio e nos testes)
 */
(function () {
  'use strict';
  const F = window.Faisca;
  F.PC = F.PC || {};

  // ------------------------------------------------------------ ajudas
  function h(tag, at, ...filhos) {
    const e = document.createElement(tag);
    if (at) for (const [k, v] of Object.entries(at)) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const f of filhos.flat()) if (f != null && f !== false) e.append(f.nodeType ? f : document.createTextNode(String(f)));
    return e;
  }
  // baralhar sempre da mesma maneira para o mesmo item (ecrã igual em todos os computadores e nos testes)
  function baralhar(lista, semente) {
    let s = 0; for (const c of String(semente)) s = (s * 31 + c.charCodeAt(0)) >>> 0;
    const r = () => { s = (s * 1103515245 + 12345) >>> 0; return s / 4294967296; };
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const norm = t => String(t || '').trim().replace(/\s+/g, ' ').replace(/[.!?]$/, '').toLowerCase();
  const numero = t => { const n = Number(String(t || '').replace(/[\s  ]/g, '').replace(',', '.')); return isFinite(n) && String(t).trim() !== '' ? n : NaN; };
  const LETRAS = 'ABCDEFGH';
  const palavrasDe = t => String(t || '').trim().split(/\s+/).filter(Boolean);

  // ------------------------------------------------------------ arrastar com o rato (e com o dedo)
  // Arrastar ou clicar: um clique escolhe a etiqueta e outro clique escolhe o sítio (alternativa ao arrastar).
  function arrastavel(el, { soltar, alvos, clique }) {
    let x0, y0, ativo = false, mexeu = false;
    el.addEventListener('pointerdown', ev => {
      if (el.closest('.bloqueado')) return;
      ativo = true; mexeu = false; x0 = ev.clientX; y0 = ev.clientY;
      el.setPointerCapture(ev.pointerId);
    });
    el.addEventListener('pointermove', ev => {
      if (!ativo) return;
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (!mexeu && Math.hypot(dx, dy) < 6) return;
      mexeu = true;
      el.classList.add('a-arrastar');
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      document.querySelectorAll(alvos).forEach(a => a.classList.remove('sobre'));
      const alvo = alvoEm(ev.clientX, ev.clientY);
      if (alvo) alvo.classList.add('sobre');
    });
    const acabar = ev => {
      if (!ativo) return;
      ativo = false;
      el.classList.remove('a-arrastar');
      el.style.transform = '';
      document.querySelectorAll(alvos).forEach(a => a.classList.remove('sobre'));
      if (!mexeu) { if (clique) clique(); return; }
      const alvo = alvoEm(ev.clientX, ev.clientY);
      soltar(alvo);
    };
    el.addEventListener('pointerup', acabar);
    el.addEventListener('pointercancel', acabar);
    function alvoEm(x, y) {
      el.style.visibility = 'hidden';
      const baixo = document.elementFromPoint(x, y);
      el.style.visibility = '';
      return baixo ? baixo.closest(alvos) : null;
    }
  }
  F.PC.arrastavel = arrastavel;

  // ------------------------------------------------------------ estímulos (figuras e tabelas)
  const NS = 'http://www.w3.org/2000/svg';
  function figura(f) {
    if (!f) return null;
    let svg = '';
    if (f.tipo === 'barras') {
      const W = 560, H = 300, m = { e: 54, d: 16, t: 34, b: 46 };
      const max = f.max || Math.max(...f.dados.map(d => d[1])), passo = f.passo || Math.ceil(max / 5);
      const lw = (W - m.e - m.d) / f.dados.length, esc = v => H - m.b - (v / max) * (H - m.t - m.b);
      let g = '';
      for (let v = 0; v <= max; v += passo) g += `<line x1="${m.e}" x2="${W - m.d}" y1="${esc(v)}" y2="${esc(v)}" stroke="#d6d6d6"/><text x="${m.e - 8}" y="${esc(v) + 5}" text-anchor="end" font-size="14" fill="#444">${v}</text>`;
      f.dados.forEach(([r, v], i) => {
        const x = m.e + i * lw + lw * 0.2, w = lw * 0.6;
        g += `<rect x="${x}" y="${esc(v)}" width="${w}" height="${esc(0) - esc(v)}" fill="${f.cor || '#4b7bec'}"/>` +
          `<text x="${x + w / 2}" y="${H - m.b + 20}" text-anchor="middle" font-size="15" fill="#111">${r}</text>`;
      });
      g += `<line x1="${m.e}" x2="${m.e}" y1="${m.t - 6}" y2="${esc(0)}" stroke="#111"/><line x1="${m.e}" x2="${W - m.d}" y1="${esc(0)}" y2="${esc(0)}" stroke="#111"/>`;
      if (f.titulo) g += `<text x="${W / 2}" y="20" text-anchor="middle" font-size="16" font-weight="700">${f.titulo}</text>`;
      if (f.eixo) g += `<text x="14" y="${(H) / 2}" transform="rotate(-90 14 ${H / 2})" text-anchor="middle" font-size="13" fill="#444">${f.eixo}</text>`;
      svg = `<svg xmlns="${NS}" viewBox="0 0 ${W} ${H}" width="${W}" font-family="Asap, sans-serif">${g}</svg>`;
    } else if (f.tipo === 'relogio') {
      const R = 90, c = 100;
      let g = `<circle cx="${c}" cy="${c}" r="${R}" fill="#fff" stroke="#111" stroke-width="4"/>`;
      for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6; g += `<text x="${c + 70 * Math.sin(a)}" y="${c - 70 * Math.cos(a) + 6}" text-anchor="middle" font-size="18" font-weight="700">${i}</text>`; }
      for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, r1 = i % 5 ? 84 : 80; g += `<line x1="${c + r1 * Math.sin(a)}" y1="${c - r1 * Math.cos(a)}" x2="${c + 88 * Math.sin(a)}" y2="${c - 88 * Math.cos(a)}" stroke="#111" stroke-width="${i % 5 ? 1 : 2.5}"/>`; }
      const am = f.m * Math.PI / 30, ah = ((f.h % 12) + f.m / 60) * Math.PI / 6;
      g += `<line x1="${c}" y1="${c}" x2="${c + 46 * Math.sin(ah)}" y2="${c - 46 * Math.cos(ah)}" stroke="#111" stroke-width="7" stroke-linecap="round"/>`;
      g += `<line x1="${c}" y1="${c}" x2="${c + 70 * Math.sin(am)}" y2="${c - 70 * Math.cos(am)}" stroke="#2364ff" stroke-width="4" stroke-linecap="round"/><circle cx="${c}" cy="${c}" r="6"/>`;
      svg = `<svg xmlns="${NS}" viewBox="0 0 200 200" width="220" font-family="Asap, sans-serif">${g}</svg>`;
    } else if (f.tipo === 'svg') svg = f.svg;
    return h('figure', { class: 'it-figura', html: svg + (f.legenda ? `<figcaption>${f.legenda}</figcaption>` : '') });
  }
  function tabela(t) {
    if (!t) return null;
    return h('table', { class: 'it-tabela' },
      t.cab ? h('thead', null, h('tr', null, t.cab.map(c => h('th', null, c)))) : null,
      h('tbody', null, t.linhas.map(l => h('tr', null, l.map(c => h('td', null, c))))));
  }

  // ------------------------------------------------------------ cada tipo: montar no ecrã
  const TIPOS = {};

  TIPOS.escolha = TIPOS.varias = (el, it, ctx) => {
    const varias = it.tipo === 'varias';
    let sel = varias ? [] : null;
    const ul = h('ul', { class: 'it-opcoes', role: varias ? 'group' : 'radiogroup' });
    const bts = it.opcoes.map((o, i) => {
      const b = h('button', { type: 'button', class: 'it-opcao' + (varias ? ' varias' : ''), role: varias ? 'checkbox' : 'radio', 'aria-checked': 'false' },
        h('span', { class: 'io-letra' }, LETRAS[i]), h('span', null, o));
      b.addEventListener('click', () => {
        if (el.closest('.bloqueado')) return;
        if (varias) sel = sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i].sort();
        else sel = i;
        pintar(); ctx.aoMudar();
      });
      ul.append(h('li', null, b));
      return b;
    });
    const pintar = () => bts.forEach((b, i) => b.setAttribute('aria-checked', String(varias ? sel.includes(i) : sel === i)));
    el.append(ul);
    return {
      valor: () => sel,
      repor: v => { sel = v == null ? (varias ? [] : null) : v; pintar(); },
      respondido: () => varias ? sel.length > 0 : sel !== null,
      pintar: (mostrar) => bts.forEach((b, i) => {
        const certa = varias ? it.certas.includes(i) : it.certa === i, escolhida = varias ? sel.includes(i) : sel === i;
        b.classList.toggle('certo', certa && (escolhida || mostrar));
        b.classList.toggle('errado', !certa && escolhida);
      }),
    };
  };

  TIPOS.vf = (el, it, ctx) => {
    const sel = it.afirmacoes.map(() => null);
    const linhas = it.afirmacoes.map(([txt], i) => {
      const bt = v => {
        const b = h('button', { type: 'button', 'aria-pressed': 'false', 'aria-label': (v ? 'Verdadeiro: ' : 'Falso: ') + txt }, v ? 'V' : 'F');
        b.addEventListener('click', () => { if (el.closest('.bloqueado')) return; sel[i] = v; pintar(); ctx.aoMudar(); });
        return b;
      };
      const bV = bt(true), bF = bt(false);
      const tr = h('tr', null, h('td', null, txt), h('td', { class: 'vf-c' }, bV), h('td', { class: 'vf-c' }, bF));
      tr._b = [bV, bF];
      return tr;
    });
    const pintar = () => linhas.forEach((tr, i) => { tr._b[0].setAttribute('aria-pressed', String(sel[i] === true)); tr._b[1].setAttribute('aria-pressed', String(sel[i] === false)); });
    el.append(h('table', { class: 'it-vf' }, h('thead', null, h('tr', null, h('th', null, 'Afirmação'), h('th', null, 'Verdadeira'), h('th', null, 'Falsa'))), h('tbody', null, linhas)));
    return {
      valor: () => sel.slice(),
      repor: v => { (v || []).forEach((x, i) => { sel[i] = x; }); pintar(); },
      respondido: () => sel.every(x => x !== null),
      pintar: () => linhas.forEach((tr, i) => { tr.classList.toggle('certo', sel[i] === it.afirmacoes[i][1]); tr.classList.toggle('errado', sel[i] !== it.afirmacoes[i][1]); }),
    };
  };

  TIPOS.ordenar = (el, it, ctx) => {
    let ordem = baralhar(it.itens.map((_, i) => i), it.id || it.pergunta);
    if (ordem.every((x, i) => x === i)) ordem = ordem.slice(1).concat(ordem[0]);
    let mexido = false;
    const ul = h('ul', { class: 'it-ordem' });
    const lis = it.itens.map((t, i) => { const li = h('li', { 'data-i': i }, h('span', { class: 'io-num' }), h('span', null, t), h('span', { class: 'io-pega', 'aria-hidden': 'true' }, '⋮⋮')); return li; });
    const desenhar = () => { ul.innerHTML = ''; ordem.forEach((i, k) => { lis[i].querySelector('.io-num').textContent = k + 1; ul.append(lis[i]); }); };
    // arrastar para cima e para baixo: o item vai trocando de lugar enquanto se arrasta
    lis.forEach(li => {
      let ativo = false;
      li.addEventListener('pointerdown', ev => { if (el.closest('.bloqueado')) return; ativo = true; li.setPointerCapture(ev.pointerId); li.classList.add('a-arrastar'); });
      li.addEventListener('pointermove', ev => {
        if (!ativo) return;
        const i = Number(li.dataset.i), k = ordem.indexOf(i);
        const irmaos = [...ul.children];
        for (let j = 0; j < irmaos.length; j++) {
          if (j === k) continue;
          const r = irmaos[j].getBoundingClientRect();
          if (ev.clientY > r.top + r.height * 0.25 && ev.clientY < r.bottom - r.height * 0.25) {
            ordem.splice(k, 1); ordem.splice(j, 0, i); mexido = true; desenhar(); ctx.aoMudar(); break;
          }
        }
      });
      const fim = () => { ativo = false; li.classList.remove('a-arrastar'); };
      li.addEventListener('pointerup', fim); li.addEventListener('pointercancel', fim);
    });
    desenhar();
    el.append(ul);
    return {
      valor: () => ordem.slice(),
      repor: v => { if (v && v.length === ordem.length) { ordem = v.slice(); mexido = true; desenhar(); } },
      respondido: () => mexido,
      pintar: () => ordem.forEach((i, k) => { lis[i].classList.toggle('certo', i === k); lis[i].classList.toggle('errado', i !== k); }),
    };
  };

  // completar espaços (frase com {0} {1}…) ou associar (linhas: [esquerda, certa]) arrastando etiquetas
  TIPOS.arrastar = (el, it, ctx) => {
    const certas = it.linhas ? it.linhas.map(l => l[1]) : it.certas;
    const todas = baralhar([...new Set([...certas, ...(it.extra || [])])], it.id || it.pergunta);
    const lugar = certas.map(() => null);           // texto da etiqueta em cada buraco
    let escolhida = null;
    const banco = h('div', { class: 'it-banco', 'aria-label': 'Etiquetas para arrastar' });
    const etiq = {};
    todas.forEach(t => {
      const e = h('span', { class: 'it-etiq', tabindex: '0', role: 'button' }, t);
      e.dataset.t = t;
      arrastavel(e, {
        alvos: '.it-buraco, .it-banco',
        soltar: alvo => { if (alvo && el.contains(alvo)) pousar(t, alvo); },
        clique: () => { escolhida = escolhida === t ? null : t; pintar(); },
      });
      e.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); escolhida = escolhida === t ? null : t; pintar(); } });
      etiq[t] = e;
    });
    const buracos = certas.map((_, k) => {
      const b = h('span', { class: 'it-buraco', 'data-k': k, tabindex: '0', role: 'button', 'aria-label': 'Espaço ' + (k + 1) });
      const usar = () => { if (escolhida != null) { pousar(escolhida, b); escolhida = null; pintar(); } else if (lugar[k] != null) { pousar(lugar[k], banco); } };
      b.addEventListener('click', ev => { if (ev.target === b) usar(); });
      b.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); usar(); } });
      return b;
    });
    function pousar(t, alvo) {
      if (el.closest('.bloqueado')) return;
      const de = lugar.indexOf(t);
      if (alvo.classList.contains('it-banco')) { if (de >= 0) lugar[de] = null; }
      else {
        const k = Number(alvo.dataset.k);
        if (de >= 0) lugar[de] = lugar[k];          // troca de lugar com o que lá estava
        lugar[k] = t;
      }
      desenhar(); ctx.aoMudar();
    }
    function desenhar() {
      todas.forEach(t => { if (!lugar.includes(t)) banco.append(etiq[t]); });
      buracos.forEach((b, k) => { b.innerHTML = ''; if (lugar[k] != null) b.append(etiq[lugar[k]]); });
      pintar();
    }
    const pintar = () => todas.forEach(t => etiq[t].classList.toggle('escolhida', escolhida === t));
    el.append(banco);
    if (it.linhas) {
      el.append(h('table', { class: 'it-assoc' }, h('tbody', null, it.linhas.map((l, k) => h('tr', null, h('td', null, l[0]), h('td', null, buracos[k]))))));
    } else {
      const fr = h('p', { class: 'it-frase' });
      String(it.frase).split(/(\{\d+\})/).forEach(p => { const m = p.match(/^\{(\d+)\}$/); fr.append(m ? buracos[Number(m[1])] : document.createTextNode(p)); });
      el.append(fr);
    }
    desenhar();
    return {
      valor: () => lugar.slice(),
      repor: v => { (v || []).forEach((t, k) => { lugar[k] = todas.includes(t) ? t : null; }); desenhar(); },
      respondido: () => lugar.every(x => x != null),
      pintar: () => buracos.forEach((b, k) => { b.classList.toggle('certo', lugar[k] === certas[k]); b.classList.toggle('errado', lugar[k] !== certas[k]); }),
      mostrar: () => { certas.forEach((t, k) => { lugar[k] = t; }); desenhar(); },
    };
  };

  TIPOS.curta = (el, it, ctx) => {
    const inp = h('input', { type: 'text', inputmode: it.numero != null ? 'decimal' : 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Resposta' });
    if (it.largura) inp.style.width = it.largura;
    inp.addEventListener('input', () => ctx.aoMudar());
    inp.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ctx.aoEnter) ctx.aoEnter(); });
    el.append(h('div', { class: 'it-curta' }, it.antes ? h('span', null, it.antes) : null, inp, it.depois ? h('span', null, it.depois) : null));
    setTimeout(() => { if (ctx.modo === 'sessao') inp.focus(); }, 50);
    return {
      valor: () => inp.value,
      repor: v => { inp.value = v || ''; },
      respondido: () => inp.value.trim() !== '',
      pintar: () => { const c = corrigir(it, inp.value); inp.classList.toggle('certo', c); inp.classList.toggle('errado', !c); },
      bloquear: () => { inp.readOnly = true; },
    };
  };

  // texto escrito no teclado: não há certo/errado automático — conta palavras e confirma maiúscula e ponto final
  TIPOS.extensa = (el, it, ctx) => {
    const ta = h('textarea', { spellcheck: 'false', 'aria-label': 'O teu texto', placeholder: it.dica || 'Escreve aqui…' });
    const lista = h('ul', { class: 'it-lista' });
    const crit = criteriosExtensa(it);
    const atualizar = () => {
      lista.innerHTML = '';
      crit.forEach(([nome, f]) => lista.append(h('li', { class: f(ta.value) ? 'ok' : '' }, nome)));
      ctx.aoMudar();
    };
    ta.addEventListener('input', atualizar);
    el.append(h('div', { class: 'it-extensa' }, ta, lista));
    atualizar();
    setTimeout(() => { if (ctx.modo === 'sessao') ta.focus(); }, 50);
    return {
      valor: () => ta.value,
      repor: v => { ta.value = v || ''; atualizar(); },
      respondido: () => ta.value.trim() !== '',
      pintar: () => {},
      bloquear: () => { ta.readOnly = true; },
    };
  };
  function criteriosExtensa(it) {
    const min = it.min || 15;
    const c = [
      [`pelo menos ${min} palavras`, v => palavrasDe(v).length >= min],
      ['começa com letra maiúscula', v => /^\s*[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(v)],
      ['acaba com pontuação (. ! ?)', v => /[.!?…]\s*$/.test(v)],
    ];
    (it.palavrasChave || []).forEach(p => c.push([`usa a palavra «${p}»`, v => norm(v).includes(norm(p))]));
    return c;
  }

  TIPOS.palavras = (el, it, ctx) => {
    const toks = String(it.texto).match(/[\wÀ-ÿ'’-]+|[^\s\wÀ-ÿ]+/g) || [];
    const sel = new Set();
    const p = h('p', { class: 'it-palavras' });
    const spans = [];
    toks.forEach((t, i) => {
      const palavra = /[\wÀ-ÿ]/.test(t);
      if (i && palavra) p.append(' ');
      if (!palavra) { p.append(t); return; }
      const s = h('span', { class: 'it-palavra', role: 'button', tabindex: '0' }, t);
      s.dataset.t = t;
      const tocar = () => { if (el.closest('.bloqueado')) return; sel.has(t) ? sel.delete(t) : sel.add(t); pintar(); ctx.aoMudar(); };
      s.addEventListener('click', tocar);
      s.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tocar(); } });
      spans.push(s); p.append(s);
    });
    const pintar = () => spans.forEach(s => s.classList.toggle('escolhida', sel.has(s.dataset.t)));
    el.append(p);
    return {
      valor: () => [...sel],
      repor: v => { sel.clear(); (v || []).forEach(x => sel.add(x)); pintar(); },
      respondido: () => sel.size > 0,
      pintar: (mostrar) => spans.forEach(s => {
        const certa = it.certas.includes(s.dataset.t), esc = sel.has(s.dataset.t);
        s.classList.toggle('certo', certa && esc); s.classList.toggle('errado', !certa && esc); s.classList.toggle('faltou', certa && !esc && !!mostrar);
      }),
    };
  };

  // ------------------------------------------------------------ corrigir (sem ecrã)
  function corrigir(it, v) {
    switch (it.tipo) {
      case 'escolha': return v === it.certa;
      case 'varias': return Array.isArray(v) && v.length === it.certas.length && it.certas.every(x => v.includes(x));
      case 'vf': return Array.isArray(v) && it.afirmacoes.every(([, c], i) => v[i] === c);
      case 'ordenar': return Array.isArray(v) && v.length === it.itens.length && v.every((x, k) => x === k);
      case 'arrastar': { const c = it.linhas ? it.linhas.map(l => l[1]) : it.certas; return Array.isArray(v) && c.every((t, k) => v[k] === t); }
      case 'curta':
        if (it.numero != null) { const n = numero(v); return !isNaN(n) && Math.abs(n - it.numero) < 1e-9; }
        return (it.aceitar || []).some(a => norm(a) === norm(v));
      case 'extensa': return criteriosExtensa(it).every(([, f]) => f(v || ''));
      case 'palavras': return Array.isArray(v) && v.length === it.certas.length && it.certas.every(x => v.includes(x));
      default: return false;
    }
  }
  // a resposta certa escrita (para mostrar depois da 2.ª tentativa e no relatório da prova)
  function respostaCerta(it) {
    switch (it.tipo) {
      case 'escolha': return LETRAS[it.certa] + ') ' + it.opcoes[it.certa];
      case 'varias': return it.certas.map(i => LETRAS[i] + ') ' + it.opcoes[i]).join(' · ');
      case 'vf': return it.afirmacoes.map(([t, c]) => (c ? 'V' : 'F')).join(' · ');
      case 'ordenar': return it.itens.map((t, k) => (k + 1) + '. ' + t).join('  ');
      case 'arrastar': return (it.linhas ? it.linhas.map(l => l[0] + ' → ' + l[1]) : it.certas).join(' · ');
      case 'curta': return it.numero != null ? String(it.numero).replace('.', ',') + (it.depois ? ' ' + it.depois.trim() : '') : it.aceitar[0];
      case 'palavras': return it.certas.join(', ');
      default: return '';
    }
  }

  // ------------------------------------------------------------ montar
  function montar(el, it, op = {}) {
    const ctx = { modo: op.modo || 'sessao', aoMudar: op.aoMudar || (() => {}), aoEnter: op.aoEnter };
    el.innerHTML = '';
    const caixa = h('div', { class: 'pc-enunciado' });
    const p = h('p', { class: 'pe-pergunta' }, it.pergunta);
    caixa.append(p);
    if (it.instr) caixa.append(h('p', { class: 'pe-instr' }, it.instr));
    if (it.figura) caixa.append(figura(it.figura));
    if (it.tabela) caixa.append(tabela(it.tabela));
    const corpo = h('div');
    caixa.append(corpo);
    const explica = h('div', { class: 'it-explica', hidden: true });
    caixa.append(explica);
    el.append(caixa);
    const c = TIPOS[it.tipo](corpo, it, ctx);
    return {
      ...c,
      item: it,
      verificar() { const certo = corrigir(it, c.valor()); c.pintar(false); return { certo, aberta: it.tipo === 'extensa' }; },
      mostrarCerto() {
        if (c.mostrar) c.mostrar();
        c.pintar(true);
        if (it.tipo !== 'extensa') { explica.hidden = false; explica.classList.add('errado'); explica.innerHTML = ''; explica.append(h('b', null, 'Resposta certa: '), respostaCerta(it), it.explica ? h('div', null, it.explica) : null); }
      },
      explicar() { if (it.explica) { explica.hidden = false; explica.classList.remove('errado'); explica.textContent = it.explica; } },
      bloquear() { caixa.classList.add('bloqueado'); if (c.bloquear) c.bloquear(); },
      textoParaOuvir: () => [it.pergunta, it.instr, it.tipo === 'escolha' || it.tipo === 'varias' ? it.opcoes.map((o, i) => LETRAS[i] + ', ' + o).join('. ') : '',
        it.tipo === 'vf' ? it.afirmacoes.map(a => a[0]).join('. ') : '', it.tipo === 'palavras' ? it.texto : ''].filter(Boolean).join('. '),
    };
  }

  F.PC.itens = { montar, corrigir, respostaCerta, figura, tabela, h, baralhar, palavrasDe, criteriosExtensa };
})();
