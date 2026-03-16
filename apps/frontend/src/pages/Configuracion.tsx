import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { DiscordSettings } from "./Sections";
import {
	Plus,
	Trash2,
	Save,
	Key,
	Bot,
	FileText,
	Cpu,
	Download,
	Upload,
	MessageSquare,
} from "lucide-react";

const API_BASE = "http://localhost:3001/api";

interface Prompt {
	id: string;
	name: string;
	content: string;
}

interface AIModel {
	id: number;
	provider: string;
	modelId: string;
	displayName: string;
}

type ConfigTab = "api" | "modelos" | "prompts" | "discord";

const PROVIDER_COLORS: Record<string, string> = {
	ollama: "#22c55e",
	openrouter: "#6366f1",
	anthropic: "#f59e0b",
};

// --- Sub-Section: API Keys ---
const ApiSection = () => {
	const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
	const [openRouterKey, setOpenRouterKey] = useState("");
	const [anthropicKey, setAnthropicKey] = useState("");
	const [loading, setLoading] = useState(false);
	const [saved, setSaved] = useState(false);

	const loadSettings = useCallback(async () => {
		try {
			const { data } = await axios.get(`${API_BASE}/settings`);
			if (data.OLLAMA_URL) setOllamaUrl(data.OLLAMA_URL);
			if (data.OPENROUTER_API_KEY) setOpenRouterKey(data.OPENROUTER_API_KEY);
			if (data.ANTHROPIC_API_KEY) setAnthropicKey(data.ANTHROPIC_API_KEY);
		} catch {
			console.error("Error loading settings");
		}
	}, []);

	useEffect(() => {
		(async () => {
			await loadSettings();
		})();
	}, [loadSettings]);

	const saveSettings = async () => {
		setLoading(true);
		try {
			await axios.post(`${API_BASE}/settings`, {
				settings: {
					OLLAMA_URL: ollamaUrl,
					OPENROUTER_API_KEY: openRouterKey,
					ANTHROPIC_API_KEY: anthropicKey,
				},
			});
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} catch {
			alert("Error al guardar la configuración");
		}
		setLoading(false);
	};

	return (
		<div className="glass-card">
			<h3>
				<Key
					size={20}
					style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
				/>
				Configuración de API
			</h3>
			<p
				className="text-muted"
				style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}
			>
				Configura las claves y URLs de los proveedores de IA que utilizas.
			</p>

			<div className="form-group">
				<label>
					<span
						style={{
							background: PROVIDER_COLORS.ollama,
							color: "white",
							padding: "2px 8px",
							borderRadius: "6px",
							fontSize: "0.75rem",
							marginRight: "0.5rem",
						}}
					>
						Ollama
					</span>
					URL del Servidor Local
				</label>
				<input
					value={ollamaUrl}
					onChange={(e) => setOllamaUrl(e.target.value)}
					placeholder="http://localhost:11434"
				/>
			</div>

			<div className="form-group">
				<label>
					<span
						style={{
							background: PROVIDER_COLORS.openrouter,
							color: "white",
							padding: "2px 8px",
							borderRadius: "6px",
							fontSize: "0.75rem",
							marginRight: "0.5rem",
						}}
					>
						OpenRouter
					</span>
					API Key
				</label>
				<input
					type="password"
					value={openRouterKey}
					onChange={(e) => setOpenRouterKey(e.target.value)}
					placeholder="sk-or-..."
				/>
			</div>

			<div className="form-group">
				<label>
					<span
						style={{
							background: PROVIDER_COLORS.anthropic,
							color: "white",
							padding: "2px 8px",
							borderRadius: "6px",
							fontSize: "0.75rem",
							marginRight: "0.5rem",
						}}
					>
						Anthropic
					</span>
					API Key
				</label>
				<input
					type="password"
					value={anthropicKey}
					onChange={(e) => setAnthropicKey(e.target.value)}
					placeholder="sk-ant-..."
				/>
			</div>

			<button onClick={saveSettings} disabled={loading}>
				<Save size={18} /> {saved ? "✓ Guardado" : "Guardar Configuración"}
			</button>
		</div>
	);
};

