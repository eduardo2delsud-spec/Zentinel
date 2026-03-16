import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Folder, File, ChevronRight, Home, Search } from "lucide-react";

const API_BASE = "http://localhost:3001/api";

interface FileItem {
	name: string;
	path: string;
	isDirectory: boolean;
}

interface FileBrowserProps {
	onSelect: (path: string) => void;
	onClose: () => void;
}

const FileBrowser = ({ onSelect, onClose }: FileBrowserProps) => {
	const [currentDir, setCurrentDir] = useState("");
	const [files, setFiles] = useState<FileItem[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(false);

	const loadFiles = useCallback(async (dir: string) => {
		setLoading(true);
		try {
			const { data } = await axios.get(
				`${API_BASE}/fs/ls?dir=${encodeURIComponent(dir)}`,
			);
			setFiles(data);
			setCurrentDir(dir);
		} catch (error) {
			console.error("Error loading files", error);
		}
		setLoading(false);
	}, []);

	const loadRoot = useCallback(async () => {
		try {
			const { data } = await axios.get(`${API_BASE}/fs/root`);
			loadFiles(data.root);
		} catch (error) {
			console.error("Error loading root", error);
		}
	}, [loadFiles]);

	useEffect(() => {
		loadRoot();
	}, [loadRoot]);

	const handleDirClick = (path: string) => {
		loadFiles(path);
	};

	const filteredFiles = files.filter((f) =>
		f.name.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="modal-overlay">
			<div
				className="glass-card modal-content"
				style={{
					maxWidth: "600px",
					width: "90%",
					maxHeight: "80vh",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<div className="flex-between mb-2">
					<h3>📂 Explorador de Archivos</h3>
					<button className="secondary" onClick={onClose}>
						&times;
					</button>
				</div>

				<div
					className="flex-gap-1 mb-2"
					style={{
						background: "var(--bg-deep)",
						padding: "0.5rem",
						borderRadius: "8px",
						alignItems: "center",
					}}
				>
					<button
						type="button"
						className="secondary"
						onClick={loadRoot}
						title="Home"
					>
						<Home size={16} />
					</button>
					<div
						className="text-muted"
						style={{
							fontSize: "0.8rem",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							flex: 1,
						}}
					>
						{currentDir}
					</div>
					<button
						type="button"
						style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
						onClick={() => onSelect(currentDir)}
					>
						Seleccionar ubicación
					</button>
				</div>

				<div className="form-group mb-2">
					<div style={{ position: "relative" }}>
						<Search
							size={16}
							style={{
								position: "absolute",
								left: "10px",
								top: "50%",
								transform: "translateY(-50%)",
								color: "var(--text-muted)",
							}}
						/>
						<input
							style={{ paddingLeft: "35px" }}
							placeholder="Buscar archivo o carpeta..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>

				<div
					style={{
						flex: 1,
						overflowY: "auto",
						border: "1px solid var(--border-color)",
						borderRadius: "8px",
					}}
				>
					{loading ? (
						<div style={{ padding: "2rem", textAlign: "center" }}>
							Cargando...
						</div>
					) : (
						filteredFiles.map((file, idx) => (
							<div
								key={idx}
								className="file-item"
								onClick={() =>
									file.isDirectory
										? handleDirClick(file.path)
										: onSelect(file.path)
								}
								style={{
									display: "flex",
									alignItems: "center",
									padding: "0.8rem",
									cursor: "pointer",
									borderBottom: "1px solid var(--border-color)",
									transition: "background 0.2s",
								}}
							>
								{file.isDirectory ? (
									<Folder size={20} color="#6366f1" />
								) : (
									<File size={20} color="var(--text-muted)" />
								)}
								<span style={{ marginLeft: "1rem", flex: 1 }}>{file.name}</span>
								{file.isDirectory && (
									<ChevronRight size={16} color="var(--text-muted)" />
								)}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default FileBrowser;
