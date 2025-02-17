import { Collection, Db, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { PlatformError } from "../errors/platform.error.ts";

const userWriteSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

const userReadSchema = z.object({
	_id: z.instanceof(ObjectId),
	email: z.string().email(),
	role: z.enum(["admin", "user"]),
}).transform(({ _id, ...rest }) => ({ ...rest, id: _id.toString() }));

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
		if (!user) throw new PlatformError("Unauthorized", 401);

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) throw new PlatformError("Unauthorized", 401);

		return userReadSchema.parse(user);
	}

	async getUserById(id: string): Promise<UserRead> {
		const user = await this.collection.findOne({ _id: new ObjectId(id) });
		return userReadSchema.parse(user);
	}

	async getUserByEmail(email: string): Promise<UserRead> {
		const user = await this.collection.findOne({ email });
		return userReadSchema.parse(user);
	}

	async createUser({ email, password }: UserWrite): Promise<UserRead> {
		const existingUser = await this.collection.findOne({ email });
		if (existingUser) throw new PlatformError("Bad Request", 400);

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = {
			email,
			password: hashedPassword,
			role: "user" as const,
		};

		// @ts-ignore -
		const result = await this.collection.insertOne(newUser);
		return userReadSchema.parse({ _id: result.insertedId, email, role: "user" });
	}
}
