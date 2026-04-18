import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { chatMessages, chatConversations } from '$lib/server/db/schema.js';
import { eq, or, ne, isNull, and, sql } from 'drizzle-orm';

/** GET /api/chat/unread — Get total unread message count for the current user */
export async function GET({ locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userId = locals.user.id;

		// Get all conversation IDs for this user
		const conversations = await db
			.select({ id: chatConversations.id })
			.from(chatConversations)
			.where(
				or(
					eq(chatConversations.participant_a, userId),
					eq(chatConversations.participant_b, userId)
				)
			);

		if (conversations.length === 0) {
			return json({ unreadCount: 0 });
		}

		const convIds = conversations.map(c => c.id);

		// Count unread messages across all conversations (messages not from me, not yet read)
		const [result] = await db
			.select({ count: sql`count(*)::int` })
			.from(chatMessages)
			.where(
				and(
					sql`${chatMessages.conversation_id} IN (${sql.join(convIds.map(id => sql`${id}`), sql`, `)})`,
					ne(chatMessages.sender_id, userId),
					isNull(chatMessages.read_at)
				)
			);

		return json({ unreadCount: result?.count || 0 });
	} catch (err) {
		console.error('Error fetching unread count:', err.message);
		return json({ unreadCount: 0 });
	}
}
