import DarkModeButton from "../components/DarkModeButton.tsx";
import { useAuthStore } from "../data-stores/auth.ts";

export const Dashboard = () => {
	const { logout } = useAuthStore();

	return (
		<div className="text-primary h-full flex flex-col justify-between">
			<div className="flex justify-between items-center">
				<p className="m-0">Welcome to the Dashboard</p>
				<DarkModeButton />
			</div>
			<button
				className="bg-red-500 text-white py-2 px-4 rounded border-none self-end"
				onClick={logout}
			>
				Logout
			</button>
		</div>
	);
};
