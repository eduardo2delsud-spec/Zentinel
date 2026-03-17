import fs from "node:fs/promises";
import { eq } from "drizzle-orm";
import cron from "node-cron";
import { db } from "../db/index.js";
import { scheduledTasks, sources } from "../db/schema.js";
import { AIServiceFactory } from "./ai/ai.factory.js";
import { PromptManager } from "./ai/prompt.manager.js";
import { DiscordWebhookManager } from "./discord/webhook.manager.js";

const promptManager = new PromptManager();
const discordManager = new DiscordWebhookManager();

interface Task {
	id: number;
	name: string;
	cron: string;
	sourceId: number | null;
	roleId: string | null;
	provider: string;
	model: string;
	discordWebhookUrl?: string | null;
	discordMentionId?: string | null;
	projectId?: number | null;
	active: boolean;
}

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

	scheduleTask(task: Task) {
		if (this.jobs.has(task.id)) {
			this.jobs.get(task.id)?.stop();
		}

		const job = cron.schedule(task.cron, async () => {
			console.log(`Running scheduled task: ${task.name}`);
			try {
				// 1. Get source content
				if (!task.sourceId) throw new Error("Source is required");
				const source = await db
					.select()
					.from(sources)
					.where(eq(sources.id, task.sourceId))
					.limit(1);
				if (source.length === 0) throw new Error("Source not found");

				const changelogText = await fs.readFile(source[0].path, "utf-8");

				// 2. Get RAG context if projectId is set
				let projectContext = "";
				if (task.projectId) {
					const { ProjectService } = await import("./project.service.js");
					projectContext = await ProjectService.getProjectContext(
						Number(task.projectId),
					);
				}

				// 3. Generate report
				const service = AIServiceFactory.getService(task.provider);
				if (!task.roleId) throw new Error("Role is required");
				const systemPrompt = await promptManager.getPrompt(task.roleId);

				const report = await service.generateReport({
					text: changelogText,
					model: task.model,
					systemPrompt: `${systemPrompt}\n\nCONTEXTO DEL PROYECTO (RAG):\n${projectContext}\n\nIMPORTANTE: Genera un reporte profesional técnico basado en el contexto de ayer. Mejora la redacción, usa emojis y estructura el contenido de forma clara.`,
				});

				// 4. Send to Discord if configured
				if (task.discordWebhookUrl) {
					await discordManager.sendReport(
						task.discordWebhookUrl,
						report,
						`📅 Reporte Automático: ${task.name}`,
						6514417, // Indigo color in decimal
						task.discordMentionId ?? undefined,
					);
				}

				console.log(`Task ${task.name} completed successfully.`);
			} catch (error) {
				console.error(`Error in scheduled task ${task.name}:`, error);
			}
		});

		this.jobs.set(task.id, job);
	}

	stopTask(id: number | string) {
		const numericId = Number(id);
		this.jobs.get(numericId)?.stop();
		this.jobs.delete(numericId);
	}
}

export const schedulerService = new SchedulerService();
