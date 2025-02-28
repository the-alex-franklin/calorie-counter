import { useEffect, useState } from "react";
import { useThemeStore } from "../../data-stores/theme.ts";
import { foodApi, type FoodEntry } from "../../data-stores/api.ts";
import { DaySummary, type DaySummaryData } from "./components/DaySummary.tsx";
import { Try } from "fp-try";

export const HistoryPage = () => {
	const { darkMode } = useThemeStore();
	const [daysData, setDaysData] = useState<DaySummaryData[]>([]);
	const [expandedDay, setExpandedDay] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);

		Try(async () => {
			const allEntries = await foodApi.getPreviousFoodEntries();
			const entriesByDate = new Map<string, FoodEntry[]>();

			allEntries.forEach((entry) => {
				const mapKey = entry.createdAt.toLocaleDateString();

				if (!entriesByDate.has(mapKey)) entriesByDate.set(mapKey, []);
				entriesByDate.get(mapKey)?.push(entry);
			});

			const summaries: DaySummaryData[] = Array.from(entriesByDate, ([dateString, entries]) => ({
				date: dateString,
				calories: entries.reduce((sum, entry) => sum + entry.calories, 0),
				entries,
			}));

			summaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

			setDaysData(summaries);
		}).finally(() => setIsLoading(false));
	}, []);

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
						{daysData.map((day) => (
							<DaySummary
								key={day.date}
								date={day.date}
								calories={day.calories}
								goalCalories={2000}
								entries={day.entries}
								isExpanded={expandedDay === day.date}
								onToggle={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
							/>
						))}
					</div>
				)
				: (
					<div className={`p-6 rounded-2xl text-center bg-card`}>
						<p className="text-gray-500">No meal history available</p>
						<p className="text-sm text-gray-400 mt-2">Use the camera to add your first meal</p>
					</div>
				)}
		</div>
	);
};
