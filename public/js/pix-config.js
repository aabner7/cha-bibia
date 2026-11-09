/* ============================================================
   DADOS DO PIX
   ------------------------------------------------------------
   É AQUI que você troca a chave Pix, se um dia precisar.
   Mude só este arquivo e publique de novo.

   A chave aleatória abaixo pode ficar visível no site: ela
   serve para RECEBER dinheiro, e não dá acesso nenhum à conta.
   Nunca coloque aqui senha do banco nem código de cobrança
   pronto que o banco tenha gerado para outra finalidade.
   ============================================================ */

window.PIX = {
  // Chave aleatória (a que aparece no app do banco, em "Minhas chaves").
  chave: '30a30377-774f-4722-90a1-f569abfecfaa',

  // Nome e cidade aparecem no app de quem vai pagar, para a
  // pessoa conferir que está mandando para quem deve.
  // Regra do Pix: no máximo 25 letras no nome e 15 na cidade,
  // sem acento. Por isso "FERREIR" aparece cortado.
  nome:   'ANDRE ABNER ROCHA FERREIR',
  cidade: 'SAO PAULO',

  // Texto curto que o banco mostra junto com o pagamento.
  // Até 25 caracteres, sem acento e sem espaço.
  identificador: 'CHADABIBIA',
};
