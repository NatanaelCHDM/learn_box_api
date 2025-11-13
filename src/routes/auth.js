// ========================================================
// auth.js — Routes d’authentification avec contrôleur et Swagger
// ========================================================

const express = require('express');
const router = express.Router();

// Import du contrôleur
const authsController = require('../controllers/authsController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Routes d'authentification
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     tags: [Auth]
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
 *                 example: toto
 *               password:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Erreur de validation (username déjà existant ou champs manquants)
 */
router.post('/register', authsController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authentifie un utilisateur et génère un token JWT
 *     tags: [Auth]
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
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Connexion réussie, tokens générés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Username ou mot de passe manquant
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', authsController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rafraîchit le token d’accès
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Nouveau token d’accès généré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Refresh token manquant
 *       403:
 *         description: Refresh token invalide
 */
router.post('/refresh', authsController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnecte l’utilisateur (suppression du refresh token côté client)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Déconnecté avec succès
 */
router.post('/logout', authsController.logout);

module.exports = router;
