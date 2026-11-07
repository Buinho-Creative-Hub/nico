/* Nico · Capítulo especial — Revisões de Matemática do 3.º ano (para o teste de início do 4.º ano).
 *
 * Pedido do Carlos (7 Nov 2026), para o Jaime: muitos exercícios e jogos na onda das fichas do manual
 * (números até 999 999, operações, problemas, frações, sequências, sólidos, ângulos, área e perímetro, medidas,
 * dinheiro, horas, dados, probabilidades e o sistema binário do «pensamento computacional»).
 * Nas contas a criança faz o cálculo no caderno e escreve só o resultado; o Nico verifica.
 * Tudo é gerado ao acaso: cada treino e cada teste têm perguntas e números diferentes.
 *
 *   F.REV.TEMAS                        { id: { nome, cor, emoji } }
 *   F.REV.gerar(tema, rnd)             um item no formato de F.PC.itens (escolha, vf, ordenar, curta…)
 *   F.REV.teste(rnd)                   lista de itens do teste (todas as áreas, sem repetir o tipo de exercício)
 *   F.REV.mencao(pct)                  { nome, gemas, frase }
 *   F.REV.util                         ajudas (rnd com semente, extenso, fmt…) — usadas pelos jogos e pelos testes
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};

  // ------------------------------------------------------------ acaso
  function semente(s) {   // gerador com semente (para os testes automáticos poderem repetir); sem semente usa Math.random
    if (s == null) return Math.random;
    let x = (s >>> 0) || 1;
    return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
  }
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = (r, l) => l[Math.floor(r() * l.length)];
  const misturar = (r, l) => { const a = l.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const NB = ' ';
  const fmt = n => { const s = String(Math.abs(n)); let o = ''; for (let i = 0; i < s.length; i++) { if (i && (s.length - i) % 3 === 0) o += NB; o += s[i]; } return (n < 0 ? '−' : '') + o; };
  const euros = v => (Math.round(v * 100) / 100).toFixed(2).replace('.', ',') + NB + '€';
  let conta = 0;
  const nid = g => 'rv-' + g + '-' + (++conta) + '-' + Math.floor(Math.random() * 1e6).toString(36);
  // opções de escolha: a certa e as erradas (sem repetidas), baralhadas
  function opcoes(r, certa, erradas) {
    const lista = [String(certa)];
    erradas.map(String).forEach(e => { if (!lista.includes(e) && lista.length < 4) lista.push(e); });
    const m = misturar(r, lista);
    return { opcoes: m, certa: m.indexOf(String(certa)) };
  }
  const CADERNO = '📝 Faz a conta no caderno e escreve aqui só o resultado.';

  // ------------------------------------------------------------ números por extenso (pt-PT)
  const U = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove'];
  const D = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const C = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  function ate999(n) {
    if (n < 20) return U[n];
    if (n < 100) return D[Math.floor(n / 10)] + (n % 10 ? ' e ' + U[n % 10] : '');
    if (n === 100) return 'cem';
    return C[Math.floor(n / 100)] + (n % 100 ? ' e ' + ate999(n % 100) : '');
  }
  function extenso(n) {
    if (n < 1000) return ate999(n);
    const m = Math.floor(n / 1000), r = n % 1000;
    const mil = m === 1 ? 'mil' : ate999(m) + ' mil';
    if (!r) return mil;
    return mil + (r < 100 || r % 100 === 0 ? ' e ' : ', ') + ate999(r);
  }
  const Maiusc = t => t.charAt(0).toUpperCase() + t.slice(1);

  // ------------------------------------------------------------ figuras exatas (SVG)
  const NS = 'http://www.w3.org/2000/svg';
  const ORDENS = ['CM', 'DM', 'UM', 'C', 'D', 'U'];
  const CORES_ORDEM = ['#3a6fd8', '#2fa36b', '#e05a47', '#f2b632', '#8a5bd6', '#e0477f'];
  function svgAbaco(n) {
    const dig = String(n).padStart(6, '0').split('').map(Number);
    let g = `<rect x="10" y="190" width="440" height="22" rx="6" fill="#b07a45"/>`;
    dig.forEach((d, i) => {
      const x = 45 + i * 74;
      g += `<rect x="${x - 3}" y="30" width="6" height="162" fill="#8a5a2b"/>`;
      for (let k = 0; k < d; k++) g += `<rect x="${x - 22}" y="${172 - k * 15}" width="44" height="13" rx="6" fill="${CORES_ORDEM[i]}" stroke="#0003"/>`;
      g += `<text x="${x}" y="236" text-anchor="middle" font-size="18" font-weight="700" fill="#222">${ORDENS[i]}</text>`;
    });
    return `<svg xmlns="${NS}" viewBox="0 0 460 250" width="420" font-family="Asap, sans-serif">${g}</svg>`;
  }
  function svgFracao(r, num, den, forma) {
    let g = '';
    if (forma === 'circulo') {
      const c = 90, R = 80;
      for (let i = 0; i < den; i++) {
        const a0 = (i / den) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / den) * 2 * Math.PI - Math.PI / 2;
        const x0 = c + R * Math.cos(a0), y0 = c + R * Math.sin(a0), x1 = c + R * Math.cos(a1), y1 = c + R * Math.sin(a1);
        g += `<path d="M${c},${c} L${x0.toFixed(1)},${y0.toFixed(1)} A${R},${R} 0 ${den === 1 ? 1 : 0} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${i < num ? '#2fa36b' : '#fff'}" stroke="#222" stroke-width="2"/>`;
      }
      return `<svg xmlns="${NS}" viewBox="0 0 180 180" width="190">${g}</svg>`;
    }
    const w = 360 / den;
    for (let i = 0; i < den; i++) g += `<rect x="${10 + i * w}" y="10" width="${w}" height="70" fill="${i < num ? '#f2b632' : '#fff'}" stroke="#222" stroke-width="2"/>`;
    return `<svg xmlns="${NS}" viewBox="0 0 380 90" width="380">${g}</svg>`;
  }
  function svgQuadricula(celulas, lado) {
    const N = 7, s = 40;
    let g = '';
    for (let i = 0; i <= N; i++) g += `<line x1="${10 + i * s}" y1="10" x2="${10 + i * s}" y2="${10 + N * s}" stroke="#c9d6e8"/><line x1="10" y1="${10 + i * s}" x2="${10 + N * s}" y2="${10 + i * s}" stroke="#c9d6e8"/>`;
    celulas.forEach(([r, c]) => { g += `<rect x="${10 + c * s}" y="${10 + r * s}" width="${s}" height="${s}" fill="#5aa9e6" stroke="#1d4f86" stroke-width="2"/>`; });
    if (lado) g += `<text x="${10 + N * s / 2}" y="${N * s + 34}" text-anchor="middle" font-size="15" fill="#333">cada quadradinho tem ${lado}</text>`;
    return `<svg xmlns="${NS}" viewBox="0 0 ${N * s + 20} ${N * s + 44}" width="320" font-family="Asap, sans-serif">${g}</svg>`;
  }
  function svgAngulo(graus) {
    const c = [150, 130], R = 110;
    const a = -graus * Math.PI / 180;
    let g = `<line x1="${c[0]}" y1="${c[1]}" x2="${c[0] + R}" y2="${c[1]}" stroke="#222" stroke-width="5" stroke-linecap="round"/>`;
    if (graus === 360) {
      g += `<circle cx="${c[0]}" cy="${c[1]}" r="40" fill="#f2b63255" stroke="#e08a00" stroke-width="3"/>`;
    } else {
      g += `<line x1="${c[0]}" y1="${c[1]}" x2="${(c[0] + R * Math.cos(a)).toFixed(1)}" y2="${(c[1] + R * Math.sin(a)).toFixed(1)}" stroke="#222" stroke-width="5" stroke-linecap="round"/>`;
      if (graus === 90) g += `<path d="M${c[0] + 26},${c[1]} L${c[0] + 26},${c[1] - 26} L${c[0]},${c[1] - 26}" fill="none" stroke="#e08a00" stroke-width="3"/>`;
      else g += `<path d="M${c[0] + 40},${c[1]} A40,40 0 ${graus > 180 ? 1 : 0} 0 ${(c[0] + 40 * Math.cos(a)).toFixed(1)},${(c[1] + 40 * Math.sin(a)).toFixed(1)}" fill="none" stroke="#e08a00" stroke-width="3"/>`;
    }
    g += `<circle cx="${c[0]}" cy="${c[1]}" r="6" fill="#222"/>`;
    return `<svg xmlns="${NS}" viewBox="0 0 300 170" width="300">${g}</svg>`;
  }
  function svgCartoes(bits) {   // cartões de pintas do sistema binário (16 8 4 2 1)
    const valores = [16, 8, 4, 2, 1].slice(5 - bits.length);
    let g = '';
    valores.forEach((v, i) => {
      const x = 10 + i * 96, on = bits[i] === '1';
      g += `<rect x="${x}" y="10" width="84" height="110" rx="8" fill="${on ? '#fff' : '#264653'}" stroke="#222" stroke-width="2"/>`;
      if (on) {
        const cols = v >= 8 ? 4 : v >= 4 ? 2 : v, rows = Math.ceil(v / cols);
        for (let k = 0; k < v; k++) { const cx = x + 42 + ((k % cols) - (cols - 1) / 2) * 16, cy = 65 + (Math.floor(k / cols) - (rows - 1) / 2) * 16; g += `<circle cx="${cx}" cy="${cy}" r="6" fill="#e9a23b"/>`; }
      }
      g += `<text x="${x + 42}" y="142" text-anchor="middle" font-size="20" font-weight="700">${bits[i]}</text>`;
    });
    return `<svg xmlns="${NS}" viewBox="0 0 ${valores.length * 96 + 14} 152" width="${Math.min(480, valores.length * 96 + 14)}" font-family="Asap, sans-serif">${g}</svg>`;
  }
  function svgCartao(v, on) {   // um cartão de pintas (para os jogos)
    let g = `<rect x="4" y="4" width="84" height="110" rx="8" fill="${on ? '#fff' : '#264653'}" stroke="#222" stroke-width="2"/>`;
    if (on) { const cols = v >= 16 ? 8 : v >= 8 ? 4 : v >= 4 ? 2 : v, rows = Math.ceil(v / cols), esp = v >= 16 ? 9 : 16, r = v >= 16 ? 3.5 : 6;
      for (let k = 0; k < v; k++) g += `<circle cx="${46 + ((k % cols) - (cols - 1) / 2) * esp}" cy="${59 + (Math.floor(k / cols) - (rows - 1) / 2) * esp}" r="${r}" fill="#e9a23b"/>`; }
    g += `<text x="46" y="138" text-anchor="middle" font-size="18" font-weight="700" font-family="Asap, sans-serif">${v}</text>`;
    return `<svg xmlns="${NS}" viewBox="0 0 92 146" width="92">${g}</svg>`;
  }
  function svgPlanificacao(cels) {
    const s = 28, maxr = Math.max(...cels.map(c => c[0])), maxc = Math.max(...cels.map(c => c[1]));
    let g = '';
    cels.forEach(([r, c]) => { g += `<rect x="${6 + c * s}" y="${6 + r * s}" width="${s}" height="${s}" fill="#f6c25b" stroke="#7a4a00" stroke-width="2"/>`; });
    return `<svg xmlns="${NS}" viewBox="0 0 ${(maxc + 1) * s + 12} ${(maxr + 1) * s + 12}" width="${(maxc + 1) * s + 12}">${g}</svg>`;
  }
  function svgSequenciaFiguras(termo, n) {   // figuras 1..n de uma sequência de quadrados
    let g = '', x = 10;
    const s = 16;
    for (let k = 1; k <= n; k++) {
      const cels = termo(k);
      const w = (Math.max(...cels.map(c => c[1])) + 1) * s, hgt = (Math.max(...cels.map(c => c[0])) + 1) * s;
      cels.forEach(([r, c]) => { g += `<rect x="${x + c * s}" y="${120 - hgt + r * s}" width="${s}" height="${s}" fill="#7fc97f" stroke="#2d6a2d"/>`; });
      g += `<text x="${x + w / 2}" y="145" text-anchor="middle" font-size="14">Fig. ${k}</text>`;
      x += w + 30;
    }
    return `<svg xmlns="${NS}" viewBox="0 0 ${x} 155" width="${Math.min(520, x)}" font-family="Asap, sans-serif">${g}</svg>`;
  }
  function svgCoordenadas(col, lin, simbolo) {
    const L = 'abcdefgh', s = 38;
    let g = '';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) g += `<rect x="${30 + c * s}" y="${10 + r * s}" width="${s}" height="${s}" fill="${(r + c) % 2 ? '#e8eef7' : '#fff'}" stroke="#9fb3cc"/>`;
    for (let c = 0; c < 8; c++) g += `<text x="${30 + c * s + s / 2}" y="${10 + 8 * s + 22}" text-anchor="middle" font-size="16">${L[c]}</text>`;
    for (let r = 0; r < 8; r++) g += `<text x="16" y="${10 + r * s + s / 2 + 6}" text-anchor="middle" font-size="16">${8 - r}</text>`;
    g += `<text x="${30 + col * s + s / 2}" y="${10 + (7 - lin) * s + s / 2 + 9}" text-anchor="middle" font-size="26">${simbolo}</text>`;
    return `<svg xmlns="${NS}" viewBox="0 0 ${40 + 8 * s} ${8 * s + 40}" width="330" font-family="Asap, sans-serif">${g}</svg>`;
  }

  // ------------------------------------------------------------ planificações do cubo (verificação a sério: o cubo rola sobre a planificação)
  function eCubo(cels) {
    const chave = (r, c) => r + ',' + c, set = new Set(cels.map(([r, c]) => chave(r, c)));
    const vistos = new Map();
    const ini = { b: 0, t: 1, n: 2, s: 3, e: 4, o: 5 };
    const fila = [[cels[0], ini]]; vistos.set(chave(...cels[0]), ini.b);
    while (fila.length) {
      const [[r, c], o] = fila.shift();
      const viz = [
        [[r, c + 1], { b: o.e, e: o.t, t: o.o, o: o.b, n: o.n, s: o.s }],
        [[r, c - 1], { b: o.o, o: o.t, t: o.e, e: o.b, n: o.n, s: o.s }],
        [[r - 1, c], { b: o.n, n: o.t, t: o.s, s: o.b, e: o.e, o: o.o }],
        [[r + 1, c], { b: o.s, s: o.t, t: o.n, n: o.b, e: o.e, o: o.o }],
      ];
      for (const [p, no] of viz) { const k = chave(...p); if (set.has(k) && !vistos.has(k)) { vistos.set(k, no.b); fila.push([p, no]); } }
    }
    return vistos.size === 6 && new Set(vistos.values()).size === 6;
  }
  function hexomino(r) {   // 6 quadrados ligados pelos lados, normalizados ao canto
    const cels = [[0, 0]], tem = (a, b) => cels.some(([x, y]) => x === a && y === b);
    while (cels.length < 6) {
      const [a, b] = pick(r, cels), [da, db] = pick(r, [[0, 1], [0, -1], [1, 0], [-1, 0]]);
      if (!tem(a + da, b + db)) cels.push([a + da, b + db]);
    }
    const mr = Math.min(...cels.map(c => c[0])), mc = Math.min(...cels.map(c => c[1]));
    return cels.map(([a, b]) => [a - mr, b - mc]);
  }
  const forma = cels => cels.map(c => c.join(',')).sort().join(';');

  // ------------------------------------------------------------ geradores por tema
  // Cada gerador devolve um item; `k` = nome do tipo de exercício (no teste não se repete o mesmo tipo).
  const G = { num: [], ops: [], pro: [], fra: [], seq: [], geo: [], med: [], dad: [], pc: [] };
  const def = (tema, k, f) => G[tema].push({ k, f });

  // ===== Números até 999 999
  const grande = r => ri(r, 1, 9) * 100000 + ri(r, 0, 99999);
  def('num', 'extenso-algarismos', r => {
    const n = pick(r, [grande(r), ri(r, 10000, 99999), ri(r, 100, 999) * 1000 + ri(r, 0, 99)]);
    return { tipo: 'curta', pergunta: `Escreve com algarismos: «${Maiusc(extenso(n))}».`, numero: n, largura: '180px',
      explica: `${Maiusc(extenso(n))} escreve-se ${fmt(n)}.`, pistas: ['Começa pela classe dos milhares: o que vem antes da palavra «mil»?', 'Depois de «mil» vem a classe das unidades: centenas, dezenas e unidades.', 'Se faltar uma ordem, escreve um 0 nesse lugar.'] };
  });
  def('num', 'algarismos-extenso', r => {
    const n = grande(r), certa = Maiusc(extenso(n));
    const m = Math.floor(n / 1000), u = n % 1000;
    const er = [Maiusc(extenso(m * 1000 + ((u + 100) % 1000))), Maiusc(extenso(((m + 10) % 1000 || 1) * 1000 + u)), Maiusc(extenso(Math.floor(n / 10)))];
    return Object.assign({ tipo: 'escolha', pergunta: `Como se lê o número ${fmt(n)}?` }, opcoes(r, certa, er), { explica: `${fmt(n)} lê-se «${extenso(n)}».` });
  });
  def('num', 'valor-posicional', r => {
    let n = grande(r); const s = String(n); const p = ri(r, 0, 5); if (s[p] === '0') n += Math.pow(10, 5 - p);
    const d = Number(String(n)[p]), v = d * Math.pow(10, 5 - p);
    return { tipo: 'curta', pergunta: `No número ${fmt(n)}, quantas unidades representa o algarismo das ${['centenas de milhar', 'dezenas de milhar', 'unidades de milhar', 'centenas', 'dezenas', 'unidades'][p]}?`,
      numero: v, largura: '180px', explica: `O algarismo ${d} está nas ${['centenas de milhar', 'dezenas de milhar', 'unidades de milhar', 'centenas', 'dezenas', 'unidades'][p]}: vale ${fmt(v)} unidades.`,
      pistas: ['Escreve o número numa tabela: CM DM UM | C D U.', 'Qual é o algarismo que está nessa ordem?', 'Põe zeros à direita desse algarismo até ao fim do número.'] };
  });
  def('num', 'ordem-algarismo', r => {
    const n = grande(r), p = ri(r, 0, 5), nomes = ['centenas de milhar', 'dezenas de milhar', 'unidades de milhar', 'centenas', 'dezenas', 'unidades'];
    return { tipo: 'curta', pergunta: `Qual é o algarismo das ${nomes[p]} do número ${fmt(n)}?`, numero: Number(String(n)[p]), largura: '90px',
      explica: `CM DM UM | C D U → ${String(n).split('').join(' ')}. Nas ${nomes[p]} está o ${String(n)[p]}.` };
  });
  def('num', 'decompor', r => {
    const n = grande(r), dig = String(n).split('').map(Number);
    if (r() < 0.5) {
      const partes = dig.map((d, i) => d * Math.pow(10, 5 - i)).filter(Boolean).map(fmt);
      return { tipo: 'curta', pergunta: `Que número é ${partes.join(' + ')}?`, numero: n, largura: '180px', explica: `${partes.join(' + ')} = ${fmt(n)}.` };
    }
    const txt = dig.map((d, i) => d ? `${d} ${ORDENS[i]}` : null).filter(Boolean).join(' + ');
    return { tipo: 'curta', pergunta: `Que número tem ${txt}?`, instr: 'CM = centenas de milhar · DM = dezenas de milhar · UM = unidades de milhar · C = centenas · D = dezenas · U = unidades', numero: n, largura: '180px', explica: `Na tabela fica ${String(n).split('').join(' ')} → ${fmt(n)}.` };
  });
  def('num', 'abaco', r => {
    let n = grande(r); if (r() < 0.6) { const p = ri(r, 1, 5); const s = String(n).split(''); s[p] = '0'; n = Number(s.join('')); }
    return { tipo: 'curta', pergunta: 'Que número está representado no ábaco?', figura: { tipo: 'svg', svg: svgAbaco(n) }, numero: n, largura: '180px',
      explica: `Conta as contas de cada vareta: ${String(n).split('').join(' ')} → ${fmt(n)}. Uma vareta vazia é um 0.` };
  });
  def('num', 'antecessor-sucessor', r => {
    const n = pick(r, [ri(r, 1, 9) * 100000, ri(r, 10, 99) * 1000, grande(r), ri(r, 1, 9) * 10000 + 9999, ri(r, 1, 9) * 100000 + 99999]);
    const suc = r() < 0.5;
    return { tipo: 'curta', pergunta: `Qual é o ${suc ? 'sucessor' : 'antecessor'} de ${fmt(n)}?`, numero: suc ? n + 1 : n - 1, largura: '180px',
      explica: `O ${suc ? 'sucessor é o número que vem logo a seguir (+1)' : 'antecessor é o número que vem logo antes (−1)'}: ${fmt(suc ? n + 1 : n - 1)}.` };
  });
  def('num', 'mais-mil', r => {
    const n = grande(r), op = pick(r, [[1000, '+ 1000'], [-1000, '− 1000'], [100, '+ 100'], [10000, '+ 10 000'], [-10, '− 10'], [100000, '+ 100 000']]);
    const v = n + op[0]; if (v > 999999 || v < 0) return null;
    return { tipo: 'curta', pergunta: `Calcula mentalmente: ${fmt(n)} ${op[1].replace(' ', NB)}`, numero: v, largura: '180px', explica: `Só muda a ordem de ${fmt(Math.abs(op[0]))}: ${fmt(v)}.` };
  });
  def('num', 'ordenar', r => {
    const base = ri(r, 1, 9) * 100000;
    const ns = new Set(); while (ns.size < 4) ns.add(base + ri(r, 0, 9) * 10000 + ri(r, 0, 9) * 1000 + ri(r, 0, 999));
    const crescente = r() < 0.5, ord = [...ns].sort((a, b) => crescente ? a - b : b - a);
    return { tipo: 'ordenar', pergunta: `Ordena os números do ${crescente ? 'menor para o maior' : 'maior para o menor'}.`, itens: ord.map(fmt),
      explica: `Compara da esquerda para a direita: primeiro as centenas de milhar, depois as dezenas de milhar… Ordem: ${ord.map(fmt).join(crescente ? ' < ' : ' > ')}.` };
  });
  def('num', 'arredondar', r => {
    const n = ri(r, 1000, 99999), base = pick(r, [[100, 'centena'], [1000, 'unidade de milhar'], [10, 'dezena']]);
    const a = Math.round(n / base[0]) * base[0], b = Math.floor(n / base[0]) * base[0], c = Math.ceil(n / base[0]) * base[0];
    const er = [a === b ? c : b, a + base[0], a - base[0], n - (n % 10)].filter(x => x !== a);
    return Object.assign({ tipo: 'escolha', pergunta: `Qual é o arredondamento de ${fmt(n)} à ${base[1]} mais próxima?` }, opcoes(r, fmt(a), er.map(fmt)),
      { explica: `Olha para o algarismo à direita da ${base[1]}: se for 5 ou mais, arredonda-se para cima. ${fmt(n)} → ${fmt(a)}.` });
  });
  def('num', 'outras-leituras', r => {
    const n = grande(r), q = pick(r, [[100, 'centenas'], [1000, 'unidades de milhar'], [10, 'dezenas']]);
    const k = Math.floor(n / q[0]), resto = n % q[0];
    return { tipo: 'curta', pergunta: `Completa: ${fmt(n)} = ____ ${q[1]}${resto ? ' e ' + fmt(resto) + ' unidades' : ''}`, numero: k, largura: '160px',
      explica: `Tapa os ${String(q[0]).length - 1} últimos algarismos: ${fmt(n)} tem ${fmt(k)} ${q[1]}${resto ? ' e sobram ' + resto : ''}.` };
  });
  def('num', 'numero-misterioso', r => {
    const dig = [ri(r, 1, 9), ri(r, 0, 9), ri(r, 0, 9), ri(r, 0, 9), ri(r, 0, 9), ri(r, 0, 9)];
    const nomes = ['centenas de milhar', 'dezenas de milhar', 'unidades de milhar', 'centenas', 'dezenas', 'unidades'];
    const pista = (d, i) => {
      const op = [`O algarismo das ${nomes[i]} é o ${d}.`];
      if (d === 0) op.push(`O algarismo das ${nomes[i]} é o zero.`);
      if (d && d % 2 === 0 && d <= 8) op.push(`O algarismo das ${nomes[i]} é o dobro de ${d / 2}.`);
      if (d <= 4 && d) op.push(`O algarismo das ${nomes[i]} é metade de ${d * 2}.`);
      if (d === 9) op.push(`O algarismo das ${nomes[i]} é o maior número ímpar de um só algarismo.`);
      if (d === 6) op.push(`O algarismo das ${nomes[i]} corresponde a meia dúzia.`);
      if (d === 3) op.push(`O algarismo das ${nomes[i]} é a terça parte de 9.`);
      if (d === 8) op.push(`O algarismo das ${nomes[i]} é o maior número par de um só algarismo.`);
      return pick(r, op);
    };
    const n = Number(dig.join(''));
    return { tipo: 'curta', pergunta: 'Descobre o número misterioso!', instr: misturar(r, dig.map(pista)).join(' '), numero: n, largura: '180px',
      explica: `Arruma as pistas na tabela CM DM UM C D U: ${dig.join(' ')} → ${fmt(n)}.`, pistas: ['Faz uma tabela com 6 casas: CM DM UM C D U.', 'Lê uma pista de cada vez e escreve o algarismo na casa certa.', 'Quando as 6 casas estiverem cheias, lê o número.'] };
  });
  def('num', 'ordinais', r => {
    const ORD = { 1: 'primeiro', 2: 'segundo', 3: 'terceiro', 4: 'quarto', 5: 'quinto', 6: 'sexto', 7: 'sétimo', 8: 'oitavo', 9: 'nono', 10: 'décimo', 20: 'vigésimo', 30: 'trigésimo', 40: 'quadragésimo', 50: 'quinquagésimo', 60: 'sexagésimo', 70: 'septuagésimo', 80: 'octogésimo', 90: 'nonagésimo', 100: 'centésimo' };
    const n = pick(r, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 12, 15, 21, 34, 47]);
    const ord = x => x <= 10 || x % 10 === 0 ? ORD[x] : ORD[x - (x % 10)] + ' ' + ORD[x % 10];
    const er = [ord(n === 100 ? 90 : n + 10), ord(n > 10 ? n - 10 : n + 20), n <= 10 ? ord(n + 1) : ord(n === 100 ? 70 : ((n + 30) % 100) || 60)];
    return Object.assign({ tipo: 'escolha', pergunta: `Como se escreve por extenso o numeral ordinal ${n}.º?` }, opcoes(r, ord(n), er), { explica: `${n}.º = ${ord(n)}.` });
  });

  // ===== Operações (cálculo no caderno)
  const conta2 = (pergunta, v, explica, extra) => Object.assign({ tipo: 'curta', pergunta, instr: CADERNO, numero: v, largura: '180px', caderno: true, explica }, extra || {});
  def('ops', 'adicao', r => {
    const a = ri(r, 1000, 7999), b = ri(r, 500, 9999 - a);
    return conta2(`Calcula: ${fmt(a)} + ${fmt(b)}`, a + b, `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}. No algoritmo, começa pelas unidades e não te esqueças do «e vai um».`,
      { pistas: ['Escreve os números um por baixo do outro, unidades por baixo de unidades.', 'Soma coluna a coluna, da direita para a esquerda.', 'Se uma coluna der 10 ou mais, escreve as unidades e passa 1 para a coluna seguinte.'] });
  });
  def('ops', 'subtracao', r => {
    const a = ri(r, 2000, 9999), b = ri(r, 300, a - 200);
    return conta2(`Calcula: ${fmt(a)} − ${fmt(b)}`, a - b, `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}. Confirma com a prova: ${fmt(a - b)} + ${fmt(b)} = ${fmt(a)}.`,
      { pistas: ['Escreve o aditivo em cima e o subtrativo por baixo, unidades com unidades.', 'Se em cima o algarismo for mais pequeno, empresta uma dezena (fica mais 10 em cima e mais 1 em baixo na coluna seguinte).', 'No fim faz a prova: resto + subtrativo = aditivo.'] });
  });
  def('ops', 'subtracao-zeros', r => {
    const a = pick(r, [ri(r, 1, 9) * 1000, ri(r, 10, 99) * 100, ri(r, 1, 9) * 1000 + ri(r, 1, 9)]), b = ri(r, 111, a - 100);
    return conta2(`Calcula: ${fmt(a)} − ${fmt(b)}`, a - b, `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}. Com zeros em cima, empresta-se várias vezes seguidas.`);
  });
  def('ops', 'multiplicacao', r => {
    const a = ri(r, 12, 899), b = ri(r, 2, 9);
    return conta2(`Calcula: ${fmt(a)} × ${b}`, a * b, `${fmt(a)} × ${b} = ${fmt(a * b)}. Por decomposição: ${String(a).split('').map((d, i, s) => d * Math.pow(10, s.length - 1 - i)).filter(Boolean).map(p => `${b} × ${p}`).join(' + ')}.`,
      { pistas: ['Decompõe o número maior: centenas, dezenas e unidades.', `Multiplica cada parte por ${b}.`, 'Soma os resultados.'] });
  });
  def('ops', 'multiplicacao-2', r => {
    const a = ri(r, 12, 99), b = ri(r, 11, 25);
    return conta2(`Calcula: ${a} × ${b}`, a * b, `${a} × ${b} = ${a} × ${Math.floor(b / 10) * 10} + ${a} × ${b % 10} = ${a * Math.floor(b / 10) * 10} + ${a * (b % 10)} = ${fmt(a * b)}.`);
  });
  def('ops', 'tabuada', r => {
    const a = ri(r, 3, 9), b = ri(r, 3, 10), div = r() < 0.4;
    return div ? { tipo: 'curta', pergunta: `Cálculo mental: ${a * b} : ${a}`, numero: b, largura: '120px', explica: `${a} × ${b} = ${a * b}, por isso ${a * b} : ${a} = ${b}.` }
      : { tipo: 'curta', pergunta: `Cálculo mental: ${a} × ${b}`, numero: a * b, largura: '120px', explica: `Tabuada do ${a}: ${a} × ${b} = ${a * b}.` };
  });
  def('ops', 'vezes-10', r => {
    const a = ri(r, 3, 999), m = pick(r, [10, 100, 1000]);
    if (a * m > 999999) return null;
    return { tipo: 'curta', pergunta: `Cálculo mental: ${fmt(a)} × ${fmt(m)}`, numero: a * m, largura: '180px', explica: `Multiplicar por ${fmt(m)} é acrescentar ${String(m).length - 1} zero(s): ${fmt(a * m)}.` };
  });
  def('ops', 'divisao', r => {
    const b = ri(r, 2, 9), q = ri(r, 12, 199);
    return conta2(`Calcula: ${fmt(b * q)} : ${b}`, q, `${fmt(b * q)} : ${b} = ${q}, porque ${q} × ${b} = ${fmt(b * q)}.`,
      { pistas: [`Pensa: que número vezes ${b} dá ${fmt(b * q)}?`, `Decompõe o dividendo em partes fáceis de dividir por ${b} (por exemplo, centenas ou dezenas redondas).`, 'Divide cada parte e soma os quocientes.'] });
  });
  def('ops', 'termo-falta', r => {
    const t = pick(r, ['sub2', 'sub1', 'som', 'mul']);
    if (t === 'sub2') { const a = ri(r, 500, 999), c = ri(r, 50, a - 100); return conta2(`Qual é o número que falta? ${a} − ? = ${c}`, a - c, `${a} − ${a - c} = ${c}. Para descobrir, faz ${a} − ${c}.`); }
    if (t === 'sub1') { const b = ri(r, 100, 900), c = ri(r, 1000, 8000); return conta2(`Qual é o número que falta? ? − ${b} = ${fmt(c)}`, b + c, `O aditivo é ${fmt(c)} + ${b} = ${fmt(b + c)}.`); }
    if (t === 'som') { const a = ri(r, 1200, 5000), b = ri(r, 300, 3000); return conta2(`Qual é o número que falta? ${fmt(a)} + ? = ${fmt(a + b)}`, b, `${fmt(a + b)} − ${fmt(a)} = ${fmt(b)}.`); }
    const a = ri(r, 3, 9), b = ri(r, 4, 12); return { tipo: 'curta', pergunta: `Qual é o número que falta? ${a} × ? = ${a * b}`, numero: b, largura: '120px', explica: `${a} × ${b} = ${a * b}.` };
  });
  def('ops', 'redondos', r => {
    const a = ri(r, 1, 9) * 500 + ri(r, 1, 9) * 100, c = 10000 - a - ri(r, 1, 4) * 1000, b = ri(r, 1000, 4000);
    return { tipo: 'curta', pergunta: `Calcula juntando primeiro os números que fazem «números redondos»: ${fmt(a)} + ${fmt(b)} + ${fmt(c)}`, numero: a + b + c, largura: '180px', caderno: true, instr: CADERNO,
      explica: `${fmt(a)} + ${fmt(c)} = ${fmt(a + c)}; depois + ${fmt(b)} = ${fmt(a + b + c)}.` };
  });
  def('ops', 'igualdade', r => {
    const a = ri(r, 6, 9), b = ri(r, 4, 9), certa = `(${a} × ${b - 1}) + ${a}`;
    const er = [`(${a} × ${b}) + ${b}`, `(${a} + ${b}) × ${b}`, `${a} + ${b} + ${a}`];
    return Object.assign({ tipo: 'escolha', pergunta: `Qual das operações dá o mesmo resultado que ${a} × ${b}?` }, opcoes(r, certa, er),
      { explica: `${a} × ${b} = ${a * b} e (${a} × ${b - 1}) + ${a} = ${a * (b - 1)} + ${a} = ${a * b}.` });
  });

  // ===== Problemas (interpreta, pensa e resolve)
  const NOMES = ['o Jaime', 'a Maria', 'o Tomás', 'a Abi', 'o Nico', 'a Rita', 'o Rui', 'a Inês'];
  const prob = (pergunta, v, explica, depois) => ({ tipo: 'curta', pergunta, instr: CADERNO + ' Lê o problema com calma: o que se pede?', numero: v, largura: '160px', depois: depois ? NB + depois : null, caderno: true, explica,
    pistas: ['Sublinha os dados (os números) e o que se pergunta.', 'Que operação te ajuda: juntar, tirar, repetir ou repartir?', 'Faz a conta no caderno e confirma se o resultado faz sentido.'] });
  def('pro', 'refeicoes', r => { const a = ri(r, 120, 480), d = ri(r, 3, 6); return prob(`Na escola de Messejana são servidas, por dia, cerca de ${a} refeições. Quantas refeições são servidas em ${d} dias?`, a * d, `${a} × ${d} = ${fmt(a * d)} refeições.`, 'refeições'); });
  def('pro', 'prateleiras', r => { const p = ri(r, 4, 9), l = ri(r, 12, 35); return prob(`Uma estante da biblioteca tem ${p} prateleiras e em cada prateleira há ${l} livros. Quantos livros há na estante?`, p * l, `${p} × ${l} = ${p * l} livros.`, 'livros'); });
  def('pro', 'paginas', r => { const q = ri(r, 3, 9), d = ri(r, 8, 21); return prob(`${Maiusc(pick(r, NOMES))} lê ${q} páginas por dia e acaba o livro em ${d} dias. Quantas páginas tem o livro?`, q * d, `${q} × ${d} = ${q * d} páginas.`, 'páginas'); });
  def('pro', 'faltam-paginas', r => { const t = ri(r, 300, 950), e = ri(r, 80, t - 50); return prob(`Uma enciclopédia tem ${t} páginas. A Maria está na página ${e}. Quantas páginas faltam para chegar ao fim?`, t - e, `${t} − ${e} = ${t - e} páginas.`, 'páginas'); });
  def('pro', 'autocarros', r => { const l = pick(r, [40, 50, 55]), t = ri(r, 90, 260), n = Math.ceil(t / l); return prob(`Vão ${t} pessoas numa visita de estudo. Cada autocarro leva ${l} pessoas. Quantos autocarros são precisos, no mínimo?`, n, `${t} : ${l} dá ${Math.floor(t / l)} e sobram ${t % l} pessoas${t % l ? ', que também precisam de lugar: ' + n + ' autocarros' : ''}.`, 'autocarros'); });
  def('pro', 'turmas', r => {
    const a = ri(r, 19, 26), b = ri(r, 19, 26), c = ri(r, 19, 26), e = ri(r, 18, 26);
    return prob(`No 4.º ano da escola há 4 turmas. A turma A tem ${a} alunos, a B tem ${b} e a C tem ${c}. No total há ${a + b + c + e} alunos. Quantos alunos tem a turma D?`, e, `${a} + ${b} + ${c} = ${a + b + c}; ${a + b + c + e} − ${a + b + c} = ${e} alunos.`, 'alunos');
  });
  def('pro', 'repartir', r => { const k = ri(r, 3, 8), q = ri(r, 6, 25), coisa = pick(r, ['berlindes', 'cromos', 'rebuçados', 'lápis']); return prob(`${Maiusc(pick(r, NOMES))} tem ${k * q} ${coisa} e quer reparti-los igualmente por ${k} amigos. Quantos ${coisa} recebe cada amigo?`, q, `${k * q} : ${k} = ${q} ${coisa}.`, coisa); });
  def('pro', 'coracao', r => { const b = pick(r, [70, 75, 80, 90]), m = pick(r, [10, 20, 30, 60]); return prob(`O coração de uma criança bate cerca de ${b} vezes por minuto. Quantas vezes bate em ${m} minutos?`, b * m, `${b} × ${m} = ${fmt(b * m)} vezes.`, 'vezes'); });
  def('pro', 'ossos', r => { const a = ri(r, 24, 28), b = ri(r, 25, 29); return prob(`Uma mão tem ${a} ossos e um pé tem ${b}. Quantos ossos há nas duas mãos e nos dois pés juntos?`, 2 * a + 2 * b, `2 × ${a} + 2 × ${b} = ${2 * a} + ${2 * b} = ${2 * a + 2 * b} ossos.`, 'ossos'); });
  def('pro', 'troco', r => {
    const p1 = ri(r, 2, 6) + pick(r, [0, 0.5, 0.25, 0.75]), p2 = ri(r, 1, 4) + pick(r, [0, 0.5, 0.2, 0.8]), q = ri(r, 2, 3), nota = (p1 * q + p2) < 10 ? 10 : 20;
    const tr = Math.round((nota - p1 * q - p2) * 100) / 100;
    return Object.assign(prob(`Na feira de Messejana, ${pick(r, NOMES)} comprou ${q} frascos de mel a ${euros(p1)} cada um e um pão a ${euros(p2)}. Pagou com uma nota de ${nota}${NB}€. Quanto recebeu de troco?`, tr,
      `${q} × ${euros(p1)} = ${euros(p1 * q)}; + ${euros(p2)} = ${euros(p1 * q + p2)}; ${nota}${NB}€ − ${euros(p1 * q + p2)} = ${euros(tr)}.`, '€'), { instr: CADERNO + ' Escreve os cêntimos com vírgula (por exemplo 3,45).' });
  });
  def('pro', 'embalagens', r => { const g = pick(r, [250, 500, 200, 125]); return prob(`Os morangos vêm em embalagens de ${g}${NB}g. Quantas embalagens são precisas para ter 1${NB}kg de morangos?`, 1000 / g, `1 kg = 1000 g; 1000 : ${g} = ${1000 / g} embalagens.`, 'embalagens'); });
  def('pro', 'poupanca', r => { const s = ri(r, 2, 5), sem = ri(r, 6, 15), pr = ri(r, 10, s * sem - 3); return prob(`${Maiusc(pick(r, NOMES))} poupa ${s}${NB}€ por semana. Ao fim de ${sem} semanas comprou um jogo de ${pr}${NB}€. Quanto dinheiro lhe sobrou?`, s * sem - pr, `${s} × ${sem} = ${s * sem}${NB}€; ${s * sem} − ${pr} = ${s * sem - pr}${NB}€.`, '€'); });

  // ===== Frações
  def('fra', 'fracao-pintada', r => {
    const d = pick(r, [2, 3, 4, 5, 6, 8, 10]), n = ri(r, 1, d - 1), f = pick(r, ['circulo', 'barra']);
    return Object.assign({ tipo: 'escolha', pergunta: 'Que fração da figura está pintada?', figura: { tipo: 'svg', svg: svgFracao(r, n, d, f) } },
      opcoes(r, `${n}/${d}`, [`${d}/${n}`, `${d - n}/${d}`, `${n}/${d + 1}`, `${n + 1}/${d}`]), { explica: `A figura tem ${d} partes iguais e ${n} estão pintadas: ${n}/${d}.` });
  });
  def('fra', 'somar-fracoes', r => {
    const d = pick(r, [4, 5, 6, 8, 10, 12]), a = ri(r, 1, d - 2), b = ri(r, 1, d - a), sub = r() < 0.4;
    const [x, y] = sub ? [a + b, b] : [a, b], v = sub ? a : a + b;
    return { tipo: 'curta', pergunta: `Calcula: ${x}/${d} ${sub ? '−' : '+'} ${y}/${d}`, instr: 'Escreve a fração assim: 3/8', aceitar: [`${v}/${d}`, `${v} / ${d}`], largura: '120px',
      explica: `Com o mesmo denominador, ${sub ? 'subtraem' : 'somam'}-se só os numeradores: ${x} ${sub ? '−' : '+'} ${y} = ${v}. Fica ${v}/${d}.`, pistas: ['Os pedaços são todos do mesmo tamanho (o denominador é igual).', `Junta ou tira só os pedaços de cima.`, 'O denominador (em baixo) não muda.'] };
  });
  def('fra', 'fracao-quantidade', r => {
    const d = pick(r, [2, 3, 4, 5, 10]), n = ri(r, 1, d - 1), q = d * ri(r, 2, 12), coisa = pick(r, ['berlindes', 'alunos', 'laranjas', 'cromos']);
    return { tipo: 'curta', pergunta: `Quanto é ${n}/${d} de ${q} ${coisa}?`, numero: q / d * n, largura: '120px', depois: NB + coisa, caderno: true, instr: CADERNO,
      explica: `${q} : ${d} = ${q / d} (um ${['', '', 'meio', 'terço', 'quarto', 'quinto', '', '', '', '', 'décimo'][d]}); ${n} × ${q / d} = ${q / d * n}.` };
  });
  def('fra', 'medida-fracao', r => {
    const t = pick(r, [['1/2 kg', 500, 'g'], ['1/4 kg', 250, 'g'], ['3/4 kg', 750, 'g'], ['1/2 hora', 30, 'minutos'], ['1/4 de hora', 15, 'minutos'], ['3/4 de hora', 45, 'minutos'], ['1/2 litro', 500, 'ml'], ['1/10 de metro', 10, 'cm'], ['1/1000 de metro', 1, 'mm']]);
    return { tipo: 'curta', pergunta: `${Maiusc(t[0])} são quantos ${t[2]}?`, numero: t[1], largura: '120px', depois: NB + t[2], explica: `${t[0]} = ${t[1]} ${t[2]}.` };
  });
  def('fra', 'comparar-fracoes', r => {
    const d1 = ri(r, 2, 6), d2 = d1 + ri(r, 1, 4), maior = r() < 0.5;
    return Object.assign({ tipo: 'escolha', pergunta: `Qual é ${maior ? 'maior' : 'menor'}: 1/${d1} ou 1/${d2} de uma tablete de chocolate?` }, opcoes(r, maior ? `1/${d1}` : `1/${d2}`, [maior ? `1/${d2}` : `1/${d1}`, 'São iguais']),
      { explica: `Quanto mais partes, mais pequena é cada parte: 1/${d1} é maior do que 1/${d2}.` });
  });
  def('fra', 'chocolate', r => {
    const t = pick(r, [12, 10, 8, 6]), a = ri(r, 1, Math.floor(t / 2) - 1), b = ri(r, 1, t - a - 1);
    return { tipo: 'curta', pergunta: `Uma tablete tem ${t} quadradinhos iguais. O Tomás come ${a} e a Maria come ${b}. Que fração da tablete sobra?`, instr: 'Escreve a fração assim: 3/8', aceitar: [`${t - a - b}/${t}`, `${t - a - b} / ${t}`], largura: '120px',
      explica: `Comem ${a + b}/${t}; sobra ${t}/${t} − ${a + b}/${t} = ${t - a - b}/${t}.` };
  });

  // ===== Sequências e regularidades
  def('seq', 'seq-numerica', r => {
    const p = pick(r, [[ri(r, 1, 9) * 100000, pick(r, [10, 500, 1000, 10000, 150000])], [ri(r, 10, 90), pick(r, [3, 4, 6, 7, 9, 12])], [ri(r, 2000, 3000), pick(r, [100, 250, -100])]]);
    const [s, k] = p, t = [0, 1, 2, 3, 4].map(i => s + i * k);
    if (t[4] > 999999 || t[4] < 0) return null;
    return { tipo: 'curta', pergunta: `Descobre a regra e escreve o número que vem a seguir: ${t.slice(0, 4).map(fmt).join(' · ')} · ?`, numero: t[4], largura: '180px',
      explica: `A regra é ${k > 0 ? 'adicionar' : 'subtrair'} ${fmt(Math.abs(k))}: ${fmt(t[3])} ${k > 0 ? '+' : '−'} ${fmt(Math.abs(k))} = ${fmt(t[4])}.` };
  });
  def('seq', 'seq-regra', r => {
    const k = ri(r, 3, 9), s = ri(r, 1, 20), t = [0, 1, 2, 3].map(i => s + i * k);
    return Object.assign({ tipo: 'escolha', pergunta: `Qual é a regra da sequência ${t.join(', ')}…?` }, opcoes(r, `Adicionar ${k} ao termo anterior`, [`Adicionar ${k + 1} ao termo anterior`, `Multiplicar por ${k}`, `Adicionar ${s} ao termo anterior`]),
      { explica: `${t[1]} − ${t[0]} = ${k}, ${t[2]} − ${t[1]} = ${k}… a regra é adicionar ${k}.` });
  });
  def('seq', 'seq-figuras', r => {
    const a = ri(r, 2, 4), b = ri(r, 0, 2), n = pick(r, [7, 10]);
    const linha = k => { const tot = a * k + b, cols = Math.ceil(tot / 2), c = []; for (let i = 0; i < tot; i++) c.push([i < cols ? 0 : 1, i < cols ? i : i - cols]); return c; };
    return { tipo: 'curta', pergunta: `Observa a sequência. Quantos quadrados terá a figura ${n}?`, figura: { tipo: 'svg', svg: svgSequenciaFiguras(linha, 3) }, numero: a * n + b, largura: '120px', caderno: true,
      instr: 'Conta os quadrados de cada figura e descobre quantos se juntam de uma figura para a seguinte.',
      explica: `As figuras têm ${a + b}, ${2 * a + b}, ${3 * a + b}… (mais ${a} de cada vez). Regra: ${a} × número da figura${b ? ' + ' + b : ''}. Figura ${n}: ${a} × ${n}${b ? ' + ' + b : ''} = ${a * n + b}.` };
  });
  def('seq', 'seq-quadrados', r => {
    const n = pick(r, [5, 6, 7, 10]);
    const sq = k => { const c = []; for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) c.push([i, j]); return c; };
    return { tipo: 'curta', pergunta: `As figuras são quadrados cada vez maiores. Quantos quadradinhos terá a figura ${n}?`, figura: { tipo: 'svg', svg: svgSequenciaFiguras(sq, 4) }, numero: n * n, largura: '120px',
      explica: `A figura 1 tem 1 × 1, a 2 tem 2 × 2, a 3 tem 3 × 3… A figura ${n} tem ${n} × ${n} = ${n * n}.` };
  });
  def('seq', 'tabela-termos', r => {
    const a = ri(r, 2, 5), b = ri(r, 1, 3), n = pick(r, [8, 10, 20]);
    return { tipo: 'curta', pergunta: `Numa sequência, o número de bolas de cada figura é «${a} × número de ordem + ${b}». Quantas bolas tem a figura de ordem ${n}?`,
      tabela: { cab: ['Número de ordem', 'Número de bolas'], linhas: [[1, a + b], [2, 2 * a + b], [3, 3 * a + b], [n, '?']] }, numero: a * n + b, largura: '120px',
      explica: `${a} × ${n} + ${b} = ${a * n + b}.` };
  });
  def('seq', 'padrao-simbolos', r => {
    const S = misturar(r, ['⭐', '❤️', '⚡', '🔵', '🔺']).slice(0, ri(r, 3, 4)), rep = [];
    for (let i = 0; i < 10; i++) rep.push(S[i % S.length]);
    const q = ri(r, 12, 22);
    return Object.assign({ tipo: 'escolha', pergunta: `A sequência repete-se sempre igual: ${rep.join(' ')} … Qual é a figura número ${q}?` }, opcoes(r, S[(q - 1) % S.length], S),
      { explica: `O padrão tem ${S.length} figuras e repete-se. ${q} : ${S.length} dá resto ${q % S.length}${q % S.length === 0 ? ' (resto 0 = a última figura do padrão)' : ''} → ${S[(q - 1) % S.length]}.` });
  });

  // ===== Geometria
  const POLIG = { 3: 'triangular', 4: 'quadrangular', 5: 'pentagonal', 6: 'hexagonal', 8: 'octogonal' };
  def('geo', 'solidos-contar', r => {
    const n = pick(r, [3, 4, 5, 6, 8]), prisma = r() < 0.5, o = pick(r, ['faces', 'vértices', 'arestas']);
    const v = prisma ? { faces: n + 2, 'vértices': 2 * n, arestas: 3 * n }[o] : { faces: n + 1, 'vértices': n + 1, arestas: 2 * n }[o];
    return { tipo: 'curta', pergunta: `Quantas ${o} tem ${prisma ? 'um prisma' : 'uma pirâmide'} ${POLIG[n]}?`, numero: v, largura: '100px',
      explica: prisma ? `O prisma ${POLIG[n]} tem 2 bases com ${n} lados: ${n + 2} faces, ${2 * n} vértices e ${3 * n} arestas.` : `A pirâmide ${POLIG[n]} tem 1 base com ${n} lados: ${n + 1} faces, ${n + 1} vértices e ${2 * n} arestas.`,
      pistas: ['Pensa na base: quantos lados tem?', prisma ? 'O prisma tem duas bases iguais e uma face lateral (retângulo) por cada lado da base.' : 'A pirâmide tem uma base e um triângulo por cada lado da base; todos se juntam no vértice de cima.', 'Desenha o sólido no caderno e conta com calma.'] };
  });
  def('geo', 'solido-nome', r => {
    const n = pick(r, [3, 4, 5, 6]), prisma = r() < 0.5;
    const desc = prisma ? `tem duas bases ${['', '', '', 'triangulares', 'quadradas', 'pentagonais', 'hexagonais'][n]} e ${n} faces laterais retangulares` : `tem uma base ${['', '', '', 'triangular', 'quadrada', 'pentagonal', 'hexagonal'][n]} e ${n} faces laterais triangulares`;
    const certa = `${prisma ? 'Prisma' : 'Pirâmide'} ${POLIG[n]}`;
    return Object.assign({ tipo: 'escolha', pergunta: `Que sólido geométrico ${desc}?` }, opcoes(r, certa, [`${prisma ? 'Pirâmide' : 'Prisma'} ${POLIG[n]}`, `${prisma ? 'Prisma' : 'Pirâmide'} ${POLIG[n === 6 ? 5 : n + 1]}`, 'Cilindro']),
      { explica: `${prisma ? 'Os prismas têm 2 bases e faces laterais retangulares' : 'As pirâmides têm 1 base e faces laterais triangulares'}; o nome vem da forma da base.` });
  });
  def('geo', 'solidos-vf', r => {
    const banco = [['Os prismas têm faces laterais triangulares.', false], ['As faces laterais das pirâmides são sempre triangulares.', true], ['Os prismas podem ter bases triangulares.', true],
      ['A esfera é um poliedro.', false], ['O cilindro é um sólido não poliedro.', true], ['Uma pirâmide quadrangular tem 5 vértices.', true], ['Um cubo tem 8 faces.', false],
      ['O cubo é um prisma.', true], ['Um prisma hexagonal tem 12 vértices.', true], ['O cone tem só superfícies planas.', false], ['Nos prismas e nas pirâmides, o número de faces laterais é igual ao número de lados da base.', true],
      ['Uma pirâmide triangular tem 6 arestas.', true], ['Um prisma pentagonal tem 10 faces.', false]];
    const esc = misturar(r, banco).slice(0, 4);
    return { tipo: 'vf', pergunta: 'Diz se cada afirmação é verdadeira (V) ou falsa (F).', afirmacoes: esc, explica: esc.map(([t, v]) => (v ? 'V' : 'F') + ': ' + t).join(' · ') };
  });
  def('geo', 'planificacao-cubo', r => {
    const vistas = new Set(); let boa = null; const mas = [];
    for (let t = 0; t < 4000 && (!boa || mas.length < 3); t++) {
      const hx = hexomino(r), f = forma(hx); if (vistas.has(f)) continue; vistas.add(f);
      if (eCubo(hx)) { if (!boa) boa = hx; } else if (mas.length < 3) mas.push(hx);
    }
    if (!boa) return null;
    const lista = misturar(r, [boa, ...mas]);
    const certa = lista.indexOf(boa);
    return { tipo: 'escolha', pergunta: 'Qual destas figuras é uma planificação do cubo?', instr: 'Imagina que dobras pelas linhas: as 6 faces têm de fechar o cubo sem se sobreporem.',
      figura: { tipo: 'svg', svg: lista.map((c, i) => `<div style="display:inline-block;margin:6px 14px;text-align:center;vertical-align:top"><b>${'ABCD'[i]}</b><br>${svgPlanificacao(c)}</div>`).join('') },
      opcoes: ['Figura A', 'Figura B', 'Figura C', 'Figura D'], certa,
      explica: `É a figura ${'ABCD'[certa]}: dobrada, cada quadrado fica numa face diferente. Nas outras, duas faces ficariam por cima uma da outra.`,
      pistas: ['Escolhe um quadrado para ser a base do cubo.', 'Dobra os vizinhos para cima: cada um vira uma parede.', 'Se duas partes forem para o mesmo lugar, não é planificação do cubo.'] };
  });
  def('geo', 'angulos', r => {
    const t = pick(r, [[90, 'Ângulo reto'], [ri(r, 25, 70), 'Ângulo agudo'], [ri(r, 110, 160), 'Ângulo obtuso'], [180, 'Ângulo raso'], [360, 'Ângulo giro']]);
    return Object.assign({ tipo: 'escolha', pergunta: 'Como se classifica este ângulo quanto à amplitude?', figura: { tipo: 'svg', svg: svgAngulo(t[0]) } },
      opcoes(r, t[1], ['Ângulo reto', 'Ângulo agudo', 'Ângulo obtuso', 'Ângulo raso', 'Ângulo giro'].filter(x => x !== t[1]).slice(0, 3)),
      { explica: 'Agudo: menor do que o reto · Reto: canto de um quadrado (90°) · Obtuso: maior do que o reto e menor do que o raso · Raso: meia volta (180°) · Giro: volta inteira (360°).' });
  });
  function poliomino(r, k) {
    const cels = [[3, 3]], tem = (a, b) => cels.some(([x, y]) => x === a && y === b);
    while (cels.length < k) { const [a, b] = pick(r, cels), [da, db] = pick(r, [[0, 1], [0, -1], [1, 0], [-1, 0]]); const na = a + da, nb = b + db; if (na >= 0 && nb >= 0 && na < 7 && nb < 7 && !tem(na, nb)) cels.push([na, nb]); }
    return cels;
  }
  const perimetro = cels => { const s = new Set(cels.map(c => c.join(','))); let p = 0; cels.forEach(([a, b]) => [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([x, y]) => { if (!s.has((a + x) + ',' + (b + y))) p++; })); return p; };
  def('geo', 'area-perimetro', r => {
    const k = ri(r, 5, 11), cels = poliomino(r, k), area = r() < 0.5, p = perimetro(cels);
    return { tipo: 'curta', pergunta: area ? 'Qual é a área da figura azul?' : 'Qual é o perímetro da figura azul?', figura: { tipo: 'svg', svg: svgQuadricula(cels, '1 cm de lado') },
      numero: area ? k : p, largura: '100px', depois: area ? NB + 'cm²' : NB + 'cm',
      explica: area ? `A área é o número de quadradinhos: ${k} cm². (O perímetro seria ${p} cm.)` : `O perímetro é a medida da linha à volta: ${p} cm. (A área seria ${k} cm².)`,
      pistas: [area ? 'Área = quanto espaço ocupa por dentro.' : 'Perímetro = o caminho à volta da figura.', area ? 'Conta os quadradinhos azuis.' : 'Conta os lados dos quadradinhos que estão na fronteira, à volta toda.', area ? 'Marca cada um com o dedo para não contares duas vezes.' : 'Começa num canto, dá a volta toda e volta ao mesmo canto.'] };
  });
  def('geo', 'perimetro-retangulo', r => {
    const c = ri(r, 3, 15), l = ri(r, 2, c), area = r() < 0.4;
    return { tipo: 'curta', pergunta: `Um retângulo tem ${c} cm de comprimento e ${l} cm de largura. Qual é ${area ? 'a sua área' : 'o seu perímetro'}?`, numero: area ? c * l : 2 * (c + l), largura: '100px', depois: area ? NB + 'cm²' : NB + 'cm', caderno: true, instr: CADERNO,
      explica: area ? `Área = ${c} × ${l} = ${c * l} cm².` : `Perímetro = ${c} + ${l} + ${c} + ${l} = ${2 * (c + l)} cm.` };
  });
  def('geo', 'simetria', r => {
    const com = misturar(r, ['A', 'H', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y']), sem = misturar(r, ['F', 'G', 'J', 'L', 'N', 'P', 'R', 'S', 'Z']);
    return Object.assign({ tipo: 'escolha', pergunta: 'Qual destas letras tem um eixo de simetria vertical (dobrando ao meio, de cima para baixo, as duas partes coincidem)?' },
      opcoes(r, com[0], sem.slice(0, 3)), { explica: `A letra ${com[0]} é igual dos dois lados de uma linha vertical ao meio.` });
  });
  def('geo', 'coordenadas', r => {
    const c = ri(r, 0, 7), l = ri(r, 0, 7), L = 'abcdefgh', s = pick(r, ['⭐', '🪙', '🐾', '🌰']);
    const certa = `(${L[c]}, ${l + 1})`, er = [`(${L[(c + 1) % 8]}, ${l + 1})`, `(${L[c]}, ${((l + 1) % 8) + 1})`, `(${l + 1}, ${L[c]})`];
    return Object.assign({ tipo: 'escolha', pergunta: `Qual é a posição de ${s} na grelha?`, figura: { tipo: 'svg', svg: svgCoordenadas(c, l, s) } }, opcoes(r, certa, er),
      { explica: `Primeiro a letra (coluna), depois o número (linha): ${certa}.` });
  });

  // ===== Medidas, dinheiro e tempo
  def('med', 'comprimento', r => {
    const t = pick(r, [['km', 'm', 1000], ['m', 'cm', 100], ['m', 'mm', 1000], ['cm', 'mm', 10], ['m', 'dm', 10]]), q = ri(r, 2, 12), inv = r() < 0.3;
    if (inv) return { tipo: 'curta', pergunta: `${fmt(q * t[2])} ${t[1]} são quantos ${t[0]}?`, numero: q, largura: '120px', depois: NB + t[0], explica: `1 ${t[0]} = ${fmt(t[2])} ${t[1]}; ${fmt(q * t[2])} : ${fmt(t[2])} = ${q} ${t[0]}.` };
    return { tipo: 'curta', pergunta: `${q} ${t[0]} são quantos ${t[1]}?`, numero: q * t[2], largura: '120px', depois: NB + t[1], explica: `1 ${t[0]} = ${fmt(t[2])} ${t[1]}; ${q} × ${fmt(t[2])} = ${fmt(q * t[2])} ${t[1]}.` };
  });
  def('med', 'massa', r => {
    const kg = ri(r, 1, 6), g = pick(r, [0, 250, 500, 750]);
    return { tipo: 'curta', pergunta: `${kg}${NB}kg e ${g ? g + NB + 'g' : 'meio quilo'} são quantos gramas?`, numero: kg * 1000 + (g || 500), largura: '120px', depois: NB + 'g',
      explica: `1 kg = 1000 g. ${kg} kg = ${fmt(kg * 1000)} g; + ${g || 500} g = ${fmt(kg * 1000 + (g || 500))} g.` };
  });
  def('med', 'capacidade', r => {
    const t = pick(r, [['l', 'dl', 10], ['l', 'cl', 100], ['l', 'ml', 1000], ['dl', 'ml', 100]]), q = ri(r, 2, 9);
    return { tipo: 'curta', pergunta: `${q} ${t[0]} são quantos ${t[1]}?`, numero: q * t[2], largura: '120px', depois: NB + t[1], explica: `1 ${t[0]} = ${t[2]} ${t[1]}; ${q} × ${t[2]} = ${fmt(q * t[2])} ${t[1]}.` };
  });
  def('med', 'dinheiro', r => {
    const n5 = ri(r, 0, 2), n10 = ri(r, 0, 1), m2 = ri(r, 0, 3), m1 = ri(r, 0, 3), c50 = ri(r, 0, 3), c20 = ri(r, 0, 3), c10 = ri(r, 1, 4);
    const tot = Math.round((n10 * 10 + n5 * 5 + m2 * 2 + m1 + c50 * 0.5 + c20 * 0.2 + c10 * 0.1) * 100) / 100;
    const partes = [[n10, 'nota de 10 €', 'notas de 10 €'], [n5, 'nota de 5 €', 'notas de 5 €'], [m2, 'moeda de 2 €', 'moedas de 2 €'], [m1, 'moeda de 1 €', 'moedas de 1 €'], [c50, 'moeda de 50 cêntimos', 'moedas de 50 cêntimos'], [c20, 'moeda de 20 cêntimos', 'moedas de 20 cêntimos'], [c10, 'moeda de 10 cêntimos', 'moedas de 10 cêntimos']]
      .filter(p => p[0]).map(p => p[0] + ' ' + (p[0] === 1 ? p[1] : p[2]));
    return { tipo: 'curta', pergunta: `Quanto dinheiro há? ${partes.join(', ')}.`, instr: 'Escreve os cêntimos com vírgula (por exemplo 12,40).', numero: tot, largura: '140px', depois: NB + '€', caderno: true,
      explica: `Junta primeiro os euros e depois os cêntimos: ${euros(tot)}.` };
  });
  const hm = (h, m) => `${h}h${String(m).padStart(2, '0')}`;
  def('med', 'relogio', r => {
    const h = ri(r, 1, 12), m = pick(r, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
    const er = [hm(h % 12 + 1, m), hm(h, (m + 15) % 60), hm(m / 5 || 12, h * 5 % 60)];
    return Object.assign({ tipo: 'escolha', pergunta: 'Que horas marca o relógio?', figura: { tipo: 'relogio', h, m } }, opcoes(r, hm(h, m), er),
      { explica: `O ponteiro pequeno indica as horas (${h}) e o grande os minutos (${m}): ${hm(h, m)}.` });
  });
  def('med', 'duracao', r => {
    const h = ri(r, 8, 16), m = pick(r, [0, 10, 15, 20, 30, 40, 45, 50]), dh = ri(r, 0, 2), dm = pick(r, [15, 20, 30, 35, 45, 50]);
    const fim = h * 60 + m + dh * 60 + dm, H = Math.floor(fim / 60), M = fim % 60, act = pick(r, ['O filme', 'A aula de guitarra', 'O jogo de futebol', 'A viagem de Messejana a Beja', 'A oficina no FabLab']);
    const d = `${dh ? dh + ' hora' + (dh > 1 ? 's e ' : ' e ') : ''}${dm} minutos`;
    return { tipo: 'curta', pergunta: `${act} começa às ${hm(h, m)} e dura ${d}. A que horas acaba?`, instr: 'Escreve assim: 10h05', aceitar: [hm(H, M), `${H}:${String(M).padStart(2, '0')}`, `${H}h ${String(M).padStart(2, '0')}`, `${H} h ${String(M).padStart(2, '0')}`, M ? `${H}h${M}` : `${H}h`], largura: '140px',
      explica: `${hm(h, m)} + ${d} = ${hm(H, M)}. Dica: junta primeiro as horas e depois os minutos (60 minutos = 1 hora).` };
  });
  def('med', 'medida-adequada', r => {
    const t = pick(r, [['o comprimento de um lápis', '15 cm', ['15 m', '15 km', '15 mm']], ['a distância de Messejana a Beja', '40 km', ['40 m', '40 cm', '400 mm']], ['a massa de uma melancia', '4 kg', ['4 g', '40 kg', '400 kg']],
      ['a água de uma garrafa pequena', '50 cl', ['50 l', '5 ml', '500 l']], ['a altura de uma porta', '2 m', ['2 cm', '20 m', '2 km']], ['a massa de uma carta', '20 g', ['20 kg', '2 kg', '200 kg']]]);
    return Object.assign({ tipo: 'escolha', pergunta: `Qual é a medida mais adequada para ${t[0]}?` }, opcoes(r, t[1], t[2]), { explica: `${Maiusc(t[0])}: cerca de ${t[1]}.` });
  });

  // ===== Dados e probabilidades
  function dadosComModa(r, min, max, n) {
    const moda = ri(r, min, max), d = [moda, moda, moda, moda];
    n = Math.min(n, 4 + 3 * (max - min));
    while (d.length < n) { const v = ri(r, min, max); if (d.filter(x => x === v).length < 3) d.push(v); }
    return { dados: misturar(r, d), moda };
  }
  def('dad', 'moda-lista', r => {
    const { dados, moda } = dadosComModa(r, 4, 9, ri(r, 14, 22));
    return { tipo: 'curta', pergunta: `Na aula de Educação Física registou-se o número de voltas que cada aluno deu ao campo: ${dados.join(', ')}. Qual é a moda?`, numero: moda, largura: '100px',
      instr: 'Dica: faz uma tabela de frequências no caderno.', explica: `A moda é o valor que aparece mais vezes: ${moda} aparece ${dados.filter(x => x === moda).length} vezes.`,
      pistas: ['A moda é o valor mais repetido.', 'Conta quantas vezes aparece cada número (faz uma tabela).', 'O que tiver mais tracinhos é a moda.'] };
  });
  def('dad', 'contar-lista', r => {
    const { dados } = dadosComModa(r, 4, 9, ri(r, 14, 22)), v = pick(r, dados);
    return { tipo: 'curta', pergunta: `Voltas dadas por cada aluno: ${dados.join(', ')}. Quantos alunos deram ${v} voltas?`, numero: dados.filter(x => x === v).length, largura: '100px', explica: `O ${v} aparece ${dados.filter(x => x === v).length} vezes.` };
  });
  def('dad', 'barras', r => {
    const cats = pick(r, [['Sumo e pão', 'Iogurte e pão', 'Leite e cereais', 'Leite e pão'], ['Futebol', 'Ténis', 'Andebol', 'Natação'], ['7 h', '8 h', '9 h', '10 h', '11 h']]);
    const vals = cats.map(() => ri(r, 1, 10)); const mx = Math.max(...vals); if (vals.filter(v => v === mx).length > 1) vals[vals.indexOf(mx)]++;
    const tot = vals.reduce((a, b) => a + b, 0), t = pick(r, ['moda', 'total', 'diferenca']);
    const fig = { tipo: 'barras', dados: cats.map((c, i) => [c, vals[i]]), eixo: 'Número de alunos', max: Math.max(...vals) + 1, passo: 1 };
    if (t === 'moda') { const m = cats[vals.indexOf(Math.max(...vals))]; return Object.assign({ tipo: 'escolha', pergunta: 'Observa o gráfico de barras. Qual é a moda?', figura: fig }, opcoes(r, m, cats.filter(c => c !== m)), { explica: `A moda é a barra mais alta: ${m}.` }); }
    if (t === 'total') return { tipo: 'curta', pergunta: 'Observa o gráfico de barras. Quantos alunos responderam, ao todo?', figura: fig, numero: tot, largura: '100px', caderno: true, explica: `${vals.join(' + ')} = ${tot} alunos.` };
    const [i, j] = misturar(r, [0, 1, 2, 3]).slice(0, 2), a = Math.max(vals[i], vals[j]) === vals[i] ? i : j, b = a === i ? j : i;
    return { tipo: 'curta', pergunta: `Observa o gráfico de barras. Quantos alunos a mais escolheram «${cats[a]}» do que «${cats[b]}»?`, figura: fig, numero: vals[a] - vals[b], largura: '100px', explica: `${vals[a]} − ${vals[b]} = ${vals[a] - vals[b]}.` };
  });
  def('dad', 'caule-folhas', r => {
    const { dados, moda } = dadosComModa(r, 3, 34, ri(r, 12, 18));
    const caules = {}; dados.forEach(v => { (caules[Math.floor(v / 10)] = caules[Math.floor(v / 10)] || []).push(v % 10); });
    const linhas = Object.keys(caules).sort((a, b) => a - b).map(c => [c, caules[c].sort((a, b) => a - b).join(' ')]);
    const t = pick(r, [['moda', moda], ['valor máximo', Math.max(...dados)], ['valor mínimo', Math.min(...dados)], ['número de dados (quantos alunos responderam)', dados.length]]);
    return { tipo: 'curta', pergunta: `Diagrama de caule-e-folhas: número de dias que cada aluno foi à praia nas férias. Qual é o ${t[0]}?`, instr: 'O caule são as dezenas e as folhas são as unidades (2 | 5 quer dizer 25).',
      tabela: { cab: ['Caule', 'Folhas'], linhas }, numero: t[1], largura: '100px', explica: `Lê cada folha com o seu caule. O ${t[0].split(' (')[0]} é ${t[1]}.` };
  });
  def('dad', 'probabilidade', r => {
    const CORES = [['azul', 'azuis'], ['vermelha', 'vermelhas'], ['amarela', 'amarelas'], ['verde', 'verdes']];
    const c = misturar(r, CORES), q = [ri(r, 3, 7), ri(r, 1, 3)];
    const bolas = (n, k) => `${n} ${n === 1 ? 'bola ' + c[k][0] : 'bolas ' + c[k][1]}`;
    const saco = `Num saco há ${bolas(q[0], 0)} e ${bolas(q[1], 1)}.`, t = pick(r, [0, 1, 2, 3]);
    if (t === 3) return Object.assign({ tipo: 'escolha', pergunta: `${saco} Tira-se uma bola sem olhar. Que cor é mais provável sair?` }, opcoes(r, `Bola ${c[0][0]}`, [`Bola ${c[1][0]}`, 'É igualmente provável']), { explica: `Há mais bolas ${c[0][1]} (${q[0]}) do que ${c[1][1]} (${q[1]}).` });
    const casos = [[`sair uma bola ${c[2][0]}`, 'Impossível', `não há bolas ${c[2][1]} no saco`], [`sair uma bola ${c[0][0]}`, 'Possível, mas não certo', `há bolas ${c[0][1]}, mas também há ${c[1][1]}`], [`sair uma bola ${c[0][0]} ou ${c[1][0]}`, 'Certo', 'todas as bolas do saco são dessas cores']][t];
    return Object.assign({ tipo: 'escolha', pergunta: `${saco} Tira-se uma bola sem olhar. ${Maiusc(casos[0])} é…` }, opcoes(r, casos[1], ['Impossível', 'Possível, mas não certo', 'Certo'].filter(x => x !== casos[1])), { explica: `${casos[1]}, porque ${casos[2]}.` });
  });

  // ===== Pensamento computacional
  def('pc', 'binario-ler', r => {
    const n = ri(r, 3, 31), bits = n.toString(2).padStart(5, '0');
    return { tipo: 'curta', pergunta: 'Os computadores guardam os números só com 0 e 1 (sistema binário). Que número representam estes cartões?', instr: 'Cartão com pintas à vista = 1 · cartão virado (escuro) = 0. Soma as pintas que se veem.',
      figura: { tipo: 'svg', svg: svgCartoes(bits) }, numero: n, largura: '100px', explica: `${bits.split('').map((b, i) => b === '1' ? [16, 8, 4, 2, 1][i] : null).filter(Boolean).join(' + ')} = ${n}.` };
  });
  def('pc', 'binario-escrever', r => {
    const n = ri(r, 3, 31), bits = n.toString(2).padStart(5, '0');
    return { tipo: 'curta', pergunta: `Com os cartões 16 · 8 · 4 · 2 · 1, como se escreve o número ${n} no sistema binário?`, instr: 'Escreve 5 algarismos (0 ou 1), um por cartão, por esta ordem: 16 8 4 2 1.',
      figura: { tipo: 'svg', svg: svgCartoes('11111') }, aceitar: [bits, bits.replace(/^0+/, ''), bits.split('').join(' ')], largura: '140px',
      explica: `${n} = ${bits.split('').map((b, i) => b === '1' ? [16, 8, 4, 2, 1][i] : null).filter(Boolean).join(' + ')} → ${bits}.`, pistas: [`Qual é o maior cartão que cabe em ${n}?`, 'Vira esse cartão (1) e vê quanto falta.', 'Continua com os cartões mais pequenos até não faltar nada; os outros ficam 0.'] };
  });
  def('pc', 'enigma-simbolos', r => {
    const a = pick(r, [5, 10, 15, 20, 25]), b = ri(r, 2, 9) * 5, c = ri(r, 1, 6) * 10;
    const s = misturar(r, ['🌰', '🍄', '⭐', '🐌', '🍓']);
    const linhas = [`${s[0]} + ${s[0]} + ${s[0]} + ${s[0]} = ${4 * a}`, `${s[0]} + ${s[1]} + ${s[1]} = ${a + 2 * b}`, `${s[2]} − ${s[1]} = ${c}`];
    return { tipo: 'curta', pergunta: `Resolve o enigma! Quanto vale ${s[0]} + ${s[1]} + ${s[2]}?`, instr: linhas.join('   ·   '), numero: a + b + (b + c), largura: '100px', caderno: true,
      explica: `${s[0]} = ${4 * a} : 4 = ${a}; ${s[1]} = (${a + 2 * b} − ${a}) : 2 = ${b}; ${s[2]} = ${c} + ${b} = ${b + c}. Soma: ${a} + ${b} + ${b + c} = ${a + 2 * b + c}.`,
      pistas: ['Começa pela linha em que só aparece um símbolo.', 'Já sabes o primeiro? Usa-o na linha seguinte.', 'Quando souberes os três, soma-os.'] };
  });
  def('pc', 'algoritmo', r => {
    const s = ri(r, 2, 9), passos = misturar(r, [['+', ri(r, 2, 9)], ['×', ri(r, 2, 4)], ['−', ri(r, 1, 5)]]);
    let v = s; passos.forEach(([o, k]) => { v = o === '+' ? v + k : o === '×' ? v * k : v - k; });
    return { tipo: 'curta', pergunta: `O Nico segue este algoritmo: começa com ${s}, ${passos.map(([o, k]) => ({ '+': 'adiciona ' + k, '×': 'multiplica por ' + k, '−': 'subtrai ' + k })[o]).join(', depois ')}. Com que número fica?`, numero: v, largura: '100px',
      explica: `${s}${passos.map(([o, k]) => ` ${o} ${k}`).join(' → ')} = ${v}. A ordem dos passos importa!` };
  });

  // ============================================================ 2.ª fornada (7 Nov 2026): mais tipos de exercício
  // ===== Números
  def('num', 'comparar-sinais', r => {
    const a = grande(r), b = pick(r, [a + ri(r, 1, 9) * pick(r, [1, 10, 100, 1000, 10000]), a - ri(r, 1, 9) * pick(r, [10, 1000]), a]);
    if (b < 0 || b > 999999) return null;
    const s = a > b ? '>' : a < b ? '<' : '=';
    return Object.assign({ tipo: 'escolha', pergunta: `Que sinal fica bem? ${fmt(a)} ___ ${fmt(b)}` }, { opcoes: ['<', '>', '='], certa: ['<', '>', '='].indexOf(s) },
      { explica: `Compara ordem a ordem, da esquerda para a direita: ${fmt(a)} ${s} ${fmt(b)}.` });
  });
  def('num', 'formar-numero', r => {
    const d = misturar(r, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, ri(r, 4, 6)), maior = r() < 0.5;
    const ord = d.slice().sort((x, y) => maior ? y - x : x - y);
    if (!maior && ord[0] === 0) { const k = ord.findIndex(x => x); [ord[0], ord[k]] = [ord[k], ord[0]]; }
    const n = Number(ord.join(''));
    return { tipo: 'curta', pergunta: `Usa todos estes algarismos uma só vez: ${d.join(', ')}. Qual é o ${maior ? 'maior' : 'menor'} número que consegues formar?`, numero: n, largura: '180px',
      explica: `${maior ? 'Do maior algarismo para o menor' : 'Do menor para o maior (mas o número não pode começar por 0)'}: ${fmt(n)}.` };
  });
  def('num', 'dobro-metade', r => {
    const t = pick(r, [['dobro', 2, 'x'], ['triplo', 3, 'x'], ['quádruplo', 4, 'x'], ['metade', 2, ':'], ['terça parte', 3, ':'], ['quarta parte', 4, ':']]);
    const v = ri(r, 12, 450), n = t[2] === 'x' ? v : v * t[1];
    return { tipo: 'curta', pergunta: `Qual é ${t[0] === 'metade' || t[0].includes('parte') ? 'a' : 'o'} ${t[0]} de ${fmt(n)}?`, numero: t[2] === 'x' ? n * t[1] : v, largura: '150px',
      explica: t[2] === 'x' ? `${t[0]} = × ${t[1]}: ${fmt(n)} × ${t[1]} = ${fmt(n * t[1])}.` : `${t[0]} = : ${t[1]}: ${fmt(n)} : ${t[1]} = ${fmt(v)}.` };
  });
  def('num', 'par-impar', r => {
    const par = r() < 0.5, ns = misturar(r, [0, 1, 2, 3].map(() => ri(r, 100, 9999)));
    ns[0] = ns[0] - (ns[0] % 2) + (par ? 0 : 1); for (let k = 1; k < 4; k++) ns[k] = ns[k] - (ns[k] % 2) + (par ? 1 : 0);
    return Object.assign({ tipo: 'escolha', pergunta: `Qual destes números é ${par ? 'par' : 'ímpar'}?` }, opcoes(r, fmt(ns[0]), ns.slice(1).map(fmt)),
      { explica: `Basta olhar para o algarismo das unidades: ${par ? '0, 2, 4, 6 ou 8 → par' : '1, 3, 5, 7 ou 9 → ímpar'}. ${fmt(ns[0])} termina em ${ns[0] % 10}.` });
  });
  def('num', 'reta-ler', r => {
    const passo = pick(r, [10, 100, 1000, 10000]), ini = ri(r, 1, 50) * passo * 10, k = ri(r, 1, 9), v = ini + k * passo;
    if (v > 999999) return null;
    let g = `<line x1="20" y1="50" x2="540" y2="50" stroke="#222" stroke-width="3"/>`;
    for (let i = 0; i <= 10; i++) { const x = 20 + i * 52; g += `<line x1="${x}" y1="${i % 5 ? 42 : 36}" x2="${x}" y2="${i % 5 ? 58 : 64}" stroke="#222" stroke-width="2"/>`; if (i === 0 || i === 10) g += `<text x="${x}" y="86" text-anchor="middle" font-size="15" font-weight="700">${fmt(ini + i * passo)}</text>`; }
    g += `<path d="M${20 + k * 52},30 l-9,-16 h18 z" fill="#e05a47"/>`;
    return { tipo: 'curta', pergunta: 'Que número está a seta a indicar na reta numérica?', figura: { tipo: 'svg', svg: `<svg xmlns="${NS}" viewBox="0 0 560 96" width="540" font-family="Asap, sans-serif">${g}</svg>` },
      numero: v, largura: '180px', explica: `Entre ${fmt(ini)} e ${fmt(ini + 10 * passo)} há 10 espaços: cada um vale ${fmt(passo)}. A seta está no ${k}.º risco: ${fmt(ini)} + ${k} × ${fmt(passo)} = ${fmt(v)}.`,
      pistas: ['Vê os números das pontas.', 'Quantos espaços há entre eles? Quanto vale cada espaço?', 'Conta os riscos até à seta.'] };
  });
  def('num', 'romanos', r => {
    const R = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    const rom = n => { let s = ''; for (const [v, l] of R) while (n >= v) { s += l; n -= v; } return s; };
    const n = pick(r, [ri(r, 4, 39), ri(r, 40, 99), ri(r, 100, 399), 1252, 1755, 1910, 1974, 2026]);
    if (r() < 0.5) return { tipo: 'curta', pergunta: `Que número é ${rom(n)} em numeração romana?`, instr: 'I = 1 · V = 5 · X = 10 · L = 50 · C = 100 · D = 500 · M = 1000', numero: n, largura: '140px',
      explica: `${rom(n)} = ${n}. Um símbolo menor antes de um maior tira-se (IV = 4); depois soma-se.` };
    return Object.assign({ tipo: 'escolha', pergunta: `Como se escreve ${n} em numeração romana?`, instr: 'I = 1 · V = 5 · X = 10 · L = 50 · C = 100 · D = 500 · M = 1000' }, opcoes(r, rom(n), [rom(n + 1), rom(Math.max(1, n - 10)), rom(n + 5)]), { explica: `${n} = ${rom(n)}.` });
  });

  // ===== Cálculo
  def('ops', 'divisao-resto', r => {
    const b = ri(r, 3, 9), q = ri(r, 4, 12), rest = ri(r, 1, b - 1), a = b * q + rest, pede = r() < 0.5 ? 'resto' : 'quociente';
    return { tipo: 'curta', pergunta: `Na divisão ${a} : ${b}, qual é o ${pede}?`, numero: pede === 'resto' ? rest : q, largura: '100px', caderno: true, instr: CADERNO,
      explica: `${b} × ${q} = ${b * q} e sobram ${rest}: quociente ${q}, resto ${rest}. (O resto é sempre menor do que o divisor.)` };
  });
  def('ops', 'multiplos', r => {
    const m = ri(r, 3, 9), certo = m * ri(r, 3, 12); const er = []; while (er.length < 3) { const x = ri(r, 10, 99); if (x % m && !er.includes(x)) er.push(x); }
    return Object.assign({ tipo: 'escolha', pergunta: `Qual destes números é múltiplo de ${m}?` }, opcoes(r, certo, er), { explica: `${certo} = ${m} × ${certo / m}. Os múltiplos de ${m} estão na tabuada do ${m}.` });
  });
  def('ops', 'estimativa', r => {
    const a = ri(r, 1100, 4900), b = ri(r, 1100, 4900), est = Math.round(a / 1000) * 1000 + Math.round(b / 1000) * 1000;
    return Object.assign({ tipo: 'escolha', pergunta: `Sem fazer a conta: ${fmt(a)} + ${fmt(b)} dá mais ou menos…` }, opcoes(r, fmt(est), [fmt(est + 2000), fmt(Math.max(1000, est - 2000)), fmt(est * 10)]),
      { explica: `Arredonda aos milhares: ${fmt(Math.round(a / 1000) * 1000)} + ${fmt(Math.round(b / 1000) * 1000)} = ${fmt(est)}. (A conta certa dá ${fmt(a + b)}.)` });
  });
  def('ops', 'prova-subtracao', r => {
    const a = ri(r, 500, 999), b = ri(r, 100, a - 50), c = a - b;
    return Object.assign({ tipo: 'escolha', pergunta: `O Tomás calculou ${a} − ${b} = ${c}. Que conta serve para confirmar (fazer a prova)?` }, opcoes(r, `${c} + ${b} = ${a}`, [`${a} + ${b} = ${a + b}`, `${c} − ${b} = ${c - b}`, `${a} × ${b}`]),
      { explica: 'Na subtração, a prova é somar o resultado (resto) com o subtrativo: tem de dar o aditivo.' });
  });
  def('ops', 'comutativa', r => {
    const a = ri(r, 3, 9), b = ri(r, 3, 9), c = ri(r, 2, 5), t = pick(r, [0, 1, 2]);
    if (t === 0) return { tipo: 'curta', pergunta: `Completa: ${a} × ${b} = ${b} × ?`, numero: a, largura: '80px', explica: 'Na multiplicação a ordem dos fatores não altera o produto (propriedade comutativa).' };
    if (t === 1) return { tipo: 'curta', pergunta: `Completa: (${a} × ${b}) × ${c} = ${a} × (${b} × ?)`, numero: c, largura: '80px', explica: 'Podemos agrupar os fatores como quisermos (propriedade associativa).' };
    return { tipo: 'curta', pergunta: `Completa: ${a} × ${b + 10} = ${a} × ${b} + ${a} × ?`, numero: 10, largura: '80px', explica: `Decompõe ${b + 10} em ${b} + 10 e multiplica cada parte por ${a} (propriedade distributiva).` };
  });
  def('ops', 'decimal-dinheiro', r => {
    const e = ri(r, 0, 25), c = ri(r, 1, 99), t = r() < 0.5;
    const val = Math.round((e + c / 100) * 100) / 100;
    if (t) return { tipo: 'curta', pergunta: `Escreve com vírgula: ${e} euros e ${c} cêntimos.`, numero: val, largura: '140px', depois: NB + '€', explica: `Os cêntimos são centésimas do euro: ${euros(val)}.` };
    return { tipo: 'curta', pergunta: `${euros(val)} são quantos cêntimos?`, numero: e * 100 + c, largura: '140px', depois: NB + 'cêntimos', explica: `1 € = 100 cêntimos: ${e} × 100 + ${c} = ${e * 100 + c} cêntimos.` };
  });

  // ===== Problemas
  def('pro', 'ovos', r => { const d = ri(r, 4, 12), p = ri(r, 1, 5); return prob(`Num camião vinham ${d} dúzias de ovos. Partiram-se ${p} ovos de cada dúzia. Quantos ovos ficaram inteiros?`, d * (12 - p), `Uma dúzia = 12. Ficam ${12 - p} inteiros por dúzia: ${d} × ${12 - p} = ${d * (12 - p)} ovos.`, 'ovos'); });
  def('pro', 'quantos-compro', r => { const p = ri(r, 2, 9), t = p * ri(r, 3, 9) + ri(r, 0, p - 1); return prob(`Cada caderno custa ${p}${NB}€. ${Maiusc(pick(r, NOMES))} tem ${t}${NB}€. Quantos cadernos consegue comprar, no máximo?`, Math.floor(t / p), `${t} : ${p} = ${Math.floor(t / p)}${t % p ? ' e sobram ' + (t % p) + ' €' : ''}.`, 'cadernos'); });
  def('pro', 'cadeiras', r => { const f = ri(r, 6, 15), c = ri(r, 8, 20), o = ri(r, 10, f * c - 10); return prob(`No auditório há ${f} filas com ${c} cadeiras cada. Já estão sentadas ${o} pessoas. Quantas cadeiras estão livres?`, f * c - o, `${f} × ${c} = ${f * c} cadeiras; ${f * c} − ${o} = ${f * c - o} livres.`, 'cadeiras'); });
  def('pro', 'garrafas', r => { const l = ri(r, 6, 30), g = pick(r, [2, 5, 10]); return prob(`Um garrafão tem ${l * g / 10 === Math.floor(l * g / 10) ? l : l} litros de água. Quantos copos de ${g === 2 ? '50 cl' : g === 5 ? '20 cl' : '10 cl'} se enchem?`, l * (100 / (g === 2 ? 50 : g === 5 ? 20 : 10)), `1 l = 100 cl; ${l} l = ${l * 100} cl; ${l * 100} : ${g === 2 ? 50 : g === 5 ? 20 : 10} = ${l * (100 / (g === 2 ? 50 : g === 5 ? 20 : 10))} copos.`, 'copos'); });
  def('pro', 'idades', r => { const j = ri(r, 7, 11), p = ri(r, 28, 45), a = ri(r, 2, 10); return prob(`O Jaime tem ${j} anos e o pai tem ${p}. Que idade terá o pai quando o Jaime tiver ${j + a} anos?`, p + a, `Passam ${a} anos para os dois: ${p} + ${a} = ${p + a} anos.`, 'anos'); });
  def('pro', 'vedacao', r => { const c = ri(r, 8, 30), l = ri(r, 5, c); return prob(`A horta da escola é retangular, com ${c} m de comprimento e ${l} m de largura. Quantos metros de rede são precisos para a vedar à volta?`, 2 * (c + l), `É o perímetro: ${c} + ${l} + ${c} + ${l} = ${2 * (c + l)} m.`, 'm'); });
  def('pro', 'viagem-horas', r => { const h = ri(r, 7, 10), m = pick(r, [0, 15, 30, 45]), d = ri(r, 2, 5) * 30, f = h * 60 + m + d;
    return Object.assign(prob(`O autocarro para Beja sai às ${hm(h, m)} e chega às ${hm(Math.floor(f / 60), f % 60)}. Quantos minutos demora a viagem?`, d, `Das ${hm(h, m)} às ${hm(Math.floor(f / 60), f % 60)} vão ${d} minutos.`, 'minutos'), { instr: 'Conta os minutos de 15 em 15 ou de hora em hora (1 hora = 60 minutos).' }); });

  // ===== Frações
  def('fra', 'fracao-equivalente', r => {
    const d = pick(r, [2, 3, 4, 5]), n = ri(r, 1, d - 1), k = ri(r, 2, 4);
    return { tipo: 'curta', pergunta: `Completa: ${n}/${d} = ?/${d * k}`, numero: n * k, largura: '80px', explica: `O denominador foi multiplicado por ${k}; o numerador também: ${n} × ${k} = ${n * k}. ${n}/${d} = ${n * k}/${d * k}.` };
  });
  def('fra', 'fracao-decimal', r => {
    const t = r() < 0.5, n = ri(r, 1, 9), c = ri(r, 11, 99);
    if (t) return { tipo: 'curta', pergunta: `Escreve como número decimal: ${n}/10`, numero: n / 10, largura: '100px', explica: `${n}/10 = ${n} décimas = 0,${n}.` };
    return { tipo: 'curta', pergunta: `Escreve como número decimal: ${c}/100`, numero: c / 100, largura: '100px', explica: `${c}/100 = ${c} centésimas = 0,${c}.` };
  });
  def('fra', 'unidade-fracao', r => {
    const d = pick(r, [2, 3, 4, 5, 6, 8, 10]), u = ri(r, 1, 3);
    return { tipo: 'curta', pergunta: `Quantos ${['', '', 'meios', 'terços', 'quartos', 'quintos', 'sextos', '', 'oitavos', '', 'décimos'][d]} há em ${u === 1 ? 'uma unidade' : u + ' unidades'}?`, numero: u * d, largura: '80px',
      explica: `Uma unidade tem ${d}/${d}. ${u === 1 ? '' : u + ' unidades têm ' + u + ' × ' + d + ' = ' + u * d + '.'}` };
  });

  // ===== Sequências
  def('seq', 'seq-falta', r => {
    const s = ri(r, 10, 400), k = pick(r, [5, 25, 50, 100, 250, 9, 11]), t = [0, 1, 2, 3, 4, 5].map(i => s + i * k), f = ri(r, 1, 4);
    return { tipo: 'curta', pergunta: `Qual é o número que falta? ${t.map((x, i) => i === f ? '?' : fmt(x)).join(' · ')}`, numero: t[f], largura: '150px', explica: `A regra é +${k}: ${fmt(t[f - 1])} + ${k} = ${fmt(t[f])}.` };
  });
  def('seq', 'seq-dobro', r => {
    const s = ri(r, 1, 6), m = pick(r, [2, 3]), t = [0, 1, 2, 3, 4].map(i => s * Math.pow(m, i));
    return { tipo: 'curta', pergunta: `Cada número é o ${m === 2 ? 'dobro' : 'triplo'} do anterior: ${t.slice(0, 4).join(', ')}, … Qual é o seguinte?`, numero: t[4], largura: '120px', explica: `${t[3]} × ${m} = ${t[4]}.` };
  });
  def('seq', 'seq-decrescente', r => {
    const k = pick(r, [3, 4, 6, 7, 8, 15, 20, 100]), s = k * ri(r, 8, 20) + ri(r, 0, k - 1), t = [0, 1, 2, 3, 4].map(i => s - i * k);
    return { tipo: 'curta', pergunta: `Descobre a regra e escreve o número seguinte: ${t.slice(0, 4).join(' · ')} · ?`, numero: t[4], largura: '120px', explica: `A regra é subtrair ${k}: ${t[3]} − ${k} = ${t[4]}.` };
  });

  // ===== Geometria
  def('geo', 'poligonos', r => {
    const P = [[3, 'Triângulo'], [4, 'Quadrilátero'], [5, 'Pentágono'], [6, 'Hexágono'], [8, 'Octógono']], [n, nome] = pick(r, P);
    let pts = ''; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / n; pts += `${(90 + 70 * Math.cos(a)).toFixed(1)},${(90 + 70 * Math.sin(a)).toFixed(1)} `; }
    return Object.assign({ tipo: 'escolha', pergunta: 'Como se chama este polígono?', figura: { tipo: 'svg', svg: `<svg xmlns="${NS}" viewBox="0 0 180 180" width="170"><polygon points="${pts}" fill="#bfe3f2" stroke="#1d4f86" stroke-width="4"/></svg>` } },
      opcoes(r, nome, P.filter(p => p[1] !== nome).map(p => p[1])), { explica: `Tem ${n} lados: é um ${nome.toLowerCase()}.` });
  });
  def('geo', 'retas', r => {
    const t = pick(r, ['paralelas', 'perpendiculares', 'concorrentes']);
    const g = { paralelas: '<line x1="20" y1="40" x2="260" y2="20" stroke="#222" stroke-width="4"/><line x1="20" y1="110" x2="260" y2="90" stroke="#222" stroke-width="4"/>',
      perpendiculares: '<line x1="30" y1="80" x2="250" y2="80" stroke="#222" stroke-width="4"/><line x1="140" y1="10" x2="140" y2="150" stroke="#222" stroke-width="4"/><path d="M140,80 h16 v-16 h-16" fill="none" stroke="#e08a00" stroke-width="3"/>',
      concorrentes: '<line x1="20" y1="140" x2="260" y2="20" stroke="#222" stroke-width="4"/><line x1="30" y1="40" x2="250" y2="130" stroke="#222" stroke-width="4"/>' }[t];
    return Object.assign({ tipo: 'escolha', pergunta: 'Como são estas duas retas?', figura: { tipo: 'svg', svg: `<svg xmlns="${NS}" viewBox="0 0 280 160" width="280">${g}</svg>` } },
      opcoes(r, Maiusc(t) + (t === 'perpendiculares' ? ' (cruzam-se formando ângulos retos)' : t === 'paralelas' ? ' (nunca se cruzam)' : ' (cruzam-se, mas sem ângulos retos)'),
        ['Paralelas (nunca se cruzam)', 'Perpendiculares (cruzam-se formando ângulos retos)', 'Concorrentes (cruzam-se, mas sem ângulos retos)']),
      { explica: 'Paralelas nunca se encontram; perpendiculares cruzam-se em ângulo reto; concorrentes oblíquas cruzam-se sem ângulo reto.' });
  });
  def('geo', 'circulo', r => {
    const ra = ri(r, 2, 15), pedeD = r() < 0.6;
    return { tipo: 'curta', pergunta: pedeD ? `Uma circunferência tem ${ra} cm de raio. Quanto mede o diâmetro?` : `Uma circunferência tem ${2 * ra} cm de diâmetro. Quanto mede o raio?`, numero: pedeD ? 2 * ra : ra, largura: '100px', depois: NB + 'cm',
      explica: `O diâmetro é o dobro do raio (atravessa o círculo pelo centro): ${pedeD ? ra + ' × 2 = ' + 2 * ra : 2 * ra + ' : 2 = ' + ra} cm.` };
  });
  def('geo', 'equivalentes', r => {
    const k = ri(r, 5, 9), a = poliomino(r, k); let b = poliomino(r, k); const outras = [poliomino(r, k + 1), poliomino(r, k - 1), poliomino(r, k + 2)];
    const figs = misturar(r, [['b', b], ...outras.map((o, i) => ['o' + i, o])]);
    const certa = figs.findIndex(f => f[0] === 'b');
    return { tipo: 'escolha', pergunta: 'A figura azul tem a mesma área que qual das figuras A, B, C ou D? (figuras equivalentes)', figura: { tipo: 'svg', svg: `<div style="text-align:center">${svgQuadricula(a, '')}</div>` + figs.map((f, i) => `<div style="display:inline-block;margin:4px 8px;text-align:center"><b>${'ABCD'[i]}</b><br>${svgQuadricula(f[1], '').replace('width="320"', 'width="150"')}</div>`).join('') },
      opcoes: ['Figura A', 'Figura B', 'Figura C', 'Figura D'], certa, explica: `A figura azul tem ${k} quadradinhos; a figura ${'ABCD'[certa]} também. Têm formas diferentes mas a mesma área.` };
  });
  def('geo', 'poligonos-vf', r => {
    const banco = [['Um quadrado tem 4 lados iguais e 4 ângulos retos.', true], ['Todos os retângulos são quadrados.', false], ['Um triângulo pode ter um ângulo reto.', true], ['Um pentágono tem 6 lados.', false],
      ['O quadrado é um retângulo especial.', true], ['Um hexágono tem 6 vértices.', true], ['Num círculo, o diâmetro é metade do raio.', false], ['Um losango tem os 4 lados iguais.', true], ['Um triângulo tem 4 vértices.', false]];
    const esc = misturar(r, banco).slice(0, 4);
    return { tipo: 'vf', pergunta: 'Diz se cada afirmação é verdadeira (V) ou falsa (F).', afirmacoes: esc, explica: esc.map(([t, v]) => (v ? 'V' : 'F') + ': ' + t).join(' · ') };
  });

  // ===== Medidas e tempo
  def('med', 'tempo-converter', r => {
    const t = pick(r, [['horas', 'minutos', 60], ['minutos', 'segundos', 60], ['dias', 'horas', 24], ['semanas', 'dias', 7], ['anos', 'meses', 12], ['séculos', 'anos', 100]]), q = ri(r, 2, 6);
    return { tipo: 'curta', pergunta: `${q} ${t[0]} são quantos ${t[1]}?`, numero: q * t[2], largura: '120px', depois: NB + t[1], explica: `1 ${t[0].replace(/s$/, '').replace('éculo', 'éculo')} = ${t[2]} ${t[1]}; ${q} × ${t[2]} = ${q * t[2]}.` };
  });
  def('med', 'calendario', r => {
    const D = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'], h = ri(r, 0, 6), n = ri(r, 2, 20), f = (h + n) % 7;
    return Object.assign({ tipo: 'escolha', pergunta: `Hoje é ${D[h]}. Que dia da semana será daqui a ${n} dias?` }, opcoes(r, Maiusc(D[f]), [D[(f + 1) % 7], D[(f + 6) % 7], D[(f + 3) % 7]].map(Maiusc)),
      { explica: `${n} dias = ${Math.floor(n / 7)} semana(s) e ${n % 7} dia(s). As semanas inteiras voltam ao mesmo dia; depois avança ${n % 7}: ${D[f]}.` });
  });
  def('med', 'seculo', r => {
    const a = pick(r, [ri(r, 1101, 1999), 1252, 1143, 1492, 1755, 1910, 1974, 2026]), s = Math.ceil(a / 100);
    const R = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']], rom = n => { let o = ''; for (const [v, l] of R) while (n >= v) { o += l; n -= v; } return o; };
    return Object.assign({ tipo: 'escolha', pergunta: `Em que século fica o ano ${a}?` }, opcoes(r, `Século ${rom(s)}`, [`Século ${rom(s - 1)}`, `Século ${rom(s + 1)}`, `Século ${rom(Math.floor(a / 100) === s ? s - 2 : Math.floor(a / 100))}`]),
      { explica: `Um século tem 100 anos. Os anos ${(s - 1) * 100 + 1} a ${s * 100} são o século ${rom(s)} (${s}).` });
  });
  def('med', 'menos-moedas', r => {
    const v = ri(r, 1, 9) * 10 + pick(r, [0, 5]) + ri(r, 0, 2) * 100;
    if (!v) return null;
    let resto = v, n = 0; for (const m of [200, 100, 50, 20, 10, 5, 2, 1]) { n += Math.floor(resto / m); resto %= m; }
    return { tipo: 'curta', pergunta: `Qual é o menor número de moedas para pagar exatamente ${euros(v / 100)}?`, instr: 'Moedas: 2 € · 1 € · 50 · 20 · 10 · 5 · 2 · 1 cêntimos.', numero: n, largura: '80px', depois: NB + 'moedas',
      explica: 'Começa pela maior moeda que cabe e vai descendo.' };
  });

  // ===== Dados
  def('dad', 'pictograma', r => {
    const v = ri(r, 2, 4), cats = ['Maçãs', 'Peras', 'Laranjas', 'Uvas'], q = cats.map(() => ri(r, 1, 6)), i = ri(r, 0, 3);
    return { tipo: 'curta', pergunta: `No pictograma, cada 🍎 vale ${v} frutos. Quantas ${cats[i].toLowerCase()} foram vendidas?`, tabela: { cab: ['Fruta', 'Vendas'], linhas: cats.map((c, k) => [c, '🍎'.repeat(q[k])]) },
      numero: q[i] * v, largura: '100px', explica: `${q[i]} símbolos × ${v} = ${q[i] * v}.` };
  });
  def('dad', 'venn', r => {
    const ns = misturar(r, Array.from({ length: 30 }, (_, k) => k + 1)).slice(0, 12), A = n => n % 2 === 0, B = n => n > 15;
    const t = pick(r, [['pares e maiores do que 15', n => A(n) && B(n)], ['pares mas não maiores do que 15', n => A(n) && !B(n)], ['maiores do que 15 mas ímpares', n => !A(n) && B(n)], ['nem pares nem maiores do que 15', n => !A(n) && !B(n)]]);
    return { tipo: 'curta', pergunta: `Diagrama de Venn: o círculo A é «números pares» e o B é «números maiores do que 15». Destes números: ${ns.sort((a, b) => a - b).join(', ')} — quantos são ${t[0]}?`,
      instr: 'Dica: desenha os dois círculos no caderno e arruma cada número.', numero: ns.filter(t[1]).length, largura: '80px', explica: `São: ${ns.filter(t[1]).join(', ') || 'nenhum'}.` };
  });
  def('dad', 'tabela-dupla', r => {
    const R = [ri(r, 2, 9), ri(r, 2, 9)], M = [ri(r, 2, 9), ri(r, 2, 9)], t = pick(r, [0, 1, 2]);
    const tab = { cab: ['', 'Rapazes', 'Raparigas'], linhas: [['Gostam de futebol', R[0], M[0]], ['Gostam de natação', R[1], M[1]]] };
    const p = [['Quantos alunos gostam de futebol?', R[0] + M[0]], ['Quantas raparigas há ao todo?', M[0] + M[1]], ['Quantos alunos responderam ao todo?', R[0] + R[1] + M[0] + M[1]]][t];
    return { tipo: 'curta', pergunta: 'Observa a tabela. ' + p[0], tabela: tab, numero: p[1], largura: '80px', explica: `Soma as casas certas da tabela: ${p[1]}.` };
  });

  // ===== Pensamento computacional
  def('pc', 'caminho-setas', r => {
    const L = 'abcdefgh'; let c = ri(r, 2, 5), l = ri(r, 2, 5); const c0 = c, l0 = l, P = [];
    for (let i = 0; i < ri(r, 3, 5); i++) { const [s, dc, dl] = pick(r, [['→', 1, 0], ['←', -1, 0], ['↑', 0, 1], ['↓', 0, -1]]), n = ri(r, 1, 2); if (c + dc * n < 0 || c + dc * n > 7 || l + dl * n < 0 || l + dl * n > 7) continue; c += dc * n; l += dl * n; P.push(`${n} ${s}`); }
    if (P.length < 3) return null;
    const certa = `(${L[c]}, ${l + 1})`;
    return Object.assign({ tipo: 'escolha', pergunta: `O Nico 🐾 está em (${L[c0]}, ${l0 + 1}). Segue o programa: ${P.join(', ')}. Onde fica?`, figura: { tipo: 'svg', svg: svgCoordenadas(c0, l0, '🐾') } },
      opcoes(r, certa, [`(${L[Math.min(7, c + 1)]}, ${l + 1})`, `(${L[c]}, ${Math.max(1, l)})`, `(${L[Math.max(0, c - 1)]}, ${Math.min(8, l + 2)})`]), { explica: `Passo a passo, a partir de (${L[c0]}, ${l0 + 1}): ${P.join(' · ')} ⇒ ${certa}. ↑ sobe uma linha, → avança uma coluna.` });
  });
  def('pc', 'ordenar-passos', r => {
    const a = ri(r, 2, 9) * 100 + ri(r, 10, 99), b = ri(r, 100, 899);
    return { tipo: 'ordenar', pergunta: `Põe os passos do algoritmo da adição ${a} + ${b} pela ordem certa.`, itens: ['Escrever os números um por baixo do outro, alinhados pelas unidades', 'Somar as unidades', 'Somar as dezenas (com o «e vai um», se houver)', 'Somar as centenas', 'Confirmar se o resultado faz sentido'],
      explica: 'Primeiro arrumar, depois somar da direita para a esquerda (unidades → dezenas → centenas), e no fim confirmar.' };
  });
  def('pc', 'condicao', r => {
    const n = ri(r, 1, 50), lim = ri(r, 10, 40), mais = ri(r, 2, 9);
    const v = n > lim ? n - mais : n + mais;
    return { tipo: 'curta', pergunta: `Programa do Nico: «se o número for maior do que ${lim}, tira ${mais}; senão, junta ${mais}». Que número sai se entrar o ${n}?`, numero: v, largura: '100px',
      explica: `${n} ${n > lim ? 'é' : 'não é'} maior do que ${lim}, por isso ${n > lim ? 'tira' : 'junta'} ${mais}: ${v}.` };
  });
  def('pc', 'repete', r => {
    const ini = ri(r, 0, 20), n = ri(r, 3, 8), k = ri(r, 2, 9);
    return { tipo: 'curta', pergunta: `O contador começa em ${ini}. O programa diz «repete ${n} vezes: soma ${k}». Com que valor fica o contador?`, numero: ini + n * k, largura: '100px',
      explica: `${n} vezes ${k} = ${n * k}; ${ini} + ${n * k} = ${ini + n * k}.` };
  });

  // ============================================================ 3.ª fornada (7 Nov 2026)
  // ===== Números
  def('num', 'ordens-baralhadas', r => {
    const p = misturar(r, [[100000, 'CM'], [10000, 'DM'], [1000, 'UM'], [100, 'C'], [10, 'D'], [1, 'U']]).slice(0, ri(r, 3, 5)).map(([v, o]) => [v, o, ri(r, 1, 9)]);
    const n = p.reduce((t, [v, , d]) => t + v * d, 0);
    return { tipo: 'curta', pergunta: `Que número é ${p.map(([, o, d]) => `${d} ${o}`).join(' + ')}?`, instr: 'Atenção: as ordens estão baralhadas! Arruma-as numa tabela CM DM UM C D U.', numero: n, largura: '180px',
      explica: `Arrumado: ${p.slice().sort((a, b) => b[0] - a[0]).map(([v, , d]) => fmt(v * d)).join(' + ')} = ${fmt(n)}.` };
  });
  def('num', 'ordens-trocas', r => {
    const a = ri(r, 2, 9), b = ri(r, 11, 19), t = pick(r, [[1000, 'unidades de milhar', 100, 'centenas'], [100, 'centenas', 10, 'dezenas'], [10000, 'dezenas de milhar', 1000, 'unidades de milhar']]);
    const n = a * t[0] + b * t[2];
    return { tipo: 'curta', pergunta: `Que número é ${a} ${t[1]} e ${b} ${t[3]}?`, numero: n, largura: '180px', explica: `${b} ${t[3]} = ${fmt(b * t[2])}. ${fmt(a * t[0])} + ${fmt(b * t[2])} = ${fmt(n)}. (10 ${t[3]} fazem 1 da ordem seguinte!)` };
  });
  def('num', 'contar-de', r => {
    const k = pick(r, [25, 50, 250, 500, 1000, 5000]), s = ri(r, 1, 30) * k, n = ri(r, 3, 6);
    return { tipo: 'curta', pergunta: `Conta de ${fmt(k)} em ${fmt(k)}, começando em ${fmt(s)}. Que número dizes ao fim de ${n} saltos?`, numero: s + n * k, largura: '180px', explica: `${fmt(s)} + ${n} × ${fmt(k)} = ${fmt(s + n * k)}.` };
  });
  def('num', 'numero-entre', r => {
    const a = ri(r, 10, 990) * 1000, b = a + pick(r, [1000, 2000, 10000]), c = ri(r, a + 1, b - 1);
    const er = [a - ri(r, 1, 500), b + ri(r, 1, 500), b + 1000];
    return Object.assign({ tipo: 'escolha', pergunta: `Que número está entre ${fmt(a)} e ${fmt(b)}?` }, opcoes(r, fmt(c), er.map(fmt)), { explica: `${fmt(a)} < ${fmt(c)} < ${fmt(b)}.` });
  });
  def('num', 'algarismos-iguais', r => {
    const d = ri(r, 1, 9), p1 = ri(r, 0, 2), p2 = ri(r, 3, 5), outros = misturar(r, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== d));
    const s = [0, 1, 2, 3, 4, 5].map(i => i === p1 || i === p2 ? d : outros[i]); if (s[0] === 0) s[0] = outros.find(x => x);
    const n = Number(s.join('')), v1 = d * Math.pow(10, 5 - p1), v2 = d * Math.pow(10, 5 - p2);
    return { tipo: 'curta', pergunta: `No número ${fmt(n)} há dois algarismos ${d}. Qual é a diferença entre os valores que eles representam?`, numero: v1 - v2, largura: '180px', caderno: true, instr: CADERNO,
      explica: `O primeiro ${d} vale ${fmt(v1)} e o segundo ${fmt(v2)}: ${fmt(v1)} − ${fmt(v2)} = ${fmt(v1 - v2)}. O mesmo algarismo vale mais quanto mais à esquerda está.` };
  });
  def('num', 'quantas-dezenas', r => {
    const n = grande(r), t = pick(r, [[10000, 'dezenas de milhar'], [1000, 'unidades de milhar (milhares)'], [100, 'centenas']]);
    return { tipo: 'curta', pergunta: `Quantas ${t[1]} completas tem o número ${fmt(n)}?`, numero: Math.floor(n / t[0]), largura: '160px', explica: `Tapa os ${String(t[0]).length - 1} últimos algarismos: ${fmt(Math.floor(n / t[0]))}.` };
  });

  // ===== Cálculo (métodos do manual)
  def('ops', 'sub-decompor-subtrativo', r => {
    const a = ri(r, 400, 999), b = ri(r, 1, Math.floor((a - 100) / 100)) * 100 + ri(r, 1, 9) * 10 + ri(r, 1, 9), [c, d, u] = [Math.floor(b / 100) * 100, Math.floor(b % 100 / 10) * 10, b % 10];
    return conta2(`Subtrai decompondo o subtrativo: ${a} − ${b} = ${a} − ${c} − ${d} − ${u} = ?`, a - b, `${a} − ${c} = ${a - c}; − ${d} = ${a - c - d}; − ${u} = ${a - b}.`);
  });
  def('ops', 'adi-decompor', r => {
    const a = ri(r, 1100, 4999), b = ri(r, 1100, 4999);
    return conta2(`Adiciona decompondo as parcelas: ${fmt(a)} + ${fmt(b)}`, a + b, `Milhares com milhares, centenas com centenas…: ${fmt(Math.floor(a / 1000) * 1000 + Math.floor(b / 1000) * 1000)} + ${a % 1000 + b % 1000} = ${fmt(a + b)}.`);
  });
  def('ops', 'div-decompor', r => {
    const b = ri(r, 2, 6), x = ri(r, 1, 3) * 100 / 1, x2 = b * ri(r, 2, 9), D = b * x + x2;
    return conta2(`Divide decompondo o dividendo: ${D} : ${b} = (${b * x} : ${b}) + (${x2} : ${b}) = ?`, D / b, `${b * x} : ${b} = ${x}; ${x2} : ${b} = ${x2 / b}; ${x} + ${x2 / b} = ${D / b}.`);
  });
  def('ops', 'mul-decompor', r => {
    const a = ri(r, 3, 9), b = ri(r, 1, 4) * 100 + ri(r, 1, 9) * 10 + ri(r, 1, 9);
    return conta2(`Multiplica decompondo: ${a} × ${b} = (${a} × ${Math.floor(b / 100) * 100}) + (${a} × ${Math.floor(b % 100 / 10) * 10}) + (${a} × ${b % 10})`, a * b, `${a * Math.floor(b / 100) * 100} + ${a * Math.floor(b % 100 / 10) * 10} + ${a * (b % 10)} = ${fmt(a * b)}.`);
  });
  def('ops', 'algarismo-falta', r => {
    const a = ri(r, 120, 699), b = ri(r, 120, 299), s = String(a), p = ri(r, 0, 2);
    const mostra = s.split('').map((c, i) => i === p ? '?' : c).join('');
    return { tipo: 'curta', pergunta: `Que algarismo falta? ${mostra} + ${b} = ${a + b}`, numero: Number(s[p]), largura: '80px', caderno: true, instr: CADERNO,
      explica: `${a + b} − ${b} = ${a}, por isso o algarismo é ${s[p]}.`, pistas: ['A adição desfaz-se com uma subtração.', `Faz ${a + b} − ${b}.`, 'Compara o resultado com o número que tem o «?».'] };
  });
  def('ops', 'parenteses', r => {
    const a = ri(r, 2, 9), b = ri(r, 2, 9), c = ri(r, 2, 9), t = pick(r, [0, 1, 2]);
    const [e, v] = [[`(${a} + ${b}) × ${c}`, (a + b) * c], [`${a} × (${b} + ${c})`, a * (b + c)], [`(${a * 10} − ${b}) × 2`, (a * 10 - b) * 2]][t];
    return { tipo: 'curta', pergunta: `Calcula: ${e}`, numero: v, largura: '100px', explica: `Primeiro o que está dentro dos parênteses. ${e} = ${v}.` };
  });
  def('ops', 'tabuada-inversa', r => {
    const v = pick(r, [12, 16, 18, 20, 24, 30, 36, 40, 48]); const ops = [];
    for (let a = 2; a <= 9; a++) if (v % a === 0 && v / a <= 10 && v / a >= 2 && a <= v / a) ops.push(`${a} × ${v / a}`);
    const er = []; while (er.length < 4 - Math.min(2, ops.length)) { const a = ri(r, 2, 9), b = ri(r, 2, 9); if (a * b !== v && !er.includes(`${a} × ${b}`)) er.push(`${a} × ${b}`); }
    const cert = ops.slice(0, 2), lista = misturar(r, [...cert, ...er]);
    return { tipo: 'varias', pergunta: `Quais destas multiplicações dão ${v}? (pode haver mais do que uma)`, opcoes: lista, certas: cert.map(c => lista.indexOf(c)).sort((a, b) => a - b), explica: `${cert.join(' e ')} dão ${v}.` };
  });

  // ===== Problemas
  def('pro', 'piscar', r => { const p = pick(r, [15, 20, 25]), h2 = ri(r, 1, 3); return prob(`Uma pessoa pisca os olhos cerca de ${p} vezes por minuto. Quantas vezes pisca em ${h2 === 1 ? 'uma hora' : h2 + ' horas'}?`, p * 60 * h2, `1 hora = 60 minutos: ${p} × 60${h2 > 1 ? ' × ' + h2 : ''} = ${fmt(p * 60 * h2)}.`, 'vezes'); });
  def('pro', 'fatias', r => { const b = ri(r, 2, 6), f = pick(r, [6, 8, 10, 12]), c = ri(r, 5, b * f - 2); return prob(`Para a festa da escola fizeram ${b} bolos, cada um cortado em ${f} fatias. Comeram-se ${c} fatias. Quantas sobraram?`, b * f - c, `${b} × ${f} = ${b * f} fatias; ${b * f} − ${c} = ${b * f - c}.`, 'fatias'); });
  def('pro', 'ida-volta', r => { const d = ri(r, 12, 95), dias = ri(r, 2, 5); return prob(`De Messejana a Beja são ${d} km. O carteiro faz a viagem de ida e volta ${dias} vezes por semana. Quantos km faz por semana?`, d * 2 * dias, `Ida e volta = ${d} × 2 = ${2 * d} km; × ${dias} = ${2 * d * dias} km.`, 'km'); });
  def('pro', 'excursao', r => { const al = ri(r, 18, 26), pa = pick(r, [3, 4, 5, 6]), aut = pa * al + ri(r, 1, 9) * 10; return prob(`A visita de estudo custa ${aut}${NB}€ de autocarro e ${pa}${NB}€ de entrada por aluno. Vão ${al} alunos. Quanto custa tudo?`, aut + pa * al, `${pa} × ${al} = ${pa * al}${NB}€; + ${aut}${NB}€ = ${aut + pa * al}${NB}€.`, '€'); });
  def('pro', 'comboio', r => { const c = ri(r, 4, 9), l = pick(r, [48, 56, 64, 72]), v = ri(r, 20, c * l - 20); return prob(`Um comboio tem ${c} carruagens com ${l} lugares cada. Já vão sentadas ${v} pessoas. Quantos lugares estão livres?`, c * l - v, `${c} × ${l} = ${c * l}; ${c * l} − ${v} = ${c * l - v}.`, 'lugares'); });
  def('pro', 'cabelos', r => { const f = pick(r, [50, 80, 100]), d = 7; return prob(`Cada dia caem cerca de ${f} fios de cabelo e nascem outros tantos. Quantos fios caem numa semana?`, f * d, `Uma semana tem 7 dias: ${f} × 7 = ${f * 7}.`, 'fios'); });
  def('pro', 'agua-dias', r => { const l = ri(r, 2, 5), p = ri(r, 3, 6), d = 7; return prob(`Uma família de ${p} pessoas bebe ${l} litros de água por pessoa e por dia. Quantos litros bebe numa semana?`, l * p * d, `${l} × ${p} = ${l * p} litros por dia; × 7 = ${l * p * 7} litros.`, 'litros'); });
  def('pro', 'grupos', r => { const g = ri(r, 3, 6), t = g * ri(r, 4, 8); return prob(`Na aula de Educação Física, ${t} alunos fazem equipas de ${g}. Quantas equipas se formam?`, t / g, `${t} : ${g} = ${t / g} equipas.`, 'equipas'); });

  // ===== Frações
  def('fra', 'fracao-vida', r => { const t = pick(r, [[3, 'a dormir'], [4, 'na escola e a estudar'], [6, 'a comer']]), a = t[0] * ri(r, 4, 20); return { tipo: 'curta', pergunta: `Uma pessoa passa cerca de 1/${t[0]} da vida ${t[1]}. Se viver ${a} anos, quantos anos passa ${t[1]}?`, numero: a / t[0], largura: '100px', depois: NB + 'anos', caderno: true, instr: CADERNO, explica: `1/${t[0]} de ${a} = ${a} : ${t[0]} = ${a / t[0]} anos.` }; });
  def('fra', 'fracao-maior', r => { const d = ri(r, 5, 12), ns = misturar(r, [1, 2, 3, 4].map(k => k * Math.floor((d - 1) / 4) || k)).filter((x, i, l) => l.indexOf(x) === i && x < d); if (ns.length < 3) return null; const mx = Math.max(...ns);
    return Object.assign({ tipo: 'escolha', pergunta: 'Qual destas frações é a maior?' }, opcoes(r, `${mx}/${d}`, ns.filter(x => x !== mx).map(x => `${x}/${d}`)), { explica: `Com o mesmo denominador, é maior a que tem mais partes (numerador maior): ${mx}/${d}.` }); });
  def('fra', 'fracao-reta', r => { const d = pick(r, [2, 4, 5, 10]), n = ri(r, 1, d - 1);
    let g = `<line x1="20" y1="40" x2="520" y2="40" stroke="#222" stroke-width="3"/>`; for (let i = 0; i <= d; i++) { const x = 20 + i * 500 / d; g += `<line x1="${x}" y1="30" x2="${x}" y2="50" stroke="#222" stroke-width="2"/>`; }
    g += `<text x="20" y="74" text-anchor="middle" font-size="16" font-weight="700">0</text><text x="520" y="74" text-anchor="middle" font-size="16" font-weight="700">1</text><path d="M${20 + n * 500 / d},24 l-8,-14 h16 z" fill="#e05a47"/>`;
    return Object.assign({ tipo: 'escolha', pergunta: 'Que fração está a seta a indicar?', figura: { tipo: 'svg', svg: `<svg xmlns="${NS}" viewBox="0 0 540 84" width="520" font-family="Asap, sans-serif">${g}</svg>` } },
      opcoes(r, `${n}/${d}`, [`${d}/${n}`, `${n}/${d + 1}`, `${Math.min(d - 1, n + 1)}/${d}`, `1/${n + 1}`]), { explica: `De 0 a 1 há ${d} partes iguais; a seta está na ${n}.ª: ${n}/${d}.` }); });

  // ===== Sequências
  def('seq', 'seq-dupla', r => { const a = ri(r, 2, 6), b = ri(r, 1, 3), t = [ri(r, 1, 9)]; for (let i = 1; i < 6; i++) t.push(t[i - 1] + (i % 2 ? a : -b)); return { tipo: 'curta', pergunta: `A regra muda: +${a}, −${b}, +${a}, −${b}… Continua: ${t.slice(0, 5).join(', ')}, ?`, numero: t[5], largura: '100px', explica: `${t[4]} + ${a} = ${t[5]}.` }; });
  def('seq', 'triangulos-palitos', r => { const n = pick(r, [5, 6, 8, 10]); return { tipo: 'curta', pergunta: `Com palitos fazem-se triângulos seguidos (lado a lado, a partilhar um palito): 1 triângulo = 3 palitos, 2 = 5, 3 = 7… Quantos palitos são precisos para ${n} triângulos?`, numero: 2 * n + 1, largura: '100px', explica: `Cada triângulo novo junta 2 palitos: 3 + ${n - 1} × 2 = ${2 * n + 1}.` }; });

  // ===== Geometria
  def('geo', 'eixos-simetria', r => { const t = pick(r, [['um quadrado', 4], ['um retângulo (não quadrado)', 2], ['um triângulo equilátero', 3], ['um hexágono regular', 6], ['um círculo', 'infinitos']]);
    if (t[1] === 'infinitos') return Object.assign({ tipo: 'escolha', pergunta: `Quantos eixos de simetria tem ${t[0]}?` }, opcoes(r, 'Infinitos', ['1', '2', '4']), { explica: 'Qualquer reta que passe pelo centro divide o círculo em duas partes iguais.' });
    return { tipo: 'curta', pergunta: `Quantos eixos de simetria tem ${t[0]}?`, numero: t[1], largura: '80px', explica: `${Maiusc(t[0])} tem ${t[1]} eixos de simetria.` }; });
  def('geo', 'angulo-relogio', r => { const t = pick(r, [[3, 'Ângulo reto'], [9, 'Ângulo reto'], [6, 'Ângulo raso'], [1, 'Ângulo agudo'], [2, 'Ângulo agudo'], [4, 'Ângulo obtuso'], [5, 'Ângulo obtuso']]);
    return Object.assign({ tipo: 'escolha', pergunta: `Às ${t[0]} horas em ponto, que ângulo fazem os ponteiros do relógio?`, figura: { tipo: 'relogio', h: t[0], m: 0 } }, opcoes(r, t[1], ['Ângulo reto', 'Ângulo agudo', 'Ângulo obtuso', 'Ângulo raso'].filter(x => x !== t[1])), { explica: 'Às 3 e às 9 é reto; às 6 é raso; menos de 3 «horas» de abertura é agudo; entre 3 e 6 é obtuso.' }); });
  def('geo', 'solido-planificacao', r => { const t = pick(r, [['6 quadrados iguais', 'Cubo'], ['2 triângulos e 3 retângulos', 'Prisma triangular'], ['1 quadrado e 4 triângulos', 'Pirâmide quadrangular'], ['2 pentágonos e 5 retângulos', 'Prisma pentagonal'], ['1 hexágono e 6 triângulos', 'Pirâmide hexagonal'], ['2 círculos e 1 retângulo', 'Cilindro']]);
    return Object.assign({ tipo: 'escolha', pergunta: `Uma planificação tem ${t[0]}. De que sólido é?` }, opcoes(r, t[1], ['Cubo', 'Prisma triangular', 'Pirâmide quadrangular', 'Prisma pentagonal', 'Pirâmide hexagonal', 'Cilindro', 'Cone'].filter(x => x !== t[1]).sort(() => r() - 0.5)), { explica: `${t[0]} → ${t[1].toLowerCase()}.` }); });
  def('geo', 'quadrados-cabem', r => { const c = ri(r, 3, 9), l = ri(r, 2, 6); return { tipo: 'curta', pergunta: `Quantos quadrados de 1 cm de lado cabem num retângulo de ${c} cm por ${l} cm?`, numero: c * l, largura: '100px', caderno: true, instr: CADERNO, explica: `${l} filas de ${c} quadrados: ${c} × ${l} = ${c * l} (é a área em cm²).` }; });

  // ===== Medidas
  def('med', 'horas-24', r => { const h = ri(r, 13, 23), m = pick(r, [0, 15, 30, 45]); const tarde = h < 20 ? 'da tarde' : 'da noite';
    return Object.assign({ tipo: 'escolha', pergunta: `${hm(h, m)} é o mesmo que…` }, opcoes(r, `${h - 12}h${String(m).padStart(2, '0')} ${tarde}`, [`${h - 10}h${String(m).padStart(2, '0')} ${tarde}`, `${h - 12}h${String(m).padStart(2, '0')} da manhã`, `${h - 2}h${String(m).padStart(2, '0')} ${tarde}`]), { explica: `Depois do meio-dia tira-se 12: ${h} − 12 = ${h - 12}.` }); });
  def('med', 'dias-mes', r => { const M = [['janeiro', 31], ['fevereiro (num ano comum)', 28], ['março', 31], ['abril', 30], ['maio', 31], ['junho', 30], ['julho', 31], ['agosto', 31], ['setembro', 30], ['outubro', 31], ['novembro', 30], ['dezembro', 31]], m = pick(r, M);
    return { tipo: 'curta', pergunta: `Quantos dias tem o mês de ${m[0]}?`, numero: m[1], largura: '80px', explica: '«Trinta dias tem novembro, abril, junho e setembro; de vinte e oito só há um; os outros têm trinta e um.»' }; });
  def('med', 'peso-pena', r => Object.assign({ tipo: 'escolha', pergunta: 'O que pesa mais: 1 kg de palha ou 1000 g de ferro?' }, opcoes(r, 'Pesam o mesmo', ['1 kg de palha', '1000 g de ferro']), { explica: '1 kg = 1000 g. A quantidade é a mesma: pesam o mesmo (a palha ocupa é muito mais espaço!).' }));
  def('med', 'comparar-medidas', r => { const t = pick(r, [[ri(r, 2, 9) * 100, 'cm', 'm', 100], [ri(r, 2, 9) * 1000, 'g', 'kg', 1000], [ri(r, 2, 9) * 1000, 'm', 'km', 1000], [ri(r, 2, 9) * 100, 'cl', 'l', 100]]);
    const a = t[0], b = a / t[3] + pick(r, [-1, 0, 1]), s = a / t[3] > b ? '>' : a / t[3] < b ? '<' : '=';
    return { tipo: 'escolha', pergunta: `Que sinal fica bem? ${fmt(a)} ${t[1]} ___ ${b} ${t[2]}`, opcoes: ['<', '>', '='], certa: ['<', '>', '='].indexOf(s), explica: `${fmt(a)} ${t[1]} = ${a / t[3]} ${t[2]}, por isso ${fmt(a)} ${t[1]} ${s} ${b} ${t[2]}.` }; });

  // ===== Dados
  def('dad', 'tracinhos', r => { const n = ri(r, 7, 23), marca = '卌'.repeat(Math.floor(n / 5)) + '|'.repeat(n % 5);
    return { tipo: 'curta', pergunta: `Na contagem com tracinhos, cada 卌 vale 5. Quanto vale: ${marca}`, numero: n, largura: '80px', explica: `${Math.floor(n / 5)} × 5 + ${n % 5} = ${n}.` }; });
  def('dad', 'roleta', r => { const max = pick(r, [6, 8, 10]), t = pick(r, [[`sair um número maior do que ${max}`, 'Impossível'], [`sair um número menor do que ${max + 1}`, 'Certo'], ['sair um número par', 'Possível, mas não certo'], [`sair o ${ri(r, 1, max)}`, 'Possível, mas não certo']]);
    return Object.assign({ tipo: 'escolha', pergunta: `Uma roleta tem os números de 1 a ${max}. Rodar e ${t[0]} é…` }, opcoes(r, t[1], ['Impossível', 'Possível, mas não certo', 'Certo'].filter(x => x !== t[1])), { explica: `${t[1]}: a roleta só tem os números de 1 a ${max}.` }); });
  def('dad', 'tabela-freq', r => { const cats = ['Gato', 'Cão', 'Peixe', 'Pássaro'], q = cats.map(() => ri(r, 1, 9)); const mx = Math.max(...q); if (q.filter(x => x === mx).length > 1) return null; const t = pick(r, [0, 1]);
    const tab = { cab: ['Animal preferido', 'Frequência absoluta'], linhas: cats.map((c, i) => [c, q[i]]) };
    if (t) return { tipo: 'curta', pergunta: 'Observa a tabela de frequências. Quantos alunos responderam?', tabela: tab, numero: q.reduce((a, b) => a + b, 0), largura: '80px', explica: `${q.join(' + ')} = ${q.reduce((a, b) => a + b, 0)}.` };
    return Object.assign({ tipo: 'escolha', pergunta: 'Observa a tabela de frequências. Qual é a moda?', tabela: tab }, opcoes(r, cats[q.indexOf(mx)], cats.filter((_, i) => q[i] !== mx)), { explica: `A moda é a categoria com maior frequência: ${cats[q.indexOf(mx)]} (${mx}).` }); });

  // ===== Pensamento computacional
  def('pc', 'binario-maior', r => { const ns = misturar(r, Array.from({ length: 31 }, (_, k) => k + 1)).slice(0, 4), mx = Math.max(...ns), b = n => n.toString(2).padStart(5, '0');
    return Object.assign({ tipo: 'escolha', pergunta: 'Qual destes números em binário (cartões 16 8 4 2 1) é o maior?' }, opcoes(r, b(mx), ns.filter(x => x !== mx).map(b)), { explica: `${b(mx)} = ${mx}. Os outros: ${ns.filter(x => x !== mx).map(x => b(x) + ' = ' + x).join(', ')}.` }); });
  def('pc', 'algoritmo-inverso', r => { const s = ri(r, 2, 20), k = ri(r, 2, 5), a = ri(r, 3, 15), v = s * k + a;
    return { tipo: 'curta', pergunta: `Uma máquina multiplica por ${k} e depois soma ${a}. Saiu o número ${v}. Que número entrou?`, numero: s, largura: '100px', explica: `Andar para trás: ${v} − ${a} = ${v - a}; ${v - a} : ${k} = ${s}.`, pistas: ['Desfaz os passos do fim para o princípio.', `O contrário de «somar ${a}» é «tirar ${a}».`, `O contrário de «multiplicar por ${k}» é «dividir por ${k}».`] }; });
  def('pc', 'depurar', r => { const n = ri(r, 3, 6), lado = ri(r, 2, 9);
    return Object.assign({ tipo: 'escolha', pergunta: `O Nico quer desenhar um quadrado de lado ${lado}. O programa é «repete ${n} vezes: anda ${lado}, vira 90°». O que está errado?` },
      n === 4 ? opcoes(r, 'Nada: o programa está certo', ['Devia virar 60°', 'Devia andar 4', 'Devia repetir 3 vezes']) : opcoes(r, 'Devia repetir 4 vezes', ['Devia virar 45°', `Devia andar ${lado * 2}`, 'Nada: o programa está certo']),
      { explica: 'Um quadrado tem 4 lados iguais e 4 ângulos retos: repete 4 vezes, anda o lado, vira 90°.' }); });

  // competência treinada por cada tipo de exercício — é o que a análise final usa para dizer onde a criança falha mais
  const COMPETENCIAS = {
    'extenso-algarismos': 'Escrever números com algarismos', 'algarismos-extenso': 'Ler números por extenso', 'valor-posicional': 'Valor de cada algarismo (posição)',
    'ordem-algarismo': 'Ordens e classes (CM DM UM C D U)', decompor: 'Compor e decompor números', abaco: 'Ler números no ábaco', 'antecessor-sucessor': 'Antecessor e sucessor',
    'mais-mil': 'Somar e tirar 10, 100, 1000… mentalmente', ordenar: 'Comparar e ordenar números', arredondar: 'Arredondamentos', 'outras-leituras': 'Outras leituras (centenas, milhares)',
    'numero-misterioso': 'Número misterioso (pistas)', ordinais: 'Numerais ordinais',
    adicao: 'Algoritmo da adição', subtracao: 'Algoritmo da subtração', 'subtracao-zeros': 'Subtração com zeros', multiplicacao: 'Multiplicação por um algarismo',
    'multiplicacao-2': 'Multiplicação por dois algarismos', tabuada: 'Tabuadas', 'vezes-10': 'Multiplicar por 10, 100 e 1000', divisao: 'Divisão', 'termo-falta': 'Termo em falta numa operação',
    redondos: 'Cálculo com números redondos', igualdade: 'Igualdades e propriedades da multiplicação',
    refeicoes: 'Problemas de multiplicação', prateleiras: 'Problemas de multiplicação', paginas: 'Problemas de multiplicação', coracao: 'Problemas de multiplicação',
    'faltam-paginas': 'Problemas de subtração', turmas: 'Problemas com vários passos', ossos: 'Problemas com vários passos', autocarros: 'Problemas de divisão (com resto)',
    repartir: 'Problemas de divisão', embalagens: 'Problemas de divisão', troco: 'Problemas de dinheiro e troco', poupanca: 'Problemas de dinheiro e troco',
    'fracao-pintada': 'Reconhecer frações', 'somar-fracoes': 'Somar e subtrair frações', 'fracao-quantidade': 'Fração de uma quantidade', 'medida-fracao': 'Frações de medidas (½ kg, ¼ h…)',
    'comparar-fracoes': 'Comparar frações', chocolate: 'Problemas com frações',
    'seq-numerica': 'Sequências numéricas', 'seq-regra': 'Descobrir a regra de uma sequência', 'seq-figuras': 'Sequências de figuras', 'seq-quadrados': 'Sequências de figuras',
    'tabela-termos': 'Termo de ordem n (regra)', 'padrao-simbolos': 'Padrões que se repetem',
    'solidos-contar': 'Faces, vértices e arestas', 'solido-nome': 'Prismas e pirâmides', 'solidos-vf': 'Propriedades dos sólidos', 'planificacao-cubo': 'Planificações do cubo',
    angulos: 'Classificar ângulos', 'area-perimetro': 'Área e perímetro', 'perimetro-retangulo': 'Área e perímetro', simetria: 'Simetria', coordenadas: 'Coordenadas na grelha',
    comprimento: 'Medidas de comprimento', massa: 'Medidas de massa', capacidade: 'Medidas de capacidade', dinheiro: 'Contar dinheiro', relogio: 'Ler as horas', duracao: 'Duração (horas e minutos)',
    'medida-adequada': 'Escolher a unidade de medida',
    'moda-lista': 'Moda e tabela de frequências', 'contar-lista': 'Tabela de frequências', barras: 'Gráficos de barras', 'caule-folhas': 'Diagrama de caule-e-folhas', probabilidade: 'Probabilidades',
    'binario-ler': 'Sistema binário', 'binario-escrever': 'Sistema binário', 'enigma-simbolos': 'Enigmas e raciocínio', algoritmo: 'Seguir um algoritmo',
  };
  Object.assign(COMPETENCIAS, {   // 2.ª fornada
    'comparar-sinais': 'Comparar números (<, >, =)', 'formar-numero': 'Formar números com algarismos dados', 'dobro-metade': 'Dobro, triplo, metade…', 'par-impar': 'Números pares e ímpares',
    'reta-ler': 'Ler números na reta numérica', romanos: 'Numeração romana', 'divisao-resto': 'Divisão com resto', multiplos: 'Múltiplos', estimativa: 'Estimativas',
    'prova-subtracao': 'Prova das operações', comutativa: 'Propriedades da multiplicação', 'decimal-dinheiro': 'Números decimais e dinheiro',
    ovos: 'Problemas com vários passos', 'quantos-compro': 'Problemas de divisão (com resto)', cadeiras: 'Problemas com vários passos', garrafas: 'Problemas de medida',
    idades: 'Problemas de raciocínio', vedacao: 'Problemas de perímetro', 'viagem-horas': 'Problemas com horas',
    'fracao-equivalente': 'Frações equivalentes', 'fracao-decimal': 'Frações decimais (décimas e centésimas)', 'unidade-fracao': 'Frações e a unidade',
    'seq-falta': 'Sequências numéricas', 'seq-dobro': 'Sequências (dobro e triplo)', 'seq-decrescente': 'Sequências decrescentes',
    poligonos: 'Polígonos', retas: 'Retas paralelas e perpendiculares', circulo: 'Círculo: raio e diâmetro', equivalentes: 'Figuras equivalentes (mesma área)', 'poligonos-vf': 'Propriedades dos polígonos',
    'tempo-converter': 'Medidas de tempo', calendario: 'Calendário e dias da semana', seculo: 'Séculos', 'menos-moedas': 'Contar dinheiro',
    pictograma: 'Pictogramas', venn: 'Diagramas de Venn', 'tabela-dupla': 'Tabelas de dupla entrada',
    'caminho-setas': 'Programar caminhos (setas)', 'ordenar-passos': 'Ordenar os passos de um algoritmo', condicao: 'Condições «se… senão»', repete: 'Repetições (ciclos)',
  });
  Object.assign(COMPETENCIAS, {   // 3.ª fornada
    'ordens-baralhadas': 'Compor e decompor números', 'ordens-trocas': 'Trocas entre ordens (10 C = 1 UM…)', 'contar-de': 'Contar de 25 em 25, de 500 em 500…', 'numero-entre': 'Comparar e ordenar números',
    'algarismos-iguais': 'Valor de cada algarismo (posição)', 'quantas-dezenas': 'Outras leituras (centenas, milhares)',
    'sub-decompor-subtrativo': 'Subtrair por decomposição', 'adi-decompor': 'Adicionar por decomposição', 'div-decompor': 'Dividir por decomposição', 'mul-decompor': 'Multiplicação por um algarismo',
    'algarismo-falta': 'Termo em falta numa operação', parenteses: 'Expressões com parênteses', 'tabuada-inversa': 'Tabuadas',
    piscar: 'Problemas com horas', fatias: 'Problemas com vários passos', 'ida-volta': 'Problemas com vários passos', excursao: 'Problemas de dinheiro e troco', comboio: 'Problemas com vários passos',
    cabelos: 'Problemas de multiplicação', 'agua-dias': 'Problemas com vários passos', grupos: 'Problemas de divisão',
    'fracao-vida': 'Fração de uma quantidade', 'fracao-maior': 'Comparar frações', 'fracao-reta': 'Frações na reta numérica',
    'seq-dupla': 'Sequências com duas regras', 'triangulos-palitos': 'Sequências de figuras',
    'eixos-simetria': 'Simetria', 'angulo-relogio': 'Classificar ângulos', 'solido-planificacao': 'Planificações de sólidos', 'quadrados-cabem': 'Área e perímetro',
    'horas-24': 'Ler as horas', 'dias-mes': 'Calendário e dias da semana', 'peso-pena': 'Medidas de massa', 'comparar-medidas': 'Comparar medidas (unidades diferentes)',
    tracinhos: 'Tabela de frequências', roleta: 'Probabilidades', 'tabela-freq': 'Moda e tabela de frequências',
    'binario-maior': 'Sistema binário', 'algoritmo-inverso': 'Seguir um algoritmo', depurar: 'Depurar (encontrar o erro num programa)',
  });
  const competencia = k => COMPETENCIAS[k] || k;
  // tipos de exercício de uma competência (para o treino dirigido aos pontos fracos)
  const tiposDe = nome => Object.keys(COMPETENCIAS).filter(k => COMPETENCIAS[k] === nome);
  function gerarTipo(k, r) {
    r = r || Math.random;
    for (const [tema, l] of Object.entries(G)) { const g = l.find(x => x.k === k); if (g) for (let t = 0; t < 40; t++) { const it = g.f(r); if (it) { it.id = nid(k); it.tema = tema; it.k = k; it.area = 'mat'; if (!it.pistas) it.pistas = ['Lê outra vez a pergunta devagar. O que se pede?', 'Faz um esquema ou um desenho no caderno.', 'Confirma a tua resposta antes de verificar.']; return it; } } }
    return null;
  }

  // ------------------------------------------------------------ montar
  const TEMAS = {
    num: { nome: 'Números até 999 999', emoji: '🔢', cor: '#3a6fd8' },
    ops: { nome: 'Cálculo e operações', emoji: '➕', cor: '#e05a47' },
    pro: { nome: 'Problemas', emoji: '🧩', cor: '#8a5bd6' },
    fra: { nome: 'Frações', emoji: '🍕', cor: '#f29d32' },
    seq: { nome: 'Sequências', emoji: '🔁', cor: '#2fa36b' },
    geo: { nome: 'Geometria', emoji: '🔷', cor: '#1d9bb3' },
    med: { nome: 'Medidas, dinheiro e horas', emoji: '📏', cor: '#b5651d' },
    dad: { nome: 'Dados e probabilidades', emoji: '📊', cor: '#d6457f' },
    pc: { nome: 'Pensamento computacional', emoji: '💡', cor: '#264653' },
  };
  function gerar(tema, r, evitar) {
    r = r || Math.random;
    const lista = G[tema].filter(g => !(evitar && evitar.has(g.k)));
    for (let t = 0; t < 40; t++) {
      const g = pick(r, lista.length ? lista : G[tema]);
      const it = g.f(r);
      if (!it) continue;
      it.id = nid(g.k); it.tema = tema; it.k = g.k; it.area = 'mat';
      if (!it.pistas) it.pistas = ['Lê outra vez a pergunta devagar. O que se pede?', 'Faz um esquema ou um desenho no caderno.', 'Confirma a tua resposta antes de verificar.'];
      return it;
    }
    throw new Error('sem item para ' + tema);
  }
  // teste: 22 questões de todas as áreas, sem repetir o tipo de exercício
  const PLANO = { num: 4, ops: 4, pro: 2, fra: 2, seq: 2, geo: 3, med: 2, dad: 2, pc: 1 };
  // recentes = tipos que saíram nos últimos testes: evitam-se enquanto o tema tiver outros por usar
  function teste(r, recentes) {
    r = r || Math.random; recentes = recentes || new Set();
    const out = [];
    Object.entries(PLANO).forEach(([t, n]) => {
      const usados = new Set();
      for (let i = 0; i < n; i++) {
        const ev = new Set([...usados, ...recentes]);
        const it = gerar(t, r, G[t].some(g => !ev.has(g.k)) ? ev : usados);
        usados.add(it.k); out.push(it);
      }
    });
    return out;
  }
  // classificação do 1.º ciclo e as «pedras» do manual
  function mencao(p) {
    if (p >= 90) return { nome: 'Muito Bom', gemas: 3, frase: 'Cumpriste com distinção!', estado: 'celebrar' };
    if (p >= 70) return { nome: 'Bom', gemas: 2, frase: 'Cumpriste! Falta pouco para o Muito Bom.', estado: 'celebrar' };
    if (p >= 50) return { nome: 'Suficiente', gemas: 1, frase: 'Cumpriste parcialmente. Vale a pena treinar os temas a vermelho.', estado: 'incentivar' };
    return { nome: 'Insuficiente', gemas: 0, frase: 'Ainda não. Treina os temas a vermelho e volta a tentar — o teste muda sempre!', estado: 'calma' };
  }

  F.REV = { TEMAS, PLANO, G, gerar, gerarTipo, teste, mencao, COMPETENCIAS, competencia, tiposDe, util: { semente, ri, pick, misturar, fmt, euros, extenso, svgAbaco, svgCartoes, svgCartao, eCubo, hexomino, perimetro } };
})();
