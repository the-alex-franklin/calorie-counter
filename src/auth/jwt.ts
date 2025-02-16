import jwt from "npm:jwt-simple";
import { env } from "../env.ts";

const ACCESS_TOKEN_EXPIRY = 15 * 60;
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60;

type JWTPayload = {
	id: string; // User ID
	email: string; // User email
	role: string; // User role (e.g., 'admin', 'user')
	password?: string; // Optional user password
	permissions?: string[]; // Optional list of user permissions
	iat: number; // Issued At (optional, added automatically)
	exp: number; // Expiration (optional, added automatically)
};

export const generateAccessToken = (payload: Omit<JWTPayload, "iat" | "exp">): string => {
	delete payload.password;
	const iat = Math.floor(Date.now() / 1000);
	const exp = iat + ACCESS_TOKEN_EXPIRY;
	return jwt.encode({ ...payload, iat, exp }, env.JWT_SECRET);
};

export const generateRefreshToken = (payload: Omit<JWTPayload, "iat" | "exp">): string => {
	delete payload.password;
	const iat = Math.floor(Date.now() / 1000);
	const exp = iat + REFRESH_TOKEN_EXPIRY;
	return jwt.encode({ ...payload, iat, exp }, env.REFRESH_SECRET);
};

export const decodeAccessToken = (token: string): JWTPayload => {
	const decoded: JWTPayload = jwt.decode(token, env.JWT_SECRET);
	if (decoded.exp < Math.floor(Date.now() / 1000)) throw new Error("Token expired");
	return decoded;
};

export const decodeRefreshToken = (token: string): JWTPayload => {
	const decoded: JWTPayload = jwt.decode(token, env.REFRESH_SECRET);
	if (decoded.exp < Math.floor(Date.now() / 1000)) throw new Error("Refresh token expired");
	return decoded;
};
