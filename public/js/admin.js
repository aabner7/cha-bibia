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
      return Object.assign({ id: 'demo-' + i, ordem: i, disponivel: p.total }, p);
    });
    // Dois exemplos para a tela não ficar vazia
    estado.confirmacoes = [
      { id: 'd1', nome: 'Ana Souza',      pessoas: 2, telefone: '(31) 99999-1234', criadoEm: new Date() },
      { id: 'd2', nome: 'Carla Medeiros', pessoas: 1, telefone: '',                criadoEm: new Date() },
    ];
    estado.reservas = [
      { id: 'K7P2MQ', nome: 'Ana Souza', presenteNome: 'Fralda Pampers RN Premium Care',
        presenteId: 'demo-5', recado: 'Com todo carinho!', ativa: true, criadoEm: new Date() },
    ];
    var alvo = estado.presentes.find(function (p) { return p.id === 'demo-5'; });
    if (alvo) alvo.disponivel -= 1;
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

    var caixas = [
      { numero: pessoas,                     rotulo: pessoas === 1 ? 'pessoa confirmada' : 'pessoas confirmadas' },
      { numero: estado.confirmacoes.length,  rotulo: estado.confirmacoes.length === 1 ? 'confirmação' : 'confirmações' },
      { numero: reservados + '/' + totalItens, rotulo: 'presentes com dono', menor: true },
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
        nomeCategoria(p.categoria) +
        (levados > 0 ? ' · ' + levados + ' já tem dono' : '');
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
      alvo.innerHTML = '<p class="vazio">Ninguém marcou presente ainda.</p>';
      return;
    }

    alvo.innerHTML = '';
    estado.reservas.forEach(function (r) {
      var linha = document.createElement('div');
      linha.className = 'linha-admin';
      linha.innerHTML =
        '<div class="linha-info">' +
          '<strong class="linha-nome"></strong>' +
          '<span class="linha-meta"></span>' +
          '<span class="linha-recado"></span>' +
        '</div>';

      linha.querySelector('.linha-nome').textContent = r.presenteNome;
      linha.querySelector('.linha-meta').textContent =
        r.nome + ' · ' + formatarData(r.criadoEm);

      var recado = linha.querySelector('.linha-recado');
      if (r.recado) recado.textContent = '“' + r.recado + '”';
      else recado.remove();

      alvo.appendChild(linha);
    });
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
      linhas = [['Presente', 'Categoria', 'Total', 'Ainda falta', 'Já tem dono', 'Link']];
      estado.presentes.forEach(function (p) {
        linhas.push([p.nome, nomeCategoria(p.categoria), p.total,
                     p.disponivel, p.total - p.disponivel, p.link || '']);
      });

    } else {
      nomeArquivo = 'quem-leva-o-que-cha-da-bibia.csv';
      linhas = [['Presente', 'Quem vai levar', 'Recado', 'Código', 'Marcado em']];
      estado.reservas.forEach(function (r) {
        linhas.push([r.presenteNome, r.nome, r.recado || '', r.id, formatarData(r.criadoEm)]);
      });
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

  iniciar();
})();
