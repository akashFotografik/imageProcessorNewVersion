const express = require('express');
const { createTask, deleteTask, assignTaskToUser, assignTaskToDepartment, getTasks } = require('../../controllers/task/taskController');
const { authenticateFirebaseToken, checkRole } = require('../../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: task_123
 *         title:
 *           type: string
 *           example: Implement new feature
 *         description:
 *           type: string
 *           example: Develop authentication module
 *         status:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, COMPLETED, CANCELLED, ON_HOLD]
 *           example: TODO
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *           example: MEDIUM
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: 2025-07-01T10:00:00Z
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: 2025-07-10T17:00:00Z
 *         estimatedHours:
 *           type: number
 *           example: 20
 *         companyId:
 *           type: string
 *           example: comp_123
 *         department:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: dept_123
 *             name:
 *               type: string
 *               example: Engineering
 *         assignedTo:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: user_123
 *             fullName:
 *               type: string
 *               example: John Smith
 *             email:
 *               type: string
 *               example: john.smith@example.com
 *         createdBy:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: user_456
 *             fullName:
 *               type: string
 *               example: Jane Doe
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
 *         task:
 *           $ref: '#/components/schemas/Task'
 */

/**
 * @swagger
 * /task/create:
 *   post:
 *     summary: Create a new task (SUPER_ADMIN, ADMIN, DIRECTOR, MANAGER only)
 *     description: Creates a new task for a user or department within a company. Only accessible by users with SUPER_ADMIN, ADMIN, DIRECTOR, or MANAGER roles. Non-SUPER_ADMIN users must be associated with the company.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - companyId
 *               - assignedToId
 *             properties:
 *               title:
 *                 type: string
 *                 example: Implement new feature
 *                 description: Task title
 *               description:
 *                 type: string
 *                 example: Develop authentication module
 *                 description: Task description (optional)
 *               companyId:
 *                 type: string
 *                 example: comp_123
 *                 description: ID of the company
 *               assignedToId:
 *                 type: string
 *                 example: user_123
 *                 description: ID of the user to assign the task to
 *               departmentId:
 *                 type: string
 *                 example: dept_123
 *                 description: ID of the department (optional; if provided, assigns to department head)
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 example: MEDIUM
 *                 description: Task priority (optional)
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-07-01T10:00:00Z
 *                 description: Task start date (optional)
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-07-10T17:00:00Z
 *                 description: Task due date (optional)
 *               estimatedHours:
 *                 type: number
 *                 example: 20
 *                 description: Estimated hours to complete the task (optional)
 *     responses:
 *       201:
 *         description: Task created successfully
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
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

/**
 * @swagger
 * /task/delete/{taskId}:
 *   delete:
 *     summary: Delete a task (SUPER_ADMIN, ADMIN, DIRECTOR, MANAGER only)
 *     description: Deletes a task by ID. Only accessible by users with SUPER_ADMIN, ADMIN, DIRECTOR, or MANAGER roles who are associated with the task's company.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the task to delete
 *     responses:
 *       200:
 *         description: Task deleted successfully
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
 *                   example: Task deleted successfully
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task not found
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

/**
 * @swagger
 * /task/assign/user:
 *   put:
 *     summary: Assign a task to a user (SUPER_ADMIN, ADMIN, DIRECTOR, MANAGER only)
 *     description: Assigns a task to a specific user within a company. Only accessible by users with SUPER_ADMIN, ADMIN, DIRECTOR, or MANAGER roles. Non-SUPER_ADMIN users must be associated with the company.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - userId
 *               - companyId
 *             properties:
 *               taskId:
 *                 type: string
 *                 example: task_123
 *                 description: ID of the task
 *               userId:
 *                 type: string
 *                 example: user_123
 *                 description: ID of the user to assign the task to
 *               companyId:
 *                 type: string
 *                 example: comp_123
 *                 description: ID of the company
 *     responses:
 *       200:
 *         description: Task assigned successfully
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task or user not found
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

/**
 * @swagger
 * /task/assign/department:
 *   put:
 *     summary: Assign a task to a department (SUPER_ADMIN, ADMIN, DIRECTOR, MANAGER only)
 *     description: Assigns a task to a department, automatically assigning it to the department head. Only accessible by users with SUPER_ADMIN, ADMIN, DIRECTOR, or MANAGER roles. Non-SUPER_ADMIN users must be associated with the company.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - departmentId
 *               - companyId
 *             properties:
 *               taskId:
 *                 type: string
 *                 example: task_123
 *                 description: ID of the task
 *               departmentId:
 *                 type: string
 *                 example: dept_123
 *                 description: ID of the department
 *               companyId:
 *                 type: string
 *                 example: comp_123
 *                 description: ID of the company
 *     responses:
 *       200:
 *         description: Task assigned successfully
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task or department not found
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

router.post('/create',
  authenticateFirebaseToken,
  checkRole(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'MANAGER']),
  createTask
);

router.delete('/delete/:taskId',
  authenticateFirebaseToken,
  checkRole(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'MANAGER']),
  deleteTask
);

router.put('/assign/user',
  authenticateFirebaseToken,
  checkRole(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'MANAGER']),
  assignTaskToUser
);

router.put('/assign/department',
  authenticateFirebaseToken,
  checkRole(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'MANAGER']),
  assignTaskToDepartment
);

/**
 * @swagger
 * /task/getTasks:
 *   get:
 *     summary: Get tasks (SUPER_ADMIN, ADMIN, DIRECTOR, MANAGER only)
 *     description: Retrieves tasks based on user role. SUPER_ADMIN can fetch all tasks or tasks for a specific company using companyId. Other roles can only fetch tasks for companies they are associated with.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID of the company to filter tasks (optional for SUPER_ADMIN, ignored for other roles)
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
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

router.get(
  '/getTasks',
  authenticateFirebaseToken,
  checkRole(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'MANAGER']),
  getTasks
);

module.exports = router;