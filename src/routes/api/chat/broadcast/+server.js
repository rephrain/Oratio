import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { chatConversations, chatMessages, users } from '$lib/server/db/schema.js';
import { eq, ne, and, sql } from 'drizzle-orm';
import { emitChatEvent } from '$lib/server/realtime/realtimeService.js';

/** POST /api/chat/broadcast — Admin sends a message to all users */
export async function POST({ request, locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (locals.user.role !== 'admin') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const { content } = await request.json();
	if (!content?.trim()) {
		return json({ error: 'Content is required' }, { status: 400 });
	}

	const adminId = locals.user.id;
    const messageContent = content.trim();

	try {
		// 1. Fetch all other active users
		const allUsers = await db
			.select({ id: users.id })
			.from(users)
			.where(and(eq(users.is_active, true), ne(users.id, adminId)));

		if (allUsers.length === 0) {
			return json({ message: 'No other users to broadcast to' });
		}

		// 2. For each user, send the message
		// Note: Using a loop for simplicity. For huge numbers of users, this should be a background job.
		const results = await Promise.all(
			allUsers.map(async (targetUser) => {
				const targetUserId = targetUser.id;
				
				// Standard pA, pB sorting (same as conversations api)
				const [pA, pB] = [adminId, targetUserId].sort();

				// Find or create conversation
				let [conv] = await db
					.select()
					.from(chatConversations)
					.where(
						and(
							eq(chatConversations.participant_a, pA),
							eq(chatConversations.participant_b, pB)
						)
					)
					.limit(1);

				if (!conv) {
					[conv] = await db
						.insert(chatConversations)
						.values({
							participant_a: pA,
							participant_b: pB
						})
						.returning();
				}

				// Insert the message
				const [msg] = await db
					.insert(chatMessages)
					.values({
						conversation_id: conv.id,
						sender_id: adminId,
						content: messageContent
					})
					.returning();

				// Update last_message_at
				await db
					.update(chatConversations)
					.set({ last_message_at: msg.created_at })
					.where(eq(chatConversations.id, conv.id));

				// Emit real-time message event
				emitChatEvent('message_sent', conv.id, { message: msg }, adminId, [targetUserId]);

				return msg;
			})
		);

		return json({ 
			success: true, 
			count: results.length,
			message: `Broadcast sent to ${results.length} users.` 
		});
	} catch (err) {
		console.error('Error in broadcast:', err);
		return json({ error: 'Failed to send broadcast' }, { status: 500 });
	}
}
