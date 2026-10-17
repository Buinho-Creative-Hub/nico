# Gabi · registo de testes, limitações e próximos passos

Testes de 17 Out 2026, corridos automaticamente num Chrome (headless) sobre a Faísca com `?todos=1`. Cada cenário monta o programa, simula o que a criança faz (agitar, logotipo, botões, pinos, «Ajuda») e regista o que a Gabi diz.

## Fase 1 · Desafio 2 (Coração a bater) — o exemplo da missão

| Passo | O que a criança faz | O que a Gabi faz | Resultado |
|---|---|---|---|
| 1 | Põe os corações dentro do «repetir», sem pausas, e toca no logotipo | Ao fim de 4 s sem o desafio cumprido: **curiosa**, pista 1 — «Hmm… o coração está a mudar tão depressa! Será que conseguimos controlar o tempo?» | ✔ |
| 2 | Carrega em «Ajuda» | **a dar uma dica**, pista 2 — «Procura um bloco azul que nos deixe esperar…» | ✔ |
| 3 | Carrega outra vez | pista 3 — «Experimenta colocar uma pausa de 200 ms depois de cada coração.» | ✔ |
| 4 | Põe as pausas | **a incentivar** — «Isso! Com a pausa já se vê o coração.» (só porque já tinha recebido pista sobre isto) | ✔ |
| 5 | Toca no logotipo | Festa com a Gabi **a celebrar**: «Boa! Agora já consigo ver o coração a bater…»; se acabou em menos de 2 min: «Desafio extra: E se fizéssemos o coração bater cada vez mais depressa?» | ✔ |

**Presença ≠ execução.** O desafio 2 só fica cumprido quando o coração grande e o pequeno ficam **visíveis** pelo menos 120 ms cada, 4 vezes, depois de tocar no logotipo. Ter os blocos não chega: é preciso correr o programa e o programa tem de fazer o coração bater. Por isso o «mostrar ícone» da Faísca não espera 600 ms como o do MakeCode: sem pausa, os desenhos mudam tão depressa que não se vêem, e a criança descobre o porquê da pausa.

## Fase 2 · Outros cenários

| Cenário | Esperado | Resultado |
|---|---|---|
| D2 · solução alternativa: 4 cópias de coração/pausa sem «repetir» | Cumprido, sem queixas sobre o «repetir» | ✔ festa |
| D2 · «repetir» com os corações fora do bloco do logotipo | Regra «fora do logotipo» (contexto errado) | ✔ pista «Os corações estão fora do logotipo…» |
| D2 · programa certo, mas ninguém experimenta | Ao fim de 7 s: «Parece-me bem! Mas só acredito vendo: toca no logotipo dourado.» | ✔ sem festa até testar |
| D1 · ícone solto fora do «em agitar» → Ajuda → corrige → agita | Pista, depois «Encaixou! Já fazem equipa.», depois festa | ✔ |
| D1 · cara errada, 3 testes seguidos | Pista 1 ao 1.º teste; nada ao 2.º (não repete); **calma** ao 3.º | ✔ |
| D3 · dois botões A e nenhum B | «Tens dois botões A! E o B, fica sem nada?» (**surpreendida**) | ✔ |
| D3 · 50 s parada | Convite discreto (balão tracejado): «Precisas de uma ajudinha? Carrega em «Ajuda».» — não abre nada à força | ✔ |
| D6 · LED acende e nunca apaga | «O LED acende… e fica aceso para sempre!» | ✔ sem festa |
| D6 · solução alternativa: LED no P0 em vez do P2 | Cumprido (conta acender → tocar → apagar no mesmo pino) | ✔ festa |
| D2 · «Ajudar a Gabi» (a Gabi também erra) | Guarda o programa da criança, carrega a gambiarra da Gabi (corações sem pausas), agradece quando fica reparada, «Voltar ao meu programa» repõe tudo | ✔ programa da criança reposto |
| Tablet 1024×768 | Painel da Gabi por baixo da área de blocos, sem tapar blocos nem botões | ✔ |
| Ecrã estreito (820 px) | Gabi começa recolhida (só a cabeça + «Ajuda»); mensagens novas mostram um ponto vermelho em vez de abrir | ✔ |

## Arquitectura

| Ficheiro | Papel |
|---|---|
| `js/tutor-analise.js` | Lê o programa (eventos, blocos soltos, o que está dentro de quê). Não tem interface. |
| `missoes/primeiros-passos.js` + `mascotes/gabi.js` | **Configuração**: regras e mensagens por desafio, com 3 níveis de pista, mensagens de correcção, sucesso, extensão e a gambiarra da Gabi. Editar aqui para mudar o que a Gabi diz. (Missões em `missoes/`, mascotes em `mascotes/`.) |
| `js/tutor-motor.js` | Motor pedagógico: decide quando falar (teste falhado, pedido de ajuda, correcção, inactividade, «agora experimenta», calma). Não toca na interface. |
| `js/tutor-ui.js` | Painel, balão, sprites, recolher/mostrar. |
| `img/gabi/` | Os 8 sprites aprovados, recortados da folha enviada. |
| `estados.html` | Demonstração dos estados e de quando aparecem (`?a=nico` para o Nico). |

Sem API paga e sem IA generativa: tudo corre no browser, também sem internet.

## Limitações conhecidas

1. **Sprites recortados da folha de contacto.** Têm ~140 px de altura, alguns vêm cortados em baixo e nas laterais (como na folha), e o fundo cinzento foi retirado por recorte automático. Para a versão final faltam os **PNG originais, transparentes e em alta resolução** — basta substituir os ficheiros em `img/gabi/` com os mesmos nomes.
2. **O 4.º teste falhado em diante** não traz mais pistas sozinho: a partir da pista 1 automática e da mensagem de calma, a criança tem de pedir. É intencional (não resolver por ela), mas convém ver em sala se é o equilíbrio certo.
3. **Tempo de espera do teste** fixo em 4 s. Programas longos (o livre) podem disparar «ainda não é bem isso» antes de acabarem; no desafio livre a Gabi não avalia.
4. **Micro:bit verdadeiro:** os testes feitos na placa contam igual (os acontecimentos chegam pelo mesmo caminho), mas nada disto foi testado com placa física — mesma ressalva da ligação Bluetooth.
5. **Regras dos desafios 3 a 6** cobrem os erros mais previsíveis; precisam de ser afinadas com o que se observar nas primeiras sessões.

## Próximos passos

1. Receber os PNG finais da Gabi e substituir em `img/gabi/`.
2. Testar numa sessão real (12 alunos) e anotar: que pistas foram pedidas, em que nível resolveram, que erros apareceram que nenhuma regra apanha.
3. Fase 3: memória de dificuldades por aluno (ex.: se pediu a pista 3 da pausa no desafio 2, começar o desafio 3 com mais apoio), mais gambiarras da Gabi, e avaliar se uma IA acrescenta valor — só depois de ver as regras a funcionar em sala.
