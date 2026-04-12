CREATE TABLE "odontogram_restoration_surfaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restoration_id" uuid NOT NULL,
	"surface_id" uuid NOT NULL,
	CONSTRAINT "uq_restoration_surface" UNIQUE("restoration_id","surface_id")
);
--> statement-breakpoint
CREATE TABLE "odontogram_restorations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tooth_id" uuid NOT NULL,
	"restorasi" text,
	"bahan_restorasi" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "odontogram_restoration_surfaces" ADD CONSTRAINT "odontogram_restoration_surfaces_restoration_id_odontogram_restorations_id_fk" FOREIGN KEY ("restoration_id") REFERENCES "public"."odontogram_restorations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontogram_restoration_surfaces" ADD CONSTRAINT "odontogram_restoration_surfaces_surface_id_odontogram_surfaces_id_fk" FOREIGN KEY ("surface_id") REFERENCES "public"."odontogram_surfaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontogram_restorations" ADD CONSTRAINT "odontogram_restorations_tooth_id_odontogram_teeth_id_fk" FOREIGN KEY ("tooth_id") REFERENCES "public"."odontogram_teeth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odontogram_surfaces" DROP COLUMN "restorasi";--> statement-breakpoint
ALTER TABLE "odontogram_surfaces" DROP COLUMN "bahan_restorasi";