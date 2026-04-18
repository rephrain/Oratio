import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { db } from '$lib/server/db/index.js';
import { patients, documents, patientAllergy, patientDiseaseHistory, patientMedication, terminologyMaster } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { generatePatientProfilePdf } from '$lib/server/pdfGenerator.js';

/**
 * GET /api/patients/:id/pdf
 * Serves the stored patient profile PDF, or regenerates on the fly if missing.
 */
export async function GET({ params, url }) {
	const { id } = params;

	try {
		// 1. Find patient
		const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
		if (!patient) {
			return json({ error: 'Patient not found' }, { status: 404 });
		}

		// 2. Try to serve stored PDF
		if (patient.profile_document_id) {
			const [doc] = await db.select().from(documents).where(eq(documents.id, patient.profile_document_id)).limit(1);
			if (doc && doc.file_path && fs.existsSync(doc.file_path)) {
				const buffer = fs.readFileSync(doc.file_path);
				return new Response(buffer, {
					status: 200,
					headers: {
						'Content-Type': 'application/pdf',
						'Content-Disposition': `inline; filename="${doc.file_name}"`,
						'Content-Length': buffer.length.toString()
					}
				});
			}
		}

		// 3. Fallback: regenerate on the fly
		const allergies = await db.select({
			substance: terminologyMaster.display,
			reaction: patientAllergy.reaction,
			reaction_display: patientAllergy.reaction_display,
		}).from(patientAllergy)
			.leftJoin(terminologyMaster, eq(patientAllergy.substance_id, terminologyMaster.id))
			.where(eq(patientAllergy.patient_id, id));

		const diseases = await db.select({
			type: patientDiseaseHistory.type,
			disease: terminologyMaster.display,
			description: patientDiseaseHistory.description,
		}).from(patientDiseaseHistory)
			.leftJoin(terminologyMaster, eq(patientDiseaseHistory.terminology_id, terminologyMaster.id))
			.where(eq(patientDiseaseHistory.patient_id, id));

		const medications = await db.select({
			medication: terminologyMaster.display,
			dosage_form: patientMedication.dosage_form,
			dosage: patientMedication.dosage,
			note: patientMedication.note,
		}).from(patientMedication)
			.leftJoin(terminologyMaster, eq(patientMedication.terminology_id, terminologyMaster.id))
			.where(eq(patientMedication.patient_id, id));

		const origin = new URL(params.id ? `/api/patients/${id}/pdf` : '', url.origin).href;
		const pdfBuffer = await generatePatientProfilePdf({ patient, allergies, diseases, medications, origin });

		return new Response(pdfBuffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `inline; filename="patient-profile-${id}.pdf"`,
				'Content-Length': pdfBuffer.length.toString()
			}
		});
	} catch (error) {
		console.error('[PDF] Error generating patient PDF:', error);
		return json({ error: 'Failed to generate PDF' }, { status: 500 });
	}
}

/**
 * POST /api/patients/:id/pdf
 * Explicitly regenerates the patient profile PDF and saves it to the database.
 */
export async function POST({ params, url, locals }) {
	const { id } = params;

	try {
		// 1. Find patient
		const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
		if (!patient) {
			return json({ error: 'Patient not found' }, { status: 404 });
		}

		// Gather data
		const allergies = await db.select({
			substance: terminologyMaster.display,
			reaction: patientAllergy.reaction,
			reaction_display: patientAllergy.reaction_display,
		}).from(patientAllergy)
			.leftJoin(terminologyMaster, eq(patientAllergy.substance_id, terminologyMaster.id))
			.where(eq(patientAllergy.patient_id, id));

		const diseases = await db.select({
			type: patientDiseaseHistory.type,
			disease: terminologyMaster.display,
			description: patientDiseaseHistory.description,
			code: terminologyMaster.code
		}).from(patientDiseaseHistory)
			.leftJoin(terminologyMaster, eq(patientDiseaseHistory.terminology_id, terminologyMaster.id))
			.where(eq(patientDiseaseHistory.patient_id, id));

		const medications = await db.select({
			medication: terminologyMaster.display,
			dosage_form: patientMedication.dosage_form,
			dosage: patientMedication.dosage,
			note: patientMedication.note,
		}).from(patientMedication)
			.leftJoin(terminologyMaster, eq(patientMedication.terminology_id, terminologyMaster.id))
			.where(eq(patientMedication.patient_id, id));

		const origin = new URL(url.pathname, url.origin).href;
		
		const pdfBuffer = await generatePatientProfilePdf({ 
			patient, 
			allergies, 
			diseases, 
			medications, 
			origin 
		});

		// Save PDF to disk
		const uploadDir = path.resolve('data', 'uploads', 'patients', id);
		fs.mkdirSync(uploadDir, { recursive: true });
		const fileName = `patient-profile-${id}.pdf`;
		const filePath = path.join(uploadDir, fileName);
		fs.writeFileSync(filePath, pdfBuffer);

		// Insert document record
		const [doc] = await db.insert(documents).values({
			patient_id: id,
			document_type: 'patient_profile',
			file_name: fileName,
			file_path: filePath,
			mime_type: 'application/pdf',
			file_size: pdfBuffer.length,
			uploaded_by: locals?.user?.id || null
		}).returning();

		// Update patient with profile_document_id
		await db.update(patients)
			.set({ profile_document_id: doc.id })
			.where(eq(patients.id, id));

		return json({ message: 'PDF regenerated successfully', documentId: doc.id }, { status: 200 });
	} catch (error) {
		console.error('[PDF] Error regenerating patient PDF:', error);
		return json({ error: 'Failed to regenerate PDF' }, { status: 500 });
	}
}
