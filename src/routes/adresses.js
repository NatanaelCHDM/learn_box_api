// ============================
// 🔹 Route : adresses.js
// ============================

// Import Express
const express = require('express');
const router = express.Router();

// Import du service qui interagit avec l'API BAN
const { searchAdresse } = require('../services/adresseService');

/**
 * @swagger
 * tags:
 *   name: Adresses
 *   description: Recherche d'adresses via l'API gouvernementale (BAN)
 */

/**
 * @swagger
 * /v1/adresses:
 *   get:
 *     summary: Recherche une ou plusieurs adresses
 *     tags: [Adresses]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Chaîne de recherche
 *     responses:
 *       200:
 *         description: Résultat de la recherche d'adresse
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Paramètre de requête manquant
 *       500:
 *         description: Erreur côté serveur / API externe
 */
router.get('/', async (req, res) => {
  try {
    // Récupère le paramètre q dans la query string
    const { q } = req.query;

    // Vérifie que le paramètre est présent
    if (!q) {
      return res.status(400).json({ error: 'Paramètre "q" manquant' });
    }

    // Appel au service externe
    const results = await searchAdresse(q);

    // Retourne les résultats de l'API BAN
    res.json(results);
  } catch (error) {
    // Si problème avec le service ou l'API externe
    console.error(error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des adresses' });
  }
});

module.exports = router;
