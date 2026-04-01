import { pgTable, uuid, varchar, text, integer, bigint, boolean, timestamp, time, date, numeric, unique, pgEnum } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// === Enums (kept from existing where user specified) ===
export const roleEnum = pgEnum('role', ['admin', 'kasir', 'dokter']);
export const genderEnum = pgEnum('gender', ['male', 'female']);
export const maritalStatusEnum = pgEnum('marital_status', ['S', 'M', 'W', 'D']);
export const citizenshipEnum = pgEnum('citizenship', ['WNI', 'WNA']);
export const bloodTypeEnum = pgEnum('blood_type', ['A', 'B', 'AB', 'O']);
export const rhesusEnum = pgEnum('rhesus', ['+', '-']);
export const encounterStatusEnum = pgEnum('encounter_status', [
	'Planned', 'In Progress', 'On Hold', 'Discharged', 'Completed', 'Cancelled', 'Discontinued'
]);
export const formModeEnum = pgEnum('form_mode', ['SOAP', 'SOAP_WHO']);
export const paymentModeEnum = pgEnum('payment_mode', ['NORMAL', 'VOUCHER']);
export const terminologySystemEnum = pgEnum('terminology_system', ['SNOMED', 'ICD-10', 'ICD-9-CM', 'KFA']);
export const statusHistoryStatusEnum = pgEnum('status_history_status', ['Arrived', 'In Progress', 'Finished']);


// =============================================================
// 1. USERS
// =============================================================
export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	username: varchar('username', { length: 50 }).notNull().unique(),
	password_hash: text('password_hash').notNull(),
	role: roleEnum('role').notNull(),
	doctor_code: varchar('doctor_code', { length: 5 }).unique(),  // only for role='dokter'
	is_active: boolean('is_active').default(true).notNull(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at').defaultNow().notNull()
});


// =============================================================
// 2. TERMINOLOGY MASTER
// =============================================================
export const terminologyMaster = pgTable('terminology_master', {
	id: uuid('id').defaultRandom().primaryKey(),
	system: terminologySystemEnum('system').notNull(),
	code: varchar('code', { length: 30 }).notNull(),
	display: text('display').notNull()
}, (table) => ({
	uniqueSystemCode: unique('uq_terminology_system_code').on(table.system, table.code)
}));


// =============================================================
// 3. PATIENTS
// =============================================================
export const patients = pgTable('patients', {
	id: varchar('id', { length: 10 }).primaryKey(),  // O000001 format
	nik: varchar('nik', { length: 20 }).unique(),
	nama_lengkap: text('nama_lengkap').notNull(),
	birth_date: date('birth_date').notNull(),
	birthplace: text('birthplace'),
	gender: genderEnum('gender'),
	nomor_kk: varchar('nomor_kk', { length: 20 }),

	// Address
	address: text('address'),
	province: text('province'),
	city: text('city'),
	district: text('district'),
	village: text('village'),
	rt: varchar('rt', { length: 5 }),
	rw: varchar('rw', { length: 5 }),

	// Contact
	handphone: varchar('handphone', { length: 20 }),
	email: text('email'),

	// Personal info
	marital_status: maritalStatusEnum('marital_status'),
	citizenship: citizenshipEnum('citizenship').default('WNI'),
	communication_language: varchar('communication_language', { length: 20 }),

	// Default doctor assignment (soft ref to users.doctor_code)
	doctor_code: varchar('doctor_code', { length: 5 }),

	// Medical background (permanent)
	blood_type: bloodTypeEnum('blood_type'),
	rhesus: rhesusEnum('rhesus'),
	pregnancy_status: boolean('pregnancy_status').default(false),
	tekanan_darah: varchar('tekanan_darah', { length: 20 }),  // e.g. "120/80"

	// Profile document FK
	profile_document_id: uuid('profile_document_id'),

	// Audit
	kasir_id: uuid('kasir_id').references(() => users.id),
	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at').defaultNow().notNull()
});


