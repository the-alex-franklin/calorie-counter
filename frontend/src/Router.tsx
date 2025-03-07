import { App } from "./pages/App.tsx";
import { SignIn } from "./pages/auth/SignIn.tsx";
import { SignUp } from "./pages/auth/SignUp.tsx";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./data-stores/auth.ts";
import { useThemeStore } from "./data-stores/theme.ts";
import { useLayoutEffect } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";

export function Router() {
	const { isAuthenticated } = useAuthStore();
	const { initTheme } = useThemeStore();

	useLayoutEffect(() => {
		initTheme();
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/sign-up" element={!isAuthenticated ? <SignUp /> : <Navigate to="/home" />} />
				<Route path="/sign-in" element={!isAuthenticated ? <SignIn /> : <Navigate to="/home" />} />

				<Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
					<Route path="/home" element={<App />} />
				</Route>

				<Route path="*" element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/sign-in" replace />} />
			</Routes>
		</BrowserRouter>
	);
}
