/* IC Sensing Lab — área do professor: turmas, alunos (alcunha + senha de imagens), cartões para imprimir e progresso.
 * Porta da área do professor do Nico, com as quatro línguas. Fala com a mesma API (nico-api.buinho.pt):
 * a conta do professor e as turmas são as mesmas nas duas plataformas; aqui só se mostram as missões do IC.
 * Só nomes próprios ou alcunhas — nada de apelidos, datas ou fotos.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const T = F.Turma;
  const S = (k, v) => F.s(k, v);
  const $ = id => document.getElementById(id);
  const K = 'iclab.prof.sessao';
  const t4 = (en, sr, es, pt) => F.t({ en, sr, es, pt });
  const MISSOES = [
    ['ouvir', t4('1 · Listen to the place', '1 · Ослушни место', '1 · Escucha el lugar', '1 · Ouvir o lugar')],
    ['detetives', t4('2 · Room detectives', '2 · Детективи соба', '2 · Detectives de salas', '2 · Detetives de salas')],
    ['sentir', t4('3 · Feeling buttons', '3 · Дугмад осећања', '3 · Botones del sentir', '3 · Botões do sentir')],
    ['estacao', t4('4 · Sensing station', '4 · Мерна станица', '4 · Estación de medición', '4 · Estação de medição')],
    ['calma', t4('5 · Designing calm', '5 · Дизајн мира', '5 · Diseñar la calma', '5 · Desenhar a calma')],
    ['mapa', t4('6 · My comfort map', '6 · Моја мапа удобности', '6 · Mi mapa de confort', '6 · O meu mapa de conforto')],
    ['livre', t4('Free mode', 'Слободни режим', 'Modo libre', 'Modo livre')],
  ];
  const LOCALE = { en: 'en-GB', sr: 'sr-Cyrl-RS', es: 'es-ES', pt: 'pt-PT' }[F.LANG] || 'en-GB';

  let SS = null; try { SS = JSON.parse(localStorage.getItem(K)); } catch (e) { SS = null; }
  const guardar = () => { try { SS ? localStorage.setItem(K, JSON.stringify(SS)) : localStorage.removeItem(K); } catch (e) { /* idem */ } };
  const api = (rota, corpo) => T.pedido(rota, corpo || null, SS && SS.token).catch(e => {
    if (e.status === 401 && SS) { SS = null; guardar(); ecraEntrar(S('p_sessao_fim')); }
    throw e;
  });

  function h(tag, attrs, ...filhos) {
    const e = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === 'class') e.className = v; else if (k.startsWith('on')) e[k] = v; else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
    });
    filhos.flat().forEach(f => { if (f != null && f !== false) e.append(f.nodeType ? f : document.createTextNode(String(f))); });
    return e;
  }
  const corpo = () => { const c = $('corpo'); c.innerHTML = ''; return c; };
  const aviso = (txt, tipo) => h('p', { class: 'prof-aviso ' + (tipo || ''), role: 'status' }, txt);
  const avatar = n => T.AVATARES[n % T.AVATARES.length];
  const quando = s => {
    if (!s) return S('p_nunca');
    const d = new Date(s.replace(' ', 'T') + 'Z');
    return d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
  };
  // endereço da plataforma para o cartão do aluno: o sítio onde esta página está (site do IC ou nico.buinho.pt/ic)
  const enderecoLab = () => /^https?:$/.test(location.protocol) ? (location.host + location.pathname.replace(/\/[^/]*$/, '')).replace(/^www\./, '') : 'invisiblecartographies.eu/lab';
  const semRede = e => e.offline ? S('p_precisa_rede') : e.message;

  function topo() {
    const q = $('quem'); q.innerHTML = '';
    if (!SS) return;
    q.append(h('span', null, SS.nome || SS.email));
    if (SS.admin) q.append(h('button', { class: 'btn btn-claro', type: 'button', onclick: ecraProfessores }, S('p_professores')));
    q.append(h('button', { class: 'btn btn-claro', type: 'button', onclick: ecraConta }, S('p_password')));
    q.append(h('button', { class: 'btn btn-claro', type: 'button', onclick: async () => { try { await api('prof/sair', {}); } catch (e) { /* segue */ } SS = null; guardar(); topo(); ecraEntrar(); } }, S('p_sair')));
  }

  // ------------------------------------------------------------ entrar / password
  function ecraEntrar(msg) {
    topo();
    const c = corpo();
    const email = h('input', { type: 'email', required: true, autocomplete: 'username', placeholder: 'email' });
    const pw = h('input', { type: 'password', required: true, autocomplete: 'current-password' });
    const m = aviso(msg || '');
    const f = h('form', { class: 'prof-cartao prof-login' },
      h('h1', null, S('p_area')),
      h('p', { class: 'prof-sub' }, S('p_sub_login')),
      h('label', null, S('p_email'), email), h('label', null, S('p_password'), pw),
      h('button', { class: 'btn btn-escuro', type: 'submit' }, S('p_entrar')), m,
      h('button', { class: 'btn btn-texto', type: 'button', onclick: async () => {
        if (!email.value) { m.textContent = S('p_email_primeiro'); return; }
        try { const j = await T.pedido('prof/esqueci', { email: email.value, plataforma: 'ic', lingua: F.LANG }); m.textContent = F.erroTurma(j.mensagem); m.className = 'prof-aviso ok'; }
        catch (e) { m.textContent = semRede(e); }
      } }, S('p_esqueci')),
      h('p', { class: 'prof-sub prof-nota' }, S('p_pede_conta')));
    f.onsubmit = async ev => {
      ev.preventDefault(); m.textContent = S('p_a_entrar'); m.className = 'prof-aviso';
      try {
        const j = await T.pedido('prof/entrar', { email: email.value, password: pw.value });
        SS = { token: j.token, nome: j.nome, email: j.email, admin: j.admin }; guardar();
        j.must_change_password ? ecraConta(true) : ecraTurmas();
      } catch (e) { m.textContent = semRede(e); }
    };
    c.append(f); setTimeout(() => email.focus(), 50);
  }
  function ecraConta(obrigatorio) {
    topo();
    const c = corpo();
    const atual = h('input', { type: 'password', autocomplete: 'current-password' });
    const n1 = h('input', { type: 'password', autocomplete: 'new-password', minlength: 8, required: true });
    const n2 = h('input', { type: 'password', autocomplete: 'new-password', minlength: 8, required: true });
    const m = aviso(obrigatorio === true ? S('p_primeiro') : '');
    const f = h('form', { class: 'prof-cartao prof-login' }, h('h1', null, S('p_mudar_pw')),
      obrigatorio === true ? null : h('label', null, S('p_pw_atual'), atual),
      h('label', null, S('p_pw_nova'), n1), h('label', null, S('p_pw_repete'), n2),
      h('button', { class: 'btn btn-escuro', type: 'submit' }, S('p_guardar')), m,
      obrigatorio === true ? null : h('button', { class: 'btn btn-texto', type: 'button', onclick: ecraTurmas }, S('p_voltar_seta')));
    f.onsubmit = async ev => {
      ev.preventDefault();
      if (n1.value !== n2.value) { m.textContent = S('p_pw_diferentes'); return; }
      try { await api('prof/password', { atual: atual.value, nova: n1.value }); ecraTurmas(); }
      catch (e) { m.textContent = semRede(e); }
    };
    c.append(f);
  }

  // ------------------------------------------------------------ turmas
  async function ecraTurmas() {
    topo();
    const c = corpo();
    c.append(h('p', { class: 'prof-carregar' }, S('p_a_carregar_turmas')));
    let j; try { j = await api('prof/turmas'); } catch (e) { if (e.status === 403) return ecraConta(true); c.innerHTML = ''; c.append(aviso(semRede(e), 'erro')); return; }
    c.innerHTML = '';
    const nome = h('input', { placeholder: S('p_turma_ex'), maxlength: 60, required: true, 'aria-label': S('p_nova_turma') });
    const m = aviso('');
    const f = h('form', { class: 'prof-linha' }, nome, h('button', { class: 'btn btn-escuro', type: 'submit' }, S('p_nova_turma')));
    f.onsubmit = async ev => { ev.preventDefault(); try { const r = await api('prof/turma/criar', { nome: nome.value }); ecraTurma(r.id); } catch (e) { m.textContent = semRede(e); } };
    c.append(h('h1', null, S('p_minhas')), f, m);
    const ativas = j.turmas.filter(t => !+t.arquivada), arq = j.turmas.filter(t => +t.arquivada);
    const lista = ts => h('div', { class: 'prof-turmas' }, ts.map(t => h('button', { class: 'prof-turma' + (+t.arquivada ? ' arquivada' : ''), type: 'button', onclick: () => ecraTurma(t.id), title: S('p_ver_turma') },
      h('strong', null, t.nome), h('span', { class: 'prof-codigo' }, t.codigo),
      h('span', { class: 'prof-sub' }, (+t.n_alunos === 1 ? S('p_n_aluno') : S('p_n_alunos', { n: t.n_alunos })) + (SS.admin ? ' · ' + t.professor : '')))));
    if (!j.turmas.length) c.append(h('p', { class: 'prof-sub' }, S('p_sem_turmas')));
    if (ativas.length) c.append(lista(ativas));
    if (arq.length) c.append(h('h2', null, S('p_arquivadas')), lista(arq));
    c.append(h('p', { class: 'prof-sub prof-nota' }, S('p_privacidade'), ' ', h('a', { href: 'educadores.html' }, S('p_guia'))));
  }

  async function ecraTurma(id) {
    topo();
    const c = corpo();
    c.append(h('p', { class: 'prof-carregar' }, S('p_a_carregar_turma')));
    let j; try { j = await api('prof/turma&id=' + id); } catch (e) { c.innerHTML = ''; c.append(aviso(semRede(e), 'erro')); return; }
    const t = j.turma, alunos = j.alunos;
    c.innerHTML = '';
    c.append(h('button', { class: 'btn btn-texto', type: 'button', onclick: ecraTurmas }, S('p_turmas_seta')));
    c.append(h('div', { class: 'prof-cabeca' },
      h('div', null, h('h1', null, t.nome), h('p', { class: 'prof-sub' }, S('p_codigo_dica') + ' ', h('strong', { class: 'prof-codigo grande' }, t.codigo))),
      h('div', { class: 'prof-acoes' },
        h('button', { class: 'btn btn-escuro', type: 'button', onclick: () => imprimir(t, alunos), disabled: !alunos.length }, S('p_imprimir')),
        h('button', { class: 'btn btn-claro', type: 'button', onclick: async () => { const n = prompt(S('p_novo_nome_turma'), t.nome); if (n) { await api('prof/turma/editar', { id: t.id, nome: n }); ecraTurma(t.id); } } }, S('p_mudar_nome')),
        h('button', { class: 'btn btn-claro', type: 'button', onclick: async () => { await api('prof/turma/editar', { id: t.id, arquivada: !t.arquivada }); ecraTurma(t.id); } }, S(t.arquivada ? 'p_reativar' : 'p_arquivar')),
        h('button', { class: 'btn btn-claro perigo', type: 'button', onclick: async () => {
          const c2 = prompt(S('p_apagar_conf', { c: t.codigo }));
          if (c2) { try { await api('prof/turma/apagar', { id: t.id, confirmar: c2 }); ecraTurmas(); } catch (e) { alert(e.message); } }
        } }, S('p_apagar_turma')))));

    // juntar alunos
    const ta = h('textarea', { rows: 4, placeholder: S('p_nomes_ph'), 'aria-label': S('p_juntar') });
    const m = aviso('');
    const f = h('form', { class: 'prof-juntar' }, h('h2', null, S('p_juntar')), ta, h('button', { class: 'btn btn-escuro', type: 'submit' }, S('p_juntar_btn')), m);
    f.onsubmit = async ev => {
      ev.preventDefault();
      const nomes = ta.value.split(/\n|,|;/).map(s => s.trim()).filter(Boolean);
      if (!nomes.length) return;
      try { await api('prof/alunos/criar', { turma: t.id, nomes }); ecraTurma(t.id); } catch (e) { m.textContent = semRede(e); }
    };

    // progresso: alunos × missões do IC (o resumo diz a que missão pertence cada chave; o que é do Nico fica numa coluna à parte)
    alunos.forEach(a => {
      a.porMissao = {}; a.nico = false;
      Object.entries(a.progresso || {}).forEach(([chave, r]) => {
        if (!chave.startsWith('iclab.')) { a.nico = true; return; }
        if (r && r.missao) a.porMissao[r.missao] = r;
      });
    });
    const usadas = MISSOES.filter(([mid]) => alunos.some(a => a.porMissao[mid]));
    const colNico = alunos.some(a => a.nico);
    const tabela = h('table', { class: 'prof-tabela' },
      h('thead', null, h('tr', null, h('th', null, S('p_aluno')), h('th', null, S('p_senha')), usadas.map(([, nm]) => h('th', null, nm)),
        colNico ? h('th', null, S('p_nico')) : null, h('th', null, S('p_ultima')), h('th', null, ''))),
      h('tbody', null, alunos.map(a => h('tr', null,
        h('td', { class: 'prof-aluno' }, h('span', { class: 'turma-avatar' }, avatar(a.avatar)), a.nome),
        h('td', { class: 'prof-senha', title: a.senha.map(i => T.SENHA[i][1]).join(' · ') }, a.senha.map(i => T.SENHA[i][0]).join(' ')),
        usadas.map(([mid, nm]) => {
          const r = a.porMissao[mid];
          if (!r) return h('td', { class: 'prof-vazio' }, '—');
          if (mid === 'livre') return h('td', null, S('p_usou'));
          const tot = r.total || 0, pc = tot ? Math.round(100 * Math.min(r.feitos, tot) / tot) : 0;
          return h('td', { title: nm + ': ' + S('p_de', { a: r.feitos, b: tot }) }, h('span', { class: 'prof-num' }, r.feitos + '/' + tot), h('span', { class: 'prof-barra', role: 'img', 'aria-label': pc + '%' }, h('i', { style: 'width:' + pc + '%' })));
        }),
        colNico ? h('td', { class: a.nico ? '' : 'prof-vazio' }, a.nico ? '✓' : '—') : null,
        h('td', { class: 'prof-sub' }, quando(a.visto)),
        h('td', { class: 'prof-menu' },
          h('button', { class: 'btn-mini', type: 'button', title: S('p_nova_senha_t'), onclick: async () => { if (confirm(S('p_nova_senha_conf', { n: a.nome }))) { await api('prof/aluno/editar', { id: a.id, nova_senha: true }); ecraTurma(t.id); } } }, S('p_nova_senha')),
          h('button', { class: 'btn-mini', type: 'button', title: S('p_nome_t'), onclick: async () => { const n = prompt(S('p_nome_p'), a.nome); if (n) { await api('prof/aluno/editar', { id: a.id, nome: n }); ecraTurma(t.id); } } }, S('p_nome')),
          h('button', { class: 'btn-mini', type: 'button', title: S('p_recomecar_t'), onclick: async () => { if (confirm(S('p_recomecar_conf', { n: a.nome }))) { await api('prof/aluno/editar', { id: a.id, recomecar: true }); ecraTurma(t.id); } } }, S('p_recomecar')),
          h('button', { class: 'btn-mini perigo', type: 'button', title: S('p_apagar_t'), onclick: async () => { if (confirm(S('p_apagar_aluno_conf', { n: a.nome }))) { await api('prof/aluno/apagar', { id: a.id }); ecraTurma(t.id); } } }, S('p_apagar')))))));
    c.append(h('h2', null, S('p_progresso')), alunos.length ? h('div', { class: 'prof-tabela-caixa' }, tabela) : h('p', { class: 'prof-sub' }, S('p_sem_alunos')), f);
  }

  // ------------------------------------------------------------ cartões para imprimir (recortar e dar a cada aluno)
  function imprimir(t, alunos) {
    const cx = $('cartoes'); cx.innerHTML = '';
    alunos.forEach(a => cx.append(h('div', { class: 'cartao-aluno' },
      h('div', { class: 'ca-topo' }, h('span', { class: 'ca-avatar' }, avatar(a.avatar)), h('strong', null, a.nome)),
      h('div', { class: 'ca-linha' }, S('p_cartao_turma') + ' ', h('b', null, t.codigo), h('small', null, ' · ' + t.nome)),
      h('div', { class: 'ca-senha' }, a.senha.map(i => h('span', { title: T.SENHA[i][1] }, T.SENHA[i][0]))),
      h('div', { class: 'ca-pe' }, h('img', { src: 'img/ic_symbol.svg', alt: '' }), S('p_cartao_pe', { url: enderecoLab() })))));
    document.body.classList.add('a-imprimir');
    setTimeout(() => { window.print(); document.body.classList.remove('a-imprimir'); }, 300);
  }

  // ------------------------------------------------------------ administrador: professores
  async function ecraProfessores() {
    topo();
    const c = corpo();
    let j; try { j = await api('admin/profs'); } catch (e) { c.append(aviso(semRede(e), 'erro')); return; }
    const email = h('input', { type: 'email', placeholder: S('p_email_prof'), required: true });
    const nome = h('input', { placeholder: S('p_nome'), required: true, maxlength: 60 });
    const m = aviso('');
    const f = h('form', { class: 'prof-linha' }, nome, email, h('button', { class: 'btn btn-escuro', type: 'submit' }, S('p_criar_conta')));
    f.onsubmit = async ev => {
      ev.preventDefault();
      try {
        const r = await api('admin/prof/criar', { email: email.value, nome: nome.value, plataforma: 'ic', lingua: F.LANG });
        m.className = 'prof-aviso ok';
        m.textContent = S('p_conta_criada', { p: r.password_temporaria }) + S(r.email_enviado ? 'p_email_ok' : 'p_email_nao');
        email.value = nome.value = '';
        setTimeout(ecraProfessores, 30000);
      } catch (e) { m.className = 'prof-aviso'; m.textContent = semRede(e); }
    };
    c.append(h('button', { class: 'btn btn-texto', type: 'button', onclick: ecraTurmas }, S('p_turmas_seta')), h('h1', null, S('p_professores')), f, m,
      h('table', { class: 'prof-tabela' }, h('thead', null, h('tr', null, h('th', null, S('p_nome')), h('th', null, S('p_email')), h('th', null, S('p_turmas_col')), h('th', null, ''))),
        h('tbody', null, j.profs.map(p => h('tr', null, h('td', null, p.nome + (+p.admin ? ' (admin)' : '')), h('td', null, p.email), h('td', null, p.n_turmas),
          h('td', null, p.email === SS.email ? '' : h('button', { class: 'btn-mini perigo', type: 'button', onclick: async () => {
            if (confirm(S('p_apagar_prof_conf', { n: p.nome }))) { await api('admin/prof/apagar', { id: p.id }); ecraProfessores(); }
          } }, S('p_apagar'))))))));
  }

  // ------------------------------------------------------------ arranque
  F.aplicarI18n && F.aplicarI18n();
  document.title = S('p_area') + ' · ' + S('lab_titulo');
  (async () => {
    if (!SS) return ecraEntrar();
    try { const eu = await api('prof/eu'); SS.nome = eu.nome; SS.admin = eu.admin; guardar(); eu.must_change_password ? ecraConta(true) : ecraTurmas(); }
    catch (e) { if (SS) { corpo().append(aviso(semRede(e), 'erro')); } }
  })();
})();
