/* Nico · Palco — motor que corre o programa de blocos no palco (Missão 0, sem micro:bit).
 *
 * Mesmo princípio do motor do micro:bit (js/motor.js): cada arranque é uma «geração»; mudar o programa ou carregar
 * em ■ mata a anterior. Tudo o que acontece vai para o REGISTO, que é a única coisa que os desafios lêem:
 *   in  comecar                 carregou em ▶ Começar
 *   out diz:nico:Olá!            balão de fala
 *   out pos:gabi:400             onde o ator ficou depois de andar
 *   out ir:nico:porta            chegou a um sítio
 *   out imagem:nico:festa · cenario:fablab · hora:noite
 */
(function () {
  'use strict';
  const F = window.Faisca;
  class Parado extends Error {}
  const VEL = 220;          // passos por segundo a andar
  const PASSO_MS = 30;

  class PalcoMotor {
    constructor(ws, palco, registo) {
      this.ws = ws;
      this.palco = palco;
      this.registo = registo;
      this.geracao = 0;
      this.handlers = {};
      this.ocupado = new Set();
    }
    arrancar() {
      this.parar();
      this.handlers = {};
      for (const top of this.ws.getTopBlocks(true)) {
        if (!top.isEnabled() || top.isInFlyout) continue;
        let chave = null;
        if (top.type === 'pk_comecar') chave = 'comecar';
        if (chave) (this.handlers[chave] = this.handlers[chave] || []).push({ id: top.id, corpo: top.getInputTargetBlock('DO') });
      }
    }
    parar() {
      this.geracao++;
      this.ocupado.clear();
      this.destacar(null);
    }
    acontecimento(chave) {
      this.registo('in', chave);
      const lista = this.handlers[chave] || [];
      const g = this.geracao;
      for (const h of lista) {
        if (this.ocupado.has(h.id)) continue;
        this.ocupado.add(h.id);
        this.correr(h.corpo, g, h.id).catch(() => {}).finally(() => { this.ocupado.delete(h.id); if (!this.ocupado.size) this.acabou && this.acabou(); });
      }
      if (!lista.length) this.acabou && this.acabou();
    }
    get aCorrer() { return this.ocupado.size > 0; }

    vivo(g) { if (g !== this.geracao) throw new Parado(); }
    esperar(ms, g) { return new Promise((res, rej) => setTimeout(() => (g === this.geracao ? res() : rej(new Parado())), ms)); }
    destacar(id) { try { this.ws.highlightBlock(id); } catch (e) { /* espaço a mudar */ } }

    async correr(bloco, g, idTopo) {
      for (let b = bloco; b; b = b.getNextBlock()) {
        this.vivo(g);
        if (!b.isEnabled()) continue;
        this.destacar(b.id);
        await this.executar(b, g);
      }
      if (idTopo) this.destacar(null);
    }
    valor(b, nome, defeito) {
      const v = b.getInputTargetBlock(nome);
      if (!v) return defeito;
      if (v.type === 'mk_num') return Number(v.getFieldValue('NUM'));
      if (v.type === 'mk_texto') return String(v.getFieldValue('TXT'));
      const x = v.getFieldValue('V');
      return x === null || x === undefined ? defeito : x;
    }

    // anda até x, aos bocadinhos (para se ver)
    async andarAte(id, x, g) {
      const p = this.palco;
      if (!p.atores[id]) return;
      x = Math.max(30, Math.min(450, x));
      const x0 = p.x(id);
      if (Math.abs(x - x0) < 0.5) return;
      p.virar(id, x < x0);
      const passos = Math.max(1, Math.round(Math.abs(x - x0) / (VEL * PASSO_MS / 1000)));
      for (let i = 1; i <= passos; i++) {
        await this.esperar(PASSO_MS, g);
        p.colocar(id, x0 + (x - x0) * i / passos);
        // a andar: alterna os 2 desenhos de passo (se o ator os tiver) e dá um saltinho
        p.passo(id, Math.floor(i / 5));
        p.atores[id].corpo.style.translate = `0 ${i % 6 < 3 ? -3 : 0}px`;
      }
      p.atores[id].corpo.style.translate = '';
      p.parado(id);
    }

    async executar(b, g) {
      const p = this.palco;
      const ator = b.getFieldValue('ATOR');
      switch (b.type) {
        case 'pk_dizer': {
          const t = String(this.valor(b, 'T', ''));
          const s = Math.max(0, Math.min(10, Number(this.valor(b, 'S', 2)) || 0));
          p.dizer(ator, t);
          this.registo('out', 'diz:' + ator + ':' + t);
          try { await this.esperar(s * 1000, g); } finally { if (g === this.geracao) p.calar(ator); }
          break;
        }
        case 'pk_andar': {
          const n = Math.max(0, Math.min(480, Number(this.valor(b, 'N', 10)) || 0));
          const dir = b.getFieldValue('DIR') === 'esquerda' ? -1 : 1;
          await this.andarAte(ator, p.x(ator) + dir * n, g);
          this.registo('out', 'pos:' + ator + ':' + Math.round(p.x(ator)));
          break;
        }
        case 'pk_ir': {
          const s = b.getFieldValue('SITIO');
          let x = F.SITIO_X[s];
          if (x === undefined && p.tem(s)) x = p.x(s) - 62;     // fica ao lado do objeto, não por cima
          if (x === undefined) break;
          await this.andarAte(ator, x, g);
          this.registo('out', 'ir:' + ator + ':' + s);
          this.registo('out', 'pos:' + ator + ':' + Math.round(p.x(ator)));
          break;
        }
        case 'pk_imagem': {
          const t = b.getFieldValue('TRAJE');
          p.imagem(ator, t);
          this.registo('out', 'imagem:' + ator + ':' + t);
          await this.esperar(150, g);
          break;
        }
        case 'pk_cenario': {
          const c = b.getFieldValue('CEN');
          p.cenario(c);
          this.registo('out', 'cenario:' + c);
          await this.esperar(400, g);
          break;
        }
        case 'pk_hora': {
          const h = b.getFieldValue('HORA');
          p.hora(h);
          this.registo('out', 'hora:' + h);
          await this.esperar(400, g);
          break;
        }
        case 'mk_pausa':
          await this.esperar(Math.max(0, Math.min(10000, Number(this.valor(b, 'MS', 100)) || 0)), g);
          this.registo('out', 'pausa');
          break;
        case 'mk_repetir': {
          const n = Math.max(0, Math.min(50, Math.round(Number(this.valor(b, 'N', 0)) || 0)));
          for (let i = 0; i < n; i++) { await this.correr(b.getInputTargetBlock('DO'), g, null); await this.esperar(0, g); }
          break;
        }
      }
    }
  }

  // ------------------------------------------------------------ verificação (lê só o registo)
  // saídas da última vez que se carregou em ▶ Começar
  function saidas(reg) {
    let i = -1;
    reg.forEach((e, k) => { if (e.dir === 'in' && e.v === 'comecar') i = k; });
    if (i < 0) return [];
    return reg.slice(i + 1).filter(e => e.dir === 'out').map(e => e.v);
  }
  const falas = (s, ator) => s.filter(v => v.startsWith('diz:' + (ator ? ator + ':' : ''))).map(v => ({ ator: v.split(':')[1], texto: v.split(':').slice(2).join(':') }));
  const ultimaPos = (s, ator) => { const l = s.filter(v => v.startsWith('pos:' + ator + ':')).pop(); return l ? Number(l.split(':')[2]) : null; };
  // os prefixos aparecem por esta ordem (não necessariamente seguidos)?
  function ordem(s, prefixos) {
    let k = 0;
    for (const v of s) if (k < prefixos.length && (typeof prefixos[k] === 'function' ? prefixos[k](v) : v.startsWith(prefixos[k]))) k++;
    return k === prefixos.length;
  }
  F.verifPalco = { saidas, falas, ultimaPos, ordem };
  F.PalcoMotor = PalcoMotor;
})();
