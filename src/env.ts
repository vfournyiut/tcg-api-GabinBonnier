/**
 * Configuration des variables d'environnement de l'application
 * 
 * Charge les variables depuis le fichier .env et fournit des valeurs par défaut.
 * 
 * @module env
 */

import dotenv from "dotenv";

dotenv.config();

/**
 * Variables d'environnement de l'application
 * 
 * @property {number|string} PORT - Port d'écoute du serveur (défaut: 3001)
 * @property {string} JWT_SECRET - Secret pour signer les tokens JWT (défaut: "default-secret")
 * @property {string} DATABASE_URL - URL de connexion à la base de données PostgreSQL
 * @property {string} NODE_ENV - Environnement d'exécution (development, production, test)
 */
export const env = {
    PORT: process.env.PORT || 3001,
    JWT_SECRET: (process.env.JWT_SECRET || "default-secret") as string,
    DATABASE_URL: (process.env.DATABASE_URL || "file:./dev.db") as string,
    NODE_ENV: (process.env.NODE_ENV || "development") as string,
};
