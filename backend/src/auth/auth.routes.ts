import { Hono } from "hono";
import { z } from "zod";
import { generateAccessToken, generateRefreshToken } from "./jwt.ts";
import { UserService } from "../db/UserService.ts";

export function authRoutes(userService: UserService) {
	const router = new Hono();

	const signUpSchema = z.object({
		email: z.string().email().refine((email) => {
			/* email addresses have some weird rules for what's valid.
			Most of the weirdness happens inside quotes,
			so I'm just invalidating email addresses with quotes */
			if (email.match('"')) return false;
			return true;
		}).transform((email) => {
			const [name, domain] = email.toLowerCase().split("@");
			const name_without_periods = name!.replaceAll(/\./g, "");
			return name_without_periods + "@" + domain;
		}),
		password: z.string(),
	});
	const signInSchema = signUpSchema;

	router.post("/sign-up", async (c) => {
		const json = await c.req.json();
		const { email, password } = signUpSchema.parse(json);

		const user = await userService.createUser({ email, password });

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		return c.json({ accessToken, refreshToken });
	});

	router.post("/sign-in", async (c) => {
		const json = await c.req.json();
		const { email, password } = signInSchema.parse(json);

		const user = await userService.comparePassword({ email, password });

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		return c.json({ accessToken, refreshToken });
	});

	router.post("/forgot-password", async (c) => {
		const json = await c.req.json();
		const { email } = z.object({ email: z.string() }).parse(json);

		const user = await userService.getUserByEmail(email);
		if (!user) return c.json({ status: "error", message: "User not found" });

		return c.json({ status: "ok" });
	});

	router.post("/token-refresh", async (c) => {
		const json = await c.req.json();
		const { refreshToken } = z.object({ refreshToken: z.string() }).parse(json);

		const user = await userService.getUserById(refreshToken);
		if (!user) return c.json({ status: "error", message: "User not found" });

		const accessToken = generateAccessToken(user);
		const newRefreshToken = generateRefreshToken(user);

		return c.json({ accessToken, refreshToken: newRefreshToken });
	});

	return router;
}
