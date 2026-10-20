/* IC Sensing Lab — textos dos blocos nas quatro línguas.
 *
 * O PT é o texto original definido em js/blocks.js e js/sensory-oled.js. Aqui ficam EN, ES e SR.
 * EN = exatamente as palavras do MakeCode (makecode.microbit.org) e das extensões (ELECFREAKS IoT, IC-Oled),
 * para a passagem para o MakeCode ser natural. ES segue a tradução do MakeCode em espanhol.
 * SR (cirílico) = tradução automática do Pacheco, Out 2026 — a rever pela escola Veljko.
 *   F.traduzirBlocos(lista)  aplica a língua F.LANG às definições JSON antes do Blockly.defineBlocksWithJsonArray
 *   F.opcoes(nome)           rótulos dos menus (ícones, sons, notas, gestos, variáveis…) na língua
 */
(function () {
  'use strict';
  const F = window.Faisca;
  // [message0, message1?, message2?, message3?] por tipo; tooltip em «tip»
  const B = {
    mk_iniciar: { en: ['on start'], es: ['al iniciar'], sr: ['при покретању'],
      tip: { en: 'Runs once, when the micro:bit starts.', es: 'Se ejecuta una vez, cuando el micro:bit se enciende.', sr: 'Покреће се једном, кад се micro:bit укључи.' } },
    mk_gesto: { en: ['on %1'], es: ['al %1'], sr: ['при %1'],
      tip: { en: 'Runs when the micro:bit makes this movement.', es: 'Se ejecuta cuando el micro:bit hace este movimiento.', sr: 'Покреће се кад micro:bit направи овај покрет.' } },
    mk_som_alto: { en: ['on loud sound'], es: ['al sonido fuerte'], sr: ['при гласном звуку'],
      tip: { en: 'Runs when the microphone hears a loud noise (micro:bit V2).', es: 'Se ejecuta cuando el micrófono oye un ruido fuerte (micro:bit V2).', sr: 'Покреће се кад микрофон чује јак звук (micro:bit V2).' } },
    mk_luz: { en: ['light level'], es: ['nivel de luz'], sr: ['ниво светлости'],
      tip: { en: 'From 0 (dark) to 255 (very bright).', es: 'De 0 (oscuro) a 255 (mucha luz).', sr: 'Од 0 (мрак) до 255 (много светла).' } },
    mk_som_nivel: { en: ['sound level'], es: ['nivel de sonido'], sr: ['ниво звука'],
      tip: { en: 'From 0 (silence) to 255 (very loud). micro:bit V2.', es: 'De 0 (silencio) a 255 (mucho ruido). micro:bit V2.', sr: 'Од 0 (тишина) до 255 (веома гласно). micro:bit V2.' } },
    mk_temperatura: { en: ['temperature (°C)'], es: ['temperatura (°C)'], sr: ['температура (°C)'],
      tip: { en: 'Temperature near the micro:bit processor.', es: 'Temperatura cerca del procesador del micro:bit.', sr: 'Температура близу процесора micro:bit-а.' } },
    mk_tempo: { en: ['running time (ms)'], es: ['tiempo de ejecución (ms)'], sr: ['време рада (ms)'],
      tip: { en: 'Milliseconds since the program started.', es: 'Milisegundos desde que empezó el programa.', sr: 'Милисекунде од почетка програма.' } },
    mk_mostrar_numero: { en: ['show number %1'], es: ['mostrar número %1'], sr: ['прикажи број %1'],
      tip: { en: 'Shows a number on the LED screen.', es: 'Muestra un número en la pantalla de luces.', sr: 'Приказује број на екрану од лампица.' } },
    mk_mostrar_texto: { en: ['show string %1'], es: ['mostrar cadena %1'], sr: ['прикажи текст %1'],
      tip: { en: 'Scrolls text across the LED screen.', es: 'Hace pasar un texto por la pantalla de luces.', sr: 'Текст пролази преко екрана од лампица.' } },
    mk_acender: { en: ['plot x %1 y %2'], es: ['graficar x %1 y %2'], sr: ['упали x %1 y %2'],
      tip: { en: 'Turns one LED on. x: column (0–4), y: row (0–4).', es: 'Enciende una luz. x: columna (0–4), y: fila (0–4).', sr: 'Пали једну лампицу. x: колона (0–4), y: ред (0–4).' } },
    mk_apagar_led: { en: ['unplot x %1 y %2'], es: ['desgraficar x %1 y %2'], sr: ['угаси x %1 y %2'],
      tip: { en: 'Turns one LED off.', es: 'Apaga una luz.', sr: 'Гаси једну лампицу.' } },
    mk_grafico: { en: ['plot bar graph of %1 up to %2'], es: ['graficar barras de %1 hasta %2'], sr: ['нацртај тракасти графикон од %1 до %2'],
      tip: { en: 'The bigger the value, the more LEDs light up.', es: 'Cuanto mayor el valor, más luces se encienden.', sr: 'Што је вредност већа, више лампица светли.' } },
    mk_var_definir: { en: ['set %1 to %2'], es: ['fijar %1 a %2'], sr: ['постави %1 на %2'],
      tip: { en: 'Stores a value in the variable.', es: 'Guarda un valor en la variable.', sr: 'Чува вредност у променљивој.' } },
    mk_var_mudar: { en: ['change %1 by %2'], es: ['cambiar %1 por %2'], sr: ['промени %1 за %2'],
      tip: { en: 'Adds this value to the variable (use -1 to subtract).', es: 'Suma este valor a la variable (usa -1 para restar).', sr: 'Додаје ову вредност променљивој (-1 за одузимање).' } },
    mk_var: { tip: { en: 'The value stored in the variable.', es: 'El valor guardado en la variable.', sr: 'Вредност сачувана у променљивој.' } },
    mk_conta: { tip: { en: 'Does a calculation.', es: 'Hace una operación.', sr: 'Рачуна.' } },
    mk_aleatorio: { en: ['pick random %1 to %2'], es: ['elegir al azar de %1 a %2'], sr: ['изабери насумично од %1 до %2'],
      tip: { en: 'A random whole number between the two (included).', es: 'Un número entero al azar entre los dos (incluidos).', sr: 'Насумичан цео број између ова два (укључујући их).' } },
    mk_resto: { en: ['remainder of %1 ÷ %2'], es: ['residuo de %1 ÷ %2'], sr: ['остатак од %1 ÷ %2'],
      tip: { en: 'What is left over after dividing.', es: 'Lo que sobra de la división.', sr: 'Оно што остане после дељења.' } },
    mk_comparar: { tip: { en: 'Compares two numbers.', es: 'Compara dos números.', sr: 'Пореди два броја.' } },
    mk_se_entao: { en: ['if %1 then', '%1'], es: ['si %1 entonces', '%1'], sr: ['ако %1 онда', '%1'],
      tip: { en: 'Only runs what is inside if the condition is true.', es: 'Solo hace lo de dentro si la condición es verdadera.', sr: 'Ради оно што је унутра само ако је услов тачан.' } },
    mk_ler_digital: { en: ['digital read pin %1'], es: ['lectura digital pin %1'], sr: ['дигитално читање пин %1'],
      tip: { en: '1 if the circuit is closed, 0 if it is open.', es: '1 si el circuito está cerrado, 0 si está abierto.', sr: '1 ако је коло затворено, 0 ако је отворено.' } },
    mk_ler_analogico: { en: ['analog read pin %1'], es: ['lectura analógica pin %1'], sr: ['аналогно читање пин %1'],
      tip: { en: 'From 0 to 1023: how much electricity gets through.', es: 'De 0 a 1023: cuánta electricidad pasa.', sr: 'Од 0 до 1023: колико струје пролази.' } },
    mk_servo: { en: ['servo write pin %1 to %2'], es: ['escribir servo pin %1 a %2'], sr: ['серво упис пин %1 на %2'],
      tip: { en: 'Turns the servo to this angle (0 to 180 degrees). P3, P4, P6, P7, P9 and P10 switch off the LED screen; P5 and P11 are buttons A and B.',
        es: 'Gira el servo a este ángulo (0 a 180 grados). P3, P4, P6, P7, P9 y P10 apagan la pantalla; P5 y P11 son los botones A y B.',
        sr: 'Окреће серво на овај угао (0 до 180 степени). P3, P4, P6, P7, P9 и P10 гасе екран; P5 и P11 су дугмад A и B.' } },
    mk_registar: { en: ['log data column %1 value %2'], es: ['registrar datos columna %1 valor %2'], sr: ['забележи податке колона %1 вредност %2'],
      tip: { en: 'Saves a row in the micro:bit data table (open MY_DATA.HTM). Use letters without accents for the column name.',
        es: 'Guarda una fila en la tabla de datos del micro:bit (abre MY_DATA.HTM). Usa letras sin tildes en el nombre de la columna.',
        sr: 'Чува ред у табели података micro:bit-а (отвори MY_DATA.HTM). За назив колоне користи латиничка слова без квачица.' } },
    mk_kit_ruido: { en: ['value of noise(dB) at pin %1'], es: ['valor del ruido(dB) en el pin %1'], sr: ['вредност буке (dB) на пину %1'],
      tip: { en: 'Kit noise sensor. About 40 dB in a quiet room, 60–70 dB with conversation.', es: 'Sensor de ruido del kit. Unos 40 dB en una sala tranquila, 60–70 dB con conversación.', sr: 'Сензор буке из комплета. Око 40 dB у тихој соби, 60–70 dB уз разговор.' } },
    mk_kit_luz: { en: ['value of light intensity(0~100) at pin %1'], es: ['valor de intensidad de luz(0~100) en el pin %1'], sr: ['вредност јачине светлости (0~100) на пину %1'],
      tip: { en: 'Kit light sensor: 0 = dark, 100 = very bright (relative value, not lux).', es: 'Sensor de luz del kit: 0 = oscuro, 100 = mucha luz (valor relativo, no son lux).', sr: 'Сензор светлости: 0 = мрак, 100 = много светла (релативна вредност, нису лукси).' } },
    mk_kit_pir: { en: ['PIR sensor %1 detects motion'], es: ['sensor PIR %1 detecta movimiento'], sr: ['PIR сензор %1 открива покрет'],
      tip: { en: 'True when the PIR sensor sees someone moving in front of it.', es: 'Verdadero cuando el sensor PIR ve a alguien moverse delante.', sr: 'Тачно кад PIR сензор види некога да се креће испред њега.' } },
    mk_kit_bme: { en: ['value of BME280 %1'], es: ['valor de BME280 %1'], sr: ['вредност BME280 %1'],
      tip: { en: 'BME280 sensor (I2C): air temperature, humidity or pressure.', es: 'Sensor BME280 (I2C): temperatura del aire, humedad o presión.', sr: 'BME280 сензор (I2C): температура ваздуха, влажност или притисак.' } },
    mk_oled_iniciar: { en: ['initialize OLED with width %1 height %2'], es: ['inicializar OLED con ancho %1 alto %2'], sr: ['покрени OLED ширине %1 висине %2'],
      tip: { en: 'Switches the OLED screen on. Put it in «on start».', es: 'Enciende la pantalla OLED. Ponlo en «al iniciar».', sr: 'Укључује OLED екран. Стави га у «при покретању».' } },
    mk_oled_texto: { en: ['show string %1'], es: ['mostrar cadena %1'], sr: ['OLED прикажи текст %1'],
      tip: { en: 'Writes text on the OLED screen and moves to the next line.', es: 'Escribe un texto en la pantalla OLED y cambia de línea.', sr: 'Пише текст на OLED екрану и прелази у нови ред.' } },
    mk_oled_numero: { en: ['show number %1'], es: ['mostrar número %1'], sr: ['OLED прикажи број %1'],
      tip: { en: 'Writes a number on the OLED screen and moves to the next line.', es: 'Escribe un número en la pantalla OLED y cambia de línea.', sr: 'Пише број на OLED екрану и прелази у нови ред.' } },
    mk_oled_limpar: { en: ['clear OLED display'], es: ['borrar pantalla OLED'], sr: ['обриши OLED екран'],
      tip: { en: 'Clears the OLED screen and goes back to the first line.', es: 'Borra la pantalla OLED y vuelve a la primera línea.', sr: 'Брише OLED екран и враћа се на први ред.' } },
    mk_oled_barra: { en: ['draw loading bar at %1 percent'], es: ['dibujar barra de carga al %1 por ciento'], sr: ['нацртај траку учитавања на %1 процената'],
      tip: { en: 'Draws a 0–100 % bar on the OLED screen.', es: 'Dibuja una barra de 0 a 100 % en la pantalla OLED.', sr: 'Црта траку од 0 до 100 % на OLED екрану.' } },
    mk_agitar: { en: ['on shake', '%1'], es: ['al agitar', '%1'], sr: ['при протресању', '%1'],
      tip: { en: 'Runs when you shake the micro:bit.', es: 'Se ejecuta cuando agitas el micro:bit.', sr: 'Покреће се кад протресеш micro:bit.' } },
    mk_logo: { en: ['on logo pressed', '%1'], es: ['al presionar el logo', '%1'], sr: ['при притиску на лого', '%1'],
      tip: { en: 'Runs when you touch the golden logo.', es: 'Se ejecuta cuando tocas el logo dorado.', sr: 'Покреће се кад додирнеш златни лого.' } },
    mk_botao: { en: ['on button %1 pressed', '%1'], es: ['al presionar el botón %1', '%1'], sr: ['при притиску на дугме %1', '%1'],
      tip: { en: 'Runs when you press the button.', es: 'Se ejecuta cuando pulsas el botón.', sr: 'Покреће се кад притиснеш дугме.' } },
    mk_pino_tocado: { en: ['on pin %1 pressed', '%1'], es: ['al presionar el pin %1', '%1'], sr: ['при притиску на пин %1', '%1'],
      tip: { en: 'Runs when you close the circuit between the pin and GND.', es: 'Se ejecuta cuando cierras el circuito entre el pin y GND.', sr: 'Покреће се кад затвориш коло између пина и GND.' } },
    mk_sempre: { en: ['forever', '%1'], es: ['para siempre', '%1'], sr: ['заувек', '%1'],
      tip: { en: 'Repeats non-stop.', es: 'Repite sin parar.', sr: 'Понавља без престанка.' } },
    mk_icone: { en: ['show icon %1'], es: ['mostrar ícono %1'], sr: ['прикажи иконицу %1'],
      tip: { en: 'Draws an icon on the LED screen.', es: 'Dibuja un ícono en la pantalla de luces.', sr: 'Црта иконицу на екрану од лампица.' } },
    mk_limpar: { en: ['clear screen'], es: ['borrar la pantalla'], sr: ['обриши екран'] },
    mk_pausa: { en: ['pause (ms) %1'], es: ['pausa (ms) %1'], sr: ['пауза (ms) %1'],
      tip: { en: 'Waits. 1000 ms = 1 second.', es: 'Espera. 1000 ms = 1 segundo.', sr: 'Чека. 1000 ms = 1 секунда.' } },
    mk_repetir: { en: ['repeat %1 times', 'do %1'], es: ['repetir %1 veces', 'hacer %1'], sr: ['понови %1 пута', 'ради %1'],
      tip: { en: 'Does what is inside several times.', es: 'Hace lo de dentro varias veces.', sr: 'Ради оно што је унутра више пута.' } },
    mk_enquanto: { en: ['while %1', 'do %1'], es: ['mientras %1', 'hacer %1'], sr: ['док %1', 'ради %1'],
      tip: { en: 'Repeats what is inside while the condition is true.', es: 'Repite lo de dentro mientras la condición sea verdadera.', sr: 'Понавља оно што је унутра док је услов тачан.' } },
    mk_se: { en: ['if %1 then', '%1', 'else', '%1'], es: ['si %1 entonces', '%1', 'si no', '%1'], sr: ['ако %1 онда', '%1', 'иначе', '%1'] },
    mk_escuro: { en: ['it is dark'], es: ['está oscuro'], sr: ['мрак је'],
      tip: { en: 'True when there is little light.', es: 'Verdadero cuando hay poca luz.', sr: 'Тачно кад има мало светла.' } },
    mk_pino_premido: { en: ['%1 is pressed'], es: ['%1 está presionado'], sr: ['%1 је притиснут'],
      tip: { en: 'True while you touch the pin (other hand on GND) or the logo.', es: 'Verdadero mientras tocas el pin (con la otra mano en GND) o el logo.', sr: 'Тачно док додирујеш пин (другом руком GND) или лого.' } },
    mk_botao_premido: { en: ['button %1 is pressed'], es: ['botón %1 está presionado'], sr: ['дугме %1 је притиснуто'] },
    mk_som: { en: ['play sound %1'], es: ['reproducir sonido %1'], sr: ['пусти звук %1'],
      tip: { en: 'Plays a micro:bit sound.', es: 'Reproduce un sonido del micro:bit.', sr: 'Пушта звук micro:bit-а.' } },
    mk_tom: { en: ['play tone %1 for %2 beat'], es: ['reproducir tono %1 durante %2 pulso'], sr: ['свирај тон %1 у трајању %2 такта'],
      tip: { en: 'Plays a note.', es: 'Reproduce una nota.', sr: 'Свира ноту.' } },
    mk_digital: { en: ['digital write pin %1 to %2'], es: ['escritura digital pin %1 a %2'], sr: ['дигитални упис пин %1 на %2'],
      tip: { en: '1 switches on, 0 switches off.', es: '1 enciende, 0 apaga.', sr: '1 укључује, 0 искључује.' } },
    // ---- Sensory OLED (IC-Oled) — EN igual ao main.ts da extensão
    so_barra: { en: ['intensity bar %1 from %2 to %3 label %4 unit %5'], es: ['barra de intensidad %1 de %2 a %3 etiqueta %4 unidad %5'], sr: ['трака јачине %1 од %2 до %3 ознака %4 јединица %5'],
      tip: { en: 'A bar that rises and falls with the value; the peak mark remembers the highest and falls slowly. Use it in «forever».',
        es: 'Barra que sube y baja con el valor; la marca del pico recuerda el más alto y baja despacio. Úsala en «para siempre».',
        sr: 'Трака која расте и пада са вредношћу; ознака врха памти највише и полако пада. Користи у «заувек».' } },
    so_grande: { en: ['big number %1 label %2 unit %3'], es: ['número grande %1 etiqueta %2 unidad %3'], sr: ['велики број %1 ознака %2 јединица %3'],
      tip: { en: 'One value in big digits, readable from a distance.', es: 'Un valor en números grandes, para leer de lejos.', sr: 'Вредност великим цифрама, да се види из даљине.' } },
    so_grafico: { en: ['scrolling graph %1 from %2 to %3 lines at %4 and %5 label %6'], es: ['gráfico desplazable %1 de %2 a %3 líneas en %4 y %5 etiqueta %6'], sr: ['покретни графикон %1 од %2 до %3 линије на %4 и %5 ознака %6'],
      tip: { en: 'The latest readings as a line moving from right to left.', es: 'Las últimas lecturas en una línea que pasa de derecha a izquierda.', sr: 'Последња мерења као линија која иде здесна налево.' } },
    so_grafico_reset: { en: ['reset scrolling graph'], es: ['reiniciar gráfico desplazable'], sr: ['поново покрени графикон'],
      tip: { en: 'Clears the graph history.', es: 'Borra la historia del gráfico.', sr: 'Брише историју графикона.' } },
    so_atividade: { en: ['activity meter %1 empty in %2 s label %3'], es: ['medidor de actividad %1 se vacía en %2 s etiqueta %3'], sr: ['мерач активности %1 празни се за %2 s ознака %3'],
      tip: { en: 'Each movement fills the meter; when nothing moves, it empties.', es: 'Cada movimiento llena el medidor; si nada se mueve, se vacía.', sr: 'Сваки покрет пуни мерач; кад се ништа не креће, празни се.' } },
    so_texto: { en: ['show text %1 on line %2'], es: ['mostrar texto %1 en la línea %2'], sr: ['прикажи текст %1 у реду %2'],
      tip: { en: 'Short text (up to 21 letters) on one of 8 lines (0 = top).', es: 'Texto corto (hasta 21 letras) en una de 8 líneas (0 = arriba).', sr: 'Кратак текст (до 21 слова) у једном од 8 редова (0 = горе).' } },
    so_limpar: { en: ['clear OLED'], es: ['borrar OLED'], sr: ['обриши OLED'], tip: { en: 'Clears the screen.', es: 'Borra la pantalla.', sr: 'Брише екран.' } },
    so_escrever: { en: ['write %1 at x %2 y %3 size %4'], es: ['escribir %1 en x %2 y %3 tamaño %4'], sr: ['напиши %1 на x %2 y %3 величина %4'],
      tip: { en: 'Writes text or a number anywhere (x 0–127, y 0–63), small (1) to very big (4). Does not erase: use «clear OLED» first.',
        es: 'Escribe un texto o número donde quieras (x 0–127, y 0–63), de pequeño (1) a muy grande (4). No borra: usa antes «borrar OLED».',
        sr: 'Пише текст или број било где (x 0–127, y 0–63), од малог (1) до веома великог (4). Не брише: прво «обриши OLED».' } },
    so_animacao: { en: ['show animation %1 %2 times'], es: ['mostrar animación %1 %2 veces'], sr: ['прикажи анимацију %1 %2 пута'],
      tip: { en: 'Shows an animation on the OLED. The rest of the program waits.', es: 'Muestra una animación en la OLED. El resto del programa espera.', sr: 'Приказује анимацију на OLED екрану. Остатак програма чека.' } },
    so_media: { en: ['average of %1 over %2 s channel %3'], es: ['promedio de %1 en %2 s canal %3'], sr: ['просек од %1 за %2 s канал %3'],
      tip: { en: 'Average of the last seconds: steadier than a single reading. One channel (1, 2 or 3) per sensor.', es: 'Promedio de los últimos segundos: más estable que una sola lectura. Un canal (1, 2 o 3) por sensor.', sr: 'Просек последњих секунди: стабилније од једног мерења. Један канал (1, 2 или 3) по сензору.' } },
    so_db: { en: ['dB from sound level %1'], es: ['dB a partir del nivel de sonido %1'], sr: ['dB из нивоа звука %1'],
      tip: { en: 'Turns the micro:bit sound level (0–255) into approximate dB (35–100).', es: 'Convierte el nivel de sonido (0–255) en dB aproximados (35–100).', sr: 'Претвара ниво звука (0–255) у приближне dB (35–100).' } },
    so_pir: { en: ['PIR at %1 detects motion'], es: ['PIR en %1 detecta movimiento'], sr: ['PIR на %1 открива покрет'],
      tip: { en: 'True while the PIR sees movement.', es: 'Verdadero mientras el PIR ve movimiento.', sr: 'Тачно док PIR види покрет.' } },
    so_nivel: { en: ['activity level'], es: ['nivel de actividad'], sr: ['ниво активности'],
      tip: { en: 'From 0 to 100, the same as the activity meter.', es: 'De 0 a 100, igual que el medidor de actividad.', sr: 'Од 0 до 100, исто као мерач активности.' } },
    so_movimentos: { en: ['movements per minute'], es: ['movimientos por minuto'], sr: ['покрета у минути'],
      tip: { en: 'How many movements started in the last minute.', es: 'Cuántos movimientos empezaron en el último minuto.', sr: 'Колико покрета је почело у последњем минуту.' } },
  };

  // rótulos dos menus, pelo valor
  const O = {
    icones: {
      Heart: { en: 'heart', es: 'corazón', sr: 'срце' }, SmallHeart: { en: 'small heart', es: 'corazón pequeño', sr: 'мало срце' },
      Happy: { en: 'happy', es: 'feliz', sr: 'срећан' }, Sad: { en: 'sad', es: 'triste', sr: 'тужан' },
      Surprised: { en: 'surprised', es: 'sorprendido', sr: 'изненађен' }, Asleep: { en: 'asleep', es: 'dormido', sr: 'спава' },
      Silly: { en: 'silly', es: 'tonto', sr: 'шаљив' }, Yes: { en: 'yes', es: 'sí', sr: 'да' }, No: { en: 'no', es: 'no', sr: 'не' },
      Ghost: { en: 'ghost', es: 'fantasma', sr: 'дух' },
    },
    sons: {
      giggle: { en: 'giggle', es: 'risita', sr: 'кикот' }, happy: { en: 'happy', es: 'feliz', sr: 'срећа' }, hello: { en: 'hello', es: 'hola', sr: 'здраво' },
      mysterious: { en: 'mysterious', es: 'misterioso', sr: 'мистериозно' }, sad: { en: 'sad', es: 'triste', sr: 'тужно' },
      slide: { en: 'slide', es: 'deslizar', sr: 'клизање' }, soaring: { en: 'soaring', es: 'volar', sr: 'летење' }, spring: { en: 'spring', es: 'resorte', sr: 'опруга' },
      twinkle: { en: 'twinkle', es: 'destello', sr: 'светлуцање' }, yawn: { en: 'yawn', es: 'bostezo', sr: 'зевање' },
    },
    notas: {
      262: { en: 'Middle C', es: 'Do', sr: 'До' }, 294: { en: 'Middle D', es: 'Re', sr: 'Ре' }, 330: { en: 'Middle E', es: 'Mi', sr: 'Ми' },
      349: { en: 'Middle F', es: 'Fa', sr: 'Фа' }, 392: { en: 'Middle G', es: 'Sol', sr: 'Сол' }, 440: { en: 'Middle A', es: 'La', sr: 'Ла' },
      494: { en: 'Middle B', es: 'Si', sr: 'Си' }, 523: { en: 'High C', es: 'Do alto', sr: 'Високо До' },
    },
    gestos: {
      left: { en: 'tilt left', es: 'inclinar a la izquierda', sr: 'нагиб лево' }, right: { en: 'tilt right', es: 'inclinar a la derecha', sr: 'нагиб десно' },
      up: { en: 'logo up', es: 'logo arriba', sr: 'лого горе' }, down: { en: 'logo down', es: 'logo abajo', sr: 'лого доле' },
      'face up': { en: 'screen up', es: 'pantalla arriba', sr: 'екран горе' }, 'face down': { en: 'screen down', es: 'pantalla abajo', sr: 'екран доле' },
      freefall: { en: 'free fall', es: 'caída libre', sr: 'слободан пад' },
    },
    variaveis: {
      contador: { en: 'counter', es: 'contador', sr: 'бројач', pt: 'contador' }, pontos: { en: 'points', es: 'puntos', sr: 'поени', pt: 'pontos' },
      medida: { en: 'reading', es: 'medida', sr: 'мерење', pt: 'medida' }, recorde: { en: 'record', es: 'récord', sr: 'рекорд', pt: 'recorde' },
      vidas: { en: 'lives', es: 'vidas', sr: 'животи', pt: 'vidas' }, passos: { en: 'steps', es: 'pasos', sr: 'кораци', pt: 'passos' },
      modo: { en: 'mode', es: 'modo', sr: 'режим', pt: 'modo' }, limite: { en: 'limit', es: 'límite', sr: 'граница', pt: 'limite' },
    },
    bme: {
      temp: { en: 'temperature(℃)', es: 'temperatura(℃)', sr: 'температура (℃)' }, hum: { en: 'humidity(0~100)', es: 'humedad(0~100)', sr: 'влажност (0~100)' },
      pres: { en: 'pressure(hPa)', es: 'presión(hPa)', sr: 'притисак (hPa)' },
    },
    pinoPremido: { logo: { en: 'logo', es: 'logo', sr: 'лого' } },
  };
  F.ROTULOS = O;
  F.rotulo = (grupo, valor, def) => { const r = O[grupo] && O[grupo][valor]; return (r && (r[F.LANG] || (F.LANG === 'pt' ? def : r.en))) || def; };
  // nome da variável na língua (o valor no programa fica o mesmo: contador, limite…)
  F.nomeVar = v => F.rotulo('variaveis', v, v);

  F.traduzirBlocos = function (lista) {
    if (F.LANG === 'pt') return lista;
    for (const d of lista) {
      const t = B[d.type];
      if (t && t[F.LANG]) t[F.LANG].forEach((m, i) => { if (m !== undefined) d['message' + i] = m; });
      if (t && t.tip && t.tip[F.LANG]) d.tooltip = t.tip[F.LANG];
    }
    return lista;
  };
  F.TEXTOS_BLOCOS = B;
})();
