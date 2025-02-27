import { env_schema } from "../env.schema.ts";

export const env = env_schema.parse(globalThis.process.env);
