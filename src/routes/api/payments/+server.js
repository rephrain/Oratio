import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { payments, encounters, encounterItems, documents } from '$lib/server/db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';

// GET /api/payments
export async function GET({ url }) {
	const encounterId = url.searchParams.get('encounter_id');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '20');
	const offset = (page - 1) * limit;

	let query = db.select().from(payments);

	if (encounterId) {
		query = query.where(eq(payments.encounter_id, encounterId));
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

	const [payment] = await db.insert(payments).values({
		encounter_id: body.encounter_id,
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

	return json({ payment }, { status: 201 });
}
