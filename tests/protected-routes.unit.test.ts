import { assertEquals, assertMatch } from "jsr:@std/assert";
import { setupTests } from "./setup-tests.ts";

const { app } = await setupTests();

Deno.test("hit protected route without token", async () => {
	const response = await app.request("/protected");
	const data = await response.json();
	assertEquals(data.message, "Unauthorized");
});

// Deno.test("hit protected route with token", async () => {
// 	const response = await app.request("/sign-up", {
// 		method: "POST",
// 		body: JSON.stringify({
// 			email: "Alex@email.com",
// 			password: "123456",
// 		}),
// 	});

// 	const setCookieHeader = response.headers.get("set-cookie");
// 	if (!setCookieHeader) throw new Error("No set-cookie header");

// 	assertMatch(setCookieHeader, /accessToken=.*HttpOnly/);
// });
