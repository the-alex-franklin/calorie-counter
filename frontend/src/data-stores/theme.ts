import { create } from "zustand";
import { persist } from "zustand/middleware";
import fastJSON from "fast-json-parse";
import { Try } from "jsr:@2or3godzillas/fp-try";

type ThemeState = {
	darkMode: boolean;
	toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
	persist(
		(set, get) => ({
			darkMode: (() => {
				const result = Try(() => {
					const response = fastJSON<{ state: { darkMode: boolean } }>(localStorage.getItem("theme-storage")!);
					return response.value.state.darkMode;
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
