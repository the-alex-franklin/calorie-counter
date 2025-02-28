import { useThemeStore } from "../../../data-stores/theme.ts";

type SettingItemProps = {
	icon: string;
	label: string;
	value?: string | number;
	toggle?: boolean;
	isToggled?: boolean;
	onToggle?: () => void;
	onClick?: () => void;
	danger?: boolean;
};

export const SettingItem = ({
	icon,
	label,
	value,
	toggle,
	isToggled,
	onToggle,
	onClick,
	danger,
}: SettingItemProps) => {
	const { darkMode } = useThemeStore();

	return (
		<div className={`flex items-center justify-between p-3 mb-3 rounded-xl cursor-pointer ${darkMode ? "bg-primary-secondary" : "bg-white"} border ${darkMode ? "border-gray-800" : "border-gray-100"}`} onClick={onClick || onToggle}>
			<div className="flex items-center">
				<div
					className={`w-8 h-8 flex items-center justify-center rounded-full mr-2
          ${danger ? "bg-red-500" : "bg-appBlue bg-opacity-20"}`}
				>
					<span className={danger ? "text-white" : "text-primary"}>{icon}</span>
				</div>
				<span className={danger ? "text-red-500 font-medium" : ""}>{label}</span>
			</div>

			{toggle
				? (
					<div className={`w-12 h-6 rounded-full relative transition-colors ${isToggled ? "bg-appBlue" : darkMode ? "bg-gray-700" : "bg-gray-300"}`}>
						<div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${isToggled ? "right-0.5" : "left-0.5"}`} />
					</div>
				)
				: value
				? <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{value}</span>
				: <span className="text-gray-400">〉</span>}
		</div>
	);
};
