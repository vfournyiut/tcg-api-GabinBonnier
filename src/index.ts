/**
 * Point d'entrée principal de l'application API TCG (Trading Card Game)
 * 
 * Configure et démarre le serveur Express avec toutes les routes et middlewares nécessaires.
 * Gère l'authentification, les cartes Pokémon et la gestion des decks.
 * 
 * @module index
 */

import {createServer} from "http";
import {env} from "./env";
import express from "express";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import { Server as SocketIOServer } from 'socket.io';
import { authRouter } from "./auth/auth.routes";
import cardsRoutes from './api/cards/cards.routes';
import decksRoutes from './api/decks/decks.routes';
import { aggregateSwaggerDocs } from './swagger';
import { authenticateSocket, AuthenticatedSocket } from './auth/socket.middleware';

/**
 * Instance de l'application Express
 * @type {express.Application}
 */
export const app = express();

/**
 * Configuration des middlewares
 * - CORS : Autorise toutes les origines avec credentials
 * - JSON : Parse automatiquement les corps de requête JSON
 * - Static : Sert les fichiers statiques depuis le dossier public
 */
app.use(
    cors({
        origin: true,  // Autorise toutes les origines
        credentials: true,
    }),
);

app.use(express.json());

// Serve static files (Socket.io test client)
app.use(express.static('public'));

/**
 * Configuration de Swagger UI pour la documentation de l'API
 * 
 * Accessible sur /api-docs
 * - Fusionne automatiquement toutes les documentations des modules
 * - Interface interactive pour tester les endpoints
 * - Support de l'authentification Bearer JWT
 */
const swaggerSpec = aggregateSwaggerDocs();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'TCG Pokémon API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
    }
}));

/**
 * Route de vérification de santé du serveur
 * 
 * @route GET /api/health
 * @returns {Object} Statut du serveur
 */
app.get("/api/health", (_req, res) => {
    res.json({status: "ok", message: "TCG Backend Server is running"});
});

/**
 * Configuration des routes de l'API
 * - /api/auth : Authentification (inscription, connexion)
 * - /api/cards : Gestion des cartes Pokémon
 * - /api/decks : Gestion des decks (CRUD)
 */
app.use("/api/auth", authRouter);
app.use("/api/cards", cardsRoutes);
app.use("/api/decks", decksRoutes);

// Start server only if this file is run directly (not imported for tests)
if (require.main === module) {
    // Create HTTP server
    const httpServer = createServer(app);

    // Configure Socket.io with authentication
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: true,
            credentials: true,
        },
    });

    // Apply authentication middleware to all connections
    io.use(authenticateSocket);

    // Handle authenticated connections
    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log(`✅ User connected: ${socket.email} (ID: ${socket.userId})`);

        // Example: Send welcome message with user info
        socket.emit('authenticated', {
            userId: socket.userId,
            email: socket.email,
            message: 'Successfully authenticated'
        });

        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.email}`);
        });
    });

    // Start server
    try {
        httpServer.listen(env.PORT, () => {
            console.log(`\n🚀 Server is running on http://localhost:${env.PORT}`);
            console.log(`📚 API Documentation available at http://localhost:${env.PORT}/api-docs`);
            console.log(`🧪 Socket.io Test Client available at http://localhost:${env.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}