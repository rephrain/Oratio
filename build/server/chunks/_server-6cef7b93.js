import { j as json } from './index-d7f43214.js';
import { d as db, u as users, s as shifts, p as patients, b as patientDiseaseHistory, c as patientAllergy, f as patientMedication, t as terminologyMaster, g as documents, e as encounters, h as statusHistory, i as encounterOdontograms, o as odontogramTeeth, j as odontogramSurfaces, k as odontogramRestorations, l as odontogramRestorationSurfaces, m as odontogramDiagnoses, q as odontogramProcedures, r as encounterPrescriptions, v as encounterReferrals, w as items, x as encounterItems, y as payments } from './index3-0e5c3567.js';
import { inArray, eq, sql, or, and, desc } from 'drizzle-orm';
import { A as ADMIN_TABLES } from './constants-5167fb30.js';
import { g as generatePatientId } from './formatters-ab7a5011.js';
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
      if (typeof firstOpt === "object") {
        if (typeof firstOpt.value === "number") {
          cleaned[key] = value === "" || value === null ? null : parseInt(value, 10);
          continue;
        } else if (typeof value === "string") {
          const matched = fieldDef.options.find(
            (o) => o.label?.toLowerCase() === value.toLowerCase() || o.value?.toLowerCase() === value.toLowerCase()
          );
          if (matched) {
            cleaned[key] = matched.value;
            continue;
          }
        }
      } else if (typeof firstOpt === "string" && typeof value === "string") {
        const matched = fieldDef.options.find((o) => String(o).toLowerCase() === value.toLowerCase());
        if (matched) {
          cleaned[key] = matched;
          continue;
        }
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
  const all = url.searchParams.get("all") === "true";
  const searchTerm = (url.searchParams.get("q") || "").trim();
  const fieldMap = {};
  if (tableConfig.fields) {
    for (const f of tableConfig.fields) {
      fieldMap[f.key] = f;
    }
  }
  const filters = [];
  const skipParams = ["page", "limit", "offset", "all", "q"];
  const processedKeys = /* @__PURE__ */ new Set();
  url.searchParams.forEach((val, key) => {
    if (!skipParams.includes(key) && table[key] && !processedKeys.has(key)) {
      processedKeys.add(key);
      const vals = url.searchParams.getAll(key);
      let combinedVals = vals;
      if (vals.length === 1 && typeof vals[0] === "string" && vals[0].includes(",")) {
        combinedVals = vals[0].split(",").map((v) => v.trim());
      }
      const fieldDef = fieldMap[key];
      if (combinedVals.length > 1) {
        filters.push(inArray(table[key], combinedVals));
      } else {
        let coercedVal = combinedVals[0];
        if (fieldDef?.type === "boolean") {
          coercedVal = coercedVal === "true";
        } else if (fieldDef?.type === "number") {
          coercedVal = Number(coercedVal);
        }
        filters.push(eq(table[key], coercedVal));
      }
    }
  });
  if (searchTerm) {
    const searchableFields = (tableConfig.fields || []).filter(
      (field) => field.type !== "password" && field.type !== "m2m" && table[field.key]
    );
    const searchPattern = `%${searchTerm}%`;
    const searchFilters = searchableFields.map(
      (field) => sql`CAST(${table[field.key]} AS TEXT) ILIKE ${searchPattern}`
    );
    if (searchFilters.length > 0) {
      filters.push(or(...searchFilters));
    }
  }
  const query = db.select().from(table);
  if (!all) {
    query.limit(limit).offset(offset);
  }
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
      if (params.table === "patients" && !mainBody.id) {
        const lastPatient = await tx.select({ id: table.id }).from(table).orderBy(desc(table.id)).limit(1);
        const lastId = lastPatient.length > 0 ? lastPatient[0].id : null;
        mainBody.id = generatePatientId(lastId);
      }
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
    console.error(`Admin POST error for ${params.table}:`);
    console.dir(error, { depth: null });
    if (error?.cause) {
      console.error("CAUSE:");
      console.dir(error.cause, { depth: null });
    }
    return json(
      {
        error: error.message,
        cause: error.cause ?? null,
        code: error.code ?? null,
        detail: error.detail ?? null,
        constraint: error.constraint ?? null
      },
      { status: 400 }
    );
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
    console.error(`Admin PUT error for ${params.table}:`);
    console.dir(error, { depth: null });
    if (error?.cause) {
      console.error("CAUSE:");
      console.dir(error.cause, { depth: null });
    }
    return json(
      {
        error: error.message,
        cause: error.cause ?? null,
        code: error.code ?? null,
        detail: error.detail ?? null,
        constraint: error.constraint ?? null
      },
      { status: 400 }
    );
  }
}
async function DELETE({ params, url }) {
  const tableConfig = ADMIN_TABLES[params.table];
  if (!tableConfig) {
    return json({ error: "Invalid table" }, { status: 400 });
  }
  const table = schemaMap[tableConfig.schema];
  const id = url.searchParams.get("id");
  const all = url.searchParams.get("all") === "true";
  if (!id && !all) {
    return json({ error: "ID or all=true required" }, { status: 400 });
  }
  try {
    if (all) {
      await db.delete(table);
      return json({ success: true, count: "all" });
    } else {
      const pkCol = table.id;
      await db.delete(table).where(eq(pkCol, id));
      return json({ success: true });
    }
  } catch (error) {
    console.error(`Admin DELETE error for ${params.table}:`);
    console.dir(error, { depth: null });
    if (error?.cause) {
      console.error("CAUSE:");
      console.dir(error.cause, { depth: null });
    }
    return json(
      {
        error: error.message,
        cause: error.cause ?? null,
        code: error.code ?? null,
        detail: error.detail ?? null,
        constraint: error.constraint ?? null
      },
      { status: 400 }
    );
  }
}

export { DELETE, GET, POST, PUT };
//# sourceMappingURL=_server-6cef7b93.js.map
