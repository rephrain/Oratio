import { json } from '@sveltejs/kit';
import { runEndOfDayCron } from '$lib/server/cron.js';

export async function POST({ locals }) {
	if (!locals.user || (locals.user.role !== 'admin' && locals.user.role !== 'kasir')) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const result = await runEndOfDayCron();
		return json({
			success: true,
			message: `End-of-day cron executed: ${result.cancelledCount} Planned encounters cancelled, ${result.discontinuedCount} In Progress/On Hold encounters discontinued.`,
			result
		});
	} catch (err) {
		return json({ error: err.message || 'Failed to run cron' }, { status: 500 });
	}
}
