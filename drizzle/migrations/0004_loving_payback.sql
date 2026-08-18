ALTER TABLE "dokter_suster" RENAME TO "doctor_suster";--> statement-breakpoint
ALTER TABLE "doctor_suster" RENAME COLUMN "dokter_id" TO "doctor_id";--> statement-breakpoint
ALTER TABLE "doctor_suster" DROP CONSTRAINT "dokter_suster_dokter_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_suster" DROP CONSTRAINT "dokter_suster_suster_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_suster" DROP CONSTRAINT "dokter_suster_dokter_id_suster_id_pk";--> statement-breakpoint
ALTER TABLE "doctor_suster" ADD CONSTRAINT "doctor_suster_doctor_id_suster_id_pk" PRIMARY KEY("doctor_id","suster_id");--> statement-breakpoint
ALTER TABLE "doctor_suster" ADD CONSTRAINT "doctor_suster_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_suster" ADD CONSTRAINT "doctor_suster_suster_id_users_id_fk" FOREIGN KEY ("suster_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;