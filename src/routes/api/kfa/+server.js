import { json } from '@sveltejs/kit';
import { searchKFA } from '$lib/server/satusehat.js';

export async function GET({ url }) {
	const query = url.searchParams.get('query') || '';
	const page = parseInt(url.searchParams.get('page') || '1');
	const size = parseInt(url.searchParams.get('size') || '10');

	if (!query || query.length < 2) {
		return json({ results: [] });
	}

	try {
		const results = await searchKFA(query, page, size);
		return json({ results });
	} catch (error) {
		console.error('KFA search error:', error);
		return json({ error: error.message, results: [] }, { status: 500 });
	}
}
