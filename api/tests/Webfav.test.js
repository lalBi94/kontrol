const fs = require("fs/promises");
const path = require("path");
const Webfav = require("../service/Webfav");

describe("Tests pour la classe Webfav", () => {
    const user = "testUser";
    const userDir = path.join(__dirname, "../data", user);
    const filePath = path.join(userDir, "website_fav.data.json");

    beforeEach(async () => {
        await fs.mkdir(userDir, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify([]));
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await fs.rm(userDir, { recursive: true, force: true });
    });

    describe("Méthode addWebsiteFav", () => {
        it("devrait ajouter un nouveau site aux favoris", async () => {
            const webfav = new Webfav();
            const result = await webfav.addWebsiteFav(
                user,
                "https://example.com",
                "Example",
                "https://example.com/image.png"
            );

            const fileContent = await fs.readFile(filePath);
            const favorites = JSON.parse(fileContent);

            expect(result.error).toBeNull();
            expect(favorites).toHaveLength(1);
            expect(favorites[0]).toEqual({
                url: "https://example.com",
                name: "Example",
                image_url: "https://example.com/image.png",
            });
        });

        it("devrait retourner une erreur si l'ajout échoue", async () => {
            const webfav = new Webfav();
            jest.spyOn(fs, "writeFile").mockImplementation(() => {
                throw new Error("Erreur d'écriture");
            });

            const result = await webfav.addWebsiteFav(
                user,
                "https://example.com",
                "Example",
                "https://example.com/image.png"
            );

            expect(result.error).toBe(
                "Impossible d'ajouter un site en favoris."
            );
        });
    });

    describe("Méthode deleteWebsiteFav", () => {
        beforeEach(async () => {
            await fs.writeFile(
                filePath,
                JSON.stringify([
                    {
                        url: "https://example.com",
                        name: "Example",
                        image_url: "https://example.com/image.png",
                    },
                ])
            );
        });

        it("devrait supprimer un site des favoris", async () => {
            const webfav = new Webfav();
            const result = await webfav.deleteWebsiteFav(
                user,
                "https://example.com"
            );

            const fileContent = await fs.readFile(filePath);
            const favorites = JSON.parse(fileContent);

            expect(result.error).toBeNull();
            expect(favorites).toHaveLength(0);
        });

        it("devrait retourner une erreur si le site n'existe pas dans les favoris", async () => {
            const webfav = new Webfav();
            const result = await webfav.deleteWebsiteFav(
                user,
                "https://nonexistent.com"
            );

            expect(result.error).toBe("Rien a supprimer !");
        });

        it("devrait retourner une erreur si la suppression échoue", async () => {
            const webfav = new Webfav();
            jest.spyOn(fs, "writeFile").mockImplementation(() => {
                throw new Error("Erreur d'écriture");
            });

            const result = await webfav.deleteWebsiteFav(
                user,
                "https://example.com"
            );

            expect(result.error).toBe(
                "Impossible de supprimer un site favoris."
            );
        });
    });

    describe("Méthode retreiveWebsiteFav", () => {
        it("devrait récupérer la liste des sites favoris", async () => {
            await fs.writeFile(
                filePath,
                JSON.stringify([
                    {
                        url: "https://example.com",
                        name: "Example",
                        image_url: "https://example.com/image.png",
                    },
                ])
            );

            const webfav = new Webfav();
            const result = await webfav.retreiveWebsiteFav(user);

            expect(result.error).toBeNull();
            expect(result.website_fav).toHaveLength(1);
            expect(result.website_fav[0]).toEqual({
                url: "https://example.com",
                name: "Example",
                image_url: "https://example.com/image.png",
            });
        });

        it("devrait retourner une erreur si la récupération échoue", async () => {
            const webfav = new Webfav();
            jest.spyOn(fs, "readFile").mockImplementation(() => {
                throw new Error("Erreur de lecture");
            });

            const result = await webfav.retreiveWebsiteFav(user);

            expect(result.error).toBe(
                "Impossible de recuperer la liste des sites favoris d'un utilisateur."
            );
        });
    });
});
