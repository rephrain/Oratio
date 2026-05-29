import { j as json } from "../../../../../chunks/index.js";
import { d as db, u as users, s as shifts } from "../../../../../chunks/index3.js";
import { ne } from "drizzle-orm";
async function GET({ locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    role: users.role,
    profile_image_url: users.profile_image_url,
    doctor_code: users.doctor_code
  }).from(users).where(
    ne(users.id, locals.user.id)
  );
  const allShifts = await db.select().from(shifts);
  const nowWIB = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const currentDayOfWeek = nowWIB.getDay();
  const currentHours = nowWIB.getHours();
  const currentMinutes = nowWIB.getMinutes();
  const currentTime = `${currentHours.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}:00`;
  const filtered = allUsers.filter((u) => u.role === "dokter" || u.role === "kasir").map((u) => {
    const is_online = allShifts.some(
      (shift) => shift.user_id === u.id && shift.day_of_week === currentDayOfWeek && shift.start_time <= currentTime && shift.end_time >= currentTime
    );
    return { ...u, is_online };
  });
  return json({ users: filtered });
}
export {
  GET
};
