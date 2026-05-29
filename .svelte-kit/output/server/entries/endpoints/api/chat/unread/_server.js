import { j as json } from "../../../../../chunks/index.js";
import { d as db, z as chatConversations, A as chatMessages } from "../../../../../chunks/index3.js";
import { or, eq, sql, and, ne, isNull } from "drizzle-orm";
async function GET({ locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const userId = locals.user.id;
    const conversations = await db.select({ id: chatConversations.id }).from(chatConversations).where(
      or(
        eq(chatConversations.participant_a, userId),
        eq(chatConversations.participant_b, userId)
      )
    );
    if (conversations.length === 0) {
      return json({ unreadCount: 0 });
    }
    const convIds = conversations.map((c) => c.id);
    const [result] = await db.select({ count: sql`count(*)::int` }).from(chatMessages).where(
      and(
        sql`${chatMessages.conversation_id} IN (${sql.join(convIds.map((id) => sql`${id}`), sql`, `)})`,
        ne(chatMessages.sender_id, userId),
        isNull(chatMessages.read_at)
      )
    );
    return json({ unreadCount: result?.count || 0 });
  } catch (err) {
    console.error("Error fetching unread count:", err.message);
    return json({ unreadCount: 0 });
  }
}
export {
  GET
};
