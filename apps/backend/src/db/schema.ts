import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const reports = sqliteTable("reports", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	title: text("title").notNull(),
	content: text("content").notNull(),
	rawInput: text("raw_input").notNull(),
	provider: text("provider").notNull(),
	model: text("model").notNull(),
	role: text("role").notNull(),
	tokensUsed: integer("tokens_used").default(0),
	sentimentScore: integer("sentiment_score").default(0), // 0-100 (humor/salud)
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

export const settings = sqliteTable("settings", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

export const prompts = sqliteTable("prompts", {
	id: text("id").primaryKey(), // e.g., 'PRODUCT_OWNER'
	name: text("name").notNull(), // e.g., 'Product Owner'
	content: text("content").notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

export const sources = sqliteTable("sources", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	path: text("path").notNull(),
	projectId: integer("project_id"),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

export const projects = sqliteTable("projects", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	description: text("description"),
	rootPath: text("root_path"), // Ruta de la carpeta del proyecto
	changelogSourceId: integer("changelog_source_id").references(() => sources.id),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

export const projectFiles = sqliteTable("project_files", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	projectId: integer("project_id").references(() => projects.id),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	content: text("content").notNull(), // Contenido para el RAG
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

export const aiModels = sqliteTable("ai_models", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	provider: text("provider").notNull(), // 'ollama', 'openrouter', 'anthropic'
	modelId: text("model_id").notNull(), // e.g. 'llama3', 'gpt-4o-mini'
	displayName: text("display_name").notNull(), // e.g. 'Llama 3 (Local)'
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

export const scheduledTasks = sqliteTable("scheduled_tasks", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	cron: text("cron").notNull(), // e.g., '0 9 * * 1-5'
	sourceId: integer("source_id").references(() => sources.id),
	roleId: text("role_id").references(() => prompts.id),
	provider: text("provider").notNull(),
	model: text("model").notNull(),
	discordWebhookUrl: text("discord_webhook_url"),
	discordMentionId: text("discord_mention_id"),
	projectId: integer("project_id").references(() => projects.id),
	active: integer("active", { mode: "boolean" }).notNull().default(true),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});
