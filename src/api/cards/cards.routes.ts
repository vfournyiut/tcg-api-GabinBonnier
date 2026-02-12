import {Router, Request, Response} from 'express'
import {prisma} from '../../database'

const router = Router()

/**
 * Récupère toutes les cartes Pokémon disponibles
 * 
 * @route GET /api/cards
 * @param {Request} _req - Requête Express (non utilisée)
 * @param {Response} res - Réponse Express
 * @returns {Promise<Response>} 200 - Liste de toutes les cartes triées par numéro Pokédex
 * @returns {Promise<Response>} 500 - Erreur serveur
 * @throws {Error} Erreur lors de la récupération des cartes depuis la base de données
 */
router.get('/', async (_req: Request, res: Response) => {
    try {
        const cards = await prisma.card.findMany({
            orderBy: {
                pokedexNumber: 'asc'
            }
        })
        
        return res.status(200).json(cards)
    } catch (error) {
        console.error('Erreur lors de la récupération des cartes:', error)
        return res.status(500).json({error: 'Erreur serveur'})
    }
})

export default router