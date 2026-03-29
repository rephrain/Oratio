import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { users, shifts } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';

// GET /api/doctors - list doctors with optional shift filter
export async function GET({ url }) {
	const dayOfWeek = url.searchParams.get('day');
	const activeOnly = url.searchParams.get('active') !== 'false';

	let conditions = [eq(users.role, 'dokter')];
	if (activeOnly) conditions.push(eq(users.is_active, true));

	const doctors = await db.select({
		id: users.id,
		name: users.name,
		doctor_code: users.doctor_code,
		is_active: users.is_active
	}).from(users).where(and(...conditions));

	// If day filter, get only doctors with shifts on that day
	if (dayOfWeek !== null && dayOfWeek !== undefined) {
		const shiftData = await db.select().from(shifts)
			.where(eq(shifts.day_of_week, parseInt(dayOfWeek)));

		const doctorIdsWithShifts = new Set(shiftData.map(s => s.doctor_id));
		const filtered = doctors.filter(d => doctorIdsWithShifts.has(d.id));

		return json({
			doctors: filtered.map(d => ({
				...d,
				shifts: shiftData.filter(s => s.doctor_id === d.id)
			}))
		});
	}

	return json({ doctors });
}
