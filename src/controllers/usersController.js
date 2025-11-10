// Tableau temporaire pour stocker les utilisateurs (sans base de données)
let users = [];

// Compteur auto-incrémenté pour générer des ID uniques
let nextId = 1;

// ========================
// CREATE USER
// ========================
exports.createUser = (req, res) => {
  // Récupère les données envoyées dans la requête
  const { username, password, levelAccess = 'user' } = req.body;

  // Vérifie que les champs requis sont bien présents
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  // Crée un nouvel utilisateur avec un ID unique
  const newUser = { id: nextId++, username, password, levelAccess };

  // Ajoute le nouvel utilisateur au tableau
  users.push(newUser);

  // Renvoie la ressource créée avec un statut 201 (Created)
  res.status(201)
    .location(`/v1/users/${newUser.id}`)  // URL de l’utilisateur créé
    .json(newUser);
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
