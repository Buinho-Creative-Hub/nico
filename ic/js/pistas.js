/* Faísca Desafios — receitas de pistas (para escrever muitos desafios com a mesma qualidade).
 * IC Sensing Lab: as pistas de nível 2 e 3 saem na língua escolhida (EN · SR · ES · PT), com o nome do bloco tal como
 * aparece no ecrã (i18n/blocos.js) e a cor da gaveta.
 *
 * Cada receita devolve uma regra pedagógica completa { id, ativa, pistas[3], corrigido }:
 *   nível 1 = a pergunta conceptual (escrita à mão em cada desafio — é a parte que importa)
 *   nível 2 = orienta (onde procurar, cor do bloco)
 *   nível 3 = diz o gesto concreto
 *
 *   P.evento(chave, pergunta)                    falta o bloco cor-de-rosa (ou «para sempre», «no arranque»)
 *   P.bloco(chave, tipo, pergunta)               o evento existe mas falta lá dentro o bloco «tipo»
 *   P.valorEm(chave, alvo, valor, pergunta)      falta encaixar o valor (sensor, variável, conta…) no bloco «alvo»
 *   P.regra(id, ativa, [p1, p2, p3], corrigido)  regra à medida (p = texto ou [estado, texto]; texto pode ser { en, sr, es, pt })
 * chave: 'botao:A', 'pino:P1', 'gesto:left', 'agitar', 'logo', 'sempre', 'inicio', 'somalto',
 *        um prefixo terminado em ':' (qualquer pino → 'pino:'), ou '*' (qualquer evento).
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const A = () => F.ajudasTutor;
  const L = () => F.LANG || 'en';

  // cor da gaveta, por língua (o Sérvio concorda com «блок», masculino)
  const CORES = {
    pt: { entrada: 'cor-de-rosa', basico: 'azul', ciclos: 'verde', logica: 'verde-azulado', musica: 'laranja', pinos: 'vermelho-escuro', led: 'roxo',
      variaveis: 'vermelho', matematica: 'violeta', registo: 'verde-escuro', octopus: 'cor de laranja (Octopus)', oled: 'turquesa (OLED)', sensory: 'roxo (Sensory OLED)', conforto: 'verde (Conforto)' },
    en: { entrada: 'pink', basico: 'blue', ciclos: 'green', logica: 'teal', musica: 'orange-red', pinos: 'dark red', led: 'purple',
      variaveis: 'red', matematica: 'violet', registo: 'dark green', octopus: 'orange (Octopus)', oled: 'turquoise (OLED)', sensory: 'purple (Sensory OLED)', conforto: 'green (Comfort)' },
    es: { entrada: 'rosa', basico: 'azul', ciclos: 'verde', logica: 'verde azulado', musica: 'naranja', pinos: 'rojo oscuro', led: 'morado',
      variaveis: 'rojo', matematica: 'violeta', registo: 'verde oscuro', octopus: 'naranja (Octopus)', oled: 'turquesa (OLED)', sensory: 'morado (Sensory OLED)', conforto: 'verde (Confort)' },
    sr: { entrada: 'розе', basico: 'плави', ciclos: 'зелени', logica: 'тиркизни', musica: 'наранџасти', pinos: 'тамноцрвени', led: 'љубичасти',
      variaveis: 'црвени', matematica: 'љубичасти', registo: 'тамнозелени', octopus: 'наранџасти (Octopus)', oled: 'тиркизни (OLED)', sensory: 'љубичасти (Sensory OLED)', conforto: 'зелени (Удобност)' },
  };
  // nome do bloco em PT + gaveta (as outras línguas saem de i18n/blocos.js)
  const B = {
    mk_icone: ['mostrar ícone', 'basico'], mk_limpar: ['limpar ecrã', 'basico'], mk_pausa: ['pausa (ms)', 'basico'],
    mk_mostrar_numero: ['mostrar número', 'basico'], mk_mostrar_texto: ['mostrar texto', 'basico'],
    mk_repetir: ['repetir … vezes', 'ciclos'], mk_enquanto: ['enquanto … fazer', 'ciclos'], mk_se: ['se … então … senão', 'logica'], mk_se_entao: ['se … então', 'logica'],
    mk_comparar: ['comparar (< = >)', 'logica'], mk_escuro: ['está escuro', 'entrada'], mk_botao_premido: ['botão … premido', 'entrada'], mk_pino_premido: ['pin … premido', 'entrada'],
    mk_som: ['tocar som', 'musica'], mk_tom: ['tocar tom', 'musica'],
    mk_digital: ['gravação digital pin', 'pinos'], mk_ler_digital: ['leitura digital pin', 'pinos'],
    mk_ler_analogico: ['leitura analógica pin', 'pinos'], mk_servo: ['escrever servo pin', 'pinos'],
    mk_luz: ['nível de luz', 'entrada'], mk_som_nivel: ['nível de som', 'entrada'], mk_temperatura: ['temperatura (°C)', 'entrada'],
    mk_tempo: ['tempo de execução (ms)', 'entrada'],
    mk_acender: ['acender x y', 'led'], mk_apagar_led: ['apagar x y', 'led'], mk_grafico: ['desenhar gráfico de barras', 'led'],
    mk_var_definir: ['definir … para', 'variaveis'], mk_var_mudar: ['mudar … em', 'variaveis'], mk_var: ['a variável', 'variaveis'],
    mk_conta: ['conta (+ − × ÷)', 'matematica'], mk_aleatorio: ['escolher ao acaso', 'matematica'], mk_resto: ['resto de … ÷ …', 'matematica'],
    mk_registar: ['registar dados', 'registo'],
    mk_kit_ruido: ['valor do ruído (dB)', 'octopus'], mk_kit_luz: ['valor da intensidade da luz', 'octopus'], mk_kit_pir: ['sensor PIR deteta movimento', 'octopus'],
    mk_kit_bme: ['valor do BME280', 'octopus'],
    so_barra: ['barra de intensidade', 'sensory'], so_grande: ['número grande', 'sensory'], so_grafico: ['gráfico a passar', 'sensory'],
    so_atividade: ['medidor de atividade', 'sensory'], so_texto: ['mostrar texto … na linha', 'sensory'], so_limpar: ['limpar OLED', 'sensory'],
    so_escrever: ['escrever … em x y', 'sensory'], so_animacao: ['mostrar animação', 'sensory'], so_media: ['média de … em … s', 'sensory'],
    so_db: ['dB a partir do nível de som', 'sensory'], so_pir: ['PIR deteta movimento', 'sensory'], so_nivel: ['nível de atividade', 'sensory'],
    so_movimentos: ['movimentos por minuto', 'sensory'],
    cf_perfil: ['usar o perfil sensorial de', 'conforto'], cf_limite_definir: ['definir o meu limite de … para', 'conforto'], cf_limite: ['o meu limite de', 'conforto'],
    cf_demais: ['… é demais para o meu limite', 'conforto'], cf_zona: ['zona de conforto de', 'conforto'], cf_subito: ['salto súbito de … maior do que', 'conforto'],
    cf_sinal: ['sinal suave', 'conforto'], cf_sonificar: ['tocar … como som', 'conforto'], cf_paragem_seguinte: ['paragem seguinte do percurso', 'conforto'],
    cf_paragem: ['número da paragem', 'conforto'], cf_registar_ponto: ['registar paragem', 'conforto'],
  };
  const MANUAIS = {   // nomes que não saem bem do texto do bloco
    mk_var: { en: 'the variable', es: 'la variable', sr: 'променљива' },
    mk_conta: { en: 'calculation (+ − × ÷)', es: 'operación (+ − × ÷)', sr: 'рачун (+ − × ÷)' },
    mk_comparar: { en: 'compare (< = >)', es: 'comparar (< = >)', sr: 'поређење (< = >)' },
  };
  function nomeBloco(tipo) {
    const l = L();
    if (l === 'pt' || !F.TEXTOS_BLOCOS) return (B[tipo] || [tipo])[0];
    if (MANUAIS[tipo]) return MANUAIS[tipo][l] || MANUAIS[tipo].en;
    const t = F.TEXTOS_BLOCOS[tipo];
    const m = t && (t[l] || t.en);
    if (!m) return (B[tipo] || [tipo])[0];
    return m.filter(x => x && x !== '%1').join(' … ').replace(/\s*%\d+\s*/g, ' … ').replace(/(\s*…\s*)+/g, ' … ').replace(/\s*…\s*$/, '').trim();
  }
  const T = {
    um_rosa: { pt: 'um bloco cor-de-rosa', en: 'a pink block', es: 'un bloque rosa', sr: 'један розе блок' },
    l2_evento: { pt: 'Procura na coluna branca o bloco {cor} «{n}».', en: 'Look in the white column for the {cor} block «{n}».', es: 'Busca en la columna blanca el bloque {cor} «{n}».', sr: 'Потражи у белој колони {cor} блок «{n}».' },
    l3_evento: { pt: 'Arrasta «{n}» para a área cinzenta.', en: 'Drag «{n}» into the grey area.', es: 'Arrastra «{n}» al área gris.', sr: 'Превуци «{n}» у сиву површину.' },
    ok_evento: { pt: 'Boa, já está à escuta!', en: 'Good, now it is listening!', es: '¡Bien, ya está escuchando!', sr: 'Браво, сад слуша!' },
    l2_bloco: { pt: 'Há um bloco {cor} que pode ajudar: «{n}».', en: 'There is a {cor} block that can help: «{n}».', es: 'Hay un bloque {cor} que puede ayudar: «{n}».', sr: 'Постоји {cor} блок који може да помогне: «{n}».' },
    l3_bloco: { pt: 'Põe «{n}» dentro de «{ne}».', en: 'Put «{n}» inside «{ne}».', es: 'Pon «{n}» dentro de «{ne}».', sr: 'Стави «{n}» унутар «{ne}».' },
    ok_bloco: { pt: 'Isso! Já está no sítio.', en: 'That’s it! It’s in the right place.', es: '¡Eso es! Ya está en su sitio.', sr: 'То је то! Сад је на правом месту.' },
    l2_valor: { pt: 'O «{na}» precisa de um valor. Procura o bloco {cor} «{nv}».', en: '«{na}» needs a value. Look for the {cor} block «{nv}».', es: '«{na}» necesita un valor. Busca el bloque {cor} «{nv}».', sr: '«{na}» треба вредност. Потражи {cor} блок «{nv}».' },
    l3_valor: { pt: 'Encaixa «{nv}» no buraco do «{na}».', en: 'Snap «{nv}» into the hole in «{na}».', es: 'Encaja «{nv}» en el hueco de «{na}».', sr: 'Убаци «{nv}» у рупу у «{na}».' },
    ok_valor: { pt: 'Encaixou! Agora o valor muda sozinho.', en: 'It fits! Now the value changes by itself.', es: '¡Encajó! Ahora el valor cambia solo.', sr: 'Уклопило се! Сад се вредност сама мења.' },
    ok_regra: { pt: 'Isso mesmo!', en: 'Exactly!', es: '¡Exacto!', sr: 'Тачно тако!' },
  };
  const Q = { en: ['“', '”'], sr: ['„', '“'], es: ['«', '»'], pt: ['«', '»'] };
  const tx = (k, v) => {
    let s = (T[k][L()] || T[k].en).replace(/\{(\w+)\}/g, (m, x) => (v && v[x] !== undefined ? v[x] : m));
    const q = Q[L()] || Q.en;
    return s.replace(/«/g, q[0]).replace(/»/g, q[1]);
  };
  const GESTO = () => Object.fromEntries((F.GESTOS || []).map(([n, v]) => [v, n]));
  const EVENTOS = {
    pt: { botaoAB: 'no botão A+B premido', botao: 'no botão {v} premido', pino: 'no pin {v} premido', gesto: 'em {v}', agitar: 'em agitar', logo: 'ao logotipo pressionado', sempre: 'para sempre', inicio: 'no arranque', somalto: 'em som alto' },
    en: { botaoAB: 'on button A+B pressed', botao: 'on button {v} pressed', pino: 'on pin {v} pressed', gesto: 'on {v}', agitar: 'on shake', logo: 'on logo pressed', sempre: 'forever', inicio: 'on start', somalto: 'on loud sound' },
    es: { botaoAB: 'al presionar el botón A+B', botao: 'al presionar el botón {v}', pino: 'al presionar el pin {v}', gesto: 'al {v}', agitar: 'al agitar', logo: 'al presionar el logo', sempre: 'para siempre', inicio: 'al iniciar', somalto: 'al sonido fuerte' },
    sr: { botaoAB: 'при притиску на дугме A+B', botao: 'при притиску на дугме {v}', pino: 'при притиску на пин {v}', gesto: 'при {v}', agitar: 'при протресању', logo: 'при притиску на лого', sempre: 'заувек', inicio: 'при покретању', somalto: 'при гласном звуку' },
  };
  function nomeEvento(chave) {
    if (chave === '*') return tx('um_rosa');
    const E = EVENTOS[L()] || EVENTOS.en;
    const [k, v] = chave.split(':');
    const f = (s, x) => s.replace('{v}', x);
    switch (k) {
      case 'botao': return v === 'AB' ? E.botaoAB : f(E.botao, v || 'A');
      case 'pino': return f(E.pino, v || 'P1');
      case 'gesto': return f(E.gesto, GESTO()[v] || v);
      case 'agitar': return E.agitar;
      case 'logo': return E.logo;
      case 'sempre': return E.sempre;
      case 'inicio': return E.inicio;
      case 'somalto': return E.somalto;
    }
    return chave;
  }
  const corDe = g => (CORES[L()] || CORES.en)[g] || '';
  const corEvento = chave => corDe((chave === 'sempre' || chave === 'inicio') ? 'basico' : 'entrada');
  const nome = tipo => nomeBloco(tipo);
  const cor = tipo => corDe((B[tipo] || [])[1]);
  // eventos do programa que correspondem à chave
  function evs(a, chave) {
    if (chave === '*') return a.eventos;
    if (chave.endsWith(':')) return a.eventosDe(chave);
    return a.eventos.filter(e => e.chave === chave);
  }
  const est = (p, d) => Array.isArray(p) ? [p[0], F.t(p[1])] : [d, F.t(p)];
  // «se … então … senão» e «se … então» contam os dois como «se»
  const variantes = tipo => tipo === 'mk_se' || tipo === 'mk_se_entao' ? ['mk_se', 'mk_se_entao'] : [tipo];
  const temTipo = (e, tipo) => variantes(tipo).some(t => A().tem(e, t));
  const blocosTipo = (e, tipo) => variantes(tipo).flatMap(t => A().blocos(e, t));
  const dentroTipo = (e, alvo, valor) => variantes(alvo).some(t => A().dentro(e, t, valor));

  const P = {
    nome, cor, nomeEvento, evs, aspas: s => { const q = Q[L()] || Q.en; return q[0] + s + q[1]; },
    regra(id, ativa, pistas, corrigido) {
      return { id, ativa, pistas: [est(pistas[0], 'curiosa'), est(pistas[1], 'dica'), est(pistas[2], 'dica')], corrigido: F.t(corrigido) || tx('ok_regra') };
    },
    evento(chave, pergunta, corrigido) {
      const n = nomeEvento(chave);
      return P.regra('sem_' + chave.replace(/[^a-z0-9]/gi, '_'), a => evs(a, chave).length === 0, [
        pergunta,
        tx('l2_evento', { cor: corEvento(chave), n }),
        tx('l3_evento', { n }),
      ], corrigido || tx('ok_evento'));
    },
    bloco(chave, tipo, pergunta, corrigido) {
      const n = nome(tipo), ne = nomeEvento(chave);
      return P.regra('sem_' + tipo + '_' + chave.replace(/[^a-z0-9]/gi, '_'),
        a => evs(a, chave).length > 0 && !evs(a, chave).some(e => temTipo(e, tipo)), [
          pergunta,
          tx('l2_bloco', { cor: cor(tipo), n }),
          tx('l3_bloco', { n, ne }),
        ], corrigido || tx('ok_bloco'));
    },
    valorEm(chave, alvo, valor, pergunta, corrigido) {
      const na = nome(alvo), nv = nome(valor);
      return P.regra('sem_' + valor + '_em_' + alvo,
        a => evs(a, chave).some(e => blocosTipo(e, alvo).length > 0) && !evs(a, chave).some(e => dentroTipo(e, alvo, valor)), [
          pergunta,
          tx('l2_valor', { na, cor: cor(valor), nv }),
          tx('l3_valor', { nv, na }),
        ], corrigido || tx('ok_valor'));
    },
  };
  F.pistas = P;
})();
