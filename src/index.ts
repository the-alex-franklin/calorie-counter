import { Hono } from "hono";
import { dbProvider } from "./db/db.ts";
import { env } from "./env.ts";
import { authRoutes } from "./auth/auth.routes.ts";
import { jwtAuthMiddleware } from "./auth/auth.middleware.ts";
import { cors } from "hono/cors";

export class App {
	app: Hono;
	db: dbProvider;

	constructor({ kv }: {
		kv: Deno.Kv;
	}) {
		this.app = new Hono();
		this.app.use(cors({
			origin: "http://localhost:5173",
			credentials: true,
		}));

		this.db = new dbProvider(kv);

		this.app.get("/", (c) => c.body("200 OK"));
		this.app.route("/", authRoutes(this.db));
		this.app.use(jwtAuthMiddleware);
		this.app.get("/protected", (c) => c.body("Protected route"));
	}
}

if (import.meta.main) {
	const kv = await Deno.openKv("calorie-counter");
	const { app } = new App({ kv });

	Deno.serve({
		port: 3000,
		handler: app.fetch,
	});
}
