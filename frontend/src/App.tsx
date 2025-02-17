import { Dashboard } from "./pages/Dashboard.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import { BrowserRouter, Navigate, Route, Routes } from "npm:react-router-dom";
import { useAuthStore } from "./state/auth.ts";

export function App() {
	const { user } = useAuthStore();

	return (
		<div className="w-screen h-screen bg-gray-800 flex flex-col p-12 text-black">
			<BrowserRouter>
				{user
					? (
						<Routes>
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="*" element={<Navigate to="/dashboard" />} />
						</Routes>
					)
					: (
						<Routes>
							<Route path="/sign-up" element={<SignUp />} />
							<Route path="/sign-in" element={<SignIn />} />
							<Route path="*" element={<Navigate to="/sign-in" />} />
						</Routes>
					)}
			</BrowserRouter>
		</div>
	);
}
