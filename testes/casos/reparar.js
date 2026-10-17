// Casos de teste da missão «Reparar» (um por desafio com validação, pela ordem).
const { xml, E, seq, solto, b, v, cmp, conta, lerD, lerA, icone, tom, som, digital, numero, pausa, servo, registar, definir, mudar, se, seEntao, grafico } = require('../lib');

const okDetetive = xml(E.pino('P1', seq(icone('Yes'), tom(523))));

// ---- programas «gambiarra» (as mesmas que a missão carrega; geradas aqui e copiadas para missoes/reparar.js)
const G = {
  bip: xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 0), tom(523))))),
  condutividade: xml(E.sempre(seq(grafico(lerA('P1'), 255)))),
  condutor: xml(E.botao('A', seq(se(cmp(lerD('P0'), '==', 1), [icone('No')], [icone('Yes')])))),
  pilha: xml(E.botao('A', seq(numero(lerA('P0'))))),
  fios: xml(E.pino('P1', seq(numero(v('contador')), mudar('contador', 1)))),
  ficha: xml(E.botao('A', seq(registar('fio', 1)))),
  campainha: xml(E.logo(seq(som('hello'), icone('Surprised')))),
  escada: xml(E.botao('A', seq(digital('P2', 1), digital('P2', 0)))),
  candeeiro: xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 0)], [digital('P2', 1)])))),
  servo: xml(E.botao('A', seq(servo('P0', 180))), E.botao('B', seq(servo('P0', 180)))),
  porta: xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 1), tom(880))))),
  peluche: xml(E.agitar(seq(som('giggle'), icone('Happy')))),
  contador: xml(E.botao('A', seq(definir('contador', 1))), E.botao('B', seq(numero(v('contador'))))),
  poupar: xml(E.botao('A', seq(digital('P2', 1), definir('medida', b('mk_tempo')))),
    E.sempre(seq(seEntao(cmp(conta(b('mk_tempo'), '-', v('medida')), '<', 3000), digital('P2', 0))))),
  calor: xml(E.sempre(seq(seEntao(cmp(b('mk_temperatura'), '<', 40), tom(880), icone('No'))))),
  registo: xml(E.botao('A', seq(mudar('contador', 1), registar('reparado', 1))), E.botao('B', seq(mudar('pontos', 1), registar('reciclado', v('pontos'))))),
  brinquedo: xml(E.logo(seq(digital('P2', 1), som('happy'))), E.agitar(seq(servo('P0', 180)))),
};

// soluções
const S = {
  bip: xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 1), tom(523))))),
  condutividade: xml(E.sempre(seq(grafico(lerA('P1'), 1023)))),
  condutor: xml(E.botao('A', seq(se(cmp(lerD('P0'), '==', 1), [icone('Yes')], [icone('No')])))),
  pilha: xml(E.botao('A', seq(numero(lerA('P1'))))),
  fios: xml(E.pino('P1', seq(mudar('contador', 1), numero(v('contador'))))),
  ficha: xml(E.botao('A', seq(registar('fio', lerD('P0'))))),
  campainha: xml(E.pino('P1', seq(som('hello'), icone('Surprised')))),
  escada: xml(E.botao('A', seq(digital('P2', 1), pausa(2000), digital('P2', 0)))),
  candeeiro: xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 1)], [digital('P2', 0)])))),
  servo: xml(E.botao('A', seq(servo('P0', 180))), E.botao('B', seq(servo('P0', 0)))),
  porta: xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 0), tom(880))))),
  peluche: xml(E.logo(seq(som('giggle'), icone('Happy')))),
  contador: xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(numero(v('contador'))))),
  poupar: xml(E.botao('A', seq(digital('P2', 1), definir('medida', b('mk_tempo')))),
    E.sempre(seq(seEntao(cmp(conta(b('mk_tempo'), '-', v('medida')), '>', 3000), digital('P2', 0))))),
  calor: xml(E.sempre(seq(seEntao(cmp(b('mk_temperatura'), '>', 40), tom(880), icone('No'))))),
  registo: xml(E.botao('A', seq(mudar('contador', 1), registar('reparado', v('contador')))), E.botao('B', seq(mudar('pontos', 1), registar('reciclado', v('pontos'))))),
  brinquedo: xml(E.logo(seq(digital('P2', 1), som('happy'), servo('P0', 180)))),
};

const P0 = x => ({ 'digital:P0': x });
const A1 = x => ({ 'analogico:P1': x });

