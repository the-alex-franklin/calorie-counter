import { assertEquals } from "jsr:@std/assert";
import { setupTests } from "./setup-tests.ts";

const { app } = await setupTests();

Deno.test("hit protected route without token", async () => {
	const response = await app.request("http://localhost:3000/protected");
	const data = await response.json();
	assertEquals(data.message, "Unauthorized");
});

Deno.test("hit protected route with token", async () => {
	const signUpResponse = await app.request("http://localhost:3000/sign-up", {
		method: "POST",
		body: JSON.stringify({
			email: "Alex@email.com",
			password: "123456",
		}),
	});

	const signUpData = await signUpResponse.json() as { accessToken: string };

	const response = await app.request("http://localhost:3000/protected", {
		headers: {
			Authorization: `Bearer ${signUpData.accessToken}`,
		},
	});

	const data = await response.text();

	console.log(data);
	assertEquals(data, "Protected route");
});
