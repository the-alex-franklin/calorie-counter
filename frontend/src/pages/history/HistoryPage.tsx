// @deno-types="@types/react"
import { useEffect, useState } from "react";
import { useThemeStore } from "../../data-stores/theme.ts";
import { foodApi, type FoodEntry } from "../../data-stores/api.ts";
import { useNavigate } from "react-router-dom";

// Day summary component with iOS styling
interface DaySummaryProps {
	date: string;
	calories: number;
	goalCalories: number;
	entries: FoodEntry[];
	isExpanded?: boolean;
	onToggle: () => void;
	onViewDetails?: (entries: FoodEntry[]) => void;
}

const DaySummary = (
	{ date, calories, goalCalories, entries, isExpanded, onToggle, onViewDetails }: DaySummaryProps,
) => {
	const { darkMode } = useThemeStore();
	const percentOfGoal = (calories / goalCalories) * 100;
	const isOverGoal = calories > goalCalories;

	// Format date nicely (e.g., "Monday, May 15")
	const displayDate = new Date(date);
	const formattedDate = new Intl.DateTimeFormat("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	}).format(displayDate);

	return (
		<div
			className={`mb-4 rounded-2xl overflow-hidden border
        ${darkMode ? "bg-dark-secondary border-gray-800" : "bg-white border-gray-100"} 
        shadow-sm transition-all duration-300`}
			style={{ maxHeight: isExpanded ? "600px" : "80px" }}
		>
			{/* Header - always visible */}
			<div
				className="flex items-center justify-between p-4 cursor-pointer"
				onClick={onToggle}
			>
				<div>
					<h3 className="font-semibold text-sm whitespace-nowrap">{formattedDate}</h3>
					<p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
						{isOverGoal ? "Exceeded goal by" : "Under goal by"} {Math.abs(goalCalories - calories)} cal
					</p>
				</div>

				<div className="flex items-center">
					<div className="mr-3 text-right">
						<p className="font-medium">{calories}</p>
						<p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
							calories
						</p>
					</div>

					<div className="w-12 h-12 relative">
						<svg viewBox="0 0 36 36" className="w-full h-full">
							<path
								d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
								fill="none"
								stroke={darkMode ? "#444" : "#eee"}
								strokeWidth="3"
							/>
							<path
								d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
								fill="none"
								stroke={isOverGoal ? "#FF3B30" : "#34C759"} // iOS colors
								strokeWidth="3"
								strokeDasharray={`${percentOfGoal}, 100`}
							/>
						</svg>
						<span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold">
							{percentOfGoal.toFixed(0)}%
						</span>
					</div>

					<span className={`ml-2 transition-transform duration-300 ${isExpanded ? "transform rotate-180" : ""}`}>
						⌄
					</span>
				</div>
			</div>

			{/* Expanded content */}
			{isExpanded && (
				<div className="p-4 border-t border-gray-200 dark:border-gray-700">
					<div className="flex justify-between mb-3">
						<span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Daily Goal</span>
						<span className="font-medium">{goalCalories} cal</span>
					</div>

					<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-3">
						<div
							className={`h-2 rounded-full ${isOverGoal ? "bg-red-500" : "bg-green-500"}`}
							style={{ width: `${Math.min(percentOfGoal, 100)}%` }}
						>
						</div>
					</div>

					<div className="mt-4">
						<div className="flex justify-between items-center mb-2">
							<h4 className="font-medium">Meals</h4>
							{entries.length > 0 && onViewDetails && (
								<button
									onClick={() => onViewDetails(entries)}
									className="text-sm text-primary"
								>
									View Details
								</button>
							)}
						</div>
						{entries.length > 0
							? (
								<div className="space-y-2">
									{entries.map((entry, idx) => {
										// Format time as "8:30 AM" from date
										const entryTime = new Date(entry.createdAt);
										const timeFormatted = entryTime.toLocaleTimeString("en-US", {
											hour: "numeric",
											minute: "2-digit",
											hour12: true,
										});

										return (
											<div
												key={idx}
												className={`p-3 rounded-xl flex items-center justify-between 
                      ${darkMode ? "bg-dark" : "bg-gray-100"}`}
											>
												<div className="flex items-center">
													{entry.imageUrl && (
														<div className="w-10 h-10 rounded-md overflow-hidden mr-3">
															<img src={entry.imageUrl} alt={entry.name} className="w-full h-full object-cover" />
														</div>
													)}
													<div>
														<p className="font-medium">{entry.name}</p>
														<p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{timeFormatted}</p>
													</div>
												</div>
												<div className="text-right">
													<p className="font-medium">{entry.calories} cal</p>
												</div>
											</div>
										);
									})}
								</div>
							)
							: (
								<div className={`p-3 rounded-xl ${darkMode ? "bg-dark" : "bg-gray-100"}`}>
									<p className="text-center text-sm text-gray-500">No meal data available for this day</p>
								</div>
							)}
					</div>
				</div>
			)}
		</div>
	);
};

// Interface for day summary data
interface DaySummaryData {
	date: string;
	calories: number;
	entries: FoodEntry[];
}

// Interface for HistoryPage props
interface HistoryPageProps {
	isEmbedded?: boolean;
}

// Main history page component
const HistoryPage = ({ isEmbedded = false }: HistoryPageProps) => {
	const { darkMode } = useThemeStore();
	const [daysData, setDaysData] = useState<DaySummaryData[]>([]);
	const [expandedDay, setExpandedDay] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [weeklyStats, setWeeklyStats] = useState({
		avgDaily: 0,
		total: 0,
		goal: 2000 * 7, // 7 days * 2000 calories daily goal
	});

	// For viewing meal details
	const [selectedEntries, setSelectedEntries] = useState<FoodEntry[] | null>(null);

	// Load data from API
	useEffect(() => {
		const loadHistoryData = async () => {
			setIsLoading(true);
			setError(null);

			try {
				// Get all entries
				const allEntries = await foodApi.getPreviousFoodEntries();

				// Group entries by date
				const entriesByDate = new Map<string, FoodEntry[]>();

				// Group entries by day
				allEntries.forEach((entry) => {
					const entryDate = new Date(entry.createdAt);
					const dateString = entryDate.toISOString().split("T")[0]!; // Format: YYYY-MM-DD

					if (!entriesByDate.has(dateString)) {
						entriesByDate.set(dateString, []);
					}

					entriesByDate.get(dateString)?.push(entry);
				});

				// Create day summary data for each day
				const summaries: DaySummaryData[] = [];

				entriesByDate.forEach((entries, dateString) => {
					const calories = entries.reduce((sum, entry) => sum + entry.calories, 0);

					summaries.push({
						date: dateString,
						calories,
						entries,
					});
				});

				// Sort by date (newest first)
				summaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

				setDaysData(summaries);

				// Calculate weekly stats for the last 7 days
				const last7Days = summaries.slice(0, Math.min(7, summaries.length));
				const totalCalories = last7Days.reduce((sum, day) => sum + day.calories, 0);
				const avgDaily = Math.round(totalCalories / last7Days.length);

				setWeeklyStats({
					avgDaily: isNaN(avgDaily) ? 0 : avgDaily,
					total: totalCalories,
					goal: 2000 * 7,
				});
			} catch (error) {
				console.error("Error loading history data:", error);
				setError("Failed to load history data. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		};

		loadHistoryData();
	}, []);

	const toggleDayExpansion = (date: string) => {
		if (expandedDay === date) {
			setExpandedDay(null);
		} else {
			setExpandedDay(date);
		}
	};

	const handleViewDetails = (entries: FoodEntry[]) => {
		setSelectedEntries(entries);
	};

	// Get current day of week (0 = Sunday, 1 = Monday, etc.)
	const currentDayOfWeek = new Date().getDay();
	// Convert to 0 = Monday, 6 = Sunday
	const adjustedDayOfWeek = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

	// If we're in embedded mode, show a simplified view
	if (isEmbedded) {
		return (
			<div>
				{isLoading
					? (
						<div className="flex justify-center py-8">
							<div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
						</div>
					)
					: daysData.length > 0
					? (
						<div>
							{/* Only show the first 3 days in embedded mode */}
							{daysData.slice(0, 3).map((day) => (
								<DaySummary
									key={day.date}
									date={day.date}
									calories={day.calories}
									goalCalories={2000}
									entries={day.entries}
									isExpanded={expandedDay === day.date}
									onToggle={() => toggleDayExpansion(day.date)}
									onViewDetails={handleViewDetails}
								/>
							))}
						</div>
					)
					: (
						<div className={`p-6 rounded-2xl text-center ${darkMode ? "bg-dark-secondary" : "bg-gray-100"}`}>
							<p className="text-gray-500">No meal history available</p>
							<p className="text-sm text-gray-400 mt-2">Use the camera to add your first meal</p>
						</div>
					)}
			</div>
		);
	}

	return (
		<div className="px-5 pt-4 pb-6">
			{/* Navigation bar for full page */}
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">History</h1>
				<div className={`rounded-full p-2 ${darkMode ? "bg-dark-secondary" : "bg-gray-100"}`}>
					<span>📅</span>
				</div>
			</div>

			{error && (
				<div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg">
					{error}
				</div>
			)}

			{isLoading
				? (
					<div className="flex justify-center py-12">
						<div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
					</div>
				)
				: (
					<>
						{/* Weekly summary */}
						<div
							className={`rounded-2xl p-5 mb-6 ${darkMode ? "bg-dark-secondary" : "bg-white"} 
            border ${darkMode ? "border-gray-800" : "border-gray-100"} shadow-sm`}
						>
							<h2 className="text-lg font-semibold mb-4">Weekly Summary</h2>

							<div className="grid grid-cols-7 gap-2 mb-4">
								{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
									// Get data for this day if available
									const isCurrentDay = index === adjustedDayOfWeek;
									const dayData = daysData[6 - index]; // Last 7 days in reverse order
									const hasData = dayData && dayData.calories > 0;

									return (
										<div key={index} className="text-center">
											<div
												className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center
                      ${isCurrentDay ? "bg-primary text-white" : darkMode ? "bg-dark" : "bg-gray-100"}`}
											>
												{day}
											</div>
											<div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
												{hasData ? dayData.calories : "---"}
											</div>
										</div>
									);
								})}
							</div>

							<div className="flex justify-between text-sm">
								<div>
									<p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>Avg. Daily</p>
									<p className="font-medium">{weeklyStats.avgDaily} cal</p>
								</div>
								<div>
									<p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total</p>
									<p className="font-medium">{weeklyStats.total} cal</p>
								</div>
								<div>
									<p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>Goal</p>
									<p className="font-medium">{weeklyStats.goal} cal</p>
								</div>
							</div>
						</div>

						<h2 className="text-lg font-semibold mb-4">Daily Breakdown</h2>

						{/* List of day summaries */}
						<div>
							{daysData.length > 0
								? (
									daysData.map((day) => (
										<DaySummary
											key={day.date}
											date={day.date}
											calories={day.calories}
											goalCalories={2000}
											entries={day.entries}
											isExpanded={expandedDay === day.date}
											onToggle={() => toggleDayExpansion(day.date)}
											onViewDetails={handleViewDetails}
										/>
									))
								)
								: (
									<div className={`p-8 rounded-2xl text-center ${darkMode ? "bg-dark-secondary" : "bg-gray-100"}`}>
										<p className="text-gray-500">No meal history available</p>
										<p className="text-sm text-gray-400 mt-2">Use the camera to add your first meal</p>
									</div>
								)}
						</div>
					</>
				)}

			{/* Meal details modal */}
			{selectedEntries && (
				<div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
					<div
						className={`w-11/12 max-w-lg rounded-2xl p-5 ${
							darkMode ? "bg-dark" : "bg-white"
						} max-h-[80vh] overflow-auto hide-scrollbar`}
					>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-bold">Meal Details</h3>
							<button onClick={() => setSelectedEntries(null)} className="text-xl">×</button>
						</div>

						{selectedEntries.map((entry, idx) => (
							<div key={idx} className={`mb-4 p-4 rounded-xl ${darkMode ? "bg-dark-secondary" : "bg-gray-100"}`}>
								<div className="flex items-center mb-3">
									{entry.imageUrl && (
										<div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
											<img src={entry.imageUrl} alt={entry.name} className="w-full h-full object-cover" />
										</div>
									)}
									<div>
										<h4 className="text-lg font-semibold">{entry.name}</h4>
										<p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
											{new Date(entry.createdAt).toLocaleString()}
										</p>
									</div>
								</div>

								<div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
									<span>Total Calories</span>
									<span className="font-medium">{entry.calories} cal</span>
								</div>

								{entry.ingredients && entry.ingredients.length > 0 && (
									<div className="mt-3">
										<h5 className="font-medium mb-2">Ingredients</h5>
										{entry.ingredients.map((ingredient, i) => (
											<div key={i} className="flex justify-between py-1 text-sm">
												<span>{ingredient.name}</span>
												<div>
													<span className="mr-2">{ingredient.calories} cal</span>
													<span className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
														({ingredient.percentage}%)
													</span>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						))}

						<button
							onClick={() => setSelectedEntries(null)}
							className="w-full py-3 bg-primary text-white rounded-xl mt-2"
						>
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default HistoryPage;
