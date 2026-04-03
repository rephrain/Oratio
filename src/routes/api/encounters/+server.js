import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import {
	encounters, statusHistory, encounterOdontograms, odontogramDetails,
	encounterPrescriptions, encounterReferrals, encounterItems, patients, users, terminologyMaster
} from '$lib/server/db/schema.js';
import { eq, and, desc, sql, gte, lte, inArray } from 'drizzle-orm';
import { generateEncounterId } from '$lib/utils/formatters.js';

// GET /api/encounters
export async function GET({ url, locals }) {
	const date = url.searchParams.get('date');
	const dateFrom = url.searchParams.get('date_from');
	const dateTo = url.searchParams.get('date_to');
	const doctorId = url.searchParams.get('doctor_id');
	const status = url.searchParams.get('status');
	const patientId = url.searchParams.get('patient_id');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = (page - 1) * limit;

	let conditions = [];

	if (dateFrom && dateTo) {
		conditions.push(sql`DATE(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') >= ${dateFrom}`);
		conditions.push(sql`DATE(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') <= ${dateTo}`);
	} else if (date) {
		conditions.push(sql`DATE(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') = ${date}`);
	}

	if (doctorId) conditions.push(eq(encounters.doctor_id, doctorId));
	if (status) conditions.push(eq(encounters.status, status));
	if (patientId) conditions.push(eq(encounters.patient_id, patientId));

	// For dokter role, only show their own encounters
	if (locals.user?.role === 'dokter') {
		conditions.push(eq(encounters.doctor_id, locals.user.id));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const data = await db.select({
		encounter: encounters,
		patient: patients,
		patient_name: patients.nama_lengkap,
		patient_nik: patients.nik,
		doctor_name: users.name,
		doctor_code: users.doctor_code,
		encounter_reason_display: terminologyMaster.display
	})
		.from(encounters)
		.leftJoin(patients, eq(encounters.patient_id, patients.id))
		.leftJoin(users, eq(encounters.doctor_id, users.id))
		.leftJoin(terminologyMaster, eq(encounters.encounter_reason_id, terminologyMaster.id))
		.where(whereClause)
		.orderBy(desc(encounters.created_at))
		.limit(limit)
		.offset(offset);

	return json({ data });
}

// POST /api/encounters - create encounter (auto-queue)
export async function POST({ request, locals }) {
	const body = await request.json();

	// Get doctor info
	const [doctor] = await db.select().from(users).where(eq(users.id, body.doctor_id)).limit(1);
	if (!doctor || doctor.role !== 'dokter') {
		return json({ error: 'Invalid doctor' }, { status: 400 });
	}

	// Generate encounter ID
	const [lastEnc] = await db.select({ id: encounters.id })
		.from(encounters)
		.where(eq(encounters.doctor_id, body.doctor_id))
		.orderBy(desc(encounters.id))
		.limit(1);

	const encId = generateEncounterId(doctor.doctor_code, lastEnc?.id);

	// Get next queue number for today
	const [{ maxQueue }] = await db.select({
		maxQueue: sql`COALESCE(MAX(${encounters.queue_number}), 0)`
	}).from(encounters).where(sql`DATE(${encounters.created_at} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date`);

	const queueNumber = Number(maxQueue) + 1;

	// Resolve encounter reason → terminology_master FK
	let encounterReasonId = null;
	const complaintCode = body.chief_complaint_code;
	const complaintDisplay = body.chief_complaint_display;
	if (complaintCode && complaintDisplay) {
		const [existing] = await db.select()
			.from(terminologyMaster)
			.where(and(
				eq(terminologyMaster.code, complaintCode),
				eq(terminologyMaster.system, 'SNOMED')
			))
			.limit(1);

		if (existing) {
			encounterReasonId = existing.id;
		} else {
			const [inserted] = await db.insert(terminologyMaster).values({
				code: complaintCode,
				display: complaintDisplay,
				system: 'SNOMED'
			}).returning();
			encounterReasonId = inserted.id;
		}
	}

	const [encounter] = await db.insert(encounters).values({
		id: encId,
		patient_id: body.patient_id,
		kasir_id: locals?.user?.id || null,
		doctor_id: body.doctor_id,
		queue_number: queueNumber,
		form_mode: body.form_mode || 'SOAP',
		status: 'Planned',
		encounter_reason_id: encounterReasonId,
		reason_type: body.reason_type || null
	}).returning();

	// Update patient BP if provided
	if (body.tekanan_darah) {
		await db.update(patients)
			.set({ tekanan_darah: body.tekanan_darah })
			.where(eq(patients.id, body.patient_id));
	}

	// Create initial status history
	await db.insert(statusHistory).values({
		encounter_id: encId,
		status: 'Arrived',
		start_at: new Date()
	});

	return json({ encounter, queue_number: queueNumber }, { status: 201 });
}
