import { Hono } from "hono";
import { z } from "zod";
import { env } from "../env.ts";
import { generateAccessToken, generateRefreshToken } from "./jwt.ts";
// @deno-types="npm:@types/bcryptjs"
import bcrypt from "npm:bcryptjs";
import { setSignedCookie } from "hono/cookie";
import { userModel } from "../db/UserModel.ts";

export function authRoutes() {
	const router = new Hono();

	const signUpSchema = z.object({
		email: z.string().email(),
		password: z.string(),
	});
	const signInSchema = signUpSchema;

	router.post("/sign-up", async (c) => {
		const json = await c.req.json();
		const { email, password } = signUpSchema.parse(json);

		const user = await userModel.createUser({ email, password });

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		await setSignedCookie(c, "accessToken", accessToken, env.COOKIE_SECRET, {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			maxAge: 60 * 15,
		});

		await setSignedCookie(c, "refreshToken", refreshToken, env.COOKIE_SECRET, {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			maxAge: 60 * 60 * 24 * 7,
		});

		return c.json({ message: "Signed up and logged in" });
	});

	router.post("/sign-in", async (c) => {
		const json = await c.req.json();
		const { email, password } = signInSchema.parse(json);

		const user = await userModel.getUserByEmail(email);
		if (!user) return c.json({ status: "error", message: "User not found" });

		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) return c.json({ status: "error", message: "Invalid password" });

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		await setSignedCookie(c, "accessToken", accessToken, env.COOKIE_SECRET, {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			maxAge: 60 * 15,
		});

		await setSignedCookie(c, "refreshToken", refreshToken, env.COOKIE_SECRET, {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			maxAge: 60 * 60 * 24 * 7,
		});

		return c.json({ message: "Logged in" });
	});

	router.post("/forgot-password", async (c) => {
		const json = await c.req.json();
		const { email } = z.object({ email: z.string() }).parse(json);

		const user = await userModel.getUserByEmail(email);
		if (!user) return c.json({ status: "error", message: "User not found" });

		return c.json({ status: "ok" });
	});

	return router;
}
