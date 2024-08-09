const path = require("path");
const fs = require("fs/promises");

/**
 * Classe gérant les sites favoris.
 * @class Webfav
 * @author Bilal Boudjemline
 */
class Webfav {
    constructor() {
        this.users_target = path.join(__dirname, "../data");
    }

    /**
     * Supprime un site web des favoris d'un utilisateur.
     * @param {string} user - Nom d'utilisateur.
     * @param {string} url - URL du site à supprimer des favoris.
     * @returns {Promise<{error: string|null}>} Résultat de l'opération de suppression.
     */
    async deleteWebsiteFav(user, url) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "website_fav.data.json"
            );

            const file = await fs.readFile(path_to_target);
            const obj_file = JSON.parse(file);
            const ope = obj_file.filter((item) => item.url !== url);

            if (obj_file.length !== ope.length) {
                await fs.writeFile(path_to_target, JSON.stringify(ope));

                return {
                    error: null,
                };
            } else {
                return {
                    error: "Rien a supprimer !",
                };
            }
        } catch (err) {
            console.error(err);
            return {
                error: "Impossible de supprimer un site favoris.",
            };
        }
    }

    /**
     * Récupère la liste des sites web favoris d'un utilisateur.
     * @param {string} user - Nom d'utilisateur.
     * @returns {Promise<{error: string|null, website_fav: Array<Object>}>} Liste des sites web favoris et erreur éventuelle.
     */
    async retreiveWebsiteFav(user) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "website_fav.data.json"
            );
            const file = await fs.readFile(path_to_target);
            const final_result = JSON.parse(file);

            return { error: null, website_fav: final_result };
        } catch (err) {
            console.error(err);
            return {
                error: "Impossible de recuperer la liste des sites favoris d'un utilisateur.",
            };
        }
    }

    /**
     * Ajoute un nouveau site web aux favoris d'un utilisateur.
     * @param {string} user - Nom d'utilisateur.
     * @param {string} url - URL du site à ajouter aux favoris.
     * @param {string} name - Nom du site.
     * @param {string} image_url - URL de l'image associée au site.
     * @returns {Promise<{error: string|null}>} Résultat de l'opération d'ajout de site en favoris.
     */
    async addWebsiteFav(user, url, name, image_url) {
        try {
            const fusion = { url, name, image_url };

            const path_to_target = path.join(
                this.users_target,
                user,
                "website_fav.data.json"
            );

            const past_v = await fs.readFile(path_to_target);
            const final_past = JSON.parse(past_v);
            final_past.push(fusion);

            await fs.writeFile(path_to_target, JSON.stringify(final_past));

            return {
                error: null,
            };
        } catch (err) {
            console.error(err);
            return { error: "Impossible d'ajouter un site en favoris." };
        }
    }
}

module.exports = Webfav;
