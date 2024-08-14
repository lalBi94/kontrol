import { Stack, Box } from "@mui/joy";
import MainLayout from "../../layout/MainLayout";
import "./DomainGestion.scss";
import SettingsCard from "./../../components/SettingsCard/SettingsCard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MarkunreadIcon from "@mui/icons-material/Markunread";

export default function DomainGestion() {
    return (
        <MainLayout>
            <Box className="domain-gestion-container">
                <SettingsCard
                    handler={null}
                    logo={<ManageAccountsIcon fontSize="large" />}
                    title="Gestion des utilisateurs"
                    content="Créer, supprimer ou modifier des comptes utilisateurs. Note: Vous ne pouvez pas consulter le : stockage et l'album de vos membres."
                />

                <SettingsCard
                    handler={null}
                    logo={<MarkunreadIcon fontSize="large" />}
                    title="Messagerie"
                    content="Visionner les messages envoyé par les utilisateurs (report de bugs, ajout de fonctionnalité, changement de ...). Que vous devez traiter."
                />
            </Box>
        </MainLayout>
    );
}
