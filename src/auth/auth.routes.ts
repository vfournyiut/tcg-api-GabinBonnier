import {Request, Response, Router} from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {prisma} from "../database";
import {env} from "../env";

export const authRouter = Router()

/**
 * Route d'inscription d'un nouvel utilisateur
 * 
 * @route POST /api/auth/sign-up
 * @param {Request} req - Requête Express contenant les données de l'utilisateur
 * @param {string} req.body.email - Email de l'utilisateur
 * @param {string} req.body.username - Nom d'utilisateur
 * @param {string} req.body.password - Mot de passe en clair
 * @param {Response} res - Réponse Express
 * @returns {Promise<Response>} 201 - Utilisateur créé avec succès, retourne le token JWT et les infos utilisateur
 * @returns {Promise<Response>} 400 - Données manquantes dans la requête
 * @returns {Promise<Response>} 409 - Email déjà utilisé
 * @returns {Promise<Response>} 500 - Erreur serveur
 * @throws {Error} Erreur lors du hachage du mot de passe ou de la création de l'utilisateur
 */
authRouter.post('/sign-up', async (req: Request, res: Response) => {
    const {email, username, password} = req.body

    try {
        if (!email || !username || !password) {
            return res.status(400).json({error: 'Données manquantes'})
        }

        const existingUser = await prisma.user.findUnique({
            where: {email},
        })

        if (existingUser) {
            return res.status(409).json({error: 'Email déjà utilisé'})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            },
        })

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
            },
            env.JWT_SECRET,
            {expiresIn: '7d'},
        )

        return res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        })
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error)
        return res.status(500).json({error: 'Erreur serveur'})
    }
})

/**
 * Route de connexion d'un utilisateur existant
 * 
 * @route POST /api/auth/sign-in
 * @param {Request} req - Requête Express contenant les identifiants
 * @param {string} req.body.email - Email de l'utilisateur
 * @param {string} req.body.password - Mot de passe en clair
 * @param {Response} res - Réponse Express
 * @returns {Promise<Response>} 200 - Connexion réussie, retourne le token JWT et les infos utilisateur
 * @returns {Promise<Response>} 400 - Données manquantes dans la requête
 * @returns {Promise<Response>} 401 - Email ou mot de passe incorrect
 * @returns {Promise<Response>} 500 - Erreur serveur
 * @throws {Error} Erreur lors de la vérification du mot de passe ou de la génération du token
 */
authRouter.post('/sign-in', async (req: Request, res: Response) => {
    const {email, password} = req.body

    try {
        if (!email || !password) {
            return res.status(400).json({error: 'Données manquantes'})
        }

        const user = await prisma.user.findUnique({
            where: {email},
        })

        if (!user) {
            return res.status(401).json({error: 'Email ou mot de passe incorrect'})
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({error: 'Email ou mot de passe incorrect'})
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
            },
            env.JWT_SECRET,
            {expiresIn: '7d'},
        )

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        })
    } catch (error) {
        console.error('Erreur lors de la connexion:', error)
        return res.status(500).json({error: 'Erreur serveur'})
    }
})