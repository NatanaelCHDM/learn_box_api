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