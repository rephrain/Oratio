import { j as json } from "../../../../../../../chunks/index.js";
import { d as db, a as notificationReads } from "../../../../../../../chunks/index3.js";
async function POST({ params, locals }) {
  try {
    const user = locals.user;
    if (!user)
      return json({ error: "Unauthorized" }, { status: 401 });
    const { id } = params;
    await db.insert(notificationReads).values({
      notification_id: id,
      user_id: user.id
    }).onConflictDoNothing();
    return json({ success: true });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    return json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
export {
  POST
};
