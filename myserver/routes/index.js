const express = require('express');
const router = express.Router();

// Import route modules

// Authentication routes imports
const createUserRoute = require('./auth/createUserRoute');
const loginRoute = require('./auth/loginRoute');
const userRoute = require('./user/getUsersRoute'); // Added userRoute.js

// Company routes imports
const createCompanyRoute = require('./company/createCompanyRoute');
const getCompanyRoute = require('./company/getCompanyRoute');
const assignCompantRoute = require('./company/assignCompanyRoute');

// Department routes imports
const createDepartmentRoute = require('./department/createDepartmentRoute');
const getDepartmentsRoute = require('./department/getDepartmentsRoute');
const updateUserDepartmentRoute = require('./department/updateUserDepartmentRoute'); // Added updateUserDepartmentRoute.js

// Service routes imports
const getServiceRoute = require('./service/getServiceRoute');
const createServiceRoute = require('./service/createServiceRoute');
const assignServiceRoute = require('./service/assignServiceRoute');

// Transactions routes imports
const createCreditRechargeRoute = require('./transactions/creditRecharge/createCreditRechargeRoute');
const createCreditUsedRoute = require('./transactions/creditUsed/createCreditUsedRoute');

// Task routes imports
const taskRoutes = require('./task/taskRoutes'); // Added taskRoutes.js

/** =================================== main funtions ============================================ */

// Use them under their own namespaces
router.use('/auth', createUserRoute);      // e.g., /auth/create-user
router.use('/auth', loginRoute);           // e.g., /auth/login, /auth/me, /auth/logout
router.use('/users', userRoute);           // e.g., /users, /users/admins, /users/directors, /users/managers

// Company routes
router.use('/company', createCompanyRoute); // e.g., /createCompany
router.use('/getAllCompanies', getCompanyRoute); // e.g., /getAllCompanies
router.use('/assignCompany', assignCompantRoute); // e.g., /assignCompany

// Department routes
router.use('/department', createDepartmentRoute); // e.g., /createDepartment
router.use('/getDepartments', getDepartmentsRoute); // e.g., /getDepartment
router.use('/updateUserDepartment', updateUserDepartmentRoute); // e.g., /department/assign

// Service routes
router.use('/getService', getServiceRoute); // e.g., /service/create
router.use('/createService', createServiceRoute); // e.g., /service/get
router.use('/assignService', assignServiceRoute); // e.g., /service/assign

// Transactions routes
router.use('/createCreditRecharge', createCreditRechargeRoute); // e.g., /creditRecharge/create
router.use('/createCreditUsed', createCreditUsedRoute); // e.g., /creditUsed/create

// Task routes
router.use('/task', taskRoutes); // e.g., /task/create, /task/getAll, /task/update

module.exports = router;