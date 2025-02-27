import { useThemeStore } from "../data-stores/theme.ts";

export type NutrientBarProps = {
	label: string;
	percentage: number;
	color?: string;
};

export const NutrientBar = ({ label, percentage, color = "var(--ios-blue)" }: NutrientBarProps) => {
	const { darkMode } = useThemeStore();

	return (
		<div className="mb-3">
			<div className="flex justify-between text-sm mb-1">
				<span>{label}</span>
				<span>{percentage}%</span>
			</div>
			<div className={`h-2 w-full rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
				<div
					className="h-2 rounded-full"
					style={{
						width: `${Math.min(percentage, 100)}%`,
						backgroundColor: color,
					}}
				>
				</div>
			</div>
		</div>
	);
};
