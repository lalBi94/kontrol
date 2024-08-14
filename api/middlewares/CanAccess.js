const Users = require("../service/Users");
const users = new Users();

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res
            .status(401)
            .json({ error: "Accès non autorisé. Token manquant." });
    }

    const { error } = await users.decodeToken(token);

    if (error) {
        return res.status(403).json({ error: "Token invalide ou expiré." });
    }

    next();
};

module.exports = authenticateToken;
