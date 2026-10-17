// Casos de teste da missão «Matemática» (um por desafio com validação, pela ordem).
const { xml, E, seq, b, v, val, conta, cmp, aleatorio, resto, icone, numero, texto, acender, grafico, definir, mudar, repetir, se, seEntao, pausa } = require('../lib');

const vezes = (n, ...passos) => Array.from({ length: n }, () => passos).flat();
const esc = b('mk_escuro');   // condição qualquer (sem comparação)

// 1 · O número da sorte
const sorte = xml(E.botao('A', seq(numero(7))));
// 2 · Mais um, menos um
const aMais = E.botao('A', seq(mudar('contador', 1), numero(v('contador'))));
const contador = xml(aMais, E.botao('B', seq(mudar('contador', -1), numero(v('contador')))));
const contadorG = xml(E.botao('A', seq(mudar('contador', 1), numero(v('contador')))), E.botao('B', seq(mudar('contador', 1), numero(v('contador')))));
// 3 · Conta-passos
const passos = xml(E.agitar(seq(mudar('passos', 1))), E.botao('A', seq(numero(v('passos')))));
const passosG = xml(E.agitar(seq(definir('passos', 1))), E.botao('A', seq(numero(v('passos')))));
const passosOutra = xml(E.agitar(seq(mudar('passos', 1))), E.botao('A', seq(numero(v('contador')))));
// 4 · Contagem decrescente
const foguetao = (ini, passo, n, ic = true) => xml(E.botao('A', seq(ini !== null && definir('contador', ini),
  repetir(n, numero(v('contador')), mudar('contador', passo), pausa(200)), ic && icone('Surprised'))));
// 5 · Dado
const dado = xml(E.agitar(seq(numero(aleatorio(1, 6)))));
const dadoG = xml(E.agitar(seq(numero(aleatorio(1, 60)))));
// 6 · Placar
const pA = E.botao('A', seq(mudar('contador', 1)));
const placar = xml(pA, E.botao('B', seq(mudar('pontos', 1))), E.botao('AB', seq(numero(v('contador')), pausa(500), numero(v('pontos')))));
const placarG = xml(pA, E.botao('B', seq(mudar('contador', 1))), E.botao('AB', seq(numero(v('contador')), pausa(500), numero(v('pontos')))));
// 7 · Tabuada do 3
const tabuada = xml(E.botao('A', seq(mudar('contador', 3), numero(v('contador')))));
const tabuadaG = xml(E.botao('A', seq(numero(v('contador')), mudar('contador', 3))));
// 8 · Dobra!
const ini1 = E.inicio(seq(definir('contador', 1)));
const aDobro = E.botao('A', seq(definir('contador', conta(v('contador'), '*', 2)), numero(v('contador'))));
const dobro = xml(ini1, aDobro);
// 9 · Par ou ímpar?
const parProg = (div, sim, nao) => xml(E.botao('A', seq(mudar('contador', 1), numero(v('contador')),
  se(cmp(resto(v('contador'), div), '==', 0), sim, nao))));
const par = parProg(2, [icone('Yes')], [icone('No')]);
// 10 · Diagonal
const diag = (n, y, comMudar = true) => xml(E.botao('A', seq(definir('contador', 0), repetir(n, acender(v('contador'), y), comMudar && mudar('contador', 1)))));
const diagonal = diag(5, v('contador'));
// 11 · Quiz da soma
const aQuiz = E.botao('A', seq(definir('contador', aleatorio(1, 5)), definir('pontos', aleatorio(1, 5)), numero(v('contador')), pausa(500), numero(v('pontos'))));
const quiz = xml(aQuiz, E.botao('B', seq(numero(conta(v('contador'), '+', v('pontos'))))));
const quizG = xml(aQuiz, E.botao('B', seq(numero(conta(v('contador'), '+', v('contador'))))));
const quizX = xml(aQuiz, E.botao('B', seq(numero(conta(v('contador'), '*', v('pontos'))))));
// 12 · Cara ou coroa
const moeda = cmp(aleatorio(1, 2), '==', 1);
const moedas = xml(E.botao('A', seq(definir('contador', 0), repetir(10, seEntao(moeda, mudar('contador', 1))), numero(v('contador')))));
const moedasG = xml(E.botao('A', seq(definir('contador', 0), repetir(10, seEntao(moeda), mudar('contador', 1)), numero(v('contador')))));
// 13 · Barra de progresso
const barra = xml(E.botao('A', seq(mudar('contador', 1), grafico(v('contador'), 10))));
const barraG = xml(E.botao('A', seq(mudar('contador', 1), grafico(1, 10))));
// 14 · Meta de passos
const meta = (op, n, sim, nao) => xml(E.agitar(seq(mudar('passos', 1), se(cmp(v('passos'), op, n), sim, nao))));
const metaOk = meta('>=', 5, [icone('Happy')], [numero(v('passos'))]);
// 15 · Cronómetro
const aCrono = E.botao('A', seq(definir('medida', b('mk_tempo'))));
const crono = xml(aCrono, E.botao('B', seq(numero(conta(conta(b('mk_tempo'), '-', v('medida')), '/', 1000)))));
const cronoG = xml(aCrono, E.botao('B', seq(numero(conta(conta(v('medida'), '-', b('mk_tempo')), '/', 1000)))));
// 16 · Potências de 2
const pot = (ini, corpo) => xml(E.botao('A', seq(definir('contador', ini), repetir(6, ...corpo))));
const dobra = definir('contador', conta(v('contador'), '*', 2));
const potencias = pot(1, [numero(v('contador')), dobra]);
// 17 · O maior dado
const dois = [definir('contador', aleatorio(1, 6)), definir('pontos', aleatorio(1, 6))];
const mostraDois = [numero(v('contador')), pausa(300), numero(v('pontos')), pausa(300)];
const maior = (c, sim, nao) => xml(E.botao('A', seq(...dois, ...mostraDois, se(c, sim, nao))));
const maiorOk = maior(cmp(v('contador'), '>', v('pontos')), [numero(v('contador'))], [numero(v('pontos'))]);
const maiorG = maior(cmp(v('contador'), '>', v('pontos')), [numero(v('pontos'))], [numero(v('contador'))]);
// 18 · Adivinha o número
const agSeg = E.agitar(seq(definir('medida', aleatorio(1, 5))));
const aPalp = E.botao('A', seq(mudar('contador', 1), numero(v('contador'))));
const adivinha = (c) => xml(agSeg, aPalp, E.botao('B', seq(se(c, [icone('Yes')], [icone('No')]))));
const adivinhaOk = adivinha(cmp(v('contador'), '==', v('medida')));


