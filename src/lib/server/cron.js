import { db } from '$lib/server/db/index.js';
import { encounters } from '$lib/server/db/schema.js';
import { eq, and, lt } from 'drizzle-orm';

// End-of-day cleanup:
// - Planned (no doctor interaction) → Cancelled
// - On Hold → Discontinued

export async function runEndOfDayCron() {
	const today = new Date();
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

		// Discontinue all On Hold encounters from before today
		const discontinued = await db.update(encounters)
			.set({ status: 'Discontinued', updated_at: new Date() })
			.where(
				and(
					eq(encounters.status, 'On Hold'),
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
	// Check every hour
	setInterval(async () => {
		const now = new Date();
		if (now.getHours() === 23 && now.getMinutes() < 5) {
			await runEndOfDayCron();
		}
	}, 5 * 60 * 1000);

	console.log('[CRON] End-of-day cron enabled');
}
