// In dev mode (localhost): use http://localhost:3667/api
// In Docker (nginx proxy): use /api (relative, nginx proxies to backend)
const isLocalDev =
	import.meta.env.DEV &&
	(window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1");

export const API_BASE = isLocalDev ? "http://localhost:3667/api" : "/api";