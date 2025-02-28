import { Hono } from "hono";
import { z } from "zod";
import { FoodEntryService } from "../db/FoodEntryService.ts";
import { analyzeImage } from "../vision/vision-api.ts";
import type { JWTPayload } from "../auth/auth.middleware.ts";

export const foodRoutes = (foodEntryService: FoodEntryService) => {
	const router = new Hono<JWTPayload>();

	router.post("/analyze", async (c) => {
		const body = await c.req.json();
		const { image } = z.object({
			image: z.string(),
		}).parse(body);

		const foodAnalysis = await analyzeImage(image);
		return c.json(foodAnalysis);
	});

	router.post("/food-entries", async (c) => {
		const { id } = c.get("jwtPayload");
		const body = await c.req.json();

		const foodEntry = await foodEntryService.createFoodEntry(id, body);
		return c.json(foodEntry);
	});

	router.get("/todays-food-entries", async (c) => {
		const { id } = c.get("jwtPayload");
		const foodEntries = await foodEntryService.getTodaysFoodEntries(id);
		return c.json(foodEntries);
	});

	router.get("/previous-food-entries", async (c) => {
		const { id } = c.get("jwtPayload");
		const foodEntries = await foodEntryService.getPreviousFoodEntries(id);
		return c.json(foodEntries);
	});

	return router;
};
