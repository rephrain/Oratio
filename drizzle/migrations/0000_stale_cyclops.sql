CREATE TYPE "public"."blood_type" AS ENUM('A', 'B', 'AB', 'O');--> statement-breakpoint
CREATE TYPE "public"."citizenship" AS ENUM('WNI', 'WNA');--> statement-breakpoint
CREATE TYPE "public"."encounter_status" AS ENUM('Planned', 'In Progress', 'On Hold', 'Discharged', 'Completed', 'Cancelled', 'Discontinued');--> statement-breakpoint
CREATE TYPE "public"."form_mode" AS ENUM('SOAP', 'SOAP_WHO');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('S', 'M', 'W', 'D');--> statement-breakpoint
CREATE TYPE "public"."payment_mode" AS ENUM('NORMAL', 'VOUCHER');--> statement-breakpoint
CREATE TYPE "public"."rhesus" AS ENUM('+', '-');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'kasir', 'dokter');--> statement-breakpoint
CREATE TYPE "public"."status_history_status" AS ENUM('Arrived', 'In Progress', 'Finished');--> statement-breakpoint
CREATE TYPE "public"."terminology_system" AS ENUM('SNOMED', 'ICD-10', 'ICD-9-CM', 'KFA');--> statement-breakpoint
CREATE TABLE "auth_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"app_token" text NOT NULL,
	"app_token_expires_at" timestamp NOT NULL,
	"satusehat_token" text,
	"satusehat_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_tokens_app_token_unique" UNIQUE("app_token")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" varchar(10),
	"encounter_id" varchar(30),
	"document_type" varchar(50),
	"file_name" varchar(255) NOT NULL,
	"file_path" text NOT NULL,
	"mime_type" varchar(100),
	"file_size" bigint,
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
	"price_at_time" integer NOT NULL,
	"subtotal" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_encounter_item" UNIQUE("encounter_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "encounter_odontograms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" varchar(30) NOT NULL,
	"dentition_type" varchar(10),
	"occlusi" varchar(20),
	"torus_palatinus" varchar(20),
	"torus_mandibularis" varchar(30),
	"palatum" varchar(20),
	"diastema" text,
	"gigi_anomali" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounter_prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" varchar(30) NOT NULL,
	"kfa_code" varchar(30),
	"product_name" text NOT NULL,
	"dosage_form" text,
	"quantity" integer,
	"instruction" text,
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
	"patient_id" varchar(10) NOT NULL,
	"kasir_id" uuid,
	"doctor_id" uuid NOT NULL,
	"queue_number" integer,
	"form_mode" "form_mode" DEFAULT 'SOAP',
	"status" "encounter_status" DEFAULT 'Planned' NOT NULL,
	"encounter_reason_id" uuid,
	"reason_type" varchar(15),
	"subjective" text,
	"objective" text,
	"assessment" text,
	"plan" text,
	"resep" text,
	"keterangan" text,
	"referral_from_doctor_code" varchar(5),
	"referral_note" text,
	"referral_source" varchar(100),
	"tekanan_darah" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"user_id" uuid,
	"price" numeric(12, 2) NOT NULL,
	"item_group" varchar(50),
	"denomination" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odontogram_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"odontogram_id" uuid NOT NULL,
	"tooth_number" varchar(5) NOT NULL,
	"surface" varchar(5) NOT NULL,
	"keadaan" text,
	"bahan_restorasi" text,
	"restorasi" text,
	"protesa" text,
	"bahan_protesa" text,
	"icd10_id" uuid,
	"icd9cm_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_odontogram_tooth_surface" UNIQUE("odontogram_id","tooth_number","surface")
);
--> statement-breakpoint
CREATE TABLE "patient_allergy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" varchar(20) NOT NULL,
	"substance_id" uuid,
	"reaction" varchar(50),
	"reaction_display" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_disease_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" varchar(10) NOT NULL,
	"terminology_id" uuid,
	"type" varchar(20) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_medication" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" varchar(10) NOT NULL,
	"terminology_id" uuid,
	"kfa_code" varchar(30),
	"product_name" text,
	"dosage_form" text,
	"dosage" text,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"nik" varchar(20),
	"nama_lengkap" text NOT NULL,
	"birth_date" date NOT NULL,
	"birthplace" text,
	"gender" "gender",
	"nomor_kk" varchar(20),
	"address" text,
	"province" text,
	"city" text,
	"district" text,
	"village" text,
	"rt" varchar(5),
	"rw" varchar(5),
	"handphone" varchar(20),
	"email" text,
	"marital_status" "marital_status",
	"citizenship" "citizenship" DEFAULT 'WNI',
	"communication_language" varchar(20),
	"doctor_code" varchar(5),
	"blood_type" "blood_type",
	"rhesus" "rhesus",
	"pregnancy_status" boolean DEFAULT false,
	"tekanan_darah" varchar(20),
	"profile_document_id" uuid,
	"kasir_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patients_nik_unique" UNIQUE("nik")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" varchar(30) NOT NULL,
	"payment_mode" "payment_mode" DEFAULT 'NORMAL' NOT NULL,
	"discount_percent" numeric(5, 2) DEFAULT '0',
	"discount_amount" integer DEFAULT 0,
	"total_sales" integer NOT NULL,
	"net_sales" integer NOT NULL,
	"total_paid" integer NOT NULL,
	"payment_type" varchar(50) NOT NULL,
	"card_number" varchar(30),
	"reference_number" varchar(50),
	"note" text,
	"proof_document_id" uuid,
	"cashier_id" uuid NOT NULL,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doctor_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" varchar(30) NOT NULL,
	"status" "status_history_status" NOT NULL,
	"start_at" timestamp DEFAULT now() NOT NULL,
	"end_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "terminology_master" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"system" "terminology_system" NOT NULL,
	"code" varchar(30) NOT NULL,
	"display" text NOT NULL,
	"version" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_terminology_system_code" UNIQUE("system","code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" NOT NULL,
	"doctor_code" varchar(5),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_doctor_code_unique" UNIQUE("doctor_code")
);
--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_diagnoses" ADD CONSTRAINT "encounter_diagnoses_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_diagnoses" ADD CONSTRAINT "encounter_diagnoses_terminology_id_terminology_master_id_fk" FOREIGN KEY ("terminology_id") REFERENCES "public"."terminology_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_items" ADD CONSTRAINT "encounter_items_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_items" ADD CONSTRAINT "encounter_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_odontograms" ADD CONSTRAINT "encounter_odontograms_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_prescriptions" ADD CONSTRAINT "encounter_prescriptions_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_procedures" ADD CONSTRAINT "encounter_procedures_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_procedures" ADD CONSTRAINT "encounter_procedures_terminology_id_terminology_master_id_fk" FOREIGN KEY ("terminology_id") REFERENCES "public"."terminology_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_referrals" ADD CONSTRAINT "encounter_referrals_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_kasir_id_users_id_fk" FOREIGN KEY ("kasir_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_encounter_reason_id_terminology_master_id_fk" FOREIGN KEY ("encounter_reason_id") REFERENCES "public"."terminology_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontogram_details" ADD CONSTRAINT "odontogram_details_odontogram_id_encounter_odontograms_id_fk" FOREIGN KEY ("odontogram_id") REFERENCES "public"."encounter_odontograms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontogram_details" ADD CONSTRAINT "odontogram_details_icd10_id_terminology_master_id_fk" FOREIGN KEY ("icd10_id") REFERENCES "public"."terminology_master"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontogram_details" ADD CONSTRAINT "odontogram_details_icd9cm_id_terminology_master_id_fk" FOREIGN KEY ("icd9cm_id") REFERENCES "public"."terminology_master"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_allergy" ADD CONSTRAINT "patient_allergy_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_allergy" ADD CONSTRAINT "patient_allergy_substance_id_terminology_master_id_fk" FOREIGN KEY ("substance_id") REFERENCES "public"."terminology_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_disease_history" ADD CONSTRAINT "patient_disease_history_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_disease_history" ADD CONSTRAINT "patient_disease_history_terminology_id_terminology_master_id_fk" FOREIGN KEY ("terminology_id") REFERENCES "public"."terminology_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_medication" ADD CONSTRAINT "patient_medication_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_medication" ADD CONSTRAINT "patient_medication_terminology_id_terminology_master_id_fk" FOREIGN KEY ("terminology_id") REFERENCES "public"."terminology_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_kasir_id_users_id_fk" FOREIGN KEY ("kasir_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_proof_document_id_documents_id_fk" FOREIGN KEY ("proof_document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;