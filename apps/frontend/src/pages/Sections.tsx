import axios from "axios";
import {
	Clock,
	Edit,
	FileText,
	FolderSearch,
	MessageSquare,
	Plus,
	Save,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import FileBrowser from "../components/FileBrowser";
import { API_BASE } from "../config";

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
	projectId?: number;
	active: boolean;
}

interface SavedModel {
	id: number;
	provider: string;
	modelId: string;
	displayName: string;
}

interface DiscordWebhook {
	id: number;
	name: string;
	url: string;
}

interface DiscordMention {
	id: number;
	name: string;
	discordId: string;
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
	const [browserTarget, setBrowserTarget] = useState<"root" | "changelog">(
		"root",
	);
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
		if (!newName || !newChangelogPath)
			return alert("Completa el nombre y el archivo Changelog (obligatorios)");
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
			const source = data.find((s: Source) => s.id === sourceId);
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
						<button
							onClick={() => {
								setShowAdd(!showAdd);
								if (showAdd) {
									setEditingProjectId(null);
									setNewName("");
									setNewRootPath("");
									setNewChangelogPath("");
								}
							}}
						>
							{showAdd ? (
								<>
									<X size={18} /> Cancelar
								</>
							) : (
								<>
									<Plus size={18} /> Nuevo Proyecto
								</>
							)}
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
								<label htmlFor="proj-root">
									Carpeta Raíz del Proyecto (para RAG)
								</label>
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
								<label htmlFor="proj-changelog">
									Archivo Changelog / Log (Obligatorio)
								</label>
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
								<Save size={18} />{" "}
								{editingProjectId
									? "Actualizar Proyecto"
									: "Crear Proyecto y Procesar RAG"}
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
												<Edit size={16} /> Editar
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

	const [taskModels, setTaskModels] = useState<string[]>([]);
	const [taskSavedModels, setTaskSavedModels] = useState<SavedModel[]>([]);
	const [globalWebhooks, setGlobalWebhooks] = useState<DiscordWebhook[]>([]);
	const [globalMentions, setGlobalMentions] = useState<DiscordMention[]>([]);

