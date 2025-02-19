// @deno-types="@types/react"
import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType } from "@capacitor/camera";
import { Transition } from "@headlessui/react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

const COLORS = ["#ff7f0e", "#2ca02c", "#1f77b4"]; // Orange (Carbs), Green (Fats), Blue (Protein)

const mockMeals = [
	{ id: 1, name: "Chicken & Rice", calories: 600, carbs: 40, fats: 10, protein: 50, date: "Today" },
	{ id: 2, name: "Avocado Toast", calories: 350, carbs: 30, fats: 15, protein: 10, date: "Yesterday" },
	{ id: 3, name: "Protein Shake", calories: 200, carbs: 20, fats: 5, protein: 30, date: "Yesterday" },
];

export const Dashboard = () => {
	const [photo, setPhoto] = useState<string | null>(null);
	const [calories, setCalories] = useState<number | null>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const takePhoto = async () => {
		if (Capacitor.isNativePlatform()) {
			try {
				const capturedPhoto = await Camera.getPhoto({
					resultType: CameraResultType.Uri,
					quality: 80,
				});
				setPhoto(capturedPhoto.webPath || null);
				setCalories(Math.floor(Math.random() * (800 - 200 + 1)) + 200); // Placeholder calorie estimate
			} catch (error) {
				console.error("Camera error:", error);
			}
		}
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const imageUrl = URL.createObjectURL(file);
			setPhoto(imageUrl);
			setCalories(Math.floor(Math.random() * (800 - 200 + 1)) + 200); // Placeholder calorie estimate
		}
	};

	const totalCalories = mockMeals.reduce((sum, meal) => sum + meal.calories, 0);
	const macrosData = [
		{ name: "Carbs", value: mockMeals.reduce((sum, meal) => sum + meal.carbs, 0) },
		{ name: "Fats", value: mockMeals.reduce((sum, meal) => sum + meal.fats, 0) },
		{ name: "Protein", value: mockMeals.reduce((sum, meal) => sum + meal.protein, 0) },
	];

	return (
		<div className="h-full w-full flex flex-col bg-gray-100 text-gray-900">
			{/* Sticky Header */}
			<header className="sticky top-0 w-full bg-primary text-white shadow-md flex justify-between px-6 py-4 z-1">
				<button
					onClick={() => setIsMenuOpen(true)}
					className="bg-primary border-none text-5xl font-bold flex p-0"
				>
					&#9776;
				</button>
				<h1 className="text-xl font-bold">AI Calorie Counter</h1>
			</header>

			{/* Side Drawer */}
			<Transition
				show={isMenuOpen}
				enter="transition duration-300"
				enterFrom="transform -translate-x-full"
				enterTo="transform translate-x-0"
				leave="transition duration-300"
				leaveFrom="transform translate-x-0"
				leaveTo="transform -translate-x-full"
			>
				<div className="z-1 fixed top-0 left-0 w-64 h-full bg-white shadow-md p-6">
					<button className="text-gray-800 text-2xl mb-4" onClick={() => setIsMenuOpen(false)}>✕</button>
					<nav className="flex flex-col gap-4">
						<a href="#" className="text-lg font-medium">Profile</a>
						<a href="#" className="text-lg font-medium">Settings</a>
						<a href="#" className="text-lg font-medium">Logout</a>
					</nav>
				</div>
			</Transition>

			{/* Main Content (THIS GROWS) */}
			<main className="flex-grow flex flex-col gap-6 p-6">
				{/* Calorie Circle Graph */}
				<div className="flex flex-col items-center">
					<h2 className="text-lg font-semibold">Today's Intake</h2>
					<div className="w-64 h-64">
						<PieChart width={250} height={250}>
							<Pie data={macrosData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
								{macrosData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
							</Pie>
							<Tooltip />
						</PieChart>
					</div>
					<p className="text-gray-700 font-medium">Total: {totalCalories} kcal</p>
				</div>

				{/* Past Meals Record */}
				<section className="bg-white shadow-md rounded-lg p-6">
					<h2 className="text-lg font-semibold mb-4">Meal History</h2>
					<div className="flex flex-col gap-4">
						{mockMeals.map((meal) => (
							<div key={meal.id} className="flex justify-between border-b pb-2 last:border-b-0">
								<div>
									<h3 className="text-md font-medium">{meal.name}</h3>
									<p className="text-sm text-gray-600">{meal.date}</p>
								</div>
								<p className="text-md font-medium">{meal.calories} kcal</p>
							</div>
						))}
					</div>
				</section>

				{/* Photo Upload */}
				<div className="flex justify-center">
					{Capacitor.isNativePlatform()
						? (
							<button
								className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md"
								onClick={takePhoto}
							>
								Take a Photo
							</button>
						)
						: (
							<label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md">
								Upload a Photo
								<input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
							</label>
						)}
				</div>
			</main>
		</div>
	);
};
