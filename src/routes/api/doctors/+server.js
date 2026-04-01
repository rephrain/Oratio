import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { users, shifts } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';

// GET /api/doctors - list doctors with optional shift filter
export async function GET({ url }) {
	const dayOfWeek = url.searchParams.get('day');
	const available = url.searchParams.get('available') === 'true';
	const activeOnly = url.searchParams.get('active') !== 'false';

	let conditions = [eq(users.role, 'dokter')];
	if (activeOnly) conditions.push(eq(users.is_active, true));

	const doctors = await db.select({
		id: users.id,
		name: users.name,
		doctor_code: users.doctor_code,
		is_active: users.is_active
	}).from(users).where(and(...conditions));

	// 1. Filter by current availability (now)
	if (available) {
		const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
		const today = now.getDay();
		const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }); // "HH:mm:ss"

		const activeShifts = await db.select().from(shifts)
			.where(and(
				eq(shifts.day_of_week, today),
				sql`${shifts.start_time} <= ${currentTime}`,
				sql`${shifts.end_time} > ${currentTime}`
			));

		const activeUserIds = new Set(activeShifts.map(s => s.user_id));
		const filtered = doctors.filter(d => activeUserIds.has(d.id));

		return json({
			doctors: filtered.map(d => ({
				...d,
				shifts: activeShifts.filter(s => s.user_id === d.id)
			}))
		});
	}

	// 2. If specific day filter, get only doctors with shifts on that day
	if (dayOfWeek !== null && dayOfWeek !== undefined) {
		const shiftData = await db.select().from(shifts)
			.where(eq(shifts.day_of_week, parseInt(dayOfWeek)));

		const doctorIdsWithShifts = new Set(shiftData.map(s => s.user_id));
		const filtered = doctors.filter(d => doctorIdsWithShifts.has(d.id));

		return json({
			doctors: filtered.map(d => ({
				...d,
				shifts: shiftData.filter(s => s.user_id === d.id)
			}))
		});
	}

	return json({ doctors });
}
