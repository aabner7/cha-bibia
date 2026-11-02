/* ============================================================
   DADOS DO EVENTO
   ------------------------------------------------------------
   Os dados do chá aparecem em várias páginas. Para não precisar
   corrigir em vários lugares, eles ficam escritos UMA VEZ aqui.
   Se mudar data, horário ou endereço, mude só este arquivo.
   ============================================================ */

window.EVENTO = {
  titulo: 'Chá da Bibia',

  // Data e hora no formato: ano-mês-diaThora:minuto:segundo-03:00
  // O "-03:00" é o fuso de Brasília. Assim o contador fica certo
  // mesmo para quem abrir o site de outro estado ou país.
  dataISO: '2026-12-08T12:00:00-03:00',

  dataPorExtenso: 'Terça-feira, 8 de dezembro de 2026',
  horario: '12h',

  endereco: 'Rua Teodomiro Cruz, 175 — Novo São Lucas',
  cidade: 'Belo Horizonte / MG',
};

// Endereço completo, montado a partir dos dados acima.
window.EVENTO.enderecoCompleto =
  window.EVENTO.endereco.replace(' — ', ', ') + ', ' + window.EVENTO.cidade;