// casos antigos (pela ordem antiga): 0 detetive · 1 bip · 2 condutividade · 3 condutor · 4 pilha · 5 fios · 6 ficha ·
// 7 lanterna · 8 campainha · 9 escada · 10 candeeiro · 11 servo · 12 porta · 13 peluche · 14 contador · 15 poupar · 16 calor · 17 registo · 18 brinquedo
const ANTIGOS = [
    // ================= Nível 1 · Diagnosticar
    {
      ok: okDetetive,
      // a gambiarra: certo por dentro, mas no bloco errado (agitar em vez do pino)
      errado: xml(E.agitar(seq(icone('Yes'), tom(523)))),
      fazer: ['pino:P1', 'agitar'], espera: 1800,
      regras: [
        [xml(E.agitar(seq(icone('Yes')))), 'sem_pino'],
        [xml(E.pino('P1', '')), 'sem_sinal'],
        [xml(E.pino('P1', ''), solto(icone('Yes'))), 'sinal_fora'],
        [xml(E.pino('P1', seq(tom()))), 'sem_icone'],
        [xml(E.pino('P1', seq(icone('Happy'), tom()))), 'sem_visto'],
        [xml(E.pino('P1', seq(icone('Yes')))), 'sem_som'],
        [okDetetive, null],
      ],
    },
    { // bip contínuo
      ok: S.bip,
      errado: [G.bip, xml(E.sempre(seq(tom(523)))), xml(E.inicio(seq(seEntao(cmp(lerD('P0'), '==', 1), tom(523)))))],
      fazer: [P0(1), { esperar: 1200 }, P0(0)], espera: 1200,
      regras: [
        [xml(E.botao('A', seq(tom(523)))), 'sem_sempre'],
        [xml(E.sempre(seq(tom(523)))), 'sem_se'],
        [xml(E.sempre(seq(seEntao(b('mk_escuro'), tom(523))))), 'sem_leitura'],
        [xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 1))))), 'sem_mk_tom_sempre'],
        [G.bip, 'invertido'],
        [S.bip, null],
      ],
    },
    { // medidor de condutividade
      ok: S.condutividade,
      errado: [G.condutividade, xml(E.sempre(seq(grafico(b('mk_luz'), 1023)))), xml(E.inicio(seq(grafico(lerA('P1'), 1023))))],
      fazer: [A1(1023), { esperar: 400 }, A1(300)], espera: 600,
      regras: [
        [xml(E.botao('A', seq(grafico(lerA('P1'), 1023)))), 'sem_sempre'],
        [xml(E.sempre(seq(numero(lerA('P1'))))), 'sem_mk_grafico_sempre'],
        [xml(E.sempre(seq(grafico(0, 1023)))), 'sem_mk_ler_analogico_em_mk_grafico'],
        [G.condutividade, 'maximo_errado'],
        [S.condutividade, null],
      ],
    },
    { // condutor ou isolante
      ok: S.condutor,
      errado: [G.condutor, xml(E.botao('A', seq(seEntao(cmp(lerD('P0'), '==', 1), icone('Yes'))))), xml(E.botao('A', seq(icone('Yes'))))],
      fazer: [P0(1), 'botao:A', { esperar: 300 }, P0(0), 'botao:A'], espera: 600,
      regras: [
        [xml(E.botao('B', seq(icone('Yes')))), 'sem_botao_A'],
        [xml(E.botao('A', seq(icone('Yes')))), 'sem_se'],
        [xml(E.botao('A', seq(se(b('mk_escuro'), [icone('Yes')], [icone('No')])))), 'sem_leitura'],
        [xml(E.botao('A', seq(se(cmp(lerD('P0'), '==', 1), [icone('Yes')], [])))), 'falta_nao'],
        [G.condutor, 'trocados'],
        [S.condutor, null],
      ],
    },
    { // pilha cansada
      ok: S.pilha,
      errado: [G.pilha, xml(E.botao('A', seq(numero(b('mk_luz'))))), xml(E.botao('A', seq(numero(930))))],
      fazer: [A1(930), 'botao:A', { esperar: 2000 }, A1(250), 'botao:A'], espera: 2000,
      regras: [
        [xml(E.botao('B', seq(numero(lerA('P1'))))), 'sem_botao_A'],
        [xml(E.botao('A', seq(icone('Happy')))), 'sem_mk_mostrar_numero_botao_A'],
        [xml(E.botao('A', seq(numero(0)))), 'sem_mk_ler_analogico_em_mk_mostrar_numero'],
        [G.pilha, 'pino_errado'],
        [S.pilha, null],
      ],
    },
    { // procurar o fio partido
      ok: S.fios,
      errado: [G.fios, xml(E.pino('P1', seq(definir('contador', 1), numero(v('contador')))))],
      fazer: ['pino:P1', { esperar: 300 }, 'pino:P1', { esperar: 300 }, 'pino:P1'], espera: 600,
      regras: [
        [xml(E.botao('A', seq(mudar('contador', 1)))), 'sem_pino_'],
        [xml(E.pino('P1', seq(numero(v('contador'))))), 'sem_mk_var_mudar_pino_'],
        [xml(E.pino('P1', seq(mudar('contador', 1)))), 'sem_mk_mostrar_numero_pino_'],
        [xml(E.pino('P1', seq(mudar('contador', 1), numero(1)))), 'sem_mk_var_em_mk_mostrar_numero'],
        [G.fios, 'ordem'],
        [S.fios, null],
      ],
    },
    { // ficha de diagnóstico
      ok: S.ficha,
      errado: [G.ficha, xml(E.botao('A', seq(numero(lerD('P0')))))],
      fazer: [P0(1), 'botao:A', { esperar: 200 }, P0(0), 'botao:A'], espera: 600,
      regras: [
        [xml(E.botao('B', seq(registar('fio', lerD('P0'))))), 'sem_botao_A'],
        [xml(E.botao('A', seq(numero(lerD('P0'))))), 'sem_mk_registar_botao_A'],
        [G.ficha, 'sem_mk_ler_digital_em_mk_registar'],
        [S.ficha, null],
      ],
    },
    // ================= Nível 2 · Substituir a peça
    {
      ok: xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P2', 0)))),
      // a gambiarra: o B também acende (a lanterna nunca apaga)
      errado: xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P2', 1)))),
      fazer: ['botao:A', 'botao:B'],
      regras: [
        [xml(E.botao('A', seq(digital('P2', 1)))), 'so_um_botao'],
        [xml(E.botao('A', seq(digital('P2', 0))), E.botao('B', seq(digital('P2', 1)))), 'trocados'],
        [xml(E.botao('A', ''), E.botao('B', '')), 'sem_acender'],
        [xml(E.botao('A', seq(digital('P2', 1), digital('P2', 0))), E.botao('B', seq(digital('P2', 0)))), 'a_pisca'],
        [xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P2', 1)))), 'sem_apagar'],
        [xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P1', 0)))), 'pinos_diferentes'],
        [xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P2', 0)))), null],
      ],
    },
    { // campainha nova
      ok: S.campainha,
      errado: [G.campainha, xml(E.pino('P1', seq(icone('Surprised'))))],
      fazer: ['pino:P1', { esperar: 1300 }, 'logo'], espera: 1500,
      regras: [
        [G.campainha, 'sem_pino_'],
        [xml(E.pino('P1', seq(icone('Surprised')))), 'sem_som'],
        [xml(E.pino('P1', seq(som('hello')))), 'sem_mk_icone_pino_'],
        [S.campainha, null],
      ],
    },
    { // luz de escada (temporizador)
      ok: S.escada,
      errado: [G.escada, xml(E.botao('A', seq(digital('P2', 1))))],
      fazer: ['botao:A'], espera: 2600,
      regras: [
        [xml(E.botao('B', seq(digital('P2', 1)))), 'sem_botao_A'],
        [xml(E.botao('A', seq(pausa(2000), digital('P2', 0)))), 'sem_acender'],
        [xml(E.botao('A', seq(digital('P2', 1), pausa(2000)))), 'sem_apagar'],
        [G.escada, 'sem_pausa'],
        [xml(E.botao('A', seq(digital('P2', 1), pausa(200), digital('P2', 0)))), 'pausa_curta'],
        [S.escada, null],
      ],
    },
    { // candeeiro automático
      ok: S.candeeiro,
      errado: [G.candeeiro, xml(E.sempre(seq(digital('P2', 1))))],
      fazer: [{ luz: 10 }, { esperar: 500 }, { luz: 200 }], espera: 600,
      regras: [
        [xml(E.botao('A', seq(se(b('mk_escuro'), [digital('P2', 1)], [digital('P2', 0)])))), 'sem_sempre'],
        [xml(E.sempre(seq(digital('P2', 1)))), 'sem_se'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [], [digital('P2', 0)])))), 'sem_acender'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 1)], [])))), 'sem_apagar'],
        [G.candeeiro, 'trocados'],
        [S.candeeiro, null],
      ],
    },
    { // servo no lugar do motor
      ok: S.servo,
      errado: [G.servo, xml(E.botao('A', seq(servo('P0', 180))))],
      fazer: ['botao:A', 'botao:B'], espera: 600,
      regras: [
        [xml(E.logo(seq(servo('P0', 180)))), 'sem_botoes'],
        [xml(E.botao('A', seq(servo('P0', 180)))), 'so_um_botao'],
        [xml(E.botao('A', ''), E.botao('B', seq(servo('P0', 0)))), 'sem_mk_servo_botao_A'],
        [xml(E.botao('A', seq(servo('P0', 180))), E.botao('B', '')), 'sem_mk_servo_botao_B'],
        [G.servo, 'angulos_iguais'],
        [S.servo, null],
      ],
    },
    { // alarme da porta
      ok: S.porta,
      errado: [G.porta, xml(E.sempre(seq(tom(880))))],
      fazer: [P0(1), { esperar: 900 }, P0(0)], espera: 1200,
      regras: [
        [xml(E.botao('A', seq(tom(880)))), 'sem_sempre'],
        [xml(E.sempre(seq(tom(880)))), 'sem_se'],
        [xml(E.sempre(seq(seEntao(b('mk_escuro'), tom(880))))), 'sem_leitura'],
        [xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 0))))), 'sem_mk_tom_sempre'],
        [G.porta, 'invertido'],
        [S.porta, null],
      ],
    },
    { // peluche com voz nova
      ok: S.peluche,
      errado: [G.peluche, xml(E.logo(seq(icone('Happy'))))],
      fazer: ['logo', { esperar: 1300 }, 'agitar'], espera: 1500,
      regras: [
        [G.peluche, 'sem_logo'],
        [xml(E.logo(seq(icone('Happy')))), 'sem_som'],
        [xml(E.logo(seq(som('giggle')))), 'sem_mk_icone_logo'],
        [S.peluche, null],
      ],
    },
    // ================= Nível 3 · Melhorar e cuidar
    { // contador do Repair Café
      ok: S.contador,
      errado: [G.contador, xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(numero(3))))],
      fazer: ['botao:A', 'botao:B', { esperar: 400 }, 'botao:A', 'botao:A', 'botao:B'], espera: 600,
      regras: [
        [xml(E.botao('B', seq(numero(v('contador'))))), 'sem_botao_A'],
        [G.contador, 'usa_definir'],
        [xml(E.botao('A', seq(icone('Yes'))), E.botao('B', seq(numero(v('contador'))))), 'sem_mk_var_mudar_botao_A'],
        [xml(E.botao('A', seq(mudar('contador', 1)))), 'sem_botao_B'],
        [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(numero(3)))), 'sem_mk_var_em_mk_mostrar_numero'],
        [S.contador, null],
      ],
    },
    { // poupar energia
      ok: S.poupar,
      errado: [G.poupar, xml(E.botao('A', seq(digital('P2', 1))))],
      fazer: ['botao:A'], espera: 3800,
      regras: [
        [xml(E.sempre(seq(digital('P2', 0)))), 'sem_botao_A'],
        [xml(E.botao('A', seq(definir('medida', b('mk_tempo'))))), 'a_sem_acender'],
        [xml(E.botao('A', seq(digital('P2', 1)))), 'sem_guardar_tempo'],
        [xml(E.botao('A', seq(digital('P2', 1), definir('medida', b('mk_tempo'))))), 'sem_sempre'],
        [xml(E.botao('A', seq(digital('P2', 1), definir('medida', b('mk_tempo')))), E.sempre(seq(digital('P2', 0)))), 'sem_se'],
        [xml(E.botao('A', seq(digital('P2', 1), definir('medida', b('mk_tempo')))), E.sempre(seq(seEntao(cmp(b('mk_tempo'), '>', 3000), digital('P2', 0))))), 'sem_conta'],
        [G.poupar, 'sinal_trocado'],
        [S.poupar, null],
      ],
    },
    { // alarme de sobreaquecimento
      ok: S.calor,
      errado: [G.calor, xml(E.sempre(seq(seEntao(cmp(b('mk_temperatura'), '>', 40), icone('No')))))],
      fazer: [{ temperatura: 25 }, { esperar: 700 }, { temperatura: 45 }], espera: 1200,
      regras: [
        [xml(E.botao('A', seq(tom(880)))), 'sem_sempre'],
        [xml(E.sempre(seq(tom(880)))), 'sem_se'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_luz'), '>', 40), tom(880))))), 'sem_temperatura'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_temperatura'), '>', 40), icone('No'))))), 'sem_mk_tom_sempre'],
        [G.calor, 'sinal_trocado'],
        [S.calor, null],
      ],
    },
    { // registo de reparações
      ok: S.registo,
      errado: [G.registo, xml(E.botao('A', seq(mudar('contador', 1), registar('reparado', v('contador')))), E.botao('B', seq(registar('reparado', 1))))],
      fazer: ['botao:A', 'botao:A', 'botao:B'], espera: 600,
      regras: [
        [xml(E.botao('B', seq(registar('reciclado', 1)))), 'sem_botao_A'],
        [xml(E.botao('A', seq(mudar('contador', 1)))), 'sem_mk_registar_botao_A'],
        [xml(E.botao('A', seq(registar('reparado', v('contador'))))), 'sem_mk_var_mudar_botao_A'],
        [G.registo, 'sem_mk_var_em_mk_registar'],
        [xml(E.botao('A', seq(mudar('contador', 1), registar('reparado', v('contador'))))), 'sem_botao_B'],
        [S.registo, null],
      ],
    },
    { // melhorar um brinquedo
      ok: S.brinquedo,
      errado: [G.brinquedo, xml(E.logo(seq(som('happy'))))],
      fazer: ['logo', { esperar: 1300 }, 'agitar'], espera: 1200,
      regras: [
        [xml(E.botao('A', seq(som('happy')))), 'sem_logo'],
        [xml(E.logo(seq(som('happy'), servo('P0', 180)))), 'sem_luz'],
        [xml(E.logo(seq(digital('P2', 1), servo('P0', 180)))), 'sem_som'],
        [G.brinquedo, 'sem_mk_servo_logo'],
        [S.brinquedo, null],
      ],
    },
];

