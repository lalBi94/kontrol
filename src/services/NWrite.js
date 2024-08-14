import axios from "axios";

export const updateNote = async (title, content, user, newName) => {
    try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("user", user);
        formData.append("newName", newName);

        const query = await axios.post("/nwrite/updateNote", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const sendNote = async (title, content, user, keyword) => {
    try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("user", user);
        formData.append("keyword", keyword);

        const query = await axios.post("/nwrite/sendNote", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const getAllNotesOf = async (user) => {
    try {
        const formData = new FormData();
        formData.append("user", user);

        const query = await axios.post("/nwrite/getAllNotesOf", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const getNoteData = async (user, title) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("title", title);

        const query = await axios.post("/nwrite/getNoteData", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};

export const deleteNote = async (user, title) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("title", title);

        const query = await axios.post("/nwrite/deleteNote", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (err) {
        console.error(err);
    }
};
