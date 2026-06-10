import { j as json } from './index-d7f43214.js';
import { d as db, u as users, z as chatConversations, A as chatMessages } from './index3-775267d5.js';
import { and, eq, ne } from 'drizzle-orm';
import { e as emitChatEvent } from './realtimeService-90f233c2.js';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';
import './realtimeEventBus-093e17ac.js';

async function POST({ request, locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  if (locals.user.role !== "admin") {
    return json({ error: "Forbidden" }, { status: 403 });
  }
  const { content } = await request.json();
  if (!content?.trim()) {
    return json({ error: "Content is required" }, { status: 400 });
  }
  const adminId = locals.user.id;
  const messageContent = content.trim();
  try {
    const allUsers = await db.select({ id: users.id }).from(users).where(and(eq(users.is_active, true), ne(users.id, adminId)));
    if (allUsers.length === 0) {
      return json({ message: "No other users to broadcast to" });
    }
    const results = await Promise.all(
      allUsers.map(async (targetUser) => {
        const targetUserId = targetUser.id;
        const [pA, pB] = [adminId, targetUserId].sort();
        let [conv] = await db.select().from(chatConversations).where(
          and(
            eq(chatConversations.participant_a, pA),
            eq(chatConversations.participant_b, pB)
          )
        ).limit(1);
        if (!conv) {
          [conv] = await db.insert(chatConversations).values({
            participant_a: pA,
            participant_b: pB
          }).returning();
        }
        const [msg] = await db.insert(chatMessages).values({
          conversation_id: conv.id,
          sender_id: adminId,
          content: messageContent
        }).returning();
        await db.update(chatConversations).set({ last_message_at: msg.created_at }).where(eq(chatConversations.id, conv.id));
        emitChatEvent("message_sent", conv.id, { message: msg }, adminId, [targetUserId]);
        return msg;
      })
    );
    return json({
      success: true,
      count: results.length,
      message: `Broadcast sent to ${results.length} users.`
    });
  } catch (err) {
    console.error("Error in broadcast:", err);
    return json({ error: "Failed to send broadcast" }, { status: 500 });
  }
}

export { POST };
//# sourceMappingURL=_server-4596459f.js.map
