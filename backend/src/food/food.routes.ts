import { Hono } from "hono";
import { z } from "zod";
import { UserService } from "../db/UserService.ts";
import { PlatformError } from "../errors/platform.error.ts";
import { analyzeImage, type FoodEntryCreate, type FoodIngredient } from "../vision/vision-api.ts";
import type { JWT_Payload } from "../auth/auth.middleware.ts";

export const foodRoutes = (userService: UserService) => {
	const router = new Hono<JWT_Payload>();

	// Analyze food image
	router.post("/analyze", async (c) => {
		try {
			const { id } = c.get("jwtPayload");

			const body = await c.req.json();
			const { image } = z.object({
				image: z.string(),
			}).parse(body);

			const foodAnalysis = await analyzeImage(image);
			return c.json(foodAnalysis);
		} catch (error) {
			console.error("Error in /analyze:", error);
			if (error instanceof PlatformError) {
				return c.json({ error: error.message }, error.code);
			}
			return c.json({ error: "Failed to analyze image" }, 500);
		}
	});

	// Save food entry
	router.post("/food-entries", async (c) => {
		try {
			const { id } = c.get("jwtPayload");

			const body = await c.req.json();
			const data = z.object({
				name: z.string(),
				calories: z.number(),
				ingredients: z.array(z.object({
					name: z.string(),
					calories: z.number(),
					percentage: z.number(),
				})),
				imageUrl: z.string().optional(),
			}).parse(body);

			const foodEntry = await userService.createFoodEntry(id, data);
			return c.json(foodEntry);
		} catch (error) {
			console.error("Error in /food-entries:", error);
			if (error instanceof PlatformError) {
				return c.json({ error: error.message }, error.code);
			}
			return c.json({ error: "Failed to save food entry" }, 500);
		}
	});

	// Get all food entries
	router.get("/food-entries", async (c) => {
		try {
			const { id } = c.get("jwtPayload");
			const foodEntries = await userService.getFoodEntries(id);
			return c.json(foodEntries);
		} catch (error) {
			console.error("Error in GET /food-entries:", error);
			if (error instanceof PlatformError) {
				return c.json({ error: error.message }, error.code);
			}
			return c.json({ error: "Failed to get food entries" }, 500);
		}
	});

	// Get food entries by date
	router.get("/food-entries/date/:date", async (c) => {
		try {
			const { id } = c.get("jwtPayload");
			const dateParam = c.req.param("date");
			const date = new Date(dateParam);

			if (isNaN(date.getTime())) {
				throw new PlatformError("Invalid date format. Use YYYY-MM-DD.", 400);
			}

			const foodEntries = await userService.getFoodEntriesByDate(id, date);
			return c.json(foodEntries);
		} catch (error) {
			console.error("Error in GET /food-entries/date:", error);
			if (error instanceof PlatformError) {
				return c.json({ error: error.message }, error.code);
			}
			return c.json({ error: "Failed to get food entries for date" }, 500);
		}
	});

	return router;
};
