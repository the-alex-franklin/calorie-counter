import { z } from "zod";
import { setupTests } from "./utils/setupTests.ts";
import { perf } from "./utils/perf.ts";
import { foodIngredientSchema } from "../src/db/FoodEntryService.ts";
import chalk from "chalk";

chalk.level = 2;

Deno.test("food entry service", async (t) => {
	const { app, closeConnection } = await setupTests();

	let accessToken: string;
	let firstFoodEntryId: string;

	await t.step("setup - create user", async () => {
		const response = await app.request("/sign-up", {
			method: "POST",
			body: JSON.stringify({
				email: "food-test@example.com",
				password: "password123",
			}),
		});

		const data = await response.json();

		z.object({
			accessToken: z.string().regex(/^eyJ/),
			refreshToken: z.string().regex(/^eyJ/),
		}).parse(data);

		accessToken = data.accessToken;
	});

	await t.step("unauthorized access to food entries", async () => {
		const response = await perf("unauthorized", () => app.request("/api/food-entries"));

		const data = await response.json();

		z.object({
			error: z.literal("Unauthorized"),
		}).parse(data);
	});

	await t.step("create food entry", async () => {
		const testFoodEntry = {
			name: "Test Salad",
			calories: 350,
			ingredients: [
				{
					name: "Lettuce",
					calories: 15,
					percentage: 30,
				},
				{
					name: "Tomato",
					calories: 25,
					percentage: 20,
				},
				{
					name: "Chicken",
					calories: 200,
					percentage: 40,
				},
				{
					name: "Dressing",
					calories: 110,
					percentage: 10,
				},
			],
			imageUrl: "https://example.com/test-salad.jpg",
		};

		const response = await perf("create food entry", () =>
			app.request("/api/food-entries", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(testFoodEntry),
			}));

		const data = await response.json();

		const responseSchema = z.object({
			id: z.string(),
			userId: z.string(),
			name: z.literal(testFoodEntry.name),
			calories: z.literal(testFoodEntry.calories),
			ingredients: z.array(foodIngredientSchema).length(testFoodEntry.ingredients.length),
			imageUrl: z.string().optional(),
			createdAt: z.string().transform((str) => new Date(str)),
		});

		const validatedData = responseSchema.parse(data);

		firstFoodEntryId = validatedData.id;
	});

	await t.step("get all food entries", async () => {
		const response = await perf("get food entries", () =>
			app.request("/api/todays-food-entries", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}));

		const data = await response.json();

		const responseSchema = z.array(z.object({
			id: z.string(),
			userId: z.string(),
			name: z.string(),
			calories: z.number(),
			ingredients: z.array(foodIngredientSchema),
			imageUrl: z.string().optional(),
			createdAt: z.string().transform((str) => new Date(str)),
		}));

		const validatedEntries = responseSchema.parse(data);

		z.array(z.object({ id: z.string() }))
			.refine((entries) => entries.some((entry) => entry.id === firstFoodEntryId), {
				message: "Created food entry not found in the list",
			})
			.parse(validatedEntries);
	});

	await t.step("create second food entry", async () => {
		const testFoodEntry = {
			name: "Test Burger",
			calories: 650,
			ingredients: [
				{
					name: "Bun",
					calories: 150,
					percentage: 25,
				},
				{
					name: "Patty",
					calories: 350,
					percentage: 45,
				},
				{
					name: "Cheese",
					calories: 100,
					percentage: 15,
				},
				{
					name: "Sauce",
					calories: 50,
					percentage: 15,
				},
			],
		};

		const response = await perf("create second food entry", () =>
			app.request("/api/food-entries", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(testFoodEntry),
			}));

		const data = await response.json();

		const responseSchema = z.object({
			id: z.string(),
			userId: z.string(),
			name: z.literal(testFoodEntry.name),
			calories: z.literal(testFoodEntry.calories),
			ingredients: z.array(foodIngredientSchema).length(testFoodEntry.ingredients.length),
			imageUrl: z.string().optional(),
			createdAt: z.string().transform((str) => new Date(str)),
		});

		responseSchema.parse(data);
	});

	await t.step("validation error - invalid food entry", async () => {
		const invalidFoodEntry = {
			calories: "not a number",
			ingredients: "not an array",
		};

		const response = await perf("invalid food entry", () =>
			app.request("/api/food-entries", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(invalidFoodEntry),
			}));

		z.object({
			status: z.number().gte(400),
			ok: z.literal(false),
		}).parse(response);

		const data = await response.json();
		z.object({
			error: z.string(),
		}).parse(data);
	});

	await t.step("analyze food image", async () => {
		const imagePath = new URL("./images/peppercorn-steak-sandwich.jpeg", import.meta.url).pathname;
		const imageBuffer = await Deno.readFile(imagePath);

		const base64Image = "data:image/jpeg;base64," + btoa(
			new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""),
		);

		const response = await perf("analyze food image", () =>
			app.request("/api/analyze", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({
					image: base64Image,
				}),
			}));

		z.object({
			status: z.number().lte(299),
		}).parse(response);

		const data = await response.json();

		console.log(chalk.green("food test response:", JSON.stringify(data)));

		z.object({
			name: z.string(),
			calories: z.number(),
			ingredients: z.array(foodIngredientSchema),
		}).parse(data);
	});

	await t.step("analyze non-food image", async () => {
		const imagePath = new URL("./images/chair.jpg", import.meta.url).pathname;
		const imageBuffer = await Deno.readFile(imagePath);
		const mockBase64Image = "data:image/jpeg;base64," + btoa(
			new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""),
		);

		const response = await perf("analyze non-food image", () =>
			app.request("/api/analyze", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({
					image: mockBase64Image,
				}),
			}));

		const data = await response.json();

		console.log(chalk.green("Non-food test response:", JSON.stringify(data)));

		z.object({
			error: z.string().includes("No Food"),
		}).parse(data);
	});

	await closeConnection();
});
