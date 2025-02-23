import { Hono } from "hono";
import { authRoutes } from "./auth/auth.routes.ts";
import { type JWT_Payload, jwtAuthMiddleware } from "./auth/auth.middleware.ts";
import { cors } from "hono/cors";
import { createUserService } from "./db/UserService.ts";
import { type Db, MongoClient } from "mongodb";
import { PlatformError } from "./errors/platform.error.ts";

export function createApp({ db }: { db: Db }) {
	const app = new Hono<JWT_Payload>();
	const userService = createUserService(db);

	app.use(cors({ origin: "*" }));

	app.onError((err, c) => {
		if (err instanceof PlatformError) return c.json({ error: err.message }, err.code);
		else return c.json({ error: err.message || "Internal Server Error" }, 500);
	});

	app.get("/", (c) => c.body("200 OK"));

	app.route("/", authRoutes(userService));

	app.use(jwtAuthMiddleware);

	app.get("/me", async (c) => {
		const { id } = c.get("jwtPayload");
		const user = await userService.getUserById(id);
		return c.json(user);
	});

	return app;
}

if (import.meta.main) {
	const client = await new MongoClient("mongodb://localhost:27017").connect();
	const db: Db = client.db();

	const app = createApp({ db });

	Deno.serve({
		port: 3000,
		handler: app.fetch,
	});
}
