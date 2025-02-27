import { type Collection, type Db, ObjectId } from "mongodb";
// @deno-types="npm:@types/bcryptjs"
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

export class UserService {
	private static instance: UserService | null = null;
	private users: Collection<UserDocument>;

	private constructor(db: Db) {
		this.users = db.collection<UserDocument>("users");
	}

	public static getInstance(db: Db): UserService {
		UserService.instance ??= new UserService(db);
		return UserService.instance;
	}

	public async getUserById(id: string): Promise<UserRead> {
		const user = await this.users.findOne({ _id: new ObjectId(id) });
		return userReadSchema.parse(user);
	}

	public async getUserByEmail(email: string): Promise<UserRead> {
		const user = await this.users.findOne({ email });
		return userReadSchema.parse(user);
	}

	public async createUser({ email, password }: UserWrite): Promise<UserRead> {
		const existingUser = await this.users.findOne({ email });
		if (existingUser) throw new PlatformError("Email already exists", -1);

		const hashedPassword = await bcryptjs.hash(password, 8);
		const newUser = {
			_id: new ObjectId(),
			email,
			password: hashedPassword,
			role: "user" as const,
		};

		const { insertedId } = await this.users.insertOne(newUser);
		const user = await this.users.findOne({ _id: insertedId });

		return userReadSchema.parse(user);
	}

	public async comparePassword({ email, password }: UserWrite): Promise<UserRead> {
		const user = await this.users.findOne({ email });
		if (!user) throw new PlatformError("Unauthorized", 401);

		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) throw new PlatformError("Unauthorized", 401);

		return userReadSchema.parse(user);
	}
}
