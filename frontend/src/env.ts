import { env_schema } from "../env.schema.ts";

// deno-lint-ignore no-process-global
export const env = env_schema.parse(process.env);
