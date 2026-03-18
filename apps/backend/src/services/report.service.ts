
export class ReportService {
	static generateManualReport(changelog: string, todayStr: string, template?: string) {
		const lines = changelog.split("\n");
		let currentTitle = "";
		let blockLines: string[] = [];
		const todayBlocks: { title: string; lines: string[] }[] = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (
				line.trim().startsWith("- **") ||
				line.trim().startsWith("- ") ||
				line.trim().startsWith("### ")
			) {
				if (
					currentTitle &&
					(blockLines.some((l) => l.includes(`[${todayStr}]`)) ||
						currentTitle.includes(`[${todayStr}]`))
				) {
					todayBlocks.push({ title: currentTitle, lines: blockLines });
				}
				currentTitle = line.trim();
				blockLines = [];
			} else if (currentTitle && line.trim()) {
				blockLines.push(line.trim());
			}
		}
		if (
			currentTitle &&
			(blockLines.some((l) => l.includes(`[${todayStr}]`)) ||
				currentTitle.includes(`[${todayStr}]`))
		) {
			todayBlocks.push({ title: currentTitle, lines: blockLines });
		}

		// Use exactly the same parsing logic for dates as Informes.tsx
		// This logic expects changelog blocks for a specific date
		// But wait, the original logic in Informes.tsx was more complex: 
		// it finds the date [YYYY-MM-DD] and then takes lines until the next date.

		return this.renderTemplate(todayBlocks, todayStr, template);
	}

	private static renderTemplate(todayBlocks: any[], date: string, template?: string) {
		const defaultTemplate = `## 📝 Reporte Diario ({date})\n\n### Títulos de Hoy\n{titles}\n\n### Detalle de actividades:\n{details}`;
		let rendered = template || defaultTemplate;
		
		rendered = rendered.replace(/\{date\}/g, date);
		// Note: today, blockers, doubts are N/A for scheduled tasks unless we add them
		rendered = rendered.replace(/\{today\}/g, "N/A");
		rendered = rendered.replace(/\{blockers\}/g, "N/A");
		rendered = rendered.replace(/\{doubts\}/g, "N/A");

		let titlesStr = '';
		for (const block of todayBlocks) {
			const match = block.title.match(/-\s*\*\*(.*?)\*\*/);
			const titleText = match ? match[1] : block.title.replace(/^- /, "");
			titlesStr += `- ${titleText}\n`;
		}
		rendered = rendered.replace(/\{titles\}/g, titlesStr.trim() || 'Sin actividades para esta fecha.');

		let detailsStr = '';
		for (const block of todayBlocks) {
			detailsStr += `${block.title}\n`;
			for (const l of block.lines) {
				detailsStr += `${l}\n`;
			}
		}
		rendered = rendered.replace(/\{details\}/g, detailsStr.trim() || 'Sin detalles.');

		return rendered;
	}
}
