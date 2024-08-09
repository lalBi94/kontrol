import axios from "axios";

export const getAlbums = async (user) => {
    try {
        const formData = new FormData();
        formData.append("user", user);

        const query = await axios.post("/photomaton/getAlbums", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const deleteAlbum = async (user, album) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("album", album);

        const query = await axios.put("/photomaton/deleteAlbum", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const massiveDelete = async (user, supress, album) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("supress", supress);
        formData.append("album", album);

        const query = await axios.put("/photomaton/massiveDelete", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const sendFileToGalery = async (user, files, album) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("album", album);

        for (let i = 0; i <= files.length - 1; ++i) {
            formData.append("files", files[i]);
        }

        const query = await axios.post(
            "/photomaton/sendFileToGalery",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return query.data;
    } catch (err) {
        console.error("Erreur lors de l'upload du fichier :", err);
    }
};

export const retreiveZip = async (user, album) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("album", album);

        const query = await axios.post("/photomaton/retreiveZip", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
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

export const getFile = async (user, album, file) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("album", album);
        formData.append("file", file);

        const query = await axios.post("/photomaton/getFile", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const getFilesOf = async (user, album, page) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("album", album);
        formData.append("page", page);

        const query = await axios.post("/photomaton/getFilesOf", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const getTotalFilesCount = async (user, album) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("album", album);

        const query = await axios.post(
            "/photomaton/getTotalFilesCount",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const createAlbum = async (user, name) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("name", name);

        const query = await axios.post("/photomaton/createAlbum", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};
