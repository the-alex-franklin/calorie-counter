import { MongoClient } from "mongodb";
import { createApp } from "../../src/app.ts";

export async function setupTests() {
	const client = await new MongoClient("mongodb://localhost:27017").connect();
	const db = client.db("calorie-counter-test-db");
	const app = createApp({ db });

	return {
		app,
		async closeConnection() {
			await db.dropDatabase();
			await client.close();
		},
	};
}
