import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../env';

/**
 * Interface pour étendre Socket avec les informations utilisateur
 */
export interface AuthenticatedSocket extends Socket {
    userId: number;
    email: string;
}

/**
 * Middleware d'authentification pour Socket.io
 * 
 * Vérifie le token JWT envoyé dans socket.handshake.auth.token
 * et injecte les informations utilisateur (userId, email) dans le socket
 * 
 * @param socket - Socket.io socket
 * @param next - Fonction pour continuer ou rejeter la connexion
 */
export const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;

    // Vérifier si le token est présent
    if (!token) {
        return next(new Error('Token manquant'));
    }

    try {
        // Vérifier et décoder le token JWT
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
            userId: number;
            email: string;
        };

        // Injecter les informations utilisateur dans le socket
        (socket as AuthenticatedSocket).userId = decoded.userId;
        (socket as AuthenticatedSocket).email = decoded.email;

        next();
    } catch (error) {
        // Token invalide ou expiré
        return next(new Error('Token invalide ou expiré'));
    }
};
