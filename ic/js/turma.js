/* IC Sensing Lab (motor do Nico) — turmas: o aluno entra com o código da turma + o seu nome + a senha de imagens.
 * Usa a mesma API das turmas do Nico (nico-api.buinho.pt): um professor tem as turmas das duas plataformas na mesma conta.
 * As chaves locais têm prefixo próprio (iclab.*) para não se misturarem com as do Nico (mesmo domínio, nico.buinho.pt).
 * O progresso fica guardado por aluno (no browser, com um prefixo próprio) e é enviado para a API das turmas
 * (servidor/api, no Webtuga). Sem internet tudo continua a funcionar: o que muda fica «pendente» e segue
 * quando a ligação voltar. Sem turma, o Nico funciona como sempre (progresso do computador).
 *
 *   F.Turma.prefixo()     prefixo das chaves do aluno ('' sem sessão) — usado por F.chaveMissao
 *   F.Turma.mudou(chave)  avisa que uma chave (completa) mudou → sincroniza
 *   F.Turma.abrirEntrada() / F.Turma.sair()
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};

  const AVATARES = ['🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐧', '🐢', '🐙', '🦉', '🐝', '🦋', '🐬', '🦔'];
  const EMO = ['🍎', '🌙', '⭐', '🐟', '🌻', '🚲', '🎈', '🍕', '⚽'];
  const SENHA = EMO.map((e, i) => [e, F.s ? F.s('t_s' + i) : e]);
  const S = (k, v) => F.s(k, v);
  const K_SESSAO = 'iclab.turma.sessao', K_PENDENTE = 'iclab.turma.pendente', K_API = 'nico.api';
  const DURACAO = 10 * 3600 * 1000;           // a sessão acaba sozinha ao fim de 10 h (computadores partilhados)

  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* idem */ } },
    json(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } },
    chaves() { try { return Object.keys(localStorage); } catch (e) { return []; } },
  };
  const API = () => ls.get(K_API) || 'https://nico-api.buinho.pt/';

  async function pedido(rota, corpo, token) {
    const op = { method: corpo ? 'POST' : 'GET', headers: {} };
    if (corpo) { op.headers['Content-Type'] = 'application/json'; op.body = JSON.stringify(corpo); }
    if (token) op.headers.Authorization = 'Bearer ' + token;
    let r;
    try { r = await fetch(API() + '?r=' + rota, op); } catch (e) { const x = new Error(S('t_sem_ligacao')); x.offline = true; throw x; }
    let j = {}; try { j = await r.json(); } catch (e) { /* resposta vazia */ }
    if (!r.ok) { const x = new Error(F.erroTurma(j.erro || '') || S('t_erro_n', { n: r.status })); x.status = r.status; throw x; }
    return j;
  }

  // ------------------------------------------------------------ sessão
  function sessao() {
    const s = ls.json(K_SESSAO, null);
    if (!s || !s.token) return null;
    if (Date.now() - (s.desde || 0) > DURACAO) { limparLocal(s); return null; }
    return s;
  }
  const prefixoDe = s => s ? 'iclab.aluno.' + s.turma.codigo + '.' + s.aluno.id + '.' : '';
  function limparLocal(s) {
    const p = prefixoDe(s);
    if (p) ls.chaves().filter(k => k.startsWith(p)).forEach(k => ls.del(k));
    ls.del(K_SESSAO); ls.del(K_PENDENTE);
  }

  // ------------------------------------------------------------ sincronização
  function resumo(chave) {
    // a chave de cada missão é a do F.chaveMissao sem prefixo (algumas missões têm chave própria, ex.: faisca.desafios.v1)
    const X = Object.values(F.MISSOES || {}).find(m => (m.chave || ('iclab.missao.' + m.id + '.v1')) === chave);
    const d = ls.json(prefixoDe(sessao()) + chave, {});
    const r = { feitos: d.feitos || 0, plataforma: 'ic' };
    if (X) { r.titulo = X.titulo; r.missao = X.id; try { r.total = F.desafiosDe(X).length; } catch (e) { /* missão sem desafios */ } }
    return r;
  }
  let espera = null;
  function mudou(chaveCompleta) {
    const s = sessao(); if (!s) return;
    const p = prefixoDe(s); if (!chaveCompleta.startsWith(p)) return;
    const pend = ls.json(K_PENDENTE, []);
    const chave = chaveCompleta.slice(p.length);
    if (!pend.includes(chave)) { pend.push(chave); ls.set(K_PENDENTE, JSON.stringify(pend)); }
    clearTimeout(espera); espera = setTimeout(empurrar, 1500);
    estado();
  }
  let aEnviar = false;
  async function empurrar() {
    const s = sessao(); if (!s || aEnviar) return;
    const pend = ls.json(K_PENDENTE, []); if (!pend.length) return;
    aEnviar = true;
    const p = prefixoDe(s);
    const itens = pend.map(chave => ({ chave, dados: ls.json(p + chave, null), resumo: resumo(chave) }));
    try {
      await pedido('aluno/progresso', { itens }, s.token);
      const agora = ls.json(K_PENDENTE, []).filter(c => !pend.includes(c));   // o que mudou entretanto fica
      ls.set(K_PENDENTE, JSON.stringify(agora));
    } catch (e) {
      if (e.status === 401) { limparLocal(s); location.reload(); }
    } finally { aEnviar = false; estado(); }
  }
  // traz o que o aluno fez noutros computadores (fica o que tiver mais desafios feitos)
  async function puxar() {
    const s = sessao(); if (!s) return false;
    const p = prefixoDe(s), pend = ls.json(K_PENDENTE, []);
    const j = await pedido('aluno/progresso', null, s.token);
    let mudouAlgo = false;
    Object.entries(j.itens || {}).forEach(([chave, it]) => {
      if (!chave.startsWith('iclab.')) return;            // o que o aluno fez no Nico fica no Nico
      const local = ls.json(p + chave, null), srv = it.dados;
      if (!srv) return;
      const usar = !local || (srv.feitos || 0) > (local.feitos || 0) || ((srv.feitos || 0) === (local.feitos || 0) && !pend.includes(chave));
      if (usar && JSON.stringify(local) !== JSON.stringify(srv)) { ls.set(p + chave, JSON.stringify(srv)); mudouAlgo = true; }
    });
    return mudouAlgo;
  }

  // ------------------------------------------------------------ entrar / sair
  async function sair() {
    const s = sessao();
    if (s) {
      await empurrar();
      try { await pedido('aluno/sair', {}, s.token); } catch (e) { /* sem rede: a sessão expira sozinha */ }
      limparLocal(s);
    }
    location.href = 'index.html';
  }

  function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function abrirEntrada() {
    const fundo = el('div', 'turma-fundo');
    const caixa = el('div', 'turma-caixa'); caixa.setAttribute('role', 'dialog'); caixa.setAttribute('aria-modal', 'true');
    const fechar = el('button', 'turma-fechar', '×'); fechar.type = 'button'; fechar.setAttribute('aria-label', S('t_fechar'));
    const corpo = el('div', 'turma-corpo');
    caixa.append(fechar, corpo); fundo.appendChild(caixa); document.body.appendChild(fundo);
    const fecharTudo = () => fundo.remove();
    fechar.onclick = fecharTudo;
    fundo.addEventListener('click', e => { if (e.target === fundo) fecharTudo(); });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { fecharTudo(); document.removeEventListener('keydown', esc); } });

    let turma = null, alunos = [], aluno = null;
    const msg = el('p', 'turma-msg');

    function passoCodigo(erro) {
      corpo.innerHTML = '';
      corpo.append(el('h2', null, S('t_entrar')), el('p', 'turma-dica', S('t_codigo_dica')));
      const f = el('form', 'turma-form');
      const inp = el('input', 'turma-codigo'); inp.maxLength = 6; inp.autocomplete = 'off'; inp.spellcheck = false; inp.placeholder = 'ABCD';
      inp.setAttribute('aria-label', S('t_codigo_aria'));
      const b = el('button', 'btn btn-escuro', S('t_continuar')); b.type = 'submit';
      f.append(inp, b); corpo.append(f, msg);
      msg.textContent = erro || '';
      setTimeout(() => inp.focus(), 50);
      f.onsubmit = async ev => {
        ev.preventDefault();
        const cod = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (cod.length < 4) { msg.textContent = S('t_codigo_curto'); return; }
        b.disabled = true; msg.textContent = S('t_procurar');
        try { const j = await pedido('turma/alunos', { codigo: cod }); turma = j.turma; alunos = j.alunos; passoNome(); }
        catch (e) { b.disabled = false; msg.textContent = e.offline ? S('t_offline_entrar') : e.message; }
      };
    }
    function passoNome() {
      corpo.innerHTML = '';
      corpo.append(el('h2', null, turma.nome), el('p', 'turma-dica', S('t_nome_dica')));
      const g = el('div', 'turma-nomes');
      alunos.forEach(a => {
        const b = el('button', 'turma-nome'); b.type = 'button';
        b.append(el('span', 'turma-avatar', AVATARES[a.avatar % AVATARES.length]), el('span', null, a.nome));
        b.onclick = () => { aluno = a; passoSenha(); };
        g.appendChild(b);
      });
      if (!alunos.length) g.append(el('p', 'turma-dica', S('t_sem_alunos')));
      const voltar = el('button', 'btn btn-texto', S('t_outro_codigo')); voltar.type = 'button'; voltar.onclick = () => passoCodigo();
      corpo.append(g, voltar);
    }
    function passoSenha() {
      corpo.innerHTML = '';
      const t = el('h2'); t.append(el('span', 'turma-avatar', AVATARES[aluno.avatar % AVATARES.length]), document.createTextNode(' ' + S('t_ola', { nome: aluno.nome })));
      corpo.append(t, el('p', 'turma-dica', S('t_senha_dica')));
      const slots = el('div', 'turma-slots'); const escolha = [];
      const pintar = () => { slots.innerHTML = ''; for (let i = 0; i < 3; i++) slots.appendChild(el('span', 'turma-slot' + (escolha[i] != null ? ' cheio' : ''), escolha[i] != null ? SENHA[escolha[i]][0] : '')); };
      pintar();
      const g = el('div', 'turma-imagens');
      SENHA.forEach(([emo, nome], i) => {
        const b = el('button', 'turma-imagem', emo); b.type = 'button'; b.setAttribute('aria-label', nome); b.title = nome;
        b.onclick = async () => {
          if (escolha.length >= 3) return;
          escolha.push(i); pintar();
          if (escolha.length === 3) {
            msg.textContent = S('t_a_entrar');
            try {
              const j = await pedido('aluno/entrar', { codigo: turma.codigo, aluno: aluno.id, senha: escolha });
              const antiga = sessao(); if (antiga) limparLocal(antiga);
              ls.set(K_SESSAO, JSON.stringify({ token: j.token, aluno: j.aluno, turma: j.turma, desde: Date.now() }));
              try { await puxar(); } catch (e) { /* segue sem o que está no servidor */ }
              location.reload();
            } catch (e) {
              msg.textContent = e.offline ? S('t_sem_net') : e.message;
              caixa.classList.remove('abanar'); void caixa.offsetWidth; caixa.classList.add('abanar');
              escolha.length = 0; setTimeout(pintar, 400);
            }
          }
        };
        g.appendChild(b);
      });
      const apagar = el('button', 'btn btn-texto', S('t_apagar')); apagar.type = 'button'; apagar.onclick = () => { escolha.length = 0; pintar(); msg.textContent = ''; };
      const voltar = el('button', 'btn btn-texto', S('t_nao_sou')); voltar.type = 'button'; voltar.onclick = passoNome;
      const linha = el('div', 'turma-linha'); linha.append(voltar, apagar);
      corpo.append(slots, g, msg, linha);
    }
    passoCodigo();
  }

  let verificacao = null;
  function servidorDisponivel() {
    if (!verificacao) {
      verificacao = (async () => {
        if (navigator.onLine === false) return false;
        const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 4000);
        try { const r = await fetch(API() + '?r=saude', { signal: ctl.signal }); return r.ok; } catch (e) { return false; } finally { clearTimeout(t); }
      })();
    }
    return verificacao;
  }

  // ------------------------------------------------------------ indicador no topo (entrar / aluno + sair)
  function estado() {
    const s = sessao();
    document.querySelectorAll('[data-turma]').forEach(caixa => {
      caixa.innerHTML = '';
      if (!s) {
        if (caixa.dataset.turma !== 'inicio') return;     // nas missões só aparece com sessão
        // o botão só aparece se o servidor das turmas responder (sem rede ou sem servidor, a plataforma segue como sempre)
        servidorDisponivel().then(ok => {
          if (!ok || caixa.querySelector('.turma-entrar') || sessao()) return;
          const b = el('button', 'btn btn-claro turma-entrar', S('t_entrar')); b.type = 'button'; b.onclick = abrirEntrada;
          caixa.appendChild(b);
        });
        return;
      }
      const pend = ls.json(K_PENDENTE, []).length;
      const chip = el('span', 'turma-chip');
      chip.title = s.turma.nome + ' · ' + S(pend ? 't_pendente' : 't_guardado');
      chip.append(el('span', 'turma-avatar', AVATARES[s.aluno.avatar % AVATARES.length]), el('span', 'turma-chip-nome', s.aluno.nome));
      if (pend) chip.append(el('span', 'turma-pend', '●'));
      const b = el('button', 'btn btn-claro turma-sair', S('t_sair')); b.type = 'button'; b.title = S('t_sair_dica');
      b.onclick = sair;
      caixa.append(chip, b);
    });
  }

  F.Turma = {
    AVATARES, SENHA, API, pedido,
    sessao, prefixo: () => prefixoDe(sessao()),
    mudou, empurrar, puxar, sair, abrirEntrada, estado,
  };

  window.addEventListener('online', empurrar);
  document.addEventListener('DOMContentLoaded', () => {
    estado();
    if (sessao()) { empurrar(); }
  });
})();
