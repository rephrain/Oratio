import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { encounters, statusHistory } from '$lib/server/db/schema.js';
import { eq, and, sql, notInArray } from 'drizzle-orm';

export async function GET({ locals, url }) {
	if (!locals.user?.id || locals.user.role !== 'dokter') {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const doctorId = locals.user.id;
	const timezone = 'Asia/Jakarta';

	// Accept a date query param (YYYY-MM-DD) so the frontend can sync its filterDate
	// Falls back to today in Jakarta if not provided
	const dateParam = url.searchParams.get('date');

	// Build the date comparison fragment
	// If a date param is given, compare against that literal date
	// Otherwise compare against CURRENT_TIMESTAMP converted to Jakarta
	const encounterDateFilter = dateParam
		? sql`(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = ${dateParam}::date`
		: sql`(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = (CURRENT_TIMESTAMP AT TIME ZONE ${timezone})::date`;

	const statusHistoryDateFilter = dateParam
		? sql`(${statusHistory.start_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = ${dateParam}::date`
		: sql`(${statusHistory.start_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = (CURRENT_TIMESTAMP AT TIME ZONE ${timezone})::date`;

	try {
		// 1. Core daily counts
		const countsResult = await db.select({
			total: sql`COUNT(${encounters.id})`,
			completed: sql`COUNT(CASE WHEN ${encounters.status} IN ('Discharged', 'Completed') THEN 1 END)`
		})
		.from(encounters)
		.where(and(
			eq(encounters.doctor_id, doctorId),
			notInArray(encounters.status, ['Cancelled', 'Discontinued']),
			encounterDateFilter
		));

		const counts = countsResult[0] || { total: '0', completed: '0' };
		const totalToday = Number(counts.total || 0);

		// 2. Average Wait Time (status = 'Arrived') for the selected date
		// Only count completed periods (end_at IS NOT NULL) to get actual wait durations
		const avgWaitResult = await db.select({
			avgMinutes: sql`AVG(
				EXTRACT(EPOCH FROM (
					${statusHistory.end_at} - ${statusHistory.start_at}
				)) / 60
			)`
		})
		.from(statusHistory)
		.innerJoin(encounters, eq(statusHistory.encounter_id, encounters.id))
		.where(and(
			eq(encounters.doctor_id, doctorId),
			eq(statusHistory.status, 'Arrived'),
			sql`${statusHistory.end_at} IS NOT NULL`,
			statusHistoryDateFilter
		));

		// avgMinutes can be null if no arrivals, or a string from Postgres
		const avgWaitVal = avgWaitResult[0]?.avgMinutes;
		const avgWaitMinutes = avgWaitVal ? Math.round(parseFloat(avgWaitVal)) : 0;

		return json({
			patientsToday: totalToday,
			completedToday: Number(counts.completed || 0),
			avgWaitMinutes: avgWaitMinutes > 0 ? avgWaitMinutes : 0
		});
	} catch (error) {
		console.error('Error in stats dashboard API:', error);
		return json({ error: 'Failed to fetch doctor dashboard statistics' }, { status: 500 });
	}
}
