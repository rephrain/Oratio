import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { encounterReferrals, encounters, patients, users } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals }) {
	if (!locals.user || locals.user.role !== 'dokter') {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const doctorCode = locals.user.doctor_code;
	if (!doctorCode) {
		return json({ data: [] });
	}

	// Alias for the sender doctor
	const senderDoctor = alias(users, 'sender_doctor');

	try {
		const referralsData = await db
			.select({
				id: encounterReferrals.id,
				referral_date: encounterReferrals.referral_date,
				note: encounterReferrals.note,
				sender_name: senderDoctor.name,
				sender_profile_image: senderDoctor.profile_image_url,
				patient_name: patients.nama_lengkap,
				patient_id: patients.id
			})
			.from(encounterReferrals)
			.innerJoin(encounters, eq(encounterReferrals.encounter_id, encounters.id))
			.innerJoin(senderDoctor, eq(encounters.doctor_id, senderDoctor.id))
			.innerJoin(patients, eq(encounters.patient_id, patients.id))
			.where(eq(encounterReferrals.doctor_code, doctorCode))
			.orderBy(desc(encounterReferrals.created_at));

		return json({ data: referralsData });
	} catch (err) {
		console.error('Error fetching referrals:', err);
		return json({ error: 'Failed to fetch referrals' }, { status: 500 });
	}
}
