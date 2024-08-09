import axios from "axios";

export const retreiveWebsiteFav = async (user) => {
    try {
        const query = await axios.get(`/webfav/retreiveWebsiteFav/${user}`);
        return query.data;
    } catch (err) {
        console.error(
            "Impossible de recuperer la liste des sites favoris.",
            err
        );
    }
};

export const deleteWebsiteFav = async (user, url) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("url", url);

        const query = await axios.post(`/webfav/deleteWebsiteFav/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (err) {
        console.error("Impossible de supprimer un site favoris.", err);
    }
};

export const addWebsiteFavorite = async (user, url, name, image_url) => {
    try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("url", url);
        formData.append("name", name);
        formData.append("image_url", image_url);

        const query = await axios.post("/webfav/addWebsiteFav/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return query.data;
    } catch (err) {
        console.error("Erreur lors de l'ajout d'un site favoris.", err);
    }
};
