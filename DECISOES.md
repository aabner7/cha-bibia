# Decisões do projeto

Lista das escolhas que eu tomei sozinha(o) durante a construção do site,
com o motivo de cada uma em uma frase. Nada aqui muda o resultado final
que você pediu — são escolhas de "como fazer", não de "o que fazer".

## Etapa A — estrutura e página de convite

| # | Decisão | Por quê |
|---|---------|---------|
| 1 | Site em HTML, CSS e JavaScript simples, sem framework (React, Vue etc.) | Você não precisa instalar nada além de Node.js e Firebase CLI, e o site abre rápido no celular pelo WhatsApp. |
| 2 | Pasta `public/` com uma página por assunto (`index`, `confirmar`, `presentes`, `admin`) | Cada parte do site é um arquivo separado, fácil de achar e de mexer sem quebrar as outras. |
| 3 | Dois arquivos de estilo: `tema.css` (cores e fontes) e `site.css` (posicionamento) | Quando a identidade visual chegar, mexemos só no `tema.css` e nada de estrutura precisa ser refeito. |
| 4 | Dados do evento concentrados em `js/evento.js` | Data, horário e endereço ficam escritos uma vez só, então não há risco de uma página mostrar uma data e outra mostrar outra. |
| 5 | Mapa pelo endereço de texto (`google.com/maps?q=...&output=embed`) | Esse formato do Google Maps funciona sem chave de API e sem custo, como você pediu. |
| 6 | ~~Fontes Quicksand e Nunito Sans~~ (substituída pela decisão 12) | Combinação neutra e acolhedora, trocável em uma linha do `tema.css` quando a arte da sua amiga chegar. |
| 7 | ~~Modo escuro~~ (removido, ver decisão 19) | Boa parte dos convidados abre o WhatsApp com o celular no modo escuro; sem isso o convite "estoura" de branco à noite. |
| 8 | Prazo sugerido de confirmação: 1º de dezembro | Deixa uma semana entre a última confirmação e o evento para organizar comida e espaço; é só me avisar se preferir outra data. |
| 9 | Fotos dos presentes guardadas dentro do site (`public/img/presentes/`) | O Firebase Hosting guarda arquivos sem custo no plano gratuito, então as fotos não dependem de links de loja que podem sair do ar. |
| 10 | `cleanUrls` ligado no Firebase Hosting | Os endereços ficam mais bonitos para compartilhar (`.../presentes` em vez de `.../presentes.html`). |

## Etapa A.2 — identidade visual da designer

| # | Decisão | Por quê |
|---|---------|---------|
| 11 | Paleta oficial (7 cores) guardada no `tema.css` com os nomes `--paleta-*`, e cada "papel" no site aponta para uma delas | Se a designer ajustar um tom, muda em um lugar só e vale para o site inteiro. |
| 12 | Fontes Gluten (títulos) e Roboto Mono (todo o resto, inclusive data, horário e endereço) | Segue a prancha de tipografia da designer, onde os textos corridos também aparecem em Roboto Mono. |
| 13 | Fontes guardadas dentro do site (`public/fonts/`) em vez de buscadas no Google | O convite abre mais rápido, não depende de serviço externo e não envia dados dos convidados ao Google; ambas têm licença livre (OFL). |
| 14 | Ilustrações do Chico extraídas do PDF como WebP com fundo transparente (cerca de 100 KB cada) | O PDF original tem 9 MB e pesaria no celular de quem abre pelo WhatsApp; sem fundo, o desenho "flutua" sobre o creme. |
| 15 | Um Chico por página: Chico 01 no convite, Chico 03 na confirmação de presença e Chico 02 na lista de presentes | Pedido da família: cada página tem o seu desenho, sem repetir. |
| 16 | Botões em vermelho com letra grande e em negrito | O vermelho da marca com letra pequena e clara é difícil de ler (contraste 3,1:1); em letra grande atinge o mínimo recomendado de legibilidade. |
| 17 | Links, números do contador e texto pequeno em marrom, não em vermelho | O marrom da paleta tem contraste alto (7:1) sobre o creme, então fica legível ao ar livre no celular. |
| 18 | Avisos de sucesso e de erro usam um verde e um vermelho um pouco mais escuros que os da paleta | Os tons originais ficam claros demais para letras pequenas; os escurecidos mantêm a mesma "cara". |
| 19 | Modo escuro removido | A identidade é de papel creme com aquarela; no fundo escuro os desenhos perderiam a harmonia. |
| 20 | Logo removida do código | A identidade entregue não traz logo; as ilustrações do Chico fazem esse papel. Se vier uma logo, é só acrescentar. |
| 21 | Nome do evento passou a ser "Chá da Bibia" em todas as páginas e o convite abre com "Chico, o irmão mais velho, te convida para o" | Pedido da família; o texto do convite continua falando da Beatriz, como você escreveu. |

