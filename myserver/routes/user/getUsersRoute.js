const express = require('express');
const { getAllUsers, getAllAdmins, getAllDirectors, getAllManagers } = require('../../controllers/user/getUsersController');
const { authenticateFirebaseToken, checkRole, checkCompany } = require('../../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of users based on the requesting user's role and company
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserDetails'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticateFirebaseToken, checkCompany(), getAllUsers);

/**
 * @swagger
 * /users/admins:
 *   get:
 *     summary: Get all admins
 *     description: Returns a list of all admins (SUPER_ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved admins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Admins retrieved successfully
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserDetails'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/admins', authenticateFirebaseToken, checkRole('SUPER_ADMIN'), getAllAdmins);

/**
 * @swagger
 * /users/directors:
 *   get:
 *     summary: Get all directors
 *     description: Returns a list of directors (SUPER_ADMIN or ADMIN, filtered by company for ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved directors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Directors retrieved successfully
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserDetails'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/directors', authenticateFirebaseToken, checkRole(['SUPER_ADMIN', 'ADMIN']), checkCompany(), getAllDirectors);

/**
 * @swagger
 * /users/managers:
 *   get:
 *     summary: Get all managers
 *     description: Returns a list of managers (SUPER_ADMIN, ADMIN, or DIRECTOR, filtered by company for ADMIN and DIRECTOR)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved managers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Managers retrieved successfully
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserDetails'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/managers', authenticateFirebaseToken, checkRole(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']), checkCompany(), getAllManagers);

module.exports = router;