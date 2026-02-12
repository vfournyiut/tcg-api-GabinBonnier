import {NextFunction, Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import {env} from '../env'

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number
                email: string
            }
        }
    }
}

/**
 * Middleware d'authentification par token JWT
 * 
 * Vérifie la présence et la validité du token JWT dans l'en-tête Authorization.
 * Si le token est valide, ajoute les informations de l'utilisateur à req.user.
 * 
 * @middleware
 * @param {Request} req - Requête Express
 * @param {string} req.headers.authorization - En-tête d'autorisation au format "Bearer <token>"
 * @param {Response} res - Réponse Express
 * @param {NextFunction} next - Fonction pour passer au middleware suivant
 * @returns {Response | void} 401 si le token est manquant ou invalide, sinon appelle next()
 * @throws {Error} Token manquant ou invalide/expiré
 */
export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] 

    if (!token) {
      return res.status(401).json({error: 'Token manquant'})
    }

    try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: number
        email: string
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email
    }
    return next()
    } catch (error) {
      return res.status(401).json({error: 'Token invalide ou expiré'})
    }
}