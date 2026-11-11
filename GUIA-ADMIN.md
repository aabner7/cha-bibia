# Guia da área administrativa

Guia curto da página que só você acessa.

## Como entrar

1. Abra o endereço do site e acrescente `/admin` no final.
   Exemplo: `https://cha-da-bibia.web.app/admin`
2. Digite seu e-mail e sua senha.
3. Pronto.

Guarde esse endereço nos favoritos do celular. **Não mande esse link para
ninguém** e não o coloque em grupo de WhatsApp. Não existe link para esta
página em lugar nenhum do site, então os convidados nunca chegam nela
por acidente.

O site lembra do seu login neste aparelho. Para sair de vez, toque em
**Sair**, no canto de cima.

## O que aparece na tela

### As três caixas do topo

| Caixa | O que significa |
|---|---|
| Pessoas confirmadas | Quantas pessoas confirmaram. O convite é nominal: cada confirmação vale uma pessoa. É o número para calcular comida. |
| Presentes escolhidos | Quantos itens já têm alguém, do total da lista. |
| Recebido | A soma dos Pix que você já confirmou que caíram na conta. |
| Aguardando Pix | A soma do que foi escolhido mas ainda não foi confirmado por você. |

### As três abas

**Presentes** — a lista inteira, com o estoque de cada item.

**Confirmações** — quem avisou que vem, com o telefone, se tiver preenchido.
O formulário pede só o nome (e o telefone, que é opcional): ninguém informa
quantas pessoas vêm junto. Confirmações antigas, feitas quando o formulário ainda
perguntava isso, mostram o número que foi informado na época.

**Presentes e Pix** — quem escolheu cada presente, o valor, o recado e a
situação do pagamento.

## As tarefas do dia a dia

### Conferir os Pix que chegaram

Essa é a tarefa principal depois que o convite estiver no ar.

O site **não consegue** saber sozinho se o Pix caiu: nenhum banco avisa um
site gratuito. Então o passo é manual e leva poucos segundos:

1. Abra o extrato do seu banco e veja os Pix recebidos.
2. Na aba **Presentes e Pix**, ache a linha com o mesmo valor e nome.
3. Toque em **Recebi o Pix**.

A linha passa a mostrar **✓ recebido** e o valor entra no total de recebidos.
Se marcar errado, toque em **Desmarcar**.

Cada linha mostra uma destas situações:

| Situação | O que quer dizer |
|---|---|
| Aguardando Pix | A pessoa escolheu o presente e ainda não avisou nada. |
| Avisou que pagou | A pessoa tocou em "Já fiz o Pix". É só um aviso dela, não é comprovação. |
| Sem Pix há +24h | Passou um dia e nada caiu. Veja se quer liberar o item. |
| ✓ recebido | Você conferiu no banco e marcou. |

### Quando o Pix não vem

Se alguém escolheu um presente e sumiu, o item fica preso e ninguém mais
consegue escolher. Para soltar, toque em **Liberar item** naquela linha.
O presente volta para a lista e a escolha da pessoa é cancelada.

O site avisa no topo da aba quando há escolhas paradas há mais de 24 horas,
mas não libera nada sozinho: quem decide é você. Isso é de propósito,
porque alguém pode ter pago e só não ter avisado.

### Trocar a lista inteira por uma planilha

Na aba **Presentes**, toque em **Importar planilha** e escolha o arquivo
**.xlsx** (o do Excel). Se a sua planilha estiver no Google Planilhas, baixe
em *Arquivo > Fazer download > Microsoft Excel (.xlsx)*.

Como a planilha deve ser:

- **Uma aba para cada categoria.** O nome da aba vira a seção do site. As abas
  que o site conhece são: *Para o quarto*, *Para passear*, *Para o soninho*,
  *Para vestir*, *Higiene e Banho*, *Fraldas* e *Alimentação*. Uma aba com outro
  nome vai para a seção "Outros" (e o site avisa).
