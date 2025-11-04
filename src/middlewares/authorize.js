// middlewares/authorize.js
function authorize(requiredRole) {
    return (req, res, next) => {
    if (!req.user || !req.user.levelAccess) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (req.user.levelAccess !== requiredRole) {
      return res.status(403).json({ error: 'Accès refusé — rôle insuffisant' });
    }

    next();
  };
}

module.exports = authorize;
