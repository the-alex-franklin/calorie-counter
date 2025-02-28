import { z } from "zod";
import { Capacitor } from "@capacitor/core";

const platform = Capacitor.getPlatform();

export const env_schema = z.object({
	NODE_ENV: z.string().default("production"),
	API_URL: z.string().default(platform === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000"),
});
