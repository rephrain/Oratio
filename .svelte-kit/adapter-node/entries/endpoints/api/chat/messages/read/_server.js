import { j as json } from "../../../../../../chunks/index.js";
import { d as db, z as chatConversations, A as chatMessages } from "../../../../../../chunks/index3.js";
import { and, eq, or, ne, isNull } from "drizzle-orm";
async function POST({ request, locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const { conversationId } = await request.json();
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
  await db.update(chatMessages).set({ read_at: /* @__PURE__ */ new Date() }).where(
    and(
      eq(chatMessages.conversation_id, conversationId),
      ne(chatMessages.sender_id, userId),
      isNull(chatMessages.read_at)
    )
  );
  return json({ success: true });
}
export {
  POST
};