// ================================================================ desafios complexos (7–11 de cada nível)
const pausaV = x => [`<block type="mk_pausa">${val('MS', x)}`, '</block>'];
const tempo = () => b('mk_tempo');
// N1·7 · Duelo de dados
const dA = E.botao('A', seq(definir('contador', aleatorio(1, 6)), numero(v('contador'))));
const dB = E.botao('B', seq(definir('pontos', aleatorio(1, 6)), numero(v('pontos'))));
const dAB = E.botao('AB', seq(numero(v('contador')), pausa(500), numero(v('pontos'))));
const duelo = xml(dA, dB, dAB);
const dueloG = xml(dA, dB, E.botao('AB', seq(numero(v('contador')), pausa(500), numero(v('contador')))));
// N1·8 · Saltos na reta
const rA = E.botao('A', seq(mudar('contador', 1), numero(v('contador'))));
const rB = E.botao('B', seq(mudar('contador', 10), numero(v('contador'))));
const rAB = E.botao('AB', seq(definir('contador', 0), numero(v('contador'))));
const reta = xml(rA, rB, rAB);
const retaG = xml(rA, E.botao('B', seq(mudar('contador', 1), numero(v('contador')))), rAB);
// N1·9 · De 5 em 5
const cinco = (o = {}, bB = E.botao('B', seq(numero(v('passos'))))) => {
  const c = Object.assign({ reset: true, preset: true, n: 6, salto: 5, mostra: true, passos: true, fim: true }, o);
  return xml(E.botao('A', seq(c.reset && definir('contador', 0), c.preset && definir('passos', 0),
    repetir(c.n, mudar('contador', c.salto), c.passos && mudar('passos', 1), c.mostra && numero(v('contador')), pausa(200)), c.fim && icone('Happy'))), bB || '');
};
// N1·10 · Sorteio da turma
const sA = E.botao('A', seq(definir('pontos', aleatorio(1, 25)), mudar('passos', 1), numero(v('pontos'))));
const sB = E.botao('B', seq(numero(v('pontos'))));
const sAB = E.botao('AB', seq(numero(v('passos'))));
const sorteio = xml(sA, sB, sAB);
const sorteioG = xml(sA, E.botao('B', seq(definir('pontos', aleatorio(1, 25)), numero(v('pontos')))), sAB);
// N1·11 · Mealheiro
const mA = E.botao('A', seq(mudar('contador', 1)));
const mB = E.botao('B', seq(mudar('contador', 2)));
const mAg = E.agitar(seq(numero(v('contador'))));
const mAB = E.botao('AB', seq(definir('contador', 0), numero(v('contador'))));
const mealheiro = xml(mA, mB, mAg, mAB);
const mealheiroG = xml(mA, mB, mAg, E.botao('AB', seq(numero(v('contador')))));
// N2·7 · Máquina das tabuadas
const tIni = E.inicio(seq(definir('medida', 2), definir('contador', 0)));
const tB = E.botao('B', seq(mudar('contador', 1), numero(conta(v('medida'), '*', v('contador')))));
const tA = E.botao('A', seq(mudar('medida', 1), definir('contador', 0), numero(v('medida'))));
const mesa = xml(tIni, tB, tA);
const mesaG = xml(tIni, E.botao('B', seq(mudar('contador', 1), numero(conta(v('medida'), '+', v('contador'))))), tA);
// N2·8 · Tabuleiro de xadrez
const xad = (o = {}) => {
  const c = Object.assign({ dois: true, se: 'ok', acVars: true, mudarX: true, resetX: true, mudarY: true }, o);
  const soma = conta(v('contador'), '+', v('pontos'));
  const cond = c.se === 'noresto' ? cmp(soma, '==', 0) : c.se === 'nosoma' ? cmp(resto(v('contador'), 2), '==', 0) : cmp(resto(soma, 2), '==', 0);
  const ac = c.acVars ? acender(v('contador'), v('pontos')) : acender(2, 2);
  const inner = [c.se === 'none' ? ac : seEntao(cond, ac), c.mudarX && mudar('contador', 1)];
  const outer = c.dois ? [c.resetX && definir('contador', 0), repetir(5, ...inner), c.mudarY && mudar('pontos', 1)] : [...inner, c.mudarY && mudar('pontos', 1)];
  return xml(E.botao('A', seq(definir('pontos', 0), repetir(5, ...outer))));
};
// N2·9 · O jogo do PIM
const pim = (o = {}) => {
  const c = Object.assign({ reset: true, mudar: true, se: 'ok', resto: true, div: 3, sim: [texto('PIM')], nao: [numero(v('contador'))], extra: null }, o);
  const cond = c.resto ? cmp(resto(v('contador'), c.div), '==', 0) : cmp(v('contador'), '==', 3);
  const corpo = [c.mudar && mudar('contador', 1), c.se === 'none' ? numero(v('contador')) : se(cond, c.sim, c.nao), c.extra];
  return xml(E.botao('A', seq(c.reset && definir('contador', 0), repetir(12, ...corpo))));
};
// N2·10 · Sondagem da turma
const vA = E.botao('A', seq(mudar('contador', 1)));
const vB = E.botao('B', seq(mudar('pontos', 1)));
const totalCP = () => numero(conta(v('contador'), '+', v('pontos')));
const vAB = E.botao('AB', seq(totalCP(), seEntao(cmp(v('contador'), '==', v('pontos')), icone('Surprised'))));
const sondagem = xml(vA, vB, vAB);
const sondagemG = xml(vA, vB, E.botao('AB', seq(numero(conta(v('contador'), '+', v('contador'))), seEntao(cmp(v('contador'), '==', v('pontos')), icone('Surprised')))));
// N2·11 · Fibonacci
const fIni = E.inicio(seq(definir('contador', 1), definir('pontos', 1)));
const somaCP = () => definir('medida', conta(v('contador'), '+', v('pontos')));
const fA = E.botao('A', seq(numero(v('contador')), somaCP(), definir('contador', v('pontos')), definir('pontos', v('medida'))));
const fib = xml(fIni, fA);
const fibG = xml(fIni, E.botao('A', seq(numero(v('contador')), somaCP(), definir('pontos', v('medida')), definir('contador', v('pontos')))));
// N3·7 · Reflexos de gato
const xA = E.botao('A', seq(icone('Asleep'), pausaV(aleatorio(1000, 3000)), icone('Heart'), definir('medida', tempo())));
const xB = E.botao('B', seq(definir('passos', conta(tempo(), '-', v('medida'))), numero(v('passos')), mudar('pontos', v('passos')), mudar('contador', 1)));
const xAB = E.botao('AB', seq(numero(conta(v('pontos'), '/', v('contador')))));
const reflexos = xml(xA, xB, xAB);
const reflexosG = xml(xA, E.botao('B', seq(definir('passos', tempo()), numero(v('passos')), mudar('pontos', v('passos')), mudar('contador', 1))), xAB);
// N3·8 · Mais ou menos
const mmAg = E.agitar(seq(definir('medida', aleatorio(1, 10)), definir('contador', 0), definir('passos', 0)));
const mmA = E.botao('A', seq(mudar('contador', 1), numero(v('contador'))));
const pistasMM = (mais, menos) => se(cmp(v('contador'), '<', v('medida')), [texto(mais)], [texto(menos)]);
const mmB = E.botao('B', seq(mudar('passos', 1), se(cmp(v('contador'), '==', v('medida')), [icone('Happy')], [pistasMM('+', '-')])));
const mmAB = E.botao('AB', seq(numero(v('passos'))));
const maismenos = xml(mmAg, mmA, mmB, mmAB);
const maismenosG = xml(mmAg, mmA, E.botao('B', seq(mudar('passos', 1), se(cmp(v('contador'), '==', v('medida')), [icone('Happy')], [pistasMM('-', '+')]))), mmAB);
// N3·9 · Estatística do dado
const eB = E.botao('B', seq(grafico(v('contador'), 20)));
const est = (o = {}, comB = true) => {
  const c = Object.assign({ reset: true, n: 60, dado: true, se: 'ok', contar: true, fora: true, todos: false }, o);
  const dentro = [c.dado && definir('medida', aleatorio(1, 6)),
    c.todos ? mudar('contador', 1) : c.se === 'none' ? null : seEntao(cmp(v('medida'), '==', c.se === 'sete' ? 7 : 6), c.contar && mudar('contador', 1)),
    !c.fora && numero(v('contador'))];
  return xml(E.botao('A', seq(c.reset && definir('contador', 0), repetir(c.n, ...dentro), c.fora && numero(v('contador')))), comB ? eB : '');
};
// N3·10 · Cronómetro de voltas
const lIni = E.inicio(seq(definir('recorde', 1000)));
const lA = E.botao('A', seq(definir('medida', tempo())));
const volta = () => conta(conta(tempo(), '-', v('medida')), '/', 1000);
const lB = (op = '<', nova = true) => E.botao('B', seq(definir('contador', volta()), numero(v('contador')), nova && definir('medida', tempo()),
  seEntao(cmp(v('contador'), op, v('recorde')), definir('recorde', v('contador')))));
