import React, { useState } from "react";
import FormInput from "../components/FormInput.tsx";
import FormButton from "../components/FormButton.tsx";
import { Link } from "npm:react-router-dom";
import axios from "npm:axios";
import { useAuth } from "../providers/AuthProvider.tsx";

const SignUp = () => {
	const { login } = useAuth();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const response = await axios.post("http://localhost:3000/sign-up", {
			email,
			password,
		});

		const { accessToken, refreshToken } = response.data;
	};

	return (
		<div className="max-w-md p-6 bg-white shadow-md rounded-lg">
			<h1 className="text-xl font-semibold mb-6">Sign Up</h1>
			<form onSubmit={handleSignUp}>
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
				<FormButton text="Sign Up" type="submit" />
			</form>
			<p className="mt-4 text-sm">
				Already have an account? <Link to="/sign-in" className="text-indigo-600">Sign In</Link>
			</p>
		</div>
	);
};

export default SignUp;
