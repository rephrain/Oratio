import { j as json } from './index-d7f43214.js';
import { d as db, n as notifications, a as notificationReads } from './index3-41fb71fd.js';
import { sql } from 'drizzle-orm';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';

async function POST({ locals }) {
  try {
    const user = locals.user;
    if (!user)
      return json({ error: "Unauthorized" }, { status: 401 });
    const unreadNotifications = await db.select({ id: notifications.id }).from(notifications).leftJoin(
      notificationReads,
      sql`${notificationReads.notification_id} = ${notifications.id} AND ${notificationReads.user_id} = ${user.id}`
    ).where(sql`${notificationReads.id} IS NULL`);
    if (unreadNotifications.length > 0) {
      await db.insert(notificationReads).values(
        unreadNotifications.map((n) => ({
          notification_id: n.id,
          user_id: user.id
        }))
      ).onConflictDoNothing();
    }
    return json({ success: true, marked: unreadNotifications.length });
  } catch (err) {
    console.error("Error marking all as read:", err);
    return json({ error: "Failed to mark all as read" }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server-f68c6b56.js.map
