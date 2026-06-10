import { writable } from 'svelte/store';
import { onEvent, subscribe, unsubscribe } from './realtimeConnection.js';
import { onDestroy } from 'svelte';

/**
 * Creates a reactive list store that initializes from a fetch 
 * and updates via real-time events.
 */
export function createRealtimeList(fetchUrl, config = {}) {
	const { rooms = [], events = {}, filter = null } = config;
	const { subscribe: s, set, update } = writable([]);
	let initialLoaded = false;

	async function load() {
		try {
			const res = await fetch(fetchUrl);
			const json = await res.json();
			const data = json.data || json;
			set(data);
			initialLoaded = true;
		} catch (err) {
			console.error(`[RT Store] Load failed for ${fetchUrl}:`, err);
		}
	}

	// Register SSE listeners
	const unsubscribers = [];
	for (const [eventType, handler] of Object.entries(events)) {
		unsubscribers.push(onEvent(eventType, (payload) => {
			if (!initialLoaded) return;
			
			// Optional: check if event is older than initial fetch 
			// (requires timestamp in fetch and event)

			update(list => {
				const newList = handler(list, payload.data);
				return filter ? newList.filter(filter) : newList;
			});
		}));
	}

	// Dynamic room management
	if (rooms.length > 0) {
		subscribe(rooms);
	}

	return {
		subscribe: s,
		load,
		destroy: () => {
			for (const u of unsubscribers) u();
			if (rooms.length > 0) {
				unsubscribe(rooms);
			}
		}
	};
}

/**
 * Creates a reactive detail store for a single object.
 */
export function createRealtimeDetail(fetchUrl, config = {}) {
	const { rooms = [], events = {} } = config;
	const { subscribe: s, set, update } = writable(null);
	let initialLoaded = false;

	async function load() {
		try {
			const res = await fetch(fetchUrl);
			const data = await res.json();
			set(data);
			initialLoaded = true;
		} catch (err) {
			console.error(`[RT Store] Load failed for ${fetchUrl}:`, err);
		}
	}

	// Register SSE listeners
	const unsubscribers = [];
	for (const [eventType, handler] of Object.entries(events)) {
		unsubscribers.push(onEvent(eventType, (payload) => {
			if (!initialLoaded) return;
			
			update(current => {
				return handler(current, payload.data);
			});
		}));
	}

	// Dynamic room management
	if (rooms.length > 0) {
		subscribe(rooms);
	}

	return {
		subscribe: s,
		load,
		set,
		update,
		destroy: () => {
			for (const u of unsubscribers) u();
			if (rooms.length > 0) {
				unsubscribe(rooms);
			}
		}
	};
}
