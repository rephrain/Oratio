import { j as json } from "../../../../chunks/index.js";
import { d as db, p as patients, b as patientDiseaseHistory, c as patientAllergy, f as patientMedication, g as documents } from "../../../../chunks/index3.js";
import { or, ilike, sql, eq, asc, desc } from "drizzle-orm";
import { b as generatePatientProfilePdf } from "../../../../chunks/pdfGenerator.js";
import fs from "fs";
import path from "path";
import { a as emitPatientEvent } from "../../../../chunks/realtimeService.js";
import { g as getOrCreateTerminology } from "../../../../chunks/terminology.js";
async function GET({ url }) {
  const search = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;
  const sortKey = url.searchParams.get("sort") || "created_at";
  const sortDir = url.searchParams.get("dir") || "desc";
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
  let orderFunc = sortDir === "asc" ? asc : desc;
  let sortColumn = patients[sortKey] || patients.created_at;
  const data = await query.orderBy(orderFunc(sortColumn)).limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql`count(*)` }).from(patients);
  return json({ data, total: Number(count), page, limit });
}
async function POST({ request, locals }) {
  const body = await request.json();
  const [{ maxNum }] = await db.select({
    maxNum: sql`COALESCE(MAX(CASE WHEN ${patients.id} ~ '^O[0-9]+$' THEN CAST(SUBSTRING(${patients.id}, 2) AS INTEGER) ELSE 0 END), 0)`
  }).from(patients);
  let nextNum = Number(maxNum) + 1;
  let newId = "O" + String(nextNum).padStart(6, "0");
  while (true) {
    const [existing] = await db.select({ id: patients.id }).from(patients).where(eq(patients.id, newId)).limit(1);
    if (!existing)
      break;
    nextNum++;
    newId = "O" + String(nextNum).padStart(6, "0");
  }
  const [patient] = await db.insert(patients).values({
    id: newId,
    nik: body.nik && body.nik.trim() ? body.nik.trim() : null,
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
      const termId = await getOrCreateTerminology(h.code, h.display, h.system || "SNOMED");
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
      const substanceId = await getOrCreateTerminology(a.substance_code, a.substance_display, "SNOMED");
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
        termId = await getOrCreateTerminology(kfaCode, productName, "KFA");
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
  emitPatientEvent("patient_created", newId, { patient }, locals?.user?.id);
  return json({ patient }, { status: 201 });
}
export {
  GET,
  POST
};
