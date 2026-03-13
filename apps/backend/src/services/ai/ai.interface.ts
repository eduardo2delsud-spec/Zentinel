export interface IAIRatingReport {
	text: string;
	model: string;
	systemPrompt: string;
}

export interface IAIService {
	generateReport(params: IAIRatingReport): Promise<string>;
	getModels(): Promise<string[]>;
}
