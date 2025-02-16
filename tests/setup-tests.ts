import { App } from "../src/index.ts";

export async function setupTests() {
	const kv = await Deno.openKv("calorie-counter-test-db");
	const keys = kv.list({ prefix: [] });
	for await (const entry of keys) {
		await kv.delete(entry.key);
	}

	const { app, db } = new App({ kv });
	return { app, db };
}
