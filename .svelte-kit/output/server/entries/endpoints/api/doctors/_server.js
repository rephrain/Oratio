import { j as json } from "../../../../chunks/index.js";
import { u as users, d as db, a as doctorShifts } from "../../../../chunks/index3.js";
import { eq, and } from "drizzle-orm";
async function GET({ url }) {
  const dayOfWeek = url.searchParams.get("day");
  const activeOnly = url.searchParams.get("active") !== "false";
  let conditions = [eq(users.role, "dokter")];
  if (activeOnly)
    conditions.push(eq(users.is_active, true));
  const doctors = await db.select({
    id: users.id,
    name: users.name,
    doctor_code: users.doctor_code,
    is_active: users.is_active
  }).from(users).where(and(...conditions));
  if (dayOfWeek !== null && dayOfWeek !== void 0) {
    const shifts = await db.select().from(doctorShifts).where(eq(doctorShifts.day_of_week, parseInt(dayOfWeek)));
    const doctorIdsWithShifts = new Set(shifts.map((s) => s.doctor_id));
    const filtered = doctors.filter((d) => doctorIdsWithShifts.has(d.id));
    return json({
      doctors: filtered.map((d) => ({
        ...d,
        shifts: shifts.filter((s) => s.doctor_id === d.id)
      }))
    });
  }
  return json({ doctors });
}
export {
  GET
};
