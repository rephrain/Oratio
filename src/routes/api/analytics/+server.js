import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { sql } from 'drizzle-orm';

// GET /api/analytics — comprehensive doctor analytics
export async function GET({ url, locals }) {
	const dateFrom = url.searchParams.get('date_from');
	const dateTo = url.searchParams.get('date_to');

	// Only allow authenticated users
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const doctorId = locals.user.role === 'dokter' ? locals.user.id : null;

	// Build date + doctor filter fragments
	const dateFilter = dateFrom && dateTo
		? sql`AND DATE(e.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') >= ${dateFrom}
		       AND DATE(e.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') <= ${dateTo}`
		: sql``;
	const doctorFilter = doctorId ? sql`AND e.doctor_id = ${doctorId}` : sql``;
	const baseWhere = sql`WHERE 1=1 ${dateFilter} ${doctorFilter}`;

	try {
		// 1. Overview KPIs
		const [overview] = await db.execute(sql`
			SELECT
				COUNT(*)::int AS total_encounters,
				COUNT(DISTINCT e.patient_id)::int AS unique_patients,
				COUNT(*) FILTER (WHERE e.status IN ('Completed','Discharged'))::int AS completed_count,
				COUNT(*) FILTER (WHERE e.status = 'In Progress')::int AS in_progress_count,
				COUNT(*) FILTER (WHERE e.status = 'Planned')::int AS planned_count,
				COUNT(*) FILTER (WHERE e.status = 'On Hold')::int AS on_hold_count,
				COUNT(*) FILTER (WHERE e.status IN ('Cancelled','Discontinued'))::int AS cancelled_count,
				CASE WHEN COUNT(*) > 0
					THEN ROUND(COUNT(*) FILTER (WHERE e.status IN ('Completed','Discharged'))::numeric / COUNT(*) * 100, 1)
					ELSE 0 END AS completion_rate
			FROM encounters e
			${baseWhere}
		`);

		// 2. Today / this week counts
		const [periodCounts] = await db.execute(sql`
			SELECT
				COUNT(*) FILTER (
					WHERE DATE(e.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta')
					      = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date
				)::int AS today_count,
				COUNT(*) FILTER (
					WHERE e.created_at >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta' - INTERVAL '7 days')
				)::int AS week_count
			FROM encounters e
			WHERE 1=1 ${doctorFilter}
		`);

		// 3. Status breakdown
		const statusBreakdown = await db.execute(sql`
			SELECT e.status, COUNT(*)::int AS count
			FROM encounters e
			${baseWhere}
			GROUP BY e.status
			ORDER BY count DESC
		`);

		// 4. Daily volume
		const dailyVolume = await db.execute(sql`
			SELECT
				DATE(e.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') AS date,
				COUNT(*)::int AS count
			FROM encounters e
			${baseWhere}
			GROUP BY DATE(e.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta')
			ORDER BY date
		`);

		// 5. Hourly distribution (peak hours)
		const hourlyDist = await db.execute(sql`
			SELECT
				EXTRACT(HOUR FROM e.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta')::int AS hour,
				COUNT(*)::int AS count
			FROM encounters e
			${baseWhere}
			GROUP BY hour
			ORDER BY hour
		`);

		// 6. Day of week distribution
		const dowDist = await db.execute(sql`
			SELECT
				EXTRACT(DOW FROM e.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta')::int AS dow,
				COUNT(*)::int AS count
			FROM encounters e
			${baseWhere}
			GROUP BY dow
			ORDER BY dow
		`);

		// 7. Form mode distribution
		const formModeDist = await db.execute(sql`
			SELECT COALESCE(e.form_mode, 'SOAP') AS form_mode, COUNT(*)::int AS count
			FROM encounters e
			${baseWhere}
			GROUP BY form_mode
		`);

		// 8. Visit reason (top encounter reasons from terminology_master)
		const topReasons = await db.execute(sql`
			SELECT tm.display AS reason, e.reason_type AS type, COUNT(*)::int AS count
			FROM encounters e
			JOIN terminology_master tm ON e.encounter_reason_id = tm.id
			${baseWhere}
			GROUP BY tm.display, e.reason_type
			ORDER BY count DESC
			LIMIT 15
		`);

		const reasonTypeDist = await db.execute(sql`
			SELECT reason_type AS type, COUNT(*)::int AS count
			FROM encounters e
			${baseWhere}
			AND reason_type IS NOT NULL
			GROUP BY reason_type
			ORDER BY count DESC
		`);

		// 9. Top ICD-10 diagnoses from odontogram_details
		const topDiagnoses = await db.execute(sql`
			SELECT tm.code, tm.display, COUNT(*)::int AS count
			FROM encounters e
			JOIN encounter_odontograms eo ON eo.encounter_id = e.id
			JOIN odontogram_details od ON od.odontogram_id = eo.id
			JOIN terminology_master tm ON od.icd10_id = tm.id
			${baseWhere}
			GROUP BY tm.code, tm.display
			ORDER BY count DESC
			LIMIT 10
		`);

		// 10. Top ICD-9-CM procedures from odontogram_details
		const topProcedures = await db.execute(sql`
			SELECT tm.code, tm.display, COUNT(*)::int AS count
			FROM encounters e
			JOIN encounter_odontograms eo ON eo.encounter_id = e.id
			JOIN odontogram_details od ON od.odontogram_id = eo.id
			JOIN terminology_master tm ON od.icd9cm_id = tm.id
			${baseWhere}
			GROUP BY tm.code, tm.display
			ORDER BY count DESC
			LIMIT 10
		`);

		// 11. Top tooth conditions (keadaan)
		const topConditions = await db.execute(sql`
			SELECT od.keadaan AS condition, COUNT(*)::int AS count
			FROM encounters e
			JOIN encounter_odontograms eo ON eo.encounter_id = e.id
			JOIN odontogram_details od ON od.odontogram_id = eo.id
			${baseWhere}
			AND od.keadaan IS NOT NULL AND od.keadaan != ''
			GROUP BY od.keadaan
			ORDER BY count DESC
			LIMIT 10
		`);

		// 12. Most treated teeth
		const topTeeth = await db.execute(sql`
			SELECT od.tooth_number, COUNT(*)::int AS count
			FROM encounters e
			JOIN encounter_odontograms eo ON eo.encounter_id = e.id
			JOIN odontogram_details od ON od.odontogram_id = eo.id
			${baseWhere}
			GROUP BY od.tooth_number
			ORDER BY count DESC
			LIMIT 15
		`);

		// 13. Top prescribed medications
		const topMedications = await db.execute(sql`
			SELECT tm.display AS medication, tm.code, COUNT(*)::int AS count,
			       SUM(COALESCE(ep.quantity,1))::int AS total_qty
			FROM encounters e
			JOIN encounter_prescriptions ep ON ep.encounter_id = e.id
			LEFT JOIN terminology_master tm ON ep.terminology_id = tm.id
			${baseWhere}
			AND tm.display IS NOT NULL
			GROUP BY tm.display, tm.code
			ORDER BY count DESC
			LIMIT 10
		`);

		// 14. Prescription stats
		const [prescriptionStats] = await db.execute(sql`
			SELECT
				COUNT(DISTINCT ep.encounter_id)::int AS encounters_with_rx,
				COUNT(ep.id)::int AS total_prescriptions,
				CASE WHEN COUNT(DISTINCT ep.encounter_id) > 0
					THEN ROUND(COUNT(ep.id)::numeric / COUNT(DISTINCT ep.encounter_id), 1)
					ELSE 0 END AS avg_rx_per_encounter
			FROM encounters e
			JOIN encounter_prescriptions ep ON ep.encounter_id = e.id
			${baseWhere}
		`);

		// 15. Revenue stats from encounter_items
		const [revenueStats] = await db.execute(sql`
			SELECT
				COALESCE(SUM(ei.subtotal), 0)::bigint AS total_revenue,
				COUNT(DISTINCT ei.encounter_id)::int AS encounters_with_items,
				CASE WHEN COUNT(DISTINCT ei.encounter_id) > 0
					THEN ROUND(SUM(ei.subtotal)::numeric / COUNT(DISTINCT ei.encounter_id))::bigint
					ELSE 0 END AS avg_revenue_per_encounter
			FROM encounters e
			JOIN encounter_items ei ON ei.encounter_id = e.id
			${baseWhere}
		`);

		// 16. Top items/treatments by revenue
		const topItems = await db.execute(sql`
			SELECT i.name, i.item_group,
			       COUNT(ei.id)::int AS count,
			       SUM(ei.subtotal)::bigint AS total_revenue
			FROM encounters e
			JOIN encounter_items ei ON ei.encounter_id = e.id
			JOIN items i ON ei.item_id = i.id
			${baseWhere}
			GROUP BY i.name, i.item_group
			ORDER BY total_revenue DESC
			LIMIT 10
		`);

		// 17. Revenue by item_group
		const revenueByGroup = await db.execute(sql`
			SELECT COALESCE(i.item_group, 'Lainnya') AS item_group,
			       SUM(ei.subtotal)::bigint AS total_revenue,
			       COUNT(ei.id)::int AS count
			FROM encounters e
			JOIN encounter_items ei ON ei.encounter_id = e.id
			JOIN items i ON ei.item_id = i.id
			${baseWhere}
			GROUP BY i.item_group
			ORDER BY total_revenue DESC
		`);

		// 18. Referral stats
		const referralStats = await db.execute(sql`
			SELECT er.doctor_code,
			       COUNT(*)::int AS count
			FROM encounters e
			JOIN encounter_referrals er ON er.encounter_id = e.id
			${baseWhere}
			GROUP BY er.doctor_code
			ORDER BY count DESC
			LIMIT 10
		`);

		const [referralOverview] = await db.execute(sql`
			SELECT
				COUNT(DISTINCT er.encounter_id)::int AS encounters_with_referral,
				COUNT(er.id)::int AS total_referrals
			FROM encounters e
			JOIN encounter_referrals er ON er.encounter_id = e.id
			${baseWhere}
		`);

		// 19. Patient demographics (gender)
		const genderDist = await db.execute(sql`
			SELECT COALESCE(p.gender::text, 'Tidak Diketahui') AS gender, COUNT(DISTINCT p.id)::int AS count
			FROM encounters e
			JOIN patients p ON e.patient_id = p.id
			${baseWhere}
			GROUP BY p.gender
		`);

		// 20. Patient age distribution
		const ageDist = await db.execute(sql`
			SELECT
				CASE
					WHEN age < 5 THEN '0-4'
					WHEN age < 12 THEN '5-11'
					WHEN age < 18 THEN '12-17'
					WHEN age < 30 THEN '18-29'
					WHEN age < 45 THEN '30-44'
					WHEN age < 60 THEN '45-59'
					ELSE '60+'
				END AS age_group,
				COUNT(*)::int AS count
			FROM (
				SELECT p.id,
					EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date::date))::int AS age
				FROM encounters e
				JOIN patients p ON e.patient_id = p.id
				${baseWhere}
				GROUP BY p.id, p.birth_date
			) sub
			GROUP BY age_group
			ORDER BY MIN(age)
		`);

		// 21. New vs returning patients
		const [patientRetention] = await db.execute(sql`
			SELECT
				COUNT(*) FILTER (WHERE visit_count = 1)::int AS new_patients,
				COUNT(*) FILTER (WHERE visit_count > 1)::int AS returning_patients
			FROM (
				SELECT e.patient_id, COUNT(*)::int AS visit_count
				FROM encounters e
				${baseWhere}
				GROUP BY e.patient_id
			) sub
		`);

		// 22. Average wait time & consultation time from status_history
		const [timingStats] = await db.execute(sql`
			SELECT
				ROUND(AVG(wait_minutes) FILTER (WHERE wait_minutes > 0 AND wait_minutes < 300), 1) AS avg_wait_minutes,
				ROUND(AVG(consult_minutes) FILTER (WHERE consult_minutes > 0 AND consult_minutes < 480), 1) AS avg_consult_minutes
			FROM (
				SELECT
					e.id,
					EXTRACT(EPOCH FROM (
						MIN(sh.start_at) FILTER (WHERE sh.status = 'In Progress') -
						MIN(sh.start_at) FILTER (WHERE sh.status = 'Arrived')
					)) / 60 AS wait_minutes,
					EXTRACT(EPOCH FROM (
						MIN(sh.end_at) FILTER (WHERE sh.status = 'In Progress') -
						MIN(sh.start_at) FILTER (WHERE sh.status = 'In Progress')
					)) / 60 AS consult_minutes
				FROM encounters e
				JOIN status_history sh ON sh.encounter_id = e.id
				${baseWhere}
				GROUP BY e.id
			) sub
		`);

		// 23. Odontogram usage
		const [odontogramStats] = await db.execute(sql`
			SELECT
				COUNT(DISTINCT eo.encounter_id)::int AS encounters_with_odontogram,
				COUNT(DISTINCT od.id)::int AS total_tooth_records,
				COUNT(DISTINCT od.tooth_number)::int AS distinct_teeth_treated
			FROM encounters e
			JOIN encounter_odontograms eo ON eo.encounter_id = e.id
			LEFT JOIN odontogram_details od ON od.odontogram_id = eo.id
			${baseWhere}
		`);

		// 24. Recent encounters (last 10)
		const recentEncounters = await db.execute(sql`
			SELECT e.id, e.status, e.created_at,
			       p.nama_lengkap AS patient_name,
			       u.name AS doctor_name
			FROM encounters e
			LEFT JOIN patients p ON e.patient_id = p.id
			LEFT JOIN users u ON e.doctor_id = u.id
			${baseWhere}
			ORDER BY e.created_at DESC
			LIMIT 10
		`);

		// 25. Daily revenue trend
		const dailyRevenue = await db.execute(sql`
			SELECT
				DATE(e.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') AS date,
				COALESCE(SUM(ei.subtotal), 0)::bigint AS revenue,
				COUNT(DISTINCT e.id)::int AS encounter_count
			FROM encounters e
			JOIN encounter_items ei ON ei.encounter_id = e.id
			${baseWhere}
			GROUP BY DATE(e.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta')
			ORDER BY date
		`);

		return json({
			overview: overview || {},
			periodCounts: periodCounts || {},
			statusBreakdown,
			dailyVolume,
			hourlyDist,
			dowDist,
			formModeDist,
			topReasons,
			reasonTypeDist,
			topDiagnoses,
			topProcedures,
			topConditions,
			topTeeth,
			topMedications,
			prescriptionStats: prescriptionStats || {},
			revenueStats: revenueStats || {},
			topItems,
			revenueByGroup,
			dailyRevenue,
			referralStats,
			referralOverview: referralOverview || {},
			genderDist,
			ageDist,
			patientRetention: patientRetention || {},
			timingStats: timingStats || {},
			odontogramStats: odontogramStats || {},
			recentEncounters
		});
	} catch (err) {
		console.error('Analytics API error:', err);
		return json({ error: 'Internal error', message: String(err) }, { status: 500 });
	}
}