- **Primeira linha de cada aba com os títulos** *Nome*, *Link*, *Preço* e
  *Quantidade*. A ordem das colunas não importa, e *Link* e *Preço* podem nem
  existir na aba (como em *Para vestir* e *Fraldas*).
- **O preço pode ser digitado ou vir de fórmula.** O site lê o valor que o
  Excel está mostrando.
- **Duas opções do mesmo item:** se você mesclar a célula do nome em duas linhas
  (como nos lençóis), cada linha vira uma opção: "Lençol (opção 1)" e
  "Lençol (opção 2)", cada uma com o seu link e o seu preço.

O que acontece:

- Presente que **já existe** (pelo nome): o preço, o link, a quantidade e a
  seção são atualizados. Quem já escolheu o presente é preservado.
- Presente que **não existe**: é criado.
- Presente que **sumiu da planilha**: o site mostra a lista deles e pergunta
  antes de apagar. Se você cancelar, nada é apagado.

Dois cuidados:

- **Mudou o nome de um item na planilha?** O site entende como outro item:
  cria o novo e pergunta se apaga o antigo. Para corrigir um erro de digitação
  sem perder as escolhas já feitas, corrija direto no site (botão **Editar**).
- **Item sem preço** não tem Pix. No lugar do botão "Presentear", o convidado vê
  **"Vou levar este"**: ele deixa o nome, o site marca o item como escolhido (para
  ninguém repetir) e avisa que ele mesmo compra e leva no chá. É o caso das
  roupinhas. Se você esquecer de preencher o preço de um item que deveria ter Pix,
  ele também vira "Vou levar este"; depois de importar, o site diz quantos itens
  ficaram sem preço, então vale conferir esse número.
- **Duas linhas com o mesmo nome na mesma aba** (como os lençóis) viram
  "Nome (opção 1)" e "Nome (opção 2)", cada uma com o seu link e preço.

Os links grandes da Amazon e do Mercado Livre são encurtados sozinhos: o site
tira os códigos de rastreio que não mudam o produto e mantém o que escolhe
tamanho, cor ou vendedor. Os links curtos (`link.amazon/...`) ficam como estão.

O botão **Baixar presentes em Excel** gera um arquivo de conferência (CSV) com
o que está no site, as quantidades já escolhidas e o que ainda falta. Ele serve
para olhar e somar, não para subir de volta: a planilha que sobe é a sua.

### Como as categorias aparecem

- **Para os convidados:** botões com o nome de cada categoria ficam no topo da
  lista, e só os presentes da categoria escolhida aparecem. A ordem é a das abas da
  sua planilha: Para o quarto, Para passear, Para o soninho, Para vestir, Higiene e
  banho, Fraldas e Alimentação.
- **No painel:** a aba **Presentes** mostra um título para cada categoria, com
  quantos itens ela tem.

A categoria de cada presente vem do nome da aba da planilha. Para mudar um item de
categoria, mude de aba na planilha e suba de novo, ou use o botão **Editar**.

### Pix de outro valor

No fim da lista de presentes existe o cartão **Prefere mandar outro valor?**. A
pessoa digita quanto quer mandar (de R$ 1,00 a R$ 10.000,00) e o site mostra o
QR code e o código Pix com esse valor.

Esses Pix **não aparecem no painel**, porque não passam pelo banco de dados do site.
Para saber quem mandou e quanto, olhe o extrato do seu banco: o Pix mostra o nome de
quem pagou.

### Quantidade nas roupinhas

Nos itens sem preço que têm mais de uma unidade (como "Calça P", com 8), o
convidado informa **quantas unidades vai levar** e o site tira essa quantidade do
que falta. Quem leva 4 calças marca 4 de uma vez.

Na aba **Presentes e Pix** a escolha aparece com a quantidade ao lado do nome
(por exemplo, "Calça P (4x)"), e o arquivo baixado tem a coluna **Quantidade**.
Se você tocar em **Liberar item**, as 4 unidades voltam para a lista.

