CREATE TABLE "odontogram_diagnoses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tooth_id" uuid NOT NULL,
	"icd10_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_tooth_icd10" UNIQUE("tooth_id","icd10_id")
);
--> statement-breakpoint
CREATE TABLE "odontogram_procedures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tooth_id" uuid NOT NULL,
	"icd9cm_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_tooth_icd9cm" UNIQUE("tooth_id","icd9cm_id")
);
--> statement-breakpoint
CREATE TABLE "odontogram_surfaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tooth_id" uuid NOT NULL,
	"surface" varchar(1) NOT NULL,
	"restorasi" text,
	"bahan_restorasi" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_tooth_surface" UNIQUE("tooth_id","surface")
);
--> statement-breakpoint
ALTER TABLE "odontogram_details" RENAME TO "odontogram_teeth";--> statement-breakpoint
ALTER TABLE "odontogram_teeth" DROP CONSTRAINT "uq_odontogram_tooth_surface";--> statement-breakpoint
ALTER TABLE "odontogram_teeth" DROP CONSTRAINT "odontogram_details_odontogram_id_encounter_odontograms_id_fk";
--> statement-breakpoint
ALTER TABLE "odontogram_teeth" DROP CONSTRAINT "odontogram_details_icd10_id_terminology_master_id_fk";
--> statement-breakpoint
ALTER TABLE "odontogram_teeth" DROP CONSTRAINT "odontogram_details_icd9cm_id_terminology_master_id_fk";
--> statement-breakpoint
ALTER TABLE "odontogram_diagnoses" ADD CONSTRAINT "odontogram_diagnoses_tooth_id_odontogram_teeth_id_fk" FOREIGN KEY ("tooth_id") REFERENCES "public"."odontogram_teeth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontogram_diagnoses" ADD CONSTRAINT "odontogram_diagnoses_icd10_id_terminology_master_id_fk" FOREIGN KEY ("icd10_id") REFERENCES "public"."terminology_master"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontogram_procedures" ADD CONSTRAINT "odontogram_procedures_tooth_id_odontogram_teeth_id_fk" FOREIGN KEY ("tooth_id") REFERENCES "public"."odontogram_teeth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontogram_procedures" ADD CONSTRAINT "odontogram_procedures_icd9cm_id_terminology_master_id_fk" FOREIGN KEY ("icd9cm_id") REFERENCES "public"."terminology_master"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontogram_surfaces" ADD CONSTRAINT "odontogram_surfaces_tooth_id_odontogram_teeth_id_fk" FOREIGN KEY ("tooth_id") REFERENCES "public"."odontogram_teeth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontogram_teeth" ADD CONSTRAINT "odontogram_teeth_odontogram_id_encounter_odontograms_id_fk" FOREIGN KEY ("odontogram_id") REFERENCES "public"."encounter_odontograms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontogram_teeth" DROP COLUMN "surface";--> statement-breakpoint
ALTER TABLE "odontogram_teeth" DROP COLUMN "bahan_restorasi";--> statement-breakpoint
ALTER TABLE "odontogram_teeth" DROP COLUMN "restorasi";--> statement-breakpoint
ALTER TABLE "odontogram_teeth" DROP COLUMN "icd10_id";--> statement-breakpoint
ALTER TABLE "odontogram_teeth" DROP COLUMN "is_primary";--> statement-breakpoint
ALTER TABLE "odontogram_teeth" DROP COLUMN "icd9cm_id";--> statement-breakpoint
ALTER TABLE "odontogram_teeth" ADD CONSTRAINT "uq_odontogram_tooth" UNIQUE("odontogram_id","tooth_number");