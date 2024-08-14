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
 */
router.post("/deleteNote", multer().any(), async (req, res) => {
    try {
        const { user, title } = req.body;
        const d = await nwrite_services.deleteNote(user, title);
        res.json(d);
    } catch (err) {
        console.error(err);
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
        res.json(d);
    } catch (err) {
        console.error(err);
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
        res.json(d);
    } catch (err) {
        console.error(err);
    }
});

/**
 * Endpoint pour recuperer les notes d'un utilisateur.
 * @route POST /nwrite/getAllNotesOf
 * @param {string} user - Nom d'utilisateur.
 * @returns {Promise<{error: string|null}, title_list: Array<String>} Erreur ou non.
 */
router.post("/getAllNotesOf", multer().any(), async (req, res) => {
    try {
        const { user } = req.body;
        const d = await nwrite_services.getAllNotesOf(user);
        res.json(d);
    } catch (err) {
        console.error(err);
    }
});

/**
 * Endpoint pour recuperer une note en particulier.
 * @route POST /nwrite/getNoteData
 * @param {string} user - Nom d'utilisateur.
 * @param {string} title - Titre de la note.
 * @returns {Promise<{error: string|null}, content: {tile: string, content: string}} Erreur ou non.
 */
router.post("/getNoteData", multer().any(), async (req, res) => {
    try {
        const { user, title } = req.body;
        const d = await nwrite_services.getNoteData(user, title);
        res.json(d);
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;
