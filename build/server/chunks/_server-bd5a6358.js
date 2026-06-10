import { j as json } from './index-d7f43214.js';
import { u as users, d as db, v as encounterReferrals, p as patients, e as encounters } from './index3-775267d5.js';
import { eq, and, sql, desc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import 'postgres';
import 'drizzle-orm/postgres-js';

async function GET({ locals }) {
  if (!locals.user || locals.user.role !== "dokter") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const doctorCode = locals.user.doctor_code;
  if (!doctorCode) {
    return json({ data: [] });
  }
  const senderDoctor = alias(users, "sender_doctor");
  try {
    const referralsData = await db.select({
      id: encounterReferrals.id,
      referral_date: encounterReferrals.referral_date,
      note: encounterReferrals.note,
      sender_name: senderDoctor.name,
      sender_profile_image: senderDoctor.profile_image_url,
      patient_name: patients.nama_lengkap,
      patient_id: patients.id
    }).from(encounterReferrals).innerJoin(encounters, eq(encounterReferrals.encounter_id, encounters.id)).innerJoin(senderDoctor, eq(encounters.doctor_id, senderDoctor.id)).innerJoin(patients, eq(encounters.patient_id, patients.id)).where(
      and(
        eq(encounterReferrals.doctor_code, doctorCode),
        sql`DATE(${encounterReferrals.referral_date}) >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date`
      )
    ).orderBy(desc(encounterReferrals.created_at));
    return json({ data: referralsData });
  } catch (err) {
    console.error("Error fetching referrals:", err);
    return json({ error: "Failed to fetch referrals" }, { status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server-bd5a6358.js.map
