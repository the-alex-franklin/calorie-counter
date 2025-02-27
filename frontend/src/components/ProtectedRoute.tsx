import { ReactNode, useEffect } from "react";
import { useAuthStore } from "../data-stores/auth.ts";
import { useLocation, useNavigate } from "react-router-dom";

type ProtectedRouteProps = {
	children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, refreshTokens } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const validateAuth = async () => {
			if (!isAuthenticated) {
				const refreshed = await refreshTokens();

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

	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="ios-spinner"></div>
			</div>
		);
	}

	return <>{children}</>;
}
