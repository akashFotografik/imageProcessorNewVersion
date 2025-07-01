const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

// Controller to handle task creation
const createTask = async (req, res) => {
  try {
    const { title, description, companyId, assignedToId, departmentId, priority, startDate, dueDate, estimatedHours } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Basic validation
    if (!title || !companyId) {
      return res.status(400).json({
        success: false,
        error: 'Title and company ID are required',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    console.log('Creating task with data:', { title, companyId, assignedToId, departmentId });

    // Validate company exists and is active
    const company = await prisma.company.findUnique({
      where: { id: companyId, isActive: true },
    });

    if (!company) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or inactive company ID',
      });
    }

    // For non-SUPER_ADMIN users, check if they are associated with the company
    if (userRole !== 'SUPER_ADMIN') {
      const userCompany = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: { userId, companyId },
          isActive: true,
        },
      });

      if (!userCompany) {
        return res.status(403).json({
          success: false,
          error: 'User is not authorized to create tasks in this company',
        });
      }
    }

    let finalDepartmentId = departmentId;
    let finalAssignedToId = assignedToId;

    // If departmentId is provided, validate and assign to department head
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId, isActive: true },
        include: { headOfDept: true },
      });

      if (!department) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or inactive department ID',
        });
      }

      if (department.companyId !== companyId) {
        return res.status(400).json({
          success: false,
          error: 'Department does not belong to the specified company',
        });
      }

      if (!department.headOfDeptId) {
        return res.status(400).json({
          success: false,
          error: 'Department has no head assigned',
        });
      }
      console.log('Department found:', department.name);
      finalAssignedToId = department.headOfDeptId;
      console.log('Assigning task to department head:', finalAssignedToId);
    }

    // If assignedToId is provided (or was set from department head), validate user
    if (finalAssignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: finalAssignedToId, isActive: true },
      });

      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or inactive assigned user ID',
        });
      }

      // Check if assigned user is associated with the company
      const assignedUserCompany = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: { userId: finalAssignedToId, companyId },
          isActive: true,
        },
      });

      if (!assignedUserCompany) {
        return res.status(400).json({
          success: false,
          error: 'Assigned user is not associated with this company',
        });
      }
    }

    // Create task in the database
    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        companyId,
        assignedToId: finalAssignedToId || null, // Allow null if no user assigned
        departmentId: finalDepartmentId || null,
        priority: priority || 'MEDIUM',
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours || null,
        createdById: userId,
        status: 'TODO',
        isActive: true,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        assignedTo: {
          select: { id: true, fullName: true, email: true },
        },
        department: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        tableName: 'tasks',
        recordId: newTask.id,
        newData: {
          title,
          companyId,
          assignedToId: finalAssignedToId || null,
          departmentId: finalDepartmentId || null,
        },
        description: `Task ${title} created by ${userId}${finalAssignedToId ? `, assigned to ${finalAssignedToId}` : ''}${finalDepartmentId ? ` for department ${finalDepartmentId}` : ''}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        companyId,
        userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: newTask,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  } finally {
    await prisma.$disconnect();
  }
};

// Controller to handle task deletion
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Validate task exists and is active
    const task = await prisma.task.findUnique({
      where: { id: taskId, isActive: true },
      include: {
        company: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
        department: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or is inactive',
      });
    }

    // For non-SUPER_ADMIN users, check if they are associated with the company
    if (userRole !== 'SUPER_ADMIN') {
      const userCompany = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: { userId, companyId: task.companyId },
          isActive: true,
        },
      });

      if (!userCompany) {
        return res.status(403).json({
          success: false,
          error: 'User is not authorized to delete tasks in this company',
        });
      }
    }

    // Soft delete task by setting isActive to false
    await prisma.task.update({
      where: { id: taskId },
      data: { isActive: false },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        tableName: 'tasks',
        recordId: taskId,
        oldData: { title: task.title, companyId: task.companyId },
        description: `Task ${task.title} deleted by ${userId}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        companyId: task.companyId,
        userId,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  } finally {
    await prisma.$disconnect();
  }
};

