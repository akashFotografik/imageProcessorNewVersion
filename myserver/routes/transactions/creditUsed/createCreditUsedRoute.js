const express = require('express');
const { createTransactionHistory } = require('../../../controllers/transactions/creditUsed/createCreditUsedController');
const { authenticateFirebaseToken, checkRole } = require('../../../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TransactionHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: th_123
 *         creditsUsed:
 *           type: number
 *           example: 500.0
 *           description: Number of credits used in the transaction
 *         description:
 *           type: string
 *           example: Enabled chat service for company
 *           description: Description of the transaction
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
 *         service:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: svc_123
 *             name:
 *               type: string
 *               example: Chat Service
 *         numberOfDaysUsed:
 *           type: integer
 *           example: 30
 *           description: Number of days the service was used
 *         enabledBy:
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
 *           example: Transaction history created successfully
 *         transactionHistory:
 *           $ref: '#/components/schemas/TransactionHistory'
 */

/**
 * @swagger
 * /createTransactionHistory:
 *   post:
 *     summary: Create a new transaction history log (SUPER_ADMIN or ADMIN only)
 *     description: Creates a new transaction history log for a specific company, optionally linked to a service. Only accessible by users with SUPER_ADMIN or ADMIN role.
 *     tags: [TransactionHistory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - creditsUsed
 *               - companyId
 *             properties:
 *               creditsUsed:
 *                 type: number
 *                 example: 500.0
 *                 description: Number of credits used in the transaction
 *               companyId:
 *                 type: string
 *                 example: comp_123
 *                 description: ID of the company
 *               serviceId:
 *                 type: string
 *                 example: svc_123
 *                 description: ID of the service (optional)
 *               numberOfDaysUsed:
 *                 type: integer
 *                 example: 30
 *                 description: Number of days the service was used (optional)
 *               description:
 *                 type: string
 *                 example: Enabled chat service for company
 *                 description: Description of the transaction (optional)
 *     responses:
 *       201:
 *         description: Transaction history created successfully
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
 *                   error: Credits used and company ID are required
 *               invalid_company:
 *                 summary: Invalid or inactive company ID
 *                 value:
 *                   success: false
 *                   error: Invalid or inactive company ID
 *               invalid_service:
 *                 summary: Invalid or inactive service ID
 *                 value:
 *                   success: false
 *                   error: Invalid or inactive service ID
 *               insufficient_credits:
 *                 summary: Insufficient company credits
 *                 value:
 *                   success: false
 *                   error: Insufficient credits available
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
 *                   error: Only SUPER_ADMIN or ADMIN can create transaction history logs
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
  createTransactionHistory
);

module.exports = router;