const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const moment = require("moment");

/**
 * Classe gérant le coté bdd de la messagerie.
 * @class DBMessage
 * @author Bilal Boudjemline
 */
class DBMessage {
    constructor() {
        this.db = new sqlite3.Database(".db");
        this.encryptionKey = "12345678901234567890123456789012";
        this.init();
    }

    /**
     * Initialiser la base de données et les tables nécessaires pour les messages de discussion.
     */
    init() {
        this.db.serialize(() => {
            this.db.run(`CREATE TABLE IF NOT EXISTS discussions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE
            )`);

            this.db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discussion_id INTEGER,
                message TEXT,
                author TEXT,
                date TEXT,
                avatar TEXT,
                FOREIGN KEY(discussion_id) REFERENCES discussions(id)
            )`);
        });

        console.log("[✓] DBMessage initialized");
    }

    /**
     * Chiffre un texte donné en utilisant l'algorithme AES-256-CBC avec une clé de chiffrement prédéfinie.
     * @param {string} text - Le texte à chiffrer.
     * @return {string}
     */
    encrypt(text) {
        const iv = Buffer.from(this.encryptionKey.slice(0, 16));
        const cipher = crypto.createCipheriv(
            "aes-256-cbc",
            Buffer.from(this.encryptionKey),
            iv
        );
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        return encrypted;
    }

    /**
     * Déchiffre un texte donné en utilisant l'algorithme AES-256-CBC avec une clé de chiffrement prédéfinie.
     * @param {string} text - Le texte à déchiffrer.
     * @return {string}.
     */
    decrypt(text) {
        const iv = Buffer.from(this.encryptionKey.slice(0, 16));
        const decipher = crypto.createDecipheriv(
            "aes-256-cbc",
            Buffer.from(this.encryptionKey),
            iv
        );
        let decrypted = decipher.update(text, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }

    /**
     * Insère une nouvelle discussion dans la base de données.
     * @param {string} name - Le nom de la discussion.
     * @param {function} callback - La fonction de rappel avec deux paramètres : err (erreur) et discussionId (identifiant de la discussion).
     */
    insertDiscussion(name, callback) {
        this.db.run(
            `INSERT INTO discussions (name) VALUES (?)`,
            [name],
            function (err) {
                if (err) {
                    return callback(err);
                }
                callback(null, this.lastID);
            }
        );
    }

    /**
     * Supprime une discussion de la base de données et tous ses messages associés.
     * @param {number} discussionId - L'identifiant de la discussion.
     * @param {function} callback - La fonction de rappel avec un paramètre : err (erreur).
     */
    deleteDiscussion(discussionId, callback) {
        const query = "DELETE FROM discussions WHERE id = ?";
        this.db.run(query, [discussionId], (err) => {
            if (err) {
                return callback(err);
            }

            this.db.run(
                "DELETE FROM messages WHERE discussion_id = ?",
                [discussionId],
                (err) => {
                    callback(err);
                }
            );
        });
    }

    /**
     * Récupère l'identifiant d'une discussion à partir de son nom. Si la discussion n'existe pas, elle est créée.
     * @param {string} name - Le nom de la discussion.
     * @param {function} callback - La fonction de rappel avec deux paramètres : err (erreur) et discussionId (identifiant de la discussion).
     */
    getDiscussionId(name, callback) {
        this.db.get(
            `SELECT id FROM discussions WHERE name = ?`,
            [name],
            (err, row) => {
                if (err) {
                    return callback(err);
                }
                if (!row) {
                    this.insertDiscussion(name, callback);
                } else {
                    callback(null, row.id);
                }
            }
        );
    }

    /**
     * Récupère la liste de toutes les discussions.
     * @param {function} callback - La fonction de rappel avec deux paramètres : err (erreur) et discussions (tableau d'objets de discussion).
     */
    getAllDiscussions(callback) {
        this.db.all(`SELECT * FROM discussions`, [], (err, rows) => {
            if (err) {
                return callback(err);
            }
            callback(null, rows);
        });
    }

    /**
     * Insère un nouveau message dans une discussion.
     * @param {string} discussion - Le nom de la discussion.
     * @param {string} message - Le contenu du message.
     * @param {string} author - L'auteur du message.
     * @param {string} date - La date du message.
     * @param {string} avatar - L'URL de l'avatar de l'auteur.
     * @param {function} callback - La fonction de rappel avec deux paramètres : err (erreur) et messageId (identifiant du message).
     */
    insertMessage(discussion, message, author, date, avatar, callback) {
        this.getDiscussionId(discussion, (err, discussionId) => {
            if (err) {
                return callback(err);
            }
            const encryptedMessage = this.encrypt(message);
            const formattedDate = moment(date).format("YYYY-MM-DD HH:mm:ss");
            this.db.run(
                `INSERT INTO messages (discussion_id, message, author, date, avatar) VALUES (?, ?, ?, ?, ?)`,
                [discussionId, encryptedMessage, author, formattedDate, avatar],
                function (err) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, this.lastID);
                }
            );
        });
    }

    /**
     * Récupère tous les messages d'une discussion.
     * @param {string} discussion - Le nom de la discussion.
     * @param {function} callback - La fonction de rappel avec deux paramètres : err (erreur) et messages (tableau d'objets de message).
     */
    getMessages(discussion, callback) {
        this.getDiscussionId(discussion, (err, discussionId) => {
            if (err) {
                return callback(err);
            }
            this.db.all(
                `SELECT id, message, author, date, avatar FROM messages WHERE discussion_id = ?`,
                [discussionId],
                (err, rows) => {
                    if (err) {
                        return callback(err);
                    }
                    const decryptedMessages = rows.map((row) => {
                        row.message = this.decrypt(row.message);
                        row.date = moment(row.date).format(
                            "MMMM Do YYYY à hh:mm"
                        );
                        return row;
                    });
                    callback(null, decryptedMessages);
                }
            );
        });
    }
}

module.exports = DBMessage;
