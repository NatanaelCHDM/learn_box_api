let users = []; // temporaire (plus tard tu utiliseras une base de données)
let nextId = 1;

exports.createUser = (req, res) => {
  const { username, password, levelAccess = 'user' } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  const newUser = { id: nextId++, username, password, levelAccess };
  users.push(newUser);
  res.status(201).location(`/v1/users/${newUser.id}`).json(newUser);
};

exports.getUser = (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'user not found' });
  const { password, ...safeUser } = user;
  res.json(safeUser);
};

exports.updateUser = (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'user not found' });
  Object.assign(user, req.body);
  res.json(user);
};


exports.deleteUser = (req, res) => {
  const userId = parseInt(req.params.id);
  const userToDelete = users.find(u => u.id === userId);

  if (!userToDelete) {
    return res.status(404).json({ error: 'User not found' });
  }

  const adminName = req.user?.username || 'Unknown';

  users = users.filter(u => u.id !== userId);

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