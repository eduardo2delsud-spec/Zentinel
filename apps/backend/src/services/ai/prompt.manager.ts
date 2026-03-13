import { db } from "../../db/index.js";
import { prompts } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export const DEFAULT_PROMPTS = {
	PRODUCT_OWNER: `Actúa como un Product Owner experto. 
Tu tarea es traducir un log de cambios técnico (changelog crudo) en un reporte amigable para stakeholders y usuarios finales.
- Enfócate en los beneficios de negocio.
- Resalta hitos importantes.
- Menciona bloqueos si los hay, pero con un tono constructivo.
- Usa un lenguaje claro y evita tecnicismos innecesarios.
- Formatea la respuesta con Markdown elegante.`,

	DEVOPS: `Actúa como un Ingeniero Senior de Site Reliability (SRE) / DevOps.
Tu tarea es analizar un changelog crudo y generar un reporte técnico detallado para el equipo de ingeniería.
- Mantén el lenguaje técnico y preciso.
- Menciona ramas, tipos de fix (hotfix, feature, bugfix).
- Resalta cambios en la lógica de base de datos, infraestructura o seguridad.
- Usa un tono profesional y directo.
- Formatea la respuesta con Markdown estructurado.`,
};

export class PromptManager {
	async getPrompt(roleId: string): Promise<string> {
		const result = await db
			.select()
			.from(prompts)
			.where(eq(prompts.id, roleId))
			.limit(1);

		if (result.length > 0) {
			return result[0].content;
		}

		// Fallback to defaults or return error
		return (DEFAULT_PROMPTS as any)[roleId] || "Prompt no encontrado";
	}

	async getAllRoles(): Promise<
		{ id: string; name: string; content: string }[]
	> {
		return await db
			.select({ id: prompts.id, name: prompts.name, content: prompts.content })
			.from(prompts);
	}
}
