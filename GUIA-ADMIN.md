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
| Pessoas confirmadas | O total somado de gente que vem. É o número para calcular comida. |
| Presentes escolhidos | Quantos itens já têm alguém, do total da lista. |
| Recebido | A soma dos Pix que você já confirmou que caíram na conta. |
| Aguardando Pix | A soma do que foi escolhido mas ainda não foi confirmado por você. |

### As três abas

**Presentes** — a lista inteira, com o estoque de cada item.

**Confirmações** — quem avisou que vem, com quantas pessoas e o telefone,
se tiver preenchido.

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

Na aba **Presentes**, toque em **Importar planilha**.

A planilha precisa ter, na primeira linha, os títulos **NOME**, **LINK** e
**PRECO**. A ordem não importa, e pode ter outras colunas, como CATEGORIA
ou QUANTIDADE.

Exemplo:

```
NOME;LINK;PRECO
Berço portátil;https://loja.com/berco;1249,00
Lençol de berço;https://loja.com/lencol;89,90
```

O preço pode estar escrito de qualquer jeito: `89,90`, `R$ 89,90` ou
`1.249,00`. O site entende todos.

O que acontece:

- Presente que **já existe** (pelo nome): o preço e o link são atualizados.
- Presente que **não existe**: é criado.
- Presente que **sumiu da planilha**: o site mostra a lista deles e pergunta
  antes de apagar. Se você cancelar, nada é apagado.

Dica: o botão **Baixar presentes em Excel** gera uma planilha já com as
colunas certas. Dá para baixar, corrigir os preços no Excel e subir de volta.

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
