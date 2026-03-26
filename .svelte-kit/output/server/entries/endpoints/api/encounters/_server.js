import { j as json } from "../../../../chunks/index.js";
import { g as encounters, d as db, p as patients, u as users, s as statusHistory } from "../../../../chunks/index3.js";
import { gte, lte, eq, and, desc, sql } from "drizzle-orm";
import { g as generateEncounterId } from "../../../../chunks/formatters.js";
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
    const start = new Date(dateFrom);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    conditions.push(gte(encounters.created_at, start));
    conditions.push(lte(encounters.created_at, end));
  } else if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    conditions.push(gte(encounters.created_at, start));
    conditions.push(lte(encounters.created_at, end));
  }
  if (doctorId)
    conditions.push(eq(encounters.doctor_id, doctorId));
  if (status)
    conditions.push(eq(encounters.status, status));
  if (patientId)
    conditions.push(eq(encounters.patient_id, patientId));
  if (locals.user?.role === "dokter") {
    conditions.push(eq(encounters.doctor_id, locals.user.id));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
  const data = await db.select({
    encounter: encounters,
    patient_name: patients.nama_lengkap,
    patient_nik: patients.nik,
    doctor_name: users.name,
    doctor_code: users.doctor_code
  }).from(encounters).leftJoin(patients, eq(encounters.patient_id, patients.id)).leftJoin(users, eq(encounters.doctor_id, users.id)).where(whereClause).orderBy(desc(encounters.created_at)).limit(limit).offset(offset);
  return json({ data });
}
async function POST({ request, locals }) {
  const body = await request.json();
  const [doctor] = await db.select().from(users).where(eq(users.id, body.doctor_id)).limit(1);
  if (!doctor || doctor.role !== "dokter") {
    return json({ error: "Invalid doctor" }, { status: 400 });
  }
  const [lastEnc] = await db.select({ id: encounters.id }).from(encounters).where(eq(encounters.doctor_id, body.doctor_id)).orderBy(desc(encounters.id)).limit(1);
  const encId = generateEncounterId(doctor.doctor_code, lastEnc?.id);
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const [{ maxQueue }] = await db.select({
    maxQueue: sql`COALESCE(MAX(${encounters.queue_number}), 0)`
  }).from(encounters).where(gte(encounters.created_at, today));
  const queueNumber = Number(maxQueue) + 1;
  const [encounter] = await db.insert(encounters).values({
    id: encId,
    patient_id: body.patient_id,
    doctor_id: body.doctor_id,
    queue_number: queueNumber,
    form_mode: body.form_mode || "SOAP",
    status: "Planned",
    chief_complaint_code: body.chief_complaint_code || null,
    chief_complaint_display: body.chief_complaint_display || null,
    tekanan_darah: body.tekanan_darah || null,
    referral_source: body.referral_source || null
  }).returning();
  await db.insert(statusHistory).values({
    encounter_id: encId,
    status: "Planned",
    start_time: /* @__PURE__ */ new Date()
  });
  return json({ encounter, queue_number: queueNumber }, { status: 201 });
}
export {
  GET,
  POST
};
