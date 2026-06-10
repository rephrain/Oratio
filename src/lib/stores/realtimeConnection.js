import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export const connectionStatus = writable('disconnected'); // 'connecting', 'connected', 'disconnected', 'error'
export const connectionId = writable(null);

let eventSource = null;
let reconnectTimeout = null;
let reconnectAttempts = 0;
let subscribedRooms = new Set();
const eventHandlers = new Map(); // eventType -> Set of callbacks

/**
 * Connect to the SSE stream.
 * @param {string[]} initialRooms 
 */
export function connect(initialRooms = []) {
	if (!browser || eventSource) return;

	for (const room of initialRooms) {
		subscribedRooms.add(room);
	}

	const roomsParam = Array.from(subscribedRooms).join(',');
	const url = `/api/realtime/stream?rooms=${encodeURIComponent(roomsParam)}`;

	connectionStatus.set('connecting');
	eventSource = new EventSource(url);

	eventSource.onopen = () => {
		console.log('[RT] SSE Connected');
		connectionStatus.set('connected');
		reconnectAttempts = 0;
	};

	eventSource.onerror = (err) => {
		console.error('[RT] SSE Error:', err);
		connectionStatus.set('error');
		eventSource.close();
		eventSource = null;
		
		// Attempt reconnect
		scheduleReconnect();
	};

	// Special event: server assigns connectionId
	eventSource.addEventListener('connected', (e) => {
		const data = JSON.parse(e.data);
		connectionId.set(data.connectionId);
		console.log('[RT] Connection ID assigned:', data.connectionId);
	});

	// Generic message handler - find specific listeners
	eventSource.onmessage = (e) => {
		// EventSource.onmessage only triggers for events without a named 'event:' field
		// We use named events mostly, so addEventListener is preferred.
	};

	// Add listener for all known event types if possible, 
	// or use a catch-all if our SSE implementation supports it.
	// Since we use named events, we'll need to register them.
}

/**
 * Register a listener for a specific real-time event type.
 */
export function onEvent(eventType, callback) {
	if (!eventHandlers.has(eventType)) {
		eventHandlers.set(eventType, new Set());
		
		// If connected, add listener to EventSource
		if (eventSource) {
			eventSource.addEventListener(eventType, handleSseEvent);
		}
	}
	eventHandlers.get(eventType).add(callback);

	return () => {
		const handlers = eventHandlers.get(eventType);
		if (handlers) {
			handlers.delete(callback);
			if (handlers.size === 0) {
				eventHandlers.delete(eventType);
				if (eventSource) {
					eventSource.removeEventListener(eventType, handleSseEvent);
				}
			}
		}
	};
}

function handleSseEvent(e) {
	const data = JSON.parse(e.data);
	const eventType = e.type;
	
	const handlers = eventHandlers.get(eventType);
	if (handlers) {
		for (const cb of handlers) {
			cb(data);
		}
	}
}

/**
 * Subscribe to more rooms dynamically.
 */
export async function subscribe(rooms = []) {
	const connId = get(connectionId);
	if (!connId) return;

	const newRooms = rooms.filter(r => !subscribedRooms.has(r));
	if (newRooms.length === 0) return;

	try {
		const res = await fetch('/api/realtime/subscribe', {
			method: 'POST',
			body: JSON.stringify({ connectionId: connId, rooms: newRooms, action: 'subscribe' })
		});
		
		if (res.ok) {
			for (const r of newRooms) subscribedRooms.add(r);
		}
	} catch (err) {
		console.error('[RT] Subscribe failed:', err);
	}
}

/**
 * Unsubscribe from rooms dynamically.
 */
export async function unsubscribe(rooms = []) {
	const connId = get(connectionId);
	if (!connId) return;

	try {
		await fetch('/api/realtime/subscribe', {
			method: 'POST',
			body: JSON.stringify({ connectionId: connId, rooms, action: 'unsubscribe' })
		});
		
		for (const r of rooms) subscribedRooms.delete(r);
	} catch (err) {
		console.error('[RT] Unsubscribe failed:', err);
	}
}

function scheduleReconnect() {
	if (reconnectTimeout) clearTimeout(reconnectTimeout);
	
	reconnectAttempts++;
	const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
	
	console.log(`[RT] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})...`);
	reconnectTimeout = setTimeout(() => {
		connect();
	}, delay);
}

export function disconnect() {
	if (eventSource) {
		eventSource.close();
		eventSource = null;
	}
	if (reconnectTimeout) {
		clearTimeout(reconnectTimeout);
		reconnectTimeout = null;
	}
	connectionStatus.set('disconnected');
	connectionId.set(null);
}
