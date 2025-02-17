import { z } from "zod";

export const env_schema = z.object({
	NODE_ENV: z.string(),
});
