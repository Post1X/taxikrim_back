const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Taxi-Krim',
        description: 'DOC for Taxi-Krim',
    },
    host: '5.35.89.71:3001',
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Bearer <token>'
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ]
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
