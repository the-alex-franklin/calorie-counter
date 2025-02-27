// @deno-types="@types/react"
import { useEffect, useRef, useState } from "react";
import { useThemeStore } from "../data-stores/theme.ts";
import { useAuthStore } from "../data-stores/auth.ts";
import DarkModeButton from "../components/DarkModeButton.tsx";
import { Capacitor } from "@capacitor/core";

// Import all required components directly
import HomePage from "./home/HomePage.tsx";
import HistoryPage from "./history/HistoryPage.tsx";
import CameraPage from "./camera/CameraPage.tsx";
import ProfilePage from "./profile/ProfilePage.tsx";

// Combined HomePage and related functionality
export const Dashboard = () => {
	const { darkMode, toggleTheme } = useThemeStore();
	const { user, logout } = useAuthStore();
	const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
	const [activeCameraMode, setActiveCameraMode] = useState(false);
	const sideMenuRef = useRef<HTMLDivElement>(null);
	const isMobile = Capacitor.isNativePlatform();

	// Handle side menu toggle
	const toggleSideMenu = () => setIsSideMenuOpen(!isSideMenuOpen);

	// Handle clicks outside side menu to close it
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (sideMenuRef.current && !sideMenuRef.current.contains(event.target as Node)) {
				setIsSideMenuOpen(false);
			}
		}

		if (isSideMenuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isSideMenuOpen]);

	// Toggle camera mode - make sure to explicitly close all camera streams when disabling
	const toggleCameraMode = () => {
		// If we're turning off the camera mode, make sure to stop all video streams first
		if (activeCameraMode) {
			// This will find and stop all active camera streams
			document.querySelectorAll('video').forEach(video => {
				if (video.srcObject) {
					const stream = video.srcObject as MediaStream;
					stream.getTracks().forEach(track => {
						if (track.readyState === 'live') {
							track.stop();
						}
					});
					video.srcObject = null;
				}
			});
		}
		
		setActiveCameraMode(!activeCameraMode);
	};

	return (
		<div
			className={`h-full w-full ${darkMode ? "bg-dark text-textDark" : "bg-background text-text"} transition-all ${
				isMobile ? "mt-20" : ""
			}`}
		>
			{/* Header with hamburger menu */}
			<div className={`flex items-center justify-between px-5 py-4 ${darkMode ? "bg-dark" : "bg-background"}`}>
				<button
					onClick={toggleSideMenu}
					className="text-2xl focus:outline-none"
				>
					☰
				</button>
				<h1 className="text-xl font-bold">Calorie Counter</h1>
				<DarkModeButton />
			</div>

			{/* Main content area - combines Home, History, and Nutrition in one page */}
			<div className="h-[calc(100vh-70px)] overflow-auto pb-24 hide-scrollbar">
				{activeCameraMode ? <CameraPage onClose={toggleCameraMode} /> : (
					<>
						{/* Home page content at top */}
						<HomePage />

						{/* History section below */}
						<div className="px-5 mt-6 pb-4">
							<h2 className="text-xl font-bold mb-4">Activity History</h2>
							<HistoryPage isEmbedded />
						</div>
					</>
				)}
			</div>

			{/* Floating camera/close button */}
			<button
				onClick={toggleCameraMode}
				className={`fixed right-6 bottom-6 w-14 h-14 rounded-full 
					${activeCameraMode ? "bg-red-500" : "bg-primary"} text-white 
					flex items-center justify-center shadow-lg z-20 transition-all`}
			>
				{activeCameraMode ? <span className="text-xl font-bold">✕</span> : <span>📷</span>}
			</button>

			{/* Side Menu */}
			<div
				className={`fixed inset-0 z-50 ${isSideMenuOpen ? "visible" : "invisible"} 
					bg-black bg-opacity-40 transition-all duration-300 ${isSideMenuOpen ? "opacity-100" : "opacity-0"}`}
			>
				<div
					ref={sideMenuRef}
					className={`absolute top-0 left-0 bottom-0 w-3/4 max-w-xs ${darkMode ? "bg-dark-secondary" : "bg-white"} 
						shadow-lg transform transition-transform duration-300 ease-out hide-scrollbar
						${isSideMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
				>
					{/* Profile section at top of side menu */}
					<div className={`p-6 border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
						<div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-4">
							{user?.email?.charAt(0).toUpperCase() || "U"}
						</div>
						<h2 className="text-xl font-semibold">{user?.email?.split("@")[0] || "User"}</h2>
						<p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
							{user?.email || "user@example.com"}
						</p>
					</div>

					{/* Menu items */}
					<div className="p-6">
						<ProfilePage isEmbedded />

						{/* Logout button */}
						<button
							onClick={logout}
							className={`w-full mt-8 py-3 px-4 rounded-lg ${
								darkMode ? "bg-red-900" : "bg-red-500"
							} text-white text-center`}
						>
							Sign Out
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};