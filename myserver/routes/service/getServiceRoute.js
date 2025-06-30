const express = require('express');
const { getServices } = require('../../controllers/service/getServiceController');
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
 * /getService:
 *   get:
 *     summary: Get all services for a company (ADMIN, SUPER_ADMIN, DIRECTOR only)
 *     description: Retrieves all active services for a specific company. Accessible by users with ADMIN, SUPER_ADMIN, or DIRECTOR roles. Non-SUPER_ADMIN users must be associated with the company.
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           example: comp_123
 *         description: ID of the company to retrieve services for
 *     responses:
 *       200:
 *         description: Services retrieved successfully
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
 *               missing_company_id:
 *                 summary: Missing company ID
 *                 value:
 *                   success: false
 *                   error: Company ID is required
 *               invalid_company:
 *                 summary: Invalid or inactive company ID
 *                 value:
 *                   success: false
 *                   error: Invalid or inactive company ID
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
 *                   error: Insufficient permissions
 *               unauthorized_company:
 *                 summary: User not associated with company
 *                 value:
 *                   success: false
 *                   error: User is not authorized to view services in this company
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.get('/',
  authenticateFirebaseToken,
  checkRole(['ADMIN', 'SUPER_ADMIN', 'DIRECTOR']),
  getServices
);

module.exports = router;