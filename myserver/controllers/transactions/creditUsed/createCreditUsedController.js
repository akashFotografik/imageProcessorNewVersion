const { PrismaClient } = require('../../../generated/prisma');

const prisma = new PrismaClient();

// Controller to handle transaction history creation
const createTransactionHistory = async (req, res) => {
  try {
    const { creditsUsed, companyId, serviceId, numberOfDaysUsed, description } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Basic validation
    if (!creditsUsed || !companyId) {
      return res.status(400).json({ 
        success: false,
        error: 'Credits used and company ID are required' 
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if user is SUPER_ADMIN or ADMIN
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN' && userRole !== 'DIRECTOR') {
      return res.status(403).json({
        success: false,
        error: 'Only SUPER_ADMIN, ADMIN, or DIRECTOR can create credits recharges'
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

    // Validate sufficient credits
    if (company.totalCredits < creditsUsed) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient credits available'
      });
    }

    // Validate service exists and is active if provided
    let service = null;
    if (serviceId) {
      service = await prisma.service.findUnique({
        where: { id: serviceId, isActive: true }
      });

      if (!service) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid or inactive service ID' 
        });
      }
    }

    // Create transaction history in the database
    const newTransactionHistory = await prisma.transactionHistory.create({
      data: {
        creditsUsed,
        companyId,
        serviceId: serviceId || null,
        numberOfDaysUsed: numberOfDaysUsed || null,
        enabledById: userId,
        description: description || null
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        service: {
          select: {
            id: true,
            name: true
          }
        },
        enabledBy: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    // Update company's used credits
    await prisma.company.update({
      where: { id: companyId },
      data: {
        usedCredits: {
          increment: creditsUsed
        },
        totalCredits: {
          decrement: creditsUsed
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Transaction history created successfully',
      transactionHistory: newTransactionHistory
    });

  } catch (error) {
    console.error('Error creating transaction history:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = { 
  createTransactionHistory 
};