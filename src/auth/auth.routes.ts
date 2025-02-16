import { Hono } from "hono";
import { z } from "zod";
import { dbProvider } from "../db/db.ts";
import { generateAccessToken, generateRefreshToken } from "./jwt.ts";
// @deno-types="npm:@types/bcryptjs"
import bcrypt from "npm:bcryptjs";

export function authRoutes(db: dbProvider) {
	const router = new Hono();

	const signUpSchema = z.object({
		email: z.string(),
		password: z.string(),
	});
	const signInSchema = signUpSchema;

	router.post("/sign-up", async (c) => {
		const json = await c.req.json();
		const { email, password } = signUpSchema.parse(json);

		const user = await db.createUser({ email, password });

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		return c.json({ accessToken, refreshToken });
	});

	router.post("/sign-in", async (c) => {
		const json = await c.req.json();
		const { email, password } = signInSchema.parse(json);

		const user = await db.getUser(email);
		if (!user) return c.json({ status: "error", message: "User not found" });

		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) return c.json({ status: "error", message: "Invalid password" });

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		return c.json({ accessToken, refreshToken });
	});

	router.post("/forgot-password", async (c) => {
		const json = await c.req.json();
		const { email } = z.object({ email: z.string() }).parse(json);

		const user = await db.getUser(email);
		if (!user) return c.json({ status: "error", message: "User not found" });

		// const token = generateAccessToken(user);
		// Send token via email
		return c.json({ status: "ok" });
	});

	return router;
}
