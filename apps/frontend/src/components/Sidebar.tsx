import { NavLink } from "react-router-dom";
import {
	Files,
	FileText,
	Clock,
	History,
	Settings as SettingsIcon,
	Shield,
	LayoutDashboard,
} from "lucide-react";

const Sidebar = () => {
	return (
		<aside className="sidebar">
			<div className="sidebar-logo">
				<Shield className="gradient-text" size={32} />
				<h2 className="gradient-text">Zentinel</h2>
			</div>

			<nav className="nav-links">
				<NavLink
					to="/dashboard"
					className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
				>
					<LayoutDashboard />
					<span>Dashboard</span>
				</NavLink>
				<NavLink
					to="/archivos"
					className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
				>
					<Files />
					<span>Archivos</span>
				</NavLink>

				<NavLink
					to="/informes"
					className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
				>
					<FileText />
					<span>Informes</span>
				</NavLink>

				<NavLink
					to="/tareas"
					className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
				>
					<Clock />
					<span>Tareas</span>
				</NavLink>

				<NavLink
					to="/historial"
					className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
				>
					<History />
					<span>Historial</span>
				</NavLink>

				<NavLink
					to="/configuracion"
					className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
				>
					<SettingsIcon />
					<span>Configuración</span>
				</NavLink>
			</nav>
		</aside>
	);
};

export default Sidebar;
