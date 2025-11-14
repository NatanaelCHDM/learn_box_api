require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Chemin vers la DB JSON
const filePath = path.join(__dirname, '../data/db.json');

// Params sécurité
const saltRounds = parseInt(process.env.PASSWORD_SALT) || 10;
const jwtSecret = process.env.JWT_SECRET;
const accessExpire = process.env.ACCESS_TOKEN_EXPIRE || '15m';
const refreshExpire = process.env.REFRESH_TOKEN_EXPIRE || '7d';

/* ======================================================
   🔧 UTILITAIRES DB
====================================================== */
function loadDB() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ users: [] }, null, 2));
  }

  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) {
    fs.writeFileSync(filePath, JSON.stringify({ users: [] }, null, 2));
    return { users: [] };
  }

  const data = JSON.parse(raw);
  if (!Array.isArray(data.users)) data.users = [];

  return data;
}

function saveDB(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Génération ID auto
function generateUserId(users) {
  if (users.length === 0) return 1;
  return Math.max(...users.map(u => u.id)) + 1;
}

/* ======================================================
   🟦 REGISTER
====================================================== */
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Champs obligatoires
    if (!username || !password) {
      return res.status(400).json({ error: "Username et mot de passe requis" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
    }

    const db = loadDB();

    // Unicité username
    if (db.users.find(u => u.username === username)) {
      return res.status(409).json({ error: "Utilisateur déjà existant" });
    }

    // Hash mot de passe
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // ID auto-incrémenté
    const newUser = {
      id: generateUserId(db.users),
      username,
      password: passwordHash,
      levelAccess: "user"
    };

    db.users.push(newUser);
    saveDB(db);

    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: newUser.id,
        username: newUser.username,
        levelAccess: newUser.levelAccess
      }
    });

  } catch (err) {
    console.error("❌ Erreur register :", err);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

/* ======================================================
   🟩 LOGIN
====================================================== */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Username et mot de passe requis" });

    const db = loadDB();
    const user = db.users.find(u => u.username === username);

    if (!user)
      return res.status(401).json({ error: "Utilisateur non trouvé" });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(401).json({ error: "Mot de passe incorrect" });

    const payload = {
      id: user.id,
      username: user.username,
      levelAccess: user.levelAccess
    };

    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: accessExpire });
    const refreshToken = jwt.sign(payload, jwtSecret, { expiresIn: refreshExpire });

    return res.json({ accessToken, refreshToken });

  } catch (err) {
    console.error("❌ Erreur login :", err);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

/* ======================================================
   🟧 REFRESH TOKEN
====================================================== */
exports.refresh = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ error: "Refresh token manquant" });

  try {
    const payload = jwt.verify(refreshToken, jwtSecret);

    const newAccess = jwt.sign(
      {
        id: payload.id,
        username: payload.username,
        levelAccess: payload.levelAccess
      },
      jwtSecret,
      { expiresIn: accessExpire }
    );

    return res.json({ accessToken: newAccess });

  } catch (err) {
    console.error("❌ Erreur refresh :", err);
    return res.status(403).json({ error: "Refresh token invalide" });
  }
};

/* ======================================================
   🟥 LOGOUT
====================================================== */
exports.logout = (req, res) => {
  return res.json({ message: "Déconnecté avec succès" });
};
