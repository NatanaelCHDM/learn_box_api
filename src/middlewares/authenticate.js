// Import du module jsonwebtoken pour vérifier et décoder les tokens JWT
const jwt = require('jsonwebtoken');

// Fonction middleware pour authentifier les requêtes via JWT
function authenticate(req, res, next) {

  // Récupère le header "Authorization" (insensible à la casse)
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  // Si le header est absent → l'utilisateur n'est pas authentifié
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  // Le format attendu du header est "Bearer <token>"
  const parts = authHeader.split(' ');

  // Vérifie que le format du header est correct
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Malformed Authorization header' });
  }

  // Extrait uniquement le token JWT de la seconde partie du header
  const token = parts[1];

  try {

    // Vérifie et décode le token à l’aide de la clé secrète définie dans les variables d’environnement
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Stocke les informations décodées du token dans req.user (utilisable dans les routes suivantes)
    req.user = payload;

    // Passe la main au middleware suivant
    next();
  } catch (err) {
    // Si le token est invalide ou expiré → retourne une erreur 401
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Exporte la fonction pour l’utiliser dans d’autres fichiers (routes, middlewares, etc.)
module.exports = authenticate;
