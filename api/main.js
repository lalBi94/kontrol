const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs/promises");

(async () => {
    try {
        const path_data = path.join(__dirname, "data");
        const path_admin = path.join(path_data, "admin");
        const path_temp = path.join(__dirname, "temp");

        await fs.access(path_temp).catch(async () => {
            await fs.mkdir(path_temp, { recursive: true });
        });

        await fs.access(path_data).catch(async () => {
            await fs.mkdir(path_data, { recursive: true });
        });

        await fs.access(path_admin).catch(async () => {
            const Users = require("./service/Users");
            const usersd = new Users();

            await usersd.registerSomeone({
                user: "admin",
                password: "kontrol-admin",
                level: 0,
                img: "https://media.tenor.com/jonhQGiKkIQAAAAM/samdreamsmaker-samuel-guizani.gif",
            });
        });
    } catch (error) {
        console.error(error);
    }
})();

require("dotenv").config({ path: path.join(__dirname, ".env") });

const corsOption = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
};

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOption));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(express.static(path.join(__dirname, "dist")));

const { authenticateToken } = require("./middlewares/CanAccess");
app.all("/pandora/*", authenticateToken);
app.all("/webfav/*", authenticateToken);
app.all("/report/*", authenticateToken);
app.all("/photomaton/*", authenticateToken);
app.all("/nwrite/*", authenticateToken);

const report = require("./routes/ReportRoutes");
app.use("/report", report);

const photomaton = require("./routes/PhotomatonRoutes");
app.use("/photomaton", photomaton);

const users = require("./routes/UsersRoutes");
app.use("/users", users);

const pandora = require("./routes/PandoraRoutes");
app.use("/pandora", pandora);

const webfav = require("./routes/WebfavRoutes");
app.use("/webfav", webfav);

const nwrite = require("./routes/NWriteRoutes");
app.use("/nwrite", nwrite);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(process.env.API_PORT, () => {
    console.log(`[✓] API on ${process.env.API_PORT}`);
});

if (process.env.SOCKET_PORT) {
    const http = require("http");
    const { Server } = require("socket.io");
    const server = http.createServer(app);

    const io = new Server(server, {
        cors: {
            origin: "*",
            credentials: true,
            optionSuccessStatus: 200,
            methods: ["GET", "POST"],
        },
    });

    require("./socket/ChatCalls")(io);

    server.listen(process.env.SOCKET_PORT, () => {
        console.log(`[✓] Socket on ${process.env.SOCKET_PORT}`);
    });
}
