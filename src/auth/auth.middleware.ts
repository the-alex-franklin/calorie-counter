import { type MiddlewareHandler } from "hono";
import { decodeAccessToken } from "./jwt.ts";
import { getSignedCookie } from "hono/cookie";
import { env } from "../env.ts";
import { PlatformError } from "../errors/platform.error.ts";

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
	const authHeader = c.req.header("Authorization");
	if (!authHeader) throw new PlatformError("Unauthorized", 401);

	const accessToken = authHeader.replace(/^Bearer /, "");

	const payload = decodeAccessToken(accessToken);
	c.set("jwtPayload", payload);
	await next();
};
