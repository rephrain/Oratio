import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { shifts } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export async function GET({ locals }) {
	if (!locals.user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	try {
		const userShifts = await db.select()
			.from(shifts)
			.where(eq(shifts.user_id, locals.user.id));

		return json({ data: userShifts });
	} catch (error) {
		console.error('[API] Error fetching shifts:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
