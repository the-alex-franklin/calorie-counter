// @deno-types="@types/react"
import { useEffect, useState } from "react";
import { useThemeStore } from "../../data-stores/theme.ts";

// Nutrition data type
interface NutritionData {
  date: string;
  calories: number;
  goalCalories: number;
}

// Day summary component with iOS styling
interface DaySummaryProps {
  date: string;
  calories: number;
  goalCalories: number;
  isExpanded?: boolean;
  onToggle: () => void;
}

const DaySummary = ({ date, calories, goalCalories, isExpanded, onToggle }: DaySummaryProps) => {
  const { darkMode } = useThemeStore();
  const percentOfGoal = (calories / goalCalories) * 100;
  const isOverGoal = calories > goalCalories;
  
  // Format date nicely (e.g., "Monday, May 15")
  const displayDate = new Date(date);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(displayDate);

  return (
    <div 
      className={`mb-4 rounded-2xl overflow-hidden border
        ${darkMode ? 'bg-dark-secondary border-gray-800' : 'bg-white border-gray-100'} 
        shadow-sm transition-all duration-200`}
      style={{ maxHeight: isExpanded ? '400px' : '80px' }}
    >
      {/* Header - always visible */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div>
          <h3 className="font-semibold">{formattedDate}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isOverGoal ? 'Exceeded goal by' : 'Under goal by'} {Math.abs(goalCalories - calories)} cal
          </p>
        </div>
        
        <div className="flex items-center">
          <div className="mr-3 text-right">
            <p className="font-medium">{calories}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              calories
            </p>
          </div>
          
          <div className="w-12 h-12 relative">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={darkMode ? '#444' : '#eee'}
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isOverGoal ? '#FF3B30' : '#34C759'} // iOS colors
                strokeWidth="3"
                strokeDasharray={`${percentOfGoal}, 100`}
              />
            </svg>
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold">
              {percentOfGoal.toFixed(0)}%
            </span>
          </div>
          
          <span className={`ml-2 transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`}>
            ⌄
          </span>
        </div>
      </div>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between mb-3">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Daily Goal</span>
            <span className="font-medium">{goalCalories} cal</span>
          </div>
          
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-3">
            <div 
              className={`h-2 rounded-full ${isOverGoal ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(percentOfGoal, 100)}%` }}
            ></div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Meals</h4>
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-dark' : 'bg-gray-100'}`}>
              <p className="text-center text-sm text-gray-500">No meal data available for this day</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main history page component
const HistoryPage = () => {
  const { darkMode } = useThemeStore();
  const [nutritionData, setNutritionData] = useState<NutritionData[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  
  // Load mock data
  useEffect(() => {
    // Generate last 10 days of mock data
    const today = new Date();
    const mockData: NutritionData[] = [];
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        calories: Math.floor(Math.random() * 1000) + 1200, // Random calories between 1200-2200
        goalCalories: 2000,
      });
    }
    
    setNutritionData(mockData);
  }, []);
  
  const toggleDayExpansion = (date: string) => {
    if (expandedDay === date) {
      setExpandedDay(null);
    } else {
      setExpandedDay(date);
    }
  };

  return (
    <div className="px-5 pt-4 pb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">History</h1>
        <div className={`rounded-full p-2 ${darkMode ? 'bg-dark-secondary' : 'bg-gray-100'}`}>
          <span>📅</span>
        </div>
      </div>
      
      {/* Weekly summary */}
      <div className={`rounded-2xl p-5 mb-6 ${darkMode ? 'bg-dark-secondary' : 'bg-white'} 
        border ${darkMode ? 'border-gray-800' : 'border-gray-100'} shadow-sm`}>
        <h2 className="text-lg font-semibold mb-4">Weekly Summary</h2>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <div key={index} className="text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center
                ${index === 2 ? 'bg-primary text-white' : darkMode ? 'bg-dark' : 'bg-gray-100'}`}>
                {day}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {index === 2 ? '1854' : '---'}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-sm">
          <div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg. Daily</p>
            <p className="font-medium">1854 cal</p>
          </div>
          <div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
            <p className="font-medium">5562 cal</p>
          </div>
          <div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Goal</p>
            <p className="font-medium">14000 cal</p>
          </div>
        </div>
      </div>
      
      <h2 className="text-lg font-semibold mb-4">Daily Breakdown</h2>
      
      {/* List of day summaries */}
      <div>
        {nutritionData.map((day) => (
          <DaySummary
            key={day.date}
            date={day.date}
            calories={day.calories}
            goalCalories={day.goalCalories}
            isExpanded={expandedDay === day.date}
            onToggle={() => toggleDayExpansion(day.date)}
          />
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;