import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Try } from "jsr:@2or3godzillas/fp-try";
import { z } from "zod";

type ThemeState = {
	darkMode: boolean;
	toggleTheme: () => void;
	initTheme: () => void;
};

// Function to detect system dark mode preference
const prefersDarkMode = () => {
	if (typeof matchMedia === "undefined") return false;
	return matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
};

export const useThemeStore = create<ThemeState>()(
	persist(
		(set, get) => ({
			darkMode: prefersDarkMode(), // Default to system preference
			toggleTheme: () => {
				const newTheme = !(get().darkMode);
				set({ darkMode: newTheme });
				document.documentElement.classList.toggle("dark", newTheme);

				// Apply proper background and text colors
				document.body.classList.toggle("bg-primary", newTheme);
				document.body.classList.toggle("bg-background", !newTheme);
				document.body.classList.toggle("text-textDark", newTheme);
				document.body.classList.toggle("text-text", !newTheme);
			},
			initTheme: () => {
				const result = Try(() => {
					const theme = localStorage.getItem("theme-storage");
					if (!theme) throw new Error("No theme stored");

					const json = JSON.parse(theme);

					const { state } = z.object({
						state: z.object({
							darkMode: z.boolean(),
						}),
					}).parse(json);

					return state.darkMode;
				});

				// Use system preference if no saved preference
				let darkMode = prefersDarkMode();

				// If we have a saved preference, use that
				if (!result.failure) {
					darkMode = result.data;
				}

				// Update state
				set({ darkMode });

				// Apply theme to document
				if (darkMode) {
					document.documentElement.classList.add("dark");
					document.body.classList.add("bg-primary", "text-textDark");
					document.body.classList.remove("bg-background", "text-text");
				} else {
					document.documentElement.classList.remove("dark");
					document.body.classList.add("bg-background", "text-text");
					document.body.classList.remove("bg-primary", "text-textDark");
				}
			},
		}),
		{ name: "theme-storage" },
	),
);
