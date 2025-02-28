import { useEffect, useRef, useState } from "react";
import { useThemeStore } from "../data-stores/theme.ts";
import { useAuthStore } from "../data-stores/auth.ts";
import { DarkModeButton } from "../components/DarkModeButton.tsx";
import { Capacitor } from "@capacitor/core";

import { HomePage } from "./home/HomePage.tsx";
import { HistoryPage } from "./history/HistoryPage.tsx";
import { CameraPage } from "./camera/CameraPage.tsx";
import { ProfilePage } from "./profile/ProfilePage.tsx";

export const App = () => {
	const { darkMode } = useThemeStore();
	const { user } = useAuthStore();
	const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
	const [activeCameraMode, setActiveCameraMode] = useState(false);
	const sideMenuRef = useRef<HTMLDivElement>(null);
	const isMobile = Capacitor.isNativePlatform();

	const toggleSideMenu = () => setIsSideMenuOpen(!isSideMenuOpen);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (sideMenuRef.current && !sideMenuRef.current.contains(event.target as Node)) {
				setIsSideMenuOpen(false);
			}
		}

		if (isSideMenuOpen) document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isSideMenuOpen]);

	const toggleCameraMode = () => {
		if (activeCameraMode) {
			document.querySelectorAll("video").forEach((video) => {
				const stream = video.srcObject as MediaStream | null;
				stream?.getTracks().forEach((track) => {
					if (track.readyState === "live") track.stop();
				});
				video.srcObject = null;
			});
		}

		setActiveCameraMode(!activeCameraMode);
	};

	return (
		<div className={`h-full w-full transition-all ${isMobile ? "mt-20" : ""}`}>
			<div className={`flex items-center justify-between px-4 py-3`}>
				<button onClick={toggleSideMenu} className="text-2xl focus:outline-none">
					☰
				</button>
				<h1 className="text-xl font-bold">Calorie Counter</h1>
				<DarkModeButton />
			</div>

			<div className="h-[calc(100vh-70px)] overflow-auto pb-20 hide-scrollbar">
				{activeCameraMode ? <CameraPage onClose={toggleCameraMode} /> : (
					<>
						<HomePage />

						<div className="px-4 mt-4 pb-4">
							<h2 className="text-xl font-bold mb-3">Activity History</h2>
							<HistoryPage />
						</div>
					</>
				)}
			</div>

			<button onClick={toggleCameraMode} className={`fixed right-6 bottom-6 w-14 h-14 rounded-full ${activeCameraMode ? "bg-red-500" : "bg-primary"} text-white flex items-center justify-center shadow-lg z-20 transition-all`}>
				{activeCameraMode ? <span className="text-xl font-bold">✕</span> : <span>📷</span>}
			</button>

			<div className={`fixed inset-0 z-1 ${isSideMenuOpen ? "visible" : "invisible"} bg-black bg-opacity-40 transition-all duration-300 ${isSideMenuOpen ? "opacity-100" : "opacity-0"}`}>
				<div ref={sideMenuRef} className={`absolute top-0 left-0 bottom-0 w-3/4 max-w-xs colors-default shadow-lg transform transition-transform duration-300 ease-out hide-scrollbar ${isSideMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
					<div className="p-4 border-b dark:border-gray-800 border-gray-200">
						<div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-3">
							{user?.email?.charAt(0).toUpperCase()}
						</div>
						<h2 className="text-xl font-semibold">{user?.email?.split("@")[0]}</h2>
						<p className={`text-sm dark:text-gray-400 text-gray-500`}>
							{user?.email}
						</p>
					</div>

					<div className="p-4">
						<ProfilePage />
					</div>
				</div>
			</div>
		</div>
	);
};
