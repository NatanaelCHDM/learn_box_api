const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');

// Stockage temporaire (plus tard base de données)
let users = [];
let nextId = 1;

// ------------------ CREATE ------------------
router.post('/', (req, res) => {
  const { username, password, levelAccess = 'user' } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  const newUser = { id: nextId++, username, password, levelAccess };
  users.push(newUser);
  res.status(201).location(`/v1/users/${newUser.id}`).json(newUser);
});

// ------------------ READ ------------------
router.get('/:id', authenticate, (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'user not found' });

  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// ------------------ UPDATE ------------------
router.patch('/:id', authenticate, (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'user not found' });

  Object.assign(user, req.body);
  res.json(user);
});

// ------------------ DELETE ------------------
router.delete('/:id', authenticate, (req, res) => {
  users = users.filter(u => u.id !== parseInt(req.params.id));
  res.status(204).end();
});

module.exports = router;





/*
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate'); // <-- ici

// Exemple de route protégée :
router.get('/', authenticate, (req, res) => {
  res.json({ 
    message: 'Route protégée — accès autorisé',
    user: req.user 
  });
});

module.exports = router;
*/





/*
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.post('/', usersController.createUser);
router.get('/:id', usersController.getUser);
router.patch('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
*/