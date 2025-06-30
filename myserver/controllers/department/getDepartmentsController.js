const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

const getDepartments = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { companyId } = req.query; // Optional companyId from query params

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    let departments;

    if (userRole === 'SUPER_ADMIN') {
      // SUPER_ADMIN can get departments for a specific company or all departments
      if (companyId) {
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

        departments = await prisma.department.findMany({
          where: {
            companyId,
            isActive: true
          },
          include: {
            company: {
              select: { id: true, name: true }
            },
            headOfDept: {
              select: { id: true, fullName: true, email: true }
            }
          }
        });
      } else {
        // No companyId provided, return all active departments
        departments = await prisma.department.findMany({
          where: { isActive: true },
          include: {
            company: {
              select: { id: true, name: true }
            },
            headOfDept: {
              select: { id: true, fullName: true, email: true }
            }
          }
        });
      }
    } else if (userRole === 'ADMIN') {
      // ADMIN can only get departments of companies they are associated with
      departments = await prisma.department.findMany({
        where: {
          company: {
            userCompanies: {
              some: {
                userId,
                isActive: true
              }
            },
            isActive: true
          },
          isActive: true
        },
        include: {
          company: {
            select: { id: true, name: true }
          },
          headOfDept: {
            select: { id: true, fullName: true, email: true }
          }
        }
      });

      if (departments.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'User is not associated with any company'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    return res.status(200).json({
      success: true,
      departments
    });

  } catch (error) {
    console.error('Error fetching departments:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  getDepartments
};