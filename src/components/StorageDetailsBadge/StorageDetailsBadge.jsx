import "./StorageDetailsBadge.scss";
import { Stack, Typography, Divider } from "@mui/joy";
import { useEffect, useState } from "react";
import { getStorageDetails } from "../../services/Pandora";

export default function StorageDetailsBadge({ level, user }) {
    const [stats, setStats] = useState({});

    useEffect(() => {
        getStorageDetails(level, user).then((res) => {
            setStats(res);
        });
    }, []);

    return (
        <Stack id="data-texts">
            <Stack className="data-text-container">
                <Typography className="data-text">Espace total</Typography>

                <Typography className="data-text-data">
                    {stats.total}
                </Typography>
            </Stack>

            <Divider />

            <Stack className="data-text-container">
                <Typography className="data-text">Espace libre</Typography>

                <Typography className="data-text-data">{stats.free}</Typography>
            </Stack>

            <Divider />

            <Stack className="data-text-container">
                <Typography className="data-text">Espace utilisé</Typography>

                <Typography className="data-text-data">{stats.used}</Typography>
            </Stack>
        </Stack>
    );
}
