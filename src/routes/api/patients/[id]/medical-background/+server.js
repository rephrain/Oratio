import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import {
	patientAllergy, patientDiseaseHistory, patientMedication, terminologyMaster
} from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
	const { id } = params;

	try {
		const allergies = await db.select({
			id: patientAllergy.id,
			reaction: patientAllergy.reaction,
			reaction_display: patientAllergy.reaction_display,
			substance: terminologyMaster.display
		})
		.from(patientAllergy)
		.leftJoin(terminologyMaster, eq(patientAllergy.substance_id, terminologyMaster.id))
		.where(eq(patientAllergy.patient_id, id));

		const diseases = await db.select({
			id: patientDiseaseHistory.id,
			type: patientDiseaseHistory.type,
			description: patientDiseaseHistory.description,
			disease: terminologyMaster.display
		})
		.from(patientDiseaseHistory)
		.leftJoin(terminologyMaster, eq(patientDiseaseHistory.terminology_id, terminologyMaster.id))
		.where(eq(patientDiseaseHistory.patient_id, id));

		const medications = await db.select({
			id: patientMedication.id,
			product_name: patientMedication.product_name,
			dosage_form: patientMedication.dosage_form,
			dosage: patientMedication.dosage,
			note: patientMedication.note,
			medication: terminologyMaster.display
		})
		.from(patientMedication)
		.leftJoin(terminologyMaster, eq(patientMedication.terminology_id, terminologyMaster.id))
		.where(eq(patientMedication.patient_id, id));

		return json({
			allergies,
			diseases,
			medications
		});
	} catch (error) {
		console.error(error);
		return json({ error: 'Failed to fetch medical background' }, { status: 500 });
	}
}
