import { z } from "zod";
// @deno-types="npm:@types/bcryptjs"
import bcrypt from "npm:bcryptjs";
import { Try } from "fp-try";

// Define the schema
const userSchema = z.object({
	id: z.string(),
	email: z.string(),
	password: z.string(),
	role: z.enum(["admin", "user"]),
});

export type User = z.infer<typeof userSchema>;

export class dbProvider {
	constructor(private kv: Deno.Kv) {}

	async getUser(email: string): Promise<User> {
		const user = await this.kv.get(["users", email]);
		return userSchema.parse(user.value);
	}

	async createUser({ email, password }: { email: string; password: string }): Promise<User> {
		const userExists = (await Try(() => this.getUser(email))).success;
		if (userExists) throw new Error("User already exists");

		const id: string = crypto.randomUUID();
		const hashedPassword = await bcrypt.hash(password, 10);

		const user: User = { id, email, password: hashedPassword, role: "user" };
		await this.kv.set(["users", email], user);

		return user;
	}
}
