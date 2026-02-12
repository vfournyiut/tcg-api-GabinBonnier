import {PokemonType} from "../generated/prisma/client";

/**
 * Règles du jeu Pokemon TCG
 * Contient les fonctions pures pour le calcul des dégâts et le système de types
 */

/**
 * Retourne la faiblesse principale d'un type Pokémon
 * 
 * Détermine quel type de Pokémon est super efficace contre le type défenseur.
 * Basé sur les règles du jeu de cartes Pokémon TCG.
 * 
 * @param {PokemonType} defenderType - Le type du Pokémon défenseur
 * @returns {PokemonType | null} Le type auquel le défenseur est faible, ou null si aucune faiblesse
 * @example
 * getWeakness(PokemonType.Fire) // retourne PokemonType.Water
 * getWeakness(PokemonType.Dragon) // retourne PokemonType.Ice
 */
export function getWeakness(defenderType: PokemonType): PokemonType | null {
    switch (defenderType) {
        case PokemonType.Normal:
            return PokemonType.Fighting;
        case PokemonType.Fire:
            return PokemonType.Water;
        case PokemonType.Water:
            return PokemonType.Electric;
        case PokemonType.Electric:
            return PokemonType.Ground;
        case PokemonType.Grass:
            return PokemonType.Fire;
        case PokemonType.Ice:
            return PokemonType.Fire;
        case PokemonType.Fighting:
            return PokemonType.Psychic;
        case PokemonType.Poison:
            return PokemonType.Psychic;
        case PokemonType.Ground:
            return PokemonType.Water;
        case PokemonType.Flying:
            return PokemonType.Electric;
        case PokemonType.Psychic:
            return PokemonType.Dark;
        case PokemonType.Bug:
            return PokemonType.Fire;
        case PokemonType.Rock:
            return PokemonType.Water;
        case PokemonType.Ghost:
            return PokemonType.Dark;
        case PokemonType.Dragon:
            return PokemonType.Ice;
        case PokemonType.Dark:
            return PokemonType.Fighting;
        case PokemonType.Steel:
            return PokemonType.Fire;
        case PokemonType.Fairy:
            return PokemonType.Poison;
        default:
            return null;
    }
}

/**
 * Calcule le multiplicateur de dégâts selon les types de l'attaquant et du défenseur
 * 
 * Retourne 2.0 si le type de l'attaquant correspond à la faiblesse du défenseur (super efficace),
 * sinon retourne 1.0 (dégâts normaux).
 * 
 * @param {PokemonType} attackerType - Le type du Pokémon attaquant
 * @param {PokemonType} defenderType - Le type du Pokémon défenseur
 * @returns {number} Le multiplicateur de dégâts (1.0 pour normal, 2.0 pour super efficace)
 * @example
 * getDamageMultiplier(PokemonType.Water, PokemonType.Fire) // retourne 2.0 (super efficace)
 * getDamageMultiplier(PokemonType.Fire, PokemonType.Water) // retourne 1.0 (normal)
 */
export function getDamageMultiplier(attackerType: PokemonType, defenderType: PokemonType): number {
    const weakness = getWeakness(defenderType);

    // Si le type de l'attaquant correspond à la faiblesse du défenseur
    if (weakness === attackerType) {
        return 2.0; // Super efficace (x2 dégâts)
    }

    return 1.0; // Dégâts normaux
}

/**
 * Calcule les dégâts infligés lors d'une attaque
 * 
 * Applique le multiplicateur de type aux points d'attaque pour calculer les dégâts finaux.
 * Les dégâts sont arondis vers le bas et un minimum de 1 dégât est garanti.
 * 
 * @param {number} attackerAttack - Les points d'attaque du Pokémon attaquant
 * @param {PokemonType} attackerType - Le type du Pokémon attaquant
 * @param {PokemonType} defenderType - Le type du Pokémon défenseur
 * @returns {number} Les dégâts finaux infligés (minimum 1)
 * @example
 * calculateDamage(50, PokemonType.Water, PokemonType.Fire) // retourne 100 (50 * 2.0)
 * calculateDamage(30, PokemonType.Fire, PokemonType.Water) // retourne 30 (30 * 1.0)
 * calculateDamage(0, PokemonType.Normal, PokemonType.Normal) // retourne 1 (minimum garanti)
 */
export function calculateDamage(
    attackerAttack: number,
    attackerType: PokemonType,
    defenderType: PokemonType
): number {
    const multiplier = getDamageMultiplier(attackerType, defenderType);

    const damage = Math.floor(attackerAttack * multiplier);

    return Math.max(1, damage);
}
