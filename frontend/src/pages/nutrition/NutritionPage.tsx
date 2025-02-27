// @deno-types="@types/react"
import { useState } from "react";
import { useThemeStore } from "../../data-stores/theme.ts";

// Nutrition fact type
interface NutritionFact {
  name: string;
  value: string;
  percentage?: number;
  subItems?: Array<{
    name: string;
    value: string;
    percentage?: number;
  }>;
}

// Nutrition category type
interface NutritionCategory {
  title: string;
  facts: NutritionFact[];
}

// Nutrient bar component
interface NutrientBarProps {
  label: string;
  percentage: number;
  color?: string;
}

const NutrientBar = ({ label, percentage, color = "var(--ios-blue)" }: NutrientBarProps) => {
  const { darkMode } = useThemeStore();
  
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className={`h-2 w-full rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div 
          className="h-2 rounded-full"
          style={{ 
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color
          }}
        ></div>
      </div>
    </div>
  );
};

// Nutrition fact row component
interface NutritionFactRowProps {
  fact: NutritionFact;
  indent?: boolean;
}

const NutritionFactRow = ({ fact, indent = false }: NutritionFactRowProps) => {
  const { darkMode } = useThemeStore();
  
  return (
    <>
      <div className={`flex justify-between py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${indent ? 'pl-6' : ''}`}>
        <span className={`font-${indent ? 'normal' : 'medium'}`}>{fact.name}</span>
        <div className="flex items-center">
          <span className="mr-4">{fact.value}</span>
          {fact.percentage !== undefined && (
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-12 text-right`}>
              {fact.percentage}%
            </span>
          )}
        </div>
      </div>
      
      {fact.subItems?.map((subItem, index) => (
        <div key={index} className={`flex justify-between py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pl-6`}>
          <span>{subItem.name}</span>
          <div className="flex items-center">
            <span className="mr-4">{subItem.value}</span>
            {subItem.percentage !== undefined && (
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-12 text-right`}>
                {subItem.percentage}%
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

// Food selector component
interface FoodSelectorProps {
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
}

const FoodSelector = ({ options, selectedOption, onSelect }: FoodSelectorProps) => {
  const { darkMode } = useThemeStore();
  
  return (
    <div className="mb-6">
      <div className={`ios-segmented-control ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg overflow-hidden`}>
        {options.map((option, index) => (
          <button
            key={option}
            className={`py-2 px-4 text-sm flex-1 ${selectedOption === option ? 
              'bg-primary text-white' : 
              darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main nutrition page
const NutritionPage = () => {
  const { darkMode } = useThemeStore();
  const [selectedFood, setSelectedFood] = useState("Apple");
  
  // Mock food options
  const foodOptions = ["Apple", "Banana", "Chicken Breast", "Greek Yogurt", "Avocado"];
  
  // Mock nutrition categories with facts
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
        { name: "Total Carbohydrate", value: "25g", percentage: 8, 
          subItems: [
            { name: "Dietary Fiber", value: "4.4g", percentage: 16 },
            { name: "Sugars", value: "19g" },
          ] 
        },
        { name: "Protein", value: "0.5g", percentage: 1 },
      ]
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
      ]
    }
  ];
  
  // Mock key nutrients for visualization
  const keyNutrients = [
    { name: "Fiber", percentage: 16, color: "var(--ios-green)" },
    { name: "Vitamin C", percentage: 9, color: "var(--ios-orange)" },
    { name: "Potassium", percentage: 4, color: "var(--ios-purple)" },
    { name: "Vitamin B6", percentage: 4, color: "var(--ios-teal)" },
  ];
  
  return (
    <div className="px-5 pt-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Nutrition Facts</h1>
      
      {/* Food selector */}
      <FoodSelector 
        options={foodOptions} 
        selectedOption={selectedFood} 
        onSelect={setSelectedFood} 
      />
      
      {/* Food image and summary */}
      <div className={`rounded-2xl p-5 mb-6 ${darkMode ? 'bg-dark-secondary' : 'bg-white'} 
        border ${darkMode ? 'border-gray-800' : 'border-gray-100'} shadow-sm`}>
        <div className="flex items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden mr-4">
            <img 
              src="https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
              alt="Apple" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{selectedFood}</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Medium (182g)
            </p>
            <div className="mt-2 flex">
              <div className="mr-4">
                <p className="text-lg font-bold">95</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Calories
                </p>
              </div>
              <div className="mx-4">
                <p className="text-lg font-bold">0.3g</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Fat
                </p>
              </div>
              <div className="mx-4">
                <p className="text-lg font-bold">25g</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Carbs
                </p>
              </div>
              <div className="mx-4">
                <p className="text-lg font-bold">0.5g</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Protein
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Key nutrients visualization */}
      <div className={`rounded-2xl p-5 mb-6 ${darkMode ? 'bg-dark-secondary' : 'bg-white'} 
        border ${darkMode ? 'border-gray-800' : 'border-gray-100'} shadow-sm`}>
        <h3 className="text-lg font-semibold mb-4">Key Nutrients</h3>
        
        {keyNutrients.map((nutrient, index) => (
          <NutrientBar 
            key={index}
            label={nutrient.name}
            percentage={nutrient.percentage}
            color={nutrient.color}
          />
        ))}
        
        <p className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          * Percent Daily Values based on a 2,000 calorie diet
        </p>
      </div>
      
      {/* Detailed nutrition facts */}
      <div className={`rounded-2xl p-5 mb-6 ${darkMode ? 'bg-dark-secondary' : 'bg-white'} 
        border ${darkMode ? 'border-gray-800' : 'border-gray-100'} shadow-sm`}>
        <h3 className="text-lg font-semibold mb-1">Nutrition Facts</h3>
        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Serving Size: 1 medium (182g)
        </p>
        
        <div className={`border-b-2 border-t-2 py-2 my-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <div className="flex justify-between">
            <span className="font-bold">Amount Per Serving</span>
            <span></span>
          </div>
        </div>
        
        {nutritionCategories.map((category, index) => (
          <div key={index}>
            <h4 className="font-bold mt-4 mb-2">{category.title}</h4>
            {category.facts.map((fact, i) => (
              <NutritionFactRow key={i} fact={fact} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionPage;