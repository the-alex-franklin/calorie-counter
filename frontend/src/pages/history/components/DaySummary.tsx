import type { FoodEntry } from "../../../data-stores/api.ts";
import { useThemeStore } from "../../../data-stores/theme.ts";

type DaySummaryProps = {
	date: string;
	calories: number;
	goalCalories: number;
	entries: FoodEntry[];
	isExpanded?: boolean;
	onToggle: () => void;
	onViewDetails?: (entries: FoodEntry[]) => void;
};

export const DaySummary = (
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
