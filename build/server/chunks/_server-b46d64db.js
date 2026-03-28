import { j as json } from './index-d7f43214.js';
import { d as db, p as patients, b as patientDiseaseHistory, c as patientAllergy, e as patientMedication } from './index3-6552ad5d.js';
import { or, ilike, desc, sql } from 'drizzle-orm';
import { a as generatePatientId } from './formatters-d73cbc72.js';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';

async function GET({ url }) {
  const search = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;
  let query = db.select().from(patients);
  if (search) {
    query = query.where(
      or(
        ilike(patients.nama_lengkap, `%${search}%`),
        ilike(patients.nik, `%${search}%`),
        ilike(patients.id, `%${search}%`)
      )
    );
  }
  const data = await query.orderBy(desc(patients.created_at)).limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql`count(*)` }).from(patients);
  return json({ data, total: Number(count), page, limit });
}
async function POST({ request, locals }) {
  const body = await request.json();
  const [last] = await db.select({ id: patients.id }).from(patients).orderBy(desc(patients.id)).limit(1);
  const newId = generatePatientId(last?.id);
  const [patient] = await db.insert(patients).values({
    id: newId,
    nik: body.nik,
    nama_lengkap: body.nama_lengkap,
    birth_date: body.birth_date,
    birthplace: body.birthplace,
    gender: body.gender,
    nomor_kk: body.nomor_kk,
    address: body.address,
    province: body.province,
    city: body.city,
    district: body.district,
    village: body.village,
    rt: body.rt,
    rw: body.rw,
    handphone: body.handphone,
    email: body.email,
    marital_status: body.marital_status || null,
    citizenship: body.citizenship || "WNI",
    language: body.language || "id",
    blood_type: body.blood_type,
    rhesus: body.rhesus || null,
    pregnancy_status: body.pregnancy_status || false,
    user_id: locals?.user?.id || null
  }).returning();
  if (body.disease_history?.length) {
    for (const h of body.disease_history) {
      await db.insert(patientDiseaseHistory).values({
        patient_id: newId,
        type: h.type,
        terminology_id: h.terminology_id || null,
        description: h.description
      });
    }
  }
  if (body.allergies?.length) {
    for (const a of body.allergies) {
      await db.insert(patientAllergy).values({
        patient_id: newId,
        substance_code: a.substance_code,
        substance_display: a.substance_display,
        reaction_code: a.reaction_code,
        reaction_display: a.reaction_display
      });
    }
  }
  if (body.medications?.length) {
    for (const m of body.medications) {
      await db.insert(patientMedication).values({
        patient_id: newId,
        code: m.code,
        display: m.display,
        dosage: m.dosage,
        note: m.note
      });
    }
  }
  return json({ patient }, { status: 201 });
}

export { GET, POST };
//# sourceMappingURL=_server-b46d64db.js.map
