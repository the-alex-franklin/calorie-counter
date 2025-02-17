import { Collection, Db, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userWriteSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

const userReadSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	role: z.enum(["admin", "user"]),
});

type UserWrite = z.infer<typeof userWriteSchema>;
type UserRead = z.infer<typeof userReadSchema>;

type UserDocument = {
	_id: ObjectId;
	email: string;
	password: string;
	role: "admin" | "user";
};

export class UserService {
	collection: Collection<UserDocument>;

	constructor(db: Db) {
		this.collection = db.collection<UserDocument>("users");
	}

	async comparePassword({ email, password }: UserWrite): Promise<UserRead> {
		const user = await this.collection.findOne({ email });
		if (!user) throw new Error("Unauthorized");

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) throw new Error("Unauthorized");

		return userReadSchema.parse({ id: user._id.toString(), email: user.email, role: user.role });
	}

	async getUserById(id: string): Promise<UserRead> {
		const user = await this.collection.findOne({ _id: new ObjectId(id) });
		if (!user) throw new Error("User not found");

		return userReadSchema.parse({ id: user._id.toString(), email: user.email, role: user.role });
	}

	async getUserByEmail(email: string): Promise<UserRead> {
		const user = await this.collection.findOne({ email });
		if (!user) throw new Error("User not found");

		return userReadSchema.parse({ id: user._id.toString(), email: user.email, role: user.role });
	}

	async createUser({ email, password }: UserWrite): Promise<UserRead> {
		const existingUser = await this.collection.findOne({ email });
		if (existingUser) throw new Error("User already exists");

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = {
			email,
			password: hashedPassword,
			role: "user" as const,
		};

		// @ts-ignore -
		const result = await this.collection.insertOne(newUser);
		return userReadSchema.parse({ id: result.insertedId.toString(), email, role: "user" });
	}
}
