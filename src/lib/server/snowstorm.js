// Snowstorm FHIR ValueSet/$expand endpoint integration
// Uses the FHIR API as specified in the original requirements

const SNOWSTORM_FHIR_BASE = process.env.SNOWSTORM_BASE_URL || 'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand';

/**
 * Core FHIR ValueSet/$expand search
 * @param {string} ecl - The raw ECL expression ONLY
 * @param {string} filter - The search term
 * @param {number} count - Max results
 */
async function expandValueSet(ecl, filter, count = 10) {
	// 1. Strict Encoder: Standard encodeURIComponent ignores () characters. 
	// This custom function forces them into %28 and %29 to match your exact required format.
	const encodeStrict = (str) => encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());

	const encodedEcl = encodeStrict(ecl);
	const encodedFilter = encodeStrict(filter || '');

	// 2. Stitch together the exact string sequence you requested:
	// - Raw base URL
	// - ?url=http://snomed.info/sct
	// - %3Ffhir_vs%3Decl/  (Hardcoded encoded part)
	// - The strictly encoded ECL string
	// - The standard count and filter params
	const queryString = `$expand?url=http://snomed.info/sct?fhir_vs=ecl/${encodedEcl}&count=${count}&filter=${encodedFilter}`;

	const fullUrl = `${SNOWSTORM_FHIR_BASE}${queryString}`;

	console.log('Fetching Snowstorm:', fullUrl);

	const res = await fetch(fullUrl, {
		headers: { Accept: 'application/fhir+json' }
	});

	if (!res.ok) {
		const text = await res.text();
		console.error('Snowstorm response:', text);
		throw new Error(`Snowstorm FHIR search failed: ${res.status}`);
	}

	const data = await res.json();
	return (data?.expansion?.contains || []).map(item => ({
		code: item.code,
		display: item.display,
		system: item.system === 'http://snomed.info/sct' ? 'SNOMED' : (item.system || 'SNOMED')
	}));
}

/**
 * Search personal disease history
 * ECL: < 417662000 |History of clinical finding in subject (situation)| OR < 443508001 |No history of clinical finding in subject (situation)|
 */
export async function searchPersonalDiseaseHistory(term) {
	const eclUrl = '< 417662000 |History of clinical finding in subject (situation)| OR < 443508001 |No history of clinical finding in subject (situation)|';
	return expandValueSet(eclUrl, term);
}

/**
 * Search family disease history
 * ECL: < 416471007 |Family history of clinical finding (situation)| OR < 160266009 |No history of clinical finding (situation)|
 */
export async function searchFamilyDiseaseHistory(term) {
	const eclUrl = '< 416471007 |Family history of clinical finding (situation)| OR < 160266009 |No history of clinical finding (situation)|';
	return expandValueSet(eclUrl, term);
}

/**
 * Search allergy substances
 * Complex ECL: substances minus drugs/vaccines, plus no-known-allergy situations
 */
export async function searchAllergySubstances(term) {
	// Pass ONLY the raw ECL expression. No url prefixes here!
	const ecl = '( < 105590001 |Substance (substance)| MINUS ( << 410942007 |Drug or medicament (substance)| OR ( << 787859002 |Vaccine product (medicinal product)| . 127489000 |Has active ingredient| ) ) ) OR ( << 716186003 |No known allergy (situation)| : { 408729009 |Finding context (attribute)| = 410516002 |Known absent (qualifier value)| } )';

	return expandValueSet(ecl, term);
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
		finding: '<404684003',
		procedure: '<71388002',
		situation: '<243796009',
		event: '<272379006'
	};

	const eclUrl = eclMap[category] || eclMap.finding;
	return expandValueSet(eclUrl, term);
}

// Legacy compatibility — general concept search via FHIR
export async function searchConcepts(term, ecl = '', limit = 10) {
	if (ecl) {
		const eclUrl = `${ecl}`;
		return expandValueSet(eclUrl, term, limit);
	}
	// Fallback to finding search
	return searchReasonByCategory(term, 'finding');
}
