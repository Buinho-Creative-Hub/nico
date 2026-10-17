// Casos de teste da missão «Citizen sensing» (um por desafio com validação, pela ordem).
const { xml, E, seq, solto, b, v, num, conta, cmp, lerA, icone, limpar, pausa, tom, som, digital, numero, texto, grafico, definir, mudar, registar, se, seEntao } = require('../lib');

// soluções
const ok = {
  luz: xml(E.botao('A', seq(numero(b('mk_luz'))))),
  temp: xml(E.botao('B', seq(numero(b('mk_temperatura'))))),
  som: xml(E.logo(seq(numero(b('mk_som_nivel'))))),
  grafLuz: xml(E.sempre(seq(grafico(b('mk_luz'), 255)))),
  grafSom: xml(E.sempre(seq(grafico(b('mk_som_nivel'), 255)))),
  termo: xml(E.sempre(seq(numero(b('mk_temperatura')), pausa(1000)))),
  semaforo: xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [icone('Sad')], [icone('Happy')])))),
  presenca: xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 1)], [digital('P2', 0)])))),
  quente: xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 25), [icone('Surprised')], [limpar()])))),
  contador: xml(E.somalto(seq(mudar('contador', 1), numero(v('contador'))))),
  limite: xml(E.inicio(seq(definir('medida', 100))), E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', v('medida')), [icone('Sad')], [icone('Happy')])))),
  mapa: xml(E.botao('A', seq(registar('luz', b('mk_luz')))), E.botao('B', seq(registar('som', b('mk_som_nivel'))))),
  estacao: xml(E.sempre(seq(registar('luz', b('mk_luz')), registar('som', b('mk_som_nivel')), registar('temperatura', b('mk_temperatura')), pausa(1000)))),
  recorde: xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '>', v('recorde')), definir('recorde', b('mk_som_nivel'))))), E.botao('A', seq(numero(v('recorde'))))),
  media: xml(E.botao('B', seq(mudar('contador', 1), mudar('medida', b('mk_luz')))), E.botao('A', seq(numero(conta(v('medida'), '/', v('contador')))))),
  porta: xml(E.botao('A', seq(registar('porta', b('mk_temperatura')))), E.botao('B', seq(registar('patio', b('mk_temperatura'))))),
  horta: xml(E.sempre(seq(grafico(lerA('P1'), 1023), seEntao(cmp(lerA('P1'), '<', 300), tom())))),
  silencio: xml(E.botao('A', seq(definir('medida', b('mk_tempo')))), E.somalto(seq(numero(conta(conta(b('mk_tempo'), '-', v('medida')), '/', 1000))))),
};

const somAltoBaixo = [{ som: 230 }, { esperar: 400 }, { som: 10 }, { esperar: 400 }];

