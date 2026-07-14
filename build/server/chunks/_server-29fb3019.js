import { j as json } from './index-d7f43214.js';
import fs from 'fs';
import path from 'path';
import { d as db, p as patients, g as documents, t as terminologyMaster, c as patientAllergy, b as patientDiseaseHistory, f as patientMedication } from './index3-0e5c3567.js';
import { eq } from 'drizzle-orm';
import { b as generatePatientProfilePdf } from './pdfGenerator-e554d1d6.js';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';
import 'puppeteer';

async function GET({ params, url }) {
  const { id } = params;
  try {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    if (!patient) {
      return json({ error: "Patient not found" }, { status: 404 });
    }
    if (patient.profile_document_id) {
      const [doc] = await db.select().from(documents).where(eq(documents.id, patient.profile_document_id)).limit(1);
      if (doc && doc.file_path && fs.existsSync(doc.file_path)) {
        const buffer = fs.readFileSync(doc.file_path);
        return new Response(buffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${doc.file_name}"`,
            "Content-Length": buffer.length.toString()
          }
        });
      }
    }
    const allergies = await db.select({
      substance: terminologyMaster.display,
      reaction: patientAllergy.reaction,
      reaction_display: patientAllergy.reaction_display
    }).from(patientAllergy).leftJoin(terminologyMaster, eq(patientAllergy.substance_id, terminologyMaster.id)).where(eq(patientAllergy.patient_id, id));
    const diseases = await db.select({
      type: patientDiseaseHistory.type,
      disease: terminologyMaster.display,
      description: patientDiseaseHistory.description
    }).from(patientDiseaseHistory).leftJoin(terminologyMaster, eq(patientDiseaseHistory.terminology_id, terminologyMaster.id)).where(eq(patientDiseaseHistory.patient_id, id));
    const medications = await db.select({
      medication: terminologyMaster.display,
      dosage_form: patientMedication.dosage_form,
      dosage: patientMedication.dosage,
      note: patientMedication.note
    }).from(patientMedication).leftJoin(terminologyMaster, eq(patientMedication.terminology_id, terminologyMaster.id)).where(eq(patientMedication.patient_id, id));
    const origin = new URL(params.id ? `/api/patients/${id}/pdf` : "", url.origin).href;
    const pdfBuffer = await generatePatientProfilePdf({ patient, allergies, diseases, medications, origin });
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="patient-profile-${id}.pdf"`,
        "Content-Length": pdfBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error("[PDF] Error generating patient PDF:", error);
    return json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
async function POST({ params, url, locals }) {
  const { id } = params;
  try {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    if (!patient) {
      return json({ error: "Patient not found" }, { status: 404 });
    }
    const allergies = await db.select({
      substance: terminologyMaster.display,
      reaction: patientAllergy.reaction,
      reaction_display: patientAllergy.reaction_display
    }).from(patientAllergy).leftJoin(terminologyMaster, eq(patientAllergy.substance_id, terminologyMaster.id)).where(eq(patientAllergy.patient_id, id));
    const diseases = await db.select({
      type: patientDiseaseHistory.type,
      disease: terminologyMaster.display,
      description: patientDiseaseHistory.description,
      code: terminologyMaster.code
    }).from(patientDiseaseHistory).leftJoin(terminologyMaster, eq(patientDiseaseHistory.terminology_id, terminologyMaster.id)).where(eq(patientDiseaseHistory.patient_id, id));
    const medications = await db.select({
      medication: terminologyMaster.display,
      dosage_form: patientMedication.dosage_form,
      dosage: patientMedication.dosage,
      note: patientMedication.note
    }).from(patientMedication).leftJoin(terminologyMaster, eq(patientMedication.terminology_id, terminologyMaster.id)).where(eq(patientMedication.patient_id, id));
    const origin = new URL(url.pathname, url.origin).href;
    const pdfBuffer = await generatePatientProfilePdf({
      patient,
      allergies,
      diseases,
      medications,
      origin
    });
    const uploadDir = path.resolve("data", "uploads", "patients", id);
    fs.mkdirSync(uploadDir, { recursive: true });
    const fileName = `patient-profile-${id}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);
    const [doc] = await db.insert(documents).values({
      patient_id: id,
      document_type: "patient_profile",
      file_name: fileName,
      file_path: filePath,
      mime_type: "application/pdf",
      file_size: pdfBuffer.length,
      uploaded_by: locals?.user?.id || null
    }).returning();
    await db.update(patients).set({ profile_document_id: doc.id }).where(eq(patients.id, id));
    return json({ message: "PDF regenerated successfully", documentId: doc.id }, { status: 200 });
  } catch (error) {
    console.error("[PDF] Error regenerating patient PDF:", error);
    return json({ error: "Failed to regenerate PDF" }, { status: 500 });
  }
}

export { GET, POST };
//# sourceMappingURL=_server-29fb3019.js.map
