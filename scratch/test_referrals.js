
import { db } from './src/lib/server/db/index.js';
import { encounterReferrals, encounters, patients, users } from './src/lib/server/db/schema.js';
import { eq, desc, and, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

async function testReferrals() {
    const doctorCode = 'D01'; // Assuming a test doctor code
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
            .where(
                and(
                    eq(encounterReferrals.doctor_code, doctorCode),
                    sql`DATE(${encounterReferrals.referral_date}) <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date`
                )
            )
            .orderBy(desc(encounterReferrals.created_at));

        console.log('Referrals found:', referralsData.length);
        console.log(JSON.stringify(referralsData, null, 2));
    } catch (err) {
        console.error('Error fetching referrals:', err);
    }
    process.exit(0);
}

testReferrals();
