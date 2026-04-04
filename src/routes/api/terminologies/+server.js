import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { terminologyMaster } from '$lib/server/db/schema.js';
import { eq, or, ilike, and } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const term = url.searchParams.get('term') || '';
	const system = url.searchParams.get('system'); // 'ICD-10', 'ICD-9-CM', etc.
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);

	if (!term || term.length < 2) {
		return json({ results: [] });
	}

	try {
		let conditions = [
			or(
				ilike(terminologyMaster.display, `%${term}%`),
				ilike(terminologyMaster.code, `%${term}%`)
			)
		];

		if (system) {
			conditions.push(eq(terminologyMaster.system, system));
		}

		const results = await db.select()
			.from(terminologyMaster)
			.where(and(...conditions))
			.limit(limit);

		return json({
			results: results.map(r => ({
				value: r.code,
				label: r.display,
				id: r.id
			}))
		});
	} catch (error) {
		console.error('Terminology search error:', error);
		return json({ error: 'Search failed', results: [] }, { status: 500 });
	}
}
