const express = require("express");
const router = express.Router();
const Users = require("../service/Users");
const users_services = new Users();
const multer = require("multer");

/**
 * Endpoint pour récupérer tous les utilisateurs.
 * @route GET /users
 * @returns {Promise<Array<{id: string, name: string, email: string, ...}>>} Liste des utilisateurs.
 * @throws {500} Erreur lors de la récupération des utilisateurs.
 */
router.get("/", async (req, res) => {
    try {
        const d = await users_services.retreiveAll();
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la récupération des utilisateurs.",
        });
    }
});

/**
 * Endpoint pour obtenir les informations d'une session à partir d'un token.
 * @route POST /users/getSessionOf
 * @param {string} token - Token de session.
 * @returns {Promise<{userId: string, ...} | {error: string}>} Informations de session ou une erreur.
 * @throws {500} Erreur lors de la décodification du token.
 */
router.post("/getSessionOf", multer().any(), async (req, res) => {
    try {
        const { token } = req.body;
        const d = await users_services.decodeToken(token);
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la décodification du token.",
        });
    }
});

/**
 * Endpoint pour connecter un utilisateur.
 * @route POST /users/login
 * @param {string} name - Nom d'utilisateur.
 * @param {string} password - Mot de passe.
 * @param {string} remember - Indicateur de persistance de la session ("true" ou "false").
 * @returns {Promise<{token: string, ...} | {error: string}>} Réponse de la connexion ou une erreur.
 * @throws {500} Erreur lors de la tentative de connexion.
 */
router.post("/login", multer().any(), async (req, res) => {
    try {
        const { name, password, remember } = req.body;
        const d = await users_services.login(
            name,
            password,
            remember === "true"
        );
        res.status(200).json(d);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la tentative de connexion.",
        });
    }
});

module.exports = router;
