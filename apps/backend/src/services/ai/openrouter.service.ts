import axios from "axios";
import { SettingsService } from "../settings.service.js";
import type { IAIRatingReport, IAIService } from "./ai.interface.js";

export class OpenRouterService implements IAIService {
	private baseUrl = "https://openrouter.ai/api/v1";

	async generateReport({
		text,
		model,
		systemPrompt,
	}: IAIRatingReport): Promise<string> {
		const apiKey =
			(await SettingsService.get("OPENROUTER_API_KEY")) ||
			process.env.OPENROUTER_API_KEY;
		try {
			const response = await axios.post(
				`${this.baseUrl}/chat/completions`,
				{
					model: model || "google/gemini-2.0-flash-001",
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: text },
					],
				},
				{
					headers: {
						Authorization: `Bearer ${apiKey}`,
						"HTTP-Referer": "https://zentinel.app", // Optional for OpenRouter
						"X-Title": "Zentinel",
					},
				},
			);
			return response.data.choices[0].message.content;
		} catch (error) {
			console.error("OpenRouter Error:", error);
			throw new Error("Failed to generate report with OpenRouter");
		}
	}

	async getModels(): Promise<string[]> {
		// OpenRouter has thousands of models, usually we fetch a subset or defined by user.
		// For now returning some defaults.
		return [
			"google/gemini-2.0-flash-001",
			"openai/gpt-4o-mini",
			"anthropic/claude-3-haiku",
		];
	}
}
