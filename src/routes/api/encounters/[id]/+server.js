import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import {
	encounters, statusHistory, encounterOdontograms, odontogramDetails,
	encounterPrescriptions,
	encounterReferrals, encounterItems, patients, users, terminologyMaster
} from '$lib/server/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

// GET /api/encounters/[id] - full encounter detail
export async function GET({ params }) {
	try {
		const [encounter] = await db.select({
			encounter: encounters,
			patient_name: patients.nama_lengkap,
			patient_nik: patients.nik,
			patient_birth_date: patients.birth_date,
			patient_gender: patients.gender,
			patient_handphone: patients.handphone,
			patient_address: patients.address,
			patient_email: patients.email,
			patient_blood_type: patients.blood_type,
			patient_rhesus: patients.rhesus,
			patient_pregnancy_status: patients.pregnancy_status,
			patient_tekanan_darah: patients.tekanan_darah,
			doctor_name: users.name,
			doctor_code: users.doctor_code,
			keluhan_utama_code: terminologyMaster.code,
			keluhan_utama_display: terminologyMaster.display
		})
			.from(encounters)
			.leftJoin(patients, eq(encounters.patient_id, patients.id))
			.leftJoin(users, eq(encounters.doctor_id, users.id))
			.leftJoin(terminologyMaster, eq(encounters.encounter_reason_id, terminologyMaster.id))
			.where(eq(encounters.id, params.id))
			.limit(1);

		if (!encounter) {
			return json({ error: 'Encounter not found' }, { status: 404 });
		}

		const referrals = await db.select().from(encounterReferrals)
			.where(eq(encounterReferrals.encounter_id, params.id));

		const items = await db.select().from(encounterItems)
			.where(eq(encounterItems.encounter_id, params.id));

		const odontograms = await db.select().from(encounterOdontograms)
			.where(eq(encounterOdontograms.encounter_id, params.id));

		let odontoDetails = [];
		if (odontograms.length > 0) {
			odontoDetails = await db.select().from(odontogramDetails)
				.where(eq(odontogramDetails.odontogram_id, odontograms[0].id));
		}

		const history = await db.select().from(statusHistory)
			.where(eq(statusHistory.encounter_id, params.id));

		return json({
			...encounter,
			referrals,
			items,
			odontograms,
			odontogramDetails: odontoDetails,
			statusHistory: history
		});
	} catch (err) {
		console.error("GET /api/encounters error:", err);
		return json({ message: 'Internal Error', error: String(err) }, { status: 500 });
	}
}

