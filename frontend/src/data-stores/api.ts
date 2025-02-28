import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "./auth.ts";
import { z } from "zod";
import { env } from "../env.ts";
import { Try } from "fp-try";

export const foodIngredientSchema = z.object({
	name: z.string(),
	calories: z.number(),
	percentage: z.number(),
});

export const foodAnalysisSchema = z.object({
	name: z.string(),
	calories: z.number(),
	ingredients: z.array(foodIngredientSchema),
	imageUrl: z.string().optional(),
});

export const foodEntrySchema = foodAnalysisSchema.extend({
	id: z.string(),
	createdAt: z.string().transform((str) => new Date(str)),
});

export type FoodIngredient = z.infer<typeof foodIngredientSchema>;
export type FoodAnalysis = z.infer<typeof foodAnalysisSchema>;
export type FoodEntry = z.infer<typeof foodEntrySchema>;

const refreshTokens = async (): Promise<boolean> => {
	const refresh_result = await Try(async () => {
		const { refreshToken } = useAuthStore.getState();
		if (!refreshToken) throw new Error("No refresh token");

		const response = await axios.post(`${env.API_URL}/token-refresh`, { refreshToken });
		const { accessToken, refreshToken: newRefreshToken } = z.object({
			accessToken: z.string(),
			refreshToken: z.string(),
		}).parse(response.data);

		return { accessToken, refreshToken: newRefreshToken };
	});

	if (refresh_result.failure) {
		useAuthStore.getState().logout();
		return false;
	}

	const { accessToken, refreshToken } = refresh_result.data;
	const { user } = useAuthStore.getState();

	useAuthStore.setState({ user, accessToken, refreshToken });
	return true;
};

const getApiClient = (): AxiosInstance => {
	const { accessToken } = useAuthStore.getState();

	const api = axios.create({
		baseURL: env.API_URL,
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (accessToken) {
		api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
	}

	api.interceptors.response.use(
		(response) => response,
		async (error: AxiosError) => {
			const originalRequest = error.config;

			if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
				console.log("refreshing tokens");
				(originalRequest as any)._retry = true;

				const refreshed = await refreshTokens();
				if (refreshed) {
					const { accessToken } = useAuthStore.getState();
					originalRequest.headers.Authorization = `Bearer ${accessToken}`;

					return axios(originalRequest);
				}
			}

			return Promise.reject(error);
		},
	);

	return api;
};

export const foodApi = {
	analyzeImage: async (imageData: string): Promise<FoodAnalysis> => {
		const api = getApiClient();
		const response = await api.post("/api/analyze", { image: imageData });
		return foodAnalysisSchema.parse(response.data);
	},

	saveFoodEntry: async (foodData: FoodAnalysis): Promise<FoodEntry> => {
		const api = getApiClient();
		const response = await api.post("/api/food-entries", foodData);
		console.log(response.data);
		return foodEntrySchema.parse(response.data);
	},

	getTodayFoodEntries: async (): Promise<FoodEntry[]> => {
		const api = getApiClient();
		const response = await api.get("/api/todays-food-entries");
		return foodEntrySchema.array().parse(response.data);
	},

	getPreviousFoodEntries: async (): Promise<FoodEntry[]> => {
		const api = getApiClient();
		const response = await api.get("/api/previous-food-entries");
		return foodEntrySchema.array().parse(response.data);
	},
};
