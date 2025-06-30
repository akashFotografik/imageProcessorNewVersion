const express = require('express');
const { assignCompany } = require('../../controllers/Company/assignCompanyController');
const { authenticateFirebaseToken, checkRole } = require('../../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * /assignCompany:
 *   post:
 *     summary: Assign a company to a user (SUPER_ADMIN only)
 *     description: Assigns a company to a user by creating a record in the UserCompany junction table. Only accessible by users with SUPER_ADMIN role.
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
 *               - userId
 *               - companyId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: user_123
 *                 description: ID of the user to assign the company to
 *               companyId:
 *                 type: string
 *                 example: comp_123
 *                 description: ID of the company to assign
 *               role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE, INTERN, DIRECTOR]
 *                 example: EMPLOYEE
 *                 description: Role of the user in the company (optional, defaults to EMPLOYEE)
 *     responses:
 *       201:
 *         description: Company assigned to user successfully
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
 *                   example: Company assigned to user successfully
 *                 userCompany:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: uc_123
 *                     userId:
 *                       type: string
 *                       example: user_123
 *                     companyId:
 *                       type: string
 *                       example: comp_123
 *                     role:
 *                       type: string
 *                       example: EMPLOYEE
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     joinedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:30:00Z
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
 *                   error: userId and companyId are required
 *               invalid_role:
 *                 summary: Invalid role provided
 *                 value:
 *                   success: false
 *                   error: Invalid role provided
 *               already_assigned:
 *                 summary: User already assigned to company
 *                 value:
 *                   success: false
 *                   error: User is already assigned to this company
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
 *         description: User or company not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               user_not_found:
 *                 summary: User not found
 *                 value:
 *                   success: false
 *                   error: User not found
 *               company_not_found:
 *                 summary: Company not found
 *                 value:
 *                   success: false
 *                   error: Company not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post('/',
  authenticateFirebaseToken,
  checkRole('SUPER_ADMIN'),
  assignCompany
);

module.exports = router;