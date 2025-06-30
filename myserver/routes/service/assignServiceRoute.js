const express = require('express');
const { assignServices } = require('../../controllers/service/assignServiceController');
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
 *         services:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Service'
 */

/**
 * @swagger
 * /assignService:
 *   post:
 *     summary: Assign services to a company (SUPER_ADMIN, ADMIN, DIRECTOR only)
 *     description: Assigns one or more services to a specific company. Accessible by users with SUPER_ADMIN, ADMIN, or DIRECTOR roles. Non-SUPER_ADMIN users must be associated with the company.
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
 *               - companyId
 *               - serviceIds
 *             properties:
 *               companyId:
 *                 type: string
 *                 example: comp_123
 *                 description: ID of the company to assign services to
 *               serviceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: svc_123
 *                 description: Array of service IDs to assign
 *     responses:
 *       200:
 *         description: Services assigned successfully
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
 *                   error: Company ID and a non-empty array of service IDs are required
 *               invalid_company:
 *                 summary: Invalid or inactive company ID
 *                 value:
 *                   success: false
 *                   error: Invalid or inactive company ID
 *               invalid_services:
 *                 summary: Invalid or inactive service IDs
 *                 value:
 *                   success: false
 *                   error: One or more service IDs are invalid or inactive
 *               already_assigned:
 *                 summary: Services already assigned to another company
 *                 value:
 *                   success: false
 *                   error: Services Chat Service, Inventory Management are already assigned to another company
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
 *                   error: Only SUPER_ADMIN, ADMIN, or DIRECTOR can assign services
 *               unauthorized_company:
 *                 summary: User not associated with company
 *                 value:
 *                   success: false
 *                   error: User is not authorized to assign services to this company
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
  assignServices
);

module.exports = router;