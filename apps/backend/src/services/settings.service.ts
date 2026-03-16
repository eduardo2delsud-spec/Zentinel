import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { settings } from "../db/schema.js";

export class SettingsService {
	static async get(key: string): Promise<string | null> {
		try {
			const result = await db
				.select()
				.from(settings)
				.where(eq(settings.key, key))
				.get();
			return result?.value || null;
		} catch (_error) {
			return null;
		}
	}

	static async set(key: string, value: string): Promise<void> {
		await db
			.insert(settings)
			.values({ key, value, updatedAt: new Date() })
			.onConflictDoUpdate({
				target: settings.key,
				set: { value, updatedAt: new Date() },
			});
	}

	static async getAll() {
		return await db.select().from(settings);
	}
}
