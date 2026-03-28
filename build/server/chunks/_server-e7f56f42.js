import { j as json } from './index-d7f43214.js';
import { d as db, q as payments, n as encounterItems, g as encounters } from './index3-6552ad5d.js';
import { eq, desc } from 'drizzle-orm';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';

async function GET({ url }) {
  const encounterId = url.searchParams.get("encounter_id");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;
  let query = db.select().from(payments);
  if (encounterId) {
    query = query.where(eq(payments.encounter_id, encounterId));
  }
  const data = await query.orderBy(desc(payments.created_at)).limit(limit).offset(offset);
  return json({ data });
}
async function POST({ request, locals }) {
  const body = await request.json();
  const items = await db.select().from(encounterItems).where(eq(encounterItems.encounter_id, body.encounter_id));
  const totalSales = items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
  let discountAmount = 0;
  if (body.discount_percent) {
    discountAmount = totalSales * (parseFloat(body.discount_percent) / 100);
  } else if (body.discount_amount) {
    discountAmount = parseFloat(body.discount_amount);
  }
  const netSales = totalSales - discountAmount;
  const [payment] = await db.insert(payments).values({
    encounter_id: body.encounter_id,
    cashier_id: locals.user.id,
    payment_mode: body.payment_mode || "NORMAL",
    payment_type: body.payment_type,
    payment_code: body.payment_code,
    card_number: body.card_number || null,
    reference_number: body.reference_number || null,
    total_sales: String(totalSales),
    discount_percent: body.discount_percent ? String(body.discount_percent) : "0",
    discount_amount: String(discountAmount),
    net_sales: String(netSales),
    total_paid: String(body.total_paid || netSales),
    note: body.note,
    paid_at: /* @__PURE__ */ new Date()
  }).returning();
  await db.update(encounters).set({ status: "Completed", updated_at: /* @__PURE__ */ new Date() }).where(eq(encounters.id, body.encounter_id));
  return json({ payment }, { status: 201 });
}

export { GET, POST };
//# sourceMappingURL=_server-e7f56f42.js.map
