import { z } from 'zod';

import {} from '~/routes/v1/hello/get';

export const ResponseErrorZod = z.object({
	statusCode: z.number(),
	message: z.string(), // todo this should be a { [key: string]: string }
});

export const ResponseZod = z.object({
	statusCode: z.number(),
});

export interface Response<Data> {
	statusCode: number;
	data: Data;
}

export type Middleware<InputZod, OutputZod> = (inputZod: InputZod, outputZod: OutputZod) => Promise<z.infer<typeof OutputZod>>;

export interface Everything<InputZod, OutputZod> {
	input: z.infer<typeof InputZod>;
	inputZod: z.ZodTypeAny;

	// middlewares:
	middlewares: Middleware<InputZod, OutputZod>[];

	output: z.infer<typeof OutputZod>;
	outputZod: z.ZodTypeAny;
}

export function assertIsValidResponse<T extends z.infer<typeof ResponseErrorZod>>(response: T): asserts response is T {
	ResponseErrorZod.parse(response);
}

export async function handleRouteRequest<InputZod, OutputZod>(everything: Everything<InputZod, OutputZod>): Promise<void> {
	const { input, inputZod, middlewares, outputZod, output } = everything;
	const validatedInput = inputZod.safeParse(input);
	if (!validatedInput.success) return console.debug('aww, validating the input was not a success');

	// for (const middleware of )
}

export class Route {
	middlewares: Middleware<z.infer<typeof InputZod>, z.infer<typeof OutputZod>>[] = [];
	constructor(inputMiddlewares: Middleware<z.infer<typeof InputZod>, z.infer<typeof OutputZod>>[]) {}

	runMiddlewares = async function () {};
}

const route = new Route([]);

// TESTS
// TESTS
// TESTS
// TESTS
// TESTS

async function exampleMiddleware(req: any, res: any) {}

const InputZod = z.object({
	name: z.string(),
});

const OutputZod = z.object({
	hash: z.string(),
});

(async () => {
	handleRouteRequest({
		input: { name: 'nou' }, // todo this type needs fixed
		inputZod: InputZod,

		middlewares: [],

		output: { hash: 'hiya' },
		outputZod: OutputZod,
	});
	// handleRouteRequest({
	// 	input: { name: 12 }, // todo this type needs fixed
	// 	inputZod: InputZod,

	// 	output: { hash: 'hiya' },
	// 	outputZod: OutputZod,
	// });
	process.exit(0);
})();
