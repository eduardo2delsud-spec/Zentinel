export interface IAIRatingReport {
	text: string;
	model: string;
	systemPrompt: string;
	onProgress?: (message: string) => void;
}

export interface IAIService {
	generateReport(params: IAIRatingReport): Promise<string>;
	getModels(): Promise<string[]>;
}
