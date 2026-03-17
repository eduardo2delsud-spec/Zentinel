// In dev mode (localhost): use http://localhost:3001/api
// In Docker (nginx proxy): use /api (relative, nginx proxies to backend)
const isLocalDev =
	typeof window !== "undefined" &&
	(window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1") &&
	window.location.port === "5173";

export const API_BASE = isLocalDev
	? "http://localhost:3001/api"
	: "/api";
