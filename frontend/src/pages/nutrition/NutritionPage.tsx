import { useState } from "react";
import { FoodSelector } from "../../components/FoodSelector.tsx";
import { NutritionDetails } from "../../components/NutritionDetails.tsx";
import type { NutritionFact } from "../../components/NutritionFactRow.tsx";

type NutritionCategory = {
	title: string;
	facts: NutritionFact[];
};

const NutritionPage = () => {
	const [selectedFood, setSelectedFood] = useState("Apple");

	const foodOptions = ["Apple", "Banana", "Chicken Breast", "Greek Yogurt", "Avocado"];

	const nutritionCategories: NutritionCategory[] = [
		{
			title: "Calories & Macros",
			facts: [
				{ name: "Calories", value: "95 kcal" },
				{ name: "Total Fat", value: "0.3g", percentage: 0 },
				{ name: "Saturated Fat", value: "0.1g", percentage: 0 },
				{ name: "Trans Fat", value: "0g" },
				{ name: "Cholesterol", value: "0mg", percentage: 0 },
				{ name: "Sodium", value: "2mg", percentage: 0 },
				{
					name: "Total Carbohydrate",
					value: "25g",
					percentage: 8,
					subItems: [
						{ name: "Dietary Fiber", value: "4.4g", percentage: 16 },
						{ name: "Sugars", value: "19g" },
					],
				},
				{ name: "Protein", value: "0.5g", percentage: 1 },
			],
		},
		{
			title: "Vitamins & Minerals",
			facts: [
				{ name: "Vitamin C", value: "8.4mg", percentage: 9 },
				{ name: "Calcium", value: "11mg", percentage: 1 },
				{ name: "Iron", value: "0.2mg", percentage: 1 },
				{ name: "Potassium", value: "195mg", percentage: 4 },
				{ name: "Vitamin D", value: "0IU", percentage: 0 },
				{ name: "Vitamin B6", value: "0.1mg", percentage: 4 },
			],
		},
	];

	const keyNutrients = [
		{ name: "Fiber", percentage: 16, color: "var(--ios-green)" },
		{ name: "Vitamin C", percentage: 9, color: "var(--ios-orange)" },
		{ name: "Potassium", percentage: 4, color: "var(--ios-purple)" },
		{ name: "Vitamin B6", percentage: 4, color: "var(--ios-teal)" },
	];

	return (
		<div className="px-5 pt-4 pb-20">
			<h1 className="text-2xl font-bold mb-6">Nutrition Facts</h1>

			<FoodSelector
				options={foodOptions}
				selectedOption={selectedFood}
				onSelect={setSelectedFood}
			/>

			<NutritionDetails
				selectedFood={selectedFood}
				keyNutrients={keyNutrients}
				nutritionCategories={nutritionCategories}
			/>
		</div>
	);
};

export default NutritionPage;
