import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { pgEnum, pgTable, uuid, text, varchar, boolean, timestamp, unique, date, integer, bigint, numeric, primaryKey, time } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
const roleEnum = pgEnum("role", ["admin", "kasir", "dokter"]);
const genderEnum = pgEnum("gender", ["male", "female"]);
const maritalStatusEnum = pgEnum("marital_status", ["S", "M", "W", "D"]);
const citizenshipEnum = pgEnum("citizenship", ["WNI", "WNA"]);
const bloodTypeEnum = pgEnum("blood_type", ["A", "B", "AB", "O"]);
const rhesusEnum = pgEnum("rhesus", ["+", "-"]);
const encounterStatusEnum = pgEnum("encounter_status", [
  "Planned",
  "In Progress",
  "On Hold",
  "Discharged",
  "Completed",
  "Cancelled",
  "Discontinued"
]);
const formModeEnum = pgEnum("form_mode", ["SOAP", "SOAP_WHO"]);
const paymentModeEnum = pgEnum("payment_mode", ["NORMAL", "VOUCHER"]);
const terminologySystemEnum = pgEnum("terminology_system", ["SNOMED", "ICD-10", "ICD-9-CM", "KFA"]);
const statusHistoryStatusEnum = pgEnum("status_history_status", ["Arrived", "In Progress", "Finished"]);
const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),
  doctor_code: varchar("doctor_code", { length: 5 }).unique(),
  // only for role='dokter'
  profile_image_url: text("profile_image_url"),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});
