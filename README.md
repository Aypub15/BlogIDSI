# 📝 BlogIDSI

Plateforme de blog fullstack développée dans le cadre du projet IDSI. Les utilisateurs peuvent s'inscrire, se connecter, publier des articles par catégorie, et commenter les publications.

---

## 📐 Architecture du projet

Ce dépôt est un **monorepo** contenant deux applications :

```
BlogIDSI/
├── FrontendBlog/          # Application React (SPA)
├── BackendBlog12/         # API REST Jakarta EE (WAR)
├── jenkins/               # Image Docker Jenkins personnalisée
├── docker-compose.yml     # Orchestration Frontend + Backend
├── docker-compose.jenkins.yml  # Jenkins CI
├── Jenkinsfile            # Pipeline CI/CD
└── .env.example           # Modèle de variables d'environnement
```

| Couche | Stack technique |
|--------|----------------|
| **Frontend** | React 19, TypeScript, Vite 6, React Router 7, Supabase Auth |
| **Backend** | Java 17, Jakarta EE 10, Jersey (JAX-RS), Hibernate ORM 6.4 |
| **Base de données** | PostgreSQL (via Supabase) |
| **CI/CD** | Jenkins (Docker), Pipeline déclaratif |
| **Déploiement** | Docker Compose, Nginx, Tomcat 10.1 |

---

## ✨ Fonctionnalités

- 🔐 **Authentification** — Inscription et connexion via Supabase Auth (email / mot de passe)
- 📰 **Articles** — Création, modification, suppression d'articles avec image et catégorie
- 🗂️ **Catégories** — Organisation des articles par catégorie
- 💬 **Commentaires** — Système de commentaires sur les articles
- 👤 **Espace personnel** — Page « Mes articles » pour gérer ses propres publications
- 🛡️ **Routes protégées** — Accès restreint aux pages de création/édition pour les utilisateurs connectés

