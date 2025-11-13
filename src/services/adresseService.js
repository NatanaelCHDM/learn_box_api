// On utilise axios pour faire des requêtes HTTP
const axios = require('axios');

// Fonction qui interroge l'API gouvernementale pour chercher des adresses
async function searchAdresse(query) {
  if (!query) throw new Error('Query is required'); // Vérifie que la requête est non vide

  try {
    // Appel à l'API officielle du gouvernement français
    const response = await axios.get('https://api-adresse.data.gouv.fr/search/', {
      params: { q: query, limit: 5 } // On limite à 5 résultats pour ne pas surcharger
    });

    // Retourne les résultats bruts (ou tu peux filtrer les champs si besoin)
    return response.data.features;
  } catch (err) {
    // En cas d'erreur HTTP ou réseau
    console.error('Erreur API Adresse :', err.message);
    throw err;
  }
}

// On exporte la fonction pour pouvoir l'utiliser dans les routes
module.exports = { searchAdresse };
