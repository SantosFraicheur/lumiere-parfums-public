# LUMIÈRE — Parfums Premium

Site e-commerce de parfums premium avec paiement par virement bancaire.
Backend Node.js + Express · Base de données PostgreSQL · Fichiers sur Cloudinary.

---

## Déploiement sur Render (5 étapes)

### 1. Préparer Cloudinary (stockage fichiers gratuit)

1. Créez un compte gratuit sur [cloudinary.com](https://cloudinary.com)
2. Dashboard → **API Keys** → copiez :
   - `Cloud Name`
   - `API Key`
   - `API Secret`

---

### 2. Créer la base de données sur Render

1. Render Dashboard → **New → PostgreSQL**
2. Nom : `lumiere-db` · Plan : **Free**
3. Cliquez **Create Database**
4. Attendez ~1 minute que la DB soit prête

---

### 3. Déployer le Web Service

1. Render Dashboard → **New → Web Service**
2. Connectez ce dépôt GitHub
3. Paramètres :
   | Champ | Valeur |
   |---|---|
   | Name | `lumiere-parfums` |
   | Runtime | `Node` |
   | Build Command | `npm install --omit=dev` |
   | Start Command | `node server.js` |
   | Plan | Free |

4. **Environment Variables** — ajoutez :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | (Depuis votre DB Render → **Connection String**) |
   | `JWT_SECRET` | (Cliquez **Generate** ou générez avec `openssl rand -hex 64`) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `ADMIN_USERNAME` | `admin_lumiere` |
   | `ADMIN_PASSWORD` | `lumi_ere/2025@*` |
   | `CLOUDINARY_CLOUD_NAME` | Votre cloud name |
   | `CLOUDINARY_API_KEY` | Votre API key |
   | `CLOUDINARY_API_SECRET` | Votre API secret |
   | `NODE_ENV` | `production` |

5. Cliquez **Create Web Service**

---

### 4. Initialiser la base de données

Render Dashboard → votre DB → **PSQL Command** → collez le contenu de `db.sql` :

```bash
psql $DATABASE_URL < db.sql
```

Ou utilisez l'onglet **Query** dans le dashboard Render et exécutez le contenu de `db.sql`.

---

### 5. Vérifier le déploiement

```
https://votre-app.onrender.com/api/health
```

Réponse attendue : `{"status":"ok"}`

---

## Accès Admin

- Allez sur `https://votre-app.onrender.com/#admin`
- Connectez-vous avec `ADMIN_USERNAME` / `ADMIN_PASSWORD`

---

## Structure du projet

```
lumiere/
├── server.js          Backend Express (routes API, auth JWT, upload Cloudinary)
├── package.json       Dépendances Node.js
├── db.sql             Schéma PostgreSQL à exécuter une fois
├── render.yaml        Config déploiement automatique Render
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
