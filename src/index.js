// Charge les variables d’environnement définies dans le fichier .env
require('dotenv').config(); // charger les variables d'environnement

// Importe l’application Express configurée dans app.js
const app = require('./app');

// Récupère le port depuis les variables d’environnement
// (ou utilise 3000 par défaut si non défini)
const PORT = process.env.PORT || 3000;

// Lance le serveur Express sur le port spécifié
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});