	const toggleDay = (key: string) => {
		setSelectedDays((prev) =>
			prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key],
		);
	};

	const loadData = useCallback(async () => {
		try {
			const [tRes, sRes, rRes, pRes, mRes, wRes, mentRes] = await Promise.all([
				axios.get(`${API_BASE}/tasks`),
				axios.get(`${API_BASE}/sources`),
				axios.get(`${API_BASE}/prompts`),
				axios.get(`${API_BASE}/projects`),
				axios.get(`${API_BASE}/ai-models`),
				axios.get(`${API_BASE}/discord-webhooks`),
				axios.get(`${API_BASE}/discord-mentions`),
			]);
			setTasks(tRes.data);
			setSourcesArr(sRes.data);
			setRoles(rRes.data.roles || []);
			setProjectsArr(pRes.data);
			setTaskSavedModels(mRes.data);
			setGlobalWebhooks(wRes.data);
			setGlobalMentions(mentRes.data);
			if (sRes.data.length > 0 && !taskSourceId)
				setTaskSourceId(sRes.data[0].id.toString());
		} catch {
			console.error("Error loading tasks data");
		}
	}, [taskSourceId]);

	useEffect(() => {
		let isMounted = true;
		if (showAdd) {
			(async () => {
				const { data } = await axios.get(
					`${API_BASE}/models?provider=${taskProvider}`,
				);
				if (isMounted) {
					setTaskModels(data.models);
					if (data.models.length > 0 && !taskModel) {
						setTaskModel(data.models[0]);
					}
				}
			})();
		}
		return () => {
			isMounted = false;
		};
	}, [taskProvider, showAdd, taskModel]);

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
		setTaskProvider("ollama");
		setTaskModel("");
		setEditingTaskId(null);
	};

	const startEditTask = (t: Task) => {
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
					<button
						onClick={() => {
							setShowAdd(!showAdd);
							if (showAdd) resetTaskForm();
						}}
					>
						{showAdd ? (
							<>
								<X size={18} /> Cancelar
							</>
						) : (
							<>
								<Plus size={18} /> Nueva Tarea
							</>
						)}
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

						<div className="form-group">
							<label>Proveedor</label>
							<select
								value={taskProvider}
								onChange={(e) => setTaskProvider(e.target.value)}
							>
								<option value="ollama">Ollama</option>
								<option value="openrouter">OpenRouter</option>
								<option value="manual">Manual (Changelog)</option>
							</select>
						</div>

						<div className="grid-cols-2">
							<div className="form-group">
								<label>Rol de IA</label>
								<select
									value={taskRoleId}
									onChange={(e) => setTaskRoleId(e.target.value)}
									disabled={taskProvider === "manual"}
								>
									{roles.map((r) => (
										<option key={r.id} value={r.id}>
											{r.name}
										</option>
									))}
								</select>
							</div>
							<div className="form-group">
								<label>Modelo</label>
								<select
									value={taskModel}
									onChange={(e) => setTaskModel(e.target.value)}
									disabled={taskProvider === "manual"}
								>
									<optgroup label="Modelos Guardados">
										{taskSavedModels
											.filter((m) => m.provider === taskProvider)
											.map((m) => (
												<option key={m.id} value={m.modelId}>
													⭐ {m.displayName} ({m.modelId})
												</option>
											))}
									</optgroup>
									<optgroup label="Modelos Disponibles">
										{taskModels.map((m) => (
											<option key={m} value={m}>
												{m}
											</option>
										))}
									</optgroup>
								</select>
							</div>
						</div>

						<div className="form-group">
							<label>Webhook de Discord</label>
							<select
								value={taskWebhook}
								onChange={(e) => setTaskWebhook(e.target.value)}
							>
								<option value="">-- Sin Notificación --</option>
								{globalWebhooks.map((w) => (
									<option key={w.id} value={w.url}>
										🔗 {w.name}
									</option>
								))}
								<option value="MANUAL">-- Ingresar Manualmente --</option>
							</select>
						</div>

						{taskWebhook === "MANUAL" && (
							<div className="form-group">
								<label>URL del Webhook (Manual)</label>
								<input
									value={taskWebhook === "MANUAL" ? "" : taskWebhook}
									onChange={(e) => setTaskWebhook(e.target.value)}
									placeholder="https://discord.com/api/webhooks/..."
								/>
							</div>
						)}

						<div className="form-group">
							<label>Mencionar a:</label>
							<select
								value={taskMentionId}
								onChange={(e) => setTaskMentionId(e.target.value)}
							>
								<option value="">-- Nadie / Todos (Default) --</option>
								{globalMentions.map((m) => (
									<option key={m.id} value={m.discordId}>
										👤 {m.name} ({m.discordId})
									</option>
								))}
								<option value="MANUAL">-- ID Manual --</option>
							</select>
						</div>

						{taskMentionId === "MANUAL" && (
							<div className="form-group">
								<label>Discord ID (Manual)</label>
								<input
									value={taskMentionId === "MANUAL" ? "" : taskMentionId}
									onChange={(e) => setTaskMentionId(e.target.value)}
									placeholder="Ej. 1322244099570405436"
								/>
							</div>
						)}

						<button onClick={saveTask}>
							<Save size={18} />{" "}
							{editingTaskId ? "Actualizar Tarea" : "Programar Tarea"}
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
											<Edit size={16} /> Editar
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
	const [webhooks, setWebhooks] = useState<DiscordWebhook[]>([]);
	const [mentions, setMentions] = useState<DiscordMention[]>([]);

	const [showAddWebhook, setShowAddWebhook] = useState(false);
	const [showAddMention, setShowAddMention] = useState(false);

	const [newWName, setNewWName] = useState("");
	const [newWUrl, setNewWUrl] = useState("");

	const [newMName, setNewMName] = useState("");
	const [newMId, setNewMId] = useState("");

	const loadData = useCallback(async () => {
		try {
			const [wRes, mRes] = await Promise.all([
				axios.get(`${API_BASE}/discord-webhooks`),
				axios.get(`${API_BASE}/discord-mentions`),
			]);
			setWebhooks(wRes.data);
			setMentions(mRes.data);
		} catch {
			console.error("Error loading discord settings");
		}
	}, []);

	useEffect(() => {
		(async () => {
			await loadData();
		})();
	}, [loadData]);

	const addWebhook = async () => {
		if (!newWName || !newWUrl) return alert("Completa los campos");
		try {
			await axios.post(`${API_BASE}/discord-webhooks`, {
				name: newWName,
				url: newWUrl,
			});
			setNewWName("");
			setNewWUrl("");
			setShowAddWebhook(false);
			loadData();
		} catch {
			alert("Error al añadir webhook");
		}
	};

	const deleteWebhook = async (id: number) => {
		if (!confirm("¿Eliminar este webhook?")) return;
		try {
			await axios.delete(`${API_BASE}/discord-webhooks/${id}`);
			loadData();
		} catch {
			alert("Error al eliminar webhook");
		}
	};

	const addMention = async () => {
		if (!newMName || !newMId) return alert("Completa los campos");
		try {
			await axios.post(`${API_BASE}/discord-mentions`, {
				name: newMName,
				discordId: newMId,
			});
			setNewMName("");
			setNewMId("");
			setShowAddMention(false);
			loadData();
		} catch {
			alert("Error al añadir mención");
		}
	};

	const deleteMention = async (id: number) => {
		if (!confirm("¿Eliminar esta mención?")) return;
		try {
			await axios.delete(`${API_BASE}/discord-mentions/${id}`);
			loadData();
		} catch {
			alert("Error al eliminar mención");
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
			<div className="glass-card">
				<div className="flex-between mb-2">
					<h3>🔗 Webhooks de Discord</h3>
					<button onClick={() => setShowAddWebhook(!showAddWebhook)}>
						{showAddWebhook ? (
							"Cancelar"
						) : (
							<>
								<Plus size={18} /> Añadir Webhook
							</>
						)}
					</button>
				</div>

				{showAddWebhook && (
					<div
						className="glass-card mb-2"
						style={{ background: "var(--bg-deep)" }}
					>
						<div className="form-group">
							<label>Nombre del Webhook (ej. Canal General)</label>
							<input
								value={newWName}
								onChange={(e) => setNewWName(e.target.value)}
								placeholder="General"
							/>
						</div>
						<div className="form-group">
							<label>URL del Webhook</label>
							<input
								value={newWUrl}
								onChange={(e) => setNewWUrl(e.target.value)}
								placeholder="https://discord.com/api/webhooks/..."
							/>
						</div>
						<button onClick={addWebhook}>
							<Save size={18} /> Guardar Webhook
						</button>
					</div>
				)}

				<div className="grid-cols-2">
					{webhooks.length === 0 ? (
						<div className="text-muted p-1">No hay webhooks configurados.</div>
					) : (
						webhooks.map((w) => (
							<div
								key={w.id}
								className="glass-card p-1"
								style={{ background: "var(--bg-card)" }}
							>
								<div className="flex-between">
									<div>
										<strong>{w.name}</strong>
										<div
											className="text-muted"
											style={{
												fontSize: "0.7rem",
												overflow: "hidden",
												textOverflow: "ellipsis",
												maxWidth: "200px",
											}}
										>
											{w.url.substring(0, 30)}...
										</div>
									</div>
									<button
										className="secondary"
										onClick={() => deleteWebhook(w.id)}
										style={{ color: "#ff4444" }}
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			<div className="glass-card">
				<div className="flex-between mb-2">
					<h3>👤 Menciones de Usuarios</h3>
					<button onClick={() => setShowAddMention(!showAddMention)}>
						{showAddMention ? (
							"Cancelar"
						) : (
							<>
								<Plus size={18} /> Añadir Usuario
							</>
						)}
					</button>
				</div>

				{showAddMention && (
					<div
						className="glass-card mb-2"
						style={{ background: "var(--bg-deep)" }}
					>
						<div className="form-group">
							<label>Nombre del Usuario</label>
							<input
								value={newMName}
								onChange={(e) => setNewMName(e.target.value)}
								placeholder="Eduardo"
							/>
						</div>
						<div className="form-group">
							<label>Discord ID</label>
							<input
								value={newMId}
								onChange={(e) => setNewMId(e.target.value)}
								placeholder="1322244099570405436"
							/>
						</div>
						<button onClick={addMention}>
							<Save size={18} /> Guardar Usuario
						</button>
					</div>
				)}

				<div
					className="grid-cols-2"
					style={{
						gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
					}}
				>
					{mentions.length === 0 ? (
						<div className="text-muted p-1">No hay menciones configuradas.</div>
					) : (
						mentions.map((m) => (
							<div
								key={m.id}
								className="glass-card p-1"
								style={{ background: "var(--bg-card)" }}
							>
								<div className="flex-between">
									<div>
										<strong>{m.name}</strong>
										<div className="text-muted" style={{ fontSize: "0.75rem" }}>
											ID: {m.discordId}
										</div>
									</div>
									<button
										className="secondary"
										onClick={() => deleteMention(m.id)}
										style={{ color: "#ff4444" }}
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};
