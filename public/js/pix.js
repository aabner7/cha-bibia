/* ============================================================
   GERADOR DO CÓDIGO PIX
   ------------------------------------------------------------
   Monta o texto do "Pix copia e cola" de cada presente, já com
   o valor certo, e desenha o QR code correspondente.

   O QR code e o texto são A MESMA COISA: o QR é só o desenho
   do texto. O aplicativo do banco lê qualquer um dos dois.

   Como o valor vai dentro do código, o convidado não precisa
   digitar quanto pagar, e o app já mostra o valor certo.

   Nada aqui conversa com o banco nem com a internet: o código
   é montado dentro do próprio celular de quem está olhando.
   ============================================================ */

(function () {

  /* ---------------------------------------------------------
     O código Pix é uma sequência de pedaços. Cada pedaço tem:
     um número de 2 dígitos (o que é), o tamanho (2 dígitos) e
     o conteúdo. Esta função monta um pedaço.
     --------------------------------------------------------- */
  function pedaco(numero, conteudo) {
    var tamanho = String(conteudo.length).padStart(2, '0');
    return numero + tamanho + conteudo;
  }

  /* ---------------------------------------------------------
     Dígito verificador (CRC16). É o que o aplicativo do banco
     usa para saber que o código não foi digitado errado nem
     adulterado no caminho.
     --------------------------------------------------------- */
  function verificador(texto) {
    var resto = 0xFFFF;
    for (var i = 0; i < texto.length; i++) {
      resto ^= texto.charCodeAt(i) << 8;
      for (var b = 0; b < 8; b++) {
        resto = (resto & 0x8000) ? ((resto << 1) ^ 0x1021) & 0xFFFF
                                 : (resto << 1) & 0xFFFF;
      }
    }
    return resto.toString(16).toUpperCase().padStart(4, '0');
  }

  /* Tira acento e deixa maiúsculo, como o padrão do Pix exige. */
  function semAcento(texto, limite) {
    var limpo = String(texto || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')      // tira os acentos
      .replace(/[^A-Za-z0-9 ]/g, '')        // só letras, números e espaço
      .toUpperCase()
      .trim();
    return limpo.slice(0, limite);
  }

  /* ---------------------------------------------------------
     MONTA O CÓDIGO DE UM PRESENTE
     valor: número em reais, por exemplo 129.9
     --------------------------------------------------------- */
  window.gerarCodigoPix = function (valor) {
    var c = window.PIX;

    var reais = Number(valor);
    if (!isFinite(reais) || reais <= 0) return null;

    var codigo =
      pedaco('00', '01') +                                   // versão do padrão
      pedaco('26',                                           // dados do Pix
        pedaco('00', 'br.gov.bcb.pix') +
        pedaco('01', c.chave)
      ) +
      pedaco('52', '0000') +                                 // tipo de comércio
      pedaco('53', '986') +                                  // moeda: real
      pedaco('54', reais.toFixed(2)) +                       // VALOR
      pedaco('58', 'BR') +                                   // país
      pedaco('59', semAcento(c.nome, 25)) +                  // quem recebe
      pedaco('60', semAcento(c.cidade, 15)) +                // cidade
      pedaco('62', pedaco('05', semAcento(c.identificador, 25) || '***'));

    codigo += '6304';                        // abertura do verificador
    return codigo + verificador(codigo);
  };

  /* ---------------------------------------------------------
     DESENHA O QR CODE
     Devolve uma imagem pronta para colocar na tela.
     --------------------------------------------------------- */
  window.desenharQrPix = function (codigo, tamanhoEmPontos) {
    if (!codigo || typeof qrcode !== 'function') return null;

    // O "0" deixa a biblioteca escolher o tamanho necessário.
    // O "M" é o nível de correção de erro recomendado para Pix:
    // o código continua legível mesmo um pouco sujo ou torto.
    var qr = qrcode(0, 'M');
    qr.addData(codigo);
    qr.make();

    var quadrados = qr.getModuleCount();
    var lado = tamanhoEmPontos || 220;
    var ponto = Math.max(2, Math.floor(lado / (quadrados + 8)));
    var margem = ponto * 4;              // borda branca exigida pelo padrão
    var total = quadrados * ponto + margem * 2;

    var tela = document.createElement('canvas');
    tela.width = total;
    tela.height = total;
    tela.style.width = '100%';
    tela.style.maxWidth = lado + 'px';
    tela.style.height = 'auto';

    var pincel = tela.getContext('2d');
    pincel.fillStyle = '#ffffff';
    pincel.fillRect(0, 0, total, total);
    pincel.fillStyle = '#000000';

    for (var linha = 0; linha < quadrados; linha++) {
      for (var coluna = 0; coluna < quadrados; coluna++) {
        if (qr.isDark(linha, coluna)) {
          pincel.fillRect(margem + coluna * ponto, margem + linha * ponto,
                          ponto, ponto);
        }
      }
    }
    return tela;
  };

  /* Escreve o valor no formato brasileiro: R$ 1.234,50 */
  window.formatarReais = function (valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL',
    });
  };
})();
