import { type MiddlewareHandler } from "hono";
import { decodeAccessToken } from "./jwt.ts";
import { getSignedCookie } from "hono/cookie";
import { env } from "../env.ts";

export type JWT_Payload = {
	Variables: {
		jwtPayload: {
			id: string;
			iat: number;
			exp: number;
		};
	};
};

export const jwtAuthMiddleware: MiddlewareHandler<JWT_Payload> = async (c, next) => {
	const accessToken = await getSignedCookie(c, env.COOKIE_SECRET, "accessToken");
	if (!accessToken) return c.json({ message: "Unauthorized" }, 401);

	const payload = decodeAccessToken(accessToken);
	c.set("jwtPayload", payload);
	await next();
};
