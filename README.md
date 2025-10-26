# SaasK - Application de Gestion de Tâches

Une application web collaborative de gestion de tâches et de projets, conçue pour être performante, intuitive et agréable à utiliser. Ce projet a été développé avec Next.js, Prisma, et Shadcn/UI.

## Démo Live

> **Note:** Le lien vers la démo sera ajouté ici une fois le projet déployé.

## Fonctionnalités

-   **Authentification Complète :** Inscription et connexion sécurisées avec des identifiants (email/mot de passe).
-   **Gestion de Projets :** Créez, consultez et organisez vos projets.
-   **Tableau Kanban de Tâches :**
    -   Créez, modifiez et supprimez des tâches.
    -   Organisez les tâches par statut (À faire, En cours, Terminé) avec un système de glisser-déposer.
    -   Assignez des priorités, des dates d'échéance et des responsables pour chaque tâche.
-   **Gestion d'Utilisateurs (pour les Admins) :** Invitez, supprimez et gérez les rôles des utilisateurs au sein de votre organisation.
-   **Profil Utilisateur :** Mettez à jour vos informations de profil et changez votre mot de passe.
-   **Interface Moderne et Adaptative :**
    -   Design épuré et professionnel grâce à **Shadcn/UI**.
    -   Expérience utilisateur soignée avec des animations subtiles, des icônes et des écrans de chargement "squelette".
    -   **Mode Sombre (Dark Mode)** avec possibilité de basculer entre les thèmes.
    -   Interface entièrement adaptative pour une utilisation sur mobile et tablette.

## Stack Technique

-   **Framework Frontend :** [Next.js](https://nextjs.org/) (App Router)
-   **Base de Données :** [PostgreSQL](https://www.postgresql.org/)
-   **ORM :** [Prisma](https://www.prisma.io/)
-   **Authentification :** [NextAuth.js](https://next-auth.js.org/)
-   **UI :** [Shadcn/UI](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/)
-   **Animations :** [Framer Motion](https://www.framer.com/motion/)
-   **Notifications :** `sonner`

## Lancer le projet en local

Pour faire tourner ce projet sur votre machine, suivez les étapes ci-dessous.

### Prérequis

-   [Node.js](https://nodejs.org/en/) (version 18 ou supérieure)
-   [npm](https://www.npmjs.com/)
-   Une instance de [PostgreSQL](https://www.postgresql.org/) en cours d'exécution.

### Installation

1.  **Clonez le dépôt :**
    ```bash
    git clone <URL_DU_DEPOT>
    cd <NOM_DU_DOSSIER>
    ```

2.  **Installez les dépendances :**
    ```bash
    npm install
    ```

3.  **Configurez les variables d'environnement :**
    -   Créez un fichier `.env` à la racine du projet.
    -   Ajoutez votre chaîne de connexion à la base de données :
        ```
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
        ```
    -   Ajoutez une clé secrète pour NextAuth.js :
        ```
        NEXTAUTH_SECRET="votre_super_secret"
        ```

4.  **Appliquez les migrations de la base de données :**
    ```bash
    npx prisma migrate dev
    ```

5.  **Lancez le serveur de développement :**
    ```bash
    npm run dev
    ```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir l'application.