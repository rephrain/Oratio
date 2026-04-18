import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { users, shifts } from '$lib/server/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

// GET /api/doctors - list doctors with optional shift filter
export async function GET({ url }) {
	const dayOfWeekInput = url.searchParams.get('day');
	const availableOnly = url.searchParams.get('available') === 'true';
	const activeOnly = url.searchParams.get('active') !== 'false';

	let conditions = [eq(users.role, 'dokter')];
	if (activeOnly) conditions.push(eq(users.is_active, true));

	const doctors = await db.select({
		id: users.id,
		name: users.name,
		doctor_code: users.doctor_code,
		profile_image_url: users.profile_image_url,
		is_active: users.is_active
	}).from(users).where(and(...conditions));

	// Calculate current shift status for all doctors
	const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
	const today = now.getDay();
	const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }); // "HH:mm:ss"

	const shiftsToday = await db.select().from(shifts)
		.where(and(
			eq(shifts.day_of_week, today),
			sql`${shifts.start_time} <= ${currentTime}`,
			sql`${shifts.end_time} > ${currentTime}`
		));

	const activeUserIds = new Set(shiftsToday.map(s => s.user_id));

	// If available-only filter is on, filter them first
	let results = doctors;
	if (availableOnly) {
		results = doctors.filter(d => activeUserIds.has(d.id));
	}

	// Map final enrichment
	const enrichedDoctors = results.map(d => ({
		...d,
		has_active_shift: activeUserIds.has(d.id),
		// Include relevant shift for this specific moment if useful
		current_shift: shiftsToday.find(s => s.user_id === d.id) || null
	}));

	// If specific day filter was requested (for scheduling view), we might need different logic
	// but the user's current request is about the "Search and Design" of dropdowns.
	// We'll keep the day-specific logic if dayOfWeekInput is present but enrich it similarly.
	if (dayOfWeekInput !== null && dayOfWeekInput !== undefined) {
		const targetDay = parseInt(dayOfWeekInput);
		const dayShifts = await db.select().from(shifts)
			.where(eq(shifts.day_of_week, targetDay));

		const doctorIdsWithShifts = new Set(dayShifts.map(s => s.user_id));
		const filtered = doctors.filter(d => doctorIdsWithShifts.has(d.id));

		return json({
			doctors: filtered.map(d => ({
				...d,
				has_active_shift: targetDay === today ? activeUserIds.has(d.id) : false,
				shifts: dayShifts.filter(s => s.user_id === d.id)
			}))
		});
	}

	return json({ doctors: enrichedDoctors });
}
