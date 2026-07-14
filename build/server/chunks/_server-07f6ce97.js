import { c as connectionManager } from './connectionManager-5b830754.js';
import './realtimeEventBus-093e17ac.js';
import './index3-0e5c3567.js';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';

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

export { GET };
//# sourceMappingURL=_server-07f6ce97.js.map
