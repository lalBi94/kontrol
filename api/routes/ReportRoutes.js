const express = require("express");
const router = express.Router();
const Report = require("../service/Report");
const report_services = new Report();
const multer = require("multer");
const { authenticateAdmin } = require("../middlewares/CanAccess");

/**
 * Endpoint pour envoyer un rapport.
 * @route POST /report/send
 * @param {string} message - Contenu du rapport.
 * @param {string} from - Expéditeur du rapport.
 * @param {string} contact - Contact associé au rapport.
 * @param {string} nature - Nature du rapport.
 * @returns {Promise<{error: string|null, ...}>} Réponse de la publication du rapport ou une erreur.
 * @throws {500} Erreur lors de l'envoie du report.
 */
router.post("/send", multer().any(), (req, res) => {
    try {
        const { message, from, contact, nature } = req.body;
        if (!message || !from || !contact || !nature) {
            return res.status(400).json({
                error: "Tous les champs sont obligatoires.",
            });
        }

        report_services
            .publishReport(message, from, contact, nature)
            .then((d) => {
                res.status(200).json(d);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({
                    error: "Erreur lors de l'envoi du rapport.",
                });
            });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de l'envoi du rapport.",
        });
    }
});

/**
 * Endpoint pour envoyer un rapport.
 * @route GET /report
 * @returns {Promise<{error: string|null, ...}>} Les reports.
 * @throws {500} Erreur lors de la recuperation des reports.
 */
router.get("/", multer().any(), authenticateAdmin, (req, res) => {
    try {
        report_services.getReports().then((d) => {
            res.status(200).json(d);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la recuperation des reports.",
        });
    }
});

/**
 * Endpoint pour supprimer un rapport.
 * @route GET /report/delete
 * @returns {Promise<{error: string|null, ...}>} Les reports.
 * @throws {404 | 500} Erreur lors de la recuperation des reports.
 */
router.post("/deleteReport", multer().any(), authenticateAdmin, (req, res) => {
    try {
        const { queue } = req.body;

        report_services.deleteReport(queue).then((d) => {
            res.status(d.error ? 404 : 200).json(d);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erreur lors de la recuperation des reports.",
        });
    }
});

module.exports = router;
