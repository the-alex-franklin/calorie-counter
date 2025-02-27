import { env } from "../env.ts";
import { PlatformError } from "../errors/platform.error.ts";

// Define the types here to avoid import issues
export interface FoodIngredient {
  name: string;
  calories: number;
  percentage: number;
}

export interface FoodEntryCreate {
  name: string;
  calories: number;
  ingredients: FoodIngredient[];
  imageUrl?: string;
}

// Interface for vision API response
export interface FoodAnalysisResult {
	name: string;
	calories: number;
	ingredients: FoodIngredient[];
}

export function analyzeImage(imageBase64: string): Promise<FoodEntryCreate> {
	if (env.ANTHROPIC_API_KEY) {
		return analyzeWithClaude(imageBase64);
	} else if (env.OPENAI_API_KEY) {
		return analyzeWithOpenAI(imageBase64);
	} else {
		throw new PlatformError("No vision API key configured", 500);
	}
}

async function analyzeWithClaude(imageBase64: string): Promise<FoodEntryCreate> {
	try {
		const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

		const response = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": env.ANTHROPIC_API_KEY,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: "claude-3-5-sonnet-20240620",
				max_tokens: 1024,
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text:
									'Analyze this food image. Identify what the food is, estimate its calories, and identify its main ingredients along with their approximate calories and percentage of the total. Format your response as JSON only, with no explanation. The JSON should have the format: {"name": "Food Name", "calories": 123, "ingredients": [{"name": "Ingredient 1", "calories": 100, "percentage": 45}, {"name": "Ingredient 2", "calories": 23, "percentage": 55}]}',
							},
							{
								type: "image",
								source: {
									type: "base64",
									media_type: "image/jpeg",
									data: base64Data,
								},
							},
						],
					},
				],
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error("Claude API error:", errorData);
			throw new PlatformError("Failed to analyze image with Claude", 500);
		}

		const data = await response.json();
		const content = data.content[0].text;

		// Extract JSON from the response
		const jsonMatch = content.match(/\{[\s\S]*\}/);

		if (!jsonMatch) {
			throw new PlatformError("Failed to extract food analysis from Claude response", 500);
		}

		const foodAnalysis = JSON.parse(jsonMatch[0]);

		return {
			name: foodAnalysis.name,
			calories: foodAnalysis.calories,
			ingredients: foodAnalysis.ingredients,
		};
	} catch (error) {
		console.error("Error analyzing image with Claude:", error);
		throw new PlatformError("Failed to analyze image with Claude", 500);
	}
}

async function analyzeWithOpenAI(imageBase64: string): Promise<FoodEntryCreate> {
	try {
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${env.OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-4-vision-preview",
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text:
									'Analyze this food image. Identify what the food is, estimate its calories, and identify its main ingredients along with their approximate calories and percentage of the total. Format your response as JSON only, with no explanation. The JSON should have the format: {"name": "Food Name", "calories": 123, "ingredients": [{"name": "Ingredient 1", "calories": 100, "percentage": 45}, {"name": "Ingredient 2", "calories": 23, "percentage": 55}]}',
							},
							{
								type: "image_url",
								image_url: {
									url: `data:image/jpeg;base64,${imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")}`,
								},
							},
						],
					},
				],
				max_tokens: 1000,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error("OpenAI API error:", errorData);
			throw new PlatformError("Failed to analyze image with OpenAI", 500);
		}

		const data = await response.json();
		const content = data.choices[0].message.content;

		// Extract JSON from the response
		const jsonMatch = content.match(/\{[\s\S]*\}/);

		if (!jsonMatch) {
			throw new PlatformError("Failed to extract food analysis from OpenAI response", 500);
		}

		const foodAnalysis = JSON.parse(jsonMatch[0]);

		return {
			name: foodAnalysis.name,
			calories: foodAnalysis.calories,
			ingredients: foodAnalysis.ingredients,
		};
	} catch (error) {
		console.error("Error analyzing image with OpenAI:", error);
		throw new PlatformError("Failed to analyze image with OpenAI", 500);
	}
}
