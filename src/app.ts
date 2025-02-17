import { Hono } from "hono";
import { env } from "./env.ts";
import { authRoutes } from "./auth/auth.routes.ts";
import { type JWT_Payload, jwtAuthMiddleware } from "./auth/auth.middleware.ts";
import { cors } from "hono/cors";
import { UserService } from "./db/UserService.ts";
import { type Db, MongoClient } from "mongodb";

export class App {
	app: Hono | Hono<JWT_Payload>;
	userService: UserService;

	constructor({ db }: { db: Db }) {
		this.app = new Hono();
		this.app.onError((err, c) => c.json({ error: err.message }, 500));

		this.userService = new UserService(db);

		this.app.use(cors({ origin: "*" }));

		this.app.get("/", (c) => c.body("200 OK"));
		this.app.route("/", authRoutes(this.userService));

		this.app = this.app.use(jwtAuthMiddleware);
		this.app.get("/protected", (c) => c.body("Protected"));
		this.app.get("/user", async (c) => {
			const { id } = c.get("jwtPayload");
			const user = await this.userService.getUserById(id);
			return c.json(user);
		});
	}
}

if (import.meta.main) {
	const client = new MongoClient("mongodb://localhost:27017"); // Adjust connection URL
	await client.connect();
	const db: Db = client.db("calorie-counter");

	const { app } = new App({ db });

	Deno.serve({
		port: 3000,
		handler: app.fetch,
	});
}
