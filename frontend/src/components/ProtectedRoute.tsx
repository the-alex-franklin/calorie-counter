import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
	isAuthenticated: boolean;
	redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, redirectPath = "/sign-in" }) => {
	return isAuthenticated ? <Outlet /> : <Navigate to={redirectPath} replace />;
};
