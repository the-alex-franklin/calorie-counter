// @deno-types="@types/react"
import { useEffect, useState } from "react";
import { useThemeStore } from "../../data-stores/theme.ts";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// Meal card component
interface MealCardProps {
	title: string;
	calories: number;
	time: string;
	imageUrl?: string;
}

const MealCard = ({ title, calories, time, imageUrl }: MealCardProps) => {
	const { darkMode } = useThemeStore();
	return (
		<div
			className={`flex items-center p-4 mb-3 rounded-2xl shadow-sm 
      ${darkMode ? "bg-dark-secondary" : "bg-white"} 
      border ${darkMode ? "border-gray-800" : "border-gray-100"}`}
		>
			{imageUrl && (
				<div className="w-16 h-16 mr-4 rounded-xl overflow-hidden">
					<img src={imageUrl} alt={title} className="w-full h-full object-cover" />
				</div>
			)}
			<div className="flex-1">
				<h3 className="font-medium text-lg">{title}</h3>
				<p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{time}</p>
			</div>
			<div className="text-right">
				<p className="text-lg font-medium">{calories}</p>
				<p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>calories</p>
			</div>
		</div>
	);
};

const HomePage = () => {
	const { darkMode } = useThemeStore();
	const [calories, setCalories] = useState(1200);
	const [dailyGoal] = useState(2000);
	const [mealEntries, setMealEntries] = useState<Array<MealCardProps>>([]);
	const [date, setDate] = useState(new Date());

	// Simulate data loading
	useEffect(() => {
		// Mock data - in a real app, fetch this from your API
		const mockMeals = [
			{
				title: "Breakfast Oatmeal",
				calories: 320,
				time: "8:30 AM",
				imageUrl:
					"https://images.unsplash.com/photo-1517673132405-a56a62b18caf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b2F0bWVhbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
			},
			{
				title: "Grilled Chicken Salad",
				calories: 450,
				time: "12:45 PM",
				imageUrl:
					"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsYWR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
			},
			{
				title: "Afternoon Snack",
				calories: 180,
				time: "3:15 PM",
				imageUrl:
					"https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXBwbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
			},
		];

		setMealEntries(mockMeals);
	}, []);

	// Format date like "Monday, May 15"
	const formattedDate = new Intl.DateTimeFormat("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	}).format(date);

	// Calculate remaining calories
	const remainingCalories = dailyGoal - calories;
	const percentCalories = (calories / dailyGoal) * 100;

	return (
		<div className="px-5 pt-4">
			{/* Date selector with iOS-style design */}
			<div className="flex justify-between items-center mb-6">
				<button className={`p-2 rounded-full ${darkMode ? "bg-dark-secondary" : "bg-gray-100"}`}>
					<span>⬅️</span>
				</button>
				<h2 className="text-lg font-semibold">{formattedDate}</h2>
				<button className={`p-2 rounded-full ${darkMode ? "bg-dark-secondary" : "bg-gray-100"}`}>
					<span>➡️</span>
				</button>
			</div>

			{/* Calorie summary with iOS-style card */}
			<div
				className={`rounded-3xl p-6 mb-8 ${darkMode ? "bg-dark-secondary" : "bg-white"} shadow-sm
        border ${darkMode ? "border-gray-800" : "border-gray-100"}`}
			>
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
								pathColor: calories > dailyGoal ? "#FF3B30" : "#34C759", // iOS red or green
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

			{/* Meals section */}
			<h3 className="text-xl font-semibold mb-4">Today's Meals</h3>

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
		</div>
	);
};

export default HomePage;
