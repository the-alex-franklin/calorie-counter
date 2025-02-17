import { Hono, MiddlewareHandler } from "hono";
import mongoose from "npm:mongoose";
import { env } from "./env.ts";
import { authRoutes } from "./auth/auth.routes.ts";
import { type JWT_Payload, jwtAuthMiddleware } from "./auth/auth.middleware.ts";
import { cors } from "hono/cors";
import { userService } from "./db/services/UserService.ts";

export class App {
	app: Hono | Hono<JWT_Payload>;

	constructor() {
		this.app = new Hono();
		this.app.use(cors({
			origin: "http://localhost:5173",
			credentials: true,
		}));

		this.app.get("/", (c) => c.body("200 OK"));
		this.app.route("/", authRoutes());
		this.app = this.app.use(jwtAuthMiddleware);
		this.app.get("/protected", (c) => c.body("Protected route"));
		this.app.get("/user", async (c) => {
			const { id } = c.get("jwtPayload");
			const user = await userService.getUserById(id);
			return c.json(user);
		});
	}
}

if (import.meta.main) {
	await mongoose.connect(env.MONGO_URI);

	const { app } = new App();

	Deno.serve({
		port: 3000,
		handler: app.fetch,
	});
}
