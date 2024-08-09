import "./DisplayableAdd.scss";
import { Button } from "@mui/joy";
import { Stack, Tooltip } from "@mui/joy";

export default function DisplayableAdd({ id, tooltip = null, handler }) {
    return (
        <Tooltip title={tooltip}>
            <Stack className={`displayable-add`} id={id}>
                <Button
                    target="_blank"
                    color="none"
                    className="displayable-add-btn"
                    onClick={handler}
                >
                    +
                </Button>
            </Stack>
        </Tooltip>
    );
}
