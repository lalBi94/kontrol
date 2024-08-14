import { Stack, Typography, Divider, Link } from "@mui/joy";
import "./SettingsCard.scss";

export default function SettingsCard({ title, handler, content, logo }) {
    return (
        <Stack className="settings-card-container" onClick={handler}>
            <Stack className="settings-card-header">
                {title ? (
                    <Typography className="settings-card-title" level="h2">
                        {title}
                    </Typography>
                ) : null}
                {logo ? logo : null}
            </Stack>

            <Divider className="settings-card-divider" />

            <Stack className="settings-card-content">
                <Typography className="settings-card-text">
                    {content}
                </Typography>
            </Stack>
        </Stack>
    );
}
