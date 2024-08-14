const path = require("path");
const fs = require("fs/promises");
const moment = require("moment");

/**
 * Classe gérant les notes de (cours, pre-article, etc...)
 * @class NWrite
 * @author Bilal Boudjemline
 */
class NWrite {
    constructor() {
        this.users_target = path.join(__dirname, "../data");
    }

    generateFileName(title, keywords = []) {
        const timestamp = moment().valueOf();
        const keywordString = keywords.join("-");
        return `${title}-${timestamp}-${keywordString}`;
    }

    async deleteNote(user, title) {
        try {
            const notesDir = path.join(this.users_target, user, "notes");

            const files = await fs.readdir(notesDir);
            const matchingFile = files.find((file) => file.startsWith(title));

            if (matchingFile) {
                const path_to_target = path.join(notesDir, matchingFile);
                await fs.rm(path_to_target);
                return { error: null };
            } else {
                return { error: "La note n'existe pas." };
            }
        } catch (err) {
            console.error(err);
            return {
                error: "Un problème interne nous empêche de supprimer votre note.",
            };
        }
    }

    async getNoteData(user, title) {
        try {
            const notesDir = path.join(this.users_target, user, "notes");

            const files = await fs.readdir(notesDir);
            const matchingFile = files.find((file) => file.startsWith(title));

            if (matchingFile) {
                const fullPath = path.join(notesDir, matchingFile);
                const data = await fs.readFile(fullPath, "utf-8");
                const keywords_arr = path.basename(fullPath).split("-");
                const transformed = keywords_arr.slice(
                    2,
                    keywords_arr.length - 1
                );

                return {
                    error: null,
                    content: {
                        title: matchingFile,
                        content: data,
                        keywords: transformed,
                    },
                };
            } else {
                return { error: "La note n'existe pas." };
            }
        } catch (err) {
            console.error(err);
            return {
                error: "Un problème interne nous empêche de vous servir votre note.",
            };
        }
    }

    async getAllNotesOf(user) {
        try {
            const path_to_target = path.join(this.users_target, user, "notes");

            await fs.access(path_to_target);
            const files = await fs.readdir(path_to_target);
            return { error: null, title_list: files };
        } catch (err) {
            return {
                error: "Un problème interne nous empêche de vous servir vos notes.",
            };
        }
    }

    async updateNote(title, user, content, newName) {
        try {
            const notesDir = path.join(this.users_target, user, "notes");
            const files = await fs.readdir(notesDir);
            const matchingFile = files.find((file) => file.startsWith(title));

            if (matchingFile) {
                await fs.rm(path.join(notesDir, matchingFile));
                const newPath = path.join(notesDir, newName);
                await fs.writeFile(newPath, content, "utf8");
                return { error: null };
            } else {
                return {
                    error: "La note n'existe pas.",
                };
            }
        } catch (err) {
            console.error(err);
            return {
                error: "Erreur interne lors de la modification de la note.",
            };
        }
    }

    async sendNote(title, content, user, keywords) {
        try {
            const fileName = this.generateFileName(title, keywords);
            const path_to_target = path.join(
                this.users_target,
                user,
                "notes",
                fileName
            );

            await fs.writeFile(path_to_target, content, "utf8");
            return { error: null, title: fileName };
        } catch (err) {
            console.error(err);
            return {
                error: "Erreur interne lors de l'enregistrement de la note.",
            };
        }
    }
}

module.exports = NWrite;
