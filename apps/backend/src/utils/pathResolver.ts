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
	if (!isDocker) return inputPath;
	if (!inputPath) return inputPath;

	// If it's already a Unix-style path, return as-is
	if (inputPath.startsWith("/")) return inputPath;

	// Normalize double backslashes
	let normalized = inputPath.replace(/\\\\/g, "\\");

	// Check if it's a Windows-style path matching our mount (case-insensitive)
	const lowerNormalized = normalized.toLowerCase();
	const lowerMount = WINDOWS_MOUNT_SOURCE.toLowerCase();

	if (lowerNormalized.startsWith(lowerMount)) {
		const relativePart = normalized.substring(WINDOWS_MOUNT_SOURCE.length);
		const posixRelative = relativePart.replace(/\\/g, "/");
		return path.posix.join(DOCKER_MOUNT_TARGET, posixRelative);
	}

	// Also handle forward-slash Windows paths (C:/Users/edu/Desktop/...)
	const forwardSlashMount = WINDOWS_MOUNT_SOURCE.replace(/\\/g, "/");
	if (lowerNormalized.startsWith(forwardSlashMount.toLowerCase())) {
		const relativePart = normalized.substring(forwardSlashMount.length);
		return path.posix.join(DOCKER_MOUNT_TARGET, relativePart);
	}

	return inputPath;
}