const ANTIGOS = [
    // ============ Nível 1
    {
      ok: ok.luz,
      errado: [xml(E.botao('A', seq(numero(150)))), xml(E.botao('A', seq(numero(b('mk_temperatura')))))],
      fazer: [{ luz: 200 }, 'botao:A'],
      regras: [
        [xml(E.agitar(seq(numero(b('mk_luz'))))), 'sem_botao_A'],
        [xml(E.botao('A', ''), solto(numero(b('mk_luz')))), 'fora_botao_A'],
        [xml(E.botao('A', seq(icone('Happy')))), 'sem_mk_mostrar_numero_botao_A'],
        [xml(E.botao('A', seq(numero(5)))), 'sem_mk_luz_em_mk_mostrar_numero'],
        [ok.luz, null],
      ],
    },
    {
      ok: ok.temp,
      errado: [xml(E.botao('B', seq(numero(b('mk_luz'))))), xml(E.botao('A', seq(numero(b('mk_temperatura')))))],
      fazer: [{ temperatura: 30 }, 'botao:B'],
      regras: [
        [xml(E.botao('A', seq(numero(b('mk_temperatura'))))), 'sem_botao_B'],
        [xml(E.botao('B', ''), solto(numero(b('mk_temperatura')))), 'fora_botao_B'],
        [xml(E.botao('B', seq(numero(b('mk_luz'))))), 'sem_mk_temperatura_em_mk_mostrar_numero'],
        [ok.temp, null],
      ],
    },
    {
      ok: ok.som,
      errado: [xml(E.logo(seq(numero(b('mk_temperatura'))))), xml(E.logo(seq(numero(0))))],
      fazer: [{ som: 180 }, 'logo'],
      regras: [
        [xml(E.botao('A', seq(numero(b('mk_som_nivel'))))), 'sem_logo'],
        [xml(E.logo(seq(icone('Happy')))), 'sem_mk_mostrar_numero_logo'],
        [xml(E.logo(seq(numero(b('mk_luz'))))), 'sem_mk_som_nivel_em_mk_mostrar_numero'],
        [ok.som, null],
      ],
    },
    {
      ok: ok.grafLuz,
      errado: [xml(E.botao('A', seq(grafico(b('mk_luz'), 255)))), xml(E.sempre(seq(grafico(b('mk_som_nivel'), 255))))],
      fazer: [{ luz: 255 }, { esperar: 400 }, { luz: 0 }, { esperar: 400 }],
      regras: [
        [xml(E.botao('A', seq(grafico(b('mk_luz'), 255)))), 'sem_sempre'],
        [xml(E.sempre(seq(numero(b('mk_luz'))))), 'sem_mk_grafico_sempre'],
        [xml(E.sempre(seq(grafico(100, 255)))), 'sem_mk_luz_em_mk_grafico'],
        [xml(E.sempre(seq(grafico(b('mk_luz'), 100)))), 'max_errado'],
        [ok.grafLuz, null],
      ],
    },
    {
      ok: ok.grafSom,
      errado: [xml(E.sempre(seq(grafico(b('mk_som_nivel'), 25)))), xml(E.sempre(seq(grafico(b('mk_luz'), 255))))],
      fazer: [{ som: 255 }, { esperar: 400 }, { som: 20 }, { esperar: 400 }],
      regras: [
        [xml(E.sempre(seq(grafico(b('mk_luz'), 255)))), 'sem_mk_som_nivel_em_mk_grafico'],
        [xml(E.sempre(seq(grafico(b('mk_som_nivel'), 25)))), 'max_errado'],
        [xml(E.sempre(seq(icone('Happy')))), 'sem_mk_grafico_sempre'],
        [ok.grafSom, null],
      ],
    },
    {
      ok: ok.termo,
      errado: [xml(E.inicio(seq(numero(b('mk_temperatura'))))), xml(E.sempre(seq(numero(b('mk_luz')), pausa(1000))))],
      fazer: [{ temperatura: 30 }, { esperar: 3000 }, { temperatura: 12 }, { esperar: 3000 }],
      regras: [
        [xml(E.inicio(seq(numero(b('mk_temperatura'))))), 'sem_sempre'],
        [xml(E.sempre(seq(numero(b('mk_luz')), pausa(1000)))), 'sem_mk_temperatura_em_mk_mostrar_numero'],
        [xml(E.sempre(seq(numero(b('mk_temperatura'))))), 'sem_mk_pausa_sempre'],
        [ok.termo, null],
      ],
    },
    // ============ Nível 2
    {
      ok: ok.semaforo,
      errado: [
        xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '<', 128), [icone('Sad')], [icone('Happy')])))),
        xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 0), [icone('Sad')], [icone('Happy')])))),
      ],
      fazer: somAltoBaixo,
      regras: [
        [xml(E.sempre(seq(icone('Sad')))), 'sem_mk_se_sempre'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [icone('Sad')], [icone('Happy')])))), 'sem_mk_comparar_em_mk_se'],
        [xml(E.sempre(seq(se(cmp(b('mk_luz'), '>', 128), [icone('Sad')], [icone('Happy')])))), 'sem_mk_som_nivel_em_mk_se'],
        [xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 0), [icone('Sad')], [icone('Happy')])))), 'limite_zero'],
        [xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [], [])))), 'sem_mk_icone_sempre'],
        [xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [icone('Happy')], [icone('Sad')])))), 'cara_trocada'],
        [ok.semaforo, null],
      ],
    },
    {
      ok: ok.presenca,
      errado: [xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 1)], [digital('P2', 1)])))), xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 0)], [digital('P2', 1)]))))],
      fazer: [{ luz: 10 }, { esperar: 400 }, { luz: 200 }, { esperar: 400 }],
      regras: [
        [xml(E.sempre(seq(digital('P2', 1)))), 'sem_mk_se_sempre'],
        [xml(E.sempre(seq(se(cmp(num(1), '<', 2), [digital('P2', 1)], [digital('P2', 0)])))), 'sem_pergunta'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [icone('Asleep')], [])))), 'sem_ligar'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 0)], [digital('P2', 1)])))), 'trocado'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 1)], [digital('P2', 1)])))), 'nunca_apaga'],
        [ok.presenca, null],
      ],
    },
    {
      ok: ok.quente,
      errado: [
        xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 25), [icone('Surprised')], [])))),
        xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 0), [icone('Surprised')], [limpar()])))),
      ],
      fazer: [{ temperatura: 32 }, { esperar: 400 }, { temperatura: 15 }, { esperar: 400 }],
      regras: [
        [xml(E.sempre(seq(se(b('mk_escuro'), [icone('Surprised')], [limpar()])))), 'sem_mk_comparar_em_mk_se'],
        [xml(E.sempre(seq(se(cmp(b('mk_luz'), '>', 25), [icone('Surprised')], [limpar()])))), 'sem_mk_temperatura_em_mk_se'],
        [xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 0), [icone('Surprised')], [limpar()])))), 'limite_zero'],
        [xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 25), [icone('Sad')], [limpar()])))), 'sem_aviso'],
        [xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 25), [icone('Surprised')], [])))), 'nao_limpa'],
        [ok.quente, null],
      ],
    },
    {
      ok: ok.contador,
      errado: [xml(E.somalto(seq(definir('contador', 1), numero(v('contador'))))), xml(E.somalto(seq(numero(5))))],
      fazer: ['somalto', { esperar: 500 }, 'somalto', { esperar: 500 }, 'somalto'],
      regras: [
        [xml(E.botao('A', seq(mudar('contador', 1)))), 'sem_somalto'],
        [xml(E.somalto(seq(definir('contador', 1), numero(v('contador'))))), 'definir_em_vez_de_mudar'],
        [xml(E.somalto(seq(numero(v('contador'))))), 'sem_mk_var_mudar_somalto'],
        [xml(E.somalto(seq(mudar('contador', 1)))), 'sem_mk_mostrar_numero_somalto'],
        [xml(E.somalto(seq(mudar('contador', 1), numero(1)))), 'sem_mk_var_em_mk_mostrar_numero'],
        [ok.contador, null],
      ],
    },
    {
      ok: ok.limite,
      errado: [
        xml(E.inicio(seq(definir('medida', 100))), E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 0), [icone('Sad')], [icone('Happy')])))),
        xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [icone('Sad')], [icone('Happy')])))),
      ],
      fazer: [{ som: 240 }, { esperar: 400 }, { som: 5 }, { esperar: 400 }],
      regras: [
        [xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [icone('Sad')], [icone('Happy')])))), 'sem_inicio'],
        [xml(E.inicio(''), E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [icone('Sad')], [icone('Happy')])))), 'sem_mk_var_definir_inicio'],
        [xml(E.inicio(seq(definir('medida', 0))), E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', v('medida')), [icone('Sad')], [icone('Happy')])))), 'limite_zero'],
        [xml(E.inicio(seq(definir('medida', 100))), E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [icone('Sad')], [icone('Happy')])))), 'sem_mk_var_em_mk_se'],
        [xml(E.inicio(seq(definir('medida', 100))), E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', v('medida')), [icone('Happy')], [icone('Sad')])))), 'cara_trocada'],
        [ok.limite, null],
      ],
    },
    {
      ok: ok.mapa,
      errado: [xml(E.botao('A', seq(registar('luz', b('mk_luz')))), E.botao('B', seq(registar('som', b('mk_luz'))))), xml(E.botao('A', seq(numero(b('mk_luz')))), E.botao('B', seq(numero(b('mk_som_nivel')))))],
      fazer: [{ luz: 80 }, 'botao:A', { som: 190 }, 'botao:B'],
      regras: [
        [xml(E.botao('A', seq(numero(b('mk_luz'))))), 'sem_mk_registar_botao_A'],
        [xml(E.botao('A', seq(registar('luz', 0)))), 'sem_mk_luz_em_mk_registar'],
        [xml(E.botao('A', seq(registar('luz', b('mk_luz'))))), 'sem_botao_B'],
        [xml(E.botao('A', seq(registar('luz', b('mk_luz')))), E.botao('B', seq(registar('som', b('mk_luz'))))), 'sem_som_no_B'],
        [ok.mapa, null],
      ],
    },
    // ============ Nível 3
    {
      ok: ok.estacao,
      errado: [
        xml(E.sempre(seq(registar('luz', b('mk_luz')), registar('som', b('mk_luz')), registar('temperatura', b('mk_luz')), pausa(1000)))),
        xml(E.botao('A', seq(registar('luz', b('mk_luz')), registar('som', b('mk_som_nivel')), registar('temperatura', b('mk_temperatura'))))),
      ],
      fazer: [{ luz: 90 }, { esperar: 1300 }, { som: 170 }, { esperar: 1300 }, { temperatura: 27 }, { esperar: 1300 }],
      regras: [
        [xml(E.sempre(seq(numero(b('mk_luz'))))), 'sem_mk_registar_sempre'],
        [xml(E.sempre(seq(registar('som', b('mk_som_nivel'))))), 'falta_luz'],
        [xml(E.sempre(seq(registar('luz', b('mk_luz'))))), 'falta_som'],
        [xml(E.sempre(seq(registar('luz', b('mk_luz')), registar('som', b('mk_som_nivel'))))), 'falta_temperatura'],
        [xml(E.sempre(seq(registar('luz', b('mk_luz')), registar('som', b('mk_som_nivel')), registar('temperatura', b('mk_temperatura'))))), 'sem_mk_pausa_sempre'],
        [ok.estacao, null],
      ],
    },
    {
      ok: ok.recorde,
      errado: [
        xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '<', v('recorde')), definir('recorde', b('mk_som_nivel'))))), E.botao('A', seq(numero(v('recorde'))))),
        xml(E.botao('A', seq(numero(b('mk_som_nivel'))))),
        xml(E.botao('A', seq(numero(255)))),
      ],
      fazer: [{ som: 120 }, { esperar: 300 }, { som: 210 }, { esperar: 300 }, { som: 40 }, { esperar: 300 }, 'botao:A'],
      regras: [
        [xml(E.sempre(seq(definir('recorde', b('mk_som_nivel'))))), 'sem_mk_se_entao_sempre'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '>', 100), definir('recorde', b('mk_som_nivel')))))), 'compara_com_recorde'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '<', v('recorde')), definir('recorde', b('mk_som_nivel')))))), 'comparacao_trocada'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '>', v('recorde')), icone('Happy'))))), 'sem_mk_var_definir_sempre'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '>', v('recorde')), definir('recorde', 100))))), 'sem_mk_som_nivel_em_mk_var_definir'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '>', v('recorde')), definir('recorde', b('mk_som_nivel')))))), 'sem_botao_A'],
        [ok.recorde, null],
      ],
    },
    {
      ok: ok.media,
      errado: [
        xml(E.botao('B', seq(mudar('contador', 1), mudar('medida', b('mk_luz')))), E.botao('A', seq(numero(v('medida'))))),
        xml(E.botao('A', seq(numero(b('mk_luz'))))),
      ],
      fazer: [{ luz: 100 }, 'botao:B', { luz: 200 }, 'botao:B', { luz: 60 }, 'botao:B', { esperar: 300 }, 'botao:A'],
      regras: [
        [xml(E.botao('B', seq(numero(b('mk_luz'))))), 'sem_mk_var_mudar_botao_B'],
        [xml(E.botao('B', seq(mudar('medida', 1)))), 'sem_somar_luz'],
        [xml(E.botao('B', seq(mudar('medida', 1), mudar('medida', b('mk_luz'))))), 'mesma_variavel'],
        [xml(E.botao('B', seq(mudar('medida', b('mk_luz'))))), 'sem_contar'],
        [xml(E.botao('B', seq(mudar('contador', 1), mudar('medida', b('mk_luz')))), E.botao('A', seq(numero(v('medida'))))), 'sem_mk_conta_em_mk_mostrar_numero'],
        [xml(E.botao('B', seq(mudar('contador', 1), mudar('medida', b('mk_luz')))), E.botao('A', seq(numero(conta(v('medida'), '+', v('contador')))))), 'nao_divide'],
        [ok.media, null],
      ],
    },
    {
      ok: ok.porta,
      errado: [
        xml(E.botao('A', seq(registar('luz', b('mk_temperatura')))), E.botao('B', seq(registar('luz', b('mk_temperatura'))))),
        xml(E.botao('A', seq(registar('porta', b('mk_temperatura')))), E.botao('B', seq(registar('patio', b('mk_luz'))))),
      ],
      fazer: [{ temperatura: 18 }, 'botao:A', { temperatura: 26 }, 'botao:B'],
      regras: [
        [xml(E.botao('A', seq(numero(b('mk_temperatura'))))), 'sem_mk_registar_botao_A'],
        [xml(E.botao('A', seq(registar('porta', b('mk_luz'))))), 'sem_temp_A'],
        [xml(E.botao('A', seq(registar('porta', b('mk_temperatura'))))), 'sem_botao_B'],
        [xml(E.botao('A', seq(registar('porta', b('mk_temperatura')))), E.botao('B', seq(registar('patio', b('mk_som_nivel'))))), 'sem_temp_B'],
        [xml(E.botao('A', seq(registar('luz', b('mk_temperatura')))), E.botao('B', seq(registar('luz', b('mk_temperatura'))))), 'mesmo_nome'],
        [ok.porta, null],
      ],
    },
    {
      ok: ok.horta,
      errado: [
        xml(E.sempre(seq(grafico(lerA('P1'), 255), seEntao(cmp(lerA('P1'), '<', 300), tom())))),
        xml(E.sempre(seq(grafico(lerA('P1'), 1023), seEntao(cmp(lerA('P1'), '>', 300), tom())))),
      ],
      fazer: [{ 'analogico:P1': 900 }, { esperar: 800 }, { 'analogico:P1': 100 }, { esperar: 1500 }],
      regras: [
        [xml(E.sempre(seq(numero(lerA('P1'))))), 'sem_mk_grafico_sempre'],
        [xml(E.sempre(seq(grafico(b('mk_luz'), 1023)))), 'sem_mk_ler_analogico_em_mk_grafico'],
        [xml(E.sempre(seq(grafico(lerA('P1'), 255)))), 'max_errado'],
        [xml(E.sempre(seq(grafico(lerA('P1'), 1023)))), 'sem_mk_se_entao_sempre'],
        [xml(E.sempre(seq(grafico(lerA('P1'), 1023), seEntao(cmp(lerA('P1'), '>', 300), tom())))), 'sede_trocada'],
        [xml(E.sempre(seq(grafico(lerA('P1'), 1023), seEntao(cmp(lerA('P1'), '<', 300), icone('Sad'))))), 'sem_mk_tom_sempre'],
        [ok.horta, null],
      ],
    },
    {
      ok: ok.silencio,
      errado: [
        xml(E.botao('A', seq(definir('medida', b('mk_tempo')))), E.somalto(seq(numero(conta(b('mk_tempo'), '-', v('medida')))))),
        xml(E.somalto(seq(numero(conta(b('mk_tempo'), '/', 1000))))),
        xml(E.somalto(seq(numero(2)))),
      ],
      fazer: [{ esperar: 1500 }, 'botao:A', { esperar: 2600 }, 'somalto'],
      espera: 1500,
      regras: [
        [xml(E.somalto(seq(numero(b('mk_tempo'))))), 'sem_botao_A'],
        [xml(E.botao('A', seq(definir('medida', 0)))), 'sem_mk_tempo_em_mk_var_definir'],
        [xml(E.botao('A', seq(definir('medida', b('mk_tempo'))))), 'sem_somalto'],
        [xml(E.botao('A', seq(definir('medida', b('mk_tempo')))), E.somalto(seq(numero(conta(b('mk_tempo'), '/', 1000))))), 'sem_subtrair'],
        [xml(E.botao('A', seq(definir('medida', b('mk_tempo')))), E.somalto(seq(numero(conta(b('mk_tempo'), '-', v('medida')))))), 'sem_segundos'],
        [ok.silencio, null],
      ],
    },
];

