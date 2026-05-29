import { j as json } from "../../../../chunks/index.js";
import { u as users, d as db } from "../../../../chunks/index3.js";
import { eq, and } from "drizzle-orm";
async function GET({ url }) {
  const activeOnly = url.searchParams.get("active") !== "false";
  let conditions = [eq(users.role, "kasir")];
  if (activeOnly)
    conditions.push(eq(users.is_active, true));
  const cashiers = await db.select({
    id: users.id,
    name: users.name,
    profile_image_url: users.profile_image_url,
    is_active: users.is_active
  }).from(users).where(and(...conditions));
  return json({ cashiers });
}
export {
  GET
};
