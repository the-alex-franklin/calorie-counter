import { Hono } from "hono";
import { authRoutes } from "./auth/auth.routes.ts";
import { type JWT_Payload, jwtAuthMiddleware } from "./auth/auth.middleware.ts";
import { cors } from "hono/cors";
import { UserService } from "./db/UserService.ts";
import { type Db, MongoClient } from "mongodb";
import { PlatformError } from "./errors/platform.error.ts";

export class App {
	app: Hono | Hono<JWT_Payload>;
	userService: UserService;

	constructor({ db }: { db: Db }) {
		this.app = new Hono();
		this.userService = new UserService(db);

		this.app.use(cors({ origin: "*" }));

		this.app.onError((err, c) => {
			if (err instanceof PlatformError) return c.json({ error: err.message }, err.code);
			return c.json({ error: err.message || "Internal Server Error" }, 500);
		});

		this.app.get("/", (c) => c.body("200 OK"));

		this.app.route("/", authRoutes(this.userService));

		this.app = this.app.use(jwtAuthMiddleware);

		this.app.get("/me", async (c) => {
			const { id } = c.get("jwtPayload");
			const user = await this.userService.getUserById(id);
			return c.json(user);
		});
	}
}

if (import.meta.main) {
	const client = await new MongoClient("mongodb://localhost:27017").connect();
	const db: Db = client.db();

	const { app } = new App({ db });

	Deno.serve({
		port: 3000,
		handler: app.fetch,
	});
}
