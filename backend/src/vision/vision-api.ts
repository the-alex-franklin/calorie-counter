import { env } from "../env.ts";
import { PlatformError } from "../errors/platform.error.ts";
import { type FoodEntryWrite, foodEntryWriteSchema } from "../db/FoodEntryService.ts";
import { z } from "zod";
import { Try } from "fp-try";

export async function analyzeImage(image: string): Promise<FoodEntryWrite> {
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
								The JSON should have this format without line returns: {"name": "Food Name", "calories": 123, "ingredients": [{"name": "Ingredient 1", "calories": 100, "percentage": 45}, {"name": "Ingredient 2", "calories": 23, "percentage": 55}]}.
								If there is no food, just return: {"error": "No food detected"}.
							`.replaceAll(/\n\s{2,}/g, " ").replace(/^ /, ""),
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

	if (!response.ok) throw new PlatformError("Failed to analyze image", 500);

	const json = await response.json();

	const parseResult = Try(() => foodEntryWriteSchema.parse(JSON.parse(json.content[0]?.text)));
	if (parseResult.success) return parseResult.data;

	throw new PlatformError("No Food Detected", 400);
}
