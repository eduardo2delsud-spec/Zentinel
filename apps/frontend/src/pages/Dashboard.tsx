import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Files, 
  History, 
  Clock, 
  ShieldCheck, 
  Settings, 
  MessageSquare,
  FileText
} from "lucide-react";

const API_BASE = "http://localhost:3001/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    sources: 0,
    history: 0,
    tasks: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sourcesRes, historyRes, tasksRes] = await Promise.all([
          axios.get(`${API_BASE}/sources`),
          axios.get(`${API_BASE}/reports`),
          axios.get(`${API_BASE}/tasks`)
        ]);

        setStats({
          sources: sourcesRes.data.length,
          history: historyRes.data.length,
          tasks: tasksRes.data.length
        });
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
        <p className="text-muted">Bienvenido a Zentinel. Aquí tienes un resumen de tu sistema.</p>
      </header>

      {/* Stats Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1.5rem" 
      }}>
        <div className="glass-card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <Files size={32} className="gradient-text" style={{ marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{stats.sources}</h2>
          <p className="text-muted">Fuentes de Datos</p>
        </div>
        <div className="glass-card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <History size={32} className="gradient-text" style={{ marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{stats.history}</h2>
          <p className="text-muted">Informes Generados</p>
        </div>
        <div className="glass-card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <Clock size={32} className="gradient-text" style={{ marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{stats.tasks}</h2>
          <p className="text-muted">Tareas Programadas</p>
        </div>
      </div>

      {/* Guide Section */}
      <div className="glass-card">
        <h3>🚀 Guía de Uso y Configuración</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
          
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <Settings size={20} color="var(--accent-primary)" />
              <strong style={{ fontSize: "1.1rem" }}>1. Configura tus APIs y Modelos</strong>
            </div>
            <p className="text-muted" style={{ marginLeft: "2.75rem" }}>
              Antes de empezar, ve a <strong>Configuración</strong>. Ingresa las URLs de tus servicios (Ollama local o OpenRouter cloud) 
              y registra los <strong>Modelos</strong> que deseas usar como favoritos. También puedes personalizar los <strong>Prompts</strong> del sistema para que la IA se comporte como un Product Owner, DevOps, etc.
            </p>
          </section>

          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <ShieldCheck size={20} color="var(--accent-primary)" />
              <strong style={{ fontSize: "1.1rem" }}>2. Registra tus Fuentes</strong>
            </div>
            <p className="text-muted" style={{ marginLeft: "2.75rem" }}>
              En la sección de <strong>Archivos</strong>, añade las rutas locales de tus archivos <code>CHANGELOG.md</code> o logs técnicos. 
              Esto permitirá que Zentinel lea los cambios automáticamente para generar informes.
            </p>
          </section>

          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <FileText size={20} color="var(--accent-primary)" />
              <strong style={{ fontSize: "1.1rem" }}>3. Genera Informes Manuales</strong>
            </div>
            <p className="text-muted" style={{ marginLeft: "2.75rem" }}>
              En <strong>Informes</strong>, puedes seleccionar una fuente cargada o pegar texto directamente. 
              Elige un rol de IA y un modelo, y presiona <strong>Generar</strong> para obtener un resumen profesional de los cambios.
            </p>
          </section>

          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <Clock size={20} color="var(--accent-primary)" />
              <strong style={{ fontSize: "1.1rem" }}>4. Automatiza con Tareas</strong>
            </div>
            <p className="text-muted" style={{ marginLeft: "2.75rem" }}>
              ¿Quieres informes automáticos? En <strong>Tareas</strong> puedes programar ejecuciones periódicas. 
              Selecciona el horario, la fuente y el modelo. Zentinel se encargará de leer el archivo y generar el informe sin intervención.
            </p>
          </section>

          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <MessageSquare size={20} color="var(--accent-primary)" />
              <strong style={{ fontSize: "1.1rem" }}>5. Conecta con Discord</strong>
            </div>
            <p className="text-muted" style={{ marginLeft: "2.75rem" }}>
              Configura un Webhook en la sección <strong>Discord</strong>. Una vez conectado, tus tareas programadas 
              enviarán automáticamente los informes generados a tu canal de Discord, mencionando si lo deseas a los responsables.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
