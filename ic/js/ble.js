/* Faísca Desafios — ligação ao micro:bit verdadeiro por Bluetooth (Web Bluetooth).
 *
 * Fala com o programa companheiro (repo microbit-desafios) pelo serviço UART.
 * Os papéis das duas características UART descobrem-se pelas propriedades
 * (escrita vs. indicação), para não depender da ordem 6E400002/6E400003.
 *
 * Faísca → micro:bit:  I<ícone>  X  S<som>  N<freq>:<ms>  D<0|1|2><0|1>
 * micro:bit → Faísca:  G (agitou)  O (logótipo)  A  B  AB  P0  P1  L<luz 0-255>
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const UART = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  const C02 = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
  const C03 = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

  class MicrobitBLE {
    constructor(onInput, onEstado) {
      this.onInput = onInput;
      this.onEstado = onEstado;
      this.ligado = false;
      this.luz = 255;
      this.fila = Promise.resolve();
      this.buffer = '';
    }
    static disponivel() { return !!(navigator.bluetooth && navigator.bluetooth.requestDevice); }

    async ligar() {
      this.onEstado('a ligar');
      this.dev = await navigator.bluetooth.requestDevice({ filters: [{ namePrefix: 'BBC micro:bit' }], optionalServices: [UART] });
      this.dev.addEventListener('gattserverdisconnected', () => { this.ligado = false; this.onEstado('desligado'); });
      const srv = await this.dev.gatt.connect();
      const uart = await srv.getPrimaryService(UART);
      const cs = [await uart.getCharacteristic(C02), await uart.getCharacteristic(C03)];
      this.escrita = cs.find(c => c.properties.write || c.properties.writeWithoutResponse);
      const leitura = cs.find(c => c !== this.escrita && (c.properties.indicate || c.properties.notify));
      if (!this.escrita || !leitura) throw new Error('Este micro:bit não tem o programa da Faísca.');
      await leitura.startNotifications();
      leitura.addEventListener('characteristicvaluechanged', e => this.receber(new TextDecoder().decode(e.target.value)));
      this.ligado = true;
      this.onEstado('ligado', this.dev.name);
    }
    desligar() {
      if (this.dev && this.dev.gatt.connected) this.dev.gatt.disconnect();
      this.ligado = false;
      this.onEstado('desligado');
    }
    receber(txt) {
      this.buffer += txt;
      let i;
      while ((i = this.buffer.search(/[\r\n]/)) >= 0) {
        const linha = this.buffer.slice(0, i).trim();
        this.buffer = this.buffer.slice(i + 1);
        if (!linha) continue;
        if (linha[0] === 'L') { this.luz = parseInt(linha.slice(1), 10) || 0; continue; }
        const mapa = { G: 'agitar', O: 'logo', A: 'botao:A', B: 'botao:B', AB: 'botao:AB', P0: 'pino:P0', P1: 'pino:P1' };
        if (mapa[linha]) this.onInput(mapa[linha], 'microbit');
      }
    }
    enviar(cmd) {
      if (!this.ligado) return;
      // uma escrita de cada vez; o BLE não aceita escritas em paralelo
      this.fila = this.fila.then(() => this.escrita.writeValue(new TextEncoder().encode(cmd + '\n'))).catch(e => console.warn('BLE', e));
    }
    // ---- interface de saída usada pelo motor
    icone(nome) { this.enviar('I' + nome); }
    limpar() { this.enviar('X'); }
    tocarSom(nome) { this.enviar('S' + nome); }
    tom(f, ms) { this.enviar('N' + Math.round(f) + ':' + ms); }
    digital(p, v) { this.enviar('D' + p.slice(1) + v); }
    estaEscuro() { return this.luz < 40; }
  }

  F.MicrobitBLE = MicrobitBLE;
})();