// ============================================================ projetos (7–11 de cada nível)
const pausaVar = nome => ['<block type="mk_pausa"><value name="MS"><block type="mk_var"><field name="VAR">' + nome + '</field></block></value>', '</block>'];
const L = b('mk_luz'), TP = b('mk_temperatura'), S = b('mk_som_nivel');

// ---- nível 1
const pA = seq(texto('LUZ'), numero(L)), pB = seq(texto('TEMP'), numero(TP)), pL = seq(texto('SOM'), numero(S));
const okPainel = xml(E.botao('A', pA), E.botao('B', pB), E.logo(pL));
const okRelatorio = xml(E.botao('AB', seq(numero(L), numero(TP), numero(S))));
const grafLuz = () => E.sempre(seq(grafico(L, 255)));
const okOuvir = xml(grafLuz(), E.logo(seq(tom(L, 0.25))));
const okRitmo = xml(E.sempre(seq(numero(TP), pausa(1000), grafico(L, 255), pausa(1000))));
const okSirene = xml(E.sempre(seq(grafico(S, 255))), E.somalto(seq(som('mysterious'))));
const N1 = [
  {
    ok: okPainel,
    errado: [
      xml(E.botao('A', seq(numero(L), texto('LUZ'))), E.botao('B', pB), E.logo(seq(texto('SOM'), numero(L)))),
      xml(E.botao('A', seq(numero(L))), E.botao('B', seq(numero(TP))), E.logo(seq(numero(S)))),
    ],
    fazer: [{ luz: 200 }, 'botao:A', { esperar: 4300 }, { temperatura: 30 }, 'botao:B', { esperar: 4300 }, { som: 180 }, 'logo'],
    espera: 4500,
    regras: [
      [xml(E.botao('B', pB)), 'sem_botao_A'],
      [xml(E.botao('A', pA)), 'sem_botao_B'],
      [xml(E.botao('A', pA), E.botao('B', pB)), 'sem_logo'],
      [xml(E.botao('A', seq(texto('LUZ'), numero(TP))), E.botao('B', pB), E.logo(pL)), 'sensor_trocado'],
      [xml(E.botao('A', seq(texto('LUZ'))), E.botao('B', pB), E.logo(pL)), 'sem_numero'],
      [xml(E.botao('A', seq(numero(L))), E.botao('B', pB), E.logo(pL)), 'sem_legenda'],
      [xml(E.botao('A', seq(numero(L), texto('LUZ'))), E.botao('B', pB), E.logo(pL)), 'legenda_depois'],
      [okPainel, null],
    ],
  },
  {
    ok: okRelatorio,
    errado: [xml(E.botao('AB', seq(numero(L), numero(L), numero(S)))), xml(E.botao('AB', seq(numero(TP), numero(L), numero(S))))],
    fazer: [{ luz: 150 }, { temperatura: 27 }, { som: 90 }, 'botao:AB'],
    espera: 6500,
    regras: [
      [xml(E.botao('A', seq(numero(L)))), 'sem_botao_AB'],
      [xml(E.botao('AB', ''), solto(numero(L))), 'fora_botao_AB'],
      [xml(E.botao('AB', seq(icone('Happy')))), 'sem_mk_mostrar_numero_botao_AB'],
      [xml(E.botao('AB', seq(numero(TP), numero(S)))), 'falta_luz'],
      [xml(E.botao('AB', seq(numero(L), numero(S)))), 'falta_temperatura'],
      [xml(E.botao('AB', seq(numero(L), numero(TP)))), 'falta_som'],
      [xml(E.botao('AB', seq(numero(TP), numero(L), numero(S)))), 'ordem_trocada'],
      [okRelatorio, null],
    ],
  },
  {
    ok: okOuvir,
    errado: [xml(grafLuz(), E.logo(seq(tom(S, 0.25)))), xml(grafLuz(), E.logo(seq(tom(440)))), xml(E.logo(seq(tom(L, 0.25))))],
    fazer: [{ luz: 200 }, { esperar: 300 }, 'logo', { esperar: 500 }, { luz: 60 }, { esperar: 300 }, 'logo'],
    espera: 800,
    regras: [
      [xml(E.logo(seq(tom(L, 0.25)))), 'sem_sempre'],
      [xml(E.sempre(seq(numero(L))), E.logo(seq(tom(L, 0.25)))), 'sem_mk_grafico_sempre'],
      [xml(E.sempre(seq(grafico(S, 255)))), 'sem_mk_luz_em_mk_grafico'],
      [xml(E.sempre(seq(grafico(L, 25)))), 'max_errado'],
      [xml(grafLuz()), 'sem_logo'],
      [xml(grafLuz(), E.logo(seq(icone('Happy')))), 'sem_mk_tom_logo'],
      [xml(grafLuz(), E.logo(seq(tom(262)))), 'sem_mk_luz_em_mk_tom'],
      [okOuvir, null],
    ],
  },
  {
    ok: okRitmo,
    errado: [xml(E.sempre(seq(numero(TP), pausa(1000), grafico(L, 255)))), xml(E.sempre(seq(grafico(L, 255), pausa(1000))))],
    fazer: [{ temperatura: 30 }, { esperar: 4000 }, { luz: 220 }, { esperar: 4000 }],
    espera: 800,
    regras: [
      [xml(E.botao('A', seq(numero(TP)))), 'sem_sempre'],
      [xml(E.sempre(seq(grafico(L, 255), pausa(1000)))), 'sem_mk_mostrar_numero_sempre'],
      [xml(E.sempre(seq(numero(L), pausa(1000), grafico(L, 255), pausa(1000)))), 'sem_mk_temperatura_em_mk_mostrar_numero'],
      [xml(E.sempre(seq(numero(TP), pausa(1000)))), 'sem_mk_grafico_sempre'],
      [xml(E.sempre(seq(numero(TP), pausa(1000), grafico(S, 255), pausa(1000)))), 'sem_mk_luz_em_mk_grafico'],
      [xml(E.sempre(seq(numero(TP), pausa(1000), grafico(L, 100), pausa(1000)))), 'max_errado'],
      [xml(E.sempre(seq(numero(TP), pausa(1000), grafico(L, 255)))), 'sem_pausa_grafico'],
      [okRitmo, null],
    ],
  },
  {
    ok: okSirene,
    errado: [xml(E.sempre(seq(grafico(S, 255))), E.somalto(seq(icone('Surprised')))), xml(E.somalto(seq(som('mysterious'))))],
    fazer: [{ som: 200 }, { esperar: 300 }, { som: 30 }, { esperar: 300 }, 'somalto'],
    espera: 1500,
    regras: [
      [xml(E.somalto(seq(som('mysterious')))), 'sem_sempre'],
      [xml(E.sempre(seq(numero(S)))), 'sem_mk_grafico_sempre'],
      [xml(E.sempre(seq(grafico(L, 255)))), 'sem_mk_som_nivel_em_mk_grafico'],
      [xml(E.sempre(seq(grafico(S, 128)))), 'max_errado'],
      [xml(E.sempre(seq(grafico(S, 255)))), 'sem_somalto'],
      [xml(E.sempre(seq(grafico(S, 255))), E.somalto(seq(icone('Surprised')))), 'sem_sirene'],
      [okSirene, null],
    ],
  },
];

