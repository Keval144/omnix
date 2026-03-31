CREATE TYPE "public"."token_request_type" AS ENUM('CHAT', 'SUMMARY');--> statement-breakpoint
CREATE TABLE "token_usage_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"project_id" uuid NOT NULL,
	"request_type" "token_request_type" NOT NULL,
	"tokens_used" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_project_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"project_id" uuid NOT NULL,
	"total_tokens_used" integer NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_user_project_tokens" UNIQUE("user_id","project_id")
);
--> statement-breakpoint
ALTER TABLE "token_usage_logs" ADD CONSTRAINT "token_usage_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_project_tokens" ADD CONSTRAINT "user_project_tokens_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ix_token_usage_logs_user_id" ON "token_usage_logs" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "ix_token_usage_logs_project_id" ON "token_usage_logs" USING btree ("project_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "ix_token_usage_logs_created_at" ON "token_usage_logs" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "ix_user_project_tokens_user_id" ON "user_project_tokens" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "ix_user_project_tokens_project_id" ON "user_project_tokens" USING btree ("project_id" uuid_ops);