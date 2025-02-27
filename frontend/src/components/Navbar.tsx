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
			<nav className="ios-navbar z-10">
				<div className="flex items-center">
					<button
						className="bg-transparent border-none text-xl"
						onClick={toggleDrawer}
					>
						<i className="i-heroicons-bars-3 text-primary">☰</i>
					</button>
				</div>
				<h1 className="ios-title absolute left-1/2 transform -translate-x-1/2">Calorie Counter</h1>
				<div>
					<button className="bg-transparent border-none">
						<i className="i-heroicons-camera text-primary"></i>
					</button>
				</div>
			</nav>

			{/* iOS-style sheet slide up */}
			<div
				className={`fixed inset-0 z-50 ${
					isOpen ? "visible opacity-100" : "invisible opacity-0"
				} transition-all duration-300`}
			>
				{/* Background overlay */}
				<div
					className="absolute inset-0 bg-black/30 backdrop-blur-sm"
					onClick={toggleDrawer}
				>
				</div>

				{/* Slide up sheet */}
				<div
					className={`absolute ios-sheet transform ${
						isOpen ? "translate-y-0" : "translate-y-full"
					} transition-transform duration-300 ease-out rounded-t-ios-lg`}
				>
					<div className="w-1/4 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6"></div>

					<h2 className="ios-heading mb-4">Settings</h2>

					<div className="space-y-4">
						<button
							onClick={toggleTheme}
							className="w-full ios-card flex items-center justify-between"
						>
							<span className="ios-text">{darkMode ? "Light Mode" : "Dark Mode"}</span>
							<div
								className={`w-12 h-6 rounded-ios-full relative ${
									darkMode ? "bg-primary" : "bg-gray-300"
								} transition-colors`}
							>
								<div
									className={`absolute w-5 h-5 bg-white rounded-ios-full top-0.5 transition-all ${
										darkMode ? "right-0.5" : "left-0.5"
									}`}
								>
								</div>
							</div>
						</button>

						<button
							onClick={logout}
							className="ios-btn-danger w-full mt-6"
						>
							Sign Out
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
