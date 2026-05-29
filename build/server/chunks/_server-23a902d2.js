import { j as json } from './index-d7f43214.js';
import { d as db, e as encounters, p as patients, u as users, r as encounterPrescriptions, t as terminologyMaster, v as encounterReferrals, x as encounterItems, w as items, i as encounterOdontograms, o as odontogramTeeth, j as odontogramSurfaces, k as odontogramRestorations, l as odontogramRestorationSurfaces, m as odontogramDiagnoses, q as odontogramProcedures } from './index3-c9b0a838.js';
import { alias } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { g as generateSoapWhoFormPdf, a as generateSoapFormPdf } from './pdfGenerator-e554d1d6.js';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'fs';
import 'path';
import 'puppeteer';

async function GET({ params, url }) {
  const { id } = params;
  try {
    const [encounter] = await db.select().from(encounters).where(eq(encounters.id, id)).limit(1);
    if (!encounter) {
      return json({ error: "Encounter not found" }, { status: 404 });
    }
    const [patient] = await db.select().from(patients).where(eq(patients.id, encounter.patient_id)).limit(1);
    const [doctor] = await db.select().from(users).where(eq(users.id, encounter.doctor_id)).limit(1);
    const prescriptions = await db.select({
      dosage_form: encounterPrescriptions.dosage_form,
      dosage: encounterPrescriptions.dosage,
      quantity: encounterPrescriptions.quantity,
      instruction: encounterPrescriptions.instruction,
      product_name: terminologyMaster.display
    }).from(encounterPrescriptions).leftJoin(terminologyMaster, eq(encounterPrescriptions.terminology_id, terminologyMaster.id)).where(eq(encounterPrescriptions.encounter_id, id));
    const referrals = await db.select().from(encounterReferrals).where(eq(encounterReferrals.encounter_id, id));
    const eItems = await db.select({
      quantity: encounterItems.quantity,
      item_name: items.name
    }).from(encounterItems).leftJoin(items, eq(encounterItems.item_id, items.id)).where(eq(encounterItems.encounter_id, id));
    const origin = new URL(url.pathname, url.origin).href;
    let odontograms = [];
    let odontogramDetails = [];
    if (encounter.form_mode === "SOAP_WHO") {
      odontograms = await db.select().from(encounterOdontograms).where(eq(encounterOdontograms.encounter_id, id));
      if (odontograms.length > 0) {
        const odontoId = odontograms[0].id;
        const teeth = await db.select().from(odontogramTeeth).where(eq(odontogramTeeth.odontogram_id, odontoId));
        for (const tooth of teeth) {
          const surfaces = await db.select().from(odontogramSurfaces).where(eq(odontogramSurfaces.tooth_id, tooth.id));
          const restorations = await db.select().from(odontogramRestorations).where(eq(odontogramRestorations.tooth_id, tooth.id));
          const surfaceRestorationMap = {};
          for (const rest of restorations) {
            const junctions = await db.select().from(odontogramRestorationSurfaces).where(eq(odontogramRestorationSurfaces.restoration_id, rest.id));
            for (const j of junctions) {
              surfaceRestorationMap[j.surface_id] = { restorasi: rest.restorasi, bahan_restorasi: rest.bahan_restorasi };
            }
          }
          const icd10Term = alias(terminologyMaster, "icd10_term");
          const diagnoses = await db.select({
            id: odontogramDiagnoses.id,
            icd10_id: odontogramDiagnoses.icd10_id,
            is_primary: odontogramDiagnoses.is_primary,
            icd10_code: icd10Term.code,
            icd10_display: icd10Term.display
          }).from(odontogramDiagnoses).leftJoin(icd10Term, eq(odontogramDiagnoses.icd10_id, icd10Term.id)).where(eq(odontogramDiagnoses.tooth_id, tooth.id));
          const icd9cmTerm = alias(terminologyMaster, "icd9cm_term");
          const procedures = await db.select({
            id: odontogramProcedures.id,
            icd9cm_id: odontogramProcedures.icd9cm_id,
            icd9cm_code: icd9cmTerm.code,
            icd9cm_display: icd9cmTerm.display
          }).from(odontogramProcedures).leftJoin(icd9cmTerm, eq(odontogramProcedures.icd9cm_id, icd9cmTerm.id)).where(eq(odontogramProcedures.tooth_id, tooth.id));
          const primaryDiag = diagnoses.find((d) => d.is_primary) || diagnoses[0] || null;
          const primaryProc = procedures[0] || null;
          if (surfaces.length > 0) {
            for (const surf of surfaces) {
              const restData = surfaceRestorationMap[surf.id] || {};
              odontogramDetails.push({
                id: surf.id,
                odontogram_id: odontoId,
                tooth_number: tooth.tooth_number,
                surface: surf.surface,
                keadaan: tooth.keadaan,
                restorasi: restData.restorasi || null,
                bahan_restorasi: restData.bahan_restorasi || null,
                protesa: tooth.protesa,
                bahan_protesa: tooth.bahan_protesa,
                icd10_id: primaryDiag?.icd10_id || null,
                is_primary: primaryDiag?.is_primary || false,
                icd10_code: primaryDiag?.icd10_code || null,
                icd10_display: primaryDiag?.icd10_display || null,
                icd9cm_id: primaryProc?.icd9cm_id || null,
                icd9cm_code: primaryProc?.icd9cm_code || null,
                icd9cm_display: primaryProc?.icd9cm_display || null,
                created_at: tooth.created_at,
                all_diagnoses: diagnoses,
                all_procedures: procedures
              });
            }
          } else {
            const firstRest = restorations[0] || null;
            odontogramDetails.push({
              id: tooth.id,
              odontogram_id: odontoId,
              tooth_number: tooth.tooth_number,
              surface: "",
              keadaan: tooth.keadaan,
              restorasi: firstRest?.restorasi || null,
              bahan_restorasi: firstRest?.bahan_restorasi || null,
              protesa: tooth.protesa,
              bahan_protesa: tooth.bahan_protesa,
              icd10_id: primaryDiag?.icd10_id || null,
              is_primary: primaryDiag?.is_primary || false,
              icd10_code: primaryDiag?.icd10_code || null,
              icd10_display: primaryDiag?.icd10_display || null,
              icd9cm_id: primaryProc?.icd9cm_id || null,
              icd9cm_code: primaryProc?.icd9cm_code || null,
              icd9cm_display: primaryProc?.icd9cm_display || null,
              created_at: tooth.created_at,
              all_diagnoses: diagnoses,
              all_procedures: procedures
            });
          }
        }
      }
    }
    let pdfBuffer;
    if (encounter.form_mode === "SOAP_WHO") {
      pdfBuffer = await generateSoapWhoFormPdf({
        encounter,
        patient,
        doctor,
        prescriptions,
        referrals,
        items: eItems,
        origin,
        rxText: encounter.resep,
        odontograms,
        odontogramDetails
      });
    } else {
      pdfBuffer = await generateSoapFormPdf({
        encounter,
        patient,
        doctor,
        prescriptions,
        referrals,
        items: eItems,
        origin,
        rxText: encounter.resep
      });
    }
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Encounter-${id}.pdf"`,
        "Content-Length": pdfBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error("[PDF] Error generating encounter PDF:", error);
    return json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server-23a902d2.js.map
