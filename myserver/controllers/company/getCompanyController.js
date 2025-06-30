const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

const getCompanies = async (req, res) => {
  try {
    const userId = req.user?.id; // Assuming user ID is set in req.user by auth middleware
    const userRole = req.user?.role; // Assuming role is set in req.user by auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    let companies;

    if (userRole === 'SUPER_ADMIN') {
      // SUPER_ADMIN can see all companies
      companies = await prisma.company.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          email: true,
          website: true,
          logo: true,
          industry: true,
          gstNumber: true,
          panNumber: true,
          Country: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } else if (userRole === 'ADMIN') {
      // ADMIN can only see companies they're associated with
      companies = await prisma.company.findMany({
        where: {
          userCompanies: {
            some: {
              userId,
              isActive: true
            }
          },
          isActive: true
        },
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          email: true,
          website: true,
          logo: true,
          industry: true,
          gstNumber: true,
          panNumber: true,
          Country: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } else {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    return res.status(200).json({
      success: true,
      companies
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  getCompanies
};