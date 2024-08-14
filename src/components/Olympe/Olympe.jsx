import { useEffect } from "react";
import "./Olympe.scss";
import { Stack, Box, Typography, Tooltip } from "@mui/joy";
import { feedOlympus } from "../../services/Pandora";
import { useGate } from "../../hooks/useGate";
import { useState } from "react";

export default function Olympe() {
    const gate = useGate();
    const [isVisible, setIsVisible] = useState(false);
    const [files, setFiles] = useState({
        first: null,
        second: null,
        third: null,
    });

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

    useEffect(() => {
        feedOlympus(gate.user, localStorage.getItem("kpture.token")).then(
            (res) => {
                if (!res.error || res.files.length > 0) {
                    setFiles(res.files);
                    setIsVisible(true);
                }
            }
        );
    }, []);
    return (
        <Box className="olympe-container">
            {files.second ? (
                <Stack className="olympe-column column-second">
                    <Tooltip
                        title={
                            <Stack>
                                Nom ➜ {files.second.name} <br />
                                Chemin ➜ {files.second.path} <br />
                                Taille ➜ {files.second.formatSize}
                            </Stack>
                        }
                    >
                        <Stack>
                            <Stack className="circle-bg second">
                                <Typography className="circle-in-text">
                                    2
                                </Typography>
                            </Stack>
                            <Typography className="medals-text">
                                {textCutter(files.second.name)}
                            </Typography>

                            <Typography className="medals-size">
                                {files.second.formatSize}
                            </Typography>
                        </Stack>
                    </Tooltip>
                </Stack>
            ) : null}

            {files.first ? (
                <Stack className="olympe-column column-first">
                    <Tooltip
                        title={
                            <Stack>
                                Nom ➜ {files.first.name} <br />
                                Chemin ➜ {files.first.path} <br />
                                Taille ➜ {files.first.formatSize}
                            </Stack>
                        }
                    >
                        <Stack>
                            <Stack className="circle-bg first">
                                <Typography className="circle-in-text">
                                    1
                                </Typography>
                            </Stack>
                            <Typography className="medals-text">
                                {textCutter(files.first.name)}
                            </Typography>

                            <Typography className="medals-size">
                                {files.first.formatSize}
                            </Typography>
                        </Stack>
                    </Tooltip>
                </Stack>
            ) : null}

            {files.third ? (
                <Stack className="olympe-column column-third">
                    <Tooltip
                        title={
                            <Stack>
                                Nom ➜ {files.third.name} <br />
                                Chemin ➜ {files.third.path} <br />
                                Taille ➜ {files.third.formatSize}
                            </Stack>
                        }
                    >
                        <Stack>
                            <Stack className="circle-bg third">
                                <Typography className="circle-in-text">
                                    3
                                </Typography>
                            </Stack>
                            <Typography className="medals-text">
                                {textCutter(files.third.name)}
                            </Typography>

                            <Typography className="medals-size">
                                {files.third.formatSize}
                            </Typography>
                        </Stack>
                    </Tooltip>
                </Stack>
            ) : null}
        </Box>
    );
}
