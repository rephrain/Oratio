import { j as json } from './index-d7f43214.js';
import { d as db, p as patients, b as patientDiseaseHistory, t as terminologyMaster, c as patientAllergy, f as patientMedication, g as documents } from './index3-775267d5.js';
import { eq, and } from 'drizzle-orm';
import { b as generatePatientProfilePdf } from './pdfGenerator-e554d1d6.js';
import fs from 'fs';
import path from 'path';
import { a as emitPatientEvent } from './realtimeService-90f233c2.js';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';
import 'puppeteer';
import './realtimeEventBus-093e17ac.js';

async function GET({ params }) {
  const { id } = params;
  try {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    if (!patient) {
      return json({ error: "Patient not found" }, { status: 404 });
    }
    const diseases = await db.select({
      id: patientDiseaseHistory.id,
      type: patientDiseaseHistory.type,
      description: patientDiseaseHistory.description,
      code: terminologyMaster.code,
      display: terminologyMaster.display,
      system: terminologyMaster.system
    }).from(patientDiseaseHistory).leftJoin(terminologyMaster, eq(patientDiseaseHistory.terminology_id, terminologyMaster.id)).where(eq(patientDiseaseHistory.patient_id, id));
    const allergies = await db.select({
      id: patientAllergy.id,
      reaction_code: patientAllergy.reaction,
      reaction_display: patientAllergy.reaction_display,
      substance_code: terminologyMaster.code,
      substance_display: terminologyMaster.display
    }).from(patientAllergy).leftJoin(terminologyMaster, eq(patientAllergy.substance_id, terminologyMaster.id)).where(eq(patientAllergy.patient_id, id));
    const medications = await db.select({
      id: patientMedication.id,
      dosage_form: patientMedication.dosage_form,
      dosage: patientMedication.dosage,
      note: patientMedication.note,
      kfa_code: terminologyMaster.code,
      product_name: terminologyMaster.display
    }).from(patientMedication).leftJoin(terminologyMaster, eq(patientMedication.terminology_id, terminologyMaster.id)).where(eq(patientMedication.patient_id, id));
    return json({
      patient,
      diseases,
      allergies,
      medications
    });
  } catch (error) {
    console.error(error);
    return json({ error: "Failed to fetch patient detail" }, { status: 500 });
  }
}
async function PUT({ params, request, locals }) {
  const { id } = params;
  const body = await request.json();
  try {
    const [existingPatient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    if (!existingPatient) {
      return json({ error: "Patient not found" }, { status: 404 });
    }
    const [patient] = await db.update(patients).set({
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
      citizenship: body.citizenship || "WNI",
      blood_type: body.blood_type,
      rhesus: body.rhesus || null,
      pregnancy_status: body.pregnancy_status || false,
      tekanan_darah: body.tekanan_darah || null,
      updated_at: /* @__PURE__ */ new Date()
    }).where(eq(patients.id, id)).returning();
    await db.delete(patientDiseaseHistory).where(eq(patientDiseaseHistory.patient_id, id));
    if (body.disease_history && Array.isArray(body.disease_history)) {
      for (const h of body.disease_history) {
        if (!h.code || !h.display)
          continue;
        let termId;
        const [existing] = await db.select().from(terminologyMaster).where(and(
          eq(terminologyMaster.code, h.code),
          eq(terminologyMaster.system, h.system || "SNOMED")
        )).limit(1);
        if (existing) {
          termId = existing.id;
        } else {
          const [inserted] = await db.insert(terminologyMaster).values({
            code: h.code,
            display: h.display,
            system: h.system || "SNOMED"
          }).returning();
          termId = inserted.id;
        }
        await db.insert(patientDiseaseHistory).values({
          patient_id: id,
          type: h.type || "personal",
          terminology_id: termId,
          description: h.description || null
        });
      }
    }
    await db.delete(patientAllergy).where(eq(patientAllergy.patient_id, id));
    if (body.allergies && Array.isArray(body.allergies)) {
      for (const a of body.allergies) {
        if (!a.substance_code || !a.substance_display)
          continue;
        let substanceId = null;
        const [existing] = await db.select().from(terminologyMaster).where(and(
          eq(terminologyMaster.code, a.substance_code),
          eq(terminologyMaster.system, "SNOMED")
        )).limit(1);
        if (existing) {
          substanceId = existing.id;
        } else {
          const [inserted] = await db.insert(terminologyMaster).values({
            code: a.substance_code,
            display: a.substance_display,
            system: "SNOMED"
          }).returning();
          substanceId = inserted.id;
        }
        await db.insert(patientAllergy).values({
          patient_id: id,
          substance_id: substanceId,
          reaction: a.reaction_code || null,
          reaction_display: a.reaction_display || null
        });
      }
    }
    await db.delete(patientMedication).where(eq(patientMedication.patient_id, id));
    if (body.medications && Array.isArray(body.medications)) {
      for (const m of body.medications) {
        const kfaCode = m.kfa_code || m.code || null;
        const productName = m.product_name || m.display || null;
        const dosageForm = m.dosage_form || null;
        let termId = null;
        if (kfaCode && productName) {
          const [existing] = await db.select().from(terminologyMaster).where(and(
            eq(terminologyMaster.code, kfaCode),
            eq(terminologyMaster.system, "KFA")
          )).limit(1);
          if (existing) {
            termId = existing.id;
          } else {
            const [inserted] = await db.insert(terminologyMaster).values({
              code: kfaCode,
              display: productName,
              system: "KFA"
            }).returning();
            termId = inserted.id;
          }
        }
        await db.insert(patientMedication).values({
          patient_id: id,
          terminology_id: termId,
          dosage_form: dosageForm,
          dosage: m.dosage || null,
          note: m.note || null
        });
      }
    }
    try {
      const pdfAllergies = (body.allergies || []).filter((a) => a.substance_display).map((a) => ({
        substance: a.substance_display,
        reaction_display: a.reaction_display || a.reaction_code || null
      }));
      const pdfDiseases = (body.disease_history || []).filter((d) => d.display).map((d) => ({
        type: d.type || "personal",
        disease: d.display,
        code: d.code || null
      }));
      const pdfMedications = (body.medications || []).filter((m) => m.product_name || m.display).map((m) => ({
        medication: m.product_name || m.display,
        dosage_form: m.dosage_form || null,
        dosage: m.dosage || null,
        note: m.note || null
      }));
      const pdfBuffer = await generatePatientProfilePdf({
        patient,
        allergies: pdfAllergies,
        diseases: pdfDiseases,
        medications: pdfMedications
      });
      const uploadDir = path.resolve("data", "uploads", "patients", id);
      fs.mkdirSync(uploadDir, { recursive: true });
      const fileName = `patient-profile-${id}.pdf`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, pdfBuffer);
      let docId = patient.profile_document_id;
      if (docId) {
        await db.update(documents).set({
          file_size: pdfBuffer.length,
          created_at: /* @__PURE__ */ new Date()
        }).where(eq(documents.id, docId));
      } else {
        const [doc] = await db.insert(documents).values({
          patient_id: id,
          document_type: "patient_profile",
          file_name: fileName,
          file_path: filePath,
          mime_type: "application/pdf",
          file_size: pdfBuffer.length,
          uploaded_by: locals?.user?.id || null
        }).returning();
        docId = doc.id;
        await db.update(patients).set({ profile_document_id: docId }).where(eq(patients.id, id));
      }
    } catch (pdfErr) {
      console.error("[PDF] Failed to regenerate patient profile PDF in PUT:", pdfErr);
    }
    emitPatientEvent("patient_updated", id, { patient }, locals?.user?.id);
    return json({ success: true, patient });
  } catch (error) {
    console.error("Failed to update patient:", error);
    return json({ error: "Failed to update patient" }, { status: 500 });
  }
}

export { GET, PUT };
//# sourceMappingURL=_server-70ce8c50.js.map
