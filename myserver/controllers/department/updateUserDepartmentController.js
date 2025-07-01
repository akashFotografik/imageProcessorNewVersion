const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

// Controller to handle updating/assigning a user's department
const updateUserDepartment = async (req, res) => {
  try {
    const { userId, departmentId, companyId } = req.body;
    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role;

    // Basic validation
    if (!userId || !departmentId || !companyId) {
      return res.status(400).json({
        success: false,
        error: 'User ID, department ID, and company ID are required'
      });
    }

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Validate user exists and is active
    const targetUser = await prisma.user.findUnique({
      where: { id: userId, isActive: true }
    });

    if (!targetUser) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or inactive user ID'
      });
    }

    // Validate department exists and is active
    const department = await prisma.department.findUnique({
      where: { id: departmentId, isActive: true }
    });

    if (!department) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or inactive department ID'
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

    // Validate department belongs to the specified company
    if (department.companyId !== companyId) {
      return res.status(400).json({
        success: false,
        error: 'Department does not belong to the specified company'
      });
    }

    // For non-SUPER_ADMIN users, check if they are authorized
    if (currentUserRole !== 'SUPER_ADMIN') {
      // Check if current user is associated with the company
      const userCompany = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: { userId: currentUserId, companyId },
          isActive: true
        }
      });

      if (!userCompany) {
        return res.status(403).json({
          success: false,
          error: 'User is not authorized to modify departments in this company'
        });
      }

      // Check if target user is associated with the company
      const targetUserCompany = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: { userId, companyId },
          isActive: true
        }
      });

      if (!targetUserCompany) {
        return res.status(400).json({
          success: false,
          error: 'Target user is not associated with this company'
        });
      }

      // Only ADMIN, DIRECTOR, or MANAGER can modify department assignments
      if (!['ADMIN', 'DIRECTOR', 'MANAGER'].includes(currentUserRole)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to modify department assignments'
        });
      }
    }

    // Update user's department
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        departmentId
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            companyId: true
          }
        },
        userCompanies: {
          select: {
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        tableName: 'users',
        recordId: userId,
        oldData: { departmentId: targetUser.departmentId },
        newData: { departmentId },
        description: `User department changed to ${department.name} by ${currentUserId}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        companyId,
        userId: currentUserId
      }
    });

    return res.status(200).json({
      success: true,
      message: 'User department updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user department:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  updateUserDepartment
};