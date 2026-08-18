import { j as json } from "../../../../../../chunks/index.js";
import { d as db, u as users, A as doctorSuster } from "../../../../../../chunks/index3.js";
import { eq } from "drizzle-orm";
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
export {
  GET
};
