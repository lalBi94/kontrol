import { useEffect, useState, useRef } from "react";
import MainLayout from "../../layout/MainLayout";
import "./Chat.scss";
import { socket } from "../../services/Socket";
import { useGate } from "../../hooks/useGate";
import ChatBubble from "../../components/ChatBubble/ChatBubble";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import {
    Stack,
    CircularProgress,
    Divider,
    Avatar,
    Button,
    Typography,
    Badge,
    Box,
    FormControl,
    FormLabel,
    DialogContent,
    Input,
    Modal,
    ModalDialog,
} from "@mui/joy";
import SendIcon from "@mui/icons-material/Send";
import { getUsers } from "../../services/Users";
import Displayable from "./../../components/Displayable/Displayable";
import DisplayableAdd from "./../../components/DisplayableAdd/DisplayableAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatIcon from "@mui/icons-material/Chat";

export default function Chat() {
    const gate = useGate();
    const [inCreateModal, setInCreateModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [connecteds, setConnecteds] = useState([]);
    const [newDiscussion, setNewDiscussion] = useState("");
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const [discussions, setDiscussions] = useState([]);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [currentDiscussionName, setCurrentDiscussionName] = useState("");
    const boxChat = useRef(null);

    const handleCreateModal = () => {
        setInCreateModal(true);
    };

    const handleMessage = (e) => {
        setMessage(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (message.trim() === "") return;

        setMessage("");

        socket.emit(
            "kpture.message",
            currentDiscussionName,
            message,
            gate.user,
            gate.img
        );
    };

    const handleCloseCreateModal = () => {
        setInCreateModal(false);
    };

    const handleNewDiscussion = (e) => {
        setNewDiscussion(e.target.value);
    };

    const goBoxScrollDown = () => {
        setTimeout(() => {
            boxChat.current.scrollTop = boxChat.current.scrollHeight;
        }, 500);
    };

    const handleCreateDiscussion = (e) => {
        e.preventDefault();
        if (newDiscussion.trim() === "") return;
        socket.emit("kpture.createDiscussion", newDiscussion);
        setNewDiscussion("");
        handleCloseCreateModal();
    };

    const getMessagesOf = (discussion) => {
        setIsLoadingChat(true);
        localStorage.setItem("kpture.currentDiscussion", discussion);
        setCurrentDiscussionName(discussion);
        setChat([]);
        socket.emit("kpture.getMessages", discussion);
    };

    const deleteDiscussion = (discussionId, discussionName) => {
        socket.emit("kpture.deleteDiscussion", discussionId, discussionName);
        setDiscussions(discussions.filter((d) => d.id !== discussionId));

        setChat([]);
    };

    useEffect(() => {
        getUsers().then((res) => {
            setUsers(res.data);
        });

        const last_discussion = localStorage.getItem(
            "kpture.currentDiscussion"
        );

        if (gate.user) {
            if (last_discussion) {
                getMessagesOf(last_discussion);
            }

            socket.on(
                "kpture.deletingDiscussion",
                (discussionId, discussionName) => {
                    if (
                        localStorage.getItem("kpture.currentDiscussion") ===
                        discussionName
                    ) {
                        localStorage.removeItem("kpture.currentDiscussion");
                    }

                    const newDiscussions = discussions.filter(
                        (d) => d.id !== discussionId
                    );

                    setDiscussions(newDiscussions);
                }
            );

            socket.emit("kpture.sendPresence", gate.user);

            socket.on("kpture.messages", (messages) => {
                let stock = [];
                let i = 0;

                for (let m of messages) {
                    if (m.author && m.message && m.date && m.avatar) {
                        stock.push(
                            <ChatBubble
                                key={i}
                                name={m.author}
                                chat={m.message}
                                date={m.date}
                                avatar={m.avatar}
                                position={
                                    m.author === gate.user ? "right" : "left"
                                }
                            />
                        );

                        ++i;
                    }
                }

                setIsLoadingChat(false);
                setChat(stock);
                goBoxScrollDown();
            });

            socket.on("kpture.connectedUsers", (users) => {
                setConnecteds(users);
            });

            socket.on("kpture.confirmConnected", (msg) => {
                socket.emit("kpture.getConnectedUsers");
            });

            socket.on("kpture.discussionCreated", (discussion) => {
                setDiscussions((prevDiscussions) => [
                    ...prevDiscussions,
                    discussion,
                ]);
            });

            socket.on("kpture.discussions", (discussions) => {
                setDiscussions(discussions);
            });

            socket.on(
                "kpture.newMessage",
                (discussion, message, author, date, avatar, id) => {
                    if (discussion === currentDiscussionName) {
                        setChat((prevChat) => [
                            ...prevChat,
                            <ChatBubble
                                key={id}
                                name={author}
                                chat={message}
                                date={date}
                                avatar={avatar}
                                position={
                                    author === gate.user ? "right" : "left"
                                }
                            />,
                        ]);

                        goBoxScrollDown();
                    }
                }
            );

            socket.emit("kpture.getDiscussions");

            return () => {
                socket.off("kpture.connectedUsers");
                socket.off("kpture.confirmConnected");
                socket.off("kpture.discussionCreated");
                socket.off("kpture.discussions");
                socket.off("kpture.messages");
            };
        }
    }, [gate, currentDiscussionName]);

    return (
        <MainLayout>
            <Modal open={inCreateModal}>
                <ModalDialog>
                    <DialogContent>
                        <form onSubmit={handleCreateDiscussion} id="wf-form">
                            <Stack id="wf-form-ipts">
                                <FormControl>
                                    <FormLabel>Nom de la discussion</FormLabel>
                                    <Input
                                        required
                                        onChange={handleNewDiscussion}
                                        placeholder="Ex: Cousins, Équipe A, ..."
                                        value={newDiscussion}
                                    />
                                </FormControl>
                            </Stack>

                            <Stack id="wf-form-actions">
                                <Button type="submit">Valider</Button>
                                <Button
                                    onClick={handleCloseCreateModal}
                                    color="danger"
                                >
                                    Annuler
                                </Button>
                            </Stack>
                        </form>
                    </DialogContent>
                </ModalDialog>
            </Modal>
            <Stack id="users-list-gen-container">
                <Typography id="users-list-gen-container-title" level="h3">
                    <span className="poppins-medium-italic">
                        Membres de la discussion actuelle (
                        {currentDiscussionName})
                    </span>
                </Typography>
                {users.length > 0 ? (
                    <Stack id="users-list-container">
                        {users.map((user, k) => (
                            <Box className="users-container" key={k}>
                                <Badge
                                    variant="solid"
                                    color={
                                        connecteds.includes(user.user)
                                            ? "success"
                                            : "danger"
                                    }
                                >
                                    <Avatar src={user.img} />
                                </Badge>

                                <Typography className="users-txt">
                                    <b className="shantell-sans-regular">
                                        {user.user}
                                    </b>
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                ) : null}
                <Divider />

                <Stack id="chat-container">
                    <Stack id="chat-navigation">
                        {gate.level === 0 ? (
                            <Box>
                                <DisplayableAdd handler={handleCreateModal} />
                            </Box>
                        ) : null}
                        <Divider />

                        <Box id="chat-discussion-list">
                            {discussions.map((discussion, k) => (
                                <Box
                                    className="chat-discussion-list-chat"
                                    key={k}
                                >
                                    {gate.level === 0 ? (
                                        <Button
                                            onClick={() => {
                                                deleteDiscussion(
                                                    discussion.id,
                                                    discussion.name
                                                );
                                            }}
                                            color="danger"
                                            className="chat-discussion-list-del"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </Button>
                                    ) : null}

                                    <Displayable
                                        key={discussion.id}
                                        handler={() => {
                                            getMessagesOf(discussion.name);
                                        }}
                                        openInAnotherWindow={false}
                                        text={discussion.name}
                                        tooltip={discussion.name}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Stack>

                    <Divider id="chat-hr-vert" orientation="vertical" />

                    <Stack id="messagerie-content">
                        <Stack id="stock-message" ref={boxChat}>
                            {!isLoadingChat ? (
                                chat
                            ) : (
                                <CircularProgress
                                    color="neutral"
                                    determinate={false}
                                    variant="plain"
                                />
                            )}
                        </Stack>

                        <Stack id="messagerie-actions">
                            <form
                                id="messagerie-actions-forms"
                                onSubmit={handleSubmit}
                            >
                                <FormControl style={{ width: "100%" }}>
                                    <Input
                                        startDecorator={
                                            <ChatIcon fontSize="small" />
                                        }
                                        id="messagerie-actions-ipt"
                                        placeholder="Votre message"
                                        onChange={handleMessage}
                                        value={message}
                                    />
                                </FormControl>

                                <Button
                                    id="messagerie-actions-btn"
                                    type="submit"
                                >
                                    <AttachFileIcon />
                                </Button>

                                <Button
                                    id="messagerie-actions-btn"
                                    type="submit"
                                >
                                    <SendIcon />
                                </Button>
                            </form>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </MainLayout>
    );
}
