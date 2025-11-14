// ============================
// 🔹 Middleware : cache.js
// ============================
//
// Ce middleware met en cache les réponses JSON
// pour éviter de ré-appeler les APIs externes inutilement.
// Ici : cache en mémoire grâce à node-cache.
//

const NodeCache = require("node-cache");

// stdTTL = durée de vie par défaut du cache (en secondes)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 minutes

module.exports = (req, res, next) => {
  const key = req.originalUrl; // la clé = URL complète de la requête

  const cached = cache.get(key);

  // Si une réponse existe déjà dans le cache → on la renvoie immédiatement
  if (cached) {
    console.log("📌 Réponse servie depuis le cache :", key);
    return res.json(cached);
  }

  // Sinon : on intercepte res.json pour stocker la réponse quand elle sera envoyée
  res.sendResponse = res.json;

  res.json = (body) => {
    cache.set(key, body); // on enregistre la réponse dans le cache
    console.log("🆕 Réponse mise en cache :", key);
    res.sendResponse(body); // on renvoie la réponse d'origine
  };

  next(); // on passe au middleware suivant
};
console.log('📦 CACHE MISS → Appel API tiers');
console.log('⚡ CACHE HIT → Retour depuis le cache');
