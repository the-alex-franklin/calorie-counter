import { z } from "npm:zod";

export const env_schema = z.object({
  NODE_ENV: z.string(),
});
