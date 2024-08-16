const express = require("express");
const router = express.Router();
const Photomaton = require("../service/Photomaton");
const photomaton_services = new Photomaton();
const multer = require("multer");
const upload = multer({ dest: "./temp/" });

/**
 * Endpoint pour envoyer des fichiers à une galerie.
 * @route POST /sendFileToGalery
 * @param {string} user - Nom d'utilisateur.
 * @param {string} album - Nom de l'album dans lequel les fichiers seront ajoutés.
 * @param {Array<Express.Multer.File>} files - Liste des fichiers à ajouter à la galerie.
 * @returns {Promise<{error: string|null}>} Résultat de l'opération d'ajout de fichiers ou une erreur.
 * @throws {500} Erreur lors de l'envoi des fichiers à la galerie.
 */
router.post("/sendFileToGalery", upload.array("files"), async (req, res) => {
    try {
        const { user, album } = req.body;
        const files = req.files;
        const d = await photomaton_services.sendFileToGalery(
            user,
            files,
            album
        );
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de l'envoi des fichiers à la galerie.",
        });
    }
});

/**
 * Endpoint pour récupérer la liste des albums d'un utilisateur.
 * @route POST /getAlbums
 * @param {string} user - Nom d'utilisateur.
 * @returns {Promise<{error: string|null, albums: Array<string>}>} Liste des albums de l'utilisateur ou une erreur.
 * @throws {500} Erreur lors de la récupération des albums.
 */
router.post("/getAlbums", multer().any(), async (req, res) => {
    try {
        const { user } = req.body;
        const d = await photomaton_services.getAlbums(user);
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la récupération des albums.",
        });
    }
});

/**
 * Endpoint pour récupérer un album compressé au format .zip.
 * @route POST /retreiveZip
 * @param {string} user - Nom d'utilisateur.
 * @param {string} album - Nom de l'album à compresser.
 * @returns {Promise<void>} Télécharge un fichier .zip de l'album.
 * @throws {500} Erreur lors de la création du fichier zip.
 */
router.post("/retreiveZip", multer().any(), (req, res) => {
    try {
        const { user, album } = req.body;
        res.setHeader("Content-Type", "application/zip");

        photomaton_services.createZipStream(user, album, res).then((d) => {
            res.status(200).setHeader(
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
 * Endpoint pour récupérer un fichier spécifique d'un album.
 * @route POST /getFile
 * @param {string} user - Nom d'utilisateur.
 * @param {string} album - Nom de l'album contenant le fichier.
 * @param {string} file - Nom du fichier à récupérer.
 * @returns {Promise<{error: string|null, file: Object}>} Détails du fichier récupéré ou une erreur.
 * @throws {500} Erreur lors de la récupération du fichier.
 */
router.post("/getFile", multer().any(), async (req, res) => {
    try {
        const { user, album, file } = req.body;
        const d = await photomaton_services.getFile(user, album, file);
        if (!d || !d.path) {
            return res.status(404).json({
                error: "Le fichier n'existe pas.",
            });
        }
        res.status(200).download(d.path, (err) => {
            if (err) {
                console.error("Impossible d'envoyer le fichier:", err);
                res.status(500).json({
                    error: "Erreur lors de l'envoi du fichier.",
                });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la récupération du fichier.",
        });
    }
});

/**
 * Endpoint pour supprimer plusieurs fichiers d'un album.
 * @route PUT /massiveDelete
 * @param {string} supress - Liste des fichiers à supprimer en format JSON.
 * @param {string} album - Nom de l'album d'où les fichiers seront supprimés.
 * @param {string} user - Nom d'utilisateur.
 * @returns {Promise<{error: string|null}>} Résultat de l'opération de suppression ou une erreur.
 * @throws {500} Erreur lors de la suppression massive des fichiers..
 */
router.put("/massiveDelete", multer().any(), async (req, res) => {
    try {
        const { supress, album, user } = req.body;
        console.log(supress, album, user);
        const d = await photomaton_services.massiveDelete(
            user,
            JSON.parse(supress),
            album
        );
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la suppression massive des fichiers.",
        });
    }
});

/**
 * Endpoint pour obtenir la liste des fichiers dans un album avec pagination.
 * @route POST /getFilesOf
 * @param {string} user - Nom d'utilisateur.
 * @param {string} album - Nom de l'album.
 * @param {number} page - Numéro de la page pour la pagination.
 * @returns {Promise<{error: string|null, files: Array<Object>}>} Liste des fichiers de l'album ou une erreur.
 * @throws {500} Erreur lors de la récupération des fichiers de l'album.
 */
router.post("/getFilesOf", multer().any(), async (req, res) => {
    try {
        const { user, album, page } = req.body;
        const d = await photomaton_services.getFilesOf(user, album, page);
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la récupération des fichiers de l'album.",
        });
    }
});

/**
 * Endpoint pour obtenir le nombre total de fichiers dans un album.
 * @route POST /getTotalFilesCount
 * @param {string} user - Nom d'utilisateur.
 * @param {string} album - Nom de l'album.
 * @returns {Promise<{error: string|null, count: number}>} Nombre total de fichiers dans l'album ou une erreur.
 * @throws {500} Erreur lors de la récupération du nombre total de fichiers.
 */
router.post("/getTotalFilesCount", multer().any(), async (req, res) => {
    try {
        const { user, album } = req.body;
        const d = await photomaton_services.getTotalFilesCount(user, album);
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la récupération du nombre total de fichiers.",
        });
    }
});

/**
 * Endpoint pour supprimer un album.
 * @route PUT /deleteAlbum
 * @param {string} user - Nom d'utilisateur.
 * @param {string} album - Nom de l'album à supprimer.
 * @returns {Promise<{error: string|null}>} Résultat de l'opération de suppression de l'album ou une erreur.
 * @throws {500} Erreur lors de la suppression de l'album.
 */
router.put("/deleteAlbum", multer().any(), async (req, res) => {
    try {
        const { user, album } = req.body;
        const d = await photomaton_services.deleteAlbum(user, album);
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la suppression de l'album.",
        });
    }
});

/**
 * Endpoint pour créer un nouvel album.
 * @route POST /createAlbum
 * @param {string} user - Nom d'utilisateur.
 * @param {string} name - Nom du nouvel album.
 * @returns {Promise<{error: string|null, album: Object}>} Détails de l'album créé ou une erreur.
 * @throws {500} Erreur lors de la création de l'album.
 */
router.post("/createAlbum", multer().any(), async (req, res) => {
    try {
        const { user, name } = req.body;
        const d = await photomaton_services.createAlbum(user, name);
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la création de l'album.",
        });
    }
});

module.exports = router;
