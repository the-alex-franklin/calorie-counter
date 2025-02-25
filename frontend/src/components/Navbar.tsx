// @deno-types="@types/react"
import { useState } from "react";
import { useAuthStore } from "../data-stores/auth.ts";
import { useThemeStore } from "../data-stores/theme.ts";

export function Navbar() {
	const { logout } = useAuthStore();
	const { darkMode, toggleTheme } = useThemeStore();
	const [isOpen, setIsOpen] = useState(false);

	const toggleDrawer = () => setIsOpen(!isOpen);

	return (
		<div>
			<nav className="text-white p-4 flex items-center">
				<button className="bg-inherit border-none text-primary ml-2 text-xl" onClick={toggleDrawer}>
					☰
				</button>
			</nav>

			<div
				className={`fixed bg-primary text-primary top-0 left-0 z-1 h-full w-64 shadow-lg transform ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} transition-transform duration-300`}
			>
				<button className="absolute bg-primary text-primary border-none top-4 right-4 text-2xl" onClick={toggleDrawer}>
					×
				</button>
				<div className="p-6 space-y-4">
					<h2 className="text-lg font-bold">Settings</h2>
					<button
						onClick={toggleTheme}
						className="bg-primary text-primary p-2 rounded w-full text-left"
					>
						{darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
					</button>
					<button
						onClick={logout}
						className="bg-primary text-primary p-2 rounded w-full text-left"
					>
						Logout
					</button>
				</div>
			</div>

			{isOpen && <div className="fixed inset-0 bg-black/50" onClick={toggleDrawer}></div>}
		</div>
	);
}
