/**
 * Configuration de la connexion à la base de données Prisma
 * 
 * Utilise l'adaptateur PostgreSQL pour se connecter à la base de données.
 * La chaîne de connexion est définie dans les variables d'environnement.
 * 
 * @module database
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { env } from "./env";

/**
 * Adaptateur PostgreSQL pour Prisma
 * @type {PrismaPg}
 */
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

/**
 * Instance du client Prisma pour interagir avec la base de données
 * Utilisé dans toute l'application pour exécuter des requêtes SQL via l'ORM Prisma
 * @type {PrismaClient}
 */
export const prisma = new PrismaClient({ adapter });
