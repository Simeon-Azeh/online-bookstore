const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Online Bookstore API",
      version: "1.0.0",
      description: "API documentation for the online bookstore",
    },
    servers: [
      {
        url: "https://online-bookstore-yqif.onrender.com",
        description: "Production server",
      },
      {
        url: "http://localhost:5000",
        description: "Local server",
      },
    ],
  },
  apis: [__dirname + "/routes/*.js"], // Absolute path for swagger-jsdoc
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
