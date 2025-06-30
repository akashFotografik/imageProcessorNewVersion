const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

// Controller to handle company creation
const createCompany = async (req, res) => {
  try {
    const { name, address, phone, email, website, logo, industry, gstNumber, panNumber, Country } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ 
        success: false,
        error: 'Company name is required' 
      });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          error: 'Please provide a valid email address' 
        });
      }
    }

    // Check if company already exists
    const existingCompany = await prisma.company.findFirst({
      where: { name },
    });

    if (existingCompany) {
      return res.status(400).json({ 
        success: false,
        error: 'Company with this name already exists' 
      });
    }

    // Create company in the database
    const newCompany = await prisma.company.create({
      data: {
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        logo: logo || null,
        industry: industry || null,
        gstNumber: gstNumber || null,
        panNumber: panNumber || null,
        Country: Country || null,
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company: newCompany,
    });

  } catch (error) {
    console.error('Error creating company:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = { 
  createCompany 
};