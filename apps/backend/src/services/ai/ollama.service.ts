import axios from "axios";
import type { IAIService, IAIRatingReport } from "./ai.interface.js";

import { SettingsService } from "../settings.service.js";

export class OllamaService implements IAIService {
	async generateReport({
		text,
		model,
		systemPrompt,
		onProgress,
	}: IAIRatingReport): Promise<string> {
		const baseUrl =
			(await SettingsService.get("OLLAMA_URL")) ||
			process.env.OLLAMA_URL ||
			"http://localhost:11434";
		try {
			onProgress?.("Conectando con Ollama...");
			const response = await axios.post(`${baseUrl}/api/generate`, {
				model,
				prompt: text,
				system: systemPrompt,
				stream: false,
			});
			onProgress?.("Generación completada.");
			return response.data.response;
		} catch (error) {
			console.error("Ollama Error:", error);
			throw new Error("Failed to generate report with Ollama");
		}
	}

	async getModels(): Promise<string[]> {
		const baseUrl =
			(await SettingsService.get("OLLAMA_URL")) ||
			process.env.OLLAMA_URL ||
			"http://localhost:11434";
		try {
			const response = await axios.get(`${baseUrl}/api/tags`);
			return response.data.models.map((m: { name: string }) => m.name);
		} catch (error) {
			console.error("Ollama Tags Error:", error);
			return [];
		}
	}
}
