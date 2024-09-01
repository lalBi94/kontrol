import {
    Divider,
    Stack,
    Typography,
    Chip,
    Checkbox,
    Box,
    FormLabel,
    Modal,
    Alert,
    ModalDialog,
    AspectRatio,
    DialogContent,
    FormControl,
    Input,
    Button,
} from "@mui/joy";
import ClearIcon from "@mui/icons-material/Clear";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import "./Galery.scss";
import { notification } from "antd";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
    massiveDelete,
    retreiveZip,
    sendFileToGalery,
    createAlbum,
    getAlbums,
    getFile,
    getFilesOf,
    getTotalFilesCount,
    deleteAlbum,
} from "../../services/Photomaton";
import MainLayout from "../../layout/MainLayout";
import { useState, useEffect, useRef } from "react";
import { useGate } from "../../hooks/useGate";
import DisplayableAdd from "./../../components/DisplayableAdd/DisplayableAdd";
import Displayable from "../../components/Displayable/Displayable";
import { quantum } from "ldrs";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { useParams } from "react-router-dom";

quantum.register();

const Cadre = motion(Stack);

const container = {
    hidden: { opacity: 1, scale: 0 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            delayChildren: 0.2,
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
    },
};

export default function Galery() {
    const gate = useGate();
    const [currentAlbum, setCurrentAlbum] = useState(null);
    const [currentAlbumLoading, setCurrentAlbumLoading] = useState(true);
    const [currentTitleAlbum, setCurrentAlbumTitle] = useState("");
    const [galery, setGalery] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inModal, setInModal] = useState(false);
    const [albumName, setAlbumName] = useState("");
    const [apiNotif, contextHolder] = notification.useNotification();
    const buttonInputFile = useRef(null);
    const [supressList, setSupressList] = useState([]);
    const [inConsulting, setInConsulting] = useState(false);
    const [toConsult, setToConsult] = useState(null);
    const [checkedItems, setCheckedItems] = useState([]);
    const [albumSize, setAlbumSize] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(1);
    const [reachedLimit, setReachedLimit] = useState(false);
    const [isLoadingAdding, setLoadingAdding] = useState(false);
    const [isLoadingMassiveDelete, setLoadingMassiveDelete] = useState(false);
    const [isLoadingDeleteAlbum, setLoadingDeleteAlbum] = useState(false);
    const [isLoadingZip, setLoadingZip] = useState(false);
    const [isLoadingMove, setLoadingMove] = useState(false);
    const params = useParams();

    const handleConsultImg = (link) => {
        setInConsulting(true);
        setToConsult(link);
    };

    const handleDelete = () => {
        setLoadingMassiveDelete(true);
        massiveDelete(
            gate.user,
            JSON.stringify(supressList),
            currentTitleAlbum,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            if (!res.error) {
                setCurrentAlbum(
                    currentAlbum.filter(
                        (e) => !supressList.includes(e.filename)
                    )
                );

                setSupressList([]);
                setCheckedItems([]);

                refreshSelectionPreview();
                openNotification(
                    "Success",
                    "Image(s)/Vidéo(s) supprimée(s) avec succès !",
                    true,
                    true,
                    false,
                    "top"
                );
            } else {
                openNotification(
                    "Erreur",
                    "Une erreur est survenue lors de la suppression des images/vidéos.",
                    true,
                    true,
                    true,
                    "top"
                );
            }

            setLoadingMassiveDelete(false);
        });
    };

    const handleDelAlbum = () => {
        setLoadingDeleteAlbum(true);
        deleteAlbum(
            gate.user,
            currentTitleAlbum,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            setCurrentAlbum(null);
            refreshSelectionPreview();
            setLoadingDeleteAlbum(false);
        });
    };

    const handleConsultClose = () => {
        setInConsulting(false);
        setToConsult(null);
    };

    const onBtnFileClick = () => {
        buttonInputFile.current?.click();
    };

    const handleAddToSupress = (file) => {
        if (supressList.includes(file)) {
            setSupressList(supressList.filter((item) => item !== file));
            setCheckedItems(checkedItems.filter((item) => item !== file));
        } else {
            setSupressList([...supressList, file]);
            setCheckedItems([...checkedItems, file]);
        }
    };

    const onZipDownload = (album) => {
        setIsLoading(true);
        setLoadingZip(true);

        openNotification(
            "En cours...",
            "La compression peut durer un certain temps.",
            true,
            true,
            false,
            "bottomRight"
        );

        retreiveZip(
            gate.user,
            album,
            localStorage.getItem("kpture.token")
        ).then((res) => {
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

            setLoadingZip(false);
            setIsLoading(false);
        });
    };

    const handleSelectAlbum = (album, page, refreshSize = false) => {
        setIsLoading(true);
        setCurrentAlbumLoading(true);
        setCurrentIndex(page);
        setReachedLimit(false);
        setLoadingMove(true);

        if (refreshSize) {
            getTotalFilesCount(
                gate.user,
                album,
                localStorage.getItem("kpture.token")
            ).then((res) => {
                if (!res.error) {
                    setAlbumSize(res.totalFiles);
                }
            });
        }

        getFilesOf(
            gate.user,
            album,
            page,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            if (res.isEnd) {
                setReachedLimit(true);
            }

            if (!res.error) {
                setSupressList([]);
                setCurrentAlbum(res.files);
                setCurrentAlbumTitle(album);
                setCheckedItems([]);

                localStorage.setItem("kpture.last_albm", album);
            }

            setCurrentAlbumLoading(false);
            setLoadingMove(false);
            setIsLoading(false);
        });
    };

    const handleModal = () => {
        setInModal(!inModal);
    };

    const handleAlbumName = (e) => {
        setAlbumName(e.target.value);
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

    const handleNext = () => {
        handleSelectAlbum(currentTitleAlbum, currentIndex + 1);
    };

    const handleBack = () => {
        if (currentIndex >= 2) {
            handleSelectAlbum(currentTitleAlbum, currentIndex - 1);
        }
    };

    const handleCreateAlbum = (e) => {
        e.preventDefault();
        setIsLoading(true);

        createAlbum(
            gate.user,
            albumName,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            if (res.error) {
                openNotification(
                    "Erreur",
                    "Le nom existe deja !",
                    true,
                    true,
                    true,
                    "top"
                );
            } else {
                handleModal();
            }

            refreshSelectionPreview();
            setIsLoading(false);
        });
    };

    const refreshSelectionPreview = async () => {
        setIsLoading(true);
        const alb = await getAlbums(
            gate.user,
            localStorage.getItem("kpture.token")
        );

        if (!alb.error) {
            for (let e of alb.albums) {
                if (e.presentation) {
                    try {
                        const query = await getFile(
                            gate.user,
                            e.dirname,
                            e.presentation,
                            localStorage.getItem("kpture.token")
                        );

                        if (query && query.b64 && query.type) {
                            if (!e.files) {
                                e.file = { b64: query.b64, type: query.type };
                            }
                        } else {
                            console.error(
                                "Erreur : les données retournées par getFile sont invalides",
                                query
                            );
                        }
                    } catch (error) {
                        console.error(
                            "Erreur lors de la récupération du fichier",
                            error
                        );
                    }
                }
            }

            setGalery(alb.albums);
            setIsLoading(false);
        }
    };

    const handleSendFiles = (e) => {
        setIsLoading(true);
        setLoadingAdding(true);
        e.preventDefault();

        const files = e.target.files;

        openNotification(
            "En cours...",
            "L'envoi peut prendre un certain temps.",
            true,
            true,
            false,
            "bottomRight"
        );

        sendFileToGalery(
            gate.user,
            files,
            currentTitleAlbum,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            if (res.error) {
                openNotification(
                    "Erreur",
                    "Une erreur est survenue lors de l'envoi des fichiers.",
                    true,
                    true,
                    true,
                    "top"
                );
            } else {
                openNotification(
                    "Success",
                    "Les fichiers ont été envoyées avec succès.",
                    true,
                    true,
                    false,
                    "top"
                );

                refreshSelectionPreview();
            }

            handleSelectAlbum(
                currentTitleAlbum,
                currentIndex,
                localStorage.getItem("kpture.token")
            );

            setLoadingAdding(false);
        });
    };

    useEffect(() => {
        if (gate.user) {
            refreshSelectionPreview();

            const last_album = localStorage.getItem("kpture.last_albm");

            if (params.album) {
                handleSelectAlbum(params.album, 1, true);
            } else if (last_album) {
                handleSelectAlbum(last_album, 1, true);
            }
        }
    }, [gate]);

    return (
        <MainLayout>
            {contextHolder}

            <Modal open={inConsulting}>
                <ModalDialog layout="center" id="modal-consult">
                    <Button
                        onClick={handleConsultClose}
                        id="btn-consult"
                        color="danger"
                    >
                        <CloseOutlinedIcon />
                    </Button>

                    <img
                        id="img-consult"
                        loading="lazy"
                        src={toConsult}
                        alt=""
                    />
                </ModalDialog>
            </Modal>

            <Modal open={inModal}>
                <ModalDialog>
                    <DialogContent>
                        <form onSubmit={handleCreateAlbum} id="wf-form">
                            <Stack id="wf-form-ipts">
                                <FormControl>
                                    <FormLabel>Nom de l'album</FormLabel>
                                    <Input
                                        required
                                        onChange={handleAlbumName}
                                        placeholder="Ex: Famille, Évenement, ..."
                                    />
                                </FormControl>
                            </Stack>

                            <Stack id="wf-form-actions">
                                <Button type="submit">Créer l'album</Button>
                                <Button onClick={handleModal} color="danger">
                                    Annuler
                                </Button>
                            </Stack>
                        </form>
                    </DialogContent>
                </ModalDialog>
            </Modal>

            <Stack id="galery-container">
                <Stack id="warning-alert">
                    <Alert color="warning" id="alert">
                        <WarningAmberIcon /> Il est actuellement impossible de
                        déposer de gros fichiers. Par conséquent, nous vous
                        prions de ne pas stocker de films.
                    </Alert>
                </Stack>
                <Typography className="" id="galery-title" level="h3">
                    <span className="poppins-medium-italic">
                        Vos Albums <Chip variant="solid">{galery.length}</Chip>
                    </span>

                    {isLoading ? (
                        <l-quantum size="25" speed="2" color="white" />
                    ) : null}
                </Typography>

                <Stack id="galery-selection">
                    <DisplayableAdd handler={handleModal} />

                    <Divider orientation="vertical" />

                    {galery
                        ? galery.map((v, k) => (
                              <Displayable
                                  className={!v.file ? "empty-img" : ""}
                                  key={k}
                                  openInAnotherWindow={false}
                                  handler={() => {
                                      handleSelectAlbum(v.dirname, 1, true);
                                  }}
                                  tooltip={v.dirname}
                                  text={v.dirname}
                                  img={
                                      v.file
                                          ? `data:${v.file.type};base64,${v.file.b64}`
                                          : null
                                  }
                              />
                          ))
                        : null}
                </Stack>
                <Divider orientation="horizontal" />
                {currentAlbum ? (
                    <Stack id="album-selected-general">
                        <Stack id="album-headers">
                            <Typography id="album-selected-title" level="h3">
                                <span
                                    id="album-chip-text"
                                    className="poppins-medium-italic"
                                >
                                    {currentTitleAlbum}{" "}
                                </span>
                            </Typography>

                            <Box id="album-chips">
                                <Chip className="album-chip" variant="solid">
                                    Page {currentIndex}
                                </Chip>
                                <Chip className="album-chip" variant="solid">
                                    {albumSize} images
                                </Chip>
                            </Box>

                            <Stack id="album-actions">
                                <Button
                                    color="success"
                                    onClick={onBtnFileClick}
                                    loading={isLoadingAdding}
                                >
                                    <input
                                        onChange={handleSendFiles}
                                        ref={buttonInputFile}
                                        type="file"
                                        accept=".png,.jpeg,.jpg,.gif,.bmp,.tiff,.webp,.mp4,.webm,.flv,.ogg,.avi,.mpeg,.mkv"
                                        style={{ display: "none" }}
                                        multiple="multiple"
                                    />
                                    Ajouter une image / vidéo
                                </Button>

                                {currentAlbum.length > 0 ? (
                                    <Button
                                        onClick={() => {
                                            onZipDownload(currentTitleAlbum);
                                        }}
                                        variant="solid"
                                        className="actions"
                                        loading={isLoadingZip}
                                    >
                                        Tout télécharger en .zip
                                    </Button>
                                ) : null}

                                <Button
                                    color="danger"
                                    loading={isLoadingDeleteAlbum}
                                    onClick={handleDelAlbum}
                                >
                                    Supprimer l'album
                                </Button>

                                {supressList.length > 0 ? (
                                    <Button
                                        onClick={handleDelete}
                                        color="danger"
                                        variant="solid"
                                        className="actions"
                                        handleDelete
                                        loading={isLoadingMassiveDelete}
                                    >
                                        Tout supprimer ({supressList.length})
                                    </Button>
                                ) : null}

                                <Button
                                    disabled={
                                        currentIndex === 1 || isLoadingMove
                                    }
                                    color="neutral"
                                    onClick={handleBack}
                                >
                                    <ArrowBackIosNewIcon fontSize="small" />
                                </Button>

                                <Button
                                    disabled={reachedLimit || isLoadingMove}
                                    color="neutral"
                                    onClick={handleNext}
                                >
                                    <ArrowForwardIosIcon fontSize="small" />
                                </Button>
                            </Stack>
                        </Stack>

                        {currentAlbum.length > 0 ? (
                            <Cadre
                                variants={container}
                                initial="hidden"
                                animate="visible"
                                id="album-selected-container"
                            >
                                {currentAlbum.map((v, k) => (
                                    <LazyMotion features={domAnimation}>
                                        <Cadre variants={item} key={k}>
                                            <Checkbox
                                                checked={checkedItems.includes(
                                                    v.filename
                                                )}
                                                variant="outlined"
                                                className="checkbox-del"
                                                color="danger"
                                                onChange={() => {
                                                    handleAddToSupress(
                                                        v.filename
                                                    );
                                                }}
                                                checkedIcon={<ClearIcon />}
                                            />

                                            <AspectRatio
                                                variant="none"
                                                ratio="3/2"
                                                className={`album-selected-ratio-files ${
                                                    v.type.split("/")[0]
                                                }`}
                                            >
                                                {v.type.split("/")[0] ===
                                                "video" ? (
                                                    <video
                                                        loading="lazy"
                                                        controls
                                                        className="album-selected-files"
                                                        src={`data:${v.type};base64,${v.b64}`}
                                                    />
                                                ) : (
                                                    <img
                                                        loading="lazy"
                                                        onClick={() => {
                                                            handleConsultImg(
                                                                `data:${v.type};base64,${v.b64}`
                                                            );
                                                        }}
                                                        className="album-selected-files"
                                                        src={`data:${v.type};base64,${v.b64}`}
                                                    />
                                                )}
                                            </AspectRatio>
                                        </Cadre>
                                    </LazyMotion>
                                ))}
                            </Cadre>
                        ) : (
                            <Stack id="empty-album-container">
                                <Typography level="h3" className="empty-album">
                                    L'album est vide !
                                </Typography>
                            </Stack>
                        )}

                        {currentAlbum ? (
                            <Box id="galery-navigator">
                                <Button
                                    disabled={
                                        currentIndex === 1 || isLoadingMove
                                    }
                                    color="neutral"
                                    onClick={handleBack}
                                >
                                    <ArrowBackIosNewIcon fontSize="small" />
                                </Button>

                                <Button
                                    disabled={reachedLimit || isLoadingMove}
                                    color="neutral"
                                    onClick={handleNext}
                                >
                                    <ArrowForwardIosIcon fontSize="small" />
                                </Button>
                            </Box>
                        ) : null}
                    </Stack>
                ) : (
                    <Stack id="no-album-container">
                        <Typography level="h3" className="no-album-title">
                            Aucun album sélectionné
                        </Typography>
                    </Stack>
                )}
            </Stack>
        </MainLayout>
    );
}
