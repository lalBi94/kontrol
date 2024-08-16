import React, { useEffect, useState } from "react";
import {
    Avatar,
    Input,
    Typography,
    Button,
    Stack,
    Checkbox,
    FormControl,
    FormLabel,
    LinearProgress,
} from "@mui/joy";
import { notification } from "antd";
import "./gate-context.scss";
import { getSessionOf, getUsers, login } from "../../services/Users";
import { socket } from "../../services/Socket";

const init = {
    user: null,
    level: 0,
    img: null,
};

export const GateContext = React.createContext({
    ...init,
    disconnect: () => {},
});

export const GateProvider = ({ children }) => {
    const [gateData, setGateData] = useState(init);
    const [isVisible, setIsVisible] = useState(false);
    const [remember, setRemember] = useState(true);
    const [password, setPassword] = useState("");
    const [selected, setSelected] = useState(init);
    const [list, setList] = useState([]);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [apiNotif, contextHolder] = notification.useNotification();

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

    const handleCheckbox = (e) => {
        setRemember(e.target.checked);
    };

    const handleSelected = (user) => {
        setSelected(user);
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setIsConnecting(true);

        login(selected.user, password, remember).then((res) => {
            if (res.error) {
                localStorage.removeItem("kpture.token");
                openNotification("Problème", res.error, true, true, true);
            } else {
                localStorage.setItem("kpture.token", res.token);
                localStorage.setItem("kpture.user", selected.user);

                setGateData(selected);
                setIsVisible(false);
            }

            setIsConnecting(false);
        });
    };

    const disconnect = () => {
        localStorage.removeItem("kpture.token");
        socket.emit("kpture.disconnect", gateData.user);
        setGateData(init);
        window.location.reload();
    };

    const removeAllKpture = () => {
        localStorage.removeItem("kpture.token");
        localStorage.removeItem("kpture.user");
        localStorage.removeItem("kpture.last_albm");
    };

    useEffect(() => {
        const any_token = localStorage.getItem("kpture.token");

        if (any_token) {
            getSessionOf(any_token).then((d) => {
                if (d.error) {
                    removeAllKpture();

                    getUsers().then((res) => {
                        setIsVisible(true);
                        setSelected(res.data[0]);
                        setList(res.data);
                        setIsLoading(false);
                    });
                } else {
                    setGateData(d.decoded);
                    setIsVisible(false);
                    setIsLoading(false);
                }
            });
        } else {
            getUsers().then((res) => {
                setSelected(res.data[0]);
                setList(res.data);
                setIsVisible(true);
                setIsLoading(false);
            });
        }
    }, []);

    if (isLoading) {
        return <LinearProgress color="primary" variant="plain" />;
    }

    return (
        <GateContext.Provider value={{ ...gateData, disconnect }}>
            {contextHolder}

            {isVisible ? (
                <Stack id="gate-context-container-visible">
                    <Typography id="gate-context-title" level="h3">
                        Décline ton identité
                    </Typography>

                    {list.length > 0 ? (
                        <Stack id="gate-context-users">
                            {Object.keys(list).map((v, k) => (
                                <Stack
                                    key={k}
                                    className={`gate-context-user ${
                                        selected.user === list[v].user
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        handleSelected(list[v]);
                                    }}
                                >
                                    <Typography className="gate-context-user-name">
                                        {list[v].user}
                                    </Typography>

                                    <Avatar
                                        size="lg"
                                        src={list[v].img}
                                        variant="soft"
                                    />
                                </Stack>
                            ))}
                        </Stack>
                    ) : (
                        <LinearProgress color="primary" variant="plain" />
                    )}

                    <form
                        onSubmit={handleLogin}
                        id="gate-context-actions-container"
                    >
                        <FormControl>
                            <FormLabel>Ta phrase secrète</FormLabel>

                            <Input
                                required
                                id="gate-context-ipt"
                                placeholder="Code"
                                type="password"
                                name="password"
                                onChange={handlePassword}
                            />
                        </FormControl>

                        <FormControl>
                            <Checkbox
                                style={{ color: "white" }}
                                size="sm"
                                label="Se souvenir de moi aujourd'hui"
                                defaultChecked={true}
                                name="remember"
                                onChange={handleCheckbox}
                            />
                        </FormControl>

                        <Button
                            type="submit"
                            loading={isConnecting}
                            size="sm"
                            disabled={password.length === 0}
                            onClick={handleLogin}
                        >
                            Entrer
                        </Button>
                    </form>
                </Stack>
            ) : (
                children
            )}
        </GateContext.Provider>
    );
};
