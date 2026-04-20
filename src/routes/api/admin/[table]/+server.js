import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import * as schema from '$lib/server/db/schema.js';
import { eq, desc, ilike, sql, and } from 'drizzle-orm';
import { ADMIN_TABLES } from '$lib/utils/constants.js';

const schemaMap = {
	users: schema.users,
	shifts: schema.shifts,
	patients: schema.patients,
	patientDiseaseHistory: schema.patientDiseaseHistory,
	patientAllergy: schema.patientAllergy,
	patientMedication: schema.patientMedication,
	terminologyMaster: schema.terminologyMaster,
	documents: schema.documents,
	encounters: schema.encounters,
	statusHistory: schema.statusHistory,
	encounterOdontograms: schema.encounterOdontograms,
	odontogramTeeth: schema.odontogramTeeth,
	odontogramSurfaces: schema.odontogramSurfaces,
	odontogramRestorations: schema.odontogramRestorations,
	odontogramRestorationSurfaces: schema.odontogramRestorationSurfaces,
	odontogramDiagnoses: schema.odontogramDiagnoses,
	odontogramProcedures: schema.odontogramProcedures,
	encounterPrescriptions: schema.encounterPrescriptions,
	encounterReferrals: schema.encounterReferrals,
	items: schema.items,
	encounterItems: schema.encounterItems,
	payments: schema.payments
};

// Fields that should never be sent to the DB from client
const AUTO_MANAGED_FIELDS = ['created_at', 'updated_at'];

/**
 * Clean body data before insert/update:
 * - Remove auto-managed timestamp fields
 * - Convert empty strings to null for optional fields
 * - Remove undefined values
 */
function cleanBody(body, tableConfig) {
	const cleaned = {};
	const fields = tableConfig.fields || [];
	const fieldMap = {};
	for (const f of fields) fieldMap[f.key] = f;

	for (const [key, value] of Object.entries(body)) {
		// Skip auto-managed fields
		if (AUTO_MANAGED_FIELDS.includes(key)) continue;

		// Skip undefined
		if (value === undefined) continue;

		const fieldDef = fieldMap[key];

		// Convert empty strings to null for optional fields
		if (value === '' && fieldDef && !fieldDef.required) {
			cleaned[key] = null;
			continue;
		}

		// Handle boolean coercion
		if (fieldDef?.type === 'boolean') {
			cleaned[key] = value === true || value === 'true';
			continue;
		}

		// Handle number coercion
		if (fieldDef?.type === 'number' && value !== null && value !== '') {
			cleaned[key] = Number(value);
			continue;
		}

		// Handle integer for day_of_week and similar
		if (fieldDef?.type === 'select' && fieldDef.options?.length > 0) {
			const firstOpt = fieldDef.options[0];
			if (typeof firstOpt === 'object' && typeof firstOpt.value === 'number') {
				cleaned[key] = value === '' || value === null ? null : parseInt(value, 10);
				continue;
			}
		}

		cleaned[key] = value;
	}

	return cleaned;
}