// =============================================================
// 4. PATIENT DISEASE HISTORY
//    FK to terminology_master — code, display, category already there
// =============================================================
export const patientDiseaseHistory = pgTable('patient_disease_history', {
	id: uuid('id').defaultRandom().primaryKey(),
	patient_id: varchar('patient_id', { length: 10 }).notNull().references(() => patients.id, { onDelete: 'cascade' }),
	terminology_id: uuid('terminology_id').references(() => terminologyMaster.id),
	type: varchar('type', { length: 20 }).notNull(),  // 'personal' or 'family'
	description: text('description'),
	created_at: timestamp('created_at').defaultNow().notNull()
});


// =============================================================
// 5. PATIENT ALLERGY
// =============================================================
export const patientAllergy = pgTable('patient_allergy', {
	id: uuid('id').defaultRandom().primaryKey(),
	patient_id: varchar('patient_id', { length: 20 })
		.notNull()
		.references(() => patients.id, { onDelete: 'cascade' }),
	substance_id: uuid('substance_id')
		.references(() => terminologyMaster.id),
	reaction: varchar('reaction', { length: 50 }),
	reaction_display: text('reaction_display'),
	created_at: timestamp('created_at').defaultNow().notNull()
});


// =============================================================
// 6. PATIENT MEDICATION
//    FK to terminology_master for KFA code reference
// =============================================================
export const patientMedication = pgTable('patient_medication', {
	id: uuid('id').defaultRandom().primaryKey(),
	patient_id: varchar('patient_id', { length: 10 }).notNull().references(() => patients.id, { onDelete: 'cascade' }),
	terminology_id: uuid('terminology_id').references(() => terminologyMaster.id),
	kfa_code: varchar('kfa_code', { length: 30 }),
	product_name: text('product_name'),
	dosage_form: text('dosage_form'),
	dosage: text('dosage'),
	note: text('note'),
	created_at: timestamp('created_at').defaultNow().notNull()
});


// =============================================================
// 7. ENCOUNTERS
// =============================================================
export const encounters = pgTable('encounters', {
	id: varchar('id', { length: 30 }).primaryKey(),  // YYYYMM{DoctorCode}{6-digit-seq}

	patient_id: varchar('patient_id', { length: 10 }).notNull().references(() => patients.id, { onDelete: 'cascade' }),
	kasir_id: uuid('kasir_id').references(() => users.id),
	doctor_id: uuid('doctor_id').notNull().references(() => users.id),

	queue_number: integer('queue_number'),
	form_mode: formModeEnum('form_mode').default('SOAP'),
	status: encounterStatusEnum('status').default('Planned').notNull(),

	// Visit reason — FK to terminology_master (encounter_reason)
	encounter_reason_id: uuid('encounter_reason_id').references(() => terminologyMaster.id),
	reason_type: varchar('reason_type', { length: 15 }),  // Finding, Procedure, Situation, Event

	// SOAP fields (filled by doctor)
	subjective: text('subjective'),
	objective: text('objective'),
	assessment: text('assessment'),
	plan: text('plan'),
	resep: text('resep'),
	keterangan: text('keterangan'),

	// Referral in
	referral_from_doctor_code: varchar('referral_from_doctor_code', { length: 5 }),
	referral_note: text('referral_note'),
	referral_source: varchar('referral_source', { length: 100 }),

	// Per-encounter vitals
	tekanan_darah: varchar('tekanan_darah', { length: 20 }),

	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at').defaultNow().notNull()
});


// =============================================================
// 8. DOCUMENTS
// =============================================================
export const documents = pgTable('documents', {
	id: uuid('id').defaultRandom().primaryKey(),
	patient_id: varchar('patient_id', { length: 10 }).references(() => patients.id, { onDelete: 'set null' }),
	encounter_id: varchar('encounter_id', { length: 30 }).references(() => encounters.id, { onDelete: 'set null' }),
	document_type: varchar('document_type', { length: 50 }),
	file_name: varchar('file_name', { length: 255 }).notNull(),
	file_path: text('file_path').notNull(),
	mime_type: varchar('mime_type', { length: 100 }),
	file_size: bigint('file_size', { mode: 'number' }),
	uploaded_by: uuid('uploaded_by').references(() => users.id),
	created_at: timestamp('created_at').defaultNow().notNull()
});


