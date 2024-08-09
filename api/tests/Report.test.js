const fs = require("fs/promises");
const Report = require("../service/Report");
const ReportSchema = require("../types/ReportSchema");

jest.mock("fs/promises");
jest.mock("../types/ReportSchema");

describe("Tests pour la classe Report", () => {
    let report;

    beforeEach(() => {
        report = new Report();
    });

    test("Erreur lors de la publication à cause d'un format de donnée incorrect", async () => {
        // Simule une réponse incorrecte du schéma
        ReportSchema.mockImplementation(() => {
            return {
                getObject: () => null, // Simule un format incorrect
            };
        });

        const result = await report.publishReport(
            "message",
            "from",
            "contact",
            "nature"
        );

        expect(result.error).toBe("Impossible de publier le report.");
    });

    test("Erreur lors de la publication à cause de fs.readdir", async () => {
        fs.readdir.mockRejectedValue(
            new Error("Erreur de lecture du répertoire")
        );

        const result = await report.publishReport(
            "message",
            "from",
            "contact",
            "nature"
        );

        expect(result.error).toBe("Impossible de publier le report.");
    });

    test("Erreur lors de la publication à cause de fs.writeFile", async () => {
        fs.readdir.mockResolvedValue(["1.txt"]);
        fs.writeFile.mockRejectedValue(new Error("Erreur d'écriture"));

        const result = await report.publishReport(
            "message",
            "from",
            "contact",
            "nature"
        );

        expect(result.error).toBe("Impossible de publier le report.");
    });
});
