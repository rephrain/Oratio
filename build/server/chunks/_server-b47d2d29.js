import { j as json } from './index-d7f43214.js';
import { d as db, e as encounters, p as patients, u as users, t as terminologyMaster, x as encounterReferrals, A as encounterItems, y as items, j as encounterOdontograms, o as odontogramTeeth, k as odontogramSurfaces, l as odontogramRestorations, m as odontogramRestorationSurfaces, q as odontogramDiagnoses, v as odontogramProcedures, i as statusHistory, h as documents, w as encounterPrescriptions } from './index3-4839dd71.js';
import { eq, and, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { d as emitEncounterEvent, b as emitQueueEvent } from './realtimeService-90f233c2.js';
import { g as getOrCreateTerminology } from './terminology-9df57e14.js';
import 'postgres';
import 'drizzle-orm/postgres-js';
import './realtimeEventBus-093e17ac.js';

async function GET({ params }) {
  try {
    const [encounter] = await db.select({
      encounter: encounters,
      patient: patients,
      patient_name: patients.nama_lengkap,
      patient_nik: patients.nik,
      patient_birth_date: patients.birth_date,
      patient_gender: patients.gender,
      patient_handphone: patients.handphone,
      patient_address: patients.address,
      patient_email: patients.email,
      patient_blood_type: patients.blood_type,
      patient_rhesus: patients.rhesus,
      patient_pregnancy_status: patients.pregnancy_status,
      patient_tekanan_darah: patients.tekanan_darah,
      doctor_name: users.name,
      doctor_code: users.doctor_code,
      encounter_reason_code: terminologyMaster.code,
      encounter_reason_display: terminologyMaster.display
    }).from(encounters).leftJoin(patients, eq(encounters.patient_id, patients.id)).leftJoin(users, eq(encounters.doctor_id, users.id)).leftJoin(terminologyMaster, eq(encounters.encounter_reason_id, terminologyMaster.id)).where(eq(encounters.id, params.id)).limit(1);
    if (!encounter) {
      return json({ error: "Encounter not found" }, { status: 404 });
    }
    const referrals = await db.select().from(encounterReferrals).where(eq(encounterReferrals.encounter_id, params.id));
    const encounter_items_data = await db.select({
      id: encounterItems.id,
      encounter_id: encounterItems.encounter_id,
      item_id: encounterItems.item_id,
      quantity: encounterItems.quantity,
      price_at_time: encounterItems.price_at_time,
      subtotal: encounterItems.subtotal,
      created_at: encounterItems.created_at,
      name: items.name,
      item_group: items.item_group,
      denomination: items.denomination
    }).from(encounterItems).leftJoin(items, eq(encounterItems.item_id, items.id)).where(eq(encounterItems.encounter_id, params.id));
    const odontograms = await db.select().from(encounterOdontograms).where(eq(encounterOdontograms.encounter_id, params.id));
    let odontoDetails = [];
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
            surfaceRestorationMap[j.surface_id] = {
              restorasi: rest.restorasi,
              bahan_restorasi: rest.bahan_restorasi
            };
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
            odontoDetails.push({
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
          odontoDetails.push({
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
    const history = await db.select().from(statusHistory).where(eq(statusHistory.encounter_id, params.id));
    const clinicalPhotos = await db.select({
      id: documents.id,
      file_name: documents.file_name,
      mime_type: documents.mime_type,
      created_at: documents.created_at
    }).from(documents).where(and(
      eq(documents.encounter_id, params.id),
      eq(documents.document_type, "clinical_photo")
    ));
    const prescriptions = await db.select({
      id: encounterPrescriptions.id,
      terminology_id: encounterPrescriptions.terminology_id,
      kfa_code: terminologyMaster.code,
      product_name: terminologyMaster.display,
      dosage_form: encounterPrescriptions.dosage_form,
      dosage: encounterPrescriptions.dosage,
      quantity: encounterPrescriptions.quantity,
      instruction: encounterPrescriptions.instruction,
      created_at: encounterPrescriptions.created_at
    }).from(encounterPrescriptions).leftJoin(terminologyMaster, eq(encounterPrescriptions.terminology_id, terminologyMaster.id)).where(eq(encounterPrescriptions.encounter_id, params.id));
    return json({
      ...encounter,
      referrals,
      items: encounter_items_data,
      odontograms,
      odontogramDetails: odontoDetails,
      statusHistory: history,
      clinical_photos: clinicalPhotos,
      prescriptions
    });
  } catch (err) {
    console.error("GET /api/encounters error:", err);
    return json({ message: "Internal Error", error: String(err) }, { status: 500 });
  }
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
  if (body.resep !== void 0)
    updateData.resep = body.resep;
  if (body.keterangan !== void 0)
    updateData.keterangan = body.keterangan;
  if (body.reason_type !== void 0)
    updateData.reason_type = body.reason_type;
  if (body.form_mode !== void 0)
    updateData.form_mode = body.form_mode;
  if (body.reason_type !== void 0)
    updateData.reason_type = body.reason_type;
  if (body.form_mode !== void 0)
    updateData.form_mode = body.form_mode;
  if (body.reason_code !== void 0) {
    if (body.reason_code && body.reason_display) {
      updateData.encounter_reason_id = await getOrCreateTerminology(body.reason_code, body.reason_display, "SNOMED");
    } else {
      updateData.encounter_reason_id = null;
    }
  }
  if (body.status) {
    updateData.status = body.status;
    const statusMap = {
      "In Progress": "In Progress",
      "Discharged": "Finished",
      "Completed": "Finished"
    };
    await db.update(statusHistory).set({ end_at: /* @__PURE__ */ new Date() }).where(and(
      eq(statusHistory.encounter_id, params.id),
      sql`${statusHistory.end_at} IS NULL`
    ));
    const historyStatus = statusMap[body.status];
    if (historyStatus) {
      await db.insert(statusHistory).values({
        encounter_id: params.id,
        status: historyStatus,
        start_at: /* @__PURE__ */ new Date()
      });
    }
  }
  if (body.prescriptions && Array.isArray(body.prescriptions)) {
    const resepString = body.prescriptions.map((rx, i) => {
      const name = rx.product_name || "Obat";
      const form = rx.dosage_form ? `(${rx.dosage_form})` : "";
      const dosage = rx.dosage ? ` - ${rx.dosage}` : "";
      const qty = rx.quantity ? `, Qty: ${rx.quantity}` : "";
      const instruction = rx.instruction || rx.notes ? `. ${rx.instruction || rx.notes}` : "";
      return `${i + 1}. ${name} ${form}${dosage}${qty}${instruction}`;
    }).join("\n");
    updateData.resep = resepString;
  }
  updateData.updated_at = /* @__PURE__ */ new Date();
  const [updated] = await db.update(encounters).set(updateData).where(eq(encounters.id, params.id)).returning();
  if (body.tekanan_darah !== void 0) {
    const [enc] = await db.select({ patient_id: encounters.patient_id }).from(encounters).where(eq(encounters.id, params.id)).limit(1);
    if (enc?.patient_id) {
      await db.update(patients).set({ tekanan_darah: body.tekanan_darah }).where(eq(patients.id, enc.patient_id));
    }
  }
  if (body.prescriptions) {
    await db.delete(encounterPrescriptions).where(eq(encounterPrescriptions.encounter_id, params.id));
    for (const rx of body.prescriptions) {
      const kfaCode = rx.kfa_code;
      const productName = rx.product_name;
      let termId = null;
      if (kfaCode && productName) {
        termId = await getOrCreateTerminology(kfaCode, productName, "KFA");
      }
      await db.insert(encounterPrescriptions).values({
        encounter_id: params.id,
        terminology_id: termId,
        dosage_form: rx.dosage_form || null,
        dosage: rx.dosage,
        quantity: rx.quantity || 1,
        instruction: rx.instruction || rx.notes || ""
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
      dentition_type: body.odontogram.dentition_type || "Adult",
      occlusi: body.odontogram.occlusi,
      torus_palatinus: body.odontogram.torus_palatinus,
      torus_mandibularis: body.odontogram.torus_mandibularis,
      palatum: body.odontogram.palatum,
      diastema: body.odontogram.diastema || "Tidak Ada",
      gigi_anomali: body.odontogram.gigi_anomali || "Tidak Ada"
    }).returning();
    if (body.odontogram.details) {
      for (const d of body.odontogram.details) {
        let icd10Id = d.icd10_id || null;
        if (!icd10Id && d.diagnosis_code && d.diagnosis_display) {
          icd10Id = await getOrCreateTerminology(d.diagnosis_code, d.diagnosis_display, "ICD-10");
        }
        let icd9cmId = d.icd9cm_id || null;
        if (!icd9cmId && d.procedure_code && d.procedure_display) {
          icd9cmId = await getOrCreateTerminology(d.procedure_code, d.procedure_display, "ICD-9-CM");
        }
        const [tooth] = await db.insert(odontogramTeeth).values({
          odontogram_id: odonto.id,
          tooth_number: d.tooth_number,
          keadaan: d.keadaan,
          protesa: d.protesa,
          bahan_protesa: d.bahan_protesa
        }).returning();
        const insertedSurfaces = {};
        if (Array.isArray(d.restorations) && d.restorations.length > 0) {
          for (const restData of d.restorations) {
            let restId = null;
            if (restData.restorasi) {
              const [newRest] = await db.insert(odontogramRestorations).values({
                tooth_id: tooth.id,
                restorasi: restData.restorasi,
                bahan_restorasi: restData.bahan_restorasi
              }).returning();
              restId = newRest.id;
            }
            if (Array.isArray(restData.surfaces) && restData.surfaces.length > 0) {
              for (const s of restData.surfaces) {
                if (!s)
                  continue;
                let surfId = insertedSurfaces[s];
                if (!surfId) {
                  const [surfRow] = await db.insert(odontogramSurfaces).values({
                    tooth_id: tooth.id,
                    surface: s
                  }).returning();
                  surfId = surfRow.id;
                  insertedSurfaces[s] = surfId;
                }
                if (restId) {
                  await db.insert(odontogramRestorationSurfaces).values({
                    restoration_id: restId,
                    surface_id: surfId
                  });
                }
              }
            }
          }
        }
        if (Array.isArray(d.diagnoses) && d.diagnoses.length > 0) {
          for (const diag of d.diagnoses) {
            let tempIcd10Id = diag.icd10_id || null;
            if (!tempIcd10Id && diag.diagnosis_code && diag.diagnosis_display) {
              tempIcd10Id = await getOrCreateTerminology(diag.diagnosis_code, diag.diagnosis_display, "ICD-10");
            }
            if (tempIcd10Id) {
              await db.insert(odontogramDiagnoses).values({
                tooth_id: tooth.id,
                icd10_id: tempIcd10Id,
                is_primary: diag.is_primary || false
              });
            }
          }
        } else if (icd10Id) {
          await db.insert(odontogramDiagnoses).values({
            tooth_id: tooth.id,
            icd10_id: icd10Id,
            is_primary: d.is_primary || false
          });
        }
        if (Array.isArray(d.procedures) && d.procedures.length > 0) {
          for (const proc of d.procedures) {
            let tempIcd9cmId = proc.icd9cm_id || null;
            if (!tempIcd9cmId && proc.procedure_code && proc.procedure_display) {
              tempIcd9cmId = await getOrCreateTerminology(proc.procedure_code, proc.procedure_display, "ICD-9-CM");
            }
            if (tempIcd9cmId) {
              await db.insert(odontogramProcedures).values({
                tooth_id: tooth.id,
                icd9cm_id: tempIcd9cmId
              });
            }
          }
        } else if (icd9cmId) {
          await db.insert(odontogramProcedures).values({
            tooth_id: tooth.id,
            icd9cm_id: icd9cmId
          });
        }
      }
    }
  }
  if (body.encounter_items) {
    await db.delete(encounterItems).where(eq(encounterItems.encounter_id, params.id));
    const mergedItems = /* @__PURE__ */ new Map();
    for (const item of body.encounter_items) {
      const key = item.item_id;
      const qty = item.quantity || 1;
      const price = parseInt(item.price_at_time || 0);
      if (mergedItems.has(key)) {
        const existing = mergedItems.get(key);
        existing.quantity += qty;
        existing.subtotal = existing.quantity * existing.price_at_time;
      } else {
        mergedItems.set(key, {
          item_id: key,
          quantity: qty,
          price_at_time: price,
          subtotal: qty * price
        });
      }
    }
    for (const item of mergedItems.values()) {
      await db.insert(encounterItems).values({
        encounter_id: params.id,
        item_id: item.item_id,
        quantity: item.quantity,
        price_at_time: item.price_at_time,
        subtotal: item.subtotal
      });
    }
  }
  const userId = locals?.user?.id;
  const encounterId = params.id;
  emitEncounterEvent("encounter_updated", encounterId, { encounter: updated }, userId);
  if (body.status) {
    emitEncounterEvent("status_changed", encounterId, { status: body.status }, userId);
    emitQueueEvent("queue_updated", { id: encounterId, status: body.status }, userId);
  }
  if (body.subjective !== void 0 || body.objective !== void 0 || body.assessment !== void 0 || body.plan !== void 0) {
    emitEncounterEvent("soap_updated", encounterId, {
      subjective: updated.subjective,
      objective: updated.objective,
      assessment: updated.assessment,
      plan: updated.plan
    }, userId);
  }
  if (body.prescriptions) {
    emitEncounterEvent("prescription_updated", encounterId, { prescriptions: body.prescriptions }, userId);
  }
  if (body.odontogram) {
    emitEncounterEvent("odontogram_updated", encounterId, { odontogram: body.odontogram }, userId);
  }
  if (body.encounter_items) {
    emitEncounterEvent("item_updated", encounterId, { items: body.encounter_items }, userId);
  }
  return json({ encounter: updated });
}
async function DELETE({ params, locals: locals2 }) {
  try {
    const [encounter] = await db.select({
      id: encounters.id,
      status: encounters.status
    }).from(encounters).where(eq(encounters.id, params.id)).limit(1);
    if (!encounter) {
      return json({ message: "Encounter not found" }, { status: 404 });
    }
    const deletableStatuses = ["Planned", "Arrived"];
    if (!deletableStatuses.includes(encounter.status)) {
      return json({
        message: `Tidak dapat menghapus antrian yang sudah atau sedang diproses oleh dokter (Status: ${encounter.status})`
      }, { status: 400 });
    }
    await db.delete(encounters).where(eq(encounters.id, params.id));
    const userId = locals2?.user?.id;
    emitEncounterEvent("status_changed", params.id, { status: "Deleted" }, userId);
    emitQueueEvent("queue_cancelled", { id: params.id }, userId);
    return json({ success: true, message: "Antrian dan rekam encounter berhasil dihapus dari database" });
  } catch (err) {
    console.error("DELETE /api/encounters/[id] error:", err);
    return json({ message: "Internal Server Error", error: String(err) }, { status: 500 });
  }
}

export { DELETE, GET, PUT };
//# sourceMappingURL=_server-b47d2d29.js.map
