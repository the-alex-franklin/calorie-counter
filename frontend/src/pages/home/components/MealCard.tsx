export type MealCardProps = {
	title: string;
	calories: number;
	time: string;
	imageUrl?: string;
};

export const MealCard = ({ title, calories, time, imageUrl }: MealCardProps) => {
	return (
		<div className={`flex items-center p-4 mb-3 rounded-2xl shadow-sm border bg-card dark:border-gray-800 border-gray-100`}>
			{imageUrl && (
				<div className="w-16 h-16 mr-4 rounded-xl overflow-hidden">
					<img src={imageUrl} alt={title} className="w-full h-full object-cover" />
				</div>
			)}
			<div className="flex-1">
				<h3 className="font-medium text-lg">{title}</h3>
				<p className={`text-sm dark:text-gray-400 text-gray-500`}>{time}</p>
			</div>
			<div className="text-right">
				<p className="text-lg font-medium">{calories}</p>
				<p className={`text-xs dark:text-gray-400 text-gray-500`}>calories</p>
			</div>
		</div>
	);
};
