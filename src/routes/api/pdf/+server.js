import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { encounters, encounterPrescriptions, encounterDiagnoses, encounterProcedures, encounterOdontograms, odontogramDetails, patients, users } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { generatePatientProfilePDF, generateSOAPPDF, generateOdontogramPDF } from '$lib/server/pdf.js';

export async function GET({ url }) {
	const type = url.searchParams.get('type'); // 'patient' | 'soap' | 'odontogram'
	const encounterId = url.searchParams.get('encounter_id');
	const patientId = url.searchParams.get('patient_id');

	try {
		if (type === 'patient' && patientId) {
			const [patient] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
			if (!patient) return json({ error: 'Patient not found' }, { status: 404 });
			const docDef = generatePatientProfilePDF(patient, [], [], []);
			return json({ docDefinition: docDef });
		}

		if ((type === 'soap' || type === 'odontogram') && encounterId) {
			const [enc] = await db.select().from(encounters).where(eq(encounters.id, encounterId)).limit(1);
			if (!enc) return json({ error: 'Encounter not found' }, { status: 404 });

			const [patient] = await db.select().from(patients).where(eq(patients.id, enc.patient_id)).limit(1);
			const [doctor] = await db.select().from(users).where(eq(users.id, enc.doctor_id)).limit(1);
			const prescriptions = await db.select().from(encounterPrescriptions).where(eq(encounterPrescriptions.encounter_id, encounterId));
			const diagnoses = await db.select().from(encounterDiagnoses).where(eq(encounterDiagnoses.encounter_id, encounterId));
			const procedures = await db.select().from(encounterProcedures).where(eq(encounterProcedures.encounter_id, encounterId));

			if (type === 'odontogram') {
				const odontograms = await db.select().from(encounterOdontograms).where(eq(encounterOdontograms.encounter_id, encounterId));
				let details = [];
				if (odontograms.length > 0) {
					details = await db.select().from(odontogramDetails).where(eq(odontogramDetails.odontogram_id, odontograms[0].id));
				}
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
