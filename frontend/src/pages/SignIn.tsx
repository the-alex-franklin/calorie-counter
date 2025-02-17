import React, { useState } from "react";
import FormInput from "../components/FormInput.tsx";
import FormButton from "../components/FormButton.tsx";
import { Link } from "npm:react-router-dom";
import { useAuthStore } from "../state/auth.ts";

const SignIn = () => {
	const { login, logout } = useAuthStore();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
		await login(email, password);
	};

	return (
		<div className="max-w-md p-6 bg-white shadow-md rounded-lg">
			<h1 className="text-xl font-semibold mb-6">Sign In</h1>
			<form onSubmit={handleSignIn}>
				<FormInput
					label="Email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<FormInput
					label="Password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<FormButton text="Sign In" type="submit" />
			</form>
			<p className="mt-4 text-sm">
				Don't already have an account? <Link to="/sign-up" className="text-indigo-600">Sign Up</Link>
			</p>
		</div>
	);
};

export default SignIn;
