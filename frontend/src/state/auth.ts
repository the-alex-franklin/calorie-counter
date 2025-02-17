import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import axios from "axios";

export const useAuthStore = create(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			refreshToken: null,
			login: async (email: string, password: string) => {
				const { data } = await axios.post("http://localhost:3000/sign-in", { email, password });

				z.object({
					accessToken: z.string(),
					refreshToken: z.string(),
				}).parse(data);

				const { accessToken, refreshToken } = data;

				const user = await axios.get("http://localhost:3000/me", {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
				set({ user, accessToken, refreshToken });
			},
			logout: () => set({ user: null, accessToken: null, refreshToken: null }),
		}),
		{ name: "auth-storage" }, // Saves to localStorage
	),
);
