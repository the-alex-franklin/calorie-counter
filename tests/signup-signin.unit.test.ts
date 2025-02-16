import { z } from "zod";
import { setupTests } from "./setup-tests.ts";

const { app } = await setupTests();

Deno.test("sign-up", async () => {
	const response = await app.request("http://localhost:3000/sign-up", {
		method: "POST",
		body: JSON.stringify({
			email: "Alex@email.com",
			password: "123456",
		}),
	});

	const data = await response.json();

	z.object({
		message: z.string(),
	}).parse(data);
});

Deno.test("sign-in", async () => {
	const response = await app.request("http://localhost:3000/sign-in", {
		method: "POST",
		body: JSON.stringify({
			email: "Alex@email.com",
			password: "123456",
		}),
	});

	const data = await response.json();

	z.object({
		message: z.string(),
	}).parse(data);
});