// =============================================================
// 9. STATUS HISTORY
// =============================================================
export const statusHistory = pgTable('status_history', {
	id: uuid('id').defaultRandom().primaryKey(),
	encounter_id: varchar('encounter_id', { length: 30 }).notNull().references(() => encounters.id, { onDelete: 'cascade' }),
	status: statusHistoryStatusEnum('status').notNull(),
	start_at: timestamp('start_at').defaultNow().notNull(),
	end_at: timestamp('end_at'),
	created_at: timestamp('created_at').defaultNow().notNull()
});


// =============================================================
// 10. ENCOUNTER DIAGNOSES (ICD-10)
// =============================================================
export const encounterDiagnoses = pgTable('encounter_diagnoses', {
	id: uuid('id').defaultRandom().primaryKey(),
	encounter_id: varchar('encounter_id', { length: 30 }).notNull().references(() => encounters.id, { onDelete: 'cascade' }),
	terminology_id: uuid('terminology_id').references(() => terminologyMaster.id),
	code: varchar('code', { length: 50 }).notNull(),
	display: varchar('display', { length: 255 }).notNull(),
	is_primary: boolean('is_primary').default(false),
	created_at: timestamp('created_at').defaultNow().notNull()
});


// =============================================================
// 11. ENCOUNTER PROCEDURES (ICD-9-CM)
// =============================================================
export const encounterProcedures = pgTable('encounter_procedures', {
	id: uuid('id').defaultRandom().primaryKey(),
	encounter_id: varchar('encounter_id', { length: 30 }).notNull().references(() => encounters.id, { onDelete: 'cascade' }),
	terminology_id: uuid('terminology_id').references(() => terminologyMaster.id),
	code: varchar('code', { length: 50 }).notNull(),
	display: varchar('display', { length: 255 }).notNull(),
	tooth_number: varchar('tooth_number', { length: 5 }),
	surface: varchar('surface', { length: 10 }),
	created_at: timestamp('created_at').defaultNow().notNull()
});


// =============================================================
// 12. ENCOUNTER ODONTOGRAMS (header)
// =============================================================
export const encounterOdontograms = pgTable('encounter_odontograms', {
	id: uuid('id').defaultRandom().primaryKey(),
	encounter_id: varchar('encounter_id', { length: 30 }).notNull().references(() => encounters.id, { onDelete: 'cascade' }),
	dentition_type: varchar('dentition_type', { length: 10 }),  // Adult, Child

	// Oral exam summary
	occlusi: varchar('occlusi', { length: 20 }),
	torus_palatinus: varchar('torus_palatinus', { length: 20 }),
	torus_mandibularis: varchar('torus_mandibularis', { length: 30 }),
	palatum: varchar('palatum', { length: 20 }),
	diastema: text('diastema'),
	gigi_anomali: text('gigi_anomali'),
	created_at: timestamp('created_at').defaultNow().notNull()
});


// =============================================================
// 13. ODONTOGRAM DETAILS (per tooth per surface)
// =============================================================
export const odontogramDetails = pgTable('odontogram_details', {
	id: uuid('id').defaultRandom().primaryKey(),
	odontogram_id: uuid('odontogram_id').notNull().references(() => encounterOdontograms.id, { onDelete: 'cascade' }),
	tooth_number: varchar('tooth_number', { length: 5 }).notNull(),
	surface: varchar('surface', { length: 5 }).notNull(),

	keadaan: text('keadaan'),
	bahan_restorasi: text('bahan_restorasi'),
	restorasi: text('restorasi'),
	protesa: text('protesa'),
	bahan_protesa: text('bahan_protesa'),

	icd10_id: uuid('icd10_id').references(() => terminologyMaster.id, { onDelete: 'set null' }),
	icd9cm_id: uuid('icd9cm_id').references(() => terminologyMaster.id, { onDelete: 'set null' }),

	created_at: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
	uniqueToothSurface: unique('uq_odontogram_tooth_surface').on(table.odontogram_id, table.tooth_number, table.surface)
}));


