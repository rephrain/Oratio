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

	const prevEncounterDateFilter = dateParam
		? sql`(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = ${dateParam}::date - INTERVAL '1 day'`
		: sql`(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = (CURRENT_TIMESTAMP AT TIME ZONE ${timezone})::date - INTERVAL '1 day'`;

	const prevStatusHistoryDateFilter = dateParam
		? sql`(${statusHistory.start_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = ${dateParam}::date - INTERVAL '1 day'`
		: sql`(${statusHistory.start_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = (CURRENT_TIMESTAMP AT TIME ZONE ${timezone})::date - INTERVAL '1 day'`;

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

		// 3. Average Treatment Time (status = 'In Progress') for the selected date
		const avgTreatmentResult = await db.select({
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
			eq(statusHistory.status, 'In Progress'),
			sql`${statusHistory.end_at} IS NOT NULL`,
			statusHistoryDateFilter
		));

		// 1b. Prev Core daily counts
		const prevCountsResult = await db.select({
			total: sql`COUNT(${encounters.id})`,
			completed: sql`COUNT(CASE WHEN ${encounters.status} IN ('Discharged', 'Completed') THEN 1 END)`
		})
		.from(encounters)
		.where(and(
			eq(encounters.doctor_id, doctorId),
			notInArray(encounters.status, ['Cancelled', 'Discontinued']),
			prevEncounterDateFilter
		));

		const prevCounts = prevCountsResult[0] || { total: '0', completed: '0' };
		const prevTotalToday = Number(prevCounts.total || 0);
		const prevCompletedToday = Number(prevCounts.completed || 0);

		// 2b. Prev Average Wait Time
		const prevAvgWaitResult = await db.select({
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
			prevStatusHistoryDateFilter
		));

		// 3b. Prev Average Treatment Time
		const prevAvgTreatmentResult = await db.select({
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
			eq(statusHistory.status, 'In Progress'),
			sql`${statusHistory.end_at} IS NOT NULL`,
			prevStatusHistoryDateFilter
		));

		// Parse values: return '<1' if it's less than a minute but greater than 0
		const parseTime = (val) => {
			if (!val) return 0;
			const num = parseFloat(val);
			if (num > 0 && num < 1) return '<1';
			return Math.round(num);
		};

		const avgWaitMinutes = parseTime(avgWaitResult[0]?.avgMinutes);
		const avgTreatmentMinutes = parseTime(avgTreatmentResult[0]?.avgMinutes);
		
		const getNumericTime = (val) => {
			const parsed = parseTime(val);
			return parsed === '<1' ? 0.5 : Number(parsed || 0);
		};

		const prevAvgWaitMinutes = getNumericTime(prevAvgWaitResult[0]?.avgMinutes);
		const prevAvgTreatmentMinutes = getNumericTime(prevAvgTreatmentResult[0]?.avgMinutes);
		
		const currentAvgWait = getNumericTime(avgWaitResult[0]?.avgMinutes);
		const currentAvgTreatment = getNumericTime(avgTreatmentResult[0]?.avgMinutes);

		const calcChange = (curr, prev) => {
			if (prev === 0) return curr > 0 ? 100 : 0;
			return Math.round(((curr - prev) / prev) * 100);
		};

		return json({
			patientsToday: totalToday,
			patientsTodayChange: calcChange(totalToday, prevTotalToday),
			completedToday: Number(counts.completed || 0),
			completedTodayChange: calcChange(Number(counts.completed || 0), prevCompletedToday),
			avgWaitMinutes,
			avgWaitMinutesChange: calcChange(currentAvgWait, prevAvgWaitMinutes),
			avgTreatmentMinutes,
			avgTreatmentMinutesChange: calcChange(currentAvgTreatment, prevAvgTreatmentMinutes)
		});
	} catch (error) {
		console.error('Error in stats dashboard API:', error);
		return json({ error: 'Failed to fetch doctor dashboard statistics' }, { status: 500 });
	}
}
