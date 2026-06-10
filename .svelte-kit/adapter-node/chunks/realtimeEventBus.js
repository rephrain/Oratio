const ENABLE_LOGS = process.env.ENABLE_REALTIME_LOGS === "true";
class RealtimeEventBus {
  constructor() {
    this._subscriptions = /* @__PURE__ */ new Map();
    this._eventCount = 0;
  }
  /**
   * Publish an event to a specific room.
   * @param {string} room - Room identifier (e.g., 'patient_O000001', 'queue')
   * @param {string} event - Event name (e.g., 'patient_updated')
   * @param {object} data - Event payload (should be minimal)
   * @param {string} [emittedBy] - User ID of the actor
   */
  publish(room, event, data = {}, emittedBy = null) {
    this._eventCount++;
    const envelope = {
      event,
      room,
      data,
      timestamp: Date.now(),
      emittedBy,
      eventId: this._eventCount
    };
    if (ENABLE_LOGS) {
      console.log(`[RT] #${envelope.eventId} ${event} → ${room}`, JSON.stringify(data).substring(0, 200));
    }
    const subscribers = this._subscriptions.get(room);
    if (!subscribers || subscribers.size === 0)
      return;
    for (const callback of subscribers) {
      try {
        callback(envelope);
      } catch (err) {
        console.error(`[RT] Subscriber error on ${room}/${event}:`, err);
      }
    }
  }
  /**
   * Publish an event to multiple rooms at once.
   * @param {string[]} rooms
   * @param {string} event
   * @param {object} data
   * @param {string} [emittedBy]
   */
  publishToMany(rooms, event, data = {}, emittedBy = null) {
    for (const room of rooms) {
      this.publish(room, event, data, emittedBy);
    }
  }
  /**
   * Subscribe to a room.
   * @param {string} room
   * @param {function} callback - Receives envelope { event, room, data, timestamp, emittedBy }
   * @returns {function} Unsubscribe function
   */
  subscribe(room, callback) {
    if (!this._subscriptions.has(room)) {
      this._subscriptions.set(room, /* @__PURE__ */ new Set());
    }
    this._subscriptions.get(room).add(callback);
    return () => {
      const subs = this._subscriptions.get(room);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this._subscriptions.delete(room);
        }
      }
    };
  }
  /**
   * Get stats for monitoring.
   */
  getStats() {
    const roomCounts = {};
    for (const [room, subs] of this._subscriptions) {
      roomCounts[room] = subs.size;
    }
    return {
      totalRooms: this._subscriptions.size,
      totalEvents: this._eventCount,
      roomCounts
    };
  }
}
const eventBus = new RealtimeEventBus();
export {
  eventBus as e
};
