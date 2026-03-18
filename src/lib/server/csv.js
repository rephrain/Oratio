import Papa from 'papaparse';

export function parseCSV(text) {
	const result = Papa.parse(text, {
		header: true,
		skipEmptyLines: true,
		transformHeader: h => h.trim().toLowerCase().replace(/\s+/g, '_')
	});

	return {
		data: result.data,
		fields: result.meta.fields,
		errors: result.errors
	};
}

export function generateCSV(data, fields) {
	return Papa.unparse(data, { columns: fields });
}

export function validateCSVData(data, requiredFields) {
	const errors = [];
	data.forEach((row, i) => {
		for (const field of requiredFields) {
			if (!row[field] || (typeof row[field] === 'string' && !row[field].trim())) {
				errors.push({ row: i + 1, field, message: `${field} is required` });
			}
		}
	});
	return errors;
}
