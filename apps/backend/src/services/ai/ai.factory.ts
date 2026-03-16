import type { IAIService } from "./ai.interface.js";
import { OllamaService } from "./ollama.service.js";
import { OpenRouterService } from "./openrouter.service.js";

export class AIServiceFactory {
	static getService(provider: string): IAIService {
		switch (provider.toLowerCase()) {
			case "ollama":
				return new OllamaService();
			case "openrouter":
				return new OpenRouterService();
			default:
				throw new Error(`Unsupported AI provider: ${provider}`);
		}
	}
}
