import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { chatMessages, chatConversations } from '$lib/server/db/schema.js';
import { eq, and, ne, isNull, or } from 'drizzle-orm';

/** POST /api/chat/messages/read — Mark all messages in a conversation as read */
export async function POST({ request, locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { conversationId } = await request.json();
	if (!conversationId) {
		return json({ error: 'conversationId is required' }, { status: 400 });
	}

	const userId = locals.user.id;

	// Verify user is a participant
	const [conv] = await db
		.select()
		.from(chatConversations)
		.where(
			and(
				eq(chatConversations.id, conversationId),
				or(
					eq(chatConversations.participant_a, userId),
					eq(chatConversations.participant_b, userId)
				)
			)
		)
		.limit(1);

	if (!conv) {
		return json({ error: 'Conversation not found' }, { status: 404 });
	}

	// Mark all messages from the other user as read
	await db
		.update(chatMessages)
		.set({ read_at: new Date() })
		.where(
			and(
				eq(chatMessages.conversation_id, conversationId),
				ne(chatMessages.sender_id, userId),
				isNull(chatMessages.read_at)
			)
		);

	return json({ success: true });
}
