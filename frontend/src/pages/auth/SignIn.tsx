import { useEffect, useState } from "react";
import { FormInput } from "./components/FormInput.tsx";
import { FormButton } from "./components/FormButton.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../data-stores/auth.ts";
import { Capacitor } from "@capacitor/core";
import { Try } from "fp-try";

export const SignIn = () => {
	const isMobile = Capacitor.isNativePlatform();
	const { login } = useAuthStore();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleLogin = async () => {
		if (isLoading) return;

		setIsLoading(true);
		setError(null);

		const login_result = await Try(() => login(email, password));
		if (login_result.failure) setIsLoading(false);
	};

	useEffect(() => {
		if (useAuthStore.getState().isAuthenticated) {
			navigate("/home", { replace: true });
		}
	}, [navigate]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleLogin();
		}
	};

	return (
		<div className="max-w-md p-6 bg-white shadow-md rounded-lg">
			<h1 className="text-xl font-semibold mb-6">Sign In</h1>
			{error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

			<div>
				<FormInput
					label="Email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onKeyDown={handleKeyDown}
					required
					disabled={isLoading}
					autoComplete="email"
				/>
				<FormInput
					label="Password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					onKeyDown={handleKeyDown}
					required
					disabled={isLoading}
					autoComplete="current-password"
				/>
				<FormButton
					text={isLoading ? "Signing In..." : "Sign In"}
					type="button"
					onClick={handleLogin}
					disabled={isLoading}
				/>
			</div>

			<p className="mt-4 text-sm">
				Don't already have an account? <Link to="/sign-up" className="text-indigo-600">Sign Up</Link>
			</p>
		</div>
	);
};
