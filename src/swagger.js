const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const dotenv = require('dotenv');
dotenv.config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecom Admin API',
      version: '1.0.0',
      description: 'API documentation for Ecom Admin backend',
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL,
      },
    ],
    components: {
      schemas: {
        Business: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            _id: { type: 'string', description: 'Business ID' },
            name: { type: 'string' },
            address: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          required: ['business', 'name'],
          properties: {
            _id: { type: 'string', description: 'Category ID' },
            business: { type: 'string', description: 'Business ID' },
            name: { type: 'string' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          required: ['business', 'category', 'name', 'price'],
          properties: {
            _id: { type: 'string', description: 'Product ID' },
            business: { type: 'string', description: 'Business ID' },
            category: { type: 'string', description: 'Category ID' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'number' },
            status: { type: 'string', enum: ['active', 'inactive'], default: 'active' },
            profileImage: { type: 'string', description: 'Main product image URL' },
            imageList: { type: 'array', items: { type: 'string' }, description: 'Additional product image URLs' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          required: ['business', 'email', 'password'],
          properties: {
            _id: { type: 'string', description: 'User ID' },
            business: { type: 'string', description: 'Business ID' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password', minLength: 6 },
            name: { type: 'string' },
            role: { type: 'string', enum: ['user', 'manager', 'admin'], default: 'user' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Admin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            _id: { type: 'string', description: 'Admin ID' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password', minLength: 6 }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
