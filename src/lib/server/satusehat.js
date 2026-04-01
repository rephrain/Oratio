import {
	SATUSEHAT_CLIENT_ID,
	SATUSEHAT_CLIENT_SECRET,
	SATUSEHAT_ENV
} from '$env/static/private';

// SatuSehat API configuration
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
	return SATUSEHAT_ENV || 'staging';
}

function getConfig() {
	return SATUSEHAT_CONFIG[getEnv()] || SATUSEHAT_CONFIG.staging;
}

function validateEnv() {
	if (!SATUSEHAT_CLIENT_ID || !SATUSEHAT_CLIENT_SECRET) {
		throw new Error('SATUSEHAT env variables are missing');
	}
}

export async function getToken() {
	// Use cache if valid
	if (cachedToken && Date.now() < tokenExpiry) {
		return cachedToken;
	}

	validateEnv();

	const config = getConfig();
	const url = `${config.auth_url}?grant_type=client_credentials`;

	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: SATUSEHAT_CLIENT_ID,
				client_secret: SATUSEHAT_CLIENT_SECRET
			})
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`SatuSehat auth failed: ${res.status} - ${text}`);
		}

		const data = await res.json();

		cachedToken = data.access_token;
		tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // buffer

		return cachedToken;
	} catch (error) {
		console.error('SatuSehat token error:', error);
		throw error;
	}
}

/**
 * Search KFA products
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

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`KFA search failed: ${res.status} - ${text}`);
	}

	const data = await res.json();
	const items = data?.items?.data || [];

	return items.map(item => {
		const isUnknown = item.kfa_code?.startsWith('92');

		const name = isUnknown
			? item.product_template?.name
			: item.name;

		const code = isUnknown
			? item.product_template?.kfa_code
			: item.kfa_code;

		return {
			code,
			display: name,
			product_name: name,
			dosage_form: item.dosage_form?.name || '',
			kfa_code: item.kfa_code
		};
	});
}

// Base URL helper
export function getBaseUrl() {
	return getConfig().base_url;
}