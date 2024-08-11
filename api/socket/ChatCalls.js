const Hermes = require("../service/Hermes");
const moment = require("moment");
const hermes = new Hermes();
const DBMessage = require("../service/DBMessage");
const dbMessage = new DBMessage();

module.exports = (io) => {
    io.on("connection", (socket) => {
        socket.on("kpture.getConnectedUsers", () => {
            hermes.getConnectedUsers().then((res) => {
                socket.emit("kpture.connectedUsers", res);
                console.log(res);
            });
        });

        socket.on("kpture.deleteDiscussion", (discussionId) => {
            console.log("Suppression de la discussion ID:", discussionId);

            if (discussionId) {
                dbMessage.deleteDiscussion(discussionId, (err) => {
                    if (err) {
                        console.error(
                            "Erreur lors de la suppression de la discussion:",
                            err
                        );
                    } else {
                        io.emit("kpture.deletingDiscussion", discussionId);

                        console.log(
                            "Discussion ID",
                            discussionId,
                            "supprimée avec succès."
                        );
                    }
                });
            } else {
                console.error("ID de la discussion non fourni ou invalide.");
            }
        });

        socket.on("kpture.sendPresence", (user) => {
            console.log(user, " connecté sur le chat.");

            if (user) {
                hermes.addConnected(user, io);
                socket.emit("kpture.confirmConnected", "Connecté sur le chat");
            }
        });

        socket.on("kpture.message", (discussion, message, author, avatar) => {
            console.log(discussion, message, author, avatar);

            dbMessage.insertMessage(
                discussion,
                message,
                author,
                new Date(),
                avatar,
                (err, id) => {
                    if (err) {
                        console.error(
                            "Erreur lors de l'insertion du message:",
                            err
                        );
                    } else {
                        io.emit(
                            "kpture.newMessage",
                            discussion,
                            message,
                            author,
                            moment()
                                .locale("fr")
                                .format("MMMM Do YYYY à hh:mm"),
                            avatar,
                            id
                        );
                    }
                }
            );
        });

        socket.on("kpture.getMessages", (discussion) => {
            dbMessage.getMessages(discussion, (err, messages) => {
                if (err) {
                    console.error(
                        "Erreur lors de la récupération des messages:",
                        err
                    );
                } else {
                    socket.emit("kpture.messages", messages);
                }
            });
        });

        socket.on("kpture.createDiscussion", (discussionName) => {
            dbMessage.insertDiscussion(discussionName, (err, discussionId) => {
                if (err) {
                    console.error(
                        "Erreur lors de la création de la discussion:",
                        err
                    );
                } else {
                    io.emit("kpture.discussionCreated", {
                        id: discussionId,
                        name: discussionName,
                    });
                }
            });
        });

        socket.on("kpture.getDiscussions", () => {
            dbMessage.getAllDiscussions((err, discussions) => {
                if (err) {
                    console.error(
                        "Erreur lors de la récupération des discussions:",
                        err
                    );
                } else {
                    socket.emit("kpture.discussions", discussions);
                }
            });
        });

        socket.on("kpture.disconnect", (user) => {
            if (user) {
                hermes.disconnectSomeone(user, io).then(() => {
                    console.log(user, " déconnecté du chat.");
                });
            }
        });
    });
};
