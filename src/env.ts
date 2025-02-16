import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { z } from "zod";

config({ export: true });

export const env = z.object({
	JWT_SECRET: z.string(),
	REFRESH_SECRET: z.string(),
	OPENAI_APIKEY: z.string(),
}).parse(Deno.env.toObject());
