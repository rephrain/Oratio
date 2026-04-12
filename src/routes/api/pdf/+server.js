import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import {
	encounters, encounterPrescriptions, encounterOdontograms,
	odontogramTeeth, odontogramSurfaces, odontogramDiagnoses, odontogramProcedures,
	patients, users, patientDiseaseHistory, patientAllergy, patientMedication, terminologyMaster
} from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { generatePatientProfilePDF, generateSOAPPDF, generateOdontogramPDF } from '$lib/server/pdf.js';

export async function GET({ url }) {
	const type = url.searchParams.get('type'); // 'patient' | 'soap' | 'odontogram'
	const encounterId = url.searchParams.get('encounter_id');
	const patientId = url.searchParams.get('patient_id');

	try {
		if (type === 'patient' && patientId) {
			const [patient] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
			if (!patient) return json({ error: 'Patient not found' }, { status: 404 });
			
			const history = await db.select({
				type: patientDiseaseHistory.type,
				description: patientDiseaseHistory.description,
				display: terminologyMaster.display
			}).from(patientDiseaseHistory)
			.leftJoin(terminologyMaster, eq(patientDiseaseHistory.terminology_id, terminologyMaster.id))
			.where(eq(patientDiseaseHistory.patient_id, patientId));

			const allergies = await db.select({
				substance_display: terminologyMaster.display,
				reaction_display: patientAllergy.reaction_display
			}).from(patientAllergy)
			.leftJoin(terminologyMaster, eq(patientAllergy.substance_id, terminologyMaster.id))
			.where(eq(patientAllergy.patient_id, patientId));

			const medications = await db.select({
				product_name: terminologyMaster.display,
				dosage: patientMedication.dosage
			}).from(patientMedication)
			.leftJoin(terminologyMaster, eq(patientMedication.terminology_id, terminologyMaster.id))
			.where(eq(patientMedication.patient_id, patientId));

			const docDef = generatePatientProfilePDF(patient, history, allergies, medications);
			return json({ docDefinition: docDef });
		}

		if ((type === 'soap' || type === 'odontogram') && encounterId) {
			const [enc] = await db.select().from(encounters).where(eq(encounters.id, encounterId)).limit(1);
			if (!enc) return json({ error: 'Encounter not found' }, { status: 404 });

			const [patient] = await db.select().from(patients).where(eq(patients.id, enc.patient_id)).limit(1);
			const [doctor] = await db.select().from(users).where(eq(users.id, enc.doctor_id)).limit(1);
			
			const prescriptions = await db.select({
				product_name: terminologyMaster.display,
				dosage: encounterPrescriptions.dosage,
				quantity: encounterPrescriptions.quantity,
				notes: encounterPrescriptions.notes
			}).from(encounterPrescriptions)
			.leftJoin(terminologyMaster, eq(encounterPrescriptions.terminology_id, terminologyMaster.id))
			.where(eq(encounterPrescriptions.encounter_id, encounterId));

			const odontograms = await db.select().from(encounterOdontograms).where(eq(encounterOdontograms.encounter_id, encounterId));
			let details = [];
			if (odontograms.length > 0) {
				const odontoId = odontograms[0].id;
				const teeth = await db.select().from(odontogramTeeth)
					.where(eq(odontogramTeeth.odontogram_id, odontoId));

				for (const tooth of teeth) {
					const surfaces = await db.select().from(odontogramSurfaces)
						.where(eq(odontogramSurfaces.tooth_id, tooth.id));

					const icd10Term = alias(terminologyMaster, 'icd10_term');
					const toothDiagnoses = await db.select({
						icd10_code: icd10Term.code,
						icd10_display: icd10Term.display,
						is_primary: odontogramDiagnoses.is_primary
					}).from(odontogramDiagnoses)
						.leftJoin(icd10Term, eq(odontogramDiagnoses.icd10_id, icd10Term.id))
						.where(eq(odontogramDiagnoses.tooth_id, tooth.id));

					const icd9cmTerm = alias(terminologyMaster, 'icd9cm_term');
					const toothProcedures = await db.select({
						icd9cm_code: icd9cmTerm.code,
						icd9cm_display: icd9cmTerm.display
					}).from(odontogramProcedures)
						.leftJoin(icd9cmTerm, eq(odontogramProcedures.icd9cm_id, icd9cmTerm.id))
						.where(eq(odontogramProcedures.tooth_id, tooth.id));

					// Flatten: one detail per surface (or per tooth if no surfaces)
					const surfaceList = surfaces.length > 0 ? surfaces : [{ surface: '', restorasi: null, bahan_restorasi: null }];
					for (const s of surfaceList) {
						details.push({
							tooth_number: tooth.tooth_number,
							surface: s.surface,
							keadaan: tooth.keadaan,
							restorasi: s.restorasi,
							bahan_restorasi: s.bahan_restorasi,
							protesa: tooth.protesa,
							bahan_protesa: tooth.bahan_protesa,
							diagnosis_code: toothDiagnoses[0]?.icd10_code || null,
							diagnosis_display: toothDiagnoses[0]?.icd10_display || null,
							procedure_code: toothProcedures[0]?.icd9cm_code || null,
							procedure_display: toothProcedures[0]?.icd9cm_display || null,
						});
					}
				}
			}

			// Aggregate findings for SOAP
			const diagnoses = details.filter(d => d.diagnosis_code).map(d => ({
				code: d.diagnosis_code,
				display: d.diagnosis_display,
				is_primary: false // default
			}));

			const procedures = details.filter(d => d.procedure_code).map(d => ({
				code: d.procedure_code,
				display: d.procedure_display,
				tooth_number: d.tooth_number
			}));

			if (type === 'odontogram') {
				const docDef = generateOdontogramPDF(enc, patient, odontograms[0], details, doctor);
				return json({ docDefinition: docDef });
			}

			const docDef = generateSOAPPDF(enc, patient, prescriptions, diagnoses, procedures, doctor);
			return json({ docDefinition: docDef });
		}

		return json({ error: 'Invalid parameters' }, { status: 400 });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
