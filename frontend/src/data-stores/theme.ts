import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeState = {
	darkMode: boolean;
	toggleTheme: () => void;
	initTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
	persist(
		(set, get) => ({
			darkMode: matchMedia("(prefers-color-scheme: dark)").matches,
			toggleTheme: () => {
				set({ darkMode: !get().darkMode });
				document.documentElement.classList.toggle("dark");
			},
			initTheme: () => {
				if (get().darkMode) document.documentElement.classList.add("dark");
			},
		}),
		{ name: "theme-storage" },
	),
);