// PUT /api/encounters/[id] - update encounter (SOAP data + status)
export async function PUT({ params, request }) {
	const body = await request.json();

	const updateData = {};
	if (body.subjective !== undefined) updateData.subjective = body.subjective;
	if (body.objective !== undefined) updateData.objective = body.objective;
	if (body.assessment !== undefined) updateData.assessment = body.assessment;
	if (body.plan !== undefined) updateData.plan = body.plan;
	if (body.resep !== undefined) updateData.resep = body.resep;
	if (body.keterangan !== undefined) updateData.keterangan = body.keterangan;
	if (body.reason_type !== undefined) updateData.reason_type = body.reason_type;
	if (body.form_mode !== undefined) updateData.form_mode = body.form_mode;

	// Handle keluhan_utama FK update
	if (body.keluhan_utama_code !== undefined) {
		if (body.keluhan_utama_code) {
			const { and: andOp, eq: eqOp } = await import('drizzle-orm');
			const [existing] = await db.select()
				.from(terminologyMaster)
				.where(andOp(
					eqOp(terminologyMaster.code, body.keluhan_utama_code),
					eqOp(terminologyMaster.system, 'SNOMED')
				))
				.limit(1);

			if (existing) {
				updateData.keluhan_utama_id = existing.id;
			} else if (body.keluhan_utama_display) {
				const [inserted] = await db.insert(terminologyMaster).values({
					code: body.keluhan_utama_code,
					display: body.keluhan_utama_display,
					system: 'SNOMED'
				}).returning();
				updateData.keluhan_utama_id = inserted.id;
			}
		} else {
			updateData.keluhan_utama_id = null;
		}
	}

	// Status transition
	if (body.status) {
		updateData.status = body.status;

		// End previous status history
		const statusMap = {
			'In Progress': 'In Progress',
			'Discharged': 'Finished',
			'Completed': 'Finished'
		};

		// End only open status_history entries (end_at IS NULL)
		await db.update(statusHistory)
			.set({ end_at: new Date() })
			.where(and(
				eq(statusHistory.encounter_id, params.id),
				sql`${statusHistory.end_at} IS NULL`
			));

		// Start new status history if applicable
		const historyStatus = statusMap[body.status];
		if (historyStatus) {
			await db.insert(statusHistory).values({
				encounter_id: params.id,
				status: historyStatus,
				start_at: new Date()
			});
		}
	}

	updateData.updated_at = new Date();

	const [updated] = await db.update(encounters)
		.set(updateData)
		.where(eq(encounters.id, params.id))
		.returning();

	// Update patient BP if provided
	if (body.tekanan_darah !== undefined) {
		const [enc] = await db.select({ patient_id: encounters.patient_id })
			.from(encounters)
			.where(eq(encounters.id, params.id))
			.limit(1);

		if (enc?.patient_id) {
			await db.update(patients)
				.set({ tekanan_darah: body.tekanan_darah })
				.where(eq(patients.id, enc.patient_id));
		}
	}

	// Upsert prescriptions
	if (body.prescriptions) {
		await db.delete(encounterPrescriptions).where(eq(encounterPrescriptions.encounter_id, params.id));
		for (const rx of body.prescriptions) {
			const kfaCode = rx.kfa_code;
			const productName = rx.product_name;

			let termId = null;
			if (kfaCode && productName) {
				const [existing] = await db.select()
					.from(terminologyMaster)
					.where(and(
						eq(terminologyMaster.code, kfaCode),
						eq(terminologyMaster.system, 'KFA')
					))
					.limit(1);

				if (existing) {
					termId = existing.id;
				} else {
					const [inserted] = await db.insert(terminologyMaster).values({
						code: kfaCode,
						display: productName,
						system: 'KFA'
					}).returning();
					termId = inserted.id;
				}
			}

			await db.insert(encounterPrescriptions).values({
				encounter_id: params.id,
				terminology_id: termId,
				dosage: rx.dosage,
				quantity: rx.quantity || 1,
				notes: rx.notes || ''
			});
		}
	}

	// Upsert referrals
	if (body.referrals) {
		await db.delete(encounterReferrals).where(eq(encounterReferrals.encounter_id, params.id));
		for (const r of body.referrals) {
			await db.insert(encounterReferrals).values({
				encounter_id: params.id,
				doctor_code: r.doctor_code,
				referral_date: r.referral_date,
				note: r.note
			});
		}
	}

	// Upsert odontogram
	if (body.odontogram) {
		await db.delete(encounterOdontograms).where(eq(encounterOdontograms.encounter_id, params.id));
		const [odonto] = await db.insert(encounterOdontograms).values({
			encounter_id: params.id,
			dentition_type: body.odontogram.dentition_type || 'Adult',
			occlusi: body.odontogram.occlusi,
			torus_palatinus: body.odontogram.torus_palatinus,
			torus_mandibularis: body.odontogram.torus_mandibularis,
			palatum: body.odontogram.palatum,
			diastema: body.odontogram.diastema || 'Tidak Ada',
			gigi_anomali: body.odontogram.gigi_anomali || 'Tidak Ada'
		}).returning();

		if (body.odontogram.details) {
			for (const d of body.odontogram.details) {
				await db.insert(odontogramDetails).values({
					odontogram_id: odonto.id,
					tooth_number: d.tooth_number,
					surface: d.surface,
					keadaan: d.keadaan,
					bahan_restorasi: d.bahan_restorasi,
					restorasi: d.restorasi,
					protesa: d.protesa,
					bahan_protesa: d.bahan_protesa,
					icd10_id: d.icd10_id || null,
					icd9cm_id: d.icd9cm_id || null
				});
			}
		}
	}

	// Upsert encounter items
	if (body.encounter_items) {
		await db.delete(encounterItems).where(eq(encounterItems.encounter_id, params.id));
		for (const item of body.encounter_items) {
			const subtotal = (item.quantity || 1) * parseInt(item.price_at_time || 0);
			await db.insert(encounterItems).values({
				encounter_id: params.id,
				item_id: item.item_id,
				quantity: item.quantity || 1,
				price_at_time: parseInt(item.price_at_time || 0),
				subtotal: subtotal
			});
		}
	}

	return json({ encounter: updated });
}
