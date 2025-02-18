import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeState = {
	darkMode: boolean;
	toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
	persist(
		(set, get) => ({
			darkMode: false,
			toggleTheme: () => {
				const newTheme = !(get().darkMode);
				set({ darkMode: newTheme });
				document.documentElement.classList.toggle("dark", newTheme);
			},
		}),
		{ name: "theme-storage" },
	),
);
