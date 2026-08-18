import { j as json } from './index-d7f43214.js';
import { d as db, u as users, C as doctorSuster } from './index3-af609ec3.js';
import { eq } from 'drizzle-orm';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';

async function GET({ locals }) {
  if (!locals.user || locals.user.role !== "suster") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const assignedDoctors = await db.select({
      doctor_id: users.id,
      doctor_name: users.name,
      doctor_code: users.doctor_code,
      profile_image_url: users.profile_image_url
    }).from(doctorSuster).innerJoin(users, eq(doctorSuster.doctor_id, users.id)).where(eq(doctorSuster.suster_id, locals.user.id));
    return json({ data: assignedDoctors });
  } catch (err) {
    console.error("Error fetching assigned doctors:", err);
    return json({ error: "Failed to fetch assigned doctors" }, { status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server-970081d5.js.map
