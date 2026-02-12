import {Router, Request, Response} from 'express'
import {prisma} from '../../database'
import {authenticateToken} from '../../auth/auth.middleware'

const router = Router()

router.use(authenticateToken)

/**
 * Crée un nouveau deck de cartes pour l'utilisateur authentifié
 * 
 * @route POST /api/decks
 * @access Protected - Nécessite authentification JWT
 * @param {Request} req - Requête Express
 * @param {string} req.body.name - Nom du deck
 * @param {number[]} req.body.cards - Tableau de 10 IDs de cartes
 * @param {Response} res - Réponse Express
 * @returns {Promise<Response>} 201 - Deck créé avec succès, retourne le deck avec ses cartes
 * @returns {Promise<Response>} 400 - Données invalides (nom manquant, pas 10 cartes, cartes invalides)
 * @returns {Promise<Response>} 500 - Erreur serveur
 * @throws {Error} Le nom du deck est requis
 * @throws {Error} Les cartes doivent être un tableau
 * @throws {Error} Un deck doit contenir exactement 10 cartes
 * @throws {Error} Une ou plusieurs cartes sont invalides
 */
router.post('/', async (req: Request, res: Response) => {
    const {name, cards} = req.body

    try {
        if (!name) {
            return res.status(400).json({error: 'Le nom du deck est requis'})
        }

        if (!cards || !Array.isArray(cards)) {
            return res.status(400).json({error: 'Les cartes doivent être un tableau'})
        }

        if (cards.length !== 10) {
            return res.status(400).json({error: 'Un deck doit contenir exactement 10 cartes'})
        }

        const existingCards = await prisma.card.findMany({
            where: {
                id: {in: cards}
            }
        })

        if (existingCards.length !== 10) {
            return res.status(400).json({error: 'Une ou plusieurs cartes sont invalides'})
        }

        const deck = await prisma.deck.create({
            data: {
                name,
                userId: req.user!.userId,
                cards: {
                    create: cards.map(cardId => ({
                        cardId
                    }))
                }
            },
            include: {
                cards: {
                    include: {
                        card: true
                    }
                }
            }
        })

        return res.status(201).json(deck)
    } catch (error) {
        console.error('Erreur lors de la création du deck:', error)
        return res.status(500).json({error: 'Erreur serveur'})
    }
})

/**
 * Récupère tous les decks de l'utilisateur authentifié
 * 
 * @route GET /api/decks/mine
 * @access Protected - Nécessite authentification JWT
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @returns {Promise<Response>} 200 - Liste de tous les decks de l'utilisateur avec leurs cartes, triés par date de création (plus récent en premier)
 * @returns {Promise<Response>} 500 - Erreur serveur
 * @throws {Error} Erreur lors de la récupération des decks depuis la base de données
 */
