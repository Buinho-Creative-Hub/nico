/* Faísca Desafios — motor que corre o programa de blocos.
 * O mesmo programa mexe no micro:bit do ecrã e, se estiver ligado, no verdadeiro.
 * Os acontecimentos (agitar, botões, logótipo, pinos) chegam dos dois lados.
 */
(function () {
  'use strict';
  const F = window.Faisca;

  class Parado extends Error {}
  const VIVOS = new Set(['so_barra', 'so_grande', 'so_grafico', 'so_atividade']);
  const BATIDA_MS = 500;      // 120 bpm, como o MakeCode
  // No MakeCode o «mostrar ícone» espera 600 ms. Aqui é quase imediato, de propósito:
  // sem «pausa» os desenhos mudam tão depressa que não se vêem — é isso que o desafio 2 ensina.
  const ICONE_MS = 20;

  class Motor {
    constructor(ws, saidas, registo) {
      this.ws = ws;
      this.saidas = saidas;       // lista de alvos: {icone, limpar, som, tom, digital, estaEscuro?}
      this.registo = registo;     // (tipo, dados) => void   — para verificar desafios
      this.geracao = 0;
      this.ocupado = new Set();
      this.handlers = {};
      this.vars = {};
      this.t0 = performance.now();
      this.ultimoEcra = null;     // não repetir no registo o mesmo desenho seguido (os ciclos «para sempre» redesenham)
    }
    // ---------------------------------------------------------------- ciclo
    arrancar() {
      this.parar();
      const g = ++this.geracao;
      this.handlers = {};
      this.vars = {};
      this.t0 = performance.now();
      this.ultimoEcra = null;
      this._dig = {};
      this._emSempre = false;
      this.mudouVars && this.mudouVars(this.vars);
      this.destacar(null);
      this.soViva = null;
      // Sensory OLED: refresca o ecrã «vivo» e conta os movimentos do PIR (para «movimentos por minuto»/«nível de atividade»)
      const contaPir = this.ws.getAllBlocks(false).some(x => x.type === 'so_movimentos' || x.type === 'so_nivel');
      (async () => {
        try {
          for (;;) {
            await this.esperar(100, g);
            if (contaPir && this.so()) this.so().updateActivity(!!this.sensor('kit_pir'), 10);
            const v = this.soViva;
            if (v && !this._soOcupado && performance.now() - (this._soT || 0) >= 95) {
              this._soOcupado = true;
              try { await this.executar(v, g, true); } finally { this._soOcupado = false; }
            }
          }
        } catch (e) { /* parado */ }
      })();
      const arranque = [];
      for (const top of this.ws.getTopBlocks(true)) {
        if (!top.isEnabled() || top.isInFlyout) continue;
        const corpo = top.getInputTargetBlock('DO');
        let chave = null;
        switch (top.type) {
          case 'mk_agitar': chave = 'agitar'; break;
          case 'mk_logo': chave = 'logo'; break;
          case 'mk_botao': chave = 'botao:' + top.getFieldValue('B'); break;
          case 'mk_pino_tocado': chave = 'pino:' + top.getFieldValue('P'); break;
          case 'mk_gesto': chave = 'gesto:' + top.getFieldValue('G'); break;
          case 'mk_som_alto': chave = 'somalto'; break;
          case 'mk_iniciar': arranque.push(top); break;
          case 'mk_sempre': break;
        }
        if (chave) (this.handlers[chave] = this.handlers[chave] || []).push({ id: top.id, corpo });
      }
      // como no micro:bit: primeiro o «no arranque», depois os «para sempre»
      const sempres = this.ws.getTopBlocks(true).filter(t => t.type === 'mk_sempre' && t.isEnabled() && !t.isInFlyout);
      (async () => {
        try {
          for (const t of arranque) await this.correr(t.getInputTargetBlock('DO'), g, t.id);
        } catch (e) { return; }
        for (const t of sempres) this.sempre(t, t.getInputTargetBlock('DO'), g);
      })();
    }
    parar() {
      this.geracao++;
      this.ocupado.clear();
    }
    acontecimento(chave) {
      this.registo('in', chave);
      this.ultimoEcra = null;     // depois de uma entrada, o próximo desenho conta sempre (mesmo que seja igual)
      this._dig = {};
      const lista = this.handlers[chave];
      if (!lista) return;
      const g = this.geracao;
      for (const h of lista) {
        if (this.ocupado.has(h.id)) continue;   // como no micro:bit: não empilha
        this.ocupado.add(h.id);
        this.correr(h.corpo, g, h.id).catch(() => {}).finally(() => this.ocupado.delete(h.id));
      }
    }
    async sempre(top, corpo, g) {
      this._emSempre = true;
      try {
        for (;;) {
          // sem idTopo: não apaga o destaque no fim de cada volta (senão o bloco fica a piscar muito depressa)
          await this.correr(corpo, g, null, true);
          await this.esperar(20, g);
        }
      } catch (e) { /* parado */ }
    }
    // ---------------------------------------------------------------- execução
    vivo(g) { if (g !== this.geracao) throw new Parado(); }
    esperar(ms, g) {
      return new Promise((res, rej) => setTimeout(() => (g === this.geracao ? res() : rej(new Parado())), ms));
    }
    // Destaque do bloco que está a correr. Em ciclos rápidos (para sempre, enquanto…) o bloco a correr muda dezenas de
    // vezes por segundo e o destaque ficava a piscar: agora só aparece quando o mesmo bloco fica a correr ~120 ms
    // (ex.: numa pausa); enquanto muda depressa, não se destaca nada.
    destacar(id) {
      if (id === this._dAtual && !this._dPendente) return;
      if (id === this._dPendente) return;
      clearTimeout(this._dTimer);
      if (this._dAtual) { this._dAtual = null; try { this.ws.highlightBlock(null); } catch (e) {} }
      this._dPendente = id;
      if (!id) return;
      this._dTimer = setTimeout(() => {
        this._dPendente = null; this._dAtual = id;
        try { this.ws.highlightBlock(id); } catch (e) {}
      }, 120);
    }
    // sempre = este código vem de um «para sempre»: enquanto um evento (botão, pino…) está a correr, os desenhos do
    // «para sempre» não tapam os do evento (ex.: tocar no P0 mostra corações mesmo com o «para sempre» a pôr a cara).
    async correr(bloco, g, idTopo, sempre) {
      for (let b = bloco; b; b = b.getNextBlock()) {
        this.vivo(g);
        if (!b.isEnabled()) continue;
        this.destacar(b.id);
        await this.executar(b, g, false, sempre);
      }
      if (idTopo) this.destacar(null);
    }
    valor(b, nome, defeito) {
      const v = b.getInputTargetBlock(nome);
      if (!v) return defeito;
      const r = this.avaliar(v);
      return r === undefined ? defeito : r;
    }
    // Avalia um bloco de valor (número, sensor, variável, conta, comparação…)
    avaliar(v) {
      const n = (nome, d = 0) => { const x = Number(this.valor(v, nome, d)); return Number.isFinite(x) ? x : d; };
      switch (v.type) {
        case 'mk_num': return Number(v.getFieldValue('NUM'));
        case 'mk_texto': return String(v.getFieldValue('TXT'));
        case 'mk_escuro': return this.estaEscuro();
        case 'mk_pino_premido': return !!this.saidas[0].tocados?.[v.getFieldValue('P')];
        case 'mk_botao_premido': return !!this.saidas[0].botoes?.[v.getFieldValue('B')];
        case 'mk_luz': return this.sensor('luz');
        case 'mk_som_nivel': return this.sensor('som');
        case 'mk_temperatura': return this.sensor('temperatura');
        case 'mk_tempo': return Math.round(performance.now() - this.t0);
        case 'mk_ler_digital': return this.sensor('digital:' + v.getFieldValue('P'));
        case 'mk_ler_analogico': return this.sensor('analogico:' + v.getFieldValue('P'));
        case 'mk_var': return this.vars[v.getFieldValue('VAR')] ?? 0;
        // Smart Science IoT Kit (no ecrã os valores vêm dos controlos «kit», qualquer que seja o pino)
        case 'mk_kit_ruido': return this.sensor('kit_ruido');
        case 'mk_kit_luz': return this.sensor('kit_luz');
        case 'mk_kit_pir': return !!this.sensor('kit_pir');
        case 'mk_kit_bme': return this.sensor('bme_' + v.getFieldValue('Q'));
        // extensão Sensory OLED (as contas com memória vivem no SensoryOLED do micro:bit do ecrã)
        case 'so_pir': return !!this.sensor('kit_pir');
        case 'so_db': return this.so() ? this.so().toDecibels(n('V')) : 0;
        case 'so_media': return this.so() ? this.so().average(n('V'), n('S', 5), n('C', 1)) : 0;
        case 'so_nivel': return this.so() ? this.so().activityLevel() : 0;
        case 'so_movimentos': return this.so() ? this.so().movementsPerMinute() : 0;
        case 'mk_aleatorio': { const a = Math.round(n('A')), b = Math.round(n('B')); const lo = Math.min(a, b), hi = Math.max(a, b); return lo + Math.floor(Math.random() * (hi - lo + 1)); }
        case 'mk_resto': { const b = n('B', 1); return b ? n('A') % b : 0; }
        case 'mk_conta': {
          const a = n('A'), b = n('B');
          switch (v.getFieldValue('OP')) { case '+': return a + b; case '-': return a - b; case '*': return a * b; case '/': return b ? a / b : 0; }
          return 0;
        }
        case 'mk_comparar': {
          const a = n('A'), b = n('B');
          switch (v.getFieldValue('OP')) { case '<': return a < b; case '>': return a > b; case '==': return a === b; case '<=': return a <= b; case '>=': return a >= b; case '!=': return a !== b; }
          return false;
        }
        default: return v.getFieldValue('V') ?? undefined;
      }
    }
    so() { return this.saidas[0].sensory; }
    sensor(nome) {
      const s = this.saidas[0];
      return s.sensor ? Number(s.sensor(nome)) || 0 : 0;
    }
    ecra(v) {        // regista o que aparece no ecrã, sem repetir o mesmo seguido
      if (v === this.ultimoEcra) return;
      this.ultimoEcra = v;
      this.registo('out', v);
    }
    mudarVar(nome, v) {
      this.vars[nome] = v;
      this.registo('out', 'var:' + nome + ':' + v);
      this.mudouVars && this.mudouVars(this.vars);
    }
    estaEscuro() {
      for (const s of this.saidas) if (s.estaEscuro && s.ligado !== false) return s.estaEscuro();
      return false;
    }
    principal() { return this.saidas.find(s => s.principal) || this.saidas[0]; }
    emTodas(fn) { for (const s of this.saidas) if (s.ligado !== false) { try { fn(s); } catch (e) { console.warn(e); } } }
    async executar(b, g, refrescar, sempre) {
      const ECRA = ['mk_icone', 'mk_limpar', 'mk_mostrar_numero', 'mk_mostrar_texto', 'mk_acender', 'mk_apagar_led', 'mk_grafico'];
      if (sempre && this.ocupado.size && ECRA.includes(b.type)) return;   // o evento tem prioridade no ecrã
      switch (b.type) {
        case 'mk_icone': {
          const nome = b.getFieldValue('I');
          this.emTodas(s => s.icone(nome));
          this.ecra('icone:' + nome);
          await this.esperar(ICONE_MS, g);
          break;
        }
        case 'mk_limpar':
          this.emTodas(s => s.limpar());
          this.ecra('limpar');
          break;
        case 'mk_pausa':
          await this.esperar(Math.max(0, Number(this.valor(b, 'MS', 100))), g);
          break;
        case 'mk_repetir': {
          const n = Math.max(0, Math.min(100, Math.round(Number(this.valor(b, 'N', 0)))));
          for (let i = 0; i < n; i++) {
            await this.correr(b.getInputTargetBlock('DO'), g, null, sempre);
            await this.esperar(0, g);
          }
          break;
        }
        case 'mk_enquanto':
          // como no micro:bit: repete enquanto a condição for verdadeira (com uma pausa mínima para o ecrã respirar)
          while (this.valor(b, 'C', false)) {
            await this.correr(b.getInputTargetBlock('DO'), g, null, sempre);
            await this.esperar(20, g);
          }
          break;
        case 'mk_se': {
          const ramo = this.valor(b, 'C', false) ? 'SIM' : 'NAO';
          await this.correr(b.getInputTargetBlock(ramo), g, null, sempre);
          break;
        }
        case 'mk_se_entao':
          if (this.valor(b, 'C', false)) await this.correr(b.getInputTargetBlock('SIM'), g, null, sempre);
          break;
        case 'mk_mostrar_numero': {
          let x = Number(this.valor(b, 'N', 0));
          if (!Number.isFinite(x)) x = 0;
          x = Math.round(x * 100) / 100;
          const ms = this.principal().mostrarTexto ? this.principal().mostrarTexto(String(x), true) : 0;
          this.emTodas(s => { if (s !== this.principal() && s.mostrarTexto) s.mostrarTexto(String(x), true); });
          this.ultimoEcra = null;
          this.registo('out', 'numero:' + x);
          await this.esperar(ms || 20, g);
          break;
        }
        case 'mk_mostrar_texto': {
          const t = String(this.valor(b, 'T', ''));
          const ms = this.principal().mostrarTexto ? this.principal().mostrarTexto(t, false) : 0;
          this.ultimoEcra = null;
          this.registo('out', 'texto:' + t);
          await this.esperar(ms || 20, g);
          break;
        }
        case 'mk_acender': case 'mk_apagar_led': {
          const x = Math.round(Number(this.valor(b, 'X', 0))), y = Math.round(Number(this.valor(b, 'Y', 0)));
          const on = b.type === 'mk_acender';
          if (x >= 0 && x < 5 && y >= 0 && y < 5) this.emTodas(s => s.pixel && s.pixel(x, y, on));
          this.ultimoEcra = null;
          this.registo('out', (on ? 'acender:' : 'apagar:') + x + ',' + y);
          break;
        }
        case 'mk_grafico': {
          const v = Number(this.valor(b, 'V', 0)), max = Number(this.valor(b, 'MAX', 255)) || 1;
          this.emTodas(s => s.grafico && s.grafico(v, max));
          const n = Math.max(0, Math.min(25, Math.round(25 * v / max)));
          this.ecra('grafico:' + n);
          await this.esperar(20, g);
          break;
        }
        case 'mk_var_definir': this.mudarVar(b.getFieldValue('VAR'), Number(this.valor(b, 'V', 0)) || 0); break;
        case 'mk_var_mudar': {
          const k = b.getFieldValue('VAR');
          this.mudarVar(k, (this.vars[k] ?? 0) + (Number(this.valor(b, 'V', 1)) || 0));
          break;
        }
        case 'mk_servo': {
          const p = b.getFieldValue('P');
          const a = Math.max(0, Math.min(180, Math.round(Number(this.valor(b, 'A', 90)) || 0)));
          this.emTodas(s => s.servo && s.servo(p, a));
          this.ecra('servo:' + p + ':' + a);
          break;
        }
        case 'mk_registar': {
          const nome = String(this.valor(b, 'NOME', 'valor'));
          const v = Number(this.valor(b, 'V', 0));
          this.emTodas(s => s.registar && s.registar(nome, v));
          this.registo('out', 'registo:' + nome + ':' + v);
          break;
        }
        // ---- ecrã OLED do Smart Science IoT Kit
        case 'mk_oled_iniciar':
          this.emTodas(s => s.oled && s.oled('iniciar'));
          this.registo('out', 'oled:iniciar');
          break;
        case 'mk_oled_limpar':
          this.emTodas(s => s.oled && s.oled('limpar'));
          this.registo('out', 'oled:limpar');
          break;
        case 'mk_oled_texto': case 'mk_oled_numero': {
          let t;
          if (b.type === 'mk_oled_numero') { let x = Number(this.valor(b, 'N', 0)); if (!Number.isFinite(x)) x = 0; t = String(Math.round(x * 100) / 100); }
          else t = String(this.valor(b, 'T', ''));
          this.emTodas(s => s.oled && s.oled('texto', t));
          this.registo('out', (b.type === 'mk_oled_numero' ? 'oled:numero:' : 'oled:texto:') + t);
          await this.esperar(20, g);
          break;
        }
        case 'mk_oled_barra': {
          const p = Math.max(0, Math.min(100, Math.floor(Number(this.valor(b, 'V', 0)) || 0)));
          this.emTodas(s => s.oled && s.oled('barra', p));
          this.ecra('oled:barra:' + p);
          await this.esperar(20, g);
          break;
        }
        // ---- extensão Sensory OLED
        case 'so_animacao': {
          const id = b.getFieldValue('A'), A = F.ANIMACOES_OLED[id];
          const vezes = Math.max(0, Math.min(20, Math.round(Number(this.valor(b, 'N', 1)) || 0)));
          this.ecra('soled:animacao:' + id);
          this.soViva = null;
          for (let v = 0; v < vezes; v++) for (let i = 0; i < A.n; i++) {
            this.emTodas(s => s.soled && s.soled('moldura', [id, i]));
            await this.esperar(A.ms, g);
          }
          break;
        }
        case 'so_escrever': {
          const t = this.valor(b, 'T', '');
          const x = Number(this.valor(b, 'X', 0)) || 0, y = Number(this.valor(b, 'Y', 0)) || 0, k = Number(b.getFieldValue('K')) || 1;
          this.soViva = null;
          this.emTodas(s => s.soled && s.soled('escrever', [t, x, y, k]));
          this.ecra('soled:escrever:' + t + ':' + k);
          await this.esperar(20, g);
          break;
        }
        case 'so_barra': case 'so_grande': case 'so_grafico': case 'so_grafico_reset': case 'so_atividade': case 'so_texto': case 'so_limpar': {
          const nmr = (k, d) => { const x = Number(this.valor(b, k, d)); return Number.isFinite(x) ? x : d; };
          const str = (k, d) => String(this.valor(b, k, d));
          const [fn, args, reg] = {
            so_barra: () => ['intensityBar', [nmr('V', 0), nmr('MIN', 30), nmr('MAX', 90), str('ROT', 'SOUND'), str('UN', 'dB'), true], 'barra:' + Math.round(nmr('V', 0)) + ':' + nmr('MIN', 30) + ':' + nmr('MAX', 90)],
            so_grande: () => ['bigNumber', [nmr('V', 0), str('ROT', 'SOUND'), str('UN', '')], 'grande:' + Math.round(nmr('V', 0))],
            so_grafico: () => ['scrollingGraph', [nmr('V', 0), nmr('MIN', 30), nmr('MAX', 90), nmr('LO', 45), nmr('HI', 65), str('ROT', 'SOUND')], 'grafico:' + Math.round(nmr('V', 0))],
            so_grafico_reset: () => ['resetGraph', [], 'recomecar'],
            so_atividade: () => ['activityMeter', [!!this.valor(b, 'MOV', false), nmr('S', 10), str('ROT', 'ACTIVITY')], 'atividade'],
            so_texto: () => ['showText', [str('T', ''), nmr('L', 0)], 'texto:' + str('T', '')],
            so_limpar: () => ['clear', [], 'limpar'],
          }[b.type]();
          this.emTodas(s => s.soled && s.soled(fn, args));
          // IC: o medidor de atividade regista o nível (0–100) para a validação poder ver se enche com o PIR
          this.ecra('soled:' + (b.type === 'so_atividade' && this.so() ? 'atividade:' + Math.round(this.so().activityLevel()) : reg));
          // barra, número grande, gráfico e medidor ficam «vivos»: continuam a atualizar-se sozinhos (10× por segundo)
          // até outro bloco do ecrã os substituir — assim «no botão A → barra da luz» mostra a luz sem parar.
          if (VIVOS.has(b.type)) { this.soViva = b; this._soT = performance.now(); }
          else if (b.type !== 'so_grafico_reset') this.soViva = null;
          if (!refrescar) await this.esperar(20, g);
          break;
        }
        case 'mk_som': {
          const nome = this.valor(b, 'S', 'giggle');
          let ms = 600;
          this.emTodas(s => { const d = s.tocarSom(nome); if (typeof d === 'number' && s.principal) ms = d; });
          this.registo('out', 'som:' + nome);
          await this.esperar(ms, g);
          break;
        }
        case 'mk_tom': {
          const f = Number(this.valor(b, 'F', 262));
          const ms = Math.round(Number(this.valor(b, 'BAT', 1)) * BATIDA_MS);
          this.emTodas(s => s.tom(f, ms));
          this.registo('out', 'tom:' + f);
          await this.esperar(ms, g);
          break;
        }
        case 'mk_digital': {
          const p = this.valor(b, 'P', 'P2');
          const v = Number(this.valor(b, 'V', 0)) ? 1 : 0;
          this.emTodas(s => s.digital(p, v));
          if (this._dig?.[p] !== v || !this._emSempre) this.registo('out', 'digital:' + p + ':' + v);
          (this._dig = this._dig || {})[p] = v;
          break;
        }
      }
    }
  }

  F.Motor = Motor;
})();
