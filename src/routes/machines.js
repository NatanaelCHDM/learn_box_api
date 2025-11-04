const express = require('express');
const router = express.Router();
const machinesController = require('../controllers/machinesController');

/**
 * @swagger
 * tags:
 *   name: Machines
 *   description: Gestion des machines et accès utilisateurs
 */

/**
 * @swagger
 * /machines:
 *   post:
 *     summary: Crée une nouvelle machine
 *     tags: [Machines]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nameMachine
 *               - statut
 *               - levelAccess
 *             properties:
 *               nameMachine:
 *                 type: string
 *                 example: "Imprimante 3D Prusa"
 *               statut:
 *                 type: string
 *                 enum: [open, closed, maintenance]
 *                 example: "open"
 *               levelAccess:
 *                 type: string
 *                 enum: [user, admin, technician]
 *                 example: "user"
 *     responses:
 *       201:
 *         description: Machine créée avec succès.
 *       400:
 *         description: Données invalides.
 */
router.post('/', machinesController.createMachine);

/**
 * @swagger
 * /machines/{id}:
 *   get:
 *     summary: Récupère les informations d’une machine
 *     tags: [Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la machine à récupérer
 *     responses:
 *       200:
 *         description: Détails de la machine.
 *       404:
 *         description: Machine introuvable.
 */
router.get('/:id', machinesController.getMachine);

/**
 * @swagger
 * /machines/{id}:
 *   patch:
 *     summary: Met à jour les informations d’une machine
 *     tags: [Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la machine à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nameMachine:
 *                 type: string
 *                 example: "Laser Cutter"
 *               statut:
 *                 type: string
 *                 enum: [open, closed, maintenance]
 *                 example: "maintenance"
 *               levelAccess:
 *                 type: string
 *                 enum: [user, admin, technician]
 *                 example: "technician"
 *     responses:
 *       200:
 *         description: Machine mise à jour avec succès.
 *       404:
 *         description: Machine introuvable.
 */
router.patch('/:id', machinesController.updateMachine);

/**
 * @swagger
 * /machines/{id}:
 *   delete:
 *     summary: Supprime une machine du système
 *     tags: [Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la machine à supprimer
 *     responses:
 *       204:
 *         description: Machine supprimée avec succès.
 *       404:
 *         description: Machine introuvable.
 */
router.delete('/:id', machinesController.deleteMachine);

/**
 * @swagger
 * /machines/{id}/access:
 *   post:
 *     summary: Vérifie l’accès d’un utilisateur à une machine
 *     tags: [Machines]
 *     description: Vérifie si l’utilisateur connecté dispose des droits suffisants pour accéder à la machine.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la machine
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *     responses:
 *       200:
 *         description: Accès autorisé ou refusé selon le niveau de permission.
 *       403:
 *         description: Accès refusé.
 *       404:
 *         description: Machine ou utilisateur introuvable.
 */
router.post('/:id/access', machinesController.accessMachine);

module.exports = router;





/*
const express = require('express');
const router = express.Router();
const machinesController = require('../controllers/machinesController');

// CRUD Machines
router.post('/', machinesController.createMachine);
router.get('/:id', machinesController.getMachine);
router.patch('/:id', machinesController.updateMachine);
router.delete('/:id', machinesController.deleteMachine);

// Endpoint spécifique : accès utilisateur à la machine
router.post('/:id/access', machinesController.accessMachine);

module.exports = router;
*/