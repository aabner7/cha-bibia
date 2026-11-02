/* ============================================================
   DADOS DA LISTA DE PRESENTES
   ------------------------------------------------------------
   Este arquivo é a "ponte" entre a página e o banco de dados.
   A página só pede três coisas:
     - listar()                     -> traz os presentes
     - reservar(id, nome, recado)   -> marca "vou levar" e devolve o código
     - desfazer(codigo)             -> cancela a marcação com o código

   Se o Firebase ainda não foi configurado, tudo funciona em
   MODO DEMONSTRAÇÃO: os dados ficam só no navegador de quem
   está testando e nada vai para a internet.
   ============================================================ */

(function () {
  // Alfabeto do código: sem I, O, 0 e 1, que se confundem ao digitar.
  var ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 símbolos

  function novoCodigo() {
    var bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    var codigo = '';
    for (var i = 0; i < bytes.length; i++) codigo += ALFABETO[bytes[i] % 32];
    return codigo;
  }

  function erro(tipo) {
    var e = new Error(tipo);
    e.tipo = tipo; // 'esgotado' | 'nao-encontrado' | 'invalido'
    return e;
  }

  function ordenar(lista) {
    return lista.sort(function (a, b) {
      var oa = typeof a.ordem === 'number' ? a.ordem : 9999;
      var ob = typeof b.ordem === 'number' ? b.ordem : 9999;
      return oa !== ob ? oa - ob : a.nome.localeCompare(b.nome, 'pt-BR');
    });
  }

  /* ------------------------------------------------------------
     MODO DEMONSTRAÇÃO
     ------------------------------------------------------------ */
  var memoria = null; // plano B se o navegador bloquear o armazenamento

  function lerDemo() {
    try {
      var salvo = localStorage.getItem('beatriz.demo.v1');
      if (salvo) return JSON.parse(salvo);
    } catch (e) { /* segue para o plano B */ }
    return memoria || { estoque: {}, reservas: {} };
  }

  function gravarDemo(estado) {
    memoria = estado;
    try { localStorage.setItem('beatriz.demo.v1', JSON.stringify(estado)); }
    catch (e) { /* sem armazenamento: fica só na memória */ }
  }

  var demo = {
    listar: async function () {
      var estado = lerDemo();
      return window.PRESENTES_INICIAIS.map(function (p, i) {
        var disp = estado.estoque.hasOwnProperty(p.id) ? estado.estoque[p.id] : p.total;
        return Object.assign({}, p, { ordem: i, disponivel: disp });
      });
    },

    reservar: async function (id, nome, recado) {
      var estado = lerDemo();
      var base = window.PRESENTES_INICIAIS.filter(function (p) { return p.id === id; })[0];
      if (!base) throw erro('nao-encontrado');
      var disp = estado.estoque.hasOwnProperty(id) ? estado.estoque[id] : base.total;
      if (disp < 1) throw erro('esgotado');
      var codigo = novoCodigo();
      estado.estoque[id] = disp - 1;
      estado.reservas[codigo] = { presenteId: id, nome: nome, recado: recado };
      gravarDemo(estado);
      return codigo;
    },

    desfazer: async function (codigo) {
      var estado = lerDemo();
      var r = estado.reservas[codigo];
      if (!r) throw erro('nao-encontrado');
      estado.estoque[r.presenteId] = (estado.estoque[r.presenteId] || 0) + 1;
      delete estado.reservas[codigo];
      gravarDemo(estado);
      return r.presenteId;
    },
  };

  /* ------------------------------------------------------------
     FIRESTORE (banco de dados de verdade)
     ------------------------------------------------------------
     Estrutura:
       presentes/{id}     nome, descricao, foto, link, total, disponivel,
                          ultimaReserva (usada só pelas regras de segurança)
       reservas/{codigo}  nome, recado, presenteId, criadoEm
     O código da reserva é o próprio nome do documento.
     ------------------------------------------------------------ */
  var real = {
    listar: async function () {
      var c = await window.carregarFirestore();
      var fs = c.fs;
      var resp = await fs.getDocs(fs.collection(c.banco, 'presentes'));
      var lista = [];
      resp.forEach(function (d) { lista.push(Object.assign({ id: d.id }, d.data())); });
      return ordenar(lista);
    },

    reservar: async function (id, nome, recado) {
      var c = await window.carregarFirestore();
      var fs = c.fs;

      for (var tentativa = 0; tentativa < 4; tentativa++) {
        var codigo = novoCodigo();
        var refPresente = fs.doc(c.banco, 'presentes', id);
        var refReserva  = fs.doc(c.banco, 'reservas', codigo);

        try {
          // Transação: o Firestore confere e grava tudo de uma vez.
          // Se duas pessoas tentam pegar o último item juntas,
          // só uma consegue; a outra recebe "esgotado".
          await fs.runTransaction(c.banco, async function (tx) {
            var p = await tx.get(refPresente);
            if (!p.exists()) throw erro('nao-encontrado');
            var disp = p.data().disponivel;
            if (!(disp >= 1)) throw erro('esgotado');
            var r = await tx.get(refReserva);
            if (r.exists()) throw erro('codigo-repetido');
            tx.update(refPresente, { disponivel: disp - 1, ultimaReserva: codigo });
            tx.set(refReserva, {
              nome: nome,
              recado: recado,
              presenteId: id,
              criadoEm: fs.serverTimestamp(),
            });
          });
          return codigo;
        } catch (e) {
          if (e.tipo === 'codigo-repetido') continue; // sorteia outro código
          throw e;
        }
      }
      throw new Error('Não foi possível gerar um código.');
    },

    desfazer: async function (codigo) {
      var c = await window.carregarFirestore();
      var fs = c.fs;
      var refReserva = fs.doc(c.banco, 'reservas', codigo);
      var presenteId = null;

      await fs.runTransaction(c.banco, async function (tx) {
        var r = await tx.get(refReserva);
        if (!r.exists()) throw erro('nao-encontrado');
        presenteId = r.data().presenteId;
        var refPresente = fs.doc(c.banco, 'presentes', presenteId);
        var p = await tx.get(refPresente);
        if (!p.exists()) throw erro('nao-encontrado');
        tx.update(refPresente, { disponivel: p.data().disponivel + 1, ultimaReserva: codigo });
        tx.delete(refReserva);
      });
      return presenteId;
    },
  };

  window.DadosPresentes = {
    modoDemo: !window.firebaseEstaConfigurado(),
    codigoValido: function (c) { return /^[A-HJ-NP-Z2-9]{6}$/.test(c); },
    listar:   function () { return (window.firebaseEstaConfigurado() ? real : demo).listar(); },
    reservar: function (a, b, c) { return (window.firebaseEstaConfigurado() ? real : demo).reservar(a, b, c); },
    desfazer: function (a) { return (window.firebaseEstaConfigurado() ? real : demo).desfazer(a); },
  };
})();
