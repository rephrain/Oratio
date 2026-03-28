import { json } from '@sveltejs/kit';
import {
	searchPersonalDiseaseHistory, searchFamilyDiseaseHistory,
	searchAllergySubstances, searchChiefComplaint,
	searchReasonByCategory, searchConcepts
} from '$lib/server/snowstorm.js';

export async function GET({ url }) {
	const term = url.searchParams.get('term') || '';
	const type = url.searchParams.get('type') || 'general';
	const ecl = url.searchParams.get('ecl') || '';
	const limit = parseInt(url.searchParams.get('limit') || '10');

	if (!term || term.length < 2) {
		return json({ results: [] });
	}

	try {
		let results;
		switch (type) {
			case 'disease_personal':
				results = await searchPersonalDiseaseHistory(term);
				break;
			case 'disease_family':
				results = await searchFamilyDiseaseHistory(term);
				break;
			case 'disease':
				// Legacy: defaults to personal
				results = await searchPersonalDiseaseHistory(term);
				break;
			case 'allergy':
				results = await searchAllergySubstances(term);
				break;
			case 'reason':
			case 'reason_finding':
				results = await searchChiefComplaint(term);
				break;
			case 'reason_procedure':
				results = await searchReasonByCategory(term, 'procedure');
				break;
			case 'reason_situation':
				results = await searchReasonByCategory(term, 'situation');
				break;
			case 'reason_event':
				results = await searchReasonByCategory(term, 'event');
				break;
			default:
				results = await searchConcepts(term, ecl, limit);
		}
		return json({ results });
	} catch (error) {
		console.error('Snowstorm search error:', error);
		return json({ error: error.message, results: [] }, { status: 500 });
	}
}
