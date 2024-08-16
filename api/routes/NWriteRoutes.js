const express = require("express");
const router = express.Router();
const NWrite = require("../service/NWrite");
const nwrite_services = new NWrite();
const multer = require("multer");

/**
 * Endpoint pour supprimer une note en particulier.
 * @route POST /nwrite/deleteNote
 * @param {string} user - Nom d'utilisateur.
 * @param {string} title - Titre de la note.
 * @returns {Promise<{error: string|null}>} Erreur ou non.
 * @throws {500} Erreur lors de la suppression de la note !.
 */
router.post("/deleteNote", multer().any(), async (req, res) => {
    try {
        const { user, title } = req.body;
        const d = await nwrite_services.deleteNote(user, title);
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la suppression de la note !",
        });
    }
});

/**
 * Endpoint pour enregistrer une note sur le serveur.
 * @route POST /nwrite/sendNote
 * @param {string} title - Titre de la note.
 * @param {string} content - Contenu de la note.
 * @param {string} user - Nom d'utilisateur.
 * @param {string} keyword - Mots-clés en rapport avec la note.
 * @returns {Promise<{error: string|null}>} Erreur ou non.
 * @throws {500} Erreur lors de l'envoie de la note !.
 */
router.post("/sendNote", multer().any(), async (req, res) => {
    try {
        const { title, content, user, keyword } = req.body;
        const d = await nwrite_services.sendNote(
            title,
            content,
            user,
            JSON.parse(keyword)
        );
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de l'envoie de la note !",
        });
    }
});

/**
 * Endpoint pour modifier une note sur le serveur.
 * @route POST /nwrite/updateNote
 * @param {string} title - Titre de la note.
 * @param {string} content - Nouveau contenu de la note.
 * @param {string} user - Nom d'utilisateur.
 * @param {string} keyword - nouveau Mots-clés en rapport avec la note.
 * @returns {Promise<{error: string|null}>} Erreur ou non.
 * @throws {500} Erreur lors de l'update de la note !.
 */
router.post("/updateNote", multer().any(), async (req, res) => {
    try {
        const { title, content, user, newName } = req.body;

        const d = await nwrite_services.updateNote(
            title,
            user,
            content,
            newName
        );
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de l'update de la note !",
        });
    }
});

/**
 * Endpoint pour recuperer les notes d'un utilisateur.
 * @route POST /nwrite/getAllNotesOf
 * @param {string} user - Nom d'utilisateur.
 * @returns {Promise<{error: string|null}, title_list: Array<String>} Erreur ou non.
 * @throws {500} Erreur lors de la récupération des notes !.
 */
router.post("/getAllNotesOf", multer().any(), async (req, res) => {
    try {
        const { user } = req.body;
        const d = await nwrite_services.getAllNotesOf(user);
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la récupération des notes !",
        });
    }
});

/**
 * Endpoint pour recuperer une note en particulier.
 * @route POST /nwrite/getNoteData
 * @param {string} user - Nom d'utilisateur.
 * @param {string} title - Titre de la note.
 * @returns {Promise<{error: string|null}, content: {tile: string, content: string}} Erreur ou non.
 * @throws {500} Erreur lors de la récupération d'une note !.
 */
router.post("/getNoteData", multer().any(), async (req, res) => {
    try {
        const { user, title } = req.body;
        const d = await nwrite_services.getNoteData(user, title);
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la récupération d'une note !",
        });
    }
});

module.exports = router;
