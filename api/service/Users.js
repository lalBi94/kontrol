const path = require("path");
const fs = require("fs/promises");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Someone = require("../types/SomeoneSchema");
const { cp } = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

/**
 * Classe gérant les utilisateurs
 * @class Users
 * @author Bilal Boudjemline
 */
class Users {
    constructor() {
        this.users_target = path.join(__dirname, "../data");

        this.reserved_paths = [
            path.join(this.users_target, "calendar"),
            path.join(this.users_target, "galery"),
            path.join(this.users_target, "notes"),
            path.join(this.users_target, "user.data.json"),
            path.join(this.users_target, "website_fav.data.json"),
        ];

        this.planLimit = {
            admin: 99999,
            regular: 100,
            premium: 500,
        };
    }

    /**
     * Décoder un jeton JWT
     * @param {string} token Le jeton JWT à décoder
     * @return {Promise<{error: string | null, decoded: object | null}>}
     */
    async decodeToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT);

            return {
                error: null,
                decoded,
            };
        } catch (err) {
            console.error("Erreur de décodage du jeton:", err);

            return {
                error: "Une erreur est survenue lors du décodage du jeton.",
                decoded: null,
            };
        }
    }

    /**
     * Générer un jeton JWT
     * @param {object} user Les informations de l'utilisateur
     * @return {Promise<{error: string | null, token: string | null}>}
     */
    async genToken(user, time) {
        try {
            const token = jwt.sign(user, process.env.JWT, {
                expiresIn: time,
            });
            return { error: null, token };
        } catch (err) {
            console.error("Erreur lors de la création du jeton:", err);
            return {
                error: "Une erreur est survenue lors de la création du jeton.",
                token: null,
            };
        }
    }

    /**
     * Connexion de l'utilisateur
     * @param {string} name Le nom de l'utilisateur
     * @param {string} password Le mot de passe de l'utilisateur
     * @param {boolean} remember Si l'utilisateur souhaite se souvenir de la session
     * @return {Promise<{error: string | null, token: string | null}>}
     */
    async login(name, password, remember) {
        try {
            const path_to_target = path.join(
                this.users_target,
                name,
                "user.data.json"
            );

            if (!(await this.fileExists(path_to_target))) {
                return { error: "Utilisateur non trouvé.", token: null };
            }

            const config_file = await fs.readFile(path_to_target);
            const decoded = JSON.parse(config_file);

            const its_alright = await bcrypt.compare(
                password,
                decoded.password
            );

            if (its_alright && remember) {
                const gen_token = await this.genToken(decoded, "24h");
                return {
                    error: null,
                    token: gen_token.token,
                };
            } else if (its_alright) {
                const gen_token2 = await this.genToken(decoded, "1h");
                return {
                    error: null,
                    token: gen_token2.token,
                };
            } else {
                return {
                    error: "Mot de passe incorrect.",
                    token: null,
                };
            }
        } catch (err) {
            console.error("Erreur lors de la connexion:", err);
            return {
                error: "Impossible de vous connecter.",
                token: null,
            };
        }
    }

    /**
     * Récupérer tous les utilisateurs
     * @return {Promise<{error: string | null, data: object[] | null}>}
     */
    async retreiveAll() {
        try {
            const users_list = await fs.readdir(this.users_target);
            const stock = [];

            for (let e of users_list) {
                const path_to_target = path.join(
                    this.users_target,
                    e,
                    "user.data.json"
                );

                if (await this.fileExists(path_to_target)) {
                    const config_file = await fs.readFile(path_to_target);
                    const decoded = JSON.parse(config_file);
                    delete decoded.password;

                    stock.push(decoded);
                }
            }

            return { error: null, data: stock };
        } catch (err) {
            console.error(
                "Erreur lors de la récupération des utilisateurs:",
                err
            );
            return {
                error: "Impossible de récupérer les utilisateurs.",
                data: null,
            };
        }
    }

    /**
     * Enregistrer un utilisateur
     * @param {{user: string, level: number, img: string, password: string}} user Les informations de l'utilisateur
     * @return {Promise<{error: string | null}>}
     */
    async registerSomeone(user) {
        try {
            const path_to_user = path.join(this.users_target, user.user);

            if (await this.fileExists(path_to_user)) {
                return { error: "L'utilisateur existe déjà." };
            }

            user.password = (await this.hashPassword(user.password)).data;

            const someone = new Someone(
                user.user,
                user.password,
                user.level,
                user.img
            );

            if (!someone) {
                return { error: "Probleme avec les données transmises." };
            }

            await fs.mkdir(path_to_user, { recursive: true });
            const formatted = someone.getObject();

            const path_to_user_data = path.join(path_to_user, "user.data.json");
            await fs.writeFile(path_to_user_data, JSON.stringify(formatted));

            const path_to_website_fav = path.join(
                path_to_user,
                "website_fav.data.json"
            );

            await fs.writeFile(path_to_website_fav, JSON.stringify([]));

            await Promise.all(
                ["calendar", "galery", "storage", "notes"].map(async (v) => {
                    const path_to_features = path.join(path_to_user, v);
                    await fs.mkdir(path_to_features, { recursive: true });
                })
            );

            return { error: null };
        } catch (err) {
            console.error(
                "Erreur lors de l'enregistrement de l'utilisateur:",
                err
            );
            return {
                error: "Impossible de créer un utilisateur avec ce pseudo.",
            };
        }
    }

    /**
     * Chiffrer un mot de passe
     * @param {string} password Le mot de passe à chiffrer
     * @return {Promise<{error: string | null, data: string | null}>}
     */
    async hashPassword(password) {
        try {
            const hashed_password = await bcrypt.hash(password, 15);
            return { error: null, data: hashed_password };
        } catch (err) {
            console.error("Erreur lors du chiffrement du mot de passe:", err);
            return {
                error: "Impossible de chiffrer le mot de passe.",
                data: null,
            };
        }
    }

    /**
     * Vérifier si un fichier existe
     * @param {string} filePath Le chemin du fichier
     * @return {Promise<boolean>}
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Supprimer massivement des utilisateurs
     * @param {Array<String>} list Le chemin du fichier
     * @return {Promise<{error: null | string}>}
     */
    async massiveDelete(list) {
        try {
            console.log(list);
            for (let el of list) {
                const path_to_target = path.join(this.users_target, el);

                try {
                    await fs.access(path_to_target);
                    await fs.rm(path_to_target, { recursive: true });
                } catch (err) {
                    console.error(err);
                }
            }

            return { error: null };
        } catch (err) {
            console.error(err);
            return {
                error: "Erreur lors de la suppression massive des utilisateurs.",
            };
        }
    }
}

module.exports = Users;
