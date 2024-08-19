import axios from "axios";

export const getUsers = async () => {
    try {
        const query = await axios.get("/users/");
        return query.data;
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des utilisateurs :",
            error
        );
    }
};

export const registerSomeone = async (user, level, img, password, token) => {
    try {
        const data = new FormData();
        data.append("user", user);
        data.append("level", level);
        data.append("img", img);
        data.append("password", password);

        const query = await axios.post(`/users/registerSomeone`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        return query.data;
    } catch (error) {
        console.error("Erreur lors de la recuperation via token :", error);
        throw error;
    }
};

export const massiveDelete = async (list, token) => {
    try {
        const data = new FormData();
        data.append("list", list);

        const query = await axios.post(`/users/massiveDelete`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        return query.data;
    } catch (error) {
        console.error("Erreur lors de la recuperation via token :", error);
        throw error;
    }
};

export const getSessionOf = async (token) => {
    try {
        const data = new FormData();
        data.append("token", token);

        const query = await axios.post(`/users/getSessionOf/`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (error) {
        console.error("Erreur lors de la recuperation via token :", error);
        throw error;
    }
};

export const login = async (name, password, remember) => {
    try {
        const data = new FormData();
        data.append("name", name);
        data.append("password", password);
        data.append("remember", remember);

        const query = await axios.post("/users/login/", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        throw error;
    }
};
