import { useState, useEffect } from "react";
import { useGate } from "./../../hooks/useGate";
import "./KptureReport.scss";
import { getReports } from "../../services/Report";
import MainLayout from "../../layout/MainLayout";
import { Typography, Modal, ModalDialog, Stack, Button } from "@mui/joy";
import Displayable from "./../../components/Displayable/Displayable";
import KontroLogo from "/favicon.png";

export default function KptureReport() {
    const gate = useGate();
    const [reports, setReports] = useState([]);
    const [inConsulting, setInConsulting] = useState(false);
    const [toConsult, setToConsult] = useState(null);

    const handleConsultClose = () => {
        setInConsulting(false);
        setToConsult(null);
    };

    const handleGetUsers = () => {
        getReports(localStorage.getItem("kpture.token")).then((res) => {
            if (!res.error) {
                const newRes = res.reports.map((el) => {
                    return {
                        ...el,
                        message: decoupeChaineOptimise(el.message),
                    };
                });

                setReports(newRes);
            }
        });
    };

    const handleSelectReport = (obj) => {
        setToConsult(obj);
        setInConsulting(true);
    };

    const decoupeChaineOptimise = (chaine, maxCaracteres = 37) => {
        let morceaux = [];
        let debut = 0;

        while (debut < chaine.length) {
            let fin = debut + maxCaracteres;

            if (fin < chaine.length && chaine[fin] !== " ") {
                while (fin > debut && chaine[fin] !== " ") {
                    fin--;
                }
            }

            morceaux.push(chaine.substring(debut, fin).trim());
            debut = fin + 1;
        }

        return morceaux;
    };

    useEffect(() => {
        if (gate.user) {
            handleGetUsers();
        }
    }, [gate]);

    return (
        <MainLayout>
            <Stack id="kpturereport-container">
                <Stack id="ktpurereport-title-container">
                    <Typography id="ktpurereport-title" level="h3">
                        <span className="poppins-medium-italic">
                            Liste des requêtes
                        </span>
                    </Typography>
                </Stack>

                <Modal open={inConsulting}>
                    <ModalDialog layout="center" id="modal-consult">
                        {toConsult ? (
                            // Version amélioré de : https://codepen.io/lalBi94/pen/jOXNWbw (en hommage a mon ancien design de lettre qui n'a pas percé)
                            <Stack class="card">
                                <Stack class="card-y">
                                    <img
                                        loading="lazy"
                                        src={KontroLogo}
                                        alt="Logo de kontrol"
                                        class="card-y-img"
                                    />

                                    <Stack class="card-y-corp">
                                        <span class="card-y-corp-text">
                                            <b>Objet</b> ——— {toConsult.objet}
                                        </span>

                                        <span class="card-y-corp-text">
                                            <span>
                                                <b>Utilisateur</b> —{" "}
                                            </span>

                                            <span className="shantell-sans-regular">
                                                {toConsult.de}
                                            </span>
                                        </span>

                                        <span class="card-y-corp-text">
                                            <b>Contact</b> ——{" "}
                                            {toConsult.contact}
                                        </span>
                                    </Stack>

                                    <Stack class="card-y-infos">
                                        {toConsult.message.map((mess, j) => (
                                            <span class="card-y-infos-l">
                                                <Typography key={j}>
                                                    {mess}
                                                </Typography>
                                            </span>
                                        ))}
                                    </Stack>
                                </Stack>

                                <Stack id="modal-actions">
                                    <Button
                                        color="danger"
                                        onClick={handleConsultClose}
                                    >
                                        Retour
                                    </Button>
                                    <Button color="danger">Supprimer</Button>
                                </Stack>
                            </Stack>
                        ) : null}
                    </ModalDialog>
                </Modal>

                <Stack id="ktpurereport-reports-container">
                    {reports.length > 0
                        ? reports.map((v, i) => (
                              <Displayable
                                  className="ktpurereport-report"
                                  key={i}
                                  handler={() => {
                                      handleSelectReport(v);
                                  }}
                                  tooltip={`[${v.queue}] Requête de ${v.de}`}
                                  text={`de ${v.de} pour ${v.objet}`}
                              />
                          ))
                        : null}
                </Stack>
            </Stack>
        </MainLayout>
    );
}
