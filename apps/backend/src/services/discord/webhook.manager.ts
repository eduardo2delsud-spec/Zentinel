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
			await axios.post(webhookUrl, {
				content: mentionId ? `<@${mentionId}>` : undefined,
				embeds: [
					{
						title,
						description: content,
						color,
						timestamp: new Date().toISOString(),
					},
				],
			});
		} catch (error) {
			console.error("Discord Webhook Error:", error);
			throw new Error("Failed to send report to Discord");
		}
	}
}
