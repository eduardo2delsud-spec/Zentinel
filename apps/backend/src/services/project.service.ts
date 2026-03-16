import fs from "node:fs/promises";
import path from "node:path";
import { db } from "../db/index.js";
import { projects, projectFiles, sources } from "../db/schema.js";
import { eq } from "drizzle-orm";

const ALLOWED_EXTENSIONS = [
	".ts",
	".tsx",
	".js",
	".jsx",
	".md",
	".json",
	".css",
	".html",
	".py",
	".go",
	".rs",
	".c",
	".cpp",
	".h",
];
const EXCLUDED_DIRS = [
	"node_modules",
	".git",
	"dist",
	"build",
	".next",
	"target",
	"out",
];
const MAX_FILE_SIZE = 500 * 1024; // 500KB

export class ProjectService {
	static async getAllProjects() {
		return await db.select().from(projects);
	}

	static async getProject(id: number) {
		const res = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
		return res[0];
	}

	static async createProject(
		name: string,
		rootPath: string,
		changelogPath: string,
	) {
		// 1. Crear la fuente para el changelog (obligatorio)
		const [source] = await db
			.insert(sources)
			.values({
				name: `${name} (Changelog)`,
				path: changelogPath,
			})
			.returning();

		// 2. Crear el proyecto
		const [project] = await db
			.insert(projects)
			.values({
				name,
				rootPath,
				changelogSourceId: source.id,
			})
			.returning();

		// 3. Vincular la fuente al proyecto
		await db
			.update(sources)
			.set({ projectId: project.id })
			.where(eq(sources.id, source.id));

		// 4. Indexar archivos en segundo plano (simulado RAG simple)
		// No esperamos a que termine para responder al cliente
		this.indexProjectFiles(project.id, rootPath).catch((err) =>
			console.error("Error indexing project files:", err),
		);

		return project;
	}

	static async indexProjectFiles(projectId: number, rootPath: string) {
		// Limpiar archivos anteriores si existen (re-indexación)
		await db.delete(projectFiles).where(eq(projectFiles.projectId, projectId));

		const filesToIndex: { name: string; path: string }[] = [];

		async function scanDir(dir: string) {
			const entries = await fs.readdir(dir, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = path.join(dir, entry.name);

				if (entry.isDirectory()) {
					if (!EXCLUDED_DIRS.includes(entry.name)) {
						await scanDir(fullPath);
					}
				} else if (entry.isFile()) {
					const ext = path.extname(entry.name).toLowerCase();
					if (ALLOWED_EXTENSIONS.includes(ext)) {
						const stats = await fs.stat(fullPath);
						if (stats.size <= MAX_FILE_SIZE) {
							filesToIndex.push({ name: entry.name, path: fullPath });
						}
					}
				}
			}
		}

		try {
			await scanDir(rootPath);

			for (const fileItem of filesToIndex) {
				const content = await fs.readFile(fileItem.path, "utf-8");
				await db.insert(projectFiles).values({
					projectId,
					fileName: fileItem.name,
					filePath: fileItem.path,
					content,
				});
			}
			console.log(`Project ${projectId} indexed: ${filesToIndex.length} files.`);
		} catch (error) {
			console.error(`Failed to index project ${projectId}:`, error);
		}
	}

	static async getProjectContext(projectId: number) {
		const files = await db
			.select()
			.from(projectFiles)
			.where(eq(projectFiles.projectId, projectId));

		// Construimos un contexto compacto para la IA
		// En un RAG real, buscaríamos por relevancia. Aquí enviamos un resumen de los archivos clave.
		// Solo enviamos los primeros 10 archivos para no saturar el contexto si es muy grande.
		return files
			.slice(0, 15)
			.map(
				(f) =>
					`--- FILE: ${f.fileName} ---\n${f.content.substring(0, 2000)}${f.content.length > 2000 ? "\n[...]" : ""}`,
			)
			.join("\n\n");
	}

	static async deleteProject(id: number) {
		// 1. Eliminar archivos indexados
		await db.delete(projectFiles).where(eq(projectFiles.projectId, id));
		// 2. Desvincular fuentes
		await db.update(sources).set({ projectId: null }).where(eq(sources.projectId, id));
		// 3. Eliminar proyecto
		await db.delete(projects).where(eq(projects.id, id));
	}
}
