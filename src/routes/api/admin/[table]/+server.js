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
	odontogramDetails: schema.odontogramDetails,
	encounterPrescriptions: schema.encounterPrescriptions,
	encounterReferrals: schema.encounterReferrals,
	encounterDiagnoses: schema.encounterDiagnoses,
	encounterProcedures: schema.encounterProcedures,
	items: schema.items,
	encounterItems: schema.encounterItems,
	payments: schema.payments,
	authTokens: schema.authTokens
};

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
	const body = await request.json();

	// Hash password for users table
	if (params.table === 'users' && body.password) {
		const { hashPasswordAsync } = await import('$lib/server/auth.js');
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

// PUT /api/admin/[table]
export async function PUT({ params, request }) {
	const tableConfig = ADMIN_TABLES[params.table];
	if (!tableConfig) {
		return json({ error: 'Invalid table' }, { status: 400 });
	}

	const table = schemaMap[tableConfig.schema];
	const body = await request.json();
	const { id, ...updateData } = body;

	if (!id) {
		return json({ error: 'ID required' }, { status: 400 });
	}

	// Hash password for users table
	if (params.table === 'users' && updateData.password) {
		const { hashPasswordAsync } = await import('$lib/server/auth.js');
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
		return json({ error: error.message }, { status: 400 });
	}
}
