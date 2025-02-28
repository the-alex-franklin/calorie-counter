import { useState } from "react";
import { useAuthStore } from "../../data-stores/auth.ts";
import { useThemeStore } from "../../data-stores/theme.ts";
import { SettingItem } from "./components/SettingItem.tsx";

export const ProfilePage = () => {
	const { darkMode, toggleTheme } = useThemeStore();
	const { logout } = useAuthStore();
	const [dailyGoal, setDailyGoal] = useState(2000);
	const [notifications, setNotifications] = useState(true);
	const [showGoalModal, setShowGoalModal] = useState(false);

	const handleGoalChange = (newGoal: number) => {
		setDailyGoal(newGoal);
		setShowGoalModal(false);
	};

	return (
		<>
			<h2 className="text-lg font-semibold mb-4">Goals & Preferences</h2>

			<div className="mb-5">
				<SettingItem
					icon="🎯"
					label="Daily Calorie Goal"
					value={`${dailyGoal} calories`}
					onClick={() => setShowGoalModal(true)}
				/>

				<SettingItem
					icon="🔔"
					label="Notifications"
					toggle
					isToggled={notifications}
					onToggle={() => setNotifications(!notifications)}
				/>

				<SettingItem
					icon="🌓"
					label="Dark Mode"
					toggle
					isToggled={darkMode}
					onToggle={toggleTheme}
				/>
			</div>

			<h2 className="text-lg font-semibold mb-4">App Settings</h2>

			<div className="mb-5">
				<SettingItem
					icon="📱"
					label="App Version"
					value="1.0.0"
				/>
			</div>

			<div className="mb-5">
				<SettingItem
					icon="🚪"
					label="Sign Out"
					danger
					onClick={logout}
				/>
			</div>

			{showGoalModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className={`w-5/6 p-6 rounded-2xl shadow-lg ${darkMode ? "bg-primary" : "bg-white"}`}>
						<h3 className="text-lg font-semibold mb-4">Set Daily Calorie Goal</h3>

						<div className="space-y-4 mb-5">
							{[1500, 2000, 2500, 3000].map((goal) => (
								<div
									key={goal}
									onClick={() => handleGoalChange(goal)}
									className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${dailyGoal === goal ? "border-primary bg-appBlue bg-opacity-10" : darkMode ? "border-gray-700" : "border-gray-200"}`}
								>
									<span>{goal} calories</span>
									{dailyGoal === goal && <span className="text-primary">✓</span>}
								</div>
							))}
						</div>

						<div className="flex justify-end">
							<button
								onClick={() => setShowGoalModal(false)}
								className="px-5 py-2 text-primary font-medium"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
