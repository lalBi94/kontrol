import {
    Stack,
    Box,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    LinearProgress,
    Button,
    Typography,
} from "@mui/joy";
import "./KtpureUsers.scss";
import MainLayout from "../../layout/MainLayout";
import Displayable from "../../components/Displayable/Displayable";
import { useState, useEffect } from "react";
import { Avatar } from "antd";
import PersonIcon from "@mui/icons-material/Person";
import KeyIcon from "@mui/icons-material/Key";
import { getUsers, registerSomeone } from "../../services/Users";
import { notification } from "antd";

export default function KptureUsers() {
    const [selectedCat, setSelectedCat] = useState("create_user");
    const [password, setPassword] = useState("");
    const [apiNotif, contextHolder] = notification.useNotification();
    const [linkImg, setLinkImg] = useState(
        "https://media.tenor.com/5fG91EUSlIAAAAAM/pinoquio.gif"
    );
    const [user, setUser] = useState("");
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [users, setUsers] = useState([]);

    const handleUsers = () => {
        getUsers().then((res) => {
            setUsers(res.data.filter((e) => e.user !== "admin"));
        });
    };

    useEffect(() => {
        if (selectedCat === "delete_users") {
            handleUsers();
        }
    }, [selectedCat]);

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

    const handleRegister = () => {
        setLoadingCreate(true);

        registerSomeone(
            user,
            false,
            linkImg,
            password,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            setLoadingCreate(false);
            if (!res.error) {
                openNotification(
                    "Succes",
                    "L'utilisateur a été crée !",
                    true,
                    true,
                    false,
                    "top"
                );
            } else {
                openNotification(
                    "Erreur",
                    "L'utilisateur existe deja.",
                    true,
                    true,
                    true,
                    "top"
                );
            }
        });
    };

    const handleUser = (e) => {
        setUser(e.target.value);
    };

    const handleSwitch = (cat) => {
        setSelectedCat(cat);
    };

    const handleLinkImg = (e) => {
        setLinkImg(e.target.value);
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
    };

    return (
        <MainLayout>
            {contextHolder}
            <Box id="kpture-container">
                <Stack>
                    <Displayable
                        handler={() => {
                            handleSwitch("create_user");
                        }}
                        text="Création d'un utilisateur"
                    />

                    <Displayable
                        handler={() => {
                            handleSwitch("delete_users");
                        }}
                        text="Supression d'utilisateurs"
                    />
                </Stack>

                {selectedCat === "create_user" ? (
                    <Stack className="kpture-user-form-container">
                        <form className="kpture-user-form">
                            <FormControl>
                                <FormLabel className="kpture-user-form-text">
                                    <span className="poppins-medium-italic">
                                        Nom de l'utilisateur
                                    </span>
                                </FormLabel>
                                <Input
                                    onChange={handleUser}
                                    startDecorator={<PersonIcon />}
                                    placeholder="Ex: Pinoccio"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel className="kpture-user-form-text">
                                    <span className="poppins-medium-italic">
                                        URL de l'image
                                    </span>
                                </FormLabel>

                                <Input
                                    startDecorator={
                                        <Avatar
                                            size="md"
                                            src={
                                                linkImg.length > 0
                                                    ? linkImg
                                                    : null
                                            }
                                            alt=""
                                        />
                                    }
                                    onChange={handleLinkImg}
                                    value={linkImg}
                                    placeholder="https://media.tenor.com/5fG91EUSlIAAAAAM/pinoquio.gif"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel className="kpture-user-form-text">
                                    <span className="poppins-medium-italic">
                                        Mot de passe par défaut
                                    </span>
                                </FormLabel>
                                <Input
                                    startDecorator={<KeyIcon />}
                                    placeholder="Ex: ezfs#342//??"
                                    onChange={handlePassword}
                                />

                                <Typography
                                    level="body-xs"
                                    style={{
                                        color:
                                            password.length > 8
                                                ? "green"
                                                : password.length > 5
                                                ? "orange"
                                                : password.length > 3
                                                ? "salmon"
                                                : "red",
                                    }}
                                    sx={{
                                        alignSelf: "flex-end",
                                    }}
                                >
                                    {password.length < 3 && "Très faible"}
                                    {password.length >= 3 &&
                                        password.length < 6 &&
                                        "Faible"}
                                    {password.length >= 6 &&
                                        password.length < 10 &&
                                        "Robuste !"}
                                    {password.length >= 10 && "Très robuste !"}
                                </Typography>
                            </FormControl>

                            <FormControl
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: "10px",
                                }}
                            >
                                <Checkbox onChange={false} />

                                <FormLabel className="kpture-user-form-text">
                                    Administrateur ?
                                </FormLabel>
                            </FormControl>

                            <Button
                                loading={loadingCreate}
                                onClick={handleRegister}
                            >
                                Créer
                            </Button>
                        </form>
                    </Stack>
                ) : selectedCat === "delete_users" ? (
                    <Stack>
                        {users.length > 0
                            ? users.map((v, i) => (
                                  <Stack key={i}>
                                      <Avatar src={v.img} />

                                      <Typography>
                                          <span className="poppins-medium-italic">
                                              {v.user}
                                          </span>
                                      </Typography>
                                  </Stack>
                              ))
                            : null}
                    </Stack>
                ) : null}
            </Box>
        </MainLayout>
    );
}
