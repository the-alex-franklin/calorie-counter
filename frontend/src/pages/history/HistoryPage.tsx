import { useEffect, useState } from "react";
import { foodApi, type FoodEntry } from "../../data-stores/api.ts";
import { DaySummary } from "./components/DaySummary.tsx";
import { Try } from "fp-try";

type DaySummaryData = {
	date: string;
	calories: number;
	entries: FoodEntry[];
};

export const HistoryPage = () => {
	const [daysData, setDaysData] = useState<DaySummaryData[]>([]);
	const [expandedDay, setExpandedDay] = useState<string | null>(null);

	useEffect(() => {
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
		});
	}, []);

	return (
		<div>
			{daysData.length > 0
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
