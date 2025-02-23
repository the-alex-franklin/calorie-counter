import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

type MacroData = {
	protein: number;
	fats: number;
	carbs: number;
};

type RingChartProps = {
	totalCalories: number;
	macros: MacroData;
};

export function RingChart({ totalCalories, macros }: RingChartProps) {
	const data = [
		{ name: "Protein", value: macros.protein, color: "#4CAF50" }, // Green
		{ name: "Fats", value: macros.fats, color: "#FF9800" }, // Orange
		{ name: "Carbs", value: macros.carbs, color: "#2196F3" }, // Blue
	];

	return (
		<div className="flex flex-col items-center justify-center w-full">
			<div className="relative w-64 h-64">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={data}
							dataKey="value"
							cx="50%"
							cy="50%"
							innerRadius="75%"
							outerRadius="100%"
							startAngle={90}
							endAngle={-270} // Full circle effect
							stroke="none"
						>
							{data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
						</Pie>
					</PieChart>
				</ResponsiveContainer>

				{/* Center Text */}
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className="text-2xl font-bold">{totalCalories}</span>
					<span className="text-sm text-gray-500">kcal</span>
				</div>
			</div>
		</div>
	);
}
