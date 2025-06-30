const { PrismaClient } = require('../../generated/prisma');
const admin = require('../../config/firebase');

const prisma = new PrismaClient();

/**
 * Controller to handle user login with Firebase token
 * This route verifies Firebase token and returns user details
 */
const loginUser = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Validate input
    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'Firebase ID token is required'
      });
    }

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (firebaseError) {
      console.error('Firebase token verification error:', firebaseError);
      
      // Handle specific Firebase errors
      if (firebaseError.code === 'auth/id-token-expired') {
        return res.status(401).json({
          success: false,
          error: 'Token has expired. Please login again.'
        });
      } else if (firebaseError.code === 'auth/invalid-id-token') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token provided'
        });
      } else if (firebaseError.code === 'auth/argument-error') {
        return res.status(400).json({
          success: false,
          error: 'Malformed token provided'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Token verification failed'
      });
    }

    const firebaseId = decodedToken.uid;

    // Find user in database with related data
    const user = await prisma.user.findUnique({
      where: { firebaseId },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            description: true,
            headOfDept: true
          }
        },
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
            designation: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User account not found. Please contact administrator.'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });

    // Prepare user response (exclude sensitive data)
    const userResponse = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      profileImage: user.profileImage,
      employeeId: user.employeeId,
      designation: user.designation,
      role: user.role,
      isActive: user.isActive,
      dateOfJoining: user.dateOfJoining,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      emergencyContact: user.emergencyContact,
      workingHoursPerDay: user.workingHoursPerDay,
      department: user.department,
      company: user.userCompanies.length > 0 ? user.userCompanies[0].company : null,
      manager: user.manager,
      firebaseId: user.firebaseId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token: {
        firebaseId: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        authTime: decodedToken.auth_time,
        iat: decodedToken.iat,
        exp: decodedToken.exp
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during login'
    });
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Controller to get current user details (requires authentication)
 * This can be used to refresh user data when token is still valid
 */
const getCurrentUser = async (req, res) => {
  try {
    // This route should be protected by authenticateFirebaseToken middleware
    // So req.user will be available
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Return current user details
    const userResponse = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      profileImage: user.profileImage,
      employeeId: user.employeeId,
      designation: user.designation,
      role: user.role,
      isActive: user.isActive,
      dateOfJoining: user.dateOfJoining,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      emergencyContact: user.emergencyContact,
      workingHoursPerDay: user.workingHoursPerDay,
      department: user.department,
      company: user.userCompanies.length > 0 ? user.userCompanies[0].company : null,
      manager: user.manager,
      firebaseId: user.firebaseId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(200).json({
      success: true,
      message: 'User details retrieved successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Controller to handle user logout
 */
const logoutUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during logout'
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  loginUser,
  getCurrentUser,
  logoutUser
};