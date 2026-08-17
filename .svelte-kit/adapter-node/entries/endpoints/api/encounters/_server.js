import { j as json } from "../../../../chunks/index.js";
import { e as encounters, u as users, d as db, p as patients, t as terminologyMaster, h as documents, i as statusHistory } from "../../../../chunks/index3.js";
import { sql, eq, and, desc, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { g as getOrCreateTerminology } from "../../../../chunks/terminology.js";
import { a as emitPatientEvent, b as emitQueueEvent, c as emitDashboardEvent } from "../../../../chunks/realtimeService.js";
async function GET({ url, locals }) {
  const date = url.searchParams.get("date");
  const dateFrom = url.searchParams.get("date_from");
  const dateTo = url.searchParams.get("date_to");
  const doctorId = url.searchParams.get("doctor_id");
  const status = url.searchParams.get("status");
  const patientId = url.searchParams.get("patient_id");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;
  let conditions = [];
  if (dateFrom && dateTo) {
    conditions.push(sql`DATE(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') >= ${dateFrom}`);
    conditions.push(sql`DATE(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') <= ${dateTo}`);
  } else if (date) {
    conditions.push(sql`DATE(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') = ${date}`);
  }
  if (doctorId && doctorId !== "all")
    conditions.push(eq(encounters.doctor_id, doctorId));
  if (status)
    conditions.push(eq(encounters.status, status));
  if (patientId)
    conditions.push(eq(encounters.patient_id, patientId));
  if (locals.user?.role === "dokter" && !patientId && !doctorId) {
    conditions.push(eq(encounters.doctor_id, locals.user.id));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
  const doctors = alias(users, "doctors");
  const kasirs = alias(users, "kasirs");
  const data = await db.select({
    encounter: encounters,
    patient: patients,
    patient_name: patients.nama_lengkap,
    patient_nik: patients.nik,
    doctor_name: doctors.name,
    doctor_code: doctors.doctor_code,
    kasir_name: kasirs.name,
    kasir_profile_image: kasirs.profile_image_url,
    encounter_reason_display: terminologyMaster.display
  }).from(encounters).leftJoin(patients, eq(encounters.patient_id, patients.id)).leftJoin(doctors, eq(encounters.doctor_id, doctors.id)).leftJoin(kasirs, eq(encounters.kasir_id, kasirs.id)).leftJoin(terminologyMaster, eq(encounters.encounter_reason_id, terminologyMaster.id)).where(whereClause).orderBy(desc(encounters.created_at)).limit(limit).offset(offset);
  const selectedEncounterIds = data.map((d) => d.encounter.id);
  let allClinicalPhotos = [];
  if (selectedEncounterIds.length > 0) {
    allClinicalPhotos = await db.select({
      id: documents.id,
      encounter_id: documents.encounter_id,
      file_name: documents.file_name,
      mime_type: documents.mime_type
    }).from(documents).where(
      and(
        inArray(documents.encounter_id, selectedEncounterIds),
        eq(documents.document_type, "clinical_photo")
      )
    );
  }
  const photoMap = {};
  for (const photo of allClinicalPhotos) {
    if (!photoMap[photo.encounter_id])
      photoMap[photo.encounter_id] = [];
    photoMap[photo.encounter_id].push(photo);
  }
  const mergedData = data.map((d) => ({
    ...d,
    clinical_photos: photoMap[d.encounter.id] || []
  }));
  return json({ data: mergedData });
}
async function POST({ request, locals }) {
  try {
    const body = await request.json();
    const [doctor] = await db.select().from(users).where(eq(users.id, body.doctor_id)).limit(1);
    if (!doctor || doctor.role !== "dokter") {
      return json({ error: "Invalid doctor" }, { status: 400 });
    }
    const jakartaNow = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const encPrefix = `${jakartaNow.getFullYear()}${String(jakartaNow.getMonth() + 1).padStart(2, "0")}${doctor.doctor_code}`;
    const [{ maxSeq }] = await db.select({
      maxSeq: sql`COALESCE(MAX(CASE WHEN ${encounters.id} LIKE ${encPrefix + "%"} THEN CAST(SUBSTRING(${encounters.id}, ${encPrefix.length + 1}) AS INTEGER) ELSE 0 END), 0)`
    }).from(encounters);
    let nextSeq = Number(maxSeq) + 1;
    let encId = encPrefix + String(nextSeq).padStart(6, "0");
    while (true) {
      const [existing] = await db.select({ id: encounters.id }).from(encounters).where(eq(encounters.id, encId)).limit(1);
      if (!existing)
        break;
      nextSeq++;
      encId = encPrefix + String(nextSeq).padStart(6, "0");
    }
    const [{ maxQueue }] = await db.select({
      maxQueue: sql`COALESCE(MAX(${encounters.queue_number}), 0)`
    }).from(encounters).where(sql`DATE(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date`);
    const queueNumber = Number(maxQueue) + 1;
    let encounterReasonId = null;
    const complaintCode = body.chief_complaint_code;
    const complaintDisplay = body.chief_complaint_display;
    if (complaintCode && complaintDisplay) {
      encounterReasonId = await getOrCreateTerminology(complaintCode, complaintDisplay, "SNOMED");
    }
    const [encounter] = await db.insert(encounters).values({
      id: encId,
      patient_id: body.patient_id,
      kasir_id: locals?.user?.id || null,
      doctor_id: body.doctor_id,
      queue_number: queueNumber,
      form_mode: body.form_mode || "SOAP",
      status: "Planned",
      encounter_reason_id: encounterReasonId,
      reason_type: body.reason_type || null
    }).returning();
    if (body.tekanan_darah) {
      await db.update(patients).set({ tekanan_darah: body.tekanan_darah }).where(eq(patients.id, body.patient_id));
      emitPatientEvent("patient_updated", body.patient_id, { tekanan_darah: body.tekanan_darah }, locals?.user?.id);
    }
    await db.insert(statusHistory).values({
      encounter_id: encId,
      status: "Arrived",
      start_at: /* @__PURE__ */ new Date()
    });
    const eventPayload = {
      encounter,
      patient_name: body.patient_name || "Patient",
      doctor_name: doctor.name,
      queue_number: queueNumber
    };
    emitQueueEvent("queue_created", eventPayload, locals?.user?.id);
    emitDashboardEvent("encounter_created", eventPayload, locals?.user?.id);
    return json({ encounter, queue_number: queueNumber }, { status: 201 });
  } catch (err) {
    console.error("POST /api/encounters error:", err);
    return json({ error: "Internal Error", message: String(err?.message || err) }, { status: 500 });
  }
}
export {
  GET,
  POST
};
