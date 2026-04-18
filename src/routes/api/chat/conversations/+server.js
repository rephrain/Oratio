import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { chatConversations, chatMessages, users, shifts } from '$lib/server/db/schema.js';
import { eq, or, and, desc, sql, ne, isNull } from 'drizzle-orm';

/** GET /api/chat/conversations — List all conversations for the current user */
export async function GET({ locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const userId = locals.user.id;

	// Get all conversations where the user is a participant
	const conversations = await db
		.select({
			id: chatConversations.id,
			participant_a: chatConversations.participant_a,
			participant_b: chatConversations.participant_b,
			last_message_at: chatConversations.last_message_at,
			created_at: chatConversations.created_at
		})
		.from(chatConversations)
		.where(
			or(
				eq(chatConversations.participant_a, userId),
				eq(chatConversations.participant_b, userId)
			)
		)
		.orderBy(desc(chatConversations.last_message_at));

	// Fetch all current shifts to determine online status
	const allShifts = await db.select().from(shifts);

	const nowWIB = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
	const currentDayOfWeek = nowWIB.getDay(); // 0 is Sunday, 6 is Saturday
	const currentHours = nowWIB.getHours();
	const currentMinutes = nowWIB.getMinutes();
	const currentTime = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}:00`;

	// Enrich each conversation with the other participant's info, last message, and unread count
	const enriched = await Promise.all(
		conversations.map(async (conv) => {
			const otherUserId = conv.participant_a === userId ? conv.participant_b : conv.participant_a;

			// Get the other user's info
			const [otherUser] = await db
				.select({
					id: users.id,
					name: users.name,
					role: users.role,
					profile_image_url: users.profile_image_url
				})
				.from(users)
				.where(eq(users.id, otherUserId))
				.limit(1);

			let is_online = false;
			if (otherUser) {
				is_online = allShifts.some(shift => 
					shift.user_id === otherUser.id &&
					shift.day_of_week === currentDayOfWeek &&
					shift.start_time <= currentTime &&
					shift.end_time >= currentTime
				);
			}

			// Get the last message
			const [lastMessage] = await db
				.select({
					content: chatMessages.content,
					sender_id: chatMessages.sender_id,
					created_at: chatMessages.created_at
				})
				.from(chatMessages)
				.where(eq(chatMessages.conversation_id, conv.id))
				.orderBy(desc(chatMessages.created_at))
				.limit(1);

			// Get unread count (messages not from me that are unread)
			const [unreadResult] = await db
				.select({ count: sql`count(*)::int` })
				.from(chatMessages)
				.where(
					and(
						eq(chatMessages.conversation_id, conv.id),
						ne(chatMessages.sender_id, userId),
						isNull(chatMessages.read_at)
					)
				);

			return {
				id: conv.id,
				otherUser: otherUser ? { ...otherUser, is_online } : null,
				lastMessage: lastMessage || null,
				unreadCount: unreadResult?.count || 0,
				last_message_at: conv.last_message_at,
				created_at: conv.created_at
			};
		})
	);

	return json({ conversations: enriched });
}

/** POST /api/chat/conversations — Create or get-existing conversation */
export async function POST({ request, locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { targetUserId } = await request.json();
	if (!targetUserId) {
		return json({ error: 'targetUserId is required' }, { status: 400 });
	}

	const userId = locals.user.id;

	// Sort participant IDs to enforce consistent ordering (smaller UUID first)
	const [pA, pB] = [userId, targetUserId].sort();

	// Check if conversation already exists
	const [existing] = await db
		.select()
		.from(chatConversations)
		.where(
			and(
				eq(chatConversations.participant_a, pA),
				eq(chatConversations.participant_b, pB)
			)
		)
		.limit(1);

	if (existing) {
		return json({ conversation: existing });
	}

	// Create new conversation
	const [newConv] = await db
		.insert(chatConversations)
		.values({
			participant_a: pA,
			participant_b: pB
		})
		.returning();

	return json({ conversation: newConv }, { status: 201 });
}
