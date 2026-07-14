import { j as json } from './index-d7f43214.js';
import { c as connectionManager } from './connectionManager-5b830754.js';
import './realtimeEventBus-093e17ac.js';
import './index3-0e5c3567.js';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';

async function POST({ request, locals }) {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const { connectionId, rooms, action } = await request.json();
  if (!connectionId || !rooms || !Array.isArray(rooms)) {
    return json({ error: "Invalid payload" }, { status: 400 });
  }
  const results = [];
  for (const room of rooms) {
    if (action === "subscribe") {
      const success = await connectionManager.subscribe(connectionId, room);
      results.push({ room, success });
    } else {
      connectionManager.unsubscribe(connectionId, room);
      results.push({ room, success: true });
    }
  }
  return json({ results });
}

export { POST };
//# sourceMappingURL=_server-e84ef7b7.js.map
