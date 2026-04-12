import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import {
	encounters, statusHistory, encounterOdontograms,
	odontogramTeeth, odontogramSurfaces, odontogramDiagnoses, odontogramProcedures,
	encounterPrescriptions,
	encounterReferrals, encounterItems, patients, users, terminologyMaster, documents
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

		// Odontogram details — query new normalized tables and flatten for frontend compatibility
		let odontoDetails = [];
		if (odontograms.length > 0) {
			const odontoId = odontograms[0].id;

			// Fetch teeth
			const teeth = await db.select().from(odontogramTeeth)
				.where(eq(odontogramTeeth.odontogram_id, odontoId));

			for (const tooth of teeth) {
				// Fetch surfaces for this tooth
				const surfaces = await db.select().from(odontogramSurfaces)
					.where(eq(odontogramSurfaces.tooth_id, tooth.id));

				// Fetch diagnoses for this tooth (with terminology join)
				const icd10Term = alias(terminologyMaster, 'icd10_term');
				const diagnoses = await db.select({
					id: odontogramDiagnoses.id,
					icd10_id: odontogramDiagnoses.icd10_id,
					is_primary: odontogramDiagnoses.is_primary,
					icd10_code: icd10Term.code,
					icd10_display: icd10Term.display
				})
					.from(odontogramDiagnoses)
					.leftJoin(icd10Term, eq(odontogramDiagnoses.icd10_id, icd10Term.id))
					.where(eq(odontogramDiagnoses.tooth_id, tooth.id));

				// Fetch procedures for this tooth (with terminology join)
				const icd9cmTerm = alias(terminologyMaster, 'icd9cm_term');
				const procedures = await db.select({
					id: odontogramProcedures.id,
					icd9cm_id: odontogramProcedures.icd9cm_id,
					icd9cm_code: icd9cmTerm.code,
					icd9cm_display: icd9cmTerm.display
				})
					.from(odontogramProcedures)
					.leftJoin(icd9cmTerm, eq(odontogramProcedures.icd9cm_id, icd9cmTerm.id))
					.where(eq(odontogramProcedures.tooth_id, tooth.id));

				// Flatten into legacy odontogramDetails format for frontend compatibility
				const primaryDiag = diagnoses.find(d => d.is_primary) || diagnoses[0] || null;
				const primaryProc = procedures[0] || null;

				// Build one flat record per surface (or one record if no surfaces)
				if (surfaces.length > 0) {
					for (const surf of surfaces) {
						odontoDetails.push({
							id: surf.id,
							odontogram_id: odontoId,
							tooth_number: tooth.tooth_number,
							surface: surf.surface,
							keadaan: tooth.keadaan,
							restorasi: surf.restorasi,
							bahan_restorasi: surf.bahan_restorasi,
							protesa: tooth.protesa,
							bahan_protesa: tooth.bahan_protesa,
							icd10_id: primaryDiag?.icd10_id || null,
							is_primary: primaryDiag?.is_primary || false,
							icd10_code: primaryDiag?.icd10_code || null,
							icd10_display: primaryDiag?.icd10_display || null,
							icd9cm_id: primaryProc?.icd9cm_id || null,
							icd9cm_code: primaryProc?.icd9cm_code || null,
							icd9cm_display: primaryProc?.icd9cm_display || null,
							created_at: tooth.created_at,
							// Include full arrays for advanced consumers
							all_diagnoses: diagnoses,
							all_procedures: procedures
						});
					}
				} else {
					// Tooth with no surface-level data
					odontoDetails.push({
						id: tooth.id,
						odontogram_id: odontoId,
						tooth_number: tooth.tooth_number,
						surface: '',
						keadaan: tooth.keadaan,
						restorasi: null,
						bahan_restorasi: null,
						protesa: tooth.protesa,
						bahan_protesa: tooth.bahan_protesa,
						icd10_id: primaryDiag?.icd10_id || null,
						is_primary: primaryDiag?.is_primary || false,
						icd10_code: primaryDiag?.icd10_code || null,
						icd10_display: primaryDiag?.icd10_display || null,
						icd9cm_id: primaryProc?.icd9cm_id || null,
						icd9cm_code: primaryProc?.icd9cm_code || null,
						icd9cm_display: primaryProc?.icd9cm_display || null,
						created_at: tooth.created_at,
						all_diagnoses: diagnoses,
						all_procedures: procedures
					});
				}
			}
		}

		const history = await db.select().from(statusHistory)
			.where(eq(statusHistory.encounter_id, params.id));

		const clinicalPhotos = await db.select({
			id: documents.id,
			file_name: documents.file_name,
			mime_type: documents.mime_type,
			created_at: documents.created_at
		})
			.from(documents)
			.where(and(
				eq(documents.encounter_id, params.id),
				eq(documents.document_type, 'clinical_photo')
			));

		const prescriptions = await db.select({
			id: encounterPrescriptions.id,
			terminology_id: encounterPrescriptions.terminology_id,
			kfa_code: terminologyMaster.code,
			product_name: terminologyMaster.display,
			dosage_form: encounterPrescriptions.dosage_form,
			dosage: encounterPrescriptions.dosage,
			quantity: encounterPrescriptions.quantity,
			instruction: encounterPrescriptions.instruction,
			created_at: encounterPrescriptions.created_at
		})
			.from(encounterPrescriptions)
			.leftJoin(terminologyMaster, eq(encounterPrescriptions.terminology_id, terminologyMaster.id))
			.where(eq(encounterPrescriptions.encounter_id, params.id));

		return json({
			...encounter,
			referrals,
			items,
			odontograms,
			odontogramDetails: odontoDetails,
			statusHistory: history,
			clinical_photos: clinicalPhotos,
			prescriptions
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

	// Auto-generate resep string from prescriptions if provided
	if (body.prescriptions && Array.isArray(body.prescriptions)) {
		const resepString = body.prescriptions
			.map((rx, i) => {
				const name = rx.product_name || 'Obat';
				const form = rx.dosage_form ? `(${rx.dosage_form})` : '';
				const dosage = rx.dosage ? ` - ${rx.dosage}` : '';
				const qty = rx.quantity ? `, Qty: ${rx.quantity}` : '';
				const instruction = rx.instruction || rx.notes ? `. ${rx.instruction || rx.notes}` : '';
				return `${i + 1}. ${name} ${form}${dosage}${qty}${instruction}`;
			})
			.join('\n');
		updateData.resep = resepString;
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

				// Insert into odontogramTeeth
				const [tooth] = await db.insert(odontogramTeeth).values({
					odontogram_id: odonto.id,
					tooth_number: d.tooth_number,
					keadaan: d.keadaan,
					protesa: d.protesa,
					bahan_protesa: d.bahan_protesa
				}).returning();

				// --- SURFACES ---
				if (Array.isArray(d.surfaces) && d.surfaces.length > 0) {
					for (const s of d.surfaces) {
						if (s.surface) {
							await db.insert(odontogramSurfaces).values({
								tooth_id: tooth.id,
								surface: s.surface,
								restorasi: s.restorasi,
								bahan_restorasi: s.bahan_restorasi
							});
						}
					}
				} else if (d.surface) {
					// Legacy fallback
					await db.insert(odontogramSurfaces).values({
						tooth_id: tooth.id,
						surface: d.surface,
						restorasi: d.restorasi,
						bahan_restorasi: d.bahan_restorasi
					});
				}

				// --- DIAGNOSES ---
				if (Array.isArray(d.diagnoses) && d.diagnoses.length > 0) {
					for (const diag of d.diagnoses) {
						let tempIcd10Id = diag.icd10_id || null;
						if (!tempIcd10Id && diag.diagnosis_code) {
							const [existing] = await db.select()
								.from(terminologyMaster)
								.where(and(eq(terminologyMaster.code, diag.diagnosis_code), eq(terminologyMaster.system, 'ICD-10')))
								.limit(1);
							if (existing) {
								tempIcd10Id = existing.id;
							} else if (diag.diagnosis_display) {
								const [inserted] = await db.insert(terminologyMaster).values({
									code: diag.diagnosis_code, display: diag.diagnosis_display, system: 'ICD-10'
								}).returning();
								tempIcd10Id = inserted.id;
							}
						}
						if (tempIcd10Id) {
							await db.insert(odontogramDiagnoses).values({
								tooth_id: tooth.id,
								icd10_id: tempIcd10Id,
								is_primary: diag.is_primary || false
							});
						}
					}
				} else if (icd10Id) {
					// Legacy fallback
					await db.insert(odontogramDiagnoses).values({
						tooth_id: tooth.id,
						icd10_id: icd10Id,
						is_primary: d.is_primary || false
					});
				}

				// --- PROCEDURES ---
				if (Array.isArray(d.procedures) && d.procedures.length > 0) {
					for (const proc of d.procedures) {
						let tempIcd9cmId = proc.icd9cm_id || null;
						if (!tempIcd9cmId && proc.procedure_code) {
							const [existing] = await db.select()
								.from(terminologyMaster)
								.where(and(eq(terminologyMaster.code, proc.procedure_code), eq(terminologyMaster.system, 'ICD-9-CM')))
								.limit(1);
							if (existing) {
								tempIcd9cmId = existing.id;
							} else if (proc.procedure_display) {
								const [inserted] = await db.insert(terminologyMaster).values({
									code: proc.procedure_code, display: proc.procedure_display, system: 'ICD-9-CM'
								}).returning();
								tempIcd9cmId = inserted.id;
							}
						}
						if (tempIcd9cmId) {
							await db.insert(odontogramProcedures).values({
								tooth_id: tooth.id,
								icd9cm_id: tempIcd9cmId
							});
						}
					}
				} else if (icd9cmId) {
					// Legacy fallback
					await db.insert(odontogramProcedures).values({
						tooth_id: tooth.id,
						icd9cm_id: icd9cmId
					});
				}
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
