const express = require('express');
const { getDepartments } = require('../../controllers/Department/getDepartmentsController');
const { authenticateFirebaseToken, checkRole } = require('../../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * /getDepartments:
 *   get:
 *     summary: Get departments (ADMIN and SUPER_ADMIN only)
 *     description: Retrieves departments based on user role. ADMIN users can only access departments of companies they are associated with. SUPER_ADMIN users can access departments of any company by providing a companyId query parameter; if no companyId is provided, they get all departments.
 *     tags: [Department]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID of the company to filter departments (required for SUPER_ADMIN to specify a company; ignored for ADMIN users)
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 departments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Department'
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_company:
 *                 summary: Invalid company ID
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
 *                 summary: User not associated with any company
 *                 value:
 *                   success: false
 *                   error: User is not associated with any company
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

router.get('/', 
  authenticateFirebaseToken,
  checkRole(['SUPER_ADMIN', 'ADMIN']),
  getDepartments
);

module.exports = router;