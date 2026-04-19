import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { notificationReads } from '$lib/server/db/schema.js';

// POST — Mark a notification as read
export async function POST({ params, locals }) {
  try {
    const user = locals.user;
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    await db
      .insert(notificationReads)
      .values({
        notification_id: id,
        user_id: user.id
      })
      .onConflictDoNothing();

    return json({ success: true });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    return json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
