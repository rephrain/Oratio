import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { patients, patientDiseaseHistory, patientAllergy, patientMedication } from '$lib/server/db/schema.js';
import { eq, or, ilike, desc, sql } from 'drizzle-orm';
import { generatePatientId } from '$lib/utils/formatters.js';

// GET /api/patients - list/search
export async function GET({ url }) {
	const search = url.searchParams.get('search') || '';
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '20');
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

// POST /api/patients - create
export async function POST({ request }) {
	const body = await request.json();

	// Generate next patient ID
	const [last] = await db.select({ id: patients.id })
		.from(patients)
		.orderBy(desc(patients.id))
		.limit(1);

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
		citizenship: body.citizenship || 'WNI',
		language: body.language || 'id',
		blood_type: body.blood_type,
		rhesus: body.rhesus || null,
		pregnancy_status: body.pregnancy_status || false
	}).returning();

	// Insert disease history
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

	// Insert allergies
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

	// Insert medications
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
