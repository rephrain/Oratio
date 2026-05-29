import { u as users, d as db, y as payments, e as encounters, p as patients, x as encounterItems, w as items } from './index3-41fb71fd.js';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { c as generatePaymentReceiptPdf } from './pdfGenerator-e554d1d6.js';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'fs';
import 'path';
import 'puppeteer';

async function GET({ params, url }) {
  const paymentId = params.id;
  const doctors = alias(users, "doctors");
  const kasirs = alias(users, "kasirs");
  const result = await db.select({
    payment: payments,
    encounter: encounters,
    patient: patients,
    doctor: doctors,
    cashier: kasirs
  }).from(payments).leftJoin(encounters, eq(payments.encounter_id, encounters.id)).leftJoin(patients, eq(encounters.patient_id, patients.id)).leftJoin(doctors, eq(payments.doctor_id, doctors.id)).leftJoin(kasirs, eq(payments.cashier_id, kasirs.id)).where(eq(payments.id, paymentId)).limit(1);
  if (result.length === 0) {
    return new Response("Payment not found", { status: 404 });
  }
  const { payment, encounter, patient, doctor, cashier } = result[0];
  const eItemsRaw = await db.select({
    item: encounterItems,
    item_name: items.name
  }).from(encounterItems).leftJoin(items, eq(encounterItems.item_id, items.id)).where(eq(encounterItems.encounter_id, payment.encounter_id));
  const eItems = eItemsRaw.map((r) => ({
    ...r.item,
    item_name: r.item_name
  }));
  const origin = url.origin;
  const pdfBuffer = await generatePaymentReceiptPdf({
    payment,
    encounter,
    patient,
    doctor,
    cashier,
    items: eItems,
    origin
  });
  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length.toString(),
      "Content-Disposition": `inline; filename="Receipt-${paymentId.split("-")[0]}.pdf"`
    }
  });
}

export { GET };
//# sourceMappingURL=_server-a3833e06.js.map
