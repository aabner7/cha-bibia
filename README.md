# Chá da Bibia — site do convite

Site do convite, confirmação de presença, lista de presentes e área
administrativa. Veja o passo a passo de publicação e o guia de uso
mais abaixo (ainda em construção).

## Onde mexer

| Quero mudar... | Arquivo |
|---|---|
| Cores, fontes, desenhos | `public/css/tema.css` |
| Data, horário, endereço | `public/js/evento.js` |
| Textos do convite | `public/index.html` |
| Lista de presentes inicial | `public/dados/presentes-iniciais.json` |
| Configuração do Firebase | `public/js/firebase-config.js` (só depois de criar o projeto) |
| Chave Pix, nome e cidade | `public/js/pix-config.js` |
| Preços dos presentes | Área administrativa → Presentes → Importar planilha |
| Regras de segurança do banco | `firestore.rules` |

Os presentes são por Pix: o convidado escolhe um item e o site mostra o QR
code já com o valor certo. A conferência do pagamento é feita por você, na
área administrativa.

Decisões tomadas e o motivo de cada uma: `DECISOES.md`.
Guia da área administrativa: `GUIA-ADMIN.md`.
