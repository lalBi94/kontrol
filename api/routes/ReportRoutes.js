const express = require("express");
const router = express.Router();
const Report = require("../service/Report");
const report_services = new Report();
const multer = require("multer");

/**
 * Endpoint pour envoyer un rapport.
 * @route POST /report/send
 * @param {string} message - Contenu du rapport.
 * @param {string} from - Expéditeur du rapport.
 * @param {string} contact - Contact associé au rapport.
 * @param {string} nature - Nature du rapport.
 * @returns {Promise<{error: string|null, ...}>} Réponse de la publication du rapport ou une erreur.
 */
router.post("/send", multer().any(), (req, res) => {
    try {
        const { message, from, contact, nature } = req.body;

        report_services
            .publishReport(message, from, contact, nature)
            .then((d) => {
                res.json(d);
            });
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;
