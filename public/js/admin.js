/* ============================================================
   ÁREA ADMINISTRATIVA
   ------------------------------------------------------------
   Esta página é só para a dona do chá. Ela precisa de login
   com e-mail e senha para abrir.

   A senha NÃO está escrita aqui nem em nenhum arquivo do site:
   quem guarda e confere a senha é o Firebase. O que protege os
   dados de verdade são as regras do arquivo firestore.rules —
   mesmo que alguém abra esta página, sem estar logado o banco
   recusa tudo.
   ============================================================ */

(function () {

  /* ---------------------------------------------------------
     ONDE GUARDAMOS AS COISAS ENQUANTO A PÁGINA ESTÁ ABERTA
     --------------------------------------------------------- */
  var estado = {
    conexao:      null,  // ligação com o banco (null = demonstração)
    autenticacao: null,  // ligação com o login
    presentes:    [],
    confirmacoes: [],
    reservas:     [],
  };

  var CATEGORIAS = [
    { id: 'quarto',     nome: 'Quarto' },
    { id: 'transporte', nome: 'Transporte' },
    { id: 'alimentacao', nome: 'Alimentação' },
    { id: 'banho',      nome: 'Banho' },
    { id: 'pele',       nome: 'Pele' },
    { id: 'troca',      nome: 'Hora da troca' },
    { id: 'cuidados',   nome: 'Cabelo e unhas' },
    { id: 'narizinho',  nome: 'Narizinho' },
    { id: 'boca',       nome: 'Higiene bucal' },
    { id: 'outros',     nome: 'Outros' },
  ];

  function nomeCategoria(id) {
    var c = CATEGORIAS.find(function (x) { return x.id === id; });
    return c ? c.nome : 'Outros';
  }

  /* Atalhos para encontrar pedaços da página */
  var tela      = document.getElementById('tela-login');
  var painel    = document.getElementById('painel');
  var formLogin = document.getElementById('form-login');
  var erroLogin = document.getElementById('erro-login');

  var modoDemonstracao = !window.firebaseEstaConfigurado();

  /* =========================================================
     1. ENTRAR E SAIR
     ========================================================= */

  async function iniciar() {
    if (modoDemonstracao) {
      document.getElementById('aviso-demo-login').hidden = false;
      document.getElementById('aviso-demo-painel').hidden = false;
      return;
    }

    estado.autenticacao = await window.carregarAutenticacao();
    var a = estado.autenticacao;

    // Se a pessoa já entrou antes neste aparelho, o Firebase lembra.
    a.auth.onAuthStateChanged(a.servico, function (usuario) {
      if (usuario) abrirPainel();
      else mostrarLogin();
    });
  }

  formLogin.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    erroLogin.hidden = true;

    var botao = document.getElementById('botao-entrar');
    botao.disabled = true;
    botao.textContent = 'Entrando...';

    try {
      if (modoDemonstracao) {
        await new Promise(function (r) { setTimeout(r, 400); });
        abrirPainel();
        return;
      }

      var a = estado.autenticacao;
      await a.auth.signInWithEmailAndPassword(
        a.servico, formLogin.email.value.trim(), formLogin.senha.value
      );
      // O onAuthStateChanged acima cuida de abrir o painel.

    } catch (e) {
      botao.disabled = false;
      botao.textContent = 'Entrar';
      erroLogin.textContent = traduzirErroLogin(e.code);
      erroLogin.hidden = false;
    }
  });

  function traduzirErroLogin(codigo) {
    var mensagens = {
      'auth/invalid-email':       'Esse e-mail não parece válido.',
      'auth/user-not-found':      'Não encontrei esse e-mail. Confira se digitou certo.',
      'auth/wrong-password':      'Senha incorreta.',
      'auth/invalid-credential':  'E-mail ou senha incorretos.',
      'auth/too-many-requests':   'Muitas tentativas seguidas. Espere alguns minutos.',
      'auth/network-request-failed': 'Sem conexão. Confira sua internet.',
    };
    return mensagens[codigo] || 'Não consegui entrar agora. Tente de novo em instantes.';
  }

  document.getElementById('botao-sair').addEventListener('click', async function () {
    if (!modoDemonstracao) {
      var a = estado.autenticacao;
      await a.auth.signOut(a.servico);
    }
    location.reload();
  });

  function mostrarLogin() {
    tela.hidden = false;
    painel.hidden = true;
  }

  async function abrirPainel() {
    tela.hidden = true;
    painel.hidden = false;
    await carregarTudo();
  }

  /* =========================================================
     2. BUSCAR OS DADOS
     ========================================================= */

  async function carregarTudo() {
    if (modoDemonstracao) {
      if (!estado.presentes.length) await carregarDemonstracao();
    } else {
      estado.conexao = await window.carregarFirestore();
      var fs = estado.conexao.fs;
      var banco = estado.conexao.banco;

      var [p, c, r] = await Promise.all([
        fs.getDocs(fs.query(fs.collection(banco, 'presentes'), fs.orderBy('ordem'))),
        fs.getDocs(fs.query(fs.collection(banco, 'confirmacoes'), fs.orderBy('criadoEm', 'desc'))),
        fs.getDocs(fs.query(fs.collection(banco, 'reservas'), fs.orderBy('criadoEm', 'desc'))),
      ]);

      var juntar = function (d) { return Object.assign({ id: d.id }, d.data()); };
      estado.presentes    = p.docs.map(juntar);
      estado.confirmacoes = c.docs.map(juntar);
      estado.reservas     = r.docs.map(juntar).filter(function (x) { return x.ativa; });
    }

    desenharTudo();
  }

  async function carregarDemonstracao() {
    var arquivo = await fetch('dados/presentes-iniciais.json').then(function (r) { return r.json(); });
    estado.presentes = arquivo.presentes.map(function (p, i) {
      // No modo demonstração inventamos um preço, só para a tela
      // não ficar toda zerada antes de você importar a planilha.
      return Object.assign({ id: 'demo-' + i, ordem: i, disponivel: p.total }, p,
                           { preco: p.preco || [39.9, 89.9, 129.9, 249][i % 4] });
    });
    // Dois exemplos para a tela não ficar vazia
    estado.confirmacoes = [
      { id: 'd1', nome: 'Ana Souza',      pessoas: 2, telefone: '(31) 99999-1234', criadoEm: new Date() },
      { id: 'd2', nome: 'Carla Medeiros', pessoas: 1, telefone: '',                criadoEm: new Date() },
    ];
    var ontem = new Date(Date.now() - 30 * 60 * 60 * 1000); // 30 horas atrás
    estado.reservas = [
      { id: 'K7P2MQ', nome: 'Ana Souza', presenteNome: 'Fralda Pampers RN Premium Care',
        presenteId: 'demo-5', recado: 'Com todo carinho!', valor: 89.9,
        status: 'aguardando', avisouPix: true, ativa: true, criadoEm: new Date() },
      { id: 'T4XBWM', nome: 'Carla Medeiros', presenteNome: 'Escova e pente Buba',
        presenteId: 'demo-8', recado: '', valor: 39.9,
        status: 'aguardando', avisouPix: false, ativa: true, criadoEm: ontem },
      { id: 'R2KDHN', nome: 'João Ribeiro', presenteNome: 'Almofada de amamentação',
        presenteId: 'demo-14', recado: 'Parabéns aos dois!', valor: 129.9,
        status: 'recebido', avisouPix: true, ativa: true, criadoEm: ontem },
    ];
    ['demo-5', 'demo-8', 'demo-14'].forEach(function (id) {
      var alvo = estado.presentes.find(function (p) { return p.id === id; });
      if (alvo && alvo.disponivel > 0) alvo.disponivel -= 1;
    });
  }

  /* =========================================================
     3. DESENHAR AS TELAS
     ========================================================= */

  function desenharTudo() {
    desenharResumo();
    desenharPresentes();
    desenharConfirmacoes();
    desenharReservas();
    document.getElementById('bloco-importar').hidden = estado.presentes.length > 0;
  }

  function desenharResumo() {
    var pessoas = estado.confirmacoes.reduce(function (soma, c) {
      return soma + (c.pessoas || 0);
    }, 0);
    var reservados = estado.presentes.reduce(function (soma, p) {
      return soma + (p.total - p.disponivel);
    }, 0);
    var totalItens = estado.presentes.reduce(function (soma, p) {
      return soma + p.total;
    }, 0);

    var recebido = estado.reservas.reduce(function (soma, r) {
      return soma + (r.status === 'recebido' ? (r.valor || 0) : 0);
    }, 0);
    var aguardando = estado.reservas.reduce(function (soma, r) {
      return soma + (r.status !== 'recebido' ? (r.valor || 0) : 0);
    }, 0);

    var caixas = [
      { numero: pessoas, rotulo: pessoas === 1 ? 'pessoa confirmada' : 'pessoas confirmadas' },
      { numero: reservados + '/' + totalItens, rotulo: 'presentes escolhidos', menor: true },
      { numero: window.formatarReais(recebido), rotulo: 'recebido', menor: true },
      { numero: window.formatarReais(aguardando), rotulo: 'aguardando Pix', menor: true },
    ];

    document.getElementById('resumo').innerHTML = caixas.map(function (c) {
      return '<div class="resumo-caixa">' +
               '<span class="resumo-numero' + (c.menor ? ' menor' : '') + '">' + c.numero + '</span>' +
               '<span class="resumo-rotulo">' + c.rotulo + '</span>' +
             '</div>';
    }).join('');
  }

  /* ---------- Presentes ---------- */

  function desenharPresentes() {
    var alvo = document.getElementById('lista-admin-presentes');
    alvo.innerHTML = '';

    if (!estado.presentes.length) {
      alvo.innerHTML = '<p class="vazio">Nenhum presente cadastrado ainda.</p>';
      return;
    }

    estado.presentes.forEach(function (p) {
      var linha = document.createElement('div');
      linha.className = 'linha-admin';

      var levados = p.total - p.disponivel;

      linha.innerHTML =
        '<div class="linha-info">' +
          '<strong class="linha-nome"></strong>' +
          '<span class="linha-meta"></span>' +
        '</div>' +
        '<div class="linha-estoque">' +
          '<button type="button" class="botao-circulo" data-menos title="Tirar 1 do estoque">−</button>' +
          '<span class="estoque-numero"></span>' +
          '<button type="button" class="botao-circulo" data-mais title="Devolver 1 ao estoque">+</button>' +
        '</div>' +
        '<div class="linha-botoes">' +
          '<button type="button" class="botao-texto" data-editar>Editar</button>' +
          '<button type="button" class="botao-texto perigo" data-excluir>Excluir</button>' +
        '</div>';

      linha.querySelector('.linha-nome').textContent = p.nome;
      linha.querySelector('.linha-meta').textContent =
        [nomeCategoria(p.categoria),
         (p.preco > 0 ? window.formatarReais(p.preco) : 'sem preço'),
         (levados > 0 ? levados + ' escolhido(s)' : null)
        ].filter(Boolean).join(' · ');
      linha.querySelector('.estoque-numero').textContent = p.disponivel + '/' + p.total;

      linha.querySelector('[data-menos]').addEventListener('click', function () {
        ajustarEstoque(p, -1);
      });
      linha.querySelector('[data-mais]').addEventListener('click', function () {
        ajustarEstoque(p, +1);
      });
      linha.querySelector('[data-editar]').addEventListener('click', function () {
        abrirEdicao(p, linha);
      });
      linha.querySelector('[data-excluir]').addEventListener('click', function () {
        excluirPresente(p);
      });

      alvo.appendChild(linha);
    });
  }

  /* Monta o formulário de presente (serve para criar e para editar) */
  function camposPresente(p) {
    p = p || {};
    var opcoes = CATEGORIAS.map(function (c) {
      return '<option value="' + c.id + '"' +
             (p.categoria === c.id ? ' selected' : '') + '>' + c.nome + '</option>';
    }).join('');

    return '' +
      '<p class="aviso erro" hidden></p>' +
      '<div class="campo">' +
        '<label>Nome do presente</label>' +
        '<input type="text" name="nome" maxlength="150" required>' +
      '</div>' +
      '<div class="campo">' +
        '<label>Categoria</label>' +
        '<select name="categoria">' + opcoes + '</select>' +
      '</div>' +
      '<div class="campo">' +
        '<label>Preço do produto (R$)</label>' +
        '<input type="number" name="preco" min="0" step="0.01" value="0" required>' +
        '<span class="ajuda">É este valor que vai no Pix do convidado.</span>' +
      '</div>' +
      '<div class="campo">' +
        '<label>Quantidade que você precisa</label>' +
        '<input type="number" name="total" min="1" max="99" value="1" required>' +
      '</div>' +
      '<div class="campo">' +
        '<label>Descrição <span class="opcional">(opcional)</span></label>' +
        '<input type="text" name="descricao" maxlength="200">' +
        '<span class="ajuda">Ex.: tamanho, cor, marca preferida.</span>' +
      '</div>' +
      '<div class="campo">' +
        '<label>Link da loja <span class="opcional">(opcional)</span></label>' +
        '<input type="url" name="link" maxlength="500" placeholder="https://...">' +
      '</div>' +
      '<div class="campo">' +
        '<label>Foto <span class="opcional">(opcional)</span></label>' +
        '<input type="text" name="foto" maxlength="500" placeholder="img/presentes/fralda.webp">' +
        '<span class="ajuda">Nome do arquivo de foto dentro do site. Deixe em branco ' +
        'para aparecer o quadradinho colorido com a inicial.</span>' +
      '</div>';
  }

  function preencher(form, p) {
    form.nome.value      = p.nome || '';
    form.preco.value     = p.preco || 0;
    form.total.value     = p.total || 1;
    form.descricao.value = p.descricao || '';
    form.link.value      = p.link || '';
    form.foto.value      = p.foto || '';
    form.categoria.value = p.categoria || 'outros';
  }

  function lerFormulario(form) {
    var aviso = form.querySelector('.aviso');
    aviso.hidden = true;

    var dados = {
      nome:      form.nome.value.replace(/\s+/g, ' ').trim(),
      categoria: form.categoria.value,
      preco:     Math.round(parseFloat(form.preco.value) * 100) / 100,
      total:     parseInt(form.total.value, 10),
      descricao: form.descricao.value.trim(),
      link:      form.link.value.trim(),
      foto:      form.foto.value.trim(),
    };

    if (dados.nome.length < 2) {
      aviso.textContent = 'Escreva o nome do presente.';
      aviso.hidden = false;
      return null;
    }
    if (!Number.isInteger(dados.total) || dados.total < 1 || dados.total > 99) {
      aviso.textContent = 'A quantidade precisa ser um número de 1 a 99.';
      aviso.hidden = false;
      return null;
    }
    if (!isFinite(dados.preco) || dados.preco < 0 || dados.preco > 99999) {
      aviso.textContent = 'O preço precisa ser um número entre 0 e 99999.';
      aviso.hidden = false;
      return null;
    }
    if (dados.link && !/^https?:\/\//i.test(dados.link)) {
      aviso.textContent = 'O link precisa começar com https://';
      aviso.hidden = false;
      return null;
    }
    return dados;
  }

  /* ---- Criar ---- */
  var formNovo = document.getElementById('form-novo');
  formNovo.innerHTML = camposPresente() +
    '<button type="submit" class="botao">Adicionar à lista</button>';

  formNovo.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    var dados = lerFormulario(formNovo);
    if (!dados) return;

    dados.disponivel = dados.total;
    dados.ordem = estado.presentes.length;

    await comEspera(formNovo, async function () {
      if (modoDemonstracao) {
        estado.presentes.push(Object.assign({ id: 'novo-' + Date.now() }, dados));
      } else {
        var fs = estado.conexao.fs;
        var doc = await fs.addDoc(fs.collection(estado.conexao.banco, 'presentes'), dados);
        estado.presentes.push(Object.assign({ id: doc.id }, dados));
      }
      formNovo.reset();
      desenharTudo();
    });
  });

  /* ---- Editar ---- */
  function abrirEdicao(p, linha) {
    var jaAberto = linha.nextElementSibling;
    if (jaAberto && jaAberto.classList.contains('form-edicao')) {
      jaAberto.remove();
      return;
    }

    var form = document.createElement('form');
    form.className = 'cartao form-edicao';
    form.innerHTML = camposPresente(p) +
      '<button type="submit" class="botao">Salvar alterações</button>' +
      '<button type="button" class="botao secundario cancelar">Cancelar</button>';

    preencher(form, p);

    form.querySelector('.cancelar').addEventListener('click', function () { form.remove(); });

    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      var dados = lerFormulario(form);
      if (!dados) return;

      // Se a quantidade total mudou, o disponível acompanha a diferença.
      var levados = p.total - p.disponivel;
      dados.disponivel = Math.max(0, dados.total - levados);

      await comEspera(form, async function () {
        if (!modoDemonstracao) {
          var fs = estado.conexao.fs;
          await fs.updateDoc(fs.doc(estado.conexao.banco, 'presentes', p.id), dados);
        }
        Object.assign(p, dados);
        form.remove();
        desenharTudo();
      });
    });

    linha.after(form);
  }

  /* ---- Estoque na mão ---- */
  async function ajustarEstoque(p, quanto) {
    var novo = p.disponivel + quanto;
    if (novo < 0 || novo > p.total) return;

    if (!modoDemonstracao) {
      var fs = estado.conexao.fs;
      await fs.updateDoc(fs.doc(estado.conexao.banco, 'presentes', p.id), { disponivel: novo });
    }
    p.disponivel = novo;
    desenharTudo();
  }

  /* ---- Excluir ---- */
  async function excluirPresente(p) {
    var temDono = p.total - p.disponivel;
    var pergunta = temDono > 0
      ? 'Atenção: ' + temDono + ' convidado(s) já marcaram "' + p.nome + '". ' +
        'Excluir mesmo assim?'
      : 'Excluir "' + p.nome + '" da lista?';

    if (!confirm(pergunta)) return;

    if (!modoDemonstracao) {
      var fs = estado.conexao.fs;
      await fs.deleteDoc(fs.doc(estado.conexao.banco, 'presentes', p.id));
    }
    estado.presentes = estado.presentes.filter(function (x) { return x.id !== p.id; });
    desenharTudo();
  }

  /* ---- Importar a lista inicial ---- */
  document.getElementById('botao-importar').addEventListener('click', async function () {
    var botao = this;
    botao.disabled = true;
    botao.textContent = 'Cadastrando...';

    try {
      var arquivo = await fetch('dados/presentes-iniciais.json').then(function (r) { return r.json(); });

      for (var i = 0; i < arquivo.presentes.length; i++) {
        var p = arquivo.presentes[i];
        var novo = {
          nome: p.nome, categoria: p.categoria, total: p.total,
          disponivel: p.total, descricao: p.descricao || '',
          link: p.link || '', foto: p.foto || '', ordem: i,
        };
        if (modoDemonstracao) {
          estado.presentes.push(Object.assign({ id: 'imp-' + i }, novo));
        } else {
          var fs = estado.conexao.fs;
          var doc = await fs.addDoc(fs.collection(estado.conexao.banco, 'presentes'), novo);
          estado.presentes.push(Object.assign({ id: doc.id }, novo));
        }
      }
      desenharTudo();
    } catch (e) {
      alert('Não consegui importar a lista: ' + e.message);
    } finally {
      botao.disabled = false;
      botao.textContent = 'Importar lista inicial';
    }
  });

  /* ---------- Confirmações ---------- */

  function desenharConfirmacoes() {
    var alvo = document.getElementById('lista-confirmacoes');

    if (!estado.confirmacoes.length) {
      alvo.innerHTML = '<p class="vazio">Ninguém confirmou presença ainda.</p>';
      return;
    }

    alvo.innerHTML = '';
    estado.confirmacoes.forEach(function (c) {
      var linha = document.createElement('div');
      linha.className = 'linha-admin';
      linha.innerHTML =
        '<div class="linha-info">' +
          '<strong class="linha-nome"></strong>' +
          '<span class="linha-meta"></span>' +
        '</div>' +
        '<div class="linha-estoque"><span class="selo-pessoas"></span></div>';

      linha.querySelector('.linha-nome').textContent = c.nome;
      linha.querySelector('.linha-meta').textContent =
        [c.telefone, formatarData(c.criadoEm)].filter(Boolean).join(' · ');
      linha.querySelector('.selo-pessoas').textContent =
        c.pessoas + (c.pessoas === 1 ? ' pessoa' : ' pessoas');

      alvo.appendChild(linha);
    });
  }

  /* ---------- Reservas ---------- */

  function desenharReservas() {
    var alvo = document.getElementById('lista-reservas');

    if (!estado.reservas.length) {
      alvo.innerHTML = '<p class="vazio">Ninguém escolheu presente ainda.</p>';
      return;
    }

    // Quem está esperando há mais tempo aparece primeiro.
    var pendentes = estado.reservas.filter(function (r) { return r.status !== 'recebido'; });
    var recebidas = estado.reservas.filter(function (r) { return r.status === 'recebido'; });

    var atrasadas = pendentes.filter(estaAtrasada);

    alvo.innerHTML = '';

    if (atrasadas.length) {
      var aviso = document.createElement('p');
      aviso.className = 'aviso erro';
      aviso.textContent = atrasadas.length === 1
        ? '1 escolha está sem Pix há mais de 24 horas. Veja abaixo se quer liberar o item.'
        : atrasadas.length + ' escolhas estão sem Pix há mais de 24 horas. ' +
          'Veja abaixo se quer liberar os itens.';
      alvo.appendChild(aviso);
    }

    pendentes.concat(recebidas).forEach(function (r) {
      alvo.appendChild(montarReserva(r));
    });
  }

  /* Passou de 24 horas sem o Pix cair? */
  function estaAtrasada(r) {
    if (r.status === 'recebido') return false;
    var quando = r.criadoEm && r.criadoEm.toDate ? r.criadoEm.toDate() : new Date(r.criadoEm);
    if (isNaN(quando)) return false;
    return (Date.now() - quando.getTime()) > 24 * 60 * 60 * 1000;
  }

  function montarReserva(r) {
    var recebido = r.status === 'recebido';
    var atrasada = estaAtrasada(r);

    var linha = document.createElement('div');
    linha.className = 'linha-admin' + (atrasada ? ' atrasada' : '');
    linha.innerHTML =
      '<div class="linha-info">' +
        '<strong class="linha-nome"></strong>' +
        '<span class="linha-meta"></span>' +
        '<span class="linha-recado"></span>' +
      '</div>' +
      '<div class="linha-estoque"><span class="selo-status"></span></div>' +
      '<div class="linha-botoes"></div>';

    linha.querySelector('.linha-nome').textContent = r.presenteNome;
    linha.querySelector('.linha-meta').textContent = [
      r.nome,
      window.formatarReais(r.valor || 0),
      'código ' + r.id,
      formatarData(r.criadoEm),
    ].join(' · ');

    var recado = linha.querySelector('.linha-recado');
    if (r.recado) recado.textContent = '“' + r.recado + '”';
    else recado.remove();

    /* ---- Selo de situação ---- */
    var selo = linha.querySelector('.selo-status');
    if (recebido) {
      selo.textContent = '✓ recebido';
      selo.classList.add('ok');
    } else if (atrasada) {
      selo.textContent = 'sem Pix há +24h';
      selo.classList.add('atencao');
    } else if (r.avisouPix) {
      selo.textContent = 'avisou que pagou';
    } else {
      selo.textContent = 'aguardando Pix';
    }

    /* ---- Botões ---- */
    var botoes = linha.querySelector('.linha-botoes');

    if (!recebido) {
      var marcar = document.createElement('button');
      marcar.type = 'button';
      marcar.className = 'botao-texto';
      marcar.textContent = 'Recebi o Pix';
      marcar.addEventListener('click', function () { marcarRecebido(r, true); });
      botoes.appendChild(marcar);

      var liberar = document.createElement('button');
      liberar.type = 'button';
      liberar.className = 'botao-texto perigo';
      liberar.textContent = 'Liberar item';
      liberar.addEventListener('click', function () { liberarReserva(r); });
      botoes.appendChild(liberar);
    } else {
      var desfazer = document.createElement('button');
      desfazer.type = 'button';
      desfazer.className = 'botao-texto';
      desfazer.textContent = 'Desmarcar';
      desfazer.addEventListener('click', function () { marcarRecebido(r, false); });
      botoes.appendChild(desfazer);
    }

    return linha;
  }

  /* Marca (ou desmarca) que o dinheiro caiu na conta. */
  async function marcarRecebido(r, recebido) {
    if (!modoDemonstracao) {
      var fs = estado.conexao.fs;
      await fs.updateDoc(fs.doc(estado.conexao.banco, 'reservas', r.id), {
        status: recebido ? 'recebido' : 'aguardando',
      });
    }
    r.status = recebido ? 'recebido' : 'aguardando';
    desenharTudo();
  }

  /* Cancela a escolha e devolve o item para a lista.
     Use quando o Pix não veio e você quer liberar o presente. */
  async function liberarReserva(r) {
    if (!confirm('Liberar "' + r.presenteNome + '" de volta para a lista?\n\n' +
                 'A escolha de ' + r.nome + ' será cancelada.')) return;

    var presente = estado.presentes.find(function (p) { return p.id === r.presenteId; });

    if (!modoDemonstracao) {
      var fs = estado.conexao.fs;
      await fs.updateDoc(fs.doc(estado.conexao.banco, 'reservas', r.id), { ativa: false });
      if (presente) {
        var devolvido = Math.min(presente.disponivel + 1, presente.total);
        await fs.updateDoc(fs.doc(estado.conexao.banco, 'presentes', presente.id), {
          disponivel: devolvido,
        });
      }
    }
    if (presente) presente.disponivel = Math.min(presente.disponivel + 1, presente.total);
    estado.reservas = estado.reservas.filter(function (x) { return x.id !== r.id; });
    desenharTudo();
  }

  /* =========================================================
     4. ABAS
     ========================================================= */

  document.getElementById('abas').addEventListener('click', function (ev) {
    var botao = ev.target.closest('.aba');
    if (!botao) return;

    document.querySelectorAll('.aba').forEach(function (b) {
      b.classList.toggle('ativa', b === botao);
    });

    ['presentes', 'confirmacoes', 'reservas'].forEach(function (nome) {
      document.getElementById('painel-' + nome).hidden = (nome !== botao.dataset.aba);
    });
  });

  /* =========================================================
     5. BAIXAR EM EXCEL (arquivo CSV)
     ========================================================= */

  document.querySelectorAll('[data-csv]').forEach(function (botao) {
    botao.addEventListener('click', function () { baixarCSV(botao.dataset.csv); });
  });

  function baixarCSV(qual) {
    var linhas, nomeArquivo;

    if (qual === 'confirmacoes') {
      nomeArquivo = 'confirmacoes-cha-da-bibia.csv';
      linhas = [['Nome', 'Pessoas', 'Telefone', 'Enviado em']];
      estado.confirmacoes.forEach(function (c) {
        linhas.push([c.nome, c.pessoas, c.telefone || '', formatarData(c.criadoEm)]);
      });
      linhas.push([]);
      linhas.push(['TOTAL DE PESSOAS', estado.confirmacoes.reduce(function (s, c) {
        return s + (c.pessoas || 0);
      }, 0)]);

    } else if (qual === 'presentes') {
      nomeArquivo = 'presentes-cha-da-bibia.csv';
      // Estas três primeiras colunas são as mesmas que a importação
      // aceita, então dá para baixar, corrigir no Excel e subir de volta.
      linhas = [['NOME', 'LINK', 'PRECO', 'Categoria', 'Total', 'Ainda falta', 'Já escolhidos']];
      estado.presentes.forEach(function (p) {
        linhas.push([p.nome, p.link || '', numeroBR(p.preco), nomeCategoria(p.categoria),
                     p.total, p.disponivel, p.total - p.disponivel]);
      });

    } else {
      nomeArquivo = 'presentes-recebidos-cha-da-bibia.csv';
      linhas = [['Presente', 'Quem presenteou', 'Valor', 'Situação',
                 'Recado', 'Código', 'Escolhido em']];
      estado.reservas.forEach(function (r) {
        linhas.push([
          r.presenteNome, r.nome, numeroBR(r.valor),
          r.status === 'recebido' ? 'Recebido'
            : (r.avisouPix ? 'Avisou que pagou' : 'Aguardando Pix'),
          r.recado || '', r.id, formatarData(r.criadoEm),
        ]);
      });
      linhas.push([]);
      linhas.push(['TOTAL RECEBIDO', '', numeroBR(estado.reservas.reduce(function (t, r) {
        return t + (r.status === 'recebido' ? (r.valor || 0) : 0);
      }, 0))]);
      linhas.push(['TOTAL AGUARDANDO', '', numeroBR(estado.reservas.reduce(function (t, r) {
        return t + (r.status !== 'recebido' ? (r.valor || 0) : 0);
      }, 0))]);
    }

    // O Excel brasileiro espera ponto e vírgula entre as colunas.
    var texto = linhas.map(function (linha) {
      return linha.map(function (celula) {
        var valor = String(celula == null ? '' : celula);
        return '"' + valor.replace(/"/g, '""') + '"';
      }).join(';');
    }).join('\r\n');

    // O "﻿" na frente faz o Excel entender os acentos.
    var arquivo = new Blob(['﻿' + texto], { type: 'text/csv;charset=utf-8;' });
    var endereco = URL.createObjectURL(arquivo);

    var link = document.createElement('a');
    link.href = endereco;
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(endereco);
  }

  /* =========================================================
     AJUDANTES
     ========================================================= */

  /* O Excel em português espera vírgula no lugar do ponto
     para entender o número como dinheiro e conseguir somar. */
  function numeroBR(valor) {
    return String(Number(valor || 0).toFixed(2)).replace('.', ',');
  }

  function formatarData(valor) {
    if (!valor) return '';
    var data = valor.toDate ? valor.toDate() : new Date(valor);
    if (isNaN(data)) return '';
    return data.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  /* Desabilita o botão enquanto salva, e mostra o erro se falhar. */
  async function comEspera(form, tarefa) {
    var botao = form.querySelector('button[type="submit"]');
    var texto = botao.textContent;
    botao.disabled = true;
    botao.textContent = 'Salvando...';
    try {
      await tarefa();
    } catch (e) {
      console.error(e);
      var aviso = form.querySelector('.aviso');
      aviso.textContent = 'Não consegui salvar: ' + e.message;
      aviso.hidden = false;
    } finally {
      botao.disabled = false;
      botao.textContent = texto;
    }
  }


  /* =========================================================
     6. IMPORTAR A LISTA DE UMA PLANILHA (CSV)
     ---------------------------------------------------------
     A planilha precisa ter uma linha de títulos com as colunas
     NOME, LINK e PRECO (em qualquer ordem). Colunas a mais,
     como CATEGORIA ou QUANTIDADE, são aproveitadas se existirem
     e ignoradas se não existirem.

     O que acontece com cada linha:
       - presente que já existe (mesmo nome)  -> atualiza preço e link
       - presente que não existe              -> é criado
       - presente que sumiu da planilha       -> só é apagado depois
                                                 de você confirmar
     ========================================================= */

  /* Lê um texto CSV e devolve uma lista de linhas.
     Entende tanto ";" quanto "," como separador, e respeita
     aspas, porque nome de produto costuma ter vírgula. */
  function lerCSV(texto) {
    texto = texto.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

    var primeira = texto.split('\n')[0] || '';
    var separador = (primeira.split(';').length > primeira.split(',').length) ? ';' : ',';

    var linhas = [], campo = '', linha = [], dentroDeAspas = false;

    for (var i = 0; i < texto.length; i++) {
      var c = texto[i];

      if (dentroDeAspas) {
        if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
        else if (c === '"') { dentroDeAspas = false; }
        else { campo += c; }
      } else if (c === '"') {
        dentroDeAspas = true;
      } else if (c === separador) {
        linha.push(campo); campo = '';
      } else if (c === '\n') {
        linha.push(campo); linhas.push(linha); linha = []; campo = '';
      } else {
        campo += c;
      }
    }
    linha.push(campo);
    if (linha.length > 1 || linha[0].trim() !== '') linhas.push(linha);

    return linhas.filter(function (l) {
      return l.some(function (c) { return String(c).trim() !== ''; });
    });
  }

  /* "R$ 1.234,50" ou "1234.50" viram o número 1234.5 */
  function lerPreco(texto) {
    var limpo = String(texto || '').replace(/[^0-9,.-]/g, '').trim();
    if (!limpo) return 0;

    // Se tem vírgula, ela é a casa decimal (jeito brasileiro).
    if (limpo.indexOf(',') !== -1) {
      limpo = limpo.replace(/\./g, '').replace(',', '.');
    }
    var n = parseFloat(limpo);
    return isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : 0;
  }

  /* Deixa o nome comparável: sem acento, sem maiúscula,
     sem espaço sobrando. Assim "Berço " casa com "berco". */
  function chaveDoNome(nome) {
    return String(nome || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  var entradaCSV = document.getElementById('arquivo-csv');
  var avisoCSV   = document.getElementById('aviso-csv');

  entradaCSV.addEventListener('change', function () {
    var arquivo = entradaCSV.files && entradaCSV.files[0];
    if (!arquivo) return;

    var leitor = new FileReader();
    leitor.onload = function () {
      try {
        processarCSV(String(leitor.result));
      } catch (e) {
        console.error(e);
        mostrarAvisoCSV('erro', 'Não consegui ler a planilha: ' + e.message);
      }
      entradaCSV.value = ''; // permite subir o mesmo arquivo de novo
    };
    leitor.onerror = function () {
      mostrarAvisoCSV('erro', 'Não consegui abrir o arquivo.');
    };
    leitor.readAsText(arquivo, 'UTF-8');
  });

  function mostrarAvisoCSV(tipo, texto) {
    avisoCSV.className = 'aviso ' + (tipo === 'erro' ? 'erro' : 'ok');
    avisoCSV.textContent = texto;
    avisoCSV.hidden = false;
  }

  async function processarCSV(conteudo) {
    var linhas = lerCSV(conteudo);
    if (linhas.length < 2) {
      mostrarAvisoCSV('erro', 'A planilha parece vazia. Ela precisa de uma linha ' +
                              'de títulos e pelo menos um presente.');
      return;
    }

    /* ---- Descobrir em que coluna está cada coisa ---- */
    var titulos = linhas[0].map(function (t) { return chaveDoNome(t); });
    var col = {
      nome:      titulos.indexOf('nome'),
      link:      titulos.indexOf('link'),
      preco:     titulos.findIndex(function (t) { return t === 'preco' || t === 'preço' || t === 'valor'; }),
      categoria: titulos.indexOf('categoria'),
      total:     titulos.findIndex(function (t) { return t === 'quantidade' || t === 'total'; }),
      descricao: titulos.indexOf('descricao'),
    };

    if (col.nome === -1) {
      mostrarAvisoCSV('erro', 'Não encontrei a coluna NOME na primeira linha da planilha.');
      return;
    }
    if (col.preco === -1) {
      mostrarAvisoCSV('erro', 'Não encontrei a coluna PRECO na primeira linha da planilha.');
      return;
    }

    /* ---- Montar a lista que veio da planilha ---- */
    var daPlanilha = [];
    var nomesVistos = {};

    for (var i = 1; i < linhas.length; i++) {
      var l = linhas[i];
      var nome = String(l[col.nome] || '').replace(/\s+/g, ' ').trim();
      if (!nome) continue;

      var chave = chaveDoNome(nome);
      if (nomesVistos[chave]) continue;   // linha repetida na planilha
      nomesVistos[chave] = true;

      daPlanilha.push({
        chave:     chave,
        nome:      nome,
        link:      col.link      !== -1 ? String(l[col.link] || '').trim() : '',
        preco:     lerPreco(l[col.preco]),
        categoria: col.categoria !== -1 ? (chaveDoNome(l[col.categoria]) || 'outros') : null,
        descricao: col.descricao !== -1 ? String(l[col.descricao] || '').trim() : null,
        total:     col.total     !== -1 ? (parseInt(l[col.total], 10) || 1) : null,
      });
    }

    if (!daPlanilha.length) {
      mostrarAvisoCSV('erro', 'Não encontrei nenhum presente com nome preenchido.');
      return;
    }

    /* ---- Comparar com o que já está cadastrado ---- */
    var atuais = {};
    estado.presentes.forEach(function (p) { atuais[chaveDoNome(p.nome)] = p; });

    var novos = daPlanilha.filter(function (x) { return !atuais[x.chave]; });
    var atualizados = daPlanilha.filter(function (x) { return atuais[x.chave]; });

    var sobrando = estado.presentes.filter(function (p) {
      return !daPlanilha.some(function (x) { return x.chave === chaveDoNome(p.nome); });
    });

    /* ---- Avisar antes de apagar o que sobrou ---- */
    var apagar = [];
    if (sobrando.length) {
      var nomesSobrando = sobrando.map(function (p) { return '• ' + p.nome; }).join('\n');
      var comDono = sobrando.filter(function (p) { return p.total > p.disponivel; });

      var pergunta =
        'A planilha não tem estes ' + sobrando.length + ' presentes que já estão no site:\n\n' +
        nomesSobrando + '\n\n' +
        (comDono.length
          ? 'ATENÇÃO: ' + comDono.length + ' deles já foram escolhidos por alguém.\n\n'
          : '') +
        'Apagar estes presentes da lista?\n\n' +
        'OK = apagar.    Cancelar = manter todos.';

      if (confirm(pergunta)) apagar = sobrando;
    }

    /* ---- Fazer as mudanças ---- */
    var fs = modoDemonstracao ? null : estado.conexao.fs;
    var banco = modoDemonstracao ? null : estado.conexao.banco;
    var ordem = 0;

    try {
      // Atualizar os que já existem
      for (var a = 0; a < atualizados.length; a++) {
        var dado = atualizados[a];
        var alvo = atuais[dado.chave];
        var mudanca = { preco: dado.preco, link: dado.link };

        if (dado.categoria) mudanca.categoria = dado.categoria;
        if (dado.descricao !== null) mudanca.descricao = dado.descricao;
        if (dado.total) {
          var jaEscolhidos = alvo.total - alvo.disponivel;
          mudanca.total = dado.total;
          mudanca.disponivel = Math.max(0, dado.total - jaEscolhidos);
        }
        if (fs) await fs.updateDoc(fs.doc(banco, 'presentes', alvo.id), mudanca);
        Object.assign(alvo, mudanca);
      }

      // Criar os que faltam
      for (var n = 0; n < novos.length; n++) {
        var d = novos[n];
        var registro = {
          nome: d.nome, categoria: d.categoria || 'outros',
          preco: d.preco, link: d.link, descricao: d.descricao || '',
          foto: '', total: d.total || 1, disponivel: d.total || 1,
          ordem: estado.presentes.length + n,
        };
        if (fs) {
          var doc = await fs.addDoc(fs.collection(banco, 'presentes'), registro);
          estado.presentes.push(Object.assign({ id: doc.id }, registro));
        } else {
          estado.presentes.push(Object.assign({ id: 'csv-' + Date.now() + '-' + n }, registro));
        }
      }

      // Apagar os que você confirmou
      for (var e = 0; e < apagar.length; e++) {
        if (fs) await fs.deleteDoc(fs.doc(banco, 'presentes', apagar[e].id));
      }
      if (apagar.length) {
        estado.presentes = estado.presentes.filter(function (p) {
          return apagar.indexOf(p) === -1;
        });
      }

      desenharTudo();

      var resumo = [];
      if (atualizados.length) resumo.push(atualizados.length + ' atualizado(s)');
      if (novos.length)       resumo.push(novos.length + ' novo(s)');
      if (apagar.length)      resumo.push(apagar.length + ' apagado(s)');
      if (sobrando.length && !apagar.length) {
        resumo.push(sobrando.length + ' mantido(s) fora da planilha');
      }
      mostrarAvisoCSV('ok', 'Pronto: ' + resumo.join(', ') + '.');

    } catch (erro) {
      console.error(erro);
      mostrarAvisoCSV('erro', 'Parei no meio por causa de um erro: ' + erro.message +
                              ' O que já foi salvo continua salvo.');
      desenharTudo();
    }
  }

  iniciar();
})();
