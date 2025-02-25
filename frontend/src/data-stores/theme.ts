import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Try } from "jsr:@2or3godzillas/fp-try";
import { z } from "zod";

type ThemeState = {
	darkMode: boolean;
	toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
	persist(
		(set, get) => ({
			darkMode: (() => {
				const result = Try(() => {
					const theme = localStorage.getItem("theme-storage");
					if (!theme) throw new Error("No theme stored");

					const json = JSON.parse(theme);

					const { value } = z.object({
						value: z.object({
							state: z.object({
								darkMode: z.boolean(),
							}),
						}),
					}).parse(json);

					return value.state.darkMode;
				});

				if (result.failure) {
					document.documentElement.classList.add("dark");
					return true;
				}

				const darkMode = result.data;
				if (darkMode) document.documentElement.classList.add("dark");
				return darkMode;
			})(),
			toggleTheme: () => {
				const newTheme = !(get().darkMode);
				set({ darkMode: newTheme });
				document.documentElement.classList.toggle("dark", newTheme);
			},
		}),
		{ name: "theme-storage" },
	),
);
