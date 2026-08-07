CREATE TABLE "dokter_suster" (
	"dokter_id" uuid NOT NULL,
	"suster_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dokter_suster_dokter_id_suster_id_pk" PRIMARY KEY("dokter_id","suster_id")
);
--> statement-breakpoint
ALTER TABLE "dokter_suster" ADD CONSTRAINT "dokter_suster_dokter_id_users_id_fk" FOREIGN KEY ("dokter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dokter_suster" ADD CONSTRAINT "dokter_suster_suster_id_users_id_fk" FOREIGN KEY ("suster_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;