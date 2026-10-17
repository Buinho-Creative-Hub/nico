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
  // Smart Science IoT Kit: pinos que os blocos do kit podem usar
  const PINOS_KIT = { P0: 'pin0', P1: 'pin1', P2: 'pin2', P8: 'pin8', P12: 'pin12', P13: 'pin13', P14: 'pin14', P15: 'pin15', P16: 'pin16' };
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
        case 'mk_kit_ruido': this.usa.add('kit_ruido'); return `kit_ruido(${PINOS_KIT[v.getFieldValue('P')] || 'pin1'})`;
        case 'mk_kit_luz': this.usa.add('kit_luz'); return `kit_luz(${PINOS_KIT[v.getFieldValue('P')] || 'pin2'})`;
        case 'mk_kit_pir': return `(${PINOS_KIT[v.getFieldValue('P')] || 'pin13'}.read_digital() == 1)`;
        case 'so_pir': return `(${PINOS_KIT[v.getFieldValue('P')] || 'pin13'}.read_digital() == 1)`;
        case 'so_db': this.usa.add('soled'); return `so_db(${e('V')})`;
        case 'so_media': this.usa.add('soled'); return `so_media(${e('V')}, ${e('S', '5')}, ${e('C', '1')})`;
        case 'so_nivel': this.usa.add('soled'); return 'so_nivel()';
        case 'so_movimentos': this.usa.add('soled'); return 'len(_smoves)';
        case 'mk_kit_bme': this.usa.add('bme'); return `bme(${({ temp: 0, hum: 1, pres: 2 })[v.getFieldValue('Q')] || 0})`;
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
        case 'mk_oled_iniciar': this.usa.add('oled'); return [p + 'oled_iniciar()'];
        case 'mk_oled_limpar': this.usa.add('oled'); return [p + 'oled_limpar()'];
        case 'mk_oled_texto': this.usa.add('oled'); return [p + `oled_texto(${this.expr(b, 'T', '""')})`];
        case 'mk_oled_numero': this.usa.add('oled'); return [p + `oled_texto(numero_texto(${this.expr(b, 'N', '0')}))`];
        case 'mk_oled_barra': this.usa.add('oled'); return [p + `oled_barra(${this.expr(b, 'V', '0')})`];
        case 'so_barra': this.usa.add('soled'); return [p + `so_barra(${this.expr(b, 'V')}, ${this.expr(b, 'MIN', '30')}, ${this.expr(b, 'MAX', '90')}, str(${this.expr(b, 'ROT', '"SOUND"')}), str(${this.expr(b, 'UN', '"dB"')}))`];
        case 'so_grande': this.usa.add('soled'); return [p + `so_grande(${this.expr(b, 'V')}, str(${this.expr(b, 'ROT', '"SOUND"')}), str(${this.expr(b, 'UN', '""')}))`];
        case 'so_grafico': this.usa.add('soled'); return [p + `so_grafico(${this.expr(b, 'V')}, ${this.expr(b, 'MIN', '30')}, ${this.expr(b, 'MAX', '90')}, ${this.expr(b, 'LO', '45')}, ${this.expr(b, 'HI', '65')}, str(${this.expr(b, 'ROT', '"SOUND"')}))`];
        case 'so_grafico_reset': this.usa.add('soled'); return [p + 'so_recomecar()'];
        case 'so_atividade': this.usa.add('soled'); return [p + `so_atividade(${this.expr(b, 'MOV', 'False')}, ${this.expr(b, 'S', '10')}, str(${this.expr(b, 'ROT', '"ACTIVITY"')}))`];
        case 'so_texto': this.usa.add('soled'); return [p + `so_texto(${this.expr(b, 'T', '""')}, ${this.expr(b, 'L', '0')})`];
        case 'so_limpar': this.usa.add('soled'); return [p + 'so_limpar()'];
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
      if (this.usa.has('kit_ruido')) L.push(
        '# Smart Science IoT Kit — ruído em dB (mesma conta que a extensão do MakeCode)',
        'def _map(v, a, b, c, d):',
        '    return (v - a) * (d - c) / (b - a) + c',
        '',
        'def kit_ruido(p):',
        '    n = 600',
        '    m = 0',
        '    for _ in range(n):',
        '        m += p.read_analog()',
        '    m = m / n',
        '    h = l = sh = sl = 0',
        '    for _ in range(n):',
        '        v = p.read_analog()',
        '        if v >= m:',
        '            h += 1',
        '            sh += v',
        '        else:',
        '            l += 1',
        '            sl += v',
        '    sh = sh / h if h else m',
        '    sl = sl / l if l else m',
        '    x = sh - sl',
        '    for lim, a, b, c, d in ((4, 0, 4, 30, 50), (8, 4, 8, 50, 55), (14, 9, 14, 55, 60), (32, 15, 32, 60, 70),',
        '                            (60, 33, 60, 70, 75), (100, 61, 100, 75, 80), (150, 101, 150, 80, 85), (231, 151, 231, 85, 90)):',
        '        if x <= lim:',
        '            return round(_map(x, a, b, c, d))',
        '    return round(_map(x, 231, 1023, 90, 120))',
        '');
      if (this.usa.has('kit_luz')) L.push(
        'def kit_luz(p):',
        '    return round(p.read_analog() * 100 / 1023)',
        '');
      if (this.usa.has('bme')) L.push(
        '# Smart Science IoT Kit — sensor BME280 no I2C (endereço 0x76 ou 0x77), contas da folha de dados da Bosch',
        '_bme = None',
        '',
        'def _ler(a, r, n):',
        '    i2c.write(a, bytes([r]))',
        '    return i2c.read(a, n)',
        '',
        'def _s16(v):',
        '    return v - 65536 if v > 32767 else v',
        '',
        'def _s8(v):',
        '    return v - 256 if v > 127 else v',
        '',
        'def bme_iniciar():',
        '    global _bme',
        '    for a in (0x76, 0x77):',
        '        try:',
        '            if _ler(a, 0xD0, 1)[0] == 0x60:',
        '                break',
        '        except OSError:',
        '            pass',
        '    else:',
        '        return False',
        '    c = _ler(a, 0x88, 24)',
        '    t = [c[0] | c[1] << 8, _s16(c[2] | c[3] << 8), _s16(c[4] | c[5] << 8)]',
        '    pr = [c[6] | c[7] << 8] + [_s16(c[i] | c[i + 1] << 8) for i in range(8, 24, 2)]',
        '    e = _ler(a, 0xE1, 7)',
        '    hu = [_ler(a, 0xA1, 1)[0], _s16(e[0] | e[1] << 8), e[2], (_s8(e[3]) << 4) | (e[4] & 15), (_s8(e[5]) << 4) | (e[4] >> 4), _s8(e[6])]',
        '    i2c.write(a, bytes([0xF2, 0x01]))',
        '    i2c.write(a, bytes([0xF4, 0x27]))',
        '    i2c.write(a, bytes([0xF5, 0xA0]))',
        '    _bme = (a, t, pr, hu)',
        '    sleep(50)',
        '    return True',
        '',
        'def bme(q):',
        '    if _bme is None and not bme_iniciar():',
        '        return 0',
        '    a, t, pr, hu = _bme',
        '    d = _ler(a, 0xF7, 8)',
        '    ap = (d[0] << 12) | (d[1] << 4) | (d[2] >> 4)',
        '    at = (d[3] << 12) | (d[4] << 4) | (d[5] >> 4)',
        '    ah = (d[6] << 8) | d[7]',
        '    tf = (at / 16384 - t[0] / 1024) * t[1] + ((at / 131072 - t[0] / 8192) ** 2) * t[2]',
        '    if q == 0:',
        '        return round(tf / 5120)',
        '    if q == 1:',
        '        h = tf - 76800',
        '        h = (ah - (hu[3] * 64 + hu[4] / 16384 * h)) * (hu[1] / 65536 * (1 + hu[5] / 67108864 * h * (1 + hu[2] / 67108864 * h)))',
        '        h = h * (1 - hu[0] * h / 524288)',
        '        return round(max(0, min(100, h)))',
        '    v1 = tf / 2 - 64000',
        '    v2 = v1 * v1 * pr[5] / 32768 + v1 * pr[4] * 2',
        '    v2 = v2 / 4 + pr[3] * 65536',
        '    v1 = (pr[2] * v1 * v1 / 524288 + pr[1] * v1) / 524288',
        '    v1 = (1 + v1 / 32768) * pr[0]',
        '    if v1 == 0:',
        '        return 0',
        '    x = (1048576 - ap - v2 / 4096) * 6250 / v1',
        '    x = x + (pr[8] * x * x / 2147483648 + x * pr[7] / 32768 + pr[6]) / 16',
        '    return round(x / 100)',
        '');
      if (this.usa.has('oled')) {
        const letra = F.LETRA_OLED.match(/../g).map(h => '\\x' + h).join('');
        L.push(
          '# Smart Science IoT Kit — ecrã OLED SSD1306 (I2C 0x3C), como a extensão OLED do MakeCode: 21 letras × 8 linhas',
          `_LETRA = b'${letra}'`,
          '_ox = 0',
          '_oy = 0',
          '_ob = -1',
          '',
          'def _oc(*c):',
          '    for x in c:',
          '        i2c.write(0x3C, bytes([0, x]))',
          '',
          'def _olinha(y):',
          '    _oc(0x21, 0, 127, 0x22, y, y)',
          "    i2c.write(0x3C, b'\\x40' + bytes(128))",
          '',
          'def oled_iniciar():',
          '    _oc(0xAE, 0xD5, 0x80, 0xA8, 0x3F, 0xD3, 0x00, 0x40, 0x8D, 0x14, 0x20, 0x00, 0xA1, 0xC8,',
          '        0xDA, 0x12, 0x81, 0xCF, 0xD9, 0xF1, 0xDB, 0x40, 0xA4, 0xA6, 0xAF)',
          '    oled_limpar()',
          '',
          'def oled_limpar():',
          '    global _ox, _oy, _ob',
          '    for y in range(8):',
          '        _olinha(y)',
          '    _ox = _oy = 0',
          '    _ob = -1',
          '',
          'def _onova():',
          '    global _ox, _oy',
          '    _ox = 0',
          '    _oy = (_oy + 1) % 8',
          '    _olinha(_oy)',
          '',
          'def _oescrever(s):',
          '    global _ox',
          '    for ch in str(s):',
          '        if _ox > 122:',
          '            _onova()',
          '        k = ord(ch) - 32',
          '        if k < 0 or k > 94:',
          '            k = 31',
          '        _oc(0x21, _ox, _ox + 5, 0x22, _oy, _oy)',
          "        i2c.write(0x3C, b'\\x40' + _LETRA[k * 5:k * 5 + 5] + b'\\x00')",
          '        _ox += 6',
          '',
          '_SEM = {"á": "a", "à": "a", "â": "a", "ã": "a", "é": "e", "ê": "e", "í": "i", "ó": "o", "ô": "o", "õ": "o", "ú": "u", "ç": "c",',
          '        "Á": "A", "À": "A", "Â": "A", "Ã": "A", "É": "E", "Ê": "E", "Í": "I", "Ó": "O", "Ô": "O", "Õ": "O", "Ú": "U", "Ç": "C"}',
          '',
          'def oled_texto(s):',
          "    _oescrever(''.join(_SEM.get(c, c) for c in str(s)))",
          '    _onova()',
          '',
          'def oled_barra(p):',
          '    global _ox, _oy, _ob',
          '    p = max(0, min(100, int(p)))',
          '    if _ob < 0:',
          '        for pg, v in ((3, 0x60), (5, 0x06)):',
          '            _oc(0x21, 0, 127, 0x22, pg, pg)',
          "            i2c.write(0x3C, b'\\x40' + bytes([v if 12 < c < 116 else 0 for c in range(128)]))",
          '        _ox, _oy = 30, 2',
          "        _oescrever('Loading:')",
          '    _ob = p',
          '    _ox, _oy = 78, 2',
          "    _oescrever((str(p) + '% ') + ' ' * (4 - len(str(p))))",
          '    _oc(0x21, 0, 127, 0x22, 4, 4)',
          "    i2c.write(0x3C, b'\\x40' + bytes([0xFF if c in (12, 13, 115, 116) else (0x7E if 14 <= c < 14 + 101 * p // 100 else 0) for c in range(128)]))",
          '');
      }
      if (this.usa.has('soled')) {
        const letra = F.LETRA_SENSORY.match(/../g).map(h => '\\x' + h.toLowerCase()).join('');
        L.push(
          '# Sensory OLED — extensão do Buinho (github.com/Buinho-Creative-Hub/IC-Oled), traduzida para MicroPython',
          `_SL = b'${letra}'`,
          '_SA = 0x3C',
          '_fb = bytearray(1024)',
          '_sent = bytearray(1024)',
          '_sok = False',
          '_speak = -1000000',
          '_stime = 0',
          '_shist = []',
          '_savg = [[], [], []]',
          '_sen = 0',
          '_swas = False',
          '_slast = 0',
          '_smoves = []',
          '_SEM2 = {"á": "a", "à": "a", "â": "a", "ã": "a", "é": "e", "ê": "e", "í": "i", "ó": "o", "ô": "o", "õ": "o", "ú": "u", "ç": "c",',
          '         "Á": "A", "À": "A", "Â": "A", "Ã": "A", "É": "E", "Ê": "E", "Í": "I", "Ó": "O", "Ô": "O", "Õ": "O", "Ú": "U", "Ç": "C"}',
          '',
          'def _sr(v):',
          '    return int((v + 0.5) // 1)',
          '',
          'def _sbegin():',
          '    global _sok',
          '    if _sok:',
          '        return',
          '    for c in (0xAE, 0xD5, 0x80, 0xA8, 0x3F, 0xD3, 0x00, 0x40, 0x8D, 0x14, 0x20, 0x00, 0xA1, 0xC8, 0xDA, 0x12, 0x81, 0xCF, 0xD9, 0xF1, 0xDB, 0x40, 0xA4, 0xA6, 0x2E, 0xAF):',
          '        i2c.write(_SA, bytes([0, c]))',
          '    _sok = True',
          '    _sflush(True)',
          '',
          'def _sflush(tudo):',
          '    for p in range(8):',
          '        s = p * 128',
          '        if not tudo and _fb[s:s + 128] == _sent[s:s + 128]:',
          '            continue',
          '        i2c.write(_SA, bytes([0, 0x21, 0, 127, 0x22, p, p]))',
          '        for c in range(0, 128, 32):',
          "            i2c.write(_SA, b'\\x40' + bytes(_fb[s + c:s + c + 32]))",
          '        for i in range(s, s + 128):',
          '            _sent[i] = _fb[i]',
          '',
          'def _sshow():',
          '    _sbegin()',
          '    _sflush(False)',
          '',
          'def _sclear():',
          '    global _fb',
          '    _sbegin()',
          '    _fb = bytearray(1024)',
          '',
          'def _spx(x, y):',
          '    x = int(x // 1)',
          '    y = int(y // 1)',
          '    if 0 <= x < 128 and 0 <= y < 64:',
          '        _fb[(y >> 3) * 128 + x] |= 1 << (y & 7)',
          '',
          'def _svl(x, y0, y1):',
          '    if y0 > y1:',
          '        y0, y1 = y1, y0',
          '    for y in range(int(y0), int(y1) + 1):',
          '        _spx(x, y)',
          '',
          'def _shl(x0, x1, y):',
          '    for x in range(int(x0), int(x1) + 1):',
          '        _spx(x, y)',
          '',
          'def _srect(x, y, w, h):',
          '    _shl(x, x + w - 1, y)',
          '    _shl(x, x + w - 1, y + h - 1)',
          '    _svl(x, y, y + h - 1)',
          '    _svl(x + w - 1, y, y + h - 1)',
          '',
          'def _sfill(x, y, w, h):',
          '    for i in range(int(w)):',
          '        _svl(x + i, y, y + h - 1)',
          '',
          'def _stxt(s):',
          "    return ''.join(_SEM2.get(c, c) for c in str(s))",
          '',
          'def _stext(x, y, s, k=1):',
          '    s = _stxt(s)',
          '    for n in range(len(s)):',
          '        c = ord(s[n])',
          '        if c < 32 or c > 122:',
          '            c = 63',
          '        b = (c - 32) * 5',
          '        for col in range(5):',
          '            bits = _SL[b + col]',
          '            for row in range(8):',
          '                if bits & (1 << row):',
          '                    if k == 1:',
          '                        _spx(x + n * 6 + col, y + row)',
          '                    else:',
          '                        _sfill(x + (n * 6 + col) * k, y + row * k, k, k)',
          '',
          'def _sright(xr, y, s):',
          '    s = _stxt(s)',
          '    _stext(xr - len(s) * 6 + 2, y, s)',
          '',
          'def _sfmt(v):',
          '    return str(_sr(v))',
          '',
          'def _sscale(v, mn, mx, size):',
          '    if mx == mn:',
          '        return 0',
          '    f = max(0, min(1, (v - mn) / (mx - mn)))',
          '    return _sr(f * size)',
          '',
          'def so_barra(v, mn, mx, label, unit):',
          '    global _speak, _stime',
          '    now = running_time()',
          '    if _stime > 0:',
          '        _speak -= (mx - mn) * (now - _stime) / 3000',
          '    _stime = now',
          '    if v > _speak:',
          '        _speak = v',
          '    if _speak < mn:',
          '        _speak = mn',
          '    _sclear()',
          '    _stext(0, 0, label)',
          "    _sright(127, 0, _sfmt(v) + ' ' + unit)",
          '    _srect(0, 16, 128, 24)',
          '    w = _sscale(v, mn, mx, 124)',
          '    if w > 0:',
          '        _sfill(2, 18, w, 20)',
          '    px = 2 + _sscale(_speak, mn, mx, 124)',
          '    _svl(min(px, 126), 12, 43)',
          '    _svl(min(px + 1, 127), 12, 43)',
          '    _stext(0, 52, _sfmt(mn))',
          '    _sright(127, 52, _sfmt(mx))',
          "    p = 'PEAK ' + _sfmt(_speak)",
          '    _stext(_sr((128 - len(p) * 6) / 2), 52, p)',
          '    _sshow()',
          '',
          'def so_grafico(v, mn, mx, lo, hi, label):',
          '    _shist.append(v)',
          '    if len(_shist) > 128:',
          '        _shist.pop(0)',
          '    _sclear()',
          '    _stext(0, 0, label)',
          '    _sright(127, 0, _sfmt(v))',
          '    for gv in (lo, hi):',
          '        if mn < gv < mx:',
          '            gy = 63 - _sscale(gv, mn, mx, 53)',
          '            for x in range(0, 128, 4):',
          '                _spx(x, gy)',
          '    n = len(_shist)',
          '    py = -1',
          '    for i in range(n):',
          '        y = 63 - _sscale(_shist[i], mn, mx, 53)',
          '        if py < 0:',
          '            _spx(128 - n + i, y)',
          '        else:',
          '            _svl(128 - n + i, py, y)',
          '        py = y',
          '    _sshow()',
          '',
          'def so_grande(v, label, unit):',
          '    t = _sfmt(v)',
          '    k = 4 if len(t) <= 5 else (3 if len(t) <= 7 else 2)',
          '    _sclear()',
          '    label = _stxt(label)',
          '    unit = _stxt(unit)',
          '    _stext(_sr((128 - len(label) * 6) / 2), 0, label)',
          '    _stext(_sr((128 - (len(t) * 6 * k - k)) / 2), 14, t, k)',
          '    if unit:',
          '        _stext(_sr((128 - len(unit) * 6) / 2), 56, unit)',
          '    _sshow()',
          '',
          'def so_media(v, seg, canal):',
          '    c = max(1, min(3, _sr(canal))) - 1',
          '    if seg <= 0:',
          '        seg = 1',
          '    now = running_time()',
          '    lst = _savg[c]',
          '    lst.append((now, v))',
          '    while len(lst) > 1 and now - lst[0][0] > seg * 1000:',
          '        lst.pop(0)',
          '    while len(lst) > 200:',
          '        lst.pop(0)',
          '    return _sr(sum(x[1] for x in lst) / len(lst))',
          '',
          'def so_db(n):',
          '    return _sr(35 + max(0, min(255, n)) * 65 / 255)',
          '',
          'def so_nivel():',
          '    return _sr(_sen)',
          '',
          'def so_atividade(mov, seg, label):',
          '    global _sen, _swas, _slast',
          '    now = running_time()',
          '    dt = (now - _slast) / 1000 if _slast > 0 else 0',
          '    _slast = now',
          '    if seg <= 0:',
          '        seg = 1',
          '    if mov and not _swas:',
          '        _sen += 25',
          '        _smoves.append(now)',
          '    if mov:',
          '        _sen += 10 * dt',
          '    else:',
          '        _sen -= 100 * dt / seg',
          '    _sen = max(0, min(100, _sen))',
          '    _swas = mov',
          '    while _smoves and now - _smoves[0] > 60000:',
          '        _smoves.pop(0)',
          '    _sclear()',
          '    _stext(0, 0, label)',
          "    _sright(127, 0, str(len(_smoves)) + '/min')",
          '    for i in range(10):',
          '        h = 8 + i * 4',
          '        if _sen > i * 10:',
          '            _sfill(4 + i * 12, 60 - h, 9, h)',
          '        else:',
          '            _srect(4 + i * 12, 60 - h, 9, h)',
          '    _sshow()',
          '',
          'def so_recomecar():',
          '    while _shist:',
          '        _shist.pop()',
          '',
          'def so_limpar():',
          '    _sclear()',
          '    _sshow()',
          '',
          'def so_texto(s, linha):',
          '    _sbegin()',
          '    y = max(0, min(7, _sr(linha))) * 8',
          '    for x in range(128):',
          '        _fb[(y >> 3) * 128 + x] = 0',
          '    _stext(0, y, s)',
          '    _sshow()',
          '');
      }
      if (this.usa.has('oled')) L.push(
        'def numero_texto(n):',
        '    if isinstance(n, float) and n == int(n):',
        '        n = int(n)',
        '    if isinstance(n, float):',
        '        n = round(n, 2)',
        '    return str(n)',
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
