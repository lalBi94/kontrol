import { Stack, Box, Link } from "@mui/joy";
import MainLayout from "../../layout/MainLayout";
import "./DomainGestion.scss";
import SettingsCard from "./../../components/SettingsCard/SettingsCard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MarkunreadIcon from "@mui/icons-material/Markunread";
import ConstructionIcon from "@mui/icons-material/Construction";

export default function DomainGestion() {
    return (
        <MainLayout>
            <Box className="domain-gestion-container">
                <Stack className="domain-gestion-choice">
                    <Link
                        disabled
                        href="/kpturesettings"
                        className="domain-gestion-choice-link"
                    >
                        <SettingsCard
                            handler={null}
                            logo={<ConstructionIcon fontSize="large" />}
                            title="Gestion du domaine"
                            content="Gérez l'espace de stockage de vos utilisateurs, désactiver certaines applications du site ou meme changer les options proposées dans les outils pratiques."
                        />
                    </Link>
                </Stack>

                <Stack className="domain-gestion-choice">
                    <Link
                        href="/kptureusers"
                        className="domain-gestion-choice-link"
                    >
                        <SettingsCard
                            handler={null}
                            logo={<ManageAccountsIcon fontSize="large" />}
                            title="Gestion des utilisateurs"
                            content="Créez, supprimez ou modifiez des comptes utilisateurs. Note : Vous ne pouvez pas accéder au stockage ni aux albums et ni aux notes des membres."
                        />
                    </Link>
                </Stack>

                <Stack className="domain-gestion-choice">
                    <Link
                        href="/kpturereport"
                        className="domain-gestion-choice-link"
                    >
                        <SettingsCard
                            handler={null}
                            logo={<MarkunreadIcon fontSize="large" />}
                            title="Messagerie"
                            content="Visualisez les messages envoyés par les utilisateurs (signalement de bugs, demande d'ajout de fonctionnalités, suggestions de modifications, etc.) que vous devez traiter."
                        />
                    </Link>
                </Stack>
            </Box>
        </MainLayout>
    );
}
