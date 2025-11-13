const express = require('express');
const router = express.Router();
const machinesController = require('../controllers/machinesController');

// Documentation Swagger : groupe "Machines"
/**
 * @swagger
 * tags:
 *   name: Machines
 *   description: Gestion des machines et accès utilisateurs
 */

// -------------------------------------------------------
// ROUTE : POST /v1/machines — Création d’une machine
// -------------------------------------------------------
/**
 * @swagger
 * /v1/machines:
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

// -------------------------------------------------------
// ROUTE : GET /v1/machines/{id} — Lecture d’une machine
// -------------------------------------------------------
/**
 * @swagger
 * /v1/machines/{id}:
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

// -------------------------------------------------------
// ROUTE : PATCH /v1/machines/{id} — Mise à jour d’une machine
// -------------------------------------------------------
/**
 * @swagger
 * /v1/machines/{id}:
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

// -------------------------------------------------------
// ROUTE : DELETE /v1/machines/{id} — Suppression d’une machine
// -------------------------------------------------------
/**
 * @swagger
 * /v1/machines/{id}:
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

// -------------------------------------------------------
// ROUTE : POST /v1/machines/{id}/access — Vérifie l’accès
// -------------------------------------------------------
/**
 * @swagger
 * /v1/machines/{id}/access:
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

// Exporte le router
module.exports = router;