/**
 * Connection Manager — manages active SSE connections and room subscriptions.
 *
 * Responsibilities:
 * - Track active SSE connections per user
 * - Map rooms → connections for efficient broadcasting
 * - Handle heartbeat pings
 * - Enforce max connections per user
 * - Clean up on disconnect
 */

import { eventBus } from './realtimeEventBus.js';
import { canSubscribe } from './authorizationRules.js';

const MAX_CONNECTIONS_PER_USER = 5;
const HEARTBEAT_INTERVAL_MS = 30000;

let _connIdCounter = 0;

class ConnectionManager {
	constructor() {
		/** @type {Map<string, ConnectionInfo>} connectionId → ConnectionInfo */
		this._connections = new Map();

		/** @type {Map<string, Set<string>>} room → Set of connectionIds */
		this._roomConnections = new Map();

		/** @type {Map<string, Set<string>>} userId → Set of connectionIds */
		this._userConnections = new Map();

		// Start heartbeat loop
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
		// Enforce max connections per user
		const userConns = this._userConnections.get(userId);
		if (userConns && userConns.size >= MAX_CONNECTIONS_PER_USER) {
			// Close oldest connection for this user
			const oldest = userConns.values().next().value;
			if (oldest) {
				this.removeConnection(oldest, 'max_connections_exceeded');
			}
		}

		const connectionId = `conn_${++_connIdCounter}_${Date.now()}`;
		const now = Date.now();

		/** @type {ConnectionInfo} */
		const info = {
			connectionId,
			userId,
			role,
			controller,
			rooms: new Set(),
			unsubscribers: new Map(), // room → unsubscribe fn from eventBus
			connectedAt: now,
			lastActivity: now
		};

		this._connections.set(connectionId, info);

		if (!this._userConnections.has(userId)) {
			this._userConnections.set(userId, new Set());
		}
		this._userConnections.get(userId).add(connectionId);

		return { connectionId, rejected: false };
	}

	/**
	 * Remove a connection and clean up all subscriptions.
	 * @param {string} connectionId
	 * @param {string} [reason]
	 */
	removeConnection(connectionId, reason = 'disconnect') {
		const info = this._connections.get(connectionId);
		if (!info) return;

		// Unsubscribe from all rooms
		for (const [room, unsub] of info.unsubscribers) {
			unsub();
			const roomSet = this._roomConnections.get(room);
			if (roomSet) {
				roomSet.delete(connectionId);
				if (roomSet.size === 0) this._roomConnections.delete(room);
			}
		}
		info.unsubscribers.clear();
		info.rooms.clear();

		// Remove from user tracking
		const userConns = this._userConnections.get(info.userId);
		if (userConns) {
			userConns.delete(connectionId);
			if (userConns.size === 0) this._userConnections.delete(info.userId);
		}

		// Try to close the controller
		try {
			info.controller.close();
		} catch {
			// Already closed
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
		if (!info) return false;

		// Already subscribed
		if (info.rooms.has(room)) return true;

		// Authorize
		const allowed = await canSubscribe(room, { id: info.userId, role: info.role });
		if (!allowed) {
			console.warn(`[RT] Denied subscription: user=${info.userId} room=${room}`);
			return false;
		}

		// Subscribe to eventBus
		const unsub = eventBus.subscribe(room, (envelope) => {
			this._sendEvent(connectionId, envelope);
		});

		info.rooms.add(room);
		info.unsubscribers.set(room, unsub);

		if (!this._roomConnections.has(room)) {
			this._roomConnections.set(room, new Set());
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
		if (!info) return;

		const unsub = info.unsubscribers.get(room);
		if (unsub) {
			unsub();
			info.unsubscribers.delete(room);
		}
		info.rooms.delete(room);

		const roomSet = this._roomConnections.get(room);
		if (roomSet) {
			roomSet.delete(connectionId);
			if (roomSet.size === 0) this._roomConnections.delete(room);
		}
	}

	/**
	 * Send an SSE event to a specific connection.
	 * @param {string} connectionId
	 * @param {object} envelope
	 */
	_sendEvent(connectionId, envelope) {
		const info = this._connections.get(connectionId);
		if (!info) return;

		// Don't echo events back to the emitter (the sending user's connection)
		// unless it's a different connection of the same user
		// Actually, we DO want to send to other tabs of the same user
		// but we skip the exact connection that triggered the event
		// For now, send to all — frontend handles dedup via optimistic updates

		try {
			const sseData = `event: ${envelope.event}\ndata: ${JSON.stringify({
				room: envelope.room,
				data: envelope.data,
				timestamp: envelope.timestamp,
				eventId: envelope.eventId,
				emittedBy: envelope.emittedBy
			})}\n\n`;

			info.controller.enqueue(new TextEncoder().encode(sseData));
			info.lastActivity = Date.now();
		} catch (err) {
			// Connection broken — remove it
			this.removeConnection(connectionId, 'write_error');
		}
	}

	/**
	 * Send heartbeat pings to all connections.
	 */
	_sendHeartbeats() {
		const encoder = new TextEncoder();
		const pingData = encoder.encode(`: ping ${Date.now()}\n\n`);

		for (const [connectionId, info] of this._connections) {
			try {
				info.controller.enqueue(pingData);
			} catch {
				this.removeConnection(connectionId, 'heartbeat_failed');
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
			connections: Array.from(this._connections.values()).map(c => ({
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
		if (!conns || conns.size === 0) return null;
		return conns.values().next().value;
	}
}

// Singleton
export const connectionManager = new ConnectionManager();

/**
 * @typedef {object} ConnectionInfo
 * @property {string} connectionId
 * @property {string} userId
 * @property {string} role
 * @property {ReadableStreamDefaultController} controller
 * @property {Set<string>} rooms
 * @property {Map<string, function>} unsubscribers
 * @property {number} connectedAt
 * @property {number} lastActivity
 */