**Atenção ao publicar:** esta mudança mexe nas regras do banco. É preciso publicar
o site **e** as regras juntos, com `firebase.cmd deploy --only hosting,firestore:rules`.
Só o site, sem as regras, faz as escolhas darem erro.

### Escolhas "vai levar o presente"

Na aba **Presentes e Pix**, as escolhas de itens sem preço aparecem com o selo
**vai levar o presente**. Elas não têm valor, não entram nos totais de dinheiro,
não geram o aviso de "sem Pix há mais de 24 horas" e não têm botão "Recebi o Pix".
Se a pessoa desistir, ela mesma desfaz com o código; e você também pode tocar em
**Liberar item**. No arquivo baixado, a situação aparece como "Vai levar o presente".

### Acrescentar um presente

Na aba **Presentes**, toque em **Adicionar presente** para abrir o
formulário. O nome e a quantidade são obrigatórios; o resto é opcional.

O campo **Preço** é o valor que vai dentro do Pix do convidado. Se ficar em
zero, o presente aparece na lista como "Em breve" e ninguém consegue
escolher.

O campo **Foto** espera o nome de um arquivo que já esteja dentro do site,
por exemplo `img/presentes/fralda.webp`. Se deixar em branco, o presente
aparece com um quadradinho colorido e a inicial do nome — e fica bonito
do mesmo jeito.

### Corrigir ou mudar um presente

Toque em **Editar** na linha do presente. Se você aumentar a quantidade,
o site soma a diferença ao que ainda está disponível, sem mexer em quem
já marcou.

### Alguém mandou o Pix por fora, ou vai levar o presente na mão

Sua tia te manda o Pix direto, sem entrar no site, ou avisa que vai comprar
e levar o item.

Toque no botão **−** na linha daquele presente, na aba **Presentes**. O
estoque baixa 1 e o item some da lista quando chegar a zero. O botão **+**
faz o contrário, se ela desistir.

A diferença entre o **−** e a escolha feita no site: o **−** só mexe no
número. O nome dela não vai aparecer na aba "Presentes e Pix" nem entrar no
total recebido, porque ela não passou pelo site. Anote à parte se precisar.

### Tirar um presente da lista

Toque em **Excluir**. Se alguém já tiver marcado aquele item, o site avisa
antes de apagar.

### Começar a lista do zero

Se a lista estiver vazia, aparece o botão **Importar lista inicial**, que
cadastra de uma vez os itens já combinados. Use uma vez só.

## Baixar as listas para o Excel

Cada aba tem um botão que baixa um arquivo `.csv`. É só tocar e abrir o
arquivo baixado: o Excel entende sozinho, com acentos e colunas no lugar.

A planilha de confirmações já traz o total de pessoas somado na última linha.

## Perguntas comuns

**Esqueci a senha.**
Na página de login do Firebase dá para pedir uma nova por e-mail. Se
preferir, me chame que eu te mostro o caminho.

**Posso entrar pelo celular e pelo computador?**
Pode, ao mesmo tempo inclusive. É a mesma conta.

**Dois convidados podem escolher o último item ao mesmo tempo?**
Não. O banco de dados trata o "conferir e descontar" como um passo único,
então o segundo recebe um aviso de que o item acabou.

**Alguém pode marcar o próprio Pix como recebido?**
Não. Só quem está logado nesta área consegue mudar a situação para
"recebido". O convidado só consegue dizer "já fiz o Pix", que é um aviso,
e não uma confirmação.

**Preciso trocar minha chave Pix. E agora?**
A chave fica em um arquivo só: `public/js/pix-config.js`. É só trocar a
chave ali e publicar o site de novo. Me peça que eu faço.

**O valor do Pix pode ser alterado pelo convidado?**
O valor já vai dentro do QR code e do código copiado, então o aplicativo do
banco mostra o valor certo. Ainda assim, confira o extrato: nada impede
alguém de mandar um Pix avulso de outro valor.

**Posso dar acesso para outra pessoa?**
Sim, criando outro login no Firebase. Me chame que eu explico.
