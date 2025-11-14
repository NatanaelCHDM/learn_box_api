const express = require('express');
const cache = require('../middlewares/cache');
const router = express.Router();

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
 *     summary: Recherche une ou plusieurs adresses (avec mise en cache)
 *     tags: [Adresses]
 *     x-cache: true
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
 *       400:
 *         description: Paramètre de requête manquant
 *       500:
 *         description: Erreur côté serveur / API externe
 */

// Étape 1 : validation du paramètre
router.get('/', (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Paramètre "q" manquant' });
  }

  next();
}, cache, async (req, res) => {

  try {
    const results = await searchAdresse(req.query.q);
    res.json(results);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des adresses' });
  }
});

module.exports = router;
