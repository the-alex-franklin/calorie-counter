import { type Collection, type Db, ObjectId } from "mongodb";
import { z } from "zod";

// Ingredient schema for reuse
export const foodIngredientSchema = z.object({
	name: z.string(),
	calories: z.number(),
	percentage: z.number(),
});

// Schema for validating incoming food data
export const foodEntryBaseSchema = z.object({
	name: z.string(),
	calories: z.number(),
	ingredients: z.array(foodIngredientSchema),
	imageUrl: z.string().optional(),
});

// Schema for food entry writing to DB
const foodEntryWriteSchema = foodEntryBaseSchema.extend({
	_id: z.instanceof(ObjectId),
	userId: z.instanceof(ObjectId),
	createdAt: z.date(),
});

// Schema for reading from DB - transforms ObjectId to string id
const foodEntryReadSchema = foodEntryWriteSchema.transform(({ _id, userId, ...rest }) => ({
	id: _id.toString(),
	userId: userId.toString(),
	...rest,
}));

// Schema for validating userIds
const userIdSchema = z.string().refine((id) => ObjectId.isValid(id), {
	message: "Invalid user ID format",
});

// Types based on schemas
export type FoodIngredient = z.infer<typeof foodIngredientSchema>;
export type FoodEntryBase = z.infer<typeof foodEntryBaseSchema>;
export type FoodEntryWrite = z.infer<typeof foodEntryWriteSchema>;
export type FoodEntryRead = z.infer<typeof foodEntryReadSchema>;

export class FoodEntryService {
	private static instance: FoodEntryService | null = null;
	private foodEntries: Collection<FoodEntryWrite>;

	private constructor(db: Db) {
		this.foodEntries = db.collection<FoodEntryWrite>("foodEntries");
	}

	public static getInstance(db: Db): FoodEntryService {
		FoodEntryService.instance ??= new FoodEntryService(db);
		return FoodEntryService.instance;
	}

	public async createFoodEntry(userId: string, data: FoodEntryBase): Promise<FoodEntryRead> {
		const validUserId = userIdSchema.parse(userId);
		const validData = foodEntryBaseSchema.parse(data);

		const foodEntry = {
			_id: new ObjectId(),
			userId: new ObjectId(validUserId),
			name: validData.name,
			calories: validData.calories,
			ingredients: validData.ingredients,
			imageUrl: validData.imageUrl,
			createdAt: new Date(),
		};

		await this.foodEntries.insertOne(foodEntry);
		return foodEntryReadSchema.parse(foodEntry);
	}

	public async getTodaysFoodEntries(userId: string): Promise<FoodEntryRead[]> {
		const validUserId = userIdSchema.parse(userId);

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const entries = await this.foodEntries
			.find({
				userId: new ObjectId(validUserId),
				createdAt: {
					$gte: today,
				},
			})
			.sort({ createdAt: -1 })
			.toArray();

		return foodEntryReadSchema.array().parse(entries);
	}

	public async getPreviousFoodEntries(userId: string): Promise<FoodEntryRead[]> {
		const validUserId = userIdSchema.parse(userId);

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const tenDaysAgo = new Date(today);
		tenDaysAgo.setDate(today.getDate() - 10);

		const entries = await this.foodEntries
			.find({
				userId: new ObjectId(validUserId),
				createdAt: {
					$gte: tenDaysAgo,
					$lt: today,
				},
			})
			.sort({ createdAt: -1 })
			.toArray();

		return foodEntryReadSchema.array().parse(entries);
	}
}
