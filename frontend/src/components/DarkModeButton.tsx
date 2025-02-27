import { useThemeStore } from "../data-stores/theme.ts";

export default function DarkModeButton() {
	const { darkMode, toggleTheme } = useThemeStore();

	return (
		<button
			onClick={toggleTheme}
			className="w-10 h-10 rounded-full flex items-center justify-center focus:outline-none"
		>
			{darkMode ? "☀️" : "🌙"}
		</button>
	);
}
