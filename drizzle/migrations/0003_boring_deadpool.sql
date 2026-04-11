ALTER TABLE "encounters" DROP CONSTRAINT "encounters_photo_document_id_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "encounters" DROP COLUMN "photo_document_id";