// GET /api/admin/[table]
export async function GET({ params, url }) {
	const tableConfig = ADMIN_TABLES[params.table];
	if (!tableConfig) {
		return json({ error: 'Invalid table' }, { status: 400 });
	}

	const table = schemaMap[tableConfig.schema];
	if (!table) {
		return json({ error: 'Table not found' }, { status: 400 });
	}

	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = (page - 1) * limit;

	// Build mapping of field keys to definitions
	const fieldMap = {};
	if (tableConfig.fields) {
		for (const f of tableConfig.fields) {
			fieldMap[f.key] = f;
		}
	}

	// Build filters from remaining searchParams
	const filters = [];
	const skipParams = ['page', 'limit', 'offset'];
	url.searchParams.forEach((val, key) => {
		if (!skipParams.includes(key) && table[key]) {
			let coercedVal = val;
			const fieldDef = fieldMap[key];
			
			// Simple coercion for boolean and numbers in filters
			if (fieldDef?.type === 'boolean') {
				coercedVal = val === 'true';
			} else if (fieldDef?.type === 'number') {
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

	// Fetch M2M values for each row if needed
	const m2mFields = tableConfig.fields?.filter(f => f.type === 'm2m') || [];
	if (m2mFields.length > 0 && data.length > 0) {
		for (const field of m2mFields) {
			const junctionTable = schemaMap[field.m2mSchema];
			if (junctionTable) {
				const ids = data.map(row => row.id);
				const associations = await db.select()
					.from(junctionTable)
					.where(sql`${junctionTable[field.m2mLocalKey]} IN ${ids}`);
				
				// Group associations by local ID
				const grouped = {};
				for (const assoc of associations) {
					const localId = assoc[field.m2mLocalKey];
					if (!grouped[localId]) grouped[localId] = [];
					grouped[localId].push(assoc[field.m2mForeignKey]);
				}
				
				// Attach to rows
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

// POST /api/admin/[table]
export async function POST({ params, request }) {
	const tableConfig = ADMIN_TABLES[params.table];
	if (!tableConfig) {
		return json({ error: 'Invalid table' }, { status: 400 });
	}

	const table = schemaMap[tableConfig.schema];
	let body = await request.json();

	// Hash password for users table
	if (params.table === 'users') {
		if (body.password) {
			const { hashPasswordAsync } = await import('$lib/server/auth.js');
			body.password_hash = await hashPasswordAsync(body.password);
		}
		delete body.password;
	}

	// Clean data
	const mainBody = cleanBody(body, tableConfig);

	try {
		const m2mResults = await db.transaction(async (tx) => {
			const [record] = await tx.insert(table).values(mainBody).returning();
			
			// Handle Many-to-Many synchronization
			for (const field of tableConfig.fields || []) {
				if (field.type === 'm2m' && body[field.key] && Array.isArray(body[field.key])) {
					const junctionTable = schemaMap[field.m2mSchema];
					if (junctionTable) {
						const inserts = body[field.key].map(id => ({
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

// PUT /api/admin/[table]
export async function PUT({ params, request }) {
	const tableConfig = ADMIN_TABLES[params.table];
	if (!tableConfig) {
		return json({ error: 'Invalid table' }, { status: 400 });
	}

	const table = schemaMap[tableConfig.schema];
	let body = await request.json();
	const { id, ...restData } = body;

	if (!id) {
		return json({ error: 'ID required' }, { status: 400 });
	}

	// Hash password for users table
	if (params.table === 'users') {
		if (restData.password) {
			const { hashPasswordAsync } = await import('$lib/server/auth.js');
			restData.password_hash = await hashPasswordAsync(restData.password);
		}
		delete restData.password;
	}

	// Clean data (excluding m2m fields from main table update)
	const updateData = cleanBody(restData, tableConfig);

	try {
		const result = await db.transaction(async (tx) => {
			const pkCol = table.id;
			const [record] = await tx.update(table).set(updateData).where(eq(pkCol, id)).returning();

			// Handle Many-to-Many synchronization
			for (const field of tableConfig.fields || []) {
				if (field.type === 'm2m' && restData[field.key] && Array.isArray(restData[field.key])) {
					const junctionTable = schemaMap[field.m2mSchema];
					if (junctionTable) {
						// 1. Delete all existing links for this record
						await tx.delete(junctionTable).where(eq(junctionTable[field.m2mLocalKey], id));
						
						// 2. Insert new links
						const inserts = restData[field.key].map(foreignId => ({
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

// DELETE /api/admin/[table]
export async function DELETE({ params, url }) {
	const tableConfig = ADMIN_TABLES[params.table];
	if (!tableConfig) {
		return json({ error: 'Invalid table' }, { status: 400 });
	}

	const table = schemaMap[tableConfig.schema];
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'ID required' }, { status: 400 });
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
