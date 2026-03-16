import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
	Plus,
	Trash2,
	FolderSearch,
	FileText,
	Save,
	Clock,
	Eye,
	EyeOff,
	MessageSquare,
} from "lucide-react";
import FileBrowser from "../components/FileBrowser";

const API_BASE = "http://localhost:3001/api";

interface Source {
	id: number;
	name: string;
	path: string;
}

interface Project {
	id: number;
	name: string;
	rootPath: string;
	changelogSourceId: number;
}

interface Role {
	id: string;
	name: string;
}

interface Task {
	id: number;
	name: string;
	cron: string;
	sourceId: number;
	roleId: string;
	provider: string;
	model: string;
	discordWebhookUrl?: string;
	discordMentionId?: string;
	active: boolean;
}


// --- Helpers ---
const DAYS = [
	{ key: "1", label: "L" },
	{ key: "2", label: "M" },
	{ key: "3", label: "X" },
	{ key: "4", label: "J" },
	{ key: "5", label: "V" },
	{ key: "6", label: "S" },
	{ key: "0", label: "D" },
];

const DAY_NAMES: Record<string, string> = {
	"0": "Dom",
	"1": "Lun",
	"2": "Mar",
	"3": "Mié",
	"4": "Jue",
	"5": "Vie",
	"6": "Sáb",
};

function cronToHuman(cron: string): string {
	const parts = cron.split(" ");
	if (parts.length < 5) return cron;
	const min = parts[0].padStart(2, "0");
	const hour = parts[1].padStart(2, "0");
	const daysPart = parts[4];

	let daysStr = "";
	if (daysPart === "*") {
		daysStr = "Todos los días";
	} else {
		const dayNums = daysPart.split(",");
		daysStr = dayNums.map((d) => DAY_NAMES[d] || d).join(", ");
	}
	return `${daysStr} a las ${hour}:${min}`;
}

