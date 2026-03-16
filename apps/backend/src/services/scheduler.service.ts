import cron from "node-cron";
import { db } from "../db/index.js";
import { scheduledTasks, sources } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { AIServiceFactory } from "./ai/ai.factory.js";
import { PromptManager } from "./ai/prompt.manager.js";
import { DiscordWebhookManager } from "./discord/webhook.manager.js";
import fs from "node:fs/promises";

const promptManager = new PromptManager();
const discordManager = new DiscordWebhookManager();

class SchedulerService {
	private jobs: Map<number, cron.ScheduledTask> = new Map();

	async init() {
		console.log("Initializing Scheduler Service...");
		const tasks = await db
			.select()
			.from(scheduledTasks)
			.where(eq(scheduledTasks.active, true));
		for (const task of tasks) {
			this.scheduleTask(task);
		}
	}

	scheduleTask(task: any) {
		if (this.jobs.has(task.id)) {
			this.jobs.get(task.id)?.stop();
		}

		const job = cron.schedule(task.cron, async () => {
			console.log(`Running scheduled task: ${task.name}`);
			try {
				// 1. Get source content
				const source = await db
					.select()
					.from(sources)
					.where(eq(sources.id, task.sourceId))
					.limit(1);
				if (source.length === 0) throw new Error("Source not found");

				const changelogText = await fs.readFile(source[0].path, "utf-8");

				// 2. Generate report
				const service = AIServiceFactory.getService(task.provider);
				const systemPrompt = await promptManager.getPrompt(task.roleId);

				const report = await service.generateReport({
					text: changelogText,
					model: task.model,
					systemPrompt,
				});

				// 3. Send to Discord if configured
				if (task.discordWebhookUrl) {
					await discordManager.sendReport(
						task.discordWebhookUrl,
						report,
						`Automatic Report: ${task.name}`,
						6514417, // Indigo color in decimal
						task.discordMentionId,
					);
				}

				console.log(`Task ${task.name} completed successfully.`);
			} catch (error) {
				console.error(`Error in scheduled task ${task.name}:`, error);
			}
		});

		this.jobs.set(task.id, job);
	}

	stopTask(id: any) {
		const numericId = Number(id);
		this.jobs.get(numericId)?.stop();
		this.jobs.delete(numericId);
	}
}

export const schedulerService = new SchedulerService();
