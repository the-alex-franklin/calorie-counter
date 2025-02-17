import { defineConfig, type PluginOption } from "vite";
import deno from "@deno/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import windi from "npm:vite-plugin-windicss";
import { env } from "./env.ts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    deno(),
    react(),
    // @ts-ignore -
    windi(),
  ],
  define: {
    "process.env": env,
  },
});
