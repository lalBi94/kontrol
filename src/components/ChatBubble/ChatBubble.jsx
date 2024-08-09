import { Box, Avatar, Stack, Typography, Tooltip } from "@mui/joy";
import "../../index.scss";
import "./ChatBubble.scss";

export default function ChatBubble({ avatar, name, chat, position, date }) {
    return (
        <Box
            className={`chatbubble-container ${
                position === "right" ? "right-side" : "left-side"
            }`}
        >
            <Stack className="chatbubble-profile">
                <Avatar className="chatbubble-profile-avatar" src={avatar} />
                <Typography className="chatbubble-profile-text">
                    <b className="shantell-sans-regular">{name}</b>
                </Typography>
            </Stack>

            <Tooltip title={date}>
                <Box className="chatbubble-chat-container">
                    <span className="chatbubble-chat">{chat}</span>
                </Box>
            </Tooltip>
        </Box>
    );
}
