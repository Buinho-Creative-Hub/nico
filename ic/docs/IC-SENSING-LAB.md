# IC Sensing Lab — a edição Invisible Cartographies do motor do Nico

> Pedido do Carlos (20 Out 2026): plataforma própria do Invisible Cartographies nas línguas do projeto, com o motor
> e os gráficos do Nico, extensões e desafios do projeto, para apoiar os colegas de Belgrado (introdução à
> programação por blocos mais focada do que o MakeCode inteiro; extensões já instaladas) e como output de maior
> qualidade para o projeto (WP3, D3.3 *Citizen Sensing toolkit for educators*, M21; alimenta o D2.2 da Veljko).

## O que mudou em relação ao Nico (o motor é o mesmo — `docs/PLATAFORMA.md`)

| Área | IC Sensing Lab |
|---|---|
| Línguas | EN · SR (cirílico) · ES · PT. `js/i18n.js` (`F.LANG`, `F.t`, `F.s`, `F.localizar`), `i18n/ui.js` (interface), `i18n/blocos.js` (texto dos blocos — EN igual ao MakeCode/IC-Oled), `i18n/educadores.js`. Missões e mascotes escrevem `T(en, sr, es, pt)`; `F.registarMissao/Mascote` localizam tudo. Blockly com `vendor/blockly-msg-<l>.js`. Pistas de nível 2/3 geradas na língua (`js/pistas.js`). |
| Letras nos ecrãs | O micro:bit e o OLED só têm latim básico: `F.paraLatim` (cirílico → latim, sem acentos) no ecrã e no `.hex` (`mk_texto`). Os textos por defeito que vão para o micro:bit são ASCII (`oled_*`, `palavra_*`, `col_*`). |
| Acessibilidade | `js/acessibilidade.js` + `css/ic.css`: interruptores (desligados por defeito) — modo calmo (sem música/efeitos/animações; a mascote não interrompe — `tutor-motor.js`), alto contraste, letra e blocos grandes (blocos a 140 %), ler em voz alta (Web Speech; 🔊 na perspetiva, no desafio e na mascote). `?a11y=calmo,grande`. Música desligada por defeito. |
| Perspetivas | `missoes/perspetivas.js`: Ana (autista, hiperacusia, masking), Luka (PHDA), Mira (cega), Teo (autista, procura sensações, comunica com tablet/cartões), Dani (dislexia), Nina (amiga da Mira). Cartão no lado esquerdo (aberto quando a voz muda), «Para pensar» na festa de cada desafio. A rever com pessoas com experiência vivida. |
| Missões | `ouvir` (7), `detetives` (6), `sentir` (6), `estacao` (6), `calma` (6) + projeto livre em cada uma + `livre` (modo livre sem a gaveta OLED da ELECFREAKS — no IC só a Sensory OLED). Ajudas comuns em `missoes/_base.js` (`F.IC.T/V/X`). |
| Motor | `motor.js`: `so_barra` regista `barra:V:MIN:MAX`; `so_atividade` regista o nível (`atividade:N`). `tutor-analise.js` conhece min/max/rótulo/texto dos blocos Sensory OLED. «PICO» → «PEAK» (como a extensão). |
| Mascotes | Lio (morcego, mapeia pelo som) e Mo (toupeira, mapeia pelo tato) — ilustrações do Ambrósio (pacote v1, 20 Out 2026, revisão plana aprovada pelo Carlos), 8 estados cada, recortados a um enquadramento comum por mascote e reduzidos a 300 px de largura. Poses de palco (8 por mascote) e 6 cenários de museu guardados no buinho-os (`handoffs/assets/2026-10-20_ic-lio-mo-v1/`) para uma futura Missão 0 de museu. Arte reservada (fora da licença CC). Sem Turmas nesta versão. |
| Marca | Paleta e letras do site do IC (Roboto/Roboto Slab com cirílico), símbolo e texturas do IC, logótipo UE no rodapé; Buinho só como autor técnico. |

## Missões ↔ guia «Sensory Mapping in Museums»

| Missão | Guia | Validação (pelo registo) |
|---|---|---|
| 1 Ouvir o lugar | A5–A6, Atividade 1 | número do som; gráfico; duas caras dos dois lados do limite; limite em variável que o A baixa e a cara segue; número grande dB; barra 40–85; 3 palavras por faixa (<50, <70, ≥70) |
| 2 Detetives | A7, Atividade 2 | luz; A ruído / B luz no número grande; média de 5 s (o número sobe devagar); duas mensagens de luz; variável `modo`; A+B regista ruído e luz |
| 3 Botões do sentir | Atividade 3 | duas caras; mesma coluna 1/2; contador do B; sentimento + som no mesmo toque; logotipo = símbolo + LED (pausa sem palavras); três sentimentos 1/2/3 |
| 4 Estação | Field protocol | PIR → ícone/limpar; medidor de atividade enche; movimentos por minuto; registo a ~1 s; três colunas; «cheio» que fica depois de o PIR parar |
| 5 Desenhar a calma | Atividade 5 | passos (+1, duas vezes); contagem 3-2-1 com pausas e símbolo; respiração lenta (≥ 1,5 s por ícone); bandeira servo P8; luz → som (tom sobe com a luz); canto calmo (servo + ícone) |

## Testes
`LINGUA=<en|sr|es|pt> node testes/testar.js` — 5 missões × 2 mascotes (soluções certas passam, erradas não, regras
caso a caso, «parece pronto», Python válido, `.hex`, gambiarras, ajuda em 3 níveis, textos em falta). Os quatro
idiomas passaram a 20 Out 2026. Mais `modo-livre.js`, `abrir-hex.js`, `blocos-novos.js`, `offline.js`.

## Por fazer
- Revisão nativa SR (Veljko) e ES (FabLab Cuenca); revisão das perspetivas com pessoas com experiência vivida.
- Nome da plataforma: «Sensing Lab» é proposta, não decisão de naming (nota do Ambrósio).
- Teste com o kit verdadeiro e com crianças (Belgrado, ronda de novembro/janeiro).
- Navegação por teclado no editor de blocos (plugin de teclado do Blockly), níveis 2 das missões, Missão 0 de museu
  (palco) quando houver ilustrações, Turmas (como no Nico) se o consórcio quiser.
