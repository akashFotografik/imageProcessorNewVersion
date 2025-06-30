const express = require('express');
const { createDepartment } = require('../../controllers/department/createDepartmentController');
const { authenticateFirebaseToken, checkRole } = require('../../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: dept_123
 *         name:
 *           type: string
 *           example: Engineering
 *         description:
 *           type: string
 *           example: Software Development Department
 *         headOfDept:
 *           type: string
 *           example: John Smith
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
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
 *         department:
 *           $ref: '#/components/schemas/Department'
 */

/**
 * @swagger
 * /department/create:
 *   post:
 *     summary: Create a new department (SUPER_ADMIN, ADMIN, DIRECTOR, MANAGER only)
 *     description: Creates a new department under a specific company. Only accessible by users with SUPER_ADMIN, ADMIN, DIRECTOR, or MANAGER roles. Non-SUPER_ADMIN users must be associated with the company.
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
 *               - name
 *               - companyId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Engineering
 *                 description: Department name (must be unique within company)
 *               companyId:
 *                 type: string
 *                 example: comp_123
 *                 description: ID of the company
 *               description:
 *                 type: string
 *                 example: Software Development Department
 *                 description: Department description (optional)
 *               headOfDept:
 *                 type: string
 *                 example: John Smith
 *                 description: Name of department head (optional)
 *     responses:
 *       201:
 *         description: Department created successfully
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
 *                   error: Department name and company ID are required
 *               invalid_company:
 *                 summary: Invalid or inactive company ID
 *                 value:
 *                   success: false
 *                   error: Invalid or inactive company ID
 *               department_exists:
 *                 summary: Department already exists
 *                 value:
 *                   success: false
 *                   error: Department with this name already exists in the company
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
 *                   error: User is not authorized to create departments in this company
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post('/create',
  authenticateFirebaseToken,
  checkRole(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'MANAGER']),
  createDepartment
);

module.exports = router;