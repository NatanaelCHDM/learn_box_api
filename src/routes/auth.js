// Charge les variables d’environnement (.env)
require('dotenv').config();

// Import d’Express et création d’un router dédié
const express = require('express');
const router = express.Router();

// Modules Node.js intégrés pour manipuler le système de fichiers et les chemins
const fs = require('fs');
const path = require('path');

// Modules externes pour le hachage des mots de passe et la génération de tokens JWT
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Détermine le chemin du fichier contenant les données persistées (mock database)
const filePath = path.join(__dirname, '../data/db.json');

// Définit le nombre de tours de hachage pour bcrypt, configurable dans .env
const saltRounds = parseInt(process.env.PASSWORD_SALT) || 10;


// -------------------------------------------------------
// Documentation Swagger – Catégorie Authentification
// -------------------------------------------------------

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Routes d'authentification
 */

// -------------------------------------------------------
// ROUTE : POST /auth/register — Inscription utilisateur
// -------------------------------------------------------

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Créer un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: toto
 *               password:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Erreur de validation
 */

router.post('/register', async (req, res) => {
  // Récupère les informations du corps de la requête
  const { username, password } = req.body;

  // Vérifie que les deux champs sont fournis
  if (!username || !password)
    return res.status(400).json({ error: 'Username et mot de passe requis' });

  // Lit le fichier JSON contenant les utilisateurs
  const data = JSON.parse(fs.readFileSync(filePath));

  // Vérifie si le nom d’utilisateur existe déjà
  if (data.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Utilisateur déjà existant' });
  }

  // Hash du mot de passe avec bcrypt
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Création de l’objet utilisateur
  const newUser = { username, passwordHash, levelAccess: 'user' };

  // Ajout du nouvel utilisateur à la base locale
  data.users.push(newUser);

  // Écriture du nouveau fichier JSON
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  // Retourne un message de confirmation
  res.status(201).json({ message: 'Utilisateur créé !' });
});

// -------------------------------------------------------
// ROUTE : POST /auth/login — Connexion utilisateur
// -------------------------------------------------------

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authentifie un utilisateur et génère un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: "mypassword123"
 *     responses:
 *       200:
 *         description: Connexion réussie, tokens générés.
 *       401:
 *         description: Identifiants invalides.
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Vérifie les champs obligatoires
  if (!username || !password)
    return res.status(400).json({ error: 'Username et mot de passe requis' });

  // Lecture du fichier de données
  const data = JSON.parse(fs.readFileSync(filePath));

  // Recherche de l’utilisateur par nom
  const user = data.users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });

  // Vérifie la correspondance du mot de passe
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

  // Prépare les données à inclure dans le token
  const payload = { username: user.username, levelAccess: user.levelAccess };

  // Génère les tokens d’accès et de rafraîchissement
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });

  // Retourne les deux tokens au client
  res.json({ accessToken, refreshToken });
});


// -------------------------------------------------------
// ROUTE : POST /auth/refresh — Renouveler le token
// -------------------------------------------------------
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rafraîchit le token d’accès à partir d’un refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR..."
 *     responses:
 *       200:
 *         description: Nouveau token d’accès généré.
 *       401:
 *         description: Refresh token manquant.
 *       403:
 *         description: Refresh token invalide.
 */
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  // Si aucun token fourni
  if (!refreshToken)
    return res.status(401).json({ error: 'Refresh token manquant' });

  try {
    // Vérifie le refresh token
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Crée un nouveau token d’accès avec la même identité
    const accessToken = jwt.sign(
      { username: payload.username, levelAccess: payload.levelAccess },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
    );
    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ error: 'Refresh token invalide' });
  }
});

// -------------------------------------------------------
// ROUTE : POST /auth/logout — Déconnexion
// -------------------------------------------------------

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnecte l’utilisateur (suppression du refresh token côté client)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Déconnexion réussie.
 */
router.post('/logout', (req, res) => {
  // Le logout ici est symbolique, côté client le token doit être supprimé
  res.json({ message: 'Déconnecté avec succès' });
});

// Exporte le router pour l’utiliser dans app.js
module.exports = router;