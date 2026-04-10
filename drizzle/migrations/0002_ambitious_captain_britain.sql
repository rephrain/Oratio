ALTER TABLE "encounter_prescriptions" ADD COLUMN "dosage" text;--> statement-breakpoint
ALTER TABLE "encounters" ADD COLUMN "photo_document_id" uuid;--> statement-breakpoint
ALTER TABLE "encounters" ADD COLUMN "soap_document_id" uuid;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_photo_document_id_documents_id_fk" FOREIGN KEY ("photo_document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_soap_document_id_documents_id_fk" FOREIGN KEY ("soap_document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_profile_document_id_documents_id_fk" FOREIGN KEY ("profile_document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;