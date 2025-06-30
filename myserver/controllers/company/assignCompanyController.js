const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

const assignCompany = async (req, res) => {
  try {
    const { userId, companyId, role = 'EMPLOYEE' } = req.body;

    // Basic validation
    if (!userId || !companyId) {
      return res.status(400).json({
        success: false,
        error: 'userId and companyId are required'
      });
    }

    // Validate role
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'INTERN', 'DIRECTOR'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role provided'
      });
    }

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    // Check if company exists and is active
    const company = await prisma.company.findUnique({
      where: { id: companyId, isActive: true }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found or inactive'
      });
    }

    // Check if user is already assigned to the company
    const existingAssignment = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: { userId, companyId }
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        error: 'User is already assigned to this company'
      });
    }

    // Create new UserCompany record
    const userCompany = await prisma.userCompany.create({
      data: {
        userId,
        companyId,
        role,
        isActive: true,
        joinedAt: new Date()
      },
      select: {
        id: true,
        userId: true,
        companyId: true,
        role: true,
        isActive: true,
        joinedAt: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Company assigned to user successfully',
      userCompany
    });

  } catch (error) {
    console.error('Error assigning company to user:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  assignCompany
};