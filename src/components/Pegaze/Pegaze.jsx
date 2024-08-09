import { Button } from "@mui/joy";
import "./Pegaze.scss";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useState } from "react";
import goUp from "../../assets/audio/go-up.mp3";

export default function Pegaze() {
    const audio = new Audio(goUp);

    const handleGoTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        audio.volume = 0.28;
        audio.play();
    };

    return (
        <Button id="pegaze-btn" onClick={handleGoTop}>
            <ArrowUpwardIcon id="pegaze-icon" />
        </Button>
    );
}
