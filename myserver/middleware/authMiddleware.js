const admin = require('../config/firebase');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

/**
 * Middleware to verify Firebase ID token and attach user to request
 */
const authenticateFirebaseToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token is required',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization format',
      });
    }

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (firebaseError) {
      console.error('Firebase token verification error:', firebaseError);
      
      if (firebaseError.code === 'auth/id-token-expired') {
        return res.status(401).json({
          success: false,
          error: 'Token has expired',
        });
      } else if (firebaseError.code === 'auth/invalid-id-token') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Token verification failed',
      });
    }

    // Find user in database using Firebase ID
    const user = await prisma.user.findUnique({
      where: { firebaseId: decodedToken.uid },
      include: {
        department: true,
        userCompanies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                email: true,
                website: true,
                logo: true,
                industry: true
              }
            }
          }
        },
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true,
            employeeId: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'User account is inactive',
      });
    }

    // Attach user and Firebase token data to request
    req.user = user;
    req.firebaseUser = decodedToken;
    
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const userRole = req.user.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Middleware to check if user belongs to a specific company
 * @param {boolean} requireCompany - Whether company association is required
 */
const checkCompany = (requireCompany = true) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    if (requireCompany && !req.user.userCompanies.length) {
      return res.status(403).json({
        success: false,
        error: 'User must be associated with a company',
      });
    }

    next();
  };
};

/**
 * Middleware to check if user belongs to a specific department
 * @param {boolean} requireDepartment - Whether department association is required
 */
const checkDepartment = (requireDepartment = true) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    if (requireDepartment && !req.user.departmentId) {
      return res.status(403).json({
        success: false,
        error: 'User must be associated with a department',
      });
    }

    next();
  };
};

/**
 * Helper function to check if user can access another user's data
 * @param {string} targetUserId - ID of the user being accessed
 * @param {object} currentUser - Current authenticated user
 * @returns {boolean} - Whether access is allowed
 */
const canAccessUser = (targetUserId, currentUser) => {
  // Users can always access their own data
  if (currentUser.id === targetUserId) {
    return true;
  }

  // Admins and Super Admins can access any user in their company
  if (['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
    return true;
  }

  // Directors can access users in their company
  if (currentUser.role === 'DIRECTOR') {
    return true;
  }

  // Managers can access their subordinates
  if (currentUser.role === 'MANAGER') {
    // This would require checking if targetUserId is a subordinate
    // You might want to implement this check based on your business logic
    return true;
  }

  return false;
};

module.exports = {
  authenticateFirebaseToken,
  checkRole,
  checkCompany,
  checkDepartment,
  canAccessUser,
};