const sharp = require("sharp");
const path = require("path");
const fs = require("fs/promises");
const archiver = require("archiver");

/**
 * Classe gérant l'album.
 * @class Photomaton
 * @author Bilal Boudjemline
 */
class Photomaton {
    constructor() {
        this.users_target = path.join(__dirname, "../data");
    }

    /**
     * Optimise une image en la redimensionnant et en modifiant son format.
     * @param {string} inputPath - Chemin vers le fichier image à optimiser.
     * @returns {Promise<string>} Chemin vers le fichier image optimisé.
     */
    async optimizeImage(inputPath) {
        const outputPath = `${inputPath}-optimized`;

        await sharp(inputPath)
            .resize(800)
            .toFormat("jpeg", { quality: 80 })
            .toFile(outputPath);
        return outputPath;
    }

    /**
     * Supprime plusieurs fichiers spécifiés dans un album.
     * @param {string} user - Nom d'utilisateur.
     * @param {Array<string>} supress - Liste des noms de fichiers à supprimer.
     * @param {string} album - Nom de l'album contenant les fichiers à supprimer.
     * @returns {Promise<{error: string|null}>} Résultat de l'opération de suppression.
     */
    async massiveDelete(user, supress, album) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "galery",
                album
            );

            for (let e of supress) {
                const file_path = path.join(path_to_target, e);
                try {
                    await fs.access(file_path);
                    await fs.rm(file_path);
                } catch (err) {
                    console.error(
                        `Erreur lors de la suppression de ${file_path}:`,
                        err
                    );
                }
            }

            return { error: null };
        } catch (err) {
            console.error(err);
            return {
                error: `Impossible de supprimer les fichiers : ${err.message}`,
            };
        }
    }

    /**
     * Supprime un album entier.
     * @param {string} user - Nom d'utilisateur.
     * @param {string} album - Nom de l'album à supprimer.
     * @returns {Promise<{error: string|null}>} Résultat de l'opération de suppression.
     */
    async deleteAlbum(user, album) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "galery",
                album
            );

            try {
                await fs.access(path_to_target);
                await fs.rm(path_to_target, { recursive: true });
                return { error: null };
            } catch (err) {
                console.error(
                    `Erreur lors de la suppression de l'album ${path_to_target}:`,
                    err
                );
                return {
                    error: `Impossible de supprimer l'album : ${err.message}`,
                };
            }
        } catch (err) {
            console.error(err);
            return {
                error: `Impossible de supprimer l'album : ${err.message}`,
            };
        }
    }

    /**
     * Obtient le nombre total de fichiers dans un album.
     * @param {string} user - Nom d'utilisateur.
     * @param {string} album - Nom de l'album dont le nombre de fichiers est demandé.
     * @returns {Promise<{error: string|null, totalFiles: number}>} Nombre total de fichiers dans l'album.
     */
    async getTotalFilesCount(user, album) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "galery",
                album
            );

            try {
                await fs.access(path_to_target);
                const dir_content = await fs.readdir(path_to_target, {
                    withFileTypes: true,
                });

                const totalFiles = dir_content.filter((f) => f.isFile()).length;

                return { error: null, totalFiles };
            } catch (err) {
                console.error(
                    `Erreur lors de la récupération du nombre de fichiers de l'album ${path_to_target}:`,
                    err
                );
                return {
                    error: `Impossible de récupérer le nombre de fichiers : ${err.message}`,
                };
            }
        } catch (err) {
            console.error(err);
            return {
                error: `Impossible de récupérer le nombre de fichiers : ${err.message}`,
            };
        }
    }

    /**
     * Obtient les fichiers d'un album pour une page donnée.
     * @param {string} user - Nom d'utilisateur.
     * @param {string} album - Nom de l'album contenant les fichiers.
     * @param {number} page - Numéro de la page des fichiers à récupérer.
     * @returns {Promise<{error: string|null, files: Array<Object>, isEnd: boolean}>} Liste des fichiers pour la page spécifiée et indication si c'est la fin des fichiers.
     */
    async getFilesOf(user, album, page) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "galery",
                album
            );

            try {
                await fs.access(path_to_target);
                const dir_content = await fs.readdir(path_to_target, {
                    withFileTypes: true,
                });

                const itemsPerPage = 10;
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;

                const filesToProcess = dir_content
                    .filter((f) => f.isFile())
                    .slice(startIndex, endIndex);

                const stock = [];

                for (let f of filesToProcess) {
                    const file_curr = await this.getFile(user, album, f.name);
                    if (file_curr) {
                        stock.push({ ...file_curr, filename: f.name });
                    }
                }

                const isEnd =
                    endIndex >= dir_content.filter((f) => f.isFile()).length;

                return { error: null, files: stock, isEnd };
            } catch (err) {
                console.error(
                    `Erreur lors de la récupération des fichiers de l'album ${path_to_target}:`,
                    err
                );
                return {
                    error: `Impossible de récupérer les fichiers : ${err.message}`,
                };
            }
        } catch (err) {
            console.error(err);
            return {
                error: `Impossible de récupérer les fichiers : ${err.message}`,
            };
        }
    }

    /**
     * Crée un fichier ZIP contenant tous les fichiers d'un album et l'envoie en réponse.
     * @param {string} user - Nom d'utilisateur.
     * @param {string} album - Nom de l'album à zipper.
     * @param {Object} res - Objet réponse HTTP pour envoyer le fichier ZIP.
     * @returns {Promise<string|null>} Nom de l'album ou null en cas d'erreur.
     */
    async createZipStream(user, album, res) {
        const path_to_target = path.join(
            this.users_target,
            user,
            "galery",
            album
        );

        try {
            await fs.access(path_to_target);

            const archive = archiver("zip", {
                zlib: { level: 9 },
            });

            archive.on("error", (err) => {
                res.status(500).send({ error: err.message });
            });

            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${album}.zip`
            );
            res.setHeader("Content-Type", "application/zip");

            archive.pipe(res);
            archive.directory(path_to_target, false);
            archive.finalize();

            return this.getAlbumName(path_to_target);
        } catch (err) {
            console.error(
                `Erreur lors de la création du fichier ZIP pour l'album ${path_to_target}:`,
                err
            );
            res.status(500).send({
                error: `Impossible de créer le fichier ZIP : ${err.message}`,
            });
        }
    }

    /**
     * Obtient le nom d'un album à partir de son chemin.
     * @param {string} albumPath - Chemin vers l'album.
     * @returns {Promise<string|null>} Nom de l'album ou null en cas d'erreur.
     */
    async getAlbumName(albumPath) {
        try {
            await fs.access(albumPath);
            const albumName = path.basename(albumPath);
            return albumName;
        } catch (error) {
            console.error("Erreur lors de l'accès au fichier:", error);
        }
    }

    /**
     * Détermine le type de fichier à partir d'un chemin de fichier.
     * @param {string} filePath - Chemin du fichier.
     * @returns {Promise<string|null>} Type MIME du fichier ou null en cas d'erreur.
     */
    async getTypeOfFile(filePath) {
        const buffer = await fs.readFile(filePath, {
            encoding: null,
            start: 0,
            end: 11,
        });
        return this.getTypeOfArrayBuffer(buffer);
    }

    /**
     * Détermine le type MIME d'un fichier à partir d'un buffer de données.
     * @param {Buffer} buffer - Buffer contenant les données du fichier.
     * @returns {string|null} Type MIME du fichier ou null si le type ne peut être déterminé.
     */
    getTypeOfArrayBuffer(buffer) {
        if (
            buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4e &&
            buffer[3] === 0x47
        ) {
            return "image/png";
        } else if (
            buffer[0] === 0xff &&
            buffer[1] === 0xd8 &&
            buffer[2] === 0xff
        ) {
            return "image/jpeg";
        } else if (
            buffer[0] === 0x47 &&
            buffer[1] === 0x49 &&
            buffer[2] === 0x46
        ) {
            return "image/gif";
        } else if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
            return "image/bmp";
        } else if (
            buffer[0] === 0x49 &&
            buffer[1] === 0x49 &&
            buffer[2] === 0x2a &&
            buffer[3] === 0x00
        ) {
            return "image/tiff";
        } else if (
            buffer[0] === 0x4d &&
            buffer[1] === 0x4d &&
            buffer[2] === 0x00 &&
            buffer[3] === 0x2a
        ) {
            return "image/tiff";
        } else if (
            buffer[0] === 0x52 &&
            buffer[1] === 0x49 &&
            buffer[2] === 0x46 &&
            buffer[3] === 0x46 &&
            buffer[8] === 0x57 &&
            buffer[9] === 0x45 &&
            buffer[10] === 0x42 &&
            buffer[11] === 0x50
        ) {
            return "image/webp";
        } else if (
            buffer[0] === 0x00 &&
            buffer[1] === 0x00 &&
            buffer[2] === 0x00 &&
            buffer[4] === 0x66 &&
            buffer[5] === 0x74 &&
            buffer[6] === 0x79 &&
            buffer[7] === 0x70
        ) {
            return "video/mp4";
        } else if (
            buffer[0] === 0x1a &&
            buffer[1] === 0x45 &&
            buffer[2] === 0xdf &&
            buffer[3] === 0xa3
        ) {
            return "video/webm";
        } else if (
            buffer[0] === 0x46 &&
            buffer[1] === 0x4c &&
            buffer[2] === 0x56 &&
            buffer[3] === 0x01
        ) {
            return "video/flv";
        } else if (
            buffer[0] === 0x4f &&
            buffer[1] === 0x67 &&
            buffer[2] === 0x67 &&
            buffer[3] === 0x53
        ) {
            return "video/ogg";
        } else if (
            buffer[0] === 0x52 &&
            buffer[1] === 0x49 &&
            buffer[2] === 0x46 &&
            buffer[3] === 0x46 &&
            buffer[8] === 0x41 &&
            buffer[9] === 0x56 &&
            buffer[10] === 0x49
        ) {
            return "video/avi";
        } else if (
            buffer[0] === 0x00 &&
            buffer[1] === 0x00 &&
            buffer[2] === 0x01 &&
            buffer[3] === 0xba
        ) {
            return "video/mpeg";
        } else if (
            buffer[0] === 0x1a &&
            buffer[1] === 0x45 &&
            buffer[2] === 0xdf &&
            buffer[3] === 0xa3
        ) {
            return "video/mkv";
        } else {
            return null;
        }
    }

    /**
     * Obtient le contenu d'un fichier sous forme de base64 et son type MIME.
     * @param {string} user - Nom d'utilisateur.
     * @param {string} album - Nom de l'album contenant le fichier.
     * @param {string} file - Nom du fichier.
     * @returns {Promise<{b64: string, type: string}|null>} Contenu du fichier en base64 et son type MIME, ou null en cas d'erreur.
     */
    async getFile(user, album, file) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "galery",
                album,
                file
            );

            const pre = await fs.readFile(path_to_target);
            const b64 = Buffer.from(pre).toString("base64");
            const type = this.getTypeOfArrayBuffer(pre);

            return !pre || !type || !b64 ? null : { b64, type };
        } catch (err) {
            console.error("Impossible de trouver le fichier.", err);
            return null;
        }
    }

    /**
     * Obtient la liste des albums d'un utilisateur.
     * @param {string} user - Nom d'utilisateur.
     * @returns {Promise<{albums: Array<Object>, error: string|null}>} Liste des albums et erreur éventuelle.
     */
    async getAlbums(user) {
        try {
            const path_to_target = path.join(this.users_target, user, "galery");
            await fs.access(path_to_target);
            const albums = await fs.readdir(path_to_target, {
                withFileTypes: true,
            });
            const stock = [];

            for (let album of albums) {
                if (album.isDirectory()) {
                    const path_to_album = path.join(path_to_target, album.name);

                    const files = await fs.readdir(path_to_album, {
                        withFileTypes: true,
                    });
                    const photos = [];

                    for (let file of files) {
                        if (file.isFile()) {
                            const filePath = path.join(
                                path_to_album,
                                file.name
                            );
                            const fileType = await this.getTypeOfFile(filePath);

                            if (fileType && fileType.startsWith("image/")) {
                                photos.push(file.name);
                            }
                        }
                    }

                    stock.push({
                        dirname: album.name,
                        size: photos.length,
                        presentation: photos.length > 0 ? photos[0] : null,
                    });
                }
            }

            return { albums: stock, error: null };
        } catch (err) {
            console.error("Erreur lors de la récupération des albums:", err);
            return {
                error: `Impossible de récupérer les albums : ${err.message}`,
            };
        }
    }

    /**
     * Crée un nouvel album pour un utilisateur.
     * @param {string} user - Nom d'utilisateur.
     * @param {string} name - Nom de l'album à créer.
     * @returns {Promise<{error: string|null}>} Résultat de l'opération de création d'album.
     */
    async createAlbum(user, name) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "galery",
                name
            );

            try {
                await fs.mkdir(path_to_target, { recursive: true });
                return { error: null };
            } catch (err) {
                if (err.code === "EEXIST") {
                    return { error: "L'album existe déjà." };
                } else {
                    console.error(
                        `Erreur lors de la création de l'album ${path_to_target}:`,
                        err
                    );
                    return {
                        error: `Impossible de créer l'album : ${err.message}`,
                    };
                }
            }
        } catch (err) {
            console.error(err);
            return { error: `Impossible de créer l'album : ${err.message}` };
        }
    }

    /**
     * Envoie des fichiers optimisés vers une galerie d'album.
     * @param {string} user - Nom d'utilisateur.
     * @param {Array<Object>} files - Liste des fichiers à envoyer, avec chemin et nom d'origine.
     * @param {string} album - Nom de l'album cible.
     * @returns {Promise<{error: string|null}>} Résultat de l'opération d'envoi de fichiers.
     */
    async sendFileToGalery(user, files, album) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "galery",
                album
            );

            for (let file of files) {
                const optimizedPath = await this.optimizeImage(file.path);
                const final_path = path.join(path_to_target, file.originalname);
                try {
                    await fs.rename(optimizedPath, final_path);
                } catch (err) {
                    console.error(
                        `Erreur lors du déplacement du fichier ${file.path} vers ${final_path}:`,
                        err
                    );
                }
            }

            return { error: null };
        } catch (err) {
            console.error(err);
            return {
                error: `Impossible de stocker le(s) fichier(s) : ${err.message}`,
            };
        }
    }
}

module.exports = Photomaton;
