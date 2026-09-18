const { Parser } = require('json2csv');

class CSVExportUtils {
    /**
     * Exports data to CSV
     * @param {Array} data - The array of objects to export.
     * @param {Array} fields - The fields to include in the CSV.
     * @param {String} fileName - The name of the file to export.
     * @param {Object} res - Express response object to send the file.
     */
    static exportToCSV(data, fields, fileName, res) {
        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, message: 'No data found to export' });
        }

        try {
            // Convert data to CSV
            const json2csvParser = new Parser({ fields });
            const csvData = json2csvParser.parse(data);

            // Set headers for file download
            res.header('Content-Type', 'text/csv');
            res.attachment(fileName);
            return res.status(200).send(csvData);
        } catch (error) {
            console.error('Error exporting data to CSV:', error.message);
            return res.status(500).json({ success: false, message: 'Failed to export data to CSV' });
        }
    }
}

module.exports = CSVExportUtils;