# Kontrol 📋

Kontrol est une application web auto-hébergeable conçue pour servir de centre névralgique pour les familles ou les organisations. Elle regroupe des fonctionnalités essentielles pour garder tout le monde connecté et organisé en un seul endroit. Le projet est entièrement écrit en français.

## Sommaire 📑

-   [Kontrol 📋](#kontrol-)
    -   [Sommaire 📑](#sommaire-)
    -   [Fonctionnalités ✨](#fonctionnalités-)
    -   [Prérequis 🛠️](#prérequis-️)
    -   [Installation du projet 🏗️](#installation-du-projet-️)
        -   [De façon permanente (manuel) 🔧](#de-façon-permanente-manuel-)
        -   [De façon permanente (semi-automatique) ⚙️](#de-façon-permanente-semi-automatique-️)
    -   [Informations importante](#informations-importante)
    -   [Contribuer 🤝](#contribuer-)
    -   [Licence 📜](#licence-)
    -   [Contact 📧](#contact-)

## Fonctionnalités ✨

-   **Stockage Cloud** ☁️: Stockez et accédez rapidement à vos fichiers.
-   **Calendrier** 📅: Suivez les dates et événements importants. _(pas encore implémenté)_
-   **Notes** 📝: Prenez et organisez des notes pour l'école ou le travail. _(pas encore implémenté)_
-   **Galerie Photo/Vidéo** 📷🎥: Stockez et partagez des photos et des vidéos.
-   **Chat** 💬: Communiquez avec les membres de votre domaine, avec support pour les discussions de groupe.
-   **Outils Pratiques** 🛠️: Une liste pré-sélectionnée de sites web utiles choisie par l'administrateur.
-   **Site Favoris** ⭐: Enregistrez et organisez vos sites web préférés.
-   **Support** 🆘: Obtenez de l'aide pour toute question ou préoccupation sur l'application. _(plus utile pour les organisations)_

## Prérequis 🛠️

Assurez-vous d'avoir [Node.js (>= v15)](https://nodejs.org/en/download/package-manager) installé sur votre machine.

## Installation du projet 🏗️

### De façon permanente (manuel) 🔧

1. Clonez le dépôt :

    ```sh
    git clone https://github.com/lalBi94/kontrol.git
    ```

2. Accédez au répertoire du projet :

    ```sh
    cd kontrol
    ```

3. Installez les dépendances du frontend (à la racine) :

    ```sh
    npm install
    ```

4. Installez les dépendances du backend (dans `api/`) :

    ```sh
    cd api
    npm install
    ```

5. À la racine, construisez le projet :

    ```sh
    cd ../
    pnpm run build
    ```

6. Déplacez le dossier `dist` dans `api/` :

    ```sh
    mv dist api
    ```

7. Si vous prévoyez de faire des modifications, pensez à re-construire le projet !

8. Installez pm2 afin d'exécuter le code en arrière-plan sur votre serveur :

    ```sh
    npm install -g pm2
    # Redémarrez le terminal si nécessaire
    pm2 -v
    ```

9. Démarrez le serveur :

    ```sh
    pm2 start api/main.js --name "kontrol-app" --watch --max-memory-restart 300M --instances 2 --env production
    ```

    - `max-memory-restart` : Pour éviter les fuites de mémoire.
    - `instances` : Pour mieux gérer le partage de requêtes (alléger la charge d'un processus).

10. Exposez votre port à l'aide de `ufw` et installez NGINX sur votre machine (et configurez-le).

### De façon permanente (semi-automatique) ⚙️

1. Clonez le dépôt :

    ```sh
    git clone https://github.com/lalBi94/kontrol.git
    ```

2. Accédez au répertoire du projet :

    ```sh
    cd kontrol
    ```

3. Lancez le script d'installation :

    ```sh
    sh self_host.sh
    ```

4. Exposez votre port à l'aide de `ufw` et installez `NGINX` sur votre machine (et configurez-le).

## Informations importante

Vous devez configurer les variables d'environnement se trouvant `.env` et `api/.env` partir des `.env.example`.
Ils ne sont pas présent au clonage du répo mais dans le processus d'initialisation du serveur, un fichier `api/.db` devrait apparaitre ainsi qu'un dossier `api/data/admin`. Le mot de passe pour accéder au compte administrateur est `kontrol-admin`.

## Contribuer 🤝

Les contributions sont les bienvenues ! Veuillez forker le dépôt et soumettre une pull request avec un nom de branche explicite pour toute amélioration ou correction de bug. Si vous avez modifier un fichier, libre a vous de le co-signer avec votre nom / pseudo.

## Licence 📜

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contact 📧

Pour toute question ou support, veuillez me contacter à l'adresse mail [pro.boudjemline@gmail.com](mailto:pro.boudjemline@gmail.com).

---

Nous espérons que Kontrol deviendra un outil précieux pour vous et votre famille ou organisation. Restez à l'écoute pour les futures mises à jour et améliorations ! 🚀
