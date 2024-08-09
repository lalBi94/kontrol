const Users = require("./service/Users");
const usersd = new Users();

usersd.registerSomeone({
    user: "admin",
    password: "kontrol-admin",
    level: 0,
    img: "https://media.tenor.com/jonhQGiKkIQAAAAM/samdreamsmaker-samuel-guizani.gif",
});

const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const corsOption = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
};

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOption));

app.use(express.static(path.join(__dirname, "dist")));

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
