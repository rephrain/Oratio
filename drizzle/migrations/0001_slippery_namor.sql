ALTER TABLE "encounters" RENAME COLUMN "keluhan_utama_id" TO "encounter_reason_id";--> statement-breakpoint
-- ALTER TABLE "patient_allergy" RENAME COLUMN "substance_code" TO "substance_id";--> statement-breakpoint
-- ALTER TABLE "patient_allergy" RENAME COLUMN "substance_display" TO "reaction";--> statement-breakpoint
ALTER TABLE "encounters" DROP CONSTRAINT "encounters_keluhan_utama_id_terminology_master_id_fk";
--> statement-breakpoint
ALTER TABLE "patient_allergy" ALTER COLUMN "patient_id" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_encounter_reason_id_terminology_master_id_fk" FOREIGN KEY ("encounter_reason_id") REFERENCES "public"."terminology_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_allergy" ADD CONSTRAINT "patient_allergy_substance_id_terminology_master_id_fk" FOREIGN KEY ("substance_id") REFERENCES "public"."terminology_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_allergy" DROP COLUMN "reaction_code";