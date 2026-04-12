import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import * as schema from '$lib/server/db/schema.js';
import { eq, desc, ilike, sql } from 'drizzle-orm';
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

	const data = await db.select().from(table).limit(limit).offset(offset);
	const [{ count }] = await db.select({ count: sql`count(*)` }).from(table);

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
	body = cleanBody(body, tableConfig);

	try {
		const [record] = await db.insert(table).values(body).returning();
		return json({ record }, { status: 201 });
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

	// Clean data
	const updateData = cleanBody(restData, tableConfig);

	try {
		const pkCol = table.id;
		const [record] = await db.update(table).set(updateData).where(eq(pkCol, id)).returning();
		return json({ record });
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
