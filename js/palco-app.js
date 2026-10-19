/* Nico · Palco — cola tudo na página do palco (Missão 0, sem micro:bit):
 * mascote + missão escolhidas, editor de blocos, palco com atores, motor, mascote tutora, caminho de desafios.
 * É uma versão enxuta de js/app.js: no lugar do micro:bit está o palco; não há «Enviar» nem Bluetooth.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const $ = id => document.getElementById(id);

  if (!F.MISSAO_ID || !F.MISSOES[F.MISSAO_ID] || !F.MISSOES[F.MISSAO_ID].pagina) {
    location.replace('index.html' + location.search);
    return;
  }
  F.ativar(F.MASCOTE_ID, F.MISSAO_ID);
  const M = F.MASCOTE, X = F.MISSAO;
  F.lembrarMascote(M.id);
  document.documentElement.setAttribute('data-mascote', M.id);
  document.body.classList.add('modo-palco');
  const CHAVE = F.chaveMissao(X);
  const params = new URLSearchParams(location.search);
  const N = F.DESAFIOS.length;

  // ------------------------------------------------------------ marca e mascote
  document.title = M.marca.nome + ' · ' + X.titulo;
  $('marcaIcone').innerHTML = M.marca.icone || '';
  $('marcaNome').textContent = M.marca.nome;
  $('marcaSub').textContent = X.titulo;
  $('btnMissoes').href = 'index.html?a=' + encodeURIComponent(M.id);
  $('tutor').setAttribute('aria-label', M.descricao);
  $('tutorNome').textContent = M.nome;
  $('tutorGambiarra').textContent = 'Ajudar ' + M.artigo + ' ' + M.nome;

  // ------------------------------------------------------------ estado guardado
  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } }
  function gravar() { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* sem armazenamento: segue */ } }
  const estado = Object.assign({ feitos: 0, atual: 0, xml: '' }, ler());
  if (params.has('todos')) estado.feitos = Math.max(estado.feitos, N - 1);   // modo professor
  const desbloqueado = i => i <= Math.min(estado.feitos, N - 1);
  if (estado.atual >= N) estado.atual = N - 1;
  if (!desbloqueado(estado.atual)) estado.atual = estado.feitos;

  // ------------------------------------------------------------ editor
  const ws = Blockly.inject('blocos', {
    renderer: 'makecode',
    theme: 'makecode',
    media: 'vendor/media/',
    toolbox: F.caixa(estado.atual),
    trashcan: true,
    sounds: false,
    zoom: { controls: true, wheel: false, startScale: 1, maxScale: 1.6, minScale: 0.6 },
    move: { scrollbars: true, drag: true, wheel: true },
  });
  let silencio = true;
  if (estado.xml) {
    try { Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(estado.xml), ws); } catch (e) { console.warn(e); }
  }
  setTimeout(() => { silencio = false; }, 0);

  let ultimoSom = 0;
  const somEditor = nome => { const t = performance.now(); if (t - ultimoSom > 80) { ultimoSom = t; F.Som.tocar(nome); } };
  ws.addChangeListener(ev => {
    if (silencio || ev.isUiEvent) return;
    const E = Blockly.Events;
    if (ev.type === E.BLOCK_MOVE && ev.newParentId && ev.newParentId !== ev.oldParentId) somEditor('encaixe');
    else if (ev.type === E.BLOCK_CREATE) somEditor('apanhar');
    else if (ev.type === E.BLOCK_DELETE) somEditor('apagar');
  });

  // ------------------------------------------------------------ palco e motor
  const palco = new F.Palco($('cena'));
  let registo = [];
  const motor = new F.PalcoMotor(ws, palco, (dir, v) => {
    registo.push({ t: performance.now(), dir, v });
    verificar();
  });

  // ------------------------------------------------------------ mascote (tutor)
  const tutorUI = new F.TutorUI(M);
  const tutor = new F.TutorMotor(m => { tutorUI.mostrar(m); F.Som.tocar(m.tipo === 'pista' ? 'ajuda' : 'voz'); });
  $('festaMascote').src = tutorUI.sprite('celebrar');
  $('festaMascote').alt = M.nome + ' a celebrar';
  let gambiarra = null;
  let sucessoEm = -Infinity;
  let falha = null;
  const analisar = () => tutor.programaMudou(F.analisar(ws));
  setInterval(() => tutor.tick(), 1000);

  // a cena volta ao princípio do desafio (atores nos sítios, cenário inicial)
  function repor() {
    motor.parar();
    palco.reset(F.DESAFIOS[estado.atual].palco || {});
    registo = [];
    motor.arrancar();
    botoesCorrer(false);
  }
  function botoesCorrer(aCorrer) {
    $('btnComecar').classList.toggle('a-correr', aCorrer);
    $('btnParar').disabled = !aCorrer;
  }
  // ▶ Começar: põe a cena no início e corre o programa
  function comecar() {
    F.audio && F.audio();
    repor();
    botoesCorrer(true);
    motor.acontecimento('comecar');
    if (F.DESAFIOS[estado.atual].livre) return;
    tutor.testou();
  }
  motor.acabou = () => {
    botoesCorrer(false);
    if (F.DESAFIOS[estado.atual].livre) return;
    const t0 = performance.now();
    clearTimeout(falha);
    // a mascote só conclui que não deu quando a cena acabou (e mais um bocadinho)
    falha = setTimeout(() => { if (sucessoEm < t0 && !gambiarraResolvida()) tutor.testeFalhou(); }, 1200);
  };
  const gambiarraResolvida = () => festejado === estado.atual;

  let espera = null;
  ws.addChangeListener(ev => {
    if (ev.isUiEvent || ev.type === Blockly.Events.FINISHED_LOADING) return;
    clearTimeout(espera);
    espera = setTimeout(() => {
      if (!gambiarra) { estado.xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(ws)); gravar(); }
      repor();
      analisar();
    }, 250);
  });

  // ------------------------------------------------------------ desafios
  let festejado = -1;
  function verificar() {
    const d = F.DESAFIOS[estado.atual];
    if (d.livre || festejado === estado.atual) return;
    if (d.ok(registo)) {
      festejado = estado.atual;
      sucessoEm = performance.now();
      if (gambiarra) {
        const [e, t] = F.TUTOR.GERAIS.gambiarraObrigada;
        F.Som.tocar('sucesso');
        tutorUI.mostrar({ estado: e, texto: F.voz(t), tipo: 'sucesso', pedida: true });
        return;
      }
      const s = tutor.sucesso();
      if (estado.feitos <= estado.atual) {
        estado.feitos = estado.atual + 1;
        if (F.DESAFIOS[estado.feitos] && F.DESAFIOS[estado.feitos].livre) estado.feitos++;
        gravar();
      }
      desenharCaminho();
      atualizarBotoesTutor();
      F.Som.tocar('sucesso');
      // deixa a cena acabar antes da festa
      const festaQuandoAcabar = () => (motor.aCorrer && performance.now() - sucessoEm < 6000) ? setTimeout(festaQuandoAcabar, 300) : setTimeout(() => festa(s), 500);
      festaQuandoAcabar();
    }
  }

  function festa(s) {
    const n = estado.atual;
    const atual = F.DESAFIOS[n];
    const seguinte = F.DESAFIOS[n + 1];
    const fimDeNivel = !!(seguinte && seguinte.livre);
    const proximoNivel = fimDeNivel ? F.DESAFIOS[n + 2] : null;
    const fimDeMissao = fimDeNivel && !proximoNivel;
    $('festaTitulo').textContent = fimDeMissao ? 'Nível cumprido!' : fimDeNivel ? 'Nível desbloqueado!' : 'Conseguiste!';
    let texto = (s && s.texto) ? s.texto : `«${atual.titulo}» está feito.`;
    if (fimDeNivel && proximoNivel) texto += ` Acabaste o ${atual.nivelNome}: tens um projeto livre à tua espera e o ${proximoNivel.nivelNome} já está aberto.`;
    if (fimDeMissao) texto += ' ' + F.voz(F.TUTOR.GERAIS.fimMissao[1]) + ' Antes, experimenta o projeto livre.';
    $('festaTexto').textContent = texto;
    $('festaExtra').hidden = !(s && s.extensao);
    $('festaExtra').textContent = s && s.extensao ? 'Desafio extra: ' + s.extensao : '';
    $('btnSeguinte').textContent = !seguinte ? 'Escolher outra missão' : seguinte.livre ? 'Projeto livre ★' : `Desafio seguinte: ${seguinte.titulo}`;
    $('btnFicar').textContent = proximoNivel ? `Ir para o ${proximoNivel.nivelNome.split(' · ')[0]}` : 'Ficar aqui';
    $('btnFicar').dataset.ir = proximoNivel ? String(n + 2) : '';
    $('festa').hidden = false;
    if (fimDeNivel) setTimeout(() => F.Som.tocar('nivel'), 700);
    $('btnSeguinte').focus();
  }

  function mudarDesafio(n) {
    if (!desbloqueado(n)) return;
    if (gambiarra) sairGambiarra(false);
    estado.atual = n;
    festejado = -1;
    gravar();
    const d = F.DESAFIOS[n];
    const doNivel = F.DESAFIOS.filter(x => x.nivel === d.nivel && !x.livre);
    $('missaoNum').textContent = d.livre ? `${d.nivelNome} · projeto livre` : `${d.nivelNome} · desafio ${doNivel.indexOf(d) + 1} de ${doNivel.length}`;
    $('missaoTitulo').textContent = d.titulo;
    $('missaoFrase').textContent = d.missao;
    $('missaoPassos').innerHTML = '';
    for (const p of d.passos) { const li = document.createElement('li'); li.textContent = p; $('missaoPassos').appendChild(li); }
    $('missaoMaterial').textContent = d.material;
    ws.updateToolbox(F.caixa(n));
    desenharCaminho();
    repor();
    tutor.entrarDesafio(n, n < estado.feitos);
    analisar();
    atualizarBotoesTutor();
  }

  // ------------------------------------------------------------ a mascote também erra (gambiarra)
  function carregar(xml) {
    silencio = true;
    ws.clear();
    try { Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), ws); } catch (e) { console.warn(e); }
    setTimeout(() => { silencio = false; }, 0);
  }
  function atualizarBotoesTutor() {
    const g = F.TUTOR.DESAFIOS[estado.atual] && F.TUTOR.DESAFIOS[estado.atual].gambiarra;
    $('tutorGambiarra').hidden = !(g && estado.atual < estado.feitos && !gambiarra);
    $('tutorVoltar').hidden = !gambiarra;
  }
  function entrarGambiarra() {
    const g = F.TUTOR.DESAFIOS[estado.atual].gambiarra;
    gambiarra = { xml: estado.xml };
    festejado = -1;
    carregar(g.xml);
    tutor.reset(); tutor.n = estado.atual;
    tutorUI.mostrar({ estado: 'surpreendida', texto: F.voz(g.pedido), tipo: 'gambiarra' });
    F.Som.tocar('voz');
    atualizarBotoesTutor();
  }
  function sairGambiarra(avisar = true) {
    const xml = gambiarra.xml;
    gambiarra = null;
    carregar(xml || '<xml></xml>');
    festejado = estado.atual;
    if (avisar) { const [e, t] = F.TUTOR.GERAIS.voltarPrograma; tutorUI.mostrar({ estado: e, texto: F.voz(t), tipo: 'info' }); }
    atualizarBotoesTutor();
  }

  const CADEADO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  function desenharCaminho() {
    const nav = $('caminho');
    nav.innerHTML = '';
    const nivelAtual = F.DESAFIOS[estado.atual].nivel;
    if (X.niveis.length > 1) X.niveis.forEach((nv, k) => {
      const t = document.createElement('button');
      t.type = 'button'; t.className = 'nivel-tab';
      t.textContent = 'Nível ' + (k + 1);
      t.title = nv.nome;
      const primeiro = F.DESAFIOS.findIndex(d => d.nivel === k);
      t.disabled = !desbloqueado(primeiro);
      if (k === nivelAtual) t.setAttribute('aria-current', 'true');
      t.addEventListener('click', () => {
        const doNivel = F.DESAFIOS.map((d, i) => i).filter(i => F.DESAFIOS[i].nivel === k);
        const alvo = doNivel.find(i => i >= estado.feitos && desbloqueado(i)) ?? doNivel.filter(desbloqueado).pop() ?? primeiro;
        mudarDesafio(alvo);
      });
      nav.appendChild(t);
    });
    let k = 0;
    F.DESAFIOS.forEach((d, i) => {
      if (d.nivel !== nivelAtual) return;
      k++;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'passo';
      const aberto = desbloqueado(i);
      if (i === estado.atual) b.classList.add('atual');
      else if (i < estado.feitos) b.classList.add('feito');
      if (!aberto) { b.classList.add('fechado'); b.innerHTML = CADEADO; b.setAttribute('aria-disabled', 'true'); }
      else b.textContent = d.livre ? '★' : String(k);
      b.setAttribute('aria-label', (d.livre ? 'Projeto livre' : `Desafio ${k}`) + `: ${d.titulo}` + (aberto ? '' : ' (fechado)'));
      b.title = d.nivelNome + ' — ' + d.titulo;
      b.addEventListener('click', () => mudarDesafio(i));
      nav.appendChild(b);
    });
  }

  // ------------------------------------------------------------ botões
  $('btnComecar').addEventListener('click', comecar);
  $('btnParar').addEventListener('click', () => { motor.parar(); botoesCorrer(false); });
  $('tutorAjuda').addEventListener('click', () => { tutorUI.recolher(false, false); tutor.pedirAjuda(); });
  $('tutorGambiarra').addEventListener('click', entrarGambiarra);
  $('tutorVoltar').addEventListener('click', () => sairGambiarra(true));
  $('btnFicar').addEventListener('click', e => {
    $('festa').hidden = true;
    const ir = e.currentTarget.dataset.ir;
    if (ir) mudarDesafio(Number(ir));
  });
  $('btnSeguinte').addEventListener('click', () => {
    $('festa').hidden = true;
    if (estado.atual + 1 >= N) { location.href = $('btnMissoes').href; return; }
    mudarDesafio(estado.atual + 1);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('festa').hidden = true; });

  let confirmar = null;
  $('btnLimparTudo').addEventListener('click', e => {
    const b = e.currentTarget;
    if (!confirmar) {
      b.textContent = 'Carrega outra vez para apagar';
      confirmar = setTimeout(() => { b.textContent = 'Começar de novo'; confirmar = null; }, 3000);
      return;
    }
    clearTimeout(confirmar); confirmar = null;
    b.textContent = 'Começar de novo';
    ws.clear();
  });

  mudarDesafio(estado.atual);
  window.addEventListener('resize', () => Blockly.svgResize(ws));
  F.app = { ws, motor, palco, estado, mudarDesafio, registo: () => registo, tutor, tutorUI, comecar, entrarGambiarra, sairGambiarra };
})();
