import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { payments, encounters, encounterItems, documents, patients, users } from '$lib/server/db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { emitQueueEvent, emitEncounterEvent, emitDashboardEvent } from '$lib/server/realtime/realtimeService.js';

// GET /api/payments
export async function GET({ url }) {
	const encounterId = url.searchParams.get('encounter_id');
	const date = url.searchParams.get('date');
	const doctorId = url.searchParams.get('doctor_id');
	const cashierId = url.searchParams.get('cashier_id');
	const paymentMode = url.searchParams.get('payment_mode');
	const paymentType = url.searchParams.get('payment_type');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = (page - 1) * limit;

	const doctors = alias(users, 'doctors');
	const kasirs = alias(users, 'kasirs');

	let query = db.select({
		payment: payments,
		encounter: encounters,
		patient: patients,
		patient_name: patients.nama_lengkap,
		doctor_name: doctors.name,
		kasir_name: kasirs.name
	})
	.from(payments)
	.leftJoin(encounters, eq(payments.encounter_id, encounters.id))
	.leftJoin(patients, eq(encounters.patient_id, patients.id))
	.leftJoin(doctors, eq(encounters.doctor_id, doctors.id))
	.leftJoin(kasirs, eq(payments.cashier_id, kasirs.id));

	if (encounterId) {
		query = query.where(eq(payments.encounter_id, encounterId));
	}
	
	if (date) {
		query = query.where(sql`DATE(${payments.paid_at} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') = ${date}`);
	}

	if (doctorId) {
		query = query.where(eq(encounters.doctor_id, doctorId));
	}

	if (cashierId) {
		query = query.where(eq(payments.cashier_id, cashierId));
	}

	if (paymentMode) {
		query = query.where(eq(payments.payment_mode, paymentMode));
	}

	if (paymentType) {
		query = query.where(eq(payments.payment_type, paymentType));
	}

	const data = await query.orderBy(desc(payments.created_at)).limit(limit).offset(offset);

	return json({ data });
}

// POST /api/payments
export async function POST({ request, locals }) {
	const body = await request.json();

	// Calculate totals from encounter items
	const items = await db.select().from(encounterItems)
		.where(eq(encounterItems.encounter_id, body.encounter_id));

	const totalSales = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

	let discountAmount = 0;
	if (body.discount_percent) {
		discountAmount = Math.round(totalSales * (parseFloat(body.discount_percent) / 100));
	} else if (body.discount_amount) {
		discountAmount = parseInt(body.discount_amount);
	}

	const netSales = totalSales - discountAmount;

	// Fetch encounter to get doctor_id
	const [encounterInfo] = await db.select({ doctor_id: encounters.doctor_id })
		.from(encounters)
		.where(eq(encounters.id, body.encounter_id))
		.limit(1);

	if (!encounterInfo) {
		return json({ error: 'Encounter not found' }, { status: 404 });
	}

	const [payment] = await db.insert(payments).values({
		encounter_id: body.encounter_id,
		doctor_id: encounterInfo.doctor_id,
		cashier_id: locals.user.id,
		payment_mode: body.payment_mode || 'NORMAL',
		payment_type: body.payment_type,
		card_number: body.card_number || null,
		reference_number: body.reference_number || null,
		total_sales: totalSales,
		discount_percent: body.discount_percent ? String(body.discount_percent) : '0',
		discount_amount: discountAmount,
		net_sales: netSales,
		total_paid: parseInt(body.total_paid) || netSales,
		note: body.note,
		proof_document_id: body.proof_document_id || null,
		paid_at: new Date()
	}).returning();

	// Update encounter status to Completed
	await db.update(encounters)
		.set({ status: 'Completed', updated_at: new Date() })
		.where(eq(encounters.id, body.encounter_id));


	// Emit real-time events
	const userId = locals?.user?.id;
	emitEncounterEvent('payment_completed', body.encounter_id, { payment }, userId);
	emitEncounterEvent('status_changed', body.encounter_id, { status: 'Completed' }, userId);
	emitQueueEvent('queue_completed', { id: body.encounter_id, status: 'Completed' }, userId);
	emitDashboardEvent('payment_completed', { payment, encounter_id: body.encounter_id }, userId);

	return json({ payment }, { status: 201 });
}
