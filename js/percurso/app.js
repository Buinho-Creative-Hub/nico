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
  function ler() { try { return Object.assign({ feitos: 0, at: {}, provas: [] }, JSON.parse(localStorage.getItem(CHAVE)) || {}); } catch (e) { return { feitos: 0, at: {}, provas: [] }; } }
  function gravar() {
    P.feitos = Object.keys(P.at).length;
    try { localStorage.setItem(CHAVE, JSON.stringify(P)); } catch (e) { /* sem armazenamento: segue sem gravar */ }
    if (F.Turma) F.Turma.mudou(CHAVE);
  }
  const feitoEm = id => P.at[id];

  // ------------------------------------------------------------ mapa
  function mapa() {
    vista('vMapa');
    $('estacoes').innerHTML = '';
    $('mapaMasc').src = masc.img('boas_vindas');
    document.title = 'Nico · Percurso 4.º ano';
    const L = $('listaSessoes'); L.innerHTML = '';
    X.sessoes.forEach((s, k) => {
      const ats = atividadesDe(s), feitas = ats.filter(a => feitoEm(a.id)).length;
      const b = h('button', { type: 'button', class: 'pc-sessao' + (feitas === ats.length ? ' feita' : '') },
        h('span', { class: 'ps-num' }, 'Sessão ' + (k + 1)),
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
    masc.dizer('boas_vindas', X.boasVindas);
  }
  const atividadesDe = s => s.estacoes.flatMap(e => e.atividades);

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
    masc.pistas(at.pistas || []);
    const palco = $('atPalco'); palco.innerHTML = '';
    const t0 = performance.now();
    let ajudas = 0;
    F.PC.registarAjuda = n => { ajudas = Math.max(ajudas, n); };
    const concluir = (res, frase) => {
      const ja = feitoEm(at.id);
      const reg = Object.assign({ ok: !!res.ok, t: Math.round((performance.now() - t0) / 1000), ajudas }, res);
      delete reg.valor;
      if (res.valor !== undefined) reg.v = res.valor;
      // fica o melhor resultado (não se perde um «certo» por repetir)
      if (!ja || (!ja.ok && reg.ok) || (ja.ok && reg.ok && (reg.estrelas || 0) > (ja.estrelas || 0))) { P.at[at.id] = reg; gravar(); }
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
    janela('celebrar', 'Sessão terminada!', linhas.join(' · ') + (falta ? ` · Ficaram ${falta} por fazer (saltadas).` : ''),
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
    ['vMapa', 'vSessao', 'vProva'].forEach(v => { $(v).hidden = v !== id; });
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
