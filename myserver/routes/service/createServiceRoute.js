const express = require('express');
const { createService } = require('../../controllers/service/createServiceController');
const { authenticateFirebaseToken, checkRole } = require('../../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: svc_123
 *         name:
 *           type: string
 *           example: Chat Service
 *         description:
 *           type: string
 *           example: Real-time communication service
 *         price:
 *           type: number
 *           example: 100.0
 *           description: Price in credits
 *         isActive:
 *           type: boolean
 *           example: true
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
 *         service:
 *           $ref: '#/components/schemas/Service'
 */

/**
 * @swagger
 * /createService:
 *   post:
 *     summary: Create a new service (SUPER_ADMIN only)
 *     description: Creates a new service for a specific company. Only accessible by users with SUPER_ADMIN role.
 *     tags: [Service]
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
 *               - companyId
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Chat Service
 *                 description: Service name (must be unique within company)
 *               companyId:
 *                 type: string
 *                 example: comp_123
 *                 description: ID of the company
 *               description:
 *                 type: string
 *                 example: Real-time communication service
 *                 description: Service description (optional)
 *               price:
 *                 type: number
 *                 example: 100.0
 *                 description: Price of the service in credits
 *     responses:
 *       201:
 *         description: Service created successfully
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
 *                   error: Service name, company ID, and price are required
 *               invalid_company:
 *                 summary: Invalid or inactive company ID
 *                 value:
 *                   success: false
 *                   error: Invalid or inactive company ID
 *               service_exists:
 *                 summary: Service already exists
 *                 value:
 *                   success: false
 *                   error: Service with this name already exists in the company
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
 *                   error: Only SUPER_ADMIN can create services
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post('/',
  authenticateFirebaseToken,
  checkRole(['SUPER_ADMIN']),
  createService
);

module.exports = router;