const terminologyMaster = pgTable("terminology_master", {
  id: uuid("id").defaultRandom().primaryKey(),
  system: terminologySystemEnum("system").notNull(),
  code: varchar("code", { length: 30 }).notNull(),
  display: text("display").notNull()
}, (table) => ({
  uniqueSystemCode: unique("uq_terminology_system_code").on(table.system, table.code)
}));
const patients = pgTable("patients", {
  id: varchar("id", { length: 10 }).primaryKey(),
  // O000001 format
  nik: varchar("nik", { length: 20 }).unique(),
  nama_lengkap: text("nama_lengkap").notNull(),
  birth_date: date("birth_date").notNull(),
  birthplace: text("birthplace"),
  gender: genderEnum("gender"),
  nomor_kk: varchar("nomor_kk", { length: 20 }),
  // Address
  address: text("address"),
  province: text("province"),
  city: text("city"),
  district: text("district"),
  village: text("village"),
  rt: varchar("rt", { length: 5 }),
  rw: varchar("rw", { length: 5 }),
  // Contact
  handphone: varchar("handphone", { length: 20 }),
  email: text("email"),
  // Personal info
  marital_status: maritalStatusEnum("marital_status"),
  citizenship: citizenshipEnum("citizenship").default("WNI"),
  // Medical background (permanent)
  blood_type: bloodTypeEnum("blood_type"),
  rhesus: rhesusEnum("rhesus"),
  pregnancy_status: boolean("pregnancy_status").default(false),
  tekanan_darah: varchar("tekanan_darah", { length: 20 }),
  // e.g. "120/80"
  // Profile document FK
  profile_document_id: uuid("profile_document_id").references(() => documents.id),
  // Audit
  kasir_id: uuid("kasir_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});
const patientDiseaseHistory = pgTable("patient_disease_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  patient_id: varchar("patient_id", { length: 10 }).notNull().references(() => patients.id, { onDelete: "cascade" }),
  terminology_id: uuid("terminology_id").references(() => terminologyMaster.id),
  type: varchar("type", { length: 20 }).notNull(),
  // 'personal' or 'family'
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const patientAllergy = pgTable("patient_allergy", {
  id: uuid("id").defaultRandom().primaryKey(),
  patient_id: varchar("patient_id", { length: 20 }).notNull().references(() => patients.id, { onDelete: "cascade" }),
  substance_id: uuid("substance_id").references(() => terminologyMaster.id),
  reaction: varchar("reaction", { length: 50 }),
  reaction_display: text("reaction_display"),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const patientMedication = pgTable("patient_medication", {
  id: uuid("id").defaultRandom().primaryKey(),
  patient_id: varchar("patient_id", { length: 10 }).notNull().references(() => patients.id, { onDelete: "cascade" }),
  terminology_id: uuid("terminology_id").references(() => terminologyMaster.id),
  dosage_form: text("dosage_form"),
  dosage: text("dosage"),
  note: text("note"),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const encounters = pgTable("encounters", {
  id: varchar("id", { length: 30 }).primaryKey(),
  // YYYYMM{DoctorCode}{6-digit-seq}
  patient_id: varchar("patient_id", { length: 10 }).notNull().references(() => patients.id, { onDelete: "cascade" }),
  kasir_id: uuid("kasir_id").references(() => users.id),
  doctor_id: uuid("doctor_id").notNull().references(() => users.id),
  queue_number: integer("queue_number"),
  form_mode: formModeEnum("form_mode").default("SOAP"),
  status: encounterStatusEnum("status").default("Planned").notNull(),
  // Visit reason — FK to terminology_master (encounter_reason)
  encounter_reason_id: uuid("encounter_reason_id").references(() => terminologyMaster.id),
  reason_type: varchar("reason_type", { length: 15 }),
  // Finding, Procedure, Situation, Event
  // SOAP fields (filled by doctor)
  subjective: text("subjective"),
  objective: text("objective"),
  assessment: text("assessment"),
  plan: text("plan"),
  resep: text("resep"),
  keterangan: text("keterangan"),
  // Referral in
  encounter_referral_id: uuid("encounter_referral_id").references(() => encounterReferrals.id),
  // SOAP document
  soap_document_id: uuid("soap_document_id").references(() => documents.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});
const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  patient_id: varchar("patient_id", { length: 10 }).references(() => patients.id, { onDelete: "set null" }),
  encounter_id: varchar("encounter_id", { length: 30 }).references(() => encounters.id, { onDelete: "set null" }),
  document_type: varchar("document_type", { length: 50 }),
  file_name: varchar("file_name", { length: 255 }).notNull(),
  file_path: text("file_path").notNull(),
  mime_type: varchar("mime_type", { length: 100 }),
  file_size: bigint("file_size", { mode: "number" }),
  uploaded_by: uuid("uploaded_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const statusHistory = pgTable("status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  encounter_id: varchar("encounter_id", { length: 30 }).notNull().references(() => encounters.id, { onDelete: "cascade" }),
  status: statusHistoryStatusEnum("status").notNull(),
  start_at: timestamp("start_at").defaultNow().notNull(),
  end_at: timestamp("end_at"),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const encounterOdontograms = pgTable("encounter_odontograms", {
  id: uuid("id").defaultRandom().primaryKey(),
  encounter_id: varchar("encounter_id", { length: 30 }).notNull().references(() => encounters.id, { onDelete: "cascade" }),
  dentition_type: varchar("dentition_type", { length: 10 }),
  // Adult, Child
  // Oral exam summary
  occlusi: varchar("occlusi", { length: 20 }),
  torus_palatinus: varchar("torus_palatinus", { length: 20 }),
  torus_mandibularis: varchar("torus_mandibularis", { length: 30 }),
  palatum: varchar("palatum", { length: 20 }),
  diastema: text("diastema"),
  gigi_anomali: text("gigi_anomali"),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const odontogramTeeth = pgTable("odontogram_teeth", {
  id: uuid("id").defaultRandom().primaryKey(),
  odontogram_id: uuid("odontogram_id").notNull().references(() => encounterOdontograms.id, { onDelete: "cascade" }),
  tooth_number: varchar("tooth_number", { length: 5 }).notNull(),
  // Tooth-level fields
  keadaan: text("keadaan"),
  protesa: text("protesa"),
  bahan_protesa: text("bahan_protesa"),
  created_at: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  uniqueTooth: unique("uq_odontogram_tooth").on(table.odontogram_id, table.tooth_number)
}));
const odontogramSurfaces = pgTable("odontogram_surfaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  tooth_id: uuid("tooth_id").notNull().references(() => odontogramTeeth.id, { onDelete: "cascade" }),
  surface: varchar("surface", { length: 1 }).notNull(),
  // O | B | L | M | D
  created_at: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  uniqueToothSurface: unique("uq_tooth_surface").on(table.tooth_id, table.surface)
}));
const odontogramRestorations = pgTable("odontogram_restorations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tooth_id: uuid("tooth_id").notNull().references(() => odontogramTeeth.id, { onDelete: "cascade" }),
  restorasi: text("restorasi"),
  bahan_restorasi: text("bahan_restorasi"),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const odontogramRestorationSurfaces = pgTable("odontogram_restoration_surfaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  restoration_id: uuid("restoration_id").notNull().references(() => odontogramRestorations.id, { onDelete: "cascade" }),
  surface_id: uuid("surface_id").notNull().references(() => odontogramSurfaces.id, { onDelete: "cascade" })
}, (table) => ({
  uniqueRestorationSurface: unique("uq_restoration_surface").on(table.restoration_id, table.surface_id)
}));
const odontogramDiagnoses = pgTable("odontogram_diagnoses", {
  id: uuid("id").defaultRandom().primaryKey(),
  tooth_id: uuid("tooth_id").notNull().references(() => odontogramTeeth.id, { onDelete: "cascade" }),
  icd10_id: uuid("icd10_id").notNull().references(() => terminologyMaster.id, { onDelete: "cascade" }),
  is_primary: boolean("is_primary").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  uniqueToothDiagnosis: unique("uq_tooth_icd10").on(table.tooth_id, table.icd10_id)
}));
const odontogramProcedures = pgTable("odontogram_procedures", {
  id: uuid("id").defaultRandom().primaryKey(),
  tooth_id: uuid("tooth_id").notNull().references(() => odontogramTeeth.id, { onDelete: "cascade" }),
  icd9cm_id: uuid("icd9cm_id").notNull().references(() => terminologyMaster.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  uniqueToothProcedure: unique("uq_tooth_icd9cm").on(table.tooth_id, table.icd9cm_id)
}));
const encounterPrescriptions = pgTable("encounter_prescriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  encounter_id: varchar("encounter_id", { length: 30 }).notNull().references(() => encounters.id, { onDelete: "cascade" }),
  terminology_id: uuid("terminology_id").references(() => terminologyMaster.id),
  dosage_form: text("dosage_form"),
  dosage: text("dosage"),
  quantity: integer("quantity"),
  instruction: text("instruction"),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const encounterReferrals = pgTable("encounter_referrals", {
  id: uuid("id").defaultRandom().primaryKey(),
  encounter_id: varchar("encounter_id", { length: 30 }).notNull().references(() => encounters.id, { onDelete: "cascade" }),
  doctor_code: varchar("doctor_code", { length: 10 }).notNull(),
  referral_date: date("referral_date").notNull(),
  note: text("note"),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const items = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),
  kode_item: varchar("kode_item", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  item_group: varchar("item_group", { length: 50 }),
  denomination: varchar("denomination", { length: 50 }),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});
const doctorItems = pgTable("doctor_items", {
  doctor_id: uuid("doctor_id").notNull().references(() => users.id),
  item_id: uuid("item_id").notNull().references(() => items.id)
}, (table) => ({
  pk: primaryKey(table.doctor_id, table.item_id)
}));
const encounterItems = pgTable("encounter_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  encounter_id: varchar("encounter_id", { length: 30 }).notNull().references(() => encounters.id, { onDelete: "cascade" }),
  item_id: uuid("item_id").notNull().references(() => items.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull().default(1),
  price_at_time: integer("price_at_time").notNull(),
  subtotal: integer("subtotal").notNull(),
  // computed in app as quantity * price_at_time
  created_at: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  uniqueEncounterItem: unique("uq_encounter_item").on(table.encounter_id, table.item_id)
}));
const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  encounter_id: varchar("encounter_id", { length: 30 }).notNull().references(() => encounters.id, { onDelete: "restrict" }),
  payment_mode: paymentModeEnum("payment_mode").default("NORMAL").notNull(),
  discount_percent: numeric("discount_percent", { precision: 5, scale: 2 }).default("0"),
  discount_amount: integer("discount_amount").default(0),
  total_sales: integer("total_sales").notNull(),
  net_sales: integer("net_sales").notNull(),
  total_paid: integer("total_paid").notNull(),
  payment_type: varchar("payment_type", { length: 50 }).notNull(),
  card_number: varchar("card_number", { length: 30 }),
  reference_number: varchar("reference_number", { length: 50 }),
  note: text("note"),
  proof_document_id: uuid("proof_document_id").references(() => documents.id, { onDelete: "set null" }),
  doctor_id: uuid("doctor_id").notNull().references(() => users.id),
  cashier_id: uuid("cashier_id").notNull().references(() => users.id),
  paid_at: timestamp("paid_at").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const shifts = pgTable("shifts", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  day_of_week: integer("day_of_week").notNull(),
  // 0=Sunday, 6=Saturday
  start_time: time("start_time").notNull(),
  end_time: time("end_time").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const chatConversations = pgTable("chat_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  participant_a: uuid("participant_a").notNull().references(() => users.id, { onDelete: "cascade" }),
  participant_b: uuid("participant_b").notNull().references(() => users.id, { onDelete: "cascade" }),
  last_message_at: timestamp("last_message_at"),
  created_at: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  uniqueParticipants: unique("uq_chat_participants").on(table.participant_a, table.participant_b)
}));
const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversation_id: uuid("conversation_id").notNull().references(() => chatConversations.id, { onDelete: "cascade" }),
  sender_id: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  read_at: timestamp("read_at"),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  created_by: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const notificationReads = pgTable("notification_reads", {
  id: uuid("id").defaultRandom().primaryKey(),
  notification_id: uuid("notification_id").notNull().references(() => notifications.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  read_at: timestamp("read_at").defaultNow().notNull()
}, (table) => ({
  uniqueNotificationUser: unique("uq_notification_read").on(table.notification_id, table.user_id)
}));
const usersRelations = relations(users, ({ many }) => ({
  shifts: many(shifts),
  doctor_encounters: many(encounters, { relationName: "doctor_to_encounters" }),
  kasir_encounters: many(encounters, { relationName: "kasir_to_encounters" }),
  registered_patients: many(patients),
  doctorItems: many(doctorItems),
  uploaded_documents: many(documents),
  doctor_payments: many(payments, { relationName: "doctor_to_payments" }),
  cashier_payments: many(payments, { relationName: "cashier_to_payments" }),
  sentMessages: many(chatMessages),
  conversationsAsA: many(chatConversations, { relationName: "participant_a_conversations" }),
  conversationsAsB: many(chatConversations, { relationName: "participant_b_conversations" }),
  notifications: many(notifications),
  notificationReads: many(notificationReads)
}));
const terminologyMasterRelations = relations(terminologyMaster, ({ many }) => ({
  diseaseHistories: many(patientDiseaseHistory),
  allergies: many(patientAllergy),
  medications: many(patientMedication),
  encounterReasons: many(encounters),
  odontogramDiagnoses: many(odontogramDiagnoses, { relationName: "icd10_to_odontogram" }),
  odontogramProcedures: many(odontogramProcedures, { relationName: "icd9cm_to_odontogram" }),
  prescriptions: many(encounterPrescriptions)
}));
const patientsRelations = relations(patients, ({ one, many }) => ({
  kasir: one(users, { fields: [patients.kasir_id], references: [users.id] }),
  profile_document: one(documents, { fields: [patients.profile_document_id], references: [documents.id] }),
  diseaseHistory: many(patientDiseaseHistory),
  allergies: many(patientAllergy),
  medications: many(patientMedication),
  encounters: many(encounters),
  documents: many(documents)
}));
const patientDiseaseHistoryRelations = relations(patientDiseaseHistory, ({ one }) => ({
  patient: one(patients, { fields: [patientDiseaseHistory.patient_id], references: [patients.id] }),
  terminology: one(terminologyMaster, { fields: [patientDiseaseHistory.terminology_id], references: [terminologyMaster.id] })
}));
const patientAllergyRelations = relations(patientAllergy, ({ one }) => ({
  patient: one(patients, { fields: [patientAllergy.patient_id], references: [patients.id] }),
  substance: one(terminologyMaster, { fields: [patientAllergy.substance_id], references: [terminologyMaster.id] })
}));
const patientMedicationRelations = relations(patientMedication, ({ one }) => ({
  patient: one(patients, { fields: [patientMedication.patient_id], references: [patients.id] }),
  terminology: one(terminologyMaster, { fields: [patientMedication.terminology_id], references: [terminologyMaster.id] })
}));
const encountersRelations = relations(encounters, ({ one, many }) => ({
  patient: one(patients, { fields: [encounters.patient_id], references: [patients.id] }),
  doctor: one(users, { fields: [encounters.doctor_id], references: [users.id], relationName: "doctor_to_encounters" }),
  kasir: one(users, { fields: [encounters.kasir_id], references: [users.id], relationName: "kasir_to_encounters" }),
  encounter_reason: one(terminologyMaster, { fields: [encounters.encounter_reason_id], references: [terminologyMaster.id] }),
  referral_in: one(encounterReferrals, { fields: [encounters.encounter_referral_id], references: [encounterReferrals.id], relationName: "referral_to_encounter" }),
  soap_document: one(documents, { fields: [encounters.soap_document_id], references: [documents.id] }),
  statusHistory: many(statusHistory),
  odontograms: many(encounterOdontograms),
  prescriptions: many(encounterPrescriptions),
  referrals: many(encounterReferrals),
  encounterItems: many(encounterItems),
  documents: many(documents),
  payments: many(payments)
}));
const documentsRelations = relations(documents, ({ one }) => ({
  patient: one(patients, { fields: [documents.patient_id], references: [patients.id] }),
  encounter: one(encounters, { fields: [documents.encounter_id], references: [encounters.id] }),
  uploader: one(users, { fields: [documents.uploaded_by], references: [users.id] })
}));
const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  encounter: one(encounters, { fields: [statusHistory.encounter_id], references: [encounters.id] })
}));
const encounterOdontogramsRelations = relations(encounterOdontograms, ({ one, many }) => ({
  encounter: one(encounters, { fields: [encounterOdontograms.encounter_id], references: [encounters.id] }),
  teeth: many(odontogramTeeth)
}));
const odontogramTeethRelations = relations(odontogramTeeth, ({ one, many }) => ({
  odontogram: one(encounterOdontograms, { fields: [odontogramTeeth.odontogram_id], references: [encounterOdontograms.id] }),
  surfaces: many(odontogramSurfaces),
  restorations: many(odontogramRestorations),
  diagnoses: many(odontogramDiagnoses),
  procedures: many(odontogramProcedures)
}));
const odontogramSurfacesRelations = relations(odontogramSurfaces, ({ one, many }) => ({
  tooth: one(odontogramTeeth, { fields: [odontogramSurfaces.tooth_id], references: [odontogramTeeth.id] }),
  restorationSurfaces: many(odontogramRestorationSurfaces)
}));
const odontogramRestorationsRelations = relations(odontogramRestorations, ({ one, many }) => ({
  tooth: one(odontogramTeeth, { fields: [odontogramRestorations.tooth_id], references: [odontogramTeeth.id] }),
  restorationSurfaces: many(odontogramRestorationSurfaces)
}));
const odontogramRestorationSurfacesRelations = relations(odontogramRestorationSurfaces, ({ one }) => ({
  restoration: one(odontogramRestorations, { fields: [odontogramRestorationSurfaces.restoration_id], references: [odontogramRestorations.id] }),
  surface: one(odontogramSurfaces, { fields: [odontogramRestorationSurfaces.surface_id], references: [odontogramSurfaces.id] })
}));
const odontogramDiagnosesRelations = relations(odontogramDiagnoses, ({ one }) => ({
  tooth: one(odontogramTeeth, { fields: [odontogramDiagnoses.tooth_id], references: [odontogramTeeth.id] }),
  icd10: one(terminologyMaster, { fields: [odontogramDiagnoses.icd10_id], references: [terminologyMaster.id], relationName: "icd10_to_odontogram" })
}));
const odontogramProceduresRelations = relations(odontogramProcedures, ({ one }) => ({
  tooth: one(odontogramTeeth, { fields: [odontogramProcedures.tooth_id], references: [odontogramTeeth.id] }),
  icd9cm: one(terminologyMaster, { fields: [odontogramProcedures.icd9cm_id], references: [terminologyMaster.id], relationName: "icd9cm_to_odontogram" })
}));
const encounterPrescriptionsRelations = relations(encounterPrescriptions, ({ one }) => ({
  encounter: one(encounters, { fields: [encounterPrescriptions.encounter_id], references: [encounters.id] }),
  terminology: one(terminologyMaster, { fields: [encounterPrescriptions.terminology_id], references: [terminologyMaster.id] })
}));
const encounterReferralsRelations = relations(encounterReferrals, ({ one, many }) => ({
  encounter: one(encounters, { fields: [encounterReferrals.encounter_id], references: [encounters.id] }),
  encounters_referred_in: many(encounters, { relationName: "referral_to_encounter" })
}));
const itemsRelations = relations(items, ({ many }) => ({
  doctorItems: many(doctorItems),
  encounterItems: many(encounterItems)
}));
const doctorItemsRelations = relations(doctorItems, ({ one }) => ({
  doctor: one(users, { fields: [doctorItems.doctor_id], references: [users.id] }),
  item: one(items, { fields: [doctorItems.item_id], references: [items.id] })
}));
const encounterItemsRelations = relations(encounterItems, ({ one }) => ({
  encounter: one(encounters, { fields: [encounterItems.encounter_id], references: [encounters.id] }),
  item: one(items, { fields: [encounterItems.item_id], references: [items.id] })
}));
const paymentsRelations = relations(payments, ({ one }) => ({
  encounter: one(encounters, { fields: [payments.encounter_id], references: [encounters.id] }),
  proof_document: one(documents, { fields: [payments.proof_document_id], references: [documents.id] }),
  doctor: one(users, { fields: [payments.doctor_id], references: [users.id], relationName: "doctor_to_payments" }),
  cashier: one(users, { fields: [payments.cashier_id], references: [users.id], relationName: "cashier_to_payments" })
}));
const shiftsRelations = relations(shifts, ({ one }) => ({
  user: one(users, { fields: [shifts.user_id], references: [users.id] })
}));
const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  participantA: one(users, { fields: [chatConversations.participant_a], references: [users.id], relationName: "participant_a_conversations" }),
  participantB: one(users, { fields: [chatConversations.participant_b], references: [users.id], relationName: "participant_b_conversations" }),
  messages: many(chatMessages)
}));
const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, { fields: [chatMessages.conversation_id], references: [chatConversations.id] }),
  sender: one(users, { fields: [chatMessages.sender_id], references: [users.id] })
}));
const notificationsRelations = relations(notifications, ({ one, many }) => ({
  creator: one(users, { fields: [notifications.created_by], references: [users.id] }),
  reads: many(notificationReads)
}));
const notificationReadsRelations = relations(notificationReads, ({ one }) => ({
  notification: one(notifications, { fields: [notificationReads.notification_id], references: [notifications.id] }),
  user: one(users, { fields: [notificationReads.user_id], references: [users.id] })
}));
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  bloodTypeEnum,
  chatConversations,
  chatConversationsRelations,
  chatMessages,
  chatMessagesRelations,
  citizenshipEnum,
  doctorItems,
  doctorItemsRelations,
  documents,
  documentsRelations,
  encounterItems,
  encounterItemsRelations,
  encounterOdontograms,
  encounterOdontogramsRelations,
  encounterPrescriptions,
  encounterPrescriptionsRelations,
  encounterReferrals,
  encounterReferralsRelations,
  encounterStatusEnum,
  encounters,
  encountersRelations,
  formModeEnum,
  genderEnum,
  items,
  itemsRelations,
  maritalStatusEnum,
  notificationReads,
  notificationReadsRelations,
  notifications,
  notificationsRelations,
  odontogramDiagnoses,
  odontogramDiagnosesRelations,
  odontogramProcedures,
  odontogramProceduresRelations,
  odontogramRestorationSurfaces,
  odontogramRestorationSurfacesRelations,
  odontogramRestorations,
  odontogramRestorationsRelations,
  odontogramSurfaces,
  odontogramSurfacesRelations,
  odontogramTeeth,
  odontogramTeethRelations,
  patientAllergy,
  patientAllergyRelations,
  patientDiseaseHistory,
  patientDiseaseHistoryRelations,
  patientMedication,
  patientMedicationRelations,
  patients,
  patientsRelations,
  paymentModeEnum,
  payments,
  paymentsRelations,
  rhesusEnum,
  roleEnum,
  shifts,
  shiftsRelations,
  statusHistory,
  statusHistoryRelations,
  statusHistoryStatusEnum,
  terminologyMaster,
  terminologyMasterRelations,
  terminologySystemEnum,
  users,
  usersRelations
}, Symbol.toStringTag, { value: "Module" }));
const connectionString = process.env.DATABASE_URL || "postgresql://oratio:Pwd%266w9RfK@localhost:5432/oratio";
const client = postgres(connectionString);
const db = drizzle(client, { schema });
export {
  chatMessages as A,
  notificationReads as a,
  patientDiseaseHistory as b,
  patientAllergy as c,
  db as d,
  encounters as e,
  patientMedication as f,
  documents as g,
  statusHistory as h,
  encounterOdontograms as i,
  odontogramSurfaces as j,
  odontogramRestorations as k,
  odontogramRestorationSurfaces as l,
  odontogramDiagnoses as m,
  notifications as n,
  odontogramTeeth as o,
  patients as p,
  odontogramProcedures as q,
  encounterPrescriptions as r,
  shifts as s,
  terminologyMaster as t,
  users as u,
  encounterReferrals as v,
  items as w,
  encounterItems as x,
  payments as y,
  chatConversations as z
};
