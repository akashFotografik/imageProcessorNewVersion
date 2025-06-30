const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

// Controller to handle department creation
const createDepartment = async (req, res) => {
  try {
    const { name, companyId, description, headOfDeptId } = req.body; // Changed from headOfDept
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Basic validation
    if (!name || !companyId) {
      return res.status(400).json({ 
        success: false,
        error: 'Department name and company ID are required' 
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
          error: 'User is not authorized to create departments in this company'
        });
      }
    }

    // Validate headOfDeptId if provided
    if (headOfDeptId) {
      const headUser = await prisma.user.findUnique({
        where: { id: headOfDeptId, isActive: true }
      });

      if (!headUser) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or inactive head of department user ID'
        });
      }

      // Check if the head of department is associated with the company
      const headUserCompany = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: { userId: headOfDeptId, companyId },
          isActive: true
        }
      });

      if (!headUserCompany) {
        return res.status(400).json({
          success: false,
          error: 'Head of department is not associated with this company'
        });
      }
    }

    // Check if department already exists in the company
    const existingDepartment = await prisma.department.findFirst({
      where: { 
        name,
        companyId
      }
    });

    if (existingDepartment) {
      return res.status(400).json({ 
        success: false,
        error: 'Department with this name already exists in the company' 
      });
    }

    // Create department in the database
    const newDepartment = await prisma.department.create({
      data: {
        name,
        companyId,
        description: description || null,
        headOfDeptId: headOfDeptId || null, // Changed from headOfDept
        isActive: true
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        headOfDept: { // Include headOfDept user details
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department: newDepartment
    });

  } catch (error) {
    console.error('Error creating department:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = { 
  createDepartment 
};