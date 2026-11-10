/* ============================================================
   LEITOR DA PLANILHA DE PRESENTES (.xlsx)
   ------------------------------------------------------------
   Lê o arquivo do Excel / Google Planilhas direto no navegador
   e devolve a lista de presentes pronta para o site.

   Nada é enviado para fora: o arquivo é aberto aqui mesmo, no
   seu navegador. Também não depende de nenhuma biblioteca.

   Como a planilha deve ser:
   - Uma ABA por categoria (o nome da aba vira o nome da seção).
   - Primeira linha com os títulos: Nome, Link, Preço, Quantidade.
     A ordem das colunas não importa, e Link/Preço são opcionais.
   - Nome repetido em células mescladas (duas opções do mesmo
     item) vira "Nome (opção 1)" e "Nome (opção 2)".
   ============================================================ */

(function () {

  /* ---------------------------------------------------------
     1. ABRIR O ARQUIVO (um .xlsx é uma pasta zipada)
     --------------------------------------------------------- */
  async function descompactar(buffer) {
    if (typeof DecompressionStream !== 'function') {
      throw new Error('Este navegador é antigo demais para ler a planilha. ' +
                      'Abra o painel no Chrome, Safari ou Edge atualizados.');
    }
    var dados = new DataView(buffer);
    var bytes = new Uint8Array(buffer);
    var texto = new TextDecoder('utf-8');

    // O "índice" do zip fica no fim do arquivo.
    var fim = -1;
    for (var i = bytes.length - 22; i >= Math.max(0, bytes.length - 70000); i--) {
      if (dados.getUint32(i, true) === 0x06054b50) { fim = i; break; }
    }
    if (fim === -1) throw new Error('Isto não parece ser um arquivo .xlsx.');

    var quantos = dados.getUint16(fim + 10, true);
    var pos = dados.getUint32(fim + 16, true);
    var arquivos = {};

    for (var n = 0; n < quantos; n++) {
      if (dados.getUint32(pos, true) !== 0x02014b50) break;
      var metodo   = dados.getUint16(pos + 10, true);
      var tamComp  = dados.getUint32(pos + 20, true);
      var tamNome  = dados.getUint16(pos + 28, true);
      var tamExtra = dados.getUint16(pos + 30, true);
      var tamNota  = dados.getUint16(pos + 32, true);
      var inicio   = dados.getUint32(pos + 42, true);
      var nome = texto.decode(bytes.subarray(pos + 46, pos + 46 + tamNome));
      arquivos[nome] = { metodo: metodo, tamComp: tamComp, inicio: inicio };
      pos += 46 + tamNome + tamExtra + tamNota;
    }

    async function ler(nome) {
      var a = arquivos[nome];
      if (!a) return null;
      var tamNome  = dados.getUint16(a.inicio + 26, true);
      var tamExtra = dados.getUint16(a.inicio + 28, true);
      var comeco = a.inicio + 30 + tamNome + tamExtra;
      var pedaco = bytes.slice(comeco, comeco + a.tamComp);
      if (a.metodo === 0) return texto.decode(pedaco);
      if (a.metodo !== 8) throw new Error('Formato de compactação não suportado.');
      var fluxo = new Blob([pedaco]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return texto.decode(await new Response(fluxo).arrayBuffer());
    }
    return { ler: ler, existe: function (n) { return !!arquivos[n]; } };
  }

  function xml(texto) {
    var doc = new DOMParser().parseFromString(texto, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) {
      throw new Error('O arquivo está com defeito.');
    }
    return doc;
  }

  /* Caminho relativo de dentro do zip ("worksheets/sheet1.xml" -> "xl/worksheets/sheet1.xml") */
  function caminhoDaAba(alvo) {
    return alvo.charAt(0) === '/' ? alvo.slice(1) : 'xl/' + alvo;
  }

  /* "C12" -> { coluna: 2, linha: 11 } (começando do zero) */
  function lerEndereco(ref) {
    var m = /^([A-Z]+)(\d+)$/.exec(ref);
    if (!m) return null;
    var col = 0;
    for (var i = 0; i < m[1].length; i++) col = col * 26 + (m[1].charCodeAt(i) - 64);
    return { coluna: col - 1, linha: parseInt(m[2], 10) - 1 };
  }

  /* Junta todos os pedaços de texto de uma célula (ignora a pronúncia). */
  function textoDe(no) {
    var saida = '';
    var filhos = no.getElementsByTagName('t');
    for (var i = 0; i < filhos.length; i++) {
      var pai = filhos[i].parentNode;
      if (pai && pai.nodeName === 'rPh') continue;
      saida += filhos[i].textContent;
    }
    return saida;
  }

  /* ---------------------------------------------------------
     2. LER AS ABAS: devolve [{ nome, linhas, mesclas }]
        linhas = lista de linhas; cada linha é uma lista de valores
        (texto ou número). Valores de fórmulas são os já calculados.
     --------------------------------------------------------- */
  async function lerAbas(buffer) {
    var zip = await descompactar(buffer);

    var textoLivro = await zip.ler('xl/workbook.xml');
    if (!textoLivro) throw new Error('Isto não parece ser uma planilha do Excel.');
    var livro = xml(textoLivro);
    var ligacoes = xml(await zip.ler('xl/_rels/workbook.xml.rels'));

    var alvos = {};
    Array.prototype.forEach.call(ligacoes.getElementsByTagName('Relationship'), function (r) {
      alvos[r.getAttribute('Id')] = r.getAttribute('Target');
    });

    var compartilhados = [];
    if (zip.existe('xl/sharedStrings.xml')) {
      var docTextos = xml(await zip.ler('xl/sharedStrings.xml'));
      Array.prototype.forEach.call(docTextos.getElementsByTagName('si'), function (si) {
        compartilhados.push(textoDe(si));
      });
    }

    var abas = [];
    var lista = livro.getElementsByTagName('sheet');
    for (var s = 0; s < lista.length; s++) {
      var nomeAba = lista[s].getAttribute('name');
      var idLigacao = lista[s].getAttributeNS(
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id'
      ) || lista[s].getAttribute('r:id');
      var textoAba = await zip.ler(caminhoDaAba(alvos[idLigacao] || ''));
      if (!textoAba) continue;
      var doc = xml(textoAba);

      var linhas = [];
      Array.prototype.forEach.call(doc.getElementsByTagName('c'), function (c) {
        var pos = lerEndereco(c.getAttribute('r'));
        if (!pos) return;
        var tipo = c.getAttribute('t');
        var v = c.getElementsByTagName('v')[0];
        var valor = null;

        if (tipo === 'inlineStr') {
          valor = textoDe(c);
        } else if (v) {
          var bruto = v.textContent;
          if (tipo === 's')        valor = compartilhados[parseInt(bruto, 10)];
          else if (tipo === 'str') valor = bruto;
          else if (tipo === 'b')   valor = bruto === '1';
          else if (tipo === 'e')   valor = null;           // erro de fórmula (#N/A etc.)
          else                     valor = parseFloat(bruto);
        }
        if (valor === null || valor === undefined || valor === '') return;

        while (linhas.length <= pos.linha) linhas.push([]);
        linhas[pos.linha][pos.coluna] = valor;
      });

      var mesclas = [];
      Array.prototype.forEach.call(doc.getElementsByTagName('mergeCell'), function (m) {
        var partes = String(m.getAttribute('ref')).split(':');
        var a = lerEndereco(partes[0]), b = lerEndereco(partes[1] || partes[0]);
        if (a && b) mesclas.push({ c1: a.coluna, l1: a.linha, c2: b.coluna, l2: b.linha });
      });

      abas.push({ nome: nomeAba, linhas: linhas, mesclas: mesclas });
    }
    return abas;
  }

  /* ---------------------------------------------------------
     3. TRANSFORMAR AS ABAS EM PRESENTES
     --------------------------------------------------------- */
  function semAcento(t) {
    return String(t == null ? '' : t)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, ' ').trim().toLowerCase();
  }

  /* O nome da aba decide a seção do site. */
  var CATEGORIAS_DAS_ABAS = {
    'para o quarto':   'quarto',
    'para passear':    'passear',
    'para o soninho':  'soninho',
    'para vestir':     'vestir',
    'higiene e banho': 'higiene',
    'fraldas':         'fraldas',
    'alimentacao':     'alimentacao',
  };

  /* "R$ 1.234,50", "1234.5" ou o número 1234.5 viram 1234.5 */
  function lerPreco(valor) {
    if (typeof valor === 'number') {
      return isFinite(valor) && valor >= 0 ? Math.round(valor * 100) / 100 : 0;
    }
    var limpo = String(valor == null ? '' : valor).replace(/[^0-9,.-]/g, '').trim();
    if (!limpo) return 0;
    if (limpo.indexOf(',') !== -1) limpo = limpo.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(limpo);
    return isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : 0;
  }

  /* ---------------------------------------------------------
     Limpa o link: tira os códigos de rastreio que a Amazon e o
     Mercado Livre colam no endereço (centenas de letras que não
     mudam o produto). Mantém só o que escolhe a variação do
     produto (tamanho, cor, vendedor), para o preço continuar
     batendo com o da sua planilha.
     Só aceita endereços http(s); qualquer outra coisa é descartada.
     --------------------------------------------------------- */
  var PARTES_QUE_FICAM = ['pdp_filters', 'searchVariation', 'th', 'psc', 'variation'];

  function limparLink(texto) {
    var bruto = String(texto == null ? '' : texto).trim();
    if (!bruto) return '';

    var url;
    try { url = new URL(bruto); } catch (e) { return ''; }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';

    var dominio = url.hostname.toLowerCase();
    var ehLojaGrande = /(^|\.)amazon\.com\.br$/.test(dominio) ||
                       /(^|\.)mercadolivre\.com\.br$/.test(dominio);
    if (!ehLojaGrande) return bruto;

    var caminho = url.pathname.split('/ref=')[0];
    var ficam = url.search.slice(1).split('&').filter(function (par) {
      return PARTES_QUE_FICAM.indexOf(par.split('=')[0]) !== -1;
    });
    return url.origin + caminho + (ficam.length ? '?' + ficam.join('&') : '');
  }

  /* Interpreta as abas. Devolve { presentes, avisos }. */
  function montarPresentes(abas) {
    var presentes = [];
    var avisos = [];
    var vistos = {};

    abas.forEach(function (aba) {
      var linhas = aba.linhas;
      var titulos = (linhas[0] || []).map(semAcento);
      var col = {
        nome:  titulos.indexOf('nome'),
        link:  titulos.indexOf('link'),
        preco: titulos.findIndex(function (t) { return t === 'preco' || t === 'valor'; }),
        total: titulos.findIndex(function (t) { return t === 'quantidade' || t === 'total'; }),
      };
      if (col.nome === -1) {
        avisos.push('A aba "' + aba.nome + '" não tem a coluna "Nome" na primeira linha e foi ignorada.');
        return;
      }

      var categoria = CATEGORIAS_DAS_ABAS[semAcento(aba.nome)];
      if (!categoria) {
        categoria = 'outros';
        avisos.push('A aba "' + aba.nome + '" não é uma das categorias conhecidas; ' +
                    'seus itens foram para "Outros".');
      }

      /* Linhas em que o nome está mesclado = opções do mesmo item. */
      var grupos = {};   // linha -> { primeira, quantas }
      aba.mesclas.forEach(function (m) {
        if (m.c1 <= col.nome && col.nome <= m.c2 && m.l2 > m.l1) {
          for (var l = m.l1; l <= m.l2; l++) {
            grupos[l] = { primeira: m.l1, quantas: m.l2 - m.l1 + 1 };
          }
        }
      });

      for (var i = 1; i < linhas.length; i++) {
        var linha = linhas[i] || [];
        var nome = String(linha[col.nome] == null ? '' : linha[col.nome]).replace(/\s+/g, ' ').trim();

        // Dentro de um grupo mesclado, o nome só está na primeira linha.
        var g = grupos[i];
        if (g) {
          nome = String((linhas[g.primeira] || [])[col.nome] || '').replace(/\s+/g, ' ').trim();
          if (nome) nome += ' (opção ' + (i - g.primeira + 1) + ')';
        }
        if (!nome) continue;

        var chave = semAcento(nome);
        if (vistos[chave]) {
          avisos.push('"' + nome + '" aparece mais de uma vez; só a primeira foi usada.');
          continue;
        }
        vistos[chave] = true;

        var total = col.total !== -1 ? parseInt(linha[col.total], 10) : NaN;
        var link = col.link !== -1 ? limparLink(linha[col.link]) : '';
        if (col.link !== -1 && linha[col.link] && !link) {
          avisos.push('O link de "' + nome + '" não é um endereço válido e foi deixado em branco.');
        }

        presentes.push({
          nome: nome,
          categoria: categoria,
          total: total >= 1 ? total : 1,
          preco: col.preco !== -1 ? lerPreco(linha[col.preco]) : 0,
          link: link,
          descricao: '',
          foto: '',
          ordem: presentes.length,
        });
      }
    });

    return { presentes: presentes, avisos: avisos };
  }

  /* ---------------------------------------------------------
     O que o painel usa: entrega o arquivo, recebe a lista.
     --------------------------------------------------------- */
  async function lerPlanilhaDePresentes(buffer) {
    return montarPresentes(await lerAbas(buffer));
  }

  window.lerPlanilhaDePresentes = lerPlanilhaDePresentes;
})();
