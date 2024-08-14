import { Stack, Box, Link } from "@mui/joy";
import MainLayout from "../../layout/MainLayout";
import "./DomainGestion.scss";
import SettingsCard from "./../../components/SettingsCard/SettingsCard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MarkunreadIcon from "@mui/icons-material/Markunread";

export default function DomainGestion() {
    return (
        <MainLayout>
            <Box className="domain-gestion-container">
                <Link href="/kptureuser" style={{ textDecoration: "none" }}>
                    <SettingsCard
                        handler={null}
                        logo={<ManageAccountsIcon fontSize="large" />}
                        title="Gestion des utilisateurs"
                        content="Créez, supprimez ou modifiez des comptes utilisateurs. Note : Vous ne pouvez pas accéder au stockage ni aux albums et ni aux notes des membres."
                    />
                </Link>

                <Link href="/kpturereport" style={{ textDecoration: "none" }}>
                    <SettingsCard
                        handler={null}
                        logo={<MarkunreadIcon fontSize="large" />}
                        title="Messagerie"
                        content="Visualisez les messages envoyés par les utilisateurs (signalement de bugs, demande d'ajout de fonctionnalités, suggestions de modifications, etc.) que vous devez traiter."
                    />
                </Link>
            </Box>
        </MainLayout>
    );
}
