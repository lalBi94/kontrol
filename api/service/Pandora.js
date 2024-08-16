const path = require("path");
const fs = require("fs/promises");
const archiver = require("archiver");

/**
 * Classe gérant le stockage des fichiers dans l'espace
 * @class Pandora
 * @author Bilal Boudjemline
 */
class Pandora {
    constructor() {
        this.users_target = path.join(__dirname, "../data");

        this.planLimit = {
            admin: 99999,
            regular: 100,
            premium: 500,
        };
    }

    /**
     * Renommer un fichier / dossier
     * @param {string} user L'utilisateur
     * @param {string} pth Le chemin
     * @param {string} newName Le nouveau nom
     * @return {Promise<{error: string | null}>}
     */
    async renameSomething(user, pth, newName) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "storage",
                pth
            );
            const directory = path.dirname(path_to_target);
            const newPath = path.join(directory, newName);

            await fs.rename(path_to_target, newPath);

            return { error: null };
        } catch (err) {
            console.error(err);
            return {
                error: `Impossible de renommer un dossier / fichier : ${err.message}`,
            };
        }
    }

    /**
     * Recuperer les détails du stockage par abonnement
     * @param {number} level Niveau de permission
     * @return {number | null}
     */
    getPlanLimitOf(level) {
        if (level === 0) {
            return this.planLimit.admin;
        } else if (level === 1) {
            return this.planLimit.regular;
        } else if (level === 2) {
            return this.planLimit.premium;
        } else {
            return null;
        }
    }

    /**
     * Recuperer la tailel d'un repertoire
     * @param {string} dir Chemin vers le repertoire
     * @return Promise<number>
     */
    async getDirectorySize(dir) {
        let totalSize = 0;

        async function calculateSize(directory) {
            const files = await fs.readdir(directory, { withFileTypes: true });

            await Promise.all(
                files.map(async (file) => {
                    const filePath = path.join(directory, file.name);

                    if (file.isDirectory()) {
                        await calculateSize(filePath);
                    } else {
                        const stats = await fs.stat(filePath);
                        totalSize += stats.size;
                    }
                })
            );
        }

        await calculateSize(dir);
        return totalSize;
    }

    /**
     * Recuperer les informations d'un espace
     * @param {number} level Niveau de permission
     * @param {string} user L'utilisateur
     * @return {Promise<{error: string | null}>}
     */
    async getStorageDetails(level, user) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "storage"
            );

            const plan = parseInt(this.getPlanLimitOf(parseInt(level, 10)), 10);

            const used = await this.getDirectorySize(path_to_target);

            if (!plan || !used) {
                return {
                    error: "Impossible de recuperer les informations d'un espace.",
                };
            }

            const free = this.formatFileSize(plan * 1073741824 - used);
            const total = this.formatFileSize(plan * 1073741824);

            return {
                total,
                free,
                used: this.formatFileSize(used),
            };
        } catch (err) {
            return {
                error: "Impossible de recuperer les informations d'un espace.",
            };
        }
    }

    /**
     * Supprimer un fichier / dossier
     * @param {string} user L'utilisateur
     * @param {string} pth Chemin vers l'element a supprimer
     * @return {Promise<{error: string | null}>}
     */
    async deleteSomething(user, pth) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "storage",
                pth
            );

            await fs.rm(path_to_target, { recursive: true });

            return { error: null };
        } catch (err) {
            console.error(err);
            return {
                error: `Impossible de supprimer un élément : ${err.message}`,
            };
        }
    }

    /**
     * Créer un flux qui renverra un .zip d'un dossier de l'espace
     * @param {string} user L'utilisateur
     * @param {string} pth Chemin du dossier a convertir en .zip
     * @param {Response} res Objet res de la route (pour modifier la reponse depuis cette fonction)
     * @return {Promise<string>}
     */
    async createZipStream(user, pth, res) {
        const path_to_target = path.join(
            this.users_target,
            user,
            "storage",
            pth
        );

        const archive = archiver("zip", {
            zlib: { level: 9 },
        });

        archive.on("error", (err) => {
            res.status(500).send({ error: err.message });
        });

        archive.pipe(res);
        archive.directory(path_to_target, false);
        archive.finalize();

        return this.getFileName(path_to_target);
    }

    /**
     * Recuperer le nom d'un fichier a partir de son chemin.
     * @param {string} filePath Chemin vers le fichier.
     * @return {string}
     */
    async getFileName(filePath) {
        try {
            await fs.access(filePath);

            const fileName = path.basename(filePath);
            return fileName;
        } catch (error) {
            console.error("Erreur lors de l'accès au fichier:", error);
        }
    }

    /**
     * Recuperer un fichier depuis l'espace
     * @param {string} user L'utilisateur
     * @param {string} pth Chemin du fichier a recuperer
     * @return {Promise<{ path: string; filename: string | null; error: string | null }>}
     */
    async retreiveFile(user, pth) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "storage",
                pth
            );

            if (await fs.readFile(path_to_target)) {
                return {
                    path: path_to_target,
                    filename: await this.getFileName(path_to_target),
                    error: null,
                };
            } else {
                return {
                    filename: null,
                    path: null,
                    error: "Le fichier n'existe pas.",
                };
            }
        } catch (err) {
            console.error(err);
            return {
                error: "Impossible de recuperer un fichier.",
            };
        }
    }

    /**
     * Creer un repertoire dans un chemin.
     * @param {string} user L'utilisateur
     * @param {string} dirName Le nom du repertoire
     * @param {string} pth Le chemin ou le creer
     * @return {Promise<{ error: string | null }>}
     */
    async createDir(user, dirName, pth) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "storage",
                pth,
                dirName
            );

            await fs.mkdir(path_to_target);

            return {
                error: null,
            };
        } catch (err) {
            console.error(err);
            return { error: "Impossible de créer un nouveau répertoire" };
        }
    }

    /**
     * Enregistrer un fichier dans l'espace
     * @param {string} user L'utilisateur
     * @param {Express.Multer.File[]} files Les fichiers
     * @param {string} pth Le chemin ou les creer
     * @return {Promise<{ error: string | null }>}
     */
    async sendFileToStorage(user, files, pth) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "storage",
                pth
            );

            const fileDetails = files.map((file) => ({
                originalname: file.originalname,
                path: file.path,
            }));

            for (let file of fileDetails) {
                const final_path = path.join(path_to_target, file.originalname);
                await fs.rename(file.path, final_path);
            }

            return { error: null };
        } catch (err) {
            console.error(err);
            return { error: "Impossible de stocker le(s) fichier(s)." };
        }
    }

    /**
     * Formatter la taille brut d'un fichier
     * @param {number} sizeInBytes La taille
     * @return {string|null}
     */
    formatFileSize(sizeInBytes) {
        try {
            if (sizeInBytes < 1024) {
                return `${sizeInBytes} octets`;
            } else if (sizeInBytes < 1024 * 1024) {
                const sizeInKB = sizeInBytes / 1024;
                return `${sizeInKB.toFixed(2)} Ko`;
            } else if (sizeInBytes < 1024 * 1024 * 1024) {
                const sizeInMB = sizeInBytes / (1024 * 1024);
                return `${sizeInMB.toFixed(2)} Mo`;
            } else {
                const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);
                return `${sizeInGB.toFixed(2)} Go`;
            }
        } catch (err) {
            console.error("Impossible de fomatter la taille du fichier.", err);
            return null;
        }
    }

    /**
     * Naviger au fur et a mesur dans le frontend
     * @param {string} user L'utilisateur
     * @param {string} pth Le chemin courant
     * @return {Promise<{ error: string | null; storage: Array<{
            dirname: string,
            type: "dir" | "file",
            completePath: string,
            size: string,
            block_size: number,
        }>}>}
     */
    async navigation(user, pth) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "storage",
                pth
            );
            const dir_contents = await fs.readdir(path_to_target);
            const data = [];

            for (let e of dir_contents) {
                const target = path.join(path_to_target, e);
                const entity = await fs.stat(target);

                if (entity.isDirectory()) {
                    data.push({
                        dirname: e,
                        type: "dir",
                        completePath: `${pth}/${e}`,
                        size: this.formatFileSize(entity.size),
                        block_size: entity.size,
                    });
                } else if (entity.isFile()) {
                    data.push({
                        filename: e,
                        type: "file",
                        completePath: `${pth}/${e}`,
                        size: this.formatFileSize(entity.size),
                        block_size: entity.size,
                    });
                }
            }

            return {
                error: null,
                storage: data,
            };
        } catch (err) {
            console.error(err);
            return {
                error: `Impossible de recuperer la liste des entités..`,
            };
        }
    }

    /**
     * Recuperer tous les (sous-)fichiers / (sous-)dossiers
     * @param {string} directory
     * @param {string} baseDir
     * @return {Promise<Array<{ path: string; size: number; name: string; formatSize: string>>}
     */
    async getFiles(directory, baseDir = directory) {
        let files = [];

        try {
            const items = await fs.readdir(directory, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(directory, item.name);
                if (item.isDirectory()) {
                    files = files.concat(
                        await this.getFiles(fullPath, baseDir)
                    );
                } else if (item.isFile()) {
                    const stat = await fs.stat(fullPath);
                    const relativePath = path.relative(
                        baseDir,
                        path.dirname(fullPath)
                    );

                    files.push({
                        path: relativePath,
                        size: stat.size,
                        name: item.name,
                        formatSize: this.formatFileSize(stat.size),
                    });
                }
            }
        } catch (err) {
            console.error(`Impossible de lire ${directory}:`, err);
        }

        return files;
    }

    /**
     * Obtenir les 3 plus gros fichiers de l'espace
     * @param {*} user L'utilisateur
     * @return {Promise<{ error: string | null; files: Array<{ path: string; size: number;}
     */
    async feedOlympus(user) {
        try {
            const path_to_target = path.join(
                this.users_target,
                user,
                "storage"
            );

            const allFiles = await this.getFiles(
                path_to_target,
                path_to_target
            );
            const sortedFiles = allFiles.sort((a, b) => b.size - a.size);
            const topThreeFiles = sortedFiles.slice(0, 3);

            const result = {
                first: topThreeFiles[0]
                    ? {
                          path: topThreeFiles[0].path,
                          size: topThreeFiles[0].size,
                          name: topThreeFiles[0].name,
                          formatSize: topThreeFiles[0].formatSize,
                      }
                    : null,
                second: topThreeFiles[1]
                    ? {
                          path: topThreeFiles[1].path,
                          size: topThreeFiles[1].size,
                          name: topThreeFiles[1].name,
                          formatSize: topThreeFiles[1].formatSize,
                      }
                    : null,
                third: topThreeFiles[2]
                    ? {
                          path: topThreeFiles[2].path,
                          size: topThreeFiles[2].size,
                          name: topThreeFiles[2].name,
                          formatSize: topThreeFiles[2].formatSize,
                      }
                    : null,
            };

            return { error: null, files: result };
        } catch (err) {
            console.error("Error in feedOlympus:", err);
            return { error: "Impossible de nourrir le composant Olympus." };
        }
    }
}

module.exports = Pandora;
