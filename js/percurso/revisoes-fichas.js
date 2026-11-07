/* Nico · Capítulo especial — «fichas» à maneira do manual (Ginásio dos Números).
 *
 * O Carlos testou com o Jaime (7 Nov 2026): «aqueles exercícios que te mandei no PDF não vi nada lá semelhante».
 * O manual trabalha com fichas de preencher — várias caixas na mesma pergunta: tabela antecessor | número | sucessor, o
 * esquema dos 100 000, a decomposição passo a passo (649 − 239 = 649 − 200 − 30 − 9 = …), o algoritmo em coluna,
 * sequências em caixas encadeadas, a tabela dos termos, a tabela dos sólidos, a tabela binária, o caule-e-folhas com moda,
 * máximo, mínimo e número de dados, o chocolate de 12 quadradinhos, o enigma das bolotas, a mensagem «3U 74MB3M…».
 * Este módulo cria o tipo de item «ficha» (várias caixas; certo quando todas estão certas) e junta ~30 formatos às
 * listas de exercícios (R.G), com a chave a começar por «f-». O teste dá prioridade a estas fichas (missoes/revisoes-3ano.js).
 *
 * Item: { tipo: 'ficha', pergunta, instr, html, res: [resposta de cada caixa], larg: [largura], explica }
 *   html tem [[0]], [[1]]… onde ficam as caixas; res[i] é um número (aceita «30 min», «2,50 €») ou uma lista de textos aceites.
 */
