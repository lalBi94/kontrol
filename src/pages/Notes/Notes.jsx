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
import SearchIcon from "@mui/icons-material/Search";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import StyleIcon from "@mui/icons-material/Style";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
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
    const [currentSearch, setCurrentSearch] = useState("");
    const [stockOfCurrentSearch, setStockOfCurrentSearch] = useState(null);

    const handleSearch = (e) => {
        const searchVal = e.target.value.toLowerCase();

        setCurrentSearch(searchVal);

        const searchingTitle = notesList.filter((note) =>
            note.title.toLowerCase().includes(searchVal)
        );

        const titleSet = new Set(searchingTitle.map((note) => note.title));

        const searchingKeywords = notesList
            .filter((note) =>
                note.keywords.some((key) =>
                    key.toLowerCase().includes(searchVal)
                )
            )
            .filter((note) => !titleSet.has(note.title));

        const finalResults = [...searchingTitle, ...searchingKeywords];

        console.log(finalResults);
        setStockOfCurrentSearch(finalResults);
    };

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
            timestamp: parseInt(item.timestamp, 10),
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

                        return { title, timestamp, keywords: keywords };
                    });

                    setDataForSecondMind(prepareDataForGraph(feedSecondMind));

                    const notesArray = res.title_list
                        .map((fileName) => {
                            const parts = fileName.split("-");
                            const title = parts[0];
                            const timestamp = parseInt(parts[1], 10);
                            const keywords = parts.slice(2, parts.length);

                            return { title, timestamp, keywords };
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
            [{ font: [] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ size: [] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ script: "sub" }, { script: "super" }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            ["link", "image", "video"],
            ["code-block"],
            ["clean"],
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

    const handleLeaveToNote = (note) => {
        handleSelectNote(note);
        handleCloseModal();
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
                            leave={handleLeaveToNote}
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

                    <Stack id="notes-history-notes-ipt">
                        <Stack id="notes-history-ipt">
                            <Input
                                startDecorator={<SearchIcon fontSize="small" />}
                                placeholder="Recherche note"
                                value={currentSearch}
                                id="ipt-search"
                                type="search"
                                onChange={handleSearch}
                            />
                        </Stack>

                        <Stack id="notes-history-notes">
                            {currentSearch.length > 0
                                ? stockOfCurrentSearch.map((note, index) => (
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
                                          className="universal-notes-img"
                                      />
                                  ))
                                : notesList.length > 0
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
                                          className="universal-notes-img"
                                      />
                                  ))
                                : null}
                        </Stack>
                    </Stack>
                </Stack>

                <Divider orientation="vertical" />

                <Stack id="note-view">
                    <Box id="note-view-actions">
                        <Box id="note-view-actions-ipt">
                            <Typography id="note-name" level="h4">
                                <span>
                                    Nom de la note{" "}
                                    {!isNoteSelected
                                        ? `(${currentTitleNote.length} sur 30
                                caractères)`
                                        : ``}
                                </span>
                            </Typography>

                            <Input
                                startDecorator={
                                    <DriveFileRenameOutlineIcon fontSize="small" />
                                }
                                value={currentTitleNote}
                                onChange={handleUpTitle}
                                placeholder="Ex: Rêve de cette nuit"
                                disabled={isNoteSelected}
                            />

                            <Typography id="note-kw" level="h4">
                                <span>
                                    Mots-clés (
                                    {currentKeywords.trim().split(",").length}{" "}
                                    sur 4 mots
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
                                </span>
                            </Typography>

                            <Input
                                startDecorator={<StyleIcon fontSize="small" />}
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
