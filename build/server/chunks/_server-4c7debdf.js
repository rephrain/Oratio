import { j as json } from './index-d7f43214.js';
import { u as users, d as db } from './index3-c9b0a838.js';
import { eq, and } from 'drizzle-orm';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';

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

export { GET };
//# sourceMappingURL=_server-4c7debdf.js.map
