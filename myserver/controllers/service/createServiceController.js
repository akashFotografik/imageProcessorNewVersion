const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

// Controller to handle service creation
const createService = async (req, res) => {
  try {
    const { name, companyId, description, price } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Basic validation
    if (!name || !companyId || price === undefined) {
      return res.status(400).json({ 
        success: false,
        error: 'Service name, company ID, and price are required' 
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if user is SUPER_ADMIN
    if (userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only SUPER_ADMIN can create services'
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

    // Check if service already exists in the company
    const existingService = await prisma.service.findFirst({
      where: { 
        name,
        companyId
      }
    });

    if (existingService) {
      return res.status(400).json({ 
        success: false,
        error: 'Service with this name already exists in the company' 
      });
    }

    // Create service in the database
    const newService = await prisma.service.create({
      data: {
        name,
        companyId,
        description: description || null,
        price,
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

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: newService
    });

  } catch (error) {
    console.error('Error creating service:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = { 
  createService 
};