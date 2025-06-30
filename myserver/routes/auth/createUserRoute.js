const express = require('express');
const { registerUser, verifyFirebaseToken } = require('../../controllers/auth/createUserController');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
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
 *         firebaseId:
 *           type: string
 *           example: firebase_uid_123
 *         isActive:
 *           type: boolean
 *           example: true
 *         dateOfJoining:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *         department:
 *           type: object
 *           nullable: true
 *         company:
 *           type: object
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: Error message
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation successful
 *         user:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user with Firebase Authentication
 *     description: Creates a new user in Firebase Authentication first, then stores user details in the database
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: User's email address (must be unique)
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *                 description: User's password (minimum 6 characters)
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *                 description: User's full name
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *                 description: User's phone number (optional)
 *               designation:
 *                 type: string
 *                 example: Software Developer
 *                 description: User's job designation (optional)
 *               departmentId:
 *                 type: string
 *                 example: dept_123
 *                 description: ID of the department (optional)
 *               companyId:
 *                 type: string
 *                 example: comp_123
 *                 description: ID of the company (optional)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   error: Email and password are required
 *               invalid_email:
 *                 summary: Invalid email format
 *                 value:
 *                   success: false
 *                   error: Please provide a valid email address
 *               weak_password:
 *                 summary: Password too weak
 *                 value:
 *                   success: false
 *                   error: Password must be at least 6 characters long
 *               user_exists:
 *                 summary: User already exists
 *                 value:
 *                   success: false
 *                   error: User with this email already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /auth/verify-token:
 *   post:
 *     summary: Verify Firebase ID token and get user details
 *     description: Verifies a Firebase ID token and returns the corresponding user details from the database
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 example: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 description: Firebase ID token obtained from client-side Firebase Auth
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       allOf:
 *                         - $ref: '#/components/schemas/User'
 *                         - type: object
 *                           properties:
 *                             manager:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 fullName:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                                 employeeId:
 *                                   type: string
 *       400:
 *         description: Bad request - missing ID token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Firebase ID token is required
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
 *                   error: Firebase token has expired
 *               invalid_token:
 *                 summary: Invalid token
 *                 value:
 *                   success: false
 *                   error: Invalid Firebase token
 *       403:
 *         description: Forbidden - user account is inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: User account is inactive
 *       404:
 *         description: User not found in database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: User not found in database
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/verify-token', verifyFirebaseToken);

module.exports = router;