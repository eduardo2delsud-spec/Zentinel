import axios from "axios";
import {
	Download,
	Edit,
	Eye,
	EyeOff,
	FileText,
	History,
	Loader2,
	Save,
	Send,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { RichMarkdownRenderer } from "../components/RichMarkdownRenderer";

const API_BASE = "http://localhost:3001/api";

interface Source {
	id: number;
	name: string;
	path: string;
}

interface Project {
	id: number;
	name: string;
	changelogSourceId: number;
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

const Informes = () => {
	const [changelog, setChangelog] = useState("");
	const [report, setReport] = useState("");
	const [role, setRole] = useState("PRODUCT_OWNER");
	const [provider, setProvider] = useState("ollama");
	const [model, setModel] = useState("");
	const [models, setModels] = useState<string[]>([]);
	const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
	const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
	const [loading, setLoading] = useState(false);

	const [sourcesArr, setSourcesArr] = useState<Source[]>([]);
	const [projectsArr, setProjectsArr] = useState<Project[]>([]);
	const [selectedSourceId, setSelectedSourceId] = useState("");
	const [selectedProjectId, setSelectedProjectId] = useState("");
	const [progress, setProgress] = useState("");
	const [socketId, setSocketId] = useState("");
	const [sendingDiscord, setSendingDiscord] = useState(false);

	const [today, setToday] = useState("");
	const [blockers, setBlockers] = useState("");
	const [doubts, setDoubts] = useState("");

	const [activeTab, setActiveTab] = useState<"generar" | "lista">("generar");
	const [reportsArr, setReportsArr] = useState<Report[]>([]);
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [editingReportId, setEditingReportId] = useState<number | null>(null);
	const [editingContent, setEditingContent] = useState("");

	const [globalWebhooks, setGlobalWebhooks] = useState<DiscordWebhook[]>([]);
	const [globalMentions, setGlobalMentions] = useState<DiscordMention[]>([]);
	const [selectedWebhook, setSelectedWebhook] = useState("");
	const [selectedMention, setSelectedMention] = useState("");

	useEffect(() => {
		const newSocket = io("http://localhost:3001");

		newSocket.on("connect", () => {
			console.log("Connected to WebSocket:", newSocket.id);
			setSocketId(newSocket.id || "");
		});

		newSocket.on("generation_progress", (data: { message: string }) => {
			setProgress(data.message);
		});

		return () => {
			newSocket.disconnect();
		};
	}, []);

	const fetchModels = useCallback(async () => {
		try {
			const { data } = await axios.get(
				`${API_BASE}/models?provider=${provider}`,
			);
			setModels(data.models);
			if (data.models.length > 0) setModel(data.models[0]);
		} catch {
			console.error("Error fetching models");
		}
	}, [provider]);

	const fetchData = useCallback(async () => {
		try {
			const [pRes, sRes, mRes, projectsRes, wRes, mentRes] = await Promise.all([
				axios.get(`${API_BASE}/prompts`),
				axios.get(`${API_BASE}/sources`),
				axios.get(`${API_BASE}/ai-models`),
				axios.get(`${API_BASE}/projects`),
				axios.get(`${API_BASE}/discord-webhooks`),
				axios.get(`${API_BASE}/discord-mentions`),
			]);
			if (pRes.data.roles) {
				setRoles(pRes.data.roles);
				if (pRes.data.roles.length > 0) setRole(pRes.data.roles[0].id);
			}
			setSourcesArr(sRes.data);
			setSavedModels(mRes.data);
			setProjectsArr(projectsRes.data);
			setGlobalWebhooks(wRes.data);
			setGlobalMentions(mentRes.data);

			if (wRes.data.length > 0) setSelectedWebhook(wRes.data[0].url);
		} catch {
			console.error("Error fetching initial data");
		}
	}, []);

	useEffect(() => {
		(async () => {
			await fetchModels();
		})();
	}, [fetchModels]);

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
			await fetchData();
			await loadReports();
		})();
	}, [fetchData, loadReports]);

	// Auto-load project's changelog when selected
	useEffect(() => {
		if (selectedProjectId) {
			const project = projectsArr.find(
				(p) => p.id === Number(selectedProjectId),
			);
			if (project?.changelogSourceId) {
				loadSourceContent(project.changelogSourceId.toString());
			}
		}
	}, [selectedProjectId, projectsArr]);

	const loadSourceContent = async (id: string) => {
		if (!id) return;
		try {
			const { data } = await axios.get(`${API_BASE}/sources/${id}/content`);
			setChangelog(data.content);
			setSelectedSourceId(id);
		} catch {
			alert("Error al leer el archivo de la fuente");
		}
	};

	const generateReport = async () => {
		if (!changelog.trim())
			return alert("Por favor, ingresa el changelog técnico.");
		setLoading(true);
		setProgress("Iniciando generación...");
		setReport("");
		try {
			const { data } = await axios.post(`${API_BASE}/generate`, {
				provider,
				text: changelog,
				model,
				role,
				socketId,
				today,
				blockers,
				doubts,
				projectId: selectedProjectId,
			});
			setReport(data.report);
			setProgress("");
		} catch {
			alert("Error generando el informe");
			setProgress("");
		}
		setLoading(false);
	};

	const downloadReport = () => {
		if (!report) return;
		const element = document.createElement("a");
		const file = new Blob([report], { type: "text/markdown" });
		element.href = URL.createObjectURL(file);
		element.download = `zentinel-report-${new Date().toISOString().split("T")[0]}.md`;
		document.body.appendChild(element);
		element.click();
	};

	const deleteReport = async (id: number) => {
		if (!confirm("¿Eliminar este informe del historial?")) return;
		try {
			await axios.delete(`${API_BASE}/reports/${id}`);
			loadReports();
		} catch {
			alert("Error al eliminar informe");
		}
	};

	const downloadReportFile = (content: string, title: string) => {
		const element = document.createElement("a");
		const file = new Blob([content], { type: "text/markdown" });
		element.href = URL.createObjectURL(file);
		element.download = `${title.toLowerCase().replace(/\s+/g, "-")}.md`;
		document.body.appendChild(element);
		element.click();
	};

	const sendExistingToDiscord = async (reportContent: string) => {
		if (!reportContent) return alert("No hay reporte para enviar");

		let webhookToUse = selectedWebhook;
		if (webhookToUse === "MANUAL") {
			const manual = prompt("Ingresa la URL del Webhook:");
			if (!manual) return;
			webhookToUse = manual;
		}

		if (!webhookToUse) {
			return alert("Selecciona un webhook de destino.");
		}

		setSendingDiscord(true);
		try {
			await axios.post(`${API_BASE}/discord`, {
				webhookUrl: webhookToUse,
				content: reportContent,
				title: "Actualización de Estado - Zentinel",
				color: "#6366f1",
				mentionId:
					selectedMention === "MANUAL"
						? prompt("ID de Discord:")
						: selectedMention,
			});
			alert("Enviado a Discord con éxito");
		} catch (err: any) {
			alert("Error al enviar a Discord: " + err.message);
		} finally {
			setSendingDiscord(false);
		}
	};

	const saveEditedReport = async () => {
		if (!editingReportId) return;
		try {
			await axios.put(`${API_BASE}/reports/${editingReportId}`, {
				content: editingContent,
			});
			setEditingReportId(null);
			loadReports();
			alert("Informe actualizado correctamente");
		} catch {
			alert("Error al actualizar el informe");
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
			<div
				style={{
					display: "flex",
					gap: "0.5rem",
					borderBottom: "1px solid var(--border-luxe)",
					paddingBottom: "0.5rem",
				}}
			>
				<button
					className={activeTab === "generar" ? "" : "secondary"}
					onClick={() => setActiveTab("generar")}
					style={{
						borderRadius: "12px 12px 0 0",
						...(activeTab === "generar"
							? {}
							: { background: "transparent", border: "none" }),
					}}
				>
					<Sparkles size={18} /> Generar Informe
				</button>
				<button
					className={activeTab === "lista" ? "" : "secondary"}
					onClick={() => setActiveTab("lista")}
					style={{
						borderRadius: "12px 12px 0 0",
						...(activeTab === "lista"
							? {}
							: { background: "transparent", border: "none" }),
					}}
				>
					<FileText size={18} /> Historial de Informes
				</button>
			</div>

			{activeTab === "generar" ? (
				<div className="grid-cols-2">
					<section className="glass-card">
						<div className="flex-between mb-1" style={{ gap: "0.5rem" }}>
							<h3>🚀 Nuevo Informe</h3>
							<div
								style={{
									display: "flex",
									gap: "0.5rem",
									flex: 1,
									justifyContent: "flex-end",
								}}
							>
								<select
									style={{ width: "auto", fontSize: "0.85rem" }}
									value={selectedProjectId}
									onChange={(e) => setSelectedProjectId(e.target.value)}
								>
									<option value="">-- Sin Proyecto (No RAG) --</option>
									{projectsArr.map((p) => (
										<option key={p.id} value={p.id}>
											📂 {p.name}
										</option>
									))}
								</select>

								<select
									style={{ width: "auto", fontSize: "0.85rem" }}
									value={selectedSourceId}
									onChange={(e) => loadSourceContent(e.target.value)}
								>
									<option value="">-- Seleccionar Log --</option>
									{sourcesArr.map((s) => (
										<option key={s.id} value={s.id}>
											📄 {s.name}
										</option>
									))}
								</select>
							</div>
						</div>
						<div
							style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}
						>
							<div style={{ flex: 1 }}>
								<label
									htmlFor="provider-select"
									className="text-muted"
									style={{
										fontSize: "0.8rem",
										display: "block",
										marginBottom: "0.4rem",
									}}
								>
									IA Provider
								</label>
								<select
									id="provider-select"
									value={provider}
									onChange={(e) => setProvider(e.target.value)}
								>
									<option value="ollama">Ollama</option>
									<option value="openrouter">OpenRouter</option>
								</select>
							</div>
							<div style={{ flex: 1 }}>
								<label
									htmlFor="model-select"
									className="text-muted"
									style={{
										fontSize: "0.8rem",
										display: "block",
										marginBottom: "0.4rem",
									}}
								>
									Modelo
								</label>
								<select
									id="model-select"
									value={model}
									onChange={(e) => {
										const val = e.target.value;
										setModel(val);
										const saved = savedModels.find((s) => s.modelId === val);
										if (saved) setProvider(saved.provider);
									}}
								>
									{savedModels.length > 0 && (
										<optgroup label="⭐ Guardados">
											{savedModels.map((s) => (
												<option key={`saved-${s.id}`} value={s.modelId}>
													{s.displayName}
												</option>
											))}
										</optgroup>
									)}
									{models.length > 0 && (
										<optgroup label={`📡 ${provider} (Live)`}>
											{models.map((m) => (
												<option key={m} value={m}>
													{m}
												</option>
											))}
										</optgroup>
									)}
								</select>
							</div>
							<div style={{ flex: 1 }}>
								<label
									htmlFor="role-select"
									className="text-muted"
									style={{
										fontSize: "0.8rem",
										display: "block",
										marginBottom: "0.4rem",
									}}
								>
									Role
								</label>
								<select
									id="role-select"
									value={role}
									onChange={(e) => setRole(e.target.value)}
								>
									{roles.map((r) => (
										<option key={r.id} value={r.id}>
											{r.name}
										</option>
									))}
								</select>
							</div>
						</div>

						<textarea
							id="changelog-input"
							placeholder="Pega aquí el changelog técnico crudo (AYER)..."
							value={changelog}
							onChange={(e) => setChangelog(e.target.value)}
							style={{ height: "250px", resize: "none", marginBottom: "1rem" }}
						/>

						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr 1fr",
								gap: "1rem",
								marginBottom: "1rem",
							}}
						>
							<div>
								<label
									htmlFor="today-input"
									className="text-muted"
									style={{ fontSize: "0.8rem" }}
								>
									⬇️ HOY / PENDIENTES
								</label>
								<textarea
									id="today-input"
									placeholder="¿Qué planes hay para hoy?"
									value={today}
									onChange={(e) => setToday(e.target.value)}
									style={{
										height: "120px",
										resize: "none",
										fontSize: "0.85rem",
									}}
								/>
							</div>
							<div>
								<label
									htmlFor="blockers-input"
									className="text-muted"
									style={{ fontSize: "0.8rem" }}
								>
									⛔ BLOQUEOS
								</label>
								<textarea
									id="blockers-input"
									placeholder="¿Algo que te detenga?"
									value={blockers}
									onChange={(e) => setBlockers(e.target.value)}
									style={{
										height: "120px",
										resize: "none",
										fontSize: "0.85rem",
									}}
								/>
							</div>
							<div>
								<label
									htmlFor="doubts-input"
									className="text-muted"
									style={{ fontSize: "0.8rem" }}
								>
									❓ DUDAS
								</label>
								<textarea
									id="doubts-input"
									placeholder="Cualquier duda técnica..."
									value={doubts}
									onChange={(e) => setDoubts(e.target.value)}
									style={{
										height: "120px",
										resize: "none",
										fontSize: "0.85rem",
									}}
								/>
							</div>
						</div>

						<div className="grid-cols-2 mt-1">
							<div className="form-group">
								<label className="text-muted" style={{ fontSize: "0.8rem" }}>
									🎯 CANAL DISCORD
								</label>
								<select
									value={selectedWebhook}
									onChange={(e) => setSelectedWebhook(e.target.value)}
								>
									<option value="">-- No enviar --</option>
									{globalWebhooks.map((w) => (
										<option key={w.id} value={w.url}>
											🔗 {w.name}
										</option>
									))}
									<option value="MANUAL">-- Webhook Manual --</option>
								</select>
							</div>
							<div className="form-group">
								<label className="text-muted" style={{ fontSize: "0.8rem" }}>
									👤 MENCIONAR
								</label>
								<select
									value={selectedMention}
									onChange={(e) => setSelectedMention(e.target.value)}
								>
									<option value="">-- Nadie --</option>
									{globalMentions.map((m) => (
										<option key={m.id} value={m.discordId}>
											👤 {m.name}
										</option>
									))}
									<option value="MANUAL">-- ID Manual --</option>
								</select>
							</div>
						</div>

						<button
							type="button"
							onClick={generateReport}
							disabled={loading}
							style={{ width: "100%", marginTop: "1.5rem" }}
						>
							{loading ? (
								<div className="flex-center gap-1">
									<Loader2 size={18} className="animate-spin" />
									<span>{progress || "Procesando..."}</span>
								</div>
							) : (
								<>
									<Sparkles size={18} /> Generar Reporte Mágico
								</>
							)}
						</button>
					</section>

					<section className="glass-card">
						<div className="flex-between mb-2">
							<h3>Vista Previa</h3>
							<div className="flex-gap-1">
								<button
									type="button"
									className="secondary"
									onClick={downloadReport}
									disabled={!report}
								>
									<Download size={16} /> Descargar .md
								</button>
								<button
									type="button"
									className="secondary"
									onClick={() => sendExistingToDiscord(report)}
									disabled={!report || sendingDiscord}
								>
									{sendingDiscord ? (
										<Loader2 size={16} className="animate-spin" />
									) : (
										<Send size={16} />
									)}
									<span>
										{sendingDiscord ? " Enviando..." : " Enviar a Discord"}
									</span>
								</button>
							</div>
						</div>
						<div
							style={{
								background: "var(--bg-deep)",
								padding: "1.5rem",
								borderRadius: "12px",
								height: "480px",
								overflowY: "auto",
								border: "1px solid var(--border-luxe)",
								whiteSpace: "pre-wrap",
								color: report ? "var(--text-main)" : "var(--text-dim)",
							}}
						>
							{report ? (
								<RichMarkdownRenderer content={report} />
							) : (
								<div
									className="flex-center text-muted"
									style={{ height: "100%", textAlign: "center" }}
								>
									El reporte generado aparecerá aquí de forma espectacular...
								</div>
							)}
						</div>
					</section>
				</div>
			) : (
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

					<div
						style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
					>
						{reportsArr.length === 0 ? (
							<div
								className="text-muted flex-center"
								style={{ padding: "5rem" }}
							>
								Aún no hay informes generados.
							</div>
						) : (
							reportsArr.map((r) => (
								<div
									key={r.id}
									className="glass-card"
									style={{ padding: "1.2rem", background: "var(--bg-card)" }}
								>
									<div className="flex-between">
										<div style={{ flex: 1 }}>
											<strong>{r.title}</strong>
											<div
												className="text-muted"
												style={{ fontSize: "0.8rem", marginTop: "0.2rem" }}
											>
												{new Date(r.createdAt).toLocaleString()} · {r.provider}/
												{r.model} · Rol: {r.role}
											</div>
										</div>
										<div className="flex-gap-1">
											<button
												className="secondary"
												title="Descargar"
												onClick={() => downloadReportFile(r.content, r.title)}
											>
												<Download size={16} />
											</button>
											<button
												className="secondary"
												title="Discord"
												onClick={() => sendExistingToDiscord(r.content)}
												disabled={sendingDiscord}
											>
												<Send size={16} />
											</button>
											<button
												className="secondary"
												title="Ver"
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
												title="Borrar"
												onClick={() => deleteReport(r.id)}
												style={{ color: "#ff4444" }}
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>
									{expandedId === r.id && (
										<div
											style={{
												marginTop: "1rem",
												borderTop: "1px solid var(--border-luxe)",
												paddingTop: "1rem",
											}}
										>
											{editingReportId === r.id ? (
												<div>
													<textarea
														value={editingContent}
														onChange={(e) => setEditingContent(e.target.value)}
														style={{
															height: "400px",
															background: "var(--bg-deep)",
															color: "var(--text-main)",
															marginBottom: "1rem",
														}}
													/>
													<div className="flex-gap-1">
														<button onClick={saveEditedReport}>
															<Save size={18} /> Guardar Cambios
														</button>
														<button
															className="secondary"
															onClick={() => setEditingReportId(null)}
														>
															<X size={18} /> Cancelar
														</button>
													</div>
												</div>
											) : (
												<div>
													<div className="flex-between mb-1">
														<span
															className="text-muted"
															style={{ fontSize: "0.8rem" }}
														>
															Vista de Lectura (Habilitado para edición)
														</span>
														<button
															className="secondary"
															style={{
																padding: "0.2rem 0.6rem",
																fontSize: "0.8rem",
															}}
															onClick={() => {
																setEditingReportId(r.id);
																setEditingContent(r.content);
															}}
														>
															<Edit size={14} /> Editar Contenido
														</button>
													</div>
													<RichMarkdownRenderer content={r.content} />
												</div>
											)}
										</div>
									)}
								</div>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Informes;