// =============================================================
// 14. ENCOUNTER PRESCRIPTIONS
// =============================================================
export const encounterPrescriptions = pgTable('encounter_prescriptions', {
	id: uuid('id').defaultRandom().primaryKey(),
	encounter_id: varchar('encounter_id', { length: 30 }).notNull().references(() => encounters.id, { onDelete: 'cascade' }),
	kfa_code: varchar('kfa_code', { length: 30 }),
	product_name: text('product_name').notNull(),
	dosage_form: text('dosage_form'),
	quantity: integer('quantity'),
	instruction: text('instruction'),
	created_at: timestamp('created_at').defaultNow().notNull()
});


// =============================================================
// 15. ENCOUNTER REFERRALS
// =============================================================
export const encounterReferrals = pgTable('encounter_referrals', {
	id: uuid('id').defaultRandom().primaryKey(),
	encounter_id: varchar('encounter_id', { length: 30 })
		.notNull()
		.references(() => encounters.id, { onDelete: 'cascade' }),
	doctor_code: varchar('doctor_code', { length: 10 }).notNull(),
	referral_date: date('referral_date').notNull(),
	note: text('note'),
	created_at: timestamp('created_at').defaultNow().notNull()
});


// =============================================================
// 16. MASTER ITEMS
// =============================================================
export const items = pgTable('items', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	user_id: uuid('user_id').references(() => users.id),
	price: numeric('price', { precision: 12, scale: 2 }).notNull(),
	item_group: varchar('item_group', { length: 50 }),
	denomination: varchar('denomination', { length: 50 }),
	is_active: boolean('is_active').default(true).notNull(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at').defaultNow().notNull()
});


// =============================================================
// 17. ENCOUNTER ITEMS (billing line items)
// =============================================================
export const encounterItems = pgTable('encounter_items', {
	id: uuid('id').defaultRandom().primaryKey(),
	encounter_id: varchar('encounter_id', { length: 30 }).notNull().references(() => encounters.id, { onDelete: 'cascade' }),
	item_id: uuid('item_id').notNull().references(() => items.id, { onDelete: 'restrict' }),
	quantity: integer('quantity').notNull().default(1),
	price_at_time: integer('price_at_time').notNull(),
	subtotal: integer('subtotal').notNull(),  // computed in app as quantity * price_at_time
	created_at: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
	uniqueEncounterItem: unique('uq_encounter_item').on(table.encounter_id, table.item_id)
}));


// =============================================================
// 18. PAYMENTS
// =============================================================
export const payments = pgTable('payments', {
	id: uuid('id').defaultRandom().primaryKey(),
	encounter_id: varchar('encounter_id', { length: 30 }).notNull().references(() => encounters.id, { onDelete: 'restrict' }),

	payment_mode: paymentModeEnum('payment_mode').default('NORMAL').notNull(),
	discount_percent: numeric('discount_percent', { precision: 5, scale: 2 }).default('0'),
	discount_amount: integer('discount_amount').default(0),

	total_sales: integer('total_sales').notNull(),
	net_sales: integer('net_sales').notNull(),
	total_paid: integer('total_paid').notNull(),

	payment_type: varchar('payment_type', { length: 50 }).notNull(),
	card_number: varchar('card_number', { length: 30 }),
	reference_number: varchar('reference_number', { length: 50 }),
	note: text('note'),

	proof_document_id: uuid('proof_document_id').references(() => documents.id, { onDelete: 'set null' }),
	cashier_id: uuid('cashier_id').notNull().references(() => users.id),

	paid_at: timestamp('paid_at').defaultNow().notNull(),
	created_at: timestamp('created_at').defaultNow().notNull()
});


