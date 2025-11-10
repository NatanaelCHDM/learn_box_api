// ============================
// 🚀 Fichier principal de l’app Express
// ============================

// Import du framework Express
const express = require('express');

// Import du module path (inclus dans Node.js) pour manipuler les chemins de fichiers
const path = require('path');

// Création de l’application Express
const app = express();

// ---- MIDDLEWARES ----

// Permet à Express de comprendre le JSON dans les requêtes (req.body)
app.use(express.json());

// ---- SWAGGER ----

// Importation de la configuration Swagger (interface + spécifications)
const { swaggerUi, swaggerSpec } = require('./swagger/swagger');

// Monte l’interface Swagger sur l’URL /api-docs
// => Accessible sur http://localhost:3000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---- ROUTES API ----

// Importation des routers de chaque domaine de l’API
const usersRouter = require('./routes/users');
const machinesRouter = require('./routes/machines');
const authRouter = require('./routes/auth');

// Montage des routes avec un préfixe commun pour versionner l’API
app.use('/v1/users', usersRouter);
app.use('/v1/machines', machinesRouter);
app.use('/auth', authRouter);

// ---- SERVEUR INTERFACE WEB (OPTIONNEL) ----

// Sert les fichiers statiques (HTML, CSS, JS) du dossier public/
// Cela permet d'afficher une interface ou une page d'accueil par exemple
app.use(express.static(path.join(__dirname, '../public')));

// Définition de la route racine (http://localhost:3000)
// qui renvoie le fichier index.html du dossier public
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ---- MIDDLEWARE NOT FOUND ----

// Ce middleware est exécuté si aucune route ne correspond à la requête
// Renvoie un message JSON 404 pour informer que la ressource est introuvable
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Exporte l'application Express pour pouvoir être utilisée dans index.js
module.exports = app;