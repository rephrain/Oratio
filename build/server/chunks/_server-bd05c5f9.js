import { j as json } from './index-d7f43214.js';
import { f as encounters, g as statusHistory, d as db } from './index3-0946ac29.js';
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
    const avgWaitVal = avgWaitResult[0]?.avgMinutes;
    const avgWaitMinutes = avgWaitVal ? Math.round(parseFloat(avgWaitVal)) : 0;
    return json({
      patientsToday: totalToday,
      completedToday: Number(counts.completed || 0),
      avgWaitMinutes: avgWaitMinutes > 0 ? avgWaitMinutes : 0
    });
  } catch (error) {
    console.error("Error in stats dashboard API:", error);
    return json({ error: "Failed to fetch doctor dashboard statistics" }, { status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server-bd05c5f9.js.map
