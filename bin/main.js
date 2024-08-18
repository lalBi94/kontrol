const { app, BrowserWindow } = require("electron");

const createWindow = () => {
    const win = new BrowserWindow({ icon: "../public/favicon.png" });

    win.loadURL("http://localhost:3001/"); // Veillez a bien configurer le serveur
};

app.whenReady().then(() => {
    createWindow();
});
