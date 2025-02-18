import { useAuthStore } from "../state/auth.ts";

export const Dashboard = () => {
	const { logout } = useAuthStore();

	return (
		<div className="text-white flex justify-between">
			<p className="m-0">Welcome to the Dashboard</p>
			<button
				className="bg-red-500 text-white py-2 px-4 rounded border-none"
				onClick={logout}
			>
				Logout
			</button>
		</div>
	);
};
