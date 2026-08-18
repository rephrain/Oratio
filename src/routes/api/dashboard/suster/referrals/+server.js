import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { encounterReferrals, encounters, patients, users, doctorSuster } from '$lib/server/db/schema.js';
import { eq, desc, and, sql, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals }) {
	if (!locals.user || locals.user.role !== 'suster') {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Get assigned doctor codes via doctorSuster → users
		const assignedDoctors = await db
			.select({ doctor_code: users.doctor_code })
			.from(doctorSuster)
			.innerJoin(users, eq(doctorSuster.doctor_id, users.id))
			.where(eq(doctorSuster.suster_id, locals.user.id));

		const doctorCodes = assignedDoctors
			.map(d => d.doctor_code)
			.filter(Boolean);

		if (doctorCodes.length === 0) {
			return json({ data: [] });
		}

		const senderDoctor = alias(users, 'sender_doctor');

		const referralsData = await db
			.select({
				id: encounterReferrals.id,
				referral_date: encounterReferrals.referral_date,
				note: encounterReferrals.note,
				sender_name: senderDoctor.name,
				sender_profile_image: senderDoctor.profile_image_url,
				patient_name: patients.nama_lengkap,
				patient_id: patients.id,
				target_doctor_code: encounterReferrals.doctor_code
			})
			.from(encounterReferrals)
			.innerJoin(encounters, eq(encounterReferrals.encounter_id, encounters.id))
			.innerJoin(senderDoctor, eq(encounters.doctor_id, senderDoctor.id))
			.innerJoin(patients, eq(encounters.patient_id, patients.id))
			.where(
				and(
					inArray(encounterReferrals.doctor_code, doctorCodes),
					sql`DATE(${encounterReferrals.referral_date}) >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date`
				)
			)
			.orderBy(desc(encounterReferrals.created_at));

		return json({ data: referralsData });
	} catch (err) {
		console.error('Error fetching suster referrals:', err);
		return json({ error: 'Failed to fetch referrals' }, { status: 500 });
	}
}
