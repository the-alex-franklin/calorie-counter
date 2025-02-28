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
			presets: [presetUno(), presetIcons()],
			theme: {
				darkMode: "class",
				colors: {
					light: "#F2F2F7",
					dark: "#1C1C1E",
					primary: "#007AFF",
					secondary: "#34C759",
					warning: "#FF9500",
					danger: "#FF3B30",
					info: "#5AC8FA",
					success: "#34C759",
				},
				fontFamily: {
					sans: "-apple-system, BlinkMacSystemFont, 'San Francisco', 'Helvetica Neue', sans-serif",
				},
			},
			shortcuts: {
				"colors-default": "bg-light text-black dark:(bg-dark text-white)",
				"bg-card": "bg-white dark:bg-[#2C2C2E]",
			},
		}),
	],
	define: {
		"process.env": env,
	},
});
