import { json } from '@sveltejs/kit';
import { searchKFA } from '$lib/server/satusehat.js';

export async function GET({ url }) {
	const query = url.searchParams.get('query') || '';

	if (!query || query.length < 2) {
		return json({ results: [] });
	}

	try {
		const data = await searchKFA(query);
		const results = (data.entry || []).map(e => ({
			code: e.resource?.code?.coding?.[0]?.code || '',
			display: e.resource?.code?.coding?.[0]?.display || e.resource?.code?.text || ''
		}));
		return json({ results });
	} catch (error) {
		return json({ error: error.message, results: [] }, { status: 500 });
	}
}
