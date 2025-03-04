import { z } from "zod";
import { setupTests } from "./utils/setupTests.ts";

Deno.test("auth", async (t) => {
	const { app, closeConnection } = await setupTests();

	let accessToken: string;

	await t.step("unauthorized", async () => {
		const response = await app.request("/me");

		const data = await response.json();

		z.object({
			error: z.literal("Unauthorized"),
		}).parse(data);
	});

	await t.step("sign-up", async () => {
		const response = await app.request("/sign-up", {
			method: "POST",
			body: JSON.stringify({
				email: "Alex@email.com",
				password: "123456",
			}),
		});

		const data = await response.json();

		z.object({
			accessToken: z.string().regex(/^eyJ/),
			refreshToken: z.string().regex(/^eyJ/),
		}).parse(data);
	});

	await t.step("sign-in", async () => {
		const response = await app.request("/sign-in", {
			method: "POST",
			body: JSON.stringify({
				email: "Alex@email.com",
				password: "123456",
			}),
		});

		const data = await response.json();

		z.object({
			accessToken: z.string().regex(/^eyJ/),
			refreshToken: z.string().regex(/^eyJ/),
		}).parse(data);

		accessToken = data.accessToken;
	});

	await t.step("authorized", async () => {
		const response = await app.request("/me", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const data = await response.json();

		z.object({
			email: z.string().email(),
			id: z.string(),
			role: z.literal("user"),
		}).parse(data);
	});

	await closeConnection();
});
