import { j as json } from "../../../../../chunks/index.js";
import { d as db, s as shifts } from "../../../../../chunks/index3.js";
import { eq } from "drizzle-orm";
async function GET({ locals }) {
  if (!locals.user) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const userShifts = await db.select().from(shifts).where(eq(shifts.user_id, locals.user.id));
    return json({ data: userShifts });
  } catch (error) {
    console.error("[API] Error fetching shifts:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
export {
  GET
};