const lAB = E.botao('AB', seq(numero(v('recorde'))));
const voltas = xml(lIni, lA, lB(), lAB);
// N3·11 · Jogo do 21
const jIni = E.inicio(seq(definir('vidas', 3), definir('pontos', 0)));
const carta = (max = 10) => [definir('contador', aleatorio(1, max)), numero(v('contador')), mudar('pontos', v('contador')), numero(v('pontos'))];
const rebenta = (lim = 21, vida = true, reset = true) => seEntao(cmp(v('pontos'), '>', lim), icone('Sad'), vida && mudar('vidas', -1), reset && definir('pontos', 0));
const jAg = (...x) => E.agitar(seq(...x));
const jA = E.botao('A', seq(numero(v('vidas'))));
const vinteum = xml(jIni, jAg(...carta(), rebenta()), jA);

module.exports = {
  missao: 'matematica',
  casos: [
    { // 1 · O número da sorte
      ok: sorte, errado: [xml(E.botao('A', seq(numero(1)))), xml(E.agitar(seq(numero(7))))], fazer: ['botao:A'], espera: 500,
      regras: [
        [xml(E.agitar(seq(numero(7)))), 'sem_a'],
        [xml(E.botao('A', '')), 'sem_mostrar'],
        [xml(E.botao('A', seq(numero(3)))), 'numero_errado'],
        [sorte, null],
      ],
    },
    { // 2 · Mais um, menos um
      ok: contador,
      errado: [contadorG, xml(E.botao('A', seq(mudar('contador', 1), numero(1))), E.botao('B', seq(mudar('contador', -1), numero(0))))],
      fazer: ['botao:A', { esperar: 300 }, 'botao:A', { esperar: 300 }, 'botao:B'], espera: 600,
      regras: [
        [xml(E.botao('B', seq(mudar('contador', -1)))), 'sem_a'],
        [xml(E.botao('A', '')), 'a_sem_mudar'],
        [xml(E.botao('A', seq(mudar('contador', 1)))), 'a_sem_mostrar'],
        [xml(E.botao('A', seq(mudar('contador', 1), numero(5)))), 'mostra_sem_var'],
        [xml(aMais), 'sem_b'],
        [xml(aMais, E.botao('B', seq(numero(v('contador'))))), 'b_sem_mudar'],
        [contadorG, 'b_soma'],
        [contador, null],
      ],
    },
    { // 3 · Conta-passos
      ok: passos, errado: [passosG, passosOutra],
      fazer: [...vezes(3, 'agitar', { esperar: 200 }), 'botao:A'], espera: 600,
      regras: [
        [xml(E.botao('A', seq(numero(v('passos'))))), 'sem_agitar'],
        [passosG, 'agitar_sem_mudar'],
        [xml(E.agitar(seq(mudar('passos', 1)))), 'sem_a'],
        [xml(E.agitar(seq(mudar('passos', 1))), E.botao('A', '')), 'a_sem_mostrar'],
        [xml(E.agitar(seq(mudar('passos', 1))), E.botao('A', seq(numero(3)))), 'mostra_sem_var'],
        [passosOutra, 'variaveis_diferentes'],
        [passos, null],
      ],
    },
    { // 4 · Contagem decrescente
      ok: foguetao(5, -1, 5), errado: [foguetao(5, 1, 5), foguetao(null, -1, 5), foguetao(5, -1, 4)], fazer: ['botao:A'], espera: 2600,
      regras: [
        [xml(E.agitar(seq(numero(5)))), 'sem_a'],
        [xml(E.botao('A', seq(numero(5)))), 'sem_comeco'],
        [xml(E.botao('A', seq(definir('contador', 5), numero(v('contador'))))), 'sem_repetir'],
        [xml(E.botao('A', seq(definir('contador', 5), repetir(5, numero(v('contador')))))), 'sem_descer'],
        [foguetao(5, 1, 5), 'conta_sobe'],
        [foguetao(5, -1, 4), 'poucas_vezes'],
        [foguetao(5, -1, 5, false), 'sem_partida'],
        [foguetao(5, -1, 5), null],
      ],
    },
    { // 5 · Lança o dado
      ok: dado, errado: [dadoG, xml(E.agitar(seq(numero(6))))], fazer: vezes(6, 'agitar', { esperar: 250 }), espera: 400,
      regras: [
        [xml(E.botao('A', seq(numero(aleatorio(1, 6))))), 'sem_agitar'],
        [xml(E.agitar('')), 'sem_mostrar'],
        [xml(E.agitar(seq(numero(6)))), 'sem_acaso'],
        [dadoG, 'limites'],
        [dado, null],
      ],
    },
    { // 6 · Placar
      ok: placar, errado: [placarG, xml(pA, E.botao('B', seq(mudar('pontos', 1))), E.botao('AB', seq(numero(v('contador')))))],
      fazer: ['botao:A', 'botao:A', 'botao:B', 'botao:AB'], espera: 1200,
      regras: [
        [xml(E.botao('B', seq(mudar('pontos', 1)))), 'sem_a'],
        [xml(E.botao('A', '')), 'a_sem_mudar'],
        [xml(pA), 'sem_b'],
        [xml(pA, E.botao('B', '')), 'b_sem_mudar'],
        [xml(pA, E.botao('B', seq(mudar('contador', 1)))), 'mesma_conta'],
        [xml(pA, E.botao('B', seq(mudar('pontos', 1)))), 'sem_ab'],
        [xml(pA, E.botao('B', seq(mudar('pontos', 1))), E.botao('AB', '')), 'ab_sem_mostrar'],
        [xml(pA, E.botao('B', seq(mudar('pontos', 1))), E.botao('AB', seq(numero(v('contador'))))), 'so_uma_equipa'],
        [placar, null],
      ],
    },
    // ============================================================ desafios complexos
    { // N1·7 · Duelo de dados
      ok: duelo, errado: [dueloG, xml(dA, E.botao('B', seq(definir('contador', aleatorio(1, 6)), numero(v('contador')))), dAB)],
      fazer: vezes(5, 'botao:A', { esperar: 200 }, 'botao:B', { esperar: 200 }, 'botao:AB', { esperar: 800 }), espera: 300,
      regras: [
        [xml(E.botao('B', seq(definir('pontos', aleatorio(1, 6))))), 'sem_a'],
        [xml(E.botao('A', seq(numero(aleatorio(1, 6))))), 'a_sem_dado'],
        [xml(E.botao('A', seq(definir('contador', aleatorio(1, 20)), numero(v('contador'))))), 'limites'],
        [xml(E.botao('A', seq(definir('contador', aleatorio(1, 6))))), 'a_sem_mostrar'],
        [xml(dA), 'sem_b'],
        [xml(dA, E.botao('B', seq(definir('contador', aleatorio(1, 6)), numero(v('contador'))))), 'b_mesma_var'],
        [xml(dA, E.botao('B', seq(numero(v('pontos'))))), 'b_sem_dado'],
        [xml(dA, dB), 'sem_ab'],
        [dueloG, 'ab_dois'],
        [duelo, null],
      ],
    },
    { // N1·8 · Saltos na reta
      ok: reta, errado: [retaG, xml(rA, rB, E.botao('AB', seq(numero(v('contador')))))],
      fazer: ['botao:A', { esperar: 250 }, 'botao:A', { esperar: 250 }, 'botao:B', { esperar: 1500 }, 'botao:B', { esperar: 1500 }, 'botao:A', { esperar: 1500 },
        'botao:AB', { esperar: 300 }, 'botao:A'], espera: 400,
      regras: [
        [xml(rB), 'sem_a'],
        [xml(E.botao('A', seq(numero(v('contador'))))), 'a_passo'],
        [xml(rA), 'sem_b'],
        [retaG, 'b_salto'],
        [xml(rA, rB), 'sem_ab'],
        [xml(rA, rB, E.botao('AB', seq(numero(v('contador'))))), 'ab_zero'],
        [xml(E.botao('A', seq(mudar('contador', 1))), rB, rAB), 'sem_mostrar'],
        [reta, null],
      ],
    },
    { // N1·9 · De 5 em 5
      ok: cinco(), errado: [cinco({ reset: false }), cinco({}, E.botao('B', seq(numero(v('contador')))))],
      fazer: ['botao:A', { esperar: 9500 }, 'botao:B', { esperar: 400 }, 'botao:A', { esperar: 9500 }, 'botao:B'], espera: 400,
      regras: [
        [xml(E.botao('B', seq(numero(v('passos'))))), 'sem_a'],
        [xml(E.botao('A', seq(definir('contador', 0), mudar('contador', 5)))), 'sem_repetir'],
        [cinco({ salto: 1 }), 'salto_cinco'],
        [cinco({ reset: false }), 'sem_reset'],
        [cinco({ mostra: false }), 'sem_mostrar'],
        [cinco({ n: 5 }), 'poucas_vezes'],
        [cinco({ passos: false }), 'sem_passos'],
        [cinco({ preset: false }), 'passos_sem_reset'],
        [cinco({ fim: false }), 'sem_fim'],
        [cinco({}, null), 'sem_b'],
        [cinco({}, E.botao('B', seq(numero(v('contador'))))), 'b_mostra'],
        [cinco(), null],
      ],
    },
    { // N1·10 · Sorteio da turma
      ok: sorteio, errado: [sorteioG, xml(sA, sB, E.botao('AB', seq(numero(v('pontos')))))],
      fazer: [...vezes(4, 'botao:A', { esperar: 1500 }), 'botao:B', { esperar: 1500 }, 'botao:AB'], espera: 400,
      regras: [
        [xml(sB), 'sem_a'],
        [xml(E.botao('A', seq(numero(aleatorio(1, 25))))), 'a_sem_sorteio'],
        [xml(E.botao('A', seq(definir('pontos', aleatorio(1, 30)), mudar('passos', 1), numero(v('pontos'))))), 'limites'],
        [xml(E.botao('A', seq(definir('pontos', aleatorio(1, 25)), numero(v('pontos'))))), 'a_sem_contar'],
        [xml(E.botao('A', seq(definir('pontos', aleatorio(1, 25)), mudar('passos', 1)))), 'a_sem_mostrar'],
        [xml(sA), 'sem_b'],
        [sorteioG, 'b_sorteia'],
        [xml(sA, E.botao('B', seq(numero(v('passos'))))), 'b_mostra'],
        [xml(sA, sB), 'sem_ab'],
        [xml(sA, sB, E.botao('AB', seq(numero(v('pontos'))))), 'ab_mostra'],
        [sorteio, null],
      ],
    },
    { // N1·11 · Mealheiro
      ok: mealheiro, errado: [mealheiroG, xml(mA, E.botao('B', seq(mudar('contador', 1))), mAg, mAB)],
      fazer: ['botao:A', 'botao:B', 'botao:B', 'agitar', { esperar: 200 }, 'botao:A', 'agitar', { esperar: 200 }, 'botao:AB', { esperar: 200 }, 'botao:B', 'agitar'], espera: 400,
      regras: [
        [xml(mB), 'sem_a'],
        [xml(E.botao('A', seq(mudar('contador', 5)))), 'a_valor'],
        [xml(mA), 'sem_b'],
        [xml(mA, E.botao('B', seq(mudar('contador', 1)))), 'b_valor'],
        [xml(mA, mB), 'sem_agitar'],
        [xml(mA, mB, E.agitar(seq(numero(v('pontos'))))), 'agitar_mostra'],
        [xml(mA, mB, mAg), 'sem_ab'],
        [mealheiroG, 'ab_zero'],
        [xml(mA, mB, mAg, E.botao('AB', seq(definir('contador', 0)))), 'ab_mostra'],
        [mealheiro, null],
      ],
    },
    { // 7 · Tabuada do 3
      ok: tabuada, errado: [tabuadaG, xml(E.botao('A', seq(mudar('contador', 1), numero(v('contador')))))],
      fazer: ['botao:A', { esperar: 250 }, 'botao:A', { esperar: 250 }, 'botao:A'], espera: 500,
      regras: [
        [xml(E.agitar(seq(mudar('contador', 3)))), 'sem_a'],
        [xml(E.botao('A', seq(numero(v('contador'))))), 'sem_mudar'],
        [xml(E.botao('A', seq(mudar('contador', 1), numero(v('contador'))))), 'salto_errado'],
        [xml(E.botao('A', seq(mudar('contador', 3)))), 'sem_mostrar'],
        [xml(E.botao('A', seq(mudar('contador', 3), numero(3)))), 'mostra_sem_var'],
        [tabuadaG, 'mostra_antes'],
        [tabuada, null],
      ],
    },
    { // 8 · Dobra!
      ok: dobro, errado: [xml(aDobro), xml(ini1, E.botao('A', seq(mudar('contador', 2), numero(v('contador')))))],
      fazer: ['botao:A', { esperar: 250 }, 'botao:A', { esperar: 250 }, 'botao:A'], espera: 500,
      regras: [
        [xml(aDobro), 'sem_inicio'],
        [xml(E.inicio(seq(definir('contador', 0))), aDobro), 'comeca_zero'],
        [xml(ini1), 'sem_a'],
        [xml(ini1, E.botao('A', seq(numero(v('contador'))))), 'a_sem_definir'],
        [xml(ini1, E.botao('A', seq(definir('contador', 2), numero(v('contador'))))), 'sem_conta'],
        [xml(ini1, E.botao('A', seq(definir('contador', conta(v('contador'), '+', 2)), numero(v('contador'))))), 'conta_errada'],
        [xml(ini1, E.botao('A', seq(definir('contador', conta(v('contador'), '*', 2))))), 'sem_mostrar'],
        [dobro, null],
      ],
    },
    { // 9 · Par ou ímpar?
      ok: par, errado: [parProg(2, [icone('No')], [icone('Yes')]), parProg(3, [icone('Yes')], [icone('No')])],
      fazer: vezes(4, 'botao:A', { esperar: 400 }), espera: 500,
      regras: [
        [xml(E.agitar(seq(mudar('contador', 1)))), 'sem_a'],
        [xml(E.botao('A', seq(numero(v('contador'))))), 'sem_mudar'],
        [xml(E.botao('A', seq(mudar('contador', 1), numero(v('contador'))))), 'sem_se'],
        [xml(E.botao('A', seq(mudar('contador', 1), numero(v('contador')), se(cmp(v('contador'), '==', 0), [icone('Yes')], [icone('No')])))), 'sem_resto'],
        [parProg(3, [icone('Yes')], [icone('No')]), 'divide_errado'],
        [parProg(2, [], []), 'sem_icones'],
        [parProg(2, [icone('No')], [icone('Yes')]), 'icones_trocados'],
        [par, null],
      ],
    },
    { // 10 · Diagonal de luzes
      ok: diagonal, errado: [diag(5, 0), diag(5, v('contador'), false)], fazer: ['botao:A'], espera: 600,
      regras: [
        [xml(E.agitar(seq(acender(v('contador'), v('contador'))))), 'sem_a'],
        [xml(E.botao('A', seq(acender(v('contador'), v('contador'))))), 'sem_repetir'],
        [xml(E.botao('A', seq(definir('contador', 0), repetir(5, mudar('contador', 1))))), 'sem_acender'],
        [xml(E.botao('A', seq(repetir(5, acender(2, 2))))), 'acender_fixo'],
        [diag(5, 0), 'so_uma_var'],
        [diag(5, v('contador'), false), 'sem_mudar'],
        [diag(4, v('contador')), 'poucas_vezes'],
        [diagonal, null],
      ],
    },
    { // 11 · Quiz da soma
      ok: quiz, errado: [quizG, quizX],
      fazer: vezes(3, 'botao:A', { esperar: 900 }, 'botao:B', { esperar: 1600 }), espera: 300,
      regras: [
        [xml(E.agitar(seq(numero(v('contador'))))), 'sem_a'],
        [xml(E.botao('A', seq(numero(v('contador'))))), 'a_sem_acaso'],
        [xml(E.botao('A', seq(definir('contador', aleatorio(1, 5)), definir('pontos', aleatorio(1, 5))))), 'a_sem_mostrar'],
        [xml(aQuiz), 'sem_b'],
        [xml(aQuiz, E.botao('B', '')), 'b_sem_mostrar'],
        [xml(aQuiz, E.botao('B', seq(numero(v('contador'))))), 'b_sem_conta'],
        [quizG, 'conta_errada'],
        [quiz, null],
      ],
    },
    { // 12 · Cara ou coroa
      ok: moedas, errado: [moedasG, xml(E.botao('A', seq(repetir(10, seEntao(moeda, mudar('contador', 1))), numero(v('contador')))))],
      fazer: ['botao:A', { esperar: 1800 }, 'botao:A'], espera: 1800,
      regras: [
        [xml(E.agitar(seq(numero(v('contador'))))), 'sem_a'],
        [xml(E.botao('A', seq(repetir(10, seEntao(moeda, mudar('contador', 1))), numero(v('contador'))))), 'sem_zero'],
        [xml(E.botao('A', seq(definir('contador', 0), seEntao(moeda, mudar('contador', 1)), numero(v('contador'))))), 'sem_repetir'],
        [xml(E.botao('A', seq(definir('contador', 0), repetir(10, mudar('contador', 1)), numero(v('contador'))))), 'sem_se'],
        [xml(E.botao('A', seq(definir('contador', 0), repetir(10, seEntao(cmp(v('contador'), '==', 1), mudar('contador', 1))), numero(v('contador'))))), 'sem_acaso'],
        [moedasG, 'conta_sempre'],
        [xml(E.botao('A', seq(definir('contador', 0), repetir(10, seEntao(moeda, mudar('contador', 1)))))), 'sem_mostrar'],
        [moedas, null],
      ],
    },

    { // N2·7 · Máquina das tabuadas
      ok: mesa, errado: [mesaG, xml(tIni, tB, E.botao('A', seq(mudar('medida', 1), numero(v('medida')))))],
      fazer: [...vezes(3, 'botao:B', { esperar: 250 }), 'botao:A', { esperar: 250 }, ...vezes(3, 'botao:B', { esperar: 250 })], espera: 400,
      regras: [
        [xml(tB, tA), 'sem_inicio'],
        [xml(E.inicio(seq(definir('contador', 0))), tB, tA), 'inicio_medida'],
        [xml(tIni, tA), 'sem_b'],
        [xml(tIni, E.botao('B', seq(numero(conta(v('medida'), '*', v('contador'))))), tA), 'b_sem_mudar'],
        [xml(tIni, E.botao('B', seq(mudar('contador', 1), numero(v('contador')))), tA), 'b_conta'],
        [xml(tIni, E.botao('B', seq(mudar('contador', 1), numero(conta(v('contador'), '*', 2)))), tA), 'conta_vars'],
        [xml(tIni, E.botao('B', seq(numero(conta(v('medida'), '*', v('contador'))), mudar('contador', 1))), tA), 'mostra_antes'],
        [xml(tIni, tB), 'sem_a'],
        [xml(tIni, tB, E.botao('A', seq(definir('contador', 0), numero(v('medida'))))), 'a_sem_tabuada'],
        [xml(tIni, tB, E.botao('A', seq(mudar('medida', 1), numero(v('medida'))))), 'a_sem_reset'],
        [mesa, null],
      ],
    },
    { // N2·8 · Tabuleiro de xadrez
      ok: xad(), errado: [xad({ mudarY: false }), xad({ se: 'none' }), xad({ se: 'nosoma' })], fazer: ['botao:A'], espera: 1000,
      regras: [
        [xml(E.botao('B', seq(definir('pontos', 0)))), 'sem_a'],
        [xad({ dois: false }), 'sem_repetir'],
        [xml(E.botao('A', seq(definir('pontos', 0), repetir(5, definir('contador', 0), repetir(5, mudar('contador', 1)))))), 'sem_acender'],
        [xad({ acVars: false }), 'acender_vars'],
        [xad({ mudarX: false }), 'sem_mudar_x'],
        [xad({ resetX: false }), 'reset_x'],
        [xad({ mudarY: false }), 'sem_mudar_y'],
        [xad({ se: 'none' }), 'sem_se'],
        [xad({ se: 'noresto' }), 'sem_resto'],
        [xad({ se: 'nosoma' }), 'sem_soma'],
        [xad(), null],
      ],
    },
    { // N2·9 · O jogo do PIM
      ok: pim(), errado: [pim({ div: 2 }), pim({ nao: [], extra: numero(v('contador')) }), pim({ reset: true, se: 'none' })], fazer: ['botao:A'], espera: 12500,
      regras: [
        [xml(E.botao('B', seq(definir('contador', 0)))), 'sem_a'],
        [xml(E.botao('A', seq(definir('contador', 0), mudar('contador', 1), numero(v('contador'))))), 'sem_repetir'],
        [pim({ mudar: false }), 'sem_mudar'],
        [pim({ reset: false }), 'sem_reset'],
        [pim({ se: 'none' }), 'sem_se'],
        [pim({ resto: false }), 'sem_resto'],
        [pim({ div: 2 }), 'divisor'],
        [pim({ sim: [numero(v('contador'))] }), 'sem_pim'],
        [pim({ nao: [] }), 'sem_numero'],
        [pim({ extra: numero(v('contador')) }), 'dois_mostrar'],
        [pim(), null],
      ],
    },
    { // N2·10 · Sondagem da turma
      ok: sondagem, errado: [sondagemG, xml(vA, vB, E.botao('AB', seq(totalCP(), seEntao(cmp(v('contador'), '==', v('contador')), icone('Surprised')))))],
      fazer: ['botao:A', 'botao:B', 'botao:AB', { esperar: 600 }, 'botao:A', 'botao:AB', { esperar: 600 }, 'botao:B', 'botao:AB'], espera: 600,
      regras: [
        [xml(vB, vAB), 'sem_a'],
        [xml(E.botao('A', seq(numero(1))), vB, vAB), 'a_sem_mudar'],
        [xml(vA, vAB), 'sem_b'],
        [xml(vA, E.botao('B', seq(mudar('contador', 1))), vAB), 'b_mesma'],
        [xml(vA, E.botao('B', seq(numero(1))), vAB), 'b_sem_mudar'],
        [xml(vA, vB), 'sem_ab'],
        [xml(vA, vB, E.botao('AB', seq(numero(v('contador'))))), 'ab_total'],
        [xml(vA, vB, E.botao('AB', seq(totalCP()))), 'sem_se'],
        [xml(vA, vB, E.botao('AB', seq(totalCP(), seEntao(cmp(v('contador'), '==', v('contador')), icone('Surprised'))))), 'se_compara'],
        [xml(vA, vB, E.botao('AB', seq(totalCP(), seEntao(cmp(v('contador'), '==', v('pontos')))))), 'sem_icone'],
        [sondagem, null],
      ],
    },
    { // N2·11 · Fibonacci
      ok: fib, errado: [fibG, xml(fIni, E.botao('A', seq(numero(v('contador')), definir('contador', conta(v('contador'), '+', v('pontos'))))))],
      fazer: vezes(6, 'botao:A', { esperar: 300 }), espera: 300,
      regras: [
        [xml(fA), 'sem_inicio'],
        [xml(E.inicio(seq(definir('contador', 1))), fA), 'inicio_valores'],
        [xml(fIni), 'sem_a'],
        [xml(fIni, E.botao('A', seq(somaCP()))), 'sem_mostrar'],
        [xml(fIni, E.botao('A', seq(numero(v('contador'))))), 'sem_soma'],
        [xml(fIni, E.botao('A', seq(numero(v('contador')), somaCP()))), 'sem_troca'],
        [xml(fIni, E.botao('A', seq(numero(v('contador')), somaCP(), definir('contador', v('pontos'))))), 'sem_novo'],
        [fibG, 'ordem'],
        [fib, null],
      ],
    },
    { // 13 · Barra de progresso
      ok: barra, errado: [barraG, xml(E.botao('A', seq(mudar('contador', 1), grafico(v('contador'), 255))))],
      fazer: vezes(4, 'botao:A', { esperar: 200 }), espera: 400,
      regras: [
        [xml(E.agitar(seq(mudar('contador', 1)))), 'sem_a'],
        [xml(E.botao('A', seq(grafico(v('contador'), 10)))), 'sem_mudar'],
        [xml(E.botao('A', seq(mudar('contador', 1)))), 'sem_grafico'],
        [barraG, 'grafico_fixo'],
        [xml(E.botao('A', seq(mudar('contador', 1), grafico(v('contador'), 255)))), 'maximo'],
        [barra, null],
      ],
    },
    { // 14 · Meta de passos
      ok: metaOk, errado: [meta('>=', 50, [icone('Happy')], [numero(v('passos'))]), meta('>', 5, [icone('Happy')], [numero(v('passos'))])],
      fazer: vezes(6, 'agitar', { esperar: 250 }), espera: 400,
      regras: [
        [xml(E.botao('A', seq(mudar('passos', 1)))), 'sem_agitar'],
        [xml(E.agitar(seq(se(cmp(v('passos'), '>=', 5), [icone('Happy')], [numero(v('passos'))])))), 'sem_mudar'],
        [xml(E.agitar(seq(mudar('passos', 1)))), 'sem_se'],
        [xml(E.agitar(seq(mudar('passos', 1), se(esc, [icone('Happy')], [numero(v('passos'))])))), 'sem_comparar'],
        [meta('>=', 50, [icone('Happy')], [numero(v('passos'))]), 'meta_errada'],
        [meta('>=', 5, [numero(v('passos'))], [icone('Happy')]), 'festa_trocada'],
        [metaOk, null],
      ],
    },
    { // 15 · Cronómetro
      ok: crono,
      errado: [cronoG, xml(aCrono, E.botao('B', seq(numero(conta(b('mk_tempo'), '-', v('medida')))))), xml(aCrono, E.botao('B', seq(numero(conta(b('mk_tempo'), '/', 1000)))))],
      fazer: [{ esperar: 1500 }, 'botao:A', { esperar: 2000 }, 'botao:B'], espera: 600,
      regras: [
        [xml(E.botao('B', seq(numero(v('medida'))))), 'sem_a'],
        [xml(E.botao('A', '')), 'a_sem_definir'],
        [xml(E.botao('A', seq(definir('medida', 0)))), 'sem_tempo_inicio'],
        [xml(aCrono), 'sem_b'],
        [xml(aCrono, E.botao('B', '')), 'b_sem_mostrar'],
        [xml(aCrono, E.botao('B', seq(numero(v('medida'))))), 'b_sem_tempo'],
        [cronoG, 'ordem'],
        [xml(aCrono, E.botao('B', seq(numero(conta(b('mk_tempo'), '-', v('medida')))))), 'sem_divisao'],
        [crono, null],
      ],
    },
    { // 16 · Potências de 2
      ok: potencias, errado: [pot(0, [numero(v('contador')), dobra]), pot(1, [numero(v('contador')), mudar('contador', 2)])],
      fazer: ['botao:A'], espera: 4500,
      regras: [
        [xml(E.agitar(seq(numero(v('contador'))))), 'sem_a'],
        [xml(E.botao('A', seq(definir('contador', 1), numero(v('contador'))))), 'sem_repetir'],
        [pot(0, [numero(v('contador')), dobra]), 'comeco'],
        [pot(1, [numero(v('contador'))]), 'sem_dobro'],
        [xml(E.botao('A', seq(definir('contador', 1), repetir(6, dobra), numero(v('contador'))))), 'mostra_fora'],
        [potencias, null],
      ],
    },
    { // 17 · O maior dado
      ok: maiorOk, errado: [maiorG, xml(E.botao('A', seq(...dois, ...mostraDois, numero(conta(v('contador'), '+', v('pontos'))))))],
      fazer: vezes(4, 'botao:A', { esperar: 1400 }), espera: 300,
      regras: [
        [xml(E.agitar(seq(...dois))), 'sem_a'],
        [xml(E.botao('A', seq(definir('contador', aleatorio(1, 6)), numero(v('contador'))))), 'dois_dados'],
        [xml(E.botao('A', seq(...dois))), 'mostra_dados'],
        [xml(E.botao('A', seq(...dois, ...mostraDois))), 'sem_se'],
        [maior(esc, [numero(v('contador'))], [numero(v('pontos'))]), 'sem_comparar'],
        [maiorG, 'trocado'],
        [maiorOk, null],
      ],
    },
    { // 18 · Adivinha o número
      ok: adivinhaOk, errado: [adivinha(cmp(v('contador'), '==', v('pontos'))), adivinha(cmp(v('contador'), '>', v('medida')))],
      fazer: ['agitar', { esperar: 200 }, ...vezes(5, 'botao:A', { esperar: 250 }, 'botao:B', { esperar: 250 })], espera: 300,
      regras: [
        [xml(aPalp, E.botao('B', seq(se(cmp(v('contador'), '==', v('medida')), [icone('Yes')], [icone('No')])))), 'sem_agitar'],
        [xml(E.agitar(seq(definir('medida', 3)))), 'sem_segredo'],
        [xml(agSeg), 'sem_a'],
        [xml(agSeg, E.botao('A', seq(numero(v('contador'))))), 'a_sem_mudar'],
        [xml(agSeg, aPalp), 'sem_b'],
        [xml(agSeg, aPalp, E.botao('B', '')), 'sem_se'],
        [adivinha(esc), 'sem_comparar'],
        [adivinha(cmp(v('contador'), '==', v('pontos'))), 'compara_errado'],
        [adivinhaOk, null],
      ],
    },
    { // N3·7 · Reflexos de gato
      ok: reflexos, errado: [reflexosG, xml(xA, xB, E.botao('AB', seq(numero(v('pontos')))))],
      fazer: ['botao:A', { esperar: 3300 }, 'botao:B', { esperar: 2700 }, 'botao:A', { esperar: 3300 }, 'botao:B', { esperar: 2700 }, 'botao:AB'], espera: 1500,
      regras: [
        [xml(xB, xAB), 'sem_a'],
        [xml(E.botao('A', seq(icone('Asleep'), pausa(1000), icone('Heart'), definir('medida', tempo()))), xB, xAB), 'a_espera'],
        [xml(E.botao('A', seq(pausaV(aleatorio(1000, 3000)), icone('Heart'), definir('medida', tempo()))), xB, xAB), 'a_sinal'],
        [xml(E.botao('A', seq(icone('Asleep'), pausaV(aleatorio(1000, 3000)), icone('Heart'))), xB, xAB), 'a_marca'],
        [xml(xA, xAB), 'sem_b'],
        [reflexosG, 'b_diferenca'],
        [xml(xA, E.botao('B', seq(definir('passos', conta(tempo(), '-', v('medida'))), mudar('pontos', v('passos')), mudar('contador', 1))), xAB), 'b_mostra'],
        [xml(xA, E.botao('B', seq(definir('passos', conta(tempo(), '-', v('medida'))), numero(v('passos')))), xAB), 'b_soma'],
        [xml(xA, xB), 'sem_ab'],
        [xml(xA, xB, E.botao('AB', seq(numero(v('pontos'))))), 'ab_media'],
        [reflexos, null],
      ],
    },
    { // N3·8 · Mais ou menos
      ok: maismenos, errado: [maismenosG, xml(mmAg, mmA, E.botao('B', seq(mudar('passos', 1), pistasMM('+', '-'))), mmAB)],
      fazer: ['agitar', { esperar: 300 }, ...vezes(10, 'botao:A', { esperar: 250 }, 'botao:B', { esperar: 1100 }), 'botao:AB'], espera: 400,
      regras: [
        [xml(mmA, mmB, mmAB), 'sem_agitar'],
        [xml(E.agitar(seq(definir('medida', 5), definir('contador', 0), definir('passos', 0))), mmA, mmB, mmAB), 'sem_segredo'],
        [xml(E.agitar(seq(definir('medida', aleatorio(1, 100)), definir('contador', 0), definir('passos', 0))), mmA, mmB, mmAB), 'limites'],
        [xml(E.agitar(seq(definir('medida', aleatorio(1, 10)))), mmA, mmB, mmAB), 'sem_reset'],
        [xml(mmAg, mmB, mmAB), 'sem_a'],
        [xml(mmAg, E.botao('A', seq(mudar('contador', 1))), mmB, mmAB), 'a_mudar'],
        [xml(mmAg, mmA, mmAB), 'sem_b'],
        [xml(mmAg, mmA, E.botao('B', seq(se(cmp(v('contador'), '==', v('medida')), [icone('Happy')], [pistasMM('+', '-')]))), mmAB), 'b_tentativas'],
        [xml(mmAg, mmA, E.botao('B', seq(mudar('passos', 1), icone('Happy'))), mmAB), 'b_se'],
        [xml(mmAg, mmA, E.botao('B', seq(mudar('passos', 1), pistasMM('+', '-'))), mmAB), 'b_igual'],
        [xml(mmAg, mmA, E.botao('B', seq(mudar('passos', 1), se(cmp(v('contador'), '==', v('medida')), [icone('Happy')], []))), mmAB), 'b_pistas'],
        [maismenosG, 'trocado'],
        [xml(mmAg, mmA, mmB), 'sem_ab'],
        [xml(mmAg, mmA, mmB, E.botao('AB', seq(numero(v('contador'))))), 'ab_mostra'],
        [maismenos, null],
      ],
    },
    { // N3·9 · Estatística do dado
      ok: est(), errado: [est({ se: 'sete' }), est({ todos: true })],
      fazer: [...vezes(3, 'botao:A', { esperar: 1600 }), 'botao:B'], espera: 400,
      regras: [
        [xml(eB), 'sem_a'],
        [xml(E.botao('A', seq(definir('contador', 0), numero(v('contador')))), eB), 'sem_repetir'],
        [est({ n: 10 }), 'poucos'],
        [est({ dado: false }), 'sem_dado'],
        [est({ se: 'none' }), 'sem_se'],
        [est({ se: 'sete' }), 'se_seis'],
        [est({ contar: false }), 'sem_contar'],
        [est({ reset: false }), 'sem_reset'],
        [est({ fora: false }), 'mostra_dentro'],
        [est({}, false), 'sem_b'],
        [xml(E.botao('A', seq(definir('contador', 0), repetir(60, definir('medida', aleatorio(1, 6)), seEntao(cmp(v('medida'), '==', 6), mudar('contador', 1))), numero(v('contador')))),
          E.botao('B', seq(grafico(5, 20)))), 'b_grafico'],
        [est(), null],
      ],
    },
    { // N3·10 · Cronómetro de voltas
      ok: voltas, errado: [xml(lIni, lA, lB('>'), lAB), xml(lIni, lA, lB('<', false), lAB)],
      fazer: ['botao:A', { esperar: 1500 }, 'botao:B', { esperar: 2600 }, 'botao:B', { esperar: 2600 }, 'botao:B', { esperar: 2600 }, 'botao:AB'], espera: 1800,
      regras: [
        [xml(lA, lB(), lAB), 'sem_inicio'],
        [xml(E.inicio(seq(definir('recorde', 0))), lA, lB(), lAB), 'inicio_recorde'],
        [xml(lIni, lB(), lAB), 'sem_a'],
        [xml(lIni, E.botao('A', seq(definir('medida', 0))), lB(), lAB), 'a_marca'],
        [xml(lIni, lA, lAB), 'sem_b'],
        [xml(lIni, lA, E.botao('B', seq(numero(v('contador')))), lAB), 'b_volta'],
        [xml(lIni, lA, E.botao('B', seq(definir('contador', conta(tempo(), '-', v('medida'))), numero(v('contador')))), lAB), 'b_segundos'],
        [xml(lIni, lA, E.botao('B', seq(definir('contador', volta()))), lAB), 'b_mostra'],
        [xml(lIni, lA, E.botao('B', seq(definir('contador', volta()), numero(v('contador')))), lAB), 'b_nova'],
        [xml(lIni, lA, E.botao('B', seq(definir('contador', volta()), numero(v('contador')), definir('medida', tempo()))), lAB), 'b_recorde'],
        [xml(lIni, lA, lB('>'), lAB), 'recorde_sinal'],
        [xml(lIni, lA, lB()), 'sem_ab'],
        [xml(lIni, lA, lB(), E.botao('AB', seq(numero(v('contador'))))), 'ab_mostra'],
        [voltas, null],
      ],
    },
    { // N3·11 · Jogo do 21
      ok: vinteum, errado: [xml(jIni, jAg(...carta(), rebenta(21, true, false)), jA), xml(jIni, jAg(...carta()), jA)],
      fazer: ['botao:A', { esperar: 200 }, ...vezes(8, 'agitar', { esperar: 2900 }), 'botao:A'], espera: 400,
      regras: [
        [xml(jAg(...carta(), rebenta()), jA), 'sem_inicio'],
        [xml(E.inicio(seq(definir('pontos', 0))), jAg(...carta(), rebenta()), jA), 'inicio_vidas'],
        [xml(jIni, jA), 'sem_agitar'],
        [xml(jIni, jAg(numero(aleatorio(1, 10))), jA), 'sem_carta'],
        [xml(jIni, jAg(...carta(13), rebenta()), jA), 'limites'],
        [xml(jIni, jAg(definir('contador', aleatorio(1, 10)), numero(v('contador'))), jA), 'sem_soma'],
        [xml(jIni, jAg(definir('contador', aleatorio(1, 10)), mudar('pontos', v('contador'))), jA), 'sem_mostrar'],
        [xml(jIni, jAg(...carta()), jA), 'sem_se'],
        [xml(jIni, jAg(...carta(), rebenta(30)), jA), 'se_vinte_um'],
        [xml(jIni, jAg(...carta(), rebenta(21, false)), jA), 'sem_vida'],
        [xml(jIni, jAg(...carta(), rebenta(21, true, false)), jA), 'sem_recomeco'],
        [xml(jIni, jAg(...carta(), rebenta())), 'sem_a'],
        [xml(jIni, jAg(...carta(), rebenta()), E.botao('A', seq(numero(v('pontos'))))), 'a_mostra'],
        [vinteum, null],
      ],
    },
  ],
};
