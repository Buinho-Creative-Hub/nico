/* Nico — área do professor: turmas, alunos (alcunha + senha de imagens), cartões para imprimir e progresso.
 * Fala com a API das turmas (servidor/api). Só nomes próprios ou alcunhas — nada de apelidos, datas ou fotos.
 */
(function () {
  'use strict';
  const T = window.Faisca.Turma;
  const $ = id => document.getElementById(id);
  const K = 'nico.prof.sessao';
  const MISSOES = [['palco', 'Palco (Missão 0)'], ['primeiros-passos', 'Primeiros passos'], ['reparar', 'Reparar'], ['toy-hacking', 'Toy hacking'],
    ['citizen-sensing', 'Citizen sensing'], ['matematica', 'Matemática'], ['natureza', 'Natureza'], ['livre', 'Modo livre']];

  let S = null; try { S = JSON.parse(localStorage.getItem(K)); } catch (e) { S = null; }
  const guardar = () => { try { S ? localStorage.setItem(K, JSON.stringify(S)) : localStorage.removeItem(K); } catch (e) { /* idem */ } };
  const api = (rota, corpo) => T.pedido(rota, corpo || null, S && S.token).catch(e => {
    if (e.status === 401 && S) { S = null; guardar(); ecraEntrar('A sessão terminou. Entra outra vez.'); }
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
  const aviso = (txt, tipo) => h('p', { class: 'prof-aviso ' + (tipo || '') }, txt);
  const avatar = n => T.AVATARES[n % T.AVATARES.length];
  const quando = s => { if (!s) return 'nunca entrou'; const d = new Date(s.replace(' ', 'T') + 'Z'); return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }); };

  function topo() {
    const q = $('quem'); q.innerHTML = '';
    if (!S) return;
    q.append(h('span', null, S.nome || S.email));
    if (S.admin) q.append(h('button', { class: 'btn btn-claro', type: 'button', onclick: ecraProfessores }, 'Professores'));
    q.append(h('button', { class: 'btn btn-claro', type: 'button', onclick: ecraConta }, 'Password'));
    q.append(h('button', { class: 'btn btn-claro', type: 'button', onclick: async () => { try { await api('prof/sair', {}); } catch (e) { /* segue */ } S = null; guardar(); topo(); ecraEntrar(); } }, 'Sair'));
  }

  // ------------------------------------------------------------ entrar / password
  function ecraEntrar(msg) {
    topo();
    const c = corpo();
    const email = h('input', { type: 'email', required: true, autocomplete: 'username', placeholder: 'email' });
    const pw = h('input', { type: 'password', required: true, autocomplete: 'current-password', placeholder: 'password' });
    const m = aviso(msg || '');
    const f = h('form', { class: 'prof-cartao prof-login' },
      h('h1', null, 'Área do professor'),
      h('p', { class: 'prof-sub' }, 'Turmas, alunos e progresso no Nico.'),
      h('label', null, 'Email', email), h('label', null, 'Password', pw),
      h('button', { class: 'btn btn-escuro', type: 'submit' }, 'Entrar'), m,
      h('button', { class: 'btn btn-texto', type: 'button', onclick: async () => {
        if (!email.value) { m.textContent = 'Escreve primeiro o teu email.'; return; }
        try { const j = await T.pedido('prof/esqueci', { email: email.value }); m.textContent = j.mensagem; m.className = 'prof-aviso ok'; }
        catch (e) { m.textContent = e.message; }
      } }, 'Esqueci-me da password'));
    f.onsubmit = async ev => {
      ev.preventDefault(); m.textContent = 'A entrar…'; m.className = 'prof-aviso';
      try {
        const j = await T.pedido('prof/entrar', { email: email.value, password: pw.value });
        S = { token: j.token, nome: j.nome, email: j.email, admin: j.admin }; guardar();
        j.must_change_password ? ecraConta(true) : ecraTurmas();
      } catch (e) { m.textContent = e.offline ? 'Sem ligação à internet: a área do professor precisa de rede.' : e.message; }
    };
    c.append(f); setTimeout(() => email.focus(), 50);
  }
  function ecraConta(obrigatorio) {
    topo();
    const c = corpo();
    const atual = h('input', { type: 'password', autocomplete: 'current-password' });
    const n1 = h('input', { type: 'password', autocomplete: 'new-password', minlength: 8, required: true });
    const n2 = h('input', { type: 'password', autocomplete: 'new-password', minlength: 8, required: true });
    const m = aviso(obrigatorio === true ? 'Primeiro acesso: escolhe uma password nova (mínimo 8 caracteres).' : '');
    const f = h('form', { class: 'prof-cartao prof-login' }, h('h1', null, 'Mudar a password'),
      obrigatorio === true ? null : h('label', null, 'Password atual', atual),
      h('label', null, 'Password nova', n1), h('label', null, 'Repete a password nova', n2),
      h('button', { class: 'btn btn-escuro', type: 'submit' }, 'Guardar'), m,
      obrigatorio === true ? null : h('button', { class: 'btn btn-texto', type: 'button', onclick: ecraTurmas }, '← Voltar'));
    f.onsubmit = async ev => {
      ev.preventDefault();
      if (n1.value !== n2.value) { m.textContent = 'As duas passwords novas não são iguais.'; return; }
      try { await api('prof/password', { atual: atual.value, nova: n1.value }); ecraTurmas(); }
      catch (e) { m.textContent = e.message; }
    };
    c.append(f);
  }

  // ------------------------------------------------------------ turmas
  async function ecraTurmas() {
    topo();
    const c = corpo();
    c.append(h('p', { class: 'prof-carregar' }, 'A carregar as turmas…'));
    let j; try { j = await api('prof/turmas'); } catch (e) { if (e.status === 403) return ecraConta(true); c.innerHTML = ''; c.append(aviso(e.message, 'erro')); return; }
    c.innerHTML = '';
    const nome = h('input', { placeholder: 'ex.: 4.º A – Colos', maxlength: 60, required: true });
    const m = aviso('');
    const f = h('form', { class: 'prof-linha' }, nome, h('button', { class: 'btn btn-escuro', type: 'submit' }, '+ Nova turma'));
    f.onsubmit = async ev => { ev.preventDefault(); try { const r = await api('prof/turma/criar', { nome: nome.value }); ecraTurma(r.id); } catch (e) { m.textContent = e.message; } };
    c.append(h('h1', null, 'As minhas turmas'), f, m);
    const ativas = j.turmas.filter(t => !+t.arquivada), arq = j.turmas.filter(t => +t.arquivada);
    const lista = ts => h('div', { class: 'prof-turmas' }, ts.map(t => h('button', { class: 'prof-turma' + (+t.arquivada ? ' arquivada' : ''), type: 'button', onclick: () => ecraTurma(t.id) },
      h('strong', null, t.nome), h('span', { class: 'prof-codigo' }, t.codigo),
      h('span', { class: 'prof-sub' }, t.n_alunos + ' aluno' + (+t.n_alunos === 1 ? '' : 's') + (S.admin ? ' · ' + t.professor : '')))));
    if (!j.turmas.length) c.append(h('p', { class: 'prof-sub' }, 'Ainda não tens turmas. Cria a primeira acima: o Nico dá-te um código de 4 letras para os alunos entrarem.'));
    if (ativas.length) c.append(lista(ativas));
    if (arq.length) c.append(h('h2', null, 'Arquivadas'), lista(arq));
  }

  async function ecraTurma(id) {
    topo();
    const c = corpo();
    c.append(h('p', { class: 'prof-carregar' }, 'A carregar a turma…'));
    let j; try { j = await api('prof/turma&id=' + id); } catch (e) { c.innerHTML = ''; c.append(aviso(e.message, 'erro')); return; }
    const t = j.turma, alunos = j.alunos;
    c.innerHTML = '';
    c.append(h('button', { class: 'btn btn-texto', type: 'button', onclick: ecraTurmas }, '← Turmas'));
    c.append(h('div', { class: 'prof-cabeca' },
      h('div', null, h('h1', null, t.nome), h('p', { class: 'prof-sub' }, 'Os alunos entram no Nico em «Entrar na turma» com o código ', h('strong', { class: 'prof-codigo grande' }, t.codigo))),
      h('div', { class: 'prof-acoes' },
        h('button', { class: 'btn btn-escuro', type: 'button', onclick: () => imprimir(t, alunos), disabled: !alunos.length }, 'Imprimir cartões'),
        h('button', { class: 'btn btn-claro', type: 'button', onclick: async () => { const n = prompt('Novo nome da turma:', t.nome); if (n) { await api('prof/turma/editar', { id: t.id, nome: n }); ecraTurma(t.id); } } }, 'Mudar nome'),
        h('button', { class: 'btn btn-claro', type: 'button', onclick: async () => { await api('prof/turma/editar', { id: t.id, arquivada: !t.arquivada }); ecraTurma(t.id); } }, t.arquivada ? 'Reativar' : 'Arquivar'),
        h('button', { class: 'btn btn-claro perigo', type: 'button', onclick: async () => {
          const c2 = prompt('Apagar a turma e todo o progresso dos alunos? Não dá para desfazer.\nEscreve o código da turma (' + t.codigo + ') para confirmar:');
          if (c2) { try { await api('prof/turma/apagar', { id: t.id, confirmar: c2 }); ecraTurmas(); } catch (e) { alert(e.message); } }
        } }, 'Apagar turma'))));

    // juntar alunos
    const ta = h('textarea', { rows: 4, placeholder: 'Um nome por linha (só o primeiro nome ou uma alcunha)\nMaria\nJoão\nInês' });
    const m = aviso('');
    const f = h('form', { class: 'prof-juntar' }, h('h2', null, 'Juntar alunos'), ta, h('button', { class: 'btn btn-escuro', type: 'submit' }, 'Juntar'), m);
    f.onsubmit = async ev => {
      ev.preventDefault();
      const nomes = ta.value.split(/\n|,|;/).map(s => s.trim()).filter(Boolean);
      if (!nomes.length) return;
      try { await api('prof/alunos/criar', { turma: t.id, nomes }); ecraTurma(t.id); } catch (e) { m.textContent = e.message; }
    };

    // progresso: alunos × missões
    // progresso de cada aluno por missão (o resumo diz a que missão pertence cada chave)
    alunos.forEach(a => { a.porMissao = {}; Object.values(a.progresso || {}).forEach(r => { if (r && r.missao) a.porMissao[r.missao] = r; }); });
    const usadas = MISSOES.filter(([mid]) => alunos.some(a => a.porMissao[mid]));
    const tabela = h('table', { class: 'prof-tabela' },
      h('thead', null, h('tr', null, h('th', null, 'Aluno'), h('th', null, 'Senha'), usadas.map(([, nm]) => h('th', null, nm)), h('th', null, 'Última vez'), h('th', null, ''))),
      h('tbody', null, alunos.map(a => h('tr', null,
        h('td', { class: 'prof-aluno' }, h('span', { class: 'turma-avatar' }, avatar(a.avatar)), a.nome),
        h('td', { class: 'prof-senha', title: a.senha.map(i => T.SENHA[i][1]).join(' · ') }, a.senha.map(i => T.SENHA[i][0]).join(' ')),
        usadas.map(([mid]) => {
          const r = a.porMissao[mid];
          if (!r) return h('td', { class: 'prof-vazio' }, '—');
          if (mid === 'livre') return h('td', null, '✓ usou');
          const tot = r.total || 0, pc = tot ? Math.round(100 * Math.min(r.feitos, tot) / tot) : 0;
          return h('td', { title: (r.titulo || mid) + ': ' + r.feitos + ' de ' + tot }, h('span', { class: 'prof-num' }, r.feitos + '/' + tot), h('span', { class: 'prof-barra' }, h('i', { style: 'width:' + pc + '%' })));
        }),
        h('td', { class: 'prof-sub' }, quando(a.visto)),
        h('td', { class: 'prof-menu' },
          h('button', { class: 'btn-mini', type: 'button', title: 'Nova senha de imagens', onclick: async () => { if (confirm('Dar uma senha nova a ' + a.nome + '?')) { await api('prof/aluno/editar', { id: a.id, nova_senha: true }); ecraTurma(t.id); } } }, 'nova senha'),
          h('button', { class: 'btn-mini', type: 'button', title: 'Mudar o nome', onclick: async () => { const n = prompt('Nome:', a.nome); if (n) { await api('prof/aluno/editar', { id: a.id, nome: n }); ecraTurma(t.id); } } }, 'nome'),
          h('button', { class: 'btn-mini', type: 'button', title: 'Apagar o progresso deste aluno', onclick: async () => { if (confirm('Apagar todo o progresso de ' + a.nome + '? O aluno recomeça do zero.')) { await api('prof/aluno/editar', { id: a.id, recomecar: true }); ecraTurma(t.id); } } }, 'recomeçar'),
          h('button', { class: 'btn-mini perigo', type: 'button', title: 'Tirar da turma', onclick: async () => { if (confirm('Tirar ' + a.nome + ' da turma? Apaga também o progresso.')) { await api('prof/aluno/apagar', { id: a.id }); ecraTurma(t.id); } } }, 'apagar'))))));
    c.append(h('h2', null, 'Progresso'), alunos.length ? h('div', { class: 'prof-tabela-caixa' }, tabela) : h('p', { class: 'prof-sub' }, 'Junta os alunos abaixo. Cada um recebe um animal e uma senha de 3 imagens.'), f);
  }

  // ------------------------------------------------------------ cartões para imprimir (recortar e dar a cada aluno)
  function imprimir(t, alunos) {
    const cx = $('cartoes'); cx.innerHTML = '';
    alunos.forEach(a => cx.append(h('div', { class: 'cartao-aluno' },
      h('div', { class: 'ca-topo' }, h('span', { class: 'ca-avatar' }, avatar(a.avatar)), h('strong', null, a.nome)),
      h('div', { class: 'ca-linha' }, 'Turma: ', h('b', null, t.codigo), h('small', null, ' · ' + t.nome)),
      h('div', { class: 'ca-senha' }, a.senha.map(i => h('span', null, T.SENHA[i][0]))),
      h('div', { class: 'ca-pe' }, 'nico.buinho.pt → Entrar na turma'))));
    document.body.classList.add('a-imprimir');
    setTimeout(() => { window.print(); document.body.classList.remove('a-imprimir'); }, 300);
  }

  // ------------------------------------------------------------ administrador: professores
  async function ecraProfessores() {
    topo();
    const c = corpo();
    let j; try { j = await api('admin/profs'); } catch (e) { c.append(aviso(e.message, 'erro')); return; }
    const email = h('input', { type: 'email', placeholder: 'email do professor', required: true });
    const nome = h('input', { placeholder: 'nome', required: true, maxlength: 60 });
    const m = aviso('');
    const f = h('form', { class: 'prof-linha' }, nome, email, h('button', { class: 'btn btn-escuro', type: 'submit' }, '+ Criar conta'));
    f.onsubmit = async ev => {
      ev.preventDefault();
      try {
        const r = await api('admin/prof/criar', { email: email.value, nome: nome.value });
        m.className = 'prof-aviso ok';
        m.textContent = 'Conta criada. Password temporária: ' + r.password_temporaria + (r.email_enviado ? ' (enviada também por email)' : ' — o email não seguiu: passa-lhe esta password.');
        email.value = nome.value = '';
        setTimeout(ecraProfessores, 30000);
      } catch (e) { m.className = 'prof-aviso'; m.textContent = e.message; }
    };
    c.append(h('button', { class: 'btn btn-texto', type: 'button', onclick: ecraTurmas }, '← Turmas'), h('h1', null, 'Professores'), f, m,
      h('table', { class: 'prof-tabela' }, h('thead', null, h('tr', null, h('th', null, 'Nome'), h('th', null, 'Email'), h('th', null, 'Turmas'), h('th', null, ''))),
        h('tbody', null, j.profs.map(p => h('tr', null, h('td', null, p.nome + (+p.admin ? ' (admin)' : '')), h('td', null, p.email), h('td', null, p.n_turmas),
          h('td', null, p.email === S.email ? '' : h('button', { class: 'btn-mini perigo', type: 'button', onclick: async () => {
            if (confirm('Apagar a conta de ' + p.nome + '? As turmas dele também são apagadas.')) { await api('admin/prof/apagar', { id: p.id }); ecraProfessores(); }
          } }, 'apagar')))))));
  }

  // ------------------------------------------------------------ arranque
  (async () => {
    if (!S) return ecraEntrar();
    try { const eu = await api('prof/eu'); S.nome = eu.nome; S.admin = eu.admin; guardar(); eu.must_change_password ? ecraConta(true) : ecraTurmas(); }
    catch (e) { if (S) { corpo().append(aviso(e.offline ? 'Sem ligação à internet: a área do professor precisa de rede.' : e.message, 'erro')); } }
  })();
})();