// --- PROYECTO PAGE ---
export const Proyecto = () => {
	const [projectsArr, setProjectsArr] = useState<Project[]>([]);
	const [newName, setNewName] = useState("");
	const [newRootPath, setNewRootPath] = useState("");
	const [newChangelogPath, setNewChangelogPath] = useState("");
	const [showAdd, setShowAdd] = useState(false);
	const [showBrowser, setShowBrowser] = useState(false);
	const [browserTarget, setBrowserTarget] = useState<"root" | "changelog">("root");
	const [editingProjectId, setEditingProjectId] = useState<number | null>(null);

	const loadProjects = useCallback(async () => {
		try {
			const { data } = await axios.get(`${API_BASE}/projects`);
			setProjectsArr(data);
		} catch {
			console.error("Error loading projects");
		}
	}, []);

	useEffect(() => {
		(async () => {
			await loadProjects();
		})();
	}, [loadProjects]);

	const addProject = async () => {
		if (!newName || !newRootPath || !newChangelogPath)
			return alert("Completa todos los campos (Changelog es obligatorio)");
		try {
			if (editingProjectId) {
				await axios.put(`${API_BASE}/projects/${editingProjectId}`, {
					name: newName,
					rootPath: newRootPath,
					changelogPath: newChangelogPath,
				});
			} else {
				await axios.post(`${API_BASE}/projects`, {
					name: newName,
					rootPath: newRootPath,
					changelogPath: newChangelogPath,
				});
			}
			setNewName("");
			setNewRootPath("");
			setNewChangelogPath("");
			setShowAdd(false);
			setEditingProjectId(null);
			loadProjects();
		} catch {
			alert("Error al procesar el proyecto");
		}
	};

	const startEditProject = (p: Project) => {
		setEditingProjectId(p.id);
		setNewName(p.name);
		setNewRootPath(p.rootPath);
		// Note: we'd need to fetch the changelog path separately or include it in the project object.
		// For now, let's assume we fetch it or it's provided. 
		// Actually, p.changelogSourceId is available. Let's fetch the path.
		fetchSourcePath(p.changelogSourceId);
		setShowAdd(true);
	};

	const fetchSourcePath = async (sourceId: number) => {
		try {
			const { data } = await axios.get(`${API_BASE}/sources`);
			const source = data.find((s: any) => s.id === sourceId);
			if (source) setNewChangelogPath(source.path);
		} catch {
			console.error("Error fetching source path");
		}
	};

	const deleteProject = async (id: number) => {
		if (!confirm("¿Eliminar este proyecto y su índice RAG?")) return;
		try {
			await axios.delete(`${API_BASE}/projects/${id}`);
			loadProjects();
		} catch {
			alert("Error al eliminar proyecto");
		}
	};

	const handlePathSelected = (path: string) => {
		if (browserTarget === "root") {
			setNewRootPath(path);
			const folderName = path.split(/[\\/]/).pop() || "";
			if (!newName) setNewName(folderName);
		} else {
			setNewChangelogPath(path);
		}
		setShowBrowser(false);
	};

	const openBrowser = (target: "root" | "changelog") => {
		setBrowserTarget(target);
		setShowBrowser(true);
	};

	return (
		<>
			<div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
				<div className="glass-card">
					<div className="flex-between mb-2">
						<h3>📂 Gestión de Proyectos (RAG + Contexto)</h3>
						<button onClick={() => {
							setShowAdd(!showAdd);
							if (showAdd) {
								setEditingProjectId(null);
								setNewName("");
								setNewRootPath("");
								setNewChangelogPath("");
							}
						}}>
							{showAdd ? "Cancelar" : <><Plus size={18} /> Nuevo Proyecto</>}
						</button>
					</div>

					{showAdd && (
						<div
							className="glass-card mb-2"
							style={{ background: "var(--bg-deep)" }}
						>
							<div className="form-group">
								<label htmlFor="proj-name">Nombre del Proyecto</label>
								<input
									id="proj-name"
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									placeholder="Ej. Mi Super App"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="proj-root">Carpeta Raíz del Proyecto (para RAG)</label>
								<div style={{ display: "flex", gap: "0.5rem" }}>
									<input
										id="proj-root"
										value={newRootPath}
										onChange={(e) => setNewRootPath(e.target.value)}
										placeholder="Selecciona la carpeta principal..."
										style={{ flex: 1 }}
									/>
									<button
										type="button"
										className="secondary"
										onClick={() => openBrowser("root")}
									>
										<FolderSearch size={18} /> Carpeta
									</button>
								</div>
							</div>

							<div className="form-group">
								<label htmlFor="proj-changelog">Archivo Changelog / Log (Obligatorio)</label>
								<div style={{ display: "flex", gap: "0.5rem" }}>
									<input
										id="proj-changelog"
										value={newChangelogPath}
										onChange={(e) => setNewChangelogPath(e.target.value)}
										placeholder="Selecciona el archivo de actividades..."
										style={{ flex: 1 }}
									/>
									<button
										type="button"
										className="secondary"
										onClick={() => openBrowser("changelog")}
									>
										<FileText size={18} /> Archivo
									</button>
								</div>
							</div>

							<button onClick={addProject}>
								<Save size={18} /> {editingProjectId ? "Actualizar Proyecto" : "Crear Proyecto y Procesar RAG"}
							</button>
						</div>
					)}

					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "1rem",
						}}
					>
						{projectsArr.length === 0 ? (
							<div
								className="text-muted"
								style={{ textAlign: "center", padding: "2rem" }}
							>
								No hay proyectos registrados. Crea uno para habilitar el RAG.
							</div>
						) : (
							projectsArr.map((p) => (
								<div
									key={p.id}
									className="glass-card"
									style={{
										padding: "1rem",
										background: "var(--bg-card)",
									}}
								>
									<div className="flex-between">
										<div>
											<strong>
												<Plus
													size={16}
													style={{
														verticalAlign: "middle",
														marginRight: "0.5rem",
													}}
												/>
												{p.name}
											</strong>
											<div
												className="text-muted"
												style={{
													fontSize: "0.8rem",
													marginTop: "0.2rem",
												}}
											>
												📍 {p.rootPath}
											</div>
											<div
												className="text-muted"
												style={{
													fontSize: "0.75rem",
													marginTop: "0.1rem",
													color: "var(--accent-primary)",
												}}
											>
												📝 ID Changelog: {p.changelogSourceId}
											</div>
										</div>
										<div className="flex-gap-1">
											<button
												className="secondary"
												onClick={() => startEditProject(p)}
												style={{ color: "var(--accent-primary)" }}
											>
												Editar
											</button>
											<button
												className="secondary"
												onClick={() => deleteProject(p.id)}
												style={{ color: "#ff4444" }}
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>

			{showBrowser && (
				<FileBrowser
					onSelect={handlePathSelected}
					onClose={() => setShowBrowser(false)}
				/>
			)}
		</>
	);
};

// --- TAREAS PAGE ---
export const Tareas = () => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [sourcesArr, setSourcesArr] = useState<Source[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [showAdd, setShowAdd] = useState(false);

	const [taskName, setTaskName] = useState("");
	const [selectedDays, setSelectedDays] = useState<string[]>([
		"1",
		"2",
		"3",
		"4",
		"5",
	]);
	const [taskHour, setTaskHour] = useState("09");
	const [taskMinute, setTaskMinute] = useState("00");
	const [taskSourceId, setTaskSourceId] = useState("");
	const [taskRoleId, setTaskRoleId] = useState("PRODUCT_OWNER");
	const [taskProvider, setTaskProvider] = useState("ollama");
	const [taskModel, setTaskModel] = useState("");
	const [taskWebhook, setTaskWebhook] = useState("");
	const [taskMentionId, setTaskMentionId] = useState("");
	const [taskProjectId, setTaskProjectId] = useState<string>("");
	const [projectsArr, setProjectsArr] = useState<Project[]>([]);
	const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

	const toggleDay = (key: string) => {
		setSelectedDays((prev) =>
			prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key],
		);
	};

	const loadData = useCallback(async () => {
		try {
			const [tRes, sRes, rRes, pRes] = await Promise.all([
				axios.get(`${API_BASE}/tasks`),
				axios.get(`${API_BASE}/sources`),
				axios.get(`${API_BASE}/prompts`),
				axios.get(`${API_BASE}/projects`),
			]);
			setTasks(tRes.data);
			setSourcesArr(sRes.data);
			setRoles(rRes.data.roles || []);
			setProjectsArr(pRes.data);
			if (sRes.data.length > 0 && !taskSourceId)
				setTaskSourceId(sRes.data[0].id.toString());
		} catch {
			console.error("Error loading tasks data");
		}
	}, [taskSourceId]);

	useEffect(() => {
		(async () => {
			await loadData();
		})();
	}, [loadData]);

	const saveTask = async () => {
		if (!taskName || !taskSourceId) return alert("Completa los campos básicos");
		const cronDays =
			selectedDays.length === 7 ? "*" : selectedDays.sort().join(",");
		const cronExpr = `${taskMinute} ${taskHour} * * ${cronDays}`;

		const payload = {
			name: taskName,
			cron: cronExpr,
			sourceId: Number(taskSourceId),
			roleId: taskRoleId,
			provider: taskProvider,
			model: taskModel,
			discordWebhookUrl: taskWebhook || null,
			discordMentionId: taskMentionId || null,
			projectId: taskProjectId ? Number(taskProjectId) : null,
			active: true,
		};

		try {
			if (editingTaskId) {
				await axios.put(`${API_BASE}/tasks/${editingTaskId}`, payload);
			} else {
				await axios.post(`${API_BASE}/tasks`, payload);
			}
			setShowAdd(false);
			setEditingTaskId(null);
			resetTaskForm();
			loadData();
		} catch {
			alert("Error al guardar tarea");
		}
	};

	const resetTaskForm = () => {
		setTaskName("");
		setTaskWebhook("");
		setTaskMentionId("");
		setTaskProjectId("");
		setEditingTaskId(null);
	};

	const startEditTask = (t: any) => {
		setEditingTaskId(t.id);
		setTaskName(t.name);
		const cronParts = t.cron.split(" ");
		setTaskMinute(cronParts[0]);
		setTaskHour(cronParts[1]);
		const days = cronParts[4] === "*" ? "0,1,2,3,4,5,6" : cronParts[4];
		setSelectedDays(days.split(","));
		setTaskSourceId(t.sourceId.toString());
		setTaskRoleId(t.roleId);
		setTaskProvider(t.provider);
		setTaskModel(t.model);
		setTaskWebhook(t.discordWebhookUrl || "");
		setTaskMentionId(t.discordMentionId || "");
		setTaskProjectId(t.projectId?.toString() || "");
		setShowAdd(true);
	};

	const deleteTask = async (id: number) => {
		if (!confirm("¿Eliminar esta tarea?")) return;
		try {
			await axios.delete(`${API_BASE}/tasks/${id}`);
			loadData();
		} catch {
			alert("Error al eliminar tarea");
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
			<div className="glass-card">
				<div className="flex-between mb-2">
					<h3>⏰ Tareas Programadas</h3>
					<button onClick={() => {
						setShowAdd(!showAdd);
						if (showAdd) resetTaskForm();
					}}>
						{showAdd ? "Cancelar" : <><Plus size={18} /> Nueva Tarea</>}
					</button>
				</div>

				{showAdd && (
					<div
						className="glass-card mb-2"
						style={{ background: "var(--bg-deep)" }}
					>
						<div className="form-group">
							<label>Nombre de la Tarea</label>
							<input
								value={taskName}
								onChange={(e) => setTaskName(e.target.value)}
								placeholder="Ej. Reporte Diario Mañana"
							/>
						</div>

						<div className="form-group">
							<label>Días de Ejecución</label>
							<div style={{ display: "flex", gap: "0.5rem" }}>
								{DAYS.map((d) => (
									<span
										key={d.key}
										className={`day-chip ${selectedDays.includes(d.key) ? "active" : ""}`}
										onClick={() => toggleDay(d.key)}
									>
										{d.label}
									</span>
								))}
							</div>
						</div>

						<div className="grid-cols-2">
							<div className="form-group">
								<label>Hora</label>
								<div style={{ display: "flex", gap: "0.5rem" }}>
									<select
										value={taskHour}
										onChange={(e) => setTaskHour(e.target.value)}
									>
										{Array.from({ length: 24 }, (_, i) => (
											<option key={i} value={String(i).padStart(2, "0")}>
												{String(i).padStart(2, "0")}
											</option>
										))}
									</select>
									<span
										style={{
											alignSelf: "center",
											color: "var(--text-muted)",
										}}
									>
										:
									</span>
									<select
										value={taskMinute}
										onChange={(e) => setTaskMinute(e.target.value)}
									>
										{["00", "15", "30", "45"].map((m) => (
											<option key={m} value={m}>
												{m}
											</option>
										))}
									</select>
								</div>
							</div>
							<div className="form-group">
								<label>Fuente de Datos (Log Diario)</label>
								<select
									value={taskSourceId}
									onChange={(e) => setTaskSourceId(e.target.value)}
								>
									{sourcesArr.map((s) => (
										<option key={s.id} value={s.id}>
											{s.name}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="form-group">
							<label>Proyecto Vinculado (Opcional para RAG)</label>
							<select
								value={taskProjectId}
								onChange={(e) => setTaskProjectId(e.target.value)}
							>
								<option value="">-- Sin Proyecto --</option>
								{projectsArr.map((p) => (
									<option key={p.id} value={p.id}>
										📂 {p.name}
									</option>
								))}
							</select>
						</div>

						<div className="grid-cols-2">
							<div className="form-group">
								<label>Rol de IA</label>
								<select
									value={taskRoleId}
									onChange={(e) => setTaskRoleId(e.target.value)}
								>
									{roles.map((r) => (
										<option key={r.id} value={r.id}>
											{r.name}
										</option>
									))}
								</select>
							</div>
							<div className="form-group">
								<label>Proveedor</label>
								<select
									value={taskProvider}
									onChange={(e) => setTaskProvider(e.target.value)}
								>
									<option value="ollama">Ollama</option>
									<option value="openrouter">OpenRouter</option>
								</select>
							</div>
						</div>

						<div className="form-group">
							<label>Modelo (nombre del modelo a usar)</label>
							<input
								value={taskModel}
								onChange={(e) => setTaskModel(e.target.value)}
								placeholder="Ej. llama3, gpt-4o-mini, etc."
							/>
						</div>

						<div className="form-group">
							<label>
								<MessageSquare
									size={14}
									style={{ verticalAlign: "middle", marginRight: "0.3rem" }}
								/>
								Discord Webhook URL (Opcional)
							</label>
							<input
								value={taskWebhook}
								onChange={(e) => setTaskWebhook(e.target.value)}
								placeholder="https://discord.com/api/webhooks/..."
							/>
						</div>

						<div className="form-group">
							<label>Menciones Discord (IDs separados por coma/espacio)</label>
							<input
								value={taskMentionId}
								onChange={(e) => setTaskMentionId(e.target.value)}
								placeholder="Ej. 12345678, 87654321"
							/>
						</div>

						<button onClick={saveTask}>
							<Save size={18} /> {editingTaskId ? "Actualizar Tarea" : "Programar Tarea"}
						</button>
					</div>
				)}

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "1rem",
					}}
				>
					{tasks.length === 0 ? (
						<div
							className="text-muted"
							style={{ textAlign: "center", padding: "2rem" }}
						>
							No hay tareas programadas.
						</div>
					) : (
						tasks.map((t) => (
							<div
								key={t.id}
								className="glass-card"
								style={{
									padding: "1.2rem",
									background: "var(--bg-card)",
								}}
							>
								<div className="flex-between">
									<div>
										<strong style={{ fontSize: "1rem" }}>{t.name}</strong>
										<div
											className="text-muted"
											style={{
												fontSize: "0.85rem",
												marginTop: "0.3rem",
												display: "flex",
												gap: "0.8rem",
												alignItems: "center",
											}}
										>
											<span>
												<Clock size={13} style={{ verticalAlign: "middle" }} />{" "}
												{cronToHuman(t.cron)}
											</span>
											<span>IA: {t.provider}</span>
											<span>Rol: {t.roleId}</span>
										</div>
										{t.discordWebhookUrl && (
											<div
												className="text-muted"
												style={{
													fontSize: "0.8rem",
													marginTop: "0.2rem",
												}}
											>
												<MessageSquare
													size={12}
													style={{ verticalAlign: "middle" }}
												/>{" "}
												Discord configurado
												{t.discordMentionId &&
													` · Mención: ${t.discordMentionId}`}
											</div>
										)}
									</div>
									<div className="flex-gap-1">
										<button
											className="secondary"
											onClick={() => startEditTask(t)}
											style={{ color: "var(--accent-primary)" }}
										>
											Editar
										</button>
										<button
											className="secondary"
											onClick={() => deleteTask(t.id)}
											style={{ color: "#ff4444" }}
										>
											<Trash2 size={16} />
										</button>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

// --- DISCORD PAGE ---
export const DiscordSettings = () => {
	const [webhookUrl, setWebhookUrl] = useState("");
	const [mentionId, setMentionId] = useState("");
	const [showUrl, setShowUrl] = useState(false);
	const [saved, setSaved] = useState(false);

	const saveDiscordSettings = async () => {
		try {
			await axios.post(`${API_BASE}/settings`, {
				settings: {
					discord_webhook_url: webhookUrl,
					discord_mention_id: mentionId,
				},
			});
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} catch {
			alert("Error al guardar configuración de Discord");
		}
	};

	const loadDiscordSettings = useCallback(async () => {
		try {
			const { data } = await axios.get(`${API_BASE}/settings`);
			if (data.discord_webhook_url) setWebhookUrl(data.discord_webhook_url);
			if (data.discord_mention_id) setMentionId(data.discord_mention_id);
		} catch {
			console.error("Error loading discord settings");
		}
	}, []);

	useEffect(() => {
		(async () => {
			await loadDiscordSettings();
		})();
	}, [loadDiscordSettings]);

	return (
		<div className="glass-card">
			<h3>💬 Configuración de Discord</h3>
			<div className="form-group">
				<label>Webhook URL</label>
				<div style={{ display: "flex", gap: "0.5rem" }}>
					<input
						type={showUrl ? "text" : "password"}
						value={webhookUrl}
						onChange={(e) => setWebhookUrl(e.target.value)}
						placeholder="https://discord.com/api/webhooks/..."
						style={{ flex: 1 }}
					/>
					<button className="secondary" onClick={() => setShowUrl(!showUrl)}>
						{showUrl ? <EyeOff size={16} /> : <Eye size={16} />}
					</button>
				</div>
			</div>
			<div className="form-group">
				<label>Menciones Discord (IDs separados por coma/espacio)</label>
				<input
					value={mentionId}
					onChange={(e) => setMentionId(e.target.value)}
					placeholder="Ej. 12345678, 87654321"
				/>
				<div
					className="text-muted"
					style={{ fontSize: "0.75rem", marginTop: "0.3rem" }}
				>
					Activa "Modo Desarrollador" en Discord → Click derecho en un usuario →
					"Copiar ID de usuario"
				</div>
			</div>
			<button onClick={saveDiscordSettings}>
				<Save size={18} /> {saved ? "✓ Guardado" : "Guardar Configuración"}
			</button>
		</div>
	);
};
