import React, { useState } from "react";
import FormInput from "../components/FormInput.tsx";
import FormButton from "../components/FormButton.tsx";
import { Link } from "npm:react-router-dom";
import axios from "npm:axios";
import { useAuthStore } from "../state/auth.ts";

const SignUp = () => {
	const { login, signup } = useAuthStore();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	return (
		<div className="max-w-md p-6 bg-white shadow-md rounded-lg">
			<h1 className="text-xl font-semibold mb-6">Sign Up</h1>
			<form onSubmit={() => signup(email, password)}>
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
