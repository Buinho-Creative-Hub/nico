/* Tutor (mascote) — apresentação. Só mostra o que o motor decide (tutor-motor.js).
 * Nome, sprites e artigo vêm da mascote escolhida (F.MASCOTE).
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};

  class TutorUI {
    constructor(mascote) {
      this.m = mascote;
      this.chave = 'faisca.' + mascote.id + '.recolhida';   // Gabi: a mesma chave de antes
      this.root = document.getElementById('tutor');
      this.img = document.getElementById('tutorImg');
      this.avatar = document.getElementById('tutorAvatar');
      this.balao = document.getElementById('tutorBalao');
      this.texto = document.getElementById('tutorTexto');
      this.nivel = document.getElementById('tutorNivel');
      this.btnFechar = document.getElementById('tutorFechar');
      // pré-carregar os estados para a troca ser instantânea
      new Set(Object.values(mascote.sprites)).forEach(s => { const i = new Image(); i.src = mascote.pasta + s + '.png'; });
      let rec = null;
      try { rec = localStorage.getItem(this.chave); } catch (e) {}
      this.recolher(rec === null ? window.innerWidth < 900 : rec === '1', false);
      this.avatar.addEventListener('click', () => this.recolher(!this.recolhida));
      this.btnFechar.addEventListener('click', () => this.recolher(true));
    }
    sprite(estado) {
      const s = this.m.sprites;
      return this.m.pasta + (s[estado] || s.curiosa) + '.png';
    }
    recolher(sim, guardar = true) {
      this.recolhida = sim;
      this.root.classList.toggle('recolhida', sim);
      this.avatar.setAttribute('aria-expanded', String(!sim));
      this.avatar.setAttribute('aria-label', (sim ? 'Mostrar ' : 'Esconder ') + this.m.artigo + ' ' + this.m.nome);
      if (!sim) this.avatar.removeAttribute('data-novo');
      if (guardar) { try { localStorage.setItem(this.chave, sim ? '1' : '0'); } catch (e) {} }
      if (window.Blockly && F.app && F.app.ws) setTimeout(() => Blockly.svgResize(F.app.ws), 0);
    }
    mostrar(m) {
      this.img.src = this.sprite(m.estado);
      this.img.alt = this.m.nome + ' ' + (m.estado || '').replace('_', ' ');
      this.texto.textContent = m.texto;
      this.balao.className = 'tutor-balao tipo-' + (m.tipo || 'info');
      if (m.tipo === 'pista' && m.nivel) {
        this.nivel.hidden = false;
        this.nivel.innerHTML = [1, 2, 3].map(i => `<span class="${i <= m.nivel ? 'on' : ''}"></span>`).join('');
        this.nivel.setAttribute('aria-label', `pista ${m.nivel} de 3`);
      } else {
        this.nivel.hidden = true;
      }
      // Se estiver recolhida, só abre quando a criança pediu ajuda; caso contrário fica um sinal discreto
      if (this.recolhida) {
        if (m.pedida || m.tipo === 'gambiarra') this.recolher(false, false);
        else this.avatar.setAttribute('data-novo', '');
      }
      this.avatar.classList.remove('salto'); void this.avatar.offsetWidth; this.avatar.classList.add('salto');
    }
  }

  F.TutorUI = TutorUI;
})();
