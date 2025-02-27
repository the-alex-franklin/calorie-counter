import { type MiddlewareHandler } from "hono";
import { decodeAccessToken } from "./jwt.ts";
import { PlatformError } from "../errors/platform.error.ts";

export type JWTPayload = {
	Variables: {
		jwtPayload: {
			id: string;
			iat: number;
			exp: number;
		};
	};
};

export const jwtAuthMiddleware: MiddlewareHandler<JWTPayload> = async (c, next) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader) throw new PlatformError("Unauthorized", 401);

	const accessToken = authHeader.replace(/^Bearer /, "");

	const payload = decodeAccessToken(accessToken);
	c.set("jwtPayload", payload);
	await next();
};
