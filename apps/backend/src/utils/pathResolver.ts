import path from "node:path";

/**
 * Translates a Windows path to a Docker-mounted path when running in production.
 * Based on docker-compose volume: C:\Users\edu\Desktop:/root
 *
 * Example:
 *   Windows: C:\Users\edu\Desktop\DelSud\Desarrollos\project\CHANGELOG.md
 *   Docker:  /root/DelSud/Desarrollos/project/CHANGELOG.md
 */

const WINDOWS_MOUNT_SOURCE = "C:\\Users\\edu\\Desktop";
const DOCKER_MOUNT_TARGET = "/root";

const isDocker = process.env.NODE_ENV === "production";

export function resolvePath(inputPath: string): string {
	if (!inputPath) return inputPath;

	// Normalize double backslashes first
	let normalized = inputPath.replace(/\\\\/g, "\\");

	if (isDocker) {
		// --- DOCKER MODE: Translate Windows -> Docker ---
		if (normalized.startsWith("/")) return normalized; // Already Unix-style

		const lowerNormalized = normalized.toLowerCase();
		const lowerMount = WINDOWS_MOUNT_SOURCE.toLowerCase();

		if (lowerNormalized.startsWith(lowerMount)) {
			const relativePart = normalized.substring(WINDOWS_MOUNT_SOURCE.length);
			const posixRelative = relativePart.replace(/\\/g, "/");
			return path.posix.join(DOCKER_MOUNT_TARGET, posixRelative);
		}

		// Handle forward-slash Windows paths (C:/Users/...)
		const forwardSlashMount = WINDOWS_MOUNT_SOURCE.replace(/\\/g, "/");
		if (lowerNormalized.startsWith(forwardSlashMount.toLowerCase())) {
			const relativePart = normalized.substring(forwardSlashMount.length);
			return path.posix.join(DOCKER_MOUNT_TARGET, relativePart);
		}
	} else {
		// --- LOCAL MODE: Translate Docker -> Windows ---
		if (normalized.startsWith(DOCKER_MOUNT_TARGET)) {
			const relativePart = normalized.substring(DOCKER_MOUNT_TARGET.length);
			const windowsRelative = relativePart.replace(/\//g, "\\");
			return path.join(WINDOWS_MOUNT_SOURCE, windowsRelative);
		}
	}

	return normalized;
}
