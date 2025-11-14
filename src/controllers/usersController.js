require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const saltRounds = parseInt(process.env.PASSWORD_SALT) || 10;
const filePath = path.join(__dirname, '../data/db.json');

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

  let data = JSON.parse(raw);
  if (!Array.isArray(data.users)) data.users = [];

  return data;
}

function saveDB(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ID auto-incrémenté
function generateUserId(users) {
  return users.length === 0
    ? 1
    : Math.max(...users.map(u => u.id)) + 1;
}

/* ======================================================
   🟦 CREATE USER
====================================================== */
exports.createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });

    const db = loadDB();

    if (db.users.find(u => u.username === username)) {
      return res.status(409).json({ error: "Utilisateur déjà existant" });
    }

    const hash = await bcrypt.hash(password, saltRounds);

    const newUser = {
      id: generateUserId(db.users),
      username,
      password: hash,
      levelAccess: "user"
    };

    db.users.push(newUser);
    saveDB(db);

    return res.status(201)
      .location(`/v1/users/${newUser.id}`)
      .json({
        id: newUser.id,
        username: newUser.username,
        levelAccess: newUser.levelAccess
      });

  } catch (err) {
    console.error("❌ Erreur createUser :", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================================================
   🟩 READ USER
====================================================== */
exports.getUser = (req, res) => {
  try {
    const db = loadDB();
    const id = parseInt(req.params.id);

    const user = db.users.find(u => u.id === id);

    if (!user)
      return res.status(404).json({ error: "user not found" });

    const { password, ...safeUser } = user;
    return res.json(safeUser);

  } catch (err) {
    console.error("❌ Erreur getUser :", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================================================
   🟨 UPDATE USER
====================================================== */
exports.updateUser = async (req, res) => {
  try {
    const db = loadDB();
    const id = parseInt(req.params.id);

    const user = db.users.find(u => u.id === id);

    if (!user)
      return res.status(404).json({ error: "user not found" });

    // Nouveau mot de passe
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    }

    Object.assign(user, req.body);

    saveDB(db);

    const { password, ...safeUser } = user;
    return res.json(safeUser);

  } catch (err) {
    console.error("❌ Erreur updateUser :", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================================================
   🟥 DELETE USER
====================================================== */
exports.deleteUser = (req, res) => {
  try {
    const db = loadDB();
    const id = parseInt(req.params.id);

    const user = db.users.find(u => u.id === id);
    if (!user)
      return res.status(404).json({ error: "user not found" });

    db.users = db.users.filter(u => u.id !== id);
    saveDB(db);

    const admin = req.user?.username || "admin";

    return res.status(200).json({
      message: `L'utilisateur "${user.username}" a été supprimé par "${admin}".`
    });

  } catch (err) {
    console.error("❌ Erreur deleteUser :", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
