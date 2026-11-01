/* Nico · Percurso 4.º ano — o percurso: mapa das sessões, sessão (4 estações), prova-ensaio e progresso.
 *
 * Cada sessão tem 4 estações (rato e teclado · programar · Matemática · Português) e cada estação uma lista de
 * atividades. Itens de pergunta: 2 tentativas (à 2.ª falhada mostra-se a resposta certa e a explicação).
 * Progresso no browser (por aluno quando há turma: F.chaveMissao) e sincronizado com a API das turmas.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const X = F.MISSOES['percurso-4'];
  const $ = id => document.getElementById(id);
  const h = F.PC.itens.h;
  const masc = F.PC.masc;
  const AREAS = {
    maos: { nome: 'Rato e teclado', cor: 'var(--maos)', icone: '🖱️' },
    prog: { nome: 'Programar', cor: 'var(--prog)', icone: '🧩' },
    mat: { nome: 'Matemática', cor: 'var(--mat)', icone: '🔢' },
    port: { nome: 'Português', cor: 'var(--port)', icone: '📖' },
  };
  F.PC.AREAS = AREAS;

  // ------------------------------------------------------------ progresso
  const CHAVE = F.chaveMissao(X);
  let P = ler();
  function ler() { try { return Object.assign({ feitos: 0, at: {}, provas: [], bolotas: 0 }, JSON.parse(localStorage.getItem(CHAVE)) || {}); } catch (e) { return { feitos: 0, at: {}, provas: [], bolotas: 0 }; } }
  function gravar() {
    P.feitos = Object.keys(P.at).length;
    try { localStorage.setItem(CHAVE, JSON.stringify(P)); } catch (e) { /* sem armazenamento: segue sem gravar */ }
    if (F.Turma) F.Turma.mudou(CHAVE);
  }
  const feitoEm = id => P.at[id];

  // ------------------------------------------------------------ bolotas (moedas do percurso), sequências e insígnias
  const BOLOTA = '<svg viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="19" rx="10" ry="11" fill="#e9b44c" stroke="#111" stroke-width="2"/><path d="M5 13c2-6 20-6 22 0z" fill="#8a5a1f" stroke="#111" stroke-width="2"/><path d="M16 7V3" stroke="#111" stroke-width="2.5" stroke-linecap="round"/></svg>';
  function pintarBolotas(salto) {
    let b = $('bolotas');
    if (!b) { b = h('span', { class: 'pc-bolotas', id: 'bolotas', title: 'Bolotas ganhas no percurso' }); document.querySelector('.ligacao').prepend(b); }
    b.innerHTML = BOLOTA + '<span>' + (P.bolotas || 0) + '</span>';
    if (salto) { b.classList.remove('salto'); void b.offsetWidth; b.classList.add('salto'); }
  }
  function ganhar(n, onde) {
    if (n <= 0) return;
    P.bolotas = (P.bolotas || 0) + n;
    pintarBolotas(true);
    const r = (onde || $('bolotas')).getBoundingClientRect();
    const e = h('span', { class: 'pc-ganho' }, '+' + n + ' 🌰'); e.style.left = (r.left + r.width / 2 - 20) + 'px'; e.style.top = (r.top - 10) + 'px';
    document.body.append(e); setTimeout(() => e.remove(), 1200);
  }
  // bolotas: recompensa fixa pela primeira conclusão (também com apoio). Repetir serve para aprender, não para juntar moedas.
  // As bolotas só compram decoração para a oficina do Nico — nunca pistas, temas ou vantagens (revisão do Ambrósio, 1 Nov).
  function valor(at, res) { return res ? (at.missao || ['ponte', 'detetive', 'correio'].includes(at.tipo) ? 5 : 3) : 0; }
  const sessaoFeita = s => atividadesDe(s).every(a => feitoEm(a.id));

  // ------------------------------------------------------------ mapa
  function mapa() {
    vista('vMapa');
    $('estacoes').innerHTML = '';
    $('mapaMasc').src = masc.img('boas_vindas');
    document.title = 'Nico · Percurso 4.º ano';
    const L = $('listaSessoes'); L.innerHTML = '';
    pintarBolotas();
    trilho();
    X.sessoes.forEach((s, k) => {
      const ats = atividadesDe(s), feitas = ats.filter(a => feitoEm(a.id)).length;
      const b = h('button', { type: 'button', class: 'pc-sessao' + (feitas === ats.length ? ' feita' : '') },
        h('span', { class: 'ps-num' }, rotulo(k)),
        h('strong', null, s.titulo),
        h('span', { class: 'ps-tema' }, s.resumo),
        h('span', { class: 'ps-areas' }, s.estacoes.map(e => {
          const t = e.atividades.length, f = e.atividades.filter(a => feitoEm(a.id)).length;
          const i = h('i'); i.style.width = (t ? 100 * f / t : 0) + '%'; i.style.background = AREAS[e.area].cor;
          return h('span', { title: AREAS[e.area].nome + ': ' + f + ' de ' + t }, i);
        })),
        h('span', { class: 'ps-estado' }, feitas === 0 ? 'Começar' : feitas === ats.length ? 'Feita ✓ · voltar' : `Continuar · ${feitas} de ${ats.length}`));
      b.addEventListener('click', () => abrirSessao(k));
      L.append(b);
    });
    if (X.prova) {
      const ult = P.provas[P.provas.length - 1];
      const b = h('button', { type: 'button', class: 'pc-sessao prova' },
        h('span', { class: 'ps-num' }, 'No fim'), h('strong', null, X.prova.titulo), h('span', { class: 'ps-tema' }, X.prova.resumo),
        h('span', { class: 'ps-estado' }, ult ? `Última vez: ${ult.certas} de ${ult.total} certas · fazer outra vez` : 'Fazer a prova-ensaio'));
      b.addEventListener('click', () => abrirProva());
      L.append(b);
    }
    const bOf = h('button', { type: 'button', class: 'pc-sessao treino' }, h('span', { class: 'ps-num' }, 'Bolotas'), h('strong', null, '🛠 A oficina do Nico'),
      h('span', { class: 'ps-tema' }, 'Usa as bolotas para decorar a oficina onde o Nico prepara a Mostra. Só decoração: não compra pistas nem respostas.'),
      h('span', { class: 'ps-estado' }, `Tens ${P.bolotas || 0} bolotas`));
    bOf.addEventListener('click', oficina);
    L.append(bOf);
    masc.dizer('boas_vindas', X.boasVindas);
  }
  const atividadesDe = s => s.estacoes.flatMap(e => e.atividades);
  // «Missão 1» (fatia vertical da Mostra de Invenções) ou «Sessão N» (as sessões numeradas sem contar as missões)
  const rotulo = k => X.sessoes[k].rotulo || 'Sessão ' + (X.sessoes.slice(0, k + 1).filter(s => !s.rotulo).length);
  const curto = k => X.sessoes[k].rotulo ? X.sessoes[k].rotulo.replace('Missão ', 'M') : String(X.sessoes.slice(0, k + 1).filter(s => !s.rotulo).length);

  // mapa-trilho: o caminho do Nico pelas sessões (provisório, até chegar a ilustração do Ambrósio)
  const NOS = [[80, 250], [225, 150], [370, 235], [515, 125], [660, 230], [805, 130], [950, 225], [1095, 135]];
  const MARCOS = ['🌉', '🧭', '🌳', '💧', '🔧', '🥕', '🏰', '🏁'];
  function trilho() {
    const L = $('listaSessoes');
    const etapas = [...X.sessoes.map((s, k) => ({ s, k })), ...(X.prova ? [{ prova: true }] : [])];
    const atualK = X.sessoes.findIndex(s => !sessaoFeita(s));
    let d = `M${NOS[0][0]} ${NOS[0][1]}`;
    for (let i = 1; i < etapas.length; i++) { const [x0, y0] = NOS[i - 1], [x1, y1] = NOS[i]; d += ` C${x0 + 80} ${y0} ${x1 - 80} ${y1} ${x1} ${y1}`; }
    let g = '<defs><linearGradient id="trCeu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ad8ff"/><stop offset="1" stop-color="#fff4d6"/></linearGradient></defs>' +
      '<rect width="1180" height="340" rx="14" fill="url(#trCeu)"/>' +
      '<path d="M0 230 Q150 180 300 215 T600 200 T900 210 T1180 190 V340 H0Z" fill="#b9c98a"/><path d="M0 280 Q200 250 420 275 T820 265 T1180 270 V340 H0Z" fill="#8dbb5a"/>' +
      '<circle cx="1110" cy="50" r="26" fill="#ffd24d"/>';
    [[180, 228], [520, 210], [690, 268], [1010, 252], [350, 290]].forEach(([x, y]) => { g += `<g transform="translate(${x},${y})"><rect x="-4" y="0" width="8" height="22" fill="#6b4a22"/><circle cx="0" cy="-6" r="16" fill="#4f7d3a"/><circle cx="-12" cy="2" r="10" fill="#5f8f3e"/><circle cx="12" cy="2" r="10" fill="#5f8f3e"/></g>`; });
    g += `<path d="${d}" fill="none" stroke="#f4efe3" stroke-width="22" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#c9a36b" stroke-width="4" stroke-dasharray="2 12" stroke-linecap="round"/>`;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 1180 340'); svg.setAttribute('class', 'pc-trilho'); svg.setAttribute('role', 'list');
    svg.innerHTML = g;
    etapas.forEach((e, i) => {
      const [x, y] = NOS[i];
      const feita = e.prova ? P.provas.length > 0 : sessaoFeita(e.s);
      const aqui = e.prova ? atualK < 0 : e.k === atualK;
      const no = document.createElementNS(svgNS, 'g');
      no.setAttribute('class', 'tr-no'); no.setAttribute('tabindex', '0'); no.setAttribute('role', 'listitem');
      no.setAttribute('aria-label', e.prova ? X.prova.titulo : `${rotulo(e.k)}: ${e.s.titulo}` + (feita ? ' (feita)' : ''));
      const cor = feita ? '#0e9f6e' : aqui ? '#ffc850' : '#ffffff';
      no.innerHTML = `<circle class="tr-circ" cx="${x}" cy="${y}" r="34" fill="${cor}" stroke="#111" stroke-width="4"/>` +
        `<text x="${x}" y="${y + 9}" text-anchor="middle" font-size="26" font-weight="700" fill="${feita ? '#fff' : '#111'}">${e.prova ? '★' : curto(e.k)}</text>` +
        `<text x="${x + 26}" y="${y - 22}" font-size="22">${MARCOS[i]}</text>` +
        `<text x="${x}" y="${y + 60}" text-anchor="middle" font-size="15" font-weight="700" fill="#111">${(e.prova ? 'Prova-ensaio' : e.s.titulo).replace(/&/g, '&amp;').slice(0, 30)}</text>` +
        (feita && !e.prova && e.s.insignia ? `<text x="${x}" y="${y + 78}" text-anchor="middle" font-size="13" fill="#8a5a1f">🏅 ${e.s.insignia}</text>` : '') +
        (aqui ? `<image href="img/nico/01_boas_vindas.png" x="${x - 38}" y="${y - 118}" width="76" height="84"/>` : '');
      const abrir = () => e.prova ? abrirProva() : abrirSessao(e.k);
      no.addEventListener('click', abrir);
      no.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrir(); } });
      svg.append(no);
    });
    // o que a turma já construiu fica no mapa: a ribeira entre a missão 1 e a sessão seguinte e a sua ponte
    const rib = document.createElementNS(svgNS, 'g');
    rib.innerHTML = '<path d="M140 340 C160 280 120 230 165 190 S150 120 170 70" fill="none" stroke="#5aa9e6" stroke-width="16" stroke-linecap="round" opacity=".9"/>' +
      ((P.mundo || {}).ponte ? '<g transform="translate(140,196) rotate(-12)"><rect x="0" y="0" width="52" height="12" rx="3" fill="#c88a3d" stroke="#111" stroke-width="2"/><path d="M4 0v-8M48 0v-8M4 -8H48" stroke="#6b4a22" stroke-width="3"/></g>' : '<text x="182" y="206" font-size="13" fill="#1a4fd1" font-weight="700">sem ponte!</text>');
    svg.insertBefore(rib, svg.querySelector('.tr-no'));
    L.parentNode.insertBefore(svg, L);
    const prev = L.parentNode.querySelectorAll('.pc-trilho'); if (prev.length > 1) prev[0].remove();
  }

  // ------------------------------------------------------------ sessão
  let S = null;      // { k, e, a } sessão, estação, atividade
  let atual = null;  // controlador da atividade no ecrã
  function abrirSessao(k, e, a) {
    const s = X.sessoes[k];
    if (e == null) {    // continuar onde ficou
      e = 0; a = 0;
      outer: for (let i = 0; i < s.estacoes.length; i++) for (let j = 0; j < s.estacoes[i].atividades.length; j++) if (!feitoEm(s.estacoes[i].atividades[j].id)) { e = i; a = j; break outer; }
    }
    S = { k, e, a };
    vista('vSessao');
    mostrar();
  }
  function estacoesTopo() {
    const s = X.sessoes[S.k], nav = $('estacoes'); nav.innerHTML = '';
    s.estacoes.forEach((e, i) => {
      const feita = e.atividades.every(a => feitoEm(a.id));
      const b = h('button', { type: 'button', class: 'pc-est' + (i === S.e ? ' atual' : '') + (feita ? ' feita' : ''), title: AREAS[e.area].nome },
        h('i', null, feita ? '✓' : AREAS[e.area].icone), h('span', null, e.titulo || AREAS[e.area].nome));
      b.addEventListener('click', () => { S.e = i; S.a = 0; mostrar(); });
      nav.append(b);
    });
  }
  function mostrar() {
    fecharAtual();
    const s = X.sessoes[S.k], est = s.estacoes[S.e], at = est.atividades[S.a], A = AREAS[est.area];
    document.title = 'Nico · ' + s.titulo;
    estacoesTopo();
    $('atArea').textContent = A.nome; $('atArea').style.background = A.cor;
    $('atTitulo').textContent = at.titulo || (est.texto ? 'Leitura: ' + est.texto.titulo : (est.titulo || A.nome) + ' · pergunta ' + (S.a + 1));
    $('atConta').textContent = `${S.a + 1} de ${est.atividades.length}`;
    const pts = $('atPontos'); pts.innerHTML = '';
    est.atividades.forEach((x, i) => { const r = feitoEm(x.id); pts.append(h('b', { class: (r ? (r.ok ? 'feito' : 'falhado') : '') + (i === S.a ? ' atual' : '') })); });
    $('atMsg').textContent = ''; $('atMsg').className = 'pr-msg';
    $('btnSeguinte').hidden = true;
    $('btnVerificar').hidden = true;
    $('btnSaltar').hidden = false;
    masc.pistas(at.ajudas || (at.tipo === 'detetive' ? [] : at.pistas) || []);
    const palco = $('atPalco'); palco.innerHTML = '';
    const t0 = performance.now();
    let ajudas = 0;
    F.PC.registarAjuda = n => { ajudas = Math.max(ajudas, n); };
    const concluir = (res, frase) => {
      const ja = feitoEm(at.id);
      const reg = Object.assign({ ok: !!res.ok, t: Math.round((performance.now() - t0) / 1000), ajudas }, res);
      // o que o professor precisa de saber: feito sozinho, feito com apoio (pistas ou 2.ª tentativa), ou com a resposta mostrada
      reg.estado = !res.ok ? 'mostrada' : (ajudas > 0 || (res.tentativas || 1) > 1) ? 'apoio' : 'autonomo';
      delete reg.valor;
      if (res.valor !== undefined) reg.v = res.valor;
      // fica o melhor resultado (não se perde um «certo» por repetir)
      const antes = ja ? valor(at, ja) : 0, agora = valor(at, reg);   // só a 1.ª conclusão conta
      if (!ja || (!ja.ok && reg.ok) || (ja.ok && reg.ok && (reg.estrelas || 0) > (ja.estrelas || 0))) { P.at[at.id] = reg; if (agora > antes) ganhar(agora - antes); gravar(); }
      if (res.ok && at.transforma) { P.mundo = Object.assign({}, P.mundo, { [at.transforma]: true }); gravar(); }
      if (S && sessaoFeita(X.sessoes[S.k]) && !(P.insignias || []).includes(X.sessoes[S.k].id)) { P.insignias = [...(P.insignias || []), X.sessoes[S.k].id]; gravar(); }
      if (res.ok && F.Som) F.Som.tocar('sucesso');
      if (frase !== null) masc.dizer(res.ok ? 'celebrar' : 'calma', frase || (res.ok ? elogio() : 'Não faz mal. Vê a resposta certa e a explicação — para a próxima já sabes.'));
      $('atMsg').textContent = res.ok ? (res.aberta ? 'Texto guardado ✓' : 'Certo! ✓') : 'Vê a resposta certa.';
      $('atMsg').className = 'pr-msg ' + (res.ok ? 'certo' : 'errado');
      $('btnVerificar').hidden = true; $('btnSaltar').hidden = true;
      $('btnSeguinte').hidden = false; $('btnSeguinte').focus();
      pts.children[S.a].className = (P.at[at.id].ok ? 'feito' : 'falhado') + ' atual';
    };
    const api = {
      concluir, dizer: (e, t) => masc.dizer(e, t),
      msg: (t, tipo) => { $('atMsg').textContent = t; $('atMsg').className = 'pr-msg ' + (tipo || ''); },
    };
    let ouvir = () => at.missao || at.pergunta || '';
    if (at.tipo === 'caminho') {
      atual = F.PC.caminho.montar(palco, at, api);
      ouvir = () => at.missao;
    } else if (F.PC.oficina.tipos.includes(at.tipo)) {
      atual = F.PC.oficina.montar(palco, at, api);
      ouvir = () => at.pergunta || at.pedido || '';
    } else if (F.PC.jogos.tipos.includes(at.tipo)) {
      atual = F.PC.jogos.montar(palco, at, api);
      ouvir = () => at.pergunta || '';
    } else if (F.PC.rt.tipos.includes(at.tipo)) {
      F.PC.rt.montar(palco, at, api);
      ouvir = () => at.pergunta || '';
    } else {
      // item de pergunta (com o texto de leitura ao lado quando a estação o tem)
      let alvo = palco;
      if (est.texto && at.comTexto !== false) {
        alvo = h('div', { class: 'pd-perg' });
        palco.append(h('div', { class: 'pc-duplo' }, blocoTexto(est.texto), alvo));
      }
      let tent = 0;
      const verificar = () => {
        if (!c.respondido()) { masc.dizer('curiosa', at.tipo === 'extensa' ? 'Escreve primeiro o teu texto.' : 'Ainda não respondeste. Escolhe ou escreve a tua resposta.'); return; }
        tent++;
        const r = c.verificar();
        if (r.aberta) {
          if (!r.certo) { masc.dizer('dica', 'Quase! Vê a lista debaixo do texto: o que ainda falta?'); tent = 0; return; }
          c.bloquear(); c.explicar();
          concluir({ ok: true, aberta: true, tentativas: tent, valor: c.valor() }, 'Gostei de ler! Guardei o teu texto para o professor ver.');
          return;
        }
        if (r.certo) { c.bloquear(); c.explicar(); concluir({ ok: true, tentativas: tent }); return; }
        if (tent < 2) {
          if (F.Som) F.Som.tocar('apagar');
          masc.dizer('a_pensar', at.dicaErro || (at.pistas && at.pistas[0]) || 'Hmm, ainda não. Lê outra vez com atenção e tenta de novo.');
          $('atMsg').textContent = 'Ainda não. Tens mais uma tentativa.'; $('atMsg').className = 'pr-msg errado';
          return;
        }
        c.bloquear(); c.mostrarCerto();
        concluir({ ok: false, tentativas: tent });
      };
      const c = F.PC.itens.montar(alvo, at, { modo: 'sessao', aoEnter: verificar, aoMudar: () => { $('atMsg').textContent = ''; } });
      atual = c;
      $('btnVerificar').hidden = false;
      $('btnVerificar').onclick = verificar;
      ouvir = c.textoParaOuvir;
      masc.dizer('boas_vindas', at.boasVindas || (est.texto ? 'O texto está à esquerda. Podes voltar a ele sempre que precisares.' : 'Lê com atenção. Quando tiveres a resposta, carrega em «Verificar».'));
      // já feita antes: mostra como ficou
      const ja = feitoEm(at.id);
      if (ja && at.tipo === 'extensa' && ja.v) c.repor(ja.v);
    }
    $('btnOuvir').onclick = () => masc.ouvir(ouvir());
  }
  // texto de leitura (à esquerda), com botão para o ouvir
  function blocoTexto(T) {
    const b = h('button', { type: 'button', class: 'btn btn-texto pc-ouvir', title: 'Ouvir o texto' }, '🔊 Ouvir o texto');
    b.addEventListener('click', () => masc.ouvir(T.titulo + '. ' + T.paragrafos.join(' ')));
    return h('div', { class: 'pd-texto' }, h('h2', null, T.titulo, b), T.fonte ? h('div', { class: 'pt-fonte' }, T.fonte) : null,
      T.paragrafos.map((p, i) => h('p', null, h('span', { class: 'pt-linha' }, String(i + 1)), p)));
  }
  const ELOGIOS = ['Muito bem!', 'Isso mesmo!', 'Boa! Nem eu farejava melhor.', 'Certíssimo!', 'Excelente!', 'Assim é que é!'];
  const elogio = () => ELOGIOS[Math.floor(Math.random() * ELOGIOS.length)];
  function fecharAtual() { if (atual && atual.fechar) atual.fechar(); atual = null; if ('speechSynthesis' in window) speechSynthesis.cancel(); }

  function seguinte() {
    const s = X.sessoes[S.k], est = s.estacoes[S.e];
    if (S.a + 1 < est.atividades.length) { S.a++; mostrar(); return; }
    if (S.e + 1 < s.estacoes.length) {
      const prox = s.estacoes[S.e + 1];
      janela('celebrar', `${AREAS[est.area].nome}: feito!`, `A seguir: ${AREAS[prox.area].icone} ${prox.titulo || AREAS[prox.area].nome}.`,
        [['Continuar', 'btn-escuro', () => { S.e++; S.a = 0; mostrar(); }]]);
      return;
    }
    fimSessao();
  }
  function fimSessao() {
    fecharAtual();
    const s = X.sessoes[S.k];
    const linhas = s.estacoes.map(e => { const t = e.atividades.length, f = e.atividades.filter(a => feitoEm(a.id) && feitoEm(a.id).ok).length; return `${AREAS[e.area].nome}: ${f} de ${t}`; });
    const falta = atividadesDe(s).filter(a => !feitoEm(a.id)).length;
    const ins = sessaoFeita(s) && s.insignia ? ` Ganhaste a insígnia «${s.insignia}»! 🏅` : '';
    janela('celebrar', 'Sessão terminada!', linhas.join(' · ') + (falta ? ` · Ficaram ${falta} por fazer (saltadas).` : '') + ins,
      [['Voltar ao percurso', 'btn-escuro', mapa], ...(S.k + 1 < X.sessoes.length ? [['Sessão seguinte →', 'btn-azul', () => abrirSessao(S.k + 1)]] : [])]);
  }

  // ------------------------------------------------------------ prova-ensaio
  function abrirProva() {
    const Pv = X.prova;
    janela('dica', Pv.titulo, Pv.aviso, [['Ainda não', 'btn-texto', mapa], ['Começar a prova', 'btn-escuro', () => correrProva(Pv)]]);
  }
  function correrProva(Pv) {
    vista('vProva'); $('estacoes').innerHTML = '';
    const caixa = $('prova'); caixa.innerHTML = '';
    const itens = Pv.itens, resp = itens.map(() => undefined), marcadas = new Set();
    let i = 0, ctrl = null;
    const t0 = Date.now();
    const relogio = h('span', { class: 'pv-tempo', 'aria-live': 'off' });
    const nav = h('div', { class: 'pv-nav', role: 'navigation', 'aria-label': 'Questões' });
    const corpo = h('div', { class: 'pv-corpo' });
    const bAnt = h('button', { type: 'button', class: 'btn btn-texto' }, '← Anterior');
    const bMarcar = h('button', { type: 'button', class: 'btn btn-texto pv-marcar', 'aria-pressed': 'false' }, '⚑ Marcar para rever');
    const bSeg = h('button', { type: 'button', class: 'btn btn-escuro' }, 'Seguinte →');
    const bEntregar = h('button', { type: 'button', class: 'btn btn-azul' }, 'Entregar a prova');
    caixa.append(h('div', { class: 'pv-topo' }, h('strong', null, Pv.titulo), nav, relogio), corpo,
      h('div', { class: 'pv-pe' }, bAnt, bMarcar, h('span', { class: 'pv-esp' }), bSeg, bEntregar));
    const relogioTick = () => {
      const s = Math.floor((Date.now() - t0) / 1000), rest = Pv.minutos * 60 - s;
      relogio.textContent = rest >= 0 ? `Faltam ${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}` : `Tempo esgotado (+${Math.floor(-rest / 60)} min)`;
      relogio.style.background = rest < 300 ? '#fff1c2' : '#fff';
    };
    relogioTick();
    const tick = setInterval(relogioTick, 500);
    function guardar() { if (ctrl) resp[i] = ctrl.respondido() ? ctrl.valor() : undefined; }
    function ir(k) {
      guardar(); i = k;
      const it = itens[i];
      corpo.innerHTML = '';
      let alvo = corpo;
      if (it.leitura) {
        alvo = h('div', { class: 'pd-perg' });
        corpo.append(h('div', { class: 'pc-duplo' }, blocoTexto(Pv.textos[it.leitura]), alvo));
      }
      ctrl = F.PC.itens.montar(alvo, Object.assign({}, it, { pergunta: `${i + 1}. ${it.pergunta}` }), { modo: 'prova', aoMudar: () => { guardar(); pintarNav(); } });
      if (resp[i] !== undefined) ctrl.repor(resp[i]);
      bAnt.disabled = i === 0; bSeg.disabled = i === itens.length - 1;
      bMarcar.setAttribute('aria-pressed', String(marcadas.has(i)));
      pintarNav();
    }
    function pintarNav() {
      nav.innerHTML = '';
      itens.forEach((_, k) => {
        const b = h('button', { type: 'button', class: (resp[k] !== undefined ? 'resp' : '') + (k === i ? ' atual' : '') + (marcadas.has(k) ? ' marcada' : ''),
          'aria-label': `Questão ${k + 1}` + (resp[k] !== undefined ? ', respondida' : '') + (marcadas.has(k) ? ', marcada' : '') }, String(k + 1));
        b.addEventListener('click', () => ir(k));
        nav.append(b);
      });
    }
    bAnt.onclick = () => ir(i - 1);
    bSeg.onclick = () => ir(i + 1);
    bMarcar.onclick = () => { marcadas.has(i) ? marcadas.delete(i) : marcadas.add(i); bMarcar.setAttribute('aria-pressed', String(marcadas.has(i))); pintarNav(); };
    bEntregar.onclick = () => {
      guardar();
      const vazias = resp.filter(v => v === undefined).length;
      const avisos = [vazias ? `${vazias} ${vazias === 1 ? 'questão está' : 'questões estão'} por responder.` : 'Respondeste a todas.',
        marcadas.size ? `${marcadas.size} ${marcadas.size === 1 ? 'está marcada' : 'estão marcadas'} para rever.` : ''].filter(Boolean).join(' ');
      janela('a_pensar', 'Entregar a prova?', avisos + ' Depois de entregar já não podes mudar as respostas.',
        [['Voltar à prova', 'btn-texto', () => {}], ['Entregar', 'btn-azul', () => { clearInterval(tick); resultado(); }]]);
    };
    function resultado() {
      const porArea = {}; let certas = 0, total = 0;
      const lista = itens.map((it, k) => {
        const aberta = it.tipo === 'extensa';
        const ok = resp[k] !== undefined && F.PC.itens.corrigir(it, resp[k]);
        if (!aberta) { total++; if (ok) certas++; porArea[it.area] = porArea[it.area] || [0, 0]; porArea[it.area][1]++; if (ok) porArea[it.area][0]++; }
        return { it, ok, aberta };
      });
      const min = Math.round((Date.now() - t0) / 60000);
      P.provas.push({ quando: new Date().toISOString().slice(0, 16), certas, total, porArea, minutos: min, respostas: resp.map(v => v === undefined ? null : v) });
      gravar();
      corpo.innerHTML = '';
      caixa.querySelector('.pv-pe').hidden = true; nav.innerHTML = ''; relogio.textContent = `${min} min`;
      const res = h('div', { class: 'pv-res' },
        h('h1', null, `${certas} de ${total} certas`),
        h('p', null, masc.daMascote({ nico: 'Farejei as tuas respostas! Vê abaixo o que já está seguro e o que vale a pena treinar.', _: 'Vê abaixo o que já está seguro e o que vale a pena treinar.' })),
        h('div', { class: 'pv-areas' }, Object.entries(porArea).map(([a, [c, t]]) => h('div', { class: 'pv-area', style: 'border-color:' + AREAS[a].cor }, AREAS[a].nome, h('b', null, `${c} / ${t}`)))),
        h('ol', null, lista.map(({ it, ok, aberta }) => h('li', { class: aberta ? '' : ok ? 'certo' : 'errado' },
          h('b', null, aberta ? '✎ ' : ok ? '✓ ' : '✗ '), it.pergunta, aberta ? h('em', null, ' — texto guardado para o professor ler.') : ok ? null : h('div', { class: 'pe-instr', style: 'margin:2px 0 6px' }, 'Resposta certa: ' + F.PC.itens.respostaCerta(it))))),
        h('p', null, h('button', { type: 'button', class: 'btn btn-escuro btn-grande', onclick: mapa }, 'Voltar ao percurso')));
      corpo.append(res);
      if (F.Som) F.Som.tocar('nivel');
    }
    ir(0);
    caixa._fechar = () => clearInterval(tick);
  }

  // ------------------------------------------------------------ oficina do Nico (bolotas → decoração, sem vantagens)
  const LOJA = [
    ['vaso', 'Vaso com rosmaninho', 10, '<g transform="translate(90,250)"><path d="M0 0h50l-8 50H8z" fill="#c4553a" stroke="#111" stroke-width="2"/><path d="M25 0c-4-30 4-40 0-60M25 0c10-25 20-30 25-45M25 0c-12-20-22-26-28-40" stroke="#4f7d3a" stroke-width="4" fill="none"/></g>'],
    ['bandeirolas', 'Bandeirolas da Mostra', 15, '<path d="M60 40 Q480 120 900 40" fill="none" stroke="#555" stroke-width="2"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<path d="M${100 + i * 90} ${48 + Math.sin(i / 8 * Math.PI) * 52}l18 32l18 -32z" fill="${['#ff5050', '#ffc850', '#2364ff', '#0e9f6e'][i % 4]}"/>`).join('')],
    ['quadro', 'Quadro de ideias', 20, '<g transform="translate(380,110)"><rect width="200" height="120" fill="#2f4f3f" stroke="#6b4a22" stroke-width="8"/><path d="M20 30h80M20 55h120M20 80h60" stroke="#fff" stroke-width="3" opacity=".8"/><circle cx="160" cy="80" r="18" fill="none" stroke="#ffc850" stroke-width="3"/></g>'],
    ['radio', 'Rádio antigo', 25, '<g transform="translate(700,215)"><rect width="110" height="70" rx="10" fill="#8a5a1f" stroke="#111" stroke-width="2"/><circle cx="35" cy="35" r="20" fill="#e9dcc0" stroke="#111"/><rect x="66" y="20" width="32" height="8" fill="#111"/><rect x="66" y="38" width="32" height="8" fill="#111"/></g>'],
    ['bicicleta', 'Bicicleta reparada', 30, '<g transform="translate(220,300)" stroke="#111" stroke-width="4" fill="none"><circle cx="0" cy="0" r="30"/><circle cx="110" cy="0" r="30"/><path d="M0 0 40 -40h50L110 0M40 -40 55 0h-55M90 -40v-15h15"/></g>'],
    ['impressora', 'Impressora 3D', 40, '<g transform="translate(560,240)"><rect width="110" height="90" fill="#eee" stroke="#111" stroke-width="3"/><rect x="10" y="10" width="90" height="60" fill="#cfe6ff"/><rect x="45" y="22" width="20" height="12" fill="#ff5050"/><rect x="30" y="56" width="50" height="8" fill="#2364ff"/></g>'],
  ];
  function oficina() {
    vista('vOficina'); $('estacoes').innerHTML = ''; pintarBolotas();
    const tem = new Set(P.oficina || []);
    const cena = '<svg viewBox="0 0 960 380"><rect width="960" height="380" fill="#f4efe3"/><rect y="300" width="960" height="80" fill="#c9a36b"/><rect x="0" y="292" width="960" height="10" fill="#8a6d4a"/>' +
      '<rect x="760" y="60" width="140" height="110" fill="#bfe6ff" stroke="#6b4a22" stroke-width="8"/><path d="M830 60v110M760 115h140" stroke="#6b4a22" stroke-width="5"/>' +
      '<rect x="300" y="250" width="380" height="16" fill="#8b6b4a"/><rect x="320" y="266" width="12" height="34" fill="#6b4a22"/><rect x="648" y="266" width="12" height="34" fill="#6b4a22"/>' +
      LOJA.filter(([id]) => tem.has(id)).map(i => i[3]).join('') +
      '<image href="img/nico/07_a_inventar.png" x="420" y="140" width="130" height="150"/></svg>';
    const loja = h('div', { class: 'pc-loja' });
    LOJA.forEach(([id, nome, preco]) => {
      const b = h('button', { type: 'button', class: tem.has(id) ? 'tem' : '', disabled: !tem.has(id) && (P.bolotas || 0) < preco ? true : null }, nome, h('small', null, tem.has(id) ? 'Já está na oficina ✓' : `${preco} bolotas`));
      b.addEventListener('click', () => { if (tem.has(id) || (P.bolotas || 0) < preco) return; P.bolotas -= preco; P.oficina = [...tem, id]; gravar(); if (F.Som) F.Som.tocar('nivel'); oficina(); });
      loja.append(b);
    });
    const v = $('vOficina'); v.innerHTML = '';
    v.append(h('div', { class: 'pc-mapa' }, h('div', { class: 'pc-oficina' }, h('h1', null, 'A oficina do Nico'),
      h('p', null, 'É aqui que o Nico prepara a Mostra de Invenções. Ganhas bolotas por cada atividade que acabas (uma vez por atividade) e podes usá-las para decorar.'),
      h('div', { html: cena }), loja, h('p', null, h('button', { type: 'button', class: 'btn btn-escuro btn-grande', onclick: mapa }, '← Voltar ao percurso')))));
    masc.dizer('celebrar', tem.size ? 'Está a ficar linda, a nossa oficina!' : 'Ainda está vazia… escolhe o primeiro enfeite!');
  }

  // ------------------------------------------------------------ janela e vistas
  function janela(estado, titulo, texto, botoes) {
    $('janelaImg').src = masc.img(estado);
    $('janelaTitulo').textContent = titulo; $('janelaTexto').textContent = texto;
    const bx = $('janelaBotoes'); bx.innerHTML = '';
    botoes.forEach(([t, cls, f]) => { const b = h('button', { type: 'button', class: 'btn btn-grande ' + cls }, t); b.onclick = () => { $('janela').hidden = true; f(); }; bx.append(b); });
    $('janela').hidden = false;
    if (estado === 'celebrar' && F.Som) F.Som.tocar('nivel');
    setTimeout(() => bx.lastChild && bx.lastChild.focus(), 30);
  }
  function vista(id) {
    ['vMapa', 'vSessao', 'vProva', 'vOficina'].forEach(v => { $(v).hidden = v !== id; });
    const p = $('prova'); if (id !== 'vProva' && p._fechar) { p._fechar(); p._fechar = null; }
    if (id !== 'vSessao') fecharAtual();
  }

  // ------------------------------------------------------------ arranque
  document.addEventListener('DOMContentLoaded', () => {
    const M = masc.mascote();
    $('marcaIcone').innerHTML = `<img src="${masc.img('boas_vindas')}" alt="" aria-hidden="true">`;
    document.documentElement.setAttribute('data-mascote', M.id);
    $('btnSeguinte').addEventListener('click', seguinte);
    $('btnSaltar').addEventListener('click', seguinte);
    // «Missões» volta ao percurso quando se está numa sessão
    $('btnMissoes').addEventListener('click', ev => { if (!$('vSessao').hidden || !$('vProva').hidden) { ev.preventDefault(); mapa(); } });
    const q = new URLSearchParams(location.search);
    const s = Number(q.get('s'));
    if (q.get('prova') === '1') correrProva(X.prova);
    else if (s >= 1 && s <= X.sessoes.length) abrirSessao(s - 1);
    else mapa();
  });
  F.PC.app = { mapa, abrirSessao, correrProva, progresso: () => P, atual: () => atual, seguinte };
})();
