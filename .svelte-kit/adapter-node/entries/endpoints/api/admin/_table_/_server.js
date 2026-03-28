import { j as json } from "../../../../../chunks/index.js";
import { d as db, u as users, a as doctorShifts, p as patients, b as patientDiseaseHistory, c as patientAllergy, e as patientMedication, t as terminologyMaster, f as documents, g as encounters, s as statusHistory, h as encounterOdontograms, o as odontogramDetails, i as encounterPrescriptions, j as encounterReferrals, k as encounterDiagnoses, l as encounterProcedures, m as items, n as encounterItems, q as payments } from "../../../../../chunks/index3.js";
import { sql, eq } from "drizzle-orm";
import { A as ADMIN_TABLES } from "../../../../../chunks/constants.js";
const schemaMap = {
  users,
  doctorShifts,
  patients,
  patientDiseaseHistory,
  patientAllergy,
  patientMedication,
  terminologyMaster,
  documents,
  encounters,
  statusHistory,
  encounterOdontograms,
  odontogramDetails,
  encounterPrescriptions,
  encounterReferrals,
  encounterDiagnoses,
  encounterProcedures,
  items,
  encounterItems,
  payments
};
async function GET({ params, url }) {
  const tableConfig = ADMIN_TABLES[params.table];
  if (!tableConfig) {
    return json({ error: "Invalid table" }, { status: 400 });
  }
  const table = schemaMap[tableConfig.schema];
  if (!table) {
    return json({ error: "Table not found" }, { status: 400 });
  }
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;
  const data = await db.select().from(table).limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql`count(*)` }).from(table);
  return json({ data, total: Number(count), page, limit, table: tableConfig.label });
}
async function POST({ params, request }) {
  const tableConfig = ADMIN_TABLES[params.table];
  if (!tableConfig) {
    return json({ error: "Invalid table" }, { status: 400 });
  }
  const table = schemaMap[tableConfig.schema];
  const body = await request.json();
  if (params.table === "users" && body.password) {
    const { hashPasswordAsync } = await import("../../../../../chunks/auth.js");
    body.password_hash = await hashPasswordAsync(body.password);
    delete body.password;
  }
  try {
    const [record] = await db.insert(table).values(body).returning();
    return json({ record }, { status: 201 });
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }
}
async function PUT({ params, request }) {
  const tableConfig = ADMIN_TABLES[params.table];
  if (!tableConfig) {
    return json({ error: "Invalid table" }, { status: 400 });
  }
  const table = schemaMap[tableConfig.schema];
  const body = await request.json();
  const { id, ...updateData } = body;
  if (!id) {
    return json({ error: "ID required" }, { status: 400 });
  }
  if (params.table === "users" && updateData.password) {
    const { hashPasswordAsync } = await import("../../../../../chunks/auth.js");
    updateData.password_hash = await hashPasswordAsync(updateData.password);
    delete updateData.password;
  }
  try {
    const pkCol = table.id;
    const [record] = await db.update(table).set(updateData).where(eq(pkCol, id)).returning();
    return json({ record });
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }
}
async function DELETE({ params, url }) {
  const tableConfig = ADMIN_TABLES[params.table];
  if (!tableConfig) {
    return json({ error: "Invalid table" }, { status: 400 });
  }
  const table = schemaMap[tableConfig.schema];
  const id = url.searchParams.get("id");
  if (!id) {
    return json({ error: "ID required" }, { status: 400 });
  }
  try {
    const pkCol = table.id;
    await db.delete(table).where(eq(pkCol, id));
    return json({ success: true });
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }
}
export {
  DELETE,
  GET,
  POST,
  PUT
};
