import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
	Plus,
	Trash2,
	FileText,
	Save,
	Clock,
	History,
	FolderSearch,
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

interface Report {
	id: number;
	title: string;
	content: string;
	rawInput: string;
	provider: string;
	model: string;
	role: string;
	createdAt: string;
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

// --- ARCHIVOS PAGE ---
export const Archivos = () => {
	const [sourcesArr, setSourcesArr] = useState<Source[]>([]);
	const [newName, setNewName] = useState("");
	const [newPath, setNewPath] = useState("");
	const [showAdd, setShowAdd] = useState(false);
	const [showBrowser, setShowBrowser] = useState(false);

	const loadSources = useCallback(async () => {
		try {
			const { data } = await axios.get(`${API_BASE}/sources`);
			setSourcesArr(data);
		} catch {
			console.error("Error loading sources");
		}
	}, []);

	useEffect(() => {
		(async () => {
			await loadSources();
		})();
	}, [loadSources]);

	const addSource = async () => {
		if (!newName || !newPath) return alert("Completa todos los campos");
		try {
			await axios.post(`${API_BASE}/sources`, {
				name: newName,
				path: newPath,
			});
			setNewName("");
			setNewPath("");
			setShowAdd(false);
			loadSources();
		} catch {
			alert("Error al añadir fuente");
		}
	};

	const deleteSource = async (id: number) => {
		if (!confirm("¿Eliminar esta fuente?")) return;
		try {
			await axios.delete(`${API_BASE}/sources/${id}`);
			loadSources();
		} catch {
			alert("Error al eliminar fuente");
		}
	};

	const handleFileSelected = (path: string) => {
		setNewPath(path);
		const fileName = path.split(/[\\/]/).pop() || "";
		if (!newName) setNewName(fileName.replace(/\.[^/.]+$/, ""));
		setShowBrowser(false);
	};

	return (
		<>
			<div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
				<div className="glass-card">
					<div className="flex-between mb-2">
						<h3>📁 Fuentes de Datos (Logs / Changelogs)</h3>
						<button onClick={() => setShowAdd(!showAdd)}>
							<Plus size={18} /> {showAdd ? "Cancelar" : "Añadir Fuente"}
						</button>
					</div>

					{showAdd && (
						<div
							className="glass-card mb-2"
							style={{ background: "var(--bg-deep)" }}
						>
							<div className="form-group">
								<label>Nombre del Proyecto/Archivo</label>
								<input
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									placeholder="Ej. CRM Backend"
								/>
							</div>
							<div className="form-group">
								<label>Ruta del Archivo</label>
								<div style={{ display: "flex", gap: "0.5rem" }}>
									<input
										value={newPath}
										onChange={(e) => setNewPath(e.target.value)}
										placeholder="Selecciona un archivo..."
										style={{ flex: 1 }}
									/>
									<button
										className="secondary"
										onClick={() => setShowBrowser(true)}
									>
										<FolderSearch size={18} /> Explorar
									</button>
								</div>
							</div>
							<button onClick={addSource}>
								<Save size={18} /> Guardar Fuente
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
						{sourcesArr.length === 0 ? (
							<div
								className="text-muted"
								style={{ textAlign: "center", padding: "2rem" }}
							>
								No hay fuentes registradas. Añade una para empezar.
							</div>
						) : (
							sourcesArr.map((s) => (
								<div
									key={s.id}
									className="glass-card"
									style={{
										padding: "1rem",
										background: "var(--bg-card)",
									}}
								>
									<div className="flex-between">
										<div>
											<strong>
												<FileText
													size={16}
													style={{
														verticalAlign: "middle",
														marginRight: "0.5rem",
													}}
												/>
												{s.name}
											</strong>
											<div
												className="text-muted"
												style={{
													fontSize: "0.8rem",
													marginTop: "0.2rem",
												}}
											>
												{s.path}
											</div>
										</div>
										<button
											className="secondary"
											onClick={() => deleteSource(s.id)}
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

			{showBrowser && (
				<FileBrowser
					onSelect={handleFileSelected}
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

	const toggleDay = (key: string) => {
		setSelectedDays((prev) =>
			prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key],
		);
	};

	const loadData = useCallback(async () => {
		try {
			const [tRes, sRes, rRes] = await Promise.all([
				axios.get(`${API_BASE}/tasks`),
				axios.get(`${API_BASE}/sources`),
				axios.get(`${API_BASE}/prompts`),
			]);
			setTasks(tRes.data);
			setSourcesArr(sRes.data);
			setRoles(rRes.data.roles || []);
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

		try {
			await axios.post(`${API_BASE}/tasks`, {
				name: taskName,
				cron: cronExpr,
				sourceId: Number(taskSourceId),
				roleId: taskRoleId,
				provider: taskProvider,
				model: taskModel,
				discordWebhookUrl: taskWebhook || null,
				discordMentionId: taskMentionId || null,
				active: true,
			});
			setShowAdd(false);
			setTaskName("");
			loadData();
		} catch {
			alert("Error al guardar tarea");
		}
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
					<button onClick={() => setShowAdd(!showAdd)}>
						<Plus size={18} /> {showAdd ? "Cancelar" : "Nueva Tarea"}
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
								<label>Fuente de Datos</label>
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
							<label>ID de Usuario Discord a Mencionar (Opcional)</label>
							<input
								value={taskMentionId}
								onChange={(e) => setTaskMentionId(e.target.value)}
								placeholder="Ej. 123456789012345678"
							/>
						</div>

						<button onClick={saveTask}>
							<Save size={18} /> Programar Tarea
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
									<button
										className="secondary"
										onClick={() => deleteTask(t.id)}
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
				<label>ID de Usuario Discord a Mencionar (Opcional)</label>
				<input
					value={mentionId}
					onChange={(e) => setMentionId(e.target.value)}
					placeholder="Ej. 123456789012345678 (Click derecho → Copiar ID)"
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

// --- HISTORIAL PAGE ---
export const Historial = () => {
	const [reportsArr, setReportsArr] = useState<Report[]>([]);
	const [expandedId, setExpandedId] = useState<number | null>(null);

	const loadReports = useCallback(async () => {
		try {
			const { data } = await axios.get(`${API_BASE}/reports`);
			setReportsArr(data);
		} catch {
			console.error("Error loading reports");
		}
	}, []);

	useEffect(() => {
		(async () => {
			await loadReports();
		})();
	}, [loadReports]);

	const deleteReport = async (id: number) => {
		if (!confirm("¿Eliminar este informe del historial?")) return;
		try {
			await axios.delete(`${API_BASE}/reports/${id}`);
			loadReports();
		} catch {
			alert("Error al eliminar informe");
		}
	};

	return (
		<div className="glass-card">
			<div className="flex-between mb-2">
				<h3>
					<History
						size={20}
						style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
					/>
					Historial de Informes
				</h3>
				<span className="text-muted" style={{ fontSize: "0.85rem" }}>
					{reportsArr.length} informe(s)
				</span>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
				{reportsArr.length === 0 ? (
					<div
						className="text-muted"
						style={{ textAlign: "center", padding: "3rem" }}
					>
						Aún no has generado informes. Tu historial aparecerá aquí
						automáticamente.
					</div>
				) : (
					reportsArr.map((r) => (
						<div
							key={r.id}
							className="glass-card"
							style={{
								padding: "1.2rem",
								background: "var(--bg-card)",
							}}
						>
							<div className="flex-between">
								<div style={{ flex: 1 }}>
									<strong>{r.title}</strong>
									<div
										className="text-muted"
										style={{
											fontSize: "0.8rem",
											marginTop: "0.2rem",
										}}
									>
										{new Date(r.createdAt).toLocaleString()} · {r.provider}/
										{r.model} · Rol: {r.role}
									</div>
								</div>
								<div className="flex-gap-1">
									<button
										className="secondary"
										onClick={() =>
											setExpandedId(expandedId === r.id ? null : r.id)
										}
									>
										{expandedId === r.id ? (
											<EyeOff size={16} />
										) : (
											<Eye size={16} />
										)}
									</button>
									<button
										className="secondary"
										onClick={() => deleteReport(r.id)}
										style={{ color: "#ff4444" }}
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
							{expandedId === r.id && (
								<div style={{ marginTop: "1rem" }}>
									<div className="grid-cols-2">
										<div>
											<div
												className="text-muted"
												style={{
													fontSize: "0.75rem",
													marginBottom: "0.5rem",
													fontWeight: 600,
												}}
											>
												CHANGELOG (Input)
											</div>
											<pre
												style={{
													background: "var(--bg-deep)",
													padding: "1rem",
													borderRadius: "8px",
													fontSize: "0.8rem",
													maxHeight: "300px",
													overflow: "auto",
													whiteSpace: "pre-wrap",
												}}
											>
												{r.rawInput}
											</pre>
										</div>
										<div>
											<div
												className="text-muted"
												style={{
													fontSize: "0.75rem",
													marginBottom: "0.5rem",
													fontWeight: 600,
												}}
											>
												INFORME GENERADO
											</div>
											<div
												style={{
													background: "var(--bg-deep)",
													padding: "1rem",
													borderRadius: "8px",
													fontSize: "0.85rem",
													maxHeight: "300px",
													overflow: "auto",
													whiteSpace: "pre-wrap",
												}}
											>
												{r.content}
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
};
