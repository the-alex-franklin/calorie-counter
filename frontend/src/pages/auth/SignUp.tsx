import { useEffect, useState } from "react";
import { FormInput } from "../../components/FormInput.tsx";
import { FormButton } from "../../components/FormButton.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../data-stores/auth.ts";
import { Capacitor } from "@capacitor/core";
import { Try } from "fp-try";

const SignUp = () => {
	const isMobile = Capacitor.isNativePlatform();
	const { signup } = useAuthStore();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.nativeEvent) {
			e.nativeEvent.stopImmediatePropagation();
		}
		await handleSignUp();
	};

	const handleSignUp = async () => {
		if (isLoading) return;

		setIsLoading(true);
		setError(null);

		const signup_result = await Try(() => signup(email, password));
		if (signup_result.failure) setIsLoading(false);
	};

	useEffect(() => {
		if (useAuthStore.getState().isAuthenticated) {
			navigate("/dashboard", { replace: true });
		}
	}, [navigate]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSignUp();
		}
	};

	return (
		<div className="max-w-md p-6 bg-white shadow-md rounded-lg">
			<h1 className="text-xl font-semibold mb-6">Sign Up</h1>
			{error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

			{isMobile
				? (
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
							autoComplete="new-password"
						/>
						<FormButton
							text={isLoading ? "Signing Up..." : "Sign Up"}
							type="button"
							onClick={handleSignUp}
							disabled={isLoading}
						/>
					</div>
				)
				: (
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
							autoComplete="new-password"
						/>
						<FormButton
							text={isLoading ? "Signing Up..." : "Sign Up"}
							type="button"
							onClick={handleSignUp}
							disabled={isLoading}
						/>
					</form>
				)}

			<p className="mt-4 text-sm">
				Already have an account? <Link to="/sign-in" className="text-indigo-600">Sign In</Link>
			</p>
		</div>
	);
};

export default SignUp;
