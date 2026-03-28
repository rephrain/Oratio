import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { pgEnum, pgTable, uuid, varchar, text, boolean, timestamp, integer, time, date, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
const roleEnum = pgEnum("role", ["admin", "kasir", "dokter"]);
const genderEnum = pgEnum("gender", ["male", "female"]);
const maritalStatusEnum = pgEnum("marital_status", ["S", "M", "W", "D"]);
const citizenshipEnum = pgEnum("citizenship", ["WNI", "WNA"]);
const bloodTypeEnum = pgEnum("blood_type", ["A", "B", "AB", "O"]);
const rhesusEnum = pgEnum("rhesus", ["+", "-"]);
const encounterStatusEnum = pgEnum("encounter_status", ["Planned", "Arrived", "In Progress", "On Hold", "Discharged", "Completed", "Cancelled", "Discontinued"]);
const formModeEnum = pgEnum("form_mode", ["SOAP", "SOAP-WHO"]);
const paymentModeEnum = pgEnum("payment_mode", ["NORMAL", "VOUCHER"]);
const terminologySystemEnum = pgEnum("terminology_system", ["SNOMED", "ICD-10", "ICD-9-CM", "KFA"]);
const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),
  doctor_code: varchar("doctor_code", { length: 10 }),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});
const doctorShifts = pgTable("doctor_shifts", {
  id: uuid("id").defaultRandom().primaryKey(),
  doctor_id: uuid("doctor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  day_of_week: integer("day_of_week").notNull(),
  // 0=Sunday, 6=Saturday
  start_time: time("start_time").notNull(),
  end_time: time("end_time").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const patients = pgTable("patients", {
  id: varchar("id", { length: 20 }).primaryKey(),
  // O000001 format
  nik: varchar("nik", { length: 16 }).unique(),
  nama_lengkap: varchar("nama_lengkap", { length: 255 }).notNull(),
  birth_date: date("birth_date").notNull(),
  birthplace: varchar("birthplace", { length: 100 }),
  gender: genderEnum("gender").notNull(),
  nomor_kk: varchar("nomor_kk", { length: 16 }),
  address: text("address"),
  province: varchar("province", { length: 100 }),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  village: varchar("village", { length: 100 }),
  rt: varchar("rt", { length: 5 }),
  rw: varchar("rw", { length: 5 }),
  handphone: varchar("handphone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  marital_status: maritalStatusEnum("marital_status"),
  citizenship: citizenshipEnum("citizenship").default("WNI"),
  language: varchar("language", { length: 10 }).default("id"),
  blood_type: bloodTypeEnum("blood_type"),
  rhesus: rhesusEnum("rhesus"),
  pregnancy_status: boolean("pregnancy_status").default(false),
  document_id: uuid("document_id"),
  user_id: uuid("user_id").references(() => users.id),
  // kasir who registered
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});
const patientDiseaseHistory = pgTable("patient_disease_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  patient_id: varchar("patient_id", { length: 20 }).notNull().references(() => patients.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(),
  // 'personal' or 'family'
  terminology_id: uuid("terminology_id").references(() => terminologyMaster.id),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const patientAllergy = pgTable("patient_allergy", {
  id: uuid("id").defaultRandom().primaryKey(),
  patient_id: varchar("patient_id", { length: 20 }).notNull().references(() => patients.id, { onDelete: "cascade" }),
  substance_code: varchar("substance_code", { length: 50 }),
  substance_display: varchar("substance_display", { length: 255 }),
  reaction_code: varchar("reaction_code", { length: 50 }),
  reaction_display: varchar("reaction_display", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const patientMedication = pgTable("patient_medication", {
  id: uuid("id").defaultRandom().primaryKey(),
  patient_id: varchar("patient_id", { length: 20 }).notNull().references(() => patients.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 50 }),
  display: varchar("display", { length: 255 }),
  dosage: varchar("dosage", { length: 100 }),
  note: text("note"),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const terminologyMaster = pgTable("terminology_master", {
  id: uuid("id").defaultRandom().primaryKey(),
  system: terminologySystemEnum("system").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  display: varchar("display", { length: 500 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  patient_id: varchar("patient_id", { length: 20 }).references(() => patients.id, { onDelete: "set null" }),
  encounter_id: varchar("encounter_id", { length: 30 }).references(() => encounters.id, { onDelete: "set null" }),
  file_name: varchar("file_name", { length: 255 }).notNull(),
  file_type: varchar("file_type", { length: 50 }),
  file_path: text("file_path").notNull(),
  file_size: integer("file_size"),
  uploaded_by: uuid("uploaded_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const encounters = pgTable("encounters", {
  id: varchar("id", { length: 30 }).primaryKey(),
  // YYYYMM{DoctorCode}NNNNNN
  patient_id: varchar("patient_id", { length: 20 }).notNull().references(() => patients.id),
  doctor_id: uuid("doctor_id").notNull().references(() => users.id),
  queue_number: integer("queue_number"),
  form_mode: formModeEnum("form_mode").default("SOAP"),
  status: encounterStatusEnum("status").default("Planned").notNull(),
  chief_complaint_code: varchar("chief_complaint_code", { length: 50 }),
  chief_complaint_display: varchar("chief_complaint_display", { length: 255 }),
  subjective: text("subjective"),
  objective: text("objective"),
  assessment: text("assessment"),
  plan: text("plan"),
  resep: text("resep"),
  keterangan: text("keterangan"),
  reason_code: varchar("reason_code", { length: 50 }),
  reason_display: varchar("reason_display", { length: 255 }),
  reason_category: varchar("reason_category", { length: 30 }),
  // finding, procedure, situation, event
  tekanan_darah: varchar("tekanan_darah", { length: 20 }),
  referral_source: varchar("referral_source", { length: 100 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});
const statusHistory = pgTable("status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  encounter_id: varchar("encounter_id", { length: 30 }).notNull().references(() => encounters.id, { onDelete: "cascade" }),
  status: encounterStatusEnum("status").notNull(),
  start_time: timestamp("start_time").defaultNow().notNull(),
  end_time: timestamp("end_time"),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const encounterOdontograms = pgTable("encounter_odontograms", {
  id: uuid("id").defaultRandom().primaryKey(),
  encounter_id: varchar("encounter_id", { length: 30 }).notNull().references(() => encounters.id, { onDelete: "cascade" }),
  dentition: varchar("dentition", { length: 20 }).default("permanent"),
  // permanent, deciduous, mixed
  occlusi: varchar("occlusi", { length: 30 }),
  // Normal Bite, Cross Bite, Steep Bite
  torus_palatinus: varchar("torus_palatinus", { length: 30 }),
  // Tidak Ada, Kecil, Sedang, Besar, Multiple
  torus_mandibularis: varchar("torus_mandibularis", { length: 30 }),
  // Tidak Ada, Sisi Kiri, Sisi Kanan, Kedua Sisi
  palatum: varchar("palatum", { length: 20 }),
  // Dalam, Sedang, Rendah
  diastema: text("diastema"),
  // text: "Tidak Ada" or description of location/width
  gigi_anomali: text("gigi_anomali"),
  // text: "Tidak Ada" or description of location/shape
  created_at: timestamp("created_at").defaultNow().notNull()
});
const odontogramDetails = pgTable("odontogram_details", {
  id: uuid("id").defaultRandom().primaryKey(),
  odontogram_id: uuid("odontogram_id").notNull().references(() => encounterOdontograms.id, { onDelete: "cascade" }),
  tooth_number: varchar("tooth_number", { length: 5 }).notNull(),
  surface: varchar("surface", { length: 10 }),
  // M, D, O, B, L or combinations
  keadaan: varchar("keadaan", { length: 50 }),
  bahan_restorasi: varchar("bahan_restorasi", { length: 50 }),
  restorasi: varchar("restorasi", { length: 50 }),
  protesa: varchar("protesa", { length: 50 }),
  bahan_protesa: varchar("bahan_protesa", { length: 50 }),
  diagnosis_code: varchar("diagnosis_code", { length: 50 }),
  diagnosis_display: varchar("diagnosis_display", { length: 255 }),
  procedure_code: varchar("procedure_code", { length: 50 }),
  procedure_display: varchar("procedure_display", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const encounterPrescriptions = pgTable("encounter_prescriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  encounter_id: varchar("encounter_id", { length: 30 }).notNull().references(() => encounters.id, { onDelete: "cascade" }),
  kfa_code: varchar("kfa_code", { length: 50 }),
  product_name: varchar("product_name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }),
  quantity: integer("quantity"),
  instruction: text("instruction"),
  notes: text("notes"),
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
const encounterDiagnoses = pgTable("encounter_diagnoses", {
  id: uuid("id").defaultRandom().primaryKey(),
  encounter_id: varchar("encounter_id", { length: 30 }).notNull().references(() => encounters.id, { onDelete: "cascade" }),
  terminology_id: uuid("terminology_id").references(() => terminologyMaster.id),
  code: varchar("code", { length: 50 }).notNull(),
  display: varchar("display", { length: 255 }).notNull(),
  is_primary: boolean("is_primary").default(false),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const encounterProcedures = pgTable("encounter_procedures", {
  id: uuid("id").defaultRandom().primaryKey(),
  encounter_id: varchar("encounter_id", { length: 30 }).notNull().references(() => encounters.id, { onDelete: "cascade" }),
  terminology_id: uuid("terminology_id").references(() => terminologyMaster.id),
  code: varchar("code", { length: 50 }).notNull(),
  display: varchar("display", { length: 255 }).notNull(),
  tooth_number: varchar("tooth_number", { length: 5 }),
  surface: varchar("surface", { length: 10 }),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const items = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  user_id: uuid("user_id").references(() => users.id),
  // doctor owner
  item_group: varchar("item_group", { length: 50 }),
  denomination: varchar("denomination", { length: 50 }),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});
const encounterItems = pgTable("encounter_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  encounter_id: varchar("encounter_id", { length: 30 }).notNull().references(() => encounters.id, { onDelete: "cascade" }),
  item_id: uuid("item_id").notNull().references(() => items.id),
  quantity: integer("quantity").notNull().default(1),
  price_at_time: decimal("price_at_time", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  encounter_id: varchar("encounter_id", { length: 30 }).notNull().references(() => encounters.id),
  cashier_id: uuid("cashier_id").notNull().references(() => users.id),
  payment_mode: paymentModeEnum("payment_mode").default("NORMAL").notNull(),
  payment_type: varchar("payment_type", { length: 50 }),
  payment_code: varchar("payment_code", { length: 20 }),
  card_number: varchar("card_number", { length: 30 }),
  reference_number: varchar("reference_number", { length: 50 }),
  total_sales: decimal("total_sales", { precision: 12, scale: 2 }).notNull(),
  discount_percent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0"),
  discount_amount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
  net_sales: decimal("net_sales", { precision: 12, scale: 2 }).notNull(),
  total_paid: decimal("total_paid", { precision: 12, scale: 2 }).notNull(),
  note: text("note"),
  proof_document_id: uuid("proof_document_id").references(() => documents.id),
  paid_at: timestamp("paid_at").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull()
});
const usersRelations = relations(users, ({ many }) => ({
  shifts: many(doctorShifts),
  encounters: many(encounters),
  items: many(items)
}));
const doctorShiftsRelations = relations(doctorShifts, ({ one }) => ({
  doctor: one(users, { fields: [doctorShifts.doctor_id], references: [users.id] })
}));
const patientsRelations = relations(patients, ({ many }) => ({
  diseaseHistory: many(patientDiseaseHistory),
  allergies: many(patientAllergy),
  medications: many(patientMedication),
  encounters: many(encounters),
  documents: many(documents)
}));
const encountersRelations = relations(encounters, ({ one, many }) => ({
  patient: one(patients, { fields: [encounters.patient_id], references: [patients.id] }),
  doctor: one(users, { fields: [encounters.doctor_id], references: [users.id] }),
  statusHistory: many(statusHistory),
  odontograms: many(encounterOdontograms),
  prescriptions: many(encounterPrescriptions),
  referrals: many(encounterReferrals),
  diagnoses: many(encounterDiagnoses),
  procedures: many(encounterProcedures),
  encounterItems: many(encounterItems),
  documents: many(documents)
}));
const encounterOdontogramsRelations = relations(encounterOdontograms, ({ one, many }) => ({
  encounter: one(encounters, { fields: [encounterOdontograms.encounter_id], references: [encounters.id] }),
  details: many(odontogramDetails)
}));
const odontogramDetailsRelations = relations(odontogramDetails, ({ one }) => ({
  odontogram: one(encounterOdontograms, { fields: [odontogramDetails.odontogram_id], references: [encounterOdontograms.id] })
}));
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  bloodTypeEnum,
  citizenshipEnum,
  doctorShifts,
  doctorShiftsRelations,
  documents,
  encounterDiagnoses,
  encounterItems,
  encounterOdontograms,
  encounterOdontogramsRelations,
  encounterPrescriptions,
  encounterProcedures,
  encounterReferrals,
  encounterStatusEnum,
  encounters,
  encountersRelations,
  formModeEnum,
  genderEnum,
  items,
  maritalStatusEnum,
  odontogramDetails,
  odontogramDetailsRelations,
  patientAllergy,
  patientDiseaseHistory,
  patientMedication,
  patients,
  patientsRelations,
  paymentModeEnum,
  payments,
  rhesusEnum,
  roleEnum,
  statusHistory,
  terminologyMaster,
  terminologySystemEnum,
  users,
  usersRelations
}, Symbol.toStringTag, { value: "Module" }));
const connectionString = process.env.DATABASE_URL || "postgresql://oratio:Pwd%266w9RfK@localhost:5432/oratio";
const client = postgres(connectionString);
const db = drizzle(client, { schema });
export {
  doctorShifts as a,
  patientDiseaseHistory as b,
  patientAllergy as c,
  db as d,
  patientMedication as e,
  documents as f,
  encounters as g,
  encounterOdontograms as h,
  encounterPrescriptions as i,
  encounterReferrals as j,
  encounterDiagnoses as k,
  encounterProcedures as l,
  items as m,
  encounterItems as n,
  odontogramDetails as o,
  patients as p,
  payments as q,
  statusHistory as s,
  terminologyMaster as t,
  users as u
};
