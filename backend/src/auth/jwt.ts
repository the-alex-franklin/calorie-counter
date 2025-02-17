import jwt from "npm:jwt-simple";
import { env } from "../env.ts";
import { z } from "zod";
import { PlatformError } from "../errors/platform.error.ts";

const ACCESS_TOKEN_EXPIRY = 15 * 60;
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60;

const jwtSchema = z.object({
	id: z.string(),
	iat: z.number(),
	exp: z.number(),
});

type JWTPayload = z.infer<typeof jwtSchema>;

export const generateAccessToken = ({ id }: { id: string }): string => {
	const iat = Math.floor(Date.now() / 1000);
	const exp = iat + ACCESS_TOKEN_EXPIRY;
	return jwt.encode({ id: id.toString(), iat, exp }, env.JWT_SECRET);
};

export const generateRefreshToken = ({ id }: { id: string }): string => {
	const iat = Math.floor(Date.now() / 1000);
	const exp = iat + REFRESH_TOKEN_EXPIRY;
	return jwt.encode({ id: id.toString(), iat, exp }, env.REFRESH_SECRET);
};

export const decodeAccessToken = (token: string): JWTPayload => {
	const decoded: JWTPayload = jwt.decode(token, env.JWT_SECRET);
	if (decoded.exp < Math.floor(Date.now() / 1000)) throw new PlatformError("Unauthorized", 401);
	return decoded;
};

export const decodeRefreshToken = (token: string): JWTPayload => {
	const decoded: JWTPayload = jwt.decode(token, env.REFRESH_SECRET);
	if (decoded.exp < Math.floor(Date.now() / 1000)) throw new PlatformError("Unauthorized", 401);
	return decoded;
};