(function () {
  'use strict';
  const F = window.Faisca, R = F.REV, U = R.util, I = F.PC.itens, h = I.h;
  const NB = ' ', fmt = U.fmt, ri = U.ri, pick = U.pick, mist = U.misturar;
  const CAD = '📝 Faz as contas no caderno e escreve os resultados nas caixas.';

  // ------------------------------------------------------------ o tipo «ficha»
  const okCaixa = (r, v) => {
    if (v == null || String(v).trim() === '') return false;
    if (typeof r === 'number') {
      const n = I.numero(v), n2 = I.numero(String(v).replace(/\s*[^\d\s.,  ]+[²³]?\s*$/u, ''));
      return (!isNaN(n) && Math.abs(n - r) < 1e-9) || (!isNaN(n2) && Math.abs(n2 - r) < 1e-9);
    }
    const l = Array.isArray(r) ? r : [r];
    const sem = t => I.norm(t).normalize('NFD').replace(/[̀-ͯ]/g, '');
    return l.some(a => sem(a) === sem(v));
  };
  const mostrarRes = r => typeof r === 'number' ? String(r).replace('.', ',') : (Array.isArray(r) ? r[0] : r);
  I.registarTipo('ficha', {
    render(el, it, ctx) {
      const caixa = h('div', { class: 'rv-ficha', html: it.html.replace(/\[\[(\d+)\]\]/g, (m, i) => `<input class="rv-cx" data-i="${i}" autocomplete="off" inputmode="${typeof it.res[i] === 'number' ? 'decimal' : 'text'}" aria-label="caixa ${+i + 1}" style="width:${(it.larg && it.larg[i]) || (typeof it.res[i] === 'number' ? Math.max(64, String(it.res[i]).length * 15 + 26) + 'px' : '140px')}">`) });
      el.append(caixa);
      const cx = [...caixa.querySelectorAll('.rv-cx')].sort((a, b) => a.dataset.i - b.dataset.i);
      cx.forEach((c, k) => {
        c.addEventListener('input', () => ctx.aoMudar());
        c.addEventListener('keydown', e => { if (e.key === 'Enter') { if (cx[k + 1] && !cx[k + 1].value) cx[k + 1].focus(); else if (ctx.aoEnter) ctx.aoEnter(); } });
      });
      setTimeout(() => { if (cx[0] && ctx.modo !== 'prova') cx[0].focus(); }, 30);
      return {
        valor: () => cx.map(c => c.value),
        repor: v => { (v || []).forEach((t, i) => { if (cx[i]) cx[i].value = t; }); },
        respondido: () => cx.some(c => c.value.trim() !== ''),
        pintar: mostrar => cx.forEach((c, i) => { const ok = okCaixa(it.res[i], c.value); c.classList.toggle('certo', ok); c.classList.toggle('errado', !ok && (c.value.trim() !== '' || mostrar)); }),
        mostrar: () => cx.forEach((c, i) => { if (!okCaixa(it.res[i], c.value)) { c.dataset.tinha = c.value; c.value = mostrarRes(it.res[i]); c.classList.add('mostrado'); } }),
        bloquear: () => cx.forEach(c => { c.readOnly = true; }),
      };
    },
    corrigir: (it, v) => Array.isArray(v) && it.res.every((r, i) => okCaixa(r, v[i])),
    certa: it => it.res.map(mostrarRes).join(' · '),
  });
  // quantas caixas certas (para a correção mostrar «4 de 6 caixas»)
  R.fichaCaixas = (it, v) => Array.isArray(v) ? it.res.filter((r, i) => okCaixa(r, v[i])).length : 0;

  // ------------------------------------------------------------ ajudas para escrever as fichas
  const B = i => `[[${i}]]`;
  const tab = (cab, linhas, cls) => `<table class="it-tabela rv-fx-tab ${cls || ''}"><thead><tr>${cab.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${linhas.map(l => `<tr>${l.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const lin = l => `<div class="rv-fx-lin">${l}</div>`;
  const ficha = (pergunta, instr, html, res, explica, extra) => Object.assign({ tipo: 'ficha', pergunta, instr, html, res, explica }, extra || {});
  const def = (tema, k, f) => R.G[tema].push({ k, f });
  const comp = (k, nome) => { R.COMPETENCIAS[k] = nome; };
  const ORD = ['CM', 'DM', 'UM', 'C', 'D', 'U'];
  const grande = r => ri(r, 1, 9) * 100000 + ri(r, 0, 99999);

  // ===== Números (págs. 6, 19, 23, 25, 41 do manual)
  def('num', 'f-ant-suc', r => {
    const base = [pick(r, [9999, 10010, 25999, 45000, 9099, 12500, 99999, 100000, 199899, 39990, 70000]), ri(r, 1, 9) * 10000 + 9999, ri(r, 10, 99) * 1000, grande(r)];
    const ns = mist(r, base).slice(0, 3); const res = [], ls = [];
    ns.forEach(n => { ls.push([B(res.length), `<b>${fmt(n)}</b>`, B(res.length + 1)]); res.push(n - 1, n + 1); });
    return ficha('Completa a tabela com o antecessor e o sucessor de cada número.', 'Antecessor = −1 · Sucessor = +1', tab(['antecessor', 'número', 'sucessor'], ls), res, 'O antecessor vem logo antes (−1) e o sucessor logo a seguir (+1). Cuidado com as passagens de ordem (9 999 → 10 000).');
  });
  comp('f-ant-suc', 'Antecessor e sucessor');
  def('num', 'f-quadros', r => {
    const res = [], blocos = [[1000, ri(r, 10, 99) * 1000 + ri(r, 0, 999)], [100, ri(r, 10, 99) * 1000 + ri(r, 0, 9) * 100 + 56], [10, ri(r, 10, 99) * 1000 + ri(r, 0, 99) * 10]];
    const html = `<div class="rv-fx-quadros">${blocos.map(([k, n]) => { const s = `<div class="rv-fx-q"><small>−${fmt(k)}</small><small>+${fmt(k)}</small>${B(res.length)}<b>${fmt(n)}</b>${B(res.length + 1)}</div>`; res.push(n - k, n + k); return s; }).join('')}</div>`;
    return ficha('Completa os quadros.', 'À esquerda tira, à direita junta o que está escrito por cima.', html, res, 'Só muda a ordem do número que se tira ou junta (milhares, centenas ou dezenas).');
  });
  comp('f-quadros', 'Somar e tirar 10, 100, 1000… mentalmente');
  def('num', 'f-mais-100-1000', r => {
    const D = [() => { const c = ri(r, 120, 999), d = ri(r, 1, 9); return [`${c} centenas e ${d} dezenas`, c * 100 + d * 10]; }, () => { const u = ri(r, 12, 99), c = ri(r, 1, 9); return [`${u} unidades de milhar e ${c} centenas`, u * 1000 + c * 100]; }, () => { const m = ri(r, 101, 299), c = ri(r, 1, 9); return [`${m} milhares e ${c} centenas`, m * 1000 + c * 100]; }];
    const res = [], ls = [];
    mist(r, D).slice(0, 2).forEach(f => { const [t, n] = f(); ls.push([t, B(res.length), B(res.length + 1), B(res.length + 2)]); res.push(n, n + 100, n + 1000); });
    return ficha('Escreve os números e adiciona-lhes os valores indicados.', '', tab(['', 'número', '+100', '+1000'], ls), res, '10 centenas = 1 milhar. Escreve o número primeiro e depois junta 100 e 1000.');
  });
  comp('f-mais-100-1000', 'Trocas entre ordens (10 C = 1 UM…)');
  def('num', 'f-esquema-100000', r => {
    const dez = r() < 0.3, T = dez ? 10000 : 100000;
    const P = dez ? [['9000 +', 1000], ['9900 +', 100], ['9990 +', 10], ['9999 +', 1], ['1000 ×', 10], ['2 ×', 5000], ['5000 +', 5000], ['100 ×', 100]]
      : [['90 000 +', 10000], ['99 500 +', 500], ['99 900 +', 100], ['99 990 +', 10], ['99 999 +', 1], ['10 000 ×', 10], ['2 ×', 50000], ['100 ×', 1000], ['1000 ×', 100], ['50 000 +', 50000]];
    const esc = mist(r, P).slice(0, 6), res = esc.map(p => p[1]);
    const html = `<div class="rv-fx-esq"><div class="rv-fx-centro">${fmt(T)}<small>${dez ? 'dez mil' : 'cem mil'}</small></div>${esc.map((p, i) => `<div class="rv-fx-ramo">${p[0].replace(/(\d) (\d)/g, '$1' + NB + '$2')} ${B(i)}</div>`).join('')}</div>`;
    return ficha(`Completa o esquema: todas as contas têm de dar ${fmt(T)}.`, '', html, res, `${fmt(T)} = ${esc.map(p => p[0] + ' ' + fmt(p[1])).join(' = ')}.`);
  });
  comp('f-esquema-100000', 'Compor o 100 000 e o 10 000');
  def('num', 'f-ordens-tabela', r => {
    const n = grande(r), d = String(n).split('');
    const html = `<p class="rv-fx-num">«${U.extenso(n).replace(/^./, c => c.toUpperCase())}»</p>` + tab(ORD, [d.map((_, i) => B(i))], 'rv-fx-ordens') + lin(`Leitura por classes: ${B(6)} milhares e ${B(7)} unidades`);
    return ficha('Escreve o número na tabela, um algarismo em cada ordem, e faz a leitura por classes.', 'CM DM UM = classe dos milhares · C D U = classe das unidades', html, [...d.map(Number), Math.floor(n / 1000), n % 1000], `${fmt(n)}: ${d.map((x, i) => x + ' ' + ORD[i]).join(', ')} → ${Math.floor(n / 1000)} milhares e ${n % 1000} unidades.`);
  });
  comp('f-ordens-tabela', 'Ordens e classes (CM DM UM C D U)');
  def('num', 'f-escreve-numeros', r => {
    const A = [() => { const n = grande(r); return [U.extenso(n), n]; },
      () => { const a = ri(r, 1, 9), b = ri(r, 11, 999); return [`${a === 1 ? 'Uma dezena' : U.extenso(a) + ' dezenas'} de milhar e ${U.extenso(b)} unidades`, a * 10000 + b]; },
      () => { const a = ri(r, 1, 9), b = ri(r, 1, 9), c = ri(r, 1, 9), d = ri(r, 1, 9); return [`${a} dezenas de milhar, ${b} unidades de milhar, ${c} dezenas e ${d} unidades`, a * 10000 + b * 1000 + c * 10 + d]; },
      () => { const a = ri(r, 11, 99), b = ri(r, 101, 999); return [`${U.extenso(a)} mil e ${U.extenso(b)} unidades`.replace(/^./, c => c.toUpperCase()), a * 1000 + b]; },
      () => { const c = ri(r, 1, 9), u = ri(r, 1, 9), cc = ri(r, 1, 9), dd = ri(r, 1, 9); return [`${U.extenso(c)} centenas de milhar, zero dezenas de milhar, ${U.extenso(u)} unidades de milhar, ${U.extenso(cc)} centenas e ${U.extenso(dd)} dezenas`, c * 100000 + u * 1000 + cc * 100 + dd * 10]; }];
    const esc = mist(r, A).slice(0, 4).map(f => f()), res = esc.map(e => e[1]);
    return ficha('Escreve os números com algarismos.', 'Cuidado com as ordens que faltam: escreve 0 nesse lugar.', esc.map((e, i) => lin(`<span class="rv-fx-et">${'abcd'[i]})</span> ${e[0].replace(/^./, c => c.toUpperCase())} → ${B(i)}`)).join(''), res, esc.map(e => fmt(e[1])).join(' · '));
  });
  comp('f-escreve-numeros', 'Escrever números com algarismos');
  def('num', 'f-valor-destacado', r => {
    const res = [], ls = [];
    for (let k = 0; k < 4; k++) { const n = pick(r, [ri(r, 100, 999), ri(r, 1000, 9999), ri(r, 10000, 99999), grande(r)]), s = String(n), p = ri(r, 0, s.length - 1), d = Number(s[p]);
      if (!d) { k--; continue; }
      const comEsp = s.split('').map((c, i) => (i && (s.length - i) % 3 === 0 ? NB : '') + (i === p ? `<b class="rv-fx-dest">${c}</b>` : c)).join('');
      ls.push(lin(`<span class="rv-fx-et">${'abcd'[k]})</span> ${comEsp} representa ${B(k)} unidades`)); res.push(d * Math.pow(10, s.length - 1 - p)); }
    return ficha('Indica o número de unidades que representa o algarismo destacado em cada um dos números.', '', ls.join(''), res, 'Põe zeros à direita do algarismo destacado até ao fim do número.');
  });
  comp('f-valor-destacado', 'Valor de cada algarismo (posição)');
  def('num', 'f-decompor', r => {
    const ns = [grande(r), ri(r, 100, 999) * 1000 + ri(r, 0, 999)], res = [], ls = [];
    ns.forEach((n, k) => { const partes = String(n).split('').map((d, i, a) => d * Math.pow(10, a.length - 1 - i)).filter(Boolean);
      const vazio = mist(r, partes.map((_, i) => i)).slice(0, Math.min(3, partes.length - 1));
      ls.push(lin(`<span class="rv-fx-et">${'ab'[k]})</span> ${fmt(n)} = ${partes.map((p, i) => vazio.includes(i) ? (res.push(p), B(res.length - 1)) : fmt(p)).join(' + ')}`)); });
    const a = ri(r, 1, 9), b = ri(r, 0, 9), c = ri(r, 0, 9), d = ri(r, 1, 9), m = ri(r, 1, 2) === 1 ? 1 : ri(r, 10, 45);
    const v = m * a * 1000 + b * 100 + c * 10 + d;
    ls.push(lin(`<span class="rv-fx-et">c)</span> (${m * a} × 1000) + (${b} × 100) + (${c} × 10) + (${d} × 1) = ${B(res.length)}`)); res.push(v);
    return ficha('Decompõe e compõe os números.', '', ls.join(''), res, 'Cada algarismo vale o algarismo × a sua ordem (1, 10, 100, 1000…).');
  });
  comp('f-decompor', 'Compor e decompor números');
  def('num', 'f-abaco-decomp', r => {
    let n = ri(r, 10000, 99999); const s = String(n).split(''); if (r() < 0.5) { s[ri(r, 1, 4)] = '0'; n = Number(s.join('')); }
    const d = String(n).split('').map(Number), k = [10000, 1000, 100, 10, 1];
    const html = `<div class="rv-fx-fig">${U.svgAbaco(n)}</div>` + lin(`${B(0)} = ${d.map((x, i) => `${B(i + 1)} × ${fmt(k[i])}`).join(' + ')}`);
    return ficha('Escreve o número representado no ábaco e completa a decomposição.', 'Conta as contas de cada vareta (uma vareta vazia é um 0).', html, [n, ...d], `${fmt(n)} = ${d.map((x, i) => x + ' × ' + fmt(k[i])).join(' + ')}.`);
  });
  comp('f-abaco-decomp', 'Ler números no ábaco');
  def('num', 'f-leitura-ordens', r => {
    const n = grande(r), d = String(n).split('').map(Number);
    const html = `<p class="rv-fx-num">${fmt(n)}</p>` + lin(`Leitura por ordens: ${B(0)} centenas de milhar, ${B(1)} dezenas de milhar, ${B(2)} unidades de milhar, ${B(3)} centenas, ${B(4)} dezenas e ${B(5)} unidades`)
      + lin(`Outras leituras: ${B(6)} centenas e ${n % 100} unidades · ${B(7)} dezenas e ${n % 10} unidades`);
    return ficha('Faz as várias leituras do número.', '', html, [...d, Math.floor(n / 100), Math.floor(n / 10)], `${fmt(n)}: ${Math.floor(n / 100)} centenas e ${n % 100} unidades; ${Math.floor(n / 10)} dezenas e ${n % 10} unidades.`);
  });
  comp('f-leitura-ordens', 'Outras leituras (centenas, milhares)');

  // ===== Cálculo (págs. 8, 9, 10, 26, 27 do manual)
  def('ops', 'f-sub-subtrativo', r => {
    const a = ri(r, 450, 9999), c = ri(r, 1, Math.min(9, Math.floor((a - 99) / 100))) * 100, d = ri(r, 1, 9) * 10, u = ri(r, 1, 9), b = c + d + u;
    if (b >= a) return null;
    return ficha(`Subtrai decompondo apenas o subtrativo: ${fmt(a)} − ${b}`, CAD, lin(`${fmt(a)} − ${b} = ${fmt(a)} − ${c} − ${d} − ${u} = ${B(0)} − ${d} − ${u} = ${B(1)} − ${u} = ${B(2)}`), [a - c, a - c - d, a - b], `${fmt(a)} − ${c} = ${fmt(a - c)}; − ${d} = ${fmt(a - c - d)}; − ${u} = ${fmt(a - b)}.`, { caderno: true });
  });
  comp('f-sub-subtrativo', 'Subtrair por decomposição');
  def('ops', 'f-sub-ambos', r => {
    const da = [ri(r, 3, 9), ri(r, 2, 9), ri(r, 2, 9), ri(r, 2, 9)], db = da.map(x => ri(r, 1, x - 1)), K = [1000, 100, 10, 1];
    const a = da.reduce((t, x, i) => t + x * K[i], 0), b = db.reduce((t, x, i) => t + x * K[i], 0), dif = da.map((x, i) => (x - db[i]) * K[i]);
    return ficha(`Subtrai decompondo o aditivo e o subtrativo: ${fmt(a)} − ${fmt(b)}`, CAD,
      lin(`${fmt(a)} − ${fmt(b)} = ${da.map((x, i) => `(${fmt(x * K[i])} − ${fmt(db[i] * K[i])})`).join(' + ')}`) + lin(`= ${B(0)} + ${B(1)} + ${B(2)} + ${B(3)} = ${B(4)}`), [...dif, a - b], `${dif.map(fmt).join(' + ')} = ${fmt(a - b)}.`, { caderno: true });
  });
  comp('f-sub-ambos', 'Subtrair por decomposição');
  def('ops', 'f-adi-parcelas', r => {
    const a = ri(r, 1100, 4999), b = ri(r, 111, 899), [am, ac, ad, au] = [Math.floor(a / 1000) * 1000, Math.floor(a % 1000 / 100) * 100, Math.floor(a % 100 / 10) * 10, a % 10], [bc, bd, bu] = [Math.floor(b / 100) * 100, Math.floor(b % 100 / 10) * 10, b % 10];
    return ficha(`Adiciona decompondo ambas as parcelas: ${fmt(a)} + ${b}`, CAD, lin(`${fmt(a)} + ${b} = (${fmt(am)} + ${ac} + ${ad} + ${au}) + (${bc} + ${bd} + ${bu})`) + lin(`= ${fmt(am)} + ${B(0)} + ${B(1)} + ${B(2)} = ${B(3)}`),
      [ac + bc, ad + bd, au + bu, a + b], `Junta centenas com centenas, dezenas com dezenas e unidades com unidades: ${fmt(am)} + ${ac + bc} + ${ad + bd} + ${au + bu} = ${fmt(a + b)}.`, { caderno: true });
  });
  comp('f-adi-parcelas', 'Adicionar por decomposição');
  def('ops', 'f-redondos', r => {
    const ls = [], res = [];
    for (let k = 0; k < 2; k++) { const big = r() < 0.5 ? 1000 : 100; const x = ri(r, 1, 9) * 5 * big / 10 * 2; const y = 10 * big - x; const z = ri(r, 1000, 9000) + (big === 1000 ? ri(r, 1, 50) * 1000 : 0);
      if (y <= 0) { k--; continue; }
      const ordem = mist(r, [['x', x], ['z', z], ['y', y]]);
      ls.push(lin(`<span class="rv-fx-et">${'ab'[k]})</span> ${ordem.map(o => fmt(o[1])).join(' + ')} = ${B(res.length)} + ${fmt(z)} = ${B(res.length + 1)}`)); res.push(x + y, x + y + z); }
    return ficha('Calcula adicionando primeiro os números cujas somas formam «números redondos».', 'Procura os dois que juntos dão um número redondo (10 000, 1000…).', ls.join(''), res, 'Primeiro os números redondos, depois o resto.');
  });
  comp('f-redondos', 'Cálculo com números redondos');
  def('ops', 'f-mul-decomp', r => {
    const a = ri(r, 3, 9), b = ri(r, 1, 5) * 100 + ri(r, 1, 9) * 10 + ri(r, 1, 9), [c, d, u] = [Math.floor(b / 100) * 100, Math.floor(b % 100 / 10) * 10, b % 10];
    return ficha(`Multiplica decompondo um dos fatores: ${a} × ${b}`, CAD, lin(`${a} × ${b} = (${a} × ${c}) + (${a} × ${d}) + (${a} × ${u}) = ${B(0)} + ${B(1)} + ${B(2)} = ${B(3)}`), [a * c, a * d, a * u, a * b], `${a * c} + ${a * d} + ${a * u} = ${fmt(a * b)}.`, { caderno: true });
  });
  comp('f-mul-decomp', 'Multiplicação por um algarismo');
  def('ops', 'f-div-decomp', r => {
    const b = ri(r, 2, 6), x = ri(r, 1, 3) * 100 * b, y = b * ri(r, 2, 9), D = x + y;
    return ficha(`Divide decompondo o dividendo: ${D} : ${b}`, CAD, lin(`${D} : ${b} = (${x} : ${b}) + (${y} : ${b}) = ${B(0)} + ${B(1)} = ${B(2)}`), [x / b, y / b, D / b], `${x} : ${b} = ${x / b}; ${y} : ${b} = ${y / b}; quociente ${D / b}.`, { caderno: true });
  });
  comp('f-div-decomp', 'Dividir por decomposição');
  def('ops', 'f-algoritmo', r => {
    const sub = r() < 0.5, a = ri(r, sub ? 1200 : 400, 9999), b = sub ? ri(r, 300, a - 100) : ri(r, 300, 9999 - a), v = sub ? a - b : a + b;
    const L = Math.max(String(a).length, String(b).length, String(v).length), col = s => String(s).padStart(L, ' ').split('');
    const linha = (dig, sinal) => `<tr><td class="rv-alg-s">${sinal || ''}</td>${dig.map(d => `<td>${d.trim()}</td>`).join('')}</tr>`;
    const vs = String(v).padStart(L, ' ').split(''); let k = 0; const res = [];
    const html = `<table class="rv-alg">${linha(col(a))}${linha(col(b), sub ? '−' : '+')}<tr class="rv-alg-r"><td></td>${vs.map(d => d === ' ' ? '<td></td>' : (res.push(Number(d)), `<td>${B(k++)}</td>`)).join('')}</tr></table>`;
    return ficha(`${sub ? 'Subtrai' : 'Adiciona'} utilizando o algoritmo: ${fmt(a)} ${sub ? '−' : '+'} ${fmt(b)}`, 'Escreve um algarismo em cada caixa. Começa pelas unidades (à direita)!', html, res, `${fmt(a)} ${sub ? '−' : '+'} ${fmt(b)} = ${fmt(v)}.`, { caderno: true, larg: res.map(() => '44px') });
  });
  comp('f-algoritmo', 'Algoritmo da adição e da subtração');

  // ===== Problemas com várias perguntas (págs. 20, 21, 28, 29, 43)
  def('pro', 'f-coracao', r => {
    const b = pick(r, [60, 70, 80]), h1 = b * 60, hs = ri(r, 2, 10);
    return ficha('Lê o que diz o Doc e responde.', `«Sabias que o coração bate cerca de ${fmt(h1)} vezes por hora?»`, lin(`a) Quantas vezes bate em ${hs} horas? ${B(0)} vezes`) + lin(`b) E em meia hora? ${B(1)} vezes`) + lin(`c) E num minuto? ${B(2)} vezes`), [h1 * hs, h1 / 2, b], `${fmt(h1)} × ${hs} = ${fmt(h1 * hs)}; metade de ${fmt(h1)} = ${fmt(h1 / 2)}; ${fmt(h1)} : 60 = ${b}.`, { caderno: true });
  });
  comp('f-coracao', 'Problemas com vários passos');
  def('pro', 'f-refeicoes', r => {
    const a = ri(r, 245, 480), d = 5, t = a * d;
    return ficha(`Na escola do Tomás são servidas, por dia, cerca de ${a} refeições.`, CAD, lin(`a) Ao fim de ${d} dias, quantas refeições são servidas? ${B(0)}`) + lin(`b) Quantas refeições faltam para chegar a uma dezena de milhar? ${B(1)}`), [t, 10000 - t], `${a} × ${d} = ${fmt(t)}; 10 000 − ${fmt(t)} = ${fmt(10000 - t)}.`, { caderno: true });
  });
  comp('f-refeicoes', 'Problemas com vários passos');
  def('pro', 'f-turmas', r => {
    const a = ri(r, 20, 26), b = ri(r, 20, 26), cd = ri(r, 20, 26), e = ri(r, 18, 26), tot = a + b + 2 * cd + e;
    return ficha('Todas as turmas do 4.º ano foram à visita de estudo.', `Há 5 turmas. A turma A tem ${a} alunos, a B tem ${b} e as turmas C e D têm ${cd} alunos cada uma. No total estão matriculados ${tot} alunos.`,
      lin(`a) Quantos alunos têm as turmas A, B, C e D juntas? ${B(0)}`) + lin(`b) Quantos alunos tem a turma E? ${B(1)}`) + lin(`c) Os autocarros têm 50 lugares e cada turma leva 2 adultos. Quantos autocarros são precisos? ${B(2)}`),
      [a + b + 2 * cd, e, Math.ceil((tot + 10) / 50)], `${a} + ${b} + ${cd} + ${cd} = ${a + b + 2 * cd}; ${tot} − ${a + b + 2 * cd} = ${e}; ${tot} alunos + 10 adultos = ${tot + 10} → ${Math.ceil((tot + 10) / 50)} autocarros.`, { caderno: true });
  });
  comp('f-turmas', 'Problemas com vários passos');
  def('pro', 'f-morangos', r => {
    const g = pick(r, [250, 500]), n = 1000 / g, p = pick(r, [2, 3, 2.5]), q = n * (g === 500 ? 2 : 1);
    return ficha(`Os morangos vêm em embalagens de ${g}${NB}g, a ${U.euros(p)} cada uma.`, CAD, lin(`a) Quantas embalagens são precisas para 1${NB}kg? ${B(0)}`) + lin(`b) Se comprares ${q} embalagens e pagares com uma nota de 20${NB}€, quanto recebes de troco? ${B(1)} €`),
      [n, Math.round((20 - q * p) * 100) / 100], `1 kg = 1000 g; 1000 : ${g} = ${n}. ${q} × ${U.euros(p)} = ${U.euros(q * p)}; 20 € − ${U.euros(q * p)} = ${U.euros(20 - q * p)}.`, { caderno: true });
  });
  comp('f-morangos', 'Problemas de dinheiro e troco');
  def('pro', 'f-ossos', r => {
    const m = ri(r, 26, 28), p = ri(r, 25, 27);
    return ficha('Interpreta, pensa e resolve!', `O esqueleto humano adulto tem 206 ossos. Uma só mão tem ${m} ossos e um pé tem ${p}.`, lin(`a) Quantos ossos têm as duas mãos? ${B(0)}`) + lin(`b) E os dois pés e as duas mãos juntos? ${B(1)}`) + lin(`c) Quantos ossos sobram para o resto do corpo? ${B(2)}`),
      [2 * m, 2 * m + 2 * p, 206 - 2 * m - 2 * p], `2 × ${m} = ${2 * m}; + 2 × ${p} = ${2 * m + 2 * p}; 206 − ${2 * m + 2 * p} = ${206 - 2 * m - 2 * p}.`, { caderno: true });
  });
  comp('f-ossos', 'Problemas com vários passos');

  // ===== Frações (págs. 9, 22)
  def('fra', 'f-chocolate', r => {
    const t = 12, a = ri(r, 2, 4), b = ri(r, 3, 6);
    let g = ''; for (let i = 0; i < t; i++) g += `<rect x="${8 + (i % 4) * 46}" y="${8 + Math.floor(i / 4) * 36}" width="42" height="32" rx="4" fill="#8a5a2b" stroke="#4a2e12"/>`;
    return ficha('Lê o diálogo entre o Tomás e a Maria e escreve as frações.', `Maria: «Trouxe este chocolate com ${t} quadradinhos iguais. Eu vou comer ${b}.» Tomás: «Obrigado, Maria, mas eu só quero ${a} quadradinhos.»`,
      `<div class="rv-fx-fig"><svg viewBox="0 0 200 120" width="200">${g}</svg></div>` + lin(`a) O Tomás vai comer ${B(0)}/12 do chocolate e a Maria ${B(1)}/12.`) + lin(`b) Juntos comem ${a}/12 + ${b}/12 = ${B(2)}/12.`) + lin(`c) Sobra 12/12 − ${a + b}/12 = ${B(3)}/12.`),
      [a, b, a + b, t - a - b], `${a}/12 + ${b}/12 = ${a + b}/12; sobra ${t - a - b}/12.`);
  });
  comp('f-chocolate', 'Somar e subtrair frações');
  def('fra', 'f-pizzas', r => {
    const d = pick(r, [6, 8, 10]), a = ri(r, 2, d - 3), b = ri(r, 1, d - a - 1), c = ri(r, 3, d - 1), e = ri(r, 1, c - 1);
    return ficha('Adição e subtração de frações: completa.', 'Com o mesmo denominador, só se juntam ou tiram os numeradores.',
      lin(`a) ${a}/${d} + ${b}/${d} = ${B(0)}/${d}`) + lin(`b) ${c}/${d} − ${e}/${d} = ${B(1)}/${d}`) + lin(`c) ${d}/${d} = ${B(2)} (unidade)`), [a + b, c - e, 1], `${a} + ${b} = ${a + b}; ${c} − ${e} = ${c - e}; ${d}/${d} = 1.`);
  });
  comp('f-pizzas', 'Somar e subtrair frações');
  def('fra', 'f-fracoes-medidas', r => ficha('Completa as igualdades.', '', lin(`a) 1/2 kg = ${B(0)} g`) + lin(`b) 1/4 kg = ${B(1)} g`) + lin(`c) 1/1000 m = ${B(2)} mm`) + lin(`d) Meio metro = ${B(3)} cm`), [500, 250, 1, 50], '1 kg = 1000 g · 1 m = 1000 mm = 100 cm.'));
  comp('f-fracoes-medidas', 'Frações de medidas (½ kg, ¼ h…)');

  // ===== Sequências (págs. 7, 30, 31, 42)
  def('seq', 'f-seq-caixas', r => {
    const t = pick(r, ['soma', 'soma', 'dobro']); let s, k, termos;
    if (t === 'dobro') { s = ri(r, 1, 3); termos = [0, 1, 2, 3, 4, 5].map(i => s * Math.pow(2, i)); k = '× 2'; }
    else { const P = pick(r, [[100000, 10], [100000, 500], [100000, 150000], [12, 6], [2670, 100], [ri(r, 1, 9) * 1000, 250]]); s = P[0]; termos = [0, 1, 2, 3, 4, 5].map(i => s + i * P[1]); k = '+ ' + fmt(P[1]); }
    const html = `<div class="rv-fx-cadeia">${termos.map((v, i) => (i ? `<span class="rv-fx-seta">${k.replace(' ', NB)}</span>` : '') + (i < 3 ? `<span class="rv-fx-elo">${fmt(v)}</span>` : `<span class="rv-fx-elo">${B(i - 3)}</span>`)).join('')}</div>`;
    return ficha('Descobre a regra e completa a sequência.', '', html, termos.slice(3), `Regra: ${k}. ${termos.map(fmt).join(', ')}.`);
  });
  comp('f-seq-caixas', 'Sequências numéricas');
  def('seq', 'f-tabela-termos', r => {
    const a = ri(r, 2, 5), b = ri(r, 1, 3), ord = [1, 2, 3, 4, 5, 10], vazias = [2, 3, 4, 5];
    const ls = ord.map((n, i) => [n, vazias.includes(i) ? B(vazias.indexOf(i)) : `${a} × ${n} + ${b} = ${a * n + b}`]);
    return ficha('Observa a regra e completa a tabela.', `Regra: número de bolas = ${a} × número de ordem + ${b}.`, tab(['Número de ordem', 'Número de bolas'], ls), vazias.map(i => a * ord[i] + b), `Figura 10: ${a} × 10 + ${b} = ${a * 10 + b}.`);
  });
  comp('f-tabela-termos', 'Termo de ordem n (regra)');
  def('seq', 'f-quadrados-palitos', r => ficha('Observa as figuras: quadrados cada vez maiores (1, 4, 9, 16 quadradinhos…).', '', lin(`a) Quantos quadradinhos terá a figura 5? ${B(0)}`) + lin(`b) E a figura 10? ${B(1)}`) + lin(`c) Com palitos, 1 triângulo = 3 palitos, 2 triângulos = 5, 3 = 7… Para 10 triângulos? ${B(2)} palitos`), [25, 100, 21], 'Figura n tem n × n quadradinhos; cada triângulo novo junta 2 palitos: 3 + 9 × 2 = 21.'));
  comp('f-quadrados-palitos', 'Sequências de figuras');

  // ===== Geometria (págs. 32–35, 38)
  const SOL = { 'prisma triangular': [9, 6, 5], 'prisma quadrangular': [12, 8, 6], 'prisma pentagonal': [15, 10, 7], 'prisma hexagonal': [18, 12, 8], 'pirâmide triangular': [6, 4, 4], 'pirâmide quadrangular': [8, 5, 5], 'pirâmide pentagonal': [10, 6, 6], 'pirâmide hexagonal': [12, 7, 7] };
  def('geo', 'f-solidos-tabela', r => {
    const esc = mist(r, Object.keys(SOL)).slice(0, 3), res = [], ls = esc.map(n => { const l = [n.replace(/^./, c => c.toUpperCase()), B(res.length), B(res.length + 1), B(res.length + 2)]; res.push(...SOL[n]); return l; });
    return ficha('Completa a tabela.', 'Desenha os sólidos no caderno se precisares.', tab(['Nome', 'Número de arestas', 'Número de vértices', 'Número de faces'], ls), res, esc.map(n => `${n}: ${SOL[n].join(', ')}`).join(' · '));
  });
  comp('f-solidos-tabela', 'Faces, vértices e arestas');
  def('geo', 'f-solido-descricao', r => {
    const n = pick(r, [[3, 'triangular', 'triangulares'], [5, 'pentagonal', 'pentagonais'], [6, 'hexagonal', 'hexagonais'], [4, 'quadrangular', 'quadrangulares']]), prisma = r() < 0.5;
    const html = prisma ? lin(`O prisma ${n[1]} tem duas bases ${B(0)} e ${B(1)} faces laterais ${B(2)}.`) : lin(`A pirâmide ${n[1]} tem uma base ${B(0)} e ${B(1)} faces laterais ${B(2)}.`);
    const base = prisma ? [n[2], n[2].replace('quadrangulares', 'quadradas')] : [n[1], n[1].replace('quadrangular', 'quadrada')];
    return ficha('Completa a descrição do sólido.', 'Escreve as palavras: por exemplo «pentagonais», «retangulares», «triangulares».', html, [base, n[0], prisma ? ['retangulares', 'retângulos'] : ['triangulares', 'triângulos']], prisma ? 'Os prismas têm 2 bases iguais e faces laterais retangulares.' : 'As pirâmides têm 1 base e faces laterais triangulares.', { larg: ['150px', '60px', '150px'] });
  });
  comp('f-solido-descricao', 'Prismas e pirâmides');
  def('geo', 'f-area-perimetro', r => {
    const c = ri(r, 3, 6), l = ri(r, 2, 4); let g = '';
    for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) g += `<rect x="${10 + i * 30}" y="${10 + j * 30}" width="30" height="30" fill="${i < c && j < l ? '#9ccc65' : '#fff'}" stroke="#c9d6e8"/>`;
    return ficha('Observa a figura verde (cada quadradinho tem 1 cm de lado).', '', `<div class="rv-fx-fig"><svg viewBox="0 0 260 200" width="260">${g}</svg></div>` + lin(`Área: ${B(0)} cm²`) + lin(`Perímetro: ${B(1)} cm`) + lin(`Um quadrado com o mesmo perímetro tem de lado ${B(2)} cm`),
      [c * l, 2 * (c + l), (c + l) / 2], `Área = ${c} × ${l} = ${c * l} cm²; perímetro = ${c} + ${l} + ${c} + ${l} = ${2 * (c + l)} cm; lado do quadrado = ${2 * (c + l)} : 4.`);
  });
  comp('f-area-perimetro', 'Área e perímetro');

  // ===== Medidas (págs. 11, 12)
  def('med', 'f-medidas', r => {
    const km = ri(r, 2, 9), m = pick(r, [2, 3, 5]), kg = ri(r, 1, 4);
    return ficha('Completa.', '1 m = 100 cm · 1 m = 1000 mm · 1 km = 1000 m · 1 kg = 1000 g', lin(`a) O Tomás caminhou ${km} km = ${B(0)} m`) + lin(`b) Meio metro = ${B(1)} cm`) + lin(`c) ${m} m = ${B(2)} mm`) + lin(`d) ${kg} kg e meio = ${B(3)} g`), [km * 1000, 50, m * 1000, kg * 1000 + 500], 'Multiplica pela relação entre as unidades.');
  });
  comp('f-medidas', 'Medidas de comprimento');

  // ===== Dados (págs. 13, 36, 40, 43)
  def('dad', 'f-caule-folhas', r => {
    const moda = ri(r, 10, 32), d = [moda, moda, moda]; while (d.length < 21) { const v = ri(r, 0, 34); if (d.filter(x => x === v).length < 2 && v !== moda) d.push(v); }
    const cs = {}; d.forEach(v => (cs[Math.floor(v / 10)] = cs[Math.floor(v / 10)] || []).push(v % 10));
    const diag = Object.keys(cs).sort((a, b) => a - b).map(c => `<tr><td class="rv-cf-c">${c}</td><td>${cs[c].sort((a, b) => a - b).join(' ')}</td></tr>`).join('');
    return ficha('Completa de acordo com os dados do diagrama de caule-e-folhas.', 'Número de dias em que cada aluno foi à praia durante as férias. (2 | 5 quer dizer 25)',
      `<div class="rv-fx-cf"><table class="rv-cf"><thead><tr><th>caule</th><th>folhas</th></tr></thead><tbody>${diag}</tbody></table><div>${lin(`Moda: ${B(0)}`)}${lin(`Valor máximo: ${B(1)}`)}${lin(`Valor mínimo: ${B(2)}`)}${lin(`Número de alunos: ${B(3)}`)}</div></div>`,
      [moda, Math.max(...d), Math.min(...d), d.length], `Moda ${moda} (aparece 3 vezes); máximo ${Math.max(...d)}; mínimo ${Math.min(...d)}; ${d.length} folhas = ${d.length} alunos.`);
  });
  comp('f-caule-folhas', 'Diagrama de caule-e-folhas');
  def('dad', 'f-frequencias', r => {
    const vals = [4, 5, 6, 7, 8, 9], fr = vals.map(() => ri(r, 1, 6)); const mx = Math.max(...fr); if (fr.filter(x => x === mx).length > 1) fr[fr.indexOf(mx)]++;
    const dados = mist(r, vals.flatMap((v, i) => Array(fr[i]).fill(v)));
    return ficha('Aula de Educação Física — registo das voltas dadas ao campo pelos alunos. Completa a tabela de frequências.', dados.join(', '),
      tab(['Número de voltas', 'Número de alunos'], vals.map((v, i) => [v, B(i)])) + lin(`Moda: ${B(6)} voltas`) + lin(`Total de alunos: ${B(7)}`), [...fr, vals[fr.indexOf(Math.max(...fr))], dados.length], `Conta quantas vezes aparece cada número (faz tracinhos). A moda é ${vals[fr.indexOf(Math.max(...fr))]}.`);
  });
  comp('f-frequencias', 'Moda e tabela de frequências');
  def('dad', 'f-pequeno-almoco', r => {
    const cats = ['Sumo e pão', 'Iogurte e pão', 'Leite e cereais', 'Leite e pão'], q = cats.map(() => ri(r, 1, 10)); const mx = Math.max(...q); if (q.filter(x => x === mx).length > 1) q[q.indexOf(mx)]++;
    const tr = n => '卌'.repeat(Math.floor(n / 5)) + '|'.repeat(n % 5);
    return ficha('Para conhecer os hábitos alimentares dos seus alunos, um professor registou o que comem ao pequeno-almoço. Completa a tabela.', '卌 = 5', tab(['Pequeno-almoço', 'Contagem', 'N.º de alunos'], cats.map((c, i) => [c, tr(q[i]), B(i)])) + lin(`Qual é a moda? ${B(4)}`) + lin(`Quantos alunos responderam? ${B(5)}`),
      [...q, [cats[q.indexOf(Math.max(...q))]], q.reduce((a, b) => a + b, 0)], `Moda: ${cats[q.indexOf(Math.max(...q))]}.`, { larg: [null, null, null, null, '170px'] });
  });
  comp('f-pequeno-almoco', 'Tabela de frequências');

  // ===== Pensamento computacional (págs. 4, 5, 34, 38)
  def('pc', 'f-binario-tabela', r => {
    const ns = mist(r, Array.from({ length: 30 }, (_, k) => k + 2)).slice(0, 3), b = n => n.toString(2).padStart(5, '0'), res = [];
    const ls = [[U.svgCartoes('01001').replace(/width="\d+"/, 'width="200"'), '01001', '9'], ...ns.map(n => { const l = [U.svgCartoes(b(n)).replace(/width="\d+"/, 'width="200"'), B(res.length), B(res.length + 1)]; res.push([b(n), b(n).replace(/^0+/, '')], n); return l; })];
    return ficha('Observa o exemplo e completa a tabela.', 'Cartão com pintas = 1 · cartão escuro = 0 (cartões 16 · 8 · 4 · 2 · 1)', tab(['Representação', 'Sistema de numeração binário', 'Sistema de numeração decimal'], ls, 'rv-fx-bin'), res, ns.map(n => `${b(n)} = ${n}`).join(' · '), { larg: res.map((x, i) => i % 2 ? '70px' : '110px') });
  });
  comp('f-binario-tabela', 'Sistema binário');
  def('pc', 'f-enigma-bolotas', r => {
    const a = pick(r, [10, 15, 20, 25]), m = ri(r, 2, 6) * 5 + (a === 25 ? 5 : 0), f = ri(r, 3, 12) * 10, x = pick(r, [10, 20, 70]);
    const P = s => `<img class="rv-peca" src="img/revisoes/peca-${s}.webp" alt="${s}">`;
    const html = `<div class="rv-enigma">${lin(`${P('bolota')} + ${P('bolota')} + ${P('bolota')} + ${P('bolota')} = ${4 * a}`)}${lin(`${P('bolota')} + ${P('cogumelo')} + ${P('cogumelo')} = ${a + 2 * m}`)}${lin(`${P('estrela')} − ${P('cogumelo')} = ${f - m}`)}</div>`
      + lin(`${P('bolota')} = ${B(0)} · ${P('cogumelo')} = ${B(1)} · ${P('estrela')} = ${B(2)}`) + lin(`${x} × ${P('estrela')} = ${B(3)}`);
    return ficha('Já resolvi este enigma! E tu?', 'Começa pela linha em que só aparece um símbolo.', html, [a, m, f, x * f], `bolota = ${4 * a} : 4 = ${a}; cogumelo = (${a + 2 * m} − ${a}) : 2 = ${m}; estrela = ${f - m} + ${m} = ${f}; ${x} × ${f} = ${x * f}.`, { caderno: true });
  });
  comp('f-enigma-bolotas', 'Enigmas e raciocínio');
  def('pc', 'f-mensagem-secreta', r => {
    const frases = [['EU TAMBEM ADORO A MATEMATICA', 'Eu também adoro a Matemática!'], ['VAMOS APRENDER JUNTOS', 'Vamos aprender juntos!'], ['O NICO GOSTA DE CONTAS', 'O Nico gosta de contas!'], ['A MATEMATICA E DIVERTIDA', 'A Matemática é divertida!']];
    const [fr] = pick(r, frases), cod = { A: '4', E: '3', T: '7', O: '0', I: '1', S: '5' };
    const enc = fr.split('').map(c => cod[c] || c).join('');
    const usados = Object.entries(cod).filter(([l]) => fr.includes(l));
    return ficha('Descobre esta mensagem secreta! Cada número esconde uma letra.', `«${enc}»`, usados.map(([l, n], i) => lin(`O ${n} é a letra ${B(i)}`)).join('') + lin(`Escreve a mensagem: ${B(usados.length)}`), [...usados.map(([l]) => [l]), [fr, fr + '!', fr.replace(/ /g, '')]], `Mensagem: «${fr}».`, { larg: [...usados.map(() => '50px'), '360px'] });
  });
  comp('f-mensagem-secreta', 'Padrões e códigos');
  def('pc', 'f-ovos-quadro', r => {
    const x2 = r() < 0.5 ? 1 : 2, g = [[3, 6, 12], [4, 8, 16], [5, 10, 20]].map(l => l.map(y => y * x2)), dz = ri(r, 5, 12), p = ri(r, 2, 5);
    const quadro = `<table class="it-tabela rv-fx-mag"><tbody>${g.map((l, i) => `<tr>${l.map((v, j) => `<td>${i === 2 && j === 2 ? B(0) : v}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    return ficha('Zupilândia — resolve os dois desafios.', '', lin('a) Que número falta no quadro?') + quadro + lin(`b) Trazia ${dz} dúzias de ovos e ${p} ovos de cada dúzia partiram-se. Quantos ovos ficaram inteiros? ${B(1)}`),
      [g[2][2], dz * (12 - p)], `Em cada linha, cada número é o dobro do anterior: ${g[2][1]} × 2 = ${g[2][2]}. Ovos: ${dz} × ${12 - p} = ${dz * (12 - p)}.`, { caderno: true });
  });
  comp('f-ovos-quadro', 'Padrões e códigos');
})();
