import "./Displayable.scss";
import { Stack, Tooltip, Typography } from "@mui/joy";
import "../../index.scss";
import selecting from "../../assets/audio/selecting.mp3";
import { motion } from "framer-motion";

const Cadre = motion(Stack);

export default function Displayable({
    link,
    text,
    handler = null,
    className = "",
    id,
    tooltip = null,
    img = null,
    openInAnotherWindow = true,
}) {
    const selectAudio = new Audio(selecting);

    const handleGo = (inAnotherWindow) => {
        if (inAnotherWindow) {
            window.open(link);
        } else {
            window.location.href = link;
        }
    };

    return (
        <Tooltip title={tooltip}>
            <Cadre
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 1 }}
                style={
                    img
                        ? {
                              backgroundImage: `url("${img}")`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                          }
                        : {}
                }
                className={`displayable ${className}`}
                id={id}
                onClick={
                    handler
                        ? handler
                        : () => {
                              selectAudio.volume = 0.3;
                              selectAudio.play();

                              setTimeout(
                                  () => handleGo(openInAnotherWindow),
                                  500
                              );
                          }
                }
            >
                <Typography
                    className={`${
                        img ? "displayable-links-special" : "displayable-links"
                    }`}
                >
                    <span className={img ? "" : "londrina-solid-regular txt"}>
                        {text}
                    </span>
                </Typography>
            </Cadre>
        </Tooltip>
    );
}
