import chalk from "chalk";

export async function perf(name: string, fn: () => Response | Promise<Response>) {
	const start = performance.now();
	const result = await fn();
	const end = performance.now();
	console.log(`${name}: ` + chalk.yellow(`${Number((end - start).toFixed(6))}ms`));
	return result;
}
