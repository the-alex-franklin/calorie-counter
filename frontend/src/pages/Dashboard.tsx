// @deno-types="@types/react"
import { useEffect, useState } from "react";
import { useThemeStore } from "../data-stores/theme.ts";
import { useAuthStore } from "../data-stores/auth.ts";
import { Navbar } from "../components/Navbar.tsx";

// Lazy loading the tabs for better performance
const HomePage = () => import("./home/HomePage.tsx").then((module) => module.default);
const HistoryPage = () => import("./history/HistoryPage.tsx").then((module) => module.default);
const CameraPage = () => import("./camera/CameraPage.tsx").then((module) => module.default);
const NutritionPage = () => import("./nutrition/NutritionPage.tsx").then((module) => module.default);
const ProfilePage = () => import("./profile/ProfilePage.tsx").then((module) => module.default);

// Tab interface for iOS style app
export const Dashboard = () => {
	const { darkMode } = useThemeStore();
	const { user } = useAuthStore();
	const [activeTab, setActiveTab] = useState("home");
	const [ActiveComponent, setActiveComponent] = useState<React.ComponentType | null>(null);

	// Debug log to verify Dashboard is rendering with auth state
	useEffect(() => {
		console.log("Dashboard mounted. Auth state:", { user });

		// Initially load the home component
		HomePage().then((Component) => {
			setActiveComponent(() => Component);
		});
	}, []);

	// Handle tab changes
	useEffect(() => {
		// Load the appropriate component based on active tab
		switch (activeTab) {
			case "home":
				HomePage().then((Component) => setActiveComponent(() => Component));
				break;
			case "history":
				HistoryPage().then((Component) => setActiveComponent(() => Component));
				break;
			case "camera":
				CameraPage().then((Component) => setActiveComponent(() => Component));
				break;
			case "nutrition":
				NutritionPage().then((Component) => setActiveComponent(() => Component));
				break;
			case "profile":
				ProfilePage().then((Component) => setActiveComponent(() => Component));
				break;
		}
	}, [activeTab]);

	return (
		<div
			className={`h-full w-full ${darkMode ? "bg-dark text-textDark" : "bg-background text-text"} transition-all`}
		>
			<Navbar />

			{/* Main content area */}
			<div className="h-[calc(100vh-120px)] overflow-auto pb-20">
				{ActiveComponent && <ActiveComponent />}
			</div>

			{/* iOS-style tab bar */}
			<div
				className={`fixed bottom-0 left-0 right-0 h-16 ${darkMode ? "bg-dark-secondary" : "bg-white"} 
				shadow-up flex items-center justify-around z-10 border-t ${darkMode ? "border-gray-800" : "border-gray-200"}`}
			>
				<TabButton
					icon="i-heroicons-home"
					label="Home"
					isActive={activeTab === "home"}
					onClick={() => setActiveTab("home")}
				/>

				<TabButton
					icon="i-heroicons-chart-bar"
					label="History"
					isActive={activeTab === "history"}
					onClick={() => setActiveTab("history")}
				/>

				<TabButton
					icon="i-heroicons-camera"
					label="Camera"
					isActive={activeTab === "camera"}
					onClick={() => setActiveTab("camera")}
					isPrimary
				/>

				<TabButton
					icon="i-heroicons-book-open"
					label="Nutrition"
					isActive={activeTab === "nutrition"}
					onClick={() => setActiveTab("nutrition")}
				/>

				<TabButton
					icon="i-heroicons-user"
					label="Profile"
					isActive={activeTab === "profile"}
					onClick={() => setActiveTab("profile")}
				/>
			</div>
		</div>
	);
};

// Tab button component for iOS-style tab bar
interface TabButtonProps {
	icon: string;
	label: string;
	isActive: boolean;
	onClick: () => void;
	isPrimary?: boolean;
}

const TabButton = ({ icon, label, isActive, onClick, isPrimary }: TabButtonProps) => {
	const { darkMode } = useThemeStore();

	return (
		<button
			onClick={onClick}
			className={`flex flex-col items-center justify-center w-16 h-full relative 
				transition-colors focus:outline-none`}
		>
			{isPrimary
				? (
					<div
						className={`absolute -top-5 w-12 h-12 rounded-full 
					bg-primary flex items-center justify-center shadow-lg`}
					>
						<i className={`${icon} text-white text-xl`}>📷</i>
					</div>
				)
				: (
					<i
						className={`${icon} ${
							isActive ? "text-primary" : darkMode ? "text-gray-500" : "text-gray-400"
						} text-xl mb-1`}
					>
						{icon === "i-heroicons-home"
							? "🏠"
							: icon === "i-heroicons-chart-bar"
							? "📊"
							: icon === "i-heroicons-user"
							? "👤"
							: icon === "i-heroicons-book-open"
							? "📖"
							: "📷"}
					</i>
				)}
			{!isPrimary && (
				<span
					className={`text-xs ${isActive ? "text-primary font-medium" : darkMode ? "text-gray-500" : "text-gray-400"}`}
				>
					{label}
				</span>
			)}
		</button>
	);
};
