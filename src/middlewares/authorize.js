// ============================
// 🔒 Middleware : authorize.js
// ============================

// Fonction middleware qui vérifie le rôle ou le niveau d’accès de l’utilisateur
function authorize(requiredRole) {
  // Retourne une fonction middleware personnalisée selon le rôle requis
  return (req, res, next) => {

    // Vérifie que l’utilisateur est bien authentifié et possède une propriété "levelAccess"
    if (!req.user || !req.user.levelAccess) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Compare le rôle requis avec celui de l’utilisateur
    // Si le rôle est insuffisant → accès refusé
    if (req.user.levelAccess !== requiredRole) {
      return res.status(403).json({ error: 'Accès refusé — rôle insuffisant' });
    }

    // Si tout est bon → passe au middleware suivant ou au contrôleur
    next();
  };
}

// Exporte la fonction pour l’utiliser dans les routes nécessitant un rôle spécifique
module.exports = authorize;