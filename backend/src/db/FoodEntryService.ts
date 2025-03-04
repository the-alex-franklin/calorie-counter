import { type Collection, type Db, ObjectId } from "mongodb";
import { z } from "zod";
import { UserService } from "./UserService.ts";

export const foodIngredientSchema = z.object({
	name: z.string(),
	calories: z.number(),
	percentage: z.number(),
});

export const foodEntryWriteSchema = z.object({
	name: z.string(),
	calories: z.number(),
	ingredients: z.array(foodIngredientSchema),
	imageUrl: z.string().optional(),
});

const foodEntryReadSchema = foodEntryWriteSchema.extend({
	_id: z.instanceof(ObjectId),
	userId: z.instanceof(ObjectId),
	createdAt: z.date(),
}).transform(({ _id, userId, ...rest }) => ({
	id: _id.toString(),
	userId: userId.toString(),
	...rest,
}));

// Types based on schemas
export type FoodIngredient = z.infer<typeof foodIngredientSchema>;
export type FoodEntryWrite = z.infer<typeof foodEntryWriteSchema>;
export type FoodEntryRead = z.infer<typeof foodEntryReadSchema>;

export class FoodEntryService {
	private static instance: FoodEntryService | null = null;
	private foodEntries: Collection<FoodEntryWrite>;
	private userService: UserService;

	private constructor(db: Db) {
		this.foodEntries = db.collection<FoodEntryWrite>("foodEntries");
		this.userService = UserService.getInstance(db);
	}

	public static getInstance(db: Db): FoodEntryService {
		FoodEntryService.instance ??= new FoodEntryService(db);
		return FoodEntryService.instance;
	}

	public async createFoodEntry(userId: string, data: FoodEntryWrite): Promise<FoodEntryRead> {
		const user = await this.userService.getUserById(userId);
		if (!user) throw new Error("User not found");

		const validData = foodEntryWriteSchema.parse(data);

		const foodEntry = {
			_id: new ObjectId(),
			userId: new ObjectId(user.id),
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
		const user = await this.userService.getUserById(userId);
		if (!user) throw new Error("User not found");

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const entries = await this.foodEntries
			.find({
				userId: new ObjectId(user.id),
				createdAt: {
					$gte: today,
				},
			})
			.sort({ createdAt: -1 })
			.toArray();

		return foodEntryReadSchema.array().parse(entries);
	}

	public async getPreviousFoodEntries(userId: string): Promise<FoodEntryRead[]> {
		const user = await this.userService.getUserById(userId);
		if (!user) throw new Error("User not found");

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const entries = await this.foodEntries
			.find({
				userId: new ObjectId(user.id),
				createdAt: {
					$lt: today,
				},
			})
			.sort({ createdAt: -1 })
			.toArray();

		return foodEntryReadSchema.array().parse(entries);
	}
}
