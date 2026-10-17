/* Faísca Desafios — do programa de blocos para um ficheiro .hex.
 * Traduz os blocos para MicroPython e mete-o (main.py) dentro do MicroPython oficial
 * do micro:bit V2. Funciona sem internet: o firmware vem em vendor/micropython-v2.js
 * e a biblioteca microbit-fs em vendor/microbit-fs.js.
 *
 *   F.paraPython(ws)        → texto do main.py
 *   F.gerarHex(ws)          → Promise<string> com o .hex pronto a gravar
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};

  const IMAGENS = {
    Heart: 'HEART', SmallHeart: 'HEART_SMALL', Happy: 'HAPPY', Sad: 'SAD', Surprised: 'SURPRISED',
    Asleep: 'ASLEEP', Silly: 'SILLY', Yes: 'YES', No: 'NO', Ghost: 'GHOST',
  };
  const SONS = ['giggle', 'happy', 'hello', 'mysterious', 'sad', 'slide', 'soaring', 'spring', 'twinkle', 'yawn'];
  const PINOS = { P0: 'pin0', P1: 'pin1', P2: 'pin2' };
  const BATIDA_MS = 500;
  const ESCURO = 40;

  function valor(b, nome, defeito) {
    const v = b.getInputTargetBlock(nome);
    if (!v || !v.isEnabled()) return defeito;
    if (v.type === 'mk_num') return Number(v.getFieldValue('NUM'));
    const x = v.getFieldValue('V');
    return x == null ? defeito : x;
  }
  const inteiro = (x, d) => { const n = Math.round(Number(x)); return Number.isFinite(n) ? n : d; };

  const py = t => JSON.stringify(String(t));     // texto Python seguro (aspas e acentos escapados)
  const OPS = { '+': '+', '-': '-', '*': '*', '/': '/' };
  const CMP = { '<': '<', '>': '>', '==': '==', '<=': '<=', '>=': '>=', '!=': '!=' };

  class Gerador {
    constructor(ws) {
      this.ws = ws;
      this.somPino = 'pin0';   // passa a None se o P0 for usado como entrada (piano de fruta)
      this.vars = new Set();
      this.usa = new Set();
    }
    // expressão Python de um bloco de valor (ou o valor por defeito)
    expr(b, nome, defeito = '0') {
      const v = b.getInputTargetBlock(nome);
      if (!v || !v.isEnabled()) return defeito;
      return this.valorPy(v, defeito);
    }
    valorPy(v, defeito = '0') {
      const e = (n, d = '0') => this.expr(v, n, d);
      switch (v.type) {
        case 'mk_num': { const x = Number(v.getFieldValue('NUM')); return Number.isFinite(x) ? String(x) : '0'; }
        case 'mk_texto': return py(v.getFieldValue('TXT'));
        case 'mk_escuro': this.usaLuz = true; return `(display.read_light_level() < ${ESCURO})`;
        case 'mk_botao_premido': return v.getFieldValue('B') === 'B' ? 'button_b.is_pressed()' : 'button_a.is_pressed()';
        case 'mk_luz': this.usaLuz = true; return 'display.read_light_level()';
        case 'mk_som_nivel': return 'microphone.sound_level()';
        case 'mk_temperatura': return 'temperature()';
        case 'mk_tempo': return 'running_time()';
        case 'mk_ler_digital': return `${PINOS[v.getFieldValue('P')] || 'pin0'}.read_digital()`;
        case 'mk_ler_analogico': return `${PINOS[v.getFieldValue('P')] || 'pin1'}.read_analog()`;
        case 'mk_var': { const k = v.getFieldValue('VAR'); this.vars.add(k); return k; }
        case 'mk_aleatorio': this.usa.add('random'); return `random.randint(min(int(${e('A')}), int(${e('B')})), max(int(${e('A')}), int(${e('B')})))`;
        case 'mk_resto': return `(${e('A')}) % ((${e('B', '1')}) or 1)`;
        case 'mk_conta': {
          const op = OPS[v.getFieldValue('OP')] || '+';
          return op === '/' ? `divide(${e('A')}, ${e('B', '1')})` : `(${e('A')} ${op} ${e('B')})`;
        }
        case 'mk_comparar': return `(${e('A')} ${CMP[v.getFieldValue('OP')] || '=='} ${e('B')})`;
      }
      const x = v.getFieldValue('V');
      return x == null ? defeito : (isNaN(Number(x)) ? py(x) : String(x));
    }
    condicao(b) { return this.expr(b, 'C', 'False'); }
    bloco(b, ind) {
      const p = '    '.repeat(ind);
      switch (b.type) {
        case 'mk_icone': return [p + `display.show(Image.${IMAGENS[b.getFieldValue('I')] || 'HAPPY'})`];
        case 'mk_limpar': return [p + 'display.clear()'];
        case 'mk_pausa': return [p + `sleep(max(0, int(${this.expr(b, 'MS', '100')})))`];
        case 'mk_repetir':
          return [p + `for _ in range(max(0, min(100, int(${this.expr(b, 'N', '0')})))):`, ...this.corpo(b.getInputTargetBlock('DO'), ind + 1)];
        case 'mk_se':
          return [p + `if ${this.condicao(b)}:`, ...this.corpo(b.getInputTargetBlock('SIM'), ind + 1),
            p + 'else:', ...this.corpo(b.getInputTargetBlock('NAO'), ind + 1)];
        case 'mk_som': {
          const s = String(valor(b, 'S', 'giggle')).toLowerCase();
          return [p + `audio.play(Sound.${(SONS.includes(s) ? s : 'giggle').toUpperCase()}, pin=${this.somPino})`];
        }
        case 'mk_tom': {
          const ms = Math.max(1, Math.round(Number(valor(b, 'BAT', 1)) * BATIDA_MS) || BATIDA_MS);
          return [p + `music.pitch(max(0, int(${this.expr(b, 'F', '262')})), ${ms}, pin=${this.somPino})`];
        }
        case 'mk_digital': {
          const pino = PINOS[valor(b, 'P', 'P2')] || 'pin2';
          return [p + `${pino}.write_digital(1 if ${this.expr(b, 'V', '0')} else 0)`];
        }
        case 'mk_se_entao':
          return [p + `if ${this.condicao(b)}:`, ...this.corpo(b.getInputTargetBlock('SIM'), ind + 1)];
        case 'mk_mostrar_numero': return [p + `mostrar_numero(${this.expr(b, 'N', '0')})`];
        case 'mk_mostrar_texto': return [p + `display.scroll(str(${this.expr(b, 'T', '""')}))`];
        case 'mk_acender': return [p + `acender(${this.expr(b, 'X')}, ${this.expr(b, 'Y')}, 9)`];
        case 'mk_apagar_led': return [p + `acender(${this.expr(b, 'X')}, ${this.expr(b, 'Y')}, 0)`];
        case 'mk_grafico': return [p + `grafico(${this.expr(b, 'V')}, ${this.expr(b, 'MAX', '255')})`];
        case 'mk_var_definir': { const k = b.getFieldValue('VAR'); this.vars.add(k); return [p + `${k} = ${this.expr(b, 'V')}`]; }
        case 'mk_var_mudar': { const k = b.getFieldValue('VAR'); this.vars.add(k); return [p + `${k} = ${k} + ${this.expr(b, 'V', '1')}`]; }
        case 'mk_servo': {
          const pino = PINOS[b.getFieldValue('P')] || 'pin0';
          this.usa.add('servo');
          return [p + `servo(${pino}, ${this.expr(b, 'A', '90')})`];
        }
        case 'mk_registar': this.usa.add('log'); return [p + `log.add({str(${this.expr(b, 'NOME', '"valor"')}): ${this.expr(b, 'V')}})`];
      }
      return [];
    }
    corpo(b, ind) {
      const out = [];
      for (; b; b = b.getNextBlock()) if (b.isEnabled()) out.push(...this.bloco(b, ind));
      return out.length ? out : ['    '.repeat(ind) + 'pass'];
    }
    gerar() {
      const ev = { agitar: [], logo: [], A: [], B: [], AB: [], P0: [], P1: [], sempre: [], inicio: [], somalto: [] };
      const gestos = {};
      for (const top of this.ws.getTopBlocks(true)) {
        if (!top.isEnabled()) continue;
        const corpo = top.getInputTargetBlock('DO');
        switch (top.type) {
          case 'mk_agitar': ev.agitar.push(corpo); break;
          case 'mk_logo': ev.logo.push(corpo); break;
          case 'mk_botao': ev[top.getFieldValue('B')]?.push(corpo); break;
          case 'mk_pino_tocado': ev[top.getFieldValue('P')]?.push(corpo); break;
          case 'mk_sempre': ev.sempre.push(corpo); break;
          case 'mk_iniciar': ev.inicio.push(corpo); break;
          case 'mk_som_alto': ev.somalto.push(corpo); break;
          case 'mk_gesto': { const g = top.getFieldValue('G'); const k = 'g_' + g.replace(' ', '_'); (ev[k] = ev[k] || []).push(corpo); gestos[k] = g; break; }
        }
      }
      if (ev.P0.length) this.somPino = 'None';  // o som não pode sair pelo pino que estamos a ler

      // as funções primeiro (para saber que variáveis e módulos se usam), o cabeçalho depois
      const F_ = [];
      const funcoes = [];
      for (const [k, lista] of Object.entries(ev)) {
        lista.forEach((corpo, i) => {
          const nome = `quando_${k.toLowerCase().replace(/[^a-z0-9_]/g, '_')}_${i + 1}`;
          funcoes.push([k, nome]);
          const c = this.corpo(corpo, 1);
          F_.push([nome, c]);
        });
      }
      const globais = [...this.vars];
      const L = ['# Feito no Nico (nico.buinho.pt) — Buinho FabLab', 'from microbit import *', 'import music'];
      if (this.usa.has('random')) L.push('import random');
      if (this.usa.has('log')) L.push('import log');
      L.push('',
        'def mostrar_numero(n):',
        '    if isinstance(n, float) and n == int(n):',
        '        n = int(n)',
        '    if isinstance(n, float):',
        '        n = round(n, 2)',
        '    if isinstance(n, int) and 0 <= n <= 9:',
        '        display.show(n)',
        '    else:',
        '        display.scroll(str(n))',
        '',
        'def divide(a, b):',
        '    return a / b if b else 0',
        '',
        'def acender(x, y, v):',
        '    x = int(x)',
        '    y = int(y)',
        '    if 0 <= x <= 4 and 0 <= y <= 4:',
        '        display.set_pixel(x, y, v)',
        '',
        'def grafico(v, m):',
        '    n = max(0, min(25, round(25 * v / (m or 1))))',
        '    for i in range(25):',
        '        display.set_pixel(i % 5, 4 - i // 5, 9 if i < n else 0)',
        '');
      if (this.usa.has('servo')) L.push(
        'def servo(p, a):',
        '    p.set_analog_period(20)',
        '    p.write_analog(int(26 + max(0, min(180, a)) * 102 / 180))',
        '');
      for (const k of globais) L.push(`${k} = 0`);
      if (globais.length) L.push('');
      for (const [nome, c] of F_) {
        L.push(`def ${nome}():`);
        if (globais.length) L.push('    global ' + globais.join(', '));
        L.push(...c, '');
      }
      const chamar = (k, ind) => funcoes.filter(f => f[0] === k).map(f => '    '.repeat(ind) + f[1] + '()');
      const tem = k => ev[k].length > 0;

      if (this.usaLuz) L.push('display.read_light_level()  # o primeiro valor vem sempre a 0');
      L.push(...chamar('inicio', 0));
      L.push('a_antes = b_antes = ab_ativo = False',
        'logo_antes = p0_antes = p1_antes = False', '', 'while True:');
      if (tem('agitar')) L.push("    if accelerometer.was_gesture('shake'):", ...chamar('agitar', 2));
      for (const [k, g] of Object.entries(gestos)) L.push(`    if accelerometer.was_gesture(${py(g)}):`, ...chamar(k, 2));
      if (tem('somalto')) L.push('    if microphone.was_event(SoundEvent.LOUD):', ...chamar('somalto', 2));
      if (tem('logo')) L.push('    t = pin_logo.is_touched()', '    if t and not logo_antes:', ...chamar('logo', 2), '    logo_antes = t');
      if (tem('A') || tem('B') || tem('AB')) {
        // como no MakeCode: A e B contam ao largar; A+B conta quando os dois estão carregados
        L.push('    a = button_a.is_pressed()', '    b = button_b.is_pressed()',
          '    if a and b and not ab_ativo:', '        ab_ativo = True', ...(tem('AB') ? chamar('AB', 2) : []),
          '    if ab_ativo:', '        if not a and not b:', '            ab_ativo = False',
          '    else:',
          '        if a_antes and not a:', ...(tem('A') ? chamar('A', 3) : ['            pass']),
          '        if b_antes and not b:', ...(tem('B') ? chamar('B', 3) : ['            pass']),
          '    a_antes = a', '    b_antes = b');
      }
      for (const [k, pino, antes] of [['P0', 'pin0', 'p0_antes'], ['P1', 'pin1', 'p1_antes']]) {
        if (tem(k)) L.push(`    t = ${pino}.is_touched()`, `    if t and not ${antes}:`, ...chamar(k, 2), `    ${antes} = t`);
      }
      L.push(...chamar('sempre', 1), '    sleep(20)', '');
      return L.join('\n');
    }
  }

  F.paraPython = ws => new Gerador(ws).gerar();

  // ------------------------------------------------------------- firmware
  function carregarScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = () => rej(new Error('Não encontrei ' + src));
      document.head.appendChild(s);
    });
  }
  let pronto = null;
  function carregar() {
    if (!pronto) {
      pronto = Promise.all([
        window.MicrobitFs ? 0 : carregarScript('vendor/microbit-fs.js'),
        window.FAISCA_MICROPYTHON ? 0 : carregarScript('vendor/micropython-v2.js'),
      ]).catch(e => { pronto = null; throw e; });
    }
    return pronto;
  }

  F.gerarHex = async function (ws) {
    await carregar();
    const fs = new window.MicrobitFs.MicropythonFsHex(window.FAISCA_MICROPYTHON);
    fs.write('main.py', F.paraPython(ws));
    return fs.getIntelHex();
  };
  F.prepararHex = carregar;
})();
