import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { shifts, doctorSuster } from '$lib/server/db/schema.js';
import { eq, inArray } from 'drizzle-orm';

export async function GET({ locals }) {
	if (!locals.user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	try {
		// If user is a suster, fetch shifts of their designated/assigned doctors
		if (locals.user.role === 'suster') {
			const assignedDocs = await db.select({ doctor_id: doctorSuster.doctor_id })
				.from(doctorSuster)
				.where(eq(doctorSuster.suster_id, locals.user.id));

			const doctorIds = assignedDocs.map(d => d.doctor_id).filter(Boolean);

			if (doctorIds.length === 0) {
				return json({ data: [] });
			}

			const userShifts = await db.select()
				.from(shifts)
				.where(inArray(shifts.user_id, doctorIds));

			return json({ data: userShifts });
		}

		// For dokter, kasir, admin, etc.: fetch their own shifts directly
		const userShifts = await db.select()
			.from(shifts)
			.where(eq(shifts.user_id, locals.user.id));

		return json({ data: userShifts });
	} catch (error) {
		console.error('[API] Error fetching shifts:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