// ---- nível 2
const tres = (n1, n2, c1, c2, c3) => E.sempre(seq(se(cmp(S, '>', n1), [icone(c1)], [se(cmp(S, '>', n2), [icone(c2)], [icone(c3)])])));
const okTres = xml(tres(170, 80, 'Sad', 'Surprised', 'Happy'));
const sala = (n1, x2, c1, c2, c3) => E.sempre(seq(se(cmp(TP, '>', n1), [icone(c1)], [se(cmp(x2, '>', 128), [icone(c2)], [icone(c3)])])));
const okSala = xml(sala(25, S, 'Surprised', 'Sad', 'Happy'));
const corredor = (...ins) => E.somalto(seq(...ins));
const okLuzSom = seq(digital('P2', 1), pausa(2000), digital('P2', 0));
const okCorredor = xml(corredor(digital('P2', 1), pausa(2000), digital('P2', 0), mudar('contador', 1)), E.botao('A', seq(numero(v('contador')))));
const contaSom = () => E.somalto(seq(mudar('contador', 1)));
const vigia = (c1, c2) => E.sempre(seq(se(cmp(v('contador'), '>', 5), [icone(c1)], [icone(c2)])));
const okBarulhos = xml(contaSom(), vigia('Sad', 'Happy'), E.botao('A', seq(definir('contador', 0))));
const ini128 = () => E.inicio(seq(definir('medida', 128)));
const aOk = () => E.botao('A', seq(mudar('medida', 10), numero(v('medida'))));
const bOk = () => E.botao('B', seq(mudar('medida', -10), numero(v('medida'))));
const vigiaMedida = () => E.sempre(seq(se(cmp(S, '>', v('medida')), [icone('Sad')], [icone('Happy')])));
const okVotado = xml(ini128(), aOk(), bOk(), vigiaMedida());
const seteSom = ['somalto', 'somalto', 'somalto', 'somalto', 'somalto', 'somalto', 'somalto'];
const N2 = [
  {
    ok: okTres,
    errado: [xml(tres(80, 170, 'Surprised', 'Sad', 'Happy')), xml(E.sempre(seq(se(cmp(S, '>', 128), [icone('Sad')], [icone('Happy')]))))],
    fazer: [{ som: 230 }, { esperar: 400 }, { som: 120 }, { esperar: 400 }, { som: 20 }, { esperar: 400 }],
    regras: [
      [xml(E.botao('A', seq(icone('Sad')))), 'sem_sempre'],
      [xml(E.sempre(seq(icone('Sad')))), 'sem_mk_se_sempre'],
      [xml(E.sempre(seq(se(cmp(L, '>', 170), [icone('Sad')], [icone('Happy')])))), 'sem_mk_som_nivel_em_mk_se'],
      [xml(E.sempre(seq(se(cmp(S, '>', 170), [icone('Sad')], [icone('Happy')])))), 'so_duas_caras'],
      [xml(tres(170, 80, 'Sad', 'Happy', 'Happy')), 'sem_atencao'],
      [xml(tres(80, 170, 'Surprised', 'Sad', 'Happy')), 'limites_ao_contrario'],
      [xml(tres(170, 80, 'Happy', 'Surprised', 'Sad')), 'cara_trocada'],
      [okTres, null],
    ],
  },
  {
    ok: okSala,
    errado: [xml(E.sempre(seq(se(cmp(TP, '>', 25), [icone('Surprised')], [icone('Happy')])))), xml(E.sempre(seq(se(cmp(S, '>', 128), [icone('Sad')], [icone('Happy')]))))],
    fazer: [{ temperatura: 30 }, { esperar: 400 }, { temperatura: 20 }, { esperar: 300 }, { som: 220 }, { esperar: 400 }, { som: 15 }, { esperar: 400 }],
    regras: [
      [xml(E.botao('A', seq(icone('Happy')))), 'sem_sempre'],
      [xml(E.sempre(seq(icone('Happy')))), 'sem_mk_se_sempre'],
      [xml(E.sempre(seq(se(cmp(S, '>', 128), [icone('Sad')], [icone('Happy')])))), 'sem_calor'],
      [xml(E.sempre(seq(se(cmp(TP, '>', 25), [icone('Surprised')], [icone('Happy')])))), 'so_uma_pergunta'],
      [xml(sala(25, L, 'Surprised', 'Sad', 'Happy')), 'sem_barulho'],
      [xml(sala(25, S, 'Happy', 'Sad', 'Happy')), 'falta_cara'],
      [xml(sala(0, S, 'Surprised', 'Sad', 'Happy')), 'limite_zero'],
      [okSala, null],
    ],
  },
  {
    ok: okCorredor,
    errado: [
      xml(corredor(digital('P2', 1), digital('P2', 0), pausa(2000), mudar('contador', 1)), E.botao('A', seq(numero(v('contador'))))),
      xml(corredor(digital('P2', 1), pausa(2000), digital('P2', 0)), E.botao('A', seq(numero(v('contador'))))),
    ],
    fazer: ['somalto', { esperar: 2600 }, 'somalto', { esperar: 2600 }, 'botao:A'],
    espera: 1200,
    regras: [
      [xml(E.botao('A', seq(numero(v('contador'))))), 'sem_somalto'],
      [xml(corredor(mudar('contador', 1))), 'sem_ligar'],
      [xml(corredor(digital('P2', 1))), 'nunca_apaga'],
      [xml(corredor(digital('P2', 1), digital('P2', 0), pausa(2000), mudar('contador', 1))), 'sem_espera'],
      [xml(corredor(digital('P2', 0), pausa(2000), digital('P2', 1))), 'apaga_antes'],
      [xml(E.somalto(okLuzSom)), 'sem_mk_var_mudar_somalto'],
      [xml(corredor(digital('P2', 1), pausa(2000), digital('P2', 0), mudar('contador', 1))), 'sem_botao_A'],
      [xml(corredor(digital('P2', 1), pausa(2000), digital('P2', 0), mudar('contador', 1)), E.botao('A', seq(icone('Happy')))), 'sem_mk_mostrar_numero_botao_A'],
      [xml(corredor(digital('P2', 1), pausa(2000), digital('P2', 0), mudar('contador', 1)), E.botao('A', seq(numero(5)))), 'sem_mk_var_em_mk_mostrar_numero'],
      [okCorredor, null],
    ],
  },
  {
    ok: okBarulhos,
    errado: [xml(contaSom(), vigia('Sad', 'Happy'), E.botao('A', seq(mudar('contador', 0)))), xml(contaSom(), vigia('Sad', 'Happy'))],
    fazer: [...seteSom, { esperar: 300 }, 'botao:A'],
    espera: 800,
    regras: [
      [xml(vigia('Sad', 'Happy')), 'sem_somalto'],
      [xml(E.somalto(seq(icone('Sad')))), 'sem_mk_var_mudar_somalto'],
      [xml(contaSom()), 'sem_sempre'],
      [xml(contaSom(), E.sempre(seq(icone('Sad')))), 'sem_mk_se_sempre'],
      [xml(contaSom(), E.sempre(seq(se(cmp(S, '>', 5), [icone('Sad')], [icone('Happy')])))), 'sem_mk_var_em_mk_se'],
      [xml(contaSom(), vigia('Happy', 'Sad')), 'caras_trocadas'],
      [xml(contaSom(), vigia('Sad', 'Happy')), 'sem_botao_A'],
      [xml(contaSom(), vigia('Sad', 'Happy'), E.botao('A', seq(mudar('contador', 0)))), 'nao_recomeca'],
      [okBarulhos, null],
    ],
  },
  {
    ok: okVotado,
    errado: [
      xml(ini128(), aOk(), E.botao('B', seq(mudar('medida', 10), numero(v('medida')))), vigiaMedida()),
      xml(ini128(), aOk(), bOk(), E.sempre(seq(se(cmp(S, '>', 128), [icone('Sad')], [icone('Happy')])))),
    ],
    fazer: ['botao:A', { esperar: 2300 }, 'botao:A', { esperar: 2300 }, 'botao:B', { esperar: 2300 }, { som: 133 }, { esperar: 400 }, { som: 250 }, { esperar: 400 }, { som: 5 }, { esperar: 400 }],
    regras: [
      [xml(E.botao('A', seq(mudar('medida', 10)))), 'sem_inicio'],
      [xml(E.inicio(seq(numero(5)))), 'sem_mk_var_definir_inicio'],
      [xml(ini128()), 'sem_botao_A'],
      [xml(ini128(), E.botao('A', seq(numero(v('medida'))))), 'sem_mk_var_mudar_botao_A'],
      [xml(ini128(), E.botao('A', seq(mudar('medida', 10)))), 'sem_mk_mostrar_numero_botao_A'],
      [xml(ini128(), E.botao('A', seq(mudar('medida', 10), numero(5)))), 'a_mostra'],
      [xml(ini128(), aOk()), 'sem_botao_B'],
      [xml(ini128(), aOk(), E.botao('B', seq(mudar('medida', 10), numero(v('medida'))))), 'b_sobe'],
      [xml(ini128(), aOk(), bOk()), 'sem_sempre'],
      [xml(ini128(), aOk(), bOk(), E.sempre(seq(se(cmp(S, '>', 128), [icone('Sad')], [icone('Happy')])))), 'sem_mk_var_em_mk_se'],
      [okVotado, null],
    ],
  },
];

