import { json } from '@sveltejs/kit';
import { searchConcepts, searchDiseaseHistory, searchAllergySubstances, searchReasonCodes } from '$lib/server/snowstorm.js';

export async function GET({ url }) {
	const term = url.searchParams.get('term') || '';
	const ecl = url.searchParams.get('ecl') || '';
	const type = url.searchParams.get('type') || 'general';
	const limit = parseInt(url.searchParams.get('limit') || '20');

	if (!term || term.length < 2) {
		return json({ results: [] });
	}

	try {
		let results;
		switch (type) {
			case 'disease':
				results = await searchDiseaseHistory(term);
				break;
			case 'allergy':
				results = await searchAllergySubstances(term);
				break;
			case 'reason':
				results = await searchReasonCodes(term);
				break;
			default:
				results = await searchConcepts(term, ecl, limit);
		}
		return json({ results });
	} catch (error) {
		return json({ error: error.message, results: [] }, { status: 500 });
	}
}
