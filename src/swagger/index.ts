import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Fusionne plusieurs fichiers YAML en un seul objet OpenAPI
 * 
 * Cette fonction charge la configuration principale et les documentations
 * de chaque module, puis les fusionne pour créer une spécification OpenAPI complète.
 * 
 * @returns {object} La spécification OpenAPI complète
 */
export function aggregateSwaggerDocs() {
    const docsDir = path.join(__dirname, '../../docs');

    // Charger la configuration principale
    const mainConfig = yaml.load(
        fs.readFileSync(path.join(docsDir, 'swagger.config.yml'), 'utf8')
    ) as any;

    // Charger les documentations par module
    const authDoc = yaml.load(
        fs.readFileSync(path.join(docsDir, 'auth.doc.yml'), 'utf8')
    ) as any;

    const cardDoc = yaml.load(
        fs.readFileSync(path.join(docsDir, 'card.doc.yml'), 'utf8')
    ) as any;

    const deckDoc = yaml.load(
        fs.readFileSync(path.join(docsDir, 'deck.doc.yml'), 'utf8')
    ) as any;

    // Fusionner tous les paths
    const allPaths = {
        ...authDoc.paths,
        ...cardDoc.paths,
        ...deckDoc.paths,
    };

    // Créer la spécification OpenAPI complète
    const swaggerSpec = {
        ...mainConfig,
        paths: allPaths,
    };

    return swaggerSpec;
}
