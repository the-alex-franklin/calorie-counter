import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "./auth.ts";
import { z } from "zod";

// Base API configuration
const BASE_URL = "http://localhost:3000";

// Food entry type definitions
export const foodIngredientSchema = z.object({
	name: z.string(),
	calories: z.number(),
	percentage: z.number(),
});

export const foodEntrySchema = z.object({
	id: z.string(),
	name: z.string(),
	calories: z.number(),
	ingredients: z.array(foodIngredientSchema),
	timestamp: z.string().transform((str) => new Date(str)),
	imageUrl: z.string().optional(),
});

export type FoodIngredient = z.infer<typeof foodIngredientSchema>;
export type FoodEntry = z.infer<typeof foodEntrySchema>;
export type FoodAnalysis = Omit<FoodEntry, "id" | "timestamp">;

// Token refresh function
const refreshTokens = async (): Promise<boolean> => {
	try {
		const { refreshToken } = useAuthStore.getState();
		if (!refreshToken) return false;

		const response = await axios.post(`${BASE_URL}/token-refresh`, { refreshToken });
		const { accessToken, refreshToken: newRefreshToken } = z.object({
			accessToken: z.string(),
			refreshToken: z.string(),
		}).parse(response.data);

		// Update the auth store with new tokens
		const { user } = useAuthStore.getState();
		useAuthStore.setState({ user, accessToken, refreshToken: newRefreshToken });
		return true;
	} catch (error) {
		// If refresh fails, log the user out
		useAuthStore.getState().logout();
		return false;
	}
};

// Create an axios instance with auth
const getApiClient = (): AxiosInstance => {
	const { accessToken } = useAuthStore.getState();

	const api = axios.create({
		baseURL: BASE_URL,
		headers: {
			"Content-Type": "application/json",
		},
	});

	// Add auth token to requests if it exists
	if (accessToken) {
		api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
	}

	// Add response interceptor to handle token expiration
	api.interceptors.response.use(
		(response) => response,
		async (error: AxiosError) => {
			const originalRequest = error.config;

			// If the error is unauthorized and we haven't tried to refresh yet
			if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
				console.log("refreshing tokens");
				(originalRequest as any)._retry = true;

				// Try to refresh the token
				const refreshed = await refreshTokens();
				if (refreshed) {
					// Update the authorization header with the new token
					const { accessToken } = useAuthStore.getState();
					originalRequest.headers.Authorization = `Bearer ${accessToken}`;

					// Retry the original request
					return axios(originalRequest);
				}
			}

			return Promise.reject(error);
		},
	);

	return api;
};

export const foodApi = {
	// Analyze a food image and get nutritional information
	analyzeImage: async (imageData: string): Promise<FoodAnalysis> => {
		const api = getApiClient();
		const response = await api.post("/api/analyze", { image: imageData });
		return response.data;
	},

	// Save a food entry
	saveFoodEntry: async (foodData: FoodAnalysis): Promise<FoodEntry> => {
		const api = getApiClient();
		const response = await api.post("/api/food-entries", foodData);
		return foodEntrySchema.parse(response.data);
	},

	// Get all food entries
	getFoodEntries: async (): Promise<FoodEntry[]> => {
		const api = getApiClient();
		const response = await api.get("/api/food-entries");
		return z.array(foodEntrySchema).parse(response.data);
	},

	// Get food entries for a specific date
	getFoodEntriesByDate: async (date: Date): Promise<FoodEntry[]> => {
		const api = getApiClient();
		const dateString = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
		const response = await api.get(`/api/food-entries/date/${dateString}`);
		return z.array(foodEntrySchema).parse(response.data);
	},
};
