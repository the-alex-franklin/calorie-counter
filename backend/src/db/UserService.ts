import { Db, ObjectId } from "mongodb";
import bcryptjs from "bcryptjs";
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

export type UserService = ReturnType<typeof createUserService>;

let instance: UserService | null = null;
export function getUserService(db: Db): UserService {
	instance ??= createUserService(db);
	return instance;
}

function createUserService(db: Db) {
	const users = db.collection<UserDocument>("users");

	return {
		async getUserById(id: string): Promise<UserRead> {
			const user = await users.findOne({ _id: new ObjectId(id) });
			return userReadSchema.parse(user);
		},

		async getUserByEmail(email: string): Promise<UserRead> {
			const user = await users.findOne({ email });
			return userReadSchema.parse(user);
		},

		async createUser({ email, password }: UserWrite): Promise<UserRead> {
			const existingUser = await users.findOne({ email });
			if (existingUser) throw new PlatformError("Email already exists", -1);

			const hashedPassword = await bcryptjs.hash(password, 10);
			const newUser = {
				_id: new ObjectId(),
				email,
				password: hashedPassword,
				role: "user" as const,
			};

			const result = await users.insertOne(newUser);
			const user = await users.findOne({ _id: result.insertedId });

			return userReadSchema.parse(user);
		},

		async comparePassword({ email, password }: UserWrite): Promise<UserRead> {
			const user = await users.findOne({ email });
			if (!user) throw new PlatformError("Unauthorized", 401);

			const isPasswordValid = await bcryptjs.compare(password, user.password);
			if (!isPasswordValid) throw new PlatformError("Unauthorized", 401);

			return userReadSchema.parse(user);
		},
	};
}
