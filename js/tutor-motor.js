/* Tutor (mascote) — motor pedagógico. Decide QUANDO e O QUE a mascote diz.
 * O conteúdo vem da missão (regras, pistas) e da mascote (mensagens gerais): F.TUTOR.
 * Não toca na interface: recebe acontecimentos e devolve mensagens por callback.
 *
 *   entrarDesafio(n)        a criança abriu um desafio
 *   programaMudou(analise)  o programa mudou (análise de tutor-analise.js)
 *   testou()                a criança experimentou (agitar, botão, logotipo, pino…)
 *   testeFalhou()           passou o tempo do teste e o desafio não ficou cumprido
 *   pedirAjuda()            a criança carregou em «Ajuda»
 *   sucesso()               o desafio ficou cumprido (validação por comportamento)
 *   tick()                  de segundo a segundo (inactividade, «agora experimenta»)
 *
 * Mensagem: { estado, texto, tipo: 'pista'|'correcao'|'testar'|'convite'|'sucesso'|'extensao'|'info', nivel? }
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};

  const INATIVIDADE_MS = 45000;   // convite discreto, nunca uma interrupção
  const TESTAR_MS = 7000;         // programa parece pronto mas ninguém experimentou
  const PAUSA_PROATIVA_MS = 15000; // intervalo mínimo entre mensagens que a mascote decide sozinha
  const RAPIDO_MS = 120000;       // acabou depressa → propõe uma extensão

  class TutorMotor {
    constructor(dizer, agora = () => performance.now()) {
      this.dizer = dizer;
      this.agora = agora;
      this.cfg = F.TUTOR;
      this.n = 0;
      this.reset();
    }
    reset() {
      this.analise = null;
      this.regraAtiva = null;
      this.niveis = {};          // id da regra → último nível mostrado (0..3)
      this.pistasDadas = new Set();
      this.testesSemSucesso = 0;
      this.testado = false;      // houve teste desde a última mudança?
      this.ultimaAtividade = this.agora();
      this.ultimaMudanca = this.agora();
      this.ultimaProativa = -Infinity;
      this.convidado = false;
      this.avisouTestar = '';
      this.ultimoTexto = '';
      this.calmaDada = false;
      this.concluido = false;
      this.entrada = this.agora();
    }
    get d() { return this.cfg.DESAFIOS[this.n] || this.cfg.DESAFIOS[0]; }
    regras() { return [...this.d.regras, ...this.cfg.COMUNS]; }

    // ------------------------------------------------------------- saída
    falar(estado, texto, tipo, extra = {}) {
      texto = F.voz(texto);                // a mesma regra, dita pela mascote escolhida
      if (!texto) return false;
      if (texto === this.ultimoTexto && tipo !== 'pista') return false; // não repetir
      this.ultimoTexto = texto;
      this.dizer(Object.assign({ estado, texto, tipo, desafio: this.n }, extra));
      return true;
    }
    proativa(estado, texto, tipo, extra) {
      const t = this.agora();
      if (t - this.ultimaProativa < PAUSA_PROATIVA_MS) return false;
      if (this.falar(estado, texto, tipo, extra)) { this.ultimaProativa = t; return true; }
      return false;
    }

    // ------------------------------------------------------------- entradas
    entrarDesafio(n, jaFeito = false) {
      this.n = n;
      this.reset();
      this.jaFeito = jaFeito;     // já tinha sido feito noutra altura: ajuda igual, sem extensão
      const [estado, texto] = this.d.boasVindas;
      this.falar(estado, texto, 'info');
    }

    programaMudou(a) {
      const antes = this.analise;
      this.analise = a;
      const t = this.agora();
      this.ultimaAtividade = t;
      this.convidado = false;
      if (!antes || antes.assinatura !== a.assinatura) {
        this.ultimaMudanca = t;
        this.testado = false;
        this.calmaDada = false;
      }
      const ativa = this.regras().find(r => safe(() => r.ativa(a)));
      const anterior = this.regraAtiva;
      this.regraAtiva = ativa || null;
      // Correcção: a criança resolveu uma dificuldade sobre a qual já tinha recebido pista
      if (anterior && anterior !== ativa && this.pistasDadas.has(anterior.id) && !safe(() => anterior.ativa(a))) {
        this.pistasDadas.delete(anterior.id);
        this.testesSemSucesso = 0;
        this.falar('incentivar', anterior.corrigido, 'correcao', { regra: anterior.id });
      }
    }

    testou() {
      this.ultimaAtividade = this.agora();
      this.testado = true;
      this.convidado = false;
    }

    testeFalhou() {
      if (this.concluido) return;
      this.testesSemSucesso++;
      const r = this.regraAtiva;
      if (this.testesSemSucesso >= 3 && !this.calmaDada) {
        this.calmaDada = true;
        const [e, txt] = this.cfg.GERAIS.calma;
        this.falar(e, txt, 'convite');
        return;
      }
      if (r && !(this.niveis[r.id] > 0)) {
        // sinal de dificuldade: oferece a pista conceptual (nível 1), nunca mais do que isso sozinha
        this.mostrarPista(r, 1);
      } else if (!r) {
        const [e, txt] = this.cfg.GERAIS.testeFalhou;
        this.proativa(e, txt, 'info');
      }
    }

    pedirAjuda() {
      this.ultimaAtividade = this.agora();
      const a = this.analise;
      if (a && a.vazio()) { const [e, t] = this.cfg.GERAIS.vazio; return this.falar(e, t, 'pista', { nivel: 1 }); }
      const r = this.regraAtiva;
      if (r) {
        const nivel = Math.min((this.niveis[r.id] || 0) + 1, 3);
        return this.mostrarPista(r, nivel, true);
      }
      if (a && safe(() => this.d.parecePronto(a)) && !this.testado) return this.falar('testar', this.d.testar, 'testar');
      const [e, t] = this.cfg.GERAIS.semPistas;
      return this.falar(e, t, 'info');
    }

    mostrarPista(r, nivel, pedida = false) {
      this.niveis[r.id] = Math.max(this.niveis[r.id] || 0, nivel);
      this.pistasDadas.add(r.id);
      const [estado, texto] = r.pistas[nivel - 1];
      if (!pedida) this.ultimaProativa = this.agora();
      return this.falar(estado, texto, 'pista', { nivel, regra: r.id, pedida });
    }

    sucesso() {
      const primeira = !this.concluido && !this.jaFeito;
      this.concluido = true;
      const rapido = this.agora() - this.entrada < RAPIDO_MS;
      return { estado: 'celebrar', texto: F.voz(this.d.sucesso), extensao: primeira && rapido ? F.voz(this.d.extensao) : '' };
    }

    tick() {
      const t = this.agora();
      const a = this.analise;
      if (this.concluido || !a) return;
      // Programa parece pronto mas ainda não foi experimentado: distinguir presença de execução
      if (!this.testado && t - this.ultimaMudanca > TESTAR_MS && this.avisouTestar !== a.assinatura && safe(() => this.d.parecePronto(a))) {
        this.avisouTestar = a.assinatura;
        this.proativa('testar', this.d.testar, 'testar');
        return;
      }
      // Inactividade: convite discreto, uma vez por período parado
      if (!this.convidado && t - this.ultimaAtividade > INATIVIDADE_MS) {
        this.convidado = true;
        const [e, txt] = this.cfg.GERAIS.convite;
        this.falar(e, txt, 'convite');
      }
    }
  }

  function safe(fn) { try { return fn(); } catch (e) { console.warn('Tutor', e); return false; } }

  F.TutorMotor = TutorMotor;
})();
