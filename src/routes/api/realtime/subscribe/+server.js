import { json } from '@sveltejs/kit';
import { connectionManager } from '$lib/server/realtime/connectionManager.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { connectionId, rooms, action } = await request.json();

	if (!connectionId || !rooms || !Array.isArray(rooms)) {
		return json({ error: 'Invalid payload' }, { status: 400 });
	}

	const results = [];
	for (const room of rooms) {
		if (action === 'subscribe') {
			const success = await connectionManager.subscribe(connectionId, room);
			results.push({ room, success });
		} else {
			connectionManager.unsubscribe(connectionId, room);
			results.push({ room, success: true });
		}
	}

	return json({ results });
}
