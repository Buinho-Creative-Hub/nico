/* Nico — Modo livre: sem desafios nem validação. Todos os blocos do Nico arrumados por categorias,
 * como no MakeCode (Básico, Entrada, Música, LED…), mais as gavetas do ELECFREAKS Smart Science IoT Kit
 * (Octopus: ruído, luz, PIR, BME280 · OLED). A caixa de blocos vem de F.caixaCategorias() (js/desafios.js).
 */
(function () {
  'use strict';
  const F = window.Faisca;
  F.registarMissao({
    id: 'livre',
    modoLivre: true,
    titulo: 'Modo livre',
    tema: 'Inventar sem regras',
    descricao: 'Todos os blocos, arrumados por categorias como no MakeCode — incluindo os sensores e o ecrã OLED do Smart Science IoT Kit.',
    cor: '#3c3c3c',
    niveis: [{
      nome: 'Modo livre',
      desafios: [{
        titulo: 'Modo livre',
        missao: 'Inventa o que quiseres: escolhe uma categoria à esquerda e arrasta os blocos.',
        passos: [
          'Abre as categorias (Básico, Entrada, Música…) e arrasta os blocos.',
          'Tens o kit? Usa as gavetas Octopus e OLED.',
          'Experimenta no ecrã e envia para o micro:bit.',
        ],
        material: 'micro:bit (e o Smart Science IoT Kit, se o tiveres)',
        novos: [], livre: true, ok: () => false,
        tutor: {
          boasVindas: ['boas_vindas', { nico: 'Modo livre! Tens os blocos todos, arrumados por categorias como no MakeCode. Inventa à vontade — eu fico aqui a farejar.', _: 'Modo livre! Tens os blocos todos, arrumados por categorias como no MakeCode. Inventa à vontade — se precisares, estou aqui.' }],
          parecePronto: () => false, testar: '', regras: [], sucesso: '', extensao: '',
        },
      }],
    }],
  });
})();
