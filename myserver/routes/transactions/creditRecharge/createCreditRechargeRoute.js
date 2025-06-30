const express = require('express');
const { createCreditsRecharge } = require('../../../controllers/transactions/creditRecharge/createCreditRechargeController');
const { authenticateFirebaseToken, checkRole } = require('../../../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreditsRecharge:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: cr_123
 *         credits:
 *           type: number
 *           example: 1000.0
 *           description: Number of credits to recharge
 *         amountPaid:
 *           type: number
 *           example: 99.99
 *           description: Amount paid for the credits
 *         transactionId:
 *           type: string
 *           example: txn_123456
 *           description: Unique transaction identifier
 *         paymentMethod:
 *           type: string
 *           example: CREDIT_CARD
 *           description: Payment method used
 *         paymentStatus:
 *           type: string
 *           example: PENDING
 *           description: Status of the payment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-01-15T10:30:00Z
 *         company:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: comp_123
 *             name:
 *               type: string
 *               example: Acme Corporation
 *         purchasedBy:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: user_123
 *             fullName:
 *               type: string
 *               example: John Doe
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
 *           example: Credits recharge created successfully
 *         creditsRecharge:
 *           $ref: '#/components/schemas/CreditsRecharge'
 */

/**
 * @swagger
 * /createCreditsRecharge:
 *   post:
 *     summary: Create a new credits recharge (SUPER_ADMIN or ADMIN only)
 *     description: Creates a new credits recharge for a specific company. Only accessible by users with SUPER_ADMIN or ADMIN role.
 *     tags: [CreditsRecharge]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credits
 *               - amountPaid
 *               - companyId
 *               - paymentMethod
 *             properties:
 *               credits:
 *                 type: number
 *                 example: 1000.0
 *                 description: Number of credits to recharge
 *               amountPaid:
 *                 type: number
 *                 example: 99.99
 *                 description: Amount paid for the credits
 *               companyId:
 *                 type: string
 *                 example: comp_123
 *                 description: ID of the company
 *               transactionId:
 *                 type: string
 *                 example: txn_123456
 *                 description: Unique transaction identifier (optional)
 *               paymentMethod:
 *                 type: string
 *                 example: CREDIT_CARD
 *                 description: Payment method used
 *     responses:
 *       201:
 *         description: Credits recharge created successfully
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
 *                   error: Credits, amount paid, company ID, and payment method are required
 *               invalid_company:
 *                 summary: Invalid or inactive company ID
 *                 value:
 *                   success: false
 *                   error: Invalid or inactive company ID
 *               transaction_exists:
 *                 summary: Transaction ID already exists
 *                 value:
 *                   success: false
 *                   error: Transaction ID already exists
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
 *                 summary: User doesn't have required role
 *                 value:
 *                   success: false
 *                   error: Only SUPER_ADMIN or ADMIN can create credits recharges
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post('/',
  authenticateFirebaseToken,
  checkRole(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']),
  createCreditsRecharge
);

module.exports = router;