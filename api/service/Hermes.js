const path = require("path");
const fs = require("fs/promises");

/**
 * Classe gérant les sockets pour la messagerie
 * @class Hermes
 * @author Bilal Boudjemline
 */
class Hermes {
    constructor() {
        this.users_target = path.join(__dirname, "../data");
        this.connected = [];
    }

    /**
     * Recuperer les utilisateurs connectés
     * @return {Promise<Array<string>>}
     */
    async getConnectedUsers() {
        try {
            return this.connected;
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Ajouter un utilisateur aux utilisateurs connectés
     * @param {string} user l'utilisateur
     * @param {Server} io le socket
     * @return {void}
     */
    async addConnected(user, io) {
        try {
            const path_to_target = path.join(this.users_target, user);
            const info = await fs.readdir(path_to_target);

            if (info.length > 0 && !this.connected.includes(user)) {
                this.connected.push(user);
                io.emit("kpture.connectedUsers", this.connected);
            }
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Retirer un utilisateur des utilisateurs connectés
     * @param {string} user l'utilisateur
     * @param {Server} io le socket
     */
    async disconnectSomeone(user, io) {
        try {
            this.connected = this.connected.filter((c) => c !== user);
            io.emit("kpture.connectedUsers", this.connected);
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = Hermes;
