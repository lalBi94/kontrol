const express = require("express");
const router = express.Router();
const Pandora = require("../service/Pandora");
const pandora_services = new Pandora();
const multer = require("multer");
const upload = multer({ dest: "./temp/" });

/**
 * Endpoint pour récupérer les 3 plus gros fichiers de l'utilisateur.
 * @route POST /pandora/feedOlympus
 * @param {string} user - Nom d'utilisateur.
 * @returns {Promise<{error: string|null, files: {first: Object, second: Object, third: Object}}>} Détails des 3 plus gros fichiers ou une erreur.
 */
router.post("/feedOlympus", multer().any(), async (req, res) => {
    try {
        const { user } = req.body;
        const d = await pandora_services.feedOlympus(user);
        res.json(d);
    } catch (err) {
        console.error(err);
        res.status(500).send({
            error: "Erreur lors de la récupération des plus gros fichiers.",
        });
    }
});

/**
 * Endpoint pour supprimer un fichier ou un dossier.
 * @route PUT /pandora/deleteSomething
 * @param {string} user - Nom d'utilisateur.
 * @param {string} pth - Chemin du fichier ou dossier à supprimer.
 * @returns {Promise<{error: string|null}>} Résultat de l'opération de suppression ou une erreur.
 */
router.put("/deleteSomething", multer().any(), async (req, res) => {
    try {
        const { user, pth } = req.body;
        const d = await pandora_services.deleteSomething(user, pth);
        res.json(d);
    } catch (err) {
        console.error(err);
        res.status(500).send({
            error: "Erreur lors de la suppression de l'élément.",
        });
    }
});

/**
 * Endpoint pour renommer un fichier ou un dossier.
 * @route PUT /pandora/renameSomething
 * @param {string} user - Nom d'utilisateur.
 * @param {string} pth - Chemin du fichier ou dossier à renommer.
 * @param {string} newName - Nouveau nom pour le fichier ou dossier.
 * @returns {Promise<{error: string|null}>} Résultat de l'opération de renommage ou une erreur.
 */
router.put("/renameSomething", multer().any(), async (req, res) => {
    try {
        const { user, pth, newName } = req.body;
        const d = await pandora_services.renameSomething(user, pth, newName);
        res.json(d);
    } catch (err) {
        console.error(err);
        res.status(500).send({
            error: "Erreur lors du renommage de l'élément.",
        });
    }
});

/**
 * Endpoint pour récupérer un dossier compressé au format .zip.
 * @route POST /pandora/retreiveZip
 * @param {string} user - Nom d'utilisateur.
 * @param {string} pth - Chemin du dossier à compresser.
 * @returns {Promise<void>} Télécharge un fichier .zip.
 */
router.post("/retreiveZip", multer().any(), (req, res) => {
    try {
        const { user, pth } = req.body;
        res.setHeader("Content-Type", "application/zip");

        pandora_services.createZipStream(user, pth, res).then((d) => {
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${d}.zip`
            );
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            error: "Erreur lors de la création du fichier zip.",
        });
    }
});

/**
 * Endpoint pour récupérer un fichier.
 * @route POST /pandora/retreiveFile
 * @param {string} user - Nom d'utilisateur.
 * @param {string} pth - Chemin du fichier à récupérer.
 * @returns {Promise<void>} Télécharge le fichier spécifié.
 */
router.post("/retreiveFile", multer().any(), (req, res) => {
    try {
        const { user, pth } = req.body;

        pandora_services.retreiveFile(user, pth).then((d) => {
            if (d.path) {
                res.download(d.path, (err) => {
                    if (err) {
                        console.error("Impossible d'envoyer le fichier:", err);
                        res.status(500).send({
                            error: "Erreur lors de l'envoi du fichier.",
                        });
                    }
                });
            } else {
                res.status(404).send({ error: d.error });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            error: "Erreur lors de la récupération du fichier.",
        });
    }
});

/**
 * Endpoint pour créer un nouveau répertoire.
 * @route POST /pandora/createDir
 * @param {string} user - Nom d'utilisateur.
 * @param {string} dirName - Nom du nouveau répertoire.
 * @param {string} pth - Chemin où créer le répertoire.
 * @returns {Promise<{error: string|null}>} Résultat de l'opération de création de répertoire ou une erreur.
 */
router.post("/createDir", multer().any(), async (req, res) => {
    try {
        const { user, dirName, pth } = req.body;
        const d = await pandora_services.createDir(user, dirName, pth);
        res.json(d);
    } catch (err) {
        console.error(err);
        res.status(500).send({
            error: "Erreur lors de la création du répertoire.",
        });
    }
});

/**
 * Endpoint pour envoyer des fichiers à l'espace de stockage.
 * @route POST /pandora/sendFileToStorage
 * @param {string} user - Nom d'utilisateur.
 * @param {string} pth - Chemin de destination pour les fichiers.
 * @param {Array<Express.Multer.File>} files - Liste des fichiers à stocker.
 * @returns {Promise<{error: string|null}>} Résultat de l'opération d'envoi de fichiers ou une erreur.
 */
router.post("/sendFileToStorage", upload.array("files"), async (req, res) => {
    try {
        const { user, pth } = req.body;
        const files = req.files;
        const d = await pandora_services.sendFileToStorage(user, files, pth);
        res.json(d);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Erreur lors de l'envoi des fichiers." });
    }
});

/**
 * Endpoint pour obtenir les détails de l'espace de stockage d'un utilisateur.
 * @route POST /pandora/getStorageDetails
 * @param {number} level - Niveau d'abonnement.
 * @param {string} user - Nom d'utilisateur.
 * @returns {Promise<{error: string|null, total: string, free: string, used: string}>} Détails de l'espace de stockage ou une erreur.
 */
router.post("/getStorageDetails", multer().any(), async (req, res) => {
    try {
        const { level, user } = req.body;
        const d = await pandora_services.getStorageDetails(level, user);
        res.json(d);
    } catch (err) {
        console.error(err);
        res.status(500).send({
            error: "Erreur lors de la récupération des détails de l'espace de stockage.",
        });
    }
});

/**
 * Endpoint pour naviguer dans l'espace de stockage de l'utilisateur.
 * @route POST /pandora/navigation
 * @param {string} user - Nom d'utilisateur.
 * @param {string} target_dir - Chemin du répertoire cible.
 * @returns {Promise<{error: string|null, storage: Array<{dirname: string, type: string, completePath: string, size: string, block_size: number}>}>} Liste des fichiers et répertoires ou une erreur.
 */
router.post("/navigation", multer().any(), async (req, res) => {
    try {
        const { user, target_dir } = req.body;
        const d = await pandora_services.navigation(user, target_dir);
        res.json(d);
    } catch (err) {
        console.error(err);
        res.status(500).send({
            error: "Erreur lors de la navigation dans l'espace de stockage.",
        });
    }
});

module.exports = router;
