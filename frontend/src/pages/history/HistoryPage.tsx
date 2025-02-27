import { useEffect, useState } from "react";
import { useThemeStore } from "../../data-stores/theme.ts";
import { foodApi, type FoodEntry } from "../../data-stores/api.ts";
import { DaySummary } from "../../components/DaySummary.tsx";
import { Try } from "fp-try";

type DaySummaryData = {
	date: string;
	calories: number;
	entries: FoodEntry[];
};

type HistoryPageProps = {
	isEmbedded?: boolean;
};

export const HistoryPage = ({ isEmbedded = false }: HistoryPageProps) => {
	const { darkMode } = useThemeStore();
	const [daysData, setDaysData] = useState<DaySummaryData[]>([]);
	const [expandedDay, setExpandedDay] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [weeklyStats, setWeeklyStats] = useState({
		avgDaily: 0,
		total: 0,
		goal: 2000 * 7,
	});

	const [selectedEntries, setSelectedEntries] = useState<FoodEntry[] | null>(null);

	useEffect(() => {
		Try(async () => {
			setIsLoading(true);
			setError(null);

			const allEntries = await foodApi.getPreviousFoodEntries();
			const entriesByDate = new Map<string, FoodEntry[]>();

			allEntries.forEach((entry) => {
				const entryDate = new Date(entry.createdAt);
				const dateString = entryDate.toISOString().split("T")[0]!;

				if (!entriesByDate.has(dateString)) entriesByDate.set(dateString, []);
				entriesByDate.get(dateString)?.push(entry);
			});

			const summaries: DaySummaryData[] = [];

			entriesByDate.forEach((entries, dateString) => {
				const calories = entries.reduce((sum, entry) => sum + entry.calories, 0);

				summaries.push({
					date: dateString,
					calories,
					entries,
				});
			});

			summaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

			setDaysData(summaries);

			const last7Days = summaries.slice(0, Math.min(7, summaries.length));
			const totalCalories = last7Days.reduce((sum, day) => sum + day.calories, 0);
			const avgDaily = Math.round(totalCalories / last7Days.length);

			setWeeklyStats({
				avgDaily: isNaN(avgDaily) ? 0 : avgDaily,
				total: totalCalories,
				goal: 2000 * 7,
			});
		}).catch(() => {
			setError("Failed to load history data. Please try again later.");
		}).finally(() => {
			setIsLoading(false);
		});
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

	const currentDayOfWeek = new Date().getDay();

	const adjustedDayOfWeek = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

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
						<div
							className={`rounded-2xl p-5 mb-6 ${darkMode ? "bg-dark-secondary" : "bg-white"} 
            border ${darkMode ? "border-gray-800" : "border-gray-100"} shadow-sm`}
						>
							<h2 className="text-lg font-semibold mb-4">Weekly Summary</h2>

							<div className="grid grid-cols-7 gap-2 mb-4">
								{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
									const isCurrentDay = index === adjustedDayOfWeek;
									const dayData = daysData[6 - index];
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
