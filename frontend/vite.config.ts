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
			presets: [presetUno, presetIcons],
			theme: {
				colors: {
					// iOS color palette
					primary: "#007AFF", // iOS blue
					secondary: "#34C759", // iOS green
					warning: "#FF9500", // iOS orange
					danger: "#FF3B30", // iOS red
					info: "#5AC8FA", // iOS light blue
					success: "#34C759", // iOS green
					dark: "#1C1C1E", // iOS dark mode background
					background: "#F2F2F7", // iOS light mode background
					secondaryBg: "#FFFFFF", // iOS light mode secondary background
					secondaryBgDark: "#2C2C2E", // iOS dark mode secondary background
					text: "#000000", // iOS light mode text
					textSecondary: "#6C6C70", // iOS light mode secondary text
					textDark: "#FFFFFF", // iOS dark mode text
					textSecondaryDark: "#8E8E93", // iOS dark mode secondary text
					border: "#D1D1D6", // iOS light mode border
					borderDark: "#38383A", // iOS dark mode border
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
				// Common UI elements
				"ios-container": "bg-secondaryBg dark:bg-secondaryBgDark rounded-ios shadow-sm",
				"ios-card": "bg-white dark:bg-secondaryBgDark rounded-ios-lg shadow-sm p-4 mb-4",
				
				// Typography
				"ios-text": "font-sans text-text dark:text-textDark",
				"ios-text-secondary": "font-sans text-textSecondary dark:text-textSecondaryDark text-sm",
				"ios-title": "font-sans font-semibold text-xl text-text dark:text-textDark",
				"ios-heading": "font-sans font-bold text-2xl text-text dark:text-textDark",
				
				// Buttons
				"ios-btn": "px-5 py-3 rounded-ios-full font-sans font-medium text-center transition-all",
				"ios-btn-primary": "ios-btn bg-primary text-white hover:bg-primary/90 active:bg-primary/80",
				"ios-btn-secondary": "ios-btn bg-secondaryBg dark:bg-secondaryBgDark text-primary border border-border dark:border-borderDark hover:bg-gray-100 dark:hover:bg-dark/80",
				"ios-btn-success": "ios-btn bg-success text-white hover:bg-success/90 active:bg-success/80",
				"ios-btn-danger": "ios-btn bg-danger text-white hover:bg-danger/90 active:bg-danger/80",
				
				// Special elements
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
