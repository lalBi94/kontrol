class SomeoneSchema {
    constructor(user, password, level, img) {
        if (typeof user !== "string") {
            throw new Error(
                "[.Someone] Le champ 'name' doit être une chaîne de caractères"
            );
        } else if (typeof password !== "string") {
            throw new Error(
                "[.Someone] Le champ 'password' doit être une chaîne de caractères"
            );
        } else if (typeof level !== "number") {
            throw new Error("[.Someone] Le champ 'level' doit être un nombre");
        } else if (typeof img !== "string") {
            throw new Error(
                "[.Someone] Le champ 'img' doit être une chaîne de caractères"
            );
        } else {
            this.user = user;
            this.password = password;
            this.level = level;
            this.img = img;
        }
    }

    semiEq(anotherOne) {
        return (
            this.name === anotherOne.name &&
            this.password === anotherOne.password &&
            this.level === anotherOne.level &&
            this.img === anotherOne.img
        );
    }

    getObject() {
        return {
            user: this.user,
            password: this.password,
            level: this.level,
            img: this.img,
        };
    }
}

module.exports = SomeoneSchema;
