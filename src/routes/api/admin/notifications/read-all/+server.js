import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { notificationReads, notifications } from '$lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';

// POST — Mark all notifications as read for current user
export async function POST({ locals }) {
  try {
    const user = locals.user;
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

    // Get all notification IDs that haven't been read by this user
    const unreadNotifications = await db
      .select({ id: notifications.id })
      .from(notifications)
      .leftJoin(
        notificationReads,
        sql`${notificationReads.notification_id} = ${notifications.id} AND ${notificationReads.user_id} = ${user.id}`
      )
      .where(sql`${notificationReads.id} IS NULL`);

    if (unreadNotifications.length > 0) {
      await db
        .insert(notificationReads)
        .values(
          unreadNotifications.map(n => ({
            notification_id: n.id,
            user_id: user.id
          }))
        )
        .onConflictDoNothing();
    }

    return json({ success: true, marked: unreadNotifications.length });
  } catch (err) {
    console.error('Error marking all as read:', err);
    return json({ error: 'Failed to mark all as read' }, { status: 500 });
  }
}
