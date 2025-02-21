import { useThemeStore } from "../data-stores/theme.ts";

export default function DarkModeButton() {
	const { darkMode, toggleTheme } = useThemeStore();

	return (
		<button
			onClick={toggleTheme}
			className="px-4 py-2 rounded-full shadow-lg bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white transition-all"
		>
			{darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
		</button>
	);
}
