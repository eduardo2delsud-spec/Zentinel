import axios from "axios";
import { IAIService, IAIRatingReport } from "./ai.interface.js";

import { SettingsService } from "../settings.service.js";

export class OllamaService implements IAIService {
	async generateReport({
		text,
		model,
		systemPrompt,
	}: IAIRatingReport): Promise<string> {
		const baseUrl =
			(await SettingsService.get("OLLAMA_URL")) ||
			process.env.OLLAMA_URL ||
			"http://localhost:11434";
		try {
			const response = await axios.post(`${baseUrl}/api/generate`, {
				model,
				prompt: text,
				system: systemPrompt,
				stream: false,
			});
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
			return response.data.models.map((m: any) => m.name);
		} catch (error) {
			console.error("Ollama Tags Error:", error);
			return [];
		}
	}
}
