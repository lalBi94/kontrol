const express = require("express");
const router = express.Router();
const Webfav = require("../service/Webfav");
const webfav_services = new Webfav();
const multer = require("multer");

router.post("/addWebsiteFav", multer().any(), async (req, res) => {
    try {
        const { user, url, name, image_url } = req.body;
        const d = await webfav_services.addWebsiteFav(
            user,
            url,
            name,
            image_url
        );
        res.json(d);
    } catch (err) {
        console.error(err);
    }
});

router.get("/retreiveWebsiteFav/:user", async (req, res) => {
    try {
        const user = req.params.user;
        const d = await webfav_services.retreiveWebsiteFav(user);
        res.json(d);
    } catch (err) {
        console.error(err);
    }
});

router.post("/deleteWebsiteFav", multer().any(), async (req, res) => {
    try {
        const { user, url } = req.body;
        const d = await webfav_services.deleteWebsiteFav(user, url);
        res.json(d);
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;
