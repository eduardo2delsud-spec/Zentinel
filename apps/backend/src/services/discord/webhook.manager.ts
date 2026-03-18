import axios from "axios";

export class DiscordWebhookManager {
	async sendReport(
		webhookUrl: string,
		content: string,
		title: string,
		color: number = 3447003,
		mentionId?: string,
	) {
		try {
			// Using 2000 as per user request to be ultra-safe
			const chunks = this.splitContent(content, 2000);

			for (let i = 0; i < chunks.length; i++) {
				const currentTitle = i === 0 ? title : `${title} (Cont. ${i + 1})`;
				const payload = {
					content:
						i === 0 && mentionId
							? mentionId
									.split(/[\s,]+/)
									.map((id) => `<@${id.trim()}>`)
									.join(" ")
							: undefined,
					embeds: [
						{
							title: currentTitle,
							description: chunks[i],
							color,
							timestamp: new Date().toISOString(),
						},
					],
				};
				await axios.post(webhookUrl, payload);
			}
		} catch (error: any) {
			console.error(
				"Discord Webhook Error:",
				error?.response?.data || error.message,
			);
			throw new Error("Failed to send report to Discord");
		}
	}

	private splitContent(text: string, limit: number): string[] {
		const chunks: string[] = [];
		let current = text;
		while (current.length > limit) {
			let chunk = current.substring(0, limit);
			// Try to split at a newline to avoid breaking words/sentences
			const lastNewline = chunk.lastIndexOf("\n");
			if (lastNewline > limit * 0.5) {
				chunk = current.substring(0, lastNewline);
			}
			chunks.push(chunk.trim());
			current = current.substring(chunk.length).trim();
		}
		if (current) chunks.push(current);
		return chunks;
	}
}
