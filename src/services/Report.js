import axios from "axios";

export const sendReport = async (message, from, contact, nature) => {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("from", from);
    formData.append("contact", contact);
    formData.append("nature", nature);

    const query = await axios.post("/report/send", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return query.data;
};
