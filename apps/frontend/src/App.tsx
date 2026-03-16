import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Informes from "./pages/Informes";
import Configuracion from "./pages/Configuracion";
import { Proyecto, Tareas, DiscordSettings } from "./pages/Sections";
import "./index.css";

function App() {
	return (
		<Router>
			<div className="app-layout">
				<Sidebar />
				<main className="main-content">
					<Routes>
						<Route path="/" element={<Navigate to="/dashboard" replace />} />
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/proyecto" element={<Proyecto />} />
						<Route path="/informes" element={<Informes />} />
						<Route path="/tareas" element={<Tareas />} />
						<Route path="/discord" element={<DiscordSettings />} />
						<Route path="/configuracion" element={<Configuracion />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}

export default App;
