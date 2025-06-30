const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

// Controller to handle assigning services to a company
const assignServices = async (req, res) => {
  try {
    const { companyId, serviceIds } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Basic validation
    if (!companyId || !serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Company ID and a non-empty array of service IDs are required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if user has required role
    if (!['SUPER_ADMIN', 'ADMIN', 'DIRECTOR'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Only SUPER_ADMIN, ADMIN, or DIRECTOR can assign services'
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
          error: 'User is not authorized to assign services to this company'
        });
      }
    }

    // Validate all service IDs exist and are active
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        isActive: true
      }
    });

    if (services.length !== serviceIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more service IDs are invalid or inactive'
      });
    }

    // Check for services already assigned to another company
    const alreadyAssignedServices = services.filter(service => service.companyId && service.companyId !== companyId);
    if (alreadyAssignedServices.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Services ${alreadyAssignedServices.map(s => s.name).join(', ')} are already assigned to another company`
      });
    }

    // Assign services to the company by updating their companyId
    await prisma.service.updateMany({
      where: {
        id: { in: serviceIds },
        isActive: true
      },
      data: {
        companyId,
        updatedAt: new Date()
      }
    });

    // Fetch updated services to return in response
    const updatedServices = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        isActive: true
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Services assigned successfully',
      services: updatedServices
    });

  } catch (error) {
    console.error('Error assigning services:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  assignServices
};