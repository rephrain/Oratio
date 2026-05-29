import { j as json } from './index-d7f43214.js';
import { d as db, z as chatConversations, s as shifts, u as users, A as chatMessages } from './index3-41fb71fd.js';
import { or, eq, desc, sql, and, ne, isNull } from 'drizzle-orm';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';

async function GET({ locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = locals.user.id;
  const conversations = await db.select({
    id: chatConversations.id,
    participant_a: chatConversations.participant_a,
    participant_b: chatConversations.participant_b,
    last_message_at: chatConversations.last_message_at,
    created_at: chatConversations.created_at
  }).from(chatConversations).where(
    or(
      eq(chatConversations.participant_a, userId),
      eq(chatConversations.participant_b, userId)
    )
  ).orderBy(desc(chatConversations.last_message_at));
  const allShifts = await db.select().from(shifts);
  const nowWIB = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const currentDayOfWeek = nowWIB.getDay();
  const currentHours = nowWIB.getHours();
  const currentMinutes = nowWIB.getMinutes();
  const currentTime = `${currentHours.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}:00`;
  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const otherUserId = conv.participant_a === userId ? conv.participant_b : conv.participant_a;
      const [otherUser] = await db.select({
        id: users.id,
        name: users.name,
        role: users.role,
        profile_image_url: users.profile_image_url
      }).from(users).where(eq(users.id, otherUserId)).limit(1);
      let is_online = false;
      if (otherUser) {
        is_online = allShifts.some(
          (shift) => shift.user_id === otherUser.id && shift.day_of_week === currentDayOfWeek && shift.start_time <= currentTime && shift.end_time >= currentTime
        );
      }
      const [lastMessage] = await db.select({
        content: chatMessages.content,
        sender_id: chatMessages.sender_id,
        created_at: chatMessages.created_at
      }).from(chatMessages).where(eq(chatMessages.conversation_id, conv.id)).orderBy(desc(chatMessages.created_at)).limit(1);
      const [unreadResult] = await db.select({ count: sql`count(*)::int` }).from(chatMessages).where(
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
async function POST({ request, locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const { targetUserId } = await request.json();
  if (!targetUserId) {
    return json({ error: "targetUserId is required" }, { status: 400 });
  }
  const userId = locals.user.id;
  const [pA, pB] = [userId, targetUserId].sort();
  const [existing] = await db.select().from(chatConversations).where(
    and(
      eq(chatConversations.participant_a, pA),
      eq(chatConversations.participant_b, pB)
    )
  ).limit(1);
  if (existing) {
    return json({ conversation: existing });
  }
  const [newConv] = await db.insert(chatConversations).values({
    participant_a: pA,
    participant_b: pB
  }).returning();
  return json({ conversation: newConv }, { status: 201 });
}

export { GET, POST };
//# sourceMappingURL=_server-d3d2d582.js.map
