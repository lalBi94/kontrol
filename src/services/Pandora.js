import axios from "axios";

export const feedOlympus = async (user, token) => {
    try {
        const formData = new FormData();
        formData.append("user", user);

        const query = await axios.post("/pandora/feedOlympus", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const renameSomething = async (user, pth, newName, token) => {
    try {
        const formData = new FormData();
        formData.append("pth", pth);
        formData.append("user", user);
        formData.append("newName", newName);

        const query = await axios.put("/pandora/renameSomething", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const getStorageDetails = async (level, user, token) => {
    try {
        const formData = new FormData();
        formData.append("level", level);
        formData.append("user", user);

        const query = await axios.post("/pandora/getStorageDetails", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const deleteSomething = async (user, pth, token) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("pth", pth);

        const query = await axios.put("/pandora/deleteSomething", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const retreiveZip = async (user, pth, token) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("pth", pth);

        const query = await axios.post("/pandora/retreiveZip", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
            responseType: "blob",
        });

        const contentDisposition = query.headers["content-disposition"];

        return {
            blob: query.data,
            contentDisposition,
        };
    } catch (err) {
        console.error("Impossible de recuperer ce fichier.", err);
    }
};

export const retreiveFile = async (user, pth, token) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("pth", pth);

        const query = await axios.post("/pandora/retreiveFile", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
            responseType: "blob",
        });

        const contentDisposition = query.headers["content-disposition"];

        return {
            blob: query.data,
            contentDisposition,
        };
    } catch (err) {
        console.error("Impossible de recuperer ce fichier.", err);
    }
};

export const createDir = async (user, dirName, pth, token) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("dirName", dirName);
        formData.append("pth", pth);

        const query = await axios.post("/pandora/createDir", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        return query.data;
    } catch (err) {
        console.error("Erreur lors de la création du répertoire :", err);
    }
};

export const sendFileToStorage = async (user, files, pth, token) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("pth", pth);

        for (let i = 0; i <= files.length - 1; ++i) {
            formData.append("files", files[i]);
        }

        const query = await axios.post("/pandora/sendFileToStorage", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        return query.data;
    } catch (err) {
        console.error("Erreur lors de l'upload du fichier :", err);
    }
};

export const navigation = async (user, targetDir, token) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("target_dir", targetDir);

        const query = await axios.post(`/pandora/navigation`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        return query.data;
    } catch (err) {
        console.error("Impossible de recupéré les données de ce chemin.", err);
    }
};
