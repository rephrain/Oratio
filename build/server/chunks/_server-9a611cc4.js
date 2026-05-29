import { j as json } from './index-d7f43214.js';
import { d as db, u as users, s as shifts, p as patients, b as patientDiseaseHistory, c as patientAllergy, f as patientMedication, t as terminologyMaster, g as documents, e as encounters, h as statusHistory, i as encounterOdontograms, o as odontogramTeeth, j as odontogramSurfaces, k as odontogramRestorations, l as odontogramRestorationSurfaces, m as odontogramDiagnoses, q as odontogramProcedures, r as encounterPrescriptions, v as encounterReferrals, w as items, x as encounterItems, y as payments } from './index3-41fb71fd.js';
import { eq, and, sql } from 'drizzle-orm';
import { A as ADMIN_TABLES } from './constants-4593e640.js';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';

const schemaMap = {
  users,
  shifts,
  patients,
  patientDiseaseHistory,
  patientAllergy,
  patientMedication,
  terminologyMaster,
  documents,
  encounters,
  statusHistory,
  encounterOdontograms,
  odontogramTeeth,
  odontogramSurfaces,
  odontogramRestorations,
  odontogramRestorationSurfaces,
  odontogramDiagnoses,
  odontogramProcedures,
  encounterPrescriptions,
  encounterReferrals,
  items,
  encounterItems,
  payments
};
const AUTO_MANAGED_FIELDS = ["created_at", "updated_at"];
function cleanBody(body, tableConfig) {
  const cleaned = {};
  const fields = tableConfig.fields || [];
  const fieldMap = {};
  for (const f of fields)
    fieldMap[f.key] = f;
  for (const [key, value] of Object.entries(body)) {
    if (AUTO_MANAGED_FIELDS.includes(key))
      continue;
    if (value === void 0)
      continue;
    const fieldDef = fieldMap[key];
    if (value === "" && fieldDef && !fieldDef.required) {
      cleaned[key] = null;
      continue;
    }
    if (fieldDef?.type === "boolean") {
      cleaned[key] = value === true || value === "true";
      continue;
    }
    if (fieldDef?.type === "number" && value !== null && value !== "") {
      cleaned[key] = Number(value);
      continue;
    }
    if (fieldDef?.type === "select" && fieldDef.options?.length > 0) {
      const firstOpt = fieldDef.options[0];
      if (typeof firstOpt === "object" && typeof firstOpt.value === "number") {
        cleaned[key] = value === "" || value === null ? null : parseInt(value, 10);
        continue;
      }
    }
    cleaned[key] = value;
  }
  return cleaned;
}
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
  const fieldMap = {};
  if (tableConfig.fields) {
    for (const f of tableConfig.fields) {
      fieldMap[f.key] = f;
    }
  }
  const filters = [];
  const skipParams = ["page", "limit", "offset"];
  url.searchParams.forEach((val, key) => {
    if (!skipParams.includes(key) && table[key]) {
      let coercedVal = val;
      const fieldDef = fieldMap[key];
      if (fieldDef?.type === "boolean") {
        coercedVal = val === "true";
      } else if (fieldDef?.type === "number") {
        coercedVal = Number(val);
      }
      filters.push(eq(table[key], coercedVal));
    }
  });
  const query = db.select().from(table).limit(limit).offset(offset);
  if (filters.length > 0) {
    query.where(and(...filters));
  }
  const data = await query;
  const m2mFields = tableConfig.fields?.filter((f) => f.type === "m2m") || [];
  if (m2mFields.length > 0 && data.length > 0) {
    for (const field of m2mFields) {
      const junctionTable = schemaMap[field.m2mSchema];
      if (junctionTable) {
        const ids = data.map((row) => row.id);
        const associations = await db.select().from(junctionTable).where(sql`${junctionTable[field.m2mLocalKey]} IN ${ids}`);
        const grouped = {};
        for (const assoc of associations) {
          const localId = assoc[field.m2mLocalKey];
          if (!grouped[localId])
            grouped[localId] = [];
          grouped[localId].push(assoc[field.m2mForeignKey]);
        }
        for (const row of data) {
          row[field.key] = grouped[row.id] || [];
        }
      }
    }
  }
  const countQuery = db.select({ count: sql`count(*)` }).from(table);
  if (filters.length > 0) {
    countQuery.where(and(...filters));
  }
  const [{ count }] = await countQuery;
  return json({ data, total: Number(count), page, limit, table: tableConfig.label });
}
async function POST({ params, request }) {
  const tableConfig = ADMIN_TABLES[params.table];
  if (!tableConfig) {
    return json({ error: "Invalid table" }, { status: 400 });
  }
  const table = schemaMap[tableConfig.schema];
  let body = await request.json();
  if (params.table === "users") {
    if (body.password) {
      const { hashPasswordAsync } = await import('./auth-c426d006.js');
      body.password_hash = await hashPasswordAsync(body.password);
    }
    delete body.password;
  }
  const mainBody = cleanBody(body, tableConfig);
  try {
    const m2mResults = await db.transaction(async (tx) => {
      const [record] = await tx.insert(table).values(mainBody).returning();
      for (const field of tableConfig.fields || []) {
        if (field.type === "m2m" && body[field.key] && Array.isArray(body[field.key])) {
          const junctionTable = schemaMap[field.m2mSchema];
          if (junctionTable) {
            const inserts = body[field.key].map((id) => ({
              [field.m2mLocalKey]: record.id,
              [field.m2mForeignKey]: id
            }));
            if (inserts.length > 0) {
              await tx.insert(junctionTable).values(inserts);
            }
          }
        }
      }
      return record;
    });
    return json({ record: m2mResults }, { status: 201 });
  } catch (error) {
    console.error(`Admin POST error for ${params.table}:`, error.message);
    return json({ error: error.message }, { status: 400 });
  }
}
async function PUT({ params, request }) {
  const tableConfig = ADMIN_TABLES[params.table];
  if (!tableConfig) {
    return json({ error: "Invalid table" }, { status: 400 });
  }
  const table = schemaMap[tableConfig.schema];
  let body = await request.json();
  const { id, ...restData } = body;
  if (!id) {
    return json({ error: "ID required" }, { status: 400 });
  }
  if (params.table === "users") {
    if (restData.password) {
      const { hashPasswordAsync } = await import('./auth-c426d006.js');
      restData.password_hash = await hashPasswordAsync(restData.password);
    }
    delete restData.password;
  }
  const updateData = cleanBody(restData, tableConfig);
  try {
    const result = await db.transaction(async (tx) => {
      const pkCol = table.id;
      const [record] = await tx.update(table).set(updateData).where(eq(pkCol, id)).returning();
      for (const field of tableConfig.fields || []) {
        if (field.type === "m2m" && restData[field.key] && Array.isArray(restData[field.key])) {
          const junctionTable = schemaMap[field.m2mSchema];
          if (junctionTable) {
            await tx.delete(junctionTable).where(eq(junctionTable[field.m2mLocalKey], id));
            const inserts = restData[field.key].map((foreignId) => ({
              [field.m2mLocalKey]: id,
              [field.m2mForeignKey]: foreignId
            }));
            if (inserts.length > 0) {
              await tx.insert(junctionTable).values(inserts);
            }
          }
        }
      }
      return record;
    });
    return json({ record: result });
  } catch (error) {
    console.error(`Admin PUT error for ${params.table}:`, error.message);
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
    console.error(`Admin DELETE error for ${params.table}:`, error.message);
    return json({ error: error.message }, { status: 400 });
  }
}

export { DELETE, GET, POST, PUT };
//# sourceMappingURL=_server-9a611cc4.js.map
