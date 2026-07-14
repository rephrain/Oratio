import { j as json } from './index-d7f43214.js';
import { e as encounters, h as statusHistory, d as db } from './index3-0e5c3567.js';
import { sql, and, eq, notInArray } from 'drizzle-orm';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';

async function GET({ locals, url }) {
  if (!locals.user?.id || locals.user.role !== "dokter") {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const doctorId = locals.user.id;
  const timezone = "Asia/Jakarta";
  const dateParam = url.searchParams.get("date");
  const encounterDateFilter = dateParam ? sql`(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = ${dateParam}::date` : sql`(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = (CURRENT_TIMESTAMP AT TIME ZONE ${timezone})::date`;
  const statusHistoryDateFilter = dateParam ? sql`(${statusHistory.start_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = ${dateParam}::date` : sql`(${statusHistory.start_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = (CURRENT_TIMESTAMP AT TIME ZONE ${timezone})::date`;
  const prevEncounterDateFilter = dateParam ? sql`(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = ${dateParam}::date - INTERVAL '1 day'` : sql`(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = (CURRENT_TIMESTAMP AT TIME ZONE ${timezone})::date - INTERVAL '1 day'`;
  const prevStatusHistoryDateFilter = dateParam ? sql`(${statusHistory.start_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = ${dateParam}::date - INTERVAL '1 day'` : sql`(${statusHistory.start_at} AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::date = (CURRENT_TIMESTAMP AT TIME ZONE ${timezone})::date - INTERVAL '1 day'`;
  try {
    const countsResult = await db.select({
      total: sql`COUNT(${encounters.id})`,
      completed: sql`COUNT(CASE WHEN ${encounters.status} IN ('Discharged', 'Completed') THEN 1 END)`
    }).from(encounters).where(and(
      eq(encounters.doctor_id, doctorId),
      notInArray(encounters.status, ["Cancelled", "Discontinued"]),
      encounterDateFilter
    ));
    const counts = countsResult[0] || { total: "0", completed: "0" };
    const totalToday = Number(counts.total || 0);
    const avgWaitResult = await db.select({
      avgMinutes: sql`AVG(
				EXTRACT(EPOCH FROM (
					${statusHistory.end_at} - ${statusHistory.start_at}
				)) / 60
			)`
    }).from(statusHistory).innerJoin(encounters, eq(statusHistory.encounter_id, encounters.id)).where(and(
      eq(encounters.doctor_id, doctorId),
      eq(statusHistory.status, "Arrived"),
      sql`${statusHistory.end_at} IS NOT NULL`,
      statusHistoryDateFilter
    ));
    const avgTreatmentResult = await db.select({
      avgMinutes: sql`AVG(
				EXTRACT(EPOCH FROM (
					${statusHistory.end_at} - ${statusHistory.start_at}
				)) / 60
			)`
    }).from(statusHistory).innerJoin(encounters, eq(statusHistory.encounter_id, encounters.id)).where(and(
      eq(encounters.doctor_id, doctorId),
      eq(statusHistory.status, "In Progress"),
      sql`${statusHistory.end_at} IS NOT NULL`,
      statusHistoryDateFilter
    ));
    const prevCountsResult = await db.select({
      total: sql`COUNT(${encounters.id})`,
      completed: sql`COUNT(CASE WHEN ${encounters.status} IN ('Discharged', 'Completed') THEN 1 END)`
    }).from(encounters).where(and(
      eq(encounters.doctor_id, doctorId),
      notInArray(encounters.status, ["Cancelled", "Discontinued"]),
      prevEncounterDateFilter
    ));
    const prevCounts = prevCountsResult[0] || { total: "0", completed: "0" };
    const prevTotalToday = Number(prevCounts.total || 0);
    const prevCompletedToday = Number(prevCounts.completed || 0);
    const prevAvgWaitResult = await db.select({
      avgMinutes: sql`AVG(
				EXTRACT(EPOCH FROM (
					${statusHistory.end_at} - ${statusHistory.start_at}
				)) / 60
			)`
    }).from(statusHistory).innerJoin(encounters, eq(statusHistory.encounter_id, encounters.id)).where(and(
      eq(encounters.doctor_id, doctorId),
      eq(statusHistory.status, "Arrived"),
      sql`${statusHistory.end_at} IS NOT NULL`,
      prevStatusHistoryDateFilter
    ));
    const prevAvgTreatmentResult = await db.select({
      avgMinutes: sql`AVG(
				EXTRACT(EPOCH FROM (
					${statusHistory.end_at} - ${statusHistory.start_at}
				)) / 60
			)`
    }).from(statusHistory).innerJoin(encounters, eq(statusHistory.encounter_id, encounters.id)).where(and(
      eq(encounters.doctor_id, doctorId),
      eq(statusHistory.status, "In Progress"),
      sql`${statusHistory.end_at} IS NOT NULL`,
      prevStatusHistoryDateFilter
    ));
    const parseTime = (val) => {
      if (!val)
        return 0;
      const num = parseFloat(val);
      if (num > 0 && num < 1)
        return "<1";
      return Math.round(num);
    };
    const avgWaitMinutes = parseTime(avgWaitResult[0]?.avgMinutes);
    const avgTreatmentMinutes = parseTime(avgTreatmentResult[0]?.avgMinutes);
    const getNumericTime = (val) => {
      const parsed = parseTime(val);
      return parsed === "<1" ? 0.5 : Number(parsed || 0);
    };
    const prevAvgWaitMinutes = getNumericTime(prevAvgWaitResult[0]?.avgMinutes);
    const prevAvgTreatmentMinutes = getNumericTime(prevAvgTreatmentResult[0]?.avgMinutes);
    const currentAvgWait = getNumericTime(avgWaitResult[0]?.avgMinutes);
    const currentAvgTreatment = getNumericTime(avgTreatmentResult[0]?.avgMinutes);
    const calcChange = (curr, prev) => {
      if (prev === 0)
        return curr > 0 ? 100 : 0;
      return Math.round((curr - prev) / prev * 100);
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
    console.error("Error in stats dashboard API:", error);
    return json({ error: "Failed to fetch doctor dashboard statistics" }, { status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server-eb19bf64.js.map
