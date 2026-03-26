import { j as json } from './index-d7f43214.js';
import { d as db, g as encounters, p as patients, u as users, i as encounterPrescriptions, k as encounterDiagnoses, l as encounterProcedures, j as encounterReferrals, n as encounterItems, h as encounterOdontograms, o as odontogramDetails, s as statusHistory } from './index3-b19534dc.js';
import { eq } from 'drizzle-orm';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';

async function GET({ params }) {
  const [encounter] = await db.select({
    encounter: encounters,
    patient_name: patients.nama_lengkap,
    patient_nik: patients.nik,
    patient_birth_date: patients.birth_date,
    patient_gender: patients.gender,
    patient_blood_type: patients.blood_type,
    patient_rhesus: patients.rhesus,
    patient_pregnancy_status: patients.pregnancy_status,
    doctor_name: users.name,
    doctor_code: users.doctor_code
  }).from(encounters).leftJoin(patients, eq(encounters.patient_id, patients.id)).leftJoin(users, eq(encounters.doctor_id, users.id)).where(eq(encounters.id, params.id)).limit(1);
  if (!encounter) {
    return json({ error: "Encounter not found" }, { status: 404 });
  }
  const prescriptions = await db.select().from(encounterPrescriptions).where(eq(encounterPrescriptions.encounter_id, params.id));
  const diagnoses = await db.select().from(encounterDiagnoses).where(eq(encounterDiagnoses.encounter_id, params.id));
  const procedures = await db.select().from(encounterProcedures).where(eq(encounterProcedures.encounter_id, params.id));
  const referrals = await db.select().from(encounterReferrals).where(eq(encounterReferrals.encounter_id, params.id));
  const items = await db.select().from(encounterItems).where(eq(encounterItems.encounter_id, params.id));
  const odontograms = await db.select().from(encounterOdontograms).where(eq(encounterOdontograms.encounter_id, params.id));
  let odontoDetails = [];
  if (odontograms.length > 0) {
    odontoDetails = await db.select().from(odontogramDetails).where(eq(odontogramDetails.odontogram_id, odontograms[0].id));
  }
  const history = await db.select().from(statusHistory).where(eq(statusHistory.encounter_id, params.id));
  return json({
    ...encounter,
    prescriptions,
    diagnoses,
    procedures,
    referrals,
    items,
    odontograms,
    odontogramDetails: odontoDetails,
    statusHistory: history
  });
}
async function PUT({ params, request }) {
  const body = await request.json();
  const updateData = {};
  if (body.subjective !== void 0)
    updateData.subjective = body.subjective;
  if (body.objective !== void 0)
    updateData.objective = body.objective;
  if (body.assessment !== void 0)
    updateData.assessment = body.assessment;
  if (body.plan !== void 0)
    updateData.plan = body.plan;
  if (body.tekanan_darah !== void 0)
    updateData.tekanan_darah = body.tekanan_darah;
  if (body.form_mode !== void 0)
    updateData.form_mode = body.form_mode;
  if (body.chief_complaint_code !== void 0)
    updateData.chief_complaint_code = body.chief_complaint_code;
  if (body.chief_complaint_display !== void 0)
    updateData.chief_complaint_display = body.chief_complaint_display;
  if (body.status) {
    updateData.status = body.status;
    await db.update(statusHistory).set({ end_time: /* @__PURE__ */ new Date() }).where(eq(statusHistory.encounter_id, params.id));
    await db.insert(statusHistory).values({
      encounter_id: params.id,
      status: body.status,
      start_time: /* @__PURE__ */ new Date()
    });
  }
  updateData.updated_at = /* @__PURE__ */ new Date();
  const [updated] = await db.update(encounters).set(updateData).where(eq(encounters.id, params.id)).returning();
  if (body.prescriptions) {
    await db.delete(encounterPrescriptions).where(eq(encounterPrescriptions.encounter_id, params.id));
    for (const rx of body.prescriptions) {
      await db.insert(encounterPrescriptions).values({
        encounter_id: params.id,
        kfa_code: rx.kfa_code,
        product_name: rx.product_name,
        dosage: rx.dosage,
        quantity: rx.quantity,
        notes: rx.notes
      });
    }
  }
  if (body.diagnoses) {
    await db.delete(encounterDiagnoses).where(eq(encounterDiagnoses.encounter_id, params.id));
    for (const d of body.diagnoses) {
      await db.insert(encounterDiagnoses).values({
        encounter_id: params.id,
        code: d.code,
        display: d.display,
        is_primary: d.is_primary || false
      });
    }
  }
  if (body.procedures) {
    await db.delete(encounterProcedures).where(eq(encounterProcedures.encounter_id, params.id));
    for (const p of body.procedures) {
      await db.insert(encounterProcedures).values({
        encounter_id: params.id,
        code: p.code,
        display: p.display,
        tooth_number: p.tooth_number,
        surface: p.surface
      });
    }
  }
  if (body.referrals) {
    await db.delete(encounterReferrals).where(eq(encounterReferrals.encounter_id, params.id));
    for (const r of body.referrals) {
      await db.insert(encounterReferrals).values({
        encounter_id: params.id,
        doctor_code: r.doctor_code,
        referral_date: r.referral_date,
        note: r.note
      });
    }
  }
  if (body.odontogram) {
    await db.delete(encounterOdontograms).where(eq(encounterOdontograms.encounter_id, params.id));
    const [odonto] = await db.insert(encounterOdontograms).values({
      encounter_id: params.id,
      dentition: body.odontogram.dentition || "permanent",
      occlusi: body.odontogram.occlusi,
      torus: body.odontogram.torus,
      palatum: body.odontogram.palatum,
      diastema: body.odontogram.diastema || false,
      anomali: body.odontogram.anomali
    }).returning();
    if (body.odontogram.details) {
      for (const d of body.odontogram.details) {
        await db.insert(odontogramDetails).values({
          odontogram_id: odonto.id,
          tooth_number: d.tooth_number,
          surface: d.surface,
          keadaan: d.keadaan,
          restorasi: d.restorasi,
          diagnosis_code: d.diagnosis_code,
          diagnosis_display: d.diagnosis_display,
          procedure_code: d.procedure_code,
          procedure_display: d.procedure_display
        });
      }
    }
  }
  if (body.encounter_items) {
    await db.delete(encounterItems).where(eq(encounterItems.encounter_id, params.id));
    for (const item of body.encounter_items) {
      const subtotal = (item.quantity || 1) * parseFloat(item.price_at_time || 0);
      await db.insert(encounterItems).values({
        encounter_id: params.id,
        item_id: item.item_id,
        quantity: item.quantity || 1,
        price_at_time: item.price_at_time,
        subtotal: String(subtotal)
      });
    }
  }
  return json({ encounter: updated });
}

export { GET, PUT };
//# sourceMappingURL=_server-74d49d87.js.map
