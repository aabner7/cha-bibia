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

## Etapa E — presentes por Pix

| # | Decisão | Por quê |
|---|---------|---------|
| 40 | O código Pix é montado pelo próprio site, a partir da chave aleatória, e não o código pronto que o banco gerou | O código pronto não tinha valor e era igual para todos; gerando aqui, cada presente sai com o preço certo já embutido. |
| 41 | A chave, o nome e a cidade ficam só em `public/js/pix-config.js` | Trocar a chave no futuro é mexer em um arquivo e publicar, sem caçar o valor espalhado pelo código. |
| 42 | Chave aleatória em vez de CPF ou telefone | A chave fica visível no site; a aleatória recebe dinheiro sem identificar você nem dar acesso à conta. |
| 43 | Biblioteca do QR code (qrcode-generator, licença MIT) guardada dentro do site, em `public/js/vendor/` | Mesma razão das fontes: o convite não depende de outro serviço no ar e abre rápido no celular. |
| 44 | O QR code é desenhado no celular de quem olha, sem chamar nenhum serviço | Nenhum dado de convidado ou de pagamento sai para terceiros. |
| 45 | A chave Pix só aparece depois que o convidado escolhe um presente | Reduz a chance de alguém de fora copiar a chave só por abrir a página. |
| 46 | "Já fiz o Pix" grava apenas um aviso (`avisouPix`), e nunca o status de recebido | Pelas regras do banco, só a administradora logada marca "recebido", então ninguém consegue fingir pagamento. |
| 47 | A liberação de um presente parado há mais de 24 horas é manual, com aviso no topo da aba | A liberação automática exigiria Cloud Functions e o plano Blaze com cartão; e quem pagou sem avisar não perde o presente por descuido do site. |
| 48 | Presente com preço zero aparece como "Em breve", sem botão | Evita gerar um Pix de R$ 0,00 enquanto os preços não forem preenchidos. |
| 49 | Importação por planilha CSV com as colunas NOME, LINK e PRECO | Preencher 35 preços na mão seria cansativo; a planilha também serve para trocar a lista inteira de uma vez. |
| 50 | A importação apaga o que sobrou só depois de confirmação, listando os nomes e avisando quais já foram escolhidos | Apagar presente já escolhido por alguém não tem volta. |
| 51 | A importação entende preço em qualquer formato (`89,90`, `R$ 89,90`, `1.249,00`) e separador `;` ou `,` | O arquivo sai diferente do Excel e do Google Planilhas, e a pessoa não deveria ter que saber disso. |
| 52 | A exportação de presentes usa as mesmas colunas NOME, LINK e PRECO | Dá para baixar, corrigir no Excel e subir de volta, sem montar planilha do zero. |
| 53 | Valores no CSV saem com vírgula decimal | É assim que o Excel em português entende como dinheiro e consegue somar. |
| 54 | Marcação `v1` no Git antes de começar | Ponto de retorno, caso a mudança para Pix precise ser desfeita. |

## Etapa F — planilha .xlsx no lugar do CSV

