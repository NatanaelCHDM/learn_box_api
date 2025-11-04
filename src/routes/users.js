const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const usersController = require('../controllers/usersController');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs (CRUD)
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     tags: [Users]
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
 *                 example: "password123"
 *               levelAccess:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: user
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès.
 *       400:
 *         description: Données invalides.
 */
router.post('/', usersController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupère les informations d’un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []        # <-- indique que la route nécessite un JWT
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à récupérer
 *     responses:
 *       200:
 *         description: Détails de l’utilisateur.
 *       401:
 *         description: Non authentifié.
 *       404:
 *         description: Utilisateur introuvable.
 */
router.get('/:id', authenticate, usersController.getUser);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Met à jour un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newUsername"
 *               password:
 *                 type: string
 *                 example: "newPassword"
 *               levelAccess:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour.
 *       401:
 *         description: Non authentifié.
 *       404:
 *         description: Utilisateur introuvable.
 */
router.patch('/:id', authenticate, usersController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur (réservé aux administrateurs)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à supprimer
 *     responses:
 *       204:
 *         description: Utilisateur supprimé avec succès.
 *       401:
 *         description: Non authentifié.
 *       403:
 *         description: Accès refusé (non admin).
 *       404:
 *         description: Utilisateur introuvable.
 */
router.delete('/:id', authenticate, authorize('admin'), usersController.deleteUser);

module.exports = router;






/*
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const usersController = require('../controllers/usersController');

// ------------------ CREATE ------------------
router.post('/', usersController.createUser);

// ------------------ READ ------------------
router.get('/:id', authenticate, usersController.getUser);

// ------------------ UPDATE ------------------
router.patch('/:id', authenticate, usersController.updateUser);

// ------------------ DELETE ------------------
// Seul un admin peut supprimer un utilisateur
router.delete('/:id', authenticate, authorize('admin'), usersController.deleteUser);

module.exports = router;
*/






/*
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

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
*/




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