---

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** 22+ et **npm**
- **Java** 17+ (JDK)
- **Maven** 3.9+ (ou utiliser le wrapper `mvnw` inclus)
- **Docker** et **Docker Compose** (optionnel, pour le déploiement conteneurisé)
- Un projet **Supabase** (gratuit sur [supabase.com](https://supabase.com))

---

## ⚙️ Configuration des variables d'environnement

> **⚠️ IMPORTANT : Les fichiers `.env` ne doivent JAMAIS être poussés sur GitHub.**  
> Le `.gitignore` exclut déjà les fichiers `.env`. Chaque développeur doit créer ses propres fichiers `.env` en local.

### Étape 1 — Variables du Backend (racine du projet)

Copier le fichier modèle et remplir avec vos valeurs :

```bash
# À la racine du projet
cp .env.example .env
```

Puis éditer le fichier `.env` :

```env
SUPABASE_DB_URL=jdbc:postgresql://aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
SUPABASE_DB_USER=postgres.votre_project_ref
SUPABASE_DB_PASSWORD=votre_mot_de_passe_base_de_donnees
```

> 🔍 **Où trouver ces valeurs ?**  
> Allez dans votre [Tableau de bord Supabase](https://supabase.com/dashboard) → **Settings** → **Database** → **Connection string** → choisissez **URI** et copiez les informations.

### Étape 2 — Variables du Frontend

Créer un fichier `.env` dans le dossier `FrontendBlog/` :

```bash
# Dans le dossier FrontendBlog/
cd FrontendBlog
```

Créer le fichier `FrontendBlog/.env` avec le contenu suivant :

```env
VITE_API_URL=http://localhost:8080/blog/api
VITE_SUPABASE_URL=https://votre_projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

> 🔍 **Où trouver ces valeurs ?**  
> - `VITE_SUPABASE_URL` : Supabase Dashboard → **Settings** → **API** → **Project URL**  
> - `VITE_SUPABASE_ANON_KEY` : Supabase Dashboard → **Settings** → **API** → **Project API keys** → `anon` / `public`  
> - `VITE_API_URL` : L'URL de votre backend (en local : `http://localhost:8080/blog/api`)

### Résumé des variables d'environnement

| Variable | Fichier | Description |
|----------|---------|-------------|
| `SUPABASE_DB_URL` | `.env` (racine) | URL JDBC de connexion PostgreSQL Supabase |
| `SUPABASE_DB_USER` | `.env` (racine) | Utilisateur de la base de données |
| `SUPABASE_DB_PASSWORD` | `.env` (racine) | Mot de passe de la base de données |
| `VITE_SUPABASE_URL` | `FrontendBlog/.env` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | `FrontendBlog/.env` | Clé publique (anon) Supabase |
| `VITE_API_URL` | `FrontendBlog/.env` | URL de l'API backend |

---

## 🖥️ Lancement en développement (sans Docker)

### Backend

```bash
cd BackendBlog12

# Définir les variables d'environnement (PowerShell)
$env:SUPABASE_DB_URL="jdbc:postgresql://host.pooler.supabase.com:5432/postgres?sslmode=require"
$env:SUPABASE_DB_USER="postgres.votre_ref"
$env:SUPABASE_DB_PASSWORD="votre_mdp"

# Compiler et packager le WAR
./mvnw clean package -DskipTests

# Déployer sur Tomcat (copier le WAR dans webapps/)
```

> Le backend sera accessible sur `http://localhost:8080/blog/api`

### Frontend

```bash
cd FrontendBlog

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

> Le frontend sera accessible sur `http://localhost:5173`  
> Le proxy Vite redirige automatiquement les appels `/api` vers le backend.

---

## 🐳 Lancement avec Docker Compose

Assurez-vous que le fichier `.env` à la racine et `FrontendBlog/.env` sont configurés, puis :

```bash
docker compose up -d --build
```

| Service | URL |
|---------|-----|
| Frontend (Nginx) | http://localhost:3000 |
| Backend (Tomcat) | http://localhost:8080/blog/api |

Pour arrêter :

```bash
docker compose down
```

---

## 📡 Endpoints de l'API REST

Tous les endpoints sont préfixés par `/api`.

### Catégories — `/api/categories`

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/categories` | Lister toutes les catégories |
| `GET` | `/api/categories/{id}` | Obtenir une catégorie par ID |
| `POST` | `/api/categories` | Créer une catégorie |
| `PUT` | `/api/categories/{id}` | Modifier une catégorie |
| `DELETE` | `/api/categories/{id}` | Supprimer une catégorie |

### Articles — `/api/articles`

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/articles` | Lister tous les articles |
| `GET` | `/api/articles/{id}` | Obtenir un article par ID |
| `GET` | `/api/articles/category/{categoryId}` | Articles par catégorie |
| `GET` | `/api/articles/user/{authorId}` | Articles par auteur |
| `POST` | `/api/articles` | Créer un article |
| `PUT` | `/api/articles/{id}` | Modifier un article |
| `DELETE` | `/api/articles/{id}` | Supprimer un article |

### Commentaires — `/api/comments`

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/comments/article/{articleId}` | Commentaires d'un article |
| `POST` | `/api/comments` | Ajouter un commentaire |
| `DELETE` | `/api/comments/{id}` | Supprimer un commentaire |

---

## 🧪 Tests

### Frontend

```bash
cd FrontendBlog
npm run test      # Vitest + React Testing Library
npm run lint      # ESLint
```

### Backend

```bash
cd BackendBlog12
./mvnw test       # JUnit 5
```

---

## 🔄 CI/CD — Jenkins

Le projet inclut un pipeline Jenkins conteneurisé.

```bash
# Démarrer Jenkins
docker compose -f docker-compose.jenkins.yml up -d --build

# Accéder à Jenkins
# http://localhost:8081

# Récupérer le mot de passe initial
docker exec blog-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Le pipeline (`Jenkinsfile`) exécute :
1. ✅ Checkout du code source
2. ✅ Installation des dépendances frontend (`npm ci`)
3. ✅ Build du frontend (`npm run build`)
4. ✅ Build du backend (`mvnw clean package`)
5. ✅ Archivage des artefacts (WAR + dist)

---

## 📁 Structure détaillée du Frontend

```
FrontendBlog/src/
├── main.tsx                    # Point d'entrée React
├── App.tsx                     # Routes & layout principal
├── types.ts                    # Interfaces TypeScript
├── auth/
│   ├── authProvider.ts         # Fonctions Supabase Auth
│   └── ProtectedRoute.tsx      # Garde de route (redirect si non connecté)
├── components/
│   ├── Navbar.tsx              # Barre de navigation
│   ├── Footer.tsx              # Pied de page
│   ├── ArticleCard.tsx         # Carte d'aperçu d'article
│   ├── CategorySection.tsx     # Section catégories
│   └── CommentSection.tsx      # Section commentaires
└── pages/
    ├── Home.tsx                # Page d'accueil
    ├── Login.tsx               # Connexion
    ├── Register.tsx            # Inscription
    ├── ArticlePage.tsx         # Lecture d'un article
    ├── CreateArticle.tsx       # Créer un article (protégé)
    ├── EditArticle.tsx         # Modifier un article (protégé)
    └── MyArticles.tsx          # Mes articles (protégé)
```

---

## 📁 Structure détaillée du Backend

```
BackendBlog12/src/main/java/com/example/backendblog/
├── HelloApplication.java       # @ApplicationPath("/api")
├── config/
│   ├── CorsFilter.java         # Filtre CORS (autorise toutes origines)
│   └── HibernateUtil.java      # Configuration Hibernate (lit les env vars)
├── dao/
│   ├── ArticleDao.java         # Accès données articles
│   ├── CategoryDao.java        # Accès données catégories
│   └── CommentDao.java         # Accès données commentaires
├── model/
│   ├── Article.java            # Entité article
│   ├── Category.java           # Entité catégorie
│   └── Comment.java            # Entité commentaire
└── resource/
    ├── ArticleResource.java    # REST endpoints articles
    ├── CategoryResource.java   # REST endpoints catégories
    └── CommentResource.java    # REST endpoints commentaires
```

---

## 🔒 Sécurité — Bonnes pratiques pour les `.env`

1. **Ne jamais commit les fichiers `.env`** — Ils sont déjà dans le `.gitignore`
2. **Utiliser `.env.example`** — Fichier modèle sans valeurs sensibles, committé dans le dépôt
3. **Régénérer les clés compromises** — Si des clés ont été poussées par erreur, les régénérer immédiatement dans le dashboard Supabase
4. **Variables en production** — Utiliser les variables d'environnement du système ou les secrets Docker/Jenkins au lieu de fichiers `.env`

---

## 👥 Auteurs

Projet réalisé dans le cadre du module IDSI.

---

## 📄 Licence

Ce projet est à usage éducatif.
