import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Send, Sparkles, Download, Loader2 } from "lucide-react";
import { io } from "socket.io-client";
import { RichMarkdownRenderer } from "../components/RichMarkdownRenderer";

const API_BASE = "http://localhost:3001/api";

interface Source {
	id: number;
	name: string;
	path: string;
}

interface SavedModel {
	id: number;
	provider: string;
	modelId: string;
	displayName: string;
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
	const [selectedSourceId, setSelectedSourceId] = useState("");
	const [progress, setProgress] = useState("");
	const [socketId, setSocketId] = useState("");

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
			const [pRes, sRes, mRes] = await Promise.all([
				axios.get(`${API_BASE}/prompts`),
				axios.get(`${API_BASE}/sources`),
				axios.get(`${API_BASE}/ai-models`),
			]);
			if (pRes.data.roles) {
				setRoles(pRes.data.roles);
				if (pRes.data.roles.length > 0) setRole(pRes.data.roles[0].id);
			}
			setSourcesArr(sRes.data);
			setSavedModels(mRes.data);
		} catch {
			console.error("Error fetching initial data");
		}
	}, []);

	useEffect(() => {
		(async () => {
			await fetchModels();
		})();
	}, [fetchModels]);

	useEffect(() => {
		(async () => {
			await fetchData();
		})();
	}, [fetchData]);

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

	return (
		<div className="grid-cols-2">
			<section className="glass-card">
				<div className="flex-between mb-1">
					<h3>🚀 Generar Informe</h3>
					<select
						style={{ width: "auto", fontSize: "0.85rem" }}
						value={selectedSourceId}
						onChange={(e) => loadSourceContent(e.target.value)}
					>
						<option value="">-- Seleccionar Log --</option>
						{sourcesArr.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name}
							</option>
						))}
					</select>
				</div>
				<div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
					<div style={{ flex: 1 }}>
						<label
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
							value={provider}
							onChange={(e) => setProvider(e.target.value)}
						>
							<option value="ollama">Ollama</option>
							<option value="openrouter">OpenRouter</option>
						</select>
					</div>
					<div style={{ flex: 1 }}>
						<label
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
							className="text-muted"
							style={{
								fontSize: "0.8rem",
								display: "block",
								marginBottom: "0.4rem",
							}}
						>
							Role
						</label>
						<select value={role} onChange={(e) => setRole(e.target.value)}>
							{roles.map((r) => (
								<option key={r.id} value={r.id}>
									{r.name}
								</option>
							))}
						</select>
					</div>
				</div>

				<textarea
					placeholder="Pega aquí el changelog técnico crudo..."
					value={changelog}
					onChange={(e) => setChangelog(e.target.value)}
					style={{ height: "350px", resize: "none" }}
				/>

				<button
					onClick={generateReport}
					disabled={loading}
					style={{ marginTop: "1.5rem", width: "100%" }}
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
							className="secondary"
							onClick={downloadReport}
							disabled={!report}
						>
							<Download size={16} /> Descargar .md
						</button>
						<button className="secondary" disabled={!report}>
							<Send size={16} /> Enviar a Discord
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
							style={{
								height: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								textAlign: "center",
							}}
						>
							El reporte generado aparecerá aquí de forma espectacular...
						</div>
					)}
				</div>
			</section>
		</div>
	);
};

export default Informes;
