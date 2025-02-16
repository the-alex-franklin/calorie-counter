import { type MiddlewareHandler } from "hono";
import { decodeAccessToken } from "../auth/jwt.ts";

export const jwtAuthMiddleware: MiddlewareHandler = async (c, next) => {
	const authHeader = c.req.header("Authorization");

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return c.json({ message: "Unauthorized" }, 401);
	}

	const token = authHeader.replace("Bearer ", "");
	const payload = decodeAccessToken(token);
	c.set("jwtPayload", payload);
	await next();
};
