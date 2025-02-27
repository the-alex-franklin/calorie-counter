import { type Collection, type Db, ObjectId } from "mongodb";
import { z } from "zod";
import { PlatformError } from "../errors/platform.error.ts";
import type { FoodEntryCreate, FoodIngredient } from "../vision/vision-api.ts";

// Schema for food entry
const foodEntrySchema = z.object({
	_id: z.instanceof(ObjectId),
	userId: z.instanceof(ObjectId),
	name: z.string(),
	calories: z.number(),
	ingredients: z.array(z.object({
		name: z.string(),
		calories: z.number(),
		percentage: z.number(),
	})),
	imageUrl: z.string().optional(),
	date: z.date(),
});

type FoodEntry = z.infer<typeof foodEntrySchema>;

export class FoodEntryService {
	private static instance: FoodEntryService | null = null;
	private foodEntries: Collection<FoodEntry>;

	private constructor(db: Db) {
		this.foodEntries = db.collection<FoodEntry>("foodEntries");
	}

	public static getInstance(db: Db): FoodEntryService {
		FoodEntryService.instance ??= new FoodEntryService(db);
		return FoodEntryService.instance;
	}

	public async createFoodEntry(userId: string, data: FoodEntryCreate): Promise<FoodEntry> {
		try {
			const foodEntry = {
				_id: new ObjectId(),
				userId: new ObjectId(userId),
				name: data.name,
				calories: data.calories,
				ingredients: data.ingredients,
				imageUrl: data.imageUrl,
				date: new Date(),
			};

			await this.foodEntries.insertOne(foodEntry);
			return foodEntry;
		} catch (error) {
			console.error("Error creating food entry:", error);
			throw new PlatformError("Failed to create food entry", 500);
		}
	}

	public async getFoodEntries(userId: string): Promise<FoodEntry[]> {
		try {
			const entries = await this.foodEntries
				.find({ userId: new ObjectId(userId) })
				.sort({ date: -1 })
				.toArray();

			return entries;
		} catch (error) {
			console.error("Error getting food entries:", error);
			throw new PlatformError("Failed to get food entries", 500);
		}
	}

	public async getFoodEntriesByDate(userId: string, date: Date): Promise<FoodEntry[]> {
		try {
			// Create start and end of the provided date
			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);

			const entries = await this.foodEntries
				.find({
					userId: new ObjectId(userId),
					date: {
						$gte: startOfDay,
						$lte: endOfDay,
					},
				})
				.sort({ date: -1 })
				.toArray();

			return entries;
		} catch (error) {
			console.error("Error getting food entries by date:", error);
			throw new PlatformError("Failed to get food entries for the specified date", 500);
		}
	}
}
