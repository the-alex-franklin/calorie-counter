import { Hono } from "hono";
import { z } from "zod";
import { decodeRefreshToken, generateAccessToken, generateRefreshToken } from "./jwt.ts";
import type { UserService } from "../db/UserService.ts";

const authRequestSchema = z.object({
	email: z.string().email().refine((email) => {
		/* email addresses have some weird rules for what's valid.
		Most of the weirdness happens inside quotes,
		so I'm just invalidating email addresses with quotes */
		if (email.match('"')) return false;
		return true;
	}).transform((email) => {
		/* here I'm removing periods before the @, because those are ignored by the DNS when sending an email */
		const [name, domain] = email.toLowerCase().split("@") as [string, string];
		const name_without_periods = name.replaceAll(/\./g, "");
		return name_without_periods + "@" + domain;
	}),
	password: z.string(),
});

export function authRoutes(userService: UserService) {
	const router = new Hono();

	router.post("/sign-up", async (c) => {
		const json = await c.req.json();
		const { email, password } = authRequestSchema.parse(json);

		const user = await userService.createUser({ email, password });

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		return c.json({ accessToken, refreshToken });
	});

	router.post("/sign-in", async (c) => {
		const json = await c.req.json();
		const { email, password } = authRequestSchema.parse(json);

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
		const id = z.object({ refreshToken: z.string() })
			.transform(({ refreshToken }) => decodeRefreshToken(refreshToken).id)
			.parse(json);

		const user = await userService.getUserById(id);
		if (!user) return c.json({ status: "error", message: "User not found" });

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		return c.json({ accessToken, refreshToken });
	});

	return router;
}
