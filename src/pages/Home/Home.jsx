import {
    Stack,
    Typography,
    Divider,
    Tooltip,
    FormLabel,
    Modal,
    ModalDialog,
    DialogTitle,
    DialogContent,
    FormControl,
    Input,
    Badge,
    Button,
    Chip,
} from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import { notification } from "antd";
import "./Home.scss";
import "../../index.scss";
import { useGate } from "../../hooks/useGate";
import { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import DisplayableAdd from "../../components/DisplayableAdd/DisplayableAdd";
import Displayable from "../../components/Displayable/Displayable";
import {
    addWebsiteFavorite,
    retreiveWebsiteFav,
    deleteWebsiteFav,
} from "../../services/Webfav";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Home() {
    const gate = useGate();
    const [wf_loading, setWFLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [inModal, setInModal] = useState(false);
    const [wf_name, setWFName] = useState("");
    const [wf_url, setWFUrl] = useState("");
    const [wf_img, setWFImg] = useState("");
    const [wf_list, setWFList] = useState([]);
    const [inSuppressingWf, setInSupressingWf] = useState(false);
    const [apiNotif, contextHolder] = notification.useNotification();

    const handleDeleteWebsiteFav = (url) => {
        setWFLoading(true);

        deleteWebsiteFav(
            gate.user,
            url,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            if (res.error) {
                openNotification(
                    "Erreur",
                    "Impossible de supprimer le site de vos favoris pour le moment ! Tentez plus tard.",
                    true,
                    true,
                    true,
                    "top"
                );
            } else {
                retreiveWebsiteFav(
                    gate.user,
                    localStorage.getItem("kpture.token")
                ).then((res) => {
                    setWFList(res.website_fav);
                    setWFLoading(false);
                });
            }
        });
    };

    const handleSupressingWf = () => {
        setInSupressingWf(!inSuppressingWf);
    };

    const handleWFName = (e) => {
        setWFName(e.target.value);
    };

    const handleWFImg = (e) => {
        setWFImg(e.target.value);
    };

    const handleWFUrl = (e) => {
        setWFUrl(e.target.value);
    };

    const handleSendWf = (e) => {
        e.preventDefault();
        setSending(true);

        addWebsiteFavorite(
            gate.user,
            wf_url,
            wf_name,
            wf_img,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            if (!res.error) {
                openNotification(
                    "Succès",
                    "Enregistrement effectué !",
                    true,
                    true
                );
            } else {
                openNotification(
                    "Problème",
                    "Impossible d'enregistrer un site dans vos favoris pour le moment ! Tentez plus tard.",
                    true,
                    true,
                    true
                );
            }

            setWFList([
                ...wf_list,
                { url: wf_url, name: wf_name, image_url: wf_img },
            ]);
            setSending(false);
            setInModal(false);
        });
    };

    const handleModal = () => {
        setInModal(!inModal);
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

    useEffect(() => {
        setWFLoading(true);

        if (gate.user) {
            retreiveWebsiteFav(
                gate.user,
                localStorage.getItem("kpture.token")
            ).then((res) => {
                setWFList(res.website_fav);
                setWFLoading(false);
            });
        }
    }, [gate]);

    return (
        <MainLayout>
            {contextHolder}
            <Modal open={inModal}>
                <ModalDialog>
                    <DialogTitle>Ajouter un site dans vos favoris</DialogTitle>

                    <DialogContent>
                        <form onSubmit={handleSendWf} id="wf-form">
                            <Stack id="wf-form-ipts">
                                <FormControl>
                                    <FormLabel>Nom du site</FormLabel>
                                    <Input
                                        required
                                        onChange={handleWFName}
                                        placeholder="Ex: Google"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>URL du site</FormLabel>
                                    <Input
                                        required
                                        onChange={handleWFUrl}
                                        placeholder="Ex: https://google.com"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>
                                        Image de présentation (png, svg, gif,
                                        jpg, etc...)
                                    </FormLabel>
                                    <Input
                                        onChange={handleWFImg}
                                        placeholder="Ex: https://f.hellowork.com/blogdumoderateur/2015/09/logo-google-gif.gif"
                                    />
                                </FormControl>
                            </Stack>

                            <Stack id="wf-form-actions">
                                <Button type="submit" loading={sending}>
                                    Créer
                                </Button>
                                <Button onClick={handleModal} color="danger">
                                    Annuler
                                </Button>
                            </Stack>
                        </form>
                    </DialogContent>
                </ModalDialog>
            </Modal>

            <Stack id="home-container">
                <Stack id="home-categories">
                    <Typography
                        className=""
                        id="home-categories-title"
                        level="h3"
                    >
                        <span className="poppins-medium-italic">
                            Applications{" "}
                            <Chip variant="solid">par Kontrol</Chip>
                        </span>
                    </Typography>

                    <Stack id="home-categories-list">
                        {gate.level === 0 ? (
                            <Displayable
                                id="domain-gestion"
                                className="home-cat"
                                link={"/kptureadmin"}
                                text={"Gestion du Domaine"}
                                tooltip="Gérer votre domaine"
                                openInAnotherWindow={false}
                            />
                        ) : null}

                        <Displayable
                            id="files"
                            className="home-cat"
                            link={"/storage"}
                            text={"STOCKAGE"}
                            tooltip="Stockage"
                            openInAnotherWindow={false}
                        />

                        <Displayable
                            id="galerie"
                            className="home-cat"
                            link={"/galery"}
                            text={"GALERIE"}
                            tooltip="Galerie"
                            openInAnotherWindow={false}
                        />

                        <Displayable
                            id="messagerie"
                            link={"/chat"}
                            text={"CHAT"}
                            tooltip="Chat 100% sécurisé"
                            openInAnotherWindow={false}
                        />

                        <Displayable
                            id="notes"
                            link={"/notes"}
                            text={"NOTES"}
                            tooltip="Notes"
                            openInAnotherWindow={false}
                        />

                        <Displayable
                            id="calendar"
                            link={"/calendar"}
                            text={"CALENDRIER"}
                            tooltip="Calendrier"
                            openInAnotherWindow={false}
                        />
                    </Stack>
                </Stack>

                <Divider />

                <Stack id="home-webfav">
                    <Stack id="home-webfave-headers">
                        <Typography
                            className="poppins-medium-italic"
                            id="home-webfav-title"
                            level="h3"
                        >
                            <span className="poppins-medium-italic">
                                Sites favoris
                            </span>
                        </Typography>

                        <Button
                            id="home-webfav-modif-btn"
                            color={inSuppressingWf ? "danger" : "neutral"}
                            variant="solid"
                            onClick={handleSupressingWf}
                        >
                            {inSuppressingWf ? <ArrowBackIcon /> : <TuneIcon />}
                        </Button>

                        {wf_loading ? (
                            <l-quantum size="25" speed="2" color="white" />
                        ) : null}
                    </Stack>

                    <Stack id="home-webfav-list">
                        {inSuppressingWf ? (
                            <DisplayableAdd
                                id="messagerie"
                                handler={handleModal}
                                tooltip="Ajouter un site"
                            />
                        ) : null}

                        {Object.keys(wf_list).map((v, k) => (
                            <Stack className="home-webfav-displayable" key={k}>
                                {inSuppressingWf ? (
                                    <Stack className="home-webfav-displayable-btns">
                                        <Button
                                            className="home-webfav-displayable-btn"
                                            color="danger"
                                            size="sm"
                                            onClick={() => {
                                                handleDeleteWebsiteFav(
                                                    wf_list[v].url
                                                );
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </Button>
                                    </Stack>
                                ) : null}

                                <Displayable
                                    key={k}
                                    img={
                                        wf_list[v].image_url.trim().length > 0
                                            ? wf_list[v].image_url
                                            : "https://cdn.dribbble.com/users/1908366/screenshots/4461835/14.gif"
                                    }
                                    link={wf_list[v].url}
                                    text={wf_list[v].name}
                                    tooltip={wf_list[v].name}
                                />
                            </Stack>
                        ))}
                    </Stack>
                </Stack>

                <Divider />

                <Stack id="home-tools">
                    <Typography
                        className="poppins-medium-italic"
                        id="home-tools-title"
                        level="h3"
                    >
                        <span className="poppins-medium-italic">
                            Outils pratiques{" "}
                            <Chip variant="solid">Non sponsorisé</Chip>
                        </span>
                    </Typography>

                    <Stack id="home-tools-list">
                        <Displayable
                            id="montage"
                            link="https://www.canva.com/"
                            text="MONTAGE PHOTO"
                            tooltip="Montage Photo avec Canva"
                        />

                        <Displayable
                            id="gen_ia"
                            link="https://chatgpt.com/"
                            text="IA GEN 1"
                            tooltip="IA Généraliste : ChatGPT"
                        />

                        <Displayable
                            id="gen_ia2"
                            link="https://gemini.google.com/"
                            text="IA GEN 2"
                            tooltip="IA Généraliste : Gemini"
                        />

                        <Displayable
                            id="photo_ia"
                            link="https://www.craiyon.com"
                            text="IA IMAGE"
                            tooltip="Génération d'image par IA : Craiyon"
                        />

                        <Displayable
                            id="translate"
                            link="https://deepl.com/"
                            text="TRADUCTION"
                            tooltip="Traduction de texte : Deepl"
                        />

                        <Displayable
                            id="convert"
                            link="https://www.online-convert.com/fr"
                            text="CONVERSION DE FICHIER"
                            tooltip="Conversion de fichier. Ex : Je veux convertir mon fichier audio .mp3 en .wav"
                        />

                        <Displayable
                            id="pdf_mod"
                            link="https://www.ilovepdf.com/fr"
                            text="OUTILS PDF"
                            tooltip="Outils pratique pour les fichiers PDF"
                        />

                        <Displayable
                            id="img_mod"
                            link="https://www.iloveimg.com/fr"
                            text="OUTILS IMAGE"
                            tooltip="Outils pratique pour les images"
                        />

                        <Displayable
                            id="grosfichiers"
                            link="https://www.grosfichiers.com/"
                            text="TRANSFERT DE FICHIER"
                            tooltip="Transferez jusqu'a 10go"
                        />
                    </Stack>
                </Stack>
            </Stack>
        </MainLayout>
    );
}
