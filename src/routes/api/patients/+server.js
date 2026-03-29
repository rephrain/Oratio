import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { patients, patientDiseaseHistory, patientAllergy, patientMedication, terminologyMaster } from '$lib/server/db/schema.js';
import { eq, and, or, ilike, desc, sql } from 'drizzle-orm';
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
export async function POST({ request, locals }) {
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
		communication_language: body.communication_language || 'id',
		doctor_code: body.doctor_code || null,
		blood_type: body.blood_type,
		rhesus: body.rhesus || null,
		pregnancy_status: body.pregnancy_status || false,
		tekanan_darah: body.tekanan_darah || null,
		kasir_id: locals?.user?.id || null
	}).returning();

	// Insert disease history (using FK to terminology_master)
	if (body.disease_history && Array.isArray(body.disease_history)) {
		for (const h of body.disease_history) {
			if (!h.code || !h.display) continue;

			// Get or create terminology record
			let termId;
			const [existing] = await db.select()
				.from(terminologyMaster)
				.where(and(
					eq(terminologyMaster.code, h.code),
					eq(terminologyMaster.system, h.system || 'SNOMED')
				))
				.limit(1);

			if (existing) {
				termId = existing.id;
			} else {
				const [inserted] = await db.insert(terminologyMaster).values({
					code: h.code,
					display: h.display,
					system: h.system || 'SNOMED'
				}).returning();
				termId = inserted.id;
			}

			// Link in patient history
			await db.insert(patientDiseaseHistory).values({
				patient_id: newId,
				type: h.type || 'personal',
				terminology_id: termId,
				description: h.description || null
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

	// Insert medications (using FK to terminology_master for KFA code)
	if (body.medications?.length) {
		for (const m of body.medications) {
			let termId = null;
			if (m.kfa_code) {
				const [existing] = await db.select()
					.from(terminologyMaster)
					.where(and(
						eq(terminologyMaster.code, m.kfa_code),
						eq(terminologyMaster.system, 'KFA')
					))
					.limit(1);

				if (existing) {
					termId = existing.id;
				} else {
					const [inserted] = await db.insert(terminologyMaster).values({
						code: m.kfa_code,
						display: m.product_name || m.display || '',
						system: 'KFA'
					}).returning();
					termId = inserted.id;
				}
			}

			await db.insert(patientMedication).values({
				patient_id: newId,
				terminology_id: termId,
				kfa_code: m.kfa_code || m.code || null,
				product_name: m.product_name || m.display || null,
				dosage_form: m.dosage_form || null,
				dosage: m.dosage,
				note: m.note
			});
		}
	}

	return json({ patient }, { status: 201 });
}