router.get('/mine', async (req: Request, res: Response) => {
    try {
        const decks = await prisma.deck.findMany({
            where: {
                userId: req.user!.userId
            },
            include: {
                cards: {
                    include: {
                        card: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return res.status(200).json(decks)
    } catch (error) {
        console.error('Erreur lors de la récupération des decks:', error)
        return res.status(500).json({error: 'Erreur serveur'})
    }
})

/**
 * Récupère un deck spécifique par son ID
 * 
 * @route GET /api/decks/:id
 * @access Protected - Nécessite authentification JWT
 * @param {Request} req - Requête Express
 * @param {string} req.params.id - ID du deck à récupérer
 * @param {Response} res - Réponse Express
 * @returns {Promise<Response>} 200 - Deck trouvé avec ses cartes
 * @returns {Promise<Response>} 403 - Accès non autorisé (le deck n'appartient pas à l'utilisateur)
 * @returns {Promise<Response>} 404 - Deck non trouvé
 * @returns {Promise<Response>} 500 - Erreur serveur
 * @throws {Error} Deck non trouvé
 * @throws {Error} Accès non autorisé à ce deck
 */
router.get('/:id', async (req: Request, res: Response) => {
    const {id} = req.params

    try {
        const deck = await prisma.deck.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                cards: {
                    include: {
                        card: true
                    }
                }
            }
        })

        if (!deck) {
            return res.status(404).json({error: 'Deck non trouvé'})
        }

        if (deck.userId !== req.user!.userId) {
            return res.status(403).json({error: 'Accès non autorisé à ce deck'})
        }

        return res.status(200).json(deck)
    } catch (error) {
        console.error('Erreur lors de la récupération du deck:', error)
        return res.status(500).json({error: 'Erreur serveur'})
    }
})

/**
 * Modifie un deck existant (nom et/ou cartes)
 * 
 * @route PATCH /api/decks/:id
 * @access Protected - Nécessite authentification JWT
 * @param {Request} req - Requête Express
 * @param {string} req.params.id - ID du deck à modifier
 * @param {string} [req.body.name] - Nouveau nom du deck (optionnel)
 * @param {number[]} [req.body.cards] - Nouveau tableau de 10 IDs de cartes (optionnel)
 * @param {Response} res - Réponse Express
 * @returns {Promise<Response>} 200 - Deck modifié avec succès
 * @returns {Promise<Response>} 400 - Données invalides (pas 10 cartes, cartes invalides)
 * @returns {Promise<Response>} 403 - Accès non autorisé (le deck n'appartient pas à l'utilisateur)
 * @returns {Promise<Response>} 404 - Deck non trouvé
 * @returns {Promise<Response>} 500 - Erreur serveur
 * @throws {Error} Deck non trouvé
 * @throws {Error} Accès non autorisé à ce deck
 * @throws {Error} Les cartes doivent être un tableau
 * @throws {Error} Un deck doit contenir exactement 10 cartes
 * @throws {Error} Une ou plusieurs cartes sont invalides
 */
router.patch('/:id', async (req: Request, res: Response) => {
    const {id} = req.params
    const {name, cards} = req.body

    try {
        const existingDeck = await prisma.deck.findUnique({
            where: {
                id: parseInt(id)
            }
        })

        if (!existingDeck) {
            return res.status(404).json({error: 'Deck non trouvé'})
        }

        if (existingDeck.userId !== req.user!.userId) {
            return res.status(403).json({error: 'Accès non autorisé à ce deck'})
        }

        if (cards !== undefined) {
            if (!Array.isArray(cards)) {
                return res.status(400).json({error: 'Les cartes doivent être un tableau'})
            }

            if (cards.length !== 10) {
                return res.status(400).json({error: 'Un deck doit contenir exactement 10 cartes'})
            }

            const existingCards = await prisma.card.findMany({
                where: {
                    id: {in: cards}
                }
            })

            if (existingCards.length !== 10) {
                return res.status(400).json({error: 'Une ou plusieurs cartes sont invalides'})
            }

            await prisma.deckCard.deleteMany({
                where: {
                    deckId: parseInt(id)
                }
            })

            await prisma.deckCard.createMany({
                data: cards.map(cardId => ({
                    deckId: parseInt(id),
                    cardId
                }))
            })
        }

        const updatedDeck = await prisma.deck.update({
            where: {
                id: parseInt(id)
            },
            data: {
                ...(name && {name})
            },
            include: {
                cards: {
                    include: {
                        card: true
                    }
                }
            }
        })

        return res.status(200).json(updatedDeck)
    } catch (error) {
        console.error('Erreur lors de la modification du deck:', error)
        return res.status(500).json({error: 'Erreur serveur'})
    }
})

/**
 * Supprime un deck existant
 * 
 * @route DELETE /api/decks/:id
 * @access Protected - Nécessite authentification JWT
 * @param {Request} req - Requête Express
 * @param {string} req.params.id - ID du deck à supprimer
 * @param {Response} res - Réponse Express
 * @returns {Promise<Response>} 200 - Deck supprimé avec succès
 * @returns {Promise<Response>} 403 - Accès non autorisé (le deck n'appartient pas à l'utilisateur)
 * @returns {Promise<Response>} 404 - Deck non trouvé
 * @returns {Promise<Response>} 500 - Erreur serveur
 * @throws {Error} Deck non trouvé
 * @throws {Error} Accès non autorisé à ce deck
 */
router.delete('/:id', async (req: Request, res: Response) => {
    const {id} = req.params

    try {
        const existingDeck = await prisma.deck.findUnique({
            where: {
                id: parseInt(id)
            }
        })

        if (!existingDeck) {
            return res.status(404).json({error: 'Deck non trouvé'})
        }

        if (existingDeck.userId !== req.user!.userId) {
            return res.status(403).json({error: 'Accès non autorisé à ce deck'})
        }

        await prisma.deckCard.deleteMany({
            where: {
                deckId: parseInt(id)
            }
        })

        await prisma.deck.delete({
            where: {
                id: parseInt(id)
            }
        })

        return res.status(200).json({message: 'Deck supprimé avec succès'})
    } catch (error) {
        console.error('Erreur lors de la suppression du deck:', error)
        return res.status(500).json({error: 'Erreur serveur'})
    }
})

export default router
