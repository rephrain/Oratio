import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { users, shifts } from '$lib/server/db/schema.js';
import { ne } from 'drizzle-orm';

/** GET /api/chat/users — List all dokter & kasir users (excluding current user) */
export async function GET({ locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const allUsers = await db
		.select({
			id: users.id,
			name: users.name,
			role: users.role,
			profile_image_url: users.profile_image_url,
			doctor_code: users.doctor_code
		})
		.from(users)
		.where(
			ne(users.id, locals.user.id)
		);

	// Fetch all current shifts to determine online status
	const allShifts = await db.select().from(shifts);

	const nowWIB = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
	const currentDayOfWeek = nowWIB.getDay(); // 0 is Sunday, 6 is Saturday
	const currentHours = nowWIB.getHours();
	const currentMinutes = nowWIB.getMinutes();
	const currentTime = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}:00`;

	// Filter to only dokter and kasir roles and add online status
	const filtered = allUsers
		.filter(u => u.role === 'dokter' || u.role === 'kasir')
		.map(u => {
			const is_online = allShifts.some(shift => 
				shift.user_id === u.id &&
				shift.day_of_week === currentDayOfWeek &&
				shift.start_time <= currentTime &&
				shift.end_time >= currentTime
			);
			return { ...u, is_online };
		});

	return json({ users: filtered });
}
