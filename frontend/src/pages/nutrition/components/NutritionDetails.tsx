import { useThemeStore } from "../../../data-stores/theme.ts";
import { NutrientBar } from "./NutrientBar.tsx";
import { type NutritionFact, NutritionFactRow } from "./NutritionFactRow.tsx";

type NutritionCategory = {
	title: string;
	facts: NutritionFact[];
};

type NutritionDetailsProps = {
	selectedFood: string;
	keyNutrients: { name: string; percentage: number; color: string }[];
	nutritionCategories: NutritionCategory[];
};

export const NutritionDetails = ({ selectedFood, keyNutrients, nutritionCategories }: NutritionDetailsProps) => {
	const { darkMode } = useThemeStore();

	return (
		<div>
			<div
				className={`rounded-2xl p-5 mb-6 ${darkMode ? "bg-dark-secondary" : "bg-white"} 
        border ${darkMode ? "border-gray-800" : "border-gray-100"} shadow-sm`}
			>
				<div className="flex items-center">
					<div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden mr-4">
						<img
							src="https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
							alt={selectedFood}
							className="w-full h-full object-cover"
						/>
					</div>
					<div>
						<h2 className="text-xl font-bold">{selectedFood}</h2>
						<p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
							Medium (182g)
						</p>
						<div className="mt-2 flex">
							<div className="mr-4">
								<p className="text-lg font-bold">95</p>
								<p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
									Calories
								</p>
							</div>
							<div className="mx-4">
								<p className="text-lg font-bold">0.3g</p>
								<p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
									Fat
								</p>
							</div>
							<div className="mx-4">
								<p className="text-lg font-bold">25g</p>
								<p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
									Carbs
								</p>
							</div>
							<div className="mx-4">
								<p className="text-lg font-bold">0.5g</p>
								<p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
									Protein
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div
				className={`rounded-2xl p-5 mb-6 ${darkMode ? "bg-dark-secondary" : "bg-white"} 
        border ${darkMode ? "border-gray-800" : "border-gray-100"} shadow-sm`}
			>
				<h3 className="text-lg font-semibold mb-4">Key Nutrients</h3>

				{keyNutrients.map((nutrient, index) => (
					<NutrientBar
						key={index}
						label={nutrient.name}
						percentage={nutrient.percentage}
						color={nutrient.color}
					/>
				))}

				<p className={`text-xs mt-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
					* Percent Daily Values based on a 2,000 calorie diet
				</p>
			</div>

			<div
				className={`rounded-2xl p-5 mb-6 ${darkMode ? "bg-dark-secondary" : "bg-white"} 
        border ${darkMode ? "border-gray-800" : "border-gray-100"} shadow-sm`}
			>
				<h3 className="text-lg font-semibold mb-1">Nutrition Facts</h3>
				<p className={`text-sm mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
					Serving Size: 1 medium (182g)
				</p>

				<div className={`border-b-2 border-t-2 py-2 my-2 ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
					<div className="flex justify-between">
						<span className="font-bold">Amount Per Serving</span>
						<span></span>
					</div>
				</div>

				{nutritionCategories.map((category, index) => (
					<div key={index}>
						<h4 className="font-bold mt-4 mb-2">{category.title}</h4>
						{category.facts.map((fact, i) => <NutritionFactRow key={i} fact={fact} />)}
					</div>
				))}
			</div>
		</div>
	);
};
