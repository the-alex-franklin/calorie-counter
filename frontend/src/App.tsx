import { Dashboard } from "./pages/Dashboard.tsx";
import SignIn from "./pages/auth/SignIn.tsx";
import SignUp from "./pages/auth/SignUp.tsx";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "npm:react-router-dom";
import { useAuthStore } from "./data-stores/auth.ts";
import { useThemeStore } from "./data-stores/theme.ts";
import { ReactNode, useEffect } from "react";

// Protected route wrapper component
interface ProtectedRouteProps {
	children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, refreshTokens } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const validateAuth = async () => {
			// If not authenticated, try to refresh the token
			if (!isAuthenticated) {
				const refreshed = await refreshTokens();
				// If refresh failed, redirect to login
				if (!refreshed) {
					navigate("/sign-in", {
						replace: true,
						state: { from: location.pathname },
					});
				}
			}
		};

		validateAuth();
	}, [isAuthenticated, location, navigate, refreshTokens]);

	// Show loading state while checking authentication
	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="ios-spinner"></div>
			</div>
		);
	}

	// Return children when authenticated
	return <>{children}</>;
}

// Main App component
export function App() {
	const { isAuthenticated } = useAuthStore();
	const { initTheme } = useThemeStore();

	// Initialize theme at app root level
	useEffect(() => {
		initTheme();
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				{/* Public routes */}
				<Route path="/sign-up" element={!isAuthenticated ? <SignUp /> : <Navigate to="/dashboard" />} />
				<Route path="/sign-in" element={!isAuthenticated ? <SignIn /> : <Navigate to="/dashboard" />} />

				{/* Protected routes */}
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}
				/>

				{/* Redirect default routes based on auth state */}
				<Route
					path="*"
					element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/sign-in" replace />}
				/>
			</Routes>
		</BrowserRouter>
	);
}
