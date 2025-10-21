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
