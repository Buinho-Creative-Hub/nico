/* IC Sensing Lab (motor do Nico) — ecrã inicial (escolher mascote e missão) e botões de som.
 * Sem missão escolhida (?m=), mostra este ecrã; com missão, quem manda é o app.js.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const $ = id => document.getElementById(id);

  // Missões pensadas mas ainda sem conteúdo validado — aparecem como «em preparação».
  // Ideias de missões ainda sem conteúdo aparecem aqui como «em preparação» ({ titulo, tema, descricao, cor }).
  const EM_PREPARACAO = [];

  // com um aluno da turma com sessão, as chaves levam o prefixo dele (js/turma.js)
  F.chaveMissao = m => m.chave || ('iclab.missao.' + m.id + '.v1');
  F.progressoMissao = m => {
    try { return (JSON.parse(localStorage.getItem(F.chaveMissao(m))) || {}).feitos || 0; } catch (e) { return 0; }
  };

  // ------------------------------------------------------------ botões de música e efeitos
  const NOTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.6" fill="currentColor"/><circle cx="17.5" cy="16" r="2.6" fill="currentColor"/></svg>';
  const ALTIFALANTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  function botoesSom() {
    document.querySelectorAll('[data-sons]').forEach(caixa => {
      caixa.innerHTML = '';
      const fazer = (svg, rotulo, get, set) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'btn-som'; b.innerHTML = svg;
        const pintar = () => { b.setAttribute('aria-pressed', String(get())); b.title = rotulo + ': ' + F.s(get() ? 'ligado' : 'desligado'); b.setAttribute('aria-label', b.title); };
        b.addEventListener('click', () => { set(!get()); document.querySelectorAll('[data-sons] .btn-som').forEach(x => x.dispatchEvent(new Event('pintar'))); if (get()) F.Som.tocar('clique'); });
        b.addEventListener('pintar', pintar);
        pintar();
        caixa.appendChild(b);
      };
      fazer(NOTA, F.s('musica'), () => F.Som.musicaLigada, v => F.Som.musica(v));
      fazer(ALTIFALANTE, F.s('efeitos'), () => F.Som.efeitosLigados, v => F.Som.efeitos(v));
    });
  }

  // ------------------------------------------------------------ ecrã inicial
  function mostrarInicio() {
    document.body.classList.add('modo-inicio');
    $('inicio').hidden = false;
    F.aplicarI18n();
    let escolhida = F.MASCOTES[F.MASCOTE_ID] ? F.MASCOTE_ID : F.ORDEM_MASCOTES[0];

    function marca() {
      const M = F.MASCOTES[escolhida];
      F.MASCOTE = M;
      document.documentElement.setAttribute('data-mascote', M.id);
      document.title = F.s('lab_titulo');
    }

    const lm = $('listaMascotes');
    F.ORDEM_MASCOTES.forEach(id => {
      const M = F.MASCOTES[id];
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'cartao-mascote'; b.setAttribute('role', 'radio'); b.dataset.id = id;
      b.innerHTML = '<img alt=""><span class="cm-texto"><strong></strong><em></em><span class="cm-perfil"></span></span>';
      b.querySelector('img').src = M.pasta + M.sprites.boas_vindas + (M.ext || '.png');
      b.querySelector('strong').textContent = M.nome;
      b.querySelector('em').textContent = M.descricao.replace(M.nome + ', ', '');
      b.querySelector('.cm-perfil').textContent = M.perfil;
      b.addEventListener('click', () => { escolhida = id; F.lembrarMascote(id); pintar(); F.Som.tocar('voz'); });
      lm.appendChild(b);
    });

    const lx = $('listaMissoes');
    const abrir = id => { location.href = (F.MISSOES[id].pagina || 'index.html') + '?a=' + encodeURIComponent(escolhida) + '&m=' + encodeURIComponent(id); };
    // Modo livre: primeiro cartão, sem progresso — todos os blocos por categorias (como no MakeCode)
    const L = F.MISSOES.livre;
    if (L) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'cartao-missao cartao-livre';
      b.style.setProperty('--cor', L.cor);
      b.innerHTML = '<span class="cx-tema"></span><strong></strong><span class="cx-desc"></span>' +
        '<span class="cx-gavetas" aria-hidden="true"></span><span class="cx-feito"></span>';
      b.querySelector('.cx-feito').textContent = F.s('abrir');
      b.querySelector('.cx-tema').textContent = L.tema;
      b.querySelector('strong').textContent = L.titulo;
      b.querySelector('.cx-desc').textContent = L.descricao;
      b.querySelector('.cx-gavetas').innerHTML = F.CATEGORIAS_LIVRE.map(([n]) => `<i style="--g:${F.corGaveta(n)}" title="${n}"></i>`).join('');
      b.addEventListener('click', () => abrir('livre'));
      lx.appendChild(b);
    }
    F.ORDEM_MISSOES.forEach(id => {
      const X = F.MISSOES[id];
      if (X.modoLivre) return;
      const total = F.desafiosDe(X).filter(d => !d.livre).length;
      const todos = F.desafiosDe(X), fp = F.progressoMissao(X);
      const feitos = todos.slice(0, fp).filter(d => !d.livre).length;   // o projeto livre não conta
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'cartao-missao';
      b.style.setProperty('--cor', X.cor || 'var(--azul)');
      b.innerHTML = '<span class="cx-tema"></span><strong></strong><span class="cx-desc"></span><span class="cx-niveis"></span>' +
        '<span class="cx-barra"><span></span></span><span class="cx-feito"></span>';
      b.querySelector('.cx-tema').textContent = X.tema;
      b.querySelector('strong').textContent = X.titulo;
      b.querySelector('.cx-desc').textContent = X.descricao;
      const nn = X.niveis.length;
      b.querySelector('.cx-niveis').textContent = F.s(nn === 1 ? 'resumo_1nivel' : 'resumo_niveis', { n: nn, total }) + (X.emPreparacao ? ' · ' + X.emPreparacao : '');
      if (X.perspetiva && F.PERSPETIVAS && F.PERSPETIVAS[X.perspetiva]) {
        const P = F.PERSPETIVAS[X.perspetiva];
        const v = document.createElement('span'); v.className = 'cx-voz';
        v.innerHTML = '<i aria-hidden="true"></i><span></span>';
        v.querySelector('i').innerHTML = P.retrato || '';
        v.querySelector('i').style.setProperty('--cor', P.cor);
        v.querySelector('span').textContent = F.s('com_perspetiva', { nome: P.nome });
        b.querySelector('.cx-desc').after(v);
      }
      b.querySelector('.cx-barra span').style.width = (total ? 100 * feitos / total : 0) + '%';
      b.querySelector('.cx-feito').textContent = feitos === 0 ? F.s('comecar') : feitos >= total ? F.s('feita_voltar') : F.s('continuar_n', { feitos, total });
      b.addEventListener('click', () => abrir(id));
      lx.appendChild(b);
    });
    EM_PREPARACAO.forEach(X => {
      const d = document.createElement('div');
      d.className = 'cartao-missao em-preparacao';
      d.style.setProperty('--cor', X.cor);
      d.innerHTML = '<span class="cx-tema"></span><strong></strong><span class="cx-desc"></span><span class="cx-feito"></span>';
      d.querySelector('.cx-feito').textContent = F.s('em_preparacao');
      d.querySelector('.cx-tema').textContent = X.tema;
      d.querySelector('strong').textContent = X.titulo;
      d.querySelector('.cx-desc').textContent = X.descricao;
      lx.appendChild(d);
    });

    function pintar() {
      lm.querySelectorAll('.cartao-mascote').forEach(b => b.setAttribute('aria-checked', String(b.dataset.id === escolhida)));
      marca();
    }
    pintar();
  }

  F.mostrarInicio = mostrarInicio;
  document.addEventListener('DOMContentLoaded', botoesSom);
  if (document.readyState !== 'loading') botoesSom();
})();
