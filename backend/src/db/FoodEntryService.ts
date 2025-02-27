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
			// Validate userId
			if (!userId || typeof userId !== 'string') {
				throw new PlatformError("Invalid user ID", 400);
			}
			
			// Validate data
			if (!data || typeof data !== 'object') {
				throw new PlatformError("Invalid food entry data", 400);
			}
			
			// Check required fields
			if (!data.name || typeof data.name !== 'string') {
				throw new PlatformError("Food name is required", 400);
			}
			
			if (typeof data.calories !== 'number' || isNaN(data.calories)) {
				throw new PlatformError("Valid calories value is required", 400);
			}
			
			if (!Array.isArray(data.ingredients)) {
				throw new PlatformError("Ingredients must be an array", 400);
			}
			
			// Convert userId to ObjectId safely
			let userObjectId: ObjectId;
			try {
				userObjectId = new ObjectId(userId);
			} catch (err) {
				throw new PlatformError("Invalid user ID format", 400);
			}
			
			const foodEntry = {
				_id: new ObjectId(),
				userId: userObjectId,
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
			if (error instanceof PlatformError) {
				throw error;
			}
			throw new PlatformError("Failed to create food entry", 500);
		}
	}

	public async getFoodEntries(userId: string): Promise<FoodEntry[]> {
		try {
			// Handle invalid userId gracefully
			if (!userId || typeof userId !== 'string') {
				console.warn("Invalid userId provided to getFoodEntries:", userId);
				return [];
			}
			
			// Use a try-catch for the ObjectId conversion to handle invalid IDs
			let userObjectId: ObjectId;
			try {
				userObjectId = new ObjectId(userId);
			} catch (err) {
				console.warn("Invalid ObjectId format for userId:", userId);
				return [];
			}
			
			const entries = await this.foodEntries
				.find({ userId: userObjectId })
				.sort({ date: -1 })
				.toArray();

			return entries || []; // Ensure we always return an array
		} catch (error) {
			console.error("Error getting food entries:", error);
			// Return empty array instead of throwing to handle gracefully
			return [];
		}
	}

	public async getFoodEntriesByDate(userId: string, date: Date): Promise<FoodEntry[]> {
		try {
			// Handle invalid userId gracefully
			if (!userId || typeof userId !== 'string') {
				console.warn("Invalid userId provided to getFoodEntriesByDate:", userId);
				return [];
			}
			
			// Handle invalid date
			if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
				console.warn("Invalid date provided to getFoodEntriesByDate:", date);
				return [];
			}
			
			// Use a try-catch for the ObjectId conversion to handle invalid IDs
			let userObjectId: ObjectId;
			try {
				userObjectId = new ObjectId(userId);
			} catch (err) {
				console.warn("Invalid ObjectId format for userId:", userId);
				return [];
			}
			
			// Create start and end of the provided date
			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);

			const entries = await this.foodEntries
				.find({
					userId: userObjectId,
					date: {
						$gte: startOfDay,
						$lte: endOfDay,
					},
				})
				.sort({ date: -1 })
				.toArray();

			return entries || []; // Ensure we always return an array
		} catch (error) {
			console.error("Error getting food entries by date:", error);
			// Return empty array instead of throwing to handle gracefully
			return [];
		}
	}
}
