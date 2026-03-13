import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { AIServiceFactory } from "./services/ai/ai.factory.js";
import { PromptManager } from "./services/ai/prompt.manager.js";
import { DiscordWebhookManager } from "./services/discord/webhook.manager.js";
import { schedulerService } from "./services/scheduler.service.js";
import fs from "fs/promises";
import path from "path";
import os from "os";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const promptManager = new PromptManager();
const discordManager = new DiscordWebhookManager();

schedulerService.init();

app.get("/health", (req, res) => {
	res.json({ status: "ok" });
});

app.get("/api/prompts", async (req, res) => {
	const roles = await promptManager.getAllRoles();
	res.json({ roles });
});

app.get("/api/prompts/:id", async (req, res) => {
	const { id } = req.params;
	const prompt = await db
		.select()
		.from(prompts)
		.where(eq(prompts.id, id))
		.limit(1);
	res.json(prompt[0] || { error: "Prompt not found" });
});

app.post("/api/prompts", async (req, res) => {
	const { id, name, content } = req.body;
	try {
		await db
			.insert(prompts)
			.values({ id, name, content })
			.onConflictDoUpdate({
				target: prompts.id,
				set: { name, content, updatedAt: new Date() },
			});
		res.json({ success: true });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

app.delete("/api/prompts/:id", async (req, res) => {
	const { id } = req.params;
	try {
		await db.delete(prompts).where(eq(prompts.id, id));
		res.json({ success: true });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

app.get("/api/models", async (req, res) => {
	const { provider } = req.query;
	try {
		const service = AIServiceFactory.getService(provider as string);
		const models = await service.getModels();
		res.json({ models });
	} catch (error: any) {
		res.status(400).json({ error: error.message });
	}
});

import { db } from "./db/index.js";
import {
	reports,
	prompts,
	sources,
	scheduledTasks,
	aiModels,
} from "./db/schema.js";
import { eq, desc } from "drizzle-orm";

// AI Models (Saved) Endpoints
app.get("/api/ai-models", async (req, res) => {
	const all = await db.select().from(aiModels);
	res.json(all);
});

app.post("/api/ai-models", async (req, res) => {
	const { provider, modelId, displayName } = req.body;
	try {
		await db.insert(aiModels).values({ provider, modelId, displayName });
		res.json({ success: true });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

app.delete("/api/ai-models/:id", async (req, res) => {
	const { id } = req.params;
	try {
		await db.delete(aiModels).where(eq(aiModels.id, Number(id)));
		res.json({ success: true });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Sources Endpoints
app.get("/api/sources", async (req, res) => {
	const allSources = await db.select().from(sources);
	res.json(allSources);
});

app.post("/api/sources", async (req, res) => {
	const { name, path } = req.body;
	try {
		await db.insert(sources).values({ name, path });
		res.json({ success: true });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

app.delete("/api/sources/:id", async (req, res) => {
	const { id } = req.params;
	try {
		await db.delete(sources).where(eq(sources.id, Number(id)));
		res.json({ success: true });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

app.get("/api/sources/:id/content", async (req, res) => {
	const { id } = req.params;
	try {
		const source = await db
			.select()
			.from(sources)
			.where(eq(sources.id, Number(id)))
			.limit(1);
		if (source.length === 0)
			return res.status(404).json({ error: "Source not found" });
		const content = await fs.readFile(source[0].path, "utf-8");
		res.json({ content });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// File System Endpoints
app.get("/api/fs/root", (req, res) => {
	res.json({ root: os.homedir() });
});

app.get("/api/fs/ls", async (req, res) => {
	const { dir } = req.query;
	const targetDir = (dir as string) || os.homedir();

	try {
		const files = await fs.readdir(targetDir, { withFileTypes: true });
		const result = files
			.filter((f) => !f.name.startsWith("."))
			.map((f) => ({
				name: f.name,
				path: path.join(targetDir, f.name),
				isDirectory: f.isDirectory(),
			}))
			.sort((a, b) => {
				if (a.isDirectory === b.isDirectory)
					return a.name.localeCompare(b.name);
				return a.isDirectory ? -1 : 1;
			});
		res.json(result);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// History (Reports) Endpoints
app.get("/api/reports", async (req, res) => {
	const allReports = await db
		.select()
		.from(reports)
		.orderBy(desc(reports.createdAt));
	res.json(allReports);
});

app.delete("/api/reports/:id", async (req, res) => {
	const { id } = req.params;
	try {
		await db.delete(reports).where(eq(reports.id, Number(id)));
		res.json({ success: true });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Tasks Endpoints
app.get("/api/tasks", async (req, res) => {
	const allTasks = await db.select().from(scheduledTasks);
	res.json(allTasks);
});

app.post("/api/tasks", async (req, res) => {
	const taskData = req.body;
	try {
		const [inserted] = await db
			.insert(scheduledTasks)
			.values(taskData)
			.returning();
		schedulerService.scheduleTask(inserted);
		res.json({ success: true });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

app.delete("/api/tasks/:id", async (req, res) => {
	const { id } = req.params;
	try {
		schedulerService.stopTask(Number(id));
		await db.delete(scheduledTasks).where(eq(scheduledTasks.id, Number(id)));
		res.json({ success: true });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

app.post("/api/generate", async (req, res) => {
	const { provider, text, model, role } = req.body;
	try {
		const service = AIServiceFactory.getService(provider);
		const systemPrompt = await promptManager.getPrompt(role);
		const reportContent = await service.generateReport({
			text,
			model,
			systemPrompt,
		});

		// Persist to DB
		await db.insert(reports).values({
			title: `Changelog - ${new Date().toLocaleDateString()}`,
			content: reportContent,
			rawInput: text,
			provider,
			model,
			role,
		});

		res.json({ report: reportContent });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

app.post("/api/discord", async (req, res) => {
	const { webhookUrl, content, title, color, mentionId } = req.body;
	try {
		await discordManager.sendReport(
			webhookUrl,
			content,
			title,
			color,
			mentionId,
		);
		res.json({ success: true });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

import { SettingsService } from "./services/settings.service.js";

app.get("/api/settings", async (req, res) => {
	const allSettings = await SettingsService.getAll();
	const settingsMap = allSettings.reduce((acc: any, curr) => {
		acc[curr.key] = curr.value;
		return acc;
	}, {});
	res.json(settingsMap);
});

app.post("/api/settings", async (req, res) => {
	const { settings } = req.body;
	try {
		for (const [key, value] of Object.entries(settings)) {
			await SettingsService.set(key, value as string);
		}
		res.json({ success: true });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

app.listen(port, () => {
	console.log(`Zentinel Backend running on port ${port}`);
});
