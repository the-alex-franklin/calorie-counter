import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import axios from "axios";

type User = {
	id: string;
	email: string;
	role: "admin" | "user";
};

type AuthState = {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	signup: (email: string, password: string) => Promise<void>;
	login: (email: string, password: string) => Promise<void>;
	refreshTokens: () => Promise<boolean>;
	logout: () => void;
};

const authenticateUser = async (url: string, email: string, password: string) => {
	const { data: token_data } = await axios.post(url, { email, password });

	const { accessToken, refreshToken } = z.object({
		accessToken: z.string(),
		refreshToken: z.string(),
	}).parse(token_data);

	const { data: user_data } = await axios.get("http://localhost:3000/me", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const user = z.object({
		id: z.string(),
		email: z.string(),
		role: z.enum(["admin", "user"]),
	}).parse(user_data);

	return { user, accessToken, refreshToken };
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			accessToken: null,
			refreshToken: null,
			isAuthenticated: false,
			signup: async (email: string, password: string) => {
				const { user, accessToken, refreshToken } = await authenticateUser(
					"http://localhost:3000/sign-up",
					email,
					password,
				);
				set({ user, accessToken, refreshToken, isAuthenticated: true });
			},
			login: async (email: string, password: string) => {
				const { user, accessToken, refreshToken } = await authenticateUser(
					"http://localhost:3000/sign-in",
					email,
					password,
				);
				set({ user, accessToken, refreshToken, isAuthenticated: true });
			},
			refreshTokens: async () => {
				try {
					const { refreshToken, user } = get();
					if (!refreshToken) return false;

					const { data } = await axios.post("http://localhost:3000/token-refresh", { refreshToken });
					
					const tokens = z.object({
						accessToken: z.string(),
						refreshToken: z.string(),
					}).parse(data);
					
					set({ ...tokens, user, isAuthenticated: true });
					return true;
				} catch (error) {
					// If refresh fails, log out
					get().logout();
					return false;
				}
			},
			logout: () => {
				set({
					user: null,
					accessToken: null,
					refreshToken: null,
					isAuthenticated: false
				});
				localStorage.removeItem("auth-storage");
			},
		}),
		{ 
			name: "auth-storage",
			// Add a state hydration handler to correctly set isAuthenticated
			onRehydrateStorage: () => (state) => {
				if (state && state.user && state.accessToken) {
					state.isAuthenticated = true;
				}
			}
		},
	),
);