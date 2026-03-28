// Snowstorm FHIR ValueSet/$expand endpoint integration
// Uses the FHIR API as specified in the original requirements

const SNOWSTORM_FHIR_BASE = process.env.SNOWSTORM_BASE_URL || 'https://snowstorm.ihtsdotools.org/fhir/ValueSet/$expand';

/**
 * Core FHIR ValueSet/$expand search
 * @param {string} eclUrl - The full url parameter including ECL expression
 * @param {string} filter - The search term
 * @param {number} count - Max results
 */
async function expandValueSet(eclUrl, filter, count = 10) {
	const params = new URLSearchParams({
		url: eclUrl,
		count: String(count),
		filter
	});

	const res = await fetch(`${SNOWSTORM_FHIR_BASE}?${params}`, {
		headers: { Accept: 'application/fhir+json' }
	});

	if (!res.ok) throw new Error(`Snowstorm FHIR search failed: ${res.status}`);

	const data = await res.json();
	const contains = data?.expansion?.contains || [];

	return contains.map(item => ({
		code: item.code,
		display: item.display,
		system: item.system || 'http://snomed.info/sct'
	}));
}

/**
 * Search personal disease history
 * ECL: < 417662000 |History of clinical finding in subject (situation)| OR < 443508001 |No history of clinical finding in subject (situation)|
 */
export async function searchPersonalDiseaseHistory(term) {
	const eclUrl = 'http://snomed.info/sct?fhir_vs=ecl/< 417662000 |History of clinical finding in subject (situation)| OR < 443508001 |No history of clinical finding in subject (situation)|';
	return expandValueSet(eclUrl, term);
}

/**
 * Search family disease history
 * ECL: < 416471007 |Family history of clinical finding (situation)| OR < 160266009 |No family history of clinical finding (situation)|
 */
export async function searchFamilyDiseaseHistory(term) {
	const eclUrl = 'http://snomed.info/sct?fhir_vs=ecl/< 416471007 |Family history of clinical finding (situation)| OR < 160266009 |No family history of clinical finding (situation)|';
	return expandValueSet(eclUrl, term);
}

/**
 * Search allergy substances
 * Complex ECL: substances minus drugs/vaccines, plus no-known-allergy situations
 */
export async function searchAllergySubstances(term) {
	const eclUrl = 'http://snomed.info/sct?fhir_vs=ecl/( < 105590001 |Substance (substance)| MINUS ( << 410942007 |Drug or medicament (substance)| OR ( << 787859002 |Vaccine product (medicinal product)| . 127489000 |Has active ingredient| ) ) ) OR ( << 716186003 |No known allergy (situation)| : { 408729009 |Finding context (attribute)| = 410516002 |Known absent (qualifier value)| } )';
	return expandValueSet(eclUrl, term);
}

/**
 * Search chief complaint / keluhan utama (Finding: 404684003)
 */
export async function searchChiefComplaint(term) {
	return searchReasonByCategory(term, 'finding');
}

/**
 * Search reason codes by category (for SOAP-WHO form)
 * @param {string} term - search filter
 * @param {string} category - 'finding' | 'procedure' | 'situation' | 'event'
 */
export async function searchReasonByCategory(term, category = 'finding') {
	const eclMap = {
		finding: 'http://snomed.info/sct?fhir_vs=ecl/<404684003',
		procedure: 'http://snomed.info/sct?fhir_vs=ecl/<71388002',
		situation: 'http://snomed.info/sct?fhir_vs=ecl/<243796009',
		event: 'http://snomed.info/sct?fhir_vs=ecl/<272379006'
	};

	const eclUrl = eclMap[category] || eclMap.finding;
	return expandValueSet(eclUrl, term);
}

// Legacy compatibility — general concept search via FHIR
export async function searchConcepts(term, ecl = '', limit = 10) {
	if (ecl) {
		const eclUrl = `http://snomed.info/sct?fhir_vs=ecl/${ecl}`;
		return expandValueSet(eclUrl, term, limit);
	}
	// Fallback to finding search
	return searchReasonByCategory(term, 'finding');
}
