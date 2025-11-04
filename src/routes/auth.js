require('dotenv').config();
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const filePath = path.join(__dirname, '../data/db.json');
const saltRounds = parseInt(process.env.PASSWORD_SALT) || 10;


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Routes d'authentification
 */

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
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username et mot de passe requis' });

  const data = JSON.parse(fs.readFileSync(filePath));
  if (data.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Utilisateur déjà existant' });
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);
  const newUser = { username, passwordHash, levelAccess: 'user' };
  data.users.push(newUser);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  res.status(201).json({ message: 'Utilisateur créé !' });
});

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
  if (!username || !password)
    return res.status(400).json({ error: 'Username et mot de passe requis' });

  const data = JSON.parse(fs.readFileSync(filePath));
  const user = data.users.find(u => u.username === username);

  if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

  const payload = { username: user.username, levelAccess: user.levelAccess };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });

  res.json({ accessToken, refreshToken });
});

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
  if (!refreshToken)
    return res.status(401).json({ error: 'Refresh token manquant' });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
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
  res.json({ message: 'Déconnecté avec succès' });
});

module.exports = router;







/*
require('dotenv').config(); // assure que les variables .env sont chargées
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const filePath = path.join(__dirname, '../data/db.json');
const saltRounds = parseInt(process.env.PASSWORD_SALT) || 10;

// ------------------ REGISTER ------------------
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ error: 'Username et mot de passe requis' });

  const data = JSON.parse(fs.readFileSync(filePath));
  if (data.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Utilisateur déjà existant' });
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);
  const newUser = { username, passwordHash, levelAccess: 'user' };
  data.users.push(newUser);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  res.status(201).json({ message: 'Utilisateur créé !' });
});

// ------------------ LOGIN ------------------
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username et mot de passe requis' });

  const data = JSON.parse(fs.readFileSync(filePath));
  const user = data.users.find(u => u.username === username);

  if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

  const payload = { username: user.username, levelAccess: user.levelAccess };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });

  res.json({ accessToken, refreshToken });
});

// ------------------ REFRESH TOKEN ------------------
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token manquant' });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = jwt.sign({ username: payload.username, levelAccess: payload.levelAccess }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ error: 'Refresh token invalide' });
  }
});

// ------------------ LOGOUT ------------------
router.post('/logout', (req, res) => {
  // Dans ce projet simple, logout se fait côté client en supprimant le refresh token
  res.json({ message: 'Déconnecté avec succès' });
});

module.exports = router;
*/