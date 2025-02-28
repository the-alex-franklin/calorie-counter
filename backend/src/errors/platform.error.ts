import { ContentfulStatusCode } from "hono/types/utils";

export class PlatformError extends Error {
	constructor(message: string, public code: ContentfulStatusCode = 500) {
		super(message);
		this.name = "PlatformError";
	}
}
