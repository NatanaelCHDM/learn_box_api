const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const usersController = require('../controllers/usersController');

// Documentation Swagger : groupe "Users"
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */


// -------------------------------------------------------
// ROUTE : POST /v1/users — Création d’un utilisateur
// -------------------------------------------------------
/**
 * @swagger
 * /v1/users:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *               id:
 *                 type: integer
 *                 example: 7
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
router.post('/', authenticate, authorize('admin'), usersController.createUser);

// -------------------------------------------------------
// ROUTE : GET /v1/users/{id} — Lecture d’un utilisateur
// -------------------------------------------------------
/**
 * @swagger
 * /v1/users/{id}:
 *   get:
 *     summary: Récupère les informations d’un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
router.get('/:id', authenticate, authorize('admin'), usersController.getUser);

// -------------------------------------------------------
// ROUTE : PATCH /v1/users/{id} — Modification d’un utilisateur
// -------------------------------------------------------
/**
 * @swagger
 * /v1/users/{id}:
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
router.patch('/:id', authenticate, authorize('admin'), usersController.updateUser);

// -------------------------------------------------------
// ROUTE : DELETE /v1/users/{id} — Suppression d’un utilisateur
// (réservée aux administrateurs)
// -------------------------------------------------------
/**
 * @swagger
 * /v1/users/{id}:
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

// Exporte le router pour l’intégrer dans app.js
module.exports = router;