// --- Sub-Section: Modelos ---
const ModelosSection = () => {
	const [models, setModels] = useState<AIModel[]>([]);
	const [showAdd, setShowAdd] = useState(false);
	const [newProvider, setNewProvider] = useState("ollama");
	const [newModelId, setNewModelId] = useState("");
	const [newDisplayName, setNewDisplayName] = useState("");

	const loadModels = useCallback(async () => {
		try {
			const { data } = await axios.get(`${API_BASE}/ai-models`);
			setModels(data);
		} catch {
			console.error("Error loading models");
		}
	}, []);

	useEffect(() => {
		(async () => {
			await loadModels();
		})();
	}, [loadModels]);

	const addModel = async () => {
		if (!newModelId || !newDisplayName)
			return alert("Completa todos los campos");
		try {
			await axios.post(`${API_BASE}/ai-models`, {
				provider: newProvider,
				modelId: newModelId,
				displayName: newDisplayName,
			});
			setNewModelId("");
			setNewDisplayName("");
			setShowAdd(false);
			loadModels();
		} catch {
			alert("Error al añadir modelo");
		}
	};

	const deleteModel = async (id: number) => {
		if (!confirm("¿Eliminar este modelo?")) return;
		try {
			await axios.delete(`${API_BASE}/ai-models/${id}`);
			loadModels();
		} catch {
			alert("Error al eliminar modelo");
		}
	};

	return (
		<div className="glass-card">
			<div className="flex-between mb-2">
				<div>
					<h3>
						<Cpu
							size={20}
							style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
						/>
						Modelos de IA
					</h3>
					<p
						className="text-muted"
						style={{ fontSize: "0.85rem", marginTop: "-0.5rem" }}
					>
						Guarda los modelos que usas frecuentemente. Aparecerán como opciones
						rápidas en Informes y Tareas.
					</p>
				</div>
				<button onClick={() => setShowAdd(!showAdd)}>
					<Plus size={18} /> {showAdd ? "Cancelar" : "Añadir Modelo"}
				</button>
			</div>

			{showAdd && (
				<div
					className="glass-card mb-2"
					style={{ background: "var(--bg-deep)" }}
				>
					<div
						className="grid-cols-2"
						style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
					>
						<div className="form-group">
							<label>Proveedor</label>
							<select
								value={newProvider}
								onChange={(e) => setNewProvider(e.target.value)}
							>
								<option value="ollama">Ollama (Local)</option>
								<option value="openrouter">OpenRouter (Cloud)</option>
								<option value="anthropic">Anthropic (Cloud)</option>
							</select>
						</div>
						<div className="form-group">
							<label>ID del Modelo</label>
							<input
								value={newModelId}
								onChange={(e) => setNewModelId(e.target.value)}
								placeholder="Ej. llama3, gpt-4o-mini, claude-3-haiku"
							/>
						</div>
						<div className="form-group">
							<label>Nombre para Mostrar</label>
							<input
								value={newDisplayName}
								onChange={(e) => setNewDisplayName(e.target.value)}
								placeholder="Ej. Llama 3 (Local)"
							/>
						</div>
					</div>
					<button onClick={addModel}>
						<Save size={18} /> Guardar Modelo
					</button>
				</div>
			)}

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
					gap: "1rem",
				}}
			>
				{models.length === 0 ? (
					<div
						className="text-muted"
						style={{ textAlign: "center", padding: "2rem", gridColumn: "1/-1" }}
					>
						No hay modelos guardados. Añade uno para empezar.
					</div>
				) : (
					models.map((m) => (
						<div
							key={m.id}
							className="glass-card"
							style={{
								padding: "1.2rem",
								background: "var(--bg-card)",
								borderLeft: `3px solid ${PROVIDER_COLORS[m.provider] || "var(--accent-primary)"}`,
							}}
						>
							<div className="flex-between">
								<div>
									<strong style={{ fontSize: "1rem" }}>
										<Bot
											size={16}
											style={{
												verticalAlign: "middle",
												marginRight: "0.4rem",
											}}
										/>
										{m.displayName}
									</strong>
									<div
										className="text-muted"
										style={{ fontSize: "0.8rem", marginTop: "0.3rem" }}
									>
										<span
											style={{
												background:
													PROVIDER_COLORS[m.provider] || "var(--bg-deep)",
												color: "white",
												padding: "1px 6px",
												borderRadius: "4px",
												fontSize: "0.7rem",
												marginRight: "0.5rem",
											}}
										>
											{m.provider}
										</span>
										<code style={{ fontSize: "0.8rem" }}>{m.modelId}</code>
									</div>
								</div>
								<button
									className="secondary"
									onClick={() => deleteModel(m.id)}
									style={{ color: "#ff4444", padding: "0.4rem" }}
								>
									<Trash2 size={16} />
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

// --- Sub-Section: Prompts ---
const PromptsSection = () => {
	const [prompts, setPrompts] = useState<Prompt[]>([]);
	const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
	const [isNewPrompt, setIsNewPrompt] = useState(false);

	const loadPrompts = useCallback(async () => {
		try {
			const { data } = await axios.get(`${API_BASE}/prompts`);
			setPrompts(data.roles || []);
		} catch {
			console.error("Error loading prompts");
		}
	}, []);

	useEffect(() => {
		(async () => {
			await loadPrompts();
		})();
	}, [loadPrompts]);

	const savePrompt = async (p: Prompt) => {
		if (!p.id || !p.name || !p.content) {
			return alert("Completa todos los campos del rol");
		}
		try {
			await axios.post(`${API_BASE}/prompts`, p);
			setEditingPrompt(null);
			setIsNewPrompt(false);
			loadPrompts();
		} catch {
			alert("Error al guardar el prompt");
		}
	};

	const deletePrompt = async (id: string) => {
		if (!confirm("¿Estás seguro de eliminar este rol?")) return;
		try {
			await axios.delete(`${API_BASE}/prompts/${id}`);
			loadPrompts();
		} catch {
			alert("Error al eliminar el prompt");
		}
	};

	return (
		<>
			<div className="glass-card">
				<div className="flex-between mb-2">
					<div>
						<h3>
							<FileText
								size={20}
								style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
							/>
							Prompts del Sistema (Roles)
						</h3>
						<p
							className="text-muted"
							style={{ fontSize: "0.85rem", marginTop: "-0.5rem" }}
						>
							Define las instrucciones que la IA usará para generar informes
							según el rol seleccionado.
						</p>
					</div>
					<div className="flex-gap-1">
						<button
							className="secondary"
							onClick={async () => {
								const { data } = await axios.get(`${API_BASE}/prompts`);
								const blob = new Blob([JSON.stringify(data.roles, null, 2)], {
									type: "application/json",
								});
								const url = URL.createObjectURL(blob);
								const a = document.createElement("a");
								a.href = url;
								a.download = `zentinel-prompts-${new Date().toISOString().split("T")[0]}.json`;
								a.click();
							}}
						>
							<Download size={18} /> Exportar
						</button>
						<label
							className="button secondary"
							style={{
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
							}}
						>
							<Upload size={18} /> Importar
							<input
								type="file"
								accept=".json"
								style={{ display: "none" }}
								onChange={async (e) => {
									const file = e.target.files?.[0];
									if (!file) return;
									const reader = new FileReader();
									reader.onload = async (evt) => {
										try {
											const imported = JSON.parse(evt.target?.result as string);
											for (const p of imported) {
												await axios.post(`${API_BASE}/prompts`, p);
											}
											loadPrompts();
											alert("Prompts importados con éxito");
										} catch (_err) {
											alert("Error al importar el archivo");
										}
									};
									reader.readAsText(file);
								}}
							/>
						</label>
						<button
							className="secondary"
							onClick={() => {
								setEditingPrompt({ id: "", name: "", content: "" });
								setIsNewPrompt(true);
							}}
						>
							<Plus size={18} /> Nuevo Rol
						</button>
					</div>
				</div>

				<div style={{ marginBottom: "1.5rem" }}>
					<h4
						className="text-muted"
						style={{ fontSize: "0.85rem", marginBottom: "1rem" }}
					>
						💡 Plantillas Rápidas
					</h4>
					<div className="flex-gap-1" style={{ flexWrap: "wrap" }}>
						{[
							{
								id: "TECH_LEAD",
								name: "Tech Lead",
								content:
									"Actúa como un Tech Lead senior. Analiza el changelog buscando deuda técnica, riesgos de arquitectura y calidad de código.",
							},
							{
								id: "PRODUCT_OWNER",
								name: "Product Owner",
								content:
									"Actúa como Product Owner. Traduce los cambios técnicos a valor de negocio y resumen para stakeholders.",
							},
							{
								id: "SECURITY_AUDIT",
								name: "Auditoría de Seguridad",
								content:
									"Actúa como experto en seguridad. Analiza cada cambio buscando potenciales vulnerabilidades (SQLi, XSS, fugas de datos).",
							},
							{
								id: "SRE_ENGINEER",
								name: "Ingeniero SRE",
								content:
									"Actúa como Ingeniero de Fiabilidad. Evalúa el impacto de los cambios en la escalabilidad y disponibilidad del sistema.",
							},
						].map((tpl) => (
							<button
								key={tpl.id}
								className="secondary"
								style={{ fontSize: "0.8rem", padding: "0.5rem 0.8rem" }}
								onClick={() => {
									setEditingPrompt(tpl);
									setIsNewPrompt(true);
								}}
							>
								{tpl.name}
							</button>
						))}
					</div>
				</div>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "1rem",
					}}
				>
					{prompts.map((p) => (
						<div
							key={p.id}
							className="glass-card"
							style={{ padding: "1rem", background: "var(--bg-deep)" }}
						>
							<div className="flex-between mb-1">
								<div>
									<strong>{p.name}</strong>{" "}
									<span className="text-muted" style={{ fontSize: "0.8rem" }}>
										({p.id})
									</span>
								</div>
								<div className="flex-gap-1">
									<button
										className="secondary"
										onClick={() => {
											setEditingPrompt({ ...p });
											setIsNewPrompt(false);
										}}
										style={{ padding: "0.4rem" }}
									>
										✏️
									</button>
									<button
										className="secondary"
										onClick={() => deletePrompt(p.id)}
										style={{ padding: "0.4rem", color: "#ff4444" }}
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
							<div
								className="text-muted"
								style={{
									fontSize: "0.85rem",
									whiteSpace: "pre-wrap",
									maxHeight: "100px",
									overflow: "hidden",
								}}
							>
								{p.content}
							</div>
						</div>
					))}
				</div>
			</div>

			{editingPrompt && (
				<div className="modal-overlay">
					<div
						className="glass-card modal-content"
						style={{ width: "100%", maxWidth: "800px" }}
					>
						<h3>{isNewPrompt ? "Nuevo Rol" : "Editar Rol"}</h3>
						<div className="grid-cols-2">
							<div className="form-group">
								<label>ID Único (ej. PRODUCT_OWNER)</label>
								<input
									disabled={!isNewPrompt}
									value={editingPrompt.id}
									onChange={(e) =>
										setEditingPrompt({
											...editingPrompt,
											id: e.target.value.toUpperCase().replace(/\s/g, "_"),
										})
									}
									placeholder="MI_ROL"
								/>
							</div>
							<div className="form-group">
								<label>Nombre Amigable</label>
								<input
									value={editingPrompt.name}
									onChange={(e) =>
										setEditingPrompt({
											...editingPrompt,
											name: e.target.value,
										})
									}
									placeholder="Mi Rol"
								/>
							</div>
						</div>
						<div className="form-group">
							<label>Instrucciones del Sistema (System Prompt)</label>
							<textarea
								style={{ height: "300px" }}
								value={editingPrompt.content}
								onChange={(e) =>
									setEditingPrompt({
										...editingPrompt,
										content: e.target.value,
									})
								}
								placeholder="Describe las instrucciones para la IA..."
							/>
						</div>
						<div className="flex-gap-1">
							<button onClick={() => savePrompt(editingPrompt)}>
								<Save size={18} /> Guardar Rol
							</button>
							<button
								className="secondary"
								onClick={() => {
									setEditingPrompt(null);
									setIsNewPrompt(false);
								}}
							>
								Cancelar
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

// --- Main Configuracion Component ---
const TAB_ITEMS: { key: ConfigTab; label: string; icon: React.ReactNode }[] = [
	{ key: "api", label: "Claves API", icon: <Key size={18} /> },
	{ key: "modelos", label: "Modelos", icon: <Cpu size={18} /> },
	{ key: "prompts", label: "Prompts", icon: <FileText size={18} /> },
	{ key: "discord", label: "Discord", icon: <MessageSquare size={18} /> },
];

const Configuracion = () => {
	const [activeTab, setActiveTab] = useState<ConfigTab>("api");

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
			<div
				style={{
					display: "flex",
					gap: "0.5rem",
					borderBottom: "1px solid var(--border-luxe)",
					paddingBottom: "0.5rem",
				}}
			>
				{TAB_ITEMS.map((tab) => (
					<button
						key={tab.key}
						className={activeTab === tab.key ? "" : "secondary"}
						onClick={() => setActiveTab(tab.key)}
						style={{
							borderRadius: "12px 12px 0 0",
							...(activeTab === tab.key
								? {}
								: { background: "transparent", border: "none" }),
						}}
					>
						{tab.icon} {tab.label}
					</button>
				))}
			</div>

			{activeTab === "api" && <ApiSection />}
			{activeTab === "modelos" && <ModelosSection />}
			{activeTab === "prompts" && <PromptsSection />}
			{activeTab === "discord" && (
				<div className="glass-card">
					<h3>
						<MessageSquare
							size={20}
							style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
						/>
						Configuración de Discord
					</h3>
					<p
						className="text-muted"
						style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}
					>
						Configura el webhook global para recibir las notificaciones de los
						informes programados.
					</p>
					<DiscordSettings />
				</div>
			)}
		</div>
	);
};

export default Configuracion;
