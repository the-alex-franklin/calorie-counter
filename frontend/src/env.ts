import { env_schema } from "../env.schema.ts";
import process from "node:process";

export const env = env_schema.parse(process.env);
