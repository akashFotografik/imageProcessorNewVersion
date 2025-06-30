const { PrismaClient } = require('../../generated/prisma');
const admin = require('../../config/firebase'); // Adjust path based on your structure

const prisma = new PrismaClient();

// Controller to handle user registration with Firebase
const registerUser = async (req, res) => {
  try {
    const { email, password, fullName, phone, designation, departmentId, companyId } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    if (!fullName) {
      return res.status(400).json({ 
        success: false,
        error: 'Full name is required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide a valid email address' 
      });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'User with this email already exists' 
      });
    }

    // Validate department exists if provided and not empty
    if (departmentId && departmentId.trim() !== '') {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      
      if (!department) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid department ID' 
        });
      }
    }

    // Validate company exists if provided and not empty
    if (companyId && companyId.trim() !== '') {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });
      
      if (!company) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid company ID' 
        });
      }
    }

    // Step 1: Create user in Firebase Authentication
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: fullName,
        disabled: false,
      });
    } catch (firebaseError) {
      console.error('Firebase user creation error:', firebaseError);
      
      // Handle specific Firebase errors
      if (firebaseError.code === 'auth/email-already-exists') {
        return res.status(400).json({ 
          success: false,
          error: 'An account with this email already exists in Firebase' 
        });
      } else if (firebaseError.code === 'auth/invalid-email') {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid email format' 
        });
      } else if (firebaseError.code === 'auth/weak-password') {
        return res.status(400).json({ 
          success: false,
          error: 'Password is too weak' 
        });
      }
      
      return res.status(500).json({ 
        success: false,
        error: 'Failed to create user in Firebase Authentication' 
      });
    }

    // Step 2: Generate employee ID (optional - you can customize this logic)
    const employeeIdPrefix = 'EMP';
    const userCount = await prisma.user.count();
    const employeeId = `${employeeIdPrefix}${(userCount + 1).toString().padStart(4, '0')}`;

    // Step 3: Create user in the database
    let newUser;
    try {
      // Prepare the user data
      const userData = {
        email: email,
        fullName: fullName,
        phone: phone || null,
        firebaseId: firebaseUser.uid,
        employeeId: employeeId,
        designation: designation || null,
        role: 'EMPLOYEE', // Default role from schema
        isActive: true,
        dateOfJoining: new Date(),
      };

      // Only add departmentId if it's provided and not empty
      if (departmentId && departmentId.trim() !== '') {
        userData.departmentId = departmentId;
      }

      newUser = await prisma.user.create({
        data: userData,
        include: {
          department: true,
        },
      });

      // Step 4: Create UserCompany relationship if companyId is provided
      if (companyId && companyId.trim() !== '') {
        await prisma.userCompany.create({
          data: {
            userId: newUser.id,
            companyId: companyId,
            role: 'EMPLOYEE',
            isActive: true,
          },
        });

        // Fetch the updated user with company information
        newUser = await prisma.user.findUnique({
          where: { id: newUser.id },
          include: {
            department: true,
            userCompanies: {
              include: {
                company: true,
              },
            },
          },
        });
      }

    } catch (dbError) {
      console.error('Database user creation error:', dbError);
      
      // If database creation fails, delete the Firebase user to maintain consistency
      try {
        await admin.auth().deleteUser(firebaseUser.uid);
      } catch (cleanupError) {
        console.error('Failed to cleanup Firebase user:', cleanupError);
      }
      
      return res.status(500).json({ 
        success: false,
        error: 'Failed to create user in database' 
      });
    }

    // Step 5: Set custom claims in Firebase (optional - for role-based access)
    try {
      const customClaims = {
        role: newUser.role,
        employeeId: newUser.employeeId,
      };

      // Add companyId to claims if user is associated with a company
      if (newUser.userCompanies && newUser.userCompanies.length > 0) {
        customClaims.companyId = newUser.userCompanies[0].companyId;
      }

      await admin.auth().setCustomUserClaims(firebaseUser.uid, customClaims);
    } catch (claimsError) {
      console.error('Failed to set custom claims:', claimsError);
      // This is not critical, so we don't fail the request
    }

    // Return success response (excluding sensitive data)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        employeeId: newUser.employeeId,
        designation: newUser.designation,
        role: newUser.role,
        firebaseId: newUser.firebaseId,
        isActive: newUser.isActive,
        dateOfJoining: newUser.dateOfJoining,
        department: newUser.department,
        companies: newUser.userCompanies ? newUser.userCompanies.map(uc => uc.company) : [],
        createdAt: newUser.createdAt,
      },
    });

  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  } finally {
    await prisma.$disconnect();
  }
};

// Controller to handle user login verification
const verifyFirebaseToken = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ 
        success: false,
        error: 'Firebase ID token is required' 
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseId = decodedToken.uid;

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { firebaseId },
      include: {
        department: true,
        userCompanies: {
          include: {
            company: true,
          },
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
        error: 'User not found in database' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        error: 'User account is inactive' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User verified successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        employeeId: user.employeeId,
        designation: user.designation,
        role: user.role,
        firebaseId: user.firebaseId,
        isActive: user.isActive,
        dateOfJoining: user.dateOfJoining,
        department: user.department,
        companies: user.userCompanies ? user.userCompanies.map(uc => uc.company) : [],
        manager: user.manager,
      },
    });

  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        success: false,
        error: 'Firebase token has expired' 
      });
    } else if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid Firebase token' 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = { 
  registerUser, 
  verifyFirebaseToken 
};