CREATE TYPE "public"."blood_type" AS ENUM('A', 'B', 'AB', 'O');--> statement-breakpoint
CREATE TYPE "public"."citizenship" AS ENUM('WNI', 'WNA');--> statement-breakpoint
CREATE TYPE "public"."encounter_status" AS ENUM('Planned', 'Arrived', 'In Progress', 'On Hold', 'Discharged', 'Completed', 'Cancelled', 'Discontinued');--> statement-breakpoint
CREATE TYPE "public"."form_mode" AS ENUM('SOAP', 'SOAP-WHO');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('S', 'M', 'W', 'D');--> statement-breakpoint
CREATE TYPE "public"."payment_mode" AS ENUM('NORMAL', 'VOUCHER');--> statement-breakpoint
CREATE TYPE "public"."rhesus" AS ENUM('+', '-');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'kasir', 'dokter');--> statement-breakpoint
CREATE TYPE "public"."terminology_system" AS ENUM('SNOMED', 'ICD-10', 'ICD-9-CM', 'KFA');--> statement-breakpoint
CREATE TABLE "doctor_shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doctor_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" varchar(20),
	"encounter_id" varchar(30),
	"file_name" varchar(255) NOT NULL,
	"file_type" varchar(50),
	"file_path" text NOT NULL,
	"file_size" integer,
	"uploaded_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounter_diagnoses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" varchar(30) NOT NULL,
	"terminology_id" uuid,
	"code" varchar(50) NOT NULL,
	"display" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounter_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" varchar(30) NOT NULL,
	"item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price_at_time" numeric(12, 2) NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounter_odontograms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" varchar(30) NOT NULL,
	"dentition" varchar(20) DEFAULT 'permanent',
	"occlusi" text,
	"torus" text,
	"palatum" text,
	"diastema" boolean DEFAULT false,
	"anomali" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounter_prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" varchar(30) NOT NULL,
	"kfa_code" varchar(50),
	"product_name" varchar(255) NOT NULL,
	"dosage" varchar(100),
	"quantity" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounter_procedures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" varchar(30) NOT NULL,
	"terminology_id" uuid,
	"code" varchar(50) NOT NULL,
	"display" varchar(255) NOT NULL,
	"tooth_number" varchar(5),
	"surface" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounter_referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" varchar(30) NOT NULL,
	"doctor_code" varchar(10) NOT NULL,
	"referral_date" date NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounters" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"patient_id" varchar(20) NOT NULL,
	"doctor_id" uuid NOT NULL,
	"queue_number" integer,
	"form_mode" "form_mode" DEFAULT 'SOAP',
	"status" "encounter_status" DEFAULT 'Planned' NOT NULL,
	"chief_complaint_code" varchar(50),
	"chief_complaint_display" varchar(255),
	"subjective" text,
	"objective" text,
	"assessment" text,
	"plan" text,
	"tekanan_darah" varchar(20),
	"referral_source" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"user_id" uuid,
	"price" numeric(12, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odontogram_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"odontogram_id" uuid NOT NULL,
	"tooth_number" varchar(5) NOT NULL,
	"surface" varchar(10),
	"keadaan" varchar(50),
	"restorasi" varchar(50),
	"diagnosis_code" varchar(50),
	"diagnosis_display" varchar(255),
	"procedure_code" varchar(50),
	"procedure_display" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_allergy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" varchar(20) NOT NULL,
	"substance_code" varchar(50),
	"substance_display" varchar(255),
	"reaction_code" varchar(50),
	"reaction_display" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_disease_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" varchar(20) NOT NULL,
	"type" varchar(20) NOT NULL,
	"terminology_id" uuid,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_medication" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" varchar(20) NOT NULL,
	"code" varchar(50),
	"display" varchar(255),
	"dosage" varchar(100),
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"nik" varchar(16),
	"nama_lengkap" varchar(255) NOT NULL,
	"birth_date" date NOT NULL,
	"birthplace" varchar(100),
	"gender" "gender" NOT NULL,
	"nomor_kk" varchar(16),
	"address" text,
	"province" varchar(100),
	"city" varchar(100),
	"district" varchar(100),
	"village" varchar(100),
	"rt" varchar(5),
	"rw" varchar(5),
	"handphone" varchar(20),
	"email" varchar(255),
	"marital_status" "marital_status",
	"citizenship" "citizenship" DEFAULT 'WNI',
	"language" varchar(10) DEFAULT 'id',
	"blood_type" "blood_type",
	"rhesus" "rhesus",
	"pregnancy_status" boolean DEFAULT false,
	"document_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patients_nik_unique" UNIQUE("nik")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" varchar(30) NOT NULL,
	"cashier_id" uuid NOT NULL,
	"payment_mode" "payment_mode" DEFAULT 'NORMAL' NOT NULL,
	"payment_type" varchar(50),
	"payment_code" varchar(20),
	"card_number" varchar(30),
	"total_sales" numeric(12, 2) NOT NULL,
	"discount_percent" numeric(5, 2) DEFAULT '0',
	"discount_amount" numeric(12, 2) DEFAULT '0',
	"net_sales" numeric(12, 2) NOT NULL,
	"note" text,
	"proof_document_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" varchar(30) NOT NULL,
	"status" "encounter_status" NOT NULL,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "terminology_master" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"system" "terminology_system" NOT NULL,
	"code" varchar(50) NOT NULL,
	"display" varchar(500) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" NOT NULL,
	"doctor_code" varchar(10),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "doctor_shifts" ADD CONSTRAINT "doctor_shifts_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_diagnoses" ADD CONSTRAINT "encounter_diagnoses_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_diagnoses" ADD CONSTRAINT "encounter_diagnoses_terminology_id_terminology_master_id_fk" FOREIGN KEY ("terminology_id") REFERENCES "public"."terminology_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_items" ADD CONSTRAINT "encounter_items_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_items" ADD CONSTRAINT "encounter_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_odontograms" ADD CONSTRAINT "encounter_odontograms_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_prescriptions" ADD CONSTRAINT "encounter_prescriptions_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_procedures" ADD CONSTRAINT "encounter_procedures_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_procedures" ADD CONSTRAINT "encounter_procedures_terminology_id_terminology_master_id_fk" FOREIGN KEY ("terminology_id") REFERENCES "public"."terminology_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_referrals" ADD CONSTRAINT "encounter_referrals_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontogram_details" ADD CONSTRAINT "odontogram_details_odontogram_id_encounter_odontograms_id_fk" FOREIGN KEY ("odontogram_id") REFERENCES "public"."encounter_odontograms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_allergy" ADD CONSTRAINT "patient_allergy_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_disease_history" ADD CONSTRAINT "patient_disease_history_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_disease_history" ADD CONSTRAINT "patient_disease_history_terminology_id_terminology_master_id_fk" FOREIGN KEY ("terminology_id") REFERENCES "public"."terminology_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_medication" ADD CONSTRAINT "patient_medication_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_proof_document_id_documents_id_fk" FOREIGN KEY ("proof_document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;