# Invisible Cartographies · Sensing Lab

A block-programming platform for micro:bit and **citizen sensing**, made for the European project
**Invisible Cartographies** (Creative Europe, 2026–2027) — Veljko Ramadanović School (Belgrade, coordinator),
Buinho Associação (Messejana) and FabLab Cuenca. Part of WP3 *Art and Citizen Sensing* (citizen sensing toolkit for educators).

Children program a micro:bit to listen, see and feel a place — and discover that the same room can feel calm to one
person and too much for another.

- **Four languages:** English, Serbian (Cyrillic), Spanish, Portuguese (`?l=en|sr|es|pt`). SR and ES are automatic
  translations to be reviewed by the partners.
- **Six missions + free mode**, following the activity guide *Sensory Mapping in Museums* and the field protocol:
  Listen to the place · Room detectives · Feeling buttons · Sensing station · Designing calm · My comfort map
  (37 challenges + 6 free projects).
- **Comfort extension** (green drawer, only in this platform): personal limits and example sensory profiles, sudden
  jumps vs. steady noise, gentle sound signals and a sound gauge (outputs that do not need the eyes), route stops and
  one data row per stop with the columns of the paper record sheet (`js/conforto.js`, MicroPython included).
- **Teacher area** (`professor.html`): classes, students with picture passwords, printable cards and progress per
  mission. Same accounts and API as Nico (`nico-api.buinho.pt`), offline-first; IC progress is kept apart from Nico’s.
- **Perspectives:** first-person voices of fictional children who sense the world differently (autism, ADHD, dyslexia,
  blindness) accompany each mission, for neurotypical children and educators to understand other experiences.
- **Accessibility switches** (off by default): calm mode, high contrast, large text and blocks, read aloud.
- **ELECFREAKS Smart Science IoT Kit** (noise, light, PIR, BME280) and the project’s **Sensory OLED** extension
  (IC-Oled) built in — nothing to install. Behaviour-based checking, a guide character with 3-level clues,
  an on-screen micro:bit with simulated sensors, `.hex` generation in the browser (MicroPython, micro:bit V2),
  “Open project” to continue from a saved `.hex`, works offline.
- **For educators:** `educadores.html` (how to use it in the three workshop formats, how to talk about the perspectives,
  accessibility, practical notes).

Engine: **Nico / Faísca** by Buinho FabLab (same blocks, simulator, tutor and `.hex` engine). Guide characters:
**Lio the bat** (maps by sound) and **Mo the mole** (maps by touch) — artwork reserved, not under the CC licence.

### Where it lives
- **Production:** https://invisiblecartographies.eu/lab/ (inside the project website, only tested versions).
- **Testing:** https://nico.buinho.pt/ic/ (every change, first). How to publish: `docs/PUBLICAR-NO-SITE-IC.md`.

### Use
- Online: open `index.html` (`?l=sr` language, `&a=lio|mo` guide, `&m=ouvir|detetives|sentir|estacao|calma|mapa|livre` mission,
  `&a11y=calmo,contraste,grande,voz` accessibility).
- Offline: open the site once in Chrome/Edge and choose “Install”; or download the folder and double-click
  `Open IC Sensing Lab.bat` (Windows) / open `index.html` in Chrome/Edge.

### Develop
- Missions: `missoes/*.js` (texts as `T(en, sr, es, pt)`), perspectives: `missoes/perspetivas.js`,
  interface texts: `i18n/ui.js`, block texts: `i18n/blocos.js`, educators page: `i18n/educadores.js`.
- Tests (playwright-core + Chromium): `LINGUA=en node testes/testar.js` (all missions, both guides, rules, `.hex`,
  Python) and `testes/modo-livre.js`, `testes/abrir-hex.js`, `testes/blocos-novos.js`, `testes/offline.js`,
  `testes/turmas.js` (needs php CLI and the Nico API, `API_PHP=…/servidor/api/index.php`).
- Before publishing: `python3 ferramentas/gerar-sw.py` (offline list).
- Documentation: `docs/IC-SENSING-LAB.md` (this edition) and `docs/PLATAFORMA.md` (the engine).

## Licence
Code and content: **CC BY-NC-SA 4.0** — Invisible Cartographies consortium / Buinho FabLab. Third-party libraries in
`vendor/` keep their licences (Blockly — Apache 2.0; MicroPython for micro:bit and @microbit/microbit-fs — MIT;
Roboto fonts — OFL). Co-funded by the European Union. Views and opinions expressed are those of the authors only and
do not necessarily reflect those of the European Union or EACEA.
