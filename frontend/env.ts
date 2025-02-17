import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { env_schema } from "./env.schema.ts";

config({ export: true });

export const env = env_schema.parse(Deno.env.toObject());
