import { connectionManager } from '$lib/server/realtime/connectionManager.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, locals }) {
	const user = locals.user;
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const initialRooms = url.searchParams.get('rooms')?.split(',').filter(Boolean) || [];

	const stream = new ReadableStream({
		async start(controller) {
			const { connectionId, rejected, reason } = connectionManager.addConnection(user.id, user.role, controller);

			if (rejected) {
				controller.enqueue(new TextEncoder().encode(`event: error\ndata: ${JSON.stringify({ reason })}\n\n`));
				controller.close();
				return;
			}

			// Send initial connection event
			controller.enqueue(new TextEncoder().encode(`event: connected\ndata: ${JSON.stringify({ connectionId })}\n\n`));

			// Subscribe to initial rooms
			for (const room of initialRooms) {
				await connectionManager.subscribe(connectionId, room);
			}

			// Keep connection open
		},
		cancel(reason) {
			// This logic is handled by connectionManager via heartbeats/write errors, 
			// but we can try to find and remove if we had the connectionId here.
			// Actually, connectionManager's heartbeat and write error handling is more robust for SSE.
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		}
	});
}
