const express = require('express');
const { updateUserDepartment } = require('../../controllers/department/updateUserDepartmentController');
const { authenticateFirebaseToken, checkRole } = require('../../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * /department/assign:
 *   put:
 *     summary: Update or assign a user's department (SUPER_ADMIN, ADMIN, DIRECTOR, MANAGER only)
 *     description: Assigns a user to a department or updates their existing department within a specific company. Only accessible by users with SUPER_ADMIN, ADMIN, DIRECTOR, or MANAGER roles. Non-SUPER_ADMIN users must be associated with the company.
 *     tags: [Department]
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
 *               - departmentId
 *               - companyId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: user_123
 *                 description: ID of the user to assign/update department
 *               departmentId:
 *                 type: string
 *                 example: dept_123
 *                 description: ID of the department to assign
 *               companyId:
 *                 type: string
 *                 example: comp_123
 *                 description: ID of the company
 *     responses:
 *       200:
 *         description: User department updated successfully
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
 *                   example: User department updated successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: user_123
 *                     department:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: dept_123
 *                         name:
 *                           type: string
 *                           example: Engineering
 *                         companyId:
 *                           type: string
 *                           example: comp_123
 *                     userCompanies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           company:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: comp_123
 *                               name:
 *                                 type: string
 *                                 example: Acme Corporation
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
 *                   error: User ID, department ID, and company ID are required
 *               invalid_user:
 *                 summary: Invalid user ID
 *                 value:
 *                   success: false
 *                   error: Invalid or inactive user ID
 *               invalid_department:
 *                 summary: Invalid department ID
 *                 value:
 *                   success: false
 *                   error: Invalid or inactive department ID
 *               invalid_company:
 *                 summary: Invalid company ID
 *                 value:
 *                   success: false
 *                   error: Invalid or inactive company ID
 *               department_company_mismatch:
 *                 summary: Department not in company
 *                 value:
 *                   success: false
 *                   error: Department does not belong to the specified company
 *               user_not_in_company:
 *                 summary: User not associated with company
 *                 value:
 *                   success: false
 *                   error: Target user is not associated with this company
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
 *                   error: Insufficient permissions to modify department assignments
 *               unauthorized_company:
 *                 summary: User not associated with company
 *                 value:
 *                   success: false
 *                   error: User is not authorized to modify departments in this company
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.put('/assign',
  authenticateFirebaseToken,
  checkRole(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'MANAGER']),
  updateUserDepartment
);

module.exports = router;