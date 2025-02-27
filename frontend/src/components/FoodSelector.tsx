import { useThemeStore } from "../data-stores/theme.ts";

export type FoodSelectorProps = {
	options: string[];
	selectedOption: string;
	onSelect: (option: string) => void;
};

export const FoodSelector = ({ options, selectedOption, onSelect }: FoodSelectorProps) => {
	const { darkMode } = useThemeStore();

	return (
		<div className="mb-6">
			<div className={`ios-segmented-control ${darkMode ? "bg-gray-800" : "bg-gray-200"} rounded-lg overflow-hidden`}>
				{options.map((option, index) => (
					<button
						key={option}
						className={`py-2 px-4 text-sm flex-1 ${
							selectedOption === option ? "bg-primary text-white" : darkMode ? "text-gray-300" : "text-gray-600"
						}`}
						onClick={() => onSelect(option)}
					>
						{option}
					</button>
				))}
			</div>
		</div>
	);
};
