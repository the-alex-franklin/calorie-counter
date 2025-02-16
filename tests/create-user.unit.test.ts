import { assertEquals } from "jsr:@std/assert";
import { Try } from "fp-try";
import { setupTests } from "./setup-tests.ts";

const { db } = await setupTests();

Deno.test("createUser", async () => {
	const user = await db.createUser({
		email: "Alex@email.com",
		password: "123456",
	});

	assertEquals(user.email, "Alex@email.com");
});

Deno.test("createDuplicateUser", async () => {
	const result = await Try(() =>
		db.createUser({
			email: "Alex@email.com",
			password: "123456",
		})
	);

	assertEquals(result.success, false);
});
