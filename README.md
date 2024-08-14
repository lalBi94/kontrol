# Kontrol 📋

Kontrol est une application web auto-hébergeable conçue pour centraliser les outils essentiels pour les familles ou les organisations. Ce projet, entièrement écrit en français, vise à simplifier la gestion quotidienne en regroupant toutes les fonctionnalités nécessaires en un seul endroit. Un site dédié à la documentation est en cours de développement.

## Sommaire 📑

-   [Kontrol 📋](#kontrol-)
    -   [Sommaire 📑](#sommaire-)
    -   [Fonctionnalités ✨](#fonctionnalités-)
    -   [Prérequis 🛠️](#prérequis-️)
    -   [Installation du projet 🏗️](#installation-du-projet-️)
        -   [Installation manuelle 🔧](#installation-manuelle-)
        -   [Installation semi-automatique ⚙️](#installation-semi-automatique-️)
    -   [Informations importantes](#informations-importantes)
    -   [Contribuer 🤝](#contribuer-)
    -   [Licence 📜](#licence-)
    -   [Contact 📧](#contact-)

## Fonctionnalités ✨

-   **Stockage Cloud** ☁️: Stockez et accédez facilement à vos fichiers.
-   **Calendrier** 📅: Suivez les dates et événements importants. _(Pas encore implémenté)_
-   **Notes** 📝: Prenez et organisez vos notes pour l'école ou le travail. _(Pas encore implémenté)_
-   **Galerie Photo/Vidéo** 📷🎥: Stockez et partagez vos photos et vidéos.
-   **Chat** 💬: Communiquez avec les membres de votre domaine, avec support pour les discussions de groupe.
-   **Outils Pratiques** 🛠️: Accédez à une liste pré-sélectionnée de sites web utiles choisis par l'administrateur.
-   **Site Favoris** ⭐: Enregistrez et organisez vos sites web préférés.
-   **Support** 🆘: Obtenez de l'aide pour toute question ou préoccupation concernant l'application. _(Particulièrement utile pour les organisations)_

## Prérequis 🛠️

-   Assurez-vous d'avoir [Node.js (>= v15)](https://nodejs.org/en/download/package-manager) installé sur votre machine.

-   [pnpm](https://pnpm.io/installation), ce package manager est nécessaire pour faire tourner les `.sh` présent a la racine.

-   Vous aurez besoin d'une application comme `NGINX` pour servir le site sur un serveur. `NGINX` est un serveur web performant qui gère les requêtes HTTP et peut agir comme un proxy inverse.

-   Assurez-vous d'avoir un outil comme `ufw` (Uncomplicated Firewall) pour ouvrir les ports nécessaires et permettre l'accès au serveur. Cela est essentiel pour exposer le port sur lequel votre application sera accessible publiquement.

## Installation du projet 🏗️

### Installation manuelle 🔧

1. Clonez le dépôt :

    ```sh
    git clone https://github.com/lalBi94/kontrol.git
    ```

2. Accédez au répertoire du projet :

    ```sh
    cd kontrol
    ```

3. Installez les dépendances du frontend :

    ```sh
    pnpm install
    ```

4. Installez les dépendances du backend :

    ```sh
    cd api
    pnpm install
    ```

5. Construisez le projet :

    ```sh
    cd ../
    pnpm run build
    ```

6. Déplacez le dossier `dist` dans `api/` :

    ```sh
    mv dist api
    ```

7. Installez `pm2` pour exécuter le code en arrière-plan sur votre serveur :

    ```sh
    pnpm install -g pm2
    pm2 -v
    ```

8. Démarrez le serveur :

    ```sh
    pm2 start api/main.js --name "kontrol-app" --watch --max-memory-restart 300M --instances 2 --env production
    ```

    - `--max-memory-restart` : Pour éviter les fuites de mémoire.
    - `--instances` : Pour améliorer la gestion des requêtes et alléger la charge d'un processus.

9. Exposez le port avec `ufw` et installez NGINX sur votre machine (et configurez-le).

### Installation semi-automatique ⚙️

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

4. Exposez le port avec `ufw` et installez NGINX sur votre machine (et configurez-le).

## Informations importantes

-   Vous devez configurer les variables d'environnement dans les fichiers `.env` et `api/.env` à partir des fichiers `.env.example`.
-   Les fichiers `.env` et `api/.env` ne sont pas présents lors du clonage du dépôt mais seront générés lors de l'initialisation du serveur.
-   Un fichier `api/.db` et un dossier `api/data/admin` seront créés. Le mot de passe pour accéder au compte administrateur est `kontrol-admin`.
-   Un dossier `api/temp` sera également créé.

## Contribuer 🤝

Les contributions sont les bienvenues ! Forkez le dépôt et soumettez une pull request avec un nom de branche explicite pour toute amélioration ou correction de bug. Si vous avez modifié un fichier, vous pouvez le co-signer avec votre nom ou pseudo.

En tant que contributeur principal, je m'assure de contrôler les commits avant leur intégration. Je prendrai également l'initiative de pusher directement du code sur la branche principale lorsque cela sera nécessaire. Merci pour votre compréhension et votre soutien !

## Licence 📜

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contact 📧

Pour toute question ou support, veuillez me contacter à l'adresse [pro.boudjemline@gmail.com](mailto:pro.boudjemline@gmail.com).

---

Nous espérons que Kontrol deviendra un outil précieux pour vous et votre famille ou organisation. Restez à l'écoute pour les futures mises à jour et améliorations ! 🚀
