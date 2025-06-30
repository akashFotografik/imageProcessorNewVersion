const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const { authenticateFirebaseToken } = require('./middleware/authMiddleware');
const apiRoutes = require('./routes'); // routes/index.js

const app = express();
app.use(express.json());
app.use(cors());

// Swagger config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation for My Server',
    },
    servers: [
      {
        url: 'http://localhost:8000/api',
        description: 'Local server',
      },
    ],
  },
  apis: ['./routes/**/*.js'], // <-- Look inside all route files for Swagger comments
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use all routes under `/api`
app.use('/api', apiRoutes);

// Example protected route
app.get('/protected', authenticateFirebaseToken, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

app.listen(8000, () => {
  console.log('Server running on port 8000');
});
