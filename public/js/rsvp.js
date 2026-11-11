/* ============================================================
   CONFIRMAÇÃO DE PRESENÇA (RSVP)
   ------------------------------------------------------------
   1. Confere se os campos foram preenchidos direito.
   2. Salva a confirmação no banco de dados (Firestore).
   3. Mostra a mensagem de agradecimento na tela.
   ============================================================ */

(function () {
  var formulario = document.getElementById('form-rsvp');
  if (!formulario) return;

  var botao    = document.getElementById('botao-enviar');
  var aviso    = document.getElementById('aviso');
  var sucesso  = document.getElementById('bloco-sucesso');
  var saudacao = document.getElementById('sucesso-nome');

  /* ---------- Conferência dos campos ---------- */

  function limparEspacos(texto) {
    return String(texto || '').replace(/\s+/g, ' ').trim();
  }

  function validar(dados) {
    if (dados.nome.length < 3) {
      return 'Por favor, escreva seu nome completo.';
    }
    if (dados.nome.indexOf(' ') === -1) {
      return 'Por favor, inclua o sobrenome também.';
    }
    if (dados.nome.length > 80) {
      return 'Esse nome ficou longo demais. Pode encurtar?';
    }
    if (dados.telefone) {
      var somenteNumeros = dados.telefone.replace(/\D/g, '');
      if (somenteNumeros.length < 10 || somenteNumeros.length > 13) {
        return 'Esse telefone parece incompleto. Inclua o DDD, por favor.';
      }
    }
    return null; // null = está tudo certo
  }

  function mostrarAviso(mensagem) {
    aviso.textContent = mensagem;
    aviso.hidden = false;
    aviso.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  /* ---------- Envio ---------- */

  formulario.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    aviso.hidden = true;

    var dados = {
      nome:     limparEspacos(formulario.nome.value),
      // O convite é nominal: cada confirmação vale uma pessoa.
      pessoas:  1,
      telefone: limparEspacos(formulario.telefone.value),
    };

    var erro = validar(dados);
    if (erro) {
      mostrarAviso(erro);
      return;
    }

    botao.disabled = true;
    botao.textContent = 'Enviando...';

    try {
      var conexao = await window.carregarFirestore();

      if (conexao) {
        var fs = conexao.fs;
        await fs.addDoc(fs.collection(conexao.banco, 'confirmacoes'), {
          nome:      dados.nome,
          pessoas:   dados.pessoas,
          telefone:  dados.telefone,
          criadoEm:  fs.serverTimestamp(),
        });
      } else {
        // Modo demonstração: espera um instante e finge que salvou.
        await new Promise(function (r) { setTimeout(r, 600); });
      }

      // Guarda o nome no próprio navegador, para já vir preenchido
      // na lista de presentes. Não sai do celular do convidado.
      try {
        localStorage.setItem('beatriz.nome', dados.nome);
      } catch (e) { /* alguns navegadores bloqueiam; não faz mal */ }

      saudacao.textContent = dados.nome.split(' ')[0];
      formulario.hidden = true;
      sucesso.hidden = false;
      sucesso.scrollIntoView({ block: 'center', behavior: 'smooth' });

    } catch (e) {
      console.error(e);
      botao.disabled = false;
      botao.textContent = 'Confirmar presença';
      mostrarAviso(
        'Não consegui salvar agora. Confira sua internet e tente de novo ' +
        'em instantes. Se continuar, nos avise pelo WhatsApp.'
      );
    }
  });
})();
