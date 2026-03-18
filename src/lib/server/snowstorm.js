const SNOWSTORM_BASE = process.env.SNOWSTORM_BASE_URL || 'https://snowstorm.ihtsdotools.org/snowstorm/snomed-ct';

export async function searchConcepts(term, ecl = '', limit = 20) {
	const params = new URLSearchParams({
		term,
		limit: String(limit),
		activeFilter: 'true'
	});

	if (ecl) params.set('ecl', ecl);

	const res = await fetch(`${SNOWSTORM_BASE}/MAIN/concepts?${params}`, {
		headers: { 'Accept-Language': 'en' }
	});

	if (!res.ok) throw new Error(`Snowstorm search failed: ${res.status}`);

	const data = await res.json();
	return (data.items || []).map(item => ({
		code: item.conceptId,
		display: item.fsn?.term || item.pt?.term || '',
		preferred: item.pt?.term || ''
	}));
}

export async function searchDiseaseHistory(term) {
	// ECL for clinical findings
	return searchConcepts(term, '<< 404684003');
}

export async function searchAllergySubstances(term) {
	// ECL for substances
	return searchConcepts(term, '<< 105590001');
}

export async function searchReasonCodes(term) {
	// ECL for chief complaint / reason for encounter
	return searchConcepts(term, '<< 404684003');
}
