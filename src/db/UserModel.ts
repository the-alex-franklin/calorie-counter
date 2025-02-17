import { z } from "zod";
import bcrypt from "npm:bcryptjs";
import mongoose, { Schema, Types } from "npm:mongoose";
import { BaseDocument, BaseModel } from "./BaseModel.ts";

// ✅ Schema for writing (creating) users (no `id` yet)
const userWriteSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

// ✅ Zod validator for MongoDB ObjectId (ensures it's always a valid ObjectId)
const objectIdSchema = z.custom<mongoose.Types.ObjectId>(
	(val) => mongoose.isValidObjectId(val),
	{ message: "Invalid ObjectId" },
);

// ✅ Schema for reading (retrieved from DB) users (`id` included)
const userReadSchema = userWriteSchema.extend({
	_id: objectIdSchema,
	role: z.enum(["admin", "user"]),
}).transform((data) => {
	const transformed_data = { ...data, id: data._id.toString() };
	// @ts-ignore -
	delete transformed_data._id;
	return transformed_data;
});

export type UserWrite = z.infer<typeof userWriteSchema>; // Type for creating users
export type UserRead = z.infer<typeof userReadSchema>; // Type for fetched users

// ✅ Define User Document Type (inherits from BaseDocument)
export type UserDocument = BaseDocument & {
	email: string;
	password: string;
	role: "admin" | "user";
};

// ✅ Define Mongoose Schema
const userSchema = new Schema<UserDocument>({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, enum: ["admin", "user"], default: "user" },
});

// ✅ User Model (inherits from BaseModel)
export class UserModel extends BaseModel<UserDocument> {
	constructor() {
		super("User", userSchema);
	}

	getUserById(id: string) {
		return this.model.findById(id);
	}

	// ✅ Fetch user by ID (returns `UserRead` type)
	async getUserByEmail(email: string): Promise<UserRead> {
		const user = await this.model.findOne({ email }).lean();
		return userReadSchema.parse(user);
	}

	// ✅ Create a new user (returns `UserRead` type)
	async createUser(data: UserWrite): Promise<UserRead> {
		const userExists = await this.model.exists({ email: data.email });
		if (userExists) throw new Error("User already exists");

		const hashedPassword = await bcrypt.hash(data.password, 10);
		const user = await this.model.create({ ...data, password: hashedPassword });

		const answer = userReadSchema.parse(user.toObject());
		return answer;
	}
}

// ✅ Export User Model
export const userModel = new UserModel();
