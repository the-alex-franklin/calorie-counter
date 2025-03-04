import { useEffect, useState } from "react";
import { FormInput } from "./components/FormInput.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../data-stores/auth.ts";

export const SignUp = () => {
	const { signup } = useAuthStore();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleSignUp = async () => {
		if (isLoading) return;

		setIsLoading(true);
		setError(null);

		signup(email, password)
			.catch((err) => setError(err.message))
			.finally(() => setIsLoading(false));
	};

	useEffect(() => {
		if (useAuthStore.getState().isAuthenticated) {
			navigate("/home", { replace: true });
		}
	}, [navigate]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSignUp();
		}
	};

	return (
		<div className="max-w-md text-black p-6 bg-white shadow-md rounded-lg">
			<h1 className="text-xl font-semibold mb-6">Sign Up</h1>
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
					autoComplete="new-password"
				/>
				<button onClick={handleSignUp} disabled={isLoading}>{isLoading ? "Signing Up..." : "Sign Up"}</button>
			</div>

			<p className="mt-4 text-sm">
				Already have an account? <Link to="/sign-in" className="text-indigo-600">Sign In</Link>
			</p>
		</div>
	);
};
