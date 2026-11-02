/* ============================================================
   CONTADOR REGRESSIVO
   ------------------------------------------------------------
   Calcula quanto falta para o chá e atualiza a cada segundo.
   Quando a data chega, troca o contador por uma mensagem.
   ============================================================ */

(function () {
  var caixa = document.getElementById('contador');
  if (!caixa) return;

  var alvo = new Date(window.EVENTO.dataISO).getTime();

  var campos = {
    dias:     document.getElementById('contador-dias'),
    horas:    document.getElementById('contador-horas'),
    minutos:  document.getElementById('contador-minutos'),
    segundos: document.getElementById('contador-segundos'),
  };

  function doisDigitos(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function atualizar() {
    var falta = alvo - Date.now();

    if (falta <= 0) {
      caixa.innerHTML =
        '<p class="chegou">É hoje! Esperamos você às ' +
        window.EVENTO.horario + '. 💛</p>';
      clearInterval(relogio);
      return;
    }

    var segundosTotais = Math.floor(falta / 1000);

    campos.dias.textContent     = Math.floor(segundosTotais / 86400);
    campos.horas.textContent    = doisDigitos(Math.floor(segundosTotais / 3600) % 24);
    campos.minutos.textContent  = doisDigitos(Math.floor(segundosTotais / 60) % 60);
    campos.segundos.textContent = doisDigitos(segundosTotais % 60);
  }

  atualizar();
  var relogio = setInterval(atualizar, 1000);
})();