// Controller to assign task to a user
const assignTaskToUser = async (req, res) => {
  try {
    const { taskId, userId: assignedToId, companyId } = req.body;
    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role;

    // Basic validation
    if (!taskId || !assignedToId || !companyId) {
      return res.status(400).json({
        success: false,
        error: 'Task ID, user ID, and company ID are required',
      });
    }

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Validate task exists and is active
    const task = await prisma.task.findUnique({
      where: { id: taskId, isActive: true },
      include: {
        company: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
        department: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or is inactive',
      });
    }

    // Validate company exists and matches task
    if (task.companyId !== companyId) {
      return res.status(400).json({
        success: false,
        error: 'Task does not belong to the specified company',
      });
    }

    // Validate assigned user exists and is active
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedToId, isActive: true },
    });

    if (!assignedUser) {
      return res.status(404).json({
        success: false,
        error: 'Assigned user not found or is inactive',
      });
    }

    // Check if assigned user is associated with the company
    const assignedUserCompany = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: { userId: assignedToId, companyId },
        isActive: true,
      },
    });

    if (!assignedUserCompany) {
      return res.status(400).json({
        success: false,
        error: 'Assigned user is not associated with this company',
      });
    }

    // For non-SUPER_ADMIN users, check if they are authorized
    if (currentUserRole !== 'SUPER_ADMIN') {
      const userCompany = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: { userId: currentUserId, companyId },
          isActive: true,
        },
      });

      if (!userCompany) {
        return res.status(403).json({
          success: false,
          error: 'User is not authorized to assign tasks in this company',
        });
      }
    }

    // Update task assignment
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedToId,
        departmentId: null, // Clear departmentId if assigning to user directly
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        assignedTo: {
          select: { id: true, fullName: true, email: true },
        },
        department: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        tableName: 'tasks',
        recordId: taskId,
        oldData: { assignedToId: task.assignedToId },
        newData: { assignedToId },
        description: `Task ${task.title} assigned to user ${assignedToId} by ${currentUserId}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        companyId,
        userId: currentUserId,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Task assigned successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error assigning task to user:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  } finally {
    await prisma.$disconnect();
  }
};

// Controller to assign task to a department
const assignTaskToDepartment = async (req, res) => {
  try {
    const { taskId, departmentId, companyId } = req.body;
    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role;

    // Basic validation
    if (!taskId || !departmentId || !companyId) {
      return res.status(400).json({
        success: false,
        error: 'Task ID, department ID, and company ID are required',
      });
    }

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    // Validate task exists and is active
    const task = await prisma.task.findUnique({
      where: { id: taskId, isActive: true },
      include: {
        company: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
        department: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or is inactive',
      });
    }

    // Validate company exists and matches task
    if (task.companyId !== companyId) {
      return res.status(400).json({
        success: false,
        error: 'Task does not belong to the specified company',
      });
    }

    // Validate department exists and is active
    const department = await prisma.department.findUnique({
      where: { id: departmentId, isActive: true },
      include: { headOfDept: true },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found or is inactive',
      });
    }

    // Validate department belongs to the company
    if (department.companyId !== companyId) {
      return res.status(400).json({
        success: false,
        error: 'Department does not belong to the specified company',
      });
    }

    // Check if department has a head
    if (!department.headOfDeptId) {
      return res.status(400).json({
        success: false,
        error: 'Department has no head assigned',
      });
    }

    // For non-SUPER_ADMIN users, check if they are authorized
    if (currentUserRole !== 'SUPER_ADMIN') {
      const userCompany = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: { userId: currentUserId, companyId },
          isActive: true,
        },
      });

      if (!userCompany) {
        return res.status(403).json({
          success: false,
          error: 'User is not authorized to assign tasks in this company',
        });
      }
    }

    // Update task assignment to department head
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedToId: department.headOfDeptId,
        departmentId,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        assignedTo: {
          select: { id: true, fullName: true, email: true },
        },
        department: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        tableName: 'tasks',
        recordId: taskId,
        oldData: { assignedToId: task.assignedToId, departmentId: task.departmentId },
        newData: { assignedToId: department.headOfDeptId, departmentId },
        description: `Task ${task.title} assigned to department ${department.name} (head: ${department.headOfDeptId}) by ${currentUserId}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        companyId,
        userId: currentUserId,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Task assigned to department successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error assigning task to department:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  } finally {
    await prisma.$disconnect();
  }
};

// Controller to get tasks
const getTasks = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { companyId } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    let tasks;

    if (userRole === 'SUPER_ADMIN') {
      if (companyId) {
        // Validate company exists and is active
        const company = await prisma.company.findUnique({
          where: { id: companyId, isActive: true },
        });

        if (!company) {
          return res.status(400).json({
            success: false,
            error: 'Invalid or inactive company ID',
          });
        }

        // Fetch tasks for the specific company
        tasks = await prisma.task.findMany({
          where: {
            companyId,
            isActive: true, // Only fetch active tasks
          },
          include: {
            company: {
              select: { id: true, name: true },
            },
            assignedTo: {
              select: { id: true, fullName: true, email: true },
            },
            department: {
              select: { id: true, name: true },
            },
            createdBy: {
              select: { id: true, fullName: true },
            },
          },
        });
      } else {
        // Fetch all tasks for SUPER_ADMIN
        tasks = await prisma.task.findMany({
          where: { isActive: true }, // Only fetch active tasks
          include: {
            company: {
              select: { id: true, name: true },
            },
            assignedTo: {
              select: { id: true, fullName: true, email: true },
            },
            department: {
              select: { id: true, name: true },
            },
            createdBy: {
              select: { id: true, fullName: true },
            },
          },
        });
      }
    } else {
      // For non-SUPER_ADMIN, fetch tasks for companies the user is associated with
      const userCompanies = await prisma.userCompany.findMany({
        where: { userId, isActive: true },
        select: { companyId: true },
      });

      if (!userCompanies.length) {
        return res.status(403).json({
          success: false,
          error: 'User is not associated with any company',
        });
      }

      const companyIds = userCompanies.map((uc) => uc.companyId);

      // If companyId is provided, ensure user is associated with it
      if (companyId && !companyIds.includes(companyId)) {
        return res.status(403).json({
          success: false,
          error: 'User is not authorized to view tasks for this company',
        });
      }

      // Fetch tasks for associated companies
      tasks = await prisma.task.findMany({
        where: {
          companyId: companyId ? companyId : { in: companyIds },
          isActive: true, // Only fetch active tasks
        },
        include: {
          company: {
            select: { id: true, name: true },
          },
          assignedTo: {
            select: { id: true, fullName: true, email: true },
          },
          department: {
            select: { id: true, name: true },
          },
          createdBy: {
            select: { id: true, fullName: true },
          },
        },
      });

      if (tasks.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No tasks found for associated companies',
          tasks: [],
        });
      }
    }

    return res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  createTask,
  deleteTask,
  assignTaskToUser,
  assignTaskToDepartment,
  getTasks,
};