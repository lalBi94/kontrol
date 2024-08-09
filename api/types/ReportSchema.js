class ReportSchema {
    constructor(message, from, contact, nature) {
        if (typeof message !== "string") {
            throw new Error(
                "[.Someone] Le champ 'message' doit être une chaîne de caractères"
            );
        } else if (typeof from !== "string") {
            throw new Error(
                "[.Someone] Le champ 'from' doit être une chaîne de caractères"
            );
        } else if (typeof contact !== "string") {
            throw new Error(
                "[.Someone] Le champ 'contact' doit être un nombre"
            );
        } else if (typeof nature !== "string") {
            throw new Error(
                "[.Someone] Le champ 'nature' doit être une chaîne de caractères"
            );
        } else {
            this.message = message;
            this.from = from;
            this.contact = contact;
            this.nature = nature;
        }
    }

    getObject() {
        return {
            message: this.message,
            from: this.from,
            contact: this.contact,
            nature: this.nature,
        };
    }
}

module.exports = ReportSchema;
