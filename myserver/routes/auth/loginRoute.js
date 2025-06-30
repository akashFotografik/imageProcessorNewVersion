const express = require('express');
const { loginUser, getCurrentUser, logoutUser } = require('../../controllers/auth/loginController');
const { authenticateFirebaseToken } = require('../../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - idToken
 *       properties:
 *         idToken:
 *           type: string
 *           example: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
 *           description: Firebase ID token obtained from client-side Firebase Auth
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successful
 *         user:
 *           $ref: '#/components/schemas/UserDetails'
 *         token:
 *           type: object
 *           properties:
 *             firebaseId:
 *               type: string
 *               example: firebase_uid_123
 *             email:
 *               type: string
 *               example: user@example.com
 *             emailVerified:
 *               type: boolean
 *               example: true
 *             authTime:
 *               type: number
 *               example: 1640995200
 *             iat:
 *               type: number
 *               example: 1640995200
 *             exp:
 *               type: number
 *               example: 1641081600
 *     
 *     UserDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: cuid_123
 *         email:
 *           type: string
 *           example: user@example.com
 *         fullName:
 *           type: string
 *           example: John Doe
 *         phone:
 *           type: string
 *           example: +1234567890
 *         profileImage:
 *           type: string
 *           nullable: true
 *           example: https://example.com/profile.jpg
 *         employeeId:
 *           type: string
 *           example: EMP0001
 *         designation:
 *           type: string
 *           example: Software Developer
 *         role:
 *           type: string
 *           enum: [SUPER_ADMIN, ADMIN, DIRECTOR, MANAGER, EMPLOYEE, INTERN]
 *           example: EMPLOYEE
 *         isActive:
 *           type: boolean
 *           example: true
 *         dateOfJoining:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *         dateOfBirth:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: 1990-05-15T00:00:00Z
 *         address:
 *           type: string
 *           nullable: true
 *           example: 123 Main St, City, State
 *         emergencyContact:
 *           type: string
 *           nullable: true
 *           example: +1234567890
 *         workingHoursPerDay:
 *           type: number
 *           example: 8.0
 *         department:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             headOfDept:
 *               type: string
 *         company:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             address:
 *               type: string
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *             website:
 *               type: string
 *             logo:
 *               type: string
 *             industry:
 *               type: string
 *         manager:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *             fullName:
 *               type: string
 *             email:
 *               type: string
 *             employeeId:
 *               type: string
 *             designation:
 *               type: string
 *         firebaseId:
 *           type: string
 *           example: firebase_uid_123
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user with Firebase token
 *     description: Verifies Firebase ID token and returns user details from database
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Bad request - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_token:
 *                 summary: Missing ID token
 *                 value:
 *                   success: false
 *                   error: Firebase ID token is required
 *               malformed_token:
 *                 summary: Malformed token
 *                 value:
 *                   success: false
 *                   error: Malformed token provided
 *       401:
 *         description: Unauthorized - invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               expired_token:
 *                 summary: Token expired
 *                 value:
 *                   success: false
 *                   error: Token has expired. Please login again.
 *               invalid_token:
 *                 summary: Invalid token
 *                 value:
 *                   success: false
 *                   error: Invalid token provided
 *       403:
 *         description: Forbidden - user account is inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Your account has been deactivated. Please contact administrator.
 *       404:
 *         description: User not found in database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: User account not found. Please contact administrator.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user details
 *     description: Returns current authenticated user details (requires valid Authorization header)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
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
 *                   example: User details retrieved successfully
 *                 user:
 *                   $ref: '#/components/schemas/UserDetails'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - user account is inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
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
router.get('/me', authenticateFirebaseToken, getCurrentUser);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     description: Logs the logout action for audit purposes (requires valid Authorization header)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                   example: Logout successful
 *       401:
 *         description: Unauthorized - missing or invalid token
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
router.post('/logout', authenticateFirebaseToken, logoutUser);

module.exports = router;