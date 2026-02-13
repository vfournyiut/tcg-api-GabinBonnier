# Documentation Swagger - TCG Pokémon API

Documentation complète de l'API TCG Pokémon avec Swagger/OpenAPI 3.0.3.

## 📁 Structure

```
docs/
├── swagger.config.yml   # Configuration principale (schémas, sécurité, infos générales)
├── auth.doc.yml        # Documentation des endpoints d'authentification
├── card.doc.yml        # Documentation des endpoints des cartes
└── deck.doc.yml        # Documentation des endpoints des decks

src/swagger/
└── index.ts            # Agrégation et fusion des documentations
```

## 🚀 Accès

Une fois le serveur démarré, accédez à la documentation interactive à :

**http://localhost:3333/api-docs**

## 🔑 Authentification

La plupart des endpoints nécessitent une authentification JWT Bearer.

### Étapes pour s'authentifier :

1. **Créer un compte ou se connecter** :
   - Utilisez l'endpoint `POST /api/auth/sign-up` pour créer un compte
   - Ou `POST /api/auth/sign-in` pour vous connecter
   
2. **Copier le token JWT** :
   - Le token est retourné dans la propriété `token` de la réponse
   - Exemple : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Configurer l'authentification dans Swagger** :
   - Cliquez sur le bouton **"Authorize" 🔒** en haut à droite
   - Entrez le token dans le champ `Value` (pas besoin d'ajouter "Bearer", c'est automatique)
   - Cliquez sur **"Authorize"**
   - Fermez le modal

4. **Tester les endpoints protégés** :
   - Tous les endpoints marqués avec 🔒 sont maintenant accessibles
   - L'authentification est automatiquement ajoutée à chaque requête

### Endpoints protégés 🔒

Les endpoints suivants nécessitent une authentification :

- `POST /api/decks` - Créer un deck
- `GET /api/decks/mine` - Récupérer mes decks
- `GET /api/decks/{id}` - Récupérer un deck par ID
- `PATCH /api/decks/{id}` - Modifier un deck
- `DELETE /api/decks/{id}` - Supprimer un deck

### Endpoints publics (pas d'authentification)

- `GET /api/health` - Health check
- `POST /api/auth/sign-up` - Inscription
- `POST /api/auth/sign-in` - Connexion
- `GET /api/cards` - Récupérer toutes les cartes

## 📝 Caractéristiques

### Configuration principale (swagger.config.yml)

- **Informations générales** : Titre, description, version, contact
- **Serveurs** : Configuration du serveur local avec port variable
- **Tags** : Organisation par modules (Health, Auth, Cards, Decks)
- **Schémas réutilisables** :
  - `User` - Utilisateur
  - `Card` - Carte Pokémon
  - `Deck` - Deck de cartes
  - `DeckCard` - Relation Deck-Carte
  - `Error`, `ValidationError`, `UnauthorizedError`, etc. - Erreurs
  - `SignUpRequest`, `SignInRequest`, `AuthResponse` - Auth
  - `CreateDeckRequest`, `UpdateDeckRequest` - Decks
- **Sécurité** : Configuration JWT Bearer avec bouton "Authorize"

### Documentation par module

Chaque module (auth, card, deck) possède son propre fichier de documentation avec :

- **Descriptions détaillées** de chaque endpoint
- **Exemples concrets** pour chaque requête
- **Tous les codes de réponse** possibles (200, 201, 400, 401, 403, 404, 500)
- **Exemples de réponses** pour succès et erreurs
- **Paramètres** (query, path, body) bien documentés

### Agrégation (src/swagger/index.ts)

Le fichier `src/swagger/index.ts` :

- Charge tous les fichiers YAML
- Fusionne les `paths` de chaque module
- Retourne une spécification OpenAPI complète
- Est appelé automatiquement au démarrage du serveur

## 🧪 Tester les endpoints

### Exemple : Créer un deck

1. Authentifiez-vous avec le bouton "Authorize" 🔒
2. Naviguez vers `POST /api/decks`
3. Cliquez sur "Try it out"
4. Sélectionnez un exemple ou créez votre propre requête :
   ```json
   {
     "name": "Mon deck Électrique",
     "cards": [25, 26, 81, 82, 100, 101, 125, 135, 145, 172]
   }
   ```
5. Cliquez sur "Execute"
6. Consultez la réponse

### Exemples pré-configurés

Chaque endpoint dispose d'exemples prêts à l'emploi :

- **Sign Up** : 2 exemples d'inscription
- **Sign In** : 3 exemples de connexion (dont blue@pokemon.com et red@pokemon.com)
- **Create Deck** : 3 exemples (Électrique, Feu, Eau)
- **Update Deck** : 3 exemples (nom seul, cartes seules, les deux)

## 🎨 Interface

L'interface Swagger UI est personnalisée avec :

- **Titre personnalisé** : "TCG Pokémon API Documentation"
- **Barre supérieure masquée** pour plus de clarté
- **Persistance de l'authentification** (le token est conservé entre les rafraîchissements)
- **Affichage de la durée** des requêtes
- **Filtrage** des endpoints
- **Mode "Try it out"** activé par défaut

## 📖 Utilisation en développement

### Démarrer le serveur

```bash
npm run dev
```

### Accéder à la documentation

Ouvrez votre navigateur à : **http://localhost:3333/api-docs**

### Modifier la documentation

1. Éditez les fichiers YAML dans `docs/`
2. Les changements sont automatiquement pris en compte au redémarrage du serveur

## 📚 Ressources

- [OpenAPI Specification 3.0.3](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Swagger Editor (online)](https://editor.swagger.io/)

## ✅ Checklist de validation

- [x] UI Swagger accessible sur `/api-docs` et fonctionnelle
- [x] Configuration principale avec schémas réutilisables (User, Card, Deck, Error)
- [x] Fichiers de documentation par module créés (auth, card, deck)
- [x] Agrégation des documentations dans `src/swagger/index.ts`
- [x] Tous les endpoints documentés avec descriptions, paramètres, corps et réponses
- [x] Authentification Bearer JWT configurée avec bouton "Authorize"
- [x] Routes protégées marquées avec `security: [bearerAuth]`
- [x] Tous les endpoints testables depuis l'UI avec exemples corrects
