// Casos de teste da missão «Desenhar a calma».
const { xml, E, seq, b, v, num, cmp, conta, icone, pausa, numero, definir, mudar, servo, tom, se, ruido, tomV } = require('../lib');
const ok = {
  passos: () => xml(E.inicio(seq(definir('passos', 1), numero(v('passos')))), E.botao('A', seq(mudar('passos', 1), numero(v('passos'))))),
  conta: () => xml(E.botao('A', seq(numero(3), pausa(1000), numero(2), pausa(1000), numero(1), pausa(1000), icone('Yes')))),
  respirar: () => xml(E.sempre(seq(icone('Heart'), pausa(2000), icone('SmallHeart'), pausa(2000)))),
  bandeira: () => xml(E.sempre(seq(se(cmp(ruido(), '>', 60), [servo('P8', 180)], [servo('P8', 0)])))),
  ouvir: () => xml(E.sempre(seq(tomV(conta(conta(b('mk_luz'), '*', 4), '+', 200))))),
  canto: () => xml(E.sempre(seq(se(cmp(ruido(), '>', 60), [servo('P8', 180), icone('No')], [servo('P8', 0), icone('Heart')])))),
};
module.exports = {
  missao: 'calma',
  casos: [
    { ok: ok.passos(), errado: [xml(E.inicio(seq(definir('passos', 1), numero(v('passos')))), E.botao('A', seq(definir('passos', 2), numero(v('passos')))))],
      fazer: ['botao:A', { esperar: 300 }, 'botao:A'],
      regras: [[xml(E.inicio(seq(definir('passos', 1)))), 'sem_botao_A'], [xml(E.botao('A', seq(numero(v('passos'))))), 'sem_mk_var_mudar_botao_A'],
        [xml(E.botao('A', seq(mudar('passos', 1)))), 'sem_mk_mostrar_numero_botao_A'], [xml(E.botao('A', seq(mudar('passos', 1), numero(5)))), 'sem_mk_var_em_mk_mostrar_numero'], [ok.passos(), null]] },
    { ok: ok.conta(), errado: [xml(E.botao('A', seq(numero(3), numero(2), numero(1), icone('Yes'))))], fazer: ['botao:A'], espera: 4200,
      regras: [[xml(E.sempre(seq(numero(3)))), 'sem_botao_A'], [xml(E.botao('A', seq(icone('Yes')))), 'sem_mk_mostrar_numero_botao_A'],
        [xml(E.botao('A', seq(numero(3), numero(2), numero(1), icone('Yes')))), 'sem_pausa'],
        [xml(E.botao('A', seq(numero(3), pausa(1000), numero(2), pausa(1000), numero(1), pausa(1000)))), 'sem_mk_icone_botao_A'], [ok.conta(), null]] },
    { ok: ok.respirar(), errado: [xml(E.sempre(seq(icone('Heart'), pausa(200), icone('SmallHeart'), pausa(200))))], fazer: [], espera: 7000,
      regras: [[xml(E.botao('A', seq(icone('Heart')))), 'sem_sempre'], [xml(E.sempre(seq(pausa(1000)))), 'sem_mk_icone_sempre'],
        [xml(E.sempre(seq(icone('Heart'), icone('SmallHeart')))), 'rapido'], [ok.respirar(), null]] },
    { ok: ok.bandeira(), errado: [xml(E.sempre(seq(se(cmp(ruido(), '>', 60), [servo('P8', 180)], [servo('P8', 180)]))))], fazer: [{ kit_ruido: 80 }, { esperar: 300 }, { kit_ruido: 40 }, { esperar: 300 }],
      regras: [[xml(E.botao('A', seq(servo('P8', 180)))), 'sem_sempre'], [xml(E.sempre(seq(servo('P8', 180)))), 'sem_mk_se_sempre'],
        [xml(E.sempre(seq(se(cmp(ruido(), '>', 60), [servo('P8', 180)], [])))), 'um_servo'], [ok.bandeira(), null]] },
    { ok: ok.ouvir(), errado: [xml(E.sempre(seq(tomV(conta(conta(b('mk_som_nivel'), '*', 4), '+', 200)))))], fazer: [{ luz: 30 }, { esperar: 300 }, { luz: 200 }, { esperar: 300 }], espera: 900,
      regras: [[xml(E.botao('A', seq(tom(262)))), 'sem_sempre'], [xml(E.sempre(seq(icone('Heart')))), 'sem_mk_tom_sempre'],
        [xml(E.sempre(seq(tom(262)))), 'sem_luz'], [ok.ouvir(), null]] },
    { ok: ok.canto(), errado: [xml(E.sempre(seq(se(cmp(ruido(), '>', 60), [servo('P8', 180), icone('No')], [icone('Heart')]))))], fazer: [{ kit_ruido: 80 }, { esperar: 300 }, { kit_ruido: 40 }, { esperar: 300 }],
      regras: [[xml(E.botao('A', seq(icone('No')))), 'sem_sempre'], [xml(E.sempre(seq(icone('No')))), 'sem_mk_se_sempre'],
        [xml(E.sempre(seq(se(cmp(ruido(), '>', 60), [servo('P8', 180), icone('No')], [icone('Heart')])))), 'falta_sinal'], [ok.canto(), null]] },
  ],
};
