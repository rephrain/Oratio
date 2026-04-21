import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { sql, eq, and } from 'drizzle-orm';
import { users, encounters, patients, shifts } from '$lib/server/db/schema.js';

export async function GET({ locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// 1. Recent Activity (Latest Encounters)
		const recentActivity = await db.select({
			id: encounters.id,
			status: encounters.status,
			updated_at: encounters.updated_at,
			doctor_name: users.name,
			doctor_code: users.doctor_code,
			role: users.role,
			patient_name: patients.nama_lengkap
		})
		.from(encounters)
		.leftJoin(users, eq(encounters.doctor_id, users.id))
		.leftJoin(patients, eq(encounters.patient_id, patients.id))
		.orderBy(sql`${encounters.updated_at} DESC`)
		.limit(5);

		const formattedActivity = recentActivity.map(act => {
			let actionDesc = 'Record updated';
			if (act.status === 'Arrived' || act.status === 'Planned') actionDesc = 'Patient Checked In';
			if (act.status === 'In Progress') actionDesc = 'Consultation Started';
			if (act.status === 'Completed' || act.status === 'Discharged') actionDesc = 'Consultation Finished';

			return {
				user_name: act.doctor_name || 'System',
				user_initials: act.doctor_name ? (act.doctor_name.replace('Dr. ', '').substring(0, 2).toUpperCase()) : 'SYS',
				role: act.role === 'dokter' ? 'Doctor' : act.role === 'kasir' ? 'Cashier' : 'Admin',
				action: actionDesc,
				status: act.status,
				timestamp: act.updated_at,
				active: act.status === 'In Progress'
			};
		});

		// 2. On Shift Now
		const now = new Date();
		const options = { timeZone: 'Asia/Jakarta' };
		const jakartaTime = new Date(now.toLocaleString('en-US', options));
		
		const dayOfWeek = jakartaTime.getDay();
		const currentTime = jakartaTime.getHours().toString().padStart(2, '0') + ':' + 
							jakartaTime.getMinutes().toString().padStart(2, '0') + ':00';

		const activeShiftsQuery = await db.select({
			user_name: users.name,
			user_code: users.doctor_code,
			start_time: shifts.start_time,
			end_time: shifts.end_time
		})
		.from(shifts)
		.innerJoin(users, eq(shifts.user_id, users.id))
		.where(
			and(
				eq(shifts.day_of_week, dayOfWeek),
				sql`${shifts.start_time} <= ${currentTime}`,
				sql`${shifts.end_time} >= ${currentTime}`
			)
		);

		const onShiftNow = activeShiftsQuery.map(shift => ({
			name: shift.user_name,
			initials: shift.user_name.replace('Dr. ', '').substring(0, 2).toUpperCase(),
			room: 'General Room', // fallback as no room concept
			code: shift.user_code
		}));

		return json({
			recentActivity: formattedActivity,
			onShiftNow
		});

	} catch (err) {
		console.error("Dashboard API error:", err);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
