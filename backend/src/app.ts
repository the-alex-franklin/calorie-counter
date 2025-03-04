import { Hono } from "hono";
import { authRoutes } from "./auth/auth.routes.ts";
import { jwtAuthMiddleware, type JWTPayload } from "./auth/auth.middleware.ts";
import { cors } from "hono/cors";
import { UserService } from "./db/UserService.ts";
import { FoodEntryService } from "./db/FoodEntryService.ts";
import { type Db, MongoClient } from "mongodb";
import { PlatformError } from "./errors/platform.error.ts";
import { foodRoutes } from "./food/food.routes.ts";
import chalk from "chalk";

export function createApp({ db }: { db: Db }) {
	const userService = UserService.getInstance(db);
	const foodEntryService = FoodEntryService.getInstance(db);

	let app: Hono | Hono<JWTPayload> = new Hono();

	app.use(cors({ origin: "*" }));

	app.use(async (c, next) => {
		console.log(`Method: ${c.req.method}, Route: ${c.req.url}`);
		const start = performance.now();
		await next();
		const end = performance.now();
		console.log(`Time: ${chalk.yellow(end - start + "ms")}`);
	});

	app.onError((err, c) => (
		err instanceof PlatformError
			? c.json({ error: err.message }, err.code)
			: c.json({ error: err.message || "Internal Server Error" }, 500)
	));

	app.get("/", (c) => c.body("200 OK"));

	app.route("/", authRoutes(userService));

	app = app.use(jwtAuthMiddleware);

	app.get("/me", async (c) => {
		const { id } = c.get("jwtPayload");
		const user = await userService.getUserById(id);
		return c.json(user);
	});

	app.route("/api", foodRoutes(foodEntryService));

	return app;
}

if (import.meta.main) {
	const client = await new MongoClient("mongodb://localhost:27017").connect();
	const db: Db = client.db("calorie-counter");

	const app = createApp({ db });

	Deno.serve({
		port: 3000,
		handler: app.fetch,
	});
}
