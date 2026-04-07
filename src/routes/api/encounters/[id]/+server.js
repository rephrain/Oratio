import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import {
	encounters, statusHistory, encounterOdontograms, odontogramDetails,
	encounterPrescriptions,
	encounterReferrals, encounterItems, patients, users, terminologyMaster
} from '$lib/server/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

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
			encounter_reason_code: terminologyMaster.code,
			encounter_reason_display: terminologyMaster.display
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

		// Odontogram details — join terminology_master for ICD-10 and ICD-9-CM display names
		let odontoDetails = [];
		if (odontograms.length > 0) {
			const icd10Term = alias(terminologyMaster, 'icd10_term');
			const icd9cmTerm = alias(terminologyMaster, 'icd9cm_term');

			const rawDetails = await db.select({
				id: odontogramDetails.id,
				odontogram_id: odontogramDetails.odontogram_id,
				tooth_number: odontogramDetails.tooth_number,
				surface: odontogramDetails.surface,
				keadaan: odontogramDetails.keadaan,
				bahan_restorasi: odontogramDetails.bahan_restorasi,
				restorasi: odontogramDetails.restorasi,
				protesa: odontogramDetails.protesa,
				bahan_protesa: odontogramDetails.bahan_protesa,
				icd10_id: odontogramDetails.icd10_id,
				is_primary: odontogramDetails.is_primary,
				icd9cm_id: odontogramDetails.icd9cm_id,
				icd10_code: icd10Term.code,
				icd10_display: icd10Term.display,
				icd9cm_code: icd9cmTerm.code,
				icd9cm_display: icd9cmTerm.display,
				created_at: odontogramDetails.created_at
			})
				.from(odontogramDetails)
				.leftJoin(icd10Term, eq(odontogramDetails.icd10_id, icd10Term.id))
				.leftJoin(icd9cmTerm, eq(odontogramDetails.icd9cm_id, icd9cmTerm.id))
				.where(eq(odontogramDetails.odontogram_id, odontograms[0].id));

			odontoDetails = rawDetails;
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

	// Handle encounter_reason FK update
	if (body.reason_code !== undefined) {
		if (body.reason_code) {
			const [existing] = await db.select()
				.from(terminologyMaster)
				.where(and(
					eq(terminologyMaster.code, body.reason_code),
					eq(terminologyMaster.system, 'SNOMED')
				))
				.limit(1);

			if (existing) {
				updateData.encounter_reason_id = existing.id;
			} else if (body.reason_display) {
				const [inserted] = await db.insert(terminologyMaster).values({
					code: body.reason_code,
					display: body.reason_display,
					system: 'SNOMED'
				}).returning();
				updateData.encounter_reason_id = inserted.id;
			}
		} else {
			updateData.encounter_reason_id = null;
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
				dosage_form: rx.dosage_form || null,
				dosage: rx.dosage,
				quantity: rx.quantity || 1,
				instruction: rx.instruction || rx.notes || ''
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
				// Resolve icd10_id from code if only code+display provided (no UUID)
				let icd10Id = d.icd10_id || null;
				if (!icd10Id && d.diagnosis_code) {
					const [existing] = await db.select()
						.from(terminologyMaster)
						.where(and(
							eq(terminologyMaster.code, d.diagnosis_code),
							eq(terminologyMaster.system, 'ICD-10')
						))
						.limit(1);
					if (existing) {
						icd10Id = existing.id;
					} else if (d.diagnosis_display) {
						const [inserted] = await db.insert(terminologyMaster).values({
							code: d.diagnosis_code,
							display: d.diagnosis_display,
							system: 'ICD-10'
						}).returning();
						icd10Id = inserted.id;
					}
				}

				// Resolve icd9cm_id from code if only code+display provided (no UUID)
				let icd9cmId = d.icd9cm_id || null;
				if (!icd9cmId && d.procedure_code) {
					const [existing] = await db.select()
						.from(terminologyMaster)
						.where(and(
							eq(terminologyMaster.code, d.procedure_code),
							eq(terminologyMaster.system, 'ICD-9-CM')
						))
						.limit(1);
					if (existing) {
						icd9cmId = existing.id;
					} else if (d.procedure_display) {
						const [inserted] = await db.insert(terminologyMaster).values({
							code: d.procedure_code,
							display: d.procedure_display,
							system: 'ICD-9-CM'
						}).returning();
						icd9cmId = inserted.id;
					}
				}

				await db.insert(odontogramDetails).values({
					odontogram_id: odonto.id,
					tooth_number: d.tooth_number,
					surface: d.surface || '',
					keadaan: d.keadaan,
					bahan_restorasi: d.bahan_restorasi,
					restorasi: d.restorasi,
					protesa: d.protesa,
					bahan_protesa: d.bahan_protesa,
					icd10_id: icd10Id,
					is_primary: d.is_primary || false,
					icd9cm_id: icd9cmId
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
