const path = require("path");
const fs = require("fs/promises");
const ReportSchema = require("../types/ReportSchema");

/**
 * Classe gérant les reports
 * @class Report
 * @author Bilal Boudjemline
 */
class Report {
    constructor() {
        this.report_data = path.join(__dirname, "../reports");
    }

    transformToJSON(text) {
        let lines = text
            .split("-")
            .map((line) => line.trim())
            .filter((line) => line !== "");

        let data = {};

        lines.forEach((line) => {
            let parts = line.split(":");
            let key = parts[0].trim();
            let value = parts.slice(1).join(":").trim();

            data[key.toLowerCase()] = value;
        });

        return data;
    }

    async getReports() {
        try {
            const reports = await fs.readdir(this.report_data);
            const stock = [];

            for (let file of reports) {
                const report = (
                    await fs.readFile(path.join(this.report_data, file))
                ).toString();

                let json_report = this.transformToJSON(report);
                stock.push({ ...json_report, queue: file.slice(0, -4) });
            }

            return { error: null, reports: stock };
        } catch (err) {
            console.error(err);
            return { error: "Impossible de récuperer les reports." };
        }
    }

    /**
     * Publier un report
     * @param {string} message
     * @param {string} from
     * @param {string} contact
     * @param {string} nature
     * @return {Promise<{ error: string | null }>}
     */
    async publishReport(message, from, contact, nature) {
        try {
            const schematic = new ReportSchema(message, from, contact, nature);

            if (!schematic.getObject()) {
                return { error: "Impossible de publier le report." };
            }

            const n_report = (await fs.readdir(this.report_data)).length;

            const report_target = path.join(
                this.report_data,
                `${n_report + 1}.txt`
            );

            const format = `-\nDe\t:\t${from}\n-\nObjet\t:\t${nature}\n-\nMessage\t:\n${message}\n-\nContact\t:\t${contact}`;

            await fs.writeFile(report_target, format);

            return { error: null };
        } catch (err) {
            console.error(err);
            return { error: "Impossible de publier le report." };
        }
    }
}

module.exports = Report;