// =============================================================
// 19. AUTH TOKENS
// =============================================================
export const authTokens = pgTable('auth_tokens', {
	id: uuid('id').defaultRandom().primaryKey(),
	user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

	app_token: text('app_token').notNull().unique(),
	app_token_expires_at: timestamp('app_token_expires_at').notNull(),

	satusehat_token: text('satusehat_token'),
	satusehat_expires_at: timestamp('satusehat_expires_at'),

	created_at: timestamp('created_at').defaultNow().notNull()
});


// =============================================================
// 20. SHIFTS (for dokter and kasir)
// =============================================================
export const shifts = pgTable('shifts', {
	id: uuid('id').defaultRandom().primaryKey(),
	doctor_id: uuid('doctor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	day_of_week: integer('day_of_week').notNull(),  // 0=Sunday, 6=Saturday
	start_time: time('start_time').notNull(),
	end_time: time('end_time').notNull(),
	created_at: timestamp('created_at').defaultNow().notNull()
});


// =============================================================
// RELATIONS
// =============================================================
export const usersRelations = relations(users, ({ many }) => ({
	shifts: many(shifts),
	encounters: many(encounters, { relationName: 'doctor_encounters' }),
	authTokens: many(authTokens)
}));

export const shiftsRelations = relations(shifts, ({ one }) => ({
	doctor: one(users, { fields: [shifts.doctor_id], references: [users.id] })
}));

export const patientsRelations = relations(patients, ({ many }) => ({
	diseaseHistory: many(patientDiseaseHistory),
	allergies: many(patientAllergy),
	medications: many(patientMedication),
	encounters: many(encounters),
	documents: many(documents)
}));

export const encountersRelations = relations(encounters, ({ one, many }) => ({
	patient: one(patients, { fields: [encounters.patient_id], references: [patients.id] }),
	doctor: one(users, { fields: [encounters.doctor_id], references: [users.id], relationName: 'doctor_encounters' }),
	encounter_reason: one(terminologyMaster, { fields: [encounters.encounter_reason_id], references: [terminologyMaster.id] }),
	statusHistory: many(statusHistory),
	odontograms: many(encounterOdontograms),
	prescriptions: many(encounterPrescriptions),
	referrals: many(encounterReferrals),
	diagnoses: many(encounterDiagnoses),
	procedures: many(encounterProcedures),
	encounterItems: many(encounterItems),
	documents: many(documents)
}));

export const encounterOdontogramsRelations = relations(encounterOdontograms, ({ one, many }) => ({
	encounter: one(encounters, { fields: [encounterOdontograms.encounter_id], references: [encounters.id] }),
	details: many(odontogramDetails)
}));

export const odontogramDetailsRelations = relations(odontogramDetails, ({ one }) => ({
	odontogram: one(encounterOdontograms, { fields: [odontogramDetails.odontogram_id], references: [encounterOdontograms.id] })
}));

export const patientDiseaseHistoryRelations = relations(patientDiseaseHistory, ({ one }) => ({
	patient: one(patients, { fields: [patientDiseaseHistory.patient_id], references: [patients.id] }),
	terminology: one(terminologyMaster, { fields: [patientDiseaseHistory.terminology_id], references: [terminologyMaster.id] })
}));

export const patientMedicationRelations = relations(patientMedication, ({ one }) => ({
	patient: one(patients, { fields: [patientMedication.patient_id], references: [patients.id] }),
	terminology: one(terminologyMaster, { fields: [patientMedication.terminology_id], references: [terminologyMaster.id] })
}));

export const authTokensRelations = relations(authTokens, ({ one }) => ({
	user: one(users, { fields: [authTokens.user_id], references: [users.id] })
}));
