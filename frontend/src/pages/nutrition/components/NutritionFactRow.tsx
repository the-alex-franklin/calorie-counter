import { useThemeStore } from "../../../data-stores/theme.ts";

export type NutritionFact = {
	name: string;
	value: string;
	percentage?: number;
	subItems?: Array<{
		name: string;
		value: string;
		percentage?: number;
	}>;
};

export type NutritionFactRowProps = {
	fact: NutritionFact;
	indent?: boolean;
};

export const NutritionFactRow = ({ fact, indent = false }: NutritionFactRowProps) => {
	const { darkMode } = useThemeStore();

	return (
		<>
			<div
				className={`flex justify-between py-2 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} ${
					indent ? "pl-6" : ""
				}`}
			>
				<span className={`font-${indent ? "normal" : "medium"}`}>{fact.name}</span>
				<div className="flex items-center">
					<span className="mr-4">{fact.value}</span>
					{fact.percentage !== undefined && (
						<span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} w-12 text-right`}>
							{fact.percentage}%
						</span>
					)}
				</div>
			</div>

			{fact.subItems?.map((subItem, index) => (
				<div
					key={index}
					className={`flex justify-between py-2 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} pl-6`}
				>
					<span>{subItem.name}</span>
					<div className="flex items-center">
						<span className="mr-4">{subItem.value}</span>
						{subItem.percentage !== undefined && (
							<span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} w-12 text-right`}>
								{subItem.percentage}%
							</span>
						)}
					</div>
				</div>
			))}
		</>
	);
};
