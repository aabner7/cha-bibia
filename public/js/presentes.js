/* ============================================================
   LISTA DE PRESENTES
   ------------------------------------------------------------
   O que este arquivo faz:
   1. Mostra os presentes, separados por categoria.
   2. Quando alguém clica em "Vou levar", tira 1 do estoque
      usando uma TRANSAÇÃO do Firestore. Transação quer dizer:
      o banco de dados trata o "ler e descontar" como um passo
      único, então duas pessoas não conseguem pegar o último
      item ao mesmo tempo.
   3. Devolve um CÓDIGO ao convidado. Só com esse código ele
      consegue desfazer a própria escolha — assim ninguém
      cancela a escolha de outra pessoa.
   ============================================================ */

(function () {
  var lista      = document.getElementById('lista-presentes');
  if (!lista) return;

  var avisoDemo  = document.getElementById('aviso-demonstracao');
  var blocoDesfazer = document.getElementById('bloco-desfazer');
  var formDesfazer  = document.getElementById('form-desfazer');
  var avisoDesfazer = document.getElementById('aviso-desfazer');

  var conexao = null;   // ligação com o Firestore (ou null no modo demonstração)
  var presentes = [];   // o que está na tela agora

  /* ---------------------------------------------------------
     CÓDIGO DO CONVIDADO
     Seis letras e números, sem os caracteres que se confundem
     (zero com letra O, um com letra I), porque muita gente vai
     anotar isso no papel ou ditar pelo telefone.
     --------------------------------------------------------- */
  var ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

  function gerarCodigo() {
    var valores = new Uint32Array(6);
    crypto.getRandomValues(valores);
    var codigo = '';
    for (var i = 0; i < 6; i++) {
      codigo += ALFABETO[valores[i] % ALFABETO.length];
    }
    return codigo;
  }

  /* ---------------------------------------------------------
     MEMÓRIA DO PRÓPRIO CELULAR
     Guardamos os códigos no navegador do convidado para ele não
     precisar decorar. Isso não sai do aparelho dele.
     --------------------------------------------------------- */
  function meusCodigos() {
    try {
      return JSON.parse(localStorage.getItem('bibia.codigos') || '[]');
    } catch (e) { return []; }
  }

  function guardarCodigo(registro) {
    try {
      var atuais = meusCodigos();
      atuais.push(registro);
      localStorage.setItem('bibia.codigos', JSON.stringify(atuais));
    } catch (e) { /* navegador bloqueou; o código continua na tela */ }
  }

  function esquecerCodigo(codigo) {
    try {
      var restantes = meusCodigos().filter(function (r) { return r.codigo !== codigo; });
      localStorage.setItem('bibia.codigos', JSON.stringify(restantes));
    } catch (e) { /* tudo bem */ }
  }

  /* ---------------------------------------------------------
     CARREGAR A LISTA
     --------------------------------------------------------- */
  async function carregar() {
    conexao = await window.carregarFirestore();

    if (conexao) {
      var fs = conexao.fs;
      var resposta = await fs.getDocs(
        fs.query(fs.collection(conexao.banco, 'presentes'), fs.orderBy('ordem'))
      );
      presentes = resposta.docs.map(function (d) {
        return Object.assign({ id: d.id }, d.data());
      });
    } else {
      // Modo demonstração: lê a lista do arquivo e finge um banco.
      var arquivo = await fetch('dados/presentes-iniciais.json').then(function (r) { return r.json(); });
      window.__categorias = arquivo.categorias;
      presentes = arquivo.presentes.map(function (p, i) {
        return Object.assign({ id: 'demo-' + i, ordem: i, disponivel: p.total }, p);
      });
      avisoDemo.hidden = false;
    }

    desenhar();
  }

  /* ---------------------------------------------------------
     DESENHAR A LISTA NA TELA
     --------------------------------------------------------- */
  var NOMES_CATEGORIA = {
    quarto: 'Para o quarto', passear: 'Para passear', soninho: 'Para o soninho',
    vestir: 'Para vestir', higiene: 'Higiene e banho', fraldas: 'Fraldas',
    alimentacao: 'Alimentação', outros: 'Outros',
    // nomes antigos, caso sobre algum presente cadastrado antes da planilha
    banho: 'Banho', pele: 'Pele', troca: 'Hora da troca', cuidados: 'Cabelo e unhas',
    narizinho: 'Narizinho', transporte: 'Transporte', boca: 'Higiene bucal',
  };

  function desenhar() {
    lista.innerHTML = '';

    var porCategoria = {};
    presentes.forEach(function (p) {
      var c = p.categoria || 'outros';
      (porCategoria[c] = porCategoria[c] || []).push(p);
    });

    Object.keys(porCategoria).forEach(function (c) {
      var secao = document.createElement('section');
      secao.className = 'categoria';

      var titulo = document.createElement('h2');
      titulo.textContent = NOMES_CATEGORIA[c] || c;
      secao.appendChild(titulo);

      porCategoria[c].forEach(function (p) {
        secao.appendChild(montarPresente(p));
      });

      lista.appendChild(secao);
    });

    atualizarBlocoDesfazer();
  }

  function montarPresente(p) {
    var esgotado = p.disponivel <= 0;
    var jaMarquei = meusCodigos().some(function (r) { return r.presenteId === p.id; });

    var caixa = document.createElement('article');
    caixa.className = 'presente' + (esgotado ? ' esgotado' : '');

    /* ---- Foto (ou um quadradinho com a inicial) ---- */
    var figura = document.createElement('div');
    figura.className = 'presente-foto';
    if (p.foto) {
      var img = document.createElement('img');
      img.src = p.foto;
      img.alt = '';
      img.loading = 'lazy';
      figura.appendChild(img);
    } else {
      figura.classList.add('sem-foto');
      figura.textContent = p.nome.charAt(0).toUpperCase();
    }
    caixa.appendChild(figura);

    /* ---- Texto ---- */
    var corpo = document.createElement('div');
    corpo.className = 'presente-corpo';

    var nome = document.createElement('h3');
    nome.textContent = p.nome;
    corpo.appendChild(nome);

    if (p.descricao) {
      var desc = document.createElement('p');
      desc.className = 'presente-descricao';
      desc.textContent = p.descricao;
      corpo.appendChild(desc);
    }

    if (p.preco > 0) {
      var preco = document.createElement('p');
      preco.className = 'presente-preco';
      preco.textContent = window.formatarReais(p.preco);
      corpo.appendChild(preco);
    }

    var situacao = document.createElement('p');
    situacao.className = 'presente-situacao';
    if (esgotado) {
      situacao.textContent = 'Já foi presenteado 💛';
    } else if (p.total === 1) {
      situacao.textContent = 'Disponível';
    } else if (p.disponivel === p.total) {
      situacao.textContent = p.total + ' disponíveis';
    } else if (p.disponivel === 1) {
      situacao.textContent = 'Falta 1 de ' + p.total;
    } else {
      situacao.textContent = 'Faltam ' + p.disponivel + ' de ' + p.total;
    }
    corpo.appendChild(situacao);

    if (p.link) {
      var link = document.createElement('a');
      link.className = 'presente-link';
      link.href = p.link;
      link.target = '_blank';
      link.rel = 'noopener nofollow';
      link.textContent = 'Ver sugestão na loja';
      corpo.appendChild(link);
    }

    caixa.appendChild(corpo);

    /* ---- Botão ---- */
    var acao = document.createElement('div');
    acao.className = 'presente-acao';

    if (jaMarquei) {
      var marcado = document.createElement('p');
      marcado.className = 'etiqueta-marcado';
      marcado.textContent = '✓ Você já escolheu este';
      acao.appendChild(marcado);
    } else if (!esgotado) {
      var botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'botao';
      botao.textContent = p.preco > 0 ? 'Presentear' : 'Vou levar este';
      botao.addEventListener('click', function () { abrirFormulario(p, caixa, acao); });
      acao.appendChild(botao);
    }

    caixa.appendChild(acao);
    return caixa;
  }

  /* ---------------------------------------------------------
     PASSO 1: quem está presenteando
     --------------------------------------------------------- */
  function abrirFormulario(p, caixa, acao) {
    acao.innerHTML = '';

    var form = document.createElement('form');
    form.className = 'form-marcar';
    var comPix = p.preco > 0;
    form.innerHTML =
      '<p class="aviso erro" hidden></p>' +
      (comPix ? '' :
        '<p class="presente-descricao">Este presente não é por Pix: você mesmo ' +
        'compra e leva no chá. Só precisamos do seu nome para ninguém repetir.</p>') +
      '<div class="campo">' +
        '<label>Seu nome</label>' +
        '<input type="text" name="nome" maxlength="80" autocomplete="name" required>' +
      '</div>' +
      '<div class="campo">' +
        '<label>Recado <span class="opcional">(opcional)</span></label>' +
        '<textarea name="recado" rows="2" maxlength="200"></textarea>' +
      '</div>' +
      '<button type="submit" class="botao">' +
        (comPix ? 'Continuar para o Pix' : 'Confirmar que vou levar') + '</button>' +
      '<button type="button" class="botao secundario cancelar">Cancelar</button>';

    var aviso = form.querySelector('.aviso');

    // Se a pessoa já confirmou presença, o nome vem preenchido.
    try {
      var salvo = localStorage.getItem('beatriz.nome');
      if (salvo) form.nome.value = salvo;
    } catch (e) { /* tudo bem */ }

    form.querySelector('.cancelar').addEventListener('click', function () {
      caixa.replaceWith(montarPresente(p));
    });

    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      aviso.hidden = true;

      var nome   = form.nome.value.replace(/\s+/g, ' ').trim();
      var recado = form.recado.value.replace(/\s+/g, ' ').trim();

      if (nome.length < 3 || nome.indexOf(' ') === -1) {
        aviso.textContent = 'Por favor, escreva seu nome e sobrenome.';
        aviso.hidden = false;
        return;
      }

      var enviar = form.querySelector('button[type="submit"]');
      enviar.disabled = true;
      enviar.textContent = 'Guardando...';

      try {
        var codigo = await reservar(p, nome, recado);
        if (comPix) mostrarPix(p, caixa, codigo);
        else mostrarSucesso(p, caixa, codigo, true);
      } catch (erro) {
        enviar.disabled = false;
        enviar.textContent = comPix ? 'Continuar para o Pix' : 'Confirmar que vou levar';
        aviso.textContent = erro.message;
        aviso.hidden = false;
        if (erro.recarregar) setTimeout(carregar, 1500);
      }
    });

    acao.appendChild(form);
    form.nome.focus();
  }

  /* ---------------------------------------------------------
     A TRANSAÇÃO: tirar 1 do estoque com segurança
     --------------------------------------------------------- */
  async function reservar(p, nome, recado) {
    var codigo = gerarCodigo();

    if (!conexao) {
      // Modo demonstração: mexe só na memória da página.
      await new Promise(function (r) { setTimeout(r, 500); });
      if (p.disponivel <= 0) {
        var e = new Error('Alguém acabou de pegar este item.');
        e.recarregar = true;
        throw e;
      }
      p.disponivel -= 1;
      guardarCodigo({ codigo: codigo, presenteId: p.id, presenteNome: p.nome });
      return codigo;
    }

    var fs = conexao.fs;
    var refPresente = fs.doc(conexao.banco, 'presentes', p.id);
    var refReserva  = fs.doc(conexao.banco, 'reservas', codigo);

    await fs.runTransaction(conexao.banco, async function (transacao) {
      var atual = await transacao.get(refPresente);

      if (!atual.exists()) {
        throw new Error('Este presente não está mais na lista.');
      }

      var disponivel = atual.data().disponivel;
      if (disponivel <= 0) {
        var e = new Error('Alguém acabou de pegar este item. Atualizando a lista...');
        e.recarregar = true;
        throw e;
      }

      // Os dois passos abaixo acontecem juntos ou não acontecem.
      transacao.update(refPresente, { disponivel: disponivel - 1 });
      transacao.set(refReserva, {
        presenteId:   p.id,
        presenteNome: p.nome,
        nome:         nome,
        recado:       recado,
        valor:        Number(p.preco) || 0,
        // 'aguardando' = esperando o Pix cair na conta.
        // Só a administradora muda isso para 'recebido'.
        status:       'aguardando',
        // O convidado marca isto ao tocar em "Já fiz o Pix".
        // É só um aviso: não comprova pagamento nenhum.
        avisouPix:    false,
        ativa:        true,
        criadoEm:     fs.serverTimestamp(),
      });
    });

    p.disponivel -= 1;
    guardarCodigo({ codigo: codigo, presenteId: p.id, presenteNome: p.nome });
    return codigo;
  }

  /* ---------------------------------------------------------
     TELA DE SUCESSO, COM O CÓDIGO
     --------------------------------------------------------- */
  function mostrarPix(p, caixa, codigo) {
    var valor  = Number(p.preco) || 0;
    var cobranca = window.gerarCodigoPix(valor);

    var tela = document.createElement('article');
    tela.className = 'presente tela-pix';
    tela.innerHTML =
      '<div class="presente-corpo largura-total">' +
        '<h3>Falta só o Pix 💛</h3>' +
        '<p>Você escolheu <strong class="pix-item"></strong>.</p>' +
        '<p class="pix-valor"></p>' +
        '<div class="pix-qr"></div>' +
        '<p class="rotulo-codigo">Ou copie o código Pix:</p>' +
        '<p class="pix-codigo"></p>' +
        '<button type="button" class="botao" data-copiar>Copiar código Pix</button>' +
        '<p class="presente-descricao pix-ajuda">' +
          'Abra o aplicativo do seu banco, escolha Pix, aponte para o QR code ' +
          'ou cole o código. O valor já vai preenchido.' +
        '</p>' +
        '<button type="button" class="botao secundario" data-pronto>Já fiz o Pix</button>' +
        '<p class="presente-descricao">' +
          'Guardamos este presente para você. Se você não avisar em 24 horas, ' +
          'ele pode voltar para a lista.' +
        '</p>' +
      '</div>';

    tela.querySelector('.pix-item').textContent  = p.nome;
    tela.querySelector('.pix-valor').textContent = window.formatarReais(valor);
    tela.querySelector('.pix-codigo').textContent = cobranca || '';

    var qr = window.desenharQrPix(cobranca, 220);
    if (qr) {
      qr.setAttribute('role', 'img');
      qr.setAttribute('aria-label', 'QR code do Pix no valor de ' + window.formatarReais(valor));
      tela.querySelector('.pix-qr').appendChild(qr);
    } else {
      tela.querySelector('.pix-qr').remove();
    }

    /* ---- Copiar o código ---- */
    var botaoCopiar = tela.querySelector('[data-copiar]');
    botaoCopiar.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(cobranca);
      } catch (e) {
        // Alguns navegadores antigos não deixam copiar sozinho:
        // então selecionamos o texto para a pessoa copiar na mão.
        var alvo = tela.querySelector('.pix-codigo');
        var faixa = document.createRange();
        faixa.selectNodeContents(alvo);
        var selecao = window.getSelection();
        selecao.removeAllRanges();
        selecao.addRange(faixa);
      }
      botaoCopiar.textContent = 'Código copiado ✓';
      setTimeout(function () { botaoCopiar.textContent = 'Copiar código Pix'; }, 2500);
    });

    /* ---- "Já fiz o Pix" ---- */
    tela.querySelector('[data-pronto]').addEventListener('click', async function () {
      this.disabled = true;
      this.textContent = 'Anotando...';
      try { await avisarPagamento(codigo); } catch (e) { console.error(e); }
      mostrarSucesso(p, tela, codigo);
    });

    caixa.replaceWith(tela);
    tela.scrollIntoView({ block: 'start', behavior: 'smooth' });
    atualizarBlocoDesfazer();
  }

  /* Marca que o convidado disse ter feito o Pix. Não comprova
     nada: serve só para a administradora saber onde olhar. */
  async function avisarPagamento(codigo) {
    if (!conexao) return;
    var fs = conexao.fs;
    await fs.updateDoc(fs.doc(conexao.banco, 'reservas', codigo), { avisouPix: true });
  }

  /* ---------------------------------------------------------
     TELA FINAL, COM O CÓDIGO DE DESFAZER
     --------------------------------------------------------- */
  function mostrarSucesso(p, caixa, codigo, semPix) {
    var novo = document.createElement('article');
    novo.className = 'presente reservado';
    novo.innerHTML =
      '<div class="presente-corpo largura-total">' +
        '<h3>Obrigada! 💛</h3>' +
        (semPix
          ? '<p>Anotamos que você vai levar: <strong></strong>.</p>' +
            '<p class="presente-descricao">Você mesmo compra e leva no chá. ' +
            'Não precisa pagar nada por aqui.</p>'
          : '<p>Anotamos o seu presente: <strong></strong>.</p>') +
        '<p class="rotulo-codigo">Guarde este código:</p>' +
        '<p class="codigo"></p>' +
        '<p class="presente-descricao">Ele serve só para você desfazer sua própria ' +
        'escolha, se precisar. Seu celular já guardou o código, mas vale tirar um print.</p>' +
      '</div>';
    novo.querySelector('strong').textContent = p.nome;
    novo.querySelector('.codigo').textContent = codigo;

    caixa.replaceWith(novo);
    novo.scrollIntoView({ block: 'center', behavior: 'smooth' });
    atualizarBlocoDesfazer();
  }

  /* ---------------------------------------------------------
     DESFAZER COM O CÓDIGO
     --------------------------------------------------------- */
  function atualizarBlocoDesfazer() {
    blocoDesfazer.hidden = meusCodigos().length === 0;
  }

  formDesfazer.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    avisoDesfazer.hidden = true;

    var codigo = formDesfazer.codigo.value.trim().toUpperCase();
    if (codigo.length !== 6) {
      avisoDesfazer.className = 'aviso erro';
      avisoDesfazer.textContent = 'O código tem 6 caracteres.';
      avisoDesfazer.hidden = false;
      return;
    }

    var botao = formDesfazer.querySelector('button[type="submit"]');
    botao.disabled = true;

    try {
      await desfazer(codigo);
      avisoDesfazer.className = 'aviso ok';
      avisoDesfazer.textContent = 'Pronto, sua escolha foi desfeita. ' +
                                  'O presente voltou para a lista.';
      avisoDesfazer.hidden = false;
      formDesfazer.reset();
      await carregar();
    } catch (erro) {
      avisoDesfazer.className = 'aviso erro';
      avisoDesfazer.textContent = erro.message;
      avisoDesfazer.hidden = false;
    } finally {
      botao.disabled = false;
    }
  });

  async function desfazer(codigo) {
    if (!conexao) {
      var meus = meusCodigos();
      var registro = meus.find(function (r) { return r.codigo === codigo; });
      if (!registro) throw new Error('Não encontrei esse código. Confira as letras.');
      var p = presentes.find(function (x) { return x.id === registro.presenteId; });
      if (p) p.disponivel += 1;
      esquecerCodigo(codigo);
      return;
    }

    var fs = conexao.fs;
    var refReserva = fs.doc(conexao.banco, 'reservas', codigo);

    await fs.runTransaction(conexao.banco, async function (transacao) {
      var reserva = await transacao.get(refReserva);

      if (!reserva.exists() || reserva.data().ativa !== true) {
        throw new Error('Não encontrei esse código, ou ele já foi usado.');
      }

      var refPresente = fs.doc(conexao.banco, 'presentes', reserva.data().presenteId);
      var presente = await transacao.get(refPresente);

      if (presente.exists()) {
        var devolvido = Math.min(presente.data().disponivel + 1, presente.data().total);
        transacao.update(refPresente, { disponivel: devolvido });
      }
      transacao.update(refReserva, { ativa: false });
    });

    esquecerCodigo(codigo);
  }

  /* ---------------------------------------------------------
     Começa tudo
     --------------------------------------------------------- */
  carregar().catch(function (e) {
    console.error(e);
    lista.innerHTML = '<p class="aviso erro">Não consegui carregar a lista agora. ' +
                      'Atualize a página em instantes, por favor.</p>';
  });
})();
