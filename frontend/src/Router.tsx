import { App } from "./pages/App.tsx";
import SignIn from "./pages/auth/SignIn.tsx";
import SignUp from "./pages/auth/SignUp.tsx";
import { BrowserRouter, Navigate, Route, Routes } from "npm:react-router-dom";
import { useAuthStore } from "./data-stores/auth.ts";
import { useThemeStore } from "./data-stores/theme.ts";
import { useEffect } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";

export function Router() {
	const { isAuthenticated } = useAuthStore();
	const { initTheme } = useThemeStore();

	useEffect(() => {
		initTheme();
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/sign-up" element={!isAuthenticated ? <SignUp /> : <Navigate to="/home" />} />
				<Route path="/sign-in" element={!isAuthenticated ? <SignIn /> : <Navigate to="/home" />} />

				<Route
					path="/home"
					element={
						<ProtectedRoute>
							<App />
						</ProtectedRoute>
					}
				/>

				<Route
					path="*"
					element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/sign-in" replace />}
				/>
			</Routes>
		</BrowserRouter>
	);
}
