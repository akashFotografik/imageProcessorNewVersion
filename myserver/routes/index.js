const express = require('express');
const router = express.Router();

// Import route modules

// Authentication routes imports
const createUserRoute = require('./auth/createUserRoute');
const loginRoute = require('./auth/loginRoute');
const userRoute = require('./user/getUsersRoute'); // Added userRoute.js

// Company routes imports
const createCompanyRoute = require('./Company/createCompanyRoute');
const getCompanyRoute = require('./Company/getCompanyRoute');
const assignCompantRoute = require('./Company/assignCompanyRoute');

// Department routes imports
const createDepartmentRoute = require('./Department/createDepartmentRoute');
const getDepartmentsRoute = require('./Department/getDepartmentsRoute');

// Service routes imports
const getServiceRoute = require('./service/getServiceRoute');
const createServiceRoute = require('./service/createServiceRoute');
const assignServiceRoute = require('./service/assignServiceRoute');

// Transactions routes imports
const createCreditRechargeRoute = require('./transactions/creditRecharge/createCreditRechargeRoute');
const createCreditUsedRoute = require('./transactions/creditUsed/createCreditUsedRoute');

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

// Service routes
router.use('/getService', getServiceRoute); // e.g., /service/create
router.use('/createService', createServiceRoute); // e.g., /service/get
router.use('/assignService', assignServiceRoute); // e.g., /service/assign

// Transactions routes imports
router.use('/createCreditRecharge', createCreditRechargeRoute); // e.g., /creditRecharge/create
router.use('/createCreditUsed', createCreditUsedRoute); // e.g., /creditUsed/create

module.exports = router;