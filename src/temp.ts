export {};
import { z } from 'zod';

const route = buildRoute({
	// method: automatically determined
	// path: automatically determined
	inputZod: z.object({
		name: z.string(),
	}), 
	outputZod: z.object({
		hash: z.string(),
	}),
	responseZod: z.object({
		responseThing: z.string(),
	}),
	func: (input) => {
		console.log(input);
		return { hash: '69' };
	},
});

function buildRoute<InputZod extends z.ZodTypeAny, OutputZod extends z.ZodTypeAny>(input: { inputZod: InputZod; outputZod: OutputZod; func: (input: z.infer<InputZod>) => z.infer<OutputZod> }) {
	return input;
}

function other(increaseValue: () => void) {
	increaseValue();
}

function main() {
	let value = 0;
	function increaseValue() {
		value++;
		console.log(value);
	}

	other(increaseValue);
}
main(); // 1
main(); // 1

process.exit(0);
