// @deno-types="@types/react"
import React, { createContext, useContext, useState } from "react";

type AuthContextType = {
	authed: boolean;
	login: () => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type Props = {
	children?: React.ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
	const [authed, setAuthed] = useState(false);

	const login = () => setAuthed(true);
	const logout = () => setAuthed(false);

	return (
		<AuthContext.Provider value={{ authed, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within an AuthProvider");
	return context;
};
