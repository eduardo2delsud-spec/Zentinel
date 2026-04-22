
export class ReportService {
	static generateManualReport(changelog: string, todayStr: string, template?: string) {
		const lines = changelog.split("\n");
		let currentTitle = "";
		let blockLines: string[] = [];
		const todayBlocks: { title: string; lines: string[] }[] = [];

		for (let i = 0; i < lines.length; i++) {
			const originalLine = lines[i];
			const line = originalLine.trim();

			// Filtramos leyendas y guías de uso
			if (/Maintenance\s*\(Mantenimiento\)/i.test(line) && /infraestructura/i.test(line)) continue;
			if (/^[-*]*\s*\*\*(Added|Changed|Fixed|Removed|Maintenance).*?\*\*: Para/i.test(line)) continue;
			if (line.startsWith("Para mantener el historial ordenado")) continue;
			if (line.startsWith("## Guía de uso")) continue;

			// Filtramos fechas de otros días que sirven de separadores
			if (/^\[\d{4}-\d{2}-\d{2}\]$/.test(line) && !line.includes(todayStr)) continue;

			if (
				line.startsWith("- **") ||

				line.startsWith("- ") ||
				line.startsWith("### ")
			) {
				if (
					currentTitle &&
					(blockLines.some((l) => l.includes(`[${todayStr}]`)) ||
						currentTitle.includes(`[${todayStr}]`))
				) {
					todayBlocks.push({ title: currentTitle, lines: blockLines });
				}
				currentTitle = originalLine.trim();
				blockLines = [];
			} else if (currentTitle && line) {
				blockLines.push(originalLine.trim());
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

		const processSection = (text: string, key: string, value: string) => {
			const trimmed = value.trim();
			if (trimmed && trimmed !== "N/A") {
				return text.replace(new RegExp(`\\{${key}\\}`, "g"), trimmed);
			}

			const lines = text.split("\n");
			const newLines: string[] = [];
			for (let i = 0; i < lines.length; i++) {
				if (lines[i].includes(`{${key}}`)) {
					if (
						newLines.length > 0 &&
						(newLines[newLines.length - 1].trim().startsWith("**") ||
							newLines[newLines.length - 1].trim().startsWith("###"))
					) {
						newLines.pop();
					}
					if (newLines.length > 0 && newLines[newLines.length - 1].trim() === "") {
						newLines.pop();
					}
					continue;
				}
				newLines.push(lines[i]);
			}
			return newLines.join("\n");
		};

		rendered = processSection(rendered, "today", "");
		rendered = processSection(rendered, "blockers", "");
		rendered = processSection(rendered, "doubts", "");


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
