declare module "fast-json-parse" {
	export default function fastJSON<T>(json: string): { value: T; error: Error | null };
}
