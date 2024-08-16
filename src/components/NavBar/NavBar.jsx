import {
    Stack,
    Avatar,
    Typography,
    Button,
    Tooltip,
    Modal,
    ModalDialog,
    DialogTitle,
    DialogContent,
    FormControl,
    Select,
    Option,
    Input,
    Textarea,
    FormLabel,
} from "@mui/joy";
import StarIcon from "@mui/icons-material/Star";
import { useGate } from "../../hooks/useGate";
import { notification } from "antd";
import { useEffect, useState } from "react";
import "./NavBar.scss";
import { styled } from "@mui/joy";
import LogoutIcon from "@mui/icons-material/Logout";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import logoWhite from "/logo_white.png";
import Clock from "../Clock/Clock";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { sendReport } from "../../services/Report";
import { Link } from "react-router-dom";

const PulseBadge2 = styled("div")(({ theme }) => ({
    position: "relative",
    width: "14px",
    height: "14px",
    backgroundColor: "green",
    borderRadius: "50%",
    boxShadow: `0 0 0 0 rgba(0, 128, 0, 0.7)`,
    animation: "pulse 2s infinite",
    "&::before": {
        content: '""',
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "100%",
        height: "100%",
        backgroundColor: "green",
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        animation: "pulseBefore 2s infinite",
    },
    "@keyframes pulse": {
        "0%": {
            boxShadow: `0 0 0 0 rgba(0, 128, 0, 0.7)`,
        },
        "70%": {
            boxShadow: `0 0 0 10px rgba(0, 128, 0, 0)`,
        },
        "100%": {
            boxShadow: `0 0 0 0 rgba(0, 128, 0, 0)`,
        },
    },
    "@keyframes pulseBefore": {
        "0%": {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: 1,
        },
        "70%": {
            transform: "translate(-50%, -50%) scale(2)",
            opacity: 0,
        },
        "100%": {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: 0,
        },
    },
}));

export default function NavBar() {
    const gate = useGate();
    const [inModal, setInModal] = useState(false);
    const [apiNotif, contextHolder] = notification.useNotification();
    const [message, setMessage] = useState("");
    const [contact, setContact] = useState("");
    const [nature, setNature] = useState("suggestion");

    const handleMessage = (e) => {
        setMessage(e.target.value);
    };

    const handleContact = (e) => {
        setContact(e.target.value);
    };

    const handleNature = (e) => {
        setNature(e.target.innerText);
    };

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

    const sendMessage = (e) => {
        e.preventDefault();

        sendReport(
            message,
            gate.user,
            contact,
            nature,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            if (res.error) {
                openNotification(
                    "Problème",
                    "Impossible d'envoyer votre message pour le moment. Tentez plus tard !",
                    true,
                    true,
                    true
                );
            } else {
                openNotification(
                    "Succès",
                    "Votre message a bien été transmis. Vous serez contacter si nécesaire.",
                    true,
                    true
                );
            }

            setInModal(false);
        });
    };

    const handleModal = () => {
        setInModal(!inModal);
    };

    useEffect(() => {}, [gate]);

    return (
        <nav id="nav-container">
            {contextHolder}

            <Modal open={inModal}>
                <ModalDialog>
                    <DialogTitle>Contactez Kontrol</DialogTitle>

                    <DialogContent>
                        <form onSubmit={sendMessage} id="form">
                            <Stack id="form-ipts">
                                <FormControl>
                                    <FormLabel>Nature</FormLabel>

                                    <Select
                                        onChange={handleNature}
                                        defaultValue="Suggestion"
                                        required
                                        autoFocus
                                    >
                                        <Option value="Suggestion">
                                            Suggestion
                                        </Option>
                                        <Option value="error">Problème</Option>
                                        <Option value="Réclamation">
                                            Réclamation
                                        </Option>
                                        <Option value="Partenariat">
                                            Partenariat
                                        </Option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Message</FormLabel>
                                    <Textarea
                                        required
                                        onChange={handleMessage}
                                        placeholder="Ecrivez votre message ici"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Contact</FormLabel>
                                    <Input
                                        onChange={handleContact}
                                        placeholder="Ecrivez ici un moyen de vous contacter (optionnel)"
                                    />
                                </FormControl>
                            </Stack>

                            <Stack id="form-actions">
                                <Button type="submit">Envoyer</Button>

                                <Button color="danger" onClick={handleModal}>
                                    Fermer
                                </Button>
                            </Stack>
                        </form>
                    </DialogContent>
                </ModalDialog>
            </Modal>

            <Link to="/home" id="nav-brand">
                <img id="nav-logo" loading="lazy" src={logoWhite} alt="" />
            </Link>

            <Stack id="nav-clock">
                <Clock />
            </Stack>

            <Tooltip
                title={`En tant qu${
                    gate.level === 0
                        ? "'Administrateur"
                        : gate.level === 1
                        ? "'Utilisateur Régulier"
                        : "e Modérateur"
                }`}
            >
                <Stack id="nav-sub-container">
                    <PulseBadge2 />
                    <Typography id="nav-text">
                        Connecté sur{" "}
                        <b className="shantell-sans-regular">{gate.user}</b>
                    </Typography>
                    <Avatar src={gate.img} />
                </Stack>
            </Tooltip>

            <Stack id="nav-actions">
                <Tooltip title="Deconnexion">
                    <Button
                        color="neutral"
                        onClick={null}
                        className="nav-action"
                    >
                        <QuestionMarkIcon />
                    </Button>
                </Tooltip>

                <Tooltip title="Tutoriel">
                    <Button color="primary" className="nav-action">
                        <QuestionMarkIcon />
                    </Button>
                </Tooltip>

                <Tooltip title="Contact">
                    <Button
                        color="warning"
                        onClick={handleModal}
                        className="nav-action"
                    >
                        <SupportAgentIcon />
                    </Button>
                </Tooltip>

                <Tooltip title="Deconnexion">
                    <Button
                        color="danger"
                        onClick={gate.disconnect}
                        className="nav-action"
                    >
                        <LogoutIcon />
                    </Button>
                </Tooltip>
            </Stack>
        </nav>
    );
}
