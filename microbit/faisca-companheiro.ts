/**
 * Faísca Desafios — programa companheiro do micro:bit V2
 * Grava-se UMA vez em cada micro:bit. Depois a Faísca fala com ele por Bluetooth.
 *
 * Faísca → micro:bit:  I<ícone>   X (limpar)   S<som>   N<freq>:<ms>   D<pino 0|1|2><0|1>
 *                      W<0|1> (enviar ou não o nível de luz)
 * micro:bit → Faísca:  G (agitou)  O (logótipo)  A  B  AB  P0  P1   L<luz 0-255> (de 1 em 1 s, se W1)
 *
 * Ligações para os desafios: crocodilo no P1 (piano de fruta) e GND;
 * LED com a perna comprida no P2 e a curta no GND.
 */
let ligado = false
let luzAtiva = false   // a Faísca liga-a (W1) só quando precisa: medir a luz faz piscar o ecrã

function enviar(s: string) {
    if (ligado) bluetooth.uartWriteLine(s)
}

function icone(nome: string) {
    let i = IconNames.Happy
    if (nome == "Heart") i = IconNames.Heart
    else if (nome == "SmallHeart") i = IconNames.SmallHeart
    else if (nome == "Happy") i = IconNames.Happy
    else if (nome == "Sad") i = IconNames.Sad
    else if (nome == "Surprised") i = IconNames.Surprised
    else if (nome == "Asleep") i = IconNames.Asleep
    else if (nome == "Silly") i = IconNames.Silly
    else if (nome == "Yes") i = IconNames.Yes
    else if (nome == "No") i = IconNames.No
    else if (nome == "Ghost") i = IconNames.Ghost
    basic.showIcon(i, 0)
}

function som(nome: string) {
    let s = soundExpression.giggle
    if (nome == "happy") s = soundExpression.happy
    else if (nome == "hello") s = soundExpression.hello
    else if (nome == "mysterious") s = soundExpression.mysterious
    else if (nome == "sad") s = soundExpression.sad
    else if (nome == "slide") s = soundExpression.slide
    else if (nome == "soaring") s = soundExpression.soaring
    else if (nome == "spring") s = soundExpression.spring
    else if (nome == "twinkle") s = soundExpression.twinkle
    else if (nome == "yawn") s = soundExpression.yawn
    music.play(music.builtinPlayableSoundEffect(s), music.PlaybackMode.InBackground)
}

function pino(c: string): DigitalPin {
    if (c == "0") return DigitalPin.P0
    if (c == "1") return DigitalPin.P1
    return DigitalPin.P2
}

bluetooth.startUartService()
basic.showIcon(IconNames.SmallDiamond)

bluetooth.onBluetoothConnected(function () {
    ligado = true
    basic.showIcon(IconNames.Yes)
    basic.pause(400)
    basic.clearScreen()
})
bluetooth.onBluetoothDisconnected(function () {
    ligado = false
    luzAtiva = false
    basic.showIcon(IconNames.SmallDiamond)
})

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let cmd = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    let k = cmd.charAt(0)
    let resto = cmd.substr(1, cmd.length - 1)
    if (k == "I") {
        icone(resto)
    } else if (k == "X") {
        basic.clearScreen()
    } else if (k == "S") {
        som(resto)
    } else if (k == "N") {
        let p = resto.split(":")
        music.play(music.tonePlayable(parseInt(p[0]), parseInt(p[1])), music.PlaybackMode.InBackground)
    } else if (k == "W") {
        luzAtiva = resto == "1"
    } else if (k == "D") {
        pins.digitalWritePin(pino(resto.charAt(0)), parseInt(resto.charAt(1)))
    }
})

input.onGesture(Gesture.Shake, function () { enviar("G") })
input.onLogoEvent(TouchButtonEvent.Pressed, function () { enviar("O") })
input.onButtonPressed(Button.A, function () { enviar("A") })
input.onButtonPressed(Button.B, function () { enviar("B") })
input.onButtonPressed(Button.AB, function () { enviar("AB") })
input.onPinPressed(TouchPin.P0, function () { enviar("P0") })
input.onPinPressed(TouchPin.P1, function () { enviar("P1") })

loops.everyInterval(1000, function () {
    if (luzAtiva) enviar("L" + input.lightLevel())
})
