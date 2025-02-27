import { useEffect, useState } from "react";
import { FormInput } from "../../components/FormInput.tsx";
import { FormButton } from "../../components/FormButton.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../data-stores/auth.ts";
import { Capacitor } from "@capacitor/core";

const SignIn = () => {
	// Detect if we're on mobile platform
	const isMobile = Capacitor.isNativePlatform();
	const { login } = useAuthStore();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault(); // Prevent form submission
		e.stopPropagation(); // Stop propagation on mobile
		e.nativeEvent?.stopImmediatePropagation(); // Ensure no bubbling

		await handleLogin();
	};

	const handleLogin = async () => {
		if (isLoading) return;

		setIsLoading(true);
		setError(null);

		try {
			await login(email, password);
			// After successful login, explicitly navigate to dashboard with a delay
			// to ensure the state is properly updated
			setTimeout(() => {
				navigate("/dashboard", { replace: true });
			}, 100);
		} catch (err) {
			setError("Login failed. Please check your credentials and try again.");
			console.error("Login error:", err);
			setIsLoading(false);
		}
	};

	// Use useEffect to handle the case where user is already logged in
	useEffect(() => {
		// If user is already authenticated, redirect to dashboard
		if (useAuthStore.getState().isAuthenticated) {
			navigate("/dashboard", { replace: true });
		}
	}, [navigate]);

	// Handle input key events (for mobile)
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

			{isMobile
				? (
					// Mobile optimized form - no form tag to prevent refresh
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
				)
				: (
					// Web form with standard approach
					<form onSubmit={handleSubmit} action="#" noValidate>
						<FormInput
							label="Email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={isLoading}
							autoComplete="email"
						/>
						<FormInput
							label="Password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
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
					</form>
				)}

			<p className="mt-4 text-sm">
				Don't already have an account? <Link to="/sign-up" className="text-indigo-600">Sign Up</Link>
			</p>
		</div>
	);
};

export default SignIn;
