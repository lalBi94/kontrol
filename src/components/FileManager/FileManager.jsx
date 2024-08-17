import "./FileManager.scss";
import * as React from "react";
import {
    Stack,
    Typography,
    Divider,
    Tooltip,
    Button,
    Dropdown,
    Menu,
    LinearProgress,
    MenuItem,
    Input,
    MenuButton,
} from "@mui/joy";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState, useRef } from "react";
import {
    deleteSomething,
    renameSomething,
    retreiveFile,
    retreiveZip,
    createDir,
    navigation,
    sendFileToStorage,
} from "../../services/Pandora";
import { useGate } from "../../hooks/useGate";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import { notification } from "antd";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { quantum } from "ldrs";

quantum.register();

export default function FileManager({ targetDir = "" }) {
    const gate = useGate();
    const [pathDir, setPathDir] = useState(targetDir);
    const [toShow, setToShow] = useState([]);
    const [filesLoading, setFilesLoading] = useState(false);
    const [apiNotif, contextHolder] = notification.useNotification();
    const [inDrag, setInDrag] = useState(false);
    const buttonInputFile = useRef(null);
    const [isLoadingMkdir, setIsLoadingMkdir] = useState(false);
    const [isLoadingAdd, setIsLoadingAdd] = useState(false);

    const handleLoadingAdd = () => {
        setIsLoadingAdd(!isLoadingAdd);
    };

    const handleLoadingMkdir = () => {
        setIsLoadingMkdir(!isLoadingMkdir);
    };

    function filterFilenamesOrDirnames(objList, searchStr) {
        return objList
            .map((f) => (f.filename ? f.filename : f.dirname))
            .filter((name) => name && name.includes(searchStr));
    }

    const handleRename = (pth, name) => {
        const newName = prompt(
            "Nouveau nom ? (n'oubliez pas l'extension)",
            name
        );

        if (!newName || newName.length === 0) {
            return;
        }

        if (filterFilenamesOrDirnames(toShow, newName).length > 0) {
            openNotification(
                "Erreur",
                "Un fichier/dossier est deja nommé ainsi !",
                true,
                true,
                true,
                "top"
            );
            return;
        }

        setFilesLoading(true);

        renameSomething(
            gate.user,
            pth,
            newName,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            if (res.error) {
                openNotification(
                    "Erreur",
                    "Impossible de renommer ce fichier !",
                    true,
                    true,
                    true,
                    "top"
                );
            } else {
                move(pathDir);
            }

            setFilesLoading(false);
        });
    };

    const onZipDownload = (pth) => {
        setFilesLoading(true);

        openNotification(
            "En cours...",
            "La compression peut durer un certain temps.",
            true,
            true,
            false,
            "bottomRight"
        );

        retreiveZip(gate.user, pth, localStorage.getItem("kpture.token")).then(
            (res) => {
                let fileName = res.contentDisposition
                    ? res.contentDisposition
                          .split("filename=")[1]
                          .split(";")[0]
                          .replace(/"/g, "")
                    : "downloaded-file.zip";

                const url = window.URL.createObjectURL(new Blob([res.blob]));
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);

                openNotification(
                    "Success",
                    "Votre téléchargement a démarré avec succès et le dossier est en cours de téléchargement dans votre navigateur.",
                    true,
                    true,
                    false,
                    "top"
                );

                setFilesLoading(false);
            }
        );
    };

    const handleDeleteSomething = (pth) => {
        setFilesLoading(true);

        deleteSomething(
            gate.user,
            pth,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            setFilesLoading(false);
            move(pathDir);
        });
    };

    const onFileDownload = (pth) => {
        setFilesLoading(true);

        retreiveFile(gate.user, pth, localStorage.getItem("kpture.token")).then(
            (res) => {
                let fileName = "downloadedFile";

                if (res.contentDisposition) {
                    const fileNameMatch =
                        res.contentDisposition.match(/filename="(.+)"/);
                    if (fileNameMatch.length === 2) {
                        fileName = fileNameMatch[1];
                    }
                }

                const url = window.URL.createObjectURL(new Blob([res.blob]));
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);

                setFilesLoading(false);
            }
        );
    };

    const onBtnFileClick = () => {
        buttonInputFile.current?.click();
    };

    const onBtnFileConfirm = (e) => {
        handleDrop(null, e.target.files);
    };

    const textCutter = (str) => {
        const maxLength = 7;
        const lastDotIndex = str.lastIndexOf(".");

        if (lastDotIndex > maxLength || lastDotIndex === -1) {
            return str.length > maxLength
                ? str.slice(0, maxLength) + "..."
                : str;
        }

        const namePart = str.slice(0, lastDotIndex);
        const extension = str.slice(lastDotIndex);

        if (namePart.length > maxLength) {
            return namePart.slice(0, maxLength) + "..." + extension;
        }

        return str;
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
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

    const handleDrop = (event = null, f = null) => {
        setFilesLoading(true);
        setIsLoadingAdd(true);

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const files = f ? f : event.dataTransfer.files;

        openNotification(
            "En cours...",
            "L'envoi peut prendre un certain temps.",
            true,
            true,
            false,
            "bottomRight"
        );

        sendFileToStorage(
            gate.user,
            files,
            pathDir,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            if (!res.error) {
                openNotification(
                    "Succès",
                    "Les fichiers ont bien été enregistrés. (si plusieurs fichiers)",
                    true,
                    true,
                    false,
                    "top"
                );
                move(pathDir);
            } else {
                openNotification(
                    "Erreur",
                    "Quelque chose c'est mal passé durant l'enregistrement de votre fichier. Contactez nous si le problème persiste !",
                    true,
                    true,
                    true,
                    "top"
                );
            }

            setIsLoadingAdd(false);
            setInDrag(false);
            setFilesLoading(false);
        });
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setInDrag(true);
    };

    const goDown = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
        });
    };

    const handleInDrag = () => {
        setInDrag(!inDrag);
        goDown();
    };

    const goBack = () => {
        const parts = pathDir.split("/");

        if (parts.length > 1) {
            parts.pop();
        }

        const newUrl = parts.join("/");

        setPathDir(newUrl);
        move(newUrl);
    };

    const move = (targetedDir) => {
        setFilesLoading(true);

        navigation(
            gate.user,
            targetedDir,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            setPathDir(targetedDir);

            if (res.storage.length === 0) {
                setInDrag(true);
            }

            setToShow(res.storage.sort((a, b) => a.type.localeCompare(b.type)));

            setFilesLoading(false);
        });
    };

    const handleCreateDir = () => {
        const nameDir = prompt("Nom du dossier");

        if (nameDir || nameDir.length > 0) {
            setIsLoadingMkdir(true);
            setFilesLoading(true);

            createDir(
                gate.user,
                nameDir,
                pathDir,
                localStorage.getItem("kpture.token")
            ).then((res) => {
                move(pathDir);
                setFilesLoading(false);
                setIsLoadingMkdir(false);
            });
        }
    };

    useEffect(() => {
        setFilesLoading(true);

        if (gate.user) {
            move(targetDir);
            setFilesLoading(false);
        }
    }, [gate]);

    return (
        <Stack className="file-manager-container">
            {contextHolder}
            <Stack className="file-manager-head-container">
                <Typography className="file-manager-paths">
                    {pathDir.slice(2).length > 0 ? pathDir.slice(2) : "Racine"}
                </Typography>

                <Stack className="file-manager-head-actions">
                    <Tooltip title="Revenir en arrière">
                        <Button
                            variant="solid"
                            className="file-manager-head-action"
                            disabled={pathDir === "./"}
                            color="danger"
                            onClick={goBack}
                        >
                            <ArrowBackIcon />
                        </Button>
                    </Tooltip>

                    <Tooltip title="Ajouter un fichier">
                        <Button
                            className="file-manager-head-action"
                            color="success"
                            onClick={handleInDrag}
                        >
                            <AddIcon />
                        </Button>
                    </Tooltip>

                    <Tooltip title="Créer un dossier">
                        <Button
                            className=""
                            loading={isLoadingMkdir}
                            color="primary"
                            onClick={handleCreateDir}
                        >
                            Créer un dossier
                        </Button>
                    </Tooltip>

                    {filesLoading ? (
                        <l-quantum size="25" speed="2" color="white" />
                    ) : null}
                </Stack>
            </Stack>
            <Divider />
            <Stack justifyContent="center" alignItems="center">
                <Stack
                    className="file-manager-explorer"
                    onDragEnter={handleDrag}
                >
                    {Object.keys(toShow).map((v, k) =>
                        toShow[v].type === "dir" ? (
                            <Stack
                                key={k}
                                className="file-manager-entity dir"
                                draggable
                            >
                                <Dropdown>
                                    <MenuButton className="file-manager-entity-more">
                                        <MoreVertIcon />
                                    </MenuButton>

                                    <Menu>
                                        <MenuItem
                                            color="warning"
                                            onClick={() => {
                                                handleRename(
                                                    toShow[v].completePath
                                                );
                                            }}
                                        >
                                            <DriveFileRenameOutlineIcon />
                                            Renommer
                                        </MenuItem>

                                        <MenuItem
                                            color="primary"
                                            onClick={() => {
                                                onZipDownload(
                                                    toShow[v].completePath
                                                );
                                            }}
                                        >
                                            <DownloadIcon />
                                            Télécharger en .zip
                                        </MenuItem>

                                        <MenuItem
                                            color="danger"
                                            onClick={() => {
                                                handleDeleteSomething(
                                                    toShow[v].completePath
                                                );
                                            }}
                                        >
                                            <DeleteIcon />
                                            Supprimer
                                        </MenuItem>
                                    </Menu>
                                </Dropdown>

                                <Tooltip
                                    title={
                                        <Stack>
                                            Chemin ➜ {toShow[v].completePath}{" "}
                                            <br />
                                            Nom ➜ {toShow[v].dirname}
                                        </Stack>
                                    }
                                >
                                    <Stack>
                                        <FolderIcon
                                            onClick={() => {
                                                move(toShow[v].completePath);
                                            }}
                                            className="file-manager-entity-logo"
                                        />
                                        <Typography
                                            onClick={() => {
                                                move(toShow[v].completePath);
                                            }}
                                            className="file-manager-entity-name"
                                        >
                                            {textCutter(toShow[v].dirname)}
                                        </Typography>
                                    </Stack>
                                </Tooltip>
                            </Stack>
                        ) : (
                            <Stack key={k} className="file-manager-entity file">
                                <Dropdown>
                                    <MenuButton className="file-manager-entity-more">
                                        <MoreVertIcon />
                                    </MenuButton>

                                    <Menu className="file-manager-entity-more-actions">
                                        <MenuItem
                                            color="warning"
                                            onClick={() => {
                                                handleRename(
                                                    toShow[v].completePath
                                                );
                                            }}
                                        >
                                            <DriveFileRenameOutlineIcon />
                                            Renommer
                                        </MenuItem>
                                        <MenuItem
                                            color="primary"
                                            onClick={() => {
                                                onFileDownload(
                                                    toShow[v].completePath
                                                );
                                            }}
                                        >
                                            <DownloadIcon />
                                            Télécharger
                                        </MenuItem>
                                        <MenuItem
                                            color="danger"
                                            onClick={() => {
                                                handleDeleteSomething(
                                                    toShow[v].completePath
                                                );
                                            }}
                                        >
                                            <DeleteIcon />
                                            Supprimer
                                        </MenuItem>
                                    </Menu>
                                </Dropdown>

                                <Tooltip
                                    title={
                                        <Stack>
                                            Chemin ➜ {toShow[v].completePath}{" "}
                                            <br />
                                            Nom ➜ {toShow[v].filename}
                                            <br />
                                            Extension ➜{" "}
                                            {toShow[v].filename.split(".")
                                                .length <= 1
                                                ? "Pas d'extension"
                                                : toShow[v].filename
                                                      .split(".")
                                                      .pop()
                                                      .toUpperCase()}
                                            <br />
                                            Taille ➜ {toShow[v].size}
                                            <br />
                                        </Stack>
                                    }
                                >
                                    <Stack>
                                        <InsertDriveFileIcon className="file-manager-entity-logo" />
                                        <Typography className="file-manager-entity-name">
                                            {textCutter(toShow[v].filename)}
                                        </Typography>
                                    </Stack>
                                </Tooltip>
                            </Stack>
                        )
                    )}
                </Stack>
            </Stack>

            {inDrag ? (
                <Stack>
                    <Divider />

                    <Stack
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="dragzone"
                    >
                        <InsertDriveFileIcon />

                        <Typography className="dragzone-txt">
                            Déposez votre fichier ici
                        </Typography>
                        <Typography className="dragzone-txt">ou</Typography>
                        <Button onClick={onBtnFileClick} loading={isLoadingAdd}>
                            <input
                                onChange={onBtnFileConfirm}
                                ref={buttonInputFile}
                                type="file"
                                style={{ display: "none" }}
                                multiple="multiple"
                            />
                            Importez le ici
                        </Button>
                    </Stack>
                </Stack>
            ) : null}
        </Stack>
    );
}
