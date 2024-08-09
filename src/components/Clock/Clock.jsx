import "./Clock.scss";
import { useEffect, useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Typography } from "@mui/joy";

export default function Clock() {
    const [time, setTime] = useState(new Date());

    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours} : ${minutes}`;
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <Typography
            style={{
                color: "white",
                display: "flex",
                flexDirection: "row",
                gap: "10px",
            }}
            className="clock-direct"
        >
            <AccessTimeIcon />
            {formatTime(time)}
        </Typography>
    );
}
