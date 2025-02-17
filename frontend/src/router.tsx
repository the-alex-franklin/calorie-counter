import { Dashboard } from "./pages/Dashboard.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import { useAuth } from "./providers/AuthProvider.tsx";
import { BrowserRouter, Navigate, Route, Routes } from "npm:react-router-dom";

export function Router() {
	const { authed } = useAuth();

	return (
		<div className="w-screen h-screen bg-gray-800 flex flex-col p-12 text-black">
			<BrowserRouter>
				{authed
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
