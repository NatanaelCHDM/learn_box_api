// ========================================================
// authsController.js — Logique métier pour l'authentification
// ========================================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Chemin vers le fichier JSON servant de "base de données"
const filePath = path.join(__dirname, '../data/db.json');

// Paramètres de hachage et JWT
const saltRounds = parseInt(process.env.PASSWORD_SALT) || 10;
const jwtSecret = process.env.JWT_SECRET;
const accessExpire = process.env.ACCESS_TOKEN_EXPIRE || '15m';
const refreshExpire = process.env.REFRESH_TOKEN_EXPIRE || '7d';

// --- Utilitaires pour lire et écrire dans la base ---
function loadDB() {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({ users: [] }, null, 2));
  const rawData = fs.readFileSync(filePath, 'utf8');
  if (!rawData.trim()) fs.writeFileSync(filePath, JSON.stringify({ users: [] }, null, 2));
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(data.users)) data.users = [];
  return data;
}

function saveDB(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// --- Génération ID auto-incrémenté
function generateUserId(users) {
  if (users.length === 0) return 1;
  // Récupère le plus grand ID existant
  const maxId = users.reduce((max, u) => (u.id > max ? u.id : max), 0);
  return maxId + 1;
}

// ========================
// REGISTER — Inscription
// ========================
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username et mot de passe requis' });

    const data = loadDB();

    if (data.users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' });
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Génération d'un ID unique auto-incrémenté
    let newId = generateUserId(data.users);
    while (data.users.find(u => u.id === newId)) {
      newId++; // sécurité supplémentaire pour éviter collision
    }

    const newUser = { id: newId, username, password: passwordHash, levelAccess: 'user' };

    data.users.push(newUser);
    saveDB(data);

    res.status(201).json({ message: 'Utilisateur créé avec succès', user: { id: newUser.id, username: newUser.username, levelAccess: newUser.levelAccess } });
  } catch (err) {
    console.error('❌ Erreur register :', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// ========================
// LOGIN — Connexion
// ========================
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username et mot de passe requis' });

    const data = loadDB();
    const user = data.users.find(u => u.username === username);
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const payload = { id: user.id, username: user.username, levelAccess: user.levelAccess };
    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: accessExpire });
    const refreshToken = jwt.sign(payload, jwtSecret, { expiresIn: refreshExpire });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error('❌ Erreur login :', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// ========================
// REFRESH — Rafraîchissement du token
// ========================
exports.refresh = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token manquant' });

  try {
    const payload = jwt.verify(refreshToken, jwtSecret);
    const accessToken = jwt.sign({ id: payload.id, username: payload.username, levelAccess: payload.levelAccess }, jwtSecret, { expiresIn: accessExpire });
    res.json({ accessToken });
  } catch (err) {
    console.error('❌ Erreur refresh :', err);
    res.status(403).json({ error: 'Refresh token invalide' });
  }
};

// ========================
// LOGOUT — Déconnexion
// ========================
exports.logout = (req, res) => {
  res.json({ message: 'Déconnecté avec succès' });
};
