const express = require('express');
const { createCompany } = require('../../controllers/Company/createCompanyController');
const { authenticateFirebaseToken, checkRole } = require('../../middleware/authMiddleware'); // Adjust path as needed
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: comp_123
 *         name:
 *           type: string
 *           example: Acme Corporation
 *         address:
 *           type: string
 *           example: 123 Business Street
 *         phone:
 *           type: string
 *           example: +1234567890
 *         email:
 *           type: string
 *           example: contact@acme.com
 *         website:
 *           type: string
 *           example: https://www.acme.com
 *         logo:
 *           type: string
 *           example: https://www.acme.com/logo.png
 *         industry:
 *           type: string
 *           example: Technology
 *         gstNumber:
 *           type: string
 *           example: 27AABCU9603R1ZM
 *         panNumber:
 *           type: string
 *           example: AABCU9603R
 *         isActive:
 *           type: boolean
 *           example: true
 *         Country:
 *           type: string
 *           example: India
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: Error message
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation successful
 *         company:
 *           $ref: '#/components/schemas/Company'
 */

/**
 * @swagger
 * /company/create:
 *   post:
 *     summary: Create a new company (SUPER_ADMIN only)
 *     description: Creates a new company in the database. Only accessible by users with SUPER_ADMIN role.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Acme Corporation
 *                 description: Company name (must be unique)
 *               address:
 *                 type: string
 *                 example: 123 Business Street
 *                 description: Company address (optional)
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *                 description: Company phone number (optional)
 *               email:
 *                 type: string
 *                 format: email
 *                 example: contact@acme.com
 *                 description: Company email address (optional)
 *               website:
 *                 type: string
 *                 example: https://www.acme.com
 *                 description: Company website (optional)
 *               logo:
 *                 type: string
 *                 example: https://www.acme.com/logo.png
 *                 description: Company logo URL (optional)
 *               industry:
 *                 type: string
 *                 example: Technology
 *                 description: Company industry (optional)
 *               gstNumber:
 *                 type: string
 *                 example: 27AABCU9603R1ZM
 *                 description: GST number (optional)
 *               panNumber:
 *                 type: string
 *                 example: AABCU9603R
 *                 description: PAN number (optional)
 *               Country:
 *                 type: string
 *                 example: India
 *                 description: Country of operation (optional)
 *     responses:
 *       201:
 *         description: Company created successfully
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
 *                   error: Company name is required
 *               invalid_email:
 *                 summary: Invalid email format
 *                 value:
 *                   success: false
 *                   error: Please provide a valid email address
 *               company_exists:
 *                 summary: Company already exists
 *                 value:
 *                   success: false
 *                   error: Company with this name already exists
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_token:
 *                 summary: Missing authorization token
 *                 value:
 *                   success: false
 *                   error: Authorization token is required
 *               invalid_token:
 *                 summary: Invalid token
 *                 value:
 *                   success: false
 *                   error: Invalid token
 *               expired_token:
 *                 summary: Expired token
 *                 value:
 *                   success: false
 *                   error: Token has expired
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               insufficient_permissions:
 *                 summary: User doesn't have SUPER_ADMIN role
 *                 value:
 *                   success: false
 *                   error: Insufficient permissions
 *               inactive_user:
 *                 summary: User account is inactive
 *                 value:
 *                   success: false
 *                   error: User account is inactive
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

// Apply authentication and role-checking middleware
router.post('/create', 
  authenticateFirebaseToken,    // First verify the user is authenticated
  checkRole('SUPER_ADMIN'),     // Then check if user has SUPER_ADMIN role
  createCompany                 // Finally execute the controller
);

module.exports = router;