import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import axios from "axios";
import { env } from "../env.ts";
import { Try } from "fp-try";

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

	const { data: user_data } = await axios.get(`${env.API_URL}/me`, {
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
					`${env.API_URL}/sign-up`,
					email,
					password,
				);
				set({ user, accessToken, refreshToken, isAuthenticated: true });
			},
			login: async (email: string, password: string) => {
				const { user, accessToken, refreshToken } = await authenticateUser(
					`${env.API_URL}/sign-in`,
					email,
					password,
				);
				set({ user, accessToken, refreshToken, isAuthenticated: true });
			},
			refreshTokens: async () => {
				const refresh_result = await Try(async () => {
					const { refreshToken } = get();
					if (!refreshToken) return;

					const { data } = await axios.post(`${env.API_URL}/token-refresh`, { refreshToken });

					const tokens = z.object({
						accessToken: z.string(),
						refreshToken: z.string(),
					}).parse(data);

					set({ ...tokens, isAuthenticated: true });
				});

				if (refresh_result.failure) {
					get().logout();
					return false;
				}

				return true;
			},
			logout: () => {
				set({
					user: null,
					accessToken: null,
					refreshToken: null,
					isAuthenticated: false,
				});
				localStorage.removeItem("auth-storage");
			},
		}),
		{
			name: "auth-storage",

			onRehydrateStorage: () => (state) => {
				if (state && state.user && state.accessToken) {
					state.isAuthenticated = true;
				}
			},
		},
	),
);
