import axios from "axios";

export const deleteReport = async (queue, token) => {
    const formData = new FormData();
    formData.append("queue", queue);

    const query = await axios.post("/report/deleteReport", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
    });

    return query.data;
};

export const sendReport = async (message, from, contact, nature, token) => {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("from", from);
    formData.append("contact", contact);
    formData.append("nature", nature);

    const query = await axios.post("/report/send", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
    });

    return query.data;
};

export const getReports = async (token) => {
    const query = await axios.get("/report", {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
    });

    return query.data;
};
