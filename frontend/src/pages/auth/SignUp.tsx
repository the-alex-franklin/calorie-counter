import { useState } from "react";
import { FormInput } from "../../components/FormInput.tsx";
import { FormButton } from "../../components/FormButton.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../data-stores/auth.ts";

const SignUp = () => {
	const { signup } = useAuthStore();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await signup(email, password);
			// After successful signup, explicitly navigate to dashboard with a delay
			// to ensure the state is properly updated
			setTimeout(() => {
				navigate("/dashboard", { replace: true });
			}, 100);
		} catch (err) {
			setError("Sign up failed. Please try a different email or try again later.");
			console.error("Signup error:", err);
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-md p-6 bg-white shadow-md rounded-lg">
			<h1 className="text-xl font-semibold mb-6">Sign Up</h1>
			{error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
			<form onSubmit={handleSubmit}>
				<FormInput
					label="Email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					disabled={isLoading}
				/>
				<FormInput
					label="Password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					disabled={isLoading}
				/>
				<FormButton
					text={isLoading ? "Signing Up..." : "Sign Up"}
					type="submit"
					disabled={isLoading}
				/>
			</form>
			<p className="mt-4 text-sm">
				Already have an account? <Link to="/sign-in" className="text-indigo-600">Sign In</Link>
			</p>
		</div>
	);
};

export default SignUp;
