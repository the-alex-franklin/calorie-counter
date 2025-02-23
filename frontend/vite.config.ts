import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import uno from "unocss/vite";
import { env } from "./env.ts";
import { presetIcons, presetUno } from "unocss";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		deno(),
		react(),
		uno({
			presets: [presetIcons, presetUno],
			theme: {
				colors: {
					primary: "#fff",
					dark: "#1e1e1e",
				},
			},
			shortcuts: {
				"bg-primary": "bg-primary dark:bg-dark",
				"text-primary": "text-dark dark:text-white",
			},
		}),
	],
	define: {
		"process.env": env,
	},
});