| # | Decisão | Por quê |
|---|---------|---------|
| 55 | O painel passou a receber o arquivo `.xlsx` da própria lista de presentes (uma aba por categoria) e o envio de CSV foi retirado | É o arquivo que você mantém e organiza; assim não precisa converter nada. |
| 56 | O arquivo é lido dentro do navegador, por um leitor próprio e pequeno (`js/leitor-xlsx.js`), sem biblioteca de terceiros | Mantém o site leve, sem peça externa para ficar desatualizada, e o arquivo não sai do seu aparelho. |
| 57 | O nome da aba decide a seção do site; seções antigas (Banho, Pele...) foram trocadas pelas 7 da planilha | A sua organização por abas passa a ser a organização que o convidado vê. |
| 58 | Preço de fórmula é lido pelo valor que o Excel mostra | Na planilha o preço vem de uma fórmula; o valor calculado é o que você vê na tela. |
| 59 | Nome mesclado em duas linhas vira "Nome (opção 1)" e "(opção 2)" | O site identifica o presente pelo nome; sem diferenciar, o segundo lençol seria tratado como repetido e descartado. |
| 60 | Links da Amazon e do Mercado Livre perdem os códigos de rastreio, mas mantêm o que escolhe variação (tamanho, cor, vendedor) | Os endereços colados do navegador têm centenas de letras de rastreio; limpar deixa o link curto sem trocar o produto do preço. |
| 61 | Só links `http`/`https` são aceitos | Impede que uma célula com outro tipo de endereço vire um link perigoso no site. |
| 62 | Item sem preço aparece como "Em breve" e o painel avisa quantos ficaram assim | Evita que alguém escolha um presente sem Pix com valor definido. |
| 63 | Corrigido: "Importar lista inicial" agora leva também o preço | Antes o botão cadastrava os itens sem preço. |
| 64 | Presente sem preço virou "Vou levar este": sem Pix, o convidado só deixa o nome e o item é marcado como escolhido | As roupinhas não terão preço; o convidado compra e leva, e a lista continua evitando presentes repetidos. |
| 65 | A escolha sem preço é guardada com valor 0, usando o mesmo desenho do banco e as mesmas regras de segurança | Não foi preciso mexer nas regras do banco nem publicar nada novo nelas. |
| 66 | No painel, escolhas sem preço têm selo próprio e ficam fora dos totais de dinheiro, do aviso das 24 horas e do botão "Recebi o Pix" | Senão elas apareceriam como Pix atrasado, que não existe para esses itens. |
| 67 | Mesmo nome em mais de uma linha da mesma aba vira "Nome (opção 1)", "(opção 2)" (antes só valia para células mescladas) | A planilha nova trouxe os lençóis em linhas separadas; o site descartava a segunda opção. |
| 68 | A demonstração do painel deixou de inventar preços para itens sem preço | Para você ver na demonstração o comportamento real de "vou levar". |
| 69 | Na lista dos convidados, as categorias viraram botões (abas) no topo e só a categoria escolhida aparece de cada vez | Com 67 itens, a rolagem única ficava longa; assim o convidado vai direto ao que procura, e as categorias seguem a ordem das abas da planilha. |
| 70 | A aba escolhida é mantida quando o convidado escolhe ou desfaz um presente | Senão a lista voltaria para a primeira categoria a cada ação. |
| 71 | No painel, a lista de presentes passou a ter um título por categoria, com a contagem de itens | Fica fácil achar um item e conferir quantos há em cada aba. |
| 72 | Cartão "Prefere mandar outro valor?" no fim da lista, com um aviso no cartão de abertura que leva até ele | Quem quer ajudar com um valor que não está na lista tem para onde ir, sem poluir a lista de presentes. |
| 73 | O valor livre não é guardado no banco: o código Pix é montado no celular de quem digita | Não precisa de regra nova no banco nem de publicar nada além do site; o Pix cai na conta como qualquer outro. |
| 74 | Valor livre aceito de R$ 1,00 a R$ 10.000,00, escrito do jeito que a pessoa preferir (`50`, `50,5`, `R$ 1.250,00`) | Evita valores sem sentido e erros de digitação sem exigir um formato rígido. |
| 75 | Texto de abertura da lista de presentes trocado pelo texto escrito pela família, palavra por palavra | Pedido da família. |
| 76 | Nos itens sem Pix (roupinhas) o convidado informa a quantidade que vai levar, de 1 até o que ainda falta | O texto promete "se forem 04 calças, marcar que irá levar 4x"; sem isso o site contabilizaria 1 só. |
| 77 | O campo de quantidade não aparece nos itens por Pix nem quando só resta 1 unidade | Evita pergunta desnecessária: Pix é uma escolha por vez e, com 1 unidade, só pode ser 1. |
| 78 | A escolha guarda a quantidade (`quantidade`); escolhas antigas, sem o campo, valem 1 | Ao desfazer ou liberar, o estoque volta com a quantidade certa. |
| 79 | Regra do estoque no banco passou de "exatamente 1 unidade" para "qualquer mudança dentro de 0 até o total" | Sem isso o banco recusaria tirar 4 calças de uma vez. O limite de 0 até o total e a proteção do preço continuam; é um pouco mais frouxa, e você corrige qualquer exagero com os botões − e + do painel. |
| 80 | Texto do convite atualizado ("e que já amam muito a Bibia" e "junto da gente!!") | Pedido da família. |
| 81 | Prazo de confirmação passou para 21 de novembro (antes: 1º de dezembro; ver decisão 8) | Pedido da família. |
| 82 | O formulário de confirmação não pergunta mais quantas pessoas vão; cada confirmação vale 1 pessoa | O convite é nominal, não livre: só o nome de quem confirma. |
| 83 | O site continua gravando `pessoas: 1` em cada confirmação | Assim as regras do banco não mudam (não precisa publicá-las de novo) e o total do painel continua somando certo, inclusive com as confirmações antigas. |

