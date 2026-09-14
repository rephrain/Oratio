import { db } from '$lib/server/db/index.js';
import { encounters, statusHistory } from '$lib/server/db/schema.js';
import { eq, and, lt, inArray, sql } from 'drizzle-orm';
import { cleanupExpiredRefreshTokens } from '$lib/server/auth.js';
import { emitQueueEvent } from '$lib/server/realtime/realtimeService.js';

// End-of-day cleanup:
// - Planned (no doctor interaction) → Cancelled
// - In Progress or On Hold → Discontinued
// - Expired refresh tokens → Cleaned up

export async function runEndOfDayCron() {
	// Today in Jakarta timezone (00:00:00)
	const todayStr = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta' });
	const today = new Date(todayStr);

	try {
		// 1. Cancel all Planned encounters from before today (no doctor interaction)
		const cancelled = await db.update(encounters)
			.set({ status: 'Cancelled', updated_at: new Date() })
			.where(
				and(
					eq(encounters.status, 'Planned'),
					lt(encounters.created_at, today)
				)
			)
			.returning();

		// 2. Discontinue all In Progress or On Hold encounters from before today
		const discontinued = await db.update(encounters)
			.set({ status: 'Discontinued', updated_at: new Date() })
			.where(
				and(
					inArray(encounters.status, ['In Progress', 'On Hold']),
					lt(encounters.created_at, today)
				)
			)
			.returning();

		// Record statusHistory and emit realtime events for affected encounters
		const updatedList = [...cancelled, ...discontinued];
		for (const enc of updatedList) {
			try {
				// Close previous open status history entry
				await db.update(statusHistory)
					.set({ end_at: new Date() })
					.where(
						and(
							eq(statusHistory.encounter_id, enc.id),
							sql`${statusHistory.end_at} IS NULL`
						)
					);

				// Insert new status history entry
				await db.insert(statusHistory).values({
					encounter_id: enc.id,
					status: enc.status,
					start_at: new Date()
				});

				// Emit realtime queue update event
				emitQueueEvent('queue_updated', { id: enc.id, status: enc.status });
			} catch (histErr) {
				console.error(`[CRON] Error recording status history for ${enc.id}:`, histErr);
			}
		}

		// 3. Clean up expired refresh tokens from DB
		const cleanedTokens = await cleanupExpiredRefreshTokens();

		console.log(`[CRON] End-of-day: ${cancelled.length} cancelled, ${discontinued.length} discontinued, ${cleanedTokens ? cleanedTokens.length || 'expired' : 0} refresh tokens cleaned`);
		return {
			cancelledCount: cancelled.length,
			discontinuedCount: discontinued.length,
			totalProcessed: updatedList.length
		};
	} catch (error) {
		console.error('[CRON] Error running end-of-day cron:', error);
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
