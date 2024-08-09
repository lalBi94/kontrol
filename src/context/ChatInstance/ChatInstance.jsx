import React, { useEffect } from "react";
import { notification } from "antd";
import { socket } from "../../services/Socket";
import { useGate } from "../../hooks/useGate";
import notifAudio from "../../assets/audio/notification.mp3";

export const ChatInstanceContext = React.createContext(null);

export const ChatInstanceProvider = ({ children }) => {
    const gate = useGate();
    const [apiNotif, contextHolder] = notification.useNotification();
    const notificationAudio = new Audio(notifAudio);

    const openNotification = (
        title,
        content,
        showProgress = true,
        pauseOnHover = true,
        error = false,
        placement = "top"
    ) => {
        apiNotif[error ? "error" : "success"]({
            message: title,
            description: content,
            showProgress,
            pauseOnHover,
            placement,
        });
    };

    useEffect(() => {
        if (socket) {
            const handleMessage = (
                discussion,
                message,
                author,
                date,
                avatar
            ) => {
                console.log(discussion, message, author, date, avatar);

                if (gate.user !== author) {
                    notificationAudio.volume = 0.3;
                    notificationAudio.play();

                    openNotification(
                        `Nouveau message dans ${discussion} !`,
                        `${author}: ${message}`,
                        true,
                        true,
                        false,
                        "topRight"
                    );
                }
            };

            socket.emit("kpture.sendPresence", gate.user);

            socket.on("kpture.newMessage", handleMessage);

            return () => {
                socket.off("kpture.newMessage", handleMessage);
                socket.emit("kpture.disconnect", gate.user);
            };
        }
    }, [gate]);

    return (
        <ChatInstanceContext.Provider value={null}>
            {contextHolder}
            {children}
        </ChatInstanceContext.Provider>
    );
};
