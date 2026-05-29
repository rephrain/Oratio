import { j as json } from './index-d7f43214.js';
import { d as db, z as chatConversations, A as chatMessages, u as users } from './index3-c9b0a838.js';
import { and, eq, or, gt, asc } from 'drizzle-orm';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';

async function GET({ url, locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const conversationId = url.searchParams.get("conversationId");
  if (!conversationId) {
    return json({ error: "conversationId is required" }, { status: 400 });
  }
  const userId = locals.user.id;
  const [conv] = await db.select().from(chatConversations).where(
    and(
      eq(chatConversations.id, conversationId),
      or(
        eq(chatConversations.participant_a, userId),
        eq(chatConversations.participant_b, userId)
      )
    )
  ).limit(1);
  if (!conv) {
    return json({ error: "Conversation not found" }, { status: 404 });
  }
  const after = url.searchParams.get("after");
  let conditions = [eq(chatMessages.conversation_id, conversationId)];
  if (after) {
    conditions.push(gt(chatMessages.created_at, new Date(after)));
  }
  const messages = await db.select({
    id: chatMessages.id,
    conversation_id: chatMessages.conversation_id,
    sender_id: chatMessages.sender_id,
    content: chatMessages.content,
    read_at: chatMessages.read_at,
    created_at: chatMessages.created_at,
    sender_name: users.name,
    sender_role: users.role,
    sender_profile_image_url: users.profile_image_url
  }).from(chatMessages).leftJoin(users, eq(chatMessages.sender_id, users.id)).where(and(...conditions)).orderBy(asc(chatMessages.created_at)).limit(200);
  return json({ messages });
}
async function POST({ request, locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const { conversationId, content } = await request.json();
  if (!conversationId || !content?.trim()) {
    return json({ error: "conversationId and content are required" }, { status: 400 });
  }
  const userId = locals.user.id;
  const [conv] = await db.select().from(chatConversations).where(
    and(
      eq(chatConversations.id, conversationId),
      or(
        eq(chatConversations.participant_a, userId),
        eq(chatConversations.participant_b, userId)
      )
    )
  ).limit(1);
  if (!conv) {
    return json({ error: "Conversation not found" }, { status: 404 });
  }
  const [message] = await db.insert(chatMessages).values({
    conversation_id: conversationId,
    sender_id: userId,
    content: content.trim()
  }).returning();
  await db.update(chatConversations).set({ last_message_at: message.created_at }).where(eq(chatConversations.id, conversationId));
  return json({ message }, { status: 201 });
}

export { GET, POST };
//# sourceMappingURL=_server-bfa93f93.js.map
