import { c as connectionManager } from "../../../../../chunks/connectionManager.js";
async function GET({ url, locals }) {
  const user = locals.user;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const initialRooms = url.searchParams.get("rooms")?.split(",").filter(Boolean) || [];
  const stream = new ReadableStream({
    async start(controller) {
      const { connectionId, rejected, reason } = connectionManager.addConnection(user.id, user.role, controller);
      if (rejected) {
        controller.enqueue(new TextEncoder().encode(`event: error
data: ${JSON.stringify({ reason })}

`));
        controller.close();
        return;
      }
      controller.enqueue(new TextEncoder().encode(`event: connected
data: ${JSON.stringify({ connectionId })}

`));
      for (const room of initialRooms) {
        await connectionManager.subscribe(connectionId, room);
      }
    },
    cancel(reason) {
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
export {
  GET
};
