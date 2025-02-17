import { AuthProvider } from "./providers/AuthProvider.tsx";
import { Router } from "./router.tsx";

export const AppProviders = () => {
	return (
		<AuthProvider>
			<Router />
		</AuthProvider>
	);
};
