import axios from "axios";
import {
	Brain,
	Clock,
	Files,
	FileText,
	History,
	MessageSquare,
	Settings,
	ShieldCheck,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const API_BASE = "http://localhost:3001/api";

interface ChartDataItem {
	date: string;
	tokens: number;
	health: number;
}

interface ReportData {
	id: number;
	tokensUsed: number | null;
	sentimentScore: number | null;
	createdAt: string;
}

const Dashboard = () => {
	const [stats, setStats] = useState({
		sources: 0,
		history: 0,
		tasks: 0,
		totalTokens: 0,
		avgSentiment: 0,
	});
	const [chartData, setChartData] = useState<ChartDataItem[]>([]);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const [sourcesRes, historyRes, tasksRes] = await Promise.all([
					axios.get(`${API_BASE}/sources`),
					axios.get(`${API_BASE}/reports`),
					axios.get(`${API_BASE}/tasks`),
				]);

				const reports: ReportData[] = historyRes.data;
				const totalTokens = reports.reduce(
					(acc, r) => acc + (r.tokensUsed || 0),
					0,
				);
				const avgSentiment =
					reports.length > 0
						? reports.reduce((acc, r) => acc + (r.sentimentScore || 0), 0) /
							reports.length
						: 0;

				// Formatear datos para el gráfico (últimos 7 informes)
				const lastReports = [...reports].reverse().slice(-7);
				const data: ChartDataItem[] = lastReports.map((r) => ({
					date: new Date(r.createdAt).toLocaleDateString(undefined, {
						day: "2-digit",
						month: "short",
					}),
					tokens: r.tokensUsed || 0,
					health: r.sentimentScore || 0,
				}));

				setStats({
					sources: sourcesRes.data.length,
					history: reports.length,
					tasks: tasksRes.data.length,
					totalTokens,
					avgSentiment: Math.round(avgSentiment),
				});
				setChartData(data);
			} catch (error) {
				console.error("Error fetching dashboard stats", error);
			}
		};

		fetchStats();
	}, []);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
			<header>
				<h1 className="gradient-text">Dashboard</h1>
				<p className="text-muted">
					Bienvenido a Zentinel. Aquí tienes un resumen de tu sistema.
				</p>
			</header>

			{/* Stats Grid */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
					gap: "1.5rem",
				}}
			>
				<div
					className="glass-card"
					style={{ display: "flex", alignItems: "center", gap: "1rem" }}
				>
					<div
						style={{
							background: "rgba(99, 102, 241, 0.1)",
							padding: "0.8rem",
							borderRadius: "12px",
						}}
					>
						<Files size={24} color="#6366f1" />
					</div>
					<div>
						<h4
							className="text-muted"
							style={{ fontSize: "0.85rem", textTransform: "uppercase" }}
						>
							Fuentes
						</h4>
						<h2 style={{ fontSize: "1.5rem" }}>{stats.sources}</h2>
					</div>
				</div>
				<div
					className="glass-card"
					style={{ display: "flex", alignItems: "center", gap: "1rem" }}
				>
					<div
						style={{
							background: "rgba(34, 197, 94, 0.1)",
							padding: "0.8rem",
							borderRadius: "12px",
						}}
					>
						<History size={24} color="#22c55e" />
					</div>
					<div>
						<h4
							className="text-muted"
							style={{ fontSize: "0.85rem", textTransform: "uppercase" }}
						>
							Informes
						</h4>
						<h2 style={{ fontSize: "1.5rem" }}>{stats.history}</h2>
					</div>
				</div>
				<div
					className="glass-card"
					style={{ display: "flex", alignItems: "center", gap: "1rem" }}
				>
					<div
						style={{
							background: "rgba(245, 158, 11, 0.1)",
							padding: "0.8rem",
							borderRadius: "12px",
						}}
					>
						<TrendingUp size={24} color="#f59e0b" />
					</div>
					<div>
						<h4
							className="text-muted"
							style={{ fontSize: "0.85rem", textTransform: "uppercase" }}
						>
							Tokens Totales
						</h4>
						<h2 style={{ fontSize: "1.5rem" }}>
							{(stats.totalTokens / 1000).toFixed(1)}k
						</h2>
					</div>
				</div>
				<div
					className="glass-card"
					style={{ display: "flex", alignItems: "center", gap: "1rem" }}
				>
					<div
						style={{
							background: "rgba(236, 72, 153, 0.1)",
							padding: "0.8rem",
							borderRadius: "12px",
						}}
					>
						<Brain size={24} color="#ec4899" />
					</div>
					<div>
						<h4
							className="text-muted"
							style={{ fontSize: "0.85rem", textTransform: "uppercase" }}
						>
							Salud Code (Avg)
						</h4>
						<h2 style={{ fontSize: "1.5rem" }}>{stats.avgSentiment}%</h2>
					</div>
				</div>
			</div>

			{/* Analytics Charts */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "2fr 1fr",
					gap: "1.5rem",
				}}
			>
				<div className="glass-card" style={{ height: "400px" }}>
					<h3 style={{ marginBottom: "1.5rem" }}>Uso de Tokens (Tendencia)</h3>
					<ResponsiveContainer width="100%" height="80%">
						<AreaChart data={chartData}>
							<defs>
								<linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
									<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="rgba(255,255,255,0.05)"
							/>
							<XAxis
								dataKey="date"
								stroke="var(--text-dim)"
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								stroke="var(--text-dim)"
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<Tooltip
								contentStyle={{
									background: "var(--bg-card)",
									border: "1px solid var(--border-luxe)",
									borderRadius: "8px",
								}}
								itemStyle={{ color: "var(--text-main)" }}
							/>
							<Area
								type="monotone"
								dataKey="tokens"
								stroke="#6366f1"
								fillOpacity={1}
								fill="url(#colorTokens)"
								strokeWidth={2}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>

				<div className="glass-card" style={{ height: "400px" }}>
					<h3 style={{ marginBottom: "1.5rem" }}>Salud del Código</h3>
					<ResponsiveContainer width="100%" height="80%">
						<BarChart data={chartData}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="rgba(255,255,255,0.05)"
								vertical={false}
							/>
							<XAxis
								dataKey="date"
								stroke="var(--text-dim)"
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								stroke="var(--text-dim)"
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<Tooltip
								contentStyle={{
									background: "var(--bg-card)",
									border: "1px solid var(--border-luxe)",
									borderRadius: "8px",
								}}
								cursor={{ fill: "rgba(255,255,255,0.05)" }}
							/>
							<Bar dataKey="health" radius={[4, 4, 0, 0]}>
								{chartData.map((entry) => (
									<Cell
										key={`cell-${entry.date}`}
										fill={
											entry.health > 80
												? "#22c55e"
												: entry.health > 60
													? "#f59e0b"
													: "#ef4444"
										}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Guide Section */}
			<div className="glass-card">
				<h3>🚀 Guía de Uso y Configuración</h3>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "1.5rem",
						marginTop: "1rem",
					}}
				>
					<section>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.75rem",
								marginBottom: "0.5rem",
							}}
						>
							<Settings size={20} color="var(--accent-primary)" />
							<strong style={{ fontSize: "1.1rem" }}>
								1. Configura tus APIs y Modelos
							</strong>
						</div>
						<p className="text-muted" style={{ marginLeft: "2.75rem" }}>
							Antes de empezar, ve a <strong>Configuración</strong>. Ingresa las
							URLs de tus servicios (Ollama local o OpenRouter cloud) y registra
							los <strong>Modelos</strong> que deseas usar como favoritos.
							También puedes personalizar los <strong>Prompts</strong> del
							sistema para que la IA se comporte como un Product Owner, DevOps,
							etc.
						</p>
					</section>

					<section>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.75rem",
								marginBottom: "0.5rem",
							}}
						>
							<ShieldCheck size={20} color="var(--accent-primary)" />
							<strong style={{ fontSize: "1.1rem" }}>
								2. Crea tu Proyecto (RAG)
							</strong>
						</div>
						<p className="text-muted" style={{ marginLeft: "2.75rem" }}>
							En la sección de <strong>Proyecto</strong>, registra la carpeta
							raíz de tu código. Zentinel indexará tus archivos automáticamente
							(RAG) y vinculará tu <code>CHANGELOG.md</code> para que la IA
							tenga contexto técnico total de tus desarrollos.
						</p>
					</section>

					<section>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.75rem",
								marginBottom: "0.5rem",
							}}
						>
							<FileText size={20} color="var(--accent-primary)" />
							<strong style={{ fontSize: "1.1rem" }}>
								3. Genera Informes Manuales
							</strong>
						</div>
						<p className="text-muted" style={{ marginLeft: "2.75rem" }}>
							En <strong>Informes</strong>, puedes seleccionar una fuente
							cargada o pegar texto directamente. Elige un rol de IA y un
							modelo, y presiona <strong>Generar</strong> para obtener un
							resumen profesional de los cambios.
						</p>
					</section>

					<section>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.75rem",
								marginBottom: "0.5rem",
							}}
						>
							<Clock size={20} color="var(--accent-primary)" />
							<strong style={{ fontSize: "1.1rem" }}>
								4. Automatiza con Tareas
							</strong>
						</div>
						<p className="text-muted" style={{ marginLeft: "2.75rem" }}>
							¿Quieres informes automáticos? En <strong>Tareas</strong> puedes
							programar ejecuciones periódicas. Selecciona el horario, la fuente
							y el modelo. Zentinel se encargará de leer el archivo y generar el
							informe sin intervención.
						</p>
					</section>

					<section>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.75rem",
								marginBottom: "0.5rem",
							}}
						>
							<MessageSquare size={20} color="var(--accent-primary)" />
							<strong style={{ fontSize: "1.1rem" }}>
								5. Conecta con Discord
							</strong>
						</div>
						<p className="text-muted" style={{ marginLeft: "2.75rem" }}>
							Configura un Webhook en la sección <strong>Discord</strong>. Una
							vez conectado, tus tareas programadas enviarán automáticamente los
							informes generados a tu canal de Discord, mencionando si lo deseas
							a los responsables.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