// ---- nível 3
const ini1000 = () => E.inicio(seq(definir('medida', 1000)));
const estacaoOk = () => E.sempre(seq(registar('luz', L), registar('temperatura', TP), pausaVar('medida')));
const aIntervalo = () => E.botao('A', seq(mudar('medida', 1000), numero(v('medida'))));
const okIntervalo = xml(ini1000(), estacaoOk(), aIntervalo());
const bMedia = () => E.botao('B', seq(mudar('contador', 1), mudar('medida', L), seEntao(cmp(L, '>', v('recorde')), definir('recorde', L))));
const aMedia = () => E.botao('A', seq(numero(conta(v('medida'), '/', v('contador'))), pausa(500), numero(v('recorde'))));
const okMedia = xml(bMedia(), aMedia());
const sitio = (ev, nome, x = TP, cont = true) => ev(seq(registar(nome, x), ...(cont ? [mudar('contador', 1)] : [])));
const sA = (n = 'porta', x, c) => sitio(c2 => E.botao('A', c2), n, x, c), sB = (n = 'patio', x, c) => sitio(c2 => E.botao('B', c2), n, x, c), sL = (n = 'sala', x, c) => sitio(c2 => E.logo(c2), n, x, c);
const totalAB = () => E.botao('AB', seq(numero(v('contador'))));
const okTres3 = xml(sA(), sB(), sL(), totalAB());
const somAlto = (sim, nao) => se(cmp(S, '>', 128), sim, nao);
const okPaciente = xml(E.sempre(seq(somAlto([mudar('contador', 1)], [definir('contador', 0)]), seEntao(cmp(v('contador'), '>', 4), tom(), icone('Sad')), pausa(200))));
const P1 = lerA('P1');
const okRega = xml(E.sempre(seq(registar('humidade', P1), se(cmp(P1, '<', 300), [tom(), icone('Sad')], [icone('Happy')]), pausa(1000))));
const N3 = [
  {
    ok: okIntervalo,
    errado: [
      xml(ini1000(), E.sempre(seq(registar('luz', L), registar('temperatura', TP), pausa(1000))), aIntervalo()),
      xml(ini1000(), E.sempre(seq(registar('luz', L), pausaVar('medida'))), aIntervalo()),
    ],
    fazer: [{ esperar: 3500 }, 'botao:A', { esperar: 6000 }],
    espera: 500,
    regras: [
      [xml(estacaoOk()), 'sem_inicio'],
      [xml(E.inicio(seq(numero(1)))), 'sem_mk_var_definir_inicio'],
      [xml(ini1000()), 'sem_sempre'],
      [xml(ini1000(), E.sempre(seq(pausaVar('medida')))), 'sem_mk_registar_sempre'],
      [xml(ini1000(), E.sempre(seq(registar('luz', L), pausaVar('medida')))), 'falta_luz_ou_temp'],
      [xml(ini1000(), E.sempre(seq(registar('luz', L), registar('temperatura', TP)))), 'sem_mk_pausa_sempre'],
      [xml(ini1000(), E.sempre(seq(registar('luz', L), registar('temperatura', TP), pausa(1000)))), 'pausa_fixa'],
      [xml(ini1000(), estacaoOk()), 'sem_botao_A'],
      [xml(ini1000(), estacaoOk(), E.botao('A', seq(numero(v('medida'))))), 'sem_mk_var_mudar_botao_A'],
      [xml(ini1000(), estacaoOk(), E.botao('A', seq(mudar('medida', 1000), numero(5)))), 'sem_mk_var_em_mk_mostrar_numero'],
      [okIntervalo, null],
    ],
  },
  {
    ok: okMedia,
    errado: [
      xml(E.botao('B', seq(mudar('contador', 1), mudar('medida', L))), aMedia()),
      xml(bMedia(), E.botao('A', seq(numero(conta(v('medida'), '/', v('contador')))))),
      xml(bMedia(), E.botao('A', seq(numero(v('medida')), pausa(500), numero(v('recorde'))))),
    ],
    fazer: [{ luz: 100 }, 'botao:B', { luz: 200 }, 'botao:B', { luz: 60 }, 'botao:B', 'botao:A'],
    espera: 5000,
    regras: [
      [xml(E.botao('A', seq(numero(v('recorde'))))), 'sem_botao_B'],
      [xml(E.botao('B', seq(icone('Happy')))), 'sem_mk_var_mudar_botao_B'],
      [xml(E.botao('B', seq(mudar('contador', 1), mudar('medida', 5)))), 'soma_sem_luz'],
      [xml(E.botao('B', seq(mudar('medida', L)))), 'sem_contar'],
      [xml(E.botao('B', seq(mudar('contador', 1), mudar('medida', L)))), 'sem_mk_se_entao_botao_B'],
      [xml(E.botao('B', seq(mudar('contador', 1), mudar('medida', L), seEntao(cmp(L, '>', v('recorde')), definir('recorde', 0))))), 'recorde_sem_luz'],
      [xml(bMedia()), 'sem_botao_A'],
      [xml(bMedia(), E.botao('A', seq(numero(v('recorde'))))), 'sem_media'],
      [xml(bMedia(), E.botao('A', seq(numero(conta(v('medida'), '/', v('contador')))))), 'sem_maximo'],
      [okMedia, null],
    ],
  },
  {
    ok: okTres3,
    errado: [xml(sA(), sB(), sL('porta'), totalAB()), xml(sA(), sB(), sL())],
    fazer: [{ temperatura: 18 }, 'botao:A', { temperatura: 24 }, 'botao:B', { temperatura: 21 }, 'logo', { esperar: 300 }, 'botao:AB'],
    espera: 1500,
    regras: [
      [xml(sB(), sL()), 'sem_botao_A'],
      [xml(sA()), 'sem_botao_B'],
      [xml(sA(), sB()), 'sem_logo'],
      [xml(sA(), sB(), E.logo(seq(mudar('contador', 1)))), 'sem_registo'],
      [xml(sA(), sB(), sL('sala', L)), 'sem_temperatura'],
      [xml(sA(), sB(), sL('porta'), totalAB()), 'nomes_repetidos'],
      [xml(sA('porta', TP, false), sB('patio', TP, false), sL('sala', TP, false)), 'sem_contar'],
      [xml(sA(), sB(), sL()), 'sem_botao_AB'],
      [xml(sA(), sB(), sL(), E.botao('AB', seq(icone('Happy')))), 'sem_mk_mostrar_numero_botao_AB'],
      [xml(sA(), sB(), sL(), E.botao('AB', seq(numero(3)))), 'sem_mk_var_em_mk_mostrar_numero'],
      [okTres3, null],
    ],
  },
  {
    ok: okPaciente,
    errado: [
      xml(E.sempre(seq(somAlto([tom(), icone('Sad')], [limpar()]), pausa(200)))),
      xml(E.sempre(seq(somAlto([mudar('contador', 1)], [definir('contador', 0)]), seEntao(cmp(v('contador'), '>', 4), tom(), icone('Sad'))))),
    ],
    fazer: [{ som: 230 }, { esperar: 150 }, { som: 10 }, { esperar: 1200 }, { som: 230 }, { esperar: 2500 }, { som: 10 }],
    espera: 600,
    regras: [
      [xml(E.botao('A', seq(tom()))), 'sem_sempre'],
      [xml(E.sempre(seq(tom()))), 'sem_mk_se_sempre'],
      [xml(E.sempre(seq(somAlto([tom(), icone('Sad')], [limpar()]), pausa(200)))), 'alarme_imediato'],
      [xml(E.sempre(seq(somAlto([icone('Sad')], [limpar()]), pausa(200)))), 'sem_contar'],
      [xml(E.sempre(seq(somAlto([mudar('contador', 1)], [limpar()]), seEntao(cmp(v('contador'), '>', 4), tom()), pausa(200)))), 'sem_recomecar'],
      [xml(E.sempre(seq(somAlto([mudar('contador', 1)], [definir('contador', 0)]), pausa(200)))), 'sem_alarme'],
      [xml(E.sempre(seq(somAlto([mudar('contador', 1)], [definir('contador', 0)]), seEntao(cmp(v('contador'), '>', 4), tom(), icone('Sad'))))), 'sem_mk_pausa_sempre'],
      [okPaciente, null],
    ],
  },
  {
    ok: okRega,
    errado: [
      xml(E.sempre(seq(registar('humidade', L), se(cmp(P1, '<', 300), [tom(), icone('Sad')], [icone('Happy')]), pausa(1000)))),
      xml(E.sempre(seq(registar('humidade', P1), se(cmp(P1, '<', 300), [icone('Sad')], [icone('Happy')]), pausa(1000)))),
    ],
    fazer: [{ 'analogico:P1': 800 }, { esperar: 2000 }, { 'analogico:P1': 100 }, { esperar: 2500 }, { 'analogico:P1': 700 }, { esperar: 2000 }],
    espera: 500,
    regras: [
      [xml(E.botao('A', seq(registar('humidade', P1)))), 'sem_sempre'],
      [xml(E.sempre(seq(pausa(1000)))), 'sem_mk_registar_sempre'],
      [xml(E.sempre(seq(registar('humidade', L), pausa(1000)))), 'sem_leitura_reg'],
      [xml(E.sempre(seq(registar('humidade', P1), pausa(1000)))), 'sem_mk_se_sempre'],
      [xml(E.sempre(seq(registar('humidade', P1), se(cmp(L, '<', 300), [tom()], [icone('Happy')]), pausa(1000)))), 'sem_mk_ler_analogico_em_mk_se'],
      [xml(E.sempre(seq(registar('humidade', P1), se(cmp(P1, '>', 300), [tom()], [icone('Happy')]), pausa(1000)))), 'sede_trocada'],
      [xml(E.sempre(seq(registar('humidade', P1), se(cmp(P1, '<', 300), [icone('Sad')], [icone('Happy')]), pausa(1000)))), 'sem_mk_tom_sempre'],
      [xml(E.sempre(seq(registar('humidade', P1), se(cmp(P1, '<', 300), [tom(), icone('Sad')], [icone('Happy')])))), 'sem_mk_pausa_sempre'],
      [okRega, null],
    ],
  },
];

module.exports = {
  missao: 'citizen-sensing',
  casos: [...ANTIGOS.slice(0, 6), ...N1, ...ANTIGOS.slice(6, 12), ...N2, ...ANTIGOS.slice(12, 18), ...N3],
};
