// Casos de teste da missão «Estação de medição».
const { xml, E, seq, b, num, cmp, icone, limpar, pausa, numero, registar, se, ruido, luzKit, pir, soPir, mov, grande, soTexto, atividade } = require('../lib');
const pulsos = n => Array.from({ length: n }, () => [{ kit_pir: 1 }, { esperar: 350 }, { kit_pir: 0 }, { esperar: 350 }]).flat();
const ok = {
  passou: () => xml(E.sempre(seq(se(pir(), [icone('Yes')], [limpar()])))),
  medidor: () => xml(E.sempre(seq(atividade(soPir())))),
  mpm: () => xml(E.botao('A', seq(grande(mov(), 'MOVES', '/min')))),
  segundo: () => xml(E.sempre(seq(registar('noise', ruido()), pausa(1000)))),
  tres: () => xml(E.sempre(seq(registar('noise', ruido()), registar('light', luzKit()), registar('movement', mov()), pausa(1000)))),
  cheio: () => xml(E.sempre(seq(se(cmp(mov(), '>', 3), [soTexto('BUSY NOW')], [soTexto('CALM')])))),
};
module.exports = {
  missao: 'estacao',
  casos: [
    { ok: ok.passou(), errado: [xml(E.sempre(seq(se(b('mk_escuro'), [icone('Yes')], [limpar()]))))], fazer: [{ kit_pir: 1 }, { esperar: 300 }, { kit_pir: 0 }, { esperar: 300 }],
      regras: [[xml(E.botao('A', seq(icone('Yes')))), 'sem_sempre'], [xml(E.sempre(seq(icone('Yes')))), 'sem_mk_se_sempre'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [icone('Yes')], [limpar()])))), 'sem_pir'], [xml(E.sempre(seq(se(pir(), [icone('Yes')], [])))), 'nao_limpa'], [ok.passou(), null]] },
    { ok: ok.medidor(), errado: [xml(E.botao('A', seq(atividade(soPir())))), xml(E.sempre(seq(atividade(cmp(0, '>', 1)))))], fazer: [{ kit_pir: 1 }, { esperar: 600 }, { kit_pir: 0 }, { esperar: 300 }],
      regras: [[xml(E.botao('A', seq(atividade(soPir())))), 'sem_sempre'], [xml(E.sempre(seq(grande(50)))), 'sem_so_atividade_sempre'],
        [xml(E.sempre(seq(atividade(cmp(0, '>', 1))))), 'sem_pir'], [ok.medidor(), null]] },
    { ok: ok.mpm(), errado: [xml(E.botao('A', seq(grande(b('so_nivel'), 'MOVES', '/min'))))], fazer: [...pulsos(2), 'botao:A'],
      regras: [[xml(E.sempre(seq(grande(mov())))), 'sem_botao_A'], [xml(E.botao('A', seq(numero(mov())))), 'sem_so_grande_botao_A'],
        [xml(E.botao('A', seq(grande(50)))), 'sem_so_movimentos_em_so_grande'], [ok.mpm(), null]] },
    { ok: ok.segundo(), errado: [xml(E.sempre(seq(registar('noise', ruido())))), xml(E.sempre(seq(registar('noise', 33), pausa(1000))))],
      fazer: [{ kit_ruido: 52 }, { esperar: 1500 }, { kit_ruido: 64 }], espera: 3600,
      regras: [[xml(E.botao('A', seq(registar('noise', ruido())))), 'sem_sempre'], [xml(E.sempre(seq(numero(5)))), 'sem_mk_registar_sempre'],
        [xml(E.sempre(seq(registar('noise', ruido())))), 'sem_pausa'], [ok.segundo(), null]] },
    { ok: ok.tres(), errado: [xml(E.sempre(seq(registar('noise', ruido()), registar('light', ruido()), registar('movement', mov()), pausa(1000))))],
      fazer: [{ kit_ruido: 57 }, { kit_luz: 23 }, { esperar: 1200 }], espera: 2400,
      regras: [[xml(E.botao('A', seq(registar('noise', ruido())))), 'sem_sempre'], [xml(E.sempre(seq(numero(5)))), 'sem_mk_registar_sempre'],
        [xml(E.sempre(seq(registar('noise', ruido()), pausa(1000)))), 'poucas_colunas'], [ok.tres(), null]] },
    { ok: ok.cheio(), errado: [xml(E.sempre(seq(se(pir(), [soTexto('BUSY NOW')], [soTexto('CALM')]))))], fazer: [{ esperar: 300 }, ...pulsos(4)], espera: 800,
      regras: [[xml(E.botao('A', seq(soTexto('X')))), 'sem_sempre'], [xml(E.sempre(seq(soTexto('X')))), 'sem_mk_se_sempre'],
        [xml(E.sempre(seq(se(pir(), [soTexto('X')], [soTexto('Y')])))), 'pergunta_pir'], [ok.cheio(), null]] },
  ],
};
