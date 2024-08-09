import "./Storage.scss";
import FileManager from "../../components/FileManager/FileManager";
import MainLayout from "./../../layout/MainLayout";
import { Stack, Typography, Divider, Button } from "@mui/joy";
import StorageDetailsBadge from "../../components/StorageDetailsBadge/StorageDetailsBadge";
import { useGate } from "../../hooks/useGate";
import { useEffect } from "react";
import Olympe from "../../components/Olympe/Olympe";
import Radio from "@mui/joy/Radio";
import { useState } from "react";
import RadioGroup from "@mui/joy/RadioGroup";

export default function Storage() {
    const gate = useGate();
    const [isVisibleData, setIsVisibleData] = useState(false);

    const handleClickMoreDetails = () => {
        setIsVisibleData(!isVisibleData);
    };

    useEffect(() => {}, [gate]);

    return (
        <MainLayout>
            <Stack id="storage-container">
                <FileManager targetDir="./" />

                <Button
                    id="more-details"
                    onClick={handleClickMoreDetails}
                    variant="plain"
                    color="neutral"
                >
                    Voir plus de détails sur l'espace disque
                </Button>
                {isVisibleData ? (
                    <Stack id="storage-data-container">
                        <StorageDetailsBadge
                            user={gate.user}
                            level={gate.level}
                        />
                        <Olympe />
                    </Stack>
                ) : null}
            </Stack>
        </MainLayout>
    );
}