// ---------------------------------------------------------------- projetos complexos novos (7.º–11.º de cada nível)
const L = require('../lib');
const { texto, repetir, limpar, val } = L;
const I = (tipo, interior = '') => [`<block type="${tipo}">${interior}`, '</block>'];
const tomN = (n, bat = 0.25) => I('mk_tom', (typeof n === 'number' ? val('F', n) : `<value name="F">${n}</value>`) + `<value name="BAT"><shadow type="mk_batida_menu"><field name="V">${bat}</field></shadow></value>`);
// gambiarras (as mesmas que estão em missoes/reparar.js → GAMB; se mudares aqui, copia para lá)
const G2 = {
  semaforo: xml(E.botao('A', seq(se(cmp(lerA('P1'), '>', 500), [icone('Happy')], [se(cmp(lerA('P1'), '>', 800), [icone('Asleep')], [icone('Sad')])])))),
  banco: xml(E.botao('A', seq(mudar('pontos', 1), se(cmp(lerD('P0'), '==', 1), [icone('Yes')], [icone('No')]))), E.botao('B', seq(numero(v('pontos'))))),
  diagnostico: xml(E.botao('A', seq(se(cmp(lerA('P1'), '>', 500), [texto('PILHA OK')], [texto('TROCA A PILHA')]))),
    E.botao('B', seq(se(cmp(lerD('P0'), '==', 0), [texto('LAMPADA OK')], [texto('TROCA A LAMPADA')])))),
  canta: xml(E.sempre(seq(grafico(lerA('P1'), 1023), tomN(440)))),
  inventario: xml(E.botao('A', seq(numero(lerA('P1')), registar('pilha', lerA('P1')))), E.botao('B', seq(numero(v('contador'))))),
  candeeiroT: xml(E.botao('A', seq(digital('P2', 1), icone('Happy'), digital('P2', 0), pausa(3000), limpar())), E.botao('B', seq(digital('P2', 0), limpar()))),
  surdos: xml(E.pino('P1', seq(repetir(3, digital('P2', 1), tom(523), pausa(200)), icone('Surprised')))),
  codigo: xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(se(cmp(v('contador'), '==', 3), [servo('P0', 90), icone('Yes')], [servo('P0', 0), icone('No')])))),
  ventoinha: xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 28), [servo('P0', 180), digital('P2', 1)], [])))),
  musical: xml(E.logo(seq(repetir(2, servo('P0', 0), tom(262), tom(262), digital('P2', 1), servo('P0', 180), tom(262), tom(262), digital('P2', 0))))),
  balcao: xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('pontos', 1))), E.botao('AB', seq(numero(v('contador')), registar('total', v('contador'))))),
  taxa: xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('pontos', 1))), E.logo(seq(numero(conta(conta(v('contador'), '*', 100), '/', v('pontos')))))),
  presenca: xml(E.somalto(seq(digital('P2', 1))), E.sempre(seq(seEntao(cmp(conta(b('mk_tempo'), '-', v('medida')), '>', 3000), digital('P2', 0))))),
  seguro: xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 40), [digital('P2', 0), tom(880), registar('quente', 40)], [digital('P2', 1)])))),
};
// soluções
const S2 = {
  semaforo: xml(E.botao('A', seq(se(cmp(lerA('P1'), '>', 800), [icone('Happy')], [se(cmp(lerA('P1'), '>', 500), [icone('Asleep')], [icone('Sad')])])))),
  banco: xml(E.botao('A', seq(se(cmp(lerD('P0'), '==', 1), [mudar('pontos', 1), icone('Yes')], [icone('No')]))), E.botao('B', seq(numero(v('pontos'))))),
  diagnostico: xml(E.botao('A', seq(se(cmp(lerA('P1'), '>', 500), [texto('PILHA OK')], [texto('TROCA A PILHA')]))),
    E.botao('B', seq(se(cmp(lerD('P0'), '==', 1), [texto('LAMPADA OK')], [texto('TROCA A LAMPADA')])))),
  canta: xml(E.sempre(seq(grafico(lerA('P1'), 1023), tomN(conta(lerA('P1'), '+', 200))))),
  inventario: xml(E.botao('A', seq(numero(lerA('P1')), registar('pilha', lerA('P1')), mudar('contador', 1))), E.botao('B', seq(numero(v('contador'))))),
  candeeiroT: xml(E.botao('A', seq(digital('P2', 1), icone('Happy'), pausa(3000), digital('P2', 0), limpar())), E.botao('B', seq(digital('P2', 0), limpar()))),
  surdos: xml(E.pino('P1', seq(repetir(3, digital('P2', 1), tom(523), digital('P2', 0), pausa(200)), icone('Surprised')))),
  codigo: xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(se(cmp(v('contador'), '==', 3), [servo('P0', 90), icone('Yes')], [servo('P0', 0), icone('No')]), definir('contador', 0)))),
  ventoinha: xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 28), [servo('P0', 180), digital('P2', 1)], [servo('P0', 0), digital('P2', 0)])))),
  musical: xml(E.logo(seq(repetir(2, servo('P0', 0), tom(262), tom(330), digital('P2', 1), servo('P0', 180), tom(392), tom(523), digital('P2', 0))))),
  balcao: xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('pontos', 1))), E.botao('AB', seq(numero(conta(v('contador'), '+', v('pontos'))), registar('total', conta(v('contador'), '+', v('pontos')))))),
  taxa: xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('pontos', 1))), E.logo(seq(numero(conta(conta(v('contador'), '*', 100), '/', conta(v('contador'), '+', v('pontos'))))))),
  presenca: xml(E.somalto(seq(digital('P2', 1), definir('medida', b('mk_tempo')))), E.sempre(seq(seEntao(cmp(conta(b('mk_tempo'), '-', v('medida')), '>', 3000), digital('P2', 0))))),
  seguro: xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 40), [digital('P2', 0), tom(880), registar('quente', b('mk_temperatura'))], [digital('P2', 1)])))),
};
const T = x => ({ temperatura: x });
const W = ms => ({ esperar: ms });
const NOVOS = {
  semaforo: {
    ok: S2.semaforo,
    errado: [G2.semaforo, xml(E.botao('A', seq(se(cmp(lerA('P1'), '>', 500), [icone('Happy')], [icone('Sad')]))))],
    fazer: [A1(950), 'botao:A', W(300), A1(650), 'botao:A', W(300), A1(200), 'botao:A'],
    regras: [
      [xml(E.agitar(seq(icone('Happy')))), 'sem_botao_A'],
      [xml(E.botao('A', seq(icone('Happy')))), 'sem_se'],
      [xml(E.botao('A', seq(se(b('mk_escuro'), [icone('Happy')], [icone('Sad')])))), 'sem_leitura'],
      [xml(E.botao('A', seq(se(cmp(lerA('P1'), '>', 800), [icone('Happy')], [icone('Sad')])))), 'so_dois'],
      [G2.semaforo, 'limiares'],
      [xml(E.botao('A', seq(se(cmp(lerA('P1'), '>', 800), [icone('Happy')], [se(cmp(lerA('P1'), '>', 500), [icone('Sad')], [])])))), 'falta_cara'],
      [S2.semaforo, null],
    ],
  },
  banco: {
    ok: S2.banco,
    errado: [G2.banco, xml(E.botao('A', seq(se(cmp(lerD('P0'), '==', 1), [mudar('pontos', 1), icone('Yes')], [icone('No')]))), E.botao('B', seq(numero(v('contador')))))],
    fazer: [P0(1), 'botao:A', P0(0), 'botao:A', P0(1), 'botao:A', W(200), 'botao:B'],
    regras: [
      [xml(E.botao('B', seq(numero(v('pontos'))))), 'sem_botao_A'],
      [xml(E.botao('A', seq(icone('Yes')))), 'sem_se'],
      [xml(E.botao('A', seq(se(b('mk_escuro'), [icone('Yes')], [icone('No')])))), 'sem_leitura'],
      [xml(E.botao('A', seq(se(cmp(lerD('P0'), '==', 1), [icone('Yes')], [icone('No')])))), 'sem_contar'],
      [G2.banco, 'conta_tudo'],
      [xml(E.botao('A', seq(se(cmp(lerD('P0'), '==', 1), [mudar('pontos', 1), icone('Yes')], [icone('No')])))), 'sem_botao_B'],
      [xml(E.botao('A', seq(se(cmp(lerD('P0'), '==', 1), [mudar('pontos', 1), icone('Yes')], [icone('No')]))), E.botao('B', seq(numero(v('contador'))))), 'vars_diferentes'],
      [S2.banco, null],
    ],
  },
  diagnostico: {
    ok: S2.diagnostico,
    errado: [G2.diagnostico, xml(E.botao('A', seq(texto('PILHA OK'))), E.botao('B', seq(texto('LAMPADA OK'))))],
    // os textos passam devagar (e bloqueiam o botão): esperar que acabem antes do teste seguinte
    fazer: [A1(900), 'botao:A', W(4800), A1(100), 'botao:A', W(6800), P0(1), 'botao:B', W(5800), P0(0), 'botao:B'],
    espera: 1500,
    regras: [
      [xml(E.botao('B', seq(texto('OK')))), 'sem_botao_A'],
      [xml(E.botao('A', seq(texto('PILHA OK')))), 'a_sem_se'],
      [xml(E.botao('A', seq(se(b('mk_escuro'), [texto('PILHA OK')], [texto('TROCA')])))), 'a_sem_leitura'],
      [xml(E.botao('A', seq(se(cmp(lerA('P1'), '>', 500), [icone('Yes')], [icone('No')])))), 'a_sem_texto'],
      [xml(E.botao('A', seq(se(cmp(lerA('P1'), '>', 500), [texto('PILHA OK')], [texto('TROCA A PILHA')])))), 'sem_botao_B'],
      [G2.diagnostico, 'b_invertido'],
      [S2.diagnostico, null],
    ],
  },
  canta: {
    ok: S2.canta,
    errado: [G2.canta, xml(E.sempre(seq(tomN(conta(lerA('P1'), '+', 200)))))],
    fazer: [A1(950), W(800), A1(100), W(800)],
    regras: [
      [xml(E.botao('A', seq(grafico(lerA('P1'), 1023)))), 'sem_sempre'],
      [xml(E.sempre(seq(tomN(440)))), 'sem_mk_grafico_sempre'],
      [xml(E.sempre(seq(grafico(0, 1023)))), 'sem_mk_ler_analogico_em_mk_grafico'],
      [xml(E.sempre(seq(grafico(lerA('P1'), 255)))), 'maximo_errado'],
      [xml(E.sempre(seq(grafico(lerA('P1'), 1023)))), 'sem_mk_tom_sempre'],
      [G2.canta, 'sem_mk_ler_analogico_em_mk_tom'],
      [S2.canta, null],
    ],
  },
  inventario: {
    ok: S2.inventario,
    errado: [G2.inventario, xml(E.botao('A', seq(numero(lerA('P1')), registar('pilha', 1), mudar('contador', 1))), E.botao('B', seq(numero(v('contador')))))],
    fazer: [A1(900), 'botao:A', W(2800), A1(600), 'botao:A', W(2800), A1(300), 'botao:A', W(2800), 'botao:B'],
    regras: [
      [xml(E.botao('B', seq(numero(v('contador'))))), 'sem_botao_A'],
      [xml(E.botao('A', seq(numero(5)))), 'sem_mk_ler_analogico_em_mk_mostrar_numero'],
      [xml(E.botao('A', seq(numero(lerA('P1'))))), 'sem_mk_registar_botao_A'],
      [xml(E.botao('A', seq(numero(lerA('P1')), registar('pilha', 1)))), 'sem_mk_ler_analogico_em_mk_registar'],
      [xml(E.botao('A', seq(numero(lerA('P1')), registar('pilha', lerA('P1'))))), 'sem_mk_var_mudar_botao_A'],
      [xml(E.botao('A', seq(numero(lerA('P1')), registar('pilha', lerA('P1')), mudar('contador', 1)))), 'sem_botao_B'],
      [G2.inventario, 'sem_mk_var_mudar_botao_A'],
      [S2.inventario, null],
    ],
  },
  candeeiroT: {
    ok: S2.candeeiroT,
    errado: [G2.candeeiroT, xml(E.botao('A', seq(digital('P2', 1), icone('Happy'), pausa(3000), digital('P2', 0))))],
    fazer: ['botao:A', W(3600), 'botao:A', W(200), 'botao:B'],
    espera: 3500,
    regras: [
      [xml(E.botao('B', seq(digital('P2', 0)))), 'sem_botao_A'],
      [xml(E.botao('A', seq(icone('Happy')))), 'a_sem_acender'],
      [xml(E.botao('A', seq(digital('P2', 1), icone('Happy')))), 'a_sem_apagar'],
      [G2.candeeiroT, 'ordem_pausa'],
      [xml(E.botao('A', seq(digital('P2', 1), icone('Happy'), digital('P2', 0)))), 'sem_pausa'],
      [xml(E.botao('A', seq(digital('P2', 1), icone('Happy'), pausa(500), digital('P2', 0)))), 'pausa_curta'],
      [xml(E.botao('A', seq(digital('P2', 1), pausa(3000), digital('P2', 0)))), 'sem_mk_icone_botao_A'],
      [xml(E.botao('A', seq(digital('P2', 1), icone('Happy'), pausa(3000), digital('P2', 0), limpar()))), 'sem_botao_B'],
      [S2.candeeiroT, null],
    ],
  },
  surdos: {
    ok: S2.surdos,
    errado: [G2.surdos, xml(E.pino('P1', seq(digital('P2', 1), tom(523), digital('P2', 0), icone('Surprised'))))],
    fazer: ['pino:P1'],
    espera: 3200,
    regras: [
      [xml(E.botao('A', seq(icone('Happy')))), 'sem_pino_'],
      [xml(E.pino('P1', seq(digital('P2', 1), tom(523), digital('P2', 0)))), 'sem_repetir'],
      [xml(E.pino('P1', seq(repetir(2, digital('P2', 1), tom(523), digital('P2', 0))))), 'poucas_vezes'],
      [xml(E.pino('P1', seq(repetir(3, tom(523))))), 'sem_luz'],
      [G2.surdos, 'nao_pisca'],
      [xml(E.pino('P1', seq(repetir(3, digital('P2', 1), pausa(200), digital('P2', 0), pausa(200))))), 'sem_som'],
      [xml(E.pino('P1', seq(repetir(3, digital('P2', 1), tom(523), digital('P2', 0), pausa(200))))), 'sem_mk_icone_pino_'],
      [S2.surdos, null],
    ],
  },
  codigo: {
    ok: S2.codigo,
    errado: [G2.codigo, xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(se(cmp(v('contador'), '>', 0), [servo('P0', 90), icone('Yes')], [servo('P0', 0), icone('No')]), definir('contador', 0))))],
    fazer: ['botao:A', 'botao:A', 'botao:A', 'botao:B', W(500), 'botao:A', 'botao:B'],
    regras: [
      [xml(E.botao('B', seq(servo('P0', 90)))), 'sem_botao_A'],
      [xml(E.botao('A', seq(icone('Yes')))), 'sem_mk_var_mudar_botao_A'],
      [xml(E.botao('A', seq(mudar('contador', 1)))), 'sem_botao_B'],
      [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(servo('P0', 90)))), 'b_sem_se'],
      [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(se(b('mk_escuro'), [servo('P0', 90)], [servo('P0', 0)])))), 'b_sem_var'],
      [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(se(cmp(v('contador'), '==', 5), [servo('P0', 90)], [servo('P0', 0)])))), 'numero_codigo'],
      [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(se(cmp(v('contador'), '==', 3), [icone('Yes')], [icone('No')])))), 'sem_servo'],
      [G2.codigo, 'sem_reset'],
      [S2.codigo, null],
    ],
  },
  ventoinha: {
    ok: S2.ventoinha,
    errado: [G2.ventoinha, xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 28), [servo('P0', 180)], [servo('P0', 0)]))))],
    fazer: [T(35), W(400), T(20), W(400)],
    regras: [
      [xml(E.botao('A', seq(servo('P0', 180)))), 'sem_sempre'],
      [xml(E.sempre(seq(servo('P0', 180)))), 't_sem_se'],
      [xml(E.sempre(seq(se(b('mk_escuro'), [servo('P0', 180)], [servo('P0', 0)])))), 'sem_temperatura'],
      [xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '<', 28), [servo('P0', 180), digital('P2', 1)], [servo('P0', 0), digital('P2', 0)])))), 'sinal_trocado'],
      [xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 28), [digital('P2', 1)], [digital('P2', 0)])))), 'sem_servo'],
      [xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 28), [servo('P0', 180)], [servo('P0', 0), digital('P2', 0)])))), 'sem_luz'],
      [G2.ventoinha, 'senao_vazio'],
      [S2.ventoinha, null],
    ],
  },
  musical: {
    ok: S2.musical,
    errado: [G2.musical, xml(E.logo(seq(repetir(2, tom(262), tom(330), tom(392), tom(523), digital('P2', 1), digital('P2', 0)))))],
    fazer: ['logo'],
    espera: 4800,
    regras: [
      [xml(E.agitar(seq(tom(262)))), 'sem_logo'],
      [G2.musical, 'sem_melodia'],
      [xml(E.logo(seq(tom(262), tom(330), tom(392)))), 'sem_mk_servo_logo'],
      [xml(E.logo(seq(tom(262), tom(330), tom(392), servo('P0', 90)))), 'servo_parado'],
      [xml(E.logo(seq(tom(262), tom(330), tom(392), servo('P0', 0), servo('P0', 180)))), 'sem_luz'],
      [xml(E.logo(seq(tom(262), tom(330), tom(392), servo('P0', 0), servo('P0', 180), digital('P2', 1)))), 'sem_apagar'],
      [S2.musical, null],
    ],
  },
  balcao: {
    ok: S2.balcao,
    errado: [G2.balcao, xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('contador', 1))), E.botao('AB', seq(numero(conta(v('contador'), '+', v('pontos'))), registar('total', conta(v('contador'), '+', v('pontos'))))))],
    fazer: ['botao:A', 'botao:A', 'botao:B', 'botao:AB', W(500), 'botao:A', 'botao:B', 'botao:AB'],
    regras: [
      [xml(E.botao('B', seq(mudar('pontos', 1)))), 'sem_botao_A'],
      [xml(E.botao('A', seq(icone('Yes')))), 'sem_mk_var_mudar_botao_A'],
      [xml(E.botao('A', seq(mudar('contador', 1)))), 'sem_botao_B'],
      [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('contador', 1)))), 'mesma_var'],
      [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('pontos', 1)))), 'sem_botao_AB'],
      [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('pontos', 1))), E.botao('AB', seq(numero(v('contador'))))), 'sem_mk_conta_em_mk_mostrar_numero'],
      [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('pontos', 1))), E.botao('AB', seq(numero(conta(v('contador'), '+', v('pontos')))))), 'sem_mk_registar_botao_AB'],
      [G2.balcao, 'sem_mk_conta_em_mk_mostrar_numero'],
      [S2.balcao, null],
    ],
  },
  taxa: {
    ok: S2.taxa,
    errado: [G2.taxa, xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('pontos', 1))), E.logo(seq(numero(conta(v('contador'), '/', conta(v('contador'), '+', v('pontos')))))))],
    fazer: ['botao:A', 'botao:A', 'botao:A', 'botao:B', 'logo', W(2200), 'botao:A', 'logo'],
    espera: 1800,
    regras: [
      [xml(E.botao('B', seq(mudar('pontos', 1)))), 'sem_botao_A'],
      [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('contador', 1)))), 'mesma_var'],
      [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('pontos', 1)))), 'sem_logo'],
      [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('pontos', 1))), E.logo(seq(icone('Happy')))), 'sem_mk_mostrar_numero_logo'],
      [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('pontos', 1))), E.logo(seq(numero(conta(v('contador'), '*', 100))))), 'sem_dividir'],
      [G2.taxa, 'divide_mal'],
      [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(mudar('pontos', 1))), E.logo(seq(numero(conta(v('contador'), '/', conta(v('contador'), '+', v('pontos'))))))), 'sem_vezes100'],
      [S2.taxa, null],
    ],
  },
  presenca: {
    ok: S2.presenca,
    errado: [G2.presenca, xml(E.somalto(seq(digital('P2', 1), definir('medida', b('mk_tempo')))), E.sempre(seq(seEntao(cmp(conta(b('mk_tempo'), '-', v('medida')), '<', 3000), digital('P2', 0)))))],
    // bater palmas depois de 3 s de programa (senão a «medida» a 0 ainda não fez apagar)
    fazer: [W(3500), 'somalto'],
    espera: 3800,
    regras: [
      [xml(E.botao('A', seq(digital('P2', 1)))), 'sem_somalto'],
      [xml(E.somalto(seq(icone('Happy')))), 'a_sem_acender'],
      [G2.presenca, 'sem_guardar_tempo'],
      [xml(E.somalto(seq(digital('P2', 1), definir('medida', b('mk_tempo'))))), 'sem_sempre'],
      [xml(E.somalto(seq(digital('P2', 1), definir('medida', b('mk_tempo')))), E.sempre(seq(digital('P2', 0)))), 'sem_se'],
      [xml(E.somalto(seq(digital('P2', 1), definir('medida', b('mk_tempo')))), E.sempre(seq(seEntao(cmp(b('mk_tempo'), '>', 3000), digital('P2', 0))))), 'sem_conta'],
      [xml(E.somalto(seq(digital('P2', 1), definir('medida', b('mk_tempo')))), E.sempre(seq(seEntao(cmp(conta(b('mk_tempo'), '-', v('medida')), '<', 3000), digital('P2', 0))))), 'sinal_trocado'],
      [xml(E.somalto(seq(digital('P2', 1), definir('medida', b('mk_tempo')))), E.sempre(seq(seEntao(cmp(conta(b('mk_tempo'), '-', v('medida')), '>', 3000), icone('Asleep'))))), 'sem_apagar'],
      [S2.presenca, null],
    ],
  },
  seguro: {
    ok: S2.seguro,
    errado: [G2.seguro, xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 40), [digital('P2', 0), registar('quente', b('mk_temperatura'))], [digital('P2', 1)]))))],
    fazer: [T(45), W(1200), T(25), W(400)],
    regras: [
      [xml(E.botao('A', seq(digital('P2', 0)))), 'sem_sempre'],
      [xml(E.sempre(seq(digital('P2', 0)))), 's_sem_se'],
      [xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 0)], [digital('P2', 1)])))), 'sem_temperatura'],
      [xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '<', 40), [digital('P2', 0), tom(880), registar('quente', b('mk_temperatura'))], [digital('P2', 1)])))), 'sinal_trocado'],
      [xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 40), [tom(880)], [digital('P2', 1)])))), 'sem_cortar'],
      [xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 40), [digital('P2', 0)], [digital('P2', 1)])))), 'sem_alarme'],
      [G2.seguro, 'registo_fixo'],
      [xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 40), [digital('P2', 0), tom(880), registar('quente', b('mk_temperatura'))], [])))), 'sem_religar'],
      [S2.seguro, null],
    ],
  },
};
const A = ANTIGOS, N = NOVOS;
module.exports = {
  missao: 'reparar',
  G, S, G2, S2,
  casos: [
    // Nível 1 · Diagnosticar
    A[0], A[1], A[2], A[3], A[4], A[5], N.semaforo, N.banco, N.diagnostico, N.canta, N.inventario,
    // Nível 2 · Substituir a peça
    A[7], A[8], A[13], A[9], A[10], A[11], N.candeeiroT, N.surdos, N.codigo, N.ventoinha, N.musical,
    // Nível 3 · Melhorar e cuidar
    A[14], A[6], A[12], A[16], A[17], A[18], A[15], N.balcao, N.taxa, N.presenca, N.seguro,
  ],
};
