// ============================
// 📘 Configuration Swagger
// ============================

// Import du module swagger-jsdoc : permet de générer automatiquement
// la documentation OpenAPI à partir des commentaires JSDoc dans ton code.
const swaggerJSDoc = require('swagger-jsdoc');

// Import du module swagger-ui-express : fournit une interface web interactive
// pour visualiser et tester les endpoints documentés par Swagger.
const swaggerUi = require('swagger-ui-express');

// Définition de la configuration principale de la documentation Swagger.
const swaggerDefinition = {
  openapi: '3.0.0',  // Spécifie la version du standard OpenAPI utilisée.
  info: {
    title: 'LEARN_BOX_API - Documentation Swagger',  // Titre de la doc
    version: '1.0.0',  // Version de l’API
    description: 'API REST pour le projet Fil Rouge',  // Description affichée en haut de Swagger UI
  },
  servers: [
    {
      url: 'http://localhost:3000',  // URL de base du serveur local
      description: 'Serveur local',  // Brève description du serveur
    },
  ],
  components: {
    // Définition des éléments réutilisables (schémas, sécurité, etc.)
    securitySchemes: {
      bearerAuth: {
        type: 'http',         // Type de sécurité HTTP
        scheme: 'bearer',     // Spécifie le schéma d’authentification Bearer
        bearerFormat: 'JWT',  // Indique que le format du token est un JWT
      },
    },
  },
};

// Options de génération pour swagger-jsdoc
const options = {
  definition: swaggerDefinition,  // Utilise la définition ci-dessus
  // Indique où trouver les fichiers contenant les routes annotées avec Swagger
  apis: ['./src/routes/*.js'],  // Tous les fichiers dans /routes seront analysés
};

// Génère le document Swagger complet (objet JSON)
const swaggerSpec = swaggerJSDoc(options);

// Exporte swaggerUi (interface web) et swaggerSpec (définition JSON)
// pour être utilisés dans app.js
module.exports = { swaggerUi, swaggerSpec };