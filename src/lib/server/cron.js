import { db } from '$lib/server/db/index.js';
import { encounters } from '$lib/server/db/schema.js';
import { eq, and, lt, inArray } from 'drizzle-orm';

// End-of-day cleanup:
// - Planned (no doctor interaction) → Cancelled
// - In Progress or On Hold → Discontinued

export async function runEndOfDayCron() {
	// today in Jakarta timezone
	const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
	today.setHours(0, 0, 0, 0);

	try {
		// Cancel all Planned encounters from before today
		const cancelled = await db.update(encounters)
			.set({ status: 'Cancelled', updated_at: new Date() })
			.where(
				and(
					eq(encounters.status, 'Planned'),
					lt(encounters.created_at, today)
				)
			)
			.returning();

		// Discontinue all In Progress or On Hold encounters from before today
		const discontinued = await db.update(encounters)
			.set({ status: 'Discontinued', updated_at: new Date() })
			.where(
				and(
					inArray(encounters.status, ['In Progress', 'On Hold']),
					lt(encounters.created_at, today)
				)
			)
			.returning();

		console.log(`[CRON] End-of-day: ${cancelled.length} cancelled, ${discontinued.length} discontinued`);
		return { cancelled: cancelled.length, discontinued: discontinued.length };
	} catch (error) {
		console.error('[CRON] Error:', error);
		throw error;
	}
}

// Run cron at startup if enabled
if (process.env.ENABLE_CRON === 'true') {
	setInterval(async () => {
		const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
		// Run at the beginning of the day (00:00 - 00:05)
		if (now.getHours() === 0 && now.getMinutes() < 5) {
			await runEndOfDayCron();
		}
	}, 5 * 60 * 1000);

	console.log('[CRON] End-of-day cron enabled');
}
