import mongoose from "mongoose";
import { App } from "../src/index.ts"; // Adjust path as needed
import { afterAll } from "jsr:@std/testing/bdd";

export async function setupTests() {
	// ✅ Connect to MongoDB test instance
	await mongoose.connect("mongodb://localhost:27017/calorie-counter-test-db");

	// ✅ Wipe the database before tests
	await mongoose.connection.db.dropDatabase();

	// ✅ Initialize the app with the fresh DB connection
	return new App();

	// ✅ Cleanup function to drop the DB after all tests
	// afterAll(async () => {
	// 	await mongoose.connection.db.dropDatabase(); // Remove all data
	// 	await mongoose.connection.close(); // Close the connection
	// });

	// return { app };
}
