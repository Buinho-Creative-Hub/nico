# IC Sensing Lab: duas casas, testes e produção

| | Endereço | Para quê | Como se atualiza |
|---|---|---|---|
| **Testes** | https://nico.buinho.pt/ic/ | O Pacheco publica cada mudança e o Carlos experimenta logo. | `git push` no repo `Buinho-Creative-Hub/nico` (pasta `ic/`), que publica pelo GitHub Pages em ~1 min. |
| **Produção** | https://invisiblecartographies.eu/lab/ | A versão que as escolas e os museus usam. Recebe **só versões testadas**. | Um zip com a pasta `lab/`, enviado pelo cPanel do Webtuga (conta `preciou1`). |

As duas casas usam a **mesma API das turmas** (`nico-api.buinho.pt`), com as mesmas contas de professor.

O progresso das crianças fica guardado no browser, separado por endereço. Uma criança que usou a versão de testes
não leva esse progresso para o site. Isto é de propósito: os testes não sujam a produção.

## Uma vez só (montagem, 27 Out 2026)

1. **Site do IC (Webtuga, `preciou1`, raiz da app = onde está o `app.py`):**
   - subir `lab.py` para a raiz;
   - no `passenger_wsgi.py`, acrescentar no fim as duas linhas abaixo e gravar em **utf-8**:
     ```python
     import lab
     lab.registar(application)
     ```
   O `app.py` **não se mexe**: as rotas `/lab/` ficam todas no `lab.py`. O `/survey`, o `/apply` e o resto do site
   continuam como estão.
2. **API das turmas (cPanel `buinhoed`, nico-api):** substituir o `index.php` pela versão 1.1.0. Esta versão:
   - aceita pedidos de `invisiblecartographies.eu` e de `www.invisiblecartographies.eu`;
   - envia os emails dos professores do IC (conta nova, password esquecida) com o nome do IC, na língua do
     professor e com o endereço `invisiblecartographies.eu/lab/professor.html`.

   O Nico continua igual.
3. Fazer a primeira publicação, como se explica a seguir.
4. **Backoffice do site** (`/admin` → Resources → New): criar o cartão do recurso com os textos do fim desta página.

## Cada versão nova (quando a de testes estiver boa)

1. O Pacheco corre os testes (`testar.js` nas 4 línguas, `turmas.js`, `site-ic.js`) e gera o zip com:
   ```
   ferramentas/publicar-site-ic.sh <pasta>     →  ic-lab-<versão>-<commit>.zip  (uma pasta lab/ lá dentro)
   ```
   Regista a publicação em `docs/PUBLICACOES.md` (versão, commit, data), para se saber sempre o que está em produção.
2. O Carlos, no cPanel (`preciou1`), na **raiz da app**:
   - apagar a pasta `lab/` antiga;
   - subir o zip;
   - Extrair, para que fique `…/lab/index.html` e **não** `…/lab/lab/`;
   - apagar o zip;
   - **Restart** na Setup Python App.
3. Confirmar que https://invisiblecartographies.eu/lab/VERSAO.txt mostra a versão e o commit certos. O Pacheco
   confirma também que `/lab/`, `/sr/lab` e `/lab/professor.html` respondem.

O service worker guarda a plataforma para usar sem internet e vai buscar a versão nova sozinho. Quem já tinha a
plataforma aberta vê a versão nova da vez seguinte que a abrir.

## Cartão em «Resources» (backoffice)

- **Link:** `/lab/`
- **Cover image URL:** `/lab/img/capa-recurso.jpg`
- **License:** `CC BY-NC-SA 4.0`
- **Meta, nas 4 línguas:** `Toolkit` · `Алат` · `Herramienta` · `Ferramenta`

| | Título | Texto |
|---|---|---|
| EN | Sensing Lab — block coding for sensory mapping | Program a micro:bit to listen, see and feel a place, in six missions with Lio and Mo. Built-in kit and Sensory OLED blocks, perspectives of neurodivergent children, accessibility options and a teacher area. Works offline. |
| SR | Сензорна лабораторија — програмирање блоковима за сензорно мапирање | Програмирај micro:bit да слуша, види и осећа место, кроз шест мисија са Лиом и Мо. Блокови за комплет и Sensory OLED, углови гледања неуроразличите деце, опције приступачности и простор за наставнике. Ради и без интернета. |
| ES | Laboratorio sensorial — programación por bloques para el mapeo sensorial | Programa un micro:bit para escuchar, ver y sentir un lugar, en seis misiones con Lio y Mo. Bloques del kit y de la Sensory OLED incluidos, perspectivas de niños neurodivergentes, opciones de accesibilidad y un área del profesorado. Funciona sin internet. |
| PT | Laboratório sensorial — programação por blocos para o mapeamento sensorial | Programa um micro:bit para ouvir, ver e sentir um sítio, em seis missões com o Lio e a Mo. Blocos do kit e da Sensory OLED incluídos, perspetivas de crianças neurodivergentes, opções de acessibilidade e uma área do professor. Funciona sem internet. |

O link é um só para as 4 línguas. A plataforma abre na língua do browser, e há o seletor no topo. Os endereços
`/pt/lab`, `/es/lab` e `/sr/lab` abrem já na língua certa: servem para emails e cartazes.
