import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { notifications, notificationReads, users } from '$lib/server/db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';

// GET — Fetch all notifications with read status for current user
export async function GET({ locals }) {
  try {
    const user = locals.user;
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await db
      .select({
        id: notifications.id,
        title: notifications.title,
        description: notifications.description,
        created_by: notifications.created_by,
        created_at: notifications.created_at,
        creator_name: users.name,
        read_at: notificationReads.read_at
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.created_by, users.id))
      .leftJoin(
        notificationReads,
        sql`${notificationReads.notification_id} = ${notifications.id} AND ${notificationReads.user_id} = ${user.id}`
      )
      .orderBy(desc(notifications.created_at))
      .limit(50);

    const unreadCount = rows.filter(r => !r.read_at).length;

    return json({ data: rows, unreadCount });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST — Admin creates a new notification
export async function POST({ request, locals }) {
  try {
    const user = locals.user;
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return json({ error: 'Forbidden' }, { status: 403 });

    const { title, description } = await request.json();
    if (!title || !description) {
      return json({ error: 'Title and description are required' }, { status: 400 });
    }

    const [created] = await db
      .insert(notifications)
      .values({
        title,
        description,
        created_by: user.id
      })
      .returning();

    return json({ data: created }, { status: 201 });
  } catch (err) {
    console.error('Error creating notification:', err);
    return json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
