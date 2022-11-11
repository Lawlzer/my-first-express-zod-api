import { z } from 'zod';

import { Middleware } from '~/generics';

const GetUserInputZod = z.object({
	name: z.string(),
});

const GetUserOutputZod = z.object({
	name: z.string(),
	password: z.string(),
});

export async function GetUserFunction(input: z.infer<typeof GetUserInputZod>): Promise<z.infer<typeof GetUserOutputZod>> {
	input;
	return { name: 'nou', password: '123' };
}

export const middlewareGetUser: Middleware<typeof GetUserInputZod, typeof GetUserOutputZod> = {
	inputZod: GetUserInputZod,
	outputZod: GetUserOutputZod,
	responses: [],

	func: GetUserFunction,
};
