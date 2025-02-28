import { useEffect, useState } from "react";
import { useThemeStore } from "../../data-stores/theme.ts";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { foodApi } from "../../data-stores/api.ts";
import { MealCard, type MealCardProps } from "./components/MealCard.tsx";
import { Try } from "fp-try";

export const HomePage = () => {
	const { darkMode } = useThemeStore();
	const [calories, setCalories] = useState(0);
	const [dailyGoal] = useState(2000);
	const [mealEntries, setMealEntries] = useState<Array<MealCardProps>>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		Try(async () => {
			setIsLoading(true);
			const entries = await foodApi.getTodayFoodEntries();

			const mealEntries = entries.map((entry) => {
				const entryTime = new Date(entry.createdAt);
				const timeFormatted = entryTime.toLocaleTimeString("en-US", {
					hour: "numeric",
					minute: "2-digit",
					hour12: true,
				});

				return {
					title: entry.name,
					calories: entry.calories,
					time: timeFormatted,
					imageUrl: entry.imageUrl,
				};
			});

			setMealEntries(mealEntries);

			const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
			setCalories(totalCalories);
		}).catch(() => {
			setMealEntries([]);
			setCalories(0);
		}).finally(() => {
			setIsLoading(false);
		});
	}, []);

	const remainingCalories = dailyGoal - calories;
	const percentCalories = (calories / dailyGoal) * 100;

	return (
		<div className="px-5 pt-4">
			<div className={`rounded-3xl p-6 mb-8 ${darkMode ? "bg-primary-secondary" : "bg-white"} shadow-sm border ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-xl font-semibold">Today's Progress</h3>
					<span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
						{percentCalories.toFixed(0)}% of goal
					</span>
				</div>

				<div className="flex items-center">
					<div className="w-24 h-24 mr-6">
						<CircularProgressbar
							value={calories}
							maxValue={dailyGoal}
							text={`${calories}`}
							styles={buildStyles({
								textSize: "22px",
								textColor: darkMode ? "#fff" : "#000",
								pathColor: calories > dailyGoal ? "#FF3B30" : "#34C759",
								trailColor: darkMode ? "#333" : "#f5f5f7",
							})}
						/>
					</div>

					<div className="flex-1">
						<div className="flex justify-between mb-2">
							<span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
								Daily Goal
							</span>
							<span className="font-medium">{dailyGoal} cal</span>
						</div>

						<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
							<div
								className={`h-2 rounded-full ${calories > dailyGoal ? "bg-red-500" : "bg-green-500"}`}
								style={{ width: `${Math.min(percentCalories, 100)}%` }}
							>
							</div>
						</div>

						<div className="flex justify-between">
							<span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
								{remainingCalories > 0 ? "Remaining" : "Exceeded by"}
							</span>
							<span className={`font-medium ${remainingCalories < 0 ? "text-red-500" : ""}`}>
								{Math.abs(remainingCalories)} cal
							</span>
						</div>
					</div>
				</div>
			</div>

			<h3 className="text-xl font-semibold mb-4">Today's Meals</h3>

			{isLoading
				? (
					<div className="flex justify-center py-8">
						<div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
					</div>
				)
				: mealEntries.length > 0
				? (
					<div>
						{mealEntries.map((meal, index) => (
							<MealCard
								key={index}
								title={meal.title}
								calories={meal.calories}
								time={meal.time}
								imageUrl={meal.imageUrl}
							/>
						))}
					</div>
				)
				: (
					<div className={`p-8 rounded-2xl text-center ${darkMode ? "bg-primary-secondary" : "bg-gray-100"}`}>
						<p className="text-gray-500">No meals recorded for this day</p>
						<p className="text-sm text-gray-400 mt-2">Use the camera to add your meals</p>
					</div>
				)}
		</div>
	);
};
