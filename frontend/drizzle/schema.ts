import { pgTable, index, text, timestamp, unique, boolean, foreignKey, varchar, uuid, jsonb, bigint, integer, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const chatRole = pgEnum("chat_role", ['user', 'assistant'])


export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	role: text(),
	banned: boolean().default(false),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires", { mode: 'string' }),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
	impersonatedBy: text("impersonated_by"),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const alembicVersion = pgTable("alembic_version", {
	versionNum: varchar("version_num", { length: 32 }).primaryKey().notNull(),
});

export const projects = pgTable("projects", {
	projectId: uuid("project_id").primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	projectSlug: varchar("project_slug", { length: 255 }).notNull(),
	datasetPath: text("dataset_path"),
	notebookPath: text("notebook_path"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_projects_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("ix_projects_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "projects_user_id_fkey"
		}).onDelete("cascade"),
	unique("projects_project_slug_key").on(table.projectSlug),
]);

export const datasets = pgTable("datasets", {
	datasetId: uuid("dataset_id").primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	filePath: text("file_path").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fileSize: bigint("file_size", { mode: "number" }).notNull(),
	fileType: varchar("file_type", { length: 50 }).notNull(),
	summary: jsonb(),
	uploadedAt: timestamp("uploaded_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_datasets_project_id").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	index("ix_datasets_uploaded_at").using("btree", table.uploadedAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.projectId],
			name: "datasets_project_id_fkey"
		}).onDelete("cascade"),
]);

export const notebooks = pgTable("notebooks", {
	notebookId: uuid("notebook_id").primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	notebookPath: text("notebook_path").notNull(),
	version: integer().notNull(),
	notebookMetadata: jsonb("notebook_metadata"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_notebooks_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("ix_notebooks_project_id").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.projectId],
			name: "notebooks_project_id_fkey"
		}).onDelete("cascade"),
]);

export const chatSessions = pgTable("chat_sessions", {
	sessionId: uuid("session_id").primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_chat_sessions_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("ix_chat_sessions_project_id").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.projectId],
			name: "chat_sessions_project_id_fkey"
		}).onDelete("cascade"),
]);

export const chatMessages = pgTable("chat_messages", {
	messageId: uuid("message_id").primaryKey().notNull(),
	sessionId: uuid("session_id").notNull(),
	role: chatRole().notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_chat_messages_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("ix_chat_messages_session_id").using("btree", table.sessionId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [chatSessions.sessionId],
			name: "chat_messages_session_id_fkey"
		}).onDelete("cascade"),
]);

export const jwks = pgTable("jwks", {
	id: text().primaryKey().notNull(),
	publicKey: text("public_key").notNull(),
	privateKey: text("private_key").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
});
