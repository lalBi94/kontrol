import "./Notes.scss";
import {
    Box,
    Stack,
    Button,
    Divider,
    Typography,
    Input,
    Modal,
    ModalDialog,
} from "@mui/joy";
import ReactQuill from "react-quill";
import MainLayout from "../../layout/MainLayout";
import "react-quill/dist/quill.snow.css";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
    getAllNotesOf,
    getNoteData,
    sendNote,
    deleteNote,
    updateNote,
} from "../../services/NWrite";
import { useGate } from "../../hooks/useGate";
import { useEffect, useState } from "react";
import Displayable from "../../components/Displayable/Displayable";
import moment from "moment";
import Graph from "./../../components/Graph/Graph";

export default function Notes() {
    const gate = useGate();
    const [isNoteSelected, setIsNoteSelected] = useState(false);
    const [value, setValue] = useState("");
    const [inModalMind, setInModalMind] = useState(false);
    const [currentTitleNote, setCurrentTitleNote] = useState("");
    const [dataForSecondMind, setDataForSecondMind] = useState(null);
    const [currentKeywords, setCurrentkeywords] = useState("");
    const [currentTimestampNote, setCurrentTimestampNote] = useState(
        moment().valueOf()
    );
    const [notesList, setNotesList] = useState([]);

    const handleDeleteNote = (title) => {
        deleteNote(gate.user, title, localStorage.getItem("kpture.token")).then(
            (res) => {
                if (!res.error) {
                    handleNewNote();
                    getNotes();
                }
            }
        );
    };

    const handleNewNote = () => {
        setIsNoteSelected(false);
        setCurrentTimestampNote(moment().valueOf());
        setCurrentTitleNote("");
        setCurrentkeywords("");
        setValue("");
    };

    const handleSelectNote = (title) => {
        getNoteData(
            gate.user,
            title,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            const parts = res.content.title.split("-");

            setCurrentTitleNote(parts[0]);
            setCurrentTimestampNote(parts[1]);
            setValue(res.content.content);
            setCurrentkeywords(parts.slice(2, parts.length).join(","));
            setIsNoteSelected(true);
        });
    };

    const handleSendNotes = () => {
        const format = currentKeywords.trim();
        const keywords = format.split(",").filter((e) => e.length > 0);

        sendNote(
            currentTitleNote,
            value,
            gate.user,
            JSON.stringify(keywords),
            localStorage.getItem("kpture.token")
        ).then((res) => {
            getNotes();
            handleSelectNote(res.title);
        });
    };

    const prepareDataForGraph = (data) => {
        const nodes = data.map((item, index) => ({
            id: index,
            title: item.title,
            keywords: item.keywords,
        }));

        const links = [];
        nodes.forEach((source, sourceIndex) => {
            nodes.forEach((target, targetIndex) => {
                if (sourceIndex !== targetIndex) {
                    const commonKeywords = source.keywords.filter((keyword) =>
                        target.keywords.includes(keyword)
                    );
                    if (commonKeywords.length > 0) {
                        links.push({
                            source: sourceIndex,
                            target: targetIndex,
                            value: commonKeywords.length,
                        });
                    }
                }
            });
        });

        return { nodes, links };
    };

    const getNotes = () => {
        getAllNotesOf(gate.user, localStorage.getItem("kpture.token")).then(
            (res) => {
                if (!res.error) {
                    const feedSecondMind = res.title_list.map((fileName) => {
                        const parts = fileName.split("-");
                        const title = parts[0];
                        const timestamp = parseInt(parts[1], 10);
                        const keywords = parts.slice(2, parts.length);

                        console.log(keywords);

                        return { title, timestamp, keywords: keywords };
                    });

                    setDataForSecondMind(prepareDataForGraph(feedSecondMind));

                    console.log(prepareDataForGraph(feedSecondMind));

                    const notesArray = res.title_list
                        .map((fileName) => {
                            const parts = fileName.split("-");
                            const title = parts[0];
                            const timestamp = parseInt(parts[1], 10);

                            return { title, timestamp };
                        })
                        .sort((a, b) => b.timestamp - a.timestamp);

                    setNotesList(notesArray);
                }
            }
        );
    };

    const handleUpKeyword = (e) => {
        setCurrentkeywords(e.target.value);
    };

    const handleUpdateNote = () => {
        const filename = `${currentTitleNote}-${currentTimestampNote}-`;
        const newName = `${filename}${currentKeywords
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e.length > 0)
            .join("-")}`;

        updateNote(
            filename,
            value,
            gate.user,
            newName,
            localStorage.getItem("kpture.token")
        ).then((res) => {
            if (!res.error) {
                console.log(newName);
                handleSelectNote(newName);
                getNotes();
            }
        });
    };

    const handleUpTitle = (e) => {
        if (e.target.value.length <= 30) {
            setCurrentTitleNote(e.target.value);
        }
    };

    const modules = {
        toolbar: [
            [{ font: [] }], // Font selector
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ size: [] }], // Text size selector
            ["bold", "italic", "underline", "strike"], // Text formats
            [{ color: [] }, { background: [] }], // Text and background colors
            [{ script: "sub" }, { script: "super" }], // Subscript / Superscript
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }], // Indentation
            ["link", "image", "video"], // Links, images, videos
            ["code-block"], // Code block
            ["clean"], // Remove formatting
        ],
    };

    const formats = [
        "font",
        "header",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "color",
        "background",
        "script",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
        "video",
        "code-block",
    ];

    useEffect(() => {
        if (gate.user) {
            getNotes();
        }
    }, [gate]);

    const handleCloseModal = () => {
        setInModalMind(false);
    };

    const handleOpenModal = () => {
        setInModalMind(true);
    };

    return (
        <MainLayout>
            <Modal id="modal-mind" open={inModalMind}>
                <ModalDialog layout="center">
                    <Button
                        onClick={handleCloseModal}
                        id="modal-close"
                        color="danger"
                    >
                        <CloseOutlinedIcon />
                    </Button>

                    {dataForSecondMind ? (
                        <Graph
                            links={dataForSecondMind.links}
                            nodes={dataForSecondMind.nodes}
                        />
                    ) : null}
                </ModalDialog>
            </Modal>

            <Box id="notes-container">
                <Stack id="notes-history">
                    <Box id="notes-actions">
                        <Button
                            color="success"
                            className="notes-actions-btn"
                            onClick={handleNewNote}
                        >
                            Ajouter une note
                        </Button>

                        <Button
                            className="notes-actions-btn"
                            onClick={handleOpenModal}
                            variant="soft"
                        >
                            Visualiser votre mémoire
                        </Button>
                    </Box>

                    <Divider />

                    <Stack id="notes-history-notes">
                        {notesList.length > 0
                            ? notesList.map((note, index) => (
                                  <Displayable
                                      handler={() => {
                                          handleSelectNote(
                                              `${note.title}-${note.timestamp}-`
                                          );
                                      }}
                                      tooltip={`"${note.title}" du ${moment(
                                          note.timestamp
                                      ).format("DD/MM/YYYY à HH:mm")}`}
                                      key={index}
                                      text={note.title}
                                      id="universal-notes-img"
                                  />
                              ))
                            : null}
                    </Stack>
                </Stack>

                <Divider orientation="vertical" />

                <Stack id="note-view">
                    <Box id="note-view-actions">
                        <Box id="note-view-actions-ipt">
                            <Typography style={{ color: "white" }} level="h4">
                                Nom de la note{" "}
                                {!isNoteSelected
                                    ? `(${currentTitleNote.length} sur 30
                                caractères)`
                                    : ``}
                            </Typography>

                            <Input
                                value={currentTitleNote}
                                onChange={handleUpTitle}
                                placeholder="Ex: Rêve de cette nuit"
                                disabled={isNoteSelected}
                            />

                            <Typography style={{ color: "white" }} level="h4">
                                Mots-clés (
                                {currentKeywords.trim().split(",").length} sur 4
                                mots
                                {currentKeywords.trim().split(",").length >
                                4 ? (
                                    <Typography color="danger">
                                        {" "}
                                        DECONSEILLÉ !!
                                    </Typography>
                                ) : (
                                    ""
                                )}
                                )
                            </Typography>

                            <Input
                                value={currentKeywords}
                                onChange={handleUpKeyword}
                                placeholder="Saisir les mots-clés, séparés par des virgules (ex: réussite, rêve)"
                            />
                        </Box>

                        <Stack id="note-view-actions-btns">
                            {isNoteSelected ? (
                                <Button
                                    className="note-view-actions-btn"
                                    onClick={handleUpdateNote}
                                >
                                    Modifier
                                </Button>
                            ) : (
                                <Button
                                    color="success"
                                    className="note-view-actions-btn"
                                    onClick={handleSendNotes}
                                >
                                    Enregistrer
                                </Button>
                            )}

                            {isNoteSelected ? (
                                <Button
                                    onClick={() => {
                                        handleDeleteNote(
                                            `${currentTitleNote}-${currentTimestampNote}-`
                                        );
                                    }}
                                    color="danger"
                                >
                                    Supprimer
                                </Button>
                            ) : null}
                        </Stack>
                    </Box>

                    <ReactQuill
                        id="note-editor"
                        modules={modules}
                        formats={formats}
                        theme="snow"
                        placeholder="Écris ici..."
                        value={value}
                        onChange={setValue}
                    />
                </Stack>
            </Box>
        </MainLayout>
    );
}
