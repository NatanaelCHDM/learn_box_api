require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const saltRounds = parseInt(process.env.PASSWORD_SALT) || 10;
const filePath = path.join(__dirname, '../data/db.json');

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
  const maxId = users.reduce((max, u) => (u.id > max ? u.id : max), 0);
  return maxId + 1;
}

// ========================
// CREATE USER
// ========================
exports.createUser = async (req, res) => {
  try {
    const { username, password, levelAccess = 'user' } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const data = loadDB();

    // Vérifie si username déjà utilisé
    if (data.users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Génération ID unique
    let newId = generateUserId(data.users);
    while (data.users.find(u => u.id === newId)) newId++;

    const newUser = { id: newId, username, password: hashedPassword, levelAccess };
    data.users.push(newUser);
    saveDB(data);

    // Ne pas renvoyer le mot de passe
    res.status(201).location(`/v1/users/${newUser.id}`)
      .json({ id: newUser.id, username: newUser.username, levelAccess: newUser.levelAccess });

  } catch (err) {
    console.error('❌ Erreur création utilisateur :', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// ========================
// READ USER
// ========================
exports.getUser = (req, res) => {
  const data = loadDB();
  const user = data.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'user not found' });

  const { password, ...safeUser } = user;
  res.json(safeUser);
};

// ========================
// UPDATE USER
// ========================
exports.updateUser = async (req, res) => {
  try {
    const data = loadDB();
    const user = data.users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: 'user not found' });

    // Si nouveau mot de passe fourni, le hash
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    }

    Object.assign(user, req.body);
    saveDB(data);

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('❌ Erreur update utilisateur :', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// ========================
// DELETE USER
// ========================
exports.deleteUser = (req, res) => {
  const data = loadDB();
  const userId = parseInt(req.params.id);
  const userToDelete = data.users.find(u => u.id === userId);

  if (!userToDelete) return res.status(404).json({ error: 'User not found' });

  data.users = data.users.filter(u => u.id !== userId);
  saveDB(data);

  const adminName = req.user?.username || 'Unknown';
  res.status(200).json({ message: `L'utilisateur "${userToDelete.username}" a été supprimé par "${adminName}".` });
};


/*
// Tableau temporaire pour stocker les utilisateurs (sans base de données)
let users = [];

// Compteur auto-incrémenté pour générer des ID uniques
let nextId = 1;

const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.PASSWORD_SALT) || 10;

// ========================
// CREATE USER
// ========================
exports.createUser = async (req, res) => {
  // Récupère les données envoyées dans la requête
  const { username, password, levelAccess = 'user' } = req.body;

  // Vérifie que les champs requis sont bien présents
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  try {
    // Hash du mot de passe avec le salt
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crée un nouvel utilisateur avec un ID unique
    const newUser = { id: nextId++, username, password: hashedPassword, levelAccess };

    // Ajoute le nouvel utilisateur au tableau
    users.push(newUser);

    // Renvoie la ressource créée avec un statut 201 (Created)
    res.status(201)
      .location(`/v1/users/${newUser.id}`)  // URL de l’utilisateur créé
      .json({ id: newUser.id, username: newUser.username, levelAccess: newUser.levelAccess });
  } catch (err) {
    console.error('❌ Erreur création utilisateur :', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// ========================
// READ USER
// ========================
exports.getUser = (req, res) => {
  // Recherche un utilisateur par ID dans le tableau
  const user = users.find(u => u.id === parseInt(req.params.id));

  // Si aucun utilisateur trouvé → 404
  if (!user) return res.status(404).json({ error: 'user not found' });

  // Supprime le mot de passe de la réponse (sécurité)
  const { password, ...safeUser } = user;

  // Envoie l’utilisateur sans le mot de passe
  res.json(safeUser);
};

// ========================
// UPDATE USER
// ========================
exports.updateUser = (req, res) => {
  // Recherche de l’utilisateur à modifier
  const user = users.find(u => u.id === parseInt(req.params.id));

  // Si non trouvé → 404
  if (!user) return res.status(404).json({ error: 'user not found' });

  // Fusionne les données existantes avec les nouvelles
  Object.assign(user, req.body);

  // Renvoie l’utilisateur mis à jour
  res.json(user);
};

// ========================
// DELETE USER
// ========================
exports.deleteUser = (req, res) => {
  // Convertit l’ID reçu dans la requête en nombre
  const userId = parseInt(req.params.id);

  // Recherche de l’utilisateur à supprimer
  const userToDelete = users.find(u => u.id === userId);

  // Si utilisateur introuvable → 404
  if (!userToDelete) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Récupère le nom de l’admin ayant effectué la suppression (si disponible)
  const adminName = req.user?.username || 'Unknown';

  // Supprime l’utilisateur du tableau
  users = users.filter(u => u.id !== userId);

  // Envoie une confirmation avec le nom de l’utilisateur supprimé et de l’admin
  res.status(200).json({
    message: `L'utilisateur "${userToDelete.username}" a été supprimé par "${adminName}".`
  });
};

/*
exports.deleteUser = (req, res) => {
  users = users.filter(u => u.id !== parseInt(req.params.id));
  res.status(204).end();
};
*/
