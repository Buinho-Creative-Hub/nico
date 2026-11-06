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
    // ícones das estações: arte do Ambrósio (img/percurso/estacao-*)
    maos: { nome: 'Rato e teclado', cor: 'var(--maos)', img: 'estacao-maos' },
    prog: { nome: 'Programar', cor: 'var(--prog)', img: 'estacao-programar' },
    mat: { nome: 'Matemática', cor: 'var(--mat)', img: 'estacao-pontes' },
    port: { nome: 'Português', cor: 'var(--port)', img: 'estacao-portugues' },
    meio: { nome: 'Estudo do Meio', cor: 'var(--meio)', img: 'estacao-meio' },
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

  // ------------------------------------------------------------ moedas de cobre (ideia do Jaime, 5 Nov 2026), sequências e insígnias
  // Guardam-se em P.bolotas (o nome antigo), para ninguém perder o que já ganhou. Ícone provisório até o Ambrósio desenhar a moeda de cobre.
  const BOLOTA = '<img class="pc-moeda" src="img/percurso/moeda-cobre.webp" alt="">';
  function pintarBolotas(salto) {
    let b = $('bolotas');
    if (!b) { b = h('span', { class: 'pc-bolotas', id: 'bolotas', title: 'Moedas de cobre ganhas no percurso' }); document.querySelector('.ligacao').prepend(b); }
    b.innerHTML = BOLOTA + '<span>' + (P.bolotas || 0) + '</span>';
    if (salto) { b.classList.remove('salto'); void b.offsetWidth; b.classList.add('salto'); }
  }
  function ganhar(n, onde) {
    if (n <= 0) return;
    P.bolotas = (P.bolotas || 0) + n;
    pintarBolotas(true);
    const r = (onde || $('bolotas')).getBoundingClientRect();
    const e = h('span', { class: 'pc-ganho' }, '+' + n + ' 🪙'); e.style.left = (r.left + r.width / 2 - 20) + 'px'; e.style.top = (r.top - 10) + 'px';
    document.body.append(e); setTimeout(() => e.remove(), 1200);
  }
  // moedas: recompensa fixa pela primeira conclusão (também com apoio). Repetir serve para aprender, não para juntar moedas.
  // Compram decoração, jogos extra e o bilhete do capítulo seguinte — nunca pistas, respostas ou vantagens (revisão do Ambrósio, 1 Nov;
  // regra aprovada pelo Carlos a 5 Nov). Quem cumpre as missões de um capítulo recebe o bilhete seguinte de graça.
  const GRANDES = ['caminho', 'ponte', 'detetive', 'correio', 'horta', 'mosaico', 'ditado', 'radio', 'feira', 'saco', 'inquerito', 'planificacao', 'tartaruga', 'triagem', 'circuito', 'arqueologia', 'jornal', 'sublinhar', 'frases'];
  function valor(at, res) { return res ? (GRANDES.includes(at.tipo) ? 5 : 3) : 0; }
  const sessaoFeita = s => atividadesDe(s).every(a => feitoEm(a.id));
  const contam = s => s.estacoes.filter(e => !e.extra);   // o «Treino extra» é opcional: não conta para concluir

  // ------------------------------------------------------------ mapa
  function mapa() {
    vista('vMapa');
    $('estacoes').innerHTML = '';
    $('mapaMasc').src = masc.img('boas_vindas');
    document.title = 'Nico · Percurso 4.º ano';
    const L = $('listaSessoes'); L.innerHTML = '';
    pintarBolotas();
    trilho();
    const caps = capitulos();
    caps.forEach((c, ci) => {
      const aberto = capAberto(c);
      if (c.nome) {
        const feitas = c.sessoes.filter(id => sessaoFeita(porId(id))).length;
        const cab = h('div', { class: 'pc-cap' + (aberto ? '' : ' fechado'), id: 'cap-' + c.id },
          c.cenario ? h('img', { class: 'pcap-img', src: `img/percurso/cenario-${c.cenario}.webp`, alt: '' }) : null,
          h('div', null, h('span', { class: 'pcap-n' }, `Capítulo ${c.n}`), h('h2', null, c.nome), h('p', null, c.historia),
            h('span', { class: 'pcap-estado' }, aberto ? `${feitas} de ${c.sessoes.length} missões cumpridas` + (feitas === c.sessoes.length ? ' · pedaço do mapa ganho ✓' : '') : '🔒 Fechado')));
        if (!aberto) {
          const ant = caps[ci - 1], pode = (P.bolotas || 0) >= c.bilhete;
          cab.lastChild.append(h('div', { class: 'pcap-bilhete' },
            h('button', { type: 'button', class: 'btn btn-azul', disabled: pode ? null : true, onclick: () => comprarBilhete(c) }, `🎟 Bilhete para ${c.nome} · ${c.bilhete} moedas`),
            h('small', null, (pode ? '' : `Tens ${P.bolotas || 0} moedas. `) + `Quando cumprires as missões de ${ant.nome}, o bilhete é oferecido.`)));
        }
        L.append(cab);
      }
      c.sessoes.forEach(id => { const k = X.sessoes.findIndex(s => s.id === id); if (k >= 0) L.append(cartao(k, aberto)); });
      (c.provas || []).forEach(pid => { const Pv = (X.provas || [X.prova]).find(p => p.id === pid); if (Pv) L.append(cartaoProva(Pv, aberto)); });
    });
    const bOf = h('button', { type: 'button', class: 'pc-sessao treino' }, h('span', { class: 'ps-num' }, 'Moedas de cobre'), h('strong', null, '🛠 A loja e a oficina do Nico'),
      h('span', { class: 'ps-tema' }, 'Usa as moedas para comprar jogos extra, decorar a oficina e comprar bilhetes. Não compram pistas nem respostas.'),
      h('span', { class: 'ps-estado' }, `Tens ${P.bolotas || 0} moedas`));
    bOf.addEventListener('click', () => oficina());
    L.append(bOf);
    masc.dizer('boas_vindas', X.boasVindas);
  }
  function cartao(k, aberto) {
    const s = X.sessoes[k];
    const ats = atividadesDe(s), feitas = ats.filter(a => feitoEm(a.id)).length;
    const b = h('button', { type: 'button', class: 'pc-sessao' + (feitas === ats.length ? ' feita' : '') + (aberto ? '' : ' fechada') },
      h('span', { class: 'ps-num' }, rotulo(k) + (s.lugar ? ' · ' + s.lugar : '')),
      h('strong', null, s.titulo),
      h('span', { class: 'ps-tema' }, s.missao || s.resumo),
      s.missao ? h('span', { class: 'ps-curr' }, s.resumo) : null,
      h('span', { class: 'ps-areas' }, contam(s).map(e => {
        const t = e.atividades.length, f = e.atividades.filter(a => feitoEm(a.id)).length;
        const i = h('i'); i.style.width = (t ? 100 * f / t : 0) + '%'; i.style.background = AREAS[e.area].cor;
        return h('span', { title: (e.titulo || AREAS[e.area].nome) + ': ' + f + ' de ' + t }, i);
      })),
      h('span', { class: 'ps-estado' }, !aberto ? '🔒 Capítulo fechado' : feitas === 0 ? 'Começar' : feitas === ats.length ? 'Feita ✓ · voltar' : `Continuar · ${feitas} de ${ats.length}`));
    b.addEventListener('click', () => entrar(k));
    return b;
  }
  function cartaoProva(Pv, aberto) {
    const ult = resultadosDe(Pv).pop();
    const b = h('button', { type: 'button', class: 'pc-sessao prova' + (aberto ? '' : ' fechada') },
      h('span', { class: 'ps-num' }, Pv.id === 'final' ? 'No fim · castelo de Messejana' : 'Prova-ensaio'), h('strong', null, Pv.titulo), h('span', { class: 'ps-tema' }, Pv.resumo),
      h('span', { class: 'ps-estado' }, !aberto ? '🔒 Capítulo fechado' : ult ? `Última vez: ${ult.certas} de ${ult.total} certas · fazer outra vez` : 'Fazer a prova-ensaio'));
    b.addEventListener('click', () => { if (!aberto) return avisoFechado(capDe(Pv.id)); abrirProva(Pv); });
    return b;
  }
  const resultadosDe = Pv => P.provas.filter(r => (r.id || 'final') === Pv.id);

  // ------------------------------------------------------------ capítulos (Montes Velhos → Ervidel → Aljustrel → Messejana)
  const TODOS = new URLSearchParams(location.search).get('cap') === 'todos';   // o professor abre tudo com ?cap=todos
  const porId = id => X.sessoes.find(s => s.id === id);
  function capitulos() {
    if (!X.capitulos) return [{ id: 'c0', n: 1, nome: '', sessoes: X.sessoes.map(s => s.id), provas: (X.provas || [X.prova]).map(p => p.id) }];
    const dentro = new Set(X.capitulos.flatMap(c => c.sessoes)), fora = X.sessoes.filter(s => !dentro.has(s.id)).map(s => s.id);
    if (!fora.length) return X.capitulos;
    const cs = X.capitulos.slice(); cs[cs.length - 1] = Object.assign({}, cs[cs.length - 1], { sessoes: [...cs[cs.length - 1].sessoes, ...fora] }); return cs;
  }
  const capDe = id => capitulos().find(c => c.sessoes.includes(id) || (c.provas || []).includes(id));
  function capAberto(c) {
    if (!c || !X.capitulos || c.n === 1 || TODOS) return true;
    if ((P.bilhetes || []).includes(c.id)) return true;
    const ant = capitulos()[c.n - 2];
    if (ant && ant.sessoes.every(id => sessaoFeita(porId(id)))) return true;
    return c.sessoes.some(id => atividadesDe(porId(id)).some(a => feitoEm(a.id)));   // quem já começou não fica de fora
  }
  const ordem = () => capitulos().flatMap(c => c.sessoes).map(id => X.sessoes.findIndex(s => s.id === id)).filter(k => k >= 0);
  function comprarBilhete(c) {
    if ((P.bolotas || 0) < c.bilhete || capAberto(c)) return;
    P.bolotas -= c.bilhete; P.bilhetes = [...(P.bilhetes || []), c.id]; gravar(); if (F.Som) F.Som.tocar('nivel');
    janela(`img:img/percurso/cenario-${c.cenario}.webp`, `Bilhete para ${c.nome}! 🎟`, c.historia, [['Ver as missões', 'btn-azul', () => { mapa(); const e = $('cap-' + c.id); if (e && e.scrollIntoView) e.scrollIntoView(); }]]);
  }
  function avisoFechado(c) {
    const ant = capitulos()[c.n - 2];
    janela('calma', `${c.nome} ainda está fechado`, `Cumpre as missões de ${ant.nome} (o bilhete é oferecido) ou compra o bilhete por ${c.bilhete} moedas de cobre. Tens ${P.bolotas || 0}.`,
      [['Voltar', 'btn-texto', () => {}], ...((P.bolotas || 0) >= c.bilhete ? [[`Comprar por ${c.bilhete}`, 'btn-azul', () => comprarBilhete(c)]] : [])]);
  }
  // entrar numa missão pelo mapa: capítulo fechado → aviso; capítulo novo → a história do capítulo primeiro
  function entrar(k) {
    const c = capDe(X.sessoes[k].id);
    if (!capAberto(c)) return avisoFechado(c);
    abrirSessao.doMapa = true;
    if (c && c.nome && !(P.historias || []).includes(c.id)) {
      P.historias = [...(P.historias || []), c.id]; gravar();
      janela(`img:img/percurso/cenario-${c.cenario}.webp`, `Capítulo ${c.n} · ${c.nome}`, c.historia, [['Vamos! →', 'btn-azul', () => { abrirSessao.doMapa = true; abrirSessao(k); }]]);
      return;
    }
    abrirSessao(k);
  }
  const atividadesDe = s => contam(s).flatMap(e => e.atividades);
  // «Missão 1» (fatia vertical da Mostra de Invenções) ou «Sessão N» (as sessões numeradas sem contar as missões)
  const rotulo = k => X.sessoes[k].rotulo || 'Sessão ' + (X.sessoes.slice(0, k + 1).filter(s => !s.rotulo).length);
  const curto = k => X.sessoes[k].rotulo ? X.sessoes[k].rotulo.replace('Missão ', 'M') : String(X.sessoes.slice(0, k + 1).filter(s => !s.rotulo).length);

  // mapa da campanha: arte do Ambrósio (img/percurso/mapa-sem-ponte / mapa-com-ponte, 1536×1024) com botões por cima.
  // Pontos e camadas: MAPA-E-CENARIOS.json do complemento (1 Nov 2026). A Água e o Património têm sítio próprio;
  // a Horta (1260,460) recebe a sessão 5; Ateliê (1245,790) e Correio (1280,235) ficam reservados às suas funções.
  // mapa do concelho do Ambrósio (mapa-concelho, 1536×1024, esquemático e sem escala): botões nos pontos do manifesto
  // MAPA-DE-COBRE-ARTE.json (PR #79); as placas ficam no caminho que sai de Montes Velhos
  const SITIOS = { s1: [760, 245], v1: [470, 335], s2: [135, 345], m1: [1390, 390], s3: [1390, 245], s5: [1125, 397], v2: [1010, 330],
    s6: [905, 470], v3: [1290, 640], s4: [690, 870], v4: [465, 975], prova: [150, 625] };
  const CAMADAS = [];
  // tema dos cenários quando a atividade não traz um (themeBySession)
  const TEMA_SESSAO = { s1: 'messejana', s2: 'montado', s3: 'alqueva', s4: 'fablab', s5: 'horta', s6: 'castelo', m1: 'alqueva', v1: 'montado', v2: 'alqueva', v3: 'castelo', v4: 'messejana' };
  function trilho() {
    const L = $('listaSessoes');
    const atualK = ordem().find(k => capAberto(capDe(X.sessoes[k].id)) && !sessaoFeita(X.sessoes[k]));   // a próxima missão, pela ordem da história
    const caixa = h('div', { class: 'pc-mapa-arte', role: 'list', 'aria-label': 'Mapa do concelho de Aljustrel: Montes Velhos, Ervidel, Aljustrel e Messejana' },
      h('img', { class: 'ma-fundo', src: 'img/percurso/mapa-concelho.webp', alt: 'Mapa ilustrado e sem escala do concelho, com Montes Velhos, Ervidel, Aljustrel e Messejana' }));
    const pos = ([x, y]) => ({ left: (100 * x / 1536) + '%', top: (100 * y / 1024) + '%' });
    CAMADAS.forEach(c => { const i = h('img', { class: 'ma-camada', src: c.src, alt: '' }); Object.assign(i.style, pos([c.x, c.y]), { width: (100 * c.w / 1536) + '%', height: (100 * c.h / 1024) + '%' }); caixa.append(i); });
    // marcas no mapa quando uma missão transforma o mundo (rótulos de texto; a pintura só muda onde o Ambrósio a desenhou)
    X.sessoes.forEach(s => { const tr = s.transforma || (s.id === 'm1' ? { id: 'ponte', texto: 'Ponte ✓' } : null), sit = SITIOS[s.id];
      if (!tr || !sit || !(P.mundo || {})[tr.id]) return; const e = h('span', { class: 'ma-marca' }, tr.texto); Object.assign(e.style, pos([sit[0], sit[1] + 52])); caixa.append(e); });
    const etapas = [...X.sessoes.map((s, k) => ({ s, k, id: s.id })), ...(X.prova ? [{ prova: true, id: 'prova' }] : [])];
    etapas.forEach(e => {
      const sitio = SITIOS[e.id]; if (!sitio) return;
      const feita = e.prova ? resultadosDe(X.prova).length > 0 : sessaoFeita(e.s);
      const aqui = e.prova ? atualK == null : e.k === atualK;
      const b = h('button', { type: 'button', class: 'ma-no' + (feita ? ' feita' : '') + (aqui ? ' aqui' : ''), role: 'listitem',
        'aria-label': (e.prova ? X.prova.titulo : `${rotulo(e.k)}: ${e.s.titulo}`) + (feita ? ' (feita)' : '') },
        h('b', null, feita ? '✓' : e.prova ? '★' : curto(e.k)), h('span', { class: 'ma-nome' }, e.prova ? 'Desafios do Castelo' : (e.s.lugar || e.s.titulo)),
        feita && !e.prova && e.s.id === 'm1' ? h('img', { class: 'ma-ins', src: 'img/percurso/insignia-construtor-pontes.webp', alt: 'Insígnia Construtor de pontes' }) : null);
      Object.assign(b.style, pos(sitio));
      b.addEventListener('click', () => { if (e.prova) { const c = capDe('final'); return capAberto(c) ? abrirProva(X.prova) : avisoFechado(c); } entrar(e.k); });
      caixa.append(b);
      if (aqui) { const n = h('img', { class: 'ma-nico', src: 'img/percurso/nico-bicicleta-oficina.webp', alt: '' }); Object.assign(n.style, pos([sitio[0], sitio[1] - 24])); caixa.append(n); }
    });
    const velho = L.parentNode.querySelector('.pc-mapa-arte'); if (velho) velho.remove();
    L.parentNode.insertBefore(caixa, L);
  }

  // ------------------------------------------------------------ sessão
  let S = null;      // { k, e, a } sessão, estação, atividade
  let atual = null;  // controlador da atividade no ecrã
  function abrirSessao(k, e, a) {
    const s = X.sessoes[k];
    if (e == null) {    // continuar onde ficou
      e = 0; a = 0;
      outer: for (let i = 0; i < s.estacoes.length; i++) { if (s.estacoes[i].extra) continue; for (let j = 0; j < s.estacoes[i].atividades.length; j++) if (!feitoEm(s.estacoes[i].atividades[j].id)) { e = i; a = j; break outer; } }
    }
    S = { k, e, a };
    vista('vSessao');
    mostrar();
    // a missão começa com o problema (só quando se entra pelo mapa, para continuar)
    if (abrirSessao.doMapa && s.missao) {
      const feitas = atividadesDe(s).filter(x => feitoEm(x.id)).length, total = atividadesDe(s).length;
      janela(s.imagem ? 'img:' + s.imagem : 'boas_vindas', `${s.rotulo || ''} · ${s.titulo}`.replace(/^ · /, ''), s.missao + (feitas ? ` (Já fizeste ${feitas} de ${total}.)` : ''),
        [[feitas ? 'Continuar a missão' : 'Começar a missão', 'btn-azul', () => {}]]);
    }
    abrirSessao.doMapa = false;
  }
  function estacoesTopo() {
    const s = X.sessoes[S.k], nav = $('estacoes'); nav.innerHTML = '';
    s.estacoes.forEach((e, i) => {
      const feita = e.atividades.every(a => feitoEm(a.id));
      const b = h('button', { type: 'button', class: 'pc-est' + (i === S.e ? ' atual' : '') + (feita ? ' feita' : '') + (e.extra ? ' extra' : ''), title: e.titulo || AREAS[e.area].nome },
        h('i', { class: feita ? '' : 'icone' }, feita ? '✓' : AREAS[e.area].img ? h('img', { src: `img/percurso/${AREAS[e.area].img}.webp`, alt: '' }) : AREAS[e.area].icone), h('span', null, e.titulo || AREAS[e.area].nome));
      b.addEventListener('click', () => { S.e = i; S.a = 0; mostrar(); });
      nav.append(b);
    });
  }
  let geracao = 0;   // cada atividade mostrada tem o seu número: callbacks atrasados de uma atividade antiga são ignorados
  function mostrar() {
    fecharAtual();
    const minha = ++geracao, viva = () => minha === geracao && !$('vSessao').hidden;
    const relogio = relogioAtual = F.PC.relogio();
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
      if (!viva()) return;   // a criança já mudou de atividade: não há conclusão nem bolotas tardias
      const ja = feitoEm(at.id);
      const reg = Object.assign({ ok: !!res.ok, t: Math.round((performance.now() - t0) / 1000), ajudas }, res);
      // o que o professor precisa de saber: feito sozinho, feito com apoio (pistas ou 2.ª tentativa), ou com a resposta mostrada
      reg.estado = !res.ok ? 'mostrada' : res.modo === 'mostrada' ? 'mostrada' : (ajudas > 0 || (!('modo' in res) && (res.tentativas || 1) > 1)) ? 'apoio' : 'autonomo';
      delete reg.valor; delete reg.modo;
      if (res.valor !== undefined) reg.v = res.valor;
      // fica o melhor resultado (não se perde um «certo» por repetir)
      const antes = ja ? valor(at, ja) : 0, agora = valor(at, reg);   // só a 1.ª conclusão conta
      if (!ja || (!ja.ok && reg.ok) || (ja.ok && reg.ok && (reg.estrelas || 0) > (ja.estrelas || 0))) { P.at[at.id] = reg; if (agora > antes) ganhar(agora - antes); gravar(); }
      if (res.ok && at.transforma) { P.mundo = Object.assign({}, P.mundo, { [at.transforma]: true }); gravar(); }
      if (S && sessaoFeita(X.sessoes[S.k]) && !(P.insignias || []).includes(X.sessoes[S.k].id)) { P.insignias = [...(P.insignias || []), X.sessoes[S.k].id]; gravar(); }
      // missão cumprida: o mundo do Nico muda (marca no mapa e peça na Mostra)
      const tr = S && X.sessoes[S.k].transforma;
      if (tr && sessaoFeita(X.sessoes[S.k]) && !(P.mundo || {})[tr.id]) { P.mundo = Object.assign({}, P.mundo, { [tr.id]: true }); gravar(); }
      if (res.ok && F.Som) F.Som.tocar('sucesso');
      if (frase !== null) masc.dizer(res.ok ? 'celebrar' : 'calma', frase || (res.ok ? elogio() : 'Não faz mal. Vê a resposta certa e a explicação — para a próxima já sabes.'));
      $('atMsg').textContent = res.ok ? (res.aberta ? 'Texto guardado ✓' : 'Certo! ✓') : 'Vê a resposta certa.';
      $('atMsg').className = 'pr-msg ' + (res.ok ? 'certo' : 'errado');
      $('btnVerificar').hidden = true; $('btnSaltar').hidden = true;
      $('btnSeguinte').hidden = false; $('btnSeguinte').focus();
      pts.children[S.a].className = (P.at[at.id].ok ? 'feito' : 'falhado') + ' atual';
    };
    const api = {
      concluir, viva, relogio, dizer: (e, t) => { if (viva()) masc.dizer(e, t); },
      // rascunho por atividade (M4/M5): guardado a cada ação, para retomar depois de sair ou recarregar
      rascunho: { ler: () => (P.rascunhos || {})[at.id], gravar: d => { if (!viva()) return; P.rascunhos = Object.assign({}, P.rascunhos, { [at.id]: d }); gravar(); } },
      msg: (t, tipo) => { if (!viva()) return; $('atMsg').textContent = t; $('atMsg').className = 'pr-msg ' + (tipo || ''); },
    };
    let ouvir = () => at.missao || at.pergunta || '';
    document.body.classList.toggle('pc-blocos', at.tipo === 'caminho');
    if (at.tipo === 'caminho') {
      atual = F.PC.caminho.montar(palco, at, api);
      ouvir = () => at.missao;
    } else if (F.PC.oficina.tipos.includes(at.tipo)) {
      masc.dizer('boas_vindas', at.boasVindas || 'Lê o enunciado com atenção. Se precisares, carrega em Ajuda.');
      atual = F.PC.oficina.montar(palco, at, api);
      ouvir = () => at.pergunta || at.pedido || '';
    } else if (F.PC.jogos.tipos.includes(at.tipo)) {
      atual = F.PC.jogos.montar(palco, at.tema ? at : Object.assign({}, at, { tema: TEMA_SESSAO[s.id] }), api);
      ouvir = () => at.pergunta || '';
    } else if (F.PC.rt.tipos.includes(at.tipo)) {
      atual = F.PC.rt.montar(palco, at, api);
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
  let relogioAtual = null;
  F.PC.relogioAtual = () => relogioAtual;
  function fecharAtual() { if (atual && atual.fechar) atual.fechar(); atual = null; if (relogioAtual) relogioAtual.limpar(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }

  function seguinte() {
    const s = X.sessoes[S.k], est = s.estacoes[S.e];
    if (S.a + 1 < est.atividades.length) { S.a++; mostrar(); return; }
    if (est.extra) { fimSessao(); return; }
    if (S.e + 1 < s.estacoes.length && !s.estacoes[S.e + 1].extra) {
      const prox = s.estacoes[S.e + 1];
      janela('celebrar', `${AREAS[est.area].nome}: feito!`, `A seguir: ${prox.titulo || AREAS[prox.area].nome}.`,
        [['Continuar', 'btn-escuro', () => { S.e++; S.a = 0; mostrar(); }]]);
      return;
    }
    fimSessao();
  }
  // a missão seguinte na ordem da história (se o capítulo dela estiver aberto)
  function proxima(k) {
    const o = ordem(), i = o.indexOf(k), n = o[i + 1];
    if (n == null) return [];
    const c = capDe(X.sessoes[n].id), c0 = capDe(X.sessoes[k].id);
    if (!capAberto(c)) return [];
    return [[c !== c0 ? `Seguir para ${c.nome} →` : 'Seguinte →', 'btn-azul', () => entrar(n)]];
  }
  function fimSessao() {
    fecharAtual();
    const s = X.sessoes[S.k];
    const linhas = contam(s).map(e => { const t = e.atividades.length, f = e.atividades.filter(a => feitoEm(a.id) && feitoEm(a.id).ok).length; return `${e.titulo || AREAS[e.area].nome}: ${f} de ${t}`; });
    const iExtra = s.estacoes.findIndex(e => e.extra);
    const bExtra = iExtra >= 0 ? [['Treino extra (opcional)', 'btn-texto', () => { S.e = iExtra; S.a = 0; mostrar(); }]] : [];
    const falta = atividadesDe(s).filter(a => !feitoEm(a.id)).length;
    const ins = sessaoFeita(s) && s.insignia ? ` Ganhaste a insígnia «${s.insignia}»! 🏅` : '';
    if (falta) {   // não dizer «terminada» quando ainda há atividades por fazer
      janela('calma', 'Pausa na missão', linhas.join(' · ') + ` · Ainda ${falta === 1 ? 'falta 1 atividade' : `faltam ${falta} atividades`}.`,
        [['Voltar ao percurso', 'btn-texto', mapa], ['Continuar o que falta', 'btn-azul', () => abrirSessao(S.k)]]);
      return;
    }
    const mundo = s.transforma ? ` No mapa: ${s.transforma.texto}` : '';
    janela(s.id === 'm1' ? 'insignia' : 'celebrar', s.rotulo ? 'Missão cumprida!' : 'Sessão terminada!', linhas.join(' · ') + ins + mundo,
      [['Voltar ao percurso', 'btn-escuro', mapa], ...bExtra, ...proxima(S.k)]);
  }

  // ------------------------------------------------------------ prova-ensaio
  function abrirProva(Pv) {
    Pv = Pv || X.prova;
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
      P.provas.push({ id: Pv.id, quando: new Date().toISOString().slice(0, 16), certas, total, porArea, minutos: min, respostas: resp.map(v => v === undefined ? null : v) });
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

  // ------------------------------------------------------------ loja e oficina do Nico (moedas → jogos extra, decoração, bilhetes; sem vantagens)
  // decorações: arte do Ambrósio (img/percurso/decor-*), pousadas sobre a oficina dele (oficina-nico). Posições em % da cena.
  const LOJA = [
    ['rosmaninho', 'Vaso com rosmaninho', 10, { left: '30%', top: '50%', width: '11%' }],
    ['bandeirolas', 'Bandeirolas da Mostra', 15, { left: '28%', top: '-14%', width: '44%' }],
    ['quadro', 'Quadro de ideias', 20, { left: '42%', top: '16%', width: '16%' }],
    ['radio', 'Rádio antigo', 25, { left: '60%', top: '55%', width: '12%' }],
    ['bicicleta', 'Bicicleta reparada', 30, { left: '2%', top: '60%', width: '22%' }],
    ['impressora-3d', 'Impressora 3D', 40, { left: '45%', top: '48%', width: '13%' }],
  ];
  // arcada: jogos extra que se compram uma vez e depois se jogam sempre. Usam os motores e os cenários do Ambrósio;
  // não contam para as missões. Lugar reservado para os jogos feitos pelos alunos (o primeiro: o jogo retro do Jaime).
  const ARCADA = [
    { id: 'arc-messejana', nome: 'Corrida nas ruas de Messejana', base: 's1-j2', preco: 15, tema: 'messejana', capa: 'arcada-corrida-messejana' },
    { id: 'arc-montado', nome: 'Bolotas no montado', base: 's2-j2', preco: 15, tema: 'montado', capa: 'arcada-bolotas-montado' },
    { id: 'arc-memoria', nome: 'Memória das horas', base: 's5-j2', preco: 15, capa: 'arcada-memoria' },
    { id: 'arc-roxo', nome: 'Gotas na Barragem do Roxo', base: 's3-j2', preco: 20, tema: 'alqueva', capa: 'arcada-gotas-roxo' },
    { id: 'arc-baloes', nome: 'Balões com acentos', base: 's4-j1', preco: 20, capa: 'arcada-baloes' },
    { id: 'arc-fablab', nome: 'Corrida no FabLab', base: 's4-j3', preco: 25, tema: 'fablab', capa: 'arcada-fablab' },
    { id: 'arc-castelo', nome: 'Letras no castelo', base: 's6-j1', preco: 25, tema: 'castelo', capa: 'arcada-castelo' },
    // o primeiro jogo feito por um aluno: a versão HTML5 do jogo retro do Jaime (js/percurso/jogo-jaime.js)
    { id: 'arc-jaime', nome: 'O Jaime em Messejana', jogo: 'jaime', preco: 20, capa: 'arcada-jogo-jaime', autor: 'Jogo criado pelo Jaime' },
  ];
  const atividadePorId = id => { for (const s of X.sessoes) for (const e of s.estacoes) for (const a of e.atividades) if (a.id === id) return a; return null; };
  let jogoArcada = null;
  function jogarArcada(j) {
    const base = j.jogo ? null : atividadePorId(j.base); if (!base && !j.jogo) return;
    vista('vOficina'); const v = $('vOficina'); v.innerHTML = '';
    const palco = h('div', { class: 'pc-palco pc-arcada-palco' }), msg = h('p', { class: 'pr-msg', role: 'status' });
    const relogio = F.PC.relogio();
    const fechar = () => { if (jogoArcada && jogoArcada.fechar) jogoArcada.fechar(); relogio.limpar(); jogoArcada = null; };
    v.append(h('div', { class: 'pc-mapa' }, h('div', { class: 'pc-oficina' }, h('h1', null, '🕹 ' + j.nome), h('p', null, 'Jogo extra: joga as vezes que quiseres. Não conta para as missões.'), palco, msg,
      h('p', null, h('button', { type: 'button', class: 'btn btn-texto', onclick: () => { fechar(); jogarArcada(j); } }, '↻ Jogar outra vez'), ' ',
        h('button', { type: 'button', class: 'btn btn-escuro btn-grande', onclick: () => { fechar(); oficina(); } }, '← Voltar à loja')))));
    const api = { relogio, viva: () => !!jogoArcada, dizer: (e, t) => { msg.textContent = t; }, msg: t => { msg.textContent = t; },
      concluir: res => { msg.textContent = res.ok ? 'Boa! 🎉 Queres jogar outra vez?' : 'Quase! Tenta outra vez.'; if (F.Som) F.Som.tocar(res.ok ? 'sucesso' : 'apagar'); }, rascunho: null };
    jogoArcada = { fechar: null };
    const c = j.jogo === 'jaime' ? F.PC.jogoJaime.montar(palco, {}, api) : F.PC.jogos.montar(palco, Object.assign({}, base, { id: j.id, tema: j.tema || base.tema }), api);
    jogoArcada.ctl = c;
    jogoArcada.fechar = c && c.fechar;
  }
  // os 4 pedaços do mapa de cobre (recortes exatos do mapa completo: 1 NO, 2 NE, 3 SE, 4 SO), montados à medida que se ganham
  function mapaCobre() {
    const tem = k => !!(P.mundo || {})['mapa' + k], todos = [1, 2, 3, 4].every(tem);
    const caixa = h('div', { class: 'pc-mapa-cobre', role: 'img', 'aria-label': todos ? 'Mapa de cobre completo' : `Mapa de cobre: ${[1, 2, 3, 4].filter(tem).length} de 4 pedaços` });
    if (todos) caixa.append(h('img', { src: 'img/percurso/mapa-cobre-completo.webp', alt: '' }));
    else [1, 2, 3, 4].forEach(k => caixa.append(tem(k) ? h('img', { src: `img/percurso/mapa-cobre-${k}.webp`, alt: '', class: 'pmc-' + k }) : h('span', { class: 'pmc-falta pmc-' + k }, `pedaço ${k}`)));
    return caixa;
  }
  function oficina() {
    vista('vOficina'); $('estacoes').innerHTML = ''; pintarBolotas();
    const tem = new Set(P.oficina || []), jogos = new Set(P.arcada || []);
    const cena = h('div', { class: 'of-cena', role: 'img', 'aria-label': 'Oficina do Nico' });
    LOJA.filter(([id]) => tem.has(id)).forEach(([id, nome, , st]) => { const i = h('img', { src: `img/percurso/decor-${id}.webp`, alt: nome }); Object.assign(i.style, st); cena.append(i); });
    const nico = h('img', { src: 'img/percurso/nico-sentado.webp', alt: 'Nico' }); Object.assign(nico.style, { left: '70%', top: '50%', width: '16%' }); cena.append(nico);
    const loja = h('div', { class: 'pc-loja' });
    LOJA.forEach(([id, nome, preco]) => {
      const b = h('button', { type: 'button', class: tem.has(id) ? 'tem' : '', disabled: !tem.has(id) && (P.bolotas || 0) < preco ? true : null }, h('img', { src: `img/percurso/decor-${id}.webp`, alt: '', style: 'width:56px;height:56px;object-fit:contain;display:block' }), nome, h('small', null, tem.has(id) ? 'Já está na oficina ✓' : `${preco} moedas`));
      b.addEventListener('click', () => { if (tem.has(id) || (P.bolotas || 0) < preco) return; P.bolotas -= preco; P.oficina = [...tem, id]; gravar(); if (F.Som) F.Som.tocar('nivel'); oficina(); });
      loja.append(b);
    });
    const arcada = h('div', { class: 'pc-loja pc-arcada' });
    ARCADA.filter(j => j.jogo || atividadePorId(j.base)).forEach(j => {
      const meu = jogos.has(j.id), pode = (P.bolotas || 0) >= j.preco;
      const b = h('button', { type: 'button', class: meu ? 'tem' : '', disabled: !meu && !pode ? true : null }, h('img', { class: 'pc-arc-capa', src: `img/percurso/${j.capa}.webp`, alt: '' }), j.nome, j.autor ? h('em', { class: 'pc-arc-autor' }, j.autor) : null, h('small', null, meu ? 'É teu · jogar ▶' : `${j.preco} moedas`));
      b.addEventListener('click', () => {
        if (meu) return jogarArcada(j);
        if (!pode) return;
        P.bolotas -= j.preco; P.arcada = [...jogos, j.id]; gravar(); if (F.Som) F.Som.tocar('nivel'); jogarArcada(j);
      });
      arcada.append(b);
    });
    const bilhetes = h('div', { class: 'pc-loja' });
    (X.capitulos || []).filter(c => c.n > 1).forEach(c => {
      const ab = capAberto(c), pode = (P.bolotas || 0) >= c.bilhete;
      const b = h('button', { type: 'button', class: ab ? 'tem' : '', disabled: !ab && !pode ? true : null }, h('img', { src: 'img/percurso/bilhete.webp', alt: '', style: 'width:96px;height:60px;object-fit:contain;display:block;margin:0 auto' }), `Bilhete para ${c.nome}`, h('small', null, ab ? 'Capítulo aberto ✓' : `${c.bilhete} moedas`));
      b.addEventListener('click', () => { if (!ab) comprarBilhete(c); });
      bilhetes.append(b);
    });
    const mostra = h('ul', { class: 'pc-mostra' });
    X.sessoes.forEach(s => {
      const tr = s.transforma || (s.id === 'm1' ? { id: 'ponte', texto: 'Ponte da ribeira ✓' } : null);
      if (!tr) return;
      const tem = !!(P.mundo || {})[tr.id];
      mostra.append(h('li', { class: tem ? 'tem' : '' }, h('strong', null, s.rotulo || ''), ' ', tem ? tr.texto : `${s.titulo} — ainda por fazer`));
    });
    const v = $('vOficina'); v.innerHTML = '';
    v.append(h('div', { class: 'pc-mapa' }, h('div', { class: 'pc-oficina' }, h('h1', null, 'A loja e a oficina do Nico'),
      h('p', null, `Tens ${P.bolotas || 0} moedas de cobre. Ganhas moedas por cada atividade que acabas (uma vez por atividade). Com elas compras jogos extra, decoração para a oficina e bilhetes para o capítulo seguinte. Pistas e respostas não se compram!`),
      h('h2', { class: 'pc-loja-tit' }, h('img', { src: 'img/percurso/estacao-arcada.webp', alt: '' }), 'Jogos extra'), arcada,
      (X.capitulos ? [h('h2', null, '🎟 Bilhetes'), h('p', { class: 'pe-instr' }, 'Quem cumpre as missões de um capítulo recebe o bilhete seguinte de graça. Com moedas podes ir mais cedo.'), bilhetes] : []),
      h('h2', null, 'Decorar a oficina'), cena, loja,
      h('h2', null, 'O mapa de cobre'), mapaCobre(),
      h('h2', null, 'Na Mostra de Invenções'), mostra, h('p', null, h('button', { type: 'button', class: 'btn btn-escuro btn-grande', onclick: mapa }, '← Voltar ao percurso')))));
    masc.dizer('celebrar', tem.size ? 'Está a ficar linda, a nossa oficina!' : 'Ainda está vazia… escolhe o primeiro enfeite!');
  }

  // ------------------------------------------------------------ janela e vistas
  function janela(estado, titulo, texto, botoes) {
    const ilu = estado.startsWith('img:') ? estado.slice(4) : null;   // ilustração do Ambrósio para o destino (ex.: casa do território)
    $('janelaImg').src = ilu || (estado === 'insignia' ? 'img/percurso/insignia-construtor-pontes.webp' : masc.img(estado));
    $('janelaImg').className = estado === 'insignia' || ilu ? 'insignia' : '';
    $('janelaTitulo').textContent = titulo; $('janelaTexto').textContent = texto;
    const bx = $('janelaBotoes'); bx.innerHTML = '';
    botoes.forEach(([t, cls, f]) => { const b = h('button', { type: 'button', class: 'btn btn-grande ' + cls }, t); b.onclick = () => { $('janela').hidden = true; f(); }; bx.append(b); });
    $('janela').hidden = false;
    if ((estado === 'celebrar' || estado === 'insignia') && F.Som) F.Som.tocar('nivel');
    setTimeout(() => bx.lastChild && bx.lastChild.focus(), 30);
  }
  function vista(id) {
    ['vMapa', 'vSessao', 'vProva', 'vOficina'].forEach(v => { $(v).hidden = v !== id; });
    const p = $('prova'); if (id !== 'vProva' && p._fechar) { p._fechar(); p._fechar = null; }
    if (id !== 'vSessao') fecharAtual();
    if (id !== 'vOficina' && jogoArcada) { if (jogoArcada.fechar) jogoArcada.fechar(); jogoArcada = null; }
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
    const pq = q.get('prova');
    if (pq) correrProva(pq === '1' ? X.prova : (X.provas || []).find(p => p.id === pq) || X.prova);
    else if (s >= 1 && s <= X.sessoes.length) abrirSessao(s - 1);
    else if (q.get('loja') === '1') oficina();
    else if (q.get('arcada')) { const j = ARCADA.find(x => x.id === 'arc-' + q.get('arcada')); if (j) jogarArcada(j); }   // professor/demonstração: ?arcada=jaime
    else mapa();
  });
  F.PC.app = { arcada: () => jogoArcada, mapa, abrirSessao, correrProva, abrirProva, oficina, entrar, capAberto, capDe, progresso: () => P, atual: () => atual, seguinte };
})();
