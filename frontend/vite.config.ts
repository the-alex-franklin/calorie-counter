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
					primary: "#1C1C1E",
					secondary: "#34C759",
					warning: "#FF9500",
					danger: "#FF3B30",
					info: "#5AC8FA",
					success: "#34C759",
					appBlue: "#007AFF",
					background: "#F2F2F7",
					secondaryBg: "#FFFFFF",
					secondaryBgDark: "#2C2C2E",
					text: "#000000",
					textSecondary: "#6C6C70",
					textDark: "#FFFFFF",
					textSecondaryDark: "#8E8E93",
					border: "#D1D1D6",
					borderDark: "#38383A",
				},
				fontFamily: {
					sans: "-apple-system, BlinkMacSystemFont, 'San Francisco', 'Helvetica Neue', sans-serif",
				},
				borderRadius: {
					"ios": "10px",
					"ios-lg": "16px",
					"ios-full": "9999px",
				},
			},
			shortcuts: {
				"ios-container": "bg-secondaryBg dark:bg-secondaryBgDark rounded-ios shadow-sm",
				"ios-card": "bg-white dark:bg-secondaryBgDark rounded-ios-lg shadow-sm p-4 mb-4",

				"ios-text": "font-sans text-text dark:text-textDark",
				"ios-text-secondary": "font-sans text-textSecondary dark:text-textSecondaryDark text-sm",
				"ios-title": "font-sans font-semibold text-xl text-text dark:text-textDark",
				"ios-heading": "font-sans font-bold text-2xl text-text dark:text-textDark",

				"ios-btn": "px-5 py-3 rounded-ios-full font-sans font-medium text-center transition-all",
				"ios-btn-primary": "ios-btn bg-appBlue text-white hover:bg-appBlue/90 active:bg-appBlue/80",
				"ios-btn-secondary": "ios-btn bg-secondaryBg dark:bg-secondaryBgDark text-primary border border-border dark:border-borderDark hover:bg-gray-100 dark:hover:bg-primary/80",
				"ios-btn-success": "ios-btn bg-success text-white hover:bg-success/90 active:bg-success/80",
				"ios-btn-danger": "ios-btn bg-danger text-white hover:bg-danger/90 active:bg-danger/80",

				"ios-sheet": "fixed bottom-0 left-0 right-0 bg-secondaryBg dark:bg-secondaryBgDark rounded-t-ios-lg shadow-lg p-6 transition-all duration-300",
				"ios-navbar": "sticky top-0 bg-secondaryBg dark:bg-secondaryBgDark backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 border-b border-border dark:border-borderDark px-4 py-3 flex items-center justify-between",
				"ios-tab-bar": "fixed bottom-0 left-0 right-0 bg-secondaryBg dark:bg-secondaryBgDark backdrop-blur-md bg-opacity-70 dark:bg-opacity-70 border-t border-border dark:border-borderDark px-6 py-4 flex items-center justify-around",
				"ios-input": "bg-secondaryBg dark:bg-secondaryBgDark border border-border dark:border-borderDark rounded-ios px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary",
			},
		}),
	],
	define: {
		"process.env": env,
	},
});
