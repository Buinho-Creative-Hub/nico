/* Faísca Desafios — receitas de pistas (para escrever muitos desafios com a mesma qualidade).
 *
 * Cada receita devolve uma regra pedagógica completa { id, ativa, pistas[3], corrigido }:
 *   nível 1 = a pergunta conceptual (escrita à mão em cada desafio — é a parte que importa)
 *   nível 2 = orienta (onde procurar, cor do bloco)
 *   nível 3 = diz o gesto concreto
 *
 *   P.evento(chave, pergunta)                    falta o bloco cor-de-rosa (ou «para sempre», «no arranque»)
 *   P.bloco(chave, tipo, pergunta)               o evento existe mas falta lá dentro o bloco «tipo»
 *   P.valorEm(chave, alvo, valor, pergunta)      falta encaixar o valor (sensor, variável, conta…) no bloco «alvo»
 *   P.regra(id, ativa, [p1, p2, p3], corrigido)  regra à medida (p = texto ou [estado, texto])
 * chave: 'botao:A', 'pino:P1', 'gesto:left', 'agitar', 'logo', 'sempre', 'inicio', 'somalto',
 *        um prefixo terminado em ':' (qualquer pino → 'pino:'), ou '*' (qualquer evento).
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const A = () => F.ajudasTutor;

  // nome do bloco como aparece no ecrã + cor da gaveta (para as crianças o encontrarem)
  const COR = { entrada: 'cor-de-rosa', basico: 'azul', ciclos: 'verde', logica: 'verde-azulado', musica: 'laranja',
    pinos: 'vermelho-escuro', led: 'roxo', variaveis: 'vermelho', matematica: 'violeta', registo: 'verde-escuro' };
  const B = {
    mk_icone: ['mostrar ícone', 'basico'], mk_limpar: ['limpar ecrã', 'basico'], mk_pausa: ['pausa (ms)', 'basico'],
    mk_mostrar_numero: ['mostrar número', 'basico'], mk_mostrar_texto: ['mostrar texto', 'basico'],
    mk_repetir: ['repetir … vezes', 'ciclos'], mk_se: ['se … então … senão', 'logica'], mk_se_entao: ['se … então', 'logica'],
    mk_comparar: ['comparar (< = >)', 'logica'], mk_escuro: ['está escuro', 'entrada'], mk_botao_premido: ['botão … premido', 'entrada'],
    mk_som: ['tocar som', 'musica'], mk_tom: ['tocar tom', 'musica'],
    mk_digital: ['gravação digital pin', 'pinos'], mk_ler_digital: ['leitura digital pin', 'pinos'],
    mk_ler_analogico: ['leitura analógica pin', 'pinos'], mk_servo: ['escrever servo pin', 'pinos'],
    mk_luz: ['nível de luz', 'entrada'], mk_som_nivel: ['nível de som', 'entrada'], mk_temperatura: ['temperatura (°C)', 'entrada'],
    mk_tempo: ['tempo de execução (ms)', 'entrada'],
    mk_acender: ['acender x y', 'led'], mk_apagar_led: ['apagar x y', 'led'], mk_grafico: ['desenhar gráfico de barras', 'led'],
    mk_var_definir: ['definir … para', 'variaveis'], mk_var_mudar: ['mudar … em', 'variaveis'], mk_var: ['a variável', 'variaveis'],
    mk_conta: ['conta (+ − × ÷)', 'matematica'], mk_aleatorio: ['escolher ao acaso', 'matematica'], mk_resto: ['resto de … ÷ …', 'matematica'],
    mk_registar: ['registar dados', 'registo'],
  };
  const GESTO = Object.fromEntries((F.GESTOS || []).map(([n, v]) => [v, n]));
  function nomeEvento(chave) {
    if (chave === '*') return 'um bloco cor-de-rosa';
    const [k, v] = chave.split(':');
    switch (k) {
      case 'botao': return v === 'AB' ? 'no botão A+B premido' : `no botão ${v || 'A'} premido`;
      case 'pino': return `no pin ${v || 'P1'} premido`;
      case 'gesto': return 'em ' + (GESTO[v] || 'inclinado');
      case 'agitar': return 'em agitar';
      case 'logo': return 'ao logotipo pressionado';
      case 'sempre': return 'para sempre';
      case 'inicio': return 'no arranque';
      case 'somalto': return 'em som alto';
    }
    return chave;
  }
  const corEvento = chave => (chave === 'sempre' || chave === 'inicio') ? 'azul' : 'cor-de-rosa';
  const nome = tipo => (B[tipo] || [tipo])[0];
  const cor = tipo => COR[(B[tipo] || [])[1]] || '';
  // eventos do programa que correspondem à chave
  function evs(a, chave) {
    if (chave === '*') return a.eventos;
    if (chave.endsWith(':')) return a.eventosDe(chave);
    return a.eventos.filter(e => e.chave === chave);
  }
  const est = (p, d) => Array.isArray(p) ? p : [d, p];
  // «se … então … senão» e «se … então» contam os dois como «se»
  const variantes = tipo => tipo === 'mk_se' || tipo === 'mk_se_entao' ? ['mk_se', 'mk_se_entao'] : [tipo];
  const temTipo = (e, tipo) => variantes(tipo).some(t => A().tem(e, t));
  const blocosTipo = (e, tipo) => variantes(tipo).flatMap(t => A().blocos(e, t));
  const dentroTipo = (e, alvo, valor) => variantes(alvo).some(t => A().dentro(e, t, valor));

  const P = {
    nome, cor, nomeEvento, evs,
    regra(id, ativa, pistas, corrigido) {
      return { id, ativa, pistas: [est(pistas[0], 'curiosa'), est(pistas[1], 'dica'), est(pistas[2], 'dica')], corrigido: corrigido || 'Isso mesmo!' };
    },
    evento(chave, pergunta, corrigido) {
      const n = nomeEvento(chave);
      return P.regra('sem_' + chave.replace(/[^a-z0-9]/gi, '_'), a => evs(a, chave).length === 0, [
        pergunta,
        `Procura na coluna branca o bloco ${corEvento(chave)} «${n}».`,
        `Arrasta «${n}» para a área cinzenta.`,
      ], corrigido || 'Boa, já está à escuta!');
    },
    bloco(chave, tipo, pergunta, corrigido) {
      const n = nome(tipo), ne = nomeEvento(chave);
      return P.regra('sem_' + tipo + '_' + chave.replace(/[^a-z0-9]/gi, '_'),
        a => evs(a, chave).length > 0 && !evs(a, chave).some(e => temTipo(e, tipo)), [
          pergunta,
          `Há um bloco ${cor(tipo)} que pode ajudar: «${n}».`,
          `Põe «${n}» dentro de «${ne}».`,
        ], corrigido || 'Isso! Já está no sítio.');
    },
    valorEm(chave, alvo, valor, pergunta, corrigido) {
      const na = nome(alvo), nv = nome(valor);
      return P.regra('sem_' + valor + '_em_' + alvo,
        a => evs(a, chave).some(e => blocosTipo(e, alvo).length > 0) && !evs(a, chave).some(e => dentroTipo(e, alvo, valor)), [
          pergunta,
          `O «${na}» precisa de um valor. Procura o bloco ${cor(valor)} «${nv}».`,
          `Encaixa «${nv}» no buraco do «${na}».`,
        ], corrigido || 'Encaixou! Agora o valor muda sozinho.');
    },
  };
  F.pistas = P;
})();
