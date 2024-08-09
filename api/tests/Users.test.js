const path = require("path");
const fs = require("fs/promises");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../service/Users");

jest.mock("fs/promises");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Tests pour la classe Users", () => {
    const usersTarget = path.join(__dirname, "../data");
    const mockUser = {
        user: "testUser",
        password: "password123",
        level: 1,
        img: "path/to/image.png",
    };

    beforeEach(() => {
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Réinitialiser tous les mocks après chaque test
    });

    describe("Méthode decodeToken", () => {
        it("devrait décoder un jeton JWT valide", async () => {
            jwt.verify.mockReturnValue(mockUser);

            const users = new Users();
            const result = await users.decodeToken("validToken");

            expect(result.error).toBeNull();
            expect(result.decoded).toEqual(mockUser);
        });

        it("devrait retourner une erreur si le jeton est invalide", async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error("Invalid token");
            });

            const users = new Users();
            const result = await users.decodeToken("invalidToken");

            expect(result.error).toBe(
                "Une erreur est survenue lors du décodage du jeton."
            );
            expect(result.decoded).toBeNull();
        });
    });

    describe("Méthode genToken", () => {
        it("devrait générer un jeton JWT valide", async () => {
            jwt.sign.mockReturnValue("generatedToken");

            const users = new Users();
            const result = await users.genToken(mockUser);

            expect(result.error).toBeNull();
            expect(result.token).toBe("generatedToken");
        });

        it("devrait retourner une erreur si la génération du jeton échoue", async () => {
            jwt.sign.mockImplementation(() => {
                throw new Error("Token generation failed");
            });

            const users = new Users();
            const result = await users.genToken(mockUser);

            expect(result.error).toBe(
                "Une erreur est survenue lors de la création du jeton."
            );
            expect(result.token).toBeNull();
        });
    });

    describe("Méthode login", () => {
        it("devrait connecter un utilisateur avec des identifiants valides", async () => {
            const hashedPassword = await bcrypt.hash(mockUser.password, 15);
            const storedUser = { ...mockUser, password: hashedPassword };

            fs.readFile.mockResolvedValue(JSON.stringify(storedUser));
            fs.access.mockResolvedValue(true);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue("validToken");

            const users = new Users();
            const result = await users.login(
                mockUser.user,
                mockUser.password,
                true
            );

            expect(result.error).toBeNull();
            expect(result.token).toBe("validToken");
        });

        it("devrait retourner une erreur si l'utilisateur n'est pas trouvé", async () => {
            fs.access.mockRejectedValue(new Error("File not found"));

            const users = new Users();
            const result = await users.login(
                mockUser.user,
                mockUser.password,
                true
            );

            expect(result.error).toBe("Utilisateur non trouvé.");
            expect(result.token).toBeNull();
        });

        it("devrait retourner une erreur si le mot de passe est incorrect", async () => {
            const hashedPassword = await bcrypt.hash("wrongPassword", 15);
            const storedUser = { ...mockUser, password: hashedPassword };

            fs.readFile.mockResolvedValue(JSON.stringify(storedUser));
            fs.access.mockResolvedValue(true);
            bcrypt.compare.mockResolvedValue(false);

            const users = new Users();
            const result = await users.login(
                mockUser.user,
                mockUser.password,
                true
            );

            expect(result.error).toBe("Mot de passe incorrect.");
            expect(result.token).toBeNull();
        });
    });

    describe("Méthode retreiveAll", () => {
        it("devrait récupérer tous les utilisateurs", async () => {
            const storedUser = {
                ...mockUser,
                password: await bcrypt.hash(mockUser.password, 15),
            };

            fs.readdir.mockResolvedValue(["testUser"]);
            fs.readFile.mockResolvedValue(JSON.stringify(storedUser));
            fs.access.mockResolvedValue(true);

            const users = new Users();
            const result = await users.retreiveAll();

            expect(result.error).toBeNull();
            expect(result.data).toHaveLength(1);
            expect(result.data[0].user).toBe(mockUser.user);
            expect(result.data[0].password).toBeUndefined(); // Le mot de passe ne doit pas être inclus
        });

        it("devrait retourner une erreur si la récupération échoue", async () => {
            fs.readdir.mockRejectedValue(new Error("Read directory failed"));

            const users = new Users();
            const result = await users.retreiveAll();

            expect(result.error).toBe(
                "Impossible de récupérer les utilisateurs."
            );
            expect(result.data).toBeNull();
        });
    });

    describe("Méthode registerSomeone", () => {
        it("devrait enregistrer un nouvel utilisateur", async () => {
            fs.access.mockRejectedValue(new Error("File not found"));
            bcrypt.hash.mockResolvedValue("hashedPassword");
            fs.mkdir.mockResolvedValue();
            fs.writeFile.mockResolvedValue();

            const users = new Users();
            const result = await users.registerSomeone(mockUser);

            expect(result.error).toBeNull();
            expect(fs.mkdir).toHaveBeenCalledWith(
                path.join(usersTarget, mockUser.user),
                { recursive: true }
            );
            expect(fs.writeFile).toHaveBeenCalled();
        });

        it("devrait retourner une erreur si l'utilisateur existe déjà", async () => {
            fs.access.mockResolvedValue(true);

            const users = new Users();
            const result = await users.registerSomeone(mockUser);

            expect(result.error).toBe("L'utilisateur existe déjà.");
        });

        it("devrait retourner une erreur si l'enregistrement échoue", async () => {
            fs.access.mockRejectedValue(new Error("File not found"));
            bcrypt.hash.mockRejectedValue(new Error("Hashing failed"));

            const users = new Users();
            const result = await users.registerSomeone(mockUser);

            expect(result.error).toBe(
                "Impossible de créer un utilisateur avec ce pseudo."
            );
        });
    });
});