## Etapa C — lista de presentes

| # | Decisão | Por quê |
|---|---------|---------|
| 22 | Presentes agrupados em 6 categorias (Banho, Pele, Hora da troca, Cabelo e unhas, Narizinho, Higiene bucal) | 17 itens numa lista corrida cansam no celular; agrupado, o convidado acha rápido o que quer levar. |
| 23 | Quantidades iniciais: 1 para os itens únicos (escova, tesourinha, aspirador) e mais para os de consumo (fralda 6, algodão 4, lenço 4) | Chute inicial para a lista funcionar; você ajusta cada número na área administrativa. |
| 24 | Presente sem foto mostra um quadradinho colorido com a inicial | A lista fica bonita e organizada mesmo sem nenhuma foto, então as fotos deixam de ser obrigatórias. |
| 25 | Código do convidado com 6 caracteres, sem O/0 e I/1 | Muita gente vai anotar no papel ou ditar pelo telefone, e esses caracteres se confundem. |
| 26 | O código é o próprio "nome" do documento da reserva no banco | Permite uma regra de segurança simples: quem sabe o código alcança a própria reserva, e ninguém consegue listar as reservas dos outros. |
| 27 | Nome do convidado vem preenchido se ele já confirmou presença | O navegador dele guardou o nome; evita digitar duas vezes. |
| 28 | A lista inicial fica no arquivo `public/dados/presentes-iniciais.json` | Serve para mostrar a página antes do Firebase existir e, depois, para importar tudo de uma vez pela área administrativa. |
| 29 | Ao desfazer, o estoque volta no máximo até o total cadastrado | Sem Cloud Functions não dá para o banco conferir o código sozinho; o limite impede que alguém "crie" estoque do nada, e você vê todas as reservas no admin. |

## Etapa D — área administrativa

| # | Decisão | Por quê |
|---|---------|---------|
| 30 | A área administrativa é uma página do próprio site (`/admin`), não um programa à parte | Nada para instalar: abre no navegador do celular ou do computador, e já vai ao ar junto com o resto. |
| 31 | Nenhum link para a `/admin` em lugar nenhum do site, mais a marca "noindex" | Os convidados nunca chegam lá por acidente e a página não aparece em buscas do Google. |
| 32 | Quem guarda e confere a senha é o Firebase Authentication | A senha nunca fica escrita em nenhum arquivo do site, nem mesmo embaralhada. |
| 33 | Três abas (Presentes, Confirmações, Quem leva o quê) e três números-resumo no topo | No celular, uma tela só com tudo ficaria longa demais; o resumo responde "quantas pessoas vêm?" sem precisar rolar. |
| 34 | Botões **−** e **+** em cada presente, separados do botão Editar | O ajuste de estoque na mão é a tarefa mais frequente (gente que avisa pelo WhatsApp) e merece estar a um toque. |
| 35 | Ao aumentar o total de um presente, o disponível sobe junto; quem já marcou é preservado | Evita que uma correção de quantidade apague as escolhas já feitas pelos convidados. |
| 36 | Excluir um presente já marcado pede confirmação, com o número de pessoas afetadas | É a única ação que não dá para desfazer. |
| 37 | CSV com ponto e vírgula e marca de acentuação (BOM) | É o formato que o Excel em português abre com um duplo clique, sem janela de importação e sem acento quebrado. |
| 38 | Botão "Importar lista inicial", que só aparece quando a lista está vazia | Cadastrar 17 itens na mão seria cansativo; e, uma vez cadastrados, o botão some para não duplicar. |
| 39 | A área administrativa também tem modo demonstração | Você conhece a página e decide o que mudar antes de criar a conta no Firebase. |
