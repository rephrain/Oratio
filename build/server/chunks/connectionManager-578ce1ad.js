import { e as eventBus } from './realtimeEventBus-093e17ac.js';
import { d as db, e as encounters, z as chatConversations } from './index3-775267d5.js';
import { eq } from 'drizzle-orm';

async function canSubscribe(room, user) {
  if (!room || !user?.id)
    return false;
  if (room.startsWith("user_")) {
    const targetUserId = room.substring(5);
    return targetUserId === user.id;
  }
  if (room.startsWith("patient_")) {
    return true;
  }
  if (room.startsWith("encounter_")) {
    if (user.role === "admin")
      return true;
    const encounterId = room.substring(10);
    try {
      const [enc] = await db.select({
        doctor_id: encounters.doctor_id,
        kasir_id: encounters.kasir_id
      }).from(encounters).where(eq(encounters.id, encounterId)).limit(1);
      if (!enc)
        return false;
      return enc.doctor_id === user.id || enc.kasir_id === user.id;
    } catch {
      return false;
    }
  }
  if (room.startsWith("conversation_")) {
    const conversationId = room.substring(13);
    try {
      const [conv] = await db.select({
        participant_a: chatConversations.participant_a,
        participant_b: chatConversations.participant_b
      }).from(chatConversations).where(eq(chatConversations.id, conversationId)).limit(1);
      if (!conv)
        return false;
      return conv.participant_a === user.id || conv.participant_b === user.id;
    } catch {
      return false;
    }
  }
  if (room === "queue" || room === "dashboard") {
    return true;
  }
  return false;
}
const MAX_CONNECTIONS_PER_USER = 5;
const HEARTBEAT_INTERVAL_MS = 3e4;
let _connIdCounter = 0;
class ConnectionManager {
  constructor() {
    this._connections = /* @__PURE__ */ new Map();
    this._roomConnections = /* @__PURE__ */ new Map();
    this._userConnections = /* @__PURE__ */ new Map();
    this._heartbeatTimer = setInterval(() => this._sendHeartbeats(), HEARTBEAT_INTERVAL_MS);
  }
  /**
   * Register a new SSE connection.
   * @param {string} userId
   * @param {string} role
   * @param {ReadableStreamDefaultController} controller - SSE stream controller
   * @returns {{ connectionId: string, rejected: boolean, reason?: string }}
   */
  addConnection(userId, role, controller) {
    const userConns = this._userConnections.get(userId);
    if (userConns && userConns.size >= MAX_CONNECTIONS_PER_USER) {
      const oldest = userConns.values().next().value;
      if (oldest) {
        this.removeConnection(oldest, "max_connections_exceeded");
      }
    }
    const connectionId = `conn_${++_connIdCounter}_${Date.now()}`;
    const now = Date.now();
    const info = {
      connectionId,
      userId,
      role,
      controller,
      rooms: /* @__PURE__ */ new Set(),
      unsubscribers: /* @__PURE__ */ new Map(),
      // room → unsubscribe fn from eventBus
      connectedAt: now,
      lastActivity: now
    };
    this._connections.set(connectionId, info);
    if (!this._userConnections.has(userId)) {
      this._userConnections.set(userId, /* @__PURE__ */ new Set());
    }
    this._userConnections.get(userId).add(connectionId);
    return { connectionId, rejected: false };
  }
  /**
   * Remove a connection and clean up all subscriptions.
   * @param {string} connectionId
   * @param {string} [reason]
   */
  removeConnection(connectionId, reason = "disconnect") {
    const info = this._connections.get(connectionId);
    if (!info)
      return;
    for (const [room, unsub] of info.unsubscribers) {
      unsub();
      const roomSet = this._roomConnections.get(room);
      if (roomSet) {
        roomSet.delete(connectionId);
        if (roomSet.size === 0)
          this._roomConnections.delete(room);
      }
    }
    info.unsubscribers.clear();
    info.rooms.clear();
    const userConns = this._userConnections.get(info.userId);
    if (userConns) {
      userConns.delete(connectionId);
      if (userConns.size === 0)
        this._userConnections.delete(info.userId);
    }
    try {
      info.controller.close();
    } catch {
    }
    this._connections.delete(connectionId);
  }
  /**
   * Subscribe a connection to a room (with authorization).
   * @param {string} connectionId
   * @param {string} room
   * @returns {Promise<boolean>}
   */
  async subscribe(connectionId, room) {
    const info = this._connections.get(connectionId);
    if (!info)
      return false;
    if (info.rooms.has(room))
      return true;
    const allowed = await canSubscribe(room, { id: info.userId, role: info.role });
    if (!allowed) {
      console.warn(`[RT] Denied subscription: user=${info.userId} room=${room}`);
      return false;
    }
    const unsub = eventBus.subscribe(room, (envelope) => {
      this._sendEvent(connectionId, envelope);
    });
    info.rooms.add(room);
    info.unsubscribers.set(room, unsub);
    if (!this._roomConnections.has(room)) {
      this._roomConnections.set(room, /* @__PURE__ */ new Set());
    }
    this._roomConnections.get(room).add(connectionId);
    return true;
  }
  /**
   * Unsubscribe a connection from a room.
   * @param {string} connectionId
   * @param {string} room
   */
  unsubscribe(connectionId, room) {
    const info = this._connections.get(connectionId);
    if (!info)
      return;
    const unsub = info.unsubscribers.get(room);
    if (unsub) {
      unsub();
      info.unsubscribers.delete(room);
    }
    info.rooms.delete(room);
    const roomSet = this._roomConnections.get(room);
    if (roomSet) {
      roomSet.delete(connectionId);
      if (roomSet.size === 0)
        this._roomConnections.delete(room);
    }
  }
  /**
   * Send an SSE event to a specific connection.
   * @param {string} connectionId
   * @param {object} envelope
   */
  _sendEvent(connectionId, envelope) {
    const info = this._connections.get(connectionId);
    if (!info)
      return;
    try {
      const sseData = `event: ${envelope.event}
data: ${JSON.stringify({
        room: envelope.room,
        data: envelope.data,
        timestamp: envelope.timestamp,
        eventId: envelope.eventId,
        emittedBy: envelope.emittedBy
      })}

`;
      info.controller.enqueue(new TextEncoder().encode(sseData));
      info.lastActivity = Date.now();
    } catch (err) {
      this.removeConnection(connectionId, "write_error");
    }
  }
  /**
   * Send heartbeat pings to all connections.
   */
  _sendHeartbeats() {
    const encoder = new TextEncoder();
    const pingData = encoder.encode(`: ping ${Date.now()}

`);
    for (const [connectionId, info] of this._connections) {
      try {
        info.controller.enqueue(pingData);
      } catch {
        this.removeConnection(connectionId, "heartbeat_failed");
      }
    }
  }
  /**
   * Get connection stats for monitoring.
   */
  getStats() {
    return {
      totalConnections: this._connections.size,
      totalUsers: this._userConnections.size,
      totalRooms: this._roomConnections.size,
      connections: Array.from(this._connections.values()).map((c) => ({
        connectionId: c.connectionId,
        userId: c.userId,
        role: c.role,
        rooms: Array.from(c.rooms),
        connectedAt: c.connectedAt
      }))
    };
  }
  /**
   * Find connection ID by user ID (returns first found).
   * @param {string} userId
   * @returns {string|null}
   */
  getConnectionIdForUser(userId) {
    const conns = this._userConnections.get(userId);
    if (!conns || conns.size === 0)
      return null;
    return conns.values().next().value;
  }
}
const connectionManager = new ConnectionManager();

export { connectionManager as c };
//# sourceMappingURL=connectionManager-578ce1ad.js.map
