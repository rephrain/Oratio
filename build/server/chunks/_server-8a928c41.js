import { j as json } from './index-d7f43214.js';
import { d as db, s as shifts } from './index3-0946ac29.js';
import { eq } from 'drizzle-orm';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';

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

export { GET };
//# sourceMappingURL=_server-8a928c41.js.map
