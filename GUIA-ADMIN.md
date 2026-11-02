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
| Confirmações | Quantas pessoas preencheram o formulário (uma pessoa pode trazer quatro). |
| Presentes com dono | Quantos itens já têm alguém para levar, do total da lista. |

### As três abas

**Presentes** — a lista inteira, com o estoque de cada item.

**Confirmações** — quem avisou que vem, com quantas pessoas e o telefone,
se tiver preenchido.

**Quem leva o quê** — qual convidado marcou cada presente, com o recado
que ele deixou.

## As tarefas do dia a dia

### Acrescentar um presente

Na aba **Presentes**, toque em **Adicionar presente** para abrir o
formulário. O nome e a quantidade são obrigatórios; o resto é opcional.

O campo **Foto** espera o nome de um arquivo que já esteja dentro do site,
por exemplo `img/presentes/fralda.webp`. Se deixar em branco, o presente
aparece com um quadradinho colorido e a inicial do nome — e fica bonito
do mesmo jeito.

### Corrigir ou mudar um presente

Toque em **Editar** na linha do presente. Se você aumentar a quantidade,
o site soma a diferença ao que ainda está disponível, sem mexer em quem
já marcou.

### Alguém avisou pelo WhatsApp que vai levar algo

Esse é o caso mais comum. Sua tia te manda mensagem dizendo que leva as
fraldas, mas não entra no site.

Toque no botão **−** na linha daquele presente. O estoque baixa 1 e o item
some da lista dos convidados quando chegar a zero. O botão **+** faz o
contrário, se a pessoa desistir.

A diferença entre o **−** e a marcação do convidado: o **−** só mexe no
número. O nome da sua tia não vai aparecer na aba "Quem leva o quê",
porque ela não preencheu nada no site. Anote à parte se precisar.

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

**Dois convidados podem marcar o último item ao mesmo tempo?**
Não. O banco de dados trata o "conferir e descontar" como um passo único,
então o segundo recebe um aviso de que o item acabou.

**Posso dar acesso para outra pessoa?**
Sim, criando outro login no Firebase. Me chame que eu explico.
