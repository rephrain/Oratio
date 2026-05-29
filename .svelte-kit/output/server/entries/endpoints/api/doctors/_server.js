import { j as json } from "../../../../chunks/index.js";
import { u as users, d as db, s as shifts } from "../../../../chunks/index3.js";
import { eq, and, sql } from "drizzle-orm";
async function GET({ url }) {
  const dayOfWeekInput = url.searchParams.get("day");
  const availableOnly = url.searchParams.get("available") === "true";
  const activeOnly = url.searchParams.get("active") !== "false";
  let conditions = [eq(users.role, "dokter")];
  if (activeOnly)
    conditions.push(eq(users.is_active, true));
  const doctors = await db.select({
    id: users.id,
    name: users.name,
    doctor_code: users.doctor_code,
    profile_image_url: users.profile_image_url,
    is_active: users.is_active
  }).from(users).where(and(...conditions));
  const now = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const today = now.getDay();
  const currentTime = now.toLocaleTimeString("en-GB", { hour12: false });
  const shiftsToday = await db.select().from(shifts).where(and(
    eq(shifts.day_of_week, today),
    sql`${shifts.start_time} <= ${currentTime}`,
    sql`${shifts.end_time} > ${currentTime}`
  ));
  const activeUserIds = new Set(shiftsToday.map((s) => s.user_id));
  let results = doctors;
  if (availableOnly) {
    results = doctors.filter((d) => activeUserIds.has(d.id));
  }
  const enrichedDoctors = results.map((d) => ({
    ...d,
    has_active_shift: activeUserIds.has(d.id),
    // Include relevant shift for this specific moment if useful
    current_shift: shiftsToday.find((s) => s.user_id === d.id) || null
  }));
  if (dayOfWeekInput !== null && dayOfWeekInput !== void 0) {
    const targetDay = parseInt(dayOfWeekInput);
    const dayShifts = await db.select().from(shifts).where(eq(shifts.day_of_week, targetDay));
    const doctorIdsWithShifts = new Set(dayShifts.map((s) => s.user_id));
    const filtered = doctors.filter((d) => doctorIdsWithShifts.has(d.id));
    return json({
      doctors: filtered.map((d) => ({
        ...d,
        has_active_shift: targetDay === today ? activeUserIds.has(d.id) : false,
        shifts: dayShifts.filter((s) => s.user_id === d.id)
      }))
    });
  }
  return json({ doctors: enrichedDoctors });
}
export {
  GET
};
