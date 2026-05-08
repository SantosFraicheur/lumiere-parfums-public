# LUMIÈRE — Parfums Premium

Site e-commerce de parfums premium avec paiement par virement bancaire.
Backend Node.js + Express · Base de données PostgreSQL · Fichiers sur Cloudinary.

---

## Déploiement sur Railway (gratuit, sans carte bancaire)

### 1. Préparer Cloudinary (stockage fichiers gratuit)

1. Créez un compte gratuit sur [cloudinary.com](https://cloudinary.com)
2. Dashboard → **API Keys** → copiez :
   - `Cloud Name`
   - `API Key`
   - `API Secret`

---

### 2. Créer un compte Railway

1. Allez sur [railway.app](https://railway.app)
2. Cliquez **Login → Login with GitHub**
3. Autorisez Railway à accéder à votre compte GitHub

---

### 3. Créer le projet Railway

1. Dashboard Railway → **New Project**
2. Choisissez **Deploy from GitHub repo**
3. Sélectionnez le dépôt `lumiere-parfums`
4. Railway détecte automatiquement Node.js et lance le déploiement

---

### 4. Ajouter la base de données PostgreSQL

1. Dans votre projet Railway → **New** → **Database** → **Add PostgreSQL**
2. Railway crée la base et génère automatiquement la variable `DATABASE_URL`

---

### 5. Configurer les variables d'environnement

Dans votre projet Railway → **Variables** → ajoutez :

| Variable | Valeur |
|---|---|
| `ADMIN_USERNAME` | `admin_lumiere` |
| `ADMIN_PASSWORD` | `lumi_ere/2025@*` |
| `JWT_SECRET` | Cliquez **Generate** ou tapez une longue chaîne aléatoire |
| `JWT_EXPIRES_IN` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Votre cloud name |
| `CLOUDINARY_API_KEY` | Votre API key |
| `CLOUDINARY_API_SECRET` | Votre API secret |
| `NODE_ENV` | `production` |

> `DATABASE_URL` est ajouté automatiquement par Railway — ne pas le toucher.

---

### 6. Initialiser la base de données

1. Railway Dashboard → votre service **PostgreSQL** → onglet **Query**
2. Copiez-collez le contenu du fichier `db.sql` et exécutez

---

### 7. Vérifier le déploiement

Railway génère une URL publique automatiquement (ex: `lumiere-parfums.up.railway.app`).

Testez :
```
https://votre-app.up.railway.app/api/health
```
Réponse attendue : `{"status":"ok"}`

---

## Accès Admin

- Allez sur `https://votre-app.up.railway.app/#admin`
- **Identifiant :** `admin_lumiere`
- **Mot de passe :** `lumi_ere/2025@*`

---

## Commandes de déploiement

| Champ | Valeur |
|---|---|
| **Build Command** | `npm install --omit=dev` |
| **Start Command** | `node server.js` |

Ces valeurs sont détectées automatiquement via `railway.json`.

---

## Structure du projet

```
lumiere-parfums/
├── server.js          Backend Express (routes API, auth JWT, upload Cloudinary)
├── package.json       Dépendances Node.js
├── db.sql             Schéma PostgreSQL à exécuter une fois
├── railway.json       Config déploiement Railway (auto-détecté)
├── render.yaml        Config déploiement Render (alternative)
├── .env.example       Template des variables d'environnement
├── .gitignore
└── public/
    ├── index.html     Interface complète (HTML + CSS)
    └── app.js         Logique frontend (vanilla JS)
```

---

## Stack technique

| Couche | Technologie |
|---|---|
| Serveur | Node.js 18+ · Express 4 |
| Base de données | PostgreSQL (via `pg`) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Sécurité | Helmet · express-rate-limit · express-validator · CORS |
| Fichiers | Cloudinary (images produits, preuves paiement, vidéos) |
| Frontend | HTML/CSS/JS vanilla (aucun framework) |

---

## Routes API

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Santé du serveur |
| POST | `/api/register` | — | Inscription client |
| POST | `/api/login` | — | Connexion client |
| POST | `/api/admin/login` | — | Connexion admin |
| GET | `/api/products` | — | Liste produits |
| POST | `/api/products` | Admin | Créer produit |
| PUT | `/api/products/:id` | Admin | Modifier produit |
| DELETE | `/api/products/:id` | Admin | Supprimer produit |
| GET | `/api/orders/track?code=` | — | Suivi commande public |
| GET | `/api/orders/me` | Client | Mes commandes |
| GET | `/api/orders` | Admin | Toutes les commandes |
| POST | `/api/orders` | Client | Créer commande |
| PUT | `/api/orders/:id` | Admin | Changer statut |
| DELETE | `/api/orders/:id` | Admin | Supprimer commande |
| GET | `/api/settings` | — | Paramètres bancaires |
| POST | `/api/settings` | Admin | Sauvegarder paramètres |
| GET | `/api/videos` | — | Liste vidéos |
| POST | `/api/videos` | Admin | Ajouter vidéo |
| DELETE | `/api/videos/:id` | Admin | Supprimer vidéo |
| GET | `/api/customers` | Admin | Liste clients |
| POST | `/api/upload` | Admin | Upload image/vidéo → Cloudinary |
| POST | `/api/upload/proof` | Client | Upload preuve paiement → Cloudinary |
