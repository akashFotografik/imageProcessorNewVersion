const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

// Controller to handle retrieving all services
const getServices = async (req, res) => {
  try {
    const { companyId } = req.query; // Get companyId from query params
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Basic validation
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Validate company exists and is active
    const company = await prisma.company.findUnique({
      where: { id: companyId, isActive: true }
    });

    if (!company) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or inactive company ID'
      });
    }

    // For non-SUPER_ADMIN users, check if they are associated with the company
    if (userRole !== 'SUPER_ADMIN') {
      const userCompany = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: { userId, companyId },
          isActive: true
        }
      });

      if (!userCompany) {
        return res.status(403).json({
          success: false,
          error: 'User is not authorized to view services in this company'
        });
      }
    }

    // Retrieve all active services for the company
    const services = await prisma.service.findMany({
      where: {
        companyId,
        isActive: true
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Services retrieved successfully',
      services
    });

  } catch (error) {
    console.error('Error retrieving services:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  getServices
};