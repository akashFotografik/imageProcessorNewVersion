const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

/**
 * Controller to get all users based on role and company
 */
const getAllUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    console.log('Current user:', currentUser , 'Role:', currentUser.role);

    let users;
    
    if (currentUser.role === 'SUPER_ADMIN') {
      // SUPER_ADMIN can see all users across all companies
      users = await prisma.user.findMany({
        where: {
          isActive: true
        },
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
    } else {
      // Other roles can only see users in their companies
      const userCompanies = await prisma.userCompany.findMany({
        where: {
          userId: currentUser.id,
          isActive: true
        },
        select: {
          companyId: true
        }
      });
      
      const companyIds = userCompanies.map(uc => uc.companyId);
      
      users = await prisma.user.findMany({
        where: {
          userCompanies: {
            some: {
              companyId: { in: companyIds },
              isActive: true
            }
          },
          isActive: true
        },
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
            where: {
              companyId: { in: companyIds }
            },
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
    }

    // Format user response
    const userResponse = users.map(user => ({
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
      companies: user.userCompanies.map(uc => uc.company),
      manager: user.manager,
      firebaseId: user.firebaseId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      users: userResponse
    });

  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Controller to get all admins
 */
const getAllAdmins = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'ADMIN'] },
        isActive: true
      },
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

    const userResponse = users.map(user => ({
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
      companies: user.userCompanies.map(uc => uc.company),
      manager: user.manager,
      firebaseId: user.firebaseId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return res.status(200).json({
      success: true,
      message: 'Admins retrieved successfully',
      users: userResponse
    });

  } catch (error) {
    console.error('Get admins error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Controller to get all directors
 */
const getAllDirectors = async (req, res) => {
  try {
    const currentUser = req.user;
    let users;

    if (currentUser.role === 'SUPER_ADMIN') {
      users = await prisma.user.findMany({
        where: {
          role: 'DIRECTOR',
          isActive: true
        },
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
    } else {
      // ADMIN role - get directors from same companies
      const userCompanies = await prisma.userCompany.findMany({
        where: {
          userId: currentUser.id,
          isActive: true
        },
        select: {
          companyId: true
        }
      });
      
      const companyIds = userCompanies.map(uc => uc.companyId);
      
      users = await prisma.user.findMany({
        where: {
          role: 'DIRECTOR',
          isActive: true,
          userCompanies: {
            some: {
              companyId: { in: companyIds },
              isActive: true
            }
          }
        },
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
            where: {
              companyId: { in: companyIds }
            },
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
    }

    const userResponse = users.map(user => ({
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
      companies: user.userCompanies.map(uc => uc.company),
      manager: user.manager,
      firebaseId: user.firebaseId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return res.status(200).json({
      success: true,
      message: 'Directors retrieved successfully',
      users: userResponse
    });

  } catch (error) {
    console.error('Get directors error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Controller to get all managers
 */
const getAllManagers = async (req, res) => {
  try {
    const currentUser = req.user;
    let users;

    if (currentUser.role === 'SUPER_ADMIN') {
      users = await prisma.user.findMany({
        where: {
          role: 'MANAGER',
          isActive: true
        },
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
    } else {
      // ADMIN or DIRECTOR role - get managers from same companies
      const userCompanies = await prisma.userCompany.findMany({
        where: {
          userId: currentUser.id,
          isActive: true
        },
        select: {
          companyId: true
        }
      });
      
      const companyIds = userCompanies.map(uc => uc.companyId);
      
      users = await prisma.user.findMany({
        where: {
          role: 'MANAGER',
          isActive: true,
          userCompanies: {
            some: {
              companyId: { in: companyIds },
              isActive: true
            }
          }
        },
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
            where: {
              companyId: { in: companyIds }
            },
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
    }

    const userResponse = users.map(user => ({
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
      companies: user.userCompanies.map(uc => uc.company),
      manager: user.manager,
      firebaseId: user.firebaseId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return res.status(200).json({
      success: true,
      message: 'Managers retrieved successfully',
      users: userResponse
    });

  } catch (error) {
    console.error('Get managers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  getAllUsers,
  getAllAdmins,
  getAllDirectors,
  getAllManagers
};