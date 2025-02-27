import { env } from "../env.ts";
import { PlatformError } from "../errors/platform.error.ts";
import { type FoodEntryBase, foodEntryBaseSchema } from "../db/FoodEntryService.ts";
import { z } from "zod";

const error_response_schema = z.object({
	error: z.literal("No food detected"),
});

type ErrorResponse = z.infer<typeof error_response_schema>;

export async function analyzeImage(image: string): Promise<FoodEntryBase | ErrorResponse> {
	const base64Data = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

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
							text: `
								Analyze this food image. Identify the food, portion size, estimate its calories.
								Err on the large and unhealthy side, as these are American food portions.
								Identify its main ingredients and their approximate calories.
								Format your response as JSON only, with no explanation.
								The JSON should have the format: {"name": "Food Name", "calories": 123, "ingredients": [{"name": "Ingredient 1", "calories": 100, "percentage": 45}, {"name": "Ingredient 2", "calories": 23, "percentage": 55}]}.
								If there is no food, just return: {"error": "No food detected"}.
							`.replaceAll(/\n\s{2,}/g, " ").replace(/^ /, ""),
						},
						{
							type: "image",
							source: {
								type: "base64",
								media_type: `image/jpeg`,
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

	const parsedJson = JSON.parse(jsonMatch[0]);

	// Validate response with the schema from FoodEntryService
	return foodEntryBaseSchema.or(error_response_schema).parse(parsedJson);
}
