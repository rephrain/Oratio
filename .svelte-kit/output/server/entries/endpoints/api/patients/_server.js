import { j as json } from "../../../../chunks/index.js";
import { d as db, p as patients, t as terminologyMaster, a as patientDiseaseHistory, b as patientAllergy, c as patientMedication, e as documents } from "../../../../chunks/index3.js";
import { or, ilike, desc, sql, and, eq } from "drizzle-orm";
import { a as generatePatientId } from "../../../../chunks/formatters.js";
import { g as generatePatientProfilePdf } from "../../../../chunks/pdfGenerator.js";
import fs from "fs";
import path from "path";
async function GET({ url }) {
  const search = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;
  let query = db.select().from(patients);
  if (search) {
    query = query.where(
      or(
        ilike(patients.nama_lengkap, `%${search}%`),
        ilike(patients.nik, `%${search}%`),
        ilike(patients.id, `%${search}%`)
      )
    );
  }
  const data = await query.orderBy(desc(patients.created_at)).limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql`count(*)` }).from(patients);
  return json({ data, total: Number(count), page, limit });
}
async function POST({ request, locals }) {
  const body = await request.json();
  const [last] = await db.select({ id: patients.id }).from(patients).orderBy(desc(patients.id)).limit(1);
  const newId = generatePatientId(last?.id);
  const [patient] = await db.insert(patients).values({
    id: newId,
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
    kasir_id: locals?.user?.id || null
  }).returning();
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
        patient_id: newId,
        type: h.type || "personal",
        terminology_id: termId,
        description: h.description || null
      });
    }
  }
  if (body.allergies?.length) {
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
        patient_id: newId,
        substance_id: substanceId,
        reaction: a.reaction_code || null,
        reaction_display: a.reaction_display || null
      });
    }
  }
  if (body.medications?.length) {
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
        patient_id: newId,
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
    const uploadDir = path.resolve("data", "uploads", "patients", newId);
    fs.mkdirSync(uploadDir, { recursive: true });
    const fileName = `patient-profile-${newId}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);
    const [doc] = await db.insert(documents).values({
      patient_id: newId,
      document_type: "patient_profile",
      file_name: fileName,
      file_path: filePath,
      mime_type: "application/pdf",
      file_size: pdfBuffer.length,
      uploaded_by: locals?.user?.id || null
    }).returning();
    await db.update(patients).set({ profile_document_id: doc.id }).where(eq(patients.id, newId));
    console.log(`[PDF] Patient profile PDF generated: ${filePath}`);
  } catch (pdfErr) {
    console.error("[PDF] Failed to generate patient profile PDF:", pdfErr);
  }
  return json({ patient }, { status: 201 });
}
export {
  GET,
  POST
};
