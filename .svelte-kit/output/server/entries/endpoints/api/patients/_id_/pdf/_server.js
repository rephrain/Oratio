import { j as json } from "../../../../../../chunks/index.js";
import fs from "fs";
import "path";
import { d as db, p as patients, e as documents, t as terminologyMaster, b as patientAllergy, a as patientDiseaseHistory, c as patientMedication } from "../../../../../../chunks/index3.js";
import { eq } from "drizzle-orm";
import { g as generatePatientProfilePdf } from "../../../../../../chunks/pdfGenerator.js";
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
export {
  GET
};
