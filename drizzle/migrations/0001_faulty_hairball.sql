ALTER TABLE "auth_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "encounter_diagnoses" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "encounter_procedures" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "auth_tokens" CASCADE;--> statement-breakpoint
DROP TABLE "encounter_diagnoses" CASCADE;--> statement-breakpoint
DROP TABLE "encounter_procedures" CASCADE;--> statement-breakpoint
ALTER TABLE "encounter_prescriptions" ADD COLUMN "terminology_id" uuid;--> statement-breakpoint
ALTER TABLE "encounters" ADD COLUMN "encounter_referral_id" uuid;--> statement-breakpoint
ALTER TABLE "odontogram_details" ADD COLUMN "is_primary" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "encounter_prescriptions" ADD CONSTRAINT "encounter_prescriptions_terminology_id_terminology_master_id_fk" FOREIGN KEY ("terminology_id") REFERENCES "public"."terminology_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_encounter_referral_id_encounter_referrals_id_fk" FOREIGN KEY ("encounter_referral_id") REFERENCES "public"."encounter_referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_prescriptions" DROP COLUMN "kfa_code";--> statement-breakpoint
ALTER TABLE "encounter_prescriptions" DROP COLUMN "product_name";--> statement-breakpoint
ALTER TABLE "encounters" DROP COLUMN "referral_from_doctor_code";--> statement-breakpoint
ALTER TABLE "encounters" DROP COLUMN "referral_note";--> statement-breakpoint
ALTER TABLE "encounters" DROP COLUMN "referral_source";--> statement-breakpoint
ALTER TABLE "encounters" DROP COLUMN "tekanan_darah";--> statement-breakpoint
ALTER TABLE "patient_medication" DROP COLUMN "kfa_code";--> statement-breakpoint
ALTER TABLE "patient_medication" DROP COLUMN "product_name";--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "communication_language";--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "doctor_code";