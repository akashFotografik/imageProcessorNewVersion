const { PrismaClient } = require('../../../generated/prisma');

const prisma = new PrismaClient();

// Controller to handle credits recharge creation
const createCreditsRecharge = async (req, res) => {
  try {
    const { credits, amountPaid, companyId, transactionId, paymentMethod } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Basic validation
    if (!credits || !amountPaid || !companyId || !paymentMethod) {
      return res.status(400).json({ 
        success: false,
        error: 'Credits, amount paid, company ID, and payment method are required' 
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

    // Check if transactionId is provided and already exists
    if (transactionId) {
      const existingTransaction = await prisma.creditsRecharge.findUnique({
        where: { transactionId }
      });

      if (existingTransaction) {
        return res.status(400).json({ 
          success: false,
          error: 'Transaction ID already exists' 
        });
      }
    }

    // Create credits recharge in the database
    const newCreditsRecharge = await prisma.creditsRecharge.create({
      data: {
        credits,
        amountPaid,
        companyId,
        transactionId: transactionId || null,
        paymentMethod,
        paymentStatus: 'PENDING',
        purchasedById: userId
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        purchasedBy: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    // Update company's total credits
    await prisma.company.update({
      where: { id: companyId },
      data: {
        totalCredits: {
          increment: credits
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Credits recharge created successfully',
      creditsRecharge: newCreditsRecharge
    });

  } catch (error) {
    console.error('Error creating credits recharge:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = { 
  createCreditsRecharge 
};