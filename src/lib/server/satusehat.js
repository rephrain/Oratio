// SatuSehat API integration with staging/production URL switching

const SATUSEHAT_CONFIG = {
	staging: {
		base_url: 'https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1',
		auth_url: 'https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1/accesstoken',
		kfa_url: 'https://api-satusehat-stg.dto.kemkes.go.id/kfa-v2/products/all',
		consent_url: 'https://api-satusehat-stg.dto.kemkes.go.id/consent/v1'
	},
	production: {
		base_url: 'https://api-satusehat.kemkes.go.id/fhir-r4/v1',
		auth_url: 'https://api-satusehat.kemkes.go.id/oauth2/v1/accesstoken',
		kfa_url: 'https://api-satusehat.kemkes.go.id/kfa-v2/products/all',
		consent_url: 'https://api-satusehat.kemkes.go.id/consent/v1'
	}
};

let cachedToken = null;
let tokenExpiry = 0;

function getEnv() {
	return process.env.SATUSEHAT_ENV || 'staging';
}

function getConfig() {
	return SATUSEHAT_CONFIG[getEnv()] || SATUSEHAT_CONFIG.staging;
}

export async function getToken() {
	if (cachedToken && Date.now() < tokenExpiry) {
		return cachedToken;
	}

	const config = getConfig();
	const url = `${config.auth_url}?grant_type=client_credentials`;

	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: process.env.SATUSEHAT_CLIENT_ID || '',
				client_secret: process.env.SATUSEHAT_CLIENT_SECRET || ''
			})
		});

		if (!res.ok) throw new Error(`SatuSehat auth failed: ${res.status}`);

		const data = await res.json();
		cachedToken = data.access_token;
		tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
		return cachedToken;
	} catch (error) {
		console.error('SatuSehat token error:', error);
		throw error;
	}
}

/**
 * Search KFA products using the /kfa-v2/products/all endpoint
 * Handles both merk known (93xxxxxx) and merk unknown (92xxxxxx) scenarios
 */
export async function searchKFA(keyword, page = 1, size = 10) {
	const token = await getToken();
	const config = getConfig();

	const params = new URLSearchParams({
		page: String(page),
		size: String(size),
		product_type: 'farmasi',
		keyword
	});

	const res = await fetch(`${config.kfa_url}?${params}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/json'
		}
	});

	if (!res.ok) throw new Error(`KFA search failed: ${res.status}`);

	const data = await res.json();
	const items = data?.items?.data || [];

	return items.map(item => {
		// Scenario 1: Merk Known (93xxxxxx) — use item directly
		// Scenario 2: Merk Unknown (92xxxxxx) — use product_template
		const isUnknown = item.kfa_code?.startsWith('92');
		const name = isUnknown ? item.prodct_template?.name : item.name;
		const code = isUnknown ? item.prodct_template?.kfa_code : item.kfa_code;
		return {
			code,
			display: name,
			product_name: name,
			dosage_form: item.dosage_form?.name || '',
			kfa_code: item.kfa_code
		};
	});
}

export function getBaseUrl() {
	return getConfig().base_url;
}
