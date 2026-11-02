/* ============================================================
   CONFIGURAÇÃO DO FIREBASE
   ------------------------------------------------------------
   AQUI É ONDE VOCÊ COLA OS DADOS DO SEU PROJETO FIREBASE.
   O passo a passo de onde achar isso está no README.md.

   IMPORTANTE: estes dados NÃO são senha. Eles são o "endereço"
   do seu banco de dados e podem ficar visíveis no site sem
   problema — é assim que o Firebase funciona. Quem protege os
   dados são as regras do arquivo firestore.rules, não estes
   valores. Senha mesmo, só a do seu login de administradora,
   que nunca aparece no código.

   Enquanto os valores abaixo estiverem com "COLE_AQUI", o site
   funciona em MODO DEMONSTRAÇÃO: os formulários aparecem e
   respondem normalmente, mas nada é salvo. Serve para você ver
   o visual antes de criar o projeto no Firebase.
   ============================================================ */

window.FIREBASE_CONFIG = {
  apiKey:            'COLE_AQUI',
  authDomain:        'COLE_AQUI',
  projectId:         'COLE_AQUI',
  storageBucket:     'COLE_AQUI',
  messagingSenderId: 'COLE_AQUI',
  appId:             'COLE_AQUI',
};

/* Daqui para baixo não precisa mexer. ---------------------- */

window.firebaseEstaConfigurado = function () {
  return String(window.FIREBASE_CONFIG.apiKey).indexOf('COLE_AQUI') === -1;
};

/* Carrega o Firebase só quando ele é realmente necessário.
   Assim o site abre rápido e o modo demonstração funciona
   mesmo sem internet. */
window.carregarFirestore = async function () {
  if (!window.firebaseEstaConfigurado()) return null;
  if (window.__firestore) return window.__firestore;

  var base = 'https://www.gstatic.com/firebasejs/10.12.0/';
  var app = await import(base + 'firebase-app.js');
  var fs  = await import(base + 'firebase-firestore.js');

  var aplicativo = app.getApps().length
    ? app.getApp()
    : app.initializeApp(window.FIREBASE_CONFIG);

  window.__firestore = { banco: fs.getFirestore(aplicativo), fs: fs, app: app };
  return window.__firestore;
};

/* O mesmo, para a parte de login (usada só na área administrativa). */
window.carregarAutenticacao = async function () {
  if (!window.firebaseEstaConfigurado()) return null;
  if (window.__auth) return window.__auth;

  var base = 'https://www.gstatic.com/firebasejs/10.12.0/';
  var app  = await import(base + 'firebase-app.js');
  var auth = await import(base + 'firebase-auth.js');

  var aplicativo = app.getApps().length
    ? app.getApp()
    : app.initializeApp(window.FIREBASE_CONFIG);

  window.__auth = { servico: auth.getAuth(aplicativo), auth: auth };
  return window.__auth;
};
